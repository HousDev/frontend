// import React, { useState, useMemo, useEffect, useCallback } from 'react';
// import {
//   ArrowLeft,
//   Phone,
//   MessageCircle,
//   Mail,
//   Edit,
//   Share,
//   Eye,
//   User as UserIcon,
//   MapPin,
//   Calendar as CalendarIcon,
//   Star,
//   Building,
//   Activity,
//   FileText,
//   Users,
//   BarChart3,
//   Target,
//   TrendingUp,
//   Plus,
//   CheckCircle,
//   Clock,
//   Send,
//   Shield,
//   Award,
//   Camera,
//   ChevronRight,
//   Calendar,
//   CheckCircle2,
//   AlertCircle,
//   Pencil,
//   Trash2,
//   Tag,
//   User,
//   Layers,
//   Play,
//   Flag
// } from 'lucide-react';

// import SellerStageUpdateModal from './SellerStageUpdateModal';
// import SellerSharingModal from './SellerSharingModal';
// import ActivityModal from '../buyers/ActivityModal';
// import VisitModal from '../buyers/VisitModal';
// import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';
// import { sellerFollowupAPI } from '@/lib/sellerFollowupAPI';
// import SellerFollowupModal, { SellerFollowupPayload } from './SellerFollowupModal';

// /* ------------------------------------------------------------------ */
// /* Types                                                              */
// /* ------------------------------------------------------------------ */
// export type AnyObj = Record<string, any>;

// /** 🔄 MERGED Followup type (supports seller snake_case + buyer camelCase) */
// export type Followup = {
//   // base (existing)
//   id: string | number;
//   seller_id?: string | number;
//   followup_date?: string;              // "YYYY-MM-DD"
//   followup_time?: string;              // "HH:mm:ss" or "HH:mm"
//   followup_type?: string;
//   status?: string | null;
//   priority?: string | null;
//   assigned_to?: string | number | null;
//   reminder?: number | 0;
//   notes?: string | null;
//   created_at?: string | null;
//   updated_at?: string | null;
//   created_by?: string | number | null;
//   updated_by?: string | number | null;
//   next_action?: string | null;
//   outcome?: string | null;
//   transferred_from_lead?: boolean | 0 | 1 | '0' | '1';
//   category?: 'sales' | 'presales';

//   // buyer-style (camelCase) — also supported in seller UI
//   description?: string | null;
//   date?: string | null;
//   time?: string | null;
//   assignedTo?: string | null;               // UI display (will become name)
//   type?: string | null;
//   remark?: string | null;
//   reminderBool?: boolean | null;
//   raw?: any;
//   transferredFromLead?: boolean | 0 | 1 | '0' | '1';

//   buyerLeadStage?: string | null;           // (seller stage label in UI)
//   buyerLeadStatus?: string | null;          // (seller status label in UI)
//   customRemark?: string | null;
//   followupType?: string | null;
//   nextAction?: string | null;
//   scheduleDate?: string | null;             // may be ISO datetime from API
//   scheduleTime?: string | null;             // "HH:mm:ss" optional
//   transferredAt?: string | null;

//   createdAt?: string | null;                // may be ISO
//   updatedAt?: string | null;                // may be ISO
//   createdBy?: string | null;                // UI display (name)
//   updatedBy?: string | null;                // UI display (name)

//   /* ⭐ Prefer names from backend */
//   createdByName?: string | null;
//   updatedByName?: string | null;
//   assignedExecutiveName?: string | null;

//   /* Also allow your new camelCase ids straight from API */
//   sellerId?: string | number | null;
//   assignedExecutive?: string | number | null;
//   completedDate?: string | null;
// };

// /* ------------------------------------------------------------------ */
// /* Utils                                                              */
// /* ------------------------------------------------------------------ */
// const safeString = (v: any) => (v === undefined || v === null ? '' : String(v));
// const toSlug = (s?: string | null) => safeString(s).toLowerCase().replace(/\s+/g, '').trim();

// function parseSqlish(val?: string | null): Date | null {
//   if (!val) return null;
//   const s = val.trim();

//   // ISO-like `YYYY-MM-DDTHH:mm:ss.sssZ` (or without Z)
//   if (/\d{4}-\d{2}-\d{2}T/.test(s)) {
//     const d = new Date(s);
//     return isNaN(d.getTime()) ? null : d;
//   }
//   // "YYYY-MM-DD HH:mm[:ss]"
//   if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(s)) {
//     const [datePart, timePart] = s.split(/\s+/);
//     const [y, m, d] = datePart.split('-').map(Number);
//     const [hh, mm, ssRaw] = timePart.split(':').map(Number);
//     const ss = Number.isFinite(ssRaw) ? ssRaw : 0;
//     return new Date(y, m - 1, d, hh, mm, ss);
//   }
//   // "YYYY-MM-DD"
//   if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
//     const [y, m, d] = s.split('-').map(Number);
//     return new Date(y, m - 1, d, 0, 0, 0);
//   }
//   // "HH:mm[:ss]" (time only) — normalize with today (local)
//   if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
//     const [hh, mm, ssRaw] = s.split(':').map(Number);
//     const now = new Date();
//     return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, Number.isFinite(ssRaw) ? ssRaw : 0);
//   }

//   const d = new Date(s);
//   return isNaN(d.getTime()) ? null : d;
// }

// function to12h(hh: number, mm: number) {
//   const period = hh >= 12 ? 'pm' : 'am';
//   const h12 = hh % 12 || 12;
//   const mmStr = String(mm).padStart(2, '0');
//   return `${h12}:${mmStr} ${period}`;
// }

// function fmtDateDDMMYYYY(d: Date): string {
//   const dd = String(d.getDate()).padStart(2, '0');
//   const mm = String(d.getMonth() + 1).padStart(2, '0');
//   const yyyy = d.getFullYear();
//   return `${dd}/${mm}/${yyyy}`;
// }

// /** Formats:
//  * - date only -> dd/mm/yyyy
//  * - date + time -> dd/mm/yyyy, h:mm am/pm
//  */
// function fmtDateTimeHuman(val?: string | null): string | null {
//   const d = parseSqlish(val);
//   if (!d) return null;

//   const hasTime =
//     /T\d{2}:\d{2}/.test(val || '') ||
//     /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(val || '');

//   const dateStr = fmtDateDDMMYYYY(d);
//   if (!hasTime) return dateStr;

//   return `${dateStr}, ${to12h(d.getHours(), d.getMinutes())}`;
// }

// /** Accepts "HH:mm[:ss]" and returns 12h */
// function fmtTime12h(t?: string | null): string {
//   if (!t) return '—';
//   const m = t.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
//   if (!m) return t;
//   const hh = Number(m[1]);
//   const mm = Number(m[2]);
//   if (!Number.isFinite(hh) || !Number.isFinite(mm)) return t;
//   return to12h(hh, mm);
// }

// /* ------------------------------------------------------------------ */
// /* UI Configs                                                         */
// /* ------------------------------------------------------------------ */
// const getStatusConfig = () => ({
//   pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pending', icon: '⏳' },
//   scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled', icon: '📅' },
//   completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: '✅' },
//   cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: '❌' },
//   inprogress: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress', icon: '🔄' },
//   onhold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'On Hold', icon: '⏸️' },
//   followup: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Follow Up', icon: '📞' },
//   interested: { bg: 'bg-green-100', text: 'text-green-700', label: 'Interested', icon: '👍' },
//   notinterested: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Interested', icon: '👎' },
//   contacted: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Contacted', icon: '📧' },
//   meeting: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Meeting', icon: '🤝' },
//   proposal: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Proposal', icon: '📋' },
//   negotiation: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Negotiation', icon: '💼' },
//   closed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Closed', icon: '🔐' },

//   // legacy mapping (Done/Planned/Missed)
//   done: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done', icon: '✅' },
//   planned: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Planned', icon: '📅' },
//   missed: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Missed', icon: '⚠️' },
// });

// const getPriorityConfig = () => ({
//   urgent: { border: 'border-l-red-600', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
//   high: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
//   medium: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
//   normal: { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
//   low: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
//   minimal: { border: 'border-l-gray-400', bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100' },

//   // legacy mapping (High/Medium/Low)
//   high_legacy: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
//   medium_legacy: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
//   low_legacy: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
// });

// /** SELLER wording */
// const getFieldConfig = () => ({
//   buyerLeadStage: { label: 'Seller Stage', icon: Layers, color: 'bg-indigo-100 text-indigo-700', priority: 1 },
//   buyerLeadStatus: { label: 'Seller Status', icon: TrendingUp, color: 'bg-blue-100 text-blue-700', priority: 2 },
//   followupType: { label: 'Follow-up Type', icon: Tag, color: 'bg-purple-100 text-purple-700', priority: 3 },
//   customRemark: { label: 'Remarks', icon: AlertCircle, color: 'bg-pink-100 text-pink-700', priority: 5 },
//   nextAction: { label: 'Next Action', icon: Play, color: 'bg-yellow-100 text-yellow-700', priority: 4 },
//   scheduleDate: { label: 'Scheduled', icon: CalendarIcon, color: 'bg-green-100 text-green-700', priority: 6 },
//   transferredAt: { label: 'Transferred', icon: CheckCircle2, color: 'bg-orange-100 text-orange-700', priority: 7 },
//   assignedTo: { label: 'Assigned Executive', icon: UserIcon, color: 'bg-teal-100 text-teal-700', priority: 8 },
//   type: { label: 'Type', icon: Clock, color: 'bg-gray-100 text-gray-700', priority: 9 },
//   priority: { label: 'Priority', icon: Flag, color: 'bg-gray-100 text-gray-700', priority: 11 },
//   createdAt: { label: 'Created', icon: CalendarIcon, color: 'bg-gray-50 text-gray-700', priority: 90 },
//   updatedAt: { label: 'Updated', icon: CalendarIcon, color: 'bg-gray-50 text-gray-700', priority: 91 },
//   createdBy: { label: 'Created By', icon: UserIcon, color: 'bg-gray-50 text-gray-700', priority: 92 },
//   updatedBy: { label: 'Updated By', icon: UserIcon, color: 'bg-gray-50 text-gray-700', priority: 93 },
// });

// /* ------------------------------------------------------------------ */
// /* Small UI bits                                                      */
// /* ------------------------------------------------------------------ */
// const typeIcon = (t?: string | null) => {
//   switch (t) {
//     case 'Phone Call':
//       return <Phone size={14} className="text-blue-600" />;
//     case 'WhatsApp':
//       return <MessageCircle size={14} className="text-green-600" />;
//     case 'Email':
//       return <Mail size={14} className="text-indigo-600" />;
//     default:
//       return <Tag size={14} className="text-gray-500" />;
//   }
// };

// const statusBadge = (s?: string | null) => {
//   const cfg = getStatusConfig();
//   const slug = toSlug(s);
//   const meta = (cfg as any)[slug] || (cfg as any)['planned'];
//   const label = meta?.label || (s ?? '—');
//   const classes = meta ? `${meta.bg} ${meta.text}` : 'bg-gray-100 text-gray-700';
//   return (
//     <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${classes}`}>
//       <span>{meta?.icon ?? '•'}</span>
//       {label}
//     </span>
//   );
// };

// const priorityBadge = (p?: string | null) => {
//   const cfg = getPriorityConfig();
//   const slug = toSlug(p);
//   const meta =
//     (cfg as any)[slug] ||
//     (slug === 'high' && (cfg as any).high_legacy) ||
//     (slug === 'medium' && (cfg as any).medium_legacy) ||
//     (slug === 'low' && (cfg as any).low_legacy);
//   const text = p ?? '—';
//   const classes = meta ? `${meta.badge} ${meta.text}` : 'bg-gray-100 text-gray-700';
//   return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>{text}</span>;
// };

// /* ------------------------------------------------------------------ */
// /* Normalizer (⭐ make NAMES show instead of IDs)                      */
// /* ------------------------------------------------------------------ */
// const truthyFlag = (v: any) =>
//   v === true || v === 1 || v === '1' || v === 'true' || v === 'yes';

// const pickDisplay = (name?: any, idMaybe?: any, fallback?: any) => {
//   const n = name ?? null;
//   if (n !== null && n !== undefined && String(n).trim() !== '') return String(n);
//   const id = idMaybe ?? fallback;
//   return id != null ? String(id) : null;
// };

// const normalize = (f: Followup) => {
//   const isPreSales =
//     truthyFlag(f.transferred_from_lead) || truthyFlag(f.transferredFromLead);

//   // Prefer unified/camel first
//   const type = f.followupType || f.followup_type || f.type || null;

//   // Prefer scheduleDate from backend (can be ISO datetime)
//   const scheduleDate =
//     f.scheduleDate ??
//     (f as any).schedule_date ??
//     f.followup_date ??
//     f.date ??
//     null;

//   const scheduleTime =
//     f.scheduleTime ??
//     (f as any).schedule_time ??
//     f.followup_time ??
//     f.time ??
//     null;

//   // ⭐ Prefer backend-provided display names; fallback to IDs or existing camel
//   const createdByDisplay = pickDisplay(
//     f.createdByName,
//     f.created_by,
//     f.createdBy
//   );

//   const updatedByDisplay = pickDisplay(
//     f.updatedByName,
//     f.updated_by,
//     f.updatedBy
//   );

//   // assignedExecutiveName > assigned_to > assignedExecutive > assignedTo
//   const assignedToDisplay = pickDisplay(
//     f.assignedExecutiveName,
//     f.assigned_to,
//     f.assignedExecutive ?? f.assignedTo
//   );

//   const remarks = f.customRemark ?? f.remark ?? f.notes ?? null;

//   return {
//     ...f,
//     id: String(f.id),
//     category: isPreSales ? 'presales' : 'sales',

//     // unified fields for UI
//     followupType: type ?? null,
//     scheduleDate: scheduleDate ?? null,
//     scheduleTime: scheduleTime ?? null,

//     // ⭐ set display strings to NAMES (not numeric IDs)
//     assignedTo: assignedToDisplay ?? null,
//     createdBy: createdByDisplay ?? null,
//     updatedBy: updatedByDisplay ?? null,

//     customRemark: remarks,

//     createdAt: f.createdAt ?? f.created_at ?? null,
//     updatedAt: f.updatedAt ?? f.updated_at ?? null,

//     nextAction: f.nextAction ?? f.next_action ?? null,
//     transferredAt: f.transferredAt ?? null,
//   } as Followup;
// };

// /* ------------------------------------------------------------------ */
// /* Sorting: latest first                                              */
// /* ------------------------------------------------------------------ */
// const toDateTime = (dateStr?: string | null, timeStr?: string | null) => {
//   if (!dateStr && !timeStr) return null;

//   const dStr = (dateStr ?? '').trim();
//   if (dStr && /\d{4}-\d{2}-\d{2}T/.test(dStr)) {
//     return parseSqlish(dStr);
//   }

//   const tRaw = (timeStr ?? '').trim();
//   const t = tRaw ? (tRaw.length === 5 ? `${tRaw}:00` : tRaw) : '00:00:00';
//   const dtStr = dStr ? `${dStr} ${t}` : t;
//   return parseSqlish(dtStr);
// };

// const followupTimestamp = (f: Followup): number => {
//   const dt1 = toDateTime(
//     f.followup_date || f.date || null,
//     f.followup_time || f.time || null
//   );
//   if (dt1) return dt1.getTime();

//   const dt2 = toDateTime(
//     (f as any).schedule_date || f.scheduleDate || null,
//     (f as any).schedule_time || f.scheduleTime || null
//   );
//   if (dt2) return dt2.getTime();

//   const upd = parseSqlish(f.updatedAt || f.updated_at || null);
//   if (upd) return upd.getTime();
//   const cre = parseSqlish(f.createdAt || f.created_at || null);
//   if (cre) return cre.getTime();

//   return 0;
// };

// /* ------------------------------------------------------------------ */
// /* Chips for seller fields                                            */
// /* ------------------------------------------------------------------ */
// const FieldChips: React.FC<{ f: Followup }> = ({ f }) => {
//   const cfg = getFieldConfig();
//   type Key = keyof ReturnType<typeof getFieldConfig>;
//   const keys: Key[] = Object.keys(cfg) as Key[];

//   const sorted = keys.sort((a, b) => cfg[a].priority - cfg[b].priority);

//   const chips = sorted
//     .map((k) => {
//       let value: any = (f as any)[k];

//       if (k === 'scheduleDate' && value) {
//         const d = parseSqlish(value);
//         value = d ? fmtDateDDMMYYYY(d) : value; // show only date
//       }
//       if ((k === 'createdAt' || k === 'updatedAt' || k === 'transferredAt') && value) {
//         value = fmtDateTimeHuman(value);
//       }

//       if (!value || String(value).trim() === '') return null;
//       const Icon = cfg[k].icon;
//       return (
//         <span
//           key={k}
//           className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${cfg[k].color}`}
//           title={cfg[k].label}
//         >
//           <Icon size={12} />
//           <span>{cfg[k].label}:</span>
//           <span className="font-semibold break-words">{String(value)}</span>
//         </span>
//       );
//     })
//     .filter(Boolean);

//   if (chips.length === 0) return null;
//   return <div className="mt-2 grid grid-cols-2 gap-2">{chips}</div>;
// };

// /* ------------------------------------------------------------------ */
// /* Component                                                          */
// /* ------------------------------------------------------------------ */
// interface SellerFollowupsTabProps {
//   followups: Followup[];
//   onAddFollowup: () => void;
//   onEditFollowup: (f: Followup) => void;
//   onDeleteFollowup: (f: Followup) => void;
// }

// const SellerFollowupsTab: React.FC<SellerFollowupsTabProps> = ({
//   followups,
//   onAddFollowup,
//   onEditFollowup,
//   onDeleteFollowup,
// }) => {
//   const [activeTab, setActiveTab] = React.useState<'sales' | 'presales'>('sales');

//   React.useEffect(() => {
    
//   }, [followups]);

//   const normalizedFollowups = React.useMemo(
//     () => (followups || []).map(normalize),
//     [followups]
//   );

//   React.useEffect(() => {
   
//   }, [normalizedFollowups]);

//   const sortedFollowups = React.useMemo(
//     () => [...normalizedFollowups].sort((a, b) => followupTimestamp(b) - followupTimestamp(a)),
//     [normalizedFollowups]
//   );

//   const salesCount = sortedFollowups.filter((f) => f.category === 'sales').length;
//   const presalesCount = sortedFollowups.filter((f) => f.category === 'presales').length;

//   const filteredFollowups = sortedFollowups.filter((f) => f.category === activeTab);

//   React.useEffect(() => {
   
//   }, [activeTab, filteredFollowups]);

//   const cardBorder = (p?: string | null) => {
//     const cfg = getPriorityConfig();
//     const slug = toSlug(p);
//     const meta =
//       (cfg as any)[slug] ||
//       (slug === 'high' && (cfg as any).high_legacy) ||
//       (slug === 'medium' && (cfg as any).medium_legacy) ||
//       (slug === 'low' && (cfg as any).low_legacy) ||
//       null;
//     return meta ? `${meta.border} ${meta.bg}` : 'border-l-gray-400 bg-gray-50';
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={() => setActiveTab('sales')}
//             className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
//               activeTab === 'sales' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Seller Follow-ups {salesCount > 0 && `(${salesCount})`}
//           </button>
//           <button
//             onClick={() => setActiveTab('presales')}
//             className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
//               activeTab === 'presales' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Pre-Sales (Seller History) {presalesCount > 0 && `(${presalesCount})`}
//           </button>
//         </div>

//         <button
//           onClick={onAddFollowup}
//           className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus size={16} />
//           <span>Add Seller Follow-up</span>
//         </button>
//       </div>

//       {filteredFollowups.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           {filteredFollowups.map((f, i) => {
//             const idKey = (f.id ?? `f-${i}-${toSlug(f.followupType || f.type || 'followup')}`).toString();
//             return (
//               <div key={idKey} className="h-full">
//                 <div
//                   className={`h-full bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow border-l-4 ${cardBorder(f.priority ?? undefined)}`}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div className="p-2 bg-gray-100 rounded-lg">
//                       {typeIcon(f.followupType || f.followup_type || f.type || undefined)}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       {/* title + status/priority */}
//                       <div className="flex flex-wrap items-center gap-2">
//                         {f.category === 'presales' && (
//                           <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 font-medium">
//                             Pre-Sales History
//                           </span>
//                         )}
//                         {f.category === 'sales' && (
//                           <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 font-medium">
//                             Sales History
//                           </span>
//                         )}
//                         {statusBadge(f.status ?? undefined)}
//                         {priorityBadge(f.priority ?? undefined)}
//                       </div>

//                       {/* SELLER chips */}
//                       <FieldChips f={f} />

//                       {/* Optional: human time under chips */}
//                       {f.scheduleDate && (
//                         <div className="mt-2 text-xs text-gray-600">
//                           <span className="font-medium">When:</span>{' '}
//                           {fmtDateTimeHuman(f.scheduleDate) || fmtDateDDMMYYYY(parseSqlish(f.scheduleDate) as Date)}
//                           {f.scheduleTime ? ` • ${fmtTime12h(f.scheduleTime)}` : ''}
//                         </div>
//                       )}
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-start gap-2">
//                       <button
//                         onClick={() => onEditFollowup(f)}
//                         disabled={f.category === 'presales'}
//                         className="p-2 rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
//                         title={f.category === 'presales' ? 'Pre-sales history cannot be edited' : 'Edit seller follow-up'}
//                       >
//                         <Pencil size={16} />
//                       </button>
//                       <button
//                         onClick={() => onDeleteFollowup(f)}
//                         disabled={f.category === 'presales'}
//                         className="p-2 rounded hover:bg-rose-50 text-rose-600 disabled:text-gray-300 disabled:cursor-not-allowed"
//                         title={f.category === 'presales' ? 'Pre-sales history cannot be deleted' : 'Delete seller follow-up'}
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//           <CalendarIcon className="mx-auto text-gray-300 mb-4" size={48} />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">
//             No {activeTab === 'sales' ? 'Seller' : 'Pre-Sales (Seller)'} follow-ups yet
//           </h3>
//           <p className="text-gray-500 mb-4">
//             {activeTab === 'sales'
//               ? 'Plan your first seller follow-up for this seller'
//               : 'This section shows seller follow-ups transferred from the lead stage.'}
//           </p>
//           {activeTab === 'sales' && (
//             <button
//               onClick={onAddFollowup}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Add Seller Follow-up
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ------------------------------------------------------------------ */
// /* SellerViewPage                                                     */
// /* ------------------------------------------------------------------ */
// export interface SellerViewPageProps {
//   seller?: AnyObj;
//   onBack?: () => void;
//   onEdit?: (seller?: AnyObj) => void;
//   onAccount?: (sellerId?: string | number) => void;
//   onNext?: () => void;
//   onPrevious?: () => void;
//   currentIndex?: number;
//   totalSellers?: number;
//   onUpdateSeller?: (s: AnyObj) => void;
//   sellerId?: string | number;
// }

// const SellerViewPage: React.FC<SellerViewPageProps> = ({
//   seller = {},
//   onBack = () => { },
//   onEdit = (..._args: any[]) => { },
//   onAccount = (..._args: any[]) => { },
//   onNext = () => { },
//   onPrevious = () => { },
//   currentIndex = 0,
//   totalSellers = 1,
//   onUpdateSeller = () => { },
//   sellerId,
// }) => {
//   const [activeTab, setActiveTab] = useState<string>('overview');
//   const [showStageUpdateModal, setShowStageUpdateModal] = useState(false);
//   const [showSharingModal, setShowSharingModal] = useState(false);
//   const [showActivityModal, setShowActivityModal] = useState(false);
//   const [showVisitModal, setShowVisitModal] = useState(false);
//   const [showPropertyForm, setShowPropertyForm] = useState(false);
//   const [editingActivity, setEditingActivity] = useState<any>(null);
//   const [editingProperty, setEditingProperty] = useState<any>(null);

//   const [showFollowupModal, setShowFollowupModal] = useState(false);
//   const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);

//   const [fuLoading, setFuLoading] = useState(false);
//   const [fuError, setFuError] = useState<string | null>(null);

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: UserIcon, count: null },
//     { id: 'details', label: 'Details', icon: FileText, count: null },
//     { id: 'buyers', label: 'Buyers', icon: Users, count: (seller as any).interestedBuyers || 0 },
//     { id: 'activities', label: 'Activities', icon: Activity, count: (seller as any).activities?.length || 0 },
//     { id: 'followups', label: 'Follow-ups', icon: CalendarIcon, count: ((seller as any).followups as Followup[] | undefined)?.length || 0 },
//     { id: 'documents', label: 'Documents', icon: FileText, count: (seller as any).documents?.length || 0 },
//     { id: 'visits', label: 'Visits', icon: Eye, count: (seller as any).visits || 0 },
//     { id: 'deal', label: 'Deal', icon: Target, count: null },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null }
//   ];

//   const sellerStages = [
//     { id: 'initial_contact', label: 'Initial Contact', progress: 10, color: 'blue' },
//     { id: 'property_collection', label: 'Property Collection', progress: 25, color: 'purple' },
//     { id: 'mandate_discussion', label: 'Mandate Discussion', progress: 40, color: 'orange' },
//     { id: 'mandate_signed', label: 'Mandate Signed', progress: 60, color: 'green' },
//     { id: 'selling_process', label: 'Selling Process', progress: 75, color: 'indigo' },
//     { id: 'deal_negotiation', label: 'Deal Negotiation', progress: 85, color: 'yellow' },
//     { id: 'deal_closure', label: 'Deal Closure', progress: 95, color: 'pink' },
//     { id: 'completed', label: 'Completed', progress: 100, color: 'emerald' }
//   ];

//   const currentStage = sellerStages.find(stage => stage.id === (seller as any).stage) || sellerStages[0];

//   // ----------------------- API: helpers & mapping -----------------------
//   const sellerIdVal: string | number | undefined =
//     sellerId ?? (seller as any)?.id ?? (seller as any)?.sellerId ?? undefined;

//   const ensureTime = (t?: string) => {
//     if (!t) return undefined;
//     const [hh = '00', mm = '00', ss = '00'] = t.split(':');
//     return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
//     };

//   // Map API row (supports snake_case or camelCase) -> Followup item for UI
//   const normalizeFromApi = (row: any): Followup => {
//     const id = row?.id ?? row?.followup_id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//     const followupType = row?.followup_type ?? row?.followupType;
//     const sellerLeadStatus = row?.seller_lead_status ?? row?.sellerLeadStatus ?? row?.status;

//     // ⭐ Capture name fields from backend when present
//    // ⭐ capture *all* possible name keys
// const createdByName = row?.created_by_name ?? row?.createdByName ?? null;
// const updatedByName = row?.updated_by_name ?? row?.updatedByName ?? null;
// const assignedExecutiveName =
//   row?.assigned_executive_name ?? row?.assignedExecutiveName ?? null;
// const assignedToName =
//   row?.assigned_to_name ?? row?.assignedToName ?? null;
// const transferredByName =
//   row?.transferred_by_name ?? row?.transferredByName ?? null;

//     const assignedExec = row?.assigned_executive ?? row?.assignedExecutive ?? row?.assigned_to;

//     return {
//       id: String(id),
//       seller_id: row?.seller_id ?? row?.sellerId,
//       followup_date: row?.schedule_date ?? row?.followup_date ?? row?.scheduleDate ?? undefined,
//       followup_time: ensureTime(row?.schedule_time ?? row?.followup_time ?? row?.scheduleTime ?? undefined),
//       followup_type: followupType,
//       status: sellerLeadStatus,
//       priority: row?.priority ?? '',
//       notes: row?.custom_remark ?? row?.customRemark ?? row?.remark ?? row?.notes ?? undefined,
//       next_action: row?.next_action ?? row?.nextAction ?? undefined,
//       assigned_to: assignedExec,
//       reminder: Number(row?.reminder ?? 0) as 0 | 1,

//       created_at: row?.created_at ?? row?.createdAt,
//       updated_at: row?.updated_at ?? row?.updatedAt,
//       created_by: row?.created_by ?? row?.createdBy,
//       updated_by: row?.updated_by ?? row?.updatedBy,

//       // ⭐ Names preferred by UI
//           createdByName,
//           updatedByName,
//           assignedExecutiveName,
         
          
//       transferred_from_lead:
//         row?.transferred_from_lead === true ||
//         row?.transferred_from_lead === 1 ||
//         row?.transferredFromLead === true ||
//         row?.transferredFromLead === 1 ||
//         false,

//       category:
//         (row?.transferred_from_lead || row?.transferredFromLead) ? 'presales' : 'sales',
//     };
//   };

//   const pushFollowupsIntoSeller = useCallback((rows: any[]) => {
//     const mapped = (rows || []).map(normalizeFromApi);
//     const updatedSeller: AnyObj = { ...(seller as AnyObj), followups: mapped };
//     onUpdateSeller(updatedSeller);
//   }, [seller, onUpdateSeller]);

//   const fetchFollowups = useCallback(async () => {
//     if (!sellerIdVal) return;
//     try {
//       setFuError(null);
//       setFuLoading(true);
//       const res = await sellerFollowupAPI.getAll({
//         sellerId: sellerIdVal as any,
//         page: 1,
//         limit: 200
//       });
//       const rows = (res && typeof res === 'object' && 'data' in res) ? res.data : res;
    
//       pushFollowupsIntoSeller(Array.isArray(rows) ? rows : []);
//     } catch (e: any) {
//       console.error("Failed to load seller followups:", e);
//       setFuError(e?.message || "Failed to load follow-ups");
//       pushFollowupsIntoSeller([]);
//     } finally {
//       setFuLoading(false);
//     }
//   }, [sellerIdVal, pushFollowupsIntoSeller]);

//   useEffect(() => {
//     if (sellerId) {
//       fetchFollowups();
//     }
//   }, [sellerId]);

//   // ----------------------- Stage, Activity, Visit, Property --------------
//   const mapPropertyToInitialData = (property: AnyObj | null) => {
//     if (!property) return null;

//     const mappedPhotos = Array.isArray(property.photos)
//       ? property.photos
//         .map((p: any, idx: number) => {
//           if (!p) return null;
//           if (typeof p === 'string') return { id: `${property.id ?? 'p'}-${idx}`, url: p, name: `photo-${idx + 1}` };
//           return { id: p.id ?? `${property.id ?? 'p'}-${idx}`, url: p.url ?? p.path ?? '', name: p.name ?? `photo-${idx + 1}` };
//         })
//         .filter(Boolean)
//       : Array.isArray(property.photoUrls)
//         ? property.photoUrls.map((u: string, idx: number) => ({ id: `${property.id ?? 'p'}-${idx}`, url: u, name: `photo-${idx + 1}` }))
//         : [];

//     const mappedNearby = Array.isArray(property.nearby_places)
//       ? property.nearby_places.map((n: any) => ({
//         name: n.name ?? n.place ?? '',
//         type: n.type ?? n.category ?? '',
//         distance: n.distance ?? '',
//         unit: n.unit ?? ''
//       }))
//       : [];

//     return {
//       id: property.id ?? property._id,
//       salutation: property.salutation ?? property.ownerSalutation ?? 'Mr',
//       ownerName: property.ownerName ?? property.owner_name ?? property.contactName ?? property.seller_name ?? '',
//       ownerPhone: property.ownerPhone ?? property.owner_phone ?? property.contactPhone ?? property.phone ?? '',
//       ownerWhatsapp: property.ownerWhatsapp ?? property.owner_whatsapp ?? property.contactWhatsapp ?? '',
//       sameAsPhone: !!(
//         (property.ownerWhatsapp && property.ownerPhone && property.ownerWhatsapp === property.ownerPhone) ||
//         (property.ownerWhatsapp && property.ownerWhatsapp === property.phone)
//       ),
//       ownerEmail: property.ownerEmail ?? property.owner_email ?? property.contactEmail ?? property.email ?? '',
//       ownerType: property.ownerType ?? property.owner_type ?? 'individual',
//       seller: property.seller ?? property.seller_name ?? `${safeString((seller as any)?.salutation ? (seller as any).salutation + ' ' : '')}${safeString((seller as any)?.name)}`,
//       propertyType: property.propertyType ?? property.type ?? property.property_type_name ?? '',
//       propertySubtype: property.propertySubtype ?? property.subtype ?? property.property_subtype_name ?? '',
//       unitType: property.unitType ?? property.unit_type ?? safeString(property.unit_type_name) ?? '',
//       wing: property.wing ?? property.block ?? '',
//       unitNo: property.unitNo ?? property.unit_no ?? property.unit ?? '',
//       furnishing: property.furnishing ?? '',
//       parkingType: property.parkingType ?? property.parking_type ?? '',
//       parkingQty: safeNumber(property.parkingQty ?? property.parking_qty),
//       city: property.city ?? property.city_name ?? (seller as any)?.city ?? '',
//       location: property.location ?? property.location_name ?? '',
//       society: property.society ?? property.society_name ?? '',
//       floor: property.floor ?? '',
//       totalFloors: property.totalFloors ?? property.total_floors ?? '',
//       carpetArea: safeNumber(property.carpetArea ?? property.carpet_area ?? property.area),
//       builtupArea: safeNumber(property.builtupArea ?? property.builtup_area),
//       budget: safeNumber(property.budget ?? property.price ?? property.expectedPrice),
//       address: property.address ?? property.displayAddress ?? property.full_address ?? '',
//       status: property.status ?? '',
//       leadSource: property.leadSource ?? property.lead_source ?? property.source ?? (seller as any)?.source ?? 'Website',
//       possessionMonth: property.possessionMonth ?? property.possession_month ?? '',
//       possessionYear: property.possessionYear ?? property.possession_year ?? '',
//       purchaseMonth: property.purchaseMonth ?? property.purchase_month ?? '',
//       purchaseYear: property.purchaseYear ?? property.purchase_year ?? '',
//       sellingRights: property.sellingRights ?? property.selling_rights ?? '',
//       amenities: ensureArray(property.amenities ?? property.amenities_list ?? []),
//       furnishingItems: ensureArray(property.furnishingItems ?? property.furnishing_items ?? []),
//       description: property.description ?? property.longDescription ?? property.desc ?? '',
//       nearby_places: mappedNearby,
//       existingOwnershipDocUrl: property.ownership_doc_path ?? property.ownershipDocUrl ?? '',
//       existingOwnershipDocName: property.ownership_doc_name ?? '',
//       existingOwnershipDocId: property.ownership_doc_id ?? '',
//       existingPhotos: mappedPhotos,
//       public_inquiries: property.public_inquiries ?? property.publicInquiries ?? 0,
//       public_views: property.public_views ?? property.publicViews ?? 0,
//       publication_date: property.publication_date ?? property.publicationDate ?? null
//     };
//   };

//   const openPropertyFormForEdit = (property: AnyObj) => {
//     const mapped = mapPropertyToInitialData(property);
//     setEditingProperty(mapped);
//     setShowPropertyForm(true);
//   };

//   const openPropertyFormForCreate = () => {
//     const prefill = {
//       seller: `${(seller as any)?.salutation ? (seller as any).salutation + ' ' : ''}${(seller as any)?.name ?? ''}`,
//       city: (seller as any)?.city ?? '',
//       location: (seller as any)?.location ?? '',
//       leadSource: (seller as any)?.source ?? 'Website'
//     };
//     setEditingProperty(prefill);
//     setShowPropertyForm(true);
//   };

//   const handleStageUpdate = (newStage: string, remarks: string, nextAction: string) => {
//     const updatedSeller = {
//       ...(seller as AnyObj),
//       stage: newStage,
//       stageProgress: sellerStages.find(s => s.id === newStage)?.progress ?? 0,
//       lastActivity: new Date().toISOString().split('T')[0],
//       activities: [
//         ...((seller as AnyObj).activities || []),
//         {
//           id: Date.now(),
//           type: 'stage_update',
//           description: `Stage updated to ${sellerStages.find(s => s.id === newStage)?.label ?? newStage}`,
//           date: new Date().toISOString().split('T')[0],
//           time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
//           stage: newStage,
//           outcome: remarks,
//           nextAction,
//           executedBy: 'Admin User',
//           remarks
//         }
//       ]
//     };
//     onUpdateSeller(updatedSeller);
//     setShowStageUpdateModal(false);
//   };

//   const handleAddActivity = (activityData: AnyObj) => {
//     const updatedSeller = {
//       ...(seller as AnyObj),
//       activities: [...((seller as AnyObj).activities || []), activityData],
//       lastActivity: new Date().toISOString().split('T')[0]
//     };
//     onUpdateSeller(updatedSeller);
//     setShowActivityModal(false);
//     setEditingActivity(null);
//   };

//   // Local upsert helper (just updates parent state)
//   const upsertFollowupLocal = (followupData: Followup) => {
//     const updatedSeller = {
//       ...(seller as AnyObj),
//       followups: ((seller as AnyObj).followups as Followup[] | undefined)
//         ? ((seller as AnyObj).followups as Followup[]).some((f) => f.id === followupData.id)
//           ? ((seller as AnyObj).followups as Followup[]).map((f) => (f.id === followupData.id ? followupData : f))
//           : [...(((seller as AnyObj).followups as Followup[])), followupData]
//         : [followupData]
//     };
//     onUpdateSeller(updatedSeller);
//   };

//   const handleDeleteFollowupLocal = (f: Followup) => {
//     const updatedSeller = {
//       ...(seller as AnyObj),
//       followups: (((seller as AnyObj).followups as Followup[]) || []).filter((x) => x.id !== f.id)
//     };
//     onUpdateSeller(updatedSeller);
//   };

//   const handleAddVisit = (visitData: AnyObj) => {
//     const updatedSeller = {
//       ...(seller as AnyObj),
//       visits: ((seller as AnyObj).visits || 0) + 1,
//       totalVisits: ((seller as AnyObj).totalVisits || 0) + 1,
//       lastActivity: new Date().toISOString().split('T')[0],
//       activities: [
//         ...((seller as AnyObj).activities || []),
//         {
//           id: Date.now(),
//           type: 'visit',
//           description: `Property visit scheduled for ${visitData.property}`,
//           date: visitData.date,
//           time: visitData.time,
//           stage: (seller as AnyObj).stage,
//           outcome: visitData.feedback || 'Visit scheduled',
//           nextAction: visitData.nextAction || 'Follow up after visit',
//           executedBy: 'Admin User',
//           remarks: visitData.remarks || ''
//         }
//       ]
//     };
//     onUpdateSeller(updatedSeller);
//     setShowVisitModal(false);
//   };

//   const handleAddProperty = (propertyData: AnyObj) => {
//     const updatedSeller = {
//       ...(seller as AnyObj),
//       properties: [...((seller as AnyObj).properties || []), propertyData]
//     };
//     onUpdateSeller(updatedSeller);
//     setShowPropertyForm(false);
//     setEditingProperty(null);
//   };

//   /* ---------- MAP from modal payload -> API + local Followup item ---------- */
//   const normalizeToFollowup = (data: SellerFollowupPayload): Followup => {
//     const mkId = () => (data.id ? String(data.id) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
//     return {
//       id: mkId(),
//       seller_id: data.seller_id ?? ((seller as any)?.id ?? (seller as any)?.sellerId),
//       followup_date: data.scheduleDate || undefined,
//       followup_time: ensureTime(data.scheduleTime),
//       followup_type: data.followupType || undefined,
//       status: data.sellerLeadStatus || undefined,
//       priority: data.priority || undefined,
//       notes: data.customRemark || data.remark || undefined,
//       next_action: data.nextAction || undefined,
//       assigned_to: data.assigned_executive,
//       reminder: (data.reminder as number) ?? 0,
//       created_at: data.created_at,
//       updated_at: data.updated_at,
//       created_by: data.created_by,
//       updated_by: data.updated_by,
//       transferred_from_lead: false,
//       category: 'sales',
//     };
//   };

//   // --------------------------- API: Create / Update ---------------------------
//   const handleModalSave = async (payload: SellerFollowupPayload) => {
//     if (!sellerIdVal) {
//       alert("Missing seller id.");
//       return;
//     }
//     try {
//       setFuError(null);
//       setFuLoading(true);

//       const apiPayload = { ...payload, seller_id: payload.seller_id ?? sellerIdVal };

//       if (editingFollowup?.id) {
//         const res = await sellerFollowupAPI.update(editingFollowup.id, apiPayload);
//         const updatedRow = res;
//         const normalized = normalizeFromApi(updatedRow ?? apiPayload);
//         upsertFollowupLocal(normalized);
//       } else {
//         const res = await sellerFollowupAPI.create(apiPayload);
//         const createdRow = res;
//         const normalized = normalizeFromApi(createdRow ?? apiPayload);
//         upsertFollowupLocal(normalized);
//       }

//       setShowFollowupModal(false);
//       setEditingFollowup(null);
//     } catch (e: any) {
//       console.error("Save seller follow-up failed:", e);
//       setFuError(e?.message || "Failed to save follow-up");
//       alert(e?.message || "Failed to save follow-up");
//     } finally {
//       setFuLoading(false);
//     }
//   };

//   // ------------------------------ API: Delete --------------------------------
//   const handleDeleteFollowup = async (f: Followup) => {
//     try {
//       setFuError(null);
//       setFuLoading(true);
//       await sellerFollowupAPI.remove(f.id);
//       handleDeleteFollowupLocal(f);
//     } catch (e: any) {
//       console.error("Delete seller follow-up failed:", e);
//       setFuError(e?.message || "Failed to delete follow-up");
//       alert(e?.message || "Failed to delete follow-up");
//     } finally {
//       setFuLoading(false);
//     }
//   };

//   /* ----------------- Tabs Renderers (UI) ----------------- */
//   const renderOverviewTab = () => (
//     <div className="space-y-6">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
//           <div className="flex items-center space-x-4">
//             <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
//               {safeString((seller as any).name).charAt(0) || ''}
//             </div>
//             <div className="flex-1">
//               <h2 className="text-2xl font-bold">{(seller as any).salutation} {(seller as any).name}</h2>
//               {/* 🔁 Removed visible numeric ID */}
//               <p className="text-blue-100 text-lg">{(seller as any).location ?? '—'}, {(seller as any).city ?? '—'}</p>
//               <div className="flex items-center space-x-4 mt-2">
//                 <span className="text-blue-100">{(seller as any).source ?? '—'} Lead</span>
//                 <div className="flex items-center space-x-1">
//                   <Star className="text-yellow-300 fill-current" size={16} />
//                   <span className="text-white font-medium">{(seller as any).leadScore ?? 0}/100</span>
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-3xl font-bold">{(seller as any).stageProgress ?? 0}%</div>
//               <div className="text-blue-100">Progress</div>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 bg-gray-50">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-700">Stage Progress:</span>
//             <div className="flex items-center space-x-2">
//               <span className="px-3 py-1 rounded-full text-sm font-medium">{currentStage.label}</span>
//               <span className="text-sm font-bold text-blue-600">{(seller as any).stageProgress ?? 0}%</span>
//             </div>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-3">
//             <div
//               className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
//               style={{ width: `${(seller as any).stageProgress ?? 0}%` }}
//             />
//           </div>
//           <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
//             <span>Initial Contact</span>
//             <span>Completed</span>
//           </div>
//         </div>

//         <div className="p-6 border-t border-gray-100">
//           <div className="grid grid-cols-4 gap-4">
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
//                 <Eye size={16} />
//                 <span className="text-xl font-bold">{(seller as any).visits ?? 0}</span>
//               </div>
//               <div className="text-xs text-gray-500">visits</div>
//             </div>
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
//                 <Users size={16} />
//                 <span className="text-xl font-bold">{(seller as any).interestedBuyers ?? 0}</span>
//               </div>
//               <div className="text-xs text-gray-500">buyers</div>
//             </div>
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
//                 <Building size={16} />
//                 <span className="text-xl font-bold">{((seller as any).properties || []).length}</span>
//               </div>
//               <div className="text-xs text-gray-500">properties</div>
//             </div>
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
//                 <Activity size={16} />
//                 <span className="text-xl font-bold">{((seller as any).activities || []).length}</span>
//               </div>
//               <div className="text-xs text-gray-500">activities</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
//           <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
//             <Camera size={16} />
//             <span>Add Photos</span>
//           </button>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {(((seller as any).properties?.[0]?.photos ?? []) as string[]).slice(0, 3).map((photo: string, index: number) => (
//             <div key={index} className="relative group">
//               <img src={photo} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-xl" />
//               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
//                 <Eye className="text-white opacity-0 group-hover:opacity-100 transition-all" size={24} />
//               </div>
//             </div>
//           ))}
//           <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
//             <div className="text-center">
//               <Camera className="mx-auto text-gray-400 mb-2" size={24} />
//               <span className="text-sm text-gray-500">Add Photo</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="text-sm text-gray-500">Type:</div>
//                 <div className="font-semibold text-gray-900 text-lg">{(seller as any).properties?.[0]?.unit_type || (seller as any).properties?.[0]?.property_type || '—'}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Carpet Area:</div>
//                 <div className="font-semibold text-gray-900 text-lg">{(seller as any).properties?.[0]?.carpet_area ?? '—'} sq ft</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Floor:</div>
//                 <div className="font-semibold text-gray-900 text-lg">{(seller as any).properties?.[0]?.floor ?? '—'}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Parking:</div>
//                 <div className="font-semibold text-gray-900 text-lg">
//                   {(seller as any).properties?.[0]?.parking_type ? `${(seller as any).properties?.[0]?.parking_qty || ''} ${(seller as any).properties?.[0]?.parking_type}` : '—'}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
//           <div className="space-y-4">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <UserIcon className="text-blue-600" size={20} />
//               </div>
//               <div>
//                 <div className="font-semibold text-gray-900">{(seller as any).name ?? '—'}</div>
//                 <div className="text-sm text-gray-600">{(seller as any).phone ?? '—'}</div>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center space-x-2 text-sm">
//                 <Mail size={14} className="text-gray-400" />
//                 <span>Email: {(seller as any).email ?? '—'}</span>
//               </div>
//               <div className="flex items-center space-x-2 text-sm">
//                 <MapPin size={14} className="text-gray-400" />
//                 <span>Lead Source: {(seller as any).source ?? '—'}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderDetailsTab = () => (
//     <div className="space-y-6">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium text-gray-500">Full Name</label>
//               <div className="text-lg font-semibold text-gray-900">{(seller as any).salutation} {(seller as any).name}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Phone Number</label>
//               <div className="text-lg font-semibold text-gray-900">{(seller as any).phone}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Email Address</label>
//               <div className="text-lg font-semibold text-gray-900">{(seller as any).email}</div>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium text-gray-500">Location</label>
//               <div className="text-lg font-semibold text-gray-900">{(seller as any).location}, {(seller as any).city}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Lead Source</label>
//               <div className="text-lg font-semibold text-gray-900">{(seller as any).source}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Status</label>
//               <div className="mt-1">
//                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
//                   {(seller as any).status ?? 'Active'}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Properties Portfolio</h3>
//           <button
//             onClick={openPropertyFormForCreate}
//             className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <Plus size={16} />
//             <span>Add Property</span>
//           </button>
//         </div>

//         {(seller as any).properties && (seller as any).properties.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {((seller as AnyObj).properties as AnyObj[]).map((property: AnyObj, index: number) => (
//               <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
//                 <div className="flex items-start space-x-3">
//                   <img
//                     src={property.photos?.[0] ?? 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200'}
//                     alt={property.title ?? 'property'}
//                     className="w-16 h-12 object-cover rounded-lg"
//                   />
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-gray-900">
//                       {property.title ?? property.slug ?? (property.unit_type || property.property_subtype_name || 'Untitled')}
//                     </h4>
//                     <p className="text-sm text-gray-600">{property.address ?? property.location_name ?? property.location}</p>
//                     <div className="flex items-center justify-between mt-2">
//                       <span className="text-sm font-medium text-green-600">{property.price ?? property.budget ?? ''}</span>
//                       <span className="text-xs text-gray-500">{property.area ?? property.carpet_area ?? ''}</span>
//                     </div>
//                   </div>
//                   <div className="flex items-start space-x-2">
//                     <button
//                       onClick={() => openPropertyFormForEdit(property)}
//                       className="p-1 rounded hover:bg-gray-100"
//                       title="Edit property"
//                     >
//                       <Edit size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <Building className="mx-auto text-gray-300 mb-3" size={48} />
//             <p className="text-gray-500 mb-4">No properties added yet</p>
//             <button onClick={openPropertyFormForCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//               Add First Property
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderActivitiesTab = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
//         <button onClick={() => setShowActivityModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//           <Plus size={16} />
//           <span>Add Activity</span>
//         </button>
//       </div>

//       {(seller as any).activities && (seller as any).activities.length > 0 ? (
//         <div className="space-y-4">
//           {((seller as AnyObj).activities as AnyObj[]).map((activity: any, index: number) => (
//             <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
//               <div className="flex items-start space-x-4">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Activity className="text-blue-600" size={16} />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-semibold text-gray-900">{activity.description}</h4>
//                     <span className="text-sm text-gray-500">{activity.date}</span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
//                     <div>Stage: {activity.stage}</div>
//                     <div>Duration: {activity.duration}</div>
//                     <div>By: {activity.executedBy}</div>
//                   </div>
//                   {activity.outcome && <div className="mt-2 text-sm text-gray-700"><span className="font-medium">Outcome:</span> {activity.outcome}</div>}
//                   {activity.nextAction && <div className="text-sm text-blue-600"><span className="font-medium">Next:</span> {activity.nextAction}</div>}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//           <Activity className="mx-auto text-gray-300 mb-4" size={48} />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities recorded</h3>
//           <p className="text-gray-500 mb-4">Start tracking seller interactions</p>
//           <button onClick={() => setShowActivityModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add First Activity</button>
//         </div>
//       )}
//     </div>
//   );

//   const renderDocumentsTab = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
//         <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
//           <Plus size={16} />
//           <span>Create Document</span>
//         </button>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <h4 className="font-semibold text-gray-900 mb-4">Document Workflow</h4>
//         <div className="space-y-4">
//           {[
//             { stage: 'creation', label: 'Document Creation', status: 'completed', icon: FileText },
//             { stage: 'sharing', label: 'Sharing with Seller', status: 'completed', icon: Send },
//             { stage: 'otp', label: 'OTP Verification', status: 'pending', icon: Shield },
//             { stage: 'esign', label: 'E-Signature', status: 'pending', icon: Award },
//             { stage: 'completion', label: 'Document Completion', status: 'pending', icon: CheckCircle }
//           ].map((step, idx) => (
//             <div key={idx} className="flex items-center space-x-4">
//               <div className={`p-2 rounded-lg ${step.status === 'completed' ? 'bg-green-100' : step.status === 'pending' ? 'bg-orange-100' : 'bg-gray-100'}`}>
//                 <step.icon className={step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-600'} size={16} />
//               </div>
//               <div className="flex-1">
//                 <div className="font-medium text-gray-900">{step.label}</div>
//                 <div className={`text-sm ${step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-500'}`}>
//                   {step.status === 'completed' ? 'Completed' : step.status === 'pending' ? 'Pending' : 'Not Started'}
//                 </div>
//               </div>
//               {step.status === 'pending' && (
//                 <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
//                   {step.stage === 'otp' ? 'Send OTP' : step.stage === 'esign' ? 'Initiate E-Sign' : 'Process'}
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {(seller as any).documents && (seller as any).documents.length > 0 ? (
//         <div className="space-y-4">
//           {((seller as AnyObj).documents as AnyObj[]).map((doc: any, index: number) => (
//             <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <FileText className="text-blue-600" size={20} />
//                   <div>
//                     <div className="font-semibold text-gray-900">{doc.name}</div>
//                     <div className="text-sm text-gray-600">{doc.category} • {doc.date}</div>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'completed' ? 'bg-green-100 text-green-700' : doc.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
//                     {doc.status}
//                   </span>
//                   <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
//                     <Eye size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//           <FileText className="mx-auto text-gray-300 mb-4" size={48} />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents created</h3>
//           <p className="text-gray-500">Create documents for this seller</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderAnalyticsTab = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-blue-100 text-sm">Response Rate</p>
//               <p className="text-2xl font-bold">{(seller as any).responseRate ?? '—'}%</p>
//             </div>
//             <TrendingUp size={24} className="text-blue-200" />
//           </div>
//         </div>
//         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-green-100 text-sm">Deal Potential</p>
//               <p className="text-2xl font-bold capitalize">{(seller as any).dealPotential ?? '—'}</p>
//             </div>
//             <Target size={24} className="text-green-200" />
//           </div>
//         </div>
//         <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-purple-100 text-sm">Avg Response</p>
//               <p className="text-2xl font-bold">{(seller as any).avgResponseTime ?? '—'}</p>
//             </div>
//             <Clock size={24} className="text-purple-200" />
//           </div>
//         </div>
//         <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-orange-100 text-sm">Total Visits</p>
//               <p className="text-2xl font-bold">{(seller as any).totalVisits ?? 0}</p>
//             </div>
//             <Eye size={24} className="text-orange-200" />
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Progress</h3>
//         <div className="space-y-3">
//           {sellerStages.map((stage, index) => (
//             <div key={stage.id} className="flex items-center space-x-4">
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(seller as any).stage === stage.id ? 'bg-blue-500 text-white' : sellerStages.findIndex(s => s.id === (seller as any).stage) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
//                 {sellerStages.findIndex(s => s.id === (seller as any).stage) > index ? <CheckCircle size={16} /> : index + 1}
//               </div>
//               <div className="flex-1">
//                 <div className="font-medium text-gray-900">{stage.label}</div>
//                 <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                   <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: (seller as any).stage === stage.id ? `${(seller as any).stageProgress ?? 0}%` : sellerStages.findIndex(s => s.id === (seller as any).stage) > index ? '100%' : '0%' }} />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="h-full flex flex-col bg-gray-50 text-xs">
//       {/* TOP BAR */}
//       <div className="bg-white border-b border-gray-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button onClick={onBack} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
//               <ArrowLeft size={20} />
//             </button>
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                 {safeString((seller as any).name).charAt(0) || ''}
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">{(seller as any).salutation} {(seller as any).name}</h1>
//                 {/* 🔁 Removed visible numeric ID here */}
//                 <div className="flex items-center space-x-3 text-sm text-gray-600">
//                   <span>{(seller as any).location ?? '—'}, {(seller as any).city ?? '—'}</span>
//                   <span>•</span>
//                   <span>{(seller as any).source ?? '—'} Lead</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">
//             <div className="flex items-center space-x-2 text-sm text-gray-500">
//               <span>{currentIndex + 1} of {totalSellers}</span>
//               <div className="flex space-x-1">
//                 <button onClick={onPrevious} disabled={currentIndex === 0} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
//                   <ChevronRight size={16} className="rotate-180" />
//                 </button>
//                 <button onClick={onNext} disabled={currentIndex === totalSellers - 1} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>

//             <button
//               onClick={() => window.open(`tel:${((seller as any).phone || '').replace(/\D/g, '')}`)}
//               className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
//               title="Call"
//             >
//               <Phone size={20} />
//             </button>

//             <button
//               onClick={() => {
//                 const message = `Hi ${(seller as any).name}, this is regarding your property inquiry. How can I assist you today?`;
//                 window.open(`https://wa.me/${((seller as any).phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
//               }}
//               className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
//               title="WhatsApp"
//             >
//               <MessageCircle size={20} />
//             </button>

//             <button
//               onClick={() => {
//                 const subject = `Regarding Your Property - ${(seller as any).name}`;
//                 const body = `Dear ${(seller as any).name},\n\nI hope this email finds you well. I wanted to follow up regarding your property inquiry.\n\nBest regards,\nResaleExpert Team`;
//                 window.open(`mailto:${(seller as any).email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
//               }}
//               className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
//               title="Email"
//             >
//               <Mail size={20} />
//             </button>

//             <button onClick={() => onEdit(seller)} className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Edit">
//               <Edit size={20} />
//             </button>
//           </div>
//         </div>

//         {(fuLoading || fuError) && (
//           <div className="mt-3 text-xs">
//             {fuLoading && <span className="text-blue-600">Syncing follow-ups…</span>}
//             {fuError && <span className="text-rose-600">• {fuError}</span>}
//           </div>
//         )}

//         {/* TABS */}
//         <div className="mt-4">
//           <nav className="flex space-x-1">
//             {tabs.map(tab => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
//                 >
//                   <Icon size={16} />
//                   <span className="font-medium">{tab.label}</span>
//                   {tab.count !== null && (
//                     <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-200' : 'bg-gray-200'}`}>
//                       {tab.count}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* TAB CONTENT */}
//       <div className="flex-1 overflow-auto p-6">
//         {activeTab === 'overview' && renderOverviewTab()}
//         {activeTab === 'details' && renderDetailsTab()}
//         {activeTab === 'activities' && renderActivitiesTab()}

//         {activeTab === 'followups' && (
//           <SellerFollowupsTab
//             followups={(((seller as any).followups as Followup[]) || [])}
//             onAddFollowup={() => {
//               setEditingFollowup(null);
//               setShowFollowupModal(true);
//             }}
//             onEditFollowup={(f) => {
//               setEditingFollowup(f);
//               setShowFollowupModal(true);
//             }}
//             onDeleteFollowup={handleDeleteFollowup}
//           />
//         )}

//         {activeTab === 'documents' && renderDocumentsTab()}
//         {activeTab === 'analytics' && renderAnalyticsTab()}
//       </div>

//       {/* FOOTER ACTIONS */}
//       <div className="bg-white border-t border-gray-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <button onClick={() => setShowStageUpdateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
//               <TrendingUp size={16} />
//               <span>Update Stage</span>
//             </button>
//             <button onClick={() => setShowSharingModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
//               <Share size={16} />
//               <span>Share</span>
//             </button>
//             <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
//               <Eye size={16} />
//               <span>Track</span>
//             </button>
//           </div>

//           <div className="flex items-center space-x-3">
//             <button onClick={() => setShowFollowupModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//               <CalendarIcon size={16} />
//               <span>Follow-ups</span>
//             </button>
//             <button onClick={() => { setEditingActivity(null); setShowActivityModal(true); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//               <Plus size={16} />
//               <span>Add Activity</span>
//             </button>
//             <button onClick={() => setShowVisitModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
//               <CalendarIcon size={16} />
//               <span>Schedule Visit</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* MODALS */}
//       {showStageUpdateModal && (
//         <SellerStageUpdateModal isOpen={showStageUpdateModal} onClose={() => setShowStageUpdateModal(false)} seller={seller} onUpdateStage={handleStageUpdate} />
//       )}

//       {showSharingModal && (
//         <SellerSharingModal isOpen={showSharingModal} onClose={() => setShowSharingModal(false)} seller={seller} onShare={() => setShowSharingModal(false)} />
//       )}

//       {showFollowupModal && (
//         <SellerFollowupModal
//           isOpen={showFollowupModal}
//           onClose={() => { setShowFollowupModal(false); setEditingFollowup(null); }}
//           onSave={handleModalSave}
//           tabId="seller"
//           sellerId={(seller as any)?.id ?? (seller as any)?.sellerId ?? ''}
//           initialForm={
//             editingFollowup
//               ? {
//                 id: String(editingFollowup.id),
//                 created_by: (editingFollowup as any).created_by,
//                 created_at: editingFollowup.created_at,

//                 followupType: editingFollowup.followup_type ?? "Phone Call",
//                 followup_type: editingFollowup.followup_type ?? "Phone Call",

//                 sellerLeadStatus: editingFollowup.status ?? "",
//                 seller_lead_status: editingFollowup.status ?? "",

//                 sellerLeadStage: (seller as any)?.stage_label ?? (seller as any)?.stage ?? "",
//                 seller_lead_stage: (seller as any)?.stage_label ?? (seller as any)?.stage ?? "",

//                 remark: editingFollowup.notes ?? "",
//                 customRemark: editingFollowup.notes ?? "",
//                 custom_remark: editingFollowup.notes ?? "",

//                 nextAction: editingFollowup.next_action ?? "",
//                 next_action: editingFollowup.next_action ?? "",

//                 scheduleDate: editingFollowup.followup_date ?? "",
//                 schedule_date: editingFollowup.followup_date ?? "",

//                 scheduleTime: editingFollowup.followup_time?.slice(0, 5) ?? "",
//                 schedule_time: editingFollowup.followup_time?.slice(0, 5) ?? "",

//                 priority: editingFollowup.priority ?? "",
//               }
//               : undefined
//           }
//         />
//       )}

//       {showActivityModal && (
//         <ActivityModal
//           isOpen={showActivityModal}
//           onClose={() => { setShowActivityModal(false); setEditingActivity(null); }}
//           activity={editingActivity}
//           onSave={handleAddActivity}
//         />
//       )}

//       {showVisitModal && (
//         <VisitModal
//           isOpen={showVisitModal}
//           onClose={() => setShowVisitModal(false)}
//           visit={null}
//           onSave={handleAddVisit}
//           buyer={{ id: (seller as any).id ?? '', name: (seller as any).name ?? '' }}
//         />
//       )}

//       {showPropertyForm && (
//         <PropertyFormModal
//           isOpen={showPropertyForm}
//           onClose={() => { setShowPropertyForm(false); setEditingProperty(null); }}
//           onSubmit={handleAddProperty}
//           mode={editingProperty && (editingProperty as any).id ? 'edit' : 'create'}
//           propertyId={(editingProperty as any)?.id}
//           initialData={editingProperty ?? { seller: `${(seller as any)?.salutation ?? ''} ${(seller as any)?.name ?? ''}` }}
//         />
//       )}
//     </div>
//   );
// };

// function safeNumber(value: any): number | undefined {
//   if (value === undefined || value === null || value === '') return undefined;
//   const num = Number(value);
//   return isNaN(num) ? undefined : num;
// }

// export default SellerViewPage;

// function ensureArray(value: any): any[] {
//   if (value === undefined || value === null) return [];
//   if (Array.isArray(value)) return value;
//   if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
//   return [value];
// }

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Edit,
  Share,
  Eye,
  User as UserIcon,
  MapPin,
  Calendar as CalendarIcon,
  Star,
  Building,
  Activity,
  FileText,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  Send,
  Shield,
  Award,
  Camera,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Tag,
  User,
  Layers,
  Play,
  Flag
} from 'lucide-react';

import SellerStageUpdateModal from './SellerStageUpdateModal';
import SellerSharingModal from './SellerSharingModal';
import ActivityModal from '../buyers/ActivityModal';
import VisitModal from '../buyers/VisitModal';
import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';
import { sellerFollowupAPI } from '@/lib/sellerFollowupAPI';
import SellerFollowupModal, { SellerFollowupPayload } from './SellerFollowupModal';
import { toast } from 'react-toastify';

// ---- Permission helpers (adjust import paths to match your project) ----
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/utils/permission';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export type AnyObj = Record<string, any>;

/** 🔄 MERGED Followup type (supports seller snake_case + buyer camelCase) */
export type Followup = {
  id: string | number;
  seller_id?: string | number;
  followup_date?: string;
  followup_time?: string;
  followup_type?: string;
  status?: string | null;
  priority?: string | null;
  assigned_to?: string | number | null;
  reminder?: number | 0 | 1;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | number | null;
  updated_by?: string | number | null;
  next_action?: string | null;
  outcome?: string | null;
  transferred_from_lead?: boolean | 0 | 1 | '0' | '1';
  category?: 'sales' | 'presales';

  // camelCase UI fields
  description?: string | null;
  date?: string | null;
  time?: string | null;
  assignedTo?: string | null;
  type?: string | null;
  remark?: string | null;
  reminderBool?: boolean | null;
  raw?: any;
  transferredFromLead?: boolean | 0 | 1 | '0' | '1';

  buyerLeadStage?: string | null;
  buyerLeadStatus?: string | null;
  customRemark?: string | null;
  followupType?: string | null;
  nextAction?: string | null;
  scheduleDate?: string | null;
  scheduleTime?: string | null;
  transferredAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;

  createdByName?: string | null;
  updatedByName?: string | null;
  assignedExecutiveName?: string | null;

  sellerId?: string | number | null;
  assignedExecutive?: string | number | null;
  completedDate?: string | null;
};

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */
const safeString = (v: any) => (v === undefined || v === null ? '' : String(v));
const toSlug = (s?: string | null) => safeString(s).toLowerCase().replace(/\s+/g, '').trim();

function parseSqlish(val?: string | null): Date | null {
  if (!val) return null;
  const s = val.trim();

  if (/\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const [datePart, timePart] = s.split(/\s+/);
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm, ssRaw] = timePart.split(':').map(Number);
    const ss = Number.isFinite(ssRaw) ? ssRaw : 0;
    return new Date(y, m - 1, d, hh, mm, ss);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0);
  }
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const [hh, mm, ssRaw] = s.split(':').map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, Number.isFinite(ssRaw) ? ssRaw : 0);
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function to12h(hh: number, mm: number) {
  const period = hh >= 12 ? 'pm' : 'am';
  const h12 = hh % 12 || 12;
  const mmStr = String(mm).padStart(2, '0');
  return `${h12}:${mmStr} ${period}`;
}

function fmtDateDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtDateTimeHuman(val?: string | null): string | null {
  const d = parseSqlish(val);
  if (!d) return null;

  const hasTime =
    /T\d{2}:\d{2}/.test(val || '') ||
    /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(val || '');

  const dateStr = fmtDateDDMMYYYY(d);
  if (!hasTime) return dateStr;

  return `${dateStr}, ${to12h(d.getHours(), d.getMinutes())}`;
}

function fmtTime12h(t?: string | null): string {
  if (!t) return '—';
  const m = t.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return t;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return t;
  return to12h(hh, mm);
}

/* ------------------------------------------------------------------ */
/* UI Configs                                                         */
/* ------------------------------------------------------------------ */
const getStatusConfig = () => ({
  pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pending', icon: '⏳' },
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled', icon: '📅' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: '✅' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: '❌' },
  inprogress: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress', icon: '🔄' },
  onhold: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'On Hold', icon: '⏸️' },
  followup: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Follow Up', icon: '📞' },
  interested: { bg: 'bg-green-100', text: 'text-green-700', label: 'Interested', icon: '👍' },
  notinterested: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Interested', icon: '👎' },
  contacted: { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Contacted', icon: '📧' },
  meeting: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Meeting', icon: '🤝' },
  proposal: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Proposal', icon: '📋' },
  negotiation: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Negotiation', icon: '💼' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Closed', icon: '🔐' },

  done: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done', icon: '✅' },
  planned: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Planned', icon: '📅' },
  missed: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Missed', icon: '⚠️' },
});

const getPriorityConfig = () => ({
  urgent: { border: 'border-l-red-600', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  high: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  medium: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  normal: { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  low: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  minimal: { border: 'border-l-gray-400', bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100' },

  high_legacy: { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  medium_legacy: { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  low_legacy: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
});

const getFieldConfig = () => ({
  buyerLeadStage: { label: 'Seller Stage', icon: Layers, color: 'bg-indigo-100 text-indigo-700', priority: 1 },
  buyerLeadStatus: { label: 'Seller Status', icon: TrendingUp, color: 'bg-blue-100 text-blue-700', priority: 2 },
  followupType: { label: 'Follow-up Type', icon: Tag, color: 'bg-purple-100 text-purple-700', priority: 3 },
  customRemark: { label: 'Remarks', icon: AlertCircle, color: 'bg-pink-100 text-pink-700', priority: 5 },
  nextAction: { label: 'Next Action', icon: Play, color: 'bg-yellow-100 text-yellow-700', priority: 4 },
  scheduleDate: { label: 'Scheduled', icon: CalendarIcon, color: 'bg-green-100 text-green-700', priority: 6 },
  transferredAt: { label: 'Transferred', icon: CheckCircle2, color: 'bg-orange-100 text-orange-700', priority: 7 },
  assignedTo: { label: 'Assigned Executive', icon: UserIcon, color: 'bg-teal-100 text-teal-700', priority: 8 },
  type: { label: 'Type', icon: Clock, color: 'bg-gray-100 text-gray-700', priority: 9 },
  priority: { label: 'Priority', icon: Flag, color: 'bg-gray-100 text-gray-700', priority: 11 },
  createdAt: { label: 'Created', icon: CalendarIcon, color: 'bg-gray-50 text-gray-700', priority: 90 },
  updatedAt: { label: 'Updated', icon: CalendarIcon, color: 'bg-gray-50 text-gray-700', priority: 91 },
  createdBy: { label: 'Created By', icon: UserIcon, color: 'bg-gray-50 text-gray-700', priority: 92 },
  updatedBy: { label: 'Updated By', icon: UserIcon, color: 'bg-gray-50 text-gray-700', priority: 93 },
});

/* ------------------------------------------------------------------ */
/* Small UI bits                                                      */
/* ------------------------------------------------------------------ */
const typeIcon = (t?: string | null) => {
  switch (t) {
    case 'Phone Call':
      return <Phone size={14} className="text-blue-600" />;
    case 'WhatsApp':
      return <MessageCircle size={14} className="text-green-600" />;
    case 'Email':
      return <Mail size={14} className="text-indigo-600" />;
    default:
      return <Tag size={14} className="text-gray-500" />;
  }
};

const statusBadge = (s?: string | null) => {
  const cfg = getStatusConfig();
  const slug = toSlug(s);
  const meta = (cfg as any)[slug] || (cfg as any)['planned'];
  const label = meta?.label || (s ?? '—');
  const classes = meta ? `${meta.bg} ${meta.text}` : 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${classes}`}>
      <span>{meta?.icon ?? '•'}</span>
      {label}
    </span>
  );
};

const priorityBadge = (p?: string | null) => {
  const cfg = getPriorityConfig();
  const slug = toSlug(p);
  const meta =
    (cfg as any)[slug] ||
    (slug === 'high' && (cfg as any).high_legacy) ||
    (slug === 'medium' && (cfg as any).medium_legacy) ||
    (slug === 'low' && (cfg as any).low_legacy);
  const text = p ?? '—';
  const classes = meta ? `${meta.badge} ${meta.text}` : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>{text}</span>;
};

/* ------------------------------------------------------------------ */
/* Normalizer (⭐ make NAMES show instead of IDs)                      */
/* ------------------------------------------------------------------ */
const truthyFlag = (v: any) =>
  v === true || v === 1 || v === '1' || v === 'true' || v === 'yes';

const pickDisplay = (name?: any, idMaybe?: any, fallback?: any) => {
  const n = name ?? null;
  if (n !== null && n !== undefined && String(n).trim() !== '') return String(n);
  const id = idMaybe ?? fallback;
  return id != null ? String(id) : null;
};

const normalize = (f: Followup) => {
  const isPreSales =
    truthyFlag((f as any).transferred_from_lead) || truthyFlag(f.transferredFromLead) || truthyFlag(f.transferred_from_lead);

  const type = f.followupType || f.followup_type || f.type || null;

  const scheduleDate =
    f.scheduleDate ?? (f as any).schedule_date ?? f.followup_date ?? f.date ?? null;

  const scheduleTime =
    f.scheduleTime ?? (f as any).schedule_time ?? f.followup_time ?? f.time ?? null;

  const createdByDisplay = pickDisplay(f.createdByName, (f as any).created_by, f.createdBy);
  const updatedByDisplay = pickDisplay(f.updatedByName, (f as any).updated_by, f.updatedBy);

  const assignedToDisplay = pickDisplay(
    (f as any).assignedExecutiveName ?? f.assignedExecutiveName,
    (f as any).assigned_to,
    f.assignedExecutive ?? f.assignedTo
  );

  const remarks = f.customRemark ?? f.remark ?? f.notes ?? null;

  return {
    ...f,
    id: String(f.id),
    category: isPreSales ? 'presales' : 'sales',

    followupType: type ?? null,
    scheduleDate: scheduleDate ?? null,
    scheduleTime: scheduleTime ?? null,

    assignedTo: assignedToDisplay ?? null,
    createdBy: createdByDisplay ?? null,
    updatedBy: updatedByDisplay ?? null,

    customRemark: remarks,

    createdAt: f.createdAt ?? (f as any).created_at ?? null,
    updatedAt: f.updatedAt ?? (f as any).updated_at ?? null,

    nextAction: f.nextAction ?? (f as any).next_action ?? null,
    transferredAt: f.transferredAt ?? null,
  } as Followup;
};

/* ------------------------------------------------------------------ */
/* Sorting: latest first                                              */
/* ------------------------------------------------------------------ */
const toDateTime = (dateStr?: string | null, timeStr?: string | null) => {
  if (!dateStr && !timeStr) return null;

  const dStr = (dateStr ?? '').trim();
  if (dStr && /\d{4}-\d{2}-\d{2}T/.test(dStr)) {
    return parseSqlish(dStr);
  }

  const tRaw = (timeStr ?? '').trim();
  const t = tRaw ? (tRaw.length === 5 ? `${tRaw}:00` : tRaw) : '00:00:00';
  const dtStr = dStr ? `${dStr} ${t}` : t;
  return parseSqlish(dtStr);
};

const followupTimestamp = (f: Followup): number => {
  const dt1 = toDateTime(
    (f as any).followup_date || f.date || null,
    (f as any).followup_time || f.time || null
  );
  if (dt1) return dt1.getTime();

  const dt2 = toDateTime(
    (f as any).schedule_date || f.scheduleDate || null,
    (f as any).schedule_time || f.scheduleTime || null
  );
  if (dt2) return dt2.getTime();

  const upd = parseSqlish(f.updatedAt || (f as any).updated_at || null);
  if (upd) return upd.getTime();
  const cre = parseSqlish(f.createdAt || (f as any).created_at || null);
  if (cre) return cre.getTime();

  return 0;
};

/* ------------------------------------------------------------------ */
/* Chips for seller fields                                            */
/* ------------------------------------------------------------------ */
const FieldChips: React.FC<{ f: Followup }> = ({ f }) => {
  const cfg = getFieldConfig();
  type Key = keyof ReturnType<typeof getFieldConfig>;
  const keys: Key[] = Object.keys(cfg) as Key[];

  const sorted = keys.sort((a, b) => cfg[a].priority - cfg[b].priority);

  const chips = sorted
    .map((k) => {
      let value: any = (f as any)[k];

      if (k === 'scheduleDate' && value) {
        const d = parseSqlish(value);
        value = d ? fmtDateDDMMYYYY(d) : value;
      }
      if ((k === 'createdAt' || k === 'updatedAt' || k === 'transferredAt') && value) {
        value = fmtDateTimeHuman(value);
      }

      if (!value || String(value).trim() === '') return null;
      const Icon = cfg[k].icon;
      return (
        <span
          key={k}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${cfg[k].color}`}
          title={cfg[k].label}
        >
          <Icon size={12} />
          <span>{cfg[k].label}:</span>
          <span className="font-semibold break-words">{String(value)}</span>
        </span>
      );
    })
    .filter(Boolean);

  if (chips.length === 0) return null;
  return <div className="mt-2 grid grid-cols-2 gap-2">{chips}</div>;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
interface SellerFollowupsTabProps {
  followups: Followup[];
  onAddFollowup: () => void;
  onEditFollowup: (f: Followup) => void;
  onDeleteFollowup: (f: Followup) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const SellerFollowupsTab: React.FC<SellerFollowupsTabProps> = ({
  followups,
  onAddFollowup,
  onEditFollowup,
  onDeleteFollowup,
  canCreate = true,
  canUpdate = true,
  canDelete = true
}) => {
  const [activeTab, setActiveTab] = React.useState<'sales' | 'presales'>('sales');

  React.useEffect(() => { }, [followups]);

  const normalizedFollowups = React.useMemo(
    () => (followups || []).map(normalize),
    [followups]
  );

  React.useEffect(() => { }, [normalizedFollowups]);

  const sortedFollowups = React.useMemo(
    () => [...normalizedFollowups].sort((a, b) => followupTimestamp(b) - followupTimestamp(a)),
    [normalizedFollowups]
  );

  const salesCount = sortedFollowups.filter((f) => f.category === 'sales').length;
  const presalesCount = sortedFollowups.filter((f) => f.category === 'presales').length;

  const filteredFollowups = sortedFollowups.filter((f) => f.category === activeTab);

  React.useEffect(() => { }, [activeTab, filteredFollowups]);

  const cardBorder = (p?: string | null) => {
    const cfg = getPriorityConfig();
    const slug = toSlug(p);
    const meta =
      (cfg as any)[slug] ||
      (slug === 'high' && (cfg as any).high_legacy) ||
      (slug === 'medium' && (cfg as any).medium_legacy) ||
      (slug === 'low' && (cfg as any).low_legacy) ||
      null;
    return meta ? `${meta.border} ${meta.bg}` : 'border-l-gray-400 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${activeTab === 'sales' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Seller Follow-ups {salesCount > 0 && `(${salesCount})`}
          </button>
          <button
            onClick={() => setActiveTab('presales')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${activeTab === 'presales' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Pre-Sales (Seller History) {presalesCount > 0 && `(${presalesCount})`}
          </button>
        </div>

        <button
          onClick={() => {
            if (!canCreate) {
              toast.error('You do not have permission to create seller follow-ups');
              return;
            }
            onAddFollowup();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${canCreate ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          title={!canCreate ? 'No permission to create follow-ups' : 'Add Seller Follow-up'}
        >
          <Plus size={16} />
          <span>Add Seller Follow-up</span>
        </button>
      </div>

      {filteredFollowups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredFollowups.map((f, i) => {
            const idKey = (f.id ?? `f-${i}-${toSlug(f.followupType || f.type || 'followup')}`).toString();
            return (
              <div key={idKey} className="h-full">
                <div
                  className={`h-full bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow border-l-4 ${cardBorder(f.priority ?? undefined)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {typeIcon(f.followupType || f.followup_type || f.type || undefined)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* title + status/priority */}
                      <div className="flex flex-wrap items-center gap-2">
                        {f.category === 'presales' && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 font-medium">
                            Pre-Sales History
                          </span>
                        )}
                        {f.category === 'sales' && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 font-medium">
                            Sales History
                          </span>
                        )}
                        {statusBadge(f.status ?? undefined)}
                        {priorityBadge(f.priority ?? undefined)}
                      </div>

                      {/* SELLER chips */}
                      <FieldChips f={f} />

                      {/* Optional: human time under chips */}
                      {f.scheduleDate && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">When:</span>{' '}
                          {fmtDateTimeHuman(f.scheduleDate) || fmtDateDDMMYYYY(parseSqlish(f.scheduleDate) as Date)}
                          {f.scheduleTime ? ` • ${fmtTime12h(f.scheduleTime)}` : ''}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => {
                          if (!canUpdate) {
                            toast.error('You do not have permission to edit follow-ups');
                            return;
                          }
                          onEditFollowup(f);
                        }}
                        disabled={!canUpdate || f.category === 'presales'}
                        className="p-2 rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                        title={f.category === 'presales' ? 'Pre-sales history cannot be edited' : (!canUpdate ? 'No permission' : 'Edit seller follow-up')}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (!canDelete) {
                            toast.error('You do not have permission to delete follow-ups');
                            return;
                          }
                          onDeleteFollowup(f);
                        }}
                        disabled={!canDelete || f.category === 'presales'}
                        className="p-2 rounded hover:bg-rose-50 text-rose-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                        title={f.category === 'presales' ? 'Pre-sales history cannot be deleted' : (!canDelete ? 'No permission' : 'Delete seller follow-up')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab === 'sales' ? 'Seller' : 'Pre-Sales (Seller)'} follow-ups yet
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'sales'
              ? 'Plan your first seller follow-up for this seller'
              : 'This section shows seller follow-ups transferred from the lead stage.'}
          </p>
          {activeTab === 'sales' && (
            <button
              onClick={() => {
                if (!canCreate) {
                  toast.error('You do not have permission to create seller follow-ups');
                  return;
                }
                onAddFollowup();
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${canCreate ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Add Seller Follow-up
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* SellerViewPage                                                     */
/* ------------------------------------------------------------------ */
export interface SellerViewPageProps {
  seller?: AnyObj;
  onBack?: () => void;
  onEdit?: (seller?: AnyObj) => void;
  onAccount?: (sellerId?: string | number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalSellers?: number;
  onUpdateSeller?: (s: AnyObj) => void;
  sellerId?: string | number;
}

const SellerViewPage: React.FC<SellerViewPageProps> = ({
  seller = {},
  onBack = () => { },
  onEdit = (..._args: any[]) => { },
  onAccount = (..._args: any[]) => { },
  onNext = () => { },
  onPrevious = () => { },
  currentIndex = 0,
  totalSellers = 1,
  onUpdateSeller = () => { },
  sellerId,
}) => {
  // ---- Auth & permissions
  const { user } = useAuth() as { user: any | null };

  // seller edit permission
  const canUpdateSeller = can(user, 'seller.update');

  // followup permissions
  const canViewFollowups = can(user, 'followup.read');
  const canCreateFollowups = can(user, 'followup.create');
  const canUpdateFollowups = can(user, 'followup.update');
  const canDeleteFollowups = can(user, 'followup.delete');

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showStageUpdateModal, setShowStageUpdateModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);

  const [fuLoading, setFuLoading] = useState(false);
  const [fuError, setFuError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon, count: null },
    { id: 'details', label: 'Details', icon: FileText, count: null },
    { id: 'buyers', label: 'Buyers', icon: Users, count: (seller as any).interestedBuyers || 0 },
    { id: 'activities', label: 'Activities', icon: Activity, count: (seller as any).activities?.length || 0 },
    { id: 'followups', label: 'Follow-ups', icon: CalendarIcon, count: ((seller as any).followups as Followup[] | undefined)?.length || 0 },
    { id: 'documents', label: 'Documents', icon: FileText, count: (seller as any).documents?.length || 0 },
    { id: 'visits', label: 'Visits', icon: Eye, count: (seller as any).visits || 0 },
    { id: 'deal', label: 'Deal', icon: Target, count: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null }
  ];

  const sellerStages = [
    { id: 'initial_contact', label: 'Initial Contact', progress: 10, color: 'blue' },
    { id: 'property_collection', label: 'Property Collection', progress: 25, color: 'purple' },
    { id: 'mandate_discussion', label: 'Mandate Discussion', progress: 40, color: 'orange' },
    { id: 'mandate_signed', label: 'Mandate Signed', progress: 60, color: 'green' },
    { id: 'selling_process', label: 'Selling Process', progress: 75, color: 'indigo' },
    { id: 'deal_negotiation', label: 'Deal Negotiation', progress: 85, color: 'yellow' },
    { id: 'deal_closure', label: 'Deal Closure', progress: 95, color: 'pink' },
    { id: 'completed', label: 'Completed', progress: 100, color: 'emerald' }
  ];

  const currentStage = sellerStages.find(stage => stage.id === (seller as any).stage) || sellerStages[0];

  // ----------------------- API: helpers & mapping -----------------------
  const sellerIdVal: string | number | undefined =
    sellerId ?? (seller as any)?.id ?? (seller as any)?.sellerId ?? undefined;

  const ensureTime = (t?: string) => {
    if (!t) return undefined;
    const [hh = '00', mm = '00', ss = '00'] = t.split(':');
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const normalizeFromApi = (row: any): Followup => {
    const id = row?.id ?? row?.followup_id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const followupType = row?.followup_type ?? row?.followupType;
    const sellerLeadStatus = row?.seller_lead_status ?? row?.sellerLeadStatus ?? row?.status;

    const createdByName = row?.created_by_name ?? row?.createdByName ?? null;
    const updatedByName = row?.updated_by_name ?? row?.updatedByName ?? null;
    const assignedExecutiveName =
      row?.assigned_executive_name ?? row?.assignedExecutiveName ?? null;
    const assignedToName =
      row?.assigned_to_name ?? row?.assignedToName ?? null;
    const transferredByName =
      row?.transferred_by_name ?? row?.transferredByName ?? null;

    const assignedExec = row?.assigned_executive ?? row?.assignedExecutive ?? row?.assigned_to;

    return {
      id: String(id),
      seller_id: row?.seller_id ?? row?.sellerId,
      followup_date: row?.schedule_date ?? row?.followup_date ?? row?.scheduleDate ?? undefined,
      followup_time: ensureTime(row?.schedule_time ?? row?.followup_time ?? row?.scheduleTime ?? undefined),
      followup_type: followupType,
      status: sellerLeadStatus,
      priority: row?.priority ?? '',
      notes: row?.custom_remark ?? row?.customRemark ?? row?.remark ?? row?.notes ?? undefined,
      next_action: row?.next_action ?? row?.nextAction ?? undefined,
      assigned_to: assignedExec,
      reminder: Number(row?.reminder ?? 0) as 0 | 1,

      created_at: row?.created_at ?? row?.createdAt,
      updated_at: row?.updated_at ?? row?.updatedAt,
      created_by: row?.created_by ?? row?.createdBy,
      updated_by: row?.updated_by ?? row?.updatedBy,

      createdByName,
      updatedByName,
      assignedExecutiveName,

      transferred_from_lead:
        row?.transferred_from_lead === true ||
        row?.transferred_from_lead === 1 ||
        row?.transferredFromLead === true ||
        row?.transferredFromLead === 1 ||
        false,

      category:
        (row?.transferred_from_lead || row?.transferredFromLead) ? 'presales' : 'sales',
    };
  };

  const pushFollowupsIntoSeller = useCallback((rows: any[]) => {
    const mapped = (rows || []).map(normalizeFromApi);
    const updatedSeller: AnyObj = { ...(seller as AnyObj), followups: mapped };
    onUpdateSeller(updatedSeller);
  }, [seller, onUpdateSeller]);

  const fetchFollowups = useCallback(async () => {
    if (!sellerIdVal) return;
    try {
      setFuError(null);
      setFuLoading(true);
      const res = await sellerFollowupAPI.getAll({
        sellerId: sellerIdVal as any,
        page: 1,
        limit: 200
      });
      const rows = (res && typeof res === 'object' && 'data' in res) ? res.data : res;

      pushFollowupsIntoSeller(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.error("Failed to load seller followups:", e);
      setFuError(e?.message || "Failed to load follow-ups");
      pushFollowupsIntoSeller([]);
    } finally {
      setFuLoading(false);
    }
  }, [sellerIdVal, pushFollowupsIntoSeller]);

  useEffect(() => {
    if (sellerId) {
      fetchFollowups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  // ----------------------- Stage, Activity, Visit, Property --------------
  const mapPropertyToInitialData = (property: AnyObj | null) => {
    if (!property) return null;

    const mappedPhotos = Array.isArray(property.photos)
      ? property.photos
        .map((p: any, idx: number) => {
          if (!p) return null;
          if (typeof p === 'string') return { id: `${property.id ?? 'p'}-${idx}`, url: p, name: `photo-${idx + 1}` };
          return { id: p.id ?? `${property.id ?? 'p'}-${idx}`, url: p.url ?? p.path ?? '', name: p.name ?? `photo-${idx + 1}` };
        })
        .filter(Boolean)
      : Array.isArray(property.photoUrls)
        ? property.photoUrls.map((u: string, idx: number) => ({ id: `${property.id ?? 'p'}-${idx}`, url: u, name: `photo-${idx + 1}` }))
        : [];

    const mappedNearby = Array.isArray(property.nearby_places)
      ? property.nearby_places.map((n: any) => ({
        name: n.name ?? n.place ?? '',
        type: n.type ?? n.category ?? '',
        distance: n.distance ?? '',
        unit: n.unit ?? ''
      }))
      : [];

    return {
      id: property.id ?? property._id,
      salutation: property.salutation ?? property.ownerSalutation ?? 'Mr',
      ownerName: property.ownerName ?? property.owner_name ?? property.contactName ?? property.seller_name ?? '',
      ownerPhone: property.ownerPhone ?? property.owner_phone ?? property.contactPhone ?? property.phone ?? '',
      ownerWhatsapp: property.ownerWhatsapp ?? property.owner_whatsapp ?? property.contactWhatsapp ?? '',
      sameAsPhone: !!(
        (property.ownerWhatsapp && property.ownerPhone && property.ownerWhatsapp === property.ownerPhone) ||
        (property.ownerWhatsapp && property.ownerWhatsapp === property.phone)
      ),
      ownerEmail: property.ownerEmail ?? property.owner_email ?? property.contactEmail ?? property.email ?? '',
      ownerType: property.ownerType ?? property.owner_type ?? 'individual',
      seller: property.seller ?? property.seller_name ?? `${safeString((seller as any)?.salutation ? (seller as any).salutation + ' ' : '')}${safeString((seller as any)?.name)}`,
      propertyType: property.propertyType ?? property.type ?? property.property_type_name ?? '',
      propertySubtype: property.propertySubtype ?? property.subtype ?? property.property_subtype_name ?? '',
      unitType: property.unitType ?? property.unit_type ?? safeString(property.unit_type_name) ?? '',
      wing: property.wing ?? property.block ?? '',
      unitNo: property.unitNo ?? property.unit_no ?? property.unit ?? '',
      furnishing: property.furnishing ?? '',
      parkingType: property.parkingType ?? property.parking_type ?? '',
      parkingQty: safeNumber(property.parkingQty ?? property.parking_qty),
      city: property.city ?? property.city_name ?? (seller as any)?.city ?? '',
      location: property.location ?? property.location_name ?? '',
      society: property.society ?? property.society_name ?? '',
      floor: property.floor ?? '',
      totalFloors: property.totalFloors ?? property.total_floors ?? '',
      carpetArea: safeNumber(property.carpetArea ?? property.carpet_area ?? property.area),
      builtupArea: safeNumber(property.builtupArea ?? property.builtup_area),
      budget: safeNumber(property.budget ?? property.price ?? property.expectedPrice),
      address: property.address ?? property.displayAddress ?? property.full_address ?? '',
      status: property.status ?? '',
      leadSource: property.leadSource ?? property.lead_source ?? property.source ?? (seller as any)?.source ?? 'Website',
      possessionMonth: property.possessionMonth ?? property.possession_month ?? '',
      possessionYear: property.possessionYear ?? property.possession_year ?? '',
      purchaseMonth: property.purchaseMonth ?? property.purchase_month ?? '',
      purchaseYear: property.purchaseYear ?? property.purchase_year ?? '',
      sellingRights: property.sellingRights ?? property.selling_rights ?? '',
      amenities: ensureArray(property.amenities ?? property.amenities_list ?? []),
      furnishingItems: ensureArray(property.furnishingItems ?? property.furnishing_items ?? []),
      description: property.description ?? property.longDescription ?? property.desc ?? '',
      nearby_places: mappedNearby,
      existingOwnershipDocUrl: property.ownership_doc_path ?? property.ownershipDocUrl ?? '',
      existingOwnershipDocName: property.ownership_doc_name ?? '',
      existingOwnershipDocId: property.ownership_doc_id ?? '',
      existingPhotos: mappedPhotos,
      public_inquiries: property.public_inquiries ?? property.publicInquiries ?? 0,
      public_views: property.public_views ?? property.publicViews ?? 0,
      publication_date: property.publication_date ?? property.publicationDate ?? null
    };
  };

  const openPropertyFormForEdit = (property: AnyObj) => {
    const mapped = mapPropertyToInitialData(property);
    setEditingProperty(mapped);
    setShowPropertyForm(true);
  };

  const openPropertyFormForCreate = () => {
    const prefill = {
      seller: `${(seller as any)?.salutation ? (seller as any).salutation + ' ' : ''}${(seller as any)?.name ?? ''}`,
      city: (seller as any)?.city ?? '',
      location: (seller as any)?.location ?? '',
      leadSource: (seller as any)?.source ?? 'Website'
    };
    setEditingProperty(prefill);
    setShowPropertyForm(true);
  };

  const handleStageUpdate = (newStage: string, remarks: string, nextAction: string) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      stage: newStage,
      stageProgress: sellerStages.find(s => s.id === newStage)?.progress ?? 0,
      lastActivity: new Date().toISOString().split('T')[0],
      activities: [
        ...((seller as AnyObj).activities || []),
        {
          id: Date.now(),
          type: 'stage_update',
          description: `Stage updated to ${sellerStages.find(s => s.id === newStage)?.label ?? newStage}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          stage: newStage,
          outcome: remarks,
          nextAction,
          executedBy: 'Admin User',
          remarks
        }
      ]
    };
    onUpdateSeller(updatedSeller);
    setShowStageUpdateModal(false);
  };

  const handleAddActivity = (activityData: AnyObj) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      activities: [...((seller as AnyObj).activities || []), activityData],
      lastActivity: new Date().toISOString().split('T')[0]
    };
    onUpdateSeller(updatedSeller);
    setShowActivityModal(false);
    setEditingActivity(null);
  };

  // Local upsert helper (just updates parent state)
  const upsertFollowupLocal = (followupData: Followup) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      followups: ((seller as AnyObj).followups as Followup[] | undefined)
        ? ((seller as AnyObj).followups as Followup[]).some((f) => f.id === followupData.id)
          ? ((seller as AnyObj).followups as Followup[]).map((f) => (f.id === followupData.id ? followupData : f))
          : [...(((seller as AnyObj).followups as Followup[])), followupData]
        : [followupData]
    };
    onUpdateSeller(updatedSeller);
  };

  const handleDeleteFollowupLocal = (f: Followup) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      followups: (((seller as AnyObj).followups as Followup[]) || []).filter((x) => x.id !== f.id)
    };
    onUpdateSeller(updatedSeller);
  };

  const handleAddVisit = (visitData: AnyObj) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      visits: ((seller as AnyObj).visits || 0) + 1,
      totalVisits: ((seller as AnyObj).totalVisits || 0) + 1,
      lastActivity: new Date().toISOString().split('T')[0],
      activities: [
        ...((seller as AnyObj).activities || []),
        {
          id: Date.now(),
          type: 'visit',
          description: `Property visit scheduled for ${visitData.property}`,
          date: visitData.date,
          time: visitData.time,
          stage: (seller as AnyObj).stage,
          outcome: visitData.feedback || 'Visit scheduled',
          nextAction: visitData.nextAction || 'Follow up after visit',
          executedBy: 'Admin User',
          remarks: visitData.remarks || ''
        }
      ]
    };
    onUpdateSeller(updatedSeller);
    setShowVisitModal(false);
  };

  const handleAddProperty = (propertyData: AnyObj) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      properties: [...((seller as AnyObj).properties || []), propertyData]
    };
    onUpdateSeller(updatedSeller);
    setShowPropertyForm(false);
    setEditingProperty(null);
  };

  /* ---------- MAP from modal payload -> API + local Followup item ---------- */
  const normalizeToFollowup = (data: SellerFollowupPayload): Followup => {
    const mkId = () => (data.id ? String(data.id) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    return {
      id: mkId(),
      seller_id: data.seller_id ?? ((seller as any)?.id ?? (seller as any)?.sellerId),
      followup_date: data.scheduleDate || undefined,
      followup_time: ensureTime(data.scheduleTime),
      followup_type: data.followupType || undefined,
      status: data.sellerLeadStatus || undefined,
      priority: data.priority || undefined,
      notes: data.customRemark || data.remark || undefined,
      next_action: data.nextAction || undefined,
      assigned_to: data.assigned_executive,
      reminder: (data.reminder as number) ?? 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      updated_by: data.updated_by,
      transferred_from_lead: false,
      category: 'sales',
    };
  };

  // --------------------------- API: Create / Update ---------------------------
  const handleModalSave = async (payload: SellerFollowupPayload) => {
    if (!sellerIdVal) {
      alert("Missing seller id.");
      return;
    }
    if (!canCreateFollowups && !editingFollowup) {
      toast.error('You do not have permission to create follow-ups');
      return;
    }
    if (editingFollowup && !canUpdateFollowups) {
      toast.error('You do not have permission to update follow-ups');
      return;
    }

    try {
      setFuError(null);
      setFuLoading(true);

      const apiPayload = { ...payload, seller_id: payload.seller_id ?? sellerIdVal };

      if (editingFollowup?.id) {
        const res = await sellerFollowupAPI.update(editingFollowup.id, apiPayload);
        const updatedRow = res;
        const normalized = normalizeFromApi(updatedRow ?? apiPayload);
        upsertFollowupLocal(normalized);
      } else {
        const res = await sellerFollowupAPI.create(apiPayload);
        const createdRow = res;
        const normalized = normalizeFromApi(createdRow ?? apiPayload);
        upsertFollowupLocal(normalized);
      }

      setShowFollowupModal(false);
      setEditingFollowup(null);
    } catch (e: any) {
      console.error("Save seller follow-up failed:", e);
      setFuError(e?.message || "Failed to save follow-up");
      alert(e?.message || "Failed to save follow-up");
    } finally {
      setFuLoading(false);
    }
  };

  // ------------------------------ API: Delete --------------------------------
  const handleDeleteFollowup = async (f: Followup) => {
    if (!canDeleteFollowups) {
      toast.error('You do not have permission to delete follow-ups');
      return;
    }
    if (!confirm('Are you sure you want to delete this follow-up?')) return;
    try {
      setFuError(null);
      setFuLoading(true);
      await sellerFollowupAPI.remove(f.id);
      handleDeleteFollowupLocal(f);
      toast.success('Follow-up deleted');
    } catch (e: any) {
      console.error("Delete seller follow-up failed:", e);
      setFuError(e?.message || "Failed to delete follow-up");
      alert(e?.message || "Failed to delete follow-up");
    } finally {
      setFuLoading(false);
    }
  };

  /* ----------------- Tabs Renderers (UI) ----------------- */
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
              {safeString((seller as any).name).charAt(0) || ''}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{(seller as any).salutation} {(seller as any).name}</h2>
              <p className="text-blue-100 text-lg">{(seller as any).location ?? '—'}, {(seller as any).city ?? '—'}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-blue-100">{(seller as any).source ?? '—'} Lead</span>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-300 fill-current" size={16} />
                  <span className="text-white font-medium">{(seller as any).leadScore ?? 0}/100</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{(seller as any).stageProgress ?? 0}%</div>
              <div className="text-blue-100">Progress</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Stage Progress:</span>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium">{currentStage.label}</span>
              <span className="text-sm font-bold text-blue-600">{(seller as any).stageProgress ?? 0}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(seller as any).stageProgress ?? 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Initial Contact</span>
            <span>Completed</span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                <Eye size={16} />
                <span className="text-xl font-bold">{(seller as any).visits ?? 0}</span>
              </div>
              <div className="text-xs text-gray-500">visits</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                <Users size={16} />
                <span className="text-xl font-bold">{(seller as any).interestedBuyers ?? 0}</span>
              </div>
              <div className="text-xs text-gray-500">buyers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                <Building size={16} />
                <span className="text-xl font-bold">{((seller as any).properties || []).length}</span>
              </div>
              <div className="text-xs text-gray-500">properties</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                <Activity size={16} />
                <span className="text-xl font-bold">{((seller as any).activities || []).length}</span>
              </div>
              <div className="text-xs text-gray-500">activities</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            <Camera size={16} />
            <span>Add Photos</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(((seller as any).properties?.[0]?.photos ?? []) as string[]).slice(0, 3).map((photo: string, index: number) => (
            <div key={index} className="relative group">
              <img src={photo} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-all" size={24} />
              </div>
            </div>
          ))}
          <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
            <div className="text-center">
              <Camera className="mx-auto text-gray-400 mb-2" size={24} />
              <span className="text-sm text-gray-500">Add Photo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Type:</div>
                <div className="font-semibold text-gray-900 text-lg">{(seller as any).properties?.[0]?.unit_type || (seller as any).properties?.[0]?.property_type || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Carpet Area:</div>
                <div className="font-semibold text-gray-900 text-lg">{(seller as any).properties?.[0]?.carpet_area ?? '—'} sq ft</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Floor:</div>
                <div className="font-semibold text-gray-900 text-lg">{(seller as any).properties?.[0]?.floor ?? '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Parking:</div>
                <div className="font-semibold text-gray-900 text-lg">
                  {(seller as any).properties?.[0]?.parking_type ? `${(seller as any).properties?.[0]?.parking_qty || ''} ${(seller as any).properties?.[0]?.parking_type}` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{(seller as any).name ?? '—'}</div>
                <div className="text-sm text-gray-600">{(seller as any).phone ?? '—'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail size={14} className="text-gray-400" />
                <span>Email: {(seller as any).email ?? '—'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin size={14} className="text-gray-400" />
                <span>Lead Source: {(seller as any).source ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <div className="text-lg font-semibold text-gray-900">{(seller as any).salutation} {(seller as any).name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <div className="text-lg font-semibold text-gray-900">{(seller as any).phone}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <div className="text-lg font-semibold text-gray-900">{(seller as any).email}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <div className="text-lg font-semibold text-gray-900">{(seller as any).location}, {(seller as any).city}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lead Source</label>
              <div className="text-lg font-semibold text-gray-900">{(seller as any).source}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                  {(seller as any).status ?? 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Properties Portfolio</h3>
          <button
            onClick={openPropertyFormForCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </button>
        </div>

        {(seller as any).properties && (seller as any).properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {((seller as AnyObj).properties as AnyObj[]).map((property: AnyObj, index: number) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <img
                    src={property.photos?.[0] ?? 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={property.title ?? 'property'}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {property.title ?? property.slug ?? (property.unit_type || property.property_subtype_name || 'Untitled')}
                    </h4>
                    <p className="text-sm text-gray-600">{property.address ?? property.location_name ?? property.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-green-600">{property.price ?? property.budget ?? ''}</span>
                      <span className="text-xs text-gray-500">{property.area ?? property.carpet_area ?? ''}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <button
                      onClick={() => openPropertyFormForEdit(property)}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Edit property"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 mb-4">No properties added yet</p>
            <button onClick={openPropertyFormForCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add First Property
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderActivitiesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        <button onClick={() => setShowActivityModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          <span>Add Activity</span>
        </button>
      </div>

      {(seller as any).activities && (seller as any).activities.length > 0 ? (
        <div className="space-y-4">
          {((seller as AnyObj).activities as AnyObj[]).map((activity: any, index: number) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="text-blue-600" size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{activity.description}</h4>
                    <span className="text-sm text-gray-500">{activity.date}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>Stage: {activity.stage}</div>
                    <div>Duration: {activity.duration}</div>
                    <div>By: {activity.executedBy}</div>
                  </div>
                  {activity.outcome && <div className="mt-2 text-sm text-gray-700"><span className="font-medium">Outcome:</span> {activity.outcome}</div>}
                  {activity.nextAction && <div className="text-sm text-blue-600"><span className="font-medium">Next:</span> {activity.nextAction}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Activity className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities recorded</h3>
          <p className="text-gray-500 mb-4">Start tracking seller interactions</p>
          <button onClick={() => setShowActivityModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add First Activity</button>
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={16} />
          <span>Create Document</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Document Workflow</h4>
        <div className="space-y-4">
          {[
            { stage: 'creation', label: 'Document Creation', status: 'completed', icon: FileText },
            { stage: 'sharing', label: 'Sharing with Seller', status: 'completed', icon: Send },
            { stage: 'otp', label: 'OTP Verification', status: 'pending', icon: Shield },
            { stage: 'esign', label: 'E-Signature', status: 'pending', icon: Award },
            { stage: 'completion', label: 'Document Completion', status: 'pending', icon: CheckCircle }
          ].map((step, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${step.status === 'completed' ? 'bg-green-100' : step.status === 'pending' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                <step.icon className={step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-600'} size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{step.label}</div>
                <div className={`text-sm ${step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-500'}`}>
                  {step.status === 'completed' ? 'Completed' : step.status === 'pending' ? 'Pending' : 'Not Started'}
                </div>
              </div>
              {step.status === 'pending' && (
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  {step.stage === 'otp' ? 'Send OTP' : step.stage === 'esign' ? 'Initiate E-Sign' : 'Process'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {(seller as any).documents && (seller as any).documents.length > 0 ? (
        <div className="space-y-4">
          {((seller as AnyObj).documents as AnyObj[]).map((doc: any, index: number) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-600" size={20} />
                  <div>
                    <div className="font-semibold text-gray-900">{doc.name}</div>
                    <div className="text-sm text-gray-600">{doc.category} • {doc.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'completed' ? 'bg-green-100 text-green-700' : doc.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                    {doc.status}
                  </span>
                  <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents created</h3>
          <p className="text-gray-500">Create documents for this seller</p>
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Response Rate</p>
              <p className="text-2xl font-bold">{(seller as any).responseRate ?? '—'}%</p>
            </div>
            <TrendingUp size={24} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Deal Potential</p>
              <p className="text-2xl font-bold capitalize">{(seller as any).dealPotential ?? '—'}</p>
            </div>
            <Target size={24} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Response</p>
              <p className="text-2xl font-bold">{(seller as any).avgResponseTime ?? '—'}</p>
            </div>
            <Clock size={24} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Visits</p>
              <p className="text-2xl font-bold">{(seller as any).totalVisits ?? 0}</p>
            </div>
            <Eye size={24} className="text-orange-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Progress</h3>
        <div className="space-y-3">
          {sellerStages.map((stage, index) => (
            <div key={stage.id} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(seller as any).stage === stage.id ? 'bg-blue-500 text-white' : sellerStages.findIndex(s => s.id === (seller as any).stage) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {sellerStages.findIndex(s => s.id === (seller as any).stage) > index ? <CheckCircle size={16} /> : index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{stage.label}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: (seller as any).stage === stage.id ? `${(seller as any).stageProgress ?? 0}%` : sellerStages.findIndex(s => s.id === (seller as any).stage) > index ? '100%' : '0%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 text-xs">
      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {safeString((seller as any).name).charAt(0) || ''}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{(seller as any).salutation} {(seller as any).name}</h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>{(seller as any).location ?? '—'}, {(seller as any).city ?? '—'}</span>
                  <span>•</span>
                  <span>{(seller as any).source ?? '—'} Lead</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{currentIndex + 1} of {totalSellers}</span>
              <div className="flex space-x-1">
                <button onClick={onPrevious} disabled={currentIndex === 0} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                <button onClick={onNext} disabled={currentIndex === totalSellers - 1} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={() => window.open(`tel:${((seller as any).phone || '').replace(/\D/g, '')}`)}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="Call"
            >
              <Phone size={20} />
            </button>

            <button
              onClick={() => {
                const message = `Hi ${(seller as any).name}, this is regarding your property inquiry. How can I assist you today?`;
                window.open(`https://wa.me/${((seller as any).phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle size={20} />
            </button>

            <button
              onClick={() => {
                const subject = `Regarding Your Property - ${(seller as any).name}`;
                const body = `Dear ${(seller as any).name},\n\nI hope this email finds you well. I wanted to follow up regarding your property inquiry.\n\nBest regards,\nResaleExpert Team`;
                window.open(`mailto:${(seller as any).email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
              }}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="Email"
            >
              <Mail size={20} />
            </button>

            <button
              onClick={() => {
                if (!canUpdateSeller) {
                  toast.error('You do not have permission to edit seller');
                  return;
                }
                onEdit(seller);
              }}
              className={`p-2 rounded-lg ${canUpdateSeller ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              title={!canUpdateSeller ? 'No permission to edit' : 'Edit'}
              disabled={!canUpdateSeller}
            >
              <Edit size={20} />
            </button>
          </div>
        </div>

        {(fuLoading || fuError) && (
          <div className="mt-3 text-xs">
            {fuLoading && <span className="text-blue-600">Syncing follow-ups…</span>}
            {fuError && <span className="text-rose-600">• {fuError}</span>}
          </div>
        )}

        {/* TABS */}
        <div className="mt-4">
          <nav className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-200' : 'bg-gray-200'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'activities' && renderActivitiesTab()}

        {activeTab === 'followups' && (
          <>
            {!canViewFollowups ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-600">You do not have permission to view follow-ups.</p>
              </div>
            ) : (
              <SellerFollowupsTab
                followups={(((seller as any).followups as Followup[]) || [])}
                onAddFollowup={() => {
                  if (!canCreateFollowups) {
                    toast.error('You do not have permission to create follow-ups');
                    return;
                  }
                  setEditingFollowup(null);
                  setShowFollowupModal(true);
                }}
                onEditFollowup={(f) => {
                  if (!canUpdateFollowups) {
                    toast.error('You do not have permission to edit follow-ups');
                    return;
                  }
                  setEditingFollowup(f);
                  setShowFollowupModal(true);
                }}
                onDeleteFollowup={handleDeleteFollowup}
                canCreate={canCreateFollowups}
                canUpdate={canUpdateFollowups}
                canDelete={canDeleteFollowups}
              />
            )}
          </>
        )}

        {activeTab === 'documents' && renderDocumentsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowStageUpdateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <TrendingUp size={16} />
              <span>Update Stage</span>
            </button>
            <button onClick={() => setShowSharingModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Share size={16} />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Eye size={16} />
              <span>Track</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (!canCreateFollowups) {
                  toast.error('You do not have permission to create follow-ups');
                  return;
                }
                setShowFollowupModal(true);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${canCreateFollowups ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <CalendarIcon size={16} />
              <span>Follow-ups</span>
            </button>
            <button onClick={() => { setEditingActivity(null); setShowActivityModal(true); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              <span>Add Activity</span>
            </button>
            <button onClick={() => setShowVisitModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <CalendarIcon size={16} />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showStageUpdateModal && (
        <SellerStageUpdateModal isOpen={showStageUpdateModal} onClose={() => setShowStageUpdateModal(false)} seller={seller} onUpdateStage={handleStageUpdate} />
      )}

      {showSharingModal && (
        <SellerSharingModal isOpen={showSharingModal} onClose={() => setShowSharingModal(false)} seller={seller} onShare={() => setShowSharingModal(false)} />
      )}

      {showFollowupModal && (
        <SellerFollowupModal
          isOpen={showFollowupModal}
          onClose={() => { setShowFollowupModal(false); setEditingFollowup(null); }}
          onSave={handleModalSave}
          tabId="seller"
          sellerId={(seller as any)?.id ?? (seller as any)?.sellerId ?? ''}
          initialForm={
            editingFollowup
              ? {
                id: String(editingFollowup.id),
                created_by: (editingFollowup as any).created_by,
                created_at: editingFollowup.created_at,

                followupType: editingFollowup.followup_type ?? "Phone Call",
                followup_type: editingFollowup.followup_type ?? "Phone Call",

                sellerLeadStatus: editingFollowup.status ?? "",
                seller_lead_status: editingFollowup.status ?? "",

                sellerLeadStage: (seller as any)?.stage_label ?? (seller as any)?.stage ?? "",
                seller_lead_stage: (seller as any)?.stage_label ?? (seller as any)?.stage ?? "",

                remark: editingFollowup.notes ?? "",
                customRemark: editingFollowup.notes ?? "",
                custom_remark: editingFollowup.notes ?? "",

                nextAction: editingFollowup.next_action ?? "",
                next_action: editingFollowup.next_action ?? "",

                scheduleDate: editingFollowup.followup_date ?? "",
                schedule_date: editingFollowup.followup_date ?? "",

                scheduleTime: editingFollowup.followup_time?.slice(0, 5) ?? "",
                schedule_time: editingFollowup.followup_time?.slice(0, 5) ?? "",

                priority: editingFollowup.priority ?? "",
              }
              : undefined
          }
        />
      )}

      {showActivityModal && (
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => { setShowActivityModal(false); setEditingActivity(null); }}
          activity={editingActivity}
          onSave={handleAddActivity}
        />
      )}

      {showVisitModal && (
        <VisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          visit={null}
          onSave={handleAddVisit}
          buyer={{ id: (seller as any).id ?? '', name: (seller as any).name ?? '' }}
        />
      )}

      {showPropertyForm && (
        <PropertyFormModal
          isOpen={showPropertyForm}
          onClose={() => { setShowPropertyForm(false); setEditingProperty(null); }}
          onSubmit={handleAddProperty}
          mode={editingProperty && (editingProperty as any).id ? 'edit' : 'create'}
          propertyId={(editingProperty as any)?.id}
          initialData={editingProperty ?? { seller: `${(seller as any)?.salutation ?? ''} ${(seller as any)?.name ?? ''}` }}
        />
      )}
    </div>
  );
};

function safeNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export default SellerViewPage;

function ensureArray(value: any): any[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
  return [value];
}
