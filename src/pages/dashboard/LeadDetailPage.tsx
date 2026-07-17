// src/pages/LeadDetailPage.tsx - Compact Desktop View (No Mobile Drawer)

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Phone, Mail, MapPin, User as UserIcon, ChevronDown, Calendar, Clock,
  Users, UserPlus, ArrowLeftToLine, ArrowRightToLine, MessageSquare,
  User, Pencil, Trash2, NotebookPen,
  Tag
} from "lucide-react";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { leadsAPI, usersAPI } from "@/lib/api";
import { masterDataAPI } from "@/lib/mastersAPI";
import { followupAPI } from "@/lib/followupAPI";
import { notificationAPI } from "@/lib/notificationAPI";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";

import FollowupModal, { FOLLOWUP_TYPES, FollowupForm } from "@/pages/dashboard/components/FollowupModal";
import BuyerFormModal from "./components/BuyerFormModal";
import AddLeadModal from "./components/AddLeadModal";
import { useAuth } from "@/contexts/AuthContext";
import SellerFormModal from "./components/SellerFormModel";

import { can } from "@/utils/permission";

// ESALE Light Theme Colors
const PRIMARY_NAVY = "#0f2b3d";
const PRIMARY_ORANGE = "#e67e22";
const BG_WHITE = "#ffffff";
const BG_GRAY = "#f5f7fa";
const BORDER = "#e4e7eb";
const TEXT_PRIMARY = "#1a2c3e";
const TEXT_SECONDARY = "#5a7184";
const TEXT_MUTED = "#8ba0b5";

/* ===================== Types ===================== */
type UserRole = "admin" | "manager" | "agent" | "executive";

interface AuthUser {
  id?: string | number;
  user_id?: string | number;
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: string;
  department?: string;
  salutation?: string;
}

export interface Lead {
  id: string;
  lead_number?: number;
  salutation?: string;
  name?: string;
  phone?: string;
  email?: string;
  lead_type?: string;
  lead_source?: string;
  priority?: string;
  whatsapp_number?: string;
  state?: string;
  city?: string;
  location?: string;
  status: string;
  stage?: string;
  assigned_executive?: string;
  assigned_executive_name?: string;
  created_at?: string;
  created_by?: string;
  last_contact?: string;
  last_contacted_by?: string;
  last_contacted_by_name?: string;
  updated_by_name?: string;
  created_by_name?: string;
  updated_at?: string;
}

interface Followup {
  priority: string;
  id: string | number;
  leadId: string | number;
  type: string;
  stage?: string;
  status?: string;
  remark?: string;
  customRemark?: string;
  nextAction?: string;
  scheduledDate?: string | null;
  completedDate?: string | null;
  createdBy?: string;
  createdAt?: string;
  createdByFirstName?: string;
  createdByLastName?: string;
  updatedByFirstName?: string;
  updatedByLastName?: string;
  last_contacted_by?: string;
  last_contacted_by_name?: string;
}

interface MasterOption {
  value: string;
  label: string;
  role?: string;
}

interface MasterOptions {
  salutation: MasterOption[];
  leadType: MasterOption[];
  leadSource: MasterOption[];
  leadStatus: MasterOption[];
  states: MasterOption[];
  cities: MasterOption[];
  locations: MasterOption[];
  agents: MasterOption[];
}

interface PresalesUser {
  id: string;
  name: string;
  department?: string;
  role?: string;
  selfOnly?: boolean;
  salutation?: string;
}

interface NotificationData {
  leadId: string;
  userId: string;
  message: string;
  type: string;
  link: string;
}

const getLatestFollowup = (arr?: Followup[] | null): Followup | null => (arr && arr.length ? arr[0] : null);

const FOLLOWUP_COLOR_MAP: Record<
  string,
  { container: string; icon: string; leftBar: string; badge: string }
> = {
  blue: { container: "bg-blue-50 border-blue-200", icon: "text-blue-600", leftBar: "border-blue-400", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  green: { container: "bg-green-50 border-green-200", icon: "text-green-600", leftBar: "border-green-400", badge: "bg-green-100 text-green-800 border-green-200" },
  indigo: { container: "bg-indigo-50 border-indigo-200", icon: "text-indigo-600", leftBar: "border-indigo-400", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  orange: { container: "bg-orange-50 border-orange-200", icon: "text-orange-600", leftBar: "border-orange-400", badge: "bg-orange-100 text-orange-800 border-orange-200" },
  purple: { container: "bg-purple-50 border-purple-200", icon: "text-purple-600", leftBar: "border-purple-400", badge: "bg-purple-100 text-purple-800 border-purple-200" },
  gray: { container: "bg-gray-50 border-gray-200", icon: "text-gray-600", leftBar: "border-gray-400", badge: "bg-gray-100 text-gray-800 border-gray-200" },
};

const normalizeString = (str: any): string => {
  return (str ?? "").toString().trim().toLowerCase().replace(/[\s-_/]+/g, "");
};

const getFilteredLeads = (allLeads: Lead[], user: AuthUser | null): Lead[] => {
  if (!user) return allLeads;
  const userRole = normalizeString(user.role);
  const userId = user.id || user.user_id;
  if (userRole.includes("admin") || userRole.includes("manager")) return allLeads;
  if (userRole.includes("executive")) {
    return allLeads.filter(lead => lead.assigned_executive && String(lead.assigned_executive) === String(userId));
  }
  return allLeads;
};

const fetchUsersSafely = async (user: AuthUser | null): Promise<any[]> => {
  const userRole = normalizeString(user?.role);
  const userDept = normalizeString(user?.department);
  if (userRole.includes("admin") || userRole.includes("manager")) {
    try {
      const resp = await usersAPI.getAllUsers?.();
      const raw = resp?.data ?? resp?.items ?? resp ?? [];
      return Array.isArray(raw) ? raw : [];
    } catch (error: any) {
      console.warn("User fetch failed:", error);
      return [];
    }
  }
  return [];
};

const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Permissions
  const canReadLeads = can(user, "lead.read");
  const canUpdateLeads = can(user, "lead.update");
  const canDeleteLeads = can(user, "lead.delete");
  const canAssignLeads = can(user, "lead.assign");
  const canViewFollowups = can(user, "followup.read");
  const canCreateFollowups = can(user, "followup.create");
  const canUpdateFollowups = can(user, "followup.update");
  const canDeleteFollowups = can(user, "followup.delete");

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState<number>(0);
  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [followupsError, setFollowupsError] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState<MasterOptions>({
    salutation: [], leadType: [], leadSource: [], leadStatus: [], states: [], cities: [], locations: [], agents: [],
  });
  const [presalesUsers, setPreSalesUsers] = useState<PresalesUser[]>([]);
  const [execsLoading, setExecsLoading] = useState<boolean>(true);
  const [showExecDropdown, setShowExecDropdown] = useState(false);
  const [showBuyerComponent, setShowBuyerComponent] = useState(false);
  const [showSellerComponent, setShowSellerComponent] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);
const [followupToDelete, setFollowupToDelete] = useState<string | number | null>(null);
  const [showDeleteLeadModal, setShowDeleteLeadModal] = useState<boolean>(false);
  useEffect(() => {
    if (!canReadLeads) setLoading(false);
  }, [canReadLeads]);

  useEffect(() => {
    let mounted = true;
    const fetchExecs = async () => {
      try {
        setExecsLoading(true);
        const allUsers = await fetchUsersSafely(user);
        if (!mounted) return;
        const presalesExecs: PresalesUser[] = allUsers
          .filter((u: any) => {
            const role = normalizeString(u?.role);
            const dept = normalizeString(u?.department);
            const isActive = u.is_active !== 0 && u.is_active !== false && u.is_active !== '0' && u.is_active !== 'false' && u.is_active !== null && u.is_active !== undefined;
            return role.includes("executive") && (dept === "presales" || dept === "presale") && isActive;
          })
          .map((u: any) => ({
            id: String(u.id ?? u.user_id ?? u._id ?? ""),
            name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Executive",
            department: u.department,
            role: u.role,
            salutation: u.salutation || "",
          }));
        setPreSalesUsers(presalesExecs);
      } catch (err) {
        console.error("Failed to load presales executives:", err);
        setPreSalesUsers([]);
      } finally {
        setExecsLoading(false);
      }
    };
    fetchExecs();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    const filtered = getFilteredLeads(allLeads, user);
    setFilteredLeads(filtered);
    if (lead && filtered.length > 0) {
      const index = filtered.findIndex((l: Lead) => String(l.id) === String(lead.id));
      setCurrentLeadIndex(index >= 0 ? index : 0);
    }
  }, [allLeads, user, lead]);

  const assignableExecs = useMemo(() => getAssignableExecutives(user, presalesUsers), [user, presalesUsers]);

  const getAssignedExecName = (): string => {
    if (!lead) return "Unassigned";
    if (lead.assigned_executive_name && lead.assigned_executive_name !== "Unassigned") return lead.assigned_executive_name;
    if (lead.assigned_executive && presalesUsers.length > 0) {
      const exec = presalesUsers.find((u) => String(u.id) === String(lead.assigned_executive));
      if (exec) return exec.name;
    }
    const currentUserId = user?.id ?? (user as AuthUser)?.user_id;
    if (lead.assigned_executive && String(lead.assigned_executive) === String(currentUserId)) {
      return `${(user as AuthUser)?.salutation ? (user as AuthUser).salutation + " " : ""}${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""} (Self)`;
    }
    return "Unassigned";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTransferOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFollowups = async (leadIdParam?: string): Promise<Followup[]> => {
    if (!canViewFollowups) {
      setFollowups([]);
      setFollowupsError("You do not have permission to view follow-ups");
      setFollowupsLoading(false);
      return [];
    }
    const leadToUse = leadIdParam ?? id;
    if (!leadToUse) {
      setFollowups([]);
      setFollowupsError(null);
      setFollowupsLoading(false);
      return [];
    }
    try {
      setFollowupsLoading(true);
      setFollowupsError(null);
      const response = await followupAPI.getFollowupsByLeadId(leadToUse);
      let followupsData: Followup[] = [];
      if (Array.isArray(response?.data)) followupsData = response.data;
      else if (Array.isArray(response)) followupsData = response;
      else if (Array.isArray(response?.Payload)) followupsData = response.Payload;
      else if (Array.isArray(response?.result)) followupsData = response.result;
      followupsData = (followupsData || []).map((f: any) => ({
        id: f.id || f._id || f.followup_id || "",
        leadId: f.leadId || f.lead_id || leadToUse,
        type: f.type || f.followupType || "general",
        stage: f.stage || f.leadStage || "",
        status: f.status || f.leadStatus || "",
        remark: f.remark || "",
        customRemark: f.customRemark || f.custom_remark || "",
        nextAction: f.nextAction || f.next_action || "",
        scheduledDate: f.scheduledDate || f.scheduled_date || f.schedule || f.createdAt || f.created_at || null,
        createdAt: f.createdAt || f.created_at || null,
        priority: f.priority || "Medium",
        createdByFirstName: f.createdByFirstName || f.created_by_first_name || f.created_first_name || "",
        createdByLastName: f.createdByLastName || f.created_by_last_name || f.created_last_name || "",
        ...f,
      }));
      followupsData.sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        if (db !== da) return db - da;
        if (a.id && b.id) return a.id > b.id ? -1 : 1;
        return 0;
      });
      setFollowups(followupsData);
      return followupsData;
    } catch (e: any) {
      console.error("Error fetching followups:", e);
      const status = e?.response?.status || e?.status;
      if (status === 404 || status === 204) {
        setFollowups([]);
        setFollowupsError(null);
        return [];
      } else {
        toast.error("Failed to fetch follow-ups");
        setFollowupsError("Failed to fetch follow-ups");
        setFollowups([]);
        return [];
      }
    } finally {
      setFollowupsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFollowups();
  }, [id, canViewFollowups]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        if (!canReadLeads) {
          setError("You do not have permission to view this lead.");
          setLoading(false);
          return;
        }
        if (id) {
          const [response, allLeadsResponse] = await Promise.all([leadsAPI.getLead(id), leadsAPI.getLeads()]);
          if (allLeadsResponse?.success && allLeadsResponse.data) {
            const leadsData: Lead[] = Array.isArray(allLeadsResponse.data)
              ? allLeadsResponse.data.map((l: any) => ({ ...l, id: String(l.id || l._id || "") }))
              : [];
            setAllLeads(leadsData);
          }
          const data = response?.data ?? response;
          if (!data) {
            setError("No lead data returned");
            return;
          }
          const resolveExecName = (execId: any): string | null => {
            if (!execId) return null;
            const found = presalesUsers.find((u) => String(u.id) === String(execId));
            return found?.name ?? null;
          };
          const execName = data.assigned_executive_name || resolveExecName(data.assigned_executive) || "Unassigned";
          const createdByName = data.created_by_name || `${data.created_first_name || data.createdByFirstName || ""} ${data.created_last_name || data.createdByLastName || ""}`.trim() || "System";
          const updatedByName = data.updated_by_name || `${data.updated_first_name || data.updatedByFirstName || ""} ${data.updated_last_name || data.updatedByLastName || ""}`.trim() || "System";
          const lastContactedByName = data.last_contacted_by_name || data.updated_by_name || null;
          const leadData: Lead = {
            id: String(data.id || data._id || ""),
            lead_number: data.lead_number,
            salutation: data.salutation || "",
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || "",
            lead_type: data.lead_type || data.leadType || "",
            lead_source: data.lead_source || data.leadSource || "",
            whatsapp_number: data.whatsapp_number || data.whatsapp || "",
            state: data.state || "",
            city: data.city || "",
            location: data.location || "",
            status: data.status || "New",
            assigned_executive: data.assigned_executive ? String(data.assigned_executive) : "",
            assigned_executive_name: execName || "Unassigned",
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
            priority: data.priority || " -",
            stage: data.stage || "-",
            created_by: data.created_by || data.createdBy || "System",
            last_contact: data.last_contact || data.lastContact || "",
            last_contacted_by: data.last_contacted_by || data.last_contact_by || data.lastContactedBy || "",
            last_contacted_by_name: lastContactedByName || undefined,
            created_by_name: createdByName,
            updated_by_name: updatedByName,
          };
          setLead(leadData);
        }
      } catch (err) {
        console.error("Error fetching lead details:", err);
        toast.error("Error fetching lead details");
        setError("Failed to fetch lead details");
      } finally {
        setLoading(false);
      }
    };
    const fetchMasters = async () => {
      try {
        setError(null);
        const [leadMasterTypes, commonMasterTypes] = await Promise.all([masterDataAPI.getAllMasterTypes("lead"), masterDataAPI.getAllMasterTypes("common")]);
        const allMasterTypes = [...leadMasterTypes, ...commonMasterTypes];
        const masterValues = await Promise.all(allMasterTypes.map(async (masterType: any) => {
          try { return await masterDataAPI.getMasterValues(masterType.id); } catch { return []; }
        }));
        const organizedData: Record<string, MasterOption[]> = {};
        allMasterTypes.forEach((masterType: any, index: number) => {
          const values = masterValues[index] || [];
          const normalizedName = (masterType.name || "").toLowerCase().trim();
          organizedData[normalizedName] = values.map((item: any) => ({ value: item.value, label: item.value || item.name || "Unknown", role: item.role || "Agent" }));
        });
        const agentData = organizedData["agent"] || organizedData["agents"] || [];
        setMasterOptions((prev) => ({
          ...prev,
          salutation: organizedData["salutation"] || organizedData["salutations"] || [],
          leadType: organizedData["lead type"] || organizedData["leadtype"] || organizedData["lead_type"] || [],
          leadSource: organizedData["lead source"] || organizedData["leadsource"] || organizedData["lead_source"] || [],
          leadStatus: organizedData["lead status"] || organizedData["leadstatus"] || organizedData["lead_status"] || organizedData["status"] || [],
          states: organizedData["state"] || organizedData["states"] || [],
          cities: organizedData["city"] || organizedData["cities"] || [],
          locations: organizedData["location"] || organizedData["locations"] || [],
          agents: agentData.map((item) => ({ value: item.value, label: item.label, role: item.role || "Agent" })),
        }));
      } catch (err: any) {
        console.error("Failed to load master data:", err);
        setError(`Failed to load dropdown options`);
      }
    };
    fetchMasters();
    fetchLead();
  }, [id, execsLoading, canReadLeads]);

  useEffect(() => {
    if (lead?.assigned_executive && presalesUsers.length > 0) {
      const exec = presalesUsers.find((u) => String(u.id) === String(lead.assigned_executive));
      if (exec) setLead((prev) => prev ? { ...prev, assigned_executive_name: exec.name } : prev);
    }
  }, [presalesUsers, lead?.assigned_executive]);

 const handleDelete = () => {
    if (!id) return;
    if (!canDeleteLeads) { toast.error("You do not have permission to delete leads"); return; }
    setShowDeleteLeadModal(true);
  };

  const handleConfirmDeleteLead = async () => {
    if (!id) return;
    setShowDeleteLeadModal(false);
    try {
      const response = await leadsAPI.deleteLead(id);
      if (response.success) { toast.success("Lead deleted ✅"); navigate("/dashboard/leads"); }
      else toast.error("Failed to delete lead ❌");
    } catch (err) { console.error("Error deleting lead:", err); toast.error("Error deleting lead"); }
  };

  const handleExecAssign = async (execId: string, execName: string) => {
    if (!lead) return;
    if (!canAssignLeads) { toast.error("You do not have permission to assign leads"); return; }
    try {
      const prevExec = lead.assigned_executive || "";
      setLead({ ...lead, assigned_executive: execId, assigned_executive_name: execName });
      setShowExecDropdown(false);
      await leadsAPI.assignToExecutive(lead.id, { assigned_executive: execId });
      if (execId && execId !== prevExec) {
        try { await notificationAPI.createNotification({ leadId: String(lead.id), userId: String(execId), message: `Lead assigned to ${execName}`, type: "lead_assign", link: `/dashboard/leads/${lead.id}` } as NotificationData); }
        catch (notifErr) { console.error("Notification error:", notifErr); toast.warn("Lead assigned but notification failed"); }
      }
      toast.success(`Lead assigned to ${execName}`);
    } catch (err) { console.error("Error assigning executive:", err); setLead((prev) => prev ? { ...prev, assigned_executive: lead.assigned_executive, assigned_executive_name: lead.assigned_executive_name } : prev); toast.error("Failed to assign. Please try again."); }
  };

  const handleSaveLead = async (updatedLead: Lead | null) => {
    if (!updatedLead) return;
    if (!canUpdateLeads) { toast.error("You do not have permission to update leads"); return; }
    try {
      const prevExec = lead?.assigned_executive || "";
      const newExec = updatedLead.assigned_executive || "";
      const { lead_number: _ln, ...updatePayload } = updatedLead as any; // 🔒 strip system field
      const response = await leadsAPI.updateLead(updatedLead.id!, updatePayload);
      const savedLead = response?.data || response;
      setLead((prev) => ({ ...(prev || {} as Lead), ...savedLead }));
      setAllLeads((prev) => prev.map((l) => (String(l.id) === String(savedLead.id) ? { ...l, ...savedLead } : l)));
      if (newExec && newExec !== prevExec) {
        const exec = presalesUsers.find((u) => String(u.id) === String(newExec));
        const execName = exec?.name || savedLead.assigned_executive_name || "Executive";
        try { await notificationAPI.createNotification({ leadId: String(updatedLead.id), userId: String(newExec), message: `Lead updated and assigned to ${execName}`, type: "lead_update", link: `/dashboard/leads/${updatedLead.id}` } as NotificationData); }
        catch (notifErr) { console.error("Notification error:", notifErr); }
      }
      setIsEditModalOpen(false);
      toast.success("Lead details updated successfully!");
    } catch (err) { console.error("Error saving lead:", err); toast.error("Failed to save lead. Please try again."); }
  };

  const handleFollowupSave = async (data: FollowupForm & { lead_id?: string }) => {
    if (!lead?.id) { toast.error("Lead not loaded."); return; }
    if (editingFollowup && !canUpdateFollowups) { toast.error("You do not have permission to update follow-ups"); return; }
    if (!editingFollowup && !canCreateFollowups) { toast.error("You do not have permission to create follow-ups"); return; }
    let saved: any = null;
    const scheduledISO = data.scheduleDate ? `${data.scheduleDate}T${(data.scheduleTime || "00:00")}:00` : null;
    const followupPayload = { 
      leadId: data.lead_id ?? lead.id, 
      type: data.followupType, 
      stage: data.leadStage, 
      status: data.leadStatus, 
      remark: data.remark, 
      customRemark: data.customRemark, 
      nextAction: data.nextAction, 
      scheduledDate: scheduledISO, 
      priority: data.priority, 
      createdBy: Number((user as AuthUser)?.id ?? (user as AuthUser)?.user_id),
      updatedBy: Number((user as AuthUser)?.id ?? (user as AuthUser)?.user_id)
    };
    try {
      if (editingFollowup) {
        await followupAPI.updateFollowup(String(editingFollowup.id), followupPayload);
        saved = { ...editingFollowup, ...followupPayload, updatedAt: new Date().toISOString() };
        setEditingFollowup(null);
        setFollowups((prev) => prev.map((f) => (f.id === editingFollowup.id ? saved : f)));
        toast.success("Follow-up updated successfully!");
      } else {
        const resp = await followupAPI.createFollowup(followupPayload);
        const newId = resp?.data?.id || resp?.id || `temp-${Date.now()}`;
        saved = { id: newId, leadId: followupPayload.leadId, type: followupPayload.type, stage: followupPayload.stage, status: followupPayload.status, remark: followupPayload.remark, customRemark: followupPayload.customRemark, nextAction: followupPayload.nextAction, scheduledDate: scheduledISO, createdAt: new Date().toISOString(), priority: followupPayload.priority, createdByFirstName: user?.first_name || "", createdByLastName: user?.last_name || "" };
        setFollowups((prev) => [saved, ...prev]);
        toast.success("Follow-up saved successfully!");
      }
    } catch (err) { console.error("Error saving followup:", err); toast.error(`Failed to ${editingFollowup ? "update" : "save"} follow-up. Please try again.`); return; }
    try {
      await leadsAPI.updateLead(lead.id, { stage: data.leadStage, status: data.leadStatus, priority: data.priority, updated_by: (user as AuthUser)?.id ?? (user as AuthUser)?.user_id });
      setLead((prev) => prev ? { ...prev, stage: data.leadStage || prev.stage, status: data.leadStatus || prev.status, priority: data.priority } : prev);
    } catch (err) { console.error("Error updating lead:", err); }
    if (lead.assigned_executive && String(lead.assigned_executive).trim() !== "") {
      try { await notificationAPI.createNotification({ leadId: String(lead.id), userId: String(lead.assigned_executive), message: `New follow-up added for lead "${lead.name}" by ${user?.first_name || "User"}`, type: "followup_add", link: `/dashboard/leads/${lead.id}` } as NotificationData); }
      catch (notifErr) { console.error("Notification error:", notifErr); }
    }
    setIsFollowupModalOpen(false);
    try { await fetchFollowups(); } catch { }
  };

  const handleEditFollowup = (followup: Followup) => {
    if (!canUpdateFollowups) { toast.error("You do not have permission to edit follow-ups"); return; }
    setEditingFollowup(followup);
    setIsFollowupModalOpen(true);
  };

  const handleDeleteFollowup = (followupId: string | number) => {
    if (!canDeleteFollowups) { toast.error("You do not have permission to delete follow-ups"); return; }
    setFollowupToDelete(followupId);
  };

  const handleConfirmDeleteFollowup = async () => {
    if (followupToDelete === null) return;
    const followupId = followupToDelete;
    setFollowupToDelete(null);
    const prevFollowups = [...followups];
    setFollowups((prev) => prev.filter((f) => f.id !== followupId));
    try {
      await followupAPI.deleteFollowup(String(followupId));
      toast.success("Follow-up deleted successfully");
    } catch (err) {
      console.error("Error deleting followup:", err);
      setFollowups(prevFollowups);
      toast.error("Failed to delete follow-up");
    }
  };

  const handlePreviousLead = () => {
    if (filteredLeads.length === 0 || currentLeadIndex <= 0) return;
    const prevIndex = currentLeadIndex - 1;
    const prevLead = filteredLeads[prevIndex];
    setCurrentLeadIndex(prevIndex);
    navigate(`/dashboard/leads/${prevLead.id}`);
  };

  const handleNextLead = () => {
    if (filteredLeads.length === 0 || currentLeadIndex >= filteredLeads.length - 1) return;
    const nextIndex = currentLeadIndex + 1;
    const nextLead = filteredLeads[nextIndex];
    setCurrentLeadIndex(nextIndex);
    navigate(`/dashboard/leads/${nextLead.id}`);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return { date: "-", time: "-" };
    try {
      const date = new Date(dateString);
      return { date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) };
    } catch { return { date: "-", time: "-" }; }
  };

  const shouldShowTransfer = (ld?: Lead | null, lf?: Followup | null): boolean => {
    const lStage = (ld?.stage || "").trim().toLowerCase();
    const lStatus = (ld?.status || "").trim().toLowerCase();
    const fStage = (lf?.stage || "").trim().toLowerCase();
    const fStatus = (lf?.status || "").trim().toLowerCase();
    const isLeadOK = (lStage === "contacted" || lStage === "connected") && lStatus === "qualified";
    const isFollowupOK = (fStage === "contacted" || fStage === "connected") && fStatus === "qualified";
    return isLeadOK || isFollowupOK;
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "contacted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "new": return "bg-purple-100 text-purple-700 border-purple-200";
      case "qualified": return "bg-teal-100 text-teal-700 border-teal-200";
      case "unqualified": return "bg-red-100 text-red-700 border-red-200";
      case "cold": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getLeadTypeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case "buyer-self": return "bg-green-100 text-green-700 border-green-200";
      case "buyer investor": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "seller self": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "seller investor": return "bg-red-100 text-red-700 border-red-200";
      case "seller builder": return "bg-orange-100 text-orange-700 border-orange-200";
      case "walk-in lead": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "referral lead": return "bg-sky-100 text-sky-700 border-sky-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage?.toLowerCase()) {
      case "attempting contact": return "bg-blue-100 text-blue-700 border-blue-200";
      case "contacted": return "bg-purple-100 text-purple-700 border-purple-200";
      case "converted to opportunity": return "bg-green-100 text-green-700 border-green-200";
      case "disqualified": return "bg-red-100 text-red-700 border-red-200";
      case "new": return "bg-gray-100 text-gray-700 border-gray-200";
      case "nurturing": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "qualified": return "bg-teal-100 text-teal-700 border-teal-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const latestFollowup = useMemo(() => getLatestFollowup(followups), [followups]);
  const { date: createdDate, time: createdTime } = formatDateTime(lead?.created_at || null);
  const { date: updatedDate, time: updatedTime } = formatDateTime(lead?.updated_at || null);
  const { date: lastContactDate, time: lastContactTime } = formatDateTime(lead?.last_contact || "");

  const handleBack = () => navigate("/dashboard/leads");
  const handleEdit = () => { if (!canUpdateLeads) { toast.error("You do not have permission to edit leads"); return; } setIsEditModalOpen(true); };
  const handleCall = () => lead?.phone && window.open(`tel:${lead.phone}`, "_self");
  const handleWhatsApp = () => lead?.whatsapp_number && window.open(`https://wa.me/${lead.whatsapp_number.replace(/\D/g, "")}`, "_blank");
  const handleEmail = () => lead?.email && window.open(`mailto:${lead.email}`, "_self");
  const handleScheduleMeeting = () => lead && window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting+with+${encodeURIComponent(lead.name || "")}&details=${encodeURIComponent(`Discuss lead ${lead.id}`)}&location=Online&dates=20240101T100000Z/20240101T110000Z`, "_blank");

  const typeIcon = (t: string) => { const found = FOLLOWUP_TYPES.find((ft) => ft.value === t); return found ? found.Icon : MessageSquare; };
  const followupCardClasses = (t: string) => { const color = FOLLOWUP_TYPES.find((ft) => ft.value === t)?.color || "gray"; return FOLLOWUP_COLOR_MAP[color] || FOLLOWUP_COLOR_MAP.gray; };
  const formatDateShort = (iso?: string | null): string => { if (!iso) return "-"; const d = new Date(iso); const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }); const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); return `${date} • ${time}`; };

  const tabId = "lead";
  const leadId = id || "";

  if (!canReadLeads) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_GRAY }}>
        <div className="text-center p-6 bg-white rounded-xl shadow-lg border" style={{ borderColor: BORDER }}>
          <div className="text-red-600 text-lg font-semibold mb-2">Access Denied</div>
          <div className="text-gray-600 text-sm">You do not have permission to view leads.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_GRAY }}>
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border" style={{ borderColor: BORDER }}>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90" style={{ background: PRIMARY_ORANGE }}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading || !lead) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_GRAY }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: PRIMARY_ORANGE }}></div>
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-5" style={{ background: BG_GRAY }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
          {/* Main Lead Profile Card */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border" style={{ borderColor: BORDER }}>
            {/* Action Buttons Bar - Compact */}
            <div className="p-3 md:p-4 border-b flex flex-wrap items-center justify-between gap-2" style={{ borderColor: BORDER, background: BG_WHITE }}>
              <button onClick={handleBack} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm font-medium border hover:bg-gray-50" style={{ borderColor: BORDER, color: TEXT_PRIMARY }}>
                <FiArrowLeft size={13} />
                Back
              </button>

              <div className="flex items-center gap-1.5">
                <button onClick={handleEdit} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm font-medium text-white ${canUpdateLeads ? "hover:opacity-90" : "opacity-50 cursor-not-allowed"}`} style={{ background: PRIMARY_ORANGE }} disabled={!canUpdateLeads}>
                  <FiEdit size={13} /> Edit
                </button>
                <button onClick={handleDelete} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm font-medium border ${canDeleteLeads ? "hover:bg-red-50" : "opacity-50 cursor-not-allowed"}`} style={{ borderColor: "#ef4444", color: "#ef4444", background: BG_WHITE }} disabled={!canDeleteLeads}>
                  <FiTrash2 size={13} /> Delete
                </button>
                <button onClick={handlePreviousLead} disabled={currentLeadIndex <= 0} className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm border disabled:opacity-40 hover:bg-gray-50" style={{ background: BG_WHITE, borderColor: BORDER, color: TEXT_PRIMARY }}>
                  <ArrowLeftToLine size={13} /> Prev
                </button>
                <button onClick={handleNextLead} disabled={currentLeadIndex >= filteredLeads.length - 1} className="flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-xs md:text-sm border disabled:opacity-40 hover:bg-gray-50" style={{ background: BG_WHITE, borderColor: BORDER, color: TEXT_PRIMARY }}>
                  Next <ArrowRightToLine size={13} />
                </button>
              </div>
            </div>

            {/* Lead Header - Compact with Gradient */}
            <div className="p-4 md:p-5 border-b" style={{ borderColor: BORDER, background: `linear-gradient(135deg, ${PRIMARY_NAVY}08 0%, ${PRIMARY_ORANGE}08 100%)` }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ background: `${PRIMARY_ORANGE}15` }}>
                    <UserIcon size={20} style={{ color: PRIMARY_ORANGE }} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold" style={{ color: PRIMARY_NAVY }}>
                      {lead.salutation} {lead.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[11px]" style={{ color: TEXT_MUTED }}>ID: {lead.lead_number ?? String(lead.id).slice(0, 6)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getLeadTypeColor(lead.lead_type || "")}`}>
                        {lead.lead_type || "Lead"}
                      </span>
                      <span className="text-[11px]" style={{ color: TEXT_MUTED }}>({currentLeadIndex + 1} of {filteredLeads.length})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button onClick={() => { if (!canCreateFollowups) { toast.error("Permission denied"); return; } setEditingFollowup(null); setIsFollowupModalOpen(true); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white transition-all text-xs md:text-sm font-medium ${!canCreateFollowups ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`} style={{ background: PRIMARY_ORANGE }}>
                    <NotebookPen size={13} /> Follow Up
                  </button>

                  <div className="relative">
                    <button onClick={() => { if (!canAssignLeads) { toast.error("Permission denied"); return; } if (!execsLoading) setShowExecDropdown((s) => !s); }} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white transition-all text-xs md:text-sm font-medium ${(!canAssignLeads || assignableExecs.length === 0) ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`} style={{ background: PRIMARY_NAVY }} disabled={!canAssignLeads || execsLoading || assignableExecs.length === 0}>
                      <UserPlus size={13} /> Assign <ChevronDown size={11} />
                    </button>
                    {showExecDropdown && canAssignLeads && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border z-10 overflow-hidden" style={{ borderColor: BORDER }}>
                        <div className="p-2 border-b" style={{ borderColor: BORDER, background: BG_GRAY }}>
                          <p className="text-xs font-semibold" style={{ color: PRIMARY_NAVY }}>Assign to Executive</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {assignableExecs.length === 0 ? <div className="px-3 py-2 text-xs text-gray-500">No executives available</div> : assignableExecs.map((exec: PresalesUser) => (
                            <button key={exec.id} onClick={() => handleExecAssign(String(exec.id), exec.name)} className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${String(lead.assigned_executive) === String(exec.id) ? "bg-orange-50 text-orange-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}>
                              {exec.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <button onClick={handleCall} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#25D366" }} title="Call"><Phone size={13} /></button>
                    <button onClick={handleWhatsApp} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#128C7E" }} title="WhatsApp"><FaWhatsapp size={13} /></button>
                    <button onClick={handleEmail} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#3b82f6" }} title="Email"><Mail size={13} /></button>
                    <button onClick={handleScheduleMeeting} className="p-1.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: "#8b5cf6" }} title="Schedule Meeting"><Calendar size={13} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Compact */}
            <div className="p-4 md:p-5 space-y-4">
              {/* Contact & Location Section - Two Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Details */}
                <div className="rounded-lg p-3" style={{ background: BG_GRAY, border: `1px solid ${BORDER}` }}>
                  <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: PRIMARY_NAVY }}>
                    <Phone size={12} style={{ color: PRIMARY_ORANGE }} />
                    Contact Details
                  </h3>
                  <div className="space-y-2">
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>PHONE</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.phone || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>EMAIL</p><p className="text-sm font-medium break-all" style={{ color: TEXT_PRIMARY }}>{lead.email || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>WHATSAPP</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.whatsapp_number || "-"}</p></div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="rounded-lg p-3" style={{ background: BG_GRAY, border: `1px solid ${BORDER}` }}>
                  <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: PRIMARY_NAVY }}>
                    <MapPin size={12} style={{ color: PRIMARY_ORANGE }} />
                    Location Details
                  </h3>
                  <div className="space-y-2">
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>STATE</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.state || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>CITY</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.city || "-"}</p></div>
                    <div><p className="text-[9px] uppercase tracking-wide" style={{ color: TEXT_MUTED }}>LOCATION</p><p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>{lead.location || "-"}</p></div>
                  </div>
                </div>
              </div>

              {/* Lead Classification - Compact */}
              <div className="rounded-lg p-3" style={{ background: BG_GRAY, border: `1px solid ${BORDER}` }}>
                <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: PRIMARY_NAVY }}>
                  <Tag size={12} style={{ color: PRIMARY_ORANGE }} />
                  Lead Classification
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Source:</span><span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">{lead.lead_source || "-"}</span></div>
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Priority:</span><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(lead.priority || "")}`}>{lead.priority || "-"}</span></div>
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Stage:</span><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStageColor(lead.stage || "")}`}>{lead.stage || "-"}</span></div>
                  <div className="flex items-center gap-1"><span className="text-[10px]" style={{ color: TEXT_MUTED }}>Status:</span><span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(lead.status)}`}>{lead.status}</span></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border" style={{ borderColor: BORDER }}>
                    <Clock size={13} style={{ color: TEXT_MUTED }} />
                    <div><p className="text-[9px] uppercase" style={{ color: TEXT_MUTED }}>CREATED</p><p className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{createdDate}</p><p className="text-[10px]" style={{ color: TEXT_MUTED }}>{createdTime}</p><p className="text-[10px] mt-0.5 truncate max-w-[130px]" style={{ color: TEXT_MUTED }}>By: {lead.created_by_name || "System"}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border" style={{ borderColor: BORDER }}>
                    <Clock size={13} style={{ color: TEXT_MUTED }} />
                    <div><p className="text-[9px] uppercase" style={{ color: TEXT_MUTED }}>UPDATED</p><p className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{updatedDate}</p><p className="text-[10px]" style={{ color: TEXT_MUTED }}>{updatedTime}</p><p className="text-[10px] mt-0.5 truncate max-w-[130px]" style={{ color: TEXT_MUTED }}>By: {lead.updated_by_name || "System"}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border" style={{ borderColor: BORDER }}>
                    <Clock size={13} style={{ color: TEXT_MUTED }} />
                    <div><p className="text-[9px] uppercase" style={{ color: TEXT_MUTED }}>LAST CONTACT</p><p className="text-xs font-medium" style={{ color: TEXT_PRIMARY }}>{lastContactDate}</p><p className="text-[10px]" style={{ color: TEXT_MUTED }}>{lastContactTime}</p><p className="text-[10px] mt-0.5 truncate max-w-[130px]" style={{ color: TEXT_MUTED }}>By: {lead.last_contacted_by_name || lead.last_contacted_by || "-"}</p></div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg col-span-1 sm:col-span-2 lg:col-span-1" style={{ background: `${PRIMARY_ORANGE}08`, border: `1px solid ${PRIMARY_ORANGE}20` }}>
                    <Users size={13} style={{ color: PRIMARY_ORANGE }} />
                    <div><p className="text-[9px] uppercase" style={{ color: PRIMARY_ORANGE }}>ASSIGNED EXECUTIVE</p><p className="text-xs font-semibold" style={{ color: PRIMARY_NAVY }}>{getAssignedExecName()}</p></div>
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    {shouldShowTransfer(lead, latestFollowup) && (
                      <button onClick={() => setShowTransferOptions(!showTransferOptions)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90" style={{ background: PRIMARY_ORANGE }}>
                        <HiArrowsRightLeft size={12} /> Transfer Lead
                      </button>
                    )}
                    {showTransferOptions && (
                      <div className="absolute top-full left-0 mt-2 w-44 rounded-xl shadow-lg border z-20 overflow-hidden bg-white" style={{ borderColor: BORDER }}>
                        <button className="w-full px-3 py-1.5 text-left text-xs text-green-600 hover:bg-green-50" onClick={() => { setShowTransferOptions(false); setShowBuyerComponent(true); }}>Transfer to Buyer</button>
                        <button className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50" onClick={() => { setShowTransferOptions(false); setShowSellerComponent(true); }}>Transfer to Seller</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Follow-ups Timeline - Compact */}
          <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: BORDER }}>
            <div className="p-3 md:p-4 border-b" style={{ borderColor: BORDER, background: BG_GRAY }}>
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: PRIMARY_NAVY }}>
                <MessageSquare size={14} style={{ color: PRIMARY_ORANGE }} />
                Follow-ups Timeline
              </h3>
            </div>
            <div className="p-3 md:p-4">
              {followupsLoading && (<div className="flex justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: PRIMARY_ORANGE }}></div></div>)}
              {!followupsLoading && id && followupsError && (<div className="text-center py-6 text-red-500 text-xs">{followupsError}</div>)}
              {!followupsLoading && id && !followupsError && followups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl text-center" style={{ background: BG_GRAY, border: `1px dashed ${BORDER}` }}>
                  <MessageSquare size={32} style={{ color: TEXT_MUTED }} />
                  <p className="text-xs font-medium mt-2" style={{ color: TEXT_MUTED }}>No follow-ups yet</p>
                  <p className="text-[10px] mt-1" style={{ color: TEXT_MUTED }}>Click "Follow Up" to add one</p>
                </div>
              )}
              {!followupsLoading && !followupsError && followups.length > 0 && (
                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {followups.map((f) => {
                    const Ico = typeIcon(f.type);
                    const color = followupCardClasses(f.type);
                    return (
                      <div key={f.id} className={`border rounded-lg p-2.5 transition-all ${color.container} border-l-3 ${color.leftBar}`}>
                        <div className="flex gap-2">
                          <Ico size={14} className={color.icon} />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${color.badge}`}>{f.type}</span>
                              <div className="flex gap-1">
                                {canUpdateFollowups && <button onClick={() => handleEditFollowup(f)} className="p-0.5 rounded hover:bg-gray-200"><Pencil size={10} className="text-gray-500" /></button>}
                                {canDeleteFollowups && <button onClick={() => handleDeleteFollowup(f.id)} className="p-0.5 rounded hover:bg-red-100"><Trash2 size={10} className="text-red-500" /></button>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px]">
                              {f.priority && <><span className="text-gray-400">Priority:</span><span className={`px-1 py-0 rounded-full text-[9px] font-medium ${getPriorityColor(f.priority)}`}>{f.priority}</span></>}
                              {f.stage && <><span className="text-gray-400">Stage:</span><span className="px-1 py-0 rounded-full text-[9px] font-medium bg-white/70 border border-gray-200">{f.stage}</span></>}
                              {f.status && <><span className="text-gray-400">Status:</span><span className="px-1 py-0 rounded-full text-[9px] font-medium bg-white/70 border border-gray-200">{f.status}</span></>}
                            </div>
                            {(f.customRemark || f.remark) && <p className="text-[10px] text-gray-600"><span className="font-medium">Remark:</span> {f.customRemark || f.remark}</p>}
                            {f.nextAction && <p className="text-[10px] text-gray-600"><span className="font-medium">Next Action:</span> {f.nextAction}</p>}
                            {f.status?.toLowerCase() === 'qualified' && f.scheduledDate && new Date(f.scheduledDate).getFullYear() > 1970 && (() => {
                              const sched = formatDateTime(f.scheduledDate);
                              return (
                                <div className="text-[10px] text-gray-600 bg-slate-50 border border-slate-100 rounded-md p-1.5 flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                  <div>
                                    <span className="font-semibold" style={{ color: PRIMARY_NAVY }}>Schedule Date:</span> {sched.date}
                                  </div>
                                  <div>
                                    <span className="font-semibold" style={{ color: PRIMARY_NAVY }}>Schedule Time:</span> {sched.time}
                                  </div>
                                </div>
                              );
                            })()}
                            <div className="flex flex-col gap-1 pt-1 text-[9px] text-gray-400">
                              {f.scheduledDate && new Date(f.scheduledDate).getFullYear() > 1970 && (
                                <div className="flex items-center gap-1 text-orange-600 font-medium">
                                  <Calendar size={8} className="text-orange-500" />
                                  <span>Next Follow-up: {formatDateShort(f.scheduledDate)}</span>
                                </div>
                              )}
                              <div className="flex flex-wrap justify-between gap-1 pt-0.5 border-t border-gray-100/50">
                                <div className="flex items-center gap-1">
                                  <Clock size={8} />
                                  <span>Done: {formatDateShort(f.createdAt || "")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User size={8} />
                                  <span>{`${f.createdByFirstName || ""} ${f.createdByLastName || ""}`.trim() || "System"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FollowupModal isOpen={isFollowupModalOpen} onClose={() => { setIsFollowupModalOpen(false); setEditingFollowup(null); }} onSave={handleFollowupSave} tabId={tabId} leadId={leadId} initialForm={editingFollowup ? { id: editingFollowup.id, followupType: editingFollowup.type, leadStage: editingFollowup.stage || "", leadStatus: editingFollowup.status || "", remark: editingFollowup.remark || "", customRemark: editingFollowup.customRemark || "", nextAction: editingFollowup.nextAction || "", scheduleDate: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toISOString().slice(0, 10) : "", scheduleTime: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toTimeString().slice(0, 5) : "", priority: editingFollowup.priority || lead.priority || "Medium", lead_id: leadId } : { priority: lead.priority || "Medium" }} />
      {showBuyerComponent && lead && <BuyerFormModal lead={lead} followups={followups} onClose={() => setShowBuyerComponent(false)} />}
      {showSellerComponent && lead && <SellerFormModal lead={lead} followups={followups} onClose={() => setShowSellerComponent(false)} />}
      <AddLeadModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLead} lead={lead || undefined} />

      {/* Delete Followup Confirmation Modal */}
    {/* Delete Followup Confirmation Modal */}
      {followupToDelete !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFollowupToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 m-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-red-50 text-red-500 mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Follow-up</h3>
              <p className="text-xs text-gray-500 mt-2">
                Are you sure you want to delete this follow-up? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setFollowupToDelete(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteFollowup}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lead Confirmation Modal */}
      {showDeleteLeadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteLeadModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 m-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-red-50 text-red-500 mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Lead</h3>
              <p className="text-xs text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-semibold">{lead?.salutation} {lead?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setShowDeleteLeadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteLead}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
    

export default LeadDetailPage;