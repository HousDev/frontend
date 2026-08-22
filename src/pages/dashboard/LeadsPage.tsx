


// src/pages/LeadsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Filter, Phone, Mail, Eye, Edit, Trash2, Download, Users,
  ChevronDown, ChevronUp, X, Check, AlertCircle, Search,
  Calendar, MapPin, Tag, User, Clock, MoreVertical, CheckSquare, Square,
  ArrowUpDown, SlidersHorizontal, Trash as TrashIcon, UserPlus, RefreshCw,
  Upload
} from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import AddLeadModal from './components/AddLeadModal';
import ImportLeadsModal from './components/ImportLeadsModal';
import FilterModal from './components/FilterModal';
import { leadsAPI, usersAPI } from '@/lib/api';
import { notificationAPI } from '@/lib/notificationAPI';
import { filterLeadsByRole } from '@/utils/roleBasedLeadFilter';
import { toast } from 'react-toastify';
import { can } from "@/utils/permission";
import { getAssignableExecutives } from '@/utils/roleBasedOptions';
import Swal from 'sweetalert2';
import FollowupModal from '../../pages/dashboard/components/FollowupModal'; // or wherever your modal is located

import * as XLSX from 'xlsx';
import { FaWhatsapp } from 'react-icons/fa6';

// Resale Theme Colors
const RESALE = {
  navy: '#f3f4f6',        // gray-100 (background)
  navyLight: '#e5e7eb',   // gray-200
  navyDark: '#d1d5db',    // gray-300
  orange: '#e67e22',
  orangeLight: '#f39c12',
  orangeDark: '#d35400',
};

interface Lead {
  id: string;
  lead_number?: number;
  salutation: string;
  name: string;
  phone: string;
  email: string;
  lead_type: string;
  lead_source: string;
  whatsapp_number: string;
  city: string;
  location: string;
  status: string;
  created_at: string;
  notes: string;
  assigned_executive?: string;
  assigned_executive_name?: string;
  updated_by_name?: string;
  created_by_name?: string;
  priority?: string;
  last_contacted_by?: string;
  last_contacted_by_name?: string;
  created_by?: string;
}

type TabID = 'all' | 'contacted' | 'new' | 'qualified' | 'unqualified';

const LeadsPage: React.FC = () => {
  const { user } = useAuth();

  // Permission checks
  const canRead = can(user, 'lead.read');
  const canCreate = can(user, 'lead.create');
  const canUpdate = can(user, 'lead.update');
  const canDelete = can(user, 'lead.delete');
  const canAssign = can(user, 'lead.assign');
  const canBulkDelete = can(user, 'lead.bulk_delete');
  const canImport = can(user, 'data.import');
  const canExport = can(user, 'data.export');

  // Main content access check
  if (!canRead) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f6f8' }}>
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Access Denied
            </div>
            <div className="text-gray-600 text-sm">
              You do not have permission to view leads.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [presalesUsers, setPresalesUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    () => Number(localStorage.getItem('leads_rows_per_page')) || 25
  );
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<TabID>('new');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Add these with other bulk action states
  const [bulkStage, setBulkStage] = useState<string>('');
  const [bulkPriority, setBulkPriority] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    contact: "",
    location: "",
    source: "",
    status: "",
    created: "",
    priority: "",
  });
  const [showLeadFollowupModal, setShowLeadFollowupModal] = useState(false);
  const [selectedLeadForFollowup, setSelectedLeadForFollowup] = useState<Lead | null>(null);

  // Column-level search filters (inline under table headers)
  const [colSearch, setColSearch] = useState({
    name: "",
    contact: "",
    location: "",
    source: "",
    priority: "",
    status: "",
    created: "",
  });

  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    leadType: 'all',
    assignedExecutive: 'all',
    createdBy: 'all',
    priority: 'all',
    city: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    ignoreDate: false,
    sortOrder: 'desc',
  });

  // Bulk
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkAssignee, setBulkAssignee] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);
  const [pendingAssignee, setPendingAssignee] = useState<string>(''); // pending executive before Apply

  const statusKey = (s: string | undefined | null) => String(s ?? '').trim().toLowerCase();
  const toOption = (v: string) => ({ label: v.charAt(0).toUpperCase() + v.slice(1), value: v });

  // ---------- names ----------
  const formatUserName = (u: any) => {
    if (!u) return '';
    const fn = u?.first_name || u?.name || '';
    const ln = u?.last_name || '';
    const full = `${fn}${ln ? ' ' + ln : ''}`.trim();
    return full.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, '').trim();
  };

  const currentActorName = useMemo(() => formatUserName(user) || 'Admin', [user]);

  const usersById = useMemo(() => {
    const map: Record<string, any> = {};
    (presalesUsers || []).forEach((u: any) => {
      const id = String(u.id ?? u._id ?? u.user_id ?? u.value ?? '');
      if (id) map[id] = u;
    });
    return map;
  }, [presalesUsers]);

  const resolveUserNameById = (id?: string | number | null) => {
    if (!id) return '';
    const u = usersById[String(id)];
    return u ? formatUserName(u) : '';
  };

  // ---------- options ----------
  const statusOptions = useMemo(() => ([
    { label: "All", value: "all" },
    ...Array.from(new Set(allLeads.map(l => (l.status ? l.status.toLowerCase() : "new")).filter(Boolean))).map(toOption),
  ]), [allLeads]);

  const assignedOptions = useMemo(() => ([
    { label: "All", value: "all" },
    { label: "Unassigned", value: "Unassigned" },
    ...Array.from(new Set(allLeads
      .map(l => l.assigned_executive_name || "")
      .filter(Boolean)
    )).map(name => ({ label: name, value: name })),
  ]), [allLeads]);

  const createdByOptions = useMemo(() => ([
    { label: "All", value: "all" },
    ...Array.from(new Set(allLeads
      .map(l => l.created_by_name || "")
      .filter(Boolean)
    )).map(name => ({ label: name, value: name })),
  ]), [allLeads]);

  const sourceOptions = useMemo(() => ([
    { label: "All", value: "all" },
    ...Array.from(new Set(allLeads.map(l => (l.lead_source ? l.lead_source.toLowerCase() : "").replace(/\s+/g, '_')).filter(Boolean)))
      .map(s => ({ label: s.replace(/_/g, " "), value: s })),
  ]), [allLeads]);

  const leadTypeOptions = useMemo(() => ([
    { label: "All", value: "all" },
    ...Array.from(new Set(allLeads.map(l => (l.lead_type ? l.lead_type.toLowerCase() : "").trim()).filter(Boolean))).map(toOption),
  ]), [allLeads]);

  // ---------- ONLY Presales Executives for bulk assign ----------
  const presalesExecutivesOnly = useMemo(() => {
    const n = (s: any) => (s ?? "").trim().toLowerCase();
    return (presalesUsers || []).filter((u) => {
      const role = n(u.role);
      const dept = n(u.department);
      const isActive = u.is_active !== 0 && u.is_active !== false && u.is_active !== '0' && u.is_active !== 'false' && u.is_active !== null;
      return dept === "presales" && role === "presales executive" && isActive;
    });
  }, [presalesUsers]);

  const assignableExecutives = useMemo(() => {
    const list = getAssignableExecutives(user, presalesExecutivesOnly);
    return list.map((u: any) => ({
      id: String(u.id),
      name: u.name,
      selfOnly: u.selfOnly ?? false,
      raw: u.raw ?? null,
    }));
  }, [user, presalesExecutivesOnly]);

  // ---------- tabs with resale theme ----------
  const tabs = useMemo(() => ([
    { id: 'all' as TabID, label: 'All', count: allLeads.length },
    { id: 'new' as TabID, label: 'New', count: allLeads.filter(l => statusKey(l.status) === 'new').length },
    { id: 'contacted' as TabID, label: 'Contacted', count: allLeads.filter(l => statusKey(l.status) === 'contacted').length },
    { id: 'qualified' as TabID, label: 'Qualified', count: allLeads.filter(l => statusKey(l.status) === 'qualified').length },
    { id: 'unqualified' as TabID, label: 'Unqualified', count: allLeads.filter(l => statusKey(l.status) === 'unqualified').length },
  ]), [allLeads]);

  // ---------- fetch leads with role-based filtering ----------
  const fetchLeads = async () => {
    if (!canRead) {
      toast.error('You do not have permission to view leads');
      return;
    }

    try {
      setLoading(true);

      const response = await leadsAPI.getLeads();
      const data = Array.isArray(response?.data) ? response.data : response?.data?.data ?? [];

      let leads: any[] = data;

      if (!presalesUsers || presalesUsers.length === 0) {
        try {
          const ures = await usersAPI.getAllUsers();
          setPresalesUsers(ures.data || []);
        } catch (e) {
          console.error("Failed to fetch users", e);
        }
      }

      const filteredLeads = filterLeadsByRole(user, leads, presalesUsers || []);

      const usersMap: Record<string, any> = {};
      (presalesUsers || []).forEach((u: any) => {
        const id = String(u.id ?? u._id ?? u.user_id ?? '');
        if (id) usersMap[id] = u;
      });

      const enhancedLeads = filteredLeads.map((lead: any) => {
        const enhancedLead = { ...lead };
        if (lead.assigned_executive) {
          const exec = usersMap[String(lead.assigned_executive)];
          if (exec) enhancedLead.assigned_executive_name = formatUserName(exec);
        }
        if (enhancedLead.assigned_executive_name) {
          enhancedLead.assigned_executive_name = enhancedLead.assigned_executive_name
            .replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, '')
            .trim();
        }
        if (lead.created_by) {
          const creator = usersMap[String(lead.created_by)];
          if (creator) enhancedLead.created_by_name = formatUserName(creator);
        }
        if (lead.last_contacted_by) {
          const contactor = usersMap[String(lead.last_contacted_by)];
          if (contactor) enhancedLead.last_contacted_by_name = formatUserName(contactor);
        }
        return enhancedLead;
      });

      setAllLeads(enhancedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await usersAPI.getAllUsers();
        setPresalesUsers(res.data || []);
      } catch (e) {
        console.error("Failed to fetch users", e);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user && canRead) {
      fetchLeads();
    }
  }, [user, presalesUsers]);

  useEffect(() => {
    localStorage.setItem('leads_rows_per_page', String(itemsPerPage));
  }, [itemsPerPage]);

  // ---------- utils ----------
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Invalid Date";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
  };

  const priorityOptions = useMemo(() => ([
    { label: "All", value: "all" },
    ...Array.from(new Set(allLeads.map(l => (l.priority ? l.priority.toLowerCase() : "").trim()).filter(Boolean)))
      .map(p => ({ label: p.charAt(0).toUpperCase() + p.slice(1), value: p }))
  ]), [allLeads]);

  // ---------- filtered leads (top bar + column search combined) ----------
  const filteredLeads = useMemo(() => {
    const f = filters, s = searchFilters, cs = colSearch;
    const normalize = (v?: string) => (v ?? '').toLowerCase();

    const inDateRange = (created_at: string) => {
      if (f.ignoreDate) return true;
      if (!f.dateFrom && !f.dateTo) return true;
      const d = new Date(created_at);
      if (Number.isNaN(d.getTime())) return false;
      if (f.dateFrom) {
        const from = new Date(f.dateFrom);
        if (d < from) return false;
      }
      if (f.dateTo) {
        const to = new Date(f.dateTo + 'T23:59:59');
        if (d > to) return false;
      }
      return true;
    };

    let results = allLeads.filter((lead) => {

      const globalSearch = searchTerm.toLowerCase();
      if (globalSearch && !(
        (lead.name || '').toLowerCase().includes(globalSearch) ||
        (lead.phone || '').toLowerCase().includes(globalSearch) ||
        (lead.email || '').toLowerCase().includes(globalSearch) ||
        (lead.city || '').toLowerCase().includes(globalSearch) ||
        (lead.location || '').toLowerCase().includes(globalSearch)
      )) return false;
      // Sidebar filters
      if (f.status !== 'all' && normalize(lead.status) !== normalize(f.status)) return false;
      if (f.source !== 'all' && normalize(lead.lead_source) !== normalize(f.source)) return false;
      if (f.leadType !== 'all' && normalize(lead.lead_type) !== normalize(f.leadType)) return false;
      if (f.city && !normalize(lead.city).includes(normalize(f.city))) return false;
      if (f.location && !normalize(lead.location).includes(normalize(f.location))) return false;
      if (!inDateRange(lead.created_at)) return false;
      if (f.createdBy !== 'all' && lead.created_by_name !== f.createdBy) return false;
      if (f.priority !== 'all' && normalize(lead.priority) !== normalize(f.priority)) return false;

      // Top search bar filters
      if (s.name && !normalize(lead.name).includes(normalize(s.name))) return false;
      if (s.contact) {
        const needle = normalize(s.contact);
        if (!normalize(lead.phone).includes(needle) && !normalize(lead.email).includes(needle)) return false;
      }
      if (s.location) {
        const locNeedle = normalize(s.location);
        if (!normalize(lead.city).includes(locNeedle) && !normalize(lead.location).includes(locNeedle)) return false;
      }
      if (s.source && !normalize(lead.lead_source).includes(normalize(s.source))) return false;
      if (s.status && !normalize(lead.status).includes(normalize(s.status))) return false;
      if (s.priority && !normalize(lead.priority).includes(normalize(s.priority))) return false;
      if (s.created && !formatDate(lead.created_at).toLowerCase().includes(s.created.toLowerCase())) return false;

      // Column-level search filters
      if (cs.name && !normalize(lead.name).includes(normalize(cs.name))) return false;
      if (cs.contact) {
        const n = normalize(cs.contact);
        if (!normalize(lead.phone).includes(n) && !normalize(lead.email).includes(n)) return false;
      }
      if (cs.location) {
        const n = normalize(cs.location);
        if (!normalize(lead.city).includes(n) && !normalize(lead.location).includes(n)) return false;
      }
      if (cs.source && !normalize(lead.lead_source).includes(normalize(cs.source))) return false;
      if (cs.priority && !normalize(lead.priority).includes(normalize(cs.priority))) return false;
      if (cs.status && !normalize(lead.status).includes(normalize(cs.status))) return false;
      if (cs.created) {
        const searchValue = normalize(cs.created);
        const dateMatch = formatDate(lead.created_at).toLowerCase().includes(searchValue);
        const assignedMatch = (lead.assigned_executive_name || 'Unassigned').toLowerCase().includes(searchValue);
        if (!dateMatch && !assignedMatch) return false;
      }
      if (f.assignedExecutive !== 'all') {
        if (f.assignedExecutive === 'Unassigned') {
          const hasExec = (lead.assigned_executive && String(lead.assigned_executive).trim() !== "") ||
            (lead.assigned_executive_name && lead.assigned_executive_name.trim() !== "" && lead.assigned_executive_name.toLowerCase() !== "unassigned");
          if (hasExec) return false;
        } else {
          if (lead.assigned_executive_name !== f.assignedExecutive) return false;
        }
      }

      if (activeTab !== 'all' && statusKey(lead.status) !== activeTab) return false;

      return true;
    });

    results = results.sort((a, b) => {
      const dA = new Date(a.created_at).getTime();
      const dB = new Date(b.created_at).getTime();
      if (f.sortOrder === 'asc') return dA - dB;
      return dB - dA;
    });


    return results;
  }, [allLeads, filters, searchFilters, colSearch, activeTab, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchFilters, colSearch, activeTab]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage)));
  }, [filteredLeads, itemsPerPage]);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  // ---------- ADD LEAD ----------
  const handleAddLead = async (newLeadData: any) => {
    if (!canCreate) {
      toast.error('You do not have permission to create leads');
      return;
    }

    try {
      const res = await leadsAPI.createLead(newLeadData);
      const created = res?.data?.data ?? res?.data ?? {};
      const createdId = created.id ?? created._id ?? String(Date.now());

      if (newLeadData.assigned_executive) {
        const assigneeId = String(newLeadData.assigned_executive);
        const assigneeName = resolveUserNameById(assigneeId) || "User";

        if (assigneeId === String(user?.id)) {
          const adminUsers = presalesUsers.filter((u: any) =>
            (u.role || '').toLowerCase() === 'admin' || (u.role || '').toLowerCase() === 'superadmin'
          );
          for (const admin of adminUsers) {
            await notificationAPI.createNotification({
              leadId: createdId,
              userId: admin.id,
              message: `Lead assigned to you by ${currentActorName}`,
              type: "lead_assign",
              link: `/dashboard/leads/${createdId}`,
            });
          }
          toast.success("Lead created and assigned to you successfully");
        } else {
          await notificationAPI.createNotification({
            leadId: createdId,
            userId: assigneeId,
            message: `New lead assigned to you by ${currentActorName}`,
            type: "lead_assign",
            link: `/dashboard/leads/${createdId}`,
          });
          toast.success(`Lead assigned to ${assigneeName} successfully`);
        }
      } else {
        toast.success("Lead added successfully");
      }

      await fetchLeads();

      if (newLeadData.assigned_executive === user?.id) {
        setCurrentPage(1);
      } else {
        setActiveTab("all");
        setCurrentPage(1);
      }

      setShowAddLeadModal(false);
    } catch (error: any) {
      console.error("Error adding lead:", error);
      if (error?.response?.status === 409) {
        toast.error(error?.response?.data?.message || "Duplicate entry found");
      } else {
        toast.error("Failed to add lead");
      }
    }
  };

  // ---------- EDIT LEAD ----------
  const handleEditLead = async (updatedLeadData: any) => {
    if (!canUpdate) {
      toast.error('You do not have permission to update leads');
      return;
    }

    try {
      const cleanPayload = { ...updatedLeadData, assigned_executive: updatedLeadData.assigned_executive };
      delete (cleanPayload as any).assigned_executive_name;
      delete (cleanPayload as any).lead_number; // 🔒 system-managed, never update manually

      const response = await leadsAPI.updateLead(cleanPayload.id, cleanPayload);
      const updated = response?.data ?? response?.data?.data;

      if (updated) {
        const prevLead = allLeads.find((l) => l.id === (updated.id ?? updatedLeadData.id));
        const wasAssignedToMe = prevLead?.assigned_executive &&
          String(prevLead.assigned_executive) === String(user?.id);
        const nowAssignedToMe = updated.assigned_executive &&
          String(updated.assigned_executive) === String(user?.id);

        await fetchLeads();

        if (wasAssignedToMe && !nowAssignedToMe) {
          setActiveTab("all");
        }

        if (!wasAssignedToMe && nowAssignedToMe) {
          setActiveTab("all");
        }

        setCurrentPage(1);

        if (updated.assigned_executive &&
          String(updated.assigned_executive) !== String(prevLead?.assigned_executive || '')) {
          try {
            await notificationAPI.createNotification({
              leadId: updated.id ?? updatedLeadData.id,
              userId: updated.assigned_executive,
              message: `Lead reassigned to you by ${currentActorName}`,
              type: "lead_assign",
              link: `/dashboard/leads/${updated.id ?? updatedLeadData.id}`,
            });
          } catch (error: any) {
            console.error("Failed to send notification:", error);
          }
        }

        toast.success("Lead updated successfully");
        setShowEditLeadModal(false);
        setSelectedLead(null);
      }
    } catch (error: any) {
      console.error("Error updating lead:", error);
      if (error?.response?.status === 409) {
        toast.error(error?.response?.data?.message || "Duplicate entry found");
      } else {
        toast.error("Failed to update lead");
      }
    }
  };

  // ---------- selection ----------
  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]);
  };

  const handleSelectAll = () => {
    const idsOnPage = pageSlice.map(l => l.id);
    const allChecked = idsOnPage.length > 0 && idsOnPage.every(id => selectedLeads.includes(id));
    if (allChecked) setSelectedLeads(prev => prev.filter(id => !idsOnPage.includes(id)));
    else setSelectedLeads(prev => Array.from(new Set([...prev, ...idsOnPage])));
  };

  // ---------- DELETE SINGLE LEAD ----------
  const handleDeleteLead = async (leadId: string, leadName?: string) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete leads');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete lead "${leadName || leadId}". This action cannot be undone!`,
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
      await leadsAPI.deleteLead(leadId);
      setAllLeads(prev => prev.filter(lead => lead.id !== leadId));
      setSelectedLeads(prev => prev.filter(id => id !== leadId));

      Swal.fire({
        title: 'Deleted!',
        text: 'Lead has been deleted successfully.',
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
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to delete lead',
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
  // ---------- EXPORT ----------
  const exportLeads = async () => {
    if (!canExport) {
      toast.error('You do not have permission to export leads');
      return;
    }

    try {
      // Prepare data for Excel export
      const exportData = filteredLeads.map((lead) => ({
        'Salutation': lead.salutation || '',
        'Name': lead.name || '',
        'Phone': lead.phone || '',
        'Email': lead.email || '',
        'City': lead.city || '',
        'Location': lead.location || '',
        'Lead Source': lead.lead_source || '',
        'Lead Type': lead.lead_type || '',
        'Status': lead.status || 'New',
        'Priority': lead.priority || 'N/A',
        'Assigned Executive': lead.assigned_executive_name || 'Unassigned',
        'Created At': lead.created_at ? new Date(lead.created_at).toLocaleString() : '',
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns (optional - set column widths)
      const colWidths = [
        { wch: 12 }, // Salutation
        { wch: 25 }, // Name
        { wch: 15 }, // Phone
        { wch: 30 }, // Email
        { wch: 20 }, // City
        { wch: 25 }, // Location
        { wch: 20 }, // Lead Source
        { wch: 15 }, // Lead Type
        { wch: 12 }, // Status
        { wch: 10 }, // Priority
        { wch: 25 }, // Assigned Executive
        { wch: 20 }, // Created At
        { wch: 20 }, // Last Updated
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Leads exported successfully as Excel file');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads');
    }
  };

  // ---------- badges with resale theme ----------
  const getSourceBadgeClass = (src?: string) => {
    const key = (src || '').toLowerCase().replace(/[^a-z]/g, '');
    const map: Record<string, string> = {
      emailmarketing: 'bg-indigo-100 text-indigo-800',
      referral: 'bg-emerald-100 text-emerald-800',
      socialmedia: 'bg-fuchsia-100 text-fuchsia-800',
      walkin: 'bg-sky-100 text-sky-800',
      website: 'bg-blue-100 text-blue-800',
      googleads: 'bg-amber-100 text-amber-800',
      facebook: 'bg-rose-100 text-rose-800',
      instagram: 'bg-pink-100 text-pink-800',
      whatsapp: 'bg-green-100 text-green-800',
      coldcall: 'bg-slate-100 text-slate-800',
      portal: 'bg-indigo-100 text-indigo-800',
      event: 'bg-purple-100 text-purple-800',
    };
    return map[key] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      hot: 'bg-red-100 text-red-800',
      warm: 'bg-yellow-100 text-yellow-800',
      cold: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      lost: 'bg-gray-100 text-gray-800',
      new: 'bg-sky-100 text-sky-800',
      contacted: 'bg-indigo-100 text-indigo-800',
      unqualified: 'bg-rose-100 text-rose-800',
    };
    return statusClasses[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadgeClass = (priority?: string) => {
    const map: Record<string, string> = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return map[priority?.toLowerCase() || ''] || "bg-gray-100 text-gray-700";
  };

  // ---------- BULK DELETE ----------
  const handleBulkDelete = async () => {
    if (!canBulkDelete) {
      toast.error('You do not have permission to bulk delete leads');
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error("No leads selected");
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedLeads.length} lead(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, delete ${selectedLeads.length} lead(s)!`,
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

    setBulkLoading(true);
    try {
      if ((leadsAPI as any).bulkDeleteLeads) {
        await (leadsAPI as any).bulkDeleteLeads({ ids: selectedLeads });
      } else {
        for (const id of selectedLeads) {
          await leadsAPI.deleteLead(id);
        }
      }

      setAllLeads((prev) => prev.filter((l) => !selectedLeads.includes(l.id)));
      setSelectedLeads([]);

      Swal.fire({
        title: 'Deleted!',
        text: `${selectedLeads.length} lead(s) have been deleted successfully.`,
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
    } catch (err: any) {
      console.error('Bulk delete failed:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to delete leads',
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
      setBulkLoading(false);
    }
  };

  // ---------- BULK STATUS UPDATE ----------
  const handleBulkStatusUpdate = async () => {
    if (!canUpdate) {
      toast.error('You do not have permission to update leads');
      return;
    }

    if (!bulkStatus) {
      toast.error('Please select a status to update');
      return;
    }
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }
    setBulkLoading(true);
    try {
      await leadsAPI.bulkUpdateLeads({
        ids: selectedLeads,
        status: bulkStatus,
      });

      setAllLeads(prev =>
        prev.map(l =>
          selectedLeads.includes(l.id)
            ? { ...l, status: bulkStatus } as Lead
            : l
        )
      );

      toast.success(`Updated ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} to "${bulkStatus}"`);
      setSelectedLeads([]);
      setBulkStatus('');
    } catch (err) {
      console.error('Bulk status update failed:', err);
      toast.error('Bulk status update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  // ---------- BULK ASSIGN ----------
  const handleBulkAssign = async () => {
    if (!canAssign) {
      toast.error('You do not have permission to assign leads');
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }
    if (!bulkAssignee) {
      toast.error('Please choose an assignee (or Unassign)');
      return;
    }

    setBulkLoading(true);
    try {
      const newAssigneeId = bulkAssignee === 'Unassigned' ? null : bulkAssignee;
      const currentUserId = String(user?.id || '');

      const prevAssignments: Record<string, string> = {};
      selectedLeads.forEach(id => {
        const lead = allLeads.find(l => l.id === id);
        if (lead) {
          prevAssignments[id] = String(lead.assigned_executive || '');
        }
      });

      if ((leadsAPI as any).bulkAssignExecutives) {
        await (leadsAPI as any).bulkAssignExecutives({
          ids: selectedLeads,
          assigned_executive: newAssigneeId,
        });
      } else if ((leadsAPI as any).bulkUpdateLeads) {
        await (leadsAPI as any).bulkUpdateLeads({
          ids: selectedLeads,
          assigned_executive: newAssigneeId,
        });
      } else {
        for (const id of selectedLeads) {
          await leadsAPI.updateLead(id, { assigned_executive: newAssigneeId });
        }
      }

      const isSelfAssign = newAssigneeId && String(newAssigneeId) === currentUserId;

      if (isSelfAssign) {
        await fetchLeads();
      } else if (newAssigneeId) {
        setAllLeads(prev => prev.filter(l => !selectedLeads.includes(l.id)));
      } else {
        setAllLeads(prev => prev.filter(l => !selectedLeads.includes(l.id)));
      }

      if (newAssigneeId) {
        const assigneeName = resolveUserNameById(newAssigneeId) || 'User';

        for (const leadId of selectedLeads) {
          const prevAssigned = prevAssignments[leadId];
          if (!prevAssigned || String(prevAssigned) !== String(newAssigneeId)) {
            try {
              await notificationAPI.createNotification({
                leadId,
                userId: newAssigneeId,
                message: `New lead assigned to you by ${currentActorName}`,
                type: "lead_assign",
                link: `/dashboard/leads/${leadId}`,
              });
            } catch (e) {
              console.error('Notification failed:', e);
            }
          }
        }

        toast.success(`Assigned ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} to ${assigneeName}`);
      } else {
        toast.success(`Unassigned ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''}`);
      }

      setSelectedLeads([]);
      setBulkAssignee('');
    } catch (err) {
      console.error('Bulk assignment failed:', err);
      toast.error('Bulk assignment failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDistributeEqually = async () => {
    if (!canAssign) {
      toast.error('You do not have permission to assign leads');
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }

    if (assignableExecutives.length === 0) {
      toast.error('No executives available for assignment');
      return;
    }

    setBulkLoading(true);
    try {
      const assignments: Record<string, string[]> = {};
      assignableExecutives.forEach(exec => {
        assignments[exec.id] = [];
      });

      selectedLeads.forEach((leadId, index) => {
        const execIndex = index % assignableExecutives.length;
        const execId = assignableExecutives[execIndex].id;
        assignments[execId].push(leadId);
      });

      for (const [execId, leadIds] of Object.entries(assignments)) {
        if (leadIds.length > 0) {
          if ((leadsAPI as any).bulkAssignExecutives) {
            await (leadsAPI as any).bulkAssignExecutives({
              ids: leadIds,
              assigned_executive: execId,
            });
          } else if ((leadsAPI as any).bulkUpdateLeads) {
            await (leadsAPI as any).bulkUpdateLeads({
              ids: leadIds,
              assigned_executive: execId,
            });
          } else {
            for (const id of leadIds) {
              await leadsAPI.updateLead(id, { assigned_executive: execId });
            }
          }
        }
      }

      await fetchLeads();
      toast.success(`Successfully distributed ${selectedLeads.length} lead(s) equally among executives`);
      setSelectedLeads([]);
    } catch (err) {
      console.error('Lead distribution failed:', err);
      toast.error('Lead distribution failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const isExecutive = useMemo(() => {
    const userRole = (user?.role || '').toLowerCase();
    const userDept = (user?.department || '').toLowerCase();
    return userRole.includes('executive') || userDept.includes('sales') || userDept.includes('presales');
  }, [user]);

  const colSearchInputStyle: any = {
    width: '100%',
    background: 'rgba(255,255,255,0.15)', // brighter gray
    border: '2px solid rgba(255,255,255,0.25)', // slightly stronger border
    borderRadius: '5px',
    padding: '3px 7px',
    fontSize: '11px',
    outline: 'none',
  };

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

      <div className="" style={{ backgroundColor: '#f5f6f8' }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-2 md:px-2 py-0 sm:py-2">

          {/* Header Section */}
          {/* ── TABS ROW (desktop) - UNCHANGED ── */}
          <div className="hidden sm:flex items-center justify-between gap-2 mb-2">

            {/* Tabs */}
            <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
              <div className="flex gap-1 min-w-max bg-gray-100 p-0.5 rounded-lg">
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
                onClick={() => setShowFilterSidebar(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={12} />
                <span>Filters</span>
              </button>

              {canExport && (
                <button
                  onClick={exportLeads}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Download size={12} />
                  <span>Export</span>
                </button>
              )}

              {canImport && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Upload size={12} />
                  <span>Import</span>
                </button>
              )}

              {canCreate && (
                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-white rounded-md transition-colors bg-[#0f2b3d]"
                >
                  <Plus size={12} />
                  <span>Add Lead</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex sm:hidden items-center justify-between gap-2 mb-2">

            <div className="flex items-center gap-1 ml-auto overflow-x-auto scrollbar-hide">

              <button
                onClick={() => setShowFilterSidebar(true)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-black bg-white border border-gray-200 rounded-md whitespace-nowrap"
              >
                <SlidersHorizontal size={11} />
                <span>Filters</span>
              </button>

              {canExport && (
                <button
                  onClick={exportLeads}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-black bg-white border border-gray-200 rounded-md whitespace-nowrap"
                >
                  <Download size={11} />
                  <span>Export</span>
                </button>
              )}

              {canImport && (
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-black bg-white border border-gray-200 rounded-md whitespace-nowrap"
                >
                  <Upload size={11} />
                  <span>Import</span>
                </button>
              )}

              {canCreate && (
                <button
                  onClick={() => setShowAddLeadModal(true)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-white rounded-md whitespace-nowrap"
                  style={{ backgroundColor: RESALE.orange }}
                >
                  <Plus size={11} />
                  <span>Add Lead</span>
                </button>
              )}
            </div>
          </div>

          {/* ── MOBILE: Row 2 — Tabs + per page ── */}
          <div className="flex sm:hidden items-center gap-2 mb-2">

            {/* Tabs */}
            <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
              <div className="flex gap-1 min-w-max bg-gray-100 p-0.5 rounded-lg">

                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${isActive
                          ? "bg-white shadow-sm"
                          : "text-gray-500"
                        }`}
                      style={isActive ? { color: RESALE.orange } : {}}
                    >
                      <span>{tab.label}</span>

                      <span
                        className="px-1 py-0.5 rounded-full text-[9px] font-semibold"
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

            {/* Per Page */}
            {/* <select
    value={itemsPerPage}
    onChange={(e) =>
      setItemsPerPage(parseInt(e.target.value, 10))
    }
    className="flex-shrink-0 px-2 py-1 text-[11px] border border-gray-200 rounded-md bg-white"
  >
    {[10, 20, 50, 100].map((n) => (
      <option key={n} value={n}>
        {n}/pg
      </option>
    ))}
  </select> */}
          </div>

          {/* ── BULK ACTION BAR (Only Status & Assign - like Seller page) ── */}
          {selectedLeads.length > 0 && (canUpdate || canAssign || canBulkDelete) && (
            <div className="bg-white border border-gray-200 rounded-lg p-1.5 mb-2 shadow-sm flex flex-col gap-1.5 sm:flex-row sm:items-center sm:flex-wrap">

              <div className="flex items-center gap-1.5 w-full sm:w-auto">

                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap"
                  style={{
                    color: RESALE.orange,
                    backgroundColor: `${RESALE.orange}15`,
                    borderColor: `${RESALE.orange}40`
                  }}
                >
                  {selectedLeads.length}
                </span>

                {canUpdate && (
                  <select
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (!val) return;
                      e.target.value = "";
                      if (selectedLeads.length === 0) { toast.error('No leads selected'); return; }
                      if (!canUpdate) { toast.error('You do not have permission to update leads'); return; }
                      setBulkLoading(true);
                      try {
                        await leadsAPI.bulkUpdateLeads({ ids: selectedLeads, status: val });
                        setAllLeads(prev =>
                          prev.map(l => selectedLeads.includes(l.id) ? { ...l, status: val } as Lead : l)
                        );
                        toast.success(`Updated ${selectedLeads.length} lead(s) to "${val}"`);
                        setSelectedLeads([]);
                      } catch (err) {
                        toast.error('Bulk status update failed');
                      } finally {
                        setBulkLoading(false);
                      }
                    }}
                    className="border border-gray-300 rounded-md px-1.5 py-0.5 text-[11px] bg-white h-6"
                  >
                    <option value="">Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="unqualified">Unqualified</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                )}



                {/* Mobile only: Assign dropdown - same row as Status */}
                {canAssign && (
                  <div className="sm:hidden flex items-center gap-1">
                    <select
                      value={pendingAssignee}
                      onChange={(e) => setPendingAssignee(e.target.value)}
                      className="border border-gray-300 rounded-md px-1.5 py-0.5 text-[11px] bg-white min-w-[100px] h-6"
                    >
                      <option value="">Assign...</option>
                      <option value="Unassigned">Unassign</option>
                      {assignableExecutives.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    {pendingAssignee && (
                      <button
                        onClick={async () => {
                          if (selectedLeads.length === 0) { toast.error('No leads selected'); return; }
                          if (!canAssign) { toast.error('You do not have permission to assign leads'); return; }
                          const newAssigneeId = pendingAssignee === 'Unassigned' ? null : pendingAssignee;
                          setBulkLoading(true);
                          try {
                            if ((leadsAPI as any).bulkAssignExecutives) {
                              await (leadsAPI as any).bulkAssignExecutives({ ids: selectedLeads, assigned_executive: newAssigneeId });
                            } else {
                              await (leadsAPI as any).bulkUpdateLeads({ ids: selectedLeads, assigned_executive: newAssigneeId });
                            }
                            await fetchLeads();
                            const assigneeName = newAssigneeId ? resolveUserNameById(newAssigneeId) || 'User' : null;
                            toast.success(newAssigneeId ? `Assigned ${selectedLeads.length} lead(s) to ${assigneeName}` : `Unassigned ${selectedLeads.length} lead(s)`);
                            setSelectedLeads([]);
                            setPendingAssignee('');
                          } catch (err) {
                            toast.error('Bulk assignment failed');
                          } finally {
                            setBulkLoading(false);
                          }
                        }}
                        disabled={bulkLoading}
                        className="px-2 py-0.5 text-[11px] bg-orange-500 text-white rounded-md h-6 whitespace-nowrap hover:bg-orange-600 disabled:opacity-50"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                )}

                {/* Desktop only: Assign dropdown with label */}
                {canAssign && (
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">Assign:</span>
                    <select
                      value={pendingAssignee}
                      onChange={(e) => setPendingAssignee(e.target.value)}
                      className="border border-gray-300 rounded-md px-1.5 py-0.5 text-[11px] bg-white min-w-[110px] h-6"
                    >
                      <option value="">Assign...</option>
                      <option value="Unassigned">Unassign</option>
                      {assignableExecutives.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    {pendingAssignee && (
                      <button
                        onClick={async () => {
                          if (selectedLeads.length === 0) { toast.error('No leads selected'); return; }
                          if (!canAssign) { toast.error('You do not have permission to assign leads'); return; }
                          const newAssigneeId = pendingAssignee === 'Unassigned' ? null : pendingAssignee;
                          setBulkLoading(true);
                          try {
                            if ((leadsAPI as any).bulkAssignExecutives) {
                              await (leadsAPI as any).bulkAssignExecutives({ ids: selectedLeads, assigned_executive: newAssigneeId });
                            } else {
                              await (leadsAPI as any).bulkUpdateLeads({ ids: selectedLeads, assigned_executive: newAssigneeId });
                            }
                            await fetchLeads();
                            const assigneeName = newAssigneeId ? resolveUserNameById(newAssigneeId) || 'User' : null;
                            toast.success(newAssigneeId ? `Assigned ${selectedLeads.length} lead(s) to ${assigneeName}` : `Unassigned ${selectedLeads.length} lead(s)`);
                            setSelectedLeads([]);
                            setPendingAssignee('');
                          } catch (err) {
                            toast.error('Bulk assignment failed');
                          } finally {
                            setBulkLoading(false);
                          }
                        }}
                        disabled={bulkLoading}
                        className="px-2 py-0.5 text-[11px] bg-orange-500 text-white rounded-md h-6 whitespace-nowrap hover:bg-orange-600 disabled:opacity-50"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* MOBILE ONLY - Action buttons row */}
              <div className="flex sm:hidden">
                <div className="grid gap-1.5 w-full" style={{ gridTemplateColumns: `repeat(${(canExport ? 1 : 0) + (canBulkDelete ? 1 : 0) + 1}, minmax(0, 1fr))` }}>
                  {canExport && (
                    <button
                      onClick={exportLeads}
                      className="w-full text-center px-1.5 py-0.5 text-[11px] border border-emerald-300 text-emerald-600 rounded-md truncate"
                    >
                      Export ({selectedLeads.length})
                    </button>
                  )}
                  {canBulkDelete && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkLoading}
                      className="w-full text-center px-1.5 py-0.5 text-[11px] border border-red-300 text-red-600 rounded-md truncate disabled:opacity-50"
                    >
                      {bulkLoading ? "…" : `Delete (${selectedLeads.length})`}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedLeads([])}
                    className="w-full text-center px-1.5 py-0.5 text-[11px] border border-gray-200 text-gray-600 rounded-md"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* DESKTOP ONLY - Action buttons */}
              <div className="hidden sm:flex items-center gap-1.5 ml-auto">
                {canExport && (
                  <button
                    onClick={exportLeads}
                    className="px-2 py-0.5 text-[11px] border border-emerald-300 text-emerald-600 rounded-md hover:bg-emerald-50"
                  >
                    Export ({selectedLeads.length})
                  </button>
                )}
                {canBulkDelete && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkLoading}
                    className="px-2 py-0.5 text-[11px] border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                  >
                    {bulkLoading ? "…" : `Delete (${selectedLeads.length})`}
                  </button>
                )}
                <button
                  onClick={() => setSelectedLeads([])}
                  className="px-2 py-0.5 text-[11px] border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>

            </div>
          )}






          {/* ===================== LEADS TABLE CARD ===================== */}
          {/* flex-col so the pagination sticks to the bottom outside the scroll area */}
          <div
            className="bg-white rounded-sm shadow-sm border border-gray-300 overflow-hidden flex flex-col"
            style={{
              height: window.innerWidth < 640
                ? selectedLeads.length > 0 ? '600px' : '680px'
                : selectedLeads.length > 0 ? '570px' : '620px',
            }}
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* Scrollable table wrapper with dynamic max-height */}
                <div
                  className="overflow-y-auto overflow-x-auto flex-1 min-h-0 scrollbar-custom-vertical"
                >
                  <table className="w-full" style={{ minWidth: '1000px' }}>

                    {/* sticky thead */}
                    <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
                      {/* Main column headers */}
                      <tr style={{ backgroundColor: RESALE.navy }}>
                        {/* CHECKBOX */}
                        <th className="w-6 px-2 py-1.5">
                          <input
                            type="checkbox"
                            checked={pageSlice.length > 0 && pageSlice.every(l => selectedLeads.includes(l.id))}
                            onChange={handleSelectAll}
                            className="rounded w-3 h-3"
                            style={{ accentColor: '#e5e7eb', borderColor: '#d1d5db', borderWidth: '1px', borderStyle: 'solid' }}
                          />
                        </th>

                        {/* S.NO */}
                        <th className="px-1.5 py-1.5 text-center text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap w-10">
                          S.No.
                        </th>

                        {/* 🆕 COMMUNICATE column header */}
                        <th className="px-2 py-1.5 text-center text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          COMMUNICATE
                        </th>

                        {/* NAME (was previously first) */}
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          NAME
                        </th>

                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          CONTACT
                        </th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          LOCATION
                        </th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          SOURCE
                        </th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          PRIORITY
                        </th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          STATUS
                        </th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          CREATED / ASSIGNED
                        </th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-bold text-black uppercase tracking-wider whitespace-nowrap">
                          ACTIONS
                        </th>
                      </tr>

                      {/* Column-level search row */}
                      <tr className='text-gray-500' style={{ backgroundColor: RESALE.navyLight }}>
                        {/* CHECKBOX – no search */}
                        <th className="px-2 py-0.5" />

                        {/* 🆕 empty th for COMMUNICATE column */}
                        <th className="px-1.5 py-0.5" />

                        {/* NAME search */}
                        <th className="px-1.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search name…"
                            value={colSearch.name}
                            onChange={e => setColSearch(p => ({ ...p, name: e.target.value }))}
                            style={colSearchInputStyle}
                            className="text-[9px] w-24"
                          />
                        </th>
                        <th className="px-1.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search contact…"
                            value={colSearch.contact}
                            onChange={e => setColSearch(p => ({ ...p, contact: e.target.value }))}
                            style={colSearchInputStyle}
                            className="text-[9px] w-28"
                          />
                        </th>
                        <th className="px-1.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search location…"
                            value={colSearch.location}
                            onChange={e => setColSearch(p => ({ ...p, location: e.target.value }))}
                            style={colSearchInputStyle}
                            className="text-[9px] w-24"
                          />
                        </th>
                        <th className="px-1.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search source…"
                            value={colSearch.source}
                            onChange={e => setColSearch(p => ({ ...p, source: e.target.value }))}
                            style={colSearchInputStyle}
                            className="text-[9px] w-24"
                          />
                        </th>
                        <th className="px-1.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search priority…"
                            value={colSearch.priority}
                            onChange={e => setColSearch(p => ({ ...p, priority: e.target.value }))}
                            style={colSearchInputStyle}
                            className="text-[9px] w-20"
                          />
                        </th>
                        <th className="px-1.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search status…"
                            value={colSearch.status}
                            onChange={e => setColSearch(p => ({ ...p, status: e.target.value }))}
                            style={colSearchInputStyle}
                            className="text-[9px] w-20"
                          />
                        </th>
                        <th className="px-1.5 py-0.5">
                          <input
                            type="text"
                            placeholder="Search date/assigned…"
                            value={colSearch.created}
                            onChange={e => setColSearch(p => ({ ...p, created: e.target.value }))}
                            style={colSearchInputStyle}
                            className="text-[9px] w-28"
                          />
                        </th>
                        <th className="px-1.5 py-0.5" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {pageSlice.map((lead, index) => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          {/* CHECKBOX */}
                          <td className="px-2 py-1">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={() => handleSelectLead(lead.id)}
                              className="rounded w-3 h-3"
                              style={{ accentColor: '#e5e7eb', borderColor: '#d1d5db', borderWidth: '1px', borderStyle: 'solid' }}
                            />
                          </td>

                          {/* S.NO */}
                          <td className="px-1.5 py-1 text-center text-xs font-semibold text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>

                          {/* 🆕 COMMUNICATE column with icons */}
                          <td className="px-2 py-1 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Phone */}
                              <button
                                onClick={() => {
                                  const phoneNumber = lead.phone?.replace(/\D/g, '');
                                  if (phoneNumber && phoneNumber !== '-' && phoneNumber !== '') {
                                    window.location.href = `tel:${phoneNumber}`;
                                  } else {
                                    toast.error("No phone number available");
                                  }
                                }}
                                className="p-1 rounded hover:bg-green-100 transition-colors text-green-600"
                                title="Call"
                              >
                                <Phone size={13} />
                              </button>

                              {/* WhatsApp */}
                              <button
                                onClick={() => {
                                  const phoneNumber = lead.phone?.replace(/\D/g, '');
                                  if (phoneNumber && phoneNumber !== '-' && phoneNumber !== '') {
                                    const userName = formatUserName(user) || user?.username || user?.email?.split('@')[0] || 'Team';
                                    const message = encodeURIComponent(
                                      `Hi ${lead.salutation || ''} ${lead.name || 'Lead'},\n\n` +
                                      `We have some properties that might interest you.\n\n` +
                                      `Best Regards,\n${userName}`
                                    );
                                    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                                  } else {
                                    toast.error("No phone number available for WhatsApp");
                                  }
                                }}
                                className="p-1 rounded hover:bg-green-100 transition-colors text-green-600"
                                title="WhatsApp"
                              >
                                <FaWhatsapp size={13} />
                              </button>

                              {/* Email */}
                              <button
                                onClick={() => {
                                  const email = lead.email;
                                  if (email && email !== '-' && email !== '') {
                                    const userName = formatUserName(user) || user?.username || user?.email?.split('@')[0] || 'Team';
                                    const subject = encodeURIComponent("Property Recommendations");
                                    const body = encodeURIComponent(
                                      `Dear ${lead.salutation || ''} ${lead.name || 'Lead'},\n\n` +
                                      `We have some great properties that match your requirements.\n\n` +
                                      `Best Regards,\n${userName}`
                                    );
                                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                                  } else {
                                    toast.error("No email address available");
                                  }
                                }}
                                className="p-1 rounded hover:bg-blue-100 transition-colors text-blue-600"
                                title="Email"
                              >
                                <Mail size={13} />
                              </button>

                              {/* Follow-up (opens modal) */}
                              <button
                                onClick={() => {
                                  setSelectedLeadForFollowup(lead);
                                  setShowLeadFollowupModal(true);
                                }}
                                className="p-1 rounded hover:bg-purple-100 transition-colors text-purple-600"
                                title="Follow-up"
                              >
                                <Calendar size={13} />
                              </button>
                            </div>
                          </td>


                          {/* NAME */}
                          <td className="px-2 py-1">
                            <Link to={`/dashboard/leads/${lead.id}`} className="flex items-center gap-1.5 group">
                              <div
                                className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-medium flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: RESALE.orange }}
                              >
                                {lead.name
                                  ?.split(' ')
                                  .map(word => word[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase() || 'L'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-[11px] text-gray-900 truncate">
                                  {lead.salutation && `${lead.salutation}. `}{lead.name}
                                </p>
                                <div className="flex items-center gap-1 mt-0 flex-wrap">
                                  <p className="text-[9px] text-gray-400">{lead.lead_type?.toUpperCase() || 'LEAD'}</p>
                                  <p className="text-[9px] text-gray-400">ID: {lead.lead_number ?? String(lead.id).slice(0, 6)}</p>
                                </div>
                              </div>
                            </Link>
                          </td>

                          {/* CONTACT */}
                          <td className="px-2 py-1">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <Phone size={9} className="text-gray-400 flex-shrink-0" />
                                <a href={`tel:${lead.phone}`} className="text-[9px] text-gray-600 hover:text-orange-500">{lead.phone}</a>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail size={9} className="text-gray-400 flex-shrink-0" />
                                <a href={`mailto:${lead.email}`} className="text-[9px] text-gray-600 hover:text-orange-500 truncate max-w-[110px]">{lead.email}</a>
                              </div>
                              {lead.whatsapp_number && (
                                <div className="flex items-center gap-1">
                                  <SiWhatsapp size={9} className="text-green-500 flex-shrink-0" />
                                  <a
                                    href={`https://wa.me/${lead.whatsapp_number.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-gray-600 hover:text-green-600"
                                  >
                                    {lead.whatsapp_number.replace(/\D/g, '')}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* LOCATION */}
                          <td className="px-2 py-1">
                            <div className="text-[9px] text-gray-700 font-medium">{lead.city || '-'}</div>
                            {lead.location && <div className="text-gray-400 text-[8px] mt-0.5">{lead.location}</div>}
                          </td>

                          {/* SOURCE */}
                          <td className="px-2 py-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getSourceBadgeClass(lead.lead_source)}`}>
                              {lead.lead_source?.replace(/_/g, ' ') || '-'}
                            </span>
                          </td>

                          {/* PRIORITY */}
                          <td className="px-2 py-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getPriorityBadgeClass(lead.priority)}`}>
                              {lead.priority || 'N/A'}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td className="px-2 py-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${getStatusBadgeClass(lead.status)}`}>
                              {lead.status || 'New'}
                            </span>
                          </td>

                          {/* CREATED / ASSIGNED */}
                          <td className="px-2 py-1">
                            <div className="space-y-0.5">
                              {lead.assigned_executive_name ? (
                                <div className="flex items-center gap-1">
                                  <User size={9} className="flex-shrink-0" style={{ color: RESALE.orange }} />
                                  <span className="font-medium text-[9px] text-gray-700">{lead.assigned_executive_name}</span>
                                </div>
                              ) : (
                                <div className="text-[9px] text-gray-400 italic">Unassigned</div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock size={9} className="text-gray-400 flex-shrink-0" />
                                <span className="text-[9px] text-gray-600">{formatDate(lead.created_at)}</span>
                              </div>

                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-2 py-1 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {canRead && (
                                <Link to={`/dashboard/leads/${lead.id}`}>
                                  <button className="p-1 rounded hover:bg-gray-100 transition-colors text-blue-500" title="View">
                                    <Eye size={13} />
                                  </button>
                                </Link>
                              )}
                              {canUpdate && (
                                <button
                                  onClick={() => { setSelectedLead(lead); setShowEditLeadModal(true); }}
                                  className="p-1 rounded hover:bg-gray-100 transition-colors text-orange-500" title="Edit"
                                >
                                  <Edit size={13} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteLead(lead.id, lead.name)}
                                  className="p-1 rounded hover:bg-red-100 transition-colors text-red-500" title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Empty State */}
                  {pageSlice.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-1 text-sm">No leads found</div>
                      <p className="text-xs text-gray-400">Try adjusting your filters or search criteria</p>
                    </div>
                  )}
                </div>

                {/* Fixed Pagination Footer */}
                {filteredLeads.length > 0 && (
                  <div className="px-2 sm:px-3 py-1.5 border-t border-gray-100 bg-white">

                    {/* MOBILE VIEW */}
                    <div className="flex flex-col gap-2 sm:hidden">
                      <div className="text-[10px] text-gray-500 text-center">
                        Showing {(currentPage - 1) * itemsPerPage + 1}-
                        {Math.min(currentPage * itemsPerPage, filteredLeads.length)}{" "}
                        of {filteredLeads.length} leads
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {selectedLeads.length === 0 && (
                          <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
                            className="min-w-[60px] px-2 py-0.5 text-[10px] border border-gray-200 rounded-lg bg-white"
                          >
                            {[25, 50, 100, 200, 300, 400, 500, 1000].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                            <option value={999999}>All</option>
                          </select>
                        )}
                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                          <div className="flex justify-end min-w-max">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP VIEW */}
                    <div className="hidden sm:flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] text-gray-500 whitespace-nowrap">
                          Showing {(currentPage - 1) * itemsPerPage + 1}-
                          {Math.min(currentPage * itemsPerPage, filteredLeads.length)}{" "}
                          of {filteredLeads.length} leads
                        </div>
                        {selectedLeads.length === 0 && (
                          <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
                            className="px-2 py-0.5 text-[10px] border border-gray-200 rounded-lg bg-white"
                          >
                            {[25, 50, 100, 200, 300, 400, 500, 1000].map((n) => (
                              <option key={n} value={n}>{n} </option>
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
              </>
            )}
          </div>
          {/* ===================== END TABLE CARD ===================== */}

        </div>

        {/* Modals */}
        <FilterModal
          isOpen={showFilterSidebar}
          onClose={() => setShowFilterSidebar(false)}
          filters={filters}
          setFilters={setFilters}
          clearFilters={() =>
            setFilters({
              status: 'all', source: 'all', leadType: 'all', assignedExecutive: 'all',
              createdBy: 'all', priority: 'all', city: '', location: '',
              dateFrom: '', dateTo: '', ignoreDate: false, sortOrder: 'desc',
            })
          }
          statusOptions={statusOptions}
          sourceOptions={sourceOptions}
          leadTypeOptions={leadTypeOptions}
          assignedOptions={assignedOptions}
          createdByOptions={createdByOptions}
          priorityOptions={priorityOptions}
        />

        {canCreate && (
          <AddLeadModal
            isOpen={showAddLeadModal}
            onClose={() => setShowAddLeadModal(false)}
            onSave={handleAddLead}
          />
        )}

        {canUpdate && (
          <AddLeadModal
            isOpen={showEditLeadModal}
            lead={selectedLead || undefined}
            onClose={() => { setShowEditLeadModal(false); setSelectedLead(null); }}
            onSave={handleEditLead}
          />
        )}

        {canImport && (
          <ImportLeadsModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onSuccess={fetchLeads}
          />
        )}


        {/* Lead Follow-up Modal */}
        {showLeadFollowupModal && selectedLeadForFollowup && (
          <FollowupModal
            isOpen={showLeadFollowupModal}
            onClose={() => {
              setShowLeadFollowupModal(false);
              setSelectedLeadForFollowup(null);
            }}
            onSave={async (payload) => {
              // 👇 Replace with actual API call if you have one
              try {
                console.log('Follow-up payload:', payload);
                toast.success('Follow-up saved successfully');
                // Optionally refresh leads
                await fetchLeads();
                setShowLeadFollowupModal(false);
                setSelectedLeadForFollowup(null);
              } catch (error) {
                toast.error('Failed to save follow-up');
              }
            }}
            tabId="lead"
            leadId={selectedLeadForFollowup.id}
            initialForm={undefined}
          />
        )}
      </div>
    </>
  );
};

export default LeadsPage;