// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import {
//   X, Save, User, Phone as PhoneIcon, MapPin, Star,
//   AlertCircle, Home, CreditCard, ChevronDown, Search, IndianRupee
// } from 'lucide-react';
// import PhoneInput from 'react-phone-input-2';
// import { FaWhatsapp } from 'react-icons/fa';
// import 'react-phone-input-2/lib/style.css';
// import { getMasterDropdownOptions } from '@/lib/useMasterData';
// import BudgetInput from '@/pages/dashboard/components/BudgetInput';
// import { buyerAPI } from '@/lib/buyerAPI';
// import { toast } from 'react-toastify';
// import DOBStepCalendar from '../ui/DOBStepCalendar';
// import { useAuth } from '@/contexts/AuthContext';

// // ------------------------------
// // Helpers (keep the same)
// // ------------------------------
// const parseMaybeJSON = (val: any) => {
//   if (!val) return null;
//   if (typeof val === 'string') {
//     try { return JSON.parse(val); } catch { return null; }
//   }
//   return val;
// };

// const buildFormStateFromBuyer = (b: any) => {
//   const req = parseMaybeJSON(b?.requirements) || b?.requirements || {
//     propertyType: '',
//     unitTypes: [],
//     preferredLocations: [],
//     amenities: [],
//     furnishing: '',
//     possession: '',
//     facing: '',
//     floor: '',
//     specialRequirements: ''
//   };

//   const fin = parseMaybeJSON(b?.financials) || b?.financials || {
//     loanRequired: false,
//     loanAmount: '',
//     downPayment: '',
//     monthlyIncome: '',
//     bankPreference: '',
//     loanStatus: '',
//     creditScore: ''
//   };

//   return {
//     salutation: b?.salutation ?? 'Mr.',
//     name: b?.name ?? '',
//     phone: b?.phone ?? '',
//     dob: b?.dob ?? b?.buyer_dob ?? ISO_18Y_BACK,
//     whatsapp_number: b?.whatsapp_number ?? b?.whatsapp ?? '',
//     email: b?.email ?? '',
//     state: b?.state ?? '',
//     city: b?.city ?? '',
//     location: b?.location ?? '',
//     buyer_lead_priority: b?.buyer_lead_priority ?? b?.priority ?? '',
//     buyer_lead_source: b?.buyer_lead_source ?? b?.source ?? '',
//     buyer_lead_stage: b?.buyer_lead_stage ?? b?.stage ?? '',
//     buyer_lead_status: b?.buyer_lead_status ?? b?.status ?? '',
//     budget_min: b?.budget_min ?? b?.budget?.min ?? '',
//     budget_max: b?.budget_max ?? b?.budget?.max ?? '',
//     requirements: {
//       propertyType: req?.propertyType ?? '',
//       unitTypes: Array.isArray(req?.unitTypes) ? req.unitTypes : [],
//       preferredLocations: Array.isArray(req?.preferredLocations) ? req.preferredLocations : [],
//       amenities: Array.isArray(req?.amenities) ? req.amenities : [],
//       furnishing: req?.furnishing ?? '',
//       possession: req?.possession ?? '',
//       facing: req?.facing ?? '',
//       floor: req?.floor ?? '',
//       specialRequirements: req?.specialRequirements ?? ''
//     },
//     financials: {
//       loanRequired: !!fin?.loanRequired,
//       loanAmount: fin?.loanAmount ?? '',
//       downPayment: fin?.downPayment ?? '',
//       monthlyIncome: fin?.monthlyIncome ?? '',
//       bankPreference: fin?.bankPreference ?? '',
//       loanStatus: fin?.loanStatus ?? '',
//       creditScore: fin?.creditScore ?? ''
//     },
//   };
// };

// const dedupeByValue = (opts: any[] = []) =>
//   Array.from(new Map(opts.map(o => [o?.value, o])).values());

// const toCanonical = (opts: { value: any; label: any }[] = [], incoming: any) => {
//   if (incoming === null || incoming === undefined) return '';
//   const s = String(incoming).trim();
//   if (!s) return '';

//   const byValue = opts.find(o => String(o.value).toLowerCase() === s.toLowerCase());
//   if (byValue) return byValue.value;

//   const byLabel = opts.find(o => String(o.label).toLowerCase() === s.toLowerCase());
//   if (byLabel) return byLabel.value;

//   return s;
// };

// const arrToCanonical = (opts: { value: any; label: any }[] = [], arr: any[] = []) =>
//   (Array.isArray(arr) ? arr : [])
//     .map(v => toCanonical(opts, v))
//     .filter(Boolean);

// const arePhoneNumbersSame = (phone1: string, phone2: string) => {
//   if (!phone1 || !phone2) return false;
//   const digits1 = String(phone1).replace(/\D/g, '');
//   const digits2 = String(phone2).replace(/\D/g, '');
//   const last10_1 = digits1.slice(-10);
//   const last10_2 = digits2.slice(-10);
//   return last10_1 === last10_2 && last10_1.length === 10;
// };

// // ------------------------------
// // Fixed MultiSelectDropdown with proper closing behavior
// // ------------------------------
// const MultiSelectDropdown = ({
//   label,
//   options,
//   selectedValues = [],
//   onToggle,
//   placeholder,
//   withSearch = false
// }: {
//   label: string;
//   options: any[];
//   selectedValues?: any[];
//   onToggle: (val: any) => void;
//   placeholder: string;
//   withSearch?: boolean;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const safeOptions = Array.isArray(options) ? options : [];

//   const filteredOptions = useMemo(() => {
//     if (!withSearch || !searchTerm) return safeOptions;
//     const t = searchTerm.toLowerCase();
//     return safeOptions.filter((o) => o?.label?.toLowerCase().includes(t));
//   }, [withSearch, searchTerm, safeOptions]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//         setSearchTerm('');
//       }
//     };

//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setIsOpen(false);
//         setSearchTerm('');
//       }
//       if (event.key === 'Tab' && isOpen) {
//         setIsOpen(false);
//         setSearchTerm('');
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [isOpen]);

//   // Focus search input when dropdown opens with search
//   useEffect(() => {
//     if (isOpen && withSearch && inputRef.current) {
//       setTimeout(() => {
//         inputRef.current?.focus();
//       }, 100);
//     }
//   }, [isOpen, withSearch]);

//   const handleToggle = (val: any) => {
//     onToggle(val);
//     // Don't close dropdown after selection - let user continue selecting
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
//       <button
//         type="button"
//         className="border border-gray-300 rounded w-full h-8 px-3 text-left text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent flex items-center justify-between hover:border-gray-400 transition-colors"
//         onClick={() => {
//           setIsOpen(prev => !prev);
//           setSearchTerm('');
//         }}
//         onBlur={(e) => {
//           // Only close if related target is not inside dropdown
//           if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
//             setTimeout(() => {
//               if (!dropdownRef.current?.contains(document.activeElement)) {
//                 setIsOpen(false);
//                 setSearchTerm('');
//               }
//             }, 200);
//           }
//         }}
//       >
//         <span className="text-gray-500 truncate">
//           {selectedValues.length > 0
//             ? selectedValues.slice(0, 2).join(', ') + (selectedValues.length > 2 ? ` +${selectedValues.length - 2} more` : '')
//             : placeholder}
//         </span>
//         <ChevronDown
//           size={14}
//           className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
//         />
//       </button>

//       {isOpen && (
//         <div
//           className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-hidden"
//           onMouseDown={(e) => e.preventDefault()} // Prevent blur on mouse down inside dropdown
//         >
//           {withSearch && (
//             <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
//               <div className="relative">
//                 <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === 'Escape') {
//                       setIsOpen(false);
//                       setSearchTerm('');
//                     }
//                   }}
//                   className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           )}
//           <div className="overflow-y-auto max-h-32">
//             {filteredOptions.map((option) => (
//               <label
//                 key={option.value}
//                 className="flex items-center p-2 hover:bg-gray-100 cursor-pointer gap-2 transition-colors"
//                 onMouseDown={(e) => e.preventDefault()} // Prevent blur
//               >
//                 <input
//                   type="checkbox"
//                   checked={selectedValues.includes(option.value)}
//                   onChange={() => handleToggle(option.value)}
//                   className="h-3 w-3"
//                 />
//                 <span className="text-xs">{option.label}</span>
//               </label>
//             ))}
//             {filteredOptions.length === 0 && (
//               <div className="p-2 text-xs text-gray-500 text-center">No options found</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------- date helpers ----------
// const TODAY = new Date();
// const pad2 = (n: number) => String(n).padStart(2, '0');
// const toISODate = (d: Date) =>
//   `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
// const EIGHTEEN_YEARS_BACK = new Date(
//   TODAY.getFullYear() - 18,
//   TODAY.getMonth(),
//   TODAY.getDate()
// );
// const ISO_18Y_BACK = toISODate(EIGHTEEN_YEARS_BACK);

// // ------------------------------
// // Main Component
// // ------------------------------
// const BuyerFormModal = ({
//   isOpen,
//   onClose,
//   buyer,
//   onSave
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   buyer?: any;
//   onSave?: (payload: any) => void;
// }) => {
//   const [sameAsPhone, setSameAsPhone] = useState(false);
//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<any>({});
//   const [touched, setTouched] = useState({ minBudget: false, maxBudget: false });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState(() => buildFormStateFromBuyer(buyer || {}));

//   // Add a ref to track the active element before modal opens
//   const modalRef = useRef<HTMLDivElement>(null);
//   const { user } = useAuth();

//   // Close modal when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
//         onClose();
//       }
//     };

//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//       document.addEventListener('keydown', handleKeyDown);
//       // Prevent body scroll when modal is open
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'auto';
//     };
//   }, [isOpen, onClose]);

//   const calcAge = (iso?: string) => {
//     if (!iso) return 0;
//     const d = new Date(iso);
//     const today = new Date();
//     let a = today.getFullYear() - d.getFullYear();
//     const m = today.getMonth() - d.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
//     return a;
//   };

//   const age = useMemo(() => calcAge(formData.dob), [formData.dob]);
//   const ageError = formData.dob
//     ? (age < 18 ? 'Buyer must be at least 18 years old' : '')
//     : '';

//   // Fetch master data
//   useEffect(() => {
//     if (!isOpen) return;
//     (async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['common', 'buyer', 'property', 'lead']);
//         setMasters(data || {});
//       } catch (err) {
//         console.error('Error fetching master options:', err);
//       } finally {
//         setMasterLoading(false);
//       }
//     })();
//   }, [isOpen]);


//   useEffect(() => {
//     if (isOpen) {
//       const newFormData = buildFormStateFromBuyer(buyer || {});

//       // 🔥 AUTO ASSIGN FOR EXECUTIVE (NEW BUYER ONLY)
//       if (!buyer?.id) {
//         const dept = (user?.department || '').toLowerCase();
//         const role = (user?.role || '').toLowerCase();

//         if (dept.includes('presale') || dept.includes('sales')) {
//           if (role.includes('executive')) {
//             (newFormData as any).assigned_executive = String(user.id);
//           }
//         }
//       }

//       setFormData(newFormData);
//     }
//   }, [isOpen, buyer, user]);

//   const getMasterOptions = (key: string) => dedupeByValue(masters?.[key] || []);

//   // Normalize edit-mode values
//   useEffect(() => {
//     if (!isOpen || masterLoading) return;

//     const buyerReqs = parseMaybeJSON(buyer?.requirements) || buyer?.requirements || {};

//     setFormData(prev => {
//       const propertyTypeOpts = getMasterOptions('property type');
//       const unitTypeOpts = getMasterOptions('unit type');
//       const locationOpts = getMasterOptions('location');
//       const amenitiesOpts = getMasterOptions('amenities');
//       const furnishingOpts = getMasterOptions('furnishing');
//       const possessionOpts = getMasterOptions('possession');
//       const facingOpts = getMasterOptions('facing');
//       const floorOpts = getMasterOptions('floor preference');
//       const salutationOpts = getMasterOptions('salutation');

//       const updatedData = {
//         ...prev,
//         salutation: toCanonical(salutationOpts, prev.salutation ?? buyer?.salutation),
//         buyer_lead_source: toCanonical(getMasterOptions('buyer lead source'), prev.buyer_lead_source ?? buyer?.buyer_lead_source ?? buyer?.source),
//         buyer_lead_priority: toCanonical(getMasterOptions('lead priority'), prev.buyer_lead_priority ?? buyer?.buyer_lead_priority ?? buyer?.priority),
//         buyer_lead_stage: toCanonical(getMasterOptions('buyer lead stage'), prev.buyer_lead_stage ?? buyer?.buyer_lead_stage ?? buyer?.stage),
//         buyer_lead_status: toCanonical(getMasterOptions('buyer lead status'), prev.buyer_lead_status ?? buyer?.buyer_lead_status ?? buyer?.status),
//         requirements: {
//           ...prev.requirements,
//           propertyType: toCanonical(propertyTypeOpts, prev.requirements?.propertyType ?? buyerReqs?.propertyType ?? ''),
//           unitTypes: arrToCanonical(unitTypeOpts, prev.requirements?.unitTypes ?? buyerReqs?.unitTypes ?? []),
//           preferredLocations: arrToCanonical(locationOpts, prev.requirements?.preferredLocations ?? buyerReqs?.preferredLocations ?? []),
//           amenities: arrToCanonical(amenitiesOpts, prev.requirements?.amenities ?? buyerReqs?.amenities ?? []),
//           furnishing: toCanonical(furnishingOpts, prev.requirements?.furnishing ?? buyerReqs?.furnishing ?? ''),
//           possession: toCanonical(possessionOpts, prev.requirements?.possession ?? buyerReqs?.possession ?? ''),
//           facing: toCanonical(facingOpts, prev.requirements?.facing ?? buyerReqs?.facing ?? ''),
//           floor: toCanonical(floorOpts, prev.requirements?.floor ?? buyerReqs?.floor ?? ''),
//         },
//       };

//       return updatedData;
//     });
//   }, [isOpen, masterLoading, buyer, masters]);

//   if (!isOpen) return null;

//   const bankOptions = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'PNB', 'BOB'];
//   const loanStatuses = ['not_applied', 'applied', 'pre_approved', 'approved', 'rejected'];

//   const handlePhoneChange = (value: string) => {
//     setFormData(prev => {
//       const updated = { ...prev, phone: value };
//       if (sameAsPhone) {
//         const digits = String(value).replace(/\D/g, '');
//         const last10 = digits.slice(-10);
//         (updated as any).whatsapp_number = last10;
//       }
//       return updated;
//     });
//   };

//   const handleSameAsPhoneToggle = (checked: boolean) => {
//     setSameAsPhone(checked);
//     if (checked) {
//       const digits = String(formData.phone).replace(/\D/g, '');
//       const last10 = digits.slice(-10);
//       setFormData(prev => ({ ...prev, whatsapp_number: last10 }));
//     }
//   };

//   const setReq = (patch: any) =>
//     setFormData(prev => ({ ...prev, requirements: { ...prev.requirements, ...patch } }));
//   const setFin = (patch: any) =>
//     setFormData(prev => ({ ...prev, financials: { ...prev.financials, ...patch } }));

//   const handleBudgetFocus = (field: 'minBudget' | 'maxBudget') =>
//     setTouched(prev => ({ ...prev, [field]: true }));

//   const handleBudgetChange = (field: 'budget_min' | 'budget_max', value: any) => {
//     setTouched(prev => ({ ...prev, [field === 'budget_min' ? 'minBudget' : 'maxBudget']: true }));
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const toggleAmenity = (amenity: any) => {
//     const exists = formData.requirements.amenities.includes(amenity);
//     const amenities = exists
//       ? formData.requirements.amenities.filter((a: any) => a !== amenity)
//       : [...formData.requirements.amenities, amenity];
//     setReq({ amenities });
//   };

//   const togglePreferredLocation = (loc: any) => {
//     const exists = formData.requirements.preferredLocations.includes(loc);
//     const preferredLocations = exists
//       ? formData.requirements.preferredLocations.filter((l: any) => l !== loc)
//       : [...formData.requirements.preferredLocations, loc];
//     setReq({ preferredLocations });
//   };

//   const removePreferredLocation = (loc: any) =>
//     setReq({
//       preferredLocations: formData.requirements.preferredLocations.filter((l: any) => l !== loc),
//     });

//   const handleSave = async () => {
//     if (isSubmitting) {
//       console.log('⚠️ Already submitting, ignoring duplicate call');
//       return;
//     }

//     console.log('🟢 handleSave called, isSubmitting:', isSubmitting);

//     // Validation
//     if (!formData.name.trim()) {
//       toast.error('Name is required');
//       return;
//     }

//     if (!formData.phone.trim()) {
//       toast.error('Phone number is required');
//       return;
//     }

//     if (ageError) {
//       toast.error(ageError);
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const payload = {
//         ...formData,

//         // ✅ force add even if TS type doesn't know
//         assigned_executive:
//           (formData as any).assigned_executive ??
//           (user?.role?.toLowerCase().includes('executive')
//             ? user.id
//             : null),

//         budget_min: formData.budget_min,
//         budget_max: formData.budget_max,
//         requirements: JSON.stringify(formData.requirements || {}),
//         financials: JSON.stringify(formData.financials || {}),
//         created_at: buyer?.created_at || new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       } as any;


//       console.log('📤 Sending payload to API:', {
//         name: payload.name,
//         phone: payload.phone,
//         email: payload.email,
//         budget: `${payload.budget_min}-${payload.budget_max}`
//       });

//       let response;
//       if (buyer?.id) {
//         console.log(`🔄 Updating buyer ID: ${buyer.id}`);
//         response = await buyerAPI.update(buyer.id, payload);
//         console.log('✅ Update response:', response);
//       } else {
//         console.log('🆕 Creating new buyer');
//         response = await buyerAPI.create(payload);
//         console.log('✅ Create response:', response);
//       }

//       if (onSave && typeof onSave === 'function') {
//         console.log('📞 Calling onSave callback');
//         onSave(response);
//       } else {
//         console.warn('⚠️ onSave callback not available or not a function');
//       }

//       onClose?.();

//     } catch (error: any) {
//       console.error('❌ API Error:', error);
//       console.error('❌ Error response:', error.response?.data);

//       const msg = error?.response?.data?.message || error?.message || 'Unknown error';
//       toast.error(`Failed to save buyer: ${msg}`);
//     } finally {
//       console.log('🟢 Setting isSubmitting to false');
//       setIsSubmitting(false);
//     }
//   };

//   const getLabel = (key: string, val: any) =>
//     (getMasterOptions(key).find((o: any) => o.value === val)?.label ?? val);

//   if (masterLoading) {
//     return (
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
//             <p className="mt-4 text-gray-600">Loading master data...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
//       <div
//         ref={modalRef}
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">{buyer ? 'Edit Buyer' : 'Add New Buyer'}</h2>
//               <p className="text-gray-600 mt-1 text-xs">Enter buyer information and requirements</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-2 max-h-[70vh] overflow-y-auto">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
//             {/* Left */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Basic Information */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <User className="mr-2" size={20} />
//                   Basic Information
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
//                   <div className="md:col-span-3">
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Salutation <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={formData.salutation}
//                       onChange={(e) => setFormData(prev => ({ ...prev, salutation: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select</option>
//                       {getMasterOptions('salutation').map((o: any) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="md:col-span-9">
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter full name"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Contact Information */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <PhoneIcon className="mr-2" size={20} />
//                   Contact Information
//                 </h3>
//                 <div className="grid grid-cols-1 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Phone <span className="text-red-500">*</span>
//                     </label>
//                     <PhoneInput
//                       country={'in'}
//                       value={formData.phone}
//                       onChange={handlePhoneChange}
//                       inputClass="!w-full !h-8 !rounded !border-gray-300 !text-xs focus:!ring-1 focus:!ring-blue-500 focus:!border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
//                       <FaWhatsapp className="text-green-500" /> WhatsApp Number
//                       <div className="ml-auto flex items-center">
//                         <label className="relative inline-flex items-center cursor-pointer">
//                           <input
//                             type="checkbox"
//                             checked={sameAsPhone}
//                             onChange={e => handleSameAsPhoneToggle(e.target.checked)}
//                             className="sr-only"
//                           />
//                           <span className={`w-8 h-4 rounded-full relative transition-colors duration-200 ease-in-out ${sameAsPhone ? 'bg-blue-500' : 'bg-gray-300'}`}>
//                             <span className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ease-in-out ${sameAsPhone ? 'translate-x-4' : 'translate-x-0'}`} />
//                           </span>
//                           <span className="ml-2 text-xs text-gray-600">{sameAsPhone ? 'Same as phone' : 'Different'}</span>
//                         </label>
//                       </div>
//                     </label>
//                     <input
//                       type="tel"
//                       value={formData.whatsapp_number}
//                       onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       placeholder="WhatsApp number (without country code)"
//                       className={`border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${sameAsPhone ? 'bg-gray-100' : ''}`}
//                       disabled={sameAsPhone}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
//                     <input
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter email address"
//                     />
//                   </div>

//                   <div className="md:col-span-1">
//                     <DOBStepCalendar
//                       value={formData.dob || ISO_18Y_BACK}
//                       onChange={(iso) => setFormData(prev => ({ ...prev, dob: iso }))}
//                       label="Date of Birth"
//                       placeholder="Select date of birth"
//                       size="sm"
//                       max={ISO_18Y_BACK}
//                     />
//                     {ageError && <p className="mt-1 text-[11px] text-red-600">{ageError}</p>}
//                   </div>
//                 </div>
//               </div>

//               {/* Location Information */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <MapPin className="mr-2" size={20} />
//                   Location Information
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
//                     <input
//                       type="text"
//                       value={formData.state}
//                       onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter state"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
//                     <input
//                       type="text"
//                       value={formData.city}
//                       onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter city"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Location/Area</label>
//                     <input
//                       type="text"
//                       value={formData.location}
//                       onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter location/area"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Business Information */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Star className="mr-2" size={20} />
//                   Business Information
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
//                     <select
//                       value={formData.buyer_lead_source}
//                       onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_source: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Source</option>
//                       {getMasterOptions('buyer lead source').map((o: any) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
//                     <select
//                       value={formData.buyer_lead_priority}
//                       onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_priority: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Priority</option>
//                       {getMasterOptions('lead priority').map((o: any) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
//                     <select
//                       value={formData.buyer_lead_stage}
//                       onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_stage: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Stage</option>
//                       {getMasterOptions('buyer lead stage').map((o: any) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
//                     <select
//                       value={formData.buyer_lead_status}
//                       onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_status: e.target.value }))}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Status</option>
//                       {getMasterOptions('buyer lead status').map((o: any) => (
//                         <option key={o.value} value={o.value}>{o.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right */}
//             <div className="lg:col-span-3 space-y-6">
//               {/* Budget Information */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <IndianRupee className="mr-2" size={20} />
//                   Budget Information (Min-Max)
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <BudgetInput
//                     value={formData.budget_min}
//                     onChange={(v: any) => handleBudgetChange('budget_min', v)}
//                     onFocus={() => handleBudgetFocus('minBudget')}
//                     error={touched.minBudget && !formData.budget_min ? 'Minimum budget is required' : ''}
//                   />
//                   <BudgetInput
//                     value={formData.budget_max}
//                     onChange={(v: any) => handleBudgetChange('budget_max', v)}
//                     onFocus={() => handleBudgetFocus('maxBudget')}
//                     error={touched.maxBudget && !formData.budget_max ? 'Maximum budget is required' : ''}
//                   />
//                 </div>
//               </div>

//               {/* Property Requirements */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Home className="mr-2" size={20} />
//                   Property Requirements
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Property Type
//                       </label>
//                       <select
//                         value={formData?.requirements?.propertyType || ""}
//                         onChange={(e) =>
//                           setFormData((prev) => ({
//                             ...prev,
//                             requirements: {
//                               ...prev.requirements,
//                               propertyType: e.target.value,
//                             },
//                           }))
//                         }
//                         onBlur={(e) => e.target.blur()}
//                         className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       >
//                         <option value="">Select Property Type</option>
//                         {getMasterOptions("property type").map((o: any) => (
//                           <option key={o.value} value={o.value}>
//                             {o.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <MultiSelectDropdown
//                         label="Unit Type"
//                         options={getMasterOptions('unit type')}
//                         selectedValues={formData.requirements.unitTypes || []}
//                         onToggle={(val) => {
//                           const cur = formData.requirements.unitTypes || [];
//                           const updated = cur.includes(val) ? cur.filter((v: any) => v !== val) : [...cur, val];
//                           setReq({ unitTypes: updated });
//                         }}
//                         placeholder="Select unit types"
//                       />
//                       {formData.requirements.unitTypes?.length > 0 && (
//                         <div className="mt-2 flex flex-wrap gap-2">
//                           {formData.requirements.unitTypes.map((ut: any) => (
//                             <span key={ut} className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
//                               {getLabel('unit type', ut)}
//                               <button
//                                 type="button"
//                                 onClick={() => setReq({ unitTypes: (formData.requirements.unitTypes || []).filter((v: any) => v !== ut) })}
//                                 className="ml-1 text-green-500 hover:text-green-700"
//                               >
//                                 ×
//                               </button>
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Furnishing</label>
//                       <select
//                         value={formData.requirements.furnishing}
//                         onChange={(e) => setReq({ furnishing: e.target.value })}
//                         onBlur={(e) => e.target.blur()}
//                         className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       >
//                         <option value="">Any</option>
//                         {getMasterOptions('furnishing').map((o: any) => (
//                           <option key={o.value} value={o.value}>{o.label}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Possession</label>
//                       <select
//                         value={formData.requirements.possession}
//                         onChange={(e) => setReq({ possession: e.target.value })}
//                         onBlur={(e) => e.target.blur()}
//                         className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       >
//                         <option value="">Any</option>
//                         {getMasterOptions('possession').map((o: any) => (
//                           <option key={o.value} value={o.value}>{o.label}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Facing</label>
//                       <select
//                         value={formData.requirements.facing}
//                         onChange={(e) => setReq({ facing: e.target.value })}
//                         onBlur={(e) => e.target.blur()}
//                         className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       >
//                         <option value="">Any Facing</option>
//                         {getMasterOptions('facing').map((o: any) => (
//                           <option key={o.value} value={o.value}>{o.label}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Floor Preference</label>
//                       <select
//                         value={formData.requirements.floor}
//                         onChange={(e) => setReq({ floor: e.target.value })}
//                         onBlur={(e) => e.target.blur()}
//                         className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       >
//                         <option value="">Any Floor</option>
//                         {getMasterOptions('floor preference').map((o: any) => (
//                           <option key={o.value} value={o.value}>{o.label}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   {/* Preferred Locations */}
//                   <div>
//                     <MultiSelectDropdown
//                       label="Preferred Locations"
//                       options={getMasterOptions('location')}
//                       selectedValues={formData.requirements.preferredLocations}
//                       onToggle={togglePreferredLocation}
//                       placeholder="Select preferred locations"
//                       withSearch
//                     />
//                     {formData.requirements.preferredLocations.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {formData.requirements.preferredLocations.map((location: any) => (
//                           <div
//                             key={location}
//                             className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
//                           >
//                             <span>{getLabel('location', location)}</span>
//                             <button
//                               onClick={() => removePreferredLocation(location)}
//                               className="text-purple-600 hover:text-purple-800"
//                             >
//                               <X size={10} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* Amenities */}
//                   <div>
//                     <MultiSelectDropdown
//                       label="Required Amenities"
//                       options={getMasterOptions('amenities')}
//                       selectedValues={formData.requirements.amenities}
//                       onToggle={toggleAmenity}
//                       placeholder="Select required amenities"
//                       withSearch
//                     />
//                     {formData.requirements.amenities.length > 0 && (
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {formData.requirements.amenities.map((a: any) => (
//                           <div key={a} className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
//                             <span>{getLabel('amenities', a)}</span>
//                             <button onClick={() => toggleAmenity(a)} className="text-blue-600 hover:text-blue-800">
//                               <X size={10} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* Special Requirements */}
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Special Requirements & Additional Notes</label>
//                     <textarea
//                       value={formData.requirements.specialRequirements}
//                       onChange={(e) => setReq({ specialRequirements: e.target.value })}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Any specific requirements or additional notes..."
//                       rows={3}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Financial Information */}
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//               <CreditCard className="mr-2" size={20} />
//               Financial Information
//             </h3>
//             <div className="space-y-4">
//               <div className="flex items-center">
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={formData.financials.loanRequired}
//                     onChange={(e) => setFin({ loanRequired: e.target.checked })}
//                     className="sr-only"
//                   />
//                   <span className={`w-8 h-4 rounded-full relative transition-colors duration-200 ease-in-out ${formData.financials.loanRequired ? 'bg-blue-500' : 'bg-gray-300'}`}>
//                     <span className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ease-in-out ${formData.financials.loanRequired ? 'translate-x-4' : 'translate-x-0'}`} />
//                   </span>
//                   <span className="ml-2 text-xs font-medium text-gray-700">Loan Required</span>
//                 </label>
//               </div>

//               {formData.financials.loanRequired && (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.financials.loanAmount}
//                       onChange={(e) => setFin({ loanAmount: parseFloat(e.target.value) || 0 })}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter loan amount"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Down Payment (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.financials.downPayment}
//                       onChange={(e) => setFin({ downPayment: parseFloat(e.target.value) || 0 })}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter down payment"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
//                     <input
//                       type="number"
//                       value={formData.financials.monthlyIncome}
//                       onChange={(e) => setFin({ monthlyIncome: parseFloat(e.target.value) || 0 })}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter monthly income"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Bank Preference</label>
//                     <select
//                       value={formData.financials.bankPreference}
//                       onChange={(e) => setFin({ bankPreference: e.target.value })}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Bank</option>
//                       {bankOptions.map((bank) => (
//                         <option key={bank} value={bank}>{bank}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Loan Status</label>
//                     <select
//                       value={formData.financials.loanStatus}
//                       onChange={(e) => setFin({ loanStatus: e.target.value })}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">Select Loan Status</option>
//                       {loanStatuses.map((s) => (
//                         <option key={s} value={s}>
//                           {s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">Credit Score</label>
//                     <input
//                       type="number"
//                       value={formData.financials.creditScore}
//                       onChange={(e) => setFin({ creditScore: Math.max(0, parseInt(e.target.value, 10) || 0) })}
//                       onBlur={(e) => e.target.blur()}
//                       className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter credit score"
//                       min={300}
//                       max={900}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <AlertCircle size={16} className="text-gray-400 mr-2" />
//               <span className="text-xs text-gray-500">All fields marked with * are required</span>
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={isSubmitting}
//                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={16} className="mr-2" />
//                     {buyer ? 'Update Buyer' : 'Create Buyer'}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BuyerFormModal;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Save, User, Phone as PhoneIcon, MapPin, Star,
  AlertCircle, Home, CreditCard, ChevronDown, Search, IndianRupee, Calendar as CalendarIcon, Briefcase, DollarSign
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { FaWhatsapp } from 'react-icons/fa';
import 'react-phone-input-2/lib/style.css';
import { getMasterDropdownOptions } from '@/lib/useMasterData';
import BudgetInput from '@/pages/dashboard/components/BudgetInput';
import { buyerAPI } from '@/lib/buyerAPI';
import { toast } from 'react-toastify';
import DOBStepCalendar from '../ui/DOBStepCalendar';
import { useAuth } from '@/contexts/AuthContext';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

// ------------------------------
// Helpers (keep the same)
// ------------------------------
const parseMaybeJSON = (val: any) => {
  if (!val) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
};

const buildFormStateFromBuyer = (b: any) => {
  const req = parseMaybeJSON(b?.requirements) || b?.requirements || {
    propertyType: '',
    unitTypes: [],
    preferredLocations: [],
    amenities: [],
    furnishing: '',
    possession: '',
    facing: '',
    floor: '',
    specialRequirements: ''
  };

  const fin = parseMaybeJSON(b?.financials) || b?.financials || {
    loanRequired: false,
    loanAmount: '',
    downPayment: '',
    monthlyIncome: '',
    bankPreference: '',
    loanStatus: '',
    creditScore: ''
  };

  return {
    salutation: b?.salutation ?? 'Mr.',
    name: b?.name ?? '',
    phone: b?.phone ?? '',
    dob: b?.dob ?? b?.buyer_dob ?? ISO_18Y_BACK,
    whatsapp_number: b?.whatsapp_number ?? b?.whatsapp ?? '',
    email: b?.email ?? '',
    state: b?.state ?? '',
    city: b?.city ?? '',
    location: b?.location ?? '',
    buyer_lead_priority: b?.buyer_lead_priority ?? b?.priority ?? '',
    buyer_lead_source: b?.buyer_lead_source ?? b?.source ?? '',
    buyer_lead_stage: b?.buyer_lead_stage ?? b?.stage ?? '',
    buyer_lead_status: b?.buyer_lead_status ?? b?.status ?? '',
    budget_min: b?.budget_min ?? b?.budget?.min ?? '',
    budget_max: b?.budget_max ?? b?.budget?.max ?? '',
    requirements: {
      propertyType: req?.propertyType ?? '',
      unitTypes: Array.isArray(req?.unitTypes) ? req.unitTypes : [],
      preferredLocations: Array.isArray(req?.preferredLocations) ? req.preferredLocations : [],
      amenities: Array.isArray(req?.amenities) ? req.amenities : [],
      furnishing: req?.furnishing ?? '',
      possession: req?.possession ?? '',
      facing: req?.facing ?? '',
      floor: req?.floor ?? '',
      specialRequirements: req?.specialRequirements ?? ''
    },
    financials: {
      loanRequired: !!fin?.loanRequired,
      loanAmount: fin?.loanAmount ?? '',
      downPayment: fin?.downPayment ?? '',
      monthlyIncome: fin?.monthlyIncome ?? '',
      bankPreference: fin?.bankPreference ?? '',
      loanStatus: fin?.loanStatus ?? '',
      creditScore: fin?.creditScore ?? ''
    },
  };
};

const dedupeByValue = (opts: any[] = []) =>
  Array.from(new Map(opts.map(o => [o?.value, o])).values());

const toCanonical = (opts: { value: any; label: any }[] = [], incoming: any) => {
  if (incoming === null || incoming === undefined) return '';
  const s = String(incoming).trim();
  if (!s) return '';

  const byValue = opts.find(o => String(o.value).toLowerCase() === s.toLowerCase());
  if (byValue) return byValue.value;

  const byLabel = opts.find(o => String(o.label).toLowerCase() === s.toLowerCase());
  if (byLabel) return byLabel.value;

  return s;
};

const arrToCanonical = (opts: { value: any; label: any }[] = [], arr: any[] = []) =>
  (Array.isArray(arr) ? arr : [])
    .map(v => toCanonical(opts, v))
    .filter(Boolean);

const arePhoneNumbersSame = (phone1: string, phone2: string) => {
  if (!phone1 || !phone2) return false;
  const digits1 = String(phone1).replace(/\D/g, '');
  const digits2 = String(phone2).replace(/\D/g, '');
  const last10_1 = digits1.slice(-10);
  const last10_2 = digits2.slice(-10);
  return last10_1 === last10_2 && last10_1.length === 10;
};

// ------------------------------
// Fixed MultiSelectDropdown with proper closing behavior
// ------------------------------
const MultiSelectDropdown = ({
  label,
  options,
  selectedValues = [],
  onToggle,
  placeholder,
  withSearch = false
}: {
  label: string;
  options: any[];
  selectedValues?: any[];
  onToggle: (val: any) => void;
  placeholder: string;
  withSearch?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = useMemo(() => {
    if (!withSearch || !searchTerm) return safeOptions;
    const t = searchTerm.toLowerCase();
    return safeOptions.filter((o) => o?.label?.toLowerCase().includes(t));
  }, [withSearch, searchTerm, safeOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
      if (event.key === 'Tab' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && withSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, withSearch]);

  const handleToggle = (val: any) => {
    onToggle(val);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: MU }}>{label}</label>
      <button
        type="button"
        className="border rounded-lg w-full h-8 px-2.5 text-[11px] text-left focus:outline-none focus:ring-1 transition-all flex items-center justify-between bg-white"
        style={{ borderColor: BD }}
        onClick={() => {
          setIsOpen(prev => !prev);
          setSearchTerm('');
        }}
      >
        <span className="truncate" style={{ color: selectedValues.length > 0 ? N : MU }}>
          {selectedValues.length > 0
            ? selectedValues.slice(0, 2).join(', ') + (selectedValues.length > 2 ? ` +${selectedValues.length - 2}` : '')
            : placeholder}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: MU }} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-hidden" style={{ borderColor: BD }}>
          {withSearch && (
            <div className="p-1.5 border-b sticky top-0 bg-white z-10" style={{ borderColor: BD }}>
              <div className="relative">
                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[10px] border rounded-md focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-32">
            {filteredOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-1.5 hover:bg-gray-50 cursor-pointer gap-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="h-3 w-3 rounded"
                  style={{ accentColor: O }}
                />
                <span className="text-[10px]" style={{ color: N }}>{option.label}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-[10px] text-center" style={{ color: MU }}>No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- date helpers ----------
const TODAY = new Date();
const pad2 = (n: number) => String(n).padStart(2, '0');
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const EIGHTEEN_YEARS_BACK = new Date(
  TODAY.getFullYear() - 18,
  TODAY.getMonth(),
  TODAY.getDate()
);
const ISO_18Y_BACK = toISODate(EIGHTEEN_YEARS_BACK);

// Form Field Component
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
}> = ({ label, required, children, icon, error }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[9px] mt-0.5">{error}</p>}
  </div>
);

// ------------------------------
// Main Component
// ------------------------------
const BuyerFormModal = ({
  isOpen,
  onClose,
  buyer,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  buyer?: any;
  onSave?: (payload: any) => void;
}) => {
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<any>({});
  const [touched, setTouched] = useState({ minBudget: false, maxBudget: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => buildFormStateFromBuyer(buyer || {}));

  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const calcAge = (iso?: string) => {
    if (!iso) return 0;
    const d = new Date(iso);
    const today = new Date();
    let a = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
    return a;
  };

  const age = useMemo(() => calcAge(formData.dob), [formData.dob]);
  const ageError = formData.dob ? (age < 18 ? 'Buyer must be at least 18 years old' : '') : '';

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'buyer', 'property', 'lead']);
        setMasters(data || {});
      } catch (err) {
        console.error('Error fetching master options:', err);
      } finally {
        setMasterLoading(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const newFormData = buildFormStateFromBuyer(buyer || {});
      if (!buyer?.id) {
        const dept = (user?.department || '').toLowerCase();
        const role = (user?.role || '').toLowerCase();
        if ((dept.includes('presale') || dept.includes('sales')) && role.includes('executive')) {
          (newFormData as any).assigned_executive = String(user.id);
        }
      }
      setFormData(newFormData);
    }
  }, [isOpen, buyer, user]);

  const getMasterOptions = (key: string) => dedupeByValue(masters?.[key] || []);

  useEffect(() => {
    if (!isOpen || masterLoading) return;

    const buyerReqs = parseMaybeJSON(buyer?.requirements) || buyer?.requirements || {};

    setFormData(prev => {
      const propertyTypeOpts = getMasterOptions('property type');
      const unitTypeOpts = getMasterOptions('unit type');
      const locationOpts = getMasterOptions('location');
      const amenitiesOpts = getMasterOptions('amenities');
      const furnishingOpts = getMasterOptions('furnishing');
      const possessionOpts = getMasterOptions('possession');
      const facingOpts = getMasterOptions('facing');
      const floorOpts = getMasterOptions('floor preference');
      const salutationOpts = getMasterOptions('salutation');

      const updatedData = {
        ...prev,
        salutation: toCanonical(salutationOpts, prev.salutation ?? buyer?.salutation),
        buyer_lead_source: toCanonical(getMasterOptions('buyer lead source'), prev.buyer_lead_source ?? buyer?.buyer_lead_source ?? buyer?.source),
        buyer_lead_priority: toCanonical(getMasterOptions('lead priority'), prev.buyer_lead_priority ?? buyer?.buyer_lead_priority ?? buyer?.priority),
        buyer_lead_stage: toCanonical(getMasterOptions('buyer lead stage'), prev.buyer_lead_stage ?? buyer?.buyer_lead_stage ?? buyer?.stage),
        buyer_lead_status: toCanonical(getMasterOptions('buyer lead status'), prev.buyer_lead_status ?? buyer?.buyer_lead_status ?? buyer?.status),
        requirements: {
          ...prev.requirements,
          propertyType: toCanonical(propertyTypeOpts, prev.requirements?.propertyType ?? buyerReqs?.propertyType ?? ''),
          unitTypes: arrToCanonical(unitTypeOpts, prev.requirements?.unitTypes ?? buyerReqs?.unitTypes ?? []),
          preferredLocations: arrToCanonical(locationOpts, prev.requirements?.preferredLocations ?? buyerReqs?.preferredLocations ?? []),
          amenities: arrToCanonical(amenitiesOpts, prev.requirements?.amenities ?? buyerReqs?.amenities ?? []),
          furnishing: toCanonical(furnishingOpts, prev.requirements?.furnishing ?? buyerReqs?.furnishing ?? ''),
          possession: toCanonical(possessionOpts, prev.requirements?.possession ?? buyerReqs?.possession ?? ''),
          facing: toCanonical(facingOpts, prev.requirements?.facing ?? buyerReqs?.facing ?? ''),
          floor: toCanonical(floorOpts, prev.requirements?.floor ?? buyerReqs?.floor ?? ''),
        },
      };

      return updatedData;
    });
  }, [isOpen, masterLoading, buyer, masters]);

  if (!isOpen) return null;

  const bankOptions = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'PNB', 'BOB'];
  const loanStatuses = ['not_applied', 'applied', 'pre_approved', 'approved', 'rejected'];

  const handlePhoneChange = (value: string) => {
    setFormData(prev => {
      const updated = { ...prev, phone: value };
      if (sameAsPhone) {
        const digits = String(value).replace(/\D/g, '');
        const last10 = digits.slice(-10);
        (updated as any).whatsapp_number = last10;
      }
      return updated;
    });
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      const digits = String(formData.phone).replace(/\D/g, '');
      const last10 = digits.slice(-10);
      setFormData(prev => ({ ...prev, whatsapp_number: last10 }));
    }
  };

  const setReq = (patch: any) =>
    setFormData(prev => ({ ...prev, requirements: { ...prev.requirements, ...patch } }));
  const setFin = (patch: any) =>
    setFormData(prev => ({ ...prev, financials: { ...prev.financials, ...patch } }));

  const handleBudgetFocus = (field: 'minBudget' | 'maxBudget') =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const handleBudgetChange = (field: 'budget_min' | 'budget_max', value: any) => {
    setTouched(prev => ({ ...prev, [field === 'budget_min' ? 'minBudget' : 'maxBudget']: true }));
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: any) => {
    const exists = formData.requirements.amenities.includes(amenity);
    const amenities = exists
      ? formData.requirements.amenities.filter((a: any) => a !== amenity)
      : [...formData.requirements.amenities, amenity];
    setReq({ amenities });
  };

  const togglePreferredLocation = (loc: any) => {
    const exists = formData.requirements.preferredLocations.includes(loc);
    const preferredLocations = exists
      ? formData.requirements.preferredLocations.filter((l: any) => l !== loc)
      : [...formData.requirements.preferredLocations, loc];
    setReq({ preferredLocations });
  };

  const removePreferredLocation = (loc: any) =>
    setReq({
      preferredLocations: formData.requirements.preferredLocations.filter((l: any) => l !== loc),
    });

  const handleSave = async () => {
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (ageError) {
      toast.error(ageError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        assigned_executive: (formData as any).assigned_executive ??
          (user?.role?.toLowerCase().includes('executive') ? user.id : null),
        budget_min: formData.budget_min,
        budget_max: formData.budget_max,
        requirements: JSON.stringify(formData.requirements || {}),
        financials: JSON.stringify(formData.financials || {}),
        created_at: buyer?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      let response;
      if (buyer?.id) {
        response = await buyerAPI.update(buyer.id, payload);
      } else {
        response = await buyerAPI.create(payload);
      }

      if (onSave && typeof onSave === 'function') {
        onSave(response);
      }

      onClose?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Unknown error';
      toast.error(`Failed to save buyer: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabel = (key: string, val: any) =>
    (getMasterOptions(key).find((o: any) => o.value === val)?.label ?? val);

  if (masterLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: O }} />
            <p className="mt-4 text-xs" style={{ color: MU }}>Loading master data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ border: `1px solid ${BD}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <User size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{buyer ? 'Edit Buyer' : 'Add New Buyer'}</h2>
              <p className="text-[9px] text-white/70">Enter buyer information and requirements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Basic Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <User size={12} style={{ color: O }} /> Basic Information
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="col-span-1">
                    <FormField label="Salutation" required>
                      <select
                        value={formData.salutation}
                        onChange={(e) => setFormData(prev => ({ ...prev, salutation: e.target.value }))}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {getMasterOptions('salutation').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <div className="col-span-2">
                    <FormField label="Full Name" required>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Full name"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <PhoneIcon size={12} style={{ color: O }} /> Contact Information
                </h3>
                <div className="space-y-2">
                  <FormField label="Phone" required>
                    <PhoneInput
                      country={'in'}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      inputClass="!w-full !h-7 !rounded-lg !border-gray-200 !text-[10px] focus:!ring-1 focus:!ring-orange-500"
                    />
                  </FormField>

                  <div>
                    <label className="flex items-center gap-2 text-[9px] mb-1" style={{ color: MU }}>
                      <FaWhatsapp className="text-green-500" size={10} /> WhatsApp Number
                      <div className="ml-auto flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsPhone}
                            onChange={e => handleSameAsPhoneToggle(e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`w-6 h-3 rounded-full relative transition-colors ${sameAsPhone ? 'bg-orange-500' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 left-0.5 bg-white w-2 h-2 rounded-full transition-transform ${sameAsPhone ? 'translate-x-3' : 'translate-x-0'}`} />
                          </span>
                          <span className="ml-1 text-[8px]" style={{ color: MU }}>{sameAsPhone ? 'Same' : 'Different'}</span>
                        </label>
                      </div>
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                      className={`border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white ${sameAsPhone ? 'bg-gray-100' : ''}`}
                      style={{ borderColor: BD }}
                      placeholder="WhatsApp number"
                      disabled={sameAsPhone}
                    />
                  </div>

                  <FormField label="Email">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                      placeholder="Email address"
                    />
                  </FormField>

                  <FormField label="Date of Birth" required>
                    <DOBStepCalendar
                      value={formData.dob || ISO_18Y_BACK}
                      onChange={(iso) => setFormData(prev => ({ ...prev, dob: iso }))}
                      label=""
                      placeholder="Select date of birth"
                      size="sm"
                      max={ISO_18Y_BACK}
                    />
                    {ageError && <p className="text-red-500 text-[8px] mt-0.5">{ageError}</p>}
                  </FormField>
                </div>
              </div>

              {/* Location Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <MapPin size={12} style={{ color: O }} /> Location
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <FormField label="State">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                      placeholder="State"
                    />
                  </FormField>
                  <FormField label="City">
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                      placeholder="City"
                    />
                  </FormField>
                  <FormField label="Location/Area" className="col-span-2">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                      placeholder="Location/area"
                    />
                  </FormField>
                </div>
              </div>

              {/* Business Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <Briefcase size={12} style={{ color: O }} /> Business Info
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <FormField label="Source">
                    <select
                      value={formData.buyer_lead_source}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_source: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('buyer lead source').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Priority">
                    <select
                      value={formData.buyer_lead_priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_priority: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('lead priority').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Stage">
                    <select
                      value={formData.buyer_lead_stage}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_stage: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('buyer lead stage').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <select
                      value={formData.buyer_lead_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_status: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('buyer lead status').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Budget Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <DollarSign size={12} style={{ color: O }} /> Budget (Min-Max)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <BudgetInput
                    value={formData.budget_min}
                    onChange={(v: any) => handleBudgetChange('budget_min', v)}
                    onFocus={() => handleBudgetFocus('minBudget')}
                    error={touched.minBudget && !formData.budget_min ? 'Required' : ''}
                  />
                  <BudgetInput
                    value={formData.budget_max}
                    onChange={(v: any) => handleBudgetChange('budget_max', v)}
                    onFocus={() => handleBudgetFocus('maxBudget')}
                    error={touched.maxBudget && !formData.budget_max ? 'Required' : ''}
                  />
                </div>
              </div>

              {/* Property Requirements */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <Home size={12} style={{ color: O }} /> Property Requirements
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Property Type">
                      <select
                        value={formData?.requirements?.propertyType || ""}
                        onChange={(e) => setReq({ propertyType: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {getMasterOptions("property type").map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>

                    <MultiSelectDropdown
                      label="Unit Type"
                      options={getMasterOptions('unit type')}
                      selectedValues={formData.requirements.unitTypes || []}
                      onToggle={(val) => {
                        const cur = formData.requirements.unitTypes || [];
                        const updated = cur.includes(val) ? cur.filter((v: any) => v !== val) : [...cur, val];
                        setReq({ unitTypes: updated });
                      }}
                      placeholder="Select"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Furnishing">
                      <select
                        value={formData.requirements.furnishing}
                        onChange={(e) => setReq({ furnishing: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('furnishing').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Possession">
                      <select
                        value={formData.requirements.possession}
                        onChange={(e) => setReq({ possession: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('possession').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Facing">
                      <select
                        value={formData.requirements.facing}
                        onChange={(e) => setReq({ facing: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('facing').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Floor Preference">
                      <select
                        value={formData.requirements.floor}
                        onChange={(e) => setReq({ floor: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('floor preference').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <MultiSelectDropdown
                    label="Preferred Locations"
                    options={getMasterOptions('location')}
                    selectedValues={formData.requirements.preferredLocations}
                    onToggle={togglePreferredLocation}
                    placeholder="Select locations"
                    withSearch
                  />

                  <MultiSelectDropdown
                    label="Required Amenities"
                    options={getMasterOptions('amenities')}
                    selectedValues={formData.requirements.amenities}
                    onToggle={toggleAmenity}
                    placeholder="Select amenities"
                    withSearch
                  />

                  <FormField label="Special Requirements">
                    <textarea
                      value={formData.requirements.specialRequirements}
                      onChange={(e) => setReq({ specialRequirements: e.target.value })}
                      className="border rounded-lg w-full px-2 py-1 text-[10px] focus:outline-none focus:ring-1 bg-white resize-none"
                      style={{ borderColor: BD }}
                      placeholder="Any specific requirements..."
                      rows={2}
                    />
                  </FormField>
                </div>
              </div>

              {/* Financial Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <CreditCard size={12} style={{ color: O }} /> Financial
                </h3>
                <div className="flex items-center mb-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.financials.loanRequired}
                      onChange={(e) => setFin({ loanRequired: e.target.checked })}
                      className="sr-only"
                    />
                    <span className={`w-6 h-3 rounded-full relative transition-colors ${formData.financials.loanRequired ? 'bg-orange-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 bg-white w-2 h-2 rounded-full transition-transform ${formData.financials.loanRequired ? 'translate-x-3' : 'translate-x-0'}`} />
                    </span>
                    <span className="ml-2 text-[9px] font-medium" style={{ color: N }}>Loan Required</span>
                  </label>
                </div>

                {formData.financials.loanRequired && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Loan Amount (₹)">
                      <input
                        type="number"
                        value={formData.financials.loanAmount}
                        onChange={(e) => setFin({ loanAmount: parseFloat(e.target.value) || 0 })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Amount"
                      />
                    </FormField>
                    <FormField label="Down Payment (₹)">
                      <input
                        type="number"
                        value={formData.financials.downPayment}
                        onChange={(e) => setFin({ downPayment: parseFloat(e.target.value) || 0 })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Down payment"
                      />
                    </FormField>
                    <FormField label="Monthly Income (₹)">
                      <input
                        type="number"
                        value={formData.financials.monthlyIncome}
                        onChange={(e) => setFin({ monthlyIncome: parseFloat(e.target.value) || 0 })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Income"
                      />
                    </FormField>
                    <FormField label="Bank Preference">
                      <select
                        value={formData.financials.bankPreference}
                        onChange={(e) => setFin({ bankPreference: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {bankOptions.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Loan Status">
                      <select
                        value={formData.financials.loanStatus}
                        onChange={(e) => setFin({ loanStatus: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {loanStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Credit Score">
                      <input
                        type="number"
                        value={formData.financials.creditScore}
                        onChange={(e) => setFin({ creditScore: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="300-900"
                        min={300}
                        max={900}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center">
            <AlertCircle size={12} style={{ color: MU }} />
            <span className="text-[8px] ml-1" style={{ color: MU }}>Fields marked with * are required</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50"
              style={{ border: `1px solid ${BD}`, color: N }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
              style={{ background: O }}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={10} />
                  {buyer ? 'Update Buyer' : 'Create Buyer'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerFormModal;