// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { X, Upload, Plus, FileText, Trash2, Edit, ChevronDown } from 'lucide-react';
// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
// import Modal from '@/components/ui/Modal';
// import Dropdown from '@/components/ui/Dropdown';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// import { societyAPI } from '@/lib/societyAPI';
// import { toast } from 'react-toastify';
// import PropertyDescriptionAI from './PropertyDescriptionAI';
// import PriceRangeSelector from '@/components/ui/PriceRangeSelector';
// import { createPortal } from 'react-dom';

// /* ---------- DESIGN TOKENS ---------- */
// const BRAND = '#E6761D';
// const BRAND_DARK = '#CC6A1A';
// const INP = 'w-full h-8 px-2.5 rounded-md text-xs border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-colors placeholder:text-gray-400';
// const LBL = 'block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1';
// const SECTION_HDR = 'flex items-center gap-2 mb-3 mt-1';

// /* ---------- Helper Components ---------- */
// const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string }> = ({
//   label, required, error, children, className = '',
// }) => (
//   <div className={`flex flex-col gap-0.5 ${className}`}>
//     <label className={LBL}>{label}{required && <span className="text-red-400 ml-0.5 normal-case">*</span>}</label>
//     {children}
//     {error && <p className="text-red-400 text-[10px] leading-tight">{error}</p>}
//   </div>
// );

// const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <div className={SECTION_HDR}>
//     <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ background: BRAND }} />
//     <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND }}>{children}</span>
//     <div className="flex-1 h-px bg-orange-100" />
//   </div>
// );

// const BtnGhost: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, className = '', ...props }) => (
//   <button type="button"
//     className={`h-7 px-3 rounded-md text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1 ${className}`}
//     {...props}>{children}</button>
// );

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

//   const popupStyle: any = rect
//     ? { position: 'fixed', zIndex: Z, top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, minWidth: rect.width, maxHeight: '40vh', overflow: 'hidden', pointerEvents: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }
//     : { position: 'fixed', zIndex: Z, top: 0, left: 0, minWidth: 200, pointerEvents: 'auto' };

//   const popup = (
//     <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden" style={popupStyle}>
//       <div className="p-2 border-b border-gray-100">
//         <input type="text" placeholder="Search…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400" autoFocus />
//       </div>
//       <div className="max-h-48 overflow-y-auto">
//         {filteredOptions.length === 0 ? (
//           <p className="text-xs text-gray-400 p-3 text-center">No options found</p>
//         ) : (
//           filteredOptions.map((option) => (
//             <label key={String(option.value)} className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer transition-colors">
//               <input type="checkbox" checked={selectedValues.map(String).includes(String(option.value))}
//                 onChange={() => onToggle(String(option.value))} className="mr-2.5 h-3.5 w-3.5 rounded border-gray-300 accent-orange-500" />
//               <span className="text-xs text-gray-700">{option.label}</span>
//             </label>
//           ))
//         )}
//       </div>
//       {selectedValues.length > 0 && (
//         <div className="px-3 py-1.5 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-600 font-bold">{selectedValues.length} selected</div>
//       )}
//     </div>
//   );

//   const portalTarget = typeof document !== 'undefined' ? getPortalTarget() : null;

//   return (
//     <div className="relative">
//       <label className={LBL}>{label}</label>
//       <button ref={buttonRef} type="button"
//         onClick={(e) => { e.stopPropagation(); setIsOpen((p) => !p); setTimeout(updateRect, 0); }}
//         className={`${INP} flex items-center justify-between text-left`}>
//         <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>{displayText}</span>
//         <ChevronDown size={11} className="text-gray-400 flex-shrink-0 ml-1" />
//       </button>
//       {isOpen && buttonRef.current && portalTarget && createPortal(popup, portalTarget)}
//     </div>
//   );
// };

// const FilePreviewComponent: React.FC<{ preview: any; onRemove: () => void }> = ({ preview, onRemove }) => (
//   <div className="relative group rounded-lg overflow-hidden border border-gray-200">
//     {preview.type === 'image' ? (
//       <>
//         <img src={preview.url} alt={preview.name || preview.file?.name || 'Image'} className="w-full h-20 object-cover" />
//         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
//           <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-all hover:bg-red-600"><X size={12} /></button>
//         </div>
//         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
//           <p className="text-white text-[9px] truncate">{preview.name || preview.file?.name}</p>
//         </div>
//       </>
//     ) : (
//       <div className="bg-gray-50 p-2 h-20 flex flex-col items-center justify-center gap-1">
//         <FileText className="text-orange-400" size={18} />
//         <span className="text-[10px] text-gray-600 text-center truncate w-full px-1">{preview.name || preview.file?.name || 'Document'}</span>
//         <button onClick={onRemove} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X size={10} /></button>
//       </div>
//     )}
//   </div>
// );

// const N = "#0f2b3d";
// const O = "#e67e22";
// const BD = "#e2e8f0";

// const PossessionDropdown: React.FC<{
//   possessionMonth: string; possessionYear: string;
//   onMonthChange: (month: string) => void; onYearChange: (year: string) => void; title: string;
// }> = ({ possessionMonth, possessionYear, onMonthChange, onYearChange, title }) => {
//   const now = new Date();
//   const CURRENT_YEAR = now.getFullYear();
//   const CURRENT_MONTH = now.getMonth() + 1;

//   const monthNames = useMemo(() =>
//     ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], []);

//   const currentYear = parseInt(possessionYear) || CURRENT_YEAR;
//   const currentMonth = parseInt(possessionMonth) || CURRENT_MONTH;

//   useEffect(() => {
//     if (currentYear === CURRENT_YEAR && currentMonth > CURRENT_MONTH) onMonthChange(CURRENT_MONTH.toString());
//   }, [currentYear, currentMonth, CURRENT_MONTH, CURRENT_YEAR, onMonthChange]);

//   const yearOptions = Array.from({ length: 40 }, (_, i) => { const y = (CURRENT_YEAR - i).toString(); return { value: y, label: y }; });
//   const monthOptions = monthNames.map((name, idx) => {
//     const m = idx + 1;
//     const disabled = currentYear === CURRENT_YEAR && m > CURRENT_MONTH;
//     return { value: m.toString(), label: name, disabled };
//   });

//   const SafeDropdown: React.FC<any> = (props) => <Dropdown {...props} />;

//   return (
//     <div>
//       <label className={LBL}>{title}</label>
//       <div className="flex gap-1.5">
//         <div className="flex-1"><SafeDropdown placeholder="Year" options={yearOptions} value={possessionYear} onChange={onYearChange} className="w-full" /></div>
//         <div className="flex-1"><SafeDropdown placeholder="Month" options={monthOptions.filter((o) => !o.disabled)} value={possessionMonth} onChange={onMonthChange} className="w-full" /></div>
//       </div>
//       {possessionMonth && possessionYear && (
//         <p className="mt-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded inline-block">
//           {monthNames[parseInt(possessionMonth) - 1]} {possessionYear}
//         </p>
//       )}
//     </div>
//   );
// };

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
//   balcony?: string;
//   facing?: string;
//   priceType?: 'Fixed' | 'Negotiable' | '';
//   finalPrice?: string;
// }

// interface InitialDataFromParent {
//   id?: string | number;
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
//   balcony?: string;
//   facing?: string;
//   priceType?: 'Fixed' | 'Negotiable' | '';
//   finalPrice?: string;
// }

// interface PropertyFormModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (property: any) => void;
//   mode?: 'create' | 'edit';
//   propertyId?: string | number;
//   initialData?: InitialDataFromParent | null;
// }

// const RUPEE_PER_CRORE = 10_000_000;
// const RUPEE_PER_LAKH = 100_000;

// export function parseBudgetToRupees(text?: any): number {
//   if (text === null || text === undefined) return 0;
//   const raw = String(text).trim().toLowerCase();
//   if (!raw) return 0;
//   const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
//   const digitsOnly = cleaned.replace(/,/g, "");
//   if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
//   const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
//   if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * RUPEE_PER_LAKH) || 0;
//   const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
//   if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, "")) * RUPEE_PER_CRORE) || 0;
//   const n = parseFloat(digitsOnly);
//   return Number.isNaN(n) ? 0 : Math.round(n);
// }

// export function rupeesToCrores(r: number): number {
//   if (!r || r <= 0) return 0;
//   return r / RUPEE_PER_CRORE;
// }

// const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   mode = 'create',
//   propertyId,
//   initialData = null
// }) => {
//   const now = new Date();
//   const CURRENT_YEAR = now.getFullYear();
//   const CURRENT_MONTH = now.getMonth() + 1;

//   const sortNumericOptions = (options: MasterOption[] = []) => {
//     return [...options].sort((a, b) => {
//       const numA = parseInt(a.label || a.value || '0', 10);
//       const numB = parseInt(b.label || b.value || '0', 10);
//       return numA - numB;
//     });
//   };

//   const [formData, setFormData] = useState<PropertyFormData>(() => ({
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
//     balcony: '',
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
//   const [societyOptions, setSocietyOptions] = useState<MasterOption[]>([]);
//   const [societyDetails, setSocietyDetails] = useState<{
//     societyName: string;
//     locality: string;
//     city: string;
//     pincode: string
//     amenities: string[];
//   } | null>(null);
//   const [isLoadingSociety, setIsLoadingSociety] = useState(false);
//   const [isEditDataLoaded, setIsEditDataLoaded] = useState(false);

//   // ========== HELPER: convert dropdown label to ID ==========
// const resolveDropdownField = (
//   fieldValue: string | undefined,
//   options: MasterOption[]
// ): string => {
//   if (!fieldValue) return "";
//   // Already an ID?
//   if (options.some(opt => String(opt.value) === String(fieldValue))) {
//     return String(fieldValue);
//   }
//   const normalizedInput = String(fieldValue).toLowerCase().replace(/\s+/g, '');
//   const match = options.find(opt => {
//     const normalizedLabel = String(opt.label).toLowerCase().replace(/\s+/g, '');
//     return normalizedLabel === normalizedInput;
//   });
//   return match ? String(match.value) : "";
// };

//   const getLabelFromValue = (options: MasterOption[] = [], value: string): string => {
//     if (!value || !options || !Array.isArray(options)) return '';
//     const exactMatch = options.find(o => String(o.value) === String(value));
//     if (exactMatch) return exactMatch.label || '';
//     const caseInsensitiveMatch = options.find(o => String(o.value).toLowerCase() === String(value).toLowerCase());
//     if (caseInsensitiveMatch) return caseInsensitiveMatch.label || '';
//     const labelMatch = options.find(o => String(o.label).toLowerCase() === String(value).toLowerCase());
//     if (labelMatch) return labelMatch.label || '';
//     return '';
//   };

//   const createFilePreview = (file: File): FilePreview => {
//     const url = URL.createObjectURL(file);
//     const type = file.type.startsWith('image/') ? 'image' : 'document';
//     return { file, url, type, isExisting: false };
//   };

//   const createExistingFilePreview = (url: string, name: string): FilePreview => {
//     const type = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? 'image' : 'document';
//     return { url, type, isExisting: true, name };
//   };

//   const cleanupPreview = (p: FilePreview) => {
//     if (!p.isExisting && p.url) URL.revokeObjectURL(p.url);
//   };

//   const cleanupAllPreviews = () => {
//     if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
//     photoPreviews.forEach(p => { if (!p.isExisting) cleanupPreview(p); });
//   };

//   // Fetch fresh society list directly from API
//   const fetchFreshSocietyList = async () => {
//     try {
//       const societies = await societyAPI.getAllSocieties();
//       const options = societies.map((s: any) => ({
//         value: s.id,
//         label: s.societyName || s.society_name || s.name
//       }));
//       setSocietyOptions(options);
//       setMasterOptions(prev => ({
//         ...prev,
//         society: options
//       }));
//       return options;
//     } catch (error) {
//       console.error('Error fetching society list:', error);
//       return [];
//     }
//   };

//   // Fetch society details for auto-fill
//   const fetchSocietyDetails = async (societyIdOrName: string) => {
//     if (!societyIdOrName || societyIdOrName === '') {
//       setSocietyDetails(null);
//       return;
//     }

//     try {
//       setIsLoadingSociety(true);
//       let actualSociety = null;

//       if (societyIdOrName.includes('-') && societyIdOrName.length > 30) {
//         actualSociety = await societyAPI.getSocietyByIdentifier(societyIdOrName);
//       } else {
//         const allSocieties = await societyAPI.getAllSocieties();
//         actualSociety = allSocieties.find((s: any) =>
//           (s.societyName || s.society_name) === societyIdOrName
//         );
//       }

//       if (actualSociety) {

//         console.log("Actual Society", actualSociety);
//         console.log("Society Amenities", actualSociety?.amenities);
//         console.log("Dropdown Amenities", getOptions("amenities"));

//         const details = {
//           societyName: actualSociety.societyName || actualSociety.society_name,
//           locality: actualSociety.locality || '',
//           city: actualSociety.city || '',
//           pincode: actualSociety.pincode || '',
//           amenities: actualSociety.amenities || []
//         };

//         setSocietyDetails(details);

//         if (details.locality) {
//           setFormData(prev => ({ ...prev, location: details.locality }));
//         }

//         if (details.city) {
//           setFormData(prev => ({ ...prev, city: details.city }));
//         }
//         const amenityIds = (details.amenities || []).map((amenityName: string) => {
//           const match = getOptions("amenities").find(
//             opt =>
//               String(opt.label).trim().toLowerCase() ===
//               String(amenityName).trim().toLowerCase()
//           );
//           return match ? String(match.value) : amenityName;
//         });

//         setFormData(prev => ({
//           ...prev,
//           location: details.locality,
//           city: details.city,
//           amenities: amenityIds,
//           address: `${details.societyName}, ${details.locality}, ${details.city} ${details.pincode}`
//         }));
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setIsLoadingSociety(false);
//     }
//   };

//   const generateAddressWithSocietyDetails = (societyDetailsParam?: typeof societyDetails) => {
//     const details = societyDetailsParam || societyDetails;
//     const parts: string[] = [];

//     if (details?.societyName) {
//       parts.push(details.societyName);
//     } else if (formData.society) {
//       const societyOption = societyOptions.find(opt =>
//         String(opt.value) === String(formData.society) || opt.label === formData.society
//       );
//       if (societyOption) parts.push(societyOption.label);
//     }

//     const locationValue = formData.location || details?.locality || '';
//     if (locationValue) parts.push(locationValue);

//     const cityValue = formData.city || details?.city || '';
//     const pincodeValue = details?.pincode || '';

//     if (cityValue && pincodeValue) {
//       parts.push(`${cityValue} ${pincodeValue}`);
//     } else if (cityValue) {
//       parts.push(cityValue);
//     }

//     return parts.join(', ');
//   };

//   const generateAddress = () => {
//     return generateAddressWithSocietyDetails();
//   };

//   const fetchMasterData = async () => {
//     try {
//       const data = await getMasterDropdownOptions(['lead', 'common', 'property']);
//       setMasterOptions(prev => ({
//         ...prev,
//         ...data
//       }));
//     } catch (err) {
//       setErrorBanner(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
//     }
//   };

//   const loadProperties = async () => {
//     try {
//       const apiAny = propertiesAPI as any;
//       if (typeof apiAny.list === 'function') await apiAny.list();
//       else if (typeof apiAny.listProperties === 'function') await apiAny.listProperties();
//       else if (typeof apiAny.getAll === 'function') await apiAny.getAll();
//     } catch (err) {
//       console.warn('loadProperties: propertiesAPI listing call failed', err);
//     }
//     try {
//       window.dispatchEvent(new CustomEvent('properties:reload'));
//     } catch (err) {
//       console.warn('loadProperties: failed to dispatch properties:reload event', err);
//     }
//   };

//   const handleDropdownChange = (field: keyof PropertyFormData) => (value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));

//     if (field === 'society') {
//       fetchSocietyDetails(value);
//     }
//   };

//   const handleInputChange = (field: keyof PropertyFormData, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));
//   };

//   const handleAmenitiesToggle = (value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       amenities: prev.amenities.includes(value) ? prev.amenities.filter(v => v !== value) : [...prev.amenities, value],
//     }));
//   };

//   const handleFurnishingItemsToggle = (value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       furnishingItems: prev.furnishingItems.includes(value) ? prev.furnishingItems.filter(v => v !== value) : [...prev.furnishingItems, value],
//     }));
//   };

//   const handleNearbyPlaceInputChange = (field: keyof NearbyPlace, value: string) => {
//     setNearbyPlaceForm(prev => ({ ...prev, [field]: value }));
//   };

//   const addNearbyPlace = () => {
//     const { name, distance, unit, type } = nearbyPlaceForm;
//     if (!name || !distance || !unit || !type) return;
//     const placeName = getLabelFromValue(masterOptions['place name'] || [], name) || name;
//     const placeType = getLabelFromValue(masterOptions['place type'] || [], type) || type;
//     setFormData(prev => ({
//       ...prev,
//       nearby_places: [...prev.nearby_places, { name: placeName, distance, unit, type: placeType }]
//     }));
//     setNearbyPlaceForm({ name: '', distance: '', unit: '', type: '' });
//   };

//   const removeNearbyPlace = (idx: number) => {
//     setFormData(prev => ({
//       ...prev,
//       nearby_places: prev.nearby_places.filter((_, i) => i !== idx),
//     }));
//   };

//   const handleOwnershipDocUpload = (file: File | null) => {
//     if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
//     if (file) {
//       const preview = createFilePreview(file);
//       setOwnershipDocPreview(preview);
//       setFormData(prev => ({ ...prev, ownershipDoc: file }));
//     } else {
//       setOwnershipDocPreview(null);
//       setFormData(prev => ({ ...prev, ownershipDoc: null }));
//     }
//   };

//   const handlePhotosUpload = (files: File[]) => {
//     const newPreviews = files.map(createFilePreview);

//     setPhotoPreviews(prev => [...prev, ...newPreviews]);

//     setFormData(prev => ({
//       ...prev,
//       photos: [...(prev.photos || []), ...files]
//     }));
//   };

//   const removeOwnershipDoc = () => {
//     if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
//     setOwnershipDocPreview(null);
//     setFormData(prev => ({ ...prev, ownershipDoc: null }));
//   };

//   const removePhoto = (index: number) => {
//     const next = [...photoPreviews];
//     const removed = next.splice(index, 1)[0];
//     if (removed && !removed.isExisting) cleanupPreview(removed);
//     setPhotoPreviews(next);
//     const newFiles = next.filter(p => !p.isExisting && p.file).map(p => p.file!);
//     setFormData(prev => ({ ...prev, photos: newFiles }));
//   };

//   // Initialize form when modal opens (only fetch data)
//   useEffect(() => {
//     if (!isOpen) {
//       setIsEditDataLoaded(false);
//       return;
//     }

//     const initializeForm = async () => {
//       setErrorBanner(null);
//       setErrors({});
//       await fetchFreshSocietyList();
//       await fetchMasterData();
//     };

//     initializeForm();

//     return () => {
//       cleanupAllPreviews();
//       setOwnershipDocPreview(null);
//       setPhotoPreviews([]);
//       setSocietyDetails(null);
//     };
//   }, [isOpen]);


//   // ========== CONVERT stored labels to dropdown IDs after master data loads ==========
// useEffect(() => {
//   // Wait until we have the required master options
//   const needed = [
//     "property subtype", "property type", "unit type", "furnishing",
//     "parking type", "property status", "lead source", "selling rights",
//     "bedrooms", "bathrooms", "facing", "balcony"
//   ];
//   const optionsLoaded = needed.every(key => masterOptions[key] && masterOptions[key].length > 0);
//   if (!optionsLoaded) return;

//   // Only run for edit mode after initial data is loaded
//   if (mode !== 'edit' || !initialData || !isEditDataLoaded) return;

//   const updates: Partial<PropertyFormData> = {};

//   updates.propertyType = resolveDropdownField(formData.propertyType, masterOptions["property type"]);
//   updates.propertySubtype = resolveDropdownField(formData.propertySubtype, masterOptions["property subtype"]);
//   updates.unitType = resolveDropdownField(formData.unitType, masterOptions["unit type"]);
//   updates.furnishing = resolveDropdownField(formData.furnishing, masterOptions["furnishing"]);
//   updates.parkingType = resolveDropdownField(formData.parkingType, masterOptions["parking type"]);
//   updates.status = resolveDropdownField(formData.status, masterOptions["property status"]);
//   updates.leadSource = resolveDropdownField(formData.leadSource, masterOptions["lead source"]);
//   updates.sellingRights = resolveDropdownField(formData.sellingRights, masterOptions["selling rights"]);
//   updates.bedrooms = resolveDropdownField(formData.bedrooms, masterOptions["bedrooms"]);
//   updates.bathrooms = resolveDropdownField(formData.bathrooms, masterOptions["bathrooms"]);
//   updates.facing = resolveDropdownField(formData.facing, masterOptions["facing"]);
//   updates.balcony = resolveDropdownField(formData.balcony, masterOptions["balcony"]);

//   // Only update if something actually changed
//   if (Object.values(updates).some(v => v !== undefined && v !== "")) {
//     setFormData(prev => ({ ...prev, ...updates }));
//   }
// }, [masterOptions, mode, initialData, isEditDataLoaded, formData.propertyType, formData.propertySubtype, formData.unitType, formData.furnishing, formData.parkingType, formData.status, formData.leadSource, formData.sellingRights, formData.bedrooms, formData.bathrooms, formData.facing, formData.balcony]);

//   // Separate effect for edit mode - runs after societyOptions is loaded
//   useEffect(() => {
//     if (!isOpen) return;
//     if (mode !== 'edit' || !initialData) return;
//     if (societyOptions.length === 0) return;
//     if (isEditDataLoaded) return;

//     console.log('Edit mode setting data with societyOptions:', societyOptions);

//     let societyId = initialData.society || '';

//     if (societyId) {
      
//       const matchedSociety = societyOptions.find(
//         opt =>
//           String(opt.label).trim().toLowerCase() ===
//           String(societyId).trim().toLowerCase()
//       );

//       console.log("Society from Property:", societyId);
//       console.log("Matched Society:", matchedSociety);

//       if (matchedSociety) {
//         societyId = String(matchedSociety.value);
//       }
//     }

//     setFormData(prev => ({
//       ...prev,
//       seller: initialData.seller || '',
//       propertyType: initialData.propertyType || '',
//       propertySubtype: initialData.propertySubtype || '',
//       unitType: initialData.unitType || '',
//       wing: initialData.wing || '',
//       unitNo: initialData.unitNo || '',
//       furnishing: initialData.furnishing || '',
//       parkingType: initialData.parkingType || '',
//       parkingQty: initialData.parkingQty || '',
//       city: initialData.city || '',
//       location: initialData.location || '',
//       society: societyId,
//       floor: initialData.floor || '',
//       totalFloors: initialData.totalFloors || '',
//       carpetArea: initialData.carpetArea || '',
//       builtupArea: initialData.builtupArea || '',
//       budget: initialData.budget || '',
//       address: initialData.address || '',
//       status: initialData.status || '',
//       leadSource: initialData.leadSource || '',
//       possessionMonth: initialData.possessionMonth || String(CURRENT_MONTH),
//       possessionYear: initialData.possessionYear || String(CURRENT_YEAR),
//       purchaseMonth: initialData.purchaseMonth || String(CURRENT_MONTH),
//       purchaseYear: initialData.purchaseYear || String(CURRENT_YEAR),
//       sellingRights: initialData.sellingRights || 'Standard',
//       amenities: initialData.amenities || [],
//       furnishingItems: initialData.furnishingItems || [],
//       description: initialData.description || '',
//       nearby_places: initialData.nearby_places || [],
//       bedrooms: initialData.bedrooms || '',
//       bathrooms: initialData.bathrooms || '',
//       balcony: initialData.balcony || '',
//       facing: initialData.facing || '',
//       priceType: (initialData.priceType as 'Fixed' | 'Negotiable') || '',
//       finalPrice: initialData.finalPrice || '',
//     }));

//     if (initialData.existingOwnershipDocUrl) {
//       setOwnershipDocPreview(createExistingFilePreview(initialData.existingOwnershipDocUrl, initialData.existingOwnershipDocName || 'Ownership Document'));
//     }

//     const existingPhotos = (initialData.existingPhotos || []).map(p => createExistingFilePreview(p.url, p.name || 'Photo'));
//     setPhotoPreviews(existingPhotos);

//     if (societyId) {
//       setTimeout(() => {
//         fetchSocietyDetails(societyId);
//       }, 500);
//     }

//     setIsEditDataLoaded(true);
//   }, [isOpen, mode, initialData, societyOptions]);

//   // Auto-generate address (only for create mode)
//   useEffect(() => {
//     if (!isOpen) return;
//     if (mode !== 'create') return;
//     if (Object.keys(masterOptions).length === 0 && societyOptions.length === 0) return;
//     const addr = generateAddress();
//     if (addr && addr !== formData.address) {
//       setFormData(prev => ({ ...prev, address: addr }));
//     }
//   }, [isOpen, mode, formData.wing, formData.unitNo, formData.society, formData.floor, formData.location, formData.city, societyOptions, societyDetails]);

//   const validateForm = () => {
//     const e: Record<string, string> = {};
//     if (!formData.propertyType) e.propertyType = 'Property type is required';
//     if (!formData.propertySubtype) e.propertySubtype = 'Property subtype is required';
//     if (!formData.unitType) e.unitType = 'Unit type is required';
//     if (!formData.city) e.city = 'City is required';
//     if (!formData.location) e.location = 'Location is required';
//     if (!formData.society) e.society = 'Society is required';
//     if (!formData.carpetArea) e.carpetArea = 'Carpet area is required';
//     if (!formData.budget) e.budget = 'Budget is required';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const buildPayload = (): FormData => {
//     const fd = new FormData();
//     const textFields: (keyof PropertyFormData)[] = [
//       "seller", "propertyType", "propertySubtype", "unitType", "wing", "unitNo",
//       "furnishing", "parkingType", "parkingQty", "city", "location", "society",
//       "floor", "totalFloors", "carpetArea", "builtupArea", "budget", "address",
//       "status", "leadSource", "possessionMonth", "possessionYear",
//       "purchaseMonth", "purchaseYear", "sellingRights", "description",
//       "bedrooms", "bathrooms", "facing", "balcony", "priceType", "finalPrice",
//     ];
//     textFields.forEach((k) => fd.append(k, String((formData as any)[k] ?? "")));

//     const societyLabel = getLabelFromValue(societyOptions, formData.society);
//     const finalSocietyName = societyLabel || formData.society || '';
//     fd.append('society_name', finalSocietyName);
//     fd.append("amenities", JSON.stringify(formData.amenities || []));
//     fd.append("furnishingItems", JSON.stringify(formData.furnishingItems || []));
//     fd.append("nearby_places", JSON.stringify(formData.nearby_places || []));

//     if (mode === 'edit') {
//       const existingPhotoUrls = photoPreviews.filter(p => p.isExisting).map(p => p.url);
//       fd.append("existingPhotoUrls", JSON.stringify(existingPhotoUrls));
//       if (ownershipDocPreview?.isExisting) fd.append("existingOwnershipDocUrl", ownershipDocPreview.url);
//     }
//     if (formData.ownershipDoc) fd.append("ownershipDoc", formData.ownershipDoc, formData.ownershipDoc.name);
//     (formData.photos || []).forEach((file) => file && fd.append("photos", file, file.name));
//     return fd;
//   };

//   function buildUiPatchFromForm(fd: PropertyFormData, previews: { ownership?: FilePreview | null, photos: FilePreview[] }) {
//     return {
//       seller: fd.seller ? { name: fd.seller } : undefined,
//       type: fd.propertyType,
//       subtype: fd.propertySubtype,
//       unitType: fd.unitType,
//       wing: fd.wing,
//       unitNo: fd.unitNo,
//       furnishing: fd.furnishing,
//       furnishingItems: fd.furnishingItems,
//       parkingType: fd.parkingType,
//       parkingQty: fd.parkingQty,
//       city: fd.city,
//       location: fd.location,
//       society: fd.society,
//       floor: fd.floor,
//       totalFloors: fd.totalFloors,
//       carpetArea: fd.carpetArea,
//       builtupArea: fd.builtupArea,
//       budget: fd.budget,
//       address: fd.address,
//       status: fd.status,
//       leadSource: fd.leadSource,
//       possessionMonth: fd.possessionMonth,
//       possessionYear: fd.possessionYear,
//       purchaseMonth: fd.purchaseMonth,
//       purchaseYear: fd.purchaseYear,
//       selling_rights: fd.sellingRights,
//       amenities: fd.amenities,
//       nearby_places: fd.nearby_places,
//       description: fd.description,
//       bedrooms: fd.bedrooms,
//       bathrooms: fd.bathrooms,
//       balcony: fd.balcony,
//       facing: fd.facing,
//       priceType: fd.priceType,
//       finalPrice: fd.finalPrice,
//       ownershipDocUrl: previews.ownership?.url,
//       ownershipDocName: previews.ownership?.name,
//       photos: previews.photos.map(p => p.url),
//       updated_at: new Date().toISOString(),
//     };
//   }

//   const handleSubmit = async () => {
//     if (!validateForm()) return;
//     try {
//       setLoading(true);
//       setErrorBanner(null);
//       const payload = buildPayload();
//       if (mode === "edit" && propertyId) {
//         await propertiesAPI.updateProperty(String(propertyId), payload);
//       } else {
//         await propertiesAPI.createProperty(payload);
//       }
//       await loadProperties();
//       const uiPatch = buildUiPatchFromForm(formData, { ownership: ownershipDocPreview, photos: photoPreviews });
//       onSubmit(uiPatch);
//       window.dispatchEvent(new CustomEvent("overview:refresh", { detail: { id: propertyId } }));
//       toast.success(`Property ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
//       onClose?.();
//     } catch (e: any) {
//       console.error('❌ SUBMISSION ERROR:', e);
//       const msg = e?.response?.data?.message || e?.message || `Failed to ${mode === "edit" ? "update" : "create"} property`;
//       setErrorBanner(msg);
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getOptions = (key: string): MasterOption[] => {
//     if (key === 'society' && societyOptions.length > 0) {
//       return societyOptions;
//     }
//     return masterOptions[key] || masterOptions[key.toLowerCase()] || [];
//   };

//   const modalTitle = mode === 'edit' ? 'Edit Property' : 'Add New Property';
//   const submitButtonText = mode === 'edit' ? 'Update Property' : 'Add Property';
//   const SubmitIcon = mode === 'edit' ? Edit : Plus;
//   const SafeDropdown: React.FC<any> = (props) => <Dropdown {...props} />;

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} showHeader={false} showCloseButton={false} width="max-w-[95vw] md:max-w-4xl lg:max-w-5xl">
//       <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b rounded-t-lg" style={{ background: N, borderColor: BD }}>
//         <div className="flex items-center gap-2">
//           {mode === 'edit' ? <Edit size={16} style={{ color: O }} /> : <Plus size={16} style={{ color: O }} />}
//           <h2 className="text-sm font-bold text-white">{modalTitle}</h2>
//         </div>
//         <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
//           <X size={16} style={{ color: 'white' }} />
//         </button>
//       </div>

//       <div className="relative px-4 py-4">
//         {loading && (
//           <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
//             <div className="animate-spin rounded-full h-7 w-7 border-2 border-t-transparent mb-2" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
//             <p className="text-xs font-semibold text-gray-600">{mode === 'edit' ? 'Updating…' : 'Saving…'}</p>
//           </div>
//         )}

//         {errorBanner && (
//           <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
//             <X size={13} className="flex-shrink-0 mt-0.5 text-red-400" />{errorBanner}
//           </div>
//         )}

//         <div className="space-y-4">
//           {/* Property Details Section */}
//           <SectionHeader>Property Details</SectionHeader>
//           <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
//             <Field label="Seller (optional)">
//               <input type="text" placeholder="Enter Seller" value={formData.seller} onChange={(e) => handleInputChange('seller', e.target.value)} className={INP} />
//             </Field>
//             <Field label="Property Type" required error={errors.propertyType}>
//               <SafeDropdown placeholder="Select Property Type" options={getOptions('property type')} value={formData.propertyType} onChange={handleDropdownChange('propertyType')} className="w-full" />
//             </Field>
//             <Field label="Property Subtype" required error={errors.propertySubtype}>
//               <SafeDropdown placeholder="Select Property Subtype" options={getOptions('property subtype')} value={formData.propertySubtype} onChange={handleDropdownChange('propertySubtype')} className="w-full" />
//             </Field>
//             <Field label="Unit Type" required error={errors.unitType}>
//               <SafeDropdown placeholder="Select Unit Type" options={getOptions('unit type')} value={formData.unitType} onChange={handleDropdownChange('unitType')} className="w-full" />
//             </Field>
//             <Field label="Wing">
//               <input type="text" placeholder="Wing name/number" value={formData.wing} onChange={(e) => handleInputChange('wing', e.target.value)} className={INP} />
//             </Field>
//             <Field label="Unit No">
//               <input type="text" placeholder="Unit/Flat no" value={formData.unitNo} onChange={(e) => handleInputChange('unitNo', e.target.value)} className={INP} />
//             </Field>
//             <Field label="Furnishing">
//               <SafeDropdown placeholder="Select Furnishing" options={getOptions('furnishing')} value={formData.furnishing} onChange={handleDropdownChange('furnishing')} className="w-full" />
//             </Field>
//             <Field label="Parking Type">
//               <SafeDropdown placeholder="Select Parking Type" options={getOptions('parking type')} value={formData.parkingType} onChange={handleDropdownChange('parkingType')} className="w-full" />
//             </Field>
//             <Field label="Bedrooms">
//               <SafeDropdown placeholder="Select Bedrooms" options={getOptions('bedrooms')} value={formData.bedrooms} onChange={handleDropdownChange('bedrooms')} className="w-full" />
//             </Field>
//             <Field label="Bathrooms">
//               <SafeDropdown placeholder="Select Bathrooms" options={getOptions('bathrooms')} value={formData.bathrooms} onChange={handleDropdownChange('bathrooms')} className="w-full" />
//             </Field>
//             <Field label="Facing">
//               <SafeDropdown placeholder="Select Facing" options={getOptions('facing')} value={formData.facing} onChange={handleDropdownChange('facing')} className="w-full" />
//             </Field>
//             <Field label="Balcony">
//               <SafeDropdown placeholder="Select Balcony" options={getOptions('balcony')} value={formData.balcony} onChange={handleDropdownChange('balcony')} className="w-full" />
//             </Field>
//             <Field label="Parking Qty">
//               <SafeDropdown placeholder="Select Parking Quantity" options={sortNumericOptions(getOptions('parking qty'))} value={formData.parkingQty} onChange={handleDropdownChange('parkingQty')} className="w-full" />
//             </Field>
//             <Field label="Total Floors">
//               <SafeDropdown placeholder="Select Total Floors" options={sortNumericOptions(getOptions('total floors'))} value={formData.totalFloors} onChange={handleDropdownChange('totalFloors')} className="w-full" searchable />
//             </Field>
//             <Field label="Floor">
//               <SafeDropdown placeholder="Select Floor" options={sortNumericOptions(getOptions('floor'))} value={formData.floor} onChange={handleDropdownChange('floor')} className="w-full" searchable />
//             </Field>
//             <Field label="Property Status">
//               <SafeDropdown placeholder="Select Status" options={getOptions('property status')} value={formData.status} onChange={handleDropdownChange('status')} className="w-full" />
//             </Field>
//           </div>

//           {/* Location Section */}
//           <SectionHeader>Location</SectionHeader>
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
//             <Field label="Society Name" required error={errors.society} className="lg:col-span-2">
//               <div className="relative">
//                 <SafeDropdown
//                   placeholder="Select Society"
//                   options={societyOptions.length > 0 ? societyOptions : getOptions('society')}
//                   value={formData.society}
//                   onChange={handleDropdownChange('society')}
//                   className="w-full"
//                   searchable
//                 />
//                 {isLoadingSociety && (
//                   <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                     <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
//                   </div>
//                 )}
//               </div>
//             </Field>

//             <Field label="Location / Locality" required error={errors.location}>
//               <input
//                 type="text"
//                 placeholder="Enter location / locality"
//                 value={formData.location}
//                 readOnly  // ← ADD THIS
//                 onChange={(e) => handleInputChange('location', e.target.value)}
//                 className={`${INP} ${errors.location ? 'border-red-400' : ''}`}
//               />
//             </Field>

//             <Field label="City" required error={errors.city}>
//               <input
//                 type="text"
//                 placeholder="Enter city"
//                 value={formData.city}
//                 readOnly  // ← ADD THIS
//                 onChange={(e) => handleInputChange('city', e.target.value)}
//                 className={`${INP} ${errors.city ? 'border-red-400' : ''}`}
//               />
//             </Field>

//             <div className="col-span-2 sm:col-span-3 lg:col-span-4">
//               <Field label="Address">
//                 <textarea
//                   placeholder="Auto-filled based on selections (editable) - Includes Pincode"
//                   value={formData.address}
//                   readOnly  // ← ADD THIS
//                   onChange={(e) => handleInputChange('address', e.target.value)}
//                   rows={2}
//                   className={`${INP} h-auto py-1.5 resize-none`}
//                 />
//                 {societyDetails?.pincode && (
//                   <p className="text-[10px] text-green-600 mt-1">
//                     ✓ Pincode: {societyDetails.pincode}
//                   </p>
//                 )}
//               </Field>
//             </div>
//           </div>

//           {/* Area & Pricing Section */}
//           <SectionHeader>Area & Pricing</SectionHeader>
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
//             <Field label="Carpet Area (sq.ft)" required error={errors.carpetArea}>
//               <input type="text" placeholder="e.g. 850" value={formData.carpetArea} onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('carpetArea', e.target.value); }} className={`${INP} ${errors.carpetArea ? 'border-red-400' : ''}`} />
//             </Field>
//             <Field label="Builtup Area (sq.ft)">
//               <input type="text" placeholder="e.g. 1050" value={formData.builtupArea} onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('builtupArea', e.target.value); }} className={INP} />
//             </Field>
//             <Field label="Lead Source">
//               <SafeDropdown placeholder="Lead Source" options={getOptions('lead source')} value={formData.leadSource} onChange={handleDropdownChange('leadSource')} className="w-full" />
//             </Field>
//             <div className="col-span-2 sm:col-span-3 lg:col-span-4">
//               <label className={LBL}>Sell Price (₹) <span className="text-red-400">*</span></label>
//               <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
//                 <PriceRangeSelector
//                   initialMax={
//                     formData.budget
//                       ? rupeesToCrores(parseBudgetToRupees(formData.budget))
//                       : 0
//                   }
//                   onChange={({ max }) => {
//                     const rupeeVal = Math.round(max * 10_000_000);

//                     handleInputChange("budget", String(rupeeVal));
//                   }}
//                 />
//                 <div className="flex items-center gap-4 pt-1">
//                   {(['Fixed', 'Negotiable'] as const).map((type) => (
//                     <label key={type} className="flex items-center gap-1.5 cursor-pointer">
//                       <input type="checkbox" className="h-3 w-3 rounded accent-orange-500"
//                         checked={(formData.priceType) === type}
//                         onChange={(e) => handleInputChange('priceType', e.target.checked ? type : "")} />
//                       <span className={`text-xs font-semibold ${(formData.priceType) === type ? 'text-gray-800' : 'text-gray-400'}`}>{type}</span>
//                     </label>
//                   ))}
//                 </div>
//                 {formData.priceType === 'Negotiable' && (
//                   <div className="pt-2 border-t border-gray-200">
//                     <label className={`${LBL} mb-1`}>Final Price (₹)</label>
//                     <div className="flex items-center gap-2">
//                       {/* <input type="text" inputMode="numeric" className={`${INP} max-w-[180px]`} value={formData.finalPrice || ''} onChange={(e) => handleInputChange('finalPrice', e.target.value)} onBlur={(e) => { const rupees = parseBudgetToRupees(e.target.value); handleInputChange('finalPrice', String(rupees)); }} placeholder="e.g. 45,00,000" /> */}
//                       <input
//                         type="text"
//                         inputMode="numeric"
//                         className={`${INP} max-w-[180px]`}
//                         value={formData.finalPrice || ""}
//                         onChange={(e) => {
//                           let value = e.target.value.replace(/\D/g, "");

//                           handleInputChange("finalPrice", value);
//                         }}
//                         onBlur={(e) => {
//                           const cleanValue = String(
//                             Number(e.target.value.replace(/\D/g, "") || 0)
//                           );

//                           handleInputChange("finalPrice", cleanValue);
//                         }}
//                       />
//                       {(() => {
//                         const v = parseBudgetToRupees(formData.finalPrice || '');
//                         if (!v || v <= 0) return null;
//                         const label = v < 10_000_000 ? `${Math.round(v / 100_000)}L` : `${(v / 10_000_000).toFixed(2)}Cr`;
//                         return <span className="text-xs font-bold text-green-700">≈ ₹{label}</span>;
//                       })()}
//                     </div>
//                   </div>
//                 )}
//                 {errors.budget && <p className="text-red-400 text-[10px]">{errors.budget}</p>}
//               </div>
//             </div>
//           </div>

//           {/* Timeline & Selling Rights */}
//           <SectionHeader>Timeline & Selling Rights</SectionHeader>
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
//             <PossessionDropdown title="Purchase Month & Year" possessionMonth={formData.purchaseMonth} possessionYear={formData.purchaseYear} onMonthChange={(m) => handleInputChange('purchaseMonth', m)} onYearChange={(y) => handleInputChange('purchaseYear', y)} />
//             <PossessionDropdown title="Possession Month & Year" possessionMonth={formData.possessionMonth} possessionYear={formData.possessionYear} onMonthChange={(m) => handleInputChange('possessionMonth', m)} onYearChange={(y) => handleInputChange('possessionYear', y)} />
//             <Field label="Selling Rights">
//               <SafeDropdown placeholder="Select Selling Rights" options={getOptions('selling rights')} value={formData.sellingRights} onChange={handleDropdownChange('sellingRights')} className="w-full" />
//             </Field>
//           </div>

//           {/* Amenities & Furnishings */}
//           <SectionHeader>Amenities & Furnishings</SectionHeader>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//             <div>
//               <MultiSelectDropdown label="Amenities" options={getOptions('amenities')} selectedValues={formData.amenities} onToggle={handleAmenitiesToggle} placeholder="Select amenities…" />
//               {formData.amenities.length > 0 && (
//                 <div className="flex flex-wrap gap-1 mt-1.5">
//                   {formData.amenities.map((val) => {
//                     const opt = getOptions('amenities').find(o => String(o.value) === String(val));
//                     return (
//                       <span key={val} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
//                         {opt?.label || val}
//                         <button type="button" onClick={() => handleAmenitiesToggle(val)} className="text-violet-400 hover:text-violet-600 text-xs leading-none">×</button>
//                       </span>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//             <div>
//               <MultiSelectDropdown label="Furnishing Items" options={getOptions('furnishing items')} selectedValues={formData.furnishingItems} onToggle={handleFurnishingItemsToggle} placeholder="Select furnishing items…" />
//               {formData.furnishingItems.length > 0 && (
//                 <div className="flex flex-wrap gap-1 mt-1.5">
//                   {formData.furnishingItems.map((val) => {
//                     const opt = getOptions('furnishing items').find(o => String(o.value) === String(val));
//                     return (
//                       <span key={val} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
//                         {opt?.label || val}
//                         <button type="button" onClick={() => handleFurnishingItemsToggle(val)} className="text-violet-400 hover:text-violet-600 text-xs leading-none">×</button>
//                       </span>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Nearby Places */}
//           <SectionHeader>Nearby Places</SectionHeader>
//           <div className="mb-4">
//             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 items-end mb-2">
//               <Field label="Place Name" className="sm:col-span-1 lg:col-span-1">
//                 <SafeDropdown placeholder="Select" options={getOptions('place name')} value={nearbyPlaceForm.name} onChange={(v) => handleNearbyPlaceInputChange('name', v)} className="w-full" searchable />
//               </Field>
//               <Field label="Distance">
//                 <input type="text" className={INP} placeholder="e.g. 2" value={nearbyPlaceForm.distance} onChange={(e) => handleNearbyPlaceInputChange('distance', e.target.value)} />
//               </Field>
//               <Field label="Unit">
//                 <select className={INP} value={nearbyPlaceForm.unit} onChange={(e) => handleNearbyPlaceInputChange('unit', e.target.value)}>
//                   <option value="">—</option>
//                   <option value="km">km</option>
//                   <option value="m">m</option>
//                   <option value="min">min</option>
//                 </select>
//               </Field>
//               <div className="flex items-end gap-1.5">
//                 <Field label="Place Type" className="flex-1">
//                   <SafeDropdown placeholder="Select" options={getOptions('place type')} value={nearbyPlaceForm.type} onChange={(v) => handleNearbyPlaceInputChange('type', v)} className="w-full" searchable />
//                 </Field>
//                 <button type="button" onClick={addNearbyPlace} disabled={!nearbyPlaceForm.name || !nearbyPlaceForm.distance || !nearbyPlaceForm.unit || !nearbyPlaceForm.type} className="flex-shrink-0 h-8 w-8 rounded-md text-white flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed" style={{ background: '#16A34A' }}>
//                   <Plus size={13} />
//                 </button>
//               </div>
//             </div>
//             <div className="space-y-1.5">
//               {formData.nearby_places.length === 0 ? (
//                 <div className="text-[11px] text-gray-400 italic py-2 px-3 bg-gray-50 rounded-md border border-dashed border-gray-200 text-center">No nearby places added yet</div>
//               ) : (
//                 formData.nearby_places.map((place, index) => (
//                   <div key={index} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
//                     <div className="text-xs">
//                       <span className="font-semibold text-blue-600">{place.name}</span>
//                       <span className="text-gray-400 mx-1">·</span>
//                       <span className="text-gray-500">{place.distance} {place.unit}</span>
//                       <span className="text-gray-400 mx-1">·</span>
//                       <span className="text-green-600 capitalize">{place.type}</span>
//                     </div>
//                     <button type="button" onClick={() => removeNearbyPlace(index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Documents & Photos */}
//           <SectionHeader>Documents & Photos</SectionHeader>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             <div>
//               <label className={LBL}>Ownership Document</label>
//               <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer group" onClick={() => document.getElementById('ownership-doc-input')?.click()}>
//                 <input id="ownership-doc-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleOwnershipDocUpload(e.target.files?.[0] || null)} />
//                 <Upload className="h-5 w-5 text-gray-300 group-hover:text-orange-400 mx-auto mb-1 transition-colors" />
//                 <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Click to upload</p>
//                 <p className="text-[10px] text-gray-400">PDF, JPG, PNG — 10 MB max</p>
//               </div>
//               {ownershipDocPreview && <div className="mt-2"><FilePreviewComponent preview={ownershipDocPreview} onRemove={removeOwnershipDoc} /></div>}
//             </div>
//             <div>
//               <label className={LBL}>Property Photos</label>
//               <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer group" onClick={() => document.getElementById('property-photos-input')?.click()}>
//                 <input id="property-photos-input" type="file" accept=".jpg,.jpeg,.png" multiple className="hidden" onChange={(e) => {
//                   const selected = Array.from(e.target.files || []);
//                   if (selected.length > 0) {
//                     handlePhotosUpload(selected);
//                   }
//                   // 🔥 IMPORTANT FIX
//                   e.target.value = "";
//                 }} />
//                 <Upload className="h-5 w-5 text-gray-300 group-hover:text-orange-400 mx-auto mb-1 transition-colors" />
//                 <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">{photoPreviews.length > 0 ? `${photoPreviews.length} file(s) — add more` : 'Click to upload'}</p>
//                 <p className="text-[10px] text-gray-400">JPG, PNG — 5 MB each</p>
//               </div>
//               {photoPreviews.length > 0 && (
//                 <div className="grid grid-cols-4 gap-1.5 mt-2 max-h-44 overflow-y-auto">
//                   {photoPreviews.map((preview, index) => <FilePreviewComponent key={index} preview={preview} onRemove={() => removePhoto(index)} />)}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Description via AI */}
//           <SectionHeader>Description</SectionHeader>
//           <PropertyDescriptionAI
//             formData={formData}
//             setFormData={(u) => setFormData((p) => u(p))}
//             endpoint="/api/ai/generate-description"
//           />

//           {/* Actions */}
//           <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
//             <BtnGhost onClick={onClose} disabled={loading}>Cancel</BtnGhost>
//             <button type="button" onClick={handleSubmit} disabled={loading}
//               className="h-7 px-4 rounded-md text-xs font-black text-white flex items-center gap-1.5 disabled:opacity-60 shadow-sm transition-all"
//               style={{ background: loading ? '#ccc' : BRAND }}
//               onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = BRAND_DARK; }}
//               onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = BRAND; }}>
//               {loading ? <><span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> {mode === 'edit' ? 'Updating…' : 'Submitting…'}</> : <><SubmitIcon size={11} /> {submitButtonText}</>}
//             </button>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default PropertyFormModal;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Upload, Plus, FileText, Trash2, Edit, ChevronDown, Image } from 'lucide-react';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import Modal from '@/components/ui/Modal';
import Dropdown from '@/components/ui/Dropdown';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { societyAPI } from '@/lib/societyAPI';
import { toast } from 'react-toastify';
import PropertyDescriptionAI from './PropertyDescriptionAI';
import PriceRangeSelector from '@/components/ui/PriceRangeSelector';
import { createPortal } from 'react-dom';

/* ---------- DESIGN TOKENS ---------- */
const BRAND = '#E6761D';
const BRAND_DARK = '#CC6A1A';
const INP = 'w-full h-8 px-2.5 rounded-md text-xs border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-colors placeholder:text-gray-400';
const LBL = 'block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1';
const SECTION_HDR = 'flex items-center gap-2 mb-3 mt-1';

/* ---------- Helper Components ---------- */
const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string }> = ({
  label, required, error, children, className = '',
}) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className={LBL}>{label}{required && <span className="text-red-400 ml-0.5 normal-case">*</span>}</label>
    {children}
    {error && <p className="text-red-400 text-[10px] leading-tight">{error}</p>}
  </div>
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={SECTION_HDR}>
    <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ background: BRAND }} />
    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BRAND }}>{children}</span>
    <div className="flex-1 h-px bg-orange-100" />
  </div>
);

const BtnGhost: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, className = '', ...props }) => (
  <button type="button"
    className={`h-7 px-3 rounded-md text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-1 ${className}`}
    {...props}>{children}</button>
);

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

  const popupStyle: any = rect
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

const FilePreviewComponent: React.FC<{ preview: any; onRemove: () => void }> = ({ preview, onRemove }) => (
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

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

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

  const SafeDropdown: React.FC<any> = (props) => <Dropdown {...props} />;

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
  balcony?: string;
  facing?: string;
  priceType?: 'Fixed' | 'Negotiable' | '';
  finalPrice?: string;
  societyImageUrls?: string[];
}

interface InitialDataFromParent {
  id?: string | number;
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
  balcony?: string;
  facing?: string;
  priceType?: 'Fixed' | 'Negotiable' | '';
  finalPrice?: string;
  societyImageUrls?: string[];
}

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: any) => void;
  mode?: 'create' | 'edit';
  propertyId?: string | number;
  initialData?: InitialDataFromParent | null;
}

const RUPEE_PER_CRORE = 10_000_000;
const RUPEE_PER_LAKH = 100_000;

export function parseBudgetToRupees(text?: any): number {
  if (text === null || text === undefined) return 0;
  const raw = String(text).trim().toLowerCase();
  if (!raw) return 0;
  const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
  const digitsOnly = cleaned.replace(/,/g, "");
  if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
  const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * RUPEE_PER_LAKH) || 0;
  const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, "")) * RUPEE_PER_CRORE) || 0;
  const n = parseFloat(digitsOnly);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

export function rupeesToCrores(r: number): number {
  if (!r || r <= 0) return 0;
  return r / RUPEE_PER_CRORE;
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  propertyId,
  initialData = null
}) => {
  const now = new Date();
  const CURRENT_YEAR = now.getFullYear();
  const CURRENT_MONTH = now.getMonth() + 1;

  const sortNumericOptions = (options: MasterOption[] = []) => {
    return [...options].sort((a, b) => {
      const numA = parseInt(a.label || a.value || '0', 10);
      const numB = parseInt(b.label || b.value || '0', 10);
      return numA - numB;
    });
  };

  const [formData, setFormData] = useState<PropertyFormData>(() => ({
    seller: '',
    propertyType: '',
    propertySubtype: '',
    unitType: '',
    wing: '',
    unitNo: '',
    furnishing: '',
    parkingType: '',
    parkingQty: '',
    city: '',
    location: '',
    society: '',
    floor: '',
    totalFloors: '',
    carpetArea: '',
    builtupArea: '',
    budget: '',
    address: '',
    status: '',
    leadSource: '',
    possessionMonth: String(CURRENT_MONTH),
    possessionYear: String(CURRENT_YEAR),
    purchaseMonth: String(CURRENT_MONTH),
    purchaseYear: String(CURRENT_YEAR),
    sellingRights: 'Standard',
    amenities: [],
    furnishingItems: [],
    description: '',
    nearby_places: [],
    ownershipDoc: null,
    photos: [],
    bedrooms: '',
    bathrooms: '',
    balcony: '',
    facing: '',
    priceType: '',
    finalPrice: '',
    societyImageUrls: [],
  }));

  const [ownershipDocPreview, setOwnershipDocPreview] = useState<FilePreview | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<FilePreview[]>([]);
  const [nearbyPlaceForm, setNearbyPlaceForm] = useState({ name: '', distance: '', unit: '', type: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState<Record<string, MasterOption[]>>({});
  const [societyOptions, setSocietyOptions] = useState<MasterOption[]>([]);
  const [societyDetails, setSocietyDetails] = useState<{
    societyName: string;
    locality: string;
    city: string;
    pincode: string;
    amenities: string[];
    imageUrls?: string[];
  } | null>(null);
  const [isLoadingSociety, setIsLoadingSociety] = useState(false);
  const [isEditDataLoaded, setIsEditDataLoaded] = useState(false);

  // ========== HELPER: convert dropdown label to ID ==========
  const resolveDropdownField = (
    fieldValue: string | undefined,
    options: MasterOption[]
  ): string => {
    if (!fieldValue) return "";
    if (options.some(opt => String(opt.value) === String(fieldValue))) {
      return String(fieldValue);
    }
    const normalizedInput = String(fieldValue).toLowerCase().replace(/\s+/g, '');
    const match = options.find(opt => {
      const normalizedLabel = String(opt.label).toLowerCase().replace(/\s+/g, '');
      return normalizedLabel === normalizedInput;
    });
    return match ? String(match.value) : "";
  };

  const getLabelFromValue = (options: MasterOption[] = [], value: string): string => {
    if (!value || !options || !Array.isArray(options)) return '';
    const exactMatch = options.find(o => String(o.value) === String(value));
    if (exactMatch) return exactMatch.label || '';
    const caseInsensitiveMatch = options.find(o => String(o.value).toLowerCase() === String(value).toLowerCase());
    if (caseInsensitiveMatch) return caseInsensitiveMatch.label || '';
    const labelMatch = options.find(o => String(o.label).toLowerCase() === String(value).toLowerCase());
    if (labelMatch) return labelMatch.label || '';
    return '';
  };

  const createFilePreview = (file: File): FilePreview => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'document';
    return { file, url, type, isExisting: false };
  };

  const createExistingFilePreview = (url: string, name: string): FilePreview => {
    const type = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? 'image' : 'document';
    return { url, type, isExisting: true, name };
  };

  const cleanupPreview = (p: FilePreview) => {
    if (!p.isExisting && p.url) URL.revokeObjectURL(p.url);
  };

  const cleanupAllPreviews = () => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    photoPreviews.forEach(p => { if (!p.isExisting) cleanupPreview(p); });
  };

  // Fetch fresh society list directly from API
  const fetchFreshSocietyList = async () => {
    try {
      const societies = await societyAPI.getAllSocieties();
      const options = societies.map((s: any) => ({
        value: s.id,
        label: s.societyName || s.society_name || s.name
      }));
      setSocietyOptions(options);
      setMasterOptions(prev => ({
        ...prev,
        society: options
      }));
      return options;
    } catch (error) {
      console.error('Error fetching society list:', error);
      return [];
    }
  };

  // 🔥 UPDATED: Fetch society details with images and add to photo previews
  const fetchSocietyDetails = async (societyIdOrName: string) => {
    if (!societyIdOrName || societyIdOrName === '') {
      setSocietyDetails(null);
      return;
    }

    try {
      setIsLoadingSociety(true);
      let actualSociety = null;

      if (societyIdOrName.includes('-') && societyIdOrName.length > 30) {
        actualSociety = await societyAPI.getSocietyByIdentifier(societyIdOrName);
      } else {
        const allSocieties = await societyAPI.getAllSocieties();
        actualSociety = allSocieties.find((s: any) =>
          (s.societyName || s.society_name) === societyIdOrName
        );
      }

      if (actualSociety) {
        const details = {
          societyName: actualSociety.societyName || actualSociety.society_name,
          locality: actualSociety.locality || '',
          city: actualSociety.city || '',
          pincode: actualSociety.pincode || '',
          amenities: actualSociety.amenities || [],
          imageUrls: actualSociety.imageUrls || [],
        };

        setSocietyDetails(details);

        // Set location and city
        if (details.locality) {
          setFormData(prev => ({ ...prev, location: details.locality }));
        }
        if (details.city) {
          setFormData(prev => ({ ...prev, city: details.city }));
        }

        // 🔥 Add society images to photo previews
        if (details.imageUrls && details.imageUrls.length > 0) {
          const societyPreviews = details.imageUrls.map((url, index) => ({
            url: url,
            type: 'image' as const,
            isExisting: true,
            name: `Society Image ${index + 1}`,
          }));

          setPhotoPreviews(prev => {
            const userPhotos = prev.filter(p => !p.isExisting);
            return [...userPhotos, ...societyPreviews];
          });

          setFormData(prev => ({
            ...prev,
            societyImageUrls: details.imageUrls,
          }));

          toast.info(`Loaded ${details.imageUrls.length} images from society`);
        }

        // Set amenities
        const amenityIds = (details.amenities || []).map((amenityName: string) => {
          const match = getOptions("amenities").find(
            opt =>
              String(opt.label).trim().toLowerCase() ===
              String(amenityName).trim().toLowerCase()
          );
          return match ? String(match.value) : amenityName;
        });

        setFormData(prev => ({
          ...prev,
          location: details.locality,
          city: details.city,
          amenities: amenityIds,
          address: `${details.societyName}, ${details.locality}, ${details.city} ${details.pincode}`,
        }));
      }
    } catch (error) {
      console.error('Error fetching society details:', error);
    } finally {
      setIsLoadingSociety(false);
    }
  };

  const generateAddressWithSocietyDetails = (societyDetailsParam?: typeof societyDetails) => {
    const details = societyDetailsParam || societyDetails;
    const parts: string[] = [];

    if (details?.societyName) {
      parts.push(details.societyName);
    } else if (formData.society) {
      const societyOption = societyOptions.find(opt =>
        String(opt.value) === String(formData.society) || opt.label === formData.society
      );
      if (societyOption) parts.push(societyOption.label);
    }

    const locationValue = formData.location || details?.locality || '';
    if (locationValue) parts.push(locationValue);

    const cityValue = formData.city || details?.city || '';
    const pincodeValue = details?.pincode || '';

    if (cityValue && pincodeValue) {
      parts.push(`${cityValue} ${pincodeValue}`);
    } else if (cityValue) {
      parts.push(cityValue);
    }

    return parts.join(', ');
  };

  const generateAddress = () => {
    return generateAddressWithSocietyDetails();
  };

  const fetchMasterData = async () => {
    try {
      const data = await getMasterDropdownOptions(['lead', 'common', 'property']);
      setMasterOptions(prev => ({
        ...prev,
        ...data
      }));
    } catch (err) {
      setErrorBanner(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const loadProperties = async () => {
    try {
      const apiAny = propertiesAPI as any;
      if (typeof apiAny.list === 'function') await apiAny.list();
      else if (typeof apiAny.listProperties === 'function') await apiAny.listProperties();
      else if (typeof apiAny.getAll === 'function') await apiAny.getAll();
    } catch (err) {
      console.warn('loadProperties: propertiesAPI listing call failed', err);
    }
    try {
      window.dispatchEvent(new CustomEvent('properties:reload'));
    } catch (err) {
      console.warn('loadProperties: failed to dispatch properties:reload event', err);
    }
  };

  const handleDropdownChange = (field: keyof PropertyFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));

    if (field === 'society') {
      fetchSocietyDetails(value);
    }
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));
  };

  const handleAmenitiesToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(value) ? prev.amenities.filter(v => v !== value) : [...prev.amenities, value],
    }));
  };

  const handleFurnishingItemsToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      furnishingItems: prev.furnishingItems.includes(value) ? prev.furnishingItems.filter(v => v !== value) : [...prev.furnishingItems, value],
    }));
  };

  const handleNearbyPlaceInputChange = (field: keyof NearbyPlace, value: string) => {
    setNearbyPlaceForm(prev => ({ ...prev, [field]: value }));
  };

  const addNearbyPlace = () => {
    const { name, distance, unit, type } = nearbyPlaceForm;
    if (!name || !distance || !unit || !type) return;
    const placeName = getLabelFromValue(masterOptions['place name'] || [], name) || name;
    const placeType = getLabelFromValue(masterOptions['place type'] || [], type) || type;
    setFormData(prev => ({
      ...prev,
      nearby_places: [...prev.nearby_places, { name: placeName, distance, unit, type: placeType }]
    }));
    setNearbyPlaceForm({ name: '', distance: '', unit: '', type: '' });
  };

  const removeNearbyPlace = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      nearby_places: prev.nearby_places.filter((_, i) => i !== idx),
    }));
  };

  const handleOwnershipDocUpload = (file: File | null) => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    if (file) {
      const preview = createFilePreview(file);
      setOwnershipDocPreview(preview);
      setFormData(prev => ({ ...prev, ownershipDoc: file }));
    } else {
      setOwnershipDocPreview(null);
      setFormData(prev => ({ ...prev, ownershipDoc: null }));
    }
  };

  const handlePhotosUpload = (files: File[]) => {
    const newPreviews = files.map(createFilePreview);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...files]
    }));
  };

  const removeOwnershipDoc = () => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    setOwnershipDocPreview(null);
    setFormData(prev => ({ ...prev, ownershipDoc: null }));
  };

  const removePhoto = (index: number) => {
    const next = [...photoPreviews];
    const removed = next.splice(index, 1)[0];

    if (removed && !removed.isExisting) {
      cleanupPreview(removed);
    }

    setPhotoPreviews(next);

    const newFiles = next
      .filter(p => !p.isExisting && p.file)
      .map(p => p.file!);
    setFormData(prev => ({ ...prev, photos: newFiles }));
  };

  // Initialize form when modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsEditDataLoaded(false);
      return;
    }

    const initializeForm = async () => {
      setErrorBanner(null);
      setErrors({});
      await fetchFreshSocietyList();
      await fetchMasterData();
    };

    initializeForm();

    return () => {
      cleanupAllPreviews();
      setOwnershipDocPreview(null);
      setPhotoPreviews([]);
      setSocietyDetails(null);
    };
  }, [isOpen]);

  // Convert stored labels to dropdown IDs after master data loads
  useEffect(() => {
    const needed = [
      "property subtype", "property type", "unit type", "furnishing",
      "parking type", "property status", "lead source", "selling rights",
      "bedrooms", "bathrooms", "facing", "balcony"
    ];
    const optionsLoaded = needed.every(key => masterOptions[key] && masterOptions[key].length > 0);
    if (!optionsLoaded) return;

    if (mode !== 'edit' || !initialData || !isEditDataLoaded) return;

    const updates: Partial<PropertyFormData> = {};

    updates.propertyType = resolveDropdownField(formData.propertyType, masterOptions["property type"]);
    updates.propertySubtype = resolveDropdownField(formData.propertySubtype, masterOptions["property subtype"]);
    updates.unitType = resolveDropdownField(formData.unitType, masterOptions["unit type"]);
    updates.furnishing = resolveDropdownField(formData.furnishing, masterOptions["furnishing"]);
    updates.parkingType = resolveDropdownField(formData.parkingType, masterOptions["parking type"]);
    updates.status = resolveDropdownField(formData.status, masterOptions["property status"]);
    updates.leadSource = resolveDropdownField(formData.leadSource, masterOptions["lead source"]);
    updates.sellingRights = resolveDropdownField(formData.sellingRights, masterOptions["selling rights"]);
    updates.bedrooms = resolveDropdownField(formData.bedrooms, masterOptions["bedrooms"]);
    updates.bathrooms = resolveDropdownField(formData.bathrooms, masterOptions["bathrooms"]);
    updates.facing = resolveDropdownField(formData.facing, masterOptions["facing"]);
    updates.balcony = resolveDropdownField(formData.balcony, masterOptions["balcony"]);

    if (Object.values(updates).some(v => v !== undefined && v !== "")) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [masterOptions, mode, initialData, isEditDataLoaded, formData.propertyType, formData.propertySubtype, formData.unitType, formData.furnishing, formData.parkingType, formData.status, formData.leadSource, formData.sellingRights, formData.bedrooms, formData.bathrooms, formData.facing, formData.balcony]);

  // Separate effect for edit mode - runs after societyOptions is loaded
  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'edit' || !initialData) return;
    if (societyOptions.length === 0) return;
    if (isEditDataLoaded) return;

    let societyId = initialData.society || '';

    if (societyId) {
      const matchedSociety = societyOptions.find(
        opt =>
          String(opt.label).trim().toLowerCase() ===
          String(societyId).trim().toLowerCase()
      );
      if (matchedSociety) {
        societyId = String(matchedSociety.value);
      }
    }

    setFormData(prev => ({
      ...prev,
      seller: initialData.seller || '',
      propertyType: initialData.propertyType || '',
      propertySubtype: initialData.propertySubtype || '',
      unitType: initialData.unitType || '',
      wing: initialData.wing || '',
      unitNo: initialData.unitNo || '',
      furnishing: initialData.furnishing || '',
      parkingType: initialData.parkingType || '',
      parkingQty: initialData.parkingQty || '',
      city: initialData.city || '',
      location: initialData.location || '',
      society: societyId,
      floor: initialData.floor || '',
      totalFloors: initialData.totalFloors || '',
      carpetArea: initialData.carpetArea || '',
      builtupArea: initialData.builtupArea || '',
      budget: initialData.budget || '',
      address: initialData.address || '',
      status: initialData.status || '',
      leadSource: initialData.leadSource || '',
      possessionMonth: initialData.possessionMonth || String(CURRENT_MONTH),
      possessionYear: initialData.possessionYear || String(CURRENT_YEAR),
      purchaseMonth: initialData.purchaseMonth || String(CURRENT_MONTH),
      purchaseYear: initialData.purchaseYear || String(CURRENT_YEAR),
      sellingRights: initialData.sellingRights || 'Standard',
      amenities: initialData.amenities || [],
      furnishingItems: initialData.furnishingItems || [],
      description: initialData.description || '',
      nearby_places: initialData.nearby_places || [],
      bedrooms: initialData.bedrooms || '',
      bathrooms: initialData.bathrooms || '',
      balcony: initialData.balcony || '',
      facing: initialData.facing || '',
      priceType: (initialData.priceType as 'Fixed' | 'Negotiable') || '',
      finalPrice: initialData.finalPrice || '',
      societyImageUrls: initialData.societyImageUrls || [],
    }));

    if (initialData.existingOwnershipDocUrl) {
      setOwnershipDocPreview(createExistingFilePreview(initialData.existingOwnershipDocUrl, initialData.existingOwnershipDocName || 'Ownership Document'));
    }

    const existingPhotos = (initialData.existingPhotos || []).map(p => createExistingFilePreview(p.url, p.name || 'Photo'));
    setPhotoPreviews(existingPhotos);

    if (societyId) {
      setTimeout(() => {
        fetchSocietyDetails(societyId);
      }, 500);
    }

    setIsEditDataLoaded(true);
  }, [isOpen, mode, initialData, societyOptions]);

  // Auto-generate address (only for create mode)
  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'create') return;
    if (Object.keys(masterOptions).length === 0 && societyOptions.length === 0) return;
    const addr = generateAddress();
    if (addr && addr !== formData.address) {
      setFormData(prev => ({ ...prev, address: addr }));
    }
  }, [isOpen, mode, formData.wing, formData.unitNo, formData.society, formData.floor, formData.location, formData.city, societyOptions, societyDetails]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.propertyType) e.propertyType = 'Property type is required';
    if (!formData.propertySubtype) e.propertySubtype = 'Property subtype is required';
    if (!formData.unitType) e.unitType = 'Unit type is required';
    if (!formData.city) e.city = 'City is required';
    if (!formData.location) e.location = 'Location is required';
    if (!formData.society) e.society = 'Society is required';
    if (!formData.carpetArea) e.carpetArea = 'Carpet area is required';
    if (!formData.budget) e.budget = 'Budget is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🔥 FIXED: buildPayload - properly handle society images
  const buildPayload = (): FormData => {
    const fd = new FormData();
    const textFields: (keyof PropertyFormData)[] = [
      "seller", "propertyType", "propertySubtype", "unitType", "wing", "unitNo",
      "furnishing", "parkingType", "parkingQty", "city", "location", "society",
      "floor", "totalFloors", "carpetArea", "builtupArea", "budget", "address",
      "status", "leadSource", "possessionMonth", "possessionYear",
      "purchaseMonth", "purchaseYear", "sellingRights", "description",
      "bedrooms", "bathrooms", "facing", "balcony", "priceType", "finalPrice",
    ];
    textFields.forEach((k) => fd.append(k, String((formData as any)[k] ?? "")));

    const societyLabel = getLabelFromValue(societyOptions, formData.society);
    const finalSocietyName = societyLabel || formData.society || '';
    fd.append('society_name', finalSocietyName);
    fd.append("amenities", JSON.stringify(formData.amenities || []));
    fd.append("furnishingItems", JSON.stringify(formData.furnishingItems || []));
    fd.append("nearby_places", JSON.stringify(formData.nearby_places || []));

    // 🔥 FIX: Get all existing photo URLs (society images + existing photos)
    const allExistingPhotoUrls = photoPreviews
      .filter(p => p.isExisting)
      .map(p => p.url);

    // Manual upload files
    const manualPhotoFiles = photoPreviews
      .filter(p => !p.isExisting && p.file)
      .map(p => p.file!);

    // 🔥 Send existing photo URLs (includes society images)
    if (allExistingPhotoUrls.length > 0) {
      fd.append("existingPhotoUrls", JSON.stringify(allExistingPhotoUrls));
    }

    if (ownershipDocPreview?.isExisting) {
      fd.append("existingOwnershipDocUrl", ownershipDocPreview.url);
    }

    if (formData.ownershipDoc) {
      fd.append("ownershipDoc", formData.ownershipDoc, formData.ownershipDoc.name);
    }

    // Manual upload files
    manualPhotoFiles.forEach((file) => {
      if (file) fd.append("photos", file, file.name);
    });

    // Debug logs
    console.log("📸 All existing photo URLs:", allExistingPhotoUrls);
    console.log("📤 Manual files:", manualPhotoFiles.length);

    return fd;
  };

  function buildUiPatchFromForm(fd: PropertyFormData, previews: { ownership?: FilePreview | null, photos: FilePreview[] }) {
    // 🔥 All photo URLs (both existing and new)
    const allPhotoUrls = previews.photos.map(p => p.url);

    return {
      seller: fd.seller ? { name: fd.seller } : undefined,
      type: fd.propertyType,
      subtype: fd.propertySubtype,
      unitType: fd.unitType,
      wing: fd.wing,
      unitNo: fd.unitNo,
      furnishing: fd.furnishing,
      furnishingItems: fd.furnishingItems,
      parkingType: fd.parkingType,
      parkingQty: fd.parkingQty,
      city: fd.city,
      location: fd.location,
      society: fd.society,
      floor: fd.floor,
      totalFloors: fd.totalFloors,
      carpetArea: fd.carpetArea,
      builtupArea: fd.builtupArea,
      budget: fd.budget,
      address: fd.address,
      status: fd.status,
      leadSource: fd.leadSource,
      possessionMonth: fd.possessionMonth,
      possessionYear: fd.possessionYear,
      purchaseMonth: fd.purchaseMonth,
      purchaseYear: fd.purchaseYear,
      selling_rights: fd.sellingRights,
      amenities: fd.amenities,
      nearby_places: fd.nearby_places,
      description: fd.description,
      bedrooms: fd.bedrooms,
      bathrooms: fd.bathrooms,
      balcony: fd.balcony,
      facing: fd.facing,
      priceType: fd.priceType,
      finalPrice: fd.finalPrice,
      ownershipDocUrl: previews.ownership?.url,
      ownershipDocName: previews.ownership?.name,
      photos: allPhotoUrls, // ✅ All images combined
      societyImageUrls: fd.societyImageUrls || [],
      updated_at: new Date().toISOString(),
    };
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      setErrorBanner(null);
      const payload = buildPayload();
      if (mode === "edit" && propertyId) {
        await propertiesAPI.updateProperty(String(propertyId), payload);
      } else {
        await propertiesAPI.createProperty(payload);
      }
      await loadProperties();
      const uiPatch = buildUiPatchFromForm(formData, { ownership: ownershipDocPreview, photos: photoPreviews });
      onSubmit(uiPatch);
      window.dispatchEvent(new CustomEvent("overview:refresh", { detail: { id: propertyId } }));
      toast.success(`Property ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      onClose?.();
    } catch (e: any) {
      console.error('❌ SUBMISSION ERROR:', e);
      const msg = e?.response?.data?.message || e?.message || `Failed to ${mode === "edit" ? "update" : "create"} property`;
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getOptions = (key: string): MasterOption[] => {
    if (key === 'society' && societyOptions.length > 0) {
      return societyOptions;
    }
    return masterOptions[key] || masterOptions[key.toLowerCase()] || [];
  };

  const modalTitle = mode === 'edit' ? 'Edit Property' : 'Add New Property';
  const submitButtonText = mode === 'edit' ? 'Update Property' : 'Add Property';
  const SubmitIcon = mode === 'edit' ? Edit : Plus;
  const SafeDropdown: React.FC<any> = (props) => <Dropdown {...props} />;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showHeader={false} showCloseButton={false} width="max-w-[95vw] md:max-w-4xl lg:max-w-5xl">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b rounded-t-lg" style={{ background: N, borderColor: BD }}>
        <div className="flex items-center gap-2">
          {mode === 'edit' ? <Edit size={16} style={{ color: O }} /> : <Plus size={16} style={{ color: O }} />}
          <h2 className="text-sm font-bold text-white">{modalTitle}</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
          <X size={16} style={{ color: 'white' }} />
        </button>
      </div>

      <div className="relative px-4 py-4">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-t-transparent mb-2" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            <p className="text-xs font-semibold text-gray-600">{mode === 'edit' ? 'Updating…' : 'Saving…'}</p>
          </div>
        )}

        {errorBanner && (
          <div className="mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
            <X size={13} className="flex-shrink-0 mt-0.5 text-red-400" />{errorBanner}
          </div>
        )}

        <div className="space-y-4">
          {/* Property Details Section */}
          <SectionHeader>Property Details</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            <Field label="Seller (optional)">
              <input type="text" placeholder="Enter Seller" value={formData.seller} onChange={(e) => handleInputChange('seller', e.target.value)} className={INP} />
            </Field>
            <Field label="Property Type" required error={errors.propertyType}>
              <SafeDropdown placeholder="Select Property Type" options={getOptions('property type')} value={formData.propertyType} onChange={handleDropdownChange('propertyType')} className="w-full" />
            </Field>
            <Field label="Property Subtype" required error={errors.propertySubtype}>
              <SafeDropdown placeholder="Select Property Subtype" options={getOptions('property subtype')} value={formData.propertySubtype} onChange={handleDropdownChange('propertySubtype')} className="w-full" />
            </Field>
            <Field label="Unit Type" required error={errors.unitType}>
              <SafeDropdown placeholder="Select Unit Type" options={getOptions('unit type')} value={formData.unitType} onChange={handleDropdownChange('unitType')} className="w-full" />
            </Field>
            <Field label="Wing">
              <input type="text" placeholder="Wing name/number" value={formData.wing} onChange={(e) => handleInputChange('wing', e.target.value)} className={INP} />
            </Field>
            <Field label="Unit No">
              <input type="text" placeholder="Unit/Flat no" value={formData.unitNo} onChange={(e) => handleInputChange('unitNo', e.target.value)} className={INP} />
            </Field>
            <Field label="Furnishing">
              <SafeDropdown placeholder="Select Furnishing" options={getOptions('furnishing')} value={formData.furnishing} onChange={handleDropdownChange('furnishing')} className="w-full" />
            </Field>
            <Field label="Parking Type">
              <SafeDropdown placeholder="Select Parking Type" options={getOptions('parking type')} value={formData.parkingType} onChange={handleDropdownChange('parkingType')} className="w-full" />
            </Field>
            <Field label="Bedrooms">
              <SafeDropdown placeholder="Select Bedrooms" options={getOptions('bedrooms')} value={formData.bedrooms} onChange={handleDropdownChange('bedrooms')} className="w-full" />
            </Field>
            <Field label="Bathrooms">
              <SafeDropdown placeholder="Select Bathrooms" options={getOptions('bathrooms')} value={formData.bathrooms} onChange={handleDropdownChange('bathrooms')} className="w-full" />
            </Field>
            <Field label="Facing">
              <SafeDropdown placeholder="Select Facing" options={getOptions('facing')} value={formData.facing} onChange={handleDropdownChange('facing')} className="w-full" />
            </Field>
            <Field label="Balcony">
              <SafeDropdown placeholder="Select Balcony" options={getOptions('balcony')} value={formData.balcony} onChange={handleDropdownChange('balcony')} className="w-full" />
            </Field>
            <Field label="Parking Qty">
              <SafeDropdown placeholder="Select Parking Quantity" options={sortNumericOptions(getOptions('parking qty'))} value={formData.parkingQty} onChange={handleDropdownChange('parkingQty')} className="w-full" />
            </Field>
            <Field label="Total Floors">
              <SafeDropdown placeholder="Select Total Floors" options={sortNumericOptions(getOptions('total floors'))} value={formData.totalFloors} onChange={handleDropdownChange('totalFloors')} className="w-full" searchable />
            </Field>
            <Field label="Floor">
              <SafeDropdown placeholder="Select Floor" options={sortNumericOptions(getOptions('floor'))} value={formData.floor} onChange={handleDropdownChange('floor')} className="w-full" searchable />
            </Field>
            <Field label="Property Status">
              <SafeDropdown placeholder="Select Status" options={getOptions('property status')} value={formData.status} onChange={handleDropdownChange('status')} className="w-full" />
            </Field>
          </div>

          {/* Location Section */}
          <SectionHeader>Location</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            <Field label="Society Name" required error={errors.society} className="lg:col-span-2">
              <div className="relative">
                <SafeDropdown
                  placeholder="Select Society"
                  options={societyOptions.length > 0 ? societyOptions : getOptions('society')}
                  value={formData.society}
                  onChange={handleDropdownChange('society')}
                  className="w-full"
                  searchable
                />
                {isLoadingSociety && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </Field>

            <Field label="Location / Locality" required error={errors.location}>
              <input
                type="text"
                placeholder="Enter location / locality"
                value={formData.location}
                readOnly
                className={`${INP} ${errors.location ? 'border-red-400' : ''}`}
              />
            </Field>

            <Field label="City" required error={errors.city}>
              <input
                type="text"
                placeholder="Enter city"
                value={formData.city}
                readOnly
                className={`${INP} ${errors.city ? 'border-red-400' : ''}`}
              />
            </Field>

            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <Field label="Address">
                <textarea
                  placeholder="Auto-filled based on selections (editable) - Includes Pincode"
                  value={formData.address}
                  readOnly
                  rows={2}
                  className={`${INP} h-auto py-1.5 resize-none`}
                />
                {societyDetails?.pincode && (
                  <p className="text-[10px] text-green-600 mt-1">
                    ✓ Pincode: {societyDetails.pincode}
                  </p>
                )}
              </Field>
            </div>
          </div>

          {/* Area & Pricing Section */}
          <SectionHeader>Area & Pricing</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            <Field label="Carpet Area (sq.ft)" required error={errors.carpetArea}>
              <input type="text" placeholder="e.g. 850" value={formData.carpetArea} onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('carpetArea', e.target.value); }} className={`${INP} ${errors.carpetArea ? 'border-red-400' : ''}`} />
            </Field>
            <Field label="Builtup Area (sq.ft)">
              <input type="text" placeholder="e.g. 1050" value={formData.builtupArea} onChange={(e) => { if (/^\d*\.?\d*$/.test(e.target.value) || e.target.value === '') handleInputChange('builtupArea', e.target.value); }} className={INP} />
            </Field>
            <Field label="Lead Source">
              <SafeDropdown placeholder="Lead Source" options={getOptions('lead source')} value={formData.leadSource} onChange={handleDropdownChange('leadSource')} className="w-full" />
            </Field>
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <label className={LBL}>Sell Price (₹) <span className="text-red-400">*</span></label>
              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                <PriceRangeSelector
                  initialMax={
                    formData.budget
                      ? rupeesToCrores(parseBudgetToRupees(formData.budget))
                      : 0
                  }
                  onChange={({ max }) => {
                    const rupeeVal = Math.round(max * 10_000_000);
                    handleInputChange("budget", String(rupeeVal));
                  }}
                />
                <div className="flex items-center gap-4 pt-1">
                  {(['Fixed', 'Negotiable'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="h-3 w-3 rounded accent-orange-500"
                        checked={(formData.priceType) === type}
                        onChange={(e) => handleInputChange('priceType', e.target.checked ? type : "")} />
                      <span className={`text-xs font-semibold ${(formData.priceType) === type ? 'text-gray-800' : 'text-gray-400'}`}>{type}</span>
                    </label>
                  ))}
                </div>
                {formData.priceType === 'Negotiable' && (
                  <div className="pt-2 border-t border-gray-200">
                    <label className={`${LBL} mb-1`}>Final Price (₹)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`${INP} max-w-[180px]`}
                        value={formData.finalPrice || ""}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          handleInputChange("finalPrice", value);
                        }}
                        onBlur={(e) => {
                          const cleanValue = String(
                            Number(e.target.value.replace(/\D/g, "") || 0)
                          );
                          handleInputChange("finalPrice", cleanValue);
                        }}
                      />
                      {(() => {
                        const v = parseBudgetToRupees(formData.finalPrice || '');
                        if (!v || v <= 0) return null;
                        const label = v < 10_000_000 ? `${Math.round(v / 100_000)}L` : `${(v / 10_000_000).toFixed(2)}Cr`;
                        return <span className="text-xs font-bold text-green-700">≈ ₹{label}</span>;
                      })()}
                    </div>
                  </div>
                )}
                {errors.budget && <p className="text-red-400 text-[10px]">{errors.budget}</p>}
              </div>
            </div>
          </div>

          {/* Timeline & Selling Rights */}
          <SectionHeader>Timeline & Selling Rights</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            <PossessionDropdown title="Purchase Month & Year" possessionMonth={formData.purchaseMonth} possessionYear={formData.purchaseYear} onMonthChange={(m) => handleInputChange('purchaseMonth', m)} onYearChange={(y) => handleInputChange('purchaseYear', y)} />
            <PossessionDropdown title="Possession Month & Year" possessionMonth={formData.possessionMonth} possessionYear={formData.possessionYear} onMonthChange={(m) => handleInputChange('possessionMonth', m)} onYearChange={(y) => handleInputChange('possessionYear', y)} />
            <Field label="Selling Rights">
              <SafeDropdown placeholder="Select Selling Rights" options={getOptions('selling rights')} value={formData.sellingRights} onChange={handleDropdownChange('sellingRights')} className="w-full" />
            </Field>
          </div>

          {/* Amenities & Furnishings */}
          <SectionHeader>Amenities & Furnishings</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <MultiSelectDropdown label="Amenities" options={getOptions('amenities')} selectedValues={formData.amenities} onToggle={handleAmenitiesToggle} placeholder="Select amenities…" />
              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {formData.amenities.map((val) => {
                    const opt = getOptions('amenities').find(o => String(o.value) === String(val));
                    return (
                      <span key={val} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {opt?.label || val}
                        <button type="button" onClick={() => handleAmenitiesToggle(val)} className="text-violet-400 hover:text-violet-600 text-xs leading-none">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <MultiSelectDropdown label="Furnishing Items" options={getOptions('furnishing items')} selectedValues={formData.furnishingItems} onToggle={handleFurnishingItemsToggle} placeholder="Select furnishing items…" />
              {formData.furnishingItems.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {formData.furnishingItems.map((val) => {
                    const opt = getOptions('furnishing items').find(o => String(o.value) === String(val));
                    return (
                      <span key={val} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {opt?.label || val}
                        <button type="button" onClick={() => handleFurnishingItemsToggle(val)} className="text-violet-400 hover:text-violet-600 text-xs leading-none">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Nearby Places */}
          <SectionHeader>Nearby Places</SectionHeader>
          <div className="mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 items-end mb-2">
              <Field label="Place Name" className="sm:col-span-1 lg:col-span-1">
                <SafeDropdown placeholder="Select" options={getOptions('place name')} value={nearbyPlaceForm.name} onChange={(v) => handleNearbyPlaceInputChange('name', v)} className="w-full" searchable />
              </Field>
              <Field label="Distance">
                <input type="text" className={INP} placeholder="e.g. 2" value={nearbyPlaceForm.distance} onChange={(e) => handleNearbyPlaceInputChange('distance', e.target.value)} />
              </Field>
              <Field label="Unit">
                <select className={INP} value={nearbyPlaceForm.unit} onChange={(e) => handleNearbyPlaceInputChange('unit', e.target.value)}>
                  <option value="">—</option>
                  <option value="km">km</option>
                  <option value="m">m</option>
                  <option value="min">min</option>
                </select>
              </Field>
              <div className="flex items-end gap-1.5">
                <Field label="Place Type" className="flex-1">
                  <SafeDropdown placeholder="Select" options={getOptions('place type')} value={nearbyPlaceForm.type} onChange={(v) => handleNearbyPlaceInputChange('type', v)} className="w-full" searchable />
                </Field>
                <button type="button" onClick={addNearbyPlace} disabled={!nearbyPlaceForm.name || !nearbyPlaceForm.distance || !nearbyPlaceForm.unit || !nearbyPlaceForm.type} className="flex-shrink-0 h-8 w-8 rounded-md text-white flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed" style={{ background: '#16A34A' }}>
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              {formData.nearby_places.length === 0 ? (
                <div className="text-[11px] text-gray-400 italic py-2 px-3 bg-gray-50 rounded-md border border-dashed border-gray-200 text-center">No nearby places added yet</div>
              ) : (
                formData.nearby_places.map((place, index) => (
                  <div key={index} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="text-xs">
                      <span className="font-semibold text-blue-600">{place.name}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-gray-500">{place.distance} {place.unit}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-green-600 capitalize">{place.type}</span>
                    </div>
                    <button type="button" onClick={() => removeNearbyPlace(index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Documents & Photos */}
          <SectionHeader>Documents & Photos</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Ownership Document */}
            <div>
              <label className={LBL}>Ownership Document</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer group" onClick={() => document.getElementById('ownership-doc-input')?.click()}>
                <input id="ownership-doc-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleOwnershipDocUpload(e.target.files?.[0] || null)} />
                <Upload className="h-5 w-5 text-gray-300 group-hover:text-orange-400 mx-auto mb-1 transition-colors" />
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Click to upload</p>
                <p className="text-[10px] text-gray-400">PDF, JPG, PNG — 10 MB max</p>
              </div>
              {ownershipDocPreview && <div className="mt-2"><FilePreviewComponent preview={ownershipDocPreview} onRemove={removeOwnershipDoc} /></div>}
            </div>

            {/* Property Photos */}
            <div>
              <label className={LBL}>Property Photos</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer group" onClick={() => document.getElementById('property-photos-input')?.click()}>
                <input id="property-photos-input" type="file" accept=".jpg,.jpeg,.png" multiple className="hidden" onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  if (selected.length > 0) {
                    handlePhotosUpload(selected);
                  }
                  e.target.value = "";
                }} />
                <Upload className="h-5 w-5 text-gray-300 group-hover:text-orange-400 mx-auto mb-1 transition-colors" />
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  {photoPreviews.length > 0
                    ? `${photoPreviews.length} file(s) — add more`
                    : 'Click to upload'
                  }
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

          {/* Description via AI */}
          <SectionHeader>Description</SectionHeader>
          <PropertyDescriptionAI
            formData={formData}
            setFormData={(u) => setFormData((p) => u(p))}
            endpoint="/api/ai/generate-description"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <BtnGhost onClick={onClose} disabled={loading}>Cancel</BtnGhost>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="h-7 px-4 rounded-md text-xs font-black text-white flex items-center gap-1.5 disabled:opacity-60 shadow-sm transition-all"
              style={{ background: loading ? '#ccc' : BRAND }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = BRAND_DARK; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = BRAND; }}>
              {loading ? <><span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> {mode === 'edit' ? 'Updating…' : 'Submitting…'}</> : <><SubmitIcon size={11} /> {submitButtonText}</>}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PropertyFormModal;