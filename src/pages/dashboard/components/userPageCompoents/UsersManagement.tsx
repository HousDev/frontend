// // ./components/userPageCompoents/UsersManagement.tsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Search, Edit, Trash2, Mail, Phone, Calendar, Activity, CheckCircle, XCircle,
//   Eye, Share2, MessageCircle, Copy, Plus, Users as UsersIcon, UserPlus
// } from 'lucide-react';
// import { usersAPI } from '@/lib/api';
// import Button from '@/components/ui/Button';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';

// import { buyerAPI } from '@/lib/buyerAPI';
// import { sellerAPI } from '@/lib/sellersAPI';
// import { toast } from 'react-toastify';

// interface User {
//   id?: string | number;
//   username?: string;
//   email: string;
//   salutation?: string;
//   first_name: string;
//   last_name: string;
//   password?: string;
//   role: string;
//   phone?: string;
//   avatar?: string;
//   designation?: string;
//   department?: string;
//   is_active?: boolean;
//   last_login?: string;
//   created_at?: string;
//   total_leads?: number;
//   total_properties?: number;
//   total_revenue?: number;
//   modulePermissions?: any;
//   dob?: string;
//   blood_group?: string;
//   buyer_id?: string | number | null;
//   seller_id?: string | number | null;
// }

// interface UsersManagementProps {
//   onEditUser: (user: User) => void;
//   refreshTrigger: number;
//   userPasswords?: { [key: string]: string };
//   getLabelFromValue: (masterKey: string, value: string) => string;
//   masters: Record<string, any[]>;
//   masterLoading: boolean;
//   onCreateUser?: (opts: { role: 'buyer' | 'seller'; prefill?: Partial<User> }) => Promise<void> | void;
// }

// const TABS = [
//   { id: 'all', name: 'Team Members', roles: ['admin', 'executive', 'manager', 'team leader', 'agent', 'sales team leader', 'presales team leader', 'sales manager', 'marketing executive', 'presales executive','sales executive'], showCreateButton: false, createButtonText: '' },
//   { id: 'buyers', name: 'Buyers', roles: ['buyer'], showCreateButton: true, createButtonText: '' },
//   { id: 'sellers', name: 'Sellers', roles: ['seller'], showCreateButton: true, createButtonText: '' },
//   { id: 'buyer-accounts', name: 'Buyer Accounts', roles: ['buyer'], showCreateButton: true, createButtonText: '' },
//   { id: 'seller-accounts', name: 'Seller Accounts', roles: ['seller'], showCreateButton: true, createButtonText: 'Create Seller Account' }
// ];

// const LOCAL_STORAGE_TAB_KEY = 'users-management-active-tab';

// // LocalCreateModal Component for editable prefill data
// const LocalCreateModal: React.FC<{
//   createAccountTypeLocal: 'buyer' | 'seller';
//   createPrefill: Partial<User> | null;
//   localCreating: boolean;
//   onSubmit: (data: Partial<User>) => void;
//   onClose: () => void;
// }> = ({ createAccountTypeLocal, createPrefill, localCreating, onSubmit, onClose }) => {
//   const [formData, setFormData] = useState<Partial<User>>({
//     salutation: createPrefill?.salutation || '',
//     first_name: createPrefill?.first_name || '',
//     last_name: createPrefill?.last_name || '',
//     email: createPrefill?.email || '',
//     phone: createPrefill?.phone || '',
//     username: createPrefill?.username || '',
//     dob: createPrefill?.dob || '',
//     password: '',
//     buyer_id: createPrefill?.buyer_id ?? null,
//     seller_id: createPrefill?.seller_id ?? null,
//   });

//   // Update form data when prefill changes
//   useEffect(() => {
//     if (createPrefill) {
//       setFormData({
//         salutation: createPrefill.salutation || '',
//         first_name: createPrefill.first_name || '',
//         last_name: createPrefill.last_name || '',
//         email: createPrefill.email || '',
//         phone: createPrefill.phone || '',
//         username: createPrefill.username || '',
//         dob: createPrefill.dob || '',
//         password: '',
//         buyer_id: createPrefill.buyer_id ?? null,
//         seller_id: createPrefill.seller_id ?? null,
//       });
//     }
//   }, [createPrefill]);

//   const handleInputChange = (field: keyof User, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           Create {createAccountTypeLocal === 'buyer' ? 'Buyer' : 'Seller'} Account
//         </h3>
//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             {/* Prefill info banner */}
//             {(formData.buyer_id || formData.seller_id) && (
//               <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
//                 <p className="text-xs text-yellow-800 font-medium">
//                   🔗 Linking to {createAccountTypeLocal}: {formData.buyer_id || formData.seller_id}
//                   <br />You can edit the prefilled data below.
//                 </p>
//               </div>
//             )}

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Salutation</label>
//                 <select
//                   value={formData.salutation || ''}
//                   onChange={(e) => handleInputChange('salutation', e.target.value)}
//                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">-- Select --</option>
//                   <option value="Mr">Mr</option>
//                   <option value="Mrs">Mrs</option>
//                   <option value="Ms">Ms</option>
//                   <option value="Dr">Dr</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
//                 <input
//                   type="text"
//                   value={formData.first_name || ''}
//                   onChange={(e) => handleInputChange('first_name', e.target.value)}
//                   required
//                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
//                 <input
//                   type="text"
//                   value={formData.last_name || ''}
//                   onChange={(e) => handleInputChange('last_name', e.target.value)}
//                   required
//                   className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//               <input
//                 type="email"
//                 value={formData.email || ''}
//                 onChange={(e) => handleInputChange('email', e.target.value)}
//                 required
//                 className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//               <input
//                 type="tel"
//                 value={formData.phone || ''}
//                 onChange={(e) => handleInputChange('phone', e.target.value)}
//                 className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
//               <input
//                 type="text"
//                 value={formData.username || ''}
//                 onChange={(e) => handleInputChange('username', e.target.value)}
//                 className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
//               <input
//                 type="date"
//                 value={formData.dob || ''}
//                 onChange={(e) => handleInputChange('dob', e.target.value)}
//                 className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//               <input
//                 type="password"
//                 value={formData.password || ''}
//                 onChange={(e) => handleInputChange('password', e.target.value)}
//                 required
//                 className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter password for new user"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end space-x-2 mt-6">
//             <Button type="button" variant="outline" onClick={onClose} disabled={localCreating}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={localCreating || !formData.first_name || !formData.last_name || !formData.email || !formData.password}>
//               {localCreating ? 'Creating...' : 'Create Account'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const UsersManagement: React.FC<UsersManagementProps> = ({
//   onEditUser,
//   refreshTrigger,
//   userPasswords = {},
//   getLabelFromValue,
//   masters,
//   masterLoading,
//   onCreateUser
// }) => {
//   const navigate = useNavigate();
//   const [allUsers, setAllUsers] = useState<User[]>([]);
//   const [buyersData, setBuyersData] = useState<User[]>([]);
//   const [sellersData, setSellersData] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [selectedUsers, setSelectedUsers] = useState<Array<string | number>>([]);
//   const [showBulkActions, setShowBulkActions] = useState(false);

//   // Tab state from localStorage
//   const [activeTab, setActiveTab] = useState<'all' | 'buyers' | 'sellers' | 'buyer-accounts' | 'seller-accounts'>(() => {
//     const savedTab = localStorage.getItem(LOCAL_STORAGE_TAB_KEY) as any;
//     return (savedTab && TABS.find(t => t.id === savedTab)) ? savedTab : 'all';
//   });

//   // Modals state
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [sharingUser, setSharingUser] = useState<User | null>(null);
//   const [showCreateModalLocal, setShowCreateModalLocal] = useState(false);
//   const [createAccountTypeLocal, setCreateAccountTypeLocal] = useState<'buyer' | 'seller'>('buyer');
//   const [createPrefill, setCreatePrefill] = useState<Partial<User> | null>(null);
//   const [localCreating, setLocalCreating] = useState(false);

//   // FIXED: Utility functions for proper date handling
//   const formatDateForAPI = (dateValue: string | Date | null | undefined): string | null => {
//     if (!dateValue) return null;

//     // If it's already a YYYY-MM-DD string, return as-is
//     if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
//       return dateValue;
//     }

//     // If it's a Date object, convert using local date components (no timezone conversion)
//     if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
//       const year = dateValue.getFullYear();
//       const month = String(dateValue.getMonth() + 1).padStart(2, '0');
//       const day = String(dateValue.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     }

//     // Try parsing string and rebuild with local components
//     if (typeof dateValue === 'string') {
//       try {
//         const date = new Date(dateValue);
//         if (!isNaN(date.getTime())) {
//           const year = date.getFullYear();
//           const month = String(date.getMonth() + 1).padStart(2, '0');
//           const day = String(date.getDate()).padStart(2, '0');
//           return `${year}-${month}-${day}`;
//         }
//       } catch {
//         // Fallback: if string looks like a date, try to extract YYYY-MM-DD
//         const match = String(dateValue).match(/(\d{4})-(\d{2})-(\d{2})/);
//         if (match) {
//           return `${match[1]}-${match[2]}-${match[3]}`;
//         }
//       }
//     }

//     return null;
//   };

//   const formatDateForInput = (dateValue: string | Date | null | undefined): string => {
//     if (!dateValue) return '';

//     // If it's already a YYYY-MM-DD string, return as-is
//     if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
//       return dateValue;
//     }

//     // Convert using formatDateForAPI which handles timezone properly
//     return formatDateForAPI(dateValue) || '';
//   };

//   const splitFullName = (fullName?: string) => {
//     if (!fullName || typeof fullName !== 'string') return { first_name: '', last_name: '' };
//     const parts = fullName.trim().split(/\s+/);
//     if (parts.length === 1) return { first_name: parts[0], last_name: '' };
//     return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
//   };

//   const normalizeBuyerSellerData = (data: any, role: 'buyer' | 'seller'): User => {
//     const nameFromField = splitFullName(data.name);
//     const first_name = (data.first_name && String(data.first_name).trim()) || nameFromField.first_name || '';
//     const last_name = (data.last_name && String(data.last_name).trim()) || nameFromField.last_name || '';

//     return {
//       id: data.id,
//       username: data.username,
//       email: data.email || '',
//       salutation: data.salutation || '',
//       first_name,
//       last_name,
//       role,
//       phone: data.phone || data.mobile || '',
//       avatar: data.avatar,
//       designation: data.designation,
//       department: data.department,
//       is_active: data.is_active ?? true,
//       created_at: data.created_at,
//       last_login: data.last_login,
//       total_leads: data.total_leads || 0,
//       total_properties: data.total_properties || 0,
//       total_revenue: data.total_revenue || 0,
//       // FIXED: Use consistent DOB handling without timezone conversion
//       dob: formatDateForAPI(data.dob),
//       blood_group: data.blood_group,
//       buyer_id: data.buyer_id ?? (role === 'buyer' ? data.id : null),
//       seller_id: data.seller_id ?? (role === 'seller' ? data.id : null),
//     };
//   };

//   const normalizeListResponse = <T,>(resp: any): T[] => {
//     if (!resp) return [];
//     if (Array.isArray(resp)) return resp as T[];
//     if (Array.isArray(resp.data)) return resp.data as T[];
//     return [];
//   };

//   // FIXED: Normalize role for consistent comparison
//   const normalizeRole = (role: string): string => {
//     if (!role) return '';
//     return role.toLowerCase().trim().replace(/\s+/g, ' ');
//   };

//   const handleTabChange = (tabId: any) => {
//     setActiveTab(tabId);
//     localStorage.setItem(LOCAL_STORAGE_TAB_KEY, tabId);
//   };

//   const getOriginalPassword = (userId?: string | number) => {
//     if (userId === undefined || userId === null) return '';
//     return userPasswords[String(userId)] || '';
//   };

//   const hasAccountCreated = (buyerSellerId: string | number, type: 'buyer' | 'seller'): boolean => {
//     return allUsers.some(user => {
//       if (type === 'buyer') {
//         return String(user.buyer_id) === String(buyerSellerId) && normalizeRole(user.role) === 'buyer';
//       } else {
//         return String(user.seller_id) === String(buyerSellerId) && normalizeRole(user.role) === 'seller';
//       }
//     });
//   };

//   const buildPrefillFromUser = (u: Partial<User>): Partial<User> => ({
//     salutation: u.salutation,
//     first_name: u.first_name,
//     last_name: u.last_name,
//     email: u.email,
//     phone: u.phone,
//     username: u.username,
//     // FIXED: Use formatDateForInput for proper date handling
//     dob: formatDateForInput(u.dob),
//     buyer_id: u.buyer_id ?? (normalizeRole(u.role || '') === 'buyer' ? u.id ?? null : null),
//     seller_id: u.seller_id ?? (normalizeRole(u.role || '') === 'seller' ? u.id ?? null : null),
//   });

//   // Fetch buyers and sellers data
//   useEffect(() => {
//     const fetchBuyersAndSellers = async () => {
//       try {
//         const bResp = await buyerAPI.getAll();
//         const rawBuyersData = normalizeListResponse<any>(bResp);
//         const normalizedBuyersData = rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer'));
//         setBuyersData(normalizedBuyersData);

//       } catch (err) {
//         toast.error('❌ Error fetching buyers:', err);

//       }

//       try {
//         const sResp = await sellerAPI.getAll();
//         const rawSellersData = normalizeListResponse<any>(sResp);
//         const normalizedSellersData = rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller'));
//         setSellersData(normalizedSellersData);

//       } catch (err) {
//         toast.error('❌Failed to load sellers data', err);

//       }
//     };
//     fetchBuyersAndSellers();
//   }, [refreshTrigger]);

//   useEffect(() => {
//     if (!masterLoading) fetchUsers();
//   }, [masterLoading, refreshTrigger]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await usersAPI.filterData({});
//       if (response?.success) {
//         const users: User[] = (response.data || []).map((u: any) => {
//           const fromName = splitFullName(u.name);
//           const first_name = (u.first_name && String(u.first_name).trim()) || fromName.first_name || '';
//           const last_name = (u.last_name && String(u.last_name).trim()) || fromName.last_name || '';
          
//           // FIXED: Normalize role for consistent filtering
//           const normalizedRole = normalizeRole(u.role || '');
          
//           return {
//             id: u.id,
//             username: u.username,
//             email: u.email,
//             salutation: u.salutation,
//             first_name,
//             last_name,
//             role: normalizedRole,
//             phone: u.phone,
//             avatar: u.avatar,
//             designation: u.designation,
//             department: u.department,
//             is_active: !!u.is_active,
//             created_at: u.created_at,
//             last_login: u.last_login,
//             total_leads: u.total_leads,
//             total_properties: u.total_properties,
//             total_revenue: u.total_revenue,
//             // FIXED: Use consistent DOB handling
//             dob: formatDateForAPI(u.dob),
//             blood_group: u.blood_group,
//             buyer_id: u.buyer_id ?? null,
//             seller_id: u.seller_id ?? null,
//           } as User;
//         });
//         setAllUsers(users);

//       } else {
//         toast.error('Failed to load users');
//       }
//     } catch (err: any) {

//       toast.error(err?.response?.data?.message || 'Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startCreateAccount = async (type: 'buyer' | 'seller', prefill?: Partial<User>) => {

//     const enrichedPrefill: Partial<User> = {
//       ...prefill,
//       role: type,
//       buyer_id: prefill?.buyer_id ?? (type === 'buyer' ? prefill?.id ?? null : null),
//       seller_id: prefill?.seller_id ?? (type === 'seller' ? prefill?.id ?? null : null),
//     };

//     if (onCreateUser) {
//       try {
//         await onCreateUser({ role: type, prefill: enrichedPrefill });
//         handleTabChange(type === 'buyer' ? 'buyer-accounts' : 'seller-accounts');
//         fetchUsers();
//       } catch (err) {
//         console.error('❌ onCreateUser handler failed', err);
//       }
//       return;
//     }

//     // Fallback local modal
//     setCreateAccountTypeLocal(type);
//     setCreatePrefill(enrichedPrefill);
//     setShowCreateModalLocal(true);
//   };

//   const handleCreateAccountSubmitLocal = async (accountData: Partial<User>) => {
//     try {
//       setLocalCreating(true);
//       const prefill = createPrefill || {};
//       const defaultIsActive = prefill.buyer_id || prefill.seller_id ? false : true;
//       const rawBuyerId = accountData.buyer_id ?? prefill.buyer_id ?? null;
//       const rawSellerId = accountData.seller_id ?? prefill.seller_id ?? null;

//       const payload: any = {
//         salutation: accountData.salutation,
//         first_name: accountData.first_name,
//         last_name: accountData.last_name,
//         email: accountData.email,
//         phone: accountData.phone,
//         username: accountData.username || undefined,
//         password: accountData.password || undefined,
//         role: createAccountTypeLocal,
//         is_active: accountData.is_active !== undefined ? accountData.is_active : defaultIsActive,
//         // FIXED: Use formatDateForAPI for proper date handling
//         dob: formatDateForAPI(accountData.dob),
//         buyer_id: rawBuyerId === null ? null : (typeof rawBuyerId === 'string' && /^\d+$/.test(rawBuyerId) ? Number(rawBuyerId) : rawBuyerId),
//         seller_id: rawSellerId === null ? null : (typeof rawSellerId === 'string' && /^\d+$/.test(rawSellerId) ? Number(rawSellerId) : rawSellerId),
//       };

//       const resp = await usersAPI.createUser(payload);
//       if (!resp?.success) throw new Error(resp?.message || 'Failed to create user');
//       const createdUser: User = resp.data;


//       // Create corresponding buyer/seller record if needed
//       if (createAccountTypeLocal === 'buyer' && !payload.buyer_id) {
//         try {
//           const buyerResp = await buyerAPI.create({
//             salutation: accountData.salutation,
//             name: `${accountData.first_name || ''} ${accountData.last_name || ''}`.trim(),
//             email: accountData.email,
//             phone: accountData.phone,
//             // FIXED: Use formatDateForAPI for proper date handling
//             dob: formatDateForAPI(accountData.dob),
//             user_id: createdUser.id
//           });
//           if (buyerResp?.success && buyerResp.data?.id) {
//             await usersAPI.updateUser(String(createdUser.id!), { buyer_id: buyerResp.data.id });
//             createdUser.buyer_id = buyerResp.data.id;
//           }
//         } catch (err) {
//           console.warn('⚠️ Buyer creation failed (user created):', err);
//         }
//       } else if (createAccountTypeLocal === 'seller' && !payload.seller_id) {
//         try {
//           const sellerResp = await sellerAPI.create({
//             salutation: accountData.salutation,
//             name: `${accountData.first_name || ''} ${accountData.last_name || ''}`.trim(),
//             email: accountData.email,
//             phone: accountData.phone,
//             // FIXED: Use formatDateForAPI for proper date handling
//             dob: formatDateForAPI(accountData.dob),
//             user_id: createdUser.id
//           });
//           if (sellerResp?.success && sellerResp.data?.id) {
//             await usersAPI.updateUser(String(createdUser.id!), { seller_id: sellerResp.data.id });
//             createdUser.seller_id = sellerResp.data.id;
//           }
//         } catch (err) {
//           console.warn('⚠️ Seller creation failed (user created):', err);
//         }
//       }

//       toast.success('Account created successfully');

//       setAllUsers(prev => {
//         const exists = prev.some(u => String(u.id) === String(createdUser.id));
//         if (exists) {
//           return prev.map(u => String(u.id) === String(createdUser.id) ? { ...u, ...createdUser } : u);
//         }
//         return [createdUser, ...prev];
//       });

//       handleTabChange(createAccountTypeLocal === 'buyer' ? 'buyer-accounts' : 'seller-accounts');
//       setShowCreateModalLocal(false);
//       setCreatePrefill(null);
//       fetchUsers();
//     } catch (err: any) {
//       console.error('❌ Error creating account (local):', err);
//       toast.error(err?.response?.data?.message || err.message || 'Failed to create account');
//     } finally {
//       setLocalCreating(false);
//     }
//   };

//   // Share functionality
//   const handleShareUser = (u: User) => {
//     setSharingUser(u);
//     setShowShareModal(true);
//   };

//   const shareViaEmail = () => {
//     if (!sharingUser) return;
//     const pw = getOriginalPassword(sharingUser.id);
//     const subject = encodeURIComponent(`Account details — ${sharingUser.first_name} ${sharingUser.last_name}`);
//     const body = encodeURIComponent(
//       `Name: ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
//     );
//     window.open(`mailto:?subject=${subject}&body=${body}`);
//     setShowShareModal(false);
//   };

//   const shareViaWhatsApp = () => {
//     if (!sharingUser) return;
//     const pw = getOriginalPassword(sharingUser.id);
//     const text = encodeURIComponent(
//       `Account details\nName: ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
//     );
//     window.open(`https://wa.me/?text=${text}`);
//     setShowShareModal(false);
//   };

//   const shareViaSMS = () => {
//     if (!sharingUser) return;
//     const pw = getOriginalPassword(sharingUser.id);
//     const text = encodeURIComponent(
//       `Account details — ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
//     );
//     window.open(`sms:?body=${text}`);
//     setShowShareModal(false);
//   };

//   const copyToClipboard = () => {
//     if (!sharingUser) return;
//     const pw = getOriginalPassword(sharingUser.id);
//     const text =
//       `Account details — ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\n` +
//       `Email: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`;
//     navigator.clipboard.writeText(text).then(() => {
//       toast.success('Copied to clipboard');
//       setShowShareModal(false);
//     }).catch(() => {
//       toast.error('Failed to copy');
//     });
//   };

//   // Filtering and data management
//   const getFilteredUsers = () => {
//     const activeTabConfig = TABS.find(t => t.id === activeTab) ?? TABS[0];

//     let source: User[] = [];
//     switch (activeTab) {
//       case 'buyers':
//         source = buyersData;
//         break;
//       case 'sellers':
//         source = sellersData;
//         break;
//       case 'buyer-accounts':
//         source = allUsers.filter(u => normalizeRole(u.role) === 'buyer');
//         break;
//       case 'seller-accounts':
//         source = allUsers.filter(u => normalizeRole(u.role) === 'seller');
//         break;
//       default:
//         // FIXED: Case-insensitive role comparison with normalized roles
//         source = allUsers.filter(u =>
//           activeTabConfig.roles.some(r => 
//             normalizeRole(u.role) === normalizeRole(r)
//           )
//         );
//     }

//     if (searchTerm) {
//       const q = searchTerm.toLowerCase();
//       source = source.filter(u =>
//         `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
//         (u.email || '').toLowerCase().includes(q) ||
//         (u.username || '').toLowerCase().includes(q)
//       );
//     }

//     if (roleFilter !== 'all' && activeTab === 'all') {
//       source = source.filter(u => normalizeRole(u.role) === normalizeRole(roleFilter));
//     }

//     if (statusFilter !== 'all') {
//       const active = statusFilter === 'active';
//       source = source.filter(u => !!u.is_active === active);
//     }

//     return source;
//   };

//   const getUserCounts = () => {
//     const counts: Record<string, number> = {};
//     TABS.forEach(tab => {
//       switch (tab.id) {
//         case 'buyers':
//           counts[tab.id] = buyersData.length;
//           break;
//         case 'sellers':
//           counts[tab.id] = sellersData.length;
//           break;
//         case 'buyer-accounts':
//           counts[tab.id] = allUsers.filter(u => normalizeRole(u.role) === 'buyer').length;
//           break;
//         case 'seller-accounts':
//           counts[tab.id] = allUsers.filter(u => normalizeRole(u.role) === 'seller').length;
//           break;
//         default:
//           // FIXED: Case-insensitive counting with normalized roles
//           counts[tab.id] = allUsers.filter(u =>
//             tab.roles.some(r => normalizeRole(u.role) === normalizeRole(r))
//           ).length;
//       }
//     });
//     return counts;
//   };

//   // Selection handling
//   useEffect(() => {
//     setSelectedUsers([]);
//     setShowBulkActions(false);
//   }, [activeTab]);

//   const filteredUsers = getFilteredUsers();
//   const userCounts = getUserCounts();

//   const handleSelectUser = (id?: string | number) => {
//     if (id === undefined || id === null) return;
//     setSelectedUsers(prev => {
//       const strId = String(id);
//       const has = prev.some(x => String(x) === strId);
//       const next = has ? prev.filter(x => String(x) !== strId) : [...prev, id];
//       setShowBulkActions(next.length > 0);
//       return next;
//     });
//   };

//   const handleSelectAll = () => {
//     const allIds = filteredUsers.map(u => u.id!).filter(Boolean);
//     if (selectedUsers.length === allIds.length) {
//       setSelectedUsers([]);
//       setShowBulkActions(false);
//     } else {
//       setSelectedUsers(allIds);
//       setShowBulkActions(true);
//     }
//   };

//   // Bulk actions
//   const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
//     if (action === 'delete' && !window.confirm(`Delete ${selectedUsers.length} users?`)) return;

//     try {
//       for (const id of selectedUsers) {
//         if (action === 'delete') {
//           await usersAPI.deleteUser(String(id));
//         } else {
//           await usersAPI.updateUser(String(id), { is_active: action === 'activate' });
//         }
//       }

//       setSelectedUsers([]);
//       setShowBulkActions(false);
//       fetchUsers();

//       // Refresh buyer/seller data if needed
//       if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
//         const bResp = await buyerAPI.getAll();
//         const rawBuyersData = normalizeListResponse<any>(bResp);
//         setBuyersData(rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer')));
//       }

//       if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
//         const sResp = await sellerAPI.getAll();
//         const rawSellersData = normalizeListResponse<any>(sResp);
//         setSellersData(rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller')));
//       }
//     } catch (err) {
//       console.error(`❌ Bulk ${action} error:`, err);
//       toast.error(`Bulk ${action} failed`);
//       fetchUsers();
//     }
//   };

//   // Individual user actions
//   const handleToggleUserStatus = async (userId?: string | number, isActive?: boolean) => {
//     if (userId === undefined || userId === null) return;

//     const newStatus = !isActive;
//     try {
//       await usersAPI.updateUser(String(userId), { is_active: newStatus });
//       toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
     
//       // Refresh all data to maintain sync
//       fetchUsers();

//       if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
//         const bResp = await buyerAPI.getAll();
//         const rawBuyersData = normalizeListResponse<any>(bResp);
//         setBuyersData(rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer')));
//       }

//       if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
//         const sResp = await sellerAPI.getAll();
//         const rawSellersData = normalizeListResponse<any>(sResp);
//         setSellersData(rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller')));
//       }
//     } catch (err) {
//       console.error(`❌ Error toggling user ${userId} status:`, err);
//       toast.error('Failed to update user status');
//     }
//   };

//   const handleDeleteUser = async (userId?: string | number) => {
//     if (userId === undefined || userId === null) return;
//     if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

//     try {
//       await usersAPI.deleteUser(String(userId));
//       toast.success('User deleted successfully');
     

//       // Refresh all data
//       fetchUsers();

//       if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
//         const bResp = await buyerAPI.getAll();
//         const rawBuyersData = normalizeListResponse<any>(bResp);
//         setBuyersData(rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer')));
//       }

//       if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
//         const sResp = await sellerAPI.getAll();
//         const rawSellersData = normalizeListResponse<any>(sResp);
//         setSellersData(rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller')));
//       }
//     } catch (err) {
//       console.error(`❌ Error deleting user ${userId}:`, err);
//       toast.error('Failed to delete user');
//     }
//   };

//   // Utility functions for display
//   const getRoleColor = (role?: string) => {
//     const normalizedRole = normalizeRole(role || '');
//     switch (normalizedRole) {
//       case 'admin': return 'bg-red-100 text-red-800';
//       case 'manager': return 'bg-purple-100 text-purple-800';
//       case 'agent': return 'bg-blue-100 text-blue-800';
//       case 'seller': return 'bg-green-100 text-green-800';
//       case 'buyer': return 'bg-orange-100 text-orange-800';
//       case 'executive': return 'bg-indigo-100 text-indigo-800';
//       case 'team leader': return 'bg-teal-100 text-teal-800';
//       case 'team-leader': return 'bg-teal-100 text-teal-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatCurrency = (amount?: number) => {
//     if (amount === undefined || amount === null) return '';
//     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
//   };

//   // FIXED: Helper function to format date for display (avoids timezone issues)
//   const formatDateForDisplay = (dateValue?: string | null) => {
//     if (!dateValue) return 'N/A';

//     // If it's a YYYY-MM-DD string, parse and format safely
//     if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
//       const [year, month, day] = dateValue.split('-');
//       const date = new Date(Number(year), Number(month) - 1, Number(day));
//       return date.toLocaleDateString();
//     }

//     return 'N/A';
//   };

//   const roles = masters.role || [];
//   const availableRoles = activeTab === 'all' ? roles : [];
//   const activeTabConfig = TABS.find(t => t.id === activeTab)!;

//   // Debug: Check what roles are available in data
//   useEffect(() => {
//     if (allUsers.length > 0) {
//       console.log('Available roles in data:', [...new Set(allUsers.map(u => u.role))]);
//       console.log('Team leader users:', allUsers.filter(u => 
//         normalizeRole(u.role) === 'team leader' || normalizeRole(u.role) === 'team-leader'
//       ));
//     }
//   }, [allUsers]);

//   return (
//     <div className="space-y-6">
//       {/* Local create modal fallback */}
//       {showCreateModalLocal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Create {createAccountTypeLocal === 'buyer' ? 'Buyer' : 'Seller'} Account
//             </h3>
//             <form onSubmit={(e) => {
//               e.preventDefault();
//               const f = new FormData(e.target as HTMLFormElement);
//               const payload = {
//                 salutation: (f.get('salutation') as string) || (createPrefill?.salutation || ''),
//                 first_name: (f.get('first_name') as string) || (createPrefill?.first_name || ''),
//                 last_name: (f.get('last_name') as string) || (createPrefill?.last_name || ''),
//                 email: (f.get('email') as string) || (createPrefill?.email || ''),
//                 phone: (f.get('phone') as string) || (createPrefill?.phone || ''),
//                 username: (f.get('username') as string) || (createPrefill?.username || ''),
//                 password: (f.get('password') as string),
//                 dob: (f.get('dob') as string) || (createPrefill?.dob || ''),
//                 buyer_id: createPrefill?.buyer_id ?? null,
//                 seller_id: createPrefill?.seller_id ?? null,
//               };
//               handleCreateAccountSubmitLocal(payload);
//             }}>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Salutation</label>
//                     <select
//                       name="salutation"
//                       defaultValue={createPrefill?.salutation || ""}
//                       className="w-full px-3 py-2 border rounded"
//                     >
//                       <option value="">-- Select --</option>
//                       <option value="Mr">Mr</option>
//                       <option value="Mrs">Mrs</option>
//                       <option value="Ms">Ms</option>
//                       <option value="Dr">Dr</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
//                     <input name="first_name" defaultValue={createPrefill?.first_name || ''} required className="w-full px-3 py-2 border rounded" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
//                     <input name="last_name" defaultValue={createPrefill?.last_name || ''} required className="w-full px-3 py-2 border rounded" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" name="email" defaultValue={createPrefill?.email || ''} required className="w-full px-3 py-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                   <input name="phone" defaultValue={createPrefill?.phone || ''} className="w-full px-3 py-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
//                   <input name="username" defaultValue={createPrefill?.username || ''} className="w-full px-3 py-2 border rounded" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
//                   <input
//                     type="date"
//                     name="dob"
//                     defaultValue={createPrefill?.dob || ''}
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <input name="password" type="password" required className="w-full px-3 py-2 border rounded" />
//                 </div>

//                 {createPrefill?.buyer_id && <input type="hidden" name="buyer_id" value={String(createPrefill.buyer_id)} />}
//                 {createPrefill?.seller_id && <input type="hidden" name="seller_id" value={String(createPrefill.seller_id)} />}
//               </div>

//               <div className="flex justify-end space-x-1 mt-6 ">
//                 <Button type="button" variant="outline" onClick={() => { setShowCreateModalLocal(false); setCreatePrefill(null); }}>Cancel</Button>
//                 <Button type="submit" disabled={localCreating}>{localCreating ? 'Creating...' : 'Create Account'}</Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Share modal */}
//       {showShareModal && sharingUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-lg p-4 w-full max-w-sm">
//             <h3 className="text-base font-semibold text-gray-900 mb-3">Share User Details</h3>
//             <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//               <h4 className="font-medium text-gray-900 text-sm mb-2">
//                 {sharingUser.salutation ? sharingUser.salutation + ' ' : ''}{sharingUser.first_name} {sharingUser.last_name}
//               </h4>
//               <div className="space-y-1 text-xs text-gray-600">
//                 <p><strong>Email:</strong> {sharingUser.email}</p>
//                 <p><strong>Username:</strong> {sharingUser.username || 'N/A'}</p>
//                 <p><strong>Password:</strong> {getOriginalPassword(sharingUser.id) || 'Not available'}</p>
//                 <p><strong>Role:</strong> {getLabelFromValue('role', sharingUser.role)}</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-2 mb-4">
//               <button onClick={shareViaEmail} className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs"><Mail className="h-3 w-3" /><span>Email</span></button>
//               <button onClick={shareViaWhatsApp} className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs"><MessageCircle className="h-3 w-3" /><span>WhatsApp</span></button>
//               <button onClick={shareViaSMS} className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs"><Phone className="h-3 w-3" /><span>SMS</span></button>
//               <button onClick={copyToClipboard} className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-xs"><Copy className="h-3 w-3" /><span>Copy</span></button>
//             </div>

//             <div className="flex justify-end">
//               <Button variant="outline" size="sm" onClick={() => { setShowShareModal(false); setSharingUser(null); }}>Close</Button>
//             </div>
//           </div>
//         </div>
//       )}

//       <nav
//         className="flex -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide"
//         aria-label="Tabs"
//       >
//         <div className="flex gap-3 sm:gap-8 min-w-full sm:min-w-0">
//           {TABS.map((tab) => {
//             const isActive = activeTab === (tab.id as any);
//             const count = userCounts[tab.id] || 0;
//             const Icon = tab.id === 'all' ? UsersIcon : UserPlus;

//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => handleTabChange(tab.id as any)}
//                 aria-current={isActive ? 'page' : undefined}
//                 className={[
//                   // layout
//                   'shrink-0 flex items-center gap-2',
//                   'py-2.5 sm:py-3 px-2 sm:px-1',
//                   // underline
//                   'border-b-2',
//                   isActive
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
//                   // typography
//                   'font-medium text-sm',
//                   // a11y/focus
//                   'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 rounded'
//                 ].join(' ')}
//               >
//                 <Icon className="h-4 w-4 sm:h-4 sm:w-4" />
//                 <span className="whitespace-nowrap">{tab.name}</span>
//                 <span
//                   className={[
//                     'rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold',
//                     isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
//                   ].join(' ')}
//                 >
//                   {count}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </nav>


//       {/* Bulk actions */}
//       {showBulkActions && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <span className="text-blue-800 font-medium">{selectedUsers.length} user(s) selected</span>
//             <div className="flex space-x-2">
//               <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>Activate</Button>
//               <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>Deactivate</Button>
//               <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')} className="text-red-600">Delete</Button>
//               <Button variant="outline" size="sm" onClick={() => { setSelectedUsers([]); setShowBulkActions(false); }}>Cancel</Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Search & filters */}
//       <div className="rounded-lg">
//         <div className="flex flex-col lg:flex-row lg:items-center space-y-1.5 lg:space-y-0 lg:space-x-2">
//           <div className="flex-1 relative">
//             <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
//             <input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search users by name, email, or username..."
//               className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-md"
//             />
//           </div>
//           <div className="flex space-x-1.5">
//             {activeTab === 'all' && (
//               <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded-md" disabled={masterLoading}>
//                 <option value="all">All Roles</option>
//                 {availableRoles.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
//               </select>
//             )}
//             <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded-md">
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Users table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {loading ? (
//           <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {(activeTab !== 'buyers' && activeTab !== 'sellers') && (
//                     <th className="px-6 py-3 text-left">
//                       <input
//                         type="checkbox"
//                         checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.map(u => u.id!).filter(Boolean).length}
//                         onChange={handleSelectAll}
//                       />
//                     </th>
//                   )}
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredUsers.length > 0 ? filteredUsers.map(user => {
//                   const accountAlreadyExists = (activeTab === 'buyers' || activeTab === 'sellers') &&
//                     hasAccountCreated(user.id!, activeTab === 'buyers' ? 'buyer' : 'seller');

//                   return (
//                     <tr key={String(user.id)} className="hover:bg-gray-50">
//                       {(activeTab !== 'buyers' && activeTab !== 'sellers') && (
//                         <td className="px-6 py-4">
//                           <input
//                             type="checkbox"
//                             checked={selectedUsers.some(x => String(x) === String(user.id))}
//                             onChange={() => handleSelectUser(user.id)}
//                           />
//                         </td>
//                       )}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center space-x-3">
//                           {user.avatar ? (
//                             <img src={String(user.avatar)} alt={`${user.first_name} avatar`} className="h-10 w-10 rounded-full object-cover" />
//                           ) : (
//                             <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
//                               {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase()}
//                             </div>
//                           )}
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{user.salutation ? user.salutation + ' ' : ''}{user.first_name} {user.last_name}</p>
//                             {user.username && <p className="text-sm text-gray-500">{user.username}</p>}
//                             {/* FIXED: Use formatDateForDisplay for proper date display */}
//                             {user.dob && <p className="text-xs text-gray-400">DOB: {formatDateForDisplay(user.dob)}</p>}
//                             {(activeTab === 'buyers' || activeTab === 'sellers') && (
//                               <p className={`text-xs ${accountAlreadyExists ? 'text-green-600' : 'text-orange-600'}`}>
//                                 {accountAlreadyExists ? '✓ Account Created' : '○ No Account'}
//                               </p>
//                             )}
//                             {user.username && <p className="text-sm text-gray-500">id:{user.id}</p>}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="space-y-1">
//                           <div className="flex items-center space-x-2"><Mail className="h-3 w-3 text-gray-400" /><span className="text-sm text-gray-900">{user.email}</span></div>
//                           {user.phone && <div className="flex items-center space-x-2"><Phone className="h-3 w-3 text-gray-400" /><span className="text-sm text-gray-900">{user.phone}</span></div>}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(user.role)}`}>
//                           {getLabelFromValue('role', user.role) || user.role}
//                         </span>
//                         {user.department && <div className="text-xs text-gray-400">Dept: <span className='capitalize'> {user.department} </span></div>}
//                         {user.designation && <div className="text-xs text-gray-400">Desig: {user.designation}</div>}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center space-x-2">
//                           {user.is_active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
//                           <span className={`text-sm ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900">
//                           <div>{user.total_leads || 0} leads</div>
//                           <div className="text-xs text-gray-500">{user.total_properties || 0} properties</div>
//                           {user.total_revenue !== undefined && user.total_revenue !== null
//                             ? <div className="text-xs text-gray-500">{formatCurrency(user.total_revenue)} revenue</div>
//                             : null}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-xs text-gray-900 space-y-1">
//                           <div className="flex items-center space-x-1"><Calendar className="h-3 w-3 text-gray-400" /><span>Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span></div>
//                           <div className="flex items-center space-x-1"><Activity className="h-3 w-3 text-gray-400" /><span>Last Login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span></div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         {(activeTab === 'buyers' || activeTab === 'sellers') ? (
//                           <div className="flex items-center justify-end space-x-2">
//                             <Button
//                               onClick={() => startCreateAccount(activeTab === 'buyers' ? 'buyer' : 'seller', buildPrefillFromUser(user))}
//                               size="sm"
//                               disabled={accountAlreadyExists}
//                               className={`${accountAlreadyExists
//                                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
//                                 : 'bg-green-600 hover:bg-green-700 text-white'
//                                 }`}
//                             >
//                               <Plus className="h-3 w-3 mr-1" />
//                               {accountAlreadyExists ? 'Account Exists' : 'Create Account'}
//                             </Button>
//                           </div>
//                         ) : (
//                           <div className="flex items-center justify-end space-x-2">
//                             <div>
//                               <Button variant="outline" size="sm"><Eye className="h-3 w-3" /></Button>
//                               <Button variant="outline" size="sm" onClick={() => onEditUser(user)}><Edit className="h-3 w-3" /></Button>
//                               <Button variant="outline" size="sm" onClick={() => handleShareUser(user)} className="text-blue-600"><Share2 className="h-3 w-3" /></Button>
//                             </div>
//                             <div>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => handleToggleUserStatus(user.id, user.is_active)}
//                                 className={user.is_active ? 'text-red-600' : 'text-green-600'}>
//                                 {user.is_active ? 'Deactivate' : 'Activate'}
//                               </Button>
//                               <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-600"><Trash2 className="h-3 w-3" /></Button>
//                             </div>
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 }) : (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-12 text-center">
//                       <div className="flex flex-col items-center">
//                         <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
//                         <h3 className="text-lg font-medium text-gray-900 mb-2">{activeTab === 'buyers' || activeTab === 'sellers' ? `No ${activeTab} data found` : 'No users found'}</h3>
//                         <p className="text-gray-500 mb-4">{searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting filters' : 'No data to display'}</p>
//                         {activeTabConfig?.showCreateButton && <Button onClick={() => startCreateAccount(activeTab.includes('buyer') ? 'buyer' : 'seller')}><Plus className="h-4 w-4" /> {activeTabConfig.createButtonText}</Button>}
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UsersManagement;

// ./components/userPageCompoents/UsersManagement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Edit, Trash2, Mail, Phone, Calendar, Activity, CheckCircle, XCircle,
  Eye, Share2, MessageCircle, Copy, Plus, Users as UsersIcon, UserPlus,
  SlidersHorizontal, X, Filter
} from 'lucide-react';
import { usersAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { buyerAPI } from '@/lib/buyerAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

// Resale Theme Colors
const RESALE = {
  navy: '#f3f4f6',        // gray-100 (background)
  navyLight: '#e5e7eb',   // gray-200
  navyDark: '#d1d5db',    // gray-300
  orange: '#e67e22',
  orangeLight: '#f39c12',
  orangeDark: '#d35400',
};

interface User {
  id?: string | number;
  username?: string;
  email: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  password?: string;
  role: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  total_leads?: number;
  total_properties?: number;
  total_revenue?: number;
  modulePermissions?: any;
  dob?: string;
  blood_group?: string;
  buyer_id?: string | number | null;
  seller_id?: string | number | null;
}

interface UsersManagementProps {
  onEditUser: (user: User) => void;
  refreshTrigger: number;
  userPasswords?: { [key: string]: string };
  getLabelFromValue: (masterKey: string, value: string) => string;
  masters: Record<string, any[]>;
  masterLoading: boolean;
  onCreateUser?: (opts: { role: 'buyer' | 'seller'; prefill?: Partial<User> }) => Promise<void> | void;
}

const TABS = [
  { id: 'all', name: 'Team Members', roles: ['admin', 'executive', 'manager', 'team leader', 'agent', 'sales team leader', 'presales team leader', 'sales manager', 'marketing executive', 'presales executive','sales executive'], showCreateButton: false, createButtonText: '' },
  { id: 'buyers', name: 'Buyers', roles: ['buyer'], showCreateButton: true, createButtonText: '' },
  { id: 'sellers', name: 'Sellers', roles: ['seller'], showCreateButton: true, createButtonText: '' },
  { id: 'buyer-accounts', name: 'Buyer Accounts', roles: ['buyer'], showCreateButton: true, createButtonText: '' },
  { id: 'seller-accounts', name: 'Seller Accounts', roles: ['seller'], showCreateButton: true, createButtonText: 'Create Seller Account' }
];

const LOCAL_STORAGE_TAB_KEY = 'users-management-active-tab';

// LocalCreateModal Component for editable prefill data
const LocalCreateModal: React.FC<{
  createAccountTypeLocal: 'buyer' | 'seller';
  createPrefill: Partial<User> | null;
  localCreating: boolean;
  onSubmit: (data: Partial<User>) => void;
  onClose: () => void;
}> = ({ createAccountTypeLocal, createPrefill, localCreating, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    salutation: createPrefill?.salutation || '',
    first_name: createPrefill?.first_name || '',
    last_name: createPrefill?.last_name || '',
    email: createPrefill?.email || '',
    phone: createPrefill?.phone || '',
    username: createPrefill?.username || '',
    dob: createPrefill?.dob || '',
    password: '',
    buyer_id: createPrefill?.buyer_id ?? null,
    seller_id: createPrefill?.seller_id ?? null,
  });

  useEffect(() => {
    if (createPrefill) {
      setFormData({
        salutation: createPrefill.salutation || '',
        first_name: createPrefill.first_name || '',
        last_name: createPrefill.last_name || '',
        email: createPrefill.email || '',
        phone: createPrefill.phone || '',
        username: createPrefill.username || '',
        dob: createPrefill.dob || '',
        password: '',
        buyer_id: createPrefill.buyer_id ?? null,
        seller_id: createPrefill.seller_id ?? null,
      });
    }
  }, [createPrefill]);

  const handleInputChange = (field: keyof User, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create {createAccountTypeLocal === 'buyer' ? 'Buyer' : 'Seller'} Account
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {(formData.buyer_id || formData.seller_id) && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800 font-medium">
                  🔗 Linking to {createAccountTypeLocal}: {formData.buyer_id || formData.seller_id}
                  <br />You can edit the prefilled data below.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salutation</label>
                <select
                  value={formData.salutation || ''}
                  onChange={(e) => handleInputChange('salutation', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Select --</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter password for new user"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={localCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={localCreating || !formData.first_name || !formData.last_name || !formData.email || !formData.password} style={{ backgroundColor: RESALE.orange }} className="text-white">
              {localCreating ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersManagement: React.FC<UsersManagementProps> = ({
  onEditUser,
  refreshTrigger,
  userPasswords = {},
  getLabelFromValue,
  masters,
  masterLoading,
  onCreateUser
}) => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [buyersData, setBuyersData] = useState<User[]>([]);
  const [sellersData, setSellersData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Array<string | number>>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Column search filters
  const [colSearch, setColSearch] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    status: '',
  });

  // Tab state from localStorage
  const [activeTab, setActiveTab] = useState<'all' | 'buyers' | 'sellers' | 'buyer-accounts' | 'seller-accounts'>(() => {
    const savedTab = localStorage.getItem(LOCAL_STORAGE_TAB_KEY) as any;
    return (savedTab && TABS.find(t => t.id === savedTab)) ? savedTab : 'all';
  });

  // Modals state
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingUser, setSharingUser] = useState<User | null>(null);
  const [showCreateModalLocal, setShowCreateModalLocal] = useState(false);
  const [createAccountTypeLocal, setCreateAccountTypeLocal] = useState<'buyer' | 'seller'>('buyer');
  const [createPrefill, setCreatePrefill] = useState<Partial<User> | null>(null);
  const [localCreating, setLocalCreating] = useState(false);

  // Utility functions
  const formatDateForAPI = (dateValue: string | Date | null | undefined): string | null => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (typeof dateValue === 'string') {
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      } catch {
        const match = String(dateValue).match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          return `${match[1]}-${match[2]}-${match[3]}`;
        }
      }
    }
    return null;
  };

  const formatDateForInput = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    return formatDateForAPI(dateValue) || '';
  };

  const splitFullName = (fullName?: string) => {
    if (!fullName || typeof fullName !== 'string') return { first_name: '', last_name: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { first_name: parts[0], last_name: '' };
    return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
  };

  const normalizeBuyerSellerData = (data: any, role: 'buyer' | 'seller'): User => {
    const nameFromField = splitFullName(data.name);
    const first_name = (data.first_name && String(data.first_name).trim()) || nameFromField.first_name || '';
    const last_name = (data.last_name && String(data.last_name).trim()) || nameFromField.last_name || '';

    return {
      id: data.id,
      username: data.username,
      email: data.email || '',
      salutation: data.salutation || '',
      first_name,
      last_name,
      role,
      phone: data.phone || data.mobile || '',
      avatar: data.avatar,
      designation: data.designation,
      department: data.department,
      is_active: data.is_active ?? true,
      created_at: data.created_at,
      last_login: data.last_login,
      total_leads: data.total_leads || 0,
      total_properties: data.total_properties || 0,
      total_revenue: data.total_revenue || 0,
      dob: formatDateForAPI(data.dob),
      blood_group: data.blood_group,
      buyer_id: data.buyer_id ?? (role === 'buyer' ? data.id : null),
      seller_id: data.seller_id ?? (role === 'seller' ? data.id : null),
    };
  };

  const normalizeListResponse = <T,>(resp: any): T[] => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp as T[];
    if (Array.isArray(resp.data)) return resp.data as T[];
    return [];
  };

  const normalizeRole = (role: string): string => {
    if (!role) return '';
    return role.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const handleTabChange = (tabId: any) => {
    setActiveTab(tabId);
    localStorage.setItem(LOCAL_STORAGE_TAB_KEY, tabId);
    setCurrentPage(1);
  };

  const getOriginalPassword = (userId?: string | number) => {
    if (userId === undefined || userId === null) return '';
    return userPasswords[String(userId)] || '';
  };

  const hasAccountCreated = (buyerSellerId: string | number, type: 'buyer' | 'seller'): boolean => {
    return allUsers.some(user => {
      if (type === 'buyer') {
        return String(user.buyer_id) === String(buyerSellerId) && normalizeRole(user.role) === 'buyer';
      } else {
        return String(user.seller_id) === String(buyerSellerId) && normalizeRole(user.role) === 'seller';
      }
    });
  };

  const buildPrefillFromUser = (u: Partial<User>): Partial<User> => ({
    salutation: u.salutation,
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    phone: u.phone,
    username: u.username,
    dob: formatDateForInput(u.dob),
    buyer_id: u.buyer_id ?? (normalizeRole(u.role || '') === 'buyer' ? u.id ?? null : null),
    seller_id: u.seller_id ?? (normalizeRole(u.role || '') === 'seller' ? u.id ?? null : null),
  });

  useEffect(() => {
    const fetchBuyersAndSellers = async () => {
      try {
        const bResp = await buyerAPI.getAll();
        const rawBuyersData = normalizeListResponse<any>(bResp);
        const normalizedBuyersData = rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer'));
        setBuyersData(normalizedBuyersData);
      } catch (err) {
        toast.error('❌ Error fetching buyers:', err);
      }

      try {
        const sResp = await sellerAPI.getAll();
        const rawSellersData = normalizeListResponse<any>(sResp);
        const normalizedSellersData = rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller'));
        setSellersData(normalizedSellersData);
      } catch (err) {
        toast.error('❌Failed to load sellers data', err);
      }
    };
    fetchBuyersAndSellers();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!masterLoading) fetchUsers();
  }, [masterLoading, refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.filterData({});
      if (response?.success) {
        const users: User[] = (response.data || []).map((u: any) => {
          const fromName = splitFullName(u.name);
          const first_name = (u.first_name && String(u.first_name).trim()) || fromName.first_name || '';
          const last_name = (u.last_name && String(u.last_name).trim()) || fromName.last_name || '';
          const normalizedRole = normalizeRole(u.role || '');
          
          return {
            id: u.id,
            username: u.username,
            email: u.email,
            salutation: u.salutation,
            first_name,
            last_name,
            role: normalizedRole,
            phone: u.phone,
            avatar: u.avatar,
            designation: u.designation,
            department: u.department,
            is_active: !!u.is_active,
            created_at: u.created_at,
            last_login: u.last_login,
            total_leads: u.total_leads,
            total_properties: u.total_properties,
            total_revenue: u.total_revenue,
            dob: formatDateForAPI(u.dob),
            blood_group: u.blood_group,
            buyer_id: u.buyer_id ?? null,
            seller_id: u.seller_id ?? null,
          } as User;
        });
        setAllUsers(users);
      } else {
        toast.error('Failed to load users');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const startCreateAccount = async (type: 'buyer' | 'seller', prefill?: Partial<User>) => {
    const enrichedPrefill: Partial<User> = {
      ...prefill,
      role: type,
      buyer_id: prefill?.buyer_id ?? (type === 'buyer' ? prefill?.id ?? null : null),
      seller_id: prefill?.seller_id ?? (type === 'seller' ? prefill?.id ?? null : null),
    };

    if (onCreateUser) {
      try {
        await onCreateUser({ role: type, prefill: enrichedPrefill });
        handleTabChange(type === 'buyer' ? 'buyer-accounts' : 'seller-accounts');
        fetchUsers();
      } catch (err) {
        console.error('❌ onCreateUser handler failed', err);
      }
      return;
    }

    setCreateAccountTypeLocal(type);
    setCreatePrefill(enrichedPrefill);
    setShowCreateModalLocal(true);
  };

  const handleCreateAccountSubmitLocal = async (accountData: Partial<User>) => {
    try {
      setLocalCreating(true);
      const prefill = createPrefill || {};
      const defaultIsActive = prefill.buyer_id || prefill.seller_id ? false : true;
      const rawBuyerId = accountData.buyer_id ?? prefill.buyer_id ?? null;
      const rawSellerId = accountData.seller_id ?? prefill.seller_id ?? null;

      const payload: any = {
        salutation: accountData.salutation,
        first_name: accountData.first_name,
        last_name: accountData.last_name,
        email: accountData.email,
        phone: accountData.phone,
        username: accountData.username || undefined,
        password: accountData.password || undefined,
        role: createAccountTypeLocal,
        is_active: accountData.is_active !== undefined ? accountData.is_active : defaultIsActive,
        dob: formatDateForAPI(accountData.dob),
        buyer_id: rawBuyerId === null ? null : (typeof rawBuyerId === 'string' && /^\d+$/.test(rawBuyerId) ? Number(rawBuyerId) : rawBuyerId),
        seller_id: rawSellerId === null ? null : (typeof rawSellerId === 'string' && /^\d+$/.test(rawSellerId) ? Number(rawSellerId) : rawSellerId),
      };

      const resp = await usersAPI.createUser(payload);
      if (!resp?.success) throw new Error(resp?.message || 'Failed to create user');
      const createdUser: User = resp.data;

      if (createAccountTypeLocal === 'buyer' && !payload.buyer_id) {
        try {
          const buyerResp = await buyerAPI.create({
            salutation: accountData.salutation,
            name: `${accountData.first_name || ''} ${accountData.last_name || ''}`.trim(),
            email: accountData.email,
            phone: accountData.phone,
            dob: formatDateForAPI(accountData.dob),
            user_id: createdUser.id
          });
          if (buyerResp?.success && buyerResp.data?.id) {
            await usersAPI.updateUser(String(createdUser.id!), { buyer_id: buyerResp.data.id });
            createdUser.buyer_id = buyerResp.data.id;
          }
        } catch (err) {
          console.warn('⚠️ Buyer creation failed (user created):', err);
        }
      } else if (createAccountTypeLocal === 'seller' && !payload.seller_id) {
        try {
          const sellerResp = await sellerAPI.create({
            salutation: accountData.salutation,
            name: `${accountData.first_name || ''} ${accountData.last_name || ''}`.trim(),
            email: accountData.email,
            phone: accountData.phone,
            dob: formatDateForAPI(accountData.dob),
            user_id: createdUser.id
          });
          if (sellerResp?.success && sellerResp.data?.id) {
            await usersAPI.updateUser(String(createdUser.id!), { seller_id: sellerResp.data.id });
            createdUser.seller_id = sellerResp.data.id;
          }
        } catch (err) {
          console.warn('⚠️ Seller creation failed (user created):', err);
        }
      }

      toast.success('Account created successfully');

      setAllUsers(prev => {
        const exists = prev.some(u => String(u.id) === String(createdUser.id));
        if (exists) {
          return prev.map(u => String(u.id) === String(createdUser.id) ? { ...u, ...createdUser } : u);
        }
        return [createdUser, ...prev];
      });

      handleTabChange(createAccountTypeLocal === 'buyer' ? 'buyer-accounts' : 'seller-accounts');
      setShowCreateModalLocal(false);
      setCreatePrefill(null);
      fetchUsers();
    } catch (err: any) {
      console.error('❌ Error creating account (local):', err);
      toast.error(err?.response?.data?.message || err.message || 'Failed to create account');
    } finally {
      setLocalCreating(false);
    }
  };

  const handleShareUser = (u: User) => {
    setSharingUser(u);
    setShowShareModal(true);
  };

  const shareViaEmail = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const subject = encodeURIComponent(`Account details — ${sharingUser.first_name} ${sharingUser.last_name}`);
    const body = encodeURIComponent(
      `Name: ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShowShareModal(false);
  };

  const shareViaWhatsApp = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const text = encodeURIComponent(
      `Account details\nName: ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
    );
    window.open(`https://wa.me/?text=${text}`);
    setShowShareModal(false);
  };

  const shareViaSMS = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const text = encodeURIComponent(
      `Account details — ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\nEmail: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`
    );
    window.open(`sms:?body=${text}`);
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    if (!sharingUser) return;
    const pw = getOriginalPassword(sharingUser.id);
    const text =
      `Account details — ${sharingUser.salutation ? sharingUser.salutation + ' ' : ''}${sharingUser.first_name} ${sharingUser.last_name}\n` +
      `Email: ${sharingUser.email}\nUsername: ${sharingUser.username || 'N/A'}\nPassword: ${pw || 'Not available'}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
      setShowShareModal(false);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const getFilteredUsers = () => {
    const activeTabConfig = TABS.find(t => t.id === activeTab) ?? TABS[0];

    let source: User[] = [];
    switch (activeTab) {
      case 'buyers':
        source = buyersData;
        break;
      case 'sellers':
        source = sellersData;
        break;
      case 'buyer-accounts':
        source = allUsers.filter(u => normalizeRole(u.role) === 'buyer');
        break;
      case 'seller-accounts':
        source = allUsers.filter(u => normalizeRole(u.role) === 'seller');
        break;
      default:
        source = allUsers.filter(u =>
          activeTabConfig.roles.some(r => normalizeRole(u.role) === normalizeRole(r))
        );
    }

    // Global search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      source = source.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    }

    // Column search
    if (colSearch.name) {
      const term = colSearch.name.toLowerCase();
      source = source.filter(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(term));
    }
    if (colSearch.email) {
      const term = colSearch.email.toLowerCase();
      source = source.filter(u => (u.email || '').toLowerCase().includes(term) || (u.phone || '').toLowerCase().includes(term));
    }
    if (colSearch.role) {
      const term = colSearch.role.toLowerCase();
      source = source.filter(u => normalizeRole(u.role).includes(term));
    }
    if (colSearch.department) {
      const term = colSearch.department.toLowerCase();
      source = source.filter(u => (u.department || '').toLowerCase().includes(term));
    }
    if (colSearch.status) {
      const term = colSearch.status.toLowerCase();
      source = source.filter(u => {
        const status = u.is_active ? 'active' : 'inactive';
        return status.includes(term);
      });
    }

    if (roleFilter !== 'all' && activeTab === 'all') {
      source = source.filter(u => normalizeRole(u.role) === normalizeRole(roleFilter));
    }

    if (statusFilter !== 'all') {
      const active = statusFilter === 'active';
      source = source.filter(u => !!u.is_active === active);
    }

    return source;
  };

  const getUserCounts = () => {
    const counts: Record<string, number> = {};
    TABS.forEach(tab => {
      switch (tab.id) {
        case 'buyers':
          counts[tab.id] = buyersData.length;
          break;
        case 'sellers':
          counts[tab.id] = sellersData.length;
          break;
        case 'buyer-accounts':
          counts[tab.id] = allUsers.filter(u => normalizeRole(u.role) === 'buyer').length;
          break;
        case 'seller-accounts':
          counts[tab.id] = allUsers.filter(u => normalizeRole(u.role) === 'seller').length;
          break;
        default:
          counts[tab.id] = allUsers.filter(u =>
            tab.roles.some(r => normalizeRole(u.role) === normalizeRole(r))
          ).length;
      }
    });
    return counts;
  };

  useEffect(() => {
    setSelectedUsers([]);
    setShowBulkActions(false);
    setCurrentPage(1);
  }, [activeTab, searchTerm, colSearch, roleFilter, statusFilter]);

  const filteredUsers = getFilteredUsers();
  const userCounts = getUserCounts();
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectUser = (id?: string | number) => {
    if (id === undefined || id === null) return;
    setSelectedUsers(prev => {
      const strId = String(id);
      const has = prev.some(x => String(x) === strId);
      const next = has ? prev.filter(x => String(x) !== strId) : [...prev, id];
      setShowBulkActions(next.length > 0);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = paginatedUsers.map(u => u.id!).filter(Boolean);
    if (selectedUsers.length === allIds.length) {
      setSelectedUsers([]);
      setShowBulkActions(false);
    } else {
      setSelectedUsers(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
  if (action === 'delete') {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedUsers.length} user(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, delete ${selectedUsers.length} user(s)!`,
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: `rgba(0,0,0,0.4)`,
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;
  }

  try {
    for (const id of selectedUsers) {
      if (action === 'delete') {
        await usersAPI.deleteUser(String(id));
      } else {
        await usersAPI.updateUser(String(id), { is_active: action === 'activate' });
      }
    }

    if (action === 'delete') {
      Swal.fire({
        title: 'Deleted!',
        text: `${selectedUsers.length} user(s) have been deleted successfully.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-green-600',
          htmlContainer: 'text-xs text-gray-600'
        }
      });
    } else {
      toast.success(`${selectedUsers.length} user(s) ${action === 'activate' ? 'activated' : 'deactivated'} successfully`);
    }

    setSelectedUsers([]);
    setShowBulkActions(false);
    fetchUsers();

    if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
      const bResp = await buyerAPI.getAll();
      const rawBuyersData = normalizeListResponse<any>(bResp);
      setBuyersData(rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer')));
    }

    if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
      const sResp = await sellerAPI.getAll();
      const rawSellersData = normalizeListResponse<any>(sResp);
      setSellersData(rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller')));
    }
  } catch (err) {
    console.error(`❌ Bulk ${action} error:`, err);
    Swal.fire({
      title: 'Error!',
      text: `Bulk ${action} failed. Please try again.`,
      icon: 'error',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-red-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
    fetchUsers();
  }
};


  const handleToggleUserStatus = async (userId?: string | number, isActive?: boolean) => {
    if (userId === undefined || userId === null) return;

    const newStatus = !isActive;
    try {
      await usersAPI.updateUser(String(userId), { is_active: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();

      if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
        const bResp = await buyerAPI.getAll();
        const rawBuyersData = normalizeListResponse<any>(bResp);
        setBuyersData(rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer')));
      }

      if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
        const sResp = await sellerAPI.getAll();
        const rawSellersData = normalizeListResponse<any>(sResp);
        setSellersData(rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller')));
      }
    } catch (err) {
      console.error(`❌ Error toggling user ${userId} status:`, err);
      toast.error('Failed to update user status');
    }
  };

 const handleDeleteUser = async (userId?: string | number, userName?: string) => {
  if (userId === undefined || userId === null) return;

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete user "${userName || 'this user'}". This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    background: '#fff',
    backdrop: `rgba(0,0,0,0.4)`,
    width: '400px',
    padding: '1.5rem',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-gray-800',
      htmlContainer: 'text-sm text-gray-600 my-2',
      confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
      cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
      actions: 'flex justify-center gap-2 mt-4'
    },
    buttonsStyling: false,
  });

  if (!result.isConfirmed) return;

  try {
    await usersAPI.deleteUser(String(userId));
    
    Swal.fire({
      title: 'Deleted!',
      text: 'User has been deleted successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-green-600',
        htmlContainer: 'text-xs text-gray-600'
      }
    });

    fetchUsers();

    if (activeTab === 'buyers' || activeTab === 'buyer-accounts') {
      const bResp = await buyerAPI.getAll();
      const rawBuyersData = normalizeListResponse<any>(bResp);
      setBuyersData(rawBuyersData.map((buyer: any) => normalizeBuyerSellerData(buyer, 'buyer')));
    }

    if (activeTab === 'sellers' || activeTab === 'seller-accounts') {
      const sResp = await sellerAPI.getAll();
      const rawSellersData = normalizeListResponse<any>(sResp);
      setSellersData(rawSellersData.map((seller: any) => normalizeBuyerSellerData(seller, 'seller')));
    }
  } catch (err) {
    console.error(`❌ Error deleting user ${userId}:`, err);
    Swal.fire({
      title: 'Error!',
      text: 'Failed to delete user. Please try again.',
      icon: 'error',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-red-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
  }
};

  const getRoleColor = (role?: string) => {
    const normalizedRole = normalizeRole(role || '');
    switch (normalizedRole) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'seller': return 'bg-green-100 text-green-800';
      case 'buyer': return 'bg-orange-100 text-orange-800';
      case 'executive': return 'bg-indigo-100 text-indigo-800';
      case 'team leader': return 'bg-teal-100 text-teal-800';
      case 'team-leader': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDateForDisplay = (dateValue?: string | null) => {
    if (!dateValue) return 'N/A';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-');
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString();
    }
    return 'N/A';
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const roles = masters.role || [];
  const availableRoles = activeTab === 'all' ? roles : [];
  const activeTabConfig = TABS.find(t => t.id === activeTab)!;

  const colSearchInputStyle: any = {
  width: '100%',
  background: 'rgba(255,255,255,0.15)',
  border: '2px solid rgba(255,255,255,0.25)',
  borderRadius: '5px',
  padding: '3px 7px',
  fontSize: '11px',
  outline: 'none',
};

  return (
    <div className="space-y-4">
      {/* Local create modal fallback */}
      {showCreateModalLocal && (
        <LocalCreateModal
          createAccountTypeLocal={createAccountTypeLocal}
          createPrefill={createPrefill}
          localCreating={localCreating}
          onSubmit={handleCreateAccountSubmitLocal}
          onClose={() => { setShowCreateModalLocal(false); setCreatePrefill(null); }}
        />
      )}

      {/* Share modal */}
      {showShareModal && sharingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Share User Details</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm mb-2">
                {sharingUser.salutation ? sharingUser.salutation + ' ' : ''}{sharingUser.first_name} {sharingUser.last_name}
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Email:</strong> {sharingUser.email}</p>
                <p><strong>Username:</strong> {sharingUser.username || 'N/A'}</p>
                <p><strong>Password:</strong> {getOriginalPassword(sharingUser.id) || 'Not available'}</p>
                <p><strong>Role:</strong> {getLabelFromValue('role', sharingUser.role)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={shareViaEmail} className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs"><Mail className="h-3 w-3" /><span>Email</span></button>
              <button onClick={shareViaWhatsApp} className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs"><MessageCircle className="h-3 w-3" /><span>WhatsApp</span></button>
              <button onClick={shareViaSMS} className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs"><Phone className="h-3 w-3" /><span>SMS</span></button>
              <button onClick={copyToClipboard} className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-xs"><Copy className="h-3 w-3" /><span>Copy</span></button>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => { setShowShareModal(false); setSharingUser(null); }}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav className="flex overflow-x-auto scrollbar-hide sm:-mt-9 mt-2" aria-label="Tabs">
        <div className="flex gap-2 sm:gap-3 min-w-full sm:min-w-0">
          {TABS.map((tab) => {
            const isActive = activeTab === (tab.id as any);
            const count = userCounts[tab.id] || 0;
            const Icon = tab.id === 'all' ? UsersIcon : UserPlus;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`shrink-0 flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 border-b-2 transition-all whitespace-nowrap text-xs sm:text-sm font-medium ${
                  isActive
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold ${
                  isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Search & Filter Bar */}
      <div className="rounded-xl p-0 mt-0">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">

    {/* ✅ LEFT SIDE (Filters) */}
    <div className="flex gap-2 flex-nowrap overflow-x-auto">

      {activeTab === 'all' && (
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          disabled={masterLoading}
          className="min-w-[120px] px-2 py-1.5 text-xs lg:text-sm border border-gray-200 rounded-md bg-white"
        >
          <option value="all">All Roles</option>
          {availableRoles.map((r: any) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      )}

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="min-w-[120px] px-2 py-1.5 text-xs lg:text-sm border border-gray-200 rounded-md bg-white"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
        className="min-w-[90px] px-2 py-1.5 text-xs lg:text-sm border border-gray-200 rounded-md bg-white"
      >
        {[10, 20, 50, 100].map((n) => (
          <option key={n} value={n}>
            {n}/page
          </option>
        ))}
      </select>
    </div>

    {/* ✅ DESKTOP BULK ACTIONS (Right Side) */}
    {showBulkActions && (
      <div className="hidden lg:flex">
        <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-orange-800 font-medium text-sm whitespace-nowrap">
              {selectedUsers.length} selected
            </span>

            <Button
              size="sm"
              onClick={() => handleBulkAction('activate')}
              className="h-8 px-3 text-xs bg-green-600 text-white"
            >
              Activate
            </Button>

            <Button
              size="sm"
              onClick={() => handleBulkAction('deactivate')}
              className="h-8 px-3 text-xs bg-yellow-600 text-white"
            >
              Deactivate
            </Button>

            <Button
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="h-8 px-3 text-xs bg-red-600 text-white"
            >
              Delete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedUsers([]);
                setShowBulkActions(false);
              }}
              className="h-8 px-3 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* ✅ MOBILE BULK ACTIONS (Compact) */}
  {showBulkActions && (
    <div className="lg:hidden mt-2">
      <div className="bg-orange-50 border border-orange-200 rounded-md px-2 py-1.5">

        <div className="text-orange-800 text-[11px] font-medium mb-1">
          {selectedUsers.length} selected
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            className="flex-1 h-7 text-[10px] px-1 bg-green-600 text-white"
            onClick={() => handleBulkAction('activate')}
          >
            Activate
          </Button>

          <Button
            size="sm"
            className="flex-1 h-7 text-[10px] px-1 bg-yellow-600 text-white"
            onClick={() => handleBulkAction('deactivate')}
          >
            Deactivate
          </Button>

          <Button
            size="sm"
            className="flex-1 h-7 text-[10px] px-1 bg-red-600 text-white"
            onClick={() => handleBulkAction('delete')}
          >
            Delete
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-[10px] px-1"
            onClick={() => {
              setSelectedUsers([]);
              setShowBulkActions(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )}
</div>
     
     

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-260px)]" >
              <table className="w-full" style={{ minWidth: '1000px' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  {/* Main Headers */}
                  <tr style={{ backgroundColor: RESALE.navy }}>
                    {(activeTab !== 'buyers' && activeTab !== 'sellers') && (
                      <th className="w-8 px-3 py-3">
                        <input
                          type="checkbox"
                          checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.map(u => u.id!).filter(Boolean).length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 accent-orange-500"
                        />
                      </th>
                    )}
                    <th className="px-3 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">User</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-Black uppercase tracking-wider">Contact</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-Black uppercase tracking-wider">Role</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-Black uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-Black uppercase tracking-wider">Performance</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-Black uppercase tracking-wider">Dates</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-Black uppercase tracking-wider">Actions</th>
                  </tr>
                  {/* Column Search Row */}
                  <tr className='text-gray-500' style={{ backgroundColor: RESALE.navyLight }}>
                    {(activeTab !== 'buyers' && activeTab !== 'sellers') && <th className="px-2 py-1.5" />}
                    <th className="px-2 py-1.5">
                      <input type="text" placeholder="Search name..." value={colSearch.name} onChange={e => setColSearch(p => ({ ...p, name: e.target.value }))} style={colSearchInputStyle} />
                    </th>
                    <th className="px-2 py-1.5">
                      <input type="text" placeholder="Search email/phone..." value={colSearch.email} onChange={e => setColSearch(p => ({ ...p, email: e.target.value }))} style={colSearchInputStyle} />
                    </th>
                    <th className="px-2 py-1.5">
                      <input type="text" placeholder="Search role..." value={colSearch.role} onChange={e => setColSearch(p => ({ ...p, role: e.target.value }))} style={colSearchInputStyle} />
                    </th>
                    <th className="px-2 py-1.5">
                      <input type="text" placeholder="Search status..." value={colSearch.status} onChange={e => setColSearch(p => ({ ...p, status: e.target.value }))} style={colSearchInputStyle} />
                    </th>
                    <th className="px-2 py-1.5">
                      <input type="text" placeholder="Search dept..." value={colSearch.department} onChange={e => setColSearch(p => ({ ...p, department: e.target.value }))} style={colSearchInputStyle} />
                    </th>
                    <th className="px-2 py-1.5">
                      <input type="text" placeholder="Search date..." disabled style={{ ...colSearchInputStyle, opacity: 0.5 }} />
                    </th>
                    <th className="px-2 py-1.5" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.length > 0 ? paginatedUsers.map(user => {
                    const accountAlreadyExists = (activeTab === 'buyers' || activeTab === 'sellers') &&
                      hasAccountCreated(user.id!, activeTab === 'buyers' ? 'buyer' : 'seller');

                    return (
                      <tr key={String(user.id)} className="hover:bg-gray-50 transition-colors">
                        {(activeTab !== 'buyers' && activeTab !== 'sellers') && (
                          <td className="px-3 py-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.some(x => String(x) === String(user.id))}
                              onChange={() => handleSelectUser(user.id)}
                              className="rounded border-gray-300 accent-orange-500"
                            />
                          </td>
                        )}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {user.avatar ? (
                              <img src={String(user.avatar)} alt={`${user.first_name} avatar`} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: RESALE.orange }}>
                                {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm  text-gray-700" >
                                {user.salutation ? user.salutation + ' ' : ''}{user.first_name} {user.last_name}
                              </p>
                              {user.username && <p className="text-xs text-gray-400">@{user.username}</p>}
                              {user.dob && <p className="text-[10px] text-gray-400">DOB: {formatDateForDisplay(user.dob)}</p>}
                              {(activeTab === 'buyers' || activeTab === 'sellers') && (
                                <p className={`text-xs ${accountAlreadyExists ? 'text-green-600' : 'text-orange-600'}`}>
                                  {accountAlreadyExists ? '✓ Account Created' : '○ No Account'}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Mail size={12} className="text-gray-400" />
                              <a href={`mailto:${user.email}`} className="text-xs text-gray-600 hover:text-orange-500">{user.email}</a>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone size={12} className="text-gray-400" />
                                <a href={`tel:${user.phone}`} className="text-xs text-gray-600">{user.phone}</a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getLabelFromValue('role', user.role) || user.role}
                          </span>
                          {user.department && <div className="text-[10px] text-gray-400 mt-0.5">Dept: {user.department}</div>}
                          {user.designation && <div className="text-[10px] text-gray-400">Desig: {user.designation}</div>}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            {user.is_active ? <CheckCircle size={12} className="text-green-500" /> : <XCircle size={12} className="text-red-500" />}
                            <span className={`text-xs ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-700">
                            <div>{user.total_leads || 0} leads</div>
                            <div className="text-gray-400">{user.total_properties || 0} properties</div>
                            {user.total_revenue !== undefined && user.total_revenue !== null && (
                              <div className="text-gray-400">{formatCurrency(user.total_revenue)} revenue</div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={11} className="text-gray-400" />
                              <span>Created: {formatDateTime(user.created_at)}</span>
                            </div>
                            {user.last_login && (
                              <div className="flex items-center gap-1">
                                <Activity size={11} className="text-gray-400" />
                                <span>Last: {formatDateTime(user.last_login)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          {(activeTab === 'buyers' || activeTab === 'sellers') ? (
                            <Button
                              onClick={() => startCreateAccount(activeTab === 'buyers' ? 'buyer' : 'seller', buildPrefillFromUser(user))}
                              size="sm"
                              disabled={accountAlreadyExists}
                              className={`${accountAlreadyExists ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {accountAlreadyExists ? 'Exists' : 'Create'}
                            </Button>
                          ) : (
                            <div className="flex justify-end gap-1">
                              <button onClick={() => onEditUser(user)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: RESALE.orange }}>
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleShareUser(user)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-blue-600">
                                <Share2 size={14} />
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${user.is_active ? 'text-red-600' : 'text-green-600'}`}
                              >
                                {user.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                              </button>
                              <button 
  onClick={() => handleDeleteUser(user.id, `${user.salutation ? user.salutation + ' ' : ''}${user.first_name} ${user.last_name}`)} 
  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
>
  <Trash2 size={14} />
</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{activeTab === 'buyers' || activeTab === 'sellers' ? `No ${activeTab} data found` : 'No users found'}</h3>
                          <p className="text-gray-500 mb-4">{searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting filters' : 'No data to display'}</p>
                          {activeTabConfig?.showCreateButton && <Button onClick={() => startCreateAccount(activeTab.includes('buyer') ? 'buyer' : 'seller')} style={{ backgroundColor: RESALE.orange }} className="text-white"><Plus className="h-4 w-4 mr-1" /> {activeTabConfig.createButtonText || `Create ${activeTab.includes('buyer') ? 'Buyer' : 'Seller'} Account`}</Button>}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500">Showing {paginatedUsers.length} of {filteredUsers.length} users</div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>

     
    </div>
  );
};

export default UsersManagement;