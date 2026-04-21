import { X, CheckCircle, Send, AlertCircle, Clock } from 'lucide-react';
import type { Campaign } from '../../types';
import { useCampaignLogs } from '../../hooks/useCampaigns';

interface Props {
    campaign: Campaign;
    onClose: () => void;
    onLaunch: () => any;
}

export default function CampaignDetailModal({ campaign, onClose, onLaunch }: Props) {
    const { logs, loading } = useCampaignLogs(campaign.id);

    const stats = [
        { label: 'Total', value: campaign.total_contacts, color: 'text-gray-900' },
        { label: 'Sent', value: campaign.sent_count, color: 'text-blue-600' },
        { label: 'Delivered', value: campaign.delivered_count, color: 'text-emerald-600' },
        { label: 'Read', value: campaign.read_count, color: 'text-purple-600' },
        { label: 'Failed', value: campaign.failed_count, color: 'text-red-600' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="font-bold text-gray-900">{campaign.name}</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {campaign.template?.name && `Template: ${campaign.template.name}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-5 gap-3">
                        {stats.map(({ label, value, color }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                <p className="text-xs text-gray-500 mt-1">{label}</p>
                            </div>
                        ))}
                    </div>

                    {campaign.status === 'draft' && (
                        <button
                            onClick={onLaunch}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            <Send size={16} />
                            Launch Campaign Now
                        </button>
                    )}

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Delivery Status</h3>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : logs.length === 0 ? (
                            <p className="text-sm text-gray-400">No delivery logs yet</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {logs.map((log) => {
                                    const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
                                        sent: { icon: Send, color: 'text-blue-600' },
                                        delivered: { icon: CheckCircle, color: 'text-emerald-600' },
                                        read: { icon: CheckCircle, color: 'text-purple-600' },
                                        failed: { icon: AlertCircle, color: 'text-red-600' },
                                        pending: { icon: Clock, color: 'text-gray-400' },
                                    };
                                    const config = statusConfig[log.status] || statusConfig.pending;
                                    const Icon = config.icon;

                                    return (
                                        <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Icon size={16} className={config.color} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {log.contact?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{log.contact?.phone}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <p className="text-xs font-semibold text-gray-600 uppercase">{log.status}</p>
                                                {log.error_message && (
                                                    <p className="text-[10px] text-red-500">{log.error_message}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
