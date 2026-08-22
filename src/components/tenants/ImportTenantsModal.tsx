// src/components/tenants/ImportTenantsModal.tsx
import React, { useEffect, useMemo, useRef, useState, ChangeEvent, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import * as XLSXRaw from "xlsx-js-style";
import { usersAPI } from "@/lib/api";
import { tenantAPI } from "@/lib/tenantAPI";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

const XLSX = XLSXRaw as any;

// Theme Colors matching Resale CRM layout
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* ============================ Types ============================ */
type RawRow = Record<string, any>;
type SkippedRow = { row: number; reason: string; data: RawRow; errors?: string[] };
type UpdatedRow = { row?: number; id?: string | number; note?: string; data: RawRow; assigned_executive?: string | number };
type DuplicateRow = { row?: number; reason: string; data: RawRow; duplicateFields?: string[]; existingId?: string | number };
type PreviewRow = { rowNum: number; valid: boolean; reason?: string; data: RawRow; normalizedData?: any };
type Executive = { id: string | number; name: string; email?: string; username?: string };
type AssignmentMode = "none" | "selected";

type ImportTenantsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
};

/* ======================= Utility / Helpers ===================== */
const getRoleString = (u: any): string => {
  const r = u?.role || u?.roles || u?.raw?.role || u?.raw?.roles || u?.user?.role || u?.user?.roles || "";
  return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
};

const isExecutiveUser = (u: any): boolean => {
  const rs = getRoleString(u);
  return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
};

const toCanonicalPhone = (raw: any): { display: string; key: string } => {
  if (raw === null || raw === undefined || String(raw).trim() === "") return { display: "", key: "" };
  let phoneStr = String(raw).trim();
  if (/e\+\d+$/i.test(phoneStr)) { const n = Number(phoneStr); if (!isNaN(n)) phoneStr = Math.round(n).toString(); }
  phoneStr = phoneStr.replace(/[^\d+]/g, "").replace(/^0+/, "");
  const justDigits = phoneStr.replace(/[^\d]/g, "");
  if (/^\+?91\d{10}$/.test(phoneStr) || /^91\d{10}$/.test(phoneStr) || /^\d{10}$/.test(justDigits)) {
    const last10 = justDigits.slice(-10);
    return { display: `+91${last10}`, key: last10 };
  }
  return { display: phoneStr.startsWith("+") ? phoneStr : `+${phoneStr}`, key: justDigits };
};

const toISODate = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "number" && Number.isFinite(v)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = v * 86400000;
    const d = new Date(excelEpoch.getTime() + ms);
    if (!isNaN(d.getTime())) return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  if (!s) return undefined;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    let yyyy, mm, dd;
    if (parts[0].length === 4) { yyyy = parseInt(parts[0]); mm = parseInt(parts[1]); dd = parseInt(parts[2]); }
    else { dd = parseInt(parts[0]); mm = parseInt(parts[1]); yyyy = parseInt(parts[2]); }
    if (yyyy && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  }
  return undefined;
};

const ensureString = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  return String(v).trim();
};

const renderCell = (v: any) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.length ? v.join(", ") : "";
  return String(v);
};

/* ========================== Summary Modal ========================== */
function SummaryModal({ isOpen, onClose, title = "Import Summary", duplicates, skippedRows, updatedRows, onExport }: any) {
  if (!isOpen) return null;
  const allKeys = Array.from(new Set(
    [...duplicates.map((r: any) => r.data), ...skippedRows.map((r: any) => r.data), ...updatedRows.map((r: any) => r.data)]
      .flatMap((row: any) => Object.keys(row).filter((k) => row[k] && String(row[k]).trim() !== ""))
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <AlertCircle size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">{title}</h2>
              <p className="text-[9px] text-white/70">Review details of the imported file</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {/* Stats Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold" style={{ background: `${O}08`, borderColor: `${O}20`, color: N }}>
              <Users size={12} style={{ color: O }} />
              <span>Duplicates: {duplicates.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
              <FileWarning size={12} className="text-red-500" />
              <span>Skipped: {skippedRows.length}</span>
            </div>
            {updatedRows.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
                <CheckCircle size={12} className="text-green-600" />
                <span>Updated: {updatedRows.length}</span>
              </div>
            )}
          </div>

          {/* Duplicates Section */}
          {duplicates.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1" style={{ color: O }}>
                <AlertCircle size={11} /> Duplicates ({duplicates.length})
              </h4>
              <div className="max-h-48 overflow-auto border rounded-lg" style={{ borderColor: BD }}>
                <table className="w-full text-[10px] border-collapse">
                  <thead className="sticky top-0 text-left bg-gray-50 z-10" style={{ borderBottom: `1px solid ${BD}` }}>
                    <tr className="text-gray-600 font-semibold">
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Row</th>
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Duplicate Fields</th>
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Existing ID</th>
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Reason</th>
                      {allKeys.map((k: string) => (
                        <th key={k} className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white" style={{ borderColor: BD }}>
                    {duplicates.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-2 py-1 text-center font-bold border-r" style={{ borderColor: BD }}>{row.row ?? "-"}</td>
                        <td className="px-2 py-1 border-r text-gray-700 font-medium" style={{ borderColor: BD }}>{row.duplicateFields?.join(", ") || "-"}</td>
                        <td className="px-2 py-1 text-center border-r font-medium text-gray-700" style={{ borderColor: BD }}>{row.existingId ?? "-"}</td>
                        <td className="px-2 py-1 border-r font-semibold text-orange-600" style={{ borderColor: BD }}>{row.reason}</td>
                        {allKeys.map((k: string) => (
                          <td key={k} className="px-2 py-1 border-r text-gray-600" style={{ borderColor: BD }}>{renderCell(row.data?.[k])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Skipped Section */}
          {skippedRows.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 text-red-700">
                <FileWarning size={11} className="text-red-500" /> Skipped / Errors ({skippedRows.length})
              </h4>
              <div className="max-h-48 overflow-auto border rounded-lg" style={{ borderColor: BD }}>
                <table className="w-full text-[10px] border-collapse">
                  <thead className="sticky top-0 text-left bg-gray-50 z-10" style={{ borderBottom: `1px solid ${BD}` }}>
                    <tr className="text-gray-600 font-semibold">
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Row</th>
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Reason</th>
                      {allKeys.map((k: string) => (
                        <th key={k} className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white" style={{ borderColor: BD }}>
                    {skippedRows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-2 py-1 text-center font-bold border-r" style={{ borderColor: BD }}>{row.row}</td>
                        <td className="px-2 py-1 border-r font-semibold text-red-600" style={{ borderColor: BD }}>{row.reason}</td>
                        {allKeys.map((k: string) => (
                          <td key={k} className="px-2 py-1 border-r text-gray-600" style={{ borderColor: BD }}>{renderCell(row.data?.[k])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Updated Section */}
          {updatedRows.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 text-green-700">
                <CheckCircle size={11} /> Updated ({updatedRows.length})
              </h4>
              <div className="max-h-48 overflow-auto border rounded-lg" style={{ borderColor: BD }}>
                <table className="w-full text-[10px] border-collapse">
                  <thead className="sticky top-0 text-left bg-gray-50 z-10" style={{ borderBottom: `1px solid ${BD}` }}>
                    <tr className="text-gray-600 font-semibold">
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Row</th>
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>ID</th>
                      <th className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>Note</th>
                      {allKeys.map((k: string) => (
                        <th key={k} className="px-2 py-1.5 border-r" style={{ borderColor: BD }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white" style={{ borderColor: BD }}>
                    {updatedRows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-2 py-1 text-center font-bold border-r" style={{ borderColor: BD }}>{row.row ?? "-"}</td>
                        <td className="px-2 py-1 text-center border-r font-medium text-gray-700" style={{ borderColor: BD }}>{row.id ?? "-"}</td>
                        <td className="px-2 py-1 border-r font-semibold text-green-600" style={{ borderColor: BD }}>{row.note || "Updated"}</td>
                        {allKeys.map((k: string) => (
                          <td key={k} className="px-2 py-1 border-r text-gray-600" style={{ borderColor: BD }}>{renderCell(row.data?.[k])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex justify-end gap-2 border-t" style={{ borderColor: BD, background: BG }}>
          {onExport && (duplicates.length > 0 || skippedRows.length > 0) && (
            <Button onClick={onExport} style={{ background: O, color: 'white' }} className="px-2.5 py-1 text-[10px] font-semibold text-white rounded-lg transition-all hover:opacity-90 flex items-center gap-1 shadow-sm font-medium">
              <Download size={12} /> Export Issues Report
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="px-2.5 py-1 text-[10px] border rounded-lg hover:bg-gray-50 font-medium transition-all" style={{ borderColor: BD, color: N }}>Close</Button>
        </div>
      </div>
    </div>
  );
}

/* ====================== Template Download ====================== */
const downloadTenantTemplate = () => {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "WhatsApp",
    "Preferred Location",
    "Budget Min",
    "Budget Max",
    "Preferred BHK",
    "Tenant Type",
    "Move In Date",
    "Current Address",
    "Notes",
    "Status"
  ];

  const sampleRows = [
    [
      "Rahul Sharma",
      "9876543210",
      "rahul.sharma@example.com",
      "9876543210",
      "Kharghar, Sector 12",
      "15000",
      "22000",
      "2 BHK",
      "Family",
      "2026-09-01",
      "Flat 402, Shiv Darshan Towers, Vashi, Navi Mumbai",
      "Needs parking space for a sedan and prefers high floor flats.",
      "Active Search"
    ],
    [
      "Priyanka Patel",
      "9812345678",
      "priyanka.patel@example.com",
      "9812345678",
      "Seawoods",
      "25000",
      "35000",
      "3 BHK",
      "Family",
      "2026-09-15",
      "A-12, Green Meadows, Pune",
      "Family moving due to job relocation. Prefers fully furnished flats.",
      "Active Search"
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  // Mark mandatory columns (Name, Phone) as red
  [0, 1].forEach(c => {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) (ws as any)[addr].s = { font: { color: { rgb: "FF0000" }, bold: true } };
  });
  // Set column widths
  ws['!cols'] = [20, 15, 25, 15, 20, 12, 12, 12, 14, 12, 35, 35, 14].map(w => ({ width: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tenants");
  XLSX.writeFile(wb, "Tenants_Import_Template.xlsx");
};

/* ============================== Main Component ============================== */
export default function ImportTenantsModal({ isOpen, onClose, onImportComplete }: ImportTenantsModalProps) {
  const { user } = useAuth() as any;
  const onlyThisExecutive = isExecutiveUser(user);

  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [validPreviewData, setValidPreviewData] = useState<any[]>([]);
  const [previewSkipped, setPreviewSkipped] = useState<SkippedRow[]>([]);
  const [previewDuplicates, setPreviewDuplicates] = useState<DuplicateRow[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
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

  const exportSkippedRows = () => {
    const listSkipped = skippedRows.length > 0 ? skippedRows : previewSkipped;
    const listDuplicates = duplicates.length > 0 ? duplicates : previewDuplicates;

    if (!listSkipped.length && !listDuplicates.length) {
      toast.info("No skipped rows or duplicates to export");
      return;
    }

    const rowsToExport = [
      ...listSkipped.map(r => ({
        "Row Number": r.row,
        "Status": "Skipped / Invalid",
        "Issue / Error": r.reason,
        ...r.data
      })),
      ...listDuplicates.map(r => ({
        "Row Number": r.row,
        "Status": "Duplicate",
        "Issue / Error": r.reason,
        ...r.data
      }))
    ];

    const ws = XLSX.utils.json_to_sheet(rowsToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Import Issues");
    XLSX.writeFile(wb, `tenants_import_issues_${Date.now()}.xlsx`);
    toast.success("Successfully exported import issues to Excel.");
  };

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const sheetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setExecDropdownOpen(false);
    }
    if (execDropdownOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [execDropdownOpen]);

  // Fetch sales executives (department=Sales, role=Sales Executive or Admin)
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setExecsLoading(true);
        const formatName = (u: any) => {
          const firstName = u?.first_name || "";
          const lastName = u?.last_name || "";
          const name = `${firstName} ${lastName}`.trim();
          return name || u?.username || u?.email || "Sales Executive";
        };
        
        if (onlyThisExecutive) {
          const selfId = user?.id || user?.userId || user?._id || String(user?.email || user?.username || "me");
          setExecutives([{ id: selfId, name: formatName(user), email: user?.email, username: user?.username }]);
          setSelectedExecIds(new Set([selfId]));
          setAssignmentMode("selected");
          return;
        }

        const usersRes = await usersAPI.getAllUsers();
        if (usersRes.success && Array.isArray(usersRes.data)) {
          const list = usersRes.data.filter((u: any) =>
            u.role === 'sales_executive' || u.role_name === 'sales_executive' || u.role_name === 'admin'
          );
          const mapped: Executive[] = list.map((u: any) => ({
            id: u.id || u.userId || u._id,
            name: formatName(u),
            email: u.email,
            username: u.username,
          }));
          setExecutives(mapped);
        }
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
    return executives.filter(e => String(e.name || "").toLowerCase().includes(s) || String(e.email || "").toLowerCase().includes(s));
  }, [execSearch, executives]);

  const toggleExec = (id: string | number) => setSelectedExecIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const selectAllExecs = () => setSelectedExecIds(new Set(executives.map(e => e.id)));
  const clearExecs = () => setSelectedExecIds(new Set());

  // Normalize a tenant row
  const normalizeTenantRow = (row: any) => {
    const normalized: Record<string, any> = {};
    Object.keys(row || {}).forEach(k => { if (row[k] !== undefined && row[k] !== null && row[k] !== "") normalized[String(k).trim().toLowerCase()] = row[k]; });

    const tenant: any = {
      name: ensureString(normalized["name"]),
      phone: ensureString(normalized["phone"]),
      email: ensureString(normalized["email"]),
      whatsapp: ensureString(normalized["whatsapp"] ?? normalized["phone"]),
      preferred_location: ensureString(normalized["preferred location"] ?? normalized["preferred_location"] ?? normalized["location"]),
      budget_min: ensureString(normalized["budget min"] ?? normalized["budget_min"] ?? normalized["min budget"]),
      budget_max: ensureString(normalized["budget max"] ?? normalized["budget_max"] ?? normalized["max budget"]),
      preferred_bhk: ensureString(normalized["preferred bhk"] ?? normalized["preferred_bhk"] ?? normalized["bhk"]),
      tenant_type: ensureString(normalized["tenant type"] ?? normalized["tenant_type"]),
      move_in_date: toISODate(normalized["move in date"] ?? normalized["move_in_date"]),
      current_address: ensureString(normalized["current address"] ?? normalized["current_address"] ?? normalized["address"]),
      notes: ensureString(normalized["notes"] ?? normalized["remarks"]),
      status: ensureString(normalized["status"]) || "Active Search",
    };
    // Clean undefined values
    Object.keys(tenant).forEach(k => { if (tenant[k] === undefined) delete tenant[k]; });
    const rowErrors: string[] = [];
    if (!tenant.name) rowErrors.push("Missing name");
    if (!tenant.phone) rowErrors.push("Missing phone");
    if (tenant.phone) {
      const p = toCanonicalPhone(tenant.phone);
      tenant.phone = p.display;
    }
    if (tenant.whatsapp) {
      const w = toCanonicalPhone(tenant.whatsapp);
      tenant.whatsapp = w.display;
    }
    return { tenant, rowErrors };
  };

  // Validate all rows and produce preview
  const filterValidTenantsWithPreview = (data: RawRow[]) => {
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();
    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];
    const previewRowsArr: PreviewRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      const { tenant, rowErrors } = normalizeTenantRow(row);
      if (rowErrors.length > 0) {
        skipped.push({ row: rowNum, reason: `Validation: ${rowErrors.join(", ")}`, data: row, errors: rowErrors });
        previewRowsArr.push({ rowNum, valid: false, reason: rowErrors.join(", "), data: row });
        return;
      }
      const phoneParsed = toCanonicalPhone(tenant.phone);
      const phoneKey = phoneParsed.key;
      const email = (tenant.email ? tenant.email : "").toLowerCase();
      if (phoneKey && seenPhoneKeys.has(phoneKey)) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate phone in file", data: row, duplicateFields: ["phone"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate phone", data: row });
        return;
      }
      if (email && seenEmails.has(email)) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate email in file", data: row, duplicateFields: ["email"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate email", data: row });
        return;
      }
      const phoneDigits = tenant.phone.replace(/[^\d+]/g, "");
      const okPhone = /^\+91\d{10}$/.test(phoneDigits) || /^\+\d{10,15}$/.test(phoneDigits) || /^\d{10}$/.test(phoneDigits);
      if (!okPhone) {
        const reason = `Invalid phone format (${tenant.phone})`;
        skipped.push({ row: rowNum, reason, data: row });
        previewRowsArr.push({ rowNum, valid: false, reason, data: row });
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const reason = "Invalid email format";
        skipped.push({ row: rowNum, reason, data: row });
        previewRowsArr.push({ rowNum, valid: false, reason, data: row });
        return;
      }
      validData.push(tenant);
      previewRowsArr.push({ rowNum, valid: true, reason: "Valid", data: row, normalizedData: tenant });
      seenPhoneKeys.add(phoneKey);
      if (email) seenEmails.add(email);
    });
    return { validData, nonDuplicateSkipped: skipped, localDuplicates, previewRows: previewRowsArr };
  };

  const processPreview = (rawData: RawRow[], source: string) => {
    setPreviewLoading(true);
    try {
      const { validData, nonDuplicateSkipped, localDuplicates, previewRows } = filterValidTenantsWithPreview(rawData);
      setValidPreviewData(validData);
      setPreviewSkipped(nonDuplicateSkipped);
      setPreviewDuplicates(localDuplicates);
      setPreviewRows(previewRows);
      setShowPreview(true);
      if (validData.length === 0) toast.warning(`No valid tenants found in ${source}.`);
      else toast.info(`Preview: ${validData.length} valid, ${nonDuplicateSkipped.length + localDuplicates.length} issues.`);
    } catch (err) { console.error(err); toast.error(`Error processing ${source}`); }
    finally { setPreviewLoading(false); }
  };

  // Auto preview from file
  const autoPreviewFile = useCallback(async (selectedFile: File) => {
    setPreviewLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const result = evt.target?.result;
          if (!result) { toast.error("Failed to read file"); return; }
          let wb: any;
          if (selectedFile.name.toLowerCase().endsWith(".csv")) wb = XLSX.read(result as string, { type: "string", raw: true });
          else wb = XLSX.read(result as ArrayBuffer, { type: "array", raw: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          if (!ws) { toast.error("No sheet found"); return; }
          const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
          if (!data || data.length === 0) { toast.error("File is empty"); return; }
          processPreview(data, "file");
        } catch (e) { console.error(e); toast.error("Error parsing file"); }
        finally { setPreviewLoading(false); }
      };
      if (selectedFile.name.toLowerCase().endsWith(".csv")) reader.readAsText(selectedFile);
      else reader.readAsArrayBuffer(selectedFile);
    } catch (e) { console.error(e); toast.error("Error reading file"); setPreviewLoading(false); }
  }, []);

  // Auto preview from Google Sheet (debounced)
  const autoPreviewSheet = useCallback(async (url: string) => {
    if (!url.trim()) return;
    setPreviewLoading(true);
    try {
      const sheetIdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) { toast.error("Invalid Google Sheet URL"); setPreviewLoading(false); return; }
      const sheetId = sheetIdMatch[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(exportUrl);
      if (!response.ok) { toast.error(response.status === 403 ? "Sheet not public" : "Failed to fetch sheet"); setPreviewLoading(false); return; }
      const csvText = await response.text();
      if (!csvText.trim()) { toast.error("Sheet is empty"); setPreviewLoading(false); return; }
      const wb = XLSX.read(csvText, { type: "string", raw: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) { toast.error("No sheet found"); setPreviewLoading(false); return; }
      const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
      if (!data || data.length === 0) { toast.error("No data in sheet"); setPreviewLoading(false); return; }
      processPreview(data, "Google Sheet");
    } catch (e) { console.error(e); toast.error("Error loading sheet"); setPreviewLoading(false); }
  }, []);

  // Trigger preview on file selection
  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(ext)) { toast.error("Only Excel/CSV files"); return; }
    setFile(f);
    autoPreviewFile(f);
  };

  // Debounced preview for sheet URL
  useEffect(() => {
    if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current);
    if (sheetUrl.trim()) {
      sheetDebounceRef.current = setTimeout(() => autoPreviewSheet(sheetUrl), 800);
    } else {
      setShowPreview(false);
      setPreviewRows([]);
      setValidPreviewData([]);
    }
    return () => { if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current); };
  }, [sheetUrl, autoPreviewSheet]);

  // Assignment policy (round‑robin or self)
  const applyAssignmentPolicy = (rows: any[]): any[] => {
    if (onlyThisExecutive) {
      const selfId = user?.id || user?.userId || user?._id || String(user?.email || user?.username || "me");
      return rows.map(r => ({ ...r, assigned_to: selfId, assigned_executive: selfId }));
    }
    if (assignmentMode === "none") return rows.map(r => ({ ...r, assigned_to: "", assigned_executive: "" }));
    const ids = Array.from(selectedExecIds);
    if (ids.length === 0) return rows.map(r => ({ ...r, assigned_to: "", assigned_executive: "" }));
    const n = ids.length;
    return rows.map((r, i) => ({ ...r, assigned_to: ids[i % n], assigned_executive: ids[i % n] }));
  };

  const executeImport = async () => {
    if (validPreviewData.length === 0) { toast.error("No valid tenants to import. Check preview."); return; }
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) { toast.error("Select at least one executive or choose 'None'."); return; }
    setIsUploading(true);
    try {
      const payload = applyAssignmentPolicy(validPreviewData);
      const res = await tenantAPI.importTenants(payload);
      const ok = res?.success === true || res?.ok === true || (typeof res?.status === "number" && res.status >= 200 && res.status < 300) || typeof res?.inserted !== "undefined";
      if (!ok) { toast.error(res?.message || "Import failed"); setIsUploading(false); return; }
      const insertedCount = res?.inserted ?? res?.data?.inserted ?? payload.length;
      const serverSkipped = res?.skippedRows ?? res?.data?.skippedRows ?? [];
      const serverUpdated = res?.updatedRows ?? res?.data?.updatedRows ?? [];
      const isDuplicateReason = (reason: string) => /duplicate/i.test(reason || "");
      const serverDuplicates = serverSkipped.filter((s: any) => isDuplicateReason(s?.reason)).map((s: any) => ({ row: s.row, reason: s.reason, data: s.data, duplicateFields: [], existingId: s.id }));
      const serverNonDupSkipped = serverSkipped.filter((s: any) => !isDuplicateReason(s?.reason)).map((s: any) => ({ row: s.row ?? 0, reason: s.reason, data: s.data }));
      const allDuplicates = [...previewDuplicates, ...serverDuplicates];
      const allSkipped = [...previewSkipped, ...serverNonDupSkipped];
      setDuplicates(allDuplicates);
      setSkippedRows(allSkipped);
      setUpdatedRows(serverUpdated);
      if (insertedCount > 0 && allDuplicates.length === 0 && allSkipped.length === 0) {
        toast.success(`Imported ${insertedCount} tenant(s) successfully.`);
        onImportComplete?.();
        resetAndClose();
      } else {
        const parts = [`${insertedCount} imported`, `${allDuplicates.length} duplicate`, `${allSkipped.length} skipped`];
        toast.info(`Import summary: ${parts.join(" • ")}`);
        onImportComplete?.();
        setShowSummary(true);
      }
    } catch (err) { console.error(err); toast.error("Import failed unexpectedly"); }
    finally { setIsUploading(false); }
  };

  const resetAndClose = () => {
    setFile(null); setSheetUrl(""); setPreviewRows([]); setValidPreviewData([]); setPreviewSkipped([]); setPreviewDuplicates([]); setShowPreview(false);
    setSkippedRows([]); setUpdatedRows([]); setDuplicates([]); setShowSummary(false); setIsUploading(false); setDragActive(false);
    onClose();
  };

  const handleClose = () => {
    if (isUploading) { toast.info("Please wait for import to complete"); return; }
    resetAndClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f && ["csv", "xlsx", "xls"].includes(f.name.split(".").pop()?.toLowerCase() || "")) {
      setFile(f);
      autoPreviewFile(f);
    } else toast.error("Only Excel/CSV files");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }} onClick={handleClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}><Upload size={14} style={{ color: O }} /></div>
              <div><h2 className="text-sm font-bold text-white">Import Tenants</h2><p className="text-[9px] text-white/70">Import tenants from Excel files or Google Sheets</p></div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column - Import Methods */}
              <div className="space-y-3">
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><FileSpreadsheet size={12} style={{ color: O }} /> Upload File</h3>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileInputChange} className="hidden" />
                  <div
                    role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 bg-white"}`}
                  >
                    {file ? (
                      <div className="space-y-1"><CheckCircle size={16} className="mx-auto" style={{ color: O }} /><p className="text-[10px] font-medium truncate px-2" style={{ color: N }}>{file.name}</p><p className="text-[9px]" style={{ color: MU }}>Click to change</p></div>
                    ) : (
                      <div className="space-y-1"><Upload size={16} className="mx-auto" style={{ color: MU }} /><p className="text-[10px] font-medium" style={{ color: N }}>Drop file or click</p><p className="text-[9px]" style={{ color: MU }}>Excel (.xlsx, .xls) or CSV</p></div>
                    )}
                  </div>
                  <button onClick={executeImport} disabled={validPreviewData.length === 0 || isUploading || previewLoading} className="mt-2 w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50" style={{ background: N }}>
                    {isUploading ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" /> Processing...</span> : `Import from File (${validPreviewData.length} valid)`}
                  </button>
                </div>

                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Globe size={12} style={{ color: O }} /> Google Sheets</h3>
                  <input type="text" placeholder="https://docs.google.com/spreadsheets/..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white mb-2" style={{ borderColor: BD }} />
                  <div className="rounded-lg p-2 mb-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}><div className="flex items-start gap-1.5"><AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} /><p className="text-[9px]" style={{ color: MU }}>Make sheet public: "Anyone with link can view"</p></div></div>
                  <button onClick={executeImport} disabled={validPreviewData.length === 0 || isUploading || previewLoading} className="w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50" style={{ background: O }}>
                    {isUploading ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" /> Importing...</span> : `Import from Google Sheet (${validPreviewData.length} valid)`}
                  </button>
                </div>

                <button onClick={downloadTenantTemplate} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: N }}><Download size={10} /> Download Template</button>
              </div>

              {/* Right Column - Assignment */}
              <div className="space-y-3">
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Users size={12} style={{ color: O }} /> Tenant Assignment</h3>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
                      <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
                      <div className="flex-1"><p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p><p className="text-[8px]" style={{ color: MU }}>Tenants not assigned to any executive</p></div>
                    </label>
                    <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "selected" || onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`}>
                      <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "selected" || onlyThisExecutive} onChange={() => setAssignmentMode("selected")} disabled={onlyThisExecutive} />
                      <div className="flex-1"><p className="text-[10px] font-medium" style={{ color: N }}>{onlyThisExecutive ? "Assigned to you" : "Assign to executives"}</p><p className="text-[8px]" style={{ color: MU }}>{onlyThisExecutive ? "Auto-assigned to you" : "Distributed round-robin"}</p></div>
                    </label>
                    {!onlyThisExecutive && assignmentMode === "selected" && (
                      <div className="relative" ref={dropdownRef}>
                        <button type="button" onClick={() => setExecDropdownOpen(s => !s)} className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[10px]">
                          <span style={{ color: selectedExecIds.size > 0 ? N : MU }}>{selectedExecIds.size > 0 ? `${selectedExecIds.size} executive(s) selected` : "Select executives"}</span>
                          <ChevronDown size={10} className={`transition-transform ${execDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {execDropdownOpen && (
                          <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
                            <div className="p-1.5 border-b"><div className="relative"><Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} /><input type="text" value={execSearch} onChange={e => setExecSearch(e.target.value)} placeholder="Search..." className="w-full pl-6 pr-2 py-1 text-[9px] border rounded" style={{ borderColor: BD }} /></div></div>
                            <div className="max-h-40 overflow-auto">
                              {execsLoading ? <div className="p-2 text-center text-[9px]" style={{ color: MU }}>Loading...</div> : filteredExecutives.length === 0 ? <div className="p-2 text-center text-[9px]" style={{ color: MU }}>No executives</div> : filteredExecutives.map(e => (
                                <label key={e.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer border-b last:border-0" style={{ borderColor: BD }}>
                                  <input type="checkbox" checked={selectedExecIds.has(e.id)} onChange={() => toggleExec(e.id)} className="w-3 h-3 rounded" style={{ accentColor: O }} />
                                  <div className="text-[10px]"><p className="font-semibold" style={{ color: N }}>{e.name}</p><p className="text-[8px]" style={{ color: MU }}>{e.email || e.username || ""}</p></div>
                                </label>
                              ))}
                            </div>
                            <div className="flex justify-between bg-gray-50 p-1.5 border-t" style={{ borderColor: BD }}>
                              <button type="button" onClick={selectAllExecs} className="text-[8px] font-bold" style={{ color: O }}>Select All</button>
                              <button type="button" onClick={clearExecs} className="text-[8px] font-bold text-red-500">Clear</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: BD }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: N }}>
                    <FileSpreadsheet size={13} style={{ color: O }} /> Preview Parsing ({previewRows.length} total rows)
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Valid: {validPreviewData.length}</span>
                    {(previewSkipped.length > 0 || previewDuplicates.length > 0) && (
                      <button onClick={exportSkippedRows} className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1 hover:bg-red-100">
                        <FileWarning size={10} /> Issues: {previewSkipped.length + previewDuplicates.length} (Click to export)
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-60 overflow-auto border rounded-lg" style={{ borderColor: BD }}>
                  <table className="w-full text-[10px] border-collapse bg-white">
                    <thead className="sticky top-0 bg-gray-50 text-left z-10" style={{ borderBottom: `1px solid ${BD}` }}>
                      <tr className="text-gray-600 font-semibold">
                        <th className="px-2.5 py-2 border-r text-center" style={{ borderColor: BD }}>Row</th>
                        <th className="px-2.5 py-2 border-r text-center" style={{ borderColor: BD }}>Status</th>
                        <th className="px-2.5 py-2 border-r text-left" style={{ borderColor: BD }}>Validation Reason</th>
                        <th className="px-2.5 py-2 border-r text-left" style={{ borderColor: BD }}>Name</th>
                        <th className="px-2.5 py-2 border-r text-left" style={{ borderColor: BD }}>Phone</th>
                        <th className="px-2.5 py-2 border-r text-left" style={{ borderColor: BD }}>Email</th>
                        <th className="px-2.5 py-2 border-r text-left" style={{ borderColor: BD }}>Budget</th>
                        <th className="px-2.5 py-2 border-r text-left" style={{ borderColor: BD }}>BHK</th>
                        <th className="px-2.5 py-2 text-left" style={{ borderColor: BD }}>Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100" style={{ borderColor: BD }}>
                      {previewRows.map((r, i) => (
                        <tr key={i} className={`hover:bg-slate-50/50 ${!r.valid ? "bg-red-50/10" : ""}`}>
                          <td className="px-2.5 py-1.5 border-r text-center font-bold" style={{ borderColor: BD }}>{r.rowNum}</td>
                          <td className="px-2.5 py-1.5 border-r text-center" style={{ borderColor: BD }}>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${r.valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {r.valid ? "VALID" : "ISSUE"}
                            </span>
                          </td>
                          <td className={`px-2.5 py-1.5 border-r font-medium ${r.valid ? "text-slate-400" : "text-red-600 font-bold"}`} style={{ borderColor: BD }}>{r.reason || "Valid row"}</td>
                          <td className="px-2.5 py-1.5 border-r font-bold text-slate-800" style={{ borderColor: BD }}>{r.data?.Name || r.data?.name || "-"}</td>
                          <td className="px-2.5 py-1.5 border-r text-slate-700" style={{ borderColor: BD }}>{r.data?.Phone || r.data?.phone || "-"}</td>
                          <td className="px-2.5 py-1.5 border-r text-slate-500" style={{ borderColor: BD }}>{r.data?.Email || r.data?.email || "-"}</td>
                          <td className="px-2.5 py-1.5 border-r text-slate-600" style={{ borderColor: BD }}>
                            {r.data?.["Budget Min"] || r.data?.budget_min || "0"} - {r.data?.["Budget Max"] || r.data?.budget_max || "0"}
                          </td>
                          <td className="px-2.5 py-1.5 border-r text-slate-600" style={{ borderColor: BD }}>{r.data?.["Preferred BHK"] || r.data?.preferred_bhk || "-"}</td>
                          <td className="px-2.5 py-1.5 text-slate-600 truncate max-w-[150px]" style={{ borderColor: BD }}>{r.data?.["Preferred Location"] || r.data?.preferred_location || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 flex justify-end gap-2 border-t" style={{ borderColor: BD, background: BG }}>
            <Button variant="outline" onClick={handleClose} className="px-3.5 py-1.5 text-[10px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold" style={{ color: N }}>Cancel</Button>
            <Button
              onClick={executeImport}
              disabled={validPreviewData.length === 0 || isUploading || previewLoading}
              className="px-3.5 py-1.5 text-[10px] font-bold text-white rounded-lg transition-all shadow-sm hover:opacity-90 flex items-center gap-1.5"
              style={{ background: O }}
            >
              {isUploading ? <Loader2 size={12} className="animate-spin" /> : "Commit Import"}
            </Button>
          </div>
        </div>
      </div>

      <SummaryModal
        isOpen={showSummary}
        onClose={resetAndClose}
        title="Tenant Import Complete"
        duplicates={duplicates}
        skippedRows={skippedRows}
        updatedRows={updatedRows}
        onExport={exportSkippedRows}
      />
    </>
  );
}
