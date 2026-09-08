

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
} from "lucide-react";

import SellerStageUpdateModal from "./SellerStageUpdateModal";
import SellerSharingModal from "./SellerSharingModal";
import ActivityModal from "../buyers/ActivityModal";
import VisitModal from "../buyers/VisitModal";
import PropertyFormModal from "@/pages/dashboard/components/PropertyFormModal";
import LinkPropertyModal from "./LinkPropertyModal";
import { FollowUpModal } from "@/pages/settings/master/FollowUpModal";
import { sellerFollowupAPI } from "@/lib/sellerFollowupAPI";
import { sellerAPI } from "@/lib/sellersAPI";
import { useProperties } from "@/hooks/properties";
import { propertiesAPI } from "@/lib/propertiesAPI";
import { getImageUrl } from "@/lib/helpers";
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
  sellerId?: string | number | null;
  assignedExecutive?: string | number | null;
  completedDate?: string | null;
  outcome_name?: string | null;
  outcome_id?: number | string | null;
  outcomeId?: number | string | null;
  custom_remark?: string | null;
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
  switch (t) {
    case "Phone Call":
      return <Phone size={12} className="text-blue-600" />;
    case "WhatsApp":
      return <MessageCircle size={12} className="text-green-600" />;
    case "Email":
      return <Mail size={12} className="text-indigo-600" />;
    default:
      return <Tag size={12} className="text-gray-500" />;
  }
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-[11px] ${activeTab === "sales" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Seller Follow-ups {salesCount > 0 && `(${salesCount})`}
          </button>
          <button
            onClick={() => setActiveTab("presales")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-[11px] ${activeTab === "presales" ? "bg-purple-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Pre-Sales History {presalesCount > 0 && `(${presalesCount})`}
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${canCreate ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          <Plus size={12} />
          <span>Add Follow-up</span>
        </button>
      </div>

      {filteredFollowups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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

            const createdByVal = f.createdByName || f.createdBy || ((f as any).created_by ? `User #${(f as any).created_by}` : "Admin");
            const assignedToVal = f.assignedExecutiveName || f.assignedTo || "Unassigned";

            return (
              <div key={idKey} className="h-full">
                <div
                  className={`h-full bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all border-l-4 ${cardBorder(f.priority ?? undefined)}`}
                >
                  {/* Top Bar: Channel Badge, Stage, Status, Priority, Action Buttons */}
                  <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-gray-100 flex-wrap">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-orange-100 text-orange-800 flex items-center gap-1">
                        {typeIcon(f.followupType || f.followup_type || f.type || undefined)}
                        <span>{f.followupType || f.followup_type || f.type || 'Phone Call'}</span>
                      </span>

                      {stageVal && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Stage: {stageVal}
                        </span>
                      )}

                      {statusVal && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Status: {statusVal}
                        </span>
                      )}

                      {priorityBadge(f.priority ?? undefined)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (!canUpdate) {
                            toast.error("No permission to edit");
                            return;
                          }
                          onEditFollowup(f);
                        }}
                        disabled={!canUpdate || f.category === "presales"}
                        className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors disabled:opacity-40"
                        title={f.category === "presales" ? "Cannot edit pre-sales" : "Edit Follow-up"}
                      >
                        <Pencil size={13} />
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
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        title={f.category === "presales" ? "Cannot delete pre-sales" : "Delete Follow-up"}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1.5 text-xs">
                    {/* Outcome & Custom Remark */}
                    {outcomeVal && (
                      <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-2 text-gray-800">
                        <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wider mb-0.5">
                          Outcome / Remarks:
                        </span>
                        <p className="text-[11px] leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
                          {outcomeVal}
                        </p>
                      </div>
                    )}

                    {/* Next Action */}
                    {f.nextAction && (
                      <div className="flex items-center gap-2 bg-orange-50/80 border border-orange-200/80 rounded-lg px-2.5 py-1.5 text-xs">
                        <span className="font-bold text-orange-900 whitespace-nowrap flex items-center gap-1">
                          ⚡ Next Action:
                        </span>
                        <span className="font-semibold text-orange-700 truncate">
                          {f.nextAction}
                        </span>
                      </div>
                    )}

                    {/* Scheduled Date & Time */}
                    {schedFormatted && (
                      <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 text-xs text-emerald-900">
                        <CalendarIcon size={13} className="text-emerald-600 flex-shrink-0" />
                        <span className="font-medium text-[11px]">Scheduled:</span>
                        <span className="font-bold text-[11px] text-emerald-700">
                          {schedFormatted}
                        </span>
                      </div>
                    )}

                    {/* Footer Audit Metadata: Created By, Assigned To, Created At, Updated At */}
                    <div className="pt-2 mt-2 border-t border-dashed border-gray-200 flex flex-wrap items-center justify-between text-[10px] text-gray-500 gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <UserIcon size={11} className="text-gray-400" />
                          <span>Created by:</span>
                          <strong className="text-gray-700 font-semibold">{createdByVal}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>Assigned to:</span>
                          <strong className="text-gray-700 font-semibold">{assignedToVal}</strong>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {f.createdAt && (
                          <span>Created: {fmtDateTimeHuman(f.createdAt)}</span>
                        )}
                        {f.updatedAt && f.updatedAt !== f.createdAt && (
                          <span>Updated: {fmtDateTimeHuman(f.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CalendarIcon size={36} className="mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            No {activeTab === "sales" ? "Seller" : "Pre-Sales"} follow-ups yet
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            {activeTab === "sales"
              ? "Plan your first seller follow-up"
              : "Transferred follow-ups appear here"}
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
              className="px-3 py-1.5 text-[11px] rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
  const [selectedPropIds, setSelectedPropIds] = useState<string[]>([]);
  const { properties: availableProperties = [], loadingProps } = useProperties({ autoLog: false });
  const sellerRef = React.useRef(seller);
  useEffect(() => { sellerRef.current = seller; }, [seller]);

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
      count: ((seller as any).followups as Followup[] | undefined)?.length || 0,
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
      reminder: Number(row?.reminder ?? 0) as 0 | 1,
      created_at: row?.created_at ?? row?.createdAt,
      updated_at: row?.updated_at ?? row?.updatedAt,
      created_by: row?.created_by ?? row?.createdBy,
      updated_by: row?.updated_by ?? row?.updatedBy,
      createdByName: row?.created_by_name ?? row?.createdByName ?? (row?.created_by ? `User #${row.created_by}` : null),
      updatedByName: row?.updated_by_name ?? row?.updatedByName,
      assignedExecutiveName:
        row?.assigned_executive_name ?? row?.assignedExecutiveName ?? (seller as any)?.assigned_to_name ?? (seller as any)?.assigned ?? null,
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

  const pushFollowupsIntoSeller = useCallback(
    (rows: any[]) => {
      const mapped = (rows || []).map(normalizeFromApi);
      const updatedSeller: AnyObj = {
        ...(seller as AnyObj),
        followups: mapped,
      };
      onUpdateSeller(updatedSeller);
    },
    [seller, onUpdateSeller],
  );
  const fetchFollowups = useCallback(async () => {
    if (!sellerIdVal) return;
    try {
      setFuError(null);
      setFuLoading(true);
      sellerFollowupAPI.clearCache();
      const res = await sellerFollowupAPI.getAll({
        sellerId: sellerIdVal as any,
        page: 1,
        limit: 200,
      });
      const rows =
        res && typeof res === "object" && "data" in res ? res.data : res;
      pushFollowupsIntoSeller(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.error("Failed to load seller followups:", e);
      setFuError(e?.message || "Failed to load follow-ups");
      pushFollowupsIntoSeller([]);
    } finally {
      setFuLoading(false);
    }
  }, [sellerIdVal, pushFollowupsIntoSeller]);

  useEffect(() => {
    if (sellerId) fetchFollowups();
  }, [sellerId]);

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
    const updatedSeller = {
      ...(seller as AnyObj),
      followups: ((seller as AnyObj).followups as Followup[] | undefined)
        ? ((seller as AnyObj).followups as Followup[]).some(
          (f) => f.id === followupData.id,
        )
          ? ((seller as AnyObj).followups as Followup[]).map((f) =>
            f.id === followupData.id ? followupData : f,
          )
          : [...((seller as AnyObj).followups as Followup[]), followupData]
        : [followupData],
    };
    onUpdateSeller(updatedSeller);
  };
  const handleDeleteFollowupLocal = (f: Followup) => {
    const updatedSeller = {
      ...(seller as AnyObj),
      followups: (((seller as AnyObj).followups as Followup[]) || []).filter(
        (x) => String(x.id) !== String(f.id),
      ),
    };
    onUpdateSeller(updatedSeller);
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
        const res = await sellerFollowupAPI.update(
          editingFollowup.id,
          apiPayload
        );
        const normalized = normalizeFromApi(res ?? apiPayload);
        upsertFollowupLocal(normalized);
      } else {
        const res = await sellerFollowupAPI.create(apiPayload);
        const normalized = normalizeFromApi(res ?? apiPayload);
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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this follow-up. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(15, 43, 61, 0.45)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton:
          "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton:
          "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      setFuError(null);
      setFuLoading(true);
      await sellerFollowupAPI.remove(f.id);
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

    return (
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium text-gray-500 uppercase">
                  Visits
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {(seller as any).visits ?? 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye size={14} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium text-gray-500 uppercase">
                  Buyers
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {(seller as any).interestedBuyers ?? 0}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={14} className="text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium text-gray-500 uppercase">
                  Properties
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {sellerProps.length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Building size={14} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-medium text-gray-500 uppercase">
                  Activities
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {((seller as any).activities || []).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity size={14} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              Stage Progress
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                {currentStage.label}
              </span>
              <span className="text-xs font-bold text-blue-600">
                {(seller as any).stageProgress ?? 0}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-blue-600"
              style={{ width: `${(seller as any).stageProgress ?? 0}%` }}
            />
          </div>
        </div>

        {/* Personal & Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
              <UserIcon size={13} className="text-orange-500" />
              <span>Seller Personal & Contact Information</span>
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${(seller as any).isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
                }`}
            >
              {(seller as any).status ?? ((seller as any).isActive ? "Active" : "Inactive")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500">Full Name</p>
                <p className="text-xs font-semibold text-gray-900">
                  {(seller as any).salutation ? `${(seller as any).salutation} ` : ""}
                  {(seller as any).name || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500">Phone Number</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-900">
                    {(seller as any).phone || "—"}
                  </span>
                  {(seller as any).phone && (seller as any).phone !== "-" && (
                    <a
                      href={`tel:${String((seller as any).phone).replace(/\D/g, "")}`}
                      className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      title="Call"
                    >
                      <Phone size={10} />
                    </a>
                  )}
                </div>
              </div>
              {(seller as any).whatsapp && (
                <div>
                  <p className="text-[10px] font-medium text-gray-500">WhatsApp</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {(seller as any).whatsapp}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-medium text-gray-500">Email Address</p>
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {(seller as any).email || "—"}
                </p>
              </div>
              {(seller as any).seller_dob && (
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Date of Birth</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {fmtDateDDMMYYYY(parseSqlish((seller as any).seller_dob) as Date) || (seller as any).seller_dob}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-[10px] font-medium text-gray-500">Location / Address</p>
                <p className="text-xs font-semibold text-gray-900">
                  {[
                    (seller as any).location,
                    (seller as any).city,
                    (seller as any).state,
                  ]
                    .filter((x) => x && x !== "-")
                    .join(", ") || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500">Lead Source</p>
                <p className="text-xs font-semibold text-gray-900">
                  {(seller as any).source || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500">Priority</p>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${priorityBadge((seller as any).priority)
                    }`}
                >
                  {(seller as any).priority || "—"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500">Assigned Executive</p>
                <p className="text-xs font-semibold text-gray-900">
                  {(seller as any).assigned_to_name || (seller as any).assigned || "Unassigned"}
                </p>
              </div>
              {(seller as any).notes && (
                <div>
                  <p className="text-[10px] font-medium text-gray-500">Notes</p>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {(seller as any).notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Portfolio with 2 Options (Link Property & Add Property) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Building size={13} className="text-blue-600" />
                <span>Properties Portfolio</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {sellerProps.length}
              </span>
            </div>

            {/* TWO OPTIONS: LINK PROPERTY & ADD PROPERTY */}
            <div className="flex items-center gap-2">
              {selectedPropIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleBulkUnlinkProperties(selectedPropIds)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors shadow-sm animate-pulse"
                >
                  Unlink Selected ({selectedPropIds.length})
                </button>
              )}
              <button
                onClick={() => {
                  setLinkPropertySearch("");
                  setShowLinkPropertyModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <Link2 size={12} />
                <span>Link Property</span>
              </button>
              <button
                onClick={openPropertyFormForCreate}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={12} />
                <span>Add Property</span>
              </button>
            </div>
          </div>

          {sellerProps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
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
                    className="border border-gray-200 rounded-lg p-2.5 hover:shadow-sm transition-shadow bg-white flex gap-2.5 items-center justify-between"
                  >
                    <div className="flex gap-2.5 items-center min-w-0 flex-1">
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
                        className="accent-orange-500 h-3.5 w-3.5 mr-1 cursor-pointer"
                      />
                      <div className="flex gap-2.5 items-center min-w-0 flex-1">
                      {photo ? (
                        <img
                          src={photo}
                          alt={title}
                          className="w-14 h-12 object-cover rounded-md flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)?.classList?.remove('hidden'); }}
                        />
                      ) : null}
                      <div className={`w-14 h-12 rounded-md bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 flex-shrink-0 ${photo ? 'hidden' : ''}`}>
                        No Pic
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-semibold truncate text-gray-900">
                          {title}
                        </h4>
                        <p className="text-[10px] truncate text-gray-500">
                          {address}
                        </p>
                        {price && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : `₹${price}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openPropertyFormForEdit(property)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-orange-600 transition-colors"
                        title="Edit Property"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleUnlinkProperty(index)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
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
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <Building size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-gray-500 font-medium mb-1">
                No properties linked yet
              </p>
              <p className="text-[10px] text-gray-400 mb-3 max-w-sm mx-auto">
                You can link an existing property from your catalog or create a fresh new property for this seller.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setLinkPropertySearch("");
                    setShowLinkPropertyModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                >
                  <Link2 size={12} />
                  <span>Link Existing Property</span>
                </button>
                <button
                  onClick={openPropertyFormForCreate}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus size={12} />
                  <span>Add New Property</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Property Photos Gallery */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
              <Camera size={13} className="text-purple-600" />
              <span>Property Photos</span>
            </h3>
            <button
              onClick={openPropertyFormForCreate}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Camera size={12} />
              <span>Add Photos</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(((seller as any).properties?.[0]?.photos ?? []) as any[])
              .slice(0, 3)
              .map((photo: any, index: number) => {
                const src = typeof photo === "string" ? photo : photo?.url || photo?.path;
                return (
                  <div
                    key={index}
                    className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden"
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
              className="border-2 border-dashed border-gray-300 rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              <div className="text-center">
                <Camera size={20} className="mx-auto mb-1 text-gray-400" />
                <span className="text-[10px] text-gray-500">Add Photo</span>
              </div>
            </div>
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
              seller={seller}
              followups={((seller as any).followups as Followup[]) || []}
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
        initialEntityCode="SELLER"
        initialEntityId={(seller as any)?.id}
        initialEntityName={(seller as any)?.name}
        initialEntityPhone={(seller as any)?.phone}
        initialStageCode={(seller as any)?.stage}
        initialStatusCode={(seller as any)?.status}
        initialAssignedTo={(seller as any)?.assigned_to_name || (seller as any)?.assigned_to || (seller as any)?.assigned_executive_name || (seller as any)?.assigned_executive}
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
