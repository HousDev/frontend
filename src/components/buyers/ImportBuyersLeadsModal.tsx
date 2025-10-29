// src/pages/dashboard/components/ImportBuyersModal.tsx
import React, { useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import * as XLSXRaw from "xlsx-js-style";
import { usersAPI } from "@/lib/api";
import { buyerAPI } from "@/lib/buyerAPI";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";
import { Upload, X, Download, CheckCircle, FileWarning } from "lucide-react";

const XLSX = XLSXRaw as any;

/* ============================ Types ============================ */
type RawRow = Record<string, any>;

type SkippedRow = {
  row: number;
  reason: string;
  data: RawRow;
  errors?: string[];
};

type UpdatedRow = {
  row?: number;
  id?: string | number;
  note?: string;
  data: RawRow;
  assigned_executive?: string | number;
};

type DuplicateRow = {
  row?: number;
  reason: string;
  data: RawRow;
  duplicateFields?: string[];
  existingId?: string | number;
};

type SummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  duplicates: DuplicateRow[];
  skippedRows: SkippedRow[];
  updatedRows: UpdatedRow[];
};

type ImportBuyersModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Executive = {
  id: string | number;
  name: string;
  email?: string;
  username?: string;
};

type AssignmentMode = "none" | "selected";

/* ======================= Utility / Helpers ===================== */

// Cheap, safe role detectors
const getRoleString = (u: any): string => {
  const r =
    u?.role ||
    u?.roles ||
    u?.raw?.role ||
    u?.raw?.roles ||
    u?.user?.role ||
    u?.user?.roles ||
    "";
  return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
};

const isExecutiveUser = (u: any): boolean => {
  const rs = getRoleString(u);
  return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
};

// Phone number normalization
const toCanonicalPhone = (raw: any): { display: string; key: string } => {
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { display: "", key: "" };
  }
  let phoneStr = String(raw).trim();

  // Handle scientific notation
  if (/e\+\d+$/i.test(phoneStr)) {
    const n = Number(phoneStr);
    if (!isNaN(n)) phoneStr = Math.round(n).toString();
  }

  // Strip everything except digits and +
  phoneStr = phoneStr.replace(/[^\d+]/g, "");
  phoneStr = phoneStr.replace(/^0+/, "");

  const justDigits = phoneStr.replace(/[^\d]/g, "");
  // India-friendly
  if (/^\+?91\d{10}$/.test(phoneStr) || /^91\d{10}$/.test(phoneStr) || /^\d{10}$/.test(justDigits)) {
    const last10 = justDigits.slice(-10);
    return { display: `+91${last10}`, key: last10 };
  }
  // Fallback
  return { display: phoneStr.startsWith("+") ? phoneStr : `+${phoneStr}`, key: justDigits };
};

const safeJsonParse = (v: any) => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "object") return v;

  let s = String(v).trim();
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/\\"/g, '"').replace(/\\'/g, "'");

  try {
    return JSON.parse(s);
  } catch {
    if (s.includes(",") && !s.includes("{") && !s.includes("[")) {
      return s.split(",").map((p: string) => p.trim()).filter(Boolean);
    }
    return s;
  }
};

const toNumber = (v: any): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const cleaned = String(v).replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && !isNaN(n) ? n : undefined;
};

const toBoolean = (v: any): boolean | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const str = String(v).toLowerCase().trim();
  if (str === "true" || str === "yes" || str === "1") return true;
  if (str === "false" || str === "no" || str === "0") return false;
  return undefined;
};

const ensureArray = (v: any): string[] => {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) return v.map((item) => String(item).trim()).filter(Boolean);
  if (typeof v === "string") {
    return v
      .split(/[|,]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  return [String(v).trim()];
};

const ensureString = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  return String(v).trim();
};
const renderCell = (v: any) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.length ? v.join(", ") : "";
  if (typeof v === "object") {
    // stringify compactly; adjust if you prefer pretty-print
    try { return JSON.stringify(v); } catch { return "[object]"; }
  }
  try { return String(v); } catch { return ""; }
};
/* ========================== Summary Modal ========================== */

function SummaryModal({
  isOpen,
  onClose,
  title = "Import Summary",
  duplicates,
  skippedRows,
  updatedRows,
}: SummaryModalProps) {
  if (!isOpen) return null;

  const keySet = new Set<string>();
  [...duplicates.map((r) => r.data), ...skippedRows.map((r) => r.data), ...updatedRows.map((r) => r.data)].forEach(
    (row) => {
      Object.entries(row || {}).forEach(([k, v]) => {
        if (v !== null && v !== undefined && String(v).trim() !== "") keySet.add(k);
      });
    }
  );
  const allKeys = Array.from(keySet);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="max-w-6xl">
      <div className="p-4 space-y-6">
        <div className="text-sm text-gray-700 flex flex-wrap gap-4">
          <span>
            Duplicates: <span className="font-semibold">{duplicates.length}</span>
          </span>
          <span>
            Skipped: <span className="font-semibold">{skippedRows.length}</span>
          </span>
          {updatedRows.length > 0 && (
            <span>
              Updated: <span className="font-semibold">{updatedRows.length}</span>
            </span>
          )}
        </div>

        {duplicates.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-purple-700 mb-2">Duplicates (in file or CRM)</h4>
            <div className="max-h-[260px] overflow-auto border rounded-lg">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-purple-50 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1">Row</th>
                    <th className="border px-2 py-1">Duplicate Fields</th>
                    <th className="border px-2 py-1">Existing ID</th>
                    <th className="border px-2 py-1">Reason</th>
                    {allKeys.map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/30">
                      <td className="border px-2 py-1 text-center">{row.row ?? "-"}</td>
                      <td className="border px-2 py-1">
                        {row.duplicateFields && row.duplicateFields.length > 0
                          ? row.duplicateFields.join(", ")
                          : "-"}
                      </td>
                      <td className="border px-2 py-1 text-center">{row.existingId ?? "-"}</td>
                      <td className="border px-2 py-1 text-purple-700">{row.reason}</td>
                      {allKeys.map((key) => (
                       <td key={key} className="border px-2 py-1">
                           {renderCell(row.data?.[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {skippedRows.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-2">Skipped (non-duplicate issues)</h4>
            <div className="max-h-[240px] overflow-auto border rounded-lg">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-red-50 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1">Row</th>
                    <th className="border px-2 py-1">Reason</th>
                    {allKeys.map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skippedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-red-50/30">
                      <td className="border px-2 py-1 text-center">{row.row}</td>
                      <td className="border px-2 py-1 text-red-600">
                        {row.reason}
                      </td>
                      {allKeys.map((key) => (
                        <td key={key} className="border px-2 py-1">
                          {renderCell(row.data?.[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {updatedRows.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2">Updated (existing in CRM)</h4>
            <div className="max-h-[240px] overflow-auto border rounded-lg">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-green-50 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1">Row</th>
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Note</th>
                    {allKeys.map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {updatedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-green-50/30">
                      <td className="border px-2 py-1 text-center">{row.row ?? "-"}</td>
                      <td className="border px-2 py-1 text-center">{row.id ?? "-"}</td>
                      <td className="border px-2 py-1 text-green-700">{row.note || "Updated"}</td>
                      {allKeys.map((key) => (
                        <td key={key} className="border px-2 py-1">
                          {renderCell(row.data?.[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Excel serial (e.g. 45235) or string ("1990-05-20", "20/05/1990") -> "YYYY-MM-DD"
const toISODate = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;

  // If number: might be an Excel serial
  if (typeof v === "number" && Number.isFinite(v)) {
    // Excel serial date: days since 1899-12-30
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = v * 86400000; // days -> ms
    const d = new Date(excelEpoch.getTime() + ms);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  // If string: try a few common formats
  const s = String(v).trim();
  if (!s) return undefined;

  // Normalize separators
  const t = s.replace(/\./g, "/").replace(/-/g, "/");

  // Try YYYY/MM/DD
  let m = t.match(/^(\d{4})[\/](\d{1,2})[\/](\d{1,2})$/);
  if (m) {
    const yyyy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${yyyy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
    }
  }

  // Try DD/MM/YYYY
  m = t.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/);
  if (m) {
    const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${yyyy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
    }
  }

  // Fallback: native Date.parse (best-effort)
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return undefined;
};

/* ====================== Template Download (xlsx) ====================== */

const downloadBuyerTemplate = () => {
  const data = [
    [
      "Salutation",
      "Name",
      "Phone",
      "Email",
       "DOB",
      "Whatsapp_Number",
      "State",
      "City",
      "Location",
      "Buyer_Lead_Source",
      "Buyer_Lead_Priority",
      "Buyer_Lead_Stage",
      "Buyer_Lead_Status",
      "BudgetMin",
      "BudgetMax",
      "PropertyType",
      "UnitTypes",
      "PreferredLocations",
      "Furnishing",
      "Possession",
      "Facing",
      "Floor",
    ],
    [
      "Mr",
      "Rahul Sharma",
      "9876543210",
      "rahul.sharma@gmail.com",
      "1990-05-20",   
      "9876543210",
      "Maharashtra",
      "Mumbai",
      "Bandra",
      "Website",
      "Medium",
      "New",
      "Active",
      "20000000",
      "25000000",
      "Residential",
      "2BHK,3BHK",
      "Bandra,Andheri",
      "Semi Furnished",
      "Ready to Move",
      "East",
      "5",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  const mandatoryCols = [0, 1, 2]; // Salutation, Name, Phone
  mandatoryCols.forEach((c: number) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) return;
    (ws as any)[addr].s = {
      font: { color: { rgb: "FF0000" }, bold: true },
      alignment: { horizontal: "center", vertical: "center" },
    };
  });

  for (let c = 3; c < data[0].length; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr])
      (ws as any)[addr].s = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } };
  }

  for (let r = 1; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (ws[addr]) (ws as any)[addr].s = { alignment: { horizontal: "left", vertical: "center" } };
    }
  }

 (ws as any)["!cols"] = [
    12, 16, 15, 24, 14,  16, 12, 12, 16, 16, 16, 16, 16, 12, 12, 16, 16, 16, 16, 16, 12, 12,
  ].map((width) => ({ width })); // 

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Buyers Template");
  XLSX.writeFile(wb, "Buyers_Import_Template.xlsx");
};



/* ============================== Component ============================== */

export default function ImportBuyersModal({ isOpen, onClose }: ImportBuyersModalProps) {
  const { user } = useAuth() as any;

  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [updatedRows, setUpdatedRows] = useState<UpdatedRow[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const [execsLoading, setExecsLoading] = useState<boolean>(false);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
  const [execSearch, setExecSearch] = useState<string>("");
  const [selectedExecIds, setSelectedExecIds] = useState<Set<string | number>>(new Set());
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("none");

  const onlyThisExecutive = isExecutiveUser(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setExecDropdownOpen(false);
    }
    if (execDropdownOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [execDropdownOpen]);

  // inside component
const getCreatorId = () =>
  user?.id || user?.userId || user?._id || user?.raw?.id 

  // Load executives
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setExecsLoading(true);

        const formatName = (u: any) => {
          const salutation = u?.salutation ? `${u.salutation} ` : "";
          const firstName = u?.first_name || "";
          const lastName = u?.last_name || "";
          const usernameFallback = u?.username || u?.email || "Executive";
          const name = `${salutation}${firstName} ${lastName}`.trim();
          return name || usernameFallback;
        };

        if (onlyThisExecutive) {
          const selfId =
            user?.id ||
            user?.userId ||
            user?._id ||
            user?.uuid ||
            user?.raw?.id ||
            String(user?.email || user?.username || "me");
          const selfName = formatName(user);

          const me: Executive = { id: selfId, name: selfName, email: user?.email, username: user?.username };
          setExecutives([me]);
          setSelectedExecIds(new Set([selfId]));
          setAssignmentMode("selected");
          return;
        }

        const get = async (department: string) =>
          usersAPI.getByDeptRole?.({ department, role: "executive", is_active: 1, limit: 100 });

        let res: any;
        try {
          res = await get("presales");
        } catch {
          res = await get("pre-sales");
        }

        const salesUsers = (res?.items ?? res?.data ?? res ?? []).map((u: any) => ({
          ...u,
          id: u.id ?? u.userId ?? u._id ?? u.uuid ?? String(u.email || u.username || Math.random()),
          name: formatName(u),
        }));

        const allowed = getAssignableExecutives(user, salesUsers) || [];
        const mapped: Executive[] = allowed.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.raw?.username || u.username,
        }));

        setExecutives(mapped);
      } catch (e) {
        console.error(e);
        toast.error("Could not fetch executives");
      } finally {
        setExecsLoading(false);
      }
    })();
  }, [isOpen, user, onlyThisExecutive]);

  const filteredExecutives = useMemo(() => {
    if (!execSearch.trim()) return executives;
    const s = execSearch.toLowerCase();
    return executives.filter(
      (e) =>
        String(e.name || "").toLowerCase().includes(s) ||
        String(e.email || "").toLowerCase().includes(s) ||
        String(e.username || "").toLowerCase().includes(s)
    );
  }, [execSearch, executives]);

  const toggleExec = (id: string | number) => {
    setSelectedExecIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAllExecs = () => setSelectedExecIds(new Set(executives.map((e) => e.id)));
  const clearExecs = () => setSelectedExecIds(new Set());

  const isDuplicateReason = (reason: string) => /duplicate/i.test(reason || "");
  const guessDuplicateFields = (reason: string, data: RawRow): string[] => {
    const fields: string[] = [];
    const lower = (reason || "").toLowerCase();
    if (lower.includes("phone")) fields.push("phone");
    if (lower.includes("email")) fields.push("email");
    if (fields.length === 0) {
      if (data["Phone*"] || data["phone"] || data["Phone"]) fields.push("phone");
      if (data["Email"] || data["email"]) fields.push("email");
    }
    return Array.from(new Set(fields));
  };

  /* ---------- Buyer Data Normalization ---------- */
  const normalizeBuyerRow = (row: any, _rowIndex: number) => {
    const normalized: Record<string, any> = {};

    // Normalize keys
    Object.keys(row || {}).forEach((k) => {
      if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
        normalized[String(k).trim().toLowerCase()] = row[k];
      }
    });

    // Budget field mapping (optional)
    const budgetMinCandidates = [
      "budgetmin",
      "budget_min",
      "budget min",
      "budget_minimum",
      "minbudget",
      "budgetmin_inr",
      "min_budget",
    ];
    const budgetMaxCandidates = [
      "budgetmax",
      "budget_max",
      "budget max",
      "budget_maximum",
      "maxbudget",
      "budgetmax_inr",
      "max_budget",
    ];

    let budgetMin: number | undefined;
    let budgetMax: number | undefined;

    for (const k of budgetMinCandidates) {
      if (normalized[k] !== undefined) {
        budgetMin = toNumber(normalized[k]);
        break;
      }
    }

    for (const k of budgetMaxCandidates) {
      if (normalized[k] !== undefined) {
        budgetMax = toNumber(normalized[k]);
        break;
      }
    }

    // Fallback to general budget columns (optional)
    if (budgetMin === undefined && budgetMax === undefined) {
      const possible = Object.keys(normalized).filter((k) => /budget|amount/i.test(k));
      for (const k of possible) {
        const val = toNumber(normalized[k]);
        if (val !== undefined) {
          if (budgetMin === undefined) budgetMin = val;
          else if (budgetMax === undefined) budgetMax = val;
        }
      }
    }

    // Ensure min < max
    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      [budgetMin, budgetMax] = [budgetMax, budgetMin];
    }

    // Parse complex fields
    const requirementsParsed = safeJsonParse(
      normalized["requirements"] ?? normalized["requirement"] ?? normalized["propertyrequirements"]
    );

    const financialsParsed = safeJsonParse(normalized["financials"] ?? normalized["finance"] ?? normalized["financial"]);

    // Build buyer object
    const buyer: any = {
      salutation: ensureString(normalized["salutation"]),
      name: ensureString(normalized["name"] ?? normalized["full name"] ?? normalized["fullname"]),
      phone: ensureString(normalized["phone"] ?? normalized["mobile"] ?? normalized["contact"] ?? normalized["contact number"]),
      whatsapp_number: ensureString(normalized["whatsapp_number"] ?? normalized["whatsapp"] ?? normalized["whatsapp no"]),
       dob: toISODate(        // 👈 NEW
    normalized["dob"] ??
    normalized["date_of_birth"] ??
    normalized["date of birth"]
  ),
      email: ensureString(normalized["email"] ?? normalized["email address"]),
      state: ensureString(normalized["state"]),
      city: ensureString(normalized["city"]),
      location: ensureString(normalized["location"] ?? normalized["area"] ?? normalized["preferred location"]),
      buyer_lead_priority: ensureString(
        normalized["buyer_lead_priority"] ?? normalized["priority"] ?? normalized["lead_priority"]
      ),
      buyer_lead_source: ensureString(
        normalized["buyer_lead_source"] ?? normalized["source"] ?? normalized["lead_source"]
      ),
      buyer_lead_stage: ensureString(normalized["buyer_lead_stage"] ?? normalized["stage"] ?? normalized["lead_stage"]),
      buyer_lead_status: ensureString(
        normalized["buyer_lead_status"] ?? normalized["status"] ?? normalized["lead_status"]
      ),
      budget_min: budgetMin,
      budget_max: budgetMax,

      requirements: (() => {
        if (requirementsParsed && typeof requirementsParsed === "object") {
          return {
            propertyType:
              requirementsParsed.propertyType ||
              ensureString(normalized["propertytype"] ?? normalized["property_type"] ?? normalized["property type"]),
            property_subtype:
              requirementsParsed.property_subtype ||
              ensureString(normalized["propertysubtype"] ?? normalized["property_subtype"] ?? normalized["property subtype"]),
            unitTypes: Array.isArray(requirementsParsed.unitTypes)
              ? requirementsParsed.unitTypes
              : ensureArray(normalized["unittype"] ?? normalized["unit_type"] ?? normalized["unittypes"] ?? normalized["unit types"]),
            preferredLocations: Array.isArray(requirementsParsed.preferredLocations)
              ? requirementsParsed.preferredLocations
              : ensureArray(normalized["preferredlocations"] ?? normalized["preferred_locations"] ?? normalized["preferred locations"]),
            furnishing: requirementsParsed.furnishing || ensureString(normalized["furnishing"]),
            possession: requirementsParsed.possession || ensureString(normalized["possession"]),
            facing: requirementsParsed.facing || ensureString(normalized["facing"]),
            floor: requirementsParsed.floor || ensureString(normalized["floor"]),
            amenities: Array.isArray(requirementsParsed.amenities)
              ? requirementsParsed.amenities
              : ensureArray(normalized["amenities"]),
            nearbylocations: Array.isArray(requirementsParsed.nearbylocations)
              ? requirementsParsed.nearbylocations
              : ensureArray(normalized["nearbylocations"] ?? normalized["nearby_locations"]),
            specialRequirements:
              requirementsParsed.specialRequirements ||
              ensureString(normalized["specialrequirements"] ?? normalized["special_requirements"]),
          };
        }

        // Build from individual columns
        return {
          propertyType: ensureString(normalized["propertytype"] ?? normalized["property_type"] ?? normalized["property type"]),
          property_subtype: ensureString(
            normalized["propertysubtype"] ?? normalized["property_subtype"] ?? normalized["property subtype"]
          ),
          unitTypes: ensureArray(normalized["unittype"] ?? normalized["unit_type"] ?? normalized["unittypes"] ?? normalized["unit types"]),
          preferredLocations: ensureArray(
            normalized["preferredlocations"] ?? normalized["preferred_locations"] ?? normalized["preferred locations"]
          ),
          furnishing: ensureString(normalized["furnishing"] ?? normalized["furnishing_type"]),
          possession: ensureString(normalized["possession"] ?? normalized["possession_type"]),
          facing: ensureString(normalized["facing"]),
          floor: ensureString(normalized["floor"]),
          amenities: ensureArray(normalized["amenities"] ?? normalized["amenity"]),
          nearbylocations: ensureArray(normalized["nearbylocations"] ?? normalized["nearby_locations"]),
          specialRequirements: ensureString(normalized["specialrequirements"] ?? normalized["special_requirements"]),
        };
      })(),

      financials: (() => {
        if (financialsParsed && typeof financialsParsed === "object") return financialsParsed;
        const f: any = {};
        if (normalized["loanamount"] !== undefined) f.loanAmount = toNumber(normalized["loanamount"]);
        if (normalized["loan_status"] !== undefined || normalized["loanstatus"] !== undefined) {
          f.loanStatus = ensureString(normalized["loan_status"] ?? normalized["loanstatus"]);
        }
        if (normalized["creditscore"] !== undefined) f.creditScore = toNumber(normalized["creditscore"]);
        if (normalized["downpayment"] !== undefined) f.downPayment = toNumber(normalized["downpayment"]);
        if (normalized["loanrequired"] !== undefined) f.loanRequired = toBoolean(normalized["loanrequired"]);
        if (normalized["monthlyincome"] !== undefined) f.monthlyIncome = toNumber(normalized["monthlyincome"]);
        if (normalized["bankpreference"] !== undefined) f.bankPreference = ensureString(normalized["bankpreference"]);
        return Object.keys(f).length > 0 ? f : undefined;
      })(),
    };

    // Clean empty parts of requirements
    if (buyer.requirements) {
      buyer.requirements = Object.keys(buyer.requirements).reduce((acc, key) => {
        const value = buyer.requirements[key];
        if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      if (Object.keys(buyer.requirements).length === 0) delete buyer.requirements;
    }

    // Clean undefined from main object
    const cleanBuyer = Object.keys(buyer).reduce((acc, key) => {
      if (buyer[key] !== undefined && buyer[key] !== null && buyer[key] !== "" && !(Array.isArray(buyer[key]) && buyer[key].length === 0)) {
        acc[key] = buyer[key];
      }
      return acc;
    }, {} as any);

    // Validation: ONLY name + phone mandatory
    const rowErrors: string[] = [];
    if (!cleanBuyer.name) rowErrors.push("Missing name");
    if (!cleanBuyer.phone) rowErrors.push("Missing phone");

    // Normalize phones (display form) for server
    if (cleanBuyer.phone) {
      const p = toCanonicalPhone(cleanBuyer.phone);
      cleanBuyer.phone = p.display;
    }
    if (cleanBuyer.whatsapp_number) {
      const w = toCanonicalPhone(cleanBuyer.whatsapp_number);
      cleanBuyer.whatsapp_number = w.display;
    }

    return {
      buyer: cleanBuyer,
      rowErrors,
    };
  };

  /* ---------- Validation + intra-file duplicate detection ---------- */
  const filterValidBuyers = (data: RawRow[]) => {
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();

    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // header row = 1

      const { buyer, rowErrors } = normalizeBuyerRow(row, index);

      if (rowErrors.length > 0) {
        skipped.push({
          row: rowNum,
          reason: `Validation failed: ${rowErrors.join(", ")}`,
          data: row,
          errors: rowErrors,
        });
        return;
      }

      // At this point phone is present (mandatory)
      const phoneParsed = toCanonicalPhone(buyer.phone);
      const phoneKey = phoneParsed.key;
      const email = (buyer.email ? String(buyer.email) : "").toLowerCase();

      // Intra-file dup checks
      if (phoneKey && seenPhoneKeys.has(phoneKey)) {
        localDuplicates.push({
          row: rowNum,
          reason: `Duplicate in file (phone)`,
          data: row,
          duplicateFields: ["phone"],
        });
        return;
      }
      if (email && seenEmails.has(email)) {
        localDuplicates.push({
          row: rowNum,
          reason: `Duplicate in file (email)`,
          data: row,
          duplicateFields: ["email"],
        });
        return;
      }

      // Phone format validation (forgiving)
      const phoneDigits = buyer.phone.replace(/[^\d+]/g, "");
      const okPhone = /^\+91\d{10}$/.test(phoneDigits) || /^\+\d{10,15}$/.test(phoneDigits) || /^\d{10}$/.test(phoneDigits);
      if (!okPhone) {
        skipped.push({
          row: rowNum,
          reason: `Invalid phone format (${buyer.phone})`,
          data: row,
        });
        return;
      }

      // Email format validation (if present)
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          skipped.push({
            row: rowNum,
            reason: "Invalid email format",
            data: row,
          });
          return;
        }
      }

      validData.push(buyer);
      seenPhoneKeys.add(phoneKey);
      if (email) seenEmails.add(email);
    });

    return { validData, nonDuplicateSkipped: skipped, localDuplicates };
  };

 const applyAssignmentPolicy = (rows: any[]): any[] => {
  const creatorId = getCreatorId();
  // MySQL DATETIME string (optional; sirf tab use karo jab DB me default nahi hai)
  const now = new Date();
  const createdAt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const attachMeta = (r: any) => ({
    ...r,
    created_by: creatorId,          // ✅ always attach
    // created_at: createdAt,       // ⬅️ enable only if your DB doesn't auto-fill
  });

  if (onlyThisExecutive) {
    const selfId =
      user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id ||
      String(user?.email || user?.username || "me");
    return rows.map((r) => attachMeta({ ...r, assigned_executive: selfId }));
  }

  if (assignmentMode === "none") {
    return rows.map((r) => attachMeta({ ...r, assigned_executive: "" }));
  }

  const ids = Array.from(selectedExecIds);
  if (ids.length === 0) return rows.map((r) => attachMeta({ ...r, assigned_executive: "" }));
  const n = ids.length;
  return rows.map((r, i) => attachMeta({ ...r, assigned_executive: ids[i % n] }));
};


  // ===== ONLY buyerAPI is used here =====
const DEBUG_IMPORT = true;

// 2) Replace your callImportAPI with this version:
const callImportAPI = async (payloadRows: any[]) => {
  if (DEBUG_IMPORT) {
    console.log("[Import Buyers] Payload rows:", payloadRows);
  }
  try {
    if (DEBUG_IMPORT) console.log("[Import Buyers] Trying shape: raw array");
    const res = await (buyerAPI as any).importBuyers(payloadRows);
    (res as any).__payload_shape = "array";
    return res;
  } catch (err1) {
    if (DEBUG_IMPORT) console.warn("[Import Buyers] Failed shape 'array':", err1);
    try {
      if (DEBUG_IMPORT) console.log("[Import Buyers] Trying shape: { buyers: [] }");
      const res = await (buyerAPI as any).importBuyers({ buyers: payloadRows });
      (res as any).__payload_shape = "buyers";
      return res;
    } catch (err2) {
      if (DEBUG_IMPORT) console.warn("[Import Buyers] Failed shape '{ buyers: [] }':", err2);
      try {
        if (DEBUG_IMPORT) console.log("[Import Buyers] Trying shape: { data: [] }");
        const res = await (buyerAPI as any).importBuyers({ data: payloadRows });
        (res as any).__payload_shape = "data";
        return res;
      } catch (err3) {
        console.error("[Import Buyers] All payload shapes failed", { err1, err2, err3 });
        throw err3;
      }
    }
  }
};

  /* ========================== Core Import Flow ========================== */

  const processAndSend = async (data: RawRow[], sourceLabel: string) => {
    setDuplicates([]);
    setSkippedRows([]);
    setUpdatedRows([]);
    setShowSummary(false);

    const { validData, nonDuplicateSkipped, localDuplicates } = filterValidBuyers(data);

    if (validData.length === 0) {
      setSkippedRows(nonDuplicateSkipped);
      setDuplicates(localDuplicates);
      setUpdatedRows([]);
      setShowSummary(true);
      if (localDuplicates.length === 0) toast.error(`No valid buyers found in the ${sourceLabel}`);
      return;
    }

    const payload = applyAssignmentPolicy(validData);
    setPreviewData(payload);

    let res: any;
    try {
      res = await callImportAPI(payload);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || `Import failed from ${sourceLabel}`);
      return;
    }

    const ok =
      res?.success === true ||
      res?.ok === true ||
      (typeof res?.status === "number" && res.status >= 200 && res.status < 300) ||
      typeof res?.inserted !== "undefined" ||
      Array.isArray(res?.insertedRows);

    if (!ok) {
      toast.error(res?.message || `Import failed from ${sourceLabel}`);
      return;
    }

    const insertedRows: any[] = res?.insertedRows ?? res?.data?.insertedRows ?? res?.meta?.insertedRows ?? [];
    const insertedCount =
      res?.inserted ??
      res?.data?.inserted ??
      res?.meta?.inserted ??
      (Array.isArray(insertedRows) ? insertedRows.length : undefined) ??
      payload.length;

    const serverSkipped: any[] = res?.skippedRows ?? res?.data?.skippedRows ?? res?.meta?.skippedRows ?? [];
    const serverUpdated: UpdatedRow[] = res?.updatedRows ?? res?.data?.updatedRows ?? res?.meta?.updatedRows ?? [];

    // Classify serverSkipped into duplicates vs others
    const serverDuplicates: DuplicateRow[] = [];
    const serverNonDupSkipped: SkippedRow[] = [];

    if (Array.isArray(serverSkipped)) {
      for (const item of serverSkipped) {
        const reason = String(item?.reason || "");
        const dataRow: RawRow = item?.data || item || {};
        if (/duplicate/i.test(reason)) {
          serverDuplicates.push({
            row: item?.row,
            reason: reason || "Duplicate in CRM",
            data: dataRow,
            duplicateFields: guessDuplicateFields(reason, dataRow),
            existingId: item?.id || item?.existingId,
          });
        } else {
          serverNonDupSkipped.push({
            row: item?.row ?? 0,
            reason: reason || "Skipped by server",
            data: dataRow,
          });
        }
      }
    }

    const allDuplicates = [...localDuplicates, ...serverDuplicates];
    const allSkipped = [...nonDuplicateSkipped, ...serverNonDupSkipped];

    setDuplicates(allDuplicates);
    setSkippedRows(allSkipped);
    setUpdatedRows(serverUpdated || []);

    if ((insertedCount ?? 0) > 0 && allDuplicates.length === 0 && allSkipped.length === 0) {
      toast.success(`Imported ${insertedCount} buyer(s) successfully.`);
      if (typeof (buyerAPI as any).getBuyers === "function") {
        try {
          await (buyerAPI as any).getBuyers();
        } catch {}
      }
      resetAndClose();
    } else {
      const parts: string[] = [];
      if ((insertedCount ?? 0) > 0) parts.push(`${insertedCount} imported`);
      if (allDuplicates.length > 0) parts.push(`${allDuplicates.length} duplicate`);
      if (allSkipped.length > 0) parts.push(`${allSkipped.length} skipped`);
      toast.info(`Import summary: ${parts.join(" • ")}`);
      setShowSummary(true);
    }
  };

  /* ============================== Handlers ============================== */

  const handleFileImport = async () => {
    if (!file) return toast.error("Please select an Excel/CSV file");
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
      return toast.error("Please select at least one executive or choose None.");
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt: ProgressEvent<FileReader>) => {
        try {
          const result = evt.target?.result;
          if (!result) {
            toast.error("Failed to read file");
            return;
          }

          let wb: any;
          const lower = file.name.toLowerCase();
          if (lower.endsWith(".csv")) {
            const csvText = typeof result === "string" ? result : String(result);
            wb = XLSX.read(csvText, { type: "string", raw: true });
          } else {
            const buf = result as ArrayBuffer;
            wb = XLSX.read(buf, { type: "array", raw: true });
          }

          const ws = wb.Sheets[wb.SheetNames[0]];
          if (!ws) {
            toast.error("No sheet found in file");
            return;
          }

          const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
          if (!data || data.length === 0) {
            toast.error("File appears to be empty");
            return;
          }

          await processAndSend(data, "file");
        } catch (e) {
          console.error(e);
          toast.error("Error processing file. Please check the format.");
        } finally {
          setIsUploading(false);
        }
      };

      const lower = file.name.toLowerCase();
      if (lower.endsWith(".csv")) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    } catch (e) {
      console.error(e);
      toast.error("Error reading file");
      setIsUploading(false);
    }
  };

  const handleGoogleSheetImport = async () => {
    if (!sheetUrl.trim()) return toast.error("Please enter a Google Sheet URL");
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
      return toast.error("Please select at least one executive or choose None.");
    }

    setIsUploading(true);
    const controller = new AbortController();
    try {
      const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        toast.error("Invalid Google Sheet URL");
        setIsUploading(false);
        return;
      }
      const sheetId = sheetIdMatch[1];

      // Support specific tab via gid
      const gidMatch = sheetUrl.match(/[?&]gid=(\d+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";

      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;

      const response = await fetch(exportUrl, { signal: controller.signal });
      if (!response.ok) {
        toast.error(
          response.status === 403
            ? "Sheet is not publicly accessible. Make it 'Anyone with link can view'."
            : "Failed to access Google Sheet."
        );
        setIsUploading(false);
        return;
      }

      const csvText = await response.text();
      if (!csvText.trim()) {
        toast.error("Google Sheet appears to be empty");
        setIsUploading(false);
        return;
      }

      const wb = XLSX.read(csvText, { type: "string", raw: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) {
        toast.error("No sheet found in Google Sheet");
        setIsUploading(false);
        return;
      }

      const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
      if (!data || data.length === 0) {
        toast.error("No data found in Google Sheet");
        setIsUploading(false);
        return;
      }

      await processAndSend(data, "Google Sheet");
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error(e);
        toast.error("Error processing Google Sheet");
      }
    } finally {
      setIsUploading(false);
      controller.abort();
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setSheetUrl("");
    setSkippedRows([]);
    setUpdatedRows([]);
    setDuplicates([]);
    setPreviewData([]);
    setShowSummary(false);
    setIsUploading(false);
    setDragActive(false);
    onClose();
  };

  const handleClose = () => {
    if (isUploading) {
      toast.info("Please wait for import to complete");
      return;
    }
    resetAndClose();
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      return;
    }
    setFile(f);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split(".").pop()?.toLowerCase() ?? "";
      if (["csv", "xlsx", "xls"].includes(ext)) setFile(droppedFile);
      else toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
    }
  };

  const exportSkippedRows = () => {
    if (!skippedRows.length) {
      toast.info("No skipped rows to export");
      return;
    }

    const headers = ["Row", "Errors", "Raw Data"];
    const csvRows = skippedRows.map((r) => {
      const errors = Array.isArray(r.errors) ? r.errors.join(" | ") : String(r.errors ?? r.reason ?? "");
      const rawData = JSON.stringify(r.data ?? {}).replace(/"/g, '""');
      return `"${r.row}","${errors}","${rawData}"`;
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buyers_import_errors_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("📤 Error report exported successfully");
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount as any)) return "—";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  /* =============================== UI =============================== */

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Import Buyers" width="max-w-5xl">
        <div className="space-y-6 p-2">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Import Buyers</h2>
                  <p className="text-sm text-gray-600">Import buyers from Excel files or Google Sheets</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import Methods */}
            <div className="space-y-4">
              {/* File Upload */}
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Upload File</h3>
                </div>

                {/* Single trigger – prevents double-open */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={onFileInputChange}
                  className="hidden"
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : file
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-2 select-none">
                      <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-green-700 truncate">{file.name}</p>
                      <p className="text-xs text-green-600">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-2 select-none">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Drop file or click to upload</p>
                      <p className="text-xs text-gray-500">Excel (.xlsx, .xls) or CSV files</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleFileImport}
                  disabled={!file || isUploading}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Import from File"
                  )}
                </Button>
              </div>

              {/* Google Sheet */}
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Google Sheets</h3>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/... (supports gid=TAB_ID)"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs leading-5 text-blue-700">
                        <p className="font-medium mb-1">Make sure your Google Sheet is:</p>
                        <ul className="space-y-0.5">
                          <li>• Anyone with link can view</li>
                          <li>• Headers same as template</li>
                          <li>• Phone numbers are text</li>
                          <li>• Optional: add <code className="bg-blue-100 px-1 rounded">gid=</code> in the URL to select a specific tab</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSheetImport}
                  disabled={!sheetUrl.trim() || isUploading}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </span>
                  ) : (
                    "Import from Google Sheet"
                  )}
                </Button>
              </div>
            </div>

            {/* Assignment & Note */}
            <div className="space-y-6">
              {/* Assignment */}
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Buyer Assignment</h3>

                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      assignmentMode === "none" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    } ${onlyThisExecutive ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      className="accent-blue-600"
                      checked={assignmentMode === "none"}
                      onChange={() => !onlyThisExecutive && setAssignmentMode("none")}
                      disabled={onlyThisExecutive}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">No Assignment</p>
                      <p className="text-xs text-gray-500">Buyers will not be assigned to any executive</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      assignmentMode === "selected" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    } ${onlyThisExecutive ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <input
                      type="radio"
                      className="accent-blue-600"
                      checked={assignmentMode === "selected" || onlyThisExecutive}
                      onChange={() => setAssignmentMode("selected")}
                      disabled={onlyThisExecutive}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {onlyThisExecutive ? "Assigned to you" : "Assign to selected executives"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {onlyThisExecutive
                          ? "All imported buyers will be assigned to you automatically"
                          : "Buyers will be distributed evenly among selected executives"}
                      </p>
                    </div>
                  </label>
                </div>

                {!onlyThisExecutive && assignmentMode === "selected" && (
                  <div className="mt-4">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setExecDropdownOpen((s) => !s)}
                        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 transition-colors"
                      >
                        <span className="truncate">
                          {selectedExecIds.size > 0
                            ? `${selectedExecIds.size} executive(s) selected`
                            : "Select executives"}
                        </span>
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {execDropdownOpen && (
                        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
                          <div className="p-2 border-b">
                            <input
                              type="text"
                              value={execSearch}
                              onChange={(e) => setExecSearch(e.target.value)}
                              placeholder="Search executive..."
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div className="max-h-56 overflow-auto">
                            {execsLoading ? (
                              <div className="p-3 text-sm text-gray-500 text-center">Loading executives...</div>
                            ) : filteredExecutives.length === 0 ? (
                              <div className="p-3 text-sm text-gray-500 text-center">No executives found</div>
                            ) : (
                              filteredExecutives.map((e) => (
                                <label
                                  key={e.id}
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    className="accent-blue-600"
                                    checked={selectedExecIds.has(e.id)}
                                    onChange={() => toggleExec(e.id)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{e.name}</p>
                                    {e.email && <p className="text-xs text-gray-500 truncate">{e.email}</p>}
                                  </div>
                                </label>
                              ))
                            )}
                          </div>

                          {filteredExecutives.length > 0 && (
                            <div className="flex items-center justify-between p-2 border-t bg-gray-50">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={selectAllExecs}
                                  className="px-2 py-1 text-xs h-auto"
                                >
                                  Select All
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={clearExecs}
                                  className="px-2 py-1 text-xs h-auto"
                                >
                                  Clear
                                </Button>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setExecDropdownOpen(false)}
                                className="px-2 py-1 text-xs h-auto"
                              >
                                Done
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedExecIds.size > 0 && (
                      <p className="mt-2 text-xs text-gray-600">
                        Buyers will be distributed evenly among {selectedExecIds.size} selected executive(s) in round-robin fashion.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                <div className="text-xs text-amber-800">
                  <p className="font-semibold mb-1">Required fields:</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Name*</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Phone*</span>
                  </div>
                  <p className="mt-2">Email, budgets, and requirements are optional.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-green-600 font-medium">
                    {previewData.length} buyer{previewData.length > 1 ? "s" : ""} ready to import
                  </span>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {previewData.slice(0, 5).map((buyer, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">
                            {buyer.salutation ? `${buyer.salutation} ` : ""}
                            {buyer.name}
                          </span>
                        </div>
                        <div className="text-gray-600">{buyer.phone || "—"} • {buyer.email || "—"}</div>
                        <div className="text-gray-600 truncate">
                          {buyer.location || "—"}
                          {buyer.city ? `, ${buyer.city}` : ""}
                        </div>
                        <div className="text-green-600 font-medium">
                          {formatCurrency(buyer.budget_min)} - {formatCurrency(buyer.budget_max)}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Pref: {buyer.requirements?.propertyType || "—"} • Stage: {buyer.buyer_lead_stage || "—"} •
                        Priority: {buyer.buyer_lead_priority || "—"}
                      </div>
                    </div>
                  ))}
                  {previewData.length > 5 && (
                    <div className="text-center text-gray-500 text-sm">… and {previewData.length - 5} more buyers</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              onClick={downloadBuyerTemplate}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Template
              </div>
            </Button>

            {skippedRows.length > 0 && (
              <Button
                variant="outline"
                onClick={exportSkippedRows}
                className="flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <FileWarning className="w-5 h-5" />
                  Export Skipped
                </div>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <SummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        duplicates={duplicates}
        skippedRows={skippedRows}
        updatedRows={updatedRows}
      />
    </>
  );
}
