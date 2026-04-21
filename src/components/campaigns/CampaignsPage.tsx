import { useState } from 'react';
import {
    Megaphone, Plus, Play, Pause, BarChart2, Clock, CheckCircle,
    XCircle, AlertCircle, Send, Eye,
} from 'lucide-react';
import { useCampaigns, useCampaignLogs } from '../../hooks/useCampaigns';
import type { Campaign, CampaignStatus } from '../../types';
import CampaignForm from './CampaignForm';
import CampaignDetailModal from './CampaignDetailModal';

const STATUS_CONFIG: Record<CampaignStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    draft: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Draft' },
    scheduled: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Scheduled' },
    running: { icon: Play, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Running' },
    completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
    paused: { icon: Pause, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Paused' },
};

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 tabular-nums w-7 text-right">{pct}%</span>
        </div>
    );
}

export default function CampaignsPage() {
    const { campaigns, loading, createCampaign, launchCampaign } = useCampaigns();
    const [showForm, setShowForm] = useState(false);
    const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Megaphone size={20} className="text-emerald-600" />
                        <h1 className="text-xl font-bold text-gray-900">Campaigns</h1>
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {campaigns.length}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        <Plus size={16} />
                        New Campaign
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Megaphone size={40} className="mb-3 opacity-30" />
                        <p className="text-lg font-medium">No campaigns yet</p>
                        <p className="text-sm mt-1">Create your first bulk WhatsApp campaign</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {campaigns.map((campaign) => {
                            const status = STATUS_CONFIG[campaign.status];
                            const StatusIcon = status.icon;
                            const canLaunch = campaign.status === 'draft' || campaign.status === 'paused';

                            return (
                                <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 ${status.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                            <StatusIcon size={18} className={status.color} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                                                        {campaign.template && (
                                                            <span className="text-xs text-gray-400">
                                                                Template: <span className="font-medium text-gray-600">{campaign.template.name}</span>
                                                            </span>
                                                        )}
                                                        {campaign.scheduled_at && (
                                                            <span className="text-xs text-gray-400">
                                                                Scheduled: {new Date(campaign.scheduled_at).toLocaleString('en-IN')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => setDetailCampaign(campaign)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                                                    >
                                                        <Eye size={12} /> Details
                                                    </button>
                                                    {canLaunch && (
                                                        <button
                                                            onClick={() => launchCampaign(campaign.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                                                        >
                                                            <Send size={12} /> Launch
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4 mb-3">
                                                {[
                                                    { label: 'Total', value: campaign.total_contacts, color: 'text-gray-900' },
                                                    { label: 'Sent', value: campaign.sent_count, color: 'text-blue-600' },
                                                    { label: 'Delivered', value: campaign.delivered_count, color: 'text-emerald-600' },
                                                    { label: 'Read', value: campaign.read_count, color: 'text-purple-600' },
                                                ].map(({ label, value, color }) => (
                                                    <div key={label} className="text-center">
                                                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                                                        <p className="text-xs text-gray-400">{label}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {campaign.total_contacts > 0 && (
                                                <div className="space-y-1">
                                                    <ProgressBar value={campaign.sent_count} total={campaign.total_contacts} color="bg-blue-400" />
                                                    <ProgressBar value={campaign.delivered_count} total={campaign.total_contacts} color="bg-emerald-400" />
                                                    <ProgressBar value={campaign.read_count} total={campaign.total_contacts} color="bg-purple-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
                    onClose={() => setDetailCampaign(null)}
                    onLaunch={() => launchCampaign(detailCampaign.id)}
                />
            )}
        </div>
    );
}
