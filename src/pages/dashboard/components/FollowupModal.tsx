// // import React, { useEffect, useRef, useState } from "react";
// // import { Phone, Mail, MapPin, Users, MessageSquare } from "lucide-react";
// // import { FaWhatsapp } from "react-icons/fa";
// // import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
// // import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";

// // /* ===================== Types ===================== */
// // export type FollowupForm = {
// //     followupType: string;
// //     leadStage: string;
// //     leadStatus: string;
// //     remark: string;
// //     customRemark: string;
// //     nextAction: string;
// //     scheduleDate: string; // yyyy-mm-dd
// //     scheduleTime: string; // HH:MM
// //     priority: string; // 👈 NEW
    
// // };

// // // Create/Edit payload coming back out of the modal.
// // // If `id` exists => edit mode, otherwise create.
// // export type FollowupFormWithLead = FollowupForm & { lead_id: string; id?: string };

// // type APIRemarkData = {
// //     id: string | number;
// //     type1Name: string;
// //     value1Id: string;
// //     value1Name: string;
// //     type2Name: string;
// //     value2Id: string;
// //     value2Name: string;
// //     label?: string;
// //     value?: string;
// //     remarks?: string[];
// // };

// // type Props = {
// //     isOpen: boolean;
// //     onClose: () => void;
// //     onSave: (data: FollowupFormWithLead) => void;
// //     tabId: string;
// //     leadId: string;

// //     /** Optional: pass this when editing an existing follow-up */
// //     initialForm?: Partial<FollowupFormWithLead>; // can include id
// // };

// // export const FOLLOWUP_TYPES = [
// //     { value: "Phone Call", Icon: Phone, color: "blue" },
// //     { value: "WhatsApp", Icon: FaWhatsapp, color: "green" },
// //     { value: "Email", Icon: Mail, color: "indigo" },
// //     { value: "Site Visit", Icon: MapPin, color: "orange" },
// //     { value: "Meeting", Icon: Users, color: "purple" },
// //     { value: "Other", Icon: MessageSquare, color: "gray" },
// // ] as const;

// // type Row = APIRemarkData;

// // const uniq = (arr: string[]) =>
// //     Array.from(new Set(arr.map((s) => (s || "").trim()).filter(Boolean)));

// // const extractAllOfTypeFrom = (rows: Row[], typeName: string) => {
// //     const vals: string[] = [];
// //     rows.forEach((r) => {
// //         if (r.type1Name === typeName) vals.push(r.value1Name);
// //         if (r.type2Name === typeName) vals.push(r.value2Name);
// //     });
// //     return uniq(vals);
// // };

// // const statusesForStageFrom = (rows: Row[], stage: string) => {
// //     const out: string[] = [];
// //     rows.forEach((r) => {
// //         const left =
// //             r.type1Name === "Lead Stage" &&
// //             r.value1Name === stage &&
// //             r.type2Name === "Lead Status";
// //         const right =
// //             r.type2Name === "Lead Stage" &&
// //             r.value2Name === stage &&
// //             r.type1Name === "Lead Status";
// //         if (left) out.push(r.value2Name);
// //         if (right) out.push(r.value1Name);
// //     });
// //     return uniq(out);
// // };

// // const remarksForStatusFrom = (rows: Row[], status: string) => {
// //     const out: string[] = [];
// //     rows.forEach((r) => {
// //         const statusMatches =
// //             (r.type1Name === "Lead Status" && r.value1Name === status) ||
// //             (r.type2Name === "Lead Status" && r.value2Name === status);

// //         if (statusMatches && Array.isArray(r.remarks) && r.remarks.length) {
// //             out.push(...r.remarks.filter(Boolean));
// //         }
// //         if (r.type1Name === "Lead Status" && r.value1Name === status && r.type2Name === "Remarks") {
// //             out.push(r.value2Name);
// //         }
// //         if (r.type2Name === "Lead Status" && r.value2Name === status && r.type1Name === "Remarks") {
// //             out.push(r.value1Name);
// //         }
// //     });
// //     return uniq(out);
// // };

// // /* -------- colored custom dropdown for Followup Type -------- */
// // type TypeOption = { value: string; Icon: any; color: string };

// // const TYPE_COLOR_TEXT: Record<string, string> = {
// //     blue: "text-blue-600",
// //     green: "text-green-600",
// //     indigo: "text-indigo-600",
// //     orange: "text-orange-600",
// //     purple: "text-purple-600",
// //     gray: "text-gray-600",
// // };

// // const ColoredFollowupTypeSelect: React.FC<{
// //     options: readonly TypeOption[];
// //     value: string;
// //     onChange: (next: string) => void;
// //     disabled?: boolean;
// // }> = ({ options, value, onChange, disabled }) => {
// //     const [open, setOpen] = useState(false);
// //     const ref = useRef<HTMLDivElement | null>(null);

// //     useEffect(() => {
// //         const onClickOutside = (e: MouseEvent) => {
// //             if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
// //         };
// //         document.addEventListener("mousedown", onClickOutside);
// //         return () => document.removeEventListener("mousedown", onClickOutside);
// //     }, []);

// //     const current = options.find((o) => o.value === value) ?? options[0];
// //     const CurrentIcon = current.Icon;
// //     const colorClass = TYPE_COLOR_TEXT[current.color] || "text-gray-600";

// //     return (
// //         <div className="relative" ref={ref}>
// //             <button
// //                 type="button"
// //                 disabled={disabled}
// //                 onClick={() => setOpen((o) => !o)}
// //                 className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-left flex items-center gap-2
// //                     focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? "opacity-60" : ""}`}
// //                 aria-haspopup="listbox"
// //                 aria-expanded={open}
// //             >
// //                 <CurrentIcon size={18} className={colorClass} />
// //                 <span className="flex-1">{current.value}</span>
// //                 <svg viewBox="0 0 20 20" className="w-4 h-4">
// //                     <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
// //                 </svg>
// //             </button>

// //             {open && !disabled && (
// //                 <div
// //                     role="listbox"
// //                     className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
// //                 >
// //                     {options.map((opt) => {
// //                         const Ico = opt.Icon;
// //                         const optColor = TYPE_COLOR_TEXT[opt.color] || "text-gray-600";
// //                         const selected = opt.value === value;
// //                         return (
// //                             <button
// //                                 key={opt.value}
// //                                 type="button"
// //                                 role="option"
// //                                 aria-selected={selected}
// //                                 onClick={() => {
// //                                     onChange(opt.value);
// //                                     setOpen(false);
// //                                 }}
// //                                 className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50
// //                             ${selected ? "bg-indigo-50" : ""}`}
// //                             >
// //                                 <Ico size={18} className={optColor} />
// //                                 <span>{opt.value}</span>
// //                             </button>
// //                         );
// //                     })}
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };
// // ColoredFollowupTypeSelect.displayName = "ColoredFollowupTypeSelect";

// // /* ------------------------- Modal ------------------------- */
// // const FollowupModal: React.FC<Props> = ({ isOpen, onClose, onSave, tabId, leadId, initialForm }) => {
// //     if (!isOpen) return null;

// //     const isEdit = Boolean(initialForm?.id);
// //     const [priorityOptions, setPriorityOptions] = useState<{ value: string, label: string }[]>([]);

// //     const [apiData, setApiData] = useState<Row[]>([]);
// //     const [loading, setLoading] = useState(false);
// //     const [error, setError] = useState<string | null>(null);

// //     // Options
// //     const [availableStages, setAvailableStages] = useState<string[]>([]);
// //     const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
// //     const [availableRemarks, setAvailableRemarks] = useState<string[]>([]);

// //     // Form state (seed with initialForm if present)
// //     const [form, setForm] = useState<FollowupForm>(() => ({
// //         followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
// //         leadStage: initialForm?.leadStage || "",
// //         leadStatus: initialForm?.leadStatus || "",
// //         remark: initialForm?.remark || "",
// //         customRemark: initialForm?.customRemark || "",
// //         nextAction: initialForm?.nextAction || "",
// //         scheduleDate: initialForm?.scheduleDate || "",
// //         scheduleTime: initialForm?.scheduleTime || "",
// //         priority: initialForm?.priority || " - ", // 👈 Default Priority
// //     }));
// //     useEffect(() => {
// //         const fetchPriorities = async () => {
// //             try {
// //                 const data = await getMasterDropdownOptions(["lead"]);
// //                 // 👆 "lead" masterType ke andar priorities hongi
// //                 if (data["lead priority"]) {
// //                     setPriorityOptions(data["lead priority"]);
// //                 }
// //             } catch (err) {
// //                 console.error("❌ Error fetching lead priority:", err);
// //             }
// //         };

// //         if (isOpen) fetchPriorities();
// //     }, [isOpen]);
// //     /* Load mapping on open; if editing, pre-select dependent dropdowns */
// //     useEffect(() => {
// //         const load = async () => {
// //             if (!isOpen) return;
// //             setLoading(true);
// //             setError(null);
// //             try {
// //                 const data = (await connectedRemarkAPI.getRemarksByTabId(tabId)) as Row[];
// //                 const safe = Array.isArray(data) ? data : [];
// //                 setApiData(safe);

// //                 const stages = extractAllOfTypeFrom(safe, "Lead Stage");
// //                 setAvailableStages(stages);

// //                 // For edit: hydrate statuses/remarks chains
// //                 if (initialForm?.leadStage) {
// //                     const sts = statusesForStageFrom(safe, initialForm.leadStage);
// //                     setAvailableStatuses(sts);
// //                     if (initialForm.leadStatus) {
// //                         const rems = remarksForStatusFrom(safe, initialForm.leadStatus);
// //                         setAvailableRemarks(rems);
// //                     } else {
// //                         setAvailableRemarks([]);
// //                     }
// //                 } else {
// //                     setAvailableStatuses([]);
// //                     setAvailableRemarks([]);
// //                 }
// //             } catch (e) {
// //                 console.error("Failed to load follow-up options:", e);
// //                 setError("Failed to load follow-up options.");
// //                 setApiData([]);
// //                 setAvailableStages([]);
// //                 setAvailableStatuses([]);
// //                 setAvailableRemarks([]);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         load();
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, [isOpen, tabId]);

// //     const handleChange =
// //         (key: keyof FollowupForm) =>
// //             (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
// //                 setForm((f) => ({ ...f, [key]: e.target.value }));

// //     const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //         const stage = e.target.value;
// //         const nextStatuses = stage ? statusesForStageFrom(apiData, stage) : [];
// //         setAvailableStatuses(nextStatuses);

// //         setAvailableRemarks([]);
// //         setForm((f) => ({
// //             ...f,
// //             leadStage: stage,
// //             leadStatus: "",
// //             remark: "",
// //             customRemark: "",
// //         }));
// //     };

// //     const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //         const status = e.target.value;
// //         const nextRemarks = status ? remarksForStatusFrom(apiData, status) : [];
// //         setAvailableRemarks(nextRemarks);

// //         setForm((f) => ({
// //             ...f,
// //             leadStatus: status,
// //             remark: "",
// //             customRemark: "",
// //         }));
// //     };

// //     const handleRemarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
// //         const remark = e.target.value;
// //         setForm((f) => ({
// //             ...f,
// //             remark,
// //             customRemark: remark ? `${remark} – ` : "",
// //         }));
// //     };

// //     // ⬇️ replace your handleSubmit with this guarded version
// //     const handleSubmit = (e: React.FormEvent) => {
// //         e.preventDefault();

// //         // tiny validation – tweak as your rules require
// //         if (!form.leadStage) {
// //             alert("Please select a Lead Stage.");
// //             return;
// //         }
// //         if (!form.leadStatus) {
// //             alert("Please select a Lead Status.");
// //             return;
// //         }

// //         const payload: FollowupFormWithLead = {
// //             ...form,
// //             lead_id: leadId,
// //             ...(initialForm?.id ? { id: initialForm.id } : {}),
// //         };
// //         onSave(payload); // parent (page) converts date+time to ISO and calls create/update
// //     };



// //     // ⬇️ add this effect inside FollowupModal (under your other useEffects)
// //     useEffect(() => {
// //         if (!isOpen) return;
// //         setForm({
// //             followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
// //             leadStage: initialForm?.leadStage || "",
// //             leadStatus: initialForm?.leadStatus || "",
// //             remark: initialForm?.remark || "",
// //             customRemark: initialForm?.customRemark || "",
// //             nextAction: initialForm?.nextAction || "",
// //             scheduleDate: initialForm?.scheduleDate || "",
// //             scheduleTime: initialForm?.scheduleTime || "",
// //             priority: initialForm?.priority || "Medium", // 👈 here also
// //         });

// //         // also (re)hydrate dependent dropdowns when editing
// //         if (apiData.length && initialForm?.leadStage) {
// //             const sts = statusesForStageFrom(apiData, initialForm.leadStage);
// //             setAvailableStatuses(sts);
// //             const rems = initialForm.leadStatus ? remarksForStatusFrom(apiData, initialForm.leadStatus) : [];
// //             setAvailableRemarks(rems);
// //         } else {
// //             setAvailableStatuses([]);
// //             setAvailableRemarks([]);
// //         }
// //     }, [isOpen, initialForm, apiData]);


// //     const selectedType =
// //         FOLLOWUP_TYPES.find((t) => t.value === form.followupType) || FOLLOWUP_TYPES[0];
// //     const ringColor =
// //         selectedType.color === "blue"
// //             ? "focus:ring-blue-500"
// //             : selectedType.color === "green"
// //                 ? "focus:ring-green-500"
// //                 : selectedType.color === "indigo"
// //                     ? "focus:ring-indigo-500"
// //                     : selectedType.color === "orange"
// //                         ? "focus:ring-orange-500"
// //                         : selectedType.color === "purple"
// //                             ? "focus:ring-purple-500"
// //                             : "focus:ring-gray-500";

// //     return (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center">
// //             <div className="absolute inset-0 bg-black/50" onClick={onClose} />
// //             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 m-4 max-h-[90vh] overflow-y-auto border border-gray-100">
// //                 {/* Header */}
// //                 <div className="flex items-center justify-between mb-4">
// //                     <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text">
// //                         {isEdit ? "Edit Follow-up" : "Add New Follow-up"}
// //                     </h3>
// //                     <button
// //                         onClick={onClose}
// //                         className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
// //                         aria-label="Close"
// //                     >
// //                         ×
// //                     </button>
// //                 </div>

// //                 {error && (
// //                     <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
// //                         {error}
// //                     </div>
// //                 )}

// //                 <form onSubmit={handleSubmit} className="space-y-4">
// //                     {/* Row 1 */}
// //                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700">Followup Type</label>
// //                             <ColoredFollowupTypeSelect
// //                                 options={FOLLOWUP_TYPES}
// //                                 value={form.followupType}
// //                                 onChange={(v) => setForm((f) => ({ ...f, followupType: v }))}
// //                                 disabled={loading}
// //                             />
// //                         </div>
// //                         {/* Priority */}
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700">Lead Priority</label>
// //                             <select
// //                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
// //                                 value={form.priority}
// //                                 onChange={handleChange("priority")}
// //                             >
// //                                 <option value="">Select Priority</option>
// //                                 {priorityOptions.map((opt) => (
// //                                     <option key={opt.value} value={opt.value}>
// //                                         {opt.label}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700">Lead Stage</label>
// //                             <select
// //                                 className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${ringColor}`}
// //                                 value={form.leadStage}
// //                                 onChange={handleStageChange}
// //                                 disabled={loading || availableStages.length === 0}
// //                             >
// //                                 <option value="">Select stage…</option>
// //                                 {availableStages.map((s) => (
// //                                     <option key={s} value={s}>
// //                                         {s}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </div>

// //                     {/* Row 2 */}
// //                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700">Lead Status</label>
// //                             <select
// //                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //                                 value={form.leadStatus}
// //                                 onChange={handleStatusChange}
// //                                 disabled={loading || !form.leadStage || availableStatuses.length === 0}
// //                             >
// //                                 <option value="">{form.leadStage ? "Select status…" : "Select stage first"}</option>
// //                                 {availableStatuses.map((s) => (
// //                                     <option key={s} value={s}>
// //                                         {s}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700">Remarks</label>
// //                             <select
// //                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
// //                                 value={form.remark}
// //                                 onChange={handleRemarkChange}
// //                                 disabled={loading || !form.leadStatus || availableRemarks.length === 0}
// //                             >
// //                                 <option value="">{form.leadStatus ? "Select remark…" : "Select status first"}</option>
// //                                 {availableRemarks.map((r) => (
// //                                     <option key={r} value={r}>
// //                                         {r}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </div>

// //                     {/* Custom Remark */}
// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700">Custom Remark</label>
// //                         <textarea
// //                             className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
// //                             placeholder="Select a remark above or type your own details…"
// //                             value={form.customRemark}
// //                             onChange={handleChange("customRemark")}
// //                         />
// //                     </div>

// //                     {/* Next Action */}
// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700">Next Action</label>
// //                         <input
// //                             type="text"
// //                             className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
// //                             placeholder="Enter next action..."
// //                             value={form.nextAction}
// //                             onChange={handleChange("nextAction")}
// //                         />
// //                     </div>

// //                     {/* Schedule */}
// //                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700">Schedule Date</label>

// //                             {(() => {
// //                                 // Calculate tomorrow's date
// //                                 const tomorrow = new Date();
// //                                 tomorrow.setDate(tomorrow.getDate() + 1);
// //                                 const minDate = tomorrow.toISOString().split("T")[0];

// //                                 return (
// //                                     <input
// //                                         type="date"
// //                                         className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
// //                                         value={form.scheduleDate}
// //                                         onChange={handleChange("scheduleDate")}
// //                                         min={minDate}   // 👈 Sirf kal se future dates allowed
// //                                     />
// //                                 );
// //                             })()}
// //                         </div>

// //                         <div>
// //                             <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
// //                             <input
// //                                 type="time"
// //                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
// //                                 value={form.scheduleTime}
// //                                 onChange={handleChange("scheduleTime")}
// //                             />
// //                         </div>
// //                     </div>

// //                     {/* Actions */}
// //                     <div className="flex justify-end gap-3 pt-4">
// //                         <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
// //                             Cancel
// //                         </button>
// //                         <button
// //                             type="submit"
// //                             className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 transition-colors"
// //                             disabled={loading}
// //                         >
// //                             {isEdit ? "Update Follow-up" : "Save Follow-up"}
// //                         </button>
// //                     </div>
// //                 </form>
// //             </div>
// //         </div>
// //     );
// // };

// // export default FollowupModal;


// import React, { useEffect, useRef, useState } from "react";
// import { Phone, Mail, MapPin, Users, MessageSquare } from "lucide-react";
// import { FaWhatsapp } from "react-icons/fa";
// import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
// import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
// import toast from "react-hot-toast";

// /* ===================== Types ===================== */
// export type FollowupForm = {
//     followupType: string;
//     leadStage: string;
//     leadStatus: string;
//     remark: string;
//     customRemark: string;
//     nextAction: string;
//     scheduleDate: string; // yyyy-mm-dd
//     scheduleTime: string; // HH:MM
//     priority: string; // 👈 NEW
// };

// // Create/Edit payload coming back out of the modal.
// // If `id` exists => edit mode, otherwise create.
// export type FollowupFormWithLead = FollowupForm & { lead_id: string; id?: string | number };

// type APIRemarkData = {
//     id: string | number;
//     type1Name: string;
//     value1Id: string;
//     value1Name: string;
//     type2Name: string;
//     value2Id: string;
//     value2Name: string;
//     label?: string;
//     value?: string;
//     remarks?: string[];
// };

// type Props = {
//     isOpen: boolean;
//     onClose: () => void;
//     onSave: (data: FollowupFormWithLead) => void; // parent handles optimistic update
//     tabId: string;
//     leadId: string;

//     /** Optional: pass this when editing an existing follow-up */
//     initialForm?: Partial<FollowupFormWithLead>; // can include id
// };

// export const FOLLOWUP_TYPES = [
//     { value: "Phone Call", Icon: Phone, color: "blue" },
//     { value: "WhatsApp", Icon: FaWhatsapp, color: "green" },
//     { value: "Email", Icon: Mail, color: "indigo" },
//     { value: "Site Visit", Icon: MapPin, color: "orange" },
//     { value: "Meeting", Icon: Users, color: "purple" },
//     { value: "Other", Icon: MessageSquare, color: "gray" },
// ] as const;

// type Row = APIRemarkData;

// const uniq = (arr: string[]) =>
//     Array.from(new Set(arr.map((s) => (s || "").trim()).filter(Boolean)));

// const extractAllOfTypeFrom = (rows: Row[], typeName: string) => {
//     const vals: string[] = [];
//     rows.forEach((r) => {
//         if (r.type1Name === typeName) vals.push(r.value1Name);
//         if (r.type2Name === typeName) vals.push(r.value2Name);
//     });
//     return uniq(vals);
// };

// const statusesForStageFrom = (rows: Row[], stage: string) => {
//     const out: string[] = [];
//     rows.forEach((r) => {
//         const left =
//             r.type1Name === "Lead Stage" &&
//             r.value1Name === stage &&
//             r.type2Name === "Lead Status";
//         const right =
//             r.type2Name === "Lead Stage" &&
//             r.value2Name === stage &&
//             r.type1Name === "Lead Status";
//         if (left) out.push(r.value2Name);
//         if (right) out.push(r.value1Name);
//     });
//     return uniq(out);
// };

// const remarksForStatusFrom = (rows: Row[], status: string) => {
//     const out: string[] = [];
//     rows.forEach((r) => {
//         const statusMatches =
//             (r.type1Name === "Lead Status" && r.value1Name === status) ||
//             (r.type2Name === "Lead Status" && r.value2Name === status);

//         if (statusMatches && Array.isArray(r.remarks) && r.remarks.length) {
//             out.push(...r.remarks.filter(Boolean));
//         }
//         if (r.type1Name === "Lead Status" && r.value1Name === status && r.type2Name === "Remarks") {
//             out.push(r.value2Name);
//         }
//         if (r.type2Name === "Lead Status" && r.value2Name === status && r.type1Name === "Remarks") {
//             out.push(r.value1Name);
//         }
//     });
//     return uniq(out);
// };

// /* -------- colored custom dropdown for Followup Type -------- */
// type TypeOption = { value: string; Icon: any; color: string };

// const TYPE_COLOR_TEXT: Record<string, string> = {
//     blue: "text-blue-600",
//     green: "text-green-600",
//     indigo: "text-indigo-600",
//     orange: "text-orange-600",
//     purple: "text-purple-600",
//     gray: "text-gray-600",
// };

// const ColoredFollowupTypeSelect: React.FC<{
//     options: readonly TypeOption[];
//     value: string;
//     onChange: (next: string) => void;
//     disabled?: boolean;
// }> = ({ options, value, onChange, disabled }) => {
//     const [open, setOpen] = useState(false);
//     const ref = useRef<HTMLDivElement | null>(null);

//     useEffect(() => {
//         const onClickOutside = (e: MouseEvent) => {
//             if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//         };
//         document.addEventListener("mousedown", onClickOutside);
//         return () => document.removeEventListener("mousedown", onClickOutside);
//     }, []);

//     const current = options.find((o) => o.value === value) ?? options[0];
//     const CurrentIcon = current.Icon;
//     const colorClass = TYPE_COLOR_TEXT[current.color] || "text-gray-600";

//     return (
//         <div className="relative" ref={ref}>
//             <button
//                 type="button"
//                 disabled={disabled}
//                 onClick={() => setOpen((o) => !o)}
//                 className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-left flex items-center gap-2 
//                     focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? "opacity-60" : ""}`}
//                 aria-haspopup="listbox"
//                 aria-expanded={open}
//             >
//                 <CurrentIcon size={18} className={colorClass} />
//                 <span className="flex-1">{current.value}</span>
//                 <svg viewBox="0 0 20 20" className="w-4 h-4">
//                     <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
//                 </svg>
//             </button>

//             {open && !disabled && (
//                 <div
//                     role="listbox"
//                     className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
//                 >
//                     {options.map((opt) => {
//                         const Ico = opt.Icon;
//                         const optColor = TYPE_COLOR_TEXT[opt.color] || "text-gray-600";
//                         const selected = opt.value === value;
//                         return (
//                             <button
//                                 key={opt.value}
//                                 type="button"
//                                 role="option"
//                                 aria-selected={selected}
//                                 onClick={() => {
//                                     onChange(opt.value);
//                                     setOpen(false);
//                                 }}
//                                 className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 
//                             ${selected ? "bg-indigo-50" : ""}`}
//                             >
//                                 <Ico size={18} className={optColor} />
//                                 <span>{opt.value}</span>
//                             </button>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// };
// ColoredFollowupTypeSelect.displayName = "ColoredFollowupTypeSelect";

// /* ------------------------- Modal ------------------------- */
// const FollowupModal: React.FC<Props> = ({ isOpen, onClose, onSave, tabId, leadId, initialForm }) => {
//     if (!isOpen) return null;

//     const isEdit = Boolean(initialForm?.id);
//     const [priorityOptions, setPriorityOptions] = useState<{ value: string, label: string }[]>([]);

//     const [apiData, setApiData] = useState<Row[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // ⭐ NEW: local submitting state (safety for double-clicks)
//     const [submitting, setSubmitting] = useState(false);

//     // Options
//     const [availableStages, setAvailableStages] = useState<string[]>([]);
//     const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
//     const [availableRemarks, setAvailableRemarks] = useState<string[]>([]);

//     // Form state (seed with initialForm if present)
//     const [form, setForm] = useState<FollowupForm>(() => ({
//         followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
//         leadStage: initialForm?.leadStage || "",
//         leadStatus: initialForm?.leadStatus || "",
//         remark: initialForm?.remark || "",
//         customRemark: initialForm?.customRemark || "",
//         nextAction: initialForm?.nextAction || "",
//         scheduleDate: initialForm?.scheduleDate || "",
//         scheduleTime: initialForm?.scheduleTime || "",
//         priority: initialForm?.priority || " - ", // 👈 Default Priority
//     }));

//     useEffect(() => {
//         const fetchPriorities = async () => {
//             try {
//                 const data = await getMasterDropdownOptions(["lead"]);
//                 if (data["lead priority"]) {
//                     setPriorityOptions(data["lead priority"]);
//                 }
//             } catch (err) {
//                 toast.error("❌ Error fetching lead priority:", err);
//             }
//         };
//         if (isOpen) fetchPriorities();
//     }, [isOpen]);

//     /* Load mapping on open; if editing, pre-select dependent dropdowns */
//     useEffect(() => {
//         const load = async () => {
//             if (!isOpen) return;
//             setLoading(true);
//             setError(null);
//             try {
//                 const data = (await connectedRemarkAPI.getRemarksByTabId(tabId)) as Row[];
//                 const safe = Array.isArray(data) ? data : [];
//                 setApiData(safe);

//                 const stages = extractAllOfTypeFrom(safe, "Lead Stage");
//                 setAvailableStages(stages);

//                 // For edit: hydrate statuses/remarks chains
//                 if (initialForm?.leadStage) {
//                     const sts = statusesForStageFrom(safe, initialForm.leadStage);
//                     setAvailableStatuses(sts);
//                     if (initialForm.leadStatus) {
//                         const rems = remarksForStatusFrom(safe, initialForm.leadStatus);
//                         setAvailableRemarks(rems);
//                     } else {
//                         setAvailableRemarks([]);
//                     }
//                 } else {
//                     setAvailableStatuses([]);
//                     setAvailableRemarks([]);
//                 }
//             } catch (e) {
//                 toast.error("Failed to load follow-up options:", e);
//                 setError("Failed to load follow-up options.");
//                 setApiData([]);
//                 setAvailableStages([]);
//                 setAvailableStatuses([]);
//                 setAvailableRemarks([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         load();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isOpen, tabId]);

//     const handleChange =
//         (key: keyof FollowupForm) =>
//             (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
//                 setForm((f) => ({ ...f, [key]: e.target.value }));

//     const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const stage = e.target.value;
//         const nextStatuses = stage ? statusesForStageFrom(apiData, stage) : [];
//         setAvailableStatuses(nextStatuses);

//         setAvailableRemarks([]);
//         setForm((f) => ({
//             ...f,
//             leadStage: stage,
//             leadStatus: "",
//             remark: "",
//             customRemark: "",
//         }));
//     };

//     const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const status = e.target.value;
//         const nextRemarks = status ? remarksForStatusFrom(apiData, status) : [];
//         setAvailableRemarks(nextRemarks);

//         setForm((f) => ({
//             ...f,
//             leadStatus: status,
//             remark: "",
//             customRemark: "",
//         }));
//     };

//     const handleRemarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const remark = e.target.value;
//         setForm((f) => ({
//             ...f,
//             remark,
//             customRemark: remark ? `${remark} – ` : "",
//         }));
//     };

//     // ⭐ UPDATED: guarded submit that CLOSES IMMEDIATELY and lets parent update the list
//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (submitting) return;

//         if (!form.leadStage) {
//             alert("Please select a Lead Stage.");
//             return;
//         }
//         if (!form.leadStatus) {
//             alert("Please select a Lead Status.");
//             return;
//         }

//         const payload: FollowupFormWithLead = {
//             ...form,
//             lead_id: leadId,
//            ...(initialForm?.id != null ? { id: String(initialForm.id) } : {}),
//         };

//         setSubmitting(true);

//         try {
//             onSave(payload);        // parent does optimistic update
//             onClose();              // ✅ close instantly (no await)
//         } catch (err) {
//             toast.error("Save failed:", err);
            
//             setSubmitting(false);
//             return;
//         }

//         // optional reset so next open starts fresh (keeps edit intact if reopened with initialForm)
//         setForm({
//             followupType: FOLLOWUP_TYPES[0].value,
//             leadStage: "",
//             leadStatus: "",
//             remark: "",
//             customRemark: "",
//             nextAction: "",
//             scheduleDate: "",
//             scheduleTime: "",
//             priority: " - ",
//         });
//         setSubmitting(false);
//     };

//     // ⬇️ re-hydrate form when opening/editing
//     useEffect(() => {
//         if (!isOpen) return;
//         setForm({
//             followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
//             leadStage: initialForm?.leadStage || "",
//             leadStatus: initialForm?.leadStatus || "",
//             remark: initialForm?.remark || "",
//             customRemark: initialForm?.customRemark || "",
//             nextAction: initialForm?.nextAction || "",
//             scheduleDate: initialForm?.scheduleDate || "",
//             scheduleTime: initialForm?.scheduleTime || "",
//             priority: initialForm?.priority || "Medium", // 👈 here also
//         });

//         if (apiData.length && initialForm?.leadStage) {
//             const sts = statusesForStageFrom(apiData, initialForm.leadStage);
//             setAvailableStatuses(sts);
//             const rems = initialForm.leadStatus ? remarksForStatusFrom(apiData, initialForm.leadStatus) : [];
//             setAvailableRemarks(rems);
//         } else {
//             setAvailableStatuses([]);
//             setAvailableRemarks([]);
//         }
//     }, [isOpen, initialForm, apiData]);

//     const selectedType =
//         FOLLOWUP_TYPES.find((t) => t.value === form.followupType) || FOLLOWUP_TYPES[0];
//     const ringColor =
//         selectedType.color === "blue"
//             ? "focus:ring-blue-500"
//             : selectedType.color === "green"
//                 ? "focus:ring-green-500"
//                 : selectedType.color === "indigo"
//                     ? "focus:ring-indigo-500"
//                     : selectedType.color === "orange"
//                         ? "focus:ring-orange-500"
//                         : selectedType.color === "purple"
//                             ? "focus:ring-purple-500"
//                             : "focus:ring-gray-500";

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 m-4 max-h-[90vh] overflow-y-auto border border-gray-100">
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text">
//                         {isEdit ? "Edit Follow-up" : "Add New Follow-up"}
//                     </h3>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
//                         aria-label="Close"
//                     >
//                         ×
//                     </button>
//                 </div>

//                 {error && (
//                     <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {/* Row 1 */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Followup Type</label>
//                             <ColoredFollowupTypeSelect
//                                 options={FOLLOWUP_TYPES}
//                                 value={form.followupType}
//                                 onChange={(v) => setForm((f) => ({ ...f, followupType: v }))}
//                                 disabled={loading}
//                             />
//                         </div>
//                         {/* Priority */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Lead Priority</label>
//                             <select
//                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
//                                 value={form.priority}
//                                 onChange={handleChange("priority")}
//                             >
//                                 <option value="">Select Priority</option>
//                                 {priorityOptions.map((opt) => (
//                                     <option key={opt.value} value={opt.value}>
//                                         {opt.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Lead Stage</label>
//                             <select
//                                 className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${ringColor}`}
//                                 value={form.leadStage}
//                                 onChange={handleStageChange}
//                                 disabled={loading || availableStages.length === 0}
//                             >
//                                 <option value="">Select stage…</option>
//                                 {availableStages.map((s) => (
//                                     <option key={s} value={s}>
//                                         {s}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     {/* Row 2 */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Lead Status</label>
//                             <select
//                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                 value={form.leadStatus}
//                                 onChange={handleStatusChange}
//                                 disabled={loading || !form.leadStage || availableStatuses.length === 0}
//                             >
//                                 <option value="">{form.leadStage ? "Select status…" : "Select stage first"}</option>
//                                 {availableStatuses.map((s) => (
//                                     <option key={s} value={s}>
//                                         {s}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Remarks</label>
//                             <select
//                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                                 value={form.remark}
//                                 onChange={handleRemarkChange}
//                                 disabled={loading || !form.leadStatus || availableRemarks.length === 0}
//                             >
//                                 <option value="">{form.leadStatus ? "Select remark…" : "Select status first"}</option>
//                                 {availableRemarks.map((r) => (
//                                     <option key={r} value={r}>
//                                         {r}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     {/* Custom Remark */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Custom Remark</label>
//                         <textarea
//                             className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             placeholder="Select a remark above or type your own details…"
//                             value={form.customRemark}
//                             onChange={handleChange("customRemark")}
//                         />
//                     </div>

//                     {/* Next Action */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Next Action</label>
//                         <input
//                             type="text"
//                             className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
//                             placeholder="Enter next action..."
//                             value={form.nextAction}
//                             onChange={handleChange("nextAction")}
//                         />
//                     </div>

//                     {/* Schedule */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
//                             {(() => {
//                                 const tomorrow = new Date();
//                                 tomorrow.setDate(tomorrow.getDate() + 1);
//                                 const minDate = tomorrow.toISOString().split("T")[0];
//                                 return (
//                                     <input
//                                         type="date"
//                                         className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
//                                         value={form.scheduleDate}
//                                         onChange={handleChange("scheduleDate")}
//                                         min={minDate}
//                                     />
//                                 );
//                             })()}
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
//                             <input
//                                 type="time"
//                                 className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                                 value={form.scheduleTime}
//                                 onChange={handleChange("scheduleTime")}
//                             />
//                         </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex justify-end gap-3 pt-4">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 transition-colors"
//                             disabled={loading || submitting} // prevents double submit
//                         >
//                             {isEdit ? (submitting ? "Updating..." : "Update Follow-up")
//                                 : (submitting ? "Saving..." : "Save Follow-up")}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default FollowupModal;


import React, { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Users, MessageSquare, X, Calendar, Clock, Flag, Target, FileText, UserCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import toast from "react-hot-toast";

// ESALE Theme Colors (same as PropertyNegotiationModal)
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* ===================== Types ===================== */
export type FollowupForm = {
    followupType: string;
    leadStage: string;
    leadStatus: string;
    remark: string;
    customRemark: string;
    nextAction: string;
    scheduleDate: string;
    scheduleTime: string;
    priority: string;
};

export type FollowupFormWithLead = FollowupForm & { lead_id: string; id?: string | number };

type APIRemarkData = {
    id: string | number;
    type1Name: string;
    value1Id: string;
    value1Name: string;
    type2Name: string;
    value2Id: string;
    value2Name: string;
    label?: string;
    value?: string;
    remarks?: string[];
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FollowupFormWithLead) => void;
    tabId: string;
    leadId: string;
    initialForm?: Partial<FollowupFormWithLead>;
};

export const FOLLOWUP_TYPES = [
    { value: "Phone Call", Icon: Phone, color: "blue" },
    { value: "WhatsApp", Icon: FaWhatsapp, color: "green" },
    { value: "Email", Icon: Mail, color: "indigo" },
    { value: "Site Visit", Icon: MapPin, color: "orange" },
    { value: "Meeting", Icon: Users, color: "purple" },
    { value: "Other", Icon: MessageSquare, color: "gray" },
] as const;

type Row = APIRemarkData;

const uniq = (arr: string[]) =>
    Array.from(new Set(arr.map((s) => (s || "").trim()).filter(Boolean)));

const extractAllOfTypeFrom = (rows: Row[], typeName: string) => {
    const vals: string[] = [];
    rows.forEach((r) => {
        if (r.type1Name === typeName) vals.push(r.value1Name);
        if (r.type2Name === typeName) vals.push(r.value2Name);
    });
    return uniq(vals);
};

const statusesForStageFrom = (rows: Row[], stage: string) => {
    const out: string[] = [];
    rows.forEach((r) => {
        const left =
            r.type1Name === "Lead Stage" &&
            r.value1Name === stage &&
            r.type2Name === "Lead Status";
        const right =
            r.type2Name === "Lead Stage" &&
            r.value2Name === stage &&
            r.type1Name === "Lead Status";
        if (left) out.push(r.value2Name);
        if (right) out.push(r.value1Name);
    });
    return uniq(out);
};

const remarksForStatusFrom = (rows: Row[], status: string) => {
    const out: string[] = [];
    rows.forEach((r) => {
        const statusMatches =
            (r.type1Name === "Lead Status" && r.value1Name === status) ||
            (r.type2Name === "Lead Status" && r.value2Name === status);

        if (statusMatches && Array.isArray(r.remarks) && r.remarks.length) {
            out.push(...r.remarks.filter(Boolean));
        }
        if (r.type1Name === "Lead Status" && r.value1Name === status && r.type2Name === "Remarks") {
            out.push(r.value2Name);
        }
        if (r.type2Name === "Lead Status" && r.value2Name === status && r.type1Name === "Remarks") {
            out.push(r.value1Name);
        }
    });
    return uniq(out);
};

/* -------- colored custom dropdown for Followup Type -------- */
type TypeOption = { value: string; Icon: any; color: string };

const TYPE_COLOR_BG: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    gray: "bg-gray-50 border-gray-200 text-gray-600",
};

const ColoredFollowupTypeSelect: React.FC<{
    options: readonly TypeOption[];
    value: string;
    onChange: (next: string) => void;
    disabled?: boolean;
}> = ({ options, value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    const current = options.find((o) => o.value === value) ?? options[0];
    const CurrentIcon = current.Icon;
    const colorClass = TYPE_COLOR_BG[current.color] || "bg-gray-50 border-gray-200 text-gray-600";

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                className={`mt-1 w-full border rounded-xl px-3 py-2.5 text-left flex items-center gap-2.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${colorClass} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <CurrentIcon size={18} />
                <span className="flex-1 font-medium">{current.value}</span>
                <svg viewBox="0 0 20 20" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="currentColor">
                    <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
            </button>

            {open && !disabled && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto" style={{ borderColor: BD }}>
                    {options.map((opt) => {
                        const Ico = opt.Icon;
                        const optColorClass = TYPE_COLOR_BG[opt.color] || "bg-gray-50 text-gray-600";
                        const selected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`w-full px-3 py-2.5 text-left flex items-center gap-2.5 text-sm transition-colors
                                    ${selected ? "bg-orange-50" : "hover:bg-gray-50"}`}
                            >
                                <Ico size={18} className={optColorClass.split(" ")[2]} />
                                <span className="font-medium">{opt.value}</span>
                                {selected && <CheckCircle size={14} className="ml-auto text-orange-500" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Helper component for form fields
const FormField: React.FC<{
    label: string;
    required?: boolean;
    children: React.ReactNode;
    icon?: React.ReactNode;
}> = ({ label, required, children, icon }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
            {icon && <span className="text-orange-500">{icon}</span>}
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const CheckCircle = ({ size, className }: { size?: number; className?: string }) => (
    <svg className={className} width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ------------------------- Modal ------------------------- */
const FollowupModal: React.FC<Props> = ({ isOpen, onClose, onSave, tabId, leadId, initialForm }) => {
    if (!isOpen) return null;

    const isEdit = Boolean(initialForm?.id);
    const [priorityOptions, setPriorityOptions] = useState<{ value: string, label: string }[]>([]);

    const [apiData, setApiData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [availableStages, setAvailableStages] = useState<string[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
    const [availableRemarks, setAvailableRemarks] = useState<string[]>([]);

    const [form, setForm] = useState<FollowupForm>(() => ({
        followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
        leadStage: initialForm?.leadStage || "",
        leadStatus: initialForm?.leadStatus || "",
        remark: initialForm?.remark || "",
        customRemark: initialForm?.customRemark || "",
        nextAction: initialForm?.nextAction || "",
        scheduleDate: initialForm?.scheduleDate || "",
        scheduleTime: initialForm?.scheduleTime || "",
        priority: initialForm?.priority || "Medium",
    }));

    useEffect(() => {
        const fetchPriorities = async () => {
            try {
                const data = await getMasterDropdownOptions(["lead"]);
                if (data["lead priority"]) {
                    setPriorityOptions(data["lead priority"]);
                }
            } catch (err) {
                console.error("Error fetching lead priority:", err);
            }
        };
        if (isOpen) fetchPriorities();
    }, [isOpen]);

    useEffect(() => {
        const load = async () => {
            if (!isOpen) return;
            setLoading(true);
            setError(null);
            try {
                const data = (await connectedRemarkAPI.getRemarksByTabId(tabId)) as Row[];
                const safe = Array.isArray(data) ? data : [];
                setApiData(safe);

                const stages = extractAllOfTypeFrom(safe, "Lead Stage");
                setAvailableStages(stages);

                if (initialForm?.leadStage) {
                    const sts = statusesForStageFrom(safe, initialForm.leadStage);
                    setAvailableStatuses(sts);
                    if (initialForm.leadStatus) {
                        const rems = remarksForStatusFrom(safe, initialForm.leadStatus);
                        setAvailableRemarks(rems);
                    } else {
                        setAvailableRemarks([]);
                    }
                } else {
                    setAvailableStatuses([]);
                    setAvailableRemarks([]);
                }
            } catch (e) {
                console.error("Failed to load follow-up options:", e);
                setError("Failed to load follow-up options.");
                setApiData([]);
                setAvailableStages([]);
                setAvailableStatuses([]);
                setAvailableRemarks([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen, tabId]);

    const handleChange =
        (key: keyof FollowupForm) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stage = e.target.value;
        const nextStatuses = stage ? statusesForStageFrom(apiData, stage) : [];
        setAvailableStatuses(nextStatuses);

        setAvailableRemarks([]);
        setForm((f) => ({
            ...f,
            leadStage: stage,
            leadStatus: "",
            remark: "",
            customRemark: "",
        }));
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const status = e.target.value;
        const nextRemarks = status ? remarksForStatusFrom(apiData, status) : [];
        setAvailableRemarks(nextRemarks);

        setForm((f) => ({
            ...f,
            leadStatus: status,
            remark: "",
            customRemark: "",
        }));
    };

    const handleRemarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const remark = e.target.value;
        setForm((f) => ({
            ...f,
            remark,
            customRemark: remark ? `${remark} – ` : "",
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        if (!form.leadStage) {
            toast.error("Please select a Lead Stage.");
            return;
        }
        if (!form.leadStatus) {
            toast.error("Please select a Lead Status.");
            return;
        }

        const payload: FollowupFormWithLead = {
            ...form,
            lead_id: leadId,
            ...(initialForm?.id != null ? { id: String(initialForm.id) } : {}),
        };

        setSubmitting(true);

        try {
            onSave(payload);
            onClose();
        } catch (err) {
            toast.error("Save failed");
            setSubmitting(false);
            return;
        }

        setForm({
            followupType: FOLLOWUP_TYPES[0].value,
            leadStage: "",
            leadStatus: "",
            remark: "",
            customRemark: "",
            nextAction: "",
            scheduleDate: "",
            scheduleTime: "",
            priority: "Medium",
        });
        setSubmitting(false);
    };

    useEffect(() => {
        if (!isOpen) return;
        setForm({
            followupType: initialForm?.followupType || FOLLOWUP_TYPES[0].value,
            leadStage: initialForm?.leadStage || "",
            leadStatus: initialForm?.leadStatus || "",
            remark: initialForm?.remark || "",
            customRemark: initialForm?.customRemark || "",
            nextAction: initialForm?.nextAction || "",
            scheduleDate: initialForm?.scheduleDate || "",
            scheduleTime: initialForm?.scheduleTime || "",
            priority: initialForm?.priority || "Medium",
        });

        if (apiData.length && initialForm?.leadStage) {
            const sts = statusesForStageFrom(apiData, initialForm.leadStage);
            setAvailableStatuses(sts);
            const rems = initialForm.leadStatus ? remarksForStatusFrom(apiData, initialForm.leadStatus) : [];
            setAvailableRemarks(rems);
        } else {
            setAvailableStatuses([]);
            setAvailableRemarks([]);
        }
    }, [isOpen, initialForm, apiData]);

    const selectedType = FOLLOWUP_TYPES.find((t) => t.value === form.followupType) || FOLLOWUP_TYPES[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: N }}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${O}20` }}>
                            <Target size={16} className="sm:w-5 sm:h-5" style={{ color: O }} />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-lg font-bold text-white">
                                {isEdit ? "Edit Follow-up" : "Add New Follow-up"}
                            </h2>
                            <p className="text-[10px] sm:text-xs text-white/70">
                                {isEdit ? "Update follow-up details" : "Schedule a new follow-up activity"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
                        <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6" style={{ scrollbarWidth: 'thin' }}>
                    
                    {error && (
                        <div className="rounded-xl p-3 text-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        {/* Row 1 - Followup Type & Priority */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <FormField label="Follow-up Type" required icon={<Phone size={10} />}>
                                <ColoredFollowupTypeSelect
                                    options={FOLLOWUP_TYPES}
                                    value={form.followupType}
                                    onChange={(v) => setForm((f) => ({ ...f, followupType: v }))}
                                    disabled={loading}
                                />
                            </FormField>

                            <FormField label="Lead Priority" icon={<Flag size={10} />}>
                                <select
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white"
                                    style={{ borderColor: BD }}
                                    value={form.priority}
                                    onChange={handleChange("priority")}
                                >
                                    <option value="">Select Priority</option>
                                    {priorityOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        </div>

                        {/* Row 2 - Lead Stage */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <FormField label="Lead Stage" required icon={<Target size={10} />}>
                                <select
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white"
                                    style={{ borderColor: BD }}
                                    value={form.leadStage}
                                    onChange={handleStageChange}
                                    disabled={loading || availableStages.length === 0}
                                >
                                    <option value="">Select stage…</option>
                                    {availableStages.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </FormField>

                            {/* Lead Status */}
                            <FormField label="Lead Status" required icon={<UserCheck size={10} />}>
                                <select
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white"
                                    style={{ borderColor: BD }}
                                    value={form.leadStatus}
                                    onChange={handleStatusChange}
                                    disabled={loading || !form.leadStage || availableStatuses.length === 0}
                                >
                                    <option value="">{form.leadStage ? "Select status…" : "Select stage first"}</option>
                                    {availableStatuses.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </FormField>
                        </div>

                        {/* Row 3 - Remarks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <FormField label="Remarks" icon={<FileText size={10} />}>
                                <select
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white"
                                    style={{ borderColor: BD }}
                                    value={form.remark}
                                    onChange={handleRemarkChange}
                                    disabled={loading || !form.leadStatus || availableRemarks.length === 0}
                                >
                                    <option value="">{form.leadStatus ? "Select remark…" : "Select status first"}</option>
                                    {availableRemarks.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </FormField>

                            {/* Next Action */}
                            <FormField label="Next Action" icon={<Target size={10} />}>
                                <input
                                    type="text"
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white"
                                    style={{ borderColor: BD }}
                                    placeholder="Enter next action..."
                                    value={form.nextAction}
                                    onChange={handleChange("nextAction")}
                                />
                            </FormField>
                        </div>

                        {/* Custom Remark - Full Width */}
                        <FormField label="Custom Remark" icon={<FileText size={10} />}>
                            <textarea
                                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white resize-none"
                                style={{ borderColor: BD }}
                                rows={3}
                                placeholder="Select a remark above or type your own details…"
                                value={form.customRemark}
                                onChange={handleChange("customRemark")}
                            />
                        </FormField>

                        {/* Schedule Date & Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            <FormField label="Schedule Date" required icon={<Calendar size={10} />}>
                                {(() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    const minDate = tomorrow.toISOString().split("T")[0];
                                    return (
                                        <input
                                            type="date"
                                            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white"
                                            style={{ borderColor: BD }}
                                            value={form.scheduleDate}
                                            onChange={handleChange("scheduleDate")}
                                            min={minDate}
                                        />
                                    );
                                })()}
                            </FormField>

                            <FormField label="Schedule Time" required icon={<Clock size={10} />}>
                                <input
                                    type="time"
                                    className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all bg-white"
                                    style={{ borderColor: BD }}
                                    value={form.scheduleTime}
                                    onChange={handleChange("scheduleTime")}
                                />
                            </FormField>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t" style={{ borderColor: BD }}>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gray-50 order-2 sm:order-1"
                                style={{ border: `1px solid ${BD}`, color: N }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || submitting}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 order-1 sm:order-2"
                                style={{ background: O }}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {isEdit ? "Updating..." : "Saving..."}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Target size={14} />
                                        {isEdit ? "Update Follow-up" : "Save Follow-up"}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FollowupModal;
