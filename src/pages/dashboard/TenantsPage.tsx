import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, Edit, Trash2, Phone, Mail, MapPin,
  Building, User, FileText, X, SlidersHorizontal, Download, Upload,
  Loader2, RefreshCw, ChevronLeft, ChevronRight, Eye, Link2,
  UserCheck, CheckSquare, Send, Share2, ExternalLink, Bell,
  Calendar,
  Share
} from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";

import { tenantAPI } from "@/lib/tenantAPI";
import { usersAPI } from "@/lib/api";
import { rentalPropertiesAPI } from "@/lib/rentalPropertiesAPI";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import TenantSidebarFilter, { TenantFiltersState } from "./components/TenantSidebarFilter";
import ImportTenantsModal from "@/components/tenants/ImportTenantsModal";
import TenantFormModal from "@/components/tenants/TenantFormModal";
import TenantAccountPage from "@/components/tenant-account/TenantAccountPage";
import TenantViewPage from "@/components/tenants/TenantViewPage";
import TenantViewModal from "@/components/tenants/TenantViewModal";
import TenantFollowupModal from "@/components/tenants/TenantFollowupModal";
import LinkRentalPropertyModal from "@/components/tenants/LinkRentalPropertyModal";
import TableLoader from "@/components/ui/TableLoader";
import Pagination from "@/components/ui/Pagination";






interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferred_location: string;
  budget_min: string | number;
  budget_max: string | number;
  preferred_bhk: string;
  tenant_type: string;
  move_in_date?: string;
  current_address?: string;
  notes?: string;
  status: string;
  rental_property_id?: number | string | null;
  property_title?: string;
  owner_name?: string;
  assigned_to?: number | string;
  assigned_to_name?: string;
  created_at?: string;
}

const BRAND = '#e67e22';

export default function TenantsPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [loading, setLoading] = useState(false);

  // Bulk selection
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);

  // Search & Filter state
  const [colSearch, setColSearch] = useState({
    name: "",
    contact: "",
    requirements: "",
    property: "",
    status: "",
  });

  const [filters, setFilters] = useState<TenantFiltersState>({
    status: "",
    tenant_type: "",
    preferred_bhk: "",
    assigned: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [currentTenantView, setCurrentTenantView] = useState<Tenant | null>(null);
  const [viewModalTenant, setViewModalTenant] = useState<Tenant | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [followupModalTenant, setFollowupModalTenant] = useState<Tenant | null>(null);
  const [bhkMasterOptions, setBhkMasterOptions] = useState<string[]>([]);
  const [activeTabStatus, setActiveTabStatus] = useState<string>('All');
  const [linkModalTenant, setLinkModalTenant] = useState<Tenant | null>(null);
  const [pendingExec, setPendingExec] = useState<string>('');


  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: tenants.length,
      'Active Search': 0,
      Interested: 0,
      'Agreement Signed': 0,
      Inactive: 0,
    };
    tenants.forEach((t) => {
      const s = t.status?.trim() || 'Active Search';
      if (counts[s] !== undefined) {
        counts[s]++;
      } else {
        counts['Active Search'] = (counts['Active Search'] || 0) + 1;
      }
    });
    return counts;
  }, [tenants]);


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Metadata for filter options
  const [executives, setExecutives] = useState<any[]>([]);
  // Track viewport width safely (avoids "window is not defined" on SSR + updates on resize)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 640);
    checkWidth(); // set correct value on mount
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantAPI.getAll();
      setTenants(data || []);
      setSelectedTenants([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tenant database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
    const fetchExecutives = async () => {
      try {
        const usersRes = await usersAPI.getAllUsers();
        if (usersRes.success && Array.isArray(usersRes.data)) {
          const execs = usersRes.data.filter((u: any) =>
            u.role?.name === 'Executive' || u.role?.name === 'Admin' || u.role?.name === 'Super Admin'
          );
          setExecutives(execs);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const fetchMasterBhk = async () => {
      try {
        const data = await getMasterDropdownOptions(["bhk"]);
        const opts: MasterOption[] = data["bhk"] || [];
        if (opts && opts.length > 0) {
          setBhkMasterOptions(opts.map(o => o.label));
        } else {
          const altData = await getMasterDropdownOptions(["preferred_bhk"]);
          const altOpts: MasterOption[] = altData["preferred_bhk"] || [];
          if (altOpts && altOpts.length > 0) {
            setBhkMasterOptions(altOpts.map(o => o.label));
          }
        }
      } catch (err) {
        console.error("Failed to load master BHK options", err);
      }
    };
    fetchExecutives();
    fetchMasterBhk();
  }, []);

  const handleInputChange = (col: keyof typeof colSearch, val: string) => {
    setColSearch(prev => ({ ...prev, [col]: val }));
    setCurrentPage(1);
  };

  // Filtered & Searched Tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      // 0. Status Tab Filter
      if (activeTabStatus !== 'All' && (t.status?.trim() || 'Active Search') !== activeTabStatus) {
        return false;
      }

      // 1. Column Search
      if (colSearch.name && !t.name.toLowerCase().includes(colSearch.name.toLowerCase()) && !t.tenant_id.toLowerCase().includes(colSearch.name.toLowerCase())) return false;
      if (colSearch.contact && !t.phone.includes(colSearch.contact) && !(t.whatsapp || '').includes(colSearch.contact) && !(t.email || "").toLowerCase().includes(colSearch.contact.toLowerCase())) return false;
      if (colSearch.requirements && !(t.preferred_bhk || '').toLowerCase().includes(colSearch.requirements.toLowerCase()) && !(t.preferred_location || '').toLowerCase().includes(colSearch.requirements.toLowerCase())) return false;
      if (colSearch.property && !t.property_title?.toLowerCase().includes(colSearch.property.toLowerCase()) && !`rent-${t.rental_property_id}`.toLowerCase().includes(colSearch.property.toLowerCase()) && !(t.owner_name || "").toLowerCase().includes(colSearch.property.toLowerCase())) return false;
      if (colSearch.status && !(t.status || '').toLowerCase().includes(colSearch.status.toLowerCase())) return false;

      // 2. Sidebar Filters
      if (filters.status && t.status !== filters.status) return false;
      if (filters.tenant_type && t.tenant_type !== filters.tenant_type) return false;
      if (filters.preferred_bhk && !(t.preferred_bhk || '').toLowerCase().includes(filters.preferred_bhk.toLowerCase())) return false;
      if (filters.assigned && String(t.assigned_to) !== String(filters.assigned)) return false;

      return true;
    });
  }, [tenants, colSearch, filters, activeTabStatus]);


  // Pagination helpers
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTenants(paginatedTenants.map(t => t.id));
    } else {
      setSelectedTenants([]);
    }
  };

  const handleTenantSelect = (id: number) => {
    setSelectedTenants(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setEditingTenant(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingTenant) {
        await tenantAPI.update(editingTenant.id, formData);
        toast.success("Tenant updated successfully!");
      } else {
        await tenantAPI.create(formData);
        toast.success("Tenant added successfully!");
      }
      setShowFormModal(false);
      loadTenants();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save tenant");
    }
  };

  const handleDeleteTenant = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e67e22',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await tenantAPI.delete(id);
          toast.success('Tenant profile deleted.');
          loadTenants();
        } catch (err) {
          toast.error("Failed to delete tenant");
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedTenants.length === 0) return;
    Swal.fire({
      title: 'Bulk Delete Selected Tenants?',
      text: `Are you sure you want to delete the ${selectedTenants.length} selected tenant profiles permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete All',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await tenantAPI.bulkDelete(selectedTenants);
          toast.success(`${selectedTenants.length} tenant profiles deleted.`);
          loadTenants();
        } catch (err) {
          toast.error("Failed to execute bulk delete.");
        }
      }
    });
  };

  const handleBulkAssign = async () => {
    if (selectedTenants.length === 0) return;
    const execOptions = executives.map((e: any) => `<option value="${e.id}">${e.name || e.username || e.email}</option>`).join('');
    const { value: selectedExec } = await Swal.fire({
      title: 'Bulk Assign Executive',
      html: `<select id="swal-exec-select" class="swal2-input"><option value="">-- Select Executive --</option>${execOptions}</select>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const val = (document.getElementById('swal-exec-select') as HTMLSelectElement)?.value;
        if (!val) {
          Swal.showValidationMessage('Please select an executive');
        }
        return val;
      }
    });

    if (selectedExec) {
      try {
        await tenantAPI.bulkAssign(selectedTenants, selectedExec);
        toast.success(`Assigned ${selectedTenants.length} tenants to executive.`);
        loadTenants();
      } catch (err) {
        toast.error('Failed bulk assign.');
      }
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedTenants.length === 0) return;
    const statuses = ['Active Search', 'Interested', 'Agreement Signed', 'Inactive'];
    const statusOptions = statuses.map((s) => `<option value="${s}">${s}</option>`).join('');
    const { value: selectedStatus } = await Swal.fire({
      title: 'Bulk Update Status',
      html: `<select id="swal-status-select" class="swal2-input"><option value="">-- Select Status --</option>${statusOptions}</select>`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const val = (document.getElementById('swal-status-select') as HTMLSelectElement)?.value;
        if (!val) {
          Swal.showValidationMessage('Please select a status');
        }
        return val;
      }
    });

    if (selectedStatus) {
      try {
        await tenantAPI.bulkUpdateStatus(selectedTenants, selectedStatus);
        toast.success(`Updated status for ${selectedTenants.length} tenants.`);
        loadTenants();
      } catch (err) {
        toast.error('Failed bulk status update.');
      }
    }
  };

  const handleBulkAssignDirect = async (execId: string) => {
    if (!execId || selectedTenants.length === 0) return;
    try {
      await tenantAPI.bulkAssign(selectedTenants, execId);
      toast.success(`Assigned ${selectedTenants.length} tenants to executive.`);
      setPendingExec('');
      loadTenants();
    } catch (err) {
      toast.error('Failed bulk assign.');
    }
  };

  const handleBulkUpdateStatusDirect = async (statusStr: string) => {
    if (!statusStr || selectedTenants.length === 0) return;
    try {
      await tenantAPI.bulkUpdateStatus(selectedTenants, statusStr);
      toast.success(`Updated status for ${selectedTenants.length} tenants.`);
      loadTenants();
    } catch (err) {
      toast.error('Failed bulk status update.');
    }
  };

  const handleLinkPropertyToTenant = (tenantRow: Tenant) => {
    setLinkModalTenant(tenantRow);
  };

  const handleLinkPropertySubmit = async (propertyId: number | string, propertyTitle: string) => {
    if (!linkModalTenant) return;
    try {
      await tenantAPI.update(linkModalTenant.id, {
        rental_property_id: propertyId,
        property_title: propertyTitle
      });
      toast.success(`Linked property to ${linkModalTenant.name}`);
      loadTenants();
    } catch (err) {
      toast.error('Failed to link property');
      throw err;
    }
  };



  const handleExport = () => {
    const dataToExport = filteredTenants.map((t) => ({
      "Tenant ID": t.tenant_id,
      "Name": t.name,
      "Email": t.email || "",
      "Phone": t.phone,
      "Whatsapp": t.whatsapp || "",
      "Tenant Type": t.tenant_type || "",
      "Preferred Location": t.preferred_location || "",
      "Preferred BHK": t.preferred_bhk || "",
      "Min Budget": t.budget_min || "",
      "Max Budget": t.budget_max || "",
      "Move In Date": t.move_in_date || "",
      "Linked Property": t.rental_property_id ? `RENT-${t.rental_property_id}` : "Unlinked",
      "Owner/Landlord": t.owner_name || "",
      "Assigned Executive": t.assigned_to_name || "",
      "Status": t.status,
      "Notes": t.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tenants");
    XLSX.writeFile(workbook, "Tenants_Database_Export.xlsx");
    toast.success("Database exported to Excel!");
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
    const s = status.trim();
    switch (s) {
      case 'Active Search':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Interested':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Agreement Signed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default: {
        // Dynamic hashing for custom master options
        const colors = [
          'bg-blue-50 text-blue-700 border-blue-200',
          'bg-indigo-50 text-indigo-700 border-indigo-200',
          'bg-purple-50 text-purple-700 border-purple-200',
          'bg-amber-50 text-amber-700 border-amber-200',
          'bg-teal-50 text-teal-700 border-teal-200',
          'bg-cyan-50 text-cyan-700 border-cyan-200',
          'bg-rose-50 text-rose-700 border-rose-200',
        ];
        let hash = 0;
        for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
      }
    }
  };

  if (currentTenantView) {
    const currentIndex = filteredTenants.findIndex(t => t.id === currentTenantView.id);
    return (
      <TenantViewPage
        tenant={currentTenantView}
        onBack={() => setCurrentTenantView(null)}
        onNext={() => {
          if (currentIndex >= 0 && currentIndex < filteredTenants.length - 1) {
            setCurrentTenantView(filteredTenants[currentIndex + 1]);
          }
        }}
        onPrevious={() => {
          if (currentIndex > 0) {
            setCurrentTenantView(filteredTenants[currentIndex - 1]);
          }
        }}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalTenants={filteredTenants.length}
        onUpdateTenant={(updated) => {
          setTenants(prev => prev.map(item => item.id === updated.id ? updated : item));
          setCurrentTenantView(updated);
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
          .tenant-table-custom tbody td {
            border-right: 1px solid rgba(209, 213, 219, 0.5);
            border-bottom: 1px solid rgba(209, 213, 219, 0.5);
          }
          .tenant-table-custom tbody td:last-child {
            border-right: none;
          }
          .tenant-table-custom thead th {
            border-right: 1px solid rgba(209, 213, 219, 0.4);
          }
          .tenant-table-custom thead th:last-child {
            border-right: none;
          }
        `}
      </style>
      <div className="h-full overflow-y-auto scrollbar-custom-vertical" >
        <div className="max-w-[1600px] mx-auto px-2 sm:px-2 md:px-2 py-1 sm:py-2 flex flex-col gap-2">
          {/* Top Row: Status Filter Tabs & Action Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 p-2 bg-gray-50/70 rounded-xl  flex-shrink-0">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto scrollbar-hide py-0.5">
              {[
                { label: 'All', key: 'All' },
                { label: 'Active Search', key: 'Active Search' },
                { label: 'Interested', key: 'Interested' },
                { label: 'Agreement Signed', key: 'Agreement Signed' },
                { label: 'Inactive', key: 'Inactive' },
              ].map((tab) => {
                const count = statusCounts[tab.key] || 0;
                const isActive = activeTabStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTabStatus(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${isActive
                      ? 'bg-white text-orange-600 shadow-xs '
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 border border-transparent'
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-200/70 text-gray-600'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
              <button
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-all bg-white ${Object.values(filters).some(Boolean)
                  ? "border-orange-200 bg-orange-50 text-[#e67e22]"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <SlidersHorizontal size={13} />
                <span>Filters</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors bg-white shadow-2xs"
              >
                <Download size={13} />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-colors bg-white shadow-2xs"
              >
                <Upload size={13} />
                <span>Import</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg transition-all bg-slate-900 hover:bg-slate-800 shadow-xs"
              >
                <Plus size={15} />
                <span>+ Add Tenant</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Bar (Matching Screenshot 2) */}
          {selectedTenants.length > 0 && (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2.5 flex items-center justify-between flex-wrap gap-2 animate-fadeIn">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Selected Count Badge */}
                <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold">
                  Selected: {selectedTenants.length}
                </span>

                {/* Status Dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkUpdateStatusDirect(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs bg-white text-gray-700 font-medium outline-none focus:ring-1 focus:ring-orange-500 min-w-[130px]"
                >
                  <option value="">Update Status...</option>
                  <option value="Active Search">Active Search</option>
                  <option value="Interested">Interested</option>
                  <option value="Agreement Signed">Agreement Signed</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Assign Executive Dropdown */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">Assign:</span>
                  <select
                    value={pendingExec}
                    onChange={(e) => setPendingExec(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs bg-white text-gray-700 font-medium outline-none focus:ring-1 focus:ring-orange-500 min-w-[140px]"
                  >
                    <option value="">Assign Executive...</option>
                    <option value="Unassigned">Unassign</option>
                    {executives.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.username || u.email}
                      </option>
                    ))}
                  </select>
                  {pendingExec && (
                    <button
                      onClick={() => handleBulkAssignDirect(pendingExec === 'Unassigned' ? '' : pendingExec)}
                      className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons Right Side */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleBulkUpdateStatusDirect('Active Search')}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkUpdateStatusDirect('Inactive')}
                  className="px-3 py-1 text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  Mark Inactive
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Export ({selectedTenants.length})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete ({selectedTenants.length})
                </button>
                <button
                  onClick={() => setSelectedTenants([])}
                  className="px-3 py-1 text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div
            className="bg-white  border border-gray-300 shadow-sm overflow-hidden flex flex-col"
            style={{
              height: isMobile ? '700px' : '580px',
              minHeight: isMobile ? '700px' : '580px',
              maxHeight: isMobile ? '700px' : '580px',
            }}
          >
            <div className="scrollbar-custom-vertical flex-1 min-h-0 relative" style={{ overflowY: "auto", overflowX: isMobile ? "auto" : "hidden" }}>
              {loading ? (
                <TableLoader colSpan={8} />
              ) : (
                <table
                  className="w-full tenant-table-custom"
                  style={{
                    tableLayout: isMobile ? "auto" : "fixed",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    minWidth: isMobile ? "900px" : "auto",
                  }}
                >
                  <thead className="sticky top-0 z-10" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    {/* Headers */}
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-2 py-1.5 text-center bg-gray-50 border-r border-b border-gray-200" style={{ width: "3%" }}>
                        <input
                          type="checkbox"
                          checked={paginatedTenants.length > 0 && paginatedTenants.every(t => selectedTenants.includes(t.id))}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 cursor-pointer"
                        />
                      </th>
                      <th className="px-2 py-1.5 text-center bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "4%" }}>S.No.</th>
                      <th className="px-2 py-1.5 text-center bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-orange-600 uppercase tracking-wider" style={{ width: "11%" }}>COMMUNICATE</th>
                      <th className="px-3 py-1.5 text-left bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "12%" }}>Tenant Details</th>
                      <th className="px-3 py-1.5 text-left bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "12%" }}>Contact Details</th>
                      <th className="px-3 py-1.5 text-left bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "7%" }}>Unit Type</th>
                      <th className="px-3 py-1.5 text-left bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "10%" }}>Budget</th>
                      <th className="px-3 py-1.5 text-left bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "12%" }}>Location</th>
                      <th className="px-3 py-1.5 text-left bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "13%" }}>Linked Property</th>
                      <th className="px-3 py-1.5 text-center bg-gray-50 border-r border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "9%" }}>Status</th>
                      <th className="px-3 py-1.5 text-center bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider" style={{ width: "11%" }}>Actions</th>
                    </tr>
                    {/* Search Fields */}
                    <tr className="bg-gray-100">
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100"></th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100"></th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100"></th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100">
                        <input
                          type="text"
                          value={colSearch.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Search ID/Name..."
                          className="w-full px-2 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal"
                        />
                      </th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100">
                        <input
                          type="text"
                          value={colSearch.contact}
                          onChange={(e) => handleInputChange("contact", e.target.value)}
                          placeholder="Search Contact..."
                          className="w-full px-2 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal"
                        />
                      </th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100">
                        <input
                          type="text"
                          value={colSearch.requirements}
                          onChange={(e) => handleInputChange("requirements", e.target.value)}
                          placeholder="BHK..."
                          className="w-full px-2 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal"
                        />
                      </th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100"></th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100"></th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100">
                        <input
                          type="text"
                          value={colSearch.property}
                          onChange={(e) => handleInputChange("property", e.target.value)}
                          placeholder="Prop/Owner..."
                          className="w-full px-2 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal"
                        />
                      </th>
                      <th className="px-2 py-0.5 border-r border-b border-gray-200 bg-gray-100">
                        <input
                          type="text"
                          value={colSearch.status}
                          onChange={(e) => handleInputChange("status", e.target.value)}
                          placeholder="Status..."
                          className="w-full px-2 py-0.5 text-[9px] border border-gray-300 rounded bg-white font-normal text-center"
                        />
                      </th>
                      <th className="px-2 py-0.5 border-b border-gray-200 bg-gray-100"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 text-xs text-gray-700 bg-white">
                    {paginatedTenants.length > 0 ? (
                      paginatedTenants.map((t, index) => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-2 py-2 text-center border-r border-b border-gray-200 bg-white">
                            <input
                              type="checkbox"
                              checked={selectedTenants.includes(t.id)}
                              onChange={() => handleTenantSelect(t.id)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-3 h-3 cursor-pointer"
                            />
                          </td>
                          <td className="px-2 py-2 text-center text-gray-400 font-bold border-r border-b border-gray-200">
                            {startIndex + index + 1}
                          </td>

                          {/* COMMUNICATE column (right after S.No.) */}
                          <td className="px-2 py-1 text-center border-r border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-center gap-1">
                              {/* Call */}
                              <button
                                onClick={() => {
                                  const p = t.phone?.replace(/\D/g, '');
                                  if (p) window.location.href = `tel:${p}`;
                                  else toast.error('No phone number available');
                                }}
                                className="p-1 rounded hover:bg-green-100 transition-colors text-green-600"
                                title="Call"
                              >
                                <Phone size={13} />
                              </button>

                              {/* WhatsApp */}
                              <button
                                onClick={() => {
                                  const p = (t.whatsapp || t.phone)?.replace(/\D/g, '');
                                  if (p) {
                                    const msg = encodeURIComponent(
                                      `Hi ${t.name},\n\n` +
                                      `Regarding your rental property search in ${t.preferred_location || 'preferred location'}.\n` +
                                      `Budget: ₹${t.budget_min || 0} - ₹${t.budget_max || 0}/mo.\n\n` +
                                      `We have properties matching your requirement. Let us know your availability.\n\n` +
                                      `Best Regards,\nResaleExpert`
                                    );
                                    window.open(`https://wa.me/${p}?text=${msg}`, '_blank');
                                  } else {
                                    toast.error('No phone number available for WhatsApp');
                                  }
                                }}
                                className="p-1 rounded hover:bg-green-100 transition-colors text-green-600"
                                title="WhatsApp"
                              >
                                <SiWhatsapp size={13} />
                              </button>

                              {/* Email */}
                              <button
                                onClick={() => {
                                  if (t.email) {
                                    const sub = encodeURIComponent(`Rental Requirement Update - ${t.name}`);
                                    const body = encodeURIComponent(`Dear ${t.name},\n\nWe have property options matching your ${t.preferred_bhk || ''} requirement in ${t.preferred_location || ''}.\n\nBest Regards,\nResaleExpert`);
                                    window.location.href = `mailto:${t.email}?subject=${sub}&body=${body}`;
                                  } else {
                                    toast.error('No email address available');
                                  }
                                }}
                                className="p-1 rounded hover:bg-blue-100 transition-colors text-blue-600"
                                title="Email"
                              >
                                <Mail size={13} strokeWidth={1.8} />
                              </button>

                              {/* Send Properties */}
                              <button
                                onClick={() => {
                                  setCurrentTenantView(t);
                                }}
                                className="p-1 rounded hover:bg-yellow-100 transition-colors text-yellow-600"
                                title="Send Properties"
                              >
                                <Share size={13} />
                              </button>

                              {/* Follow-up */}
                              <button
                                onClick={() => setFollowupModalTenant(t)}
                                className="p-1 rounded hover:bg-purple-100 transition-colors text-purple-600"
                                title="Follow-up"
                              >
                                <Calendar size={13} />
                              </button>
                            </div>
                          </td>


                          {/* Tenant Details */}
                          <td className="px-3 py-2 border-r border-b border-gray-200 overflow-hidden">
                            <div
                              onClick={() => setCurrentTenantView(t)}
                              className="font-semibold text-gray-900 truncate hover:text-[#e67e22] cursor-pointer transition-colors"
                              title="Click to view tenant details"
                            >
                              {t.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-[#e67e22] font-bold">{t.tenant_id}</span>
                              <span className="text-[9px] text-gray-400 capitalize truncate">• {t.tenant_type || 'Renter'}</span>
                            </div>
                          </td>

                          {/* Contact Details: phone line 1, email line 2 */}
                          <td className="px-3 py-2 border-r border-b border-gray-200 overflow-hidden">
                            <div className="flex items-center gap-1">
                              <Phone size={10} className="text-gray-400 flex-shrink-0" />
                              <span className="text-[10px]">{t.phone}</span>
                            </div>
                            {t.email && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="text-[10px] text-gray-500 truncate">{t.email}</span>
                              </div>
                            )}
                          </td>

                          {/* BHK */}
                          <td className="px-2 py-1.5 border-r border-b border-gray-200 text-center">
                            <span className="text-[10px] font-bold text-gray-700">{t.preferred_bhk || '—'}</span>
                          </td>

                          {/* Budget */}
                          <td className="px-2 py-1.5 border-r border-b border-gray-200">
                            {(Number(t.budget_min) > 0 || Number(t.budget_max) > 0) ? (
                              <span className="text-[10px] font-bold text-green-700 whitespace-nowrap">
                                ₹{Number(t.budget_min).toLocaleString('en-IN')} – ₹{Number(t.budget_max).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-[9px] text-gray-400 italic">Not set</span>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-2 py-1.5 border-r border-b border-gray-200">
                            {(() => {
                              const locDisplay = t.preferred_location || (t as any).location || 'Any Location';
                              return (
                                <div className="flex items-center gap-1" title={locDisplay}>
                                  <MapPin size={10} className="text-orange-500 flex-shrink-0" />
                                  <span className="text-[10px] font-medium text-slate-700 truncate max-w-[220px]">
                                    {locDisplay}
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Linked Context */}
                          <td className="px-3 py-2 border-r border-b border-gray-200 overflow-hidden">
                            {t.rental_property_id ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-[#e67e22] border border-orange-100">
                                  RENT-{t.rental_property_id}
                                </span>
                                <span className="text-[9px] text-gray-400 truncate">{t.property_title}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">No linked property</span>
                            )}
                            {t.owner_name && (
                              <div className="text-[9px] text-gray-500 flex items-center gap-1 mt-0.5">
                                <User size={9} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">Owner: <strong className="text-slate-700">{t.owner_name}</strong></span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2 text-center border-r border-b border-gray-200 overflow-hidden">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusColor(t.status)}`}>
                              {t.status}
                            </span>
                            {t.assigned_to_name && (
                              <div className="text-[9px] text-gray-400 mt-0.5 font-medium truncate">Exec: {t.assigned_to_name}</div>
                            )}
                          </td>

                          <td className="px-3 py-2 text-center border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-center gap-1">
                              {/* Link Property Icon */}
                              <button
                                onClick={() => handleLinkPropertyToTenant(t)}
                                className="p-1 rounded hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-colors"
                                title="Link Rental Property"
                              >
                                <Link2 size={13} />
                              </button>

                              {/* View Details Pop-up Modal */}
                              <button
                                onClick={() => {
                                  setViewModalTenant(t);
                                  setShowViewModal(true);
                                }}
                                className="p-1 rounded hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-colors"
                                title="Quick View Pop-up Modal"
                              >
                                <Eye size={13} />
                              </button>


                              {/* Standalone Tenant Account Page Link */}
                              <button
                                onClick={() => navigate(`/dashboard/tenants-account/${t.id}`)}
                                className="p-1 rounded hover:bg-purple-50 text-green-500 hover:text-purple-600 transition-colors"
                                title="Open Full Tenant Account Page"
                              >
                                <UserCheck size={13} />
                              </button>

                              {/* Edit Tenant */}
                              <button
                                onClick={() => handleOpenEditModal(t)}
                                className="p-1 rounded hover:bg-gray-100 text-orange-500 hover:text-orange-500 transition-colors"
                                title="Edit Tenant"
                              >
                                <Edit size={13} />
                              </button>

                              {/* Delete Tenant */}
                              <button
                                onClick={() => handleDeleteTenant(t.id)}
                                className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                                title="Delete Tenant"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-gray-400 italic">
                          No tenants match your search filter criteria.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            {filteredTenants.length > 0 && (
              <div className="px-2 sm:px-3 py-2 border-t border-gray-200 bg-white">
                {/* MOBILE */}
                <div className="flex flex-col gap-2 sm:hidden">
                  <div className="text-[10px] text-gray-500 text-center">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants</div>
                  <div className="flex items-center justify-between gap-2">
                    {selectedTenants.length === 0 && (
                      <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }} className="min-w-[60px] px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white">
                        {[15, 30, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
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

                {/* DESKTOP PAGINATION (Matching BuyersPage.tsx) */}
                <div className="hidden sm:flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] text-gray-500 whitespace-nowrap">
                      Showing {startIndex + 1}-
                      {Math.min(startIndex + itemsPerPage, filteredTenants.length)}{" "}
                      of {filteredTenants.length} tenants
                    </div>
                    {selectedTenants.length === 0 && (
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(parseInt(e.target.value, 10));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 text-[11px] border border-gray-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        {[25, 50, 100, 200, 300, 400, 500, 1000].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                        <option value={999999}>All</option>
                      </select>
                    )}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Advanced Filters */}
      {showFilters && (
        <TenantSidebarFilter
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
          resetFilters={() => setFilters({ status: "", tenant_type: "", preferred_bhk: "", assigned: "" })}
          statuses={["Active Search", "Interested", "Agreement Signed", "Inactive"]}
          tenantTypes={["Family", "Bachelor (Male)", "Bachelor (Female)", "Company"]}
          bhkOptions={bhkMasterOptions.length > 0 ? bhkMasterOptions : ["1 BHK", "2 BHK", "3 BHK", "4 BHK"]}
          assignedUsers={executives.map(e => ({ id: e.id, name: `${e.first_name} ${e.last_name}` }))}
        />
      )}

      {/* Tenant View Pop-up Modal */}
      {showViewModal && viewModalTenant && (
        <TenantViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setViewModalTenant(null);
          }}
          tenant={viewModalTenant}
          onEdit={(tenant) => {
            setShowViewModal(false);
            handleOpenEditModal(tenant);
          }}
        />
      )}

      {/* Tenant Create / Edit Form Modal */}
      {showFormModal && (
        <TenantFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          mode={editingTenant ? "edit" : "create"}
          initialData={editingTenant}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Import Tenants Modal */}
      {showImportModal && (
        <ImportTenantsModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={loadTenants}
        />
      )}

      {/* Visual Link Property Modal */}
      {linkModalTenant && (
        <LinkRentalPropertyModal
          isOpen={Boolean(linkModalTenant)}
          onClose={() => setLinkModalTenant(null)}
          tenantName={linkModalTenant.name}
          currentLinkedPropertyId={linkModalTenant.rental_property_id}
          onLinkProperty={handleLinkPropertySubmit}
        />
      )}

      {/* Schedule Follow-up Modal */}
      {followupModalTenant && (
        <TenantFollowupModal
          isOpen={Boolean(followupModalTenant)}
          onClose={() => setFollowupModalTenant(null)}
          tenant={followupModalTenant}
          onSave={loadTenants}
        />
      )}
    </>
  );
}


