// src/components/templates/TemplatesPage.tsx
import { useState, useEffect, useRef } from 'react';
import {
    Plus, FileText, CheckCircle, XCircle, Clock, AlertTriangle,
    Trash2, Send, Search, RefreshCw, Bell, DollarSign, Eye, Variable,
} from 'lucide-react';
import { useTemplates } from '../../hooks/useTemplates';
import type { Template, TemplateStatus } from '../../types';
import TemplateForm from './TemplateForm';

// Default fallback for unknown statuses
const DEFAULT_STATUS_CONFIG = {
    icon: AlertTriangle,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    label: 'Unknown',
};

const STATUS_CONFIG: Record<TemplateStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    APPROVED: { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Approved' },
    PENDING: { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending Review' },
    REJECTED: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', label: 'Rejected' },
    IN_APPEAL: { icon: AlertTriangle, color: 'text-orange-700', bg: 'bg-orange-50', label: 'In Appeal' },
};

const CATEGORY_COLORS = {
    MARKETING: 'bg-blue-50 text-blue-700 border-blue-100',
    UTILITY: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    AUTHENTICATION: 'bg-orange-50 text-orange-700 border-orange-100',
};

const META_COST: Record<string, number> = {
    MARKETING: 0.0082,
    UTILITY: 0.0042,
    AUTHENTICATION: 0.0042,
};

interface StatusNotification {
    id: string;
    templateName: string;
    oldStatus: TemplateStatus;
    newStatus: TemplateStatus;
    at: string;
   
}

export default function TemplatesPage() {
    const { templates, loading, createTemplate, updateTemplate, deleteTemplate, submitToMeta, refresh }:any = useTemplates();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Template | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'ALL'>('ALL');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<StatusNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [polling, setPolling] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const prevStatusRef = useRef<Record<string, TemplateStatus>>({});

    useEffect(() => {
        if (templates.length > 0) {
            templates.forEach((t) => {
                const prev = prevStatusRef.current[t.id];
                if (prev && prev !== t.status) {
                    setNotifications((n) => [
                        {
                            id: `${t.id}-${Date.now()}`,
                            templateName: t.name,
                            oldStatus: prev,
                            newStatus: t.status,
                            at: new Date().toLocaleTimeString(),
                        },
                        ...n,
                    ].slice(0, 20));
                }
            });
            const newMap: Record<string, TemplateStatus> = {};
            templates.forEach((t) => { newMap[t.id] = t.status; });
            prevStatusRef.current = newMap;
        }
    }, [templates]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const pending = templates.filter((t) => t.status === 'PENDING' || t.status === 'IN_APPEAL');
            if (pending.length > 0) {
                setPolling(true);
                await refresh();
                setPolling(false);
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [templates, refresh]);

    const handleRefresh = async () => {
        setPolling(true);
        await refresh();
        setPolling(false);
    };

    const filtered = templates.filter((t) => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.body.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleDelete = async (id: string) => {
        await deleteTemplate(id);
        setConfirmDelete(null);
    };

    const handleSubmit = async (data: Partial<Template>) => {
        if (editing) {
            await updateTemplate(editing.id, data);
        } else {
            await createTemplate(data as Parameters<typeof createTemplate>[0]);
        }
        setShowForm(false);
        setEditing(null);
    };

    const statusCounts: Record<string, number> = {
        ALL: templates.length,
        APPROVED: templates.filter((t) => t.status === 'APPROVED').length,
        PENDING: templates.filter((t) => t.status === 'PENDING').length,
        REJECTED: templates.filter((t) => t.status === 'REJECTED').length,
        IN_APPEAL: templates.filter((t) => t.status === 'IN_APPEAL').length,
    };

    // Helper to safely get status config
    const getStatusConfig = (status: TemplateStatus) => {
        return STATUS_CONFIG[status] || { ...DEFAULT_STATUS_CONFIG, label: status || 'Unknown' };
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <FileText size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Templates</h1>
                            <p className="text-xs text-gray-400">WhatsApp message templates — Meta reviewed</p>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {templates.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications((v) => !v)}
                                className={`relative p-2 rounded-lg border transition-colors ${showNotifications ? 'bg-emerald-50 border-emerald-200' : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <Bell size={16} className={notifications.length > 0 ? 'text-emerald-600' : 'text-gray-400'} />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {notifications.length > 9 ? '9+' : notifications.length}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">Approval Updates</p>
                                        <button
                                            onClick={() => { setNotifications([]); setShowNotifications(false); }}
                                            className="text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="text-sm text-gray-400 text-center py-6">No status changes yet</p>
                                        ) : (
                                            notifications.map((n) => {
                                                const newCfg = getStatusConfig(n.newStatus);
                                                const NewIcon = newCfg.icon;
                                                return (
                                                    <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <NewIcon size={13} className={newCfg.color} />
                                                            <p className="text-sm font-medium text-gray-900 truncate">{n.templateName}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {n.oldStatus} <span className="text-gray-300 mx-1">→</span>
                                                            <span className={`font-semibold ${newCfg.color}`}>{n.newStatus}</span>
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">{n.at}</p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={polling}
                            title="Refresh template statuses"
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw size={15} className={polling ? 'animate-spin text-emerald-500' : ''} />
                        </button>

                        <button
                            onClick={() => { setEditing(null); setShowForm(true); }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            <Plus size={16} />
                            New Template
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        {(['ALL', 'APPROVED', 'PENDING', 'REJECTED', 'IN_APPEAL'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === s
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {s.replace('_', ' ')}
                                <span className={`text-[10px] font-bold ${statusFilter === s ? 'opacity-80' : 'text-gray-400'}`}>
                                    {statusCounts[s]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {statusCounts['PENDING'] > 0 && (
                    <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                        <Clock size={13} className="shrink-0" />
                        <span>
                            <strong>{statusCounts['PENDING']}</strong> template{statusCounts['PENDING'] > 1 ? 's' : ''} pending Meta review.
                            Auto-checking every 30 sec.
                            {polling && <span className="ml-1 font-semibold text-amber-700">Checking now...</span>}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <FileText size={32} className="mb-2 opacity-50" />
                        <p>No templates found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((template) => {
                            const status = getStatusConfig(template.status);
                            const StatusIcon = status.icon;
                            const varCount = (template.variables?.length || 0) || (template.body.match(/\{\{\d+\}\}/g) || []).length;
                            const cost = META_COST[template.category] || 0;

                            return (
                                <div key={template.id} className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm truncate">{template.name}</h3>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${CATEGORY_COLORS[template.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-50 text-gray-600'}`}>
                                                        {template.category}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{template.language.toUpperCase()}</span>
                                                    {varCount > 0 && (
                                                        <span className="flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">
                                                            <Variable size={9} />
                                                            {varCount} var{varCount > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color} shrink-0 ml-2`}>
                                                <StatusIcon size={12} />
                                                {status.label}
                                            </span>
                                        </div>

                                        {template.header_text && (
                                            <p className="text-xs font-semibold text-gray-700 mb-1 truncate">{template.header_text}</p>
                                        )}

                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
                                            {template.body.replace(/\{\{(\d+)\}\}/g, (_, n) => `[var${n}]`)}
                                        </p>

                                        {template.footer && (
                                            <p className="text-xs text-gray-400 italic mb-2 truncate">{template.footer}</p>
                                        )}

                                        {template.buttons && template.buttons.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {template.buttons.map((btn, i) => (
                                                    <span key={i} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        {btn.text}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {template.rejection_reason && (
                                            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                                                <p className="text-xs text-red-600 font-medium mb-0.5">Rejection reason:</p>
                                                <p className="text-xs text-red-500">{template.rejection_reason}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <DollarSign size={11} />
                                                <span>{cost === 0 ? 'Free' : `$${cost.toFixed(4)}/conv`}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setPreviewTemplate(template)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Preview"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setEditing(template); setShowForm(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FileText size={14} />
                                                </button>
                                                {template.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => submitToMeta(template.id)}
                                                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                                                    >
                                                        <Send size={11} />
                                                        Submit
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setConfirmDelete(template.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {(showForm || editing) && (
                <TemplateForm
                    template={editing}
                    onSubmit={handleSubmit}
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
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TemplatePreviewModal({ template, onClose }: { template: Template; onClose: () => void }) {
    const [varValues, setVarValues] = useState<Record<string, string>>({});
    const varMatches = template.body.match(/\{\{(\d+)\}\}/g) || [];
    const varNumbers = [...new Set(varMatches.map((m) => m.replace(/[{}]/g, '')))];

    const previewBody = template.body.replace(/\{\{(\d+)\}\}/g, (_, n) =>
        varValues[n] || `[Variable ${n}]`
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Template Preview — {template.name}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        <XCircle size={18} />
                    </button>
                </div>
                <div className="p-6">
                    {varNumbers.length > 0 && (
                        <div className="mb-4 space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Fill Test Variables</p>
                            {varNumbers.map((n) => (
                                <div key={n} className="flex items-center gap-3">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono w-16 text-center shrink-0">
                                        {`{{${n}}}`}
                                    </span>
                                    <input
                                        value={varValues[n] || ''}
                                        onChange={(e) => setVarValues((v) => ({ ...v, [n]: e.target.value }))}
                                        placeholder={`Variable ${n} value`}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-[#e5ddd5] rounded-2xl p-4 shadow-inner">
                        <div className="bg-white rounded-xl shadow-sm p-4 max-w-xs ml-auto">
                            {template.header_type === 'TEXT' && template.header_text && (
                                <p className="font-bold text-sm mb-2 text-gray-900">{template.header_text}</p>
                            )}
                            {template.header_type && template.header_type !== 'TEXT' && (
                                <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">{template.header_type} media</span>
                                </div>
                            )}
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{previewBody}</p>
                            {template.footer && (
                                <p className="text-xs text-gray-400 mt-2 italic">{template.footer}</p>
                            )}
                            {template.buttons && template.buttons.length > 0 && (
                                <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                                    {template.buttons.map((btn, i) => (
                                        <div key={i} className="text-center text-xs font-semibold text-blue-600 py-1.5 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-50">
                                            {btn.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-[10px] text-gray-300 text-right mt-2">12:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}