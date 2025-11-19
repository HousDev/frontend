// // export default SellersPage;
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Users,
//   Plus,
//   Search,
//   Filter,
//   Eye,
//   Edit,
//   Trash2,
//   Phone,
//   Mail,
//   MapPin,
//   Building,
//   Star,
//   MoreHorizontal,
//   User,
//   Upload,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   UserCheck,
//   PhoneCall,
//   Send,
//   MessageCircle,
//   Bell,
//   Activity as ActivityIcon,
//   Target,
//   Eye as EyeIcon,
// } from "lucide-react";
// import SellerFormModal from "../../components/sellers/SellerFormModal";
// import SellerViewPage from "../../components/sellers/SellerViewPage";
// import SellerAccountPage from "../../components/sellers/SellerAccountPage";
// import ImportSellersLeadsModal from "../../components/sellers/ImportSellersLeadsModal";
// import { sellerAPI } from "@/lib/sellersAPI";
// import { toast } from "react-toastify";
// import SellerSidebarFilter from "./components/SellerSidebarFilter";
// import { useNavigate } from "react-router-dom";
// import TableLoader from "@/components/ui/TableLoader";
// import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
// import { useAuth } from "@/contexts/AuthContext";
// import { usersAPI } from "@/lib/api";
// import { can } from '@/utils/permission';

// // ---------- Helpers ----------
// const safe = <T,>(v: T | null | undefined, fallback: string | number = "-") =>
//   v === null || v === undefined || (typeof v === "string" && v.trim() === "")
//     ? fallback
//     : v;

// const toDate = (v?: string | null) => {
//   if (!v) return "-";
//   try {
//     const d = new Date(v);
//     if (Number.isNaN(d.getTime())) return "-";
//     return d.toISOString().slice(0, 10);
//   } catch {
//     return "-";
//   }
// };

// // --- array safety helpers ---
// const parseIfArrayJSON = (v: any): any[] => {
//   if (Array.isArray(v)) return v;
//   if (typeof v === "string") {
//     try {
//       const parsed = JSON.parse(v);
//       return Array.isArray(parsed) ? parsed : [];
//     } catch {
//       return [];
//     }
//   }
//   return [];
// };

// const ensureArray = (...candidates: any[]) => {
//   for (const c of candidates) {
//     const arr = parseIfArrayJSON(c);
//     if (arr.length) return arr;
//   }
//   return parseIfArrayJSON(candidates[0]);
// };

// // convert "Initial Contact" -> "initial_contact"
// const normalizeStage = (v?: string | null) =>
//   v ? v.toLowerCase().replace(/\s+/g, "_") : "initial_contact";

// // ---------- Types ----------
// type UISeller = {
//   id: number;
//   salutation: string;
//   name: string;
//   phone: string;
//   whatsapp: string;
//   email: string;
//   state: string;
//   city: string;
//   location: string;
//   source: string;
//   priority: string;
//   stage: string;
//   status: string;
//   leadType: string;
//   assigned: string;
//   assigned_to: number;
//   assigned_to_name: string;
//   assigned_to_email?: string;
//   assigned_to_phone?: string;
//   leadScore: number;
//   dealValue: number;
//   expectedClose: string | null;
//   properties: any[];
//   coSellers: any[];
//   activities: any[];
//   followups: any[];
//   documents: any[];
//   visits: number;
//   totalVisits: number;
//   lastActivity: string | null;
//   created_at: string | null;
//   notifications: number;
//   currentStage: string;
//   stageProgress: number;
//   dealPotential: string;
//   responseRate: number;
//   avgResponseTime: string | null;
//   isActive: boolean;
//   notes: string;
//   seller_dob: string;
// };

// type Executive = {
//   id: number;
//   name: string;
//   email?: string;
//   phone?: string;
//   username?: string;
// };

// // Map API seller -> UI seller shape
// export const mapApiSellerToUI = (api: any): UISeller => ({
//   id: Number(api.id ?? api.seller_id ?? api._id),
//   salutation: safe(api.salutation, "Mr.") as string,
//   name: safe(api.name, "-") as string,
//   phone: safe(api.phone, "-") as string,
//   whatsapp: safe(api.whatsapp, "-") as string,
//   email: safe(api.email, "-") as string,
//   state: safe(api.state, "-") as string,
//   city: safe(api.city, "-") as string,
//   location: safe(api.location, "-") as string,
//   source: safe(api.source, "-") as string,
//   leadType: safe(api.leadType, "-") as string,
//   priority: (api.priority || "-").toString().toLowerCase(),
//   stage: normalizeStage(api.stage || api.current_stage),
//   status: safe(api.status, "-") as string,
//   assigned: safe(api.assigned_to_name, "-") as string,
//   assigned_to: Number(api.assigned_to || 0),
//   assigned_to_name: safe(api.assigned_to_name, "-") as string,
//   assigned_to_email: api.assigned_to_email || null,
//   assigned_to_phone: api.assigned_to_phone || null,
//   leadScore: Number(api.lead_score || 0),
//   dealValue: Number(api.deal_value || 0),
//   expectedClose: api.expected_close || null,
//   properties: ensureArray(api.properties, api.props, api.property_list),
//   coSellers: ensureArray(api.coSellers, api.cosellers),
//   activities: ensureArray(api.activities, api.metrics?.activities),
//   followups: ensureArray(api.followups, api.metrics?.followups),
//   documents: ensureArray(api.documents, api.metrics?.documents),
//   visits: Number(api.visits || 0),
//   totalVisits: Number(api.total_visits || 0),
//   lastActivity:
//     api.last_activity ||
//     api.metrics?.last_activity_date ||
//     api.activities?.[0]?.created_at ||
//     null,
//   created_at: api.created_at || null,
//   notifications: Number(api.notifications || 0),
//   currentStage: normalizeStage(api.current_stage || api.stage),
//   stageProgress: Number(api.stage_progress || 0),
//   dealPotential: safe(api.deal_potential, "-") as string,
//   responseRate: Number(api.response_rate || 0),
//   avgResponseTime: api.avg_response_time || null,
//   isActive: !!api.is_active,
//   notes: api.notes || "",
//   seller_dob: api.seller_dob || "",
// });

// // Helper to get master data array
// const getMasterArray = (masters: Record<string, MasterOption[]>, keys: string[]): MasterOption[] => {
//   for (const key of keys) {
//     if (masters[key] && Array.isArray(masters[key])) {
//       return masters[key];
//     }
//   }
//   return [];
// };

// const UNASSIGNED_EXEC: Executive = { id: 0, name: "Not assigned" };

// // ✅ FIXED: Helper to get assignable executives based on user permissions
// const getAssignableExecutives = (currentUser: any, executives: any[]): any[] => {
//   if (!currentUser) return executives;

//   console.log('=== getAssignableExecutives DEBUG ===');
//   console.log('Current User Role:', currentUser?.role);
//   console.log('Current User ID:', currentUser?.id);
//   console.log('Available Executives:', executives);

//   // Always include unassigned executive
//   const unassignedExecs = executives.filter(exec =>
//     exec.id === 0 ||
//     exec.name?.toLowerCase().includes('unassigned') ||
//     exec.name?.toLowerCase().includes('not assigned')
//   );

//   // If user is admin/superadmin, return all executives
//   if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
//     console.log('Admin user - returning all executives');
//     return executives;
//   }

//   // If user is a manager, return executives from their department
//   if (currentUser.role === 'manager') {
//     const departmentExecs = executives.filter(exec =>
//       exec.department === currentUser.department
//     );
//     console.log('Manager user - returning department executives:', departmentExecs);
//     return [...unassignedExecs, ...departmentExecs];
//   }

//   // For executive users - return themselves + unassigned
//   const currentUserId = currentUser.id?.toString();
//   const selfExec = executives.find(exec =>
//     exec.id?.toString() === currentUserId ||
//     exec.userId?.toString() === currentUserId ||
//     exec._id?.toString() === currentUserId
//   );

//   console.log('Executive user - self found:', selfExec);

//   const result = selfExec ? [...unassignedExecs, selfExec] : unassignedExecs;
//   console.log('Final executives for executive:', result);

//   return result;
// };

// // ---------- Component ----------
// const SellersPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth(); // Get current user from auth context

//   // Permission checks
//   const canRead = can(user, 'seller.read');
//   const canCreate = can(user, 'seller.create');
//   const canUpdate = can(user, 'seller.update');
//   const canDelete = can(user, 'seller.delete');
//   const canImport = can(user, 'data.import');
//   const canExport = can(user, 'data.export');
//   const canAssign = can(user, 'seller.assign');
//   const canBulkDelete = can(user, 'seller.bulk_delete');

//   // ✅ FIXED: Check if user has any action permissions
//   const hasAnyActionPermission = canUpdate || canDelete || canAssign;

//   // ✅ FIXED: Check if user should see actions column
//   const shouldShowActionsColumn = canRead && (hasAnyActionPermission || true); // Always show if can read

//   // Main content access check
//   if (!canRead) {
//     return (
//       <div className="h-full flex flex-col bg-gray-50">
//         <div className="flex-1 grid place-items-center">
//           <div className="text-center p-6">
//             <div className="text-red-600 text-lg font-semibold mb-2">
//               Access Denied
//             </div>
//             <div className="text-gray-600 text-sm">
//               You do not have permission to view sellers.
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const [activeTab, setActiveTab] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedSellers, setSelectedSellers] = useState<number[]>([]);
//   const [showSellerForm, setShowSellerForm] = useState(false);
//   const [currentSellerView, setCurrentSellerView] = useState<UISeller | null>(null);
//   const [currentSellerAccount, setCurrentSellerAccount] = useState<UISeller | null>(null);
//   const [showImportLeads, setShowImportLeads] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [editingSeller, setEditingSeller] = useState<UISeller | null>(null);
//   const [currentSellerIndex, setCurrentSellerIndex] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(25);
//   const [sellers, setSellers] = useState<UISeller[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [errMsg, setErrMsg] = useState<string | null>(null);
//   const [bulkDeleting, setBulkDeleting] = useState(false);
//   const [executives, setExecutives] = useState<Executive[]>([]);
//   const [execsLoading, setExecsLoading] = useState(false);
//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

//   const [filters, setFilters] = useState({
//     dateFrom: "",
//     dateTo: "",
//     ignoreDate: false,
//     source: "all",
//     stage: "all",
//     priority: "all",
//     leadType: "all",
//     assigned: "all",
//     status: "all",
//   });

//   // Fetch master data
//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['seller', 'lead']);
//         setMasters(data);
//       } catch (err) {
//         console.error('Error fetching master options:', err);
//         toast.error('Failed to load dropdown options');
//       } finally {
//         setMasterLoading(false);
//       }
//     };

//     fetchMasters();
//   }, []);

//   // Fetch sellers
//   useEffect(() => {
//     const fetchSellers = async () => {
//       try {
//         setLoading(true);
//         const apiSellers = await sellerAPI.getAll();

//         const normalized = Array.isArray(apiSellers)
//           ? apiSellers.map(mapApiSellerToUI)
//           : [];
//         setSellers(normalized);
//       } catch (err) {
//         console.error("Error fetching sellers:", err);
//         setSellers([]);
//         setErrMsg("Failed to load sellers");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSellers();
//   }, []);

//   // ✅ FIXED: Load executives with better error handling
//   useEffect(() => {
//     const loadExecutives = async () => {
//       try {
//         setExecsLoading(true);

//         console.log('=== EXECUTIVES LOADING DEBUG ===');
//         console.log('Current User:', user);
//         console.log('User Role:', user?.role);

//         // Helper to format name with salutation
//         const formatName = (u: any) => {
//           const salutation = u?.salutation ? `${u.salutation} ` : '';
//           const firstName = u?.first_name || '';
//           const lastName = u?.last_name || '';
//           const usernameFallback = u?.username || u?.email || 'Executive';
//           const name = `${salutation}${firstName} ${lastName}`.trim();
//           return name || usernameFallback;
//         };

//         let salesUsers = [];

//         // Try multiple API approaches with better error handling
//         try {
//           if (usersAPI.getByDeptRole && typeof usersAPI.getByDeptRole === 'function') {
//             console.log('Using getByDeptRole API');
//             const res = await usersAPI.getByDeptRole({
//               department: 'sales',
//               role: 'executive',
//               is_active: 1,
//               limit: 100
//             });
//             salesUsers = res?.items ?? res?.data ?? res ?? [];
//           }
//           else {
//             // Try a potentially untyped alternate method safely by casting to any
//             const getUsersByDepartment = (usersAPI as any).getUsersByDepartment;
//             if (typeof getUsersByDepartment === 'function') {
//               try {
//                 console.log('Using getUsersByDepartment API');
//                 const res = await getUsersByDepartment('sales');
//                 // support both array or { items|data } shape
//                 salesUsers = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
//               } catch (e) {
//                 console.error('getUsersByDepartment call failed:', e);
//                 salesUsers = [];
//               }
//             } else if ((usersAPI as any).getAll && typeof (usersAPI as any).getAll === 'function') {
//               console.log('Using getAll API with filtering');
//               const allUsers = await (usersAPI as any).getAll();
//               salesUsers = Array.isArray(allUsers)
//                 ? allUsers.filter(user =>
//                   user.department === 'sales' &&
//                   user.role === 'executive' &&
//                   user.is_active === 1
//                 ).slice(0, 100)
//                 : [];
//             } else {
//               console.warn('No executive API method found, using empty array');
//               salesUsers = [];
//             }
//           }
//         } catch (apiError) {
//           console.error('API call failed:', apiError);
//           salesUsers = [];
//         }

//         console.log('Fetched sales users:', salesUsers);

//         // If no users found and current user is executive, create self entry
//         if (salesUsers.length === 0 && user && ['executive', 'sales'].includes(user.role)) {
//           console.log('Creating self entry for executive user');
//           const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
//           const displayName = fullName || user.username || user.email || 'Current Executive';
//           salesUsers = [{
//             id: Number(user.id) || 0,
//             name: displayName,
//             email: user.email,
//             phone: user.phone,
//             department: user.department,
//             role: user.role
//           }];
//         }

//         const formattedUsers = salesUsers.map((u: any) => ({
//           ...u,
//           id: u.id ?? u.userId ?? u._id ?? String(u.email || u.username || Math.random()),
//           name: formatName(u),
//           email: u.email || null,
//           phone: u.phone || u.mobile || null,
//         }));

//         console.log('Formatted users:', formattedUsers);

//         const allowed = getAssignableExecutives(user, formattedUsers) || [];
//         console.log('Allowed executives after filtering:', allowed);

//         const mapped: Executive[] = allowed.map((u: any) => ({
//           id: Number(u.id) || 0,
//           name: u.name,
//           email: u.email,
//           phone: u.phone,
//           username: u.raw?.username || u.username,
//         }));

//         console.log('Final executives list:', [UNASSIGNED_EXEC, ...mapped]);
//         setExecutives([UNASSIGNED_EXEC, ...mapped]);

//       } catch (e) {
//         console.error('Error loading executives:', e);

//         // Fallback for executive users - at least show unassigned + self
//         if (user && ['executive', 'sales'].includes(user.role)) {
//           const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
//           const displayName = fullName || (user as any).username || user.email || 'Current User';
//           const selfExecutive: Executive = {
//             id: Number((user as any).id) || 0,
//             name: displayName,
//             email: user.email,
//             phone: user.phone,
//           };
//           setExecutives([UNASSIGNED_EXEC, selfExecutive]);
//         } else {
//           setExecutives([UNASSIGNED_EXEC]);
//         }

//         // Only show error for non-executive users
//         if (!['executive', 'sales'].includes(user?.role)) {
//           toast.error('Could not fetch executives');
//         }
//       } finally {
//         setExecsLoading(false);
//       }
//     };

//     if (user) {
//       loadExecutives();
//     } else {
//       // If no user, still show unassigned option
//       setExecutives([UNASSIGNED_EXEC]);
//     }
//   }, [user]);

//   /* ================= Derived Options from Masters ================= */
//   const toOptionLabel = (o: any) =>
//     (o?.label ?? o?.name ?? o?.title ?? o?.value ?? o?.key ?? '').toString();

//   const toOptionValue = (o: any) =>
//     (o?.value ?? o?.key ?? o?.code ?? o?.name ?? '').toString();

//   // Get stages and priorities from master data
//   const stageRaw = getMasterArray(masters, [
//     'seller lead stage',
//   ]);

//   const priorityRaw = getMasterArray(masters, [
//     'lead_priority',
//     'lead priority',
//   ]);

//   const stageOptions = stageRaw
//     .map((o) => ({ value: toOptionValue(o), label: toOptionLabel(o) }))
//     .filter((o) => o.value);

//   const priorityOptions = priorityRaw
//     .map((o) => ({ value: toOptionValue(o).toLowerCase(), label: toOptionLabel(o) }))
//     .filter((o) => o.value);

//   // Get available stages and priorities for filters
//   const availableStages = ['all', ...stageOptions.map(s => s.value)];
//   const availablePriorities = ['all', ...priorityOptions.map(p => p.value)];

//   const formatDOB = (val: string | null) => {
//     if (!val) return ' - ';
//     const d = new Date(val);
//     if (isNaN(d.getTime())) return ' - ';
//     const dd = String(d.getDate()).padStart(2, '0');
//     const mm = String(d.getMonth() + 1).padStart(2, '0');
//     const yyyy = d.getFullYear();
//     return `${dd}/${mm}/${yyyy}`;
//   };

//   // ==================== BULK OPERATIONS ====================

//   const handleBulkAssign = async (assignedTo: number) => {
//     if (selectedSellers.length === 0) {
//       toast.info("Please select sellers to assign");
//       return;
//     }

//     // For executive users, they can only assign to themselves or unassign
//     if (user && ['executive', 'sales'].includes(user.role)) {
//       if (assignedTo !== 0 && assignedTo !== user.id) {
//         toast.error("You can only assign to yourself or unassign");
//         return;
//       }
//     }

//     try {
//       const sellerIds = selectedSellers.map(id => String(id));

//       if (assignedTo === 0) {
//         // ✅ Unassign path
//         try {
//           await sellerAPI.bulkUpdateLeadField(sellerIds, "assigned_to", null);
//         } catch {
//           await sellerAPI.bulkAssignExecutive(sellerIds as any, null as any);
//         }

//         // Local state update
//         setSellers(prev => prev.map(seller =>
//           selectedSellers.includes(seller.id)
//             ? {
//               ...seller,
//               assigned_to: 0,
//               assigned_to_name: "Unassigned",
//               assigned_to_email: undefined,
//               assigned_to_phone: undefined,
//               assigned: "Unassigned",
//             }
//             : seller
//         ));
//         setSelectedSellers([]);
//         toast.success(`Unassigned ${sellerIds.length} seller(s) successfully`);
//         return;
//       }

//       // ✅ Normal assign
//       await sellerAPI.bulkAssignExecutive(sellerIds, assignedTo);

//       const executive = executives.find(exec => exec.id === assignedTo);

//       setSellers(prev => prev.map(seller =>
//         selectedSellers.includes(seller.id)
//           ? {
//             ...seller,
//             assigned_to: assignedTo,
//             assigned_to_name: executive?.name || 'Executive',
//             assigned_to_email: executive?.email,
//             assigned_to_phone: executive?.phone,
//             assigned: executive?.name || 'Executive',
//           }
//           : seller
//       ));

//       setSelectedSellers([]);
//       toast.success(`Assigned ${sellerIds.length} seller(s) successfully`);
//     } catch (err) {
//       console.error("Error bulk assigning:", err);
//       toast.error("Failed to assign sellers");
//     }
//   };

//   const handleBulkStatusUpdate = async (status: string) => {
//     if (selectedSellers.length === 0) {
//       toast.info("Please select sellers to update status");
//       return;
//     }

//     try {
//       const sellerIds = selectedSellers.map(id => String(id));
//       await sellerAPI.bulkUpdateLeadField(
//         sellerIds,
//         "is_active",
//         status === "active" ? 1 : 0
//       );

//       setSellers(prev => prev.map(seller =>
//         selectedSellers.includes(seller.id)
//           ? { ...seller, isActive: status === "active" }
//           : seller
//       ));

//       setSelectedSellers([]);
//       toast.success(`Status updated for ${selectedSellers.length} seller(s)`);
//     } catch (err) {
//       console.error("Error bulk updating status:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleBulkStageUpdate = async (stage: string) => {
//     if (selectedSellers.length === 0) {
//       toast.info("Please select sellers to update stage");
//       return;
//     }

//     try {
//       const sellerIds = selectedSellers.map(id => String(id));
//       await sellerAPI.bulkUpdateLeadField(sellerIds, "stage", stage);

//       setSellers(prev => prev.map(seller =>
//         selectedSellers.includes(seller.id)
//           ? { ...seller, stage, currentStage: stage }
//           : seller
//       ));

//       setSelectedSellers([]);
//       toast.success(`Stage updated for ${selectedSellers.length} seller(s)`);
//     } catch (err) {
//       console.error("Error bulk updating stage:", err);
//       toast.error("Failed to update stage");
//     }
//   };

//   const handleBulkPriorityUpdate = async (priority: string) => {
//     if (selectedSellers.length === 0) {
//       toast.info("Please select sellers to update priority");
//       return;
//     }

//     try {
//       const sellerIds = selectedSellers.map(id => String(id));
//       await sellerAPI.bulkUpdateLeadField(sellerIds, "priority", priority);

//       setSellers(prev => prev.map(seller =>
//         selectedSellers.includes(seller.id)
//           ? { ...seller, priority }
//           : seller
//       ));

//       setSelectedSellers([]);
//       toast.success(`Priority updated for ${selectedSellers.length} seller(s)`);
//     } catch (err) {
//       console.error("Error bulk updating priority:", err);
//       toast.error("Failed to update priority");
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedSellers.length === 0) {
//       toast.info("⚠️ No sellers selected for deletion.");
//       return;
//     }

//     const ids = selectedSellers.map(id => String(id));

//     toast(
//       ({ closeToast }) => (
//         <div className="flex flex-col items-center text-center space-y-3 p-3">
//           <p className="text-sm font-medium">
//             Do you want to delete <b>{ids.length}</b> selected seller(s)?
//           </p>
//           <div className="flex gap-3 justify-center">
//             <button
//               className="px-4 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
//               onClick={async () => {
//                 const prevSellers = sellers;
//                 try {
//                   setBulkDeleting(true);
//                   setSellers(prev => prev.filter(s => !ids.includes(String(s.id))));
//                   setSelectedSellers([]);
//                   await sellerAPI.bulkDelete(ids);
//                   toast.success(`🗑️ ${ids.length} seller(s) deleted successfully.`);
//                 } catch (err) {
//                   console.error('Error bulk deleting sellers:', err);
//                   setSellers(prevSellers);
//                   toast.error('❌ Failed to delete sellers. Try again.');
//                 } finally {
//                   setBulkDeleting(false);
//                   closeToast?.();
//                 }
//               }}
//             >
//               ✅ Yes, Delete
//             </button>
//             <button
//               className="px-4 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
//               onClick={closeToast}
//             >
//               ❌ Cancel
//             </button>
//           </div>
//         </div>
//       ),
//       {
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         position: 'top-center',
//       }
//     );
//   };

//   const handleBulkExport = () => {
//     const rows = sellers
//       .filter(s => selectedSellers.includes(s.id))
//       .map(s => ({
//         id: s.id,
//         name: `${s.salutation} ${s.name}`.trim(),
//         phone: s.phone,
//         whatsapp: s.whatsapp,
//         email: s.email,
//         state: s.state,
//         city: s.city,
//         location: s.location,
//         source: s.source,
//         priority: s.priority,
//         leadType: s.leadType,
//         stage: s.stage,
//         status: s.status,
//         assigned: s.assigned,
//         assigned_to: s.assigned_to,
//         assigned_to_name: s.assigned_to_name,
//         assigned_to_email: s.assigned_to_email,
//         assigned_to_phone: s.assigned_to_phone,
//         leadScore: s.leadScore,
//         dealValue: s.dealValue,
//         created_at: s.created_at ?? "",
//       }));

//     if (rows.length === 0) {
//       toast.info("No sellers selected to export.");
//       return;
//     }

//     const headers = Object.keys(rows[0] ?? { id: "", name: "", phone: "" });
//     const csv = [
//       headers.join(","),
//       ...rows.map(r => headers.map(h => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `sellers_selected_${selectedSellers.length}.csv`;
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//     toast.success("Exported CSV successfully");
//   };

//   const handleExportAllFiltered = () => {
//     if (filteredSellers.length === 0) {
//       toast.info("No sellers to export based on current filters.");
//       return;
//     }

//     const rows = filteredSellers.map(s => ({
//       id: s.id,
//       name: `${s.salutation} ${s.name}`.trim(),
//       phone: s.phone,
//       email: s.email,
//       location: s.location,
//       source: s.source,
//       priority: s.priority,
//       stage: s.stage,
//       status: s.status,
//       assigned: s.assigned,
//       assigned_to: s.assigned_to,
//       assigned_to_name: s.assigned_to_name,
//       assigned_to_email: s.assigned_to_email,
//       assigned_to_phone: s.assigned_to_phone,
//       created_at: s.created_at ?? "",
//     }));

//     const headers = Object.keys(rows[0]);
//     const csv = [
//       headers.join(","),
//       ...rows.map(r => headers.map(h => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
//     ].join("\n");

//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `filtered_sellers.csv`;
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//     toast.success("Exported CSV successfully");
//   };

//   const clearSelection = () => setSelectedSellers([]);

//   const tabs = useMemo(() => {
//     const count = (pred: (s: UISeller) => boolean) =>
//       sellers.filter(pred).length;

//     return [
//       { id: "all", label: "All", count: sellers.length, color: "blue" },
//       {
//         id: "leads",
//         label: "Fresh Leads",
//         count: count((s) => s.stage === "initial_contact"),
//         color: "purple",
//       },
//       {
//         id: "active",
//         label: "Active",
//         count: count((s) => s.isActive),
//         color: "green",
//       },
//       {
//         id: "mandate",
//         label: "Mandate Signed",
//         count: count((s) => s.stage === "mandate_signed"),
//         color: "orange",
//       },
//       {
//         id: "selling",
//         label: "In Selling",
//         count: count((s) => s.stage === "selling_process"),
//         color: "indigo",
//       },
//       {
//         id: "hot",
//         label: "Hot Deals",
//         count: count(
//           (s) => s.priority === "high" && s.stage === "deal_negotiation"
//         ),
//         color: "red",
//       },
//     ];
//   }, [sellers]);

//   const sources = useMemo(() => {
//     const set = new Set<string>(["all"]);
//     sellers.forEach((s) => s.source && set.add(s.source));
//     return Array.from(set);
//   }, [sellers]);

//   const statuses = ["all", "active", "inactive"];
//   const assignedUsers = useMemo(() => {
//     const set = new Set<string>(["all"]);
//     sellers.forEach((s) => s.assigned && set.add(s.assigned));
//     return Array.from(set);
//   }, [sellers]);

//   const filteredSellers = useMemo(() => {
//     const search = searchTerm.toLowerCase();

//     return sellers.filter((seller) => {
//       const matchesSearch =
//         (seller.name || "").toLowerCase().includes(search) ||
//         (seller.phone || "").toLowerCase().includes(search) ||
//         (seller.email || "").toLowerCase().includes(search) ||
//         (seller.location || "").toLowerCase().includes(search);

//       const isActiveBool = typeof seller.isActive === "number" ? seller.isActive === 1 : !!seller.isActive;

//       const matchesTab =
//         activeTab === "all" ||
//         (activeTab === "leads" && seller.stage === "initial_contact") ||
//         (activeTab === "active" && (isActiveBool || (seller.status || "").toLowerCase() === "active")) ||
//         (activeTab === "mandate" && seller.stage === "mandate_signed") ||
//         (activeTab === "selling" && seller.stage === "selling_process") ||
//         (activeTab === "hot" && seller.priority === "high" && seller.stage === "deal_negotiation");

//       const matchesFilters =
//         (filters.source === "all" || seller.source === filters.source) &&
//         (filters.stage === "all" || seller.stage === filters.stage) &&
//         (filters.priority === "all" || seller.priority === filters.priority) &&
//         (filters.assigned === "all" || seller.assigned === filters.assigned) &&
//         (filters.status === "all" ||
//           (filters.status === "active" && seller.isActive) ||
//           (filters.status === "inactive" && !seller.isActive));

//       const createdAt = seller.created_at ? new Date(seller.created_at) : null;
//       const fromOk = !filters.dateFrom || !createdAt || createdAt >= new Date(filters.dateFrom);
//       const toOk = !filters.dateTo || !createdAt || createdAt <= new Date(filters.dateTo);
//       const matchesDate = filters.ignoreDate || (fromOk && toOk);

//       return matchesSearch && matchesTab && matchesFilters && matchesDate;
//     });
//   }, [sellers, searchTerm, activeTab, filters]);

//   // Pagination
//   const totalPages = Math.ceil(filteredSellers.length / itemsPerPage) || 1;
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedSellers = filteredSellers.slice(startIndex, startIndex + itemsPerPage);

//   const handleAddSeller = () => {
//     setEditingSeller(null);
//     setShowSellerForm(true);
//   };

//   const handleEditSeller = (seller: UISeller) => {
//     setEditingSeller(seller);
//     setShowSellerForm(true);
//   };

//   const handleViewSeller = (seller: UISeller) => {
//     const index = filteredSellers.findIndex((s) => s.id === seller.id);
//     setCurrentSellerIndex(index);
//     setCurrentSellerView(seller);
//   };

//   const handleSellerAccount = (sellerId: number) => {
//     navigate(`/dashboard/sellers-account/${sellerId}`);
//   };

//   const handleBackToList = () => {
//     setCurrentSellerView(null);
//     setCurrentSellerAccount(null);
//     setCurrentSellerIndex(0);
//   };

//   // Handle single seller deletion
//   const handleDeleteSeller = async (sellerId: number) => {
//     if (window.confirm("Are you sure you want to delete this seller?")) {
//       try {
//         await sellerAPI.delete(String(sellerId));
//         setSellers((prev) => prev.filter((s) => s.id !== sellerId));

//         if (currentSellerView?.id === sellerId) {
//           setCurrentSellerView(null);
//         }

//         toast.success("Seller deleted successfully!");
//       } catch (err: any) {
//         console.error("Error deleting seller:", err);
//         toast.error("Failed to delete seller. Please try again.");
//       }
//     }
//   };

//   const handleSaveSeller = async (sellerData: any) => {
//     try {
//       let savedSeller;

//       if (editingSeller?.id) {
//         // UPDATE
//         try {
//           savedSeller = await sellerAPI.update(String(editingSeller.id), sellerData);
//           toast.success("Seller updated successfully");
//         } catch (error: any) {
//           // If update fails with "not found", try create instead
//           if (error?.response?.status === 404 || error?.message?.includes('not found')) {
//             console.warn('Seller not found, creating new one...');
//             savedSeller = await sellerAPI.create(sellerData);
//             toast.success("Seller created successfully (original not found)");
//           } else {
//             throw error;
//           }
//         }
//       } else {
//         // CREATE
//         savedSeller = await sellerAPI.create(sellerData);
//         toast.success("Seller created successfully");
//       }

//       // Map the saved entity into UI shape
//       const updated = mapApiSellerToUI(savedSeller);

//       // ✅ IMPORTANT: Refresh the sellers list by re-fetching
//       await refreshSellersList();

//       // Close modal
//       setShowSellerForm(false);
//       setEditingSeller(null);

//     } catch (error) {
//       console.error("❌ Error saving seller:", error);
//       toast.error("Failed to save seller. Please try again.");
//     }
//   };

//   // ✅ नया function add करें sellers list refresh करने के लिए
//   const refreshSellersList = async () => {
//     try {
//       setLoading(true);
//       const apiSellers = await sellerAPI.getAll();

//       const normalized = Array.isArray(apiSellers)
//         ? apiSellers.map(mapApiSellerToUI)
//         : [];
//       setSellers(normalized);

//     } catch (err) {
//       console.error("Error refreshing sellers:", err);
//       toast.error("Failed to refresh sellers list");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSellerSelection = (sellerId: number) => {
//     setSelectedSellers((prev) =>
//       prev.includes(sellerId)
//         ? prev.filter((id) => id !== sellerId)
//         : [...prev, sellerId]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedSellers.length === paginatedSellers.length) {
//       setSelectedSellers([]);
//     } else {
//       setSelectedSellers(paginatedSellers.map((s) => s.id));
//     }
//   };

//   const handleNextSeller = () => {
//     if (currentSellerIndex < filteredSellers.length - 1) {
//       const nextIndex = currentSellerIndex + 1;
//       setCurrentSellerIndex(nextIndex);
//       setCurrentSellerView(filteredSellers[nextIndex]);
//     }
//   };

//   const handlePreviousSeller = () => {
//     if (currentSellerIndex > 0) {
//       const prevIndex = currentSellerIndex - 1;
//       setCurrentSellerIndex(prevIndex);
//       setCurrentSellerView(filteredSellers[prevIndex]);
//     }
//   };

//   const getStatusBadge = (isActive: boolean | number) => {
//     const active = typeof isActive === "number" ? isActive === 1 : isActive;
//     const config = active
//       ? { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active", icon: "🟢" }
//       : { bg: "bg-gray-100", text: "text-gray-600", label: "Inactive", icon: "⚫" };

//     return (
//       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
//         {config.icon} {config.label}
//       </span>
//     );
//   };

//   const getStageBadge = (stage: string) => {
//     // Find stage label from master data
//     const stageMaster = stageOptions.find(s => s.value === stage);
//     const stageLabel = stageMaster?.label || stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

//     const stageConfig: any = {
//       initial_contact: { bg: "bg-blue-100", text: "text-blue-700", icon: "📞" },
//       property_collection: { bg: "bg-purple-100", text: "text-purple-700", icon: "🏠" },
//       mandate_discussion: { bg: "bg-orange-100", text: "text-orange-700", icon: "💬" },
//       mandate_signed: { bg: "bg-green-100", text: "text-green-700", icon: "✅" },
//       selling_process: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "🔄" },
//       deal_negotiation: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "🤝" },
//       deal_closure: { bg: "bg-pink-100", text: "text-pink-700", icon: "📋" },
//       completed: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "🎉" },
//     };
//     const key = stage || "initial_contact";
//     const config = stageConfig[key] || { bg: "bg-gray-100", text: "text-gray-700" };
//     return (
//       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
//         {config.icon ? `${config.icon} ` : ""}{stageLabel}
//       </span>
//     );
//   };

//   const getPriorityBadge = (priority: string) => {
//     // Find priority label from master data
//     const priorityMaster = priorityOptions.find(p => p.value === priority);
//     const priorityLabel = priorityMaster?.label || priority.charAt(0).toUpperCase() + priority.slice(1);

//     const p = (priority || "").toLowerCase();
//     const priorityConfig: any = {
//       high: { bg: "bg-red-100", text: "text-red-700", icon: "🔥" },
//       medium: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "⚡" },
//       low: { bg: "bg-green-100", text: "text-green-700", icon: "🌱" },
//     };
//     const config = priorityConfig[p] || { bg: "bg-gray-100", text: "text-gray-700" };
//     return (
//       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
//         {config.icon ? `${config.icon} ` : ""}{priorityLabel}
//       </span>
//     );
//   };

//   const getLeadScore = (score: number) => {
//     const n = Number(score) || 0;
//     const color = n >= 80 ? "text-green-600" : n >= 60 ? "text-yellow-600" : "text-red-600";
//     const bgColor = n >= 80 ? "bg-green-100" : n >= 60 ? "bg-yellow-100" : "bg-red-100";
//     return (
//       <div className={`inline-flex items-center px-2 py-1 rounded-full ${bgColor} ${color}`}>
//         <Star size={12} className="mr-1" />
//         <span className="text-xs font-bold">{n}</span>
//       </div>
//     );
//   };

//   const resetFilters = () => {
//     setFilters({
//       dateFrom: "",
//       dateTo: "",
//       ignoreDate: false,
//       source: "all",
//       stage: "all",
//       priority: "all",
//       leadType: "all",
//       assigned: "all",
//       status: "all",
//     });
//   };

//   // ✅ FIXED: Calculate column span based on permissions
//   const getColSpan = () => {
//     let colSpan = 7; // Base columns without actions and checkbox

//     // Checkbox column - show if user has any bulk operation permission
//     if (canUpdate || canDelete || canAssign || canBulkDelete) {
//       colSpan += 1;
//     }

//     // ✅ FIXED: Actions column - show if user has read permission
//     if (shouldShowActionsColumn) {
//       colSpan += 1;
//     }

//     return colSpan;
//   };

//   if (currentSellerView) {
//     return (
//       <SellerViewPage
//         seller={currentSellerView}
//         onBack={handleBackToList}
//         onEdit={handleEditSeller}
//         onAccount={handleSellerAccount}
//         onNext={handleNextSeller}
//         onPrevious={handlePreviousSeller}
//         currentIndex={currentSellerIndex}
//         totalSellers={filteredSellers.length}
//         onUpdateSeller={(updatedSeller: UISeller) => {
//           setSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
//           setCurrentSellerView(updatedSeller);
//         }}
//       />
//     );
//   }

//   if (currentSellerAccount) {
//     return (
//       <SellerAccountPage
//         seller={currentSellerAccount}
//         onBack={handleBackToList}
//         onUpdateSeller={(updatedSeller: UISeller) => {
//           setSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
//           setCurrentSellerAccount(updatedSeller);
//         }}
//       />
//     );
//   }

//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
//               <Users className="text-white" size={24} />
//             </div>
//             <div>
//               <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Seller & Lead Management</h1>
//               <p className="text-sm text-gray-600">Complete seller lifecycle from lead to deal closure</p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             {/* Import Button - Conditional */}
//             {canImport && (
//               <button
//                 onClick={() => setShowImportLeads(true)}
//                 className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
//               >
//                 <Upload size={14} />
//                 <span>Import</span>
//               </button>
//             )}

//             {/* Add Seller Button - Conditional */}
//             {canCreate && (
//               <button
//                 onClick={handleAddSeller}
//                 className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm"
//               >
//                 <Plus size={14} />
//                 <span>Add Seller</span>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="mt-4">
//           <div className="flex space-x-1 overflow-x-auto pb-1">
//             {tabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${activeTab === tab.id
//                   ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200`
//                   : "text-gray-600 hover:bg-gray-100"
//                   }`}
//               >
//                 <span>{tab.label}</span>
//                 <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? `bg-${tab.color}-200` : "bg-gray-200"}`}>
//                   {tab.count}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
//         <div className="flex flex-col lg:flex-row gap-4">
//           <div className="flex-1 flex items-center space-x-3">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//               <input
//                 type="text"
//                 placeholder="Search sellers..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//               />
//             </div>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
//             >
//               <Filter size={14} />
//               <span>Filters</span>
//             </button>
//           </div>

//           <div className="flex items-center space-x-2">
//             <select
//               value={itemsPerPage}
//               onChange={(e) => setItemsPerPage(Number(e.target.value))}
//               className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             >
//               <option value={25}>25</option>
//               <option value={50}>50</option>
//               <option value={100}>100</option>
//             </select>
//             {/* Export Button - Conditional */}
//             {canExport && (
//               <button
//                 onClick={handleExportAllFiltered}
//                 className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
//               >
//                 <Download size={14} />
//                 <span>Export</span>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Quick Filters */}
//         <div className="flex flex-wrap items-center gap-2 mt-3">
//           <span className="text-xs font-medium text-gray-500">Quick:</span>
//           <button
//             onClick={() => setFilters((prev) => ({ ...prev, stage: "all", priority: "all" }))}
//             className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === "all" && filters.priority === "all"
//               ? "bg-blue-100 text-blue-700"
//               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//           >
//             All
//           </button>

//           {availableStages.filter((s) => s !== "all").slice(0, 4).map((stage) => (
//             <button
//               key={stage}
//               onClick={() => setFilters((prev) => ({ ...prev, stage }))}
//               className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === stage
//                 ? "bg-blue-100 text-blue-700"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                 }`}
//             >
//               {stageOptions.find(s => s.value === stage)?.label || stage.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
//             </button>
//           ))}

//           {availablePriorities.filter((p) => p !== "all").map((priority) => (
//             <button
//               key={priority}
//               onClick={() => setFilters((prev) => ({ ...prev, priority }))}
//               className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.priority === priority
//                 ? "bg-red-100 text-red-700"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                 }`}
//             >
//               {priorityOptions.find(p => p.value === priority)?.label || priority.charAt(0).toUpperCase() + priority.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Enhanced Bulk Actions */}
//         {selectedSellers.length > 0 && (canUpdate || canAssign || canBulkDelete || canExport) && (
//           <div className="mt-2">
//             <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5">
//               <span className="text-xs font-semibold text-blue-700">
//                 {selectedSellers.length} selected
//               </span>

//               <span className="mx-1 h-4 w-px bg-blue-200" />

//               {/* Bulk Assign Executive - Conditional */}
//               {canAssign && (
//                 <select
//                   onChange={(e) => {
//                     const execId = Number(e.target.value);
//                     if (!Number.isNaN(execId)) handleBulkAssign(execId);
//                     e.target.value = "";
//                   }}
//                   className="px-2 py-1 border border-gray-300 rounded text-xs"
//                   disabled={execsLoading}
//                 >
//                   <option value="">Assign Executive</option>
//                   <option value={0}>— Unassigned —</option>
//                   {executives
//                     .filter(exec => exec.id !== 0) // Remove unassigned from main list
//                     .map(exec => (
//                       <option key={exec.id} value={exec.id}>
//                         {exec.name} {exec.id === user?.id ? '(You)' : ''}
//                       </option>
//                     ))
//                   }
//                 </select>
//               )}

//               {/* Bulk Stage Update - Conditional */}
//               {canUpdate && (
//                 <select
//                   onChange={(e) => {
//                     const stage = e.target.value;
//                     if (stage) handleBulkStageUpdate(stage);
//                     e.target.value = "";
//                   }}
//                   className="px-2 py-1 border border-gray-300 rounded text-xs"
//                 >
//                   <option value="">Update Stage</option>
//                   {availableStages.filter(s => s !== 'all').map(stage => (
//                     <option key={stage} value={stage}>
//                       {stageOptions.find(s => s.value === stage)?.label || stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                     </option>
//                   ))}
//                 </select>
//               )}

//               {/* Bulk Priority Update - Conditional */}
//               {canUpdate && (
//                 <select
//                   onChange={(e) => {
//                     const priority = e.target.value;
//                     if (priority) handleBulkPriorityUpdate(priority);
//                     e.target.value = "";
//                   }}
//                   className="px-2 py-1 border border-gray-300 rounded text-xs"
//                 >
//                   <option value="">Update Priority</option>
//                   {availablePriorities.filter(p => p !== 'all').map(priority => (
//                     <option key={priority} value={priority}>
//                       {priorityOptions.find(p => p.value === priority)?.label || priority.charAt(0).toUpperCase() + priority.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               )}

//               {/* Bulk Status Update - Conditional */}
//               {canUpdate && (
//                 <select
//                   onChange={(e) => {
//                     const status = e.target.value;
//                     if (status) handleBulkStatusUpdate(status);
//                     e.target.value = "";
//                   }}
//                   className="px-2 py-1 border border-gray-300 rounded text-xs"
//                 >
//                   <option value="">Update Status</option>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               )}

//               {/* Bulk Export - Conditional */}
//               {canExport && (
//                 <button
//                   onClick={handleBulkExport}
//                   className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs text-white hover:bg-emerald-700"
//                 >
//                   Export
//                 </button>
//               )}

//               {/* Bulk Delete - Conditional */}
//               {canBulkDelete && (
//                 <button
//                   onClick={handleBulkDelete}
//                   disabled={bulkDeleting}
//                   className="rounded-md bg-red-600 px-2.5 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
//                 >
//                   {bulkDeleting ? 'Deleting...' : 'Delete'}
//                 </button>
//               )}

//               <div className="flex-1" />
//               <button
//                 onClick={clearSelection}
//                 className="rounded-full p-1 text-blue-700 hover:bg-blue-100"
//                 title="Clear selection"
//               >
//                 <X size={14} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Advanced Filters */}
//         <SellerSidebarFilter
//           isOpen={showFilters}
//           onClose={() => setShowFilters(false)}
//           filters={filters}
//           setFilters={setFilters}
//           resetFilters={resetFilters}
//           sources={sources}
//           stages={availableStages}
//           priorities={availablePriorities}
//           assignedUsers={assignedUsers}
//           statuses={statuses}
//         />
//       </div>

//       {/* Table */}
//       <div className="flex-1 overflow-auto">
//         <div className="bg-white">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 sticky top-0">
//               <tr>
//                 {/* Selection Checkbox - Conditional */}
//                 {(canUpdate || canDelete || canAssign || canBulkDelete) && (
//                   <th className="px-3 py-2 text-left w-8">
//                     <input
//                       type="checkbox"
//                       checked={selectedSellers.length === paginatedSellers.length && paginatedSellers.length > 0}
//                       onChange={handleSelectAll}
//                       className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                   </th>
//                 )}
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller Details</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact & Location</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business Info</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress & Activity</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>

//                 {/* ✅ FIXED: Actions column - show if user has read permission */}
//                 {shouldShowActionsColumn && (
//                   <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                     {hasAnyActionPermission ? 'Actions' : 'View'}
//                   </th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100">
//               {loading ? (
//                 <TableLoader colSpan={getColSpan()} message="Loading sellers..." size="lg" />
//               ) : errMsg ? (
//                 <tr>
//                     <td colSpan={getColSpan()} className="px-3 py-8 text-center text-sm text-red-600">
//                     {errMsg}
//                   </td>
//                 </tr>
//               ) : paginatedSellers.length > 0 ? (
//                 paginatedSellers.map((seller) => (
//                   <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
//                     {/* Selection Checkbox - Conditional */}
//                     {(canUpdate || canDelete || canAssign || canBulkDelete) && (
//                       <td className="px-3 py-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedSellers.includes(seller.id)}
//                           onChange={() => handleSellerSelection(seller.id)}
//                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                         />
//                       </td>
//                     )}

//                     {/* Seller Details */}
//                     <td className="px-3 py-3">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                           {seller.name?.charAt(0) || "S"}
//                         </div>
//                         <div>
//                           <div className="font-medium text-gray-900">
//                             {seller.salutation} {seller.name}
//                           </div>
//                           <div className="text-xs text-gray-500">ID: {seller.id}</div>
//                           <div className="flex items-center space-x-1 mt-1">
//                             {getStatusBadge(seller.isActive)}
//                             {getLeadScore(seller.leadScore)}
//                           </div>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Contact & Location */}
//                     <td className="px-3 py-3">
//                       <div className="space-y-1">
//                         <div className="flex items-center space-x-1 text-xs">
//                           <Phone size={12} className="text-gray-400" />
//                           <span>{seller.phone}</span>
//                         </div>
//                         <div className="flex items-center space-x-1 text-xs">
//                           <Mail size={12} className="text-gray-400" />
//                           <span className="truncate max-w-[120px]">{seller.email}</span>
//                         </div>
//                         <div className="flex items-center space-x-1 text-xs">
//                           <MapPin size={12} className="text-gray-400" />
//                           <span className="truncate max-w-[120px]">{seller.location}</span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Business Info */}
//                     <td className="px-3 py-3">
//                       <div className="space-y-1">
//                         <div>{getStageBadge(seller.stage)}</div>
//                         <div>{getPriorityBadge(seller.priority)}</div>
//                         <div className="text-xs text-gray-600">
//                           Source: <span className="font-medium">{seller.source}</span>
//                         </div>
//                         <div className="text-xs text-gray-600">
//                           Created: <span className="font-medium">{toDate(seller.created_at)}</span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Assigned To */}
//                     <td className="px-3 py-3">
//                       <div className="flex items-center space-x-2">
//                         <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
//                           {seller.assigned_to_name?.charAt(0) || "U"}
//                         </div>
//                         <div className="text-sm">
//                           <div className="font-medium text-gray-900">{seller.assigned_to_name || "Unassigned"}</div>
//                           {seller.assigned_to_email && (
//                             <div className="text-xs text-gray-500 truncate max-w-[120px]">{seller.assigned_to_email}</div>
//                           )}
//                         </div>
//                       </div>
//                     </td>

//                     {/* Progress & Activity */}
//                     <td className="px-3 py-3">
//                       <div className="space-y-1">
//                         <div className="text-xs">
//                           <div className="flex justify-between mb-1">
//                             <span>Stage Progress</span>
//                             <span>{seller.stageProgress}%</span>
//                           </div>
//                           <div className="w-full bg-gray-200 rounded-full h-1.5">
//                             <div
//                               className="bg-blue-600 h-1.5 rounded-full"
//                               style={{ width: `${seller.stageProgress}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                         <div className="text-xs text-gray-600">
//                           Visits: <span className="font-medium">{seller.visits}</span>
//                         </div>
//                         <div className="text-xs text-gray-600">
//                           Last Activity: <span className="font-medium">{toDate(seller.lastActivity)}</span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Performance */}
//                     <td className="px-3 py-3">
//                       <div className="space-y-1 text-xs">
//                         <div className="flex justify-between">
//                           <span>Deal Value:</span>
//                           <span className="font-medium">₹{seller.dealValue?.toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>Response Rate:</span>
//                           <span className="font-medium">{seller.responseRate}%</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>Properties:</span>
//                           <span className="font-medium">{seller.properties?.length || 0}</span>
//                         </div>
//                         {seller.expectedClose && (
//                           <div className="flex justify-between">
//                             <span>Expected Close:</span>
//                             <span className="font-medium text-orange-600">{toDate(seller.expectedClose)}</span>
//                           </div>
//                         )}
//                       </div>
//                     </td>

//                     {/* ✅ FIXED: Actions Column - Always show if user can read */}
//                     {shouldShowActionsColumn && (
//                       <td className="px-3 py-3">
//                         <div className="flex items-center space-x-1">
//                           <button
//                             onClick={() => handleViewSeller(seller)}
//                             className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
//                             title="View Details"
//                           >
//                             <Eye size={14} />
//                           </button>
//                             <button
//                               onClick={() => handleSellerAccount(seller.id)}
//                               className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
//                               title="Seller Account"
//                             >
//                               <UserCheck size={14} />
//                             </button>

//                           {/* Edit Button - Conditional */}
//                           {canUpdate && (
//                             <button
//                               onClick={() => handleEditSeller(seller)}
//                               className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
//                               title="Edit"
//                             >
//                               <Edit size={14} />
//                             </button>
//                           )}

//                           {/* More Actions Dropdown - Conditional */}
                          
//                             <div className="relative group">
//                               <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors">
//                                 <MoreHorizontal size={14} />
//                               </button>
//                               <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
//                                 <div className="p-1">
//                                   {/* Communication Actions - Conditional */}
                                  
//                                     <>
//                                       <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
//                                         <PhoneCall size={12} />
//                                         <span>Call</span>
//                                       </button>
//                                       <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
//                                         <MessageCircle size={12} />
//                                         <span>WhatsApp</span>
//                                       </button>
//                                       <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
//                                         <Send size={12} />
//                                         <span>Email</span>
//                                       </button>
//                                     </>
                  

//                                   {/* Delete Button - Conditional */}
//                                   {canDelete && (
//                                     <button
//                                       onClick={() => handleDeleteSeller(seller.id)}
//                                       className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full text-left"
//                                     >
//                                       <Trash2 size={12} />
//                                       <span>Delete</span>
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                         </div>
//                       </td>
//                     )}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                         <td colSpan={getColSpan()} className="px-3 py-8 text-center text-sm text-gray-500">
//                     No sellers found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       {!loading && !errMsg && (
//         <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-3">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//             <div className="text-sm text-gray-700">
//               Showing {filteredSellers.length === 0 ? 0 : startIndex + 1}-
//               {Math.min(startIndex + itemsPerPage, filteredSellers.length)} of {filteredSellers.length}
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <ChevronLeft size={14} />
//               </button>
//               <div className="flex items-center space-x-1">
//                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                   const page = i + 1;
//                   return (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`px-2 py-1 rounded text-xs ${currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
//                     >
//                       {page}
//                     </button>
//                   );
//                 })}
//                 {totalPages > 5 && (
//                   <>
//                     <span className="px-1 text-xs">...</span>
//                     <button
//                       onClick={() => setCurrentPage(totalPages)}
//                       className={`px-2 py-1 rounded text-xs ${currentPage === totalPages ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
//                     >
//                       {totalPages}
//                     </button>
//                   </>
//                 )}
//               </div>
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//                 className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <ChevronRight size={14} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       {showSellerForm && (
//         <SellerFormModal
//           key={editingSeller ? `edit-${editingSeller.id}` : 'create'}
//           isOpen={showSellerForm}
//           seller={editingSeller || undefined}
//           onClose={() => {
//             setShowSellerForm(false);
//             setEditingSeller(null);
//           }}
//           onSave={handleSaveSeller}
//         />
//       )}

//       {showImportLeads && (
//         <ImportSellersLeadsModal isOpen={showImportLeads} onClose={() => setShowImportLeads(false)} />
//       )}
//     </div>
//   );
// };

// export default SellersPage;

import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  MoreHorizontal,
  User,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  PhoneCall,
  Send,
  MessageCircle,
  Bell,
  Activity as ActivityIcon,
  Target,
  Eye as EyeIcon,
} from "lucide-react";
import SellerFormModal from "../../components/sellers/SellerFormModal";
import SellerViewPage from "../../components/sellers/SellerViewPage";
import SellerAccountPage from "../../components/sellers/SellerAccountPage";
import ImportSellersLeadsModal from "../../components/sellers/ImportSellersLeadsModal";
import { sellerAPI } from "@/lib/sellersAPI";
import { toast } from "react-toastify";
import SellerSidebarFilter from "./components/SellerSidebarFilter";
import { useNavigate } from "react-router-dom";
import TableLoader from "@/components/ui/TableLoader";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import { can } from '@/utils/permission';

// ---------- Helpers ----------
const safe = <T,>(v: T | null | undefined, fallback: string | number = "-") =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "")
    ? fallback
    : v;

const toDate = (v?: string | null) => {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toISOString().slice(0, 10);
  } catch {
    return "-";
  }
};

// --- array safety helpers ---
const parseIfArrayJSON = (v: any): any[] => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const ensureArray = (...candidates: any[]) => {
  for (const c of candidates) {
    const arr = parseIfArrayJSON(c);
    if (arr.length) return arr;
  }
  return parseIfArrayJSON(candidates[0]);
};

// convert "Initial Contact" -> "initial_contact"
const normalizeStage = (v?: string | null) =>
  v ? v.toLowerCase().replace(/\s+/g, "_") : "initial_contact";

// ---------- Types ----------
type UISeller = {
  id: number;
  salutation: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  state: string;
  city: string;
  location: string;
  source: string;
  priority: string;
  stage: string;
  status: string;
  leadType: string;
  assigned: string;
  assigned_to: number;
  assigned_to_name: string;
  assigned_to_email?: string;
  assigned_to_phone?: string;
  leadScore: number;
  dealValue: number;
  expectedClose: string | null;
  properties: any[];
  coSellers: any[];
  activities: any[];
  followups: any[];
  documents: any[];
  visits: number;
  totalVisits: number;
  lastActivity: string | null;
  created_at: string | null;
  notifications: number;
  currentStage: string;
  stageProgress: number;
  dealPotential: string;
  responseRate: number;
  avgResponseTime: string | null;
  isActive: boolean;
  notes: string;
  seller_dob: string;
};

type Executive = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
};

// Map API seller -> UI seller shape
export const mapApiSellerToUI = (api: any): UISeller => ({
  id: Number(api.id ?? api.seller_id ?? api._id),
  salutation: safe(api.salutation, "Mr.") as string,
  name: safe(api.name, "-") as string,
  phone: safe(api.phone, "-") as string,
  whatsapp: safe(api.whatsapp, "-") as string,
  email: safe(api.email, "-") as string,
  state: safe(api.state, "-") as string,
  city: safe(api.city, "-") as string,
  location: safe(api.location, "-") as string,
  source: safe(api.source, "-") as string,
  leadType: safe(api.leadType, "-") as string,
  priority: (api.priority || "-").toString().toLowerCase(),
  stage: normalizeStage(api.stage || api.current_stage),
  status: safe(api.status, "-") as string,
  assigned: safe(api.assigned_to_name, "-") as string,
  assigned_to: Number(api.assigned_to || 0),
  assigned_to_name: safe(api.assigned_to_name, "-") as string,
  assigned_to_email: api.assigned_to_email || null,
  assigned_to_phone: api.assigned_to_phone || null,
  leadScore: Number(api.lead_score || 0),
  dealValue: Number(api.deal_value || 0),
  expectedClose: api.expected_close || null,
  properties: ensureArray(api.properties, api.props, api.property_list),
  coSellers: ensureArray(api.coSellers, api.cosellers),
  activities: ensureArray(api.activities, api.metrics?.activities),
  followups: ensureArray(api.followups, api.metrics?.followups),
  documents: ensureArray(api.documents, api.metrics?.documents),
  visits: Number(api.visits || 0),
  totalVisits: Number(api.total_visits || 0),
  lastActivity:
    api.last_activity ||
    api.metrics?.last_activity_date ||
    api.activities?.[0]?.created_at ||
    null,
  created_at: api.created_at || null,
  notifications: Number(api.notifications || 0),
  currentStage: normalizeStage(api.current_stage || api.stage),
  stageProgress: Number(api.stage_progress || 0),
  dealPotential: safe(api.deal_potential, "-") as string,
  responseRate: Number(api.response_rate || 0),
  avgResponseTime: api.avg_response_time || null,
  isActive: !!api.is_active,
  notes: api.notes || "",
  seller_dob: api.seller_dob || "",
});

// Helper to get master data array
const getMasterArray = (masters: Record<string, MasterOption[]>, keys: string[]): MasterOption[] => {
  for (const key of keys) {
    if (masters[key] && Array.isArray(masters[key])) {
      return masters[key];
    }
  }
  return [];
};

const UNASSIGNED_EXEC: Executive = { id: 0, name: "Not assigned" };

// ✅ FIXED: Helper to get assignable executives based on user permissions
const getAssignableExecutives = (currentUser: any, executives: any[]): any[] => {
  if (!currentUser) return executives;

  console.log('=== getAssignableExecutives DEBUG ===');
  console.log('Current User Role:', currentUser?.role);
  console.log('Current User ID:', currentUser?.id);
  console.log('Available Executives:', executives);

  // Always include unassigned executive
  const unassignedExecs = executives.filter(exec =>
    exec.id === 0 ||
    exec.name?.toLowerCase().includes('unassigned') ||
    exec.name?.toLowerCase().includes('not assigned')
  );

  // If user is admin/superadmin, return all executives
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    console.log('Admin user - returning all executives');
    return executives;
  }

  // If user is a manager, return executives from their department
  if (currentUser.role === 'manager') {
    const departmentExecs = executives.filter(exec =>
      exec.department === currentUser.department
    );
    console.log('Manager user - returning department executives:', departmentExecs);
    return [...unassignedExecs, ...departmentExecs];
  }

  // For executive users - return themselves + unassigned
  const currentUserId = currentUser.id?.toString();
  const selfExec = executives.find(exec =>
    exec.id?.toString() === currentUserId ||
    exec.userId?.toString() === currentUserId ||
    exec._id?.toString() === currentUserId
  );

  console.log('Executive user - self found:', selfExec);

  const result = selfExec ? [...unassignedExecs, selfExec] : unassignedExecs;
  console.log('Final executives for executive:', result);

  return result;
};

// ---------- Component ----------
const SellersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user from auth context

  // ✅ PERMISSION CHECKS
  const canRead = can(user, 'seller.read');
  const canCreate = can(user, 'seller.create');
  const canUpdate = can(user, 'seller.update');
  const canDelete = can(user, 'seller.delete');
  const canImport = can(user, 'data.import');
  const canExport = can(user, 'data.export');
  const canAssign = can(user, 'seller.assign');
  const canBulkDelete = can(user, 'seller.bulk_delete');

  // ✅ Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete || canAssign;

  // ✅ Check if user should see actions column
  const shouldShowActionsColumn = canRead && (hasAnyActionPermission || true);

  // ✅ MAIN ACCESS CONTROL GATE
  if (!canRead) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Access Denied
            </div>
            <div className="text-gray-600 text-sm">
              You do not have permission to view sellers.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSellers, setSelectedSellers] = useState<number[]>([]);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [currentSellerView, setCurrentSellerView] = useState<UISeller | null>(null);
  const [currentSellerAccount, setCurrentSellerAccount] = useState<UISeller | null>(null);
  const [showImportLeads, setShowImportLeads] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingSeller, setEditingSeller] = useState<UISeller | null>(null);
  const [currentSellerIndex, setCurrentSellerIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sellers, setSellers] = useState<UISeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [execsLoading, setExecsLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    ignoreDate: false,
    source: "all",
    stage: "all",
    priority: "all",
    leadType: "all",
    assigned: "all",
    status: "all",
  });

  // Fetch master data
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['seller', 'lead']);
        setMasters(data);
      } catch (err) {
        console.error('Error fetching master options:', err);
        toast.error('Failed to load dropdown options');
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);

  // Fetch sellers
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const apiSellers = await sellerAPI.getAll();

        const normalized = Array.isArray(apiSellers)
          ? apiSellers.map(mapApiSellerToUI)
          : [];
        setSellers(normalized);
      } catch (err) {
        console.error("Error fetching sellers:", err);
        setSellers([]);
        setErrMsg("Failed to load sellers");
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // ✅ FIXED: Load executives with better error handling
  useEffect(() => {
    const loadExecutives = async () => {
      try {
        setExecsLoading(true);

        console.log('=== EXECUTIVES LOADING DEBUG ===');
        console.log('Current User:', user);
        console.log('User Role:', user?.role);

        // Helper to format name with salutation
        const formatName = (u: any) => {
          const salutation = u?.salutation ? `${u.salutation} ` : '';
          const firstName = u?.first_name || '';
          const lastName = u?.last_name || '';
          const usernameFallback = u?.username || u?.email || 'Executive';
          const name = `${salutation}${firstName} ${lastName}`.trim();
          return name || usernameFallback;
        };

        let salesUsers = [];

        // Try multiple API approaches with better error handling
        try {
          if (usersAPI.getByDeptRole && typeof usersAPI.getByDeptRole === 'function') {
            console.log('Using getByDeptRole API');
            const res = await usersAPI.getByDeptRole({
              department: 'sales',
              role: 'executive',
              is_active: 1,
              limit: 100
            });
            salesUsers = res?.items ?? res?.data ?? res ?? [];
          }
          else {
            // Try a potentially untyped alternate method safely by casting to any
            const getUsersByDepartment = (usersAPI as any).getUsersByDepartment;
            if (typeof getUsersByDepartment === 'function') {
              try {
                console.log('Using getUsersByDepartment API');
                const res = await getUsersByDepartment('sales');
                // support both array or { items|data } shape
                salesUsers = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
              } catch (e) {
                console.error('getUsersByDepartment call failed:', e);
                salesUsers = [];
              }
            } else if ((usersAPI as any).getAll && typeof (usersAPI as any).getAll === 'function') {
              console.log('Using getAll API with filtering');
              const allUsers = await (usersAPI as any).getAll();
              salesUsers = Array.isArray(allUsers)
                ? allUsers.filter(user =>
                  user.department === 'sales' &&
                  user.role === 'executive' &&
                  user.is_active === 1
                ).slice(0, 100)
                : [];
            } else {
              console.warn('No executive API method found, using empty array');
              salesUsers = [];
            }
          }
        } catch (apiError) {
          console.error('API call failed:', apiError);
          salesUsers = [];
        }

        console.log('Fetched sales users:', salesUsers);

        // If no users found and current user is executive, create self entry
        if (salesUsers.length === 0 && user && ['executive', 'sales'].includes(user.role)) {
          console.log('Creating self entry for executive user');
          const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
          const displayName = fullName || user.username || user.email || 'Current Executive';
          salesUsers = [{
            id: Number(user.id) || 0,
            name: displayName,
            email: user.email,
            phone: user.phone,
            department: user.department,
            role: user.role
          }];
        }

        const formattedUsers = salesUsers.map((u: any) => ({
          ...u,
          id: u.id ?? u.userId ?? u._id ?? String(u.email || u.username || Math.random()),
          name: formatName(u),
          email: u.email || null,
          phone: u.phone || u.mobile || null,
        }));

        console.log('Formatted users:', formattedUsers);

        const allowed = getAssignableExecutives(user, formattedUsers) || [];
        console.log('Allowed executives after filtering:', allowed);

        const mapped: Executive[] = allowed.map((u: any) => ({
          id: Number(u.id) || 0,
          name: u.name,
          email: u.email,
          phone: u.phone,
          username: u.raw?.username || u.username,
        }));

        console.log('Final executives list:', [UNASSIGNED_EXEC, ...mapped]);
        setExecutives([UNASSIGNED_EXEC, ...mapped]);

      } catch (e) {
        console.error('Error loading executives:', e);

        // Fallback for executive users - at least show unassigned + self
        if (user && ['executive', 'sales'].includes(user.role)) {
          const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
          const displayName = fullName || (user as any).username || user.email || 'Current User';
          const selfExecutive: Executive = {
            id: Number((user as any).id) || 0,
            name: displayName,
            email: user.email,
            phone: user.phone,
          };
          setExecutives([UNASSIGNED_EXEC, selfExecutive]);
        } else {
          setExecutives([UNASSIGNED_EXEC]);
        }

        // Only show error for non-executive users
        if (!['executive', 'sales'].includes(user?.role)) {
          toast.error('Could not fetch executives');
        }
      } finally {
        setExecsLoading(false);
      }
    };

    if (user) {
      loadExecutives();
    } else {
      // If no user, still show unassigned option
      setExecutives([UNASSIGNED_EXEC]);
    }
  }, [user]);

  /* ================= Derived Options from Masters ================= */
  const toOptionLabel = (o: any) =>
    (o?.label ?? o?.name ?? o?.title ?? o?.value ?? o?.key ?? '').toString();

  const toOptionValue = (o: any) =>
    (o?.value ?? o?.key ?? o?.code ?? o?.name ?? '').toString();

  // Get stages and priorities from master data
  const stageRaw = getMasterArray(masters, [
    'seller lead stage',
  ]);

  const priorityRaw = getMasterArray(masters, [
    'lead_priority',
    'lead priority',
  ]);

  const stageOptions = stageRaw
    .map((o) => ({ value: toOptionValue(o), label: toOptionLabel(o) }))
    .filter((o) => o.value);

  const priorityOptions = priorityRaw
    .map((o) => ({ value: toOptionValue(o).toLowerCase(), label: toOptionLabel(o) }))
    .filter((o) => o.value);

  // Get available stages and priorities for filters
  const availableStages = ['all', ...stageOptions.map(s => s.value)];
  const availablePriorities = ['all', ...priorityOptions.map(p => p.value)];

  const formatDOB = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // ==================== BULK OPERATIONS ====================

  const handleBulkAssign = async (assignedTo: number) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to assign");
      return;
    }

    // For executive users, they can only assign to themselves or unassign
    if (user && ['executive', 'sales'].includes(user.role)) {
      if (assignedTo !== 0 && assignedTo !== user.id) {
        toast.error("You can only assign to yourself or unassign");
        return;
      }
    }

    try {
      const sellerIds = selectedSellers.map(id => String(id));

      if (assignedTo === 0) {
        // ✅ Unassign path
        try {
          await sellerAPI.bulkUpdateLeadField(sellerIds, "assigned_to", null);
        } catch {
          await sellerAPI.bulkAssignExecutive(sellerIds as any, null as any);
        }

        // Local state update
        setSellers(prev => prev.map(seller =>
          selectedSellers.includes(seller.id)
            ? {
              ...seller,
              assigned_to: 0,
              assigned_to_name: "Unassigned",
              assigned_to_email: undefined,
              assigned_to_phone: undefined,
              assigned: "Unassigned",
            }
            : seller
        ));
        setSelectedSellers([]);
        toast.success(`Unassigned ${sellerIds.length} seller(s) successfully`);
        return;
      }

      // ✅ Normal assign
      await sellerAPI.bulkAssignExecutive(sellerIds, assignedTo);

      const executive = executives.find(exec => exec.id === assignedTo);

      setSellers(prev => prev.map(seller =>
        selectedSellers.includes(seller.id)
          ? {
            ...seller,
            assigned_to: assignedTo,
            assigned_to_name: executive?.name || 'Executive',
            assigned_to_email: executive?.email,
            assigned_to_phone: executive?.phone,
            assigned: executive?.name || 'Executive',
          }
          : seller
      ));

      setSelectedSellers([]);
      toast.success(`Assigned ${sellerIds.length} seller(s) successfully`);
    } catch (err) {
      console.error("Error bulk assigning:", err);
      toast.error("Failed to assign sellers");
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to update status");
      return;
    }

    try {
      const sellerIds = selectedSellers.map(id => String(id));
      await sellerAPI.bulkUpdateLeadField(
        sellerIds,
        "is_active",
        status === "active" ? 1 : 0
      );

      setSellers(prev => prev.map(seller =>
        selectedSellers.includes(seller.id)
          ? { ...seller, isActive: status === "active" }
          : seller
      ));

      setSelectedSellers([]);
      toast.success(`Status updated for ${selectedSellers.length} seller(s)`);
    } catch (err) {
      console.error("Error bulk updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleBulkStageUpdate = async (stage: string) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to update stage");
      return;
    }

    try {
      const sellerIds = selectedSellers.map(id => String(id));
      await sellerAPI.bulkUpdateLeadField(sellerIds, "stage", stage);

      setSellers(prev => prev.map(seller =>
        selectedSellers.includes(seller.id)
          ? { ...seller, stage, currentStage: stage }
          : seller
      ));

      setSelectedSellers([]);
      toast.success(`Stage updated for ${selectedSellers.length} seller(s)`);
    } catch (err) {
      console.error("Error bulk updating stage:", err);
      toast.error("Failed to update stage");
    }
  };

  const handleBulkPriorityUpdate = async (priority: string) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to update priority");
      return;
    }

    try {
      const sellerIds = selectedSellers.map(id => String(id));
      await sellerAPI.bulkUpdateLeadField(sellerIds, "priority", priority);

      setSellers(prev => prev.map(seller =>
        selectedSellers.includes(seller.id)
          ? { ...seller, priority }
          : seller
      ));

      setSelectedSellers([]);
      toast.success(`Priority updated for ${selectedSellers.length} seller(s)`);
    } catch (err) {
      console.error("Error bulk updating priority:", err);
      toast.error("Failed to update priority");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSellers.length === 0) {
      toast.info("⚠️ No sellers selected for deletion.");
      return;
    }

    const ids = selectedSellers.map(id => String(id));

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col items-center text-center space-y-3 p-3">
          <p className="text-sm font-medium">
            Do you want to delete <b>{ids.length}</b> selected seller(s)?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="px-4 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              onClick={async () => {
                const prevSellers = sellers;
                try {
                  setBulkDeleting(true);
                  setSellers(prev => prev.filter(s => !ids.includes(String(s.id))));
                  setSelectedSellers([]);
                  await sellerAPI.bulkDelete(ids);
                  toast.success(`🗑️ ${ids.length} seller(s) deleted successfully.`);
                } catch (err) {
                  console.error('Error bulk deleting sellers:', err);
                  setSellers(prevSellers);
                  toast.error('❌ Failed to delete sellers. Try again.');
                } finally {
                  setBulkDeleting(false);
                  closeToast?.();
                }
              }}
            >
              ✅ Yes, Delete
            </button>
            <button
              className="px-4 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
              onClick={closeToast}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: 'top-center',
      }
    );
  };

  const handleBulkExport = () => {
    const rows = sellers
      .filter(s => selectedSellers.includes(s.id))
      .map(s => ({
        id: s.id,
        name: `${s.salutation} ${s.name}`.trim(),
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        state: s.state,
        city: s.city,
        location: s.location,
        source: s.source,
        priority: s.priority,
        leadType: s.leadType,
        stage: s.stage,
        status: s.status,
        assigned: s.assigned,
        assigned_to: s.assigned_to,
        assigned_to_name: s.assigned_to_name,
        assigned_to_email: s.assigned_to_email,
        assigned_to_phone: s.assigned_to_phone,
        leadScore: s.leadScore,
        dealValue: s.dealValue,
        created_at: s.created_at ?? "",
      }));

    if (rows.length === 0) {
      toast.info("No sellers selected to export.");
      return;
    }

    const headers = Object.keys(rows[0] ?? { id: "", name: "", phone: "" });
    const csv = [
      headers.join(","),
      ...rows.map(r => headers.map(h => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sellers_selected_${selectedSellers.length}.csv`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV successfully");
  };

  const handleExportAllFiltered = () => {
    if (filteredSellers.length === 0) {
      toast.info("No sellers to export based on current filters.");
      return;
    }

    const rows = filteredSellers.map(s => ({
      id: s.id,
      name: `${s.salutation} ${s.name}`.trim(),
      phone: s.phone,
      email: s.email,
      location: s.location,
      source: s.source,
      priority: s.priority,
      stage: s.stage,
      status: s.status,
      assigned: s.assigned,
      assigned_to: s.assigned_to,
      assigned_to_name: s.assigned_to_name,
      assigned_to_email: s.assigned_to_email,
      assigned_to_phone: s.assigned_to_phone,
      created_at: s.created_at ?? "",
    }));

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(r => headers.map(h => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filtered_sellers.csv`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV successfully");
  };

  const clearSelection = () => setSelectedSellers([]);

  const tabs = useMemo(() => {
    const count = (pred: (s: UISeller) => boolean) =>
      sellers.filter(pred).length;

    return [
      { id: "all", label: "All", count: sellers.length, color: "blue" },
      {
        id: "leads",
        label: "Fresh Leads",
        count: count((s) => s.stage === "initial_contact"),
        color: "purple",
      },
      {
        id: "active",
        label: "Active",
        count: count((s) => s.isActive),
        color: "green",
      },
      {
        id: "mandate",
        label: "Mandate Signed",
        count: count((s) => s.stage === "mandate_signed"),
        color: "orange",
      },
      {
        id: "selling",
        label: "In Selling",
        count: count((s) => s.stage === "selling_process"),
        color: "indigo",
      },
      {
        id: "hot",
        label: "Hot Deals",
        count: count(
          (s) => s.priority === "high" && s.stage === "deal_negotiation"
        ),
        color: "red",
      },
    ];
  }, [sellers]);

  const sources = useMemo(() => {
    const set = new Set<string>(["all"]);
    sellers.forEach((s) => s.source && set.add(s.source));
    return Array.from(set);
  }, [sellers]);

  const statuses = ["all", "active", "inactive"];
  const assignedUsers = useMemo(() => {
    const set = new Set<string>(["all"]);
    sellers.forEach((s) => s.assigned && set.add(s.assigned));
    return Array.from(set);
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return sellers.filter((seller) => {
      const matchesSearch =
        (seller.name || "").toLowerCase().includes(search) ||
        (seller.phone || "").toLowerCase().includes(search) ||
        (seller.email || "").toLowerCase().includes(search) ||
        (seller.location || "").toLowerCase().includes(search);

      const isActiveBool = typeof seller.isActive === "number" ? seller.isActive === 1 : !!seller.isActive;

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "leads" && seller.stage === "initial_contact") ||
        (activeTab === "active" && (isActiveBool || (seller.status || "").toLowerCase() === "active")) ||
        (activeTab === "mandate" && seller.stage === "mandate_signed") ||
        (activeTab === "selling" && seller.stage === "selling_process") ||
        (activeTab === "hot" && seller.priority === "high" && seller.stage === "deal_negotiation");

      const matchesFilters =
        (filters.source === "all" || seller.source === filters.source) &&
        (filters.stage === "all" || seller.stage === filters.stage) &&
        (filters.priority === "all" || seller.priority === filters.priority) &&
        (filters.assigned === "all" || seller.assigned === filters.assigned) &&
        (filters.status === "all" ||
          (filters.status === "active" && seller.isActive) ||
          (filters.status === "inactive" && !seller.isActive));

      const createdAt = seller.created_at ? new Date(seller.created_at) : null;
      const fromOk = !filters.dateFrom || !createdAt || createdAt >= new Date(filters.dateFrom);
      const toOk = !filters.dateTo || !createdAt || createdAt <= new Date(filters.dateTo);
      const matchesDate = filters.ignoreDate || (fromOk && toOk);

      return matchesSearch && matchesTab && matchesFilters && matchesDate;
    });
  }, [sellers, searchTerm, activeTab, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSellers = filteredSellers.slice(startIndex, startIndex + itemsPerPage);

  const handleAddSeller = () => {
    setEditingSeller(null);
    setShowSellerForm(true);
  };

  const handleEditSeller = (seller: UISeller) => {
    setEditingSeller(seller);
    setShowSellerForm(true);
  };

  const handleViewSeller = (seller: UISeller) => {
    const index = filteredSellers.findIndex((s) => s.id === seller.id);
    setCurrentSellerIndex(index);
    setCurrentSellerView(seller);
  };

  const handleSellerAccount = (sellerId: number) => {
    navigate(`/dashboard/sellers-account/${sellerId}`);
  };

  const handleBackToList = () => {
    setCurrentSellerView(null);
    setCurrentSellerAccount(null);
    setCurrentSellerIndex(0);
  };

  // Handle single seller deletion
  const handleDeleteSeller = async (sellerId: number) => {
    if (window.confirm("Are you sure you want to delete this seller?")) {
      try {
        await sellerAPI.delete(String(sellerId));
        setSellers((prev) => prev.filter((s) => s.id !== sellerId));

        if (currentSellerView?.id === sellerId) {
          setCurrentSellerView(null);
        }

        toast.success("Seller deleted successfully!");
      } catch (err: any) {
        console.error("Error deleting seller:", err);
        toast.error("Failed to delete seller. Please try again.");
      }
    }
  };

  const handleSaveSeller = async (sellerData: any) => {
    try {
      let savedSeller;

      if (editingSeller?.id) {
        // UPDATE
        try {
          savedSeller = await sellerAPI.update(String(editingSeller.id), sellerData);
          toast.success("Seller updated successfully");
        } catch (error: any) {
          // If update fails with "not found", try create instead
          if (error?.response?.status === 404 || error?.message?.includes('not found')) {
            console.warn('Seller not found, creating new one...');
            savedSeller = await sellerAPI.create(sellerData);
            toast.success("Seller created successfully (original not found)");
          } else {
            throw error;
          }
        }
      } else {
        // CREATE
        savedSeller = await sellerAPI.create(sellerData);
        toast.success("Seller created successfully");
      }

      // Map the saved entity into UI shape
      const updated = mapApiSellerToUI(savedSeller);

      // ✅ IMPORTANT: Refresh the sellers list by re-fetching
      await refreshSellersList();

      // Close modal
      setShowSellerForm(false);
      setEditingSeller(null);

    } catch (error) {
      console.error("❌ Error saving seller:", error);
      toast.error("Failed to save seller. Please try again.");
    }
  };

  // ✅ नया function add करें sellers list refresh करने के लिए
  const refreshSellersList = async () => {
    try {
      setLoading(true);
      const apiSellers = await sellerAPI.getAll();

      const normalized = Array.isArray(apiSellers)
        ? apiSellers.map(mapApiSellerToUI)
        : [];
      setSellers(normalized);

    } catch (err) {
      console.error("Error refreshing sellers:", err);
      toast.error("Failed to refresh sellers list");
    } finally {
      setLoading(false);
    }
  };

  const handleSellerSelection = (sellerId: number) => {
    setSelectedSellers((prev) =>
      prev.includes(sellerId)
        ? prev.filter((id) => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSellers.length === paginatedSellers.length) {
      setSelectedSellers([]);
    } else {
      setSelectedSellers(paginatedSellers.map((s) => s.id));
    }
  };

  const handleNextSeller = () => {
    if (currentSellerIndex < filteredSellers.length - 1) {
      const nextIndex = currentSellerIndex + 1;
      setCurrentSellerIndex(nextIndex);
      setCurrentSellerView(filteredSellers[nextIndex]);
    }
  };

  const handlePreviousSeller = () => {
    if (currentSellerIndex > 0) {
      const prevIndex = currentSellerIndex - 1;
      setCurrentSellerIndex(prevIndex);
      setCurrentSellerView(filteredSellers[prevIndex]);
    }
  };

  const getStatusBadge = (isActive: boolean | number) => {
    const active = typeof isActive === "number" ? isActive === 1 : isActive;
    const config = active
      ? { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active", icon: "🟢" }
      : { bg: "bg-gray-100", text: "text-gray-600", label: "Inactive", icon: "⚫" };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    // Find stage label from master data
    const stageMaster = stageOptions.find(s => s.value === stage);
    const stageLabel = stageMaster?.label || stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const stageConfig: any = {
      initial_contact: { bg: "bg-blue-100", text: "text-blue-700", icon: "📞" },
      property_collection: { bg: "bg-purple-100", text: "text-purple-700", icon: "🏠" },
      mandate_discussion: { bg: "bg-orange-100", text: "text-orange-700", icon: "💬" },
      mandate_signed: { bg: "bg-green-100", text: "text-green-700", icon: "✅" },
      selling_process: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "🔄" },
      deal_negotiation: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "🤝" },
      deal_closure: { bg: "bg-pink-100", text: "text-pink-700", icon: "📋" },
      completed: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "🎉" },
    };
    const key = stage || "initial_contact";
    const config = stageConfig[key] || { bg: "bg-gray-100", text: "text-gray-700" };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon ? `${config.icon} ` : ""}{stageLabel}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    // Find priority label from master data
    const priorityMaster = priorityOptions.find(p => p.value === priority);
    const priorityLabel = priorityMaster?.label || priority.charAt(0).toUpperCase() + priority.slice(1);

    const p = (priority || "").toLowerCase();
    const priorityConfig: any = {
      high: { bg: "bg-red-100", text: "text-red-700", icon: "🔥" },
      medium: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "⚡" },
      low: { bg: "bg-green-100", text: "text-green-700", icon: "🌱" },
    };
    const config = priorityConfig[p] || { bg: "bg-gray-100", text: "text-gray-700" };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon ? `${config.icon} ` : ""}{priorityLabel}
      </span>
    );
  };

  const getLeadScore = (score: number) => {
    const n = Number(score) || 0;
    const color = n >= 80 ? "text-green-600" : n >= 60 ? "text-yellow-600" : "text-red-600";
    const bgColor = n >= 80 ? "bg-green-100" : n >= 60 ? "bg-yellow-100" : "bg-red-100";
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full ${bgColor} ${color}`}>
        <Star size={12} className="mr-1" />
        <span className="text-xs font-bold">{n}</span>
      </div>
    );
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      ignoreDate: false,
      source: "all",
      stage: "all",
      priority: "all",
      leadType: "all",
      assigned: "all",
      status: "all",
    });
  };

  // ✅ FIXED: Calculate column span based on permissions
  const getColSpan = () => {
    let colSpan = 7; // Base columns without actions and checkbox

    // Checkbox column - show if user has any bulk operation permission
    if (canUpdate || canDelete || canAssign || canBulkDelete) {
      colSpan += 1;
    }

    // ✅ FIXED: Actions column - show if user has read permission
    if (shouldShowActionsColumn) {
      colSpan += 1;
    }

    return colSpan;
  };

  if (currentSellerView) {
    return (
      <SellerViewPage
        seller={currentSellerView}
        onBack={handleBackToList}
        onEdit={handleEditSeller}
        onAccount={handleSellerAccount}
        onNext={handleNextSeller}
        onPrevious={handlePreviousSeller}
        currentIndex={currentSellerIndex}
        totalSellers={filteredSellers.length}
        onUpdateSeller={(updatedSeller: UISeller) => {
          setSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
          setCurrentSellerView(updatedSeller);
        }}
      />
    );
  }

  if (currentSellerAccount) {
    return (
      <SellerAccountPage
        seller={currentSellerAccount}
        onBack={handleBackToList}
        onUpdateSeller={(updatedSeller: UISeller) => {
          setSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
          setCurrentSellerAccount(updatedSeller);
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Seller & Lead Management</h1>
              <p className="text-sm text-gray-600">Complete seller lifecycle from lead to deal closure</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* ✅ Import Button - Conditional */}
            {canImport && (
              <button
                onClick={() => setShowImportLeads(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
              >
                <Upload size={14} />
                <span>Import</span>
              </button>
            )}

            {/* ✅ Add Seller Button - Conditional */}
            {canCreate && (
              <button
                onClick={handleAddSeller}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm"
              >
                <Plus size={14} />
                <span>Add Seller</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${activeTab === tab.id
                  ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200`
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? `bg-${tab.color}-200` : "bg-gray-200"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search sellers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            {/* ✅ Export Button - Conditional */}
            {canExport && (
              <button
                onClick={handleExportAllFiltered}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs font-medium text-gray-500">Quick:</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, stage: "all", priority: "all" }))}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === "all" && filters.priority === "all"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            All
          </button>

          {availableStages.filter((s) => s !== "all").slice(0, 4).map((stage) => (
            <button
              key={stage}
              onClick={() => setFilters((prev) => ({ ...prev, stage }))}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === stage
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {stageOptions.find(s => s.value === stage)?.label || stage.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}

          {availablePriorities.filter((p) => p !== "all").map((priority) => (
            <button
              key={priority}
              onClick={() => setFilters((prev) => ({ ...prev, priority }))}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.priority === priority
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {priorityOptions.find(p => p.value === priority)?.label || priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>

        {/* ✅ Enhanced Bulk Actions - Conditional */}
        {selectedSellers.length > 0 && (canUpdate || canAssign || canBulkDelete || canExport) && (
          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5">
              <span className="text-xs font-semibold text-blue-700">
                {selectedSellers.length} selected
              </span>

              <span className="mx-1 h-4 w-px bg-blue-200" />

              {/* ✅ Bulk Assign Executive - Conditional */}
              {canAssign && (
                <select
                  onChange={(e) => {
                    const execId = Number(e.target.value);
                    if (!Number.isNaN(execId)) handleBulkAssign(execId);
                    e.target.value = "";
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                  disabled={execsLoading}
                >
                  <option value="">Assign Executive</option>
                  <option value={0}>— Unassigned —</option>
                  {executives
                    .filter(exec => exec.id !== 0) // Remove unassigned from main list
                    .map(exec => (
                      <option key={exec.id} value={exec.id}>
                        {exec.name} {exec.id === user?.id ? '(You)' : ''}
                      </option>
                    ))
                  }
                </select>
              )}

              {/* ✅ Bulk Stage Update - Conditional */}
              {canUpdate && (
                <select
                  onChange={(e) => {
                    const stage = e.target.value;
                    if (stage) handleBulkStageUpdate(stage);
                    e.target.value = "";
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="">Update Stage</option>
                  {availableStages.filter(s => s !== 'all').map(stage => (
                    <option key={stage} value={stage}>
                      {stageOptions.find(s => s.value === stage)?.label || stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              )}

              {/* ✅ Bulk Priority Update - Conditional */}
              {canUpdate && (
                <select
                  onChange={(e) => {
                    const priority = e.target.value;
                    if (priority) handleBulkPriorityUpdate(priority);
                    e.target.value = "";
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="">Update Priority</option>
                  {availablePriorities.filter(p => p !== 'all').map(priority => (
                    <option key={priority} value={priority}>
                      {priorityOptions.find(p => p.value === priority)?.label || priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              {/* ✅ Bulk Status Update - Conditional */}
              {canUpdate && (
                <select
                  onChange={(e) => {
                    const status = e.target.value;
                    if (status) handleBulkStatusUpdate(status);
                    e.target.value = "";
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="">Update Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}

              {/* ✅ Bulk Export - Conditional */}
              {canExport && (
                <button
                  onClick={handleBulkExport}
                  className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs text-white hover:bg-emerald-700"
                >
                  Export
                </button>
              )}

              {/* ✅ Bulk Delete - Conditional */}
              {canBulkDelete && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="rounded-md bg-red-600 px-2.5 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {bulkDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}

              <div className="flex-1" />
              <button
                onClick={clearSelection}
                className="rounded-full p-1 text-blue-700 hover:bg-blue-100"
                title="Clear selection"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <SellerSidebarFilter
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          sources={sources}
          stages={availableStages}
          priorities={availablePriorities}
          assignedUsers={assignedUsers}
          statuses={statuses}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {/* ✅ Selection Checkbox - Conditional */}
                {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                  <th className="px-3 py-2 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedSellers.length === paginatedSellers.length && paginatedSellers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact & Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business Info</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress & Activity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>

                {/* ✅ FIXED: Actions column - show if user has read permission */}
                {shouldShowActionsColumn && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {hasAnyActionPermission ? 'Actions' : 'View'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <TableLoader colSpan={getColSpan()} message="Loading sellers..." size="lg" />
              ) : errMsg ? (
                <tr>
                  <td colSpan={getColSpan()} className="px-3 py-8 text-center text-sm text-red-600">
                    {errMsg}
                  </td>
                </tr>
              ) : paginatedSellers.length > 0 ? (
                paginatedSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    {/* ✅ Selection Checkbox - Conditional */}
                    {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedSellers.includes(seller.id)}
                          onChange={() => handleSellerSelection(seller.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {/* Seller Details */}
                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {seller.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {seller.salutation} {seller.name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {seller.id}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            {getStatusBadge(seller.isActive)}
                            {getLeadScore(seller.leadScore)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact & Location */}
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs">
                          <Phone size={12} className="text-gray-400" />
                          <span>{seller.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <Mail size={12} className="text-gray-400" />
                          <span className="truncate max-w-[120px]">{seller.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="truncate max-w-[120px]">{seller.location}</span>
                        </div>
                      </div>
                    </td>

                    {/* Business Info */}
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div>{getStageBadge(seller.stage)}</div>
                        <div>{getPriorityBadge(seller.priority)}</div>
                        <div className="text-xs text-gray-600">
                          Source: <span className="font-medium">{seller.source}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Created: <span className="font-medium">{toDate(seller.created_at)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned To */}
                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                          {seller.assigned_to_name?.charAt(0) || "U"}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{seller.assigned_to_name || "Unassigned"}</div>
                          {seller.assigned_to_email && (
                            <div className="text-xs text-gray-500 truncate max-w-[120px]">{seller.assigned_to_email}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Progress & Activity */}
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span>Stage Progress</span>
                            <span>{seller.stageProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${seller.stageProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Visits: <span className="font-medium">{seller.visits}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Last Activity: <span className="font-medium">{toDate(seller.lastActivity)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Performance */}
                    <td className="px-3 py-3">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Deal Value:</span>
                          <span className="font-medium">₹{seller.dealValue?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Response Rate:</span>
                          <span className="font-medium">{seller.responseRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Properties:</span>
                          <span className="font-medium">{seller.properties?.length || 0}</span>
                        </div>
                        {seller.expectedClose && (
                          <div className="flex justify-between">
                            <span>Expected Close:</span>
                            <span className="font-medium text-orange-600">{toDate(seller.expectedClose)}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ✅ FIXED: Actions Column - Always show if user can read */}
                    {shouldShowActionsColumn && (
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-1">
                          {/* ✅ View Button - Always visible if can read */}
                          <button
                            onClick={() => handleViewSeller(seller)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* ✅ Seller Account Button - ALWAYS VISIBLE */}
                          <button
                            onClick={() => handleSellerAccount(seller.id)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Seller Account"
                          >
                            <UserCheck size={14} />
                          </button>

                          {/* ✅ Edit Button - Conditional */}
                          {canUpdate && (
                            <button
                              onClick={() => handleEditSeller(seller)}
                              className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                          )}

                          {/* ✅ More Actions Dropdown - ALWAYS VISIBLE */}
                          <div className="relative group">
                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                              <MoreHorizontal size={14} />
                            </button>
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="p-1">
                                {/* ✅ Contact Options - ALWAYS VISIBLE */}
                                  <>
                                    <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                                      <PhoneCall size={12} />
                                      <span>Call</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                                      <MessageCircle size={12} />
                                      <span>WhatsApp</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                                      <Send size={12} />
                                      <span>Email</span>
                                    </button>
                                  </>
                                {/* ✅ Delete Button - Conditional */}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteSeller(seller.id)}
                                    className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full text-left"
                                  >
                                    <Trash2 size={12} />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={getColSpan()} className="px-3 py-8 text-center text-sm text-gray-500">
                    No sellers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && !errMsg && (
        <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              Showing {filteredSellers.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredSellers.length)} of {filteredSellers.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 rounded text-xs ${currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-xs">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-2 py-1 rounded text-xs ${currentPage === totalPages ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showSellerForm && (
        <SellerFormModal
          key={editingSeller ? `edit-${editingSeller.id}` : 'create'}
          isOpen={showSellerForm}
          seller={editingSeller || undefined}
          onClose={() => {
            setShowSellerForm(false);
            setEditingSeller(null);
          }}
          onSave={handleSaveSeller}
        />
      )}

      {showImportLeads && (
        <ImportSellersLeadsModal isOpen={showImportLeads} onClose={() => setShowImportLeads(false)} />
      )}
    </div>
  );
};

export default SellersPage;