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
  Home,
  Award,
  CheckCircle,
  TrendingUp,
  Eye,
  FileText,
  Sparkles,
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
      case "overview": {
        const top = summaryData?.topKpis || {};
        return [
          { label: "TOTAL LEADS", value: Number(top.totalLeads || crm.totalLeads || 0).toLocaleString("en-IN"), subLabel: "Acquired prospects", icon: Users },
          { label: "QUALIFIED LEADS", value: Number(top.qualifiedLeads || crm.qualifiedLeads || 0).toLocaleString("en-IN"), subLabel: "High intent leads", icon: UserCheck },
          { label: "ACTIVE BUYERS", value: Number(top.activeBuyers || bStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Active property seekers", icon: Users },
          { label: "ACTIVE SELLERS", value: Number(top.activeSellers || sStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Active property sellers", icon: Home },
          { label: "ACTIVE PROPERTIES", value: Number(top.activeProperties || prop.activeListings || 0).toLocaleString("en-IN"), subLabel: "Live inventory listings", icon: Building },
          { label: "PROPERTIES SOLD", value: Number(top.propertiesSold || prop.soldProperties || 0).toLocaleString("en-IN"), subLabel: "Closed sale transactions", icon: CheckCircle },
          { label: "PROPERTIES RENTED", value: Number(top.propertiesRented || 0).toLocaleString("en-IN"), subLabel: "Leased rental properties", icon: Award },
          { label: "TOTAL COLLECTIONS", value: `₹${Number(top.totalCollections || biz.revenueCollected || 0).toLocaleString("en-IN")}`, subLabel: "Platform revenue & fees", icon: IndianRupee },
        ];
      }

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
          { label: "ACTIVE USERS", value: Number(agStats.totalActiveUsers || agStats.total_agents || 0).toLocaleString("en-IN"), subLabel: "Team workforce", icon: UserCheck },
          { label: "LEADS ASSIGNED", value: Number(agStats.leadsAssigned || agStats.total_assigned_leads || 0).toLocaleString("en-IN"), subLabel: "Total distributed leads", icon: Users },
          { label: "INTERESTED LEADS", value: Number(agStats.leadsInterested || 0).toLocaleString("en-IN"), subLabel: "High intent prospects", icon: Sparkles },
          { label: "BUYERS CREATED", value: Number(agStats.buyersCreated || 0).toLocaleString("en-IN"), subLabel: "Property seekers", icon: Users },
          { label: "PROPERTIES ADDED", value: Number(agStats.propertiesAdded || 0).toLocaleString("en-IN"), subLabel: "Listings onboarding", icon: Building },
          { label: "SITE VISITS", value: Number(agStats.siteVisits || 0).toLocaleString("en-IN"), subLabel: "Conducted visits", icon: Calendar },
          { label: "DEALS CLOSED", value: Number(agStats.dealsClosed || agStats.total_converted || 0).toLocaleString("en-IN"), subLabel: "Total closures", icon: CheckCircle },
          { label: "TOTAL DEAL VALUE", value: `₹${(Number(agStats.totalDealValue || 0) / 10000000).toFixed(2)}Cr`, subLabel: "Transaction volume", icon: IndianRupee },
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
          { label: "TOTAL SELLERS", value: Number(sStats.total_sellers || sStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Registered sellers", icon: Users },
          { label: "NEW SELLERS", value: Number(sStats.new_sellers || sStats.new_count || 0).toLocaleString("en-IN"), subLabel: "Intake this period", icon: Clock },
          { label: "UNASSIGNED SELLERS", value: Number(sStats.unassigned_sellers || 0).toLocaleString("en-IN"), subLabel: "No assigned executive", icon: UserCheck },
          { label: "SELLERS WITH PROPERTY", value: Number(sStats.sellers_with_properties || sStats.properties_linked || 0).toLocaleString("en-IN"), subLabel: "Linked inventory", icon: Building },
          { label: "ACTIVE LISTINGS", value: Number(sStats.active_listings || sStats.active_sellers || sStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Listings in market", icon: Building },
          { label: "UNLISTED PROPERTIES", value: Number(sStats.unlisted_properties || 0).toLocaleString("en-IN"), subLabel: "Verification / Draft", icon: Activity },
          { label: "IN NEGOTIATION", value: Number(sStats.negotiation_sellers || sStats.negotiation_count || 0).toLocaleString("en-IN"), subLabel: "Offers in discussion", icon: Activity },
          { label: "CLOSED / SOLD", value: Number(sStats.closed_sold || sStats.sold_count || 0).toLocaleString("en-IN"), subLabel: "Transacted listings", icon: ShieldCheck },
        ];

      case "tenants":
        return [
          { label: "TOTAL TENANTS", value: Number(tStats.total_tenants || tStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Rental applicants", icon: Users },
          { label: "ACTIVE SEARCH", value: Number(tStats.active_search || tStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Looking for rental property", icon: Activity },
          { label: "VISIT SCHEDULED", value: Number(tStats.visit_scheduled || 0).toLocaleString("en-IN"), subLabel: "Site visits in progress", icon: Clock },
          { label: "AGREEMENT SIGNED", value: Number(tStats.agreement_signed || 0).toLocaleString("en-IN"), subLabel: "Lease closed / moved in", icon: ShieldCheck },
          { label: "PROPERTY LINKED", value: Number(tStats.linked_count || 0).toLocaleString("en-IN"), subLabel: "Matched rental property", icon: Building },
          { label: "UNASSIGNED TENANTS", value: Number(tStats.unassigned_tenants || 0).toLocaleString("en-IN"), subLabel: "No assigned executive", icon: UserCheck },
          { label: "AVG MAX BUDGET", value: `₹${Number(tStats.avg_budget_max || 0).toLocaleString("en-IN")}/mo`, subLabel: "Target rent budget", icon: Award },
          { label: "RENTAL CONVERSION RATE", value: `${tStats.conversion_rate || 0}%`, subLabel: "Intake → Moved in %", icon: TrendingUp },
        ];

      case "owners":
        return [
          { label: "TOTAL OWNERS", value: Number(oStats.total_owners || oStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Registered landlords", icon: Users },
          { label: "NEW OWNERS", value: Number(oStats.new_owners || oStats.new_count || 0).toLocaleString("en-IN"), subLabel: "Intake this period", icon: Clock },
          { label: "UNASSIGNED OWNERS", value: Number(oStats.unassigned_owners || 0).toLocaleString("en-IN"), subLabel: "No assigned executive", icon: UserCheck },
          { label: "OWNERS WITH PROPERTY", value: Number(oStats.owners_with_properties || 0).toLocaleString("en-IN"), subLabel: "Linked rental properties", icon: Building },
          { label: "AVAILABLE RENTAL PROPERTIES", value: Number(oStats.available_properties || oStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Ready for tenant matching", icon: Building },
          { label: "TENANT INTERESTED", value: Number(oStats.tenant_interested || 0).toLocaleString("en-IN"), subLabel: "Under negotiation", icon: Activity },
          { label: "RENTED / LEASE ACTIVE", value: Number(oStats.rented_properties || oStats.closed_count || 0).toLocaleString("en-IN"), subLabel: "Active lease signed", icon: ShieldCheck },
          { label: "RENTAL CONVERSION RATE", value: `${oStats.conversion_rate || 0}%`, subLabel: "Listing → Rental %", icon: UserCheck },
        ];

      case "properties":
        return [
          { label: "TOTAL PROPERTIES", value: Number(pStats.total_properties || pStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Total inventory", icon: Building },
          { label: "FOR SALE", value: Number(pStats.sale_count || 0).toLocaleString("en-IN"), subLabel: "Resale properties", icon: Home },
          { label: "FOR RENT", value: Number(pStats.rental_count || 0).toLocaleString("en-IN"), subLabel: "Rental listings", icon: Building },
          { label: "AVAILABLE INVENTORY", value: Number(pStats.available_count || pStats.active_count || 0).toLocaleString("en-IN"), subLabel: "Active on market", icon: CheckCircle },
          { label: "ON HOLD", value: Number(pStats.on_hold_count || 0).toLocaleString("en-IN"), subLabel: "Verification / draft", icon: Clock },
          { label: "SOLD", value: Number(pStats.sold_count || 0).toLocaleString("en-IN"), subLabel: "Resale closed", icon: Award },
          { label: "RENTED", value: Number(pStats.rented_count || 0).toLocaleString("en-IN"), subLabel: "Lease active", icon: ShieldCheck },
          { label: "PUBLIC LISTINGS", value: Number(pStats.public_count || 0).toLocaleString("en-IN"), subLabel: "Published to website", icon: Activity },
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
          { label: "TOTAL TRANSACTIONS", value: Number(trStats.total_count || 0).toLocaleString("en-IN"), subLabel: "Recorded receipts", icon: FileText },
          { label: "TOTAL AMOUNT", value: `₹${Number(trStats.total_amount || 0).toLocaleString("en-IN")}`, subLabel: "Funds collected/transacted", icon: IndianRupee },
          { label: "TOTAL DEAL VALUE", value: `₹${Number(trStats.total_deal_value || 0).toLocaleString("en-IN")}`, subLabel: "Associated property volume", icon: TrendingUp },
          { label: "CLEARED AMOUNT", value: `₹${Number(trStats.cleared_amount || 0).toLocaleString("en-IN")}`, subLabel: "Bank cleared collections", icon: CheckCircle },
          { label: "PENDING AMOUNT", value: `₹${Number(trStats.pending_amount || 0).toLocaleString("en-IN")}`, subLabel: "Awaiting clearance", icon: Clock },
          { label: "COMMISSION", value: `₹${Number(trStats.commission_amount || 0).toLocaleString("en-IN")}`, subLabel: "Service fee revenue", icon: Award },
          { label: "AVG TRANSACTION", value: `₹${Number(trStats.avg_amount || 0).toLocaleString("en-IN")}`, subLabel: "Average payment size", icon: Shield },
          { label: "COLLECTION RATE", value: `${trStats.collection_rate || 0}%`, subLabel: "Cleared/Received %", icon: Sparkles },
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
          { label: "ACTIVE RUNNING", value: Number(cmpStats.active_running || 0).toLocaleString("en-IN"), subLabel: "Currently broadcasting", icon: Clock },
          { label: "TOTAL AUDIENCE", value: Number(cmpStats.total_audience || 0).toLocaleString("en-IN"), subLabel: "Target recipients", icon: Users },
          { label: "MESSAGES DELIVERED", value: Number(cmpStats.total_delivered || 0).toLocaleString("en-IN"), subLabel: "Successfully delivered", icon: CheckCircle },
          { label: "DELIVERY RATE", value: `${cmpStats.avg_delivery_rate || 0}%`, subLabel: "Delivered / Sent %", icon: TrendingUp },
          { label: "MESSAGES READ", value: Number(cmpStats.total_read || 0).toLocaleString("en-IN"), subLabel: "Opened & read", icon: Eye },
          { label: "READ RATE", value: `${cmpStats.avg_read_rate || 0}%`, subLabel: "Read / Delivered %", icon: Award },
          { label: "ESTIMATED COST", value: `₹${Number(cmpStats.total_cost || 0).toLocaleString("en-IN")}`, subLabel: "Meta API expenditure", icon: IndianRupee },
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

  // Dynamic grid column class depending on exact card count to fit in one window without scrolling
  const numCards = statsList.length;
  const gridColClass =
    numCards === 1
      ? "grid-cols-1"
      : numCards === 2
      ? "grid-cols-2"
      : numCards === 3
      ? "grid-cols-3"
      : numCards === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : numCards <= 6
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8";

  return (
    <div className={`grid ${gridColClass} gap-1.5 mb-1.5 w-full`}>
      {statsList.map((st, idx) => {
        const Icon = st.icon;
        const style = cardStyles[idx % cardStyles.length];

        return (
          <div
            key={idx}
            className={`${style.bg} p-1.5 px-2 rounded-lg shadow-2xs flex items-center justify-between transition-all border border-gray-200/50 min-w-0 w-full`}
          >
            <div className="min-w-0 flex-1">
              <div className={`text-[9px] font-medium uppercase tracking-tight ${style.text} opacity-90 truncate`}>
                {st.label}
              </div>
              <div className={`text-xs font-semibold ${style.text} tracking-tight truncate`}>
                {st.value}
              </div>
              {st.subLabel && (
                <div className={`text-[8.5px] font-normal ${style.text} opacity-75 truncate`}>
                  {st.subLabel}
                </div>
              )}
            </div>
            <div className={`p-1 rounded-md shrink-0 ${style.iconBg} ml-1 flex items-center justify-center`}>
              <Icon className="w-3 h-3" />
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
