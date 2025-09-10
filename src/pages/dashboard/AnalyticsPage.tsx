// import React, { useState, useEffect } from 'react';
// import {
//   TrendingUp,
//   TrendingDown,
//   Users,
//   Building,
//   DollarSign,
//   Target,
//   Calendar,
//   BarChart3,
//   PieChart,
//   LineChart,
//   Download,
//   Filter,
//   RefreshCw,
// } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { dashboardAPI, analyticsAPI } from '@/lib/api';
// import Button from '@/components/ui/Button';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';
// import { toast } from '@/hooks/useToast';

// interface AnalyticsData {
//   overview: {
//     total_leads: number;
//     total_properties: number;
//     total_revenue: number;
//     conversion_rate: number;
//     leads_growth: number;
//     properties_growth: number;
//     revenue_growth: number;
//     conversion_growth: number;
//   };
//   leads_by_source: Array<{
//     source: string;
//     count: number;
//     percentage: number;
//   }>;
//   leads_by_status: Array<{
//     status: string;
//     count: number;
//     percentage: number;
//   }>;
//   properties_by_type: Array<{
//     type: string;
//     count: number;
//     average_price: number;
//   }>;
//   monthly_performance: Array<{
//     month: string;
//     leads: number;
//     properties: number;
//     revenue: number;
//   }>;
//   agent_performance: Array<{
//     agent_name: string;
//     leads_count: number;
//     properties_sold: number;
//     revenue: number;
//     conversion_rate: number;
//   }>;
//   top_properties: Array<{
//     id: string;
//     title: string;
//     views: number;
//     inquiries: number;
//     price: number;
//   }>;
// }

// const AnalyticsPage: React.FC = () => {
//   const { user } = useAuth();
//   const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState('last_30_days');
//   const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'properties' | 'agents'>('overview');
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchAnalytics();
//   }, [dateRange]);

//   const fetchAnalytics = async () => {
//     try {
//       setLoading(true);
//       const response = await analyticsAPI.getAnalytics({ period: dateRange });
//       if (response.success) {
//         setAnalytics(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//       toast.error('Failed to load analytics data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchAnalytics();
//     setRefreshing(false);
//     toast.success('Analytics data refreshed');
//   };

//   const exportAnalytics = async () => {
//     try {
//       const response = await analyticsAPI.exportAnalytics({ period: dateRange });
//       // Handle CSV download
//       const blob = new Blob([response.data], { type: 'text/csv' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//       toast.success('Analytics exported successfully');
//     } catch (error) {
//       console.error('Error exporting analytics:', error);
//       toast.error('Failed to export analytics');
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatPercentage = (value: number) => {
//     return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
//   };

//   const getGrowthColor = (growth: number) => {
//     return growth >= 0 ? 'text-green-600' : 'text-red-600';
//   };

//   const getGrowthIcon = (growth: number) => {
//     return growth >= 0 ? (
//       <TrendingUp className="h-4 w-4" />
//     ) : (
//       <TrendingDown className="h-4 w-4" />
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center py-12">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!analytics) {
//     return (
//       <div className="p-6">
//         <div className="text-center py-12">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Not Available</h2>
//           <p className="text-gray-600 mb-6">Unable to load analytics data. Please try again later.</p>
//           <Button onClick={fetchAnalytics}>Retry</Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
//           <p className="text-gray-600 mt-1">
//             Insights into your CRM performance and metrics
//           </p>
//         </div>
//         <div className="flex space-x-3">
//           <select
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="last_7_days">Last 7 Days</option>
//             <option value="last_30_days">Last 30 Days</option>
//             <option value="last_90_days">Last 90 Days</option>
//             <option value="last_year">Last Year</option>
//           </select>
//           <Button
//             variant="outline"
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center space-x-2"
//           >
//             <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
//             <span>Refresh</span>
//           </Button>
//           <Button
//             variant="outline"
//             onClick={exportAnalytics}
//             className="flex items-center space-x-2"
//           >
//             <Download className="h-4 w-4" />
//             <span>Export</span>
//           </Button>
//         </div>
//       </div>

//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Leads</p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {analytics.overview.total_leads.toLocaleString()}
//               </p>
//             </div>
//             <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
//               <Users className="h-6 w-6 text-white" />
//             </div>
//           </div>
//           <div className={`flex items-center mt-2 ${getGrowthColor(analytics.overview.leads_growth)}`}>
//             {getGrowthIcon(analytics.overview.leads_growth)}
//             <span className="text-sm font-medium ml-1">
//               {formatPercentage(analytics.overview.leads_growth)}
//             </span>
//             <span className="text-sm text-gray-500 ml-1">vs last period</span>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Properties</p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {analytics.overview.total_properties.toLocaleString()}
//               </p>
//             </div>
//             <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
//               <Building className="h-6 w-6 text-white" />
//             </div>
//           </div>
//           <div className={`flex items-center mt-2 ${getGrowthColor(analytics.overview.properties_growth)}`}>
//             {getGrowthIcon(analytics.overview.properties_growth)}
//             <span className="text-sm font-medium ml-1">
//               {formatPercentage(analytics.overview.properties_growth)}
//             </span>
//             <span className="text-sm text-gray-500 ml-1">vs last period</span>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {formatCurrency(analytics.overview.total_revenue)}
//               </p>
//             </div>
//             <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
//               <DollarSign className="h-6 w-6 text-white" />
//             </div>
//           </div>
//           <div className={`flex items-center mt-2 ${getGrowthColor(analytics.overview.revenue_growth)}`}>
//             {getGrowthIcon(analytics.overview.revenue_growth)}
//             <span className="text-sm font-medium ml-1">
//               {formatPercentage(analytics.overview.revenue_growth)}
//             </span>
//             <span className="text-sm text-gray-500 ml-1">vs last period</span>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
//               <p className="text-3xl font-bold text-gray-900">
//                 {analytics.overview.conversion_rate.toFixed(1)}%
//               </p>
//             </div>
//             <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center">
//               <Target className="h-6 w-6 text-white" />
//             </div>
//           </div>
//           <div className={`flex items-center mt-2 ${getGrowthColor(analytics.overview.conversion_growth)}`}>
//             {getGrowthIcon(analytics.overview.conversion_growth)}
//             <span className="text-sm font-medium ml-1">
//               {formatPercentage(analytics.overview.conversion_growth)}
//             </span>
//             <span className="text-sm text-gray-500 ml-1">vs last period</span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="border-b border-gray-200">
//           <nav className="flex space-x-8" aria-label="Tabs">
//             <button
//               onClick={() => setActiveTab('overview')}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === 'overview'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab('leads')}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === 'leads'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Leads Analysis
//             </button>
//             <button
//               onClick={() => setActiveTab('properties')}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === 'properties'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Properties Analysis
//             </button>
//             <button
//               onClick={() => setActiveTab('agents')}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === 'agents'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Agent Performance
//             </button>
//           </nav>
//         </div>

//         <div className="p-6">
//           {activeTab === 'overview' && (
//             <div className="space-y-6">
//               {/* Monthly Performance Chart */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
//                 <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
//                   <div className="text-center">
//                     <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//                     <p className="text-gray-500">Performance chart would go here</p>
//                     <p className="text-sm text-gray-400">Integration with charting library needed</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'leads' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Leads by Source */}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h3>
//                   <div className="space-y-3">
//                     {analytics.leads_by_source.map((item, index) => (
//                       <div key={index} className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
//                           <span className="text-sm font-medium text-gray-900 capitalize">{item.source}</span>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                           <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Leads by Status */}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h3>
//                   <div className="space-y-3">
//                     {analytics.leads_by_status.map((item, index) => (
//                       <div key={index} className="flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//                           <span className="text-sm font-medium text-gray-900 capitalize">{item.status}</span>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-sm font-medium text-gray-900">{item.count}</div>
//                           <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'properties' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Properties by Type */}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties by Type</h3>
//                   <div className="space-y-3">
//                     {analytics.properties_by_type.map((item, index) => (
//                       <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900 capitalize">{item.type}</div>
//                           <div className="text-xs text-gray-500">{item.count} properties</div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-sm font-medium text-gray-900">
//                             {formatCurrency(item.average_price)}
//                           </div>
//                           <div className="text-xs text-gray-500">Avg. Price</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Top Properties */}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Properties</h3>
//                   <div className="space-y-3">
//                     {analytics.top_properties.map((property, index) => (
//                       <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                         <div className="flex-1">
//                           <div className="text-sm font-medium text-gray-900">{property.title}</div>
//                           <div className="text-xs text-gray-500">
//                             {property.views} views • {property.inquiries} inquiries
//                           </div>
//                         </div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {formatCurrency(property.price)}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'agents' && (
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Agent
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Leads
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Properties Sold
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Revenue
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Conversion Rate
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {analytics.agent_performance.map((agent, index) => (
//                       <tr key={index}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
//                               {agent.agent_name.charAt(0)}
//                             </div>
//                             <div className="ml-3">
//                               <div className="text-sm font-medium text-gray-900">{agent.agent_name}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {agent.leads_count}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {agent.properties_sold}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {formatCurrency(agent.revenue)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {agent.conversion_rate.toFixed(1)}%
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsPage;

// src/pages/dashboard/analytics.tsx
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
    console.log('[Analytics] fetch params:', params);

    try {
      // primary attempt (analyticsAPI -> api.get('/analytics'))
      const res = await analyticsAPI.getAnalytics(params);
      // support both forms: { success: true, data: {...} } or direct data
      const data = res?.success ? res.data : res;
      setAnalytics(data);
      console.log('[Analytics] primary response:', data);
      setLoading(false);
      return;
    } catch (err: any) {
      console.warn('[Analytics] primary failed:', err?.response?.status ?? err?.message);

      // fallback: try /dashboard/analytics directly via api instance
      if (err?.response?.status === 404) {
        try {
          console.log('[Analytics] trying fallback /dashboard/analytics with params:', params);
          const res2 = await api.get('/dashboard/analytics', { params });
          setAnalytics(res2.data);
          console.log('[Analytics] fallback response:', res2.data);
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
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Not Available</h2>
          <p className="text-gray-600 mb-6">Unable to load analytics data. Please try again later.</p>
          <div className="flex justify-center space-x-3">
            <Button onClick={fetchAnalytics}>Retry</Button>
            <Button variant="outline" onClick={handleRefresh}>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Insights into your CRM performance and metrics {USE_MOCK ? '(mock)' : ''}</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="last_year">Last Year</option>
          </select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="flex items-center space-x-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" onClick={exportAnalytics} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Leads" value={overview.total_leads.toLocaleString()} growth={overview.leads_growth} icon={Users} color="bg-blue-500" />
        <MetricCard label="Total Properties" value={overview.total_properties.toLocaleString()} growth={overview.properties_growth} icon={Building} color="bg-green-500" />
        <MetricCard label="Total Revenue" value={formatCurrency(overview.total_revenue)} growth={overview.revenue_growth} icon={DollarSign} color="bg-purple-500" />
        <MetricCard label="Conversion Rate" value={`${overview.conversion_rate.toFixed(1)}%`} growth={overview.conversion_growth} icon={Target} color="bg-orange-500" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('overview')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Overview</button>
            <button onClick={() => setActiveTab('leads')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leads' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Leads Analysis</button>
            <button onClick={() => setActiveTab('properties')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'properties' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Properties Analysis</button>
            <button onClick={() => setActiveTab('agents')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'agents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Agent Performance</button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Performance chart would go here</p>
                    <p className="text-sm text-gray-400">Integration with charting library needed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListCard title="Leads by Source" items={leadsBySource.map(s => ({ label: s.source, value: s.count, extra: `${s.percentage}%` }))} />
                <ListCard title="Leads by Status" items={leadsByStatus.map(s => ({ label: s.status, value: s.count, extra: `${s.percentage}%` }))} />
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListCard title="Properties by Type" items={propertiesByType.map(p => ({ label: p.type, value: p.count, extra: formatCurrency(p.average_price) }))} />
                <ListCard title="Top Performing Properties" items={topProperties.map(p => ({ label: p.title, value: `${p.views} views`, extra: formatCurrency(p.price) }))} />
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agentPerformance.map((agent, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">{agent.agent_name.charAt(0)}</div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{agent.agent_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.leads_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.properties_sold}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(agent.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.conversion_rate.toFixed(1)}%</td>
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
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`h-12 w-12 ${color} rounded-full flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <div className={`flex items-center mt-2 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      <span className="text-sm font-medium ml-1">{formatPercentage(growth)}</span>
      <span className="text-sm text-gray-500 ml-1">vs last period</span>
    </div>
  </div>
);

const ListCard = ({ title, items }: { title: string; items: any[] }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {items.length === 0 && <div className="text-sm text-gray-500">No data</div>}
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-900">{item.label}</span>
          <span className="text-sm text-gray-900">{item.value}</span>
          <span className="text-xs text-gray-500">{item.extra}</span>
        </div>
      ))}
    </div>
  </div>
);
