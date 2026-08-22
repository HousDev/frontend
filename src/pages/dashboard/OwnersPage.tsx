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
import { OwnerViewModal } from "@/components/owners/OwnerViewModal";
import TableLoader from "@/components/ui/TableLoader";
import Dropdown from "@/components/ui/Dropdown";
import LinkRentalPropertyModal from "@/components/owners/LinkRentalPropertyModal";
import rentalPropertiesAPI from "@/lib/rentalPropertiesAPI";
import { useAuth } from "@/contexts/AuthContext";
import { getMasterDropdownOptions } from "@/lib/useMasterData";
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

const safe = (v: any, fallback: string = "-") =>
  v === null || v === undefined || String(v).trim() === "" || String(v) === "null" || String(v) === "undefined"
    ? fallback
    : v;

const mapApiOwnerToUI = (api: any): UIOwner => ({
  id: Number(api.id),
  salutation: safe(api.salutation, "Mr."),
  name: safe(api.name),
  phone: safe(api.phone),
  whatsapp: safe(api.whatsapp),
  email: safe(api.email),
  state: safe(api.state),
  city: safe(api.city),
  location: safe(api.location),
  source: safe(api.source),
  priority: safe(api.priority, "medium"),
  stage: safe(api.stage, "initial_contact"),
  status: safe(api.status, "active"),
  assigned_to: Number(api.assigned_to || 0),
  assigned_to_name: safe(api.assigned_to_name, "Unassigned"),
  notes: safe(api.notes, ""),
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
  const [masters, setMasters] = useState<Record<string, any[]>>({});
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
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [quickViewOwner, setQuickViewOwner] = useState<UIOwner | null>(null);

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
  const [pendingExec, setPendingExec] = useState<string>("");
  const [pendingSource, setPendingSource] = useState<string>("");
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  const canUpdate = can(user, "owner.update");
  const canDelete = can(user, "owner.delete");
  const canCreate = can(user, "owner.create");
  const canImport = can(user, "owner.import");
  const canExport = can(user, "owner.export");
  const canAssign = can(user, "owner.assign");
  const canBulkDelete = can(user, "owner.bulk_delete");

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
    const loadMasters = async () => {
      try {
        const data = await getMasterDropdownOptions(['common', 'lead', 'buyer']);
        if (data) {
          setMasters(data);
        }
      } catch (err) {
        console.error('Failed to load masters:', err);
      }
    };
    loadMasters();
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

  const rawSourceOptions = useMemo(() => {
    const list = masters['lead source'] || masters['Lead Source'] || [];
    return list.map((o: any) => ({
      value: o.value ?? o.label,
      label: o.label ?? o.value,
    }));
  }, [masters]);

  const rawStageOptions = useMemo(() => {
    const list = masters['seller lead stage'] || masters['Seller lead stage'] || masters['lead stage'] || [];
    return list.map((o: any) => ({
      value: o.value ?? o.label,
      label: o.label ?? o.value,
    }));
  }, [masters]);

  const rawPriorityOptions = useMemo(() => {
    const list = masters['lead priority'] || masters['Lead Priority'] || [];
    return list.map((o: any) => ({
      value: o.value ?? o.label,
      label: o.label ?? o.value,
    }));
  }, [masters]);

  const sourceOptions = useMemo(() => ["all", ...rawSourceOptions.map(o => o.value)], [rawSourceOptions]);
  const stageOptions = useMemo(() => ["all", ...rawStageOptions.map(o => o.value)], [rawStageOptions]);
  const priorityOptions = useMemo(() => ["all", ...rawPriorityOptions.map(o => o.value)], [rawPriorityOptions]);

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
  const handleDirectLinkProperties = async (properties: any | any[]) => {
    if (!linkingOwnerForProp) return;
    const propsArray = Array.isArray(properties) ? properties : [properties];
    if (!propsArray.length) return;
    try {
      const currentProps = linkingOwnerForProp.properties || [];
      const updatedProps = [...currentProps, ...propsArray];

      await ownerAPI.update(String(linkingOwnerForProp.id), {
        ...linkingOwnerForProp,
        properties: updatedProps,
        property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
      });

      await Promise.all(
        propsArray.map((property) =>
          rentalPropertiesAPI.patchOwner(String(property.id), 'link', linkingOwnerForProp.id)
        )
      );

      toast.success(`${propsArray.length} rental properties linked successfully!`);
      setShowDirectLinkModal(false);
      setLinkingOwnerForProp(null);
      await loadOwners();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to link rental properties");
    }
  };

  const handleUnlinkPropertiesFromOwner = async (properties: any | any[]) => {
    if (!linkingOwnerForProp) return;
    const propsArray = Array.isArray(properties) ? properties : [properties];
    if (!propsArray.length) return;

    const result = await Swal.fire({
      title: 'Unlink Properties?',
      text: `Are you sure you want to unlink ${propsArray.length === 1 ? 'this rental property' : `${propsArray.length} rental properties`} from this owner?`,
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

    const currentProps = linkingOwnerForProp.properties || [];
    const pidsToRemove = propsArray.map(p => String(p.id || p.property_id || p._id));
    const updatedProps = currentProps.filter(
      (p: any) => !pidsToRemove.includes(String(p.id || p.property_id || p._id))
    );

    try {
      await ownerAPI.update(String(linkingOwnerForProp.id), {
        ...linkingOwnerForProp,
        properties: updatedProps,
        property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
      });

      await Promise.all(
        propsArray.map(p =>
          rentalPropertiesAPI.patchOwner(String(p.id || p.property_id || p._id), 'unlink')
        )
      );

      toast.success(`${propsArray.length} rental properties unlinked successfully!`);
      setShowDirectLinkModal(false);
      setLinkingOwnerForProp(null);
      await loadOwners();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to unlink rental properties");
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

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedOwners.length === 0) {
      toast.info("Please select owners to update status");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update owners");
      return;
    }
    try {
      const ownerIds = selectedOwners.map((id) => String(id));
      await ownerAPI.bulkUpdateLeadField(ownerIds, "status", status);
      setAllOwners((prev) =>
        prev.map((owner) =>
          selectedOwners.includes(owner.id)
            ? { ...owner, status }
            : owner,
        ),
      );
      toast.success(`Status updated for ${selectedOwners.length} owner(s)`);
      setSelectedOwners([]);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkStageUpdate = async (stage: string) => {
    if (selectedOwners.length === 0) {
      toast.info("Please select owners to update stage");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update owners");
      return;
    }
    try {
      const ownerIds = selectedOwners.map((id) => String(id));
      await ownerAPI.bulkUpdateLeadField(ownerIds, "stage", stage);
      setAllOwners((prev) =>
        prev.map((owner) =>
          selectedOwners.includes(owner.id)
            ? { ...owner, stage }
            : owner,
        ),
      );
      toast.success(`Stage updated for ${selectedOwners.length} owner(s)`);
      setSelectedOwners([]);
    } catch (err) {
      toast.error("Failed to update stage");
    }
  };

  const handleBulkPriorityUpdate = async (priority: string) => {
    if (selectedOwners.length === 0) {
      toast.info("Please select owners to update priority");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update owners");
      return;
    }
    try {
      const ownerIds = selectedOwners.map((id) => String(id));
      await ownerAPI.bulkUpdateLeadField(ownerIds, "priority", priority);
      setAllOwners((prev) =>
        prev.map((owner) =>
          selectedOwners.includes(owner.id)
            ? { ...owner, priority }
            : owner,
        ),
      );
      toast.success(`Priority updated for ${selectedOwners.length} owner(s)`);
      setSelectedOwners([]);
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  const handleBulkSourceUpdate = async (source: string) => {
    if (selectedOwners.length === 0) {
      toast.info("Please select owners to update source");
      return;
    }
    if (!canUpdate) {
      toast.error("You do not have permission to update owners");
      return;
    }
    try {
      const ownerIds = selectedOwners.map((id) => String(id));
      await ownerAPI.bulkUpdateLeadField(ownerIds, "source", source);
      setAllOwners((prev) =>
        prev.map((owner) =>
          selectedOwners.includes(owner.id)
            ? { ...owner, source }
            : owner,
        ),
      );
      toast.success(`Source updated for ${selectedOwners.length} owner(s)`);
      setSelectedOwners([]);
    } catch (err) {
      toast.error("Failed to update source");
    }
  };

  const handleBulkAssign = async (assignedTo: number) => {
    if (selectedOwners.length === 0) {
      toast.info("Please select owners to assign");
      return;
    }
    if (!canAssign) {
      toast.error("You do not have permission to assign executives");
      return;
    }
    try {
      const ownerIds = selectedOwners.map((id) => String(id));
      if (assignedTo === 0) {
        await ownerAPI.bulkAssignExecutive(ownerIds, null);
        setAllOwners((prev) =>
          prev.map((owner) =>
            selectedOwners.includes(owner.id)
              ? {
                ...owner,
                assigned_to: 0,
                assigned_to_name: "Unassigned",
              }
              : owner,
          ),
        );
        toast.success(`Unassigned ${ownerIds.length} owner(s)`);
      } else {
        await ownerAPI.bulkAssignExecutive(ownerIds, assignedTo);
        const executive = executives.find((exec) => exec.id === assignedTo);
        setAllOwners((prev) =>
          prev.map((owner) =>
            selectedOwners.includes(owner.id)
              ? {
                ...owner,
                assigned_to: assignedTo,
                assigned_to_name: `${executive?.first_name || ''} ${executive?.last_name || ''}`.trim() || executive?.name || "Executive",
              }
              : owner,
          ),
        );
        toast.success(`Assigned ${ownerIds.length} owner(s)`);
      }
      setSelectedOwners([]);
    } catch (err) {
      toast.error("Failed to assign owners");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOwners.length === 0) {
      toast.info("No owners selected for deletion.");
      return;
    }
    if (!canBulkDelete) {
      toast.error("You do not have permission to delete owners");
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${selectedOwners.length} owner(s)?`,
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
    const ids = selectedOwners.map((id) => String(id));
    setBulkDeleting(true);
    try {
      await ownerAPI.bulkDelete(selectedOwners);
      setAllOwners((prev) => prev.filter((o) => !selectedOwners.includes(o.id)));
      setSelectedOwners([]);
      Swal.fire({
        title: "Deleted!",
        text: `${ids.length} owner(s) deleted.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      toast.error("Failed to delete owners.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkExport = () => {
    const rows = allOwners
      .filter((o) => selectedOwners.includes(o.id))
      .map((o, idx) => ({
        "S.No": idx + 1,
        'ID': o.id,
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
      }));

    if (rows.length === 0) {
      toast.info("No owners selected to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = [
      { wch: 8 }, { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
      { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 10 },
      { wch: 20 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Selected_Owners_${selectedOwners.length}`);

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `owners_selected_${selectedOwners.length}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clearSelection = () => setSelectedOwners([]);

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
      <div className="hidden sm:flex items-center justify-between p-1 rounded-xl flex-wrap">
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

      {/* Mobile Action Row */}
      <div className="flex sm:hidden items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 ml-auto mt-2">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"
          >
            <SlidersHorizontal size={13} className="text-orange-500" />
            <span>Filters</span>
          </button>
          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          )}
          {canImport && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"
            >
              <Upload size={13} />
              <span>Import</span>
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => { setSelectedOwner(null); setShowAddEditModal(true); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white rounded-lg bg-[#0f2b3d]"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tabs */}
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
      {selectedOwners.length > 0 && (
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
              Selected: {selectedOwners.length}
            </span>
            {canUpdate && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <select
                  onChange={(e) => {
                    if (e.target.value)
                      handleBulkStatusUpdate(e.target.value);
                    e.target.value = "";
                  }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white cursor-pointer outline-none"
                >
                  <option value="">Status...</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  onChange={(e) => {
                    if (e.target.value)
                      handleBulkStageUpdate(e.target.value);
                    e.target.value = "";
                  }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white cursor-pointer outline-none"
                >
                  <option value="">Stage...</option>
                  {rawStageOptions.map((s) => (
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
                  className="hidden sm:block border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white cursor-pointer outline-none"
                >
                  <option value="">Priority...</option>
                  {rawPriorityOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <div className="hidden sm:block min-w-[130px]">
                  <Dropdown
                    value={pendingSource}
                    onChange={(val) => setPendingSource(val)}
                    options={rawSourceOptions}
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
                    className="hidden sm:block px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600 font-semibold"
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
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[130px] cursor-pointer outline-none"
                >
                  <option value="">Assign...</option>
                  <option value="0">Unassign</option>
                  {executives
                    .map((exec) => (
                      <option key={exec.id} value={exec.id}>
                        {exec.name || `${exec.first_name || ''} ${exec.last_name || ''}`.trim()} {exec.id === user?.id ? "(You)" : ""}
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
                    className="px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600 font-semibold"
                  >
                    Apply
                  </button>
                )}
              </div>
            )}
          </div>

          {/* MOBILE ONLY */}
          <div className="flex flex-col gap-2 w-full sm:hidden">
            <div className="flex gap-2 flex-wrap items-center">
              {canAssign && (
                <div className="flex-1 flex gap-1">
                  <select
                    value={pendingExec}
                    onChange={(e) => setPendingExec(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[100px] cursor-pointer outline-none"
                  >
                    <option value="">Assign...</option>
                    <option value="0">Unassign</option>
                    {executives
                      .map((exec) => (
                        <option key={exec.id} value={exec.id}>
                          {exec.name || `${exec.first_name || ''} ${exec.last_name || ''}`.trim()}
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
                      className="px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600 font-semibold"
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
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white cursor-pointer outline-none"
                >
                  <option value="">Priority...</option>
                  {rawPriorityOptions.map((p) => (
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
                      options={rawSourceOptions}
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
                      className="px-2 py-1 text-xs bg-orange-500 text-white rounded-lg whitespace-nowrap hover:bg-orange-600 font-semibold"
                    >
                      Apply
                    </button>
                  )}
                </div>
              )}
            </div>

            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${(canExport ? 1 : 0) + (canBulkDelete ? 1 : 0) + 1}, minmax(0, 1fr))`,
              }}
            >
              {canExport && (
                <button
                  onClick={handleBulkExport}
                  className="w-full text-center px-2 py-1 text-xs border border-emerald-300 text-emerald-600 rounded-lg truncate font-medium bg-emerald-50/50 hover:bg-emerald-50"
                >
                  Export ({selectedOwners.length})
                </button>
              )}
              {canBulkDelete && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="w-full text-center px-2 py-1 text-xs border border-red-300 text-red-600 rounded-lg truncate disabled:opacity-50 font-medium bg-red-50/50 hover:bg-red-50"
                >
                  {bulkDeleting
                    ? "…"
                    : `Delete (${selectedOwners.length})`}
                </button>
              )}
              <button
                onClick={clearSelection}
                className="w-full text-center px-2 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* DESKTOP ONLY */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto">
            {canExport && (
              <button
                onClick={handleBulkExport}
                className="px-3 py-1 text-xs border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 font-medium"
              >
                Export ({selectedOwners.length})
              </button>
            )}
            {canBulkDelete && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
              >
                {bulkDeleting ? "…" : `Delete (${selectedOwners.length})`}
              </button>
            )}
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Table View */}
      <div
        className="bg-white rounded-sm shadow-sm border border-gray-300 overflow-hidden flex flex-col"
        style={{
          height: window.innerWidth < 640
            ? selectedOwners.length > 0 ? '600px' : '680px'
            : selectedOwners.length > 0 ? '550px' : '600px',
        }}
      >
        <div
          className="scrollbar-custom-vertical flex-1 min-h-0"
          style={{
            overflowY: 'auto',
            overflowX: 'auto',
          }}
        >
          <table
            className="owners-table w-full text-left text-xs"
            style={{ minWidth: "950px", borderCollapse: "separate", borderSpacing: 0 }}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 30 }}>
              {/* Row 1: Column Headers */}
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                  <th className="w-6 px-2 py-1.5 text-center bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paginatedOwners.length > 0 && paginatedOwners.every(o => selectedOwners.includes(o.id))}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-1.5 py-1.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 w-10">
                  S.No.
                </th>
                <th className="px-2 py-1.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  COMMUNICATE
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  OWNER DETAILS
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  CONTACT &amp; LOCATION
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  BUSINESS INFO
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  PROGRESS &amp; ACTIVITY
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  PERFORMANCE
                </th>
                <th className="px-2 py-1.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  MANAGE
                </th>
                <th className="px-2 py-1.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                  ASSIGNED TO
                </th>
              </tr>

              {/* Row 2: Column Search */}
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
                    className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
                <th className="px-1.5 py-0.5 bg-gray-100">
                  <input
                    type="text"
                    placeholder="Search phone/email/location..."
                    value={colSearch.contact}
                    onChange={(e) => setColSearch(p => ({ ...p, contact: e.target.value }))}
                    className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
                <th className="px-1.5 py-0.5 bg-gray-100">
                  <select
                    value={colSearch.source}
                    onChange={(e) => setColSearch(p => ({ ...p, source: e.target.value }))}
                    className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal outline-none cursor-pointer"
                  >
                    <option value="">All Sources</option>
                    {(masters['lead source'] || masters['Lead Source'] || []).map((s: any) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </th>
                <th className="px-1.5 py-0.5 bg-gray-100">
                  <select
                    value={colSearch.stage}
                    onChange={(e) => setColSearch(p => ({ ...p, stage: e.target.value }))}
                    className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal outline-none cursor-pointer"
                  >
                    <option value="">All Stages</option>
                    {(masters['seller lead stage'] || masters['Seller lead stage'] || masters['lead stage'] || []).map((s: any) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </th>
                <th className="px-1.5 py-0.5 bg-gray-100" /> {/* PERFORMANCE */}
                <th className="px-1.5 py-0.5 bg-gray-100" /> {/* MANAGE */}
                <th className="px-1.5 py-0.5 bg-gray-100">
                  <input
                    type="text"
                    placeholder="Search assigned..."
                    value={colSearch.assigned}
                    onChange={(e) => setColSearch(p => ({ ...p, assigned: e.target.value }))}
                    className="w-full px-1.5 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <TableLoader colSpan={10} message="Loading owners..." />
              ) : paginatedOwners.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-500 font-semibold">No owners found.</td>
                </tr>
              ) : (
                paginatedOwners.map((o, index) => {
                  const sNo = startIndex + index + 1;
                  const isActive = o.status === "active";
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                        <td className="px-2 py-1 text-center bg-white">
                          <input
                            type="checkbox"
                            checked={selectedOwners.includes(o.id)}
                            onChange={() => handleSelectOwner(o.id)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-1.5 py-1 text-center text-xs font-semibold text-gray-500 bg-white">
                        {sNo}
                      </td>

                      {/* COMMUNICATE */}
                      <td className="px-2 py-1 bg-white">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() => {
                              const p = o.phone.replace(/\D/g, "");
                              if (p && p !== "-") window.open(`tel:${p}`);
                              else toast.error("No phone number");
                            }}
                            className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
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
                            className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
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
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Email"
                          >
                            <Mail size={13} />
                          </button>
                          <button
                            onClick={() => { setSelectedOwner(o); setShowFollowupModal(true); }}
                            className="p-1 rounded hover:bg-purple-100 text-purple-600 transition-colors"
                            title="Schedule Follow-up"
                          >
                            <Calendar size={13} />
                          </button>
                        </div>
                      </td>

                      {/* OWNER DETAILS */}
                      <td className="px-2 py-1 bg-white">
                        <button onClick={() => setViewingOwner(o)} className="flex items-center gap-2 group w-full text-left" title="Open Owner Details">
                          <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium shadow-sm flex-shrink-0" style={{ backgroundColor: RESALE.orange }}>
                            {(() => {
                              const f = o.name?.split(" ")[0] || "";
                              const l = o.name?.split(" ")[1] || "";
                              return (
                                (f.charAt(0) + l.charAt(0)).toUpperCase().slice(0, 2) ||
                                o.name?.charAt(0)?.toUpperCase() ||
                                "O"
                              );
                            })()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-[11px] text-gray-900 group-hover:text-orange-500 truncate">{o.salutation} {o.name}</div>
                            <div className="flex items-center gap-1 mt-0 flex-wrap">
                              <span className="text-[9px] text-gray-400">ID: {o.id}</span>
                              <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                {isActive ? "● Active" : "● Inactive"}
                              </span>
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* CONTACT & LOCATION */}
                      <td className="px-2 py-1">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1"><Phone size={9} className="text-gray-400" /><a href={`tel:${o.phone}`} className="text-[9px] text-gray-600 hover:text-orange-500">{o.phone}</a></div>
                          <div className="flex items-center gap-1"><Mail size={9} className="text-gray-400" /><a href={`mailto:${o.email}`} className="text-[9px] text-gray-600 hover:text-orange-500 truncate max-w-[120px]">{o.email}</a></div>
                          <div className="flex items-center gap-1"><MapPin size={9} className="text-gray-400" /><span className="text-[9px] text-gray-600 truncate max-w-[120px]">{o.location}</span></div>
                        </div>
                      </td>

                      {/* BUSINESS INFO */}
                      <td className="px-2 py-1">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getStageBadgeClass(o.stage)}`}>{o.stage?.replace(/_/g, " ")}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getPriorityBadgeClass(o.priority)}`}>{o.priority}</span>
                          </div>
                          <div className="text-[9px] text-gray-600">Source: <span className="font-medium">{o.source}</span></div>
                        </div>
                      </td>

                      {/* PROGRESS & ACTIVITY */}
                      <td className="px-2 py-1">
                        <div className="space-y-0.5">
                          <div>
                            <div className="flex justify-between text-[9px] mb-0.5"><span>Progress</span><span>{o.stageProgress}%</span></div>
                            <div className="w-20 bg-gray-200 rounded-full h-1"><div className="bg-orange-500 h-1 rounded-full" style={{ width: `${o.stageProgress}%` }} /></div>
                          </div>
                          <div className="text-[9px] text-gray-600">Visits: <span className="font-medium">{o.visits}</span></div>
                        </div>
                      </td>

                      {/* PERFORMANCE */}
                      <td className="px-2 py-1">
                        <div className="space-y-0.5">
                          {/* First Line */}
                          <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-gray-500">Deal Value:</span>
                              <span className="font-medium text-[10px]">₹{o.dealValue?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-gray-500">Response Rate:</span>
                              <span className="font-medium text-[10px]">{o.responseRate}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-gray-500">Properties:</span>
                              <span className="font-medium text-[10px]">{o.properties?.length || 0}</span>
                            </div>
                          </div>
                          {/* Second Line */}
                          <div className="text-[9px] text-gray-600 flex items-center gap-2 flex-wrap">
                            <div>Last Activity: <span className="font-medium">{toDate(o.lastActivity)}</span></div>
                            <span className="text-gray-400">•</span>
                            <div>Created: <span className="font-medium">{toDate(o.created_at)}</span></div>
                          </div>
                        </div>
                      </td>

                      {/* MANAGE */}
                      <td className="px-2 py-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setQuickViewOwner(o); setShowQuickViewModal(true); }}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Quick View"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => { setLinkingOwnerForProp(o); setShowDirectLinkModal(true); }}
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

                      {/* ASSIGNED TO */}
                      <td className="px-2 py-1 text-[9px] text-gray-800 font-semibold whitespace-nowrap">
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
        sources={sourceOptions}
        stages={stageOptions}
        priorities={priorityOptions}
        assignedUsers={[
          { id: "all", name: "All" },
          ...executives.map(e => ({
            id: String(e.id),
            name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim()
          }))
        ]}
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
          onLinkProperties={handleDirectLinkProperties}
          onUnlinkProperties={handleUnlinkPropertiesFromOwner}
          linkingOwner={linkingOwnerForProp}
        />
      )}

      {showQuickViewModal && quickViewOwner && (
        <OwnerViewModal
          isOpen={showQuickViewModal}
          owner={quickViewOwner}
          onClose={() => {
            setShowQuickViewModal(false);
            setQuickViewOwner(null);
          }}
          onViewFull={(o) => setViewingOwner(o)}
          onEdit={(o) => { setSelectedOwner(o); setShowAddEditModal(true); }}
          canEdit={canUpdate}
        />
      )}
    </div>
  );
};

export default OwnersPage;
