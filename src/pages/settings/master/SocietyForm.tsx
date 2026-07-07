// // SocietyForm.tsx
// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { Upload, Download, X, Save, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Search, Building2, ChevronDown as ChevronDownIcon } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import { societyAPI } from '@/lib/societyAPI';
// import { masterDataAPI } from '@/lib/mastersAPI';
// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
// import Dropdown from '@/components/ui/Dropdown';
// import { toast } from 'react-toastify';
// import { createPortal } from 'react-dom';

// interface SocietyFormData {
//     societyName: string;
//     locality: string;
//     city: string;
//     pincode: string;
//     amenities?: string[];
// }

// interface ImportValidationResult {
//     data: SocietyFormData;
//     isValid: boolean;
//     isDuplicate?: boolean;
//     errors: string[];
//     rowNumber: number;
// }

// interface SocietyFormProps {
//     initialData?: SocietyFormData | null;
//     onSubmit: (data: SocietyFormData) => Promise<void>;
//     onClose: () => void;
//     isEditing?: boolean;
//     onRefresh?: () => Promise<void>;
// }

// // Helper function to get scroll parents
// function getScrollParents(node: Element | null): Element[] {
//     const parents: Element[] = [];
//     let el = node?.parentElement || null;
//     while (el) {
//         const style = window.getComputedStyle(el);
//         const oy = style.overflowY;
//         if (oy === 'auto' || oy === 'scroll' || el === document.body) parents.push(el);
//         el = el.parentElement;
//     }
//     return parents;
// }

// // Multi-Select Amenities Dropdown Component
// const AmenitiesMultiSelect: React.FC<{
//     options: MasterOption[];
//     selectedValues: string[];
//     onToggle: (value: string) => void;
//     label: string;
//     placeholder?: string;
// }> = ({ options, selectedValues, onToggle, label, placeholder = 'Select amenities...' }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const buttonRef = useRef<HTMLButtonElement | null>(null);
//     const dropdownRef = useRef<HTMLDivElement | null>(null);
//     const [rect, setRect] = useState<DOMRect | null>(null);

//     const filteredOptions = useMemo(
//         () => options.filter((o) => (o.label || '').toLowerCase().includes(searchTerm.toLowerCase())),
//         [options, searchTerm],
//     );

//     const displayText = useMemo(() => {
//         if (selectedValues.length === 0) return placeholder;
//         if (selectedValues.length === 1) {
//             const option = options.find((opt) => String(opt.value) === String(selectedValues[0]));
//             return option?.label || selectedValues[0];
//         }
//         return `${selectedValues.length} items selected`;
//     }, [selectedValues, options, placeholder]);

//     useEffect(() => {
//         if (!isOpen) return;
//         const onDocClick = (e: MouseEvent) => {
//             const target = e.target as Node;
//             if (dropdownRef.current?.contains(target)) return;
//             if (buttonRef.current?.contains(target)) return;
//             setIsOpen(false);
//             setSearchTerm('');
//         };
//         document.addEventListener('mousedown', onDocClick);
//         return () => document.removeEventListener('mousedown', onDocClick);
//     }, [isOpen]);

//     const updateRect = () => {
//         if (!buttonRef.current) return setRect(null);
//         setRect(buttonRef.current.getBoundingClientRect());
//     };

//     useEffect(() => {
//         if (!isOpen) return;
//         updateRect();
//         const onResize = () => updateRect();
//         const onScroll = () => updateRect();
//         window.addEventListener('resize', onResize);
//         window.addEventListener('scroll', onScroll, true);
//         const parents = getScrollParents(buttonRef.current);
//         parents.forEach((p) => p.addEventListener('scroll', onScroll, true));
//         return () => {
//             window.removeEventListener('resize', onResize);
//             window.removeEventListener('scroll', onScroll, true);
//             parents.forEach((p) => p.removeEventListener('scroll', onScroll, true));
//         };
//     }, [isOpen]);

//     useEffect(() => {
//         const prev = document.body.style.overflow;
//         if (isOpen) document.body.style.overflow = 'hidden';
//         else document.body.style.overflow = prev || '';
//         return () => { document.body.style.overflow = prev || ''; };
//     }, [isOpen]);

//     const getPortalTarget = () => {
//         if (typeof document === 'undefined') return null;
//         return document.getElementById('modal-portal') || document.body;
//     };

//     const isModalPortal = typeof document !== 'undefined' && !!document.getElementById('modal-portal');
//     const Z = isModalPortal ? 1050 : 9999999;

//     const popupStyle: any = rect
//         ? { position: 'fixed', zIndex: Z, top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, minWidth: rect.width, maxHeight: '50vh', overflow: 'hidden', pointerEvents: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', borderRadius: '8px' }
//         : { position: 'fixed', zIndex: Z, top: 0, left: 0, minWidth: 200, pointerEvents: 'auto' };

//     const popup = (
//         <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden" style={popupStyle}>
//             <div className="p-2.5 border-b border-gray-100 bg-gray-50">
//                 <div className="relative">
//                     <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search amenities..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
//                         autoFocus
//                     />
//                 </div>
//             </div>
//             <div className="max-h-64 overflow-y-auto">
//                 {filteredOptions.length === 0 ? (
//                     <p className="text-xs text-gray-400 p-3 text-center">No amenities found</p>
//                 ) : (
//                     filteredOptions.map((option) => (
//                         <label
//                             key={String(option.value)}
//                             className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
//                         >
//                             <input
//                                 type="checkbox"
//                                 checked={selectedValues.map(String).includes(String(option.value))}
//                                 onChange={() => onToggle(String(option.value))}
//                                 className="mr-2.5 h-3.5 w-3.5 rounded border-gray-300 accent-orange-500"
//                             />
//                             <span className="text-xs text-gray-700">{option.label}</span>
//                         </label>
//                     ))
//                 )}
//             </div>
//             {selectedValues.length > 0 && (
//                 <div className="px-3 py-1.5 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-600 font-bold">
//                     {selectedValues.length} selected
//                 </div>
//             )}
//         </div>
//     );

//     const portalTarget = typeof document !== 'undefined' ? getPortalTarget() : null;

//     return (
//         <div className="relative">
//             <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">{label}</label>
//             <button
//                 ref={buttonRef}
//                 type="button"
//                 onClick={(e) => { e.stopPropagation(); setIsOpen((p) => !p); setTimeout(updateRect, 0); }}
//                 className="w-full h-9 px-3 rounded-lg text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-all flex items-center justify-between text-left"
//             >
//                 <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>{displayText}</span>
//                 <ChevronDownIcon size={12} className="text-gray-400 flex-shrink-0 ml-1" />
//             </button>
//             {isOpen && buttonRef.current && portalTarget && createPortal(popup, portalTarget)}
//         </div>
//     );
// };

// const SocietyForm: React.FC<SocietyFormProps> = ({
//     initialData,
//     onSubmit,
//     onClose,
//     isEditing = false,
//     onRefresh,
// }) => {
//     const [formData, setFormData] = useState<SocietyFormData>({
//         societyName: '',
//         locality: '',
//         city: '',
//         pincode: '',
//         amenities: [],
//     });

//     // Master data options
//     const [cityOptions, setCityOptions] = useState<MasterOption[]>([]);
//     const [localityOptions, setLocalityOptions] = useState<MasterOption[]>([]);
//     const [amenitiesOptions, setAmenitiesOptions] = useState<MasterOption[]>([]);
//     const [isLoadingMaster, setIsLoadingMaster] = useState(false);

//     const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isImporting, setIsImporting] = useState(false);
//     const [showBulkImport, setShowBulkImport] = useState(false);
//     const [importPreview, setImportPreview] = useState<ImportValidationResult[]>([]);
//     const [existingSocieties, setExistingSocieties] = useState<any[]>([]);
//     const [showValidSection, setShowValidSection] = useState(true);
//     const [showInvalidSection, setShowInvalidSection] = useState(true);
//     const [duplicateError, setDuplicateError] = useState<string | null>(null);
//     const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
//     const [searchSocietyTerm, setSearchSocietyTerm] = useState('');
//     const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
//     const [societyOptions, setSocietyOptions] = useState<MasterOption[]>([]);
//     const [filteredSocietyOptions, setFilteredSocietyOptions] = useState<MasterOption[]>([]);
//     const societyInputRef = useRef<HTMLInputElement>(null);
//     const societyDropdownRef = useRef<HTMLDivElement>(null);

//     // Load master data on mount
//     useEffect(() => {
//         loadMasterData();
//         loadExistingSocieties();
//     }, []);

//     const loadMasterData = async () => {
//         setIsLoadingMaster(true);
//         try {
//             // Fetch city, locality, and amenities from master data
//             const data = await getMasterDropdownOptions(['common', 'property']);

//             // City options
//             const cities = data['city'] || [];
//             setCityOptions(cities);

//             // Locality options - from master data
//             const localities = data['location'] || data['locality'] || [];
//             setLocalityOptions(localities);

//             // Amenities options - from master data
//             const amenities = data['amenities'] || data['common']?.filter((c: any) => c.type === 'amenity') || [];
//             setAmenitiesOptions(amenities);

//             // Society options
//             const societies = await societyAPI.getAllSocieties();
//             const societyOpts = societies.map((s: any) => ({
//                 value: s.societyName,
//                 label: s.societyName
//             }));
//             setSocietyOptions(societyOpts);
//             setFilteredSocietyOptions(societyOpts);
//         } catch (error) {
//             console.error('Error loading master data:', error);
//         } finally {
//             setIsLoadingMaster(false);
//         }
//     };

//     // Filter society options based on search
//     useEffect(() => {
//         const filtered = societyOptions.filter(opt =>
//             opt.label.toLowerCase().includes(
//                 searchSocietyTerm.toLowerCase()
//             )
//         );

//         setFilteredSocietyOptions(filtered);
//     }, [searchSocietyTerm, societyOptions]);

//     // Close dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (societyDropdownRef.current && !societyDropdownRef.current.contains(event.target as Node) &&
//                 societyInputRef.current && !societyInputRef.current.contains(event.target as Node)) {
//                 setShowSocietyDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const loadExistingSocieties = async () => {
//         try {
//             const societies = await societyAPI.getAllSocieties();
//             setExistingSocieties(societies);
//         } catch (error) {
//             console.error('Error loading societies:', error);
//         }
//     };

//     // Initialize form with data for editing
//     useEffect(() => {
//         if (initialData) {
//             setFormData({
//                 societyName: initialData.societyName || '',
//                 locality: initialData.locality || '',
//                 city: initialData.city || '',
//                 pincode: initialData.pincode || '',
//                 amenities: initialData.amenities || [],
//             });
//             setSearchSocietyTerm(initialData.societyName || '');
//         }
//     }, [initialData]);

//     const handleSocietySelect = (society: MasterOption) => {
//         setFormData(prev => ({ ...prev, societyName: society.label }));
//         setSearchSocietyTerm(society.label);
//         setShowSocietyDropdown(false);

//         // Auto-fetch amenities for selected society
//         if (society.label) {
//             fetchAmenitiesForSociety(society.label);
//         }
//     };

//     const fetchAmenitiesForSociety = async (societyName: string) => {
//         try {
//             const existingSociety = existingSocieties.find(
//                 s => s.societyName?.toLowerCase() === societyName.toLowerCase()
//             );

//             if (existingSociety?.amenities && existingSociety.amenities.length > 0) {
//                 setFormData(prev => ({ ...prev, amenities: existingSociety.amenities }));
//                 toast.info(`Loaded ${existingSociety.amenities.length} amenities for "${societyName}"`);
//             }
//         } catch (error) {
//             console.error('Error fetching amenities:', error);
//         }
//     };

//     const handleCitySelect = (value: string) => {
//         setFormData(prev => ({ ...prev, city: value }));
//         // Clear locality error if city is selected
//         if (errors.city) {
//             setErrors(prev => ({ ...prev, city: '' }));
//         }
//     };

//     const handleLocalitySelect = (value: string) => {
//         setFormData(prev => ({ ...prev, locality: value }));
//         // Clear locality error if locality is selected
//         if (errors.locality) {
//             setErrors(prev => ({ ...prev, locality: '' }));
//         }
//     };

//     const handleAmenityToggle = (amenity: string) => {
//         setFormData(prev => ({
//             ...prev,
//             amenities: prev.amenities?.includes(amenity)
//                 ? prev.amenities.filter(a => a !== amenity)
//                 : [...(prev.amenities || []), amenity]
//         }));
//     };

//     // 🔥 UPDATED: Check duplicate based ONLY on Society Name, Locality, and Pincode (City is ignored)
//     const checkDuplicate = async () => {
//         const { societyName, locality, pincode } = formData;

//         // Only check if all three required fields are filled
//         if (!societyName || !locality || !pincode) {
//             setDuplicateError(null);
//             return;
//         }

//         // If editing and values haven't changed, no duplicate error
//         if (isEditing && initialData) {
//             const isSameAsOriginal =
//                 initialData.societyName === societyName &&
//                 initialData.locality === locality &&
//                 initialData.pincode === pincode;

//             if (isSameAsOriginal) {
//                 setDuplicateError(null);
//                 return;
//             }
//         }

//         setIsCheckingDuplicate(true);

//         try {
//             const allSocieties = await societyAPI.getAllSocieties();
//             // Check for duplicate based ONLY on societyName, locality, and pincode
//             const exists = allSocieties.some(society =>
//                 society.societyName?.toLowerCase() === societyName.toLowerCase() &&
//                 society.locality?.toLowerCase() === locality.toLowerCase() &&
//                 society.pincode === pincode
//             );

//             if (exists) {
//                 setDuplicateError(`⚠️ "${societyName}" already exists in ${locality} - ${pincode}`);
//             } else {
//                 setDuplicateError(null);
//             }
//         } catch (error) {
//             console.error('Duplicate check error:', error);
//         } finally {
//             setIsCheckingDuplicate(false);
//         }
//     };

//     // Auto check when societyName, locality, or pincode changes
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (formData.societyName && formData.locality && formData.pincode) {
//                 checkDuplicate();
//             } else {
//                 setDuplicateError(null);
//             }
//         }, 600);
//         return () => clearTimeout(timer);
//     }, [formData.societyName, formData.locality, formData.pincode]);

//     const validateField = (name: keyof SocietyFormData, value: string): string => {
//         switch (name) {
//             case 'societyName':
//                 if (!value.trim()) return 'Society name is required';
//                 if (value.length < 2) return 'Society name must be at least 2 characters';
//                 if (value.length > 100) return 'Society name must be less than 100 characters';
//                 return '';
//             case 'locality':
//                 if (!value.trim()) return 'Locality is required';
//                 if (value.length < 2) return 'Locality must be at least 2 characters';
//                 if (value.length > 100) return 'Locality must be less than 100 characters';
//                 return '';
//             case 'city':
//                 if (!value.trim()) return 'City is required';
//                 if (value.length < 2) return 'City must be at least 2 characters';
//                 if (value.length > 50) return 'City must be less than 50 characters';
//                 return '';
//             case 'pincode':
//                 if (!value.trim()) return 'Pincode is required';
//                 const pincodeRegex = /^[1-9][0-9]{5}$/;
//                 if (!pincodeRegex.test(value)) return 'Enter a valid 6-digit pincode';
//                 return '';
//             default:
//                 return '';
//         }
//     };

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         if (name === 'societyName') {
//             setSearchSocietyTerm(value);
//         }
//         if (errors[name as keyof SocietyFormData]) {
//             setErrors((prev) => ({ ...prev, [name]: '' }));
//         }
//     };

//     const validateForm = (): boolean => {
//         const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};
//         let isValid = true;

//         if (!formData.societyName) {
//             newErrors.societyName = 'Society name is required';
//             isValid = false;
//         }
//         if (!formData.locality) {
//             newErrors.locality = 'Locality is required';
//             isValid = false;
//         }
//         if (!formData.city) {
//             newErrors.city = 'City is required';
//             isValid = false;
//         }
//         if (!formData.pincode) {
//             newErrors.pincode = 'Pincode is required';
//             isValid = false;
//         } else {
//             const pincodeRegex = /^[1-9][0-9]{5}$/;
//             if (!pincodeRegex.test(formData.pincode)) {
//                 newErrors.pincode = 'Enter a valid 6-digit pincode';
//                 isValid = false;
//             }
//         }

//         if (duplicateError) {
//             isValid = false;
//         }

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             if (duplicateError) {
//                 toast.error(duplicateError);
//             }
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             await onSubmit(formData);
//             if (onRefresh) await onRefresh();
//             onClose();
//         } catch (error: any) {
//             console.error('Submission error:', error);
//             if (error.response?.status === 409) {
//                 toast.error(error.response?.data?.error || 'Society already exists!');
//             } else {
//                 toast.error('Failed to save society');
//             }
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // 🔥 UPDATED: Import validation - duplicate check based on Society Name, Locality, and Pincode only
//     const validateImportData = (data: SocietyFormData, rowNumber: number): ImportValidationResult => {
//         const errors: string[] = [];
//         let isDuplicate = false;

//         if (!data.societyName) errors.push('Society name is required');
//         else if (data.societyName.length < 2) errors.push('Society name must be at least 2 characters');
//         else if (data.societyName.length > 100) errors.push('Society name must be less than 100 characters');

//         if (!data.locality) errors.push('Locality is required');
//         else if (data.locality.length < 2) errors.push('Locality must be at least 2 characters');
//         else if (data.locality.length > 100) errors.push('Locality must be less than 100 characters');

//         if (!data.city) errors.push('City is required');
//         else if (data.city.length < 2) errors.push('City must be at least 2 characters');
//         else if (data.city.length > 50) errors.push('City must be less than 50 characters');

//         const pincodeRegex = /^[1-9][0-9]{5}$/;
//         if (!data.pincode) errors.push('Pincode is required');
//         else if (!pincodeRegex.test(data.pincode)) errors.push('Invalid pincode format');

//         // 🔥 Duplicate check: ONLY Society Name + Locality + Pincode (City is ignored for duplicate detection)
//         if (data.societyName && data.locality && data.pincode && pincodeRegex.test(data.pincode)) {
//             const isDuplicateRecord = existingSocieties.some(existing =>
//                 existing.societyName?.toLowerCase() === data.societyName.toLowerCase() &&
//                 existing.locality?.toLowerCase() === data.locality.toLowerCase() &&
//                 existing.pincode === data.pincode
//             );
//             if (isDuplicateRecord) {
//                 isDuplicate = true;
//                 errors.push('Duplicate record already exists (Same Society Name, Locality & Pincode)');
//             }
//         }

//         return { data, isValid: errors.length === 0, isDuplicate, errors, rowNumber };
//     };

//     const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         setIsImporting(true);
//         const reader = new FileReader();
//         reader.onload = async (e) => {
//             try {
//                 const data = new Uint8Array(e.target?.result as ArrayBuffer);
//                 const workbook = XLSX.read(data, { type: 'array' });
//                 const sheetName = workbook.SheetNames[0];
//                 const worksheet = workbook.Sheets[sheetName];
//                 const jsonData = XLSX.utils.sheet_to_json(worksheet);

//                 const validatedData: ImportValidationResult[] = [];
//                 for (let i = 0; i < jsonData.length; i++) {
//                     const row: any = jsonData[i];
//                     const societyData: SocietyFormData = {
//                         societyName: row['Society Name'] || row.societyName || '',
//                         locality: row['Locality'] || row.locality || '',
//                         city: row['City'] || row.city || '',
//                         pincode: String(row['Pincode'] || row.pincode || ''),
//                         amenities: row['Amenities'] ? String(row['Amenities']).split(',').map((a: string) => a.trim()) : [],
//                     };
//                     validatedData.push(validateImportData(societyData, i + 2));
//                 }

//                 setImportPreview(validatedData);
//                 setShowBulkImport(true);
//                 toast.info(`Found ${validatedData.filter(v => v.isValid).length} valid records`);
//             } catch (error) {
//                 toast.error('Failed to parse Excel file');
//             } finally {
//                 setIsImporting(false);
//             }
//         };
//         reader.readAsArrayBuffer(file);
//         event.target.value = '';
//     };

//     const confirmBulkImport = async () => {
//         try {
//             setIsImporting(true);
//             let successCount = 0;
//             let errorCount = 0;
//             const validItems = importPreview.filter(v => v.isValid);
//             const duplicateItems = importPreview.filter(v => v.isDuplicate);
//             const invalidItems = importPreview.filter(v => !v.isValid && !v.isDuplicate);

//             // Show duplicate items warning
//             if (duplicateItems.length > 0) {
//                 const duplicateNames = duplicateItems.map(item => item.data.societyName).slice(0, 5);
//                 toast.warning(`⚠️ Skipping ${duplicateItems.length} duplicate societies: ${duplicateNames.join(', ')}`);
//             }

//             // Show invalid items warning
//             if (invalidItems.length > 0) {
//                 toast.warning(`Skipping ${invalidItems.length} invalid records due to validation errors`);
//             }

//             for (const item of validItems) {
//                 try {
//                     await societyAPI.createSociety(item.data);
//                     successCount++;
//                 } catch (err) {
//                     errorCount++;
//                     console.error('Import error:', err);
//                 }
//             }

//             // Show summary
//             if (successCount > 0) {
//                 toast.success(`✅ Imported ${successCount} new societies`);
//             }
//             if (duplicateItems.length > 0) {
//                 toast.warning(`⚠️ Skipped ${duplicateItems.length} duplicate societies`);
//             }
//             if (invalidItems.length > 0) {
//                 toast.warning(`⚠️ Skipped ${invalidItems.length} invalid records`);
//             }
//             if (errorCount > 0) {
//                 toast.error(`❌ Failed to import ${errorCount} societies`);
//             }

//             if (onRefresh) await onRefresh();
//             setShowBulkImport(false);
//             setImportPreview([]);
//             onClose();
//         } catch (error) {
//             toast.error('Failed to import societies');
//         } finally {
//             setIsImporting(false);
//         }
//     };

//     const handleExport = async () => {
//         try {
//             const blob = await societyAPI.exportSocieties();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `societies_${new Date().toISOString().split('T')[0]}.xlsx`;
//             link.click();
//             URL.revokeObjectURL(url);
//             toast.success('Societies exported successfully!');
//         } catch (error) {
//             toast.error('Export failed');
//         }
//     };

//     const downloadSample = () => {
//         const sampleData = [
//             { 'Society Name': 'Green Valley Residency', 'Locality': 'Hinjewadi Phase 1', 'City': 'Pune', 'Pincode': 411057, 'Amenities': 'Parking, Security, Gym' },
//             { 'Society Name': 'Sunshine Heights', 'Locality': 'Baner', 'City': 'Pune', 'Pincode': 411045, 'Amenities': 'Swimming Pool, Clubhouse, WiFi' },
//         ];
//         const worksheet = XLSX.utils.json_to_sheet(sampleData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
//         XLSX.writeFile(workbook, 'sample_societies.xlsx');
//         toast.info('Sample file downloaded');
//     };

//     const getInputClassName = (fieldName: keyof SocietyFormData) => {
//         const baseClass = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
//         if (duplicateError && fieldName === 'societyName') {
//             return `${baseClass} border-red-500 bg-red-50`;
//         }
//         return errors[fieldName]
//             ? `${baseClass} border-red-500 bg-red-50`
//             : `${baseClass} border-gray-300 focus:border-blue-500`;
//     };

//     const validItems = importPreview.filter(v => v.isValid);
//     const validCount = validItems.length;
//     const duplicateCount = importPreview.filter(v => v.isDuplicate).length;
//     const invalidCount = importPreview.filter(v => !v.isValid && !v.isDuplicate).length;

//     return (
//         <div className="max-w-4xl mx-auto">
//             {/* Custom Header */}
//             <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
//                 <div className="flex items-center gap-2">
//                     <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
//                     <h2 className="text-sm font-bold text-white">
//                         {isEditing ? "Edit Society" : "Add New Society"}
//                     </h2>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <label className="p-1.5 rounded text-white hover:bg-white/10 transition-colors cursor-pointer">
//                         <Upload size={16} />
//                         <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImport} disabled={isImporting} />
//                     </label>
//                     <button type="button" onClick={handleExport} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
//                         <Download size={16} />
//                     </button>
//                     <button type="button" onClick={downloadSample} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
//                         <FileSpreadsheet size={16} />
//                     </button>
//                     <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors ml-2">
//                         <X size={16} color="white" />
//                     </button>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit}>
//                 {isImporting && (
//                     <div className="m-4 p-3 bg-blue-50 rounded-lg text-center">
//                         <div className="animate-spin inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
//                         <span className="text-sm text-blue-600">Processing...</span>
//                     </div>
//                 )}

//                 {isLoadingMaster && (
//                     <div className="mx-6 mt-4 p-2 bg-blue-50 rounded-lg">
//                         <div className="flex items-center justify-center gap-2">
//                             <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
//                             <span className="text-xs text-blue-600">Loading master data...</span>
//                         </div>
//                     </div>
//                 )}

//                 {duplicateError && (
//                     <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                         <p className="text-sm text-red-600 flex items-center gap-2">
//                             <X size={16} className="text-red-500" />
//                             {duplicateError}
//                         </p>
//                     </div>
//                 )}

//                 <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* Society Name - Searchable Dropdown */}
//                         <div className="relative">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Society Name <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     ref={societyInputRef}
//                                     type="text"
//                                     name="societyName"
//                                     value={searchSocietyTerm}
//                                     onChange={handleInputChange}
//                                     onClick={() => {
//                                         setFilteredSocietyOptions(societyOptions);
//                                         setShowSocietyDropdown(true);
//                                     }}
//                                     className={getInputClassName('societyName')}
//                                     autoComplete="off"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowSocietyDropdown(true)}
//                                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                                 >
//                                     <Search size={16} className="text-gray-400" />
//                                 </button>                            </div>
//                             {showSocietyDropdown && filteredSocietyOptions.length > 0 && (
//                                 <div ref={societyDropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                     {filteredSocietyOptions.map((option) => (
//                                         <button
//                                             key={option.value}
//                                             type="button"
//                                             onClick={() => handleSocietySelect(option)}
//                                             className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
//                                         >
//                                             <Building2 size={14} className="text-gray-400" />
//                                             {option.label}
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                             {errors.societyName && <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>}
//                         </div>

//                         {/* Locality - Dropdown from Master */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Locality <span className="text-red-500">*</span>
//                             </label>
//                             <Dropdown
//                                 placeholder="Select locality"
//                                 options={localityOptions}
//                                 value={formData.locality}
//                                 onChange={handleLocalitySelect}
//                                 className="w-full"
//                                 searchable
//                             />
//                             {errors.locality && <p className="mt-1 text-xs text-red-500">{errors.locality}</p>}
//                         </div>

//                         {/* City - Dropdown from Master */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 City <span className="text-red-500">*</span>
//                             </label>
//                             <Dropdown
//                                 placeholder="Select city"
//                                 options={cityOptions}
//                                 value={formData.city}
//                                 onChange={handleCitySelect}
//                                 className="w-full"
//                                 searchable
//                             />
//                             {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
//                         </div>

//                         {/* Pincode - Input */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Pincode <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="pincode"
//                                 value={formData.pincode}
//                                 onChange={handleInputChange}
//                                 placeholder="Enter 6-digit pincode"
//                                 maxLength={6}
//                                 className={getInputClassName('pincode')}
//                             />
//                             {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
//                             <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
//                         </div>
//                     </div>

//                     {/* Amenities Section - Multi-Select Dropdown */}
//                     <div className="mt-6">
//                         <AmenitiesMultiSelect
//                             label="AMENITIES"
//                             options={amenitiesOptions}
//                             selectedValues={formData.amenities || []}
//                             onToggle={handleAmenityToggle}
//                             placeholder="Select amenities..."
//                         />

//                         {/* Selected Amenities Tags */}
//                         {formData.amenities && formData.amenities.length > 0 && (
//                             <div className="mt-3 flex flex-wrap gap-2">
//                                 {formData.amenities.map(amenity => (
//                                     <span key={amenity} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full text-xs text-purple-700 border border-purple-200">
//                                         {amenity}
//                                         <button
//                                             type="button"
//                                             onClick={() => handleAmenityToggle(amenity)}
//                                             className="text-purple-400 hover:text-purple-600"
//                                         >
//                                             <X size={12} />
//                                         </button>
//                                     </span>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//                         <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
//                             Cancel
//                         </button>
//                         <button type="submit" disabled={isSubmitting || isCheckingDuplicate || !!duplicateError} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
//                             {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
//                             <Save size={16} />
//                             {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Society' : 'Save Society')}
//                         </button>
//                     </div>
//                 </div>
//             </form>

//             {/* Bulk Import Preview Modal with Separate Sections */}
//             {showBulkImport && importPreview.length > 0 && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
//                         <div className="flex justify-between items-center p-4 border-b">
//                             <h3 className="text-lg font-semibold">Import Preview & Validation</h3>
//                             <button onClick={() => setShowBulkImport(false)} className="p-1 hover:bg-gray-100 rounded">
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         {/* Summary Stats */}
//                         <div className="flex gap-6 p-4 bg-gray-50 border-b">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                                 <span className="text-sm">Valid: <strong>{validCount}</strong></span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//                                 <span className="text-sm">Duplicate: <strong>{duplicateCount}</strong></span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                                 <span className="text-sm">Invalid: <strong>{invalidCount}</strong></span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-gray-500"></div>
//                                 <span className="text-sm">Total: <strong>{importPreview.length}</strong></span>
//                             </div>
//                         </div>

//                         <div className="flex-1 overflow-auto p-4">
//                             {/* ✅ VALID RECORDS SECTION */}
//                             {validItems.length > 0 && (
//                                 <div className="mb-6">
//                                     <button
//                                         onClick={() => setShowValidSection(!showValidSection)}
//                                         className="flex items-center gap-2 w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
//                                     >
//                                         {showValidSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                                         <CheckCircle size={18} className="text-green-600" />
//                                         <span className="font-semibold text-green-700">Valid Records ({validItems.length})</span>
//                                         <span className="text-xs text-green-600 ml-auto">Click to {showValidSection ? 'collapse' : 'expand'}</span>
//                                     </button>

//                                     {showValidSection && (
//                                         <div className="mt-3 overflow-x-auto">
//                                             <table className="min-w-full text-sm border-collapse">
//                                                 <thead className="bg-green-100 sticky top-0">
//                                                     <tr>
//                                                         <th className="p-2 text-left w-16 border-b">Row</th>
//                                                         <th className="p-2 text-left border-b">Society Name</th>
//                                                         <th className="p-2 text-left border-b">Locality</th>
//                                                         <th className="p-2 text-left border-b">City</th>
//                                                         <th className="p-2 text-left w-24 border-b">Pincode</th>
//                                                         <th className="p-2 text-left w-32 border-b">Amenities</th>
//                                                         <th className="p-2 text-left w-24 border-b">Status</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {validItems.map((item, idx) => (
//                                                         <tr key={idx} className="border-b hover:bg-green-50/50">
//                                                             <td className="p-2 text-gray-500">{item.rowNumber}</td>
//                                                             <td className="p-2 font-medium">{item.data.societyName}</td>
//                                                             <td className="p-2">{item.data.locality}</td>
//                                                             <td className="p-2">{item.data.city}</td>
//                                                             <td className="p-2">{item.data.pincode}</td>
//                                                             <td className="p-2 text-xs text-gray-500">{item.data.amenities?.join(', ') || '-'}</td>
//                                                             <td className="p-2">
//                                                                 <span className="inline-flex items-center gap-1 text-green-600">
//                                                                     <CheckCircle size={14} /> Valid
//                                                                 </span>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* ❌ INVALID RECORDS SECTION */}
//                             {(invalidCount > 0 || duplicateCount > 0) && (
//                                 <div>
//                                     <button
//                                         onClick={() => setShowInvalidSection(!showInvalidSection)}
//                                         className="flex items-center gap-2 w-full p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
//                                     >
//                                         {showInvalidSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                                         <XCircle size={18} className="text-red-600" />
//                                         <span className="font-semibold text-red-700">Invalid Records ({invalidCount + duplicateCount})</span>
//                                         <span className="text-xs text-red-600 ml-auto">Click to {showInvalidSection ? 'collapse' : 'expand'}</span>
//                                     </button>

//                                     {showInvalidSection && (
//                                         <div className="mt-3 overflow-x-auto">
//                                             <table className="min-w-full text-sm border-collapse">
//                                                 <thead className="bg-red-100 sticky top-0">
//                                                     <tr>
//                                                         <th className="p-2 text-left w-16 border-b">Row</th>
//                                                         <th className="p-2 text-left border-b">Society Name</th>
//                                                         <th className="p-2 text-left border-b">Locality</th>
//                                                         <th className="p-2 text-left border-b">City</th>
//                                                         <th className="p-2 text-left w-24 border-b">Pincode</th>
//                                                         <th className="p-2 text-left w-32 border-b">Amenities</th>
//                                                         <th className="p-2 text-left w-28 border-b">Status</th>
//                                                         <th className="p-2 text-left border-b">Errors</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {importPreview.filter(v => !v.isValid).map((item, idx) => (
//                                                         <tr key={idx} className={`border-b ${item.isDuplicate ? 'bg-yellow-50/50' : 'bg-red-50/50'}`}>
//                                                             <td className="p-2 text-gray-500">{item.rowNumber}</td>
//                                                             <td className="p-2 font-medium">{item.data.societyName || '-'}</td>
//                                                             <td className="p-2">{item.data.locality || '-'}</td>
//                                                             <td className="p-2">{item.data.city || '-'}</td>
//                                                             <td className="p-2">{item.data.pincode || '-'}</td>
//                                                             <td className="p-2 text-xs text-gray-500">{item.data.amenities?.join(', ') || '-'}</td>
//                                                             <td className="p-2">
//                                                                 {item.isDuplicate ? (
//                                                                     <span className="inline-flex items-center gap-1 text-yellow-600">
//                                                                         <AlertCircle size={14} /> Duplicate
//                                                                     </span>
//                                                                 ) : (
//                                                                     <span className="inline-flex items-center gap-1 text-red-600">
//                                                                         <XCircle size={14} /> Invalid
//                                                                     </span>
//                                                                 )}
//                                                             </td>
//                                                             <td className="p-2">
//                                                                 {item.errors.length > 0 && (
//                                                                     <div className="space-y-0.5">
//                                                                         {item.errors.map((err, errIdx) => (
//                                                                             <p key={errIdx} className={`text-xs flex items-center gap-1 ${err.includes('Duplicate') ? 'text-yellow-600' : 'text-red-500'}`}>
//                                                                                 <AlertCircle size={10} /> {err}
//                                                                             </p>
//                                                                         ))}
//                                                                     </div>
//                                                                 )}
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex justify-between items-center gap-3 p-4 border-t bg-gray-50">
//                             <div className="text-sm text-gray-600">
//                                 {validCount} records will be imported, {duplicateCount + invalidCount} records will be skipped
//                             </div>
//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => setShowBulkImport(false)}
//                                     className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={confirmBulkImport}
//                                     disabled={isImporting || validCount === 0}
//                                     className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
//                                 >
//                                     {isImporting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
//                                     Import {validCount} Valid Records
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SocietyForm;

// // SocietyForm.tsx
// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { Upload, Download, X, Save, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Search, Building2, ChevronDown as ChevronDownIcon, Image, Trash2, Loader2 } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import { societyAPI } from '@/lib/societyAPI';
// import { masterDataAPI } from '@/lib/mastersAPI';
// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
// import Dropdown from '@/components/ui/Dropdown';
// import { toast } from 'react-toastify';
// import { createPortal } from 'react-dom';

// interface SocietyFormData {
//     societyName: string;
//     locality: string;
//     city: string;
//     pincode: string;
//     amenities?: string[];
//     images?: File[];
//     imageUrls?: string[];
// }

// interface ImportValidationResult {
//     data: SocietyFormData;
//     isValid: boolean;
//     isDuplicate?: boolean;
//     errors: string[];
//     rowNumber: number;
// }

// interface SocietyFormProps {
//     initialData?: SocietyFormData | null;
//     onSubmit: (data: SocietyFormData) => Promise<void>;
//     onClose: () => void;
//     isEditing?: boolean;
//     onRefresh?: () => Promise<void>;
// }

// // Helper function to get scroll parents
// function getScrollParents(node: Element | null): Element[] {
//     const parents: Element[] = [];
//     let el = node?.parentElement || null;
//     while (el) {
//         const style = window.getComputedStyle(el);
//         const oy = style.overflowY;
//         if (oy === 'auto' || oy === 'scroll' || el === document.body) parents.push(el);
//         el = el.parentElement;
//     }
//     return parents;
// }

// // Multi-Select Amenities Dropdown Component
// const AmenitiesMultiSelect: React.FC<{
//     options: MasterOption[];
//     selectedValues: string[];
//     onToggle: (value: string) => void;
//     label: string;
//     placeholder?: string;
// }> = ({ options, selectedValues, onToggle, label, placeholder = 'Select amenities...' }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const buttonRef = useRef<HTMLButtonElement | null>(null);
//     const dropdownRef = useRef<HTMLDivElement | null>(null);
//     const [rect, setRect] = useState<DOMRect | null>(null);

//     const filteredOptions = useMemo(
//         () => options.filter((o) => (o.label || '').toLowerCase().includes(searchTerm.toLowerCase())),
//         [options, searchTerm],
//     );

//     const displayText = useMemo(() => {
//         if (selectedValues.length === 0) return placeholder;
//         if (selectedValues.length === 1) {
//             const option = options.find((opt) => String(opt.value) === String(selectedValues[0]));
//             return option?.label || selectedValues[0];
//         }
//         return `${selectedValues.length} items selected`;
//     }, [selectedValues, options, placeholder]);

//     useEffect(() => {
//         if (!isOpen) return;
//         const onDocClick = (e: MouseEvent) => {
//             const target = e.target as Node;
//             if (dropdownRef.current?.contains(target)) return;
//             if (buttonRef.current?.contains(target)) return;
//             setIsOpen(false);
//             setSearchTerm('');
//         };
//         document.addEventListener('mousedown', onDocClick);
//         return () => document.removeEventListener('mousedown', onDocClick);
//     }, [isOpen]);

//     const updateRect = () => {
//         if (!buttonRef.current) return setRect(null);
//         setRect(buttonRef.current.getBoundingClientRect());
//     };

//     useEffect(() => {
//         if (!isOpen) return;
//         updateRect();
//         const onResize = () => updateRect();
//         const onScroll = () => updateRect();
//         window.addEventListener('resize', onResize);
//         window.addEventListener('scroll', onScroll, true);
//         const parents = getScrollParents(buttonRef.current);
//         parents.forEach((p) => p.addEventListener('scroll', onScroll, true));
//         return () => {
//             window.removeEventListener('resize', onResize);
//             window.removeEventListener('scroll', onScroll, true);
//             parents.forEach((p) => p.removeEventListener('scroll', onScroll, true));
//         };
//     }, [isOpen]);

//     useEffect(() => {
//         const prev = document.body.style.overflow;
//         if (isOpen) document.body.style.overflow = 'hidden';
//         else document.body.style.overflow = prev || '';
//         return () => { document.body.style.overflow = prev || ''; };
//     }, [isOpen]);

//     const getPortalTarget = () => {
//         if (typeof document === 'undefined') return null;
//         return document.getElementById('modal-portal') || document.body;
//     };

//     const isModalPortal = typeof document !== 'undefined' && !!document.getElementById('modal-portal');
//     const Z = isModalPortal ? 1050 : 9999999;

//     const popupStyle: any = rect
//         ? { position: 'fixed', zIndex: Z, top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, minWidth: rect.width, maxHeight: '50vh', overflow: 'hidden', pointerEvents: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', borderRadius: '8px' }
//         : { position: 'fixed', zIndex: Z, top: 0, left: 0, minWidth: 200, pointerEvents: 'auto' };

//     const popup = (
//         <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden" style={popupStyle}>
//             <div className="p-2.5 border-b border-gray-100 bg-gray-50">
//                 <div className="relative">
//                     <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search amenities..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
//                         autoFocus
//                     />
//                 </div>
//             </div>
//             <div className="max-h-64 overflow-y-auto">
//                 {filteredOptions.length === 0 ? (
//                     <p className="text-xs text-gray-400 p-3 text-center">No amenities found</p>
//                 ) : (
//                     filteredOptions.map((option) => (
//                         <label
//                             key={String(option.value)}
//                             className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
//                         >
//                             <input
//                                 type="checkbox"
//                                 checked={selectedValues.map(String).includes(String(option.value))}
//                                 onChange={() => onToggle(String(option.value))}
//                                 className="mr-2.5 h-3.5 w-3.5 rounded border-gray-300 accent-orange-500"
//                             />
//                             <span className="text-xs text-gray-700">{option.label}</span>
//                         </label>
//                     ))
//                 )}
//             </div>
//             {selectedValues.length > 0 && (
//                 <div className="px-3 py-1.5 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-600 font-bold">
//                     {selectedValues.length} selected
//                 </div>
//             )}
//         </div>
//     );

//     const portalTarget = typeof document !== 'undefined' ? getPortalTarget() : null;

//     return (
//         <div className="relative">
//             <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">{label}</label>
//             <button
//                 ref={buttonRef}
//                 type="button"
//                 onClick={(e) => { e.stopPropagation(); setIsOpen((p) => !p); setTimeout(updateRect, 0); }}
//                 className="w-full h-9 px-3 rounded-lg text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-all flex items-center justify-between text-left"
//             >
//                 <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>{displayText}</span>
//                 <ChevronDownIcon size={12} className="text-gray-400 flex-shrink-0 ml-1" />
//             </button>
//             {isOpen && buttonRef.current && portalTarget && createPortal(popup, portalTarget)}
//         </div>
//     );
// };

// const SocietyForm: React.FC<SocietyFormProps> = ({
//     initialData,
//     onSubmit,
//     onClose,
//     isEditing = false,
//     onRefresh,
// }) => {
//     const [formData, setFormData] = useState<SocietyFormData>({
//         societyName: '',
//         locality: '',
//         city: '',
//         pincode: '',
//         amenities: [],
//         images: [],
//         imageUrls: [],
//     });

//     // 🆕 Image states
//     const [imagePreviews, setImagePreviews] = useState<string[]>([]);
//     const [isUploadingImages, setIsUploadingImages] = useState(false);
//     const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     // Master data options
//     const [cityOptions, setCityOptions] = useState<MasterOption[]>([]);
//     const [localityOptions, setLocalityOptions] = useState<MasterOption[]>([]);
//     const [amenitiesOptions, setAmenitiesOptions] = useState<MasterOption[]>([]);
//     const [isLoadingMaster, setIsLoadingMaster] = useState(false);

//     const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isImporting, setIsImporting] = useState(false);
//     const [showBulkImport, setShowBulkImport] = useState(false);
//     const [importPreview, setImportPreview] = useState<ImportValidationResult[]>([]);
//     const [existingSocieties, setExistingSocieties] = useState<any[]>([]);
//     const [showValidSection, setShowValidSection] = useState(true);
//     const [showInvalidSection, setShowInvalidSection] = useState(true);
//     const [duplicateError, setDuplicateError] = useState<string | null>(null);
//     const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
//     const [searchSocietyTerm, setSearchSocietyTerm] = useState('');
//     const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
//     const [societyOptions, setSocietyOptions] = useState<MasterOption[]>([]);
//     const [filteredSocietyOptions, setFilteredSocietyOptions] = useState<MasterOption[]>([]);
//     const societyInputRef = useRef<HTMLInputElement>(null);
//     const societyDropdownRef = useRef<HTMLDivElement>(null);

//     // Load master data on mount
//     useEffect(() => {
//         loadMasterData();
//         loadExistingSocieties();
//     }, []);

//     const loadMasterData = async () => {
//         setIsLoadingMaster(true);
//         try {
//             const data = await getMasterDropdownOptions(['common', 'property']);

//             const cities = data['city'] || [];
//             setCityOptions(cities);

//             const localities = data['location'] || data['locality'] || [];
//             setLocalityOptions(localities);

//             const amenities = data['amenities'] || data['common']?.filter((c: any) => c.type === 'amenity') || [];
//             setAmenitiesOptions(amenities);

//             const societies = await societyAPI.getAllSocieties();
//             const societyOpts = societies.map((s: any) => ({
//                 value: s.societyName,
//                 label: s.societyName
//             }));
//             setSocietyOptions(societyOpts);
//             setFilteredSocietyOptions(societyOpts);
//         } catch (error) {
//             console.error('Error loading master data:', error);
//         } finally {
//             setIsLoadingMaster(false);
//         }
//     };

//     // Filter society options based on search
//     useEffect(() => {
//         const filtered = societyOptions.filter(opt =>
//             opt.label.toLowerCase().includes(searchSocietyTerm.toLowerCase())
//         );
//         setFilteredSocietyOptions(filtered);
//     }, [searchSocietyTerm, societyOptions]);

//     // Close dropdown when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (societyDropdownRef.current && !societyDropdownRef.current.contains(event.target as Node) &&
//                 societyInputRef.current && !societyInputRef.current.contains(event.target as Node)) {
//                 setShowSocietyDropdown(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const loadExistingSocieties = async () => {
//         try {
//             const societies = await societyAPI.getAllSocieties();
//             setExistingSocieties(societies);
//         } catch (error) {
//             console.error('Error loading societies:', error);
//         }
//     };

//     // Initialize form with data for editing
//     useEffect(() => {
//         if (initialData) {
//             setFormData({
//                 societyName: initialData.societyName || '',
//                 locality: initialData.locality || '',
//                 city: initialData.city || '',
//                 pincode: initialData.pincode || '',
//                 amenities: initialData.amenities || [],
//                 images: [],
//                 imageUrls: initialData.imageUrls || [],
//             });
//             setSearchSocietyTerm(initialData.societyName || '');

//             // Set image previews from existing images
//             if (initialData.imageUrls && initialData.imageUrls.length > 0) {
//                 setImagePreviews(initialData.imageUrls);
//                 setExistingImageUrls(initialData.imageUrls);
//             }
//         }
//     }, [initialData]);

//     // 🆕 Handle image upload
//     const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const files = event.target.files;
//         if (!files) return;

//         const newFiles: File[] = [];
//         const newPreviews: string[] = [];

//         for (let i = 0; i < files.length; i++) {
//             const file = files[i];
//             if (file.type.startsWith('image/')) {
//                 newFiles.push(file);
//                 newPreviews.push(URL.createObjectURL(file));
//             }
//         }

//         if (newFiles.length === 0) {
//             toast.warning('Please select valid image files');
//             return;
//         }

//         setFormData(prev => ({
//             ...prev,
//             images: [...(prev.images || []), ...newFiles],
//             imageUrls: [...(prev.imageUrls || []), ...newPreviews],
//         }));
//         setImagePreviews(prev => [...prev, ...newPreviews]);

//         // Reset input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }

//         toast.success(`${newFiles.length} image(s) selected`);
//     };

//     // 🆕 Remove image
//     const removeImage = (index: number) => {
//         const imageUrl = formData.imageUrls?.[index];

//         // If it's a new image (blob URL), revoke it
//         if (imageUrl?.startsWith('blob:')) {
//             URL.revokeObjectURL(imageUrl);
//         }

//         setFormData(prev => ({
//             ...prev,
//             images: prev.images?.filter((_, i) => i !== index) || [],
//             imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || [],
//         }));
//         setImagePreviews(prev => prev.filter((_, i) => i !== index));

//         // If it was an existing image, remove from existing list
//         if (existingImageUrls[index]) {
//             setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
//         }
//     };

//     const handleSocietySelect = (society: MasterOption) => {
//         setFormData(prev => ({ ...prev, societyName: society.label }));
//         setSearchSocietyTerm(society.label);
//         setShowSocietyDropdown(false);

//         if (society.label) {
//             fetchAmenitiesForSociety(society.label);
//         }
//     };

//     const fetchAmenitiesForSociety = async (societyName: string) => {
//         try {
//             const existingSociety = existingSocieties.find(
//                 s => s.societyName?.toLowerCase() === societyName.toLowerCase()
//             );

//             if (existingSociety?.amenities && existingSociety.amenities.length > 0) {
//                 setFormData(prev => ({ ...prev, amenities: existingSociety.amenities }));
//                 toast.info(`Loaded ${existingSociety.amenities.length} amenities for "${societyName}"`);
//             }
//         } catch (error) {
//             console.error('Error fetching amenities:', error);
//         }
//     };

//     const handleCitySelect = (value: string) => {
//         setFormData(prev => ({ ...prev, city: value }));
//         if (errors.city) {
//             setErrors(prev => ({ ...prev, city: '' }));
//         }
//     };

//     const handleLocalitySelect = (value: string) => {
//         setFormData(prev => ({ ...prev, locality: value }));
//         if (errors.locality) {
//             setErrors(prev => ({ ...prev, locality: '' }));
//         }
//     };

//     const handleAmenityToggle = (amenity: string) => {
//         setFormData(prev => ({
//             ...prev,
//             amenities: prev.amenities?.includes(amenity)
//                 ? prev.amenities.filter(a => a !== amenity)
//                 : [...(prev.amenities || []), amenity]
//         }));
//     };

//     const checkDuplicate = async () => {
//         const { societyName, locality, pincode } = formData;

//         if (!societyName || !locality || !pincode) {
//             setDuplicateError(null);
//             return;
//         }

//         if (isEditing && initialData) {
//             const isSameAsOriginal =
//                 initialData.societyName === societyName &&
//                 initialData.locality === locality &&
//                 initialData.pincode === pincode;

//             if (isSameAsOriginal) {
//                 setDuplicateError(null);
//                 return;
//             }
//         }

//         setIsCheckingDuplicate(true);

//         try {
//             const allSocieties = await societyAPI.getAllSocieties();
//             const exists = allSocieties.some(society =>
//                 society.societyName?.toLowerCase() === societyName.toLowerCase() &&
//                 society.locality?.toLowerCase() === locality.toLowerCase() &&
//                 society.pincode === pincode
//             );

//             if (exists) {
//                 setDuplicateError(`⚠️ "${societyName}" already exists in ${locality} - ${pincode}`);
//             } else {
//                 setDuplicateError(null);
//             }
//         } catch (error) {
//             console.error('Duplicate check error:', error);
//         } finally {
//             setIsCheckingDuplicate(false);
//         }
//     };

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (formData.societyName && formData.locality && formData.pincode) {
//                 checkDuplicate();
//             } else {
//                 setDuplicateError(null);
//             }
//         }, 600);
//         return () => clearTimeout(timer);
//     }, [formData.societyName, formData.locality, formData.pincode]);

//     const validateField = (name: keyof SocietyFormData, value: string): string => {
//         switch (name) {
//             case 'societyName':
//                 if (!value.trim()) return 'Society name is required';
//                 if (value.length < 2) return 'Society name must be at least 2 characters';
//                 if (value.length > 100) return 'Society name must be less than 100 characters';
//                 return '';
//             case 'locality':
//                 if (!value.trim()) return 'Locality is required';
//                 if (value.length < 2) return 'Locality must be at least 2 characters';
//                 if (value.length > 100) return 'Locality must be less than 100 characters';
//                 return '';
//             case 'city':
//                 if (!value.trim()) return 'City is required';
//                 if (value.length < 2) return 'City must be at least 2 characters';
//                 if (value.length > 50) return 'City must be less than 50 characters';
//                 return '';
//             case 'pincode':
//                 if (!value.trim()) return 'Pincode is required';
//                 const pincodeRegex = /^[1-9][0-9]{5}$/;
//                 if (!pincodeRegex.test(value)) return 'Enter a valid 6-digit pincode';
//                 return '';
//             default:
//                 return '';
//         }
//     };

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         if (name === 'societyName') {
//             setSearchSocietyTerm(value);
//         }
//         if (errors[name as keyof SocietyFormData]) {
//             setErrors((prev) => ({ ...prev, [name]: '' }));
//         }
//     };

//     const validateForm = (): boolean => {
//         const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};
//         let isValid = true;

//         if (!formData.societyName) {
//             newErrors.societyName = 'Society name is required';
//             isValid = false;
//         }
//         if (!formData.locality) {
//             newErrors.locality = 'Locality is required';
//             isValid = false;
//         }
//         if (!formData.city) {
//             newErrors.city = 'City is required';
//             isValid = false;
//         }
//         if (!formData.pincode) {
//             newErrors.pincode = 'Pincode is required';
//             isValid = false;
//         } else {
//             const pincodeRegex = /^[1-9][0-9]{5}$/;
//             if (!pincodeRegex.test(formData.pincode)) {
//                 newErrors.pincode = 'Enter a valid 6-digit pincode';
//                 isValid = false;
//             }
//         }

//         if (duplicateError) {
//             isValid = false;
//         }

//         setErrors(newErrors);
//         return isValid;
//     };

//     // 🆕 Upload society images
//     const uploadSocietyImages = async (societyId: string, images: File[]) => {
//         if (!images || images.length === 0) return;

//         try {
//             setIsUploadingImages(true);
//             const formData = new FormData();
//             images.forEach(file => formData.append('images', file));

//             await societyAPI.uploadSocietyImages(societyId, formData);
//             toast.success(`${images.length} image(s) uploaded successfully`);

//             if (onRefresh) await onRefresh();
//         } catch (error) {
//             console.error('Error uploading images:', error);
//             toast.error('Failed to upload images');
//         } finally {
//             setIsUploadingImages(false);
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             if (duplicateError) {
//                 toast.error(duplicateError);
//             }
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             // Create/update society without images first
//             const societyData = {
//                 societyName: formData.societyName,
//                 locality: formData.locality,
//                 city: formData.city,
//                 pincode: formData.pincode,
//                 amenities: formData.amenities || [],
//             };

//             // If editing, we might have an ID
//             if (isEditing && initialData) {
//                 // For edit, we need to get the society ID
//                 const allSocieties = await societyAPI.getAllSocieties();
//                 const existingSociety = allSocieties.find(
//                     (s: any) => s.societyName === formData.societyName
//                 );

//                 if (existingSociety && formData.images && formData.images.length > 0) {
//                     await uploadSocietyImages(existingSociety.id, formData.images);
//                 }
//             }

//             await onSubmit(societyData);

//             // After create, upload images
//             if (!isEditing && formData.images && formData.images.length > 0) {
//                 const allSocieties = await societyAPI.getAllSocieties();
//                 const createdSociety = allSocieties.find(
//                     (s: any) => s.societyName === formData.societyName
//                 );

//                 if (createdSociety) {
//                     await uploadSocietyImages(createdSociety.id, formData.images);
//                 }
//             }

//             if (onRefresh) await onRefresh();
//             onClose();
//         } catch (error: any) {
//             console.error('Submission error:', error);
//             if (error.response?.status === 409) {
//                 toast.error(error.response?.data?.error || 'Society already exists!');
//             } else {
//                 toast.error('Failed to save society');
//             }
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const validateImportData = (data: SocietyFormData, rowNumber: number): ImportValidationResult => {
//         const errors: string[] = [];
//         let isDuplicate = false;

//         if (!data.societyName) errors.push('Society name is required');
//         else if (data.societyName.length < 2) errors.push('Society name must be at least 2 characters');
//         else if (data.societyName.length > 100) errors.push('Society name must be less than 100 characters');

//         if (!data.locality) errors.push('Locality is required');
//         else if (data.locality.length < 2) errors.push('Locality must be at least 2 characters');
//         else if (data.locality.length > 100) errors.push('Locality must be less than 100 characters');

//         if (!data.city) errors.push('City is required');
//         else if (data.city.length < 2) errors.push('City must be at least 2 characters');
//         else if (data.city.length > 50) errors.push('City must be less than 50 characters');

//         const pincodeRegex = /^[1-9][0-9]{5}$/;
//         if (!data.pincode) errors.push('Pincode is required');
//         else if (!pincodeRegex.test(data.pincode)) errors.push('Invalid pincode format');

//         if (data.societyName && data.locality && data.pincode && pincodeRegex.test(data.pincode)) {
//             const isDuplicateRecord = existingSocieties.some(existing =>
//                 existing.societyName?.toLowerCase() === data.societyName.toLowerCase() &&
//                 existing.locality?.toLowerCase() === data.locality.toLowerCase() &&
//                 existing.pincode === data.pincode
//             );
//             if (isDuplicateRecord) {
//                 isDuplicate = true;
//                 errors.push('Duplicate record already exists (Same Society Name, Locality & Pincode)');
//             }
//         }

//         return { data, isValid: errors.length === 0, isDuplicate, errors, rowNumber };
//     };

//     const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         setIsImporting(true);
//         const reader = new FileReader();
//         reader.onload = async (e) => {
//             try {
//                 const data = new Uint8Array(e.target?.result as ArrayBuffer);
//                 const workbook = XLSX.read(data, { type: 'array' });
//                 const sheetName = workbook.SheetNames[0];
//                 const worksheet = workbook.Sheets[sheetName];
//                 const jsonData = XLSX.utils.sheet_to_json(worksheet);

//                 const validatedData: ImportValidationResult[] = [];
//                 for (let i = 0; i < jsonData.length; i++) {
//                     const row: any = jsonData[i];
//                     const societyData: SocietyFormData = {
//                         societyName: row['Society Name'] || row.societyName || '',
//                         locality: row['Locality'] || row.locality || '',
//                         city: row['City'] || row.city || '',
//                         pincode: String(row['Pincode'] || row.pincode || ''),
//                         amenities: row['Amenities'] ? String(row['Amenities']).split(',').map((a: string) => a.trim()) : [],
//                         images: [],
//                         imageUrls: [],
//                     };
//                     validatedData.push(validateImportData(societyData, i + 2));
//                 }

//                 setImportPreview(validatedData);
//                 setShowBulkImport(true);
//                 toast.info(`Found ${validatedData.filter(v => v.isValid).length} valid records`);
//             } catch (error) {
//                 toast.error('Failed to parse Excel file');
//             } finally {
//                 setIsImporting(false);
//             }
//         };
//         reader.readAsArrayBuffer(file);
//         event.target.value = '';
//     };

//     const confirmBulkImport = async () => {
//         try {
//             setIsImporting(true);
//             let successCount = 0;
//             let errorCount = 0;
//             const validItems = importPreview.filter(v => v.isValid);
//             const duplicateItems = importPreview.filter(v => v.isDuplicate);
//             const invalidItems = importPreview.filter(v => !v.isValid && !v.isDuplicate);

//             if (duplicateItems.length > 0) {
//                 const duplicateNames = duplicateItems.map(item => item.data.societyName).slice(0, 5);
//                 toast.warning(`⚠️ Skipping ${duplicateItems.length} duplicate societies: ${duplicateNames.join(', ')}`);
//             }

//             if (invalidItems.length > 0) {
//                 toast.warning(`Skipping ${invalidItems.length} invalid records due to validation errors`);
//             }

//             for (const item of validItems) {
//                 try {
//                     await societyAPI.createSociety(item.data);
//                     successCount++;
//                 } catch (err) {
//                     errorCount++;
//                     console.error('Import error:', err);
//                 }
//             }

//             if (successCount > 0) {
//                 toast.success(`✅ Imported ${successCount} new societies`);
//             }
//             if (duplicateItems.length > 0) {
//                 toast.warning(`⚠️ Skipped ${duplicateItems.length} duplicate societies`);
//             }
//             if (invalidItems.length > 0) {
//                 toast.warning(`⚠️ Skipped ${invalidItems.length} invalid records`);
//             }
//             if (errorCount > 0) {
//                 toast.error(`❌ Failed to import ${errorCount} societies`);
//             }

//             if (onRefresh) await onRefresh();
//             setShowBulkImport(false);
//             setImportPreview([]);
//             onClose();
//         } catch (error) {
//             toast.error('Failed to import societies');
//         } finally {
//             setIsImporting(false);
//         }
//     };

//     const handleExport = async () => {
//         try {
//             const blob = await societyAPI.exportSocieties();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `societies_${new Date().toISOString().split('T')[0]}.xlsx`;
//             link.click();
//             URL.revokeObjectURL(url);
//             toast.success('Societies exported successfully!');
//         } catch (error) {
//             toast.error('Export failed');
//         }
//     };

//     const downloadSample = () => {
//         const sampleData = [
//             { 'Society Name': 'Green Valley Residency', 'Locality': 'Hinjewadi Phase 1', 'City': 'Pune', 'Pincode': 411057, 'Amenities': 'Parking, Security, Gym' },
//             { 'Society Name': 'Sunshine Heights', 'Locality': 'Baner', 'City': 'Pune', 'Pincode': 411045, 'Amenities': 'Swimming Pool, Clubhouse, WiFi' },
//         ];
//         const worksheet = XLSX.utils.json_to_sheet(sampleData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
//         XLSX.writeFile(workbook, 'sample_societies.xlsx');
//         toast.info('Sample file downloaded');
//     };

//     const getInputClassName = (fieldName: keyof SocietyFormData) => {
//         const baseClass = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
//         if (duplicateError && fieldName === 'societyName') {
//             return `${baseClass} border-red-500 bg-red-50`;
//         }
//         return errors[fieldName]
//             ? `${baseClass} border-red-500 bg-red-50`
//             : `${baseClass} border-gray-300 focus:border-blue-500`;
//     };

//     const validItems = importPreview.filter(v => v.isValid);
//     const validCount = validItems.length;
//     const duplicateCount = importPreview.filter(v => v.isDuplicate).length;
//     const invalidCount = importPreview.filter(v => !v.isValid && !v.isDuplicate).length;

//     return (
//         <div className="max-w-4xl mx-auto">
//             {/* Custom Header */}
//             <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
//                 <div className="flex items-center gap-2">
//                     <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
//                     <h2 className="text-sm font-bold text-white">
//                         {isEditing ? "Edit Society" : "Add New Society"}
//                     </h2>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <label className="p-1.5 rounded text-white hover:bg-white/10 transition-colors cursor-pointer">
//                         <Upload size={16} />
//                         <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImport} disabled={isImporting} />
//                     </label>
//                     <button type="button" onClick={handleExport} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
//                         <Download size={16} />
//                     </button>
//                     <button type="button" onClick={downloadSample} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
//                         <FileSpreadsheet size={16} />
//                     </button>
//                     <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors ml-2">
//                         <X size={16} color="white" />
//                     </button>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit}>
//                 {isImporting && (
//                     <div className="m-4 p-3 bg-blue-50 rounded-lg text-center">
//                         <div className="animate-spin inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
//                         <span className="text-sm text-blue-600">Processing...</span>
//                     </div>
//                 )}

//                 {isLoadingMaster && (
//                     <div className="mx-6 mt-4 p-2 bg-blue-50 rounded-lg">
//                         <div className="flex items-center justify-center gap-2">
//                             <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
//                             <span className="text-xs text-blue-600">Loading master data...</span>
//                         </div>
//                     </div>
//                 )}

//                 {duplicateError && (
//                     <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                         <p className="text-sm text-red-600 flex items-center gap-2">
//                             <X size={16} className="text-red-500" />
//                             {duplicateError}
//                         </p>
//                     </div>
//                 )}

//                 <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {/* Society Name - Searchable Dropdown */}
//                         <div className="relative">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Society Name <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     ref={societyInputRef}
//                                     type="text"
//                                     name="societyName"
//                                     value={searchSocietyTerm}
//                                     onChange={handleInputChange}
//                                     onClick={() => {
//                                         setFilteredSocietyOptions(societyOptions);
//                                         setShowSocietyDropdown(true);
//                                     }}
//                                     className={getInputClassName('societyName')}
//                                     autoComplete="off"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowSocietyDropdown(true)}
//                                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                                 >
//                                     <Search size={16} className="text-gray-400" />
//                                 </button>
//                             </div>
//                             {showSocietyDropdown && filteredSocietyOptions.length > 0 && (
//                                 <div ref={societyDropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                     {filteredSocietyOptions.map((option) => (
//                                         <button
//                                             key={option.value}
//                                             type="button"
//                                             onClick={() => handleSocietySelect(option)}
//                                             className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
//                                         >
//                                             <Building2 size={14} className="text-gray-400" />
//                                             {option.label}
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                             {errors.societyName && <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>}
//                         </div>

//                         {/* Locality - Dropdown from Master */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Locality <span className="text-red-500">*</span>
//                             </label>
//                             <Dropdown
//                                 placeholder="Select locality"
//                                 options={localityOptions}
//                                 value={formData.locality}
//                                 onChange={handleLocalitySelect}
//                                 className="w-full"
//                                 searchable
//                             />
//                             {errors.locality && <p className="mt-1 text-xs text-red-500">{errors.locality}</p>}
//                         </div>

//                         {/* City - Dropdown from Master */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 City <span className="text-red-500">*</span>
//                             </label>
//                             <Dropdown
//                                 placeholder="Select city"
//                                 options={cityOptions}
//                                 value={formData.city}
//                                 onChange={handleCitySelect}
//                                 className="w-full"
//                                 searchable
//                             />
//                             {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
//                         </div>

//                         {/* Pincode - Input */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Pincode <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="pincode"
//                                 value={formData.pincode}
//                                 onChange={handleInputChange}
//                                 placeholder="Enter 6-digit pincode"
//                                 maxLength={6}
//                                 className={getInputClassName('pincode')}
//                             />
//                             {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
//                             <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
//                         </div>
//                     </div>

//                     {/* Amenities Section - Multi-Select Dropdown */}
//                     <div className="mt-6">
//                         <AmenitiesMultiSelect
//                             label="AMENITIES"
//                             options={amenitiesOptions}
//                             selectedValues={formData.amenities || []}
//                             onToggle={handleAmenityToggle}
//                             placeholder="Select amenities..."
//                         />

//                         {/* Selected Amenities Tags */}
//                         {formData.amenities && formData.amenities.length > 0 && (
//                             <div className="mt-3 flex flex-wrap gap-2">
//                                 {formData.amenities.map(amenity => (
//                                     <span key={amenity} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full text-xs text-purple-700 border border-purple-200">
//                                         {amenity}
//                                         <button
//                                             type="button"
//                                             onClick={() => handleAmenityToggle(amenity)}
//                                             className="text-purple-400 hover:text-purple-600"
//                                         >
//                                             <X size={12} />
//                                         </button>
//                                     </span>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* 🆕 IMAGES SECTION */}
//                     <div className="mt-6 pt-4 border-t border-gray-200">
//                         <div className="flex items-center justify-between mb-3">
//                             <label className="block text-sm font-medium text-gray-700">
//                                 Society Images
//                             </label>
//                             <button
//                                 type="button"
//                                 onClick={() => fileInputRef.current?.click()}
//                                 disabled={isUploadingImages}
//                                 className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
//                             >
//                                 {isUploadingImages ? (
//                                     <Loader2 size={14} className="animate-spin" />
//                                 ) : (
//                                     <Upload size={14} />
//                                 )}
//                                 {isUploadingImages ? 'Uploading...' : 'Upload Images'}
//                             </button>
//                         </div>

//                         <input
//                             ref={fileInputRef}
//                             type="file"
//                             accept="image/*"
//                             multiple
//                             onChange={handleImageUpload}
//                             className="hidden"
//                         />

//                         {/* Image Preview Grid */}
//                         {imagePreviews.length > 0 ? (
//                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
//                                 {imagePreviews.map((preview, index) => (
//                                     <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
//                                         <img
//                                             src={preview}
//                                             alt={`Society ${index + 1}`}
//                                             className="w-full h-full object-cover"
//                                             onError={(e) => {
//                                                 (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
//                                             }}
//                                         />
//                                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
//                                             <button
//                                                 type="button"
//                                                 onClick={() => removeImage(index)}
//                                                 className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all"
//                                             >
//                                                 <Trash2 size={14} />
//                                             </button>
//                                         </div>
//                                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
//                                             <p className="text-white text-[10px] truncate">
//                                                 Image {index + 1}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div
//                                 className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer"
//                                 onClick={() => fileInputRef.current?.click()}
//                             >
//                                 <Image size={32} className="mx-auto text-gray-300 mb-2" />
//                                 <p className="text-sm text-gray-500">Click or drag to upload images</p>
//                                 <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB each)</p>
//                             </div>
//                         )}

//                         {isUploadingImages && (
//                             <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
//                                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
//                                 <span className="text-xs text-blue-600">Uploading images...</span>
//                             </div>
//                         )}
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//                         <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
//                             Cancel
//                         </button>
//                         <button type="submit" disabled={isSubmitting || isCheckingDuplicate || !!duplicateError} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
//                             {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
//                             <Save size={16} />
//                             {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Society' : 'Save Society')}
//                         </button>
//                     </div>
//                 </div>
//             </form>

//             {/* Bulk Import Preview Modal with Separate Sections */}
//             {showBulkImport && importPreview.length > 0 && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
//                         <div className="flex justify-between items-center p-4 border-b">
//                             <h3 className="text-lg font-semibold">Import Preview & Validation</h3>
//                             <button onClick={() => setShowBulkImport(false)} className="p-1 hover:bg-gray-100 rounded">
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         {/* Summary Stats */}
//                         <div className="flex gap-6 p-4 bg-gray-50 border-b">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                                 <span className="text-sm">Valid: <strong>{validCount}</strong></span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
//                                 <span className="text-sm">Duplicate: <strong>{duplicateCount}</strong></span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                                 <span className="text-sm">Invalid: <strong>{invalidCount}</strong></span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-gray-500"></div>
//                                 <span className="text-sm">Total: <strong>{importPreview.length}</strong></span>
//                             </div>
//                         </div>

//                         <div className="flex-1 overflow-auto p-4">
//                             {/* ✅ VALID RECORDS SECTION */}
//                             {validItems.length > 0 && (
//                                 <div className="mb-6">
//                                     <button
//                                         onClick={() => setShowValidSection(!showValidSection)}
//                                         className="flex items-center gap-2 w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
//                                     >
//                                         {showValidSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                                         <CheckCircle size={18} className="text-green-600" />
//                                         <span className="font-semibold text-green-700">Valid Records ({validItems.length})</span>
//                                         <span className="text-xs text-green-600 ml-auto">Click to {showValidSection ? 'collapse' : 'expand'}</span>
//                                     </button>

//                                     {showValidSection && (
//                                         <div className="mt-3 overflow-x-auto">
//                                             <table className="min-w-full text-sm border-collapse">
//                                                 <thead className="bg-green-100 sticky top-0">
//                                                     <tr>
//                                                         <th className="p-2 text-left w-16 border-b">Row</th>
//                                                         <th className="p-2 text-left border-b">Society Name</th>
//                                                         <th className="p-2 text-left border-b">Locality</th>
//                                                         <th className="p-2 text-left border-b">City</th>
//                                                         <th className="p-2 text-left w-24 border-b">Pincode</th>
//                                                         <th className="p-2 text-left w-32 border-b">Amenities</th>
//                                                         <th className="p-2 text-left w-24 border-b">Status</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {validItems.map((item, idx) => (
//                                                         <tr key={idx} className="border-b hover:bg-green-50/50">
//                                                             <td className="p-2 text-gray-500">{item.rowNumber}</td>
//                                                             <td className="p-2 font-medium">{item.data.societyName}</td>
//                                                             <td className="p-2">{item.data.locality}</td>
//                                                             <td className="p-2">{item.data.city}</td>
//                                                             <td className="p-2">{item.data.pincode}</td>
//                                                             <td className="p-2 text-xs text-gray-500">{item.data.amenities?.join(', ') || '-'}</td>
//                                                             <td className="p-2">
//                                                                 <span className="inline-flex items-center gap-1 text-green-600">
//                                                                     <CheckCircle size={14} /> Valid
//                                                                 </span>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* ❌ INVALID RECORDS SECTION */}
//                             {(invalidCount > 0 || duplicateCount > 0) && (
//                                 <div>
//                                     <button
//                                         onClick={() => setShowInvalidSection(!showInvalidSection)}
//                                         className="flex items-center gap-2 w-full p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
//                                     >
//                                         {showInvalidSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                                         <XCircle size={18} className="text-red-600" />
//                                         <span className="font-semibold text-red-700">Invalid Records ({invalidCount + duplicateCount})</span>
//                                         <span className="text-xs text-red-600 ml-auto">Click to {showInvalidSection ? 'collapse' : 'expand'}</span>
//                                     </button>

//                                     {showInvalidSection && (
//                                         <div className="mt-3 overflow-x-auto">
//                                             <table className="min-w-full text-sm border-collapse">
//                                                 <thead className="bg-red-100 sticky top-0">
//                                                     <tr>
//                                                         <th className="p-2 text-left w-16 border-b">Row</th>
//                                                         <th className="p-2 text-left border-b">Society Name</th>
//                                                         <th className="p-2 text-left border-b">Locality</th>
//                                                         <th className="p-2 text-left border-b">City</th>
//                                                         <th className="p-2 text-left w-24 border-b">Pincode</th>
//                                                         <th className="p-2 text-left w-32 border-b">Amenities</th>
//                                                         <th className="p-2 text-left w-28 border-b">Status</th>
//                                                         <th className="p-2 text-left border-b">Errors</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {importPreview.filter(v => !v.isValid).map((item, idx) => (
//                                                         <tr key={idx} className={`border-b ${item.isDuplicate ? 'bg-yellow-50/50' : 'bg-red-50/50'}`}>
//                                                             <td className="p-2 text-gray-500">{item.rowNumber}</td>
//                                                             <td className="p-2 font-medium">{item.data.societyName || '-'}</td>
//                                                             <td className="p-2">{item.data.locality || '-'}</td>
//                                                             <td className="p-2">{item.data.city || '-'}</td>
//                                                             <td className="p-2">{item.data.pincode || '-'}</td>
//                                                             <td className="p-2 text-xs text-gray-500">{item.data.amenities?.join(', ') || '-'}</td>
//                                                             <td className="p-2">
//                                                                 {item.isDuplicate ? (
//                                                                     <span className="inline-flex items-center gap-1 text-yellow-600">
//                                                                         <AlertCircle size={14} /> Duplicate
//                                                                     </span>
//                                                                 ) : (
//                                                                     <span className="inline-flex items-center gap-1 text-red-600">
//                                                                         <XCircle size={14} /> Invalid
//                                                                     </span>
//                                                                 )}
//                                                             </td>
//                                                             <td className="p-2">
//                                                                 {item.errors.length > 0 && (
//                                                                     <div className="space-y-0.5">
//                                                                         {item.errors.map((err, errIdx) => (
//                                                                             <p key={errIdx} className={`text-xs flex items-center gap-1 ${err.includes('Duplicate') ? 'text-yellow-600' : 'text-red-500'}`}>
//                                                                                 <AlertCircle size={10} /> {err}
//                                                                             </p>
//                                                                         ))}
//                                                                     </div>
//                                                                 )}
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex justify-between items-center gap-3 p-4 border-t bg-gray-50">
//                             <div className="text-sm text-gray-600">
//                                 {validCount} records will be imported, {duplicateCount + invalidCount} records will be skipped
//                             </div>
//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => setShowBulkImport(false)}
//                                     className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={confirmBulkImport}
//                                     disabled={isImporting || validCount === 0}
//                                     className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
//                                 >
//                                     {isImporting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
//                                     Import {validCount} Valid Records
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SocietyForm;



// SocietyForm.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Upload, Download, X, Save, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, Search, Building2, ChevronDown as ChevronDownIcon, Image, Trash2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { societyAPI } from '@/lib/societyAPI';
import { masterDataAPI } from '@/lib/mastersAPI';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import Dropdown from '@/components/ui/Dropdown';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';

interface SocietyFormData {
    societyName: string;
    locality: string;
    city: string;
    pincode: string;
    amenities?: string[];
    images?: File[];
    imageUrls?: string[];
}

interface ImportValidationResult {
    data: SocietyFormData;
    isValid: boolean;
    isDuplicate?: boolean;
    errors: string[];
    rowNumber: number;
}

interface SocietyFormProps {
    initialData?: SocietyFormData | null;
    onSubmit: (data: SocietyFormData) => Promise<void>;
    onClose: () => void;
    isEditing?: boolean;
    onRefresh?: () => Promise<void>;
}

// Helper function to get scroll parents
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

// Multi-Select Amenities Dropdown Component
const AmenitiesMultiSelect: React.FC<{
    options: MasterOption[];
    selectedValues: string[];
    onToggle: (value: string) => void;
    label: string;
    placeholder?: string;
}> = ({ options, selectedValues, onToggle, label, placeholder = 'Select amenities...' }) => {
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
        ? { position: 'fixed', zIndex: Z, top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, minWidth: rect.width, maxHeight: '50vh', overflow: 'hidden', pointerEvents: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', borderRadius: '8px' }
        : { position: 'fixed', zIndex: Z, top: 0, left: 0, minWidth: 200, pointerEvents: 'auto' };

    const popup = (
        <div ref={dropdownRef} className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden" style={popupStyle}>
            <div className="p-2.5 border-b border-gray-100 bg-gray-50">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search amenities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                        autoFocus
                    />
                </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                    <p className="text-xs text-gray-400 p-3 text-center">No amenities found</p>
                ) : (
                    filteredOptions.map((option) => (
                        <label
                            key={String(option.value)}
                            className="flex items-center px-3 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedValues.map(String).includes(String(option.value))}
                                onChange={() => onToggle(String(option.value))}
                                className="mr-2.5 h-3.5 w-3.5 rounded border-gray-300 accent-orange-500"
                            />
                            <span className="text-xs text-gray-700">{option.label}</span>
                        </label>
                    ))
                )}
            </div>
            {selectedValues.length > 0 && (
                <div className="px-3 py-1.5 bg-orange-50 border-t border-orange-100 text-[10px] text-orange-600 font-bold">
                    {selectedValues.length} selected
                </div>
            )}
        </div>
    );

    const portalTarget = typeof document !== 'undefined' ? getPortalTarget() : null;

    return (
        <div className="relative">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-600 mb-1">{label}</label>
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOpen((p) => !p); setTimeout(updateRect, 0); }}
                className="w-full h-9 px-3 rounded-lg text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-all flex items-center justify-between text-left"
            >
                <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>{displayText}</span>
                <ChevronDownIcon size={12} className="text-gray-400 flex-shrink-0 ml-1" />
            </button>
            {isOpen && buttonRef.current && portalTarget && createPortal(popup, portalTarget)}
        </div>
    );
};

const SocietyForm: React.FC<SocietyFormProps> = ({
    initialData,
    onSubmit,
    onClose,
    isEditing = false,
    onRefresh,
}) => {
    const [formData, setFormData] = useState<SocietyFormData>({
        societyName: '',
        locality: '',
        city: '',
        pincode: '',
        amenities: [],
        images: [],
        imageUrls: [],
    });

    // 🆕 Image states
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Master data options
    const [cityOptions, setCityOptions] = useState<MasterOption[]>([]);
    const [localityOptions, setLocalityOptions] = useState<MasterOption[]>([]);
    const [amenitiesOptions, setAmenitiesOptions] = useState<MasterOption[]>([]);
    const [isLoadingMaster, setIsLoadingMaster] = useState(false);

    const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [importPreview, setImportPreview] = useState<ImportValidationResult[]>([]);
    const [existingSocieties, setExistingSocieties] = useState<any[]>([]);
    const [showValidSection, setShowValidSection] = useState(true);
    const [showInvalidSection, setShowInvalidSection] = useState(true);
    const [duplicateError, setDuplicateError] = useState<string | null>(null);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
    const [searchSocietyTerm, setSearchSocietyTerm] = useState('');
    const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
    const [societyOptions, setSocietyOptions] = useState<MasterOption[]>([]);
    const [filteredSocietyOptions, setFilteredSocietyOptions] = useState<MasterOption[]>([]);
    const societyInputRef = useRef<HTMLInputElement>(null);
    const societyDropdownRef = useRef<HTMLDivElement>(null);

    // Load master data on mount
    useEffect(() => {
        loadMasterData();
        loadExistingSocieties();
    }, []);

    const loadMasterData = async () => {
        setIsLoadingMaster(true);
        try {
            const data = await getMasterDropdownOptions(['common', 'property']);

            const cities = data['city'] || [];
            setCityOptions(cities);

            const localities = data['location'] || data['locality'] || [];
            setLocalityOptions(localities);

            const amenities = data['amenities'] || data['common']?.filter((c: any) => c.type === 'amenity') || [];
            setAmenitiesOptions(amenities);

            const societies = await societyAPI.getAllSocieties();
            const societyOpts = societies.map((s: any) => ({
                value: s.societyName,
                label: s.societyName
            }));
            setSocietyOptions(societyOpts);
            setFilteredSocietyOptions(societyOpts);
        } catch (error) {
            console.error('Error loading master data:', error);
        } finally {
            setIsLoadingMaster(false);
        }
    };

    // Filter society options based on search
    useEffect(() => {
        const filtered = societyOptions.filter(opt =>
            opt.label.toLowerCase().includes(searchSocietyTerm.toLowerCase())
        );
        setFilteredSocietyOptions(filtered);
    }, [searchSocietyTerm, societyOptions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (societyDropdownRef.current && !societyDropdownRef.current.contains(event.target as Node) &&
                societyInputRef.current && !societyInputRef.current.contains(event.target as Node)) {
                setShowSocietyDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadExistingSocieties = async () => {
        try {
            const societies = await societyAPI.getAllSocieties();
            setExistingSocieties(societies);
        } catch (error) {
            console.error('Error loading societies:', error);
        }
    };

    // Initialize form with data for editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                societyName: initialData.societyName || '',
                locality: initialData.locality || '',
                city: initialData.city || '',
                pincode: initialData.pincode || '',
                amenities: initialData.amenities || [],
                images: [],
                imageUrls: initialData.imageUrls || [],
            });
            setSearchSocietyTerm(initialData.societyName || '');

            // Set image previews from existing images
            if (initialData.imageUrls && initialData.imageUrls.length > 0) {
                setImagePreviews(initialData.imageUrls);
                setExistingImageUrls(initialData.imageUrls);
            }
        }
    }, [initialData]);

    // 🆕 Handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles: File[] = [];
        const newPreviews: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                newFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            }
        }

        if (newFiles.length === 0) {
            toast.warning('Please select valid image files');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newFiles],
            imageUrls: [...(prev.imageUrls || []), ...newPreviews],
        }));
        setImagePreviews(prev => [...prev, ...newPreviews]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        toast.success(`${newFiles.length} image(s) selected`);
    };

    // 🆕 Remove image
    const removeImage = (index: number) => {
        const imageUrl = formData.imageUrls?.[index];

        // If it's a new image (blob URL), revoke it
        if (imageUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }

        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index) || [],
            imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || [],
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        // If it was an existing image, remove from existing list
        if (existingImageUrls[index]) {
            setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSocietySelect = (society: MasterOption) => {
        setFormData(prev => ({ ...prev, societyName: society.label }));
        setSearchSocietyTerm(society.label);
        setShowSocietyDropdown(false);

        if (society.label) {
            fetchAmenitiesForSociety(society.label);
        }
    };

    const fetchAmenitiesForSociety = async (societyName: string) => {
        try {
            const existingSociety = existingSocieties.find(
                s => s.societyName?.toLowerCase() === societyName.toLowerCase()
            );

            if (existingSociety?.amenities && existingSociety.amenities.length > 0) {
                setFormData(prev => ({ ...prev, amenities: existingSociety.amenities }));
                toast.info(`Loaded ${existingSociety.amenities.length} amenities for "${societyName}"`);
            }
        } catch (error) {
            console.error('Error fetching amenities:', error);
        }
    };

    const handleCitySelect = (value: string) => {
        setFormData(prev => ({ ...prev, city: value }));
        if (errors.city) {
            setErrors(prev => ({ ...prev, city: '' }));
        }
    };

    const handleLocalitySelect = (value: string) => {
        setFormData(prev => ({ ...prev, locality: value }));
        if (errors.locality) {
            setErrors(prev => ({ ...prev, locality: '' }));
        }
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities?.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...(prev.amenities || []), amenity]
        }));
    };

    const checkDuplicate = async () => {
        const { societyName, locality, pincode } = formData;

        if (!societyName || !locality || !pincode) {
            setDuplicateError(null);
            return;
        }

        if (isEditing && initialData) {
            const isSameAsOriginal =
                initialData.societyName === societyName &&
                initialData.locality === locality &&
                initialData.pincode === pincode;

            if (isSameAsOriginal) {
                setDuplicateError(null);
                return;
            }
        }

        setIsCheckingDuplicate(true);

        try {
            const allSocieties = await societyAPI.getAllSocieties();
            const exists = allSocieties.some(society =>
                society.societyName?.toLowerCase() === societyName.toLowerCase() &&
                society.locality?.toLowerCase() === locality.toLowerCase() &&
                society.pincode === pincode
            );

            if (exists) {
                setDuplicateError(`⚠️ "${societyName}" already exists in ${locality} - ${pincode}`);
            } else {
                setDuplicateError(null);
            }
        } catch (error) {
            console.error('Duplicate check error:', error);
        } finally {
            setIsCheckingDuplicate(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.societyName && formData.locality && formData.pincode) {
                checkDuplicate();
            } else {
                setDuplicateError(null);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [formData.societyName, formData.locality, formData.pincode]);

    const validateField = (name: keyof SocietyFormData, value: string): string => {
        switch (name) {
            case 'societyName':
                if (!value.trim()) return 'Society name is required';
                if (value.length < 2) return 'Society name must be at least 2 characters';
                if (value.length > 100) return 'Society name must be less than 100 characters';
                return '';
            case 'locality':
                if (!value.trim()) return 'Locality is required';
                if (value.length < 2) return 'Locality must be at least 2 characters';
                if (value.length > 100) return 'Locality must be less than 100 characters';
                return '';
            case 'city':
                if (!value.trim()) return 'City is required';
                if (value.length < 2) return 'City must be at least 2 characters';
                if (value.length > 50) return 'City must be less than 50 characters';
                return '';
            case 'pincode':
                if (!value.trim()) return 'Pincode is required';
                const pincodeRegex = /^[1-9][0-9]{5}$/;
                if (!pincodeRegex.test(value)) return 'Enter a valid 6-digit pincode';
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'societyName') {
            setSearchSocietyTerm(value);
        }
        if (errors[name as keyof SocietyFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};
        let isValid = true;

        if (!formData.societyName) {
            newErrors.societyName = 'Society name is required';
            isValid = false;
        }
        if (!formData.locality) {
            newErrors.locality = 'Locality is required';
            isValid = false;
        }
        if (!formData.city) {
            newErrors.city = 'City is required';
            isValid = false;
        }
        if (!formData.pincode) {
            newErrors.pincode = 'Pincode is required';
            isValid = false;
        } else {
            const pincodeRegex = /^[1-9][0-9]{5}$/;
            if (!pincodeRegex.test(formData.pincode)) {
                newErrors.pincode = 'Enter a valid 6-digit pincode';
                isValid = false;
            }
        }

        if (duplicateError) {
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // 🆕 Upload society images
    const uploadSocietyImages = async (societyId: string, images: File[]) => {
        if (!images || images.length === 0) return;

        try {
            setIsUploadingImages(true);
            const formData = new FormData();
            images.forEach(file => formData.append('images', file));

            await societyAPI.uploadSocietyImages(societyId, formData);
            toast.success(`${images.length} image(s) uploaded successfully`);

            if (onRefresh) await onRefresh();
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploadingImages(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            if (duplicateError) {
                toast.error(duplicateError);
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Create/update society without images first
            const societyData = {
                societyName: formData.societyName,
                locality: formData.locality,
                city: formData.city,
                pincode: formData.pincode,
                amenities: formData.amenities || [],
            };

            // If editing, we might have an ID
            if (isEditing && initialData) {
                // For edit, we need to get the society ID
                const allSocieties = await societyAPI.getAllSocieties();
                const existingSociety = allSocieties.find(
                    (s: any) => s.societyName === formData.societyName
                );

                if (existingSociety && formData.images && formData.images.length > 0) {
                    await uploadSocietyImages(existingSociety.id, formData.images);
                }
            }

            await onSubmit(societyData);

            // After create, upload images
            if (!isEditing && formData.images && formData.images.length > 0) {
                const allSocieties = await societyAPI.getAllSocieties();
                const createdSociety = allSocieties.find(
                    (s: any) => s.societyName === formData.societyName
                );

                if (createdSociety) {
                    await uploadSocietyImages(createdSociety.id, formData.images);
                }
            }

            if (onRefresh) await onRefresh();
            onClose();
        } catch (error: any) {
            console.error('Submission error:', error);
            if (error.response?.status === 409) {
                toast.error(error.response?.data?.error || 'Society already exists!');
            } else {
                toast.error('Failed to save society');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateImportData = (data: SocietyFormData, rowNumber: number): ImportValidationResult => {
        const errors: string[] = [];
        let isDuplicate = false;

        if (!data.societyName) errors.push('Society name is required');
        else if (data.societyName.length < 2) errors.push('Society name must be at least 2 characters');
        else if (data.societyName.length > 100) errors.push('Society name must be less than 100 characters');

        if (!data.locality) errors.push('Locality is required');
        else if (data.locality.length < 2) errors.push('Locality must be at least 2 characters');
        else if (data.locality.length > 100) errors.push('Locality must be less than 100 characters');

        if (!data.city) errors.push('City is required');
        else if (data.city.length < 2) errors.push('City must be at least 2 characters');
        else if (data.city.length > 50) errors.push('City must be less than 50 characters');

        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!data.pincode) errors.push('Pincode is required');
        else if (!pincodeRegex.test(data.pincode)) errors.push('Invalid pincode format');

        if (data.societyName && data.locality && data.pincode && pincodeRegex.test(data.pincode)) {
            const isDuplicateRecord = existingSocieties.some(existing =>
                existing.societyName?.toLowerCase() === data.societyName.toLowerCase() &&
                existing.locality?.toLowerCase() === data.locality.toLowerCase() &&
                existing.pincode === data.pincode
            );
            if (isDuplicateRecord) {
                isDuplicate = true;
                errors.push('Duplicate record already exists (Same Society Name, Locality & Pincode)');
            }
        }

        return { data, isValid: errors.length === 0, isDuplicate, errors, rowNumber };
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const validatedData: ImportValidationResult[] = [];
                for (let i = 0; i < jsonData.length; i++) {
                    const row: any = jsonData[i];
                    const societyData: SocietyFormData = {
                        societyName: row['Society Name'] || row.societyName || '',
                        locality: row['Locality'] || row.locality || '',
                        city: row['City'] || row.city || '',
                        pincode: String(row['Pincode'] || row.pincode || ''),
                        amenities: row['Amenities'] ? String(row['Amenities']).split(',').map((a: string) => a.trim()) : [],
                        images: [],
                        imageUrls: [],
                    };
                    validatedData.push(validateImportData(societyData, i + 2));
                }

                setImportPreview(validatedData);
                setShowBulkImport(true);
                toast.info(`Found ${validatedData.filter(v => v.isValid).length} valid records`);
            } catch (error) {
                toast.error('Failed to parse Excel file');
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    };

    const confirmBulkImport = async () => {
        try {
            setIsImporting(true);
            let successCount = 0;
            let errorCount = 0;
            const validItems = importPreview.filter(v => v.isValid);
            const duplicateItems = importPreview.filter(v => v.isDuplicate);
            const invalidItems = importPreview.filter(v => !v.isValid && !v.isDuplicate);

            if (duplicateItems.length > 0) {
                const duplicateNames = duplicateItems.map(item => item.data.societyName).slice(0, 5);
                toast.warning(`⚠️ Skipping ${duplicateItems.length} duplicate societies: ${duplicateNames.join(', ')}`);
            }

            if (invalidItems.length > 0) {
                toast.warning(`Skipping ${invalidItems.length} invalid records due to validation errors`);
            }

            for (const item of validItems) {
                try {
                    await societyAPI.createSociety(item.data);
                    successCount++;
                } catch (err) {
                    errorCount++;
                    console.error('Import error:', err);
                }
            }

            if (successCount > 0) {
                toast.success(`✅ Imported ${successCount} new societies`);
            }
            if (duplicateItems.length > 0) {
                toast.warning(`⚠️ Skipped ${duplicateItems.length} duplicate societies`);
            }
            if (invalidItems.length > 0) {
                toast.warning(`⚠️ Skipped ${invalidItems.length} invalid records`);
            }
            if (errorCount > 0) {
                toast.error(`❌ Failed to import ${errorCount} societies`);
            }

            if (onRefresh) await onRefresh();
            setShowBulkImport(false);
            setImportPreview([]);
            onClose();
        } catch (error) {
            toast.error('Failed to import societies');
        } finally {
            setIsImporting(false);
        }
    };

    // 🔥 UPDATED: Export with Amenities
    const handleExport = async () => {
        try {
            // Fetch latest data with amenities
            const societies = await societyAPI.getAllSocieties();

            if (!societies || societies.length === 0) {
                toast.warn('No data to export');
                return;
            }

            // Prepare data with amenities
            const excelData = societies.map((society) => ({
                'Society Name': society.societyName || '',
                'Locality': society.locality || '',
                'City': society.city || '',
                'Pincode': society.pincode || '',
                'Amenities': (society.amenities || []).join(', '), // ✅ Amenities included
                'Status': society.status || 'Active',
            }));

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths for better readability
            worksheet['!cols'] = [
                { wch: 35 }, // Society Name
                { wch: 30 }, // Locality
                { wch: 25 }, // City
                { wch: 15 }, // Pincode
                { wch: 50 }, // Amenities (wider)
                { wch: 12 }, // Status
            ];

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Societies');

            // Generate filename with date
            const fileName = `societies_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            toast.success(`${excelData.length} societies exported successfully ✅`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export societies ❌');
        }
    };

    const downloadSample = () => {
        const sampleData = [
            { 'Society Name': 'Green Valley Residency', 'Locality': 'Hinjewadi Phase 1', 'City': 'Pune', 'Pincode': 411057, 'Amenities': 'Parking, Security, Gym' },
            { 'Society Name': 'Sunshine Heights', 'Locality': 'Baner', 'City': 'Pune', 'Pincode': 411045, 'Amenities': 'Swimming Pool, Clubhouse, WiFi' },
        ];
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');
        XLSX.writeFile(workbook, 'sample_societies.xlsx');
        toast.info('Sample file downloaded');
    };

    const getInputClassName = (fieldName: keyof SocietyFormData) => {
        const baseClass = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
        if (duplicateError && fieldName === 'societyName') {
            return `${baseClass} border-red-500 bg-red-50`;
        }
        return errors[fieldName]
            ? `${baseClass} border-red-500 bg-red-50`
            : `${baseClass} border-gray-300 focus:border-blue-500`;
    };

    const validItems = importPreview.filter(v => v.isValid);
    const validCount = validItems.length;
    const duplicateCount = importPreview.filter(v => v.isDuplicate).length;
    const invalidCount = importPreview.filter(v => !v.isValid && !v.isDuplicate).length;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Custom Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
                    <h2 className="text-sm font-bold text-white">
                        {isEditing ? "Edit Society" : "Add New Society"}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <label className="p-1.5 rounded text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <Upload size={16} />
                        <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleImport} disabled={isImporting} />
                    </label>
                    <button type="button" onClick={handleExport} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
                        <Download size={16} />
                    </button>
                    <button type="button" onClick={downloadSample} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors">
                        <FileSpreadsheet size={16} />
                    </button>
                    <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors ml-2">
                        <X size={16} color="white" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {isImporting && (
                    <div className="m-4 p-3 bg-blue-50 rounded-lg text-center">
                        <div className="animate-spin inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                        <span className="text-sm text-blue-600">Processing...</span>
                    </div>
                )}

                {isLoadingMaster && (
                    <div className="mx-6 mt-4 p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span className="text-xs text-blue-600">Loading master data...</span>
                        </div>
                    </div>
                )}

                {duplicateError && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 flex items-center gap-2">
                            <X size={16} className="text-red-500" />
                            {duplicateError}
                        </p>
                    </div>
                )}

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Society Name - Searchable Dropdown */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Society Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    ref={societyInputRef}
                                    type="text"
                                    name="societyName"
                                    value={searchSocietyTerm}
                                    onChange={handleInputChange}
                                    onClick={() => {
                                        setFilteredSocietyOptions(societyOptions);
                                        setShowSocietyDropdown(true);
                                    }}
                                    className={getInputClassName('societyName')}
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSocietyDropdown(true)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <Search size={16} className="text-gray-400" />
                                </button>
                            </div>
                            {showSocietyDropdown && filteredSocietyOptions.length > 0 && (
                                <div ref={societyDropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredSocietyOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSocietySelect(option)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 transition-colors flex items-center gap-2"
                                        >
                                            <Building2 size={14} className="text-gray-400" />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {errors.societyName && <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>}
                        </div>

                        {/* Locality - Dropdown from Master */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Locality <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                placeholder="Select locality"
                                options={localityOptions}
                                value={formData.locality}
                                onChange={handleLocalitySelect}
                                className="w-full"
                                searchable
                            />
                            {errors.locality && <p className="mt-1 text-xs text-red-500">{errors.locality}</p>}
                        </div>

                        {/* City - Dropdown from Master */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                placeholder="Select city"
                                options={cityOptions}
                                value={formData.city}
                                onChange={handleCitySelect}
                                className="w-full"
                                searchable
                            />
                            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                        </div>

                        {/* Pincode - Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="Enter 6-digit pincode"
                                maxLength={6}
                                className={getInputClassName('pincode')}
                            />
                            {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                            <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
                        </div>
                    </div>

                    {/* Amenities Section - Multi-Select Dropdown */}
                    <div className="mt-6">
                        <AmenitiesMultiSelect
                            label="AMENITIES"
                            options={amenitiesOptions}
                            selectedValues={formData.amenities || []}
                            onToggle={handleAmenityToggle}
                            placeholder="Select amenities..."
                        />

                        {/* Selected Amenities Tags */}
                        {formData.amenities && formData.amenities.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {formData.amenities.map(amenity => (
                                    <span key={amenity} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full text-xs text-purple-700 border border-purple-200">
                                        {amenity}
                                        <button
                                            type="button"
                                            onClick={() => handleAmenityToggle(amenity)}
                                            className="text-purple-400 hover:text-purple-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 🆕 IMAGES SECTION */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Society Images
                            </label>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImages}
                                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                                {isUploadingImages ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Upload size={14} />
                                )}
                                {isUploadingImages ? 'Uploading...' : 'Upload Images'}
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        {/* Image Preview Grid */}
                        {imagePreviews.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                        <img
                                            src={preview}
                                            alt={`Society ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                                            <p className="text-white text-[10px] truncate">
                                                Image {index + 1}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 hover:bg-orange-50/20 transition-all cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">Click or drag to upload images</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB each)</p>
                            </div>
                        )}

                        {isUploadingImages && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                                <span className="text-xs text-blue-600">Uploading images...</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || isCheckingDuplicate || !!duplicateError} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                            <Save size={16} />
                            {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Society' : 'Save Society')}
                        </button>
                    </div>
                </div>
            </form>

            {/* Bulk Import Preview Modal with Separate Sections */}
            {showBulkImport && importPreview.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Import Preview & Validation</h3>
                            <button onClick={() => setShowBulkImport(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Summary Stats */}
                        <div className="flex gap-6 p-4 bg-gray-50 border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm">Valid: <strong>{validCount}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm">Duplicate: <strong>{duplicateCount}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm">Invalid: <strong>{invalidCount}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                <span className="text-sm">Total: <strong>{importPreview.length}</strong></span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {/* ✅ VALID RECORDS SECTION */}
                            {validItems.length > 0 && (
                                <div className="mb-6">
                                    <button
                                        onClick={() => setShowValidSection(!showValidSection)}
                                        className="flex items-center gap-2 w-full p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        {showValidSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        <CheckCircle size={18} className="text-green-600" />
                                        <span className="font-semibold text-green-700">Valid Records ({validItems.length})</span>
                                        <span className="text-xs text-green-600 ml-auto">Click to {showValidSection ? 'collapse' : 'expand'}</span>
                                    </button>

                                    {showValidSection && (
                                        <div className="mt-3 overflow-x-auto">
                                            <table className="min-w-full text-sm border-collapse">
                                                <thead className="bg-green-100 sticky top-0">
                                                    <tr>
                                                        <th className="p-2 text-left w-16 border-b">Row</th>
                                                        <th className="p-2 text-left border-b">Society Name</th>
                                                        <th className="p-2 text-left border-b">Locality</th>
                                                        <th className="p-2 text-left border-b">City</th>
                                                        <th className="p-2 text-left w-24 border-b">Pincode</th>
                                                        <th className="p-2 text-left w-32 border-b">Amenities</th>
                                                        <th className="p-2 text-left w-24 border-b">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {validItems.map((item, idx) => (
                                                        <tr key={idx} className="border-b hover:bg-green-50/50">
                                                            <td className="p-2 text-gray-500">{item.rowNumber}</td>
                                                            <td className="p-2 font-medium">{item.data.societyName}</td>
                                                            <td className="p-2">{item.data.locality}</td>
                                                            <td className="p-2">{item.data.city}</td>
                                                            <td className="p-2">{item.data.pincode}</td>
                                                            <td className="p-2 text-xs text-gray-500">{item.data.amenities?.join(', ') || '-'}</td>
                                                            <td className="p-2">
                                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                                    <CheckCircle size={14} /> Valid
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ❌ INVALID RECORDS SECTION */}
                            {(invalidCount > 0 || duplicateCount > 0) && (
                                <div>
                                    <button
                                        onClick={() => setShowInvalidSection(!showInvalidSection)}
                                        className="flex items-center gap-2 w-full p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        {showInvalidSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        <XCircle size={18} className="text-red-600" />
                                        <span className="font-semibold text-red-700">Invalid Records ({invalidCount + duplicateCount})</span>
                                        <span className="text-xs text-red-600 ml-auto">Click to {showInvalidSection ? 'collapse' : 'expand'}</span>
                                    </button>

                                    {showInvalidSection && (
                                        <div className="mt-3 overflow-x-auto">
                                            <table className="min-w-full text-sm border-collapse">
                                                <thead className="bg-red-100 sticky top-0">
                                                    <tr>
                                                        <th className="p-2 text-left w-16 border-b">Row</th>
                                                        <th className="p-2 text-left border-b">Society Name</th>
                                                        <th className="p-2 text-left border-b">Locality</th>
                                                        <th className="p-2 text-left border-b">City</th>
                                                        <th className="p-2 text-left w-24 border-b">Pincode</th>
                                                        <th className="p-2 text-left w-32 border-b">Amenities</th>
                                                        <th className="p-2 text-left w-28 border-b">Status</th>
                                                        <th className="p-2 text-left border-b">Errors</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importPreview.filter(v => !v.isValid).map((item, idx) => (
                                                        <tr key={idx} className={`border-b ${item.isDuplicate ? 'bg-yellow-50/50' : 'bg-red-50/50'}`}>
                                                            <td className="p-2 text-gray-500">{item.rowNumber}</td>
                                                            <td className="p-2 font-medium">{item.data.societyName || '-'}</td>
                                                            <td className="p-2">{item.data.locality || '-'}</td>
                                                            <td className="p-2">{item.data.city || '-'}</td>
                                                            <td className="p-2">{item.data.pincode || '-'}</td>
                                                            <td className="p-2 text-xs text-gray-500">{item.data.amenities?.join(', ') || '-'}</td>
                                                            <td className="p-2">
                                                                {item.isDuplicate ? (
                                                                    <span className="inline-flex items-center gap-1 text-yellow-600">
                                                                        <AlertCircle size={14} /> Duplicate
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-red-600">
                                                                        <XCircle size={14} /> Invalid
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-2">
                                                                {item.errors.length > 0 && (
                                                                    <div className="space-y-0.5">
                                                                        {item.errors.map((err, errIdx) => (
                                                                            <p key={errIdx} className={`text-xs flex items-center gap-1 ${err.includes('Duplicate') ? 'text-yellow-600' : 'text-red-500'}`}>
                                                                                <AlertCircle size={10} /> {err}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center gap-3 p-4 border-t bg-gray-50">
                            <div className="text-sm text-gray-600">
                                {validCount} records will be imported, {duplicateCount + invalidCount} records will be skipped
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBulkImport(false)}
                                    className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBulkImport}
                                    disabled={isImporting || validCount === 0}
                                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isImporting && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
                                    Import {validCount} Valid Records
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocietyForm;