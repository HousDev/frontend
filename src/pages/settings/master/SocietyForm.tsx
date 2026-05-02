// // SocietyForm.tsx
// import React, { useState, useEffect } from 'react';
// import { Upload, Download, X, Save, FileSpreadsheet } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import { societyAPI } from '@/lib/societyAPI';
// import { toast } from 'react-toastify';

// interface SocietyFormData {
//     societyName: string;
//     locality: string;
//     city: string;
//     pincode: string;
// }

// interface SocietyFormProps {
//     initialData?: SocietyFormData | null;
//     onSubmit: (data: SocietyFormData) => Promise<void>;
//     onClose: () => void;
//     isEditing?: boolean;
//     onRefresh?: () => Promise<void>;
// }

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
//     });

//     const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [isImporting, setIsImporting] = useState(false);
//     const [showBulkImport, setShowBulkImport] = useState(false);
//     const [importPreview, setImportPreview] = useState<SocietyFormData[]>([]);

//     // 🔥 NEW: Duplicate check states
//     const [duplicateError, setDuplicateError] = useState<string | null>(null);
//     const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

//     // Initialize form with data for editing
//     useEffect(() => {
//         if (initialData) {
//             setFormData({
//                 societyName: initialData.societyName || '',
//                 locality: initialData.locality || '',
//                 city: initialData.city || '',
//                 pincode: initialData.pincode || '',
//             });
//         }
//     }, [initialData]);

//     // 🔥 Function to check duplicate society
//     const checkDuplicate = async () => {
//         const { societyName, locality, city, pincode } = formData;

//         // Don't check if any field is empty
//         if (!societyName || !locality || !city || !pincode) {
//             setDuplicateError(null);
//             return;
//         }

//         // In edit mode, don't check if data is same as original
//         if (isEditing && initialData) {
//             const isSameAsOriginal =
//                 initialData.societyName === societyName &&
//                 initialData.locality === locality &&
//                 initialData.city === city &&
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
//                 society.societyName.toLowerCase() === societyName.toLowerCase() &&
//                 society.locality.toLowerCase() === locality.toLowerCase() &&
//                 society.city.toLowerCase() === city.toLowerCase() &&
//                 society.pincode === pincode
//             );

//             if (exists) {
//                 setDuplicateError(`⚠️ "${societyName}" already exists in ${locality}, ${city} - ${pincode}`);
//             } else {
//                 setDuplicateError(null);
//             }
//         } catch (error) {
//             console.error('Duplicate check error:', error);
//         } finally {
//             setIsCheckingDuplicate(false);
//         }
//     };

//     // 🔥 Auto check when any field changes (with debounce)
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (formData.societyName && formData.locality && formData.city && formData.pincode) {
//                 checkDuplicate();
//             } else {
//                 setDuplicateError(null);
//             }
//         }, 600);

//         return () => clearTimeout(timer);
//     }, [formData.societyName, formData.locality, formData.city, formData.pincode]);

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

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));

//         if (errors[name as keyof SocietyFormData]) {
//             setErrors((prev) => ({ ...prev, [name]: '' }));
//         }
//     };

//     const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         const error = validateField(name as keyof SocietyFormData, value);
//         setErrors((prev) => ({ ...prev, [name]: error }));
//     };

//     const validateForm = (): boolean => {
//         const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};
//         let isValid = true;

//         (Object.keys(formData) as Array<keyof SocietyFormData>).forEach((key) => {
//             const error = validateField(key, formData[key]);
//             if (error) {
//                 newErrors[key] = error;
//                 isValid = false;
//             }
//         });

//         // 🔥 Check duplicate error
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

//     // 📌 EXPORT TO EXCEL - Using API
//     const handleExport = async () => {
//         try {
//             const blob = await societyAPI.exportSocieties();
//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement('a');
//             link.href = url;
//             link.download = `societies_${new Date().toISOString().split('T')[0]}.xlsx`;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             window.URL.revokeObjectURL(url);
//             toast.success('Societies exported successfully!');
//         } catch (error) {
//             console.error('Export error:', error);
//             toast.error('Export failed');
//         }
//     };

//     // 📌 IMPORT FROM EXCEL
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

//                 // Validate and map data
//                 const importedSocieties: SocietyFormData[] = jsonData.map((row: any) => ({
//                     societyName: row['Society Name'] || row.societyName || '',
//                     locality: row['Locality'] || row.locality || '',
//                     city: row['City'] || row.city || '',
//                     pincode: String(row['Pincode'] || row.pincode || ''),
//                 })).filter(s => s.societyName && s.locality && s.city && s.pincode);

//                 if (importedSocieties.length === 0) {
//                     toast.error('No valid data found in file');
//                     return;
//                 }

//                 setImportPreview(importedSocieties);
//                 setShowBulkImport(true);
//             } catch (error) {
//                 console.error('Import error:', error);
//                 toast.error('Failed to parse Excel file');
//             } finally {
//                 setIsImporting(false);
//             }
//         };
//         reader.readAsArrayBuffer(file);
//         event.target.value = '';
//     };

//     // 📌 CONFIRM BULK IMPORT with duplicate check
//     const confirmBulkImport = async () => {
//         try {
//             setIsImporting(true);

//             let successCount = 0;
//             let duplicateCount = 0;
//             let errorCount = 0;
//             const duplicatesList: string[] = [];

//             // Get existing societies for duplicate check
//             const existingSocieties = await societyAPI.getAllSocieties();

//             for (const society of importPreview) {
//                 // Check if duplicate exists
//                 const exists = existingSocieties.some(existing =>
//                     existing.societyName.toLowerCase() === society.societyName.toLowerCase() &&
//                     existing.locality.toLowerCase() === society.locality.toLowerCase() &&
//                     existing.city.toLowerCase() === society.city.toLowerCase() &&
//                     existing.pincode === society.pincode
//                 );

//                 if (exists) {
//                     duplicateCount++;
//                     duplicatesList.push(society.societyName);
//                     continue;
//                 }

//                 try {
//                     await societyAPI.createSociety(society);
//                     successCount++;
//                 } catch (err) {
//                     errorCount++;
//                 }
//             }

//             if (successCount > 0) {
//                 toast.success(`✅ Imported ${successCount} new societies`);
//             }
//             if (duplicateCount > 0) {
//                 toast.warning(`⚠️ Skipped ${duplicateCount} duplicate societies: ${duplicatesList.join(', ')}`);
//             }
//             if (errorCount > 0) {
//                 toast.error(`❌ Failed to import ${errorCount} societies`);
//             }

//             if (onRefresh) await onRefresh();
//             setShowBulkImport(false);
//             setImportPreview([]);
//             onClose();
//         } catch (error) {
//             console.error('Bulk import error:', error);
//             toast.error('Failed to import societies');
//         } finally {
//             setIsImporting(false);
//         }
//     };

//     // 📌 DOWNLOAD SAMPLE EXCEL
//     const downloadSample = () => {
//         const sampleData = [
//             { 'Society Name': 'Green Valley Residency', 'Locality': 'Hinjewadi Phase 1', 'City': 'Pune', 'Pincode': 411057 },
//             { 'Society Name': 'Sunshine Heights', 'Locality': 'Baner', 'City': 'Pune', 'Pincode': 411045 },
//         ];

//         const worksheet = XLSX.utils.json_to_sheet(sampleData);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');

//         worksheet['!cols'] = [
//             { wch: 30 },
//             { wch: 25 },
//             { wch: 20 },
//             { wch: 12 },
//         ];

//         XLSX.writeFile(workbook, 'sample_societies.xlsx');
//         toast.info('Sample file downloaded');
//     };

//     const getInputClassName = (fieldName: keyof SocietyFormData) => {
//         const baseClass = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
//         // 🔥 Add red border if duplicate error exists
//         if (duplicateError) {
//             return `${baseClass} border-red-500 bg-red-50`;
//         }
//         return errors[fieldName]
//             ? `${baseClass} border-red-500 bg-red-50`
//             : `${baseClass} border-gray-300 focus:border-blue-500`;
//     };

//     return (
//         <div className="max-w-md mx-auto">
//             {/* Custom Header - Navy blue like PropertyFormModal */}
//             <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
//                 <div className="flex items-center gap-2">
//                     <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
//                     <h2 className="text-sm font-bold text-white">
//                         {isEditing ? "Edit Society" : "Add New Society"}
//                     </h2>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     {/* Import Button */}
//                     <label className="p-1.5 rounded text-white hover:bg-white/10 transition-colors cursor-pointer">
//                         <Upload size={16} />
//                         <input
//                             type="file"
//                             accept=".xlsx, .xls, .csv"
//                             className="hidden"
//                             onChange={handleImport}
//                             disabled={isImporting}
//                         />
//                     </label>

//                     {/* Export Button */}
//                     <button
//                         type="button"
//                         onClick={handleExport}
//                         className="p-1.5 rounded text-white hover:bg-white/10 transition-colors"
//                         title="Export Societies"
//                     >
//                         <Download size={16} />
//                     </button>

//                     {/* Download Sample Button */}
//                     <button
//                         type="button"
//                         onClick={downloadSample}
//                         className="p-1.5 rounded text-white hover:bg-white/10 transition-colors"
//                         title="Download Sample Excel"
//                     >
//                         <FileSpreadsheet size={16} />
//                     </button>

//                     {/* Close Button */}
//                     <button
//                         onClick={onClose}
//                         className="p-1 rounded hover:bg-white/10 transition-colors ml-2"
//                     >
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

//                 {/* 🔥 Checking Duplicate Indicator */}
//                 {isCheckingDuplicate && !duplicateError && (
//                     <div className="mx-6 mt-4 p-2 bg-blue-50 rounded-lg">
//                         <div className="flex items-center justify-center gap-2">
//                             <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
//                             <span className="text-xs text-blue-600">Checking for existing society...</span>
//                         </div>
//                     </div>
//                 )}

//                 {/* 🔥 Duplicate Error Message */}
//                 {duplicateError && (
//                     <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                         <p className="text-sm text-red-600 flex items-center gap-2">
//                             <X size={16} className="text-red-500 flex-shrink-0" />
//                             {duplicateError}
//                         </p>
//                     </div>
//                 )}

//                 <div className="p-6">
// <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                        {/* Society Name Field */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Society Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="societyName"
//                                 value={formData.societyName}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                                 placeholder="Enter society name"
//                                 className={getInputClassName('societyName')}
//                                 disabled={isSubmitting}
//                                 autoComplete="off"
//                             />
//                             {errors.societyName && (
//                                 <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>
//                             )}
//                         </div>

//                         {/* Locality Field */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Locality <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="locality"
//                                 value={formData.locality}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                                 placeholder="Enter locality (e.g., Andheri East, Sector 15)"
//                                 className={getInputClassName('locality')}
//                                 disabled={isSubmitting}
//                                 autoComplete="off"
//                             />
//                             {errors.locality && (
//                                 <p className="mt-1 text-xs text-red-500">{errors.locality}</p>
//                             )}
//                         </div>

//                         {/* City Field */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 City <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="city"
//                                 value={formData.city}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                                 placeholder="Enter city name"
//                                 className={getInputClassName('city')}
//                                 disabled={isSubmitting}
//                                 autoComplete="off"
//                             />
//                             {errors.city && (
//                                 <p className="mt-1 text-xs text-red-500">{errors.city}</p>
//                             )}
//                         </div>

//                         {/* Pincode Field */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Pincode <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 name="pincode"
//                                 value={formData.pincode}
//                                 onChange={handleChange}
//                                 onBlur={handleBlur}
//                                 placeholder="Enter 6-digit pincode"
//                                 maxLength={6}
//                                 className={getInputClassName('pincode')}
//                                 disabled={isSubmitting}
//                                 autoComplete="off"
//                             />
//                             {errors.pincode && (
//                                 <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
//                             )}
//                             <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
//                         </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={isSubmitting}
//                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={isSubmitting || isCheckingDuplicate || !!duplicateError}
//                             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//                         >
//                             {isSubmitting && (
//                                 <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                 </svg>
//                             )}
//                             <Save size={16} />
//                             {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Society' : 'Save Society')}
//                         </button>
//                     </div>
//                 </div>
//             </form>

//             {/* Bulk Import Preview Modal */}
//             {showBulkImport && importPreview.length > 0 && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
//                         <div className="flex justify-between items-center p-4 border-b">
//                             <h3 className="text-lg font-semibold">Import Preview</h3>
//                             <button onClick={() => setShowBulkImport(false)} className="p-1 hover:bg-gray-100 rounded">
//                                 <X size={20} />
//                             </button>
//                         </div>
//                         <div className="flex-1 overflow-auto p-4">
//                             <p className="text-sm text-gray-600 mb-3">
//                                 {importPreview.length} societies ready to import:
//                             </p>
//                             <div className="space-y-2">
//                                 {importPreview.map((item, idx) => (
//                                     <div key={idx} className="p-2 bg-gray-50 rounded text-sm flex justify-between items-center">
//                                         <div>
//                                             <span className="font-medium">{item.societyName}</span>
//                                             <span className="text-gray-500"> - {item.locality}, {item.city} - {item.pincode}</span>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                         <div className="flex justify-end gap-3 p-4 border-t">
//                             <button
//                                 onClick={() => setShowBulkImport(false)}
//                                 className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={confirmBulkImport}
//                                 disabled={isImporting}
//                                 className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
//                             >
//                                 {isImporting && (
//                                     <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                                 )}
//                                 Import All
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SocietyForm;

// SocietyForm.tsx
import React, { useState, useEffect } from 'react';
import { Upload, Download, X, Save, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { societyAPI } from '@/lib/societyAPI';
import { toast } from 'react-toastify';

interface SocietyFormData {
    societyName: string;
    locality: string;
    city: string;
    pincode: string;
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
    });

    const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [importPreview, setImportPreview] = useState<ImportValidationResult[]>([]);
    const [existingSocieties, setExistingSocieties] = useState<any[]>([]);
    const [showValidSection, setShowValidSection] = useState(true);
    const [showInvalidSection, setShowInvalidSection] = useState(true);

    // Duplicate check states
    const [duplicateError, setDuplicateError] = useState<string | null>(null);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

    // Initialize form with data for editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                societyName: initialData.societyName || '',
                locality: initialData.locality || '',
                city: initialData.city || '',
                pincode: initialData.pincode || '',
            });
        }
    }, [initialData]);

    // Load existing societies for duplicate check
    const loadExistingSocieties = async () => {
        try {
            const societies = await societyAPI.getAllSocieties();
            setExistingSocieties(societies);
        } catch (error) {
            console.error('Error loading societies:', error);
        }
    };

    useEffect(() => {
        loadExistingSocieties();
    }, []);

    // Function to check duplicate society
    const checkDuplicate = async () => {
        const { societyName, locality, city, pincode } = formData;

        if (!societyName || !locality || !city || !pincode) {
            setDuplicateError(null);
            return;
        }

        if (isEditing && initialData) {
            const isSameAsOriginal =
                initialData.societyName === societyName &&
                initialData.locality === locality &&
                initialData.city === city &&
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
                society.societyName.toLowerCase() === societyName.toLowerCase() &&
                society.locality.toLowerCase() === locality.toLowerCase() &&
                society.city.toLowerCase() === city.toLowerCase() &&
                society.pincode === pincode
            );

            if (exists) {
                setDuplicateError(`⚠️ "${societyName}" already exists in ${locality}, ${city} - ${pincode}`);
            } else {
                setDuplicateError(null);
            }
        } catch (error) {
            console.error('Duplicate check error:', error);
        } finally {
            setIsCheckingDuplicate(false);
        }
    };

    // Auto check when any field changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.societyName && formData.locality && formData.city && formData.pincode) {
                checkDuplicate();
            } else {
                setDuplicateError(null);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [formData.societyName, formData.locality, formData.city, formData.pincode]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof SocietyFormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name as keyof SocietyFormData, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SocietyFormData, string>> = {};
        let isValid = true;

        (Object.keys(formData) as Array<keyof SocietyFormData>).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        if (duplicateError) {
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
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
            await onSubmit(formData);
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

    // 📌 VALIDATE IMPORT DATA
    const validateImportData = (data: SocietyFormData, rowNumber: number): ImportValidationResult => {
        const errors: string[] = [];
        let isDuplicate = false;

        // Validate Society Name
        if (!data.societyName) {
            errors.push('Society name is required');
        } else if (data.societyName.length < 2) {
            errors.push('Society name must be at least 2 characters');
        } else if (data.societyName.length > 100) {
            errors.push('Society name must be less than 100 characters');
        }

        // Validate Locality
        if (!data.locality) {
            errors.push('Locality is required');
        } else if (data.locality.length < 2) {
            errors.push('Locality must be at least 2 characters');
        } else if (data.locality.length > 100) {
            errors.push('Locality must be less than 100 characters');
        }

        // Validate City
        if (!data.city) {
            errors.push('City is required');
        } else if (data.city.length < 2) {
            errors.push('City must be at least 2 characters');
        } else if (data.city.length > 50) {
            errors.push('City must be less than 50 characters');
        }

        // Validate Pincode
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!data.pincode) {
            errors.push('Pincode is required');
        } else if (!pincodeRegex.test(data.pincode)) {
            errors.push('Invalid pincode format (must be 6 digits)');
        }

        // Check for duplicate in existing database
        if (data.societyName && data.locality && data.city && data.pincode && pincodeRegex.test(data.pincode)) {
            const isDuplicateRecord = existingSocieties.some(existing =>
                existing.societyName?.toLowerCase() === data.societyName.toLowerCase() &&
                existing.locality?.toLowerCase() === data.locality.toLowerCase() &&
                existing.city?.toLowerCase() === data.city.toLowerCase() &&
                existing.pincode === data.pincode
            );

            if (isDuplicateRecord) {
                isDuplicate = true;
                errors.push('Duplicate record already exists in database');
            }
        }

        return {
            data,
            isValid: errors.length === 0,
            isDuplicate,
            errors,
            rowNumber
        };
    };

    // 📌 IMPORT FROM EXCEL with validation
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

                // Validate and map data
                const validatedData: ImportValidationResult[] = [];

                for (let i = 0; i < jsonData.length; i++) {
                    const row: any = jsonData[i];
                    const societyData: SocietyFormData = {
                        societyName: row['Society Name'] || row.societyName || '',
                        locality: row['Locality'] || row.locality || '',
                        city: row['City'] || row.city || '',
                        pincode: String(row['Pincode'] || row.pincode || ''),
                    };

                    const validation = validateImportData(societyData, i + 2);
                    validatedData.push(validation);
                }

                setImportPreview(validatedData);
                setShowBulkImport(true);

                const validCount = validatedData.filter(v => v.isValid).length;
                const invalidCount = validatedData.filter(v => !v.isValid).length;
                toast.info(`Found ${validCount} valid and ${invalidCount} invalid records`);
            } catch (error) {
                console.error('Import error:', error);
                toast.error('Failed to parse Excel file');
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    };

    // 📌 CONFIRM BULK IMPORT - Only valid records
    const confirmBulkImport = async () => {
        try {
            setIsImporting(true);

            let successCount = 0;
            let errorCount = 0;

            const validItems = importPreview.filter(v => v.isValid);
            const duplicateItems = importPreview.filter(v => v.isDuplicate);
            const invalidItems = importPreview.filter(v => !v.isValid && !v.isDuplicate);

            // Show duplicate items warning
            if (duplicateItems.length > 0) {
                const duplicateNames = duplicateItems.map(item => item.data.societyName).slice(0, 5);
                toast.warning(`⚠️ Skipping ${duplicateItems.length} duplicate societies: ${duplicateNames.join(', ')}`);
            }

            // Show invalid items warning
            if (invalidItems.length > 0) {
                toast.warning(`Skipping ${invalidItems.length} invalid records due to validation errors`);
            }

            for (const item of validItems) {
                try {
                    await societyAPI.createSociety(item.data);
                    successCount++;
                } catch (err) {
                    errorCount++;
                }
            }

            // Show summary
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
            console.error('Bulk import error:', error);
            toast.error('Failed to import societies');
        } finally {
            setIsImporting(false);
        }
    };

    // 📌 EXPORT TO EXCEL
    const handleExport = async () => {
        try {
            const blob = await societyAPI.exportSocieties();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `societies_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Societies exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export failed');
        }
    };

    // 📌 DOWNLOAD SAMPLE EXCEL
    const downloadSample = () => {
        const sampleData = [
            { 'Society Name': 'Green Valley Residency', 'Locality': 'Hinjewadi Phase 1', 'City': 'Pune', 'Pincode': 411057 },
            { 'Society Name': 'Sunshine Heights', 'Locality': 'Baner', 'City': 'Pune', 'Pincode': 411045 },
        ];

        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample');

        worksheet['!cols'] = [
            { wch: 30 },
            { wch: 25 },
            { wch: 20 },
            { wch: 12 },
        ];

        XLSX.writeFile(workbook, 'sample_societies.xlsx');
        toast.info('Sample file downloaded');
    };

    const getInputClassName = (fieldName: keyof SocietyFormData) => {
        const baseClass = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
        if (duplicateError) {
            return `${baseClass} border-red-500 bg-red-50`;
        }
        return errors[fieldName]
            ? `${baseClass} border-red-500 bg-red-50`
            : `${baseClass} border-gray-300 focus:border-blue-500`;
    };

    // Statistics for preview
    const validItems = importPreview.filter(v => v.isValid);
    const validCount = validItems.length;
    const duplicateCount = importPreview.filter(v => v.isDuplicate).length;
    const invalidCount = importPreview.filter(v => !v.isValid && !v.isDuplicate).length;

    return (
        <div className="max-w-3xl mx-auto">
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
                    <button type="button" onClick={handleExport} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors" title="Export Societies">
                        <Download size={16} />
                    </button>
                    <button type="button" onClick={downloadSample} className="p-1.5 rounded text-white hover:bg-white/10 transition-colors" title="Download Sample Excel">
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

                {isCheckingDuplicate && !duplicateError && (
                    <div className="mx-6 mt-4 p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span className="text-xs text-blue-600">Checking for existing society...</span>
                        </div>
                    </div>
                )}

                {duplicateError && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 flex items-center gap-2">
                            <X size={16} className="text-red-500 flex-shrink-0" />
                            {duplicateError}
                        </p>
                    </div>
                )}

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Society Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="societyName"
                                value={formData.societyName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter society name"
                                className={getInputClassName('societyName')}
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                            {errors.societyName && <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Locality <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="locality"
                                value={formData.locality}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter locality"
                                className={getInputClassName('locality')}
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                            {errors.locality && <p className="mt-1 text-xs text-red-500">{errors.locality}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter city name"
                                className={getInputClassName('city')}
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                            {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter 6-digit pincode"
                                maxLength={6}
                                className={getInputClassName('pincode')}
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                            {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
                            <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || isCheckingDuplicate || !!duplicateError} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
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