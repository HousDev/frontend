// src/components/owners/ImportOwnersModal.tsx
import React, { useEffect, useMemo, useRef, useState, ChangeEvent, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import * as XLSXRaw from "xlsx-js-style";
import { usersAPI } from "@/lib/api";
import ownerAPI from "@/lib/ownerAPI";
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

// ESALE Theme Colors
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

type ImportOwnersModalProps = {
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
      .flatMap((row: any) => Object.keys(row).filter(k => row[k] && String(row[k]).trim() !== ""))
  ));
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="max-w-6xl">
      <div className="p-4 space-y-4 text-xs">
        <div className="flex flex-wrap gap-3">
          <span className="text-sm">Duplicates: <strong>{duplicates.length}</strong></span>
          <span className="text-sm">Skipped: <strong>{skippedRows.length}</strong></span>
          {updatedRows.length > 0 && <span className="text-sm">Updated: <strong>{updatedRows.length}</strong></span>}
        </div>
        {duplicates.length > 0 && (
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">Duplicates</h4>
            <div className="max-h-60 overflow-auto border rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-purple-50 sticky top-0">
                  <tr>
                    <th className="p-2">Row</th>
                    <th className="p-2">Reason</th>
                    {allKeys.map(k => <th className="p-2" key={k}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((row: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-bold">{row.row}</td>
                      <td className="p-2 text-purple-700 font-semibold">{row.reason}</td>
                      {allKeys.map(k => <td className="p-2" key={k}>{renderCell(row.data?.[k])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {skippedRows.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Skipped / Errors</h4>
            <div className="max-h-60 overflow-auto border rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-red-50 sticky top-0">
                  <tr>
                    <th className="p-2">Row</th>
                    <th className="p-2">Reason</th>
                    {allKeys.map(k => <th className="p-2" key={k}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {skippedRows.map((row: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-bold">{row.row}</td>
                      <td className="p-2 text-red-600 font-semibold">{row.reason}</td>
                      {allKeys.map(k => <td className="p-2" key={k}>{renderCell(row.data?.[k])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {updatedRows.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Updated</h4>
            <div className="max-h-60 overflow-auto border rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-green-50 sticky top-0">
                  <tr>
                    <th className="p-2">Row</th>
                    <th className="p-2">ID</th>
                    <th className="p-2">Note</th>
                    {allKeys.map(k => <th className="p-2" key={k}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {updatedRows.map((row: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-bold">{row.row}</td>
                      <td className="p-2">{row.id}</td>
                      <td className="p-2 text-green-600 font-semibold">{row.note}</td>
                      {allKeys.map(k => <td className="p-2" key={k}>{renderCell(row.data?.[k])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {onExport && (duplicates.length > 0 || skippedRows.length > 0) && (
            <Button onClick={onExport} style={{ background: O, color: 'white' }} className="flex items-center gap-1">
              <Download size={12} /> Export Issues Report
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ====================== Template Download (matches OwnerFormModal fields) ====================== */
const downloadOwnerTemplate = () => {
  const headers = [
    "Salutation", "Name", "Phone", "WhatsApp", "Email", "Owner DOB",
    "State", "City", "Location", "Lead Source", "Lead Stage", "Lead Type",
    "Priority", "Status", "Notes"
  ];

  const sampleRows = [
    [
      "Mr.", "Rajesh Kumar", "9876543210", "9876543210", "rajesh.kumar@gmail.com", "1980-05-15",
      "Maharashtra", "Mumbai", "Bandra West", "Website", "Initial Contact", "Owner Lead",
      "High", "Active", "Looking to rent or sell residential 3BHK flat"
    ],
    [
      "Mrs.", "Sunita Sharma", "9988776655", "9988776655", "sunita.sharma@gmail.com", "1975-12-20",
      "Delhi", "New Delhi", "Connaught Place", "Referral", "Discussion", "Premium Owner",
      "Medium", "In Progress", "Commercial showroom, prime location"
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  // Mark mandatory columns (Name, Phone) as red
  [1, 2].forEach(c => {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) (ws as any)[addr].s = { font: { color: { rgb: "FF0000" }, bold: true } };
  });
  // Set column widths
  ws['!cols'] = [12, 20, 15, 15, 25, 12, 12, 12, 16, 14, 16, 14, 10, 10, 30].map(w => ({ width: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Owners");
  XLSX.writeFile(wb, "Owners_Import_Template.xlsx");
};

/* ============================== Main Component ============================== */
export default function ImportOwnersModal({ isOpen, onClose, onImportComplete }: ImportOwnersModalProps) {
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
    XLSX.writeFile(wb, `owners_import_issues_${Date.now()}.xlsx`);
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

  // Fetch sales executives (department=Sales, role=Sales Executive)
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
        const res = await usersAPI.getByDeptRole({
          department: "Sales",
          role: "Sales Executive",
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
    return executives.filter(e => String(e.name || "").toLowerCase().includes(s) || String(e.email || "").toLowerCase().includes(s));
  }, [execSearch, executives]);

  const toggleExec = (id: string | number) => setSelectedExecIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const selectAllExecs = () => setSelectedExecIds(new Set(executives.map(e => e.id)));
  const clearExecs = () => setSelectedExecIds(new Set());

  // Normalize an owner row
  const normalizeOwnerRow = (row: any) => {
    const normalized: Record<string, any> = {};
    Object.keys(row || {}).forEach(k => { if (row[k] !== undefined && row[k] !== null && row[k] !== "") normalized[String(k).trim().toLowerCase()] = row[k]; });

    const owner: any = {
      salutation: ensureString(normalized["salutation"]),
      name: ensureString(normalized["name"]),
      phone: ensureString(normalized["phone"]),
      whatsapp: ensureString(normalized["whatsapp"]),
      email: ensureString(normalized["email"]),
      owner_dob: toISODate(normalized["owner_dob"]),
      state: ensureString(normalized["state"]),
      city: ensureString(normalized["city"]),
      location: ensureString(normalized["location"]),
      source: ensureString(normalized["lead source"] ?? normalized["source"]),
      stage: ensureString(normalized["lead stage"] ?? normalized["stage"]),
      leadType: ensureString(normalized["lead type"] ?? normalized["leadtype"]),
      priority: ensureString(normalized["priority"]),
      status: ensureString(normalized["status"]),
      notes: ensureString(normalized["notes"]),
    };
    // Clean undefined values
    Object.keys(owner).forEach(k => { if (owner[k] === undefined) delete owner[k]; });
    const rowErrors: string[] = [];
    if (!owner.name) rowErrors.push("Missing name");
    if (!owner.phone) rowErrors.push("Missing phone");
    if (owner.phone) {
      const p = toCanonicalPhone(owner.phone);
      owner.phone = p.display;
    }
    if (owner.whatsapp) {
      const w = toCanonicalPhone(owner.whatsapp);
      owner.whatsapp = w.display;
    }
    return { owner, rowErrors };
  };

  // Validate all rows and produce preview
  const filterValidOwnersWithPreview = (data: RawRow[]) => {
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();
    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];
    const previewRowsArr: PreviewRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      const { owner, rowErrors } = normalizeOwnerRow(row);
      if (rowErrors.length > 0) {
        skipped.push({ row: rowNum, reason: `Validation: ${rowErrors.join(", ")}`, data: row, errors: rowErrors });
        previewRowsArr.push({ rowNum, valid: false, reason: rowErrors.join(", "), data: row });
        return;
      }
      const phoneParsed = toCanonicalPhone(owner.phone);
      const phoneKey = phoneParsed.key;
      const email = (owner.email ? owner.email : "").toLowerCase();
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
      const phoneDigits = owner.phone.replace(/[^\d+]/g, "");
      const okPhone = /^\+91\d{10}$/.test(phoneDigits) || /^\+\d{10,15}$/.test(phoneDigits) || /^\d{10}$/.test(phoneDigits);
      if (!okPhone) {
        const reason = `Invalid phone format (${owner.phone})`;
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
      validData.push(owner);
      previewRowsArr.push({ rowNum, valid: true, reason: "Valid", data: row, normalizedData: owner });
      seenPhoneKeys.add(phoneKey);
      if (email) seenEmails.add(email);
    });
    return { validData, nonDuplicateSkipped: skipped, localDuplicates, previewRows: previewRowsArr };
  };

  const processPreview = (rawData: RawRow[], source: string) => {
    setPreviewLoading(true);
    try {
      const { validData, nonDuplicateSkipped, localDuplicates, previewRows } = filterValidOwnersWithPreview(rawData);
      setValidPreviewData(validData);
      setPreviewSkipped(nonDuplicateSkipped);
      setPreviewDuplicates(localDuplicates);
      setPreviewRows(previewRows);
      setShowPreview(true);
      if (validData.length === 0) toast.warning(`No valid owners found in ${source}.`);
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
    if (validPreviewData.length === 0) { toast.error("No valid owners to import. Check preview."); return; }
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) { toast.error("Select at least one executive or choose 'None'."); return; }
    setIsUploading(true);
    try {
      const payload = applyAssignmentPolicy(validPreviewData);
      const res = await ownerAPI.importOwners(payload);
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
        toast.success(`Imported ${insertedCount} owner(s) successfully.`);
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
              <div><h2 className="text-sm font-bold text-white">Import Owners</h2><p className="text-[9px] text-white/70">Import owners from Excel files or Google Sheets</p></div>
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

                <button onClick={downloadOwnerTemplate} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: N }}><Download size={10} /> Download Template</button>
              </div>

              {/* Right Column - Assignment */}
              <div className="space-y-3">
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Users size={12} style={{ color: O }} /> Owner Assignment</h3>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
                      <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
                      <div className="flex-1"><p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p><p className="text-[8px]" style={{ color: MU }}>Owners not assigned to any executive</p></div>
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
                                <label key={e.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                                  <input type="checkbox" className="w-3 h-3 rounded" style={{ accentColor: O }} checked={selectedExecIds.has(e.id)} onChange={() => toggleExec(e.id)} />
                                  <span className="text-[9px]" style={{ color: N }}>{e.name}</span>
                                </label>
                              ))}
                            </div>
                            <div className="flex items-center justify-between p-1.5 border-t bg-gray-50">
                              <div className="flex gap-1"><button onClick={selectAllExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>All</button><button onClick={clearExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>Clear</button></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg p-2.5" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                  <div className="flex items-start gap-1.5"><AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} /><div><p className="text-[9px] font-medium mb-0.5" style={{ color: N }}>Required fields:</p><div className="flex gap-1.5"><span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Name*</span><span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Phone*</span></div></div></div>
                </div>

                {(skippedRows.length > 0 || previewSkipped.length > 0 || previewDuplicates.length > 0) && (
                  <button onClick={exportSkippedRows} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: O }}><FileWarning size={10} /> Export Error Report ({skippedRows.length || (previewSkipped.length + previewDuplicates.length)})</button>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                  <div className="flex items-center gap-1.5"><CheckCircle size={10} style={{ color: O }} /><span className="text-[9px] font-medium" style={{ color: N }}>{validPreviewData.length} owner(s) ready to import</span></div>
                  <div className="flex gap-2 text-[8px]"><span className="text-green-600">Valid: {validPreviewData.length}</span><span className="text-red-600">Issues: {previewSkipped.length + previewDuplicates.length}</span></div>
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
                        <th className="px-2 py-1 text-left font-semibold">Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className={row.valid ? "hover:bg-green-50" : "hover:bg-red-50"}>
                          <td className="px-2 py-1">{row.rowNum}</td>
                          <td className="px-2 py-1" style={{ color: row.valid ? "#2e7d32" : "#c62828" }}>{row.valid ? "✅ Valid" : `❌ ${row.reason?.substring(0, 30)}`}</td>
                          <td className="px-2 py-1">{row.normalizedData?.name || row.data?.Name || "-"}</td>
                          <td className="px-2 py-1">{row.normalizedData?.phone || row.data?.Phone || "-"}</td>
                          <td className="px-2 py-1">{row.normalizedData?.email || row.data?.Email || "-"}</td>
                          <td className="px-2 py-1">{row.normalizedData?.location || row.data?.Location || "-"}</td>
                          <td className="px-2 py-1">{row.normalizedData?.stage || row.data?.Stage || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewRows.length > 10 && <div className="p-2 text-center text-[8px]" style={{ color: MU }}>Showing first 10 of {previewRows.length} rows</div>}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
            <div className="flex items-center"><AlertCircle size={10} style={{ color: MU }} /><span className="text-[8px] ml-1" style={{ color: MU }}>Fields marked with * are required</span></div>
            <div className="flex items-center gap-2">
              <button onClick={handleClose} className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50" style={{ border: `1px solid ${BD}`, color: N }}>Cancel</button>
              <button onClick={executeImport} disabled={validPreviewData.length === 0 || isUploading || previewLoading} className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1" style={{ background: O }}>
                {isUploading ? <><Loader2 size={10} className="animate-spin" /> Importing...</> : <><Upload size={10} /> Import Owners ({validPreviewData.length})</>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} duplicates={duplicates} skippedRows={skippedRows} updatedRows={updatedRows} onExport={exportSkippedRows} />
    </>
  );
}
