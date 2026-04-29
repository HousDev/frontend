// // SocietyForm.tsx
// import React, { useState, useEffect } from 'react';

// interface SocietyFormData {
//     societyName: string;
//     locality: string;
//     city: string;
//     pincode: string;
// }

// interface SocietyFormProps {
//     initialData?: SocietyFormData | null;
//     onSubmit: (data: SocietyFormData) => void;
//     onClose: () => void;
//     isEditing?: boolean;
// }

// const SocietyForm: React.FC<SocietyFormProps> = ({
//     initialData,
//     onSubmit,
//     onClose,
//     isEditing = false,
// }) => {
//     const [formData, setFormData] = useState<SocietyFormData>({
//         societyName: '',
//         locality: '',
//         city: '',
//         pincode: '',
//     });

//     const [errors, setErrors] = useState<Partial<Record<keyof SocietyFormData, string>>>({});
//     const [isSubmitting, setIsSubmitting] = useState(false);

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

//         // Clear error when user starts typing
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

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             await onSubmit(formData);
//             onClose();
//         } catch (error) {
//             console.error('Submission error:', error);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Common input className with error styling
//     const getInputClassName = (fieldName: keyof SocietyFormData) => {
//         const baseClass = "w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
//         return errors[fieldName]
//             ? `${baseClass} border-red-500 bg-red-50`
//             : `${baseClass} border-gray-300 focus:border-blue-500`;
//     };

//     return (
//         <div className="max-w-md mx-auto">
//             <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                     {isEditing ? 'Edit Society' : 'Add New Society'}
//                 </h2>

//                 <div className="space-y-4">
//                     {/* Society Name Field */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Society Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="societyName"
//                             value={formData.societyName}
//                             onChange={handleChange}
//                             onBlur={handleBlur}
//                             placeholder="Enter society name"
//                             className={getInputClassName('societyName')}
//                             disabled={isSubmitting}
//                             autoComplete="off"
//                         />
//                         {errors.societyName && (
//                             <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>
//                         )}
//                     </div>

//                     {/* Locality Field */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Locality <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="locality"
//                             value={formData.locality}
//                             onChange={handleChange}
//                             onBlur={handleBlur}
//                             placeholder="Enter locality (e.g., Andheri East, Sector 15)"
//                             className={getInputClassName('locality')}
//                             disabled={isSubmitting}
//                             autoComplete="off"
//                         />
//                         {errors.locality && (
//                             <p className="mt-1 text-xs text-red-500">{errors.locality}</p>
//                         )}
//                     </div>

//                     {/* City Field */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             City <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="city"
//                             value={formData.city}
//                             onChange={handleChange}
//                             onBlur={handleBlur}
//                             placeholder="Enter city name"
//                             className={getInputClassName('city')}
//                             disabled={isSubmitting}
//                             autoComplete="off"
//                         />
//                         {errors.city && (
//                             <p className="mt-1 text-xs text-red-500">{errors.city}</p>
//                         )}
//                     </div>

//                     {/* Pincode Field */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Pincode <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="pincode"
//                             value={formData.pincode}
//                             onChange={handleChange}
//                             onBlur={handleBlur}
//                             placeholder="Enter 6-digit pincode"
//                             maxLength={6}
//                             className={getInputClassName('pincode')}
//                             disabled={isSubmitting}
//                             autoComplete="off"
//                         />
//                         {errors.pincode && (
//                             <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
//                         )}
//                         <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
//                     </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         disabled={isSubmitting}
//                         className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//                     >
//                         {isSubmitting && (
//                             <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                         )}
//                         {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Society' : 'Save Society')}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default SocietyForm;



// // SocietyForm.tsx
// import React, { useState, useEffect } from 'react';
// import { Upload, Download, X, Save, Edit2, Plus, FileSpreadsheet, Trash2 } from 'lucide-react';
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
//     hideHeaderButtons?: boolean;
//     onRefreshComplete?: () => void;
// }

// const SocietyForm: React.FC<SocietyFormProps> = ({
//     initialData,
//     onSubmit,
//     onClose,
//     isEditing = false,
//     onRefresh,
//     hideHeaderButtons = false,
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

//         setErrors(newErrors);
//         return isValid;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setIsSubmitting(true);

//         try {
//             await onSubmit(formData);
//             if (onRefresh) await onRefresh();
//             onClose();
//         } catch (error) {
//             console.error('Submission error:', error);
//             toast.error('Failed to save society');
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

//     // 📌 CONFIRM BULK IMPORT
//     const confirmBulkImport = async () => {
//         try {
//             setIsImporting(true);
//             // Import each society one by one
//             for (const society of importPreview) {
//                 await societyAPI.createSociety(society);
//             }
//             toast.success(`Successfully imported ${importPreview.length} societies`);
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
//         return errors[fieldName]
//             ? `${baseClass} border-red-500 bg-red-50`
//             : `${baseClass} border-gray-300 focus:border-blue-500`;
//     };

//     return (
//         <div className="max-w-md mx-auto">
//             <form onSubmit={handleSubmit}>
//                 {/* Header with Import/Export Buttons */}
//                 {!hideHeaderButtons && (
    
//                     <div className="flex gap-1">
//                         {/* Export Button */}
//                         <button
//                             type="button"
//                             onClick={handleExport}
//                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//                             title="Export to Excel"
//                         >
//                             <Download size={18} />
//                         </button>

//                         {/* Import Button */}
//                         <label className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
//                             <Upload size={18} />
//                             <input
//                                 type="file"
//                                 accept=".xlsx, .xls, .csv"
//                                 className="hidden"
//                                 onChange={handleImport}
//                                 disabled={isImporting}
                                
//                             />
//                         </label>

//                         {/* Sample Download */}
//                         <button
//                             type="button"
//                             onClick={downloadSample}
//                             className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
//                             title="Download Sample Excel"
//                         >
//                             <FileSpreadsheet size={18} />
//                         </button>
//                     </div>
//                 )}
               

//                 {isImporting && (
//                     <div className="m-4 p-3 bg-blue-50 rounded-lg text-center">
//                         <div className="animate-spin inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
//                         <span className="text-sm text-blue-600">Processing...</span>
//                     </div>
//                 )}

//                 <div className="p-6">
//                     <div className="space-y-4">
//                         {/* Society Name Field */}
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
//                             disabled={isSubmitting}
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
import { Upload, Download, X, Save, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { societyAPI } from '@/lib/societyAPI';
import { toast } from 'react-toastify';

interface SocietyFormData {
    societyName: string;
    locality: string;
    city: string;
    pincode: string;
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
    const [importPreview, setImportPreview] = useState<SocietyFormData[]>([]);

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

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            if (onRefresh) await onRefresh();
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to save society');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 📌 EXPORT TO EXCEL - Using API
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

    // 📌 IMPORT FROM EXCEL
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
                const importedSocieties: SocietyFormData[] = jsonData.map((row: any) => ({
                    societyName: row['Society Name'] || row.societyName || '',
                    locality: row['Locality'] || row.locality || '',
                    city: row['City'] || row.city || '',
                    pincode: String(row['Pincode'] || row.pincode || ''),
                })).filter(s => s.societyName && s.locality && s.city && s.pincode);

                if (importedSocieties.length === 0) {
                    toast.error('No valid data found in file');
                    return;
                }

                setImportPreview(importedSocieties);
                setShowBulkImport(true);
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

    // 📌 CONFIRM BULK IMPORT
    const confirmBulkImport = async () => {
        try {
            setIsImporting(true);
            // Import each society one by one
            for (const society of importPreview) {
                await societyAPI.createSociety(society);
            }
            toast.success(`Successfully imported ${importPreview.length} societies`);
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
        return errors[fieldName]
            ? `${baseClass} border-red-500 bg-red-50`
            : `${baseClass} border-gray-300 focus:border-blue-500`;
    };

    return (
        <div className="max-w-md mx-auto">
            {/* Custom Header - Navy blue like PropertyFormModal */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b rounded-t-lg" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
                    <h2 className="text-sm font-bold text-white">
                        {isEditing ? "Edit Society" : "Add New Society"}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {/* Import Button */}
                    <label className="p-1.5 rounded text-white hover:bg-white/10 transition-colors cursor-pointer">
                        <Upload size={16} />
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            onChange={handleImport}
                            disabled={isImporting}
                        />
                    </label>

                    {/* Export Button */}
                    <button
                        type="button"
                        onClick={handleExport}
                        className="p-1.5 rounded text-white hover:bg-white/10 transition-colors"
                        title="Export Societies"
                    >
                        <Download size={16} />
                    </button>

                    {/* Download Sample Button */}
                    <button
                        type="button"
                        onClick={downloadSample}
                        className="p-1.5 rounded text-white hover:bg-white/10 transition-colors"
                        title="Download Sample Excel"
                    >
                        <FileSpreadsheet size={16} />
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-white/10 transition-colors ml-2"
                    >
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

                <div className="p-6">
                    <div className="space-y-4">
                        {/* Society Name Field */}
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
                            {errors.societyName && (
                                <p className="mt-1 text-xs text-red-500">{errors.societyName}</p>
                            )}
                        </div>

                        {/* Locality Field */}
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
                                placeholder="Enter locality (e.g., Andheri East, Sector 15)"
                                className={getInputClassName('locality')}
                                disabled={isSubmitting}
                                autoComplete="off"
                            />
                            {errors.locality && (
                                <p className="mt-1 text-xs text-red-500">{errors.locality}</p>
                            )}
                        </div>

                        {/* City Field */}
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
                            {errors.city && (
                                <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                            )}
                        </div>

                        {/* Pincode Field */}
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
                            {errors.pincode && (
                                <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">Must be a valid 6-digit Indian pincode</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <Save size={16} />
                            {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Society' : 'Save Society')}
                        </button>
                    </div>
                </div>
            </form>

            {/* Bulk Import Preview Modal */}
            {showBulkImport && importPreview.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Import Preview</h3>
                            <button onClick={() => setShowBulkImport(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <p className="text-sm text-gray-600 mb-3">
                                {importPreview.length} societies ready to import:
                            </p>
                            <div className="space-y-2">
                                {importPreview.map((item, idx) => (
                                    <div key={idx} className="p-2 bg-gray-50 rounded text-sm flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">{item.societyName}</span>
                                            <span className="text-gray-500"> - {item.locality}, {item.city} - {item.pincode}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t">
                            <button
                                onClick={() => setShowBulkImport(false)}
                                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkImport}
                                disabled={isImporting}
                                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isImporting && (
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                )}
                                Import All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocietyForm;