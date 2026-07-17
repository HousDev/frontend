import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  DollarSign,
  Target,
  LineChart,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api, { analyticsAPI } from '@/lib/api'; // keep both: api used for fallback
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';

interface AnalyticsData {
  overview: {
    total_leads: number;
    total_properties: number;
    total_revenue: number;
    conversion_rate: number;
    leads_growth: number;
    properties_growth: number;
    revenue_growth: number;
    conversion_growth: number;
  };
  leads_by_source: Array<{ source: string; count: number; percentage: number }>;
  leads_by_status: Array<{ status: string; count: number; percentage: number }>;
  properties_by_type: Array<{ type: string; count: number; average_price: number }>;
  monthly_performance: Array<{ month: string; leads: number; properties: number; revenue: number }>;
  agent_performance: Array<{ agent_name: string; leads_count: number; properties_sold: number; revenue: number; conversion_rate: number }>;
  top_properties: Array<{ id: string; title: string; views: number; inquiries: number; price: number }>;
}

const USE_MOCK = true; // <-- set to `false` to enable real API calls

const MOCK_DATA: AnalyticsData = {
  overview: {
    total_leads: 245,
    total_properties: 98,
    total_revenue: 12500000,
    conversion_rate: 14.7,
    leads_growth: 23.5,
    properties_growth: 10.2,
    revenue_growth: 18.4,
    conversion_growth: 2.1,
  },
  leads_by_source: [
    { source: 'MagicBricks', count: 124, percentage: 45.2 },
    { source: '99acres', count: 88, percentage: 32.1 },
    { source: 'Housing.com', count: 45, percentage: 16.5 },
    { source: 'Direct/Referral', count: 17, percentage: 6.2 },
  ],
  leads_by_status: [
    { status: 'New', count: 98, percentage: 40 },
    { status: 'Contacted', count: 76, percentage: 30 },
    { status: 'Closed', count: 71, percentage: 29 },
  ],
  properties_by_type: [
    { type: 'Apartment', count: 56, average_price: 8500000 },
    { type: 'Villa', count: 22, average_price: 18500000 },
    { type: 'Plot', count: 20, average_price: 4500000 },
  ],
  monthly_performance: [
    { month: 'Jan', leads: 34, properties: 12, revenue: 1200000 },
    { month: 'Feb', leads: 28, properties: 9, revenue: 900000 },
    { month: 'Mar', leads: 45, properties: 14, revenue: 1400000 },
  ],
  agent_performance: [
    { agent_name: 'Amit Sharma', leads_count: 45, properties_sold: 10, revenue: 4500000, conversion_rate: 18.2 },
    { agent_name: 'Priya Mehta', leads_count: 38, properties_sold: 8, revenue: 3200000, conversion_rate: 16.7 },
  ],
  top_properties: [
    { id: 'P1', title: 'Skyline Towers', views: 1247, inquiries: 67, price: 25000000 },
    { id: 'P2', title: 'Green Valley Villa', views: 892, inquiries: 45, price: 18000000 },
  ],
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth?.() ?? { user: null };
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(USE_MOCK ? MOCK_DATA : null);
  const [loading, setLoading] = useState<boolean>(!USE_MOCK);
  const [dateRange, setDateRange] = useState<string>('last_30_days');
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'properties' | 'agents'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFromApi = useCallback(async () => {
    setLoading(true);
    setAnalytics(null);

    const params = { period: dateRange, sellerId: user?.id ?? undefined };


    try {
      // primary attempt (analyticsAPI -> api.get('/analytics'))
      const res = await analyticsAPI.getAnalytics(params);
      // support both forms: { success: true, data: {...} } or direct data
      const data = res?.success ? res.data : res;
      setAnalytics(data);
     
      setLoading(false);
      return;
    } catch (err: any) {
      console.warn('[Analytics] primary failed:', err?.response?.status ?? err?.message);

      // fallback: try /dashboard/analytics directly via api instance
      if (err?.response?.status === 404) {
        try {
        
          const res2 = await api.get('/dashboard/analytics', { params });
          setAnalytics(res2.data);
         
          setLoading(false);
          return;
        } catch (err2: any) {
          console.error('[Analytics] fallback failed:', err2?.response?.status ?? err2?.message);
        }
      }

      // generic error handling
      const status = err?.response?.status;
      if (status === 401) {
        toast.error('Not authorized. Please login again.');
      } else if (status === 403) {
        toast.error('Access denied to analytics.');
      } else if (status === 404) {
        toast.error('Analytics endpoint not found (404). Check backend routes.');
      } else {
        toast.error('Failed to load analytics data. Check server/network.');
      }
      setLoading(false);
    }
  }, [dateRange, user]);

  useEffect(() => {
    if (USE_MOCK) {
      // already populated
      setLoading(false);
      return;
    }
    // fetch from API when not using mock
    fetchFromApi();
  }, [fetchFromApi]);

  const fetchAnalytics = async () => {
    if (USE_MOCK) {
      // no network — optionally you could refresh mock (no-op)
      toast.success('Using mock data (no API calls).');
      return;
    }
    await fetchFromApi();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const exportAnalytics = async () => {
    try {
      // If using API, try server export first
      if (!USE_MOCK) {
        const res = await analyticsAPI.exportAnalytics({ period: dateRange });
        // If server returned binary or data, we try to download it; handle both shapes:
        if (res && res.data instanceof Blob) {
          const url = window.URL.createObjectURL(res.data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success('Export downloaded');
          return;
        }
        // else if server returned text:
        const text = res?.data ?? (typeof res === 'string' ? res : JSON.stringify(res));
        const blob = new Blob([text], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Export downloaded');
        return;
      }

      // If using MOCK, generate CSV from mock data client-side
      const d = analytics ?? MOCK_DATA;
      // simple CSV: metric,value
      const rows: string[] = [];
      rows.push('Metric,Value');
      rows.push(`Total Leads,${d.overview.total_leads}`);
      rows.push(`Total Properties,${d.overview.total_properties}`);
      rows.push(`Total Revenue,${d.overview.total_revenue}`);
      rows.push(`Conversion Rate,${d.overview.conversion_rate}`);
      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-mock-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Mock analytics exported');
    } catch (err) {
      console.error('Export error', err);
      toast.error('Failed to export analytics');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Not Available</h2>
          <p className="text-gray-600 mb-6">Unable to load analytics data. Please try again later.</p>
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            <Button onClick={fetchAnalytics} className="w-full sm:w-auto">Retry</Button>
            <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const overview = analytics.overview;
  const leadsBySource = analytics.leads_by_source;
  const leadsByStatus = analytics.leads_by_status;
  const propertiesByType = analytics.properties_by_type;
  const topProperties = analytics.top_properties;
  const agentPerformance = analytics.agent_performance;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics &amp; Reports</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Insights into your CRM performance and metrics {USE_MOCK ? '(mock)' : ''}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="today">Today (Daily)</option>
            <option value="last_7_days">Last 7 Days (Weekly)</option>
            <option value="last_30_days">Last 30 Days (Monthly)</option>
            <option value="last_90_days">Last 90 Days (Quarterly)</option>
            <option value="last_year">Last Year (Yearly)</option>
            <option value="all_time">All Time</option>
          </select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={exportAnalytics}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Total Leads" value={overview.total_leads.toLocaleString()} growth={overview.leads_growth} icon={Users} color="bg-blue-500" />
        <MetricCard label="Total Properties" value={overview.total_properties.toLocaleString()} growth={overview.properties_growth} icon={Building} color="bg-green-500" />
        <MetricCard label="Total Revenue" value={formatCurrency(overview.total_revenue)} growth={overview.revenue_growth} icon={DollarSign} color="bg-purple-500" />
        <MetricCard label="Conversion Rate" value={`${overview.conversion_rate.toFixed(1)}%`} growth={overview.conversion_growth} icon={Target} color="bg-orange-500" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="overflow-x-auto">
            <nav className="flex gap-4 sm:gap-8 whitespace-nowrap px-4 sm:px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm shrink-0 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('leads')}
                className={`py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm shrink-0 ${
                  activeTab === 'leads'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leads Analysis
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm shrink-0 ${
                  activeTab === 'properties'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Properties Analysis
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm shrink-0 ${
                  activeTab === 'agents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Agent Performance
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 h-56 sm:h-64 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm sm:text-base">Performance chart would go here</p>
                    <p className="text-xs sm:text-sm text-gray-400">Integration with charting library needed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ListCard
                  title="Leads by Source"
                  items={leadsBySource.map((s) => ({ label: s.source, value: s.count, extra: `${s.percentage}%` }))}
                />
                <ListCard
                  title="Leads by Status"
                  items={leadsByStatus.map((s) => ({ label: s.status, value: s.count, extra: `${s.percentage}%` }))}
                />
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ListCard
                  title="Properties by Type"
                  items={propertiesByType.map((p) => ({ label: p.type, value: p.count, extra: formatCurrency(p.average_price) }))}
                />
                <ListCard
                  title="Top Performing Properties"
                  items={topProperties.map((p) => ({ label: p.title, value: `${p.views} views`, extra: formatCurrency(p.price) }))}
                />
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties Sold</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agentPerformance.map((agent, index) => (
                      <tr key={index}>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {agent.agent_name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{agent.agent_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.leads_count}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.properties_sold}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(agent.revenue)}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.conversion_rate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

/* Reusable components */
const MetricCard = ({ label, value, growth, icon: Icon, color }: any) => (
  <div className="bg-white rounded-lg shadow p-5 sm:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`h-10 w-10 sm:h-12 sm:w-12 ${color} rounded-full flex items-center justify-center`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
    </div>
    <div className={`flex items-center mt-2 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      <span className="text-xs sm:text-sm font-medium ml-1">{formatPercentage(growth)}</span>
      <span className="text-xs sm:text-sm text-gray-500 ml-1">vs last period</span>
    </div>
  </div>
);

const ListCard = ({ title, items }: { title: string; items: any[] }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {items.length === 0 && <div className="text-sm text-gray-500">No data</div>}
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 p-3 bg-gray-50 rounded-lg"
        >
          <span className="text-sm font-medium text-gray-900 break-words">{item.label}</span>
          <span className="text-sm text-gray-900 sm:text-right">{item.value}</span>
          <span className="text-xs text-gray-500 sm:text-right">{item.extra}</span>
        </div>
      ))}
    </div>
  </div>
);
