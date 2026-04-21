import { TrendingUp, Users, MessageSquare, Send, Eye, Target } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

function StatCard({ icon: Icon, label, value, subtitle, color }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon size={20} className="text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    );
}

export default function AnalyticsPage() {
    const { overview, loading, campaignStats, messageVolume } = useAnalytics();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!overview) return null;

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-auto">
            <div className="px-6 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-400">Last 24 hours</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <StatCard
                        icon={Users}
                        label="Total Leads"
                        value={overview.total_contacts}
                        subtitle="All contacts in CRM"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={Users}
                        label="New Leads (Today)"
                        value={overview.new_leads_today}
                        subtitle={`${overview.new_leads_week} this week`}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Open Conversations"
                        value={overview.open_conversations}
                        subtitle="Active chats"
                        color="bg-purple-500"
                    />
                    <StatCard
                        icon={Send}
                        label="Messages Sent"
                        value={overview.messages_sent_today}
                        subtitle="Last 24h"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Messages Received"
                        value={overview.messages_received_today}
                        subtitle="Last 24h"
                        color="bg-yellow-500"
                    />
                    <StatCard
                        icon={Target}
                        label="Response Rate"
                        value={`${overview.response_rate}%`}
                        subtitle="Outgoing vs incoming"
                        color="bg-orange-500"
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-600" />
                                Message Volume (7 days)
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {messageVolume.map((day, i) => {
                                const maxValue = Math.max(...messageVolume.map((d) => d.inbound + d.outbound), 1);
                                const total = day.inbound + day.outbound;
                                const pct = (total / maxValue) * 100;

                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-600">{day.date}</span>
                                            <span className="text-xs text-gray-400">{total}</span>
                                        </div>
                                        <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-500"
                                                style={{ width: `${(day.inbound / total) * pct}%` }}
                                            />
                                            <div
                                                className="bg-emerald-500"
                                                style={{ width: `${(day.outbound / total) * pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span className="text-gray-600">Inbound</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-gray-600">Outbound</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target size={18} className="text-orange-600" />
                            Recent Campaigns
                        </h2>
                        {campaignStats.length === 0 ? (
                            <p className="text-sm text-gray-400">No campaigns yet</p>
                        ) : (
                            <div className="space-y-3">
                                {campaignStats.map((camp, i) => (
                                    <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">{camp.name}</p>
                                            <p className="text-xs text-gray-500">{camp.sent}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                                            <div className="flex items-center justify-between text-blue-600">
                                                <span>Sent</span>
                                                <span className="font-bold">{camp.sent}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-emerald-600">
                                                <span>Delivered</span>
                                                <span className="font-bold">{camp.delivered}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-purple-600">
                                                <span>Read</span>
                                                <span className="font-bold">{camp.read}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
