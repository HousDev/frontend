

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Edit,
  Share,
  Eye,
  User as UserIcon,
  MapPin,
  Calendar as CalendarIcon,
  Star,
  Building,
  Activity,
  FileText,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  Send,
  Shield,
  Award,
  Camera,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Tag,
  User,
  Layers,
  Play,
  Flag,
  Heart,
  Home,
  DollarSign,
  PhoneCall,
  MessageSquare,
  Mail as MailIcon,
  MoreVertical,
  Link2,
  Search,
  X,
  UserCheck,
  Building2,
  CalendarClock,
  CalendarCheck,
  MessageSquareText,
  MessageSquareQuote,
  MailCheck,
  PencilLine,
  Sparkles,
  Zap,
} from "lucide-react";

import SellerStageUpdateModal from "./SellerStageUpdateModal";
import SellerSharingModal from "./SellerSharingModal";
import ActivityModal from "../buyers/ActivityModal";
import VisitModal from "../buyers/VisitModal";
import PropertyFormModal from "@/pages/dashboard/components/PropertyFormModal";
import LinkPropertyModal from "./LinkPropertyModal";
import { FollowUpModal } from "@/pages/settings/master/FollowUpModal";
import { followupAPI } from "@/lib/followupAPI";
import { sellerAPI } from "@/lib/sellersAPI";
import { useProperties } from "@/hooks/properties";
import { propertiesAPI } from "@/lib/propertiesAPI";
import { getImageUrl } from "@/lib/helpers";
import { usersAPI } from "@/lib/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Modern Color Scheme
const N = "#0f2b3d"; // Navy - used sparingly for headers
const O = "#e67e22"; // Orange - used for primary accents only
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";
const SUCCESS = "#10b981";
const WARNING = "#f59e0b";
const DANGER = "#ef4444";
const INFO = "#3b82f6";
const WHITE = "#ffffff";
const DARK = "#1e293b";

// ---- Permission helpers ----
import { useAuth } from "@/contexts/AuthContext";
import { can } from "@/utils/permission";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export type AnyObj = Record<string, any>;
export type SellerFollowupPayload = Record<string, any>;

export type Followup = {
  id: string | number;
  seller_id?: string | number;
  followup_date?: string;
  followup_time?: string;
  followup_type?: string;
  status?: string | null;
  priority?: string | null;
  assigned_to?: string | number | null;
  reminder?: number | 0 | 1;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | number | null;
  updated_by?: string | number | null;
  next_action?: string | null;
  outcome?: string | null;
  transferred_from_lead?: boolean | 0 | 1 | "0" | "1";
  category?: "sales" | "presales";
  description?: string | null;
  date?: string | null;
  time?: string | null;
  assignedTo?: string | null;
  type?: string | null;
  remark?: string | null;
  reminderBool?: boolean | null;
  raw?: any;
  transferredFromLead?: boolean | 0 | 1 | "0" | "1";
  buyerLeadStage?: string | null;
  buyerLeadStatus?: string | null;
  customRemark?: string | null;
  followupType?: string | null;
  nextAction?: string | null;
  scheduleDate?: string | null;
  scheduleTime?: string | null;
  transferredAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdByName?: string | null;
  updatedByName?: string | null;
  assignedExecutiveName?: string | null;
  assigned_to_name?: string | null;
  assignedToName?: string | null;
  assigned_by?: string | number | null;
  assignedBy?: string | number | null;
  assigned_by_name?: string | null;
  assignedByName?: string | null;
  transferredByName?: string | null;
  transferred_by_name?: string | null;
  sellerId?: string | number | null;
  assignedExecutive?: string | number | null;
  completedDate?: string | null;
  outcome_name?: string | null;
  outcome_id?: number | string | null;
  outcomeId?: number | string | null;
  custom_remark?: string | null;
  [key: string]: any;
};

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */
const safeString = (v: any) => (v === undefined || v === null ? "" : String(v));
const toSlug = (s?: string | null) =>
  safeString(s).toLowerCase().replace(/\s+/g, "").trim();

function parseSqlish(val?: string | null): Date | null {
  if (!val) return null;
  const s = val.trim();
  if (/\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const [datePart, timePart] = s.split(/\s+/);
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ssRaw] = timePart.split(":").map(Number);
    const ss = Number.isFinite(ssRaw) ? ssRaw : 0;
    return new Date(y, m - 1, d, hh, mm, ss);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0);
  }
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const [hh, mm, ssRaw] = s.split(":").map(Number);
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hh,
      mm,
      Number.isFinite(ssRaw) ? ssRaw : 0,
    );
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function to12h(hh: number, mm: number) {
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 || 12;
  const mmStr = String(mm).padStart(2, "0");
  return `${h12}:${mmStr} ${period}`;
}

function fmtDateDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtDateTimeHuman(val?: string | null): string | null {
  const d = parseSqlish(val);
  if (!d) return null;
  const hasTime =
    /T\d{2}:\d{2}/.test(val || "") ||
    /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(val || "") ||
    (d.getHours() !== 0 || d.getMinutes() !== 0);
  const dateStr = fmtDateDDMMYYYY(d);
  if (!hasTime) return dateStr;
  return `${dateStr} at ${to12h(d.getHours(), d.getMinutes())}`;
}

function fmtTime12h(t?: string | null): string {
  if (!t) return "—";
  const m = t.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return t;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return t;
  return to12h(hh, mm);
}

const getStatusConfig = () => ({
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Pending",
    icon: "⏳",
  },
  scheduled: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Scheduled",
    icon: "📅",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Completed",
    icon: "✅",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Cancelled",
    icon: "❌",
  },
  inprogress: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    label: "In Progress",
    icon: "🔄",
  },
  onhold: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "On Hold",
    icon: "⏸️",
  },
  followup: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Follow Up",
    icon: "📞",
  },
  interested: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Interested",
    icon: "👍",
  },
  notinterested: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Not Interested",
    icon: "👎",
  },
  contacted: {
    bg: "bg-teal-100",
    text: "text-teal-700",
    label: "Contacted",
    icon: "📧",
  },
  meeting: {
    bg: "bg-pink-100",
    text: "text-pink-700",
    label: "Meeting",
    icon: "🤝",
  },
  proposal: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Proposal",
    icon: "📋",
  },
  negotiation: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    label: "Negotiation",
    icon: "💼",
  },
  closed: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    label: "Closed",
    icon: "🔐",
  },
  done: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Done",
    icon: "✅",
  },
  planned: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Planned",
    icon: "📅",
  },
  missed: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    label: "Missed",
    icon: "⚠️",
  },
});

const getPriorityConfig = () => ({
  urgent: {
    border: "border-l-red-600",
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100",
  },
  high: {
    border: "border-l-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100",
  },
  medium: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "bg-yellow-100",
  },
  normal: {
    border: "border-l-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-100",
  },
  low: {
    border: "border-l-green-500",
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-green-100",
  },
  minimal: {
    border: "border-l-gray-400",
    bg: "bg-gray-50",
    text: "text-gray-700",
    badge: "bg-gray-100",
  },
});

const getFieldConfig = () => ({
  buyerLeadStage: {
    label: "Seller Stage",
    icon: Layers,
    color: "bg-indigo-100 text-indigo-700",
    priority: 1,
  },
  buyerLeadStatus: {
    label: "Seller Status",
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-700",
    priority: 2,
  },
  followupType: {
    label: "Follow-up Type",
    icon: Tag,
    color: "bg-purple-100 text-purple-700",
    priority: 3,
  },
  customRemark: {
    label: "Remarks",
    icon: AlertCircle,
    color: "bg-pink-100 text-pink-700",
    priority: 5,
  },
  nextAction: {
    label: "Next Action",
    icon: Play,
    color: "bg-yellow-100 text-yellow-700",
    priority: 4,
  },
  scheduleDate: {
    label: "Scheduled",
    icon: CalendarIcon,
    color: "bg-green-100 text-green-700",
    priority: 6,
  },
  transferredAt: {
    label: "Transferred",
    icon: CheckCircle2,
    color: "bg-orange-100 text-orange-700",
    priority: 7,
  },
  assignedTo: {
    label: "Assigned Executive",
    icon: UserIcon,
    color: "bg-teal-100 text-teal-700",
    priority: 8,
  },
  type: {
    label: "Type",
    icon: Clock,
    color: "bg-gray-100 text-gray-700",
    priority: 9,
  },
  priority: {
    label: "Priority",
    icon: Flag,
    color: "bg-gray-100 text-gray-700",
    priority: 11,
  },
  createdAt: {
    label: "Created",
    icon: CalendarIcon,
    color: "bg-gray-50 text-gray-700",
    priority: 90,
  },
  updatedAt: {
    label: "Updated",
    icon: CalendarIcon,
    color: "bg-gray-50 text-gray-700",
    priority: 91,
  },
  createdBy: {
    label: "Created By",
    icon: UserIcon,
    color: "bg-gray-50 text-gray-700",
    priority: 92,
  },
  updatedBy: {
    label: "Updated By",
    icon: UserIcon,
    color: "bg-gray-50 text-gray-700",
    priority: 93,
  },
});

const typeIcon = (t?: string | null) => {
  const norm = (t || '').toLowerCase();
  if (norm.includes('call') || norm.includes('phone')) {
    return <PhoneCall size={12} className="text-blue-600" />;
  }
  if (norm.includes('whatsapp')) {
    return <MessageSquareText size={12} className="text-emerald-600" />;
  }
  if (norm.includes('email') || norm.includes('mail')) {
    return <MailCheck size={12} className="text-sky-600" />;
  }
  if (norm.includes('visit') || norm.includes('meeting')) {
    return <CalendarCheck size={12} className="text-purple-600" />;
  }
  return <Sparkles size={12} className="text-amber-500" />;
};

const statusBadge = (s?: string | null) => {
  const cfg = getStatusConfig();
  const slug = toSlug(s);
  const meta = (cfg as any)[slug] || (cfg as any)["planned"];
  const label = meta?.label || (s ?? "—");
  const classes = meta
    ? `${meta.bg} ${meta.text}`
    : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center gap-1 ${classes}`}
    >
      <span>{meta?.icon ?? "•"}</span>
      {label}
    </span>
  );
};

const priorityBadge = (p?: string | null) => {
  const cfg = getPriorityConfig();
  const slug = toSlug(p);
  const meta =
    (cfg as any)[slug] ||
    (slug === "high" && (cfg as any).high_legacy) ||
    (slug === "medium" && (cfg as any).medium_legacy) ||
    (slug === "low" && (cfg as any).low_legacy);
  const text = p ?? "—";
  const classes = meta
    ? `${meta.badge} ${meta.text}`
    : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${classes}`}
    >
      {text}
    </span>
  );
};

const truthyFlag = (v: any) =>
  v === true || v === 1 || v === "1" || v === "true" || v === "yes";
const pickDisplay = (name?: any, idMaybe?: any, fallback?: any) => {
  const n = name ?? null;
  if (n !== null && n !== undefined && String(n).trim() !== "")
    return String(n);
  const id = idMaybe ?? fallback;
  return id != null ? String(id) : null;
};

const normalize = (f: Followup) => {
  const isPreSales =
    truthyFlag((f as any).transferred_from_lead) ||
    truthyFlag(f.transferredFromLead);
  const type = f.followupType || f.followup_type || f.type || null;
  const stage = (f as any).seller_lead_stage || (f as any).sellerLeadStage || f.buyerLeadStage || (f as any).stage || null;
  const status = (f as any).seller_lead_status || (f as any).sellerLeadStatus || f.buyerLeadStatus || (f as any).status || null;
  const scheduleDate =
    f.scheduleDate ??
    (f as any).schedule_date ??
    f.followup_date ??
    f.date ??
    null;
  const scheduleTime =
    f.scheduleTime ??
    (f as any).schedule_time ??
    f.followup_time ??
    f.time ??
    null;
  const createdByDisplay = pickDisplay(
    f.createdByName,
    (f as any).created_by,
    f.createdBy,
  );
  const updatedByDisplay = pickDisplay(
    f.updatedByName,
    (f as any).updated_by,
    f.updatedBy,
  );
  const assignedToDisplay = pickDisplay(
    (f as any).assignedExecutiveName ?? f.assignedExecutiveName,
    (f as any).assigned_to,
    f.assignedExecutive ?? f.assignedTo,
  );
  const rawRemark = f.remark || (f as any).outcome || (f as any).outcome_name || (f as any).outcomeName || null;
  const rawNotes = (f as any).custom_remark || f.customRemark || f.notes || null;
  return {
    ...f,
    id: String(f.id),
    category: isPreSales ? "presales" : "sales",
    buyerLeadStage: stage,
    buyerLeadStatus: status,
    seller_lead_stage: stage,
    seller_lead_status: status,
    followupType: type ?? null,
    followup_type: type ?? null,
    scheduleDate: scheduleDate ?? null,
    schedule_date: scheduleDate ?? null,
    scheduleTime: scheduleTime ?? null,
    schedule_time: scheduleTime ?? null,
    assignedTo: assignedToDisplay ?? null,
    createdBy: createdByDisplay ?? null,
    updatedBy: updatedByDisplay ?? null,
    outcome: rawRemark,
    outcome_name: rawRemark,
    outcomeName: rawRemark,
    remark: rawRemark,
    customRemark: rawNotes,
    custom_remark: rawNotes,
    createdAt: f.createdAt ?? (f as any).created_at ?? null,
    updatedAt: f.updatedAt ?? (f as any).updated_at ?? null,
    nextAction: f.nextAction ?? (f as any).next_action ?? null,
    next_action: f.nextAction ?? (f as any).next_action ?? null,
    transferredAt: f.transferredAt ?? null,
  } as Followup;
};

const toDateTime = (dateStr?: string | null, timeStr?: string | null) => {
  if (!dateStr && !timeStr) return null;
  const dStr = (dateStr ?? "").trim();
  if (dStr && /\d{4}-\d{2}-\d{2}T/.test(dStr)) return parseSqlish(dStr);
  const tRaw = (timeStr ?? "").trim();
  const t = tRaw ? (tRaw.length === 5 ? `${tRaw}:00` : tRaw) : "00:00:00";
  const dtStr = dStr ? `${dStr} ${t}` : t;
  return parseSqlish(dtStr);
};

const followupTimestamp = (f: Followup): number => {
  const dt1 = toDateTime(
    (f as any).followup_date || f.date || null,
    (f as any).followup_time || f.time || null,
  );
  if (dt1) return dt1.getTime();
  const dt2 = toDateTime(
    (f as any).schedule_date || f.scheduleDate || null,
    (f as any).schedule_time || f.scheduleTime || null,
  );
  if (dt2) return dt2.getTime();
  const upd = parseSqlish(f.updatedAt || (f as any).updated_at || null);
  if (upd) return upd.getTime();
  const cre = parseSqlish(f.createdAt || (f as any).created_at || null);
  if (cre) return cre.getTime();
  return 0;
};

const FieldChips: React.FC<{ f: Followup }> = ({ f }) => {
  const cfg = getFieldConfig();
  type Key = keyof ReturnType<typeof getFieldConfig>;
  const keys: Key[] = Object.keys(cfg) as Key[];
  const sorted = keys.sort((a, b) => cfg[a].priority - cfg[b].priority);
  const chips = sorted
    .map((k) => {
      let value: any = (f as any)[k];
      if (k === "scheduleDate" && value) {
        const d = parseSqlish(value);
        value = d ? fmtDateDDMMYYYY(d) : value;
      }
      if (
        (k === "createdAt" || k === "updatedAt" || k === "transferredAt") &&
        value
      )
        value = fmtDateTimeHuman(value);
      if (!value || String(value).trim() === "") return null;
      const Icon = cfg[k].icon;
      return (
        <span
          key={k}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${cfg[k].color}`}
          title={cfg[k].label}
        >
          <Icon size={10} />
          <span>{cfg[k].label}:</span>
          <span className="font-semibold">{String(value).slice(0, 30)}</span>
        </span>
      );
    })
    .filter(Boolean);
  if (chips.length === 0) return null;
  return <div className="mt-2 flex flex-wrap gap-1">{chips}</div>;
};

/* ------------------------------------------------------------------ */
/* SellerFollowupsTab Component */
/* ------------------------------------------------------------------ */
interface SellerFollowupsTabProps {
  followups: Followup[];
  seller?: AnyObj;
  onAddFollowup: () => void;
  onEditFollowup: (f: Followup) => void;
  onDeleteFollowup: (f: Followup) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const SellerFollowupsTab: React.FC<SellerFollowupsTabProps> = ({
  followups,
  seller,
  onAddFollowup,
  onEditFollowup,
  onDeleteFollowup,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"sales" | "presales">(
    "sales",
  );
  const normalizedFollowups = React.useMemo(
    () => (followups || []).map(normalize),
    [followups],
  );
  const sortedFollowups = React.useMemo(
    () =>
      [...normalizedFollowups].sort(
        (a, b) => followupTimestamp(b) - followupTimestamp(a),
      ),
    [normalizedFollowups],
  );
  const salesCount = sortedFollowups.filter(
    (f) => f.category === "sales",
  ).length;
  const presalesCount = sortedFollowups.filter(
    (f) => f.category === "presales",
  ).length;
  const filteredFollowups = sortedFollowups.filter(
    (f) => f.category === activeTab,
  );
  const cardBorder = (p?: string | null) => {
    const cfg = getPriorityConfig();
    const slug = toSlug(p);
    const meta =
      (cfg as any)[slug] ||
      (slug === "high" && (cfg as any).high_legacy) ||
      (slug === "medium" && (cfg as any).medium_legacy) ||
      (slug === "low" && (cfg as any).low_legacy) ||
      null;
    return meta ? `${meta.border} ${meta.bg}` : "border-l-gray-400 bg-gray-50";
  };

  const currentAccountProfileName =
    (user as any)?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") ||
    (user as any)?.username ||
    "Executive";

  const [crmUsers, setCrmUsers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      try {
        let list: any[] = [];
        try {
          const res = await usersAPI.getAllUsers();
          const raw = res?.data ?? res?.items ?? res ?? [];
          if (Array.isArray(raw) && raw.length > 0) {
            list = raw;
          }
        } catch (e) { }

        if (list.length === 0 && usersAPI.getSalesExecutives) {
          try {
            const resExec = await usersAPI.getSalesExecutives();
            const rawExec = resExec?.data ?? resExec?.items ?? resExec ?? [];
            if (Array.isArray(rawExec) && rawExec.length > 0) {
              list = rawExec;
            }
          } catch (e) { }
        }

        if (mounted && list.length > 0) {
          setCrmUsers(list);
        }
      } catch (err) { }
    };
    loadUsers();
    return () => { mounted = false; };
  }, []);

  const resolveAdminOrAssignerFullName = useCallback((fAny: any, sellerObj: any): string => {
    // 1. Explicit assigned_by on parent seller
    if (sellerObj?.assigned_by_name && sellerObj.assigned_by_name.toLowerCase() !== 'admin') {
      return sellerObj.assigned_by_name;
    }
    if (sellerObj?.assigned_by) {
      const match = crmUsers.find((u) => String(u.id) === String(sellerObj.assigned_by));
      if (match) {
        const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
        if (full) return full;
      }
      if (isNaN(Number(sellerObj.assigned_by))) return String(sellerObj.assigned_by);
    }

    // 2. Creator of the seller (Admin who created/assigned profile)
    if (sellerObj?.created_by_user?.name && sellerObj.created_by_user.name.toLowerCase() !== 'admin') {
      return sellerObj.created_by_user.name;
    }
    if (sellerObj?.created_user_first_name || sellerObj?.created_user_last_name) {
      const fullName = `${sellerObj.created_user_salutation ? sellerObj.created_user_salutation + ' ' : ''}${sellerObj.created_user_first_name || ''} ${sellerObj.created_user_last_name || ''}`.trim();
      if (fullName && fullName.toLowerCase() !== 'admin') return fullName;
    }
    if (sellerObj?.created_by_name && sellerObj.created_by_name.toLowerCase() !== 'admin') {
      return sellerObj.created_by_name;
    }
    if (sellerObj?.created_by) {
      const match = crmUsers.find((u) => String(u.id) === String(sellerObj.created_by));
      if (match) {
        const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
        if (full) return full;
      }
    }

    // 3. Explicit assigned_by / entity_creator on followup row
    const rawVal =
      fAny?.assigned_by_name ||
      fAny?.assignedByName ||
      fAny?.raw?.assigned_by_name ||
      fAny?.raw?.assignedByName ||
      fAny?.raw?.entity_creator_name ||
      fAny?.entity_creator_name ||
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
      if (isNaN(Number(strVal))) return strVal;
    }

    // 4. Current logged-in user if Admin/Manager
    if (user) {
      const role = String(user.role || '').toLowerCase();
      if (role.includes('admin') || role.includes('super') || role.includes('manager')) {
        const loggedName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || (user as any)?.name || user.username;
        if (loggedName) return loggedName;
      }
    }

    // 5. Any Admin or Manager in crmUsers
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

  const resolveAssignedToName = useCallback((fAny: any, sellerObj: any): string => {
    // 1. Direct explicit assigned executive name from followup row
    const directFollowupName =
      fAny?.raw?.assigned_to_name ||
      fAny?.raw?.assignedToName ||
      fAny?.raw?.assigned_executive_name ||
      fAny?.assigned_to_name ||
      fAny?.assigned_executive_name;

    if (directFollowupName && directFollowupName !== "Unassigned" && directFollowupName !== "You" && directFollowupName !== "Not assigned" && isNaN(Number(directFollowupName))) {
      return directFollowupName;
    }

    // 2. Lookup explicit assigned_to ID from followup DB row
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

    // 3. Seller's currently assigned executive name
    const sName =
      sellerObj?.assigned_executive_name ||
      sellerObj?.assigned_to_name ||
      sellerObj?.assigned_executive_user?.name ||
      sellerObj?.executive_name ||
      sellerObj?.assigned_user?.name ||
      (typeof sellerObj?.assigned === 'string' && isNaN(Number(sellerObj?.assigned)) ? sellerObj.assigned : null);
    if (sName && sName !== "Unassigned" && sName !== "You" && sName !== "Not assigned" && isNaN(Number(sName))) {
      return sName;
    }

    // 4. Lookup seller's assigned_to / assigned_executive ID in crmUsers
    const sExecId =
      sellerObj?.assigned_to ??
      sellerObj?.assigned_executive ??
      sellerObj?.assigned_user_id ??
      (typeof sellerObj?.assigned === 'number' || (!isNaN(Number(sellerObj?.assigned)) && sellerObj?.assigned !== null && sellerObj?.assigned !== '') ? sellerObj?.assigned : null);
    if (sExecId && sExecId !== "Unassigned" && sExecId !== "You" && sExecId !== 0 && sExecId !== "0") {
      const match = crmUsers.find((u) => String(u.id) === String(sExecId));
      if (match) {
        const full = `${match.first_name || ''} ${match.last_name || ''}`.trim() || match.name || match.username;
        if (full) return full;
      }
      if (user && String((user as any).id) === String(sExecId)) {
        const myName = `${(user as any).first_name || ''} ${(user as any).last_name || ''}`.trim() || (user as any).name;
        if (myName) return myName;
      }
      if (isNaN(Number(sExecId))) return String(sExecId);
    }

    // 5. Fallback to fAny.assignedTo if string and not "Unassigned"
    if (fAny?.assignedTo && fAny.assignedTo !== "Unassigned" && fAny.assignedTo !== "You" && isNaN(Number(fAny.assignedTo))) {
      return fAny.assignedTo;
    }

    return "Unassigned";
  }, [crmUsers, user]);

  return (
    <div className="space-y-4">
      {/* Premium follow-up toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-2.5 shadow-[0_8px_30px_rgba(15,43,61,0.06)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100/80 p-1">
            <button
              onClick={() => setActiveTab("sales")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${activeTab === "sales"
                  ? "bg-white text-[#0f2b3d] shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${activeTab === "sales" ? "bg-blue-600" : "bg-slate-300"}`} />
              Seller Follow-ups
              {salesCount > 0 && (
                <span className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[9px] ${activeTab === "sales" ? "bg-[#0f2b3d] text-white" : "bg-slate-200 text-slate-600"}`}>
                  {salesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("presales")}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${activeTab === "presales"
                  ? "bg-white text-[#0f2b3d] shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${activeTab === "presales" ? "bg-violet-500" : "bg-slate-300"}`} />
              Pre-Sales History
              {presalesCount > 0 && (
                <span className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[9px] ${activeTab === "presales" ? "bg-[#0f2b3d] text-white" : "bg-slate-200 text-slate-600"}`}>
                  {presalesCount}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              if (!canCreate) {
                toast.error("No permission to create");
                return;
              }
              onAddFollowup();
            }}
            className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11px] font-semibold transition-all ${canCreate
                ? "bg-[#0f2b3d] text-white shadow-[0_6px_18px_rgba(15,43,61,0.18)] hover:-translate-y-0.5 hover:bg-[#163b54]"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10">
              <Plus size={12} />
            </span>
            Add Follow-up
          </button>
        </div>
      </div>

      {filteredFollowups.length > 0 ? (
        /* 3 cards per row on large/XL desktop screens */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFollowups.map((f, i) => {
            const idKey = (f.id ?? `f-${i}`).toString();
            const fAny = f as any;
            const rawDate =
              fAny.scheduled_date ||
              fAny.scheduledDate ||
              f.scheduleDate ||
              fAny.schedule_date ||
              fAny.followup_date ||
              f.date;
            const parsedDate = parseSqlish(rawDate);
            const dateOnlyStr = parsedDate ? fmtDateDDMMYYYY(parsedDate) : (rawDate ? String(rawDate).split('T')[0] : null);
            const rawTimeVal =
              fAny.scheduled_time ||
              fAny.scheduledTime ||
              f.scheduleTime ||
              fAny.schedule_time ||
              fAny.followup_time ||
              f.time;
            const timeOnlyStr = rawTimeVal ? fmtTime12h(rawTimeVal) : null;
            const schedFormatted = dateOnlyStr ? `${dateOnlyStr}${timeOnlyStr ? ` at ${timeOnlyStr}` : ''}` : null;

            const rawStage = f.buyerLeadStage || (f as any).seller_lead_stage || (f as any).stage || null;
            const stageVal = rawStage ? String(rawStage).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : null;
            const rawStatus = f.buyerLeadStatus || (f as any).seller_lead_status || (f as any).status || null;
            const statusVal = rawStatus ? String(rawStatus).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : null;

            const rawCustom = f.customRemark || (f as any).custom_remark || '';
            const rawRemark = (f as any).remark || (f as any).outcome || f.notes || '';
            const outcomeVal = (rawCustom && rawCustom.trim().length > 0) ? rawCustom : (rawRemark && rawRemark.trim().length > 0 ? rawRemark : null);

            const stripSalutation = (val?: string | null): string => {
              if (!val) return "";
              return String(val)
                .replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.|shri\.|smt\.|mr|mrs|ms|dr|prof|shri|smt)\s+/i, "")
                .trim();
            };

            const rawCreatedByName =
              (fAny.created_by_name && fAny.created_by_name !== "System" && !String(fAny.created_by_name).toLowerCase().includes("system") ? fAny.created_by_name : null) ||
              (fAny.createdByName && fAny.createdByName !== "System" && !String(fAny.createdByName).toLowerCase().includes("system") ? fAny.createdByName : null) ||
              (f.createdBy && f.createdBy !== "System" && !String(f.createdBy).toLowerCase().includes("system") ? f.createdBy : null) ||
              (fAny.raw?.created_by_name && fAny.raw?.created_by_name !== "System" && !String(fAny.raw?.created_by_name).toLowerCase().includes("system") ? fAny.raw?.created_by_name : null) ||
              (fAny.raw?.created_by && isNaN(Number(fAny.raw?.created_by)) && !String(fAny.raw?.created_by).toLowerCase().includes("system") ? String(fAny.raw?.created_by) : null) ||
              (fAny.raw?.created_by ? `User #${fAny.raw?.created_by}` : null) ||
              (fAny.created_by && isNaN(Number(fAny.created_by)) && !String(fAny.created_by).toLowerCase().includes("system") ? String(fAny.created_by) : null) ||
              (fAny.created_by ? `User #${fAny.created_by}` : null) ||
              currentAccountProfileName;
            const createdByName = stripSalutation(rawCreatedByName) || rawCreatedByName;

            const rawAssignedToName = resolveAssignedToName(fAny, seller);
            const assignedToName = (rawAssignedToName && rawAssignedToName !== "Unassigned")
              ? (stripSalutation(rawAssignedToName) || rawAssignedToName)
              : "Unassigned";

            const rawAssignedByName = resolveAdminOrAssignerFullName(fAny, seller);
            const assignedByName = stripSalutation(rawAssignedByName) || rawAssignedByName;

            const followupType = f.followupType || f.followup_type || f.type || 'Phone Call';
            const priorityLabel = f.priority ? String(f.priority) : 'Normal';
            const prioritySlug = toSlug(f.priority);
            const priorityDot =
              prioritySlug === 'urgent' || prioritySlug === 'high' ? 'bg-red-500' :
                prioritySlug === 'medium' ? 'bg-amber-500' :
                  prioritySlug === 'low' ? 'bg-emerald-500' : 'bg-slate-400';

            return (
              <article
                key={idKey}
                className="group relative flex h-full min-h-[250px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_6px_24px_rgba(15,43,61,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_34px_rgba(15,43,61,0.10)]"
              >
                {/* subtle premium top accent — no colored side bars */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-80" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-7 min-w-[42px] items-center justify-center rounded-lg bg-[#0f2b3d] px-2 text-[9px] font-bold tracking-wide text-white shadow-sm">
                      FU {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-700">
                      {typeIcon(followupType)}
                      <span className="truncate">{followupType}</span>
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        if (!canUpdate) {
                          toast.error("No permission to edit");
                          return;
                        }
                        onEditFollowup(f);
                      }}
                      disabled={!canUpdate || f.category === "presales"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-[#0f2b3d] disabled:cursor-not-allowed disabled:opacity-35"
                      title={f.category === "presales" ? "Cannot edit pre-sales" : "Edit Follow-up"}
                    >
                      <PencilLine size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (!canDelete) {
                          toast.error("No permission to delete");
                          return;
                        }
                        onDeleteFollowup(f);
                      }}
                      disabled={!canDelete || f.category === "presales"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35"
                      title={f.category === "presales" ? "Cannot delete pre-sales" : "Delete Follow-up"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {stageVal && (
                    <span className="inline-flex items-center rounded-md border border-indigo-100 bg-indigo-50/80 px-2 py-1 text-[9px] font-semibold text-indigo-700">
                      Stage · {stageVal}
                    </span>
                  )}
                  {statusVal && (
                    <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50/80 px-2 py-1 text-[9px] font-semibold text-blue-700">
                      Status · {statusVal}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-semibold text-slate-600">
                    <span className={`h-1.5 w-1.5 rounded-full ${priorityDot}`} />
                    {priorityLabel}
                  </span>
                </div>

                <div className="my-3 h-px bg-slate-100" />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {f.nextAction ? (
                    <div className="min-w-0 rounded-xl border border-indigo-100 bg-indigo-50/45 p-2.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-indigo-500">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-indigo-600 shadow-2xs border border-indigo-100">
                          <Zap size={10} className="text-indigo-600 fill-indigo-600" />
                        </span>
                        Next Action
                      </div>
                      <p className="truncate text-[11px] font-bold text-slate-800" title={String(f.nextAction)}>
                        {f.nextAction}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-100">
                          <Zap size={10} className="text-slate-400" />
                        </span>
                        Next Action
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400">Not set</p>
                    </div>
                  )}

                  {schedFormatted ? (
                    <div className="min-w-0 rounded-xl border border-emerald-100 bg-emerald-50/45 p-2.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-emerald-600 shadow-2xs border border-emerald-100">
                          <CalendarClock size={11} className="text-emerald-600" />
                        </span>
                        Scheduled
                      </div>
                      <p className="truncate text-[11px] font-bold text-slate-800" title={schedFormatted}>
                        {schedFormatted}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                      <div className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-100">
                          <CalendarClock size={11} className="text-slate-400" />
                        </span>
                        Scheduled
                      </div>
                      <p className="text-[11px] font-semibold text-slate-400">Not scheduled</p>
                    </div>
                  )}
                </div>

                {outcomeVal && (
                  <div className="mt-2.5 rounded-xl border border-amber-100 bg-amber-50/45 px-2.5 py-2">
                    <div className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-amber-700">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-amber-100/80 text-amber-700">
                        <MessageSquareQuote size={10} />
                      </span>
                      Outcome / Remarks
                    </div>
                    <p className="line-clamp-2 text-[10px] font-medium leading-relaxed text-slate-700" title={outcomeVal}>
                      {outcomeVal}
                    </p>
                  </div>
                )}

                {/* Shortlisted / Attached Properties */}
                {Boolean((f as any).project || (f as any).siteLocation || (f as any).site_location || fAny.project || fAny.site_location) && (
                  <div className="mt-2.5 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-emerald-50/20 p-2.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                        <Building2 size={12} className="text-emerald-600 shrink-0" />
                        Shared / Shortlisted Properties
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const sellerName = (seller?.name || "Sir/Madam").trim();
                          const phone = seller?.phone || (fAny as any).entity_phone || (fAny as any).entityPhone || "";
                          const cleanPhone = phone.replace(/[^0-9]/g, "");
                          const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                          const fProj = (f as any).project || fAny.project || "";
                          const fLoc = (f as any).siteLocation || (f as any).site_location || fAny.site_location || "";
                          const text = `Hello ${sellerName},\n\nHere are the property details from Resale Expert:\n🏢 *Project:* ${fProj}${fLoc ? `\n📍 *Location:* ${fLoc}` : ""}\n\nPlease let us know if you need any further information.\n\nThank you!`;
                          const waUrl = finalPhone
                            ? `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`
                            : `https://wa.me/?text=${encodeURIComponent(text)}`;
                          window.open(waUrl, "_blank");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-0.5 text-[8.5px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
                        title="Share on WhatsApp"
                      >
                        <MessageSquare size={10} />
                        Share WhatsApp
                      </button>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {String((f as any).project || fAny.project || '').split(',').map((pName: string, pIdx: number) => {
                        const cleanName = pName.trim();
                        if (!cleanName) return null;
                        const locParts = String((f as any).siteLocation || (f as any).site_location || fAny.site_location || '').split(',').map((l: string) => l.trim()).filter(Boolean);
                        const assignedLoc = locParts[pIdx] || locParts[0] || '';
                        return (
                          <div
                            key={pIdx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2 py-0.5 shadow-xs"
                          >
                            <span className="flex items-center gap-1 font-semibold text-slate-800 text-[9.5px]">
                              <Building2 size={11} className="text-emerald-600 shrink-0" /> {cleanName}
                            </span>
                            {assignedLoc && (
                              <span className="flex items-center gap-0.5 text-emerald-700 font-medium text-[8.5px] bg-emerald-50 px-1 py-0.2 rounded">
                                <MapPin size={8} className="text-emerald-500" /> {assignedLoc}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-3">
                  <div className="border-t border-dashed border-slate-200 pt-2.5">
                    <div className="grid grid-cols-1 gap-1.5 text-[9px] text-slate-400">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <UserIcon size={10} className="shrink-0 text-slate-400" />
                        <span>Created by</span>
                        <strong className="truncate font-semibold text-slate-600" title={createdByName}>{createdByName}</strong>
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <UserCheck size={10} className="shrink-0 text-slate-400" />
                        <span>Assigned to</span>
                        <strong className="truncate font-semibold text-slate-600" title={assignedToName}>{assignedToName}</strong>
                      </div>
                      {assignedByName && (
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Share size={10} className="shrink-0 text-slate-400" />
                          <span>Assigned by</span>
                          <strong className="truncate font-semibold text-slate-600" title={assignedByName}>{assignedByName}</strong>
                        </div>
                      )}
                    </div>
                    {(f.createdAt || f.updatedAt) && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] text-slate-400">
                        {f.createdAt && <span>Created {fmtDateTimeHuman(f.createdAt)}</span>}
                        {f.updatedAt && f.updatedAt !== f.createdAt && <span>Updated {fmtDateTimeHuman(f.updatedAt)}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <CalendarIcon size={22} />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-slate-900">
            No {activeTab === "sales" ? "Seller" : "Pre-Sales"} follow-ups yet
          </h3>
          <p className="mb-4 text-[11px] text-slate-500">
            {activeTab === "sales" ? "Plan your first seller follow-up" : "Transferred follow-ups appear here"}
          </p>
          {activeTab === "sales" && (
            <button
              onClick={() => {
                if (!canCreate) {
                  toast.error("No permission");
                  return;
                }
                onAddFollowup();
              }}
              className="rounded-xl bg-[#0f2b3d] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-[#163b54]"
            >
              Add Follow-up
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main SellerViewPage Component */
/* ------------------------------------------------------------------ */
export interface SellerViewPageProps {
  seller?: AnyObj;
  onBack?: () => void;
  onEdit?: (seller?: AnyObj) => void;
  onAccount?: (sellerId?: string | number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalSellers?: number;
  onUpdateSeller?: (s: AnyObj) => void;
  sellerId?: string | number;
}

const SellerViewPage: React.FC<SellerViewPageProps> = ({
  seller = {},
  onBack = () => { },
  onEdit = (..._args: any[]) => { },
  onAccount = (..._args: any[]) => { },
  onNext = () => { },
  onPrevious = () => { },
  currentIndex = 0,
  totalSellers = 1,
  onUpdateSeller = () => { },
  sellerId,
}) => {
  const { user } = useAuth() as { user: any | null };
  const canUpdateSeller = can(user, "seller.update");
  const canViewFollowups = can(user, "followup.read");
  const canCreateFollowups = can(user, "followup.create");
  const canUpdateFollowups = can(user, "followup.update");
  const canDeleteFollowups = can(user, "followup.delete");

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showStageUpdateModal, setShowStageUpdateModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showLinkPropertyModal, setShowLinkPropertyModal] = useState(false);
  const [linkPropertySearch, setLinkPropertySearch] = useState("");
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);
  const [fuLoading, setFuLoading] = useState(false);
  const [fuError, setFuError] = useState<string | null>(null);
  const [localFollowups, setLocalFollowups] = useState<Followup[]>(
    ((seller as any)?.followups as Followup[]) || []
  );
  const [currentSeller, setCurrentSeller] = useState<any>(seller);
  const [selectedPropIds, setSelectedPropIds] = useState<string[]>([]);
  const { properties: availableProperties = [], loadingProps } = useProperties({ autoLog: false });
  const sellerRef = React.useRef(seller);
  useEffect(() => {
    sellerRef.current = seller;
    if (seller) setCurrentSeller((prev: any) => ({ ...prev, ...seller }));
    if (Array.isArray((seller as any)?.followups) && (seller as any).followups.length > 0) {
      setLocalFollowups((seller as any).followups);
    }
  }, [seller]);

  useEffect(() => {
    const sId = sellerId ?? (seller as any)?.id ?? (seller as any)?.sellerId;
    if (sId) {
      sellerAPI.getById(String(sId)).then((res: any) => {
        const d = res?.data ?? res?.seller ?? res;
        if (d && typeof d === 'object') {
          setCurrentSeller((prev: any) => ({ ...prev, ...d }));
        }
      }).catch(() => { });
    }
  }, [sellerId, (seller as any)?.id]);

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    {
      id: "buyers",
      label: "Buyers",
      icon: Users,
      count: (seller as any).interestedBuyers || 0,
    },
    {
      id: "activities",
      label: "Activities",
      icon: Activity,
      count: (seller as any).activities?.length || 0,
    },
    {
      id: "followups",
      label: "Follow-ups",
      icon: CalendarIcon,
      count: (localFollowups && localFollowups.length > 0) ? localFollowups.length : (((seller as any)?.followups as Followup[] | undefined)?.length ?? (seller as any)?.followups_count ?? 0),
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      count: (seller as any).documents?.length || 0,
    },
    {
      id: "visits",
      label: "Visits",
      icon: Eye,
      count: (seller as any).visits || 0,
    },
    { id: "deal", label: "Deal", icon: Target },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const sellerStages = [
    {
      id: "initial_contact",
      label: "Initial Contact",
      progress: 10,
      color: "blue",
    },
    {
      id: "property_collection",
      label: "Property Collection",
      progress: 25,
      color: "purple",
    },
    {
      id: "mandate_discussion",
      label: "Mandate Discussion",
      progress: 40,
      color: "orange",
    },
    {
      id: "mandate_signed",
      label: "Mandate Signed",
      progress: 60,
      color: "green",
    },
    {
      id: "selling_process",
      label: "Selling Process",
      progress: 75,
      color: "indigo",
    },
    {
      id: "deal_negotiation",
      label: "Deal Negotiation",
      progress: 85,
      color: "yellow",
    },
    { id: "deal_closure", label: "Deal Closure", progress: 95, color: "pink" },
    { id: "completed", label: "Completed", progress: 100, color: "emerald" },
  ];

  const currentStage =
    sellerStages.find((stage) => stage.id === (seller as any).stage) ||
    sellerStages[0];
  const sellerIdVal: string | number | undefined =
    sellerId ?? (seller as any)?.id ?? (seller as any)?.sellerId ?? undefined;
  const ensureTime = (t?: string) => {
    if (!t) return undefined;
    const [hh = "00", mm = "00", ss = "00"] = t.split(":");
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const normalizeFromApi = (row: any): Followup => {
    const id =
      row?.id ??
      row?.followup_id ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id: String(id),
      seller_id: row?.seller_id ?? row?.sellerId,
      buyerLeadStage: row?.seller_lead_stage ?? row?.sellerLeadStage ?? row?.stage ?? null,
      buyerLeadStatus: row?.seller_lead_status ?? row?.sellerLeadStatus ?? row?.status ?? null,
      followup_date:
        row?.schedule_date ??
        row?.followup_date ??
        row?.scheduleDate ??
        undefined,
      followup_time: ensureTime(
        row?.schedule_time ??
        row?.followup_time ??
        row?.scheduleTime ??
        undefined,
      ),
      followup_type: row?.followup_type ?? row?.followupType,
      status: row?.seller_lead_status ?? row?.sellerLeadStatus ?? row?.status,
      priority: row?.priority ?? "Medium",
      remark: row?.remark ?? row?.outcome_name ?? row?.outcomeName ?? row?.outcome ?? undefined,
      outcome: row?.remark ?? row?.outcome_name ?? row?.outcomeName ?? row?.outcome ?? undefined,
      outcome_name: row?.outcome_name ?? row?.outcomeName ?? row?.remark ?? row?.outcome ?? undefined,
      outcome_id: row?.outcome_id ?? row?.outcomeId ?? undefined,
      outcomeId: row?.outcome_id ?? row?.outcomeId ?? undefined,
      customRemark:
        row?.custom_remark ??
        row?.customRemark ??
        row?.notes ??
        undefined,
      custom_remark:
        row?.custom_remark ??
        row?.customRemark ??
        row?.notes ??
        undefined,
      notes:
        row?.custom_remark ??
        row?.customRemark ??
        row?.notes ??
        undefined,
      next_action: row?.next_action ?? row?.nextAction ?? undefined,
      nextAction: row?.next_action ?? row?.nextAction ?? undefined,
      assigned_to:
        row?.assigned_executive ?? row?.assignedExecutive ?? row?.assigned_to,
      assigned_to_name:
        row?.assigned_to_name ?? row?.assignedToName ?? row?.assigned_executive_name,
      assigned_by:
        row?.assigned_by ?? row?.assignedBy,
      assigned_by_name:
        row?.assigned_by_name ?? row?.assignedByName ?? row?.entity_creator_name ?? (seller as any)?.created_by_name ?? (seller as any)?.created_by_user?.name,
      assignedByName:
        row?.assigned_by_name ?? row?.assignedByName ?? row?.entity_creator_name ?? (seller as any)?.created_by_name ?? (seller as any)?.created_by_user?.name,
      reminder: Number(row?.reminder ?? 0) as 0 | 1,
      created_at: row?.created_at ?? row?.createdAt,
      updated_at: row?.updated_at ?? row?.updatedAt,
      created_by: row?.created_by ?? row?.createdBy,
      updated_by: row?.updated_by ?? row?.updatedBy,
      createdByName: row?.created_by_name ?? row?.createdByName ?? (row?.created_by ? `User #${row.created_by}` : null),
      updatedByName: row?.updated_by_name ?? row?.updatedByName,
      assignedExecutiveName:
        row?.assigned_executive_name ?? row?.assignedExecutiveName ?? (seller as any)?.assigned_to_name ?? (seller as any)?.assigned ?? null,
      raw: row,
      transferred_from_lead:
        row?.transferred_from_lead === true ||
        row?.transferred_from_lead === 1 ||
        row?.transferredFromLead === true ||
        row?.transferredFromLead === 1 ||
        false,
      category:
        row?.transferred_from_lead || row?.transferredFromLead
          ? "presales"
          : "sales",
    };
  };

  const fetchFollowups = useCallback(async (forcedId?: string | number) => {
    const idToFetch = forcedId ?? sellerIdVal ?? (sellerRef.current as any)?.id ?? (sellerRef.current as any)?.sellerId;
    if (!idToFetch) return;
    try {
      setFuError(null);
      setFuLoading(true);
      const res = await followupAPI.getAll({
        sellerId: idToFetch as any,
        page: 1,
        limit: 200,
      });
      const rows =
        res && typeof res === "object" && "data" in res ? res.data : res;
      const mapped = (Array.isArray(rows) ? rows : []).map(normalizeFromApi);
      setLocalFollowups(mapped);
    } catch (e: any) {
      console.error("Failed to load seller followups:", e);
      setFuError(e?.message || "Failed to load follow-ups");
    } finally {
      setFuLoading(false);
    }
  }, [sellerIdVal]);

  const lastFetchedIdRef = React.useRef<string | number | null>(null);

  useEffect(() => {
    if (sellerIdVal && lastFetchedIdRef.current !== sellerIdVal) {
      lastFetchedIdRef.current = sellerIdVal;
      fetchFollowups(sellerIdVal);
    }
  }, [sellerIdVal, fetchFollowups]);

  const mapPropertyToInitialData = (property: AnyObj | null) => {
    if (!property) return null;
    const mappedPhotos = Array.isArray(property.photos)
      ? property.photos
        .map((p: any, idx: number) => {
          if (!p) return null;
          if (typeof p === "string")
            return {
              id: `${property.id ?? "p"}-${idx}`,
              url: p,
              name: `photo-${idx + 1}`,
            };
          return {
            id: p.id ?? `${property.id ?? "p"}-${idx}`,
            url: p.url ?? p.path ?? "",
            name: p.name ?? `photo-${idx + 1}`,
          };
        })
        .filter(Boolean)
      : Array.isArray(property.photoUrls)
        ? property.photoUrls.map((u: string, idx: number) => ({
          id: `${property.id ?? "p"}-${idx}`,
          url: u,
          name: `photo-${idx + 1}`,
        }))
        : [];
    const mappedNearby = Array.isArray(property.nearby_places)
      ? property.nearby_places.map((n: any) => ({
        name: n.name ?? n.place ?? "",
        type: n.type ?? n.category ?? "",
        distance: n.distance ?? "",
        unit: n.unit ?? "",
      }))
      : [];
    return {
      id: property.id ?? property._id,
      salutation: property.salutation ?? property.ownerSalutation ?? "Mr",
      ownerName:
        property.ownerName ??
        property.owner_name ??
        property.contactName ??
        property.seller_name ??
        "",
      ownerPhone:
        property.ownerPhone ??
        property.owner_phone ??
        property.contactPhone ??
        property.phone ??
        "",
      ownerWhatsapp:
        property.ownerWhatsapp ??
        property.owner_whatsapp ??
        property.contactWhatsapp ??
        "",
      sameAsPhone: !!(
        (property.ownerWhatsapp &&
          property.ownerPhone &&
          property.ownerWhatsapp === property.ownerPhone) ||
        (property.ownerWhatsapp && property.ownerWhatsapp === property.phone)
      ),
      ownerEmail:
        property.ownerEmail ??
        property.owner_email ??
        property.contactEmail ??
        property.email ??
        "",
      ownerType: property.ownerType ?? property.owner_type ?? "individual",
      seller:
        property.seller ??
        property.seller_name ??
        `${safeString((seller as any)?.salutation ? (seller as any).salutation + " " : "")}${safeString((seller as any)?.name)}`,
      propertyType:
        property.propertyType ??
        property.type ??
        property.property_type_name ??
        "",
      propertySubtype:
        property.propertySubtype ??
        property.subtype ??
        property.property_subtype_name ??
        "",
      unitType:
        property.unitType ??
        property.unit_type ??
        safeString(property.unit_type_name) ??
        "",
      wing: property.wing ?? property.block ?? "",
      unitNo: property.unitNo ?? property.unit_no ?? property.unit ?? "",
      furnishing: property.furnishing ?? "",
      parkingType: property.parkingType ?? property.parking_type ?? "",
      parkingQty: safeNumber(property.parkingQty ?? property.parking_qty),
      city: property.city ?? property.city_name ?? (seller as any)?.city ?? "",
      location: property.location ?? property.location_name ?? "",
      society: property.society ?? property.society_name ?? "",
      floor: property.floor ?? "",
      totalFloors: property.totalFloors ?? property.total_floors ?? "",
      carpetArea: safeNumber(
        property.carpetArea ?? property.carpet_area ?? property.area,
      ),
      builtupArea: safeNumber(property.builtupArea ?? property.builtup_area),
      budget: safeNumber(
        property.budget ?? property.price ?? property.expectedPrice,
      ),
      address:
        property.address ??
        property.displayAddress ??
        property.full_address ??
        "",
      status: property.status ?? "",
      leadSource:
        property.leadSource ??
        property.lead_source ??
        property.source ??
        (seller as any)?.source ??
        "Website",
      possessionMonth:
        property.possessionMonth ?? property.possession_month ?? "",
      possessionYear: property.possessionYear ?? property.possession_year ?? "",
      purchaseMonth: property.purchaseMonth ?? property.purchase_month ?? "",
      purchaseYear: property.purchaseYear ?? property.purchase_year ?? "",
      sellingRights: property.sellingRights ?? property.selling_rights ?? "",
      amenities: ensureArray(
        property.amenities ?? property.amenities_list ?? [],
      ),
      furnishingItems: ensureArray(
        property.furnishingItems ?? property.furnishing_items ?? [],
      ),
      description:
        property.description ?? property.longDescription ?? property.desc ?? "",
      nearby_places: mappedNearby,
      existingOwnershipDocUrl:
        property.ownership_doc_path ?? property.ownershipDocUrl ?? "",
      existingOwnershipDocName: property.ownership_doc_name ?? "",
      existingOwnershipDocId: property.ownership_doc_id ?? "",
      existingPhotos: mappedPhotos,
      public_inquiries:
        property.public_inquiries ?? property.publicInquiries ?? 0,
      public_views: property.public_views ?? property.publicViews ?? 0,
      publication_date:
        property.publication_date ?? property.publicationDate ?? null,
    };
  };

  const openPropertyFormForEdit = (property: AnyObj) => {
    setEditingProperty(mapPropertyToInitialData(property));
    setShowPropertyForm(true);
  };
  const openPropertyFormForCreate = () => {
    setEditingProperty({
      seller: `${(seller as any)?.salutation ? (seller as any).salutation + " " : ""}${(seller as any)?.name ?? ""}`,
      city: (seller as any)?.city ?? "",
      location: (seller as any)?.location ?? "",
      leadSource: (seller as any)?.source ?? "Website",
    });
    setShowPropertyForm(true);
  };
  const handleStageUpdate = (
    newStage: string,
    remarks: string,
    nextAction: string,
  ) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      stage: newStage,
      stageProgress: sellerStages.find((s) => s.id === newStage)?.progress ?? 0,
      lastActivity: new Date().toISOString().split("T")[0],
      activities: [
        ...((seller as AnyObj).activities || []),
        {
          id: Date.now(),
          type: "stage_update",
          description: `Stage updated to ${sellerStages.find((s) => s.id === newStage)?.label ?? newStage}`,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          stage: newStage,
          outcome: remarks,
          nextAction,
          executedBy: "Admin User",
          remarks,
        },
      ],
    };
    onUpdateSeller(updatedSeller);
    setShowStageUpdateModal(false);
  };
  const handleAddActivity = (activityData: AnyObj) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      activities: [...((seller as AnyObj).activities || []), activityData],
      lastActivity: new Date().toISOString().split("T")[0],
    };
    onUpdateSeller(updatedSeller);
    setShowActivityModal(false);
    setEditingActivity(null);
  };
  const upsertFollowupLocal = (followupData: Followup) => {
    setLocalFollowups((prev) => {
      const exists = prev.some((f) => String(f.id) === String(followupData.id));
      const next = exists
        ? prev.map((f) => (String(f.id) === String(followupData.id) ? followupData : f))
        : [followupData, ...prev];
      const updatedSeller = {
        ...(sellerRef.current as AnyObj),
        followups: next,
      };
      onUpdateSeller(updatedSeller);
      return next;
    });
  };
  const handleDeleteFollowupLocal = (f: Followup) => {
    setLocalFollowups((prev) => {
      const next = prev.filter((x) => String(x.id) !== String(f.id));
      const updatedSeller = {
        ...(sellerRef.current as AnyObj),
        followups: next,
      };
      onUpdateSeller(updatedSeller);
      return next;
    });
  };
  const handleAddVisit = (visitData: AnyObj) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      visits: ((seller as AnyObj).visits || 0) + 1,
      totalVisits: ((seller as AnyObj).totalVisits || 0) + 1,
      lastActivity: new Date().toISOString().split("T")[0],
      activities: [
        ...((seller as AnyObj).activities || []),
        {
          id: Date.now(),
          type: "visit",
          description: `Property visit scheduled for ${visitData.property}`,
          date: visitData.date,
          time: visitData.time,
          stage: (seller as AnyObj).stage,
          outcome: visitData.feedback || "Visit scheduled",
          nextAction: visitData.nextAction || "Follow up after visit",
          executedBy: "Admin User",
          remarks: visitData.remarks || "",
        },
      ],
    };
    onUpdateSeller(updatedSeller);
    setShowVisitModal(false);
  };
  const filteredLinkableProperties = useMemo(() => {
    const currentPropertyIds = new Set(
      ((seller as any).properties || []).map((p: any) =>
        String(p.id || p.property_id || p._id || "")
      )
    );
    const q = (linkPropertySearch || "").toLowerCase().trim();
    const qClean = q.replace(/[^a-z0-9]/gi, "");
    const qDigits = q.replace(/\D/g, "");
    const qNum = parseInt(qDigits, 10);
    const qTrimmed = qDigits.replace(/^0+/, "");

    const all = (availableProperties || []).filter((p: any) => {
      if (!q) return true;

      const title = String(p.title || p.property_type_name || p.unit_type || p.property_type || "").toLowerCase();
      const address = String(p.address || p.location_name || p.locality_name || p.location || p.city_name || p.city || "").toLowerCase();
      const society = String(p.society_name || p.society || "").toLowerCase();
      const pid = String(p.id || p.property_id || p._id || "");
      const repId = String(p.propertyId || p.rep_id || p._rxpBadge || "").toLowerCase();
      const pidDigits = pid.replace(/\D/g, "");
      const pidNum = parseInt(pidDigits, 10);
      const pidTrimmed = pidDigits.replace(/^0+/, "");
      const pidClean = pid.replace(/[^a-z0-9]/gi, "");
      const repIdClean = repId.replace(/[^a-z0-9]/gi, "");

      // Direct text matching
      if (
        title.includes(q) ||
        address.includes(q) ||
        society.includes(q) ||
        pid.toLowerCase().includes(q) ||
        repId.includes(q)
      ) {
        return true;
      }

      // Alphanumeric clean match (e.g. 'rex0388' vs 'rex388')
      if (qClean && (pidClean.includes(qClean) || repIdClean.includes(qClean) || qClean.includes(pidClean) || qClean.includes(repIdClean))) {
        return true;
      }

      // Number comparison ignoring leading zeros
      if (!isNaN(qNum) && !isNaN(pidNum) && qNum === pidNum) {
        return true;
      }

      // Trimmed digit match
      if (qTrimmed && pidTrimmed && (pidTrimmed.includes(qTrimmed) || qTrimmed.includes(pidTrimmed))) {
        return true;
      }

      return false;
    });

    return all.sort((a: any, b: any) => {
      const aPid = String(a.id || a.property_id || a._id || "");
      const bPid = String(b.id || b.property_id || b._id || "");
      const aLinked = currentPropertyIds.has(aPid);
      const bLinked = currentPropertyIds.has(bPid);
      if (aLinked === bLinked) return 0;
      return aLinked ? 1 : -1;
    });
  }, [availableProperties, seller, linkPropertySearch]);

  const handleLinkProperty = async (property: any) => {
    const propertiesToLink = Array.isArray(property) ? property : [property];
    const currentProps = (seller as any).properties || [];

    const updatedProps = [...currentProps];
    let newlyLinkedCount = 0;

    for (const prop of propertiesToLink) {
      const pid = String(prop.id || prop.property_id || prop._id);
      const alreadyLinked = updatedProps.some(
        (p: any) => String(p.id || p.property_id || p._id) === pid
      );
      if (!alreadyLinked) {
        updatedProps.push(prop);
        newlyLinkedCount++;
      }
    }

    if (newlyLinkedCount === 0) {
      toast.info("Selected properties are already linked to this seller");
      return;
    }

    const updatedSeller = {
      ...(seller as AnyObj),
      properties: updatedProps,
    };
    onUpdateSeller(updatedSeller);
    setShowLinkPropertyModal(false);
    setLinkPropertySearch("");
    toast.success(`${newlyLinkedCount} properties linked to seller successfully`);
    if (sellerIdVal) {
      try {
        const res = await sellerAPI.update(String(sellerIdVal), {
          ...updatedSeller,
          properties: updatedProps,
          property_ids: updatedProps
            .map((p: any) => p.id || p.property_id || p._id)
            .filter(Boolean),
        });
        if (res && res.data) {
          onUpdateSeller(res.data);
        }
      } catch (err) {
        console.error("Failed to update seller properties on server:", err);
      }
    }
  };

  const handleUnlinkPropertyObj = async (property: any) => {
    const currentProps = (seller as any).properties || [];
    const pid = String(property.id || property.property_id || property._id);
    const idx = currentProps.findIndex((p: any) => String(p.id || p.property_id || p._id) === pid);
    if (idx !== -1) {
      await handleUnlinkProperty(idx);
    }
  };

  const handleUnlinkProperty = async (propertyIndex: number) => {
    const currentProps = (seller as any).properties || [];
    const propToUnlink = currentProps[propertyIndex];
    const title = propToUnlink?.title || propToUnlink?.property_type_name || 'this property';

    const result = await Swal.fire({
      title: 'Unlink Property?',
      text: `Are you sure you want to unlink "${title}" from this seller?`,
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

    const updatedProps = currentProps.filter(
      (_: any, idx: number) => idx !== propertyIndex
    );
    const updatedSeller = {
      ...(seller as AnyObj),
      properties: updatedProps,
    };
    onUpdateSeller(updatedSeller);
    toast.success("Property unlinked from seller");
    if (sellerIdVal) {
      try {
        const res = await sellerAPI.update(String(sellerIdVal), {
          ...updatedSeller,
          properties: updatedProps,
          property_ids: updatedProps
            .map((p: any) => p.id || p.property_id || p._id)
            .filter(Boolean),
        });
        if (res && res.data) {
          onUpdateSeller(res.data);
        }
        try {
          await propertiesAPI.patchSeller(String(propToUnlink.id || propToUnlink.property_id || propToUnlink._id), 'unlink');
        } catch (e) {
          console.warn('patchSeller single unlink note:', e);
        }
      } catch (err) {
        console.error("Failed to update seller properties on server:", err);
      }
    }
  };

  const handleBulkUnlinkProperties = async (propertyIds: string[]) => {
    if (!propertyIds.length) return;
    const currentProps = (seller as any).properties || [];

    const result = await Swal.fire({
      title: 'Unlink Selected Properties?',
      text: `Are you sure you want to unlink the ${propertyIds.length} selected properties from this seller?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Unlink All',
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

    const idsToFilter = new Set(propertyIds.map(id => String(id)));
    const updatedProps = currentProps.filter(
      (p: any) => !idsToFilter.has(String(p.id || p.property_id || p._id))
    );

    const updatedSeller = {
      ...(seller as AnyObj),
      properties: updatedProps,
    };
    onUpdateSeller(updatedSeller);
    toast.success(`${propertyIds.length} properties unlinked`);

    if (sellerIdVal) {
      try {
        const res = await sellerAPI.update(String(sellerIdVal), {
          ...updatedSeller,
          properties: updatedProps,
          property_ids: updatedProps
            .map((p: any) => p.id || p.property_id || p._id)
            .filter(Boolean),
        });
        if (res && res.data) {
          onUpdateSeller(res.data);
        }

        for (const pid of propertyIds) {
          try {
            await propertiesAPI.patchSeller(String(pid), 'unlink');
          } catch (e) {
            console.warn('patchSeller bulk unlink note:', e);
          }
        }
      } catch (err) {
        console.error("Failed to update seller properties on server:", err);
      }
    }
    setSelectedPropIds([]);
  };

  const handleAddProperty = async (propertyData: AnyObj) => {
    const currentProps = (seller as any).properties || [];
    const updatedProps = [
      ...currentProps,
      propertyData,
    ];
    const updatedSeller = {
      ...(seller as AnyObj),
      properties: updatedProps,
    };
    onUpdateSeller(updatedSeller);
    setShowPropertyForm(false);
    setEditingProperty(null);
    toast.success("Property added to seller");
    if (sellerIdVal) {
      try {
        const res = await sellerAPI.update(String(sellerIdVal), {
          ...updatedSeller,
          properties: updatedProps,
          property_ids: updatedProps
            .map((p: any) => p.id || p.property_id || p._id)
            .filter(Boolean),
        });
        if (res && res.data) {
          onUpdateSeller(res.data);
        }
      } catch (err) {
        console.error("Failed to update seller properties on server:", err);
      }
    }
  };

  const normalizeToFollowup = (data: SellerFollowupPayload): Followup => {
    const mkId = () =>
      data.id
        ? String(data.id)
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id: mkId(),
      seller_id:
        data.seller_id ?? (seller as any)?.id ?? (seller as any)?.sellerId,
      followup_date: data.scheduleDate || undefined,
      followup_time: ensureTime(data.scheduleTime),
      followup_type: data.followupType || undefined,
      status: data.sellerLeadStatus || undefined,
      priority: data.priority || undefined,
      notes: data.customRemark || data.remark || undefined,
      next_action: data.nextAction || undefined,
      assigned_to: data.assigned_executive,
      reminder: (data.reminder as number) ?? 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      created_by: data.created_by,
      updated_by: data.updated_by,
      transferred_from_lead: false,
      category: "sales",
    };
  };

  const handleModalSave = async (payload: SellerFollowupPayload) => {
    if (!sellerIdVal) {
      alert("Missing seller id.");
      return;
    }
    if (!canCreateFollowups && !editingFollowup) {
      toast.error("No permission to create");
      return;
    }
    if (editingFollowup && !canUpdateFollowups) {
      toast.error("No permission to update");
      return;
    }
    try {
      setFuError(null);
      setFuLoading(true);
      const apiPayload = {
        ...payload,
        seller_id: payload.seller_id ?? sellerIdVal,
      };
      if (editingFollowup?.id) {
        const res = await followupAPI.update(
          editingFollowup.id,
          apiPayload
        );
        const normalized = normalizeFromApi(res?.data ?? res ?? apiPayload);
        upsertFollowupLocal(normalized);
      } else {
        const res = await followupAPI.create(apiPayload);
        const normalized = normalizeFromApi(res?.data ?? res ?? apiPayload);
        upsertFollowupLocal(normalized);
      }
      setShowFollowupModal(false);
      setEditingFollowup(null);
    } catch (e: any) {
      console.error("Save failed:", e);
      setFuError(e?.message || "Failed to save");
      alert(e?.message || "Failed to save");
    } finally {
      setFuLoading(false);
    }
  };

  const handleDeleteFollowup = async (f: Followup) => {
    if (!canDeleteFollowups) {
      toast.error("No permission to delete");
      return;
    }
    const deleteType = f.followupType || f.followup_type || f.type || "Follow-up";
    const deleteDate = f.scheduleDate || f.followup_date || f.date || null;
    const deleteTime = f.scheduleTime || f.followup_time || f.time || null;
    const deleteSchedule = deleteDate
      ? `${fmtDateDDMMYYYY(parseSqlish(String(deleteDate)) || new Date(String(deleteDate)))}${deleteTime ? ` at ${fmtTime12h(String(deleteTime))}` : ""}`
      : "No schedule set";
    const deletePriority = f.priority ? String(f.priority) : "Normal";

    const result = await Swal.fire({
      title: "",
      html: `
        <div style="font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-align:left">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
            <div style="width:46px;height:46px;border-radius:14px;background:#fff1f2;color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid #ffe4e6">⌫</div>
            <div>
              <div style="font-size:18px;font-weight:800;color:#0f2b3d;line-height:1.2">Delete follow-up?</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:4px">This action cannot be undone.</div>
            </div>
          </div>
          <div style="border:1px solid #e2e8f0;border-radius:14px;padding:13px;background:#f8fafc;margin-bottom:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
              <span style="font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.08em">Follow-up</span>
              <span style="font-size:10px;font-weight:700;color:#0f2b3d;background:#fff;border:1px solid #e2e8f0;padding:5px 8px;border-radius:8px">${deleteType}</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:9px">
                <div style="font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Scheduled</div>
                <div style="font-size:10px;font-weight:700;color:#334155">${deleteSchedule}</div>
              </div>
              <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:9px">
                <div style="font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Priority</div>
                <div style="font-size:10px;font-weight:700;color:#334155">${deletePriority}</div>
              </div>
            </div>
          </div>
          <div style="font-size:11px;line-height:1.5;color:#64748b;background:#fff7ed;border:1px solid #fed7aa;border-radius:11px;padding:10px 11px">
            <strong style="color:#9a3412">Please confirm:</strong> the selected follow-up will be permanently removed from this seller's history.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Delete Follow-up",
      cancelButtonText: "Keep Follow-up",
      background: "#ffffff",
      backdrop: `rgba(15, 43, 61, 0.55)`,
      width: "470px",
      padding: "24px",
      customClass: {
        popup: "rounded-2xl shadow-2xl border border-slate-200",
        confirmButton: "!rounded-xl !bg-red-600 !px-4 !py-2.5 !text-[11px] !font-bold !text-white hover:!bg-red-700 !shadow-sm",
        cancelButton: "!rounded-xl !bg-slate-100 !px-4 !py-2.5 !text-[11px] !font-bold !text-slate-700 hover:!bg-slate-200 !shadow-none",
        actions: "!gap-2 !mt-4",
      },
      buttonsStyling: false,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    try {
      setFuError(null);
      setFuLoading(true);
      await followupAPI.delete(f.id);
      handleDeleteFollowupLocal(f);
      await fetchFollowups();
      toast.success("Follow-up deleted successfully");
    } catch (e: any) {
      console.error("Delete failed:", e);
      setFuError(e?.message || "Failed to delete");
      toast.error(e?.message || "Failed to delete follow-up");
    } finally {
      setFuLoading(false);
    }
  };

  const renderOverviewTab = () => {
    const sellerProps = ((seller as any).properties || []) as AnyObj[];
    const sellerActivities = ((seller as any).activities || []) as AnyObj[];
    const sellerFollowups = ((seller as any).followups || []) as AnyObj[];
    const pendingFollowups = sellerFollowups.filter((f: any) => f.status === 'pending' || !f.status);

    const fullAddress = [
      (seller as any).location,
      (seller as any).city,
      (seller as any).state,
    ]
      .filter((x) => x && x !== '-' && x !== '—')
      .join(', ');

    const priorityNormalized = ((seller as any).priority || 'low').toLowerCase().trim();
    const priorityColor =
      priorityNormalized === 'high'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : priorityNormalized === 'medium'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

    const stageProgressVal = (seller as any).stageProgress ?? 0;

    return (
      <div className="space-y-3 max-w-[1600px] mx-auto text-slate-800">
        {/* 1. TOP METRICS STRIP (Compact & Premium KPI Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Total Visits
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {(seller as any).visits ?? 0}
                </span>
                <span className="text-[10px] font-medium text-slate-400">visits done</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
              <Eye size={16} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-purple-300 hover:shadow-sm transition-all flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Interested Buyers
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {(seller as any).interestedBuyers ?? 0}
                </span>
                <span className="text-[10px] font-medium text-purple-600 font-semibold">matched</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100">
              <Users size={16} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-emerald-300 hover:shadow-sm transition-all flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Properties Listed
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {sellerProps.length}
                </span>
                <span className="text-[10px] font-medium text-slate-400">in portfolio</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
              <Building size={16} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-amber-300 hover:shadow-sm transition-all flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Activities Done
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {sellerActivities.length}
                </span>
                <span className="text-[10px] font-medium text-emerald-600">Logged</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
              <Activity size={16} />
            </div>
          </div>
        </div>

        {/* 2. MAIN 2-COLUMN HIGH-DENSITY DASHBOARD LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* ================= LEFT COLUMN: Profile, Portfolio, Photos (7 Cols) ================= */}
          <div className="lg:col-span-7 space-y-3">
            {/* Card A: Seller Profile & Contact Information */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-orange-100 text-orange-600">
                    <UserIcon size={13} />
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    Seller Profile & Contact Information
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityColor} capitalize`}
                  >
                    {(seller as any).priority || 'Low'} Priority
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      (seller as any).isActive === false || (seller as any).status === 'Inactive'
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {(seller as any).status ?? ((seller as any).isActive ? 'ACTIVE' : 'INACTIVE')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-3">
                {/* Quick Communication Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-slate-50/90 rounded-lg border border-slate-100 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70 shadow-2xs">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">Phone</p>
                      <p className="font-bold text-slate-800 text-[11px] truncate">
                        {(seller as any).phone || '—'}
                      </p>
                    </div>
                    {(seller as any).phone && (seller as any).phone !== '-' && (
                      <a
                        href={`tel:${String((seller as any).phone).replace(/\D/g, '')}`}
                        className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex-shrink-0"
                        title="Call Seller"
                      >
                        <Phone size={12} />
                      </a>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70 shadow-2xs">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">WhatsApp</p>
                      <p className="font-bold text-slate-800 text-[11px] truncate">
                        {(seller as any).whatsapp || (seller as any).phone || '—'}
                      </p>
                    </div>
                    {((seller as any).whatsapp || (seller as any).phone) && (
                      <a
                        href={`https://wa.me/${String((seller as any).whatsapp || (seller as any).phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hi ${(seller as any).name || ''}, regarding your listed property...`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex-shrink-0"
                        title="Send WhatsApp Message"
                      >
                        <MessageCircle size={12} />
                      </a>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70 shadow-2xs">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-slate-400 uppercase">Email</p>
                      <p className="font-bold text-slate-800 text-[11px] truncate">
                        {(seller as any).email || '—'}
                      </p>
                    </div>
                    {(seller as any).email && (seller as any).email !== '-' && (
                      <a
                        href={`mailto:${(seller as any).email}`}
                        className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                        title="Send Email"
                      >
                        <Mail size={12} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Structured Key Details Table Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Full Name</span>
                    <p className="font-bold text-slate-900 mt-0.5 truncate">
                      {(seller as any).salutation ? `${(seller as any).salutation} ` : ''}
                      {(seller as any).name || '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Location / Address</span>
                    <p className="font-semibold text-slate-800 mt-0.5 truncate flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{fullAddress || '—'}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Lead Source</span>
                    <p className="font-semibold text-slate-800 mt-0.5 truncate">
                      {(seller as any).source || 'WhatsApp'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Assigned Executive</span>
                    <p className="font-bold text-slate-800 mt-0.5 truncate flex items-center gap-1">
                      <UserIcon size={12} className="text-blue-600 flex-shrink-0" />
                      <span>{(seller as any).assigned_to_name || (seller as any).assigned || 'Unassigned'}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Date of Birth</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {(seller as any).seller_dob
                        ? (fmtDateDDMMYYYY(parseSqlish((seller as any).seller_dob) as Date) || (seller as any).seller_dob)
                        : '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Interested Buyers</span>
                    <p className="font-semibold text-purple-600 mt-0.5">
                      {(seller as any).interestedBuyers ?? 0} Matched Leads
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Properties Portfolio */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-100 text-blue-600">
                    <Building size={13} />
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    Properties Portfolio
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    {sellerProps.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedPropIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleBulkUnlinkProperties(selectedPropIds)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Unlink ({selectedPropIds.length})
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setLinkPropertySearch("");
                      setShowLinkPropertyModal(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                  >
                    <Link2 size={11} />
                    <span>Link Property</span>
                  </button>
                  <button
                    onClick={openPropertyFormForCreate}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <Plus size={11} />
                    <span>Add Property</span>
                  </button>
                </div>
              </div>

              <div className="p-3">
                {sellerProps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sellerProps.map((property: AnyObj, index: number) => {
                      const propType = property.property_type_name || property.property_type || "";
                      const unitType = property.unit_type || property.bhk || property.configuration || "";
                      const subtype = property.property_subtype_name || property.property_sub_type || property.property_subtype || property.subtype || "";
                      const titleParts = [propType, unitType, subtype].map(s => String(s).trim()).filter(Boolean).join(" ");
                      const title = titleParts || property.title || "Untitled Property";

                      const address =
                        property.address ??
                        property.location ??
                        ([property.location_name, property.city_name || property.city]
                          .filter(Boolean)
                          .join(", ") ||
                          "—");
                      const rawPhoto =
                        property.photos?.[0]?.url ||
                        property.photos?.[0] ||
                        property.image ||
                        property.photo;
                      const photo = getImageUrl(rawPhoto) || null;
                      const price =
                        property.price ?? property.budget ?? property.expected_price;

                      return (
                        <div
                          key={index}
                          className="border border-slate-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-sm transition-all bg-white flex gap-2 items-center justify-between"
                        >
                          <div className="flex gap-2 items-center min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedPropIds.includes(String(property.id || property.property_id || property._id))}
                              onChange={(e) => {
                                const idStr = String(property.id || property.property_id || property._id);
                                if (e.target.checked) {
                                  setSelectedPropIds(prev => [...prev, idStr]);
                                } else {
                                  setSelectedPropIds(prev => prev.filter(id => id !== idStr));
                                }
                              }}
                              className="accent-blue-600 h-3.5 w-3.5 mr-0.5 cursor-pointer"
                            />
                            {photo ? (
                              <img
                                src={photo}
                                alt={title}
                                className="w-12 h-11 object-cover rounded-md flex-shrink-0 border border-slate-100"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)?.classList?.remove('hidden'); }}
                              />
                            ) : null}
                            <div className={`w-12 h-11 rounded-md bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 flex-shrink-0 ${photo ? 'hidden' : ''}`}>
                              No Pic
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-bold truncate text-slate-900 leading-tight">
                                {title}
                              </h4>
                              <p className="text-[10px] truncate text-slate-500 mt-0.5">
                                {address}
                              </p>
                              {price && (
                                <span className="text-[10px] font-black text-emerald-600 block mt-0.5">
                                  {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : `₹${price}`}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => openPropertyFormForEdit(property)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Edit Property"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleUnlinkProperty(index)}
                              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title="Unlink Property"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl bg-slate-50/60">
                    <Building size={24} className="mx-auto mb-1.5 text-slate-300" />
                    <p className="text-xs text-slate-700 font-bold mb-0.5">
                      No Properties Linked Yet
                    </p>
                    <p className="text-[10px] text-slate-400 mb-2.5 max-w-sm mx-auto">
                      Link an existing property or create a fresh property listing for this seller.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setLinkPropertySearch("");
                          setShowLinkPropertyModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                      >
                        <Link2 size={11} />
                        <span>Link Property</span>
                      </button>
                      <button
                        onClick={openPropertyFormForCreate}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                      >
                        <Plus size={11} />
                        <span>Add Property</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card C: Property Photos Gallery */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-purple-100 text-purple-600">
                    <Camera size={13} />
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    Property Photos Gallery
                  </h3>
                </div>
                <button
                  onClick={openPropertyFormForCreate}
                  className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <Camera size={12} />
                  <span>Add Photo</span>
                </button>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(((seller as any).properties?.[0]?.photos ?? []) as any[])
                    .slice(0, 3)
                    .map((photo: any, index: number) => {
                      const src = typeof photo === "string" ? photo : photo?.url || photo?.path;
                      return (
                        <div
                          key={index}
                          className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200/70"
                        >
                          <img
                            src={src}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                            <Eye
                              size={16}
                              className="text-white opacity-0 group-hover:opacity-100"
                            />
                          </div>
                        </div>
                      );
                    })}
                  <div
                    onClick={openPropertyFormForCreate}
                    className="border border-dashed border-slate-300 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-center">
                      <Camera size={16} className="mx-auto mb-0.5 text-slate-400" />
                      <span className="text-[9px] font-semibold text-slate-500">Add Photo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Journey, Follow-ups, Activities, Remarks (5 Cols) ================= */}
          <div className="lg:col-span-5 space-y-3">
            {/* Card 1: Stage Progress & Seller Journey */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-purple-100 text-purple-600">
                    <TrendingUp size={13} />
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    Stage Progress & Journey
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {currentStage.label}
                  </span>
                  <span className="text-xs font-black text-blue-600">
                    {stageProgressVal}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-3">
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-600"
                    style={{ width: `${Math.max(stageProgressVal, 5)}%` }}
                  />
                </div>

                {/* 4 Mini Stat Blocks */}
                <div className="grid grid-cols-4 gap-1.5 text-center pt-1 border-t border-slate-100">
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <p className="text-xs font-black text-slate-800">{sellerActivities.length}</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">Activities</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <p className="text-xs font-black text-blue-600">{(seller as any).visits ?? 0}</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">Visits</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <p className="text-xs font-black text-purple-600">{(seller as any).interestedBuyers ?? 0}</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">Buyers</p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <p className="text-xs font-black text-emerald-600">{sellerProps.length}</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">Properties</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Upcoming Follow-ups & Next Actions */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-100 text-amber-600">
                    <Calendar size={13} />
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    Upcoming Follow-ups ({pendingFollowups.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('followups')}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  View All
                </button>
              </div>

              <div className="p-3">
                {pendingFollowups.length > 0 ? (
                  <div className="space-y-2">
                    {pendingFollowups.slice(0, 3).map((fu: any, index: number) => (
                      <div
                        key={fu.id || index}
                        className="p-2 rounded-lg border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-colors flex items-start justify-between gap-2"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="p-1 bg-amber-100 rounded text-amber-700 mt-0.5 flex-shrink-0">
                            <Clock size={11} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">
                              {fu.description || fu.remark || fu.notes || fu.title || 'Follow-up Scheduled'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {fu.scheduleDate || fu.date || fu.schedule_date || ''} {fu.scheduleTime || fu.time || '' ? `• ${fu.scheduleTime || fu.time}` : ''}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex-shrink-0 ${
                            fu.priority === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : fu.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {fu.priority || 'Normal'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs">
                    <Calendar size={20} className="mx-auto text-slate-300 mb-1" />
                    <p className="text-[11px] font-bold text-slate-600">No Pending Follow-ups</p>
                    <p className="text-[10px] text-slate-400">All scheduled follow-ups are up to date.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Recent Activities Timeline */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-blue-100 text-blue-600">
                    <Activity size={13} />
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">
                    Recent Activities
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View Timeline
                </button>
              </div>

              <div className="p-3">
                {sellerActivities.length > 0 ? (
                  <div className="space-y-2">
                    {sellerActivities.slice(0, 3).map((act: any, index: number) => (
                      <div
                        key={act.id || index}
                        className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-2"
                      >
                        <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5 flex-shrink-0">
                          <Activity size={11} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] font-bold text-slate-800 truncate">
                              {act.description || act.title || 'Activity Logged'}
                            </p>
                            <span className="text-[9px] text-slate-400 flex-shrink-0">
                              {act.date || act.createdAt ? `${act.date || ''}` : ''}
                            </span>
                          </div>
                          {act.outcome && (
                            <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                              Outcome: <span className="font-medium text-slate-800">{act.outcome}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs">
                    <Activity size={20} className="mx-auto text-slate-300 mb-1" />
                    <p className="text-[11px] font-bold text-slate-600">No Activities Logged</p>
                    <p className="text-[10px] text-slate-400">Interaction logs will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Remarks / Notes Box */}
            {(seller as any).notes && (
              <div className="bg-amber-50/50 rounded-xl border border-amber-200/70 p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px] mb-1">
                  <FileText size={12} className="text-amber-600" />
                  <span>Executive Notes & Remarks</span>
                </div>
                <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {(seller as any).notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderActivitiesTab = () => (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: N }}>
          Activity Timeline
        </h3>
        <button
          onClick={() => setShowActivityModal(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium text-white transition-all hover:opacity-80"
          style={{ background: O }}
        >
          <Plus size={10} />
          <span>Add Activity</span>
        </button>
      </div>

      {(seller as any).activities && (seller as any).activities.length > 0 ? (
        <div className="space-y-2">
          {(seller as any).activities.map((activity: any, index: number) => (
            <div
              key={index}
              className="rounded-lg p-2.5 transition-all hover:shadow-sm"
              style={{ background: 'white', border: `1px solid ${BD}` }}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `${O}10` }}>
                  <Activity size={11} style={{ color: O }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-1">
                    <h4 className="text-[9px] font-semibold" style={{ color: N }}>
                      {activity.description}
                    </h4>
                    <span className="text-[8px]" style={{ color: MU }}>
                      {activity.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-[8px]" style={{ color: MU }}>
                    <span>Stage: {activity.stage}</span>
                    <span>By: {activity.executedBy}</span>
                  </div>
                  {activity.outcome && (
                    <p className="text-[8px] mt-1" style={{ color: MU }}>
                      <span className="font-medium" style={{ color: N }}>Outcome:</span> {activity.outcome}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-6 text-center" style={{ background: 'white', border: `1px solid ${BD}` }}>
          <Activity size={28} className="mx-auto mb-2" style={{ color: MU }} />
          <p className="text-[9px]" style={{ color: MU }}>No activities recorded</p>
          <button
            onClick={() => setShowActivityModal(true)}
            className="mt-2 px-3 py-1 text-[8px] font-medium rounded-lg text-white transition-all hover:opacity-80"
            style={{ background: O }}
          >
            Add First Activity
          </button>
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Documents</h3>
        <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-blue-600 text-white hover:bg-blue-700">
          <Plus size={12} />
          <span>Create Document</span>
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-[10px] font-semibold text-gray-900 mb-3">
          Document Workflow
        </h4>
        <div className="space-y-2">
          {[
            {
              stage: "creation",
              label: "Document Creation",
              status: "completed",
              icon: FileText,
            },
            {
              stage: "sharing",
              label: "Sharing with Seller",
              status: "completed",
              icon: Send,
            },
            {
              stage: "otp",
              label: "OTP Verification",
              status: "pending",
              icon: Shield,
            },
            {
              stage: "esign",
              label: "E-Signature",
              status: "pending",
              icon: Award,
            },
            {
              stage: "completion",
              label: "Document Completion",
              status: "pending",
              icon: CheckCircle,
            },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-lg ${step.status === "completed" ? "bg-green-100" : step.status === "pending" ? "bg-amber-100" : "bg-gray-100"}`}
              >
                <step.icon
                  size={12}
                  className={
                    step.status === "completed"
                      ? "text-green-600"
                      : step.status === "pending"
                        ? "text-amber-600"
                        : "text-gray-500"
                  }
                />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-medium text-gray-900">
                  {step.label}
                </p>
                <p
                  className={`text-[8px] ${step.status === "completed" ? "text-green-600" : step.status === "pending" ? "text-amber-600" : "text-gray-500"}`}
                >
                  {step.status === "completed"
                    ? "Completed"
                    : step.status === "pending"
                      ? "Pending"
                      : "Not Started"}
                </p>
              </div>
              {step.status === "pending" && (
                <button className="px-2 py-0.5 text-[8px] rounded bg-blue-600 text-white hover:bg-blue-700">
                  {step.stage === "otp"
                    ? "Send OTP"
                    : step.stage === "esign"
                      ? "Initiate E-Sign"
                      : "Process"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {(seller as any).documents && (seller as any).documents.length > 0 ? (
        <div className="space-y-2">
          {(seller as any).documents.map((doc: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-600" />
                <div>
                  <p className="text-[9px] font-semibold text-gray-900">
                    {doc.name}
                  </p>
                  <p className="text-[8px] text-gray-500">
                    {doc.category} • {doc.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${doc.status === "completed" ? "bg-green-100 text-green-700" : doc.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {doc.status}
                </span>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Eye size={10} className="text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <FileText size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-[10px] text-gray-500">No documents created</p>
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-600 rounded-xl p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-blue-100">Response Rate</p>
              <p className="text-lg font-bold">
                {(seller as any).responseRate ?? "—"}%
              </p>
            </div>
            <TrendingUp size={16} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-purple-600 rounded-xl p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-purple-100">Deal Potential</p>
              <p className="text-lg font-bold capitalize">
                {(seller as any).dealPotential ?? "—"}
              </p>
            </div>
            <Target size={16} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-green-600 rounded-xl p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-green-100">Avg Response</p>
              <p className="text-lg font-bold">
                {(seller as any).avgResponseTime ?? "—"}
              </p>
            </div>
            <Clock size={16} className="text-green-200" />
          </div>
        </div>
        <div className="bg-orange-600 rounded-xl p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-orange-100">Total Visits</p>
              <p className="text-lg font-bold">
                {(seller as any).totalVisits ?? 0}
              </p>
            </div>
            <Eye size={16} className="text-orange-200" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-900 mb-3">
          Stage Progress
        </h3>
        <div className="space-y-2">
          {sellerStages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium ${(seller as any).stage === stage.id ? "bg-blue-600 text-white" : sellerStages.findIndex((s) => s.id === (seller as any).stage) > index ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {sellerStages.findIndex((s) => s.id === (seller as any).stage) >
                  index ? (
                  <CheckCircle size={12} />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-medium text-gray-900">
                  {stage.label}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-blue-600"
                    style={{
                      width:
                        (seller as any).stage === stage.id
                          ? `${(seller as any).stageProgress ?? 0}%`
                          : sellerStages.findIndex(
                            (s) => s.id === (seller as any).stage,
                          ) > index
                            ? "100%"
                            : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const getTabColor = (tabId: string) => {
    const colors: Record<string, string> = {
      overview: 'bg-blue-600 text-white',
      details: 'bg-indigo-600 text-white',
      buyers: 'bg-purple-600 text-white',
      activities: 'bg-green-600 text-white',
      followups: 'bg-orange-600 text-white',
      documents: 'bg-cyan-600 text-white',
      visits: 'bg-pink-600 text-white',
      deal: 'bg-amber-600 text-white',
      analytics: 'bg-teal-600 text-white',
    };
    return colors[tabId] || 'bg-blue-600 text-white';
  };

  return (
    <div className=" flex flex-col bg-gray-50 h-[calc(100vh-3.5rem)]  ">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={18} className="text-gray-500" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {safeString((seller as any).name).charAt(0) || ""}
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">
                    {(seller as any).salutation} {(seller as any).name}
                  </h1>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500">
                    <span>
                      {(seller as any).location ?? "—"},{" "}
                      {(seller as any).city ?? "—"}
                    </span>
                    <span>•</span>
                    <span>{(seller as any).source ?? "—"} Lead</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <span>
                  {currentIndex + 1} of {totalSellers}
                </span>
                <div className="flex">
                  <button
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                  </button>
                  <button
                    onClick={onNext}
                    disabled={currentIndex === totalSellers - 1}
                    className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <button
                onClick={() =>
                  window.open(
                    `tel:${((seller as any).phone || "").replace(/\D/g, "")}`,
                  )
                }
                className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
              >
                <Phone size={14} />
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/${((seller as any).phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${(seller as any).name}, this is regarding your property inquiry.`)}`,
                    "_blank",
                  )
                }
                className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
              >
                <MessageCircle size={14} />
              </button>
              <button
                onClick={() =>
                  window.open(
                    `mailto:${(seller as any).email ?? ""}?subject=${encodeURIComponent(`Regarding Your Property`)}`,
                    "_blank",
                  )
                }
                className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
              >
                <Mail size={14} />
              </button>
              <button
                onClick={() => {
                  if (!canUpdateSeller) {
                    toast.error("No permission to edit");
                    return;
                  }
                  onEdit(seller);
                }}
                disabled={!canUpdateSeller}
                className={`p-1.5 rounded-lg ${canUpdateSeller ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                <Edit size={14} />
              </button>
            </div>
          </div>
          {(fuLoading || fuError) && (
            <div className="mt-2 text-[9px]">
              {fuLoading && (
                <span className="text-blue-600">Syncing follow-ups…</span>
              )}
              {fuError && <span className="text-red-500">• {fuError}</span>}
            </div>
          )}

          {/* Tabs */}
          {/* Tabs - With Background Colors */}
          <div className="mt-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                const getActiveStyles = (tabId: string) => {
                  const styles: Record<string, string> = {
                    overview: 'bg-blue-100 text-blue-700 border-blue-200',
                    details: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                    buyers: 'bg-purple-100 text-purple-700 border-purple-200',
                    activities: 'bg-green-100 text-green-700 border-green-200',
                    followups: 'bg-orange-100 text-orange-700 border-orange-200',
                    documents: 'bg-cyan-100 text-cyan-700 border-cyan-200',
                    visits: 'bg-pink-100 text-pink-700 border-pink-200',
                    deal: 'bg-amber-100 text-amber-700 border-amber-200',
                    analytics: 'bg-teal-100 text-teal-700 border-teal-200',
                  };
                  return styles[tabId] || 'bg-blue-100 text-blue-700 border-blue-200';
                };

                const getInactiveStyles = (tabId: string) => {
                  const styles: Record<string, string> = {
                    overview: 'hover:bg-blue-50 hover:text-blue-600',
                    details: 'hover:bg-indigo-50 hover:text-indigo-600',
                    buyers: 'hover:bg-purple-50 hover:text-purple-600',
                    activities: 'hover:bg-green-50 hover:text-green-600',
                    followups: 'hover:bg-orange-50 hover:text-orange-600',
                    documents: 'hover:bg-cyan-50 hover:text-cyan-600',
                    visits: 'hover:bg-pink-50 hover:text-pink-600',
                    deal: 'hover:bg-amber-50 hover:text-amber-600',
                    analytics: 'hover:bg-teal-50 hover:text-teal-600',
                  };
                  return styles[tabId] || 'hover:bg-blue-50 hover:text-blue-600';
                };

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2 py-2 text-sm font-medium transition-all rounded-lg border ${isActive
                      ? getActiveStyles(tab.id)
                      : `text-gray-500 border-transparent ${getInactiveStyles(tab.id)}`
                      }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${isActive ? 'bg-white/50 text-inherit' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "activities" && renderActivitiesTab()}
        {activeTab === "followups" &&
          (!canViewFollowups ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-xs text-gray-600">
                No permission to view follow-ups
              </p>
            </div>
          ) : (
            <SellerFollowupsTab
              seller={currentSeller || seller}
              followups={localFollowups.length > 0 ? localFollowups : (((seller as any).followups as Followup[]) || [])}
              onAddFollowup={() => {
                if (!canCreateFollowups) {
                  toast.error("No permission");
                  return;
                }
                setEditingFollowup(null);
                setShowFollowupModal(true);
              }}
              onEditFollowup={(f) => {
                if (!canUpdateFollowups) {
                  toast.error("No permission");
                  return;
                }
                setEditingFollowup(f);
                setShowFollowupModal(true);
              }}
              onDeleteFollowup={handleDeleteFollowup}
              canCreate={canCreateFollowups}
              canUpdate={canUpdateFollowups}
              canDelete={canDeleteFollowups}
            />
          ))}
        {activeTab === "documents" && renderDocumentsTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 z-20 bg-white border-t border-gray-200 mt-5">
        <div className="px-4 py-2 sm:py-2.5">

          {/* DESKTOP VIEW - unchanged */}
          <div className="hidden sm:flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowStageUpdateModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                <TrendingUp size={12} />
                <span>Update Stage</span>
              </button>
              <button
                onClick={() => setShowSharingModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                <Share size={12} />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-1.5 text-[10px] bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Eye size={12} />
                <span>Track</span>
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  if (!canCreateFollowups) {
                    toast.error("No permission");
                    return;
                  }
                  setShowFollowupModal(true);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${canCreateFollowups ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                <CalendarIcon size={12} />
                <span>Follow-up</span>
              </button>
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setShowActivityModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-green-600 text-white hover:bg-green-700"
              >
                <Plus size={12} />
                <span>Add Activity</span>
              </button>
              <button
                onClick={() => setShowVisitModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium bg-orange-600 text-white hover:bg-orange-700"
              >
                <CalendarIcon size={12} />
                <span>Schedule Visit</span>
              </button>
            </div>
          </div>

          {/* MOBILE VIEW */}
          <div className="flex flex-col gap-1.5 sm:hidden">

            {/* Row 1 - Left buttons centered */}
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => setShowStageUpdateModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-purple-600 text-white"
              >
                <TrendingUp size={11} />
                <span>Update Stage</span>
              </button>
              <button
                onClick={() => setShowSharingModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-blue-600 text-white"
              >
                <Share size={11} />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-gray-600 text-white rounded-lg">
                <Eye size={11} />
                <span>Track</span>
              </button>
            </div>

            {/* Row 2 - Right buttons full width */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  if (!canCreateFollowups) {
                    toast.error("No permission");
                    return;
                  }
                  setShowFollowupModal(true);
                }}
                className={`flex items-center justify-center gap-1 px-1 py-1 rounded-lg text-[10px] font-medium ${canCreateFollowups ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                <CalendarIcon size={11} />
                <span>Follow-up</span>
              </button>
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setShowActivityModal(true);
                }}
                className="flex items-center justify-center gap-1 px-1 py-1 rounded-lg text-[10px] font-medium bg-green-600 text-white"
              >
                <Plus size={11} />
                <span>Add Activity</span>
              </button>
              <button
                onClick={() => setShowVisitModal(true)}
                className="flex items-center justify-center gap-1 px-1 py-1 rounded-lg text-[10px] font-medium bg-orange-600 text-white"
              >
                <CalendarIcon size={11} />
                <span>Schedule Visit</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showStageUpdateModal && (
        <SellerStageUpdateModal
          isOpen={showStageUpdateModal}
          onClose={() => setShowStageUpdateModal(false)}
          seller={seller}
          onUpdateStage={handleStageUpdate}
        />
      )}
      {showSharingModal && (
        <SellerSharingModal
          isOpen={showSharingModal}
          onClose={() => setShowSharingModal(false)}
          seller={seller}
          onShare={() => setShowSharingModal(false)}
        />
      )}
      {/* Seller Follow-up Modal Placeholder (Ready for new integration) */}
      {showActivityModal && (
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
          }}
          activity={editingActivity}
          onSave={handleAddActivity}
        />
      )}
      {showVisitModal && (
        <VisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          visit={null}
          onSave={handleAddVisit}
          buyer={{
            id: (seller as any).id ?? "",
            name: (seller as any).name ?? "",
          }}
        />
      )}
      {showPropertyForm && (
        <PropertyFormModal
          isOpen={showPropertyForm}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
          onSubmit={handleAddProperty}
          mode={
            editingProperty && (editingProperty as any).id ? "edit" : "create"
          }
          propertyId={(editingProperty as any)?.id}
          initialData={
            editingProperty ?? {
              seller: `${(seller as any)?.salutation ?? ""} ${(seller as any)?.name ?? ""}`,
            }
          }
        />
      )}

      {/* Link Property Modal */}
      <LinkPropertyModal
        isOpen={showLinkPropertyModal}
        onClose={() => setShowLinkPropertyModal(false)}
        onSelectProperty={handleLinkProperty}
        onUnlinkProperty={handleUnlinkPropertyObj}
        linkingSeller={seller}
        onCreatePropertyClick={openPropertyFormForCreate}
      />

      {/* Property Create/Edit Modal */}
      {showPropertyForm && (
        <PropertyFormModal
          isOpen={showPropertyForm}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
          mode={editingProperty?.id ? "edit" : "create"}
          propertyId={editingProperty?.id || editingProperty?.property_id}
          initialData={{
            seller: (seller as any)?.name || "",
            sellerId: (seller as any)?.id || "",
            ...(editingProperty || {}),
          }}
          onSubmit={handleAddProperty}
        />
      )}

      {/* Seller Follow-up Modal */}
      <FollowUpModal
        open={showFollowupModal}
        mode={editingFollowup ? "edit" : "add"}
        currentFollowUp={editingFollowup ? (editingFollowup.raw ?? editingFollowup) : null}
        entityData={seller}
        initialEntityCode="SELLER"
        initialEntityId={(seller as any)?.id}
        initialEntityName={(seller as any)?.name}
        initialEntityPhone={(seller as any)?.phone}
        initialStageCode={(seller as any)?.stage}
        initialStatusCode={(seller as any)?.status}
        initialAssignedTo={(seller as any)?.assigned_to_name || (seller as any)?.assigned_to || (seller as any)?.assigned_executive_name || (seller as any)?.assigned_executive}
        initialAttemptNo={editingFollowup ? (editingFollowup.attempt_no || 1) : (((seller as any)?.followups?.length || 0) + 1)}
        onClose={() => {
          setShowFollowupModal(false);
          setEditingFollowup(null);
        }}
        onSaved={() => {
          setShowFollowupModal(false);
          setEditingFollowup(null);
          if (fetchFollowups) fetchFollowups();
        }}
      />
    </div>
  );
};

function safeNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}
function ensureArray(value: any): any[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string")
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return [value];
}

export default SellerViewPage;
