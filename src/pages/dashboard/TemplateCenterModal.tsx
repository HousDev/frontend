import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Save, X, Copy, Check, Plus, Zap, Shield, ChevronDown } from "lucide-react";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import TemplateContentAI from "./TemplateContentAI";

/** -------------------- Simplified variables structure -------------------- */
const VARS_BY_CHANNEL: Record<
  string,
  { key: string; desc: string; cat: string }[]
> = {
  sms: [
    { key: "{name}", desc: "Recipient name", cat: "Basic" },
    { key: "{otp}", desc: "One-time password", cat: "Security" },
    { key: "{order_id}", desc: "Order ID", cat: "Order" },
    { key: "{amount}", desc: "Amount", cat: "Order" },
    { key: "{store_name}", desc: "Store name", cat: "Business" },
    { key: "{date}", desc: "Date", cat: "Time" },
    { key: "{time}", desc: "Time", cat: "Time" },
  ],
  whatsapp: [
    { key: "{name}", desc: "Recipient name", cat: "Basic" },
    { key: "{order_id}", desc: "Order ID", cat: "Order" },
    { key: "{product_name}", desc: "Product name", cat: "Order" },
    { key: "{amount}", desc: "Amount", cat: "Order" },
    { key: "{cta_url}", desc: "CTA URL", cat: "Marketing" },
    { key: "{coupon_code}", desc: "Coupon code", cat: "Marketing" },
  ],
  email: [
    { key: "{name}", desc: "Recipient name", cat: "Basic" },
    { key: "{first_name}", desc: "First name", cat: "Basic" },
    { key: "{subject}", desc: "Subject line", cat: "Basic" },
    { key: "{invoice_id}", desc: "Invoice ID", cat: "Billing" },
    { key: "{amount}", desc: "Amount", cat: "Billing" },
    { key: "{unsubscribe_link}", desc: "Unsubscribe", cat: "Compliance" },
  ],
};

/** -------------------- Tiny UI helpers -------------------- */
type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};
const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>
    {children}
  </span>
);

/** -------------------- Compact Variables Panel -------------------- */
type VariablesPanelProps = {
  channel: string;
  onInsert: (token: string) => void;
};
function VariablesPanel({ channel, onInsert }: VariablesPanelProps) {
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState("");
  const [cat, setCat] = useState("All");
  const vars = VARS_BY_CHANNEL[channel] || VARS_BY_CHANNEL.sms;

  const categories = useMemo(() => ["All", ...Array.from(new Set(vars.map((v) => v.cat)))], [vars]);

  const filtered = useMemo(() => {
    let list = vars;
    if (cat !== "All") list = list.filter((v) => v.cat === cat);
    if (!filter) return list;
    const q = filter.toLowerCase();
    return list.filter((v) => v.key.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q));
  }, [vars, filter, cat]);

  const copyVar = async (key: string) => {
    try {
      // navigator.clipboard might not exist in some test environments — guard it
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(key);
        setCopied(key);
        setTimeout(() => setCopied(""), 800);
      }
    } catch (_) {
      // ignore
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-medium text-gray-800 text-xs">Variables</h4>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="px-2 py-1 text-xs border rounded-md bg-white"
          aria-label="Variable category filter"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search variables..."
          className="w-full px-2.5 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Search variables"
        />
      </div>

      <div className="max-h-56 overflow-auto space-y-1 pr-0.5">
        {filtered.map((v) => (
          <div key={v.key} className="group flex items-center gap-2 p-2 rounded-lg border bg-white hover:bg-gray-50">
            <div className="flex-1 min-w-0">
              <code className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{v.key}</code>
              <div className="text-[10px] text-gray-500 truncate mt-1">{v.desc}</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => copyVar(v.key)} className="p-1 rounded hover:bg-gray-200" title="Copy" type="button">
                {copied === v.key ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
              </button>
              <button
                onClick={() => onInsert(v.key)}
                className="p-1 rounded hover:bg-blue-100 text-blue-600"
                title="Insert"
                type="button"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="text-[11px] text-gray-500 py-4 text-center">No variables match your search.</div>}
      </div>
    </div>
  );
}

/** -------------------- Main Modal (Compact) -------------------- */
type TemplateData = {
  id?: string | number;
  name: string;
  category: string;
  content: string;
  priority: string;
  autoApprove: boolean;
  status: string;
  channel: string;
  updatedAt?: string;
};

type CreateUpdateModalProps = {
  open: boolean;
  onClose?: () => void;
  onSubmit?: (data: TemplateData) => void;
  channel?: "sms" | "whatsapp" | "email" | string;
  initial?: Partial<TemplateData> | null;
  title?: string;
};

export default function CreateUpdateModal({
  open,
  onClose,
  onSubmit,
  channel = "sms",
  initial = null,
  title,
}: CreateUpdateModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [autoApprove, setAutoApprove] = useState(false);
  const [status, setStatus] = useState("pending");
  const [saving, setSaving] = useState(false);
  const [showVarsMobile, setShowVarsMobile] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const [masterLoading, setMasterLoading] = useState(true);
  // masters might be { common: { category: MasterOption[] }, ... } depending on backend
  const [masters, setMasters] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(["common"]);
        setMasters(data);
        // if you want to see debug: console.log("Fetched master data:", data);
      } catch (err) {
        console.error("Error fetching master options:", err);
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, []);

  /** dynamic category options from master data */
  const categoryOptions: MasterOption[] = useMemo(() => {
    // accommodate both shapes: masters.common.category or masters.category
    const opts = (masters?.common?.category ?? masters?.category) as MasterOption[] | undefined;
    return opts ?? [];
  }, [masters]);

  // Channel-specific character limits
  const CONTENT_LIMIT = useMemo(() => (channel === "sms" ? 1000 : channel === "whatsapp" ? 2000 : 5000), [channel]);
  const remaining = CONTENT_LIMIT - content.length;

  // Populate on open / initial change — keep category from initial if present
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name ?? "");
      setCategory(initial.category ?? "");
      setContent(initial.content ?? "");
      setPriority(initial.priority ?? "Normal");
      setAutoApprove(Boolean(initial.autoApprove));
      setStatus(initial.status ?? (initial.autoApprove ? "approved" : "pending"));
    } else {
      setName("");
      setCategory("");
      setContent("");
      setPriority("Normal");
      setAutoApprove(false);
      setStatus("pending");
    }
  }, [open, initial]);

  // If master options load after initial and category value isn't in options, inject it so select shows
  useEffect(() => {
    if (!masterLoading && initial?.category) {
      const list = categoryOptions || [];
      const exists = list.some((o) => o.value === initial.category);
      if (!exists) {
        setMasters((prev) => ({
          ...prev,
          common: {
            ...(prev.common || {}),
            category: [{ value: initial.category, label: initial.category }, ...(prev.common?.category || [])],
          },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterLoading, initial, categoryOptions.length]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const insertAtCursor = (token: string) => {
    const el = contentRef.current;
    if (!el) {
      setContent((prev) => prev + token);
      return;
    }
    const start = typeof el.selectionStart === "number" ? el.selectionStart : content.length;
    const end = typeof el.selectionEnd === "number" ? el.selectionEnd : content.length;
    const newContent = content.slice(0, start) + token + content.slice(end);
    setContent(newContent);
    // set caret after inserted token
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      try {
        el.setSelectionRange(pos, pos);
      } catch {
        // some environments may not support setSelectionRange
      }
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();

    if (!name.trim() || !category || !content.trim()) {
      console.warn("Validation failed — required fields missing", { name, category, content });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const next: TemplateData = {
        id: initial?.id,
        name: name.trim(),
        category,
        content,
        priority,
        autoApprove,
        status: autoApprove ? "approved" : status,
        channel,
        updatedAt: new Date().toISOString(),
      };

      onSubmit?.(next);
      setSaving(false);
      onClose?.();
    }, 250);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px]" onClick={onClose} />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white w-full max-w-2xl md:max-w-3xl rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{title || (initial ? "Edit Template" : "Create Template")}</h3>
            <p className="text-[11px] text-gray-500 capitalize">{channel} Template</p>
          </div>
          <div className="flex items-center gap-2">
            {autoApprove ? (
              <Badge className="bg-emerald-100 text-emerald-700">
                <Shield className="w-3.5 h-3.5 mr-1" /> Auto-approve ON
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700">
                <Zap className="w-3.5 h-3.5 mr-1" /> Manual review
              </Badge>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white transition-colors" aria-label="Close" type="button">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-4 space-y-4 pt-0 md:pt-0">
            {/* Mobile toggle for Variables panel */}
            <button
              type="button"
              onClick={() => setShowVarsMobile((s) => !s)}
              className="md:hidden inline-flex items-center justify-between w-full text-xs px-3 py-2 rounded-lg border bg-gray-50"
              aria-expanded={showVarsMobile}
            >
              Variables
              <ChevronDown className={`w-4 h-4 transition ${showVarsMobile ? "rotate-180" : ""}`} />
            </button>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Content Editor (2/3 on md+) */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Template Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-60 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Enter template name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-60 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                        required
                        disabled={masterLoading || categoryOptions.length === 0}
                      >
                        <option value="">Select category</option>
                        {categoryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label ?? opt.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-700">Template Content</label>
                    <div className="text-[11px] text-gray-500">
                      Limit {CONTENT_LIMIT.toLocaleString()} •
                      <span className={`ml-1 ${remaining < 100 ? "text-red-600 font-medium" : "text-gray-500"}`}>{remaining} left</span>
                    </div>
                  </div>
                </div>

                {/* ----- AI content area ----- */}
                <div>
                  <TemplateContentAI
                    formData={{ content, name, channel, category, priority }}
                    // TemplateContentAI may expect either a function updater or an object; accept both
                    setFormData={(updater: any) => {
                      const next = typeof updater === "function" ? updater({ content, name, channel, category, priority }) : updater;
                      if (!next) return;
                      if (typeof next.content !== "undefined") setContent(next.content);
                      if (typeof next.name !== "undefined") setName(next.name);
                      if (typeof next.category !== "undefined") setCategory(next.category);
                      if (typeof next.priority !== "undefined") setPriority(next.priority);
                    }}
                    endpoint="/api/ai/generate-template"
                  />
                  {/* Hidden textarea ref for insertion/caret (keeps insertAtCursor working) */}
                  <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)} className="hidden" aria-hidden />
                </div>

                {/* Quick Options */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t">
                  {/* Left: Priority */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-700">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-1.5 text-xs border rounded-md bg-white">
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  {/* Middle: Auto-approve toggle */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="sr-only peer" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />
                    <span className="w-9 h-5 bg-gray-200 rounded-full relative transition peer-checked:bg-emerald-500">
                      <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                    </span>
                    <span className="text-xs text-gray-700">Auto-approve</span>
                  </label>

                  {/* Right: Status (disabled if auto-approve) */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-700">Status</label>
                    <select
                      value={autoApprove ? "approved" : status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="px-3 py-1.5 text-xs border rounded-md bg-white min-w-[120px]"
                      disabled={autoApprove}
                      title="Status"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Variables Panel (1/3) */}
              <div className={`md:col-span-1 bg-gray-50 rounded-lg p-3 border ${showVarsMobile ? "block" : "hidden"} md:block`}>
                <VariablesPanel channel={channel} onInsert={insertAtCursor} />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t bg-white sticky bottom-0">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initial ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
