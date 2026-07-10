


// src/pages/dashboard/components/ImportBuyersModal.tsx
import React, { useEffect, useMemo, useRef, useState, ChangeEvent, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import * as XLSXRaw from "xlsx-js-style";
import { usersAPI } from "@/lib/api";
import { buyerAPI } from "@/lib/buyerAPI";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";
import {
  Upload,
  X,
  Download,
  CheckCircle,
  FileWarning,
  FileSpreadsheet,
  Globe,
  Users,
  AlertCircle,
  ChevronDown,
  Search,
  Loader2,
  User,
  Mail,
  MapPin,
  Phone
} from "lucide-react";

const XLSX = XLSXRaw as any;

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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
  onImportComplete?: () => void; // callback to refresh parent table
};

type Executive = {
  id: string | number;
  name: string;
  email?: string;
  username?: string;
};

type AssignmentMode = "none" | "selected";

// Form Field Component (matching BuyerFormModal style)
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, required, children, icon, error }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
      {icon && <span style={{ color: O }}>{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[9px] mt-0.5">{error}</p>}
  </div>
);

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

  if (/e\+\d+$/i.test(phoneStr)) {
    const n = Number(phoneStr);
    if (!isNaN(n)) phoneStr = Math.round(n).toString();
  }

  phoneStr = phoneStr.replace(/[^\d+]/g, "");
  phoneStr = phoneStr.replace(/^0+/, "");

  const justDigits = phoneStr.replace(/[^\d]/g, "");
  if (/^\+?91\d{10}$/.test(phoneStr) || /^91\d{10}$/.test(phoneStr) || /^\d{10}$/.test(justDigits)) {
    const last10 = justDigits.slice(-10);
    return { display: `+91${last10}`, key: last10 };
  }
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
          <span>Duplicates: <span className="font-semibold">{duplicates.length}</span></span>
          <span>Skipped: <span className="font-semibold">{skippedRows.length}</span></span>
          {updatedRows.length > 0 && <span>Updated: <span className="font-semibold">{updatedRows.length}</span></span>}
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
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/30">
                      <td className="border px-2 py-1 text-center">{row.row ?? "-"}</td>
                      <td className="border px-2 py-1">
                        {row.duplicateFields && row.duplicateFields.length > 0 ? row.duplicateFields.join(", ") : "-"}
                      </td>
                      <td className="border px-2 py-1 text-center">{row.existingId ?? "-"}</td>
                      <td className="border px-2 py-1 text-purple-700">{row.reason}</td>
                      {allKeys.map((key) => (
                        <td key={key} className="border px-2 py-1">{renderCell(row.data?.[key])}</td>
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
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skippedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-red-50/30">
                      <td className="border px-2 py-1 text-center">{row.row}</td>
                      <td className="border px-2 py-1 text-red-600">{row.reason}</td>
                      {allKeys.map((key) => (
                        <td key={key} className="border px-2 py-1">{renderCell(row.data?.[key])}</td>
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
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
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
                        <td key={key} className="border px-2 py-1">{renderCell(row.data?.[key])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

// Excel serial to date
const toISODate = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "number" && Number.isFinite(v)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = v * 86400000;
    const d = new Date(excelEpoch.getTime() + ms);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  const s = String(v).trim();
  if (!s) return undefined;
  const t = s.replace(/\./g, "/").replace(/-/g, "/");
  let m = t.match(/^(\d{4})[\/](\d{1,2})[\/](\d{1,2})$/);
  if (m) {
    const yyyy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    }
  }
  m = t.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/);
  if (m) {
    const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    }
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return undefined;
};

/* ====================== Template Download ====================== */
const downloadBuyerTemplate = () => {
  // 1. Define headers and sample rows (same as before)
  const headers = [
    "Salutation", "Name", "Phone", "Email", "DOB", "Whatsapp_Number",
    "State", "City", "Location", "Buyer_Lead_Source", "Buyer_Lead_Priority",
    "Buyer_Lead_Stage", "Buyer_Lead_Status", "BudgetMin", "BudgetMax",
    "PropertyType", "UnitTypes", "Quantities", "PreferredLocations",
    "Special Requirements", "Furnishing", "Possession", "Facing", "Floor"
  ];

  const sampleRows = [
    [
      "Mr", "Rahul Sharma", "9876543210", "rahul.sharma@gmail.com", "1990-05-20",
      "9876543210", "Maharashtra", "Mumbai", "Bandra", "Website", "Medium",
      "New", "Active", "20000000", "25000000", "Residential", "2BHK,3BHK",
      "2", "Bandra,Andheri", "Need high floor, Vastu compliant",
      "Semi Furnished", "Ready to Move", "East", "5"
    ],
    [
      "Ms", "Priya Patel", "9988776655", "priya.patel@example.com", "1988-08-15",
      "9988776655", "Gujarat", "Ahmedabad", "Satellite", "Google Ads", "High",
      "Contacted", "In Progress", "15000000", "20000000", "Residential", "3BHK",
      "1", "Satellite, Prahlad Nagar", "Car parking mandatory, Gym",
      "Fully Furnished", "Under Construction", "North", "8"
    ],
    [
      "Dr", "Amit Kumar", "9876541230", "amit.kumar@example.com", "",
      "9876541230", "Delhi", "New Delhi", "Connaught Place", "Referral", "Low",
      "Qualified", "Active", "35000000", "45000000", "Commercial", "Office Space",
      "1", "Connaught Place", "Corner office, Good lighting",
      "Unfurnished", "Ready to Move", "West", "3"
    ]
  ];

  // 2. Create worksheet from array of arrays
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // 3. Simple column widths (safe, no complex styling)
  ws['!cols'] = headers.map((_, idx) => {
    const widths = [12, 16, 15, 24, 14, 16, 12, 12, 16, 16, 16, 16, 16, 12, 12, 16, 16, 10, 16, 25, 16, 16, 12, 12];
    return { width: widths[idx] || 12 };
  });

  // 4. (Optional) Light styling for header row – safe and simple
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:X4');
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[cellAddress]) continue;
    // Make header bold
    (ws[cellAddress] as any).s = { font: { bold: true } };
  }
  // Mark mandatory columns (Salutation, Name, Phone) as red
  [0, 1, 2].forEach((c) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) {
      (ws[addr] as any).s = { 
        font: { bold: true, color: { rgb: "FF0000" } }
      };
    }
  });

  // 5. Save file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Buyers Template");
  XLSX.writeFile(wb, "Buyers_Import_Template.xlsx");
};

/* ============================== Component ============================== */

export default function ImportBuyersModal({ isOpen, onClose, onImportComplete }: ImportBuyersModalProps) {
  const { user } = useAuth() as any;

  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // New preview states
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validPreviewData, setValidPreviewData] = useState<any[]>([]);
  const [previewSkipped, setPreviewSkipped] = useState<SkippedRow[]>([]);
  const [previewDuplicates, setPreviewDuplicates] = useState<DuplicateRow[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const sheetDebounceRef = useRef<NodeJS.Timeout | null>(null);

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
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setExecDropdownOpen(false);
    }
    if (execDropdownOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [execDropdownOpen]);

  const getCreatorId = () => user?.id || user?.userId || user?._id || user?.raw?.id;

  // ✅ FETCH SALES EXECUTIVES – same pattern as Leads Import modal
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setExecsLoading(true);
       const formatName = (u: any) => {
  const firstName = u?.first_name || "";
  const lastName = u?.last_name || "";
  const name = `${firstName} ${lastName}`.trim();
  return name || u?.username || u?.email || "Executive";
};

        if (onlyThisExecutive) {
          const selfId = user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
          const selfName = formatName(user);
          const me: Executive = { id: selfId, name: selfName, email: user?.email, username: user?.username };
          setExecutives([me]);
          setSelectedExecIds(new Set([selfId]));
          setAssignmentMode("selected");
          return;
        }

        // 👇 Exact same fetch pattern as Leads Import modal
       const res = await usersAPI.getByDeptRole({
  department: "Sales",          // ✅ capital 'S'
  role: "Sales Executive",      // ✅ exact match from your API
  is_active: 1,
  limit: 100,
});
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];

        const mapped: Executive[] = list.map((u: any) => ({
          id: u.id || u.userId || u._id,
          name: formatName(u),
          email: u.email,
          username: u.username,
        }));
        setExecutives(mapped);
      } catch (e) {
        console.error(e);
        toast.error("Could not fetch sales executives");
      } finally {
        setExecsLoading(false);
      }
    })();
  }, [isOpen, user, onlyThisExecutive]);

  const filteredExecutives = useMemo(() => {
    if (!execSearch.trim()) return executives;
    const s = execSearch.toLowerCase();
    return executives.filter(e => String(e.name || "").toLowerCase().includes(s) || String(e.email || "").toLowerCase().includes(s) || String(e.username || "").toLowerCase().includes(s));
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

  const normalizeBuyerRow = (row: any, _rowIndex: number) => {
    const normalized: Record<string, any> = {};
    Object.keys(row || {}).forEach((k) => {
      if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
        normalized[String(k).trim().toLowerCase()] = row[k];
      }
    });

    const budgetMinCandidates = ["budgetmin", "budget_min", "budget min", "budget_minimum", "minbudget", "budgetmin_inr", "min_budget"];
    const budgetMaxCandidates = ["budgetmax", "budget_max", "budget max", "budget_maximum", "maxbudget", "budgetmax_inr", "max_budget"];

    let budgetMin: number | undefined;
    let budgetMax: number | undefined;

    for (const k of budgetMinCandidates) { if (normalized[k] !== undefined) { budgetMin = toNumber(normalized[k]); break; } }
    for (const k of budgetMaxCandidates) { if (normalized[k] !== undefined) { budgetMax = toNumber(normalized[k]); break; } }

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

    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      [budgetMin, budgetMax] = [budgetMax, budgetMin];
    }

    const requirementsParsed = safeJsonParse(normalized["requirements"] ?? normalized["requirement"] ?? normalized["propertyrequirements"]);
    const financialsParsed = safeJsonParse(normalized["financials"] ?? normalized["finance"] ?? normalized["financial"]);

    const buyer: any = {
      salutation: ensureString(normalized["salutation"]),
      name: ensureString(normalized["name"] ?? normalized["full name"] ?? normalized["fullname"]),
      phone: ensureString(normalized["phone"] ?? normalized["mobile"] ?? normalized["contact"] ?? normalized["contact number"]),
      whatsapp_number: ensureString(normalized["whatsapp_number"] ?? normalized["whatsapp"] ?? normalized["whatsapp no"]),
      dob: toISODate(normalized["dob"] ?? normalized["date_of_birth"] ?? normalized["date of birth"]),
      email: ensureString(normalized["email"] ?? normalized["email address"]),
      state: ensureString(normalized["state"]),
      city: ensureString(normalized["city"]),
      location: ensureString(normalized["location"] ?? normalized["area"] ?? normalized["preferred location"]),
      buyer_lead_priority: ensureString(normalized["buyer_lead_priority"] ?? normalized["priority"] ?? normalized["lead_priority"]),
      buyer_lead_source: ensureString(normalized["buyer_lead_source"] ?? normalized["source"] ?? normalized["lead_source"]),
      buyer_lead_stage: ensureString(normalized["buyer_lead_stage"] ?? normalized["stage"] ?? normalized["lead_stage"]),
      buyer_lead_status: ensureString(normalized["buyer_lead_status"] ?? normalized["status"] ?? normalized["lead_status"]),
      budget_min: budgetMin,
      budget_max: budgetMax,
      requirements: (() => {
        if (requirementsParsed && typeof requirementsParsed === "object") {
          return {
            propertyType: requirementsParsed.propertyType || ensureString(normalized["propertytype"] ?? normalized["property_type"] ?? normalized["property type"]),
            property_subtype: requirementsParsed.property_subtype || ensureString(normalized["propertysubtype"] ?? normalized["property_subtype"] ?? normalized["property subtype"]),
            unitTypes: Array.isArray(requirementsParsed.unitTypes) ? requirementsParsed.unitTypes : ensureArray(normalized["unittype"] ?? normalized["unit_type"] ?? normalized["unittypes"] ?? normalized["unit types"]),
            preferredLocations: Array.isArray(requirementsParsed.preferredLocations) ? requirementsParsed.preferredLocations : ensureArray(normalized["preferredlocations"] ?? normalized["preferred_locations"] ?? normalized["preferred locations"]),
            furnishing: requirementsParsed.furnishing || ensureString(normalized["furnishing"]),
            possession: requirementsParsed.possession || ensureString(normalized["possession"]),
            facing: requirementsParsed.facing || ensureString(normalized["facing"]),
            floor: requirementsParsed.floor || ensureString(normalized["floor"]),
            amenities: Array.isArray(requirementsParsed.amenities) ? requirementsParsed.amenities : ensureArray(normalized["amenities"]),
            nearbylocations: Array.isArray(requirementsParsed.nearbylocations) ? requirementsParsed.nearbylocations : ensureArray(normalized["nearbylocations"] ?? normalized["nearby_locations"]),
            specialRequirements: requirementsParsed.specialRequirements || ensureString(normalized["specialrequirements"] ?? normalized["special_requirements"]),
          };
        }
        return {
          propertyType: ensureString(normalized["propertytype"] ?? normalized["property_type"] ?? normalized["property type"]),
          property_subtype: ensureString(normalized["propertysubtype"] ?? normalized["property_subtype"] ?? normalized["property subtype"]),
          unitTypes: ensureArray(normalized["unittype"] ?? normalized["unit_type"] ?? normalized["unittypes"] ?? normalized["unit types"]),
          preferredLocations: ensureArray(normalized["preferredlocations"] ?? normalized["preferred_locations"] ?? normalized["preferred locations"]),
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
        if (normalized["loan_status"] !== undefined || normalized["loanstatus"] !== undefined) f.loanStatus = ensureString(normalized["loan_status"] ?? normalized["loanstatus"]);
        if (normalized["creditscore"] !== undefined) f.creditScore = toNumber(normalized["creditscore"]);
        if (normalized["downpayment"] !== undefined) f.downPayment = toNumber(normalized["downpayment"]);
        if (normalized["loanrequired"] !== undefined) f.loanRequired = toBoolean(normalized["loanrequired"]);
        if (normalized["monthlyincome"] !== undefined) f.monthlyIncome = toNumber(normalized["monthlyincome"]);
        if (normalized["bankpreference"] !== undefined) f.bankPreference = ensureString(normalized["bankpreference"]);
        return Object.keys(f).length > 0 ? f : undefined;
      })(),
    };

    if (buyer.requirements) {
      buyer.requirements = Object.keys(buyer.requirements).reduce((acc, key) => {
        const value = buyer.requirements[key];
        if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) acc[key] = value;
        return acc;
      }, {} as any);
      if (Object.keys(buyer.requirements).length === 0) delete buyer.requirements;
    }

    const cleanBuyer = Object.keys(buyer).reduce((acc, key) => {
      if (buyer[key] !== undefined && buyer[key] !== null && buyer[key] !== "" && !(Array.isArray(buyer[key]) && buyer[key].length === 0)) acc[key] = buyer[key];
      return acc;
    }, {} as any);

    const rowErrors: string[] = [];
    if (!cleanBuyer.name) rowErrors.push("Missing name");
    if (!cleanBuyer.phone) rowErrors.push("Missing phone");

    if (cleanBuyer.phone) {
      const p = toCanonicalPhone(cleanBuyer.phone);
      cleanBuyer.phone = p.display;
    }
    if (cleanBuyer.whatsapp_number) {
      const w = toCanonicalPhone(cleanBuyer.whatsapp_number);
      cleanBuyer.whatsapp_number = w.display;
    }

    return { buyer: cleanBuyer, rowErrors };
  };

  // 🔁 Modified to also return preview rows (without assigning)
  const filterValidBuyersWithPreview = (data: RawRow[]) => {
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();
    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];
    const previewRowsArr: any[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      const { buyer, rowErrors } = normalizeBuyerRow(row, index);
      if (rowErrors.length > 0) {
        const reason = `Validation failed: ${rowErrors.join(", ")}`;
        skipped.push({ row: rowNum, reason, data: row, errors: rowErrors });
        previewRowsArr.push({ rowNum, valid: false, reason, data: row });
        return;
      }

      const phoneParsed = toCanonicalPhone(buyer.phone);
      const phoneKey = phoneParsed.key;
      const email = (buyer.email ? String(buyer.email) : "").toLowerCase();

      if (phoneKey && seenPhoneKeys.has(phoneKey)) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate in file (phone)", data: row, duplicateFields: ["phone"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate phone", data: row });
        return;
      }
      if (email && seenEmails.has(email)) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate in file (email)", data: row, duplicateFields: ["email"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate email", data: row });
        return;
      }

      const phoneDigits = buyer.phone.replace(/[^\d+]/g, "");
      const okPhone = /^\+91\d{10}$/.test(phoneDigits) || /^\+\d{10,15}$/.test(phoneDigits) || /^\d{10}$/.test(phoneDigits);
      if (!okPhone) {
        const reason = `Invalid phone format (${buyer.phone})`;
        skipped.push({ row: rowNum, reason, data: row });
        previewRowsArr.push({ rowNum, valid: false, reason, data: row });
        return;
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          const reason = "Invalid email format";
          skipped.push({ row: rowNum, reason, data: row });
          previewRowsArr.push({ rowNum, valid: false, reason, data: row });
          return;
        }
      }

      validData.push(buyer);
      previewRowsArr.push({ rowNum, valid: true, reason: "Valid", data: row, normalizedData: buyer });
      seenPhoneKeys.add(phoneKey);
      if (email) seenEmails.add(email);
    });

    return { validData, nonDuplicateSkipped: skipped, localDuplicates, previewRows: previewRowsArr };
  };

  // --- Auto preview functions ---
  const loadPreviewFromFile = async (selectedFile: File) => {
    setPreviewLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const result = evt.target?.result;
          if (!result) { toast.error("Failed to read file"); return; }
          let wb: any;
          if (selectedFile.name.toLowerCase().endsWith(".csv")) {
            wb = XLSX.read(result as string, { type: "string", raw: true });
          } else {
            wb = XLSX.read(result as ArrayBuffer, { type: "array", raw: true });
          }
          const ws = wb.Sheets[wb.SheetNames[0]];
          if (!ws) { toast.error("No sheet found in file"); return; }
          const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
          if (!data || data.length === 0) { toast.error("File appears to be empty"); return; }
          const { validData, nonDuplicateSkipped, localDuplicates, previewRows } = filterValidBuyersWithPreview(data);
          setValidPreviewData(validData);
          setPreviewSkipped(nonDuplicateSkipped);
          setPreviewDuplicates(localDuplicates);
          setPreviewRows(previewRows);
          setShowPreview(true);
          if (validData.length === 0) toast.warning(`No valid buyers found in file.`);
          else toast.info(`Preview: ${validData.length} valid, ${nonDuplicateSkipped.length + localDuplicates.length} issues.`);
        } catch (e) { console.error(e); toast.error("Error processing file. Please check the format."); }
        finally { setPreviewLoading(false); }
      };
      if (selectedFile.name.toLowerCase().endsWith(".csv")) reader.readAsText(selectedFile);
      else reader.readAsArrayBuffer(selectedFile);
    } catch (e) { console.error(e); toast.error("Error reading file"); setPreviewLoading(false); }
  };

  const loadPreviewFromSheet = async (url: string) => {
    if (!url.trim()) return;
    setPreviewLoading(true);
    try {
      const sheetIdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) { toast.error("Invalid Google Sheet URL"); setPreviewLoading(false); return; }
      const sheetId = sheetIdMatch[1];
      const gidMatch = url.match(/[?&]gid=(\d+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
      const response = await fetch(exportUrl);
      if (!response.ok) {
        toast.error(response.status === 403 ? "Sheet is not publicly accessible. Make it 'Anyone with link can view'." : "Failed to access Google Sheet.");
        setPreviewLoading(false);
        return;
      }
      const csvText = await response.text();
      if (!csvText.trim()) { toast.error("Google Sheet appears to be empty"); setPreviewLoading(false); return; }
      const wb = XLSX.read(csvText, { type: "string", raw: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) { toast.error("No sheet found in Google Sheet"); setPreviewLoading(false); return; }
      const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
      if (!data || data.length === 0) { toast.error("No data found in Google Sheet"); setPreviewLoading(false); return; }
      const { validData, nonDuplicateSkipped, localDuplicates, previewRows } = filterValidBuyersWithPreview(data);
      setValidPreviewData(validData);
      setPreviewSkipped(nonDuplicateSkipped);
      setPreviewDuplicates(localDuplicates);
      setPreviewRows(previewRows);
      setShowPreview(true);
      if (validData.length === 0) toast.warning(`No valid buyers found in sheet.`);
      else toast.info(`Preview: ${validData.length} valid, ${nonDuplicateSkipped.length + localDuplicates.length} issues.`);
    } catch (e) { console.error(e); toast.error("Error processing Google Sheet"); }
    finally { setPreviewLoading(false); }
  };

  // Trigger preview on file selection
  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      return;
    }
    setFile(f);
    loadPreviewFromFile(f);
  };

  // Debounced preview for sheet URL
  useEffect(() => {
    if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current);
    if (sheetUrl.trim()) {
      sheetDebounceRef.current = setTimeout(() => loadPreviewFromSheet(sheetUrl), 800);
    } else {
      setShowPreview(false);
      setPreviewRows([]);
      setValidPreviewData([]);
    }
    return () => { if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current); };
  }, [sheetUrl]);

  // --- Assignment and Import (using pre-validated data) ---
  const applyAssignmentPolicy = (rows: any[]): any[] => {
    const creatorId = getCreatorId();
    const attachMeta = (r: any) => ({ ...r, created_by: creatorId });

    if (onlyThisExecutive) {
      const selfId = user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
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

  const callImportAPI = async (payloadRows: any[]) => {
    try {
      const res = await (buyerAPI as any).importBuyers(payloadRows);
      return res;
    } catch (err1) {
      try {
        const res = await (buyerAPI as any).importBuyers({ buyers: payloadRows });
        return res;
      } catch (err2) {
        try {
          const res = await (buyerAPI as any).importBuyers({ data: payloadRows });
          return res;
        } catch (err3) {
          console.error("[Import Buyers] All payload shapes failed", { err1, err2, err3 });
          throw err3;
        }
      }
    }
  };

  // New unified import function (replaces handleFileImport & handleGoogleSheetImport)
  const executeImport = async () => {
    if (validPreviewData.length === 0) {
      toast.error("No valid buyers to import. Please check preview.");
      return;
    }
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
      toast.error("Please select at least one executive or choose None.");
      return;
    }

    setIsUploading(true);
    try {
      const payload = applyAssignmentPolicy(validPreviewData);
      const res = await callImportAPI(payload);
      const ok = res?.success === true || res?.ok === true || (typeof res?.status === "number" && res.status >= 200 && res.status < 300) || typeof res?.inserted !== "undefined" || Array.isArray(res?.insertedRows);
      if (!ok) {
        toast.error(res?.message || "Import failed");
        setIsUploading(false);
        return;
      }

      const insertedRows: any[] = res?.insertedRows ?? res?.data?.insertedRows ?? res?.meta?.insertedRows ?? [];
      const insertedCount = res?.inserted ?? res?.data?.inserted ?? res?.meta?.inserted ?? (Array.isArray(insertedRows) ? insertedRows.length : undefined) ?? payload.length;
      const serverSkipped: any[] = res?.skippedRows ?? res?.data?.skippedRows ?? res?.meta?.skippedRows ?? [];
      const serverUpdated: UpdatedRow[] = res?.updatedRows ?? res?.data?.updatedRows ?? res?.meta?.updatedRows ?? [];

      const serverDuplicates: DuplicateRow[] = [];
      const serverNonDupSkipped: SkippedRow[] = [];
      if (Array.isArray(serverSkipped)) {
        for (const item of serverSkipped) {
          const reason = String(item?.reason || "");
          const dataRow: RawRow = item?.data || item || {};
          if (/duplicate/i.test(reason)) {
            serverDuplicates.push({ row: item?.row, reason: reason || "Duplicate in CRM", data: dataRow, duplicateFields: guessDuplicateFields(reason, dataRow), existingId: item?.id || item?.existingId });
          } else {
            serverNonDupSkipped.push({ row: item?.row ?? 0, reason: reason || "Skipped by server", data: dataRow });
          }
        }
      }

      const allDuplicates = [...previewDuplicates, ...serverDuplicates];
      const allSkipped = [...previewSkipped, ...serverNonDupSkipped];
      setDuplicates(allDuplicates);
      setSkippedRows(allSkipped);
      setUpdatedRows(serverUpdated);

      if ((insertedCount ?? 0) > 0 && allDuplicates.length === 0 && allSkipped.length === 0) {
        toast.success(`Imported ${insertedCount} buyer(s) successfully.`);
        onImportComplete?.();
        resetAndClose();
      } else {
        const parts: string[] = [];
        if ((insertedCount ?? 0) > 0) parts.push(`${insertedCount} imported`);
        if (allDuplicates.length > 0) parts.push(`${allDuplicates.length} duplicate`);
        if (allSkipped.length > 0) parts.push(`${allSkipped.length} skipped`);
        toast.info(`Import summary: ${parts.join(" • ")}`);
        onImportComplete?.(); // still refresh parent
        setShowSummary(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Import failed unexpectedly");
    } finally {
      setIsUploading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setSheetUrl("");
    setSkippedRows([]);
    setUpdatedRows([]);
    setDuplicates([]);
    setPreviewRows([]);
    setValidPreviewData([]);
    setPreviewSkipped([]);
    setPreviewDuplicates([]);
    setShowPreview(false);
    setShowSummary(false);
    setIsUploading(false);
    setDragActive(false);
    onClose();
  };

  const handleClose = () => {
    if (isUploading) { toast.info("Please wait for import to complete"); return; }
    resetAndClose();
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
      if (["csv", "xlsx", "xls"].includes(ext)) {
        setFile(droppedFile);
        loadPreviewFromFile(droppedFile);
      } else toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
    }
  };

  const exportSkippedRows = () => {
    if (!skippedRows.length) { toast.info("No skipped rows to export"); return; }
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

  const getAssignedExecName = (execId: string | number) => {
    if (!execId) return "None";
    const exec = executives.find(e => String(e.id) === String(execId));
    return exec ? exec.name : "Unknown";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }} onClick={handleClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          style={{ border: `1px solid ${BD}` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - matching BuyerFormModal style */}
          <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
                <Upload size={14} style={{ color: O }} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Import Buyers</h2>
                <p className="text-[9px] text-white/70">Import buyers from Excel files or Google Sheets</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column - Import Methods */}
              <div className="space-y-3">
                {/* File Upload Card */}
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                    <FileSpreadsheet size={12} style={{ color: O }} /> Upload File
                  </h3>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileInputChange} className="hidden" />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                      dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                  >
                    {file ? (
                      <div className="space-y-1">
                        <CheckCircle size={16} className="mx-auto" style={{ color: O }} />
                        <p className="text-[10px] font-medium truncate px-2" style={{ color: N }}>{file.name}</p>
                        <p className="text-[9px]" style={{ color: MU }}>Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload size={16} className="mx-auto" style={{ color: MU }} />
                        <p className="text-[10px] font-medium" style={{ color: N }}>Drop file or click</p>
                        <p className="text-[9px]" style={{ color: MU }}>Excel (.xlsx, .xls) or CSV</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={executeImport}
                    disabled={validPreviewData.length === 0 || isUploading || previewLoading}
                    className="mt-2 w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50"
                    style={{ background: N }}
                  >
                    {isUploading ? (
                      <span className="inline-flex items-center justify-center gap-1">
                        <Loader2 size={10} className="animate-spin" />
                        Importing...
                      </span>
                    ) : (
                      `Import from File (${validPreviewData.length} valid)`
                    )}
                  </button>
                </div>

                {/* Google Sheet Card */}
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                    <Globe size={12} style={{ color: O }} /> Google Sheets
                  </h3>
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/..."
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white mb-2"
                    style={{ borderColor: BD }}
                  />
                  <div className="rounded-lg p-2 mb-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} />
                      <p className="text-[9px]" style={{ color: MU }}>Make sheet public: "Anyone with link can view"</p>
                    </div>
                  </div>
                  <button
                    onClick={executeImport}
                    disabled={validPreviewData.length === 0 || isUploading || previewLoading}
                    className="w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50"
                    style={{ background: O }}
                  >
                    {isUploading ? (
                      <span className="inline-flex items-center justify-center gap-1">
                        <Loader2 size={10} className="animate-spin" />
                        Importing...
                      </span>
                    ) : (
                      `Import from Google Sheet (${validPreviewData.length} valid)`
                    )}
                  </button>
                </div>

                {/* Download Template */}
                <button
                  onClick={downloadBuyerTemplate}
                  className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1"
                  style={{ borderColor: BD, color: N }}
                >
                  <Download size={10} />
                  Download Template
                </button>
              </div>

              {/* Right Column - Assignment */}
              <div className="space-y-3">
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                    <Users size={12} style={{ color: O }} /> Buyer Assignment
                  </h3>

                  <div className="space-y-2">
                    <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
                      <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
                      <div className="flex-1">
                        <p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p>
                        <p className="text-[8px]" style={{ color: MU }}>Buyers not assigned to any executive</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "selected" || onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`}>
                      <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "selected" || onlyThisExecutive} onChange={() => setAssignmentMode("selected")} disabled={onlyThisExecutive} />
                      <div className="flex-1">
                        <p className="text-[10px] font-medium" style={{ color: N }}>{onlyThisExecutive ? "Assigned to you" : "Assign to executives"}</p>
                        <p className="text-[8px]" style={{ color: MU }}>{onlyThisExecutive ? "Auto-assigned to you" : "Distributed round-robin"}</p>
                      </div>
                    </label>

                    {!onlyThisExecutive && assignmentMode === "selected" && (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setExecDropdownOpen(s => !s)}
                          className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[10px]"
                        >
                          <span style={{ color: selectedExecIds.size > 0 ? N : MU }}>
                            {selectedExecIds.size > 0 ? `${selectedExecIds.size} executive(s) selected` : "Select executives"}
                          </span>
                          <ChevronDown size={10} className={`transition-transform ${execDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {execDropdownOpen && (
                          <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
                            <div className="p-1.5 border-b">
                              <div className="relative">
                                <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                                <input type="text" value={execSearch} onChange={(e) => setExecSearch(e.target.value)} placeholder="Search..." className="w-full pl-6 pr-2 py-1 text-[9px] border rounded" style={{ borderColor: BD }} />
                              </div>
                            </div>
                            <div className="max-h-40 overflow-auto">
                              {execsLoading ? (
                                <div className="p-2 text-center text-[9px]" style={{ color: MU }}>Loading...</div>
                              ) : filteredExecutives.length === 0 ? (
                                <div className="p-2 text-center text-[9px]" style={{ color: MU }}>No executives</div>
                              ) : (
                                filteredExecutives.map(e => (
                                  <label key={e.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                                    <input type="checkbox" className="w-3 h-3 rounded" style={{ accentColor: O }} checked={selectedExecIds.has(e.id)} onChange={() => toggleExec(e.id)} />
                                    <span className="text-[9px]" style={{ color: N }}>{e.name}</span>
                                  </label>
                                ))
                              )}
                            </div>
                            <div className="flex items-center justify-between p-1.5 border-t bg-gray-50">
                              <div className="flex gap-1">
                                <button onClick={selectAllExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>All</button>
                                <button onClick={clearExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>Clear</button>
                              </div>
                              {/* <button onClick={() => setExecDropdownOpen(false)} className="px-2 py-0.5 text-[8px] rounded text-white" style={{ background: O }}>Done</button> */}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Card */}
                <div className="rounded-lg p-2.5" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                  <div className="flex items-start gap-1.5">
                    <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} />
                    <div>
                      <p className="text-[9px] font-medium mb-0.5" style={{ color: N }}>Required fields:</p>
                      <div className="flex gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Name*</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Phone*</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Error Button */}
                {skippedRows.length > 0 && (
                  <button
                    onClick={exportSkippedRows}
                    className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1"
                    style={{ borderColor: BD, color: O }}
                  >
                    <FileWarning size={10} />
                    Export Error Report ({skippedRows.length})
                  </button>
                )}
              </div>
            </div>

            {/* Preview Section - Enhanced with validation status */}
            {showPreview && (
              <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={10} style={{ color: O }} />
                    <span className="text-[9px] font-medium" style={{ color: N }}>
                      {validPreviewData.length} valid buyer(s) ready to import
                    </span>
                  </div>
                  <div className="flex gap-2 text-[8px]">
                    <span className="text-green-600">Valid: {validPreviewData.length}</span>
                    <span className="text-red-600">Issues: {previewSkipped.length + previewDuplicates.length}</span>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-[9px] border-collapse">
                    <thead className="sticky top-0 bg-gray-50" style={{ background: BG }}>
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold">Row</th>
                        <th className="px-2 py-1 text-left font-semibold">Status</th>
                        <th className="px-2 py-1 text-left font-semibold">Name</th>
                        <th className="px-2 py-1 text-left font-semibold">Phone</th>
                        <th className="px-2 py-1 text-left font-semibold">Email</th>
                        <th className="px-2 py-1 text-left font-semibold">Location</th>
                        <th className="px-2 py-1 text-left font-semibold">Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className={row.valid ? "hover:bg-green-50" : "hover:bg-red-50"}>
                          <td className="px-2 py-1">{row.rowNum}</td>
                          <td className="px-2 py-1" style={{ color: row.valid ? "#2e7d32" : "#c62828" }}>
                            {row.valid ? "✅ Valid" : `❌ ${row.reason?.substring(0, 30)}`}
                          </td>
                          <td className="px-2 py-1">{row.normalizedData?.name || row.data?.Name || "-"}</td>
                          <td className="px-2 py-1">{row.normalizedData?.phone || row.data?.Phone || "-"}</td>
                          <td className="px-2 py-1">{row.normalizedData?.email || row.data?.Email || "-"}</td>
                          <td className="px-2 py-1">{row.normalizedData?.location || row.data?.Location || "-"}</td>
                          <td className="px-2 py-1">
                            {row.normalizedData?.budget_min && row.normalizedData?.budget_max
                              ? `${formatCurrency(row.normalizedData.budget_min)} - ${formatCurrency(row.normalizedData.budget_max)}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewRows.length > 10 && (
                    <div className="p-2 text-center text-[8px]" style={{ color: MU }}>
                      Showing first 10 of {previewRows.length} rows
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
            <div className="flex items-center">
              <AlertCircle size={10} style={{ color: MU }} />
              <span className="text-[8px] ml-1" style={{ color: MU }}>Fields marked with * are required</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50"
                style={{ border: `1px solid ${BD}`, color: N }}
              >
                Cancel
              </button>
              <button
                onClick={executeImport}
                disabled={validPreviewData.length === 0 || isUploading || previewLoading}
                className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
                style={{ background: O }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={10} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={10} />
                    Import Buyers ({validPreviewData.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

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