import React, { useEffect, useMemo, useRef, useState } from "react";
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
  ArrowLeftToLine,
  ArrowRightToLine,
  MessageSquare,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import { FiArrowLeft, FiEdit, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { leadsAPI, usersAPI } from "@/lib/api";
import { masterDataAPI } from "@/lib/mastersAPI";
import { followupAPI } from "@/lib/followupAPI";
import { notificationAPI } from "@/lib/notificationAPI"; // ✅ Import notification API

import FollowupModal, { FOLLOWUP_TYPES, FollowupForm } from "@/pages/dashboard/components/FollowupModal";
import BuyerFormModal from "./components/BuyerFormModal";

import AddLeadModal from "./components/AddLeadModal";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableExecutives } from "../utils/roleBasedOptions";
import { canDeleteLead } from "../utils/rolePermissions";
import SellerFormModal from "./components/SellerFormModel";

/* ===================== Types ===================== */
type UserRole = "admin" | "manager" | "agent";

export interface Lead {
  id: string;
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
type UILead = Lead & {
  assigned_executive_name?: string;
};

type Followup = {
  priority: string;
  id: string;
  leadId: string;
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
};

// helpers (file-level)
const getLatestFollowup = (arr?: Followup[] | null) => (arr && arr.length ? arr[0] : null);

const shouldShowTransfer = (ld?: Lead | null, lf?: Followup | null) => {
  const lStage = (ld?.stage || "").trim().toLowerCase();
  const lStatus = (ld?.status || "").trim().toLowerCase();
  const fStage = (lf?.stage || "").trim().toLowerCase();
  const fStatus = (lf?.status || "").trim().toLowerCase();

  const isLeadOK = (lStage === "contacted" || lStage === "connected") && lStatus === "qualified";
  const isFollowupOK = (fStage === "contacted" || fStage === "connected") && fStatus === "qualified";

  return isLeadOK || isFollowupOK;
};

// export if you reuse elsewhere
export const getFollowupTypeClasses = (t: string) => {
  const color = FOLLOWUP_TYPES.find((ft) => ft.value === t)?.color || "gray";
  const map: Record<string, { container: string; icon: string; leftBar: string; badge: string }> = {
    blue: { container: "bg-blue-50 border-blue-200 hover:bg-blue-50", icon: "text-blue-600", leftBar: "border-blue-400", badge: "bg-blue-100 text-blue-800 border-blue-200" },
    green: { container: "bg-green-50 border-green-200 hover:bg-green-50", icon: "text-green-600", leftBar: "border-green-400", badge: "bg-green-100 text-green-800 border-green-200" },
    indigo: { container: "bg-indigo-50 border-indigo-200 hover:bg-indigo-50", icon: "text-indigo-600", leftBar: "border-indigo-400", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    orange: { container: "bg-orange-50 border-orange-200 hover:bg-orange-50", icon: "text-orange-600", leftBar: "border-orange-400", badge: "bg-orange-100 text-orange-800 border-orange-200" },
    purple: { container: "bg-purple-50 border-purple-200 hover:bg-purple-50", icon: "text-purple-600", leftBar: "border-purple-400", badge: "bg-purple-100 text-purple-800 border-purple-200" },
    gray: { container: "bg-gray-50 border-gray-200 hover:bg-gray-50", icon: "text-gray-600", leftBar: "border-gray-400", badge: "bg-gray-100 text-gray-800 border-gray-200" },
  };
  return map[color];
};

const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState<number>(0);

  const [showAgentDropdown, setShowAgentDropdown] = useState<boolean>(false);
  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showBuyerComponent, setShowBuyerComponent] = useState(false);
  const [showSellerComponent, setShowSellerComponent] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [followups, setFollowups] = useState<Followup[]>([]);
  const [followupsLoading, setFollowupsLoading] = useState(false);
  const [followupsError, setFollowupsError] = useState<string | null>(null);

  const [masterOptions, setMasterOptions] = useState({
    salutation: [] as { value: string; label: string }[],
    leadType: [] as { value: string; label: string }[],
    leadSource: [] as { value: string; label: string }[],
    leadStatus: [] as { value: string; label: string }[],
    states: [] as { value: string; label: string }[],
    cities: [] as { value: string; label: string }[],
    locations: [] as { value: string; label: string }[],
    agents: [] as { value: string; label: string; role?: string }[],
  });

  const currentUserRole: UserRole = "admin";
  const { user } = useAuth();
  const [presalesUsers, setPreSalesUsers] = useState<any[]>([]);
  const [showExecDropdown, setShowExecDropdown] = useState(false);

  // fetch presales users once (executives list)
  useEffect(() => {
    (async () => {
      try {
        const resp = await usersAPI.getAllUsers?.();
        const execs = (resp?.data || []).filter(
          (u: any) =>
            (String(u?.department || "").toLowerCase() === "presales" || String(u?.department || "").toLowerCase() === "pre-sales") &&
            String(u?.role || "").toLowerCase() === "executive"
        );
        setPreSalesUsers(execs);
      } catch (err) {
        console.error("Failed to load executives:", err);
      }
    })();
  }, []);

  // ✅ Fixed handleExecAssign with proper notification support
  const handleExecAssign = async (execId: string, execName: string) => {
    if (!lead) return;
    
    try {
      const previousExec = lead.assigned_executive;
      
      // Update local state first for immediate UI feedback
      setLead({ ...lead, assigned_executive: execId, assigned_executive_name: execName });
      setShowExecDropdown(false);
      
      // Call API to update assignment
      await leadsAPI.assignToExecutive(lead.id, { assigned_executive: execId });
      
      // ✅ Send notification if executive is being assigned (not unassigned) and it's a different executive
      if (execId && execId.trim() !== "" && execId !== previousExec) {
        try {
          await notificationAPI.createNotification({
            leadId: String(lead.id), // ✅ Convert to string
            userId: String(execId),   // ✅ Convert to string
            message: `Lead assigned to ${execName}`,
            type: "lead_assign",
            link: `/dashboard/leads/${lead.id}`,
          });
          
          console.log("✅ Assignment notification sent to executive:", execName);
        } catch (notifErr) {
          console.error("Failed to send notification:", notifErr);
          console.error("Notification error details:", notifErr?.response?.data || notifErr?.message);
          // Don't fail the assignment for notification error
          toast.warn("Lead assigned but notification failed to send");
        }
      }
      
      toast.success(`Lead assigned to ${execName}`);
    } catch (err) {
      console.error("Error assigning executive:", err);
      // Revert local state on error
      if (lead) {
        setLead({ ...lead, assigned_executive: lead.assigned_executive, assigned_executive_name: lead.assigned_executive_name });
      }
      toast.error("Failed to assign. Please try again.");
    }
  };

  const getAssignedExecName = () => {
    if (lead?.assigned_executive_name && lead.assigned_executive_name !== "Unassigned") {
      return lead.assigned_executive_name;
    }
    if (lead?.assigned_executive && presalesUsers.length > 0) {
      const exec = presalesUsers.find(u => String(u.id) === String(lead.assigned_executive));
      return exec?.name || "Unassigned";
    }
    return "Unassigned";
  };

  // Update lead when presalesUsers becomes available (resolve name)
  useEffect(() => {
    if (lead?.assigned_executive && presalesUsers.length > 0 &&
      (!lead.assigned_executive_name || lead.assigned_executive_name === "Unassigned")) {
      const exec = presalesUsers.find(u => String(u.id) === String(lead.assigned_executive));
      if (exec) {
        setLead(prev => prev ? ({ ...prev, assigned_executive_name: exec.name }) : prev);
      }
    }
  }, [presalesUsers, lead]);

  // editing follow-up
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);

  // latest follow-up (memoized)
  const latestFollowup = useMemo(() => getLatestFollowup(followups), [followups]);

  /* ===================== Effects ===================== */
  // Close transfer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTransferOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch followups
  const fetchFollowups = async (leadIdParam?: string) => {
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

      // normalize various shapes
      let followupsData: Followup[] = [];
      if (Array.isArray(response?.data)) followupsData = response.data;
      else if (Array.isArray(response)) followupsData = response;
      else if (Array.isArray(response?.payload)) followupsData = response.payload;
      else if (Array.isArray(response?.result)) followupsData = response.result;

      if (!followupsData || followupsData.length === 0) {
        setFollowups([]);
        return [];
      }

      followupsData = followupsData.map((f: any) => ({
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

      // sort latest first (scheduledDate -> createdAt)
      followupsData.sort((a, b) => {
        const da = new Date(a.scheduledDate || a.createdAt || 0).getTime();
        const db = new Date(b.scheduledDate || b.createdAt || 0).getTime();
        if (db !== da) return db - da;
        if (a.id && b.id) return a.id > b.id ? -1 : 1;
        return 0;
      });

      setFollowups(followupsData);
      return followupsData;
    } catch (e: any) {
      const status = e?.response?.status || e?.status;
      if (status === 404 || status === 204) {
        console.warn("No followups found for lead:", leadToUse);
        setFollowups([]);
        setFollowupsError(null);
        return [];
      } else {
        console.error("Error fetching followups:", e);
        setFollowupsError("Failed to fetch follow-ups");
        setFollowups([]);
        return [];
      }
    } finally {
      setFollowupsLoading(false);
    }
  };

  const handleEditFollowups = (f: Followup) => {
    setEditingFollowup(f);
    setIsFollowupModalOpen(true);
  };

  const handleDeleteFollowups = async (followupId: string) => {
    const prev = [...followups];
    setFollowups((p) => p.filter((f) => f.id !== followupId));

    try {
      await followupAPI.deleteFollowup(followupId);
      toast.success("Follow-up deleted successfully");
    } catch (e) {
      console.error("Delete follow-up failed:", e);
      setFollowups(prev); // rollback
      toast.error("Failed to delete follow-up. Please try again.");
    }
  };

  useEffect(() => {
    fetchFollowups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch lead + master data
  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);

        // ensure we have presales users (resolve names from them if needed)
        if (!presalesUsers || presalesUsers.length === 0) {
          try {
            const resp = await usersAPI.getAllUsers?.();
            setPreSalesUsers(resp?.data || []);
          } catch (e) {
            console.warn("Could not fetch presales users inside fetchLead:", e);
          }
        }

        if (id) {
          const [response, allLeadsResponse] = await Promise.all([leadsAPI.getLead(id), leadsAPI.getLeads()]);

          if (allLeadsResponse?.success && allLeadsResponse.data) {
            setAllLeads(allLeadsResponse.data);
            const index = allLeadsResponse.data.findIndex((l: Lead) => l.id === id);
            setCurrentLeadIndex(index >= 0 ? index : 0);
          }

          const data = response?.data ?? response;
          if (!data) {
            setError("No lead data returned");
            return;
          }

          const resolveUserName = (userId: any) => {
            if (!userId) return null;
            const found = (presalesUsers || []).find(u => String(u.id) === String(userId) || String(u._id) === String(userId) || String(u.user_id) === String(userId));
            return found?.name ?? found?.full_name ?? found?.displayName ?? null;
          };

          const execName = data.assigned_executive_name || resolveUserName(data.assigned_executive) || "Unassigned";

          const createdByName =
            data.created_by_name ||
            resolveUserName(data.created_by) ||
            `${data.created_first_name || data.createdByFirstName || ""} ${data.created_last_name || data.createdByLastName || ""}`.trim() ||
            "System";

          const updatedByName =
            data.updated_by_name ||
            resolveUserName(data.updated_by) ||
            `${data.updated_first_name || data.updatedByFirstName || ""} ${data.updated_last_name || data.updatedByLastName || ""}`.trim() ||
            "System";

          const lastContactedByName =
            data.last_contacted_by_name ||
            resolveUserName(data.last_contacted_by) ||
            data.updated_by_name ||
            data.updated_by ||
            null;

          const leadData: Lead = {
            id: data.id || data._id || "",
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
            assigned_executive: data.assigned_executive || "",
            assigned_executive_name: execName,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
            priority: data.priority || " -",
            stage: data.stage || "-",
            created_by: data.created_by || data.createdBy || "System",
            last_contact: data.last_contact || data.lastContact || "",
            last_contacted_by: data.last_contacted_by || data.last_contact_by || data.lastContactedBy || "",
            last_contacted_by_name: lastContactedByName,
            created_by_name: createdByName,
            updated_by_name: updatedByName,
          };

          setLead(leadData);
        }
      } catch (err) {
        console.error("Error fetching lead details:", err);
        setError("Failed to fetch lead details");
      } finally {
        setLoading(false);
      }
    };

    const initializeData = async () => {
      await Promise.all([fetchLead(), fetchMasterData()]);
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMasterData = async () => {
    try {
      setError(null);

      const [leadMasterTypes, commonMasterTypes] = await Promise.all([
        masterDataAPI.getAllMasterTypes("lead"),
        masterDataAPI.getAllMasterTypes("common"),
      ]);

      const allMasterTypes = [...leadMasterTypes, ...commonMasterTypes];

      const masterValues = await Promise.all(
        allMasterTypes.map(async (masterType: any) => {
          try {
            const values = await masterDataAPI.getMasterValues(masterType.id);
            return values;
          } catch (err) {
            console.error(`❌ Error fetching values for ${masterType.name}:`, err);
            return [];
          }
        })
      );

      const organizedData: Record<string, { value: string; label: string; role?: string }[]> = {};
      allMasterTypes.forEach((masterType: any, index: number) => {
        const values = masterValues[index] || [];
        const normalizedName = (masterType.name || "").toLowerCase().trim();
        organizedData[normalizedName] = values.map((item: any) => ({
          value: item.value,
          label: item.value || item.name || "Unknown",
          role: item.role || "Agent",
        }));
      });

      const findAgentData = () => {
        const possibleAgentKeys = [
          "agent",
          "agents",
          "role",
          "roles",
          "user",
          "users",
          "employee",
          "employees",
          "staff",
          "team member",
          "team_member",
        ];
        for (const key of possibleAgentKeys) {
          if (organizedData[key] && organizedData[key].length > 0) {
            return organizedData[key];
          }
        }
        console.warn("⚠️ No agent data found in organizedData");
        return [];
      };

      const agentData = findAgentData();

      setMasterOptions((prev) => ({
        ...prev,
        salutation: organizedData["salutation"] || organizedData["salutations"] || [],
        leadType:
          organizedData["lead type"] ||
          organizedData["leadtype"] ||
          organizedData["lead_type"] ||
          [],
        leadSource:
          organizedData["lead source"] ||
          organizedData["leadsource"] ||
          organizedData["lead_source"] ||
          [],
        leadStatus:
          organizedData["lead status"] ||
          organizedData["leadstatus"] ||
          organizedData["lead_status"] ||
          organizedData["status"] ||
          [],
        states: organizedData["state"] || organizedData["states"] || [],
        cities: organizedData["city"] || organizedData["cities"] || [],
        locations: organizedData["location"] || organizedData["locations"] || [],
        agents: agentData.map((item) => ({
          value: item.value,
          label: item.label,
          role: item.role || "Agent",
        })),
      }));
    } catch (err: any) {
      console.error("❌ Failed to load master data:", err);
      setError(
        `Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  /* ===================== Helpers ===================== */
  const canAssignAgents = ["admin", "manager"].includes(currentUserRole);

  const handleTransferToBuyer = async () => {
    if (!lead?.id) return;
    try {
      setShowTransferOptions(false);
      const allFollowups = await fetchFollowups(lead.id);
      setShowBuyerComponent(true);
      if (allFollowups && Array.isArray(allFollowups)) {
        setFollowups(allFollowups);
      }
    } catch (err) {
      console.error("Failed to load followups before transfer:", err);
      toast.error("Unable to load follow-ups. Try again.");
    }
  };

  const handleTransferToSeller = async () => {
    if (!lead?.id) return;
    try {
      setShowTransferOptions(false);
      // fetch the latest followups for this lead and update state
      const allFollowups = await fetchFollowups(lead.id);
      if (allFollowups && Array.isArray(allFollowups)) {
        setFollowups(allFollowups);
      }
      // open seller modal
      setShowSellerComponent(true);
    } catch (err) {
      console.error("Failed to load followups before transfer to seller:", err);
      toast.error("Unable to load follow-ups. Try again.");
    }
  };


  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return { date: "-", time: "-" };
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch {
      return { date: "-", time: "-" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "new":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "qualified":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "unqualified":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLeadTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "buyer-self":
        return "bg-green-100 text-green-800 border-green-200";
      case "buyer inverstor":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "seller self":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "seller inverstor":
        return "bg-red-100 text-red-800 border-red-200";
      case "seller builder":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "attempting contact":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "contacted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "converted to opportunity":
        return "bg-green-100 text-green-800 border-green-200";
      case "disqualified":
        return "bg-red-100 text-red-800 border-red-200";
      case "new":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "nurturing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "qualified":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // header gradient
  const getLeadHeaderGradient = () => {
    const status = lead?.status?.toLowerCase() || "";
    const stage = lead?.stage?.toLowerCase() || "";
    const type = lead?.lead_type?.toLowerCase() || "";
    const priority = lead?.priority?.toLowerCase() || "";

    if (priority === "high") return "from-red-600 to-red-700";
    if (priority === "low") return "from-green-600 to-green-700";

    if (status === "qualified" || stage === "qualified") return "from-teal-600 to-teal-700";
    if (status === "contacted" || stage === "contacted") return "from-purple-600 to-purple-700";
    if (status === "unqualified" || stage === "disqualified") return "from-rose-600 to-rose-700";
    if (type === "seller builder") return "from-orange-600 to-orange-700";
    if (type === "buyer-self") return "from-green-600 to-green-700";
    if (type === "buyer inverstor") return "from-indigo-600 to-indigo-700";

    return "from-blue-600 to-indigo-700";
  };

  const handlePreviousLead = () => {
    if (allLeads.length === 0 || currentLeadIndex <= 0) return;
    const prevIndex = currentLeadIndex - 1;
    const prevLead = allLeads[prevIndex];
    setCurrentLeadIndex(prevIndex);
    navigate(`/dashboard/leads/${prevLead.id}`);
  };

  const handleNextLead = () => {
    if (allLeads.length === 0 || currentLeadIndex >= allLeads.length - 1) return;
    const nextIndex = currentLeadIndex + 1;
    const nextLead = allLeads[nextIndex];
    setCurrentLeadIndex(nextIndex);
    navigate(`/dashboard/leads/${nextLead.id}`);
  };

  // ✅ Fixed handleAgentAssign with proper notification support  
  const handleAgentAssign = async (agentId: string, agentName: string) => {
    if (!lead) return;
    
    try {
      const previousAgent = lead.assigned_executive;
      
      // Update local state first for immediate UI feedback
      setLead({ ...lead, assigned_executive: agentId, assigned_executive_name: agentName });
      setShowAgentDropdown(false);
      
      // Call API to update assignment
      await leadsAPI.updateLead(lead.id, { assigned_executive: agentId });
      
      // ✅ Send notification if agent is being assigned (not unassigned) and it's a different agent
      if (agentId && agentId.trim() !== "" && agentId !== previousAgent) {
        try {
          await notificationAPI.createNotification({
            leadId: String(lead.id), // ✅ Convert to string
            userId: String(agentId),  // ✅ Convert to string
            message: `Lead assigned to ${agentName}`,
            type: "lead_assign",
            link: `/dashboard/leads/${lead.id}`,
          });
          
          console.log("✅ Agent assignment notification sent to:", agentName);
        } catch (notifErr) {
          console.error("Failed to send agent notification:", notifErr);
          console.error("Agent notification error details:", notifErr?.response?.data || notifErr?.message);
          // Don't fail the assignment for notification error
          toast.warn("Agent assigned but notification failed to send");
        }
      }
      
      toast.success(`Lead assigned to ${agentName}`);
    } catch (error) {
      console.error("Error assigning agent:", error);
      // Revert local state on error
      if (lead) {
        setLead({ ...lead, assigned_executive: lead.assigned_executive, assigned_executive_name: lead.assigned_executive_name });
      }
      toast.error("Failed to assign agent. Please try again.");
    }
  };

  const handleCall = () => lead?.phone && window.open(`tel:${lead.phone}`, "_self");
  const handleWhatsApp = () =>
    lead?.whatsapp_number && window.open(`https://wa.me/${lead.whatsapp_number.replace(/\D/g, "")}`, "_blank");
  const handleEmail = () => lead?.email && window.open(`mailto:${lead.email}`, "_self");
  const handleScheduleMeeting = () =>
    lead &&
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting+with+${encodeURIComponent(
        lead.name || ""
      )}&details=${encodeURIComponent(`Discuss lead ${lead.id}`)}&location=Online&dates=20240101T100000Z/20240101T110000Z`,
      "_blank"
    );

  const handleBack = () => navigate("/dashboard/leads");
  const handleEdit = () => setIsEditModalOpen(true);

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        const response = await leadsAPI.deleteLead(id);
        if (response.success) {
          toast.success("Lead deleted ✅");
          await fetchMasterData();
          handleBack();
        } else {
          toast.error("Failed to delete lead ❌");
        }
      } catch (error) {
        console.error("❌ Error deleting lead:", error);
        toast.error("Error deleting lead");
      }
    }
  };

  // ✅ Enhanced handleSaveLead with notification support for assignment changes
  const handleSaveLead = async (updatedLead: Lead | null) => {
    if (!updatedLead) return;
    
    try {
      const previousExec = lead?.assigned_executive;
      const newExec = updatedLead.assigned_executive;
      
      const response = await leadsAPI.updateLead(updatedLead.id!, updatedLead);
      const savedLead = response?.data || response;

      setLead((prev) => ({ ...prev, ...savedLead }));
      setAllLeads((prev) => prev.map((l) => (l.id === savedLead.id ? { ...l, ...savedLead } : l)));

      // ✅ Send notification if executive assignment changed
      if (newExec && newExec !== previousExec && newExec.trim() !== "") {
        try {
          const exec = presalesUsers.find(u => String(u.id) === String(newExec));
          const execName = exec?.name || savedLead.assigned_executive_name || "Executive";
          
          await notificationAPI.createNotification({
            leadId: String(updatedLead.id), // ✅ Convert to string
            userId: String(newExec),        // ✅ Convert to string
            message: `Lead updated and assigned to ${execName}`,
            type: "lead_update",
            link: `/dashboard/leads/${updatedLead.id}`,
          });
          
          console.log("✅ Lead update notification sent to executive:", execName);
        } catch (notifErr) {
          console.error("Failed to send lead update notification:", notifErr);
          console.error("Update notification error details:", notifErr?.response?.data || notifErr?.message);
          // Don't fail the update for notification error
        }
      }

      setIsEditModalOpen(false);
      toast.success("Lead details updated successfully!");
    } catch (error) {
      console.error("❌ Error saving lead:", error);
      toast.error("Failed to save lead. Please try again.");
    }
  };

  // ✅ Enhanced Save handler for followups with notification support
  const handleFollowupSave = async (data: FollowupForm & { lead_id?: string }) => {
    if (!lead?.id) {
      toast.error("Lead not loaded.");
      return;
    }

    try {
      const scheduledISO = data.scheduleDate
        ? `${data.scheduleDate}T${(data.scheduleTime || "00:00")}:00`
        : null;

      const followupPayload = {
        leadId: data.lead_id ?? lead.id,
        type: data.followupType,
        stage: data.leadStage,
        status: data.leadStatus,
        remark: data.remark,
        customRemark: data.customRemark,
        nextAction: data.nextAction,
        scheduledDate: scheduledISO,
        priority: data.priority
      };

      let response;

      if (editingFollowup) {
        response = await followupAPI.updateFollowup(editingFollowup.id, {
          ...followupPayload,
          updated_by: user?.id,
        });
        toast.success("Follow-up updated successfully!");
        setEditingFollowup(null);
      } else {
        response = await followupAPI.createFollowup({
          ...followupPayload,
          updated_by: user?.id,
        });
        toast.success("Follow-up saved successfully!");
      }

      console.log("✅ Followup API Response:", response);

      // update lead
      await leadsAPI.updateLead(lead.id, {
        stage: data.leadStage,
        status: data.leadStatus,
        priority: data.priority,
        updated_by: user?.id,
      });

      // ✅ Send notification to assigned executive about followup
      if (lead.assigned_executive && lead.assigned_executive.trim() !== "") {
        try {
          const exec = presalesUsers.find(u => String(u.id) === String(lead.assigned_executive));
          const execName = exec?.name || lead.assigned_executive_name || "Executive";
          
          await notificationAPI.createNotification({
            leadId: String(lead.id), // ✅ Convert to string
            userId: String(lead.assigned_executive), // ✅ Convert to string
            message: `New follow-up added for lead "${lead.name}" by ${user?.name || 'User'}`,
            type: "followup_add",
            link: `/dashboard/leads/${lead.id}`,
          });
          
          console.log("✅ Followup notification sent to executive:", execName);
        } catch (notifErr) {
          console.error("Failed to send followup notification:", notifErr);
          console.error("Followup notification error details:", notifErr?.response?.data || notifErr?.message);
          // Don't fail the followup for notification error
        }
      }

      // Local sync
      setLead((prev) =>
        prev
          ? { ...prev, stage: data.leadStage || prev.stage, status: data.leadStatus || prev.status, priority: data.priority }
          : prev
      );

      setIsFollowupModalOpen(false);

      // Refresh followups
      try {
        await fetchFollowups();
      } catch (fetchErr) {
        console.error("⚠️ Failed to refresh followups:", fetchErr);
      }
    } catch (err) {
      console.error("❌ Failed to save followup:", err);
      toast.error("Failed to save follow-up. Please try again.");
    }
  };

  const formatDateShort = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${date} • ${time}`;
  };

  const typeIcon = (t: string) => {
    const found = FOLLOWUP_TYPES.find((ft) => ft.value === t);
    return found ? found.Icon : MessageSquare;
  };

  const typePillClass = (t: string) => {
    const foundColor = FOLLOWUP_TYPES.find((ft) => ft.value === t)?.color || "gray";
    const map: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return map[foundColor] || map.gray;
  };

  const followupCardClasses = (t: string) => {
    const color = FOLLOWUP_TYPES.find((ft) => ft.value === t)?.color || "gray";
    const map: Record<string, { container: string; icon: string; leftBar: string; badge: string }> = {
      blue: { container: "bg-blue-50 border-blue-200 hover:bg-blue-50", icon: "text-blue-600", leftBar: "border-blue-400", badge: "bg-blue-100 text-blue-800 border-blue-200" },
      green: { container: "bg-green-50 border-green-200 hover:bg-green-50", icon: "text-green-600", leftBar: "border-green-400", badge: "bg-green-100 text-green-800 border-green-200" },
      indigo: { container: "bg-indigo-50 border-indigo-200 hover:bg-indigo-50", icon: "text-indigo-600", leftBar: "border-indigo-400", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      orange: { container: "bg-orange-50 border-orange-200 hover:bg-orange-50", icon: "text-orange-600", leftBar: "border-orange-400", badge: "bg-orange-100 text-orange-800 border-orange-200" },
      purple: { container: "bg-purple-50 border-purple-200 hover:bg-purple-50", icon: "text-purple-600", leftBar: "border-purple-400", badge: "bg-purple-100 text-purple-800 border-purple-200" },
      gray: { container: "bg-gray-50 border-gray-200 hover:bg-gray-50", icon: "text-gray-600", leftBar: "border-gray-400", badge: "bg-gray-100 text-gray-800 border-gray-200" },
    };
    return map[color] || map.gray;
  };

  /* ===================== Render ===================== */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        No lead data found
      </div>
    );
  }

  const { date: createdDate, time: createdTime } = formatDateTime(lead.created_at || null);
  const { date: updatedDate, time: updatedTime } = formatDateTime(lead.updated_at || null);
  const { date: lastContactDate, time: lastContactTime } = formatDateTime(lead.last_contact || "");

  const tabId = "lead";
  const leadId = id || "";

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Lead Profile Card */}
        <div className="xl:col-span-2 bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100 overflow-visible p-2">
          <div className="mb-4 flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <button onClick={handleBack} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-fit text-xs">
              <FiArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Leads</span>
            </button>

            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
              <button onClick={handleEdit} className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-white">
                <FiEdit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              {canDeleteLead(user) && (
                <button onClick={handleDelete} className="flex items-center gap-1 px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors bg-white">
                  <FiTrash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              <button onClick={handlePreviousLead} disabled={currentLeadIndex <= 0} className={`flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md transition-colors bg-white ${currentLeadIndex <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}>
                <ArrowLeftToLine className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button onClick={handleNextLead} disabled={currentLeadIndex >= allLeads.length - 1} className={`flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md transition-colors bg-white ${currentLeadIndex >= allLeads.length - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}>
                <span className="hidden sm:inline">Next</span>
                <ArrowRightToLine className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Header Info */}
          <div className={`bg-gradient-to-r ${getLeadHeaderGradient()} px-3 py-3 sm:px-4 sm:py-4 text-white rounded-lg`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="bg-white bg-opacity-20 p-2 rounded-full shadow-md">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold truncate">
                    {lead.salutation} {lead.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs sm:text-sm text-white text-opacity-80 truncate">Lead ID: {lead.id.slice(0, 4)}</span>

                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border w-fit ${getLeadTypeColor(lead.lead_type || "")}`}>
                      {lead.lead_type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                {/* Follow Up Button */}
                <button onClick={() => { setEditingFollowup(null); setIsFollowupModalOpen(true); }} className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2.5 py-1.5 rounded-md shadow text-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Follow Up</span>
                </button>

                {/* Assign Executive dropdown */}
                <div className="relative">
                  <button onClick={() => setShowExecDropdown(!showExecDropdown)} className="flex items-center justify-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2.5 py-1.5 rounded-md shadow text-xs" title="Assign Lead">
                    <UserPlus className="w-3.5 h-3.5" />
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>

                  {showExecDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10 text-xs">
                      <div className="p-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide px-2 py-1 border-b truncate">
                          Assign to Executive
                        </div>

                        {(() => {
                          // Use getAssignableExecutives instead of presalesUsers directly
                          const assignableExecs = getAssignableExecutives(user, presalesUsers);

                          if (assignableExecs.length === 0) {
                            return (
                              <div className="px-2 py-2 text-xs text-gray-500">
                                <div>No executives available</div>
                              </div>
                            );
                          }

                          return assignableExecs.map((exec: any) => (
                            <button
                              key={exec.id}
                              onClick={() => handleExecAssign(String(exec.id), exec.name)} // ✅ Ensure string conversion
                              className={`w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-xs truncate ${lead.assigned_executive === String(exec.id)
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-800"
                                }`}
                            >
                              {exec.name}
                              {exec.selfOnly && (
                                <span className="text-[10px] text-gray-400 ml-1">(Self)</span>
                              )}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Communication Buttons */}
                <div className="flex gap-2">
                  <button onClick={handleCall} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition shadow" title="Call"><Phone className="w-4 h-4" /></button>
                  <button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition shadow" title="WhatsApp"><FaWhatsapp className="w-4 h-4" /></button>
                  <button onClick={handleEmail} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition shadow" title="Email"><Mail className="w-4 h-4" /></button>
                  <button onClick={handleScheduleMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md transition shadow" title="Schedule Meeting"><Calendar className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 sm:p-6 pt-0 sm:pt-2">
            {/* Contact & Location Details */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Contact Details */}
              <div className="w-full md:w-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Details</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-4 w-full md:w-fit">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="font-medium text-gray-800 text-sm break-all">{lead.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="font-medium text-gray-800 text-sm break-all">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaWhatsapp className="w-4 h-4" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">WhatsApp</p>
                      <p className="font-medium text-gray-800 text-sm break-all">{lead.whatsapp_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="w-full md:w-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Location Details</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-4 w-full md:w-fit">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">State</p>
                      <p className="font-medium text-gray-800 text-sm">{lead.state || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
                      <p className="font-medium text-gray-800 text-sm">{lead.city || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                      <p className="font-medium text-gray-800 text-sm">{lead.location || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Classification */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Lead Classification</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Source:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">{lead.lead_source}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Priority:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(lead.priority || "")}`}>{lead.priority || "-"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Stage:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageColor(lead.stage || "")}`}>{lead.stage || "-"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>{lead.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
                  {/* Created On */}
                  <div className="flex items-start space-x-1 p-1 bg-gray-50 rounded-md">
                    <Clock className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex space-x-2">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Created</p>
                        <p className="text-[11px] text-gray-700">{createdDate}</p>
                        <p className="text-[11px] text-gray-700">{createdTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Updated</p>
                        <p className="text-[11px] text-gray-700">{updatedDate}</p>
                        <p className="text-[11px] text-gray-700">{updatedTime}</p>
                      </div>
                    </div>
                  </div>

                  {/* created_by_name */}
                  <div className="p-1 bg-gray-50 rounded-md">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Created By</p>
                    <p className="text-[11px] text-gray-700">{lead.created_by_name || "System"}</p>

                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Updated By</p>
                    <p className="text-[11px] text-gray-700">{lead.updated_by_name || "System"}</p>
                  </div>

                  {/* Last Contact */}
                  <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Last Contact</p>
                      <p className="text-xs font-medium text-gray-800">{lastContactDate} {lastContactTime}</p>
                      <div className="text-xs text-gray-500 mt-1">By: {lead.last_contacted_by_name || lead.last_contacted_by || lead.updated_by_name || lead.created_by_name || "-"}</div>
                    </div>
                  </div>

                  {/* Assigned To */}
                  <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <Users className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-green-600 uppercase tracking-wide">Assigned Executive</p>
                      <p className="font-medium text-gray-800 text-xs">{getAssignedExecName()}</p>
                    </div>
                  </div>

                  {/* Transfer Options */}
                  <div className="relative inline-block" ref={dropdownRef}>
                    {shouldShowTransfer(lead, latestFollowup) && (
                      <button onClick={() => setShowTransferOptions(!showTransferOptions)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700">
                        <HiArrowsRightLeft className="w-4 h-4" />
                        Transfer Lead
                      </button>
                    )}

                    {showTransferOptions && (
                      <div className="absolute top-0 left-full ml-2 w-40 rounded z-[9999]">
                        <button className="px-2 py-1 text-white text-xs rounded bg-green-500 hover:bg-green-600" onClick={handleTransferToBuyer}>Transfer to Buyer</button>
                        <button className="px-2 py-1 text-white text-xs rounded bg-red-500 hover:bg-red-600" onClick={handleTransferToSeller}>Transfer to Seller</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar – Follow-ups */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Follow-ups TimeLine</h3>
            <div className="flex gap-2"></div>
          </div>

          {followupsLoading && (<div className="text-xs text-gray-500">Loading follow-ups…</div>)}

          {!followupsLoading && !id && (<div className="text-xs text-gray-500">No follow-up data — invalid lead.</div>)}

          {!followupsLoading && id && followupsError && (<div className="text-xs text-red-600">{followupsError}</div>)}

          {!followupsLoading && id && !followupsError && followups.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-500 py-8 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium">No follow-ups yet</p>
            </div>
          )}

          {!followupsLoading && !followupsError && followups.length > 0 && (
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
              {followups.map((f) => {
                const Ico = typeIcon(f.type);
                const scheduledLabel = formatDateShort(f.scheduledDate || f.createdAt || "");
                const color = followupCardClasses(f.type);

                return (
                  <div key={f.id} className={`border rounded-lg p-3 transition ${color.container} border-l-4 ${color.leftBar}`}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0"><Ico className={`h-5 w-5 ${color.icon}`} /></div>

                      <div className="flex-1 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${color.badge}`}>{f.type}</span>

                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditFollowups(f)} className="p-1 rounded hover:bg-gray-200 transition" title="Edit"><Pencil className="h-3.5 w-3.5 text-gray-600" /></button>

                            {currentUserRole === "admin" && (
                              <button onClick={() => handleDeleteFollowups(f.id)} className="p-1 rounded hover:bg-red-100 transition" title="Delete"><Trash2 className="h-3.5 w-3.5 text-red-600" /></button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-600">Lead Priority:</span>
                          {(f.priority || lead.priority) && (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPriorityColor(f.priority || lead.priority)}`}>{f.priority || lead.priority}</span>
                          )}

                          <span className="font-medium text-gray-600">Lead Stage:</span>
                          {f.stage && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/70 text-gray-800 border border-gray-200">{f.stage}</span>}

                          <span className="font-medium text-gray-600">Lead Status:</span>
                          {f.status && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/70 text-gray-800 border border-gray-200">{f.status}</span>}
                        </div>

                        <div className="text-gray-700"><span className="font-medium">Remark:</span> {f.customRemark || f.remark || "—"}</div>
                        {f.nextAction && <div className="text-gray-700"><span className="font-medium">Next Action:</span> {f.nextAction}</div>}

                        <div className="mt-2 flex justify-end text-gray-500">
                          <div className="flex items-center gap-2">
                            <div>{scheduledLabel}</div>
                            <div className="flex items-center gap-1"><User className="h-3 w-3 text-gray-400" />{`${f.createdByFirstName || ""} ${f.createdByLastName || ""}`.trim() || "System"}</div>
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

      {/* Follow-up Modal */}
      <FollowupModal
        isOpen={isFollowupModalOpen}
        onClose={() => { setIsFollowupModalOpen(false); setEditingFollowup(null); }}
        onSave={handleFollowupSave}
        tabId={tabId}
        leadId={leadId}
        initialForm={
          editingFollowup
            ? {
              id: editingFollowup.id,
              followupType: editingFollowup.type,
              leadStage: editingFollowup.stage || "",
              leadStatus: editingFollowup.status || "",
              remark: editingFollowup.remark || "",
              customRemark: editingFollowup.customRemark || "",
              nextAction: editingFollowup.nextAction || "",
              scheduleDate: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toISOString().slice(0, 10) : "",
              scheduleTime: editingFollowup.scheduledDate ? new Date(editingFollowup.scheduledDate).toTimeString().slice(0, 5) : "",
              priority: editingFollowup.priority || lead.priority || "Medium",
              lead_id: leadId,
            }
            : { priority: lead.priority || "Medium" }
        }
      />

      {showBuyerComponent && lead && (
        <BuyerFormModal lead={lead} followups={followups} onClose={() => setShowBuyerComponent(false)} />
      )}

      {showSellerComponent && lead && (
        <SellerFormModal lead={lead} followups={followups} onClose={() => setShowSellerComponent(false)} />
      )}

      <AddLeadModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveLead} lead={lead || undefined} />
    </div>
  );
};

export default LeadDetailPage;