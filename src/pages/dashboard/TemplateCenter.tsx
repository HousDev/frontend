// src/components/TemplateCenter.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  MessageSquare,
  Mail,
  Smartphone,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Loader2,
  X,
  Upload,
  Sparkles,
  Info,
  FileJson,
} from "lucide-react";
import TemplateCenterModal from "./TemplateCenterModal";
import { TemplateAPI } from "@/lib/TemplateAPI";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";

/* ---------- Types ---------- */

type Channel = "sms" | "whatsapp" | "email";

export interface Template {
  id?: string | number;
  name: string;
  content: string;
  category?: string;
  status?: "approved" | "pending" | "rejected" | string;
  createdAt?: string;
  priority?: string;
  autoApprove?: boolean;
  channel?: string;
  [k: string]: any;
}

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  duration?: number;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

/* ---------- Constants ---------- */

const DEFAULT_CATEGORIES = [
  "Welcome",
  "Security",
  "Order",
  "Payment",
  "Marketing",
  "Support",
  "Delivery",
  "Newsletter",
  "Onboarding",
  "Notification",
  "Billing",
];

const STATUS_META: Record<
  string,
  { color: string; icon: React.ReactNode | null; label: string }
> = {
  approved: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-4 h-4 text-green-600" />,
    label: "Approved",
  },
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-4 h-4 text-yellow-600" />,
    label: "Pending",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-4 h-4 text-red-600" />,
    label: "Rejected",
  },
};

/* ---------- Helpers ---------- */

function classNames(...arr: Array<string | false | null | undefined>) {
  return arr.filter(Boolean).join(" ");
}

function tokenize(text?: string | null): string[] {
  if (!text) return [];
  const tokens = new Set<string>();
  const re = /(\{[^}]+\}|\$\{[^}]+\}|#[a-zA-Z0-9_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) tokens.add(m[0]);
  return [...tokens];
}

function highlightVariables(text?: string | null) {
  if (!text) return null;
  const parts = text.split(/(\{[^}]+\}|#[a-zA-Z0-9_]+|\$\{[^}]+\})/g);
  return parts.map((p, i) => {
    if (/^\{[^}]+\}$/.test(p))
      return (
        <span key={i} className="bg-amber-100 text-amber-800 px-1 rounded font-mono">
          {p}
        </span>
      );
    if (/^\$\{[^}]+\}$/.test(p))
      return (
        <span key={i} className="bg-emerald-100 text-emerald-800 px-1 rounded font-mono">
          {p}
        </span>
      );
    if (/^#[a-zA-Z0-9_]+$/.test(p))
      return (
        <span key={i} className="bg-indigo-100 text-indigo-800 px-1 rounded font-mono">
          {p}
        </span>
      );
    return <span key={i}>{p}</span>;
  });
}

/* ---------- UI subcomponents ---------- */

function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, toast.duration ?? 1800);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  return (
    <div className="pointer-events-auto w-full max-w-xs overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
      <div className="p-3 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {toast.icon ?? <CheckCircle className="w-4 h-4 text-green-600" />}
        </div>
        <div className="w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          {toast.message && <p className="mt-0.5 text-xs text-gray-600">{toast.message}</p>}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Modal({ open, onClose, children, size = "xl" }: ModalProps) {
  if (!open) return null;
  const maxW = size === "lg" ? "max-w-lg" : size === "md" ? "max-w-md" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={classNames("relative bg-white w-full mx-auto rounded-2xl shadow-xl border border-gray-200", maxW)}>
        {children}
      </div>
    </div>
  );
}

/* Generic pagination hook with types */
function usePagination<T>(list: T[], pageSize = 9) {
  const [page, setPage] = useState<number>(1);
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, page, pageSize]);
  useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages]); // eslint-disable-line react-hooks/exhaustive-deps
  return { page, setPage, pages, pageItems, total };
}

function StatusPill({ status }: { status?: string | null }) {
  const meta = (status && STATUS_META[status]) || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: status ?? "Unknown",
    icon: null,
  };
  return (
    <span className={classNames("inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border", meta.color)}>
      {meta.icon}
      <span>{meta.label}</span>
    </span>
  );
}
function Chip({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <span className={classNames("px-2 py-0.5 rounded-full border text-[11px]", className ?? "")}>{children}</span>;
}
function CountBadge({ active, children }: { active?: boolean; children?: React.ReactNode }) {
  return (
    <span className={classNames("ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold", active ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700")}>
      {children}
    </span>
  );
}
function TabButton({ active, children, onClick, leftIcon, className, size = "md", variant = "solid" }: {
  active?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  leftIcon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
  variant?: "solid" | "outline";
}) {
  const sizes: Record<string, string> = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
  };
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all border";
  const styles = active
    ? variant === "solid"
      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
      : "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200"
    : variant === "solid"
      ? "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
      : "bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-transparent";
  return (
    <button onClick={onClick} className={classNames(base, sizes[size], styles, className ?? "")}>
      {leftIcon}
      {children}
    </button>
  );
}

function TemplateCard({ template, onPreview, onEdit, onDuplicate, onDelete }: {
  template: Template;
  onPreview?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}) {
  const vars = tokenize(template.content);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 truncate text-sm sm:text-base">{template.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Chip className="bg-blue-50 border-blue-200 text-blue-700 font-semibold">{template.category}</Chip>
              <StatusPill status={template.status} />
            </div>
          </div>
        </div>

        {vars.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {vars.map((v) => (
              <span key={v} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-mono">
                {v}
              </span>
            ))}
          </div>
        )}

        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-3 leading-relaxed">{template.content}</p>

        <div className="text-[11px] text-gray-400 mb-3">Created: {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "-"}</div>

        <div className="flex items-center gap-1.5">
          <button className="flex-1 bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 font-medium text-xs sm:text-sm" onClick={onPreview}>
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Duplicate" onClick={onDuplicate}>
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */

export default function TemplateCenter(): JSX.Element {
  // store grouped by channel: sms | whatsapp | email
  const [store, setStore] = useState<Record<Channel, { created: Template[] }>>({
    sms: { created: [] },
    whatsapp: { created: [] },
    email: { created: [] },
  });
  const [activeMainTab, setActiveMainTab] = useState<Channel>("sms");
  const [activeSubTab, setActiveSubTab] = useState<string>("created");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<Template | null>(null);
  const [previewItem, setPreviewItem] = useState<Template | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [exporting, setExporting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const uploadRef = useRef<HTMLInputElement | null>(null);

  const channelList = store[activeMainTab]?.created ?? [];

  const [masterLoading, setMasterLoading] = useState<boolean>(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(["common"]);
        setMasters(data);
      } catch (err) {
        console.error("Error fetching master options:", err);
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);

  const groupTemplatesByChannel = (templates: Template[] = []) => {
    const out: Record<Channel, Template[]> = { sms: [], whatsapp: [], email: [] };
    templates.forEach((t) => {
      const ch = (t.channel || t.type || t.channel_type || "email").toString().toLowerCase();
      if (ch.includes("sms")) out.sms.push(t);
      else if (ch.includes("whatsapp") || ch.includes("wa")) out.whatsapp.push(t);
      else out.email.push(t);
    });
    return { sms: { created: out.sms }, whatsapp: { created: out.whatsapp }, email: { created: out.email } } as Record<
      Channel,
      { created: Template[] }
    >;
  };

  // Load from backend (initial)
  useEffect(() => {
    const getAll = async () => {
      setLoading(true);
      try {
        const resp: any = await TemplateAPI.getAll();
        // Normalize: resp may be { data: [...] } or an array
        const raw =
          resp && typeof resp === "object" && Array.isArray(resp.data)
            ? resp.data
            : Array.isArray(resp)
            ? resp
            : resp?.data ?? resp;
        const templatesArray: Template[] = Array.isArray(raw) ? raw : [];
        const grouped = groupTemplatesByChannel(templatesArray);
        setStore(grouped);
      } catch (err) {
        console.error("Error fetching templates:", err);
        pushToast({ id: Math.random().toString(36).slice(2), title: "Failed to load templates", message: String(err) });
      } finally {
        setLoading(false);
      }
    };
    getAll();
  }, []);

  const filtered = useMemo(() => {
    let out = [...channelList];
    if (activeSubTab === "pending") out = out.filter((t) => t.status === "pending");
    else if (activeSubTab === "approved") out = out.filter((t) => t.status === "approved");

    if (statusFilter !== "all") out = out.filter((t) => t.status === statusFilter);
    if (selectedCategory !== "all") out = out.filter((t) => t.category === selectedCategory);

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      out = out.filter(
        (t) =>
          (t.name ?? "").toString().toLowerCase().includes(s) ||
          (t.content ?? "").toString().toLowerCase().includes(s) ||
          (t.category ?? "").toString().toLowerCase().includes(s)
      );
    }
    out.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    return out;
  }, [channelList, activeSubTab, selectedCategory, statusFilter, searchTerm]);

  const { page, setPage, pages, pageItems, total } = usePagination<Template>(filtered, 9);

  const mainTabs = [
    {
      id: "sms" as Channel,
      label: "SMS Templates",
      icon: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />,
      count: store.sms.created.length,
    },
    {
      id: "whatsapp" as Channel,
      label: "WhatsApp Templates",
      icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />,
      count: store.whatsapp.created.length,
    },
    {
      id: "email" as Channel,
      label: "Email Templates",
      icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5" />,
      count: store.email.created.length,
    },
  ];

  const subTabs = [
    { id: "created", label: "All Template", icon: <Eye className="w-4 h-4 text-blue-600" /> },
    { id: "pending", label: "Pending Template", icon: <Clock className="w-4 h-4 text-yellow-600" /> },
    { id: "approved", label: "Approved Template", icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
  ];

  function pushToast(toast: Omit<ToastItem, "id"> & { id?: string }) {
    const id = toast.id ?? Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, ...toast } as ToastItem]);
  }
  function removeToast(id: string) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  function saveToLocalGroup(updatedList: Template[], channel: Channel) {
    setStore((prev) => ({ ...prev, [channel]: { ...prev[channel], created: updatedList } }));
  }

  // Create or Update template using API
  async function handleCreateOrUpdate(values: Template) {
    try {
      if (values.id) {
        // update - convert id to string before calling API
        const id = values.id;
        const payload = { ...values };
        const updated = await TemplateAPI.update(String(id), payload); // <<< ensure string id
        const obj: Template = (updated as Template) ?? payload;
        const list = store[activeMainTab].created.map((t) => (String(t.id) === String(id) ? obj : t));
        saveToLocalGroup(list, activeMainTab);
        pushToast({ title: "Template updated", icon: <Sparkles className="w-4 h-4 text-blue-600" /> });
      } else {
        // create
        const payload: Template = { ...values, channel: activeMainTab };
        const created = await TemplateAPI.add(payload);
        const obj: Template = (created as Template) ?? payload;
        obj.createdAt = obj.createdAt ?? new Date().toISOString().slice(0, 10);
        saveToLocalGroup([obj, ...store[activeMainTab].created], activeMainTab);
        pushToast({ title: "Template created", icon: <Sparkles className="w-4 h-4 text-blue-600" /> });
      }
    } catch (err) {
      console.error("Create/Update error:", err);
      pushToast({ title: "Save failed", message: String(err) });
    } finally {
      setShowCreate(false);
      setEditItem(null);
      setActiveSubTab("created");
    }
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    try {
      // convert id to string to satisfy TemplateAPI typing
      await TemplateAPI.delete(String(confirmDelete.id)); // <<< ensure string id
      const list = store[activeMainTab].created.filter((t) => String(t.id) !== String(confirmDelete.id));
      saveToLocalGroup(list, activeMainTab);
      pushToast({ id: Math.random().toString(36).slice(2), title: "Template deleted" });
    } catch (err) {
      console.error("Delete error:", err);
      pushToast({ id: Math.random().toString(36).slice(2), title: "Delete failed", message: String(err) });
    } finally {
      setConfirmDelete(null);
    }
  }

  async function handleDuplicate(item: Template) {
    try {
      const clonePayload: Template = {
        ...item,
        name: `${item.name} (Copy)`,
        createdAt: new Date().toISOString().slice(0, 10),
        channel: activeMainTab,
      };
      delete (clonePayload as any).id;
      const created = await TemplateAPI.add(clonePayload);
      const obj: Template = (created as Template) ?? clonePayload;
      saveToLocalGroup([obj, ...store[activeMainTab].created], activeMainTab);
      pushToast({ title: "Template duplicated" });
    } catch (err) {
      console.error("Duplicate error:", err);
      pushToast({ title: "Duplicate failed", message: String(err) });
    }
  }

  async function handleExport(fmt: "json" | "csv" = "json") {
    try {
      setExporting(true);
      const data = filtered;
      if (fmt === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeMainTab}-templates.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const header = ["id", "name", "category", "status", "createdAt", "priority", "autoApprove", "content"];
        const rows = data.map((t) => header.map((h) => (t[h as keyof Template] ?? "").toString().replace(/,/g, "\\,")).join(","));
        const csv = [header.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeMainTab}-templates.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      pushToast({ title: `Exported ${fmt.toUpperCase()}` });
    } finally {
      setExporting(false);
    }
  }

  // Import: read file, create each template via API and add to local store
  async function handleImportFile(file?: File | null) {
    if (!file) return;
    const isCSV = file.name.toLowerCase().endsWith(".csv");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        let incoming: Template[] = [];
        if (isCSV) {
          const text = typeof reader.result === "string" ? reader.result : "";
          const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
          const headers = head.split(",").map((h) => h.trim());
          incoming = lines.map((line, i) => {
            const cols = line.split(",");
            const obj = Object.fromEntries(headers.map((h, idx) => [h, cols[idx]]));
            return {
              name: (obj as any).name || `Imported ${i + 1}`,
              content: (obj as any).content || "",
              status: (obj as any).status || "pending",
              createdAt: (obj as any).createdAt || new Date().toISOString().slice(0, 10),
              category: (obj as any).category || "Marketing",
              priority: (obj as any).priority || "Normal",
              autoApprove: (obj as any).autoApprove === "true",
              channel: activeMainTab,
            } as Template;
          });
        } else {
          const json = typeof reader.result === "string" ? JSON.parse(reader.result) : (reader.result as any);
          incoming = Array.isArray(json) ? json : json?.created || [];
          incoming = incoming.map((t, i) => ({
            name: t.name || `Imported ${i + 1}`,
            content: t.content || "",
            status: t.status || "pending",
            createdAt: t.createdAt || new Date().toISOString().slice(0, 10),
            category: t.category || "Marketing",
            priority: t.priority || "Normal",
            autoApprove: !!t.autoApprove,
            channel: activeMainTab,
          }));
        }

        if (incoming.length === 0) {
          pushToast({ title: "Nothing to import", icon: <Info className="w-4 h-4 text-amber-600" /> });
          return;
        }

        // Persist each to backend sequentially (simple and reliable)
        const createdItems: Template[] = [];
        for (const item of incoming) {
          try {
            const created = await TemplateAPI.add(item);
            createdItems.push((created as Template) ?? item);
          } catch (err) {
            console.warn("Failed to import item", item, err);
          }
        }
        if (createdItems.length === 0) {
          pushToast({ title: "Import failed", message: "No items were saved to backend" });
        } else {
          saveToLocalGroup([...createdItems, ...store[activeMainTab].created], activeMainTab);
          pushToast({ title: `Imported ${createdItems.length} template(s)`, icon: <Upload className="w-4 h-4 text-green-700" /> });
          setShowImport(false);
        }
      } catch (e) {
        pushToast({ title: "Import failed", message: String(e) });
      }
    };
    reader.readAsText(file);
  }

  const totalCountForTab = (tabId: string) => {
    const list = store[activeMainTab]?.created || [];
    if (tabId === "pending") return list.filter((t) => t.status === "pending").length;
    if (tabId === "approved") return list.filter((t) => t.status === "approved").length;
    return list.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight flex items-center gap-2">
                  Template Center <Sparkles className="w-4 h-4 text-white/80" />
                </h1>
                <p className="text-xs sm:text-sm text-blue-100">Create, manage, and deploy templates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main UI */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 sm:p-2">
            <nav className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {mainTabs.map((tab) => {
                const active = activeMainTab === tab.id;
                return (
                  <TabButton
                    key={tab.id}
                    active={active}
                    onClick={() => {
                      setActiveMainTab(tab.id);
                      setActiveSubTab("created");
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setStatusFilter("all");
                      setPage(1);
                    }}
                    leftIcon={tab.icon}
                    size="md"
                    variant="solid"
                    className="w-full"
                  >
                    <span className="truncate">{tab.label}</span>
                    <CountBadge active={active}>{tab.count}</CountBadge>
                  </TabButton>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 sm:p-2">
            <nav role="tablist" className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-1 gap-1.5 sm:gap-2">
              {subTabs.map((tab) => {
                const active = activeSubTab === tab.id;
                return (
                  <TabButton
                    key={tab.id}
                    active={active}
                    onClick={() => setActiveSubTab(tab.id)}
                    leftIcon={tab.icon}
                    size="sm"
                    variant="outline"
                    className={classNames("w-full", active && "shadow-[0_0_0_1px_rgba(59,130,246,.3)] bg-blue-50")}
                  >
                    <span className="truncate">{tab.label}</span>
                    <span className={classNames("ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold", active ? "bg-blue-200/80 text-blue-900" : "bg-gray-200 text-gray-700")}>
                      {totalCountForTab(tab.id)}
                    </span>
                  </TabButton>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Toolbar */}
        {activeSubTab !== "create" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-3 mb-3 sm:mb-6 sticky top-2 z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="relative w-full sm:w-auto min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search templates..."
                    className="pl-9 pr-3 py-1.5 w-full border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="min-w-[140px] sm:min-w-[160px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Categories</option>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[140px] sm:min-w-[160px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); setStatusFilter("all"); setPage(1); }} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm shrink-0">
                  <Filter className="w-4 h-4 inline mr-2" /> Reset
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <button onClick={() => setActiveSubTab("create")} className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-1.5 text-sm">
                  <Plus className="w-4 h-4" /> Create Template
                </button>

                <button onClick={() => setShowImport(true)} className="w-full sm:w-auto bg-white px-3 sm:px-4 py-2 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1.5 text-sm">
                  <Upload className="w-4 h-4" /> Import
                </button>

                <button onClick={() => handleExport("csv")} disabled={exporting} aria-disabled={exporting} className="w-full sm:w-auto bg-white px-3 sm:px-4 py-2 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-1.5 text-sm" title="Export CSV">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeSubTab === "create" ? (
          <TemplateCenterModal open={true} channel={activeMainTab} onClose={() => setActiveSubTab("created")} onSubmit={handleCreateOrUpdate} title="Create Template" />
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">Loading templates...</div>
            ) : total === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-10 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-500 mb-6 sm:mb-8 leading-relaxed text-sm">Get started by creating your first template.</p>
                  <button onClick={() => setActiveSubTab("create")} className="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-semibold text-sm">
                    <Plus className="w-4 h-4" /> Create Template
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                  {pageItems.map((template) => (
                    <TemplateCard
                      key={String(template.id ?? template.name)}
                      template={template}
                      onPreview={() => setPreviewItem(template)}
                      onEdit={() => setEditItem(template)}
                      onDuplicate={() => handleDuplicate(template)}
                      onDelete={() => setConfirmDelete(template)}
                    />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border bg-white text-sm disabled:opacity-50">
                      Prev
                    </button>
                    <div className="text-sm text-gray-600">Page <span className="font-semibold">{page}</span> of <span className="font-semibold"> {pages}</span></div>
                    <button disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="px-3 py-1.5 rounded-lg border bg-white text-sm disabled:opacity-50">
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <TemplateCenterModal open={showCreate || !!editItem} title={editItem ? "Edit Template" : "Create Template"} initial={editItem || null} channel={activeMainTab} onClose={() => { setShowCreate(false); setEditItem(null); }} onSubmit={handleCreateOrUpdate} />

      {/* Preview Modal */}
      <Modal open={!!previewItem} onClose={() => setPreviewItem(null)}>
        {previewItem && (
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-0.5">{previewItem.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">{previewItem.category}</span>
                  <StatusPill status={previewItem.status} />
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {tokenize(previewItem.content).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">{tokenize(previewItem.content).map((v) => <span key={v} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-mono">{v}</span>)}</div>
            )}

            <div className="rounded-xl border bg-gray-50 p-3 text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">{highlightVariables(previewItem.content)}</div>
            <div className="mt-3 flex items-center justify-end text-xs text-gray-500"><div>Created: {previewItem.createdAt ? new Date(previewItem.createdAt).toLocaleDateString() : "-"}</div></div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 rounded-lg border bg-white text-sm" onClick={() => setPreviewItem(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} size="md">
        {confirmDelete && (
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete template?</h3>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-5 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 rounded-lg border bg-white text-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm" onClick={confirmDeleteAction}>Delete</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Import Modal */}
      <Modal open={showImport} onClose={() => setShowImport(false)}>
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Import templates</h3>
              <p className="text-sm text-gray-600">Upload a <strong>.json</strong> (array or {"{ created: [...] }"}) or <strong> .csv</strong> file with columns like <em> name, content, category, status, createdAt, priority, autoApprove</em>.</p>
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <input ref={uploadRef} type="file" accept=".json,.csv" onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <FileJson className="w-4 h-4" /> Sample JSON is also supported
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button className="px-3 py-1.5 rounded-lg border bg-white text-sm" onClick={() => setShowImport(false)}>Close</button>
          </div>
        </div>
      </Modal>

      {/* Toasts */}
      <div className="fixed inset-0 px-3 py-4 sm:px-4 sm:py-6 pointer-events-none flex flex-col items-end gap-2 z-50">
        {toasts.map((t) => <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />)}
      </div>
    </div>
  );
}
