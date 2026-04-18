// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Calendar, MapPin, Clock, Edit, Trash2, Plus, User, RefreshCw, Mail, CheckCircle2, XCircle, Star, TrendingUp, Phone,
// } from 'lucide-react';
// import { visitsAPI } from '@/lib/visitsAPI';

// interface VisitScheduleTabProps {
//   buyer: any;
//   onAddVisit: () => void;
//   onEditVisit: (visit: any) => void;
//   onDeleteVisit: (visitId: string | number) => void;
//   resolveExecutiveName?: (id?: string | number | null) => string | undefined;
  
// }

// /* ---------- Helpers (compact-friendly) ---------- */
// const toWhen = (v: any): Date | null => {
//   const iso = v?.visit_datetime ?? v?.revisit_datetime ?? v?.date;
//   if (iso) {
//     const d = new Date(iso);
//     if (!isNaN(+d)) return d;
//   }
//   const d2 = v?.visit_date ?? v?.revisit_date;
//   const t2 = v?.visit_time ?? v?.time ?? v?.revisit_time;
//   if (d2) {
//     const d = new Date(d2);
//     if (!isNaN(+d)) {
//       if (t2) {
//         const [hh = '00', mm = '00', ss = '00'] = String(t2).split(':');
//         d.setHours(Number(hh), Number(mm), Number(ss) || 0, 0);
//       }
//       return d;
//     }
//   }
//   return null;
// };

// const fmtDate = (d: Date | null) =>
//   d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

// const fmtTime = (d: Date | null) =>
//   d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-';

// const fmtStamp = (val?: string | null) => {
//   if (!val) return '-';
//   const d = new Date(val);
//   if (isNaN(+d)) return '-';
//   return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${d
//     .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
// };

// const getVisitStatus = (visit: any) => {
//   const now = new Date();
//   const when = toWhen(visit);
//   if (visit?.status === 'cancelled') return 'cancelled';
//   if (['completed', 'done'].includes(visit?.status)) return 'completed';
//   if (when) {
//     if (when.getTime() < now.getTime()) return 'completed';
//     const sameDay = when.toDateString() === now.toDateString();
//     if (sameDay) return 'today';
//   }
//   return 'scheduled';
// };

// const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
//   const styles: Record<string, string> = {
//     scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
//     today: 'bg-green-50 text-green-700 border-green-200',
//     completed: 'bg-gray-50 text-gray-600 border-gray-200',
//     cancelled: 'bg-red-50 text-red-700 border-red-200',
//   };
//   const labels: Record<string, string> = { scheduled: 'Scheduled', today: 'Today', completed: 'Completed', cancelled: 'Cancelled' };
//   return (
//     <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${styles[status] || styles.scheduled}`}>
//       {labels[status] || 'Scheduled'}
//     </span>
//   );
// };

// const PillList: React.FC<{ items?: any }> = ({ items }) => {
//   let arr: string[] = [];
//   if (Array.isArray(items)) arr = items.map(String);
//   else if (items && typeof items === 'string') {
//     try {
//       const parsed = JSON.parse(items);
//       arr = Array.isArray(parsed) ? parsed : [items];
//     } catch {
//       arr = [items];
//     }
//   }
//   if (!arr.length) return null;
//   return (
//     <div className="flex flex-wrap gap-1">
//       {arr.map((val, idx) => (
//         <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-100">
//           {val}
//         </span>
//       ))}
//     </div>
//   );
// };

// const asBool = (v: any): boolean | undefined => {
//   if (v === null || v === undefined) return undefined;
//   if (typeof v === 'boolean') return v;
//   if (typeof v === 'number') return v === 1;
//   if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
//   return undefined;
// };

// const toTitle = (s?: string) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

// const getExecutiveDisplay = (visitLike: any, resolver?: (id?: string | number | null) => string | undefined) => {
//   const fromPayload =
//     visitLike?.executive_full_name ||
//     visitLike?.executive_name ||
//     visitLike?.assigned_to_name ||
//     visitLike?.executive;
//   if (fromPayload) return String(fromPayload);
//   const id = visitLike?.executive_id ?? visitLike?.assigned_to;
//   if (id == null) return '';
//   const viaResolver = resolver?.(id);
//   return viaResolver || `Executive #${id}`;
// };

// /* Fallback-friendly getters */
// const getBuyer = (v: any) => ({
//   name: v?.buyer_full_name ?? v?.buyer_name ?? v?.buyer,
//   email: v?.buyer_email,
//   phone: v?.buyer_phone ?? v?.buyer_mobile ?? v?.buyer_contact,
// });
// const getSeller = (v: any) => ({
//   name: v?.seller_full_name ?? v?.seller_name,
//   email: v?.seller_email,
//   phone: v?.seller_phone,
// });
// const getExecutive = (v: any) => ({
//   name: v?.executive_full_name ?? v?.executive_name,
//   email: v?.executive_email,
//   phone: v?.executive_phone,
// });

// /* Compact contact row */
// const ContactCard: React.FC<{
//   tone: 'blue' | 'green' | 'violet';
//   title: string;
//   name?: string;
//   phone?: string;
//   email?: string;
//   extra?: React.ReactNode;
// }> = ({ tone, title, name, phone, email, extra }) => {
//   const toneMap = {
//     blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
//     green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', icon: 'text-green-600' },
//     violet: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', icon: 'text-violet-600' },
//   }[tone];

//   if (!name && !phone && !email && !extra) return null;

//   return (
//     <div className={`flex items-start gap-2 p-2 rounded-lg border ${toneMap.bg} ${toneMap.border}`}>
//       <User size={16} className={`${toneMap.icon} mt-0.5`} />
//       <div className="flex-1 min-w-0">
//         <div className={`text-[10px] font-medium mb-0.5 ${toneMap.text}`}>{title}</div>
//         {name && <div className="font-medium text-gray-900 truncate text-sm">{name}</div>}
//         {(phone || email) && (
//           <div className="mt-0.5 flex items-center gap-2 text-[12px] text-gray-600 flex-wrap">
//             {phone && (
//               <a href={`tel:${phone}`} className="inline-flex items-center gap-1 hover:underline">
//                 <Phone size={12} />
//                 <span className="truncate">{phone}</span>
//               </a>
//             )}
//             {email && (
//               <a href={`mailto:${email}`} className="inline-flex items-center gap-1 hover:underline">
//                 <Mail size={12} />
//                 <span className="truncate">{email}</span>
//               </a>
//             )}
//           </div>
//         )}
//         {extra}
//       </div>
//     </div>
//   );
// };

// /* ---------- Component ---------- */
// const VisitScheduleTab: React.FC<VisitScheduleTabProps> = ({
//   buyer,
//   onAddVisit,
//   onEditVisit,
//   onDeleteVisit,
//   resolveExecutiveName,
// }) => {
//   const [activeTab, setActiveTab] = useState<'visits' | 'revisits'>('visits');
//   const buyerId = buyer?.buyer_id ?? buyer?.id;

//   const [visits, setVisits] = useState<any[]>([]);
//   const [loadingVisits, setLoadingVisits] = useState(false);
//   const [visitsError, setVisitsError] = useState<string | null>(null);

//   const [revisits, setRevisits] = useState<any[]>([]);
//   const [loadingRevisits, setLoadingRevisits] = useState(false);

//   const loadVisits = async () => {
//     if (!buyerId) return;
//     setLoadingVisits(true);
//     setVisitsError(null);
//     try {
//       const res = await visitsAPI.getAllVisits({ buyer_id: buyerId, page: 1, limit: 50 });
//       const list = res?.data ?? res?.rows ?? [];
//       setVisits(list);
//     } catch (e: any) {
//       setVisitsError(e?.message || 'Failed to load visits');
//     } finally {
//       setLoadingVisits(false);
//     }
//   };

//   const loadRevisits = async () => {
//     if (!visits.length) {
//       setRevisits([]);
//       return;
//     }
//     setLoadingRevisits(true);
//     try {
//       const all: any[] = [];
//       await Promise.all(
//         visits.map(async (v: any) => {
//           try {
//             const res = await visitsAPI.getRevisitsByVisit(v.id);
//             const rows = res?.data ?? res?.rows ?? [];
//             rows.forEach((r: any) => {
//               r.property_title = r.property_title || v.property_title;
//               r.visit_id = r.visit_id || v.id;
//               // propagate details
//               r.seller_full_name = r.seller_full_name || v.seller_full_name || v.seller_name;
//               r.seller_phone = r.seller_phone || v.seller_phone;
//               r.executive_full_name = r.executive_full_name || v.executive_full_name || v.executive_name;
//               r.executive_phone = r.executive_phone || v.executive_phone;
//               r.buyer_full_name = r.buyer_full_name || v.buyer_full_name || v.buyer_name;
//               r.buyer_phone = r.buyer_phone || v.buyer_phone;
//             });
//             all.push(...rows);
//           } catch {}
//         })
//       );
//       setRevisits(all.sort((a, b) => (toWhen(b)?.getTime() ?? 0) - (toWhen(a)?.getTime() ?? 0)));
//     } catch (e: any) {
//       console.error(e);
//     } finally {
//       setLoadingRevisits(false);
//     }
//   };

//   useEffect(() => {
//     if (buyerId) loadVisits();
//     else {
//       setVisits([]);
//       setRevisits([]);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [buyerId]);

//   useEffect(() => {
//     loadRevisits();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [visits]);

//   const stats = useMemo(() => {
//     const s = { total: visits.length, completed: 0, upcoming: 0, today: 0 };
//     visits.forEach((v) => {
//       const st = getVisitStatus(v);
//       if (st === 'completed') s.completed++;
//       else if (st === 'today') s.today++;
//       else s.upcoming++;
//     });
//     return s;
//   }, [visits]);

//   if (!buyerId) {
//     return (
//       <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
//         <p className="text-red-700">⚠️ Cannot load visits: buyer ID is missing.</p>
//       </div>
//     );
//   }

//   return (
//     <div className=''>

  
//     <div className="space-y-4 mb-10 px-6">
//       {/* Header (compact) */}
//       <div className="flex items-center justify-between ">
//         <div>
//           <h2 className="text-xl font-bold text-gray-900">Visit Schedule</h2>
//           <p className="text-xs text-gray-600 mt-0.5">Manage property visits & follow-ups</p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={loadVisits}
//             className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 text-gray-700 text-sm"
//           >
//             <RefreshCw size={14} />
//             <span className="hidden sm:inline">Refresh</span>
//           </button>
//           <button
//             onClick={onAddVisit}
//             className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-1.5 text-sm"
//           >
//             <Plus size={14} />
//             <span>Schedule</span>
//           </button>
//         </div>
//       </div>

//       {/* Stats (only if there are visits) */}
//       {visits.length > 0 && (
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
//           <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
//             <div className="text-2xl font-bold text-blue-700 leading-none">{stats.total}</div>
//             <div className="text-xs text-blue-700 mt-0.5">Total</div>
//           </div>
//           <div className="bg-green-50 p-3 rounded-lg border border-green-200">
//             <div className="text-2xl font-bold text-green-700 leading-none">{stats.completed}</div>
//             <div className="text-xs text-green-700 mt-0.5">Completed</div>
//           </div>
//           <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
//             <div className="text-2xl font-bold text-orange-700 leading-none">{stats.today}</div>
//             <div className="text-xs text-orange-700 mt-0.5">Today</div>
//           </div>
//           <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
//             <div className="text-2xl font-bold text-purple-700 leading-none">{stats.upcoming}</div>
//             <div className="text-xs text-purple-700 mt-0.5">Upcoming</div>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="flex gap-6">
//           <button
//             onClick={() => setActiveTab('visits')}
//             className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//               activeTab === 'visits'
//                 ? 'border-purple-600 text-purple-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             Visits ({stats.total})
//           </button>
//           <button
//             onClick={() => setActiveTab('revisits')}
//             className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//               activeTab === 'revisits'
//                 ? 'border-purple-600 text-purple-600'
//                 : 'border-transparent text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             Revisits ({revisits.length})
//           </button>
//         </nav>
//       </div>

//       {/* Visits Tab */}
//       {activeTab === 'visits' && (
//         <div className="space-y-3">
//           {loadingVisits && <div className="text-center py-6 text-gray-600 text-sm">Loading visits...</div>}
//           {visitsError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{visitsError}</div>}

//           {!loadingVisits && !visits.length ? (
//             <div className="text-center py-10 bg-white rounded-lg border-2 border-dashed border-gray-300">
//               <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
//               <h3 className="text-lg font-semibold text-gray-900 mb-1">No Visits Scheduled</h3>
//               <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
//                 Start by scheduling your first property visit.
//               </p>
//               <button
//                 onClick={onAddVisit}
//                 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
//               >
//                 Schedule First Visit
//               </button>
//             </div>
//           ) : (
//             visits.map((visit) => {
//               const status = getVisitStatus(visit);
//               const when = toWhen(visit);
//               const title = visit.property_title || 'Untitled Property';
//               const sellerPresent = asBool(visit.seller_present);

//               const buyerD = getBuyer(visit);
//               const sellerD = getSeller(visit);
//               const execD = getExecutive(visit);
//               const execDisplay = getExecutiveDisplay(
//                 { executive_full_name: execD.name, executive_id: visit.executive_id },
//                 resolveExecutiveName
//               );

//               return (
//                 <div
//                   key={visit.id}
//                   className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-150"
//                 >
//                   {/* Header */}
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
//                         <StatusBadge status={status} />
//                         {visit.revisit_count > 0 && (
//                           <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium inline-flex items-center gap-1">
//                             <TrendingUp size={12} />
//                             {visit.revisit_count} Revisit{visit.revisit_count > 1 ? 's' : ''}
//                           </span>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5 flex-wrap">
//                         <span>Visit #{visit.id}</span>
//                         {visit.visit_type && <><span>•</span><span className="capitalize">{toTitle(visit.visit_type)}</span></>}
//                         {visit.status && <><span>•</span><span className="capitalize">{toTitle(visit.status)}</span></>}
//                       </div>
//                     </div>
//                     <div className="flex gap-1.5 shrink-0">
//                       <button
//                         onClick={() => onEditVisit(visit)}
//                         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
//                         title="Edit visit"
//                       >
//                         <Edit size={16} />
//                       </button>
//                       <button
//                         onClick={() => onDeleteVisit(visit.id)}
//                         className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
//                         title="Delete visit"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Info grid */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
//                     <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
//                       <Calendar size={16} className="text-purple-600" />
//                       <div>
//                         <div className="text-[10px] text-gray-500">Date</div>
//                         <div className="font-medium text-gray-900 text-sm">{fmtDate(when)}</div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
//                       <Clock size={16} className="text-purple-600" />
//                       <div>
//                         <div className="text-[10px] text-gray-500">Time</div>
//                         <div className="font-medium text-gray-900 text-sm">
//                           {fmtTime(when)}
//                           {visit.duration_minutes && (
//                             <span className="text-[11px] text-gray-500 ml-1">({visit.duration_minutes}m)</span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     {(visit.meet_point || visit.location) && (
//                       <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
//                         <MapPin size={16} className="text-purple-600" />
//                         <div>
//                           <div className="text-[10px] text-gray-500">Meet Point</div>
//                           <div className="font-medium text-gray-900 text-sm truncate max-w-[220px]">
//                             {visit.meet_point || visit.location}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* People */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
//                     <ContactCard tone="violet" title="BUYER" name={buyerD.name} phone={buyerD.phone} email={buyerD.email} />
//                     <ContactCard
//                       tone="blue"
//                       title="SELLER"
//                       name={sellerD.name}
//                       phone={sellerD.phone}
//                       email={sellerD.email}
//                       extra={
//                         asBool(visit.seller_present) !== undefined && (
//                           <div className="flex items-center gap-1 mt-1">
//                             {sellerPresent ? (
//                               <CheckCircle2 size={12} className="text-green-600" />
//                             ) : (
//                               <XCircle size={12} className="text-red-600" />
//                             )}
//                             <span className="text-[11px] text-gray-600">
//                               {sellerPresent ? 'Will be present' : 'Not present'}
//                             </span>
//                           </div>
//                         )
//                       }
//                     />
//                     <ContactCard
//                       tone="green"
//                       title="EXECUTIVE"
//                       name={execDisplay}
//                       phone={execD.phone}
//                       email={execD.email}
//                     />
//                   </div>

//                   {/* Extra */}
//                   {(visit.accompanied_by?.length > 0 || visit.rating || visit.feedback || visit.remarks) && (
//                     <div className="space-y-2 pt-2 border-t border-gray-100">
//                       {visit.accompanied_by?.length > 0 && (
//                         <div>
//                           <div className="text-[10px] text-gray-500 mb-1">ACCOMPANIED BY</div>
//                           <PillList items={visit.accompanied_by} />
//                         </div>
//                       )}
//                       {visit.rating && (
//                         <div className="flex items-center gap-1">
//                           <Star size={14} className="text-yellow-500 fill-yellow-500" />
//                           <span className="font-medium text-gray-900 text-sm">{visit.rating}/5</span>
//                         </div>
//                       )}
//                       {visit.feedback && (
//                         <div className="p-2 bg-gray-50 rounded-md">
//                           <div className="text-[10px] text-gray-500 mb-0.5">FEEDBACK</div>
//                           <p className="text-sm text-gray-700">{visit.feedback}</p>
//                         </div>
//                       )}
//                       {visit.remarks && (
//                         <div className="p-2 bg-gray-50 rounded-md">
//                           <div className="text-[10px] text-gray-500 mb-0.5">REMARKS</div>
//                           <p className="text-sm text-gray-700">{visit.remarks}</p>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Created / Updated (compact footer) */}
//                   <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
//                     <span>Created: <span className="text-gray-700">{fmtStamp(visit.created_at)}</span></span>
//                     <span>•</span>
//                     <span>Updated: <span className="text-gray-700">{fmtStamp(visit.updated_at)}</span></span>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}

//       {/* Revisits Tab */}
//       {activeTab === 'revisits' && (
//         <div className="space-y-3">
//           {loadingRevisits && <div className="text-center py-6 text-gray-600 text-sm">Loading revisits...</div>}

//           {!loadingRevisits && !revisits.length ? (
//             <div className="text-center py-10 bg-white rounded-lg border-2 border-dashed border-gray-300">
//               <TrendingUp size={40} className="mx-auto text-gray-300 mb-2" />
//               <h3 className="text-lg font-semibold text-gray-900 mb-1">No Revisits Scheduled</h3>
//               <p className="text-sm text-gray-600 max-w-md mx-auto">
//                 Revisits will appear here when scheduled from the visits tab.
//               </p>
//             </div>
//           ) : (
//             revisits.map((rev) => {
//               const when = toWhen(rev);
//               const status = getVisitStatus({ status: rev.status, visit_datetime: when?.toISOString() });

//               const buyerD = getBuyer(rev);
//               const sellerD = getSeller(rev);
//               const execD = getExecutive(rev);
//               const execDisplay = getExecutiveDisplay(
//                 { executive_full_name: execD.name, executive_id: rev.executive_id },
//                 resolveExecutiveName
//               );

//               return (
//                 <div
//                   key={`revisit-${rev.id}`}
//                   className="bg-white border border-purple-200 rounded-lg p-3 hover:shadow-md transition-all duration-150"
//                 >
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <h3 className="text-base font-semibold text-gray-900 truncate">{rev.property_title || 'Untitled'}</h3>
//                         <StatusBadge status={status} />
//                         <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">
//                           Revisit
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5 flex-wrap">
//                         <span>Revisit #{rev.id}</span>
//                         <span>•</span>
//                         <span>Original Visit #{rev.visit_id}</span>
//                         {rev.status && (
//                           <>
//                             <span>•</span>
//                             <span className="capitalize">{toTitle(rev.status)}</span>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//                     <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
//                       <Calendar size={16} className="text-purple-600" />
//                       <div>
//                         <div className="text-[10px] text-purple-600">Date</div>
//                         <div className="font-medium text-gray-900 text-sm">{fmtDate(when)}</div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
//                       <Clock size={16} className="text-purple-600" />
//                       <div>
//                         <div className="text-[10px] text-purple-600">Time</div>
//                         <div className="font-medium text-gray-900 text-sm">{fmtTime(when)}</div>
//                       </div>
//                     </div>
//                     {(rev.meet_point || rev.location) && (
//                       <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-md">
//                         <MapPin size={16} className="text-purple-600" />
//                         <div>
//                           <div className="text-[10px] text-purple-600">Meet Point</div>
//                           <div className="font-medium text-gray-900 text-sm truncate max-w-[220px]">
//                             {rev.meet_point || rev.location}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {(buyerD.name || sellerD.name || execDisplay) && (
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
//                       <ContactCard tone="violet" title="BUYER" name={buyerD.name} phone={buyerD.phone} email={buyerD.email} />
//                       <ContactCard tone="blue" title="SELLER" name={sellerD.name} phone={sellerD.phone} email={sellerD.email} />
//                       <ContactCard tone="green" title="EXECUTIVE" name={execDisplay} phone={execD.phone} email={execD.email} />
//                     </div>
//                   )}

//                   {rev.remarks && (
//                     <div className="mt-2 p-2 bg-gray-50 rounded-md">
//                       <div className="text-[10px] text-gray-500 mb-0.5">REMARKS</div>
//                       <p className="text-sm text-gray-700">{rev.remarks}</p>
//                     </div>
//                   )}

//                   {/* Created / Updated (compact footer) */}
//                   <div className="mt-2 pt-2 border-t border-purple-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
//                     <span>Created: <span className="text-gray-700">{fmtStamp(rev.created_at)}</span></span>
//                     <span>•</span>
//                     <span>Updated: <span className="text-gray-700">{fmtStamp(rev.updated_at)}</span></span>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}
//     </div>
//       </div>
//   );
// };

// export default VisitScheduleTab;
import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar, MapPin, Clock, Edit, Trash2, Plus, User, RefreshCw, Mail, CheckCircle2, XCircle, Star, TrendingUp, Phone, ChevronDown, ChevronUp,
} from 'lucide-react';
import { visitsAPI } from '@/lib/visitsAPI';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface VisitScheduleTabProps {
  buyer: any;
  onAddVisit: () => void;
  onEditVisit: (visit: any) => void;
  onDeleteVisit: (visitId: string | number) => void;
  resolveExecutiveName?: (id?: string | number | null) => string | undefined;
}

/* ---------- Helpers (compact-friendly) ---------- */
const toWhen = (v: any): Date | null => {
  const iso = v?.visit_datetime ?? v?.revisit_datetime ?? v?.date;
  if (iso) {
    const d = new Date(iso);
    if (!isNaN(+d)) return d;
  }
  const d2 = v?.visit_date ?? v?.revisit_date;
  const t2 = v?.visit_time ?? v?.time ?? v?.revisit_time;
  if (d2) {
    const d = new Date(d2);
    if (!isNaN(+d)) {
      if (t2) {
        const [hh = '00', mm = '00', ss = '00'] = String(t2).split(':');
        d.setHours(Number(hh), Number(mm), Number(ss) || 0, 0);
      }
      return d;
    }
  }
  return null;
};

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-';

const fmtStamp = (val?: string | null) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(+d)) return '-';
  return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${d
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
};

const getVisitStatus = (visit: any) => {
  const now = new Date();
  const when = toWhen(visit);
  if (visit?.status === 'cancelled') return 'cancelled';
  if (['completed', 'done'].includes(visit?.status)) return 'completed';
  if (when) {
    if (when.getTime() < now.getTime()) return 'completed';
    const sameDay = when.toDateString() === now.toDateString();
    if (sameDay) return 'today';
  }
  return 'scheduled';
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    scheduled: `bg-blue-50 text-blue-700 border-blue-200`,
    today: `bg-green-50 text-green-700 border-green-200`,
    completed: `bg-gray-50 text-gray-600 border-gray-200`,
    cancelled: `bg-red-50 text-red-700 border-red-200`,
  };
  const labels: Record<string, string> = { scheduled: 'Scheduled', today: 'Today', completed: 'Completed', cancelled: 'Cancelled' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${styles[status] || styles.scheduled}`}>
      {labels[status] || 'Scheduled'}
    </span>
  );
};

const PillList: React.FC<{ items?: any }> = ({ items }) => {
  let arr: string[] = [];
  if (Array.isArray(items)) arr = items.map(String);
  else if (items && typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      arr = Array.isArray(parsed) ? parsed : [items];
    } catch {
      arr = [items];
    }
  }
  if (!arr.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {arr.map((val, idx) => (
        <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: `${O}10`, color: O }}>
          {val}
        </span>
      ))}
    </div>
  );
};

const asBool = (v: any): boolean | undefined => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
  return undefined;
};

const toTitle = (s?: string) => (s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '');

const getExecutiveDisplay = (visitLike: any, resolver?: (id?: string | number | null) => string | undefined) => {
  const fromPayload =
    visitLike?.executive_full_name ||
    visitLike?.executive_name ||
    visitLike?.assigned_to_name ||
    visitLike?.executive;
  if (fromPayload) return String(fromPayload);
  const id = visitLike?.executive_id ?? visitLike?.assigned_to;
  if (id == null) return '';
  const viaResolver = resolver?.(id);
  return viaResolver || `Executive #${id}`;
};

const getBuyer = (v: any) => ({
  name: v?.buyer_full_name ?? v?.buyer_name ?? v?.buyer,
  email: v?.buyer_email,
  phone: v?.buyer_phone ?? v?.buyer_mobile ?? v?.buyer_contact,
});
const getSeller = (v: any) => ({
  name: v?.seller_full_name ?? v?.seller_name,
  email: v?.seller_email,
  phone: v?.seller_phone,
});
const getExecutive = (v: any) => ({
  name: v?.executive_full_name ?? v?.executive_name,
  email: v?.executive_email,
  phone: v?.executive_phone,
});

/* Compact contact row */
const ContactCard: React.FC<{
  tone: 'blue' | 'green' | 'violet';
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  extra?: React.ReactNode;
}> = ({ tone, title, name, phone, email, extra }) => {
  const toneMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', icon: 'text-green-600' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', icon: 'text-violet-600' },
  }[tone];

  if (!name && !phone && !email && !extra) return null;

  return (
    <div className={`flex items-start gap-1.5 p-1.5 rounded-lg border ${toneMap.bg} ${toneMap.border}`}>
      <User size={12} className={`${toneMap.icon} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className={`text-[8px] font-medium uppercase tracking-wide ${toneMap.text}`}>{title}</div>
        {name && <div className="font-medium text-gray-900 truncate text-[11px]">{name}</div>}
        {(phone || email) && (
          <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-gray-600 flex-wrap">
            {phone && (
              <a href={`tel:${phone}`} className="inline-flex items-center gap-0.5 hover:underline">
                <Phone size={8} />
                <span className="truncate">{phone}</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="inline-flex items-center gap-0.5 hover:underline">
                <Mail size={8} />
                <span className="truncate">{email}</span>
              </a>
            )}
          </div>
        )}
        {extra}
      </div>
    </div>
  );
};

/* ---------- Component ---------- */
const VisitScheduleTab: React.FC<VisitScheduleTabProps> = ({
  buyer,
  onAddVisit,
  onEditVisit,
  onDeleteVisit,
  resolveExecutiveName,
}) => {
  const [activeTab, setActiveTab] = useState<'visits' | 'revisits'>('visits');
  const buyerId = buyer?.buyer_id ?? buyer?.id;

  const [visits, setVisits] = useState<any[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [visitsError, setVisitsError] = useState<string | null>(null);

  const [revisits, setRevisits] = useState<any[]>([]);
  const [loadingRevisits, setLoadingRevisits] = useState(false);

  const loadVisits = async () => {
    if (!buyerId) return;
    setLoadingVisits(true);
    setVisitsError(null);
    try {
      const res = await visitsAPI.getAllVisits({ buyer_id: buyerId, page: 1, limit: 50 });
      const list = res?.data ?? res?.rows ?? [];
      setVisits(list);
    } catch (e: any) {
      setVisitsError(e?.message || 'Failed to load visits');
    } finally {
      setLoadingVisits(false);
    }
  };

  const loadRevisits = async () => {
    if (!visits.length) {
      setRevisits([]);
      return;
    }
    setLoadingRevisits(true);
    try {
      const all: any[] = [];
      await Promise.all(
        visits.map(async (v: any) => {
          try {
            const res = await visitsAPI.getRevisitsByVisit(v.id);
            const rows = res?.data ?? res?.rows ?? [];
            rows.forEach((r: any) => {
              r.property_title = r.property_title || v.property_title;
              r.visit_id = r.visit_id || v.id;
              r.seller_full_name = r.seller_full_name || v.seller_full_name || v.seller_name;
              r.seller_phone = r.seller_phone || v.seller_phone;
              r.executive_full_name = r.executive_full_name || v.executive_full_name || v.executive_name;
              r.executive_phone = r.executive_phone || v.executive_phone;
              r.buyer_full_name = r.buyer_full_name || v.buyer_full_name || v.buyer_name;
              r.buyer_phone = r.buyer_phone || v.buyer_phone;
            });
            all.push(...rows);
          } catch {}
        })
      );
      setRevisits(all.sort((a, b) => (toWhen(b)?.getTime() ?? 0) - (toWhen(a)?.getTime() ?? 0)));
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingRevisits(false);
    }
  };

  useEffect(() => {
    if (buyerId) loadVisits();
    else {
      setVisits([]);
      setRevisits([]);
    }
  }, [buyerId]);

  useEffect(() => {
    loadRevisits();
  }, [visits]);

  const stats = useMemo(() => {
    const s = { total: visits.length, completed: 0, upcoming: 0, today: 0 };
    visits.forEach((v) => {
      const st = getVisitStatus(v);
      if (st === 'completed') s.completed++;
      else if (st === 'today') s.today++;
      else s.upcoming++;
    });
    return s;
  }, [visits]);

  if (!buyerId) {
    return (
      <div className="p-3 rounded-lg" style={{ background: '#fee2e2', border: '1px solid #fecaca' }}>
        <p className="text-xs text-red-700">⚠️ Cannot load visits: buyer ID is missing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-0 mb-32">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold" style={{ color: N }}>Visit Schedule</h2>
          <p className="text-[9px]" style={{ color: MU }}>Manage property visits & follow-ups</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={loadVisits}
            className="px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-[10px] font-medium"
            style={{ background: 'white', border: `1px solid ${BD}`, color: N }}
          >
            <RefreshCw size={10} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onAddVisit}
            className="px-2 py-1 rounded-lg text-white text-[10px] font-medium transition-all hover:opacity-80 flex items-center gap-1"
            style={{ background: O }}
          >
            <Plus size={10} />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {visits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <div className="rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="text-lg font-bold" style={{ color: O }}>{stats.total}</div>
            <div className="text-[8px] font-medium uppercase tracking-wide" style={{ color: MU }}>Total</div>
          </div>
          <div className="rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="text-lg font-bold" style={{ color: O }}>{stats.completed}</div>
            <div className="text-[8px] font-medium uppercase tracking-wide" style={{ color: MU }}>Completed</div>
          </div>
          <div className="rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="text-lg font-bold" style={{ color: O }}>{stats.today}</div>
            <div className="text-[8px] font-medium uppercase tracking-wide" style={{ color: MU }}>Today</div>
          </div>
          <div className="rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="text-lg font-bold" style={{ color: O }}>{stats.upcoming}</div>
            <div className="text-[8px] font-medium uppercase tracking-wide" style={{ color: MU }}>Upcoming</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b flex gap-3" style={{ borderColor: BD }}>
        <button
          onClick={() => setActiveTab('visits')}
          className={`pb-1.5 px-0.5 text-[10px] font-medium transition-colors border-b-2 ${
            activeTab === 'visits'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'visits' ? { color: O, borderColor: O } : {}}
        >
          Visits ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('revisits')}
          className={`pb-1.5 px-0.5 text-[10px] font-medium transition-colors border-b-2 ${
            activeTab === 'revisits'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'revisits' ? { color: O, borderColor: O } : {}}
        >
          Revisits ({revisits.length})
        </button>
      </div>

      {/* Visits Tab */}
      {activeTab === 'visits' && (
        <div className="space-y-2">
          {loadingVisits && <div className="text-center py-4 text-xs" style={{ color: MU }}>Loading visits...</div>}
          {visitsError && (
            <div className="p-2 rounded-lg text-xs" style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626' }}>
              {visitsError}
            </div>
          )}

          {!loadingVisits && !visits.length ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed" style={{ borderColor: BD }}>
              <Calendar size={32} className="mx-auto mb-2" style={{ color: MU }} />
              <h3 className="text-sm font-semibold mb-1" style={{ color: N }}>No Visits Scheduled</h3>
              <p className="text-[10px] mb-3" style={{ color: MU }}>Start by scheduling your first property visit.</p>
              <button
                onClick={onAddVisit}
                className="px-3 py-1 rounded-lg text-white text-[10px] font-medium transition-all hover:opacity-80"
                style={{ background: O }}
              >
                Schedule First Visit
              </button>
            </div>
          ) : (
            visits.map((visit) => {
              const status = getVisitStatus(visit);
              const when = toWhen(visit);
              const title = visit.property_title || 'Untitled Property';
              const sellerPresent = asBool(visit.seller_present);
              const buyerD = getBuyer(visit);
              const sellerD = getSeller(visit);
              const execD = getExecutive(visit);
              const execDisplay = getExecutiveDisplay(
                { executive_full_name: execD.name, executive_id: visit.executive_id },
                resolveExecutiveName
              );

              return (
                <div
                  key={visit.id}
                  className="bg-white rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${BD}` }}
                >
                  <div className="p-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-xs font-semibold truncate" style={{ color: N }}>{title}</h3>
                          <StatusBadge status={status} />
                          {visit.revisit_count > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium inline-flex items-center gap-0.5" style={{ background: `${O}10`, color: O }}>
                              <TrendingUp size={8} />
                              {visit.revisit_count} Revisit{visit.revisit_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-[8px] mt-0.5" style={{ color: MU }}>
                          <span>Visit #{visit.id}</span>
                          {visit.visit_type && <><span>•</span><span className="capitalize">{toTitle(visit.visit_type)}</span></>}
                          {visit.status && <><span>•</span><span className="capitalize">{toTitle(visit.status)}</span></>}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEditVisit(visit)}
                          className="p-1 rounded transition-colors hover:bg-gray-100"
                          style={{ color: O }}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteVisit(visit.id)}
                          className="p-1 rounded transition-colors hover:bg-gray-100"
                          style={{ color: '#dc2626' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: BG }}>
                        <Calendar size={10} style={{ color: O }} />
                        <div>
                          <div className="text-[7px] uppercase" style={{ color: MU }}>Date</div>
                          <div className="font-medium text-[10px]" style={{ color: N }}>{fmtDate(when)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: BG }}>
                        <Clock size={10} style={{ color: O }} />
                        <div>
                          <div className="text-[7px] uppercase" style={{ color: MU }}>Time</div>
                          <div className="font-medium text-[10px]" style={{ color: N }}>
                            {fmtTime(when)}
                            {visit.duration_minutes && (
                              <span className="text-[8px] ml-0.5" style={{ color: MU }}>({visit.duration_minutes}m)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {(visit.meet_point || visit.location) && (
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: BG }}>
                          <MapPin size={10} style={{ color: O }} />
                          <div>
                            <div className="text-[7px] uppercase" style={{ color: MU }}>Meet Point</div>
                            <div className="font-medium text-[10px] truncate max-w-[150px]" style={{ color: N }}>
                              {visit.meet_point || visit.location}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* People */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2">
                      <ContactCard tone="violet" title="BUYER" name={buyerD.name} phone={buyerD.phone} email={buyerD.email} />
                      <ContactCard
                        tone="blue"
                        title="SELLER"
                        name={sellerD.name}
                        phone={sellerD.phone}
                        email={sellerD.email}
                        extra={
                          asBool(visit.seller_present) !== undefined && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {sellerPresent ? (
                                <CheckCircle2 size={8} className="text-green-600" />
                              ) : (
                                <XCircle size={8} className="text-red-600" />
                              )}
                              <span className="text-[7px]" style={{ color: MU }}>
                                {sellerPresent ? 'Will be present' : 'Not present'}
                              </span>
                            </div>
                          )
                        }
                      />
                      <ContactCard tone="green" title="EXECUTIVE" name={execDisplay} phone={execD.phone} email={execD.email} />
                    </div>

                    {/* Extra */}
                    {(visit.accompanied_by?.length > 0 || visit.rating || visit.feedback || visit.remarks) && (
                      <div className="space-y-1.5 pt-1.5" style={{ borderTop: `1px solid ${BD}` }}>
                        {visit.accompanied_by?.length > 0 && (
                          <div>
                            <div className="text-[7px] uppercase font-medium mb-0.5" style={{ color: MU }}>Accompanied By</div>
                            <PillList items={visit.accompanied_by} />
                          </div>
                        )}
                        {visit.rating && (
                          <div className="flex items-center gap-0.5">
                            <Star size={10} className="fill-yellow-500" style={{ color: '#eab308' }} />
                            <span className="font-medium text-[10px]" style={{ color: N }}>{visit.rating}/5</span>
                          </div>
                        )}
                        {visit.feedback && (
                          <div className="p-1.5 rounded-lg" style={{ background: BG }}>
                            <div className="text-[7px] uppercase font-medium mb-0.5" style={{ color: MU }}>Feedback</div>
                            <p className="text-[9px]" style={{ color: N }}>{visit.feedback}</p>
                          </div>
                        )}
                        {visit.remarks && (
                          <div className="p-1.5 rounded-lg" style={{ background: BG }}>
                            <div className="text-[7px] uppercase font-medium mb-0.5" style={{ color: MU }}>Remarks</div>
                            <p className="text-[9px]" style={{ color: N }}>{visit.remarks}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-1.5 pt-1.5 flex flex-wrap items-center gap-2 text-[7px]" style={{ borderTop: `1px solid ${BD}`, color: MU }}>
                      <span>Created: <span style={{ color: N }}>{fmtStamp(visit.created_at)}</span></span>
                      <span>•</span>
                      <span>Updated: <span style={{ color: N }}>{fmtStamp(visit.updated_at)}</span></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Revisits Tab */}
      {activeTab === 'revisits' && (
        <div className="space-y-2">
          {loadingRevisits && <div className="text-center py-4 text-xs" style={{ color: MU }}>Loading revisits...</div>}

          {!loadingRevisits && !revisits.length ? (
            <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed" style={{ borderColor: BD }}>
              <TrendingUp size={32} className="mx-auto mb-2" style={{ color: MU }} />
              <h3 className="text-sm font-semibold mb-1" style={{ color: N }}>No Revisits Scheduled</h3>
              <p className="text-[10px]" style={{ color: MU }}>Revisits will appear here when scheduled.</p>
            </div>
          ) : (
            revisits.map((rev) => {
              const when = toWhen(rev);
              const status = getVisitStatus({ status: rev.status, visit_datetime: when?.toISOString() });
              const buyerD = getBuyer(rev);
              const sellerD = getSeller(rev);
              const execD = getExecutive(rev);
              const execDisplay = getExecutiveDisplay(
                { executive_full_name: execD.name, executive_id: rev.executive_id },
                resolveExecutiveName
              );

              return (
                <div
                  key={`revisit-${rev.id}`}
                  className="bg-white rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${O}30` }}
                >
                  <div className="p-2.5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-xs font-semibold truncate" style={{ color: N }}>{rev.property_title || 'Untitled'}</h3>
                          <StatusBadge status={status} />
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium" style={{ background: `${O}10`, color: O }}>
                            Revisit
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-[8px] mt-0.5" style={{ color: MU }}>
                          <span>Revisit #{rev.id}</span>
                          <span>•</span>
                          <span>Original Visit #{rev.visit_id}</span>
                          {rev.status && <><span>•</span><span className="capitalize">{toTitle(rev.status)}</span></>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2">
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: `${O}5` }}>
                        <Calendar size={10} style={{ color: O }} />
                        <div>
                          <div className="text-[7px] uppercase" style={{ color: MU }}>Date</div>
                          <div className="font-medium text-[10px]" style={{ color: N }}>{fmtDate(when)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: `${O}5` }}>
                        <Clock size={10} style={{ color: O }} />
                        <div>
                          <div className="text-[7px] uppercase" style={{ color: MU }}>Time</div>
                          <div className="font-medium text-[10px]" style={{ color: N }}>{fmtTime(when)}</div>
                        </div>
                      </div>
                      {(rev.meet_point || rev.location) && (
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ background: `${O}5` }}>
                          <MapPin size={10} style={{ color: O }} />
                          <div>
                            <div className="text-[7px] uppercase" style={{ color: MU }}>Meet Point</div>
                            <div className="font-medium text-[10px] truncate max-w-[150px]" style={{ color: N }}>
                              {rev.meet_point || rev.location}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {(buyerD.name || sellerD.name || execDisplay) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2">
                        <ContactCard tone="violet" title="BUYER" name={buyerD.name} phone={buyerD.phone} email={buyerD.email} />
                        <ContactCard tone="blue" title="SELLER" name={sellerD.name} phone={sellerD.phone} email={sellerD.email} />
                        <ContactCard tone="green" title="EXECUTIVE" name={execDisplay} phone={execD.phone} email={execD.email} />
                      </div>
                    )}

                    {rev.remarks && (
                      <div className="p-1.5 rounded-lg mb-2" style={{ background: BG }}>
                        <div className="text-[7px] uppercase font-medium mb-0.5" style={{ color: MU }}>Remarks</div>
                        <p className="text-[9px]" style={{ color: N }}>{rev.remarks}</p>
                      </div>
                    )}

                    <div className="pt-1.5 flex flex-wrap items-center gap-2 text-[7px]" style={{ borderTop: `1px solid ${O}20`, color: MU }}>
                      <span>Created: <span style={{ color: N }}>{fmtStamp(rev.created_at)}</span></span>
                      <span>•</span>
                      <span>Updated: <span style={{ color: N }}>{fmtStamp(rev.updated_at)}</span></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default VisitScheduleTab;