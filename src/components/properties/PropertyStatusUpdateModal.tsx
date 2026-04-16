// import React, { useState, useEffect } from 'react';
// import {
//   X, Save, Target, AlertCircle, CheckCircle, Pause, Trophy,
//   MessageCircle, Clock, Calendar, User, DollarSign
// } from 'lucide-react';

// import { masterDataAPI } from '@/lib/mastersAPI';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// import { toast } from 'react-toastify';
// import { useAuth } from '@/contexts/AuthContext';
// import { HiCurrencyRupee } from 'react-icons/hi2';


// type Option = { value: string; label: string };

// type Property = {
//   id: string | number;
//   title: string;
//   status: string;
//   budget: number | string;
//   propertyId?: string;
// };
// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   property?: Property | null;
//   onStatusUpdate?: (status: string, remarks: string, formData: any) => Promise<void> | void;
// };

// type FormState = {
//   status: string;
//   remarks: string;
//   updateReason: string;
//   effectiveDate: string; // ISO datetime-local string
//   updatedBy: string;
//   notifyParties: boolean;
//   priceAdjustment: boolean;
//   newPrice: number | '';
// };

// const EMPTY_FORM = (property?: Property | null): FormState => ({
//   status: property?.status || '',
//   remarks: '',
//   updateReason: '',
//   effectiveDate: new Date().toISOString().slice(0, 16),
//   updatedBy: '',
//   notifyParties: true,
//   priceAdjustment: false,
//   newPrice: property?.budget ? Number(property.budget) : 0
// });

// const PropertyStatusUpdateModal: React.FC<Props> = ({ isOpen, onClose, property, onStatusUpdate }) => {
//   const { user } = useAuth();
//   const [formData, setFormData] = useState<FormState>(EMPTY_FORM(property ?? null));
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [masterOptions, setMasterOptions] = useState<{
//     propertyStatus: Option[];
//     roles: Option[];
//     updateReasons: Option[];
//   }>({
//     propertyStatus: [],
//     roles: [],
//     updateReasons: []
//   });

//   // visual press state (for quick press feedback)
//   const [pressedStatus, setPressedStatus] = useState<string | null>(null);

//   const currentProperty: Property = property ?? { id: '', title: '', status: '', budget: 0 };

//   // normalize a stored status value (id or label) to a label string
//   const normalizeStatusToLabel = (status: string, options: Option[]) => {
//     if (!status) return '';
//     const byValue = options.find(o => o.value === status)?.label;
//     if (byValue) return byValue;
//     const byLabel = options.find(o => o.label === status)?.label;
//     return byLabel || status;
//   };

//   // fetch master data (property + common)
//   const fetchMasterData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [propertyMasterTypes, commonMasterTypes] = await Promise.all([
//         masterDataAPI.getAllMasterTypes('property'),
//         masterDataAPI.getAllMasterTypes('common')
//       ]);

//       const allMasterTypes = [...propertyMasterTypes, ...commonMasterTypes];

//       const masterValues = await Promise.all(
//         allMasterTypes.map((masterType: any) => masterDataAPI.getMasterValues(masterType.id))
//       );

//       const organizedData: Record<string, Option[]> = {};
//       allMasterTypes.forEach((masterType: any, index: number) => {
//         const values = masterValues[index] || [];
//         organizedData[masterType.name.toLowerCase()] = values.map((item: any) => ({
//           value: String(item.id),
//           label: item.value || item.name || 'Unknown'
//         }));
//       });

//       setMasterOptions({
//         propertyStatus: organizedData['property status'] || [],
//         roles: organizedData['role'] || [],
//         updateReasons: organizedData['update reason'] || []
//       });

//     } catch (err: any) {
//       console.error('Failed to load master data:', err);
//       setError(`Failed to load dropdown options: ${err?.message || String(err)}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initialize / reset form when modal opens or property changes
//   useEffect(() => {
//     if (isOpen) {
//       fetchMasterData().catch(() => { });
//       // derive defaults from provided property (if any). We'll still overwrite later after master options load.
//       setFormData(prev => ({
//         ...EMPTY_FORM(property ?? null),
//         // keep previous values where appropriate
//         notifyParties: prev.notifyParties ?? true
//       }));
//     } else {
//       // reset when closed
//       setFormData(EMPTY_FORM(property ?? null));
//       setError(null);
//     }
//     // intentionally watch property to re-seed when it changes while modal open
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, property]);

//   // When masterOptions are loaded, ensure the form stores label strings for select fields (improve UX)
//   useEffect(() => {
//     if (!isOpen) return;
//     if (masterOptions.roles.length > 0 || masterOptions.propertyStatus.length > 0) {
//       setFormData(prev => {
//         const updated: FormState = { ...prev };

//         // ensure updatedBy stores a label (if we have roles)
//         if (!prev.updatedBy && masterOptions.roles.length > 0) {
//           updated.updatedBy = masterOptions.roles[0].label;
//         } else if (prev.updatedBy) {
//           // if stored value is a value id, normalize to label
//           const roleLabel = masterOptions.roles.find(r => r.value === prev.updatedBy)?.label;
//           if (roleLabel) updated.updatedBy = roleLabel;
//         }

//         // ensure status stored as label
//         if (prev.status) {
//           const normalized = normalizeStatusToLabel(prev.status, masterOptions.propertyStatus);
//           if (normalized) updated.status = normalized;
//         } else if (masterOptions.propertyStatus.length > 0) {
//           updated.status = masterOptions.propertyStatus[0].label;
//         }

//         // ensure updateReason stored as label if present
//         if (prev.updateReason) {
//           const rr = masterOptions.updateReasons.find(r => r.value === prev.updateReason)?.label;
//           if (rr) updated.updateReason = rr;
//         }

//         return updated;
//       });
//     }
//   }, [isOpen, masterOptions]);

//   // ---- status UI config ----
//   const getStatusConfig = (statusValue: string) => {
//     const statusConfigMap: Record<string, any> = {
//       'Available': {
//         color: 'emerald',
//         description: 'Ready for sale',
//         icon: CheckCircle,
//         bgClass: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
//         selectedClass: 'border-emerald-400 bg-gradient-to-br from-emerald-100 to-green-200 shadow-lg shadow-emerald-200',
//         gradient: 'from-emerald-400 to-green-500',
//         text600: 'text-emerald-600',
//         text800: 'text-emerald-800',
//         ring: 'ring-emerald-200'
//       },
//       'Under Negotiation': {
//         color: 'amber',
//         description: 'Active discussions',
//         icon: MessageCircle,
//         bgClass: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
//         selectedClass: 'border-amber-400 bg-gradient-to-br from-amber-100 to-orange-200 shadow-lg shadow-amber-200',
//         gradient: 'from-amber-400 to-orange-500',
//         text600: 'text-amber-600',
//         text800: 'text-amber-800',
//         ring: 'ring-amber-200'
//       },
//       'On Hold': {
//         color: 'stone',
//         description: 'Temporarily paused',
//         icon: Pause,
//         bgClass: 'bg-gradient-to-br from-stone-50 to-stone-100 border-stone-200',
//         selectedClass: 'border-stone-400 bg-gradient-to-br from-stone-100 to-stone-200 shadow-lg shadow-stone-200',
//         gradient: 'from-stone-300 to-stone-400',
//         text600: 'text-stone-600',
//         text800: 'text-stone-800',
//         ring: 'ring-stone-200'
//       },
//       'Finalization': {
//         color: 'purple',
//         description: 'Deal closing',
//         icon: Target,
//         bgClass: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
//         selectedClass: 'border-purple-400 bg-gradient-to-br from-purple-100 to-pink-200 shadow-lg shadow-purple-200',
//         gradient: 'from-purple-400 to-pink-500',
//         text600: 'text-purple-600',
//         text800: 'text-purple-800',
//         ring: 'ring-purple-200'
//       },
//       'Sold': {
//         color: 'red',
//         description: 'Successfully sold',
//         icon: Trophy,
//         bgClass: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200',
//         selectedClass: 'border-red-400 bg-gradient-to-br from-red-100 to-rose-200 shadow-lg shadow-red-200',
//         gradient: 'from-red-400 to-rose-500',
//         text600: 'text-red-600',
//         text800: 'text-red-800',
//         ring: 'ring-red-200'
//       }
//     };
//     return statusConfigMap[statusValue] || {
//       color: 'gray',
//       description: 'Status',
//       icon: AlertCircle,
//       bgClass: 'bg-gradient-to-br from-gray-50 to-gray-50 border-gray-200',
//       selectedClass: 'border-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg shadow-gray-200',
//       gradient: 'from-gray-400 to-gray-500',
//       text600: 'text-gray-600',
//       text800: 'text-gray-800',
//       ring: 'ring-gray-200'
//     };
//   };

//   // prepare options enriched with status config (label-based)
//   const statusOptions = masterOptions.propertyStatus.map(s => {
//     const cfg = getStatusConfig(s.label);
//     return {
//       ...s,
//       ...cfg
//     };
//   });

//   // typed input handlers
//   const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   // dropdown receives a value (option.value) and we store the human label in form state
//   const handleDropdownChange = (field: keyof Pick<FormState, 'status' | 'updatedBy' | 'updateReason'>) => (value: string) => {
//     let selectedLabel = value;
//     switch (field) {
//       case 'status':
//         selectedLabel = masterOptions.propertyStatus.find(opt => opt.value === value)?.label || value;
//         break;
//       case 'updatedBy':
//         selectedLabel = masterOptions.roles.find(opt => opt.value === value)?.label || value;
//         break;
//       case 'updateReason':
//         selectedLabel = masterOptions.updateReasons.find(opt => opt.value === value)?.label || value;
//         break;
//     }
//     setFormData(prev => ({ ...prev, [field]: selectedLabel }));
//   };

//   const handleSave = async () => {
//     if (!formData.updateReason) {
//       toast.error('Please select update reason');
//       return;
//     }

//     if (!formData.remarks.trim()) {
//       toast.error('Please provide remarks for status update');
//       return;
//     }

//     if (formData.priceAdjustment && (formData.newPrice === '' || Number(formData.newPrice) <= 0)) {
//       toast.error('Please enter a valid new price for price adjustment');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const apiPayload: any = {
//         status: formData.status,
//         remarks: formData.remarks,
//         updateReason: formData.updateReason,
//         updatedBy: formData.updatedBy,
//         effectiveDate: formData.effectiveDate,
//         notifyParties: formData.notifyParties,
//         priceAdjustment: formData.priceAdjustment
//       };

//       if (formData.priceAdjustment) {
//         apiPayload.newPrice = Number(formData.newPrice);
//       }

//       const response = await propertiesAPI.updateStatus(String(currentProperty.id), apiPayload);

//       if (response?.success) {
//         if (onStatusUpdate) {
//           await onStatusUpdate(formData.status, formData.remarks, formData);
//         }
//         toast.success('Property status updated successfully!');
//         onClose();
//       } else {
//         toast.error(response?.message || 'Failed to update status');
//       }
//     } catch (err: any) {
//       console.error('Status update error:', err);
//       toast.error(err?.response?.data?.error || err?.message || 'Failed to update status');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Accept numbers OR strings (and null/undefined) and handle them safely
//   const formatCurrency = (amount?: number | string | null): string => {
//     if (amount == null || amount === '') return '—';

//     // If amount is a string, try to parse it to a number
//     const n = typeof amount === 'string' ? Number(amount.replace(/[,₹\s]|(Cr|L)/gi, '')) : Number(amount);

//     if (Number.isNaN(n)) return '—';

//     if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
//     if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
//     return `₹${n.toLocaleString('en-IN')}`;
//   };


//   const currentStatusConfig = getStatusConfig(currentProperty.status);
//   const CurrentIcon = currentStatusConfig.icon;

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh]">
//         {/* Header */}
//         <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">Update Property Status</h2>
//               <p className="text-gray-600 text-sm font-medium">{currentProperty.title}</p>
//               {currentProperty.propertyId && (
//                 <p className="text-xs text-gray-600">Property ID: {currentProperty.propertyId}</p>
//               )}
//               {error && <p className="text-red-500 text-xs mt-1">⚠️ {error}</p>}
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1.5 rounded-lg bg-white hover:bg-gray-50 transition-all shadow-sm border border-gray-100"
//               aria-label="Close"
//               type="button"
//             >
//               <X size={18} className="text-gray-500" />
//             </button>
//           </div>
//         </div>

//         {/* Scrollable content */}
//         <div className="overflow-y-auto flex-1 p-4 relative" style={{ maxHeight: 'calc(90vh - 120px)' }}>
//           {loading && (
//             <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
//                 <span className="ml-2 text-gray-700 font-medium">Loading master data...</span>
//               </div>
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
//               <p>{error}</p>
//               <button
//                 onClick={fetchMasterData}
//                 className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
//                 type="button"
//               >
//                 Retry Loading Data
//               </button>
//             </div>
//           )}

//           {!loading && !error && (
//             <>
//               {/* Current Status */}
//               <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 mb-4 border border-gray-100">
//                 <h3 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">Current Status</h3>
//                 <div className="flex items-center space-x-2">
//                   <div className={`p-1.5 rounded-lg ${currentStatusConfig.bgClass || 'bg-gray-100'}`}>
//                     <CurrentIcon size={16} />
//                   </div>
//                   <div>
//                     <div className="font-semibold text-gray-900 text-sm">{currentProperty.status}</div>
//                     <div className="text-xs text-gray-600">{currentStatusConfig.description}</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Status Selection Cards */}
//               <div className="mb-4">
//                 <h3 className="font-semibold text-gray-900 mb-2 text-[10px] sm:text-xs uppercase tracking-wide">
//                   Select New Status
//                 </h3>

//                 {/* Responsive auto-fit grid: 110px min card, fills the row nicely */}
//                 <div className="grid gap-2 sm:gap-3 grid-cols-[repeat(auto-fit,minmax(110px,1fr))]">
//                   {statusOptions.length > 0 ? statusOptions.map((status) => {
//                     const StatusIcon = status.icon;

//                     // 🔧 responsive fix: compare with status.value (not label)
//                     const isSelected = formData.status === status.value;
//                     const isPressed = pressedStatus === status.value;

//                     return (
//                       <button
//                         key={status.value}
//                         onClick={() => handleDropdownChange('status')(status.value)}
//                         onMouseDown={() => setPressedStatus(status.value)}
//                         onMouseUp={() => setPressedStatus(null)}
//                         onMouseLeave={() => setPressedStatus(null)}
//                         type="button"
//                         title={status.label}
//                         aria-pressed={isSelected}
//                         className={[
//                           "relative overflow-hidden rounded-lg border text-left",
//                           "transition-all duration-150 ease-out select-none",
//                           "p-2 sm:p-2.5",                 // bigger tap target on small screens
//                           "min-h-[68px] sm:min-h-[76px]", // consistent height
//                           "touch-manipulation",           // better mobile interactions
//                           isSelected ? `${status.selectedClass} scale-[1.02]` : `${status.bgClass} hover:shadow-md`,
//                           "hover:scale-[1.01] active:scale-95 active:translate-y-[1px]",
//                           "focus:outline-none focus:ring-2", status.ring,
//                           isPressed ? "ring-2 ring-offset-1" : "",
//                         ].join(" ")}
//                       >
//                         {/* press highlight */}
//                         <div className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${isPressed ? "bg-white/30" : "bg-transparent"}`} />

//                         {/* soft gradient sheen */}
//                         <div className={`absolute inset-0 bg-gradient-to-br ${status.gradient} ${isSelected ? "opacity-20" : "opacity-10"} transition-opacity duration-300`} />

//                         {/* ripple */}
//                         <span className={`pointer-events-none absolute inset-0 rounded-lg ${isPressed ? "animate-ping bg-white/20" : ""}`} />

//                         {/* content */}
//                         <div className="relative flex flex-col items-center gap-1">
//                           <div className="p-1 rounded-md bg-white/80 shadow-sm">
//                             {/* responsive icon size */}
//                             <StatusIcon size={12} className={`${status.text600} sm:w-4 sm:h-4`} />
//                           </div>

//                           <div className="w-full text-center">
//                             <div className={`font-semibold truncate ${status.text800} text-[10px] sm:text-[11px] leading-4`}>
//                               {status.label}
//                             </div>
//                             <div className={`truncate ${status.text600} text-[9px] sm:text-[10px] leading-3`}>
//                               {status.description}
//                             </div>
//                           </div>
//                         </div>
//                       </button>
//                     );
//                   }) : (
//                     <div className="col-span-full text-center py-2 text-gray-500 text-xs">
//                       No status options available
//                     </div>
//                   )}
//                 </div>

//                 {/* reduced motion = fewer transforms/ripples */}
//                 <style>{`
//     @media (prefers-reduced-motion: reduce) {
//       .hover\\:scale-\\[1\\.01\\], .scale-\\[1\\.02\\], .active\\:translate-y-\\[1px\\] { transform: none !important; }
//       .animate-ping { animation: none !important; }
//     }
//   `}</style>
//               </div>

//               {/* Update Details */}
//               <div className="space-y-3">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Update Reason <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={masterOptions.updateReasons.find(opt => opt.label === formData.updateReason)?.value || ''}
//                       onChange={(e) => handleDropdownChange('updateReason')(e.target.value)}
//                       className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
//                       required
//                     >
//                       <option value="">Select reason</option>
//                       {masterOptions.updateReasons.map((reason) => (
//                         <option key={reason.value} value={reason.value}>
//                           {reason.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       <Calendar className="inline mr-1" size={14} />
//                       Effective Date & Time
//                     </label>
//                     <input
//                       type="datetime-local"
//                       value={formData.effectiveDate}
//                       onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
//                       className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-gray-700 mb-1">
//                     Remarks <span className="text-red-500">*</span>
//                   </label>
//                   <textarea
//                     value={formData.remarks}
//                     onChange={(e) => handleInputChange('remarks', e.target.value)}
//                     className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
//                     rows={2}
//                     placeholder="Provide detailed remarks..."
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       <User className="inline mr-1" size={14} />
//                       Updated By <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={masterOptions.roles.find(opt => opt.label === formData.updatedBy)?.value || ''}
//                       onChange={(e) => handleDropdownChange('updatedBy')(e.target.value)}
//                       className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
//                       required
//                     >
//                       <option value="">Select role</option>
//                       {masterOptions.roles.map((role) => (
//                         <option key={role.value} value={role.value}>
//                           {role.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="flex items-end">
//                     <label className="flex items-center space-x-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={formData.priceAdjustment}
//                         onChange={(e) => handleInputChange('priceAdjustment', e.target.checked)}
//                         className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="text-xs font-medium text-gray-700">
//                         <HiCurrencyRupee className="inline mr-1 text-green-400" size={18} />
//                         Adjust Price
//                       </span>
//                     </label>
//                   </div>
//                 </div>

//                 {formData.priceAdjustment && (
//                   <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
//                     <label className="block text-xs font-medium text-gray-700 mb-1">New Price (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.newPrice}
//                       onChange={(e) => handleInputChange('newPrice', e.target.value === '' ? '' : Number(e.target.value))}
//                       className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
//                       placeholder="Enter new price"
//                     />
//                     <div className="mt-1 text-xs text-gray-600 bg-white rounded p-1">
//                       <strong>Current:</strong> {formatCurrency(currentProperty.budget)} → <strong>New:</strong> {formatCurrency(formData.newPrice as number | '')}
//                     </div>
//                   </div>
//                 )}

//                 <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
//                   <label className="flex items-start space-x-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={formData.notifyParties}
//                       onChange={(e) => handleInputChange('notifyParties', e.target.checked)}
//                       className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                     <div>
//                       <span className="text-xs font-medium text-gray-700">Notify all interested parties</span>
//                       <p className="text-xs text-gray-500 mt-0.5">
//                         Seller, buyers, and team will be notified
//                       </p>
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
//           <div className="flex items-center justify-between">
//             <div className="text-xs text-gray-500 flex items-center space-x-1">
//               <Clock size={12} />
//               <span>Recorded in timeline</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
//                 type="button"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={isSubmitting || !formData.updateReason || !formData.remarks.trim() || !formData.updatedBy || loading}
//                 className="flex items-center space-x-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
//                 type="button"
//               >
//                 <Save size={14} />
//                 <span>{isSubmitting ? 'Updating...' : 'Update Status'}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyStatusUpdateModal;

import React, { useState, useEffect } from 'react';
import {
  X, Save, Target, AlertCircle, CheckCircle, Pause, Trophy,
  MessageCircle, Clock, Calendar, User, DollarSign,
  IndianRupeeIcon
} from 'lucide-react';

import { masterDataAPI } from '@/lib/mastersAPI';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { HiCurrencyRupee } from 'react-icons/hi2';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type Option = { value: string; label: string };

type Property = {
  id: string | number;
  title: string;
  status: string;
  budget: number | string;
  propertyId?: string;
};
type Props = {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onStatusUpdate?: (status: string, remarks: string, formData: any) => Promise<void> | void;
};

type FormState = {
  status: string;
  remarks: string;
  updateReason: string;
  effectiveDate: string;
  updatedBy: string;
  notifyParties: boolean;
  priceAdjustment: boolean;
  newPrice: number | '';
};

const EMPTY_FORM = (property?: Property | null): FormState => ({
  status: property?.status || '',
  remarks: '',
  updateReason: '',
  effectiveDate: new Date().toISOString().slice(0, 16),
  updatedBy: '',
  notifyParties: true,
  priceAdjustment: false,
  newPrice: property?.budget ? Number(property.budget) : 0
});

const PropertyStatusUpdateModal: React.FC<Props> = ({ isOpen, onClose, property, onStatusUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM(property ?? null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState<{
    propertyStatus: Option[];
    roles: Option[];
    updateReasons: Option[];
  }>({
    propertyStatus: [],
    roles: [],
    updateReasons: []
  });

  const [pressedStatus, setPressedStatus] = useState<string | null>(null);

  const currentProperty: Property = property ?? { id: '', title: '', status: '', budget: 0 };

  const normalizeStatusToLabel = (status: string, options: Option[]) => {
    if (!status) return '';
    const byValue = options.find(o => o.value === status)?.label;
    if (byValue) return byValue;
    const byLabel = options.find(o => o.label === status)?.label;
    return byLabel || status;
  };

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propertyMasterTypes, commonMasterTypes] = await Promise.all([
        masterDataAPI.getAllMasterTypes('property'),
        masterDataAPI.getAllMasterTypes('common')
      ]);

      const allMasterTypes = [...propertyMasterTypes, ...commonMasterTypes];

      const masterValues = await Promise.all(
        allMasterTypes.map((masterType: any) => masterDataAPI.getMasterValues(masterType.id))
      );

      const organizedData: Record<string, Option[]> = {};
      allMasterTypes.forEach((masterType: any, index: number) => {
        const values = masterValues[index] || [];
        organizedData[masterType.name.toLowerCase()] = values.map((item: any) => ({
          value: String(item.id),
          label: item.value || item.name || 'Unknown'
        }));
      });

      setMasterOptions({
        propertyStatus: organizedData['property status'] || [],
        roles: organizedData['role'] || [],
        updateReasons: organizedData['update reason'] || []
      });

    } catch (err: any) {
      console.error('Failed to load master data:', err);
      setError(`Failed to load dropdown options: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMasterData().catch(() => { });
      setFormData(prev => ({
        ...EMPTY_FORM(property ?? null),
        notifyParties: prev.notifyParties ?? true
      }));
    } else {
      setFormData(EMPTY_FORM(property ?? null));
      setError(null);
    }
  }, [isOpen, property]);

  useEffect(() => {
    if (!isOpen) return;
    if (masterOptions.roles.length > 0 || masterOptions.propertyStatus.length > 0) {
      setFormData(prev => {
        const updated: FormState = { ...prev };

        if (!prev.updatedBy && masterOptions.roles.length > 0) {
          updated.updatedBy = masterOptions.roles[0].label;
        } else if (prev.updatedBy) {
          const roleLabel = masterOptions.roles.find(r => r.value === prev.updatedBy)?.label;
          if (roleLabel) updated.updatedBy = roleLabel;
        }

        if (prev.status) {
          const normalized = normalizeStatusToLabel(prev.status, masterOptions.propertyStatus);
          if (normalized) updated.status = normalized;
        } else if (masterOptions.propertyStatus.length > 0) {
          updated.status = masterOptions.propertyStatus[0].label;
        }

        if (prev.updateReason) {
          const rr = masterOptions.updateReasons.find(r => r.value === prev.updateReason)?.label;
          if (rr) updated.updateReason = rr;
        }

        return updated;
      });
    }
  }, [isOpen, masterOptions]);

  const getStatusConfig = (statusValue: string) => {
    const statusConfigMap: Record<string, any> = {
      'Available': {
        color: '#10b981',
        description: 'Ready for sale',
        icon: CheckCircle,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'Under Negotiation': {
        color: '#f59e0b',
        description: 'Active discussions',
        icon: MessageCircle,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'On Hold': {
        color: '#64748b',
        description: 'Temporarily paused',
        icon: Pause,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'Finalization': {
        color: '#8b5cf6',
        description: 'Deal closing',
        icon: Target,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      },
      'Sold': {
        color: '#ef4444',
        description: 'Successfully sold',
        icon: Trophy,
        bg: `${N}05`,
        border: `${N}15`,
        selectedBg: `${O}10`,
        selectedBorder: O,
      }
    };
    return statusConfigMap[statusValue] || {
      color: MU,
      description: 'Status',
      icon: AlertCircle,
      bg: `${N}05`,
      border: `${N}15`,
      selectedBg: `${O}10`,
      selectedBorder: O,
    };
  };

  const statusOptions = masterOptions.propertyStatus.map(s => {
    const cfg = getStatusConfig(s.label);
    return { ...s, ...cfg };
  });

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDropdownChange = (field: keyof Pick<FormState, 'status' | 'updatedBy' | 'updateReason'>) => (value: string) => {
    let selectedLabel = value;
    switch (field) {
      case 'status':
        selectedLabel = masterOptions.propertyStatus.find(opt => opt.value === value)?.label || value;
        break;
      case 'updatedBy':
        selectedLabel = masterOptions.roles.find(opt => opt.value === value)?.label || value;
        break;
      case 'updateReason':
        selectedLabel = masterOptions.updateReasons.find(opt => opt.value === value)?.label || value;
        break;
    }
    setFormData(prev => ({ ...prev, [field]: selectedLabel }));
  };

  const handleSave = async () => {
    if (!formData.updateReason) {
      toast.error('Please select update reason');
      return;
    }

    if (!formData.remarks.trim()) {
      toast.error('Please provide remarks for status update');
      return;
    }

    if (formData.priceAdjustment && (formData.newPrice === '' || Number(formData.newPrice) <= 0)) {
      toast.error('Please enter a valid new price for price adjustment');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiPayload: any = {
        status: formData.status,
        remarks: formData.remarks,
        updateReason: formData.updateReason,
        updatedBy: formData.updatedBy,
        effectiveDate: formData.effectiveDate,
        notifyParties: formData.notifyParties,
        priceAdjustment: formData.priceAdjustment
      };

      if (formData.priceAdjustment) {
        apiPayload.newPrice = Number(formData.newPrice);
      }

      const response = await propertiesAPI.updateStatus(String(currentProperty.id), apiPayload);

      if (response?.success) {
        if (onStatusUpdate) {
          await onStatusUpdate(formData.status, formData.remarks, formData);
        }
        toast.success('Property status updated successfully!');
        onClose();
      } else {
        toast.error(response?.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(err?.response?.data?.error || err?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount?: number | string | null): string => {
    if (amount == null || amount === '') return '—';
    const n = typeof amount === 'string' ? Number(amount.replace(/[,₹\s]|(Cr|L)/gi, '')) : Number(amount);
    if (Number.isNaN(n)) return '—';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const currentStatusConfig = getStatusConfig(currentProperty.status);
  const CurrentIcon = currentStatusConfig.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div>
            <h2 className="text-sm font-bold text-white">Update Property Status</h2>
            <p className="text-[10px] text-white/70">{currentProperty.title}</p>
            {currentProperty.propertyId && (
              <p className="text-[9px] text-white/50">ID: {currentProperty.propertyId}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: O, borderTopColor: 'transparent' }} />
              <span className="ml-2 text-[11px]" style={{ color: MU }}>Loading...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg p-2 text-[10px]" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <p>{error}</p>
              <button onClick={fetchMasterData} className="mt-1 text-[9px] underline">Retry</button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Current Status */}
              <div className="rounded-lg p-2" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                <h3 className="text-[9px] font-semibold mb-1" style={{ color: MU }}>Current Status</h3>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ background: `${currentStatusConfig.color}15` }}>
                    <CurrentIcon size={12} style={{ color: currentStatusConfig.color }} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold" style={{ color: N }}>{currentProperty.status}</div>
                    <div className="text-[9px]" style={{ color: MU }}>{currentStatusConfig.description}</div>
                  </div>
                </div>
              </div>

              {/* Status Selection Cards */}
              <div>
                <h3 className="text-[9px] font-semibold mb-1.5" style={{ color: MU }}>Select New Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
             {statusOptions.length > 0 ? statusOptions.map((status) => {
  const StatusIcon = status.icon;
  const isSelected = formData.status === status.value || formData.status === status.label;
  
  // Different highlight colors for different statuses
  const getHighlightColor = () => {
    if (!isSelected) return '';
    switch (status.label) {
      case 'Available':
        return '#10b981'; // Green
      case 'Sold':
        return '#ef4444'; // Red
      case 'Under Negotiation':
        return '#f59e0b'; // Amber
      case 'On Hold':
        return '#64748b'; // Gray
      case 'Finalization':
        return '#8b5cf6'; // Purple
      default:
        return O; // Default Orange
    }
  };
  
  const highlightColor = getHighlightColor();

  return (
    <button
      key={status.value}
      onClick={() => handleDropdownChange('status')(status.value)}
      type="button"
      className={`rounded-lg p-1.5 text-center transition-all hover:shadow-sm ${isSelected ? 'ring-2 shadow-md' : ''}`}
      style={{
        background: isSelected ? `${highlightColor}15` : `${N}05`,
        // border: `1px solid ${isSelected ? highlightColor : BD}`,
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        ringColor: isSelected ? highlightColor : undefined
      }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="p-0.5 rounded" style={{ background: `${status.color}15` }}>
          <StatusIcon size={10} style={{ color: isSelected ? highlightColor : status.color }} />
        </div>
        <div className="text-[9px] font-semibold" style={{ color: isSelected ? highlightColor : N }}>
          {status.label}
        </div>
        <div className="text-[7px]" style={{ color: isSelected ? highlightColor : MU }}>
          {status.description}
        </div>
      </div>
    </button>
  );
}) : (
  <div className="col-span-full text-center py-2 text-[10px]" style={{ color: MU }}>No status options available</div>
)}
                </div>
              </div>

              {/* Update Details */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Update Reason <span className="text-red-400">*</span></label>
                    <select
                      value={masterOptions.updateReasons.find(opt => opt.label === formData.updateReason)?.value || ''}
                      onChange={(e) => handleDropdownChange('updateReason')(e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                      required
                    >
                      <option value="">Select reason</option>
                      {masterOptions.updateReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>{reason.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
                      <Calendar size={10} className="inline mr-0.5" /> Effective Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.effectiveDate}
                      onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Remarks <span className="text-red-400">*</span></label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1 resize-none"
                    style={{ borderColor: BD }}
                    rows={2}
                    placeholder="Provide detailed remarks..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
                      <User size={10} className="inline mr-0.5" /> Updated By <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={masterOptions.roles.find(opt => opt.label === formData.updatedBy)?.value || ''}
                      onChange={(e) => handleDropdownChange('updatedBy')(e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                      required
                    >
                      <option value="">Select role</option>
                      {masterOptions.roles.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-1.5 cursor-pointer ">
                      <input
                        type="checkbox"
                        checked={formData.priceAdjustment}
                        onChange={(e) => handleInputChange('priceAdjustment', e.target.checked)}
                        className="rounded w-3 h-3" style={{ accentColor: O }}
                      />
                      <span className="text-[12px] font-medium" style={{ color: MU }}>
                        <IndianRupeeIcon size={13} className="inline mr-0.5 text-green-950" /> Adjust Price
                      </span>
                    </label>
                  </div>
                </div>

                {formData.priceAdjustment && (
                  <div className="rounded-lg p-2" style={{ background: `${O}05`, border: `1px solid ${O}20` }}>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>New Price (₹)</label>
                    <input
                      type="number"
                      value={formData.newPrice}
                      onChange={(e) => handleInputChange('newPrice', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                      placeholder="Enter new price"
                    />
                    <div className="mt-1 text-[9px] p-1 rounded" style={{ background: BG }}>
                      <strong>Current:</strong> {formatCurrency(currentProperty.budget)} → <strong>New:</strong> {formatCurrency(formData.newPrice as number | '')}
                    </div>
                  </div>
                )}

                <div className="rounded-lg p-1.5" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                  <label className="flex items-start gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifyParties}
                      onChange={(e) => handleInputChange('notifyParties', e.target.checked)}
                      className="rounded w-3 h-3 mt-0.5" style={{ accentColor: O }}
                    />
                    <div>
                      <span className="text-[10px] font-medium" style={{ color: N }}>Notify all interested parties</span>
                      <p className="text-[8px]" style={{ color: MU }}>Seller, buyers, and team will be notified</p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center gap-1 text-[9px]" style={{ color: MU }}>
            <Clock size={10} />
            <span>Recorded in timeline</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={onClose} className="px-2 py-1 text-[10px] border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !formData.updateReason || !formData.remarks.trim() || !formData.updatedBy || loading}
              className="px-2 py-1 text-[10px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: O }}
            >
              <Save size={10} />
              <span>{isSubmitting ? 'Updating...' : 'Update'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyStatusUpdateModal;