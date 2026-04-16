// src/pages/settings/IntegrationsPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, XCircle, Mail, MessageSquare,
  DollarSign, Brain, Phone, Settings2, Zap, Eye, EyeOff,
  Key, Link as LinkIcon, AtSign, Shield, Server, X,
  RefreshCw, Hash, Globe,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  integrationsAPI,
  type IntegrationTab,
  type TabData,
} from "@/lib/integrationsAPI";
import { createPortal } from "react-dom";


// ─── Theme ────────────────────────────────────────────────────────────────────
const N  = "#0e3658";   
const O  = "#e67e22";   
const BG = "#f8fafc";   // Very light blue-gray background
const BD = "#e2e8f0";   // Light border color
const MU = "#5a7184";   // Muted text color

// Tab-specific header colors
const TAB_HEADER_COLORS: Record<IntegrationTab, { bg: string; border: string; text: string }> = {
  email:     { bg: "#2563eb", border: "#1d4ed8", text: "#ffffff" }, // Blue for SMTP/Email
  sms:       { bg: "#16a34a", border: "#15803d", text: "#ffffff" }, // Green for SMS
  whatsapp:  { bg: "#0d9488", border: "#128C7E", text: "#ffffff" }, // WhatsApp green
  razorpay:  { bg: "#0b132b", border: "#1e2a5e", text: "#ffffff" }, // Dark blue for Razorpay
  stripe:    { bg: "#635bff", border: "#4a42d9", text: "#ffffff" }, // Stripe purple
  chatgpt:   { bg: "#10a37f", border: "#0e8a6b", text: "#ffffff" }, // OpenAI green
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 cursor-pointer"
    style={{ background: checked ? N : "#cbd5e1" }}
  >
    <span
      className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ml-0.5"
      style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
    />
  </button>
);

// ─── Field definitions ───────────────────────────────────────────────────────
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "select";
  required: boolean;
  placeholder?: string;
  icon?: "key" | "at" | "link" | "server" | "hash" | "phone";
  options?: string[];
  half?: boolean; // occupies half width in 2-col grid
}

const PROVIDER_FIELDS: Record<IntegrationTab, FieldDef[]> = {
  email: [
        { key: "host",           label: "SMTP Host",       type: "text",   required: true, placeholder: "smtp.gmail.com", icon: "server", half: true },
    { key: "port",           label: "Port",            type: "text",   required: true, placeholder: "587", half: true },
    { key: "username",       label: "Username",        type: "text",   required: true, placeholder: "you@gmail.com", icon: "at", half: true },
    { key: "password",       label: "Password",        type: "password", required: true, placeholder: "App password", half: true },
 { key: "from_address",   label: "From Email",      type: "text",   required: true, placeholder: "noreply@company.com", icon: "at", half: true },
    { key: "from_name",      label: "From Name",       type: "text",   required: false, placeholder: "Resale Expert", half: true },
  ],
  sms: [
    { key: "sms_provider", label: "API Provider",         type: "select", required: true, half: true,
      options: ["MSG91","TWILIO","AWS SNS","VONAGE","TEXTMAGIC","MESSAGEBIRD","PLIVO"] },
    { key: "api_key",      label: "ID/Key",          type: "password",required: true, placeholder: "Your API Key", icon: "key", half: true },
    { key: "token",        label: "Token / Secret",   type: "password",required: false, placeholder: "Auth Token", half: true },
        { key: "sms_number",   label: "SMS Number",      type: "text",   required: false, placeholder: "+13159152581", icon: "phone", half: true },

    { key: "sms_from",     label: "SMS From",      type: "text",   required: false, placeholder: "ResaleExpert", half: true },
  ],
  whatsapp: [
    { key: "phone_number_id", label: "Phone Number ID", type: "text",     required: true, placeholder: "1234567890", icon: "key", half: true },
    { key: "waba_id",         label: "WABA ID",          type: "text",     required: true, placeholder: "WhatsApp Business Account ID", half: true },
    { key: "access_token",    label: "Access Token",     type: "password", required: true, placeholder: "EAAxxxx..." },
    { key: "webhook_url",     label: "Webhook URL",      type: "url",      required: false, placeholder: "https://your-domain.com/webhooks/whatsapp", icon: "link" },
  ],
  razorpay: [
    { key: "key_id",         label: "Key ID",         type: "text",     required: true, placeholder: "rzp_test_xxxxx", icon: "key", half: true },
    { key: "key_secret",     label: "Key Secret",     type: "password", required: true, placeholder: "Keep on server", half: true },
    { key: "webhook_secret", label: "Webhook Secret", type: "password", required: true, placeholder: "Webhook verification secret", half: true },
  ],
  stripe: [
    { key: "publishable_key", label: "Publishable Key (pk_...)", type: "text",     required: true, placeholder: "pk_test_xxxxx", icon: "key", half: true },
    { key: "secret_key",      label: "Secret Key (sk_...)",     type: "password", required: true, placeholder: "sk_test_...", half: true },
    { key: "webhook_secret",  label: "Webhook Signing Secret",  type: "password", required: true, placeholder: "whsec_...", half: true },
    { key: "webhook_url",     label: "Webhook URL",             type: "url",      required: true, placeholder: "https://your-domain.com/webhooks/stripe", icon: "link", half: true },
  ],
  chatgpt: [
    { key: "api_key", label: "OpenAI API Key", type: "password", required: true, placeholder: "sk-proj-...", icon: "key" },
    { key: "model",   label: "Model",          type: "select",   required: false,
      options: ["gpt-4o","gpt-4o-mini","gpt-4-turbo","gpt-3.5-turbo"] },
  ],
};

// ─── Card meta ────────────────────────────────────────────────────────────────
interface CardMeta {
  tab: IntegrationTab;
  label: string;
  subLabel: string;
  description: string;
  icon: React.ReactNode;
  category: "email" | "communication" | "payment" | "ai";
  previewKeys: Array<{ key: string; label: string }>;
}

const CARD_META: CardMeta[] = [
  {
    tab: "email", label: "SMTP / Email", subLabel: "Email API", description: "Send and receive emails via SMTP or Mailgun.",
    icon: <Mail className="h-5 w-5" />, category: "email",
    previewKeys: [
      { key: "host",         label: "SMTP Host" },
      { key: "port",  label: "Port" },
      { key: "username",           label: "Username" },
      { key: "password",   label: "Password" },
      { key: "from_address",   label: "From Email" },
      { key: "from_name",   label: "From Name" },
    ],
  },
  {
    tab: "sms", label: "SMS Integration", subLabel: "MSG91 / Twilio", description: "Send SMS messages through your provider.",
    icon: <MessageSquare className="h-5 w-5" />, category: "communication",
    previewKeys: [
      { key: "sms_provider", label: "API Provider" },
       { key: "api_key",      label: "ID/Key"},
      { key: "token",        label: "Token / Secret"},
       { key: "sms_number",   label: "SMS Number"},
       { key: "sms_from",     label: "SMS From"},
    ],
  },
  {
    tab: "whatsapp", label: "WhatsApp Business", subLabel: "Meta", description: "WhatsApp Cloud API for customer messaging.",
    icon: <Phone className="h-5 w-5" />, category: "communication",
    previewKeys: [
      { key: "phone_number_id", label: "Phone Number ID" },
      { key: "waba_id",         label: "WABA ID" },
      { key: "access_token",    label: "Access Token"},
      { key: "webhook_url",     label: "Webhook URL"},
    ],
  },
  {
    tab: "razorpay", label: "Payment Gateway", subLabel: "Razorpay", description: "Accept online payments via Razorpay gateway.",
    icon: <IndianRupee className="h-5 w-5" />, category: "payment",
    previewKeys: [
      { key: "key_id",      label: "Key ID" },
      { key: "key_secret",     label: "Key Secret"},
      { key: "webhook_secret", label: "Webhook Secret"},
    ],
  },
  {
    tab: "stripe", label: "Payment Gateway", subLabel: "Stripe", description: "Global payments, billing and webhooks via Stripe.",
    icon: <IndianRupee className="h-5 w-5" />, category: "payment",
    previewKeys: [
      { key: "publishable_key", label: "Publishable Key" },
      { key: "secret_key",      label: "Secret Key "},
      { key: "webhook_secret",  label: "Webhook Signing Secret"},
      { key: "webhook_url",     label: "Webhook" },
    ],
  },
  {
    tab: "chatgpt", label: "ChatGPT / OpenAI", subLabel: "OpenAI", description: "Use OpenAI models to automate support workflows.",
    icon: <Brain className="h-5 w-5" />, category: "ai",
    previewKeys: [
      { key: "api_key", label: "OpenAI API Key"},
      { key: "model",   label: "Model" },
    ],
  },
];

type TabFilter = "all" | "email" | "communication" | "payment" | "ai";

const TAB_FILTERS: Array<{ key: TabFilter; label: string; icon: React.ReactNode }> = [
  { key: "all",           label: "All",           icon: <Globe          className="h-4 w-4" /> },
  { key: "email",         label: "Email",          icon: <Mail           className="h-4 w-4" /> },
  { key: "communication", label: "Communication",  icon: <MessageSquare  className="h-4 w-4" /> },
  { key: "payment",       label: "Payment",        icon: <IndianRupee    className="h-4 w-4" /> },
  { key: "ai",            label: "AI",             icon: <Brain          className="h-4 w-4" /> },
];

// ─── Category icon bg ─────────────────────────────────────────────────────────
const catStyle = (cat: string) => ({
  email:         { bg: `${N}12`,   color: N    },
  communication: { bg: `${O}12`,   color: O    },
  payment:       { bg: "#dcfce7",  color: "#15803d" },
  ai:            { bg: "#f3e8ff",  color: "#7c3aed" },
}[cat] ?? { bg: `${N}12`, color: N });

// ─── Truncate display value ───────────────────────────────────────────────────
const trunc = (v: string | null | undefined, n = 14) => {
  if (!v) return "—";
  return v.length > n ? v.slice(0, n) + "…" : v;
};

// ─── Field input inside modal ─────────────────────────────────────────────────
const ModalInput = ({
  def, value, onChange, error,
}: { def: FieldDef; value: string; onChange: (v: string) => void; error?: string }) => {
  const [show, setShow] = useState(false);
  const isPass = def.type === "password";
  const type   = isPass ? (show ? "text" : "password") : def.type === "url" ? "url" : "text";

  const IconEl = {
    key: Key, at: AtSign, link: LinkIcon, server: Server, hash: Hash, phone: Phone,
  }[def.icon ?? ""] as any;

  const borderColor = error ? "#ef4444" : BD;

  if (def.type === "select") {
    return (
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: error ? "#ef4444" : N }}>
          {def.label}{def.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border bg-white outline-none transition-all"
          style={{ borderColor, color: N }}
        >
          <option value="">— Select —</option>
          {def.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: error ? "#ef4444" : N }}>
        {def.label}{def.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {IconEl && (
          <IconEl className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: MU }} />
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={def.placeholder}
          autoComplete={isPass ? "new-password" : "off"}
          className="w-full py-2 text-sm rounded-lg border outline-none transition-all"
          style={{
            paddingLeft:  IconEl  ? "2rem"  : "0.75rem",
            paddingRight: isPass  ? "2rem"  : "0.75rem",
            borderColor, color: N,
          }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: MU }}>
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ─── Compact Configure Modal ──────────────────────────────────────────────────
// ─── Compact Configure Modal ──────────────────────────────────────────────────
const ConfigureModal = ({
  meta, config, onClose, onSave,
}: {
  meta: CardMeta;
  config: Record<string, string | null>;
  onClose: () => void;
  onSave: (tab: IntegrationTab, cfg: Record<string, string>) => Promise<void>;
}) => {
  const fields = PROVIDER_FIELDS[meta.tab];
  const [form,    setForm]    = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.key] = config[f.key] ?? ""; });
    return init;
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [saving,  setSaving]  = useState(false);
  const cs = catStyle(meta.category);
  const headerColor = TAB_HEADER_COLORS[meta.tab] || { bg: N, border: O, text: "#ffffff" };

  const setField = (key: string, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    fields.forEach(f => {
      if (f.required && !String(form[f.key] ?? "").trim()) e[f.key] = `${f.label} is required`;
    });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(meta.tab, form);
      onClose();
    } catch { /* toast handled in parent */ }
    finally { setSaving(false); }
  };

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
     className="flex items-center justify-center p-4"
style={{ 
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15,43,61,0.6)", 
  backdropFilter: "blur(4px)",
  zIndex: 999999
}}
      onClick={onBackdrop}
    >
      <div
        className="bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 560, maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with dynamic color based on tab */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: headerColor.bg, borderBottom: `2px solid ${headerColor.border}` }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${headerColor.border}40` }}>
            <span style={{ color: headerColor.text }}>{meta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white leading-tight">{meta.label}</h2>
            <p className="text-xs" style={{ color: `${headerColor.text}cc` }}>{meta.subLabel} — Configure Integration</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: BG }}>
          {/* Security note */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: `${N}08`, border: `1px solid ${N}15`, color: N }}>
            <Shield className="h-3.5 w-3.5 shrink-0" style={{ color: N }} />
            Secrets are stored encrypted and never exposed after saving.
          </div>

          {/* Form grid - responsive: 1 column on mobile, 2 columns on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className={f.half === false ? "sm:col-span-2" : f.type === "url" ? "sm:col-span-2" : ""}>
                <ModalInput
                  def={f}
                  value={form[f.key] ?? ""}
                  onChange={v => setField(f.key, v)}
                  error={errors[f.key]}
                />
              </div>
            ))}
          </div>

          {/* Additional note for SMS */}
          {meta.tab === "sms" && (
            <div className="text-xs p-2 rounded-lg" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
              ⚡ Sender ID must be pre-approved by your SMS provider. Use Transactional route for OTP & alerts.
            </div>
          )}

         
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-5 py-3 border-t" style={{ borderColor: BD }}>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
            style={{ borderColor: BD, color: N }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: headerColor.bg }}  // ← CHANGED: Now uses dynamic header color
          >
            {saving
              ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Saving…</>
              : <><CheckCircle className="h-3.5 w-3.5" style={{ color: headerColor.border }} />Save Configuration</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ─── Integration Card ─────────────────────────────────────────────────────────
// ─── Integration Card ─────────────────────────────────────────────────────────
const IntegrationCard = ({
  meta, data, onToggle, onConfigure,
}: {
  meta: CardMeta;
  data: TabData | null;
  onToggle: (tab: IntegrationTab, val: boolean) => Promise<void>;
  onConfigure: (meta: CardMeta) => void;
}) => {
  const [toggling, setToggling] = useState(false);
  const isActive    = data?.is_active ?? false;
  const config      = data?.config ?? {};
  const isConnected = Object.values(config).some(v => v && v.trim() !== "");
  const cs = catStyle(meta.category);

  const handleToggle = async (val: boolean) => {
    if (!isConnected) { toast.warn("Please configure this integration first"); return; }
    setToggling(true);
    try { await onToggle(meta.tab, val); }
    finally { setToggling(false); }
  };

  return (
    <div
      className="bg-white rounded-2xl border flex flex-col h-full transition-all hover:shadow-lg"
      style={{
        borderColor: isActive && isConnected ? `${O}60` : BD,
        boxShadow: isActive && isConnected ? `0 0 0 1px ${O}30` : undefined,
      }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cs.bg }}>
            <span style={{ color: cs.color }}>{meta.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              {isConnected && <CheckCircle className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />}
              <h3 className="font-bold text-sm leading-tight" style={{ color: N }}>{meta.label}</h3>
            </div>
            <p className="text-xs" style={{ color: MU }}>{meta.subLabel}</p>
          </div>
        </div>
        <Toggle checked={isActive} onChange={handleToggle} disabled={toggling} />
      </div>

      {/* Description */}
      <p className="px-5 text-xs leading-relaxed" style={{ color: MU }}>{meta.description}</p>

      {/* Config preview */}
      <div className="mx-5 mt-4 rounded-xl p-3" style={{ background: BG, border: `1px solid ${BD}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: MU }}>Configured</p>
        <div className="space-y-1.5">
          {meta.previewKeys.map(pk => (
            <div key={pk.key} className="flex items-center justify-between gap-2">
              <span className="text-xs" style={{ color: MU }}>{pk.label}</span>
              <span className="text-xs font-medium text-right" style={{ color: N }}>
                {trunc(config[pk.key], 18)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* THIS DIV - Fixed height container for consistent button + hint alignment */}
      <div className="flex flex-col flex-1 justify-end">
        {/* Instructions hint - now positioned consistently */}
        <div
          className="mx-5 mt-4 px-3 py-2 rounded-lg text-xs"
          style={{
            background: isConnected ? "#f0fdf4" : "#eff6ff",
            color:      isConnected ? "#15803d" : "#1d4ed8",
            border:     `1px solid ${isConnected ? "#bbf7d0" : "#bfdbfe"}`,
          }}
        >
          {isConnected
            ? `Configure ${meta.subLabel} to update settings.`
            : `Configure ${meta.subLabel} to enable this integration.`}
        </div>

        {/* Configure button - now fixed position */}
        <div className="p-5 pt-3">
          <button
            onClick={() => onConfigure(meta)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: N }}
          >
            <Settings2 className="h-4 w-4" style={{ color: O }} />
            Configure
          </button>
        </div>
      </div>

      {/* Status footer - sticky at bottom */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-b-2xl border-t"
        style={{ borderColor: BD, background: BG }}
      >
        <span className="text-xs" style={{ color: MU }}>Status</span>
        {isConnected && isActive ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#16a34a" }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#16a34a" }} />
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: MU }}>
            <XCircle className="h-3.5 w-3.5" />
            {isConnected ? "Disabled" : "Disconnected"}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allData,    setAllData]    = useState<Record<string, TabData>>({});
  const [activeTab,  setActiveTab]  = useState<TabFilter>("all");
  const [modalMeta,  setModalMeta]  = useState<CardMeta | null>(null);

  const fetchAll = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    try {
      const data = await integrationsAPI.getAll();
      setAllData(data as any);
    } catch (err) {
      console.error("fetchAll error:", err);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggle = async (tab: IntegrationTab, val: boolean) => {
    await integrationsAPI.toggleByTab(tab, val);
    toast.success(`${tab} ${val ? "enabled" : "disabled"}`);
    await fetchAll(true);
  };

  const handleSave = async (tab: IntegrationTab, config: Record<string, string>) => {
    await integrationsAPI.saveByTab(tab, config);
    toast.success(`${tab} configuration saved`);
    await fetchAll(true);
  };

  const visibleCards = CARD_META.filter(m =>
    activeTab === "all" ? true : m.category === activeTab
  );

  if (loading) return (
    <div className="flex justify-center py-2"><LoadingSpinner size="lg" /></div>
  );

  return (
<div className="flex flex-col p-5 sm:p-4 gap-5" style={{ background: BG,  overflow: "hidden" }}>

      {/* Header - responsive */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: N }}>
              <Zap className="h-4 w-4" style={{ color: O }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: N }}>Integrations</h1>
          </div>
          <p className="text-sm mt-0.5" style={{ color: MU }}>Configure platform settings and preferences</p>
        </div>

       
      </div>

      {/* Tab Filter Bar - responsive scroll */}
      <div
        className="flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto shrink-0"
        style={{ background: "white", border: `1px solid ${BD}` }}
      >
        {TAB_FILTERS.map(t => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0"
              style={{
                background: active ? N : "transparent",
                color:      active ? "white" : MU,
                boxShadow:  active ? `0 2px 8px ${N}30` : undefined,
              }}
            >
              <span style={{ color: active ? O : MU }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Cards Grid - responsive columns */}
<div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 cards-grid "
  style={{
    maxHeight: "calc(100vh - 250px)",   
    overflowY: "auto",
    paddingRight: "4px", 
    paddingBottom:"3px",          
    scrollbarWidth: "thin",        
    scrollbarColor: "#cbd5e1 transparent", 
    alignContent: "start",       
  }}
>   
    {visibleCards.map(meta => (
          <IntegrationCard
            key={meta.tab}
            meta={meta}
            data={allData[meta.tab] ?? null}
            onToggle={handleToggle}
            onConfigure={m => setModalMeta(m)}
          />
        ))}
      </div>

      {/* Configure Modal */}
      {modalMeta && (
        <ConfigureModal
          meta={modalMeta}
          config={allData[modalMeta.tab]?.config ?? {}}
          onClose={() => setModalMeta(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default IntegrationsPage;