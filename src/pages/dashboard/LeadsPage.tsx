// src/pages/LeadsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Filter, Phone, Mail, Eye, Edit, Trash2, Download, Users,
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

interface Lead {
  id: string;
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
      <div className="h-full flex flex-col bg-gray-50">
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
    () => Number(localStorage.getItem('leads_rows_per_page')) || 10
  );
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<TabID>('all');

  const [searchFilters, setSearchFilters] = useState({
    name: "",
    contact: "",
    location: "",
    source: "",
    status: "",
    created: "",
    priority: "",
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

  const statusKey = (s: string | undefined | null) => String(s ?? '').trim().toLowerCase();
  const toOption = (v: string) => ({ label: v.charAt(0).toUpperCase() + v.slice(1), value: v });

  // ---------- names ----------
  const formatUserName = (u: any) => {
    if (!u) return '';
    const sal = u?.salutation ? `${u.salutation} ` : '';
    const fn = u?.first_name || u?.name || '';
    const ln = u?.last_name || '';
    return `${sal}${fn}${ln ? ' ' + ln : ''}`.trim();
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
      return dept === "presales" && role === "presales executive";
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

  // ---------- tabs ----------
  const tabColorClasses: Record<string, { active: string; badge: string }> = {
    blue: { active: 'bg-blue-100 text-blue-700 border-blue-200', badge: 'bg-blue-200' },
    purple: { active: 'bg-purple-100 text-purple-700 border-purple-200', badge: 'bg-purple-200' },
    yellow: { active: 'bg-yellow-100 text-yellow-700 border-yellow-200', badge: 'bg-yellow-200' },
    green: { active: 'bg-green-100 text-green-700 border-green-200', badge: 'bg-green-200' },
    red: { active: 'bg-red-100 text-red-700 border-red-200', badge: 'bg-red-200' },
  };

  const tabs = useMemo(() => ([
    { id: 'all' as TabID, label: 'All', color: 'blue', count: allLeads.length },
    { id: 'new' as TabID, label: 'New', color: 'yellow', count: allLeads.filter(l => statusKey(l.status) === 'new').length },
    { id: 'contacted' as TabID, label: 'Contacted', color: 'purple', count: allLeads.filter(l => statusKey(l.status) === 'contacted').length },
    { id: 'qualified' as TabID, label: 'Qualified', color: 'green', count: allLeads.filter(l => statusKey(l.status) === 'qualified').length },
    { id: 'unqualified' as TabID, label: 'Unqualified', color: 'red', count: allLeads.filter(l => statusKey(l.status) === 'unqualified').length },
  ]), [allLeads]);

  // ---------- fetch leads with role-based filtering ----------
  const fetchLeads = async () => {
    if (!canRead) {
      toast.error('You do not have permission to view leads');
      return;
    }

    try {
      setLoading(true);

      // Fetch all leads from API
      const response = await leadsAPI.getLeads();
      const data = Array.isArray(response?.data) ? response.data : response?.data?.data ?? [];

      let leads: any[] = data;

      // Fetch users if not already fetched
      if (!presalesUsers || presalesUsers.length === 0) {
        try {
          const ures = await usersAPI.getAllUsers();
          setPresalesUsers(ures.data || []);
        } catch (e) {
          console.error("Failed to fetch users", e);
        }
      }

      // Apply role-based filtering
      const filteredLeads = filterLeadsByRole(user, leads, presalesUsers || []);

      // Create users map for name resolution
      const usersMap: Record<string, any> = {};
      (presalesUsers || []).forEach((u: any) => {
        const id = String(u.id ?? u._id ?? u.user_id ?? '');
        if (id) usersMap[id] = u;
      });

      // Enhance leads with names
      const enhancedLeads = filteredLeads.map((lead: any) => {
        const enhancedLead = { ...lead };

        // Assigned executive name
        if (lead.assigned_executive) {
          const exec = usersMap[String(lead.assigned_executive)];
          if (exec) {
            enhancedLead.assigned_executive_name = formatUserName(exec);
          }
        }

        // Created by name
        if (lead.created_by) {
          const creator = usersMap[String(lead.created_by)];
          if (creator) {
            enhancedLead.created_by_name = formatUserName(creator);
          }
        }

        // Last contacted by name
        if (lead.last_contacted_by) {
          const contactor = usersMap[String(lead.last_contacted_by)];
          if (contactor) {
            enhancedLead.last_contacted_by_name = formatUserName(contactor);
          }
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

  // Fetch users on component mount
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

  // Fetch leads when user changes or users are updated
  useEffect(() => {
    if (user && canRead) {
      fetchLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, presalesUsers]);

  // Persist items per page
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

  // ---------- filtered leads ----------
  const filteredLeads = useMemo(() => {
    const f = filters, s = searchFilters;
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
      if (f.status !== 'all' && normalize(lead.status) !== normalize(f.status)) return false;
      if (f.source !== 'all' && normalize(lead.lead_source) !== normalize(f.source)) return false;
      if (f.leadType !== 'all' && normalize(lead.lead_type) !== normalize(f.leadType)) return false;
      if (f.city && !normalize(lead.city).includes(normalize(f.city))) return false;
      if (f.location && !normalize(lead.location).includes(normalize(f.location))) return false;
      if (!inDateRange(lead.created_at)) return false;
      if (f.createdBy !== 'all' && lead.created_by_name !== f.createdBy) return false;
      if (f.priority !== 'all' && normalize(lead.priority) !== normalize(f.priority)) return false;

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

      if (f.assignedExecutive !== 'all') {
        if (f.assignedExecutive === 'Unassigned') {
          if (lead.assigned_executive_name && lead.assigned_executive_name.trim() !== "") return false;
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
  }, [allLeads, filters, searchFilters, activeTab]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchFilters, activeTab]);

  // Calculate total pages
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage)));
  }, [filteredLeads, itemsPerPage]);

  // Get current page slice
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
          // Self assign - notify admins
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
          // Assign to others - notify assignee
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

      // Refetch leads with role-based filtering
      await fetchLeads();

      // Reset tabs and page
      if (newLeadData.assigned_executive === user?.id) {
        // Self assigned - stay on current tab
        setCurrentPage(1);
      } else {
        // Assigned to someone else - go to all tab
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

      const response = await leadsAPI.updateLead(cleanPayload.id, cleanPayload);
      const updated = response?.data ?? response?.data?.data;

      if (updated) {
        // Get previous lead data
        const prevLead = allLeads.find((l) => l.id === (updated.id ?? updatedLeadData.id));
        const wasAssignedToMe = prevLead?.assigned_executive &&
          String(prevLead.assigned_executive) === String(user?.id);
        const nowAssignedToMe = updated.assigned_executive &&
          String(updated.assigned_executive) === String(user?.id);

        // Refetch with role-based filtering
        await fetchLeads();

        // Adjust tabs based on assignment changes
        if (wasAssignedToMe && !nowAssignedToMe) {
          // Was assigned to me, now not - go to all tab
          setActiveTab("all");
        }

        if (!wasAssignedToMe && nowAssignedToMe) {
          // Was not assigned to me, now is - go to all tab
          setActiveTab("all");
        }

        setCurrentPage(1);

        // Send notification if assignment changed
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
  const handleDeleteLead = async (leadId: string) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete leads');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadsAPI.deleteLead(leadId);

      // Update local state
      setAllLeads(prev => prev.filter(lead => lead.id !== leadId));
      setSelectedLeads(prev => prev.filter(id => id !== leadId));

      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  // ---------- EXPORT ----------
  const exportLeads = async () => {
    if (!canExport) {
      toast.error('You do not have permission to export leads');
      return;
    }

    try {
      const headers = [
        'Salutation',
        'Name',
        'Phone',
        'Email',
        'City',
        'Location',
        'Lead Source',
        'Lead Type',
        'Status',
        'Created At',
        'Assigned Executive',
        'Priority',
      ];

      const rows = filteredLeads.map((l) => [
        l.salutation,
        l.name,
        l.phone,
        l.email,
        l.city,
        l.location,
        l.lead_source,
        l.lead_type,
        l.status,
        l.created_at,
        l.assigned_executive_name || 'Unassigned',
        l.priority || 'N/A',
      ]);

      const csv = [headers, ...rows]
        .map((r) =>
          r
            .map((x) => `"${(x ?? '').toString().replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Leads exported successfully');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Failed to export leads');
    }
  };

  // ---------- badges ----------
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
      facebookads: 'bg-rose-100 text-rose-800',
      instagram: 'bg-pink-100 text-pink-800',
      whatsapp: 'bg-green-100 text-green-800',
      coldcall: 'bg-slate-100 text-slate-800',
      portal: 'bg-indigo-100 text-indigo-800',
      event: 'bg-purple-100 text-purple-800',
    };
    return map[key] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeClass = (status: string) => {
    let bgClass = 'bg-gray-100';
    let textClass = 'text-gray-800';
    const statusClasses: Record<string, { bg: string, text: string }> = {
      hot: { bg: 'bg-red-100', text: 'text-red-800' },
      warm: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      cold: { bg: 'bg-blue-100', text: 'text-blue-800' },
      qualified: { bg: 'bg-green-100', text: 'text-green-800' },
      converted: { bg: 'bg-purple-100', text: 'text-purple-800' },
      lost: { bg: 'bg-gray-100', text: 'text-gray-800' },
      new: { bg: 'bg-sky-100', text: 'text-sky-800' },
      contacted: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      unqualified: { bg: 'bg-rose-100', text: 'text-rose-800' },
    };
    if (status && statusClasses[status.toLowerCase()]) {
      bgClass = statusClasses[status.toLowerCase()].bg;
      textClass = statusClasses[status.toLowerCase()].text;
    }
    return `${bgClass} ${textClass}`;
  };

  const getPriorityBadgeClass = (priority?: string) => {
    const key = (priority || "").toLowerCase();
    const map: Record<string, string> = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return map[key] || "bg-gray-100 text-gray-700";
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
    if (!window.confirm(`Are you sure you want to delete ${selectedLeads.length} lead(s)?`)) {
      return;
    }
    setBulkLoading(true);
    try {
      if ((leadsAPI as any).bulkDeleteLeads) {
        await (leadsAPI as any).bulkDeleteLeads({ ids: selectedLeads });
      } else {
        for (const id of selectedLeads) {
          await leadsAPI.deleteLead(id);
        }
      }

      // Update local state
      setAllLeads((prev) => prev.filter((l) => !selectedLeads.includes(l.id)));

      toast.success(`Deleted ${selectedLeads.length} lead${selectedLeads.length > 1 ? "s" : ""}`);
      setSelectedLeads([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      toast.error("Bulk delete failed");
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

      // Update local state
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

      // Store previous assignments for notifications
      const prevAssignments: Record<string, string> = {};
      selectedLeads.forEach(id => {
        const lead = allLeads.find(l => l.id === id);
        if (lead) {
          prevAssignments[id] = String(lead.assigned_executive || '');
        }
      });

      // Server call
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

      // Handle local state based on role-based filtering
      const isSelfAssign = newAssigneeId && String(newAssigneeId) === currentUserId;

      if (isSelfAssign) {
        // Self assign - leads remain visible, just refetch
        await fetchLeads();
      } else if (newAssigneeId) {
        // Assign to someone else - remove from current view
        setAllLeads(prev =>
          prev.filter(l => !selectedLeads.includes(l.id))
        );
      } else {
        // Unassign - remove from executive's view
        setAllLeads(prev =>
          prev.filter(l => !selectedLeads.includes(l.id))
        );
      }

      // Send notifications
      if (newAssigneeId) {
        const assigneeName = resolveUserNameById(newAssigneeId) || 'User';

        for (const leadId of selectedLeads) {
          const prevAssigned = prevAssignments[leadId];

          // Only notify if assignment changed
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

  // Check if user is an executive
  const isExecutive = useMemo(() => {
    const userRole = (user?.role || '').toLowerCase();
    const userDept = (user?.department || '').toLowerCase();
    return userRole.includes('executive') ||
      userDept.includes('sales') ||
      userDept.includes('presales');
  }, [user]);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ================= STICKY TOP AREA ================= */}
        <div className="sticky top-0 bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Leads Management</h1>
                <p className="text-gray-600 mt-1 text-xs">Manage and track your sales leads</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canExport && (
                <Button variant="outline" onClick={exportLeads} className="px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                  <Download className="h-3 w-3" />
                  <span>Export</span>
                </Button>
              )}

              {canImport && (
                <Button onClick={() => setShowImportModal(true)}>Import Leads</Button>
              )}

              {canCreate && (
                <Button className="px-3 py-1 rounded-lg text-xs whitespace-nowrap" onClick={() => setShowAddLeadModal(true)}>
                  <Plus className="h-3 w-3" />
                  <span>Add Lead</span>
                </Button>
              )}
            </div>
          </div>

          {/* Tabs + Filters Row */}
          <div className="mt-2">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex space-x-1 overflow-x-auto pb-1">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  const colors = tabColorClasses[tab.color];
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${active ? colors.active : 'text-gray-600 hover:bg-gray-100'} border ${active ? '' : 'border-transparent'}`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${active ? colors.badge : 'bg-gray-200'}`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Rows selector + Filter & Clear Controls */}
              <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
                    className="border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    {[10, 20, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <Button variant="outline" onClick={() => setShowFilterSidebar(!showFilterSidebar)} className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>

                {(Object.values(searchFilters).some(val => val !== "") ||
                  filters.status !== 'all' ||
                  filters.source !== 'all' ||
                  filters.leadType !== 'all' ||
                  filters.assignedExecutive !== 'all' ||
                  filters.createdBy !== 'all' ||
                  filters.sortOrder !== 'desc' ||
                  filters.city ||
                  filters.location ||
                  (!filters.ignoreDate && (filters.dateFrom || filters.dateTo))
                ) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({
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
                        setSearchFilters({ name: "", contact: "", location: "", source: "", status: "", created: "", priority: "" });
                        setActiveTab('all');
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </Button>
                  )}
              </div>
            </div>
          </div>

          {/* BULK ACTIONS BAR */}
          {selectedLeads.length > 0 && (canUpdate || canAssign || canBulkDelete) && (
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="text-sm">
                Selected: <span className="font-medium">{selectedLeads.length}</span>
              </div>

              {/* Bulk Status */}
              {canUpdate && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Update status:</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="">-- choose --</option>
                    {['new', 'contacted', 'qualified', 'unqualified', 'hot', 'warm', 'cold', 'converted', 'lost', ...Array.from(new Set(statusOptions.map(o => o.value).filter(v => v !== 'all')))]
                      .filter((v, i, arr) => arr.indexOf(v) === i)
                      .map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select>
                  <Button onClick={handleBulkStatusUpdate} disabled={bulkLoading || !bulkStatus}>
                    {bulkLoading ? 'Updating…' : 'Apply Status'}
                  </Button>
                </div>
              )}

              <div className="hidden md:block h-6 w-px bg-gray-200" />

              {/* Bulk Assign */}
              {canAssign && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 whitespace-nowrap">Assign to:</label>
                  <select
                    value={bulkAssignee}
                    onChange={(e) => setBulkAssignee(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white min-w-[220px]"
                  >
                    <option value="">-- choose executive --</option>
                    <option value="Unassigned">Unassign</option>
                    {assignableExecutives.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleBulkAssign} disabled={bulkLoading || !bulkAssignee}>
                    {bulkLoading ? 'Assigning…' : 'Apply Assignment'}
                  </Button>
                </div>
              )}

              {/* Delete + Clear */}
              <div className="flex items-center gap-2 md:ml-auto">
                {canBulkDelete && (
                  <Button
                    variant="outline"
                    onClick={handleBulkDelete}
                    disabled={bulkLoading || selectedLeads.length === 0}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    {bulkLoading ? "Deleting…" : `Delete (${selectedLeads.length})`}
                  </Button>
                )}

                <Button variant="outline" onClick={() => setSelectedLeads([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Leads Table */}
            <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
            {!canRead ? (
              <div className="p-6 text-center text-sm text-red-600">
                You do not have permission to view leads.
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
            ) : (
              <>
                {/* Role-based visibility hint */}
                {isExecutive && (
                  <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700 flex items-center justify-between">
                    <div>
                      <strong className="font-semibold">Visibility Note:</strong>{' '}
                      You are viewing only leads assigned to you. Unassigned leads are visible to Admins and Managers only.
                    </div>
                    <div className="text-blue-500">
                      Total visible leads: <span className="font-bold">{filteredLeads.length}</span>
                    </div>
                  </div>
                )}

                      <div className="h-[calc(100vh-220px)] overflow-y-auto overflow-x-auto">

                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-3 w-8 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={pageSlice.length > 0 && pageSlice.every(l => selectedLeads.includes(l.id))}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                          />
                        </th>
                        <th className="px-3 py-3 min-w-[150px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-3 py-3 min-w-[160px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-3 py-3 min-w-[100px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-3 py-3 min-w-[120px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-3 py-3 min-w-[100px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-3 py-3 min-w-[100px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-3 min-w-[120px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-3 py-3 min-w-[100px] text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>

                      {/* Search Row */}
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2"></th>
                        <th className="px-3 py-2">
                          <input type="text" placeholder="Search name..." value={searchFilters.name} onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })} className="w-full border-gray-300 rounded text-xs py-1 px-2" />
                        </th>
                        <th className="px-3 py-2">
                          <input type="text" placeholder="Search contact..." value={searchFilters.contact} onChange={(e) => setSearchFilters({ ...searchFilters, contact: e.target.value })} className="w-full border-gray-300 rounded text-xs py-1 px-2" />
                        </th>
                        <th className="px-3 py-2">
                          <input type="text" placeholder="Search location..." value={searchFilters.location} onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })} className="w-full border-gray-300 rounded text-xs py-1 px-2" />
                        </th>
                        <th className="px-3 py-2">
                          <input type="text" placeholder="Search source..." value={searchFilters.source} onChange={(e) => setSearchFilters({ ...searchFilters, source: e.target.value })} className="w-full border-gray-300 rounded text-xs py-1 px-2" />
                        </th>
                        <th className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Search priority..."
                            value={searchFilters.priority || ""}
                            onChange={(e) => setSearchFilters({ ...searchFilters, priority: e.target.value })}
                            className="w-full border-gray-300 rounded text-xs py-1 px-2"
                          />
                        </th>
                        <th className="px-3 py-2">
                          <input type="text" placeholder="Search status..." value={searchFilters.status} onChange={(e) => setSearchFilters({ ...searchFilters, status: e.target.value })} className="w-full border-gray-300 rounded text-xs py-1 px-2" />
                        </th>
                        <th className="px-3 py-2">
                          <input type="text" placeholder="Search date..." value={searchFilters.created} onChange={(e) => setSearchFilters({ ...searchFilters, created: e.target.value })} className="w-full border-gray-300 rounded text-xs py-1 px-2" />
                        </th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200 text-xs">
                      {pageSlice.length > 0 ? (
                        pageSlice.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={selectedLeads.includes(lead.id)}
                                onChange={() => handleSelectLead(lead.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <Link to={`/dashboard/leads/${lead.id}`} className="flex items-center gap-2 ">
                                <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                  {lead.name?.[0]?.toUpperCase() || ''}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {lead.salutation && `${lead.salutation}. `}{lead.name}
                                  </p>

                                  <p className="text-gray-500">{lead.lead_type?.toUpperCase()}</p>
                                  <p className='text-[10px] text-[#0b3856] bg-[#0b3856]/10 px-2 py-0.5 rounded-md inline-block'>Id : {String(lead.id).slice(0, 4)}</p>

                                </div>
                              </Link>
                            </td>
                            <td className="px-3 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-blue-500" />
                                  <a href={`tel:${lead.phone}`} className="hover:text-blue-600">{lead.phone}</a>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-red-500" />
                                  <a href={`mailto:${lead.email}`} className="hover:text-red-600 truncate max-w-[140px]">{lead.email}</a>
                                </div>
                                {!!lead.whatsapp_number && (
                                  <div className="flex items-center gap-1">
                                    <SiWhatsapp className="h-3 w-3 text-green-500" />
                                    <a href={`https://wa.me/${lead.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">
                                      {lead.whatsapp_number.replace(/\D/g, '')}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {lead.city || '-'}
                              {lead.location && <p className="text-gray-500">{lead.location}</p>}
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSourceBadgeClass(lead.lead_source)}`}>
                                {lead.lead_source?.replace('_', ' ') || '-'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityBadgeClass(lead.priority)}`}>
                                {lead.priority || 'N/A'}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(lead.status)}`}>
                                {lead.status || 'New'}
                              </span>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <div className="flex flex-col gap-1 text-gray-800">
                                <div className='text-gray-800'>{lead.created_at ? formatDate(lead.created_at) : 'N/A'}</div>
                                {lead.assigned_executive_name ? (
                                  <div className="text-xs">
                                    <span className="text-purple-500 font-semibold">Assigned To:</span>{" "}
                                    <span className="text-gray-800">{lead.assigned_executive_name}</span>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400">Unassigned</div>
                                )}
                                {lead.created_by_name && (
                                  <div className="text-xs">
                                    <span className="text-green-600 font-semibold">Created By:</span>{" "}
                                    <span className="text-gray-800">{lead.created_by_name}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-2">

                                {canRead && (
                                  <Link to={`/dashboard/leads/${lead.id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                )}

                                {canUpdate && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setShowEditLeadModal(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}

                                {canDelete && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleDeleteLead(lead.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}

                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-3 py-6 text-center text-sm text-gray-500">No leads found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between text-xs">
                  <div>Showing {pageSlice.length} of {filteredLeads.length} filtered lead{filteredLeads.length !== 1 ? 's' : ''}</div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
        filters={filters}
        setFilters={setFilters}
        clearFilters={() =>
          setFilters({
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
          })
        }
        statusOptions={statusOptions}
        sourceOptions={sourceOptions}
        leadTypeOptions={leadTypeOptions}
        assignedOptions={assignedOptions}
        createdByOptions={createdByOptions}
        priorityOptions={priorityOptions}
      />

      {/* ADD MODAL */}
      {canCreate && (
        <AddLeadModal
          isOpen={showAddLeadModal}
          onClose={() => setShowAddLeadModal(false)}
          onSave={handleAddLead}
        />
      )}

      {/* EDIT MODAL */}
      {canUpdate && (
        <AddLeadModal
          isOpen={showEditLeadModal}
          lead={selectedLead || undefined}
          onClose={() => { setShowEditLeadModal(false); setSelectedLead(null); }}
          onSave={handleEditLead}
        />
      )}

      {/* IMPORT MODAL */}
      {canImport && (
        <ImportLeadsModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

export default LeadsPage;