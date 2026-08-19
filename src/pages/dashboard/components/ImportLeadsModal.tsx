// import React, { useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
// import { X, Save, Target, DollarSign, User, Calendar, MessageCircle, Phone, Mail, TrendingUp, TrendingDown, Upload, FileSpreadsheet, Download, AlertCircle, Users, CheckCircle, XCircle } from "lucide-react";
// import * as XLSXRaw from "xlsx-js-style";
// import { leadsAPI, usersAPI } from "@/lib/api";
// import { toast } from "react-toastify";
// import { useAuth } from "@/contexts/AuthContext";
// import { getAssignableExecutives } from "@/utils/roleBasedOptions";

// const XLSX = XLSXRaw as any;

// // Theme Colors (same as negotiation modal)
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

// type ImportLeadsModalProps = {
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

// /* ======================= Utility / Helpers ===================== */

// // Cheap, safe role detectors (works with many backends)
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

// const normalizeSalutation = (s: string): string =>
//   (s || "").trim().replace(/\.{2,}/g, ".");

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
// const parsePhoneNumber = (val: any) => toCanonicalPhone(val).display;

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
//   [...duplicates.map(r => r.data), ...skippedRows.map(r => r.data), ...updatedRows.map(r => r.data)].forEach((row) => {
//     Object.entries(row || {}).forEach(([k, v]) => {
//       if (v !== null && v !== undefined && String(v).trim() !== "") keySet.add(k);
//     });
//   });
//   const allKeys = Array.from(keySet);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>

//         {/* Header */}
//         <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: N }}>
//           <div className="flex items-center gap-2 sm:gap-3">
//             <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${O}20` }}>
//               <AlertCircle size={16} className="sm:w-5 sm:h-5" style={{ color: O }} />
//             </div>
//             <div>
//               <h2 className="text-sm sm:text-lg font-bold text-white">{title}</h2>
//               <p className="text-[10px] sm:text-xs text-white/70">Review import results</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-1 sm:p-1.5 rounded hover:bg-white/10 transition-colors text-white">
//             <X size={16} className="sm:w-5 sm:h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6">
//           <div className="flex flex-wrap gap-3 sm:gap-4">
//             <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg" style={{ background: `${O}10` }}>
//               <Users size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
//               <span className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>Duplicates: {duplicates.length}</span>
//             </div>
//             <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg" style={{ background: `${O}10` }}>
//               <XCircle size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
//               <span className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>Skipped: {skippedRows.length}</span>
//             </div>
//             {updatedRows.length > 0 && (
//               <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg" style={{ background: `${O}10` }}>
//                 <CheckCircle size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
//                 <span className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>Updated: {updatedRows.length}</span>
//               </div>
//             )}
//           </div>

//           {duplicates.length > 0 && (
//             <div>
//               <h4 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: O }}>
//                 <AlertCircle size={12} className="sm:w-4 sm:h-4" /> Duplicates (in file or CRM)
//               </h4>
//               <div className="max-h-[260px] overflow-auto border rounded-lg" style={{ borderColor: BD }}>
//                 <table className="w-full text-[9px] sm:text-xs border-collapse">
//                   <thead className="sticky top-0 z-10" style={{ background: BG }}>
//                     <tr>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Row</th>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Duplicate Fields</th>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Existing ID</th>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Reason</th>
//                       {allKeys.map((key) => (
//                         <th key={key} className="border px-1 sm:px-2 py-1 text-left" style={{ borderColor: BD }}>{key}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {duplicates.map((row, idx) => (
//                       <tr key={idx} className="hover:bg-orange-50/30">
//                         <td className="border px-1 sm:px-2 py-1 text-center" style={{ borderColor: BD }}>{row.row ?? "-"}</td>
//                         <td className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>
//                           {row.duplicateFields && row.duplicateFields.length > 0 ? row.duplicateFields.join(", ") : "-"}
//                         </td>
//                         <td className="border px-1 sm:px-2 py-1 text-center" style={{ borderColor: BD }}>{row.existingId ?? "-"}</td>
//                         <td className="border px-1 sm:px-2 py-1" style={{ borderColor: BD, color: O }}>{row.reason}</td>
//                         {allKeys.map((key) => (
//                           <td key={key} className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>
//                             {row.data?.[key] && String(row.data[key]).trim() !== "" ? row.data[key] : ""}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {skippedRows.length > 0 && (
//             <div>
//               <h4 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: MU }}>Skipped (non-duplicate issues)</h4>
//               <div className="max-h-[240px] overflow-auto border rounded-lg" style={{ borderColor: BD }}>
//                 <table className="w-full text-[9px] sm:text-xs border-collapse">
//                   <thead className="sticky top-0 z-10" style={{ background: BG }}>
//                     <tr>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Row</th>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Reason</th>
//                       {allKeys.map((key) => (
//                         <th key={key} className="border px-1 sm:px-2 py-1 text-left" style={{ borderColor: BD }}>{key}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {skippedRows.map((row, idx) => (
//                       <tr key={idx} className="hover:bg-gray-50/30">
//                         <td className="border px-1 sm:px-2 py-1 text-center" style={{ borderColor: BD }}>{row.row}</td>
//                         <td className="border px-1 sm:px-2 py-1" style={{ borderColor: BD, color: MU }}>{row.reason}</td>
//                         {allKeys.map((key) => (
//                           <td key={key} className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>
//                             {row.data[key] && String(row.data[key]).trim() !== "" ? row.data[key] : ""}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {updatedRows.length > 0 && (
//             <div>
//               <h4 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: O }}>Updated (existing in CRM)</h4>
//               <div className="max-h-[240px] overflow-auto border rounded-lg" style={{ borderColor: BD }}>
//                 <table className="w-full text-[9px] sm:text-xs border-collapse">
//                   <thead className="sticky top-0 z-10" style={{ background: BG }}>
//                     <tr>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Row</th>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>ID</th>
//                       <th className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>Note</th>
//                       {allKeys.map((key) => (
//                         <th key={key} className="border px-1 sm:px-2 py-1 text-left" style={{ borderColor: BD }}>{key}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {updatedRows.map((row, idx) => (
//                       <tr key={idx} className="hover:bg-green-50/30">
//                         <td className="border px-1 sm:px-2 py-1 text-center" style={{ borderColor: BD }}>{row.row ?? "-"}</td>
//                         <td className="border px-1 sm:px-2 py-1 text-center" style={{ borderColor: BD }}>{row.id ?? "-"}</td>
//                         <td className="border px-1 sm:px-2 py-1" style={{ borderColor: BD, color: O }}>{row.note || "Updated"}</td>
//                         {allKeys.map((key) => (
//                           <td key={key} className="border px-1 sm:px-2 py-1" style={{ borderColor: BD }}>
//                             {row.data?.[key] && String(row.data[key]).trim() !== "" ? row.data[key] : ""}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-3 sm:px-6 py-2 sm:py-4 border-t flex justify-end" style={{ borderColor: BD, background: BG }}>
//           <button onClick={onClose} className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ====================== Template Download (xlsx) ====================== */

// const downloadLeadTemplate = () => {
//   const data = [
//     ["Salutation*", "Name*", "Phone*", "Email", "Lead_type", "Lead_source", "Whatsapp_number", "State", "City", "Location", "Status", "Stage", "Priority"],
//     ["Mr", "Rahul Sharma", "9876543210", "rahul.sharma@gmail.com", "Walk-In Lead", "Website", "9876543210", "Maharashtra", "Mumbai", "Bandra", "New", "New", "Medium"],
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
//   (ws as any)["!cols"] = [12, 16, 15, 24, 16, 16, 16, 16, 12, 16, 12, 12, 12].map((width) => ({ width }));

//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Leads Template");
//   XLSX.writeFile(wb, "Leads_Import_Template.xlsx");
// };

// /* ============================== Component ============================== */

// export default function ImportLeadsModal({ isOpen, onClose }: ImportLeadsModalProps) {
//   const { user } = useAuth() as any;

//   const [file, setFile] = useState<File | null>(null);
//   const [sheetUrl, setSheetUrl] = useState<string>("");

//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [dragActive, setDragActive] = useState<boolean>(false);

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
//         try { res = await get("presales"); }
//         catch { res = await get("pre-sales"); }

//         const salesUsers = (res?.items ?? res?.data ?? res ?? []).map((u: any) => ({
//           ...u,
//           id: u.id ?? u.userId ?? u._id ?? u.uuid ?? String(u.email || u.username || Math.random()),
//           name: formatName(u),
//         }));

//         const allowed = getAssignableExecutives(user, salesUsers) || [];
//         const mapped: Executive[] = allowed.map((u: any) => ({
//           id: u.id,
//           name: u.name,
//           email: u.email,
//           username: u.raw?.username || u.username,
//         }));

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
//     return executives.filter(
//       (e) =>
//         String(e.name || "").toLowerCase().includes(s) ||
//         String(e.email || "").toLowerCase().includes(s) ||
//         String(e.username || "").toLowerCase().includes(s)
//     );
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
//       if (data["Phone*"] || data["phone"] || data["Phone"]) fields.push("phone");
//       if (data["Email"] || data["email"]) fields.push("email");
//     }
//     return Array.from(new Set(fields));
//   };

//   const filterValidLeads = (data: RawRow[]) => {
//     const seenPhoneKeys = new Set<string>();
//     const seenEmails = new Set<string>();

//     const validData: any[] = [];
//     const skipped: SkippedRow[] = [];
//     const localDuplicates: DuplicateRow[] = [];

//     data.forEach((row, index) => {
//       const rowNum = index + 2;
//       const rawSal = row["Salutation*"] ? String(row["Salutation*"]).trim() : "";
//       const salutation = rawSal ? normalizeSalutation(rawSal) : "";
//       const name = row["Name*"] ? String(row["Name*"]).trim() : "";

//       const phoneParsed = toCanonicalPhone(row["Phone*"]);
//       const phone = phoneParsed.display;
//       const phoneKey = phoneParsed.key;

//       const email = row["Email"] ? String(row["Email"]).trim() : "";

//       if (!salutation || !name || !phoneKey) {
//         const missing: string[] = [];
//         if (!salutation) missing.push("Salutation");
//         if (!name) missing.push("Name");
//         if (!phoneKey) missing.push("Phone");
//         skipped.push({
//           row: rowNum,
//           reason: `Missing mandatory fields: ${missing.join(", ")}`,
//           data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation }
//         });
//         return;
//       }

//       if (phoneKey && seenPhoneKeys.has(phoneKey)) {
//         localDuplicates.push({
//           row: rowNum,
//           reason: `Duplicate in file (phone)`,
//           data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation },
//           duplicateFields: ["phone"],
//         });
//         return;
//       }
//       if (email && seenEmails.has(email.toLowerCase())) {
//         localDuplicates.push({
//           row: rowNum,
//           reason: `Duplicate in file (email)`,
//           data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation },
//           duplicateFields: ["email"],
//         });
//         return;
//       }

//       const phoneDigits = phone.replace(/[^\d+]/g, "");
//       const okPhone = /^\+91\d{10}$/.test(phoneDigits) || /^\+\d{10,15}$/.test(phoneDigits);
//       if (!okPhone) {
//         skipped.push({ row: rowNum, reason: `Invalid phone format (${phone})`, data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation } });
//         return;
//       }

//       if (email) {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//           skipped.push({ row: rowNum, reason: "Invalid email format", data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation } });
//           return;
//         }
//       }

//       const whatsappRaw = row["Whatsapp_number"];
//       const whatsapp_number = whatsappRaw ? parsePhoneNumber(whatsappRaw) : "";

//       validData.push({
//         salutation,
//         name,
//         phone,
//         email: email || "",
//         lead_type: row["Lead_type"] || "",
//         lead_source: row["Lead_source"] || "",
//         whatsapp_number,
//         state: row["State"] || "",
//         city: row["City"] || "",
//         location: row["Location"] || "",
//         status: row["Status"] || "",
//         stage: row["Stage"] || "",
//         priority: row["Priority"] || "",
//       });

//       seenPhoneKeys.add(phoneKey);
//       if (email) seenEmails.add(email.toLowerCase());
//     });

//     return { validData, nonDuplicateSkipped: skipped, localDuplicates };
//   };

//   const applyAssignmentPolicy = (rows: any[]): any[] => {
//     if (onlyThisExecutive) {
//       const selfId = user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
//       return rows.map((r) => ({ ...r, assigned_executive: selfId }));
//     }

//     if (assignmentMode === "none") {
//       return rows.map((r) => ({ ...r, assigned_executive: "" }));
//     }
//     const ids = Array.from(selectedExecIds);
//     if (ids.length === 0) return rows.map((r) => ({ ...r, assigned_executive: "" }));
//     const n = ids.length;
//     return rows.map((r, i) => ({ ...r, assigned_executive: ids[i % n] }));
//   };

//   const callImportAPI = async (payloadRows: any[]) => {
//     try {
//       return await (leadsAPI as any).importLeads(payloadRows);
//     } catch (err1) {
//       try {
//         return await (leadsAPI as any).importLeads({ rows: payloadRows });
//       } catch (err2) {
//         try {
//           return await (leadsAPI as any).importLeads({ data: payloadRows });
//         } catch (err3) {
//           console.error("All importLeads formats failed:", err3);
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

//     const { validData, nonDuplicateSkipped, localDuplicates } = filterValidLeads(data);

//     if (validData.length === 0) {
//       setSkippedRows(nonDuplicateSkipped);
//       setDuplicates(localDuplicates);
//       setUpdatedRows([]);
//       setShowSummary(true);
//       if (localDuplicates.length === 0) toast.error(`No valid leads found in the ${sourceLabel}`);
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

//     const ok =
//       res?.success === true ||
//       res?.ok === true ||
//       (typeof res?.status === "number" && res.status >= 200 && res.status < 300) ||
//       typeof res?.inserted !== "undefined" ||
//       Array.isArray(res?.insertedRows);

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
//           serverDuplicates.push({
//             row: item?.row,
//             reason: reason || "Duplicate in CRM",
//             data: dataRow,
//             duplicateFields: guessDuplicateFields(reason, dataRow),
//             existingId: item?.id || item?.existingId,
//           });
//         } else {
//           serverNonDupSkipped.push({
//             row: item?.row ?? 0,
//             reason: reason || "Skipped by server",
//             data: dataRow,
//           });
//         }
//       }
//     }

//     const allDuplicates = [...localDuplicates, ...serverDuplicates];
//     const allSkipped = [...nonDuplicateSkipped, ...serverNonDupSkipped];

//     setDuplicates(allDuplicates);
//     setSkippedRows(allSkipped);
//     setUpdatedRows(serverUpdated || []);

//     if ((insertedCount ?? 0) > 0 && allDuplicates.length === 0 && allSkipped.length === 0) {
//       toast.success(`Imported ${insertedCount} lead(s) successfully.`);
//       if (typeof (leadsAPI as any).getLeads === "function") {
//         try { await (leadsAPI as any).getLeads(); } catch { }
//       }
//       resetAndClose();
//     } else {
//       const parts: string[] = [];
//       if ((insertedCount ?? 0) > 0) parts.push(`${insertedCount} imported`);
//       if (allDuplicates.length > 0) parts.push(`${allDuplicates.length} duplicate`);
//       if (allSkipped.length > 0) parts.push(`${allSkipped.length} skipped`);
//       toast.info(`Import summary: ${parts.join(" • ")}`);
//       setShowSummary(true);
//     }
//   };

//   const handleFileImport = async () => {
//     if (!file) return toast.error("Please select an Excel/CSV file");
//     if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
//       return toast.error("Please select at least one executive or choose None.");
//     }

//     setIsUploading(true);
//     try {
//       const reader = new FileReader();
//       reader.onload = async (evt: ProgressEvent<FileReader>) => {
//         try {
//           const result = evt.target?.result;
//           if (!result) {
//             toast.error("Failed to read file");
//             return;
//           }

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
//           if (!ws) {
//             toast.error("No sheet found in file");
//             return;
//           }

//           const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
//           if (!data || data.length === 0) {
//             toast.error("File appears to be empty");
//             return;
//           }

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

//     setIsUploading(true);
//     try {
//       const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
//       if (!sheetIdMatch) {
//         toast.error("Invalid Google Sheet URL");
//         setIsUploading(false);
//         return;
//       }
//       const sheetId = sheetIdMatch[1];
//       const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

//       const response = await fetch(exportUrl);
//       if (!response.ok) {
//         toast.error(
//           response.status === 403
//             ? "Sheet is not publicly accessible. Make it 'Anyone with link can view'."
//             : "Failed to access Google Sheet."
//         );
//         setIsUploading(false);
//         return;
//       }

//       const csvText = await response.text();
//       if (!csvText.trim()) {
//         toast.error("Google Sheet appears to be empty");
//         setIsUploading(false);
//         return;
//       }

//       const wb = XLSX.read(csvText, { type: "string", raw: true });
//       const ws = wb.Sheets[wb.SheetNames[0]];
//       if (!ws) {
//         toast.error("No sheet found in Google Sheet");
//         setIsUploading(false);
//         return;
//       }

//       const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
//       if (!data || data.length === 0) {
//         toast.error("No data found in Google Sheet");
//         setIsUploading(false);
//         return;
//       }

//       await processAndSend(data, "Google Sheet");
//     } catch (e) {
//       console.error(e);
//       toast.error("Error processing Google Sheet");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const resetAndClose = () => {
//     setFile(null);
//     setSheetUrl("");
//     setSkippedRows([]);
//     setUpdatedRows([]);
//     setDuplicates([]);
//     setShowSummary(false);
//     setIsUploading(false);
//     setDragActive(false);
//     onClose();
//   };

//   const handleClose = () => {
//     resetAndClose();
//   };

//   const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) return;
//     const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
//     if (!["csv", "xlsx", "xls"].includes(ext)) {
//       toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
//       return;
//     }
//     setFile(f);
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
//         <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>

//           {/* Header */}
//           <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: N }}>
//             <div className="flex items-center gap-2 sm:gap-3">
//               <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${O}20` }}>
//                 <Upload size={16} className="sm:w-5 sm:h-5" style={{ color: O }} />
//               </div>
//               <div>
//                 <h2 className="text-sm sm:text-lg font-bold text-white">Import Leads</h2>
//                 <p className="text-[10px] sm:text-xs text-white/70">Import leads from Excel files or Google Sheets</p>
//               </div>
//             </div>
//             <button onClick={handleClose} className="p-1 sm:p-1.5 rounded hover:bg-white/10 transition-colors text-white">
//               <X size={16} className="sm:w-5 sm:h-5" />
//             </button>
//           </div>

//           {/* Content */}
//           <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6">

//             {/* Import Methods Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

//               {/* File Upload Card */}
//               <div className="rounded-lg p-3 sm:p-4 space-y-3" style={{ background: BG, border: `1px solid ${BD}` }}>
//                 <div className="flex items-center gap-2">
//                   <div className="p-1.5 rounded-lg" style={{ background: `${O}10` }}>
//                     <FileSpreadsheet size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
//                   </div>
//                   <h3 className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>Upload File</h3>
//                 </div>

//                 <div
//                   className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-200 ${dragActive
//                     ? "border-orange-400 bg-orange-50"
//                     : file
//                       ? "border-green-400 bg-green-50"
//                       : "border-gray-300 hover:border-gray-400 bg-white"
//                     }`}
//                   onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
//                   onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
//                   onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
//                   onDrop={(e) => {
//                     e.preventDefault(); e.stopPropagation(); setDragActive(false);
//                     const dtFiles = e.dataTransfer?.files;
//                     if (dtFiles && dtFiles.length > 0) {
//                       const droppedFile = dtFiles[0];
//                       const ext = droppedFile.name.split(".").pop()?.toLowerCase() ?? "";
//                       if (["csv", "xlsx", "xls"].includes(ext)) setFile(droppedFile);
//                       else toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
//                     }
//                   }}
//                 >
//                   <input
//                     type="file"
//                     accept=".csv,.xlsx,.xls"
//                     onChange={onFileInputChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   />

//                   {file ? (
//                     <div className="space-y-1">
//                       <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center" style={{ background: `${O}10` }}>
//                         <CheckCircle size={18} className="sm:w-5 sm:h-5" style={{ color: O }} />
//                       </div>
//                       <p className="text-[10px] sm:text-xs font-medium truncate px-2" style={{ color: O }}>{file.name}</p>
//                       <p className="text-[8px] sm:text-[10px]" style={{ color: MU }}>Click to change file</p>
//                     </div>
//                   ) : (
//                     <div className="space-y-1">
//                       <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center" style={{ background: `${N}10` }}>
//                         <Upload size={16} className="sm:w-5 sm:h-5" style={{ color: MU }} />
//                       </div>
//                       <p className="text-[10px] sm:text-xs font-medium" style={{ color: N }}>Drop file or click</p>
//                       <p className="text-[8px] sm:text-[10px]" style={{ color: MU }}>Excel (.xlsx, .xls) or CSV</p>
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   onClick={handleFileImport}
//                   disabled={!file || isUploading}
//                   className="w-full py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
//                   style={{ background: O }}
//                 >
//                   {isUploading ? (
//                     <span className="inline-flex items-center justify-center gap-2">
//                       <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Processing...
//                     </span>
//                   ) : (
//                     "Import from File"
//                   )}
//                 </button>
//               </div>

//               {/* Google Sheet Card */}
//               <div className="rounded-lg p-3 sm:p-4 space-y-3" style={{ background: BG, border: `1px solid ${BD}` }}>
//                 <div className="flex items-center gap-2">
//                   <div className="p-1.5 rounded-lg" style={{ background: `${O}10` }}>
//                     <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: O }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                     </svg>
//                   </div>
//                   <h3 className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>Google Sheets</h3>
//                 </div>

//                 <div className="space-y-2">
//                   <input
//                     type="text"
//                     placeholder="https://docs.google.com/spreadsheets/..."
//                     value={sheetUrl}
//                     onChange={(e) => setSheetUrl(e.target.value)}
//                     className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
//                     style={{ borderColor: BD }}
//                   />

//                   <div className="rounded-lg p-2 sm:p-3" style={{ background: `${O}05`, border: `1px solid ${O}20` }}>
//                     <div className="flex items-start gap-2">
//                       <AlertCircle size={12} className="sm:w-4 sm:h-4 mt-0.5 shrink-0" style={{ color: O }} />
//                       <div className="text-[9px] sm:text-[11px] leading-relaxed" style={{ color: MU }}>
//                         <p className="font-medium mb-0.5" style={{ color: O }}>Make sure your Google Sheet is:</p>
//                         <ul className="space-y-0.5">
//                           <li>• Anyone with link can view</li>
//                           <li>• Headers same as template</li>
//                           <li>• Phone numbers are text</li>
//                         </ul>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleGoogleSheetImport}
//                   disabled={!sheetUrl.trim() || isUploading}
//                   className="w-full py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
//                   style={{ background: O }}
//                 >
//                   {isUploading ? (
//                     <span className="inline-flex items-center justify-center gap-2">
//                       <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Importing...
//                     </span>
//                   ) : (
//                     "Import from Google Sheet"
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Assignment Section */}
//             <div className="rounded-lg p-3 sm:p-4 space-y-3" style={{ background: BG, border: `1px solid ${BD}` }}>
//               <div className="flex items-center gap-2">
//                 <div className="p-1.5 rounded-lg" style={{ background: `${O}10` }}>
//                   <Users size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
//                 </div>
//                 <h3 className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>Lead Assignment</h3>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
//                 <div className="space-y-2">
//                   <label className={`flex items-center gap-2 text-[10px] sm:text-sm ${onlyThisExecutive ? "opacity-50 cursor-not-allowed" : ""}`}>
//                     <input
//                       type="radio"
//                       className="accent-orange-500"
//                       checked={assignmentMode === "none"}
//                       onChange={() => !onlyThisExecutive && setAssignmentMode("none")}
//                       disabled={onlyThisExecutive}
//                     />
//                     <span style={{ color: N }}>None</span>
//                   </label>

//                   <label className="flex items-center gap-2 text-[10px] sm:text-sm">
//                     <input
//                       type="radio"
//                       className="accent-orange-500"
//                       checked={assignmentMode === "selected" || onlyThisExecutive}
//                       onChange={() => setAssignmentMode("selected")}
//                       disabled={onlyThisExecutive ? true : false}
//                     />
//                     <span style={{ color: N }}>{onlyThisExecutive ? "Assigned to you" : "Selected executives (round-robin)"}</span>
//                   </label>
//                 </div>

//                 <div className="md:col-span-2">
//                   <div className="relative" ref={dropdownRef}>
//                     <button
//                       type="button"
//                       onClick={() => setExecDropdownOpen((s) => !s)}
//                       className={`w-full flex items-center justify-between rounded-lg border px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm ${(assignmentMode === "selected" || onlyThisExecutive) ? "bg-white" : "bg-gray-100 cursor-not-allowed"}`}
//                       style={{ borderColor: BD }}
//                       disabled={!(assignmentMode === "selected" || onlyThisExecutive)}
//                     >
//                       <span className="truncate" style={{ color: N }}>
//                         {onlyThisExecutive
//                           ? (executives[0]?.name || "You")
//                           : selectedExecIds.size > 0
//                             ? `${selectedExecIds.size} executive(s) selected`
//                             : "Select executives"}
//                       </span>
//                       <svg className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: MU }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </button>

//                     {(execDropdownOpen && (assignmentMode === "selected" || onlyThisExecutive)) && !onlyThisExecutive && (
//                       <div className="absolute z-20 mt-1 w-full rounded-lg border shadow-lg bg-white" style={{ borderColor: BD }}>
//                         <div className="p-2 border-b" style={{ borderColor: BD }}>
//                           <input
//                             type="text"
//                             value={execSearch}
//                             onChange={(e) => setExecSearch(e.target.value)}
//                             placeholder="Search executive..."
//                             className="w-full px-2 sm:px-3 py-1.5 text-[10px] sm:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
//                             style={{ borderColor: BD }}
//                           />
//                         </div>

//                         <div className="max-h-56 overflow-auto">
//                           {execsLoading ? (
//                             <div className="p-3 text-center text-[10px] sm:text-sm" style={{ color: MU }}>Loading...</div>
//                           ) : filteredExecutives.length === 0 ? (
//                             <div className="p-3 text-center text-[10px] sm:text-sm" style={{ color: MU }}>No executives found</div>
//                           ) : (
//                             filteredExecutives.map((e) => (
//                               <label key={e.id} className="flex items-start gap-2 px-3 py-2 hover:bg-orange-50 text-[10px] sm:text-sm cursor-pointer">
//                                 <input
//                                   type="checkbox"
//                                   className="mt-1 accent-orange-500"
//                                   checked={selectedExecIds.has(e.id)}
//                                   onChange={() => toggleExec(e.id)}
//                                 />
//                                 <div className="flex flex-col">
//                                   <span className="font-medium truncate" style={{ color: N }}>{e.name}</span>
//                                   {e.email && (
//                                     <span className="text-[8px] sm:text-[10px]" style={{ color: MU }}>{e.email}</span>
//                                   )}
//                                 </div>
//                               </label>
//                             ))
//                           )}
//                         </div>

//                         <div className="flex items-center justify-between p-2 border-t" style={{ borderColor: BD, background: BG }}>
//                           <div className="flex gap-2">
//                             <button onClick={selectAllExecs} className="px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>Select All</button>
//                             <button onClick={clearExecs} className="px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>Clear</button>
//                           </div>
//                           <button onClick={() => setExecDropdownOpen(false)} className="px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded text-white transition-colors hover:opacity-90" style={{ background: O }}>Done</button>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {!onlyThisExecutive && (
//                     <p className="mt-1.5 text-[8px] sm:text-[10px]" style={{ color: MU }}>
//                       Tip: If you select 3 executives and import 50 leads, they'll be assigned ~16/17 each (round-robin).
//                     </p>
//                   )}
//                   {onlyThisExecutive && (
//                     <p className="mt-1.5 text-[8px] sm:text-[10px]" style={{ color: MU }}>
//                       You are logged in as an Executive — imports will be assigned to you automatically.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Requirements Section */}
//             <div className="rounded-lg p-3 sm:p-4" style={{ background: `${O}05`, border: `1px solid ${O}20` }}>
//               <div className="flex items-start gap-2">
//                 <AlertCircle size={14} className="sm:w-5 sm:h-5 mt-0.5 shrink-0" style={{ color: O }} />
//                 <div>
//                   <h4 className="text-[11px] sm:text-sm font-semibold mb-1" style={{ color: O }}>Required Fields & Validation Rules</h4>
//                   <div className="text-[9px] sm:text-xs space-y-1" style={{ color: MU }}>
//                     <p className="font-medium">Mandatory fields (marked with *):</p>
//                     <div className="flex flex-wrap gap-1 mt-1">
//                       <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium" style={{ background: `${O}10`, color: O }}>Salutation*</span>
//                       <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium" style={{ background: `${O}10`, color: O }}>Name*</span>
//                       <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium" style={{ background: `${O}10`, color: O }}>Phone*</span>
//                     </div>
//                     <p className="text-[8px] sm:text-[10px] mt-2">
//                       • Email is optional but recommended<br />
//                       • Intra-file duplicate phone/emails will be skipped<br />
//                       • CRM duplicates are never updated; shown as "Duplicate in CRM"<br />
//                       • Scientific notation in phone numbers converted automatically<br />
//                       • Salutation cleaning: multiple dots collapse to a single dot (e.g., Dr.. → Dr.)
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="px-3 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row gap-3" style={{ borderColor: BD, background: BG }}>
//             <button
//               onClick={downloadLeadTemplate}
//               className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all hover:opacity-90"
//               style={{ background: O, color: 'white' }}
//             >
//               <Download size={12} className="sm:w-4 sm:h-4" />
//               Download Template
//             </button>

//             <button
//               onClick={handleClose}
//               className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm border rounded-lg transition-colors hover:bg-gray-50"
//               style={{ borderColor: BD, color: N }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>

//       <SummaryModal
//         isOpen={showSummary}
//         onClose={() => setShowSummary(false)}
//         duplicates={duplicates}
//         skippedRows={skippedRows}
//         updatedRows={updatedRows}
//       />
//     </>
//   );
// }

// import React, { useEffect, useMemo, useRef, useState, ChangeEvent, useCallback } from "react";
// import { X, Upload, FileSpreadsheet, Download, AlertCircle, Users, CheckCircle, XCircle, Eye, Database } from "lucide-react";
// import * as XLSXRaw from "xlsx-js-style";
// import { leadsAPI, usersAPI } from "@/lib/api";
// import { toast } from "react-toastify";
// import { useAuth } from "@/contexts/AuthContext";
// import { getAssignableExecutives } from "@/utils/roleBasedOptions";

// const XLSX = XLSXRaw as any;

// // Theme Colors
// const N = "#0f2b3d";
// const O = "#e67e22";
// const BG = "#f8fafc";
// const BD = "#e2e8f0";
// const MU = "#5a7184";

// // Types
// type RawRow = Record<string, any>;
// type SkippedRow = { row: number; reason: string; data: RawRow };
// type UpdatedRow = { row?: number; id?: string | number; note?: string; data: RawRow; assigned_executive?: string | number };
// type DuplicateRow = { row?: number; reason: string; data: RawRow; duplicateFields?: string[]; existingId?: string | number };
// type PreviewRow = { rowNum: number; valid: boolean; reason?: string; data: RawRow; normalizedData?: any };
// type Executive = { id: string | number; name: string; email?: string; username?: string };
// type AssignmentMode = "none" | "selected";

// // Helper functions
// const getRoleString = (u: any): string => {
//   const r = u?.role || u?.roles || u?.raw?.role || u?.raw?.roles || u?.user?.role || u?.user?.roles || "";
//   return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
// };
// const isExecutiveUser = (u: any): boolean => {
//   const rs = getRoleString(u);
//   return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
// };
// const normalizeSalutation = (s: string): string => (s || "").trim().replace(/\.{2,}/g, ".");
// const toCanonicalPhone = (raw: any): { display: string; key: string } => {
//   if (raw === null || raw === undefined || String(raw).trim() === "") return { display: "", key: "" };
//   let phoneStr = String(raw).trim();
//   if (/e\+\d+$/i.test(phoneStr)) { const n = Number(phoneStr); if (!isNaN(n)) phoneStr = Math.round(n).toString(); }
//   phoneStr = phoneStr.replace(/[^\d+]/g, "").replace(/^0+/, "");
//   const justDigits = phoneStr.replace(/[^\d]/g, "");
//   if (/^\+?91\d{10}$/.test(phoneStr) || /^91\d{10}$/.test(phoneStr) || /^\d{10}$/.test(justDigits)) {
//     const last10 = justDigits.slice(-10);
//     return { display: `+91${last10}`, key: last10 };
//   }
//   return { display: phoneStr.startsWith("+") ? phoneStr : `+${phoneStr}`, key: justDigits };
// };
// const parsePhoneNumber = (val: any) => toCanonicalPhone(val).display;

// // ---------- Summary Modal (unchanged) ----------
// function SummaryModal({ isOpen, onClose, title = "Import Summary", duplicates, skippedRows, updatedRows }: any) {
//   if (!isOpen) return null;
//   const allKeys = Array.from(new Set(
//     [...duplicates.map(r => r.data), ...skippedRows.map(r => r.data), ...updatedRows.map(r => r.data)]
//       .flatMap(row => Object.keys(row).filter(k => row[k] && String(row[k]).trim() !== ""))
//   ));
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
//         <div className="px-4 py-3 flex items-center justify-between" style={{ background: N }}>
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}><AlertCircle size={16} style={{ color: O }} /></div>
//             <div><h2 className="text-sm font-bold text-white">{title}</h2><p className="text-[10px] text-white/70">Review import results</p></div>
//           </div>
//           <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={16} className="text-white" /></button>
//         </div>
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           <div className="flex flex-wrap gap-3">
//             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${O}10` }}><Users size={14} style={{ color: O }} /><span className="text-[11px] font-semibold" style={{ color: N }}>Duplicates: {duplicates.length}</span></div>
//             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${O}10` }}><XCircle size={14} style={{ color: O }} /><span className="text-[11px] font-semibold" style={{ color: N }}>Skipped: {skippedRows.length}</span></div>
//             {updatedRows.length > 0 && <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${O}10` }}><CheckCircle size={14} style={{ color: O }} /><span className="text-[11px] font-semibold" style={{ color: N }}>Updated: {updatedRows.length}</span></div>}
//           </div>
//           {duplicates.length > 0 && <div><h4 className="text-[11px] font-semibold mb-2 flex items-center gap-2" style={{ color: O }}><AlertCircle size={12} /> Duplicates</h4><div className="max-h-[260px] overflow-auto border rounded-lg"><table className="w-full text-[9px] border-collapse"><thead className="sticky top-0" style={{ background: BG }}><tr><th className="border px-1 py-1">Row</th><th className="border px-1 py-1">Duplicate Fields</th><th className="border px-1 py-1">Existing ID</th><th className="border px-1 py-1">Reason</th>{allKeys.map(k => <th key={k} className="border px-1 py-1">{k}</th>)}</tr></thead><tbody>{duplicates.map((row, idx) => (<tr key={idx}><td className="border px-1 py-1 text-center">{row.row ?? "-"}</td><td className="border px-1 py-1">{row.duplicateFields?.join(", ") || "-"}</td><td className="border px-1 py-1 text-center">{row.existingId ?? "-"}</td><td className="border px-1 py-1" style={{ color: O }}>{row.reason}</td>{allKeys.map(k => <td key={k} className="border px-1 py-1">{row.data?.[k]}</td>)}</tr>))}</tbody></table></div></div>}
//           {skippedRows.length > 0 && <div><h4 className="text-[11px] font-semibold mb-2 flex items-center gap-2" style={{ color: MU }}>Skipped</h4><div className="max-h-[240px] overflow-auto border rounded-lg"><table className="w-full text-[9px] border-collapse"><thead className="sticky top-0" style={{ background: BG }}><tr><th className="border px-1 py-1">Row</th><th className="border px-1 py-1">Reason</th>{allKeys.map(k => <th key={k} className="border px-1 py-1">{k}</th>)}</tr></thead><tbody>{skippedRows.map((row, idx) => (<tr key={idx}><td className="border px-1 py-1 text-center">{row.row}</td><td className="border px-1 py-1" style={{ color: MU }}>{row.reason}</td>{allKeys.map(k => <td key={k} className="border px-1 py-1">{row.data[k]}</td>)}</tr>))}</tbody></table></div></div>}
//           {updatedRows.length > 0 && <div><h4 className="text-[11px] font-semibold mb-2 flex items-center gap-2" style={{ color: O }}>Updated</h4><div className="max-h-[240px] overflow-auto border rounded-lg"><table className="w-full text-[9px] border-collapse"><thead className="sticky top-0" style={{ background: BG }}><tr><th className="border px-1 py-1">Row</th><th className="border px-1 py-1">ID</th><th className="border px-1 py-1">Note</th>{allKeys.map(k => <th key={k} className="border px-1 py-1">{k}</th>)}</tr></thead><tbody>{updatedRows.map((row, idx) => (<tr key={idx}><td className="border px-1 py-1 text-center">{row.row ?? "-"}</td><td className="border px-1 py-1 text-center">{row.id ?? "-"}</td><td className="border px-1 py-1" style={{ color: O }}>{row.note || "Updated"}</td>{allKeys.map(k => <td key={k} className="border px-1 py-1">{row.data?.[k]}</td>)}</tr>))}</tbody></table></div></div>}
//         </div>
//         <div className="px-4 py-2 border-t flex justify-end" style={{ borderColor: BD, background: BG }}><button onClick={onClose} className="px-3 py-1 text-[10px] border rounded hover:bg-gray-50" style={{ borderColor: BD, color: N }}>Close</button></div>
//       </div>
//     </div>
//   );
// }

// // ---------- Template Download ----------
// const TEMPLATE_HEADERS = [
//   "Salutation*", "Name*", "Phone*", "Email",
//   "Lead Type", "Priority", "Lead Source", "Lead Status",
//   "State", "City", "Location", "WhatsApp Number"
// ];
// const SAMPLE_ROWS = [
//   ["Mr.", "Rahul Sharma", "9876543210", "rahul.sharma@example.com", "Walk-In Lead", "Medium", "Website", "New", "Maharashtra", "Mumbai", "Bandra West", "9876543210"],
//   ["Ms.", "Priya Patel", "9988776655", "priya.patel@example.com", "Online Lead", "High", "Google Ads", "Contacted", "Gujarat", "Ahmedabad", "Satellite", "9988776655"],
//   ["Dr.", "Amit Kumar", "9876541230", "amit.kumar@example.com", "Referral", "Low", "Customer Referral", "Qualified", "Delhi", "New Delhi", "Connaught Place", "9876541230"]
// ];
// const downloadLeadTemplate = () => {
//   const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...SAMPLE_ROWS]);
//   [0, 1, 2].forEach(c => { const addr = XLSX.utils.encode_cell({ r: 0, c }); if (ws[addr]) (ws as any)[addr].s = { font: { color: { rgb: "FF0000" }, bold: true }, alignment: { horizontal: "center" } }; });
//   for (let c = 3; c < TEMPLATE_HEADERS.length; c++) { const addr = XLSX.utils.encode_cell({ r: 0, c }); if (ws[addr]) (ws as any)[addr].s = { font: { bold: true }, alignment: { horizontal: "center" } }; }
//   for (let r = 1; r < SAMPLE_ROWS.length + 1; r++) for (let c = 0; c < TEMPLATE_HEADERS.length; c++) { const addr = XLSX.utils.encode_cell({ r, c }); if (ws[addr]) (ws as any)[addr].s = { alignment: { horizontal: "left" } }; }
//   (ws as any)["!cols"] = [12, 20, 15, 25, 15, 12, 18, 14, 14, 14, 18, 15].map(w => ({ width: w }));
//   const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Leads Template"); XLSX.writeFile(wb, "Leads_Import_Template.xlsx");
// };

// // ---------- Main Component ----------
// export default function ImportLeadsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
//   const { user } = useAuth() as any;
//   const onlyThisExecutive = isExecutiveUser(user);

//   const [file, setFile] = useState<File | null>(null);
//   const [sheetUrl, setSheetUrl] = useState<string>("");
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [dragActive, setDragActive] = useState<boolean>(false);
//   const [previewLoading, setPreviewLoading] = useState<boolean>(false);
//   const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
//   const [validPreviewData, setValidPreviewData] = useState<any[]>([]);
//   const [previewSkipped, setPreviewSkipped] = useState<SkippedRow[]>([]);
//   const [previewDuplicates, setPreviewDuplicates] = useState<DuplicateRow[]>([]);
//   const [showPreview, setShowPreview] = useState<boolean>(false);
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
//   const dropdownRef = useRef<HTMLDivElement | null>(null);
//   const sheetDebounceRef = useRef<NodeJS.Timeout | null>(null);

//   // --- Fetch executives from Sales department, Sales Executive role ---
//   useEffect(() => {
//     if (!isOpen) return;
//     (async () => {
//       try {
//         setExecsLoading(true);
//         const formatName = (u: any) => {
//           const salutation = u?.salutation ? `${u.salutation} ` : "";
//           const name = `${salutation}${u?.first_name || ""} ${u?.last_name || ""}`.trim();
//           return name || u?.username || u?.email || "Executive";
//         };
//         if (onlyThisExecutive) {
//           const selfId = user?.id || user?.userId || user?._id || String(user?.email || user?.username || "me");
//           setExecutives([{ id: selfId, name: formatName(user), email: user?.email, username: user?.username }]);
//           setSelectedExecIds(new Set([selfId]));
//           setAssignmentMode("selected");
//           return;
//         }
//         // Use the dedicated sales executives endpoint
//         const res = await usersAPI.getSalesExecutives();
//         const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
//         const mapped: Executive[] = list.map((u: any) => ({
//           id: u.id || u.userId || u._id,
//           name: formatName(u),
//           email: u.email,
//           username: u.username,
//         }));
//         setExecutives(mapped);
//       } catch (e) {
//         console.error(e);
//         toast.error("Could not fetch sales executives");
//       } finally {
//         setExecsLoading(false);
//       }
//     })();
//   }, [isOpen, user, onlyThisExecutive]);

//   const filteredExecutives = useMemo(() => {
//     if (!execSearch.trim()) return executives;
//     const s = execSearch.toLowerCase();
//     return executives.filter(e => String(e.name).toLowerCase().includes(s) || String(e.email).toLowerCase().includes(s));
//   }, [execSearch, executives]);

//   const toggleExec = (id: string | number) => setSelectedExecIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
//   const selectAllExecs = () => setSelectedExecIds(new Set(executives.map(e => e.id)));
//   const clearExecs = () => setSelectedExecIds(new Set());

//   // --- Validation logic (same as before) ---
//   const filterValidLeads = (data: RawRow[]) => {
//     const seenPhoneKeys = new Set<string>();
//     const seenEmails = new Set<string>();
//     const validData: any[] = [];
//     const skipped: SkippedRow[] = [];
//     const localDuplicates: DuplicateRow[] = [];
//     const previewRowsArr: PreviewRow[] = [];

//     data.forEach((row, index) => {
//       const rowNum = index + 2;
//       const salutation = normalizeSalutation(row["Salutation*"] || "");
//       const name = String(row["Name*"] || "").trim();
//       const phoneParsed = toCanonicalPhone(row["Phone*"]);
//       const phone = phoneParsed.display;
//       const phoneKey = phoneParsed.key;
//       const email = String(row["Email"] || "").trim();

//       if (!salutation || !name || !phoneKey) {
//         const missing = []; if (!salutation) missing.push("Salutation"); if (!name) missing.push("Name"); if (!phoneKey) missing.push("Phone");
//         const reason = `Missing: ${missing.join(", ")}`;
//         skipped.push({ row: rowNum, reason, data: { ...row } });
//         previewRowsArr.push({ rowNum, valid: false, reason, data: row });
//         return;
//       }
//       if (phoneKey && seenPhoneKeys.has(phoneKey)) {
//         localDuplicates.push({ row: rowNum, reason: "Duplicate phone in file", data: { ...row }, duplicateFields: ["phone"] });
//         previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate phone", data: row });
//         return;
//       }
//       if (email && seenEmails.has(email.toLowerCase())) {
//         localDuplicates.push({ row: rowNum, reason: "Duplicate email in file", data: { ...row }, duplicateFields: ["email"] });
//         previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate email", data: row });
//         return;
//       }
//       const phoneDigits = phone.replace(/[^\d+]/g, "");
//       if (!/^\+91\d{10}$/.test(phoneDigits) && !/^\+\d{10,15}$/.test(phoneDigits)) {
//         const reason = `Invalid phone (${phone})`;
//         skipped.push({ row: rowNum, reason, data: { ...row } });
//         previewRowsArr.push({ rowNum, valid: false, reason, data: row });
//         return;
//       }
//       if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//         const reason = "Invalid email";
//         skipped.push({ row: rowNum, reason, data: { ...row } });
//         previewRowsArr.push({ rowNum, valid: false, reason, data: row });
//         return;
//       }

//       const whatsapp_number = row["WhatsApp Number"] ? parsePhoneNumber(row["WhatsApp Number"]) : "";
//       const normalizedLead = {
//         salutation, name, phone, email: email || "",
//         lead_type: row["Lead Type"] || "",
//         priority: row["Priority"] || "",
//         lead_source: row["Lead Source"] || "",
//         status: row["Lead Status"] || "",
//         state: row["State"] || "",
//         city: row["City"] || "",
//         location: row["Location"] || "",
//         whatsapp_number,
//       };
//       validData.push(normalizedLead);
//       previewRowsArr.push({ rowNum, valid: true, reason: "Valid", data: row, normalizedData: normalizedLead });
//       seenPhoneKeys.add(phoneKey);
//       if (email) seenEmails.add(email.toLowerCase());
//     });
//     return { validData, nonDuplicateSkipped: skipped, localDuplicates, previewRows: previewRowsArr };
//   };

//   const processPreviewData = (rawData: RawRow[], source: string) => {
//     setPreviewLoading(true);
//     try {
//       const { validData, nonDuplicateSkipped, localDuplicates, previewRows } = filterValidLeads(rawData);
//       setValidPreviewData(validData);
//       setPreviewSkipped(nonDuplicateSkipped);
//       setPreviewDuplicates(localDuplicates);
//       setPreviewRows(previewRows);
//       setShowPreview(true);
//       if (validData.length === 0) toast.warning(`No valid leads in ${source}.`);
//       else toast.info(`Preview: ${validData.length} valid, ${nonDuplicateSkipped.length + localDuplicates.length} issues.`);
//     } catch (err) { console.error(err); toast.error(`Error processing ${source}`); }
//     finally { setPreviewLoading(false); }
//   };

//   // --- Auto preview from file (triggered on file selection) ---
//   const autoPreviewFile = useCallback(async (selectedFile: File) => {
//     setPreviewLoading(true);
//     try {
//       const reader = new FileReader();
//       reader.onload = async (evt) => {
//         try {
//           const result = evt.target?.result;
//           if (!result) { toast.error("Failed to read file"); return; }
//           let wb: any;
//           if (selectedFile.name.toLowerCase().endsWith(".csv")) wb = XLSX.read(result as string, { type: "string", raw: true });
//           else wb = XLSX.read(result as ArrayBuffer, { type: "array", raw: true });
//           const ws = wb.Sheets[wb.SheetNames[0]];
//           if (!ws) { toast.error("No sheet found"); return; }
//           const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
//           if (!data || data.length === 0) { toast.error("File is empty"); return; }
//           processPreviewData(data, "file");
//         } catch (e) { console.error(e); toast.error("Error parsing file"); }
//         finally { setPreviewLoading(false); }
//       };
//       if (selectedFile.name.toLowerCase().endsWith(".csv")) reader.readAsText(selectedFile);
//       else reader.readAsArrayBuffer(selectedFile);
//     } catch (e) { console.error(e); toast.error("Error reading file"); setPreviewLoading(false); }
//   }, []);

//   // --- Auto preview from Google Sheet (debounced) ---
//   const autoPreviewSheet = useCallback(async (url: string) => {
//     if (!url.trim()) return;
//     setPreviewLoading(true);
//     try {
//       const sheetIdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
//       if (!sheetIdMatch) { toast.error("Invalid Google Sheet URL"); setPreviewLoading(false); return; }
//       const sheetId = sheetIdMatch[1];
//       const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
//       const response = await fetch(exportUrl);
//       if (!response.ok) { toast.error(response.status === 403 ? "Sheet not public" : "Failed to fetch sheet"); setPreviewLoading(false); return; }
//       const csvText = await response.text();
//       if (!csvText.trim()) { toast.error("Sheet is empty"); setPreviewLoading(false); return; }
//       const wb = XLSX.read(csvText, { type: "string", raw: true });
//       const ws = wb.Sheets[wb.SheetNames[0]];
//       if (!ws) { toast.error("No sheet found"); setPreviewLoading(false); return; }
//       const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
//       if (!data || data.length === 0) { toast.error("No data in sheet"); setPreviewLoading(false); return; }
//       processPreviewData(data, "Google Sheet");
//     } catch (e) { console.error(e); toast.error("Error loading sheet"); setPreviewLoading(false); }
//   }, []);

//   // Trigger auto preview when file changes
//   useEffect(() => {
//     if (file) autoPreviewFile(file);
//     else { setShowPreview(false); setPreviewRows([]); setValidPreviewData([]); }
//   }, [file, autoPreviewFile]);

//   // Trigger auto preview when sheetUrl changes (debounced)
//   useEffect(() => {
//     if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current);
//     if (sheetUrl.trim()) {
//       sheetDebounceRef.current = setTimeout(() => autoPreviewSheet(sheetUrl), 1000);
//     } else {
//       setShowPreview(false);
//       setPreviewRows([]);
//       setValidPreviewData([]);
//     }
//     return () => { if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current); };
//   }, [sheetUrl, autoPreviewSheet]);

//   // --- Assignment & Import ---
//   const applyAssignmentPolicy = (rows: any[]): any[] => {
//     if (onlyThisExecutive) {
//       const selfId = user?.id || user?.userId || user?._id || String(user?.email || user?.username || "me");
//       return rows.map(r => ({ ...r, assigned_executive: selfId }));
//     }
//     if (assignmentMode === "none") return rows.map(r => ({ ...r, assigned_executive: "" }));
//     const ids = Array.from(selectedExecIds);
//     if (ids.length === 0) return rows.map(r => ({ ...r, assigned_executive: "" }));
//     const n = ids.length;
//     return rows.map((r, i) => ({ ...r, assigned_executive: ids[i % n] }));
//   };

//   const callImportAPI = async (payloadRows: any[]) => {
//     try { return await (leadsAPI as any).importLeads(payloadRows); }
//     catch { try { return await (leadsAPI as any).importLeads({ rows: payloadRows }); } catch { return await (leadsAPI as any).importLeads({ data: payloadRows }); } }
//   };

//   const executeImport = async () => {
//     if (validPreviewData.length === 0) { toast.error("No valid leads to import"); return; }
//     if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) { toast.error("Select at least one executive or choose 'None'"); return; }
//     setIsUploading(true);
//     try {
//       const payload = applyAssignmentPolicy(validPreviewData);
//       const res = await callImportAPI(payload);
//       const ok = res?.success === true || res?.ok === true || (typeof res?.status === "number" && res.status >= 200 && res.status < 300) || typeof res?.inserted !== "undefined";
//       if (!ok) { toast.error(res?.message || "Import failed"); setIsUploading(false); return; }
//       const insertedCount = res?.inserted ?? res?.data?.inserted ?? payload.length;
//       const serverSkipped = res?.skippedRows ?? res?.data?.skippedRows ?? [];
//       const serverUpdated = res?.updatedRows ?? res?.data?.updatedRows ?? [];
//       const isDuplicateReason = (reason: string) => /duplicate/i.test(reason || "");
//       const serverDuplicates = serverSkipped.filter((s: any) => isDuplicateReason(s?.reason)).map((s: any) => ({ row: s.row, reason: s.reason, data: s.data, duplicateFields: [], existingId: s.id }));
//       const serverNonDupSkipped = serverSkipped.filter((s: any) => !isDuplicateReason(s?.reason)).map((s: any) => ({ row: s.row ?? 0, reason: s.reason, data: s.data }));
//       setDuplicates([...previewDuplicates, ...serverDuplicates]);
//       setSkippedRows([...previewSkipped, ...serverNonDupSkipped]);
//       setUpdatedRows(serverUpdated);
//       if (insertedCount > 0 && previewDuplicates.length === 0 && previewSkipped.length === 0 && serverDuplicates.length === 0 && serverNonDupSkipped.length === 0) {
//         toast.success(`Imported ${insertedCount} lead(s) successfully.`);
//         if (typeof (leadsAPI as any).getLeads === "function") await (leadsAPI as any).getLeads();
//         resetAndClose();
//       } else {
//         const parts = [`${insertedCount} imported`, `${previewDuplicates.length + serverDuplicates.length} duplicate`, `${previewSkipped.length + serverNonDupSkipped.length} skipped`];
//         toast.info(`Import summary: ${parts.join(" • ")}`);
//         setShowSummary(true);
//       }
//     } catch (err) { console.error(err); toast.error("Import failed unexpectedly"); }
//     finally { setIsUploading(false); }
//   };

//   const resetAndClose = () => {
//     setFile(null); setSheetUrl(""); setPreviewRows([]); setValidPreviewData([]); setPreviewSkipped([]); setPreviewDuplicates([]); setShowPreview(false);
//     setSkippedRows([]); setUpdatedRows([]); setDuplicates([]); setShowSummary(false); setIsUploading(false); setDragActive(false);
//     onClose();
//   };

//   const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) return;
//     if (!["csv", "xlsx", "xls"].includes(f.name.split(".").pop()?.toLowerCase() || "")) { toast.error("Only Excel/CSV files"); return; }
//     setFile(f);
//   };

//   const previewColumns = useMemo(() => {
//     if (previewRows.length === 0) return [];
//     const keysSet = new Set<string>();
//     previewRows.forEach(row => Object.keys(row.data).forEach(k => { if (k && String(k).trim()) keysSet.add(k); }));
//     return Array.from(keysSet);
//   }, [previewRows]);

//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
//         <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
//           {/* Header - compact */}
//           <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
//             <div className="flex items-center gap-2">
//               <div className="p-1 rounded-lg" style={{ background: `${O}20` }}><Upload size={14} style={{ color: O }} /></div>
//               <div><h2 className="text-sm font-bold text-white">Import Leads</h2><p className="text-[9px] text-white/70">Excel / CSV / Google Sheets</p></div>
//             </div>
//             <button onClick={resetAndClose} className="p-1 rounded hover:bg-white/10"><X size={14} className="text-white" /></button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-3 space-y-3">
//             {/* Import Methods - compact grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {/* File Upload */}
//               <div className="rounded-lg p-2 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
//                 <div className="flex items-center gap-1.5"><div className="p-1 rounded" style={{ background: `${O}10` }}><FileSpreadsheet size={12} style={{ color: O }} /></div><h3 className="text-[10px] font-semibold" style={{ color: N }}>Upload File</h3></div>
//                 <div className={`relative border-2 border-dashed rounded-lg p-2 text-center transition-all ${dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 bg-white"}`}
//                   onDragEnter={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={e => { e.preventDefault(); setDragActive(false); }} onDragOver={e => { e.preventDefault(); setDragActive(true); }}
//                   onDrop={e => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer?.files[0]; if (f && ["csv","xlsx","xls"].includes(f.name.split(".").pop()?.toLowerCase() || "")) setFile(f); else toast.error("Invalid file"); }}>
//                   <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
//                   {file ? <div><CheckCircle size={14} style={{ color: O }} /><p className="text-[9px] truncate">{file.name}</p></div> : <div><Upload size={12} style={{ color: MU }} /><p className="text-[9px]">Drop file or click</p><p className="text-[7px]">Excel/CSV</p></div>}
//                 </div>
//               </div>

//               {/* Google Sheet */}
//               <div className="rounded-lg p-2 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
//                 <div className="flex items-center gap-1.5"><div className="p-1 rounded" style={{ background: `${O}10` }}><svg className="w-3 h-3" style={{ color: O }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></div><h3 className="text-[10px] font-semibold" style={{ color: N }}>Google Sheets</h3></div>
//                 <input type="text" placeholder="https://docs.google.com/spreadsheets/..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} className="w-full px-2 py-1 text-[9px] border rounded" style={{ borderColor: BD }} />
//                 <div className="rounded p-1.5 text-[8px]" style={{ background: `${O}05`, border: `1px solid ${O}20`, color: MU }}>🔗 Must be public "Anyone with link can view"</div>
//               </div>
//             </div>

//             {/* Assignment Section - compact */}
//             <div className="rounded-lg p-2 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
//               <div className="flex items-center gap-1.5"><div className="p-1 rounded" style={{ background: `${O}10` }}><Users size={12} style={{ color: O }} /></div><h3 className="text-[10px] font-semibold" style={{ color: N }}>Lead Assignment</h3></div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//                 <div className="space-y-1">
//                   <label className="flex items-center gap-1.5 text-[9px]"><input type="radio" className="accent-orange-500" checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} /><span>None</span></label>
//                   <label className="flex items-center gap-1.5 text-[9px]"><input type="radio" className="accent-orange-500" checked={assignmentMode === "selected" || onlyThisExecutive} onChange={() => setAssignmentMode("selected")} disabled={onlyThisExecutive} /><span>{onlyThisExecutive ? "Assigned to you" : "Selected (round-robin)"}</span></label>
//                 </div>
//                 <div className="md:col-span-2 relative" ref={dropdownRef}>
//                   <button type="button" onClick={() => setExecDropdownOpen(s => !s)} disabled={!(assignmentMode === "selected" || onlyThisExecutive)} className={`w-full flex justify-between rounded border px-2 py-1 text-[9px] ${(assignmentMode === "selected" || onlyThisExecutive) ? "bg-white" : "bg-gray-100"}`} style={{ borderColor: BD }}>
//                     <span>{onlyThisExecutive ? (executives[0]?.name || "You") : selectedExecIds.size > 0 ? `${selectedExecIds.size} selected` : "Select executives"}</span>
//                     <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
//                   </button>
//                   {execDropdownOpen && (assignmentMode === "selected" || onlyThisExecutive) && !onlyThisExecutive && (
//                     <div className="absolute z-20 mt-1 w-full rounded border shadow-lg bg-white" style={{ borderColor: BD }}>
//                       <div className="p-1.5 border-b"><input type="text" placeholder="Search..." value={execSearch} onChange={e => setExecSearch(e.target.value)} className="w-full px-2 py-0.5 text-[9px] border rounded" /></div>
//                       <div className="max-h-48 overflow-auto">
//                         {execsLoading ? <div className="p-2 text-center text-[9px]">Loading...</div> : filteredExecutives.length === 0 ? <div className="p-2 text-center text-[9px]">No executives</div> : filteredExecutives.map(e => (<label key={e.id} className="flex items-center gap-2 px-2 py-1 hover:bg-orange-50 text-[9px]"><input type="checkbox" className="accent-orange-500" checked={selectedExecIds.has(e.id)} onChange={() => toggleExec(e.id)}/><span>{e.name}</span></label>))}
//                       </div>
//                       <div className="flex justify-between p-1.5 border-t"><div className="flex gap-1"><button onClick={selectAllExecs} className="px-2 py-0.5 text-[8px] border rounded">All</button><button onClick={clearExecs} className="px-2 py-0.5 text-[8px] border rounded">Clear</button></div><button onClick={() => setExecDropdownOpen(false)} className="px-2 py-0.5 text-[8px] rounded text-white" style={{ background: O }}>Done</button></div>
//                     </div>
//                   )}
//                   {!onlyThisExecutive && <p className="mt-0.5 text-[7px]" style={{ color: MU }}>Round‑robin across selected</p>}
//                 </div>
//               </div>
//             </div>

//             {/* Preview Section - auto shown */}
//             {showPreview && (
//               <div className="rounded-lg p-2 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
//                 <div className="flex justify-between items-center"><div className="flex items-center gap-1.5"><div className="p-1 rounded" style={{ background: `${O}10` }}><Database size={12} style={{ color: O }} /></div><h3 className="text-[10px] font-semibold">Data Preview</h3></div><div className="flex gap-1 text-[8px]"><span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">Valid: {validPreviewData.length}</span><span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-800">Issues: {previewSkipped.length + previewDuplicates.length}</span></div></div>
//                 {previewRows.length > 0 ? (
//                   <div className="overflow-x-auto border rounded" style={{ borderColor: BD }}>
//                     <div className="max-h-[250px] overflow-auto">
//                       <table className="w-full text-[8px] border-collapse">
//                         <thead className="sticky top-0" style={{ background: BG }}><tr><th className="border px-1 py-0.5">#</th><th className="border px-1 py-0.5">Status</th>{previewColumns.map(col => <th key={col} className="border px-1 py-0.5 min-w-[80px]">{col}</th>)}</tr></thead>
//                         <tbody>{previewRows.slice(0, 50).map(row => (<tr key={row.rowNum} className={row.valid ? "hover:bg-green-50" : "hover:bg-red-50"}><td className="border px-1 py-0.5 text-center">{row.rowNum}</td><td className="border px-1 py-0.5" style={{ color: row.valid ? "#2e7d32" : "#c62828" }}>{row.valid ? "✅" : `❌ ${row.reason?.substring(0, 25)}`}</td>{previewColumns.map(col => <td key={col} className="border px-1 py-0.5">{row.data[col] && String(row.data[col]).substring(0, 40) || "-"}</td>)}</tr>))}</tbody>
//                       </table>
//                       {previewRows.length > 50 && <div className="text-center py-1 text-[7px]" style={{ color: MU }}>Showing first 50 of {previewRows.length}</div>}
//                     </div>
//                   </div>
//                 ) : <div className="text-center py-3 text-[9px]" style={{ color: MU }}>No data to preview. Select a file or paste sheet URL.</div>}
//                 {validPreviewData.length > 0 && (
//                   <button onClick={executeImport} disabled={isUploading} className="w-full py-1 rounded text-[9px] font-medium text-white flex items-center justify-center gap-1 disabled:opacity-50" style={{ background: O }}>
//                     {isUploading ? <><span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Importing...</> : <><Upload size={12}/> Import {validPreviewData.length} Valid Lead(s)</>}
//                   </button>
//                 )}
//               </div>
//             )}

//             {/* Help text - compact */}
//             <div className="rounded p-2" style={{ background: `${O}05`, border: `1px solid ${O}20` }}>
//               <div className="flex gap-1.5"><AlertCircle size={12} style={{ color: O }} /><div><h4 className="text-[9px] font-semibold" style={{ color: O }}>Required: Salutation*, Name*, Phone*</h4><p className="text-[7px] text-gray-500">Email optional • Auto‑detects duplicates • Phone cleaned to +91XXXXXXXXXX</p></div></div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="px-3 py-2 border-t flex gap-2" style={{ borderColor: BD, background: BG }}>
//             <button onClick={downloadLeadTemplate} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-[9px] font-medium text-white" style={{ background: O }}><Download size={10}/> Template</button>
//             <button onClick={resetAndClose} className="flex-1 px-2 py-1 text-[9px] border rounded hover:bg-gray-50" style={{ borderColor: BD, color: N }}>Cancel</button>
//           </div>
//         </div>
//       </div>
//       <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} duplicates={duplicates} skippedRows={skippedRows} updatedRows={updatedRows} />
//     </>
//   );
// }







// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   ChangeEvent,
//   useCallback,
// } from "react";
// import {
//   X,
//   Upload,
//   FileSpreadsheet,
//   Download,
//   AlertCircle,
//   Users,
//   CheckCircle,
//   XCircle,
//   Database,
// } from "lucide-react";
// import * as XLSXRaw from "xlsx-js-style";
// import { leadsAPI, usersAPI } from "@/lib/api";
// import { toast } from "react-toastify";
// import { useAuth } from "@/contexts/AuthContext";

// const XLSX = XLSXRaw as any;

// // Theme Colors
// const N = "#0f2b3d";
// const O = "#e67e22";
// const BG = "#f8fafc";
// const BD = "#e2e8f0";
// const MU = "#5a7184";

// // Types
// type RawRow = Record<string, any>;
// type SkippedRow = { row: number; reason: string; data: RawRow };
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
// type PreviewRow = {
//   rowNum: number;
//   valid: boolean;
//   reason?: string;
//   data: RawRow;
//   normalizedData?: any;
// };
// type Executive = {
//   id: string | number;
//   name: string;
//   email?: string;
//   username?: string;
// };
// type AssignmentMode = "none" | "selected";

// // Helper functions
// const getRoleString = (u: any): string => {
//   const r =
//     u?.role ||
//     u?.roles ||
//     u?.raw?.role ||
//     u?.raw?.roles ||
//     u?.user?.role ||
//     u?.user?.roles ||
//     "";
//   return Array.isArray(r)
//     ? r.join(",").toLowerCase()
//     : String(r || "").toLowerCase();
// };
// const isExecutiveUser = (u: any): boolean => {
//   const rs = getRoleString(u);
//   return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
// };
// const normalizeSalutation = (s: string): string =>
//   (s || "").trim().replace(/\.{2,}/g, ".");
// const toCanonicalPhone = (raw: any): { display: string; key: string } => {
//   if (raw === null || raw === undefined || String(raw).trim() === "")
//     return { display: "", key: "" };
//   let phoneStr = String(raw).trim();
//   if (/e\+\d+$/i.test(phoneStr)) {
//     const n = Number(phoneStr);
//     if (!isNaN(n)) phoneStr = Math.round(n).toString();
//   }
//   phoneStr = phoneStr.replace(/[^\d+]/g, "").replace(/^0+/, "");
//   const justDigits = phoneStr.replace(/[^\d]/g, "");
//   if (
//     /^\+?91\d{10}$/.test(phoneStr) ||
//     /^91\d{10}$/.test(phoneStr) ||
//     /^\d{10}$/.test(justDigits)
//   ) {
//     const last10 = justDigits.slice(-10);
//     return { display: `+91${last10}`, key: last10 };
//   }
//   return {
//     display: phoneStr.startsWith("+") ? phoneStr : `+${phoneStr}`,
//     key: justDigits,
//   };
// };
// const parsePhoneNumber = (val: any) => toCanonicalPhone(val).display;

// // ---------- Summary Modal (clean JSX) ----------
// function SummaryModal({
//   isOpen,
//   onClose,
//   title = "Import Summary",
//   duplicates,
//   skippedRows,
//   updatedRows,
// }: any) {
//   if (!isOpen) return null;
//   const allKeys = Array.from(
//     new Set(
//       [
//         ...duplicates.map((r) => r.data),
//         ...skippedRows.map((r) => r.data),
//         ...updatedRows.map((r) => r.data),
//       ].flatMap((row) =>
//         Object.keys(row).filter((k) => row[k] && String(row[k]).trim() !== ""),
//       ),
//     ),
//   );
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }}
//     >
//       <div
//         className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
//         style={{ border: `1px solid ${BD}` }}
//       >
//         <div
//           className="px-5 py-4 flex items-center justify-between"
//           style={{ background: N }}
//         >
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg" style={{ background: `${O}20` }}>
//               <AlertCircle size={18} style={{ color: O }} />
//             </div>
//             <div>
//               <h2 className="text-base font-bold text-white">{title}</h2>
//               <p className="text-xs text-white/70">Review import results</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10">
//             <X size={18} className="text-white" />
//           </button>
//         </div>
//         <div className="flex-1 overflow-y-auto p-5 space-y-5">
//           <div className="flex flex-wrap gap-4">
//             <div
//               className="flex items-center gap-2 px-4 py-2 rounded-lg"
//               style={{ background: `${O}10` }}
//             >
//               <Users size={16} style={{ color: O }} />
//               <span className="text-sm font-semibold" style={{ color: N }}>
//                 Duplicates: {duplicates.length}
//               </span>
//             </div>
//             <div
//               className="flex items-center gap-2 px-4 py-2 rounded-lg"
//               style={{ background: `${O}10` }}
//             >
//               <XCircle size={16} style={{ color: O }} />
//               <span className="text-sm font-semibold" style={{ color: N }}>
//                 Skipped: {skippedRows.length}
//               </span>
//             </div>
//             {updatedRows.length > 0 && (
//               <div
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg"
//                 style={{ background: `${O}10` }}
//               >
//                 <CheckCircle size={16} style={{ color: O }} />
//                 <span className="text-sm font-semibold" style={{ color: N }}>
//                   Updated: {updatedRows.length}
//                 </span>
//               </div>
//             )}
//           </div>

//           {duplicates.length > 0 && (
//             <div>
//               <h4
//                 className="text-sm font-semibold mb-3 flex items-center gap-2"
//                 style={{ color: O }}
//               >
//                 <AlertCircle size={14} /> Duplicates
//               </h4>
//               <div className="max-h-[260px] overflow-auto border rounded-lg">
//                 <table className="w-full text-xs border-collapse">
//                   <thead className="sticky top-0" style={{ background: BG }}>
//                     <tr>
//                       <th className="border px-2 py-1.5">Row</th>
//                       <th className="border px-2 py-1.5">Duplicate Fields</th>
//                       <th className="border px-2 py-1.5">Existing ID</th>
//                       <th className="border px-2 py-1.5">Reason</th>
//                       {allKeys.map((k) => (
//                         <th key={k} className="border px-2 py-1.5">
//                           {k}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {duplicates.map((row, idx) => (
//                       <tr key={idx}>
//                         <td className="border px-2 py-1.5 text-center">
//                           {row.row ?? "-"}
//                         </td>
//                         <td className="border px-2 py-1.5">
//                           {row.duplicateFields?.join(", ") || "-"}
//                         </td>
//                         <td className="border px-2 py-1.5 text-center">
//                           {row.existingId ?? "-"}
//                         </td>
//                         <td className="border px-2 py-1.5" style={{ color: O }}>
//                           {row.reason}
//                         </td>
//                         {allKeys.map((k) => (
//                           <td key={k} className="border px-2 py-1.5">
//                             {row.data?.[k]}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {skippedRows.length > 0 && (
//             <div>
//               <h4
//                 className="text-sm font-semibold mb-3 flex items-center gap-2"
//                 style={{ color: MU }}
//               >
//                 Skipped
//               </h4>
//               <div className="max-h-[240px] overflow-auto border rounded-lg">
//                 <table className="w-full text-xs border-collapse">
//                   <thead className="sticky top-0" style={{ background: BG }}>
//                     <tr>
//                       <th className="border px-2 py-1.5">Row</th>
//                       <th className="border px-2 py-1.5">Reason</th>
//                       {allKeys.map((k) => (
//                         <th key={k} className="border px-2 py-1.5">
//                           {k}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {skippedRows.map((row, idx) => (
//                       <tr key={idx}>
//                         <td className="border px-2 py-1.5 text-center">
//                           {row.row}
//                         </td>
//                         <td
//                           className="border px-2 py-1.5"
//                           style={{ color: MU }}
//                         >
//                           {row.reason}
//                         </td>
//                         {allKeys.map((k) => (
//                           <td key={k} className="border px-2 py-1.5">
//                             {row.data[k]}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {updatedRows.length > 0 && (
//             <div>
//               <h4
//                 className="text-sm font-semibold mb-3 flex items-center gap-2"
//                 style={{ color: O }}
//               >
//                 Updated
//               </h4>
//               <div className="max-h-[240px] overflow-auto border rounded-lg">
//                 <table className="w-full text-xs border-collapse">
//                   <thead className="sticky top-0" style={{ background: BG }}>
//                     <tr>
//                       <th className="border px-2 py-1.5">Row</th>
//                       <th className="border px-2 py-1.5">ID</th>
//                       <th className="border px-2 py-1.5">Note</th>
//                       {allKeys.map((k) => (
//                         <th key={k} className="border px-2 py-1.5">
//                           {k}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {updatedRows.map((row, idx) => (
//                       <tr key={idx}>
//                         <td className="border px-2 py-1.5 text-center">
//                           {row.row ?? "-"}
//                         </td>
//                         <td className="border px-2 py-1.5 text-center">
//                           {row.id ?? "-"}
//                         </td>
//                         <td className="border px-2 py-1.5" style={{ color: O }}>
//                           {row.note || "Updated"}
//                         </td>
//                         {allKeys.map((k) => (
//                           <td key={k} className="border px-2 py-1.5">
//                             {row.data?.[k]}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//         <div
//           className="px-5 py-3 border-t flex justify-end"
//           style={{ borderColor: BD, background: BG }}
//         >
//           <button
//             onClick={onClose}
//             className="px-4 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
//             style={{ borderColor: BD, color: N }}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ---------- Template Download ----------
// const TEMPLATE_HEADERS = [
//   "Salutation*",
//   "Name*",
//   "Phone*",
//   "Email",
//   "Lead Type",
//   "Priority",
//   "Lead Source",
//   "Lead Status",
//   "State",
//   "City",
//   "Location",
//   "WhatsApp Number",
// ];
// const SAMPLE_ROWS = [
//   [
//     "Mr",
//     "Rahul Sharma",
//     "9876543210",
//     "rahul.sharma@example.com",
//     "Walk-In Lead",
//     "Medium",
//     "Website",
//     "New",
//     "Maharashtra",
//     "Mumbai",
//     "Bandra West",
//     "9876543210",
//   ],
//   [
//     "Ms",
//     "Priya Patel",
//     "9988776655",
//     "priya.patel@example.com",
//     "Online Lead",
//     "High",
//     "Google Ads",
//     "Contacted",
//     "Gujarat",
//     "Ahmedabad",
//     "Satellite",
//     "9988776655",
//   ],
//   [
//     "Dr",
//     "Amit Kumar",
//     "9876541230",
//     "amit.kumar@example.com",
//     "Referral",
//     "Low",
//     "Customer Referral",
//     "Qualified",
//     "Delhi",
//     "New Delhi",
//     "Connaught Place",
//     "9876541230",
//   ],
// ];
// const downloadLeadTemplate = () => {
//   const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...SAMPLE_ROWS]);
//   [0, 1, 2].forEach((c) => {
//     const addr = XLSX.utils.encode_cell({ r: 0, c });
//     if (ws[addr])
//       (ws as any)[addr].s = {
//         font: { color: { rgb: "FF0000" }, bold: true },
//         alignment: { horizontal: "center" },
//       };
//   });
//   for (let c = 3; c < TEMPLATE_HEADERS.length; c++) {
//     const addr = XLSX.utils.encode_cell({ r: 0, c });
//     if (ws[addr])
//       (ws as any)[addr].s = {
//         font: { bold: true },
//         alignment: { horizontal: "center" },
//       };
//   }
//   for (let r = 1; r < SAMPLE_ROWS.length + 1; r++)
//     for (let c = 0; c < TEMPLATE_HEADERS.length; c++) {
//       const addr = XLSX.utils.encode_cell({ r, c });
//       if (ws[addr]) (ws as any)[addr].s = { alignment: { horizontal: "left" } };
//     }
//   (ws as any)["!cols"] = [12, 20, 15, 25, 15, 12, 18, 14, 14, 14, 18, 15].map(
//     (w) => ({ width: w }),
//   );
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "Leads Template");
//   XLSX.writeFile(wb, "Leads_Import_Template.xlsx");
// };

// // ---------- Main Component ----------
// type ImportLeadsModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;   // 👈 add this
// };

// export default function ImportLeadsModal({
//   isOpen,
//   onClose,
//   onSuccess,                // 👈 add here
// }: ImportLeadsModalProps) {
//   const { user } = useAuth() as any;
//   const onlyThisExecutive = isExecutiveUser(user);

//   const [file, setFile] = useState<File | null>(null);
//   const [sheetUrl, setSheetUrl] = useState<string>("");
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [dragActive, setDragActive] = useState<boolean>(false);
//   const [previewLoading, setPreviewLoading] = useState<boolean>(false);
//   const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
//   const [validPreviewData, setValidPreviewData] = useState<any[]>([]);
//   const [previewSkipped, setPreviewSkipped] = useState<SkippedRow[]>([]);
//   const [previewDuplicates, setPreviewDuplicates] = useState<DuplicateRow[]>(
//     [],
//   );
//   const [showPreview, setShowPreview] = useState<boolean>(false);
//   const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
//   const [updatedRows, setUpdatedRows] = useState<UpdatedRow[]>([]);
//   const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);
//   const [showSummary, setShowSummary] = useState<boolean>(false);
//   const [execsLoading, setExecsLoading] = useState<boolean>(false);
//   const [executives, setExecutives] = useState<Executive[]>([]);
//   const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
//   const [execSearch, setExecSearch] = useState<string>("");
//   const [selectedExecIds, setSelectedExecIds] = useState<Set<string | number>>(
//     new Set(),
//   );
//   const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("none");
//   const dropdownRef = useRef<HTMLDivElement | null>(null);
//   const sheetDebounceRef = useRef<NodeJS.Timeout | null>(null);

//   // Fetch executives from Sales department, Sales Executive role
//   useEffect(() => {
//     if (!isOpen) return;
//     (async () => {
//       try {
//         setExecsLoading(true);
//         const formatName = (u: any) => {
//           const salutation = u?.salutation ? `${u.salutation} ` : "";
//           const name =
//             `${salutation}${u?.first_name || ""} ${u?.last_name || ""}`.trim();
//           return name || u?.username || u?.email || "Executive";
//         };
//         if (onlyThisExecutive) {
//           const selfId =
//             user?.id ||
//             user?.userId ||
//             user?._id ||
//             String(user?.email || user?.username || "me");
//           setExecutives([
//             {
//               id: selfId,
//               name: formatName(user),
//               email: user?.email,
//               username: user?.username,
//             },
//           ]);
//           setSelectedExecIds(new Set([selfId]));
//           setAssignmentMode("selected");
//           return;
//         }
// const res = await usersAPI.getByDeptRole({
//   department: 'presales',
//   role: 'presales executive',
//   is_active: 1,
//   limit: 100,
// });
// const list = Array.isArray(res) ? res : res?.data || res?.items || [];
//         const mapped: Executive[] = list.map((u: any) => ({
//           id: u.id || u.userId || u._id,
//           name: formatName(u),
//           email: u.email,
//           username: u.username,
//         }));
//         setExecutives(mapped);
//       } catch (e) {
//         console.error(e);
//         toast.error("Could not fetch sales executives");
//       } finally {
//         setExecsLoading(false);
//       }
//     })();
//   }, [isOpen, user, onlyThisExecutive]);

//   const filteredExecutives = useMemo(() => {
//     if (!execSearch.trim()) return executives;
//     const s = execSearch.toLowerCase();
//     return executives.filter(
//       (e) =>
//         String(e.name).toLowerCase().includes(s) ||
//         String(e.email).toLowerCase().includes(s),
//     );
//   }, [execSearch, executives]);

//   const toggleExec = (id: string | number) =>
//     setSelectedExecIds((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   const selectAllExecs = () =>
//     setSelectedExecIds(new Set(executives.map((e) => e.id)));
//   const clearExecs = () => setSelectedExecIds(new Set());

//   // Validation logic
//   const filterValidLeads = (data: RawRow[]) => {
//     const seenPhoneKeys = new Set<string>();
//     const seenEmails = new Set<string>();
//     const validData: any[] = [];
//     const skipped: SkippedRow[] = [];
//     const localDuplicates: DuplicateRow[] = [];
//     const previewRowsArr: PreviewRow[] = [];

//     data.forEach((row, index) => {
//       const rowNum = index + 2;
//       const salutation = normalizeSalutation(row["Salutation*"] || "");
//       const name = String(row["Name*"] || "").trim();
//       const phoneParsed = toCanonicalPhone(row["Phone*"]);
//       const phone = phoneParsed.display;
//       const phoneKey = phoneParsed.key;
//       const email = String(row["Email"] || "").trim();

//       if (!salutation || !name || !phoneKey) {
//         const missing = [];
//         if (!salutation) missing.push("Salutation");
//         if (!name) missing.push("Name");
//         if (!phoneKey) missing.push("Phone");
//         const reason = `Missing: ${missing.join(", ")}`;
//         skipped.push({ row: rowNum, reason, data: { ...row } });
//         previewRowsArr.push({ rowNum, valid: false, reason, data: row });
//         return;
//       }
//       if (phoneKey && seenPhoneKeys.has(phoneKey)) {
//         localDuplicates.push({
//           row: rowNum,
//           reason: "Duplicate phone in file",
//           data: { ...row },
//           duplicateFields: ["phone"],
//         });
//         previewRowsArr.push({
//           rowNum,
//           valid: false,
//           reason: "Duplicate phone",
//           data: row,
//         });
//         return;
//       }
//       if (email && seenEmails.has(email.toLowerCase())) {
//         localDuplicates.push({
//           row: rowNum,
//           reason: "Duplicate email in file",
//           data: { ...row },
//           duplicateFields: ["email"],
//         });
//         previewRowsArr.push({
//           rowNum,
//           valid: false,
//           reason: "Duplicate email",
//           data: row,
//         });
//         return;
//       }
//       const phoneDigits = phone.replace(/[^\d+]/g, "");
//       if (
//         !/^\+91\d{10}$/.test(phoneDigits) &&
//         !/^\+\d{10,15}$/.test(phoneDigits)
//       ) {
//         const reason = `Invalid phone (${phone})`;
//         skipped.push({ row: rowNum, reason, data: { ...row } });
//         previewRowsArr.push({ rowNum, valid: false, reason, data: row });
//         return;
//       }
//       if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//         const reason = "Invalid email";
//         skipped.push({ row: rowNum, reason, data: { ...row } });
//         previewRowsArr.push({ rowNum, valid: false, reason, data: row });
//         return;
//       }

//       const whatsapp_number = row["WhatsApp Number"]
//         ? parsePhoneNumber(row["WhatsApp Number"])
//         : "";
//       const normalizedLead = {
//         salutation,
//         name,
//         phone,
//         email: email || "",
//         lead_type: row["Lead Type"] || "",
//         priority: row["Priority"] || "",
//         lead_source: row["Lead Source"] || "",
//         status: row["Lead Status"] || "",
//         state: row["State"] || "",
//         city: row["City"] || "",
//         location: row["Location"] || "",
//         whatsapp_number,
//       };
//       validData.push(normalizedLead);
//       previewRowsArr.push({
//         rowNum,
//         valid: true,
//         reason: "Valid",
//         data: row,
//         normalizedData: normalizedLead,
//       });
//       seenPhoneKeys.add(phoneKey);
//       if (email) seenEmails.add(email.toLowerCase());
//     });
//     return {
//       validData,
//       nonDuplicateSkipped: skipped,
//       localDuplicates,
//       previewRows: previewRowsArr,
//     };
//   };

//   const processPreviewData = (rawData: RawRow[], source: string) => {
//     setPreviewLoading(true);
//     try {
//       const { validData, nonDuplicateSkipped, localDuplicates, previewRows } =
//         filterValidLeads(rawData);
//       setValidPreviewData(validData);
//       setPreviewSkipped(nonDuplicateSkipped);
//       setPreviewDuplicates(localDuplicates);
//       setPreviewRows(previewRows);
//       setShowPreview(true);
//       if (validData.length === 0) toast.warning(`No valid leads in ${source}.`);
//       else
//         toast.info(
//           `Preview: ${validData.length} valid, ${nonDuplicateSkipped.length + localDuplicates.length} issues.`,
//         );
//     } catch (err) {
//       console.error(err);
//       toast.error(`Error processing ${source}`);
//     } finally {
//       setPreviewLoading(false);
//     }
//   };

//   // Auto preview from file
//   const autoPreviewFile = useCallback(async (selectedFile: File) => {
//     setPreviewLoading(true);
//     try {
//       const reader = new FileReader();
//       reader.onload = async (evt) => {
//         try {
//           const result = evt.target?.result;
//           if (!result) {
//             toast.error("Failed to read file");
//             return;
//           }
//           let wb: any;
//           if (selectedFile.name.toLowerCase().endsWith(".csv"))
//             wb = XLSX.read(result as string, { type: "string", raw: true });
//           else
//             wb = XLSX.read(result as ArrayBuffer, { type: "array", raw: true });
//           const ws = wb.Sheets[wb.SheetNames[0]];
//           if (!ws) {
//             toast.error("No sheet found");
//             return;
//           }
//           const data: RawRow[] = XLSX.utils.sheet_to_json(ws, {
//             raw: true,
//             defval: "",
//           });
//           if (!data || data.length === 0) {
//             toast.error("File is empty");
//             return;
//           }
//           processPreviewData(data, "file");
//         } catch (e) {
//           console.error(e);
//           toast.error("Error parsing file");
//         } finally {
//           setPreviewLoading(false);
//         }
//       };
//       if (selectedFile.name.toLowerCase().endsWith(".csv"))
//         reader.readAsText(selectedFile);
//       else reader.readAsArrayBuffer(selectedFile);
//     } catch (e) {
//       console.error(e);
//       toast.error("Error reading file");
//       setPreviewLoading(false);
//     }
//   }, []);

//   // Auto preview from Google Sheet
//   const autoPreviewSheet = useCallback(async (url: string) => {
//     if (!url.trim()) return;
//     setPreviewLoading(true);
//     try {
//       const sheetIdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
//       if (!sheetIdMatch) {
//         toast.error("Invalid Google Sheet URL");
//         setPreviewLoading(false);
//         return;
//       }
//       const sheetId = sheetIdMatch[1];
//       const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
//       const response = await fetch(exportUrl);
//       if (!response.ok) {
//         toast.error(
//           response.status === 403
//             ? "Sheet not public"
//             : "Failed to fetch sheet",
//         );
//         setPreviewLoading(false);
//         return;
//       }
//       const csvText = await response.text();
//       if (!csvText.trim()) {
//         toast.error("Sheet is empty");
//         setPreviewLoading(false);
//         return;
//       }
//       const wb = XLSX.read(csvText, { type: "string", raw: true });
//       const ws = wb.Sheets[wb.SheetNames[0]];
//       if (!ws) {
//         toast.error("No sheet found");
//         setPreviewLoading(false);
//         return;
//       }
//       const data: RawRow[] = XLSX.utils.sheet_to_json(ws, {
//         raw: true,
//         defval: "",
//       });
//       if (!data || data.length === 0) {
//         toast.error("No data in sheet");
//         setPreviewLoading(false);
//         return;
//       }
//       processPreviewData(data, "Google Sheet");
//     } catch (e) {
//       console.error(e);
//       toast.error("Error loading sheet");
//       setPreviewLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (file) autoPreviewFile(file);
//     else {
//       setShowPreview(false);
//       setPreviewRows([]);
//       setValidPreviewData([]);
//     }
//   }, [file, autoPreviewFile]);

//   useEffect(() => {
//     if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current);
//     if (sheetUrl.trim()) {
//       sheetDebounceRef.current = setTimeout(
//         () => autoPreviewSheet(sheetUrl),
//         1000,
//       );
//     } else {
//       setShowPreview(false);
//       setPreviewRows([]);
//       setValidPreviewData([]);
//     }
//     return () => {
//       if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current);
//     };
//   }, [sheetUrl, autoPreviewSheet]);

//   // Assignment & Import
//   const applyAssignmentPolicy = (rows: any[]): any[] => {
//     if (onlyThisExecutive) {
//       const selfId =
//         user?.id ||
//         user?.userId ||
//         user?._id ||
//         String(user?.email || user?.username || "me");
//       return rows.map((r) => ({ ...r, assigned_executive: selfId }));
//     }
//     if (assignmentMode === "none")
//       return rows.map((r) => ({ ...r, assigned_executive: "" }));
//     const ids = Array.from(selectedExecIds);
//     if (ids.length === 0)
//       return rows.map((r) => ({ ...r, assigned_executive: "" }));
//     const n = ids.length;
//     return rows.map((r, i) => ({ ...r, assigned_executive: ids[i % n] }));
//   };

//   const callImportAPI = async (payloadRows: any[]) => {
//     try {
//       return await (leadsAPI as any).importLeads(payloadRows);
//     } catch {
//       try {
//         return await (leadsAPI as any).importLeads({ rows: payloadRows });
//       } catch {
//         return await (leadsAPI as any).importLeads({ data: payloadRows });
//       }
//     }
//   };

//   const executeImport = async () => {
//     if (validPreviewData.length === 0) {
//       toast.error("No valid leads to import");
//       return;
//     }
//     if (
//       !onlyThisExecutive &&
//       assignmentMode === "selected" &&
//       selectedExecIds.size === 0
//     ) {
//       toast.error("Select at least one executive or choose 'None'");
//       return;
//     }
//     setIsUploading(true);
//     try {
//       const payload = applyAssignmentPolicy(validPreviewData);
//       const res = await callImportAPI(payload);
//       const ok =
//         res?.success === true ||
//         res?.ok === true ||
//         (typeof res?.status === "number" &&
//           res.status >= 200 &&
//           res.status < 300) ||
//         typeof res?.inserted !== "undefined";
//       if (!ok) {
//         toast.error(res?.message || "Import failed");
//         setIsUploading(false);
//         return;
//       }
//       const insertedCount =
//         res?.inserted ?? res?.data?.inserted ?? payload.length;
//       const serverSkipped = res?.skippedRows ?? res?.data?.skippedRows ?? [];
//       const serverUpdated = res?.updatedRows ?? res?.data?.updatedRows ?? [];
//       const isDuplicateReason = (reason: string) =>
//         /duplicate/i.test(reason || "");
//       const serverDuplicates = serverSkipped
//         .filter((s: any) => isDuplicateReason(s?.reason))
//         .map((s: any) => ({
//           row: s.row,
//           reason: s.reason,
//           data: s.data,
//           duplicateFields: [],
//           existingId: s.id,
//         }));
//       const serverNonDupSkipped = serverSkipped
//         .filter((s: any) => !isDuplicateReason(s?.reason))
//         .map((s: any) => ({ row: s.row ?? 0, reason: s.reason, data: s.data }));
//       setDuplicates([...previewDuplicates, ...serverDuplicates]);
//       setSkippedRows([...previewSkipped, ...serverNonDupSkipped]);
//       setUpdatedRows(serverUpdated);
//       if (
//         insertedCount > 0 &&
//         previewDuplicates.length === 0 &&
//         previewSkipped.length === 0 &&
//         serverDuplicates.length === 0 &&
//         serverNonDupSkipped.length === 0
//       ) {
//         toast.success(`Imported ${insertedCount} lead(s) successfully.`);
//         if (typeof (leadsAPI as any).getLeads === "function")
//           await (leadsAPI as any).getLeads();
//           onSuccess?.();
//         resetAndClose();
//       } else {
//         const parts = [
//           `${insertedCount} imported`,
//           `${previewDuplicates.length + serverDuplicates.length} duplicate`,
//           `${previewSkipped.length + serverNonDupSkipped.length} skipped`,
//         ];
//         toast.info(`Import summary: ${parts.join(" • ")}`);
//         onSuccess?.();
//         setShowSummary(true);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Import failed unexpectedly");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const resetAndClose = () => {
//     setFile(null);
//     setSheetUrl("");
//     setPreviewRows([]);
//     setValidPreviewData([]);
//     setPreviewSkipped([]);
//     setPreviewDuplicates([]);
//     setShowPreview(false);
//     setSkippedRows([]);
//     setUpdatedRows([]);
//     setDuplicates([]);
//     setShowSummary(false);
//     setIsUploading(false);
//     setDragActive(false);
//     onClose();
//   };

//   const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0] ?? null;
//     if (!f) return;
//     if (
//       !["csv", "xlsx", "xls"].includes(
//         f.name.split(".").pop()?.toLowerCase() || "",
//       )
//     ) {
//       toast.error("Only Excel/CSV files");
//       return;
//     }
//     setFile(f);
//   };

//   const previewColumns = useMemo(() => {
//     if (previewRows.length === 0) return [];
//     const keysSet = new Set<string>();
//     previewRows.forEach((row) =>
//       Object.keys(row.data).forEach((k) => {
//         if (k && String(k).trim()) keysSet.add(k);
//       }),
//     );
//     return Array.from(keysSet);
//   }, [previewRows]);

//   if (!isOpen) return null;

//   return (
//     <>
//       <div
//         className="fixed inset-0 z-50 flex items-center justify-center p-4"
//         style={{
//           background: "rgba(15,43,61,0.6)",
//           backdropFilter: "blur(4px)",
//         }}
//       >
//         <div
//           className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
//           style={{ border: `1px solid ${BD}` }}
//         >
//           {/* Header */}
//           <div
//             className="px-5 py-3 flex items-center justify-between"
//             style={{ background: N }}
//           >
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-lg" style={{ background: `${O}20` }}>
//                 <Upload size={18} style={{ color: O }} />
//               </div>
//               <div>
//                 <h2 className="text-lg font-bold text-white">Import Leads</h2>
//                 <p className="text-xs text-white/70">
//                   Import from Excel, CSV, or Google Sheets
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={resetAndClose}
//               className="p-1.5 rounded hover:bg-white/10"
//             >
//               <X size={18} className="text-white" />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-5 space-y-5">
//             {/* Import Methods */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               {/* File Upload */}
//               <div
//                 className="rounded-lg p-4 space-y-3"
//                 style={{ background: BG, border: `1px solid ${BD}` }}
//               >
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="p-1.5 rounded-lg"
//                     style={{ background: `${O}10` }}
//                   >
//                     <FileSpreadsheet size={16} style={{ color: O }} />
//                   </div>
//                   <h3 className="text-sm font-semibold" style={{ color: N }}>
//                     Upload File
//                   </h3>
//                 </div>
//                 <div
//                   className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-all ${dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 bg-white"}`}
//                   onDragEnter={(e) => {
//                     e.preventDefault();
//                     setDragActive(true);
//                   }}
//                   onDragLeave={(e) => {
//                     e.preventDefault();
//                     setDragActive(false);
//                   }}
//                   onDragOver={(e) => {
//                     e.preventDefault();
//                     setDragActive(true);
//                   }}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     setDragActive(false);
//                     const f = e.dataTransfer?.files[0];
//                     if (
//                       f &&
//                       ["csv", "xlsx", "xls"].includes(
//                         f.name.split(".").pop()?.toLowerCase() || "",
//                       )
//                     )
//                       setFile(f);
//                     else toast.error("Invalid file");
//                   }}
//                 >
//                   <input
//                     type="file"
//                     accept=".csv,.xlsx,.xls"
//                     onChange={onFileInputChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   />
// {file ? (
//   <div className="flex flex-col items-center justify-center text-center">
//     <CheckCircle size={20} style={{ color: O }} />
//     <p className="text-sm font-medium mt-1 break-all">{file.name}</p>
//     <p className="text-xs text-gray-500">Click to change</p>
//   </div>
// ) : (
//   <div className="flex flex-col items-center justify-center text-center h-full">
//     <Upload
//       size={28}
//       className="mb-2"
//       style={{ color: MU }}
//     />
//     <p className="text-sm mt-1">
//       Drop file or click to browse
//     </p>
//     <p className="text-xs text-gray-400">
//       Excel (.xlsx, .xls) or CSV
//     </p>
//   </div>
// )}
//                 </div>
//               </div>

//               {/* Google Sheet */}
//               <div
//                 className="rounded-lg p-4 space-y-3"
//                 style={{ background: BG, border: `1px solid ${BD}` }}
//               >
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="p-1.5 rounded-lg"
//                     style={{ background: `${O}10` }}
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       style={{ color: O }}
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                       />
//                     </svg>
//                   </div>
//                   <h3 className="text-sm font-semibold" style={{ color: N }}>
//                     Google Sheets
//                   </h3>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="https://docs.google.com/spreadsheets/..."
//                   value={sheetUrl}
//                   onChange={(e) => setSheetUrl(e.target.value)}
//                   className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
//                   style={{ borderColor: BD }}
//                 />
//                 <div
//                   className="rounded-lg p-3 text-xs"
//                   style={{
//                     background: `${O}05`,
//                     border: `1px solid ${O}20`,
//                     color: MU,
//                   }}
//                 >
//                   🔗 Must be public — "Anyone with link can view"
//                 </div>
//               </div>
//             </div>

//             {/* Lead Assignment */}
//             <div
//               className="rounded-lg p-4 space-y-3"
//               style={{ background: BG, border: `1px solid ${BD}` }}
//             >
//               <div className="flex items-center gap-2">
//                 <div
//                   className="p-1.5 rounded-lg"
//                   style={{ background: `${O}10` }}
//                 >
//                   <Users size={16} style={{ color: O }} />
//                 </div>
//                 <h3 className="text-sm font-semibold" style={{ color: N }}>
//                   Lead Assignment
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="space-y-2">
//                   <label className="flex items-center gap-2 text-sm">
//                     <input
//                       type="radio"
//                       className="accent-orange-500"
//                       checked={assignmentMode === "none"}
//                       onChange={() =>
//                         !onlyThisExecutive && setAssignmentMode("none")
//                       }
//                       disabled={onlyThisExecutive}
//                     />
//                     <span>None</span>
//                   </label>
//                   <label className="flex items-center gap-2 text-sm">
//                     <input
//                       type="radio"
//                       className="accent-orange-500"
//                       checked={
//                         assignmentMode === "selected" || onlyThisExecutive
//                       }
//                       onChange={() => setAssignmentMode("selected")}
//                       disabled={onlyThisExecutive}
//                     />
//                     <span>
//                       {onlyThisExecutive
//                         ? "Assigned to you"
//                         : "Selected executives (round-robin)"}
//                     </span>
//                   </label>
//                 </div>
//                 <div className="md:col-span-2 relative" ref={dropdownRef}>
//                   <button
//                     type="button"
//                     onClick={() => setExecDropdownOpen((s) => !s)}
//                     disabled={
//                       !(assignmentMode === "selected" || onlyThisExecutive)
//                     }
//                     className={`w-full flex justify-between rounded-lg border px-3 py-2 text-sm ${assignmentMode === "selected" || onlyThisExecutive ? "bg-white" : "bg-gray-100 cursor-not-allowed"}`}
//                     style={{ borderColor: BD }}
//                   >
//                     <span>
//                       {onlyThisExecutive
//                         ? executives[0]?.name || "You"
//                         : selectedExecIds.size > 0
//                           ? `${selectedExecIds.size} executive(s) selected`
//                           : "Select executives"}
//                     </span>
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M19 9l-7 7-7-7"
//                       />
//                     </svg>
//                   </button>
//                   {execDropdownOpen &&
//                     (assignmentMode === "selected" || onlyThisExecutive) &&
//                     !onlyThisExecutive && (
//                       <div
//                         className="absolute z-20 mt-1 w-full rounded-lg border shadow-lg bg-white"
//                         style={{ borderColor: BD }}
//                       >
//                         <div className="p-2 border-b">
//                           <input
//                             type="text"
//                             placeholder="Search executive..."
//                             value={execSearch}
//                             onChange={(e) => setExecSearch(e.target.value)}
//                             className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
//                             style={{ borderColor: BD }}
//                           />
//                         </div>
//                         <div className="max-h-56 overflow-auto">
//                           {execsLoading ? (
//                             <div className="p-3 text-center text-sm">
//                               Loading...
//                             </div>
//                           ) : filteredExecutives.length === 0 ? (
//                             <div className="p-3 text-center text-sm">
//                               No executives found
//                             </div>
//                           ) : (
//                             filteredExecutives.map((e) => (
//                               <label
//                                 key={e.id}
//                                 className="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 text-sm cursor-pointer"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   className="accent-orange-500"
//                                   checked={selectedExecIds.has(e.id)}
//                                   onChange={() => toggleExec(e.id)}
//                                 />
//                                 <span>{e.name}</span>
//                                 {e.email && (
//                                   <span className="text-xs text-gray-500">
//                                     ({e.email})
//                                   </span>
//                                 )}
//                               </label>
//                             ))
//                           )}
//                         </div>
//                         <div
//                           className="flex justify-between p-2 border-t"
//                           style={{ background: BG }}
//                         >
//                           <div className="flex gap-2">
//                             <button
//                               onClick={selectAllExecs}
//                               className="px-3 py-1 text-xs border rounded"
//                             >
//                               Select All
//                             </button>
//                             <button
//                               onClick={clearExecs}
//                               className="px-3 py-1 text-xs border rounded"
//                             >
//                               Clear
//                             </button>
//                           </div>
//                           <button
//                             onClick={() => setExecDropdownOpen(false)}
//                             className="px-3 py-1 text-xs rounded text-white"
//                             style={{ background: O }}
//                           >
//                             Done
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   {!onlyThisExecutive && (
//                     <p className="mt-1 text-xs text-gray-500">
//                       Round‑robin assignment across selected executives.
//                     </p>
//                   )}
//                   {onlyThisExecutive && (
//                     <p className="mt-1 text-xs text-gray-500">
//                       You are an Executive – imports auto‑assigned to you.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Preview Section */}
//             {showPreview && (
//               <div
//                 className="rounded-lg p-4 space-y-3"
//                 style={{ background: BG, border: `1px solid ${BD}` }}
//               >
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="p-1.5 rounded-lg"
//                       style={{ background: `${O}10` }}
//                     >
//                       <Database size={16} style={{ color: O }} />
//                     </div>
//                     <h3 className="text-sm font-semibold">Data Preview</h3>
//                   </div>
//                   <div className="flex gap-2 text-xs">
//                     <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
//                       Valid: {validPreviewData.length}
//                     </span>
//                     <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
//                       Issues: {previewSkipped.length + previewDuplicates.length}
//                     </span>
//                   </div>
//                 </div>
//                 {previewRows.length > 0 ? (
//                   <div
//                     className="overflow-x-auto border rounded-lg"
//                     style={{ borderColor: BD }}
//                   >
//                     <div className="max-h-[300px] overflow-auto">
//                       <table className="w-full text-sm border-collapse">
//                         <thead
//                           className="sticky top-0"
//                           style={{ background: BG }}
//                         >
//                           <tr>
//                             <th className="border px-2 py-2">#</th>
//                             <th className="border px-2 py-2">Status</th>
//                             {previewColumns.map((col) => (
//                               <th
//                                 key={col}
//                                 className="border px-2 py-2 min-w-[120px]"
//                               >
//                                 {col}
//                               </th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {previewRows.slice(0, 50).map((row) => (
//                             <tr
//                               key={row.rowNum}
//                               className={
//                                 row.valid
//                                   ? "hover:bg-green-50"
//                                   : "hover:bg-red-50"
//                               }
//                             >
//                               <td className="border px-2 py-1.5 text-center">
//                                 {row.rowNum}
//                               </td>
//                               <td
//                                 className="border px-2 py-1.5"
//                                 style={{
//                                   color: row.valid ? "#2e7d32" : "#c62828",
//                                 }}
//                               >
//                                 {row.valid
//                                   ? "✅ Valid"
//                                   : `❌ ${row.reason?.substring(0, 40)}`}
//                               </td>
//                               {previewColumns.map((col) => (
//                                 <td key={col} className="border px-2 py-1.5">
//                                   {(row.data[col] &&
//                                     String(row.data[col]).substring(0, 60)) ||
//                                     "-"}
//                                 </td>
//                               ))}
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                       {previewRows.length > 50 && (
//                         <div className="text-center py-2 text-xs text-gray-500">
//                           Showing first 50 of {previewRows.length} rows
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-6 text-sm text-gray-500">
//                     No data to preview. Select a file or paste Google Sheet URL.
//                   </div>
//                 )}
//                 {validPreviewData.length > 0 && (
//                   <button
//                     onClick={executeImport}
//                     disabled={isUploading}
//                     className="w-full py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
//                     style={{ background: O }}
//                   >
//                     {isUploading ? (
//                       <>
//                         <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
//                         Importing...
//                       </>
//                     ) : (
//                       <>
//                         <Upload size={16} /> Import {validPreviewData.length}{" "}
//                         Valid Lead(s)
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             )}

//             {/* Help */}
//             <div
//               className="rounded-lg p-4"
//               style={{ background: `${O}05`, border: `1px solid ${O}20` }}
//             >
//               <div className="flex gap-2">
//                 <AlertCircle size={18} style={{ color: O }} />
//                 <div>
//                   <h4 className="text-sm font-semibold" style={{ color: O }}>
//                     Required Fields: Salutation*, Name*, Phone*
//                   </h4>
//                   <p className="text-xs text-gray-600 mt-1">
//                     Email optional • Auto‑detects duplicates • Phone numbers are
//                     cleaned to +91XXXXXXXXXX • Scientific notation converted
//                     automatically
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div
//             className="px-5 py-3 border-t flex gap-3"
//             style={{ borderColor: BD, background: BG }}
//           >
//             <button
//               onClick={downloadLeadTemplate}
//               className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
//               style={{ background: O }}
//             >
//               <Download size={16} /> Download Template
//             </button>
//             <button
//               onClick={resetAndClose}
//               className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
//               style={{ borderColor: BD, color: N }}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//       <SummaryModal
//         isOpen={showSummary}
//         onClose={() => setShowSummary(false)}
//         duplicates={duplicates}
//         skippedRows={skippedRows}
//         updatedRows={updatedRows}
//       />
//     </>
//   );
// }



import React, { useEffect, useMemo, useRef, useState, ChangeEvent, useCallback } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Database,
  Loader2,
  ChevronDown,
  Search,
  FileWarning,
  Globe,
} from "lucide-react";
import * as XLSXRaw from "xlsx-js-style";
import { leadsAPI, usersAPI } from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

const XLSX = XLSXRaw as any;

// Theme Colors (same as buyers modal)
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

// Types (unchanged)
type RawRow = Record<string, any>;
type SkippedRow = { row: number; reason: string; data: RawRow };
type UpdatedRow = { row?: number; id?: string | number; note?: string; data: RawRow; assigned_executive?: string | number };
type DuplicateRow = { row?: number; reason: string; data: RawRow; duplicateFields?: string[]; existingId?: string | number };
type PreviewRow = { rowNum: number; valid: boolean; reason?: string; data: RawRow; normalizedData?: any };
type Executive = { id: string | number; name: string; email?: string; username?: string };
type AssignmentMode = "none" | "selected";

type ImportLeadsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// Helper functions (unchanged)
const getRoleString = (u: any): string => {
  const r = u?.role || u?.roles || u?.raw?.role || u?.raw?.roles || u?.user?.role || u?.user?.roles || "";
  return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
};
const isExecutiveUser = (u: any): boolean => {
  const rs = getRoleString(u);
  return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
};
const normalizeSalutation = (s: string): string => (s || "").trim().replace(/\.{2,}/g, ".");
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
const parsePhoneNumber = (val: any) => toCanonicalPhone(val).display;

// Summary Modal (unchanged – kept as before)
function SummaryModal({ isOpen, onClose, title = "Import Summary", duplicates, skippedRows, updatedRows, onExport }: any) {
  if (!isOpen) return null;
  const allKeys = Array.from(new Set(
    [...duplicates.map((r: any) => r.data), ...skippedRows.map((r: any) => r.data), ...updatedRows.map((r: any) => r.data)]
      .flatMap((row: any) => Object.keys(row).filter((k) => row[k] && String(row[k]).trim() !== ""))
  ));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg" style={{ background: `${O}20` }}><AlertCircle size={18} style={{ color: O }} /></div><div><h2 className="text-base font-bold text-white">{title}</h2><p className="text-xs text-white/70">Review import results</p></div></div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10"><X size={18} className="text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: `${O}10` }}><Users size={16} style={{ color: O }} /><span className="text-sm font-semibold" style={{ color: N }}>Duplicates: {duplicates.length}</span></div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: `${O}10` }}><XCircle size={16} style={{ color: O }} /><span className="text-sm font-semibold" style={{ color: N }}>Skipped: {skippedRows.length}</span></div>
            {updatedRows.length > 0 && <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: `${O}10` }}><CheckCircle size={16} style={{ color: N }} /><span className="text-sm font-semibold" style={{ color: N }}>Updated: {updatedRows.length}</span></div>}
          </div>
          {duplicates.length > 0 && (<div><h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: O }}><AlertCircle size={14} /> Duplicates</h4><div className="max-h-[260px] overflow-auto border rounded-lg"><table className="w-full text-xs border-collapse"><thead className="sticky top-0" style={{ background: BG }}><tr><th className="border px-2 py-1.5">Row</th><th className="border px-2 py-1.5">Duplicate Fields</th><th className="border px-2 py-1.5">Existing ID</th><th className="border px-2 py-1.5">Reason</th>{allKeys.map((k: string) => <th key={k} className="border px-2 py-1.5">{k}</th>)}</tr></thead><tbody>{duplicates.map((row: any, idx: number) => (<tr key={idx}><td className="border px-2 py-1.5 text-center">{row.row ?? "-"}</td><td className="border px-2 py-1.5">{row.duplicateFields?.join(", ") || "-"}</td><td className="border px-2 py-1.5 text-center">{row.existingId ?? "-"}</td><td className="border px-2 py-1.5" style={{ color: O }}>{row.reason}</td>{allKeys.map((k: string) => <td key={k} className="border px-2 py-1.5">{row.data?.[k]}</td>)}</tr>))}</tbody></table></div></div>)}
          {skippedRows.length > 0 && (<div><h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: MU }}>Skipped</h4><div className="max-h-[240px] overflow-auto border rounded-lg"><table className="w-full text-xs border-collapse"><thead className="sticky top-0" style={{ background: BG }}><tr><th className="border px-2 py-1.5">Row</th><th className="border px-2 py-1.5">Reason</th>{allKeys.map((k: string) => <th key={k} className="border px-2 py-1.5">{k}</th>)}</tr></thead><tbody>{skippedRows.map((row: any, idx: number) => (<tr key={idx}><td className="border px-2 py-1.5 text-center">{row.row}</td><td className="border px-2 py-1.5" style={{ color: MU }}>{row.reason}</td>{allKeys.map((k: string) => <td key={k} className="border px-2 py-1.5">{row.data[k]}</td>)}</tr>))}</tbody></table></div></div>)}
          {updatedRows.length > 0 && (<div><h4 className="text-sm font-semibold mb-3 flex-items-center gap-2" style={{ color: O }}>Updated</h4><div className="max-h-[240px] overflow-auto border rounded-lg"><table className="w-full text-xs border-collapse"><thead className="sticky top-0" style={{ background: BG }}><tr><th className="border px-2 py-1.5">Row</th><th className="border px-2 py-1.5">ID</th><th className="border px-2 py-1.5">Note</th>{allKeys.map((k: string) => <th key={k} className="border px-2 py-1.5">{k}</th>)}</tr></thead><tbody>{updatedRows.map((row: any, idx: number) => (<tr key={idx}><td className="border px-2 py-1.5 text-center">{row.row ?? "-"}</td><td className="border px-2 py-1.5 text-center">{row.id ?? "-"}</td><td className="border px-2 py-1.5" style={{ color: O }}>{row.note || "Updated"}</td>{allKeys.map((k: string) => <td key={k} className="border px-2 py-1.5">{row.data?.[k]}</td>)}</tr>))}</tbody></table></div></div>)}
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: BD, background: BG }}>
          {onExport && (duplicates.length > 0 || skippedRows.length > 0) && (
            <button onClick={onExport} className="px-4 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-1">
              <Download size={14} /> Export Issues Report
            </button>
          )}
          <button onClick={onClose} className="px-4 py-1.5 text-sm border rounded-lg hover:bg-gray-50" style={{ borderColor: BD, color: N }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Template Download (unchanged)
const TEMPLATE_HEADERS = [
  "Salutation*", "Name*", "Phone*", "Email", "Lead Type", "Priority", "Lead Source", "Lead Status",
  "State", "City", "Location", "WhatsApp Number",
];
const SAMPLE_ROWS = [
  ["Mr", "Rahul Sharma", "9876543210", "rahul.sharma@example.com", "Walk-In Lead", "Medium", "Website", "New", "Maharashtra", "Mumbai", "Bandra West", "9876543210"],
  ["Ms", "Priya Patel", "9988776655", "priya.patel@example.com", "Online Lead", "High", "Google Ads", "Contacted", "Gujarat", "Ahmedabad", "Satellite", "9988776655"],
  ["Dr", "Amit Kumar", "9876541230", "amit.kumar@example.com", "Referral", "Low", "Customer Referral", "Qualified", "Delhi", "New Delhi", "Connaught Place", "9876541230"],
];
const downloadLeadTemplate = () => {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...SAMPLE_ROWS]);
  [0, 1, 2].forEach((c) => { const addr = XLSX.utils.encode_cell({ r: 0, c }); if (ws[addr]) (ws as any)[addr].s = { font: { color: { rgb: "FF0000" }, bold: true }, alignment: { horizontal: "center" } }; });
  for (let c = 3; c < TEMPLATE_HEADERS.length; c++) { const addr = XLSX.utils.encode_cell({ r: 0, c }); if (ws[addr]) (ws as any)[addr].s = { font: { bold: true }, alignment: { horizontal: "center" } }; }
  for (let r = 1; r < SAMPLE_ROWS.length + 1; r++) for (let c = 0; c < TEMPLATE_HEADERS.length; c++) { const addr = XLSX.utils.encode_cell({ r, c }); if (ws[addr]) (ws as any)[addr].s = { alignment: { horizontal: "left" } }; }
  (ws as any)["!cols"] = [12, 20, 15, 25, 15, 12, 18, 14, 14, 14, 18, 15].map((w) => ({ width: w }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Leads Template"); XLSX.writeFile(wb, "Leads_Import_Template.xlsx");
};

// Main Component
export default function ImportLeadsModal({ isOpen, onClose, onSuccess }: ImportLeadsModalProps) {
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
    XLSX.writeFile(wb, `leads_import_issues_${Date.now()}.xlsx`);
    toast.success("Successfully exported import issues to Excel.");
  };
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const sheetDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);   // ✅ Added

  // Fetch executives – only first name + last name (no salutation)
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
          const selfId = user?.id || user?.userId || user?._id || String(user?.email || user?.username || "me");
          setExecutives([{ id: selfId, name: formatName(user), email: user?.email, username: user?.username }]);
          setSelectedExecIds(new Set([selfId]));
          setAssignmentMode("selected");
          return;
        }
        const res = await usersAPI.getByDeptRole({ department: 'presales', role: 'presales executive', is_active: 1, limit: 100 });
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];
        const mapped: Executive[] = list.map((u: any) => ({
          id: u.id || u.userId || u._id,
          name: formatName(u),
          email: u.email,
          username: u.username,
        }));
        setExecutives(mapped);
      } catch (e) { console.error(e); toast.error("Could not fetch sales executives"); }
      finally { setExecsLoading(false); }
    })();
  }, [isOpen, user, onlyThisExecutive]);

  const filteredExecutives = useMemo(() => {
    if (!execSearch.trim()) return executives;
    const s = execSearch.toLowerCase();
    return executives.filter((e) => String(e.name).toLowerCase().includes(s) || String(e.email).toLowerCase().includes(s));
  }, [execSearch, executives]);

  const toggleExec = (id: string | number) => setSelectedExecIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const selectAllExecs = () => setSelectedExecIds(new Set(executives.map((e) => e.id)));
  const clearExecs = () => setSelectedExecIds(new Set());

  // Validation logic (unchanged)
  const filterValidLeads = (data: RawRow[]) => {
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();
    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];
    const previewRowsArr: PreviewRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      const salutation = normalizeSalutation(row["Salutation*"] || "");
      const name = String(row["Name*"] || "").trim();
      const phoneParsed = toCanonicalPhone(row["Phone*"]);
      const phone = phoneParsed.display;
      const phoneKey = phoneParsed.key;
      const email = String(row["Email"] || "").trim();

      if (!salutation || !name || !phoneKey) {
        const missing = []; if (!salutation) missing.push("Salutation"); if (!name) missing.push("Name"); if (!phoneKey) missing.push("Phone");
        const reason = `Missing: ${missing.join(", ")}`;
        skipped.push({ row: rowNum, reason, data: { ...row } });
        previewRowsArr.push({ rowNum, valid: false, reason, data: row });
        return;
      }
      if (phoneKey && seenPhoneKeys.has(phoneKey)) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate phone in file", data: { ...row }, duplicateFields: ["phone"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate phone", data: row });
        return;
      }
      if (email && seenEmails.has(email.toLowerCase())) {
        localDuplicates.push({ row: rowNum, reason: "Duplicate email in file", data: { ...row }, duplicateFields: ["email"] });
        previewRowsArr.push({ rowNum, valid: false, reason: "Duplicate email", data: row });
        return;
      }
      const phoneDigits = phone.replace(/[^\d+]/g, "");
      if (!/^\+91\d{10}$/.test(phoneDigits) && !/^\+\d{10,15}$/.test(phoneDigits)) {
        const reason = `Invalid phone (${phone})`;
        skipped.push({ row: rowNum, reason, data: { ...row } });
        previewRowsArr.push({ rowNum, valid: false, reason, data: row });
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const reason = "Invalid email";
        skipped.push({ row: rowNum, reason, data: { ...row } });
        previewRowsArr.push({ rowNum, valid: false, reason, data: row });
        return;
      }

      const whatsapp_number = row["WhatsApp Number"] ? parsePhoneNumber(row["WhatsApp Number"]) : "";
      const normalizedLead = {
        salutation, name, phone, email: email || "",
        lead_type: row["Lead Type"] || "", priority: row["Priority"] || "", lead_source: row["Lead Source"] || "",
        status: row["Lead Status"] || "", state: row["State"] || "", city: row["City"] || "",
        location: row["Location"] || "", whatsapp_number,
      };
      validData.push(normalizedLead);
      previewRowsArr.push({ rowNum, valid: true, reason: "Valid", data: row, normalizedData: normalizedLead });
      seenPhoneKeys.add(phoneKey);
      if (email) seenEmails.add(email.toLowerCase());
    });
    return { validData, nonDuplicateSkipped: skipped, localDuplicates, previewRows: previewRowsArr };
  };

  const processPreviewData = (rawData: RawRow[], source: string) => {
    setPreviewLoading(true);
    try {
      const { validData, nonDuplicateSkipped, localDuplicates, previewRows } = filterValidLeads(rawData);
      setValidPreviewData(validData);
      setPreviewSkipped(nonDuplicateSkipped);
      setPreviewDuplicates(localDuplicates);
      setPreviewRows(previewRows);
      setShowPreview(true);
      if (validData.length === 0) toast.warning(`No valid leads in ${source}.`);
      else toast.info(`Preview: ${validData.length} valid, ${nonDuplicateSkipped.length + localDuplicates.length} issues.`);
    } catch (err) { console.error(err); toast.error(`Error processing ${source}`); }
    finally { setPreviewLoading(false); }
  };

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
          processPreviewData(data, "file");
        } catch (e) { console.error(e); toast.error("Error parsing file"); }
        finally { setPreviewLoading(false); }
      };
      if (selectedFile.name.toLowerCase().endsWith(".csv")) reader.readAsText(selectedFile);
      else reader.readAsArrayBuffer(selectedFile);
    } catch (e) { console.error(e); toast.error("Error reading file"); setPreviewLoading(false); }
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
      if (!response.ok) { toast.error(response.status === 403 ? "Sheet not public" : "Failed to fetch sheet"); setPreviewLoading(false); return; }
      const csvText = await response.text();
      if (!csvText.trim()) { toast.error("Sheet is empty"); setPreviewLoading(false); return; }
      const wb = XLSX.read(csvText, { type: "string", raw: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) { toast.error("No sheet found"); setPreviewLoading(false); return; }
      const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
      if (!data || data.length === 0) { toast.error("No data in sheet"); setPreviewLoading(false); return; }
      processPreviewData(data, "Google Sheet");
    } catch (e) { console.error(e); toast.error("Error loading sheet"); setPreviewLoading(false); }
  }, []);

  useEffect(() => {
    if (file) autoPreviewFile(file);
    else { setShowPreview(false); setPreviewRows([]); setValidPreviewData([]); }
  }, [file, autoPreviewFile]);

  useEffect(() => {
    if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current);
    if (sheetUrl.trim()) {
      sheetDebounceRef.current = setTimeout(() => autoPreviewSheet(sheetUrl), 1000);
    } else {
      setShowPreview(false);
      setPreviewRows([]);
      setValidPreviewData([]);
    }
    return () => { if (sheetDebounceRef.current) clearTimeout(sheetDebounceRef.current); };
  }, [sheetUrl, autoPreviewSheet]);

  const applyAssignmentPolicy = (rows: any[]): any[] => {
    if (onlyThisExecutive) {
      const selfId = user?.id || user?.userId || user?._id || String(user?.email || user?.username || "me");
      return rows.map((r) => ({ ...r, assigned_executive: selfId }));
    }
    if (assignmentMode === "none") return rows.map((r) => ({ ...r, assigned_executive: "" }));
    const ids = Array.from(selectedExecIds);
    if (ids.length === 0) return rows.map((r) => ({ ...r, assigned_executive: "" }));
    const n = ids.length;
    return rows.map((r, i) => ({ ...r, assigned_executive: ids[i % n] }));
  };

  const callImportAPI = async (payloadRows: any[]) => {
    try { return await (leadsAPI as any).importLeads(payloadRows); }
    catch { try { return await (leadsAPI as any).importLeads({ rows: payloadRows }); } catch { return await (leadsAPI as any).importLeads({ data: payloadRows }); } }
  };

  const executeImport = async () => {
    if (validPreviewData.length === 0) { toast.error("No valid leads to import"); return; }
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) { toast.error("Select at least one executive or choose 'None'"); return; }
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
      setDuplicates([...previewDuplicates, ...serverDuplicates]);
      setSkippedRows([...previewSkipped, ...serverNonDupSkipped]);
      setUpdatedRows(serverUpdated);
      if (insertedCount > 0 && previewDuplicates.length === 0 && previewSkipped.length === 0 && serverDuplicates.length === 0 && serverNonDupSkipped.length === 0) {
        toast.success(`Imported ${insertedCount} lead(s) successfully.`);
        if (typeof (leadsAPI as any).getLeads === "function") await (leadsAPI as any).getLeads();
        onSuccess?.();
        resetAndClose();
      } else {
        const parts = [`${insertedCount} imported`, `${previewDuplicates.length + serverDuplicates.length} duplicate`, `${previewSkipped.length + serverNonDupSkipped.length} skipped`];
        toast.info(`Import summary: ${parts.join(" • ")}`);
        onSuccess?.();
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

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!["csv", "xlsx", "xls"].includes(f.name.split(".").pop()?.toLowerCase() || "")) { toast.error("Only Excel/CSV files"); return; }
    setFile(f);
  };

  const previewColumns = useMemo(() => {
    if (previewRows.length === 0) return [];
    const keysSet = new Set<string>();
    previewRows.forEach((row) => Object.keys(row.data).forEach((k) => { if (k && String(k).trim()) keysSet.add(k); }));
    return Array.from(keysSet);
  }, [previewRows]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }} onClick={resetAndClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}><Upload size={14} style={{ color: O }} /></div>
              <div><h2 className="text-sm font-bold text-white">Import Leads</h2><p className="text-[9px] text-white/70">Import leads from Excel files or Google Sheets</p></div>
            </div>
            <button onClick={resetAndClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column - Import Methods */}
              <div className="space-y-3">
                {/* File Upload Card */}
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><FileSpreadsheet size={12} style={{ color: O }} /> Upload File</h3>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={onFileInputChange} className="hidden" />
                  <div
                    role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); const f = e.dataTransfer?.files[0]; if (f && ["csv","xlsx","xls"].includes(f.name.split(".").pop()?.toLowerCase() || "")) setFile(f); else toast.error("Invalid file"); }}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 bg-white"}`}
                  >
                    {file ? (
                      <div className="space-y-1"><CheckCircle size={16} className="mx-auto" style={{ color: O }} /><p className="text-[10px] font-medium truncate px-2" style={{ color: N }}>{file.name}</p><p className="text-[9px]" style={{ color: MU }}>Click to change</p></div>
                    ) : (
                      <div className="space-y-1"><Upload size={16} className="mx-auto" style={{ color: MU }} /><p className="text-[10px] font-medium" style={{ color: N }}>Drop file or click</p><p className="text-[9px]" style={{ color: MU }}>Excel (.xlsx, .xls) or CSV</p></div>
                    )}
                  </div>
                  <button onClick={executeImport} disabled={validPreviewData.length === 0 || isUploading || previewLoading} className="mt-2 w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50" style={{ background: N }}>{isUploading ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" /> Processing...</span> : `Import from File (${validPreviewData.length} valid)`}</button>
                </div>

                {/* Google Sheet Card */}
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Globe size={12} style={{ color: O }} /> Google Sheets</h3>
                  <input type="text" placeholder="https://docs.google.com/spreadsheets/..." value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white mb-2" style={{ borderColor: BD }} />
                  <div className="rounded-lg p-2 mb-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}><div className="flex items-start gap-1.5"><AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} /><p className="text-[9px]" style={{ color: MU }}>Make sheet public: "Anyone with link can view"</p></div></div>
                  <button onClick={executeImport} disabled={validPreviewData.length === 0 || isUploading || previewLoading} className="w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50" style={{ background: O }}>{isUploading ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" /> Importing...</span> : `Import from Google Sheet (${validPreviewData.length} valid)`}</button>
                </div>

                {/* Download Template */}
                <button onClick={downloadLeadTemplate} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: N }}><Download size={10} /> Download Template</button>
              </div>

              {/* Right Column - Assignment */}
              <div className="space-y-3">
                <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Users size={12} style={{ color: O }} /> Lead Assignment</h3>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
                      <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
                      <div className="flex-1"><p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p><p className="text-[8px]" style={{ color: MU }}>Leads not assigned to any executive</p></div>
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
                            <div className="p-1.5 border-b"><div className="relative"><Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} /><input type="text" value={execSearch} onChange={(e) => setExecSearch(e.target.value)} placeholder="Search..." className="w-full pl-6 pr-2 py-1 text-[9px] border rounded" style={{ borderColor: BD }} /></div></div>
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
                              {/* No Done button */}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Card */}
                <div className="rounded-lg p-2.5" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                  <div className="flex items-start gap-1.5"><AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} /><div><p className="text-[9px] font-medium mb-0.5" style={{ color: N }}>Required fields:</p><div className="flex gap-1.5"><span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Salutation*</span><span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Name*</span><span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Phone*</span></div></div></div>
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
                  <div className="flex items-center gap-1.5"><CheckCircle size={10} style={{ color: O }} /><span className="text-[9px] font-medium" style={{ color: N }}>{validPreviewData.length} lead(s) ready to import</span></div>
                  <div className="flex gap-2 text-[8px]"><span className="text-green-600">Valid: {validPreviewData.length}</span><span className="text-red-600">Issues: {previewSkipped.length + previewDuplicates.length}</span></div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-[9px] border-collapse">
                    <thead className="sticky top-0 bg-gray-50" style={{ background: BG }}>
                      <tr><th className="px-2 py-1 text-left font-semibold">Row</th><th className="px-2 py-1 text-left font-semibold">Status</th><th className="px-2 py-1 text-left font-semibold">Name</th><th className="px-2 py-1 text-left font-semibold">Phone</th><th className="px-2 py-1 text-left font-semibold">Email</th><th className="px-2 py-1 text-left font-semibold">Location</th><th className="px-2 py-1 text-left font-semibold">Budget</th></tr>
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
                          <td className="px-2 py-1">-</td>
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
              <button onClick={resetAndClose} className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50" style={{ border: `1px solid ${BD}`, color: N }}>Cancel</button>
              <button onClick={executeImport} disabled={validPreviewData.length === 0 || isUploading || previewLoading} className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1" style={{ background: O }}>
                {isUploading ? <><Loader2 size={10} className="animate-spin" /> Importing...</> : <><Upload size={10} /> Import Leads ({validPreviewData.length})</>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <SummaryModal isOpen={showSummary} onClose={() => setShowSummary(false)} duplicates={duplicates} skippedRows={skippedRows} updatedRows={updatedRows} onExport={exportSkippedRows} />
    </>
  );
}