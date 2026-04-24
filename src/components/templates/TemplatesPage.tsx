// src/components/templates/TemplatesPage.tsx
import { useState, useEffect, useRef } from 'react';
import {
    FileText, CheckCircle, XCircle, Clock, AlertTriangle, Trash2, Send,
    Search, RefreshCw, Eye, Copy, Plus, Edit2, List, IndianRupee,
    AlertCircle, Lock,
} from 'lucide-react';
import { whatsappAPI } from '../../lib/whatsappApi';
import type { Template, TemplateStatus } from '../../types';
import TemplateForm from './TemplateForm';

type ViewTab = 'all' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTION_REQUIRED';

const STATUS_CONFIG: Record<TemplateStatus, {
    icon: React.ElementType; color: string; bg: string; border: string;
    label: string; dot: string; badgeClass: string;
}> = {
    DRAFT: {
        icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200',
        label: 'Draft', dot: 'bg-slate-400',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    APPROVED: {
        icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
        label: 'Approved', dot: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    PENDING: {
        icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
        label: 'In Review', dot: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    REJECTED: {
        icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
        label: 'Rejected', dot: 'bg-red-500',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
    },
    IN_APPEAL: {
        icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
        label: 'In Appeal', dot: 'bg-orange-500',
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    },
};

const CATEGORY_CONFIG: Record<string, { label: string; class: string }> = {
    MARKETING: { label: 'Marketing', class: 'text-orange-600 font-bold' },
    UTILITY: { label: 'Utility', class: 'text-blue-600 font-bold' },
    AUTHENTICATION: { label: 'Auth', class: 'text-emerald-600 font-bold' },
};

const INR_COST: Record<string, number> = {
    MARKETING: 0.68, UTILITY: 0.35, AUTHENTICATION: 0.35,
};

interface StatusChange {
    id: string; templateName: string;
    oldStatus: TemplateStatus; newStatus: TemplateStatus; at: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ViewTab>('all');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Template | null>(null);
    const [search, setSearch] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [statusChanges, setStatusChanges] = useState<StatusChange[]>([]);
    const prevStatusRef = useRef<Record<string, TemplateStatus>>({});

    // Fetch templates from API
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data:any = await whatsappAPI.getTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Failed to fetch templates', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchTemplates();
    }, []);

    // Track status changes
    useEffect(() => {
        if (templates.length > 0) {
            templates.forEach((t) => {
                const prev = prevStatusRef.current[t.id];
                if (prev && prev !== t.status) {
                    setStatusChanges((n) => [
                        { id: `${t.id}-${Date.now()}`, templateName: t.name, oldStatus: prev, newStatus: t.status, at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                        ...n,
                    ].slice(0, 10));
                }
            });
            const map: Record<string, TemplateStatus> = {};
            templates.forEach((t) => { map[t.id] = t.status; });
            prevStatusRef.current = map;
        }
    }, [templates]);

    // Auto-poll every 30s for status updates
    useEffect(() => {
        const interval = setInterval(async () => {
            const hasPending = templates.some((t) => t.status === 'PENDING' || t.status === 'IN_APPEAL');
            if (hasPending) {
                await handleSyncStatus();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [templates]);

    const handleSyncStatus = async () => {
        setSyncing(true);
        try {
            const result:any = await whatsappAPI.syncTemplateStatus();
            if (result.templates) {
                setTemplates(result.templates);
                setLastSync(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
            }
        } catch (err) {
            console.error('Sync failed:', err);
        } finally {
            setSyncing(false);
        }
    };

    const handleCreateTemplate = async (data: Partial<Template>) => {
        if (editing) {
            await whatsappAPI.updateTemplate(editing.id, data);
        } else {
            await whatsappAPI.createTemplate(data);
        }
        await fetchTemplates();
        setShowForm(false);
        setEditing(null);
    };

    const handleDelete = async (id: string) => {
        await whatsappAPI.deleteTemplate(id);
        await fetchTemplates();
        setConfirmDelete(null);
    };

    const handleDuplicate = async (t: Template) => {
        const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = t;
        await whatsappAPI.createTemplate({ ...rest, name: `${t.name}_copy`, status: 'DRAFT' });
        await fetchTemplates();
    };

    const handleSubmitToMeta = async (id: string) => {
        await whatsappAPI.submitTemplateToMeta(id);
        await fetchTemplates();
    };

    const filtered = templates.filter((t) => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (activeTab === 'all') return true;
        if (activeTab === 'ACTION_REQUIRED') return t.status === 'REJECTED' || t.status === 'IN_APPEAL';
        return t.status === activeTab;
    });

    const counts = {
        all: templates.length,
        DRAFT: templates.filter((t) => t.status === 'DRAFT').length,
        PENDING: templates.filter((t) => t.status === 'PENDING').length,
        APPROVED: templates.filter((t) => t.status === 'APPROVED').length,
        ACTION_REQUIRED: templates.filter((t) => t.status === 'REJECTED' || t.status === 'IN_APPEAL').length,
    };

    const VIEW_TABS: { id: ViewTab; label: string; icon: React.ElementType; activeClass: string; countClass: string }[] = [
        { id: 'all', label: 'All', icon: List, activeClass: 'border-slate-700 text-slate-800', countClass: 'bg-slate-800 text-white' },
        { id: 'DRAFT', label: 'Draft', icon: FileText, activeClass: 'border-slate-500 text-slate-700', countClass: 'bg-slate-100 text-slate-700' },
        { id: 'PENDING', label: 'In Review', icon: Clock, activeClass: 'border-amber-500 text-amber-700', countClass: 'bg-amber-100 text-amber-700' },
        { id: 'APPROVED', label: 'Approved', icon: CheckCircle, activeClass: 'border-emerald-500 text-emerald-700', countClass: 'bg-emerald-100 text-emerald-700' },
        { id: 'ACTION_REQUIRED', label: 'Rejected', icon: AlertTriangle, activeClass: 'border-red-500 text-red-700', countClass: 'bg-red-100 text-red-700' },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, body or status…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleSyncStatus}
                            disabled={syncing}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-900 disabled:opacity-60 transition-colors"
                        >
                            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                            Sync Status
                        </button>
                        <button
                            onClick={() => { setEditing(null); setShowForm(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            <Plus size={15} />
                            New Template
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-end gap-0 border-b border-gray-100 -mb-px">
                    {VIEW_TABS.map((tab) => {
                        const count = tab.id === 'all' ? counts.all : counts[tab.id as keyof typeof counts];
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${isActive ? tab.activeClass : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <Icon size={13} />
                                {tab.label}
                                {count > 0 && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${isActive ? tab.countClass : 'bg-gray-100 text-gray-500'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Live status banners */}
            <div className="shrink-0 space-y-2 px-6 pt-4">
                {counts.PENDING > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        <span className="text-amber-800">
                            <strong>{counts.PENDING}</strong> template{counts.PENDING > 1 ? 's' : ''} in review — auto-checking every 30s
                            {lastSync && <span className="text-amber-500 ml-1">· last sync {lastSync}</span>}
                            {syncing && <span className="text-amber-600 font-semibold ml-1">· checking now…</span>}
                        </span>
                    </div>
                )}
                {counts.ACTION_REQUIRED > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs">
                        <AlertCircle size={13} className="text-red-500 shrink-0" />
                        <span className="text-red-800">
                            <strong>{counts.ACTION_REQUIRED}</strong> template{counts.ACTION_REQUIRED > 1 ? 's' : ''} rejected by Meta — edit and resubmit
                        </span>
                    </div>
                )}
                {statusChanges.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-semibold text-blue-800">Status Updates</p>
                            <button onClick={() => setStatusChanges([])} className="text-[10px] text-blue-400 hover:text-blue-600">Dismiss</button>
                        </div>
                        {statusChanges.slice(0, 3).map((sc) => {
                            const cfg = STATUS_CONFIG[sc.newStatus];
                            return (
                                <div key={sc.id} className="flex items-center gap-2 text-xs text-blue-700 mt-1">
                                    <cfg.icon size={11} className={cfg.color} />
                                    <span className="font-mono font-semibold">{sc.templateName}</span>
                                    <span className="text-blue-400">→</span>
                                    <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
                                    <span className="text-blue-300 ml-auto">{sc.at}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <TableView
                        templates={filtered}
                        onEdit={(t) => { setEditing(t); setShowForm(true); }}
                        onDelete={handleDelete}
                        onPreview={setPreviewTemplate}
                        onDuplicate={handleDuplicate}
                        onSubmitToMeta={handleSubmitToMeta}
                    />
                )}
            </div>

            {(showForm || editing) && (
                <TemplateForm
                    template={editing}
                    onSubmit={handleCreateTemplate}
                    onClose={() => { setShowForm(false); setEditing(null); }}
                />
            )}

            {previewTemplate && (
                <TemplatePreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
            )}

            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                        <h3 className="font-bold text-gray-900 mb-2">Delete Template?</h3>
                        <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Table View ────────────────────────────────────────────────────────────
function TableView({
    templates, onEdit, onDelete, onPreview, onDuplicate, onSubmitToMeta,
}: {
    templates: Template[];
    onEdit: (t: Template) => void;
    onDelete: (id: string) => void;
    onPreview: (t: Template) => void;
    onDuplicate: (t: Template) => void;
    onSubmitToMeta: (id: string) => void;
}) {
    if (templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 mt-8">
                <FileText size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No templates found</p>
            </div>
        );
    }

    return (
        <div className="mx-6 my-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                            <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cost/msg</th>
                            <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Created</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {templates.map((t) => {
                            const sc = STATUS_CONFIG[t.status];
                            const catCfg = CATEGORY_CONFIG[t.category] || { label: t.category, class: 'text-gray-600 font-bold' };
                            const cost = INR_COST[t.category] || 0;
                            const isApproved = t.status === 'APPROVED';
                            const canSubmit = t.status === 'DRAFT' || t.status === 'REJECTED' || t.status === 'IN_APPEAL';

                            return (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <div>
                                            <button
                                                onClick={() => onEdit(t)}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline font-mono text-left"
                                                title={t.name}
                                            >
                                                {t.name.length > 26 ? t.name.slice(0, 26) + '…' : t.name}
                                            </button>
                                            {t.rejection_reason && (
                                                <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-[200px]" title={t.rejection_reason}>
                                                    {t.rejection_reason}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`text-xs uppercase ${catCfg.class}`}>{catCfg.label}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.badgeClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${t.status === 'PENDING' ? 'animate-pulse' : ''} shrink-0`} />
                                            {sc.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
                                            {t.template_type || 'TEXT'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-0.5">
                                            <IndianRupee size={10} className="text-gray-500" />
                                            {cost.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-xs text-gray-400">
                                            {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => onPreview(t)} title="Preview"
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                                                <Eye size={11} /> Preview
                                            </button>
                                            {!isApproved && (
                                                <button onClick={() => onEdit(t)} title="Edit"
                                                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                                                    <Edit2 size={11} /> Edit
                                                </button>
                                            )}
                                            {isApproved && (
                                                <span className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg cursor-default">
                                                    <Lock size={11} /> Approved
                                                </span>
                                            )}
                                            {canSubmit && (
                                                <button onClick={() => onSubmitToMeta(t.id)} title="Submit to Meta"
                                                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                                                    <Send size={11} />
                                                    {t.status === 'REJECTED' || t.status === 'IN_APPEAL' ? 'Resubmit' : 'Submit'}
                                                </button>
                                            )}
                                            <button onClick={() => onDuplicate(t)} title="Duplicate"
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Copy size={13} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(t.id)}
                                                // disabled={isApproved}
                                                title={isApproved ? 'Cannot delete approved template' : 'Delete'}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="px-5 py-2.5 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{templates.length} template{templates.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Preview Modal ─────────────────────────────────────────────────────────
function TemplatePreviewModal({ template, onClose }: { template: Template; onClose: () => void }) {
    const [varValues, setVarValues] = useState<Record<string, string>>({});
    const varMatches = template.body.match(/\{\{(\d+)\}\}/g) || [];
    const varNumbers = [...new Set(varMatches.map((m) => m.replace(/[{}]/g, '')))];
    const cost = INR_COST[template.category] || 0;
    const sc = STATUS_CONFIG[template.status];

    const previewBody = template.body.replace(/\{\{(\d+)\}\}/g, (_, n) => {
        const v = varValues[n] || template.variables?.[Number(n) - 1];
        return v ? v : `[var ${n}]`;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-bold text-gray-900 font-mono text-sm">{template.name}</h2>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {sc.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-bold uppercase ${CATEGORY_CONFIG[template.category]?.class}`}>{template.category}</span>
                            <span className="text-xs text-gray-400">{template.template_type || 'TEXT'}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-0.5"><IndianRupee size={10} />{cost.toFixed(2)}/conv</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                        <XCircle size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {template.rejection_reason && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                            <span><strong>Rejection reason:</strong> {template.rejection_reason}</span>
                        </div>
                    )}

                    {varNumbers.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Test Variables</p>
                            {varNumbers.map((n) => (
                                <div key={n} className="flex items-center gap-2">
                                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded font-mono w-10 text-center shrink-0">{`{{${n}}}`}</span>
                                    <input
                                        value={varValues[n] || ''}
                                        onChange={(e) => setVarValues((v) => ({ ...v, [n]: e.target.value }))}
                                        placeholder={template.variables?.[Number(n) - 1] || `Variable ${n}`}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="rounded-2xl p-4" style={{ background: '#e5ddd5' }}>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xs ml-auto">
                            {template.header_type === 'TEXT' && template.header_text && (
                                <div className="px-3 pt-3 pb-1 border-b border-gray-50">
                                    <p className="font-bold text-sm text-gray-900">{template.header_text}</p>
                                </div>
                            )}
                            {template.header_type && template.header_type !== 'TEXT' && (
                                <div className="w-full h-20 bg-gray-100 flex items-center justify-center border-b border-gray-50">
                                    <span className="text-xs text-gray-400 font-medium">{template.header_type}</span>
                                </div>
                            )}
                            <div className="px-3 pt-2 pb-2">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{previewBody}</p>
                                {template.footer && <p className="text-xs text-gray-400 mt-1.5 italic">{template.footer}</p>}
                                <p className="text-[9px] text-gray-300 text-right mt-1.5">10:30 AM</p>
                            </div>
                            {template.buttons && template.buttons.length > 0 && (
                                <div className="border-t border-gray-100">
                                    {template.buttons.map((btn, i) => (
                                        <div key={i} className={`text-center text-xs font-semibold text-blue-500 py-2 cursor-pointer hover:bg-blue-50 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                                            {btn.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}