import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Phone,
  Mail,
  MapPin,
  User as UserIcon,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  MessageCircle,
  Pencil,
  Trash2,
  Tag,
  Activity,
  Building2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Check,
  Zap,
  Play,
  History,
  PhoneCall,
  ArrowRightLeft,
  Send,
  Share2,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  CalendarClock,
  CalendarCheck,
  MessageSquareText,
  MessageSquareQuote,
  MailCheck,
  PencilLine,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { leadsAPI, usersAPI } from "@/lib/api";
import { masterDataAPI } from "@/lib/mastersAPI";
import { followupAPI } from "@/lib/followupAPI";
import { notificationAPI } from "@/lib/notificationAPI";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";
import BuyerFormModal from "./components/BuyerFormModal";
import AddLeadModal from "./components/AddLeadModal";
import { useAuth } from "@/contexts/AuthContext";
import SellerFormModal from "./components/SellerFormModel";
import LeadActivityTimelineModal from "@/components/leads/LeadActivityTimelineModal";
import { FollowUpModal } from "../settings/master/FollowUpModal";
import { can } from "@/utils/permission";

// Design System Tokens
const PRIMARY_NAVY = "#0f2b3d";
const PRIMARY_ORANGE = "#e67e22";
const BG_PAGE = "#f8fafc";
const BORDER_COLOR = "#e2e8f0";

export interface FollowupForm {
  followupType?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  leadStage?: string;
  leadStatus?: string;
  priority?: string;
  notes?: string;
  reminder?: number;
  assignedExecutive?: string | number;
  [key: string]: any;
}

export const FOLLOWUP_TYPES = [
  { value: "Call", label: "Call", Icon: Phone, color: "blue" },
  { value: "WhatsApp", label: "WhatsApp", Icon: MessageCircle, color: "emerald" },
  { value: "Email", label: "Email", Icon: Mail, color: "purple" },
  { value: "Meeting", label: "Meeting", Icon: Calendar, color: "orange" },
  { value: "Site Visit", label: "Site Visit", Icon: MapPin, color: "teal" },
];

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
  followups_count?: number;
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
  scheduledTime?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
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

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState<number>(0);
  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState<boolean>(false);
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
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [showDeleteLeadModal, setShowDeleteLeadModal] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.info(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
          .map((u: any) => {
            const rawName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Executive";
            const cleanName = rawName.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, "").trim();
            return {
              id: String(u.id ?? u.user_id ?? u._id ?? ""),
              name: cleanName,
              department: u.department,
              role: u.role,
              salutation: u.salutation || "",
            };
          });
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

  const [crmUsers, setCrmUsers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      try {
        let list: any[] = [];
        try {
          const res = await usersAPI.getAllUsers?.();
          const raw = res?.data ?? res?.items ?? res ?? [];
          if (Array.isArray(raw) && raw.length > 0) {
            list = raw;
          }
        } catch (e) {}

        if (list.length === 0 && usersAPI.getSalesExecutives) {
          try {
            const resExec = await usersAPI.getSalesExecutives();
            const rawExec = resExec?.data ?? resExec?.items ?? resExec ?? [];
            if (Array.isArray(rawExec) && rawExec.length > 0) {
              list = rawExec;
            }
          } catch (e) {}
        }

        if (mounted && list.length > 0) {
          setCrmUsers(list);
        }
      } catch (err) {}
    };
    loadUsers();
    return () => { mounted = false; };
  }, []);

  const resolveAdminOrAssignerFullName = useCallback((fAny: any, leadObj: any): string => {
    if (leadObj?.assigned_by_name && leadObj.assigned_by_name.toLowerCase() !== 'admin') {
      return leadObj.assigned_by_name;
    }
    if (leadObj?.assigned_by) {
      const match = crmUsers.find((u) => String(u.id) === String(leadObj.assigned_by));
      if (match) {
        const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
        if (full) return full;
      }
      if (isNaN(Number(leadObj.assigned_by))) return String(leadObj.assigned_by);
    }

    if (leadObj?.created_by_user?.name && leadObj.created_by_user.name.toLowerCase() !== 'admin') {
      return leadObj.created_by_user.name;
    }
    if (leadObj?.created_user_first_name || leadObj?.created_user_last_name) {
      const fullName = `${leadObj.created_user_salutation ? leadObj.created_user_salutation + ' ' : ''}${leadObj.created_user_first_name || ''} ${leadObj.created_user_last_name || ''}`.trim();
      if (fullName && fullName.toLowerCase() !== 'admin') return fullName;
    }
    if (leadObj?.created_by_name && leadObj.created_by_name.toLowerCase() !== 'admin') {
      return leadObj.created_by_name;
    }
    if (leadObj?.created_by) {
      const match = crmUsers.find((u) => String(u.id) === String(leadObj.created_by));
      if (match) {
        const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
        if (full) return full;
      }
    }

    const rawVal =
      fAny?.assigned_by_name ||
      fAny?.assignedByName ||
      fAny?.raw?.assigned_by_name ||
      fAny?.raw?.assignedByName ||
      fAny?.assigned_by ||
      fAny?.raw?.assigned_by ||
      null;
    const strVal = rawVal ? String(rawVal).trim() : '';

    if (strVal && strVal !== 'System' && !strVal.toLowerCase().includes('system') && strVal.toLowerCase() !== 'admin') {
      const match = crmUsers.find(
        (u) => String(u.id) === strVal ||
               (u.name && u.name.toLowerCase() === strVal.toLowerCase()) ||
               (u.username && u.username.toLowerCase() === strVal.toLowerCase())
      );
      if (match) {
        const role = String(match.role || '').toLowerCase();
        if (role.includes('admin') || role.includes('super') || role.includes('manager')) {
          const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
          if (full) return full;
        }
      }
    }

    if (user) {
      const role = String(user.role || '').toLowerCase();
      if (role.includes('admin') || role.includes('super') || role.includes('manager')) {
        const loggedName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || (user as any).name || (user as any).username;
        if (loggedName) return loggedName;
      }
    }

    const adminUser = crmUsers.find(
      (u) => {
        const role = String(u.role || '').toLowerCase();
        return role.includes('admin') || role.includes('super') || role.includes('manager');
      }
    );

    if (adminUser) {
      const full = `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() || adminUser.name || adminUser.username;
      if (full) return full;
    }

    return "";
  }, [crmUsers, user]);

  const resolveAssignedToName = useCallback((fAny: any, leadObj: any): string => {
    const directFollowupName =
      fAny?.raw?.assigned_to_name ||
      fAny?.raw?.assignedToName ||
      fAny?.raw?.assigned_executive_name ||
      fAny?.assigned_to_name ||
      fAny?.assigned_executive_name;

    if (directFollowupName && directFollowupName !== "Unassigned" && directFollowupName !== "You" && directFollowupName !== "Not assigned" && isNaN(Number(directFollowupName))) {
      return directFollowupName;
    }

    const fAsgnId =
      fAny?.raw?.assigned_to ??
      fAny?.raw?.assigned_executive ??
      fAny?.assigned_to ??
      fAny?.assigned_executive;

    if (fAsgnId && fAsgnId !== "Unassigned" && fAsgnId !== "You" && fAsgnId !== "Not assigned" && fAsgnId !== 0 && fAsgnId !== "0") {
      const match = crmUsers.find((u) => String(u.id) === String(fAsgnId));
      if (match) {
        const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
        if (full) return full;
      }
      if (isNaN(Number(fAsgnId))) return String(fAsgnId);
    }

    const lName =
      leadObj?.assigned_executive_name ||
      leadObj?.assigned_to_name ||
      leadObj?.assigned_executive_user?.name ||
      leadObj?.executive_name ||
      leadObj?.assigned_user?.name ||
      (typeof leadObj?.assigned === 'string' && isNaN(Number(leadObj?.assigned)) ? leadObj.assigned : null);
    if (lName && lName !== "Unassigned" && lName !== "You" && lName !== "Not assigned" && isNaN(Number(lName))) {
      return lName;
    }

    const lExecId =
      leadObj?.assigned_executive ??
      leadObj?.assigned_to ??
      leadObj?.assigned_user_id ??
      (typeof leadObj?.assigned === 'number' || (!isNaN(Number(leadObj?.assigned)) && leadObj?.assigned !== null && leadObj?.assigned !== '') ? leadObj?.assigned : null);
    if (lExecId && lExecId !== "Unassigned" && lExecId !== "You" && lExecId !== 0 && lExecId !== "0") {
      const match = crmUsers.find((u) => String(u.id) === String(lExecId));
      if (match) {
        const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
        if (full) return full;
      }
      if (user && String(user.id) === String(lExecId)) {
        const myName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || (user as any).name;
        if (myName) return myName;
      }
      if (isNaN(Number(lExecId))) return String(lExecId);
    }

    if (fAny?.assignedTo && fAny.assignedTo !== "Unassigned" && fAny.assignedTo !== "You" && isNaN(Number(fAny.assignedTo))) {
      return fAny.assignedTo;
    }

    return "Unassigned";
  }, [crmUsers, user]);

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
    let name = "";
    if (lead.assigned_executive_name && lead.assigned_executive_name !== "Unassigned") name = lead.assigned_executive_name;
    else if (lead.assigned_executive && presalesUsers.length > 0) {
      const exec = presalesUsers.find((u) => String(u.id) === String(lead.assigned_executive));
      if (exec) name = exec.name;
    }
    const currentUserId = user?.id ?? (user as AuthUser)?.user_id;
    if (!name && lead.assigned_executive && String(lead.assigned_executive) === String(currentUserId)) {
      name = `${(user as AuthUser)?.first_name || (user as AuthUser)?.name || "You"}${(user as AuthUser)?.last_name ? " " + (user as AuthUser).last_name : ""}`;
    }
    if (!name) return "Unassigned";
    return name.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, "").trim();
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
        scheduledTime: f.scheduledTime || f.scheduled_time || f.time || null,
        scheduled_date: f.scheduled_date || f.scheduledDate || null,
        scheduled_time: f.scheduled_time || f.scheduledTime || null,
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
            priority: data.priority || "-",
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
      if (response.success) {
        toast.success("Lead deleted successfully");
        navigate("/dashboard/leads");
      } else {
        toast.error("Failed to delete lead");
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error("Error deleting lead");
    }
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
        try {
          await notificationAPI.createNotification({
            leadId: String(lead.id),
            userId: String(execId),
            message: `Lead assigned to ${execName}`,
            type: "lead_assign",
            link: `/dashboard/leads/${lead.id}`
          } as NotificationData);
        } catch (notifErr) {
          console.error("Notification error:", notifErr);
          toast.warn("Lead assigned but notification failed");
        }
      }
      toast.success(`Lead assigned to ${execName}`);
    } catch (err) {
      console.error("Error assigning executive:", err);
      setLead((prev) => prev ? { ...prev, assigned_executive: lead.assigned_executive, assigned_executive_name: lead.assigned_executive_name } : prev);
      toast.error("Failed to assign. Please try again.");
    }
  };

  const handleSaveLead = async (updatedLead: Lead | null) => {
    if (!updatedLead) return;
    if (!canUpdateLeads) { toast.error("You do not have permission to update leads"); return; }
    try {
      const prevExec = lead?.assigned_executive || "";
      const newExec = updatedLead.assigned_executive || "";
      const { lead_number: _ln, ...updatePayload } = updatedLead as any;
      const response = await leadsAPI.updateLead(updatedLead.id!, updatePayload);
      const savedLead = response?.data || response;
      setLead((prev) => ({ ...(prev || {} as Lead), ...savedLead }));
      setAllLeads((prev) => prev.map((l) => (String(l.id) === String(savedLead.id) ? { ...l, ...savedLead } : l)));
      if (newExec && newExec !== prevExec) {
        const exec = presalesUsers.find((u) => String(u.id) === String(newExec));
        const execName = exec?.name || savedLead.assigned_executive_name || "Executive";
        try {
          await notificationAPI.createNotification({
            leadId: String(updatedLead.id),
            userId: String(newExec),
            message: `Lead updated and assigned to ${execName}`,
            type: "lead_update",
            link: `/dashboard/leads/${updatedLead.id}`
          } as NotificationData);
        } catch (notifErr) {
          console.error("Notification error:", notifErr);
        }
      }
      setIsEditModalOpen(false);
      toast.success("Lead details updated successfully");
    } catch (err) {
      console.error("Error saving lead:", err);
      toast.error("Failed to save lead. Please try again.");
    }
  };

  const handleEditFollowup = (followup: Followup) => {
    if (!canUpdateFollowups) { toast.error("You do not have permission to edit follow-ups"); return; }
    setEditingFollowup(followup);
    setShowFollowUpModal(true);
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
    navigate(`/dashboard/leads/${prevLead.lead_number || prevLead.id}`);
  };

  const handleNextLead = () => {
    if (filteredLeads.length === 0 || currentLeadIndex >= filteredLeads.length - 1) return;
    const nextIndex = currentLeadIndex + 1;
    const nextLead = filteredLeads[nextIndex];
    setCurrentLeadIndex(nextIndex);
    navigate(`/dashboard/leads/${nextLead.lead_number || nextLead.id}`);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return { date: "-", time: "-" };
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
      };
    } catch {
      return { date: "-", time: "-" };
    }
  };

  const formatScheduleDisplay = (dateStr?: string | null, timeStr?: string | null) => {
    if (!dateStr) return null;
    let dateFormatted = "";
    try {
      if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
        const [y, m, d] = dateStr.trim().split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        dateFormatted = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      } else {
        const dateObj = new Date(dateStr);
        dateFormatted = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      }
    } catch {
      dateFormatted = String(dateStr);
    }

    let timeFormatted = "";
    if (timeStr) {
      try {
        const timeClean = String(timeStr).trim();
        if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeClean)) {
          const parts = timeClean.split(":");
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          const period = hours >= 12 ? "PM" : "AM";
          const h12 = hours % 12 || 12;
          timeFormatted = `${String(h12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
        } else {
          timeFormatted = timeClean;
        }
      } catch {
        timeFormatted = String(timeStr);
      }
    }

    return { date: dateFormatted, time: timeFormatted };
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
      case "contacted": return "bg-blue-50 text-blue-700 border-blue-200";
      case "new": return "bg-violet-50 text-violet-700 border-violet-200";
      case "qualified": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "unqualified": return "bg-rose-50 text-rose-700 border-rose-200";
      case "cold": return "bg-slate-50 text-slate-700 border-slate-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getLeadTypeColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case "buyer-self": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "buyer investor": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "seller self": return "bg-amber-50 text-amber-700 border-amber-200";
      case "seller investor": return "bg-rose-50 text-rose-700 border-rose-200";
      case "seller builder": return "bg-orange-50 text-orange-700 border-orange-200";
      case "walk-in lead": return "bg-teal-50 text-teal-700 border-teal-200";
      case "referral lead": return "bg-sky-50 text-sky-700 border-sky-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-rose-50 text-rose-700 border-rose-200 font-semibold";
      case "medium": return "bg-amber-50 text-amber-700 border-amber-200 font-medium";
      case "low": return "bg-slate-50 text-slate-700 border-slate-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage?.toLowerCase()) {
      case "attempting contact": return "bg-blue-50 text-blue-700 border-blue-200";
      case "contacted": return "bg-purple-50 text-purple-700 border-purple-200";
      case "converted to opportunity": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "disqualified": return "bg-rose-50 text-rose-700 border-rose-200";
      case "new": return "bg-slate-50 text-slate-700 border-slate-200";
      case "nurturing": return "bg-amber-50 text-amber-700 border-amber-200";
      case "qualified": return "bg-teal-50 text-teal-700 border-teal-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
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
  const handleScheduleMeeting = () => lead && window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting+with+${encodeURIComponent(lead.name || "")}&details=${encodeURIComponent(`Discuss lead #${lead.lead_number || lead.id}`)}&location=Online`, "_blank");

  const formatDateShort = (iso?: string | null): string => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${date} at ${time}`;
  };

  if (!canReadLeads) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_PAGE }}>
        <div className="text-center p-6 bg-white rounded-xl shadow-xs border border-slate-200">
          <div className="text-rose-600 text-sm font-semibold mb-1">Access Denied</div>
          <div className="text-slate-500 text-xs">You do not have permission to view leads.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_PAGE }}>
        <div className="text-center bg-white rounded-xl p-6 shadow-xs border border-slate-200 max-w-sm">
          <p className="text-rose-600 text-sm mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="px-3.5 py-1.5 rounded-lg text-white text-xs font-medium transition-all hover:opacity-90" style={{ background: PRIMARY_ORANGE }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading || !lead) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ background: BG_PAGE }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3" style={{ borderColor: PRIMARY_ORANGE }}></div>
          <p className="text-xs text-slate-500 font-medium">Loading lead details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2.5 sm:p-3 md:p-4" style={{ background: BG_PAGE }}>
      <div className="max-w-[1600px] mx-auto space-y-2.5">
        
        {/* Top Minimal Toolbar */}
        <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <ArrowLeft size={13} className="text-slate-600" />
              Back
            </button>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
            <span className="text-xs font-semibold text-slate-800">
              Lead #{lead.lead_number ?? String(lead.id).slice(0, 6)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              ({currentLeadIndex + 1} of {filteredLeads.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 360 Journey */}
            <button
              onClick={() => setIsTimelineOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all shadow-xs"
              title="View complete customer browsing & activity timeline"
            >
              <Activity size={13} className="text-indigo-600" />
              <span>360 Journey</span>
            </button>

            {/* Edit */}
            <button
              onClick={handleEdit}
              disabled={!canUpdateLeads}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white transition-all shadow-xs ${
                canUpdateLeads ? "hover:opacity-90 active:scale-[0.98]" : "opacity-50 cursor-not-allowed"
              }`}
              style={{ background: PRIMARY_ORANGE }}
            >
              <Pencil size={12} />
              <span>Edit</span>
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={!canDeleteLeads}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors ${
                !canDeleteLeads ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-0.5"></div>

            {/* Pagination Prev / Next */}
            <button
              onClick={handlePreviousLead}
              disabled={currentLeadIndex <= 0}
              className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              title="Previous Lead"
            >
              <ChevronLeft size={13} />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              onClick={handleNextLead}
              disabled={currentLeadIndex >= filteredLeads.length - 1}
              className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              title="Next Lead"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* 2-Column Main Layout: Left = Lead Details, Right = Timeline */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          
          {/* Main Lead Details Card (2 Cols) */}
          <div className="xl:col-span-2 space-y-3">
            
            {/* Header Identity Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-3.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* Lead Name & Tags */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                    style={{ background: PRIMARY_NAVY }}
                  >
                    {lead.name ? lead.name.charAt(0).toUpperCase() : "L"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                        {lead.salutation ? `${lead.salutation} ` : ""}{lead.name}
                      </h1>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getLeadTypeColor(lead.lead_type || "")}`}>
                        {lead.lead_type || "Lead"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <History size={11} className="text-amber-600" />
                        <span>Follow-ups: {followups.length || lead.followups_count || 0}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-mono text-slate-600">ID #{lead.lead_number ?? lead.id}</span>
                      <span>•</span>
                      <span>Source: <strong className="text-slate-700 font-semibold">{lead.lead_source || "Direct"}</strong></span>
                      {lead.location && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-slate-600">
                            <MapPin size={11} className="text-slate-400" />
                            {lead.location}{lead.city ? `, ${lead.city}` : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Follow-up button */}
                  <button
                    onClick={() => {
                      if (!canCreateFollowups) {
                        toast.error("Permission denied");
                        return;
                      }
                      setEditingFollowup(null);
                      setShowFollowUpModal(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all shadow-xs ${
                      !canCreateFollowups ? "opacity-60 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98]"
                    }`}
                    style={{ background: PRIMARY_ORANGE }}
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    <span>Follow Up</span>
                  </button>

                  {/* Assign Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (!canAssignLeads) { toast.error("Permission denied"); return; }
                        if (!execsLoading) setShowExecDropdown((s) => !s);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white transition-all shadow-xs ${
                        (!canAssignLeads || assignableExecs.length === 0) ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                      }`}
                      style={{ background: PRIMARY_NAVY }}
                      disabled={!canAssignLeads || execsLoading || assignableExecs.length === 0}
                    >
                      <UserPlus size={12} />
                      <span>Assign</span>
                      <ChevronDown size={11} />
                    </button>
                    {showExecDropdown && canAssignLeads && (
                      <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-slate-200 z-30 overflow-hidden">
                        <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-700">Assign Executive</span>
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                          {assignableExecs.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-slate-400">No executives found</div>
                          ) : (
                            assignableExecs.map((exec: PresalesUser) => (
                              <button
                                key={exec.id}
                                onClick={() => handleExecAssign(String(exec.id), exec.name)}
                                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                                  String(lead.assigned_executive) === String(exec.id)
                                    ? "bg-orange-50 text-orange-700 font-semibold"
                                    : "hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <span>{exec.name?.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, "").trim()}</span>
                                {String(lead.assigned_executive) === String(exec.id) && (
                                  <Check size={12} className="text-orange-600" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fast Comms Buttons */}
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-0.5">
                    <button
                      onClick={handleCall}
                      className="p-1.5 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      title="Call Lead"
                    >
                      <Phone size={13} />
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="p-1.5 rounded-md text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 border border-emerald-300 transition-colors"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle size={13} />
                    </button>
                    <button
                      onClick={handleEmail}
                      className="p-1.5 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      title="Send Email"
                    >
                      <Mail size={13} />
                    </button>
                    <button
                      onClick={handleScheduleMeeting}
                      className="p-1.5 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                      title="Schedule Google Calendar Meeting"
                    >
                      <Calendar size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-500" />
                    Contact Information
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-16">PHONE</span>
                      <span className="font-semibold text-slate-800">{lead.phone || "-"}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(lead.phone || "", "Phone")}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          title="Copy phone"
                        >
                          {copiedField === "Phone" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                        <button
                          onClick={handleCall}
                          className="p-1 text-emerald-600 hover:text-emerald-700 rounded transition-colors"
                          title="Call"
                        >
                          <Phone size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-16 shrink-0">EMAIL</span>
                      <span className="font-medium text-slate-800 truncate">{lead.email || "-"}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(lead.email || "", "Email")}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                          title="Copy email"
                        >
                          {copiedField === "Email" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                        <button
                          onClick={handleEmail}
                          className="p-1 text-blue-600 hover:text-blue-700 rounded transition-colors"
                          title="Send mail"
                        >
                          <Mail size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-16">WHATSAPP</span>
                      <span className="font-medium text-slate-800">{lead.whatsapp_number || lead.phone || "-"}</span>
                    </div>
                    {(lead.whatsapp_number || lead.phone) && (
                      <button
                        onClick={handleWhatsApp}
                        className="p-1 text-emerald-600 hover:text-emerald-700 rounded transition-colors"
                        title="Open WhatsApp"
                      >
                        <MessageCircle size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-500" />
                    Location & Geography
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase w-16">STATE</span>
                    <span className="font-medium text-slate-800">{lead.state || "-"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase w-16">CITY</span>
                    <span className="font-medium text-slate-800">{lead.city || "-"}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase w-16">LOCATION</span>
                    <span className="font-semibold text-slate-800">{lead.location || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Status & Classification Details */}
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag size={12} className="text-slate-500" />
                  Classification & Lifecycle
                </span>
                
                {/* Transfer Action if Qualified */}
                {shouldShowTransfer(lead, latestFollowup) && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowTransferOptions(!showTransferOptions)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white transition-all shadow-xs hover:opacity-90"
                      style={{ background: PRIMARY_ORANGE }}
                    >
                      <ArrowRightLeft size={12} />
                      <span>Transfer Lead</span>
                      <ChevronDown size={11} />
                    </button>
                    {showTransferOptions && (
                      <div className="absolute right-0 mt-1 w-44 rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden bg-white p-1">
                        <button
                          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded transition-colors flex items-center gap-1.5"
                          onClick={() => { setShowTransferOptions(false); setShowBuyerComponent(true); }}
                        >
                          <Building2 size={12} />
                          <span>Transfer to Buyer</span>
                        </button>
                        <button
                          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-indigo-700 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1.5"
                          onClick={() => { setShowTransferOptions(false); setShowSellerComponent(true); }}
                        >
                          <Building2 size={12} />
                          <span>Transfer to Seller</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Source:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {lead.lead_source || "Direct"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Priority:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] border ${getPriorityColor(lead.priority || "")}`}>
                    {lead.priority || "Medium"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Stage:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getStageColor(lead.stage || "")}`}>
                    {lead.stage || "New"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              </div>

              {/* Audit & Timestamp Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Created */}
                <div className="p-2 rounded-md bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1 text-slate-500 mb-1">
                    <Clock size={11} />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">CREATED</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{createdDate}</p>
                  <p className="text-[10px] text-slate-400">{createdTime}</p>
                  <p className="text-[10px] text-slate-600 mt-1 truncate">By: {lead.created_by_name || "System"}</p>
                </div>

                {/* Updated */}
                <div className="p-2 rounded-md bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1 text-slate-500 mb-1">
                    <History size={11} />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">UPDATED</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{updatedDate}</p>
                  <p className="text-[10px] text-slate-400">{updatedTime}</p>
                  <p className="text-[10px] text-slate-600 mt-1 truncate">By: {lead.updated_by_name || "System"}</p>
                </div>

                {/* Last Contact */}
                <div className="p-2 rounded-md bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-1 text-slate-500 mb-1">
                    <PhoneCall size={11} />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">LAST CONTACT</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{lastContactDate || "-"}</p>
                  <p className="text-[10px] text-slate-400">{lastContactTime || "-"}</p>
                  <p className="text-[10px] text-slate-600 mt-1 truncate">By: {lead.last_contacted_by_name || lead.last_contacted_by || "-"}</p>
                </div>

                {/* Assigned Executive */}
                <div className="p-2 rounded-md bg-orange-50/50 border border-orange-200/70">
                  <div className="flex items-center gap-1 text-orange-600 mb-1">
                    <UserCheck size={11} />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-orange-800">ASSIGNED EXECUTIVE</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">{getAssignedExecName()}</p>
                  <p className="text-[10px] text-orange-700/80 mt-1">Active Presales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Follow-ups Timeline */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-full">
            {/* Timeline Header */}
            <div className="px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-lg">
              <div className="flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-600" />
                <h2 className="text-xs font-bold text-slate-800">Follow-ups Timeline</h2>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  {followups.length}
                </span>
              </div>
              <button
                onClick={() => {
                  if (!canCreateFollowups) {
                    toast.error("Permission denied");
                    return;
                  }
                  setEditingFollowup(null);
                  setShowFollowUpModal(true);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white transition-all shadow-xs ${
                  !canCreateFollowups ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={{ background: PRIMARY_ORANGE }}
                title="Add Follow-up"
              >
                <Plus size={12} />
                <span>Add Follow-up</span>
              </button>
            </div>

            {/* Timeline List */}
            <div className="p-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
              {followupsLoading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: PRIMARY_ORANGE }}></div>
                </div>
              )}

              {!followupsLoading && id && followupsError && (
                <div className="text-center py-6 text-rose-500 text-xs">{followupsError}</div>
              )}

              {!followupsLoading && !followupsError && followups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                  <MessageSquare size={28} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No follow-ups recorded yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Keep track of client calls, meetings & remarks</p>
                  <button
                    onClick={() => {
                      if (!canCreateFollowups) {
                        toast.error("Permission denied");
                        return;
                      }
                      setEditingFollowup(null);
                      setShowFollowUpModal(true);
                    }}
                    className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white shadow-xs hover:opacity-90"
                    style={{ background: PRIMARY_ORANGE }}
                  >
                    <Plus size={12} />
                    <span>Add First Follow-up</span>
                  </button>
                </div>
              )}

              {!followupsLoading && !followupsError && followups.length > 0 && (
                <div className="space-y-3">
                  {followups.map((f, idx) => {
                    const sched = formatScheduleDisplay(
                      f.scheduledDate || f.scheduled_date,
                      f.scheduledTime || f.scheduled_time
                    );
                    const fAny = f as any;
                    const currentAccountProfileName =
                      (user as any)?.name ||
                      (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") ||
                      (user as any)?.username ||
                      "Executive";

                    const stripSalutation = (val?: string | null): string => {
                      if (!val) return "";
                      return String(val)
                        .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.|shri\.|smt\.|mr|mrs|ms|dr|prof|shri|smt)\s+/i, "")
                        .trim();
                    };

                    const rawCreatedByName =
                      (fAny.created_by_name && fAny.created_by_name !== "System" && !String(fAny.created_by_name).toLowerCase().includes("system") ? fAny.created_by_name : null) ||
                      (fAny.createdByName && fAny.createdByName !== "System" && !String(fAny.createdByName).toLowerCase().includes("system") ? fAny.createdByName : null) ||
                      (`${f.createdByFirstName || ""} ${f.createdByLastName || ""}`.trim() || null) ||
                      (typeof f.createdBy === "string" && f.createdBy !== "System" && !String(f.createdBy).toLowerCase().includes("system") ? f.createdBy : null) ||
                      (fAny.created_by && isNaN(Number(fAny.created_by)) && !String(fAny.created_by).toLowerCase().includes("system") ? String(fAny.created_by) : null) ||
                      (fAny.created_by ? `User #${fAny.created_by}` : null) ||
                      (fAny.assigned_by_name && fAny.assigned_by_name !== "System" && !String(fAny.assigned_by_name).toLowerCase().includes("system") ? fAny.assigned_by_name : null) ||
                      currentAccountProfileName;
                    const createdByName = stripSalutation(rawCreatedByName) || rawCreatedByName;

                    const rawAssignedToName = resolveAssignedToName(fAny, lead);
                    const assignedToName = (rawAssignedToName && rawAssignedToName !== "Unassigned")
                      ? (stripSalutation(rawAssignedToName) || rawAssignedToName)
                      : "Unassigned";

                    const rawAssignedByName = resolveAdminOrAssignerFullName(fAny, lead);
                    const assignedByName = stripSalutation(rawAssignedByName) || rawAssignedByName;

                    const prioritySlug = (f.priority || "").toLowerCase().trim();
                    const priorityDotColor =
                      prioritySlug === "high" || prioritySlug === "urgent"
                        ? "bg-rose-500"
                        : prioritySlug === "medium"
                        ? "bg-amber-500"
                        : prioritySlug === "low"
                        ? "bg-emerald-500"
                        : "bg-slate-400";
                    const priorityLabel = (f.priority || "NORMAL").toUpperCase();
                    const fuNumberStr = `FU ${String(idx + 1).padStart(2, "0")}`;

                    return (
                      <div
                        key={f.id}
                        className="group relative rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      >
                        {/* Top Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {/* Dark Navy Pill Badge (FU 01, FU 02) */}
                            <span className="inline-flex h-6 min-w-[42px] items-center justify-center rounded-lg bg-[#0f2b3d] px-2 text-[9.5px] font-bold tracking-wide text-white shadow-xs">
                              {fuNumberStr}
                            </span>
                            {/* Follow-up Type Tag */}
                            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-slate-700 shadow-2xs">
                              {(() => {
                                const norm = (f.type || '').toLowerCase();
                                if (norm.includes('call') || norm.includes('phone')) return <PhoneCall size={11} className="text-blue-600 shrink-0" />;
                                if (norm.includes('whatsapp')) return <MessageSquareText size={11} className="text-emerald-600 shrink-0" />;
                                if (norm.includes('email') || norm.includes('mail')) return <MailCheck size={11} className="text-sky-600 shrink-0" />;
                                if (norm.includes('meeting') || norm.includes('visit')) return <CalendarCheck size={11} className="text-purple-600 shrink-0" />;
                                return <Sparkles size={11} className="text-amber-500 shrink-0" />;
                              })()}
                              <span className="truncate">{f.type || "CALL"}</span>
                            </span>
                          </div>

                          {/* Edit / Delete Action Icons */}
                          <div className="flex shrink-0 items-center gap-1">
                            {canUpdateFollowups && (
                              <button
                                onClick={() => handleEditFollowup(f)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                                title="Edit Follow-up"
                              >
                                <PencilLine size={13} />
                              </button>
                            )}
                            {canDeleteFollowups && (
                              <button
                                onClick={() => handleDeleteFollowup(f.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                                title="Delete Follow-up"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Stage, Status & Priority Row */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {f.stage && (
                            <span className="inline-flex items-center rounded-md border border-indigo-100 bg-indigo-50/80 px-2 py-0.5 text-[9.5px] font-semibold text-indigo-700">
                              Stage · {f.stage}
                            </span>
                          )}
                          {f.status && (
                            <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50/80 px-2 py-0.5 text-[9.5px] font-semibold text-blue-700">
                              Status · {f.status}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[9.5px] font-semibold text-slate-700">
                            <span className={`h-1.5 w-1.5 rounded-full ${priorityDotColor}`} />
                            {priorityLabel}
                          </span>
                        </div>

                        {/* Next Action & Scheduled 2-Column Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                          {/* Next Action */}
                          <div className="min-w-0 rounded-xl border border-indigo-100 bg-indigo-50/40 p-2.5">
                            <div className="mb-1 flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-indigo-600">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-indigo-600 shadow-2xs border border-indigo-100">
                                <Zap size={10} className="text-indigo-600 fill-indigo-600" />
                              </span>
                              <span>NEXT ACTION</span>
                            </div>
                            <p className="truncate text-xs font-bold text-slate-900 uppercase tracking-tight" title={String(f.nextAction || "Not set")}>
                              {f.nextAction || "Not set"}
                            </p>
                          </div>

                          {/* Scheduled */}
                          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5">
                            <div className="mb-1 flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-slate-600 shadow-2xs border border-slate-200">
                                <CalendarClock size={11} className="text-slate-600" />
                              </span>
                              <span>SCHEDULED</span>
                            </div>
                            <p className="truncate text-xs font-semibold text-slate-700" title={sched ? `${sched.date} ${sched.time ? `at ${sched.time}` : ''}` : "Not scheduled"}>
                              {sched ? `${sched.date} ${sched.time ? `at ${sched.time}` : ''}` : "Not scheduled"}
                            </p>
                          </div>
                        </div>

                        {/* Outcome / Remarks */}
                        {(f.customRemark || f.remark) && (
                          <div className="mt-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 p-2.5">
                            <div className="mb-1 flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-amber-700">
                              <span className="flex h-4 w-4 items-center justify-center rounded bg-amber-100/80 text-amber-700">
                                <MessageSquareQuote size={10} />
                              </span>
                              OUTCOME / REMARKS
                            </div>
                            <p className="text-[11px] font-medium leading-relaxed text-slate-700 whitespace-pre-wrap">
                              {f.customRemark || f.remark}
                            </p>
                          </div>
                        )}

                        {/* Shortlisted / Attached Properties */}
                        {Boolean((f as any).project || (f as any).siteLocation || (f as any).site_location || fAny.project || fAny.site_location) && (
                          <div className="mt-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-2.5">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-emerald-900 flex items-center gap-1 text-[8.5px] uppercase tracking-wider">
                                <Building2 size={11} className="text-emerald-600 shrink-0" />
                                Shared Properties
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const leadName = (lead?.name || "Sir/Madam").trim();
                                  const phone = lead?.phone || (fAny as any).entity_phone || (fAny as any).entityPhone || "";
                                  const cleanPhone = phone.replace(/[^0-9]/g, "");
                                  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                                  const fProj = (f as any).project || fAny.project || "";
                                  const fLoc = (f as any).siteLocation || (f as any).site_location || fAny.site_location || "";
                                  const text = `Hello ${leadName},\n\nHere are the shortlisted property details from Resale Expert:\nProject: ${fProj}${fLoc ? `\nLocation: ${fLoc}` : ""}\n\nPlease let us know if you need more details.\n\nThank you!`;
                                  const waUrl = finalPhone
                                    ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`
                                    : `https://wa.me/?text=${encodeURIComponent(text)}`;
                                  window.open(waUrl, "_blank");
                                }}
                                className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                                title="Share on WhatsApp"
                              >
                                <Send size={8} />
                                Share WA
                              </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              {String((f as any).project || fAny.project || '').split(',').map((pName: string, pIdx: number) => {
                                const cleanName = pName.trim();
                                if (!cleanName) return null;
                                const locParts = String((f as any).siteLocation || (f as any).site_location || fAny.site_location || '').split(',').map((l: string) => l.trim()).filter(Boolean);
                                const assignedLoc = locParts[pIdx] || locParts[0] || '';
                                return (
                                  <div
                                    key={pIdx}
                                    className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-[10px]"
                                  >
                                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                                      <Building2 size={10} className="text-emerald-600 shrink-0" /> {cleanName}
                                    </span>
                                    {assignedLoc && (
                                      <span className="flex items-center gap-0.5 text-emerald-700 font-medium text-[9px] bg-emerald-50 px-1 py-0.2 rounded">
                                        <MapPin size={8} className="text-emerald-500" /> {assignedLoc}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Footer Audit Metadata */}
                        <div className="mt-3 border-t border-dashed border-slate-200 pt-2.5">
                          <div className="space-y-1 text-[9.5px] text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <UserIcon size={10} className="shrink-0 text-slate-400" />
                              <span>Created by</span>
                              <strong className="font-semibold text-slate-700">{createdByName}</strong>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <UserCheck size={10} className="shrink-0 text-slate-400" />
                              <span>Assigned to</span>
                              <strong className="font-semibold text-slate-700">{assignedToName}</strong>
                            </div>
                            {assignedByName && (
                              <div className="flex items-center gap-1.5">
                                <Share2 size={10} className="shrink-0 text-slate-400" />
                                <span>Assigned by</span>
                                <strong className="font-semibold text-slate-700">{assignedByName}</strong>
                              </div>
                            )}
                          </div>
                          {f.createdAt && (
                            <div className="mt-1.5 text-[8.5px] text-slate-400">
                              Created {formatDateShort(f.createdAt)}
                            </div>
                          )}
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

      {/* FollowUp Modal */}
      <FollowUpModal
        open={showFollowUpModal}
        mode={editingFollowup ? "edit" : "add"}
        currentFollowUp={editingFollowup as any}
        entityData={lead}
        initialEntityCode="LEAD"
        initialEntityId={lead?.lead_number || lead?.id}
        initialEntityName={lead?.name}
        initialEntityPhone={lead?.phone}
        initialStageCode={lead?.stage}
        initialStatusCode={lead?.status}
        initialAssignedTo={getAssignedExecName() !== 'Unassigned' ? getAssignedExecName() : (lead?.assigned_executive_name || lead?.assigned_executive)}
        initialAttemptNo={editingFollowup ? ((editingFollowup as any)?.attempt_no || 1) : ((followups?.length || 0) + 1)}
        onClose={() => {
          setShowFollowUpModal(false);
          setEditingFollowup(null);
        }}
        onSaved={() => {
          setShowFollowUpModal(false);
          setEditingFollowup(null);
          fetchFollowups();
        }}
      />

      {/* Buyer / Seller Transfer Modals */}
      {showBuyerComponent && lead && <BuyerFormModal lead={lead} followups={followups} onClose={() => setShowBuyerComponent(false)} />}
      {showSellerComponent && lead && <SellerFormModal lead={lead} followups={followups} onClose={() => setShowSellerComponent(false)} />}
      
      {/* Edit Lead Modal */}
      <AddLeadModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLead} lead={lead || undefined} />

      {/* Delete Followup Confirmation Modal */}
      {followupToDelete !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setFollowupToDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 m-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 mb-3 border border-rose-100">
                <Trash2 size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Delete Follow-up</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this follow-up record? This action cannot be undone.
              </p>
              <div className="flex gap-2 w-full mt-4">
                <button
                  onClick={() => setFollowupToDelete(null)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteFollowup}
                  className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowDeleteLeadModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-5 m-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 mb-3 border border-rose-100">
                <Trash2 size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Delete Lead</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800">{lead?.salutation} {lead?.name}</strong>? All associated data will be removed.
              </p>
              <div className="flex gap-2 w-full mt-4">
                <button
                  onClick={() => setShowDeleteLeadModal(false)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteLead}
                  className="flex-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead 360 Activity Timeline Modal */}
      {lead && (
        <LeadActivityTimelineModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          leadId={lead.id}
          leadNumber={lead.lead_number}
          leadName={`${lead.salutation || ''} ${lead.name || ''}`.trim()}
          phone={lead.phone}
          email={lead.email}
        />
      )}
    </div>
  );
};

export default LeadDetailPage;