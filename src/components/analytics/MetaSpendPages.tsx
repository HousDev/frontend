// src/components/analytics/MetaSpendPage.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, RefreshCw,
    MessageSquare, Megaphone, Shield, Wrench, Info,
} from 'lucide-react';
import { notificationStore } from '../../lib/notifications';

interface SpendSummary {
    conversation_type: string;
    count: number;
    total_cost: number;
}

interface DailySummary {
    date: string;
    total: number;
    marketing: number;
    utility: number;
    service: number;
    authentication: number;
}

const USD_TO_INR = 84;

const META_RATES_USD: Record<string, Record<string, number>> = {
    IN: { marketing: 0.0082, utility: 0.0042, service: 0.0000, authentication: 0.0042 },
    US: { marketing: 0.0250, utility: 0.0150, service: 0.0000, authentication: 0.0150 },
    BR: { marketing: 0.0125, utility: 0.0080, service: 0.0000, authentication: 0.0080 },
    GB: { marketing: 0.0185, utility: 0.0105, service: 0.0000, authentication: 0.0105 },
    DEFAULT: { marketing: 0.0160, utility: 0.0090, service: 0.0000, authentication: 0.0090 },
};

const META_RATES: Record<string, Record<string, number>> = Object.fromEntries(
    Object.entries(META_RATES_USD).map(([cc, rates]) => [
        cc,
        Object.fromEntries(Object.entries(rates).map(([type, usd]) => [type, usd * USD_TO_INR])),
    ])
);

const fmt = (inr: number) => inr === 0 ? 'FREE' : `₹${inr.toFixed(3)}`;

const TYPE_CONFIG = {
    marketing: { label: 'Marketing', icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    utility: { label: 'Utility', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    service: { label: 'Service', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    authentication: { label: 'Authentication', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
};

// Helper to generate mock spend data
const generateMockSpendData = (days: number, rates: Record<string, number>) => {
    const summary: SpendSummary[] = [];
    const dailyMap: Record<string, DailySummary> = {};

    const types = ['marketing', 'utility', 'service', 'authentication'];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today.getTime() - i * 86400000);
        const dateStr = date.toISOString().slice(0, 10);
        if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { date: dateStr, total: 0, marketing: 0, utility: 0, service: 0, authentication: 0 };
        }

        for (const type of types) {
            // Simulate random message count (decreasing as we go back)
            const count = Math.floor(Math.random() * 50) + (days - i) * 2;
            const costUSD = count * (rates[type] / USD_TO_INR);
            dailyMap[dateStr][type as keyof Omit<DailySummary, 'date' | 'total'>] += costUSD;
            dailyMap[dateStr].total += costUSD;
        }
    }

    // Build summary
    const totals: Record<string, { count: number; total_cost: number }> = {};
    for (const type of types) {
        totals[type] = { count: 0, total_cost: 0 };
    }

    Object.values(dailyMap).forEach(day => {
        for (const type of types) {
            totals[type].total_cost += day[type as keyof Omit<DailySummary, 'date' | 'total'>] as number;
            // Approximate count: assume average cost per message = rate, so count = cost / (rate)
            const rate = rates[type] / USD_TO_INR;
            if (rate > 0) {
                totals[type].count += Math.round((day[type as keyof Omit<DailySummary, 'date' | 'total'>] as number) / rate);
            }
        }
    });

    for (const type of types) {
        summary.push({
            conversation_type: type,
            count: totals[type].count,
            total_cost: totals[type].total_cost,
        });
    }

    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    return { summary, daily };
};

export default function MetaSpendPage() {
    const [summary, setSummary] = useState<SpendSummary[]>([]);
    const [daily, setDaily] = useState<DailySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
    const [countryCode, setCountryCode] = useState('IN');
    const [liveEstimate, setLiveEstimate] = useState({ total: 0, thisMonth: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600)); // simulate network delay

        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const rates = META_RATES[countryCode] || META_RATES.DEFAULT;

        // Generate mock spend data
        const { summary: mockSummary, daily: mockDaily } = generateMockSpendData(days, rates);
        setSummary(mockSummary);
        setDaily(mockDaily);

        // Simulate live estimate (based on total messages from mock data)
        const totalMessages = mockSummary.reduce((sum, s) => sum + s.count, 0);
        const avgRate = (rates.marketing + rates.utility + rates.service + rates.authentication) / 4;
        const thisMonthMessages = Math.floor(totalMessages * 0.3); // roughly 30% of total
        setLiveEstimate({
            total: totalMessages * avgRate,
            thisMonth: thisMonthMessages * avgRate,
        });

        setLoading(false);
    }, [period, countryCode]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
        notificationStore.push('success', 'Refreshed', 'Spend data updated.', { label: "", page: "" });
    };

    const totalSpent = summary.reduce((s, r) => s + r.total_cost, 0);
    const totalMessages = summary.reduce((s, r) => s + r.count, 0);
    const rates = META_RATES[countryCode] || META_RATES.DEFAULT;
    const maxDailyTotal = daily.reduce((max, d) => Math.max(max, d.total), 0);

    return (
        <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
            <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <DollarSign size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Meta Spend</h1>
                            <p className="text-xs text-gray-400">Dynamic cost tracking based on Meta pricing policy</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="IN">India (INR region)</option>
                            <option value="US">USA</option>
                            <option value="BR">Brazil</option>
                            <option value="GB">UK</option>
                            <option value="DEFAULT">Other</option>
                        </select>
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                            {(['7d', '30d', '90d'] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    <StatCard
                        label="Total Spent"
                        value={`₹${(totalSpent * USD_TO_INR).toFixed(2)}`}
                        sub={`${totalMessages} messages tracked`}
                        icon={DollarSign}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                    <StatCard
                        label="This Month (Est.)"
                        value={`₹${liveEstimate.thisMonth.toFixed(2)}`}
                        sub="Based on avg rate"
                        icon={TrendingUp}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <StatCard
                        label="Avg Cost / Message"
                        value={totalMessages > 0 ? `₹${(totalSpent * USD_TO_INR / totalMessages).toFixed(4)}` : '₹0.0000'}
                        sub="All conversation types"
                        icon={MessageSquare}
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                    <StatCard
                        label="Free Messages"
                        value="Service"
                        sub="$0.00 per conversation"
                        icon={Shield}
                        color="text-teal-600"
                        bg="bg-teal-50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Spend by Type</h3>
                        <div className="space-y-3">
                            {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                                const row = summary.find((s) => s.conversation_type === type);
                                const count = row?.count || 0;
                                const cost = row?.total_cost || 0;
                                const Icon = config.icon;
                                const maxCount = Math.max(...summary.map((s) => s.count), 1);
                                const pct = (count / maxCount) * 100;

                                return (
                                    <div key={type}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 ${config.bg} rounded-lg flex items-center justify-center`}>
                                                    <Icon size={13} className={config.color} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-800">{config.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-gray-900">₹{(cost * USD_TO_INR).toFixed(2)}</span>
                                                <span className="text-xs text-gray-400 ml-1.5">{count} msgs</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${config.bg.replace('bg-', 'bg-').replace('-50', '-400')} transition-all`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-1">Current Rates</h3>
                        <p className="text-xs text-gray-400 mb-4">Meta Cloud API pricing for {countryCode} (USD per conversation)</p>
                        <div className="space-y-2">
                            {Object.entries(rates).map(([type, rate]) => {
                                const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
                                if (!config) return null;
                                const Icon = config.icon;
                                return (
                                    <div key={type} className={`flex items-center justify-between p-3 ${config.bg} ${config.border} border rounded-xl`}>
                                        <div className="flex items-center gap-2">
                                            <Icon size={14} className={config.color} />
                                            <span className="text-sm font-medium text-gray-800">{config.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-bold ${config.color}`}>
                                                {fmt(rate)}
                                            </span>
                                            {type === 'service' && (
                                                <p className="text-[10px] text-gray-400">24-hr window</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex gap-2">
                            <Info size={13} className="text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                Service conversations (initiated by user) are <strong>free</strong> within the 24-hour window.
                                Marketing conversations have the highest cost. Use templates wisely to maximize ROI.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Daily Spend Trend ({period})</h3>
                    {daily.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400">
                            <p className="text-sm">No spend data for this period</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="flex items-end gap-1 min-w-max" style={{ height: '120px' }}>
                                {daily.map((d) => {
                                    const barH = maxDailyTotal > 0 ? (d.total / maxDailyTotal) * 100 : 0;
                                    return (
                                        <div key={d.date} className="flex flex-col items-center gap-1 group">
                                            <div
                                                className="relative w-8 bg-emerald-100 rounded-t-sm hover:bg-emerald-200 transition-colors cursor-default"
                                                style={{ height: `${Math.max(barH, 2)}%`, minHeight: '4px' }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    ₹{(d.total * USD_TO_INR).toFixed(3)}
                                                </div>
                                            </div>
                                            <span className="text-[9px] text-gray-400 -rotate-45 whitespace-nowrap">
                                                {d.date.slice(5)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-2">Cost Saving Tips</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { tip: 'Use service window (24hr)', detail: 'Reply within 24 hours of customer message — it\'s free.', save: 'Saves up to ₹0.69/msg' },
                            { tip: 'Batch marketing campaigns', detail: 'Group outreach to minimize per-conversation overhead.', save: 'Reduces template costs' },
                            { tip: 'Enable AI auto-replies', detail: 'AI handles routine queries without starting new paid windows.', save: 'Keeps service window open' },
                            { tip: 'Template quality matters', detail: 'High-quality templates get approved faster and have better delivery.', save: 'Avoids failed sends' },
                        ].map(({ tip, detail, save }) => (
                            <div key={tip} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="font-semibold text-emerald-900 text-sm mb-1">{tip}</p>
                                <p className="text-xs text-emerald-700">{detail}</p>
                                <span className="inline-block mt-2 text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{save}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: {
    label: string; value: string; sub: string;
    icon: React.ElementType; color: string; bg: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={16} className={color} />
                </div>
            </div>
            <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
            <p className="text-xs text-gray-400">{sub}</p>
        </div>
    );
}