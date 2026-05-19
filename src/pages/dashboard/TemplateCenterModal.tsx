// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Loader2, Save, X, Copy, Check, Plus, Zap, Shield, ChevronDown } from "lucide-react";
// import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
// import TemplateContentAI from "./TemplateContentAI";

// /** -------------------- Simplified variables structure -------------------- */
// const VARS_BY_CHANNEL: Record<
//   string,
//   { key: string; desc: string; cat: string }[]
// > = {
//   sms: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{otp}", desc: "One-time password", cat: "Security" },
//     { key: "{order_id}", desc: "Order ID", cat: "Order" },
//     { key: "{amount}", desc: "Amount", cat: "Order" },
//     { key: "{store_name}", desc: "Store name", cat: "Business" },
//     { key: "{date}", desc: "Date", cat: "Time" },
//     { key: "{time}", desc: "Time", cat: "Time" },
//   ],
//   whatsapp: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{order_id}", desc: "Order ID", cat: "Order" },
//     { key: "{product_name}", desc: "Product name", cat: "Order" },
//     { key: "{amount}", desc: "Amount", cat: "Order" },
//     { key: "{cta_url}", desc: "CTA URL", cat: "Marketing" },
//     { key: "{coupon_code}", desc: "Coupon code", cat: "Marketing" },
//   ],
//   email: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{first_name}", desc: "First name", cat: "Basic" },
//     { key: "{subject}", desc: "Subject line", cat: "Basic" },
//     { key: "{invoice_id}", desc: "Invoice ID", cat: "Billing" },
//     { key: "{amount}", desc: "Amount", cat: "Billing" },
//     { key: "{unsubscribe_link}", desc: "Unsubscribe", cat: "Compliance" },
//   ],
// };

// /** -------------------- Tiny UI helpers -------------------- */
// type BadgeProps = {
//   children: React.ReactNode;
//   className?: string;
// };
// const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => (
//   <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>
//     {children}
//   </span>
// );

// /** -------------------- Compact Variables Panel -------------------- */
// type VariablesPanelProps = {
//   channel: string;
//   onInsert: (token: string) => void;
// };
// function VariablesPanel({ channel, onInsert }: VariablesPanelProps) {
//   const [filter, setFilter] = useState("");
//   const [copied, setCopied] = useState("");
//   const [cat, setCat] = useState("All");
//   const vars = VARS_BY_CHANNEL[channel] || VARS_BY_CHANNEL.sms;

//   const categories = useMemo(() => ["All", ...Array.from(new Set(vars.map((v) => v.cat)))], [vars]);

//   const filtered = useMemo(() => {
//     let list = vars;
//     if (cat !== "All") list = list.filter((v) => v.cat === cat);
//     if (!filter) return list;
//     const q = filter.toLowerCase();
//     return list.filter((v) => v.key.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q));
//   }, [vars, filter, cat]);

//   const copyVar = async (key: string) => {
//     try {
//       // navigator.clipboard might not exist in some test environments — guard it
//       if (navigator.clipboard && navigator.clipboard.writeText) {
//         await navigator.clipboard.writeText(key);
//         setCopied(key);
//         setTimeout(() => setCopied(""), 800);
//       }
//     } catch (_) {
//       // ignore
//     }
//   };

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between gap-2">
//         <h4 className="font-medium text-gray-800 text-xs">Variables</h4>
//         <select
//           value={cat}
//           onChange={(e) => setCat(e.target.value)}
//           className="px-2 py-1 text-xs border rounded-md bg-white"
//           aria-label="Variable category filter"
//         >
//           {categories.map((c) => (
//             <option key={c} value={c}>
//               {c}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="relative">
//         <input
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//           placeholder="Search variables..."
//           className="w-full px-2.5 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
//           aria-label="Search variables"
//         />
//       </div>

//       <div className="max-h-56 overflow-auto space-y-1 pr-0.5">
//         {filtered.map((v) => (
//           <div key={v.key} className="group flex items-center gap-2 p-2 rounded-lg border bg-white hover:bg-gray-50">
//             <div className="flex-1 min-w-0">
//               <code className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{v.key}</code>
//               <div className="text-[10px] text-gray-500 truncate mt-1">{v.desc}</div>
//             </div>
//             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               <button onClick={() => copyVar(v.key)} className="p-1 rounded hover:bg-gray-200" title="Copy" type="button">
//                 {copied === v.key ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
//               </button>
//               <button
//                 onClick={() => onInsert(v.key)}
//                 className="p-1 rounded hover:bg-blue-100 text-blue-600"
//                 title="Insert"
//                 type="button"
//               >
//                 <Plus className="w-3 h-3" />
//               </button>
//             </div>
//           </div>
//         ))}

//         {filtered.length === 0 && <div className="text-[11px] text-gray-500 py-4 text-center">No variables match your search.</div>}
//       </div>
//     </div>
//   );
// }

// /** -------------------- Main Modal (Compact) -------------------- */
// type TemplateData = {
//   id?: string | number;
//   name: string;
//   category: string;
//   content: string;
//   priority: string;
//   autoApprove: boolean;
//   status: string;
//   channel: string;
//   updatedAt?: string;
// };

// type CreateUpdateModalProps = {
//   open: boolean;
//   onClose?: () => void;
//   onSubmit?: (data: TemplateData) => void;
//   channel?: "sms" | "whatsapp" | "email" | string;
//   initial?: Partial<TemplateData> | null;
//   title?: string;
// };

// export default function CreateUpdateModal({
//   open,
//   onClose,
//   onSubmit,
//   channel = "sms",
//   initial = null,
//   title,
// }: CreateUpdateModalProps) {
//   const [name, setName] = useState("");
//   const [category, setCategory] = useState("");
//   const [content, setContent] = useState("");
//   const [priority, setPriority] = useState("Normal");
//   const [autoApprove, setAutoApprove] = useState(false);
//   const [status, setStatus] = useState("pending");
//   const [saving, setSaving] = useState(false);
//   const [showVarsMobile, setShowVarsMobile] = useState(false);
//   const contentRef = useRef<HTMLTextAreaElement | null>(null);

//   const [masterLoading, setMasterLoading] = useState(true);
//   // masters might be { common: { category: MasterOption[] }, ... } depending on backend
//   const [masters, setMasters] = useState<Record<string, any>>({});

//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(["common"]);
//         setMasters(data);
        
//       } catch (err) {
//         console.error("Error fetching master options:", err);
//       } finally {
//         setMasterLoading(false);
//       }
//     };
//     fetchMasters();
//   }, []);

//   /** dynamic category options from master data */
//   const categoryOptions: MasterOption[] = useMemo(() => {
//     // accommodate both shapes: masters.common.category or masters.category
//     const opts = (masters?.common?.category ?? masters?.category) as MasterOption[] | undefined;
//     return opts ?? [];
//   }, [masters]);

//   // Channel-specific character limits
//   const CONTENT_LIMIT = useMemo(() => (channel === "sms" ? 1000 : channel === "whatsapp" ? 2000 : 5000), [channel]);
//   const remaining = CONTENT_LIMIT - content.length;

//   // Populate on open / initial change — keep category from initial if present
//   useEffect(() => {
//     if (!open) return;
//     if (initial) {
//       setName(initial.name ?? "");
//       setCategory(initial.category ?? "");
//       setContent(initial.content ?? "");
//       setPriority(initial.priority ?? "Normal");
//       setAutoApprove(Boolean(initial.autoApprove));
//       setStatus(initial.status ?? (initial.autoApprove ? "approved" : "pending"));
//     } else {
//       setName("");
//       setCategory("");
//       setContent("");
//       setPriority("Normal");
//       setAutoApprove(false);
//       setStatus("pending");
//     }
//   }, [open, initial]);

//   // If master options load after initial and category value isn't in options, inject it so select shows
//   useEffect(() => {
//     if (!masterLoading && initial?.category) {
//       const list = categoryOptions || [];
//       const exists = list.some((o) => o.value === initial.category);
//       if (!exists) {
//         setMasters((prev) => ({
//           ...prev,
//           common: {
//             ...(prev.common || {}),
//             category: [{ value: initial.category, label: initial.category }, ...(prev.common?.category || [])],
//           },
//         }));
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [masterLoading, initial, categoryOptions.length]);

//   // Close on ESC
//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose?.();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, onClose]);

//   const insertAtCursor = (token: string) => {
//     const el = contentRef.current;
//     if (!el) {
//       setContent((prev) => prev + token);
//       return;
//     }
//     const start = typeof el.selectionStart === "number" ? el.selectionStart : content.length;
//     const end = typeof el.selectionEnd === "number" ? el.selectionEnd : content.length;
//     const newContent = content.slice(0, start) + token + content.slice(end);
//     setContent(newContent);
//     // set caret after inserted token
//     requestAnimationFrame(() => {
//       el.focus();
//       const pos = start + token.length;
//       try {
//         el.setSelectionRange(pos, pos);
//       } catch {
//         // some environments may not support setSelectionRange
//       }
//     });
//   };

//   const handleSubmit = (e?: React.FormEvent) => {
//     e?.preventDefault?.();

//     if (!name.trim() || !category || !content.trim()) {
//       console.warn("Validation failed — required fields missing", { name, category, content });
//       return;
//     }

//     setSaving(true);
//     setTimeout(() => {
//       const next: TemplateData = {
//         id: initial?.id,
//         name: name.trim(),
//         category,
//         content,
//         priority,
//         autoApprove,
//         status: autoApprove ? "approved" : status,
//         channel,
//         updatedAt: new Date().toISOString(),
//       };

//       onSubmit?.(next);
//       setSaving(false);
//       onClose?.();
//     }, 250);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={onClose} />

//       {/* Modal Card */}
//       <div
//         role="dialog"
//         aria-modal="true"
//         className="relative bg-white w-full max-w-2xl md:max-w-3xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[88vh]"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
//           <div className="min-w-0">
//             <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{title || (initial ? "Edit Template" : "Create Template")}</h3>
//             <p className="text-[11px] text-gray-500 capitalize">{channel} Template</p>
//           </div>
//           <div className="flex items-center gap-2">
//             {autoApprove ? (
//               <Badge className="bg-emerald-100 text-emerald-700">
//                 <Shield className="w-3.5 h-3.5 mr-1" /> Auto-approve ON
//               </Badge>
//             ) : (
//               <Badge className="bg-amber-100 text-amber-700">
//                 <Zap className="w-3.5 h-3.5 mr-1" /> Manual review
//               </Badge>
//             )}
//             <button onClick={onClose} className="p-2 rounded-lg hover:bg-white transition-colors" aria-label="Close" type="button">
//               <X className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
//           <div className="p-3 md:p-4 space-y-4 pt-0 md:pt-0">
//             {/* Mobile toggle for Variables panel */}
//             <button
//               type="button"
//               onClick={() => setShowVarsMobile((s) => !s)}
//               className="md:hidden inline-flex items-center justify-between w-full text-xs px-3 py-2 rounded-lg border bg-gray-50"
//               aria-expanded={showVarsMobile}
//             >
//               Variables
//               <ChevronDown className={`w-4 h-4 transition ${showVarsMobile ? "rotate-180" : ""}`} />
//             </button>

//             {/* Main Content Area */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               {/* Content Editor (2/3 on md+) */}
//               <div className="md:col-span-2 space-y-3">
//                 <div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Template Name</label>
//                       <input
//                         type="text"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         className="w-60 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                         placeholder="Enter template name"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
//                       <select
//                         value={category}
//                         onChange={(e) => setCategory(e.target.value)}
//                         className="w-60 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
//                         required
//                         disabled={masterLoading || categoryOptions.length === 0}
//                       >
//                         <option value="">Select category</option>
//                         {categoryOptions.map((opt) => (
//                           <option key={opt.value} value={opt.value}>
//                             {opt.label ?? opt.value}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <label className="block text-xs font-medium text-gray-700">Template Content</label>
//                     <div className="text-[11px] text-gray-500">
//                       Limit {CONTENT_LIMIT.toLocaleString()} •
//                       <span className={`ml-1 ${remaining < 100 ? "text-red-600 font-medium" : "text-gray-500"}`}>{remaining} left</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* ----- AI content area ----- */}
//                 <div>
//                   <TemplateContentAI
//                     formData={{ content, name, channel, category, priority }}
//                     // TemplateContentAI may expect either a function updater or an object; accept both
//                     setFormData={(updater: any) => {
//                       const next = typeof updater === "function" ? updater({ content, name, channel, category, priority }) : updater;
//                       if (!next) return;
//                       if (typeof next.content !== "undefined") setContent(next.content);
//                       if (typeof next.name !== "undefined") setName(next.name);
//                       if (typeof next.category !== "undefined") setCategory(next.category);
//                       if (typeof next.priority !== "undefined") setPriority(next.priority);
//                     }}
//                     endpoint="/api/ai/generate-template"
//                   />
//                   {/* Hidden textarea ref for insertion/caret (keeps insertAtCursor working) */}
//                   <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)} className="hidden" aria-hidden />
//                 </div>

//                 {/* Quick Options */}
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t">
//                   {/* Left: Priority */}
//                   <div className="flex items-center gap-2">
//                     <label className="text-xs text-gray-700">Priority</label>
//                     <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-1.5 text-xs border rounded-md bg-white">
//                       <option>Normal</option>
//                       <option>High</option>
//                       <option>Critical</option>
//                     </select>
//                   </div>

//                   {/* Middle: Auto-approve toggle */}
//                   <label className="inline-flex items-center gap-2 cursor-pointer select-none">
//                     <input type="checkbox" className="sr-only peer" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />
//                     <span className="w-9 h-5 bg-gray-200 rounded-full relative transition peer-checked:bg-emerald-500">
//                       <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
//                     </span>
//                     <span className="text-xs text-gray-700">Auto-approve</span>
//                   </label>

//                   {/* Right: Status (disabled if auto-approve) */}
//                   <div className="flex items-center gap-2">
//                     <label className="text-xs text-gray-700">Status</label>
//                     <select
//                       value={autoApprove ? "approved" : status}
//                       onChange={(e) => setStatus(e.target.value)}
//                       className="px-3 py-1.5 text-xs border rounded-md bg-white min-w-[120px]"
//                       disabled={autoApprove}
//                       title="Status"
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="approved">Approved</option>
//                       <option value="rejected">Rejected</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Variables Panel (1/3) */}
//               <div className={`md:col-span-1 bg-gray-50 rounded-lg p-3 border ${showVarsMobile ? "block" : "hidden"} md:block`}>
//                 <VariablesPanel channel={channel} onInsert={insertAtCursor} />
//               </div>
//             </div>
//           </div>
//         </form>

//         {/* Footer */}
//         <div className="p-3 md:p-4 border-t bg-white sticky bottom-0">
//           <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
//             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">
//               Cancel
//             </button>
//             <button
//               type="submit"
//               onClick={handleSubmit}
//               disabled={saving}
//               className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
//             >
//               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//               {initial ? "Update" : "Create"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// // src/components/TemplateCenterModal.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Loader2,
//   Save,
//   X,
//   Copy,
//   Check,
//   Plus,
//   Zap,
//   Shield,
//   ChevronDown,
//   Wand2,
//   SlidersHorizontal,
//   Code2,
//   Eye,
//   Type,
// } from "lucide-react";
// import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
// import TemplateContentAI from "./TemplateContentAI";

// /* ------------------------------------------------------------------ */
// /* Types                                                                */
// /* ------------------------------------------------------------------ */
// type Channel = "sms" | "whatsapp" | "email";

// type TemplateData = {
//   id?: string | number;
//   name: string;
//   category: string;
//   content: string;
//   priority: string;
//   autoApprove: boolean;
//   status: string;
//   channel: string;
//   updatedAt?: string;
// };

// type CreateUpdateModalProps = {
//   open: boolean;
//   onClose?: () => void;
//   onSubmit?: (data: TemplateData) => void;
//   channel?: Channel | string;
//   initial?: Partial<TemplateData> | null;
//   title?: string;
// };

// /* ------------------------------------------------------------------ */
// /* Variables by channel                                                 */
// /* ------------------------------------------------------------------ */
// const VARS_BY_CHANNEL: Record<string, { key: string; desc: string; cat: string }[]> = {
//   sms: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{otp}", desc: "One-time password", cat: "Security" },
//     { key: "{order_id}", desc: "Order ID", cat: "Order" },
//     { key: "{amount}", desc: "Amount", cat: "Order" },
//     { key: "{store_name}", desc: "Store name", cat: "Business" },
//     { key: "{date}", desc: "Date", cat: "Time" },
//     { key: "{time}", desc: "Time", cat: "Time" },
//   ],
//   whatsapp: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{order_id}", desc: "Order ID", cat: "Order" },
//     { key: "{product_name}", desc: "Product name", cat: "Order" },
//     { key: "{amount}", desc: "Amount", cat: "Order" },
//     { key: "{cta_url}", desc: "CTA URL", cat: "Marketing" },
//     { key: "{coupon_code}", desc: "Coupon code", cat: "Marketing" },
//   ],
//   email: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{first_name}", desc: "First name", cat: "Basic" },
//     { key: "{subject}", desc: "Subject line", cat: "Basic" },
//     { key: "{invoice_id}", desc: "Invoice ID", cat: "Billing" },
//     { key: "{amount}", desc: "Amount", cat: "Billing" },
//     { key: "{unsubscribe_link}", desc: "Unsubscribe", cat: "Compliance" },
//     { key: "{tenant_name}", desc: "Tenant name", cat: "Property" },
//     { key: "{property_name}", desc: "Property name", cat: "Property" },
//     { key: "{room_number}", desc: "Room number", cat: "Property" },
//     { key: "{monthly_rent}", desc: "Monthly rent", cat: "Property" },
//     { key: "{total_pending}", desc: "Total pending", cat: "Property" },
//   ],
// };

// /* ------------------------------------------------------------------ */
// /* Helpers                                                              */
// /* ------------------------------------------------------------------ */
// function cx(...args: Array<string | false | null | undefined>) {
//   return args.filter(Boolean).join(" ");
// }

// /* ------------------------------------------------------------------ */
// /* Variables Panel                                                      */
// /* ------------------------------------------------------------------ */
// function VariablesPanel({ channel, onInsert }: { channel: string; onInsert: (token: string) => void }) {
//   const [filter, setFilter] = useState("");
//   const [copied, setCopied] = useState("");
//   const [cat, setCat] = useState("All");
//   const vars = VARS_BY_CHANNEL[channel] || VARS_BY_CHANNEL.sms;

//   const categories = useMemo(() => ["All", ...Array.from(new Set(vars.map((v) => v.cat)))], [vars]);

//   const filtered = useMemo(() => {
//     let list = vars;
//     if (cat !== "All") list = list.filter((v) => v.cat === cat);
//     if (!filter) return list;
//     const q = filter.toLowerCase();
//     return list.filter((v) => v.key.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q));
//   }, [vars, filter, cat]);

//   const copyVar = async (key: string) => {
//     try {
//       if (navigator.clipboard?.writeText) {
//         await navigator.clipboard.writeText(key);
//         setCopied(key);
//         setTimeout(() => setCopied(""), 800);
//       }
//     } catch (_) {}
//   };

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between gap-2">
//         <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Variables</h4>
//         <select
//           value={cat}
//           onChange={(e) => setCat(e.target.value)}
//           className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-green-500"
//         >
//           {categories.map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>
//       </div>

//       <input
//         value={filter}
//         onChange={(e) => setFilter(e.target.value)}
//         placeholder="Search variables..."
//         className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400"
//       />

//       <div className="max-h-52 overflow-auto space-y-1 pr-0.5">
//         {filtered.map((v) => (
//           <div key={v.key} className="group flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-white hover:bg-green-50 hover:border-green-200 transition-colors">
//             <div className="flex-1 min-w-0">
//               <code className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-mono">{v.key}</code>
//               <div className="text-[10px] text-gray-500 truncate mt-0.5">{v.desc}</div>
//             </div>
//             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               <button onClick={() => copyVar(v.key)} className="p-1 rounded hover:bg-gray-200" title="Copy" type="button">
//                 {copied === v.key ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
//               </button>
//               <button onClick={() => onInsert(v.key)} className="p-1 rounded hover:bg-green-100 text-green-600" title="Insert" type="button">
//                 <Plus className="w-3 h-3" />
//               </button>
//             </div>
//           </div>
//         ))}
//         {filtered.length === 0 && (
//           <div className="text-[11px] text-gray-500 py-3 text-center">No variables match.</div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /* Minimal HTML Code Editor (for email)                                 */
// /* ------------------------------------------------------------------ */
// function CodeEditor({
//   value,
//   onChange,
//   onInsert,
//   editorRef,
// }: {
//   value: string;
//   onChange: (v: string) => void;
//   onInsert?: (ref: React.RefObject<HTMLTextAreaElement>) => void;
//   editorRef: React.RefObject<HTMLTextAreaElement>;
// }) {
//   const [viewMode, setViewMode] = useState<"code" | "preview">("code");

//   return (
//     <div className="border-2 border-green-400 rounded-lg overflow-hidden">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between bg-gray-900 px-3 py-1.5 gap-2">
//         <div className="flex items-center gap-1">
//           <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
//           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
//           <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
//         </div>
//         <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
//           <Code2 className="w-3 h-3" /> HTML Editor
//         </span>
//         <div className="flex items-center bg-gray-800 rounded-md overflow-hidden border border-gray-700">
//           <button
//             type="button"
//             onClick={() => setViewMode("code")}
//             className={cx("px-2 py-1 text-[10px] flex items-center gap-1 transition-colors", viewMode === "code" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white")}
//           >
//             <Code2 className="w-3 h-3" /> Code
//           </button>
//           <button
//             type="button"
//             onClick={() => setViewMode("preview")}
//             className={cx("px-2 py-1 text-[10px] flex items-center gap-1 transition-colors", viewMode === "preview" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white")}
//           >
//             <Eye className="w-3 h-3" /> Preview
//           </button>
//         </div>
//       </div>

//       {viewMode === "code" ? (
//         <textarea
//           ref={editorRef}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           className="w-full bg-gray-900 text-green-300 font-mono text-xs px-4 py-3 min-h-[200px] resize-y focus:outline-none focus:ring-0 border-0 leading-relaxed"
//           placeholder={`<div style="font-family: Arial, sans-serif;">\n  <h1>Hello {name}!</h1>\n  <p>Your order {order_id} is ready.</p>\n</div>`}
//           spellCheck={false}
//         />
//       ) : (
//         <div
//           className="min-h-[200px] bg-white p-4 text-sm overflow-auto"
//           dangerouslySetInnerHTML={{ __html: value || "<p class='text-gray-400 text-xs'>Nothing to preview yet...</p>" }}
//         />
//       )}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /* Main Modal                                                           */
// /* ------------------------------------------------------------------ */
// export default function TemplateCenterModal({
//   open,
//   onClose,
//   onSubmit,
//   channel = "sms",
//   initial = null,
//   title,
// }: CreateUpdateModalProps) {
//   const [name, setName] = useState("");
//   const [category, setCategory] = useState("");
//   const [content, setContent] = useState("");
//   const [priority, setPriority] = useState("Normal");
//   const [autoApprove, setAutoApprove] = useState(false);
//   const [status, setStatus] = useState("pending");
//   const [saving, setSaving] = useState(false);
//   const [showVarsMobile, setShowVarsMobile] = useState(false);
//   const [emailTab, setEmailTab] = useState<"editor" | "ai">("editor");
//   const contentRef = useRef<HTMLTextAreaElement | null>(null);
//   const codeEditorRef = useRef<HTMLTextAreaElement | null>(null);

//   const isEmail = channel === "email";

//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<Record<string, any>>({});

//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(["common"]);
//         setMasters(data);
//       } catch (err) {
//         console.error("Error fetching master options:", err);
//       } finally {
//         setMasterLoading(false);
//       }
//     };
//     fetchMasters();
//   }, []);

//   const categoryOptions: MasterOption[] = useMemo(() => {
//     const opts = (masters?.common?.category ?? masters?.category) as MasterOption[] | undefined;
//     return opts ?? [];
//   }, [masters]);

//   const CONTENT_LIMIT = useMemo(() => (channel === "sms" ? 1000 : channel === "whatsapp" ? 2000 : 5000), [channel]);
//   const remaining = CONTENT_LIMIT - content.length;

//   useEffect(() => {
//     if (!open) return;
//     if (initial) {
//       setName(initial.name ?? "");
//       setCategory(initial.category ?? "");
//       setContent(initial.content ?? "");
//       setPriority(initial.priority ?? "Normal");
//       setAutoApprove(Boolean(initial.autoApprove));
//       setStatus(initial.status ?? (initial.autoApprove ? "approved" : "pending"));
//     } else {
//       setName("");
//       setCategory("");
//       setContent("");
//       setPriority("Normal");
//       setAutoApprove(false);
//       setStatus("pending");
//     }
//     setEmailTab("editor");
//   }, [open, initial]);

//   useEffect(() => {
//     if (!masterLoading && initial?.category) {
//       const list = categoryOptions || [];
//       const exists = list.some((o) => o.value === initial.category);
//       if (!exists) {
//         setMasters((prev) => ({
//           ...prev,
//           common: {
//             ...(prev.common || {}),
//             category: [{ value: initial.category, label: initial.category }, ...(prev.common?.category || [])],
//           },
//         }));
//       }
//     }
//   }, [masterLoading, initial, categoryOptions.length]);

//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, onClose]);

//   const insertAtCursor = (token: string) => {
//     // For email code editor
//     const el = isEmail ? codeEditorRef.current : contentRef.current;
//     if (!el) {
//       setContent((prev) => prev + token);
//       return;
//     }
//     const start = typeof el.selectionStart === "number" ? el.selectionStart : content.length;
//     const end = typeof el.selectionEnd === "number" ? el.selectionEnd : content.length;
//     const newContent = content.slice(0, start) + token + content.slice(end);
//     setContent(newContent);
//     requestAnimationFrame(() => {
//       el.focus();
//       const pos = start + token.length;
//       try { el.setSelectionRange(pos, pos); } catch {}
//     });
//   };

//   const handleSubmit = (e?: React.FormEvent) => {
//     e?.preventDefault?.();
//     if (!name.trim() || !category || !content.trim()) return;
//     setSaving(true);
//     setTimeout(() => {
//       const next: TemplateData = {
//         id: initial?.id,
//         name: name.trim(),
//         category,
//         content,
//         priority,
//         autoApprove,
//         status: autoApprove ? "approved" : status,
//         channel,
//         updatedAt: new Date().toISOString(),
//       };
//       onSubmit?.(next);
//       setSaving(false);
//       onClose?.();
//     }, 250);
//   };

//   if (!open) return null;

//   /* ---------------------------------------------------------------- */
//   /* Render                                                            */
//   /* ---------------------------------------------------------------- */
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={onClose} />

//       {/* Modal */}
//       <div
//         role="dialog"
//         aria-modal="true"
//         className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
//         style={{ maxHeight: "92vh" }}
//       >
//         {/* Header — green theme like BuyerFormModal */}
//         <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 flex-shrink-0">
//           <div className="min-w-0">
//             <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
//               {title || (initial ? "Edit Template" : "Create Template")}
//             </h3>
//             <p className="text-[11px] text-gray-500 capitalize">{channel} Template</p>
//           </div>
//           <div className="flex items-center gap-2">
//             {autoApprove ? (
//               <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-700">
//                 <Shield className="w-3.5 h-3.5" /> Auto-approve ON
//               </span>
//             ) : (
//               <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-100 text-amber-700">
//                 <Zap className="w-3.5 h-3.5" /> Manual review
//               </span>
//             )}
//             <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white transition-colors" type="button">
//               <X className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Scrollable Body */}
//         <div className="flex-1 overflow-y-auto">
//           <form onSubmit={handleSubmit}>
//             <div className="p-3 sm:p-4 space-y-4">

//               {/* Row 1: Name + Category + Priority + Status */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
//                 <div className="sm:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Template Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg h-9 px-3 text-xs bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
//                     placeholder="Enter template name"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg h-9 px-2 text-xs bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
//                     required
//                     disabled={masterLoading || categoryOptions.length === 0}
//                   >
//                     <option value="">Select category</option>
//                     {categoryOptions.map((opt) => (
//                       <option key={opt.value} value={opt.value}>{opt.label ?? opt.value}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
//                   <select
//                     value={priority}
//                     onChange={(e) => setPriority(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg h-9 px-2 text-xs bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
//                   >
//                     <option>Normal</option>
//                     <option>High</option>
//                     <option>Critical</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Row 2: Auto-approve + Status */}
//               <div className="flex flex-wrap items-center gap-4 pb-1 border-b border-gray-100">
//                 <label className="inline-flex items-center gap-2 cursor-pointer select-none">
//                   <input
//                     type="checkbox"
//                     className="sr-only peer"
//                     checked={autoApprove}
//                     onChange={(e) => setAutoApprove(e.target.checked)}
//                   />
//                   <span className="relative w-9 h-5 bg-gray-200 rounded-full transition peer-checked:bg-green-500">
//                     <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4 block" />
//                   </span>
//                   <span className="text-xs text-gray-700 font-medium">Auto-approve</span>
//                 </label>

//                 <div className="flex items-center gap-2">
//                   <label className="text-xs text-gray-700 font-medium">Status</label>
//                   <select
//                     value={autoApprove ? "approved" : status}
//                     onChange={(e) => setStatus(e.target.value)}
//                     disabled={autoApprove}
//                     className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-green-400 min-w-[110px] disabled:opacity-60"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="approved">Approved</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Content Area — 2/3 + Variables sidebar */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                 {/* Left: Content Editor */}
//                 <div className="md:col-span-2 space-y-2">

//                   {/* Email: Tab switcher (Editor / Generate with AI) */}
//                   {isEmail && (
//                     <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
//                       <button
//                         type="button"
//                         onClick={() => setEmailTab("editor")}
//                         className={cx(
//                           "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
//                           emailTab === "editor" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
//                         )}
//                       >
//                         <Code2 className="w-3.5 h-3.5" /> Code Editor
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setEmailTab("ai")}
//                         className={cx(
//                           "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
//                           emailTab === "ai" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
//                         )}
//                       >
//                         <Wand2 className="w-3.5 h-3.5" /> Generate with AI
//                       </button>
//                     </div>
//                   )}

//                   {/* Email Code Editor tab */}
//                   {isEmail && emailTab === "editor" && (
//                     <>
//                       <div className="flex items-center justify-between">
//                         <label className="text-xs font-medium text-gray-700">HTML Content</label>
//                         <span className="text-[11px] text-gray-400">
//                           {CONTENT_LIMIT.toLocaleString()} limit •{" "}
//                           <span className={remaining < 200 ? "text-red-600 font-medium" : "text-gray-500"}>{remaining} left</span>
//                         </span>
//                       </div>
//                       <CodeEditor
//                         value={content}
//                         onChange={setContent}
//                         editorRef={codeEditorRef}
//                       />
//                     </>
//                   )}

//                   {/* Email AI tab */}
//                   {isEmail && emailTab === "ai" && (
//                     <div className="border-2 border-green-400 rounded-lg overflow-hidden">
//                       <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-green-200">
//                         <p className="text-xs font-medium text-green-700 flex items-center gap-1">
//                           <Wand2 className="w-3.5 h-3.5" /> AI Template Generator
//                         </p>
//                         <p className="text-[10px] text-gray-500 mt-0.5">Generated content will appear in the Code Editor tab</p>
//                       </div>
//                       <div className="p-3">
//                         <TemplateContentAI
//                           formData={{ content, name, channel, category, priority }}
//                           setFormData={(updater: any) => {
//                             const next = typeof updater === "function"
//                               ? updater({ content, name, channel, category, priority })
//                               : updater;
//                             if (!next) return;
//                             if (typeof next.content !== "undefined") setContent(next.content);
//                             if (typeof next.name !== "undefined") setName(next.name);
//                             if (typeof next.category !== "undefined") setCategory(next.category);
//                             if (typeof next.priority !== "undefined") setPriority(next.priority);
//                           }}
//                           endpoint="/api/ai/generate-template"
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {/* SMS / WhatsApp: plain textarea with AI inline */}
//                   {!isEmail && (
//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between">
//                         <label className="text-xs font-medium text-gray-700">
//                           Template Content <span className="text-red-500">*</span>
//                         </label>
//                         <span className="text-[11px] text-gray-400">
//                           {CONTENT_LIMIT.toLocaleString()} limit •{" "}
//                           <span className={remaining < 100 ? "text-red-600 font-medium" : "text-gray-500"}>{remaining} left</span>
//                         </span>
//                       </div>
//                       <div className="border-2 border-green-400 rounded-lg overflow-hidden">
//                         <TemplateContentAI
//                           formData={{ content, name, channel, category, priority }}
//                           setFormData={(updater: any) => {
//                             const next = typeof updater === "function"
//                               ? updater({ content, name, channel, category, priority })
//                               : updater;
//                             if (!next) return;
//                             if (typeof next.content !== "undefined") setContent(next.content);
//                             if (typeof next.name !== "undefined") setName(next.name);
//                             if (typeof next.category !== "undefined") setCategory(next.category);
//                             if (typeof next.priority !== "undefined") setPriority(next.priority);
//                           }}
//                           endpoint="/api/ai/generate-template"
//                         />
//                         {/* Hidden ref textarea for insertAtCursor */}
//                         <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)} className="hidden" aria-hidden />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Right: Variables Panel — hidden on mobile unless toggled */}
//                 <div className="md:col-span-1">
//                   {/* Mobile toggle */}
//                   <button
//                     type="button"
//                     onClick={() => setShowVarsMobile((s) => !s)}
//                     className="md:hidden w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 mb-2"
//                   >
//                     <span className="font-medium text-gray-700">Variables</span>
//                     <ChevronDown className={cx("w-4 h-4 transition-transform", showVarsMobile ? "rotate-180" : "")} />
//                   </button>

//                   <div className={cx("bg-gray-50 rounded-lg p-3 border-2 border-green-200", showVarsMobile ? "block" : "hidden md:block")}>
//                     <VariablesPanel channel={channel} onInsert={insertAtCursor} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Footer */}
//         <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
//           <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={saving || !name.trim() || !category || !content.trim()}
//               className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-xs font-medium"
//             >
//               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//               {initial ? "Update Template" : "Create Template"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// // src/components/TemplateCenterModal.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   Loader2,
//   Save,
//   X,
//   Copy,
//   Check,
//   Plus,
//   Zap,
//   Shield,
//   ChevronDown,
//   Wand2,
//   SlidersHorizontal,
//   Code2,
//   Eye,
//   Type,
// } from "lucide-react";
// import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
// import TemplateContentAI from "./TemplateContentAI";

// /* ------------------------------------------------------------------ */
// /* Types                                                                */
// /* ------------------------------------------------------------------ */
// type Channel = "sms" | "whatsapp" | "email";

// type TemplateData = {
//   id?: string | number;
//   name: string;
//   category: string;
//   content: string;
//   priority: string;
//   autoApprove: boolean;
//   status: string;
//   channel: string;
//   updatedAt?: string;
// };

// type CreateUpdateModalProps = {
//   open: boolean;
//   onClose?: () => void;
//   onSubmit?: (data: TemplateData) => void;
//   channel?: Channel | string;
//   initial?: Partial<TemplateData> | null;
//   title?: string;
// };

// /* ------------------------------------------------------------------ */
// /* Variables by channel                                                 */
// /* ------------------------------------------------------------------ */
// const VARS_BY_CHANNEL: Record<string, { key: string; desc: string; cat: string }[]> = {
//   sms: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{otp}", desc: "One-time password", cat: "Security" },
//     { key: "{order_id}", desc: "Order ID", cat: "Order" },
//     { key: "{amount}", desc: "Amount", cat: "Order" },
//     { key: "{store_name}", desc: "Store name", cat: "Business" },
//     { key: "{date}", desc: "Date", cat: "Time" },
//     { key: "{time}", desc: "Time", cat: "Time" },
//   ],
//   whatsapp: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{order_id}", desc: "Order ID", cat: "Order" },
//     { key: "{product_name}", desc: "Product name", cat: "Order" },
//     { key: "{amount}", desc: "Amount", cat: "Order" },
//     { key: "{cta_url}", desc: "CTA URL", cat: "Marketing" },
//     { key: "{coupon_code}", desc: "Coupon code", cat: "Marketing" },
//   ],
//   email: [
//     { key: "{name}", desc: "Recipient name", cat: "Basic" },
//     { key: "{first_name}", desc: "First name", cat: "Basic" },
//     { key: "{subject}", desc: "Subject line", cat: "Basic" },
//     { key: "{invoice_id}", desc: "Invoice ID", cat: "Billing" },
//     { key: "{amount}", desc: "Amount", cat: "Billing" },
//     { key: "{unsubscribe_link}", desc: "Unsubscribe", cat: "Compliance" },
//     { key: "{tenant_name}", desc: "Tenant name", cat: "Property" },
//     { key: "{property_name}", desc: "Property name", cat: "Property" },
//     { key: "{room_number}", desc: "Room number", cat: "Property" },
//     { key: "{monthly_rent}", desc: "Monthly rent", cat: "Property" },
//     { key: "{total_pending}", desc: "Total pending", cat: "Property" },
//   ],
// };

// /* ------------------------------------------------------------------ */
// /* Helpers                                                              */
// /* ------------------------------------------------------------------ */
// function cx(...args: Array<string | false | null | undefined>) {
//   return args.filter(Boolean).join(" ");
// }

// /* ------------------------------------------------------------------ */
// /* Variables Panel                                                      */
// /* ------------------------------------------------------------------ */
// function VariablesPanel({ channel, onInsert }: { channel: string; onInsert: (token: string) => void }) {
//   const [filter, setFilter] = useState("");
//   const [copied, setCopied] = useState("");
//   const [cat, setCat] = useState("All");
//   const vars = VARS_BY_CHANNEL[channel] || VARS_BY_CHANNEL.sms;

//   const categories = useMemo(() => ["All", ...Array.from(new Set(vars.map((v) => v.cat)))], [vars]);

//   const filtered = useMemo(() => {
//     let list = vars;
//     if (cat !== "All") list = list.filter((v) => v.cat === cat);
//     if (!filter) return list;
//     const q = filter.toLowerCase();
//     return list.filter((v) => v.key.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q));
//   }, [vars, filter, cat]);

//   const copyVar = async (key: string) => {
//     try {
//       if (navigator.clipboard?.writeText) {
//         await navigator.clipboard.writeText(key);
//         setCopied(key);
//         setTimeout(() => setCopied(""), 800);
//       }
//     } catch (_) {}
//   };

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between gap-2">
//         <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Variables</h4>
//         <select
//           value={cat}
//           onChange={(e) => setCat(e.target.value)}
//           className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-green-500"
//         >
//           {categories.map((c) => (
//             <option key={c} value={c}>{c}</option>
//           ))}
//         </select>
//       </div>

//       <input
//         value={filter}
//         onChange={(e) => setFilter(e.target.value)}
//         placeholder="Search variables..."
//         className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400"
//       />

//       <div className="max-h-52 overflow-auto space-y-1 pr-0.5">
//         {filtered.map((v) => (
//           <div key={v.key} className="group flex items-center gap-2 p-2 rounded-lg border border-gray-100 bg-white hover:bg-green-50 hover:border-green-200 transition-colors">
//             <div className="flex-1 min-w-0">
//               <code className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-mono">{v.key}</code>
//               <div className="text-[10px] text-gray-500 truncate mt-0.5">{v.desc}</div>
//             </div>
//             <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               <button onClick={() => copyVar(v.key)} className="p-1 rounded hover:bg-gray-200" title="Copy" type="button">
//                 {copied === v.key ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
//               </button>
//               <button onClick={() => onInsert(v.key)} className="p-1 rounded hover:bg-green-100 text-green-600" title="Insert" type="button">
//                 <Plus className="w-3 h-3" />
//               </button>
//             </div>
//           </div>
//         ))}
//         {filtered.length === 0 && (
//           <div className="text-[11px] text-gray-500 py-3 text-center">No variables match.</div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /* Minimal HTML Code Editor (for email)                                 */
// /* ------------------------------------------------------------------ */
// function CodeEditor({
//   value,
//   onChange,
//   onInsert,
//   editorRef,
// }: {
//   value: string;
//   onChange: (v: string) => void;
//   onInsert?: (ref: React.RefObject<HTMLTextAreaElement>) => void;
//   editorRef: React.RefObject<HTMLTextAreaElement>;
// }) {
//   const [viewMode, setViewMode] = useState<"code" | "preview">("code");

//   return (
//     <div className="border-2 border-green-400 rounded-lg overflow-hidden">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between bg-gray-900 px-3 py-1.5 gap-2">
//         <div className="flex items-center gap-1">
//           <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
//           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
//           <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
//         </div>
//         <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
//           <Code2 className="w-3 h-3" /> HTML Editor
//         </span>
//         <div className="flex items-center bg-gray-800 rounded-md overflow-hidden border border-gray-700">
//           <button
//             type="button"
//             onClick={() => setViewMode("code")}
//             className={cx("px-2 py-1 text-[10px] flex items-center gap-1 transition-colors", viewMode === "code" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white")}
//           >
//             <Code2 className="w-3 h-3" /> Code
//           </button>
//           <button
//             type="button"
//             onClick={() => setViewMode("preview")}
//             className={cx("px-2 py-1 text-[10px] flex items-center gap-1 transition-colors", viewMode === "preview" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white")}
//           >
//             <Eye className="w-3 h-3" /> Preview
//           </button>
//         </div>
//       </div>

//       {viewMode === "code" ? (
//         <textarea
//           ref={editorRef}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           className="w-full bg-gray-900 text-green-300 font-mono text-xs px-4 py-3 min-h-[200px] resize-y focus:outline-none focus:ring-0 border-0 leading-relaxed"
//           placeholder={`<div style="font-family: Arial, sans-serif;">\n  <h1>Hello {name}!</h1>\n  <p>Your order {order_id} is ready.</p>\n</div>`}
//           spellCheck={false}
//         />
//       ) : (
//         <div
//           className="min-h-[200px] bg-white p-4 text-sm overflow-auto"
//           dangerouslySetInnerHTML={{ __html: value || "<p class='text-gray-400 text-xs'>Nothing to preview yet...</p>" }}
//         />
//       )}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------ */
// /* Main Modal                                                           */
// /* ------------------------------------------------------------------ */
// export default function TemplateCenterModal({
//   open,
//   onClose,
//   onSubmit,
//   channel = "sms",
//   initial = null,
//   title,
// }: CreateUpdateModalProps) {
//   const [name, setName] = useState("");
//   const [category, setCategory] = useState("");
//   const [content, setContent] = useState("");
//   const [priority, setPriority] = useState("Normal");
//   const [autoApprove, setAutoApprove] = useState(false);
//   const [status, setStatus] = useState("pending");
//   const [saving, setSaving] = useState(false);
//   const [showVarsMobile, setShowVarsMobile] = useState(false);
//   const [emailTab, setEmailTab] = useState<"editor" | "ai">("editor");
//   const contentRef = useRef<HTMLTextAreaElement | null>(null);
//   const codeEditorRef = useRef<HTMLTextAreaElement | null>(null);

//   const isEmail = channel === "email";

//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<Record<string, any>>({});

//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(["common"]);
//         setMasters(data);
//       } catch (err) {
//         console.error("Error fetching master options:", err);
//       } finally {
//         setMasterLoading(false);
//       }
//     };
//     fetchMasters();
//   }, []);

//   const categoryOptions: MasterOption[] = useMemo(() => {
//     const opts = (masters?.common?.category ?? masters?.category) as MasterOption[] | undefined;
//     return opts ?? [];
//   }, [masters]);

//   const CONTENT_LIMIT = useMemo(() => (channel === "sms" ? 1000 : channel === "whatsapp" ? 2000 : 5000), [channel]);
//   const remaining = CONTENT_LIMIT - content.length;

//   useEffect(() => {
//     if (!open) return;
//     if (initial) {
//       setName(initial.name ?? "");
//       setCategory(initial.category ?? "");
//       setContent(initial.content ?? "");
//       setPriority(initial.priority ?? "Normal");
//       setAutoApprove(Boolean(initial.autoApprove));
//       setStatus(initial.status ?? (initial.autoApprove ? "approved" : "pending"));
//     } else {
//       setName("");
//       setCategory("");
//       setContent("");
//       setPriority("Normal");
//       setAutoApprove(false);
//       setStatus("pending");
//     }
//     setEmailTab("editor");
//   }, [open, initial]);

//   useEffect(() => {
//     if (!masterLoading && initial?.category) {
//       const list = categoryOptions || [];
//       const exists = list.some((o) => o.value === initial.category);
//       if (!exists) {
//         setMasters((prev) => ({
//           ...prev,
//           common: {
//             ...(prev.common || {}),
//             category: [{ value: initial.category, label: initial.category }, ...(prev.common?.category || [])],
//           },
//         }));
//       }
//     }
//   }, [masterLoading, initial, categoryOptions.length]);

//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, onClose]);

//   const insertAtCursor = (token: string) => {
//     // For email code editor
//     const el = isEmail ? codeEditorRef.current : contentRef.current;
//     if (!el) {
//       setContent((prev) => prev + token);
//       return;
//     }
//     const start = typeof el.selectionStart === "number" ? el.selectionStart : content.length;
//     const end = typeof el.selectionEnd === "number" ? el.selectionEnd : content.length;
//     const newContent = content.slice(0, start) + token + content.slice(end);
//     setContent(newContent);
//     requestAnimationFrame(() => {
//       el.focus();
//       const pos = start + token.length;
//       try { el.setSelectionRange(pos, pos); } catch {}
//     });
//   };

//   const handleSubmit = (e?: React.FormEvent) => {
//     e?.preventDefault?.();
//     if (!name.trim() || !category || !content.trim()) return;
//     setSaving(true);
//     setTimeout(() => {
//       const next: TemplateData = {
//         id: initial?.id,
//         name: name.trim(),
//         category,
//         content,
//         priority,
//         autoApprove,
//         status: autoApprove ? "approved" : status,
//         channel,
//         updatedAt: new Date().toISOString(),
//       };
//       onSubmit?.(next);
//       setSaving(false);
//       onClose?.();
//     }, 250);
//   };

//   if (!open) return null;

//   /* ---------------------------------------------------------------- */
//   /* Render                                                            */
//   /* ---------------------------------------------------------------- */
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={onClose} />

//       {/* Modal */}
//       <div
//         role="dialog"
//         aria-modal="true"
//         className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
//         style={{ maxHeight: "92vh" }}
//       >
//         {/* Header — green theme like BuyerFormModal */}
//         <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 flex-shrink-0">
//           <div className="min-w-0">
//             <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
//               {title || (initial ? "Edit Template" : "Create Template")}
//             </h3>
//             <p className="text-[11px] text-gray-500 capitalize">{channel} Template</p>
//           </div>
//           <div className="flex items-center gap-2">
//             {autoApprove ? (
//               <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-700">
//                 <Shield className="w-3.5 h-3.5" /> Auto-approve ON
//               </span>
//             ) : (
//               <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-100 text-amber-700">
//                 <Zap className="w-3.5 h-3.5" /> Manual review
//               </span>
//             )}
//             <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white transition-colors" type="button">
//               <X className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Scrollable Body */}
//         <div className="flex-1 overflow-y-auto">
//           <form onSubmit={handleSubmit}>
//             <div className="p-3 sm:p-4 space-y-4">

//               {/* Row 1: Name + Category + Priority + Status */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
//                 <div className="sm:col-span-2">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Template Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg h-9 px-3 text-xs bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
//                     placeholder="Enter template name"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg h-9 px-2 text-xs bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
//                     required
//                     disabled={masterLoading || categoryOptions.length === 0}
//                   >
//                     <option value="">Select category</option>
//                     {categoryOptions.map((opt) => (
//                       <option key={opt.value} value={opt.value}>{opt.label ?? opt.value}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
//                   <select
//                     value={priority}
//                     onChange={(e) => setPriority(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg h-9 px-2 text-xs bg-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-400"
//                   >
//                     <option>Normal</option>
//                     <option>High</option>
//                     <option>Critical</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Row 2: Auto-approve + Status */}
//               <div className="flex flex-wrap items-center gap-4 pb-1 border-b border-gray-100">
//                 <label className="inline-flex items-center gap-2 cursor-pointer select-none">
//                   <input
//                     type="checkbox"
//                     className="sr-only peer"
//                     checked={autoApprove}
//                     onChange={(e) => setAutoApprove(e.target.checked)}
//                   />
//                   <span className="relative w-9 h-5 bg-gray-200 rounded-full transition peer-checked:bg-green-500">
//                     <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4 block" />
//                   </span>
//                   <span className="text-xs text-gray-700 font-medium">Auto-approve</span>
//                 </label>

//                 <div className="flex items-center gap-2">
//                   <label className="text-xs text-gray-700 font-medium">Status</label>
//                   <select
//                     value={autoApprove ? "approved" : status}
//                     onChange={(e) => setStatus(e.target.value)}
//                     disabled={autoApprove}
//                     className="px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-green-400 min-w-[110px] disabled:opacity-60"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="approved">Approved</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Content Area — 2/3 + Variables sidebar */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                 {/* Left: Content Editor */}
//                 <div className="md:col-span-2 space-y-2">

//                   {/* Email: Tab switcher (Editor / Generate with AI) */}
//                   {isEmail && (
//                     <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
//                       <button
//                         type="button"
//                         onClick={() => setEmailTab("editor")}
//                         className={cx(
//                           "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
//                           emailTab === "editor" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
//                         )}
//                       >
//                         <Code2 className="w-3.5 h-3.5" /> Code Editor
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setEmailTab("ai")}
//                         className={cx(
//                           "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
//                           emailTab === "ai" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
//                         )}
//                       >
//                         <Wand2 className="w-3.5 h-3.5" /> Generate with AI
//                       </button>
//                     </div>
//                   )}

//                   {/* Email Code Editor tab */}
//                   {isEmail && emailTab === "editor" && (
//                     <>
//                       <div className="flex items-center justify-between">
//                         <label className="text-xs font-medium text-gray-700">HTML Content</label>
//                         <span className="text-[11px] text-gray-400">
//                           {CONTENT_LIMIT.toLocaleString()} limit •{" "}
//                           <span className={remaining < 200 ? "text-red-600 font-medium" : "text-gray-500"}>{remaining} left</span>
//                         </span>
//                       </div>
//                       <CodeEditor
//                         value={content}
//                         onChange={setContent}
//                         editorRef={codeEditorRef}
//                       />
//                     </>
//                   )}

//                   {/* Email AI tab */}
//                   {isEmail && emailTab === "ai" && (
//                     <div className="border-2 border-green-400 rounded-lg overflow-hidden">
//                       <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 border-b border-green-200">
//                         <p className="text-xs font-medium text-green-700 flex items-center gap-1">
//                           <Wand2 className="w-3.5 h-3.5" /> AI Template Generator
//                         </p>
//                         <p className="text-[10px] text-gray-500 mt-0.5">Generated content will appear in the Code Editor tab</p>
//                       </div>
//                       <div className="p-3">
//                         <TemplateContentAI
//                           formData={{ content, name, channel, category, priority }}
//                           setFormData={(updater: any) => {
//                             const next = typeof updater === "function"
//                               ? updater({ content, name, channel, category, priority })
//                               : updater;
//                             if (!next) return;
//                             if (typeof next.content !== "undefined") setContent(next.content);
//                             if (typeof next.name !== "undefined") setName(next.name);
//                             if (typeof next.category !== "undefined") setCategory(next.category);
//                             if (typeof next.priority !== "undefined") setPriority(next.priority);
//                           }}
//                           endpoint="/api/ai/generate-template"
//                         />
//                       </div>
//                     </div>
//                   )}

//                   {/* SMS / WhatsApp: plain textarea with AI inline */}
//                   {!isEmail && (
//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between">
//                         <label className="text-xs font-medium text-gray-700">
//                           Template Content <span className="text-red-500">*</span>
//                         </label>
//                         <span className="text-[11px] text-gray-400">
//                           {CONTENT_LIMIT.toLocaleString()} limit •{" "}
//                           <span className={remaining < 100 ? "text-red-600 font-medium" : "text-gray-500"}>{remaining} left</span>
//                         </span>
//                       </div>
//                       <div className="border-2 border-green-400 rounded-lg overflow-hidden">
//                         <TemplateContentAI
//                           formData={{ content, name, channel, category, priority }}
//                           setFormData={(updater: any) => {
//                             const next = typeof updater === "function"
//                               ? updater({ content, name, channel, category, priority })
//                               : updater;
//                             if (!next) return;
//                             if (typeof next.content !== "undefined") setContent(next.content);
//                             if (typeof next.name !== "undefined") setName(next.name);
//                             if (typeof next.category !== "undefined") setCategory(next.category);
//                             if (typeof next.priority !== "undefined") setPriority(next.priority);
//                           }}
//                           endpoint="/api/ai/generate-template"
//                         />
//                         {/* Hidden ref textarea for insertAtCursor */}
//                         <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)} className="hidden" aria-hidden />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Right: Variables Panel — hidden on mobile unless toggled */}
//                 <div className="md:col-span-1">
//                   {/* Mobile toggle */}
//                   <button
//                     type="button"
//                     onClick={() => setShowVarsMobile((s) => !s)}
//                     className="md:hidden w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 mb-2"
//                   >
//                     <span className="font-medium text-gray-700">Variables</span>
//                     <ChevronDown className={cx("w-4 h-4 transition-transform", showVarsMobile ? "rotate-180" : "")} />
//                   </button>

//                   <div className={cx("bg-gray-50 rounded-lg p-3 border-2 border-green-200", showVarsMobile ? "block" : "hidden md:block")}>
//                     <VariablesPanel channel={channel} onInsert={insertAtCursor} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Footer */}
//         <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
//           <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={saving || !name.trim() || !category || !content.trim()}
//               className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-xs font-medium"
//             >
//               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//               {initial ? "Update Template" : "Create Template"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/components/TemplateCenterModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Save,
  X,
  Copy,
  Check,
  Plus,
  Zap,
  Shield,
  ChevronDown,
  Wand2,
  SlidersHorizontal,
  Code2,
  Eye,
  Type,
} from "lucide-react";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import TemplateContentAI from "./TemplateContentAI";

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
type Channel = "sms" | "whatsapp" | "email";

type TemplateData = {
  id?: string | number;
  name: string;
  category: string;
  content: string;
  priority: string;
  autoApprove: boolean;
  status: string;
  channel: string;
  updatedAt?: string;
};

type CreateUpdateModalProps = {
  open: boolean;
  onClose?: () => void;
  onSubmit?: (data: TemplateData) => void;
  channel?: Channel | string;
  initial?: Partial<TemplateData> | null;
  title?: string;
};

/* ------------------------------------------------------------------ */
/* Variables by channel                                                 */
/* ------------------------------------------------------------------ */
const VARS_BY_CHANNEL: Record<string, { key: string; desc: string; cat: string }[]> = {
  sms: [
    { key: "{name}", desc: "Recipient name", cat: "Basic" },
    { key: "{otp}", desc: "One-time password", cat: "Security" },
    { key: "{order_id}", desc: "Order ID", cat: "Order" },
    { key: "{amount}", desc: "Amount", cat: "Order" },
    { key: "{store_name}", desc: "Store name", cat: "Business" },
    { key: "{date}", desc: "Date", cat: "Time" },
    { key: "{time}", desc: "Time", cat: "Time" },
  ],
  whatsapp: [
    { key: "{name}", desc: "Recipient name", cat: "Basic" },
    { key: "{order_id}", desc: "Order ID", cat: "Order" },
    { key: "{product_name}", desc: "Product name", cat: "Order" },
    { key: "{amount}", desc: "Amount", cat: "Order" },
    { key: "{cta_url}", desc: "CTA URL", cat: "Marketing" },
    { key: "{coupon_code}", desc: "Coupon code", cat: "Marketing" },
  ],
  email: [
    { key: "{name}", desc: "Recipient name", cat: "Basic" },
    { key: "{first_name}", desc: "First name", cat: "Basic" },
    { key: "{subject}", desc: "Subject line", cat: "Basic" },
    { key: "{invoice_id}", desc: "Invoice ID", cat: "Billing" },
    { key: "{amount}", desc: "Amount", cat: "Billing" },
    { key: "{unsubscribe_link}", desc: "Unsubscribe", cat: "Compliance" },
    { key: "{tenant_name}", desc: "Tenant name", cat: "Property" },
    { key: "{property_name}", desc: "Property name", cat: "Property" },
    { key: "{room_number}", desc: "Room number", cat: "Property" },
    { key: "{monthly_rent}", desc: "Monthly rent", cat: "Property" },
    { key: "{total_pending}", desc: "Total pending", cat: "Property" },
  ],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Variables Panel                                                      */
/* ------------------------------------------------------------------ */
function VariablesPanel({ channel, onInsert }: { channel: string; onInsert: (token: string) => void }) {
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState("");
  const [cat, setCat] = useState("All");
  const vars = VARS_BY_CHANNEL[channel] || VARS_BY_CHANNEL.sms;

  const categories = useMemo(() => ["All", ...Array.from(new Set(vars.map((v) => v.cat)))], [vars]);

  const filtered = useMemo(() => {
    let list = vars;
    if (cat !== "All") list = list.filter((v) => v.cat === cat);
    if (!filter) return list;
    const q = filter.toLowerCase();
    return list.filter((v) => v.key.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q));
  }, [vars, filter, cat]);

  const copyVar = async (key: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(key);
        setCopied(key);
        setTimeout(() => setCopied(""), 800);
      }
    } catch (_) {}
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-xs uppercase tracking-wide" style={{ color: MU }}>Variables</h4>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="px-2 py-1 text-xs border rounded-md bg-white focus:ring-1 focus:ring-orange-500"
          style={{ borderColor: BD }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search variables..."
        className="w-full px-2.5 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-orange-500"
        style={{ borderColor: BD }}
      />

      <div className="max-h-52 overflow-auto space-y-1 pr-0.5">
        {filtered.map((v) => (
          <div key={v.key} className="group flex items-center gap-2 p-2 rounded-lg border bg-white hover:bg-orange-50 transition-colors" style={{ borderColor: BD }}>
            <div className="flex-1 min-w-0">
              <code className="text-[11px] px-1.5 py-0.5 rounded font-mono" style={{ background: `${O}15`, color: O, border: `1px solid ${O}30` }}>{v.key}</code>
              <div className="text-[10px] truncate mt-0.5" style={{ color: MU }}>{v.desc}</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => copyVar(v.key)} className="p-1 rounded hover:bg-gray-200" title="Copy" type="button">
                {copied === v.key ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" style={{ color: MU }} />}
              </button>
              <button onClick={() => onInsert(v.key)} className="p-1 rounded hover:bg-orange-100" style={{ color: O }} title="Insert" type="button">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-[11px] py-3 text-center" style={{ color: MU }}>No variables match.</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Minimal HTML Code Editor (for email)                                 */
/* ------------------------------------------------------------------ */
function CodeEditor({
  value,
  onChange,
  onInsert,
  editorRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onInsert?: (ref: React.RefObject<HTMLTextAreaElement>) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");

  return (
    <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: O }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 gap-2" style={{ background: N }}>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <span className="text-[10px] font-mono flex items-center gap-1" style={{ color: BD }}>
          <Code2 className="w-3 h-3" /> HTML Editor
        </span>
        <div className="flex items-center rounded-md overflow-hidden border" style={{ background: `${O}20`, borderColor: BD }}>
          <button
            type="button"
            onClick={() => setViewMode("code")}
            className={cx("px-2 py-1 text-[10px] flex items-center gap-1 transition-colors", viewMode === "code" ? "text-white" : "")}
            style={viewMode === "code" ? { background: O } : { color: BD }}
          >
            <Code2 className="w-3 h-3" /> Code
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={cx("px-2 py-1 text-[10px] flex items-center gap-1 transition-colors", viewMode === "preview" ? "text-white" : "")}
            style={viewMode === "preview" ? { background: O } : { color: BD }}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
      </div>

      {viewMode === "code" ? (
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full font-mono text-xs px-4 py-3 min-h-[200px] resize-y focus:outline-none focus:ring-0 border-0 leading-relaxed"
          style={{ background: N, color: "#a5f3c3" }}
          placeholder={`<div style="font-family: Arial, sans-serif;">\n  <h1>Hello {name}!</h1>\n  <p>Your order {order_id} is ready.</p>\n</div>`}
          spellCheck={false}
        />
      ) : (
        <div
          className="min-h-[200px] bg-white p-4 text-sm overflow-auto"
          dangerouslySetInnerHTML={{ __html: value || "<p class='text-gray-400 text-xs'>Nothing to preview yet...</p>" }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Modal                                                           */
/* ------------------------------------------------------------------ */
export default function TemplateCenterModal({
  open,
  onClose,
  onSubmit,
  channel = "sms",
  initial = null,
  title,
}: CreateUpdateModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [autoApprove, setAutoApprove] = useState(false);
  const [status, setStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [showVarsMobile, setShowVarsMobile] = useState(false);
  const [emailTab, setEmailTab] = useState<"editor" | "ai">("editor");
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement | null>(null);

  const isEmail = channel === "email";

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(["common"]);
        setMasters(data);
      } catch (err) {
        console.error("Error fetching master options:", err);
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, []);

  const categoryOptions: MasterOption[] = useMemo(() => {
    const opts = (masters?.common?.category ?? masters?.category) as MasterOption[] | undefined;
    return opts ?? [];
  }, [masters]);

  const CONTENT_LIMIT = useMemo(() => (channel === "sms" ? 1000 : channel === "whatsapp" ? 2000 : 5000), [channel]);
  const remaining = CONTENT_LIMIT - content.length;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name ?? "");
      setCategory(initial.category ?? "");
      setContent(initial.content ?? "");
      setPriority(initial.priority ?? "Normal");
      setAutoApprove(Boolean(initial.autoApprove));
      setStatus(initial.status ?? (initial.autoApprove ? "approved" : "pending"));
    } else {
      setName("");
      setCategory("");
      setContent("");
      setPriority("Normal");
      setAutoApprove(false);
      setStatus("pending");
    }
    setEmailTab("editor");
  }, [open, initial]);

  useEffect(() => {
    if (!masterLoading && initial?.category) {
      const list = categoryOptions || [];
      const exists = list.some((o) => o.value === initial.category);
      if (!exists) {
        setMasters((prev) => ({
          ...prev,
          common: {
            ...(prev.common || {}),
            category: [{ value: initial.category, label: initial.category }, ...(prev.common?.category || [])],
          },
        }));
      }
    }
  }, [masterLoading, initial, categoryOptions.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const insertAtCursor = (token: string) => {
    const el = isEmail ? codeEditorRef.current : contentRef.current;
    if (!el) {
      setContent((prev) => prev + token);
      return;
    }
    const start = typeof el.selectionStart === "number" ? el.selectionStart : content.length;
    const end = typeof el.selectionEnd === "number" ? el.selectionEnd : content.length;
    const newContent = content.slice(0, start) + token + content.slice(end);
    setContent(newContent);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      try { el.setSelectionRange(pos, pos); } catch {}
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!name.trim() || !category || !content.trim()) return;
    setSaving(true);
    setTimeout(() => {
      const next: TemplateData = {
        id: initial?.id,
        name: name.trim(),
        category,
        content,
        priority,
        autoApprove,
        status: autoApprove ? "approved" : status,
        channel,
        updatedAt: new Date().toISOString(),
      };
      onSubmit?.(next);
      setSaving(false);
      onClose?.();
    }, 250);
  };

  if (!open) return null;

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ border: `1px solid ${BD}`, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — ESALE theme */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 flex-shrink-0" style={{ background: N }}>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm md:text-base truncate">
              {title || (initial ? "Edit Template" : "Create Template")}
            </h3>
            <p className="text-[9px] capitalize" style={{ color: `${BD}cc` }}>{channel} Template</p>
          </div>
          <div className="flex items-center gap-2">
            {autoApprove ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ background: `${O}20`, color: O }}>
                <Shield className="w-3 h-3" /> Auto-approve ON
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full" style={{ background: `${MU}20`, color: MU }}>
                <Zap className="w-3 h-3" /> Manual review
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white" type="button">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto" style={{ background: BG }}>
          <form onSubmit={handleSubmit}>
            <div className="p-3 sm:p-4 space-y-3">

              {/* Row 1: Name + Category + Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: MU }}>
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg h-8 px-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    style={{ borderColor: BD }}
                    placeholder="Enter template name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: MU }}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-lg h-8 px-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    style={{ borderColor: BD }}
                    required
                    disabled={masterLoading || categoryOptions.length === 0}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label ?? opt.value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: MU }}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border rounded-lg h-8 px-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    style={{ borderColor: BD }}
                  >
                    <option>Normal</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Auto-approve + Status */}
              <div className="flex flex-wrap items-center gap-4 pb-1 border-b" style={{ borderColor: BD }}>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                  />
                  <span className="relative w-8 h-4 rounded-full transition" style={{ background: autoApprove ? O : BD }}>
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${autoApprove ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                  <span className="text-xs font-medium" style={{ color: N }}>Auto-approve</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-medium" style={{ color: MU }}>Status</label>
                  <select
                    value={autoApprove ? "approved" : status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={autoApprove}
                    className="px-3 py-1 text-xs border rounded-md bg-white focus:ring-1 focus:ring-orange-500 min-w-[110px] disabled:opacity-60"
                    style={{ borderColor: BD }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Content Area — 2/3 + Variables sidebar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Left: Content Editor */}
                <div className="md:col-span-2 space-y-2">

                  {/* Email: Tab switcher (Editor / Generate with AI) */}
                  {isEmail && (
                    <div className="flex items-center gap-1 rounded-lg p-1 w-fit" style={{ background: BD }}>
                      <button
                        type="button"
                        onClick={() => setEmailTab("editor")}
                        className={cx(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          emailTab === "editor" ? "bg-white shadow-sm" : ""
                        )}
                        style={emailTab === "editor" ? { color: O } : { color: MU }}
                      >
                        <Code2 className="w-3.5 h-3.5" /> Code Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmailTab("ai")}
                        className={cx(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          emailTab === "ai" ? "bg-white shadow-sm" : ""
                        )}
                        style={emailTab === "ai" ? { color: O } : { color: MU }}
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Generate with AI
                      </button>
                    </div>
                  )}

                  {/* Email Code Editor tab */}
                  {isEmail && emailTab === "editor" && (
                    <>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MU }}>HTML Content</label>
                        <span className="text-[10px]" style={{ color: MU }}>
                          {CONTENT_LIMIT.toLocaleString()} limit •{" "}
                          <span className={remaining < 200 ? "text-red-600 font-medium" : ""} style={remaining < 200 ? { color: "#ef4444" } : {}}>{remaining} left</span>
                        </span>
                      </div>
                      <CodeEditor
                        value={content}
                        onChange={setContent}
                        editorRef={codeEditorRef}
                      />
                    </>
                  )}

                  {/* Email AI tab */}
                  {isEmail && emailTab === "ai" && (
                    <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: O }}>
                      <div className="px-3 py-2 border-b" style={{ background: `${O}10`, borderColor: BD }}>
                        <p className="text-xs font-medium flex items-center gap-1" style={{ color: O }}>
                          <Wand2 className="w-3.5 h-3.5" /> AI Template Generator
                        </p>
                        <p className="text-[9px] mt-0.5" style={{ color: MU }}>Generated content will appear in the Code Editor tab</p>
                      </div>
                      <div className="p-3">
                        <TemplateContentAI
                          formData={{ content, name, channel, category, priority }}
                          setFormData={(updater: any) => {
                            const next = typeof updater === "function"
                              ? updater({ content, name, channel, category, priority })
                              : updater;
                            if (!next) return;
                            if (typeof next.content !== "undefined") setContent(next.content);
                            if (typeof next.name !== "undefined") setName(next.name);
                            if (typeof next.category !== "undefined") setCategory(next.category);
                            if (typeof next.priority !== "undefined") setPriority(next.priority);
                          }}
                          endpoint="/api/ai/generate-template"
                        />
                      </div>
                    </div>
                  )}

                  {/* SMS / WhatsApp: plain textarea with AI inline */}
                  {!isEmail && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
                          Template Content <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px]" style={{ color: MU }}>
                          {CONTENT_LIMIT.toLocaleString()} limit •{" "}
                          <span className={remaining < 100 ? "text-red-600 font-medium" : ""} style={remaining < 100 ? { color: "#ef4444" } : {}}>{remaining} left</span>
                        </span>
                      </div>
                      <div className="border-2 rounded-lg overflow-hidden" style={{ borderColor: O }}>
                        <TemplateContentAI
                          formData={{ content, name, channel, category, priority }}
                          setFormData={(updater: any) => {
                            const next = typeof updater === "function"
                              ? updater({ content, name, channel, category, priority })
                              : updater;
                            if (!next) return;
                            if (typeof next.content !== "undefined") setContent(next.content);
                            if (typeof next.name !== "undefined") setName(next.name);
                            if (typeof next.category !== "undefined") setCategory(next.category);
                            if (typeof next.priority !== "undefined") setPriority(next.priority);
                          }}
                          endpoint="/api/ai/generate-template"
                        />
                        {/* Hidden ref textarea for insertAtCursor */}
                        <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)} className="hidden" aria-hidden />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Variables Panel — hidden on mobile unless toggled */}
                <div className="md:col-span-1">
                  {/* Mobile toggle */}
                  <button
                    type="button"
                    onClick={() => setShowVarsMobile((s) => !s)}
                    className="md:hidden w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border mb-2"
                    style={{ borderColor: BD, background: BG }}
                  >
                    <span className="font-medium" style={{ color: MU }}>Variables</span>
                    <ChevronDown className={cx("w-4 h-4 transition-transform", showVarsMobile ? "rotate-180" : "")} />
                  </button>

                  <div className={cx("rounded-lg p-3 border-2", showVarsMobile ? "block" : "hidden md:block")} style={{ background: BG, borderColor: O }}>
                    <VariablesPanel channel={channel} onInsert={insertAtCursor} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center">
            <span className="text-[8px]" style={{ color: MU }}>Fields marked with * are required</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50"
              style={{ border: `1px solid ${BD}`, color: N }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !name.trim() || !category || !content.trim()}
              className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
              style={{ background: O }}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              {initial ? "Update Template" : "Create Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}