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
  UserX,
  UserPlus,
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
  department?: string;
  role?: string;
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

const UNASSIGNED_EXEC: Executive = { id: 0, name: "Not assigned", email: "", phone: "" };

// ✅ FIXED: Role-based seller filtering function
const filterSellersByRole = (
  user: any,
  sellers: UISeller[],
  includeUnassigned: boolean = false
): UISeller[] => {
  if (!user || !sellers || sellers.length === 0) return [];

  const userRole = (user.role || '').toLowerCase();
  const userDept = (user.department || '').toLowerCase();
  const userId = String(user.id || '');

  // Admin, Manager, SuperAdmin को सभी sellers दिखाएँ
  const isAdmin = userRole.includes('admin') || userRole.includes('manager');
  const isSuperUser = userRole.includes('superadmin') || userRole.includes('owner');

  if (isAdmin || isSuperUser) {
    return sellers;
  }

  // Sales Executive के लिए - केवल अपने assigned sellers
  const isExecutive =
    userRole.includes('executive') ||
    userDept.includes('sales') ||
    userDept.includes('presales');

  if (isExecutive) {
    return sellers.filter(seller => {
      const assignedExecId = String(seller.assigned_to || '');

      // केवल अपने assigned sellers
      return assignedExecId === userId;
    });
  }

  // Default: no access
  return [];
};

// ✅ FIXED: Check if user can view/edit/delete specific seller
const canViewSeller = (user: any, seller: UISeller): boolean => {
  if (!user) return false;

  const userRole = (user.role || '').toLowerCase();
  const userId = String(user.id || '');

  // Admin/Manager/SuperAdmin can view all
  if (userRole.includes('admin') || userRole.includes('manager') || userRole.includes('superadmin')) {
    return true;
  }

  // Executive can only view their assigned sellers
  if (userRole.includes('executive')) {
    const assignedExecId = String(seller.assigned_to || '');
    return assignedExecId === userId;
  }

  return false;
};

const canEditSeller = (user: any, seller: UISeller): boolean => {
  if (!user) return false;

  const userRole = (user.role || '').toLowerCase();
  const userId = String(user.id || '');

  // Admin/Manager/SuperAdmin can edit all
  if (userRole.includes('admin') || userRole.includes('manager') || userRole.includes('superadmin')) {
    return true;
  }

  // Executive can only edit their assigned sellers
  if (userRole.includes('executive')) {
    const assignedExecId = String(seller.assigned_to || '');
    return assignedExecId === userId;
  }

  return false;
};

const canDeleteSeller = (user: any, seller: UISeller): boolean => {
  if (!user) return false;

  const userRole = (user.role || '').toLowerCase();
  const userId = String(user.id || '');

  // Admin/Manager/SuperAdmin can delete all
  if (userRole.includes('admin') || userRole.includes('manager') || userRole.includes('superadmin')) {
    return true;
  }

  // Executive can only delete their assigned sellers
  if (userRole.includes('executive')) {
    const assignedExecId = String(seller.assigned_to || '');
    return assignedExecId === userId;
  }

  return false;
};

// ✅ Updated getAssignableExecutives for sellers
const getAssignableExecutives = (currentUser: any, executives: any[]): any[] => {
  if (!currentUser) return executives;

  console.log('=== getAssignableExecutives DEBUG ===');
  console.log('Current User Role:', currentUser?.role);
  console.log('Current User ID:', currentUser?.id);
  console.log('Available Executives:', executives);

  // If no executives provided, return empty array
  if (!executives || executives.length === 0) return [];

  // Always include unassigned executive
  const result = [UNASSIGNED_EXEC];

  // If user is admin/superadmin, return all executives
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    console.log('Admin user - returning all executives');
    return [UNASSIGNED_EXEC, ...executives.filter(exec => exec.id !== 0)];
  }

  // If user is a manager, return executives from their department
  if (currentUser.role === 'manager') {
    const departmentExecs = executives.filter(exec =>
      exec.department === currentUser.department && exec.id !== 0
    );
    console.log('Manager user - returning department executives:', departmentExecs);
    return [UNASSIGNED_EXEC, ...departmentExecs];
  }

  // For executive users - return only themselves + unassigned
  const currentUserId = currentUser.id?.toString();
  const selfExec = executives.find(exec =>
    exec.id?.toString() === currentUserId ||
    exec.userId?.toString() === currentUserId ||
    exec._id?.toString() === currentUserId
  );

  console.log('Executive user - self found:', selfExec);

  if (selfExec && selfExec.id !== 0) {
    result.push(selfExec);
  }

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
  const [allSellers, setAllSellers] = useState<UISeller[]>([]); // ✅ All sellers from API
  const [roleFilteredSellers, setRoleFilteredSellers] = useState<UISeller[]>([]); // ✅ Role-filtered sellers
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ✅ FIXED: Executive state with proper initialization
  const [executives, setExecutives] = useState<Executive[]>([UNASSIGNED_EXEC]);
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

  // ✅ Fetch all sellers
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const apiSellers = await sellerAPI.getAll();

        const normalized = Array.isArray(apiSellers)
          ? apiSellers.map(mapApiSellerToUI)
          : [];
        setAllSellers(normalized);
      } catch (err) {
        console.error("Error fetching sellers:", err);
        setAllSellers([]);
        setErrMsg("Failed to load sellers");
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // ✅ Apply role-based filtering when sellers or user changes
  useEffect(() => {
    if (allSellers.length > 0 && user) {
      const filtered = filterSellersByRole(user, allSellers);
      setRoleFilteredSellers(filtered);
    } else {
      setRoleFilteredSellers([]);
    }
  }, [allSellers, user]);

  // ✅ FIXED: Load executives with multiple fallback methods
  useEffect(() => {
    const loadExecutives = async () => {
      try {
        setExecsLoading(true);
        console.log('🔄 Loading executives for sellers...');

        // Helper to format name
        const formatName = (u: any): string => {
          const salutation = u?.salutation ? `${u.salutation} ` : '';
          const firstName = u?.first_name || u?.firstName || '';
          const lastName = u?.last_name || u?.lastName || '';
          const fullName = `${salutation}${firstName} ${lastName}`.trim();

          if (fullName) return fullName;
          if (u?.name) return u.name;
          if (u?.full_name) return u.full_name;
          if (u?.username) return u.username;
          if (u?.email) return u.email.split('@')[0];
          return 'Sales Executive';
        };

        let executivesList: any[] = [];

        // METHOD 1: Try getSalesExecutives if available
        try {
          if (usersAPI.getSalesExecutives) {
            const res = await usersAPI.getSalesExecutives();
            if (res && (Array.isArray(res) || res.items || res.data)) {
              executivesList = Array.isArray(res) ? res : (res.items || res.data || []);
              console.log('✅ Found via getSalesExecutives:', executivesList.length);
            }
          }
        } catch (err) {
          console.log('getSalesExecutives failed, trying next method...');
        }

        // METHOD 2: Try getByDeptRole
        if (executivesList.length === 0 && usersAPI.getByDeptRole) {
          const paramCombinations = [
            { department: "Sales", role: "Sales Executive" },
            { department: "sales", role: "sales executive" },
            { department: "Sales", role: "Executive" },
            { department: "sales", role: "executive" }
          ];

          for (const params of paramCombinations) {
            try {
              const res = await usersAPI.getByDeptRole({
                ...params,
                is_active: 1,
                limit: 100
              });

              if (res && (Array.isArray(res) || res.items || res.data)) {
                const data = Array.isArray(res) ? res : (res.items || res.data || []);
                if (data.length > 0) {
                  executivesList = data;
                  console.log(`✅ Found via getByDeptRole (${params.department}/${params.role}):`, data.length);
                  break;
                }
              }
            } catch (err) {
              continue;
            }
          }
        }

        // METHOD 3: Try getAll users and filter
        if (executivesList.length === 0 && (usersAPI as any).getAll) {
          try {
            const allUsers = await (usersAPI as any).getAll({ is_active: true });
            const usersArray = Array.isArray(allUsers) ? allUsers :
              (allUsers?.items || allUsers?.data || []);

            if (usersArray.length > 0) {
              // Filter for sales executives
              executivesList = usersArray.filter((u: any) => {
                const dept = String(u.department || '').toLowerCase();
                const role = String(u.role || '').toLowerCase();
                return (dept.includes('sales') || role.includes('sales')) &&
                  (role.includes('executive') || role.includes('sales'));
              });
              console.log('✅ Found via getAll + filter:', executivesList.length);
            }
          } catch (err) {
            console.log('getAll failed');
          }
        }

        // METHOD 4: Try getUsers
        if (executivesList.length === 0 && (usersAPI as any).getUsers) {
          try {
            const allUsers = await (usersAPI as any).getUsers();
            const usersArray = Array.isArray(allUsers) ? allUsers :
              (allUsers?.items || allUsers?.data || []);

            if (usersArray.length > 0) {
              executivesList = usersArray.filter((u: any) => {
                const dept = String(u.department || '').toLowerCase();
                const role = String(u.role || '').toLowerCase();
                return (dept.includes('sales') || role.includes('sales')) &&
                  (role.includes('executive') || role.includes('sales'));
              });
              console.log('✅ Found via getUsers:', executivesList.length);
            }
          } catch (err) {
            console.log('getUsers failed');
          }
        }

        // Process executives data
        const processedExecutives: Executive[] = executivesList.map((user: any) => {
          const id = user.id || user.userId || user._id ||
            user.uuid || `exec-${Date.now()}-${Math.random()}`;

          return {
            id: Number(id) || 0,
            name: formatName(user),
            email: user.email || null,
            phone: user.phone || user.mobile || user.contact_number || null,
            username: user.username || null,
            department: user.department || 'Sales',
            role: user.role || 'Sales Executive',
          };
        });

        // Remove duplicates by ID
        const uniqueExecutives = processedExecutives.filter((exec, index, self) =>
          index === self.findIndex(e => String(e.id) === String(exec.id) && e.id !== 0)
        );

        console.log('📊 Processed executives:', uniqueExecutives);

        // Apply permission filtering
        const allowedExecutives = getAssignableExecutives(user, uniqueExecutives);

        console.log('👤 Allowed executives after permission check:', allowedExecutives);
        setExecutives(allowedExecutives);

        // Show warning if no executives found
        if (allowedExecutives.length <= 1) { // Only unassigned
          console.warn('⚠️ No sales executives found in the system');
        }

      } catch (error) {
        console.error('❌ Error loading executives:', error);
        // Fallback to just unassigned
        setExecutives([UNASSIGNED_EXEC]);

        if (!['executive', 'sales'].includes(user?.role)) {
          toast.error('Failed to load sales executives');
        }
      } finally {
        setExecsLoading(false);
      }
    };

    loadExecutives();
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

    // Check if user can assign executives
    if (!canAssign) {
      toast.error("You do not have permission to assign executives");
      return;
    }

    // For executive users, they can only assign to themselves
    if (user && ['executive', 'sales'].includes(user.role)) {
      if (assignedTo !== 0 && assignedTo !== user.id) {
        toast.error("You can only assign to yourself");
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
        setAllSellers(prev => prev.map(seller =>
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

      setAllSellers(prev => prev.map(seller =>
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

    // Check if user can update sellers
    if (!canUpdate) {
      toast.error("You do not have permission to update sellers");
      return;
    }

    try {
      const sellerIds = selectedSellers.map(id => String(id));
      await sellerAPI.bulkUpdateLeadField(
        sellerIds,
        "is_active",
        status === "active" ? 1 : 0
      );

      setAllSellers(prev => prev.map(seller =>
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

    // Check if user can update sellers
    if (!canUpdate) {
      toast.error("You do not have permission to update sellers");
      return;
    }

    try {
      const sellerIds = selectedSellers.map(id => String(id));
      await sellerAPI.bulkUpdateLeadField(sellerIds, "stage", stage);

      setAllSellers(prev => prev.map(seller =>
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

    // Check if user can update sellers
    if (!canUpdate) {
      toast.error("You do not have permission to update sellers");
      return;
    }

    try {
      const sellerIds = selectedSellers.map(id => String(id));
      await sellerAPI.bulkUpdateLeadField(sellerIds, "priority", priority);

      setAllSellers(prev => prev.map(seller =>
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

    // Check if user can delete sellers
    if (!canBulkDelete) {
      toast.error("You do not have permission to delete sellers");
      return;
    }

    // Check if user can delete all selected sellers
    const sellersToDelete = allSellers.filter(s => selectedSellers.includes(s.id));
    const unauthorizedSellers = sellersToDelete.filter(s => !canDeleteSeller(user, s));

    if (unauthorizedSellers.length > 0) {
      toast.error(`You do not have permission to delete ${unauthorizedSellers.length} seller(s)`);
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
                const prevSellers = allSellers;
                try {
                  setBulkDeleting(true);
                  setAllSellers(prev => prev.filter(s => !ids.includes(String(s.id))));
                  setSelectedSellers([]);
                  await sellerAPI.bulkDelete(ids);
                  toast.success(`🗑️ ${ids.length} seller(s) deleted successfully.`);
                } catch (err) {
                  console.error('Error bulk deleting sellers:', err);
                  setAllSellers(prevSellers);
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
    const rows = allSellers
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
      roleFilteredSellers.filter(pred).length;

    return [
      { id: "all", label: "All", count: roleFilteredSellers.length, color: "blue" },
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
  }, [roleFilteredSellers]);

  const sources = useMemo(() => {
    const set = new Set<string>(["all"]);
    roleFilteredSellers.forEach((s) => s.source && set.add(s.source));
    return Array.from(set);
  }, [roleFilteredSellers]);

  const statuses = ["all", "active", "inactive"];
  const assignedUsers = useMemo(() => {
    const set = new Set<string>(["all", "Unassigned"]);
    roleFilteredSellers.forEach((s) => s.assigned && set.add(s.assigned));
    return Array.from(set);
  }, [roleFilteredSellers]);

  // ✅ Use roleFilteredSellers instead of all sellers
  const filteredSellers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return roleFilteredSellers.filter((seller) => {
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
  }, [roleFilteredSellers, searchTerm, activeTab, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSellers = filteredSellers.slice(startIndex, startIndex + itemsPerPage);

  const handleAddSeller = () => {
    setEditingSeller(null);
    setShowSellerForm(true);
  };

  const handleEditSeller = (seller: UISeller) => {
    // ✅ Check permission before editing
    if (!canEditSeller(user, seller)) {
      toast.error("You do not have permission to edit this seller");
      return;
    }

    // ✅ Check if we're in view mode
    if (currentSellerView) {
      // Close view mode
      setCurrentSellerView(null);
      setCurrentSellerIndex(0);
    }

    // Open edit modal
    setEditingSeller(seller);
    setShowSellerForm(true);
  };

  const handleViewSeller = (seller: UISeller) => {
    // ✅ Check permission before viewing
    if (!canViewSeller(user, seller)) {
      toast.error("You do not have permission to view this seller");
      return;
    }

    const index = filteredSellers.findIndex((s) => s.id === seller.id);
    setCurrentSellerIndex(index);
    setCurrentSellerView(seller);
  };

  const handleSellerAccount = (sellerId: number) => {
    // Find seller
    const seller = allSellers.find(s => s.id === sellerId);
    if (!seller) {
      toast.error("Seller not found");
      return;
    }

    // ✅ Check permission before accessing account
    if (!canViewSeller(user, seller)) {
      toast.error("You do not have permission to view this seller account");
      return;
    }

    navigate(`/dashboard/sellers-account/${sellerId}`);
  };

  const handleBackToList = () => {
    setCurrentSellerView(null);
    setCurrentSellerAccount(null);
    setCurrentSellerIndex(0);
  };

  // Handle single seller deletion
  const handleDeleteSeller = async (sellerId: number) => {
    const seller = allSellers.find(s => s.id === sellerId);
    if (!seller) return;

    // ✅ Check permission before deleting
    if (!canDeleteSeller(user, seller)) {
      toast.error("You do not have permission to delete this seller");
      return;
    }

    if (window.confirm("Are you sure you want to delete this seller?")) {
      try {
        await sellerAPI.delete(String(sellerId));
        setAllSellers((prev) => prev.filter((s) => s.id !== sellerId));

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
        // ✅ Check permission before updating
        if (!canEditSeller(user, editingSeller)) {
          toast.error("You do not have permission to edit this seller");
          return;
        }

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
        // CREATE - Check create permission
        if (!canCreate) {
          toast.error("You do not have permission to create sellers");
          return;
        }

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
      setAllSellers(normalized);

    } catch (err) {
      console.error("Error refreshing sellers:", err);
      toast.error("Failed to refresh sellers list");
    } finally {
      setLoading(false);
    }
  };

  const handleSellerSelection = (sellerId: number) => {
    const seller = allSellers.find(s => s.id === sellerId);
    if (!seller || !canViewSeller(user, seller)) {
      toast.error("You do not have permission to select this seller");
      return;
    }

    setSelectedSellers((prev) =>
      prev.includes(sellerId)
        ? prev.filter((id) => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSelectAll = () => {
    // ✅ Only select sellers that user can view
    const selectableSellers = paginatedSellers.filter(s => canViewSeller(user, s));
    if (selectedSellers.length === selectableSellers.length && selectableSellers.length > 0) {
      setSelectedSellers([]);
    } else {
      setSelectedSellers(selectableSellers.map((s) => s.id));
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

  // ✅ Role-based visibility hint
  const isExecutive = useMemo(() => {
    const userRole = (user?.role || '').toLowerCase();
    const userDept = (user?.department || '').toLowerCase();
    return userRole.includes('executive') || userDept.includes('sales') || userDept.includes('presales');
  }, [user]);

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
          setAllSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
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
          setAllSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
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

        {/* ✅ Role-based visibility hint */}
        {isExecutive && (
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center">
            <div className="mr-2">
              <UserCheck size={14} className="text-blue-500" />
            </div>
            <div>
              <strong className="font-semibold">Visibility Note:</strong>{' '}
              You are viewing {roleFilteredSellers.length} seller(s) assigned to you
            </div>
          </div>
        )}

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
                        {/* {exec.department || 'Sales'} • {exec.role || 'Sales Executive'} */}
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
                <tr>
                  <td colSpan={getColSpan()}>
                    <div className="w-full flex items-center justify-center py-8">
                      <TableLoader
                        message="Loading sellers..."
                        size="lg"
                        colSpan={8}   // 👈 table ke total columns
                      />
                    </div>
                  </td>
                </tr>
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
                          {/* ✅ Make name clickable */}
                          <button
                            onClick={() => handleViewSeller(seller)}
                            className="font-medium text-gray-900 hover:text-blue-600  text-left"
                          >
                            {seller.salutation} {seller.name}
                          </button>
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

                          {/* ✅ Seller Account Button - Conditional */}
                          <button
                            onClick={() => handleSellerAccount(seller.id)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Seller Account"
                          >
                            <UserCheck size={14} />
                          </button>

                          {/* ✅ Edit Button - Conditional */}
                          {canUpdate && canEditSeller(user, seller) && (
                            <button
                              onClick={() => handleEditSeller(seller)}
                              className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                          )}

                          {/* ✅ More Actions Dropdown */}
                          <div className="relative group">
                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                              <MoreHorizontal size={14} />
                            </button>
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="p-1">
                                {/* ✅ Contact Options */}
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
                                {canDelete && canDeleteSeller(user, seller) && (
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
                    {roleFilteredSellers.length === 0 ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-gray-300" />
                        <div>No sellers assigned to you yet.</div>
                        <div className="text-xs text-gray-500">
                          Contact Admin to get assigned sellers.
                        </div>
                      </div>
                    ) : (
                      'No sellers match the current filters.'
                    )}
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