import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  X,
  MoreHorizontal,
  Award,
  Clock,
  Users,
  Wrench,
  Palette,
  Hammer,
  Home,
  Droplets,
  Zap,
  Settings,
  Grid,
  List,
  Download,
  Send,
  Check,
  Crown,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  Briefcase,
} from "lucide-react";
import VendorFormModal from "../../components/vendors/VendorFormModal";
import { vendorsAPI } from "../../lib/vendorsAPI";
import { sellerAPI } from "@/lib/sellersAPI";
import { buyerAPI } from "@/lib/buyerAPI";

type Service = {
  name: string;
  rate: string;
  unit: string;
  description?: string;
};

type Availability = {
  days: string[];
  startTime: string;
  endTime: string;
  weeklyOff: string;
};

export type Vendor = {
  id: number;
  salutation?: string;
  name: string;
  businessName?: string;
  category: string;
  countryCode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  rating?: number;
  experience?: number;
  verified?: boolean;
  reExpertVerified?: boolean;
  reSuggested?: boolean;
  services: Service[];
  tags: string[];
  rateIdea?: string;
  portfolio?: string[];
  description?: string;
  availability?: Availability;
  languages?: string[];
  certifications?: string[];
  completedProjects?: number;
  responseTime?: string;
  created_at?: string;
  lastActive?: string;
  status?: "active" | "inactive" | string;
};

type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  count: number;
  color: string;
};

/* ============================================================
   PREMIUM TOAST SYSTEM
   ============================================================ */

type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const ToastContext = React.createContext<{
  showToast: (toast: Omit<Toast, "id">) => string;
  updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
  dismissToast: (id: string) => void;
}>({
  showToast: () => "",
  updateToast: () => {},
  dismissToast: () => {},
});

const useToast = () => React.useContext(ToastContext);

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  switch (type) {
    case "success":
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="text-white" size={18} />
        </div>
      );
    case "error":
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <XCircle className="text-white" size={18} />
        </div>
      );
    case "loading":
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-500/30">
          <Loader2 className="text-white animate-spin" size={18} />
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <AlertCircle className="text-white" size={18} />
        </div>
      );
  }
};

const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (toast.type === "loading" || !toast.duration) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [toast.duration, toast.type, toast.id, onDismiss]);

  const accent =
    toast.type === "success"
      ? "from-emerald-500 to-emerald-600"
      : toast.type === "error"
        ? "from-red-500 to-red-600"
        : toast.type === "loading"
          ? "from-slate-600 to-slate-800"
          : "from-blue-500 to-blue-600";

  return (
    <div
      className={`pointer-events-auto w-[380px] max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-200/80 overflow-hidden transition-all duration-500 ease-out ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3 p-3.5">
        <ToastIcon type={toast.type} />
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-[12px] text-slate-500 mt-0.5 leading-snug break-words">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
      {toast.type !== "loading" && toast.duration && (
        <div className="h-[3px] bg-slate-100 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${accent} transition-[width] duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {toast.type === "loading" && (
        <div className="h-[3px] bg-slate-100 overflow-hidden">
          <div
            className={`h-full w-1/3 bg-gradient-to-r ${accent} animate-[shimmer_1.2s_ease-in-out_infinite]`}
          />
        </div>
      )}
    </div>
  );
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = {
      id,
      duration: toast.type === "loading" ? undefined : 4000,
      ...toast,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const updateToast = useCallback(
    (id: string, updates: Partial<Omit<Toast, "id">>) => {
      setToasts((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...updates,
                duration:
                  updates.type === "loading"
                    ? undefined
                    : (updates.duration ?? 4000),
              }
            : t,
        ),
      );
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast, updateToast, dismissToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

/* ============================================================
   EMAIL STATUS MODAL (PREMIUM)
   ============================================================ */

type EmailStatus = "idle" | "sending" | "success" | "error";

const PremiumEmailModal: React.FC<{
  isOpen: boolean;
  status: EmailStatus;
  recipientName?: string;
  recipientEmail?: string;
  vendorCount: number;
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
}> = ({
  isOpen,
  status,
  recipientName,
  recipientEmail,
  vendorCount,
  errorMessage,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  const config = {
    sending: {
      gradient: "from-[#0E3658] via-[#163d5d] to-[#0F6E7B]",
      iconBg: "from-slate-600 to-slate-800",
      icon: <Loader2 className="text-white animate-spin" size={26} />,
      title: "Sending Email",
      subtitle: `Preparing vendor recommendation for ${recipientName || "recipient"}...`,
    },
    success: {
      gradient: "from-emerald-500 via-emerald-600 to-teal-600",
      iconBg: "from-emerald-400 to-emerald-600",
      icon: <CheckCircle2 className="text-white" size={28} />,
      title: "Email Sent Successfully",
      subtitle: `Vendor recommendation delivered to ${recipientName || recipientEmail}.`,
    },
    error: {
      gradient: "from-rose-500 via-red-500 to-red-600",
      iconBg: "from-rose-400 to-red-600",
      icon: <XCircle className="text-white" size={28} />,
      title: "Email Could Not Be Sent",
      subtitle:
        errorMessage ||
        "Something went wrong while sending the email. Please try again.",
    },
    idle: {
      gradient: "from-[#0E3658] to-slate-900",
      iconBg: "from-slate-600 to-slate-800",
      icon: <Mail className="text-white" size={26} />,
      title: "Email",
      subtitle: "",
    },
  }[status];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop with brand color tint */}
      <div
        className="fixed inset-0 bg-[#0E3658]/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={status === "sending" ? undefined : onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-[popIn_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
        <div
          className={`relative bg-gradient-to-br ${config.gradient} px-6 pt-8 pb-10 text-white overflow-hidden`}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-white/5" />

          <div className="relative flex flex-col items-center text-center">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-2xl ring-4 ring-white/20 mb-4`}
            >
              {config.icon}
            </div>
            <h3 className="text-xl font-bold tracking-tight">{config.title}</h3>
            <p className="text-[13px] text-white/85 mt-1.5 max-w-xs leading-snug">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="-mt-6 bg-white rounded-t-3xl relative px-6 pt-5 pb-6">
          {status === "sending" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-slate-500 font-medium">
                  Sending to recipient
                </span>
                <span className="text-slate-800 font-bold">
                  {vendorCount} vendor{vendorCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-[#0E3658] to-[#1a4a7a] rounded-full animate-[shimmerBar_1.4s_ease-in-out_infinite]" />
              </div>
              <p className="text-[11.5px] text-slate-400 text-center pt-1">
                Please wait while we securely deliver your message.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Mail className="text-emerald-600" size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                      Delivered to
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {recipientName || "Recipient"}
                    </p>
                    {recipientEmail && (
                      <p className="text-[11.5px] text-slate-500 truncate">
                        {recipientEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[12px] text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                <Users size={14} className="text-slate-400 shrink-0" />
                <span>
                  <strong className="text-slate-800">{vendorCount}</strong>{" "}
                  vendor{vendorCount === 1 ? "" : "s"} included in this
                  recommendation
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#0E3657] hover:bg-[#1a4a7a] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-red-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="text-red-500 shrink-0 mt-0.5"
                    size={18}
                  />
                  <p className="text-[12.5px] text-slate-600 leading-snug">
                    {errorMessage ||
                      "We couldn't deliver the email. This could be a temporary network issue or an invalid recipient address."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors active:scale-[0.98]"
                >
                  Close
                </button>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmerBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

/* ============================================================
   REST OF YOUR CODE
   ============================================================ */

const getCategories = (
  totalVendors: number,
  categoryCounts: Record<string, number>,
): Category[] => [
  {
    id: "all",
    label: "All Vendors",
    icon: Settings,
    count: totalVendors,
    color: "blue",
  },
  {
    id: "plumber",
    label: "Plumber",
    icon: Wrench,
    count: categoryCounts["Plumber"] || 0,
    color: "blue",
  },
  {
    id: "tiles",
    label: "Tiles & Flooring",
    icon: Home,
    count: categoryCounts["Tiles & Flooring"] || 0,
    color: "green",
  },
  {
    id: "painter",
    label: "Painter",
    icon: Palette,
    count: categoryCounts["Painter"] || 0,
    color: "purple",
  },
  {
    id: "carpenter",
    label: "Carpenter",
    icon: Hammer,
    count: categoryCounts["Carpenter"] || 0,
    color: "orange",
  },
  {
    id: "interior",
    label: "Interior Designer",
    icon: Home,
    count: categoryCounts["Interior Designer"] || 0,
    color: "pink",
  },
  {
    id: "waterproofing",
    label: "Water Proofing",
    icon: Droplets,
    count: categoryCounts["Water Proofing"] || 0,
    color: "cyan",
  },
  {
    id: "electrician",
    label: "Electrician",
    icon: Zap,
    count: categoryCounts["Electrician"] || 0,
    color: "yellow",
  },
];

const colorClassMap: Record<
  string,
  { bg: string; text: string; pillBg: string; iconText?: string; ring?: string }
> = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    pillBg: "bg-blue-200",
    iconText: "text-blue-600",
    ring: "ring-blue-200",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-700",
    pillBg: "bg-green-200",
    iconText: "text-green-600",
    ring: "ring-green-200",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    pillBg: "bg-purple-200",
    iconText: "text-purple-600",
    ring: "ring-purple-200",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    pillBg: "bg-orange-200",
    iconText: "text-orange-600",
    ring: "ring-orange-200",
  },
  pink: {
    bg: "bg-pink-100",
    text: "text-pink-700",
    pillBg: "bg-pink-200",
    iconText: "text-pink-600",
    ring: "ring-pink-200",
  },
  cyan: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    pillBg: "bg-cyan-200",
    iconText: "text-cyan-600",
    ring: "ring-cyan-200",
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    pillBg: "bg-yellow-200",
    iconText: "text-yellow-600",
    ring: "ring-yellow-200",
  },
  default: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    pillBg: "bg-gray-200",
    iconText: "text-gray-600",
    ring: "ring-gray-200",
  },
};

type SortKey = "rating" | "experience" | "name";

interface LocalFilters {
  category: string;
  status: string;
  verifiedOnly: boolean;
  reExpertOnly: boolean;
  reSuggestedOnly: boolean;
  minRating: number;
  minExperience: number;
  sortBy: SortKey;
}

const DEFAULT_LOCAL_FILTERS: LocalFilters = {
  category: "all",
  status: "all",
  verifiedOnly: false,
  reExpertOnly: false,
  reSuggestedOnly: false,
  minRating: 0,
  minExperience: 0,
  sortBy: "rating",
};

const normalizeVendorCategory = (value?: string) => {
  const normalized = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");

  const categoryMap: Record<string, string> = {
    "tiles-flooring": "tiles",
    "interior-designer": "interior",
    "water-proofing": "waterproofing",
  };

  return categoryMap[normalized] || normalized;
};

const normalizeVendorStatus = (value?: string) =>
  String(value || "")
    .toLowerCase()
    .trim();

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  vendorName: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, vendorName, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <Trash2 className="text-red-600" size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          Delete Vendor
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{vendorName}</span>? This action
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   RECIPIENT SHARE DIALOG (with search + bulk select)
   ============================================================ */

type RecipientRow = {
  id: string | number;
  name: string;
  phone: string;
  email: string;
  [key: string]: any;
};

const RecipientShareDialog: React.FC<{
  isOpen: boolean;
  rows: any[];
  loading: boolean;
  selectedVendorCount: number;
  activeType: "seller" | "buyer";
  onClose: () => void;
  onTypeChange: (type: "seller" | "buyer") => void;
  onEmail: (email?: string, name?: string, vendors?: Vendor[]) => void;
  onWhatsApp: (phone?: string, name?: string, vendors?: Vendor[]) => void;
  /** New: bulk send handlers */
  onBulkEmail?: (recipients: RecipientRow[]) => void;
  onBulkWhatsApp?: (recipients: RecipientRow[]) => void;
}> = ({
  isOpen,
  rows,
  loading,
  selectedVendorCount,
  activeType,
  onClose,
  onTypeChange,
  onEmail,
  onWhatsApp,
  onBulkEmail,
  onBulkWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set(),
  );

  // Reset state when dialog opens or type changes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedIds(new Set());
    }
  }, [isOpen, activeType]);

  const normalizedRows: RecipientRow[] = useMemo(() => {
    return (rows || []).map((row: any, idx: number) => {
      const id =
        row.id ??
        row._id ??
        row.seller_id ??
        row.buyer_id ??
        `${activeType}-${idx}`;
      const name =
        row.name ||
        row.full_name ||
        row.seller_name ||
        row.buyer_name ||
        "Unknown";
      const phone =
        row.phone ||
        row.mobile ||
        row.contact_no ||
        row.whatsapp ||
        row.contactNumber ||
        "—";
      const email =
        row.email || row.seller_email || row.buyer_email || row.mail || "—";
      return { ...row, id, name, phone, email };
    });
  }, [rows, activeType]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalizedRows;
    return normalizedRows.filter((row) => {
      return (
        String(row.name || "")
          .toLowerCase()
          .includes(term) ||
        String(row.phone || "")
          .toLowerCase()
          .includes(term) ||
        String(row.email || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [normalizedRows, searchTerm]);

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedIds.has(row.id));

  const someVisibleSelected =
    !allVisibleSelected && filteredRows.some((row) => selectedIds.has(row.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredRows.forEach((row) => next.delete(row.id));
      } else {
        filteredRows.forEach((row) => next.add(row.id));
      }
      return next;
    });
  };

  const toggleRow = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRows = useMemo(
    () => normalizedRows.filter((row) => selectedIds.has(row.id)),
    [normalizedRows, selectedIds],
  );

  const selectedCount = selectedRows.length;

  const clearSelection = () => setSelectedIds(new Set());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/50 flex flex-col max-h-[90vh] w-[min(1040px,calc(100vw-40px))] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-gradient-to-r from-[#0E3658] via-[#163d5d] to-[#0F6E7B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/12 border border-white/25 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">
                Share with {activeType === "seller" ? "Seller" : "Buyer"}
              </h3>
              <p className="text-[11px] text-slate-200 font-medium">
                {selectedVendorCount} vendor
                {selectedVendorCount === 1 ? "" : "s"} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close share dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Search + bulk bar */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeType === "seller" ? "sellers" : "buyers"} by name, phone, or email...`}
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  {selectedCount} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-50 border border-slate-200"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedCount > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 shrink-0 bg-[#0E3658] text-white flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>
                {selectedCount} {activeType === "seller" ? "seller" : "buyer"}
                {selectedCount === 1 ? "" : "s"} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBulkWhatsApp?.(selectedRows)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-[11px] font-bold transition-colors shadow-sm"
              >
                <MessageCircle size={13} />
                Send WhatsApp to All
              </button>
              <button
                onClick={() => onBulkEmail?.(selectedRows)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[11px] font-bold transition-colors shadow-sm"
              >
                <Mail size={13} />
                Send Email to All
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <Loader2
                className="animate-spin mx-auto mb-2 text-slate-400"
                size={20}
              />
              Loading {activeType === "seller" ? "sellers" : "buyers"}...
            </div>
          ) : normalizedRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No {activeType === "seller" ? "sellers" : "buyers"} found in the
              application.
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <Search size={22} className="mx-auto text-slate-300 mb-2" />
              No matches for "{searchTerm}".
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            someVisibleSelected && !allVisibleSelected;
                      }}
                      onChange={toggleSelectAllVisible}
                      className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 w-4 h-4 cursor-pointer"
                      aria-label="Select all visible recipients"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                    {activeType === "seller" ? "Seller" : "Buyer"} Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Contact No
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => {
                  const isChecked = selectedIds.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`transition-all ${
                        isChecked
                          ? "bg-slate-50 shadow-[inset_0_0_0_1px_rgba(14,54,88,0.10)]"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRow(row.id)}
                          className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 w-4 h-4 cursor-pointer"
                          aria-label={`Select ${row.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {row.phone}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {row.email}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onWhatsApp(
                                row.phone === "—" ? "" : row.phone,
                                row.name,
                                undefined,
                              )
                            }
                            className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[11px] font-bold hover:shadow-lg hover:shadow-emerald-600/20 transition-all"
                            title="Send WhatsApp"
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onEmail(
                                row.email === "—" ? "" : row.email,
                                row.name,
                                undefined,
                              )
                            }
                            className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[11px] font-bold hover:shadow-lg hover:shadow-blue-600/20 transition-all"
                            title="Send Email"
                          >
                            <Mail size={13} />
                            Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-white">
          <p className="text-[11px] font-semibold text-slate-500">
            {filteredRows.length} of {normalizedRows.length}{" "}
            {activeType === "seller" ? "seller" : "buyer"}
            {normalizedRows.length === 1 ? "" : "s"}
            {selectedCount > 0 && (
              <span className="ml-2 font-bold text-slate-700">
                · {selectedCount} selected
              </span>
            )}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0E3658] text-white rounded-xl text-sm font-bold transition-colors shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PREMIUM SELLER/BUYER CARD
   ============================================================ */

const PremiumRecipientCard: React.FC<{
  type: "seller" | "buyer";
  name: string;
  phone: string;
  email: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
}> = ({
  type,
  name,
  phone,
  email,
  isSelected,
  onToggleSelect,
  onWhatsApp,
  onEmail,
}) => {
  const isSeller = type === "seller";

  // Theme colors
  const theme = isSeller
    ? {
        gradient: "from-blue-600 via-blue-700 to-indigo-800",
        accent: "blue",
        badge: "bg-blue-100 text-blue-700",
        border: "border-blue-200",
        ring: "ring-blue-500/20",
        iconBg: "bg-blue-600",
        hover: "hover:border-blue-300 hover:shadow-blue-100",
        button: "bg-blue-600 hover:bg-blue-700",
      }
    : {
        gradient: "from-emerald-600 via-teal-700 to-cyan-800",
        accent: "emerald",
        badge: "bg-emerald-100 text-emerald-700",
        border: "border-emerald-200",
        ring: "ring-emerald-500/20",
        iconBg: "bg-emerald-600",
        hover: "hover:border-emerald-300 hover:shadow-emerald-100",
        button: "bg-emerald-600 hover:bg-emerald-700",
      };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isSelected
          ? `border-${theme.accent}-500 ring-4 ${theme.ring} shadow-xl`
          : `${theme.border} ${theme.hover} shadow-md hover:shadow-xl`
      }`}
    >
      {/* Selection indicator */}
      <div
        className={`absolute top-3 right-3 z-10 transition-all duration-200 ${
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full ${theme.iconBg} flex items-center justify-center shadow-lg`}
        >
          <Check className="text-white" size={14} strokeWidth={3} />
        </div>
      </div>

      {/* Gradient Header */}
      <div
        className={`relative bg-gradient-to-br ${theme.gradient} px-4 py-5 overflow-hidden`}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-6 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
            <span className="text-white font-bold text-lg tracking-wide">
              {initials}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                {isSeller ? <Briefcase size={10} /> : <User size={10} />}
                {type}
              </span>
            </div>
            <h3 className="text-white font-bold text-base leading-tight truncate">
              {name}
            </h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Contact Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-sm">
            <div
              className={`w-8 h-8 rounded-lg ${theme.badge} flex items-center justify-center shrink-0`}
            >
              <Phone size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Phone
              </p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-sm">
            <div
              className={`w-8 h-8 rounded-lg ${theme.badge} flex items-center justify-center shrink-0`}
            >
              <Mail size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Email
              </p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhatsApp();
            }}
            disabled={phone === "—"}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-200 ${
              phone === "—"
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-md shadow-green-600/20"
            }`}
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEmail();
            }}
            disabled={email === "—"}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-200 ${
              email === "—"
                ? "bg-gray-300 cursor-not-allowed"
                : `${theme.button} active:scale-[0.98] shadow-md shadow-${theme.accent}-600/20`
            }`}
          >
            <Mail size={14} />
            Email
          </button>
        </div>

        {/* Select Button */}
        <button
          onClick={onToggleSelect}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
            isSelected
              ? `bg-${theme.accent}-50 border-${theme.accent}-500 text-${theme.accent}-700`
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? `bg-${theme.accent}-500 border-${theme.accent}-500`
                : "border-gray-300"
            }`}
          >
            {isSelected && (
              <Check className="text-white" size={10} strokeWidth={4} />
            )}
          </div>
          {isSelected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
};

const VendorDirectoryPageInner: React.FC = () => {
  const { showToast, updateToast, dismissToast } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showVendorForm, setShowVendorForm] = useState<boolean>(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalVendors, setTotalVendors] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [recipientDialogOpen, setRecipientDialogOpen] =
    useState<boolean>(false);
  const [recipientRows, setRecipientRows] = useState<any[]>([]);
  const [recipientLoading, setRecipientLoading] = useState<boolean>(false);
  const [recipientType, setRecipientType] = useState<"seller" | "buyer">(
    "seller",
  );

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [emailRecipient, setEmailRecipient] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [emailError, setEmailError] = useState<string>("");
  const [lastEmailPayload, setLastEmailPayload] = useState<{
    email?: string;
    name?: string;
    vendors: Vendor[];
  } | null>(null);

  const [appliedFilters, setAppliedFilters] = useState<LocalFilters>(
    DEFAULT_LOCAL_FILTERS,
  );
  const [tempFilters, setTempFilters] = useState<LocalFilters>(
    DEFAULT_LOCAL_FILTERS,
  );
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [expandedServices, setExpandedServices] = useState<number | null>(null);
  const [expandedTags, setExpandedTags] = useState<number | null>(null);

  const categories = getCategories(totalVendors, categoryCounts);

  const loadVendorCounts = async () => {
    try {
      const data = await vendorsAPI.getCategoryCounts();
      setTotalVendors(data.total);
      const counts: Record<string, number> = {};
      data.categories.forEach((item) => {
        counts[item.category] = item.count;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error("Failed to load vendor counts:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendorData, countData] = await Promise.all([
          vendorsAPI.getAll(),
          vendorsAPI.getCategoryCounts(),
        ]);

        setVendors(vendorData);
        setTotalVendors(countData.total);

        const counts: Record<string, number> = {};
        countData.categories.forEach((item) => {
          counts[item.category] = item.count;
        });
        setCategoryCounts(counts);
      } catch (error) {
        console.error("Failed to load vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredVendors = vendors
    .filter((vendor) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        vendor.name.toLowerCase().includes(term) ||
        (vendor.businessName &&
          vendor.businessName.toLowerCase().includes(term)) ||
        vendor.services.some((service) =>
          service.name.toLowerCase().includes(term),
        ) ||
        vendor.tags.some((tag) => tag.toLowerCase().includes(term));
      const matchesCategory =
        selectedCategory === "all" ||
        normalizeVendorCategory(vendor.category) === selectedCategory;
      const matchesFilterCategory =
        appliedFilters.category === "all" ||
        normalizeVendorCategory(vendor.category) === appliedFilters.category;
      const matchesStatus =
        appliedFilters.status === "all" ||
        normalizeVendorStatus(vendor.status) === appliedFilters.status;

      if (appliedFilters.verifiedOnly && !vendor.verified) return false;
      if (appliedFilters.reExpertOnly && !vendor.reExpertVerified) return false;
      if (appliedFilters.reSuggestedOnly && !vendor.reSuggested) return false;
      if (
        appliedFilters.minRating > 0 &&
        (vendor.rating ?? 0) < appliedFilters.minRating
      )
        return false;
      if (
        appliedFilters.minExperience > 0 &&
        (vendor.experience ?? 0) < appliedFilters.minExperience
      )
        return false;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFilterCategory &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      if (appliedFilters.sortBy === "rating")
        return (b.rating ?? 0) - (a.rating ?? 0);
      if (appliedFilters.sortBy === "experience")
        return (b.experience ?? 0) - (a.experience ?? 0);
      return a.name.localeCompare(b.name);
    });

  const activeFilterCount =
    (appliedFilters.category !== "all" ? 1 : 0) +
    (appliedFilters.status !== "all" ? 1 : 0) +
    (appliedFilters.verifiedOnly ? 1 : 0) +
    (appliedFilters.reExpertOnly ? 1 : 0) +
    (appliedFilters.reSuggestedOnly ? 1 : 0) +
    (appliedFilters.minRating > 0 ? 1 : 0) +
    (appliedFilters.minExperience > 0 ? 1 : 0);

  const openFilterSidebar = () => {
    setTempFilters(appliedFilters);
    setIsFilterSidebarOpen(true);
  };

  const closeFilterSidebar = () => {
    setTempFilters(appliedFilters);
    setIsFilterSidebarOpen(false);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterSidebarOpen(false);
  };

  const handleResetAllFilters = () => {
    setTempFilters(DEFAULT_LOCAL_FILTERS);
    setAppliedFilters(DEFAULT_LOCAL_FILTERS);
  };

  const allFilteredIds = filteredVendors.map((v) => v.id);
  const allVisibleSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedVendors.includes(id));

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedVendors((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id)),
      );
    } else {
      setSelectedVendors((prev) =>
        Array.from(new Set([...prev, ...allFilteredIds])),
      );
    }
  };

  const handleAddVendor = () => {
    setEditingVendor(null);
    setShowVendorForm(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowVendorForm(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await vendorsAPI.remove(vendorToDelete.id);
      setVendors((prev) => prev.filter((v) => v.id !== vendorToDelete.id));
      await loadVendorCounts();
      setDeleteModalOpen(false);
      setVendorToDelete(null);
      showToast({
        type: "success",
        title: "Vendor deleted",
        message: `${vendorToDelete.name} has been removed.`,
      });
    } catch (error) {
      console.error("Failed to delete vendor:", error);
      showToast({
        type: "error",
        title: "Delete failed",
        message: "Vendor could not be deleted. Please try again.",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setVendorToDelete(null);
  };

  const handleSaveVendor = async (vendorData: Vendor) => {
    try {
      let savedVendor: Vendor;

      if (editingVendor) {
        savedVendor = await vendorsAPI.update(editingVendor.id, vendorData);
        setVendors((prev) =>
          prev.map((vendor) =>
            vendor.id === editingVendor.id ? savedVendor : vendor,
          ),
        );
      } else {
        savedVendor = await vendorsAPI.create(vendorData);
        setVendors((prev) => [savedVendor, ...prev]);
      }
      await loadVendorCounts();

      setShowVendorForm(false);
      setEditingVendor(null);

      showToast({
        type: "success",
        title: editingVendor ? "Vendor updated" : "Vendor added",
        message: `${vendorData.name} has been ${editingVendor ? "updated" : "added"} successfully.`,
      });
    } catch (error) {
      console.error("Failed to save vendor:", error);
      showToast({
        type: "error",
        title: "Save failed",
        message: "Vendor could not be saved. Please try again.",
      });
    }
  };

  const handleToggleREExpertVerified = (vendorId: number) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId ? { ...v, reExpertVerified: !v.reExpertVerified } : v,
      ),
    );
  };

  const handleToggleRESuggested = (vendorId: number) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId ? { ...v, reSuggested: !v.reSuggested } : v,
      ),
    );
  };

  const handleToggleVendorStatus = async (vendor: Vendor) => {
    const nextStatus =
      String(vendor.status || "active").toLowerCase() === "active"
        ? "inactive"
        : "active";

    try {
      const savedVendor = await vendorsAPI.update(vendor.id, {
        ...vendor,
        status: nextStatus,
      });

      setVendors((prev) =>
        prev.map((item) =>
          item.id === vendor.id
            ? { ...item, status: savedVendor?.status || nextStatus }
            : item,
        ),
      );

      showToast({
        type: "success",
        title: "Vendor status updated",
        message: `${vendor.name} is now ${nextStatus}.`,
      });
    } catch (error) {
      console.error("Failed to update vendor status:", error);
      showToast({
        type: "error",
        title: "Status update failed",
        message: "Unable to change vendor status. Please try again.",
      });
    }
  };

  const handleWhatsApp = (
    phone?: string,
    name?: string,
    vendorList?: Vendor[],
  ) => {
    if (!phone || phone === "—") return;

    const cleanPhone = String(phone).replace(/\D/g, "");
    if (!cleanPhone) return;

    const selectedVendorList =
      vendorList || vendors.filter((v) => selectedVendors.includes(v.id));

    const message = `Hi ${name || "there"},

I found your contact through ResaleExpert. I would like to introduce you to the following vendors from our curated network:

${selectedVendorList
  .map(
    (v) =>
      `• ${v.salutation || ""} ${v.name}${v.businessName ? ` (${v.businessName})` : ""} - ${v.category}`,
  )
  .join("\n")}

Would you be interested in connecting with any of them? Please let us know.

Team ResaleExpert`;
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  /* ============================================================
     PREMIUM EMAIL HANDLER (NO NATIVE ALERT)
     ============================================================ */

  const handleEmail = async (
    email?: string,
    name?: string,
    vendorList?: Vendor[],
  ) => {
    if (!email || email === "—") {
      showToast({
        type: "error",
        title: "No email address",
        message: "This recipient does not have an email address on record.",
      });
      return;
    }

    const selectedVendorList =
      vendorList || vendors.filter((v) => selectedVendors.includes(v.id));

    if (selectedVendorList.length === 0) {
      showToast({
        type: "error",
        title: "No vendors selected",
        message: "Please select at least one vendor before sending.",
      });
      return;
    }

    setLastEmailPayload({ email, name, vendors: selectedVendorList });

    setEmailRecipient({ name, email });
    setEmailStatus("sending");
    setEmailError("");
    setEmailModalOpen(true);

    const toastId = showToast({
      type: "loading",
      title: "Sending email...",
      message: `Preparing recommendation for ${name || email}`,
    });

    try {
      await api.post("/email/send-vendor-email", {
        email,
        name,
        vendorIds: selectedVendorList.map((v) => v.id),
      });

      updateToast(toastId, {
        type: "success",
        title: "Email sent",
        message: `Recommendation delivered to ${name || email}.`,
        duration: 3500,
      });

      setEmailStatus("success");
    } catch (error: any) {
      console.error("Email send failed:", error);

      const errMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send email. Please try again.";

      updateToast(toastId, {
        type: "error",
        title: "Email failed",
        message: errMessage,
        duration: 5000,
      });

      setEmailError(errMessage);
      setEmailStatus("error");
    }
  };

  const handleRetryEmail = async () => {
    if (!lastEmailPayload) return;
    const { email, name, vendors: vendorList } = lastEmailPayload;
    setEmailModalOpen(false);
    setTimeout(() => {
      handleEmail(email, name, vendorList);
    }, 150);
  };

  /* ============================================================
     BULK SEND HANDLERS (from RecipientShareDialog selection)
     ============================================================ */

  const handleBulkEmail = async (recipients: RecipientRow[]) => {
    const withEmail = recipients.filter((r) => r.email && r.email !== "—");
    const skipped = recipients.length - withEmail.length;

    if (withEmail.length === 0) {
      showToast({
        type: "error",
        title: "No email addresses",
        message:
          "None of the selected recipients have an email address on record.",
      });
      return;
    }

    const selectedVendorList = vendors.filter((v) =>
      selectedVendors.includes(v.id),
    );
    if (selectedVendorList.length === 0) {
      showToast({
        type: "error",
        title: "No vendors selected",
        message: "Please select at least one vendor before sending.",
      });
      return;
    }

    setEmailRecipient({
      name: `${withEmail.length} recipient${withEmail.length === 1 ? "" : "s"}`,
      email: "",
    });
    setEmailStatus("sending");
    setEmailError("");
    setEmailModalOpen(true);

    const toastId = showToast({
      type: "loading",
      title: "Sending bulk emails...",
      message: `Sending to ${withEmail.length} recipient${withEmail.length === 1 ? "" : "s"}`,
    });

    try {
      const results = await Promise.allSettled(
        withEmail.map((r) =>
          api.post("/email/send-vendor-email", {
            email: r.email,
            name: r.name,
            vendorIds: selectedVendorList.map((v) => v.id),
          }),
        ),
      );

      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        updateToast(toastId, {
          type: "success",
          title: "Emails sent",
          message: `Delivered to ${successCount} recipient${successCount === 1 ? "" : "s"}${skipped > 0 ? ` · ${skipped} skipped (no email)` : ""}.`,
          duration: 4000,
        });
        setEmailStatus("success");
      } else if (successCount === 0) {
        updateToast(toastId, {
          type: "error",
          title: "Bulk email failed",
          message: `Could not deliver to any of ${results.length} recipients.`,
          duration: 5000,
        });
        setEmailError(
          `All ${results.length} email${results.length === 1 ? "" : "s"} failed to send. Please try again.`,
        );
        setEmailStatus("error");
      } else {
        updateToast(toastId, {
          type: "info",
          title: "Partially sent",
          message: `${successCount} sent · ${failCount} failed${skipped > 0 ? ` · ${skipped} skipped` : ""}.`,
          duration: 5000,
        });
        setEmailStatus("success");
      }
    } catch (error: any) {
      const errMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send bulk emails.";

      updateToast(toastId, {
        type: "error",
        title: "Bulk email failed",
        message: errMessage,
        duration: 5000,
      });

      setEmailError(errMessage);
      setEmailStatus("error");
    }
  };

  const handleBulkWhatsApp = (recipients: RecipientRow[]) => {
    const withPhone = recipients.filter((r) => r.phone && r.phone !== "—");
    const skipped = recipients.length - withPhone.length;

    if (withPhone.length === 0) {
      showToast({
        type: "error",
        title: "No phone numbers",
        message:
          "None of the selected recipients have a phone number on record.",
      });
      return;
    }

    const selectedVendorList = vendors.filter((v) =>
      selectedVendors.includes(v.id),
    );
    if (selectedVendorList.length === 0) {
      showToast({
        type: "error",
        title: "No vendors selected",
        message: "Please select at least one vendor before sending.",
      });
      return;
    }

    const vendorLines = selectedVendorList
      .map(
        (v) =>
          `• ${v.salutation || ""} ${v.name}${v.businessName ? ` (${v.businessName})` : ""} - ${v.category}`,
      )
      .join("\n");

    // Open WhatsApp tabs sequentially (most browsers block >1 automatic tab).
    withPhone.forEach((r) => {
      const cleanPhone = String(r.phone).replace(/\D/g, "");
      if (!cleanPhone) return;
      const message = `Hi ${r.name || "there"},

I found your contact through ResaleExpert. I would like to introduce you to the following vendors from our curated network:

${vendorLines}

Would you be interested in connecting with any of them? Please let us know.

Team ResaleExpert`;
      const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });

    showToast({
      type: "success",
      title: "WhatsApp opened",
      message: `Prepared messages for ${withPhone.length} recipient${withPhone.length === 1 ? "" : "s"}${skipped > 0 ? ` · ${skipped} skipped (no phone)` : ""}.`,
    });
  };

  const handleOpenRecipientDialog = async (
    type: "seller" | "buyer" = "seller",
  ) => {
    if (selectedVendors.length === 0) {
      showToast({
        type: "info",
        title: "No vendors selected",
        message: "Please select at least one vendor to share.",
      });
      return;
    }

    setRecipientType(type);
    setRecipientLoading(true);
    setRecipientDialogOpen(true);

    try {
      let rows: any[] = [];

      if (type === "seller") {
        const sellerData = await sellerAPI.getAll();
        rows = Array.isArray(sellerData) ? sellerData : [];
      } else {
        const buyerData = await buyerAPI.getAll();
        const payload =
          buyerData?.data ??
          buyerData?.buyers ??
          buyerData?.result ??
          buyerData;
        rows = Array.isArray(payload) ? payload : [];
      }

      const mappedRows = rows.map((row: any) => ({
        id: row.id ?? row._id ?? row.seller_id ?? row.buyer_id,
        name:
          row.name ||
          row.full_name ||
          row.seller_name ||
          row.buyer_name ||
          "Unknown",
        phone:
          row.phone ||
          row.mobile ||
          row.contact_no ||
          row.contactNumber ||
          row.whatsapp ||
          row.phone_number ||
          "—",
        email:
          row.email || row.seller_email || row.buyer_email || row.mail || "—",
      }));

      setRecipientRows(mappedRows);
    } catch (error) {
      console.error(`Failed to load ${type}s for share dialog:`, error);
      setRecipientRows([]);
    } finally {
      setRecipientLoading(false);
    }
  };

  const handleVendorSelection = (vendorId: number) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId],
    );
  };

  const handleExportCSV = () => {
    if (filteredVendors.length === 0) {
      showToast({
        type: "info",
        title: "Nothing to export",
        message: "No vendors match the current filters.",
      });
      return;
    }
    const headers = [
      "Name",
      "Business Name",
      "Category",
      "Rating",
      "Experience (yrs)",
      "Phone",
      "WhatsApp",
      "Email",
      "Address",
      "Verified",
      "RE Expert",
      "RE Suggested",
    ];
    const rows = filteredVendors.map((v) => [
      `${v.salutation || ""} ${v.name}`.trim(),
      v.businessName || "",
      v.category,
      v.rating ?? "",
      v.experience ?? "",
      v.phone || "",
      v.whatsapp || "",
      v.email || "",
      v.address || "",
      v.verified ? "Yes" : "No",
      v.reExpertVerified ? "Yes" : "No",
      v.reSuggested ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vendors-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      title: "Export ready",
      message: `${filteredVendors.length} vendor${filteredVendors.length === 1 ? "" : "s"} exported to CSV.`,
    });
  };

  const getCategoryIcon = (categoryId: string): React.ComponentType<any> => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.icon ?? Settings;
  };

  const getCategoryColorKey = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.color ?? "default";
  };

  const toggleServices = (vendorId: number) => {
    setExpandedServices(expandedServices === vendorId ? null : vendorId);
  };

  const toggleTags = (vendorId: number) => {
    setExpandedTags(expandedTags === vendorId ? null : vendorId);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* ============ HEADER ============ */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-5 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#0E3658] rounded-xl shrink-0 shadow-sm shadow-slate-300">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Vendor Directory
              </h1>
              <p className="text-gray-500 text-xs">
                Manage trusted vendors and service providers
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {selectedVendors.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenRecipientDialog("seller")}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors w-full sm:w-auto"
                >
                  <Send size={13} />
                  Send to Seller ({selectedVendors.length})
                </button>
                <button
                  onClick={() => handleOpenRecipientDialog("buyer")}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  <Send size={13} />
                  Send to Buyer ({selectedVendors.length})
                </button>
              </div>
            )}

            <button
              onClick={handleAddVendor}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#0E3658] text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors w-full sm:w-auto shadow-sm"
            >
              <Plus size={13} />
              Add Vendor
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-3">
          <div
            role="tablist"
            aria-label="Vendor categories"
            className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 sm:mx-0 px-4 sm:px-0 no-scrollbar"
          >
            {categories.map((categoryItem) => {
              const Icon = categoryItem.icon;
              const colorKey = categoryItem.color;
              const colorClasses =
                colorClassMap[colorKey] ?? colorClassMap.default;
              const isActive = selectedCategory === categoryItem.id;

              return (
                <button
                  key={categoryItem.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(categoryItem.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap border text-xs font-medium ${
                    isActive
                      ? `${colorClasses.bg} ${colorClasses.text} border-transparent ring-1 ${colorClasses.ring}`
                      : "text-gray-600 bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <Icon size={14} />
                  <span>{categoryItem.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? colorClasses.pillBg
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {categoryItem.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ SEARCH / FILTER / VIEW TOOLBAR ============ */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-5 py-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2">
            <label
              className="flex items-center shrink-0 pl-0.5"
              title="Select all visible"
            >
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
              />
            </label>

            <div className="relative flex-1 min-w-0">
              <Search
                aria-hidden
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search vendors, services, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 outline-none"
              />
            </div>

            <button
              onClick={openFilterSidebar}
              className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                isFilterSidebarOpen || activeFilterCount > 0
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              aria-pressed={isFilterSidebarOpen}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view"
              >
                <Grid
                  size={14}
                  className={
                    viewMode === "grid" ? "text-slate-900" : "text-gray-400"
                  }
                />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                aria-pressed={viewMode === "list"}
                aria-label="List view"
              >
                <List
                  size={14}
                  className={
                    viewMode === "list" ? "text-slate-900" : "text-gray-400"
                  }
                />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Download size={14} />
              <span className="hidden xs:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============ VENDOR LIST ============ */}
      <RecipientShareDialog
        isOpen={recipientDialogOpen}
        rows={recipientRows}
        loading={recipientLoading}
        selectedVendorCount={selectedVendors.length}
        activeType={recipientType}
        onClose={() => {
          setRecipientDialogOpen(false);
          setRecipientRows([]);
        }}
        onTypeChange={(type) => {
          setRecipientType(type);
          handleOpenRecipientDialog(type);
        }}
        onEmail={(email, name) =>
          handleEmail(
            email,
            name,
            vendors.filter((v) => selectedVendors.includes(v.id)),
          )
        }
        onWhatsApp={(phone, name) =>
          handleWhatsApp(
            phone,
            name,
            vendors.filter((v) => selectedVendors.includes(v.id)),
          )
        }
        onBulkEmail={handleBulkEmail}
        onBulkWhatsApp={handleBulkWhatsApp}
      />

      {/* Premium Email Status Modal */}
      <PremiumEmailModal
        isOpen={emailModalOpen}
        status={emailStatus}
        recipientName={emailRecipient.name}
        recipientEmail={emailRecipient.email}
        vendorCount={lastEmailPayload?.vendors.length ?? selectedVendors.length}
        errorMessage={emailError}
        onClose={() => {
          setEmailModalOpen(false);
          setEmailStatus("idle");
          setEmailError("");
        }}
        onRetry={handleRetryEmail}
      />

      <div className="flex-1 overflow-auto p-4">
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Users size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-700">
              No vendors match your search
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try a different search term, category, or filter.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredVendors.map((vendor) => {
              const CategoryIcon = getCategoryIcon(vendor.category);
              const categoryColorKey = getCategoryColorKey(vendor.category);
              const colorClasses =
                colorClassMap[categoryColorKey] ?? colorClassMap.default;
              const isSelected = selectedVendors.includes(vendor.id);
              const isExpanded = expandedServices === vendor.id;
              const displayServices = isExpanded
                ? vendor.services
                : vendor.services.slice(0, 2);
              const hasMoreServices = vendor.services.length > 2;
              const activeStatus =
                String(vendor.status || "active").toLowerCase() === "active";

              const isTagsExpanded = expandedTags === vendor.id;
              const displayTags = isTagsExpanded
                ? vendor.tags
                : vendor.tags.slice(0, 3);
              const hasMoreTags = vendor.tags.length > 3;

              return (
                <div
                  key={vendor.id}
                  className={`bg-white rounded-xl border shadow-sm transition-all hover:shadow-md flex flex-col ${
                    isSelected
                      ? "border-slate-400 ring-1 ring-slate-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex-1 p-3 border-b border-gray-100">
                    {/* --- TOP ROW: Checkbox, Badges, Status Toggle, Menu --- */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleVendorSelection(vendor.id)}
                          className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
                        />
                        {vendor.verified && (
                          <CheckCircle
                            className="text-blue-500"
                            size={14}
                            role="img"
                            aria-label="Verified"
                          />
                        )}
                        {vendor.reExpertVerified && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#0E3658] rounded-full">
                            <Crown className="text-white" size={10} />
                            <span className="text-white text-[9px] font-bold">
                              EXPERT
                            </span>
                          </div>
                        )}
                        {vendor.reSuggested && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm">
                            <Award className="text-amber-600" size={10} />
                            <span className="text-[9px] font-semibold tracking-wide text-amber-700">
                              CURATED
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Toggle Moved Here */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={activeStatus}
                          onClick={() => handleToggleVendorStatus(vendor)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                            activeStatus ? "bg-emerald-600" : "bg-slate-300"
                          }`}
                          title={activeStatus ? "Active" : "Inactive"}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                              activeStatus
                                ? "translate-x-[18px]"
                                : "translate-x-[2px]"
                            }`}
                          />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === vendor.id ? null : vendor.id,
                              )
                            }
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {openMenuId === vendor.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-44">
                                <div className="p-1">
                                  <button
                                    onClick={() => {
                                      handleEditVendor(vendor);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                                  >
                                    <Edit size={12} />
                                    Edit Vendor
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleREExpertVerified(vendor.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                                  >
                                    <Crown size={12} />
                                    {vendor.reExpertVerified
                                      ? "Remove RE Expert"
                                      : "Make RE Expert"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleRESuggested(vendor.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                                  >
                                    <Award size={12} />
                                    {vendor.reSuggested
                                      ? "Remove RE Suggested"
                                      : "Make RE Suggested"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteClick(vendor);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded w-full text-left"
                                  >
                                    <Trash2 size={12} />
                                    Delete Vendor
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      {vendor.salutation} {vendor.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1.5">
                      {vendor.businessName}
                    </p>

                    <div className="flex items-center gap-1.5 mb-1.5 text-xs">
                      <span className="flex items-center gap-0.5 font-semibold text-gray-800">
                        <Star
                          className="text-yellow-500 fill-yellow-500"
                          size={12}
                        />
                        {vendor.rating}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">
                        {vendor.experience} yrs
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                      <MapPin size={11} className="shrink-0" />
                      <span className="truncate">{vendor.address}</span>
                    </div>

                    <div className="text-xs font-bold text-green-600 mb-1.5">
                      {vendor.rateIdea}
                    </div>

                    <div className="text-[10.5px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {vendor.availability?.startTime} -{" "}
                      {vendor.availability?.endTime}
                      <span className="text-gray-300">·</span>
                      Off {vendor.availability?.weeklyOff}
                    </div>

                    <div className="mt-2.5">
                      <h4 className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Services & rates
                      </h4>
                      <div className="space-y-1.5">
                        {displayServices.map((service, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg px-2 py-1.5 flex justify-between items-start gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-gray-800 truncate">
                                {service.name}
                              </div>
                              {service.description && (
                                <div className="text-[10px] text-gray-500 truncate">
                                  {service.description}
                                </div>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-bold text-green-600">
                                ₹{service.rate}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {service.unit}
                              </div>
                            </div>
                          </div>
                        ))}
                        {hasMoreServices && (
                          <button
                            onClick={() => toggleServices(vendor.id)}
                            className="text-[10.5px] text-[#A97142] font-medium hover:underline w-full text-center py-0.5"
                          >
                            {isExpanded
                              ? "Show less"
                              : `+${vendor.services.length - 2} more services`}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {displayTags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-0.5 ${colorClasses.pillBg} ${colorClasses.text} rounded-full text-[10px] font-semibold`}
                        >
                          {tag}
                        </span>
                      ))}
                      {hasMoreTags && (
                        <button
                          onClick={() => toggleTags(vendor.id)}
                          className="px-2 py-0.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-full text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          {isTagsExpanded
                            ? "Show less"
                            : `+${vendor.tags.length - 3}`}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-100 mt-auto">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() =>
                          handleWhatsApp(vendor.whatsapp, vendor.name)
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold"
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </button>
                      <button
                        onClick={() =>
                          handleEmail(vendor.email, vendor.name, [vendor])
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
                      >
                        <Mail size={13} />
                        Email
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[10.5px] text-gray-400">
                      <span>{vendor.completedProjects} projects</span>
                      <span>Response: {vendor.responseTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {filteredVendors.map((vendor, idx) => {
              const CategoryIcon = getCategoryIcon(vendor.category);
              const categoryColorKey = getCategoryColorKey(vendor.category);
              const colorClasses =
                colorClassMap[categoryColorKey] ?? colorClassMap.default;
              const isSelected = selectedVendors.includes(vendor.id);
              const isExpanded = expandedServices === vendor.id;
              const displayServices = isExpanded
                ? vendor.services
                : vendor.services.slice(0, 2);
              const hasMoreServices = vendor.services.length > 2;

              return (
                <div
                  key={vendor.id}
                  className={`flex items-center gap-3 px-3 py-2.5 ${idx !== 0 ? "border-t border-gray-100" : ""} ${
                    isSelected ? "bg-slate-50" : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleVendorSelection(vendor.id)}
                    className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5 shrink-0"
                  />

                  <div className="min-w-[150px] w-[18%] shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-gray-900 truncate">
                        {vendor.salutation} {vendor.name}
                      </span>
                      {vendor.verified && (
                        <CheckCircle
                          className="text-blue-500 shrink-0"
                          size={12}
                        />
                      )}
                    </div>
                    <span className="text-[10.5px] text-gray-500 truncate block">
                      {vendor.businessName}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-600 w-16 shrink-0">
                    <Star
                      size={11}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    {vendor.rating}
                    <span className="text-gray-300">·</span>
                    {vendor.experience}y
                  </div>

                  <div className="hidden md:flex items-center gap-1 text-[10.5px] text-gray-500 w-32 shrink-0 truncate">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{vendor.address}</span>
                  </div>

                  <div className="hidden lg:block text-xs font-bold text-green-600 w-24 shrink-0 truncate">
                    {vendor.rateIdea}
                  </div>

                  <div className="hidden lg:flex items-center gap-1 flex-1 min-w-0">
                    {vendor.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className={`px-1.5 py-0.5 ${colorClasses.pillBg} ${colorClasses.text} rounded-full text-[9.5px] font-semibold shrink-0`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="hidden xl:flex items-center gap-2 text-[10px]">
                    {vendor.reExpertVerified && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold">
                        <Crown size={9} />
                        EXPERT
                      </span>
                    )}
                    {vendor.reSuggested && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm">
                        <Award className="text-amber-600" size={10} />
                        <span className="text-[9px] font-semibold tracking-wide text-amber-700">
                          CURATED
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                    <button
                      onClick={() =>
                        handleWhatsApp(vendor.whatsapp, vendor.name)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle size={13} />
                    </button>
                    <button
                      onClick={() =>
                        handleEmail(vendor.email, vendor.name, [vendor])
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      aria-label="Email"
                    >
                      <Mail size={13} />
                    </button>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === vendor.id ? null : vendor.id,
                          )
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {openMenuId === vendor.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-44">
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  handleEditVendor(vendor);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                              >
                                <Edit size={12} />
                                Edit Vendor
                              </button>
                              <button
                                onClick={() => {
                                  handleToggleREExpertVerified(vendor.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                              >
                                <Crown size={12} />
                                {vendor.reExpertVerified
                                  ? "Remove RE Expert"
                                  : "Make RE Expert"}
                              </button>
                              <button
                                onClick={() => {
                                  handleToggleRESuggested(vendor.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                              >
                                <Award size={12} />
                                {vendor.reSuggested
                                  ? "Remove RE Suggested"
                                  : "Make RE Suggested"}
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteClick(vendor);
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded w-full text-left"
                              >
                                <Trash2 size={12} />
                                Delete Vendor
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ FILTER SIDEBAR ============ */}
      {isFilterSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-transparent z-40"
            onClick={closeFilterSidebar}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
            <div className="bg-[#0E3658] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <span className="text-sm font-bold">Vendor Filters</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetAllFilters}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-orange-400/60 text-orange-300 text-[11px] font-semibold hover:bg-orange-400/10 transition-colors"
                >
                  <RotateCcw size={11} />
                  Reset
                </button>
                <button
                  onClick={closeFilterSidebar}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Category
                  </p>
                  <select
                    value={tempFilters.category}
                    onChange={(e) =>
                      setTempFilters((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Vendor status
                  </p>
                  <select
                    value={tempFilters.status}
                    onChange={(e) =>
                      setTempFilters((f) => ({
                        ...f,
                        status: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Status
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={tempFilters.verifiedOnly}
                      onChange={(e) =>
                        setTempFilters((f) => ({
                          ...f,
                          verifiedOnly: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
                    />
                    <CheckCircle size={14} className="text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      Verified only
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={tempFilters.reExpertOnly}
                      onChange={(e) =>
                        setTempFilters((f) => ({
                          ...f,
                          reExpertOnly: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
                    />
                    <Crown size={14} className="text-purple-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      RE Expert vendors
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={tempFilters.reSuggestedOnly}
                      onChange={(e) =>
                        setTempFilters((f) => ({
                          ...f,
                          reSuggestedOnly: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-slate-800 focus:ring-slate-500 w-3.5 h-3.5"
                    />
                    <Award size={14} className="text-green-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      RE Suggested vendors
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Min rating
                  </p>
                  <select
                    value={tempFilters.minRating}
                    onChange={(e) =>
                      setTempFilters((f) => ({
                        ...f,
                        minRating: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    <option value={0}>Any</option>
                    <option value={3}>3.0+</option>
                    <option value={4}>4.0+</option>
                    <option value={4.5}>4.5+</option>
                  </select>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                    Min experience
                  </p>
                  <select
                    value={tempFilters.minExperience}
                    onChange={(e) =>
                      setTempFilters((f) => ({
                        ...f,
                        minExperience: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    <option value={0}>Any</option>
                    <option value={1}>1+ yrs</option>
                    <option value={3}>3+ yrs</option>
                    <option value={5}>5+ yrs</option>
                    <option value={10}>10+ yrs</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <ArrowUpDown size={11} />
                  Sort by
                </p>
                <select
                  value={tempFilters.sortBy}
                  onChange={(e) =>
                    setTempFilters((f) => ({
                      ...f,
                      sortBy: e.target.value as SortKey,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-slate-400/40"
                >
                  <option value="rating">Rating (high to low)</option>
                  <option value="experience">Experience (high to low)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4 flex gap-3 shrink-0">
              <button
                onClick={handleResetAllFilters}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-[#0E3658] hover:bg-black text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        vendorName={
          vendorToDelete
            ? `${vendorToDelete.salutation || ""} ${vendorToDelete.name}`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <VendorFormModal
          isOpen={showVendorForm}
          onClose={() => {
            setShowVendorForm(false);
            setEditingVendor(null);
          }}
          vendor={editingVendor}
          onSave={async (vendorData) => {
            await handleSaveVendor(vendorData);
          }}
        />
      )}
    </div>
  );
};

const VendorDirectoryPage: React.FC = () => {
  return (
    <ToastProvider>
      <VendorDirectoryPageInner />
    </ToastProvider>
  );
};

export default VendorDirectoryPage;
