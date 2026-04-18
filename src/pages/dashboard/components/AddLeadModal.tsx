// // import React, {  useEffect, useState } from 'react';
// // import Modal from '@/components/ui/Modal';
// // import Button from '@/components/ui/Button';
// // import PhoneInput from 'react-phone-input-2';
// // import 'react-phone-input-2/lib/style.css';
// // import { FaWhatsapp } from 'react-icons/fa';
// // import { masterDataAPI } from '@/lib/mastersAPI';
// // import { usersAPI } from '@/lib/api';
// // import { useAuth } from '@/contexts/AuthContext';
// // import { toast } from 'react-toastify';
// // import { getAssignableExecutives } from '@/utils/roleBasedOptions';

// // interface MasterOption {
// //   value: string;
// //   label: string;
// // }

// // interface Lead {
// //   id?: string;
// //   salutation?: string;
// //   name?: string;
// //   phone?: string;
// //   email?: string;
// //   lead_type?: string;
// //   lead_source?: string;
// //   whatsapp_number?: string;
// //   state?: string;
// //   city?: string;
// //   location?: string;
// //   status?: string;
// //   assigned_executive?: string;
// //   assigned_executive_name?: string;
// //   priority?: string;
// //   created_by?: string;
// // }

// // interface AddLeadModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   onSave: (lead: Lead | null) => void;
// //   lead?: Partial<Lead>;
// // }

// // interface DropdownProps {
// //   placeholder: string;
// //   options: MasterOption[];
// //   value: string;
// //   onChange: (value: string) => void;
// //   className?: string;
// //   searchable?: boolean;
// // }

// // const Dropdown: React.FC<DropdownProps> = ({
// //   placeholder,
// //   options,
// //   value,
// //   onChange,
// //   className = '',
// //   searchable = false
// // }) => {
// //   const [isOpen, setIsOpen] = React.useState(false);
// //   const [buttonWidth, setButtonWidth] = React.useState(0);
// //   const [searchTerm, setSearchTerm] = React.useState('');
// //   const buttonRef = React.useRef<HTMLButtonElement>(null);
// //   const dropdownRef = React.useRef<HTMLDivElement>(null);
// //   const selectedOption = options.find(option => option.value === value) || null;

// //   const filteredOptions = searchable
// //     ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
// //     : options;

// //   React.useEffect(() => {
// //     if (buttonRef.current) setButtonWidth(buttonRef.current.offsetWidth);
// //   }, [isOpen]);

// //   React.useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //         setSearchTerm('');
// //       }
// //     };
// //     if (isOpen) document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, [isOpen]);

// //   return (
// //     <div className={`relative ${className}`} ref={dropdownRef}>
// //       <button
// //         ref={buttonRef}
// //         type="button"
// //         className="flex items-center justify-between w-full border border-gray-300 rounded px-3 h-8 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs bg-white"
// //         onClick={() => setIsOpen(!isOpen)}
// //       >
// //         <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
// //         <svg className={`ml-2 h-4 w-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
// //           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
// //         </svg>
// //       </button>
// //       {isOpen && (
// //         <div
// //           className="fixed inset-0 z-[9998]"
// //           onClick={() => {
// //             setIsOpen(false);
// //             setSearchTerm('');
// //           }}
// //         >
// //           <div
// //             className="absolute bg-white shadow-lg rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-hidden"
// //             style={{
// //               width: buttonWidth,
// //               top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
// //               left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left + window.scrollX : 0,
// //               zIndex: 9999
// //             } as any}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             {searchable && (
// //               <div className="p-2 border-b">
// //                 <input
// //                   type="text"
// //                   placeholder="Search..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
// //                   onClick={(e) => e.stopPropagation()}
// //                 />
// //               </div>
// //             )}
// //             <div className="overflow-y-auto max-h-48">
// //               {filteredOptions.length > 0 ? (
// //                 filteredOptions.map(option => (
// //                   <button
// //                     key={option.value}
// //                     className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
// //                     onClick={() => {
// //                       onChange(option.value);
// //                       setIsOpen(false);
// //                       setSearchTerm('');
// //                     }}
// //                   >
// //                     {option.label}
// //                   </button>
// //                 ))
// //               ) : (
// //                 <div className="px-3 py-2 text-gray-500">
// //                   {searchable ? "No matching options" : "No options available"}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const emptyLead: Lead = {
// //   salutation: '',
// //   name: '',
// //   phone: '',
// //   email: '',
// //   lead_type: '',
// //   lead_source: '',
// //   whatsapp_number: '',
// //   state: '',
// //   city: '',
// //   location: '',
// //   status: 'new',
// //   assigned_executive: '',
// //   priority: ''
// // };

// // const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
// //   const { user } = useAuth();
// //   const isEdit = !!lead?.id;
// //   const [newLead, setNewLead] = useState<Lead>({ ...emptyLead });
// //   const [sameAsPhone, setSameAsPhone] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [masterOptions, setMasterOptions] = useState({
// //     salutation: [] as MasterOption[],
// //     leadType: [] as MasterOption[],
// //     leadSource: [] as MasterOption[],
// //     leadStatus: [] as MasterOption[],
// //     states: [] as MasterOption[],
// //     cities: [] as MasterOption[],
// //     locations: [] as MasterOption[],
// //     priority: [] as MasterOption[]
// //   });
// //   const [presalesUsers, setPreSalesUsers] = useState<any[]>([]);

// //   // Helper functions
// //   const digitsOnly = (s?: string) => (s ? String(s).replace(/\D/g, '') : '');
// //   const toE164 = (s?: string) => {
// //     if (!s) return '';
// //     const d = digitsOnly(s);
// //     if (!d) return '';
// //     return d.startsWith('0') ? `+${d.replace(/^0+/, '')}` : `+${d}`;
// //   };
// //   const normalizeWhatsapp = (s?: string) => digitsOnly(s);

// //   // Fetch executives
// //   useEffect(() => {
// //     if (!isOpen) return;
// //     let alive = true;

// //     const norm = (s: any) =>
// //       (s ?? "")
// //         .toString()
// //         .trim()
// //         .toLowerCase()
// //         .replace(/[\s-_/]+/g, "");

// //     (async () => {
// //       try {
// //         const resp = await usersAPI.getAllUsers();
// //         const list =
// //           (Array.isArray(resp?.data) && resp.data) ||
// //           (Array.isArray(resp?.users) && resp.users) ||
// //           (Array.isArray(resp) && resp) ||
// //           [];

// //         const execs = list.filter((u: any) => {
// //           const dept = norm(u?.department || u?.department_name);
// //           const role = norm(u?.role || u?.role_name);
// //           return dept === "presales" && role === "executive";
// //         });

// //         if (!alive) return;
// //         setPreSalesUsers(execs);
// //       } catch (e) {
// //         console.error("Error fetching users:", e);
// //         if (!alive) return;
// //         setPreSalesUsers([]);
// //       }
// //     })();

// //     return () => { alive = false; };
// //   }, [isOpen]);

// //   // Fetch master data
// //   const fetchMasterData = async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);
// //       const [leadMasterTypes, commonMasterTypes] = await Promise.all([
// //         masterDataAPI.getAllMasterTypes('lead'),
// //         masterDataAPI.getAllMasterTypes('common')
// //       ]);
// //       const allMasterTypes = [...(leadMasterTypes || []), ...(commonMasterTypes || [])];
// //       const masterValues = await Promise.all(
// //         allMasterTypes.map((mt: any) => masterDataAPI.getMasterValues(mt.id))
// //       );
// //       const organized: Record<string, MasterOption[]> = {};
// //       allMasterTypes.forEach((mt: any, idx: number) => {
// //         const vals = masterValues[idx] || [];
// //         organized[(mt.name || '').toString().toLowerCase()] = vals.map((item: any) => ({
// //           value: String(item.id),
// //           label: item.value || item.name || 'Unknown'
// //         }));
// //       });
// //       setMasterOptions({
// //         salutation: organized['salutation'] || [],
// //         leadType: organized['lead type'] || organized['leadtype'] || [],
// //         leadSource: organized['lead source'] || organized['leadsource'] || [],
// //         leadStatus: organized['lead status'] || organized['leadstatus'] || [],
// //         states: organized['state'] || [],
// //         cities: organized['city'] || [],
// //         locations: organized['location'] || [],
// //         priority: organized['lead priority'] || organized['leadpriority'] || []
// //       });
// //     } catch (err) {
// //       console.error('Failed to load master data:', err);
// //       setError(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (isOpen) {
// //       fetchMasterData();
// //       if (isEdit && lead) {
// //         setNewLead({
// //           id: lead.id,
// //           salutation: lead.salutation || '',
// //           name: lead.name || '',
// //           phone: lead.phone || '',
// //           email: lead.email || '',
// //           lead_type: lead.lead_type || '',
// //           lead_source: lead.lead_source || '',
// //           whatsapp_number: lead.whatsapp_number || '',
// //           state: lead.state || '',
// //           city: lead.city || '',
// //           location: lead.location || '',
// //           status: lead.status || 'new',
// //           assigned_executive: lead.assigned_executive || '',
// //           priority: lead.priority || '',
// //         });

// //         const phoneDigits = digitsOnly(lead.phone);
// //         const waDigits = digitsOnly(lead.whatsapp_number);
// //         setSameAsPhone(!!waDigits && phoneDigits && waDigits === phoneDigits.replace(/^91/, '') || waDigits === phoneDigits);
// //       } else {
// //         // For new leads, auto-assign to current user if they are an executive
// //         const initialLead = { ...emptyLead };
        
// //         // Auto-assign logic: If user is executive, assign to themselves
// //         if (user?.role?.toLowerCase() === 'executive' && user?.department?.toLowerCase() === 'presales') {
// //           initialLead.assigned_executive = String(user.id);
// //         initialLead.assigned_executive_name =
// //   `${user?.salutation ? user.salutation + ' ' : ''}${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Self';

// //         }
        
// //         setNewLead(initialLead);
// //         setSameAsPhone(false);
// //       }
// //       setError(null);
// //     } else {
// //       setNewLead({ ...emptyLead });
// //       setSameAsPhone(false);
// //       setError(null);
// //       setLoading(false);
// //     }
// //   }, [isOpen, isEdit, lead?.id, user]);

// //   const handleDropdownChange = (name: keyof Lead, options: MasterOption[]) => (value: string) => {
// //     const selected = options.find(opt => opt.value === value);
// //     setNewLead(prev => ({ ...prev, [name]: selected ? selected.label : value }));
// //   };

// //   const handlePhoneChange = (value: string) => {
// //     const withPlus = toE164(value);
// //     setNewLead(prev => {
// //       const updated = { ...prev, phone: withPlus };
// //       if (sameAsPhone) {
// //         const phoneDigits = digitsOnly(withPlus);
// //         const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
// //         updated.whatsapp_number = waDigits;
// //       }
// //       return updated;
// //     });
// //   };

// //   const handleWhatsappChange = (value: string) => {
// //     const numbers = digitsOnly(value);
// //     setNewLead(prev => ({ ...prev, whatsapp_number: numbers }));
// //   };

// //   const handleSameAsPhoneToggle = (checked: boolean) => {
// //     setSameAsPhone(checked);
// //     if (checked) {
// //       const phoneDigits = digitsOnly(newLead.phone || '');
// //       const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
// //       setNewLead(prev => ({ ...prev, whatsapp_number: waDigits }));
// //     }
// //   };

// //   const normalizeNumber = (num?: string) => toE164(num);

// //   const handleSubmit = () => {
// //     if (!String(newLead.name || '').trim()) {
// //       toast.error('Please enter a valid name');
// //       return;
// //     }
// //     if (!newLead.phone) {
// //       toast.error('Please enter phone number');
// //       return;
// //     }
// //     if (!String(newLead.email || '').trim()) {
// //       toast.error('Please enter email address');
// //       return;
// //     }
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     if (!emailRegex.test(String(newLead.email))) {
// //       toast.error('Please enter a valid email address');
// //       return;
// //     }

// //     // Prepare payload with creator information
// //     const normalizedLead: Lead = {
// //       ...newLead,
// //       phone: normalizeNumber(newLead.phone),
// //       whatsapp_number: normalizeWhatsapp(newLead.whatsapp_number),
// //       created_by: String(user?.id),
// //     };

 
// //     onSave(normalizedLead);
// //   };

// //   const valFromLabel = (opts: MasterOption[], labelOrValue?: string) =>
// //     (labelOrValue ? opts.find(opt => opt.label === labelOrValue)?.value : undefined) || (labelOrValue ?? '');

// //   // Get assignable executives
// //   const assignableExecutives = getAssignableExecutives(user, presalesUsers);

// //   return (
// //     <Modal
// //       isOpen={isOpen}
// //       onClose={onClose}
// //       title={isEdit ? "Edit Lead" : "Add New Lead"}
// //       width="max-w-[95vw] md:max-w-2xl lg:max-w-3xl"
// //     >
// //       <div className="space-y-4 relative" style={{ minHeight: '320px' }}>
// //         {loading && (
// //           <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
// //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
// //             <span className="ml-2">Loading options...</span>
// //           </div>
// //         )}
// //         {error && (
// //           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
// //             <p>{error}</p>
// //             <button onClick={fetchMasterData} className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
// //               Retry Loading Data
// //             </button>
// //           </div>
// //         )}

// //         {/* First Row - Salutation, Name, Email */}
// //         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
// //           <div className="md:col-span-2">
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
// //             <Dropdown
// //               placeholder="Select Salutation"
// //               options={masterOptions.salutation}
// //               value={valFromLabel(masterOptions.salutation, newLead.salutation)}
// //               onChange={handleDropdownChange('salutation', masterOptions.salutation)}
// //               className="w-full"
// //             />
// //           </div>

// //           <div className="md:col-span-5">
// //             <label className="block text-xs font-medium text-gray-700 mb-1">
// //               Name <span className="text-red-500">*</span>
// //             </label>
// //             <input
// //               type="text"
// //               name="name"
// //               value={newLead.name || ''}
// //               onChange={e => {
// //                 const value = e.target.value.replace(/[0-9]/g, '');
// //                 setNewLead(prev => ({ ...prev, name: value }));
// //               }}
// //               placeholder="Enter Name"
// //               className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
// //               required
// //             />
// //           </div>

// //           <div className="md:col-span-5">
// //             <label className="block text-xs font-medium text-gray-700 mb-1">
// //               Email <span className="text-red-500">*</span>
// //             </label>
// //             <input
// //               type="email"
// //               name="email"
// //               value={newLead.email || ''}
// //               onChange={e => setNewLead(prev => ({ ...prev, email: e.target.value }))}
// //               placeholder="Enter Email"
// //               className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
// //               required
// //             />
// //           </div>
// //         </div>

// //         {/* Second Row - Phone and WhatsApp */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">
// //               Phone <span className="text-red-500">*</span>
// //             </label>
// //             <PhoneInput
// //               country={'in'}
// //               value={newLead.phone || ''}
// //               onChange={(value: string) => handlePhoneChange(value)}
// //               inputClass="!w-full !h-8 !rounded !border-gray-300 !text-xs focus:!ring-1 focus:!ring-blue-500 focus:!border-transparent"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
// //               <FaWhatsapp className="text-green-500" /> WhatsApp Number
// //               <div className="ml-auto flex items-center">
// //                 <label className="relative inline-flex items-center cursor-pointer">
// //                   <input
// //                     type="checkbox"
// //                     checked={sameAsPhone}
// //                     onChange={e => handleSameAsPhoneToggle(e.target.checked)}
// //                     className="sr-only"
// //                   />
// //                   <div className={`w-8 h-3 rounded-full relative transition-colors duration-200 ease-in-out ${sameAsPhone ? 'bg-blue-500' : 'bg-gray-300'}`}>
// //                     <div className={`absolute top-0.3 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ease-in-out ${sameAsPhone ? 'translate-x-5' : 'translate-x-0'}`}></div>
// //                   </div>
// //                   <span className="ml-2 text-xs text-gray-600">{sameAsPhone ? 'Same as phone' : 'Different'}</span>
// //                 </label>
// //               </div>
// //             </label>
// //             <input
// //               type="tel"
// //               value={newLead.whatsapp_number || ''}
// //               onChange={(e) => handleWhatsappChange(e.target.value)}
// //               placeholder="9876543210"
// //               className={`border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${sameAsPhone ? 'bg-gray-100' : ''}`}
// //               maxLength={10}
// //               disabled={sameAsPhone}
// //             />
// //           </div>
// //         </div>

// //         {/* Third Row - Lead Type, Source, Status */}
// //         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Type</label>
// //             <Dropdown
// //               placeholder="Select Lead Type"
// //               options={masterOptions.leadType}
// //               value={valFromLabel(masterOptions.leadType, newLead.lead_type)}
// //               onChange={handleDropdownChange('lead_type', masterOptions.leadType)}
// //               className="w-full"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Priority</label>
// //             <Dropdown
// //               placeholder="Select Priority"
// //               options={masterOptions.priority}
// //               value={valFromLabel(masterOptions.priority, newLead.priority)}
// //               onChange={handleDropdownChange('priority', masterOptions.priority)}
// //               className="w-full"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
// //             <Dropdown
// //               placeholder="Select Lead Source"
// //               options={masterOptions.leadSource}
// //               value={valFromLabel(masterOptions.leadSource, newLead.lead_source)}
// //               onChange={handleDropdownChange('lead_source', masterOptions.leadSource)}
// //               className="w-full"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Status</label>
// //             <Dropdown
// //               placeholder="Select Status"
// //               options={masterOptions.leadStatus}
// //               value={valFromLabel(masterOptions.leadStatus, newLead.status)}
// //               onChange={handleDropdownChange('status', masterOptions.leadStatus)}
// //               className="w-full"
// //             />
// //           </div>
// //         </div>

// //         {/* Fourth Row - State, City, Location */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
// //             <Dropdown
// //               placeholder="Select State"
// //               options={masterOptions.states}
// //               value={valFromLabel(masterOptions.states, newLead.state)}
// //               onChange={handleDropdownChange('state', masterOptions.states)}
// //               className="w-full"
// //               searchable
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
// //             <Dropdown
// //               placeholder="Select City"
// //               options={masterOptions.cities}
// //               value={valFromLabel(masterOptions.cities, newLead.city)}
// //               onChange={handleDropdownChange('city', masterOptions.cities)}
// //               className="w-full"
// //               searchable
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
// //             <Dropdown
// //               placeholder="Select Location"
// //               options={masterOptions.locations}
// //               value={valFromLabel(masterOptions.locations, newLead.location)}
// //               onChange={handleDropdownChange('location', masterOptions.locations)}
// //               className="w-full"
// //               searchable
// //             />
// //           </div>
// //         </div>

// //         {/* Assigned Executive Field */}
// //         <div className="md:col-span-2">
// //           <label className="block text-xs font-medium text-gray-700 mb-1">
// //             Assigned Executive
// //           </label>

// //           {(() => {
// //             if (assignableExecutives.length === 1 && assignableExecutives[0].selfOnly) {
// //               const selfExec = assignableExecutives[0];
// //               return (
// //                 <div className="px-2 py-1.5 border rounded-lg text-xs bg-gray-100 inline-block">
// //                   {selfExec.name} (Auto-assigned)
// //                 </div>
// //               );
// //             }

// //             return (
// //               <select
// //                 className="px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 inline-block"
// //                 value={String(newLead.assigned_executive || "")}
// //                 onChange={(e) => {
// //                   const selectedId = e.target.value;
// //                   const selectedExec = presalesUsers.find(u => u.id === selectedId);
// //                   setNewLead((prev) => ({
// //                     ...prev,
// //                     assigned_executive: selectedId,
// //                     assigned_executive_name: selectedExec?.name || selectedExec?.username || ''
// //                   }));
// //                 }}
// //               >
// //                 <option value="">Unassigned</option>
// //                 {assignableExecutives.map((exec: any) => (
// //                   <option key={exec.id} value={String(exec.id)}>
// //                     {exec.name} {exec.id === user?.id ? '(You)' : ''}
// //                   </option>
// //                 ))}
// //               </select>
// //             );
// //           })()}
// //         </div>

// //         {/* Actions */}
// //         <div className="flex justify-end gap-2 pt-6 mt-4">
// //           <Button variant="outline" onClick={onClose}>Cancel</Button>
// //           <Button onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Add Lead'}</Button>
// //         </div>
// //       </div>
// //     </Modal>
// //   );
// // };

// // export default AddLeadModal;

// // import React, {  useEffect, useState } from 'react';
// // import Modal from '@/components/ui/Modal';
// // import Button from '@/components/ui/Button';
// // import PhoneInput from 'react-phone-input-2';
// // import 'react-phone-input-2/lib/style.css';
// // import { FaWhatsapp } from 'react-icons/fa';
// // import { masterDataAPI } from '@/lib/mastersAPI';
// // import { usersAPI } from '@/lib/api';
// // import { useAuth } from '@/contexts/AuthContext';
// // import { toast } from 'react-toastify';
// // import { getAssignableExecutives } from '@/utils/roleBasedOptions';

// // interface MasterOption {
// //   value: string;
// //   label: string;
// // }

// // interface Lead {
// //   id?: string;
// //   salutation?: string;
// //   name?: string;
// //   phone?: string;
// //   email?: string;
// //   lead_type?: string;
// //   lead_source?: string;
// //   whatsapp_number?: string;
// //   state?: string;
// //   city?: string;
// //   location?: string;
// //   status?: string;
// //   assigned_executive?: string;
// //   assigned_executive_name?: string;
// //   priority?: string;
// //   created_by?: string;
// // }

// // interface AddLeadModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   onSave: (lead: Lead | null) => void;
// //   lead?: Partial<Lead>;
// // }

// // interface DropdownProps {
// //   placeholder: string;
// //   options: MasterOption[];
// //   value: string;
// //   onChange: (value: string) => void;
// //   className?: string;
// //   searchable?: boolean;
// // }

// // // Helper function to format user name
// // const formatUserName = (u: any): string => {
// //   if (!u) return '';

// //   // First try display_name
// //   if (u.display_name && u.display_name.trim()) return u.display_name.trim();

// //   // Then try full_name
// //   if (u.full_name && u.full_name.trim()) return u.full_name.trim();

// //   // Combine salutation + first_name + last_name
// //   const sal = u.salutation ? `${u.salutation}. ` : '';
// //   const fn = u.first_name || '';
// //   const ln = u.last_name || '';
// //   const name = `${sal}${fn}${ln ? ' ' + ln : ''}`.trim();

// //   if (name) return name;

// //   // Fallback to username or email
// //   if (u.username && u.username.trim()) return u.username.trim();
// //   if (u.email && u.email.trim()) return u.email.split('@')[0];

// //   return 'Unknown User';
// // };

// // const Dropdown: React.FC<DropdownProps> = ({
// //   placeholder,
// //   options,
// //   value,
// //   onChange,
// //   className = '',
// //   searchable = false
// // }) => {
// //   const [isOpen, setIsOpen] = React.useState(false);
// //   const [buttonWidth, setButtonWidth] = React.useState(0);
// //   const [searchTerm, setSearchTerm] = React.useState('');
// //   const buttonRef = React.useRef<HTMLButtonElement>(null);
// //   const dropdownRef = React.useRef<HTMLDivElement>(null);
// //   const selectedOption = options.find(option => option.value === value) || null;

// //   const filteredOptions = searchable
// //     ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
// //     : options;

// //   React.useEffect(() => {
// //     if (buttonRef.current) setButtonWidth(buttonRef.current.offsetWidth);
// //   }, [isOpen]);

// //   React.useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //         setSearchTerm('');
// //       }
// //     };
// //     if (isOpen) document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, [isOpen]);

// //   return (
// //     <div className={`relative ${className}`} ref={dropdownRef}>
// //       <button
// //         ref={buttonRef}
// //         type="button"
// //         className="flex items-center justify-between w-full border border-gray-300 rounded px-3 h-8 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs bg-white"
// //         onClick={() => setIsOpen(!isOpen)}
// //       >
// //         <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
// //         <svg className={`ml-2 h-4 w-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
// //           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
// //         </svg>
// //       </button>
// //       {isOpen && (
// //         <div
// //           className="fixed inset-0 z-[9998]"
// //           onClick={() => {
// //             setIsOpen(false);
// //             setSearchTerm('');
// //           }}
// //         >
// //           <div
// //             className="absolute bg-white shadow-lg rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-hidden"
// //             style={{
// //               width: buttonWidth,
// //               top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
// //               left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left + window.scrollX : 0,
// //               zIndex: 9999
// //             } as any}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             {searchable && (
// //               <div className="p-2 border-b">
// //                 <input
// //                   type="text"
// //                   placeholder="Search..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
// //                   onClick={(e) => e.stopPropagation()}
// //                 />
// //               </div>
// //             )}
// //             <div className="overflow-y-auto max-h-48">
// //               {filteredOptions.length > 0 ? (
// //                 filteredOptions.map(option => (
// //                   <button
// //                     key={option.value}
// //                     className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
// //                     onClick={() => {
// //                       onChange(option.value);
// //                       setIsOpen(false);
// //                       setSearchTerm('');
// //                     }}
// //                   >
// //                     {option.label}
// //                   </button>
// //                 ))
// //               ) : (
// //                 <div className="px-3 py-2 text-gray-500">
// //                   {searchable ? "No matching options" : "No options available"}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const emptyLead: Lead = {
// //   salutation: '',
// //   name: '',
// //   phone: '',
// //   email: '', // Empty string as default
// //   lead_type: '',
// //   lead_source: '',
// //   whatsapp_number: '',
// //   state: '',
// //   city: '',
// //   location: '',
// //   status: 'new',
// //   assigned_executive: '',
// //   priority: ''
// // };

// // const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
// //   const { user } = useAuth();
// //   const isEdit = !!lead?.id;
// //   const [newLead, setNewLead] = useState<Lead>({ ...emptyLead });
// //   const [sameAsPhone, setSameAsPhone] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [masterOptions, setMasterOptions] = useState({
// //     salutation: [] as MasterOption[],
// //     leadType: [] as MasterOption[],
// //     leadSource: [] as MasterOption[],
// //     leadStatus: [] as MasterOption[],
// //     states: [] as MasterOption[],
// //     cities: [] as MasterOption[],
// //     locations: [] as MasterOption[],
// //     priority: [] as MasterOption[]
// //   });
// //   const [presalesUsers, setPreSalesUsers] = useState<any[]>([]);

// //   // Helper functions
// //   const digitsOnly = (s?: string) => (s ? String(s).replace(/\D/g, '') : '');
// //   const toE164 = (s?: string) => {
// //     if (!s) return '';
// //     const d = digitsOnly(s);
// //     if (!d) return '';
// //     return d.startsWith('0') ? `+${d.replace(/^0+/, '')}` : `+${d}`;
// //   };
// //   const normalizeWhatsapp = (s?: string) => digitsOnly(s);

// //   // Fetch executives with proper name formatting - FIXED ROLE FILTER
// //   useEffect(() => {
// //     if (!isOpen) return;
// //     let alive = true;

// //     const normalizeText = (text: any): string => {
// //       return (text || "")
// //         .toString()
// //         .trim()
// //         .toLowerCase()
// //         .replace(/[\s-_/]+/g, "")
// //         .replace(/[^a-z]/g, "");
// //     };

// //     (async () => {
// //       try {
// //         console.log("Fetching users for executives...");
// //         const resp = await usersAPI.getAllUsers();
// //         console.log("Raw API response:", resp);

// //         const list =
// //           (Array.isArray(resp?.data) && resp.data) ||
// //           (Array.isArray(resp?.users) && resp.users) ||
// //           (Array.isArray(resp) && resp) ||
// //           [];

// //         console.log("Total users found:", list.length);

// //         // Filter for Presales Executives - FIXED
// //         const execs = list
// //           .filter((u: any) => {
// //             const dept = normalizeText(u?.department || u?.department_name);
// //             const role = normalizeText(u?.role || u?.role_name || u?.title);

// //             console.log(`User: ${u.email || u.username}, Dept: ${dept}, Role: ${role}`);

// //             // Check for Presales department and Executive role
// //             const isPresalesDept = dept.includes('presale');
// //             const isExecutiveRole = role.includes('executive');

// //             return isPresalesDept && isExecutiveRole;
// //           })
// //           .map((u: any) => {
// //             const formattedName = formatUserName(u);
// //             console.log(`Presales Executive found: ${formattedName} (ID: ${u.id})`);

// //             return {
// //               id: String(u.id || u._id || u.user_id),
// //               name: formattedName,
// //               salutation: u.salutation,
// //               first_name: u.first_name,
// //               last_name: u.last_name,
// //               username: u.username,
// //               email: u.email,
// //               department: u.department,
// //               role: u.role,
// //               ...u
// //             };
// //           });

// //         console.log("Filtered Presales Executives:", execs);

// //         if (!alive) return;
// //         setPreSalesUsers(execs);
// //       } catch (e) {
// //         console.error("Error fetching users:", e);
// //         if (!alive) return;
// //         setPreSalesUsers([]);
// //       }
// //     })();

// //     return () => { alive = false; };
// //   }, [isOpen]);

// //   // Fetch master data
// //   const fetchMasterData = async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);
// //       const [leadMasterTypes, commonMasterTypes] = await Promise.all([
// //         masterDataAPI.getAllMasterTypes('lead'),
// //         masterDataAPI.getAllMasterTypes('common')
// //       ]);
// //       const allMasterTypes = [...(leadMasterTypes || []), ...(commonMasterTypes || [])];
// //       const masterValues = await Promise.all(
// //         allMasterTypes.map((mt: any) => masterDataAPI.getMasterValues(mt.id))
// //       );
// //       const organized: Record<string, MasterOption[]> = {};
// //       allMasterTypes.forEach((mt: any, idx: number) => {
// //         const vals = masterValues[idx] || [];
// //         organized[(mt.name || '').toString().toLowerCase()] = vals.map((item: any) => ({
// //           value: String(item.id),
// //           label: item.value || item.name || 'Unknown'
// //         }));
// //       });
// //       setMasterOptions({
// //         salutation: organized['salutation'] || [],
// //         leadType: organized['lead type'] || organized['leadtype'] || [],
// //         leadSource: organized['lead source'] || organized['leadsource'] || [],
// //         leadStatus: organized['lead status'] || organized['leadstatus'] || [],
// //         states: organized['state'] || [],
// //         cities: organized['city'] || [],
// //         locations: organized['location'] || [],
// //         priority: organized['lead priority'] || organized['leadpriority'] || []
// //       });
// //     } catch (err) {
// //       console.error('Failed to load master data:', err);
// //       setError(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (isOpen) {
// //       fetchMasterData();
// //       if (isEdit && lead) {
// //         setNewLead({
// //           id: lead.id,
// //           salutation: lead.salutation || '',
// //           name: lead.name || '',
// //           phone: lead.phone || '',
// //           email: lead.email || '', // Always ensure empty string
// //           lead_type: lead.lead_type || '',
// //           lead_source: lead.lead_source || '',
// //           whatsapp_number: lead.whatsapp_number || '',
// //           state: lead.state || '',
// //           city: lead.city || '',
// //           location: lead.location || '',
// //           status: lead.status || 'new',
// //           assigned_executive: lead.assigned_executive || '',
// //           priority: lead.priority || '',
// //         });

// //         const phoneDigits = digitsOnly(lead.phone);
// //         const waDigits = digitsOnly(lead.whatsapp_number);
// //         setSameAsPhone(!!waDigits && phoneDigits && waDigits === phoneDigits.replace(/^91/, '') || waDigits === phoneDigits);
// //       } else {
// //         // For new leads, auto-assign to current user if they are an executive
// //         const initialLead = { ...emptyLead };

// //         // Auto-assign logic: If user is Presales Executive, assign to themselves
// //         const userDept = (user?.department || '').toString().toLowerCase();
// //         const userRole = (user?.role || '').toString().toLowerCase();

// //         if (userDept.includes('presale') && userRole.includes('executive')) {
// //           initialLead.assigned_executive = String(user.id);
// //         }

// //         setNewLead(initialLead);
// //         setSameAsPhone(false);
// //       }
// //       setError(null);
// //     } else {
// //       setNewLead({ ...emptyLead });
// //       setSameAsPhone(false);
// //       setError(null);
// //       setLoading(false);
// //     }
// //   }, [isOpen, isEdit, lead?.id, user]);

// //   const handleDropdownChange = (name: keyof Lead, options: MasterOption[]) => (value: string) => {
// //     const selected = options.find(opt => opt.value === value);
// //     setNewLead(prev => ({ ...prev, [name]: selected ? selected.label : value }));
// //   };

// //   const handlePhoneChange = (value: string) => {
// //     const withPlus = toE164(value);
// //     setNewLead(prev => {
// //       const updated = { ...prev, phone: withPlus };
// //       if (sameAsPhone) {
// //         const phoneDigits = digitsOnly(withPlus);
// //         const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
// //         updated.whatsapp_number = waDigits;
// //       }
// //       return updated;
// //     });
// //   };

// //   const handleWhatsappChange = (value: string) => {
// //     const numbers = digitsOnly(value);
// //     setNewLead(prev => ({ ...prev, whatsapp_number: numbers }));
// //   };

// //   const handleSameAsPhoneToggle = (checked: boolean) => {
// //     setSameAsPhone(checked);
// //     if (checked) {
// //       const phoneDigits = digitsOnly(newLead.phone || '');
// //       const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
// //       setNewLead(prev => ({ ...prev, whatsapp_number: waDigits }));
// //     }
// //   };

// //   const normalizeNumber = (num?: string) => toE164(num);

// //   const handleSubmit = () => {
// //     if (!String(newLead.name || '').trim()) {
// //       toast.error('Please enter a valid name');
// //       return;
// //     }
// //     if (!newLead.phone) {
// //       toast.error('Please enter phone number');
// //       return;
// //     }

// //     // If email is provided, validate it, but don't require it
// //     const emailValue = newLead.email?.trim() || '';
// //     if (emailValue && emailValue !== '') {
// //       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //       if (!emailRegex.test(emailValue)) {
// //         toast.error('Please enter a valid email address');
// //         return;
// //       }
// //     }

// //     // Prepare payload - SIMPLIFIED APPROACH
// //     const payload: any = {
// //       salutation: newLead.salutation || '',
// //       name: String(newLead.name || '').trim(),
// //       phone: normalizeNumber(newLead.phone) || '',
// //       email: emailValue, // This will be either valid email or empty string
// //       lead_type: newLead.lead_type || '',
// //       lead_source: newLead.lead_source || '',
// //       whatsapp_number: normalizeWhatsapp(newLead.whatsapp_number) || '',
// //       state: newLead.state || '',
// //       city: newLead.city || '',
// //       location: newLead.location || '',
// //       status: newLead.status || 'new',
// //       assigned_executive: newLead.assigned_executive || '',
// //       priority: newLead.priority || '',
// //       created_by: String(user?.id || ''),
// //     };

// //     // For edit mode, include id
// //     if (isEdit && newLead.id) {
// //       payload.id = newLead.id;
// //     }

// //     console.log('Submitting lead payload - Email:', payload.email, 'Type:', typeof payload.email, 'Is empty?', payload.email === '');

// //     // Send only the fields that exist in the database
// //     onSave(payload);
// //   };

// //   const valFromLabel = (opts: MasterOption[], labelOrValue?: string) =>
// //     (labelOrValue ? opts.find(opt => opt.label === labelOrValue)?.value : undefined) || (labelOrValue ?? '');

// //   // Get assignable executives
// //   const assignableExecutives = getAssignableExecutives(user, presalesUsers);

// //   // Debug: Log the filtered executives
// //   useEffect(() => {
// //     if (isOpen) {
// //       console.log("Assignable Executives:", assignableExecutives);
// //       console.log("Presales Users raw:", presalesUsers);
// //     }
// //   }, [isOpen, assignableExecutives, presalesUsers]);

// //   return (
// //     <Modal
// //       isOpen={isOpen}
// //       onClose={onClose}
// //       title={isEdit ? "Edit Lead" : "Add New Lead"}
// //       width="max-w-[95vw] md:max-w-2xl lg:max-w-3xl"
// //     >
// //       <div className="space-y-4 relative" style={{ minHeight: '320px' }}>
// //         {loading && (
// //           <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
// //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
// //             <span className="ml-2">Loading options...</span>
// //           </div>
// //         )}
// //         {error && (
// //           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
// //             <p>{error}</p>
// //             <button onClick={fetchMasterData} className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
// //               Retry Loading Data
// //             </button>
// //           </div>
// //         )}

// //         {/* First Row - Salutation, Name, Email */}
// //         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
// //           <div className="md:col-span-2">
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
// //             <Dropdown
// //               placeholder="Select Salutation"
// //               options={masterOptions.salutation}
// //               value={valFromLabel(masterOptions.salutation, newLead.salutation)}
// //               onChange={handleDropdownChange('salutation', masterOptions.salutation)}
// //               className="w-full"
// //             />
// //           </div>

// //           <div className="md:col-span-5">
// //             <label className="block text-xs font-medium text-gray-700 mb-1">
// //               Name <span className="text-red-500">*</span>
// //             </label>
// //             <input
// //               type="text"
// //               name="name"
// //               value={newLead.name || ''}
// //               onChange={e => {
// //                 const value = e.target.value.replace(/[0-9]/g, '');
// //                 setNewLead(prev => ({ ...prev, name: value }));
// //               }}
// //               placeholder="Enter Name"
// //               className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
// //             />
// //           </div>

// //           <div className="md:col-span-5">
// //             <label className="block text-xs font-medium text-gray-700 mb-1">
// //               Email {/* Removed asterisk */}
// //             </label>
// //             <input
// //               type="email"
// //               name="email"
// //               value={newLead.email || ''}
// //               onChange={e => {
// //                 const value = e.target.value;
// //                 setNewLead(prev => ({
// //                   ...prev,
// //                   email: value
// //                 }));
// //               }}
// //               placeholder="Enter Email (Optional)"
// //               className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
// //             />
// //           </div>
// //         </div>

// //         {/* Second Row - Phone and WhatsApp */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">
// //               Phone <span className="text-red-500">*</span>
// //             </label>
// //             <PhoneInput
// //               country={'in'}
// //               value={newLead.phone || ''}
// //               onChange={(value: string) => handlePhoneChange(value)}
// //               inputClass="!w-full !h-8 !rounded !border-gray-300 !text-xs focus:!ring-1 focus:!ring-blue-500 focus:!border-transparent"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
// //               <FaWhatsapp className="text-green-500" /> WhatsApp Number
// //               <div className="ml-auto flex items-center">
// //                 <label className="relative inline-flex items-center cursor-pointer">
// //                   <input
// //                     type="checkbox"
// //                     checked={sameAsPhone}
// //                     onChange={e => handleSameAsPhoneToggle(e.target.checked)}
// //                     className="sr-only"
// //                   />
// //                   <div className={`w-8 h-3 rounded-full relative transition-colors duration-200 ease-in-out ${sameAsPhone ? 'bg-blue-500' : 'bg-gray-300'}`}>
// //                     <div className={`absolute top-0.3 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ease-in-out ${sameAsPhone ? 'translate-x-5' : 'translate-x-0'}`}></div>
// //                   </div>
// //                   <span className="ml-2 text-xs text-gray-600">{sameAsPhone ? 'Same as phone' : 'Different'}</span>
// //                 </label>
// //               </div>
// //             </label>
// //             <input
// //               type="tel"
// //               value={newLead.whatsapp_number || ''}
// //               onChange={(e) => handleWhatsappChange(e.target.value)}
// //               placeholder="9876543210"
// //               className={`border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${sameAsPhone ? 'bg-gray-100' : ''}`}
// //               maxLength={10}
// //               disabled={sameAsPhone}
// //             />
// //           </div>
// //         </div>

// //         {/* Third Row - Lead Type, Source, Status */}
// //         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Type</label>
// //             <Dropdown
// //               placeholder="Select Lead Type"
// //               options={masterOptions.leadType}
// //               value={valFromLabel(masterOptions.leadType, newLead.lead_type)}
// //               onChange={handleDropdownChange('lead_type', masterOptions.leadType)}
// //               className="w-full"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Priority</label>
// //             <Dropdown
// //               placeholder="Select Priority"
// //               options={masterOptions.priority}
// //               value={valFromLabel(masterOptions.priority, newLead.priority)}
// //               onChange={handleDropdownChange('priority', masterOptions.priority)}
// //               className="w-full"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
// //             <Dropdown
// //               placeholder="Select Lead Source"
// //               options={masterOptions.leadSource}
// //               value={valFromLabel(masterOptions.leadSource, newLead.lead_source)}
// //               onChange={handleDropdownChange('lead_source', masterOptions.leadSource)}
// //               className="w-full"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Status</label>
// //             <Dropdown
// //               placeholder="Select Status"
// //               options={masterOptions.leadStatus}
// //               value={valFromLabel(masterOptions.leadStatus, newLead.status)}
// //               onChange={handleDropdownChange('status', masterOptions.leadStatus)}
// //               className="w-full"
// //             />
// //           </div>
// //         </div>

// //         {/* Fourth Row - State, City, Location */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
// //             <Dropdown
// //               placeholder="Select State"
// //               options={masterOptions.states}
// //               value={valFromLabel(masterOptions.states, newLead.state)}
// //               onChange={handleDropdownChange('state', masterOptions.states)}
// //               className="w-full"
// //               searchable
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
// //             <Dropdown
// //               placeholder="Select City"
// //               options={masterOptions.cities}
// //               value={valFromLabel(masterOptions.cities, newLead.city)}
// //               onChange={handleDropdownChange('city', masterOptions.cities)}
// //               className="w-full"
// //               searchable
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
// //             <Dropdown
// //               placeholder="Select Location"
// //               options={masterOptions.locations}
// //               value={valFromLabel(masterOptions.locations, newLead.location)}
// //               onChange={handleDropdownChange('location', masterOptions.locations)}
// //               className="w-full"
// //               searchable
// //             />
// //           </div>
// //         </div>

// //         {/* Assigned Executive Field */}
// //         <div className="md:col-span-2">
// //           <label className="block text-xs font-medium text-gray-700 mb-1">
// //             Assigned Executive (Presales Executives Only)
// //           </label>

// //           {(() => {
// //             console.log("Rendering executive dropdown, assignableExecutives:", assignableExecutives);

// //             if (assignableExecutives.length === 1 && assignableExecutives[0].selfOnly) {
// //               const selfExec = assignableExecutives[0];
// //               return (
// //                 <div className="px-2 py-1.5 border rounded-lg text-xs bg-gray-100 inline-block">
// //                   {selfExec.name} (Auto-assigned to you)
// //                 </div>
// //               );
// //             }

// //             return (
// //               <div className="space-y-2">
// //                 <select
// //                   className="px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full max-w-xs"
// //                   value={String(newLead.assigned_executive || "")}
// //                   onChange={(e) => {
// //                     const selectedId = e.target.value;
// //                     console.log("Selected executive ID:", selectedId);

// //                     const selectedExec = presalesUsers.find(u => u.id === selectedId);
// //                     console.log("Found selected exec:", selectedExec);

// //                     setNewLead((prev) => ({
// //                       ...prev,
// //                       assigned_executive: selectedId,
// //                     }));
// //                   }}
// //                 >
// //                   <option value="">Unassigned</option>
// //                   {assignableExecutives.length > 0 ? (
// //                     assignableExecutives.map((exec: any) => (
// //                       <option key={exec.id} value={String(exec.id)}>
// //                         {exec.name} {exec.id === user?.id ? '(You)' : ''}
// //                       </option>
// //                     ))
// //                   ) : (
// //                     <option value="" disabled>No Presales Executives found</option>
// //                   )}
// //                 </select>

// //                 {newLead.assigned_executive && (
// //                   <div className="text-xs text-gray-600">
// //                     Selected: <span className="font-medium">
// //                       {presalesUsers.find(u => u.id === newLead.assigned_executive)?.name || 'Unknown'}
// //                     </span>
// //                   </div>
// //                 )}

// //                 {assignableExecutives.length === 0 && (
// //                   <div className="text-xs text-red-500">
// //                     No Presales Executives available. Please check user roles.
// //                   </div>
// //                 )}
// //               </div>
// //             );
// //           })()}
// //         </div>

// //         {/* Actions */}
// //         <div className="flex justify-end gap-2 pt-6 mt-4">
// //           <Button variant="outline" onClick={onClose}>Cancel</Button>
// //           <Button onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Add Lead'}</Button>
// //         </div>
// //       </div>
// //     </Modal>
// //   );
// // };

// // export default AddLeadModal;

// import React, {  useEffect, useState } from 'react';
// import Modal from '@/components/ui/Modal';
// import Button from '@/components/ui/Button';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import { FaWhatsapp } from 'react-icons/fa';
// import { masterDataAPI } from '@/lib/mastersAPI';
// import { usersAPI } from '@/lib/api';
// import { useAuth } from '@/contexts/AuthContext';
// import { toast } from 'react-toastify';
// import { getAssignableExecutives } from '@/utils/roleBasedOptions';

// interface MasterOption {
//   value: string;
//   label: string;
// }

// interface Lead {
//   id?: string;
//   salutation?: string;
//   name?: string;
//   phone?: string;
//   email?: string;
//   lead_type?: string;
//   lead_source?: string;
//   whatsapp_number?: string;
//   state?: string;
//   city?: string;
//   location?: string;
//   status?: string;
//   assigned_executive?: string;
//   assigned_executive_name?: string;
//   priority?: string;
//   created_by?: string;
// }

// interface AddLeadModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (lead: Lead | null) => void;
//   lead?: Partial<Lead>;
// }

// interface DropdownProps {
//   placeholder: string;
//   options: MasterOption[];
//   value: string;
//   onChange: (value: string) => void;
//   className?: string;
//   searchable?: boolean;
// }

// // Helper function to format user name
// const formatUserName = (u: any): string => {
//   if (!u) return '';

//   if (u.display_name && u.display_name.trim()) return u.display_name.trim();
//   if (u.full_name && u.full_name.trim()) return u.full_name.trim();

//   const sal = u.salutation ? `${u.salutation}. ` : '';
//   const fn = u.first_name || '';
//   const ln = u.last_name || '';
//   const name = `${sal}${fn}${ln ? ' ' + ln : ''}`.trim();
//   if (name) return name;

//   if (u.username && u.username.trim()) return u.username.trim();
//   if (u.email && u.email.trim()) return u.email.split('@')[0];
//   return 'Unknown User';
// };

// const Dropdown: React.FC<DropdownProps> = ({
//   placeholder,
//   options,
//   value,
//   onChange,
//   className = '',
//   searchable = false
// }) => {
//   const [isOpen, setIsOpen] = React.useState(false);
//   const [buttonWidth, setButtonWidth] = React.useState(0);
//   const [searchTerm, setSearchTerm] = React.useState('');
//   const buttonRef = React.useRef<HTMLButtonElement>(null);
//   const dropdownRef = React.useRef<HTMLDivElement>(null);
//   const selectedOption = options.find(option => option.value === value) || null;

//   const filteredOptions = searchable
//     ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
//     : options;

//   React.useEffect(() => {
//     if (buttonRef.current) setButtonWidth(buttonRef.current.offsetWidth);
//   }, [isOpen]);

//   React.useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//         setSearchTerm('');
//       }
//     };
//     if (isOpen) document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isOpen]);

//   return (
//     <div className={`relative ${className}`} ref={dropdownRef}>
//       <button
//         ref={buttonRef}
//         type="button"
//         className="flex items-center justify-between w-full border border-gray-300 rounded px-3 h-8 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs bg-white"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
//         <svg className={`ml-2 h-4 w-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
//           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//         </svg>
//       </button>
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-[9998]"
//           onClick={() => {
//             setIsOpen(false);
//             setSearchTerm('');
//           }}
//         >
//           <div
//             className="absolute bg-white shadow-lg rounded-md py-1 text-xs ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-hidden"
//             style={{
//               width: buttonWidth,
//               top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
//               left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left + window.scrollX : 0,
//               zIndex: 9999
//             } as any}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {searchable && (
//               <div className="p-2 border-b">
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   onClick={(e) => e.stopPropagation()}
//                 />
//               </div>
//             )}
//             <div className="overflow-y-auto max-h-48">
//               {filteredOptions.length > 0 ? (
//                 filteredOptions.map(option => (
//                   <button
//                     key={option.value}
//                     className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
//                     onClick={() => {
//                       onChange(option.value);
//                       setIsOpen(false);
//                       setSearchTerm('');
//                     }}
//                   >
//                     {option.label}
//                   </button>
//                 ))
//               ) : (
//                 <div className="px-3 py-2 text-gray-500">
//                   {searchable ? "No matching options" : "No options available"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const emptyLead: Lead = {
//   salutation: '',
//   name: '',
//   phone: '',
//   email: '',
//   lead_type: '',
//   lead_source: '',
//   whatsapp_number: '',
//   state: '',
//   city: '',
//   location: '',
//   status: 'new',
//   assigned_executive: '',
//   priority: ''
// };

// const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
//   const { user } = useAuth();
//   const isEdit = !!lead?.id;
//   const [newLead, setNewLead] = useState<Lead>({ ...emptyLead });
//   const [sameAsPhone, setSameAsPhone] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [masterOptions, setMasterOptions] = useState({
//     salutation: [] as MasterOption[],
//     leadType: [] as MasterOption[],
//     leadSource: [] as MasterOption[],
//     leadStatus: [] as MasterOption[],
//     states: [] as MasterOption[],
//     cities: [] as MasterOption[],
//     locations: [] as MasterOption[],
//     priority: [] as MasterOption[]
//   });
//   const [presalesUsers, setPreSalesUsers] = useState<any[]>([]);

//   const digitsOnly = (s?: string) => (s ? String(s).replace(/\D/g, '') : '');
//   const toE164 = (s?: string) => {
//     if (!s) return '';
//     const d = digitsOnly(s);
//     if (!d) return '';
//     return d.startsWith('0') ? `+${d.replace(/^0+/, '')}` : `+${d}`;
//   };
//   const normalizeWhatsapp = (s?: string) => digitsOnly(s);

//   // Fetch presales executives
//   useEffect(() => {
//     if (!isOpen) return;
//     let alive = true;

//     const normalizeText = (text: any): string => {
//       return (text || "")
//         .toString()
//         .trim()
//         .toLowerCase()
//         .replace(/[\s-_/]+/g, "")
//         .replace(/[^a-z]/g, "");
//     };

//     (async () => {
//       try {
//         const resp = await usersAPI.getAllUsers();
//         const list =
//           (Array.isArray(resp?.data) && resp.data) ||
//           (Array.isArray(resp?.users) && resp.users) ||
//           (Array.isArray(resp) && resp) ||
//           [];

//         const execs = list
//           .filter((u: any) => {
//             const dept = normalizeText(u?.department || u?.department_name);
//             const role = normalizeText(u?.role || u?.role_name || u?.title);
//             return dept.includes('presale') && role.includes('executive');
//           })
//           .map((u: any) => ({
//             id: String(u.id || u._id || u.user_id),
//             name: formatUserName(u),
//             ...u
//           }));

//         if (alive) setPreSalesUsers(execs);
//       } catch (e) {
//         console.error("Error fetching users:", e);
//         if (alive) setPreSalesUsers([]);
//       }
//     })();

//     return () => { alive = false; };
//   }, [isOpen]);

//   // Fetch master data and set default state
//   const fetchMasterData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const [leadMasterTypes, commonMasterTypes] = await Promise.all([
//         masterDataAPI.getAllMasterTypes('lead'),
//         masterDataAPI.getAllMasterTypes('common')
//       ]);
//       const allMasterTypes = [...(leadMasterTypes || []), ...(commonMasterTypes || [])];
//       const masterValues = await Promise.all(
//         allMasterTypes.map((mt: any) => masterDataAPI.getMasterValues(mt.id))
//       );
//       const organized: Record<string, MasterOption[]> = {};
//       allMasterTypes.forEach((mt: any, idx: number) => {
//         const vals = masterValues[idx] || [];
//         organized[(mt.name || '').toString().toLowerCase()] = vals.map((item: any) => ({
//           value: String(item.id),
//           label: item.value || item.name || 'Unknown'
//         }));
//       });
//       setMasterOptions({
//         salutation: organized['salutation'] || [],
//         leadType: organized['lead type'] || organized['leadtype'] || [],
//         leadSource: organized['lead source'] || organized['leadsource'] || [],
//         leadStatus: organized['lead status'] || organized['leadstatus'] || [],
//         states: organized['state'] || [],
//         cities: organized['city'] || [],
//         locations: organized['location'] || [],
//         priority: organized['lead priority'] || organized['leadpriority'] || []
//       });

//       // Set default state to Maharashtra for new leads
//       if (!isEdit && !newLead.state && organized['state']?.length) {
//         const maharashtra = organized['state'].find(
//           (opt: MasterOption) => opt.label.toLowerCase() === 'maharashtra'
//         );
//         if (maharashtra) {
//           setNewLead(prev => ({ ...prev, state: maharashtra.label }));
//         }
//       }
//     } catch (err) {
//       console.error('Failed to load master data:', err);
//       setError(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isOpen) {
//       fetchMasterData();
//       if (isEdit && lead) {
//         setNewLead({
//           id: lead.id,
//           salutation: lead.salutation || '',
//           name: lead.name || '',
//           phone: lead.phone || '',
//           email: lead.email || '',
//           lead_type: lead.lead_type || '',
//           lead_source: lead.lead_source || '',
//           whatsapp_number: lead.whatsapp_number || '',
//           state: lead.state || '',
//           city: lead.city || '',
//           location: lead.location || '',
//           status: lead.status || 'new',
//           assigned_executive: lead.assigned_executive || '',
//           priority: lead.priority || '',
//         });
//         const phoneDigits = digitsOnly(lead.phone);
//         const waDigits = digitsOnly(lead.whatsapp_number);
//         setSameAsPhone(!!waDigits && phoneDigits && waDigits === phoneDigits.replace(/^91/, '') || waDigits === phoneDigits);
//       } else {
//         const initialLead = { ...emptyLead };
//         const userDept = (user?.department || '').toString().toLowerCase();
//         const userRole = (user?.role || '').toString().toLowerCase();
//         if (userDept.includes('presale') && userRole.includes('executive')) {
//           initialLead.assigned_executive = String(user.id);
//         }
//         setNewLead(initialLead);
//         setSameAsPhone(false);
//       }
//       setError(null);
//     } else {
//       setNewLead({ ...emptyLead });
//       setSameAsPhone(false);
//       setError(null);
//       setLoading(false);
//     }
//   }, [isOpen, isEdit, lead?.id, user]);

//   const handleDropdownChange = (name: keyof Lead, options: MasterOption[]) => (value: string) => {
//     const selected = options.find(opt => opt.value === value);
//     setNewLead(prev => ({ ...prev, [name]: selected ? selected.label : value }));
//   };

//   const handlePhoneChange = (value: string) => {
//     const withPlus = toE164(value);
//     setNewLead(prev => {
//       const updated = { ...prev, phone: withPlus };
//       if (sameAsPhone) {
//         const phoneDigits = digitsOnly(withPlus);
//         const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
//         updated.whatsapp_number = waDigits;
//       }
//       return updated;
//     });
//   };

//   const handleWhatsappChange = (value: string) => {
//     const numbers = digitsOnly(value);
//     setNewLead(prev => ({ ...prev, whatsapp_number: numbers }));
//   };

//   const handleSameAsPhoneToggle = (checked: boolean) => {
//     setSameAsPhone(checked);
//     if (checked) {
//       const phoneDigits = digitsOnly(newLead.phone || '');
//       const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
//       setNewLead(prev => ({ ...prev, whatsapp_number: waDigits }));
//     }
//   };

//   const normalizeNumber = (num?: string) => toE164(num);

//   const handleSubmit = () => {
//     if (!String(newLead.name || '').trim()) {
//       toast.error('Please enter a valid name');
//       return;
//     }
//     if (!newLead.phone) {
//       toast.error('Please enter phone number');
//       return;
//     }

//     const emailValue = newLead.email?.trim() || '';
//     if (emailValue && emailValue !== '') {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(emailValue)) {
//         toast.error('Please enter a valid email address');
//         return;
//       }
//     }

//     const payload: any = {
//       salutation: newLead.salutation || '',
//       name: String(newLead.name || '').trim(),
//       phone: normalizeNumber(newLead.phone) || '',
//       email: emailValue,
//       lead_type: newLead.lead_type || '',
//       lead_source: newLead.lead_source || '',
//       whatsapp_number: normalizeWhatsapp(newLead.whatsapp_number) || '',
//       state: newLead.state || '',
//       city: newLead.city || '',
//       location: newLead.location || '',
//       status: newLead.status || 'new',
//       assigned_executive: newLead.assigned_executive || '',
//       priority: newLead.priority || '',
//       created_by: String(user?.id || ''),
//     };

//     if (isEdit && newLead.id) {
//       payload.id = newLead.id;
//     }

//     onSave(payload);
//   };

//   const valFromLabel = (opts: MasterOption[], labelOrValue?: string) =>
//     (labelOrValue ? opts.find(opt => opt.label === labelOrValue)?.value : undefined) || (labelOrValue ?? '');

//   const assignableExecutives = getAssignableExecutives(user, presalesUsers);

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title={isEdit ? "Edit Lead" : "Add New Lead"}
//       width="max-w-[95vw] md:max-w-2xl lg:max-w-3xl"
//     >
//       <div className="space-y-4 relative" style={{ minHeight: '320px' }}>
//         {loading && (
//           <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//             <span className="ml-2">Loading options...</span>
//           </div>
//         )}
//         {error && (
//           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
//             <p>{error}</p>
//             <button onClick={fetchMasterData} className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
//               Retry Loading Data
//             </button>
//           </div>
//         )}

//         {/* Salutation, Name, Email */}
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
//           <div className="md:col-span-2">
//             <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
//             <Dropdown
//               placeholder="Select Salutation"
//               options={masterOptions.salutation}
//               value={valFromLabel(masterOptions.salutation, newLead.salutation)}
//               onChange={handleDropdownChange('salutation', masterOptions.salutation)}
//               className="w-full"
//             />
//           </div>
//           <div className="md:col-span-5">
//             <label className="block text-xs font-medium text-gray-700 mb-1">
//               Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={newLead.name || ''}
//               onChange={e => setNewLead(prev => ({ ...prev, name: e.target.value.replace(/[0-9]/g, '') }))}
//               placeholder="Enter Name"
//               className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//           <div className="md:col-span-5">
//             <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               value={newLead.email || ''}
//               onChange={e => setNewLead(prev => ({ ...prev, email: e.target.value }))}
//               placeholder="Enter Email (Optional)"
//               className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
//         </div>

//         {/* Phone & WhatsApp */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">
//               Phone <span className="text-red-500">*</span>
//             </label>
//             <PhoneInput
//               country={'in'}
//               value={newLead.phone || ''}
//               onChange={handlePhoneChange}
//               inputClass="!w-full !h-8 !rounded !border-gray-300 !text-xs focus:!ring-1 focus:!ring-blue-500 focus:!border-transparent"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
//               <FaWhatsapp className="text-green-500" /> WhatsApp Number
//               <div className="ml-auto flex items-center">
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={sameAsPhone}
//                     onChange={e => handleSameAsPhoneToggle(e.target.checked)}
//                     className="sr-only"
//                   />
//                   <div className={`w-8 h-3 rounded-full relative transition-colors ${sameAsPhone ? 'bg-blue-500' : 'bg-gray-300'}`}>
//                     <div className={`absolute top-0.3 left-0.5 bg-white w-3 h-3 rounded-full transition-transform ${sameAsPhone ? 'translate-x-5' : 'translate-x-0'}`}></div>
//                   </div>
//                   <span className="ml-2 text-xs text-gray-600">{sameAsPhone ? 'Same as phone' : 'Different'}</span>
//                 </label>
//               </div>
//             </label>
//             <input
//               type="tel"
//               value={newLead.whatsapp_number || ''}
//               onChange={(e) => handleWhatsappChange(e.target.value)}
//               placeholder="9876543210"
//               className={`border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${sameAsPhone ? 'bg-gray-100' : ''}`}
//               maxLength={10}
//               disabled={sameAsPhone}
//             />
//           </div>
//         </div>

//         {/* Lead Type, Priority, Source, Status */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Type</label>
//             <Dropdown
//               placeholder="Select Lead Type"
//               options={masterOptions.leadType}
//               value={valFromLabel(masterOptions.leadType, newLead.lead_type)}
//               onChange={handleDropdownChange('lead_type', masterOptions.leadType)}
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Priority</label>
//             <Dropdown
//               placeholder="Select Priority"
//               options={masterOptions.priority}
//               value={valFromLabel(masterOptions.priority, newLead.priority)}
//               onChange={handleDropdownChange('priority', masterOptions.priority)}
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
//             <Dropdown
//               placeholder="Select Lead Source"
//               options={masterOptions.leadSource}
//               value={valFromLabel(masterOptions.leadSource, newLead.lead_source)}
//               onChange={handleDropdownChange('lead_source', masterOptions.leadSource)}
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">Lead Status</label>
//             <Dropdown
//               placeholder="Select Status"
//               options={masterOptions.leadStatus}
//               value={valFromLabel(masterOptions.leadStatus, newLead.status)}
//               onChange={handleDropdownChange('status', masterOptions.leadStatus)}
//             />
//           </div>
//         </div>

//         {/* State, City, Location */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
//             <Dropdown
//               placeholder="Select State"
//               options={masterOptions.states}
//               value={valFromLabel(masterOptions.states, newLead.state)}
//               onChange={handleDropdownChange('state', masterOptions.states)}
//               searchable
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
//             <Dropdown
//               placeholder="Select City"
//               options={masterOptions.cities}
//               value={valFromLabel(masterOptions.cities, newLead.city)}
//               onChange={handleDropdownChange('city', masterOptions.cities)}
//               searchable
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
//             <Dropdown
//               placeholder="Select Location"
//               options={masterOptions.locations}
//               value={valFromLabel(masterOptions.locations, newLead.location)}
//               onChange={handleDropdownChange('location', masterOptions.locations)}
//               searchable
//             />
//           </div>
//         </div>

//         {/* Assigned Executive */}
//         <div>
//           <label className="block text-xs font-medium text-gray-700 mb-1">
//             Assigned Executive (Presales Executives Only)
//           </label>
//           {assignableExecutives.length === 1 && assignableExecutives[0].selfOnly ? (
//             <div className="px-2 py-1.5 border rounded-lg text-xs bg-gray-100 inline-block">
//               {assignableExecutives[0].name} (Auto-assigned to you)
//             </div>
//           ) : (
//             <div className="space-y-2">
//               <select
//                 className="px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full max-w-xs"
//                 value={String(newLead.assigned_executive || "")}
//                 onChange={(e) => setNewLead(prev => ({ ...prev, assigned_executive: e.target.value }))}
//               >
//                 <option value="">Unassigned</option>
//                 {assignableExecutives.map((exec: any) => (
//                   <option key={exec.id} value={String(exec.id)}>
//                     {exec.name} {exec.id === user?.id ? '(You)' : ''}
//                   </option>
//                 ))}
//               </select>
//               {newLead.assigned_executive && (
//                 <div className="text-xs text-gray-600">
//                   Selected: <span className="font-medium">
//                     {/* FIX: Convert both to string for proper comparison */}
//                     {assignableExecutives.find(exec => String(exec.id) === String(newLead.assigned_executive))?.name || 'Unknown'}
//                   </span>
//                 </div>
//               )}
//               {assignableExecutives.length === 0 && (
//                 <div className="text-xs text-red-500">
//                   No Presales Executives available. Please check user roles.
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-2 pt-6 mt-4">
//           <Button variant="outline" onClick={onClose}>Cancel</Button>
//           <Button onClick={handleSubmit}>{isEdit ? 'Save Changes' : 'Add Lead'}</Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default AddLeadModal;


import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaWhatsapp } from 'react-icons/fa';
import { masterDataAPI } from '@/lib/mastersAPI';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getAssignableExecutives } from '@/utils/roleBasedOptions';
import { User, Mail, Phone, MapPin, Building, Briefcase, Flag, Tag, Users, AlertCircle, ChevronDown, UserPlus, X } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface MasterOption {
  value: string;
  label: string;
}

interface Lead {
  id?: string;
  salutation?: string;
  name?: string;
  phone?: string;
  email?: string;
  lead_type?: string;
  lead_source?: string;
  whatsapp_number?: string;
  state?: string;
  city?: string;
  location?: string;
  status?: string;
  assigned_executive?: string;
  assigned_executive_name?: string;
  priority?: string;
  created_by?: string;
}

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead | null) => void;
  lead?: Partial<Lead>;
}

interface DropdownProps {
  placeholder: string;
  options: MasterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  searchable?: boolean;
}

const formatUserName = (u: any): string => {
  if (!u) return '';
  if (u.display_name && u.display_name.trim()) return u.display_name.trim();
  if (u.full_name && u.full_name.trim()) return u.full_name.trim();
  const sal = u.salutation ? `${u.salutation}. ` : '';
  const fn = u.first_name || '';
  const ln = u.last_name || '';
  const name = `${sal}${fn}${ln ? ' ' + ln : ''}`.trim();
  if (name) return name;
  if (u.username && u.username.trim()) return u.username.trim();
  if (u.email && u.email.trim()) return u.email.split('@')[0];
  return 'Unknown User';
};

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  options,
  value,
  onChange,
  className = '',
  searchable = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [buttonWidth, setButtonWidth] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value) || null;

  const filteredOptions = searchable
    ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  React.useEffect(() => {
    if (buttonRef.current) setButtonWidth(buttonRef.current.offsetWidth);
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center justify-between w-full border rounded px-2 h-7 text-left focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent text-[11px] bg-white transition-all"
        style={{ borderColor: BD }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate" style={{ color: selectedOption ? N : MU }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: MU }} />
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        >
          <div
            className="absolute bg-white shadow-xl rounded-md py-1 text-[11px] ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-hidden"
            style={{
              width: buttonWidth,
              top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
              left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left + window.scrollX : 0,
              zIndex: 9999,
              border: `1px solid ${BD}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {searchable && (
              <div className="p-1.5 border-b" style={{ borderColor: BD }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                  style={{ borderColor: BD }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <button
                    key={option.value}
                    className={`block w-full text-left px-2 py-1.5 hover:bg-orange-50 transition-colors text-[11px] ${value === option.value ? 'text-orange-600 font-medium' : ''}`}
                    style={{ color: value === option.value ? O : MU }}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-2 py-1.5 text-[11px]" style={{ color: MU }}>
                  {searchable ? "No matching options" : "No options available"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const emptyLead: Lead = {
  salutation: '',
  name: '',
  phone: '',
  email: '',
  lead_type: '',
  lead_source: '',
  whatsapp_number: '',
  state: '',
  city: '',
  location: '',
  status: 'new',
  assigned_executive: '',
  priority: ''
};

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
  const { user } = useAuth();
  const isEdit = !!lead?.id;
  const [newLead, setNewLead] = useState<Lead>({ ...emptyLead });
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState({
    salutation: [] as MasterOption[],
    leadType: [] as MasterOption[],
    leadSource: [] as MasterOption[],
    leadStatus: [] as MasterOption[],
    states: [] as MasterOption[],
    cities: [] as MasterOption[],
    locations: [] as MasterOption[],
    priority: [] as MasterOption[]
  });
  const [presalesUsers, setPreSalesUsers] = useState<any[]>([]);

  const digitsOnly = (s?: string) => (s ? String(s).replace(/\D/g, '') : '');
  const toE164 = (s?: string) => {
    if (!s) return '';
    const d = digitsOnly(s);
    if (!d) return '';
    return d.startsWith('0') ? `+${d.replace(/^0+/, '')}` : `+${d}`;
  };
  const normalizeWhatsapp = (s?: string) => digitsOnly(s);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;

    const normalizeText = (text: any): string => {
      return (text || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s-_/]+/g, "")
        .replace(/[^a-z]/g, "");
    };

    (async () => {
      try {
        const resp = await usersAPI.getAllUsers();
        const list =
          (Array.isArray(resp?.data) && resp.data) ||
          (Array.isArray(resp?.users) && resp.users) ||
          (Array.isArray(resp) && resp) ||
          [];

        const execs = list
          .filter((u: any) => {
            const dept = normalizeText(u?.department || u?.department_name);
            const role = normalizeText(u?.role || u?.role_name || u?.title);
            return dept.includes('presale') && role.includes('executive');
          })
          .map((u: any) => ({
            id: String(u.id || u._id || u.user_id),
            name: formatUserName(u),
            ...u
          }));

        if (alive) setPreSalesUsers(execs);
      } catch (e) {
        console.error("Error fetching users:", e);
        if (alive) setPreSalesUsers([]);
      }
    })();

    return () => { alive = false; };
  }, [isOpen]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leadMasterTypes, commonMasterTypes] = await Promise.all([
        masterDataAPI.getAllMasterTypes('lead'),
        masterDataAPI.getAllMasterTypes('common')
      ]);
      const allMasterTypes = [...(leadMasterTypes || []), ...(commonMasterTypes || [])];
      const masterValues = await Promise.all(
        allMasterTypes.map((mt: any) => masterDataAPI.getMasterValues(mt.id))
      );
      const organized: Record<string, MasterOption[]> = {};
      allMasterTypes.forEach((mt: any, idx: number) => {
        const vals = masterValues[idx] || [];
        organized[(mt.name || '').toString().toLowerCase()] = vals.map((item: any) => ({
          value: String(item.id),
          label: item.value || item.name || 'Unknown'
        }));
      });
      setMasterOptions({
        salutation: organized['salutation'] || [],
        leadType: organized['lead type'] || organized['leadtype'] || [],
        leadSource: organized['lead source'] || organized['leadsource'] || [],
        leadStatus: organized['lead status'] || organized['leadstatus'] || [],
        states: organized['state'] || [],
        cities: organized['city'] || [],
        locations: organized['location'] || [],
        priority: organized['lead priority'] || organized['leadpriority'] || []
      });

      if (!isEdit && !newLead.state && organized['state']?.length) {
        const maharashtra = organized['state'].find(
          (opt: MasterOption) => opt.label.toLowerCase() === 'maharashtra'
        );
        if (maharashtra) {
          setNewLead(prev => ({ ...prev, state: maharashtra.label }));
        }
      }
    } catch (err) {
      console.error('Failed to load master data:', err);
      setError(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMasterData();
      if (isEdit && lead) {
        setNewLead({
          id: lead.id,
          salutation: lead.salutation || '',
          name: lead.name || '',
          phone: lead.phone || '',
          email: lead.email || '',
          lead_type: lead.lead_type || '',
          lead_source: lead.lead_source || '',
          whatsapp_number: lead.whatsapp_number || '',
          state: lead.state || '',
          city: lead.city || '',
          location: lead.location || '',
          status: lead.status || 'new',
          assigned_executive: lead.assigned_executive || '',
          priority: lead.priority || '',
        });
        const phoneDigits = digitsOnly(lead.phone);
        const waDigits = digitsOnly(lead.whatsapp_number);
        setSameAsPhone(!!waDigits && phoneDigits && waDigits === phoneDigits.replace(/^91/, '') || waDigits === phoneDigits);
      } else {
        const initialLead = { ...emptyLead };
        const userDept = (user?.department || '').toString().toLowerCase();
        const userRole = (user?.role || '').toString().toLowerCase();
        if (userDept.includes('presale') && userRole.includes('executive')) {
          initialLead.assigned_executive = String(user.id);
        }
        setNewLead(initialLead);
        setSameAsPhone(false);
      }
      setError(null);
    } else {
      setNewLead({ ...emptyLead });
      setSameAsPhone(false);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, isEdit, lead?.id, user]);

  const handleDropdownChange = (name: keyof Lead, options: MasterOption[]) => (value: string) => {
    const selected = options.find(opt => opt.value === value);
    setNewLead(prev => ({ ...prev, [name]: selected ? selected.label : value }));
  };

  const handlePhoneChange = (value: string) => {
    const withPlus = toE164(value);
    setNewLead(prev => {
      const updated = { ...prev, phone: withPlus };
      if (sameAsPhone) {
        const phoneDigits = digitsOnly(withPlus);
        const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
        updated.whatsapp_number = waDigits;
      }
      return updated;
    });
  };

  const handleWhatsappChange = (value: string) => {
    const numbers = digitsOnly(value);
    setNewLead(prev => ({ ...prev, whatsapp_number: numbers }));
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      const phoneDigits = digitsOnly(newLead.phone || '');
      const waDigits = phoneDigits.startsWith('91') ? phoneDigits.replace(/^91/, '') : phoneDigits;
      setNewLead(prev => ({ ...prev, whatsapp_number: waDigits }));
    }
  };

  const normalizeNumber = (num?: string) => toE164(num);

  const handleSubmit = () => {
    if (!String(newLead.name || '').trim()) {
      toast.error('Please enter a valid name');
      return;
    }
    if (!newLead.phone) {
      toast.error('Please enter phone number');
      return;
    }

    const emailValue = newLead.email?.trim() || '';
    if (emailValue && emailValue !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    const payload: any = {
      salutation: newLead.salutation || '',
      name: String(newLead.name || '').trim(),
      phone: normalizeNumber(newLead.phone) || '',
      email: emailValue,
      lead_type: newLead.lead_type || '',
      lead_source: newLead.lead_source || '',
      whatsapp_number: normalizeWhatsapp(newLead.whatsapp_number) || '',
      state: newLead.state || '',
      city: newLead.city || '',
      location: newLead.location || '',
      status: newLead.status || 'new',
      assigned_executive: newLead.assigned_executive || '',
      priority: newLead.priority || '',
      created_by: String(user?.id || ''),
    };

    if (isEdit && newLead.id) {
      payload.id = newLead.id;
    }

    onSave(payload);
  };

  const valFromLabel = (opts: MasterOption[], labelOrValue?: string) =>
    (labelOrValue ? opts.find(opt => opt.label === labelOrValue)?.value : undefined) || (labelOrValue ?? '');

  const assignableExecutives = getAssignableExecutives(user, presalesUsers);

  return (
   <Modal
  isOpen={isOpen}
  onClose={onClose}
  showHeader={false}      // Hides Modal's header
  showCloseButton={false} // Hides Modal's close button
  width="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl"
>

      {/* Header with Navy Color */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b rounded-t-lg" style={{ background: N, borderColor: BD }}>
        <div className="flex items-center gap-2">
          <UserPlus size={16} style={{ color: O }} />
          <h2 className="text-sm font-bold text-white">{isEdit ? "Edit Lead" : "Add New Lead"}</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
          <X size={16} style={{ color: 'white' }} />
        </button>
      </div>

      <div className="relative px-3 py-3 max-h-[85vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent mb-1" style={{ borderColor: O, borderTopColor: 'transparent' }} />
            <p className="text-[10px] font-semibold" style={{ color: N }}>Loading...</p>
          </div>
        )}

        {error && (
          <div className="mb-2 flex items-start gap-1.5 bg-red-50 border border-red-200 text-red-600 px-2 py-1.5 rounded-lg text-[10px]">
            <AlertCircle size={11} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
            <button onClick={fetchMasterData} className="ml-auto text-[9px] underline">Retry</button>
          </div>
        )}

        <div className="space-y-3">
          {/* Name Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Salutation</label>
              <Dropdown
                placeholder="Salutation"
                options={masterOptions.salutation}
                value={valFromLabel(masterOptions.salutation, newLead.salutation)}
                onChange={handleDropdownChange('salutation', masterOptions.salutation)}
                className="w-full"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>
                Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <input
                  type="text"
                  value={newLead.name || ''}
                  onChange={e => setNewLead(prev => ({ ...prev, name: e.target.value.replace(/[0-9]/g, '') }))}
                  placeholder="Full Name"
                  className="w-full pl-7 pr-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                />
              </div>
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Email</label>
              <div className="relative">
                <Mail size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <input
                  type="email"
                  value={newLead.email || ''}
                  onChange={e => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email (Optional)"
                  className="w-full pl-7 pr-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                />
              </div>
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>
                Phone <span className="text-red-400">*</span>
              </label>
              <PhoneInput
                country={'in'}
                value={newLead.phone || ''}
                onChange={handlePhoneChange}
                inputClass="!w-full !h-7 !rounded !border-gray-300 !text-[11px] focus:!ring-1 focus:!ring-orange-500 !pl-10"
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5 flex items-center gap-1" style={{ color: N }}>
                <FaWhatsapp className="text-green-500" size={11} /> WhatsApp
                <div className="ml-auto flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={e => handleSameAsPhoneToggle(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-3 rounded-full relative transition-colors ${sameAsPhone ? 'bg-orange-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-2 h-2 rounded-full transition-transform ${sameAsPhone ? 'translate-x-3' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="ml-1.5 text-[8px]" style={{ color: MU }}>{sameAsPhone ? 'Same' : 'Different'}</span>
                  </label>
                </div>
              </label>
              <input
                type="tel"
                value={newLead.whatsapp_number || ''}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                placeholder="9876543210"
                className={`w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1 ${sameAsPhone ? 'bg-gray-100' : ''}`}
                style={{ borderColor: BD }}
                maxLength={10}
                disabled={sameAsPhone}
              />
            </div>
          </div>

          {/* Lead Type, Priority, Source, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Lead Type</label>
              <Dropdown
                placeholder="Type"
                options={masterOptions.leadType}
                value={valFromLabel(masterOptions.leadType, newLead.lead_type)}
                onChange={handleDropdownChange('lead_type', masterOptions.leadType)}
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Priority</label>
              <Dropdown
                placeholder="Priority"
                options={masterOptions.priority}
                value={valFromLabel(masterOptions.priority, newLead.priority)}
                onChange={handleDropdownChange('priority', masterOptions.priority)}
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Lead Source</label>
              <Dropdown
                placeholder="Source"
                options={masterOptions.leadSource}
                value={valFromLabel(masterOptions.leadSource, newLead.lead_source)}
                onChange={handleDropdownChange('lead_source', masterOptions.leadSource)}
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Lead Status</label>
              <Dropdown
                placeholder="Status"
                options={masterOptions.leadStatus}
                value={valFromLabel(masterOptions.leadStatus, newLead.status)}
                onChange={handleDropdownChange('status', masterOptions.leadStatus)}
              />
            </div>
          </div>

          {/* State, City, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>State</label>
              <div className="relative">
                <Flag size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <Dropdown
                  placeholder="Select State"
                  options={masterOptions.states}
                  value={valFromLabel(masterOptions.states, newLead.state)}
                  onChange={handleDropdownChange('state', masterOptions.states)}
                  className="w-full"
                  searchable
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>City</label>
              <div className="relative">
                <Building size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <Dropdown
                  placeholder="Select City"
                  options={masterOptions.cities}
                  value={valFromLabel(masterOptions.cities, newLead.city)}
                  onChange={handleDropdownChange('city', masterOptions.cities)}
                  className="w-full"
                  searchable
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Location</label>
              <div className="relative">
                <MapPin size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <Dropdown
                  placeholder="Select Location"
                  options={masterOptions.locations}
                  value={valFromLabel(masterOptions.locations, newLead.location)}
                  onChange={handleDropdownChange('location', masterOptions.locations)}
                  className="w-full"
                  searchable
                />
              </div>
            </div>
          </div>

          {/* Assigned Executive */}
          <div>
            <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>
              <Users size={10} className="inline mr-1" style={{ color: O }} /> Assigned Executive
            </label>
            {assignableExecutives.length === 1 && assignableExecutives[0].selfOnly ? (
              <div className="px-2 py-1 rounded text-[10px]" style={{ background: `${N}10`, color: N }}>
                {assignableExecutives[0].name} (Auto-assigned to you)
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                  value={String(newLead.assigned_executive || "")}
                  onChange={(e) => setNewLead(prev => ({ ...prev, assigned_executive: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {assignableExecutives.map((exec: any) => (
                    <option key={exec.id} value={String(exec.id)}>
                      {exec.name} {exec.id === user?.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
                {newLead.assigned_executive && (
                  <div className="text-[9px]" style={{ color: MU }}>
                    Selected: <span className="font-medium" style={{ color: O }}>
                      {assignableExecutives.find(exec => String(exec.id) === String(newLead.assigned_executive))?.name || 'Unknown'}
                    </span>
                  </div>
                )}
                {assignableExecutives.length === 0 && (
                  <div className="text-[9px]" style={{ color: '#dc2626' }}>No Presales Executives available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1.5 pt-3 mt-2 border-t" style={{ borderColor: BD }}>
          <button onClick={onClose} className="px-2 py-1 text-[10px] border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-2 py-1 text-[10px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90" style={{ background: O }}>
            {isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddLeadModal;