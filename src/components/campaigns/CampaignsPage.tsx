
// src/components/campaigns/CampaignsPage.tsx
import { useState, useEffect } from 'react';
import {
    Megaphone, Plus, Play, Pause, BarChart2, Clock, CheckCircle,
    XCircle, AlertCircle, Send, Eye, Search, Filter, RefreshCw,
    TrendingUp, Users, IndianRupee,
    Trash2,
} from 'lucide-react';
import { whatsappAPI } from '../../lib/whatsappApi';
import type { Campaign, CampaignStatus } from '../../types';
import CampaignForm from './CampaignForm';
import CampaignDetailModal from './CampaignDetailModal';

const STATUS_CONFIG: Record<CampaignStatus, { icon: React.ElementType; color: string; bg: string; border: string; label: string; dot: string }> = {
    draft: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', label: 'Draft', dot: 'bg-gray-400' },
    scheduled: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Scheduled', dot: 'bg-blue-500' },
    running: { icon: Play, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Running', dot: 'bg-emerald-500' },
    completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Completed', dot: 'bg-emerald-500' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Failed', dot: 'bg-red-500' },
    paused: { icon: Pause, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Paused', dot: 'bg-amber-500' },
};

const INR_PER_MSG: Record<string, number> = {
    MARKETING: 0.68,
    UTILITY: 0.35,
    AUTHENTICATION: 0.35,
};

function calcCost(campaign: Campaign): number {
    const rate = INR_PER_MSG[campaign.template?.category || 'MARKETING'] || 0.68;
    return campaign.sent_count * rate;
}

function pct(value: number, total: number) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

function StatPill({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    const p = pct(value, total);
    return (
        <div className="flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
            <span className="text-gray-500">{label}</span>
            <span className="font-bold text-gray-800">{p}%</span>
            <span className="text-gray-400">({value})</span>
        </div>
    );
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
    const [refreshing, setRefreshing] = useState(false);
const [selectedCampaigns, setSelectedCampaigns] = useState<Set<number>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const data = await whatsappAPI.getCampaigns();
            setCampaigns(data);
        } catch (err) {
            console.error('Failed to fetch campaigns', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);
    useEffect(() => {
        let socket: any = null;

        const initSocket = async () => {
            const userId = localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user") || "{}").id
                : null;

            if (!userId) return;

            // Import socket.io client
            const { io } = await import('socket.io-client');

            socket = io(import.meta.env.VITE_API_URL || "https://resaleexpert.in", {
                path: "/socket.io",
                transports: ["websocket", "polling"],
                query: { userId: String(userId) },
                withCredentials: true,
            });

            const handleStatsUpdate = ({ campaign_id, stats }: any) => {
                setCampaigns((prev: any[]) =>
                    prev.map(c => c.id === campaign_id ? { ...c, ...stats } : c)
                );
                setDetailCampaign((prev: any) =>
                    prev && prev.id === campaign_id ? { ...prev, ...stats } : prev
                );
            };

            const handleCampaignCompleted = ({ campaign_id, stats }: any) => {
                console.log("🎉 CAMPAIGN_COMPLETED EVENT RECEIVED:", campaign_id, stats);
                setCampaigns((prev: any[]) =>
                    prev.map(c => c.id === campaign_id ? { ...c, ...stats, status: 'completed' } : c)
                );
                setDetailCampaign((prev: any) =>
                    prev && prev.id === campaign_id ? { ...prev, ...stats, status: 'completed' } : prev
                );
            };

            socket.on('campaign_stats_update', handleStatsUpdate);
            socket.on('campaign_completed', handleCampaignCompleted);

            (window as any)._campaignSocket = socket;
        };

        initSocket();

        return () => {
            if ((window as any)._campaignSocket) {
                (window as any)._campaignSocket.disconnect();
                (window as any)._campaignSocket = null;
            }
        };
    }, []);

    const createCampaign = async (data: any) => {
        try {
            const newCampaign = await whatsappAPI.createCampaign(data);
            setCampaigns(prev => [newCampaign, ...prev]);
            return newCampaign;
        } catch (err) {
            console.error('Failed to create campaign', err);
            throw err;
        }
    };

    // const launchCampaign = async (id: any) => {
    //     try {
    //         const result = await whatsappAPI.launchCampaign(id);
    //         setCampaigns(prev => prev.map(c => c.id === id ? result.campaign : c));
    //         return result;
    //     } catch (err) {
    //         console.error('Failed to launch campaign', err);
    //         throw err;
    //     }
    // };
    const launchCampaign = async (id: any) => {
        try {
            const result = await whatsappAPI.launchCampaign(id);
            setCampaigns(prev => prev.map(c => c.id === id ? result.campaign : c));

            // ✅ ADD THIS - Poll for status change every 2 seconds
            const interval = setInterval(async () => {
                const updated = await whatsappAPI.getCampaignById(id);
                if (updated.status === 'completed') {
                    setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
                    clearInterval(interval);
                }
            }, 2000);

            // Stop polling after 30 seconds
            setTimeout(() => clearInterval(interval), 30000);

            return result;
        } catch (err) {
            console.error('Failed to launch campaign', err);
            throw err;
        }
    };

    const refreshCampaigns = async () => {
        setRefreshing(true);
        await fetchCampaigns();
        setRefreshing(false);
    };

    const toggleSelectCampaign = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedCampaigns);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCampaigns(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCampaigns.size === filtered.length) {
      setSelectedCampaigns(new Set());
    } else {
      setSelectedCampaigns(new Set(filtered.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const ids = Array.from(selectedCampaigns);
      await whatsappAPI.bulkDeleteCampaigns(ids);
      setSelectedCampaigns(new Set());
      setShowBulkDeleteConfirm(false);
      await fetchCampaigns();
    } catch (err: any) {
      console.error('Bulk delete failed:', err);
      alert(err.response?.data?.error || 'Failed to delete campaigns');
    } finally {
      setDeleting(false);
    }
  };


    const filtered = campaigns.filter((c) => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.template?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0);
    const totalFailed = campaigns.reduce((s, c) => s + c.failed_count, 0);
    const totalCost = campaigns.reduce((s, c) => s + calcCost(c), 0);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shrink-0">

                {/* Title row */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                            <Megaphone size={16} className="text-emerald-600 sm:hidden" />
                            <Megaphone size={18} className="text-emerald-600 hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-xl font-bold text-gray-900">Campaigns</h1>
                            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">Bulk WhatsApp messaging & live tracking</p>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
                            {campaigns.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            onClick={refreshCampaigns}
                            disabled={refreshing}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            <Plus size={14} />
                            <span className="hidden sm:inline">New Campaign</span>
                            <span className="sm:hidden">New</span>
                        </button>
                    </div>
                </div>

                {/* Summary stats */}
               <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-2 sm:mb-4">
    <div className="bg-blue-50 rounded-xl p-1.5 sm:p-3 border border-blue-100">
        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <Send size={10} className="text-blue-500 sm:hidden" />
                            <Send size={13} className="text-blue-500 hidden sm:block" />
                            <span className="text-[9px] sm:text-xs font-medium text-blue-600">Total Sent</span>
                        </div>
                        <p className="text-xs sm:text-xl font-bold text-blue-800 text-center sm:text-left">{totalSent.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-1.5 sm:p-3 border border-red-100">
                        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <AlertCircle size={10} className="text-red-500 sm:hidden" />
                            <AlertCircle size={13} className="text-red-500 hidden sm:block" />
                            <span className="text-[9px] sm:text-xs font-medium text-red-600">Failed</span>
                        </div>
                        <p className="text-xs sm:text-xl font-bold text-red-800 text-center sm:text-left">{totalFailed.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-1.5 sm:p-3 border border-emerald-100">
                        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <IndianRupee size={10} className="text-emerald-500 sm:hidden" />
                            <IndianRupee size={13} className="text-emerald-500 hidden sm:block" />
                            <span className="text-[9px] sm:text-xs font-medium text-emerald-600">Spend</span>
                        </div>
                        <p className="text-xs sm:text-xl font-bold text-emerald-800 text-center sm:text-left">₹{totalCost.toFixed(2)}</p>
                    </div>
                </div>

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    {/* Filter pills — horizontally scrollable on mobile */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
                        {(['all', 'draft', 'running', 'completed', 'failed', 'scheduled'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition-colors capitalize whitespace-nowrap shrink-0 ${statusFilter === s
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                            </button>
                        ))}
                    </div>
                </div>


                {filtered.length > 0 && (
  <div className="flex items-center gap-2 mt-2 sm:mt-3">
    <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={selectedCampaigns.size === filtered.length && filtered.length > 0}
        onChange={toggleSelectAll}
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
      Select All ({filtered.length})
    </label>
  </div>
)}
            </div>

            {/* Campaign list */}
            <div className="flex-1 overflow-auto p-2 sm:p-2">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Megaphone size={40} className="mb-3 opacity-30" />
                        <p className="text-lg font-medium">No campaigns found</p>
                        <p className="text-sm mt-1">Create your first bulk WhatsApp campaign</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((campaign) => {
                            const sc = STATUS_CONFIG[campaign.status];
                            const StatusIcon = sc.icon;
                            const canLaunch = campaign.status === 'draft' || campaign.status === 'paused';
                            const isRunning = campaign.status === 'running';
                            const cost = calcCost(campaign);
                            const rate = INR_PER_MSG[campaign.template?.category || 'MARKETING'] || 0.68;

                            return (
                                <div
                                    key={campaign.id}
                                    className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                                    onClick={() => setDetailCampaign(campaign)}
                                >
                                    {/* Running progress bar */}
                                    {isRunning && campaign.total_contacts > 0 && (
                                        <div className="h-1 bg-gray-100">
                                            <div
                                                className="h-1 bg-emerald-500 transition-all duration-500"
                                                style={{ width: `${pct(campaign.sent_count, campaign.total_contacts)}%` }}
                                            />
                                        </div>
                                    )}

                                    <div className="p-2 sm:p-5">
    <div className="flex items-start gap-2 sm:gap-4">
          <div onClick={(e) => e.stopPropagation()} className="pt-0.5 sm:pt-1">
    <input
      type="checkbox"
      checked={selectedCampaigns.has(campaign.id)}
      onChange={() => {}} 
      onClick={(e) => toggleSelectCampaign(campaign.id, e)}
      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
    />
  </div>

        <div className={`w-7 h-7 sm:w-10 sm:h-10 ${sc.bg} rounded-xl flex items-center justify-center shrink-0 border ${sc.border}`}>
            <StatusIcon size={14} className={sc.color} />
        </div>

        <div className="flex-1 min-w-0">
            {/* Name + actions row */}
            <div className="flex items-start justify-between gap-1.5 sm:gap-4 mb-0.5 sm:mb-1">
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-xs sm:text-base truncate">{campaign.name}</h3>
                    <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
                        <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold ${sc.color}`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${sc.dot} ${isRunning ? 'animate-pulse' : ''}`} />
                            {sc.label}
                        </span>
                        {campaign.template && (
                            <span className="text-[9px] sm:text-xs text-gray-400 truncate max-w-[80px] sm:max-w-none">
                                {campaign.template.name}
                            </span>
                        )}
                        {campaign.template?.category && (
                            <span className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                                {campaign.template.category}
                            </span>
                        )}
                        {campaign.scheduled_at && (
                            <span className="text-[9px] sm:text-xs text-gray-400 flex items-center gap-0.5 sm:gap-1">
                                <Clock size={9} className="sm:w-[10px] sm:h-[10px]" />
                                {new Date(campaign.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {canLaunch && (
                        <button
                            onClick={(e) => { e.stopPropagation(); launchCampaign(campaign.id); }}
                            className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-white bg-emerald-600 rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            <Send size={10} className="sm:w-[11px] sm:h-[11px]" />
                            <span className="hidden sm:inline">Launch</span>
                            <span className="sm:hidden">L</span>
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); setDetailCampaign(campaign); }}
                        className="flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-gray-600 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <BarChart2 size={10} className="sm:w-[11px] sm:h-[11px]" />
                        <span className="hidden sm:inline">Stats</span>
                        <span className="sm:hidden">S</span>
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="mt-1 sm:mt-3">
                {/* Metrics */}
                <div className="flex items-center gap-1.5 sm:gap-4 mb-1 sm:mb-2 flex-wrap">
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-500">
                        <Users size={9} className="sm:w-[11px] sm:h-[11px] text-gray-400" />
                        <span className="hidden sm:inline">Audience:</span>
                        <span className="font-bold text-gray-800 text-[10px] sm:text-xs">{campaign.total_contacts.toLocaleString('en-IN')}</span>
                    </div>
                    <StatPill label="Sent" value={campaign.sent_count} total={campaign.total_contacts} color="bg-blue-400" />
                    <StatPill label="Delivered" value={campaign.delivered_count} total={campaign.total_contacts} color="bg-emerald-400" />
                    <StatPill label="Read" value={campaign.read_count} total={campaign.total_contacts} color="bg-teal-400" />
                    {campaign.failed_count > 0 && (
                        <StatPill label="Failed" value={campaign.failed_count} total={campaign.total_contacts} color="bg-red-400" />
                    )}
                    {cost > 0 && (
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs sm:ml-auto">
                            <IndianRupee size={9} className="sm:w-[10px] sm:h-[10px] text-gray-400" />
                            <span className="font-bold text-gray-700">₹{cost.toFixed(2)}</span>
                            <span className="text-gray-400 hidden sm:inline">@ ₹{rate.toFixed(2)}/msg</span>
                        </div>
                    )}
                </div>

                {/* Progress bars */}
                {campaign.total_contacts > 0 && (
                    <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex h-1 sm:h-2 bg-gray-100 rounded-full overflow-hidden gap-px">
                            <div className="bg-blue-400 transition-all" style={{ width: `${pct(campaign.sent_count, campaign.total_contacts)}%` }} title={`Sent: ${campaign.sent_count}`} />
                            <div className="bg-emerald-400 transition-all" style={{ width: `${pct(campaign.delivered_count, campaign.total_contacts)}%` }} title={`Delivered: ${campaign.delivered_count}`} />
                            <div className="bg-teal-400 transition-all" style={{ width: `${pct(campaign.read_count, campaign.total_contacts)}%` }} title={`Read: ${campaign.read_count}`} />
                            <div className="bg-red-400 transition-all" style={{ width: `${pct(campaign.failed_count, campaign.total_contacts)}%` }} title={`Failed: ${campaign.failed_count}`} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>


            {/* ✅ ADD BULK ACTION BAR RIGHT HERE */}
{selectedCampaigns.size > 0 && (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-full shadow-lg px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-3 sm:gap-6">
    <span className="text-xs sm:text-sm font-medium">
      {selectedCampaigns.size} selected
    </span>
    <button
      onClick={() => setSelectedCampaigns(new Set())}
      className="text-gray-400 hover:text-white text-xs sm:text-sm"
    >
      Cancel
    </button>
    <button
      onClick={() => setShowBulkDeleteConfirm(true)}
      className="flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-red-700 transition-colors"
    >
      <Trash2 size={14} />
      Delete All
    </button>
  </div>
)}

{/* ✅ ADD CONFIRMATION MODAL */}
{showBulkDeleteConfirm && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Delete Campaigns</h3>
      </div>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete {selectedCampaigns.size} campaign(s)? 
        This action cannot be undone and will also remove all campaign logs.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowBulkDeleteConfirm(false)}
          className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          disabled={deleting}
        >
          Cancel
        </button>
        <button
          onClick={handleBulkDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          {deleting ? 'Deleting...' : `Delete ${selectedCampaigns.size}`}
        </button>
      </div>
    </div>
  </div>
)}

            {showForm && (
                <CampaignForm
                    onSubmit={async (data) => {
                        await createCampaign(data);
                        setShowForm(false);
                    }}
                    onClose={() => setShowForm(false)}
                />
            )}

            {detailCampaign && (
                <CampaignDetailModal
                    campaign={detailCampaign}
                    campaigns={campaigns}
                    onClose={() => setDetailCampaign(null)}
                    onLaunch={() => launchCampaign(detailCampaign.id)}
                    onCampaignChange={(updated: any) => setDetailCampaign(updated)}
                />
            )}
        </div>
    );
}