// frontend/src/components/reports/TabTopStatsHeader.tsx
import React from "react";
import {
  Users,
  Building,
  Calendar,
  IndianRupee,
  Activity,
  MessageSquare,
  Send,
  UserCheck,
} from "lucide-react";

interface TabTopStatsHeaderProps {
  activeTab: string;
  summaryData?: any;
  leadsStats?: any;
  agentsStats?: any;
  buyersStats?: any;
  sellersStats?: any;
  tenantsStats?: any;
  ownersStats?: any;
  propertiesStats?: any;
  visitsStats?: any;
  transactionsStats?: any;
  activitiesStats?: any;
  commSummary?: any;
  campaignsStats?: any;
}

export const TabTopStatsHeader: React.FC<TabTopStatsHeaderProps> = ({
  activeTab,
  summaryData,
  leadsStats,
  agentsStats,
  buyersStats,
  sellersStats,
  tenantsStats,
  ownersStats,
  propertiesStats,
  visitsStats,
  transactionsStats,
  activitiesStats,
  commSummary,
  campaignsStats,
}) => {
  const crm = summaryData?.crmKpis || {};
  const prop = summaryData?.propertyKpis || {};
  const biz = summaryData?.businessKpis || {};

  const lStats = leadsStats || {};
  const bStats = buyersStats || {};
  const sStats = sellersStats || {};
  const tStats = tenantsStats || {};
  const oStats = ownersStats || {};
  const pStats = propertiesStats || {};
  const vStats = visitsStats || {};
  const trStats = transactionsStats || {};
  const actStats = activitiesStats || {};
  const cmSummary = commSummary || {};
  const cmpStats = campaignsStats || {};
  const agStats = agentsStats || {};

  const cardStyles = [
    { bg: "bg-[#eef2ff]", text: "text-indigo-900", iconBg: "bg-indigo-100 text-indigo-700" },
    { bg: "bg-[#e0f2fe]", text: "text-sky-900", iconBg: "bg-sky-100 text-sky-700" },
    { bg: "bg-[#f3e8ff]", text: "text-purple-900", iconBg: "bg-purple-100 text-purple-700" },
    { bg: "bg-[#dcfce7]", text: "text-emerald-900", iconBg: "bg-emerald-100 text-emerald-700" },
  ];

  const renderStats = () => {
    switch (activeTab) {
      case "overview":
        return [
          { label: "TOTAL LEADS", value: Number(crm.totalLeads || 0).toLocaleString("en-IN"), subLabel: "Across all sources", icon: Users },
          { label: "ACTIVE LISTINGS", value: Number(prop.activeListings || 0).toLocaleString("en-IN"), subLabel: "Verified properties", icon: Building },
          { label: "CONVERTED DEALS", value: Number(crm.convertedLeads || 0).toLocaleString("en-IN"), subLabel: "Total closed sales", icon: AwardIcon },
          { label: "REVENUE COLLECTED", value: `₹${Number(biz.revenueCollected || 0).toLocaleString("en-IN")}`, subLabel: "Received payments", icon: IndianRupee },
        ];

      case "leads":
        return [
          { label: "TOTAL LEADS", value: Number(lStats.total_count || 0).toLocaleString("en-IN"), subLabel: "All lead sources", icon: Users },
          { label: "NEW LEADS", value: Number(lStats.new_count || 0).toLocaleString("en-IN"), subLabel: "Uncontacted leads", icon: Users },
          { label: "QUALIFIED LEADS", value: Number(lStats.qualified_count || 0).toLocaleString("en-IN"), subLabel: "Verified buyers/sellers", icon: Users },
          { label: "UNQUALIFIED / LOST", value: Number(lStats.unqualified_count || 0).toLocaleString("en-IN"), subLabel: "Rejected records", icon: Users },
        ];

      case "agent-execution":
        return [
          { label: "TOTAL AGENTS", value: Number(agStats.total_agents || 0).toLocaleString("en-IN"), subLabel: "Active team executives", icon: UserCheck },
          { label: "ASSIGNED LEADS", value: Number(agStats.total_assigned_leads || 0).toLocaleString("en-IN"), subLabel: "Total distributed leads", icon: Users },
          { label: "CONVERTED DEALS", value: Number(agStats.total_converted || 0).toLocaleString("en-IN"), subLabel: "Agent conversions", icon: AwardIcon },
        ];

      case "buyers":
        return [
          { label: "TOTAL BUYERS", value: Number(bStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Registered buyers", icon: Users },
          { label: "ACTIVE BUYERS", value: Number(bStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Looking for properties", icon: Users },
          { label: "QUALIFIED BUYERS", value: Number(bStats.qualified_count || 0).toLocaleString("en-IN"), subLabel: "High budget intent", icon: Users },
          { label: "CONVERTED", value: Number(bStats.converted_count || 0).toLocaleString("en-IN"), subLabel: "Purchased properties", icon: Users },
        ];

      case "sellers":
        return [
          { label: "TOTAL SELLERS", value: Number(sStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Property owners selling", icon: Users },
          { label: "ACTIVE SELLERS", value: Number(sStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Listings available", icon: Users },
          { label: "SOLD / CLOSED", value: Number(sStats.sold_count || 0).toLocaleString("en-IN"), subLabel: "Successfully closed", icon: Users },
        ];

      case "tenants":
        return [
          { label: "TOTAL TENANTS", value: Number(tStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Rental applicants", icon: Users },
          { label: "ACTIVE TENANTS", value: Number(tStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Currently residing", icon: Users },
          { label: "VACATED / INACTIVE", value: Number(tStats.vacated_count || 0).toLocaleString("en-IN"), subLabel: "Lease ended", icon: Users },
        ];

      case "owners":
        return [
          { label: "TOTAL OWNERS", value: Number(oStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Registered landlords", icon: Building },
          { label: "ACTIVE OWNERS", value: Number(oStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Properties listed", icon: Building },
          { label: "CLOSED / RENTED", value: Number(oStats.closed_count || 0).toLocaleString("en-IN"), subLabel: "Occupied units", icon: Building },
        ];

      case "properties":
        return [
          { label: "TOTAL PROPERTIES", value: Number(pStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Total inventory", icon: Building },
          { label: "ACTIVE LISTINGS", value: Number(pStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Available on market", icon: Building },
          { label: "SOLD PROPERTIES", value: Number(pStats.sold_count || 0).toLocaleString("en-IN"), subLabel: "Transacted deals", icon: Building },
          { label: "STALE (>90 DAYS)", value: Number(pStats.stale_count || 0).toLocaleString("en-IN"), subLabel: "Needs price update", icon: Building },
        ];

      case "visits":
        return [
          { label: "TOTAL VISITS", value: Number(vStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Scheduled site visits", icon: Calendar },
          { label: "COMPLETED", value: Number(vStats.completed_count || 0).toLocaleString("en-IN"), subLabel: "Visits conducted", icon: Calendar },
          { label: "SCHEDULED", value: Number(vStats.scheduled_count || 0).toLocaleString("en-IN"), subLabel: "Upcoming visits", icon: Calendar },
          { label: "CANCELLED", value: Number(vStats.cancelled_count || 0).toLocaleString("en-IN"), subLabel: "Cancelled/No-show", icon: Calendar },
        ];

      case "transactions":
        return [
          { label: "TOTAL TRANSACTIONS", value: Number(trStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Recorded receipts", icon: IndianRupee },
          { label: "TOTAL REVENUE", value: `₹${Number(trStats.total_amount || 0).toLocaleString("en-IN")}`, subLabel: "Collections total", icon: IndianRupee },
        ];

      case "activities":
        return [
          { label: "TOTAL ACTIVITIES", value: Number(actStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Logged system tasks", icon: Activity },
          { label: "CALLS", value: Number(actStats.call_count || 0).toLocaleString("en-IN"), subLabel: "Phone calls done", icon: Activity },
          { label: "MEETINGS", value: Number(actStats.meeting_count || 0).toLocaleString("en-IN"), subLabel: "Client meetings", icon: Activity },
          { label: "WHATSAPP", value: Number(actStats.whatsapp_count || 0).toLocaleString("en-IN"), subLabel: "WhatsApp messages", icon: Activity },
        ];

      case "communication":
        return [
          { label: "TOTAL MESSAGES", value: Number(cmSummary.total_messages || 0).toLocaleString("en-IN"), subLabel: "Omnichannel log", icon: MessageSquare },
          { label: "INBOUND", value: Number(cmSummary.inbound_count || 0).toLocaleString("en-IN"), subLabel: "Client inquiries", icon: MessageSquare },
          { label: "OUTBOUND", value: Number(cmSummary.outbound_count || 0).toLocaleString("en-IN"), subLabel: "Agent responses", icon: MessageSquare },
          { label: "UNREAD", value: Number(cmSummary.unread_count || 0).toLocaleString("en-IN"), subLabel: "Pending replies", icon: MessageSquare },
        ];

      case "campaigns":
        return [
          { label: "TOTAL CAMPAIGNS", value: Number(cmpStats.total_campaigns || 0).toLocaleString("en-IN"), subLabel: "Marketing broadcasts", icon: Send },
          { label: "TOTAL AUDIENCE", value: Number(cmpStats.total_audience || 0).toLocaleString("en-IN"), subLabel: "Target recipients", icon: Send },
        ];

      default:
        return [];
    }
  };

  const statsList = renderStats();
  if (statsList.length === 0) return null;

  // Dynamic grid column class depending on exact card count to prevent empty whitespace
  const numCards = statsList.length;
  const gridColClass =
    numCards === 1
      ? "grid-cols-1"
      : numCards === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : numCards === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-2 md:grid-cols-4";

  return (
    <div className={`grid ${gridColClass} gap-4 mb-4`}>
      {statsList.map((st, idx) => {
        const Icon = st.icon;
        const style = cardStyles[idx % cardStyles.length];

        return (
          <div
            key={idx}
            className={`${style.bg} p-4 rounded-xl shadow-2xs flex items-center justify-between transition-all`}
          >
            <div>
              <div className={`text-[10px] font-extrabold uppercase tracking-wider ${style.text} opacity-80 mb-0.5`}>
                {st.label}
              </div>
              <div className={`text-xl font-black ${style.text} tracking-tight`}>
                {st.value}
              </div>
              {st.subLabel && (
                <div className={`text-[11px] font-semibold ${style.text} opacity-75 mt-0.5`}>
                  {st.subLabel}
                </div>
              )}
            </div>
            <div className={`p-2.5 rounded-full ${style.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

function AwardIcon(props: any) {
  return <Building {...props} />;
}
