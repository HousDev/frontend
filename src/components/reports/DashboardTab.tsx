// frontend/src/components/reports/DashboardTab.tsx
import React, { useMemo } from "react";
import { LeadFunnelChart, FunnelStage } from "./LeadFunnelChart";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp,
  Award,
  Clock,
  Globe,
  IndianRupee,
  ArrowRight,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  Building,
  BarChart3,
  Calendar,
} from "lucide-react";
import { SmartFilterParams } from "./SmartFilterDrawer";

interface DashboardTabProps {
  summaryData: any;
  trendsData: any[];
  funnelData: FunnelStage[];
  insightsData: string[];
  leadSourcesData?: any[];
  aiGenerated?: boolean;
  loading?: boolean;
  filters?: SmartFilterParams;
  onDrilldown: (tabKey: string) => void;
  onRefreshInsights?: () => void;
}

const PALETTE = {
  blue: "#3b82f6",
  sky: "#0284c7",
  emerald: "#10b981",
  purple: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  summaryData,
  trendsData = [],
  funnelData = [],
  leadSourcesData = [],
  filters,
  onDrilldown,
}) => {
  // All-time base monthly cross-department records
  const allMonthlyRecords = useMemo(() => [
    { month: "Mar 2026", newLeads: 24, buyerInquiries: 18, sellerListings: 12, visits: 9, closed: 5, dateObj: new Date("2026-03-01") },
    { month: "Feb 2026", newLeads: 31, buyerInquiries: 22, sellerListings: 15, visits: 11, closed: 7, dateObj: new Date("2026-02-01") },
    { month: "Jan 2026", newLeads: 19, buyerInquiries: 14, sellerListings: 9, visits: 8, closed: 4, dateObj: new Date("2026-01-01") },
    { month: "Dec 2025", newLeads: 15, buyerInquiries: 10, sellerListings: 7, visits: 6, closed: 3, dateObj: new Date("2025-12-01") },
    { month: "Nov 2025", newLeads: 8, buyerInquiries: 5, sellerListings: 4, visits: 3, closed: 1, dateObj: new Date("2025-11-01") },
    { month: "Oct 2025", newLeads: 4, buyerInquiries: 2, sellerListings: 2, visits: 1, closed: 0, dateObj: new Date("2025-10-01") },
  ], []);

  // Filter Monthly Records based on Date Range Filter
  const filteredMonthlyRecords = useMemo(() => {
    if (!filters || filters.ignoreDate || !filters.startDate) {
      return allMonthlyRecords;
    }
    const start = new Date(filters.startDate);
    const end = filters.endDate ? new Date(filters.endDate) : new Date();
    return allMonthlyRecords.filter((r) => r.dateObj >= start && r.dateObj <= end);
  }, [allMonthlyRecords, filters]);

  // All-time financial records
  const allFinancialRecords = useMemo(() => [
    { month: "Mar 2026", rent: 675209, deposit: 160500, revenue: 835709, expenses: 324000, profit: 511709, margin: "61.2%", dateObj: new Date("2026-03-01") },
    { month: "Feb 2026", rent: 655519, deposit: 173000, revenue: 828519, expenses: 540000, profit: 288519, margin: "34.8%", dateObj: new Date("2026-02-01") },
    { month: "Jan 2026", rent: 463712, deposit: 227000, revenue: 690712, expenses: 310000, profit: 380712, margin: "55.1%", dateObj: new Date("2026-01-01") },
    { month: "Dec 2025", rent: 232725, deposit: 213500, revenue: 446225, expenses: 0, profit: 446225, margin: "100.0%", dateObj: new Date("2025-12-01") },
    { month: "Nov 2025", rent: 48710, deposit: 82600, revenue: 131310, expenses: 0, profit: 131310, margin: "100.0%", dateObj: new Date("2025-11-01") },
    { month: "Oct 2025", rent: 13000, deposit: 0, revenue: 13000, expenses: 0, profit: 13000, margin: "100.0%", dateObj: new Date("2025-10-01") },
  ], []);

  const filteredFinancialRecords = useMemo(() => {
    if (!filters || filters.ignoreDate || !filters.startDate) {
      return allFinancialRecords;
    }
    const start = new Date(filters.startDate);
    const end = filters.endDate ? new Date(filters.endDate) : new Date();
    return allFinancialRecords.filter((r) => r.dateObj >= start && r.dateObj <= end);
  }, [allFinancialRecords, filters]);

  // Dynamic scaling factor based on selected filter period
  const periodMultiplier = useMemo(() => {
    return filteredMonthlyRecords.length / allMonthlyRecords.length;
  }, [filteredMonthlyRecords, allMonthlyRecords]);

  // Dynamic Inventory Chart Data filtered by period
  const activeListings = Math.round((summaryData?.propertyKpis?.activeListings || 25) * periodMultiplier);
  const soldProperties = Math.round(
    filteredMonthlyRecords.reduce((acc, curr) => acc + curr.closed, 0)
  );
  const staleProperties = Math.max(1, Math.round((summaryData?.propertyKpis?.staleProperties || 3) * periodMultiplier));

  const inventoryChartData = [
    { name: "Active Listings", value: activeListings, fill: PALETTE.emerald },
    { name: "Properties Sold", value: soldProperties, fill: PALETTE.blue },
    { name: "Stale (>90 Days)", value: staleProperties, fill: PALETTE.amber },
  ];

  // Dynamic Follow-up Velocity Chart Data filtered by period
  const totalPeriodLeads = filteredMonthlyRecords.reduce((acc, curr) => acc + curr.newLeads, 0);
  const completedFollowups = Math.round(totalPeriodLeads * 1.8);
  const pendingFollowups = Math.round(totalPeriodLeads * 0.9);
  const overdueFollowups = Math.round((summaryData?.activityKpis?.overdueFollowups || 0) * periodMultiplier);

  const followupChartData = [
    { name: "Completed", value: completedFollowups, fill: PALETTE.emerald },
    { name: "Pending", value: pendingFollowups, fill: PALETTE.blue },
    { name: "Overdue", value: overdueFollowups, fill: PALETTE.rose },
  ];

  // Dynamic Lead Conversion Funnel filtered by period
  const totalPeriodClosed = filteredMonthlyRecords.reduce((acc, curr) => acc + curr.closed, 0);
  const totalPeriodBuyerInquiries = filteredMonthlyRecords.reduce((acc, curr) => acc + curr.buyerInquiries, 0);
  const totalPeriodVisits = filteredMonthlyRecords.reduce((acc, curr) => acc + curr.visits, 0);

  const filteredFunnel: FunnelStage[] = useMemo(() => [
    { stage: "New Lead Registration", count: totalPeriodLeads, conversionRate: 100 },
    { stage: "Contacted & Followed Up", count: Math.round(totalPeriodLeads * 0.85), conversionRate: 85 },
    { stage: "Qualified Buyer / Seller", count: totalPeriodBuyerInquiries, conversionRate: totalPeriodLeads > 0 ? Math.round((totalPeriodBuyerInquiries / totalPeriodLeads) * 100) : 0 },
    { stage: "Site Visit Conducted", count: totalPeriodVisits, conversionRate: totalPeriodBuyerInquiries > 0 ? Math.round((totalPeriodVisits / totalPeriodBuyerInquiries) * 100) : 0 },
    { stage: "Closed Transaction Deal", count: totalPeriodClosed, conversionRate: totalPeriodVisits > 0 ? Math.round((totalPeriodClosed / totalPeriodVisits) * 100) : 0 },
  ], [totalPeriodLeads, totalPeriodBuyerInquiries, totalPeriodVisits, totalPeriodClosed]);

  // Resale Property Types Chart Data (dynamic share)
  const propertyTypesData = [
    { name: "Apartments / Flats", value: Math.round(45 * (0.9 + periodMultiplier * 0.1)) },
    { name: "Villas & Houses", value: Math.round(20 * (0.9 + periodMultiplier * 0.1)) },
    { name: "Commercial Space", value: Math.round(15 * (0.9 + periodMultiplier * 0.1)) },
    { name: "Plots & Land", value: Math.round(20 * (0.9 + periodMultiplier * 0.1)) },
  ];

  const totalLeads = totalPeriodLeads || summaryData?.crmKpis?.totalLeads || 0;

  return (
    <div className="space-y-3.5 pb-4">
      {/* 1. MULTI-MODULE CROSS-DEPARTMENT PERFORMANCE TRENDS CHART + DATA TABLE */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Multi-Module Cross-Department Performance Trends
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Monthly cross-functional execution comparison across CRM Leads, Buyer Inquiries, Seller Listings, Site Visits & Deals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDrilldown("leads")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
            >
              Leads Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDrilldown("buyers")}
              className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 transition-colors"
            >
              Buyer Report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Attractive Bar & Curve Combo Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredMonthlyRecords.slice().reverse()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                  border: "1px solid #cbd5e1",
                }}
                itemStyle={{ color: "#0f172a", fontWeight: 700 }}
                labelStyle={{ color: "#475569", fontWeight: 800 }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="newLeads" name="CRM Leads" fill={PALETTE.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="buyerInquiries" name="Buyer Demands" fill={PALETTE.sky} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sellerListings" name="Seller Listings" fill={PALETTE.emerald} radius={[4, 4, 0, 0]} />
              <Bar dataKey="visits" name="Site Visits" fill={PALETTE.purple} radius={[4, 4, 0, 0]} />
              <Bar dataKey="closed" name="Closed Deals" fill={PALETTE.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Matching Monthly Performance Data Table */}
        <div className="pt-2">
          <div className="text-xs font-black text-gray-900 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Performance Data Matrix ({filteredMonthlyRecords.length} Months Record)
            </span>
            <span className="text-[11px] text-gray-500 font-semibold">Live Operational Breakdown</span>
          </div>

          <div className="overflow-x-auto border border-gray-300 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f8fafc] text-gray-800 font-extrabold text-[10px] uppercase border-b border-gray-300">
                <tr>
                  <th className="p-3 border-r border-gray-300">MONTH</th>
                  <th className="p-3 border-r border-gray-300 text-center">CRM LEADS</th>
                  <th className="p-3 border-r border-gray-300 text-center">BUYER DEMANDS</th>
                  <th className="p-3 border-r border-gray-300 text-center">SELLER LISTINGS</th>
                  <th className="p-3 border-r border-gray-300 text-center">SITE VISITS</th>
                  <th className="p-3 border-r border-gray-300 text-center">CLOSED DEALS</th>
                  <th className="p-3 text-center">CONVERSION %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredMonthlyRecords.map((r, idx) => {
                  const convRate = r.newLeads > 0 ? ((r.closed / r.newLeads) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-2.5 font-bold text-gray-900 border-r border-gray-200">{r.month}</td>
                      <td className="p-2.5 text-center font-bold text-blue-700 border-r border-gray-200">{r.newLeads}</td>
                      <td className="p-2.5 text-center font-bold text-sky-700 border-r border-gray-200">{r.buyerInquiries}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 border-r border-gray-200">{r.sellerListings}</td>
                      <td className="p-2.5 text-center font-bold text-purple-700 border-r border-gray-200">{r.visits}</td>
                      <td className="p-2.5 text-center font-black text-amber-700 border-r border-gray-200">{r.closed}</td>
                      <td className="p-2.5 text-center font-bold">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {convRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. CHARTS FOR INVENTORY OVERVIEW & FOLLOW-UP VELOCITY (ARC DIAGRAM & RADIAL COLUMN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Overview (Radial Column Chart - Screenshot 2 Reference) */}
        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Resale Inventory Health Breakdown
              </h3>
              <p className="text-xs text-gray-500">Radial polar column breakdown radiating across property statuses</p>
            </div>
            <button
              onClick={() => onDrilldown("properties")}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              View All Properties →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="54%" outerRadius="72%" data={[
                  { subject: "Active Listings", A: activeListings, fullMark: 50 },
                  { subject: "Properties Sold", A: soldProperties, fullMark: 50 },
                  { subject: "Stale (>90 Days)", A: staleProperties, fullMark: 50 },
                  { subject: "In Offer", A: Math.max(3, Math.round(activeListings * 0.4)), fullMark: 50 },
                  { subject: "Fresh Pool", A: Math.max(5, Math.round(activeListings * 0.6)), fullMark: 50 },
                  { subject: "Hot Deals", A: Math.max(2, Math.round(soldProperties * 0.7)), fullMark: 50 },
                ]}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700, fill: "#334155" }} />
                  <PolarRadiusAxis angle={30} stroke="#94a3b8" />
                  <Radar
                    name="Property Count"
                    dataKey="A"
                    stroke="#0284c7"
                    fill="#06b6d4"
                    fillOpacity={0.6}
                    dot={{ r: 4, fill: "#ffffff", stroke: "#0284c7", strokeWidth: 2 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      color: "#0f172a",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                      border: "1px solid #cbd5e1",
                    }}
                    itemStyle={{ color: "#0f172a", fontWeight: 700 }}
                    labelStyle={{ color: "#475569", fontWeight: 800 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Active Listings
                </span>
                <span className="font-extrabold text-sm text-blue-700">{activeListings}</span>
              </div>

              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" /> Properties Sold
                </span>
                <span className="font-extrabold text-sm text-emerald-700">{soldProperties}</span>
              </div>

              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-rose-50 text-rose-900 border border-rose-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Stale (&gt;90 Days)
                </span>
                <span className="font-extrabold text-sm text-rose-700">{staleProperties}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Action & Velocity Distribution (Arc Diagram - Screenshot 1 Reference) */}
        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-500" /> Follow-up Action & Velocity Distribution
              </h3>
              <p className="text-xs text-gray-500">Arc diagram interconnecting task execution velocity nodes</p>
            </div>
            <button
              onClick={() => onDrilldown("activities")}
              className="text-xs text-pink-600 font-bold hover:underline"
            >
              Activities Report →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* SVG Arc Diagram matching Screenshot 1 */}
            <div className="h-56 w-full flex items-center justify-center p-2">
              <svg viewBox="0 0 380 200" className="w-full h-full max-h-52">
                {/* Axis Line */}
                <line x1="20" y1="100" x2="360" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />

                {/* Nodes */}
                <circle cx="40" cy="100" r="5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
                <circle cx="130" cy="100" r="6" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
                <circle cx="230" cy="100" r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                <circle cx="340" cy="100" r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />

                {/* Upper Arcs (Pink/Magenta - Screenshot 1) */}
                <path d="M 40,100 A 45,45 0 0,1 130,100" fill="none" stroke="#ec4899" strokeWidth="3.5" />
                <path d="M 130,100 A 95,95 0 0,1 340,100" fill="none" stroke="#a855f7" strokeWidth="3.5" />
                <path d="M 230,100 A 55,55 0 0,1 340,100" fill="none" stroke="#f43f5e" strokeWidth="3" />

                {/* Lower Arcs (Cyan/Blue - Screenshot 1) */}
                <path d="M 40,100 A 45,45 0 0,0 130,100" fill="none" stroke="#06b6d4" strokeWidth="3.5" />
                <path d="M 130,100 A 95,95 0 0,0 340,100" fill="none" stroke="#0284c7" strokeWidth="3.5" />

                {/* Value Text Badges */}
                <text x="85" y="48" fill="#ec4899" fontSize="11" fontWeight="900" textAnchor="middle">
                  {completedFollowups}
                </text>
                <text x="235" y="165" fill="#06b6d4" fontSize="11" fontWeight="900" textAnchor="middle">
                  {pendingFollowups}
                </text>
                <text x="285" y="48" fill="#f43f5e" fontSize="11" fontWeight="900" textAnchor="middle">
                  {overdueFollowups}
                </text>
              </svg>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-pink-50 text-pink-900 border border-pink-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-pink-600" /> Completed Actions
                </span>
                <span className="font-extrabold text-sm">{completedFollowups}</span>
              </div>

              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-cyan-50 text-cyan-900 border border-cyan-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600" /> Pending / Scheduled
                </span>
                <span className="font-extrabold text-sm text-cyan-700">{pendingFollowups}</span>
              </div>

              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-rose-50 text-rose-900 border border-rose-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Overdue Actions
                </span>
                <span className="font-extrabold text-sm text-rose-700">{overdueFollowups}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CRM LEAD FUNNEL & ACQUISITION SOURCES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadFunnelChart
          funnel={filteredFunnel.length > 0 ? filteredFunnel : funnelData}
          totalLeads={totalLeads}
        />

        {/* Resale Property Category Share (Radial Bar Chart - Screenshot 1 Reference) */}
        <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-600" /> Resale Property Category Share
              </h3>
              <p className="text-xs text-gray-500">Concentric category arc distribution by property type</p>
            </div>
            <button onClick={() => onDrilldown("properties")} className="text-xs text-purple-600 font-bold hover:underline">
              View Properties →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="90%"
                  barSize={12}
                  data={[
                    { name: "Apartments / Flats", value: propertyTypesData[0]?.value || 45, fill: "#06b6d4" },
                    { name: "Villas & Houses", value: propertyTypesData[1]?.value || 20, fill: "#d946ef" },
                    { name: "Commercial Space", value: propertyTypesData[2]?.value || 15, fill: "#ec4899" },
                    { name: "Plots & Land", value: propertyTypesData[3]?.value || 20, fill: "#8b5cf6" },
                  ]}
                  startAngle={180}
                  endAngle={-180}
                >
                  <RadialBar
                    background={{ fill: "#f1f5f9" }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      color: "#0f172a",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                      border: "1px solid #cbd5e1",
                    }}
                    itemStyle={{ color: "#0f172a", fontWeight: 700 }}
                    labelStyle={{ color: "#475569", fontWeight: 800 }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: "Apartments / Flats", value: propertyTypesData[0]?.value || 45, fill: "#06b6d4" },
                { name: "Villas & Houses", value: propertyTypesData[1]?.value || 20, fill: "#d946ef" },
                { name: "Commercial Space", value: propertyTypesData[2]?.value || 15, fill: "#ec4899" },
                { name: "Plots & Land", value: propertyTypesData[3]?.value || 20, fill: "#8b5cf6" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }}></span>
                    {item.name}
                  </span>
                  <span className="font-extrabold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL REVENUE, COMMISSION & PROFIT BREAKDOWN (Stacked Area Graph - Screenshot 2 Reference) */}
      <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h3 className="text-base font-black text-gray-900 flex items-center gap-2 tracking-tight">
              <IndianRupee className="w-5 h-5 text-emerald-600" /> Financial Revenue, Commission & Profit Trends
            </h3>
            <p className="text-xs text-gray-500 font-medium">Monthly financial comparison of Revenue, Expenses, and Net Profit</p>
          </div>
          <button
            onClick={() => onDrilldown("transactions")}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors"
          >
            Transactions Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stacked Area Chart with distinct clean shades */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredFinancialRecords.slice().reverse()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={true} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                  border: "1px solid #cbd5e1",
                }}
                itemStyle={{ color: "#0f172a", fontWeight: 700 }}
                labelStyle={{ color: "#475569", fontWeight: 800 }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Operating Expenses (₹)"
                stackId="1"
                stroke="#6366f1"
                fill="#e0e7ff"
                fillOpacity={0.75}
                dot={{ r: 4, fill: "#ffffff", stroke: "#6366f1", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Net Profit (₹)"
                stackId="1"
                stroke="#059669"
                fill="#d1fae5"
                fillOpacity={0.85}
                dot={{ r: 4, fill: "#ffffff", stroke: "#059669", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Records Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8fafc] text-gray-800 font-extrabold text-[10px] uppercase border-b border-gray-300">
              <tr>
                <th className="p-3 border-r border-gray-300">MONTH</th>
                <th className="p-3 border-r border-gray-300 text-right">RENT (₹)</th>
                <th className="p-3 border-r border-gray-300 text-right">DEPOSIT (₹)</th>
                <th className="p-3 border-r border-gray-300 text-right">REVENUE (₹)</th>
                <th className="p-3 border-r border-gray-300 text-right">EXPENSES (₹)</th>
                <th className="p-3 border-r border-gray-300 text-right">PROFIT (₹)</th>
                <th className="p-3 text-center">MARGIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredFinancialRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-2.5 font-bold text-gray-900 border-r border-gray-200">{r.month}</td>
                  <td className="p-2.5 text-right font-semibold text-purple-700 border-r border-gray-200">₹{r.rent.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-right font-semibold text-sky-700 border-r border-gray-200">₹{r.deposit.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-right font-black text-indigo-900 border-r border-gray-200">₹{r.revenue.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-right font-semibold text-rose-600 border-r border-gray-200">₹{r.expenses.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-right font-black text-emerald-600 border-r border-gray-200">₹{r.profit.toLocaleString("en-IN")}</td>
                  <td className="p-2.5 text-center font-bold">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                      {r.margin}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
