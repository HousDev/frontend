import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import {
    MessageSquare, Megaphone, BarChart3, Bot, FileText,
    Settings, Phone, DollarSign, ChevronDown, Bell, X,
    Users, ShoppingBag, Home, Building2, Plus, Trash2,
    CheckCircle, XCircle, Clock, AlertTriangle, Send, Eye,
    Search, RefreshCw, BarChart2, Play, Pause,
    Save, User, AlertCircle, Wifi, WifiOff, Brain,
    Copy, Shield, Tag as LucideTag, UserCheck, TrendingUp, Hash,
    ArrowRight, ChevronUp, ToggleLeft, ToggleRight, Zap,
    SlidersHorizontal, Calendar, ArrowLeft, Activity,
    BotMessageSquare, Check, CheckCheck, Paperclip,
    Image, Video, Type, MapPin, Mail, UserPlus, StickyNote,
    Lightbulb, Smartphone, FileText as FileDoc, Variable,
    EyeOff, HelpCircle, List, CreditCard as Edit2,
} from "lucide-react";
import { whatsappAPI } from "@/lib/whatsappApi";

// ─── OLD DESIGN COLOR PALETTE & STYLES ────────────────────────────────────────
const COLORS = {
    blue: { bg: '#E6F1FB', border: '#185FA5', text: '#0C447C' },
    green: { bg: '#EAF3DE', border: '#639922', text: '#27500A' },
    amber: { bg: '#FAEEDA', border: '#EF9F27', text: '#633806' },
    coral: { bg: '#FAECE7', border: '#D85A30', text: '#712B13' },
    purple: { bg: '#EEEDFE', border: '#7F77DD', text: '#3C3489' },
    teal: { bg: '#E1F5EE', border: '#1D9E75', text: '#085041' },
};

const S: {
    card: any;
    btn: (primary: boolean, small?: boolean) => any;
    input: any;
    label: any;
    badge: any;
} = {
    card: {
        background: "#fff",
        border: "0.5px solid #e0e0e0",
        borderRadius: 12,
        padding: "14px 16px",
    },
    btn: (primary, small = false) => ({
        background: primary ? "#185FA5" : "#f5f5f5",
        color: primary ? "#fff" : "#333",
        border: primary ? "none" : "0.5px solid #ddd",
        borderRadius: 8,
        padding: small ? "4px 10px" : "7px 14px",
        fontSize: small ? 11 : 12,
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
    }),
    input: {
        width: "100%",
        border: "0.5px solid #ddd",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        background: "#fafafa",
    },
    label: {
        fontSize: 11,
        color: "#888",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 4,
        display: "block",
    },
    badge: {
        background: "#E24B4A",
        color: "#fff",
        fontSize: 10,
        borderRadius: 8,
        padding: "1px 5px",
        fontWeight: 700,
        lineHeight: 1.2,
    },
};

// ─── OLD DESIGN COMPONENTS ───────────────────────────────────────────────────
const Tag = ({ tag, stage }) => {
    const map = { hot: { label: 'Hot', c: 'coral' }, conv: { label: 'Converted', c: 'purple' }, new: { label: 'New', c: 'blue' }, qual: { label: 'Qualified', c: 'green' } };
    const info = map[tag] || map['new'];
    const col = COLORS[info.c];
    return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600, background: col.bg, color: col.text, border: `1px solid ${col.border}22` }}>{stage || info.label}</span>;
};

const Avatar = ({ initials, color = 'blue', size = 38 }) => {
    const col = COLORS[color] || COLORS.blue;
    return <div style={{ width: size, height: size, borderRadius: '50%', background: col.bg, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, flexShrink: 0, border: `1.5px solid ${col.border}44`, fontFamily: 'Georgia, serif' }}>{initials}</div>;
};

const StatusBadge = ({ status }) => {
    const map = { approved: { bg: '#EAF3DE', color: '#27500A', label: 'Approved' }, pending: { bg: '#FAEEDA', color: '#633806', label: 'Pending' }, rejected: { bg: '#FAECE7', color: '#712B13', label: 'Rejected' } };
    const s = map[status] || map.pending;
    return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
};

const Toggle = ({ on, onChange }) => (
    <button onClick={onChange} style={{ width: 34, height: 20, borderRadius: 10, background: on ? '#1D9E75' : '#ccc', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
        <span style={{ position: 'absolute', width: 14, height: 14, background: '#fff', borderRadius: '50%', top: 3, left: on ? 17 : 3, transition: 'left .2s' }} />
    </button>
);

// ─── Constants for Templates, Campaigns, Chatbot, etc. ───────────────────────
const STATUS_CONFIG_TEMPLATE = {
    APPROVED: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50", label: "Approved" },
    PENDING: { icon: Clock, color: "text-amber-700", bg: "bg-amber-50", label: "Pending Review" },
    REJECTED: { icon: XCircle, color: "text-red-700", bg: "bg-red-50", label: "Rejected" },
    IN_APPEAL: { icon: AlertTriangle, color: "text-orange-700", bg: "bg-orange-50", label: "In Appeal" },
};

const STATUS_CONFIG_CAMPAIGN = {
    draft: { icon: Clock, color: "text-gray-600", bg: "bg-gray-100", label: "Draft" },
    scheduled: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Scheduled" },
    running: { icon: Play, color: "text-emerald-600", bg: "bg-emerald-50", label: "Running" },
    completed: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", label: "Completed" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Failed" },
    paused: { icon: Pause, color: "text-yellow-600", bg: "bg-yellow-50", label: "Paused" },
};

const CATEGORY_COLORS_TPL = {
    MARKETING: "bg-blue-50 text-blue-700 border-blue-100",
    UTILITY: "bg-emerald-50 text-emerald-700 border-emerald-100",
    AUTHENTICATION: "bg-orange-50 text-orange-700 border-orange-100",
};

const META_COST = { MARKETING: 0.0082, UTILITY: 0.0042, AUTHENTICATION: 0.0042 };

const STAGE_COLORS = {
    New: "bg-blue-100 text-blue-700", Contacted: "bg-yellow-100 text-yellow-700",
    Qualified: "bg-emerald-100 text-emerald-700", "Site Visit": "bg-purple-100 text-purple-700",
    Closed: "bg-gray-100 text-gray-700", Lost: "bg-red-100 text-red-700",
};

const STAGE_DOT = {
    New: "bg-blue-500", Contacted: "bg-yellow-500", Qualified: "bg-emerald-500",
    "Site Visit": "bg-orange-500", Closed: "bg-gray-400", Lost: "bg-red-500",
};

const STEP_TYPE_CONFIG = {
    message: { label: "Send Message", icon: MessageSquare, color: "bg-blue-100 text-blue-700", description: "Send a text message" },
    question: { label: "Ask Question", icon: HelpCircle, color: "bg-amber-100 text-amber-700", description: "Ask and save response" },
    buttons: { label: "Button Choices", icon: List, color: "bg-emerald-100 text-emerald-700", description: "Show clickable buttons" },
    tag: { label: "Apply Tag", icon: LucideTag, color: "bg-pink-100 text-pink-700", description: "Auto-tag contact" },
    assign: { label: "Assign Agent", icon: UserCheck, color: "bg-sky-100 text-sky-700", description: "Assign to team member" },
    stage: { label: "Update Stage", icon: TrendingUp, color: "bg-orange-100 text-orange-700", description: "Move pipeline stage" },
    template: { label: "Send Template", icon: FileDoc, color: "bg-violet-100 text-violet-700", description: "Send WA template" },
    condition: { label: "Condition", icon: Hash, color: "bg-gray-100 text-gray-700", description: "Branch on keyword" },
    end: { label: "End Flow", icon: CheckCircle, color: "bg-red-100 text-red-700", description: "End automation" },
};

const TYPE_ICONS = {
    message: MessageSquare, template: FileText, campaign: Megaphone,
    lead: Bell, success: Bell, error: Bell, info: Bell,
};
const TYPE_COLORS_NOTIF = {
    message: "text-blue-400", template: "text-amber-400", campaign: "text-emerald-400",
    lead: "text-orange-400", success: "text-emerald-400", error: "text-red-400", info: "text-blue-400",
};

const TYPE_CONFIG_TOAST = {
    message: { icon: MessageSquare, color: "#0C447C", bg: "#E6F1FB", border: "#185FA5" },
    template: { icon: FileText, color: "#633806", bg: "#FAEEDA", border: "#EF9F27" },
    campaign: { icon: Megaphone, color: "#085041", bg: "#E1F5EE", border: "#1D9E75" },
    lead: { icon: User, color: "#712B13", bg: "#FAECE7", border: "#D85A30" },
    success: { icon: CheckCircle, color: "#27500A", bg: "#EAF3DE", border: "#639922" },
    error: { icon: X, color: "#712B13", bg: "#FAECE7", border: "#D85A30" },
    info: { icon: Bell, color: "#0C447C", bg: "#E6F1FB", border: "#185FA5" },
};

// ─── Mock Data (same as your new code) ───────────────────────────────────────
let mockNotifications = [];
let notifListeners = [];
let toastListeners = [];
let notifIdSeq = 1;

const notificationStore = {
    subscribe: (cb) => {
        notifListeners.push(cb);
        cb([...mockNotifications]);
        return () => { notifListeners = notifListeners.filter(l => l !== cb); };
    },
    subscribeToast: (cb) => {
        toastListeners.push(cb);
        return () => { toastListeners = toastListeners.filter(l => l !== cb); };
    },
    push: (type, title, body, action): any => {
        const n = { id: String(notifIdSeq++), type, title, body, action, read: false, timestamp: new Date() };
        mockNotifications = [n, ...mockNotifications].slice(0, 30);
        notifListeners.forEach(l => l([...mockNotifications]));
        toastListeners.forEach(l => l(n));
    },
    markAllRead: () => {
        mockNotifications = mockNotifications.map(n => ({ ...n, read: true }));
        notifListeners.forEach(l => l([...mockNotifications]));
    },
    clear: () => {
        mockNotifications = [];
        notifListeners.forEach(l => l([]));
    },
};

const MOCK_CONTACTS = [
    { id: "c1", name: "Rahul Sharma", phone: "+91 98765 43210", stage: "Qualified", email: "rahul@email.com", preferred_location: "Wakad, Pune", budget_min: 5000000, budget_max: 8000000, property_type: "Apartment", source: "WhatsApp", assigned_to: "u1", notes: "Interested in 2BHK", created_at: new Date(Date.now() - 86400000 * 3).toISOString(), tags: [{ id: "t1", name: "Hot Lead", color: "#EF4444" }, { id: "t2", name: "Buyer", color: "#3B82F6" }] },
    { id: "c2", name: "Priya Mehta", phone: "+91 87654 32109", stage: "New", email: "priya@email.com", preferred_location: "Baner, Pune", budget_min: 3000000, budget_max: 5000000, property_type: "Villa", source: "Facebook", assigned_to: null, notes: "", created_at: new Date(Date.now() - 86400000 * 1).toISOString(), tags: [{ id: "t3", name: "Seller", color: "#10B981" }] },
    { id: "c3", name: "Amit Patel", phone: "+91 76543 21098", stage: "Site Visit", email: "amit@email.com", preferred_location: "Hinjewadi, Pune", budget_min: 7000000, budget_max: 12000000, property_type: "Apartment", source: "Instagram", assigned_to: "u2", notes: "Needs parking", created_at: new Date(Date.now() - 86400000 * 7).toISOString(), tags: [{ id: "t2", name: "Buyer", color: "#3B82F6" }] },
    { id: "c4", name: "Sneha Joshi", phone: "+91 65432 10987", stage: "Contacted", email: "", preferred_location: "Kothrud, Pune", budget_min: 4000000, budget_max: 6000000, property_type: "Plot", source: "WhatsApp", assigned_to: "u1", notes: "", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), tags: [] },
];

const MOCK_CONVERSATIONS = [
    { id: "conv1", contact_id: "c1", contact: MOCK_CONTACTS[0], status: "open", unread_count: 3, last_message: "When can we schedule a site visit?", last_message_at: new Date(Date.now() - 1800000).toISOString(), bot_active: false, flow_id: null, current_step_index: 0, assigned_to: "u1" },
    { id: "conv2", contact_id: "c2", contact: MOCK_CONTACTS[1], status: "open", unread_count: 0, last_message: "Thank you for the information!", last_message_at: new Date(Date.now() - 3600000 * 2).toISOString(), bot_active: true, flow_id: "flow1", current_step_index: 1, assigned_to: null },
    { id: "conv3", contact_id: "c3", contact: MOCK_CONTACTS[2], status: "open", unread_count: 1, last_message: "Can you share the brochure?", last_message_at: new Date(Date.now() - 3600000 * 5).toISOString(), bot_active: false, flow_id: null, current_step_index: 0, assigned_to: "u2" },
    { id: "conv4", contact_id: "c4", contact: MOCK_CONTACTS[3], status: "resolved", unread_count: 0, last_message: "I will get back to you soon.", last_message_at: new Date(Date.now() - 86400000).toISOString(), bot_active: false, flow_id: null, current_step_index: 0, assigned_to: "u1" },
];

const MOCK_MESSAGES = {
    conv1: [
        { id: "m1", conversation_id: "conv1", direction: "inbound", message_type: "text", body: "Hi, I am interested in 2BHK apartments in Wakad.", status: "read", timestamp: new Date(Date.now() - 7200000).toISOString(), sender: null },
        { id: "m2", conversation_id: "conv1", direction: "outbound", message_type: "text", body: "Hello Rahul! Great to hear from you. We have some excellent properties in Wakad within your budget.", status: "read", timestamp: new Date(Date.now() - 7000000).toISOString(), sender: { name: "Ravi" } },
        { id: "m3", conversation_id: "conv1", direction: "inbound", message_type: "text", body: "What is the price range?", status: "read", timestamp: new Date(Date.now() - 3600000).toISOString(), sender: null },
        { id: "m4", conversation_id: "conv1", direction: "outbound", message_type: "text", body: "We have options from ₹55L to ₹80L. All RERA approved projects.", status: "delivered", timestamp: new Date(Date.now() - 3500000).toISOString(), sender: { name: "Ravi" } },
        { id: "m5", conversation_id: "conv1", direction: "inbound", message_type: "text", body: "When can we schedule a site visit?", status: "delivered", timestamp: new Date(Date.now() - 1800000).toISOString(), sender: null },
    ],
    conv2: [
        { id: "m6", conversation_id: "conv2", direction: "inbound", message_type: "text", body: "Hello, I want to sell my villa in Baner.", status: "read", timestamp: new Date(Date.now() - 86400000).toISOString(), sender: null },
        { id: "m7", conversation_id: "conv2", direction: "outbound", message_type: "template", body: "Hi Priya, Thank you for choosing us to sell your property! We have 10,000+ verified buyers actively looking in Baner.", template_name: "seller_welcome", status: "read", timestamp: new Date(Date.now() - 86300000).toISOString(), sender: null },
        { id: "m8", conversation_id: "conv2", direction: "inbound", message_type: "text", body: "Thank you for the information!", status: "read", timestamp: new Date(Date.now() - 7200000).toISOString(), sender: null },
    ],
    conv3: [
        { id: "m9", conversation_id: "conv3", direction: "inbound", message_type: "text", body: "I am looking for 3BHK in Hinjewadi.", status: "read", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), sender: null },
        { id: "m10", conversation_id: "conv3", direction: "outbound", message_type: "text", body: "Hi Amit! We have great options in Hinjewadi IT Park area.", status: "read", timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(), sender: { name: "Neha" } },
        { id: "m11", conversation_id: "conv3", direction: "inbound", message_type: "text", body: "Can you share the brochure?", status: "delivered", timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), sender: null },
    ],
    conv4: [
        { id: "m12", conversation_id: "conv4", direction: "inbound", message_type: "text", body: "Looking for a plot in Kothrud.", status: "read", timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), sender: null },
        { id: "m13", conversation_id: "conv4", direction: "outbound", message_type: "text", body: "We have several plot options in Kothrud. Let me share details.", status: "read", timestamp: new Date(Date.now() - 86400000 * 3 + 1800000).toISOString(), sender: { name: "Ravi" } },
        { id: "m14", conversation_id: "conv4", direction: "inbound", message_type: "text", body: "I will get back to you soon.", status: "read", timestamp: new Date(Date.now() - 86400000).toISOString(), sender: null },
    ],
};

const MOCK_TEMPLATES = [
    { id: "tpl1", name: "buyer_welcome", category: "MARKETING", language: "en", status: "APPROVED", header_type: "TEXT", header_text: "Welcome, Property Seeker!", body: "Hi {{1}},\n\nThank you for your interest in buying a property with us!\n\nWe have hundreds of verified properties across {{2}} matching your needs.", footer: "", buttons: [{ type: "QUICK_REPLY", text: "View Properties" }, { type: "QUICK_REPLY", text: "Talk to Agent" }], variables: ["name", "city"], created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: "tpl2", name: "seller_welcome", category: "UTILITY", language: "en", status: "APPROVED", header_type: "TEXT", header_text: "Sell Your Property Fast!", body: "Hi {{1}},\n\nThank you for choosing us to sell your property!\n\nWe have 10,000+ verified buyers actively looking in {{2}}.", footer: "", buttons: [{ type: "QUICK_REPLY", text: "List My Property" }], variables: ["name", "city"], created_at: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: "tpl3", name: "site_visit_confirmation", category: "UTILITY", language: "en", status: "PENDING", header_type: "TEXT", header_text: "Site Visit Confirmed!", body: "Hi {{1}},\n\nYour site visit has been confirmed!\n\n🏠 Property: {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}", footer: "Reply CANCEL to cancel", buttons: [{ type: "QUICK_REPLY", text: "Confirm" }, { type: "QUICK_REPLY", text: "Reschedule" }], variables: [], created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "tpl4", name: "otp_verification", category: "AUTHENTICATION", language: "en", status: "REJECTED", header_type: null, header_text: null, body: "{{1}} is your verification code for {{2}}.\n\nThis code expires in 10 minutes.", footer: null, buttons: [], variables: [], rejection_reason: "Template does not follow authentication guidelines.", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const MOCK_CAMPAIGNS = [
    { id: "camp1", name: "Wakad Property Blast - June", template: { id: "tpl1", name: "buyer_welcome", body: "Hi {{1}}, we have properties in {{2}}..." }, template_id: "tpl1", status: "completed", total_contacts: 245, sent_count: 245, delivered_count: 238, read_count: 187, failed_count: 7, scheduled_at: null, filters: { stage: ["New", "Contacted"] }, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "camp2", name: "Seller Outreach - Baner", template: { id: "tpl2", name: "seller_welcome", body: "Hi {{1}}, sell your property fast..." }, template_id: "tpl2", status: "running", total_contacts: 120, sent_count: 87, delivered_count: 81, read_count: 54, failed_count: 6, scheduled_at: null, filters: {}, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "camp3", name: "New Project Launch Q3", template: { id: "tpl1", name: "buyer_welcome", body: "Hi {{1}}..." }, template_id: "tpl1", status: "draft", total_contacts: 0, sent_count: 0, delivered_count: 0, read_count: 0, failed_count: 0, scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString(), filters: {}, created_at: new Date(Date.now() - 3600000).toISOString() },
];

const MOCK_FLOWS = [
    { id: "flow1", name: "Welcome Flow", description: "Greets new leads and qualifies them", is_active: true, is_default: true, trigger_keyword: "", steps: [{ id: "fs1", step_type: "message", message_text: "Welcome! How can we help you today?", buttons: null, save_response_as: null }, { id: "fs2", step_type: "question", message_text: "What type of property are you looking for?", save_response_as: "notes", buttons: null }, { id: "fs3", step_type: "stage", stage: "Contacted", message_text: "", buttons: null }] },
    { id: "flow2", name: "Buyer Qualification", description: "Qualifies buyer leads with key questions", is_active: true, is_default: false, trigger_keyword: "buy", steps: [{ id: "fs4", step_type: "message", message_text: "Great! Tell me about your budget.", buttons: null, save_response_as: null }, { id: "fs5", step_type: "buttons", message_text: "What is your preferred location?", buttons: [{ id: "b1", title: "Wakad" }, { id: "b2", title: "Baner" }, { id: "b3", title: "Hinjewadi" }] }] },
    { id: "flow3", name: "Site Visit Follow-up", description: "", is_active: false, is_default: false, trigger_keyword: "visit", steps: [] },
];

const MOCK_USERS = [
    { id: "u1", name: "Ravi Patil", email: "ravi@company.com", role: "admin", is_active: true },
    { id: "u2", name: "Neha Kulkarni", email: "neha@company.com", role: "sales", is_active: true },
    { id: "u3", name: "Suresh Deshpande", email: "suresh@company.com", role: "pre_sales", is_active: false },
];

const MOCK_TAGS = [
    { id: "t1", name: "Hot Lead", color: "#EF4444" },
    { id: "t2", name: "Buyer", color: "#3B82F6" },
    { id: "t3", name: "Seller", color: "#10B981" },
    { id: "t4", name: "Investor", color: "#8B5CF6" },
    { id: "t5", name: "VIP", color: "#F59E0B" },
];

const MOCK_ANALYTICS = {
    total_contacts: 1247,
    new_leads_today: 12,
    new_leads_week: 87,
    open_conversations: 34,
    messages_sent_today: 156,
    messages_received_today: 203,
    response_rate: 77,
    active_campaigns: 2,
};

const MOCK_MESSAGE_VOLUME = [
    { date: "Apr 14", inbound: 45, outbound: 38 },
    { date: "Apr 15", inbound: 62, outbound: 51 },
    { date: "Apr 16", inbound: 38, outbound: 29 },
    { date: "Apr 17", inbound: 71, outbound: 63 },
    { date: "Apr 18", inbound: 55, outbound: 44 },
    { date: "Apr 19", inbound: 89, outbound: 76 },
    { date: "Apr 20", inbound: 67, outbound: 55 },
];

const MOCK_CAMPAIGN_STATS = [
    { name: "buyer_welcome", sent: 245, delivered: 238, read: 187, failed: 7 },
    { name: "seller_welcome", sent: 87, delivered: 81, read: 54, failed: 6 },
];

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatRelativeTime(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatTime(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(val) {
    if (!val) return "₹0";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function truncate(str, len) {
    if (!str) return "";
    return str.length > len ? str.slice(0, len) + "…" : str;
}

// ─── Toast Container (restyled) ──────────────────────────────────────────────
function ToastContainer({ onNavigate }) {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        const unsub = notificationStore.subscribeToast((n) => {
            const item = { ...n, removing: false };
            setToasts(prev => [...prev, item].slice(-4));
            setTimeout(() => {
                setToasts(prev => prev.map(t => t.id === item.id ? { ...t, removing: true } : t));
                setTimeout(() => setToasts(prev => prev.filter(t => t.id !== item.id)), 300);
            }, 4000);
        });
        return unsub;
    }, []);
    if (toasts.length === 0) return null;
    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
            {toasts.map(t => {
                const cfg = TYPE_CONFIG_TOAST[t.type] || TYPE_CONFIG_TOAST.info;
                const Icon = cfg.icon;
                return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 12, border: `1px solid ${cfg.border}`, background: cfg.bg, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', pointerEvents: 'auto', transition: 'all 0.2s', opacity: t.removing ? 0 : 1, transform: t.removing ? 'translateY(8px)' : 'none', maxWidth: 320 }}>
                        <Icon size={16} style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: cfg.color, marginBottom: 2 }}>{t.title}</p>
                            <p style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{t.body}</p>
                            {t.action && onNavigate && (
                                <button onClick={() => { onNavigate(t.action.page); setToasts(prev => prev.filter(x => x.id !== t.id)); }} style={{ marginTop: 6, fontSize: 10, fontWeight: 600, color: cfg.color, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>{t.action.label}</button>
                            )}
                        </div>
                        <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}><X size={12} /></button>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Sidebar (old design: vertical icon bar) ─────────────────────────────────
function Sidebar({ activePage, onNavigate, unreadCount, pendingTemplatesCount }) {
    const [bellOpen, setBellOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifUnread, setNotifUnread] = useState(0);

    useEffect(() => notificationStore.subscribe(all => { setNotifications(all); setNotifUnread(all.filter(n => !n.read).length); }), []);

    const handleBellClick = () => { setBellOpen(v => !v); if (!bellOpen) notificationStore.markAllRead(); };
    const handleNotifClick = (n) => { if (n.action) onNavigate(n.action.page); setBellOpen(false); };

    const sideIcons = [
        { id: 'inbox', label: 'Inbox', icon: <MessageSquare size={18} />, badge: unreadCount },
        { id: 'leads', label: 'Leads', icon: <Users size={18} />, badge: 0 },
        { id: 'buyers', label: 'Buyers', icon: <ShoppingBag size={18} />, badge: 0 },
        { id: 'sellers', label: 'Sellers', icon: <Home size={18} />, badge: 0 },
        { id: 'properties', label: 'Properties', icon: <Building2 size={18} />, badge: 0 },
        { id: 'templates', label: 'Templates', icon: <FileText size={18} />, badge: pendingTemplatesCount },
        { id: 'campaigns', label: 'Campaigns', icon: <Megaphone size={18} />, badge: 0 },
        { id: 'chatbot', label: 'Chatbot', icon: <Bot size={18} />, badge: 0 },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, badge: 0 },
        { id: 'meta-spend', label: 'Meta Spend', icon: <DollarSign size={18} />, badge: 0 },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} />, badge: 0 },
    ];

    return (
        <div style={{ width: 52, background: '#fff', borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0, position: 'relative' }}>
            <div style={{ width: 32, height: 32, background: '#185FA5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, cursor: 'pointer' }} onClick={() => onNavigate('inbox')}>
                <Phone size={16} fill="#fff" color="#fff" />
            </div>
            {sideIcons.map(icon => (
                <div key={icon.id} onClick={() => onNavigate(icon.id)} style={{ position: 'relative', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: activePage === icon.id ? '#E6F1FB' : 'transparent', color: activePage === icon.id ? '#185FA5' : '#888' }}>
                    <div style={{ width: 18, height: 18 }}>{icon.icon}</div>
                    {icon.badge > 0 && <div style={{ position: 'absolute', top: -2, right: -2, background: '#E24B4A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px' }}>{icon.badge}</div>}
                </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative' }}>
                <button onClick={handleBellClick} style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', color: '#888', border: 'none' }}>
                    <Bell size={18} />
                    {notifUnread > 0 && <span style={{ position: 'absolute', top: -2, right: -2, background: '#E24B4A', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px' }}>{notifUnread > 9 ? '9+' : notifUnread}</span>}
                </button>
                {bellOpen && (
                    <div style={{ position: 'absolute', bottom: 40, left: 0, width: 280, background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '0.5px solid #e8e8e8' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>Notifications</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {notifications.length > 0 && <button onClick={() => notificationStore.clear()} style={{ fontSize: 10, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
                                <button onClick={() => setBellOpen(false)} style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} /></button>
                            </div>
                        </div>
                        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: '#aaa', fontSize: 12 }}>No notifications</div>
                            ) : notifications.slice(0, 15).map(n => {
                                const Icon = TYPE_CONFIG_TOAST[n.type]?.icon || Bell;
                                const color = TYPE_CONFIG_TOAST[n.type]?.color || '#888';
                                return (
                                    <button key={n.id} onClick={() => handleNotifClick(n)} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderBottom: '0.5px solid #f0f0f0', background: n.read ? '#fff' : '#E6F1FB', cursor: 'pointer', display: 'flex', gap: 10 }}>
                                        <Icon size={13} style={{ color, marginTop: 2, flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 2 }}>{n.title}</p>
                                            <p style={{ fontSize: 11, color: '#555', lineHeight: 1.3 }}>{n.body}</p>
                                            <p style={{ fontSize: 9, color: '#aaa', marginTop: 4 }}>{n.timestamp.toLocaleTimeString()}</p>
                                        </div>
                                        {!n.read && <span style={{ width: 6, height: 6, background: '#185FA5', borderRadius: '50%', marginTop: 6 }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>P</div>
        </div>
    );
}

// ─── Inbox Page (restyled with old design) ───────────────────────────────────
function MessageBubble({ message, showDateSeparator, dateSeparatorLabel }) {
    const isOutbound = message.direction === "out";
    return (
        <>
            {showDateSeparator && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
                    <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
                    <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{dateSeparatorLabel}</span>
                    <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: isOutbound ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isOutbound ? 'flex-end' : 'flex-start' }}>
                    {/* {(
                        <div style={{ background: isOutbound ? '#185FA5' : '#fff', border: isOutbound ? 'none' : '0.5px solid #e0e0e0', borderRadius: 12, padding: '8px 12px', marginBottom: 2 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: isOutbound ? '#E6F1FB' : '#185FA5' }}>Template: {message.template_name}</p>
                            <p style={{ fontSize: 13, color: isOutbound ? '#fff' : '#111', whiteSpace: 'pre-wrap' }}>{message.text}</p>
                        </div>
                    )} */}
                    {message.text && (
                        <div style={{ background: isOutbound ? '#DCF8C6' : '#fff', border: isOutbound ? 'none' : '0.5px solid #e0e0e0', borderRadius: 12, borderTopRightRadius: isOutbound ? 4 : 12, borderTopLeftRadius: isOutbound ? 12 : 4, padding: '8px 12px' }}>
                            <p style={{ fontSize: 13, color: '#111', whiteSpace: 'pre-wrap' }}>{message.text}</p>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 10, color: '#aaa' }}>
                        <span>{formatTime(message.timestamp)}</span>
                        {isOutbound && <span>{message.status === 'read' ? <CheckCheck size={12} color="#1D9E75" /> : <Check size={12} />}</span>}
                        {message.sender && <span>{message.sender.name}</span>}
                    </div>
                </div>
            </div>
        </>
    );
}

function ChatInput({ templates, onSendText, disabled }) {
    const [text, setText] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const [sending, setSending] = useState(false);
    const textareaRef = useRef(null);
    const approvedTemplates = templates.filter(t => t.status === "APPROVED");

    const handleSend = async () => {
        if (!text.trim() || sending || disabled) return;
        setSending(true);
        await onSendText(text.trim());
        setText(""); setSending(false);
        textareaRef.current?.focus();
    };

    return (
        <div style={{ borderTop: '0.5px solid #e8e8e8', background: '#fff', position: 'relative' }}>
            {showTemplates && approvedTemplates.length > 0 && (
                <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: '12px 12px 0 0', boxShadow: '0 -2px 8px rgba(0,0,0,0.05)', maxHeight: 200, overflowY: 'auto', zIndex: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '0.5px solid #eee' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>Quick Templates</span>
                        <button onClick={() => setShowTemplates(false)} style={{ fontSize: 11, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
                    </div>
                    {approvedTemplates.map(t => (
                        <button key={t.id} onClick={() => { setShowTemplates(false); onSendText(t.body); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderBottom: '0.5px solid #f0f0f0', background: '#fff', cursor: 'pointer' }}>
                            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{t.name}</p>
                            <p style={{ fontSize: 11, color: '#888' }}>{truncate(t.body, 80)}</p>
                        </button>
                    ))}
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 14px' }}>
                <button onClick={() => setShowTemplates(v => !v)} disabled={disabled} style={{ padding: 6, borderRadius: 8, background: showTemplates ? '#E6F1FB' : 'transparent', color: showTemplates ? '#185FA5' : '#888', border: 'none', cursor: 'pointer' }}><FileText size={16} /></button>
                <textarea ref={textareaRef} value={text} onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={disabled ? "Conversation closed" : "Type a message… (Enter to send)"} disabled={disabled || sending} rows={1} style={{ flex: 1, border: '0.5px solid #ddd', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'none', fontFamily: 'inherit', outline: 'none', background: disabled ? '#f5f5f5' : '#fafafa', minHeight: 38, maxHeight: 100 }} />
                <button onClick={handleSend} disabled={!text.trim() || sending || disabled} style={{ width: 36, height: 36, borderRadius: '50%', background: '#185FA5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!text.trim() || sending || disabled) ? 0.5 : 1 }}>
                    {sending ? <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : <Send size={14} color="#fff" />}
                </button>
            </div>
        </div>
    );
}

function ContactInfo({ contact, users, allTags, onUpdateStage, onAssign, onAddTag, onRemoveTag, conversationNotes, onAddNote }) {
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [tagSearch, setTagSearch] = useState("");
    const [noteText, setNoteText] = useState("");
    const [notesExpanded, setNotesExpanded] = useState(true);
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const [leadCreated, setLeadCreated] = useState(false);

    if (!contact) return <div style={{ padding: 20, textAlign: 'center', color: '#aaa' }}>Select a conversation</div>;

    const contactTags = contact.tags || [];
    const filteredAvailableTags = allTags.filter(t => !contactTags.some(ct => ct.id === t.id)).filter(t => !tagSearch || t.name.toLowerCase().includes(tagSearch.toLowerCase()));

    const handleCreateLead = () => {
        notificationStore.push("lead", "Lead Created", `${contact.name} · ${contact.phone} is now a lead in your CRM.`, { label: "View Inbox", page: "inbox" });
        setLeadCreated(true);
        setTimeout(() => setLeadCreated(false), 4000);
    };

    const STAGE_OPTIONS = ["New", "Contacted", "Qualified", "Site Visit", "Closed", "Lost"];
    const stageColorMap = {
        New: COLORS.blue, Contacted: COLORS.amber, Qualified: COLORS.green,
        "Site Visit": COLORS.coral, Closed: COLORS.teal, Lost: COLORS.coral
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', fontSize: 13 }}>
            <div style={{ padding: '16px', borderBottom: '0.5px solid #e8e8e8', textAlign: 'center' }}>
                <Avatar initials={getInitials(contact.name)} color={contact.color || 'blue'} size={48} />
                <h3 style={{ fontWeight: 600, margin: '8px 0 2px', fontSize: 14 }}>{contact.name}</h3>
                <p style={{ fontSize: 12, color: '#888' }}>{contact.phone}</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <select value={contact.stage} onChange={e => onUpdateStage(e.target.value)} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: 'none', background: (stageColorMap[contact.stage] || COLORS.blue).bg, color: (stageColorMap[contact.stage] || COLORS.blue).text, cursor: 'pointer', outline: 'none' }}>
                        {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={handleCreateLead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 20, background: leadCreated ? '#EAF3DE' : '#185FA5', color: leadCreated ? '#27500A' : '#fff', border: 'none', cursor: 'pointer' }}>
                        {leadCreated ? <CheckCircle size={12} /> : <UserPlus size={12} />}
                        {leadCreated ? "Lead Created!" : "Create Lead"}
                    </button>
                </div>
            </div>

            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e8e8e8' }}>
                <button onClick={() => setDetailsExpanded(v => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <span style={S.label}>Contact Details</span>
                    {detailsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {detailsExpanded && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            [<Phone size={13} />, contact.phone],
                            contact.email && [<Mail size={13} />, contact.email],
                            contact.preferred_location && [<MapPin size={13} />, contact.preferred_location],
                            contact.budget_max > 0 && [<DollarSign size={13} />, `${formatCurrency(contact.budget_min)} – ${formatCurrency(contact.budget_max)}`],
                            contact.property_type && [<Building2 size={13} />, contact.property_type],
                            [<AlertCircle size={13} />, `Source: ${contact.source}`],
                            [<User size={13} />, `Joined: ${formatRelativeTime(contact.created_at)}`],
                        ].filter(Boolean).map((row, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
                                <span style={{ color: '#aaa', width: 18 }}>{row[0]}</span>
                                <span>{row[1]}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e8e8e8' }}>
                <p style={S.label}>Assigned To</p>
                <select value={contact.assigned_to || ""} onChange={e => onAssign(e.target.value)} style={{ ...S.input, marginTop: 4 }}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
            </div>

            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e8e8e8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={S.label}>Tags</span>
                    <button onClick={() => { setShowTagPicker(v => !v); setTagSearch(""); }} style={{ ...S.btn(false, true), padding: '4px' }}><Plus size={12} /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {contactTags.map(tag => (
                        <span key={tag.id} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600, background: tag.color + '22', color: tag.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {tag.name}
                            <button onClick={() => onRemoveTag(tag.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}><X size={9} /></button>
                        </span>
                    ))}
                    {contactTags.length === 0 && <button onClick={() => setShowTagPicker(true)} style={{ fontSize: 11, color: '#185FA5', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add tags</button>}
                </div>
                {showTagPicker && (
                    <div style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: 8, overflow: 'hidden', marginTop: 4 }}>
                        <div style={{ padding: 6 }}>
                            <input value={tagSearch} onChange={e => setTagSearch(e.target.value)} placeholder="Search tags..." style={{ ...S.input, fontSize: 12, padding: '6px 8px' }} autoFocus />
                        </div>
                        <div style={{ padding: 6, maxHeight: 100, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {filteredAvailableTags.length === 0 ? <span style={{ fontSize: 11, color: '#aaa' }}>No tags</span> : filteredAvailableTags.map(tag => (
                                <button key={tag.id} onClick={() => { onAddTag(tag.id); setShowTagPicker(false); setTagSearch(""); }} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600, background: tag.color + '22', color: tag.color, border: 'none', cursor: 'pointer' }}>{tag.name}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ padding: '12px 16px' }}>
                <button onClick={() => setNotesExpanded(v => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}>
                    <span style={S.label}>Internal Notes ({conversationNotes.length})</span>
                    {notesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {notesExpanded && (
                    <>
                        <div style={{ marginBottom: 10, maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {conversationNotes.length === 0 ? <p style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>No notes yet</p> : conversationNotes.map(note => (
                                <div key={note.id} style={{ background: '#FAEEDA', borderRadius: 8, padding: '8px 10px', borderLeft: `3px solid ${COLORS.amber.border}` }}>
                                    <p style={{ fontSize: 12, color: '#633806', marginBottom: 4 }}>{note.body}</p>
                                    <p style={{ fontSize: 10, color: '#aaa' }}>{note.author?.name || "You"} · {formatRelativeTime(note.created_at)}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add internal note…" rows={2} style={{ ...S.input, fontSize: 12, resize: 'none' }} />
                            <button onClick={() => { if (noteText.trim()) { onAddNote(noteText.trim()); setNoteText(""); } }} disabled={!noteText.trim()} style={{ ...S.btn(true), alignSelf: 'flex-end', padding: '6px 12px' }}><StickyNote size={14} /></button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ChatWindow({ conversation, contact, users, allTags, onUpdateStage, onAssign, onAddTag, onRemoveTag, onClose, conversations, setConversations }) {
    const [messages, setMessages] = useState(Array.isArray(conversation) ? conversation : []);
    const [notes, setNotes] = useState([]);
    const endRef = useRef(null);
    console.log(contact, conversation)
    useEffect(() => {
        if (conversation) { setMessages(MOCK_MESSAGES[conversation.id] || []); setNotes([]); }
    }, [conversation?.id]);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    if (!conversation || !contact) return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f9', color: '#aaa', flexDirection: 'column' }}>
            <Phone size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>Select a conversation</p>
        </div>
    );

    const handleSendText = async (text) => {
        // const newMsg = { id: `m${Date.now()}`, conversation_id: conversation.id, direction: "outbound", message_type: "text", body: text, status: "sent", timestamp: new Date().toISOString(), sender: { name: "You" } };
        const newMsg = await whatsappAPI.sendMessage({ contact_id: contact.id, text })
        console.log(newMsg, "new msg from input")
        setMessages(prev => [...prev, newMsg]);
        notificationStore.push("message", "Message Sent", `Sent to ${contact.name}`, () => { });
    };

    const toggleBotActive = () => {
        if (setConversations) setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, bot_active: !c.bot_active } : c));
    };

    const toggleResolved = () => {
        if (setConversations) setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, status: c.status === "resolved" ? "open" : "resolved" } : c));
    };

    let lastDate = "";
    const messagesWithSeparators = conversation.map(msg => {
        const msgDate = formatDate(msg.time_sent);
        const showSeparator = msgDate !== lastDate;
        lastDate = msgDate;
        return { msg, showSeparator, dateLabel: msgDate };
    });

    return (
        <div style={{ display: 'flex', flex: 1, minWidth: 0, height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
                <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', flexShrink: 0 }}>
                    {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#888' }}><ArrowLeft size={18} /></button>}
                    <Avatar initials={getInitials(contact.name)} color={contact.color || 'blue'} size={36} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{contact.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{contact.phone}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={toggleBotActive} style={{ ...S.btn(false), display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, background: conversation.bot_active ? '#E6F1FB' : '#f5f5f5', color: conversation.bot_active ? '#0C447C' : '#666' }}>
                            <Bot size={14} /> {conversation.bot_active ? "Bot On" : "Bot Off"}
                        </button>
                        <button onClick={toggleResolved} style={{ ...S.btn(false), display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11, background: conversation.status === "resolved" ? '#EAF3DE' : '#f5f5f5', color: conversation.status === "resolved" ? '#27500A' : '#666' }}>
                            {conversation.status === "resolved" ? <Clock size={14} /> : <CheckCircle size={14} />} {conversation.status === "resolved" ? "Reopen" : "Resolve"}
                        </button>
                    </div>
                </div>

                <div style={{ padding: '12px 14px', background: '#f5f7f9', display: 'flex', flexDirection: 'column', gap: 2, height: "78vh", overflowY: "auto" }} className="overflow-y-scroll h-[300px]">
                    {messagesWithSeparators.map(({ msg, showSeparator, dateLabel }: any) => (
                        <MessageBubble key={msg} message={msg} showDateSeparator={showSeparator} dateSeparatorLabel={dateLabel} />
                    ))}
                    <div ref={endRef} />
                </div>

                <ChatInput templates={MOCK_TEMPLATES} onSendText={handleSendText} disabled={conversation.status === "resolved"} />
            </div>

            <div style={{ width: 280, borderLeft: '0.5px solid #e8e8e8', background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
                <ContactInfo contact={contact} users={users} allTags={allTags} onUpdateStage={onUpdateStage} onAssign={onAssign} onAddTag={onAddTag} onRemoveTag={onRemoveTag} conversationNotes={notes} onAddNote={(body) => setNotes(prev => [...prev, { id: String(Date.now()), body, author: { name: "You" }, created_at: new Date().toISOString() }])} />
            </div>
        </div>
    );
}

// --- ConversationList with advanced filter modal ---
const FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'resolved', label: 'Resolved' },
];

type DatePreset = 'Today' | 'This Week' | 'This Month';
interface AdvancedFilter {
    datePreset: DatePreset | null;
    dateFrom: string;
    dateTo: string;
    stages: string[];
    hasUnread: boolean | null;
    tagSearch: string;
}
const emptyAdvanced: AdvancedFilter = {
    datePreset: null, dateFrom: '', dateTo: '', stages: [], hasUnread: null, tagSearch: '',
};
const STAGES_LIST = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'];
const DATE_PRESETS: DatePreset[] = ['Today', 'This Week', 'This Month'];

function ConversationList({ conversations, loading, selectedId, filter, search, onSelect, onFilterChange, onSearchChange, onRefresh }) {
    const [showFilter, setShowFilter] = useState(false);
    const [advanced, setAdvanced] = useState<AdvancedFilter>(emptyAdvanced);
    const [pendingFilter, setPendingFilter] = useState<AdvancedFilter>(emptyAdvanced);
    const hasActiveFilter = advanced.datePreset !== null || advanced.dateFrom || advanced.dateTo
        || advanced.stages.length > 0 || advanced.hasUnread !== null || advanced.tagSearch;

    const applyAdvanced = (f: AdvancedFilter) => {
        setAdvanced(f);
        setShowFilter(false);
    };

    const filteredConversations = conversations.filter((conv) => {
        // Stage filter
        if (advanced.stages.length > 0) {
            const stage = conv.contact?.stage || 'New';
            if (!advanced.stages.includes(stage)) return false;
        }
        // Read status filter
        if (advanced.hasUnread === true && !conv.unread_count) return false;
        if (advanced.hasUnread === false && conv.unread_count > 0) return false;
        // Tag search
        if (advanced.tagSearch) {
            const tags = conv.contact?.tags || [];
            const match = tags.some((t) => t.name.toLowerCase().includes(advanced.tagSearch.toLowerCase()));
            if (!match) return false;
        }
        // Date filters
        if (advanced.datePreset || advanced.dateFrom || advanced.dateTo) {
            const msgDate = conv.last_message_at ? new Date(conv.last_message_at) : null;
            if (!msgDate) return false;
            const now = new Date();
            if (advanced.datePreset === 'Today') {
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (msgDate < today) return false;
            } else if (advanced.datePreset === 'This Week') {
                const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
                if (msgDate < weekAgo) return false;
            } else if (advanced.datePreset === 'This Month') {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                if (msgDate < monthStart) return false;
            }
            if (advanced.dateFrom && msgDate < new Date(advanced.dateFrom)) return false;
            if (advanced.dateTo) {
                const to = new Date(advanced.dateTo); to.setDate(to.getDate() + 1);
                if (msgDate > to) return false;
            }
        }
        return true;
    });

    const openFilter = () => {
        setPendingFilter({ ...advanced });
        setShowFilter(true);
    };

    const STAGE_DOT = {
        New: "#185FA5", Contacted: "#EF9F27", Qualified: "#639922",
        "Site Visit": "#D85A30", Closed: "#1D9E75", Lost: "#D85A30",
    };

    return (
        <div style={{ width: 280, borderRight: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, background: '#fff', position: 'relative' }}>
            <div style={{ padding: '10px 12px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', gap: 8 }}>
                <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search name or phone..." style={{ ...S.input, flex: 1 }} />
                <button onClick={openFilter} style={{ position: 'relative', ...S.btn(false), padding: '6px 10px' }}>
                    <SlidersHorizontal size={14} />
                    {hasActiveFilter && <span style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, background: '#1D9E75', borderRadius: '50%' }} />}
                </button>
                <button onClick={onRefresh} style={{ ...S.btn(false), padding: '6px 10px' }}><RefreshCw size={14} className={loading ? "spin" : ""} /></button>
            </div>
            <div style={{ display: 'flex', padding: '6px 10px', gap: 4, borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
                {FILTER_TABS.map(f => (
                    <button key={f.id} onClick={() => onFilterChange(f.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', border: 'none', background: filter === f.id ? '#E6F1FB' : 'transparent', color: filter === f.id ? '#0C447C' : '#888', fontWeight: filter === f.id ? 700 : 400 }}>{f.label}</button>
                ))}
            </div>
            {hasActiveFilter && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 10px', background: '#E6F1FB', fontSize: 10, color: '#0C447C' }}>
                    <span>Filters active</span>
                    <button onClick={() => setAdvanced(emptyAdvanced)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D85A30', display: 'flex', alignItems: 'center', gap: 2 }}><X size={10} /> Clear</button>
                </div>
            )}
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {loading && filteredConversations.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div style={{ width: 20, height: 20, border: '2px solid #185FA5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /></div>
                ) : filteredConversations.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 12 }}>No conversations</div>
                ) : (
                    filteredConversations.map(conv => {
                        const contact = conv.contact;
                        const isSelected = conv.id === selectedId;
                        const hasUnread = conv.unread_count > 0;
                        const stage = conv?.stage || "New";
                        const tags = conv?.tags || [];
                        const displayName = conv?.name || contact?.phone || "Unknown";
                        const initials = getInitials(displayName);
                        const priorityTags = ['Buyer', 'Seller', 'Investor', 'Hot Lead', 'VIP'];
                        const priorityTag = tags.find(t => priorityTags.includes(t.name));
                        const otherTags = tags.filter(t => !priorityTags.includes(t.name)).slice(0, 1);
                        return (
                            <button key={conv.id} onClick={() => onSelect(conv)} style={{ width: '100%', padding: '10px 12px', cursor: 'pointer', borderBottom: '0.5px solid #f0f0f0', display: 'flex', gap: 10, background: isSelected ? '#EDF4FC' : 'transparent', textAlign: 'left', borderLeft: isSelected ? `2px solid ${COLORS.blue.border}` : '2px solid transparent' }}>
                                <div style={{ position: 'relative' }}>
                                    <Avatar initials={initials} color={contact?.color || 'blue'} size={38} />
                                    <span style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: STAGE_DOT[stage] || '#aaa', border: '2px solid white' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, fontWeight: hasUnread ? 700 : 500, color: '#111' }}>{displayName}</span>
                                        <span style={{ fontSize: 10, color: '#aaa' }}>{formatRelativeTime(conv.last_message_at)}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{truncate(conv.last_message || "No messages yet", 40)}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {priorityTag && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: priorityTag.color + '22', color: priorityTag.color, fontWeight: 600 }}>{priorityTag.name}</span>}
                                            {otherTags.map(tag => <span key={tag.id} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 8, background: tag.color + '22', color: tag.color }}>{tag.name}</span>)}
                                        </div>
                                        {hasUnread && <span style={{ background: '#E24B4A', color: '#fff', fontSize: 10, borderRadius: 8, padding: '1px 5px', fontWeight: 700 }}>{conv.unread_count}</span>}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
            {showFilter && (
                <FilterModal
                    value={pendingFilter}
                    onChange={setPendingFilter}
                    onApply={() => applyAdvanced(pendingFilter)}
                    onClear={() => { setPendingFilter(emptyAdvanced); applyAdvanced(emptyAdvanced); }}
                    onClose={() => setShowFilter(false)}
                />
            )}
        </div>
    );
}

function FilterModal({ value, onChange, onApply, onClear, onClose }) {
    const toggleStage = (s) => {
        onChange({
            ...value,
            stages: value.stages.includes(s) ? value.stages.filter(x => x !== s) : [...value.stages, s],
        });
    };

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', background: '#fff', borderRight: '0.5px solid #e8e8e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '0.5px solid #e8e8e8' }}>
                <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>Filter Conversations</h3>
                    <p style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Narrow down your inbox view</p>
                </div>
                <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Date Section */}
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} color="#888" /> Date</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        {DATE_PRESETS.map(p => (
                            <button key={p} onClick={() => onChange({ ...value, datePreset: value.datePreset === p ? null : p, dateFrom: '', dateTo: '' })} style={{ ...S.btn(value.datePreset === p, true), fontSize: 11 }}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><label style={S.label}>From</label><input type="date" value={value.dateFrom} onChange={e => onChange({ ...value, dateFrom: e.target.value, datePreset: null })} style={S.input} /></div>
                        <div><label style={S.label}>To</label><input type="date" value={value.dateTo} onChange={e => onChange({ ...value, dateTo: e.target.value, datePreset: null })} style={S.input} /></div>
                    </div>
                </div>

                {/* Pipeline Stage */}
                <div>
                    <p style={S.label}>Pipeline Stage</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {STAGES_LIST.map(s => (
                            <button key={s} onClick={() => toggleStage(s)} style={{ ...S.btn(value.stages.includes(s), true), fontSize: 11 }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Read Status */}
                <div>
                    <p style={S.label}>Read Status</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {[
                            { label: 'All', val: null },
                            { label: 'Unread only', val: true },
                            { label: 'Read only', val: false },
                        ].map(opt => (
                            <button key={String(opt.val)} onClick={() => onChange({ ...value, hasUnread: opt.val })} style={{ ...S.btn(value.hasUnread === opt.val, true), flex: 1, fontSize: 11 }}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter by Tag */}
                <div>
                    <p style={S.label}>Filter by Tag</p>
                    <div style={{ position: 'relative' }}>
                        <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input type="text" value={value.tagSearch} onChange={e => onChange({ ...value, tagSearch: e.target.value })} placeholder="e.g. Buyer, Hot Lead..." style={{ ...S.input, paddingLeft: 26 }} />
                    </div>
                </div>
            </div>

            <div style={{ padding: '12px 16px', borderTop: '0.5px solid #e8e8e8', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={onApply} style={{ ...S.btn(true), width: '100%', justifyContent: 'center', gap: 6 }}><CheckCircle size={14} /> Apply Filters</button>
                <button onClick={onClear} style={{ ...S.btn(false), width: '100%', justifyContent: 'center' }}>Clear All</button>
            </div>
        </div>
    );
}

// --- InboxPage (unchanged, uses updated ConversationList) ---
function InboxPage() {
    const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [contacts, setContacts] = useState<any>(MOCK_CONTACTS);
    const [selectedContact, setSelectedContact] = useState(null)

    const selectedConv = conversations.find(c => c.id === selectedConvId) || null;
    // const selectedContact = selectedConv ? contacts.find(c => c.id === selectedConv.contact_id) || selectedConv.contact : null;
    const loadContacts = async () => {
        try {
            const whatsappRes = await whatsappAPI.getContacts();
            // console.log("res of whatsapp : ", whatsappRes)
            setContacts(Array.isArray(whatsappRes) ? whatsappRes : [])
        } catch (error) {
            console.log(error)
        }
    }




    useEffect(() => {
        loadContacts()
    }, [contacts])
    const handleSelectConversation = async (conv) => {
        try {
            const waMessagesRes: any = await whatsappAPI.getMessages(conv.id)
            setConversations(Array.isArray(waMessagesRes) ? waMessagesRes : [])
            console.log("wa  messae", waMessagesRes)
            setSelectedConvId(conv.id);
            setSelectedContact(conv)
            setConversations(waMessagesRes);
        } catch (error) {
            console.log(error)
        }
    };

    const handleUpdateStage = (stage) => {
        if (!selectedContact) return;
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, stage } : c));
        setConversations(prev => prev.map(c => c.id === selectedConvId ? { ...c, contact: { ...c.contact, stage } } : c));
    };

    const handleAssign = (userId) => {
        if (!selectedContact) return;
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, assigned_to: userId } : c));
    };

    const handleAddTag = (tagId) => {
        if (!selectedContact) return;
        const tag = MOCK_TAGS.find(t => t.id === tagId);
        if (!tag) return;
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, tags: [...(c.tags || []), tag] } : c));
        setConversations(prev => prev.map(c => c.id === selectedConvId ? { ...c, contact: { ...c.contact, tags: [...(c.contact?.tags || []), tag] } } : c));
    };

    const handleRemoveTag = (tagId) => {
        if (!selectedContact) return;
        setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, tags: (c.tags || []).filter(t => t.id !== tagId) } : c));
        setConversations(prev => prev.map(c => c.id === selectedConvId ? { ...c, contact: { ...c.contact, tags: (c.contact?.tags || []).filter(t => t.id !== tagId) } } : c));
    };

    const enrichedConvs = conversations.map(conv => ({ ...conv, contact: contacts.find(c => c.id === conv.contact_id) || conv.contact }));
    const enrichedContact = selectedContact ? contacts.find(c => c.id === selectedContact.id) || selectedContact : null;


    return (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#fff' }}>
            <ConversationList conversations={contacts} loading={false} selectedId={selectedConvId} filter={filter} search={search} onSelect={handleSelectConversation} onFilterChange={setFilter} onSearchChange={setSearch} onRefresh={() => { }} />
            <ChatWindow onClose={() => { }} conversation={conversations} contact={selectedContact} users={MOCK_USERS} allTags={MOCK_TAGS} onUpdateStage={handleUpdateStage} onAssign={handleAssign} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} conversations={conversations} setConversations={setConversations} />
        </div>
    );
}

// ─── Templates Page (restyled) ───────────────────────────────────────────────
function PhonePreview({ form, cat, compact = false }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#e5ddd5', borderRadius: 16, padding: compact ? 12 : 20, width: compact ? '100%' : 280, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 9, textAlign: 'center', color: '#888', marginBottom: 8, background: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: '2px 8px', width: 'fit-content', margin: '0 auto 8px' }}>Today</div>
                <div style={{ background: '#fff', borderRadius: 12, borderTopLeftRadius: 4, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden', maxWidth: '90%', margin: '0 auto' }}>
                    {form.header_type === "TEXT" && form.header_text && <div style={{ padding: '8px 10px 4px' }}><p style={{ fontWeight: 700, fontSize: compact ? 11 : 13, margin: 0 }}>{form.header_text}</p></div>}
                    {form.header_type === "IMAGE" && <div style={{ background: '#f0f0f0', height: compact ? 60 : 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={compact ? 16 : 24} color="#aaa" /></div>}
                    <div style={{ padding: '8px 10px' }}>
                        <p style={{ fontSize: compact ? 11 : 13, color: '#111', whiteSpace: 'pre-wrap' }}>{form.body.replace(/\{\{(\d+)\}\}/g, (_, n) => `[var ${n}]`) || <span style={{ color: '#aaa' }}>Message body...</span>}</p>
                        {form.footer && <p style={{ fontSize: compact ? 9 : 10, color: '#aaa', marginTop: 6, fontStyle: 'italic' }}>{form.footer}</p>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><span style={{ fontSize: 9, color: '#aaa' }}>10:30</span></div>
                    </div>
                    {form.buttons.length > 0 && (
                        <div style={{ borderTop: '0.5px solid #eee' }}>
                            {form.buttons.map((btn, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '8px 0', fontSize: compact ? 10 : 12, fontWeight: 600, color: '#185FA5', borderTop: i > 0 ? '0.5px solid #eee' : 'none' }}>{btn.text}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TemplateForm({ template, onSubmit, onClose }) {
    const CATEGORIES = [
        { value: "MARKETING", label: "Marketing", desc: "Promotions & offers" },
        { value: "UTILITY", label: "Utility", desc: "Updates & alerts" },
        { value: "AUTHENTICATION", label: "Auth", desc: "OTPs & verification" },
    ];
    const HEADER_TYPES = [
        { value: "", label: "None", icon: X }, { value: "TEXT", label: "Text", icon: Type },
        { value: "IMAGE", label: "Image", icon: Image }, { value: "DOCUMENT", label: "Doc", icon: FileDoc }, { value: "VIDEO", label: "Video", icon: Video },
    ];

    const emptyForm = { name: "", category: "MARKETING", language: "en", header_type: "", header_text: "", body: "", footer: "", buttons: [] };
    const [form, setForm] = useState(template ? { name: template.name, category: template.category, language: template.language, header_type: template.header_type || "", header_text: template.header_text || "", body: template.body, footer: template.footer || "", buttons: template.buttons || [] } : emptyForm);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(template ? "edit" : "edit");

    const cat = CATEGORIES.find(c => c.value === form.category);
    const variableCount = (form.body.match(/\{\{(\d+)\}\}/g) || []).length;

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.body.trim()) return;
        setSaving(true);
        await onSubmit({ ...form, name: form.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"), header_type: form.header_type || null, header_text: form.header_type === "TEXT" ? form.header_text : null, footer: form.footer || null, buttons: form.buttons.length > 0 ? form.buttons : null, status: "PENDING" });
        setSaving(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 1000, maxHeight: '96vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 35px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '0.5px solid #e8e8e8' }}>
                    <div><h2 style={{ fontSize: 16, fontWeight: 700 }}>{template ? "Edit Template" : "New Template"}</h2><p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>WhatsApp Business Message Template</p></div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#aaa' }}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', borderBottom: '0.5px solid #e8e8e8', padding: '0 20px', gap: 20 }}>
                    {(["edit", "preview"]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 0', fontSize: 13, fontWeight: 600, borderBottom: activeTab === tab ? '2px solid #185FA5' : '2px solid transparent', color: activeTab === tab ? '#185FA5' : '#888', background: 'none', cursor: 'pointer' }}>
                            {tab === "edit" ? "Edit" : "Preview"}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                    {activeTab === "edit" && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={S.label}>Template Name *</label>
                                <input style={S.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. buyer_welcome" />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={S.label}>Category *</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {CATEGORIES.map(c => (
                                        <button key={c.value} onClick={() => setForm(p => ({ ...p, category: c.value }))} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${form.category === c.value ? '#185FA5' : '#ddd'}`, background: form.category === c.value ? '#E6F1FB' : '#fff', cursor: 'pointer' }}>
                                            <div style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</div>
                                            <div style={{ fontSize: 10, color: '#888' }}>{c.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={S.label}>Header Type</label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {HEADER_TYPES.map(h => {
                                        const Icon = h.icon;
                                        return (
                                            <button key={h.value} onClick={() => setForm(p => ({ ...p, header_type: h.value, header_text: "" }))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: `1px solid ${form.header_type === h.value ? '#185FA5' : '#ddd'}`, background: form.header_type === h.value ? '#E6F1FB' : '#fff', fontSize: 11, cursor: 'pointer' }}>
                                                <Icon size={12} /> {h.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            {form.header_type === "TEXT" && (
                                <div style={{ marginBottom: 16 }}>
                                    <label style={S.label}>Header Text</label>
                                    <input style={S.input} value={form.header_text} onChange={e => setForm(p => ({ ...p, header_text: e.target.value }))} maxLength={60} />
                                </div>
                            )}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={S.label}>Message Body *</label>
                                    <span style={{ fontSize: 10, color: '#aaa' }}>{form.body.length}/1024 {variableCount > 0 && `· ${variableCount} var${variableCount > 1 ? 's' : ''}`}</span>
                                </div>
                                <textarea rows={6} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} style={{ ...S.input, resize: 'vertical' }} placeholder="Hello {{1}}, we have a property for you in {{2}}." maxLength={1024} />
                                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                                    {["{{1}}", "{{2}}", "{{3}}", "{{4}}"].map(v => (
                                        <button key={v} onClick={() => setForm(p => ({ ...p, body: p.body + v }))} style={{ fontSize: 10, padding: '2px 6px', background: '#f0f0f0', border: 'none', borderRadius: 4, cursor: 'pointer' }}>{v}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={S.label}>Footer (optional)</label>
                                <input style={S.input} value={form.footer} onChange={e => setForm(p => ({ ...p, footer: e.target.value }))} maxLength={60} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={S.label}>Buttons (max 3)</label>
                                    <button onClick={() => { if (form.buttons.length < 3) setForm(p => ({ ...p, buttons: [...p.buttons, { type: "QUICK_REPLY", text: "" }] })); }} disabled={form.buttons.length >= 3} style={{ ...S.btn(false, true) }}><Plus size={12} /> Add</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {form.buttons.map((btn, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <select value={btn.type} onChange={e => setForm(p => ({ ...p, buttons: p.buttons.map((b, idx) => idx === i ? { ...b, type: e.target.value } : b) }))} style={{ ...S.input, width: 'auto' }}>
                                                <option value="QUICK_REPLY">Quick Reply</option>
                                                <option value="URL">URL Link</option>
                                            </select>
                                            <input placeholder="Button label" value={btn.text} maxLength={25} onChange={e => setForm(p => ({ ...p, buttons: p.buttons.map((b, idx) => idx === i ? { ...b, text: e.target.value } : b) }))} style={{ ...S.input }} />
                                            <button onClick={() => setForm(p => ({ ...p, buttons: p.buttons.filter((_, idx) => idx !== i) }))} style={{ ...S.btn(false, true), color: '#D85A30' }}><Trash2 size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "preview" && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', justifyContent: 'center' }}>
                            <PhonePreview form={form} cat={cat} />
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 20px', borderTop: '0.5px solid #e8e8e8', background: '#fafafa' }}>
                    <button onClick={onClose} style={S.btn(false)}>Cancel</button>
                    <button onClick={handleSubmit} disabled={saving || !form.name.trim() || !form.body.trim()} style={{ ...S.btn(true), opacity: (saving || !form.name.trim() || !form.body.trim()) ? 0.6 : 1 }}>
                        {saving ? "Saving..." : template ? "Update Template" : "Submit for Review"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TemplatesPage() {
    const [templates, setTemplates] = useState(MOCK_TEMPLATES);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const filtered = templates.filter(t => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const statusCounts = { ALL: templates.length, APPROVED: templates.filter(t => t.status === "APPROVED").length, PENDING: templates.filter(t => t.status === "PENDING").length, REJECTED: templates.filter(t => t.status === "REJECTED").length, IN_APPEAL: templates.filter(t => t.status === "IN_APPEAL").length };

    const handleSubmit = async (data) => {
        if (editing) {
            setTemplates(prev => prev.map(t => t.id === editing.id ? { ...t, ...data, updated_at: new Date().toISOString() } : t));
        } else {
            setTemplates(prev => [{ id: `tpl${Date.now()}`, created_at: new Date().toISOString(), ...data }, ...prev]);
        }
        setShowForm(false); setEditing(null);
        notificationStore.push("template", "Template Saved", `Template "${data.name}" submitted for review.`, () => { });
    };

    const handleDelete = (id) => { setTemplates(prev => prev.filter(t => t.id !== id)); setConfirmDelete(null); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7f9', overflow: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div><h1 style={{ fontSize: 20, fontWeight: 700 }}>Templates</h1><p style={{ fontSize: 12, color: '#888' }}>WhatsApp message templates — Meta reviewed</p></div>
                    <button onClick={() => { setEditing(null); setShowForm(true); }} style={{ ...S.btn(true), gap: 6 }}><Plus size={16} /> New Template</button>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, paddingLeft: 30 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {["ALL", "APPROVED", "PENDING", "REJECTED", "IN_APPEAL"].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)} style={{ ...S.btn(statusFilter === s, true), fontSize: 11 }}>
                                {s.replace("_", " ")} <span style={{ marginLeft: 4, opacity: 0.7 }}>({statusCounts[s]})</span>
                            </button>
                        ))}
                    </div>
                </div>
                {statusCounts["PENDING"] > 0 && (
                    <div style={{ marginTop: 12, background: '#FAEEDA', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#633806' }}>
                        <Clock size={14} /> <strong>{statusCounts["PENDING"]}</strong> template{statusCounts["PENDING"] > 1 ? 's' : ''} pending Meta review.
                    </div>
                )}
            </div>

            <div style={{ padding: 20, flex: 1, overflow: 'auto' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>No templates found</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                        {filtered.map(template => {
                            const status = STATUS_CONFIG_TEMPLATE[template.status] || { label: template.status, color: '#888', bg: '#f0f0f0', icon: Clock };
                            const StatusIcon = status.icon;
                            const varCount = (template.variables?.length || 0) || (template.body.match(/\{\{\d+\}\}/g) || []).length;
                            const cost = META_COST[template.category] || 0;
                            const catColor = template.category === 'MARKETING' ? 'coral' : template.category === 'UTILITY' ? 'green' : 'blue';
                            return (
                                <div key={template.id} style={{ ...S.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: 14, fontWeight: 600 }}>{template.name}</h3>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                                <Tag tag={catColor} stage={template.category} />
                                                <span style={{ fontSize: 10, background: '#f0f0f0', padding: '2px 6px', borderRadius: 6 }}>{template.language.toUpperCase()}</span>
                                                {varCount > 0 && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#0C447C', padding: '2px 6px', borderRadius: 6 }}>{varCount} var{varCount > 1 ? 's' : ''}</span>}
                                            </div>
                                        </div>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: status.bg, padding: '2px 8px', borderRadius: 12, color: status.color }}><StatusIcon size={11} /> {status.label}</span>
                                    </div>
                                    {template.header_text && <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{template.header_text}</p>}
                                    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{truncate(template.body.replace(/\{\{(\d+)\}\}/g, (_, n) => `[var${n}]`), 120)}</p>
                                    {template.footer && <p style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>{template.footer}</p>}
                                    {template.buttons && template.buttons.length > 0 && (
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {template.buttons.map((btn, i) => <span key={i} style={{ fontSize: 10, background: '#f0f0f0', padding: '2px 6px', borderRadius: 12 }}>{btn.text}</span>)}
                                        </div>
                                    )}
                                    {template.rejection_reason && (
                                        <div style={{ background: '#FAECE7', padding: 8, borderRadius: 8, fontSize: 11, color: '#712B13' }}>
                                            <strong>Rejection:</strong> {template.rejection_reason}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTop: '0.5px solid #eee', paddingTop: 10 }}>
                                        <div style={{ fontSize: 11, color: '#888' }}><DollarSign size={12} style={{ display: 'inline', marginRight: 2 }} />{cost === 0 ? 'Free' : `$${cost.toFixed(4)}/conv`}</div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => setPreviewTemplate(template)} style={S.btn(false, true)}><Eye size={12} /> Preview</button>
                                            <button onClick={() => { setEditing(template); setShowForm(true); }} style={S.btn(false, true)}><Edit2 size={12} /> Edit</button>
                                            {template.status !== "APPROVED" && (
                                                <button onClick={() => { setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, status: "PENDING" } : t)); }} style={{ ...S.btn(true, true) }}><Send size={12} /> Submit</button>
                                            )}
                                            <button onClick={() => setConfirmDelete(template.id)} style={{ ...S.btn(false, true), color: '#D85A30' }}><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {(showForm || editing) && <TemplateForm template={editing} onSubmit={handleSubmit} onClose={() => { setShowForm(false); setEditing(null); }} />}
            {previewTemplate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
                    <div style={{ background: '#fff', borderRadius: 20, width: 400, maxWidth: '90%', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Preview — {previewTemplate.name}</h3>
                            <button onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: 20, background: '#e5ddd5' }}>
                            <div style={{ background: '#fff', borderRadius: 12, borderTopLeftRadius: 4, maxWidth: '90%', margin: '0 auto', overflow: 'hidden' }}>
                                {previewTemplate.header_text && <div style={{ padding: '8px 10px 2px' }}><p style={{ fontWeight: 700, fontSize: 13 }}>{previewTemplate.header_text}</p></div>}
                                <div style={{ padding: '8px 10px' }}>
                                    <p style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{previewTemplate.body.replace(/\{\{(\d+)\}\}/g, (_, n) => `[var ${n}]`)}</p>
                                    {previewTemplate.footer && <p style={{ fontSize: 10, color: '#aaa', marginTop: 6 }}>{previewTemplate.footer}</p>}
                                </div>
                                {previewTemplate.buttons && previewTemplate.buttons.length > 0 && (
                                    <div style={{ borderTop: '0.5px solid #eee' }}>
                                        {previewTemplate.buttons.map((btn, i) => (
                                            <div key={i} style={{ padding: '8px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#185FA5', borderTop: i > 0 ? '0.5px solid #eee' : 'none' }}>{btn.text}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {confirmDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 320 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Delete Template?</h3>
                        <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setConfirmDelete(null)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} style={{ ...S.btn(true), background: '#D85A30', flex: 1 }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Campaigns Page (restyled) ───────────────────────────────────────────────
function ProgressBar({ value, total, color }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 10, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10 }} />
            </div>
            <span style={{ fontSize: 11, color: '#888', width: 36, textAlign: 'right' }}>{pct}%</span>
        </div>
    );
}

function CampaignDetailModal({ campaign, onClose, onLaunch }) {
    const stats = [
        { label: "Total", value: campaign.total_contacts, color: "#333" },
        { label: "Sent", value: campaign.sent_count, color: "#185FA5" },
        { label: "Delivered", value: campaign.delivered_count, color: "#27500A" },
        { label: "Read", value: campaign.read_count, color: "#633806" },
        { label: "Failed", value: campaign.failed_count, color: "#D85A30" },
    ];
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#fff', borderRadius: 20, width: 500, maxWidth: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><h3 style={{ fontSize: 16, fontWeight: 600 }}>{campaign.name}</h3><p style={{ fontSize: 12, color: '#888' }}>Template: {campaign.template?.name}</p></div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ padding: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                        {stats.map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
                                <p style={{ fontSize: 10, color: '#888' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                    {(campaign.status === "draft" || campaign.status === "paused") && (
                        <button onClick={onLaunch} style={{ ...S.btn(true), width: '100%', justifyContent: 'center' }}><Send size={14} /> Launch Campaign Now</button>
                    )}
                </div>
                <div style={{ padding: '12px 20px', borderTop: '0.5px solid #e8e8e8', textAlign: 'right' }}>
                    <button onClick={onClose} style={S.btn(false)}>Close</button>
                </div>
            </div>
        </div>
    );
}

function CampaignsPage() {
    const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
    const [showForm, setShowForm] = useState(false);
    const [detailCampaign, setDetailCampaign] = useState(null);
    const [newName, setNewName] = useState("");
    const [newTemplateId, setNewTemplateId] = useState("");

    const approvedTemplates = MOCK_TEMPLATES.filter(t => t.status === "APPROVED");

    const handleCreate = () => {
        if (!newName.trim() || !newTemplateId) return;
        const tpl = approvedTemplates.find(t => t.id === newTemplateId);
        const newCamp = { id: `camp${Date.now()}`, name: newName, template: tpl, template_id: newTemplateId, status: "draft", total_contacts: 0, sent_count: 0, delivered_count: 0, read_count: 0, failed_count: 0, scheduled_at: null, filters: {}, created_at: new Date().toISOString() };
        setCampaigns(prev => [newCamp, ...prev]);
        setShowForm(false); setNewName(""); setNewTemplateId("");
        notificationStore.push("campaign", "Campaign Created", `"${newName}" saved as draft.`, () => { });
    };

    const handleLaunch = (id) => {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "running" } : c));
        setDetailCampaign(null);
        notificationStore.push("campaign", "Campaign Launched", "Campaign is now running.", () => { });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7f9', overflow: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 700 }}>Campaigns</h1><p style={{ fontSize: 12, color: '#888' }}>Bulk WhatsApp message campaigns</p></div>
                <button onClick={() => setShowForm(true)} style={{ ...S.btn(true), gap: 6 }}><Plus size={16} /> New Campaign</button>
            </div>

            <div style={{ padding: 20, flex: 1, overflow: 'auto' }}>
                {campaigns.map(campaign => {
                    const status = STATUS_CONFIG_CAMPAIGN[campaign.status] || { label: campaign.status, color: '#666', bg: '#f0f0f0', icon: Clock };
                    const StatusIcon = status.icon;
                    const canLaunch = campaign.status === "draft" || campaign.status === "paused";
                    return (
                        <div key={campaign.id} style={{ ...S.card, marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: status.color }}><StatusIcon size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <h3 style={{ fontSize: 15, fontWeight: 600 }}>{campaign.name}</h3>
                                            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                                <span style={{ fontSize: 11, fontWeight: 500, color: status.color, background: status.bg, padding: '2px 8px', borderRadius: 12 }}>{status.label}</span>
                                                {campaign.template && <span style={{ fontSize: 11, color: '#888' }}>Template: {campaign.template.name}</span>}
                                                {campaign.scheduled_at && <span style={{ fontSize: 11, color: '#888' }}>Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setDetailCampaign(campaign)} style={S.btn(false, true)}><Eye size={12} /> Details</button>
                                            {canLaunch && <button onClick={() => handleLaunch(campaign.id)} style={{ ...S.btn(true, true) }}><Send size={12} /> Launch</button>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 12 }}>
                                        {[
                                            { label: "Total", value: campaign.total_contacts, color: "#333" },
                                            { label: "Sent", value: campaign.sent_count, color: "#185FA5" },
                                            { label: "Delivered", value: campaign.delivered_count, color: "#27500A" },
                                            { label: "Read", value: campaign.read_count, color: "#633806" },
                                        ].map(m => (
                                            <div key={m.label} style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</p>
                                                <p style={{ fontSize: 10, color: '#888' }}>{m.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {campaign.total_contacts > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <ProgressBar value={campaign.sent_count} total={campaign.total_contacts} color="#185FA5" />
                                            <ProgressBar value={campaign.delivered_count} total={campaign.total_contacts} color="#1D9E75" />
                                            <ProgressBar value={campaign.read_count} total={campaign.total_contacts} color="#EF9F27" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: 400 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Create Campaign</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label style={S.label}>Campaign Name *</label>
                            <input style={S.input} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Wakad Property Blast" />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Template *</label>
                            <select style={S.input} value={newTemplateId} onChange={e => setNewTemplateId(e.target.value)}>
                                <option value="">Select template...</option>
                                {approvedTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setShowForm(false)} style={{ ...S.btn(false), flex: 1 }}>Cancel</button>
                            <button onClick={handleCreate} disabled={!newName.trim() || !newTemplateId} style={{ ...S.btn(true), flex: 1, opacity: (!newName.trim() || !newTemplateId) ? 0.5 : 1 }}>Save as Draft</button>
                        </div>
                    </div>
                </div>
            )}
            {detailCampaign && <CampaignDetailModal campaign={detailCampaign} onClose={() => setDetailCampaign(null)} onLaunch={() => handleLaunch(detailCampaign.id)} />}
        </div>
    );
}

// ─── Analytics Page (restyled) ───────────────────────────────────────────────
function AnalyticsPage() {
    const overview = MOCK_ANALYTICS;
    const metrics = [
        { label: "Total Contacts", value: overview.total_contacts.toLocaleString(), sub: `+${overview.new_leads_today} today`, color: COLORS.blue.text },
        { label: "New Leads (Week)", value: overview.new_leads_week, sub: `+${overview.new_leads_today} today`, color: COLORS.green.text },
        { label: "Open Conversations", value: overview.open_conversations, sub: "active chats", color: COLORS.teal.text },
        { label: "Messages Sent Today", value: overview.messages_sent_today, sub: `${overview.messages_received_today} received`, color: COLORS.purple.text },
        { label: "Response Rate", value: `${overview.response_rate}%`, sub: "today", color: COLORS.amber.text },
        { label: "Active Campaigns", value: overview.active_campaigns, sub: "running now", color: COLORS.green.text },
    ];

    const maxVol = Math.max(...MOCK_MESSAGE_VOLUME.map(d => Math.max(d.inbound, d.outbound)));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7f9', overflow: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '16px 20px' }}>
                <h1 style={{ fontSize: 20, fontWeight: 700 }}>Analytics Overview</h1>
                <p style={{ fontSize: 12, color: '#888' }}>Real-time WhatsApp CRM performance</p>
            </div>

            <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {metrics.map(m => (
                        <div key={m.label} style={{ ...S.card, textAlign: 'center' }}>
                            <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{m.label}</p>
                            <p style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</p>
                            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{m.sub}</p>
                        </div>
                    ))}
                </div>

                <div style={{ ...S.card, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Message Volume (7 days)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150 }}>
                        {MOCK_MESSAGE_VOLUME.map(d => (
                            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 120 }}>
                                    <div style={{ flex: 1, background: '#1D9E75', borderRadius: '4px 4px 0 0', height: `${(d.outbound / maxVol) * 100}%` }} />
                                    <div style={{ flex: 1, background: '#185FA5', borderRadius: '4px 4px 0 0', height: `${(d.inbound / maxVol) * 100}%` }} />
                                </div>
                                <span style={{ fontSize: 10, color: '#888' }}>{d.date.split(' ')[1]}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#1D9E75', borderRadius: 2 }} /><span style={{ fontSize: 11, color: '#555' }}>Outbound</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#185FA5', borderRadius: 2 }} /><span style={{ fontSize: 11, color: '#555' }}>Inbound</span></div>
                    </div>
                </div>

                <div style={S.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top Campaign Performance</h3>
                    {MOCK_CAMPAIGN_STATS.map(c => (
                        <div key={c.name} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                                <span style={{ fontSize: 11, color: '#888' }}>{c.sent} sent</span>
                            </div>
                            <ProgressBar value={c.delivered} total={c.sent} color="#1D9E75" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                <span style={{ fontSize: 11, color: '#888' }}>Delivered: {c.delivered}</span>
                                <span style={{ fontSize: 11, color: '#888' }}>Read: {c.read}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Chatbot Page (restyled) ─────────────────────────────────────────────────
function FlowBuilder({ flow, onClose, onSave }) {
    const [name, setName] = useState(flow?.name || "");
    const [description, setDescription] = useState(flow?.description || "");
    const [triggerKeyword, setTriggerKeyword] = useState(flow?.trigger_keyword || "");
    const [isDefault, setIsDefault] = useState(flow?.is_default || false);
    const [steps, setSteps] = useState(flow?.steps || []);
    const [expanded, setExpanded] = useState(0);
    const [saving, setSaving] = useState(false);

    const addStep = () => {
        const newStep = { id: `local_${Math.random().toString(36).slice(2)}`, flow_id: flow?.id || "", step_index: steps.length, step_type: "message", message_text: "", buttons: null, save_response_as: null, tag_id: null, assign_to: null, stage: null, template_id: null, next_step_index: null, conditions: null };
        const updated = [...steps, newStep];
        setSteps(updated); setExpanded(updated.length - 1);
    };

    const removeStep = (idx) => { setSteps(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_index: i }))); setExpanded(null); };
    const updateStep = (idx, patch) => { const updated = [...steps]; updated[idx] = { ...updated[idx], ...patch }; setSteps(updated); };

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        await new Promise(r => setTimeout(r, 400));
        onSave({ id: flow?.id || `flow${Date.now()}`, name, description, trigger_keyword: triggerKeyword, is_default: isDefault, is_active: true, steps });
        setSaving(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{flow ? "Edit Flow" : "Create Flow"}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                <div style={{ padding: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={S.label}>Flow Name *</label>
                        <input style={S.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Welcome Flow" />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={S.label}>Trigger Keyword</label>
                        <input style={S.input} value={triggerKeyword} onChange={e => setTriggerKeyword(e.target.value)} placeholder="e.g. buy, property" />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={S.label}>Description</label>
                        <input style={S.input} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" />
                    </div>
                    <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, background: '#E6F1FB', padding: '8px 12px', borderRadius: 8 }}>
                        <input type="checkbox" id="is_default" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} style={{ width: 16, height: 16 }} />
                        <label htmlFor="is_default" style={{ fontSize: 13, color: '#0C447C' }}>Set as default flow (runs for all new contacts)</label>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={S.label}>Flow Steps ({steps.length})</span>
                            <button onClick={addStep} style={S.btn(false, true)}><Plus size={12} /> Add Step</button>
                        </div>
                        {steps.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, border: '1px dashed #ddd', borderRadius: 12, color: '#aaa' }}>No steps yet. Click "Add Step" to start.</div>
                        ) : steps.map((step, idx) => {
                            const config = STEP_TYPE_CONFIG[step.step_type] || STEP_TYPE_CONFIG.message;
                            const Icon = config.icon;
                            const isExpanded = expanded === idx;
                            return (
                                <div key={step.id} style={{ border: '0.5px solid #e0e0e0', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                                    <button onClick={() => setExpanded(isExpanded ? null : idx)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#fafafa', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa', width: 24 }}>{idx + 1}</span>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon size={14} /></div>
                                        <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 500 }}>{config.label}</span>{step.message_text && <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>— {truncate(step.message_text, 40)}</span>}</div>
                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                    {isExpanded && (
                                        <div style={{ padding: 12, borderTop: '0.5px solid #eee', background: '#fff' }}>
                                            <div style={{ marginBottom: 12 }}>
                                                <label style={S.label}>Step Type</label>
                                                <select value={step.step_type} onChange={e => updateStep(idx, { step_type: e.target.value })} style={S.input}>
                                                    {Object.entries(STEP_TYPE_CONFIG).map(([type, cfg]) => <option key={type} value={type}>{cfg.label}</option>)}
                                                </select>
                                            </div>
                                            {["message", "question", "buttons", "end"].includes(step.step_type) && (
                                                <div style={{ marginBottom: 12 }}>
                                                    <label style={S.label}>Message Text</label>
                                                    <textarea rows={3} value={step.message_text || ""} onChange={e => updateStep(idx, { message_text: e.target.value })} style={{ ...S.input, resize: 'vertical' }} placeholder="Enter message..." />
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button onClick={() => removeStep(idx)} style={{ ...S.btn(false, true), color: '#D85A30' }}><Trash2 size={12} /> Remove</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 20px', borderTop: '0.5px solid #e8e8e8', background: '#fafafa' }}>
                    <button onClick={onClose} style={S.btn(false)}>Cancel</button>
                    <button onClick={handleSave} disabled={saving || !name.trim()} style={{ ...S.btn(true), opacity: (saving || !name.trim()) ? 0.6 : 1 }}>{saving ? "Saving..." : "Save Flow"}</button>
                </div>
            </div>
        </div>
    );
}

function ChatbotPage() {
    const [flows, setFlows] = useState(MOCK_FLOWS);
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingFlow, setEditingFlow] = useState(null);
    const [previewFlow, setPreviewFlow] = useState(null);

    const handleToggleActive = (flow) => setFlows(prev => prev.map(f => f.id === flow.id ? { ...f, is_active: !f.is_active } : f));
    const handleDelete = (id) => { if (!confirm("Delete this flow?")) return; setFlows(prev => prev.filter(f => f.id !== id)); };
    const handleEdit = (flow) => { setEditingFlow(flow); setShowBuilder(true); };
    const handleCreate = () => { setEditingFlow(null); setShowBuilder(true); };
    const handleSaved = (savedFlow) => {
        if (editingFlow) setFlows(prev => prev.map(f => f.id === savedFlow.id ? { ...f, ...savedFlow } : f));
        else setFlows(prev => [savedFlow, ...prev]);
        setShowBuilder(false); setEditingFlow(null);
        notificationStore.push("success", "Flow Saved", `"${savedFlow.name}" has been saved.`, () => { });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7f9', overflow: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 700 }}>Chatbot Flows</h1><p style={{ fontSize: 12, color: '#888' }}>Automate WhatsApp conversations</p></div>
                <button onClick={handleCreate} style={{ ...S.btn(true), gap: 6 }}><Plus size={16} /> New Flow</button>
            </div>

            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {flows.map(flow => (
                    <div key={flow.id} style={{ ...S.card, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div><h3 style={{ fontSize: 15, fontWeight: 600 }}>{flow.name}</h3>{flow.description && <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{flow.description}</p>}</div>
                            <Toggle on={flow.is_active} onChange={() => handleToggleActive(flow)} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                            <span style={{ fontSize: 10, background: flow.is_active ? '#EAF3DE' : '#f0f0f0', padding: '2px 8px', borderRadius: 12, color: flow.is_active ? '#27500A' : '#666' }}>{flow.is_active ? "Active" : "Inactive"}</span>
                            {flow.is_default && <span style={{ fontSize: 10, background: '#E6F1FB', color: '#0C447C', padding: '2px 8px', borderRadius: 12 }}>Default</span>}
                            {flow.trigger_keyword && <span style={{ fontSize: 10, background: '#FAEEDA', color: '#633806', padding: '2px 8px', borderRadius: 12 }}><Zap size={10} style={{ marginRight: 2 }} />{flow.trigger_keyword}</span>}
                            <span style={{ fontSize: 10, background: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: 12 }}>{flow.steps?.length || 0} steps</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setPreviewFlow(flow)} style={{ ...S.btn(false, true), flex: 1 }}><Eye size={12} /> Preview</button>
                            <button onClick={() => handleEdit(flow)} style={{ ...S.btn(false, true), flex: 1 }}><Edit2 size={12} /> Edit</button>
                            <button onClick={() => handleDelete(flow.id)} style={{ ...S.btn(false, true), color: '#D85A30', flex: 0 }}><Trash2 size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {showBuilder && <FlowBuilder flow={editingFlow} onClose={() => { setShowBuilder(false); setEditingFlow(null); }} onSave={handleSaved} />}
            {previewFlow && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#fff', borderRadius: 20, width: 480, maxWidth: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600 }}>{previewFlow.name}</h3>
                            <button onClick={() => setPreviewFlow(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: 20 }}>
                            {(previewFlow.steps || []).length === 0 ? <p style={{ color: '#aaa', textAlign: 'center' }}>No steps in this flow</p> : previewFlow.steps.map((step, idx) => {
                                const config = STEP_TYPE_CONFIG[step.step_type] || STEP_TYPE_CONFIG.message;
                                const Icon = config.icon;
                                return (
                                    <div key={step.id || idx} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon size={14} /></div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Step {idx + 1}: {config.label}</p>
                                            {step.message_text && <p style={{ fontSize: 13, color: '#444', background: '#f5f7f9', padding: 8, borderRadius: 8 }}>{step.message_text}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Settings Page (restyled) ────────────────────────────────────────────────
function SettingsPage() {
    const [activeTab, setActiveTab] = useState("api");
    const [saved, setSaved] = useState(false);
    const [waPhoneNumberId, setWaPhoneNumberId] = useState("716207418232909");
    const [waWabaId, setWaWabaId] = useState("1730918317820007");
    const [waAccessToken, setWaAccessToken] = useState("");
    const [waVerifyToken, setWaVerifyToken] = useState("whatsapp_verify_token");
    const [showAccessToken, setShowAccessToken] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [aiSystemPrompt, setAiSystemPrompt] = useState("You are a helpful assistant. Keep replies concise and professional.");
    const [welcomeMessage, setWelcomeMessage] = useState("Hi! Thank you for contacting us. How can we help you today?");
    const [outsideHoursMessage, setOutsideHoursMessage] = useState("We're currently closed. Our hours are 9AM-6PM.");
    const [hoursStart, setHoursStart] = useState("09:00");
    const [hoursEnd, setHoursEnd] = useState("18:00");
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
    const [users, setUsers] = useState(MOCK_USERS);

    const TABS = [
        { id: "api", label: "API Config", icon: Phone }, { id: "bot", label: "Bot & Auto-Reply", icon: Bot },
        { id: "hours", label: "Business Hours", icon: Clock }, { id: "team", label: "Team", icon: Users },
        { id: "webhook", label: "Webhook", icon: Shield },
    ];

    const handleSave = () => {
        setSaved(true);
        notificationStore.push("success", "Settings Saved", "Your configuration has been saved.", () => { });
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7f9', overflow: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h1 style={{ fontSize: 20, fontWeight: 700 }}>Settings & Config</h1><p style={{ fontSize: 12, color: '#888' }}>Configure your WhatsApp Business integration</p></div>
                {activeTab !== "team" && activeTab !== "webhook" && (
                    <button onClick={handleSave} style={{ ...S.btn(true), background: saved ? '#1D9E75' : '#185FA5' }}>{saved ? <CheckCircle size={14} /> : <Save size={14} />}{saved ? " Saved!" : " Save Changes"}</button>
                )}
            </div>

            <div style={{ display: 'flex', gap: 20, borderBottom: '0.5px solid #e8e8e8', background: '#fff', padding: '0 20px' }}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 0', fontSize: 13, fontWeight: 600, borderBottom: activeTab === tab.id ? '2px solid #185FA5' : '2px solid transparent', color: activeTab === tab.id ? '#185FA5' : '#888', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon size={14} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ padding: 20, maxWidth: 600 }}>
                {activeTab === "api" && (
                    <>
                        <div style={{ ...S.card, marginBottom: 20 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>WhatsApp Business API</h3>
                            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, background: '#EAF3DE', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#27500A' }}><Wifi size={14} /> Connected — Phone ID: ...{waPhoneNumberId.slice(-6)}</div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={S.label}>Phone Number ID *</label>
                                <input style={S.input} value={waPhoneNumberId} onChange={e => setWaPhoneNumberId(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={S.label}>WABA ID *</label>
                                <input style={S.input} value={waWabaId} onChange={e => setWaWabaId(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <label style={S.label}>Access Token *</label>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <input type={showAccessToken ? "text" : "password"} style={{ ...S.input, flex: 1 }} value={waAccessToken} onChange={e => setWaAccessToken(e.target.value)} />
                                    <button onClick={() => setShowAccessToken(v => !v)} style={S.btn(false)}>{showAccessToken ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                </div>
                            </div>
                            <div>
                                <label style={S.label}>Verify Token</label>
                                <input style={S.input} value={waVerifyToken} onChange={e => setWaVerifyToken(e.target.value)} />
                            </div>
                        </div>
                        <div style={S.card}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI Auto-Reply</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span>Enable AI Replies</span>
                                <Toggle on={aiEnabled} onChange={() => setAiEnabled(v => !v)} />
                            </div>
                            {aiEnabled && (
                                <div>
                                    <label style={S.label}>AI System Prompt</label>
                                    <textarea rows={4} style={S.input} value={aiSystemPrompt} onChange={e => setAiSystemPrompt(e.target.value)} />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === "bot" && (
                    <div style={S.card}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Auto-Reply Settings</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <span>Enable Auto-Reply</span>
                            <Toggle on={autoReplyEnabled} onChange={() => setAutoReplyEnabled(v => !v)} />
                        </div>
                        <div>
                            <label style={S.label}>Welcome Message</label>
                            <textarea rows={4} style={S.input} value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} />
                        </div>
                    </div>
                )}

                {activeTab === "hours" && (
                    <div style={S.card}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Business Hours</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div><label style={S.label}>Opens At</label><input type="time" style={S.input} value={hoursStart} onChange={e => setHoursStart(e.target.value)} /></div>
                            <div><label style={S.label}>Closes At</label><input type="time" style={S.input} value={hoursEnd} onChange={e => setHoursEnd(e.target.value)} /></div>
                        </div>
                        <div style={{ marginBottom: 16, background: '#f0f0f0', padding: 8, borderRadius: 8, fontSize: 13 }}>{hoursStart} — {hoursEnd} (local time)</div>
                        <div>
                            <label style={S.label}>Outside Hours Message</label>
                            <textarea rows={3} style={S.input} value={outsideHoursMessage} onChange={e => setOutsideHoursMessage(e.target.value)} />
                        </div>
                    </div>
                )}

                {activeTab === "team" && (
                    <div style={S.card}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Team Members</h3>
                        {users.map(u => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid #eee' }}>
                                <Avatar initials={getInitials(u.name)} size={36} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                                    <div style={{ fontSize: 11, color: '#888' }}>{u.email} · {u.role}</div>
                                </div>
                                <Toggle on={u.is_active} onChange={() => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x))} />
                            </div>
                        ))}
                        <button style={{ ...S.btn(false), width: '100%', marginTop: 12, justifyContent: 'center' }}><Plus size={12} /> Add Team Member</button>
                    </div>
                )}

                {activeTab === "webhook" && (
                    <div style={S.card}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Webhook Configuration</h3>
                        {[
                            ["Webhook URL", "https://your-project.supabase.co/functions/v1/whatsapp-webhook"],
                            ["Verify Token", waVerifyToken || "whatsapp_verify_token"],
                            ["API Version", "Graph API v19.0"]
                        ].map(([label, value]) => (
                            <div key={label} style={{ marginBottom: 12 }}>
                                <label style={S.label}>{label}</label>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <code style={{ flex: 1, background: '#f5f5f5', padding: '8px 12px', borderRadius: 8, fontSize: 12, wordBreak: 'break-all' }}>{value}</code>
                                    <button onClick={() => navigator.clipboard?.writeText(value)} style={S.btn(false)}><Copy size={14} /></button>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: 16, background: '#FAEEDA', padding: 12, borderRadius: 8, fontSize: 12, color: '#633806' }}>
                            <strong><Shield size={12} style={{ marginRight: 4 }} /> Required Edge Function Secrets</strong>
                            <ul style={{ marginTop: 8, marginLeft: 20 }}>
                                <li>WHATSAPP_ACCESS_TOKEN</li>
                                <li>WHATSAPP_PHONE_NUMBER_ID</li>
                                <li>WHATSAPP_VERIFY_TOKEN</li>
                                <li>OPENAI_API_KEY (if AI enabled)</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Leads CRM Pages (restyled) ──────────────────────────────────────────────
function LeadsPage({ filter }) {
    const [contacts, setContacts] = useState(MOCK_CONTACTS);
    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState("All");

    const filtered = contacts.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
        const matchStage = stageFilter === "All" || c.stage === stageFilter;
        const matchFilter = !filter || filter === "leads" || (filter === "buyers" && (c.property_type === "Apartment" || c.property_type === "Villa")) || (filter === "sellers" && c.tags?.some(t => t.name === "Seller")) || filter === "properties";
        return matchSearch && matchStage && matchFilter;
    });

    const stages = ["All", "New", "Contacted", "Qualified", "Site Visit", "Closed", "Lost"];
    const STAGE_COLORS_OBJ = {
        New: COLORS.blue, Contacted: COLORS.amber, Qualified: COLORS.green,
        "Site Visit": COLORS.coral, Closed: COLORS.teal, Lost: COLORS.coral,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7f9', overflow: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div><h1 style={{ fontSize: 20, fontWeight: 700 }}>{filter === "buyers" ? "Buyers" : filter === "sellers" ? "Sellers" : filter === "properties" ? "Properties" : "All Leads"}</h1><p style={{ fontSize: 12, color: '#888' }}>{filtered.length} contacts</p></div>
                    <button style={{ ...S.btn(true), gap: 6 }}><Plus size={16} /> Add Contact</button>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...S.input, paddingLeft: 30 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {stages.map(s => (
                            <button key={s} onClick={() => setStageFilter(s)} style={{ ...S.btn(stageFilter === s, true), fontSize: 11 }}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filtered.map(contact => (
                    <div key={contact.id} style={{ ...S.card, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <Avatar initials={getInitials(contact.name)} size={40} />
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 600 }}>{contact.name}</h3>
                                <p style={{ fontSize: 11, color: '#888' }}>{contact.phone}</p>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: (STAGE_COLORS_OBJ[contact.stage] || COLORS.blue).bg, color: (STAGE_COLORS_OBJ[contact.stage] || COLORS.blue).text }}>{contact.stage}</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: 12, fontSize: 12, color: '#555', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {contact.preferred_location && <div><MapPin size={12} style={{ marginRight: 6, color: '#aaa' }} />{contact.preferred_location}</div>}
                            {contact.budget_max > 0 && <div><DollarSign size={12} style={{ marginRight: 6, color: '#aaa' }} />{formatCurrency(contact.budget_min)} – {formatCurrency(contact.budget_max)}</div>}
                            {contact.property_type && <div><Building2 size={12} style={{ marginRight: 6, color: '#aaa' }} />{contact.property_type}</div>}
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                                {contact.tags.map(tag => <span key={tag.id} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 8, background: tag.color + '22', color: tag.color }}>{tag.name}</span>)}
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid #eee', paddingTop: 10 }}>
                            <span style={{ fontSize: 10, color: '#888' }}>Source: {contact.source}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button style={S.btn(false, true)}><MessageSquare size={12} /></button>
                                <button style={S.btn(false, true)}><Eye size={12} /></button>
                                <button style={{ ...S.btn(false, true), color: '#D85A30' }}><Trash2 size={12} /></button>
                            </div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>No contacts found</div>}
            </div>
        </div>
    );
}

// ─── Meta Spend Page (restyled) ──────────────────────────────────────────────
function MetaSpendPage() {
    const spendData = [
        { month: "Jan", spend: 12400, conversations: 1520, cpm: 8.16 },
        { month: "Feb", spend: 15800, conversations: 1890, cpm: 8.36 },
        { month: "Mar", spend: 18200, conversations: 2230, cpm: 8.16 },
        { month: "Apr", spend: 14600, conversations: 1780, cpm: 8.20 },
    ];
    const totalSpend = spendData.reduce((a, b) => a + b.spend, 0);
    const totalConvs = spendData.reduce((a, b) => a + b.conversations, 0);
    const maxSpend = Math.max(...spendData.map(d => d.spend));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f5f7f9', overflow: 'auto' }}>
            <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e8e8', padding: '16px 20px' }}>
                <h1 style={{ fontSize: 20, fontWeight: 700 }}>Meta Ad Spend</h1>
                <p style={{ fontSize: 12, color: '#888' }}>WhatsApp conversation costs from Meta</p>
            </div>

            <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    {[
                        { label: "Total Spend (2024)", value: `₹${(totalSpend / 1000).toFixed(1)}K`, color: COLORS.blue.text },
                        { label: "Total Conversations", value: totalConvs.toLocaleString(), color: COLORS.green.text },
                        { label: "Avg Cost / Conv", value: `₹${(totalSpend / totalConvs).toFixed(2)}`, color: COLORS.teal.text },
                    ].map(m => (
                        <div key={m.label} style={{ ...S.card, textAlign: 'center' }}>
                            <p style={{ fontSize: 11, color: '#888' }}>{m.label}</p>
                            <p style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</p>
                        </div>
                    ))}
                </div>

                <div style={S.card}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Monthly Spend Breakdown</h3>
                    {spendData.map(d => (
                        <div key={d.month} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13 }}>{d.month} 2024</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>₹{d.spend.toLocaleString()}</span>
                            </div>
                            <div style={{ background: '#f0f0f0', borderRadius: 10, height: 6, overflow: 'hidden' }}>
                                <div style={{ width: `${(d.spend / maxSpend) * 100}%`, height: '100%', background: '#185FA5', borderRadius: 10 }} />
                            </div>
                            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{d.conversations} conversations</div>
                        </div>
                    ))}
                </div>

                <div style={{ ...S.card, marginTop: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Cost per Category</h3>
                    {[
                        { cat: "Marketing Templates", cost: "₹0.68/conv", color: COLORS.coral },
                        { cat: "Utility Templates", cost: "₹0.35/conv", color: COLORS.blue },
                        { cat: "Authentication", cost: "₹0.35/conv", color: COLORS.green },
                    ].map(item => (
                        <div key={item.cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #eee' }}>
                            <span style={{ fontSize: 13 }}>{item.cat}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: item.color.text }}>{item.cost}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function WhatsAppCRM() {
    const [activePage, setActivePage] = useState("inbox");
    const [conversations] = useState(MOCK_CONVERSATIONS);
    const unreadCount = conversations.reduce((sum, c) => sum + (c.status !== "resolved" ? c.unread_count : 0), 0);
    const pendingTemplatesCount = MOCK_TEMPLATES.filter(t => t.status === "PENDING").length;

    const renderPage = () => {
        switch (activePage) {
            case "inbox": return <InboxPage />;
            case "leads": return <LeadsPage filter="leads" />;
            case "buyers": return <LeadsPage filter="buyers" />;
            case "sellers": return <LeadsPage filter="sellers" />;
            case "properties": return <LeadsPage filter="properties" />;
            case "templates": return <TemplatesPage />;
            case "campaigns": return <CampaignsPage />;
            case "analytics": return <AnalyticsPage />;
            case "chatbot": return <ChatbotPage />;
            case "settings": return <SettingsPage />;
            case "meta-spend": return <MetaSpendPage />;
            default: return <InboxPage />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f5', fontSize: 13, color: '#111', overflow: 'hidden' }}>
            <Sidebar activePage={activePage} onNavigate={setActivePage} unreadCount={unreadCount} pendingTemplatesCount={pendingTemplatesCount} />
            <main style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>{renderPage()}</main>
            <ToastContainer onNavigate={setActivePage} />
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.6s linear infinite; }
      `}</style>
        </div>
    );
}