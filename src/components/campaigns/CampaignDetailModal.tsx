import { useState, useMemo, useEffect } from 'react';
import {
    X, CheckCircle, Send, AlertCircle, Clock, ArrowLeft,
    RotateCcw, IndianRupee, Users, MessageSquare, Check, Eye,
    Download, Filter, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { Campaign, CampaignLog } from '../../types';
import { whatsappAPI } from '../../lib/whatsappApi';

const INR_PER_MSG: Record<string, number> = {
    MARKETING: 0.68,
    UTILITY: 0.35,
    AUTHENTICATION: 0.35,
};

type LogFilter = 'all' | 'sent' | 'delivered' | 'read' | 'failed' | 'pending';

interface Props {
    campaign: Campaign;
    campaigns: Campaign[];
    onClose: () => void;
    onLaunch: () => Promise<void>;
    onCampaignChange: any;
}

function pct(value: number, total: number) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

const LOG_STATUS_CONFIG = {
    sent: { label: 'Sent', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
    delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    read: { label: 'Read', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', dot: 'bg-teal-500' },
    failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
    pending: { label: 'Pending', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
};

export default function CampaignDetailModal({ campaign, campaigns, onClose, onLaunch, onCampaignChange }: any) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [logFilter, setLogFilter] = useState<LogFilter>('all');
    const [launching, setLaunching] = useState(false);
    const [resending, setResending] = useState<Set<number>>(new Set());
    const [resendingAll, setResendingAll] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 15;

    const rate = INR_PER_MSG[campaign.template?.category || 'MARKETING'] || 0.68;
    const totalCost = campaign.sent_count * rate;

    // Fetch logs from API
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await whatsappAPI.getCampaignLogs(campaign.id);
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch campaign logs:', err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // Refresh logs every 30 seconds if campaign is running
        if (campaign.status === 'running') {
            const interval = setInterval(fetchLogs, 30000);
            return () => clearInterval(interval);
        }
    }, [campaign.id, campaign.status]);

    const filteredLogs = useMemo(() => {
        if (logFilter === 'all') return logs;
        return logs.filter((l) => l.status === logFilter);
    }, [logs, logFilter]);

    const paginatedLogs = filteredLogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filteredLogs.length / PER_PAGE);

    const handleLaunch = async () => {
        setLaunching(true);
        try {
            await onLaunch();
            // Refresh campaign data after launch
            const updatedCampaign = await whatsappAPI.getCampaignById(campaign.id);
            onCampaignChange(updatedCampaign);
            // Start fetching logs
            await fetchLogs();
        } catch (err) {
            console.error('Failed to launch campaign:', err);
        } finally {
            setLaunching(false);
        }
    };

    const handleResend = async (log: CampaignLog) => {
        setResending((prev: any) => new Set([...prev, log.id]));
        try {
            await whatsappAPI.resendMessage(campaign.id, log.id);
            // Refresh logs after resend
            await fetchLogs();
        } catch (err) {
            console.error('Failed to resend message:', err);
        } finally {
            setResending((prev) => {
                const newSet = new Set(prev);
                newSet.delete(Number(log.id));
                return newSet;
            });
        }
    };

    const handleResendAll = async () => {
        setResendingAll(true);
        try {
            await whatsappAPI.resendAllFailed(campaign.id);
            // Refresh logs after resend all
            await fetchLogs();
        } catch (err) {
            console.error('Failed to resend all messages:', err);
        } finally {
            setResendingAll(false);
        }
    };

    const logCounts = {
        all: logs.length,
        sent: logs.filter((l) => l.status === 'sent').length,
        delivered: logs.filter((l) => l.status === 'delivered').length,
        read: logs.filter((l) => l.status === 'read').length,
        failed: logs.filter((l) => l.status === 'failed').length,
        pending: logs.filter((l) => l.status === 'pending').length,
    };

    const statItems = [
        { key: 'all', label: 'Overview', value: campaign.total_contacts, pctVal: 100, color: 'text-gray-700', dot: 'bg-gray-400' },
        { key: 'sent', label: 'Sent', value: campaign.sent_count, pctVal: pct(campaign.sent_count, campaign.total_contacts), color: 'text-blue-600', dot: 'bg-blue-500' },
        { key: 'delivered', label: 'Delivered', value: campaign.delivered_count, pctVal: pct(campaign.delivered_count, campaign.total_contacts), color: 'text-emerald-600', dot: 'bg-emerald-500' },
        { key: 'read', label: 'Read', value: campaign.read_count, pctVal: pct(campaign.read_count, campaign.total_contacts), color: 'text-teal-600', dot: 'bg-teal-500' },
        { key: 'failed', label: 'Failed', value: campaign.failed_count, pctVal: pct(campaign.failed_count, campaign.total_contacts), color: 'text-red-600', dot: 'bg-red-500' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 shrink-0">
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-gray-900 truncate">{campaign.name}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">Template:</span>
                            <span className="text-xs font-medium text-gray-600 font-mono">{campaign.template?.name || '—'}</span>
                            {campaign.template?.category && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{campaign.template.category}</span>
                            )}
                        </div>
                    </div>
                    {(campaign.status === 'draft' || campaign.status === 'paused') && (
                        <button
                            onClick={handleLaunch}
                            disabled={launching}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                        >
                            <Send size={14} />
                            {launching ? 'Launching...' : 'Launch Campaign'}
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Stats bar */}
                <div className="border-b border-gray-100 bg-white shrink-0">
                    <div className="flex overflow-x-auto">
                        {statItems.map((s) => (
                            <button
                                key={s.key}
                                onClick={() => { setLogFilter(s.key as LogFilter); setPage(1); }}
                                className={`flex flex-col items-start px-6 py-4 border-b-2 transition-colors shrink-0 ${logFilter === s.key ? 'border-slate-800' : 'border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`text-sm font-bold ${s.color}`}>
                                        {s.pctVal}%
                                    </span>
                                    <span className="text-gray-400 text-xs">({s.value.toLocaleString('en-IN')})</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                    {s.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Cost + details panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        {/* Left: campaign info */}
                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">Campaign Details</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Campaign Type', value: 'BROADCAST' },
                                        { label: 'Message Type', value: `TEMPLATE (${campaign.template?.category || '—'})` },
                                        { label: 'Template Name', value: campaign.template?.name || '—' },
                                        { label: 'Status', value: campaign.status.toUpperCase() },
                                        { label: 'Audience', value: campaign.total_contacts.toLocaleString('en-IN') },
                                        {
                                            label: 'Created At', value: new Date(campaign.created_at).toLocaleString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                            }),
                                        },
                                        campaign.completed_at ? {
                                            label: 'Completed At', value: new Date(campaign.completed_at).toLocaleString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                            }),
                                        } : null,
                                    ].filter(Boolean).map((item) => (
                                        <div key={item!.label} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{item!.label}</span>
                                            <span className="font-semibold text-gray-800 text-right">{item!.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cost breakdown */}
                            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
                                <h3 className="text-xs font-semibold text-emerald-700 uppercase mb-4 flex items-center gap-1.5">
                                    <IndianRupee size={12} /> Cost Breakdown (INR)
                                </h3>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Rate per message</span>
                                        <span className="font-bold text-gray-800">₹{rate.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Messages sent</span>
                                        <span className="font-bold text-gray-800">{campaign.sent_count.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="h-px bg-emerald-200" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-700 font-semibold">Total Credit Usage</span>
                                        <span className="font-bold text-emerald-800 text-base">₹{totalCost.toFixed(3)}</span>
                                    </div>
                                    {campaign.failed_count > 0 && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-red-500">Failed messages (not charged)</span>
                                            <span className="font-semibold text-red-500">₹0.00</span>
                                        </div>
                                    )}
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                        {[
                                            { label: 'Marketing', value: campaign.template?.category === 'MARKETING' ? totalCost : 0 },
                                            { label: 'Utility', value: campaign.template?.category === 'UTILITY' ? totalCost : 0 },
                                        ].map((c) => (
                                            <div key={c.label} className="bg-white rounded-lg p-2 border border-emerald-100">
                                                <p className="text-gray-500">{c.label} Cost</p>
                                                <p className="font-bold text-gray-800">₹{c.value.toFixed(3)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: delivery stats visual */}
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">Delivery Performance</h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[
                                    { label: 'Sent', value: campaign.sent_count, color: 'bg-blue-100 border-blue-200', text: 'text-blue-700' },
                                    { label: 'Delivered', value: campaign.delivered_count, color: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-700' },
                                    { label: 'Read', value: campaign.read_count, color: 'bg-teal-100 border-teal-200', text: 'text-teal-700' },
                                    { label: 'Failed', value: campaign.failed_count, color: 'bg-red-100 border-red-200', text: 'text-red-700' },
                                ].map((s) => (
                                    <div key={s.label} className={`${s.color} border rounded-xl p-3`}>
                                        <p className={`text-2xl font-bold ${s.text}`}>{s.value.toLocaleString('en-IN')}</p>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className={`text-xs font-medium ${s.text} opacity-70`}>{s.label}</p>
                                            <p className={`text-xs font-bold ${s.text}`}>{pct(s.value, campaign.total_contacts)}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stacked progress */}
                            <div className="space-y-2">
                                {[
                                    { label: 'Sent', value: campaign.sent_count, bar: 'bg-blue-400' },
                                    { label: 'Delivered', value: campaign.delivered_count, bar: 'bg-emerald-400' },
                                    { label: 'Read', value: campaign.read_count, bar: 'bg-teal-400' },
                                    { label: 'Failed', value: campaign.failed_count, bar: 'bg-red-400' },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-16 shrink-0">{s.label}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`${s.bar} h-2 rounded-full transition-all duration-500`}
                                                style={{ width: `${pct(s.value, campaign.total_contacts)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700 w-8 text-right">{pct(s.value, campaign.total_contacts)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Logs */}
                    <div className="px-6 pb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-900">
                                {logFilter === 'failed' ? 'Failed Messages — Smart Segregation' : 'Audience Delivery Log'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {logFilter === 'failed' && campaign.failed_count > 0 && (
                                    <button
                                        onClick={handleResendAll}
                                        disabled={resendingAll}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-60 transition-colors"
                                    >
                                        <RotateCcw size={12} className={resendingAll ? 'animate-spin' : ''} />
                                        {resendingAll ? 'Resending...' : `Resend All Failed (${campaign.failed_count})`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter pills */}
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                            {(Object.keys(logCounts) as LogFilter[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => { setLogFilter(f); setPage(1); }}
                                    className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${logFilter === f
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                    <span className={`font-bold ${logFilter === f ? 'text-white/80' : 'text-gray-400'}`}>
                                        {logCounts[f]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                                <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No {logFilter === 'all' ? '' : logFilter} messages found</p>
                            </div>
                        ) : (
                                    <>
                                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                            {/* Table header */}
                                            <div className="grid grid-cols-12 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                                <div className="col-span-1" />
                                                <div className="col-span-3">Name</div>
                                                <div className="col-span-3">Mobile Number</div>
                                                <div className="col-span-2">Status</div>
                                                <div className="col-span-2">Time</div>
                                                <div className="col-span-1">Action</div>
                                            </div>

                                            <div className="divide-y divide-gray-50">
                                                {paginatedLogs.map((log) => {
                                                    const sc = LOG_STATUS_CONFIG[log.status] || LOG_STATUS_CONFIG.pending;
                                                    const isResending = resending.has(log.id);
                                                    return (
                                                        <div key={log.id} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-gray-50/50 transition-colors">
                                                            <div className="col-span-1">
                                                                <span className={`w-2 h-2 rounded-full ${sc.dot} block`} />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{log.contact?.name || '—'}</p>
                                                            </div>
                                                            <div className="col-span-3">
                                                                <p className="text-sm text-gray-500 font-mono">{log.contact?.phone || '—'}</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color} border ${sc.border}`}>
                                                                    {log.status === 'failed' && <AlertCircle size={9} />}
                                                                    {log.status === 'read' && <Check size={9} />}
                                                                    {log.status === 'delivered' && <CheckCircle size={9} />}
                                                                    {sc.label}
                                                                </span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className="text-xs text-gray-400">
                                                                    {log.sent_at ? new Date(log.sent_at).toLocaleString('en-IN', {
                                                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                                                    }) : '—'}
                                                                </p>
                                                                {log.error_message && (
                                                                    <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-[120px]" title={log.error_message}>
                                                                        {log.error_message}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="col-span-1">
                                                                {log.status === 'failed' && (
                                                                    <button
                                                                        onClick={() => handleResend(log)}
                                                                        disabled={isResending}
                                                                        title="Resend message"
                                                                        className="p-1.5 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                                                                    >
                                                                        <RotateCcw size={13} className={isResending ? 'animate-spin' : ''} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-gray-500">
                                                    {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filteredLogs.length)} of {filteredLogs.length}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                        disabled={page === 1}
                                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                                                    >
                                                        <ChevronLeft size={14} />
                                                    </button>
                                            <span className="text-xs text-gray-600 px-2">{page}/{totalPages}</span>
                                            <button
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}