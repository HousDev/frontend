
import { useState, useEffect } from 'react';
import {
    Save, Bot, Clock, MessageSquare, User,
    AlertCircle, CheckCircle, RefreshCw, Users, Zap,
    Eye, EyeOff, Wifi, WifiOff, Brain, Settings, Copy,
    Shield, Phone, Tag,
} from 'lucide-react';
import type { ChatbotFlow, CrmUser } from '../../types';
import { MOCK_FLOWS, MOCK_USERS, MOCK_TAGS } from '../../lib/mockData';
import { notificationStore } from '../../lib/notifications';

type Tab = 'api' | 'bot' | 'hours' | 'team' | 'webhook';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'api', label: 'API Config', icon: Phone },
    { id: 'bot', label: 'Bot & Auto-Reply', icon: Bot },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'webhook', label: 'Webhook', icon: Shield },
];

// Mock initial settings (stored in localStorage)
const DEFAULT_SETTINGS = {
    autoReply: {
        welcome_message: 'Hi! Thank you for contacting us. How can we help you today?',
        outside_hours_message: "We're currently closed. Our hours are 9AM-6PM. We'll get back to you soon!",
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        auto_reply_enabled: true,
        default_flow_id: '',
        default_assigned_to: '',
    },
    whatsapp: {
        phone_number_id: '716207418232909',
        waba_id: '1730918317820007',
        access_token: '',
        verify_token: 'whatsapp_verify_token',
        ai_enabled: false,
        ai_system_prompt: 'You are a helpful assistant. Keep replies concise and professional.',
    },
};

// Helper to load/save settings to localStorage
const loadSettings = () => {
    const saved = localStorage.getItem('whatsapp_crm_settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch { /* ignore */ }
    }
    return DEFAULT_SETTINGS;
};

const saveSettings = (settings: any) => {
    localStorage.setItem('whatsapp_crm_settings', JSON.stringify(settings));
};

// Helper to simulate async delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('api');
    const [flows, setFlows] = useState<ChatbotFlow[]>([]);
    const [users, setUsers] = useState<CrmUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [outsideHoursMessage, setOutsideHoursMessage] = useState('');
    const [hoursStart, setHoursStart] = useState('09:00');
    const [hoursEnd, setHoursEnd] = useState('18:00');
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
    const [defaultFlowId, setDefaultFlowId] = useState('');
    const [defaultAssignedTo, setDefaultAssignedTo] = useState('');
    const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
    const [waWabaId, setWaWabaId] = useState('');
    const [waAccessToken, setWaAccessToken] = useState('');
    const [waVerifyToken, setWaVerifyToken] = useState('whatsapp_verify_token');
    const [showAccessToken, setShowAccessToken] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [aiSystemPrompt, setAiSystemPrompt] = useState('You are a helpful assistant. Keep replies concise and professional.');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await delay(400); // simulate network

            // Load from localStorage or defaults
            const settings = loadSettings();

            // Auto-reply settings
            setWelcomeMessage(settings.autoReply.welcome_message);
            setOutsideHoursMessage(settings.autoReply.outside_hours_message);
            setHoursStart(settings.autoReply.business_hours_start);
            setHoursEnd(settings.autoReply.business_hours_end);
            setAutoReplyEnabled(settings.autoReply.auto_reply_enabled);
            setDefaultFlowId(settings.autoReply.default_flow_id);
            setDefaultAssignedTo(settings.autoReply.default_assigned_to);

            // WhatsApp settings
            setWaPhoneNumberId(settings.whatsapp.phone_number_id);
            setWaWabaId(settings.whatsapp.waba_id);
            setWaAccessToken(settings.whatsapp.access_token);
            setWaVerifyToken(settings.whatsapp.verify_token);
            setAiEnabled(settings.whatsapp.ai_enabled);
            setAiSystemPrompt(settings.whatsapp.ai_system_prompt);

            // Load flows and users from mock data
            setFlows(MOCK_FLOWS.filter(f => f.is_active));
            setUsers(MOCK_USERS.filter(u => u.is_active));

            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        await delay(500); // simulate API call

        try {
            const settings = {
                autoReply: {
                    welcome_message: welcomeMessage,
                    outside_hours_message: outsideHoursMessage || null,
                    business_hours_start: hoursStart,
                    business_hours_end: hoursEnd,
                    auto_reply_enabled: autoReplyEnabled,
                    default_flow_id: defaultFlowId || null,
                    default_assigned_to: defaultAssignedTo || null,
                },
                whatsapp: {
                    phone_number_id: waPhoneNumberId,
                    waba_id: waWabaId,
                    access_token: waAccessToken,
                    verify_token: waVerifyToken,
                    ai_enabled: aiEnabled,
                    ai_system_prompt: aiSystemPrompt,
                },
            };
            saveSettings(settings);
            setSaved(true);
            notificationStore.push('success', 'Settings Saved', 'Your configuration has been saved.', { label: "", page: "" });
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // For webhook tab, we need a placeholder URL (since no real edge function)
    const webhookUrl = `${window.location.origin}/api/whatsapp-webhook`;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header - Responsive */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
<div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                            <Settings size={15} className="text-emerald-600 sm:hidden" />
                            <Settings size={17} className="text-emerald-600 hidden sm:block" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-sm sm:text-base">Settings & Config</h1>
                            <p className="text-xs sm:text-xs text-gray-400 hidden sm:block">Configure your WhatsApp Business integration</p>
                        </div>
                    </div>
                    {activeTab !== 'team' && activeTab !== 'webhook' && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all shadow-sm ${
                                saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            } disabled:opacity-50`}
                        >
                            {saving ? <RefreshCw size={12} className="animate-spin sm:hidden" /> : saved ? <CheckCircle size={12} className="sm:hidden" /> : <Save size={12} className="sm:hidden" />}
                            {saving ? <RefreshCw size={14} className="animate-spin hidden sm:block" /> : saved ? <CheckCircle size={14} className="hidden sm:block" /> : <Save size={14} className="hidden sm:block" />}
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs - Horizontal Scroll on Mobile */}
            <div className="border-b border-gray-200 bg-white px-4 sm:px-6 shrink-0 overflow-x-auto custom-scrollbar-x">
                <div className="flex min-w-max sm:min-w-0">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <Icon size={13} className="sm:hidden" />
                                <Icon size={14} className="hidden sm:block" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm shrink-0">
                    <AlertCircle size={13} className="sm:hidden" />
                    <AlertCircle size={15} className="hidden sm:block" />
                    {error}
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1  max-h-[500px] sm:max-h-[600px] overflow-y-auto px-2 sm:px-3 py-2 sm:py-6 custom-scrollbar">
                <div className="max-w-7xl mx-auto lg:mx-0 space-y-4 sm:space-y-5">
                    {activeTab === 'api' && (
                        <>
                            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                                <SectionHeader icon={Wifi} title="WhatsApp Business API" subtitle="Meta Cloud API credentials — stored securely in your database" />
                                <div className="p-4 sm:p-5 space-y-4 sm:space-y-4">
                                    {waPhoneNumberId ? (
                                        <StatusBadge type="success" text={`Connected — Phone ID: ...${waPhoneNumberId.slice(-6)}`} />
                                    ) : (
                                        <StatusBadge type="warning" text="Not configured — enter your Meta API credentials below" />
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                                        <Field label="Phone Number ID" required>
                                            <input value={waPhoneNumberId} onChange={(e) => setWaPhoneNumberId(e.target.value)} placeholder="e.g. 716207418232909" className={inputCls} />
                                        </Field>
                                        <Field label="WABA ID" required>
                                            <input value={waWabaId} onChange={(e) => setWaWabaId(e.target.value)} placeholder="e.g. 1730918317820007" className={inputCls} />
                                        </Field>
                                    </div>
                                    <Field label="Access Token" required hint="Your permanent Meta API access token">
                                        <div className="relative">
                                            <input
                                                type={showAccessToken ? 'text' : 'password'}
                                                value={waAccessToken}
                                                onChange={(e) => setWaAccessToken(e.target.value)}
                                                placeholder="EAAxxxxx..."
                                                className={`${inputCls} pr-8 sm:pr-10`}
                                            />
                                            <button
                                                onClick={() => setShowAccessToken((v) => !v)}
                                                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showAccessToken ? <EyeOff size={13} className="sm:hidden" /> : <Eye size={13} className="sm:hidden" />}
                                                {showAccessToken ? <EyeOff size={15} className="hidden sm:block" /> : <Eye size={15} className="hidden sm:block" />}
                                            </button>
                                        </div>
                                    </Field>
                                    <Field label="Verify Token" hint="Must match the Verify Token set in Meta App Dashboard">
                                        <input value={waVerifyToken} onChange={(e) => setWaVerifyToken(e.target.value)} className={inputCls} />
                                    </Field>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                                <SectionHeader icon={Brain} title="AI Auto-Reply" subtitle="Automatically generate smart replies using AI" />
                                <div className="p-4 sm:p-5 space-y-4 sm:space-y-4">
                                    <Toggle
                                        label="Enable AI Replies"
                                        desc="AI will generate contextual replies for incoming messages"
                                        value={aiEnabled}
                                        onChange={setAiEnabled}
                                    />
                                    {aiEnabled && (
                                        <Field label="AI System Prompt" hint="Instructions for how the AI should respond to customers">
                                            <textarea
                                                value={aiSystemPrompt}
                                                onChange={(e) => setAiSystemPrompt(e.target.value)}
                                                rows={4}
                                                className={`${inputCls} resize-none`}
                                            />
                                        </Field>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'bot' && (
                        <>
                            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                                <SectionHeader icon={Bot} title="Auto-Reply Settings" subtitle="Control when and how the bot responds to messages" />
                                <div className="p-4 sm:p-5 space-y-4 sm:space-y-4">
                                    <Toggle
                                        label="Enable Auto-Reply"
                                        desc="Bot will automatically respond to all incoming messages"
                                        value={autoReplyEnabled}
                                        onChange={setAutoReplyEnabled}
                                    />
                                    <Field label="Welcome Message" hint="Sent automatically to every new contact on their first message">
                                        <textarea
                                            value={welcomeMessage}
                                            onChange={(e) => setWelcomeMessage(e.target.value)}
                                            rows={4}
                                            className={`${inputCls} resize-none`}
                                            placeholder="Hi! Thank you for contacting us. How can we help you today?"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                                <SectionHeader icon={Zap} title="Default Flow" subtitle="Automation flow triggered for new contacts" />
                                <div className="p-4 sm:p-5 space-y-4 sm:space-y-4">
                                    <Field label="Default Chatbot Flow" hint="This flow will automatically start for new contacts after the welcome message">
                                        <select value={defaultFlowId} onChange={(e) => setDefaultFlowId(e.target.value)} className={`${inputCls} bg-white`}>
                                            <option value="">No default flow (manual handling)</option>
                                            {flows.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                        {flows.length === 0 && (
                                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                                <AlertCircle size={11} /> No active flows. Create flows in the Chatbot section first.
                                            </p>
                                        )}
                                    </Field>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                                <SectionHeader icon={User} title="Default Assignment" subtitle="Who handles new conversations automatically" />
                                <div className="p-4 sm:p-5">
                                    <Field label="Assign New Contacts To" hint="New contacts will be automatically assigned to this team member">
                                        <select value={defaultAssignedTo} onChange={(e) => setDefaultAssignedTo(e.target.value)} className={`${inputCls} bg-white`}>
                                            <option value="">Unassigned (manual assignment)</option>
                                            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'hours' && (
                        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                            <SectionHeader icon={Clock} title="Business Hours" subtitle="Outside these hours, send the off-hours message instead" />
                            <div className="p-4 sm:p-5 space-y-4 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                                    <Field label="Opens At">
                                        <input type="time" value={hoursStart} onChange={(e) => setHoursStart(e.target.value)} className={inputCls} />
                                    </Field>
                                    <Field label="Closes At">
                                        <input type="time" value={hoursEnd} onChange={(e) => setHoursEnd(e.target.value)} className={inputCls} />
                                    </Field>
                                </div>
                                <div className="p-3 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Current Schedule</p>
                                    <p className="text-sm text-gray-600">
                                        {hoursStart} — {hoursEnd} (local time)
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">Outside these hours, the message below will be sent</p>
                                </div>
                                <Field label="Outside Hours Message" hint="Leave blank to disable off-hours auto-reply">
                                    <textarea
                                        value={outsideHoursMessage}
                                        onChange={(e) => setOutsideHoursMessage(e.target.value)}
                                        rows={3}
                                        className={`${inputCls} resize-none`}
                                        placeholder="We're currently closed. Our hours are 9AM-6PM. We'll get back to you soon!"
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                            <SectionHeader icon={Users} title="Team Members" subtitle="Manage CRM users and their roles" />
                            <div className="p-4 sm:p-5">
                                <TeamMembersSection />
                            </div>
                        </div>
                    )}

                    {activeTab === 'webhook' && (
                        <>
                            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                                <SectionHeader icon={MessageSquare} title="Webhook Configuration" subtitle="Connect Meta WhatsApp Business API to your CRM" />
                                <div className="p-4 sm:p-5 space-y-4 sm:space-y-4">
                                    <CopyRow label="Webhook URL" value={webhookUrl} />
                                    <CopyRow label="Verify Token" value={waVerifyToken || 'whatsapp_verify_token'} />
                                    <CopyRow label="API Version" value="Graph API v19.0" />

                                    <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl space-y-2">
                                        <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                            <Shield size={13} /> Required Edge Function Secrets
                                        </p>
                                        <p className="text-xs text-amber-700">Set these in your Supabase Dashboard → Edge Functions → Secrets:</p>
                                        <div className="space-y-1.5">
                                            {[
                                                ['WHATSAPP_ACCESS_TOKEN', 'Your Meta permanent access token'],
                                                ['WHATSAPP_PHONE_NUMBER_ID', 'WhatsApp Business phone number ID'],
                                                ['WHATSAPP_VERIFY_TOKEN', 'Webhook verify token (any string)'],
                                                ['OPENAI_API_KEY', 'Required if AI auto-reply is enabled'],
                                            ].map(([key, desc]) => (
                                                <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                                    <code className="text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono break-all">{key}</code>
                                                    <span className="text-xs text-amber-700">{desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl space-y-2">
                                        <p className="text-xs font-bold text-blue-800">Meta App Dashboard Setup</p>
                                        <div className="space-y-1">
                                            {[
                                                'Go to Meta for Developers → Your App → WhatsApp → Configuration',
                                                'Set Callback URL to the Webhook URL above',
                                                'Set Verify Token to match your token above',
                                                'Subscribe to: messages, message_deliveries, message_reads',
                                                'Save and verify the webhook',
                                            ].map((step, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs text-blue-700">
                                                    <span className="shrink-0 w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center text-[9px] font-bold text-blue-700 mt-0.5">{i + 1}</span>
                                                    <span className="flex-1">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-2xl overflow-hidden">
                                <SectionHeader icon={Tag} title="Tags Configuration" subtitle="Tags are used to categorize and filter contacts" />
                                <div className="p-4 sm:p-5">
                                    <TagsSection />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                
                .custom-scrollbar-x::-webkit-scrollbar {
                    height: 3px;
                }
                
                .custom-scrollbar-x::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                
                .custom-scrollbar-x::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 10px;
                }
                
                /* For Firefox */
                .custom-scrollbar, .custom-scrollbar-x {
                    scrollbar-width: thin;
                    scrollbar-color: #c1c1c1 #f1f1f1;
                }
            `}</style>
        </div>
    );
}

// ---- Helper Components (with responsive adjustments) ----

const inputCls = 'w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all';

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={13} className="text-gray-600 sm:hidden" />
                <Icon size={14} className="text-gray-600 hidden sm:block" />
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
        </div>
    );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
            <div>
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'}`} />
            </button>
        </div>
    );
}

function StatusBadge({ type, text }: { type: 'success' | 'warning'; text: string }) {
    return (
        <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-xs font-medium ${
            type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
            {type === 'success' ? <Wifi size={13} className="sm:hidden" /> : <WifiOff size={13} className="sm:hidden" />}
            {type === 'success' ? <Wifi size={14} className="hidden sm:block" /> : <WifiOff size={14} className="hidden sm:block" />}
            {text}
        </div>
    );
}

function CopyRow({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 text-xs bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg sm:rounded-xl text-gray-700 break-all">{value}</code>
                <button
                    onClick={handleCopy}
                    className="shrink-0 flex items-center justify-center gap-1 text-xs font-medium px-3 py-2 rounded-lg sm:rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                    {copied ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} className="text-gray-400" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>
    );
}

// TeamMembersSection – now using localStorage for persistence
function TeamMembersSection() {
    const [users, setUsers] = useState<CrmUser[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'sales' | 'pre_sales'>('sales');
    const [adding, setAdding] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Load users from localStorage (or use mock data)
    useEffect(() => {
        const load = async () => {
            await delay(300);
            const stored = localStorage.getItem('whatsapp_crm_users');
            if (stored) {
                try {
                    setUsers(JSON.parse(stored));
                } catch { setUsers(MOCK_USERS); }
            } else {
                setUsers(MOCK_USERS);
            }
            setLoadingUsers(false);
        };
        load();
    }, []);

    // Save users to localStorage whenever they change
    useEffect(() => {
        if (!loadingUsers) {
            localStorage.setItem('whatsapp_crm_users', JSON.stringify(users));
        }
    }, [users, loadingUsers]);

    const handleAdd = async () => {
        if (!newName.trim() || !newEmail.trim()) return;
        setAdding(true);
        await delay(400);
        const newUser: any = {
            id: `u${Date.now()}`,
            name: newName.trim(),
            email: newEmail.trim(),
            role: newRole,
            is_active: true,
        };
        setUsers(prev => [newUser, ...prev]);
        setNewName(''); setNewEmail(''); setShowAdd(false);
        setAdding(false);
        notificationStore.push('success', 'Team Member Added', `${newUser.name} has been added.`, { label: "", page: "" });
    };

    const handleToggleActive = async (user: CrmUser) => {
        await delay(200);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    };

    const roleStyle: Record<string, string> = {
        admin: 'bg-red-50 text-red-700 border-red-100',
        sales: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        pre_sales: 'bg-blue-50 text-blue-700 border-blue-100',
    };

    if (loadingUsers) {
        return <div className="flex items-center justify-center py-6 sm:py-8"><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-3">
            {users.length === 0 && !showAdd && (
                <p className="text-sm text-gray-400 text-center py-4">No team members yet</p>
            )}
            {users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-gray-900 truncate">{u.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${roleStyle[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                {u.role.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <button
                        onClick={() => handleToggleActive(u)}
                        className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            u.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                </div>
            ))}

            {showAdd ? (
                <div className="p-4 bg-white border-2 border-emerald-200 rounded-lg sm:rounded-xl space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Add Team Member</p>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" className={inputCls} />
                    <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email address" type="email" className={inputCls} />
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'admin' | 'sales' | 'pre_sales')} className={`${inputCls} bg-white`}>
                        <option value="sales">Sales</option>
                        <option value="pre_sales">Pre-Sales</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div className="flex gap-2">
                        <button onClick={handleAdd} disabled={adding || !newName.trim() || !newEmail.trim()} className="flex-1 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                            {adding ? 'Adding...' : 'Add Member'}
                        </button>
                        <button onClick={() => setShowAdd(false)} className="flex-1 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowAdd(true)} className="w-full py-3 border-2 border-dashed border-gray-200 text-sm text-gray-400 rounded-lg sm:rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all">
                    + Add Team Member
                </button>
            )}
        </div>
    );
}

// TagsSection – using mock data from MOCK_TAGS
function TagsSection() {
    const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            await delay(200);
            setTags(MOCK_TAGS);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center py-4"><div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div>
            <p className="text-xs text-gray-400 mb-3">These tags are available for categorizing contacts. Create new tags from the Inbox contact panel.</p>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag.id}
                        className="text-xs px-3 py-1.5 rounded-full font-medium border"
                        style={{ backgroundColor: tag.color + '18', color: tag.color, borderColor: tag.color + '40' }}
                    >
                        {tag.name}
                    </span>
                ))}
            </div>
        </div>
    );
}