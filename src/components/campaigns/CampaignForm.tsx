import { useState, useEffect, useMemo, useRef } from 'react';
import {
    X, Users, Calendar, ChevronRight, ChevronLeft, Image, FileText as FileDoc,
    Video, Check, Upload, Search, CheckSquare, Square, AlertCircle,
    FileSpreadsheet, Phone, MapPin, ShoppingBag, Home, UserCheck,
    Tag, TrendingUp, Send, Info, SlidersHorizontal, IndianRupee,
    ChevronDown, ChevronUp, LayoutGrid,
} from 'lucide-react';
import type { Template, Tag as TagType, Campaign, CampaignFilters, ContactStage, WhatsAppContact } from '../../types';
import { whatsappAPI } from '../../lib/whatsappApi';

const STAGES: ContactStage[] = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'];
const STAGE_COLORS: Record<ContactStage, string> = {
    New: 'bg-sky-100 text-sky-700 border-sky-200',
    Contacted: 'bg-blue-100 text-blue-700 border-blue-200',
    Qualified: 'bg-violet-100 text-violet-700 border-violet-200',
    'Site Visit': 'bg-amber-100 text-amber-700 border-amber-200',
    Closed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Lost: 'bg-red-100 text-red-700 border-red-200',
};
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse'];
const SOURCES = ['WhatsApp', 'Facebook', 'Instagram', 'Website', 'Referral', 'Walk-in', 'Call', 'Other'];

const CONTACT_FIELD_OPTIONS = [
    { value: 'name', label: 'Contact Name' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'preferred_location', label: 'Preferred Location' },
    { value: 'property_type', label: 'Property Type' },
    { value: 'budget_min', label: 'Budget Min' },
    { value: 'budget_max', label: 'Budget Max' },
    { value: 'source', label: 'Source' },
    { value: 'stage', label: 'Stage' },
    { value: '_custom', label: 'Custom text…' },
];

interface Props {
    onSubmit: (data: Partial<Campaign>) => Promise<void>;
    onClose: () => void;
}

type Step = 'name' | 'audience' | 'message' | 'preview';
type AudienceMode = 'segment' | 'upload' | 'manual';
type AudienceSegment = 'all' | 'buyers' | 'sellers' | 'leads';

interface AudienceFilters {
    stages: ContactStage[];
    tagIds: string[];
    location: string;
    property_type: string;
    budget_min: string;
    budget_max: string;
    source: string;
    date_from: string;
    date_to: string;
}

const emptyFilters = (): AudienceFilters => ({
    stages: [], tagIds: [], location: '', property_type: '',
    budget_min: '', budget_max: '', source: '', date_from: '', date_to: '',
});

const STEPS: { id: Step; label: string; desc: string }[] = [
    { id: 'name', label: 'Campaign', desc: 'Name & schedule' },
    { id: 'audience', label: 'Audience', desc: 'Who receives it' },
    { id: 'message', label: 'Message', desc: 'Template & media' },
    { id: 'preview', label: 'Review', desc: 'Preview & send' },
];

const SEGMENTS: { id: AudienceSegment; label: string; icon: React.ElementType; color: string; defaultStages: ContactStage[]; tagHint: string }[] = [
    { id: 'all', label: 'All Contacts', icon: Users, color: 'text-slate-600 bg-slate-50 border-slate-300', defaultStages: [], tagHint: '' },
    { id: 'buyers', label: 'Buyers', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-300', defaultStages: ['New', 'Contacted', 'Qualified', 'Site Visit'], tagHint: 'buyer' },
    { id: 'sellers', label: 'Sellers', icon: Home, color: 'text-teal-600 bg-teal-50 border-teal-300', defaultStages: [], tagHint: 'seller' },
    { id: 'leads', label: 'New Leads', icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-300', defaultStages: ['New', 'Contacted'], tagHint: '' },
];

function extractVariables(body: string): number[] {
    const matches = body.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches.map((m) => parseInt(m.replace(/[^0-9]/g, ''))))].sort((a, b) => a - b);
}

function parseCSVContacts(text: string): { name: string; phone: string }[] {
    const lines = text.trim().split('\n').filter((l) => l.trim());
    if (!lines.length) return [];
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('name') || firstLine.includes('phone') || firstLine.includes('number') || firstLine.includes('mobile');
    const startIndex = hasHeader ? 1 : 0;
    const result: { name: string; phone: string }[] = [];
    for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(delimiter).map((p) => p.trim().replace(/^"|"$/g, ''));
        if (!parts.length) continue;
        let name = '', phone = '';
        if (hasHeader) {
            const headers = lines[0].toLowerCase().split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
            const nameIdx = headers.findIndex((h) => h.includes('name'));
            const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('number') || h.includes('mobile'));
            name = nameIdx >= 0 ? (parts[nameIdx] || '') : (parts[0] || '');
            phone = phoneIdx >= 0 ? (parts[phoneIdx] || '') : (parts[1] || '');
        } else {
            const col0 = parts[0] || '', col1 = parts[1] || '';
            if (/^\+?[\d\s\-()]{8,}$/.test(col0)) { phone = col0; name = col1; }
            else { name = col0; phone = col1; }
        }
        phone = phone.replace(/[\s\-()]/g, '');
        if (!phone.startsWith('+')) phone = '+91' + phone.replace(/^0/, '');
        if (phone.length >= 10) result.push({ name: name || phone, phone });
    }
    return result;
}

const INR_RATE: Record<string, number> = { MARKETING: 0.68, UTILITY: 0.35, AUTHENTICATION: 0.35 };

export default function CampaignForm({ onSubmit, onClose }: Props) {
    const [step, setStep] = useState<Step>('name');
    const [name, setName] = useState('');
    const [scheduleAt, setScheduleAt] = useState('');

    // Audience
    const [audienceMode, setAudienceMode] = useState<AudienceMode>('segment');
    const [selectedSegment, setSelectedSegment] = useState<AudienceSegment>('all');
    const [segFilters, setSegFilters] = useState<AudienceFilters>(emptyFilters());
    const [matchCount, setMatchCount] = useState<number | null>(null);
    const [tags, setTags] = useState<TagType[]>([]);
    const [estimating, setEstimating] = useState(false);

    // Upload
    const [csvText, setCsvText] = useState('');
    const [parsedContacts, setParsedContacts] = useState<{ name: string; phone: string }[]>([]);
    const [csvError, setCsvError] = useState('');
    const uploadRef = useRef<HTMLInputElement>(null);

    // Manual
    const [allContacts, setAllContacts] = useState<WhatsAppContact[]>([]);
    const [contactSearch, setContactSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [manualFilters, setManualFilters] = useState<AudienceFilters>(emptyFilters());

    // Message / Template
    const [templateId, setTemplateId] = useState('');
    const [templates, setTemplates] = useState<any[]>([]);
    const [varMapping, setVarMapping] = useState<Record<number, { fieldKey: string; customValue: string }>>({});
    const [templateSearch, setTemplateSearch] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const mediaRef = useRef<HTMLInputElement>(null);

    // Carousel card media
    const [carouselMedia, setCarouselMedia] = useState<string[]>([]);

    const [saving, setSaving] = useState(false);

    // Load data from API using whatsappAPI
    useEffect(() => {
        loadTemplates();
        loadTags();
        loadContacts();
    }, []);

    const loadTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const data = await whatsappAPI.getTemplates();
            // Only show approved templates
            setTemplates(data.filter(t => t.status === 'APPROVED'));
        } catch (err) {
            console.error('Failed to load templates', err);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const loadTags = async () => {
        try {
            const data: any = await whatsappAPI.getTags();
            setTags(data);
        } catch (err) {
            console.error('Failed to load tags', err);
            setTags([]);
        }
    };

    const loadContacts = async () => {
        setLoadingContacts(true);
        try {
            const data: any = await whatsappAPI.getContacts();
            setAllContacts(data);
        } catch (err) {
            console.error('Failed to load contacts', err);
            setAllContacts([]);
        } finally {
            setLoadingContacts(false);
        }
    };

    // Reset media when template changes
    useEffect(() => {
        setMediaUrl('');
        setCarouselMedia([]);
    }, [templateId]);

    const selectedTemplate = templates.find((t) => t.id === templateId) || null;
    const variables = useMemo(() => selectedTemplate ? extractVariables(selectedTemplate.body) : [], [selectedTemplate]);

    useEffect(() => {
        if (!selectedTemplate) return;
        const vars = extractVariables(selectedTemplate.body);
        const sampleVars = selectedTemplate.variables || [];
        setVarMapping(vars.reduce((acc, n) => {
            acc[n] = { fieldKey: n === 1 ? 'name' : '_custom', customValue: sampleVars[n - 1] || '' };
            return acc;
        }, {} as Record<number, { fieldKey: string; customValue: string }>));
    }, [templateId]);

    // Apply segment defaults when segment changes
    useEffect(() => {
        const seg = SEGMENTS.find((s) => s.id === selectedSegment);
        if (!seg) return;
        setSegFilters((p) => {
            const tagIds = seg.tagHint
                ? tags.filter((t) => t.name.toLowerCase().includes(seg.tagHint)).map((t) => t.id)
                : p.tagIds;
            return {
                ...emptyFilters(),
                stages: seg.defaultStages,
                tagIds,
            };
        });
        setMatchCount(null);
    }, [selectedSegment, tags]);

    const buildQueryFilters = (f: AudienceFilters, seg?: AudienceSegment) => {
        const combined = { ...f };
        if (seg && combined.tagIds.length === 0) {
            const segDef = SEGMENTS.find((s) => s.id === seg);
            if (segDef?.tagHint) {
                combined.tagIds = tags.filter((t) => t.name.toLowerCase().includes(segDef.tagHint)).map((t) => t.id);
            }
        }
        return combined;
    };

    const estimateContacts = async () => {
        setEstimating(true);
        try {
            const f = buildQueryFilters(segFilters, selectedSegment);
            const count = await whatsappAPI.estimateContactCount(f);
            setMatchCount(count);
        } catch (err) {
            console.error('Failed to estimate contacts', err);
            setMatchCount(0);
        } finally {
            setEstimating(false);
        }
    };

    const filteredManualContacts = useMemo(() => {
        const f = manualFilters;
        let base = allContacts;
        if (f.stages.length) base = base.filter((c) => f.stages.includes(c.stage));
        if (f.tagIds.length) base = base.filter((c) => c.tags?.some((t) => f.tagIds.includes(t.id)));
        if (f.location) base = base.filter((c) => c.preferred_location?.toLowerCase().includes(f.location.toLowerCase()));
        if (f.property_type) base = base.filter((c) => c.property_type === f.property_type);
        if (f.budget_min) base = base.filter((c) => (c.budget_max || 0) >= Number(f.budget_min));
        if (f.budget_max) base = base.filter((c) => (c.budget_min || 0) <= Number(f.budget_max));
        if (f.source) base = base.filter((c) => c.source === f.source);
        if (f.date_from) base = base.filter((c) => c.created_at >= f.date_from);
        if (f.date_to) base = base.filter((c) => c.created_at <= f.date_to + 'T23:59:59');
        if (contactSearch.trim()) {
            const q = contactSearch.toLowerCase();
            base = base.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
        }
        return base;
    }, [allContacts, manualFilters, contactSearch]);

    const applyBuyerSellerManual = (type: 'buyer' | 'seller') => {
        const hint = type === 'buyer' ? 'buyer' : 'seller';
        const matchedTags = tags.filter((t) => t.name.toLowerCase().includes(hint)).map((t) => t.id);
        const defaultStages = type === 'buyer' ? (['New', 'Contacted', 'Qualified', 'Site Visit'] as ContactStage[]) : [];
        setManualFilters((p) => ({ ...p, tagIds: matchedTags, stages: defaultStages }));
    };

    const toggleContact = (id: string) => setSelectedIds((prev) => {
        const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n;
    });

    const toggleAll = () => {
        const ids = filteredManualContacts.map((c) => c.id);
        const allSel = ids.every((id) => selectedIds.has(id));
        setSelectedIds((prev) => { const n = new Set(prev); if (allSel) ids.forEach((id) => n.delete(id)); else ids.forEach((id) => n.add(id)); return n; });
    };

    const handleFileUpload = (file: File) => {
        setCsvError('');
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = (e.target?.result as string) || '';
            setCsvText(text);
            const contacts = parseCSVContacts(text);
            if (!contacts.length) setCsvError('No valid contacts found. Ensure phone numbers are present.');
            else setParsedContacts(contacts);
        };
        reader.readAsText(file);
    };

    const handleMediaUpload = async (file: File) => {
        setUploadingMedia(true); setUploadProgress(10);
        try {
            setUploadProgress(40);
            const url = await whatsappAPI.uploadMedia(file);
            setUploadProgress(80);
            setMediaUrl(url);
            setUploadProgress(100);
        } catch (err) {
            console.error('Failed to upload media', err);
        } finally {
            setUploadingMedia(false);
            setTimeout(() => setUploadProgress(0), 800);
        }
    };

    const audienceCount =
        audienceMode === 'upload' ? parsedContacts.length :
            audienceMode === 'manual' ? selectedIds.size :
                matchCount;

    const estimatedCost = selectedTemplate
        ? ((audienceCount || 0) * (INR_RATE[selectedTemplate.category] || 0.68))
        : 0;
    const handleSubmit = async () => {
        if (!name.trim() || !templateId) return;
        setSaving(true);

        const templateVars = variables.map((n) => {
            const m = varMapping[n];
            if (!m) return '';
            return m.fieldKey === '_custom' ? m.customValue : `{{contact.${m.fieldKey}}}`;
        });

        // ✅ FIX: Convert local time to UTC
        let scheduledAtUTC = null;
        if (scheduleAt) {
            const localDate = new Date(scheduleAt);
            scheduledAtUTC = localDate.toISOString(); // Converts to UTC
            console.log("🔴 Local time:", scheduleAt);
            console.log("🔴 UTC time:", scheduledAtUTC);
        }

        const campaignData: Partial<Campaign> = {
            name: name.trim(),
            template_id: templateId,
            template_variables: templateVars,
            filters: {
                stage: segFilters.stages.length ? segFilters.stages : undefined,
                tags: segFilters.tagIds.length ? segFilters.tagIds : undefined,
                location: segFilters.location || undefined,
                property_type: segFilters.property_type || undefined,
                budget_min: segFilters.budget_min ? Number(segFilters.budget_min) : undefined,
                budget_max: segFilters.budget_max ? Number(segFilters.budget_max) : undefined,
                media_url: mediaUrl || undefined,
            } as CampaignFilters,
            status: scheduleAt ? 'scheduled' : 'draft',
            scheduled_at: scheduledAtUTC,  // ✅ Send UTC time
            total_contacts: audienceCount || 0,

            audience_mode: audienceMode,
            audience_filters: audienceMode === 'segment' ? segFilters : {},
            selected_contact_ids: audienceMode === 'manual' ? Array.from(selectedIds).map(id => String(id)) : [],
            uploaded_contacts: audienceMode === 'upload' ? parsedContacts : [],
        };

        console.log("🔴 Full campaignData:", campaignData);

        await onSubmit(campaignData);
        setSaving(false);
    };
    const stepIndex = STEPS.findIndex((s) => s.id === step);
    const canGoNext = () => {
        if (step === 'name') return name.trim().length > 0;
        if (step === 'audience') {
            if (audienceMode === 'upload') return parsedContacts.length > 0;
            if (audienceMode === 'manual') return selectedIds.size > 0;
            return true;
        }
        if (step === 'message') return !!templateId;
        return true;
    };
    const goNext = () => { const next = STEPS[stepIndex + 1]; if (next) setStep(next.id); };
    const goPrev = () => { const prev = STEPS[stepIndex - 1]; if (prev) setStep(prev.id); };

    const filteredTemplates = useMemo(() => {
        if (!templateSearch.trim()) return templates;
        const q = templateSearch.toLowerCase();
        return templates.filter((t) =>
            t.name.toLowerCase().includes(q) ||
            t.body.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );
    }, [templates, templateSearch]);

    const previewBody = useMemo(() => {
        if (!selectedTemplate) return '';
        return selectedTemplate.body.replace(/\{\{(\d+)\}\}/g, (_, n) => {
            const m = varMapping[Number(n)];
            if (!m) return `[${n}]`;
            if (m.fieldKey === '_custom') return m.customValue || `[${n}]`;
            const samples: Record<string, string> = { name: 'Rahul', phone: '+91 98765 43210', preferred_location: 'Wakad', property_type: 'Apartment', budget_min: '₹60L', budget_max: '₹1.2Cr', source: 'WhatsApp', stage: 'Qualified' };
            return `[${samples[m.fieldKey] || m.fieldKey}]`;
        });
    }, [selectedTemplate, varMapping]);

    const needsMedia = selectedTemplate && ['IMAGE', 'VIDEO', 'DOCUMENT', 'CAROUSEL'].includes(selectedTemplate.template_type || '');
    const carouselCount = selectedTemplate?.carousel_cards?.length || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: '96vh' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <div>
                        <h2 className="font-bold text-white text-sm">Create Campaign</h2>
                        <p className="text-[10px] text-emerald-100 mt-0.5">WhatsApp Broadcast • Bulk Message</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Step indicators */}
                <div className="flex border-b border-gray-100 bg-gray-50/80 shrink-0">
                    {STEPS.map((s, i) => {
                        const isActive = s.id === step;
                        const isDone = i < stepIndex;
                        return (
                            <button key={s.id} onClick={() => isDone && setStep(s.id)}
                                className={`flex-1 flex flex-col items-center py-2.5 px-2 relative transition-colors ${isDone ? 'cursor-pointer' : 'cursor-default'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5 transition-all ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-600 text-white ring-2 ring-emerald-100' : 'bg-gray-200 text-gray-400'}`}>
                                    {isDone ? <Check size={10} /> : i + 1}
                                </div>
                                <span className={`text-[9px] font-bold ${isActive ? 'text-emerald-700' : isDone ? 'text-emerald-500' : 'text-gray-400'}`}>{s.label}</span>
                                <span className={`text-[8px] ${isActive ? 'text-emerald-400' : 'text-gray-300'}`}>{s.desc}</span>
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
                                {i < STEPS.length - 1 && <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-px h-5 ${isDone ? 'bg-emerald-200' : 'bg-gray-200'}`} />}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">

                    {/* ── Step 1: Name & Schedule ── */}
                    {step === 'name' && (
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Campaign Name <span className="text-rose-500">*</span></label>
                                <input autoFocus
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Wakad Property Blast — June 2026" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Send size={14} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-emerald-800">Approved Template Campaign</p>
                                    <p className="text-[10px] text-emerald-600 mt-0.5">Sends WhatsApp-approved template messages in bulk</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                                    Schedule <span className="text-[10px] font-normal text-gray-400">(leave blank for manual launch)</span>
                                </label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
                                    <Calendar size={14} className="text-gray-400 shrink-0" />
                                    <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)}
                                        className="flex-1 text-sm focus:outline-none bg-transparent" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Audience ── */}
                    {step === 'audience' && (
                        <div className="p-5 space-y-3">
                            {/* Mode tabs */}
                            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
                                {([
                                    { id: 'segment' as AudienceMode, label: 'By Segment', icon: Users },
                                    { id: 'upload' as AudienceMode, label: 'Upload CSV', icon: Upload },
                                    { id: 'manual' as AudienceMode, label: 'Pick Manually', icon: CheckSquare },
                                ]).map((m) => {
                                    const Icon = m.icon;
                                    return (
                                        <button key={m.id} onClick={() => setAudienceMode(m.id)}
                                            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${audienceMode === m.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            <Icon size={11} /> {m.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ─ Segment ─ */}
                            {audienceMode === 'segment' && (
                                <>
                                    {/* Segment chips */}
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {SEGMENTS.map((seg) => {
                                            const Icon = seg.icon;
                                            const isSelected = selectedSegment === seg.id;
                                            return (
                                                <button key={seg.id} onClick={() => setSelectedSegment(seg.id)}
                                                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                        <Icon size={14} className={isSelected ? 'text-emerald-600' : 'text-gray-500'} />
                                                    </div>
                                                    <span className={`text-[9px] font-bold ${isSelected ? 'text-emerald-800' : 'text-gray-600'}`}>{seg.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Filter panel — always visible for active segment */}
                                    <FilterPanel
                                        filters={segFilters}
                                        onChange={(f) => { setSegFilters(f); setMatchCount(null); }}
                                        tags={tags}
                                    />

                                    {/* Estimate */}
                                    <button onClick={estimateContacts} disabled={estimating}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 disabled:opacity-60 transition-colors">
                                        <UserCheck size={13} />
                                        {estimating ? 'Estimating…' : matchCount !== null
                                            ? <><span className="font-bold text-emerald-800">{matchCount.toLocaleString('en-IN')} contacts matched</span><span className="text-[10px] text-emerald-500 ml-1">— click to refresh</span></>
                                            : 'Estimate Audience Size'}
                                    </button>
                                </>
                            )}

                            {/* ─ Upload ─ */}
                            {audienceMode === 'upload' && (
                                <div className="space-y-3">
                                    <div onClick={() => uploadRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group">
                                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-emerald-100 rounded-xl mx-auto flex items-center justify-center mb-2 transition-colors">
                                            <FileSpreadsheet size={18} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-600 group-hover:text-emerald-700">Click to upload CSV / Excel</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Columns: Name, Phone — +91 auto-added if missing</p>
                                        <input ref={uploadRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden"
                                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 block mb-1">Or paste CSV data</label>
                                        <textarea rows={3} value={csvText}
                                            onChange={(e) => { setCsvText(e.target.value); setCsvError(''); const c = parseCSVContacts(e.target.value); setParsedContacts(c); if (e.target.value.trim() && !c.length) setCsvError('No valid contacts found.'); }}
                                            placeholder={"Name,Phone\nRahul Sharma,9876543210"}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                                    </div>
                                    {csvError && <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs"><AlertCircle size={12} />{csvError}</div>}
                                    {parsedContacts.length > 0 && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-emerald-700"><Check size={12} className="inline mr-1" />{parsedContacts.length.toLocaleString('en-IN')} contacts ready</p>
                                                <button onClick={() => { setCsvText(''); setParsedContacts([]); }} className="text-[10px] text-gray-400 hover:text-red-500">Clear</button>
                                            </div>
                                            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-44">
                                                <table className="w-full text-xs">
                                                    <thead><tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="text-left px-3 py-1.5 font-semibold text-gray-400 w-8">#</th>
                                                        <th className="text-left px-3 py-1.5 font-semibold text-gray-500">Name</th>
                                                        <th className="text-left px-3 py-1.5 font-semibold text-gray-500">Phone</th>
                                                    </tr></thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {parsedContacts.slice(0, 100).map((c, i) => (
                                                            <tr key={i} className="hover:bg-gray-50/60">
                                                                <td className="px-3 py-1.5 text-gray-300">{i + 1}</td>
                                                                <td className="px-3 py-1.5 font-medium text-gray-700">{c.name}</td>
                                                                <td className="px-3 py-1.5 font-mono text-gray-500">{c.phone}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {parsedContacts.length > 100 && <div className="px-3 py-2 text-center text-[10px] text-gray-400 bg-gray-50">+{parsedContacts.length - 100} more</div>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ─ Manual ─ */}
                            {audienceMode === 'manual' && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input value={contactSearch} onChange={(e) => setContactSearch(e.target.value)}
                                                placeholder="Search name or phone…"
                                                className="w-full pl-7 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 shrink-0">
                                            {selectedIds.size} selected
                                        </span>
                                    </div>

                                    {/* Filter panel with buyer/seller shortcuts */}
                                    <FilterPanel
                                        filters={manualFilters}
                                        onChange={(f) => setManualFilters(f)}
                                        tags={tags}
                                        showBuyerSeller
                                        onBuyerSeller={applyBuyerSellerManual}
                                    />

                                    {loadingContacts ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={toggleAll}>
                                                {filteredManualContacts.length > 0 && filteredManualContacts.every((c) => selectedIds.has(c.id))
                                                    ? <CheckSquare size={13} className="text-emerald-600" />
                                                    : <Square size={13} className="text-gray-400" />}
                                                <span className="text-[11px] font-semibold text-gray-600">Select all ({filteredManualContacts.length.toLocaleString('en-IN')})</span>
                                                <span className="ml-auto text-[10px] text-gray-400">{allContacts.length} total</span>
                                            </div>
                                            <div className="max-h-52 overflow-y-auto">
                                                <table className="w-full text-xs">
                                                    <thead className="sticky top-0 bg-white border-b border-gray-100 shadow-sm">
                                                        <tr>
                                                            <th className="px-3 py-1.5 w-7" />
                                                            <th className="text-left px-2 py-1.5 font-semibold text-gray-500">Name</th>
                                                            <th className="text-left px-2 py-1.5 font-semibold text-gray-500">Phone</th>
                                                            <th className="text-left px-2 py-1.5 font-semibold text-gray-500">Stage</th>
                                                            <th className="text-left px-2 py-1.5 font-semibold text-gray-500">Location</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {filteredManualContacts.length === 0
                                                            ? <tr><td colSpan={5} className="text-center py-6 text-gray-400 text-xs">No contacts match filters</td></tr>
                                                            : filteredManualContacts.map((contact) => {
                                                                const isSel = selectedIds.has(contact.id);
                                                                return (
                                                                    <tr key={contact.id} onClick={() => toggleContact(contact.id)}
                                                                        className={`cursor-pointer transition-colors ${isSel ? 'bg-emerald-50/60' : 'hover:bg-gray-50'}`}>
                                                                        <td className="px-3 py-2">
                                                                            {isSel ? <CheckSquare size={13} className="text-emerald-600" /> : <Square size={13} className="text-gray-300" />}
                                                                        </td>
                                                                        <td className="px-2 py-2 font-medium text-gray-800">{contact.name}</td>
                                                                        <td className="px-2 py-2 font-mono text-gray-500 text-[10px]">{contact.phone}</td>
                                                                        <td className="px-2 py-2">
                                                                            {contact.stage && <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${STAGE_COLORS[contact.stage]}`}>{contact.stage}</span>}
                                                                        </td>
                                                                        <td className="px-2 py-2 text-[10px] text-gray-400">
                                                                            {contact.preferred_location && <span className="flex items-center gap-0.5"><MapPin size={8} />{contact.preferred_location}</span>}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 3: Message ── */}
                    {step === 'message' && (
                        <div className="p-5 space-y-4">
                            {loadingTemplates ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">No approved templates</p>
                                        <p className="text-xs text-amber-600 mt-0.5">Create and get a WhatsApp template approved first.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)}
                                            placeholder="Search approved templates…"
                                            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                    </div>
                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                                        {filteredTemplates.map((t) => (
                                            <button key={t.id} onClick={() => setTemplateId(t.id)}
                                                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${templateId === t.id ? 'border-emerald-500 bg-emerald-50/60' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${templateId === t.id ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                                        {t.template_type === 'IMAGE' ? <Image size={14} className={templateId === t.id ? 'text-emerald-600' : 'text-gray-400'} /> :
                                                            t.template_type === 'VIDEO' ? <Video size={14} className={templateId === t.id ? 'text-emerald-600' : 'text-gray-400'} /> :
                                                                t.template_type === 'DOCUMENT' ? <FileDoc size={14} className={templateId === t.id ? 'text-emerald-600' : 'text-gray-400'} /> :
                                                                    t.template_type === 'CAROUSEL' ? <LayoutGrid size={14} className={templateId === t.id ? 'text-emerald-600' : 'text-gray-400'} /> :
                                                                        <Phone size={14} className={templateId === t.id ? 'text-emerald-600' : 'text-gray-400'} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                            <span className="text-xs font-bold text-gray-800 font-mono">{t.name}</span>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${t.category === 'MARKETING' ? 'bg-orange-100 text-orange-700' : t.category === 'UTILITY' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.category}</span>
                                                            {t.template_type && t.template_type !== 'TEXT' && <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{t.template_type}</span>}
                                                            <span className="ml-auto text-[9px] text-gray-400 font-mono shrink-0">₹{INR_RATE[t.category] || 0.68}/msg</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{t.body}</p>
                                                    </div>
                                                    {templateId === t.id && <Check size={14} className="text-emerald-600 shrink-0 mt-1" />}
                                                </div>
                                            </button>
                                        ))}
                                        {filteredTemplates.length === 0 && templateSearch && (
                                            <div className="text-center py-6 text-gray-400 text-xs">No templates match your search</div>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Media upload for IMAGE/VIDEO/DOCUMENT/CAROUSEL templates */}
                            {needsMedia && selectedTemplate && (
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                        {selectedTemplate.template_type === 'IMAGE' ? <Image size={12} className="text-blue-500" /> :
                                            selectedTemplate.template_type === 'VIDEO' ? <Video size={12} className="text-purple-500" /> :
                                                selectedTemplate.template_type === 'DOCUMENT' ? <FileDoc size={12} className="text-red-500" /> :
                                                    <LayoutGrid size={12} className="text-amber-500" />}
                                        <p className="text-[10px] font-semibold text-gray-700">
                                            {selectedTemplate.template_type === 'CAROUSEL'
                                                ? `Carousel Media (${carouselCount} cards)`
                                                : `${selectedTemplate.template_type} Upload`} — required for campaign
                                        </p>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {selectedTemplate.template_type === 'CAROUSEL' ? (
                                            <div className="space-y-2">
                                                {Array.from({ length: carouselCount || 2 }, (_, ci) => (
                                                    <div key={ci} className="flex items-center gap-2">
                                                        <span className="text-[10px] font-semibold text-gray-500 w-12 shrink-0">Card {ci + 1}</span>
                                                        <input
                                                            value={carouselMedia[ci] || ''}
                                                            onChange={(e) => setCarouselMedia((p) => { const n = [...p]; n[ci] = e.target.value; return n; })}
                                                            placeholder="https://… (image URL)"
                                                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                ))}
                                                <p className="text-[9px] text-gray-400">Enter image/video URLs for each carousel card.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        value={mediaUrl}
                                                        onChange={(e) => setMediaUrl(e.target.value)}
                                                        placeholder={
                                                            selectedTemplate.template_type === 'IMAGE' ? 'https://… .jpg / .png' :
                                                                selectedTemplate.template_type === 'VIDEO' ? 'https://… .mp4' :
                                                                    'https://… .pdf'
                                                        }
                                                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <button onClick={() => mediaRef.current?.click()} disabled={uploadingMedia}
                                                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0 transition-colors">
                                                        <Upload size={11} />
                                                        {uploadingMedia ? `${uploadProgress}%` : 'Upload'}
                                                    </button>
                                                    <input ref={mediaRef} type="file" className="hidden"
                                                        accept={selectedTemplate.template_type === 'IMAGE' ? 'image/*' : selectedTemplate.template_type === 'VIDEO' ? 'video/*' : '.pdf,.doc,.docx'}
                                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f); }} />
                                                </div>
                                                {uploadProgress > 0 && uploadProgress < 100 && (
                                                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                                                    </div>
                                                )}
                                                {mediaUrl && selectedTemplate.template_type === 'IMAGE' && (
                                                    <div className="h-20 rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={mediaUrl} alt="preview" className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    </div>
                                                )}
                                                <p className="text-[9px] text-gray-400">
                                                    {selectedTemplate.template_type === 'IMAGE' ? 'JPG/PNG/WEBP max 5MB' :
                                                        selectedTemplate.template_type === 'VIDEO' ? 'MP4 max 16MB' : 'PDF max 100MB'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Variable mapping */}
                            {selectedTemplate && variables.length > 0 && (
                                <div className="border border-amber-200 rounded-xl overflow-hidden">
                                    <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                                        <Info size={12} className="text-amber-500" />
                                        <p className="text-[10px] font-semibold text-amber-800">Variable Mapping — {variables.length} variable{variables.length > 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {variables.map((n) => {
                                            const mapping = varMapping[n] || { fieldKey: '_custom', customValue: '' };
                                            const sampleVal = selectedTemplate.variables?.[n - 1] || '';
                                            return (
                                                <div key={n} className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0 w-10 text-center">{`{{${n}}}`}</span>
                                                    <select value={mapping.fieldKey}
                                                        onChange={(e) => setVarMapping((p) => ({ ...p, [n]: { ...p[n], fieldKey: e.target.value, customValue: p[n]?.customValue || sampleVal } }))}
                                                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
                                                        {CONTACT_FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                    </select>
                                                    {mapping.fieldKey === '_custom' ? (
                                                        <input value={mapping.customValue}
                                                            onChange={(e) => setVarMapping((p) => ({ ...p, [n]: { ...p[n], customValue: e.target.value } }))}
                                                            placeholder={sampleVal || `Value for {{${n}}}`}
                                                            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-2 focus:ring-amber-400" />
                                                    ) : (
                                                        <span className="flex-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded-lg truncate">
                                                            {sampleVal ? `e.g. ${sampleVal}` : CONTACT_FIELD_OPTIONS.find((o) => o.value === mapping.fieldKey)?.label}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 4: Preview ── */}
                    {step === 'preview' && (
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                                        {[
                                            { label: 'Campaign', value: name },
                                            { label: 'Template', value: selectedTemplate?.name || '—', sub: selectedTemplate?.category },
                                            {
                                                label: 'Audience',
                                                value: audienceMode === 'upload' ? `${parsedContacts.length.toLocaleString('en-IN')} contacts (CSV)` :
                                                    audienceMode === 'manual' ? `${selectedIds.size.toLocaleString('en-IN')} contacts (selected)` :
                                                        matchCount !== null ? `${matchCount.toLocaleString('en-IN')} contacts (filtered)` : 'Estimate on Audience step',
                                            },
                                            { label: 'Schedule', value: scheduleAt ? new Date(scheduleAt).toLocaleString('en-IN') : 'Manual launch' },
                                        ].map((item) => (
                                            <div key={item.label} className="px-3 py-2.5">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">{item.label}</p>
                                                <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                                                {item.sub && <p className="text-[10px] text-gray-400">{item.sub}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    {selectedTemplate && (audienceCount || 0) > 0 && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                                            <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1"><IndianRupee size={9} /> Estimated Cost</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-bold text-emerald-800">₹{estimatedCost.toFixed(2)}</span>
                                                <span className="text-[10px] text-emerald-600">({audienceCount?.toLocaleString('en-IN')} × ₹{INR_RATE[selectedTemplate.category] || 0.68})</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedTemplate && (
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Message Preview</p>
                                        <div className="rounded-2xl p-3" style={{ background: '#e5ddd5' }}>
                                            <div className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden max-w-[95%]">
                                                {selectedTemplate.header_type === 'TEXT' && selectedTemplate.header_text && (
                                                    <div className="px-3 pt-3 pb-1 border-b border-gray-50"><p className="font-bold text-gray-900 text-sm">{selectedTemplate.header_text}</p></div>
                                                )}
                                                {selectedTemplate.header_type === 'IMAGE' && (
                                                    mediaUrl
                                                        ? <div className="h-24 overflow-hidden"><img src={mediaUrl} className="w-full h-full object-cover" alt="" /></div>
                                                        : <div className="bg-gray-100 h-20 flex items-center justify-center"><Image size={18} className="text-gray-400" /></div>
                                                )}
                                                {selectedTemplate.header_type === 'VIDEO' && <div className="bg-gray-800 h-20 flex items-center justify-center"><Video size={18} className="text-gray-400" /></div>}
                                                {selectedTemplate.header_type === 'DOCUMENT' && <div className="flex items-center gap-2 p-3 bg-gray-50"><FileDoc size={13} className="text-red-500" /><span className="text-xs text-gray-600">document.pdf</span></div>}
                                                <div className="px-3 pt-2 pb-2">
                                                    <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">{previewBody}</p>
                                                    {selectedTemplate.footer && <p className="text-[10px] text-gray-400 mt-1 italic">{selectedTemplate.footer}</p>}
                                                    <div className="flex justify-end mt-1"><span className="text-[8px] text-gray-400">10:30</span></div>
                                                </div>
                                                {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                                                    <div className="border-t border-gray-100">
                                                        {selectedTemplate.buttons.map((btn, i) => (
                                                            <div key={i} className={`text-center text-xs font-semibold text-blue-500 py-2 ${i > 0 ? 'border-t border-gray-100' : ''}`}>{btn.text}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={stepIndex === 0 ? onClose : goPrev}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={14} />
                        {stepIndex === 0 ? 'Cancel' : 'Back'}
                    </button>
                    <div className="flex items-center gap-2">
                        {audienceMode === 'manual' && step === 'audience' && selectedIds.size > 0 && (
                            <span className="text-xs text-emerald-700 font-bold">{selectedIds.size.toLocaleString('en-IN')} selected</span>
                        )}
                        {step !== 'preview' ? (
                            <button onClick={goNext} disabled={!canGoNext()}
                                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                                Continue <ChevronRight size={14} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={saving || !name.trim() || !templateId}
                                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                                <Send size={13} />
                                {saving ? 'Saving…' : scheduleAt ? 'Schedule Campaign' : 'Save as Draft'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// FilterPanel component
function FilterPanel({
    filters, onChange, tags, showBuyerSeller, onBuyerSeller,
}: {
    filters: AudienceFilters;
    onChange: (f: AudienceFilters) => void;
    tags: TagType[];
    showBuyerSeller?: boolean;
    onBuyerSeller?: (type: 'buyer' | 'seller') => void;
}) {
    const [open, setOpen] = useState(false);
    const hasActive = filters.stages.length > 0 || filters.tagIds.length > 0 || filters.location || filters.property_type || filters.budget_min || filters.budget_max || filters.source || filters.date_from || filters.date_to;

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((p) => !p)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold transition-colors ${hasActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={12} />
                    <span>Filters {hasActive ? `(${[filters.stages.length > 0, filters.tagIds.length > 0, !!filters.location, !!filters.property_type, !!filters.budget_min || !!filters.budget_max, !!filters.source, !!filters.date_from].filter(Boolean).length} active)` : ''}</span>
                </div>
                {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {open && (
                <div className="p-3 space-y-3 bg-white border-t border-gray-100">
                    {/* Quick segment shortcuts */}
                    {showBuyerSeller && onBuyerSeller && (
                        <div className="flex gap-2">
                            <button onClick={() => onBuyerSeller('buyer')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                <ShoppingBag size={10} /> Select Buyers
                            </button>
                            <button onClick={() => onBuyerSeller('seller')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
                                <Home size={10} /> Select Sellers
                            </button>
                        </div>
                    )}

                    {/* Stage */}
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stage</p>
                        <div className="flex flex-wrap gap-1">
                            {STAGES.map((s) => (
                                <button key={s}
                                    onClick={() => onChange({ ...filters, stages: filters.stages.includes(s) ? filters.stages.filter((x) => x !== s) : [...filters.stages, s] })}
                                    className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold transition-colors ${filters.stages.includes(s) ? `${STAGE_COLORS[s]} border-current` : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tags</p>
                            <div className="flex flex-wrap gap-1">
                                {tags.map((t) => (
                                    <button key={t.id}
                                        onClick={() => onChange({ ...filters, tagIds: filters.tagIds.includes(t.id) ? filters.tagIds.filter((x) => x !== t.id) : [...filters.tagIds, t.id] })}
                                        className="text-[9px] px-2 py-0.5 rounded-full border font-semibold transition-all"
                                        style={{
                                            backgroundColor: filters.tagIds.includes(t.id) ? t.color : t.color + '18',
                                            color: filters.tagIds.includes(t.id) ? '#fff' : t.color,
                                            borderColor: t.color + '60',
                                        }}>
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Row 1: Location + Property Type */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                            <input
                                value={filters.location}
                                onChange={(e) => onChange({ ...filters, location: e.target.value })}
                                placeholder="e.g. Wakad, Baner"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Property Type</p>
                            <select
                                value={filters.property_type}
                                onChange={(e) => onChange({ ...filters, property_type: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">Any</option>
                                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Budget Min/Max */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Budget Min (₹)</p>
                            <input type="number"
                                value={filters.budget_min}
                                onChange={(e) => onChange({ ...filters, budget_min: e.target.value })}
                                placeholder="e.g. 5000000"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Budget Max (₹)</p>
                            <input type="number"
                                value={filters.budget_max}
                                onChange={(e) => onChange({ ...filters, budget_max: e.target.value })}
                                placeholder="e.g. 12000000"
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Row 3: Source + Date range */}
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Source</p>
                            <select
                                value={filters.source}
                                onChange={(e) => onChange({ ...filters, source: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">Any</option>
                                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date From</p>
                            <input type="date"
                                value={filters.date_from}
                                onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date To</p>
                            <input type="date"
                                value={filters.date_to}
                                onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Clear filters */}
                    {hasActive && (
                        <button onClick={() => onChange(emptyFilters())}
                            className="text-[10px] text-red-500 hover:text-red-700 font-medium transition-colors">
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}