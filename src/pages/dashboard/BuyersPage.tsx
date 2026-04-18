// // src/pages/BuyersPage.tsx
// import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
// import {
//   Users, Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, MapPin,
//   Building, Activity, MoreHorizontal, User, Star, FileText, MessageCircle,
//   Bell, Upload, Download, ChevronLeft, ChevronRight, X, Target, Home,
//   UserCheck, PhoneCall, Send,
//   Briefcase, UserX,
//   TrendingUp,
// } from 'lucide-react';
// import BuyerFormModal from '../../components/buyers/BuyerFormModal';
// import BuyerViewPage from '../../components/buyers/BuyerViewPage';
// import BuyerAccountPage from '../../components/buyers/BuyerAccountPage';
// import ImportBuyersLeadsModal from '../../components/buyers/ImportBuyersLeadsModal';
// import { buyerAPI } from '@/lib/buyerAPI';
// import BuyerSidebarFilter from './components/BuyerSidebarFilter';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';
// import TableLoader from '@/components/ui/TableLoader';
// import { usersAPI } from '@/lib/api';
// import { useAuth } from '@/contexts/AuthContext';
// import { getAssignableExecutives } from '@/utils/roleBasedOptions';
// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// import { can } from '@/utils/permission';
// import { filterBuyersByRole } from '@/utils/roleBasedBuyerFilter';

// type Executive = {
//   id: string | number;
//   name: string;
//   email?: string;
//   phone?: string;
//   username?: string;
//   department?: string;
//   role?: string;
// };

// type UIBuyer = {
//   id: number | string;
//   salutation: string | null;
//   name: string | null;
//   phone: string | null;
//   dob: string | null;
//   whatsapp: string | null;
//   email: string | null;
//   state: string | null;
//   city: string | null;
//   location: string | null;
//   source: string | null;
//   priority: 'high' | 'medium' | 'low' | string | null;
//   stage: string | null;
//   status: string | null;
//   assigned: string | null;
//   assigned_executive?: string | number | null;
//   assigned_executive_name?: string | null;
//   assigned_executive_email?: string | null;
//   assigned_executive_phone?: string | null;
//   leadScore: number;
//   is_active: boolean | null;
//   budget: { min: number | null; max: number | null };
//   expectedClose: string | null;
//   requirements: {
//     propertyType?: string | null;
//     unitType?: string | null;
//     unitTypes?: string[] | null;
//     preferredLocations?: string[] | null;
//     amenities?: string[] | null;
//     furnishing?: string | null;
//     possession?: string | null;
//     facing?: string | null;
//     floor?: string | null;
//     specialRequirements?: string | null;
//   };
//   financials: {
//     loanRequired?: boolean | null;
//     loanAmount?: number | null;
//     downPayment?: number | null;
//     monthlyIncome?: number | null;
//     bankPreference?: string | null;
//     loanStatus?: string | null;
//     creditScore?: number | null;
//   };
//   matchedProperties: any[];
//   matchedPropertiesCount?: number;
//   activities: any[];
//   followups: any[];
//   documents: any[];
//   visits: number;
//   totalVisits: number;
//   lastActivity: string | null;
//   created_at: string | null;
//   notifications: number;
//   currentStage: string | null;
//   stageProgress: number;
//   dealPotential: string | null;
//   responseRate: number;
//   avgResponseTime: string | null;
// };

// const BuyersPage = () => {
//   const navigate = useNavigate();
//   const { user } = useAuth() as any;

//   // Permission checks
//   const canRead = can(user, 'buyer.read');
//   const canCreate = can(user, 'buyer.create');
//   const canUpdate = can(user, 'buyer.update');
//   const canDelete = can(user, 'buyer.delete');
//   const canImport = can(user, 'data.import');
//   const canExport = can(user, 'data.export');
//   const canAssign = can(user, 'buyer.assign');
//   const canBulkDelete = can(user, 'buyer.bulk_delete');

//   // Check if user has any action permissions
//   const hasAnyActionPermission = canUpdate || canDelete || canAssign;
//   const shouldShowActionsColumn = canRead && (hasAnyActionPermission || true);

//   // Role-based visibility check
//   const isAdmin = useMemo(() => {
//     const role = (user?.role || '').toLowerCase();
//     return role.includes('admin') || role.includes('manager') || role.includes('superadmin');
//   }, [user]);

//   const isExecutive = useMemo(() => {
//     const role = (user?.role || '').toLowerCase();
//     return role.includes('executive');
//   }, [user]);


//   const canViewBuyer = (_buyer: UIBuyer) => {
//     return canRead;
//   };


//   // Check if user can edit buyer (role-based)
//   const canEditBuyer = (buyer: UIBuyer) => {
//     if (!canUpdate) return false;
//     if (isAdmin) return true;
//     if (isExecutive) {
//       return String(buyer.assigned_executive) === String(user?.id);
//     }
//     return false;
//   };

//   // Check if user can delete buyer (role-based)
//   const canDeleteBuyer = (buyer: UIBuyer) => {
//     if (!canDelete) return false;
//     if (isAdmin) return true;
//     if (isExecutive) {
//       return String(buyer.assigned_executive) === String(user?.id);
//     }
//     return false;
//   };

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
//               You do not have permission to view buyers.
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- UI state ---------------- */
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedBuyers, setSelectedBuyers] = useState<Array<number | string>>([]);
//   const [showBuyerForm, setShowBuyerForm] = useState(false);
//   const [currentBuyerView, setCurrentBuyerView] = useState<UIBuyer | null>(null);
//   const [currentBuyerAccount, setCurrentBuyerAccount] = useState<UIBuyer | null>(null);
//   const [showImportBuyers, setShowImportBuyers] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [editingBuyer, setEditingBuyer] = useState<UIBuyer | null>(null);
//   const [currentBuyerIndex, setCurrentBuyerIndex] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(25);
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
//   const [bulkDeleting, setBulkDeleting] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [properties, setProperties] = useState<any[]>([]);
//   const [loadingProperties, setLoadingProperties] = useState(false);

//   // Executive state
//   const [executives, setExecutives] = useState<Executive[]>([{ id: 0, name: "Not assigned", email: "", phone: "" }]);
//   const [execsLoading, setExecsLoading] = useState<boolean>(true);
//   const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
//   const [execSearch, setExecSearch] = useState<string>('');
//   const [selectedExecId, setSelectedExecId] = useState<string | number | null>(null);

//   // FIX: Executive को unassigned buyers दिखाने का option
//   const [showUnassignedToExecutives, setShowUnassignedToExecutives] = useState(false);

//   const tableScrollRef = useRef<HTMLDivElement | null>(null);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   /* ---------------- Filters ---------------- */
//   const [filters, setFilters] = useState({
//     dateFrom: '',
//     dateTo: '',
//     ignoreDate: false,
//     source: 'all',
//     stage: 'all',
//     priority: 'all',
//     assigned: 'all',
//     assigned_executive: 'all',
//     status: 'all',
//     budgetRange: 'all',
//     propertyType: 'all',
//   });

//   /* ---------------- Data ---------------- */
//   const [allBuyers, setAllBuyers] = useState<UIBuyer[]>([]);
//   const [roleFilteredBuyers, setRoleFilteredBuyers] = useState<UIBuyer[]>([]);

//   /* ===================== Property Matching Logic ===================== */
//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         setLoadingProperties(true);
//         const res = await propertiesAPI.getProperties();
//         const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

//         const publicProperties = list.filter((property: any) =>
//           property.is_public === true ||
//           property.is_public === 1 ||
//           property.isPublic === true ||
//           property.public === true
//         );

//         setProperties(publicProperties ?? []);
//       } catch (err) {
//         setProperties([]);
//       } finally {
//         setLoadingProperties(false);
//       }
//     };

//     fetchProperties();
//   }, []);

//   const toArr = (v: any) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
//   const norm = (s: any) => String(s || "").toLowerCase().trim();
//   const hasAny = (haystack: string[], needles: string[]) =>
//     needles.some((n) => haystack.some((h) => h.includes(n)));

//   const getBuyerBudget = (buyer: UIBuyer) => {
//     const rawMin = Number(buyer?.budget?.min ?? 0);
//     const rawMax = Number(buyer?.budget?.max ?? 0);
//     const min = Number.isFinite(rawMin) && rawMin > 0 ? rawMin : null;
//     const max = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : null;
//     return { min, max };
//   };

//   const priceFrom = (p: any) =>
//     Number(p?.budget ?? p?.price ?? p?.expected_price ?? 0);

//   const priceRangeFrom = (p: any) => {
//     const min = Number(p?.min_price ?? p?.budget_min ?? p?.minBudget ?? 0);
//     const max = Number(p?.max_price ?? p?.budget_max ?? p?.maxBudget ?? 0);
//     return { min, max };
//   };

//   const isWithinBuyerBudget = (p: any, buyer: UIBuyer) => {
//     const { min: bMin, max: bMax } = getBuyerBudget(buyer);
//     const hasMin = bMin != null;
//     const hasMax = bMax != null;

//     if (!hasMin && !hasMax) return false;

//     const { min: pMin, max: pMax } = priceRangeFrom(p);
//     const hasRange = !!pMin && !!pMax && pMax >= pMin;

//     if (hasRange) {
//       const left = hasMin ? (bMin as number) : Number.NEGATIVE_INFINITY;
//       const right = hasMax ? (bMax as number) : Number.POSITIVE_INFINITY;
//       return Math.max(pMin, left) <= Math.min(pMax, right);
//     }

//     const price = priceFrom(p);
//     if (!price) return false;
//     if (hasMin && price < (bMin as number)) return false;
//     if (hasMax && price > (bMax as number)) return false;
//     return true;
//   };

//   const countMatchingProperties = (buyer: UIBuyer) => {
//     if (!properties.length) return 0;
//     const matchingProperties = properties.filter((property) => {
//       return isWithinBuyerBudget(property, buyer);
//     });
//     return matchingProperties.length;
//   };

//   // FIXED VERSION - Remove allBuyers from dependencies
//   useEffect(() => {
//     if (!properties.length || !allBuyers.length) return;

//     setAllBuyers(prev => prev.map(b => ({
//       ...b,
//       matchedPropertiesCount: countMatchingProperties(b),
//     })));
//   }, [properties]); // ✅ Only depend on properties

//   /* ===================== Updated Load Executives Function ===================== */
//   useEffect(() => {
//     const loadExecutives = async () => {
//       try {
//         setExecsLoading(true);

//         // Helper to format name
//         const formatName = (u: any): string => {
//           const salutation = u?.salutation ? `${u.salutation} ` : '';
//           const firstName = u?.first_name || u?.firstName || '';
//           const lastName = u?.last_name || u?.lastName || '';
//           const fullName = `${salutation}${firstName} ${lastName}`.trim();

//           if (fullName) return fullName;
//           if (u?.name) return u.name;
//           if (u?.full_name) return u.full_name;
//           if (u?.username) return u.username;
//           if (u?.email) return u.email.split('@')[0];
//           return 'Sales Executive';
//         };

//         let executivesList: any[] = [];

//         // METHOD 1: Try getSalesExecutives if available
//         try {
//           if (usersAPI.getSalesExecutives) {
//             const res = await usersAPI.getSalesExecutives();
//             if (res && (Array.isArray(res) || res.items || res.data)) {
//               executivesList = Array.isArray(res) ? res : (res.items || res.data || []);
//             }
//           }
//         } catch (err) {
//         }

//         // METHOD 2: Try getByDeptRole
//         if (executivesList.length === 0 && usersAPI.getByDeptRole) {
//           const paramCombinations = [
//             { department: "Sales", role: "Sales Executive" },
//             { department: "sales", role: "sales executive" },
//             { department: "Sales", role: "Executive" },
//             { department: "sales", role: "executive" }
//           ];

//           for (const params of paramCombinations) {
//             try {
//               const res = await usersAPI.getByDeptRole({
//                 ...params,
//                 is_active: 1,
//                 limit: 100
//               });

//               if (res && (Array.isArray(res) || res.items || res.data)) {
//                 const data = Array.isArray(res) ? res : (res.items || res.data || []);
//                 if (data.length > 0) {
//                   executivesList = data;
//                   break;
//                 }
//               }
//             } catch (err) {
//               continue;
//             }
//           }
//         }

//         // METHOD 3: Try getAll users and filter for Sales Executives
//         if (executivesList.length === 0 && (usersAPI as any).getAll) {
//           try {
//             const allUsers = await (usersAPI as any).getAll({ is_active: true });
//             const usersArray = Array.isArray(allUsers) ? allUsers :
//               (allUsers?.items || allUsers?.data || []);

//             if (usersArray.length > 0) {
//               // Filter for sales executives only
//               executivesList = usersArray.filter((u: any) => {
//                 const dept = String(u.department || '').toLowerCase();
//                 const role = String(u.role || '').toLowerCase();
//                 return (dept.includes('sales') || role.includes('sales')) &&
//                   (role.includes('executive') || role.includes('sales'));
//               });
//             }
//           } catch (err) {
//           }
//         }

//         // METHOD 4: Try getUsers
//         if (executivesList.length === 0 && (usersAPI as any).getUsers) {
//           try {
//             const allUsers = await (usersAPI as any).getUsers();
//             const usersArray = Array.isArray(allUsers) ? allUsers :
//               (allUsers?.items || allUsers?.data || []);

//             if (usersArray.length > 0) {
//               executivesList = usersArray.filter((u: any) => {
//                 const dept = String(u.department || '').toLowerCase();
//                 const role = String(u.role || '').toLowerCase();
//                 return (dept.includes('sales') || role.includes('sales')) &&
//                   (role.includes('executive') || role.includes('sales'));
//               });
//             }
//           } catch (err) {
//           }
//         }

//         // Process executives data
//         const processedExecutives: Executive[] = executivesList.map((user: any) => {
//           const id = user.id || user.userId || user._id ||
//             user.uuid || `exec-${Date.now()}-${Math.random()}`;

//           return {
//             id: Number(id) || 0,
//             name: formatName(user),
//             email: user.email || null,
//             phone: user.phone || user.mobile || user.contact_number || null,
//             username: user.username || null,
//             department: user.department || 'Sales',
//             role: user.role || 'Sales Executive',
//           };
//         });

//         // Remove duplicates by ID
//         const uniqueExecutives = processedExecutives.filter((exec, index, self) =>
//           index === self.findIndex(e => String(e.id) === String(exec.id) && e.id !== 0)
//         );
//         // Apply permission filtering
//         const allowedExecutives = getAssignableExecutives(user, uniqueExecutives);
//         setExecutives(allowedExecutives);
//         // Show warning if no executives found
//         if (allowedExecutives.length <= 1) { // Only unassigned
//         }
//       } catch (error) {
//         // Fallback to just unassigned
//         setExecutives([{ id: 0, name: "Not assigned", email: "", phone: "" }]);

//         if (!['executive', 'sales'].includes(user?.role)) {
//           toast.error('Failed to load sales executives');
//         }
//       } finally {
//         setExecsLoading(false);
//       }
//     };

//     loadExecutives();
//   }, [user]);

//   // Close dropdown on outside click
//   useEffect(() => {
//     function onDocClick(e: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
//         setExecDropdownOpen(false);
//       }
//     }
//     if (execDropdownOpen) document.addEventListener('mousedown', onDocClick);
//     return () => document.removeEventListener('mousedown', onDocClick);
//   }, [execDropdownOpen]);

//   // Filter executives based on search
//   const filteredExecutives = executives.filter(exec =>
//     execSearch.trim() === '' ? true :
//       exec.name.toLowerCase().includes(execSearch.toLowerCase()) ||
//       (exec.email && exec.email.toLowerCase().includes(execSearch.toLowerCase())) ||
//       (exec.phone && exec.phone.includes(execSearch)) ||
//       (exec.department && exec.department.toLowerCase().includes(execSearch.toLowerCase())) ||
//       (exec.role && exec.role.toLowerCase().includes(execSearch.toLowerCase()))
//   );

//   /* ---------------- Masters Loading ---------------- */
//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<Record<string, any>>({});

//   const normKey = (s: any) =>
//     String(s ?? '')
//       .trim()
//       .toLowerCase()
//       .replace(/[^\w]+/g, '_');

//   const normalizeMasterKeys = (obj: any) => {
//     const out: Record<string, any> = {};
//     Object.entries(obj || {}).forEach(([k, v]) => {
//       out[normKey(k)] = v;
//     });
//     return out;
//   };

//   const getMasterArray = (mastersObj: Record<string, any>, possibleKeys: string[]): any[] => {
//     for (const key of possibleKeys) {
//       const k = normKey(key);
//       if (Array.isArray(mastersObj?.[k]) && mastersObj[k].length) {
//         return mastersObj[k];
//       }
//     }
//     return [];
//   };

//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['lead', 'buyer']);
//         const normalized = normalizeMasterKeys(data);
//         setMasters(normalized);
//       } catch (err) {
//         toast.error('Failed to load dropdown options');
//       } finally {
//         setMasterLoading(false);
//       }
//     };

//     fetchMasters();
//   }, []);

//   /* ================= Derived Options from Masters ================= */
//   const toOptionLabel = (o: any) =>
//     (o?.label ?? o?.name ?? o?.title ?? o?.value ?? o?.key ?? '').toString();

//   const toOptionValue = (o: any) =>
//     (o?.value ?? o?.key ?? o?.code ?? o?.name ?? '').toString();

//   const stageRaw = getMasterArray(masters, [
//     'buyer_lead_stage',
//     'buyer stage',
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

//   const stageOptionsFallback = [
//     { value: 'initial_contact', label: 'Initial Contact' },
//     { value: 'requirement_gathering', label: 'Requirement Gathering' },
//     { value: 'property_hunting', label: 'Property Hunting' },
//     { value: 'loan_processing', label: 'Loan Processing' },
//     { value: 'property_finalization', label: 'Property Finalization' },
//     { value: 'deal_closure', label: 'Deal Closure' },
//     { value: 'completed', label: 'Completed' },
//   ];

//   const priorityOptionsFallback = [
//     { value: 'high', label: 'High' },
//     { value: 'medium', label: 'Medium' },
//     { value: 'low', label: 'Low' },
//   ];

//   const effectiveStageOptions = (stageOptions?.length ? stageOptions : stageOptionsFallback);
//   const effectivePriorityOptions = (priorityOptions?.length ? priorityOptions : priorityOptionsFallback);

//   const stagesFromMasters: string[] = ['all', ...effectiveStageOptions.map(o => o.value)];
//   const prioritiesFromMasters: string[] = ['all', ...effectivePriorityOptions.map(o => o.value)];

//   /* ---------------- Helpers ---------------- */
//   const formatDate = (val: string | null) => {
//     if (!val) return ' - ';
//     const d = new Date(val);
//     if (isNaN(d.getTime())) return ' - ';
//     return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
//   };

//   const toMySQLDate = (val: any) => {
//     if (!val) return null;
//     const d = new Date(val);
//     if (isNaN(d.getTime())) return null;
//     const yyyy = d.getFullYear();
//     const mm = String(d.getMonth() + 1).padStart(2, '0');
//     const dd = String(d.getDate()).padStart(2, '0');
//     return `${yyyy}-${mm}-${dd}`;
//   };

//   const formatDOB = (val: string | null) => {
//     if (!val) return ' - ';
//     const d = new Date(val);
//     if (isNaN(d.getTime())) return ' - ';
//     const dd = String(d.getDate()).padStart(2, '0');
//     const mm = String(d.getMonth() + 1).padStart(2, '0');
//     const yyyy = d.getFullYear();
//     return `${dd}/${mm}/${yyyy}`;
//   };

//   const parseJSON = (val: any) => {
//     if (!val) return null;
//     if (typeof val === 'string') {
//       try {
//         return JSON.parse(val);
//       } catch {
//         return null;
//       }
//     }
//     if (typeof val === 'object') return val;
//     return null;
//   };

//   const toNumOrNull = (v: any): number | null => {
//     if (v === null || v === undefined || v === '') return null;
//     const n = Number(v);
//     return Number.isFinite(n) ? n : null;
//   };

//   const key = (v: any) => String(v ?? '').trim().toLowerCase();
//   const stageKey = (v: any) => key(v).replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
//   const priorityKey = (v: any) => key(v);

//   // Normalize buyer object for API
//   const normalizeBuyerForAPI = (b: any) => {
//     const rawReq = parseJSON(b.requirements) || b.requirements || {};
//     const fin = parseJSON(b.financials) || b.financials || {};

//     return {
//       salutation: b.salutation ?? null,
//       name: b.name ?? null,
//       phone: b.phone ?? b.mobile ?? null,
//       whatsapp_number: b.whatsapp ?? b.whatsapp_number ?? null,
//       email: b.email ?? null,
//       dob: toMySQLDate(b.dob ?? null),
//       state: b.state ?? null,
//       city: b.city ?? null,
//       location: b.location ?? null,
//       buyer_lead_source: b.source ?? b.buyer_lead_source ?? null,
//       buyer_lead_priority: b.priority ?? b.buyer_lead_priority ?? null,
//       is_active: b.is_active !== undefined ? Boolean(b.is_active) : true,
//       buyer_lead_stage: b.stage ?? b.buyer_lead_stage ?? null,
//       buyer_lead_status: b.status ?? b.buyer_lead_status ?? null,
//       assigned_to: b.assigned ?? b.assigned_to ?? null,
//       assigned_executive: b.assigned_executive ?? null,
//       lead_score: toNumOrNull(b.leadScore) ?? toNumOrNull(b.lead_score) ?? 0,
//       budget_min: b.budget?.min ?? b.budget_min ?? null,
//       budget_max: b.budget?.max ?? b.budget_max ?? null,
//       expected_close: toMySQLDate(b.expectedClose ?? b.expected_close ?? null),
//       requirements: {
//         propertyType: rawReq.propertyType ?? rawReq.property_type ?? null,
//         unitTypes: Array.isArray(rawReq.unitTypes ?? rawReq.unit_types)
//           ? (rawReq.unitTypes ?? rawReq.unit_types)
//           : null,
//         preferredLocations: Array.isArray(rawReq.preferredLocations ?? rawReq.preferred_locations)
//           ? (rawReq.preferredLocations ?? rawReq.preferred_locations)
//           : null,
//         amenities: Array.isArray(rawReq.amenities) ? rawReq.amenities : null,
//         furnishing: rawReq.furnishing ?? null,
//         possession: rawReq.possession ?? null,
//         facing: rawReq.facing ?? null,
//         floor: rawReq.floor ?? null,
//         specialRequirements: rawReq.specialRequirements ?? rawReq.special_requirements ?? null,
//       },
//       financials: {
//         loanRequired: fin.loanRequired ?? fin.loan_required ?? null,
//         loanAmount: toNumOrNull(fin.loanAmount ?? fin.loan_amount),
//         downPayment: toNumOrNull(fin.downPayment ?? fin.down_payment),
//         monthlyIncome: toNumOrNull(fin.monthlyIncome ?? fin.monthly_income),
//         bankPreference: fin.bankPreference ?? fin.bank_preference ?? null,
//         loanStatus: fin.loanStatus ?? fin.loan_status ?? null,
//         creditScore: toNumOrNull(fin.creditScore ?? fin.credit_score),
//       }
//     };
//   };

//   // ✅ FIXED: Executive name resolution function
//   const resolveExecutiveName = useCallback((executiveId: string | number | null): { name: string; isCurrentUser: boolean } => {
//     if (!executiveId || executiveId === 0) return { name: 'Not assigned', isCurrentUser: false };

//     // Check if it's the current user
//     const isCurrentUser = String(executiveId) === String(user?.id);

//     if (isCurrentUser) {
//       return { name: user?.name || 'You', isCurrentUser: true };
//     }

//     // Look in executives list
//     const exec = executives.find(e => String(e.id) === String(executiveId));
//     if (exec) {
//       return { name: exec.name, isCurrentUser: false };
//     }

//     // If not found, return ID
//     return { name: `Executive (ID: ${executiveId})`, isCurrentUser: false };
//   }, [user, executives]);

//   // ✅ FIXED: Normalize buyer object for UI
//   const normalizeBuyerForUI = useCallback((b: any): UIBuyer => {
//     const rawReq = parseJSON(b.requirements) || b.requirements || {};
//     const fin = parseJSON(b.financials) || b.financials || {};
//     const toStr = (v: any) => (v === null || v === undefined ? null : String(v));

//     const budgetMin = toNumOrNull(b.budget_min ?? b.budgetMin);
//     const budgetMax = toNumOrNull(b.budget_max ?? b.budgetMax);

//     const dob = toMySQLDate(b.dob ?? null);
//     const expectedClose = toMySQLDate(b.expected_close ?? b.expectedClose ?? null);
//     const createdAt = toMySQLDate(b.created_at ?? null);

//     // Get executive details
//     const assignedExecutiveId = b.assigned_executive ?? b.assigned_to ?? null;
//     const { name: execName, isCurrentUser: isCurrentExec } = resolveExecutiveName(assignedExecutiveId);

//     // Count matching properties
//     const matchingPropertiesCount = b.matchedPropertiesCount ||
//       (() => {
//         if (properties.length > 0) {
//           const tempBuyer = {
//             id: b.id,
//             budget: { min: budgetMin, max: budgetMax }
//           } as UIBuyer;
//           return countMatchingProperties(tempBuyer);
//         }
//         return 0;
//       })();

//     return {
//       id: b.id ?? `${b.name ?? 'buyer'}-${Math.random().toString(36).slice(2)}`,
//       salutation: b.salutation ?? null,
//       name: b.name ?? null,
//       phone: b.phone ?? b.mobile ?? null,
//       whatsapp: b.whatsapp_number ?? b.whatsapp ?? null,
//       email: b.email ?? null,
//       dob,
//       state: b.state ?? null,
//       city: b.city ?? null,
//       location: b.location ?? null,
//       source: b.buyer_lead_source ?? b.source ?? null,
//       priority: (b.buyer_lead_priority ?? b.priority ?? null)?.toString().trim().toLowerCase() ?? null,
//       is_active: b.is_active !== undefined ? Boolean(b.is_active) : true,
//       stage: b.buyer_lead_stage ?? b.stage ?? null,
//       status: b.buyer_lead_status ?? b.status ?? null,
//       assigned: b.assigned_to ?? b.assigned ?? null,
//       assigned_executive: assignedExecutiveId,
//       assigned_executive_name: execName !== 'Not assigned' ? execName : null,
//       assigned_executive_email: null,
//       assigned_executive_phone: null,
//       leadScore: toNumOrNull(b.lead_score) ?? toNumOrNull(b.leadScore) ?? 0,
//       budget: { min: budgetMin, max: budgetMax },
//       expectedClose,
//       requirements: {
//         propertyType: toStr(rawReq.propertyType ?? rawReq.property_type ?? b.propertyType ?? b.property_type ?? null),
//         unitTypes: Array.isArray(rawReq.unitTypes ?? rawReq.unit_types)
//           ? (rawReq.unitTypes ?? rawReq.unit_types).map(toStr)
//           : null,
//         preferredLocations: Array.isArray(rawReq.preferredLocations ?? rawReq.preferred_locations)
//           ? (rawReq.preferredLocations ?? rawReq.preferred_locations).map(toStr)
//           : null,
//         amenities: Array.isArray(rawReq.amenities) ? rawReq.amenities.map(toStr) : null,
//         furnishing: toStr(rawReq.furnishing),
//         possession: toStr(rawReq.possession),
//         facing: toStr(rawReq.facing),
//         floor: toStr(rawReq.floor),
//         specialRequirements: rawReq.specialRequirements ?? rawReq.special_requirements ?? null,
//       },
//       financials: {
//         loanRequired: fin.loanRequired ?? fin.loan_required ?? null,
//         loanAmount: toNumOrNull(fin.loanAmount ?? fin.loan_amount),
//         downPayment: toNumOrNull(fin.downPayment ?? fin.down_payment),
//         monthlyIncome: toNumOrNull(fin.monthlyIncome ?? fin.monthly_income),
//         bankPreference: fin.bankPreference ?? fin.bank_preference ?? null,
//         loanStatus: fin.loanStatus ?? fin.loan_status ?? null,
//         creditScore: toNumOrNull(fin.creditScore ?? fin.credit_score),
//       },
//       matchedProperties: Array.isArray(b.matchedProperties) ? b.matchedProperties : [],
//       matchedPropertiesCount: matchingPropertiesCount,
//       activities: Array.isArray(b.activities) ? b.activities : [],
//       followups: Array.isArray(b.followups) ? b.followups : [],
//       documents: Array.isArray(b.documents) ? b.documents : [],
//       visits: toNumOrNull(b.visits) ?? 0,
//       totalVisits: toNumOrNull(b.totalVisits) ?? 0,
//       lastActivity: b.lastActivity ?? b.updated_at ?? null,
//       created_at: createdAt || new Date().toISOString(),
//       notifications: toNumOrNull(b.notifications) ?? 0,
//       currentStage: b.currentStage ?? (b.buyer_lead_stage ?? b.stage ?? null),
//       stageProgress: toNumOrNull(b.stageProgress) ?? 0,
//       dealPotential: b.dealPotential ?? null,
//       responseRate: toNumOrNull(b.responseRate) ?? 0,
//       avgResponseTime: b.avgResponseTime ?? null,
//     };
//   }, [resolveExecutiveName, properties]);

//   /* ===================== ✅ OPTIMIZED: Fetch All Buyers Function ===================== */
//   const fetchBuyers = useCallback(async () => {
//     try {
//       setLoading(true);
//       const apiBuyers = await buyerAPI.getAll();

//       if (!Array.isArray(apiBuyers)) {
//         setAllBuyers([]);
//         return;
//       }

//       const normalized = apiBuyers.map(normalizeBuyerForUI);

//       // ✅ CRITICAL FIX: Remove duplicates from backend response
//       const uniqueBuyers = normalized.reduce((acc: UIBuyer[], current: UIBuyer) => {
//         // Check if this buyer already exists in accumulator
//         const exists = acc.some(buyer => {
//           // Check by ID first
//           if (buyer.id === current.id) return true;

//           // Check by phone (if both have phones)
//           if (buyer.phone && current.phone && buyer.phone === current.phone) return true;

//           // Check by email (if both have emails)
//           if (buyer.email && current.email &&
//             buyer.email.toLowerCase() === current.email.toLowerCase()) return true;

//           return false;
//         });

//         if (!exists) {
//           acc.push(current);
//         } else {
//           console.warn('Duplicate buyer filtered:', {
//             id: current.id,
//             name: current.name,
//             phone: current.phone
//           });
//         }

//         return acc;
//       }, []);

//       // Sort by creation date (newest first)
//       const sorted = [...uniqueBuyers].sort((a, b) => {
//         const aCreated = new Date(a.created_at || 0).getTime();
//         const bCreated = new Date(b.created_at || 0).getTime();
//         if (aCreated !== bCreated) {
//           return bCreated - aCreated;
//         }
//         return Number(b.id) - Number(a.id);
//       });

//       setAllBuyers(sorted);
//     } catch (err) {
//       toast.error('Failed to fetch buyers');
//       setAllBuyers([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [normalizeBuyerForUI]);

//   /* ===================== Fetch All Buyers Effect ===================== */
//   useEffect(() => {
//     fetchBuyers();
//   }, [fetchBuyers]);

//   /* ---------------- Apply Role-based Filtering ---------------- */
//   useEffect(() => {
//     if (allBuyers.length > 0 && user) {
//       const filtered = filterBuyersByRole(
//         user,
//         allBuyers,
//         executives,
//         showUnassignedToExecutives
//       );
//       setRoleFilteredBuyers(filtered);
//     } else {
//       setRoleFilteredBuyers([]);
//     }
//   }, [allBuyers, user, executives, showUnassignedToExecutives]);

//   /* ---------------- Update Executive Names ---------------- */
//   useEffect(() => {
//     const updateBuyersWithExecutiveNames = async () => {
//       if (allBuyers.length > 0 && executives.length > 0) {
//         const updatedBuyers = allBuyers.map(buyer => {
//           if (buyer.assigned_executive) {
//             const { name: execName } = resolveExecutiveName(buyer.assigned_executive);
//             if (execName !== buyer.assigned_executive_name) {
//               return {
//                 ...buyer,
//                 assigned_executive_name: execName
//               };
//             }
//           }
//           return buyer;
//         });

//         // Only update if there are changes
//         const hasChanges = updatedBuyers.some((buyer, index) =>
//           buyer.assigned_executive_name !== allBuyers[index]?.assigned_executive_name
//         );

//         if (hasChanges) {
//           setAllBuyers(updatedBuyers);
//         }
//       }
//     };

//     updateBuyersWithExecutiveNames();
//   }, [executives, allBuyers, resolveExecutiveName]);

//   /* ---------------- Tabs ---------------- */
//   const tabs = [
//     { id: 'all', label: 'All', count: roleFilteredBuyers.length, color: 'blue' },
//     {
//       id: 'hot_leads', label: 'Hot Leads',
//       count: roleFilteredBuyers.filter(b => priorityKey(b.priority) === 'high').length, color: 'red'
//     },
//     {
//       id: 'active', label: 'Active',
//       count: roleFilteredBuyers.filter(b => b.is_active === true).length, color: 'green'
//     },
//     {
//       id: 'property_hunting', label: 'Property Hunting',
//       count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'property_hunting').length, color: 'purple'
//     },
//     {
//       id: 'loan_processing', label: 'Loan Processing',
//       count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'loan_processing').length, color: 'orange'
//     },
//     {
//       id: 'ready_to_buy', label: 'Ready to Buy',
//       count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'property_finalization').length, color: 'indigo'
//     }
//   ];

//   const sources = ['all', 'Website', 'Referral', 'Social Media', 'Advertisement', 'Walk-in', 'Cold Call'];
//   const budgetRanges = ['all', '0-50L', '50L-1Cr', '1Cr-2Cr', '2Cr-5Cr', '5Cr+'];
//   const propertyTypes = ['all', 'Residential', 'Commercial'];

//   const safeStr = (v: any) => (v === null || v === undefined || v === '') ? ' - ' : String(v);

//   const formatCurrency = (amount: number | null) => {
//     if (amount === null || amount === undefined) return ' - ';
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   /* ---------------- Filtered & Paginated ---------------- */
//   const filteredBuyers = roleFilteredBuyers.filter(buyer => {
//     const s = searchTerm.toLowerCase();

//     const matchesSearch =
//       (buyer.name ?? '').toLowerCase().includes(s) ||
//       (buyer.phone ?? '').includes(searchTerm) ||
//       (buyer.email ?? '').toLowerCase().includes(s) ||
//       (buyer.location ?? '').toLowerCase().includes(s) ||
//       (buyer.assigned_executive_name ?? '').toLowerCase().includes(s);

//     const stg = stageKey(buyer.stage);
//     const pri = priorityKey(buyer.priority);

//     const matchesTab =
//       activeTab === 'all' ||
//       (activeTab === 'hot_leads' && pri === 'high') ||
//       (activeTab === 'active' && buyer.is_active === true) ||
//       (activeTab === 'property_hunting' && stg === 'property_hunting') ||
//       (activeTab === 'loan_processing' && stg === 'loan_processing') ||
//       (activeTab === 'ready_to_buy' && stg === 'property_finalization');

//     const matchesFilters =
//       (filters.source === 'all' || key(buyer.source) === key(filters.source)) &&
//       (filters.stage === 'all' || stg === filters.stage) &&
//       (filters.priority === 'all' || pri === filters.priority) &&
//       (filters.assigned === 'all' || key(buyer.assigned) === key(filters.assigned)) &&
//       (filters.assigned_executive === 'all' || key(buyer.assigned_executive) === key(filters.assigned_executive)) &&
//       (filters.status === 'all' || key(buyer.status) === key(filters.status)) &&
//       (filters.propertyType === 'all' || key(buyer.requirements?.propertyType) === key(filters.propertyType));

//     const created = buyer.created_at ? new Date(buyer.created_at) : null;
//     const fromOk = !filters.dateFrom || (created && created >= new Date(filters.dateFrom));
//     const toOk = !filters.dateTo || (created && created <= new Date(filters.dateTo));
//     const matchesDate = filters.ignoreDate || (fromOk && toOk);

//     return matchesSearch && matchesTab && matchesFilters && matchesDate;
//   });

//   const filteredSortedBuyers = [...filteredBuyers].sort((a, b) => {
//     const aCreated = new Date(a.created_at || 0).getTime();
//     const bCreated = new Date(b.created_at || 0).getTime();
//     if (aCreated !== bCreated) {
//       return bCreated - aCreated;
//     }
//     const aLastActivity = new Date(a.lastActivity || 0).getTime();
//     const bLastActivity = new Date(b.lastActivity || 0).getTime();
//     return bLastActivity - aLastActivity;
//   });

//   const totalPages = Math.max(1, Math.ceil(filteredSortedBuyers.length / itemsPerPage));
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedBuyers = filteredSortedBuyers.slice(startIndex, startIndex + itemsPerPage);

//   /* ---------------- Actions ---------------- */
//   const handleAddBuyer = () => {
//     setEditingBuyer(null);
//     setShowBuyerForm(true);
//   };

//   const handleEditBuyer = (buyer: UIBuyer) => {
//     if (!canEditBuyer(buyer)) {
//       toast.error('You do not have permission to edit this buyer');
//       return;
//     }
//     setEditingBuyer(buyer);
//     setShowBuyerForm(true);
//   };

//   const handleViewBuyer = (buyer: UIBuyer) => {
//     if (!canViewBuyer(buyer)) {
//       toast.error('You do not have permission to view this buyer');
//       return;
//     }
//     const index = filteredSortedBuyers.findIndex(b => b.id === buyer.id);
//     setCurrentBuyerIndex(index >= 0 ? index : 0);
//     setCurrentBuyerView(buyer);
//   };

//   const handleBuyerAccount = (buyer: UIBuyer) => {
//     if (!canViewBuyer(buyer)) {
//       toast.error('You do not have permission to view this buyer account');
//       return;
//     }
//     navigate(`/dashboard/buyers-account/${buyer.id}`);
//   };

//   const handleBackToList = () => {
//     setCurrentBuyerView(null);
//     setCurrentBuyerIndex(0);
//     setShowBuyerForm(false);
//   };

//   const handleDeleteBuyer = async (buyerId: number | string) => {
//     const buyer = allBuyers.find(b => b.id === buyerId);
//     if (!buyer) return;

//     if (!canDeleteBuyer(buyer)) {
//       toast.error('You do not have permission to delete this buyer');
//       return;
//     }

//     if (!window.confirm('Are you sure you want to delete this buyer?')) return;
//     try {
//       await buyerAPI.delete(String(buyerId));
//       setAllBuyers(prev => prev.filter(b => b.id !== buyerId));
//       toast.success('Buyer deleted successfully');
//     } catch (err) {
//       toast.error('Failed to delete buyer. Please try again.');
//     }
//   };

//   /* ===================== ✅ FIXED: Save Buyer Function ===================== */
//   const handleSaveBuyer = async (response: any) => {
//     try {
//       if (!response) {
//         throw new Error('No response received from server');
//       }

//       const normalizedBuyer = normalizeBuyerForUI({
//         ...response,
//         assigned_executive: response.assigned_executive ?? user?.id ?? null,
//       });


//       if (editingBuyer) {
//         // ✅ UPDATE: Replace existing buyer
//         setAllBuyers(prev => prev.map(b =>
//           b.id === editingBuyer.id ? normalizedBuyer : b
//         ));
//         toast.success('Buyer updated successfully');
//       } else {
//         // ✅ CREATE: Add new buyer at the beginning
//         setAllBuyers(prev => [normalizedBuyer, ...prev]);
//         toast.success('Buyer created successfully');
//       }

//       setShowBuyerForm(false);
//       setEditingBuyer(null);
//       setCurrentPage(1);

//       // Scroll to top to see the new/updated buyer
//       setTimeout(() => {
//         if (tableScrollRef.current) {
//           tableScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//         }
//       }, 100);

//     } catch (err: any) {
//       console.error('Error in handleSaveBuyer:', err);
//       toast.error(err.message || 'Failed to save buyer');

//       // Refresh list to get correct data
//       fetchBuyers();
//     }
//   };

//   const handleBuyerSelection = (buyerId: number | string) => {
//     const buyer = roleFilteredBuyers.find(b => b.id === buyerId);
//     if (!buyer || !canViewBuyer(buyer)) {
//       toast.error('You do not have permission to select this buyer');
//       return;
//     }
//     setSelectedBuyers(prev =>
//       prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]
//     );
//   };

//   const handleSelectAll = () => {
//     // Only select buyers that user can view
//     const selectableBuyers = paginatedBuyers.filter(b => {
//       if (isAdmin) return true;
//       if (isExecutive) return String(b.assigned_executive) === String(user?.id);
//       return false;
//     });

//     if (selectedBuyers.length === selectableBuyers.length && selectableBuyers.length > 0) {
//       setSelectedBuyers([]);
//     } else {
//       setSelectedBuyers(selectableBuyers.map(b => b.id));
//     }
//   };

//   const handleNextBuyer = () => {
//     if (currentBuyerIndex < filteredSortedBuyers.length - 1) {
//       const nextIndex = currentBuyerIndex + 1;
//       setCurrentBuyerIndex(nextIndex);
//       setCurrentBuyerView(filteredSortedBuyers[nextIndex]);
//     }
//   };

//   const handlePreviousBuyer = () => {
//     if (currentBuyerIndex > 0) {
//       const prevIndex = currentBuyerIndex - 1;
//       setCurrentBuyerIndex(prevIndex);
//       setCurrentBuyerView(filteredSortedBuyers[prevIndex]);
//     }
//   };

//   /* ---------------- Executive Assignment ---------------- */
//   const handleAssignExecutive = async (executiveId: string | number | null) => {
//     if (selectedBuyers.length === 0) {
//       toast.info('Please select buyers to assign executive');
//       return;
//     }

//     // Check if user has permission to assign
//     if (!canAssign) {
//       toast.error('You do not have permission to assign executives');
//       return;
//     }

//     if (user?.role?.toLowerCase().includes('executive')) {
//       if (executiveId !== 0 && String(executiveId) !== String(user.id)) {
//         toast.error("You can only assign buyers to yourself");
//         return;
//       }
//     }


//     try {
//       const buyerIds = selectedBuyers.map(id => String(id));
//       const apiExecutiveId = executiveId === 0 ? null : executiveId;

//       const result = await buyerAPI.bulkAssignExecutive(buyerIds, apiExecutiveId, false);

//       if (result.success) {
//         // Find executive details
//         const executive = executives.find(exec => exec.id == executiveId);
//         const execName = executive ? executive.name : 'Not assigned';

//         // Update all buyers
//         setAllBuyers(prev => prev.map(buyer =>
//           selectedBuyers.includes(buyer.id)
//             ? {
//               ...buyer,
//               assigned_executive: apiExecutiveId,
//               assigned_executive_name: execName !== 'Not assigned' ? execName : null,
//             }
//             : buyer
//         ));

//         setSelectedBuyers([]);
//         setSelectedExecId(null);
//         setExecDropdownOpen(false);
//         toast.success(`Executive assigned to ${selectedBuyers.length} buyer(s) successfully`);
//       } else {
//         toast.error(result.message || 'Failed to assign executive');
//       }
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || 'Failed to assign executive');
//     }
//   };

//   /* ---------------- Bulk Delete ---------------- */
//   const handleBulkDelete = () => {
//     if (selectedBuyers.length === 0) {
//       toast.info('⚠️ No buyers selected for deletion.', { position: 'top-center' });
//       return;
//     }

//     // Check if user has permission to delete all selected buyers
//     const buyersToDelete = allBuyers.filter(b => selectedBuyers.includes(b.id));
//     const unauthorizedBuyers = buyersToDelete.filter(b => !canDeleteBuyer(b));

//     if (unauthorizedBuyers.length > 0) {
//       toast.error(`You do not have permission to delete ${unauthorizedBuyers.length} buyer(s)`);
//       return;
//     }

//     const ids = selectedBuyers.map(id => String(id));

//     toast(
//       ({ closeToast }) => (
//         <div className="flex flex-col items-center text-center space-y-3 p-3">
//           <p className="text-sm font-medium">
//             Do you want to delete <b>{ids.length}</b> selected buyer(s)?
//           </p>
//           <div className="flex gap-3 justify-center">
//             <button
//               className="px-4 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
//               onClick={async () => {
//                 const prevBuyers = allBuyers;
//                 try {
//                   setBulkDeleting(true);
//                   setAllBuyers(prev => prev.filter(b => !ids.includes(String(b.id))));
//                   setSelectedBuyers([]);
//                   await buyerAPI.bulkDelete(ids, false);
//                   toast.success(`🗑️ ${ids.length} buyer(s) deleted successfully.`);
//                 } catch (err) {
//                   setAllBuyers(prevBuyers);
//                   toast.error('❌ Failed to delete buyers. Try again.');
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

//   /* ---------------- Bulk Actions ---------------- */
//   const handleBulkUpdateLeadField = async (field: string, value: any, onlyEmpty: boolean = false) => {
//     if (selectedBuyers.length === 0) {
//       toast.info('Please select buyers to update');
//       return;
//     }

//     // Check permission
//     if (!canUpdate) {
//       toast.error('You do not have permission to update buyers');
//       return;
//     }

//     // Check if user can update all selected buyers
//     const buyersToUpdate = allBuyers.filter(b => selectedBuyers.includes(b.id));
//     const unauthorizedBuyers = buyersToUpdate.filter(b => !canEditBuyer(b));

//     if (unauthorizedBuyers.length > 0) {
//       toast.error(`You do not have permission to update ${unauthorizedBuyers.length} buyer(s)`);
//       return;
//     }

//     try {
//       const buyerIds = selectedBuyers.map(id => String(id));
//       const result = await buyerAPI.bulkUpdateLeadField(buyerIds, field, value, onlyEmpty);

//       if (result.success) {
//         setAllBuyers(prev => prev.map(buyer => {
//           if (!selectedBuyers.includes(buyer.id)) return buyer;

//           const updatedBuyer = { ...buyer };
//           switch (field) {
//             case 'buyer_lead_stage':
//               updatedBuyer.stage = value;
//               updatedBuyer.currentStage = value;
//               break;
//             case 'buyer_lead_status':
//               updatedBuyer.status = value;
//               break;
//             case 'buyer_lead_priority':
//               updatedBuyer.priority = value;
//               break;
//             case 'is_active':
//               updatedBuyer.is_active = !!Number(value);
//               break;
//           }
//           return updatedBuyer;
//         }));

//         setSelectedBuyers([]);
//         toast.success('Field updated successfully');
//       } else {
//         toast.error(result.message || 'Failed to update field');
//       }
//     } catch (err) {
//       toast.error('Failed to update field');
//     }
//   };

//   /* ---------------- Export CSV ---------------- */
//   const exportToCSV = (mode: 'filtered' | 'selected' | 'all' = 'filtered') => {
//     let source: UIBuyer[] = [];
//     if (mode === 'selected') {
//       source = roleFilteredBuyers.filter(b => selectedBuyers.includes(b.id));
//       if (selectedBuyers.length === 0) {
//         toast.info('No buyers selected to export.');
//         return;
//       }
//     } else if (mode === 'filtered') {
//       source = filteredSortedBuyers;
//       if (!source || source.length === 0) {
//         toast.info('No buyers found in current view to export.');
//         return;
//       }
//     } else {
//       source = roleFilteredBuyers;
//       if (!source || source.length === 0) {
//         toast.info('No buyers available to export.');
//         return;
//       }
//     }

//     const columns: { key: string; label: string }[] = [
//       { key: 'id', label: 'ID' },
//       { key: 'name', label: 'Name' },
//       { key: 'phone', label: 'Phone' },
//       { key: 'email', label: 'Email' },
//       { key: 'city', label: 'City' },
//       { key: 'state', label: 'State' },
//       { key: 'location', label: 'Location' },
//       { key: 'source', label: 'Source' },
//       { key: 'priority', label: 'Priority' },
//       { key: 'stage', label: 'Stage' },
//       { key: 'assigned', label: 'Assigned To' },
//       { key: 'assigned_executive_name', label: 'Executive Name' },
//       { key: 'assigned_executive_email', label: 'Executive Email' },
//       { key: 'assigned_executive_phone', label: 'Executive Phone' },
//       { key: 'leadScore', label: 'Lead Score' },
//       { key: 'budgetMin', label: 'Budget Min' },
//       { key: 'budgetMax', label: 'Budget Max' },
//       { key: 'matchedPropertiesCount', label: 'Property Matches' },
//       { key: 'requirements', label: 'Requirements' },
//       { key: 'created_at', label: 'Created At' },
//     ];

//     const csvEscape = (v: any) => {
//       if (v === null || v === undefined) return '';
//       const s = typeof v === 'string' ? v : String(v);
//       return `"${s.replace(/"/g, '""')}"`;
//     };

//     const rows = source.map(b => {
//       const req = b.requirements ?? {};
//       const budgetMin = b.budget?.min ?? '';
//       const budgetMax = b.budget?.max ?? '';
//       const reqParts: string[] = [];
//       if (req.propertyType) reqParts.push(`Property:${req.propertyType}`);
//       if (Array.isArray(req.unitTypes) && req.unitTypes.length) reqParts.push(`UnitTypes:${req.unitTypes.join('|')}`);
//       if (Array.isArray(req.preferredLocations) && req.preferredLocations.length) reqParts.push(`Locations:${req.preferredLocations.join('|')}`);
//       if (req.amenities && Array.isArray(req.amenities)) reqParts.push(`Amenities:${req.amenities.join('|')}`);
//       const reqSummary = reqParts.join('; ');

//       return {
//         id: b.id,
//         name: b.name,
//         phone: b.phone,
//         email: b.email,
//         city: b.city,
//         state: b.state,
//         location: b.location,
//         source: b.source,
//         priority: b.priority,
//         stage: b.stage,
//         assigned: b.assigned,
//         assigned_executive_name: b.assigned_executive_name,
//         assigned_executive_email: b.assigned_executive_email,
//         assigned_executive_phone: b.assigned_executive_phone,
//         leadScore: b.leadScore ?? '',
//         budgetMin,
//         budgetMax,
//         matchedPropertiesCount: b.matchedPropertiesCount ?? 0,
//         requirements: reqSummary,
//         created_at: b.created_at ? new Date(b.created_at).toISOString() : '',
//       };
//     });

//     const header = columns.map(c => csvEscape(c.label)).join(',');
//     const body = rows.map(row => columns.map(c => csvEscape((row as any)[c.key])).join(',')).join('\n');

//     const bom = '\uFEFF';
//     const csvContent = bom + header + '\n' + body;
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     const now = new Date();
//     const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
//     a.download = mode === 'selected' ? `buyers_selected_${stamp}.csv` : mode === 'all' ? `buyers_all_${stamp}.csv` : `buyers_filtered_${stamp}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     URL.revokeObjectURL(url);
//     toast.success('Exported CSV successfully');
//   };

//   const resetFilters = () => {
//     setFilters({
//       dateFrom: '',
//       dateTo: '',
//       ignoreDate: false,
//       source: 'all',
//       stage: 'all',
//       priority: 'all',
//       assigned: 'all',
//       assigned_executive: 'all',
//       status: 'all',
//       budgetRange: 'all',
//       propertyType: 'all',
//     });
//   };

//   // Calculate column span based on permissions
//   const getColSpan = () => {
//     let colSpan = 8; // Base columns without actions and checkbox

//     if (canUpdate || canDelete || canAssign || canBulkDelete) {
//       colSpan += 1;
//     }

//     if (shouldShowActionsColumn) {
//       colSpan += 1;
//     }

//     return colSpan;
//   };

//   /* ---------------- Detail view ---------------- */
//   if (currentBuyerView) {
//     return (
//       <div className="buyers-page">
//         <BuyerViewPage
//           buyer={currentBuyerView}
//           onBack={handleBackToList}
//           onEdit={handleEditBuyer}
//           onAccount={handleBuyerAccount}
//           onNext={handleNextBuyer}
//           onPrevious={handlePreviousBuyer}
//           currentIndex={currentBuyerIndex}
//           totalBuyers={filteredSortedBuyers.length}
//           onUpdateBuyer={(updatedBuyer: UIBuyer) => {
//             setAllBuyers(prev => {
//               const next = prev.map(b => (b.id === updatedBuyer.id ? updatedBuyer : b));
//               return next.sort((a, b) => {
//                 const ad = new Date(a.created_at || a.lastActivity || 0).getTime();
//                 const bd = new Date(b.created_at || b.lastActivity || 0).getTime();
//                 return bd - ad;
//               });
//             });
//             setCurrentBuyerView(updatedBuyer);
//           }}
//         />
//         {showBuyerForm && (
//           <BuyerFormModal
//             isOpen={showBuyerForm}
//             buyer={editingBuyer}
//             onClose={() => setShowBuyerForm(false)}
//             onSave={handleSaveBuyer}
//           />
//         )}
//         {showImportBuyers && (
//           <ImportBuyersLeadsModal
//             isOpen={showImportBuyers}
//             onClose={() => setShowImportBuyers(false)}
//           />
//         )}
//       </div>
//     );
//   }

//   /* ---------------- List view ---------------- */
//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           <div className="flex items-center space-x-4">
            
//           </div>
//           <div className="flex items-center space-x-2">
//             {canImport && (
//               <button
//                 onClick={() => setShowImportBuyers(true)}
//                 className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
//               >
//                 <Upload size={14} />
//                 <span>Import</span>
//               </button>
//             )}
//             {canCreate && (
//               <button
//                 onClick={handleAddBuyer}
//                 className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all text-sm"
//               >
//                 <Plus size={14} />
//                 <span>Add Buyer</span>
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
//                 onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
//                 className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${activeTab === tab.id
//                   ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200`
//                   : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//               >
//                 <span>{tab.label}</span>
//                 <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? `bg-${tab.color}-200` : 'bg-gray-200'
//                   }`}>
//                   {tab.count}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Search / Filters */}
//       <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
//         <div className="flex flex-col lg:flex-row gap-4">
//           <div className="flex-1 flex items-center space-x-3">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//               <input
//                 type="text"
//                 placeholder="Search buyers..."
//                 value={searchTerm}
//                 onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
//                 className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
//               />
//             </div>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
//             >
//               <Filter size={14} />
//               <span>Filters</span>
//             </button>
//             <div className="flex items-center space-x-1">
//               <button
//                 onClick={() => setViewMode('table')}
//                 className={`p-2 rounded ${viewMode === 'table' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
//               >
//                 <FileText size={16} />
//               </button>
//               <button
//                 onClick={() => setViewMode('cards')}
//                 className={`p-2 rounded ${viewMode === 'cards' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
//               >
//                 <Building size={16} />
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             <select
//               value={itemsPerPage}
//               onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
//               className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             >
//               <option value={25}>25</option>
//               <option value={50}>50</option>
//               <option value={100}>100</option>
//             </select>
//             {canExport && (
//               <button
//                 onClick={() => exportToCSV('filtered')}
//                 className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
//               >
//                 <Download size={14} />
//                 <span>Export</span>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Role-based visibility hint */}
//         {isExecutive && (
//           <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="mr-2">
//                 <UserCheck size={14} className="text-blue-500" />
//               </div>
//               <div>
//                 <strong className="font-semibold">Visibility Note:</strong>{' '}
//                 You are viewing {roleFilteredBuyers.length} buyer(s) -{' '}
//                 {roleFilteredBuyers.filter(b => String(b.assigned_executive) === String(user?.id)).length} assigned to you
//                 {showUnassignedToExecutives && roleFilteredBuyers.filter(b => !b.assigned_executive).length > 0 && (
//                   <> + {roleFilteredBuyers.filter(b => !b.assigned_executive).length} unassigned</>
//                 )}
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <label className="flex items-center text-[10px]">
//                 <input
//                   type="checkbox"
//                   checked={showUnassignedToExecutives}
//                   onChange={(e) => setShowUnassignedToExecutives(e.target.checked)}
//                   className="mr-1 h-3 w-3"
//                 />
//                 Show unassigned
//               </label>
//             </div>
//           </div>
//         )}

//         {/* Quick Filters */}
//         <div className="flex flex-wrap items-center gap-2 mt-3">
//           <span className="text-xs font-medium text-gray-500">Quick:</span>

//           {(() => {
//             const quickStages = ['all', ...effectiveStageOptions.map(o => o.value).slice(0, 4)];
//             return quickStages.map(stage => (
//               <button
//                 key={stage}
//                 onClick={() => {
//                   if (stage === 'all') {
//                     setFilters(prev => ({ ...prev, stage: 'all', priority: 'all' }));
//                   } else {
//                     setFilters(prev => ({ ...prev, stage }));
//                   }
//                   setCurrentPage(1);
//                 }}
//                 className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === stage
//                   ? 'bg-purple-100 text-purple-700'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                   }`}
//               >
//                 {stage === 'all'
//                   ? 'All'
//                   : stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//               </button>
//             ));
//           })()}

//           {effectivePriorityOptions.map(opt => (
//             <button
//               key={opt.value}
//               onClick={() => {
//                 setFilters(prev => ({ ...prev, priority: opt.value }));
//                 setCurrentPage(1);
//               }}
//               className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.priority === opt.value
//                 ? 'bg-red-100 text-red-700'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                 }`}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>

//         <BuyerSidebarFilter
//           isOpen={showFilters}
//           onClose={() => setShowFilters(false)}
//           filters={filters}
//           setFilters={setFilters}
//           resetFilters={resetFilters}
//           sources={sources}
//           stages={stagesFromMasters}
//           priorities={prioritiesFromMasters}
//           budgetRanges={budgetRanges}
//           propertyTypes={propertyTypes}
//           executives={executives.map(e => ({ id: e.id, name: e.name }))}
//         />
//       </div>

//       {/* Bulk Actions */}
//       {selectedBuyers.length > 0 && (canUpdate || canAssign || canBulkDelete || canExport) && (
//         <div className="bg-purple-50 border-b border-purple-200 px-4 lg:px-6 py-2">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <span className="text-sm font-medium text-purple-700">
//                 {selectedBuyers.length} selected
//               </span>

//               <div className="flex items-center flex-wrap gap-2">
//                 {/* Executive Assignment Dropdown */}
//                 {canAssign && (
//                   <div className="relative" ref={dropdownRef}>
//                     <button
//                       onClick={() => setExecDropdownOpen(!execDropdownOpen)}
//                       className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
//                     >
//                       <UserCheck size={12} />
//                       <span>Assign Executive</span>
//                       {selectedExecId && (
//                         <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
//                           {executives.find(e => e.id == selectedExecId)?.name || 'Selected'}
//                         </span>
//                       )}
//                     </button>

//                     {execDropdownOpen && (
//                       <div className="absolute top-10 left-0 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
//                         <div className="p-3 border-b">
//                           <div className="text-sm font-medium text-gray-700 mb-2">Assign Executive</div>
//                           <div className="relative">
//                             <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
//                             <input
//                               type="text"
//                               placeholder="Search executives..."
//                               value={execSearch}
//                               onChange={(e) => setExecSearch(e.target.value)}
//                               className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                               autoFocus
//                             />
//                           </div>
//                         </div>

//                         <div className="max-h-64 overflow-auto">
//                           {execsLoading ? (
//                             <div className="p-4 text-center">
//                               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
//                               <div className="text-xs text-gray-500">Loading executives...</div>
//                             </div>
//                           ) : filteredExecutives.length === 0 ? (
//                             <div className="p-4 text-center">
//                               <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
//                               <div className="text-sm font-medium text-gray-700 mb-1">
//                                 {executives.length === 0 ? 'No executives available' : 'No matching executives'}
//                               </div>
//                               <div className="text-xs text-gray-500 mb-3">
//                                 {executives.length === 0
//                                   ? "Create sales executives in User Management"
//                                   : "Try a different search term"}
//                               </div>
//                               {executives.length === 0 && canUpdate && (
//                                 <button
//                                   onClick={() => {
//                                     navigate('/dashboard/users?role=Sales+Executive');
//                                     setExecDropdownOpen(false);
//                                   }}
//                                   className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
//                                 >
//                                   Go to User Management
//                                 </button>
//                               )}
//                             </div>
//                           ) : (
//                             <>
//                               <button
//                                 onClick={() => {
//                                   handleAssignExecutive(null);
//                                   setSelectedExecId(null);
//                                   setExecDropdownOpen(false);
//                                   setExecSearch('');
//                                 }}
//                                 className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b flex items-center transition-colors"
//                               >
//                                 <UserX size={14} className="mr-2 text-gray-400" />
//                                 <div>
//                                   <div className="font-medium">Unassign Executive</div>
//                                   <div className="text-xs text-gray-500">Remove executive assignment</div>
//                                 </div>
//                               </button>

//                               {filteredExecutives
//                                 .filter(exec => exec.id !== 0) // Remove unassigned from main list
//                                 .map((exec) => (
//                                   <button
//                                     key={exec.id}
//                                     onClick={() => {
//                                       setSelectedExecId(exec.id);
//                                       handleAssignExecutive(exec.id);
//                                       setExecDropdownOpen(false);
//                                       setExecSearch('');
//                                     }}
//                                     className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${selectedExecId == exec.id ? 'bg-blue-50' : ''}`}
//                                   >
//                                     <div className="flex justify-between items-start">
//                                       <div>
//                                         <div className="font-medium text-gray-900 text-sm">
//                                           {exec.name}
//                                           {exec.id === user?.id && (
//                                             <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">You</span>
//                                           )}
//                                         </div>
//                                         {exec.department || 'Sales'} • {exec.role || 'Sales Executive'}
//                                       </div>
//                                       {exec.id !== 0 && exec.id === user?.id && (
//                                         <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Current</span>
//                                       )}
//                                     </div>
//                                   </button>
//                                 ))}
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Bulk: Update Stage from Masters */}
//                 {canUpdate && (
//                   <select
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       if (!v) return;
//                       handleBulkUpdateLeadField('buyer_lead_stage', v);
//                       e.currentTarget.selectedIndex = 0;
//                     }}
//                     className="px-3 py-1.5 border border-gray-300 rounded text-xs"
//                   >
//                     <option value="">Update Stage</option>
//                     {effectiveStageOptions.map(opt => (
//                       <option key={opt.value} value={opt.value}>{opt.label}</option>
//                     ))}
//                   </select>
//                 )}

//                 {/* Bulk: Update Priority from Masters */}
//                 {canUpdate && (
//                   <select
//                     onChange={(e) => {
//                       const v = e.target.value;
//                       if (!v) return;
//                       handleBulkUpdateLeadField('buyer_lead_priority', v);
//                       e.currentTarget.selectedIndex = 0;
//                     }}
//                     className="px-3 py-1.5 border border-gray-300 rounded text-xs"
//                   >
//                     <option value="">Update Priority</option>
//                     {effectivePriorityOptions.map(opt => (
//                       <option key={opt.value} value={opt.value}>{opt.label}</option>
//                     ))}
//                   </select>
//                 )}

//                 {/* Bulk Activate / Inactivate */}
//                 {canUpdate && (
//                   <>
//                     <button
//                       onClick={() => handleBulkUpdateLeadField('is_active', 1)}
//                       className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition-colors"
//                     >
//                       Mark Active
//                     </button>
//                     <button
//                       onClick={() => handleBulkUpdateLeadField('is_active', 0)}
//                       className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
//                     >
//                       Mark Inactive
//                     </button>
//                   </>
//                 )}

//                 {/* Export */}
//                 {canExport && (
//                   <button
//                     onClick={() => exportToCSV('selected')}
//                     className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
//                   >
//                     Export
//                   </button>
//                 )}

//                 {/* Delete */}
//                 {canBulkDelete && (
//                   <button
//                     onClick={handleBulkDelete}
//                     disabled={bulkDeleting}
//                     className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {bulkDeleting ? 'Deleting...' : 'Delete'}
//                   </button>
//                 )}
//               </div>
//             </div>
//             <button onClick={() => setSelectedBuyers([])} className="text-purple-600 hover:text-purple-800 transition-colors">
//               <X size={16} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <div className="flex-1 overflow-auto" ref={tableScrollRef}>
//         <div className="bg-white">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 sticky top-0">
//               <tr>
//                 {(canUpdate || canDelete || canAssign || canBulkDelete) && (
//                   <th className="px-3 py-2 text-left w-8">
//                     <input
//                       type="checkbox"
//                       checked={selectedBuyers.length === paginatedBuyers.length && paginatedBuyers.length > 0}
//                       onChange={handleSelectAll}
//                       className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                     />
//                   </th>
//                 )}
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Buyer Details</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact & Location</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business Info</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirements & Budget</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress & Activity</th>
//                 <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>

//                 {shouldShowActionsColumn && (
//                   <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                     {hasAnyActionPermission ? 'Actions' : 'View'}
//                   </th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-100 ">
//               {loading ? (
//                 <tr>
//                   <td colSpan={getColSpan()}>
//                     <div className="w-full flex items-center justify-center">
//                       <TableLoader colSpan={getColSpan()} message="Loading buyers..." size="lg" />
//                     </div>
//                   </td>
//                 </tr>
//               ) : paginatedBuyers.length > 0 ? (
//                 paginatedBuyers.map((buyer) => {
//                   const { name: execName, isCurrentUser } = resolveExecutiveName(buyer.assigned_executive);

//                   return (
//                     <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
//                       {(canUpdate || canDelete || canAssign || canBulkDelete) && (
//                         <td className="px-3 py-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedBuyers.includes(buyer.id)}
//                             onChange={() => handleBuyerSelection(buyer.id)}
//                             className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                           />
//                         </td>
//                       )}

//                       {/* Buyer Details */}
//                       <td className="px-3 py-3">
//                         <div className="flex items-center space-x-3">
//                           <div className="flex flex-col items-center space-y-1">
//                             <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
//                               <User className="text-white" size={14} />
//                             </div>
//                             <div className="text-[10px] text-[#0b3856] bg-[#0b3856]/10 px-2 py-0.5 rounded-md inline-block">
//                               Id : {buyer.id}
//                             </div>
//                           </div>

//                           <div>
//                             <button
//                               onClick={() => handleViewBuyer(buyer)}
//                               className="font-semibold text-gray-900 text-sm hover:text-purple-600 text-left"
//                             >
//                               <div>{safeStr(buyer.salutation)} {safeStr(buyer.name)}</div>
//                               {buyer.dob && <div className="text-gray-500 text-xs">{formatDOB(buyer.dob)}</div>}
//                             </button>
//                             <div className="flex items-center space-x-1 mt-1">
//                               {getStatusBadge(buyer.is_active)}
//                               {getLeadScore(buyer.leadScore)}
//                             </div>
//                           </div>
//                         </div>
//                       </td>

//                       <td className="px-3 py-3">
//                         <div className="space-y-1">
//                           <div className="flex items-center space-x-1 text-xs">
//                             <Phone size={10} className="text-gray-400" />
//                             <span className="font-medium">{safeStr(buyer.phone)}</span>
//                           </div>
//                           <div className="flex items-center space-x-1 text-xs">
//                             <Mail size={10} className="text-gray-400" />
//                             <span className="truncate max-w-24">{safeStr(buyer.email)}</span>
//                           </div>
//                           <div className="flex items-center space-x-1 text-xs">
//                             <MapPin size={10} className="text-gray-400" />
//                             <span>{safeStr(buyer.location)}{buyer.city ? `, ${buyer.city}` : ''}</span>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Business Info Column */}
//                       <td className="px-3 py-3">
//                         <div className="space-y-2">
//                           <div className="flex items-center space-x-1">
//                             <div className="text-xs">
//                               <span className="text-gray-500">Source:</span>{' '}
//                               <span className="font-medium text-blue-700">
//                                 {buyer.source || 'Not specified'}
//                               </span>
//                             </div>
//                           </div>

//                           <div className="flex items-center space-x-1">
//                             <div className="text-xs">
//                               {getPriorityBadge(buyer.priority)}
//                             </div>
//                           </div>

//                           {buyer.created_at && (
//                             <div className="text-xs text-gray-500">
//                               Created: {formatDate(buyer.created_at)}
//                             </div>
//                           )}
//                         </div>
//                       </td>

//                       {/* ✅ FIXED: Assigned To Column */}
//                       <td className="px-3 py-3">
//                         <div className="space-y-1">
//                           {buyer.assigned_executive ? (
//                             <>
//                               <div className="flex items-center space-x-1 text-xs">
//                                 <UserCheck size={10} className={isCurrentUser ? "text-green-500" : "text-blue-500"} />
//                                 <span className={`font-medium ${isCurrentUser ? "text-green-700" : "text-blue-700"}`}>
//                                   {execName}
//                                 </span>
//                                 {isCurrentUser && (
//                                   <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded">(You)</span>
//                                 )}
//                               </div>
//                               {/* Debug info */}
//                               <div className="text-[8px] text-gray-400">
//                                 ID: {buyer.assigned_executive}
//                               </div>
//                             </>
//                           ) : (
//                             <span className="text-xs text-gray-500">Not assigned</span>
//                           )}
//                         </div>
//                       </td>

//                       <td className="px-3 py-3">
//                         <div className="space-y-1">
//                           <div className="text-xs">
//                             <span className="text-gray-500">Property:</span>{' '}
//                             {buyer.requirements?.propertyType || '—'}
//                           </div>
//                           <div className="text-xs">
//                             <span className="text-gray-500">Types:</span>{' '}
//                             {safeStr(buyer.requirements?.unitTypes)}
//                           </div>
//                           <div className="text-xs">
//                             <span className="text-gray-500">Budget:</span>
//                             <span className="font-medium text-green-600 ml-1">
//                               {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
//                             </span>
//                           </div>
//                         </div>
//                       </td>

//                       <td className="px-3 py-3">
//                         <div className="space-y-2">
//                           {getStageBadge(buyer.stage)}
//                           <div className="w-full bg-gray-200 rounded-full h-1.5">
//                             <div
//                               className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
//                               style={{ width: `${buyer.stageProgress || 0}%` } as any}
//                             />
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             Last: {formatDate(buyer.lastActivity)}
//                           </div>
//                         </div>
//                       </td>

//                       <td className="px-3 py-3">
//                         <div className="space-y-1">
//                           <div className="flex items-center space-x-2 text-xs">
//                             <Target size={10} className="text-green-500" />
//                             <span className={`font-medium ${(buyer.matchedPropertiesCount || 0) > 0
//                               ? 'text-green-600'
//                               : 'text-gray-500'
//                               }`}>
//                               {buyer.matchedPropertiesCount || 0} matches
//                             </span>
//                           </div>
//                           <div className="flex items-center space-x-2 text-xs">
//                             <Activity size={10} className="text-green-500" />
//                             <span>{buyer.activities?.length ?? 0} activities</span>
//                           </div>
//                           <div className="flex items-center space-x-2 text-xs">
//                             <Eye size={10} className="text-purple-500" />
//                             <span>{buyer.visits ?? 0} visits</span>
//                           </div>
//                           <div className="flex items-center space-x-2 text-xs">
//                             <TrendingUp size={10} className="text-orange-500" />
//                             <span>{buyer.responseRate ? `${buyer.responseRate}% response` : ' - '}</span>
//                           </div>
//                           {buyer.notifications > 0 && (
//                             <div className="flex items-center space-x-1 text-xs">
//                               <Bell size={10} className="text-red-500" />
//                               <span className="text-red-600 font-medium">{buyer.notifications}</span>
//                             </div>
//                           )}
//                         </div>
//                       </td>

//                       {shouldShowActionsColumn && (
//                         <td className="px-3 py-3">
//                           <div className="flex items-center space-x-1">
//                             <button
//                               onClick={() => handleViewBuyer(buyer)}
//                               className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
//                               title="View Details"
//                             >
//                               <Eye size={14} />
//                             </button>
//                             <button
//                               onClick={() => handleBuyerAccount(buyer)}
//                               className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
//                               title="Buyer Account"
//                             >
//                               <UserCheck size={14} />
//                             </button>
//                             {canEditBuyer(buyer) && (
//                               <button
//                                 onClick={() => handleEditBuyer(buyer)}
//                                 className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
//                                 title="Edit"
//                               >
//                                 <Edit size={14} />
//                               </button>
//                             )}
//                             <div className="relative group">
//                               <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors">
//                                 <MoreHorizontal size={14} />
//                               </button>
//                               <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
//                                 <div className="p-1">
//                                   <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
//                                     <PhoneCall size={12} />
//                                     <span>Call</span>
//                                   </button>
//                                   <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
//                                     <MessageCircle size={12} />
//                                     <span>WhatsApp</span>
//                                   </button>
//                                   <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
//                                     <Send size={12} />
//                                     <span>Email</span>
//                                   </button>
//                                   <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
//                                     <Home size={12} />
//                                     <span>Send Properties</span>
//                                   </button>
//                                   {canDeleteBuyer(buyer) && (
//                                     <button
//                                       onClick={() => handleDeleteBuyer(buyer.id)}
//                                       className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full text-left"
//                                     >
//                                       <Trash2 size={12} />
//                                       <span>Delete</span>
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                       )}
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={getColSpan()} className="px-3 py-8 text-center text-sm text-gray-500">
//                     {roleFilteredBuyers.length === 0 ?
//                       (isExecutive ?
//                         <div className="flex flex-col items-center space-y-2">
//                           <Users className="h-8 w-8 text-gray-300" />
//                           <div>No buyers assigned to you yet.</div>
//                           <div className="text-xs text-gray-500">
//                             {showUnassignedToExecutives ?
//                               'No buyers available (assigned or unassigned)' :
//                               'Contact Admin to get assigned buyers or enable "Show unassigned" option.'
//                             }
//                           </div>
//                           {!showUnassignedToExecutives && (
//                             <button
//                               onClick={() => setShowUnassignedToExecutives(true)}
//                               className="mt-2 px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
//                             >
//                               Show Unassigned Buyers
//                             </button>
//                           )}
//                         </div>
//                         :
//                         'No buyers found.'
//                       ) :
//                       'No buyers match the current filters.'
//                     }
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Pagination */}
//       <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-3">
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//           <div className="text-sm text-gray-700">
//             {filteredSortedBuyers.length > 0
//               ? <>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSortedBuyers.length)} of {filteredSortedBuyers.length}</>
//               : 'Showing 0-0 of 0'}
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronLeft size={14} />
//             </button>
//             <div className="flex items-center space-x-1">
//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 const page = i + 1;
//                 return (
//                   <button
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`px-2 py-1 rounded text-xs ${currentPage === page
//                       ? 'bg-purple-600 text-white'
//                       : 'border border-gray-300 hover:bg-gray-50'
//                       }`}
//                   >
//                     {page}
//                   </button>
//                 );
//               })}
//               {totalPages > 5 && (
//                 <>
//                   <span className="px-1 text-xs">...</span>
//                   <button
//                     onClick={() => setCurrentPage(totalPages)}
//                     className={`px-2 py-1 rounded text-xs ${currentPage === totalPages
//                       ? 'bg-purple-600 text-white'
//                       : 'border border-gray-300 hover:bg-gray-50'
//                       }`}
//                   >
//                     {totalPages}
//                   </button>
//                 </>
//               )}
//             </div>
//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <ChevronRight size={14} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       <BuyerFormModal
//         isOpen={showBuyerForm}
//         onClose={() => { setShowBuyerForm(false); setEditingBuyer(null); }}
//         buyer={editingBuyer}
//         onSave={handleSaveBuyer}
//       />

//       <ImportBuyersLeadsModal
//         isOpen={showImportBuyers}
//         onClose={() => setShowImportBuyers(false)}
//       />
//     </div>
//   );
// };

// // UI helper functions
// function getStatusBadge(is_active: boolean | null) {
//   if (is_active === true) {
//     return (
//       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
//         🟢 Active
//       </span>
//     );
//   }
//   if (is_active === false) {
//     return (
//       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
//         ⚫ Inactive
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
//       –
//     </span>
//   );
// }

// function getLeadScore(score: number) {
//   const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
//   const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
//   const label = score > 0 ? score : ' - ';
//   return (
//     <div className={`inline-flex items-center px-2 py-1 rounded-full ${score > 0 ? bgColor : 'bg-gray-100'} ${score > 0 ? color : 'text-gray-600'}`}>
//       <Star size={12} className="mr-1" />
//       <span className="text-xs font-bold">{label}</span>
//     </div>
//   );
// }

// function getStageBadge(stageOrBuyer: string | any) {
//   const raw =
//     typeof stageOrBuyer === 'string'
//       ? stageOrBuyer
//       : stageOrBuyer?.buyer_lead_stage ?? stageOrBuyer?.buyer_leadStage ?? stageOrBuyer?.stage ?? '';
//   const rawStr = String(raw ?? '').trim();
//   const stageConfig: Record<string, any> = {
//     initial_contact: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact', icon: '📞' },
//     requirement_gathering: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Requirement Gathering', icon: '📋' },
//     property_hunting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Property Hunting', icon: '🔍' },
//     loan_processing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Loan Processing', icon: '🏦' },
//     property_finalization: { bg: 'bg-green-100', text: 'text-green-700', label: 'Property Finalization', icon: '✅' },
//     deal_closure: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Deal Closure', icon: '🤝' },
//     completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: '🎉' },
//   };
//   const labelToKey: Record<string, string> = {
//     'initial contact': 'initial_contact',
//     'requirement gathering': 'requirement_gathering',
//     'property hunting': 'property_hunting',
//     'loan processing': 'loan_processing',
//     'property finalization': 'property_finalization',
//     'deal closure': 'deal_closure',
//     'completed': 'completed',
//     'property-hunting': 'property_hunting',
//     'property_hunting': 'property_hunting',
//     'propertyfinalization': 'property_finalization',
//   };
//   const lower = rawStr.toLowerCase();
//   let keyS = labelToKey[lower] ?? lower.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
//   if (!stageConfig[keyS]) {
//     const fuzzy = Object.keys(stageConfig).find(k => k.includes(keyS) || keyS.includes(k));
//     if (fuzzy) keyS = fuzzy;
//   }
//   if (!stageConfig[keyS]) keyS = 'initial_contact';
//   const config = stageConfig[keyS];
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
//       <span className="mr-2">{config.icon}</span>
//       <span className="flex items-center space-x-2">
//         <span className="text-[10px] font-normal">{config.label}</span>
//       </span>
//     </span>
//   );
// }

// function getPriorityBadge(priority: string | null | undefined) {
//   const raw = (priority ?? '').toString().trim().toLowerCase();
//   const alias: Record<string, 'high' | 'medium' | 'low'> = {
//     h: 'high', urgent: 'high', hot: 'high',
//     m: 'medium', normal: 'medium',
//     l: 'low', cold: 'low',
//   };
//   const keyP = (['high', 'medium', 'low'].includes(raw) ? raw : alias[raw]) ?? '';
//   const priorityConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
//     high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High', icon: '🔥' },
//     medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: '⚡' },
//     low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low', icon: '🌱' },
//   };
//   const fallbackLabel = raw ? raw.replace(/\b\w/g, c => c.toUpperCase()) : '-';
//   const config = priorityConfig[keyP] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: fallbackLabel, icon: '' };
//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
//       {config.icon} {config.label}
//     </span>
//   );
// }

// export default BuyersPage;



// src/pages/BuyersPage.tsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Users, Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, MapPin,
  Building, Activity, MoreHorizontal, User, Star, FileText, MessageCircle,
  Bell, Upload, Download, ChevronLeft, ChevronRight, X, Target, Home,
  UserCheck, PhoneCall, Send,
  Briefcase, UserX,
  TrendingUp, SlidersHorizontal, Clock, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import Swal from 'sweetalert2';
import BuyerFormModal from '../../components/buyers/BuyerFormModal';
import BuyerViewPage from '../../components/buyers/BuyerViewPage';
import BuyerAccountPage from '../../components/buyers/BuyerAccountPage';
import ImportBuyersLeadsModal from '../../components/buyers/ImportBuyersLeadsModal';
import { buyerAPI } from '@/lib/buyerAPI';
import BuyerSidebarFilter from './components/BuyerSidebarFilter';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import TableLoader from '@/components/ui/TableLoader';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getAssignableExecutives } from '@/utils/roleBasedOptions';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { can } from '@/utils/permission';
import { filterBuyersByRole } from '@/utils/roleBasedBuyerFilter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';

type Executive = {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  department?: string;
  role?: string;
};

type UIBuyer = {
  id: number | string;
  salutation: string | null;
  name: string | null;
  phone: string | null;
  dob: string | null;
  whatsapp: string | null;
  email: string | null;
  state: string | null;
  city: string | null;
  location: string | null;
  source: string | null;
  priority: 'high' | 'medium' | 'low' | string | null;
  stage: string | null;
  status: string | null;
  assigned: string | null;
  assigned_executive?: string | number | null;
  assigned_executive_name?: string | null;
  assigned_executive_email?: string | null;
  assigned_executive_phone?: string | null;
  leadScore: number;
  is_active: boolean | null;
  budget: { min: number | null; max: number | null };
  expectedClose: string | null;
  requirements: {
    propertyType?: string | null;
    unitType?: string | null;
    unitTypes?: string[] | null;
    preferredLocations?: string[] | null;
    amenities?: string[] | null;
    furnishing?: string | null;
    possession?: string | null;
    facing?: string | null;
    floor?: string | null;
    specialRequirements?: string | null;
  };
  financials: {
    loanRequired?: boolean | null;
    loanAmount?: number | null;
    downPayment?: number | null;
    monthlyIncome?: number | null;
    bankPreference?: string | null;
    loanStatus?: string | null;
    creditScore?: number | null;
  };
  matchedProperties: any[];
  matchedPropertiesCount?: number;
  activities: any[];
  followups: any[];
  documents: any[];
  visits: number;
  totalVisits: number;
  lastActivity: string | null;
  created_at: string | null;
  notifications: number;
  currentStage: string | null;
  stageProgress: number;
  dealPotential: string | null;
  responseRate: number;
  avgResponseTime: string | null;
};

// Resale Theme Colors
const RESALE = {
  navy: '#f3f4f6',
  navyLight: '#e5e7eb',
  navyDark: '#d1d5db',
  orange: '#e67e22',
  orangeLight: '#f39c12',
  orangeDark: '#d35400',
};

const BuyersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  // Permission checks
  const canRead = can(user, 'buyer.read');
  const canCreate = can(user, 'buyer.create');
  const canUpdate = can(user, 'buyer.update');
  const canDelete = can(user, 'buyer.delete');
  const canImport = can(user, 'data.import');
  const canExport = can(user, 'data.export');
  const canAssign = can(user, 'buyer.assign');
  const canBulkDelete = can(user, 'buyer.bulk_delete');

  const hasAnyActionPermission = canUpdate || canDelete || canAssign;
  const shouldShowActionsColumn = canRead && (hasAnyActionPermission || true);

  const isAdmin = useMemo(() => {
    const role = (user?.role || '').toLowerCase();
    return role.includes('admin') || role.includes('manager') || role.includes('superadmin');
  }, [user]);

  const isExecutive = useMemo(() => {
    const role = (user?.role || '').toLowerCase();
    return role.includes('executive');
  }, [user]);

  const canViewBuyer = (_buyer: UIBuyer) => canRead;
  const canEditBuyer = (buyer: UIBuyer) => {
    if (!canUpdate) return false;
    if (isAdmin) return true;
    if (isExecutive) return String(buyer.assigned_executive) === String(user?.id);
    return false;
  };
  const canDeleteBuyer = (buyer: UIBuyer) => {
    if (!canDelete) return false;
    if (isAdmin) return true;
    if (isExecutive) return String(buyer.assigned_executive) === String(user?.id);
    return false;
  };

  if (!canRead) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f6f8' }}>
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">Access Denied</div>
            <div className="text-gray-600 text-sm">You do not have permission to view buyers.</div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- UI state ---------------- */
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyers, setSelectedBuyers] = useState<Array<number | string>>([]);
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [currentBuyerView, setCurrentBuyerView] = useState<UIBuyer | null>(null);
  const [showImportBuyers, setShowImportBuyers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<UIBuyer | null>(null);
  const [currentBuyerIndex, setCurrentBuyerIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

  // Column-level search filters
  const [colSearch, setColSearch] = useState({
    buyer: "",
    contact: "",
    business: "",
    assigned: "",
    requirements: "",
    progress: "",
    performance: "",
  });

  // Bulk action states
  const [bulkStage, setBulkStage] = useState<string>('');
  const [bulkPriority, setBulkPriority] = useState<string>('');
  const [bulkAssignee, setBulkAssignee] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  // Executive state
  const [executives, setExecutives] = useState<Executive[]>([{ id: 0, name: "Not assigned", email: "", phone: "" }]);
  const [execsLoading, setExecsLoading] = useState<boolean>(true);
  const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
  const [execSearch, setExecSearch] = useState<string>('');
  const [selectedExecId, setSelectedExecId] = useState<string | number | null>(null);
  const [showUnassignedToExecutives, setShowUnassignedToExecutives] = useState(false);

  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    ignoreDate: false,
    source: 'all',
    stage: 'all',
    priority: 'all',
    assigned: 'all',
    assigned_executive: 'all',
    status: 'all',
    budgetRange: 'all',
    propertyType: 'all',
  });

  const [allBuyers, setAllBuyers] = useState<UIBuyer[]>([]);
  const [roleFilteredBuyers, setRoleFilteredBuyers] = useState<UIBuyer[]>([]);

  // Property Matching Logic
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await propertiesAPI.getProperties();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const publicProperties = list.filter((property: any) =>
          property.is_public === true || property.is_public === 1 ||
          property.isPublic === true || property.public === true
        );
        setProperties(publicProperties ?? []);
      } catch (err) {
        setProperties([]);
      }
    };
    fetchProperties();
  }, []);

  const getBuyerBudget = (buyer: UIBuyer) => {
    const rawMin = Number(buyer?.budget?.min ?? 0);
    const rawMax = Number(buyer?.budget?.max ?? 0);
    const min = Number.isFinite(rawMin) && rawMin > 0 ? rawMin : null;
    const max = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : null;
    return { min, max };
  };

  const isWithinBuyerBudget = (p: any, buyer: UIBuyer) => {
    const { min: bMin, max: bMax } = getBuyerBudget(buyer);
    const hasMin = bMin != null;
    const hasMax = bMax != null;
    if (!hasMin && !hasMax) return false;

    const price = Number(p?.budget ?? p?.price ?? p?.expected_price ?? 0);
    if (!price) return false;
    if (hasMin && price < (bMin as number)) return false;
    if (hasMax && price > (bMax as number)) return false;
    return true;
  };

  const countMatchingProperties = (buyer: UIBuyer) => {
    if (!properties.length) return 0;
    return properties.filter((property) => isWithinBuyerBudget(property, buyer)).length;
  };

  useEffect(() => {
    if (!properties.length || !allBuyers.length) return;
    setAllBuyers(prev => prev.map(b => ({ ...b, matchedPropertiesCount: countMatchingProperties(b) })));
  }, [properties]);

  // Load Executives
  useEffect(() => {
    const loadExecutives = async () => {
      try {
        setExecsLoading(true);
        const formatName = (u: any): string => {
          const salutation = u?.salutation ? `${u.salutation} ` : '';
          const firstName = u?.first_name || u?.firstName || '';
          const lastName = u?.last_name || u?.lastName || '';
          const fullName = `${salutation}${firstName} ${lastName}`.trim();
          if (fullName) return fullName;
          if (u?.name) return u.name;
          if (u?.username) return u.username;
          return 'Sales Executive';
        };

        let executivesList: any[] = [];
        try {
          if (usersAPI.getSalesExecutives) {
            const res = await usersAPI.getSalesExecutives();
            if (res && (Array.isArray(res) || res.items || res.data)) {
              executivesList = Array.isArray(res) ? res : (res.items || res.data || []);
            }
          }
        } catch (err) {}

        if (executivesList.length === 0 && (usersAPI as any).getAll) {
          try {
            const allUsers = await (usersAPI as any).getAll({ is_active: true });
            const usersArray = Array.isArray(allUsers) ? allUsers : (allUsers?.items || allUsers?.data || []);
            if (usersArray.length > 0) {
              executivesList = usersArray.filter((u: any) => {
                const dept = String(u.department || '').toLowerCase();
                const role = String(u.role || '').toLowerCase();
                return (dept.includes('sales') || role.includes('sales')) && (role.includes('executive') || role.includes('sales'));
              });
            }
          } catch (err) {}
        }

        const processedExecutives: Executive[] = executivesList.map((u: any) => ({
          id: Number(u.id) || 0,
          name: formatName(u),
          email: u.email || null,
          phone: u.phone || u.mobile || null,
          username: u.username || null,
          department: u.department || 'Sales',
          role: u.role || 'Sales Executive',
        }));

        const uniqueExecutives = processedExecutives.filter((exec, index, self) =>
          index === self.findIndex(e => String(e.id) === String(exec.id) && e.id !== 0)
        );
        setExecutives(uniqueExecutives.length ? uniqueExecutives : [{ id: 0, name: "Not assigned", email: "", phone: "" }]);
      } catch (error) {
        setExecutives([{ id: 0, name: "Not assigned", email: "", phone: "" }]);
      } finally {
        setExecsLoading(false);
      }
    };
    loadExecutives();
  }, [user]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExecDropdownOpen(false);
      }
    }
    if (execDropdownOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [execDropdownOpen]);

  const filteredExecutives = executives.filter(exec =>
    execSearch.trim() === '' ? true :
      exec.name.toLowerCase().includes(execSearch.toLowerCase()) ||
      (exec.email && exec.email.toLowerCase().includes(execSearch.toLowerCase())) ||
      (exec.phone && exec.phone.includes(execSearch))
  );

  // Masters Loading
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, any>>({});

  const normKey = (s: any) => String(s ?? '').trim().toLowerCase().replace(/[^\w]+/g, '_');
  const normalizeMasterKeys = (obj: any) => {
    const out: Record<string, any> = {};
    Object.entries(obj || {}).forEach(([k, v]) => { out[normKey(k)] = v; });
    return out;
  };

  const getMasterArray = (mastersObj: Record<string, any>, possibleKeys: string[]): any[] => {
    for (const key of possibleKeys) {
      const k = normKey(key);
      if (Array.isArray(mastersObj?.[k]) && mastersObj[k].length) return mastersObj[k];
    }
    return [];
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['lead', 'buyer']);
        setMasters(normalizeMasterKeys(data));
      } catch (err) {
        toast.error('Failed to load dropdown options');
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, []);

  const toOptionLabel = (o: any) => (o?.label ?? o?.name ?? o?.title ?? o?.value ?? o?.key ?? '').toString();
  const toOptionValue = (o: any) => (o?.value ?? o?.key ?? o?.code ?? o?.name ?? '').toString();

  const stageRaw = getMasterArray(masters, ['buyer_lead_stage', 'buyer stage']);
  const priorityRaw = getMasterArray(masters, ['lead_priority', 'lead priority']);

  const stageOptions = stageRaw.map((o) => ({ value: toOptionValue(o), label: toOptionLabel(o) })).filter((o) => o.value);
  const priorityOptions = priorityRaw.map((o) => ({ value: toOptionValue(o).toLowerCase(), label: toOptionLabel(o) })).filter((o) => o.value);

  const stageOptionsFallback = [
    { value: 'initial_contact', label: 'Initial Contact' },
    { value: 'requirement_gathering', label: 'Requirement Gathering' },
    { value: 'property_hunting', label: 'Property Hunting' },
    { value: 'loan_processing', label: 'Loan Processing' },
    { value: 'property_finalization', label: 'Property Finalization' },
    { value: 'deal_closure', label: 'Deal Closure' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptionsFallback = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const effectiveStageOptions = stageOptions?.length ? stageOptions : stageOptionsFallback;
  const effectivePriorityOptions = priorityOptions?.length ? priorityOptions : priorityOptionsFallback;
  const stagesFromMasters: string[] = ['all', ...effectiveStageOptions.map(o => o.value)];
  const prioritiesFromMasters: string[] = ['all', ...effectivePriorityOptions.map(o => o.value)];

  // Helpers
  const formatDate = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatDateTime = (val: string | null) => {
    if (!val) return "Invalid Date";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "Invalid Date";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const toMySQLDate = (val: any) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDOB = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const parseJSON = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return null; }
    }
    return typeof val === 'object' ? val : null;
  };

  const toNumOrNull = (v: any): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const key = (v: any) => String(v ?? '').trim().toLowerCase();
  const stageKey = (v: any) => key(v).replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const priorityKey = (v: any) => key(v);

  const resolveExecutiveName = useCallback((executiveId: string | number | null): { name: string; isCurrentUser: boolean } => {
    if (!executiveId || executiveId === 0) return { name: 'Not assigned', isCurrentUser: false };
    const isCurrentUser = String(executiveId) === String(user?.id);
    if (isCurrentUser) return { name: user?.name || 'You', isCurrentUser: true };
    const exec = executives.find(e => String(e.id) === String(executiveId));
    return exec ? { name: exec.name, isCurrentUser: false } : { name: `Executive (ID: ${executiveId})`, isCurrentUser: false };
  }, [user, executives]);

  const normalizeBuyerForUI = useCallback((b: any): UIBuyer => {
    const rawReq = parseJSON(b.requirements) || b.requirements || {};
    const fin = parseJSON(b.financials) || b.financials || {};
    const toStr = (v: any) => (v === null || v === undefined ? null : String(v));

    const budgetMin = toNumOrNull(b.budget_min ?? b.budgetMin);
    const budgetMax = toNumOrNull(b.budget_max ?? b.budgetMax);
    const createdAt = toMySQLDate(b.created_at ?? null);
    const assignedExecutiveId = b.assigned_executive ?? b.assigned_to ?? null;
    const { name: execName } = resolveExecutiveName(assignedExecutiveId);

    return {
      id: b.id ?? `${b.name ?? 'buyer'}-${Math.random().toString(36).slice(2)}`,
      salutation: b.salutation ?? null,
      name: b.name ?? null,
      phone: b.phone ?? b.mobile ?? null,
      whatsapp: b.whatsapp_number ?? b.whatsapp ?? null,
      email: b.email ?? null,
      dob: toMySQLDate(b.dob ?? null),
      state: b.state ?? null,
      city: b.city ?? null,
      location: b.location ?? null,
      source: b.buyer_lead_source ?? b.source ?? null,
      priority: (b.buyer_lead_priority ?? b.priority ?? null)?.toString().trim().toLowerCase() ?? null,
      is_active: b.is_active !== undefined ? Boolean(b.is_active) : true,
      stage: b.buyer_lead_stage ?? b.stage ?? null,
      status: b.buyer_lead_status ?? b.status ?? null,
      assigned: b.assigned_to ?? b.assigned ?? null,
      assigned_executive: assignedExecutiveId,
      assigned_executive_name: execName !== 'Not assigned' ? execName : null,
      assigned_executive_email: null,
      assigned_executive_phone: null,
      leadScore: toNumOrNull(b.lead_score) ?? toNumOrNull(b.leadScore) ?? 0,
      budget: { min: budgetMin, max: budgetMax },
      expectedClose: toMySQLDate(b.expected_close ?? b.expectedClose ?? null),
      requirements: {
        propertyType: toStr(rawReq.propertyType ?? rawReq.property_type ?? b.propertyType ?? null),
        unitTypes: Array.isArray(rawReq.unitTypes ?? rawReq.unit_types) ? (rawReq.unitTypes ?? rawReq.unit_types).map(toStr) : null,
        preferredLocations: Array.isArray(rawReq.preferredLocations ?? rawReq.preferred_locations) ? (rawReq.preferredLocations ?? rawReq.preferred_locations).map(toStr) : null,
        amenities: Array.isArray(rawReq.amenities) ? rawReq.amenities.map(toStr) : null,
        furnishing: toStr(rawReq.furnishing),
        possession: toStr(rawReq.possession),
        facing: toStr(rawReq.facing),
        floor: toStr(rawReq.floor),
        specialRequirements: rawReq.specialRequirements ?? rawReq.special_requirements ?? null,
      },
      financials: {
        loanRequired: fin.loanRequired ?? fin.loan_required ?? null,
        loanAmount: toNumOrNull(fin.loanAmount ?? fin.loan_amount),
        downPayment: toNumOrNull(fin.downPayment ?? fin.down_payment),
        monthlyIncome: toNumOrNull(fin.monthlyIncome ?? fin.monthly_income),
        bankPreference: fin.bankPreference ?? fin.bank_preference ?? null,
        loanStatus: fin.loanStatus ?? fin.loan_status ?? null,
        creditScore: toNumOrNull(fin.creditScore ?? fin.credit_score),
      },
      matchedProperties: Array.isArray(b.matchedProperties) ? b.matchedProperties : [],
matchedPropertiesCount: b.matchedPropertiesCount ||
  (() => {
    if (properties.length > 0) {
      const tempBuyer = { id: b.id, budget: { min: budgetMin, max: budgetMax } } as UIBuyer;
      return countMatchingProperties(tempBuyer);
    }
    return 0;
  })(),     
   activities: Array.isArray(b.activities) ? b.activities : [],
      followups: Array.isArray(b.followups) ? b.followups : [],
      documents: Array.isArray(b.documents) ? b.documents : [],
      visits: toNumOrNull(b.visits) ?? 0,
      totalVisits: toNumOrNull(b.totalVisits) ?? 0,
      lastActivity: b.lastActivity ?? b.updated_at ?? null,
      created_at: createdAt || new Date().toISOString(),
      notifications: toNumOrNull(b.notifications) ?? 0,
      currentStage: b.currentStage ?? (b.buyer_lead_stage ?? b.stage ?? null),
      stageProgress: toNumOrNull(b.stageProgress) ?? 0,
      dealPotential: b.dealPotential ?? null,
      responseRate: toNumOrNull(b.responseRate) ?? 0,
      avgResponseTime: b.avgResponseTime ?? null,
    };
}, [resolveExecutiveName, properties]);
  const fetchBuyers = useCallback(async () => {
    try {
      setLoading(true);
      const apiBuyers = await buyerAPI.getAll();
      if (!Array.isArray(apiBuyers)) {
        setAllBuyers([]);
        return;
      }
      const normalized = apiBuyers.map(normalizeBuyerForUI);
      const uniqueBuyers = normalized.reduce((acc: UIBuyer[], current: UIBuyer) => {
        const exists = acc.some(buyer => buyer.id === current.id || (buyer.phone && current.phone && buyer.phone === current.phone));
        if (!exists) acc.push(current);
        return acc;
      }, []);
      const sorted = [...uniqueBuyers].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setAllBuyers(sorted);
    } catch (err) {
      toast.error('Failed to fetch buyers');
      setAllBuyers([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeBuyerForUI]);

  useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

  useEffect(() => {
    if (allBuyers.length > 0 && user) {
      const filtered = filterBuyersByRole(user, allBuyers, executives, showUnassignedToExecutives);
      setRoleFilteredBuyers(filtered);
    } else {
      setRoleFilteredBuyers([]);
    }
  }, [allBuyers, user, executives, showUnassignedToExecutives]);

  useEffect(() => {
  const updateBuyersWithExecutiveNames = async () => {
    if (allBuyers.length > 0 && executives.length > 0) {
      const updatedBuyers = allBuyers.map(buyer => {
        if (buyer.assigned_executive) {
          const { name: execName } = resolveExecutiveName(buyer.assigned_executive);
          if (execName !== buyer.assigned_executive_name) {
            return { ...buyer, assigned_executive_name: execName };
          }
        }
        return buyer;
      });
      const hasChanges = updatedBuyers.some((buyer, index) =>
        buyer.assigned_executive_name !== allBuyers[index]?.assigned_executive_name
      );
      if (hasChanges) setAllBuyers(updatedBuyers);
    }
  };
  updateBuyersWithExecutiveNames();
}, [executives, allBuyers, resolveExecutiveName]);
  const tabs = [
    { id: 'all', label: 'All', count: roleFilteredBuyers.length },
    { id: 'hot_leads', label: 'Hot Leads', count: roleFilteredBuyers.filter(b => priorityKey(b.priority) === 'high').length },
    { id: 'active', label: 'Active', count: roleFilteredBuyers.filter(b => b.is_active === true).length },
    { id: 'property_hunting', label: 'Property Hunting', count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'property_hunting').length },
    { id: 'loan_processing', label: 'Loan Processing', count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'loan_processing').length },
    { id: 'ready_to_buy', label: 'Ready to Buy', count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'property_finalization').length }
  ];

  const sources = ['all', 'Website', 'Referral', 'Social Media', 'Advertisement', 'Walk-in', 'Cold Call'];
  const budgetRanges = ['all', '0-50L', '50L-1Cr', '1Cr-2Cr', '2Cr-5Cr', '5Cr+'];
  const propertyTypes = ['all', 'Residential', 'Commercial'];
  const safeStr = (v: any) => (v === null || v === undefined || v === '') ? ' - ' : String(v);
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return ' - ';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredSortedBuyers = roleFilteredBuyers.filter(buyer => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (buyer.name ?? '').toLowerCase().includes(s) ||
      (buyer.phone ?? '').includes(searchTerm) ||
      (buyer.email ?? '').toLowerCase().includes(s) ||
      (buyer.location ?? '').toLowerCase().includes(s) ||
      (buyer.assigned_executive_name ?? '').toLowerCase().includes(s);

    const stg = stageKey(buyer.stage);
    const pri = priorityKey(buyer.priority);

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'hot_leads' && pri === 'high') ||
      (activeTab === 'active' && buyer.is_active === true) ||
      (activeTab === 'property_hunting' && stg === 'property_hunting') ||
      (activeTab === 'loan_processing' && stg === 'loan_processing') ||
      (activeTab === 'ready_to_buy' && stg === 'property_finalization');

    const matchesFilters = (filters.source === 'all' || key(buyer.source) === key(filters.source)) &&
      (filters.stage === 'all' || stg === filters.stage) &&
      (filters.priority === 'all' || pri === filters.priority) &&
      (filters.assigned === 'all' || key(buyer.assigned) === key(filters.assigned)) &&
      (filters.assigned_executive === 'all' || key(buyer.assigned_executive) === key(filters.assigned_executive)) &&
      (filters.status === 'all' || key(buyer.status) === key(filters.status)) &&
      (filters.propertyType === 'all' || key(buyer.requirements?.propertyType) === key(filters.propertyType));

    const created = buyer.created_at ? new Date(buyer.created_at) : null;
    const fromOk = !filters.dateFrom || (created && created >= new Date(filters.dateFrom));
    const toOk = !filters.dateTo || (created && created <= new Date(filters.dateTo));
    const matchesDate = filters.ignoreDate || (fromOk && toOk);

    // Column search
    const cs = colSearch;
    const matchesColSearch = (!cs.buyer || (buyer.name?.toLowerCase().includes(cs.buyer.toLowerCase()) || String(buyer.id).includes(cs.buyer))) &&
      (!cs.contact || (buyer.phone?.includes(cs.contact) || buyer.email?.toLowerCase().includes(cs.contact.toLowerCase()))) &&
      (!cs.business || (buyer.source?.toLowerCase().includes(cs.business.toLowerCase()) || buyer.priority?.toLowerCase().includes(cs.business.toLowerCase()))) &&
      (!cs.assigned || (buyer.assigned_executive_name?.toLowerCase().includes(cs.assigned.toLowerCase()))) &&
      (!cs.requirements || (buyer.requirements?.propertyType?.toLowerCase().includes(cs.requirements.toLowerCase()) || 
        formatCurrency(buyer.budget.min).includes(cs.requirements) || formatCurrency(buyer.budget.max).includes(cs.requirements))) &&
      (!cs.progress || (buyer.stage?.toLowerCase().includes(cs.progress.toLowerCase()))) &&
      (!cs.performance || (String(buyer.matchedPropertiesCount || 0).includes(cs.performance) || 
        String(buyer.activities?.length || 0).includes(cs.performance)));

    return matchesSearch && matchesTab && matchesFilters && matchesDate && matchesColSearch;
  }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  useEffect(() => { setCurrentPage(1); }, [filters, searchTerm, activeTab, colSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedBuyers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuyers = filteredSortedBuyers.slice(startIndex, startIndex + itemsPerPage);

  const handleAddBuyer = () => { setEditingBuyer(null); setShowBuyerForm(true); };
  const handleEditBuyer = (buyer: UIBuyer) => {
    if (!canEditBuyer(buyer)) { toast.error('You do not have permission to edit this buyer'); return; }
    setEditingBuyer(buyer); setShowBuyerForm(true);
  };
  const handleViewBuyer = (buyer: UIBuyer) => {
    if (!canViewBuyer(buyer)) { toast.error('You do not have permission to view this buyer'); return; }
    const index = filteredSortedBuyers.findIndex(b => b.id === buyer.id);
    setCurrentBuyerIndex(index >= 0 ? index : 0);
    setCurrentBuyerView(buyer);
  };
  const handleBuyerAccount = (buyer: UIBuyer) => {
    if (!canViewBuyer(buyer)) { toast.error('You do not have permission to view this buyer account'); return; }
    navigate(`/dashboard/buyers-account/${buyer.id}`);
  };
  const handleBackToList = () => { setCurrentBuyerView(null); setCurrentBuyerIndex(0); setShowBuyerForm(false); };

  // Updated Delete Buyer with SweetAlert
  const handleDeleteBuyer = async (buyerId: number | string, buyerName?: string) => {
    const buyer = allBuyers.find(b => b.id === buyerId);
    if (!buyer) return;
    if (!canDeleteBuyer(buyer)) {
      toast.error('You do not have permission to delete this buyer');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete buyer "${buyerName || buyer.name || 'this buyer'}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
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
      await buyerAPI.delete(String(buyerId));
      setAllBuyers(prev => prev.filter(b => b.id !== buyerId));
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Buyer has been deleted successfully.',
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
    } catch (err) {
      toast.error('Failed to delete buyer. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete buyer. Please try again.',
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

  const handleSaveBuyer = async (response: any) => {
    try {
      if (!response) throw new Error('No response received from server');
      const normalizedBuyer = normalizeBuyerForUI({ ...response, assigned_executive: response.assigned_executive ?? user?.id ?? null });
      if (editingBuyer) {
        setAllBuyers(prev => prev.map(b => b.id === editingBuyer.id ? normalizedBuyer : b));
        toast.success('Buyer updated successfully');
      } else {
        setAllBuyers(prev => [normalizedBuyer, ...prev]);
        toast.success('Buyer created successfully');
      }
      setShowBuyerForm(false);
      setEditingBuyer(null);
      setCurrentPage(1);
      setTimeout(() => { if (tableScrollRef.current) tableScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save buyer');
      fetchBuyers();
    }
  };

  const handleBuyerSelection = (buyerId: number | string) => {
    const buyer = roleFilteredBuyers.find(b => b.id === buyerId);
    if (!buyer || !canViewBuyer(buyer)) { toast.error('You do not have permission to select this buyer'); return; }
    setSelectedBuyers(prev => prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]);
  };

  const handleSelectAll = () => {
    const selectableBuyers = paginatedBuyers.filter(b => {
      if (isAdmin) return true;
      if (isExecutive) return String(b.assigned_executive) === String(user?.id);
      return false;
    });
    if (selectedBuyers.length === selectableBuyers.length && selectableBuyers.length > 0) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(selectableBuyers.map(b => b.id));
    }
  };

  const handleNextBuyer = () => {
    if (currentBuyerIndex < filteredSortedBuyers.length - 1) {
      const nextIndex = currentBuyerIndex + 1;
      setCurrentBuyerIndex(nextIndex);
      setCurrentBuyerView(filteredSortedBuyers[nextIndex]);
    }
  };

  const handlePreviousBuyer = () => {
    if (currentBuyerIndex > 0) {
      const prevIndex = currentBuyerIndex - 1;
      setCurrentBuyerIndex(prevIndex);
      setCurrentBuyerView(filteredSortedBuyers[prevIndex]);
    }
  };

  const handleAssignExecutive = async (executiveId: string | number | null) => {
    if (selectedBuyers.length === 0) { toast.info('Please select buyers to assign executive'); return; }
    if (!canAssign) { toast.error('You do not have permission to assign executives'); return; }
    if (user?.role?.toLowerCase().includes('executive') && executiveId !== 0 && String(executiveId) !== String(user.id)) {
      toast.error("You can only assign buyers to yourself");
      return;
    }

    try {
      const buyerIds = selectedBuyers.map(id => String(id));
      const apiExecutiveId = executiveId === 0 ? null : executiveId;
      const result = await buyerAPI.bulkAssignExecutive(buyerIds, apiExecutiveId, false);
      if (result.success) {
        const executive = executives.find(exec => exec.id == executiveId);
        const execName = executive ? executive.name : 'Not assigned';
        setAllBuyers(prev => prev.map(buyer => selectedBuyers.includes(buyer.id) ? { ...buyer, assigned_executive: apiExecutiveId, assigned_executive_name: execName !== 'Not assigned' ? execName : null } : buyer));
        setSelectedBuyers([]);
        setSelectedExecId(null);
        setExecDropdownOpen(false);
        toast.success(`Executive assigned to ${selectedBuyers.length} buyer(s) successfully`);
      } else {
        toast.error(result.message || 'Failed to assign executive');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign executive');
    }
  };

  // Updated Bulk Delete with SweetAlert
  const handleBulkDelete = async () => {
    if (selectedBuyers.length === 0) {
      toast.info('⚠️ No buyers selected for deletion.');
      return;
    }

    const buyersToDelete = allBuyers.filter(b => selectedBuyers.includes(b.id));
    const unauthorizedBuyers = buyersToDelete.filter(b => !canDeleteBuyer(b));
    if (unauthorizedBuyers.length > 0) {
      toast.error(`You do not have permission to delete ${unauthorizedBuyers.length} buyer(s)`);
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedBuyers.length} buyer(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, delete ${selectedBuyers.length} buyer(s)!`,
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
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

    const ids = selectedBuyers.map(id => String(id));
    const prevBuyers = allBuyers;
    try {
      setBulkDeleting(true);
      setAllBuyers(prev => prev.filter(b => !ids.includes(String(b.id))));
      setSelectedBuyers([]);
      await buyerAPI.bulkDelete(ids, false);
      
      Swal.fire({
        title: 'Deleted!',
        text: `${ids.length} buyer(s) have been deleted successfully.`,
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
    } catch (err) {
      setAllBuyers(prevBuyers);
      toast.error('❌ Failed to delete buyers. Try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete buyers. Please try again.',
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
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkUpdateLeadField = async (field: string, value: any, onlyEmpty: boolean = false) => {
    if (selectedBuyers.length === 0) { toast.info('Please select buyers to update'); return; }
    if (!canUpdate) { toast.error('You do not have permission to update buyers'); return; }
    const buyersToUpdate = allBuyers.filter(b => selectedBuyers.includes(b.id));
    const unauthorizedBuyers = buyersToUpdate.filter(b => !canEditBuyer(b));
    if (unauthorizedBuyers.length > 0) { toast.error(`You do not have permission to update ${unauthorizedBuyers.length} buyer(s)`); return; }

    try {
      const buyerIds = selectedBuyers.map(id => String(id));
      const result = await buyerAPI.bulkUpdateLeadField(buyerIds, field, value, onlyEmpty);
      if (result.success) {
        setAllBuyers(prev => prev.map(buyer => {
          if (!selectedBuyers.includes(buyer.id)) return buyer;
          const updatedBuyer = { ...buyer };
          if (field === 'buyer_lead_stage') { updatedBuyer.stage = value; updatedBuyer.currentStage = value; }
          else if (field === 'buyer_lead_status') updatedBuyer.status = value;
          else if (field === 'buyer_lead_priority') updatedBuyer.priority = value;
          else if (field === 'is_active') updatedBuyer.is_active = !!Number(value);
          return updatedBuyer;
        }));
        setSelectedBuyers([]);
        toast.success('Field updated successfully');
      } else {
        toast.error(result.message || 'Failed to update field');
      }
    } catch (err) {
      toast.error('Failed to update field');
    }
  };

  const exportToCSV = (mode: 'filtered' | 'selected' | 'all' = 'filtered') => {
    let source: UIBuyer[] = [];
    if (mode === 'selected') {
      source = roleFilteredBuyers.filter(b => selectedBuyers.includes(b.id));
      if (selectedBuyers.length === 0) { toast.info('No buyers selected to export.'); return; }
    } else if (mode === 'filtered') {
      source = filteredSortedBuyers;
      if (!source || source.length === 0) { toast.info('No buyers found in current view to export.'); return; }
    } else {
      source = roleFilteredBuyers;
      if (!source || source.length === 0) { toast.info('No buyers available to export.'); return; }
    }

    const columns = [
      'ID', 'Name', 'Phone', 'Email', 'City', 'State', 'Location', 'Source', 'Priority', 'Stage',
      'Assigned To', 'Executive Name', 'Lead Score', 'Budget Min', 'Budget Max', 'Property Matches', 'Created At'
    ];
    const rows = source.map(b => [
      b.id, b.name, b.phone, b.email, b.city, b.state, b.location, b.source, b.priority, b.stage,
      b.assigned, b.assigned_executive_name, b.leadScore, b.budget?.min ?? '', b.budget?.max ?? '',
      b.matchedPropertiesCount ?? 0, b.created_at ? new Date(b.created_at).toISOString() : ''
    ]);
    const csv = [columns, ...rows].map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyers_${mode}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported CSV successfully');
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '', dateTo: '', ignoreDate: false, source: 'all', stage: 'all', priority: 'all',
      assigned: 'all', assigned_executive: 'all', status: 'all', budgetRange: 'all', propertyType: 'all',
    });
    setColSearch({ buyer: "", contact: "", business: "", assigned: "", requirements: "", progress: "", performance: "" });
    setSearchTerm('');
    setActiveTab('all');
  };

  const getColSpan = () => {
    let colSpan = 8;
    if (canUpdate || canDelete || canAssign || canBulkDelete) colSpan += 1;
    if (shouldShowActionsColumn) colSpan += 1;
    return colSpan;
  };

  const assignableExecutives = useMemo(() => executives.filter(e => e.id !== 0).map(e => ({ id: String(e.id), name: e.name })), [executives]);

  const getInitials = (name: string | null) => {
    if (!name) return 'B';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (currentBuyerView) {
    return (
      <div className="buyers-page">
        <BuyerViewPage
          buyer={currentBuyerView}
          onBack={handleBackToList}
          onEdit={handleEditBuyer}
          onAccount={handleBuyerAccount}
          onNext={handleNextBuyer}
          onPrevious={handlePreviousBuyer}
          currentIndex={currentBuyerIndex}
          totalBuyers={filteredSortedBuyers.length}
          onUpdateBuyer={(updatedBuyer: UIBuyer) => {
            setAllBuyers(prev => {
              const next = prev.map(b => (b.id === updatedBuyer.id ? updatedBuyer : b));
              return next.sort((a, b) => new Date(b.created_at || b.lastActivity || 0).getTime() - new Date(a.created_at || a.lastActivity || 0).getTime());
            });
            setCurrentBuyerView(updatedBuyer);
          }}
        />
        {showBuyerForm && <BuyerFormModal isOpen={showBuyerForm} buyer={editingBuyer} onClose={() => setShowBuyerForm(false)} onSave={handleSaveBuyer} />}
        {showImportBuyers && <ImportBuyersLeadsModal isOpen={showImportBuyers} onClose={() => setShowImportBuyers(false)} />}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f6f8' }}>
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-0 sm:py-6">
        {/* TABS ROW */}
        <div className="hidden sm:flex items-center justify-between gap-3 mb-3">
          <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
            <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-xl">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    style={isActive ? { color: RESALE.orange } : {}}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? `bg-orange-100 text-orange-600` : 'bg-gray-200 text-gray-600'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowFilters(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <SlidersHorizontal size={14} /><span>Filters</span>
            </button>
            {canExport && <button onClick={() => exportToCSV('filtered')} className="flex items-center gap-1.5 px-3 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50"><Download size={14} /><span>Export</span></button>}
            {canImport && <button onClick={() => setShowImportBuyers(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50"><Upload size={14} /><span>Import</span></button>}
            {canCreate && <button onClick={handleAddBuyer} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: RESALE.orange }}><Plus size={14} /><span>Add Buyer</span></button>}
          </div>
        </div>

        {/* MOBILE TABS */}
        <div className="flex sm:hidden items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 ml-auto mt-2">
            <button onClick={() => setShowFilters(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"><SlidersHorizontal size={13} /><span>Filters</span></button>
            {canExport && <button onClick={() => exportToCSV('filtered')} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"><Download size={13} /><span>Export</span></button>}
            {canImport && <button onClick={() => setShowImportBuyers(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"><Upload size={13} /><span>Import</span></button>}
            {canCreate && <button onClick={handleAddBuyer} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: RESALE.orange }}><Plus size={13} /><span>Add Buyer</span></button>}
          </div>
        </div>

        <div className="flex sm:hidden items-center gap-2 mb-3">
          <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
            <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-xl">
              {tabs.slice(0, 4).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${isActive ? 'bg-white shadow-sm' : 'text-gray-500'}`} style={isActive ? { color: RESALE.orange } : {}}>
                    <span>{tab.label}</span>
                    <span className={`px-1 py-0.5 rounded-full text-[10px] font-semibold ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'}`}>{tab.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))} className="flex-shrink-0 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/pg</option>)}
          </select>
        </div>

        {/* BULK ACTION BAR */}
        {selectedBuyers.length > 0 && (canUpdate || canAssign || canBulkDelete) && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm flex flex-col gap-2 sm:flex-wrap sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-nowrap overflow-x-auto">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ color: RESALE.orange, backgroundColor: `${RESALE.orange}15`, borderColor: `${RESALE.orange}40` }}>
                Selected: {selectedBuyers.length}
              </span>
              {canUpdate && (
                <>
                  <select value={bulkStage} onChange={(e) => setBulkStage(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white">
                    <option value="">Update Stage...</option>
                    {effectiveStageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => { if (bulkStage) { handleBulkUpdateLeadField('buyer_lead_stage', bulkStage); setBulkStage(''); } }} disabled={bulkLoading || !bulkStage} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                  <select value={bulkPriority} onChange={(e) => setBulkPriority(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white">
                    <option value="">Update Priority...</option>
                    {effectivePriorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => { if (bulkPriority) { handleBulkUpdateLeadField('buyer_lead_priority', bulkPriority); setBulkPriority(''); } }} disabled={bulkLoading || !bulkPriority} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                </>
              )}
              {canBulkDelete && <button onClick={handleBulkDelete} disabled={bulkLoading || selectedBuyers.length === 0} className="sm:hidden px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg">Delete</button>}
              <div className="hidden sm:block h-5 w-px bg-gray-200" />
              {canAssign && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Assign:</span>
                  <select value={bulkAssignee} onChange={(e) => setBulkAssignee(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[130px]">
                    <option value="">Assign...</option>
                    <option value="Unassigned">Unassign</option>
                    {assignableExecutives.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button onClick={() => { if (bulkAssignee) { const execId = bulkAssignee === 'Unassigned' ? null : bulkAssignee; handleAssignExecutive(execId); setBulkAssignee(''); } }} disabled={bulkLoading || !bulkAssignee} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:hidden">
              {canAssign && (
                <div className="flex items-center gap-1.5">
                  <select value={bulkAssignee} onChange={(e) => setBulkAssignee(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[120px]">
                    <option value="">Assign...</option>
                    <option value="Unassigned">Unassign</option>
                    {assignableExecutives.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button onClick={() => { if (bulkAssignee) { const execId = bulkAssignee === 'Unassigned' ? null : bulkAssignee; handleAssignExecutive(execId); setBulkAssignee(''); } }} disabled={bulkLoading || !bulkAssignee} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                </div>
              )}
              <button onClick={() => setSelectedBuyers([])} className="ml-auto px-3 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg">Clear</button>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 ml-auto">
              {canUpdate && (
                <>
                  <button onClick={() => handleBulkUpdateLeadField('is_active', 1)} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Mark Active</button>
                  <button onClick={() => handleBulkUpdateLeadField('is_active', 0)} className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700">Mark Inactive</button>
                </>
              )}
              {canBulkDelete && <button onClick={handleBulkDelete} disabled={bulkLoading || selectedBuyers.length === 0} className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50">Delete ({selectedBuyers.length})</button>}
              <button onClick={() => setSelectedBuyers([])} className="px-3 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">Clear</button>
            </div>
          </div>
        )}

        {selectedBuyers.length === 0 && (
          <div className="hidden sm:flex justify-end mb-3">
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search buyers by name, phone, email, location..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" />
          </div>
        </div>

        {/* MAIN TABLE */}
<div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden h-full">  {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <>
              {isExecutive && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2"><AlertCircle size={12} /><span>You are viewing buyers assigned to you only{showUnassignedToExecutives && <span className="text-blue-600"> (including unassigned)</span>}</span></div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px]"><input type="checkbox" checked={showUnassignedToExecutives} onChange={(e) => setShowUnassignedToExecutives(e.target.checked)} className="rounded" /> Show unassigned</label>
                    <span>Total: <span className="font-bold">{filteredSortedBuyers.length}</span> buyers</span>
                  </div>
                </div>
              )}

<div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 310px)', overflowX: 'auto' }}>   <table className="w-full text-sm" style={{ minWidth: '1200px' }}>   
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {(canUpdate || canDelete || canAssign || canBulkDelete) && <th className="px-3 py-3 text-left w-8"><input type="checkbox" checked={selectedBuyers.length === paginatedBuyers.length && paginatedBuyers.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" /></th>}
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">BUYER DETAILS</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">CONTACT & LOCATION</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">BUSINESS INFO</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ASSIGNED TO</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">REQUIREMENTS & BUDGET</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">PROGRESS & ACTIVITY</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">PERFORMANCE</th>
                      {shouldShowActionsColumn && <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>}
                    </tr>
                    {/* Column Search Row */}
                    <tr className="bg-gray-100">
                      {(canUpdate || canDelete || canAssign || canBulkDelete) && <th className="px-3 py-1.5"></th>}
                      <th className="px-2 py-1.5"><input type="text" placeholder="Search buyer..." value={colSearch.buyer} onChange={e => setColSearch(p => ({ ...p, buyer: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" /></th>
                      <th className="px-2 py-1.5"><input type="text" placeholder="Search contact..." value={colSearch.contact} onChange={e => setColSearch(p => ({ ...p, contact: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" /></th>
                      <th className="px-2 py-1.5"><input type="text" placeholder="Search source/priority..." value={colSearch.business} onChange={e => setColSearch(p => ({ ...p, business: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" /></th>
                      <th className="px-2 py-1.5"><input type="text" placeholder="Search assigned..." value={colSearch.assigned} onChange={e => setColSearch(p => ({ ...p, assigned: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" /></th>
                      <th className="px-2 py-1.5"><input type="text" placeholder="Search requirements..." value={colSearch.requirements} onChange={e => setColSearch(p => ({ ...p, requirements: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" /></th>
                      <th className="px-2 py-1.5"><input type="text" placeholder="Search stage..." value={colSearch.progress} onChange={e => setColSearch(p => ({ ...p, progress: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" /></th>
                      <th className="px-2 py-1.5"><input type="text" placeholder="Search matches/activities..." value={colSearch.performance} onChange={e => setColSearch(p => ({ ...p, performance: e.target.value }))} className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white" /></th>
                      {shouldShowActionsColumn && <th className="px-2 py-1.5"></th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedBuyers.map((buyer) => {
                      const { name: execName, isCurrentUser } = resolveExecutiveName(buyer.assigned_executive);
                      const initials = getInitials(buyer.name);
                      return (
                        <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                          {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                            <td className="px-3 py-3"><input type="checkbox" checked={selectedBuyers.includes(buyer.id)} onChange={() => handleBuyerSelection(buyer.id)} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" /></td>
                          )}
                          {/* Buyer Details */}
                          <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: RESALE.orange }}>
    {initials}
  </div>
  <div className="min-w-0">
    <button onClick={() => handleViewBuyer(buyer)} className="font-semibold text-gray-900 text-xs sm:text-sm hover:text-orange-500 text-left leading-tight">
      {buyer.salutation && `${buyer.salutation} `}{buyer.name || 'Unknown'}
    </button>
    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
      <span className="text-[9px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded">ID: {String(buyer.id).slice(0,6)}</span>
      {getStatusBadge(buyer.is_active)}
    </div>
  </div>
</div>
                          </td>
                          {/* Contact & Location */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /><a href={`tel:${buyer.phone}`} className="text-xs text-gray-700 hover:text-orange-500">{safeStr(buyer.phone)}</a></div>
                              <div className="flex items-center gap-1"><Mail size={12} className="text-gray-400" /><a href={`mailto:${buyer.email}`} className="text-xs text-gray-600 hover:text-orange-500 truncate max-w-32">{safeStr(buyer.email)}</a></div>
                              {buyer.whatsapp && <div className="flex items-center gap-1"><SiWhatsapp size={12} className="text-green-500" /><a href={`https://wa.me/${buyer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-green-600">{buyer.whatsapp.replace(/\D/g, '')}</a></div>}
                              <div className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /><span className="text-xs text-gray-600">{safeStr(buyer.location)}{buyer.city ? `, ${buyer.city}` : ''}</span></div>
                            </div>
                          </td>
                          {/* Business Info */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div className="text-xs"><span className="text-gray-500">Source:</span> <span className="font-medium text-blue-700">{buyer.source || 'Not specified'}</span></div>
                              <div>{getPriorityBadge(buyer.priority)}</div>
                              {buyer.created_at && <div className="flex items-center gap-1 text-xs text-gray-500"><Clock size={11} /><span>{formatDateTime(buyer.created_at)}</span></div>}
                            </div>
                          </td>
                          {/* Assigned To */}
                          <td className="px-3 py-3">
                            {buyer.assigned_executive ? (
                              <div className="flex items-center gap-1">
                                <UserCheck size={12} className={isCurrentUser ? "text-green-500" : "text-blue-500"} />
                                <span className={`text-xs font-medium ${isCurrentUser ? "text-green-700" : "text-blue-700"}`}>{execName}</span>
                                {isCurrentUser && <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded">You</span>}
                              </div>
                            ) : <span className="text-xs text-gray-400 italic">Not assigned</span>}
                          </td>
                          {/* Requirements & Budget */}
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <div className="text-xs"><span className="text-gray-500">Property:</span> <span className="font-medium">{buyer.requirements?.propertyType || '—'}</span></div>
                              <div className="text-xs"><span className="text-gray-500">Types:</span> <span className="text-gray-600">{safeStr(buyer.requirements?.unitTypes)}</span></div>
                              <div className="text-xs"><span className="text-gray-500">Budget:</span> <span className="font-medium text-green-600 ml-1">{formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}</span></div>
                            </div>
                          </td>
                          {/* Progress & Activity */}
                          <td className="px-3 py-3">
                            <div className="space-y-2">
                              {getStageBadge(buyer.stage)}
                              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="rounded-full transition-all" style={{ width: `${buyer.stageProgress || 0}%`, backgroundColor: RESALE.orange }} /></div>
                              <div className="text-xs text-gray-500">Last: {formatDate(buyer.lastActivity)}</div>
                            </div>
                          </td>
                          {/* Performance */}
                          <td className="px-3 py-3">
                        <div className="space-y-1">
                           <div className="flex items-center space-x-2 text-xs">
                            <Target size={10} className="text-green-500" />
                            <span className={`font-medium ${(buyer.matchedPropertiesCount || 0) > 0
                              ? 'text-green-600'
                              : 'text-gray-500'
                              }`}>
                              {buyer.matchedPropertiesCount || 0} matches
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <Activity size={10} className="text-green-500" />
                            <span>{buyer.activities?.length ?? 0} activities</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <Eye size={10} className="text-purple-500" />
                            <span>{buyer.visits ?? 0} visits</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <TrendingUp size={10} className="text-orange-500" />
                            <span>{buyer.responseRate ? `${buyer.responseRate}% response` : ' - '}</span>
                          </div>
                          {buyer.notifications > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <Bell size={10} className="text-red-500" />
                              <span className="text-red-600 font-medium">{buyer.notifications}</span>
                            </div>
                          )}
                        </div>
                      </td>

                          {/* Actions */}
                          {shouldShowActionsColumn && (
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleViewBuyer(buyer)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="View"><Eye size={14} /></button>
                                <button onClick={() => handleBuyerAccount(buyer)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg" title="Account"><UserCheck size={14} /></button>
                                {canEditBuyer(buyer) && <button onClick={() => handleEditBuyer(buyer)} className="p-1.5 text-orange-500 hover:bg-orange-100 rounded-lg" title="Edit"><Edit size={14} /></button>}
                                <div className="relative group">
                                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><MoreHorizontal size={14} /></button>
                                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[140px]">
                                    <div className="p-1">
                                      <button className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full"><PhoneCall size={12} /><span>Call</span></button>
                                      <button className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full"><MessageCircle size={12} /><span>WhatsApp</span></button>
                                      <button className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full"><Send size={12} /><span>Email</span></button>
                                      <button className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full"><Home size={12} /><span>Send Properties</span></button>
                                      {canDeleteBuyer(buyer) && <button onClick={() => handleDeleteBuyer(buyer.id, buyer.name || undefined)} className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full"><Trash2 size={12} /><span>Delete</span></button>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {paginatedBuyers.length === 0 && (
                      <tr><td colSpan={getColSpan()} className="px-3 py-8 text-center text-sm text-gray-500">No buyers found. Try adjusting your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredSortedBuyers.length > 0 && (
<div className="px-4 py-3 border-t border-gray-100 flex flex-row items-center justify-between bg-white">                  <div className="text-xs text-gray-500">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSortedBuyers.length)} of {filteredSortedBuyers.length} buyers</div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <BuyerSidebarFilter isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} setFilters={setFilters} resetFilters={resetFilters} sources={sources} stages={stagesFromMasters} priorities={prioritiesFromMasters} budgetRanges={budgetRanges} propertyTypes={propertyTypes} executives={executives.map(e => ({ id: e.id, name: e.name }))} />
      <BuyerFormModal isOpen={showBuyerForm} onClose={() => { setShowBuyerForm(false); setEditingBuyer(null); }} buyer={editingBuyer} onSave={handleSaveBuyer} />
      <ImportBuyersLeadsModal isOpen={showImportBuyers} onClose={() => setShowImportBuyers(false)} />
    </div>
  );
};

// UI helper functions
function getStatusBadge(is_active: boolean | null) {
  if (is_active === true) return <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-emerald-100 text-emerald-700">● Active</span>;
  if (is_active === false) return <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600">● Inactive</span>;
  return <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600">–</span>;
}

function getLeadScore(score: number) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
  return <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full ${score > 0 ? bgColor : 'bg-gray-100'} ${score > 0 ? color : 'text-gray-600'} text-[10px]`}><Star size={10} className="mr-0.5" /><span className="font-bold">{score > 0 ? score : '-'}</span></div>;
}

function getStageBadge(stageOrBuyer: string | any) {
  const raw = typeof stageOrBuyer === 'string' ? stageOrBuyer : stageOrBuyer?.buyer_lead_stage ?? stageOrBuyer?.stage ?? '';
  const stageConfig: Record<string, any> = {
    initial_contact: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact', icon: '📞' },
    requirement_gathering: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Requirement Gathering', icon: '📋' },
    property_hunting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Property Hunting', icon: '🔍' },
    loan_processing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Loan Processing', icon: '🏦' },
    property_finalization: { bg: 'bg-green-100', text: 'text-green-700', label: 'Property Finalization', icon: '✅' },
    deal_closure: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Deal Closure', icon: '🤝' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: '🎉' },
  };
  const keyS = raw.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const config = stageConfig[keyS] || stageConfig.initial_contact;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}><span className="mr-1 text-xs">{config.icon}</span><span className="text-[10px] font-normal">{config.label}</span></span>;
}

function getPriorityBadge(priority: string | null | undefined) {
  const raw = (priority ?? '').toString().trim().toLowerCase();
  const priorityConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High', icon: '🔥' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: '⚡' },
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low', icon: '🌱' },
  };
  const config = priorityConfig[raw] || { bg: 'bg-gray-100', text: 'text-gray-700', label: raw || '-', icon: '' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.icon} {config.label}</span>;
}

export default BuyersPage;