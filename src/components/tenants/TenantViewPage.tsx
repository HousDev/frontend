// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   ArrowLeft, User, Phone, Mail, MapPin, Building, Calendar, Edit,
//   ChevronLeft, ChevronRight, Home, Banknote, CheckCircle2,
//   Clock, AlertCircle, StickyNote, Plus, Bell, Sparkles, Link2,
//   Loader2,
// } from 'lucide-react';
// import { SiWhatsapp } from 'react-icons/si';
// import TenantFormModal from './TenantFormModal';
// import TenantFollowupModal from './TenantFollowupModal';
// import TenantVisitModal from './TenantVisitModal';
// import TenantActivityModal from './TenantActivityModal';
// import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
// import { toast } from 'react-toastify';

// interface Tenant {
//   id: number;
//   tenant_id: string;
//   name: string;
//   email: string;
//   phone: string;
//   whatsapp?: string;
//   preferred_location: string;
//   budget_min: string | number;
//   budget_max: string | number;
//   preferred_bhk: string;
//   tenant_type: string;
//   move_in_date?: string;
//   current_address?: string;
//   notes?: string;
//   status: string;
//   rental_property_id?: number | string | null;
//   property_title?: string;
//   owner_name?: string;
//   assigned_to?: number | string;
//   assigned_to_name?: string;
//   created_at?: string;
// }

// interface TenantViewPageProps {
//   tenant: Tenant;
//   onBack: () => void;
//   onNext?: () => void;
//   onPrevious?: () => void;
//   currentIndex?: number;
//   totalTenants?: number;
//   onUpdateTenant?: (updated: Tenant) => void;
// }

// const BRAND = '#e67e22';
// const N = '#0f2b3d';

// const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
//   'Active Search':    { bg: 'bg-green-50 text-green-700 border-green-200',  text: 'text-green-700', icon: <CheckCircle2 size={11} /> },
//   'Interested':       { bg: 'bg-blue-50 text-blue-700 border-blue-200',   text: 'text-blue-700', icon: <AlertCircle size={11} /> },
//   'Agreement Signed': { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', icon: <CheckCircle2 size={11} /> },
//   'Inactive':         { bg: 'bg-gray-100 text-gray-600 border-gray-200',   text: 'text-gray-500', icon: <Clock size={11} /> },
// };

// type Tab = 'overview' | 'requirements' | 'matched' | 'property' | 'notes';

// function CompactDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100/80 last:border-0">
//       <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">{label}</span>
//       <span className="text-[11px] font-semibold text-gray-800 text-right truncate max-w-[220px]">{value}</span>
//     </div>
//   );
// }

// export default function TenantViewPage({
//   tenant: initialTenant,
//   onBack,
//   onNext,
//   onPrevious,
//   currentIndex = 0,
//   totalTenants = 1,
//   onUpdateTenant,
// }: TenantViewPageProps) {
//   const [tenant, setTenant] = useState<Tenant>(initialTenant);
//   const [activeTab, setActiveTab] = useState<Tab>('overview');

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showFollowupModal, setShowFollowupModal] = useState(false);
//   const [showVisitModal, setShowVisitModal] = useState(false);
//   const [showActivityModal, setShowActivityModal] = useState(false);

//   const [allProperties, setAllProperties] = useState<any[]>([]);
//   const [loadingMatched, setLoadingMatched] = useState<boolean>(false);

//   useEffect(() => {
//     const fetchRentalProperties = async () => {
//       setLoadingMatched(true);
//       try {
//         const res = await rentalPropertiesAPI.PublicgetProperties();
//         const list = Array.isArray(res) ? res : res?.data || res?.properties || [];
//         setAllProperties(list);
//       } catch (err) {
//         console.error('Error fetching rental properties for matching:', err);
//       } finally {
//         setLoadingMatched(false);
//       }
//     };
//     fetchRentalProperties();
//   }, []);

//   const statusCfg = statusConfig[tenant.status] ?? statusConfig['Inactive'];
//   const budgetMin = Number(tenant.budget_min) || 0;
//   const budgetMax = Number(tenant.budget_max) || 0;
//   const hasBudget = budgetMin > 0 || budgetMax > 0;
//   const fmtINR = (n: number) => (n > 0 ? `\u20b9${n.toLocaleString('en-IN')}` : '\u2014');

//   const matchedProperties = useMemo(() => {
//     if (!allProperties || allProperties.length === 0) return [];

//     const prefBhk = (tenant.preferred_bhk || '').toLowerCase().trim();
//     const prefLoc = (tenant.preferred_location || '').toLowerCase().trim();

//     return allProperties
//       .map((p: any) => {
//         let score = 0;
//         let reasons: string[] = [];

//         const pType = (p.property_type_name || p.property_type || p.unit_type || p.title || '').toLowerCase();
//         if (prefBhk && (pType.includes(prefBhk) || prefBhk.includes(pType))) {
//           score += 40;
//           reasons.push(`${tenant.preferred_bhk} BHK Match`);
//         }

//         const rent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);
//         if (rent > 0 && hasBudget) {
//           if (rent >= budgetMin && rent <= budgetMax) {
//             score += 40;
//             reasons.push('In Budget');
//           } else if (rent <= budgetMax * 1.15 && rent >= budgetMin * 0.85) {
//             score += 25;
//             reasons.push('Near Budget');
//           }
//         } else {
//           score += 20;
//         }

//         const pLoc = (p.location_name || p.society_name || p.address || p.city_name || '').toLowerCase();
//         if (prefLoc && pLoc.includes(prefLoc)) {
//           score += 20;
//           reasons.push('Location Match');
//         } else if (!prefLoc) {
//           score += 10;
//         }

//         return {
//           ...p,
//           matchScore: Math.min(100, score),
//           matchReasons: reasons,
//         };
//       })
//       .filter((p: any) => p.matchScore >= 40)
//       .sort((a: any, b: any) => b.matchScore - a.matchScore);
//   }, [allProperties, tenant.preferred_bhk, tenant.preferred_location, budgetMin, budgetMax, hasBudget]);

//   const handleSaveTenant = (updated: Tenant) => {
//     setTenant(updated);
//     onUpdateTenant?.(updated);
//     setShowEditModal(false);
//   };

//   const handleLinkProperty = (property: any) => {
//     const updated = {
//       ...tenant,
//       rental_property_id: property.id,
//       property_title: property.title || property.property_type_name || `Rental Unit RENT-${property.id}`,
//       owner_name: property.seller_name || property.owner_name || 'Owner',
//     };
//     setTenant(updated);
//     onUpdateTenant?.(updated);
//     toast.success(`Linked RENT-${property.id} to ${tenant.name}`);
//   };

//   const daysActive = tenant.created_at
//     ? Math.max(0, Math.floor((Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24)))
//     : null;

//   const handleWhatsApp = () => {
//     const message = `Hi ${tenant.name}, regarding your property search (${tenant.preferred_bhk || ''} in ${tenant.preferred_location || 'preferred location'}). Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}. Please let us know your availability.`;
//     window.open(`https://wa.me/${(tenant.whatsapp || tenant.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
//   };

//   const handleEmail = () => {
//     const subject = `Rental Requirement Update - ${tenant.name}`;
//     const body = `Dear ${tenant.name},\n\nWe have property updates matching your requirement (${tenant.preferred_bhk || ''} in ${tenant.preferred_location || ''}).\nBudget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}.\n\nBest regards,\nResaleExpert Team`;
//     window.open(`mailto:${tenant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
//   };

//   const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
//     { id: 'overview',     label: 'Overview',          icon: <User size={13} /> },
//     { id: 'matched',      label: `Matched Properties (${matchedProperties.length})`, icon: <Sparkles size={13} /> },
//     { id: 'requirements', label: 'Requirements',      icon: <Building size={13} /> },
//     { id: 'property',     label: 'Linked Property',   icon: <Home size={13} /> },
//     { id: 'notes',        label: 'Notes & Address',   icon: <StickyNote size={13} /> },
//   ];

//   return (
//     <div className="min-h-screen flex flex-col bg-slate-50 text-xs">
//       <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 sticky top-0 z-40 shadow-xs">
//         <div className="flex items-center justify-between gap-3">
//           <div className="flex items-center gap-2.5 min-w-0">
//             <button onClick={onBack} className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#0f2b3d] transition-colors flex-shrink-0">
//               <ArrowLeft size={16} />
//             </button>
//             <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs" style={{ background: 'linear-gradient(135deg, #e67e22, #f39c12)' }}>
//               {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
//             </div>
//             <div className="min-w-0">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h1 className="text-sm font-bold text-gray-900 truncate leading-none">{tenant.name}</h1>
//                 <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">{tenant.tenant_id}</span>
//                 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg}`}>
//                   {statusCfg.icon} {tenant.status}
//                 </span>
//               </div>
//               <p className="text-[10px] text-gray-400 mt-0.5 truncate">
//                 Category: <span className="font-semibold text-gray-600 capitalize">{tenant.tenant_type || 'Renter'}</span>
//                 {tenant.assigned_to_name && (
//                   <span className="ml-2">| Exec: <span className="font-semibold text-blue-600">{tenant.assigned_to_name}</span></span>
//                 )}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 flex-shrink-0">
//             <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 mr-1">
//               <span>{currentIndex + 1}/{totalTenants}</span>
//               <button onClick={onPrevious} disabled={currentIndex === 0} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700"><ChevronLeft size={13} /></button>
//               <button onClick={onNext} disabled={currentIndex === totalTenants - 1} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700"><ChevronRight size={13} /></button>
//             </div>
//             <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white font-bold text-xs shadow-xs transition-colors" style={{ background: N }}>
//               <Edit size={13} /> <span className="hidden sm:inline">Edit Tenant</span>
//             </button>
//           </div>
//         </div>
//         <div className="flex items-center space-x-1 mt-2 pt-1 border-t border-gray-100 overflow-x-auto no-scrollbar">
//           {tabs.map((tab) => (
//             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all text-xs font-semibold whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
//               {tab.icon}
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2">
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full">
//           <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-lg p-2 border border-amber-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0"><Banknote size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Rent Budget</p><p className="text-xs font-bold text-orange-700 truncate">{hasBudget ? `${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}` : 'Not set'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg p-2 border border-blue-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0"><Home size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Preferred BHK</p><p className="text-xs font-bold text-blue-700 truncate">{tenant.preferred_bhk || '—'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-lg p-2 border border-emerald-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0"><MapPin size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Location</p><p className="text-xs font-bold text-emerald-700 truncate">{tenant.preferred_location || 'Any Location'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-purple-50 to-pink-50/50 rounded-lg p-2 border border-purple-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0"><Calendar size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Move-In Date</p><p className="text-xs font-bold text-purple-700 truncate">{tenant.move_in_date ? new Date(tenant.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-lg p-2 border border-gray-200 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-slate-500/10 text-slate-700 flex items-center justify-center flex-shrink-0"><Clock size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Days Active</p><p className="text-xs font-bold text-slate-800 truncate">{daysActive !== null ? `${daysActive} Days` : '—'}</p></div>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 p-3 md:p-5 w-full space-y-4">
//         {activeTab === 'overview' && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
//             <div className="lg:col-span-2 space-y-4">
//               <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
//                 <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2"><User size={14} className="text-orange-500" /> Contact Details</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
//                   <CompactDetailRow label="Full Name" value={tenant.name} />
//                   <CompactDetailRow label="Tenant ID" value={<span className="font-bold text-orange-600">{tenant.tenant_id}</span>} />
//                   <CompactDetailRow label="Phone" value={tenant.phone || '—'} />
//                   <CompactDetailRow label="Email" value={tenant.email || '—'} />
//                   <CompactDetailRow label="WhatsApp" value={tenant.whatsapp || tenant.phone || '—'} />
//                   <CompactDetailRow label="Category" value={tenant.tenant_type || '—'} />
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
//                 <div className="flex items-center justify-between border-b border-gray-100 pb-2">
//                   <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
//                     <Sparkles size={14} className="text-amber-500" /> Matched Properties for Tenant
//                   </h3>
//                   <button
//                     onClick={() => setActiveTab('matched')}
//                     className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
//                   >
//                     View All ({matchedProperties.length})
//                   </button>
//                 </div>

//                 {loadingMatched ? (
//                   <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
//                     <Loader2 size={16} className="animate-spin text-orange-500" />
//                     <span>Finding matching properties...</span>
//                   </div>
//                 ) : matchedProperties.length > 0 ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {matchedProperties.slice(0, 4).map((p: any) => {
//                       const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
//                       const propLoc = p.location_name || p.society_name || p.address || p.location || p.city_name || p.city || tenant.preferred_location || 'Pune';
//                       const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);

//                       return (
//                         <div key={p.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors">
//                           <div className="space-y-1">
//                             <div className="flex items-center justify-between gap-1">
//                               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100/80 text-orange-800 border border-orange-200/50">RENT-{p.id}</span>
//                               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/50">
//                                 {p.matchScore}% Match
//                               </span>
//                             </div>
//                             <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug">{propTitle}</h4>
//                             <p className="text-[10px] text-gray-500 flex items-center gap-1">
//                               <MapPin size={11} className="text-gray-400 flex-shrink-0" />
//                               <span className="truncate">{propLoc}</span>
//                             </p>
//                           </div>

//                           <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
//                             <div>
//                               <span className="text-[9px] font-bold text-gray-400 uppercase">Rent</span>
//                               <p className="text-xs font-bold text-green-700">{propRent > 0 ? `${fmtINR(propRent)}/mo` : 'Contact for Rent'}</p>
//                             </div>
//                             <button
//                               onClick={() => handleLinkProperty(p)}
//                               className="flex items-center gap-1 px-3 py-1.5 bg-[#0f2b3d] hover:bg-[#1a4a6a] text-white rounded-lg text-[10px] font-bold transition-colors shadow-2xs"
//                             >
//                               <Link2 size={11} /> Link Property
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <p className="text-xs text-gray-400 italic py-3 text-center">No properties matching this tenant's criteria.</p>
//                 )}
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
//                 <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2"><Home size={14} className="text-orange-500" /> Linked Property</h3>
//                 {tenant.rental_property_id ? (
//                   <div className="bg-orange-50/60 p-3 rounded-lg border border-orange-100">
//                     <p className="text-[10px] font-bold text-orange-600">RENT-{tenant.rental_property_id}</p>
//                     <p className="text-xs font-bold text-gray-800">{tenant.property_title}</p>
//                   </div>
//                 ) : <p className="text-xs text-gray-400">No property linked.</p>}
//               </div>
//             </div>
//           </div>
//         )}
//         {activeTab === 'matched' && (
//           <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4 w-full">
//             <div className="flex items-center justify-between border-b border-gray-100 pb-3">
//               <div>
//                 <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
//                   <Sparkles size={16} className="text-amber-500" /> Matched Properties According to Preference
//                 </h3>
//                 <p className="text-[11px] text-gray-500 mt-0.5">
//                   Filtered by BHK ({tenant.preferred_bhk || 'Any'}), Location ({tenant.preferred_location || 'Any'}), Budget ({fmtINR(budgetMin)} - {fmtINR(budgetMax)})
//                 </p>
//               </div>
//               <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
//                 {matchedProperties.length} Properties Matched
//               </span>
//             </div>

//             {loadingMatched ? (
//               <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
//                 <Loader2 size={20} className="animate-spin text-orange-500" />
//                 <span>Searching properties matching tenant preferences...</span>
//               </div>
//             ) : matchedProperties.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {matchedProperties.map((p: any) => {
//                   const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
//                   const propLoc = p.location_name || p.society_name || p.address || p.location || p.city_name || p.city || tenant.preferred_location || 'Pune';
//                   const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);

//                   return (
//                     <div key={p.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
//                       <div className="space-y-1.5">
//                         <div className="flex items-center justify-between">
//                           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100/80 text-orange-800 border border-orange-200/50">RENT-{p.id}</span>
//                           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 flex items-center gap-1">
//                             <CheckCircle2 size={10} /> {p.matchScore}% Match
//                           </span>
//                         </div>
//                         <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{propTitle}</h4>
//                         <p className="text-[11px] text-gray-600 flex items-center gap-1">
//                           <MapPin size={12} className="text-gray-400 flex-shrink-0" />
//                           <span className="truncate">{propLoc}</span>
//                         </p>
//                       </div>

//                       <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
//                         <div>
//                           <span className="text-[9px] font-bold text-gray-400 uppercase">Monthly Rent</span>
//                           <p className="text-xs font-bold text-green-700">{propRent > 0 ? `${fmtINR(propRent)}/mo` : 'Contact'}</p>
//                         </div>
//                         <button
//                           onClick={() => handleLinkProperty(p)}
//                           className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2b3d] hover:bg-[#1a4a6a] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
//                         >
//                           <Link2 size={12} /> Link Property
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-12 text-gray-400 italic">
//                 <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
//                 <p>No properties match this tenant's specific preferences right now.</p>
//               </div>
//             )}
//           </div>
//         )}
//         {activeTab === 'requirements' && (
//           <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
//             <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Criteria</h3>
//             <CompactDetailRow label="Min Rent" value={fmtINR(budgetMin)} />
//             <CompactDetailRow label="Max Rent" value={fmtINR(budgetMax)} />
//           </div>
//         )}
//       </div>

//       <div className="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
//         <div className="flex items-center justify-between w-full gap-2 flex-wrap text-xs">
//           <div className="flex items-center gap-1.5 flex-wrap">
//             <button onClick={handleWhatsApp} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: '#25D366' }}><SiWhatsapp size={13} /><span>WhatsApp</span></button>
//             <button onClick={handleEmail} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-blue-600 hover:bg-blue-700"><Mail size={13} /><span>Email</span></button>
//             {tenant.phone && (<a href={`tel:${tenant.phone}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: BRAND }}><Phone size={13} /><span>Call</span></a>)}
//           </div>
//           <div className="flex items-center gap-1.5 flex-wrap">
//             <button onClick={() => setShowVisitModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-emerald-600 hover:bg-emerald-700"><Calendar size={13} /><span>Schedule Visit</span></button>
//             <button onClick={() => setShowActivityModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-indigo-600 hover:bg-indigo-700"><Plus size={13} /><span>Add Activity</span></button>
//             <button onClick={() => setShowFollowupModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-amber-600 hover:bg-amber-700"><Bell size={13} /><span>Follow-up</span></button>
//             <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: N }}><Edit size={13} /><span>Edit</span></button>
//           </div>
//         </div>
//       </div>

//       {showEditModal && <TenantFormModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} mode="edit" initialData={tenant as any} onSubmit={handleSaveTenant as any} />}
//       {showFollowupModal && <TenantFollowupModal isOpen={showFollowupModal} onClose={() => setShowFollowupModal(false)} tenant={tenant} />}
//       {showVisitModal && <TenantVisitModal isOpen={showVisitModal} onClose={() => setShowVisitModal(false)} tenant={tenant} />}
//       {showActivityModal && <TenantActivityModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} tenant={tenant} />}
//     </div>
//   );
// }


// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   ArrowLeft, User, Phone, Mail, MapPin, Building, Calendar, Edit,
//   ChevronLeft, ChevronRight, Home, Banknote, CheckCircle2,
//   Clock, AlertCircle, StickyNote, Plus, Bell, Sparkles, Link2,
//   Loader2,
// } from 'lucide-react';
// import { SiWhatsapp } from 'react-icons/si';
// import TenantFormModal from './TenantFormModal';
// import TenantFollowupModal from './TenantFollowupModal';
// import TenantVisitModal from './TenantVisitModal';
// import TenantActivityModal from './TenantActivityModal';
// import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
// import { toast } from 'react-toastify';

// // ⚠️ CHANGE THESE IMPORT PATHS/NAMES TO MATCH YOUR ACTUAL API FILES
// // (same pattern as buyerFollowupAPI.ts you shared — getByTenantId should
// // return either an array, or { data: [...] })
// import { tenantFollowupAPI } from '@/lib/tenantFollowupAPI';
// import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
// import { tenantActivityAPI } from '@/lib/tenantActivityAPI';

// interface Tenant {
//   id: number;
//   tenant_id: string;
//   name: string;
//   email: string;
//   phone: string;
//   whatsapp?: string;
//   preferred_location: string;
//   budget_min: string | number;
//   budget_max: string | number;
//   preferred_bhk: string;
//   tenant_type: string;
//   move_in_date?: string;
//   current_address?: string;
//   notes?: string;
//   status: string;
//   rental_property_id?: number | string | null;
//   property_title?: string;
//   owner_name?: string;
//   assigned_to?: number | string;
//   assigned_to_name?: string;
//   created_at?: string;
// }

// interface TenantViewPageProps {
//   tenant: Tenant;
//   onBack: () => void;
//   onNext?: () => void;
//   onPrevious?: () => void;
//   currentIndex?: number;
//   totalTenants?: number;
//   onUpdateTenant?: (updated: Tenant) => void;
// }

// const BRAND = '#e67e22';
// const N = '#0f2b3d';

// const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
//   'Active Search': { bg: 'bg-green-50 text-green-700 border-green-200', text: 'text-green-700', icon: <CheckCircle2 size={11} /> },
//   'Interested': { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', icon: <AlertCircle size={11} /> },
//   'Agreement Signed': { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', icon: <CheckCircle2 size={11} /> },
//   'Inactive': { bg: 'bg-gray-100 text-gray-600 border-gray-200', text: 'text-gray-500', icon: <Clock size={11} /> },
// };

// // 👇 NEW: added 'timeline'
// type Tab = 'overview' | 'requirements' | 'matched' | 'property' | 'notes' | 'timeline';

// function CompactDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
//   return (
//     <div className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100/80 last:border-0">
//       <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">{label}</span>
//       <span className="text-[11px] font-semibold text-gray-800 text-right truncate max-w-[220px]">{value}</span>
//     </div>
//   );
// }

// export default function TenantViewPage({
//   tenant: initialTenant,
//   onBack,
//   onNext,
//   onPrevious,
//   currentIndex = 0,
//   totalTenants = 1,
//   onUpdateTenant,
// }: TenantViewPageProps) {
//   const [tenant, setTenant] = useState<Tenant>(initialTenant);
//   const [activeTab, setActiveTab] = useState<Tab>('overview');

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showFollowupModal, setShowFollowupModal] = useState(false);
//   const [showVisitModal, setShowVisitModal] = useState(false);
//   const [showActivityModal, setShowActivityModal] = useState(false);

//   const [allProperties, setAllProperties] = useState<any[]>([]);
//   const [loadingMatched, setLoadingMatched] = useState<boolean>(false);

//   // 👇 NEW: timeline state (follow-ups, visits, activities)
//   const [followups, setFollowups] = useState<any[]>([]);
//   const [visits, setVisits] = useState<any[]>([]);
//   const [activities, setActivities] = useState<any[]>([]);
//   const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

//   // 👇 NEW: fetch follow-ups, visits & activities for this tenant
//   const fetchTimelineData = async () => {
//     setLoadingTimeline(true);
//     try {
//       const [fRes, vRes, aRes] = await Promise.all([
//         tenantFollowupAPI.getByTenantId(tenant.id),
//         tenantVisitAPI.getByTenantId(tenant.id),
//         tenantActivityAPI.getByTenantId(tenant.id),
//       ]);

//       const toArray = (res: any) =>
//         Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

//       setFollowups(toArray(fRes));
//       setVisits(toArray(vRes));
//       setActivities(toArray(aRes));
//     } catch (err) {
//       console.error('Failed to load tenant timeline:', err);
//     } finally {
//       setLoadingTimeline(false);
//     }
//   };

//   useEffect(() => {
//     const fetchRentalProperties = async () => {
//       setLoadingMatched(true);
//       try {
//         const res = await rentalPropertiesAPI.PublicgetProperties();
//         const list = Array.isArray(res) ? res : res?.data || res?.properties || [];
//         setAllProperties(list);
//       } catch (err) {
//         console.error('Error fetching rental properties for matching:', err);
//       } finally {
//         setLoadingMatched(false);
//       }
//     };
//     fetchRentalProperties();
//   }, []);

//   // 👇 NEW: load timeline data on mount / when tenant changes
//   useEffect(() => {
//     fetchTimelineData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tenant.id]);

//   const statusCfg = statusConfig[tenant.status] ?? statusConfig['Inactive'];
//   const budgetMin = Number(tenant.budget_min) || 0;
//   const budgetMax = Number(tenant.budget_max) || 0;
//   const hasBudget = budgetMin > 0 || budgetMax > 0;
//   const fmtINR = (n: number) => (n > 0 ? `\u20b9${n.toLocaleString('en-IN')}` : '\u2014');

//   const matchedProperties = useMemo(() => {
//     if (!allProperties || allProperties.length === 0) return [];

//     const prefBhk = (tenant.preferred_bhk || '').toLowerCase().trim();
//     const prefLoc = (tenant.preferred_location || '').toLowerCase().trim();

//     return allProperties
//       .map((p: any) => {
//         let score = 0;
//         let reasons: string[] = [];

//         const pType = (p.property_type_name || p.property_type || p.unit_type || p.title || '').toLowerCase();
//         if (prefBhk && (pType.includes(prefBhk) || prefBhk.includes(pType))) {
//           score += 40;
//           reasons.push(`${tenant.preferred_bhk} BHK Match`);
//         }

//         const rent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);
//         if (rent > 0 && hasBudget) {
//           if (rent >= budgetMin && rent <= budgetMax) {
//             score += 40;
//             reasons.push('In Budget');
//           } else if (rent <= budgetMax * 1.15 && rent >= budgetMin * 0.85) {
//             score += 25;
//             reasons.push('Near Budget');
//           }
//         } else {
//           score += 20;
//         }

//         const pLoc = (p.location_name || p.society_name || p.address || p.city_name || '').toLowerCase();
//         if (prefLoc && pLoc.includes(prefLoc)) {
//           score += 20;
//           reasons.push('Location Match');
//         } else if (!prefLoc) {
//           score += 10;
//         }

//         return {
//           ...p,
//           matchScore: Math.min(100, score),
//           matchReasons: reasons,
//         };
//       })
//       .filter((p: any) => p.matchScore >= 40)
//       .sort((a: any, b: any) => b.matchScore - a.matchScore);
//   }, [allProperties, tenant.preferred_bhk, tenant.preferred_location, budgetMin, budgetMax, hasBudget]);

//   const handleSaveTenant = (updated: Tenant) => {
//     setTenant(updated);
//     onUpdateTenant?.(updated);
//     setShowEditModal(false);
//   };

//   const handleLinkProperty = (property: any) => {
//     const updated = {
//       ...tenant,
//       rental_property_id: property.id,
//       property_title: property.title || property.property_type_name || `Rental Unit RENT-${property.id}`,
//       owner_name: property.seller_name || property.owner_name || 'Owner',
//     };
//     setTenant(updated);
//     onUpdateTenant?.(updated);
//     toast.success(`Linked RENT-${property.id} to ${tenant.name}`);
//   };

//   const daysActive = tenant.created_at
//     ? Math.max(0, Math.floor((Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24)))
//     : null;

//   const handleWhatsApp = () => {
//     const message = `Hi ${tenant.name}, regarding your property search (${tenant.preferred_bhk || ''} in ${tenant.preferred_location || 'preferred location'}). Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}. Please let us know your availability.`;
//     window.open(`https://wa.me/${(tenant.whatsapp || tenant.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
//   };

//   const handleEmail = () => {
//     const subject = `Rental Requirement Update - ${tenant.name}`;
//     const body = `Dear ${tenant.name},\n\nWe have property updates matching your requirement (${tenant.preferred_bhk || ''} in ${tenant.preferred_location || ''}).\nBudget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}.\n\nBest regards,\nResaleExpert Team`;
//     window.open(`mailto:${tenant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
//   };

//   // 👇 UPDATED: added Timeline tab entry
//   const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
//     { id: 'overview', label: 'Overview', icon: <User size={13} /> },
//     { id: 'matched', label: `Matched Properties (${matchedProperties.length})`, icon: <Sparkles size={13} /> },
//     { id: 'requirements', label: 'Requirements', icon: <Building size={13} /> },
//     { id: 'property', label: 'Linked Property', icon: <Home size={13} /> },
//     { id: 'notes', label: 'Notes & Address', icon: <StickyNote size={13} /> },
//     { id: 'timeline', label: `Timeline (${followups.length + visits.length + activities.length})`, icon: <Clock size={13} /> },
//   ];

//   return (
//     <div className="min-h-screen flex flex-col bg-slate-50 text-xs">
//       <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 sticky top-0 z-40 shadow-xs">
//         <div className="flex items-center justify-between gap-3">
//           <div className="flex items-center gap-2.5 min-w-0">
//             <button onClick={onBack} className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#0f2b3d] transition-colors flex-shrink-0">
//               <ArrowLeft size={16} />
//             </button>
//             <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs" style={{ background: 'linear-gradient(135deg, #e67e22, #f39c12)' }}>
//               {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
//             </div>
//             <div className="min-w-0">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h1 className="text-sm font-bold text-gray-900 truncate leading-none">{tenant.name}</h1>
//                 <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">{tenant.tenant_id}</span>
//                 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg}`}>
//                   {statusCfg.icon} {tenant.status}
//                 </span>
//               </div>
//               <p className="text-[10px] text-gray-400 mt-0.5 truncate">
//                 Category: <span className="font-semibold text-gray-600 capitalize">{tenant.tenant_type || 'Renter'}</span>
//                 {tenant.assigned_to_name && (
//                   <span className="ml-2">| Exec: <span className="font-semibold text-blue-600">{tenant.assigned_to_name}</span></span>
//                 )}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 flex-shrink-0">
//             <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 mr-1">
//               <span>{currentIndex + 1}/{totalTenants}</span>
//               <button onClick={onPrevious} disabled={currentIndex === 0} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700"><ChevronLeft size={13} /></button>
//               <button onClick={onNext} disabled={currentIndex === totalTenants - 1} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700"><ChevronRight size={13} /></button>
//             </div>
//             <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white font-bold text-xs shadow-xs transition-colors" style={{ background: N }}>
//               <Edit size={13} /> <span className="hidden sm:inline">Edit Tenant</span>
//             </button>
//           </div>
//         </div>
//         <div className="flex items-center space-x-1 mt-2 pt-1 border-t border-gray-100 overflow-x-auto no-scrollbar">
//           {tabs.map((tab) => (
//             <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all text-xs font-semibold whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
//               {tab.icon}
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2">
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full">
//           <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-lg p-2 border border-amber-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0"><Banknote size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Rent Budget</p><p className="text-xs font-bold text-orange-700 truncate">{hasBudget ? `${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}` : 'Not set'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg p-2 border border-blue-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0"><Home size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Preferred BHK</p><p className="text-xs font-bold text-blue-700 truncate">{tenant.preferred_bhk || '—'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-lg p-2 border border-emerald-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0"><MapPin size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Location</p><p className="text-xs font-bold text-emerald-700 truncate">{tenant.preferred_location || 'Any Location'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-purple-50 to-pink-50/50 rounded-lg p-2 border border-purple-200/60 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0"><Calendar size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Move-In Date</p><p className="text-xs font-bold text-purple-700 truncate">{tenant.move_in_date ? new Date(tenant.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}</p></div>
//           </div>
//           <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-lg p-2 border border-gray-200 flex items-center gap-2">
//             <div className="w-7 h-7 rounded-md bg-slate-500/10 text-slate-700 flex items-center justify-center flex-shrink-0"><Clock size={14} /></div>
//             <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Days Active</p><p className="text-xs font-bold text-slate-800 truncate">{daysActive !== null ? `${daysActive} Days` : '—'}</p></div>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 p-3 md:p-5 w-full space-y-4">
//         {activeTab === 'overview' && (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
//             <div className="lg:col-span-2 space-y-4">
//               <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
//                 <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2"><User size={14} className="text-orange-500" /> Contact Details</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
//                   <CompactDetailRow label="Full Name" value={tenant.name} />
//                   <CompactDetailRow label="Tenant ID" value={<span className="font-bold text-orange-600">{tenant.tenant_id}</span>} />
//                   <CompactDetailRow label="Phone" value={tenant.phone || '—'} />
//                   <CompactDetailRow label="Email" value={tenant.email || '—'} />
//                   <CompactDetailRow label="WhatsApp" value={tenant.whatsapp || tenant.phone || '—'} />
//                   <CompactDetailRow label="Category" value={tenant.tenant_type || '—'} />
//                 </div>
//               </div>
//               <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
//                 <div className="flex items-center justify-between border-b border-gray-100 pb-2">
//                   <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
//                     <Sparkles size={14} className="text-amber-500" /> Matched Properties for Tenant
//                   </h3>
//                   <button
//                     onClick={() => setActiveTab('matched')}
//                     className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
//                   >
//                     View All ({matchedProperties.length})
//                   </button>
//                 </div>

//                 {loadingMatched ? (
//                   <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
//                     <Loader2 size={16} className="animate-spin text-orange-500" />
//                     <span>Finding matching properties...</span>
//                   </div>
//                 ) : matchedProperties.length > 0 ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {matchedProperties.slice(0, 4).map((p: any) => {
//                       const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
//                       const propLoc = p.location_name || p.society_name || p.address || p.location || p.city_name || p.city || tenant.preferred_location || 'Pune';
//                       const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);

//                       return (
//                         <div key={p.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors">
//                           <div className="space-y-1">
//                             <div className="flex items-center justify-between gap-1">
//                               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100/80 text-orange-800 border border-orange-200/50">RENT-{p.id}</span>
//                               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/50">
//                                 {p.matchScore}% Match
//                               </span>
//                             </div>
//                             <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug">{propTitle}</h4>
//                             <p className="text-[10px] text-gray-500 flex items-center gap-1">
//                               <MapPin size={11} className="text-gray-400 flex-shrink-0" />
//                               <span className="truncate">{propLoc}</span>
//                             </p>
//                           </div>

//                           <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
//                             <div>
//                               <span className="text-[9px] font-bold text-gray-400 uppercase">Rent</span>
//                               <p className="text-xs font-bold text-green-700">{propRent > 0 ? `${fmtINR(propRent)}/mo` : 'Contact for Rent'}</p>
//                             </div>
//                             <button
//                               onClick={() => handleLinkProperty(p)}
//                               className="flex items-center gap-1 px-3 py-1.5 bg-[#0f2b3d] hover:bg-[#1a4a6a] text-white rounded-lg text-[10px] font-bold transition-colors shadow-2xs"
//                             >
//                               <Link2 size={11} /> Link Property
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <p className="text-xs text-gray-400 italic py-3 text-center">No properties matching this tenant's criteria.</p>
//                 )}
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
//                 <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2"><Home size={14} className="text-orange-500" /> Linked Property</h3>
//                 {tenant.rental_property_id ? (
//                   <div className="bg-orange-50/60 p-3 rounded-lg border border-orange-100">
//                     <p className="text-[10px] font-bold text-orange-600">RENT-{tenant.rental_property_id}</p>
//                     <p className="text-xs font-bold text-gray-800">{tenant.property_title}</p>
//                   </div>
//                 ) : <p className="text-xs text-gray-400">No property linked.</p>}
//               </div>
//             </div>
//           </div>
//         )}
//         {activeTab === 'matched' && (
//           <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4 w-full">
//             <div className="flex items-center justify-between border-b border-gray-100 pb-3">
//               <div>
//                 <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
//                   <Sparkles size={16} className="text-amber-500" /> Matched Properties According to Preference
//                 </h3>
//                 <p className="text-[11px] text-gray-500 mt-0.5">
//                   Filtered by BHK ({tenant.preferred_bhk || 'Any'}), Location ({tenant.preferred_location || 'Any'}), Budget ({fmtINR(budgetMin)} - {fmtINR(budgetMax)})
//                 </p>
//               </div>
//               <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
//                 {matchedProperties.length} Properties Matched
//               </span>
//             </div>

//             {loadingMatched ? (
//               <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
//                 <Loader2 size={20} className="animate-spin text-orange-500" />
//                 <span>Searching properties matching tenant preferences...</span>
//               </div>
//             ) : matchedProperties.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {matchedProperties.map((p: any) => {
//                   const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
//                   const propLoc = p.location_name || p.society_name || p.address || p.location || p.city_name || p.city || tenant.preferred_location || 'Pune';
//                   const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);

//                   return (
//                     <div key={p.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
//                       <div className="space-y-1.5">
//                         <div className="flex items-center justify-between">
//                           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100/80 text-orange-800 border border-orange-200/50">RENT-{p.id}</span>
//                           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 flex items-center gap-1">
//                             <CheckCircle2 size={10} /> {p.matchScore}% Match
//                           </span>
//                         </div>
//                         <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{propTitle}</h4>
//                         <p className="text-[11px] text-gray-600 flex items-center gap-1">
//                           <MapPin size={12} className="text-gray-400 flex-shrink-0" />
//                           <span className="truncate">{propLoc}</span>
//                         </p>
//                       </div>

//                       <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
//                         <div>
//                           <span className="text-[9px] font-bold text-gray-400 uppercase">Monthly Rent</span>
//                           <p className="text-xs font-bold text-green-700">{propRent > 0 ? `${fmtINR(propRent)}/mo` : 'Contact'}</p>
//                         </div>
//                         <button
//                           onClick={() => handleLinkProperty(p)}
//                           className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2b3d] hover:bg-[#1a4a6a] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
//                         >
//                           <Link2 size={12} /> Link Property
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-12 text-gray-400 italic">
//                 <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
//                 <p>No properties match this tenant's specific preferences right now.</p>
//               </div>
//             )}
//           </div>
//         )}
//         {activeTab === 'requirements' && (
//           <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
//             <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Criteria</h3>
//             <CompactDetailRow label="Min Rent" value={fmtINR(budgetMin)} />
//             <CompactDetailRow label="Max Rent" value={fmtINR(budgetMax)} />
//           </div>
//         )}

//         {/* 👇 NEW: Timeline tab — shows Follow-ups, Visits & Activities */}
//         {activeTab === 'timeline' && (
//           <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
//             <div className="flex items-center justify-between border-b border-gray-100 pb-2">
//               <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
//                 <Clock size={14} className="text-orange-500" /> Follow-ups, Visits &amp; Activities
//               </h3>
//               <button
//                 onClick={fetchTimelineData}
//                 className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
//               >
//                 Refresh
//               </button>
//             </div>

//             {loadingTimeline ? (
//               <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
//                 <Loader2 size={18} className="animate-spin text-orange-500" />
//                 <span>Loading timeline...</span>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* Follow-ups */}
//                 <div>
//                   <h4 className="text-[11px] font-bold text-amber-600 uppercase mb-2 flex items-center gap-1">
//                     <Bell size={12} /> Follow-ups ({followups.length})
//                   </h4>
//                   <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
//                     {followups.length ? followups.map((f: any, i: number) => (
//                       <div key={f.id ?? i} className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-100 text-[11px]">
//                         <div className="font-semibold text-gray-800">
//                           {f.followup_type || f.next_action || 'Follow-up'}
//                         </div>
//                         {(f.custom_remark || f.remark) && (
//                           <div className="text-gray-500 mt-0.5">{f.custom_remark || f.remark}</div>
//                         )}
//                         {(f.schedule_date || f.schedule_time) && (
//                           <div className="text-gray-400 text-[10px] mt-1 flex items-center gap-1">
//                             <Calendar size={10} /> {f.schedule_date} {f.schedule_time}
//                           </div>
//                         )}
//                       </div>
//                     )) : (
//                       <p className="text-[11px] text-gray-400 italic">No follow-ups yet.</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Visits */}
//                 <div>
//                   <h4 className="text-[11px] font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
//                     <Calendar size={12} /> Visits ({visits.length})
//                   </h4>
//                   <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
//                     {visits.length ? visits.map((v: any, i: number) => (
//                       <div key={v.id ?? i} className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 text-[11px]">
//                         <div className="font-semibold text-gray-800">
//                           {v.property_title || v.visit_type || 'Site Visit'}
//                         </div>
//                         {(v.visit_date || v.visit_time) && (
//                           <div className="text-gray-400 text-[10px] mt-1 flex items-center gap-1">
//                             <Clock size={10} /> {v.visit_date} {v.visit_time}
//                           </div>
//                         )}
//                         {v.notes && <div className="text-gray-500 mt-0.5">{v.notes}</div>}
//                       </div>
//                     )) : (
//                       <p className="text-[11px] text-gray-400 italic">No visits scheduled.</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Activities */}
//                 <div>
//                   <h4 className="text-[11px] font-bold text-indigo-600 uppercase mb-2 flex items-center gap-1">
//                     <Plus size={12} /> Activities ({activities.length})
//                   </h4>
//                   <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
//                     {activities.length ? activities.map((a: any, i: number) => (
//                       <div key={a.id ?? i} className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px]">
//                         <div className="font-semibold text-gray-800">
//                           {a.title || a.activity_type || 'Activity'}
//                         </div>
//                         {(a.description || a.notes) && (
//                           <div className="text-gray-500 mt-0.5">{a.description || a.notes}</div>
//                         )}
//                         {a.created_at && (
//                           <div className="text-gray-400 text-[10px] mt-1">{a.created_at}</div>
//                         )}
//                       </div>
//                     )) : (
//                       <p className="text-[11px] text-gray-400 italic">No activities logged.</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <div className="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
//         <div className="flex items-center justify-between w-full gap-2 flex-wrap text-xs">
//           <div className="flex items-center gap-1.5 flex-wrap">
//             <button onClick={handleWhatsApp} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: '#25D366' }}><SiWhatsapp size={13} /><span>WhatsApp</span></button>
//             <button onClick={handleEmail} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-blue-600 hover:bg-blue-700"><Mail size={13} /><span>Email</span></button>
//             {tenant.phone && (<a href={`tel:${tenant.phone}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: BRAND }}><Phone size={13} /><span>Call</span></a>)}
//           </div>
//           <div className="flex items-center gap-1.5 flex-wrap">
//             <button onClick={() => setShowVisitModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-emerald-600 hover:bg-emerald-700"><Calendar size={13} /><span>Schedule Visit</span></button>
//             <button onClick={() => setShowActivityModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-indigo-600 hover:bg-indigo-700"><Plus size={13} /><span>Add Activity</span></button>
//             <button onClick={() => setShowFollowupModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-amber-600 hover:bg-amber-700"><Bell size={13} /><span>Follow-up</span></button>
//             <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: N }}><Edit size={13} /><span>Edit</span></button>
//           </div>
//         </div>
//       </div>

//       {showEditModal && <TenantFormModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} mode="edit" initialData={tenant as any} onSubmit={handleSaveTenant as any} />}

//       {/* 👇 UPDATED: onClose now also refreshes the timeline so new data appears immediately */}
//       {showFollowupModal && (
//         <TenantFollowupModal
//           isOpen={showFollowupModal}
//           onClose={() => { setShowFollowupModal(false); fetchTimelineData(); }}
//           tenant={tenant}
//         />
//       )}
//       {showVisitModal && (
//         <TenantVisitModal
//           isOpen={showVisitModal}
//           onClose={() => { setShowVisitModal(false); fetchTimelineData(); }}
//           tenant={tenant}
//         />
//       )}
//       {showActivityModal && (
//         <TenantActivityModal
//           isOpen={showActivityModal}
//           onClose={() => { setShowActivityModal(false); fetchTimelineData(); }}
//           tenant={tenant}
//         />
//       )}
//     </div>
//   );
// }




import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Building, Calendar, Edit,
  ChevronLeft, ChevronRight, Home, Banknote, CheckCircle2,
  Clock, AlertCircle, StickyNote, Plus, Bell, Sparkles, Link2,
  Loader2,
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import TenantFormModal from './TenantFormModal';
import TenantFollowupModal from './TenantFollowupModal';
import TenantVisitModal from './TenantVisitModal';
import TenantActivityModal from './TenantActivityModal';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { toast } from 'react-toastify';

// ⚠️ CHANGE THESE IMPORT PATHS/NAMES TO MATCH YOUR ACTUAL API FILES
// (same pattern as buyerFollowupAPI.ts you shared — getByTenantId should
// return either an array, or { data: [...] })
import { tenantFollowupAPI } from '@/lib/tenantFollowupAPI';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { tenantActivityAPI } from '@/lib/tenantActivityAPI';
import { tenantAPI } from '@/lib/tenantAPI';

interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferred_location: string;
  budget_min: string | number;
  budget_max: string | number;
  preferred_bhk: string;
  tenant_type: string;
  move_in_date?: string;
  current_address?: string;
  notes?: string;
  status: string;
  rental_property_id?: number | string | null;
  property_title?: string;
  owner_name?: string;
  assigned_to?: number | string;
  assigned_to_name?: string;
  created_at?: string;
}

interface TenantViewPageProps {
  tenant: Tenant;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalTenants?: number;
  onUpdateTenant?: (updated: Tenant) => void;
}

const BRAND = '#e67e22';
const N = '#0f2b3d';

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  'Active Search': { bg: 'bg-green-50 text-green-700 border-green-200', text: 'text-green-700', icon: <CheckCircle2 size={11} /> },
  'Interested': { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', icon: <AlertCircle size={11} /> },
  'Agreement Signed': { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', icon: <CheckCircle2 size={11} /> },
  'Inactive': { bg: 'bg-gray-100 text-gray-600 border-gray-200', text: 'text-gray-500', icon: <Clock size={11} /> },
};

// 👇 NEW: split into 3 separate tabs instead of one combined 'timeline'
type Tab = 'overview' | 'requirements' | 'matched' | 'property' | 'notes' | 'followups' | 'visits' | 'activities';

function CompactDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100/80 last:border-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-gray-800 text-right truncate max-w-[220px]">{value}</span>
    </div>
  );
}

export default function TenantViewPage({
  tenant: initialTenant,
  onBack,
  onNext,
  onPrevious,
  currentIndex = 0,
  totalTenants = 1,
  onUpdateTenant,
}: TenantViewPageProps) {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loadingMatched, setLoadingMatched] = useState<boolean>(false);

  // 👇 NEW: timeline state (follow-ups, visits, activities)
  const [followups, setFollowups] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  // 👇 NEW: fetch follow-ups, visits & activities for this tenant
  const fetchTimelineData = async () => {
    setLoadingTimeline(true);
    try {
      const [fRes, vRes, aRes] = await Promise.all([
        tenantFollowupAPI.getByTenantId(tenant.id),
        tenantVisitAPI.getByTenantId(tenant.id),
        tenantActivityAPI.getByTenantId(tenant.id),
      ]);

      const toArray = (res: any) =>
        Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

      setFollowups(toArray(fRes));
      setVisits(toArray(vRes));
      setActivities(toArray(aRes));
    } catch (err) {
      console.error('Failed to load tenant timeline:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  useEffect(() => {
    const fetchRentalProperties = async () => {
      setLoadingMatched(true);
      try {
        const res = await rentalPropertiesAPI.PublicgetProperties();
        const list = Array.isArray(res) ? res : res?.data || res?.properties || [];
        setAllProperties(list);
      } catch (err) {
        console.error('Error fetching rental properties for matching:', err);
      } finally {
        setLoadingMatched(false);
      }
    };
    fetchRentalProperties();
  }, []);

  // 👇 NEW: load timeline data on mount / when tenant changes
  useEffect(() => {
    fetchTimelineData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.id]);

  const statusCfg = statusConfig[tenant.status] ?? statusConfig['Inactive'];
  const budgetMin = Number(tenant.budget_min) || 0;
  const budgetMax = Number(tenant.budget_max) || 0;
  const hasBudget = budgetMin > 0 || budgetMax > 0;
  const fmtINR = (n: number) => (n > 0 ? `\u20b9${n.toLocaleString('en-IN')}` : '\u2014');

  const matchedProperties = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return [];

    const prefBhk = (tenant.preferred_bhk || '').toLowerCase().trim();
    const prefLoc = (tenant.preferred_location || '').toLowerCase().trim();

    return allProperties
      .map((p: any) => {
        let score = 0;
        let reasons: string[] = [];

        const pType = (p.property_type_name || p.property_type || p.unit_type || p.title || '').toLowerCase();
        if (prefBhk && (pType.includes(prefBhk) || prefBhk.includes(pType))) {
          score += 40;
          reasons.push(`${tenant.preferred_bhk} BHK Match`);
        }

        const rent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);
        if (rent > 0 && hasBudget) {
          if (rent >= budgetMin && rent <= budgetMax) {
            score += 40;
            reasons.push('In Budget');
          } else if (rent <= budgetMax * 1.15 && rent >= budgetMin * 0.85) {
            score += 25;
            reasons.push('Near Budget');
          }
        } else {
          score += 20;
        }

        const pLoc = (p.location_name || p.society_name || p.address || p.city_name || '').toLowerCase();
        if (prefLoc && pLoc.includes(prefLoc)) {
          score += 20;
          reasons.push('Location Match');
        } else if (!prefLoc) {
          score += 10;
        }

        return {
          ...p,
          matchScore: Math.min(100, score),
          matchReasons: reasons,
        };
      })
      .filter((p: any) => p.matchScore >= 40)
      .sort((a: any, b: any) => b.matchScore - a.matchScore);
  }, [allProperties, tenant.preferred_bhk, tenant.preferred_location, budgetMin, budgetMax, hasBudget]);

  const handleSaveTenant = (updated: Tenant) => {
    setTenant(updated);
    onUpdateTenant?.(updated);
    setShowEditModal(false);
  };

  const handleLinkProperty = (property: any) => {
    const updated = {
      ...tenant,
      rental_property_id: property.id,
      property_title: property.title || property.property_type_name || `Rental Unit RENT-${property.id}`,
      owner_name: property.seller_name || property.owner_name || 'Owner',
    };
    setTenant(updated);
    onUpdateTenant?.(updated);
    toast.success(`Linked RENT-${property.id} to ${tenant.name}`);
  };

  const daysActive = tenant.created_at
    ? Math.max(0, Math.floor((Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const handleWhatsApp = () => {
    const phone = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '');
    if (!phone) {
      toast.error('No phone number available for WhatsApp');
      return;
    }
    
    // Construct matched properties text
    let matchedPropsText = '';
    if (matchedProperties && matchedProperties.length > 0) {
      matchedPropsText = '\n\nWe found the following matching rental property options for you:\n' +
        matchedProperties.slice(0, 3).map((p: any, idx: number) => {
          const title = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
          const location = p.location_name || p.society_name || p.address || p.location || '';
          const rent = Number(p.expected_rent || p.monthly_rent || p.rent || 0);
          const rentStr = rent > 0 ? `₹${rent.toLocaleString('en-IN')}/mo` : 'Contact for Rent';
          return `${idx + 1}. *${title}*\n   📍 Location: ${location}\n   💰 Rent: ${rentStr}\n   ⭐ Match Score: ${p.matchScore}%`;
        }).join('\n\n');
    } else {
      matchedPropsText = '\n\nCurrently, we are searching for matching rental properties for you.';
    }

    const message = `Hi ${tenant.name},\n\n` +
      `Regarding your property search (${tenant.preferred_bhk || ''} in ${tenant.preferred_location || 'preferred location'}).\n` +
      `Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo.` +
      `${matchedPropsText}\n\n` +
      `Please let us know your availability.\n\n` +
      `Best Regards,\nResaleExpert Team`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSharePropertyWhatsApp = (p: any) => {
    const phone = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '');
    if (!phone) {
      toast.error('No phone number available for WhatsApp');
      return;
    }
    const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
    const propLoc = p.location_name || p.society_name || p.address || p.location || '';
    const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || 0);
    const rentStr = propRent > 0 ? `₹${propRent.toLocaleString('en-IN')}/mo` : 'Contact for Rent';

    const message = `Hi ${tenant.name},\n\n` +
      `I found a rental property that is an excellent match for you!\n\n` +
      `🏠 *${propTitle}*\n` +
      `📍 Location: ${propLoc}\n` +
      `💰 Rent: ${rentStr}\n` +
      `⭐ Match Score: ${p.matchScore}%\n\n` +
      `Let me know if you would like to schedule a site visit.\n\n` +
      `Best Regards,\nResaleExpert Team`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = `Rental Requirement Update - ${tenant.name}`;
    const body = `Dear ${tenant.name},\n\nWe have property updates matching your requirement (${tenant.preferred_bhk || ''} in ${tenant.preferred_location || ''}).\nBudget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}.\n\nBest regards,\nResaleExpert Team`;
    window.open(`mailto:${tenant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  // 👇 UPDATED: 3 separate tab entries instead of one combined Timeline tab
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User size={13} /> },
    { id: 'matched', label: `Matched Properties (${matchedProperties.length})`, icon: <Sparkles size={13} /> },
    { id: 'requirements', label: 'Requirements', icon: <Building size={13} /> },
    { id: 'property', label: 'Linked Property', icon: <Home size={13} /> },
    { id: 'notes', label: 'Notes & Address', icon: <StickyNote size={13} /> },
    { id: 'followups', label: `Follow-ups (${followups.length})`, icon: <Bell size={13} /> },
    { id: 'visits', label: `Visits (${visits.length})`, icon: <Calendar size={13} /> },
    { id: 'activities', label: `Activities (${activities.length})`, icon: <Plus size={13} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-xs">
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button onClick={onBack} className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[#0f2b3d] transition-colors flex-shrink-0">
              <ArrowLeft size={16} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs" style={{ background: 'linear-gradient(135deg, #e67e22, #f39c12)' }}>
              {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-bold text-gray-900 truncate leading-none">{tenant.name}</h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60">{tenant.tenant_id}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg}`}>
                  {statusCfg.icon} {tenant.status}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                Category: <span className="font-semibold text-gray-600 capitalize">{tenant.tenant_type || 'Renter'}</span>
                {tenant.assigned_to_name && (
                  <span className="ml-2">| Exec: <span className="font-semibold text-blue-600">{tenant.assigned_to_name}</span></span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 mr-1">
              <span>{currentIndex + 1}/{totalTenants}</span>
              <button onClick={onPrevious} disabled={currentIndex === 0} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700"><ChevronLeft size={13} /></button>
              <button onClick={onNext} disabled={currentIndex === totalTenants - 1} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700"><ChevronRight size={13} /></button>
            </div>
            <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white font-bold text-xs shadow-xs transition-colors" style={{ background: N }}>
              <Edit size={13} /> <span className="hidden sm:inline">Edit Tenant</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-1 mt-2 pt-1 border-t border-gray-100 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all text-xs font-semibold whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-lg p-2 border border-amber-200/60 flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0"><Banknote size={14} /></div>
            <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Rent Budget</p><p className="text-xs font-bold text-orange-700 truncate">{hasBudget ? `${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}` : 'Not set'}</p></div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg p-2 border border-blue-200/60 flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0"><Home size={14} /></div>
            <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Preferred BHK</p><p className="text-xs font-bold text-blue-700 truncate">{tenant.preferred_bhk || '—'}</p></div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-lg p-2 border border-emerald-200/60 flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0"><MapPin size={14} /></div>
            <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Location</p><p className="text-xs font-bold text-emerald-700 truncate">{tenant.preferred_location || 'Any Location'}</p></div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50/50 rounded-lg p-2 border border-purple-200/60 flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0"><Calendar size={14} /></div>
            <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Move-In Date</p><p className="text-xs font-bold text-purple-700 truncate">{tenant.move_in_date ? new Date(tenant.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Flexible'}</p></div>
          </div>
          <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-lg p-2 border border-gray-200 flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-500/10 text-slate-700 flex items-center justify-center flex-shrink-0"><Clock size={14} /></div>
            <div className="min-w-0"><p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Days Active</p><p className="text-xs font-bold text-slate-800 truncate">{daysActive !== null ? `${daysActive} Days` : '—'}</p></div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 md:p-5 w-full space-y-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2"><User size={14} className="text-orange-500" /> Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  <CompactDetailRow label="Full Name" value={tenant.name} />
                  <CompactDetailRow label="Tenant ID" value={<span className="font-bold text-orange-600">{tenant.tenant_id}</span>} />
                  <CompactDetailRow label="Phone" value={tenant.phone || '—'} />
                  <CompactDetailRow label="Email" value={tenant.email || '—'} />
                  <CompactDetailRow label="WhatsApp" value={tenant.whatsapp || tenant.phone || '—'} />
                  <CompactDetailRow label="Category" value={tenant.tenant_type || '—'} />
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" /> Matched Properties for Tenant
                  </h3>
                  <button
                    onClick={() => setActiveTab('matched')}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    View All ({matchedProperties.length})
                  </button>
                </div>

                {loadingMatched ? (
                  <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
                    <Loader2 size={16} className="animate-spin text-orange-500" />
                    <span>Finding matching properties...</span>
                  </div>
                ) : matchedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedProperties.slice(0, 4).map((p: any) => {
                      const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
                      const propLoc = p.location_name || p.society_name || p.address || p.location || p.city_name || p.city || tenant.preferred_location || 'Pune';
                      const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);

                      return (
                        <div key={p.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2 hover:border-slate-300 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100/80 text-orange-800 border border-orange-200/50">RENT-{p.id}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/50">
                                {p.matchScore}% Match
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-snug">{propTitle}</h4>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                              <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{propLoc}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Rent</span>
                              <p className="text-xs font-bold text-green-700">{propRent > 0 ? `${fmtINR(propRent)}/mo` : 'Contact for Rent'}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSharePropertyWhatsApp(p)}
                                className="flex items-center justify-center p-1 rounded-lg border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Share via WhatsApp"
                              >
                                <SiWhatsapp size={11} />
                              </button>
                              <button
                                onClick={() => handleLinkProperty(p)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#0f2b3d] hover:bg-[#1a4a6a] text-white rounded-lg text-[10px] font-bold transition-colors shadow-2xs"
                              >
                                <Link2 size={11} /> Link Property
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-3 text-center">No properties matching this tenant's criteria.</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2"><Home size={14} className="text-orange-500" /> Linked Property</h3>
                {tenant.rental_property_id ? (
                  <div className="bg-orange-50/60 p-3 rounded-lg border border-orange-100">
                    <p className="text-[10px] font-bold text-orange-600">RENT-{tenant.rental_property_id}</p>
                    <p className="text-xs font-bold text-gray-800">{tenant.property_title}</p>
                  </div>
                ) : <p className="text-xs text-gray-400">No property linked.</p>}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'matched' && (
          <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" /> Matched Properties According to Preference
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Filtered by BHK ({tenant.preferred_bhk || 'Any'}), Location ({tenant.preferred_location || 'Any'}), Budget ({fmtINR(budgetMin)} - {fmtINR(budgetMax)})
                </p>
              </div>
              <div className="flex items-center gap-2">
                {matchedProperties.length > 0 && (
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-colors"
                    title="Send all matches to tenant via WhatsApp"
                  >
                    <SiWhatsapp size={12} /> Send matches to WhatsApp
                  </button>
                )}
                <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                  {matchedProperties.length} Properties Matched
                </span>
              </div>
            </div>

            {loadingMatched ? (
              <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 size={20} className="animate-spin text-orange-500" />
                <span>Searching properties matching tenant preferences...</span>
              </div>
            ) : matchedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchedProperties.map((p: any) => {
                  const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
                  const propLoc = p.location_name || p.society_name || p.address || p.location || p.city_name || p.city || tenant.preferred_location || 'Pune';
                  const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);

                  return (
                    <div key={p.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100/80 text-orange-800 border border-orange-200/50">RENT-{p.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 flex items-center gap-1">
                            <CheckCircle2 size={10} /> {p.matchScore}% Match
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{propTitle}</h4>
                        <p className="text-[11px] text-gray-600 flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{propLoc}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Monthly Rent</span>
                          <p className="text-xs font-bold text-green-700">{propRent > 0 ? `${fmtINR(propRent)}/mo` : 'Contact'}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSharePropertyWhatsApp(p)}
                            className="flex items-center justify-center p-1.5 rounded-lg border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="Share via WhatsApp"
                          >
                            <SiWhatsapp size={12} />
                          </button>
                          <button
                            onClick={() => handleLinkProperty(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f2b3d] hover:bg-[#1a4a6a] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                          >
                            <Link2 size={12} /> Link Property
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic">
                <Sparkles size={32} className="mx-auto mb-2 opacity-30" />
                <p>No properties match this tenant's specific preferences right now.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'requirements' && (
          <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Criteria</h3>
            <CompactDetailRow label="Min Rent" value={fmtINR(budgetMin)} />
            <CompactDetailRow label="Max Rent" value={fmtINR(budgetMax)} />
          </div>
        )}

        {/* 👇 NEW: Follow-ups tab (separate) */}
        {activeTab === 'followups' && (
          <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={14} className="text-amber-500" /> Follow-ups ({followups.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFollowupModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-white font-bold text-[11px] bg-amber-600 hover:bg-amber-700 transition-colors"
                >
                  <Plus size={12} /> Add Follow-up
                </button>
                <button onClick={fetchTimelineData} className="text-[11px] font-bold text-orange-600 hover:text-orange-700">
                  Refresh
                </button>
              </div>
            </div>

            {loadingTimeline ? (
              <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 size={18} className="animate-spin text-orange-500" />
                <span>Loading follow-ups...</span>
              </div>
            ) : followups.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {followups.map((f: any, i: number) => (
                  <div key={f.id ?? i} className="p-3 bg-amber-50/60 rounded-lg border border-amber-100 text-[11px]">
                    <div className="font-semibold text-gray-800">
                      {f.followup_type || f.next_action || 'Follow-up'}
                    </div>
                    {f.priority && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        {f.priority}
                      </span>
                    )}
                    {(f.custom_remark || f.remark) && (
                      <div className="text-gray-500 mt-1.5">{f.custom_remark || f.remark}</div>
                    )}
                    {(f.schedule_date || f.schedule_time) && (
                      <div className="text-gray-400 text-[10px] mt-1.5 flex items-center gap-1">
                        <Calendar size={10} /> {f.schedule_date} {f.schedule_time}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p>No follow-ups yet for this tenant.</p>
              </div>
            )}
          </div>
        )}

        {/* 👇 NEW: Visits tab (separate) */}
        {activeTab === 'visits' && (
          <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-500" /> Visits ({visits.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVisitModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-white font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={12} /> Schedule Visit
                </button>
                <button onClick={fetchTimelineData} className="text-[11px] font-bold text-orange-600 hover:text-orange-700">
                  Refresh
                </button>
              </div>
            </div>

            {loadingTimeline ? (
              <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 size={18} className="animate-spin text-orange-500" />
                <span>Loading visits...</span>
              </div>
            ) : visits.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visits.map((v: any, i: number) => (
                  <div key={v.id ?? i} className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-[11px]">
                    <div className="font-semibold text-gray-800">
                      {v.property_title || v.visit_type || 'Site Visit'}
                    </div>
                    {v.status && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        {v.status}
                      </span>
                    )}
                    {(v.visit_date || v.visit_time) && (
                      <div className="text-gray-400 text-[10px] mt-1.5 flex items-center gap-1">
                        <Clock size={10} /> {v.visit_date} {v.visit_time}
                      </div>
                    )}
                    {v.notes && <div className="text-gray-500 mt-1.5">{v.notes}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p>No visits scheduled for this tenant.</p>
              </div>
            )}
          </div>
        )}

        {/* 👇 NEW: Activities tab (separate) */}
        {activeTab === 'activities' && (
          <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus size={14} className="text-indigo-500" /> Activities ({activities.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowActivityModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-white font-bold text-[11px] bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={12} /> Add Activity
                </button>
                <button onClick={fetchTimelineData} className="text-[11px] font-bold text-orange-600 hover:text-orange-700">
                  Refresh
                </button>
              </div>
            </div>

            {loadingTimeline ? (
              <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 size={18} className="animate-spin text-orange-500" />
                <span>Loading activities...</span>
              </div>
            ) : activities.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activities.map((a: any, i: number) => (
                  <div key={a.id ?? i} className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px]">
                    <div className="font-semibold text-gray-800">
                      {a.title || a.activity_type || 'Activity'}
                    </div>
                    {(a.description || a.notes) && (
                      <div className="text-gray-500 mt-1.5">{a.description || a.notes}</div>
                    )}
                    {a.created_at && (
                      <div className="text-gray-400 text-[10px] mt-1.5">{a.created_at}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic">
                <Plus size={32} className="mx-auto mb-2 opacity-30" />
                <p>No activities logged for this tenant.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Notes & Address</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Current Address</span>
                <p className="text-xs font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-1">{tenant.current_address || 'No address specified.'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Preferences Notes</span>
                <p className="text-xs font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mt-1 whitespace-pre-wrap">{tenant.notes || 'No custom notes.'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'property' && (
          <div className="w-full bg-white rounded-xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <Home size={16} className="text-orange-500" /> Currently Linked Rental Property
            </h3>
            {tenant.rental_property_id ? (
              <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-200/50 max-w-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                    RENT-{tenant.rental_property_id}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Linked Tenant Unit
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{tenant.property_title}</h4>
                  {tenant.owner_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Landlord/Owner:</strong> {tenant.owner_name}
                    </p>
                  )}
                </div>
                <div className="pt-3 border-t border-orange-200 flex justify-end gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await tenantAPI.update(tenant.id, { rental_property_id: null, property_title: null });
                        toast.success('Property unlinked successfully');
                        handleSaveTenant({ ...tenant, rental_property_id: null, property_title: undefined, owner_name: undefined });
                      } catch (err) {
                        toast.error('Failed to unlink property');
                      }
                    }}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                  >
                    Unlink Property
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic">
                <Home size={32} className="mx-auto mb-2 opacity-30" />
                <p>No property is currently linked to this tenant.</p>
                <button
                  onClick={() => setActiveTab('matched')}
                  className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  View Matched Properties
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
        <div className="flex items-center justify-between w-full gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={handleWhatsApp} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: '#25D366' }}><SiWhatsapp size={13} /><span>WhatsApp</span></button>
            <button onClick={handleEmail} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-blue-600 hover:bg-blue-700"><Mail size={13} /><span>Email</span></button>
            {tenant.phone && (<a href={`tel:${tenant.phone}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: BRAND }}><Phone size={13} /><span>Call</span></a>)}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setShowVisitModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-emerald-600 hover:bg-emerald-700"><Calendar size={13} /><span>Schedule Visit</span></button>
            <button onClick={() => setShowActivityModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-indigo-600 hover:bg-indigo-700"><Plus size={13} /><span>Add Activity</span></button>
            <button onClick={() => setShowFollowupModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs bg-amber-600 hover:bg-amber-700"><Bell size={13} /><span>Follow-up</span></button>
            <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white font-bold transition-all shadow-2xs text-xs" style={{ background: N }}><Edit size={13} /><span>Edit</span></button>
          </div>
        </div>
      </div>

      {showEditModal && <TenantFormModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} mode="edit" initialData={tenant as any} onSubmit={handleSaveTenant as any} />}

      {/* 👇 UPDATED: onClose now also refreshes the timeline so new data appears immediately */}
      {showFollowupModal && (
        <TenantFollowupModal
          isOpen={showFollowupModal}
          onClose={() => { setShowFollowupModal(false); fetchTimelineData(); }}
          tenant={tenant}
        />
      )}
      {showVisitModal && (
        <TenantVisitModal
          isOpen={showVisitModal}
          onClose={() => { setShowVisitModal(false); fetchTimelineData(); }}
          tenant={tenant}
        />
      )}
      {showActivityModal && (
        <TenantActivityModal
          isOpen={showActivityModal}
          onClose={() => { setShowActivityModal(false); fetchTimelineData(); }}
          tenant={tenant}
        />
      )}
    </div>
  );
}