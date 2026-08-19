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

  // Pagination Slice
  const paginatedOwners = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOwners.slice(start, start + itemsPerPage);
  }, [filteredOwners, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);

  // Multi Selection handlers
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

  return (
    <div className="p-2 sm:p-4 space-y-3" style={{ backgroundColor: "#f5f6f8" }}>
      {/* Header Tabs & Actions */}
      <div className="hidden sm:flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
          <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all whitespace-nowrap ${
                    isActive ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
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
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse text-xs" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="w-8 px-3 py-2 text-center bg-gray-50">
                  <input
                    type="checkbox"
                    checked={paginatedOwners.length > 0 && paginatedOwners.every(o => selectedOwners.includes(o.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider w-10">S.No.</th>
                <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">COMMUNICATE</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">OWNER DETAILS</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">CONTACT & LOCATION</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">BUSINESS INFO</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">PROGRESS & ACTIVITY</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">PERFORMANCE</th>
                <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">MANAGE</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">ASSIGNED TO</th>
              </tr>

              {/* Row 2: Search Inputs */}
              <tr className="bg-gray-100 border-b">
                <th className="px-2 py-1" />
                <th className="px-1.5 py-1 text-center font-normal text-gray-400">#</th>
                <th className="px-2 py-1" />
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Search name/ID/status..."
                    value={colSearch.name}
                    onChange={(e) => setColSearch(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-2 py-1 text-[10px] border rounded bg-white font-normal"
                  />
                </th>
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Search phone/email/location..."
                    value={colSearch.contact}
                    onChange={(e) => setColSearch(p => ({ ...p, contact: e.target.value }))}
                    className="w-full px-2 py-1 text-[10px] border rounded bg-white font-normal"
                  />
                </th>
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Search source/status..."
                    value={colSearch.source}
                    onChange={(e) => setColSearch(p => ({ ...p, source: e.target.value }))}
                    className="w-full px-2 py-1 text-[10px] border rounded bg-white font-normal"
                  />
                </th>
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Search stage..."
                    value={colSearch.stage}
                    onChange={(e) => setColSearch(p => ({ ...p, stage: e.target.value }))}
                    className="w-full px-2 py-1 text-[10px] border rounded bg-white font-normal"
                  />
                </th>
                <th className="px-2 py-1" />
                <th className="px-2 py-1" />
                <th className="px-2 py-1">
                  <input
                    type="text"
                    placeholder="Search assigned..."
                    value={colSearch.assigned}
                    onChange={(e) => setColSearch(p => ({ ...p, assigned: e.target.value }))}
                    className="w-full px-2 py-1 text-[10px] border rounded bg-white font-normal"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <TableLoader colSpan={11} />
              ) : paginatedOwners.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-500 font-semibold">No owners found.</td>
                </tr>
              ) : (
                paginatedOwners.map((o, idx) => {
                  const sNo = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isActive = o.status === "active";
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOwners.includes(o.id)}
                          onChange={() => handleSelectOwner(o.id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center font-bold text-gray-500">{sNo}</td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => {
                              const p = o.phone.replace(/\D/g, "");
                              if (p && p !== "-") window.open(`tel:${p}`);
                              else toast.error("No phone number");
                            }}
                            className="p-1 rounded hover:bg-green-50 text-green-600 transition-colors"
                            title="Call"
                          >
                            <Phone size={13} />
                          </button>
                          <button
                            onClick={() => {
                              const p = o.phone.replace(/\D/g, "");
                              if (p && p !== "-") {
                                window.open(`https://wa.me/${p}?text=Hi ${o.name}`, "_blank");
                              } else toast.error("No phone number");
                            }}
                            className="p-1 rounded hover:bg-green-50 text-green-600 transition-colors"
                            title="WhatsApp"
                          >
                            <SiWhatsapp size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (o.email && o.email !== "-") {
                                window.open(`mailto:${o.email}`, "_blank");
                              } else toast.error("No email address");
                            }}
                            className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Email"
                          >
                            <Mail size={13} />
                          </button>
                          <button
                            onClick={() => { setSelectedOwner(o); setShowFollowupModal(true); }}
                            className="p-1 rounded hover:bg-purple-50 text-purple-600 transition-colors"
                            title="Schedule Follow-up"
                          >
                            <Calendar size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-1.5">
                        <button onClick={() => setViewingOwner(o)} className="flex items-center gap-2 text-left group">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm" style={{ backgroundColor: RESALE.orange }}>
                            {(o.name.split(" ")[0]?.charAt(0) + (o.name.split(" ")[1]?.charAt(0) || "")).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">{o.salutation} {o.name}</div>
                            <div className="flex items-center gap-1.5 text-[9px] mt-0.5">
                              <span className="text-gray-400">ID: {o.id}</span>
                              <span className={`inline-flex px-1 py-0.2 rounded-full text-[8px] font-medium ${
                                isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                              }`}>
                                {isActive ? "● Active" : "● Inactive"}
                              </span>
                            </div>
                          </div>
                        </button>
                      </td>
                      <td className="px-3 py-1.5 text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-1"><Phone size={9} className="text-gray-400" />{o.phone}</div>
                        <div className="flex items-center gap-1"><Mail size={9} className="text-gray-400" /><span className="truncate max-w-[120px]">{o.email}</span></div>
                        <div className="flex items-center gap-1"><MapPin size={9} className="text-gray-400" /><span className="truncate max-w-[120px]">{o.location}</span></div>
                      </td>
                      <td className="px-3 py-1.5 space-y-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getStageBadgeClass(o.stage)}`}>{o.stage.replace(/_/g, " ")}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getPriorityBadgeClass(o.priority)}`}>{o.priority}</span>
                        </div>
                        <div className="text-[9px] text-gray-600">Source: <span className="font-semibold">{o.source}</span></div>
                      </td>
                      <td className="px-3 py-1.5 space-y-1">
                        <div>
                          <div className="flex justify-between text-[9px] mb-0.5"><span>Stage Progress</span><span>{o.stageProgress}%</span></div>
                          <div className="w-20 bg-gray-200 rounded-full h-1"><div className="bg-orange-500 h-1 rounded-full" style={{ width: `${o.stageProgress}%` }} /></div>
                        </div>
                        <div className="text-[9px] text-gray-600">Visits: <span className="font-semibold">{o.visits}</span></div>
                      </td>
                      <td className="px-3 py-1.5 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-gray-500">Deal Value: <span className="font-bold text-gray-800">₹{o.dealValue.toLocaleString()}</span></span>
                          <span className="text-[9px] text-gray-500">Rate: <span className="font-bold text-gray-800">{o.responseRate}%</span></span>
                          <span className="text-[9px] text-gray-500">Properties: <span className="font-bold text-gray-800">{o.properties?.length || 0}</span></span>
                        </div>
                        <div className="text-[9px] text-gray-600 flex items-center gap-2 flex-wrap">
                          <span>Last Activity: {toDate(o.lastActivity)}</span>
                          <span className="text-gray-400">•</span>
                          <span>Created: {toDate(o.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingOwner(o)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Quick View"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => { setSelectedOwner(o); setShowAddEditModal(true); }}
                            className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Link Property"
                          >
                            <Link2 size={13} />
                          </button>
                          <button
                            onClick={() => setViewingOwner(o)}
                            className="p-1 rounded hover:bg-gray-100 text-green-600 transition-colors"
                            title="Owner Account"
                          >
                            <UserCheck size={13} />
                          </button>
                          {canUpdate && (
                            <button
                              onClick={() => { setSelectedOwner(o); setShowAddEditModal(true); }}
                              className="p-1 rounded hover:bg-gray-100 text-orange-500 transition-colors"
                              title="Edit Owner"
                            >
                              <Edit size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete Owner"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-gray-800 font-semibold text-[10px]">
                        {o.assigned_to_name ? o.assigned_to_name.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, "") : "Unassigned"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex justify-between items-center p-3 bg-gray-50 border-t flex-wrap gap-2 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-0.5 border rounded bg-white font-bold"
            >
              {[25, 50, 100, 200, 300, 400, 500, 1000].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Showing {filteredOwners.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredOwners.length)} of {filteredOwners.length} owners</span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
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

      {/* Followup Modal */}
      {showFollowupModal && selectedOwner && (
        <OwnerFollowupModal
          isOpen={showFollowupModal}
          onClose={() => setShowFollowupModal(false)}
          ownerId={selectedOwner.id}
          onSave={loadOwners}
        />
      )}
    </div>
  );
};

export default OwnersPage;
