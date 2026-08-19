import React, { useEffect, useState, ChangeEvent, useCallback, useRef } from "react";
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

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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

const ensureString = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  return String(v).trim();
};

const toISODate = (v: any): string | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return undefined;
};

const renderCell = (v: any) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return String(v);
};

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
          <div><h4 className="font-semibold text-purple-700 mb-2">Duplicates</h4><div className="max-h-60 overflow-auto border rounded"><table className="w-full text-xs text-left"><thead className="bg-purple-50 sticky top-0"><tr><th className="p-2">Row</th><th className="p-2">Reason</th>{allKeys.map(k => <th className="p-2" key={k}>{k}</th>)}</tr></thead><tbody>{duplicates.map((row: any, i: number) => (<tr key={i} className="border-b"><td>{row.row}</td><td>{row.reason}</td>{allKeys.map(k => <td>{renderCell(row.data?.[k])}</td>)}</tr>))}</tbody></table></div></div>
        )}
        {skippedRows.length > 0 && (
          <div><h4 className="font-semibold text-red-700 mb-2">Skipped</h4><div className="max-h-60 overflow-auto border rounded"><table className="w-full text-xs text-left"><thead className="bg-red-50 sticky top-0"><tr><th className="p-2">Row</th><th className="p-2">Reason</th>{allKeys.map(k => <th className="p-2" key={k}>{k}</th>)}</tr></thead><tbody>{skippedRows.map((row: any, i: number) => (<tr key={i} className="border-b"><td>{row.row}</td><td>{row.reason}</td>{allKeys.map(k => <td>{renderCell(row.data?.[k])}</td>)}</tr>))}</tbody></table></div></div>
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

const downloadOwnerTemplate = () => {
  const headers = [
    "Salutation", "Name", "Phone", "WhatsApp", "Email", "Owner DOB",
    "State", "City", "Location", "Lead Source", "Lead Stage",
    "Priority", "Status", "Notes"
  ];
  const sampleRows = [
    [
      "Mr.", "Amit Shah", "9876543210", "9876543210", "amit.shah@gmail.com", "1980-05-15",
      "Maharashtra", "Mumbai", "Bandra West", "Website", "Initial Contact",
      "High", "Active", "Rental property in skyline towers"
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Owners");
  XLSX.writeFile(wb, "import_owners_template.xlsx");
};

export const ImportOwnersModal: React.FC<ImportOwnersModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sheetDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Assignment states
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("none");
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedExecIds, setSelectedExecIds] = useState<Set<string | number>>(new Set());
  const [execSearch, setExecSearch] = useState("");
  const [execOpen, setExecOpen] = useState(false);

  // Preview / Analysis data
  const [showPreview, setShowPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [validPreviewData, setValidPreviewData] = useState<any[]>([]);
  const [previewSkipped, setPreviewSkipped] = useState<SkippedRow[]>([]);
  const [previewDuplicates, setPreviewDuplicates] = useState<DuplicateRow[]>([]);

  // Import Outcomes
  const [showSummary, setShowSummary] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);
  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [updatedRows, setUpdatedRows] = useState<UpdatedRow[]>([]);

  const onlyThisExecutive = isExecutiveUser(user);

  useEffect(() => {
    if (isOpen) {
      // Load executives
      const loadExecs = async () => {
        try {
          const res = await usersAPI.getSalesExecutives();
          const raw = Array.isArray(res) ? res : (res?.items || res?.data || []);
          setExecutives(raw.map((u: any) => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name
          })));
        } catch (err) {
          console.error(err);
        }
      };
      loadExecs();
    }
  }, [isOpen]);

  const handleClose = () => {
    setFile(null);
    setSheetUrl("");
    setShowPreview(false);
    setPreviewRows([]);
    setValidPreviewData([]);
    setSelectedExecIds(new Set());
    setAssignmentMode("none");
    onClose();
  };

  const cleanHeader = (h: string) => String(h || "").replace(/[^a-zA-Z]/g, "").toLowerCase();

  const parseRowToOwner = (row: RawRow) => {
    let mapping: Record<string, string> = {};
    Object.keys(row).forEach((k) => {
      const ck = cleanHeader(k);
      mapping[ck] = k;
    });

    const val = (canonicalKey: string) => {
      const origKey = mapping[canonicalKey];
      return origKey ? row[origKey] : undefined;
    };

    const name = ensureString(val("name"));
    const phoneRaw = val("phone");
    const { display: phone, key: phoneKey } = toCanonicalPhone(phoneRaw);
    const { display: whatsapp } = toCanonicalPhone(val("whatsapp") || phoneRaw);
    const email = ensureString(val("email"));

    return {
      salutation: ensureString(val("salutation")) || "Mr.",
      name,
      phone,
      phoneKey,
      whatsapp,
      email,
      state: ensureString(val("state")),
      city: ensureString(val("city")),
      location: ensureString(val("location")),
      source: ensureString(val("leadsource") || val("source")) || "Excel Import",
      stage: ensureString(val("leadstage") || val("stage")) || "initial_contact",
      priority: ensureString(val("priority")) || "medium",
      status: ensureString(val("status")) || "active",
      notes: ensureString(val("notes") || val("remark") || val("notesremarks")),
    };
  };

  const filterValidOwnersWithPreview = (rawData: RawRow[]) => {
    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];
    const previewRowsArr: PreviewRow[] = [];
    
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();

    rawData.forEach((row, i) => {
      const rowNum = i + 1;
      const owner = parseRowToOwner(row);

      if (!owner.name) {
        skipped.push({ row: rowNum, reason: "Name is empty", data: row });
        previewRowsArr.push({ rowNum, valid: false, reason: "Missing Name", data: row });
        return;
      }
      if (!owner.phoneKey) {
        skipped.push({ row: rowNum, reason: "Phone is empty", data: row });
        previewRowsArr.push({ rowNum, valid: false, reason: "Missing Phone", data: row });
        return;
      }

      const { phoneKey, email } = owner;

      if (seenPhoneKeys.has(phoneKey)) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate phone in file", data: row, duplicateFields: ["phone"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate phone", data: row });
        return;
      }
      if (email && seenEmails.has(email)) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate email in file", data: row, duplicateFields: ["email"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate email", data: row });
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
    } catch (err) {
      console.error(err);
      toast.error(`Error processing ${source}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const autoPreviewFile = useCallback(async (selectedFile: File) => {
    setPreviewLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const result = evt.target?.result;
          if (!result) return;
          let wb: any;
          if (selectedFile.name.endsWith(".csv")) wb = XLSX.read(result as string, { type: "string", raw: true });
          else wb = XLSX.read(result as ArrayBuffer, { type: "array", raw: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
          processPreview(data, "file");
        } catch (e) {
          toast.error("Error parsing file");
        } finally {
          setPreviewLoading(false);
        }
      };
      if (selectedFile.name.endsWith(".csv")) reader.readAsText(selectedFile);
      else reader.readAsArrayBuffer(selectedFile);
    } catch (e) {
      toast.error("Error reading file");
      setPreviewLoading(false);
    }
  }, []);

  const autoPreviewSheet = useCallback(async (url: string) => {
    if (!url.trim()) return;
    setPreviewLoading(true);
    try {
      const sheetIdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) { toast.error("Invalid Google Sheet URL"); setPreviewLoading(false); return; }
      const sheetId = sheetIdMatch[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(exportUrl);
      const csvText = await response.text();
      const wb = XLSX.read(csvText, { type: "string", raw: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
      processPreview(data, "Google Sheet");
    } catch (e) {
      toast.error("Error loading sheet");
      setPreviewLoading(false);
    }
  }, []);

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    autoPreviewFile(f);
  };

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

  const applyAssignmentPolicy = (rows: any[]): any[] => {
    if (onlyThisExecutive) {
      const selfId = (user as any)?.id || (user as any)?.userId;
      return rows.map(r => ({ ...r, assigned_to: selfId }));
    }
    if (assignmentMode === "none") return rows.map(r => ({ ...r, assigned_to: null }));
    const ids = Array.from(selectedExecIds);
    if (ids.length === 0) return rows.map(r => ({ ...r, assigned_to: null }));
    const n = ids.length;
    return rows.map((r, i) => ({ ...r, assigned_to: ids[i % n] }));
  };

  const executeImport = async () => {
    if (validPreviewData.length === 0) { toast.error("No valid owners to import."); return; }
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
      toast.error("Select at least one executive or choose 'None'.");
      return;
    }
    setIsUploading(true);
    try {
      const payload = applyAssignmentPolicy(validPreviewData);
      const res = await ownerAPI.importOwners(payload);
      if (res && res.success) {
        toast.success(`Successfully imported ${res.inserted || 0} owners!`);
        setDuplicates(previewDuplicates);
        setSkippedRows(previewSkipped);
        setShowSummary(true);
        if (onImportComplete) onImportComplete();
        handleClose();
      } else {
        toast.error(res?.message || "Import failed");
      }
    } catch (err) {
      toast.error("Bulk upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-xs" style={{ border: `1px solid ${BD}` }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between text-white" style={{ backgroundColor: N }}>
            <div className="flex items-center gap-1.5">
              <Upload size={16} className="text-orange-500" />
              <h3 className="font-bold">Import Owners Lead List</h3>
            </div>
            <button onClick={handleClose} className="hover:bg-white/10 p-1 rounded-full text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: BG }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload card */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-700">Source Document</h4>
                  <button onClick={downloadOwnerTemplate} className="text-[10px] font-bold text-[#e67e22] hover:underline flex items-center gap-1">
                    <Download size={11} /> Template
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet size={24} className="text-gray-400 mb-1" />
                  <p className="font-semibold text-gray-700">Excel / CSV File</p>
                  <p className="text-[9px] text-gray-500">{file ? file.name : "Click to select file"}</p>
                  <input type="file" ref={fileInputRef} onChange={onFileInputChange} accept=".csv, .xlsx, .xls" className="hidden" />
                </div>

                <div className="relative">
                  <Globe size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="Or enter public Google Sheets URL..."
                    className="w-full pl-7 pr-2 py-1 text-xs border rounded bg-white"
                  />
                </div>
              </div>

              {/* Assignment Policy card */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                <h4 className="font-bold text-gray-700">Lead Assignment Policy</h4>
                {onlyThisExecutive ? (
                  <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded p-2 text-[10px]">
                    Note: As an executive, all imported leads will be auto-assigned to you.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={assignmentMode === "none"} onChange={() => setAssignmentMode("none")} className="accent-orange-500" />
                        <span>Leave Unassigned</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={assignmentMode === "selected"} onChange={() => setAssignmentMode("selected")} className="accent-orange-500" />
                        <span>Round-Robin</span>
                      </label>
                    </div>

                    {assignmentMode === "selected" && (
                      <div className="relative">
                        <button onClick={() => setExecOpen(!execOpen)} className="w-full border rounded px-2.5 py-1 flex items-center justify-between bg-white text-left">
                          <span>{selectedExecIds.size} executives selected</span>
                          <ChevronDown size={14} />
                        </button>
                        {execOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto p-2 space-y-1.5 z-10">
                            {executives.map(e => {
                              const isChecked = selectedExecIds.has(e.id);
                              return (
                                <label key={e.id} className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const next = new Set(selectedExecIds);
                                      if (isChecked) next.delete(e.id); else next.add(e.id);
                                      setSelectedExecIds(next);
                                    }}
                                    className="accent-orange-500"
                                  />
                                  <span>{e.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Sheet Data list */}
            {previewLoading && (
              <div className="flex items-center justify-center gap-1.5 py-8 text-gray-500">
                <Loader2 size={16} className="animate-spin text-orange-500" />
                <span>Analyzing document data...</span>
              </div>
            )}

            {showPreview && !previewLoading && (
              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-700">Document Data Preview</h4>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-green-600 font-semibold">Valid: {validPreviewData.length}</span>
                    <span className="text-red-500 font-semibold">Errors: {previewSkipped.length}</span>
                    <span className="text-purple-600 font-semibold">Duplicates: {previewDuplicates.length}</span>
                  </div>
                </div>

                <div className="max-h-48 overflow-auto border rounded text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 border-b">
                      <tr>
                        <th className="p-1.5">Row</th>
                        <th className="p-1.5">Status</th>
                        <th className="p-1.5">Name</th>
                        <th className="p-1.5">Phone</th>
                        <th className="p-1.5">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(0, 10).map((r, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-1.5 font-bold text-gray-500">{r.rowNum}</td>
                          <td className="p-1.5">
                            <span className={`px-1.5 py-0.2 rounded-full font-bold ${r.valid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {r.valid ? "Valid" : r.reason}
                            </span>
                          </td>
                          <td className="p-1.5">{r.data.Name || r.data.name || "-"}</td>
                          <td className="p-1.5">{r.data.Phone || r.data.phone || "-"}</td>
                          <td className="p-1.5">{r.data.Email || r.data.email || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewRows.length > 10 && (
                    <div className="text-center p-1.5 text-gray-400 bg-gray-50 border-t">
                      And {previewRows.length - 10} more rows...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <AlertCircle size={12} className="text-orange-500" /> Ensure columns `Name` and `Phone` are filled.
            </span>
            <div className="flex gap-2">
              <button onClick={handleClose} className="px-3.5 py-1 text-xs font-semibold rounded border hover:bg-gray-100 text-gray-600">
                Cancel
              </button>
              <button
                onClick={executeImport}
                disabled={isUploading || validPreviewData.length === 0}
                className="flex items-center gap-1 px-4 py-1 text-xs font-semibold rounded text-white bg-[#0f2b3d] hover:opacity-90 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={13} className="text-green-400" />
                    <span>Start Import</span>
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
};

export default ImportOwnersModal;
