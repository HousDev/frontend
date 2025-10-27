import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Target,
  Calendar,
  Building,
  Bot,
  Brain,
  Globe,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

type Period = '7d' | '30d' | '90d' | '1y';
type MetricColor = 'blue' | 'green' | 'purple' | 'orange';

// Accept regular SVG props + optional size prop to match lucide-react icon components
type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: string | number }>;

interface PerformanceMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: MetricColor;
  icon: IconComponent;
  description: string;
}

interface TrafficSource {
  source: string;
  views: number;
  inquiries: number;
  percentage: number;
  color: MetricColor;
}

const colorMap: Record<
  MetricColor,
  { bg100: string; text600: string; dot: string }
> = {
  blue: { bg100: 'bg-blue-100', text600: 'text-blue-600', dot: 'bg-blue-500' },
  green: { bg100: 'bg-green-100', text600: 'text-green-600', dot: 'bg-green-500' },
  purple: { bg100: 'bg-purple-100', text600: 'text-purple-600', dot: 'bg-purple-500' },
  orange: { bg100: 'bg-orange-100', text600: 'text-orange-600', dot: 'bg-orange-500' },
};

const AnalyticsDashboard = ({ seller }: { seller?: unknown }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // fetch fresh data here in real app
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
  ];

  const properties = [
    { value: 'all', label: 'All Properties' },
    { value: 'PROP001', label: 'Skyline Towers' },
    { value: 'PROP002', label: 'Green Valley Villa' },
  ];

  // Performance Metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Total Views',
      value: '2,847',
      change: '+23.5%',
      trend: 'up',
      color: 'blue',
      icon: Eye,
      description: 'Property page views across all platforms',
    },
    {
      label: 'Inquiries',
      value: '156',
      change: '+18.2%',
      trend: 'up',
      color: 'green',
      icon: Users,
      description: 'Direct inquiries from potential buyers',
    },
    {
      label: 'Site Visits',
      value: '23',
      change: '+12.1%',
      trend: 'up',
      color: 'purple',
      icon: Target,
      description: 'Physical property visits scheduled',
    },
    {
      label: 'Conversion Rate',
      value: '14.7%',
      change: '+2.3%',
      trend: 'up',
      color: 'orange',
      icon: TrendingUp,
      description: 'Inquiry to visit conversion rate',
    },
  ];

  // Market Analysis
  const marketAnalysis = {
    pricePosition: {
      percentile: 78,
      comparison: 'Above average',
      recommendation: 'Competitively priced',
      marketPrice: 24_500_000,
      yourPrice: 25_000_000,
      difference: '+2.04%',
    },
    demandLevel: {
      score: 85,
      level: 'High',
      factors: ['Prime location', 'Good amenities', 'Ready to move'],
      trend: 'increasing',
    },
    competitorAnalysis: {
      similarProperties: 12,
      averagePrice: 24_200_000,
      averageDaysOnMarket: 45,
      yourDaysOnMarket: 28,
    },
  };

  // AI Insights
  const aiInsights = [
    {
      type: 'price_optimization',
      title: 'Price Optimization',
      insight:
        'Your property is priced 2% above market average, which is optimal for your location and amenities.',
      confidence: 92,
      action: 'Maintain current pricing',
      impact: 'Medium' as const,
    },
    {
      type: 'marketing_boost',
      title: 'Marketing Performance',
      insight:
        'Adding professional photos could increase inquiry rate by 40% based on similar properties.',
      confidence: 87,
      action: 'Schedule professional photoshoot',
      impact: 'High' as const,
    },
    {
      type: 'timing_analysis',
      title: 'Market Timing',
      insight:
        'Current market conditions in Andheri West are favorable for sellers with 15% higher activity.',
      confidence: 78,
      action: 'Accelerate marketing efforts',
      impact: 'High' as const,
    },
    {
      type: 'buyer_behavior',
      title: 'Buyer Behavior Analysis',
      insight:
        'Most inquiries come from families looking for ready-to-move properties in your price range.',
      confidence: 85,
      action: 'Highlight ready possession in marketing',
      impact: 'Medium' as const,
    },
  ];

  // Traffic Sources (fixed duplicate key + added inquiries)
  const trafficSources: TrafficSource[] = [
    { source: 'MagicBricks', views: 1247, inquiries: 67, percentage: 43.8, color: 'blue' },
    { source: '99acres', views: 892, inquiries: 45, percentage: 31.3, color: 'green' },
    { source: 'Housing.com', views: 456, inquiries: 28, percentage: 16.0, color: 'purple' },
    { source: 'Direct/Referral', views: 252, inquiries: 16, percentage: 8.9, color: 'orange' },
  ];

  // Visitor Demographics
  const visitorDemographics = {
    ageGroups: [
      { range: '25-35', percentage: 45, count: 70 },
      { range: '35-45', percentage: 35, count: 55 },
      { range: '45-55', percentage: 15, count: 23 },
      { range: '55+', percentage: 5, count: 8 },
    ],
    budgetRanges: [
      { range: '₹2-2.5Cr', percentage: 40, count: 62 },
      { range: '₹2.5-3Cr', percentage: 35, count: 55 },
      { range: '₹3-3.5Cr', percentage: 20, count: 31 },
      { range: '₹3.5Cr+', percentage: 5, count: 8 },
    ],
    locations: [
      { area: 'Andheri West', percentage: 30, count: 47 },
      { area: 'Bandra West', percentage: 25, count: 39 },
      { area: 'Juhu', percentage: 20, count: 31 },
      { area: 'Other Mumbai', percentage: 15, count: 23 },
      { area: 'Outside Mumbai', percentage: 10, count: 16 },
    ],
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const exportAnalytics = () => {
    const analyticsData = {
      period: selectedPeriod,
      property: selectedProperty,
      metrics: performanceMetrics,
      marketAnalysis,
      aiInsights,
      trafficSources,
      visitorDemographics,
      exportedAt: new Date().toISOString(),
    };
    alert('Analytics report exported successfully!');
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6 pt-0
">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-xs text-gray-600 mt-1">
            Comprehensive performance insights and AI-powered recommendations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={exportAnalytics}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as Period)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Building size={14} className="text-gray-500" />
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              {properties.map((property) => (
                <option key={property.value} value={property.value}>
                  {property.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          const colors = colorMap[metric.color];

          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors.bg100}`}>
                  <Icon size={18} className={colors.text600} />
                </div>
                <div
                  className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                  {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  <span className="text-xs font-medium">{metric.change}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">{metric.label}</p>
                <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Bot className="text-white" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">AI-Powered Insights</h3>
            <p className="text-xs text-gray-600">
              Smart recommendations to optimize your property performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Brain className="text-purple-600" size={14} />
                  <span className="text-xs font-medium text-purple-800 uppercase tracking-wide">
                    {insight.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {insight.confidence}% confidence
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${insight.impact === 'High'
                        ? 'bg-red-100 text-red-700'
                        : insight.impact === 'Medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {insight.impact} impact
                  </span>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-xs">{insight.title}</h4>
              <p className="text-xs text-gray-700 mb-3">{insight.insight}</p>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-xs font-medium">
                {insight.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Market Position Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="mr-2 text-blue-600" size={16} />
            Market Position
          </h3>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-700">Price Percentile</span>
                <span className="text-sm font-bold text-blue-900">
                  {marketAnalysis.pricePosition.percentile}th
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${marketAnalysis.pricePosition.percentile}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {marketAnalysis.pricePosition.comparison}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xs sm:text-sm font-bold text-green-600">
                  {formatCurrency(marketAnalysis.pricePosition.marketPrice)}
                </div>
                <div className="text-xs text-green-700">Market Average</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xs sm:text-sm font-bold text-purple-600">
                  {formatCurrency(marketAnalysis.pricePosition.yourPrice)}
                </div>
                <div className="text-xs text-purple-700">Your Price</div>
              </div>
            </div>

            <div className="text-center">
              <span
                className={`text-xs font-medium ${marketAnalysis.pricePosition.difference.startsWith('+')
                    ? 'text-green-600'
                    : 'text-red-600'
                  }`}
              >
                {marketAnalysis.pricePosition.difference} vs market
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={16} />
            Demand Analysis
          </h3>

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {marketAnalysis.demandLevel.score}
              </div>
              <div className="text-xs text-green-700 font-medium">
                {marketAnalysis.demandLevel.level} Demand
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Demand Factors:</div>
              {marketAnalysis.demandLevel.factors.map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={10} />
                  <span className="text-xs text-gray-700">{factor}</span>
                </div>
              ))}
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-xs font-medium text-green-700">Market Trend</div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <TrendingUp className="text-green-600" size={12} />
                <span className="text-xs font-bold text-green-800 capitalize">
                  {marketAnalysis.demandLevel.trend}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="mr-2 text-blue-600" size={16} />
          Traffic Sources
        </h3>

        <div className="space-y-3">
          {trafficSources.map((source, index) => {
            const colors = colorMap[source.color];
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                  <div>
                    <div className="font-medium text-gray-900 text-xs">{source.source}</div>
                    <div className="text-xs text-gray-600">
                      {source.views} views • {source.inquiries} inquiries
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{source.percentage}%</div>
                  <div className="text-xs text-gray-500">of total traffic</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visitor Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h4 className="font-semibold text-gray-900 mb-4 text-xs">Age Groups</h4>
          <div className="space-y-3">
            {visitorDemographics.ageGroups.map((group, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-gray-700">{group.range} years</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    {group.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h4 className="font-semibold text-gray-900 mb-4 text-xs">Budget Ranges</h4>
          <div className="space-y-3">
            {visitorDemographics.budgetRanges.map((range, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-gray-700">{range.range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    {range.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h4 className="font-semibold text-gray-900 mb-4 text-xs">Visitor Locations</h4>
          <div className="space-y-3">
            {visitorDemographics.locations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-gray-700">{location.area}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    {location.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2 text-orange-600" size={16} />
          Competitor Analysis
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg sm:text-xl font-bold text-orange-600">
              {marketAnalysis.competitorAnalysis.similarProperties}
            </div>
            <div className="text-xs text-orange-700 mt-1">Similar Properties</div>
            <div className="text-xs text-orange-600 mt-2">In your area</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg sm:text-xl font-bold text-blue-600">
              {formatCurrency(marketAnalysis.competitorAnalysis.averagePrice)}
            </div>
            <div className="text-xs text-blue-700 mt-1">Average Price</div>
            <div className="text-xs text-blue-600 mt-2">Competitor pricing</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg sm:text-xl font-bold text-green-600">
              {marketAnalysis.competitorAnalysis.yourDaysOnMarket}
            </div>
            <div className="text-xs text-green-700 mt-1">Days on Market</div>
            <div className="text-xs text-green-600 mt-2">
              vs {marketAnalysis.competitorAnalysis.averageDaysOnMarket} avg
            </div>
          </div>
        </div>
      </div>

      {/* Performance Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2 text-yellow-600" size={16} />
          Performance Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="text-green-600" size={14} />
              <span className="font-medium text-green-800 text-xs">What's Working Well</span>
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• High inquiry rate (23% above average)</li>
              <li>• Good visitor conversion (65%)</li>
              <li>• Competitive pricing strategy</li>
              <li>• Strong online presence</li>
            </ul>
          </div>

          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="text-orange-600" size={14} />
              <span className="font-medium text-orange-800 text-xs">Areas for Improvement</span>
            </div>
            <ul className="text-xs text-orange-700 space-y-1">
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