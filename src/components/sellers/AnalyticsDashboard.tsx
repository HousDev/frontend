import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Eye, Users, Target, Calendar, Building, Bot, Brain,
  Globe, Download, RefreshCw, ArrowUp, ArrowDown, CheckCircle, AlertCircle, Clock,
} from 'lucide-react';

type Period = '7d' | '30d' | '90d' | '1y';
type MetricColor = 'blue' | 'green' | 'purple' | 'orange';
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;

interface PerformanceMetric {
  label: string; value: string; change: string; trend: 'up' | 'down';
  color: MetricColor; icon: IconComponent; description: string;
}
interface TrafficSource {
  source: string; views: number; inquiries: number; percentage: number; color: MetricColor;
}

const colorMap: Record<MetricColor, { bg100: string; text600: string; dot: string }> = {
  blue:   { bg100: 'bg-blue-100',   text600: 'text-blue-600',   dot: 'bg-blue-500'   },
  green:  { bg100: 'bg-green-100',  text600: 'text-green-600',  dot: 'bg-green-500'  },
  purple: { bg100: 'bg-purple-100', text600: 'text-purple-600', dot: 'bg-purple-500' },
  orange: { bg100: 'bg-orange-100', text600: 'text-orange-600', dot: 'bg-orange-500' },
};

const AnalyticsDashboard = ({ seller }: { seller?: unknown }) => {
  const [selectedPeriod, setSelectedPeriod]     = useState<Period>('30d');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [autoRefresh, setAutoRefresh]           = useState(true);
  const [lastUpdated, setLastUpdated]           = useState(new Date());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => { setLastUpdated(new Date()); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const periods: { value: Period; label: string }[] = [
    { value: '7d',  label: 'Last 7 Days'    },
    { value: '30d', label: 'Last 30 Days'   },
    { value: '90d', label: 'Last 3 Months'  },
    { value: '1y',  label: 'Last Year'      },
  ];
  const properties = [
    { value: 'all',    label: 'All Properties'    },
    { value: 'PROP001',label: 'Skyline Towers'    },
    { value: 'PROP002',label: 'Green Valley Villa'},
  ];

  const performanceMetrics: PerformanceMetric[] = [
    { label: 'Total Views',      value: '2,847', change: '+23.5%', trend: 'up', color: 'blue',   icon: Eye,       description: 'Property page views across all platforms'  },
    { label: 'Inquiries',        value: '156',   change: '+18.2%', trend: 'up', color: 'green',  icon: Users,     description: 'Direct inquiries from potential buyers'     },
    { label: 'Site Visits',      value: '23',    change: '+12.1%', trend: 'up', color: 'purple', icon: Target,    description: 'Physical property visits scheduled'        },
    { label: 'Conversion Rate',  value: '14.7%', change: '+2.3%',  trend: 'up', color: 'orange', icon: TrendingUp,description: 'Inquiry to visit conversion rate'          },
  ];

  const marketAnalysis = {
    pricePosition: { percentile: 78, comparison: 'Above average', recommendation: 'Competitively priced', marketPrice: 24_500_000, yourPrice: 25_000_000, difference: '+2.04%' },
    demandLevel:   { score: 85, level: 'High', factors: ['Prime location','Good amenities','Ready to move'], trend: 'increasing' },
    competitorAnalysis: { similarProperties: 12, averagePrice: 24_200_000, averageDaysOnMarket: 45, yourDaysOnMarket: 28 },
  };

  const aiInsights = [
    { type: 'price_optimization', title: 'Price Optimization',       insight: 'Your property is priced 2% above market average, which is optimal for your location and amenities.', confidence: 92, action: 'Maintain current pricing',             impact: 'Medium' as const },
    { type: 'marketing_boost',    title: 'Marketing Performance',     insight: 'Adding professional photos could increase inquiry rate by 40% based on similar properties.',         confidence: 87, action: 'Schedule professional photoshoot',      impact: 'High'   as const },
    { type: 'timing_analysis',    title: 'Market Timing',             insight: 'Current market conditions in Andheri West are favorable for sellers with 15% higher activity.',      confidence: 78, action: 'Accelerate marketing efforts',          impact: 'High'   as const },
    { type: 'buyer_behavior',     title: 'Buyer Behavior Analysis',   insight: 'Most inquiries come from families looking for ready-to-move properties in your price range.',        confidence: 85, action: 'Highlight ready possession in marketing',impact: 'Medium' as const },
  ];

  const trafficSources: TrafficSource[] = [
    { source: 'MagicBricks',    views: 1247, inquiries: 67, percentage: 43.8, color: 'blue'   },
    { source: '99acres',        views: 892,  inquiries: 45, percentage: 31.3, color: 'green'  },
    { source: 'Housing.com',    views: 456,  inquiries: 28, percentage: 16.0, color: 'purple' },
    { source: 'Direct/Referral',views: 252,  inquiries: 16, percentage: 8.9,  color: 'orange' },
  ];

  const visitorDemographics = {
    ageGroups:    [{ range: '25-35', percentage: 45 },{ range: '35-45', percentage: 35 },{ range: '45-55', percentage: 15 },{ range: '55+', percentage: 5 }],
    budgetRanges: [{ range: '₹2-2.5Cr', percentage: 40 },{ range: '₹2.5-3Cr', percentage: 35 },{ range: '₹3-3.5Cr', percentage: 20 },{ range: '₹3.5Cr+', percentage: 5 }],
    locations:    [{ area: 'Andheri West', percentage: 30 },{ area: 'Bandra West', percentage: 25 },{ area: 'Juhu', percentage: 20 },{ area: 'Other Mumbai', percentage: 15 },{ area: 'Outside Mumbai', percentage: 10 }],
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
    if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const exportAnalytics = () => alert('Analytics report exported successfully!');

  const impactClass = (impact: 'High' | 'Medium' | 'Low') =>
    impact === 'High'   ? 'bg-red-100 text-red-700'    :
    impact === 'Medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700';

  /* ---- bar helper ---- */
  const Bar = ({ pct, color }: { pct: number; color: string }) => (
    <div className="flex items-center gap-1.5">
      <div className="w-14 bg-gray-200 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-800">{pct}%</span>
    </div>
  );

  return (
    <div className="space-y-3 px-0 sm:px-0 lg:px-0 pb-4 pt-0">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-2 pt-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Comprehensive performance insights and AI-powered recommendations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock size={11} />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1.5 rounded-lg transition-colors ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}
            title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
          </button>
          <button onClick={exportAnalytics} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-semibold hover:bg-blue-700 transition-colors">
            <Download size={11} />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-gray-400" />
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value as Period)} className="px-2 py-1 border border-gray-200 rounded-md text-[10px] focus:ring-1 focus:ring-blue-400">
            {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <Building size={11} className="text-gray-400" />
          <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} className="px-2 py-1 border border-gray-200 rounded-md text-[10px] focus:ring-1 focus:ring-blue-400">
            {properties.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {performanceMetrics.map((m, i) => {
          const Icon   = m.icon;
          const colors = colorMap[m.color];
          const up     = m.trend === 'up';
          return (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-2.5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${colors.bg100}`}>
                  <Icon size={13} className={colors.text600} />
                </div>
                <div className={`flex items-center gap-0.5 text-[9px] font-bold ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {m.change}
                </div>
              </div>
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">{m.label}</p>
              <p className="text-base font-extrabold text-gray-900 leading-tight mt-0.5">{m.value}</p>
              <p className="text-[8px] text-gray-400 mt-1 leading-snug">{m.description}</p>
            </div>
          );
        })}
      </div>

      {/* ── AI Insights ── */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Bot className="text-white" size={13} />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-gray-900">AI-Powered Insights</h3>
            <p className="text-[9px] text-gray-500">Smart recommendations to optimize your property performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {aiInsights.map((ins, i) => (
            <div key={i} className="bg-white rounded-lg p-2.5 border border-purple-100">
              <div className="flex items-start justify-between mb-1.5 gap-1">
                <div className="flex items-center gap-1">
                  <Brain className="text-purple-600 shrink-0" size={11} />
                  <span className="text-[8px] font-bold text-purple-700 uppercase tracking-wide">{ins.type.replace('_',' ')}</span>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">{ins.confidence}%</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${impactClass(ins.impact)}`}>{ins.impact}</span>
                </div>
              </div>
              <h4 className="text-[10px] font-bold text-gray-900 mb-1">{ins.title}</h4>
              <p className="text-[9px] text-gray-600 mb-2 leading-snug">{ins.insight}</p>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-1.5 rounded-md text-[9px] font-semibold hover:opacity-90 transition-opacity">
                {ins.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Market Position + Demand ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-[11px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
            <Target size={12} className="text-blue-600" />Market Position
          </h3>
          <div className="bg-blue-50 rounded-lg p-2.5 mb-2">
            <div className="flex justify-between mb-1.5">
              <span className="text-[9px] font-semibold text-blue-700">Price Percentile</span>
              <span className="text-[10px] font-extrabold text-blue-900">{marketAnalysis.pricePosition.percentile}th</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${marketAnalysis.pricePosition.percentile}%` }} />
            </div>
            <p className="text-[8px] text-blue-600 mt-1">{marketAnalysis.pricePosition.comparison}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-[11px] font-bold text-green-600">{formatCurrency(marketAnalysis.pricePosition.marketPrice)}</div>
              <div className="text-[8px] text-green-700">Market Average</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-[11px] font-bold text-purple-600">{formatCurrency(marketAnalysis.pricePosition.yourPrice)}</div>
              <div className="text-[8px] text-purple-700">Your Price</div>
            </div>
          </div>
          <div className="text-center text-[9px] font-bold text-green-600">{marketAnalysis.pricePosition.difference} vs market</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-[11px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-green-600" />Demand Analysis
          </h3>
          <div className="text-center mb-2">
            <div className="text-2xl font-black text-green-600">{marketAnalysis.demandLevel.score}</div>
            <div className="text-[9px] text-green-700 font-semibold">{marketAnalysis.demandLevel.level} Demand</div>
          </div>
          <div className="mb-2">
            <p className="text-[9px] font-semibold text-gray-700 mb-1">Demand Factors:</p>
            {marketAnalysis.demandLevel.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-1">
                <CheckCircle size={9} className="text-green-500 shrink-0" />
                <span className="text-[9px] text-gray-700">{f}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-[8px] text-green-700 font-semibold">Market Trend</p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <TrendingUp size={10} className="text-green-600" />
              <span className="text-[9px] font-bold text-green-800 capitalize">{marketAnalysis.demandLevel.trend}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Traffic Sources ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-[11px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <Globe size={12} className="text-blue-600" />Traffic Sources
        </h3>
        <div className="space-y-1.5">
          {trafficSources.map((src, i) => {
            const c = colorMap[src.color];
            return (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <div>
                    <div className="text-[10px] font-semibold text-gray-900">{src.source}</div>
                    <div className="text-[8px] text-gray-500">{src.views} views · {src.inquiries} inquiries</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-gray-900">{src.percentage}%</div>
                  <div className="text-[8px] text-gray-400">of total traffic</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Visitor Demographics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h4 className="text-[10px] font-bold text-gray-900 mb-2">Age Groups</h4>
          {visitorDemographics.ageGroups.map((g, i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] text-gray-600 w-16 shrink-0">{g.range} yrs</span>
              <Bar pct={g.percentage} color="bg-blue-500" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h4 className="text-[10px] font-bold text-gray-900 mb-2">Budget Ranges</h4>
          {visitorDemographics.budgetRanges.map((r, i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] text-gray-600 w-16 shrink-0">{r.range}</span>
              <Bar pct={r.percentage} color="bg-green-500" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h4 className="text-[10px] font-bold text-gray-900 mb-2">Visitor Locations</h4>
          {visitorDemographics.locations.map((l, i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] text-gray-600 w-20 shrink-0 truncate">{l.area}</span>
              <Bar pct={l.percentage} color="bg-purple-500" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Competitor Analysis ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-[11px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <BarChart3 size={12} className="text-orange-500" />Competitor Analysis
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 bg-orange-50 rounded-lg">
            <div className="text-lg font-black text-orange-600">{marketAnalysis.competitorAnalysis.similarProperties}</div>
            <div className="text-[8px] text-orange-700 font-semibold mt-0.5">Similar Properties</div>
            <div className="text-[7px] text-orange-500 mt-0.5">In your area</div>
          </div>
          <div className="text-center p-2.5 bg-blue-50 rounded-lg">
            <div className="text-lg font-black text-blue-600">{formatCurrency(marketAnalysis.competitorAnalysis.averagePrice)}</div>
            <div className="text-[8px] text-blue-700 font-semibold mt-0.5">Average Price</div>
            <div className="text-[7px] text-blue-500 mt-0.5">Competitor pricing</div>
          </div>
          <div className="text-center p-2.5 bg-green-50 rounded-lg">
            <div className="text-lg font-black text-green-600">{marketAnalysis.competitorAnalysis.yourDaysOnMarket}</div>
            <div className="text-[8px] text-green-700 font-semibold mt-0.5">Days on Market</div>
            <div className="text-[7px] text-green-500 mt-0.5">vs {marketAnalysis.competitorAnalysis.averageDaysOnMarket} avg</div>
          </div>
        </div>
      </div>

      {/* ── Performance Recommendations ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-[11px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <BarChart3 size={12} className="text-yellow-500" />Performance Recommendations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-green-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle size={11} className="text-green-600 shrink-0" />
              <span className="text-[9px] font-bold text-green-800">What's Working Well</span>
            </div>
            <ul className="text-[9px] text-green-700 space-y-1">
              <li>• High inquiry rate (23% above average)</li>
              <li>• Good visitor conversion (65%)</li>
              <li>• Competitive pricing strategy</li>
              <li>• Strong online presence</li>
            </ul>
          </div>
          <div className="bg-orange-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle size={11} className="text-orange-600 shrink-0" />
              <span className="text-[9px] font-bold text-orange-800">Areas for Improvement</span>
            </div>
            <ul className="text-[9px] text-orange-700 space-y-1">
              <li>• Add professional photography</li>
              <li>• Create virtual tour</li>
              <li>• Optimize listing descriptions</li>
              <li>• Increase social media presence</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsDashboard;