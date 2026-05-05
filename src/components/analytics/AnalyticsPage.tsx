

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
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase truncate">{label}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                    {subtitle && <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
                </div>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon size={14} className="text-white" />
                </div>
            </div>
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
        <div className="flex flex-col h-full bg-gray-50">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-[10px] sm:text-xs text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm">Last 24 hours</p>
                </div>
            </div>

            {/* Scrollable Content with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-2 py-3 sm:py-3 space-y-4 sm:space-y-6 custom-scrollbar">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    <StatCard
                        icon={Users}
                        label="Total Leads"
                        value={overview.total_contacts}
                        subtitle="All contacts"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={Users}
                        label="New Today"
                        value={overview.new_leads_today}
                        subtitle={`${overview.new_leads_week} this week`}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Open Chats"
                        value={overview.open_conversations}
                        subtitle="Active"
                        color="bg-purple-500"
                    />
                    <StatCard
                        icon={Send}
                        label="Sent"
                        value={overview.messages_sent_today}
                        subtitle="Last 24h"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Received"
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

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Message Volume Card - Scrollable */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-2 flex flex-col h-[320px] sm:h-[340px]">
                        <h2 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
                            <TrendingUp size={14} className="text-emerald-600 sm:hidden" />
                            <TrendingUp size={18} className="text-emerald-600 hidden sm:block" />
                            <span>Message Volume (7 days)</span>
                        </h2>
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                            <div className="space-y-2 sm:space-y-3">
                                {messageVolume.map((day, i) => {
                                    const maxValue = Math.max(...messageVolume.map((d) => d.inbound + d.outbound), 1);
                                    const total = day.inbound + day.outbound;
                                    const pct = (total / maxValue) * 100;

                                    return (
                                        <div key={i}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] sm:text-xs font-medium text-gray-600">{day.date}</span>
                                                <span className="text-[9px] sm:text-xs text-gray-400 font-mono">{total}</span>
                                            </div>
                                            <div className="flex h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-blue-500 transition-all duration-300"
                                                    style={{ width: total > 0 ? `${(day.inbound / total) * pct}%` : '0%' }}
                                                />
                                                <div
                                                    className="bg-emerald-500 transition-all duration-300"
                                                    style={{ width: total > 0 ? `${(day.outbound / total) * pct}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 text-[10px] sm:text-xs sticky bottom-0 bg-white">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full" />
                                <span className="text-gray-600">Inbound</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full" />
                                <span className="text-gray-600">Outbound</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Stats Card - Scrollable */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex flex-col h-[290px] sm:h-[340px]">
                        <h2 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
                            <Target size={14} className="text-orange-600 sm:hidden" />
                            <Target size={18} className="text-orange-600 hidden sm:block" />
                            <span>Recent Campaigns</span>
                        </h2>
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                            {campaignStats.length === 0 ? (
                                <p className="text-xs sm:text-sm text-gray-400 text-center py-6">No campaigns yet</p>
                            ) : (
                                <div className="space-y-2 sm:space-y-3">
                                    {campaignStats.map((camp, i) => (
                                        <div key={i} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-100 hover:border-gray-200 transition-colors">
                                            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1">{camp.name}</p>
                                                <p className="text-[9px] sm:text-xs text-gray-500 ml-2 bg-white px-1.5 py-0.5 rounded">Total: {camp.sent}</p>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1 sm:gap-2 text-[9px] sm:text-[11px]">
                                                <div className="flex flex-col items-center gap-0.5 bg-blue-50 px-1.5 sm:px-2 py-1.5 rounded">
                                                    <span className="text-blue-700 font-medium">Sent</span>
                                                    <span className="font-bold text-blue-700 text-xs sm:text-sm">{camp.sent}</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5 bg-emerald-50 px-1.5 sm:px-2 py-1.5 rounded">
                                                    <span className="text-emerald-700 font-medium">Delivered</span>
                                                    <span className="font-bold text-emerald-700 text-xs sm:text-sm">{camp.delivered}</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5 bg-purple-50 px-1.5 sm:px-2 py-1.5 rounded">
                                                    <span className="text-purple-700 font-medium">Read</span>
                                                    <span className="font-bold text-purple-700 text-xs sm:text-sm">{camp.read}</span>
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

            {/* Custom Scrollbar Styles - Add to your global CSS or tailwind config */}
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
                
                /* For Firefox */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #c1c1c1 #f1f1f1;
                }
            `}</style>
        </div>
    );
}