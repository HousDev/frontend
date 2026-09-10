

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  SlidersHorizontal,
  Clock,
  AlertCircle,
  Calendar,
  RefreshCw,
  Link2,
} from "lucide-react";
import SellerFormModal from "../../components/sellers/SellerFormModal";
import SellerViewPage from "../../components/sellers/SellerViewPage";
import SellerAccountPage from "../../components/sellers/SellerAccountPage";
import SellerViewModal from "../../components/sellers/SellerViewModal";
import ImportSellersLeadsModal from "../../components/sellers/ImportSellersLeadsModal";
import { FollowUpModal } from "../settings/master/FollowUpModal";
import LinkPropertyModal from "../../components/sellers/LinkPropertyModal";
import { sellerAPI } from "@/lib/sellersAPI";
import { toast } from "react-toastify";
import SellerSidebarFilter from "./components/SellerSidebarFilter";
import { useNavigate, useParams } from "react-router-dom";
import TableLoader from "@/components/ui/TableLoader";
import Dropdown from "@/components/ui/Dropdown";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import { can } from "@/utils/permission";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import sellerFollowupAPI from "@/lib/sellerFollowupAPI";
import { SiWhatsapp } from "react-icons/si";
import { useProperties } from "@/hooks/properties";
import { propertiesAPI } from "@/lib/propertiesAPI";


// Resale Theme Colors (matching LeadsPage)
const RESALE = {
  navy: "#f3f4f6",
  navyLight: "#e5e7eb",
  navyDark: "#d1d5db",
  orange: "#e67e22",
  orangeLight: "#f39c12",
  orangeDark: "#d35400",
};

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

const normalizeStage = (v?: string | null) =>
  v ? v.toLowerCase().replace(/\s+/g, "_") : "initial_contact";

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
  seller_lead_status?: string | null;
  seller_lead_stage?: string | null;
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
  created_by?: string | number | null;
  created_by_name?: string | null;
  created_by_user?: any;
  assigned_by?: string | number | null;
  assigned_by_name?: string | null;
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
  created_by: api.created_by ?? api.created_by_id ?? null,
  created_by_name: api.created_by_name ?? api.created_by_user?.name ?? null,
  created_by_user: api.created_by_user ?? (api.created_by_name ? { name: api.created_by_name } : null),
  assigned_by: api.assigned_by ?? null,
  assigned_by_name: api.assigned_by_name ?? null,
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

const getMasterArray = (
  masters: Record<string, MasterOption[]>,
  keys: string[],
): MasterOption[] => {
  for (const key of keys) {
    if (masters[key] && Array.isArray(masters[key])) {
      return masters[key];
    }
  }
  return [];
};

const UNASSIGNED_EXEC: Executive = {
  id: 0,
  name: "Not assigned",
  email: "",
  phone: "",
};

const filterSellersByRole = (
  user: any,
  sellers: UISeller[],
  includeUnassigned: boolean = false,
): UISeller[] => {
  if (!user || !sellers || sellers.length === 0) return [];
  const userRole = (user.role || "").toLowerCase();
  const userDept = (user.department || "").toLowerCase();
  const userId = String(user.id || "");
  const isAdmin = userRole.includes("admin") || userRole.includes("manager");
  const isSuperUser =
    userRole.includes("superadmin") || userRole.includes("owner");
  if (isAdmin || isSuperUser) return sellers;
  const isExecutive =
    userRole.includes("executive") ||
    userDept.includes("sales") ||
    userDept.includes("presales");
  if (isExecutive)
    return sellers.filter(
      (seller) => String(seller.assigned_to || "") === userId,
    );
  return [];
};

const canViewSeller = (user: any, seller: UISeller): boolean => {
  if (!user) return false;
  const userRole = (user.role || "").toLowerCase();
  const userId = String(user.id || "");
  if (
    userRole.includes("admin") ||
    userRole.includes("manager") ||
    userRole.includes("superadmin")
  )
    return true;
  if (userRole.includes("executive"))
    return String(seller.assigned_to || "") === userId;
  return false;
};

const canEditSeller = (user: any, seller: UISeller): boolean => {
  if (!user) return false;
  const userRole = (user.role || "").toLowerCase();
  const userId = String(user.id || "");
  if (
    userRole.includes("admin") ||
    userRole.includes("manager") ||
    userRole.includes("superadmin")
  )
    return true;
  if (userRole.includes("executive"))
    return String(seller.assigned_to || "") === userId;
  return false;
};

const canDeleteSeller = (user: any, seller: UISeller): boolean => {
  if (!user) return false;
  const userRole = (user.role || "").toLowerCase();
  const userId = String(user.id || "");
  if (
    userRole.includes("admin") ||
    userRole.includes("manager") ||
    userRole.includes("superadmin")
  )
    return true;
  if (userRole.includes("executive"))
    return String(seller.assigned_to || "") === userId;
  return false;
};

const getAssignableExecutives = (
  currentUser: any,
  executives: any[],
): any[] => {
  if (!currentUser) return executives;
  if (!executives || executives.length === 0) return [];
  const result = [UNASSIGNED_EXEC];
  if (currentUser.role === "admin" || currentUser.role === "superadmin")
    return [UNASSIGNED_EXEC, ...executives.filter((exec) => exec.id !== 0)];
  if (currentUser.role === "manager") {
    const departmentExecs = executives.filter(
      (exec) => exec.department === currentUser.department && exec.id !== 0,
    );
    return [UNASSIGNED_EXEC, ...departmentExecs];
  }
  const currentUserId = currentUser.id?.toString();
  const selfExec = executives.find(
    (exec) => exec.id?.toString() === currentUserId,
  );
  if (selfExec && selfExec.id !== 0) result.push(selfExec);
  return result;
};

// Badge helpers
const getStageBadgeClass = (stage: string) => {
  const stages: Record<string, string> = {
    initial_contact: "bg-blue-100 text-blue-700",
    property_collection: "bg-purple-100 text-purple-700",
    mandate_discussion: "bg-orange-100 text-orange-700",
    mandate_signed: "bg-green-100 text-green-700",
    selling_process: "bg-indigo-100 text-indigo-700",
    deal_negotiation: "bg-yellow-100 text-yellow-700",
    deal_closure: "bg-pink-100 text-pink-700",
    completed: "bg-emerald-100 text-emerald-700",
  };
  return stages[stage] || "bg-gray-100 text-gray-700";
};

const getPriorityBadgeClass = (priority: string) => {
  const map: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };
  return map[priority?.toLowerCase() || ""] || "bg-gray-100 text-gray-700";
};

const getSourceBadgeClass = (src?: string) => {
  const key = (src || "").toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, string> = {
    website: "bg-blue-100 text-blue-800",
    referral: "bg-emerald-100 text-emerald-800",
    walkin: "bg-sky-100 text-sky-800",
    portal: "bg-indigo-100 text-indigo-800",
    event: "bg-purple-100 text-purple-800",
  };
  return map[key] || "bg-gray-100 text-gray-800";
};

const getStatusBadgeClass = (isActive: boolean) => {
  return isActive
    ? "bg-emerald-100 text-emerald-700"
    : "bg-gray-100 text-gray-600";
};

const SellersPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: routeSellerId } = useParams<{ id?: string }>();
  const { user } = useAuth();

  const canRead = can(user, "seller.read");
  const canCreate = can(user, "seller.create");
  const canUpdate = can(user, "seller.update");
  const canDelete = can(user, "seller.delete");
  const canImport = can(user, "data.import");
  const canExport = can(user, "data.export");
  const canAssign = can(user, "seller.assign");
  const canBulkDelete = can(user, "seller.bulk_delete");

  if (!canRead) {
    return (
      <div
        className="h-full flex flex-col"
        style={{ backgroundColor: "#f5f6f8" }}
      >
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

  const [activeTab, setActiveTab] = useState("uncontacts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSellers, setSelectedSellers] = useState<number[]>([]);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [currentSellerView, setCurrentSellerView] = useState<UISeller | null>(
    null,
  );
  const [currentSellerAccount, setCurrentSellerAccount] =
    useState<UISeller | null>(null);
  const [showImportLeads, setShowImportLeads] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingSeller, setEditingSeller] = useState<UISeller | null>(null);
  const [currentSellerIndex, setCurrentSellerIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [allSellers, setAllSellers] = useState<UISeller[]>([]);
  const [roleFilteredSellers, setRoleFilteredSellers] = useState<UISeller[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [quickViewSeller, setQuickViewSeller] = useState<UISeller | null>(null);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [linkingSeller, setLinkingSeller] = useState<UISeller | null>(null);
  const [showLinkPropertyModal, setShowLinkPropertyModal] = useState(false);
  const [linkPropertySearch, setLinkPropertySearch] = useState("");
  const { properties: catalogProperties = [], loadingProps: catalogLoading, fetchProperties: refreshCatalogProperties } = useProperties({ autoLog: false });

  // Add with your other useState declarations
  const [showSellerFollowupModal, setShowSellerFollowupModal] = useState(false);
  const [selectedSellerForFollowup, setSelectedSellerForFollowup] = useState<any>(null);
  const [executives, setExecutives] = useState<Executive[]>([UNASSIGNED_EXEC]);
  const [execsLoading, setExecsLoading] = useState(false);
  const [pendingExec, setPendingExec] = useState<string>("");
  const [pendingSource, setPendingSource] = useState<string>("");
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [colSearch, setColSearch] = useState({
    name: "",
    contact: "",
    location: "",
    source: "",
    priority: "",
    stage: "",
    assigned: "",
    created: "",
  });

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
    propertyLink: "all",
  });

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(["seller", "lead"]);
        setMasters(data);
      } catch (err) {
        console.error("Error fetching master options:", err);
        toast.error("Failed to load dropdown options");
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, []);

  const loadSellers = useCallback(async () => {
    try {
      setLoading(true);
      const apiSellers = await sellerAPI.getAll();
      const normalized = Array.isArray(apiSellers) ? apiSellers.map(mapApiSellerToUI) : [];
      setAllSellers(normalized);
    } catch (err) {
      console.error("Error fetching sellers:", err);
      setAllSellers([]);
      setErrMsg("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);
  useEffect(() => {
    if (allSellers.length > 0 && user) {
      const filtered = filterSellersByRole(user, allSellers);
      setRoleFilteredSellers(filtered);
    } else {
      setRoleFilteredSellers([]);
    }
  }, [allSellers, user]);

  useEffect(() => {
    const loadExecutives = async () => {
      try {
        setExecsLoading(true);
        const formatName = (u: any): string => {
          const firstName = u?.first_name || u?.firstName || "";
          const lastName = u?.last_name || u?.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || u?.name || u?.full_name || u?.username || u?.email?.split("@")[0] || "Sales Executive";
          return fullName.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, "").trim();
        };
        let executivesList: any[] = [];
        try {
          if (usersAPI.getSalesExecutives) {
            const res = await usersAPI.getSalesExecutives();
            if (res && (Array.isArray(res) || res.items || res.data)) {
              executivesList = Array.isArray(res)
                ? res
                : res.items || res.data || [];
            }
          }
        } catch (err) { }
        if (executivesList.length === 0 && usersAPI.getByDeptRole) {
          const paramCombinations = [
            { department: "Sales", role: "Sales Executive" },
            { department: "sales", role: "sales executive" },
            { department: "Sales", role: "Executive" },
            { department: "sales", role: "executive" },
          ];
          for (const params of paramCombinations) {
            try {
              const res = await usersAPI.getByDeptRole({
                ...params,
                is_active: 1,
                limit: 100,
              });
              if (res && (Array.isArray(res) || res.items || res.data)) {
                const data = Array.isArray(res)
                  ? res
                  : res.items || res.data || [];
                if (data.length > 0) {
                  executivesList = data;
                  break;
                }
              }
            } catch (err) { }
          }
        }
        executivesList = executivesList.filter((u: any) => u.is_active !== 0 && u.is_active !== false && u.is_active !== '0' && u.is_active !== 'false' && u.is_active !== null);

        const processedExecutives: Executive[] = executivesList.map(
          (user: any) => ({
            id: Number(user.id || user.userId || user._id || 0),
            name: formatName(user),
            email: user.email || null,
            phone: user.phone || user.mobile || null,
            username: user.username || null,
            department: user.department || "Sales",
            role: user.role || "Sales Executive",
          }),
        );
        const uniqueExecutives = processedExecutives.filter(
          (exec, index, self) =>
            index ===
            self.findIndex(
              (e) => String(e.id) === String(exec.id) && e.id !== 0,
            ),
        );
        const allowedExecutives = getAssignableExecutives(
          user,
          uniqueExecutives,
        );
        setExecutives(allowedExecutives);
      } catch (error) {
        console.error("Error loading executives:", error);
        setExecutives([UNASSIGNED_EXEC]);
      } finally {
        setExecsLoading(false);
      }
    };
    loadExecutives();
  }, [user]);

  const tabs = useMemo(() => {
    const count = (pred: (s: UISeller) => boolean) =>
      roleFilteredSellers.filter(pred).length;
    return [
      { id: "all", label: "All", count: roleFilteredSellers.length },

      {
        id: "uncontacts",
        label: "Uncontacts",
        count: count(
          (s) =>
            (s.status || "").toLowerCase() === "uncontacted" ||
            (s.source || "").toLowerCase() === "whatsapp",
        ),
      },

      {
        id: "leads",
        label: "Fresh Leads",
        count: count((s) => s.stage === "initial_contact"),
      },
      { id: "active", label: "Active", count: count((s) => s.isActive) },
      {
        id: "mandate",
        label: "Mandate Signed",
        count: count((s) => s.stage === "mandate_signed"),
      },
      {
        id: "selling",
        label: "In Selling",
        count: count((s) => s.stage === "selling_process"),
      },
      {
        id: "hot",
        label: "Hot Deals",
        count: count(
          (s) => s.priority === "high" && s.stage === "deal_negotiation",
        ),
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
    roleFilteredSellers.forEach((s) => {
      if (s.assigned && s.assigned !== "-" && s.assigned !== "Unassigned") {
        set.add(s.assigned);
      }
    });
    return Array.from(set);
  }, [roleFilteredSellers]);

  const filteredSellers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return roleFilteredSellers.filter((seller) => {
      const matchesSearch =
        !search ||
        (seller.name || "").toLowerCase().includes(search) ||
        (seller.salutation || "").toLowerCase().includes(search) ||
        (seller.phone || "").toLowerCase().includes(search) ||
        (seller.whatsapp || "").toLowerCase().includes(search) ||
        (seller.email || "").toLowerCase().includes(search) ||
        (seller.location || "").toLowerCase().includes(search) ||
        (seller.city || "").toLowerCase().includes(search) ||
        (seller.state || "").toLowerCase().includes(search) ||
        String(seller.id || "").toLowerCase().includes(search) ||
        (seller.source || "").toLowerCase().includes(search) ||
        (seller.priority || "").toLowerCase().includes(search) ||
        (seller.stage || "").replace(/_/g, " ").toLowerCase().includes(search) ||
        (seller.status || "").toLowerCase().includes(search) ||
        (seller.leadType || "").toLowerCase().includes(search) ||
        (seller.assigned_to_name || "").toLowerCase().includes(search) ||
        (seller.assigned || "").toLowerCase().includes(search) ||
        (seller.notes || "").toLowerCase().includes(search) ||
        (seller.dealPotential || "").toLowerCase().includes(search) ||
        String(seller.dealValue || "").toLowerCase().includes(search) ||
        (Array.isArray(seller.properties) &&
          seller.properties.some((p: any) =>
            (p.title || "").toLowerCase().includes(search) ||
            (p.address || "").toLowerCase().includes(search) ||
            (p.unit_type || p.unitType || "").toLowerCase().includes(search) ||
            (p.property_type || p.propertyType || "").toLowerCase().includes(search) ||
            (p.society || p.society_name || "").toLowerCase().includes(search) ||
            (p.location || p.location_name || "").toLowerCase().includes(search) ||
            String(p.id || p.property_id || "").toLowerCase().includes(search)
          )) ||
        (Array.isArray(seller.coSellers) &&
          seller.coSellers.some((cs: any) =>
            (cs.coSeller_name || cs.name || "").toLowerCase().includes(search) ||
            (cs.coSeller_phone || cs.phone || "").toLowerCase().includes(search) ||
            (cs.coSeller_email || cs.email || "").toLowerCase().includes(search)
          ));

      const matchesColName =
        !colSearch.name ||
        (seller.name || "").toLowerCase().includes(colSearch.name.toLowerCase()) ||
        (seller.salutation || "").toLowerCase().includes(colSearch.name.toLowerCase()) ||
        (seller.id || "").toString().toLowerCase().includes(colSearch.name.toLowerCase()) ||
        (seller.isActive ? "active" : "inactive").toLowerCase().includes(colSearch.name.toLowerCase());

      const matchesColContact =
        !colSearch.contact ||
        (seller.phone || "").toLowerCase().includes(colSearch.contact.toLowerCase()) ||
        (seller.whatsapp || "").toLowerCase().includes(colSearch.contact.toLowerCase()) ||
        (seller.email || "").toLowerCase().includes(colSearch.contact.toLowerCase()) ||
        (seller.location || "").toLowerCase().includes(colSearch.contact.toLowerCase()) ||
        (seller.city || "").toLowerCase().includes(colSearch.contact.toLowerCase()) ||
        (seller.state || "").toLowerCase().includes(colSearch.contact.toLowerCase());

      const matchesColSource =
        !colSearch.source ||
        (seller.source || "").toLowerCase().includes(colSearch.source.toLowerCase()) ||
        (seller.status || "").toLowerCase().includes(colSearch.source.toLowerCase()) ||
        (seller.leadType || "").toLowerCase().includes(colSearch.source.toLowerCase()) ||
        (seller.isActive ? "active" : "inactive").toLowerCase().includes(colSearch.source.toLowerCase()) ||
        (seller.stage || "").replace(/_/g, " ").toLowerCase().includes(colSearch.source.toLowerCase()) ||
        (seller.priority || "").toLowerCase().includes(colSearch.source.toLowerCase());

      const matchesColPriority =
        !colSearch.priority ||
        (seller.priority || "").toLowerCase().includes(colSearch.priority.toLowerCase());
      const matchesColStage =
        !colSearch.stage ||
        (seller.stage || "").toLowerCase().includes(colSearch.stage.toLowerCase()) ||
        (seller.stage || "").replace(/_/g, " ").toLowerCase().includes(colSearch.stage.toLowerCase());
      const matchesColAssigned =
        !colSearch.assigned ||
        (seller.assigned_to_name || "").toLowerCase().includes(colSearch.assigned.toLowerCase()) ||
        (seller.assigned || "").toLowerCase().includes(colSearch.assigned.toLowerCase());
      const matchesColCreated =
        !colSearch.created ||
        (seller.created_at || "").toLowerCase().includes(colSearch.created.toLowerCase());

      const isActiveBool =
        typeof seller.isActive === "number"
          ? seller.isActive === 1
          : !!seller.isActive;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "uncontacts" &&
          ((seller.status || "").toLowerCase() === "uncontacted" ||
            (seller.source || "").toLowerCase() === "whatsapp")) ||

        (activeTab === "leads" && seller.stage === "initial_contact") ||
        (activeTab === "active" &&
          (isActiveBool || (seller.status || "").toLowerCase() === "active")) ||
        (activeTab === "mandate" && seller.stage === "mandate_signed") ||
        (activeTab === "selling" && seller.stage === "selling_process") ||
        (activeTab === "hot" &&
          seller.priority === "high" &&
          seller.stage === "deal_negotiation");

      const matchesFilters =
        (filters.source === "all" || seller.source === filters.source) &&
        (filters.stage === "all" || seller.stage === filters.stage) &&
        (filters.priority === "all" || seller.priority === filters.priority) &&
        (filters.assigned === "all" ||
          (filters.assigned === "Unassigned" && (seller.assigned === "Unassigned" || seller.assigned === "-" || !seller.assigned || seller.assigned.trim() === "")) ||
          seller.assigned === filters.assigned) &&
        (filters.status === "all" ||
          (filters.status === "active" && seller.isActive) ||
          (filters.status === "inactive" && !seller.isActive));

      const createdAt = seller.created_at ? new Date(seller.created_at) : null;
      const fromOk =
        !filters.dateFrom ||
        !createdAt ||
        createdAt >= new Date(filters.dateFrom);
      const toOk =
        !filters.dateTo || !createdAt || createdAt <= new Date(filters.dateTo);
      const matchesDate = filters.ignoreDate || (fromOk && toOk);

      // Property Link filter
      const hasLinkedProperty = Array.isArray(seller.properties) && seller.properties.length > 0;
      const matchesPropertyLink =
        !filters.propertyLink ||
        filters.propertyLink === 'all' ||
        (filters.propertyLink === 'linked' && hasLinkedProperty) ||
        (filters.propertyLink === 'unlinked' && !hasLinkedProperty);

      return (
        matchesSearch &&
        matchesColName &&
        matchesColContact &&
        matchesColSource &&
        matchesColPriority &&
        matchesColStage &&
        matchesColAssigned &&
        matchesColCreated &&
        matchesTab &&
        matchesFilters &&
        matchesDate &&
        matchesPropertyLink
      );
    });
  }, [roleFilteredSellers, searchTerm, activeTab, filters, colSearch]);
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSellers = filteredSellers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const filteredLinkableProperties = useMemo(() => {
    if (!linkingSeller) return [];
    const currentPropertyIds = new Set(
      ((linkingSeller as any).properties || []).map((p: any) =>
        String(p.id || p.property_id || p._id || "")
      )
    );
    const q = (linkPropertySearch || "").toLowerCase().trim();
    const qClean = q.replace(/[^a-z0-9]/gi, "");
    const qDigits = q.replace(/\D/g, "");
    const qNum = parseInt(qDigits, 10);
    const qTrimmed = qDigits.replace(/^0+/, "");

    const all = (catalogProperties || []).filter((p: any) => {
      if (!q) return true;

      const title = String(p.title || p.property_type_name || p.unit_type || p.property_type || "").toLowerCase();
      const address = String(p.address || p.location_name || p.locality_name || p.location || p.city_name || p.city || "").toLowerCase();
      const society = String(p.society_name || p.society || "").toLowerCase();
      const pid = String(p.id || p.property_id || p._id || "");
      const repId = String(p.propertyId || p.rep_id || p._rxpBadge || "").toLowerCase();
      const pidDigits = pid.replace(/\D/g, "");
      const pidNum = parseInt(pidDigits, 10);
      const pidTrimmed = pidDigits.replace(/^0+/, "");
      const pidClean = pid.replace(/[^a-z0-9]/gi, "");
      const repIdClean = repId.replace(/[^a-z0-9]/gi, "");

      // 1. Direct text matching
      if (
        title.includes(q) ||
        address.includes(q) ||
        society.includes(q) ||
        pid.toLowerCase().includes(q) ||
        repId.includes(q)
      ) {
        return true;
      }

      // 2. Alphanumeric clean match (e.g. 'rex0388' vs '388' or 'rex388')
      if (qClean && (pidClean.includes(qClean) || repIdClean.includes(qClean) || qClean.includes(pidClean) || qClean.includes(repIdClean))) {
        return true;
      }

      // 3. Number comparison ignoring leading zeros ('0388' === 388)
      if (!isNaN(qNum) && !isNaN(pidNum) && qNum === pidNum) {
        return true;
      }

      // 4. Trimmed digit match
      if (qTrimmed && pidTrimmed && (pidTrimmed.includes(qTrimmed) || qTrimmed.includes(pidTrimmed))) {
        return true;
      }

      return false;
    });

    // Sort unlinked properties first, then already linked ones
    return all.sort((a: any, b: any) => {
      const aPid = String(a.id || a.property_id || a._id || "");
      const bPid = String(b.id || b.property_id || b._id || "");
      const aLinked = currentPropertyIds.has(aPid);
      const bLinked = currentPropertyIds.has(bPid);
      if (aLinked === bLinked) return 0;
      return aLinked ? 1 : -1;
    });
  }, [catalogProperties, linkingSeller, linkPropertySearch]);

  const handleLinkPropertyToSeller = async (property: any) => {
    if (!linkingSeller) return;
    const propertiesToLink = Array.isArray(property) ? property : [property];
    const currentProps = (linkingSeller as any).properties || [];
    
    const updatedProps = [...currentProps];
    let newlyLinkedCount = 0;

    for (const prop of propertiesToLink) {
      const pid = String(prop.id || prop.property_id || prop._id);
      const alreadyLinked = updatedProps.some(
        (p: any) => String(p.id || p.property_id || p._id) === pid
      );
      if (!alreadyLinked) {
        updatedProps.push(prop);
        newlyLinkedCount++;
      }
    }

    if (newlyLinkedCount === 0) {
      toast.info("Selected properties are already linked to this seller");
      return;
    }

    const updatedSeller = {
      ...linkingSeller,
      properties: updatedProps,
    };

    setLinkingSeller(updatedSeller);
    if (quickViewSeller && quickViewSeller.id === linkingSeller.id) {
      setQuickViewSeller(updatedSeller);
    }
    setAllSellers((prev) =>
      prev.map((s) => (s.id === linkingSeller.id ? updatedSeller : s))
    );
    toast.success(`${newlyLinkedCount} properties linked to seller successfully`);

    try {
      await sellerAPI.update(String(linkingSeller.id), {
        ...updatedSeller,
        properties: updatedProps,
        property_ids: updatedProps
          .map((p: any) => p.id || p.property_id || p._id)
          .filter(Boolean),
      });
      // Also set seller_id on the property itself for bidirectional sync
      for (const prop of propertiesToLink) {
        try {
          await propertiesAPI.patchSeller(String(prop.id || prop.property_id || prop._id), 'link', linkingSeller.id);
        } catch (e) {
          console.warn('patchSeller(link) note:', e);
        }
      }
      await loadSellers();
    } catch (err) {
      console.error("Failed to update seller properties on server:", err);
      toast.error("Failed to save linked property on server");
    }
  };

  const handleUnlinkPropertyFromSeller = async (property: any) => {
    if (!linkingSeller) return;
    const propertiesToUnlink = Array.isArray(property) ? property : [property];
    if (propertiesToUnlink.length === 0) return;
    const currentProps = (linkingSeller as any).properties || [];
    const pidsToRemove = propertiesToUnlink.map(p => String(p.id || p.property_id || p._id));

    const result = await Swal.fire({
      title: 'Unlink Properties?',
      text: `Are you sure you want to unlink ${propertiesToUnlink.length === 1 ? 'this property' : `${propertiesToUnlink.length} properties`} from this seller?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Unlink',
      cancelButtonText: 'Cancel',
      width: '380px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-gray-800',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 mx-1',
        cancelButton: 'px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 mx-1',
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    const updatedProps = currentProps.filter(
      (p: any) => !pidsToRemove.includes(String(p.id || p.property_id || p._id))
    );
    const updatedSeller = {
      ...linkingSeller,
      properties: updatedProps,
    };

    setLinkingSeller(updatedSeller);
    if (quickViewSeller && quickViewSeller.id === linkingSeller.id) {
      setQuickViewSeller(updatedSeller);
    }
    setAllSellers((prev) =>
      prev.map((s) => (s.id === linkingSeller.id ? updatedSeller : s))
    );
    toast.success(`${propertiesToUnlink.length} properties unlinked successfully`);

    try {
      await sellerAPI.update(String(linkingSeller.id), {
        ...updatedSeller,
        properties: updatedProps,
        property_ids: updatedProps
          .map((p: any) => p.id || p.property_id || p._id)
          .filter(Boolean),
      });
      // Also clear seller_id on the properties themselves for bidirectional sync
      await Promise.all(
        propertiesToUnlink.map(async (prop) => {
          try {
            await propertiesAPI.patchSeller(String(prop.id || prop.property_id || prop._id), 'unlink');
          } catch (e) {
            console.warn('patchSeller(unlink) note:', e);
          }
        })
      );
      await loadSellers();
    } catch (err) {
      console.error("Failed to update seller properties on server:", err);
      toast.error("Failed to save unlinked properties on server");
    }
  };

  const handleAddSeller = () => {
    setEditingSeller(null);
    setShowSellerForm(true);
  };
  const handleEditSeller = (seller: UISeller) => {
    if (!canEditSeller(user, seller)) {
      toast.error("You do not have permission to edit this seller");
      return;
    }
    setEditingSeller(seller);
    setShowSellerForm(true);
  };
  const handleQuickViewSeller = (seller: UISeller) => {
    if (!canViewSeller(user, seller)) {
      toast.error("You do not have permission to view this seller");
      return;
    }
    setQuickViewSeller(seller);
    setShowQuickViewModal(true);
  };
  useEffect(() => {
    if (routeSellerId && allSellers.length > 0) {
      const found = allSellers.find((s) => String(s.id) === String(routeSellerId));
      if (found) {
        setCurrentSellerView(found);
        const index = filteredSellers.findIndex((s) => String(s.id) === String(routeSellerId));
        if (index >= 0) {
          setCurrentSellerIndex(index);
        }
      }
    } else if (!routeSellerId && currentSellerView) {
      setCurrentSellerView(null);
    }
  }, [routeSellerId, allSellers, filteredSellers]);

  const handleViewSeller = (seller: UISeller) => {
    if (!canViewSeller(user, seller)) {
      toast.error("You do not have permission to view this seller");
      return;
    }
    navigate(`/dashboard/sellers/${seller.id}`);
  };
  const handleSellerAccount = (sellerId: number) => {
    navigate(`/dashboard/sellers-account/${sellerId}`);
  };
  const handleBackToList = () => {
    setCurrentSellerView(null);
    setCurrentSellerAccount(null);
    setCurrentSellerIndex(0);
    navigate('/dashboard/sellers');
  };

  const handleDeleteSeller = async (sellerId: number) => {
    const seller = allSellers.find((s) => s.id === sellerId);
    if (!seller) return;
    if (!canDeleteSeller(user, seller)) {
      toast.error("You do not have permission to delete this seller");
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete seller "${seller.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      background: "#fff",
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl",
        actions: "flex gap-3",
        confirmButton: "px-4 py-2 bg-red-600 text-white rounded-lg",
        cancelButton: "px-4 py-2 bg-gray-500 text-white rounded-lg",
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      await sellerAPI.delete(String(sellerId));
      setAllSellers((prev) => prev.filter((s) => s.id !== sellerId));
      if (currentSellerView?.id === sellerId) setCurrentSellerView(null);
      Swal.fire({
        title: "Deleted!",
        text: "Seller deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      toast.error("Failed to delete seller.");
    }
  };

  const handleSaveSeller = async (sellerData: any) => {
    try {
      if (editingSeller?.id) {
        if (!canEditSeller(user, editingSeller)) {
          toast.error("You do not have permission to edit this seller");
          return;
        }
        await sellerAPI.update(String(editingSeller.id), sellerData);
        toast.success("Seller updated successfully");
      } else {
        if (!canCreate) {
          toast.error("You do not have permission to create sellers");
          return;
        }
        await sellerAPI.create(sellerData);
        toast.success("Seller created successfully");
      }
      const apiSellers = await sellerAPI.getAll();
      const normalized = Array.isArray(apiSellers)
        ? apiSellers.map(mapApiSellerToUI)
        : [];
      setAllSellers(normalized);
      setShowSellerForm(false);
      setEditingSeller(null);
    } catch (error) {
      console.error("Error saving seller:", error);
      toast.error("Failed to save seller.");
    }
  };

  const handleSellerSelection = (sellerId: number) => {
    const seller = allSellers.find((s) => s.id === sellerId);
    if (!seller || !canViewSeller(user, seller)) {
      toast.error("You do not have permission to select this seller");
      return;
    }
    setSelectedSellers((prev) =>
      prev.includes(sellerId)
        ? prev.filter((id) => id !== sellerId)
        : [...prev, sellerId],
    );
  };

  const handleSelectAll = () => {
    const selectableSellers = paginatedSellers.filter((s) =>
      canViewSeller(user, s),
    );
    if (
      selectedSellers.length === selectableSellers.length &&
      selectableSellers.length > 0
    )
      setSelectedSellers([]);
    else setSelectedSellers(selectableSellers.map((s) => s.id));
  };

  const handleNextSeller = () => {
    if (currentSellerIndex < filteredSellers.length - 1) {
      const nextIndex = currentSellerIndex + 1;
      const nextSeller = filteredSellers[nextIndex];
      setCurrentSellerIndex(nextIndex);
      setCurrentSellerView(nextSeller);
      if (nextSeller?.id) {
        navigate(`/dashboard/sellers/${nextSeller.id}`, { replace: true });
      }
    }
  };
  const handlePreviousSeller = () => {
    if (currentSellerIndex > 0) {
      const prevIndex = currentSellerIndex - 1;
      const prevSeller = filteredSellers[prevIndex];
      setCurrentSellerIndex(prevIndex);
      setCurrentSellerView(prevSeller);
      if (prevSeller?.id) {
        navigate(`/dashboard/sellers/${prevSeller.id}`, { replace: true });
      }
    }
  };

  const handleBulkAssign = async (assignedTo: number) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to assign");
      return;
    }
    if (!canAssign) {
      toast.error("You do not have permission to assign executives");
      return;
    }
    try {
      const sellerIds = selectedSellers.map((id) => String(id));
      if (assignedTo === 0) {
        await sellerAPI.bulkUpdateLeadField(sellerIds, "assigned_to", null);
        setAllSellers((prev) =>
          prev.map((seller) =>
            selectedSellers.includes(seller.id)
              ? {
                ...seller,
                assigned_to: 0,
                assigned_to_name: "Unassigned",
                assigned: "Unassigned",
              }
              : seller,
          ),
        );
        toast.success(`Unassigned ${sellerIds.length} seller(s)`);
      } else {
        await sellerAPI.bulkAssignExecutive(sellerIds, assignedTo);
        const executive = executives.find((exec) => exec.id === assignedTo);
        setAllSellers((prev) =>
          prev.map((seller) =>
            selectedSellers.includes(seller.id)
              ? {
                ...seller,
                assigned_to: assignedTo,
                assigned_to_name: executive?.name || "Executive",
                assigned: executive?.name || "Executive",
              }
              : seller,
          ),
        );
        toast.success(`Assigned ${sellerIds.length} seller(s)`);
      }
      setSelectedSellers([]);
    } catch (err) {
      toast.error("Failed to assign sellers");
    }
  };

  const handleDistributeEqually = async () => {
    if (!canAssign) {
      toast.error('You do not have permission to assign sellers');
      return;
    }
    const realExecutives = executives.filter(e => e.id !== 0);
    if (selectedSellers.length === 0) {
      toast.warn("No sellers selected");
      return;
    }
    if (realExecutives.length === 0) {
      toast.error('No executives available for assignment');
      return;
    }

    setBulkLoading(true);
    try {
      const assignments: Record<number, number[]> = {};
      realExecutives.forEach(exec => {
        assignments[exec.id] = [];
      });

      selectedSellers.forEach((sellerId, index) => {
        const execIndex = index % realExecutives.length;
        const execId = realExecutives[execIndex].id;
        assignments[execId].push(sellerId);
      });

      for (const [execIdStr, sellerIds] of Object.entries(assignments)) {
        const execId = Number(execIdStr);
        if (sellerIds.length > 0) {
          await sellerAPI.bulkAssignExecutive(sellerIds, execId);
        }
      }

      await loadSellers();
      toast.success(`Successfully distributed ${selectedSellers.length} seller(s) equally among executives`);
      setSelectedSellers([]);
    } catch (error) {
      console.error("Distribution failed:", error);
      toast.error("Failed to distribute sellers");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to update status");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update sellers");
      return;
    }
    try {
      const sellerIds = selectedSellers.map((id) => String(id));
      await sellerAPI.bulkUpdateLeadField(
        sellerIds,
        "is_active",
        status === "active" ? 1 : 0,
      );
      setAllSellers((prev) =>
        prev.map((seller) =>
          selectedSellers.includes(seller.id)
            ? { ...seller, isActive: status === "active" }
            : seller,
        ),
      );
      toast.success(`Status updated for ${selectedSellers.length} seller(s)`);
      setSelectedSellers([]);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkStageUpdate = async (stage: string) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to update stage");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update sellers");
      return;
    }
    try {
      const sellerIds = selectedSellers.map((id) => String(id));
      await sellerAPI.bulkUpdateLeadField(sellerIds, "stage", stage);
      setAllSellers((prev) =>
        prev.map((seller) =>
          selectedSellers.includes(seller.id)
            ? { ...seller, stage, currentStage: stage }
            : seller,
        ),
      );
      toast.success(`Stage updated for ${selectedSellers.length} seller(s)`);
      setSelectedSellers([]);
    } catch (err) {
      toast.error("Failed to update stage");
    }
  };

  const handleBulkPriorityUpdate = async (priority: string) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to update priority");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update sellers");
      return;
    }
    try {
      const sellerIds = selectedSellers.map((id) => String(id));
      await sellerAPI.bulkUpdateLeadField(sellerIds, "priority", priority);
      setAllSellers((prev) =>
        prev.map((seller) =>
          selectedSellers.includes(seller.id)
            ? { ...seller, priority }
            : seller,
        ),
      );
      toast.success(`Priority updated for ${selectedSellers.length} seller(s)`);
      setSelectedSellers([]);
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  const handleBulkSourceUpdate = async (source: string) => {
    if (selectedSellers.length === 0) {
      toast.info("Please select sellers to update source");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update sellers");
      return;
    }
    try {
      const sellerIds = selectedSellers.map((id) => String(id));
      await sellerAPI.bulkUpdateLeadField(sellerIds, "source", source);
      setAllSellers((prev) =>
        prev.map((seller) =>
          selectedSellers.includes(seller.id)
            ? { ...seller, source }
            : seller,
        ),
      );
      toast.success(`Source updated for ${selectedSellers.length} seller(s)`);
      setSelectedSellers([]);
    } catch (err) {
      toast.error("Failed to update source");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSellers.length === 0) {
      toast.info("No sellers selected for deletion.");
      return;
    }
    if (!canBulkDelete) {
      toast.error("You do not have permission to delete sellers");
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${selectedSellers.length} seller(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl",
        actions: "flex gap-3",
        confirmButton: "px-4 py-2 bg-red-600 text-white rounded-lg",
        cancelButton: "px-4 py-2 bg-gray-500 text-white rounded-lg",
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    const ids = selectedSellers.map((id) => String(id));
    setBulkDeleting(true);
    try {
      await sellerAPI.bulkDelete(ids);
      setAllSellers((prev) => prev.filter((s) => !ids.includes(String(s.id))));
      setSelectedSellers([]);
      Swal.fire({
        title: "Deleted!",
        text: `${ids.length} seller(s) deleted.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      toast.error("Failed to delete sellers.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkExport = () => {
    const rows = allSellers
      .filter((s) => selectedSellers.includes(s.id))
      .map((s) => ({
        'ID': s.id,
        'Salutation': s.salutation,
        'Name': s.name,
        'Phone': s.phone,
        'WhatsApp': s.whatsapp,
        'Email': s.email,
        'State': s.state,
        'City': s.city,
        'Location': s.location,
        'Source': s.source,
        'Priority': s.priority,
        'Stage': s.stage,
        'Status': s.isActive ? 'Active' : 'Inactive',
        'Assigned To': s.assigned_to_name || 'Unassigned',
        'Lead Score': s.leadScore,
        'Deal Value': s.dealValue ? `₹${s.dealValue.toLocaleString()}` : '',
        'Expected Close': s.expectedClose ? new Date(s.expectedClose).toLocaleDateString() : '',
        'Properties Count': s.properties?.length || 0,
        'Activities Count': s.activities?.length || 0,
        'Total Visits': s.totalVisits || 0,
        'Response Rate': `${s.responseRate}%`,
        'Created At': s.created_at ? new Date(s.created_at).toLocaleString() : '',
        'Last Activity': s.lastActivity ? new Date(s.lastActivity).toLocaleString() : '',
      }));

    if (rows.length === 0) {
      toast.info("No sellers selected to export.");
      return;
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    const colWidths = [
      { wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
      { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 20 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Selected_Sellers_${selectedSellers.length}`);

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sellers_selected_${selectedSellers.length}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} sellers to Excel successfully`);
  };

  const handleExportAllFiltered = () => {
    if (filteredSellers.length === 0) {
      toast.info("No sellers to export.");
      return;
    }

    const rows = filteredSellers.map((s) => ({
      'ID': s.id,
      'Salutation': s.salutation,
      'Name': s.name,
      'Phone': s.phone,
      'WhatsApp': s.whatsapp,
      'Email': s.email,
      'State': s.state,
      'City': s.city,
      'Location': s.location,
      'Source': s.source,
      'Priority': s.priority,
      'Stage': s.stage,
      'Status': s.isActive ? 'Active' : 'Inactive',
      'Assigned To': s.assigned_to_name || 'Unassigned',
      'Lead Score': s.leadScore,
      'Deal Value': s.dealValue ? `₹${s.dealValue.toLocaleString()}` : '',
      'Expected Close': s.expectedClose ? new Date(s.expectedClose).toLocaleDateString() : '',
      'Properties Count': s.properties?.length || 0,
      'Activities Count': s.activities?.length || 0,
      'Total Visits': s.totalVisits || 0,
      'Response Rate': `${s.responseRate}%`,
      'Created At': s.created_at ? new Date(s.created_at).toLocaleString() : '',
      'Last Activity': s.lastActivity ? new Date(s.lastActivity).toLocaleString() : '',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    const colWidths = [
      { wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
      { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
      { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 20 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All_Sellers');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sellers_filtered_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} sellers to Excel successfully`);
  };

  const clearSelection = () => setSelectedSellers([]);
  const resetFilters = () =>
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
      propertyLink: "all",
    });

  const isExecutive = useMemo(() => {
    const userRole = (user?.role || "").toLowerCase();
    const userDept = (user?.department || "").toLowerCase();
    return (
      userRole.includes("executive") ||
      userDept.includes("sales") ||
      userDept.includes("presales")
    );
  }, [user]);

  const [masterStatuses] = useState<any[]>([]);
  const [masterStages] = useState<any[]>([]);

  const stageOptions = useMemo(() => {
    const stages = [...new Set(roleFilteredSellers.map((s) => s.stage))];
    return stages.map((s) => ({
      value: s,
      label: s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
  }, [roleFilteredSellers]);

  const priorityOptions = useMemo(() => {
    const priorities = [...new Set(roleFilteredSellers.map((s) => s.priority))];
    return priorities.map((p) => ({
      value: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
    }));
  }, [roleFilteredSellers]);

  const colSearchInputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.15)",
    border: "2px solid rgba(255,255,255,0.25)",
    borderRadius: "5px",
    padding: "3px 7px",
    fontSize: "11px",
    outline: "none",
  };

  if (currentSellerView) {
    return (
      <SellerViewPage
        seller={currentSellerView}
        sellerId={currentSellerView.id}
        onBack={handleBackToList}
        onEdit={(sellerData) => {
          setCurrentSellerView(null);   // ← view band karo pehle
          handleEditSeller(sellerData as UISeller);
        }}
        onAccount={handleSellerAccount}
        onNext={handleNextSeller}
        onPrevious={handlePreviousSeller}
        currentIndex={currentSellerIndex}
        totalSellers={filteredSellers.length}
        onUpdateSeller={(updatedSeller: UISeller) => {
          setAllSellers((prev) =>
            prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)),
          );
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
          setAllSellers((prev) =>
            prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)),
          );
          setCurrentSellerAccount(updatedSeller);
        }}
      />
    );
  }

  return (
    <>
      <style>
        {`
          .scrollbar-custom {
            scrollbar-width: thin;
            scrollbar-color: #e67e22 #e5e7eb;
          }
          .scrollbar-custom::-webkit-scrollbar {
            height: 4px;
          }
          .scrollbar-custom::-webkit-scrollbar-track {
            background: #e5e7eb;
            border-radius: 10px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb {
            background: #e67e22;
            border-radius: 10px;
          }
          .scrollbar-custom::-webkit-scrollbar-thumb:hover {
            background: #d35400;
          }
          .scrollbar-custom-vertical {
            scrollbar-width: thin;
            scrollbar-color: #e67e22 #e5e7eb;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar-track {
            background: #e5e7eb;
            border-radius: 10px;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar-thumb {
            background: #e67e22;
            border-radius: 10px;
          }
          .scrollbar-custom-vertical::-webkit-scrollbar-thumb:hover {
            background: #d35400;
          }
              /* ✅ Column divider lines */
table tbody td {
    border-right: 1px solid rgba(209, 213, 219, 0.5);
    border-bottom: 1px solid rgba(209, 213, 219, 0.5);
  }
  table tbody td:last-child {
    border-right: none;
  }
  table thead th {
    border-right: 1px solid rgba(209, 213, 219, 0.4);
  }
  table thead th:last-child {
    border-right: none;
  }

        `}
      </style>
      <div className="" style={{ backgroundColor: "#f5f6f8" }}>
        <div className="max-w-[1600px] mx-auto px-2 sm:px-2 md:px-2 py-1 sm:py-2">
          {/* Tabs Row */}
          <div className="hidden sm:flex items-center justify-between gap-2 mb-2">
            {/* Tabs */}
            <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
              <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all whitespace-nowrap ${isActive
                        ? "bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                      style={isActive ? { color: RESALE.orange } : {}}
                    >
                      <span>{tab.label}</span>

                      <span
                        className="px-1.5 py-[1px] rounded-full text-[10px] font-semibold"
                        style={
                          isActive
                            ? {
                              backgroundColor: `${RESALE.orange}20`,
                              color: RESALE.orange,
                            }
                            : {
                              backgroundColor: "#e5e7eb",
                              color: "#6b7280",
                            }
                        }
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
              </button>

              {canExport && (
                <button
                  onClick={handleExportAllFiltered}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
              )}

              {canImport && (
                <button
                  onClick={() => setShowImportLeads(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <Upload size={13} />
                  <span>Import</span>
                </button>
              )}

              {canCreate && (
                <button
                  onClick={handleAddSeller}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-white rounded-md transition-colors bg-[#0f2b3d]"
                >
                  <Plus size={13} />
                  <span>Add Seller</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Action Row */}
          <div className="flex sm:hidden items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 ml-auto mt-2">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
              </button>
              {canExport && (
                <button
                  onClick={handleExportAllFiltered}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
              )}
              {canImport && (
                <button
                  onClick={() => setShowImportLeads(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"
                >
                  <Upload size={13} />
                  <span>Import</span>
                </button>
              )}
              {canCreate && (
                <button
                  onClick={handleAddSeller}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white rounded-lg bg-[#0f2b3d]"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Tabs + Per Page */}
          <div className="flex sm:hidden items-center gap-2 mb-1">
            <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
              <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-xl">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${isActive ? "bg-white shadow-sm" : "text-gray-500"}`}
                      style={isActive ? { color: RESALE.orange } : {}}
                    >
                      <span>{tab.label}</span>
                      <span
                        className="px-1 py-0.5 rounded-full text-[10px] font-semibold"
                        style={
                          isActive
                            ? {
                              backgroundColor: `${RESALE.orange}20`,
                              color: RESALE.orange,
                            }
                            : { backgroundColor: "#e5e7eb", color: "#6b7280" }
                        }
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedSellers.length > 0 &&
            (canUpdate || canAssign || canBulkDelete) && (
              <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm flex flex-col gap-2 sm:flex-wrap sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-visible">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap"
                    style={{
                      color: RESALE.orange,
                      backgroundColor: `${RESALE.orange}15`,
                      borderColor: `${RESALE.orange}40`,
                    }}
                  >
                    Selected: {selectedSellers.length}
                  </span>
                  {canUpdate && (
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <select
                        onChange={(e) => {
                          if (e.target.value)
                            handleBulkStatusUpdate(e.target.value);
                          e.target.value = "";
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="">Status...</option>
                        {masterStatuses.length > 0 ? (
                          masterStatuses.map((st: any) => (
                            <option key={st.id || st.name} value={st.name}>
                              {st.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Follow-up Required">Follow-up Required</option>
                            <option value="Need More Time">Need More Time</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Unqualified">Unqualified</option>
                          </>
                        )}
                      </select>
                      <select
                        onChange={(e) => {
                          if (e.target.value)
                            handleBulkStageUpdate(e.target.value);
                          e.target.value = "";
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="">Stage...</option>
                        {masterStages.length > 0
                          ? masterStages.map((st: any) => (
                              <option key={st.id || st.name} value={st.name}>
                                {st.name}
                              </option>
                            ))
                          : stageOptions.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                      </select>
                      <select
                        onChange={(e) => {
                          if (e.target.value)
                            handleBulkPriorityUpdate(e.target.value);
                          e.target.value = "";
                        }}
                        className="hidden sm:block border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="">Priority...</option>
                        {priorityOptions.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <div className="hidden sm:block min-w-[130px]">
                        <Dropdown
                          value={pendingSource}
                          onChange={(val) => setPendingSource(val)}
                          options={(masters['lead source'] || masters['Lead Source'] || []).map((opt) => ({
                            value: opt.value ?? opt.label,
                            label: opt.label ?? opt.value,
                          }))}
                          placeholder="Assign Source..."
                          searchable={true}
                          triggerClassName="!h-[28px] !py-1 !px-2.5 rounded-lg text-xs !shadow-none font-normal"
                        />
                      </div>
                      {pendingSource !== "" && (
                        <button
                          onClick={() => {
                            handleBulkSourceUpdate(pendingSource);
                            setPendingSource('');
                          }}
                          className="hidden sm:block px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  )}
                  <div className="hidden sm:block h-5 w-px bg-gray-200" />
                  {canAssign && (
                    <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-xs text-gray-500">Assign:</span>
                      <select
                        value={pendingExec}
                        onChange={(e) => setPendingExec(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[130px]"
                        disabled={execsLoading}
                      >
                        <option value="">Assign...</option>
                        <option value="0">Unassign</option>
                        {executives
                          .filter((exec) => exec.id !== 0)
                          .map((exec) => (
                            <option key={exec.id} value={exec.id}>
                              {exec.name} {exec.id === user?.id ? "(You)" : ""}
                            </option>
                          ))}
                      </select>
                      {pendingExec !== "" && (
                        <button
                          onClick={() => {
                            const execId = Number(pendingExec);
                            if (!isNaN(execId)) {
                              handleBulkAssign(execId);
                              setPendingExec('');
                            }
                          }}
                          className="px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600"
                        >
                          Apply
                        </button>
                      )}

                    </div>
                  )}
                </div>

                {/* MOBILE ONLY */}
                <div className="flex flex-col gap-2 w-full sm:hidden">
                  {/* Row 1 → Assign + Priority side by side */}
                  <div className="flex gap-2 flex-wrap items-center">
                    {canAssign && (
                      <div className="flex-1 flex gap-1">
                        <select
                          value={pendingExec}
                          onChange={(e) => setPendingExec(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[100px]"
                          disabled={execsLoading}
                        >
                          <option value="">Assign...</option>
                          <option value="0">Unassign</option>
                          {executives
                            .filter((exec) => exec.id !== 0)
                            .map((exec) => (
                              <option key={exec.id} value={exec.id}>
                                {exec.name}
                              </option>
                            ))}
                        </select>
                        {pendingExec !== "" && (
                          <button
                            onClick={() => {
                              const execId = Number(pendingExec);
                              if (!isNaN(execId)) {
                                handleBulkAssign(execId);
                                setPendingExec('');
                              }
                            }}
                            className="px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    )}
                    {canUpdate && (
                      <select
                        onChange={(e) => {
                          if (e.target.value)
                            handleBulkPriorityUpdate(e.target.value);
                          e.target.value = "";
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="">Priority...</option>
                        {priorityOptions.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    )}
                    {canUpdate && (
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <div className="flex-1 min-w-0">
                          <Dropdown
                            value={pendingSource}
                            onChange={(val) => setPendingSource(val)}
                            options={(masters['lead source'] || masters['Lead Source'] || []).map((opt) => ({
                              value: opt.value ?? opt.label,
                              label: opt.label ?? opt.value,
                            }))}
                            placeholder="Source..."
                            searchable={true}
                            triggerClassName="!h-[28px] !py-1 !px-2.5 rounded-lg text-xs !shadow-none font-normal"
                          />
                        </div>
                        {pendingSource !== "" && (
                          <button
                            onClick={() => {
                              handleBulkSourceUpdate(pendingSource);
                              setPendingSource('');
                            }}
                            className="px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Row 2 → Export / Delete / Clear in equal grid */}
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${(canExport ? 1 : 0) + (canBulkDelete ? 1 : 0) + 1}, minmax(0, 1fr))`,
                    }}
                  >
                    {canExport && (
                      <button
                        onClick={handleBulkExport}
                        className="w-full text-center px-2 py-1 text-xs border border-emerald-300 text-emerald-600 rounded-lg truncate"
                      >
                        Export ({selectedSellers.length})
                      </button>
                    )}
                    {canBulkDelete && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkDeleting}
                        className="w-full text-center px-2 py-1 text-xs border border-red-300 text-red-600 rounded-lg truncate disabled:opacity-50"
                      >
                        {bulkDeleting
                          ? "…"
                          : `Delete (${selectedSellers.length})`}
                      </button>
                    )}
                    <button
                      onClick={clearSelection}
                      className="w-full text-center px-2 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* DESKTOP ONLY — unchanged */}
                <div className="hidden sm:flex items-center gap-1.5 ml-auto">
                  {canExport && (
                    <button
                      onClick={handleBulkExport}
                      className="px-3 py-1 text-xs border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50"
                    >
                      Export ({selectedSellers.length})
                    </button>
                  )}
                  {canBulkDelete && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleting}
                      className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      {bulkDeleting ? "…" : `Delete (${selectedSellers.length})`}
                    </button>
                  )}
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}




          {/* Table Card */}
          <div
            className="bg-white rounded-sm shadow-sm border border-gray-300 overflow-hidden flex flex-col"
            style={{
              height: window.innerWidth < 640
                ? selectedSellers.length > 0 ? '600px' : '680px'
                : selectedSellers.length > 0 ? '550px' : '620px',
            }}
          >
            {loading ? (
              <div className="flex justify-center py-12"><TableLoader message="Loading sellers..." size="lg" colSpan={0} /></div>
            ) : (
              <>
                {/* OUTER: controls max-height + vertical scroll - DYNAMIC HEIGHT LIKE BUYER TABLE */}
                <div
                  className="scrollbar-custom-vertical flex-1 min-h-0"
                  style={{
                    overflowY: 'auto',
                    overflowX: 'auto',
                  }}
                >
                  <table
                    className="w-full"
                    style={{ minWidth: '900px', borderCollapse: 'separate', borderSpacing: 0 }}
                  >
                    {/* THEAD: sticky so it never scrolls away */}
                    <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
                      {/* ROW 1: Column Headers */}
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        {/* CHECKBOX */}
                        {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                          <th className="w-6 px-2 py-1.5 text-center bg-gray-50">
                            <input
                              type="checkbox"
                              checked={paginatedSellers.length > 0 && paginatedSellers.every(s => selectedSellers.includes(s.id))}
                              onChange={handleSelectAll}
                              className="rounded border-red-500 text-orange-600 focus:ring-orange-500 w-3 h-3"
                            />
                          </th>
                        )}

                        {/* S.NO */}
                        <th className="px-1.5 py-1.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 w-10">
                          S.No.
                        </th>

                        {/* STICKY COL 1: COMMUNICATE */}
                        <th className="px-2 py-1.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                          COMMUNICATE
                        </th>

                        {/* STICKY COL 2: SELLER DETAILS */}
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                          SELLER DETAILS
                        </th>

                        {/* SCROLLABLE COLUMNS */}
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">CONTACT & LOCATION</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">BUSINESS INFO</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">PROGRESS & ACTIVITY</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">PERFORMANCE</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">MANAGE</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">ASSIGNED TO</th>
                      </tr>

                      {/* ROW 2: Column Search - STICKY TOO */}
                      <tr className="bg-gray-100">
                        <th className="px-2 py-0.5 bg-gray-100" />
                        <th className="px-1.5 py-0.5 bg-gray-100 text-[9px] text-gray-400 font-normal">#</th>
                        <th className="px-1.5 py-0.5 bg-gray-100" />
                        <th className="px-1.5 py-0.5 bg-gray-100">
                          <input
                            type="text"
                            placeholder="Search name/ID/status..."
                            value={colSearch.name}
                            onChange={(e) => setColSearch(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
                          />
                        </th>
                        <th className="px-1.5 py-0.5 bg-gray-100">
                          <input
                            type="text"
                            placeholder="Search phone/email/location..."
                            value={colSearch.contact}
                            onChange={(e) => setColSearch(p => ({ ...p, contact: e.target.value }))}
                            className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
                          />
                        </th>
                        <th className="px-1.5 py-0.5 bg-gray-100">
                          <input
                            type="text"
                            placeholder="Search source/status..."
                            value={colSearch.source}
                            onChange={(e) => setColSearch(p => ({ ...p, source: e.target.value }))}
                            className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
                          />
                        </th>
                        <th className="px-1.5 py-0.5 bg-gray-100">
                          <input
                            type="text"
                            placeholder="Search stage..."
                            value={colSearch.stage}
                            onChange={(e) => setColSearch(p => ({ ...p, stage: e.target.value }))}
                            className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
                          />
                        </th>
                        <th className="px-1.5 py-0.5 bg-gray-100" />
                        <th className="px-1.5 py-0.5 bg-gray-100" />
                        <th className="px-1.5 py-0.5 bg-gray-100">
                          <input
                            type="text"
                            placeholder="Search assigned..."
                            value={colSearch.assigned}
                            onChange={(e) => setColSearch(p => ({ ...p, assigned: e.target.value }))}
                            className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white"
                          />
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                      {paginatedSellers.map((seller, index) => (
                        <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                          {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                            <td className="px-2 py-1 text-center bg-white">
                              <input
                                type="checkbox"
                                checked={selectedSellers.includes(seller.id)}
                                onChange={() => handleSellerSelection(seller.id)}
                                className="rounded border-red-900 text-orange-600 focus:ring-orange-500 w-3 h-3"
                              />
                            </td>
                          )}

                          {/* S.NO */}
                          <td className="px-1.5 py-1 text-center text-xs font-semibold text-gray-500 bg-white">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>

                          {/* COMMUNICATE */}
                          <td className="px-2 py-1 bg-white">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  const p = seller.phone?.replace(/\D/g, "");
                                  if (p && p !== "-") window.open(`tel:${p}`);
                                  else toast.error("No phone");
                                }}
                                className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                                title="Call"
                              >
                                <Phone size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  const p = seller.phone?.replace(/\D/g, "");
                                  if (p && p !== "-") {
                                    const u = user?.username || "Team";
                                    window.open(
                                      `https://wa.me/${p}?text=${encodeURIComponent(
                                        `Hi ${seller.name},\n\nBest Regards,\n${u}`
                                      )}`,
                                      "_blank"
                                    );
                                  } else toast.error("No phone");
                                }}
                                className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                                title="WhatsApp"
                              >
                                <SiWhatsapp size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  if (seller.email && seller.email !== "-") {
                                    const u = user?.username || "Team";
                                    window.open(
                                      `mailto:${seller.email}?subject=Property Inquiry&body=Best Regards,${u}`,
                                      "_blank"
                                    );
                                  } else toast.error("No email");
                                }}
                                className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                title="Email"
                              >
                                <Mail size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSellerForFollowup(seller);
                                  setShowSellerFollowupModal(true);
                                }}
                                className="p-1 rounded hover:bg-purple-100 text-purple-600 transition-colors"
                                title="Schedule Follow-up"
                              >
                                <Calendar size={13} />
                              </button>
                            </div>
                          </td>

                          {/* SELLER DETAILS */}
                          <td className="px-2 py-1 bg-white">
                            <button
                              onClick={() => handleViewSeller(seller)}
                              className="flex items-center gap-2 group w-full text-left"
                              title="Open Seller Details"
                            >
                              <div
                                className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium shadow-sm"
                                style={{ backgroundColor: RESALE.orange }}
                              >
                                {(() => {
                                  const f = seller.name?.split(" ")[0] || "";
                                  const l = seller.name?.split(" ")[1] || "";
                                  return (
                                    (f.charAt(0) + l.charAt(0)).toUpperCase().slice(0, 2) ||
                                    seller.name?.charAt(0)?.toUpperCase() ||
                                    "S"
                                  );
                                })()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-[11px] text-gray-900 group-hover:text-orange-500 truncate">
                                  {seller.salutation} {seller.name}
                                </p>
                                <div className="flex items-center gap-1 mt-0 flex-wrap">
                                  <span className="text-[9px] text-gray-400">
                                    ID: {seller.id}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium ${seller.isActive
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-gray-100 text-gray-600"
                                      }`}
                                  >
                                    {seller.isActive ? "● Active" : "● Inactive"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </td>

                          {/* CONTACT & LOCATION */}
                          <td className="px-2 py-1">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1"><Phone size={9} className="text-gray-400" /><a href={`tel:${seller.phone}`} className="text-[9px] text-gray-600 hover:text-orange-500">{seller.phone}</a></div>
                              <div className="flex items-center gap-1"><Mail size={9} className="text-gray-400" /><a href={`mailto:${seller.email}`} className="text-[9px] text-gray-600 hover:text-orange-500 truncate max-w-[120px]">{seller.email}</a></div>
                              <div className="flex items-center gap-1"><MapPin size={9} className="text-gray-400" /><span className="text-[9px] text-gray-600 truncate max-w-[120px]">{seller.location}</span></div>
                            </div>
                          </td>

                          {/* BUSINESS INFO */}
                          <td className="px-2 py-1">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span
                                  className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap truncate max-w-[130px] inline-block align-middle"
                                  title={`Status: ${seller.status || seller.seller_lead_status || 'New'}`}
                                >
                                  Status: {seller.status || seller.seller_lead_status || 'New'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getPriorityBadgeClass(seller.priority)}`}>{seller.priority}</span>
                              </div>
                              <div className="text-[9px] text-gray-600">Source: <span className="font-medium">{seller.source}</span></div>
                            </div>
                          </td>

                          {/* PROGRESS & ACTIVITY */}
                          <td className="px-2 py-1">
                            <div className="space-y-0.5">
                              <div className="text-[9px] font-semibold text-slate-800 truncate max-w-[140px]" title={seller.stage}>
                                Stage: <span className="text-orange-600 font-bold">{seller.stage?.replace(/_/g, " ") || 'Initial Contact'}</span>
                              </div>
                              <div><div className="flex justify-between text-[9px] mb-0.5"><span> Stage Progress</span><span>{seller.stageProgress}%</span></div><div className="w-20 bg-gray-200 rounded-full h-1"><div className="bg-orange-500 h-1 rounded-full" style={{ width: `${seller.stageProgress}%` }} /></div></div>
                              <div className="text-[9px] text-gray-600">Visits: <span className="font-medium">{seller.visits}</span></div>
                            </div>
                          </td>

                          {/* PERFORMANCE */}
                          <td className="px-2 py-1">
                            <div className="space-y-0.5">

                              {/* First Line */}
                              <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto scrollbar-hide">

                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-gray-500">
                                    Deal Value:
                                  </span>

                                  <span className="font-medium text-[10px]">
                                    ₹{seller.dealValue?.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-gray-500">
                                    Response Rate:
                                  </span>

                                  <span className="font-medium text-[10px]">
                                    {seller.responseRate}%
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-gray-500">
                                    Properties:
                                  </span>

                                  <span className="font-medium text-[10px]">
                                    {seller.properties?.length || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Second Line */}
                              <div className="text-[9px] text-gray-600 flex items-center gap-2 flex-wrap">

                                <div>
                                  Last Activity:{" "}
                                  <span className="font-medium">
                                    {toDate(seller.lastActivity)}
                                  </span>
                                </div>

                                <span className="text-gray-400">•</span>

                                <div>
                                  Created:{" "}
                                  <span className="font-medium">
                                    {toDate(seller.created_at)}
                                  </span>
                                </div>

                                {seller.expectedClose && (
                                  <>
                                    <span className="text-gray-400">•</span>

                                    <div>
                                      <span className="text-gray-500">
                                        Close:
                                      </span>{" "}

                                      <span className="font-medium text-orange-600">
                                        {toDate(seller.expectedClose)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* MANAGE */}
                          <td className="px-2 py-1 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedSellerForFollowup(seller);
                                  setShowSellerFollowupModal(true);
                                }}
                                className="p-1 rounded hover:bg-purple-100 text-purple-600 transition-colors"
                                title="Follow-up"
                              >
                                <Calendar size={13} />
                              </button>
                              <button
                                onClick={() => handleQuickViewSeller(seller)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                                title="Quick View"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  setLinkingSeller(seller);
                                  setShowLinkPropertyModal(true);
                                  setLinkPropertySearch("");
                                  refreshCatalogProperties?.().catch(console.error);
                                }}
                                className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Link Property"
                              >
                                <Link2 size={13} />
                              </button>
                              <button
                                onClick={() => handleSellerAccount(seller.id)}
                                className="p-1 rounded hover:bg-gray-100 text-green-600 transition-colors"
                                title="Seller Account"
                              >
                                <UserCheck size={13} />
                              </button>
                              {canUpdate && canEditSeller(user, seller) && (
                                <button
                                  onClick={() => handleEditSeller(seller)}
                                  className="p-1 rounded hover:bg-gray-100 text-orange-500 transition-colors"
                                  title="Edit Seller"
                                >
                                  <Edit size={13} />
                                </button>
                              )}
                              {canDelete && canDeleteSeller(user, seller) && (
                                <button
                                  onClick={() => handleDeleteSeller(seller.id)}
                                  className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                                  title="Delete Seller"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* ASSIGNED TO - LAST COLUMN */}
                          <td className="px-2 py-1">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-gray-900 text-[10px]">
                                  {seller.assigned_to_name
                                    ? seller.assigned_to_name
                                      .replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, "")
                                    : "Unassigned"}
                                </div>
                              </div>

                              {/* {seller.assigned_to_email && (
      <div className="text-[8px] text-gray-500 truncate max-w-[130px] pl-7">
        {seller.assigned_to_email}
      </div>
    )} */}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {paginatedSellers.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-1 text-sm">No sellers found</div>
                      <p className="text-xs text-gray-400">Try adjusting your filters or search criteria</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {filteredSellers.length > 0 && (
                  <div className="px-2 sm:px-3 py-2 border-t border-gray-100 bg-white">
                    {/* MOBILE */}
                    <div className="flex flex-col gap-2 sm:hidden">
                      <div className="text-[10px] text-gray-500 text-center">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSellers.length)} of {filteredSellers.length} sellers</div>
                      <div className="flex items-center justify-between gap-2">
                        {selectedSellers.length === 0 && (
                          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))} className="min-w-[60px] px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white">
                            {[25, 50, 100, 200, 300, 400, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
                            <option value={999999}>All</option>
                          </select>
                        )}
                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                          <div className="flex justify-end min-w-max">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronLeft size={14} /></button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  const page = i + 1;
                                  return <button key={page} onClick={() => setCurrentPage(page)} className={`px-2 py-1 rounded text-xs ${currentPage === page ? "bg-orange-500 text-white" : "border border-gray-300"}`}>{page}</button>;
                                })}
                                {totalPages > 5 && <span className="px-1 text-xs">...</span>}
                                {totalPages > 5 && <button onClick={() => setCurrentPage(totalPages)} className="px-2 py-1 rounded text-xs border border-gray-300">{totalPages}</button>}
                              </div>
                              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronRight size={14} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP */}
                    <div className="hidden sm:flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] text-gray-500 whitespace-nowrap">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSellers.length)} of {filteredSellers.length} sellers</div>
                        {selectedSellers.length === 0 && (
                          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))} className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white">
                            {[25, 50, 100, 200, 300, 400, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
                            <option value={999999}>All</option>
                          </select>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronLeft size={14} /></button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return <button key={page} onClick={() => setCurrentPage(page)} className={`px-2 py-1 rounded text-xs ${currentPage === page ? "bg-orange-500 text-white" : "border border-gray-300"}`}>{page}</button>;
                          })}
                          {totalPages > 5 && <span className="px-1 text-xs">...</span>}
                          {totalPages > 5 && <button onClick={() => setCurrentPage(totalPages)} className="px-2 py-1 rounded text-xs border border-gray-300">{totalPages}</button>}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronRight size={14} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <SellerSidebarFilter
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          sources={sources}
          stages={["all", ...stageOptions.map((s) => s.value)]}
          priorities={["all", ...priorityOptions.map((p) => p.value)]}
          assignedUsers={assignedUsers}
          statuses={statuses}
        />

        {showSellerForm && (
          <SellerFormModal
            key={editingSeller ? `edit-${editingSeller.id}` : "create"}
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
          <ImportSellersLeadsModal
            isOpen={showImportLeads}
            onClose={() => setShowImportLeads(false)}
            onImportComplete={loadSellers}


          />
        )}


        {/* Seller Follow-up Modal */}
        <FollowUpModal
          open={showSellerFollowupModal}
          mode="add"
          initialEntityCode="SELLER"
          initialEntityId={selectedSellerForFollowup?.id}
          initialEntityName={selectedSellerForFollowup?.name}
          initialEntityPhone={selectedSellerForFollowup?.phone}
          initialStageCode={selectedSellerForFollowup?.stage}
          initialStatusCode={selectedSellerForFollowup?.status}
          initialAssignedTo={selectedSellerForFollowup?.assigned_to_name || selectedSellerForFollowup?.assigned_to || (selectedSellerForFollowup as any)?.assigned_executive_name || (selectedSellerForFollowup as any)?.assigned_executive}
          onClose={() => {
            setShowSellerFollowupModal(false);
            setSelectedSellerForFollowup(null);
          }}
          onSaved={() => {
            setShowSellerFollowupModal(false);
            setSelectedSellerForFollowup(null);
            loadSellers();
          }}
        />

        {/* Seller Quick View Modal */}
        {showQuickViewModal && quickViewSeller && (
          <SellerViewModal
            isOpen={showQuickViewModal}
            seller={quickViewSeller}
            onClose={() => {
              setShowQuickViewModal(false);
              setQuickViewSeller(null);
            }}
            onViewFull={(seller) => {
              handleViewSeller(seller);
            }}
            onEdit={(seller) => {
              handleEditSeller(seller);
            }}
            onAccount={(sellerId) => {
              handleSellerAccount(sellerId);
            }}
            canEdit={canUpdate && canEditSeller(user, quickViewSeller)}
            onUnlinkProperties={async (propertyIds) => {
              const currentProps = quickViewSeller.properties || [];
              const updatedProps = currentProps.filter(
                (p: any) => !propertyIds.includes(String(p.id || p.property_id || p._id))
              );
              const updatedSeller = {
                ...quickViewSeller,
                properties: updatedProps,
              };
              setQuickViewSeller(updatedSeller);
              setAllSellers((prev) =>
                prev.map((s) => (s.id === quickViewSeller.id ? updatedSeller : s))
              );
              try {
                await sellerAPI.update(String(quickViewSeller.id), {
                  ...updatedSeller,
                  properties: updatedProps,
                  property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
                });
                for (const pid of propertyIds) {
                  try {
                    await propertiesAPI.patchSeller(String(pid), 'unlink');
                  } catch (e) {
                    console.warn('patchSeller unlink bulk note:', e);
                  }
                }
                await loadSellers();
                toast.success("Properties unlinked successfully");
              } catch (err) {
                console.error("Failed to update seller properties on server:", err);
                toast.error("Failed to save unlinked properties on server");
              }
            }}
          />
        )}

        {/* Link Property Modal from SellersPage Table Action */}
        <LinkPropertyModal
          isOpen={showLinkPropertyModal}
          onClose={() => {
            setShowLinkPropertyModal(false);
            setLinkingSeller(null);
          }}
          onSelectProperty={handleLinkPropertyToSeller}
          onUnlinkProperty={handleUnlinkPropertyFromSeller}
          linkingSeller={linkingSeller}
        />
      </div>
    </>
  );
};

export default SellersPage;



