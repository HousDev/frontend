// frontend/src/components/reports/ReportKpiCards.tsx
import React from "react";
import { Users, TrendingUp, Building, Calendar, IndianRupee, AlertCircle } from "lucide-react";

interface KpiData {
  crmKpis?: {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    activeLeads: number;
    convertedLeads: number;
    lostLeads: number;
    conversionRate: number;
    leadGrowth: number;
  };
  propertyKpis?: {
    totalProperties: number;
    activeListings: number;
    soldProperties: number;
    staleProperties: number;
    totalDealValue: number;
  };
  activityKpis?: {
    totalVisits: number;
    completedVisits: number;
    upcomingVisits: number;
    overdueFollowups: number;
  };
  businessKpis?: {
    closedDeals: number;
    totalDealValue: number;
    brokerageCommission: string;
    revenueCollected: number;
  };
}

interface ReportKpiCardsProps {
  data?: KpiData;
  onDrilldown?: (tabKey: string) => void;
}

export const ReportKpiCards: React.FC<ReportKpiCardsProps> = ({ data, onDrilldown }) => {
  const crm = data?.crmKpis || {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    activeLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    conversionRate: 0,
    leadGrowth: 0,
  };

  const prop = data?.propertyKpis || {
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    staleProperties: 0,
    totalDealValue: 0,
  };

  const act = data?.activityKpis || {
    totalVisits: 0,
    completedVisits: 0,
    upcomingVisits: 0,
    overdueFollowups: 0,
  };

  const biz = data?.businessKpis || {
    closedDeals: 0,
    totalDealValue: 0,
    brokerageCommission: "N/A",
    revenueCollected: 0,
  };

  const cards = [
    {
      id: "leads",
      title: "Total Leads",
      value: Number(crm.totalLeads || 0).toLocaleString("en-IN"),
      sub: `${Number(crm.newLeads || 0)} New in period`,
      growth: crm.leadGrowth,
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      tabKey: "leads",
    },
    {
      id: "conversion",
      title: "Lead Conversion Rate",
      value: `${crm.conversionRate || 0}%`,
      sub: `${crm.convertedLeads || 0} Deals Won`,
      growth: null,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      tabKey: "leads",
    },
    {
      id: "properties",
      title: "Active Properties",
      value: Number(prop.activeListings || 0).toLocaleString("en-IN"),
      sub: `${prop.soldProperties || 0} Sold | ${prop.staleProperties || 0} Stale (>90d)`,
      growth: null,
      icon: Building,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      tabKey: "properties",
    },
    {
      id: "visits",
      title: "Site Visits",
      value: Number(act.completedVisits || 0).toLocaleString("en-IN"),
      sub: `${act.upcomingVisits || 0} Upcoming`,
      growth: null,
      icon: Calendar,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      tabKey: "visits",
    },
    {
      id: "overdue",
      title: "Overdue Follow-ups",
      value: Number(act.overdueFollowups || 0).toLocaleString("en-IN"),
      sub: (act.overdueFollowups || 0) > 0 ? "Requires Immediate Action" : "All Caught Up",
      growth: null,
      icon: AlertCircle,
      color: (act.overdueFollowups || 0) > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-600 border-gray-200",
      tabKey: "activities",
    },
    {
      id: "revenue",
      title: "Revenue Collected",
      value: `₹${Number(biz.revenueCollected || 0).toLocaleString("en-IN")}`,
      sub: `Closed Volume: ₹${Number(biz.totalDealValue || 0).toLocaleString("en-IN")}`,
      growth: null,
      icon: IndianRupee,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
      tabKey: "transactions",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <div
            key={c.id}
            onClick={() => onDrilldown && onDrilldown(c.tabKey)}
            className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 group-hover:text-navy-900 transition-colors">
                {c.title}
              </span>
              <div className={`p-2 rounded-lg border ${c.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="text-xl font-bold text-gray-900 tracking-tight mb-1">
              {c.value}
            </div>

            <div className="text-[11px] text-gray-500 font-medium">
              {c.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
