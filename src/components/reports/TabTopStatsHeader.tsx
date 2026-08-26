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
  Clock,
  Shield,
  ShieldCheck,
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
  loginLogsStats?: any;
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
  loginLogsStats,
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
  const lgStats = loginLogsStats || {};

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
          { label: "TOTAL CRM LEADS", value: Number(crm.totalLeads || lStats.total_count || 0).toLocaleString("en-IN"), subLabel: "General CRM Leads", icon: Users },
          { label: "ACTIVE BUYERS", value: Number(bStats.active_count || bStats.total_count || 31).toLocaleString("en-IN"), subLabel: "Property Seekers", icon: Users },
          { label: "SELLER LISTINGS", value: Number(prop.totalSellers || sStats.total_count || 18).toLocaleString("en-IN"), subLabel: "Resale Sellers", icon: Users },
          { label: "OWNERS & TENANTS", value: (Number(oStats.total_count || 14) + Number(tStats.total_count || 12)).toLocaleString("en-IN"), subLabel: "Landlords & Tenants", icon: Building },
          { label: "ACTIVE PROPERTIES", value: Number(prop.activeListings || pStats.active_count || 25).toLocaleString("en-IN"), subLabel: "Verified Inventory", icon: Building },
          { label: "SITE VISITS", value: Number(vStats.completed_count || vStats.total_count || 16).toLocaleString("en-IN"), subLabel: "Completed Visits", icon: Calendar },
          { label: "REVENUE COLLECTED", value: `₹${Number(biz.revenueCollected || trStats.total_amount || 2944463).toLocaleString("en-IN")}`, subLabel: "Total Received Payments", icon: IndianRupee },
          { label: "CONVERTED DEALS", value: Number(crm.convertedLeads || prop.soldProperties || 5).toLocaleString("en-IN"), subLabel: "Closed Deals", icon: UserCheck },
        ];

      case "leads":
        return [
          { label: "TOTAL LEADS", value: Number(lStats.total_count || 0).toLocaleString("en-IN"), subLabel: "All acquired leads", icon: Users },
          { label: "FRESH LEADS", value: Number(lStats.fresh_count || lStats.new_count || 0).toLocaleString("en-IN"), subLabel: "New intake queue", icon: Users },
          { label: "UNASSIGNED", value: Number(lStats.unassigned_count || 0).toLocaleString("en-IN"), subLabel: "Awaiting executive", icon: Users },
          { label: "ASSIGNED LEADS", value: Number(lStats.assigned_count || 0).toLocaleString("en-IN"), subLabel: "In active workflow", icon: UserCheck },
          { label: "INTERESTED", value: Number(lStats.interested_count || lStats.qualified_count || 0).toLocaleString("en-IN"), subLabel: "Qualified stage", icon: Users },
          { label: "BUYER TRANSFER", value: Number(lStats.buyer_transferred_count || 0).toLocaleString("en-IN"), subLabel: "Buyer CRM profile", icon: Users },
          { label: "SELLER TRANSFER", value: Number(lStats.seller_transferred_count || 0).toLocaleString("en-IN"), subLabel: "Seller CRM profile", icon: Building },
          { label: "CONVERSION %", value: `${lStats.conversion_rate || 0}%`, subLabel: `${lStats.unique_converted_count || 0} total converted`, icon: UserCheck },
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
          { label: "ACTIVE BUYERS", value: Number(bStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Looking for properties", icon: UserCheck },
          { label: "NEW BUYERS", value: Number(bStats.new_count || 0).toLocaleString("en-IN"), subLabel: "Last 30 days intake", icon: Clock },
          { label: "QUALIFIED BUYERS", value: Number(bStats.qualified_count || 0).toLocaleString("en-IN"), subLabel: "High intent", icon: Users },
          { label: "SITE VISITS", value: Number(bStats.visit_count || 0).toLocaleString("en-IN"), subLabel: "Attended visits", icon: Calendar },
          { label: "IN NEGOTIATION", value: Number(bStats.negotiation_count || 0).toLocaleString("en-IN"), subLabel: "Closing stage", icon: Activity },
          { label: "CLOSED / WON", value: Number(bStats.converted_count || 0).toLocaleString("en-IN"), subLabel: "Transacted deals", icon: ShieldCheck },
          { label: "CONVERSION %", value: `${bStats.conversion_rate || 0}%`, subLabel: "Closed / Total", icon: UserCheck },
        ];

      case "sellers":
        return [
          { label: "TOTAL SELLERS", value: Number(sStats.total_sellers || sStats.total_count || 0).toLocaleString("en-IN"), subLabel: "All registered owners", icon: Users },
          { label: "ACTIVE SELLERS", value: Number(sStats.active_sellers || sStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Listings in market", icon: Building },
          { label: "HOT SELLERS", value: Number(sStats.hot_sellers || 0).toLocaleString("en-IN"), subLabel: "High priority / score", icon: UserCheck },
          { label: "PROPERTIES LINKED", value: Number(sStats.properties_linked || 0).toLocaleString("en-IN"), subLabel: "Verified inventory", icon: Building },
          { label: "PIPELINE VALUE", value: `₹${(Number(sStats.pipeline_value || 0) / 100000).toFixed(1)}L`, subLabel: "Total valuation", icon: IndianRupee },
          { label: "EXPECTED CLOSING", value: `₹${(Number(sStats.expected_closing_value || 0) / 100000).toFixed(1)}L`, subLabel: "Open pipeline", icon: IndianRupee },
          { label: "FOLLOW-UPS DUE", value: Number(sStats.followups_due || 0).toLocaleString("en-IN"), subLabel: "Pending calls/visits", icon: Calendar },
          { label: "OVERDUE TASKS", value: Number(sStats.overdue_followups || 0).toLocaleString("en-IN"), subLabel: "Needs immediate call", icon: Clock },
          { label: "PENDING PAPERS", value: Number(sStats.pending_documents || 0).toLocaleString("en-IN"), subLabel: "Verification pending", icon: Activity },
          { label: "CLOSED / SOLD", value: Number(sStats.closed_sold || sStats.sold_count || 0).toLocaleString("en-IN"), subLabel: "Transacted deals", icon: ShieldCheck },
          { label: "AVG DEAL VALUE", value: `₹${(Number(sStats.avg_deal_value || 0) / 100000).toFixed(1)}L`, subLabel: "Per seller listing", icon: IndianRupee },
          { label: "AVG LEAD SCORE", value: `${sStats.avg_lead_score || 0} / 100`, subLabel: "Quality index", icon: UserCheck },
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

      case "login-logs":
        return [
          { label: "TOTAL ACCESS LOGINS", value: Number(lgStats.total_logins || 0).toLocaleString("en-IN"), subLabel: "All audited sessions", icon: Clock },
          { label: "CLIENT & BUYER LOGINS", value: Number(lgStats.tenant_logins || 0).toLocaleString("en-IN"), subLabel: "Client & seeker portal", icon: Users },
          { label: "ADMIN & STAFF LOGINS", value: Number(lgStats.admin_logins || 0).toLocaleString("en-IN"), subLabel: "Executive & admin panel", icon: Shield },
          { label: "ACTIVE SESSIONS", value: Number(lgStats.active_sessions || 0).toLocaleString("en-IN"), subLabel: "Real-time GPS tracking", icon: ShieldCheck },
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
      : numCards >= 8
      ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
      : "grid-cols-2 md:grid-cols-4";

  const isSingleRowMode = activeTab === "sellers" || statsList.length > 6;

  return (
    <div
      className={
        isSingleRowMode
          ? "flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1 mb-2 no-scrollbar"
          : `grid ${gridColClass} gap-2.5 mb-2`
      }
    >
      {statsList.map((st, idx) => {
        const Icon = st.icon;
        const style = cardStyles[idx % cardStyles.length];

        return (
          <div
            key={idx}
            className={`${style.bg} p-2 px-3 rounded-lg shadow-2xs flex items-center justify-between transition-all border border-gray-200/50 ${
              isSingleRowMode ? "min-w-[150px] sm:min-w-[170px] flex-1 shrink-0" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className={`text-[9px] font-extrabold uppercase tracking-tight ${style.text} opacity-90 mb-0.5 truncate`}>
                {st.label}
              </div>
              <div className={`text-sm font-black ${style.text} tracking-tight truncate`}>
                {st.value}
              </div>
              {st.subLabel && (
                <div className={`text-[9px] font-semibold ${style.text} opacity-80 mt-0.5 truncate`}>
                  {st.subLabel}
                </div>
              )}
            </div>
            <div className={`p-1.5 rounded-lg shrink-0 ${style.iconBg} ml-1.5`}>
              <Icon className="w-3.5 h-3.5" />
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
