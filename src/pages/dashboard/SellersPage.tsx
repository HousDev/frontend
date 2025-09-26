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
import ImportLeadsModal from "../../components/sellers/ImportLeadsModal";
import { sellerAPI } from "@/lib/sellersAPI";
import { toast } from "react-toastify";
import SellerSidebarFilter from "./components/SellerSidebarFilter";
import { useNavigate } from "react-router-dom";
import TableLoader from "@/components/ui/TableLoader";

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

// convert "Initial Contact" -> "initial_contact"
const normalizeStage = (v?: string | null) =>
  v ? v.toLowerCase().replace(/\s+/g, "_") : "initial_contact";

// ---------- Types used in UI (minimal) ----------
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
  priority: string; // 'high' | 'medium' | 'low' etc.
  stage: string; // underscored keys for badges
  status: string;
  leadType: string;
  assigned: string;
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
  notes: string,
  seller_dob: string,
  assigned_to: number,
  assigned_to_name: string
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

  leadScore: Number(api.lead_score || 0),
  dealValue: Number(api.deal_value || 0),
  expectedClose: api.expected_close || null,

  properties: Array.isArray(api.properties) ? api.properties : [],
  coSellers: Array.isArray(api.coSellers) ? api.coSellers
    : Array.isArray(api.cosellers) ? api.cosellers
      : [],

  activities: Array.isArray(api.activities) ? api.activities : [],
  followups: Array.isArray(api.followups) ? api.followups : [],
  documents: Array.isArray(api.documents) ? api.documents : [],

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
  notes: api.notes,
  seller_dob: api.seller_dob,
  assigned_to: api.assigned_to,
  assigned_to_name: api.assigned_to_name,

});

// ---------- Component ----------
const SellersPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSellers, setSelectedSellers] = useState<number[]>([]);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [currentSellerView, setCurrentSellerView] = useState<UISeller | null>(
    null
  );
  const [currentSellerAccount, setCurrentSellerAccount] =
    useState<UISeller | null>(null);
  const [showImportLeads, setShowImportLeads] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingSeller, setEditingSeller] = useState<UISeller | null>(null);
  const [currentSellerIndex, setCurrentSellerIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [sellers, setSellers] = useState<UISeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const clearSelection = () => setSelectedSellers([]);

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
    } finally {
      setLoading(false);
    }
  };
  fetchSellers();
}, []);


  const formatDOB = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`; // ✅ use slash separator
  };

  const handleExportAllFiltered = () => {
    if (filteredSellers.length === 0) {
      alert("No sellers to export based on current filters.");
      return;
    }

    // Use `filteredSellers` which contains all matching sellers across all pages
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
    URL.revokeObjectURL(url);
  };

  const handleBulkAssign = () => {
    // TODO: open Assign modal / API call
    alert(`${selectedSellers.length} sellers selected for assign`);
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
        created_at: s.created_at ?? "",
      }));

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
    URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    if (!selectedSellers.length) return;

    if (window.confirm(`Delete ${selectedSellers.length} selected seller(s)?`)) {
      try {
        // Delete each seller individually
        for (const id of selectedSellers) {
          await sellerAPI.delete(String(id));
        }

        // Update local state
        setSellers((prev) => prev.filter((s) => !selectedSellers.includes(s.id)));
        clearSelection();
      } catch (err: any) {
        console.error("Error deleting sellers:", err);
        alert("Failed to delete some sellers. Please try again.");
      }
    }
  };

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
        count: count((s) => s.isActive),   // ✅ ab yaha
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

  const stages = [
    "all",
    "initial_contact",
    "property_collection",
    "mandate_discussion",
    "mandate_signed",
    "selling_process",
    "deal_negotiation",
    "deal_closure",
    "completed",
  ];
  const priorities = ["all", "high", "medium", "low"];
  const statuses = ["all", "active", "inactive", "blocked"];
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

      const isActiveBool =
        typeof seller.isActive === "number" ? seller.isActive === 1 : !!seller.isActive;

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "leads" && seller.stage === "initial_contact") ||
        (activeTab === "active" && (isActiveBool ||
          (seller.status || "").toLowerCase() === "active")) || // optional fallback
        (activeTab === "mandate" && seller.stage === "mandate_signed") ||
        (activeTab === "selling" && seller.stage === "selling_process") ||
        (activeTab === "hot" &&
          seller.priority === "high" &&
          seller.stage === "deal_negotiation");

      const matchesFilters =
        (filters.source === "all" || seller.source === filters.source) &&
        (filters.stage === "all" || seller.stage === filters.stage) &&
        (filters.priority === "all" || seller.priority === filters.priority) &&
        (filters.assigned === "all" || seller.assigned === filters.assigned) &&
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

      return matchesSearch && matchesTab && matchesFilters && matchesDate;
    });
  }, [sellers, searchTerm, activeTab, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSellers = filteredSellers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  // const handleSellerAccount = (seller: UISeller) => {
  //   setCurrentSellerAccount(seller);
  // };

  const handleSellerAccount = (sellerId: number) => {
    // Navigate to the standalone seller account page
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

        // ✅ Success toast
        toast.success("Seller deleted successfully!");
      } catch (err: any) {
        console.error("Error deleting seller:", err);
        toast.error("Failed to delete seller. Please try again.");
      }
    }
  };

  const handleSaveSeller = async (sellerData: any) => {
    // helper to unwrap axios/fetch-style responses
    const unwrap = (r: any) => (r && typeof r === "object" && "data" in r ? r.data : r);

    try {
      let savedBody: any;

      if (editingSeller?.id) {
        // --- UPDATE PATH ---
        const id = Number(editingSeller.id);
        if (!Number.isFinite(id) || id <= 0) {
          throw new Error("Invalid seller ID");
        }

        // optional: check existence (if your API supports it)
        const existsResp = sellerAPI.getById ? await sellerAPI.getById(String(id)).catch(() => null) : null;
        const exists = !!unwrap(existsResp);

        try {
          const resp = exists
            ? await sellerAPI.update(String(id), sellerData)
            : await sellerAPI.create(sellerData); // fallback create if not found
          savedBody = unwrap(resp);

          if (!exists) {
            toast.warn("Original seller not found. Created a new record instead.");
          }

          toast.success("Seller updated successfully.");
        } catch (err: any) {
          // fallback: if update said not found, try create
          const status = err?.response?.status;
          const msg = err?.response?.data?.message || err?.message || "";
          if (status === 404 || /not found/i.test(msg)) {
            const resp = await sellerAPI.create(sellerData);
            savedBody = unwrap(resp);
            toast.warn("Original seller not found. Created a new record instead.");
          } else {
            throw err;
          }
        }
      } else {
        // --- CREATE PATH ---
        const resp = await sellerAPI.create(sellerData);
        savedBody = unwrap(resp);
        toast.success("Seller created successfully.");
      }

      // Map the saved entity into UI shape
      const updated = mapApiSellerToUI(savedBody);

      // Merge into local state
      setSellers(prev =>
        prev.some(s => s.id === updated.id)
          ? prev.map(s => (s.id === updated.id ? updated : s))
          : [...prev, updated]
      );

      // Close modal only after a successful save
      setShowSellerForm(false);
      setEditingSeller(null);

      // Final refresh to stay in sync with DB
      try {
        const allResp = await sellerAPI.getAll();
        const all = unwrap(allResp);
        const list = Array.isArray(all) ? all : (all?.data ?? []); // tolerate {data:[...]} too
        setSellers(list.map(mapApiSellerToUI));
      } catch {
        // soft-fail refresh; keep optimistic state
      }
    } catch (error) {
      console.error("❌ Error saving seller:", error);
      toast.error("Failed to save seller.");
      // keep the modal open so user can fix inputs
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

  // ✅ if you are storing is_active as BOOLEAN (0/1) in MySQL:
  const getStatusBadge = (isActive: boolean | number) => {
    const active = typeof isActive === "number" ? isActive === 1 : isActive;

    const config = active
      ? { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active", icon: "🟢" }
      : { bg: "bg-gray-100", text: "text-gray-600", label: "Inactive", icon: "⚫" };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const stageConfig: any = {
      initial_contact: { bg: "bg-blue-100", text: "text-blue-700", label: "Initial Contact", icon: "📞" },
      property_collection: { bg: "bg-purple-100", text: "text-purple-700", label: "Property Collection", icon: "🏠" },
      mandate_discussion: { bg: "bg-orange-100", text: "text-orange-700", label: "Mandate Discussion", icon: "💬" },
      mandate_signed: { bg: "bg-green-100", text: "text-green-700", label: "Mandate Signed", icon: "✅" },
      selling_process: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Selling Process", icon: "🔄" },
      deal_negotiation: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Deal Negotiation", icon: "🤝" },
      deal_closure: { bg: "bg-pink-100", text: "text-pink-700", label: "Deal Closure", icon: "📋" },
      completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed", icon: "🎉" },
    };
    const key = stage || "initial_contact";
    const config = stageConfig[key] || { bg: "bg-gray-100", text: "text-gray-700", label: safe(key) };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon ? `${config.icon} ` : ""}{config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const p = (priority || "").toLowerCase();
    const priorityConfig: any = {
      high: { bg: "bg-red-100", text: "text-red-700", label: "High", icon: "🔥" },
      medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium", icon: "⚡" },
      low: { bg: "bg-green-100", text: "text-green-700", label: "Low", icon: "🌱" },
    };
    const config = priorityConfig[p] || { bg: "bg-gray-100", text: "text-gray-700", label: safe(priority) };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon ? `${config.icon} ` : ""}{config.label}
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
            <button
              onClick={() => setShowImportLeads(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>
            <button
              onClick={handleAddSeller}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm"
            >
              <Plus size={14} />
              <span>Add Seller</span>
            </button>
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
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? `bg-${tab.color}-200` : "bg-gray-200"
                    }`}
                >
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
            <button
              onClick={handleExportAllFiltered}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs font-medium text-gray-500">Quick:</span>

          {/* All button */}
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, stage: "all", priority: "all" }))
            }
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === "all" && filters.priority === "all"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            All
          </button>

          {stages
            .filter((s) => s !== "all")
            .slice(0, 4)
            .map((stage) => (
              <button
                key={stage}
                onClick={() => setFilters((prev) => ({ ...prev, stage }))}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === stage
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {stage.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}

          {priorities
            .filter((p) => p !== "all")
            .map((priority) => (
              <button
                key={priority}
                onClick={() => setFilters((prev) => ({ ...prev, priority }))}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.priority === priority
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
        </div>

        {/* Bulk actions — just below Quick Filters */}
        {selectedSellers.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5">
              <span className="text-xs font-semibold text-blue-700">
                {selectedSellers.length} selected
              </span>

              <span className="mx-1 h-4 w-px bg-blue-200" />

              <button
                onClick={handleBulkAssign}
                className="rounded-md bg-blue-600 px-2.5 py-1 text-xs text-white hover:bg-blue-700"
              >
                Assign
              </button>

              <button
                onClick={handleBulkExport}
                className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs text-white hover:bg-emerald-700"
              >
                Export
              </button>

              <button
                onClick={handleBulkDelete}
                className="rounded-md bg-red-600 px-2.5 py-1 text-xs text-white hover:bg-red-700"
              >
                Delete
              </button>

              {/* push clear icon to right, but keep same row height */}
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
          stages={stages}
          priorities={priorities}
          assignedUsers={assignedUsers}
          statuses={statuses}
        />
      </div>

      {/* Table: render ALWAYS so the TableLoader row can show */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedSellers.length === paginatedSellers.length && paginatedSellers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact & Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business Info</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress & Activity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                // ✅ Only TableLoader
                <TableLoader colSpan={7} message="Loading sellers..." size="lg" />
              ) : errMsg ? (
                // ✅ Error row inside the table
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-red-600">
                    {errMsg}
                  </td>
                </tr>
              ) : paginatedSellers.length > 0 ? (
                // ✅ Normal rows
                paginatedSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSellers.includes(seller.id)}
                        onChange={() => handleSellerSelection(seller.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                          <User className="text-white" size={14} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            <div>{safe(seller.salutation)} {safe(seller.name)}</div>
                            {seller.seller_dob && (
                              <div className="text-gray-500 text-xs">{formatDOB(seller.seller_dob)}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            {getStatusBadge(seller.isActive)}
                            {getLeadScore(seller.leadScore)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs">
                          <Phone size={10} className="text-gray-400" />
                          <span className="font-medium">{safe(seller.phone)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <Mail size={10} className="text-gray-400" />
                          <span className="truncate max-w-24">{safe(seller.email)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <MapPin size={10} className="text-gray-400" />
                          <span>{safe(seller.location)}{seller.city ? `, ${seller.city}` : ""}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-gray-500">Source:</span> {safe(seller.source)}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Assigned:</span> {safe(seller.assigned)}
                        </div>
                        <div className="flex items-center space-x-1">
                          {getPriorityBadge(safe(seller.priority) as string)}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        {getStageBadge(seller.stage)}
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${Number(seller.stageProgress || 0)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">Last: {toDate(seller.lastActivity)}</div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <Building size={10} className="text-blue-500" />
                          <span>{seller.properties?.length || 0} props</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <ActivityIcon size={10} className="text-green-500" />
                          <span>{seller.activities?.length || 0} activities</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <EyeIcon size={10} className="text-purple-500" />
                          <span>{seller.visits || 0} visits</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Target size={10} className="text-orange-500" />
                          <span>{Number(seller.responseRate || 0)}% response</span>
                        </div>
                        {Number(seller.notifications) > 0 && (
                          <div className="flex items-center space-x-1 text-xs">
                            <Bell size={10} className="text-red-500" />
                            <span className="text-red-600 font-medium">{seller.notifications}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewSeller(seller)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleSellerAccount(seller.id)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Seller Account"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          onClick={() => handleEditSeller(seller)}
                          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <div className="relative group">
                          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="p-1">
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
                              <button
                                onClick={() => handleDeleteSeller(seller.id)}
                                className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full text-left"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // ✅ Empty state
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
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
                      className={`px-2 py-1 rounded text-xs ${currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                        }`}
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
                      className={`px-2 py-1 rounded text-xs ${currentPage === totalPages ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                        }`}
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
        <ImportLeadsModal isOpen={showImportLeads} onClose={() => setShowImportLeads(false)} onImport={() => { }} />
      )}
    </div>
  );
};

export default SellersPage;
