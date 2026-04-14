/**
 * WhatsApp Business CRM — Complete Frontend
 * React + TypeScript | Single File
 * Connects to your own backend (no third-party dependency)
 *
 * Setup:
 *   1. Set API_BASE to your backend URL
 *   2. Set WS_URL to your WebSocket URL
 *   3. npm install react react-dom
 */

import React, {
    useState, useEffect, useRef, useCallback, createContext, useContext,
} from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:4000/api";
const WS_URL = "ws://localhost:4000/ws";
const CURRENT_AGENT = { id: "agent1", name: "Ankit Sharma", avatar: "AS" };

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ChatStatus = "open" | "pending" | "resolved";
type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";
type MsgDirection = "in" | "out";
type MsgType = "text" | "template" | "image" | "buttons" | "interactive_reply" | "button_reply" | string;
type ActiveView = "chats" | "leads" | "broadcast" | "settings";

interface Message {
    id: string;
    direction: MsgDirection;
    content: string;
    type: MsgType;
    timestamp: string;
    status?: "sent" | "delivered" | "read" | "received";
    waMessageId?: string;
    agentId?: string;
    templateName?: string;
    buttons?: { id: string; title: string }[];
}

interface Contact {
    id: string;
    phone: string;
    name: string;
    profileName?: string;
    avatarInitials: string;
    chatStatus: ChatStatus;
    tag: string;
    leadStatus?: LeadStatus;
    assignedAgent?: string;
    assignedAgentName?: string;
    unreadCount: number;
    lastMessageAt: string;
    email?: string;
    company?: string;
    notes?: string;
    leadId?: string;
}

interface Lead {
    id: string;
    contactPhone: string;
    contactName: string;
    name: string;
    email?: string;
    company?: string;
    value: number;
    source: string;
    stage: string;
    notes?: string;
    createdAt: string;
}

interface Agent { id: string; name: string; email: string; status: string; avatar: string; }
interface Template { id: string; name: string; category: string; status: string; language: string; components: { type: string; text: string }[]; }

interface Stats {
    totalContacts: number; open: number; pending: number; resolved: number; totalLeads: number; newLeads: number;
}

// ─── COLORS ───────────────────────────────────────────────────────────────────
const COLORS = ["#1D9E75", "#185FA5", "#534AB7", "#993C1D", "#854F0B", "#993556", "#0F6E56", "#BA7517"];
const AVATAR_BG: Record<string, string> = { "#1D9E75": "#E1F5EE", "#185FA5": "#E6F1FB", "#534AB7": "#EEEDFE", "#993C1D": "#FAECE7", "#854F0B": "#FAEEDA", "#993556": "#FBEAF0", "#0F6E56": "#D0F0E6", "#BA7517": "#FDF3DC" };
const phoneColor = (phone: string) => COLORS[phone.charCodeAt(phone.length - 1) % COLORS.length];

// ─── API HELPERS ──────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" }, ...opts,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API Error");
    return data as T;
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
interface CRMCtx {
    contacts: Contact[];
    messages: Record<string, Message[]>;
    leads: Lead[];
    agents: Agent[];
    templates: Template[];
    stats: Stats;
    activePhone: string | null;
    setActivePhone: (p: string | null) => void;
    sendText: (to: string, text: string) => Promise<void>;
    sendTemplate: (to: string, name: string, lang: string, comps: unknown[]) => Promise<void>;
    sendButtons: (to: string, body: string, buttons: { id: string; title: string }[]) => Promise<void>;
    resolveChat: (phone: string) => Promise<void>;
    assignAgent: (phone: string, agentId: string, agentName: string) => Promise<void>;
    convertToLead: (phone: string, data: Partial<Lead>) => Promise<void>;
    updateContact: (phone: string, data: Partial<Contact>) => Promise<void>;
    markRead: (phone: string) => Promise<void>;
    broadcast: (phones: string[], templateName: string, lang: string, comps: unknown[]) => Promise<void>;
    refreshAll: () => Promise<void>;
}
const Ctx = createContext<CRMCtx>({} as CRMCtx);
const useCRM = () => useContext(Ctx);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
function CRMProvider({ children }: { children: React.ReactNode }) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [stats, setStats] = useState<Stats>({ totalContacts: 0, open: 0, pending: 0, resolved: 0, totalLeads: 0, newLeads: 0 });
    const [activePhone, setActivePhoneRaw] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const setActivePhone = useCallback(async (phone: string | null) => {
        setActivePhoneRaw(phone);
        if (phone) {
            try {
                const { messages: msgs } = await apiFetch<{ messages: Message[] }>(`/messages/${phone}`);
                setMessages(prev => ({ ...prev, [phone]: msgs }));
                await apiFetch(`/contacts/${phone}/read`, { method: "POST" });
                setContacts(prev => prev.map(c => c.phone === phone ? { ...c, unreadCount: 0 } : c));
            } catch { }
        }
    }, []);

    const refreshAll = useCallback(async () => {
        try {
            const [{ contacts: cs }, { leads: ls }, { agents: ag }, { templates: tl }, { stats: st }] = await Promise.all([
                apiFetch<{ contacts: Contact[] }>("/contacts"),
                apiFetch<{ leads: Lead[] }>("/contacts/leads/all"),
                apiFetch<{ agents: Agent[] }>("/contacts/meta/agents"),
                apiFetch<{ templates: Template[] }>("/contacts/meta/templates"),
                apiFetch<{ stats: Stats }>("/contacts/meta/stats"),
            ]);
            setContacts(cs); setLeads(ls); setAgents(ag); setTemplates(tl); setStats(st);
        } catch (e) { console.error("Refresh failed:", e); }
    }, []);

    // WebSocket connection
    useEffect(() => {
        function connect() {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => console.log("[WS] Connected");
            ws.onmessage = (evt) => {
                try {
                    const { type, data } = JSON.parse(evt.data);
                    if (type === "new_message") {
                        const { contact, message }: { contact: Contact; message: Message } = data;
                        setMessages(prev => ({
                            ...prev,
                            [contact.phone]: [...(prev[contact.phone] || []), message],
                        }));
                        setContacts(prev => {
                            const exists = prev.find(c => c.phone === contact.phone);
                            if (exists) {
                                return prev
                                    .map(c => c.phone === contact.phone ? { ...c, ...contact } : c)
                                    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
                            }
                            return [contact, ...prev];
                        });
                        setStats(prev => ({ ...prev, totalContacts: Math.max(prev.totalContacts, 1) }));
                    }
                    if (type === "contact_update") {
                        const { contact }: { contact: Contact } = data;
                        setContacts(prev => prev.map(c => c.phone === contact.phone ? { ...c, ...contact } : c));
                    }
                    if (type === "message_status") {
                        const { messageId, status, phone } = data;
                        setMessages(prev => ({
                            ...prev,
                            [phone]: (prev[phone] || []).map(m => m.waMessageId === messageId ? { ...m, status } : m),
                        }));
                    }
                    if (type === "lead_converted") {
                        const { lead }: { lead: Lead } = data;
                        setLeads(prev => [lead, ...prev]);
                        setStats(prev => ({ ...prev, totalLeads: prev.totalLeads + 1, newLeads: prev.newLeads + 1 }));
                    }
                } catch { }
            };
            ws.onclose = () => { console.log("[WS] Disconnected, reconnecting..."); setTimeout(connect, 3000); };
            ws.onerror = () => ws.close();
        }
        connect();
        return () => wsRef.current?.close();
    }, []);

    useEffect(() => { refreshAll(); }, [refreshAll]);

    const sendText = useCallback(async (to: string, text: string) => {
        await apiFetch("/messages/send/text", { method: "POST", body: JSON.stringify({ to, text, agentId: CURRENT_AGENT.id }) });
    }, []);

    const sendTemplate = useCallback(async (to: string, templateName: string, language: string, components: unknown[]) => {
        await apiFetch("/messages/send/template", { method: "POST", body: JSON.stringify({ to, templateName, language, components, agentId: CURRENT_AGENT.id }) });
    }, []);

    const sendButtons = useCallback(async (to: string, bodyText: string, buttons: { id: string; title: string }[]) => {
        await apiFetch("/messages/send/buttons", { method: "POST", body: JSON.stringify({ to, bodyText, buttons, agentId: CURRENT_AGENT.id }) });
    }, []);

    const resolveChat = useCallback(async (phone: string) => {
        const { contact } = await apiFetch<{ contact: Contact }>(`/contacts/${phone}/resolve`, { method: "POST" });
        setContacts(prev => prev.map(c => c.phone === phone ? { ...c, ...contact } : c));
        setStats(prev => ({ ...prev, open: Math.max(0, prev.open - 1), resolved: prev.resolved + 1 }));
    }, []);

    const assignAgent = useCallback(async (phone: string, agentId: string, agentName: string) => {
        const { contact } = await apiFetch<{ contact: Contact }>(`/contacts/${phone}/assign`, { method: "POST", body: JSON.stringify({ agentId, agentName }) });
        setContacts(prev => prev.map(c => c.phone === phone ? { ...c, ...contact } : c));
    }, []);

    const convertToLead = useCallback(async (phone: string, data: Partial<Lead>) => {
        await apiFetch(`/contacts/${phone}/convert-lead`, { method: "POST", body: JSON.stringify(data) });
        await refreshAll();
    }, [refreshAll]);

    const updateContact = useCallback(async (phone: string, data: Partial<Contact>) => {
        const { contact } = await apiFetch<{ contact: Contact }>(`/contacts/${phone}`, { method: "PATCH", body: JSON.stringify(data) });
        setContacts(prev => prev.map(c => c.phone === phone ? { ...c, ...contact } : c));
    }, []);

    const markRead = useCallback(async (phone: string) => {
        await apiFetch(`/contacts/${phone}/read`, { method: "POST" });
        setContacts(prev => prev.map(c => c.phone === phone ? { ...c, unreadCount: 0 } : c));
    }, []);

    const broadcast = useCallback(async (phones: string[], templateName: string, lang: string, comps: unknown[]) => {
        await apiFetch("/messages/broadcast", { method: "POST", body: JSON.stringify({ phones, templateName, language: lang, components: comps }) });
    }, []);

    return (
        <Ctx.Provider value={{
            contacts, messages, leads, agents, templates, stats, activePhone, setActivePhone,
            sendText, sendTemplate, sendButtons, resolveChat, assignAgent, convertToLead,
            updateContact, markRead, broadcast, refreshAll,
        }}>
            {children}
        </Ctx.Provider>
    );
}

// ─── SMALL UI ATOMS ───────────────────────────────────────────────────────────
const Av: React.FC<{ initials: string; phone: string; size?: number; online?: boolean }> = ({ initials, phone, size = 38, online }) => {
    const c = phoneColor(phone);
    return (
        <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: size, height: size, borderRadius: "50%", background: AVATAR_BG[c] || "#E1F5EE", color: c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.33 }}>
                {initials?.slice(0, 2).toUpperCase() || "?"}
            </div>
            {online !== undefined && <div style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: online ? "#1D9E75" : "#ccc", border: "2px solid #fff" }} />}
        </div>
    );
};

const Tick: React.FC<{ status?: string }> = ({ status }) => {
    if (!status || status === "received") return null;
    return <span style={{ fontSize: 11, color: status === "read" ? "#34B7F1" : "#aaa", marginLeft: 2 }}>{status === "sent" ? "✓" : "✓✓"}</span>;
};

const Tag: React.FC<{ label: string; color?: string; bg?: string }> = ({ label, color = "#0F6E56", bg = "#E1F5EE" }) => (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 10 }}>{label}</span>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }> = ({ variant = "ghost", style, ...p }) => {
    const styles: Record<string, React.CSSProperties> = {
        primary: { background: "#1D9E75", color: "#fff", border: "none" },
        ghost: { background: "transparent", color: "#555", border: "1px solid #E0E0E0" },
        danger: { background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" },
    };
    return <button style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s", ...styles[variant], ...style }} {...p} />;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, style, ...p }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {label && <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>{label.toUpperCase()}</label>}
        <input style={{ border: "1px solid #E0E0E0", borderRadius: 8, padding: "8px 11px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", color: "#1a1a1a", ...style }} {...p} />
    </div>
);

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; width?: number }> = ({ title, onClose, children, width = 420 }) => (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 24, width, maxHeight: "85vh", overflowY: "auto", border: "1px solid #E0E0E0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>{title}</div>
                <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
            </div>
            {children}
        </div>
    </div>
);

// ─── CONVERT LEAD MODAL ───────────────────────────────────────────────────────
const ConvertLeadModal: React.FC<{ contact: Contact; onClose: () => void }> = ({ contact, onClose }) => {
    const { convertToLead } = useCRM();
    const [form, setForm] = useState({ name: contact.name, email: contact.email || "", company: contact.company || "", value: "", source: "WhatsApp", notes: "" });
    const [loading, setLoading] = useState(false);
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

    const submit = async () => {
        setLoading(true);
        try {
            await convertToLead(contact.phone, { ...form, value: parseFloat(form.value) || 0 });
            onClose();
        } catch (e: unknown) { alert((e as Error).message); }
        finally { setLoading(false); }
    };

    return (
        <Modal title="🎯 Convert to Lead" onClose={onClose}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Input label="Name" value={form.name} onChange={set("name")} />
                <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="lead@company.com" />
                <Input label="Company" value={form.company} onChange={set("company")} placeholder="Company name" />
                <Input label="Deal Value (₹)" type="number" value={form.value} onChange={set("value")} placeholder="0" />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>SOURCE</label>
                    <select value={form.source} onChange={set("source")} style={{ border: "1px solid #E0E0E0", borderRadius: 8, padding: "8px 11px", fontSize: 13, fontFamily: "inherit", background: "#FAFAFA" }}>
                        {["WhatsApp", "Website", "Referral", "Ad Campaign", "Cold Call", "Email"].map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>NOTES</label>
                    <textarea value={form.notes} onChange={set("notes")} rows={3} placeholder="Add notes about this lead..." style={{ border: "1px solid #E0E0E0", borderRadius: 8, padding: "8px 11px", fontSize: 13, fontFamily: "inherit", background: "#FAFAFA", resize: "vertical", color: "#1a1a1a" }} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Btn onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
                    <Btn variant="primary" onClick={submit} disabled={loading} style={{ flex: 1 }}>{loading ? "Converting..." : "Convert to Lead →"}</Btn>
                </div>
            </div>
        </Modal>
    );
};

// ─── TEMPLATE MODAL ───────────────────────────────────────────────────────────
const TemplateModal: React.FC<{ phone: string; onClose: () => void }> = ({ phone, onClose }) => {
    const { templates, sendTemplate } = useCRM();
    const [selected, setSelected] = useState<Template | null>(null);
    const [params, setParams] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const bodyText = selected?.components.find(c => c.type === "BODY")?.text || "";
    const paramCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length;

    const preview = bodyText.replace(/\{\{(\d+)\}\}/g, (_, i) => params[parseInt(i) - 1] || `{{${i}}}`);

    const send = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const comps = paramCount > 0 ? [{ type: "body", parameters: params.map(v => ({ type: "text", text: v || " " })) }] : [];
            await sendTemplate(phone, selected.name, selected.language, comps);
            onClose();
        } catch (e: unknown) { alert((e as Error).message); }
        finally { setLoading(false); }
    };

    return (
        <Modal title="📋 Send Template" onClose={onClose} width={480}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {templates.filter(t => t.status === "APPROVED").map(t => (
                        <div key={t.id} onClick={() => { setSelected(t); setParams([]); }} style={{ padding: "10px 12px", border: `2px solid ${selected?.id === t.id ? "#1D9E75" : "#E0E0E0"}`, borderRadius: 10, cursor: "pointer", background: selected?.id === t.id ? "#F0FBF7" : "#fff" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{t.name}</div>
                            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{t.category} · {t.language}</div>
                        </div>
                    ))}
                </div>

                {selected && (
                    <>
                        <div style={{ background: "#F0FBF7", border: "1px solid #B7E5D4", borderRadius: 10, padding: 12, fontSize: 13, color: "#1a1a1a", lineHeight: 1.6 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#0F6E56", marginBottom: 6 }}>PREVIEW</div>
                            {preview}
                        </div>
                        {Array.from({ length: paramCount }, (_, i) => (
                            <Input key={i} label={`Parameter {{${i + 1}}}`} value={params[i] || ""} placeholder={`Enter value for {{${i + 1}}}`}
                                onChange={e => setParams(p => { const n = [...p]; n[i] = e.target.value; return n; })} />
                        ))}
                    </>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Btn onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
                    <Btn variant="primary" onClick={send} disabled={!selected || loading} style={{ flex: 1 }}>{loading ? "Sending..." : "Send Template →"}</Btn>
                </div>
            </div>
        </Modal>
    );
};

// ─── ASSIGN MODAL ─────────────────────────────────────────────────────────────
const AssignModal: React.FC<{ phone: string; onClose: () => void }> = ({ phone, onClose }) => {
    const { agents, assignAgent } = useCRM();
    return (
        <Modal title="👤 Assign Agent" onClose={onClose} width={320}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {agents.map(a => (
                    <div key={a.id} onClick={async () => { await assignAgent(phone, a.id, a.name); onClose(); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid #E0E0E0", borderRadius: 10, cursor: "pointer", background: "#FAFAFA" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E1F5EE", color: "#0F6E56", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{a.avatar}</div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: a.status === "online" ? "#1D9E75" : "#aaa" }}>● {a.status}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

// ─── TRACKING BAR ─────────────────────────────────────────────────────────────
const TRACK_STEPS = ["Order Confirmed", "Dispatched", "Out for Delivery", "Delivered"];
const TrackingBar: React.FC<{ activeStep?: number; orderId?: string }> = ({ activeStep = 1, orderId }) => (
    <div style={{ background: "#F8FFFE", borderTop: "1px solid #E8E8E8", padding: "10px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#1D9E75", marginBottom: 8 }}>🚚 Order Tracking {orderId && `— ${orderId}`}</div>
        <div style={{ display: "flex", alignItems: "center" }}>
            {TRACK_STEPS.map((s, i) => (
                <React.Fragment key={s}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: i <= activeStep ? "#1D9E75" : "#E8E8E8", border: `3px solid ${i === activeStep ? "#0F6E56" : i < activeStep ? "#1D9E75" : "#E0E0E0"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: i === activeStep ? "0 0 0 3px rgba(29,158,117,0.15)" : "none" }}>
                            {i <= activeStep && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <span style={{ fontSize: 9, color: i <= activeStep ? "#0F6E56" : "#bbb", fontWeight: 700, textAlign: "center", maxWidth: 52, lineHeight: 1.2 }}>{s}</span>
                    </div>
                    {i < TRACK_STEPS.length - 1 && <div style={{ flex: 1, height: 2, marginBottom: 14, background: i < activeStep ? "#1D9E75" : "#E8E8E8" }} />}
                </React.Fragment>
            ))}
        </div>
    </div>
);

// ─── CHAT PANEL ───────────────────────────────────────────────────────────────
const ChatPanel: React.FC<{ contact: Contact }> = ({ contact }) => {
    const { messages, sendText, resolveChat } = useCRM();
    const [input, setInput] = useState("");
    const [modal, setModal] = useState<"template" | "assign" | "lead" | "buttons" | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [sending, setSending] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    const msgs = messages[contact.phone] || [];

    const QUICK_REPLIES = [
        "Thank you for reaching out! How can I help you?",
        "Your order is confirmed and will be dispatched soon.",
        "We apologize for the inconvenience. Let me check this.",
        "Refund has been initiated. Reflects in 5–7 business days.",
        "Please share your order ID so I can assist you better.",
        "Our team will contact you within 24 hours.",
    ];

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        setSending(true);
        try { await sendText(contact.phone, input.trim()); setInput(""); setShowQR(false); }
        catch (e: unknown) { alert("Send failed: " + (e as Error).message); }
        finally { setSending(false); }
    };

    const c = phoneColor(contact.phone);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", position: "relative", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "11px 18px", borderBottom: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Av initials={contact.avatarInitials} phone={contact.phone} size={38} />
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a" }}>{contact.name}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{contact.phone} {contact.assignedAgentName && <span>· 👤 {contact.assignedAgentName}</span>}</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <Tag label={contact.tag} />
                    {contact.leadStatus === "converted" && <Tag label="Lead ✓" color="#534AB7" bg="#EEEDFE" />}
                    <Btn onClick={() => setModal("assign")}>Assign</Btn>
                    {contact.leadStatus !== "converted" && (
                        <Btn onClick={() => setModal("lead")} style={{ background: "#EEEDFE", color: "#534AB7", border: "none" }}>🎯 Lead</Btn>
                    )}
                    {contact.chatStatus !== "resolved" ? (
                        <Btn variant="primary" onClick={() => resolveChat(contact.phone)}>✓ Resolve</Btn>
                    ) : (
                        <Tag label="✓ Resolved" color="#5F5E5A" bg="#F1EFE8" />
                    )}
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 6, background: "#FAFEF9" }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, background: "#E8F5F0", color: "#0F6E56", padding: "4px 12px", borderRadius: 10, fontWeight: 700 }}>Today</span>
                </div>

                {msgs.length === 0 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ccc", gap: 8 }}>
                        <div style={{ fontSize: 36 }}>💬</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>No messages yet</div>
                        <div style={{ fontSize: 12 }}>Send a template to start the conversation</div>
                    </div>
                )}

                {msgs.map((msg) => {
                    const isOut = msg.direction === "out";
                    return (
                        <div key={msg.id} style={{ display: "flex", flexDirection: isOut ? "row-reverse" : "row", alignItems: "flex-end", gap: 7 }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: isOut ? "#E1F5EE" : (AVATAR_BG[c] || "#E6F1FB"), color: isOut ? "#0F6E56" : c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>
                                {isOut ? CURRENT_AGENT.avatar : contact.avatarInitials?.slice(0, 2)}
                            </div>
                            <div style={{ maxWidth: "68%" }}>
                                <div style={{ background: isOut ? "#1D9E75" : "#fff", color: isOut ? "#fff" : "#1a1a1a", borderRadius: isOut ? "14px 14px 2px 14px" : "14px 14px 14px 2px", padding: "9px 13px", fontSize: 13, lineHeight: 1.55, border: isOut ? "none" : "1px solid #EFEFEF", wordBreak: "break-word" }}>
                                    {msg.type === "template" ? <span>📋 <em>{msg.content}</em></span> : msg.content}
                                    {msg.type === "buttons" && msg.buttons && (
                                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                                            {msg.buttons.map(b => (
                                                <div key={b.id} style={{ background: "rgba(255,255,255,0.2)", padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: "center", border: "1px solid rgba(255,255,255,0.3)" }}>{b.title}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 4, marginTop: 3, justifyContent: isOut ? "flex-end" : "flex-start", alignItems: "center" }}>
                                    <span style={{ fontSize: 10, color: "#aaa" }}>{new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                    {isOut && <Tick status={msg.status} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Tracking bar shown if tag contains "order" (customize as needed) */}
            {contact.tag?.toLowerCase().includes("order") && <TrackingBar activeStep={2} />}

            {/* Quick Replies */}
            {showQR && (
                <div style={{ background: "#fff", borderTop: "1px solid #E8E8E8", padding: "10px 16px", display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#aaa", letterSpacing: "0.06em" }}>QUICK REPLIES</div>
                    {QUICK_REPLIES.map((qr, i) => (
                        <div key={i} onClick={() => { setInput(qr); setShowQR(false); }}
                            style={{ fontSize: 12, color: "#333", padding: "7px 10px", border: "1px solid #E8E8E8", borderRadius: 8, cursor: "pointer", background: "#FAFAFA" }}>
                            {qr}
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ padding: "11px 14px", borderTop: "1px solid #E8E8E8", display: "flex", gap: 7, alignItems: "center", background: "#fff", flexShrink: 0 }}>
                <Btn onClick={() => setShowQR(p => !p)} style={{ padding: "7px 10px", background: showQR ? "#E1F5EE" : undefined, border: showQR ? "1px solid #B7E5D4" : undefined }} title="Quick Replies">⚡</Btn>
                <Btn onClick={() => setModal("template")} style={{ padding: "7px 10px" }} title="Templates">📋</Btn>
                <Btn onClick={() => setModal("buttons")} style={{ padding: "7px 10px" }} title="Send Buttons">🔘</Btn>
                <input
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Type a message..."
                    style={{ flex: 1, border: "1px solid #E0E0E0", borderRadius: 10, padding: "9px 13px", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#FAFAFA", color: "#1a1a1a" }}
                />
                <Btn variant="primary" onClick={handleSend} disabled={!input.trim() || sending} style={{ padding: "9px 16px" }}>{sending ? "..." : "Send →"}</Btn>
            </div>

            {/* Modals */}
            {modal === "template" && <TemplateModal phone={contact.phone} onClose={() => setModal(null)} />}
            {modal === "assign" && <AssignModal phone={contact.phone} onClose={() => setModal(null)} />}
            {modal === "lead" && <ConvertLeadModal contact={contact} onClose={() => setModal(null)} />}
            {modal === "buttons" && <ButtonsMsgModal phone={contact.phone} onClose={() => setModal(null)} />}
        </div>
    );
};

// ─── BUTTONS MESSAGE MODAL ────────────────────────────────────────────────────
const ButtonsMsgModal: React.FC<{ phone: string; onClose: () => void }> = ({ phone, onClose }) => {
    const { sendButtons } = useCRM();
    const [body, setBody] = useState("");
    const [btns, setBtns] = useState([{ id: "b1", title: "" }, { id: "b2", title: "" }]);
    const [loading, setLoading] = useState(false);
    const send = async () => {
        if (!body.trim() || btns.some(b => !b.title.trim())) return;
        setLoading(true);
        try { await sendButtons(phone, body, btns.filter(b => b.title.trim())); onClose(); }
        catch (e: unknown) { alert((e as Error).message); }
        finally { setLoading(false); }
    };
    return (
        <Modal title="🔘 Send Interactive Buttons" onClose={onClose} width={380}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>MESSAGE BODY</label>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="Message text..." style={{ border: "1px solid #E0E0E0", borderRadius: 8, padding: "8px 11px", fontSize: 13, fontFamily: "inherit", background: "#FAFAFA", color: "#1a1a1a", resize: "vertical" }} />
                </div>
                {btns.map((b, i) => (
                    <Input key={b.id} label={`Button ${i + 1}`} value={b.title} placeholder="Button text (max 20 chars)" maxLength={20}
                        onChange={e => setBtns(prev => prev.map((btn, idx) => idx === i ? { ...btn, title: e.target.value } : btn))} />
                ))}
                {btns.length < 3 && <Btn onClick={() => setBtns(p => [...p, { id: `b${Date.now()}`, title: "" }])}>+ Add Button</Btn>}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Btn onClick={onClose} style={{ flex: 1 }}>Cancel</Btn>
                    <Btn variant="primary" onClick={send} disabled={loading} style={{ flex: 1 }}>{loading ? "Sending..." : "Send →"}</Btn>
                </div>
            </div>
        </Modal>
    );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ activeView: ActiveView; setView: (v: ActiveView) => void }> = ({ activeView, setView }) => {
    const { contacts, stats } = useCRM();
    const [q, setQ] = useState("");
    const [tab, setTab] = useState<"all" | ChatStatus>("all");
    const { activePhone, setActivePhone } = useCRM();

    const filtered = contacts.filter(c => {
        const matchQ = !q || c.name?.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q) || c.tag?.toLowerCase().includes(q.toLowerCase());
        const matchTab = tab === "all" || c.chatStatus === tab;
        return matchQ && matchTab;
    });

    const navItems: { key: ActiveView; icon: string; label: string; badge?: number }[] = [
        { key: "chats", icon: "💬", label: "Chats", badge: stats.open },
        { key: "leads", icon: "🎯", label: "Leads", badge: stats.newLeads },
        { key: "broadcast", icon: "📢", label: "Broadcast" },
        { key: "settings", icon: "⚙️", label: "Settings" },
    ];

    return (
        <div style={{ width: 64, background: "#0F1923", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 4, flexShrink: 0 }}>
            {/* Logo */}
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.855L.057 23.882l6.201-1.629A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.525-5.176-1.438l-.371-.22-3.682.966.984-3.595-.242-.371A10.015 10.015 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
            </div>
            {navItems.map(n => (
                <div key={n.key} onClick={() => setView(n.key)} title={n.label} style={{ position: "relative", width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: activeView === n.key ? "#1D2A35" : "transparent", fontSize: 20 }}>
                    {n.icon}
                    {n.badge ? <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#E24B4A", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{n.badge > 9 ? "9+" : n.badge}</div> : null}
                </div>
            ))}
        </div>
    );
};

// ─── CONTACT LIST PANEL ───────────────────────────────────────────────────────
const ContactList: React.FC = () => {
    const { contacts, activePhone, setActivePhone, stats } = useCRM();
    const [q, setQ] = useState("");
    const [tab, setTab] = useState<"all" | ChatStatus>("all");

    const filtered = contacts.filter(c => {
        const matchQ = !q || c.name?.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q) || c.tag?.toLowerCase().includes(q.toLowerCase());
        return matchQ && (tab === "all" || c.chatStatus === tab);
    });

    const STATUS_DOT: Record<ChatStatus, string> = { open: "#1D9E75", pending: "#EF9F27", resolved: "#B4B2A9" };
    const tabs: { key: "all" | ChatStatus; label: string; count: number }[] = [
        { key: "all", label: "All", count: stats.totalContacts },
        { key: "open", label: "Open", count: stats.open },
        { key: "pending", label: "Pending", count: stats.pending },
        { key: "resolved", label: "Done", count: stats.resolved },
    ];

    return (
        <div style={{ width: 290, display: "flex", flexDirection: "column", borderRight: "1px solid #E8E8E8", background: "#FAFAFA", flexShrink: 0 }}>
            {/* Header */}
            <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #E8E8E8" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a", marginBottom: 10 }}>Conversations</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fff", border: "1px solid #E8E8E8", borderRadius: 9, padding: "7px 10px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#333", width: "100%", fontFamily: "inherit" }} />
                </div>
            </div>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #E8E8E8" }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "8px 2px", border: "none", background: "transparent", fontSize: 10, fontWeight: tab === t.key ? 800 : 500, color: tab === t.key ? "#1D9E75" : "#999", borderBottom: tab === t.key ? "2px solid #1D9E75" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit" }}>
                        {t.label} {t.count > 0 && <span style={{ fontSize: 9, background: tab === t.key ? "#E1F5EE" : "#F0F0F0", color: tab === t.key ? "#0F6E56" : "#888", padding: "1px 5px", borderRadius: 8 }}>{t.count}</span>}
                    </button>
                ))}
            </div>
            {/* List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
                {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#bbb", fontSize: 13 }}>No conversations found</div>}
                {filtered.map(c => {
                    const isActive = c.phone === activePhone;
                    return (
                        <div key={c.id} onClick={() => setActivePhone(c.phone)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", cursor: "pointer", borderBottom: "1px solid #F0F0F0", background: isActive ? "#fff" : "transparent", borderLeft: isActive ? "3px solid #1D9E75" : "3px solid transparent", transition: "all 0.12s" }}>
                            <Av initials={c.avatarInitials} phone={c.phone} size={36} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{c.name || c.phone}</span>
                                    <span style={{ fontSize: 10, color: "#bbb" }}>{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                                    <span style={{ fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{c.tag}</span>
                                    {c.unreadCount > 0 ? <span style={{ background: "#1D9E75", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 10 }}>{c.unreadCount}</span>
                                        : <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_DOT[c.chatStatus] || "#ccc" }} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── LEADS VIEW ───────────────────────────────────────────────────────────────
const LeadsView: React.FC = () => {
    const { leads } = useCRM();
    const stages = ["new", "contacted", "qualified", "converted", "lost"];
    const stageColor: Record<string, string> = { new: "#1D9E75", contacted: "#185FA5", qualified: "#534AB7", converted: "#BA7517", lost: "#E24B4A" };
    const stageBg: Record<string, string> = { new: "#E1F5EE", contacted: "#E6F1FB", qualified: "#EEEDFE", converted: "#FAEEDA", lost: "#FECACA" };

    const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8F9FA", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E8E8E8", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>Leads Pipeline</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{leads.length} leads · ₹{totalValue.toLocaleString()} total value</div>
                </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {leads.length === 0 && (
                    <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>No Leads Yet</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>Convert contacts to leads from the chat panel</div>
                    </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {leads.map(lead => (
                        <div key={lead.id} style={{ background: "#fff", border: "1px solid #E8E8E8", borderRadius: 12, padding: "14px 16px", borderLeft: `4px solid ${stageColor[lead.stage] || "#ccc"}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a" }}>{lead.name || lead.contactName}</div>
                                    {lead.company && <div style={{ fontSize: 12, color: "#888" }}>{lead.company}</div>}
                                </div>
                                <span style={{ background: stageBg[lead.stage] || "#F0F0F0", color: stageColor[lead.stage] || "#888", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 8 }}>{lead.stage?.toUpperCase()}</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#666" }}>
                                {lead.email && <div>📧 {lead.email}</div>}
                                {lead.contactPhone && <div>📱 {lead.contactPhone}</div>}
                                {lead.source && <div>📌 {lead.source}</div>}
                                {lead.value > 0 && <div style={{ fontWeight: 700, color: "#1D9E75" }}>₹{lead.value.toLocaleString()}</div>}
                            </div>
                            {lead.notes && <div style={{ marginTop: 10, fontSize: 12, color: "#888", padding: "8px 10px", background: "#F8F9FA", borderRadius: 8 }}>{lead.notes}</div>}
                            <div style={{ marginTop: 10, fontSize: 11, color: "#bbb" }}>Created {new Date(lead.createdAt).toLocaleDateString("en-IN")}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── BROADCAST VIEW ───────────────────────────────────────────────────────────
const BroadcastView: React.FC = () => {
    const { contacts, templates, broadcast } = useCRM();
    const [selected, setSelected] = useState<string[]>([]);
    const [templateName, setTemplateName] = useState("");
    const [lang, setLang] = useState("en");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ sent: number; total: number } | null>(null);

    const approvedTpls = templates.filter(t => t.status === "APPROVED");
    const toggleContact = (phone: string) => setSelected(p => p.includes(phone) ? p.filter(x => x !== phone) : [...p, phone]);
    const selectAll = () => setSelected(contacts.map(c => c.phone));

    const submit = async () => {
        if (!templateName || selected.length === 0) return;
        setLoading(true);
        try {
            await broadcast(selected, templateName, lang, []);
            setResult({ sent: selected.length, total: selected.length });
            setSelected([]);
        } catch (e: unknown) { alert((e as Error).message); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ flex: 1, display: "flex", background: "#F8F9FA", overflow: "hidden" }}>
            {/* Left — Contact Picker */}
            <div style={{ width: 320, borderRight: "1px solid #E8E8E8", background: "#fff", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #E8E8E8" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>📢 Broadcast Campaign</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#888" }}>{selected.length} selected</span>
                        <button onClick={selectAll} style={{ fontSize: 11, color: "#1D9E75", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Select All</button>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                    {contacts.map(c => (
                        <div key={c.id} onClick={() => toggleContact(c.phone)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", cursor: "pointer", borderBottom: "1px solid #F5F5F5", background: selected.includes(c.phone) ? "#F0FBF7" : "#fff" }}>
                            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selected.includes(c.phone) ? "#1D9E75" : "#DDD"}`, background: selected.includes(c.phone) ? "#1D9E75" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {selected.includes(c.phone) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
                            </div>
                            <Av initials={c.avatarInitials} phone={c.phone} size={30} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name || c.phone}</div>
                                <div style={{ fontSize: 11, color: "#bbb" }}>{c.phone}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right — Campaign Config */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                <div style={{ maxWidth: 480 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a", marginBottom: 20 }}>Campaign Configuration</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>SELECT TEMPLATE</label>
                            <select value={templateName} onChange={e => setTemplateName(e.target.value)} style={{ border: "1px solid #E0E0E0", borderRadius: 8, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#1a1a1a" }}>
                                <option value="">-- Choose an approved template --</option>
                                {approvedTpls.map(t => <option key={t.id} value={t.name}>{t.name} ({t.category})</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em" }}>LANGUAGE</label>
                            <select value={lang} onChange={e => setLang(e.target.value)} style={{ border: "1px solid #E0E0E0", borderRadius: 8, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#1a1a1a" }}>
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="en_IN">English (India)</option>
                            </select>
                        </div>

                        {/* Summary */}
                        <div style={{ background: "#F0FBF7", border: "1px solid #B7E5D4", borderRadius: 10, padding: "14px 16px" }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#0F6E56", marginBottom: 8 }}>Campaign Summary</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                                <div><span style={{ color: "#888" }}>Recipients: </span><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{selected.length}</span></div>
                                <div><span style={{ color: "#888" }}>Template: </span><span style={{ fontWeight: 700, color: "#1a1a1a" }}>{templateName || "—"}</span></div>
                            </div>
                        </div>

                        {result && (
                            <div style={{ background: "#E1F5EE", border: "1px solid #9FE1CB", borderRadius: 10, padding: 14, fontSize: 13, color: "#0F6E56", fontWeight: 700 }}>
                                ✅ Campaign sent! {result.sent}/{result.total} messages dispatched.
                            </div>
                        )}

                        <Btn variant="primary" onClick={submit} disabled={!templateName || selected.length === 0 || loading}
                            style={{ padding: "12px", fontSize: 14, borderRadius: 10, width: "100%" }}>
                            {loading ? "Sending..." : `📢 Send to ${selected.length} Contact${selected.length !== 1 ? "s" : ""}`}
                        </Btn>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── SETTINGS VIEW ────────────────────────────────────────────────────────────
const SettingsView: React.FC = () => {
    const fields = [
        { label: "Phone Number ID", key: "PHONE_NUMBER_ID", placeholder: "123456789012345" },
        { label: "WABA ID", key: "WABA_ID", placeholder: "987654321098765" },
        { label: "Access Token", key: "ACCESS_TOKEN", placeholder: "EAAxxxxxxx...", type: "password" },
        { label: "Webhook Verify Token", key: "WEBHOOK_VERIFY_TOKEN", placeholder: "your_secret_token" },
        { label: "Webhook URL (your server)", key: "WEBHOOK_URL", placeholder: "https://yourdomain.com/webhook" },
    ];
    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 28, background: "#F8F9FA" }}>
            <div style={{ maxWidth: 560 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>⚙️ WhatsApp API Configuration</div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Configure your Meta WhatsApp Business credentials in the backend <code>.env</code> file.</div>
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E8E8E8", padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a", marginBottom: 14 }}>Backend .env Configuration</div>
                    {fields.map(f => (
                        <div key={f.key} style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>{f.label.toUpperCase()}</label>
                            <div style={{ background: "#1a1a2e", borderRadius: 8, padding: "9px 13px", fontFamily: "monospace", fontSize: 12, color: "#4ade80" }}>
                                {f.key}=<span style={{ color: "#facc15" }}>{f.placeholder}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 12, padding: 16, fontSize: 13, color: "#92400E" }}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>📋 Setup Steps</div>
                    <ol style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, lineHeight: 1.6 }}>
                        <li>Go to <strong>developers.facebook.com</strong> → Create App → WhatsApp</li>
                        <li>Copy Phone Number ID, WABA ID, and Access Token</li>
                        <li>Set Webhook URL to <code>https://yourdomain.com/webhook</code></li>
                        <li>Subscribe to: <code>messages</code>, <code>message_deliveries</code>, <code>message_reads</code></li>
                        <li>Set WEBHOOK_VERIFY_TOKEN to any random secret string</li>
                        <li>Copy all values to your backend <code>.env</code> file</li>
                        <li>Run: <code>npm install && npm run dev</code></li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

// ─── STATS BAR ────────────────────────────────────────────────────────────────
const StatsBar: React.FC = () => {
    const { stats } = useCRM();
    const items = [
        { label: "Total", value: stats.totalContacts, color: "#185FA5", bg: "#E6F1FB" },
        { label: "Open", value: stats.open, color: "#1D9E75", bg: "#E1F5EE" },
        { label: "Pending", value: stats.pending, color: "#BA7517", bg: "#FAEEDA" },
        { label: "Resolved", value: stats.resolved, color: "#5F5E5A", bg: "#F1EFE8" },
        { label: "Leads", value: stats.totalLeads, color: "#534AB7", bg: "#EEEDFE" },
        { label: "New Leads", value: stats.newLeads, color: "#E24B4A", bg: "#FECACA" },
    ];
    return (
        <div style={{ display: "flex", borderBottom: "1px solid #E8E8E8", background: "#fff", flexShrink: 0 }}>
            {items.map((s, i) => (
                <div key={s.label} style={{ flex: 1, padding: "9px 12px", textAlign: "center", borderRight: i < items.length - 1 ? "1px solid #E8E8E8" : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: "#bbb", fontWeight: 700, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</div>
                </div>
            ))}
        </div>
    );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
    const [view, setView] = useState<ActiveView>("chats");
    const { activePhone, contacts } = useCRM();
    const activeContact = contacts.find(c => c.phone === activePhone);

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: '"DM Sans", sans-serif', background: "#fff", overflow: "hidden" }}>
            <Sidebar activeView={view} setView={setView} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <StatsBar />
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    {view === "chats" && (
                        <>
                            <ContactList />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                {activeContact
                                    ? <ChatPanel contact={activeContact} />
                                    : (
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ccc", gap: 10, background: "#FAFEF9" }}>
                                            <div style={{ fontSize: 56 }}>💬</div>
                                            <div style={{ fontSize: 18, fontWeight: 800, color: "#888" }}>Select a conversation</div>
                                            <div style={{ fontSize: 13, color: "#bbb" }}>Messages from WhatsApp appear here in real-time</div>
                                        </div>
                                    )}
                            </div>
                        </>
                    )}
                    {view === "leads" && <LeadsView />}
                    {view === "broadcast" && <BroadcastView />}
                    {view === "settings" && <SettingsView />}
                </div>
            </div>
        </div>
    );
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
const WhatsAppCRM: React.FC = () => (
    <CRMProvider>
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'DM Sans', sans-serif; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #D5D5D5; border-radius: 4px; }
    `}</style>
        <App />
    </CRMProvider>
);

export default WhatsAppCRM;