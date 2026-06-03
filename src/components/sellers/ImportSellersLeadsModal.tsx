


// // ImportSellersModal.tsx — redesigned with ESALE theme
// import React, { useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
// import Modal from "@/components/ui/Modal";
// import Button from "@/components/ui/Button";
// import * as XLSXRaw from "xlsx-js-style";
// import { usersAPI } from "@/lib/api";
// import { toast } from "react-toastify";
// import { useAuth } from "@/contexts/AuthContext";
// import { getAssignableExecutives } from "@/utils/roleBasedOptions";
// import { Upload, X, Download, AlertCircle, CheckCircle, FileWarning, FileSpreadsheet, Globe, Users, UserCheck, Loader2, ChevronDown, Search } from "lucide-react";
// import { sellerAPI } from "@/lib/sellersAPI";

// const XLSX = XLSXRaw as any;

// // ESALE Theme Colors
// const N = "#0f2b3d";
// const O = "#e67e22";
// const BG = "#f8fafc";
// const BD = "#e2e8f0";
// const MU = "#5a7184";

// /* ============================ Types ============================ */
// type RawRow = Record<string, any>;

// type SkippedRow = {
//   row: number;
//   reason: string;
//   data: RawRow;
//   errors?: string[];
// };

// type UpdatedRow = {
//   row?: number;
//   id?: string | number;
//   note?: string;
//   data: RawRow;
//   assigned_executive?: string | number;
// };

// type DuplicateRow = {
//   row?: number;
//   reason: string;
//   data: RawRow;
//   duplicateFields?: string[];
//   existingId?: string | number;
// };

// type SummaryModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   title?: string;
//   duplicates: DuplicateRow[];
//   skippedRows: SkippedRow[];
//   updatedRows: UpdatedRow[];
// };

// type ImportSellersModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// type Executive = {
//   id: string | number;
//   name: string;
//   email?: string;
//   username?: string;
// };

// type AssignmentMode = "none" | "selected";

// // Form Field Component (matching BuyerFormModal style)
// const FormField: React.FC<{
//   label: string;
//   required?: boolean;
//   children: React.ReactNode;
//   icon?: React.ReactNode;
//   error?: string;
// }> = ({ label, required, children, icon, error }) => (
//   <div className="space-y-0.5">
//     <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
//       {icon && <span style={{ color: O }}>{icon}</span>}
//       {label}
//       {required && <span className="text-red-500">*</span>}
//     </label>
//     {children}
//     {error && <p className="text-red-500 text-[8px] mt-0.5">{error}</p>}
//   </div>
// );

// /* ======================= Utility / Helpers ===================== */

// const getRoleString = (u: any): string => {
//   const r =
//     u?.role ||
//     u?.roles ||
//     u?.raw?.role ||
//     u?.raw?.roles ||
//     u?.user?.role ||
//     u?.user?.roles ||
//     "";
//   return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
// };

// const isExecutiveUser = (u: any): boolean => {
//   const rs = getRoleString(u);
//   return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
// };

// // Phone number normalization
// const toCanonicalPhone = (raw: any): { display: string; key: string } => {
//   if (raw === null || raw === undefined || String(raw).trim() === "") {
//     return { display: "", key: "" };
//   }
//   let phoneStr = String(raw).trim();

//   if (/e\+\d+$/i.test(phoneStr)) {
//     const n = Number(phoneStr);
//     if (!isNaN(n)) phoneStr = Math.round(n).toString();
//   }

//   phoneStr = phoneStr.replace(/[^\d+]/g, "");
//   phoneStr = phoneStr.replace(/^0+/, "");

//   const justDigits = phoneStr.replace(/[^\d]/g, "");
//   if (/^\+?91\d{10}$/.test(phoneStr) || /^91\d{10}$/.test(phoneStr) || /^\d{10}$/.test(justDigits)) {
//     const last10 = justDigits.slice(-10);
//     return { display: `+91${last10}`, key: last10 };
//   }
//   return { display: phoneStr.startsWith("+") ? phoneStr : `+${phoneStr}`, key: justDigits };
// };

// const safeJsonParse = (v: any) => {
//   if (v === undefined || v === null || v === "") return undefined;
//   if (typeof v === "object") return v;

//   let s = String(v).trim();
//   if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
//     s = s.slice(1, -1).trim();
//   }
//   s = s.replace(/\\"/g, '"').replace(/\\'/g, "'");

//   try {
//     return JSON.parse(s);
//   } catch {
//     if (s.includes(",") && !s.includes("{") && !s.includes("[")) {
//       return s.split(",").map((p: string) => p.trim()).filter(Boolean);
//     }
//     return s;
//   }
// };

// const toNumber = (v: any): number | undefined => {
//   if (v === undefined || v === null || v === "") return undefined;
//   const cleaned = String(v).replace(/[^\d.-]/g, "");
//   const n = Number(cleaned);
//   return Number.isFinite(n) && !isNaN(n) ? n : undefined;
// };

// const toBoolean = (v: any): boolean | undefined => {
//   if (v === undefined || v === null || v === "") return undefined;
//   const str = String(v).toLowerCase().trim();
//   if (str === "true" || str === "yes" || str === "1") return true;
//   if (str === "false" || str === "no" || str === "0") return false;
//   return undefined;
// };

// const ensureArray = (v: any): string[] => {
//   if (v === undefined || v === null) return [];
//   if (Array.isArray(v)) return v.map((item) => String(item).trim()).filter(Boolean);
//   if (typeof v === "string") {
//     return v
//       .split(/[|,]/)
//       .map((s: string) => s.trim())
//       .filter(Boolean);
//   }
//   return [String(v).trim()];
// };

// const ensureString = (v: any): string | undefined => {
//   if (v === undefined || v === null || v === "") return undefined;
//   return String(v).trim();
// };

// const parseDate = (v: any): string | undefined => {
//   if (v === undefined || v === null || v === "") return undefined;
//   if (v instanceof Date) {
//     return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate())).toISOString().split("T")[0];
//   }
//   const str = String(v).trim();
//   if (/^\d+$/.test(str)) {
//     const excelDate = Number(str);
//     if (excelDate > 25569) {
//       const ms = (excelDate - 25569) * 86400 * 1000;
//       const date = new Date(ms);
//       return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
//         .toISOString()
//         .split("T")[0];
//     }
//   }
//   const d = new Date(str);
//   if (!isNaN(d.getTime())) {
//     return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().split("T")[0];
//   }
//   const formats = [
//     /(\d{4})-(\d{1,2})-(\d{1,2})/,
//     /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
//     /(\d{1,2})-(\d{1,2})-(\d{4})/,
//   ];
//   for (const format of formats) {
//     const match = str.match(format);
//     if (match) {
//       let year: string, month: string, day: string;
//       if (format === formats[0]) [, year, month, day] = match;
//       else if (format === formats[1]) [, month, day, year] = match;
//       else [, day, month, year] = match;
//       month = month.padStart(2, "0");
//       day = day.padStart(2, "0");
//       return `${year}-${month}-${day}`;
//     }
//   }
//   return undefined;
// };

// /* ========================== Summary Modal ========================== */

// function SummaryModal({
//   isOpen,
//   onClose,
//   title = "Import Summary",
//   duplicates,
//   skippedRows,
//   updatedRows,
// }: SummaryModalProps) {
//   if (!isOpen) return null;

//   const keySet = new Set<string>();
//   [...duplicates.map((r) => r.data), ...skippedRows.map((r) => r.data), ...updatedRows.map((r) => r.data)].forEach(
//     (row) => {
//       Object.entries(row || {}).forEach(([k, v]) => {
//         if (v !== null && v !== undefined && String(v).trim() !== "") keySet.add(k);
//       });
//     }
//   );
//   const allKeys = Array.from(keySet);

//   const totalIssues = duplicates.length + skippedRows.length;
//   const hasIssues = totalIssues > 0;

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title={title} width="max-w-6xl">
//       <div className="p-5 space-y-5">
//         {/* Summary Header */}
//         <div className={`rounded-xl p-3 ${hasIssues ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
//           <div className="flex items-center gap-2">
//             {hasIssues ? <FileWarning size={16} className="text-amber-600" /> : <CheckCircle size={16} className="text-green-600" />}
//             <div>
//               <h3 className={`text-xs font-semibold ${hasIssues ? 'text-amber-800' : 'text-green-800'}`}>
//                 {hasIssues ? 'Import Completed with Issues' : 'Import Completed Successfully'}
//               </h3>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-3 mt-2 pt-1.5 border-t border-amber-200/50">
//             <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle size={12} className="text-green-600" /></div><div><p className="text-[9px] text-gray-500">Imported</p><p className="text-xs font-bold text-green-600">{updatedRows.length > 0 ? updatedRows.length : (duplicates.length === 0 && skippedRows.length === 0 ? "All" : "0")}</p></div></div>
//             {duplicates.length > 0 && (<div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center"><FileWarning size={12} className="text-purple-600" /></div><div><p className="text-[9px] text-gray-500">Duplicates</p><p className="text-xs font-bold text-purple-600">{duplicates.length}</p></div></div>)}
//             {skippedRows.length > 0 && (<div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle size={12} className="text-red-600" /></div><div><p className="text-[9px] text-gray-500">Skipped</p><p className="text-xs font-bold text-red-600">{skippedRows.length}</p></div></div>)}
//             {updatedRows.length > 0 && (<div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center"><CheckCircle size={12} className="text-blue-600" /></div><div><p className="text-[9px] text-gray-500">Updated</p><p className="text-xs font-bold text-blue-600">{updatedRows.length}</p></div></div>)}
//           </div>
//         </div>

//         {/* Duplicates Section */}
//         {duplicates.length > 0 && (
//           <div>
//             <div className="flex items-center gap-1.5 mb-2"><div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center"><FileWarning size={10} className="text-purple-600" /></div><h4 className="text-xs font-semibold text-purple-700">Duplicate Records</h4><span className="text-[9px] text-purple-500 bg-purple-100 px-1.5 py-0.5 rounded-full">{duplicates.length}</span></div>
//             <div className="max-h-[220px] overflow-auto border rounded-lg">
//               <table className="w-full text-[10px] border-collapse">
//                 <thead className="bg-purple-50 sticky top-0">
//                   <tr><th className="border border-purple-200 px-2 py-1">Row</th><th className="border border-purple-200 px-2 py-1">Duplicate Fields</th><th className="border border-purple-200 px-2 py-1">Existing ID</th><th className="border border-purple-200 px-2 py-1">Reason</th>{allKeys.map(key => <th key={key} className="border border-purple-200 px-2 py-1">{key}</th>)}</tr>
//                 </thead>
//                 <tbody>
//                   {duplicates.slice(0, 15).map((row, idx) => (
//                     <tr key={idx} className="hover:bg-purple-50/30">
//                       <td className="border border-purple-100 px-2 py-1 text-center">{row.row ?? "-"}</td>
//                       <td className="border border-purple-100 px-2 py-1">{row.duplicateFields?.length ? row.duplicateFields.join(", ") : "-"}</td>
//                       <td className="border border-purple-100 px-2 py-1 text-center">{row.existingId ?? "-"}</td>
//                       <td className="border border-purple-100 px-2 py-1 text-purple-700">{row.reason}</td>
//                       {allKeys.map(key => <td key={key} className="border border-purple-100 px-2 py-1">{row.data?.[key] && String(row.data[key]).trim() !== "" ? String(row.data[key]).slice(0, 30) : "-"}</td>)}
//                     </tr>
//                   ))}
//                   {duplicates.length > 15 && <tr><td colSpan={4 + allKeys.length} className="text-center py-1 text-[9px] text-gray-500">+{duplicates.length - 15} more</td></tr>}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Skipped Rows Section */}
//         {skippedRows.length > 0 && (
//           <div>
//             <div className="flex items-center gap-1.5 mb-2"><div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle size={10} className="text-red-600" /></div><h4 className="text-xs font-semibold text-red-700">Skipped Records</h4><span className="text-[9px] text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">{skippedRows.length}</span></div>
//             <div className="max-h-[220px] overflow-auto border rounded-lg">
//               <table className="w-full text-[10px] border-collapse">
//                 <thead className="bg-red-50 sticky top-0">
//                   <tr><th className="border border-red-200 px-2 py-1">Row</th><th className="border border-red-200 px-2 py-1">Reason</th>{allKeys.map(key => <th key={key} className="border border-red-200 px-2 py-1">{key}</th>)}</tr>
//                 </thead>
//                 <tbody>
//                   {skippedRows.slice(0, 15).map((row, idx) => (
//                     <tr key={idx} className="hover:bg-red-50/30">
//                       <td className="border border-red-100 px-2 py-1 text-center">{row.row}</td>
//                       <td className="border border-red-100 px-2 py-1 text-red-600"><span className="bg-red-100 px-1.5 py-0.5 rounded text-[9px]">{row.reason}</span></td>
//                       {allKeys.map(key => <td key={key} className="border border-red-100 px-2 py-1">{row.data?.[key] && String(row.data[key]).trim() !== "" ? String(row.data[key]).slice(0, 30) : "-"}</td>)}
//                     </tr>
//                   ))}
//                   {skippedRows.length > 15 && <tr><td colSpan={2 + allKeys.length} className="text-center py-1 text-[9px] text-gray-500">+{skippedRows.length - 15} more</td></tr>}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Updated Rows Section */}
//         {updatedRows.length > 0 && (
//           <div>
//             <div className="flex items-center gap-1.5 mb-2"><div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"><CheckCircle size={10} className="text-blue-600" /></div><h4 className="text-xs font-semibold text-blue-700">Updated Records</h4><span className="text-[9px] text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-full">{updatedRows.length}</span></div>
//             <div className="max-h-[220px] overflow-auto border rounded-lg">
//               <table className="w-full text-[10px] border-collapse">
//                 <thead className="bg-blue-50 sticky top-0">
//                   <tr><th className="border border-blue-200 px-2 py-1">Row</th><th className="border border-blue-200 px-2 py-1">ID</th><th className="border border-blue-200 px-2 py-1">Note</th>{allKeys.map(key => <th key={key} className="border border-blue-200 px-2 py-1">{key}</th>)}</tr>
//                 </thead>
//                 <tbody>
//                   {updatedRows.slice(0, 15).map((row, idx) => (
//                     <tr key={idx} className="hover:bg-blue-50/30">
//                       <td className="border border-blue-100 px-2 py-1 text-center">{row.row ?? "-"}</td>
//                       <td className="border border-blue-100 px-2 py-1 text-center">{row.id ?? "-"}</td>
//                       <td className="border border-blue-100 px-2 py-1 text-blue-700">{row.note || "Updated"}</td>
//                       {allKeys.map(key => <td key={key} className="border border-blue-100 px-2 py-1">{row.data?.[key] && String(row.data[key]).trim() !== "" ? String(row.data[key]).slice(0, 30) : "-"}</td>)}
//                     </tr>
//                   ))}
//                   {updatedRows.length > 15 && <tr><td colSpan={3 + allKeys.length} className="text-center py-1 text-[9px] text-gray-500">+{updatedRows.length - 15} more</td></tr>}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         <div className="flex justify-end pt-1"><Button variant="outline" onClick={onClose} className="px-4 py-1.5 text-xs rounded-lg border-gray-300">Close Summary</Button></div>
//       </div>
//     </Modal>
//   );
// }

// /* ====================== Template Download (xlsx) ====================== */

// const downloadSellerTemplate = () => {
//   const data = [
//     ["salutation", "name", "phone", "whatsapp", "email", "state", "city", "location", "countryCode", "stage", "leadType", "priority", "status", "source", "notes", "seller_dob"],
//     ["Mr", "Rajesh Kumar", "9876543210", "9876543210", "rajesh.kumar@gmail.com", "Maharashtra", "Mumbai", "Bandra West", "IN", "New Lead", "Seller Lead", "High", "Active", "Website", "Interested in selling 2BHK apartment", "1985-03-15"],
//   ];

//   const ws = XLSX.utils.aoa_to_sheet(data);
//   const mandatoryCols = [0, 1, 2];
//   mandatoryCols.forEach((c: number) => {
//     const addr = XLSX.utils.encode_cell({ r: 0, c });
//     if (!ws[addr]) return;
//     (ws as any)[addr].s = { font: { color: { rgb: "FF0000" }, bold: true }, alignment: { horizontal: "center", vertical: "center" } };
//   });
//   for (let c = 3; c < data[0].length; c++) {
//     const addr = XLSX.utils.encode_cell({ r: 0, c });
//     if (ws[addr]) (ws as any)[addr].s = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } };
//   }
//   for (let r = 1; r < data.length; r++) {
//     for (let c = 0; c < data[r].length; c++) {
//       const addr = XLSX.utils.encode_cell({ r, c });
//       if (ws[addr]) (ws as any)[addr].s = { alignment: { horizontal: "left", vertical: "center" } };
//     }
//   }
//   (ws as any)["!cols"] = [12, 20, 15, 15, 25, 12, 12, 16, 10, 12, 12, 10, 10, 12, 20, 12].map((width) => ({ width }));
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Sellers Template");
//   XLSX.writeFile(wb, "Sellers_Import_Template.xlsx");
// };

// /* ============================== Component ============================== */

// export default function ImportSellersModal({ isOpen, onClose }: ImportSellersModalProps) {
//   const { user } = useAuth() as any;

//   const [file, setFile] = useState<File | null>(null);
//   const [sheetUrl, setSheetUrl] = useState<string>("");
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [dragActive, setDragActive] = useState<boolean>(false);
//   const [validationErrors, setValidationErrors] = useState<string[]>([]);

//   const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
//   const [updatedRows, setUpdatedRows] = useState<UpdatedRow[]>([]);
//   const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);
//   const [showSummary, setShowSummary] = useState<boolean>(false);

//   const [execsLoading, setExecsLoading] = useState<boolean>(false);
//   const [executives, setExecutives] = useState<Executive[]>([]);
//   const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
//   const [execSearch, setExecSearch] = useState<string>("");
//   const [selectedExecIds, setSelectedExecIds] = useState<Set<string | number>>(new Set());
//   const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("none");

//   const onlyThisExecutive = isExecutiveUser(user);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     function onDocClick(e: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setExecDropdownOpen(false);
//     }
//     if (execDropdownOpen) document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, [execDropdownOpen]);

//   useEffect(() => {
//     if (!isOpen) return;
//     (async () => {
//       try {
//         setExecsLoading(true);
//         const formatName = (u: any) => {
//           const salutation = u?.salutation ? `${u.salutation} ` : "";
//           const firstName = u?.first_name || "";
//           const lastName = u?.last_name || "";
//           const usernameFallback = u?.username || u?.email || "Executive";
//           const name = `${salutation}${firstName} ${lastName}`.trim();
//           return name || usernameFallback;
//         };

//         if (onlyThisExecutive) {
//           const selfId = user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
//           const selfName = formatName(user);
//           const me: Executive = { id: selfId, name: selfName, email: user?.email, username: user?.username };
//           setExecutives([me]);
//           setSelectedExecIds(new Set([selfId]));
//           setAssignmentMode("selected");
//           return;
//         }

//         const get = async (department: string) => usersAPI.getByDeptRole?.({ department, role: "executive", is_active: 1, limit: 100 });
//         let res: any;
//         try { res = await get("presales"); } catch { res = await get("pre-sales"); }

//         const salesUsers = (res?.items ?? res?.data ?? res ?? []).map((u: any) => ({
//           ...u,
//           id: u.id ?? u.userId ?? u._id ?? u.uuid ?? String(u.email || u.username || Math.random()),
//           name: formatName(u),
//         }));

//         const allowed = getAssignableExecutives(user, salesUsers) || [];
//         const mapped: Executive[] = allowed.map((u: any) => ({ id: u.id, name: u.name, email: u.email, username: u.raw?.username || u.username }));
//         setExecutives(mapped);
//       } catch (e) {
//         console.error(e);
//         toast.error("Could not fetch executives");
//       } finally {
//         setExecsLoading(false);
//       }
//     })();
//   }, [isOpen, user, onlyThisExecutive]);

//   const filteredExecutives = useMemo(() => {
//     if (!execSearch.trim()) return executives;
//     const s = execSearch.toLowerCase();
//     return executives.filter(e => String(e.name || "").toLowerCase().includes(s) || String(e.email || "").toLowerCase().includes(s) || String(e.username || "").toLowerCase().includes(s));
//   }, [execSearch, executives]);

//   const toggleExec = (id: string | number) => {
//     setSelectedExecIds((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };
//   const selectAllExecs = () => setSelectedExecIds(new Set(executives.map((e) => e.id)));
//   const clearExecs = () => setSelectedExecIds(new Set());

//   const isDuplicateReason = (reason: string) => /duplicate/i.test(reason || "");
//   const guessDuplicateFields = (reason: string, data: RawRow): string[] => {
//     const fields: string[] = [];
//     const lower = (reason || "").toLowerCase();
//     if (lower.includes("phone")) fields.push("phone");
//     if (lower.includes("email")) fields.push("email");
//     if (fields.length === 0) {
//       if (data["phone*"] || data["phone"] || data["Phone"]) fields.push("phone");
//       if (data["email"] || data["Email"]) fields.push("email");
//     }
//     return Array.from(new Set(fields));
//   };

//   const normalizeSellerRow = (row: any, _rowIndex: number) => {
//     const normalized: Record<string, any> = {};
//     Object.keys(row || {}).forEach((k) => {
//       if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
//         normalized[String(k).trim().toLowerCase()] = row[k];
//       }
//     });

//     const seller: any = {
//       salutation: ensureString(normalized["salutation"]),
//       name: ensureString(normalized["name"]),
//       phone: ensureString(normalized["phone"]),
//       whatsapp: ensureString(normalized["whatsapp"]),
//       email: ensureString(normalized["email"]),
//       state: ensureString(normalized["state"]),
//       city: ensureString(normalized["city"]),
//       location: ensureString(normalized["location"]),
//       countrycode: ensureString(normalized["countrycode"] ?? normalized["country"]),
//       stage: ensureString(normalized["stage"]),
//       leadtype: ensureString(normalized["leadtype"] ?? normalized["lead_type"]),
//       priority: ensureString(normalized["priority"]),
//       status: ensureString(normalized["status"]),
//       source: ensureString(normalized["source"]),
//       notes: ensureString(normalized["notes"]),
//       seller_dob: parseDate(normalized["seller_dob"] ?? normalized["dob"]),
//       expected_close: parseDate(normalized["expected_close"]),
//       last_activity: parseDate(normalized["last_activity"]),
//       lead_score: toNumber(normalized["lead_score"]),
//       deal_value: toNumber(normalized["deal_value"]),
//       visits: toNumber(normalized["visits"]),
//       total_visits: toNumber(normalized["total_visits"]),
//       stage_progress: toNumber(normalized["stage_progress"]),
//       deal_potential: ensureString(normalized["deal_potential"]),
//       response_rate: toNumber(normalized["response_rate"]),
//       avg_response_time: toNumber(normalized["avg_response_time"]),
//     };

//     const cleanSeller = Object.keys(seller).reduce((acc, key) => {
//       if (seller[key] !== undefined && seller[key] !== null && seller[key] !== "") acc[key] = seller[key];
//       return acc;
//     }, {} as any);

//     const rowErrors: string[] = [];
//     if (!cleanSeller.salutation) rowErrors.push("Missing salutation");
//     if (!cleanSeller.name) rowErrors.push("Missing name");
//     if (!cleanSeller.phone) rowErrors.push("Missing phone");

//     if (cleanSeller.phone) {
//       const p = toCanonicalPhone(cleanSeller.phone);
//       cleanSeller.phone = p.display;
//     }
//     if (cleanSeller.whatsapp) {
//       const w = toCanonicalPhone(cleanSeller.whatsapp);
//       cleanSeller.whatsapp = w.display;
//     }

//     cleanSeller.is_active = cleanSeller.is_active !== undefined ? toBoolean(cleanSeller.is_active) : true;

//     return { seller: cleanSeller, rowErrors };
//   };

//   const filterValidSellers = (data: RawRow[]) => {
//     const seenPhoneKeys = new Set<string>();
//     const seenEmails = new Set<string>();
//     const validData: any[] = [];
//     const skipped: SkippedRow[] = [];
//     const localDuplicates: DuplicateRow[] = [];

//     data.forEach((row, index) => {
//       const rowNum = index + 2;
//       const { seller, rowErrors } = normalizeSellerRow(row, index);
//       if (rowErrors.length > 0) {
//         skipped.push({ row: rowNum, reason: `Validation failed: ${rowErrors.join(", ")}`, data: row, errors: rowErrors });
//         return;
//       }

//       const phoneParsed = toCanonicalPhone(seller.phone);
//       const phoneKey = phoneParsed.key;
//       const email = (seller.email ? String(seller.email) : "").toLowerCase();

//       if (phoneKey && seenPhoneKeys.has(phoneKey)) {
//         localDuplicates.push({ row: rowNum, reason: "Duplicate in file (phone)", data: row, duplicateFields: ["phone"] });
//         return;
//       }
//       if (email && seenEmails.has(email)) {
//         localDuplicates.push({ row: rowNum, reason: "Duplicate in file (email)", data: row, duplicateFields: ["email"] });
//         return;
//       }

//       const phoneDigits = seller.phone.replace(/[^\d+]/g, "");
//       const okPhone = /^\+91\d{10}$/.test(phoneDigits) || /^\+\d{10,15}$/.test(phoneDigits);
//       if (!okPhone) {
//         skipped.push({ row: rowNum, reason: `Invalid phone format (${seller.phone})`, data: row });
//         return;
//       }

//       if (email) {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//           skipped.push({ row: rowNum, reason: "Invalid email format", data: row });
//           return;
//         }
//       }

//       validData.push(seller);
//       seenPhoneKeys.add(phoneKey);
//       if (email) seenEmails.add(email);
//     });

//     return { validData, nonDuplicateSkipped: skipped, localDuplicates };
//   };

//   const applyAssignmentPolicy = (rows: any[]): any[] => {
//     const withAssignment = (assignedId: any, r: any) => ({ ...r, assigned_to: assignedId ?? "", assigned_executive: assignedId ?? "" });
//     if (onlyThisExecutive) {
//       const selfId = user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
//       return rows.map((r) => withAssignment(selfId, r));
//     }
//     if (assignmentMode === "none") return rows.map((r) => withAssignment("", r));
//     const ids = Array.from(selectedExecIds);
//     if (ids.length === 0) return rows.map((r) => withAssignment("", r));
//     const n = ids.length;
//     return rows.map((r, i) => withAssignment(ids[i % n], r));
//   };

//   const callImportAPI = async (payloadRows: any[]) => {
//     const filtered = payloadRows.filter((o) => o && Object.keys(o).length > 0 && o.name && o.phone);
//     if (filtered.length === 0) throw new Error("Nothing to import after filtering");
//     try {
//       return await (sellerAPI as any).importSellers(filtered);
//     } catch {
//       try {
//         return await (sellerAPI as any).importSellers({ sellers: filtered });
//       } catch {
//         try {
//           return await (sellerAPI as any).importSellers({ data: filtered });
//         } catch (err3) {
//           throw err3;
//         }
//       }
//     }
//   };

//   const processAndSend = async (data: RawRow[], sourceLabel: string) => {
//     setDuplicates([]);
//     setSkippedRows([]);
//     setUpdatedRows([]);
//     setShowSummary(false);
//     setValidationErrors([]);

//     const { validData, nonDuplicateSkipped, localDuplicates } = filterValidSellers(data);

//     if (validData.length === 0) {
//       setSkippedRows(nonDuplicateSkipped);
//       setDuplicates(localDuplicates);
//       setUpdatedRows([]);
//       const errs = nonDuplicateSkipped.flatMap((r) => r.errors ?? [r.reason]);
//       setValidationErrors(errs);
//       setShowSummary(true);
//       if (localDuplicates.length === 0) toast.error(`No valid sellers found in the ${sourceLabel}`);
//       return;
//     }

//     const payload = applyAssignmentPolicy(validData);

//     let res: any;
//     try {
//       res = await callImportAPI(payload);
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err?.message || `Import failed from ${sourceLabel}`);
//       return;
//     }

//     const ok = res?.success === true || res?.ok === true || (typeof res?.status === "number" && res.status >= 200 && res.status < 300) || typeof res?.inserted !== "undefined" || Array.isArray(res?.insertedRows);

//     if (!ok) {
//       toast.error(res?.message || `Import failed from ${sourceLabel}`);
//       return;
//     }

//     const insertedRows: any[] = res?.insertedRows ?? res?.data?.insertedRows ?? res?.meta?.insertedRows ?? [];
//     const insertedCount = res?.inserted ?? res?.data?.inserted ?? res?.meta?.inserted ?? (Array.isArray(insertedRows) ? insertedRows.length : undefined) ?? payload.length;

//     const serverSkipped: any[] = res?.skippedRows ?? res?.data?.skippedRows ?? res?.meta?.skippedRows ?? [];
//     const serverUpdated: UpdatedRow[] = res?.updatedRows ?? res?.data?.updatedRows ?? res?.meta?.updatedRows ?? [];

//     const serverDuplicates: DuplicateRow[] = [];
//     const serverNonDupSkipped: SkippedRow[] = [];

//     if (Array.isArray(serverSkipped)) {
//       for (const item of serverSkipped) {
//         const reason = String(item?.reason || "");
//         const dataRow: RawRow = item?.data || item || {};
//         if (isDuplicateReason(reason)) {
//           serverDuplicates.push({ row: item?.row, reason: reason || "Duplicate in CRM", data: dataRow, duplicateFields: guessDuplicateFields(reason, dataRow), existingId: item?.id || item?.existingId });
//         } else {
//           serverNonDupSkipped.push({ row: item?.row ?? 0, reason: reason || "Skipped by server", data: dataRow });
//         }
//       }
//     }

//     const allDuplicates = [...localDuplicates, ...serverDuplicates];
//     const allSkipped = [...nonDuplicateSkipped, ...serverNonDupSkipped];

//     setDuplicates(allDuplicates);
//     setSkippedRows(allSkipped);
//     setUpdatedRows(serverUpdated || []);

//     if ((insertedCount ?? 0) > 0 && allDuplicates.length === 0 && allSkipped.length === 0) {
//       toast.success(`Imported ${insertedCount} seller(s) successfully.`);
//       if (typeof (sellerAPI as any).getSellers === "function") {
//         try { await (sellerAPI as any).getSellers(); } catch { }
//       }
//       resetAndClose();
//     } else {
//       const parts: string[] = [];
//       if ((insertedCount ?? 0) > 0) parts.push(`${insertedCount} imported`);
//       if (allDuplicates.length > 0) parts.push(`${allDuplicates.length} duplicate`);
//       if (allSkipped.length > 0) parts.push(`${allSkipped.length} skipped`);
//       toast.info(`Import summary: ${parts.join(" • ")}`);
//       const errs = allSkipped.flatMap((r) => r.errors ?? [r.reason]).filter(Boolean);
//       setValidationErrors(errs);
//       setShowSummary(true);
//     }
//   };

//   const handleFileImport = async () => {
//     if (!file) return toast.error("Please select an Excel/CSV file");
//     if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
//       return toast.error("Please select at least one executive or choose None.");
//     }
//     if (isUploading) return;
//     setIsUploading(true);

//     try {
//       const reader = new FileReader();
//       reader.onload = async (evt: ProgressEvent<FileReader>) => {
//         try {
//           const result = evt.target?.result;
//           if (!result) { toast.error("Failed to read file"); return; }

//           let wb: any;
//           const lower = file.name.toLowerCase();
//           if (lower.endsWith(".csv")) {
//             const csvText = typeof result === "string" ? result : String(result);
//             wb = XLSX.read(csvText, { type: "string", raw: true });
//           } else {
//             const buf = result as ArrayBuffer;
//             wb = XLSX.read(buf, { type: "array", raw: true });
//           }

//           const ws = wb.Sheets[wb.SheetNames[0]];
//           if (!ws) { toast.error("No sheet found in file"); return; }

//           const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
//           if (!data || data.length === 0) { toast.error("File appears to be empty"); return; }

//           await processAndSend(data, "file");
//         } catch (e) {
//           console.error(e);
//           toast.error("Error processing file. Please check the format.");
//         } finally {
//           setIsUploading(false);
//         }
//       };
//       const lower = file.name.toLowerCase();
//       if (lower.endsWith(".csv")) reader.readAsText(file);
//       else reader.readAsArrayBuffer(file);
//     } catch (e) {
//       console.error(e);
//       toast.error("Error reading file");
//       setIsUploading(false);
//     }
//   };

//   const handleGoogleSheetImport = async () => {
//     if (!sheetUrl.trim()) return toast.error("Please enter a Google Sheet URL");
//     if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
//       return toast.error("Please select at least one executive or choose None.");
//     }
//     if (isUploading) return;
//     setIsUploading(true);
//     const controller = new AbortController();
//     try {
//       const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
//       if (!sheetIdMatch) { toast.error("Invalid Google Sheet URL"); setIsUploading(false); return; }
//       const sheetId = sheetIdMatch[1];
//       const gidMatch = sheetUrl.match(/[?&]gid=(\d+)/);
//       const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";
//       const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
//       const response = await fetch(exportUrl, { signal: controller.signal });
//       if (!response.ok) {
//         toast.error(response.status === 403 ? "Sheet is not publicly accessible. Make it 'Anyone with link can view'." : "Failed to access Google Sheet.");
//         setIsUploading(false);
//         return;
//       }
//       const csvText = await response.text();
//       if (!csvText.trim()) { toast.error("Google Sheet appears to be empty"); setIsUploading(false); return; }
//       const wb = XLSX.read(csvText, { type: "string", raw: true });
//       const ws = wb.Sheets[wb.SheetNames[0]];
//       if (!ws) { toast.error("No sheet found in Google Sheet"); setIsUploading(false); return; }
//       const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
//       if (!data || data.length === 0) { toast.error("No data found in Google Sheet"); setIsUploading(false); return; }
//       await processAndSend(data, "Google Sheet");
//     } catch (e: any) {
//       if (e?.name !== "AbortError") { console.error(e); toast.error("Error processing Google Sheet"); }
//     } finally {
//       setIsUploading(false);
//       controller.abort();
//     }
//   };

//   const resetAndClose = () => {
//     setFile(null);
//     setSheetUrl("");
//     setSkippedRows([]);
//     setUpdatedRows([]);
//     setDuplicates([]);
//     setValidationErrors([]);
//     setShowSummary(false);
//     setIsUploading(false);
//     setDragActive(false);
//     onClose();
//   };

//   const handleClose = () => {
//     if (isUploading) { toast.info("Please wait for import to complete"); return; }
//     resetAndClose();
//   };

//   const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) return;
//     const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
//     if (!["csv", "xlsx", "xls"].includes(ext)) { toast.error("Please upload only Excel (.xlsx, .xls) or CSV files"); return; }
//     setFile(f);
//   };

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
//     if (e.type === "dragleave") setDragActive(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       const droppedFile = e.dataTransfer.files[0];
//       const ext = droppedFile.name.split(".").pop()?.toLowerCase() ?? "";
//       if (["csv", "xlsx", "xls"].includes(ext)) setFile(droppedFile);
//       else toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
//     }
//   };

//   const exportSkippedRows = () => {
//     if (!skippedRows.length) { toast.info("No skipped rows to export"); return; }
//     const headers = ["Row", "Errors", "Raw Data"];
//     const csvRows = skippedRows.map((r) => {
//       const errors = Array.isArray(r.errors) ? r.errors.join(" | ") : String(r.errors ?? r.reason ?? "");
//       const rawData = JSON.stringify(r.data ?? {}).replace(/"/g, '""');
//       return `"${r.row}","${errors}","${rawData}"`;
//     });
//     const csvContent = [headers.join(","), ...csvRows].join("\n");
//     const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `sellers_import_errors_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//     toast.success("📤 Error report exported successfully");
//   };

//   const formatCurrency = (amount?: number) => {
//     if (amount === undefined || amount === null || isNaN(amount as any)) return "—";
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${Number(amount).toLocaleString("en-IN")}`;
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }} onClick={handleClose}>
//         <div
//           className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
//           style={{ border: `1px solid ${BD}` }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header - matching BuyerFormModal style */}
//           <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between shrink-0" style={{ background: N }}>
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
//                 <Upload size={14} style={{ color: O }} />
//               </div>
//               <div>
//                 <h2 className="text-sm font-bold text-white">Import Sellers</h2>
//                 <p className="text-[9px] text-white/70">Import sellers from Excel files or Google Sheets</p>
//               </div>
//             </div>
//             <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
//               <X size={16} />
//             </button>
//           </div>

//           {/* Body */}
//           <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               {/* Left Column - Import Methods */}
//               <div className="space-y-3">
//                 {/* File Upload Card */}
//                 <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
//                   <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
//                     <FileSpreadsheet size={12} style={{ color: O }} /> Upload File
//                   </h3>
//                   <div
//                     className={`border-2 border-dashed rounded-lg p-3 text-center transition-all cursor-pointer ${
//                       dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 bg-white"
//                     }`}
//                     onDragEnter={handleDrag}
//                     onDragLeave={handleDrag}
//                     onDragOver={handleDrag}
//                     onDrop={handleDrop}
//                   >
//                     <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileInputChange} className="hidden" />
//                     <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
//                       {file ? (
//                         <div className="space-y-1">
//                           <CheckCircle size={16} className="mx-auto" style={{ color: O }} />
//                           <p className="text-[10px] font-medium truncate px-2" style={{ color: N }}>{file.name}</p>
//                           <p className="text-[8px]" style={{ color: MU }}>Click to change</p>
//                         </div>
//                       ) : (
//                         <div className="space-y-1">
//                           <Upload size={16} className="mx-auto" style={{ color: MU }} />
//                           <p className="text-[10px] font-medium" style={{ color: N }}>Drop file or click</p>
//                           <p className="text-[8px]" style={{ color: MU }}>Excel (.xlsx, .xls) or CSV</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleFileImport}
//                     disabled={!file || isUploading}
//                     className="mt-2 w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50"
//                     style={{ background: N }}
//                   >
//                     {isUploading ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" />Processing...</span> : "Import from File"}
//                   </button>
//                 </div>

//                 {/* Google Sheet Card */}
//                 <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
//                   <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
//                     <Globe size={12} style={{ color: O }} /> Google Sheets
//                   </h3>
//                   <input
//                     type="text"
//                     placeholder="https://docs.google.com/spreadsheets/..."
//                     value={sheetUrl}
//                     onChange={(e) => setSheetUrl(e.target.value)}
//                     className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white mb-2"
//                     style={{ borderColor: BD }}
//                   />
//                   <div className="rounded-lg p-2 mb-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
//                     <div className="flex items-start gap-1.5">
//                       <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} />
//                       <p className="text-[9px]" style={{ color: MU }}>Make sheet public: "Anyone with link can view"</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleGoogleSheetImport}
//                     disabled={!sheetUrl.trim() || isUploading}
//                     className="w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50"
//                     style={{ background: O }}
//                   >
//                     {isUploading ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" />Importing...</span> : "Import from Google Sheet"}
//                   </button>
//                 </div>

//                 {/* Download Template */}
//                 <button
//                   onClick={downloadSellerTemplate}
//                   className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1"
//                   style={{ borderColor: BD, color: N }}
//                 >
//                   <Download size={10} /> Download Template
//                 </button>
//               </div>

//               {/* Right Column - Assignment */}
//               <div className="space-y-3">
//                 <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
//                   <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
//                     <Users size={12} style={{ color: O }} /> Seller Assignment
//                   </h3>

//                   <div className="space-y-2">
//                     <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
//                       <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
//                       <div className="flex-1"><p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p><p className="text-[8px]" style={{ color: MU }}>Sellers not assigned to any executive</p></div>
//                     </label>

//                     <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "selected" || onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`}>
//                       <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "selected" || onlyThisExecutive} onChange={() => setAssignmentMode("selected")} disabled={onlyThisExecutive} />
//                       <div className="flex-1"><p className="text-[10px] font-medium" style={{ color: N }}>{onlyThisExecutive ? "Assigned to you" : "Assign to executives"}</p><p className="text-[8px]" style={{ color: MU }}>{onlyThisExecutive ? "Auto-assigned to you" : "Distributed round-robin"}</p></div>
//                     </label>

//                     {!onlyThisExecutive && assignmentMode === "selected" && (
//                       <div className="relative" ref={dropdownRef}>
//                         <button type="button" onClick={() => setExecDropdownOpen(s => !s)} className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[10px]">
//                           <span style={{ color: selectedExecIds.size > 0 ? N : MU }}>{selectedExecIds.size > 0 ? `${selectedExecIds.size} executive(s) selected` : "Select executives"}</span>
//                           <ChevronDown size={10} className={`transition-transform ${execDropdownOpen ? 'rotate-180' : ''}`} />
//                         </button>

//                         {execDropdownOpen && (
//                           <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
//                             <div className="p-1.5 border-b"><div className="relative"><Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} /><input type="text" value={execSearch} onChange={(e) => setExecSearch(e.target.value)} placeholder="Search..." className="w-full pl-6 pr-2 py-1 text-[9px] border rounded" style={{ borderColor: BD }} /></div></div>
//                             <div className="max-h-40 overflow-auto">
//                               {execsLoading ? <div className="p-2 text-center text-[9px]" style={{ color: MU }}>Loading...</div> : filteredExecutives.length === 0 ? <div className="p-2 text-center text-[9px]" style={{ color: MU }}>No executives</div> : filteredExecutives.map(e => (<label key={e.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer"><input type="checkbox" className="w-3 h-3 rounded" style={{ accentColor: O }} checked={selectedExecIds.has(e.id)} onChange={() => toggleExec(e.id)} /><span className="text-[9px]" style={{ color: N }}>{e.name}</span></label>))}
//                             </div>
//                             <div className="flex items-center justify-between p-1.5 border-t bg-gray-50"><div className="flex gap-1"><button onClick={selectAllExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>All</button><button onClick={clearExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>Clear</button></div><button onClick={() => setExecDropdownOpen(false)} className="px-2 py-0.5 text-[8px] rounded text-white" style={{ background: O }}>Done</button></div>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Requirements Info Card */}
//                 <div className="rounded-lg p-2.5" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
//                   <div className="flex items-start gap-1.5">
//                     <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} />
//                     <div>
//                       <p className="text-[9px] font-medium mb-0.5" style={{ color: N }}>Required fields:</p>
//                       <div className="flex flex-wrap gap-1 mb-1.5">
//                         <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Salutation*</span>
//                         <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Name*</span>
//                         <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Phone*</span>
//                       </div>
//                       <p className="text-[8px]" style={{ color: MU }}>Email, WhatsApp optional • Valid phone format: +91XXXXXXXXXX</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Export Error Button */}
//                 {skippedRows.length > 0 && (
//                   <button onClick={exportSkippedRows} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: O }}><FileWarning size={10} /> Export Error Report ({skippedRows.length})</button>
//                 )}
//               </div>
//             </div>

//             {/* Validation Errors */}
//             {validationErrors.length > 0 && (
//               <div className="mt-3 rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
//                 <div className="flex items-start gap-1.5"><AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} /><div className="flex-1"><div className="flex items-center justify-between flex-wrap gap-1"><h3 className="text-[9px] font-semibold" style={{ color: N }}>Validation Errors</h3><button onClick={exportSkippedRows} className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded" style={{ background: O, color: 'white' }}><FileWarning size={8} />Export</button></div><ul className="text-[8px] space-y-0.5 max-h-24 overflow-auto mt-1" style={{ color: MU }}>{validationErrors.slice(0, 8).map((error, idx) => (<li key={idx}>• {error}</li>))}{validationErrors.length > 8 && <li className="font-medium">+{validationErrors.length - 8} more</li>}</ul></div></div>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0" style={{ borderColor: BD, background: BG }}>
//             <div className="flex items-center"><AlertCircle size={10} style={{ color: MU }} /><span className="text-[8px] ml-1" style={{ color: MU }}>Fields marked with * are required</span></div>
//             <div className="flex items-center gap-2">
//               <button onClick={handleClose} className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50" style={{ border: `1px solid ${BD}`, color: N }}>Cancel</button>
//               <button onClick={handleFileImport} disabled={!file && !sheetUrl || isUploading} className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1" style={{ background: O }}>{isUploading ? <><Loader2 size={10} className="animate-spin" />Importing...</> : <><Upload size={10} />Import Sellers</>}</button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} duplicates={duplicates} skippedRows={skippedRows} updatedRows={updatedRows} />
//     </>
//   );
// }



// src/components/sellers/ImportSellersLeadsModal.tsx
import React, { useEffect, useMemo, useRef, useState, ChangeEvent, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import * as XLSXRaw from "xlsx-js-style";
import { usersAPI } from "@/lib/api";
import { sellerAPI } from "@/lib/sellersAPI";
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

type ImportSellersModalProps = {
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

const toNumber = (v: any): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const cleaned = String(v).replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && !isNaN(n) ? n : undefined;
};

const renderCell = (v: any) => {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.length ? v.join(", ") : "";
  return String(v);
};

/* ========================== Summary Modal ========================== */
function SummaryModal({ isOpen, onClose, title = "Import Summary", duplicates, skippedRows, updatedRows }: any) {
  if (!isOpen) return null;
  const allKeys = Array.from(new Set(
    [...duplicates.map((r: any) => r.data), ...skippedRows.map((r: any) => r.data), ...updatedRows.map((r: any) => r.data)]
      .flatMap((row: any) => Object.keys(row).filter(k => row[k] && String(row[k]).trim() !== ""))
  ));
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="max-w-6xl">
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          <span className="text-sm">Duplicates: <strong>{duplicates.length}</strong></span>
          <span className="text-sm">Skipped: <strong>{skippedRows.length}</strong></span>
          {updatedRows.length > 0 && <span className="text-sm">Updated: <strong>{updatedRows.length}</strong></span>}
        </div>
        {duplicates.length > 0 && (
          <div><h4 className="font-semibold text-purple-700 mb-2">Duplicates</h4><div className="max-h-60 overflow-auto border rounded"><table className="w-full text-xs"><thead className="bg-purple-50 sticky top-0"><tr><th>Row</th><th>Reason</th>{allKeys.map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{duplicates.map((row: any, i: number) => (<tr key={i}><td>{row.row}</td><td>{row.reason}</td>{allKeys.map(k => <td key={k}>{renderCell(row.data?.[k])}</td>)}</tr>))}</tbody></table></div></div>
        )}
        {skippedRows.length > 0 && (
          <div><h4 className="font-semibold text-red-700 mb-2">Skipped</h4><div className="max-h-60 overflow-auto border rounded"><table className="w-full text-xs"><thead className="bg-red-50 sticky top-0"><tr><th>Row</th><th>Reason</th>{allKeys.map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{skippedRows.map((row: any, i: number) => (<tr key={i}><td>{row.row}</td><td>{row.reason}</td>{allKeys.map(k => <td key={k}>{renderCell(row.data?.[k])}</td>)}</tr>))}</tbody></table></div></div>
        )}
        {updatedRows.length > 0 && (
          <div><h4 className="font-semibold text-green-700 mb-2">Updated</h4><div className="max-h-60 overflow-auto border rounded"><table className="w-full text-xs"><thead className="bg-green-50 sticky top-0"><td><th>Row</th><th>ID</th><th>Note</th>{allKeys.map(k => <th key={k}>{k}</th>)}</td></thead><tbody>{updatedRows.map((row: any, i: number) => (<tr key={i}><td>{row.row}</td><td>{row.id}</td><td>{row.note}</td>{allKeys.map(k => <td key={k}>{renderCell(row.data?.[k])}</td>)}</tr>))}</tbody></table></div></div>
        )}
        <div className="flex justify-end"><Button variant="outline" onClick={onClose}>Close</Button></div>
      </div>
    </Modal>
  );
}

/* ====================== Template Download (matches SellerFormModal fields) ====================== */
const downloadSellerTemplate = () => {
  // Fields in serial order as per SellerFormModal (Basic Info, Contact, Location, Lead Details)
  const headers = [
    "Salutation", "Name", "Phone", "WhatsApp", "Email", "Seller DOB",
    "State", "City", "Location", "Lead Source", "Lead Stage", "Lead Type",
    "Priority", "Status", "Notes"
  ];

  const sampleRows = [
    [
      "Mr.", "Rajesh Kumar", "9876543210", "9876543210", "rajesh.kumar@gmail.com", "1980-05-15",
      "Maharashtra", "Mumbai", "Bandra West", "Website", "Initial Contact", "Seller Lead",
      "High", "Active", "Looking to sell 2BHK apartment urgently"
    ],
    [
      "Mrs.", "Sunita Sharma", "9988776655", "9988776655", "sunita.sharma@gmail.com", "1975-12-20",
      "Delhi", "New Delhi", "Connaught Place", "Referral", "Mandate Discussion", "Premium Seller",
      "Medium", "In Progress", "Commercial property, negotiable"
    ],
    [
      "Dr.", "Amit Desai", "9876541230", "9876541230", "amit.desai@yahoo.com", "1982-08-10",
      "Gujarat", "Ahmedabad", "Satellite", "Google Ads", "Deal Negotiation", "Seller Lead",
      "Low", "Active", "Requires proper documentation"
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
  XLSX.utils.book_append_sheet(wb, ws, "Sellers Template");
  XLSX.writeFile(wb, "Sellers_Import_Template.xlsx");
};

/* ============================== Main Component ============================== */
export default function ImportSellersModal({ isOpen, onClose, onImportComplete }: ImportSellersModalProps) {
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

  // Fetch sales executives (department=Sales, role=Sales Executive) – only first+last name
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

  // Normalize a seller row (matching SellerFormModal fields)
  const normalizeSellerRow = (row: any) => {
    const normalized: Record<string, any> = {};
    Object.keys(row || {}).forEach(k => { if (row[k] !== undefined && row[k] !== null && row[k] !== "") normalized[String(k).trim().toLowerCase()] = row[k]; });

    const seller: any = {
      salutation: ensureString(normalized["salutation"]),
      name: ensureString(normalized["name"]),
      phone: ensureString(normalized["phone"]),
      whatsapp: ensureString(normalized["whatsapp"]),
      email: ensureString(normalized["email"]),
      seller_dob: toISODate(normalized["seller_dob"]),
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
    Object.keys(seller).forEach(k => { if (seller[k] === undefined) delete seller[k]; });
    const rowErrors: string[] = [];
    if (!seller.name) rowErrors.push("Missing name");
    if (!seller.phone) rowErrors.push("Missing phone");
    if (seller.phone) {
      const p = toCanonicalPhone(seller.phone);
      seller.phone = p.display;
    }
    if (seller.whatsapp) {
      const w = toCanonicalPhone(seller.whatsapp);
      seller.whatsapp = w.display;
    }
    return { seller, rowErrors };
  };

  // Validate all rows and produce preview
  const filterValidSellersWithPreview = (data: RawRow[]) => {
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();
    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];
    const previewRowsArr: PreviewRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      const { seller, rowErrors } = normalizeSellerRow(row);
      if (rowErrors.length > 0) {
        skipped.push({ row: rowNum, reason: `Validation: ${rowErrors.join(", ")}`, data: row, errors: rowErrors });
        previewRowsArr.push({ rowNum, valid: false, reason: rowErrors.join(", "), data: row });
        return;
      }
      const phoneParsed = toCanonicalPhone(seller.phone);
      const phoneKey = phoneParsed.key;
      const email = (seller.email ? seller.email : "").toLowerCase();
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
      const phoneDigits = seller.phone.replace(/[^\d+]/g, "");
      const okPhone = /^\+91\d{10}$/.test(phoneDigits) || /^\+\d{10,15}$/.test(phoneDigits) || /^\d{10}$/.test(phoneDigits);
      if (!okPhone) {
        const reason = `Invalid phone format (${seller.phone})`;
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
      validData.push(seller);
      previewRowsArr.push({ rowNum, valid: true, reason: "Valid", data: row, normalizedData: seller });
      seenPhoneKeys.add(phoneKey);
      if (email) seenEmails.add(email);
    });
    return { validData, nonDuplicateSkipped: skipped, localDuplicates, previewRows: previewRowsArr };
  };

  const processPreview = (rawData: RawRow[], source: string) => {
    setPreviewLoading(true);
    try {
      const { validData, nonDuplicateSkipped, localDuplicates, previewRows } = filterValidSellersWithPreview(rawData);
      setValidPreviewData(validData);
      setPreviewSkipped(nonDuplicateSkipped);
      setPreviewDuplicates(localDuplicates);
      setPreviewRows(previewRows);
      setShowPreview(true);
      if (validData.length === 0) toast.warning(`No valid sellers found in ${source}.`);
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

  const callImportAPI = async (payloadRows: any[]) => {
    try { return await (sellerAPI as any).importSellers(payloadRows); }
    catch { try { return await (sellerAPI as any).importSellers({ sellers: payloadRows }); } catch { return await (sellerAPI as any).importSellers({ data: payloadRows }); } }
  };

  const executeImport = async () => {
    if (validPreviewData.length === 0) { toast.error("No valid sellers to import. Check preview."); return; }
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) { toast.error("Select at least one executive or choose 'None'."); return; }
    setIsUploading(true);
    try {
      const payload = applyAssignmentPolicy(validPreviewData);
      const res = await callImportAPI(payload);
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
        toast.success(`Imported ${insertedCount} seller(s) successfully.`);
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
              <div><h2 className="text-sm font-bold text-white">Import Sellers</h2><p className="text-[9px] text-white/70">Import sellers from Excel files or Google Sheets</p></div>
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

                <button onClick={downloadSellerTemplate} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: N }}><Download size={10} /> Download Template</button>
              </div>

              {/* Right Column - Assignment */}
              <div className="space-y-3">
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Users size={12} style={{ color: O }} /> Seller Assignment</h3>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
                      <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
                      <div className="flex-1"><p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p><p className="text-[8px]" style={{ color: MU }}>Sellers not assigned to any executive</p></div>
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
                              {/* No "Done" button */}
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

                {skippedRows.length > 0 && (
                  <button onClick={() => { /* optional export */ }} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: O }}><FileWarning size={10} /> Export Error Report ({skippedRows.length})</button>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                  <div className="flex items-center gap-1.5"><CheckCircle size={10} style={{ color: O }} /><span className="text-[9px] font-medium" style={{ color: N }}>{validPreviewData.length} seller(s) ready to import</span></div>
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
                {isUploading ? <><Loader2 size={10} className="animate-spin" /> Importing...</> : <><Upload size={10} /> Import Sellers ({validPreviewData.length})</>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} duplicates={duplicates} skippedRows={skippedRows} updatedRows={updatedRows} />
    </>
  );
}