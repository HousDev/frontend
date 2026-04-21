import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Lightbulb, Eye, CreditCard as Edit3, Smartphone, Image, FileText as FileDoc, Video, Type, Home, Users, Search } from 'lucide-react';
import type { Template, TemplateCategory, TemplateHeaderType } from '../../types';

interface Props {
    template: Template | null;
    onSubmit: (data: Partial<Template>) => Promise<void>;
    onClose: () => void;
}

const CATEGORIES: { value: TemplateCategory; label: string; desc: string; color: string }[] = [
    { value: 'MARKETING', label: 'Marketing', desc: 'Promotions & offers', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'UTILITY', label: 'Utility', desc: 'Updates & alerts', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'AUTHENTICATION', label: 'Auth', desc: 'OTPs & verification', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'te', label: 'Telugu' },
    { value: 'ta', label: 'Tamil' },
];

const HEADER_TYPES: { value: TemplateHeaderType | ''; label: string; icon: React.ElementType }[] = [
    { value: '', label: 'None', icon: X },
    { value: 'TEXT', label: 'Text', icon: Type },
    { value: 'IMAGE', label: 'Image', icon: Image },
    { value: 'DOCUMENT', label: 'Document', icon: FileDoc },
    { value: 'VIDEO', label: 'Video', icon: Video },
];

type SuggestionGroup = 'buyer' | 'seller' | 'general' | 'marketing';

const SUGGESTIONS: {
    label: string; group: SuggestionGroup; category: TemplateCategory;
    name: string; headerType: TemplateHeaderType | ''; header: string; body: string; footer: string;
    buttons: { type: 'QUICK_REPLY' | 'URL'; text: string; url?: string }[];
}[] = [
        {
            label: 'Buyer Welcome', group: 'buyer', category: 'UTILITY', name: 'buyer_welcome',
            headerType: 'TEXT', header: 'Welcome, Property Seeker!',
            body: 'Hi {{1}},\n\nThank you for your interest in buying a property with us!\n\nWe have hundreds of verified properties across {{2}} matching your needs.\n\nOur expert team is ready to help you find your dream home.',
            footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'View Properties' }, { type: 'QUICK_REPLY', text: 'Talk to Agent' }],
        },
        {
            label: 'Buyer Budget Qualify', group: 'buyer', category: 'UTILITY', name: 'buyer_budget_qualify',
            headerType: '', header: '',
            body: 'Hi {{1}},\n\nTo help you find the perfect property, we need a few details:\n\n📍 *Preferred Location:* {{2}}\n💰 *Budget Range:* {{3}}\n🏠 *Property Type:* {{4}}\n\nBased on this, we\'ll shortlist the best options for you!',
            footer: 'Our team will call you within 24 hrs', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, proceed' }, { type: 'QUICK_REPLY', text: 'Change details' }],
        },
        {
            label: 'Property Shortlist', group: 'buyer', category: 'MARKETING', name: 'property_shortlist',
            headerType: 'IMAGE', header: '',
            body: 'Hi {{1}},\n\nWe\'ve shortlisted *{{2}} properties* based on your requirements!\n\n🏠 *Area:* {{3}}\n💰 *Budget:* {{4}}\n\n*Top Pick:* {{5}}\n📍 {{6}}\n\nWould you like to schedule a site visit?',
            footer: 'T&C apply', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, Book Visit' }, { type: 'QUICK_REPLY', text: 'More Options' }, { type: 'URL', text: 'View All', url: 'https://example.com' }],
        },
        {
            label: 'Site Visit Confirmation', group: 'buyer', category: 'UTILITY', name: 'site_visit_confirmation',
            headerType: 'TEXT', header: 'Site Visit Confirmed!',
            body: 'Hi {{1}},\n\nYour site visit has been confirmed!\n\n🏠 *Property:* {{2}}\n📍 *Location:* {{3}}\n📅 *Date:* {{4}}\n⏰ *Time:* {{5}}\n\n👤 *Agent:* {{6}} — {{7}}\n\nPlease carry a valid ID proof.',
            footer: 'Reply CANCEL to cancel', buttons: [{ type: 'QUICK_REPLY', text: 'Confirm' }, { type: 'QUICK_REPLY', text: 'Reschedule' }],
        },
        {
            label: 'Seller Welcome', group: 'seller', category: 'UTILITY', name: 'seller_welcome',
            headerType: 'TEXT', header: 'Sell Your Property Fast!',
            body: 'Hi {{1}},\n\nThank you for choosing us to sell your property!\n\nWe have *10,000+ verified buyers* actively looking in {{2}}.\n\nOur team will help you:\n✅ Get the best price\n✅ Handle all documentation\n✅ Close deal in 30 days',
            footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'List My Property' }, { type: 'QUICK_REPLY', text: 'Know More' }],
        },
        {
            label: 'Seller Property Details', group: 'seller', category: 'UTILITY', name: 'seller_property_details',
            headerType: '', header: '',
            body: 'Hi {{1}},\n\nTo list your property, we need these details:\n\n🏠 *Property Type:* {{2}}\n📍 *Location:* {{3}}\n📐 *Size:* {{4}} sq ft\n💰 *Expected Price:* ₹{{5}}\n\nWould you like to proceed with listing?',
            footer: 'Free listing, no hidden charges', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, List it!' }, { type: 'QUICK_REPLY', text: 'Need more info' }],
        },
        {
            label: 'Seller Valuation Report', group: 'seller', category: 'UTILITY', name: 'seller_valuation',
            headerType: 'DOCUMENT', header: '',
            body: 'Hi {{1}},\n\nYour *Free Property Valuation Report* is ready!\n\n🏠 *Property:* {{2}}, {{3}}\n💰 *Estimated Market Value:* ₹{{4}} – ₹{{5}}\n📈 *Area Price Trend:* {{6}}\n\nOur expert can help you maximize your selling price.',
            footer: 'Valid for 30 days', buttons: [{ type: 'QUICK_REPLY', text: 'Talk to Expert' }, { type: 'QUICK_REPLY', text: 'List Now' }],
        },
        {
            label: 'Seller Buyer Interest', group: 'seller', category: 'MARKETING', name: 'seller_buyer_interest',
            headerType: 'TEXT', header: 'A Buyer is Interested!',
            body: 'Hi {{1}},\n\nGreat news! A serious buyer is interested in your property at *{{2}}*.\n\n💰 *Buyer\'s Offer:* ₹{{3}}\n👤 *Buyer Profile:* {{4}}\n\nWould you like us to arrange a meeting?',
            footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, arrange meeting' }, { type: 'QUICK_REPLY', text: 'Counter offer' }, { type: 'QUICK_REPLY', text: 'Not interested' }],
        },
        {
            label: 'Follow Up (Buyer)', group: 'buyer', category: 'MARKETING', name: 'followup_buyer',
            headerType: '', header: '',
            body: 'Hi {{1}},\n\nJust checking in! You were looking for a *{{2}} BHK in {{3}}* in your budget of *₹{{4}}*.\n\nWe have some new options that match your criteria perfectly. Would you like to see them?',
            footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'Show new options' }, { type: 'QUICK_REPLY', text: 'Not now' }],
        },
        {
            label: 'New Property Launch', group: 'marketing', category: 'MARKETING', name: 'new_property_launch',
            headerType: 'IMAGE', header: '',
            body: '🎉 *Exclusive Launch Alert!*\n\nHi {{1}},\n\nWe\'re excited to announce the launch of *{{2}}* in {{3}}!\n\n🏗️ *{{4}} BHK* flats starting from *₹{{5}}*\n📅 *Pre-launch offer ends:* {{6}}\n\n💎 Early bird discount: {{7}}%',
            footer: 'Limited units available', buttons: [{ type: 'URL', text: 'Book Now', url: 'https://example.com' }, { type: 'QUICK_REPLY', text: 'Know More' }],
        },
        {
            label: 'Loan Assistance', group: 'general', category: 'UTILITY', name: 'loan_assistance',
            headerType: 'TEXT', header: 'Home Loan Made Easy',
            body: 'Hi {{1}},\n\nWe noticed you\'re interested in a property worth *₹{{2}}*.\n\nHere\'s your loan eligibility estimate:\n\n💰 *Loan Amount:* Up to ₹{{3}}\n📊 *EMI Starting:* ₹{{4}}/month\n✅ *Approval in:* 48 hours\n\nWe work with 15+ banks for the best rates.',
            footer: '', buttons: [{ type: 'QUICK_REPLY', text: 'Check Eligibility' }, { type: 'QUICK_REPLY', text: 'Talk to Expert' }],
        },
        {
            label: 'OTP Verification', group: 'general', category: 'AUTHENTICATION', name: 'otp_verification',
            headerType: '', header: '',
            body: '{{1}} is your verification code for {{2}}.\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.',
            footer: "If you didn't request this, ignore.", buttons: [],
        },
    ];

const GROUP_LABELS: Record<SuggestionGroup, string> = {
    buyer: 'Buyer', seller: 'Seller', general: 'General', marketing: 'Marketing',
};
const GROUP_COLORS: Record<SuggestionGroup, string> = {
    buyer: 'bg-blue-50 text-blue-700', seller: 'bg-emerald-50 text-emerald-700',
    general: 'bg-gray-100 text-gray-600', marketing: 'bg-orange-50 text-orange-700',
};
const GROUP_ICONS: Record<SuggestionGroup, React.ElementType> = {
    buyer: Home, seller: Users, general: FileDoc, marketing: Image,
};

type FormState = {
    name: string; category: TemplateCategory; language: string;
    header_type: TemplateHeaderType | ''; header_text: string; header_media_url: string;
    body: string; footer: string;
    buttons: { type: 'QUICK_REPLY' | 'URL'; text: string; url?: string }[];
};

const emptyForm: FormState = {
    name: '', category: 'MARKETING', language: 'en',
    header_type: '', header_text: '', header_media_url: '',
    body: '', footer: '', buttons: [],
};

export default function TemplateForm({ template, onSubmit, onClose }: Props) {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'explore'>('explore');
    const [suggestionFilter, setSuggestionFilter] = useState<SuggestionGroup | 'all'>('all');
    const [suggestionSearch, setSuggestionSearch] = useState('');

    useEffect(() => {
        if (template) {
            setForm({
                name: template.name, category: template.category, language: template.language,
                header_type: template.header_type || '', header_text: template.header_text || '',
                header_media_url: '',
                body: template.body, footer: template.footer || '',
                buttons: template.buttons?.map((b) => ({ type: b.type as 'QUICK_REPLY' | 'URL', text: b.text, url: b.url })) || [],
            });
            setActiveTab('edit');
        }
    }, [template]);

    const applySuggestion = (s: typeof SUGGESTIONS[0]) => {
        setForm((p) => ({
            ...p, name: s.name, category: s.category,
            header_type: s.headerType, header_text: s.header, header_media_url: '',
            body: s.body, footer: s.footer, buttons: s.buttons,
        }));
        setActiveTab('edit');
    };

    const addButton = () => {
        if (form.buttons.length >= 3) return;
        setForm((p) => ({ ...p, buttons: [...p.buttons, { type: 'QUICK_REPLY', text: '' }] }));
    };

    const removeButton = (i: number) => setForm((p) => ({ ...p, buttons: p.buttons.filter((_, idx) => idx !== i) }));

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.body.trim()) return;
        setSaving(true);
        await onSubmit({
            name: form.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            category: form.category, language: form.language,
            header_type: form.header_type || null,
            header_text: form.header_type === 'TEXT' ? (form.header_text || null) : null,
            body: form.body, footer: form.footer || null,
            buttons: form.buttons.length > 0 ? form.buttons : null,
            status: 'PENDING',
        });
        setSaving(false);
    };

    const variableCount = (form.body.match(/\{\{(\d+)\}\}/g) || []).length;
    const cat = CATEGORIES.find((c) => c.value === form.category);

    const filteredSuggestions = SUGGESTIONS.filter((s) => {
        const matchesGroup = suggestionFilter === 'all' || s.group === suggestionFilter;
        const matchesSearch = !suggestionSearch || s.label.toLowerCase().includes(suggestionSearch.toLowerCase()) || s.body.toLowerCase().includes(suggestionSearch.toLowerCase());
        return matchesGroup && matchesSearch;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">{template ? 'Edit Template' : 'New Template'}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">WhatsApp Business Message Template</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 px-6 shrink-0 bg-gray-50/50">
                    {(['explore', 'edit', 'preview'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab === 'explore' && <Lightbulb size={13} />}
                            {tab === 'edit' && <Edit3 size={13} />}
                            {tab === 'preview' && <Smartphone size={13} />}
                            {tab === 'explore' ? 'Explore Library' : tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-1 min-h-0">
                    {activeTab === 'explore' && (
                        <div className="flex flex-1 min-h-0 overflow-hidden">
                            <div className="w-44 border-r border-gray-100 p-3 shrink-0 bg-gray-50/50 flex flex-col gap-1 overflow-y-auto">
                                <button
                                    onClick={() => setSuggestionFilter('all')}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${suggestionFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    All Templates
                                </button>
                                {(Object.keys(GROUP_LABELS) as SuggestionGroup[]).map((g) => {
                                    const Icon = GROUP_ICONS[g];
                                    return (
                                        <button
                                            key={g}
                                            onClick={() => setSuggestionFilter(g)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${suggestionFilter === g ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <Icon size={14} className="shrink-0" />
                                            {GROUP_LABELS[g]}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 shrink-0">
                                    <div className="relative">
                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            value={suggestionSearch}
                                            onChange={(e) => setSuggestionSearch(e.target.value)}
                                            placeholder="Search templates..."
                                            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {filteredSuggestions.map((s) => {
                                            const HeaderIcon = HEADER_TYPES.find((h) => h.value === s.headerType)?.icon || Type;
                                            return (
                                                <div key={s.name} className="border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all group bg-white">
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${GROUP_COLORS[s.group]}`}>
                                                                    {GROUP_LABELS[s.group]}
                                                                </span>
                                                                {s.headerType && s.headerType !== 'TEXT' && (
                                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                                        <HeaderIcon size={10} />
                                                                        {s.headerType}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${s.category === 'MARKETING' ? 'bg-orange-50 text-orange-600' :
                                                                    s.category === 'UTILITY' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                                                }`}>{s.category}</span>
                                                        </div>
                                                        <p className="font-semibold text-gray-900 text-sm mb-1.5">{s.label}</p>
                                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 whitespace-pre-line">{s.body.replace(/\{\{(\d+)\}\}/g, (_, n) => `[var${n}]')`)}</p>
                                                        {s.buttons.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {s.buttons.map((b, i) => (
                                                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">{b.text}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/50 flex items-center justify-between">
                                                        <span className="text-[10px] text-gray-400 font-mono">{s.name}</span>
                                                        <button
                                                            onClick={() => applySuggestion(s)}
                                                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white px-3 py-1 rounded-lg transition-all"
                                                        >
                                                            Use Template
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredSuggestions.length === 0 && (
                                            <div className="col-span-2 text-center py-10 text-gray-400">
                                                <Lightbulb size={24} className="mx-auto mb-2 opacity-30" />
                                                <p className="text-sm">No templates found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'edit' && (
                        <div className="flex flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Template Name *</label>
                                    <input
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. buyer_welcome"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Lowercase letters, numbers and underscores only</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Category *</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {CATEGORIES.map((c) => (
                                            <button key={c.value} onClick={() => setForm((p) => ({ ...p, category: c.value }))}
                                                className={`p-3 rounded-xl border-2 text-left transition-all ${form.category === c.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <p className="text-xs font-semibold text-gray-800">{c.label}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Language *</label>
                                        <select value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                                            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Header Type</label>
                                        <div className="grid grid-cols-5 gap-1">
                                            {HEADER_TYPES.map((h) => {
                                                const Icon = h.icon;
                                                return (
                                                    <button
                                                        key={h.value}
                                                        onClick={() => setForm((p) => ({ ...p, header_type: h.value, header_text: '', header_media_url: '' }))}
                                                        className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[10px] font-medium transition-all ${form.header_type === h.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <Icon size={13} />
                                                        {h.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {form.header_type === 'TEXT' && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1.5">Header Text</label>
                                        <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={form.header_text} onChange={(e) => setForm((p) => ({ ...p, header_text: e.target.value }))}
                                            placeholder="Enter header text (max 60 chars)" maxLength={60} />
                                    </div>
                                )}

                                {(form.header_type === 'IMAGE' || form.header_type === 'VIDEO' || form.header_type === 'DOCUMENT') && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                                            {form.header_type === 'IMAGE' ? 'Image URL' : form.header_type === 'VIDEO' ? 'Video URL' : 'Document URL'}
                                        </label>
                                        <input
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={form.header_media_url}
                                            onChange={(e) => setForm((p) => ({ ...p, header_media_url: e.target.value }))}
                                            placeholder={
                                                form.header_type === 'IMAGE' ? 'https://example.com/image.jpg' :
                                                    form.header_type === 'VIDEO' ? 'https://example.com/video.mp4' :
                                                        'https://example.com/document.pdf'
                                            }
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {form.header_type === 'IMAGE' && 'JPG, PNG or WEBP (max 5MB). Must be a public URL.'}
                                            {form.header_type === 'VIDEO' && 'MP4 format (max 16MB). Must be a public URL.'}
                                            {form.header_type === 'DOCUMENT' && 'PDF format (max 100MB). Must be a public URL.'}
                                        </p>
                                        {form.header_type === 'IMAGE' && form.header_media_url && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 max-h-32">
                                                <img
                                                    src={form.header_media_url}
                                                    alt="preview"
                                                    className="w-full h-32 object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Message Body *</label>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <span>{form.body.length}/1024</span>
                                            {variableCount > 0 && (
                                                <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">{variableCount} var{variableCount !== 1 ? 's' : ''}</span>
                                            )}
                                        </div>
                                    </div>
                                    <textarea rows={6} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                                        placeholder="Hello {{1}}, we have a property for you in {{2}}." maxLength={1024} />
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <p className="text-[10px] text-gray-400 flex-1">Use {'{{1}}'}, {'{{2}}'} for dynamic variables</p>
                                        <div className="flex gap-1">
                                            {['{{1}}', '{{2}}', '{{3}}', '{{4}}'].map((v) => (
                                                <button key={v} onClick={() => setForm((p) => ({ ...p, body: p.body + v }))}
                                                    className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-mono">{v}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Footer <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={form.footer} onChange={(e) => setForm((p) => ({ ...p, footer: e.target.value }))}
                                        placeholder="e.g. Reply STOP to unsubscribe" maxLength={60} />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Buttons <span className="text-gray-400 font-normal">(max 3)</span></label>
                                            <p className="text-[10px] text-gray-400">Add quick reply or URL buttons</p>
                                        </div>
                                        <button onClick={addButton} disabled={form.buttons.length >= 3}
                                            className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-40 transition-colors">
                                            <Plus size={12} /> Add Button
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {form.buttons.map((btn, i) => (
                                            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <select value={btn.type}
                                                    onChange={(e) => setForm((p) => ({ ...p, buttons: p.buttons.map((b, idx) => idx === i ? { ...b, type: e.target.value as 'QUICK_REPLY' | 'URL' } : b) }))}
                                                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                                    <option value="QUICK_REPLY">Quick Reply</option>
                                                    <option value="URL">URL Link</option>
                                                </select>
                                                <input placeholder="Button label" value={btn.text} maxLength={25}
                                                    onChange={(e) => setForm((p) => ({ ...p, buttons: p.buttons.map((b, idx) => idx === i ? { ...b, text: e.target.value } : b) }))}
                                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                {btn.type === 'URL' && (
                                                    <input placeholder="https://example.com" value={btn.url || ''}
                                                        onChange={(e) => setForm((p) => ({ ...p, buttons: p.buttons.map((b, idx) => idx === i ? { ...b, url: e.target.value } : b) }))}
                                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                )}
                                                <button onClick={() => removeButton(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                        {form.buttons.length === 0 && <p className="text-xs text-gray-400 text-center py-3">No buttons added</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="w-64 border-l border-gray-100 p-4 shrink-0 bg-gray-50/30 overflow-y-auto hidden xl:flex xl:flex-col">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <Smartphone size={10} /> Live Preview
                                </p>
                                <PhonePreview form={form} cat={cat} compact />
                            </div>
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center">
                            <div className="w-full max-w-xs">
                                <PhonePreview form={form} cat={cat} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        {cat && <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cat.color}`}>{cat.label}</span>}
                        <span className="text-xs text-gray-400">{LANGUAGES.find((l) => l.value === form.language)?.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={handleSubmit} disabled={saving || !form.name.trim() || !form.body.trim()}
                            className="px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                            {saving ? 'Saving...' : template ? 'Update Template' : 'Submit for Review'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PhonePreview({ form, cat, compact = false }: {
    form: FormState; cat: typeof CATEGORIES[0] | undefined; compact?: boolean;
}) {
    return (
        <div className={`flex flex-col items-center ${compact ? '' : 'py-4'}`}>
            <div className={`bg-[#e5ddd5] rounded-2xl ${compact ? 'p-3 w-full' : 'p-5 max-w-xs w-full'} shadow-inner`}>
                <div className="text-[9px] text-center text-gray-500 mb-3 bg-white/60 rounded-full px-2 py-0.5 mx-auto w-fit">Today</div>
                <div className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden max-w-[90%]">
                    {form.header_type === 'TEXT' && form.header_text && (
                        <div className="px-3 pt-3 pb-1">
                            <p className={`font-bold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>{form.header_text}</p>
                        </div>
                    )}
                    {form.header_type === 'IMAGE' && (
                        <div className="bg-gray-100 overflow-hidden" style={{ height: compact ? '60px' : '100px' }}>
                            {form.header_media_url ? (
                                <img src={form.header_media_url} alt="header" className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image size={compact ? 16 : 24} className="text-gray-400" />
                                </div>
                            )}
                        </div>
                    )}
                    {form.header_type === 'VIDEO' && (
                        <div className="bg-gray-800 flex items-center justify-center" style={{ height: compact ? '60px' : '100px' }}>
                            <Video size={compact ? 16 : 24} className="text-gray-400" />
                        </div>
                    )}
                    {form.header_type === 'DOCUMENT' && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-100">
                            <FileDoc size={compact ? 14 : 18} className="text-red-500 shrink-0" />
                            <span className="text-xs text-gray-600 truncate">{form.header_media_url ? form.header_media_url.split('/').pop() : 'document.pdf'}</span>
                        </div>
                    )}
                    <div className="px-3 pt-2 pb-2">
                        <p className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${compact ? 'text-[10px]' : 'text-xs'}`}>
                            {form.body.replace(/\{\{(\d+)\}\}/g, (_, n) => `[var ${n}]`) || <span className="text-gray-400 italic">Message body...</span>}
                        </p>
                        {form.footer && <p className={`text-gray-400 mt-1.5 italic ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{form.footer}</p>}
                        <div className="flex justify-end mt-1"><span className="text-[9px] text-gray-400">10:30</span></div>
                    </div>
                    {form.buttons.length > 0 && (
                        <div className="border-t border-gray-100">
                            {form.buttons.map((btn, i) => (
                                <div key={i} className={`text-center font-semibold text-blue-500 py-2 ${compact ? 'text-[10px]' : 'text-xs'} ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                                    {btn.text || 'Button'}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {!compact && cat && (
                <div className="mt-3 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border ${cat.color}`}>{cat.label} Template</span>
                </div>
            )}
        </div>
    );
}
