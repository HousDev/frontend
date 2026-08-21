import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Plus, Download, Upload, SlidersHorizontal, Phone, Mail, MapPin, Calendar, Eye, Link2, UserCheck, Edit, Trash2, ChevronLeft, ChevronRight, RefreshCw, KeyRound } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { ownerAPI } from "@/lib/ownerAPI";
import { toast } from "react-toastify";
import OwnerSidebarFilter, { OwnerFiltersState } from "./components/OwnerSidebarFilter";
import OwnerFormModal from "@/components/owners/OwnerFormModal";
import ImportOwnersModal from "@/components/owners/ImportOwnersModal";
import OwnerFollowupModal from "@/components/owners/OwnerFollowupModal";
import OwnerViewPage from "@/components/owners/OwnerViewPage";
import TableLoader from "@/components/ui/TableLoader";
import LinkRentalPropertyModal from "@/components/owners/LinkRentalPropertyModal";
import rentalPropertiesAPI from "@/lib/rentalPropertiesAPI";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import { can } from "@/utils/permission";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const RESALE = {
  navy: "#f3f4f6",
  navyLight: "#e5e7eb",
  navyDark: "#d1d5db",
  orange: "#e67e22",
  orangeLight: "#f39c12",
  orangeDark: "#d35400",
};

type UIOwner = {
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
  assigned_to: number;
  assigned_to_name: string;
  notes: string;
  created_at: string | null;
  properties: any[];
  followups: any[];
  activities: any[];
  stageProgress: number;
  visits: number;
  dealValue: number;
  responseRate: number;
  lastActivity: string | null;
};

const mapApiOwnerToUI = (api: any): UIOwner => ({
  id: Number(api.id),
  salutation: api.salutation || "Mr.",
  name: api.name || "-",
  phone: api.phone || "-",
  whatsapp: api.whatsapp || "-",
  email: api.email || "-",
  state: api.state || "-",
  city: api.city || "-",
  location: api.location || "-",
  source: api.source || "-",
  priority: api.priority || "medium",
  stage: api.stage || "initial_contact",
  status: api.status || "active",
  assigned_to: Number(api.assigned_to || 0),
  assigned_to_name: api.assigned_to_name || "Unassigned",
  notes: api.notes || "",
  created_at: api.created_at || null,
  properties: api.properties || [],
  followups: api.followups || [],
  activities: api.activities || [],
  stageProgress: Number(api.stage_progress || 0),
  visits: Number(api.visits || 0),
  dealValue: Number(api.deal_value || 0),
  responseRate: Number(api.response_rate || 0),
  lastActivity: api.last_activity || null,
});

const DEFAULT_FILTERS: OwnerFiltersState = {
  dateFrom: "",
  dateTo: "",
  ignoreDate: false,
  source: "all",
  stage: "all",
  priority: "all",
  assigned: "all",
  status: "all",
};

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

export const OwnersPage: React.FC = () => {
  const { user } = useAuth();
  const [allOwners, setAllOwners] = useState<UIOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedOwners, setSelectedOwners] = useState<number[]>([]);

  // Modals & Panels
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<UIOwner | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [viewingOwner, setViewingOwner] = useState<UIOwner | null>(null);
  const [showDirectLinkModal, setShowDirectLinkModal] = useState(false);
  const [linkingOwnerForProp, setLinkingOwnerForProp] = useState<any | null>(null);

  // Column search states
  const [colSearch, setColSearch] = useState({
    name: "",
    contact: "",
    location: "",
    source: "",
    stage: "",
    assigned: "",
  });

  const [filters, setFilters] = useState<OwnerFiltersState>(DEFAULT_FILTERS);
  const [executives, setExecutives] = useState<any[]>([]);
  const [bulkAssignId, setBulkAssignId] = useState("");
  const [bulkStage, setBulkStage] = useState("");

  const canUpdate = can(user, "owner.update");
  const canDelete = can(user, "owner.delete");
  const canCreate = can(user, "owner.create");
  const canImport = can(user, "owner.import");
  const canExport = can(user, "owner.export");

  const loadOwners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ownerAPI.getAll();
      if (Array.isArray(data)) {
        setAllOwners(data.map(mapApiOwnerToUI));
      } else {
        setAllOwners([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load owners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await usersAPI.getSalesExecutives();
        const raw = Array.isArray(res) ? res : (res?.items || res?.data || []);
        setExecutives(raw);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExecutives();
  }, []);

  // Filter Owners
  const filteredOwners = useMemo(() => {
    return allOwners.filter((o) => {
      // 1. Column searches
      if (colSearch.name && !(o.name.toLowerCase().includes(colSearch.name.toLowerCase()) || String(o.id).includes(colSearch.name))) return false;
      if (colSearch.contact && !(o.phone.includes(colSearch.contact) || o.email.toLowerCase().includes(colSearch.contact.toLowerCase()) || o.location.toLowerCase().includes(colSearch.contact.toLowerCase()))) return false;
      if (colSearch.source && !(o.source.toLowerCase().includes(colSearch.source.toLowerCase()) || o.status.toLowerCase().includes(colSearch.source.toLowerCase()))) return false;
      if (colSearch.stage && !o.stage.toLowerCase().includes(colSearch.stage.toLowerCase())) return false;
      if (colSearch.assigned && !o.assigned_to_name.toLowerCase().includes(colSearch.assigned.toLowerCase())) return false;

      // 2. Tab Filter
      const isActiveBool = o.status === "active";
      if (activeTab === "uncontacts" && o.source.toLowerCase() !== "whatsapp") return false;
      if (activeTab === "leads" && o.stage !== "initial_contact") return false;
      if (activeTab === "active" && !isActiveBool) return false;
      if (activeTab === "mandate" && o.stage !== "mandate_signed") return false;
      if (activeTab === "selling" && o.stage !== "selling_process") return false;
      if (activeTab === "hot" && !(o.priority === "high" && o.stage === "deal_negotiation")) return false;

      // 3. Sidebar Filters
      if (filters.source !== "all" && o.source !== filters.source) return false;
      if (filters.stage !== "all" && o.stage !== filters.stage) return false;
      if (filters.priority !== "all" && o.priority !== filters.priority) return false;
      if (filters.status !== "all" && o.status !== filters.status) return false;
      if (filters.assigned !== "all" && String(o.assigned_to) !== String(filters.assigned)) return false;

      // Date Filters
      if (!filters.ignoreDate && o.created_at) {
        const createdTime = new Date(o.created_at).getTime();
        if (filters.dateFrom && createdTime < new Date(filters.dateFrom).getTime()) return false;
        if (filters.dateTo && createdTime > new Date(filters.dateTo).setHours(23, 59, 59, 999)) return false;
      }

      return true;
    });
  }, [allOwners, colSearch, activeTab, filters]);

  // Tab configurations with counts
  const tabs = useMemo(() => {
    const count = (pred: (o: UIOwner) => boolean) => allOwners.filter(pred).length;
    return [
      { id: "all", label: "All", count: allOwners.length },
      { id: "uncontacts", label: "Uncontacts", count: count((o) => o.source.toLowerCase() === "whatsapp") },
      { id: "leads", label: "Fresh Leads", count: count((o) => o.stage === "initial_contact") },
      { id: "active", label: "Active", count: count((o) => o.status === "active") },
      { id: "mandate", label: "Mandate Signed", count: count((o) => o.stage === "mandate_signed") },
      { id: "selling", label: "In Selling", count: count((o) => o.stage === "selling_process") },
      { id: "hot", label: "Hot Deals", count: count((o) => o.priority === "high" && o.stage === "deal_negotiation") },
    ];
  }, [allOwners]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOwners.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedOwners = useMemo(() => {
    return filteredOwners.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOwners, startIndex, itemsPerPage]);

  // Reset page when filters/tab/search change
  useEffect(() => { setCurrentPage(1); }, [filteredOwners.length, activeTab, itemsPerPage]);

  // Multi Selection handlers
  const handleDirectLinkProperty = async (property: any) => {
    if (!linkingOwnerForProp) return;
    try {
      const currentProps = linkingOwnerForProp.properties || [];
      const updatedProps = [...currentProps, property];
      
      await ownerAPI.update(String(linkingOwnerForProp.id), {
        ...linkingOwnerForProp,
        properties: updatedProps,
        property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
      });

      await rentalPropertiesAPI.patchOwner(String(property.id), 'link', linkingOwnerForProp.id);
      
      toast.success("Rental property linked successfully!");
      setShowDirectLinkModal(false);
      setLinkingOwnerForProp(null);
      await loadOwners();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to link rental property");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOwners(paginatedOwners.map(o => o.id));
    } else {
      setSelectedOwners([]);
    }
  };

  const handleSelectOwner = (id: number) => {
    setSelectedOwners(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignId) return;
    try {
      await ownerAPI.bulkAssignExecutive(
        selectedOwners,
        Number(bulkAssignId) || null
      );
      toast.success("Owners assigned successfully");
      setSelectedOwners([]);
      setBulkAssignId("");
      loadOwners();
    } catch (err) {
      toast.error("Bulk assignment failed");
    }
  };

  const handleBulkStage = async () => {
    if (!bulkStage) return;
    try {
      await ownerAPI.bulkUpdateLeadField(
        selectedOwners,
        'stage',
        bulkStage
      );
      toast.success("Stages updated successfully");
      setSelectedOwners([]);
      setBulkStage("");
      loadOwners();
    } catch (err) {
      toast.error("Bulk stage update failed");
    }
  };

  const handleBulkDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedOwners.length} owners. This cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them!",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ownerAPI.bulkDelete(selectedOwners);
          toast.success("Owners deleted successfully");
          setSelectedOwners([]);
          loadOwners();
        } catch (err) {
          toast.error("Bulk delete failed");
        }
      }
    });
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Delete this owner record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ownerAPI.delete(id);
          toast.success("Owner deleted");
          loadOwners();
        } catch (err) {
          toast.error("Delete failed");
        }
      }
    });
  };

  const handleExport = () => {
    if (!filteredOwners.length) return;
    const ws = XLSX.utils.json_to_sheet(
      filteredOwners.map((o, idx) => ({
        "S.No": idx + 1,
        Name: `${o.salutation} ${o.name}`,
        Phone: o.phone,
        Email: o.email,
        Location: o.location,
        Source: o.source,
        Stage: o.stage,
        Priority: o.priority,
        Status: o.status,
        "Assigned To": o.assigned_to_name,
        Notes: o.notes,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Owners");
    XLSX.writeFile(wb, "Owners_Report.xlsx");
  };

  if (viewingOwner) {
    return <OwnerViewPage ownerId={viewingOwner.id} onBack={() => { setViewingOwner(null); loadOwners(); }} />;
  }

  // Pagination page buttons helper
  const getPageButtons = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-0 sm:p-4 space-y-3 -mt-2">
      <style>{`
        .owners-table td { border-right: 1px solid rgba(209,213,219,0.5); }
        .owners-table td:last-child { border-right: none; }
        .owners-table thead th { border-right: 1px solid rgba(209,213,219,0.4); }
        .owners-table thead th:last-child { border-right: none; }
      `}</style>

      {/* Header Tabs & Actions */}
      <div className="hidden sm:flex items-center justify-between gap-2 p-2.5 rounded-xl flex-wrap">
        <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
          <div className="flex gap-1 min-w-max p-1 rounded-lg">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all whitespace-nowrap ${isActive ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  style={isActive ? { color: RESALE.orange } : {}}
                >
                  <span>{tab.label}</span>
                  <span
                    className="px-1.5 py-[1px] rounded-full text-[10px] font-semibold"
                    style={
                      isActive
                        ? { backgroundColor: `${RESALE.orange}20`, color: RESALE.orange }
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

        {/* Header Toolbar Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 font-medium"
          >
            <SlidersHorizontal size={13} className="text-orange-500" />
            <span>Filters</span>
          </button>
          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 font-medium"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          )}
          {canImport && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 font-medium"
            >
              <Upload size={13} />
              <span>Import</span>
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => { setSelectedOwner(null); setShowAddEditModal(true); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-white rounded-md bg-[#0f2b3d] font-semibold shadow-sm"
            >
              <Plus size={13} />
              <span>Add Owner</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedOwners.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-orange-50 border-orange-200 text-orange-600">
            Selected: {selectedOwners.length}
          </span>
          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={bulkAssignId}
              onChange={(e) => setBulkAssignId(e.target.value)}
              className="border text-xs rounded px-2 py-1 bg-white focus:outline-none"
            >
              <option value="">Assign To...</option>
              {executives.map(e => (
                <option key={e.id} value={e.id}>{`${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name}</option>
              ))}
            </select>
            <button onClick={handleBulkAssign} className="px-3 py-1 bg-[#0f2b3d] text-white rounded text-xs">Assign</button>

            <select
              value={bulkStage}
              onChange={(e) => setBulkStage(e.target.value)}
              className="border text-xs rounded px-2 py-1 bg-white focus:outline-none"
            >
              <option value="">Update Stage...</option>
              <option value="initial_contact">Initial Contact</option>
              <option value="property_listed">Property Listed</option>
              <option value="mandate_signed">Mandate Signed</option>
              <option value="in_negotiation">In Negotiation</option>
              <option value="deal_closure">Deal Closure</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={handleBulkStage} className="px-3 py-1 bg-[#0f2b3d] text-white rounded text-xs">Update Stage</button>

            <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 290px)' }}>
          <table
            className="owners-table w-full text-left text-xs"
            style={{ minWidth: "950px", borderCollapse: "separate", borderSpacing: 0 }}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 30 }}>
              {/* Row 1: Column Headers */}
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="w-5 px-1 py-1 text-center bg-gray-50">
                  <input
                    type="checkbox"
                    checked={paginatedOwners.length > 0 && paginatedOwners.every(o => selectedOwners.includes(o.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 cursor-pointer"
                  />
                </th>
                <th className="px-1 py-1 text-center text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 w-8">S.No.</th>
                <th className="px-1 py-1 text-center text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">COMMUNICATE</th>
                <th className="px-1.5 py-1 text-left text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">OWNER DETAILS</th>
                <th className="px-1.5 py-1 text-left text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">CONTACT &amp; LOCATION</th>
                <th className="px-1.5 py-1 text-left text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">BUSINESS INFO</th>
                <th className="px-1.5 py-1 text-left text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">PROGRESS &amp; ACTIVITY</th>
                <th className="px-1.5 py-1 text-center text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">MANAGE</th>
                <th className="px-1.5 py-1 text-left text-[9px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">ASSIGNED TO</th>
              </tr>

              {/* Row 2: Column Search */}
              <tr className="bg-gray-100">
                <th className="px-1 py-0.5 bg-gray-100" />
                <th className="px-1 py-0.5 bg-gray-100 text-[8px] text-gray-400 font-normal">#</th>
                <th className="px-1 py-0.5 bg-gray-100" />
                <th className="px-1 py-0.5 bg-gray-100">
                  <input
                    type="text"
                    placeholder="Search name/ID/status..."
                    value={colSearch.name}
                    onChange={(e) => setColSearch(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-1 py-0.5 text-[8.5px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
                <th className="px-1 py-0.5 bg-gray-100">
                  <input
                    type="text"
                    placeholder="Search phone/email/location..."
                    value={colSearch.contact}
                    onChange={(e) => setColSearch(p => ({ ...p, contact: e.target.value }))}
                    className="w-full px-1 py-0.5 text-[8.5px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
                <th className="px-1 py-0.5 bg-gray-100">
                  <input
                    type="text"
                    placeholder="Search source/status..."
                    value={colSearch.source}
                    onChange={(e) => setColSearch(p => ({ ...p, source: e.target.value }))}
                    className="w-full px-1 py-0.5 text-[8.5px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
                <th className="px-1 py-0.5 bg-gray-100">
                  <input
                    type="text"
                    placeholder="Search stage..."
                    value={colSearch.stage}
                    onChange={(e) => setColSearch(p => ({ ...p, stage: e.target.value }))}
                    className="w-full px-1 py-0.5 text-[8.5px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
                <th className="px-1 py-0.5 bg-gray-100" />
                <th className="px-1 py-0.5 bg-gray-100">
                  <input
                    type="text"
                    placeholder="Search assigned..."
                    value={colSearch.assigned}
                    onChange={(e) => setColSearch(p => ({ ...p, assigned: e.target.value }))}
                    className="w-full px-1 py-0.5 text-[8.5px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <TableLoader colSpan={9} />
              ) : paginatedOwners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500 font-semibold">No owners found.</td>
                </tr>
              ) : (
                paginatedOwners.map((o, idx) => {
                  const sNo = startIndex + idx + 1;
                  const isActive = o.status === "active";
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-1 py-0.5 text-center bg-white">
                        <input
                          type="checkbox"
                          checked={selectedOwners.includes(o.id)}
                          onChange={() => handleSelectOwner(o.id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 cursor-pointer"
                        />
                      </td>
                      <td className="px-1 py-0.5 text-center text-[9px] font-semibold text-gray-500 bg-white">{sNo}</td>

                      {/* COMMUNICATE */}
                      <td className="px-1 py-0.5 text-center">
                        <div className="flex items-center gap-0.5 justify-center">
                          <button
                            onClick={() => {
                              const p = o.phone.replace(/\D/g, "");
                              if (p && p !== "-") window.open(`tel:${p}`);
                              else toast.error("No phone number");
                            }}
                            className="p-0.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                            title="Call"
                          >
                            <Phone size={11} />
                          </button>
                          <button
                            onClick={() => {
                              const p = o.phone.replace(/\D/g, "");
                              if (p && p !== "-") {
                                window.open(`https://wa.me/${p}?text=Hi ${o.name}`, "_blank");
                              } else toast.error("No phone number");
                            }}
                            className="p-0.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                            title="WhatsApp"
                          >
                            <SiWhatsapp size={11} />
                          </button>
                          <button
                            onClick={() => {
                              if (o.email && o.email !== "-") {
                                window.open(`mailto:${o.email}`, "_blank");
                              } else toast.error("No email address");
                            }}
                            className="p-0.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Email"
                          >
                            <Mail size={11} />
                          </button>
                          <button
                            onClick={() => { setSelectedOwner(o); setShowFollowupModal(true); }}
                            className="p-0.5 rounded hover:bg-purple-50 text-purple-600 transition-colors"
                            title="Schedule Follow-up"
                          >
                            <Calendar size={11} />
                          </button>
                        </div>
                      </td>

                      {/* OWNER DETAILS */}
                      <td className="px-1.5 py-0.5">
                        <button onClick={() => setViewingOwner(o)} className="flex items-center gap-1 text-left group">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm flex-shrink-0" style={{ backgroundColor: RESALE.orange }}>
                            {(o.name.split(" ")[0]?.charAt(0) + (o.name.split(" ")[1]?.charAt(0) || "")).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[10px] text-gray-900 group-hover:text-orange-500 transition-colors whitespace-nowrap">{o.salutation} {o.name}</div>
                            <div className="flex items-center gap-1 text-[8px] mt-0.5">
                              <span className="text-gray-400">ID: {o.id}</span>
                              <span className={`inline-flex px-1 py-0.2 rounded-full text-[7px] font-medium ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                {isActive ? "● Active" : "● Inactive"}
                              </span>
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* CONTACT & LOCATION */}
                      <td className="px-1.5 py-0.5 text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-0.5"><Phone size={7} className="text-gray-400" /><span className="text-[8px]">{o.phone}</span></div>
                        <div className="flex items-center gap-0.5"><Mail size={7} className="text-gray-400" /><span className="text-[8px] truncate max-w-[100px]">{o.email}</span></div>
                        <div className="flex items-center gap-0.5"><MapPin size={7} className="text-gray-400" /><span className="text-[8px] truncate max-w-[100px]">{o.location}</span></div>
                      </td>

                      {/* BUSINESS INFO */}
                      <td className="px-1.5 py-0.5 space-y-0.5">
                        <div className="flex items-center gap-0.5 flex-wrap">
                          <span className={`px-1 py-0.2 rounded-full text-[7px] font-medium ${getStageBadgeClass(o.stage)}`}>{o.stage.replace(/_/g, " ")}</span>
                          <span className={`px-1 py-0.2 rounded-full text-[7px] font-medium ${getPriorityBadgeClass(o.priority)}`}>{o.priority}</span>
                        </div>
                        <div className="text-[8px] text-gray-600">Source: <span className="font-semibold">{o.source}</span></div>
                      </td>

                      {/* PROGRESS & ACTIVITY */}
                      <td className="px-1.5 py-0.5 space-y-0.5">
                        <div>
                          <div className="flex justify-between text-[8px] mb-0.5"><span>Progress</span><span>{o.stageProgress}%</span></div>
                          <div className="w-16 bg-gray-200 rounded-full h-0.5"><div className="bg-orange-500 h-0.5 rounded-full" style={{ width: `${o.stageProgress}%` }} /></div>
                        </div>
                        <div className="text-[8px] text-gray-500">Visits: <span className="font-semibold text-gray-800">{o.visits}</span></div>
                        <div className="text-[8px] text-gray-500">Created: <span className="font-semibold text-gray-700">{toDate(o.created_at)}</span></div>
                      </td>

                      {/* MANAGE */}
                      <td className="px-1.5 py-0.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => setViewingOwner(o)}
                            className="p-0.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Quick View"
                          >
                            <Eye size={11} />
                          </button>
                          <button
                            onClick={() => { setLinkingOwnerForProp(o); setShowDirectLinkModal(true); }}
                            className="p-0.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Link Property"
                          >
                            <Link2 size={11} />
                          </button>
                          <button
                            onClick={() => setViewingOwner(o)}
                            className="p-0.5 rounded hover:bg-gray-100 text-green-600 transition-colors"
                            title="Owner Account"
                          >
                            <UserCheck size={11} />
                          </button>
                          {canUpdate && (
                            <button
                              onClick={() => { setSelectedOwner(o); setShowAddEditModal(true); }}
                              className="p-0.5 rounded hover:bg-gray-100 text-orange-500 transition-colors"
                              title="Edit Owner"
                            >
                              <Edit size={11} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="p-0.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete Owner"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* ASSIGNED TO */}
                      <td className="px-1.5 py-0.5 text-[8.5px] text-gray-800 font-semibold whitespace-nowrap">
                        {o.assigned_to_name ? o.assigned_to_name.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.)?\s+/i, "") : "Unassigned"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination — Seller-style compact */}
        {filteredOwners.length > 0 && (
          <div className="px-2 sm:px-3 py-2 border-t border-gray-100 bg-white">
            {/* MOBILE */}
            <div className="flex flex-col gap-2 sm:hidden">
              <div className="text-[10px] text-gray-500 text-center">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOwners.length)} of {filteredOwners.length} owners
              </div>
              <div className="flex items-center justify-between gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                  className="min-w-[60px] px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white"
                >
                  {[25, 50, 100, 200, 300, 400, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
                  <option value={999999}>All</option>
                </select>
                <div className="flex-1 overflow-x-auto scrollbar-hide">
                  <div className="flex justify-end min-w-max">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronLeft size={14} /></button>
                      {getPageButtons().map((p, i) =>
                        p === '...' ? <span key={`e${i}`} className="px-1 text-xs">...</span>
                          : <button key={p} onClick={() => setCurrentPage(p as number)} className={`px-2 py-1 rounded text-xs ${currentPage === p ? "bg-orange-500 text-white" : "border border-gray-300"}`}>{p}</button>
                      )}
                      <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DESKTOP */}
            <div className="hidden sm:flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-[10px] text-gray-500 whitespace-nowrap">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOwners.length)} of {filteredOwners.length} owners
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }}
                  className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white"
                >
                  {[25, 50, 100, 200, 300, 400, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
                  <option value={999999}>All</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronLeft size={14} /></button>
                {getPageButtons().map((p, i) =>
                  p === '...' ? <span key={`e${i}`} className="px-1 text-xs text-gray-400">...</span>
                    : <button key={p} onClick={() => setCurrentPage(p as number)} className={`px-2 py-1 rounded text-xs ${currentPage === p ? "bg-orange-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}>{p}</button>
                )}
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-gray-300 disabled:opacity-50"><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Filter Component */}
      <OwnerSidebarFilter
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        resetFilters={() => setFilters(DEFAULT_FILTERS)}
        sources={["all", "Website", "Referral", "Cold Call", "Walk-in", "WhatsApp", "Import"]}
        stages={["all", "initial_contact", "property_listed", "mandate_signed", "in_negotiation", "deal_closure", "completed"]}
        priorities={["all", "high", "medium", "low"]}
        assignedUsers={["all", ...executives.map(e => String(e.id))]}
        statuses={["all", "active", "inactive"]}
      />

      {/* Owner Form Modal */}
      {showAddEditModal && (
        <OwnerFormModal
          isOpen={showAddEditModal}
          onClose={() => setShowAddEditModal(false)}
          owner={selectedOwner}
          onSave={loadOwners}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportOwnersModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={loadOwners}
        />
      )}

      {/* Follow-up Modal */}
      {showFollowupModal && selectedOwner && (
        <OwnerFollowupModal
          isOpen={showFollowupModal}
          onClose={() => setShowFollowupModal(false)}
          ownerId={selectedOwner.id}
          onSave={loadOwners}
        />
      )}

      {showDirectLinkModal && linkingOwnerForProp && (
        <LinkRentalPropertyModal
          isOpen={showDirectLinkModal}
          onClose={() => {
            setShowDirectLinkModal(false);
            setLinkingOwnerForProp(null);
          }}
          onSelectProperty={handleDirectLinkProperty}
          linkingOwner={linkingOwnerForProp}
        />
      )}
    </div>
  );
};

export default OwnersPage;
