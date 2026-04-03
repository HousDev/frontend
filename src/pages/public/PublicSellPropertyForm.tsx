// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import 'react-phone-input-2/lib/style.css';
// import PhoneInput from 'react-phone-input-2';
// import { X, Upload, Plus, FileText, Trash2, Edit, ArrowRight, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';

// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
// import Modal from '@/components/ui/Modal';
// import Button from '@/components/ui/Button';
// import Dropdown from '@/components/ui/Dropdown';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// import { toast } from 'react-toastify';
// import { FaWhatsapp } from 'react-icons/fa';
// import { createPortal } from 'react-dom';
// import { sellerAPI } from '@/lib/sellersAPI';
// import PriceRangeSelector from '@/components/ui/PriceRangeSelector';

// /* ─────────────────────────────────────────────────────────────
//    TYPES  (unchanged from original)
// ───────────────────────────────────────────────────────────── */
// export interface NearbyPlace {
//   name: string;
//   distance?: string;
//   type?: string;
//   unit?: string;
// }

// interface FilePreview {
//   file?: File;
//   url: string;
//   type: 'image' | 'document';
//   isExisting?: boolean;
//   name?: string;
// }

// interface PropertyFormData {
//   salutation: string;
//   ownerName: string;
//   ownerPhone: string;
//   ownerWhatsapp: string;
//   sameAsPhone: boolean;
//   ownerEmail: string;
//   ownerType: string;
//   seller: string;
//   propertyType: string;
//   propertySubtype: string;
//   unitType: string;
//   wing: string;
//   unitNo: string;
//   furnishing: string;
//   parkingType: string;
//   parkingQty: string;
//   city: string;
//   location: string;
//   society: string;
//   floor: string;
//   totalFloors: string;
//   carpetArea: string;
//   builtupArea: string;
//   budget: string;
//   address: string;
//   status: string;
//   leadSource: string;
//   possessionMonth: string;
//   possessionYear: string;
//   purchaseMonth: string;
//   purchaseYear: string;
//   sellingRights: string;
//   amenities: string[];
//   furnishingItems: string[];
//   description: string;
//   nearby_places: NearbyPlace[];
//   ownershipDoc: File | null;
//   photos: File[];
//   ownershipDocUrl?: string;
//   photoUrls?: string[];
//   bedrooms?: string;
//   bathrooms?: string;
//   facing?: string;
//   priceType?: 'Fixed' | 'Negotiable' | '';
//   finalPrice?: string;
// }

// interface InitialDataFromParent {
//   id?: string | number;
//   salutation?: string;
//   ownerName?: string;
//   ownerPhone?: string;
//   ownerWhatsapp?: string;
//   sameAsPhone?: boolean;
//   ownerEmail?: string;
//   ownerType?: string;
//   seller?: string;
//   propertyType?: string;
//   propertySubtype?: string;
//   unitType?: string;
//   wing?: string;
//   unitNo?: string;
//   furnishing?: string;
//   parkingType?: string;
//   parkingQty?: string;
//   city?: string;
//   location?: string;
//   society?: string;
//   floor?: string;
//   totalFloors?: string;
//   carpetArea?: string;
//   builtupArea?: string;
//   budget?: string;
//   address?: string;
//   status?: string;
//   leadSource?: string;
//   possessionMonth?: string;
//   possessionYear?: string;
//   purchaseMonth?: string;
//   purchaseYear?: string;
//   sellingRights?: string;
//   amenities?: string[];
//   furnishingItems?: string[];
//   description?: string;
//   nearby_places?: NearbyPlace[];
//   existingOwnershipDocUrl?: string;
//   existingOwnershipDocName?: string;
//   existingOwnershipDocId?: string;
//   existingPhotos?: Array<{ id: string; url: string; name?: string }>;
//   bedrooms?: string;
//   bathrooms?: string;
//   facing?: string;
//   priceType?: 'Fixed' | 'Negotiable' | "";
//   finalPrice?: string;
// }

// interface PublicSellPropertyFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit?: (property: any) => void;
//   mode?: 'create' | 'edit';
//   propertyId?: string | number;
//   initialData?: InitialDataFromParent | null;
//   seller?: string | null;
// }

// /* ─────────────────────────────────────────────────────────────
//    HELPERS  (unchanged)
// ───────────────────────────────────────────────────────────── */
// const RUPEE_PER_CRORE = 10_000_000;
// const RUPEE_PER_LAKH = 100_000;

// export function parseBudgetToRupees(text?: string): number {
//   const raw = (text || '').trim().toLowerCase();
//   if (!raw) return 0;
//   const cleaned = raw.replace(/₹/g, '').replace(/\s+/g, '');
//   const digitsOnly = cleaned.replace(/,/g, '');
//   if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
//   const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
//   if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, '')) * RUPEE_PER_LAKH) || 0;
//   const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
//   if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, '')) * RUPEE_PER_CRORE) || 0;
//   const n = parseFloat(digitsOnly);
//   return Number.isNaN(n) ? 0 : Math.round(n);
// }

// export function rupeesToCrores(r: number): number {
//   if (!r || r <= 0) return 0.01;
//   return r / RUPEE_PER_CRORE;
// }

// /* ─────────────────────────────────────────────────────────────
//    DESIGN TOKENS  (new)
// ───────────────────────────────────────────────────────────── */
// const BRAND = '#E6761D';
// const BRAND_DARK = '#CC6A1A';
// const BRAND_LIGHT = '#FEF3E8';
// const BRAND_BORDER = '#F5C07A';

// // Field label style
// const LBL = 'block text-[11px] font-semibold uppercase tracking-wide text-black mb-1.5';
// // Base input
// const INP =
//   'w-full h-9 px-3 rounded-lg text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/30 focus:border-[#E6761D] transition-colors placeholder:text-gray-400';
// // Section heading
// const SECTION_HDR =
//   'flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4 ' +
//   'after:content-[""] after:flex-1 after:h-px after:bg-gray-100';

// /* ─────────────────────────────────────────────────────────────
//    SCROLL-PARENT HELPER  (unchanged)
// ───────────────────────────────────────────────────────────── */
// function getScrollParents(node: Element | null): Element[] {
//   const parents: Element[] = [];
//   let el = node?.parentElement || null;
//   while (el) {
//     const style = window.getComputedStyle(el);
//     const oy = style.overflowY;
//     if (oy === 'auto' || oy === 'scroll' || el === document.body) parents.push(el);
//     el = el.parentElement;
//   }
//   return parents;
// }

// /* ─────────────────────────────────────────────────────────────
//    SAFE DROPDOWN  (unchanged)
// ───────────────────────────────────────────────────────────── */
// const SafeDropdown: React.FC<any> = (props) => <Dropdown {...props} />;

// /* ─────────────────────────────────────────────────────────────
//    MULTI-SELECT DROPDOWN  (logic unchanged, design improved)
// ───────────────────────────────────────────────────────────── */
// const MultiSelectDropdown: React.FC<{
//   options: MasterOption[];
//   selectedValues: string[];
//   onToggle: (value: string) => void;
//   label: string;
//   placeholder?: string;
// }> = ({ options, selectedValues, onToggle, label, placeholder = 'Select options…' }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const buttonRef = useRef<HTMLButtonElement | null>(null);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);
//   const [rect, setRect] = useState<DOMRect | null>(null);

//   const filteredOptions = useMemo(
//     () => options.filter((o) => (o.label || '').toLowerCase().includes(searchTerm.toLowerCase())),
//     [options, searchTerm],
//   );

//   const displayText = useMemo(() => {
//     if (selectedValues.length === 0) return placeholder;
//     if (selectedValues.length === 1) {
//       const option = options.find((opt) => String(opt.value) === String(selectedValues[0]));
//       return option?.label || selectedValues[0];
//     }
//     return `${selectedValues.length} items selected`;
//   }, [selectedValues, options, placeholder]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const onDocClick = (e: MouseEvent) => {
//       const target = e.target as Node;
//       if (dropdownRef.current?.contains(target)) return;
//       if (buttonRef.current?.contains(target)) return;
//       setIsOpen(false);
//       setSearchTerm('');
//     };
//     document.addEventListener('mousedown', onDocClick);
//     return () => document.removeEventListener('mousedown', onDocClick);
//   }, [isOpen]);

//   const updateRect = () => {
//     if (!buttonRef.current) return setRect(null);
//     setRect(buttonRef.current.getBoundingClientRect());
//   };

//   useEffect(() => {
//     if (!isOpen) return;
//     updateRect();
//     const onResize = () => updateRect();
//     const onScroll = () => updateRect();
//     window.addEventListener('resize', onResize);
//     window.addEventListener('scroll', onScroll, true);
//     const parents = getScrollParents(buttonRef.current);
//     parents.forEach((p) => p.addEventListener('scroll', onScroll, true));
//     return () => {
//       window.removeEventListener('resize', onResize);
//       window.removeEventListener('scroll', onScroll, true);
//       parents.forEach((p) => p.removeEventListener('scroll', onScroll, true));
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen]);

//   useEffect(() => {
//     const prev = document.body.style.overflow;
//     if (isOpen) document.body.style.overflow = 'hidden';
//     else document.body.style.overflow = prev || '';
//     return () => { document.body.style.overflow = prev || ''; };
//   }, [isOpen]);

//   const getPortalTarget = () => {
//     if (typeof document === 'undefined') return null;
//     return document.getElementById('modal-portal') || document.body;
//   };

//   const isModalPortal = typeof document !== 'undefined' && !!document.getElementById('modal-portal');
//   const Z = isModalPortal ? 1050 : 9999999;

//   const popupStyle: React.CSSProperties = rect
//     ? {
//       position: 'fixed', zIndex: Z,
//       top: rect.bottom + window.scrollY + 6,
//       left: rect.left + window.scrollX,
//       minWidth: rect.width,
//       maxHeight: '40vh', overflow: 'hidden',
//       pointerEvents: 'auto',
//       boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
//     }
//     : { position: 'fixed', zIndex: Z, top: 0, left: 0, minWidth: 200, pointerEvents: 'auto' };

//   const popup = (
//     <div
//       ref={dropdownRef}
//       className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
//       style={popupStyle}
//     >
//       <div className="p-2.5 border-b border-gray-100">
//         <input
//           type="text"
//           placeholder="Search…"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
//           autoFocus
//         />
//       </div>
//       <div className="max-h-52 overflow-y-auto">
//         {filteredOptions.length === 0 ? (
//           <p className="text-xs text-gray-400 p-3 text-center">No options found</p>
//         ) : (
//             filteredOptions.map((option) => (
//               <label
//                 key={String(option.value)}
//                 className="flex items-center px-3 py-2.5 hover:bg-orange-50 cursor-pointer transition-colors"
//               >
//               <input
//                 type="checkbox"
//                 checked={selectedValues.map(String).includes(String(option.value))}
//                   onChange={() => onToggle(String(option.value))}
//                   className="mr-3 h-4 w-4 rounded border-gray-300 accent-orange-500"
//               />
//               <span className="text-sm text-gray-700">{option.label}</span>
//             </label>
//           ))
//         )}
//       </div>
//       {selectedValues.length > 0 && (
//         <div className="px-3 py-2 bg-orange-50 border-t border-orange-100 text-xs text-orange-600 font-medium">
//           {selectedValues.length} item{selectedValues.length !== 1 ? 's' : ''} selected
//         </div>
//       )}
//     </div>
//   );

//   const portalTarget = typeof document !== 'undefined' ? getPortalTarget() : null;

//   return (
//     <div className="relative">
//       <label className={LBL}>{label}</label>
//       <button
//         ref={buttonRef}
//         type="button"
//         onClick={(e) => {
//           e.stopPropagation();
//           setIsOpen((prev) => !prev);
//           setTimeout(updateRect, 0);
//         }}
//         className={`${INP} flex items-center justify-between text-left`}
//       >
//         <span className={selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
//           {displayText}
//         </span>
//         <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
//       </button>
//       {isOpen && buttonRef.current && portalTarget && createPortal(popup, portalTarget)}
//     </div>
//   );
// };

// /* ─────────────────────────────────────────────────────────────
//    FILE PREVIEW  (logic unchanged, design improved)
// ───────────────────────────────────────────────────────────── */
// const FilePreviewComponent: React.FC<{
//   preview: FilePreview;
//   onRemove: () => void;
// }> = ({ preview, onRemove }) => (
//   <div className="relative group rounded-xl overflow-hidden border border-gray-200">
//     {preview.type === 'image' ? (
//       <>
//         <img
//           src={preview.url}
//           alt={preview.name || preview.file?.name || 'Image'}
//           className="w-full h-24 object-cover"
//         />
//         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
//           <button
//             onClick={onRemove}
//             className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1.5 transition-all hover:bg-red-600 hover:scale-110"
//           >
//             <X size={14} />
//           </button>
//         </div>
//         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
//           <p className="text-white text-[10px] truncate">{preview.name || preview.file?.name}</p>
//         </div>
//       </>
//     ) : (
//         <div className="bg-gray-50 p-3 h-24 flex flex-col items-center justify-center gap-1">
//           <FileText className="text-orange-500" size={22} />
//           <span className="text-xs text-gray-600 text-center truncate w-full px-1">
//             {preview.name || preview.file?.name || 'Document'}
//           </span>
//           <button
//             onClick={onRemove}
//             className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
//           >
//             <X size={11} />
//           </button>
//         </div>
//       )}
//     </div>
//   );

// /* ─────────────────────────────────────────────────────────────
//    POSSESSION DROPDOWN  (unchanged)
// ───────────────────────────────────────────────────────────── */
// const PossessionDropdown: React.FC<{
//   possessionMonth: string;
//   possessionYear: string;
//   onMonthChange: (month: string) => void;
//   onYearChange: (year: string) => void;
//   title: string;
// }> = ({ possessionMonth, possessionYear, onMonthChange, onYearChange, title }) => {
//   const now = new Date();
//   const CURRENT_YEAR = now.getFullYear();
//   const CURRENT_MONTH = now.getMonth() + 1;

//   const monthNames = useMemo(
//     () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
//     [],
//   );

//   const currentYear = parseInt(possessionYear) || CURRENT_YEAR;
//   const currentMonth = parseInt(possessionMonth) || CURRENT_MONTH;

//   useEffect(() => {
//     if (currentYear === CURRENT_YEAR && currentMonth > CURRENT_MONTH) {
//       onMonthChange(CURRENT_MONTH.toString());
//     }
//   }, [currentYear, currentMonth, CURRENT_MONTH, CURRENT_YEAR, onMonthChange]);

//   const yearOptions = Array.from({ length: 40 }, (_, i) => {
//     const y = (CURRENT_YEAR - i).toString();
//     return { value: y, label: y };
//   });

//   const monthOptions = monthNames.map((name, idx) => {
//     const m = idx + 1;
//     const disabled = currentYear === CURRENT_YEAR && m > CURRENT_MONTH;
//     return { value: m.toString(), label: name, disabled };
//   });

//   return (
//     <div>
//       <label className={LBL}>{title}</label>
//       <div className="flex gap-2">
//         <div className="flex-1">
//           <SafeDropdown placeholder="Year" options={yearOptions} value={possessionYear} onChange={onYearChange} className="w-full" />
//         </div>
//         <div className="flex-1">
//           <SafeDropdown
//             placeholder="Month"
//             options={monthOptions.filter((o) => !o.disabled)}
//             value={possessionMonth}
//             onChange={onMonthChange}
//             className="w-full"
//           />
//         </div>
//       </div>
//       {possessionMonth && possessionYear && (
//         <p className="mt-1.5 text-[16px] text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
//           {monthNames[parseInt(possessionMonth) - 1]} {possessionYear}
//         </p>
//       )}
//     </div>
//   );
// };

// /* ─────────────────────────────────────────────────────────────
//    STEP INDICATOR  (new UI component)
// ───────────────────────────────────────────────────────────── */
// const StepIndicator: React.FC<{ currentStep: 1 | 2 }> = ({ currentStep }) => (
//   <div className="flex items-center gap-2">
//     {/* Step 1 */}
//     <div className="flex items-center gap-2">
//       <div
//         className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep === 1
//           ? 'bg-[#E6761D] text-white shadow-sm shadow-orange-200'
//           : 'bg-orange-100 text-orange-600'
//           }`}
//       >
//         {currentStep > 1 ? <CheckCircle2 size={14} /> : '1'}
//       </div>
//       <span className={`text-xs font-semibold hidden sm:block ${currentStep === 1 ? 'text-gray-800' : 'text-gray-400'}`}>
//         Owner
//       </span>
//     </div>
//     {/* Connector */}
//     <div className="flex-1 h-px bg-gray-200 w-8 relative">
//       <div
//         className="absolute inset-y-0 left-0 bg-orange-400 transition-all duration-500"
//         style={{ width: currentStep > 1 ? '100%' : '0%' }}
//       />
//     </div>
//     {/* Step 2 */}
//     <div className="flex items-center gap-2">
//       <div
//         className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep === 2
//           ? 'bg-[#E6761D] text-white shadow-md shadow-orange-200'
//           : 'bg-gray-100 text-gray-400'
//           }`}
//       >
//         2
//       </div>
//       <span className={`text-xs font-semibold hidden sm:block ${currentStep === 2 ? 'text-gray-800' : 'text-gray-400'}`}>
//         Property
//       </span>
//     </div>
//   </div>
// );

// /* ─────────────────────────────────────────────────────────────
//    FIELD WRAPPER  (new helper for consistent field layout)
// ───────────────────────────────────────────────────────────── */
// const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string }> = ({
//   label, required, error, children, className = '',
// }) => (
//   <div className={`flex flex-col gap-1 ${className}`}>
//     <label className={LBL}>
//       {label} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
//     </label>
//     {children}
//     {error && <p className="text-red-400 text-[11px] mt-0.5">{error}</p>}
//   </div>
// );

// /* ─────────────────────────────────────────────────────────────
//    SECTION HEADER  (new helper)
// ───────────────────────────────────────────────────────────── */
// const SectionHeader: React.FC<{
//   children: React.ReactNode;
// }> = ({ children }) => {
//   return (
//     <div className={SECTION_HDR}>
//       <span className="text-[#E6761D]">
//         {children}
//       </span>
//     </div>
//   );
//   };
// /* ─────────────────────────────────────────────────────────────
//    MAIN COMPONENT
// ───────────────────────────────────────────────────────────── */
// const PublicSellPropertyForm: React.FC<PublicSellPropertyFormProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   mode = 'create',
//   propertyId,
//   initialData,
//   seller,
// }) => {
//   const now = new Date();
//   const CURRENT_YEAR = now.getFullYear();
//   const CURRENT_MONTH = now.getMonth() + 1;

//   const [step, setStep] = useState<1 | 2>(1);

//   const [formData, setFormData] = useState<PropertyFormData>(() => ({
//     salutation: 'Mr',
//     ownerName: '',
//     ownerPhone: '',
//     ownerWhatsapp: '',
//     sameAsPhone: false,
//     ownerEmail: '',
//     ownerType: 'individual',
//     seller: '',
//     propertyType: '',
//     propertySubtype: '',
//     unitType: '',
//     wing: '',
//     unitNo: '',
//     furnishing: '',
//     parkingType: '',
//     parkingQty: '',
//     city: '',
//     location: '',
//     society: '',
//     floor: '',
//     totalFloors: '',
//     carpetArea: '',
//     builtupArea: '',
//     budget: '',
//     address: '',
//     status: '',
//     leadSource: '',
//     possessionMonth: String(CURRENT_MONTH),
//     possessionYear: String(CURRENT_YEAR),
//     purchaseMonth: String(CURRENT_MONTH),
//     purchaseYear: String(CURRENT_YEAR),
//     sellingRights: 'Standard',
//     amenities: [],
//     furnishingItems: [],
//     description: '',
//     nearby_places: [],
//     ownershipDoc: null,
//     photos: [],
//     bedrooms: '',
//     bathrooms: '',
//     facing: '',
//     priceType: '',
//     finalPrice: '',
//   }));

//   const [ownershipDocPreview, setOwnershipDocPreview] = useState<FilePreview | null>(null);
//   const [photoPreviews, setPhotoPreviews] = useState<FilePreview[]>([]);
//   const [nearbyPlaceForm, setNearbyPlaceForm] = useState({ name: '', distance: '', unit: '', type: '' });
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [loading, setLoading] = useState(false);
//   const [errorBanner, setErrorBanner] = useState<string | null>(null);
//   const [masterOptions, setMasterOptions] = useState<Record<string, MasterOption[]>>({});
//   const [leadSourceLocked, setLeadSourceLocked] = useState<boolean>(false);
//   const [showThankYou, setShowThankYou] = useState(false);

//   /* ── helpers ── */
//   const getLabelFromValue = (options: MasterOption[] = [], value: string) => {
//     if (!value || !options?.length) return '';
//     return (
//       options.find((o) => String(o.value) === String(value))?.label ||
//       options.find((o) => String(o.value).toLowerCase() === String(value).toLowerCase())?.label ||
//       options.find((o) => String(o.label).toLowerCase() === String(value).toLowerCase())?.label ||
//       ''
//     );
//   };

//   const createFilePreview = (file: File): FilePreview => ({
//     file,
//     url: URL.createObjectURL(file),
//     type: file.type.startsWith('image/') ? 'image' : 'document',
//     isExisting: false,
//   });

//   const createExistingFilePreview = (url: string, name: string): FilePreview => ({
//     url,
//     type: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? 'image' : 'document',
//     isExisting: true,
//     name,
//   });

//   const cleanupPreview = (p: FilePreview) => {
//     if (!p.isExisting && p.url) URL.revokeObjectURL(p.url);
//   };

//   const cleanupAllPreviews = () => {
//     if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
//     photoPreviews.forEach((p) => { if (!p.isExisting) cleanupPreview(p); });
//   };

//   const normalizeMasterData = (raw: any): Record<string, MasterOption[]> => {
//     const out: Record<string, MasterOption[]> = {};
//     if (!raw) return out;
//     const walk = (obj: any) => {
//       if (!obj || typeof obj !== 'object') return;
//       Object.keys(obj).forEach((k) => {
//         const val = obj[k];
//         const key = (k || '').toLowerCase().trim();
//         if (Array.isArray(val)) out[key] = val;
//         else if (val && typeof val === 'object') {
//           Object.keys(val).forEach((inner) => {
//             const iv = val[inner];
//             if (Array.isArray(iv)) out[(inner || '').toLowerCase().trim()] = iv;
//           });
//         }
//       });
//     };
//     walk(raw);
//     if (Object.keys(out).length === 0) {
//       try { Object.keys(raw).forEach((k) => { const v = raw[k]; if (Array.isArray(v)) out[k.toLowerCase().trim()] = v; }); }
//       catch { /* noop */ }
//     }
//     return out;
//   };

//   const fetchMasterData = async () => {
//     try {
//       const data = await getMasterDropdownOptions(['lead', 'common', 'property']);
//       const normalized = normalizeMasterData(data);
//       setMasterOptions(normalized);
//       const leadOpts: MasterOption[] = normalized['lead source'] || normalized['lead'] || [];
//       const websiteOpt = leadOpts.find(
//         (o) =>
//           (o.label && String(o.label).toLowerCase() === 'website') ||
//           String(o.value).toLowerCase() === 'website',
//       );
//       setFormData((prev) => ({ ...prev, leadSource: websiteOpt ? String(websiteOpt.value) : 'Website' }));
//       setLeadSourceLocked(true);
//     } catch (err: any) {
//       setErrorBanner(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
//     }
//   };

//   useEffect(() => {
//     if (!isOpen) return;
//     setErrorBanner(null);
//     setErrors({});
//     fetchMasterData();

//     if (mode === 'edit' && initialData) {
//       const seed: PropertyFormData = {
//         salutation: initialData.salutation || 'Mr',
//         ownerName: initialData.ownerName || '',
//         ownerPhone: initialData.ownerPhone || '',
//         ownerWhatsapp: initialData.ownerWhatsapp || '',
//         sameAsPhone: initialData.sameAsPhone ?? false,
//         ownerEmail: initialData.ownerEmail || '',
//         ownerType: initialData.ownerType || 'individual',
//         seller: initialData.seller || '',
//         propertyType: initialData.propertyType || '',
//         propertySubtype: initialData.propertySubtype || '',
//         unitType: initialData.unitType || '',
//         wing: initialData.wing || '',
//         unitNo: initialData.unitNo || '',
//         furnishing: initialData.furnishing || '',
//         parkingType: initialData.parkingType || '',
//         parkingQty: initialData.parkingQty || '',
//         city: initialData.city || '',
//         location: initialData.location || '',
//         society: initialData.society || '',
//         floor: initialData.floor || '',
//         totalFloors: initialData.totalFloors || '',
//         carpetArea: initialData.carpetArea || '',
//         builtupArea: initialData.builtupArea || '',
//         budget: initialData.budget || '',
//         address: initialData.address || '',
//         status: initialData.status || '',
//         leadSource: initialData.leadSource || '',
//         possessionMonth: initialData.possessionMonth || String(CURRENT_MONTH),
//         possessionYear: initialData.possessionYear || String(CURRENT_YEAR),
//         purchaseMonth: initialData.purchaseMonth || String(CURRENT_MONTH),
//         purchaseYear: initialData.purchaseYear || String(CURRENT_YEAR),
//         sellingRights: initialData.sellingRights || 'Standard',
//         amenities: (initialData.amenities || []).map(String),
//         furnishingItems: (initialData.furnishingItems || []).map(String),
//         description: initialData.description || '',
//         nearby_places: initialData.nearby_places || [],
//         ownershipDoc: null,
//         photos: [],
//         ownershipDocUrl: initialData.existingOwnershipDocUrl,
//         photoUrls: (initialData.existingPhotos || []).map((p) => p.url),
//         bedrooms: initialData.bedrooms || '',
//         bathrooms: initialData.bathrooms || '',
//         facing: initialData.facing || '',
//         priceType: (initialData.priceType as 'Fixed' | 'Negotiable') || '',
//         finalPrice: initialData.finalPrice || '',
//       };
//       setFormData(seed);
//       if (initialData.existingOwnershipDocUrl) {
//         setOwnershipDocPreview(createExistingFilePreview(initialData.existingOwnershipDocUrl, initialData.existingOwnershipDocName || 'Ownership Document'));
//       } else {
//         setOwnershipDocPreview(null);
//       }
//       setPhotoPreviews((initialData.existingPhotos || []).map((p) => createExistingFilePreview(p.url, p.name || 'Photo')));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         possessionMonth: String(CURRENT_MONTH),
//         possessionYear: String(CURRENT_YEAR),
//         purchaseMonth: String(CURRENT_MONTH),
//         purchaseYear: String(CURRENT_YEAR),
//         sellingRights: 'Standard',
//         sameAsPhone: false,
//       }));
//       setOwnershipDocPreview(null);
//       setPhotoPreviews([]);
//     }
//     setStep(1);
//     return () => { cleanupAllPreviews(); setOwnershipDocPreview(null); setPhotoPreviews([]); };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, mode, initialData]);

//   const generateAddress = () => {
//     const parts: string[] = [];
//     if (formData.wing?.trim()) parts.push(`Wing ${formData.wing.trim()}`);
//     if (formData.unitNo?.trim()) parts.push(`Unit No ${formData.unitNo.trim()}`);
//     if (formData.society && masterOptions['society']) {
//       const lbl = getLabelFromValue(masterOptions['society'], formData.society);
//       if (lbl) parts.push(lbl);
//     }
//     if (formData.floor && masterOptions['floor']) {
//       const fl = getLabelFromValue(masterOptions['floor'], formData.floor);
//       if (fl) parts.push(fl.toLowerCase().includes('floor') ? fl : `${fl} Floor`);
//     }
//     if (formData.location && masterOptions['location']) {
//       const loc = getLabelFromValue(masterOptions['location'], formData.location);
//       if (loc) parts.push(loc);
//     }
//     if (formData.city && masterOptions['city']) {
//       const c = getLabelFromValue(masterOptions['city'], formData.city);
//       if (c) parts.push(c);
//     }
//     return parts.join(', ');
//   };

//   useEffect(() => {
//     if (!isOpen || mode !== 'create' || Object.keys(masterOptions).length === 0) return;
//     const addr = generateAddress();
//     if (addr) setFormData((prev) => ({ ...prev, address: addr }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, mode, formData.wing, formData.unitNo, formData.society, formData.floor, formData.location, formData.city, masterOptions]);

//   useEffect(() => {
//     if (!isOpen || mode !== 'create') return;
//     const autop = `${formData.salutation || ''} ${formData.ownerName || ''}`.trim();
//     setFormData((prev) => ({ ...prev, seller: autop }));
//   }, [formData.salutation, formData.ownerName, isOpen, mode]);

//   /* ── event handlers (all unchanged) ── */
//   const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;
//     const val = type === 'checkbox' ? checked : value;
//     setFormData((prev) => {
//       const next: any = { ...prev, [name]: val };
//       if (name === 'sameAsPhone' && val === true) next.ownerWhatsapp = next.ownerPhone;
//       if (name === 'ownerPhone' && prev.sameAsPhone) next.ownerWhatsapp = value;
//       return next;
//     });
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   const handleDropdownChange = (field: keyof PropertyFormData) => (value: string) => {
//     if (field === 'leadSource' && leadSourceLocked) return;
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
//   };

//   const handleInputChange = (field: keyof PropertyFormData, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
//   };

//   const handleAmenitiesToggle = (value: string) => {
//     setFormData((prev) => {
//       const already = prev.amenities.map(String).includes(String(value));
//       return { ...prev, amenities: already ? prev.amenities.filter((v) => String(v) !== String(value)) : [...prev.amenities.map(String), String(value)] };
//     });
//   };

//   const handleFurnishingItemsToggle = (value: string) => {
//     setFormData((prev) => {
//       const already = prev.furnishingItems.map(String).includes(String(value));
//       return { ...prev, furnishingItems: already ? prev.furnishingItems.filter((v) => String(v) !== String(value)) : [...prev.furnishingItems.map(String), String(value)] };
//     });
//   };

//   const addNearbyPlace = () => {
//     const { name, distance, unit, type } = nearbyPlaceForm;
//     if (!name || !distance || !unit || !type) return;
//     const placeName = getLabelFromValue(masterOptions['place name'] || [], name) || name;
//     const placeType = getLabelFromValue(masterOptions['place type'] || [], type) || type;
//     setFormData((prev) => ({ ...prev, nearby_places: [...prev.nearby_places, { name: placeName, distance, unit, type: placeType }] }));
//     setNearbyPlaceForm({ name: '', distance: '', unit: '', type: '' });
//   };

//   const removeNearbyPlace = (idx: number) => {
//     setFormData((prev) => ({ ...prev, nearby_places: prev.nearby_places.filter((_, i) => i !== idx) }));
//   };

//   const handleOwnershipDocUpload = (file: File | null) => {
//     if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
//     if (file) {
//       setOwnershipDocPreview(createFilePreview(file));
//       setFormData((prev) => ({ ...prev, ownershipDoc: file }));
//     } else {
//       setOwnershipDocPreview(null);
//       setFormData((prev) => ({ ...prev, ownershipDoc: null }));
//     }
//   };

//   const handlePhotosUpload = (files: File[]) => {
//     const existing = photoPreviews.filter((p) => p.isExisting);
//     setPhotoPreviews([...existing, ...files.map(createFilePreview)]);
//     setFormData((prev) => ({ ...prev, photos: [...(prev.photos || []), ...files] }));
//   };

//   const removeOwnershipDoc = () => {
//     if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
//     setOwnershipDocPreview(null);
//     setFormData((prev) => ({ ...prev, ownershipDoc: null }));
//   };

//   const removePhoto = (index: number) => {
//     const next = [...photoPreviews];
//     const removed = next.splice(index, 1)[0];
//     if (removed && !removed.isExisting) cleanupPreview(removed);
//     setPhotoPreviews(next);
//     setFormData((prev) => ({ ...prev, photos: next.filter((p) => !p.isExisting && p.file).map((p) => p.file!) }));
//   };

//   const onlyDigits = (s = '') => s.replace(/\D/g, '');
//   const ensureIndiaPrefix = (s = '') => {
//     const d = onlyDigits(s);
//     if (!d) return '';
//     if (d.length === 10) return `+91${d}`;
//     if (d.startsWith('91') && d.length === 12) return `+${d}`;
//     if (d.startsWith('0') && d.length === 11) return `+91${d.slice(1)}`;
//     return s.startsWith('+') ? s : `+${d}`;
//   };

//   const handlePhoneChange = (value: string) => {
//     const normalized = value.startsWith('+') ? value : value.startsWith('91') ? `+${value}` : value.length === 10 ? `+91${value}` : value;
//     setFormData((prev) => {
//       const next = { ...prev, ownerPhone: normalized };
//       if (prev.sameAsPhone) next.ownerWhatsapp = normalized;
//       return next;
//     });
//     if (errors.ownerPhone) setErrors((prev) => ({ ...prev, ownerPhone: '' }));
//   };

//   const handleWhatsappChange = (value: string) => {
//     const normalized = value.startsWith('+') ? value : value.startsWith('91') ? `+${value}` : value.length === 10 ? `+91${value}` : value;
//     setFormData((prev) => ({ ...prev, ownerWhatsapp: normalized }));
//     if (errors.ownerWhatsapp) setErrors((prev) => ({ ...prev, ownerWhatsapp: '' }));
//   };

//   const handlePhoneBlur = (field: 'ownerPhone' | 'ownerWhatsapp') => {
//     setFormData((prev) => {
//       const normalized = ensureIndiaPrefix(prev[field] || '');
//       if (field === 'ownerPhone' && prev.sameAsPhone) return { ...prev, ownerPhone: normalized, ownerWhatsapp: normalized };
//       return { ...prev, [field]: normalized };
//     });
//   };

//   const validatePhoneFields = (requireWhatsapp = false) => {
//     const errs: Record<string, string> = {};
//     if (!formData.ownerPhone || onlyDigits(formData.ownerPhone).length < 10) errs.ownerPhone = 'Please enter a valid phone number';
//     if (requireWhatsapp && (!formData.ownerWhatsapp || onlyDigits(formData.ownerWhatsapp).length < 10)) errs.ownerWhatsapp = 'Please enter a valid WhatsApp number';
//     setErrors((prev) => ({ ...prev, ...errs }));
//     return Object.keys(errs).length === 0;
//   };

//   const validateForm = () => {
//     const e: Record<string, string> = {};
//     if (!formData.ownerName) e.ownerName = 'Owner name is required';
//     if (!formData.ownerPhone) e.ownerPhone = 'Owner phone is required';
//     if (!formData.ownerEmail) e.ownerEmail = 'Owner email is required';
//     if (!formData.propertyType) e.propertyType = 'Property type is required';
//     if (!formData.propertySubtype) e.propertySubtype = 'Property subtype is required';
//     if (!formData.city) e.city = 'City is required';
//     if (!formData.location) e.location = 'Location is required';
//     if (!formData.society) e.society = 'Society is required';
//     if (!formData.carpetArea) e.carpetArea = 'Carpet area is required';
//     if (!formData.budget) e.budget = 'Budget is required';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   /* ── seller / payload helpers (unchanged) ── */
//   const createSellerSafe = async (payload: { salutation?: string; name: string; email?: string; phone?: string; whatsapp?: string }) => {
//     try {
//       if ((sellerAPI as any)?.createSeller) return await (sellerAPI as any).createSeller(payload);
//       if ((sellerAPI as any)?.create) return await (sellerAPI as any).create(payload);
//       if ((propertiesAPI as any)?.createSeller) return await (propertiesAPI as any).createSeller(payload);
//       const res = await fetch('/api/sellers', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
//       if (!res.ok) { const t = await res.text(); throw new Error(`HTTP ${res.status}: ${t || res.statusText}`); }
//       return await res.json();
//     } catch (err: any) {
//       if (err.name === 'TypeError' && err.message.includes('fetch')) throw new Error('Network error: Unable to connect to seller API');
//       if (err.response) throw new Error(`API Error: ${err.response.data?.message || err.response.statusText || 'Unknown API error'}`);
//       throw new Error(err.message || 'Unknown error creating seller');
//     }
//   };

//   const extractIdFromResponse = (obj: any): string | null => {
//     if (!obj) return null;
//     for (const id of [obj.id, obj._id, obj.seller_id, obj.sellerId, obj.data?.id, obj.data?._id, obj.result?.id, obj.result?._id]) {
//       if (id !== null && id !== undefined) return String(id);
//     }
//     return null;
//   };

//   const buildPayload = (): FormData => {
//     const fd = new FormData();
//     const textFields: (keyof PropertyFormData)[] = [
//       'salutation', 'ownerName', 'ownerPhone', 'ownerWhatsapp', 'ownerEmail', 'ownerType',
//       'seller', 'propertyType', 'propertySubtype', 'unitType', 'wing', 'unitNo',
//       'furnishing', 'parkingType', 'parkingQty', 'city', 'location', 'society',
//       'floor', 'totalFloors', 'carpetArea', 'builtupArea', 'budget', 'address',
//       'status', 'leadSource', 'possessionMonth', 'possessionYear',
//       'purchaseMonth', 'purchaseYear', 'sellingRights', 'description',
//       'bedrooms', 'bathrooms', 'facing', 'priceType', 'finalPrice',
//     ];
//     textFields.forEach((k) => fd.append(k, String((formData as any)[k] ?? '')));
//     const societyLabel = getLabelFromValue(masterOptions['society'] || [], formData.society);
//     fd.append('society_name', societyLabel || formData.society || '');
//     fd.append('sameAsPhone', String(formData.sameAsPhone ?? true));
//     fd.append('amenities', JSON.stringify(formData.amenities || []));
//     fd.append('furnishingItems', JSON.stringify(formData.furnishingItems || []));
//     fd.append('nearby_places', JSON.stringify(formData.nearby_places || []));
//     if (mode === 'edit') {
//       fd.append('existingPhotoUrls', JSON.stringify(photoPreviews.filter((p) => p.isExisting).map((p) => p.url)));
//       if (ownershipDocPreview?.isExisting) fd.append('existingOwnershipDocUrl', ownershipDocPreview.url);
//     }
//     if (formData.ownershipDoc) fd.append('ownershipDoc', formData.ownershipDoc, formData.ownershipDoc.name);
//     (formData.photos || []).forEach((file) => { if (file) fd.append('photos', file, file.name); });
//     return fd;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) { setStep(2); return; }
//     if (!validatePhoneFields()) return;
//     try {
//       setLoading(true);
//       setErrorBanner(null);
//       let result: any;
//       if (mode === 'edit' && propertyId) {
//         result = await propertiesAPI.updateProperty(String(propertyId), buildPayload());
//         toast.success('Property updated successfully');
//       } else {
//         let sellerId: string | null = null;
//         let sellerName = '';
//         const hasSellerInfo = formData.ownerName?.trim() && (formData.ownerEmail || formData.ownerPhone);
//         if (hasSellerInfo) {
//           try {
//             const sellerRes = await createSellerSafe({ salutation: formData.salutation, name: formData.ownerName, email: formData.ownerEmail, phone: formData.ownerPhone, whatsapp: formData.ownerWhatsapp });
//             sellerId = extractIdFromResponse(sellerRes);
//             sellerName = `${formData.salutation ? formData.salutation + ' ' : ''}${formData.ownerName}`.trim();
//           } catch (sellerErr: any) {
//             toast.error('Failed to create seller: ' + (sellerErr.message || 'unknown'));
//             setLoading(false);
//             return;
//           }
//         }
//         const payload = buildPayload();
//         if (sellerId) { payload.append('seller_id', String(sellerId)); payload.append('seller_name', sellerName); }
//         try {
//           result = await propertiesAPI.createProperty(payload);
//           if (sellerId) result = { ...result, seller_id: sellerId, seller_name: sellerName };
//         } catch (propertyErr: any) {
//           const msg = propertyErr?.response?.data?.message || propertyErr?.message || 'Failed to create property';
//           setErrorBanner(msg);
//           toast.error(msg);
//           return;
//         }
//       }
//       setShowThankYou(true);
//       if (typeof onSubmit === 'function') { try { onSubmit(result); } catch (err) { console.error('onSubmit handler threw:', err); } }
//     } catch (e: any) {
//       const msg = e?.response?.data?.message || e?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} property`;
//       setErrorBanner(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     if (!isOpen) {
//       setShowThankYou(false);
//       setFormData({
//         salutation: 'Mr',
//         ownerName: '',
//         ownerPhone: '',
//         ownerWhatsapp: '',
//         sameAsPhone: false,
//         ownerEmail: '',
//         ownerType: 'individual',
//         seller: '',
//         propertyType: '',
//         propertySubtype: '',
//         unitType: '',
//         wing: '',
//         unitNo: '',
//         furnishing: '',
//         parkingType: '',
//         parkingQty: '',
//         city: '',
//         location: '',
//         society: '',
//         floor: '',
//         totalFloors: '',
//         carpetArea: '',
//         builtupArea: '',
//         budget: '',
//         address: '',
//         status: '',
//         leadSource: '',
//         possessionMonth: String(CURRENT_MONTH),
//         possessionYear: String(CURRENT_YEAR),
//         purchaseMonth: String(CURRENT_MONTH),
//         purchaseYear: String(CURRENT_YEAR),
//         sellingRights: 'Standard',
//         amenities: [],
//         furnishingItems: [],
//         description: '',
//         nearby_places: [],
//         ownershipDoc: null,
//         photos: [],
//         bedrooms: '',
//         bathrooms: '',
//         facing: '',
//         priceType: '',
//         finalPrice: '',
//       })
//     }
//   }, [isOpen])

//   const getOptions = (key: string): MasterOption[] => {
//     if (!key) return [];
//     const k = key.toLowerCase().trim();
//     if (masterOptions[key]) return masterOptions[key];
//     if (masterOptions[k]) return masterOptions[k];
//     for (const mk in masterOptions) {
//       if (!Array.isArray(masterOptions[mk])) continue;
//       if (mk.toLowerCase().includes(k)) return masterOptions[mk];
//     }
//     return [];
//   };

//   const modalTitle = mode === 'edit' ? 'Edit Property' : step === 1 ? 'Owner Details' : 'Sell Your Property';
//   const SubmitIcon = mode === 'edit' ? Edit : Plus;

//   if (!isOpen) return null;



//   /* ─────────────────────────────────────────────────────────────
//      STEP 1 — Owner Details
//   ───────────────────────────────────────────────────────────── */
//   const ownerInitials = formData.ownerName
//     ? formData.ownerName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
//     : '?';

//   const OwnerStep = (
//     <div className="space-y-4">
//       {/* Header row */}
//       <div className="w-full">


//         {/* Header Row */}
//         <div className="flex items-center gap-3 -mt-4">

//           {/* Title */}
//           <h3 className="text-sm sm:text-base font-semibold text-[#E6761D] tracking-wide uppercase whitespace-nowrap">
//             Owner Information
//           </h3>
//           {/* 🔥 Line beside text */}
//           <div className="flex-1 h-[1px] bg-orange-300"></div>


//         </div>
//       </div>



//       {/* Salutation + Name + Email */}
//       <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
//         <div className="sm:col-span-2">
//           <Field label="Salutation">
//             <select
//               name="salutation"
//               value={formData.salutation || ''}
//               onChange={handleEventChange}
//               className={INP}
//             >
//               <option value="">—</option>
//               <option value="Mr">Mr</option>
//               <option value="Ms">Ms</option>
//               <option value="Mrs">Mrs</option>
//               <option value="Dr">Dr</option>
//               <option value="Mx">Mx</option>
//             </select>
//           </Field>
//         </div>

//         <div className="sm:col-span-5">
//           <Field label="Full Name" required error={errors.ownerName}>
//             <input
//               type="text"
//               name="ownerName"
//               value={formData.ownerName || ''}
//               onChange={(e) => {
//                 const value = e.target.value.replace(/[0-9]/g, '');
//                 handleEventChange({ target: { name: 'ownerName', value } } as any);
//               }}
//               placeholder="Enter your full name"
//               className={`${INP} ${errors.ownerName ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
//             />
//           </Field>
//         </div>

//         <div className="sm:col-span-5">
//           <Field label="Email Address" required error={errors.ownerEmail}>
//             <input
//               type="email"
//               name="ownerEmail"
//               value={formData.ownerEmail || ''}
//               onChange={handleEventChange}
//               placeholder="your.email@example.com"
//               className={`${INP} ${errors.ownerEmail ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
//             />
//           </Field>
//         </div>
//       </div>

//       {/* Phone + WhatsApp */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div>
//           <label className={LBL}>Phone Number <span className="text-red-400 normal-case tracking-normal">*</span></label>
//           <PhoneInput
//             country={'in'}
//             value={formData.ownerPhone || ''}
//             onChange={(v: any) => handlePhoneChange(String(v || ''))}
//             onBlur={() => handlePhoneBlur('ownerPhone')}
//             inputClass={`!w-full !h-9 !rounded-lg !border-gray-200 !text-sm !bg-white focus:!ring-2 focus:!ring-orange-200 focus:!border-orange-400 ${errors.ownerPhone ? '!border-red-400' : ''}`}
//             containerClass="!w-full"
//             inputProps={{ name: 'ownerPhone', required: true, autoFocus: false }}
//           />
//           {errors.ownerPhone && <p className="text-red-400 text-[11px] mt-1">{errors.ownerPhone}</p>}
//         </div>

//         <div>
//           {/* WhatsApp label with toggle */}
//           <div className="flex items-center justify-between mb-1.5">
//             <label className={`${LBL} mb-0 flex items-center gap-1.5`}>
//               <FaWhatsapp className="text-green-500 text-sm" />
//               WhatsApp Number
//             </label>
//             {/* Toggle */}
//             <label className="flex items-center gap-2 cursor-pointer">
//               <div className="relative">
//                 <input
//                   type="checkbox"
//                   checked={formData.sameAsPhone}
//                   onChange={(e) => {
//                     const checked = e.target.checked;
//                     setFormData((prev) => ({ ...prev, sameAsPhone: checked, ownerWhatsapp: checked ? prev.ownerPhone : prev.ownerWhatsapp }));
//                     if (checked && errors.ownerWhatsapp) setErrors((prev) => ({ ...prev, ownerWhatsapp: '' }));
//                   }}
//                   className="sr-only"
//                 />
//                 <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${formData.sameAsPhone ? 'bg-[#E6761D]' : 'bg-gray-200'}`} />
//                 <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${formData.sameAsPhone ? 'translate-x-4' : 'translate-x-0'}`} />
//               </div>
//               <span className="text-[11px] text-gray-500">{formData.sameAsPhone ? 'Same as phone' : 'Different'}</span>
//             </label>
//           </div>
//           <input
//             type="tel"
//             name="ownerWhatsapp"
//             value={formData.sameAsPhone ? formData.ownerPhone || '' : formData.ownerWhatsapp || ''}
//             onChange={(e) => handleWhatsappChange(e.target.value)}
//             onBlur={() => handlePhoneBlur('ownerWhatsapp')}
//             disabled={formData.sameAsPhone}
//             placeholder="WhatsApp number (optional)"
//             maxLength={15}
//             className={`${INP} ${formData.sameAsPhone ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
//           />
//           {errors.ownerWhatsapp && <p className="text-red-400 text-[11px] mt-1">{errors.ownerWhatsapp}</p>}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between pt-2 border-t-2 border-gray-100">        <button
//         type="button"
//         onClick={() => { try { onClose(); } catch { } }}
//         className="h-8 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
//       >
//         Cancel
//       </button>
//         <button
//           type="button"
//           onClick={() => {
//             const step1Errors: Record<string, string> = {};
//             if (!formData.ownerName) step1Errors.ownerName = 'Owner name is required';
//             if (!formData.ownerEmail) step1Errors.ownerEmail = 'Owner email is required';
//             if (!formData.ownerPhone) step1Errors.ownerPhone = 'Owner phone is required';
//             setErrors(step1Errors);
//             if (Object.keys(step1Errors).length === 0) {
//               handlePhoneBlur('ownerPhone');
//               if (formData.sameAsPhone) handlePhoneBlur('ownerWhatsapp');
//               setStep(2);
//             }
//           }}
//           className="h-9 px-5 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-all shadow-md shadow-orange-200 hover:shadow-orange-300"
//           style={{ background: BRAND }}
//           onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
//           onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
//         >
//           Next
//           <ArrowRight size={15} />
//         </button>
//       </div>
//     </div>
//   );

//   /* ─────────────────────────────────────────────────────────────
//      TAG CHIPS  (reusable inline)
//   ───────────────────────────────────────────────────────────── */
//   const renderTagChips = (values: string[], optKey: string, onRemove: (v: string) => void) =>
//     values.length > 0 ? (
//       <div className="flex flex-wrap gap-1.5 mt-2">
//         {values.map((val) => {
//           const opt = getOptions(optKey).find((o) => String(o.value) === String(val));
//           return (
//             <span
//               key={String(val)}
//               className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
//             >
//               {opt?.label || val}
//               <button
//                 type="button"
//                 onClick={() => onRemove(String(val))}
//                 className="text-violet-400 hover:text-violet-600 leading-none"
//               >
//                 ×
//               </button>
//             </span>
//           );
//         })}
//       </div>
//     ) : null;

//   /* ─────────────────────────────────────────────────────────────
//      STEP 2 — Property Details
//   ───────────────────────────────────────────────────────────── */
//   const PropertyStep = (
//     <>




//       {/* ════════════════════════════════
//           SECTION: Property Details
//       ════════════════════════════════ */}
//       <SectionHeader >Property Details</SectionHeader>
//       <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
//         <Field label="Property Type" required error={errors.propertyType}>
//           <SafeDropdown placeholder="Select Type" options={getOptions('property type')} value={formData.propertyType} onChange={handleDropdownChange('propertyType')} className="w-full" />
//         </Field>

//         <Field label="Property Subtype" required error={errors.propertySubtype}>
//           <SafeDropdown placeholder="Select Subtype" options={getOptions('property subtype')} value={formData.propertySubtype} onChange={handleDropdownChange('propertySubtype')} className="w-full" />
//         </Field>

//         <Field label="Unit Type">
//           <SafeDropdown placeholder="Select" options={getOptions('unit type')} value={formData.unitType} onChange={handleDropdownChange('unitType')} className="w-full" />
//         </Field>

//         <Field label="Wing">
//           <input type="text" placeholder="A / B / East…" value={formData.wing} onChange={(e) => handleInputChange('wing', e.target.value)} className={INP} />
//         </Field>

//         <Field label="Unit No.">
//           <input type="text" placeholder="e.g. 304" value={formData.unitNo} onChange={(e) => handleInputChange('unitNo', e.target.value)} className={INP} />
//         </Field>

//         <Field label="Bedrooms">
//           <SafeDropdown placeholder="Select" options={getOptions('bedrooms')} value={formData.bedrooms || ''} onChange={handleDropdownChange('bedrooms')} className="w-full" />
//         </Field>

//         <Field label="Bathrooms">
//           <SafeDropdown placeholder="Select" options={getOptions('bathrooms')} value={formData.bathrooms || ''} onChange={handleDropdownChange('bathrooms')} className="w-full" />
//         </Field>

//         <Field label="Facing">
//           <SafeDropdown placeholder="Select" options={getOptions('facing')} value={formData.facing || ''} onChange={handleDropdownChange('facing')} className="w-full" />
//         </Field>

//         <Field label="Furnishing">
//           <SafeDropdown placeholder="Select" options={getOptions('furnishing')} value={formData.furnishing} onChange={handleDropdownChange('furnishing')} className="w-full" />
//         </Field>

//         <Field label="Parking Type">
//           <SafeDropdown placeholder="Select" options={getOptions('parking type')} value={formData.parkingType} onChange={handleDropdownChange('parkingType')} className="w-full" />
//         </Field>

//         <Field label="Parking Qty">
//           <SafeDropdown placeholder="Select" options={getOptions('parking qty')} value={formData.parkingQty} onChange={handleDropdownChange('parkingQty')} className="w-full" />
//         </Field>

//         <Field label="Floor">
//           <SafeDropdown placeholder="Select" options={getOptions('floor')} value={formData.floor} onChange={handleDropdownChange('floor')} className="w-full" searchable />
//         </Field>

//         <Field label="Total Floors">
//           <SafeDropdown placeholder="Select" options={getOptions('total floors')} value={formData.totalFloors} onChange={handleDropdownChange('totalFloors')} className="w-full" searchable />
//         </Field>

//         <Field label="Property Status">
//           <SafeDropdown placeholder="Select" options={getOptions('property status')} value={formData.status} onChange={handleDropdownChange('status')} className="w-full" />
//         </Field>
//       </div>

//       {/* ════════════════════════════════
//           SECTION: Location
//       ════════════════════════════════ */}
//       <SectionHeader>Location</SectionHeader>
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//         <Field label="City" required error={errors.city}>
//           <SafeDropdown placeholder="Select City" options={getOptions('city')} value={formData.city} onChange={handleDropdownChange('city')} className="w-full" searchable />
//         </Field>

//         <Field label="Location" required error={errors.location}>
//           <SafeDropdown placeholder="Select Location" options={getOptions('location')} value={formData.location} onChange={handleDropdownChange('location')} className="w-full" searchable />
//         </Field>

//         <Field label="Society Name" required error={errors.society} className="lg:col-span-2">
//           <SafeDropdown placeholder="Select Society" options={getOptions('society')} value={formData.society} onChange={handleDropdownChange('society')} className="w-full" searchable />
//         </Field>

//         <div className="col-span-2 sm:col-span-3 lg:col-span-4">
//           <Field label="Address">
//             <textarea
//               placeholder="Auto-filled from selections above — you can edit it"
//               value={formData.address}
//               onChange={(e) => handleInputChange('address', e.target.value)}
//               rows={2}
//               className={`${INP} h-auto py-2 resize-none`}
//             />
//           </Field>
//         </div>
//       </div>

//       {/* ════════════════════════════════
//           SECTION: Area & Pricing
//       ════════════════════════════════ */}
//       <SectionHeader>Area & Pricing</SectionHeader>
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//         <Field label="Carpet Area (sq.ft)" required error={errors.carpetArea}>
//           <input
//             type="text"
//             placeholder="e.g. 850"
//             value={formData.carpetArea}
//             onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('carpetArea', e.target.value); }}
//             className={`${INP} ${errors.carpetArea ? 'border-red-400' : ''}`}
//           />
//         </Field>

//         <Field label="Builtup Area (sq.ft)">
//           <input
//             type="text"
//             placeholder="e.g. 1050"
//             value={formData.builtupArea}
//             onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('builtupArea', e.target.value); }}
//             className={INP}
//           />
//         </Field>

//         <Field label="Lead Source">
//           <SafeDropdown
//             placeholder="Lead Source"
//             options={getOptions('lead source')}
//             value={formData.leadSource}
//             onChange={handleDropdownChange('leadSource')}
//             className="w-full opacity-70 cursor-not-allowed"
//             disabled={leadSourceLocked}
//           />
//           <input type="hidden" name="leadSource" value={formData.leadSource} />
//         </Field>

//         {/* Sell Price — spans wider */}
//         <div className="col-span-2 sm:col-span-3 lg:col-span-4">
//           <label className={LBL}>Sell Price (₹) <span className="text-red-400 normal-case tracking-normal">*</span></label>
//           <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
//             <PriceRangeSelector
//               initialMax={rupeesToCrores(parseBudgetToRupees(formData.budget))}
//               max={10}
//               onChange={({ max }) => {
//                 const rupeeVal = Math.round(max * 10_000_000);
//                 handleInputChange('budget', String(rupeeVal));
//                 if (formData.priceType === 'Negotiable') handleInputChange('finalPrice', String(rupeeVal));
//               }}
//               className="p-0"
//             />

//             {/* Fixed / Negotiable */}
//             <div className="flex items-center gap-5 pt-1">
//               {(['Fixed', 'Negotiable'] as const).map((type) => (
//                 <label key={type} className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     className="h-3.5 w-3.5 rounded accent-orange-500"
//                     checked={(formData.priceType) === type}
//                     onChange={(e) => handleInputChange('priceType', e.target.checked ? type : "")}
//                   />
//                   <span className={`text-sm font-medium ${(formData.priceType) === type ? 'text-gray-800' : 'text-gray-400'}`}>{type}</span>
//                 </label>
//               ))}
//             </div>

//             {/* Final Price (Negotiable only) */}
//             {formData.priceType === 'Negotiable' && (
//               <div className="pt-2 border-t border-gray-200">
//                 <label className={`${LBL} mb-2`}>Final Price (₹)</label>
//                 <div className="flex items-center gap-3">
//                   <input
//                     type="text"
//                     inputMode="numeric"
//                     className={`${INP} max-w-[200px]`}
//                     value={formData.finalPrice || ''}
//                     onChange={(e) => handleInputChange('finalPrice', e.target.value)}
//                     onBlur={(e) => { const rupees = parseBudgetToRupees(e.target.value); handleInputChange('finalPrice', String(rupees)); }}
//                     placeholder="e.g. 45,00,000"
//                   />
//                   {(() => {
//                     const v = parseBudgetToRupees(formData.finalPrice || '');
//                     if (!v || v <= 0) return null;
//                     const label = v < 10_000_000 ? `${Math.round(v / 100_000)}L` : `${(v / 10_000_000).toFixed(2)}Cr`;
//                     return <span className="text-sm font-semibold text-green-700">≈ ₹{label}</span>;
//                   })()}
//                 </div>
//               </div>
//             )}
//             {errors.budget && <p className="text-red-400 text-[11px]">{errors.budget}</p>}
//           </div>
//         </div>
//       </div>

//       {/* ════════════════════════════════
//           SECTION: Timeline & Rights
//       ════════════════════════════════ */}
//       <SectionHeader>Timeline & Selling Rights</SectionHeader>
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//         <PossessionDropdown
//           title="Purchase Month & Year"
//           possessionMonth={formData.purchaseMonth}
//           possessionYear={formData.purchaseYear}
//           onMonthChange={(m) => handleInputChange('purchaseMonth', m)}
//           onYearChange={(y) => handleInputChange('purchaseYear', y)}
//         />
//         <PossessionDropdown
//           title="Possession Month & Year"
//           possessionMonth={formData.possessionMonth}
//           possessionYear={formData.possessionYear}
//           onMonthChange={(m) => handleInputChange('possessionMonth', m)}
//           onYearChange={(y) => handleInputChange('possessionYear', y)}
//         />
//         <Field label="Selling Rights">
//           <SafeDropdown placeholder="Select" options={getOptions('selling rights')} value={formData.sellingRights} onChange={handleDropdownChange('sellingRights')} className="w-full" />
//         </Field>
//       </div>

//       {/* ════════════════════════════════
//           SECTION: Amenities & Furnishings
//       ════════════════════════════════ */}
//       <SectionHeader>Amenities & Furnishings</SectionHeader>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//         <div>
//           <MultiSelectDropdown
//             label="Amenities"
//             options={getOptions('amenities')}
//             selectedValues={formData.amenities}
//             onToggle={handleAmenitiesToggle}
//             placeholder="Select amenities…"
//           />
//           {renderTagChips(formData.amenities, 'amenities', handleAmenitiesToggle)}
//         </div>
//         <div>
//           <MultiSelectDropdown
//             label="Furnishing Items"
//             options={getOptions('furnishing items')}
//             selectedValues={formData.furnishingItems}
//             onToggle={handleFurnishingItemsToggle}
//             placeholder="Select furnishing items…"
//           />
//           {renderTagChips(formData.furnishingItems, 'furnishing items', handleFurnishingItemsToggle)}
//         </div>
//       </div>

//       {/* ════════════════════════════════
//           SECTION: Nearby Places
//       ════════════════════════════════ */}
//       <SectionHeader>Nearby Places</SectionHeader>
//       <div className="mb-6">
//         {/* Input row */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 items-end mb-3">
//           <Field label="Place Name" className="sm:col-span-1 lg:col-span-1">
//             <SafeDropdown placeholder="Select" options={getOptions('place name')} value={nearbyPlaceForm.name} onChange={(v) => setNearbyPlaceForm((p) => ({ ...p, name: v }))} className="w-full" />
//           </Field>
//           <Field label="Distance">
//             <input
//               type="text"
//               className={INP}
//               placeholder="e.g. 2"
//               value={nearbyPlaceForm.distance}
//               onChange={(e) => setNearbyPlaceForm((p) => ({ ...p, distance: e.target.value }))}
//             />
//           </Field>
//           <Field label="Unit">
//             <select
//               className={INP}
//               value={nearbyPlaceForm.unit}
//               onChange={(e) => setNearbyPlaceForm((p) => ({ ...p, unit: e.target.value }))}
//             >
//               <option value="">—</option>
//               <option value="km">km</option>
//               <option value="m">m</option>
//               <option value="min">min</option>
//             </select>
//           </Field>
//           <div className="flex items-end gap-2">
//             <Field label="Place Type" className="flex-1">
//               <SafeDropdown placeholder="Select" options={getOptions('place type')} value={nearbyPlaceForm.type} onChange={(v) => setNearbyPlaceForm((p) => ({ ...p, type: v }))} className="w-full" />
//             </Field>
//             <button
//               type="button"
//               onClick={addNearbyPlace}
//               disabled={!nearbyPlaceForm.name || !nearbyPlaceForm.distance || !nearbyPlaceForm.unit || !nearbyPlaceForm.type}
//               className="flex-shrink-0 h-9 w-9 rounded-lg text-white flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
//               style={{ background: '#16A34A' }}
//             >
//               <Plus size={16} />
//             </button>
//           </div>
//         </div>

//         {/* List */}
//         <div className="space-y-2">
//           {formData.nearby_places.length === 0 ? (
//             <div className="text-sm text-gray-400 italic py-3 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
//               No nearby places added yet
//             </div>
//           ) : (
//             formData.nearby_places.map((place, index) => (
//               <div key={index} className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
//                 <div className="text-sm">
//                   <span className="font-semibold text-blue-600">{place.name}</span>
//                   <span className="text-gray-400 mx-1.5">·</span>
//                   <span className="text-gray-500">{place.distance} {place.unit}</span>
//                   <span className="text-gray-400 mx-1.5">·</span>
//                   <span className="text-green-600 capitalize">{place.type}</span>
//                 </div>
//                 <button type="button" onClick={() => removeNearbyPlace(index)} className="text-red-400 hover:text-red-600 transition-colors">
//                   <Trash2 size={15} />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* ════════════════════════════════
//           SECTION: Documents & Photos
//       ════════════════════════════════ */}
//       <SectionHeader>Documents & Photos</SectionHeader>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
//         {/* Ownership Doc */}
//         <div>
//           <label className={LBL}>Ownership Document</label>
//           <div
//             className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-orange-300 hover:bg-orange-50/30 transition-all cursor-pointer group"
//             onClick={() => document.getElementById('ownership-doc-input')?.click()}
//           >
//             <input
//               id="ownership-doc-input"
//               type="file"
//               accept=".pdf,.jpg,.jpeg,.png"
//               className="hidden"
//               onChange={(e) => handleOwnershipDocUpload(e.target.files?.[0] || null)}
//             />
//             <Upload className="h-6 w-6 text-gray-300 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
//             <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 mb-0.5">Click to upload</p>
//             <p className="text-xs text-gray-400">PDF, JPG, PNG — up to 10 MB</p>
//           </div>
//           {ownershipDocPreview && (
//             <div className="mt-3">
//               <FilePreviewComponent preview={ownershipDocPreview} onRemove={removeOwnershipDoc} />
//             </div>
//           )}
//         </div>

//         {/* Photos */}
//         <div>
//           <label className={LBL}>Property Photos</label>
//           <div
//             className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-orange-300 hover:bg-orange-50/30 transition-all cursor-pointer group"
//             onClick={() => document.getElementById('property-photos-input')?.click()}
//           >
//             <input
//               id="property-photos-input"
//               type="file"
//               accept=".jpg,.jpeg,.png"
//               multiple
//               className="hidden"
//               onChange={(e) => { const selected = Array.from(e.target.files || []); if (selected.length > 0) handlePhotosUpload(selected); }}
//             />
//             <Upload className="h-6 w-6 text-gray-300 group-hover:text-orange-400 mx-auto mb-2 transition-colors" />
//             <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 mb-0.5">
//               {photoPreviews.length > 0 ? `${photoPreviews.length} file(s) — click to add more` : 'Click to upload photos'}
//             </p>
//             <p className="text-xs text-gray-400">JPG, PNG — up to 5 MB each</p>
//           </div>
//           {photoPreviews.length > 0 && (
//             <div className="grid grid-cols-4 gap-2 mt-3 max-h-52 overflow-y-auto">
//               {photoPreviews.map((preview, index) => (
//                 <FilePreviewComponent key={index} preview={preview} onRemove={() => removePhoto(index)} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ════════════════════════════════
//           SECTION: Description
//       ════════════════════════════════ */}
//       <SectionHeader>Description</SectionHeader>
//       <div className="mb-6">
//         <textarea
//           value={formData.description || ''}
//           onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
//           className={`${INP} h-auto py-3 resize-none`}
//           rows={4}
//           placeholder="Additional property details, special features, location highlights, etc."
//         />
//       </div>

//       {/* ── Footer Actions ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">

//         {/* MOBILE GRID */}
//         <div className="grid grid-cols-2 gap-2 w-full sm:hidden">

//           <button
//             type="button"
//             onClick={() => setStep(1)}
//             disabled={loading}
//             className="h-9 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1.5 disabled:opacity-50"
//           >
//             <ArrowLeft size={14} />
//             Back
//           </button>

//           <button
//             type="button"
//             onClick={() => setStep(1)}
//             className="h-9 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
//           >
//             Edit Owner
//           </button>

//           <button
//             type="button"
//             onClick={onClose}
//             disabled={loading}
//             className="h-9 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="h-9 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-orange-200"
//             style={{ background: loading ? '#ccc' : BRAND }}
//           >
//             {loading ? (
//               <>
//                 <span className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-white border-t-transparent" />
//                 {mode === 'edit' ? 'Updating…' : 'Submitting…'}
//               </>
//             ) : (
//               <>
//                 <SubmitIcon size={10} />
//                 {mode === 'edit' ? 'Update Property' : 'Submit Property'}
//               </>
//             )}
//           </button>
//         </div>

//         {/* DESKTOP (UNCHANGED) */}
//         <div className="hidden sm:flex items-center justify-between w-full">

//           {/* Left */}
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={() => setStep(1)}
//               disabled={loading}
//               className="h-9 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 disabled:opacity-50"
//             >
//               <ArrowLeft size={14} />
//               Back
//             </button>

//             <button
//               type="button"
//               onClick={() => setStep(1)}
//               className="h-9 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
//             >
//               Edit Owner
//             </button>
//           </div>

//           {/* Right */}
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={loading}
//               className="h-9 px-4 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
//             >
//               Cancel
//             </button>

//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={loading}
//               className="h-9 px-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-orange-200"
//               style={{ background: loading ? '#ccc' : BRAND }}
//             >
//               {loading ? (
//                 <>
//                   <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
//                   {mode === 'edit' ? 'Updating…' : 'Submitting…'}
//                 </>
//               ) : (
//                 <>
//                   <SubmitIcon size={14} />
//                   {mode === 'edit' ? 'Update Property' : 'Submit Property'}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//       </div>
//     </>
//   );


//   /* ─────────────────────────────────────────────────────────────
//      RENDER
//   ───────────────────────────────────────────────────────────── */
//   return (
//     <>
//       <Modal
//         isOpen={isOpen}
//         onClose={onClose}
//         title={
//           <div className="p-1 relative">
//             {/* Top Row */}
//             <div className="flex items-start justify-between gap-3">

//               {/* Left */}
//               <div>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <h2 className="text-base sm:text-lg font-semibold text-gray-800">
//                     Owner Details
//                   </h2>

//                   <span className="text-xs sm:text-sm px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
//                     Step {step} of 2
//                   </span>
//                 </div>

//                 <p className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-1">
//                   → {step === 1
//                     ? "Provide owner contact details"
//                     : "Owner Information · Property details"}
//                 </p>
//               </div>

//               {/* Right */}

//               {/* 🔥 Indicator positioned near close button */}
//               <div className="absolute top-3 right-12 flex items-center gap-1 mt-2 -mr-5">
//                 {[...Array(2)].map((_, i) => (
//                   <div
//                     key={i}
//                     className={`h-1.5 w-4 rounded-full ${i < step ? "bg-orange-500" : "bg-gray-300"
//                       }`}
//                   />
//                 ))}
//               </div>

//             </div>


//           </div>
//         }
//         width="max-w-[95vw] md:max-w-4xl lg:max-w-5xl"
//       >
//         <div className="relative px-2 py-5">
//           {/* Global loading overlay */}
//           {loading && (
//             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-xl">
//               <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mb-3" />
//               <p className="text-sm font-medium text-gray-600">{mode === 'edit' ? 'Updating property…' : 'Saving property…'}</p>
//             </div>
//           )}



//           {step === 1 ? OwnerStep : PropertyStep}
//         </div>
//       </Modal>

//       {/* ── Thank You Portal ── */}
//       {showThankYou &&
//         typeof document !== 'undefined' &&
//         createPortal(
//           <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
//             {/* Backdrop */}
//             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
//             {/* Card */}
//             <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
//               {/* Success icon */}
//               <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 shadow-md shadow-green-200">
//                 <CheckCircle2 className="text-green-500" size={32} />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
//               <p className="text-sm text-gray-500 leading-relaxed mb-6">
//                 Your property details have been{' '}
//                 <span className="font-semibold text-blue-600">submitted successfully</span>.
//                 <br />Our executive will contact you soon.
//               </p>
//               <button
//                 onClick={() => {
//                   setShowThankYou(false);
//                   try { onClose?.(); } catch { /* noop */ }
//                 }}
//                 className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all shadow-md"
//                 style={{ background: BRAND }}
//                 onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
//                 onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>,
//           document.body,
//         )}
//     </>
//   );
// };

// export default PublicSellPropertyForm;


import React, { useState, useEffect, useMemo, useRef } from 'react';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { X, Upload, Plus, FileText, Trash2, Edit, ArrowRight, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';

import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { sellerAPI } from '@/lib/sellersAPI';
import PriceRangeSelector from '@/components/ui/PriceRangeSelector';

/* ─────────────────────────────────────────────────────────────
   TYPES  (unchanged)
───────────────────────────────────────────────────────────── */
export interface NearbyPlace {
  name: string;
  distance?: string;
  type?: string;
  unit?: string;
}

interface FilePreview {
  file?: File;
  url: string;
  type: 'image' | 'document';
  isExisting?: boolean;
  name?: string;
}

interface PropertyFormData {
  salutation: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  sameAsPhone: boolean;
  ownerEmail: string;
  ownerType: string;
  seller: string;
  propertyType: string;
  propertySubtype: string;
  unitType: string;
  wing: string;
  unitNo: string;
  furnishing: string;
  parkingType: string;
  parkingQty: string;
  city: string;
  location: string;
  society: string;
  floor: string;
  totalFloors: string;
  carpetArea: string;
  builtupArea: string;
  budget: string;
  address: string;
  status: string;
  leadSource: string;
  possessionMonth: string;
  possessionYear: string;
  purchaseMonth: string;
  purchaseYear: string;
  sellingRights: string;
  amenities: string[];
  furnishingItems: string[];
  description: string;
  nearby_places: NearbyPlace[];
  ownershipDoc: File | null;
  photos: File[];
  ownershipDocUrl?: string;
  photoUrls?: string[];
  bedrooms?: string;
  bathrooms?: string;
  facing?: string;
  priceType?: 'Fixed' | 'Negotiable' | '';
  finalPrice?: string;
}

interface InitialDataFromParent {
  id?: string | number;
  salutation?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerWhatsapp?: string;
  sameAsPhone?: boolean;
  ownerEmail?: string;
  ownerType?: string;
  seller?: string;
  propertyType?: string;
  propertySubtype?: string;
  unitType?: string;
  wing?: string;
  unitNo?: string;
  furnishing?: string;
  parkingType?: string;
  parkingQty?: string;
  city?: string;
  location?: string;
  society?: string;
  floor?: string;
  totalFloors?: string;
  carpetArea?: string;
  builtupArea?: string;
  budget?: string;
  address?: string;
  status?: string;
  leadSource?: string;
  possessionMonth?: string;
  possessionYear?: string;
  purchaseMonth?: string;
  purchaseYear?: string;
  sellingRights?: string;
  amenities?: string[];
  furnishingItems?: string[];
  description?: string;
  nearby_places?: NearbyPlace[];
  existingOwnershipDocUrl?: string;
  existingOwnershipDocName?: string;
  existingOwnershipDocId?: string;
  existingPhotos?: Array<{ id: string; url: string; name?: string }>;
  bedrooms?: string;
  bathrooms?: string;
  facing?: string;
  priceType?: 'Fixed' | 'Negotiable' | '';
  finalPrice?: string;
}

interface PublicSellPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (property: any) => void;
  mode?: 'create' | 'edit';
  propertyId?: string | number;
  initialData?: InitialDataFromParent | null;
  seller?: string | null;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS  (unchanged)
───────────────────────────────────────────────────────────── */
const RUPEE_PER_CRORE = 10_000_000;
const RUPEE_PER_LAKH = 100_000;

export function parseBudgetToRupees(text?: string): number {
  const raw = (text || '').trim().toLowerCase();
  if (!raw) return 0;
  const cleaned = raw.replace(/₹/g, '').replace(/\s+/g, '');
  const digitsOnly = cleaned.replace(/,/g, '');
  if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
  const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, '')) * RUPEE_PER_LAKH) || 0;
  const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, '')) * RUPEE_PER_CRORE) || 0;
  const n = parseFloat(digitsOnly);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

export function rupeesToCrores(r: number): number {
  if (!r || r <= 0) return 0.01;
  return r / RUPEE_PER_CRORE;
}

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const BRAND = '#E6761D';
const BRAND_DARK = '#CC6A1A';
const BRAND_LIGHT = '#FEF3E8';
const BRAND_BORDER = '#F5C07A';

/* Compact h-8 inputs */
const INP =
  'w-full h-8 px-2.5 rounded-md text-xs border border-gray-200 bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] ' +
  'transition-colors placeholder:text-gray-400';

/* 10px bold uppercase label */
const LBL = 'block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1';

/* Orange-accented section divider */
const SECTION_HDR = 'flex items-center gap-2 mb-3 mt-1';

/* ─────────────────────────────────────────────────────────────
   SCROLL-PARENT HELPER  (unchanged)
───────────────────────────────────────────────────────────── */
function getScrollParents(node: Element | null): Element[] {
  const parents: Element[] = [];
  let el = node?.parentElement || null;
  while (el) {
    const style = window.getComputedStyle(el);
    const oy = style.overflowY;
    if (oy === 'auto' || oy === 'scroll' || el === document.body) parents.push(el);
    el = el.parentElement;
  }
  return parents;
}

const SafeDropdown: React.FC<any> = (props) => <Dropdown {...props} />;

/* ─────────────────────────────────────────────────────────────
   MULTI-SELECT DROPDOWN  (logic unchanged)
───────────────────────────────────────────────────────────── */
const MultiSelectDropdown: React.FC<{
  options: MasterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  label: string;
  placeholder?: string;
}> = ({ options, selectedValues, onToggle, label, placeholder = 'Select options…' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const filteredOptions = useMemo(
    () => options.filter((o) => (o.label || '').toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm],
  );

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find((opt) => String(opt.value) === String(selectedValues[0]));
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} items selected`;
  }, [selectedValues, options, placeholder]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setIsOpen(false);
      setSearchTerm('');
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen]);

  const updateRect = () => {
    if (!buttonRef.current) return setRect(null);
    setRect(buttonRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (!isOpen) return;
    updateRect();
    const onResize = () => updateRect();
    const onScroll = () => updateRect();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    const parents = getScrollParents(buttonRef.current);
    parents.forEach((p) => p.addEventListener('scroll', onScroll, true));
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      parents.forEach((p) => p.removeEventListener('scroll', onScroll, true));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev || '';
    return () => { document.body.style.overflow = prev || ''; };
  }, [isOpen]);

  const getPortalTarget = () => {
    if (typeof document === 'undefined') return null;
    return document.getElementById('modal-portal') || document.body;
  };

  const isModalPortal = typeof document !== 'undefined' && !!document.getElementById('modal-portal');
  const Z = isModalPortal ? 1050 : 9999999;

  const popupStyle: React.CSSProperties = rect
    ? { position: 'fixed', zIndex: Z, top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, minWidth: rect.width, maxHeight: '40vh', overflow: 'hidden', pointerEvents: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }
    : { position: 'fixed', zIndex: Z, top: 0, left: 0, minWidth: 200, pointerEvents: 'auto' };

  const popup = (
    <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden" style={popupStyle}>
      <div className="p-2 border-b border-gray-100">
        <input type="text" placeholder="Search…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" autoFocus />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <p className="text-xs text-gray-400 p-3 text-center">No options found</p>
        ) : (
          filteredOptions.map((option) => (
            <label key={String(option.value)} className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer transition-colors">
              <input type="checkbox" checked={selectedValues.map(String).includes(String(option.value))}
                onChange={() => onToggle(String(option.value))} className="mr-2.5 h-3.5 w-3.5 rounded border-gray-300 accent-orange-500" />
              <span className="text-xs text-gray-700">{option.label}</span>
            </label>
          ))
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="px-3 py-1.5 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-600 font-bold">{selectedValues.length} selected</div>
      )}
    </div>
  );

  const portalTarget = typeof document !== 'undefined' ? getPortalTarget() : null;

  return (
    <div className="relative">
      <label className={LBL}>{label}</label>
      <button ref={buttonRef} type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen((p) => !p); setTimeout(updateRect, 0); }}
        className={`${INP} flex items-center justify-between text-left`}>
        <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>{displayText}</span>
        <ChevronDown size={11} className="text-gray-400 flex-shrink-0 ml-1" />
      </button>
      {isOpen && buttonRef.current && portalTarget && createPortal(popup, portalTarget)}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   FILE PREVIEW  (logic unchanged)
───────────────────────────────────────────────────────────── */
const FilePreviewComponent: React.FC<{ preview: FilePreview; onRemove: () => void }> = ({ preview, onRemove }) => (
  <div className="relative group rounded-lg overflow-hidden border border-gray-200">
    {preview.type === 'image' ? (
      <>
        <img src={preview.url} alt={preview.name || preview.file?.name || 'Image'} className="w-full h-20 object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-all hover:bg-red-600"><X size={12} /></button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
          <p className="text-white text-[9px] truncate">{preview.name || preview.file?.name}</p>
        </div>
      </>
    ) : (
      <div className="bg-gray-50 p-2 h-20 flex flex-col items-center justify-center gap-1">
        <FileText className="text-orange-400" size={18} />
        <span className="text-[10px] text-gray-600 text-center truncate w-full px-1">{preview.name || preview.file?.name || 'Document'}</span>
        <button onClick={onRemove} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X size={10} /></button>
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   POSSESSION DROPDOWN  (unchanged)
───────────────────────────────────────────────────────────── */
const PossessionDropdown: React.FC<{
  possessionMonth: string; possessionYear: string;
  onMonthChange: (month: string) => void; onYearChange: (year: string) => void; title: string;
}> = ({ possessionMonth, possessionYear, onMonthChange, onYearChange, title }) => {
  const now = new Date();
  const CURRENT_YEAR = now.getFullYear();
  const CURRENT_MONTH = now.getMonth() + 1;

  const monthNames = useMemo(() =>
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);

  const currentYear = parseInt(possessionYear) || CURRENT_YEAR;
  const currentMonth = parseInt(possessionMonth) || CURRENT_MONTH;

  useEffect(() => {
    if (currentYear === CURRENT_YEAR && currentMonth > CURRENT_MONTH) onMonthChange(CURRENT_MONTH.toString());
  }, [currentYear, currentMonth, CURRENT_MONTH, CURRENT_YEAR, onMonthChange]);

  const yearOptions = Array.from({ length: 40 }, (_, i) => { const y = (CURRENT_YEAR - i).toString(); return { value: y, label: y }; });
  const monthOptions = monthNames.map((name, idx) => {
    const m = idx + 1;
    const disabled = currentYear === CURRENT_YEAR && m > CURRENT_MONTH;
    return { value: m.toString(), label: name, disabled };
  });

  return (
    <div>
      <label className={LBL}>{title}</label>
      <div className="flex gap-1.5">
        <div className="flex-1"><SafeDropdown placeholder="Year" options={yearOptions} value={possessionYear} onChange={onYearChange} className="w-full" /></div>
        <div className="flex-1"><SafeDropdown placeholder="Month" options={monthOptions.filter((o) => !o.disabled)} value={possessionMonth} onChange={onMonthChange} className="w-full" /></div>
      </div>
      {possessionMonth && possessionYear && (
        <p className="mt-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded inline-block">
          {monthNames[parseInt(possessionMonth) - 1]} {possessionYear}
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   STEP INDICATOR  (compact)
───────────────────────────────────────────────────────────── */
const StepIndicator: React.FC<{ currentStep: 1 | 2 }> = ({ currentStep }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${currentStep === 1 ? 'text-white' : 'bg-orange-100 text-orange-500'}`}
      style={currentStep === 1 ? { background: BRAND } : {}}>
      {currentStep > 1 ? <CheckCircle2 size={11} /> : '1'}
    </div>
    <div className="w-6 h-0.5 bg-gray-200 relative overflow-hidden rounded-full">
      <div className="absolute inset-y-0 left-0 bg-orange-400 transition-all duration-500" style={{ width: currentStep > 1 ? '100%' : '0%' }} />
    </div>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${currentStep === 2 ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
      style={currentStep === 2 ? { background: BRAND } : {}}>
      2
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   FIELD WRAPPER  (compact)
───────────────────────────────────────────────────────────── */
const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string }> = ({
  label, required, error, children, className = '',
}) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className={LBL}>{label}{required && <span className="text-red-400 ml-0.5 normal-case">*</span>}</label>
    {children}
    {error && <p className="text-red-400 text-[10px] leading-tight">{error}</p>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER  (compact with brand accent)
───────────────────────────────────────────────────────────── */
const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={SECTION_HDR}>
    <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ background: BRAND }} />
    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND }}>{children}</span>
    <div className="flex-1 h-px bg-orange-100" />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   ACTION BUTTON helpers
───────────────────────────────────────────────────────────── */
const BtnGhost: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, className = '', ...props }) => (
  <button type="button"
    className={`h-7 px-3 rounded-md text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1 ${className}`}
    {...props}>{children}</button>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const PublicSellPropertyForm: React.FC<PublicSellPropertyFormProps> = ({
  isOpen, onClose, onSubmit, mode = 'create', propertyId, initialData, seller,
}) => {
  const now = new Date();
  const CURRENT_YEAR = now.getFullYear();
  const CURRENT_MONTH = now.getMonth() + 1;

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<PropertyFormData>(() => ({
    salutation: 'Mr', ownerName: '', ownerPhone: '', ownerWhatsapp: '', sameAsPhone: false,
    ownerEmail: '', ownerType: 'individual', seller: '', propertyType: '', propertySubtype: '',
    unitType: '', wing: '', unitNo: '', furnishing: '', parkingType: '', parkingQty: '',
    city: '', location: '', society: '', floor: '', totalFloors: '', carpetArea: '',
    builtupArea: '', budget: '', address: '', status: '', leadSource: '',
    possessionMonth: String(CURRENT_MONTH), possessionYear: String(CURRENT_YEAR),
    purchaseMonth: String(CURRENT_MONTH), purchaseYear: String(CURRENT_YEAR),
    sellingRights: 'Standard', amenities: [], furnishingItems: [], description: '',
    nearby_places: [], ownershipDoc: null, photos: [],
    bedrooms: '', bathrooms: '', facing: '', priceType: '', finalPrice: '',
  }));

  const [ownershipDocPreview, setOwnershipDocPreview] = useState<FilePreview | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<FilePreview[]>([]);
  const [nearbyPlaceForm, setNearbyPlaceForm] = useState({ name: '', distance: '', unit: '', type: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState<Record<string, MasterOption[]>>({});
  const [leadSourceLocked, setLeadSourceLocked] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState(false);

  /* ─── helpers ─── */
  const getLabelFromValue = (options: MasterOption[] = [], value: string) => {
    if (!value || !options?.length) return '';
    return (
      options.find((o) => String(o.value) === String(value))?.label ||
      options.find((o) => String(o.value).toLowerCase() === String(value).toLowerCase())?.label ||
      options.find((o) => String(o.label).toLowerCase() === String(value).toLowerCase())?.label ||
      ''
    );
  };

  const createFilePreview = (file: File): FilePreview => ({
    file, url: URL.createObjectURL(file),
    type: file.type.startsWith('image/') ? 'image' : 'document', isExisting: false,
  });

  const createExistingFilePreview = (url: string, name: string): FilePreview => ({
    url, type: /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? 'image' : 'document', isExisting: true, name,
  });

  const cleanupPreview = (p: FilePreview) => { if (!p.isExisting && p.url) URL.revokeObjectURL(p.url); };

  const cleanupAllPreviews = () => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    photoPreviews.forEach((p) => { if (!p.isExisting) cleanupPreview(p); });
  };

  const normalizeMasterData = (raw: any): Record<string, MasterOption[]> => {
    const out: Record<string, MasterOption[]> = {};
    if (!raw) return out;
    const walk = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach((k) => {
        const val = obj[k];
        const key = (k || '').toLowerCase().trim();
        if (Array.isArray(val)) out[key] = val;
        else if (val && typeof val === 'object') {
          Object.keys(val).forEach((inner) => { const iv = val[inner]; if (Array.isArray(iv)) out[(inner || '').toLowerCase().trim()] = iv; });
        }
      });
    };
    walk(raw);
    if (Object.keys(out).length === 0) {
      try { Object.keys(raw).forEach((k) => { const v = raw[k]; if (Array.isArray(v)) out[k.toLowerCase().trim()] = v; }); }
      catch { /* noop */ }
    }
    return out;
  };

  const fetchMasterData = async () => {
    try {
      const data = await getMasterDropdownOptions(['lead', 'common', 'property']);
      const normalized = normalizeMasterData(data);
      setMasterOptions(normalized);
      const leadOpts: MasterOption[] = normalized['lead source'] || normalized['lead'] || [];
      const websiteOpt = leadOpts.find((o) => (o.label && String(o.label).toLowerCase() === 'website') || String(o.value).toLowerCase() === 'website');
      setFormData((prev) => ({ ...prev, leadSource: websiteOpt ? String(websiteOpt.value) : 'Website' }));
      setLeadSourceLocked(true);
    } catch (err: any) {
      setErrorBanner(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setErrorBanner(null);
    setErrors({});
    fetchMasterData();

    if (mode === 'edit' && initialData) {
      const seed: PropertyFormData = {
        salutation: initialData.salutation || 'Mr', ownerName: initialData.ownerName || '',
        ownerPhone: initialData.ownerPhone || '', ownerWhatsapp: initialData.ownerWhatsapp || '',
        sameAsPhone: initialData.sameAsPhone ?? false, ownerEmail: initialData.ownerEmail || '',
        ownerType: initialData.ownerType || 'individual', seller: initialData.seller || '',
        propertyType: initialData.propertyType || '', propertySubtype: initialData.propertySubtype || '',
        unitType: initialData.unitType || '', wing: initialData.wing || '', unitNo: initialData.unitNo || '',
        furnishing: initialData.furnishing || '', parkingType: initialData.parkingType || '',
        parkingQty: initialData.parkingQty || '', city: initialData.city || '',
        location: initialData.location || '', society: initialData.society || '',
        floor: initialData.floor || '', totalFloors: initialData.totalFloors || '',
        carpetArea: initialData.carpetArea || '', builtupArea: initialData.builtupArea || '',
        budget: initialData.budget || '', address: initialData.address || '',
        status: initialData.status || '', leadSource: initialData.leadSource || '',
        possessionMonth: initialData.possessionMonth || String(CURRENT_MONTH),
        possessionYear: initialData.possessionYear || String(CURRENT_YEAR),
        purchaseMonth: initialData.purchaseMonth || String(CURRENT_MONTH),
        purchaseYear: initialData.purchaseYear || String(CURRENT_YEAR),
        sellingRights: initialData.sellingRights || 'Standard',
        amenities: (initialData.amenities || []).map(String),
        furnishingItems: (initialData.furnishingItems || []).map(String),
        description: initialData.description || '', nearby_places: initialData.nearby_places || [],
        ownershipDoc: null, photos: [],
        ownershipDocUrl: initialData.existingOwnershipDocUrl,
        photoUrls: (initialData.existingPhotos || []).map((p) => p.url),
        bedrooms: initialData.bedrooms || '', bathrooms: initialData.bathrooms || '',
        facing: initialData.facing || '',
        priceType: (initialData.priceType as 'Fixed' | 'Negotiable') || '',
        finalPrice: initialData.finalPrice || '',
      };
      setFormData(seed);
      if (initialData.existingOwnershipDocUrl) {
        setOwnershipDocPreview(createExistingFilePreview(initialData.existingOwnershipDocUrl, initialData.existingOwnershipDocName || 'Ownership Document'));
      } else { setOwnershipDocPreview(null); }
      setPhotoPreviews((initialData.existingPhotos || []).map((p) => createExistingFilePreview(p.url, p.name || 'Photo')));
    } else {
      setFormData((prev) => ({
        ...prev, possessionMonth: String(CURRENT_MONTH), possessionYear: String(CURRENT_YEAR),
        purchaseMonth: String(CURRENT_MONTH), purchaseYear: String(CURRENT_YEAR),
        sellingRights: 'Standard', sameAsPhone: false,
      }));
      setOwnershipDocPreview(null);
      setPhotoPreviews([]);
    }
    setStep(1);
    return () => { cleanupAllPreviews(); setOwnershipDocPreview(null); setPhotoPreviews([]); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialData]);

  const generateAddress = () => {
    const parts: string[] = [];
    if (formData.wing?.trim()) parts.push(`Wing ${formData.wing.trim()}`);
    if (formData.unitNo?.trim()) parts.push(`Unit No ${formData.unitNo.trim()}`);
    if (formData.society && masterOptions['society']) { const l = getLabelFromValue(masterOptions['society'], formData.society); if (l) parts.push(l); }
    if (formData.floor && masterOptions['floor']) { const fl = getLabelFromValue(masterOptions['floor'], formData.floor); if (fl) parts.push(fl.toLowerCase().includes('floor') ? fl : `${fl} Floor`); }
    if (formData.location && masterOptions['location']) { const loc = getLabelFromValue(masterOptions['location'], formData.location); if (loc) parts.push(loc); }
    if (formData.city && masterOptions['city']) { const c = getLabelFromValue(masterOptions['city'], formData.city); if (c) parts.push(c); }
    return parts.join(', ');
  };

  useEffect(() => {
    if (!isOpen || mode !== 'create' || Object.keys(masterOptions).length === 0) return;
    const addr = generateAddress();
    if (addr) setFormData((prev) => ({ ...prev, address: addr }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, formData.wing, formData.unitNo, formData.society, formData.floor, formData.location, formData.city, masterOptions]);

  useEffect(() => {
    if (!isOpen || mode !== 'create') return;
    const autop = `${formData.salutation || ''} ${formData.ownerName || ''}`.trim();
    setFormData((prev) => ({ ...prev, seller: autop }));
  }, [formData.salutation, formData.ownerName, isOpen, mode]);

  /* ─── event handlers (all unchanged) ─── */
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => {
      const next: any = { ...prev, [name]: val };
      if (name === 'sameAsPhone' && val === true) next.ownerWhatsapp = next.ownerPhone;
      if (name === 'ownerPhone' && prev.sameAsPhone) next.ownerWhatsapp = value;
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDropdownChange = (field: keyof PropertyFormData) => (value: string) => {
    if (field === 'leadSource' && leadSourceLocked) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field as string]: '' }));
  };

  const handleAmenitiesToggle = (value: string) => {
    setFormData((prev) => {
      const already = prev.amenities.map(String).includes(String(value));
      return { ...prev, amenities: already ? prev.amenities.filter((v) => String(v) !== String(value)) : [...prev.amenities.map(String), String(value)] };
    });
  };

  const handleFurnishingItemsToggle = (value: string) => {
    setFormData((prev) => {
      const already = prev.furnishingItems.map(String).includes(String(value));
      return { ...prev, furnishingItems: already ? prev.furnishingItems.filter((v) => String(v) !== String(value)) : [...prev.furnishingItems.map(String), String(value)] };
    });
  };

  const addNearbyPlace = () => {
    const { name, distance, unit, type } = nearbyPlaceForm;
    if (!name || !distance || !unit || !type) return;
    const placeName = getLabelFromValue(masterOptions['place name'] || [], name) || name;
    const placeType = getLabelFromValue(masterOptions['place type'] || [], type) || type;
    setFormData((prev) => ({ ...prev, nearby_places: [...prev.nearby_places, { name: placeName, distance, unit, type: placeType }] }));
    setNearbyPlaceForm({ name: '', distance: '', unit: '', type: '' });
  };

  const removeNearbyPlace = (idx: number) => {
    setFormData((prev) => ({ ...prev, nearby_places: prev.nearby_places.filter((_, i) => i !== idx) }));
  };

  const handleOwnershipDocUpload = (file: File | null) => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    if (file) { setOwnershipDocPreview(createFilePreview(file)); setFormData((prev) => ({ ...prev, ownershipDoc: file })); }
    else { setOwnershipDocPreview(null); setFormData((prev) => ({ ...prev, ownershipDoc: null })); }
  };

  const handlePhotosUpload = (files: File[]) => {
    const existing = photoPreviews.filter((p) => p.isExisting);
    setPhotoPreviews([...existing, ...files.map(createFilePreview)]);
    setFormData((prev) => ({ ...prev, photos: [...(prev.photos || []), ...files] }));
  };

  const removeOwnershipDoc = () => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    setOwnershipDocPreview(null);
    setFormData((prev) => ({ ...prev, ownershipDoc: null }));
  };

  const removePhoto = (index: number) => {
    const next = [...photoPreviews];
    const removed = next.splice(index, 1)[0];
    if (removed && !removed.isExisting) cleanupPreview(removed);
    setPhotoPreviews(next);
    setFormData((prev) => ({ ...prev, photos: next.filter((p) => !p.isExisting && p.file).map((p) => p.file!) }));
  };

  const onlyDigits = (s = '') => s.replace(/\D/g, '');
  const ensureIndiaPrefix = (s = '') => {
    const d = onlyDigits(s);
    if (!d) return '';
    if (d.length === 10) return `+91${d}`;
    if (d.startsWith('91') && d.length === 12) return `+${d}`;
    if (d.startsWith('0') && d.length === 11) return `+91${d.slice(1)}`;
    return s.startsWith('+') ? s : `+${d}`;
  };

  const handlePhoneChange = (value: string) => {
    const normalized = value.startsWith('+') ? value : value.startsWith('91') ? `+${value}` : value.length === 10 ? `+91${value}` : value;
    setFormData((prev) => { const next = { ...prev, ownerPhone: normalized }; if (prev.sameAsPhone) next.ownerWhatsapp = normalized; return next; });
    if (errors.ownerPhone) setErrors((prev) => ({ ...prev, ownerPhone: '' }));
  };

  const handleWhatsappChange = (value: string) => {
    const normalized = value.startsWith('+') ? value : value.startsWith('91') ? `+${value}` : value.length === 10 ? `+91${value}` : value;
    setFormData((prev) => ({ ...prev, ownerWhatsapp: normalized }));
    if (errors.ownerWhatsapp) setErrors((prev) => ({ ...prev, ownerWhatsapp: '' }));
  };

  const handlePhoneBlur = (field: 'ownerPhone' | 'ownerWhatsapp') => {
    setFormData((prev) => {
      const normalized = ensureIndiaPrefix(prev[field] || '');
      if (field === 'ownerPhone' && prev.sameAsPhone) return { ...prev, ownerPhone: normalized, ownerWhatsapp: normalized };
      return { ...prev, [field]: normalized };
    });
  };

  const validatePhoneFields = (requireWhatsapp = false) => {
    const errs: Record<string, string> = {};
    if (!formData.ownerPhone || onlyDigits(formData.ownerPhone).length < 10) errs.ownerPhone = 'Please enter a valid phone number';
    if (requireWhatsapp && (!formData.ownerWhatsapp || onlyDigits(formData.ownerWhatsapp).length < 10)) errs.ownerWhatsapp = 'Please enter a valid WhatsApp number';
    setErrors((prev) => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.ownerName) e.ownerName = 'Owner name is required';
    if (!formData.ownerPhone) e.ownerPhone = 'Owner phone is required';
    if (!formData.ownerEmail) e.ownerEmail = 'Owner email is required';
    if (!formData.propertyType) e.propertyType = 'Property type is required';
    if (!formData.propertySubtype) e.propertySubtype = 'Property subtype is required';
    if (!formData.city) e.city = 'City is required';
    if (!formData.location) e.location = 'Location is required';
    if (!formData.society) e.society = 'Society is required';
    if (!formData.carpetArea) e.carpetArea = 'Carpet area is required';
    if (!formData.budget) e.budget = 'Budget is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─── seller / payload helpers (unchanged) ─── */
  const createSellerSafe = async (payload: { salutation?: string; name: string; email?: string; phone?: string; whatsapp?: string }) => {
    try {
      if ((sellerAPI as any)?.createSeller) return await (sellerAPI as any).createSeller(payload);
      if ((sellerAPI as any)?.create) return await (sellerAPI as any).create(payload);
      if ((propertiesAPI as any)?.createSeller) return await (propertiesAPI as any).createSeller(payload);
      const res = await fetch('/api/sellers', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const t = await res.text(); throw new Error(`HTTP ${res.status}: ${t || res.statusText}`); }
      return await res.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) throw new Error('Network error: Unable to connect to seller API');
      if (err.response) throw new Error(`API Error: ${err.response.data?.message || err.response.statusText || 'Unknown API error'}`);
      throw new Error(err.message || 'Unknown error creating seller');
    }
  };

  const extractIdFromResponse = (obj: any): string | null => {
    if (!obj) return null;
    for (const id of [obj.id, obj._id, obj.seller_id, obj.sellerId, obj.data?.id, obj.data?._id, obj.result?.id, obj.result?._id]) {
      if (id !== null && id !== undefined) return String(id);
    }
    return null;
  };

  const buildPayload = (): FormData => {
    const fd = new FormData();
    const textFields: (keyof PropertyFormData)[] = [
      'salutation', 'ownerName', 'ownerPhone', 'ownerWhatsapp', 'ownerEmail', 'ownerType',
      'seller', 'propertyType', 'propertySubtype', 'unitType', 'wing', 'unitNo',
      'furnishing', 'parkingType', 'parkingQty', 'city', 'location', 'society',
      'floor', 'totalFloors', 'carpetArea', 'builtupArea', 'budget', 'address',
      'status', 'leadSource', 'possessionMonth', 'possessionYear',
      'purchaseMonth', 'purchaseYear', 'sellingRights', 'description',
      'bedrooms', 'bathrooms', 'facing', 'priceType', 'finalPrice',
    ];
    textFields.forEach((k) => fd.append(k, String((formData as any)[k] ?? '')));
    const societyLabel = getLabelFromValue(masterOptions['society'] || [], formData.society);
    fd.append('society_name', societyLabel || formData.society || '');
    fd.append('sameAsPhone', String(formData.sameAsPhone ?? true));
    fd.append('amenities', JSON.stringify(formData.amenities || []));
    fd.append('furnishingItems', JSON.stringify(formData.furnishingItems || []));
    fd.append('nearby_places', JSON.stringify(formData.nearby_places || []));
    if (mode === 'edit') {
      fd.append('existingPhotoUrls', JSON.stringify(photoPreviews.filter((p) => p.isExisting).map((p) => p.url)));
      if (ownershipDocPreview?.isExisting) fd.append('existingOwnershipDocUrl', ownershipDocPreview.url);
    }
    if (formData.ownershipDoc) fd.append('ownershipDoc', formData.ownershipDoc, formData.ownershipDoc.name);
    (formData.photos || []).forEach((file) => { if (file) fd.append('photos', file, file.name); });
    return fd;
  };

  const handleSubmit = async () => {
    if (!validateForm()) { setStep(2); return; }
    if (!validatePhoneFields()) return;
    try {
      setLoading(true);
      setErrorBanner(null);
      let result: any;
      if (mode === 'edit' && propertyId) {
        result = await propertiesAPI.updateProperty(String(propertyId), buildPayload());
        toast.success('Property updated successfully');
      } else {
        let sellerId: string | null = null;
        let sellerName = '';
        const hasSellerInfo = formData.ownerName?.trim() && (formData.ownerEmail || formData.ownerPhone);
        if (hasSellerInfo) {
          try {
            const sellerRes = await createSellerSafe({ salutation: formData.salutation, name: formData.ownerName, email: formData.ownerEmail, phone: formData.ownerPhone, whatsapp: formData.ownerWhatsapp });
            sellerId = extractIdFromResponse(sellerRes);
            sellerName = `${formData.salutation ? formData.salutation + ' ' : ''}${formData.ownerName}`.trim();
          } catch (sellerErr: any) { toast.error('Failed to create seller: ' + (sellerErr.message || 'unknown')); setLoading(false); return; }
        }
        const payload = buildPayload();
        if (sellerId) { payload.append('seller_id', String(sellerId)); payload.append('seller_name', sellerName); }
        try {
          result = await propertiesAPI.createProperty(payload);
          if (sellerId) result = { ...result, seller_id: sellerId, seller_name: sellerName };
        } catch (propertyErr: any) {
          const msg = propertyErr?.response?.data?.message || propertyErr?.message || 'Failed to create property';
          setErrorBanner(msg); toast.error(msg); return;
        }
      }
      setShowThankYou(true);
      if (typeof onSubmit === 'function') { try { onSubmit(result); } catch (err) { console.error('onSubmit handler threw:', err); } }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} property`;
      setErrorBanner(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  /* ─── Reset on close (unchanged) ─── */
  useEffect(() => {
    if (!isOpen) {
      setShowThankYou(false);
      setFormData({
        salutation: 'Mr', ownerName: '', ownerPhone: '', ownerWhatsapp: '', sameAsPhone: false,
        ownerEmail: '', ownerType: 'individual', seller: '', propertyType: '', propertySubtype: '',
        unitType: '', wing: '', unitNo: '', furnishing: '', parkingType: '', parkingQty: '',
        city: '', location: '', society: '', floor: '', totalFloors: '', carpetArea: '',
        builtupArea: '', budget: '', address: '', status: '', leadSource: '',
        possessionMonth: String(CURRENT_MONTH), possessionYear: String(CURRENT_YEAR),
        purchaseMonth: String(CURRENT_MONTH), purchaseYear: String(CURRENT_YEAR),
        sellingRights: 'Standard', amenities: [], furnishingItems: [], description: '',
        nearby_places: [], ownershipDoc: null, photos: [],
        bedrooms: '', bathrooms: '', facing: '', priceType: '', finalPrice: '',
      });
    }
  }, [isOpen]);

  const getOptions = (key: string): MasterOption[] => {
    if (!key) return [];
    const k = key.toLowerCase().trim();
    if (masterOptions[key]) return masterOptions[key];
    if (masterOptions[k]) return masterOptions[k];
    for (const mk in masterOptions) {
      if (!Array.isArray(masterOptions[mk])) continue;
      if (mk.toLowerCase().includes(k)) return masterOptions[mk];
    }
    return [];
  };

  const SubmitIcon = mode === 'edit' ? Edit : Plus;

  if (!isOpen) return null;

  /* ─────────────────────────────────────────────────────────────
     OWNER INITIALS
  ───────────────────────────────────────────────────────────── */
  const ownerInitials = formData.ownerName
    ? formData.ownerName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  /* ─────────────────────────────────────────────────────────────
     TAG CHIPS  (compact)
  ───────────────────────────────────────────────────────────── */
  const renderTagChips = (values: string[], optKey: string, onRemove: (v: string) => void) =>
    values.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {values.map((val) => {
          const opt = getOptions(optKey).find((o) => String(o.value) === String(val));
          return (
            <span key={String(val)} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {opt?.label || val}
              <button type="button" onClick={() => onRemove(String(val))} className="text-violet-400 hover:text-violet-600 text-xs leading-none">×</button>
            </span>
          );
        })}
      </div>
    ) : null;

  /* ─────────────────────────────────────────────────────────────
     STEP 1 — Owner Details
  ───────────────────────────────────────────────────────────── */
  const OwnerStep = (
    <div className="space-y-3">
      {/* Section label */}
      <div className="flex items-center gap-2 -mt-1 mb-1">
        <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ background: BRAND }} />
        <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND }}>Owner Information</h3>
        <div className="flex-1 h-px bg-orange-100" />
      </div>

      {/* Row 1: Salutation + Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="col-span-2">
          <Field label="Title">
            <select name="salutation" value={formData.salutation || ''} onChange={handleEventChange} className={INP}>
              <option value="">—</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
              <option value="Mx">Mx</option>
            </select>
          </Field>
        </div>
        <div className="col-span-5">
          <Field label="Full Name" required error={errors.ownerName}>
            <input type="text" name="ownerName" value={formData.ownerName || ''}
              onChange={(e) => { const v = e.target.value.replace(/[0-9]/g, ''); handleEventChange({ target: { name: 'ownerName', value: v } } as any); }}
              placeholder="Enter full name"
              className={`${INP} ${errors.ownerName ? 'border-red-400 focus:border-red-400' : ''}`} />
          </Field>
        </div>
        <div className="col-span-5">
          <Field label="Email Address" required error={errors.ownerEmail}>
            <input type="email" name="ownerEmail" value={formData.ownerEmail || ''} onChange={handleEventChange}
              placeholder="you@email.com"
              className={`${INP} ${errors.ownerEmail ? 'border-red-400 focus:border-red-400' : ''}`} />
          </Field>
        </div>
      </div>

      {/* Row 2: Phone + WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className={LBL}>Phone Number <span className="text-red-400 normal-case">*</span></label>
          <PhoneInput country={'in'} value={formData.ownerPhone || ''}
            onChange={(v: any) => handlePhoneChange(String(v || ''))}
            onBlur={() => handlePhoneBlur('ownerPhone')}
            inputClass={`!w-full !h-8 !rounded-md !border-gray-200 !text-xs !bg-white focus:!ring-2 focus:!ring-orange-200 focus:!border-orange-400 ${errors.ownerPhone ? '!border-red-400' : ''}`}
            containerClass="!w-full"
            inputProps={{ name: 'ownerPhone', required: true, autoFocus: false }} />
          {errors.ownerPhone && <p className="text-red-400 text-[10px] mt-0.5">{errors.ownerPhone}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`${LBL} mb-0 flex items-center gap-1`}>
              <FaWhatsapp className="text-green-500" style={{ fontSize: 11 }} />
              WhatsApp
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={formData.sameAsPhone}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({ ...prev, sameAsPhone: checked, ownerWhatsapp: checked ? prev.ownerPhone : prev.ownerWhatsapp }));
                    if (checked && errors.ownerWhatsapp) setErrors((prev) => ({ ...prev, ownerWhatsapp: '' }));
                  }}
                  className="sr-only" />
                <div className={`w-7 h-4 rounded-full transition-colors duration-200`} style={{ background: formData.sameAsPhone ? BRAND : '#e5e7eb' }} />
                <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transition-transform duration-200 ${formData.sameAsPhone ? 'translate-x-3' : 'translate-x-0'}`} />
              </div>
              <span className="text-[10px] text-gray-500">{formData.sameAsPhone ? 'Same as phone' : 'Different'}</span>
            </label>
          </div>
          <input type="tel" name="ownerWhatsapp"
            value={formData.sameAsPhone ? formData.ownerPhone || '' : formData.ownerWhatsapp || ''}
            onChange={(e) => handleWhatsappChange(e.target.value)}
            onBlur={() => handlePhoneBlur('ownerWhatsapp')}
            disabled={formData.sameAsPhone}
            placeholder="WhatsApp (optional)" maxLength={15}
            className={`${INP} ${formData.sameAsPhone ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} />
          {errors.ownerWhatsapp && <p className="text-red-400 text-[10px] mt-0.5">{errors.ownerWhatsapp}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <BtnGhost onClick={() => { try { onClose(); } catch { } }}>Cancel</BtnGhost>
        <button type="button"
          onClick={() => {
            const step1Errors: Record<string, string> = {};
            if (!formData.ownerName) step1Errors.ownerName = 'Owner name is required';
            if (!formData.ownerEmail) step1Errors.ownerEmail = 'Owner email is required';
            if (!formData.ownerPhone) step1Errors.ownerPhone = 'Owner phone is required';
            setErrors(step1Errors);
            if (Object.keys(step1Errors).length === 0) {
              handlePhoneBlur('ownerPhone');
              if (formData.sameAsPhone) handlePhoneBlur('ownerWhatsapp');
              setStep(2);
            }
          }}
          className="h-7 px-4 rounded-md text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-sm"
          style={{ background: BRAND }}
          onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}>
          Next <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     OWNER SUMMARY STRIP (top of Step 2)
  ───────────────────────────────────────────────────────────── */
  const OwnerSummaryStrip = (
    <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg border"
      style={{ background: BRAND_LIGHT, borderColor: BRAND_BORDER }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
        style={{ background: BRAND }}>{ownerInitials}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate leading-tight">{`${formData.salutation || ''} ${formData.ownerName || ''}`.trim() || '—'}</p>
        <p className="text-[10px] text-gray-500 truncate leading-tight">
          {[formData.ownerEmail, formData.ownerPhone].filter(Boolean).join(' · ')}
          {formData.sameAsPhone
            ? <span className="ml-1.5 text-green-600 font-semibold">WA same</span>
            : formData.ownerWhatsapp
              ? <span className="ml-1.5 text-gray-400">WA: {formData.ownerWhatsapp}</span>
              : null}
        </p>
      </div>
      <button type="button" onClick={() => setStep(1)}
        className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border transition-colors"
        style={{ color: BRAND, borderColor: BRAND_BORDER, background: '#fff' }}>
        <Edit size={9} /> Edit
      </button>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     STEP 2 — Property Details
  ───────────────────────────────────────────────────────────── */
  const PropertyStep = (
    <>
      {OwnerSummaryStrip}

      {/* ── Property Details ── */}
      <SectionHeader>Property Details</SectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        <Field label="Property Type" required error={errors.propertyType}>
          <SafeDropdown placeholder="Type" options={getOptions('property type')} value={formData.propertyType} onChange={handleDropdownChange('propertyType')} className="w-full" />
        </Field>
        <Field label="Subtype" required error={errors.propertySubtype}>
          <SafeDropdown placeholder="Subtype" options={getOptions('property subtype')} value={formData.propertySubtype} onChange={handleDropdownChange('propertySubtype')} className="w-full" />
        </Field>
        <Field label="Unit Type">
          <SafeDropdown placeholder="Unit Type" options={getOptions('unit type')} value={formData.unitType} onChange={handleDropdownChange('unitType')} className="w-full" />
        </Field>
        <Field label="Wing">
          <input type="text" placeholder="A / B…" value={formData.wing} onChange={(e) => handleInputChange('wing', e.target.value)} className={INP} />
        </Field>
        <Field label="Unit No.">
          <input type="text" placeholder="304" value={formData.unitNo} onChange={(e) => handleInputChange('unitNo', e.target.value)} className={INP} />
        </Field>
        <Field label="Bedrooms">
          <SafeDropdown placeholder="BHK" options={getOptions('bedrooms')} value={formData.bedrooms || ''} onChange={handleDropdownChange('bedrooms')} className="w-full" />
        </Field>
        <Field label="Bathrooms">
          <SafeDropdown placeholder="Baths" options={getOptions('bathrooms')} value={formData.bathrooms || ''} onChange={handleDropdownChange('bathrooms')} className="w-full" />
        </Field>
        <Field label="Facing">
          <SafeDropdown placeholder="Facing" options={getOptions('facing')} value={formData.facing || ''} onChange={handleDropdownChange('facing')} className="w-full" />
        </Field>
        <Field label="Furnishing">
          <SafeDropdown placeholder="Furnishing" options={getOptions('furnishing')} value={formData.furnishing} onChange={handleDropdownChange('furnishing')} className="w-full" />
        </Field>
        <Field label="Parking Type">
          <SafeDropdown placeholder="Parking" options={getOptions('parking type')} value={formData.parkingType} onChange={handleDropdownChange('parkingType')} className="w-full" />
        </Field>
        <Field label="Parking Qty">
          <SafeDropdown placeholder="Qty" options={getOptions('parking qty')} value={formData.parkingQty} onChange={handleDropdownChange('parkingQty')} className="w-full" />
        </Field>
        <Field label="Floor">
          <SafeDropdown placeholder="Floor" options={getOptions('floor')} value={formData.floor} onChange={handleDropdownChange('floor')} className="w-full" searchable />
        </Field>
        <Field label="Total Floors">
          <SafeDropdown placeholder="Total" options={getOptions('total floors')} value={formData.totalFloors} onChange={handleDropdownChange('totalFloors')} className="w-full" searchable />
        </Field>
        <Field label="Status">
          <SafeDropdown placeholder="Status" options={getOptions('property status')} value={formData.status} onChange={handleDropdownChange('status')} className="w-full" />
        </Field>
      </div>

      {/* ── Location ── */}
      <SectionHeader>Location</SectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Field label="City" required error={errors.city}>
          <SafeDropdown placeholder="City" options={getOptions('city')} value={formData.city} onChange={handleDropdownChange('city')} className="w-full" searchable />
        </Field>
        <Field label="Location" required error={errors.location}>
          <SafeDropdown placeholder="Location" options={getOptions('location')} value={formData.location} onChange={handleDropdownChange('location')} className="w-full" searchable />
        </Field>
        <Field label="Society" required error={errors.society} className="col-span-2">
          <SafeDropdown placeholder="Society name" options={getOptions('society')} value={formData.society} onChange={handleDropdownChange('society')} className="w-full" searchable />
        </Field>
        <div className="col-span-2 sm:col-span-4">
          <Field label="Address">
            <textarea placeholder="Auto-filled from selections — editable" value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)} rows={2}
              className={`${INP} h-auto py-1.5 resize-none`} />
          </Field>
        </div>
      </div>

      {/* ── Area & Pricing ── */}
      <SectionHeader>Area & Pricing</SectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Field label="Carpet Area (sq.ft)" required error={errors.carpetArea}>
          <input type="text" placeholder="850" value={formData.carpetArea}
            onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('carpetArea', e.target.value); }}
            className={`${INP} ${errors.carpetArea ? 'border-red-400' : ''}`} />
        </Field>
        <Field label="Builtup Area (sq.ft)">
          <input type="text" placeholder="1050" value={formData.builtupArea}
            onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('builtupArea', e.target.value); }}
            className={INP} />
        </Field>
        <Field label="Lead Source">
          <SafeDropdown placeholder="Source" options={getOptions('lead source')} value={formData.leadSource}
            onChange={handleDropdownChange('leadSource')} className="w-full opacity-60 cursor-not-allowed" disabled={leadSourceLocked} />
          <input type="hidden" name="leadSource" value={formData.leadSource} />
        </Field>

        {/* Price block — full width */}
        <div className="col-span-2 sm:col-span-4">
          <label className={LBL}>Sell Price (₹) <span className="text-red-400 normal-case">*</span></label>
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
            <PriceRangeSelector
              initialMax={rupeesToCrores(parseBudgetToRupees(formData.budget))} max={10}
              onChange={({ max }) => {
                const rupeeVal = Math.round(max * 10_000_000);
                handleInputChange('budget', String(rupeeVal));
                if (formData.priceType === 'Negotiable') handleInputChange('finalPrice', String(rupeeVal));
              }}
              className="p-0" />
            <div className="flex items-center gap-4 pt-1">
              {(['Fixed', 'Negotiable'] as const).map((type) => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="h-3 w-3 rounded accent-orange-500"
                    checked={formData.priceType === type}
                    onChange={(e) => handleInputChange('priceType', e.target.checked ? type : '')} />
                  <span className={`text-xs font-semibold ${formData.priceType === type ? 'text-gray-800' : 'text-gray-400'}`}>{type}</span>
                </label>
              ))}
            </div>
            {formData.priceType === 'Negotiable' && (
              <div className="pt-2 border-t border-gray-200">
                <label className={`${LBL} mb-1`}>Final Price (₹)</label>
                <div className="flex items-center gap-2">
                  <input type="text" inputMode="numeric" className={`${INP} max-w-[180px]`}
                    value={formData.finalPrice || ''}
                    onChange={(e) => handleInputChange('finalPrice', e.target.value)}
                    onBlur={(e) => { const r = parseBudgetToRupees(e.target.value); handleInputChange('finalPrice', String(r)); }}
                    placeholder="e.g. 45,00,000" />
                  {(() => {
                    const v = parseBudgetToRupees(formData.finalPrice || '');
                    if (!v || v <= 0) return null;
                    const lbl = v < 10_000_000 ? `${Math.round(v / 100_000)}L` : `${(v / 10_000_000).toFixed(2)}Cr`;
                    return <span className="text-xs font-bold text-green-700">≈ ₹{lbl}</span>;
                  })()}
                </div>
              </div>
            )}
            {errors.budget && <p className="text-red-400 text-[10px]">{errors.budget}</p>}
          </div>
        </div>
      </div>

      {/* ── Timeline & Rights ── */}
      <SectionHeader>Timeline & Selling Rights</SectionHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <PossessionDropdown title="Purchase Month & Year" possessionMonth={formData.purchaseMonth} possessionYear={formData.purchaseYear}
          onMonthChange={(m) => handleInputChange('purchaseMonth', m)} onYearChange={(y) => handleInputChange('purchaseYear', y)} />
        <PossessionDropdown title="Possession Month & Year" possessionMonth={formData.possessionMonth} possessionYear={formData.possessionYear}
          onMonthChange={(m) => handleInputChange('possessionMonth', m)} onYearChange={(y) => handleInputChange('possessionYear', y)} />
        <Field label="Selling Rights">
          <SafeDropdown placeholder="Rights" options={getOptions('selling rights')} value={formData.sellingRights} onChange={handleDropdownChange('sellingRights')} className="w-full" />
        </Field>
      </div>

      {/* ── Amenities & Furnishings ── */}
      <SectionHeader>Amenities & Furnishings</SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <div>
          <MultiSelectDropdown label="Amenities" options={getOptions('amenities')} selectedValues={formData.amenities} onToggle={handleAmenitiesToggle} placeholder="Select amenities…" />
          {renderTagChips(formData.amenities, 'amenities', handleAmenitiesToggle)}
        </div>
        <div>
          <MultiSelectDropdown label="Furnishing Items" options={getOptions('furnishing items')} selectedValues={formData.furnishingItems} onToggle={handleFurnishingItemsToggle} placeholder="Select items…" />
          {renderTagChips(formData.furnishingItems, 'furnishing items', handleFurnishingItemsToggle)}
        </div>
      </div>

      {/* ── Nearby Places ── */}
      <SectionHeader>Nearby Places</SectionHeader>
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end mb-2">
          <Field label="Place Name">
            <SafeDropdown placeholder="Place" options={getOptions('place name')} value={nearbyPlaceForm.name}
              onChange={(v) => setNearbyPlaceForm((p) => ({ ...p, name: v }))} className="w-full" />
          </Field>
          <Field label="Distance">
            <input type="text" className={INP} placeholder="2" value={nearbyPlaceForm.distance}
              onChange={(e) => setNearbyPlaceForm((p) => ({ ...p, distance: e.target.value }))} />
          </Field>
          <Field label="Unit">
            <select className={INP} value={nearbyPlaceForm.unit} onChange={(e) => setNearbyPlaceForm((p) => ({ ...p, unit: e.target.value }))}>
              <option value="">—</option>
              <option value="km">km</option>
              <option value="m">m</option>
              <option value="min">min</option>
            </select>
          </Field>
          <div className="flex items-end gap-1.5 col-span-2 sm:col-span-1">
            <Field label="Place Type" className="flex-1">
              <SafeDropdown placeholder="Type" options={getOptions('place type')} value={nearbyPlaceForm.type}
                onChange={(v) => setNearbyPlaceForm((p) => ({ ...p, type: v }))} className="w-full" />
            </Field>
            <button type="button" onClick={addNearbyPlace}
              disabled={!nearbyPlaceForm.name || !nearbyPlaceForm.distance || !nearbyPlaceForm.unit || !nearbyPlaceForm.type}
              className="flex-shrink-0 h-8 w-8 rounded-md text-white flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              style={{ background: '#16A34A' }}>
              <Plus size={13} />
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          {formData.nearby_places.length === 0 ? (
            <div className="text-[11px] text-gray-400 italic py-2 px-3 bg-gray-50 rounded-md border border-dashed border-gray-200 text-center">
              No nearby places added yet
            </div>
          ) : (
            formData.nearby_places.map((place, index) => (
              <div key={index} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-xs">
                  <span className="font-semibold text-blue-600">{place.name}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-gray-500">{place.distance} {place.unit}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-green-600">{place.type}</span>
                </div>
                <button type="button" onClick={() => removeNearbyPlace(index)} className="text-red-400 hover:text-red-600 transition-colors ml-2">
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Documents & Photos ── */}
      <SectionHeader>Documents & Photos</SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className={LBL}>Ownership Document</label>
          <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer group"
            onClick={() => document.getElementById('ownership-doc-input')?.click()}>
            <input id="ownership-doc-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={(e) => handleOwnershipDocUpload(e.target.files?.[0] || null)} />
            <Upload className="h-5 w-5 text-gray-300 group-hover:text-orange-400 mx-auto mb-1 transition-colors" />
            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Click to upload</p>
            <p className="text-[10px] text-gray-400">PDF, JPG, PNG — 10 MB max</p>
          </div>
          {ownershipDocPreview && (
            <div className="mt-2"><FilePreviewComponent preview={ownershipDocPreview} onRemove={removeOwnershipDoc} /></div>
          )}
        </div>

        <div>
          <label className={LBL}>Property Photos</label>
          <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer group"
            onClick={() => document.getElementById('property-photos-input')?.click()}>
            <input id="property-photos-input" type="file" accept=".jpg,.jpeg,.png" multiple className="hidden"
              onChange={(e) => { const sel = Array.from(e.target.files || []); if (sel.length > 0) handlePhotosUpload(sel); }} />
            <Upload className="h-5 w-5 text-gray-300 group-hover:text-orange-400 mx-auto mb-1 transition-colors" />
            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
              {photoPreviews.length > 0 ? `${photoPreviews.length} file(s) — add more` : 'Click to upload'}
            </p>
            <p className="text-[10px] text-gray-400">JPG, PNG — 5 MB each</p>
          </div>
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-1.5 mt-2 max-h-44 overflow-y-auto">
              {photoPreviews.map((preview, index) => (
                <FilePreviewComponent key={index} preview={preview} onRemove={() => removePhoto(index)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      <SectionHeader>Description</SectionHeader>
      <div className="mb-4">
        <textarea value={formData.description || ''}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className={`${INP} h-auto py-2 resize-none`} rows={3}
          placeholder="Additional property details, features, highlights…" />
      </div>

      {/* ── Footer ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-gray-100">
        {/* Mobile */}
        <div className="grid grid-cols-2 gap-2 w-full sm:hidden">
          <BtnGhost onClick={() => setStep(1)} disabled={loading}><ArrowLeft size={12} />Back</BtnGhost>
          <BtnGhost onClick={() => setStep(1)}>Edit Owner</BtnGhost>
          <BtnGhost onClick={onClose} disabled={loading}>Cancel</BtnGhost>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="h-7 px-3 rounded-md text-xs font-black text-white flex items-center justify-center gap-1 disabled:opacity-60 shadow-sm"
            style={{ background: loading ? '#ccc' : BRAND }}>
            {loading ? <><span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />{mode === 'edit' ? 'Updating…' : 'Submitting…'}</> : <><SubmitIcon size={11} />{mode === 'edit' ? 'Update' : 'Submit'}</>}
          </button>
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <BtnGhost onClick={() => setStep(1)} disabled={loading}><ArrowLeft size={12} />Back</BtnGhost>
            <BtnGhost onClick={() => setStep(1)}>Edit Owner</BtnGhost>
          </div>
          <div className="flex items-center gap-1.5">
            <BtnGhost onClick={onClose} disabled={loading}>Cancel</BtnGhost>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="h-7 px-4 rounded-md text-xs font-black text-white flex items-center gap-1.5 disabled:opacity-60 shadow-sm transition-all"
              style={{ background: loading ? '#ccc' : BRAND }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = BRAND_DARK; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = BRAND; }}>
              {loading
                ? <><span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />{mode === 'edit' ? 'Updating…' : 'Submitting…'}</>
                : <><SubmitIcon size={12} />{mode === 'edit' ? 'Update Property' : 'Submit Property'}</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="relative pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-gray-800">
                {step === 1 ? 'Owner Details' : 'Sell Your Property'}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: BRAND_LIGHT, color: BRAND }}>
                Step {step} of 2
              </span>
              <StepIndicator currentStep={step} />
            </div>
            <p className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
              <span style={{ color: BRAND }}>→</span>
              {step === 1 ? 'Provide owner contact details' : 'Owner Information · Property details'}
            </p>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-full overflow-hidden" style={{ marginBottom: -12 }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%', background: BRAND }} />
            </div>
          </div>
        }
        width="max-w-[95vw] md:max-w-4xl lg:max-w-5xl"
      >
        <div className="relative px-4 py-4">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-t-transparent mb-2"
                style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
              <p className="text-xs font-semibold text-gray-600">{mode === 'edit' ? 'Updating…' : 'Saving…'}</p>
            </div>
          )}

          {/* Error banner */}
          {errorBanner && (
            <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
              <X size={13} className="flex-shrink-0 mt-0.5 text-red-400" />{errorBanner}
            </div>
          )}

          {step === 1 ? OwnerStep : PropertyStep}
        </div>
      </Modal>

      {/* ── Thank You Portal ── */}
      {showThankYou && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-500" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">Thank you!</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Your property details have been{' '}
              <span className="font-bold text-blue-600">submitted successfully</span>.
              <br />Our executive will contact you soon.
            </p>
            <button
              onClick={() => { setShowThankYou(false); try { onClose?.(); } catch { /* noop */ } }}
              className="w-full h-9 rounded-xl text-sm font-bold text-white transition-all shadow-md"
              style={{ background: BRAND }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}>
              Close
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default PublicSellPropertyForm;