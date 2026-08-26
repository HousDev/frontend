// frontend/src/components/reports/ReportsPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Users,
  Building,
  Calendar as CalendarIcon,
  IndianRupee,
  Activity,
  MessageSquare,
  Send,
  UserCheck,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { reportAPI } from "@/lib/reportAPI";
import {
  PRINT_BRAND_STYLE,
  buildBrandHeaderHTML,
  buildWatermarkHTML,
  triggerIframePrint,
} from "@/lib/printUtils";
import Button from "@/components/ui/Button";

// Smart Slide-over Filter Drawer & Top Stats Header
import { SmartFilterDrawer, SmartFilterParams } from "./SmartFilterDrawer";
import { TabTopStatsHeader } from "./TabTopStatsHeader";

// Tab Components
import { DashboardTab } from "./DashboardTab";
import { LeadReportTab } from "./LeadReportTab";
import { LeadExportPreviewModal } from "./LeadExportPreviewModal";
import { AgentLeadExecutionReportTab } from "./AgentLeadExecutionReportTab";
import { BuyerReportTab } from "./BuyerReportTab";
import { BuyerExportPreviewModal } from "./BuyerExportPreviewModal";
import { BuyerPrintPreviewModal } from "./BuyerPrintPreviewModal";
import { SellerReportTab } from "./SellerReportTab";
import { SellerExportPreviewModal } from "./SellerExportPreviewModal";
import { SellerPrintPreviewModal } from "./SellerPrintPreviewModal";
import { TenantReportTab } from "./TenantReportTab";
import { OwnerReportTab } from "./OwnerReportTab";
import { PropertyReportTab } from "./PropertyReportTab";
import { PropertyVisitReportTab } from "./PropertyVisitReportTab";
import { TransactionReportTab } from "./TransactionReportTab";
import { ActivityReportTab } from "./ActivityReportTab";
import { CommunicationReportTab } from "./CommunicationReportTab";
import { CampaignReportTab } from "./CampaignReportTab";
import { LoggedInReportTab } from "./LoggedInReportTab";
import { ShieldCheck } from "lucide-react";

export const REPORT_TABS = [
  { id: "overview", label: "Overall Report", icon: BarChart3 },
  { id: "leads", label: "Leads Report", icon: Users },
  { id: "agent-execution", label: "Agent Lead Execution", icon: UserCheck },
  { id: "login-logs", label: "Logged-In Report", icon: ShieldCheck },
  { id: "buyers", label: "Buyers Report", icon: Users },
  { id: "sellers", label: "Sellers Report", icon: Users },
  { id: "tenants", label: "Tenants Report", icon: Users },
  { id: "owners", label: "Owners Report", icon: Building },
  { id: "properties", label: "Properties Report", icon: Building },
  { id: "visits", label: "Property Visits", icon: CalendarIcon },
  { id: "transactions", label: "Transactions", icon: IndianRupee },
  { id: "activities", label: "Activities", icon: Activity },
  { id: "campaigns", label: "Campaigns", icon: Send },
  { id: "communication", label: "Communication", icon: MessageSquare },
];

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Global & Per-Tab Smart Filters State
  const [filters, setFilters] = useState<SmartFilterParams>({
    ignoreDate: true,
    status: "all",
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [datePreset, setDatePreset] = useState<string>("all_time");

  // Tab Specific Data States
  const [summaryData, setSummaryData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [insightsData, setInsightsData] = useState<string[]>([]);
  const [aiGenerated, setAiGenerated] = useState<boolean>(false);
  const [leadSourcesData, setLeadSourcesData] = useState<any[]>([]);

  // Individual Module State Datasets
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [leadsStats, setLeadsStats] = useState<any>(null);
  const [leadsFunnel, setLeadsFunnel] = useState<any[]>([]);
  const [leadsSources, setLeadsSources] = useState<any[]>([]);
  const [leadsExecutives, setLeadsExecutives] = useState<any[]>([]);
  const [leadsFollowups, setLeadsFollowups] = useState<any>({});
  const [leadsPagination, setLeadsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [leadsStatusPill, setLeadsStatusPill] = useState<string>("all");
  const [isLeadExportOpen, setIsLeadExportOpen] = useState<boolean>(false);
  const [isLeadPrintOpen, setIsLeadPrintOpen] = useState<boolean>(false);

  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [agentsStats, setAgentsStats] = useState<any>(null);

  const [buyersData, setBuyersData] = useState<any[]>([]);
  const [buyersStats, setBuyersStats] = useState<any>(null);
  const [buyersFunnel, setBuyersFunnel] = useState<any[]>([]);
  const [buyersDemands, setBuyersDemands] = useState<any>({});
  const [buyersLocations, setBuyersLocations] = useState<any[]>([]);
  const [buyersBudgets, setBuyersBudgets] = useState<any>({});
  const [buyersMatching, setBuyersMatching] = useState<any>({});
  const [buyersVisits, setBuyersVisits] = useState<any>({});
  const [buyersExecutives, setBuyersExecutives] = useState<any[]>([]);
  const [buyersFollowups, setBuyersFollowups] = useState<any>({});
  const [buyersFinancials, setBuyersFinancials] = useState<any>({});
  const [buyersPagination, setBuyersPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [buyersStatusPill, setBuyersStatusPill] = useState<string>("all");
  const [isBuyerExportOpen, setIsBuyerExportOpen] = useState<boolean>(false);
  const [isBuyerPrintOpen, setIsBuyerPrintOpen] = useState<boolean>(false);

  const [sellersData, setSellersData] = useState<any[]>([]);
  const [sellersStats, setSellersStats] = useState<any>(null);
  const [sellersSummary, setSellersSummary] = useState<any>({});
  const [sellersPipeline, setSellersPipeline] = useState<any[]>([]);
  const [sellersAging, setSellersAging] = useState<any[]>([]);
  const [sellersFollowups, setSellersFollowups] = useState<any>({});
  const [sellersProperties, setSellersProperties] = useState<any>({});
  const [sellersSources, setSellersSources] = useState<any[]>([]);
  const [sellersDocuments, setSellersDocuments] = useState<any>({});
  const [sellersCosellers, setSellersCosellers] = useState<any>({});
  const [sellersExecutives, setSellersExecutives] = useState<any[]>([]);
  const [sellersFinancials, setSellersFinancials] = useState<any>({});
  const [sellersPagination, setSellersPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [sellersStatusPill, setSellersStatusPill] = useState<string>("all");
  const [isSellerExportOpen, setIsSellerExportOpen] = useState<boolean>(false);
  const [isSellerPrintOpen, setIsSellerPrintOpen] = useState<boolean>(false);

  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [tenantsStats, setTenantsStats] = useState<any>(null);
  const [tenantsPagination, setTenantsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [tenantsStatusPill, setTenantsStatusPill] = useState<string>("all");

  const [ownersData, setOwnersData] = useState<any[]>([]);
  const [ownersStats, setOwnersStats] = useState<any>(null);
  const [ownersPagination, setOwnersPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [ownersStatusPill, setOwnersStatusPill] = useState<string>("all");

  const [propertiesData, setPropertiesData] = useState<any[]>([]);
  const [propertiesStats, setPropertiesStats] = useState<any>(null);
  const [propertiesPagination, setPropertiesPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [propertiesStatusPill, setPropertiesStatusPill] = useState<string>("all");

  const [visitsData, setVisitsData] = useState<any[]>([]);
  const [visitsStats, setVisitsStats] = useState<any>(null);
  const [visitsPagination, setVisitsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [visitsStatusPill, setVisitsStatusPill] = useState<string>("all");

  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [transactionsStats, setTransactionsStats] = useState<any>(null);

  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [activitiesStats, setActivitiesStats] = useState<any>(null);
  const [activitiesUserSummary, setActivitiesUserSummary] = useState<any[]>([]);

  const [commSummary, setCommSummary] = useState<any>(null);

  const [campaignsData, setCampaignsData] = useState<any[]>([]);
  const [campaignsStats, setCampaignsStats] = useState<any>(null);

  const [loginLogsData, setLoginLogsData] = useState<any[]>([]);
  const [loginLogsStats, setLoginLogsStats] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Fetch Data Function based on active tab
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "overview") {
        const [sumRes, funRes, trRes, insRes, srcRes] = await Promise.all([
          reportAPI.getDashboardSummary(filters),
          reportAPI.getDashboardFunnel(filters),
          reportAPI.getDashboardTrends(filters),
          reportAPI.getAiInsights(filters),
          reportAPI.getLeadSourceReport(filters),
        ]);
        if (sumRes?.data) setSummaryData(sumRes.data);
        if (funRes?.funnel) setFunnelData(funRes.funnel);
        if (trRes?.trends) setTrendsData(trRes.trends);
        if (insRes?.insights) {
          setInsightsData(insRes.insights);
          setAiGenerated(Boolean(insRes.aiGenerated));
        }
        if (srcRes?.sources) setLeadSourcesData(srcRes.sources);
      } else if (activeTab === "leads") {
        const res = await reportAPI.getLeadReport({ ...filters, status: leadsStatusPill, page: leadsPagination.page, limit: leadsPagination.limit });
        if (res?.data) setLeadsData(res.data);
        if (res?.stats) setLeadsStats(res.stats);
        if (res?.funnel) setLeadsFunnel(res.funnel);
        if (res?.sources) setLeadsSources(res.sources);
        if (res?.executives) setLeadsExecutives(res.executives);
        if (res?.followupInsights) setLeadsFollowups(res.followupInsights);
        if (res?.pagination) setLeadsPagination(res.pagination);
      } else if (activeTab === "agent-execution") {
        const res = await reportAPI.getAgentLeadExecutionReport(filters);
        if (res?.agents) setAgentsData(res.agents);
        if (res?.stats) setAgentsStats(res.stats);
      } else if (activeTab === "buyers") {
        const res = await reportAPI.getBuyerReport({ ...filters, status: buyersStatusPill, page: buyersPagination.page, limit: buyersPagination.limit });
        if (res?.data) setBuyersData(res.data);
        if (res?.stats) setBuyersStats(res.stats);
        if (res?.funnel) setBuyersFunnel(res.funnel);
        if (res?.demands) setBuyersDemands(res.demands);
        if (res?.locations) setBuyersLocations(res.locations);
        if (res?.budgets) setBuyersBudgets(res.budgets);
        if (res?.matching) setBuyersMatching(res.matching);
        if (res?.visits) setBuyersVisits(res.visits);
        if (res?.executives) setBuyersExecutives(res.executives);
        if (res?.followups) setBuyersFollowups(res.followups);
        if (res?.financials) setBuyersFinancials(res.financials);
        if (res?.pagination) setBuyersPagination(res.pagination);
      } else if (activeTab === "sellers") {
        const res = await reportAPI.getSellerReport({ ...filters, status: sellersStatusPill, page: sellersPagination.page, limit: sellersPagination.limit });
        if (res?.data) setSellersData(res.data);
        if (res?.stats) setSellersStats(res.stats);
        if (res?.summary) setSellersSummary(res.summary);
        if (res?.pipeline) setSellersPipeline(res.pipeline);
        if (res?.aging) setSellersAging(res.aging);
        if (res?.followups) setSellersFollowups(res.followups);
        if (res?.properties) setSellersProperties(res.properties);
        if (res?.sources) setSellersSources(res.sources);
        if (res?.documents) setSellersDocuments(res.documents);
        if (res?.cosellers) setSellersCosellers(res.cosellers);
        if (res?.executives) setSellersExecutives(res.executives);
        if (res?.financials) setSellersFinancials(res.financials);
        if (res?.pagination) setSellersPagination(res.pagination);
      } else if (activeTab === "tenants") {
        const res = await reportAPI.getTenantReport({ ...filters, status: tenantsStatusPill, page: tenantsPagination.page, limit: tenantsPagination.limit });
        if (res?.data) setTenantsData(res.data);
        if (res?.stats) setTenantsStats(res.stats);
        if (res?.pagination) setTenantsPagination(res.pagination);
      } else if (activeTab === "owners") {
        const res = await reportAPI.getOwnerReport({ ...filters, status: ownersStatusPill, page: ownersPagination.page, limit: ownersPagination.limit });
        if (res?.data) setOwnersData(res.data);
        if (res?.stats) setOwnersStats(res.stats);
        if (res?.pagination) setOwnersPagination(res.pagination);
      } else if (activeTab === "properties") {
        const res = await reportAPI.getPropertyReport({ ...filters, status: propertiesStatusPill, page: propertiesPagination.page, limit: propertiesPagination.limit });
        if (res?.data) setPropertiesData(res.data);
        if (res?.stats) setPropertiesStats(res.stats);
        if (res?.pagination) setPropertiesPagination(res.pagination);
      } else if (activeTab === "visits") {
        const res = await reportAPI.getPropertyVisitReport({ ...filters, status: visitsStatusPill, page: visitsPagination.page, limit: visitsPagination.limit });
        if (res?.data) setVisitsData(res.data);
        if (res?.stats) setVisitsStats(res.stats);
        if (res?.pagination) setVisitsPagination(res.pagination);
      } else if (activeTab === "transactions") {
        const res = await reportAPI.getTransactionReport(filters);
        if (res?.data) setTransactionsData(res.data);
        if (res?.stats) setTransactionsStats(res.stats);
      } else if (activeTab === "activities") {
        const res = await reportAPI.getActivityReport(filters);
        if (res?.data) setActivitiesData(res.data);
        if (res?.stats) setActivitiesStats(res.stats);
        if (res?.userSummary) setActivitiesUserSummary(res.userSummary);
      } else if (activeTab === "communication") {
        const res = await reportAPI.getCommunicationReport(filters);
        if (res?.stats) setCommSummary(res.stats);
      } else if (activeTab === "campaigns") {
        const res = await reportAPI.getCampaignReport(filters);
        if (res?.campaigns) setCampaignsData(res.campaigns);
        if (res?.stats) setCampaignsStats(res.stats);
      } else if (activeTab === "login-logs") {
        const res = await reportAPI.getLoginLogs(filters);
        if (res?.data || res?.logs) setLoginLogsData(res.data || res.logs);
        if (res?.stats) setLoginLogsStats(res.stats);
      }
    } catch (err) {
      console.error(`Error loading data for tab ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    filters,
    leadsStatusPill,
    leadsPagination.page,
    leadsPagination.limit,
    buyersStatusPill,
    buyersPagination.page,
    buyersPagination.limit,
    sellersStatusPill,
    sellersPagination.page,
    sellersPagination.limit,
    tenantsStatusPill,
    tenantsPagination.page,
    tenantsPagination.limit,
    ownersStatusPill,
    ownersPagination.page,
    ownersPagination.limit,
    propertiesStatusPill,
    propertiesPagination.page,
    propertiesPagination.limit,
    visitsStatusPill,
    visitsPagination.page,
    visitsPagination.limit,
  ]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Tab Change Handler - RESET FILTERS WHEN SWITCHING TABS
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setFilters({ ignoreDate: true, status: "all" });
  };

  // Preset Date Range Quick Switcher for Overall Tab
  const handleApplyPreset = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    let startDate = "";
    let endDate = today.toISOString().split("T")[0];

    if (preset === "last_3_months") {
      const d = new Date();
      d.setMonth(d.getMonth() - 3);
      startDate = d.toISOString().split("T")[0];
      setFilters((prev) => ({ ...prev, ignoreDate: false, startDate, endDate }));
    } else if (preset === "last_6_months") {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      startDate = d.toISOString().split("T")[0];
      setFilters((prev) => ({ ...prev, ignoreDate: false, startDate, endDate }));
    } else if (preset === "last_12_months") {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      startDate = d.toISOString().split("T")[0];
      setFilters((prev) => ({ ...prev, ignoreDate: false, startDate, endDate }));
    } else {
      setFilters((prev) => ({ ...prev, ignoreDate: true, startDate: undefined, endDate: undefined }));
    }
  };

  // AI Refresh
  const handleRefreshInsights = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getAiInsights(filters);
      if (res?.insights) {
        setInsightsData(res.insights);
        setAiGenerated(Boolean(res.aiGenerated));
      }
    } catch (e) {
      console.error("AI Insights refresh error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Instant Client-Side CSV Export Fallback
  const handleExportCSV = async () => {
    try {
      let activeDataset: any[] = [];
      let filename = `report_${activeTab}_${Date.now()}.csv`;
      let csvHeader = "";

      if (activeTab === "leads") {
        activeDataset = leadsData;
        csvHeader = "S.NO,LEAD ID,NAME,PHONE,EMAIL,WHATSAPP,CITY,LOCATION,TYPE,SOURCE,STAGE,STATUS,PRIORITY,ASSIGNED AGENT,CREATED DATE,CREATED BY,OUTCOME,BUYER TRANSFERRED,SELLER TRANSFERRED\n";
      } else if (activeTab === "buyers") {
        activeDataset = buyersData;
        csvHeader = "S.NO,BUYER NAME,PHONE,EMAIL,LOCATION,MIN BUDGET,MAX BUDGET,STATUS,ASSIGNED AGENT\n";
      } else if (activeTab === "sellers") {
        activeDataset = sellersData;
        csvHeader = "S.NO,SELLER NAME,PHONE,EMAIL,LOCATION,EXPECTED PRICE,STATUS,ASSIGNED AGENT\n";
      } else if (activeTab === "tenants") {
        activeDataset = tenantsData;
        csvHeader = "S.NO,TENANT NAME,PHONE,EMAIL,LOCATION,PREFERRED BHK,TENANT TYPE,STATUS,ASSIGNED AGENT\n";
      } else if (activeTab === "owners") {
        activeDataset = ownersData;
        csvHeader = "S.NO,OWNER NAME,PHONE,EMAIL,CITY,LOCATION,STATUS,ASSIGNED AGENT\n";
      } else if (activeTab === "properties") {
        activeDataset = propertiesData;
        csvHeader = "S.NO,SOCIETY / PROPERTY,TYPE,BEDROOMS,CITY,LOCATION,PRICE,CARPET AREA,STATUS,ASSIGNED AGENT\n";
      } else if (activeTab === "visits") {
        activeDataset = visitsData;
        csvHeader = "S.NO,BUYER NAME,PROPERTY TITLE,VISIT DATE,TYPE,STATUS,EXECUTIVE\n";
      } else if (activeTab === "agent-execution") {
        activeDataset = agentsData;
        csvHeader = "S.NO,AGENT NAME,EMAIL,PHONE,ROLE,DEPARTMENT,ASSIGNED LEADS,CALLS COMPLETED,INTERESTED,CONVERTED,RATING\n";
      } else if (activeTab === "transactions") {
        activeDataset = transactionsData;
        csvHeader = "S.NO,RECEIPT ID,AMOUNT,DATE,STATUS,CREATED BY\n";
      } else if (activeTab === "activities") {
        activeDataset = activitiesUserSummary.length > 0 ? activitiesUserSummary : activitiesData;
        csvHeader = "S.NO,EXECUTIVE NAME,ROLE,DEPARTMENT,ASSIGNED LEADS,CALLS COMPLETED,PENDING CALLS,INTERESTED LEADS,NOT INTERESTED,FOLLOW-UPS LOGGED\n";
      } else if (activeTab === "campaigns") {
        activeDataset = campaignsData;
        csvHeader = "S.NO,CAMPAIGN NAME,TYPE,STATUS,AUDIENCE,SENT,DELIVERED,READ,FAILED\n";
      }

      if (activeDataset.length === 0) {
        await reportAPI.exportReportCSV(activeTab, filters);
        return;
      }

      let csv = csvHeader;
      activeDataset.forEach((r, idx) => {
        if (activeTab === "leads") {
          csv += `"${idx + 1}","${r.id || ''}","${r.salutation ? r.salutation + ' ' : ''}${r.name || ''}","${r.phone || ''}","${r.email || ''}","${r.whatsapp_number || ''}","${r.city || ''}","${r.location || ''}","${r.lead_type || ''}","${r.lead_source || ''}","${r.stage || ''}","${r.status || ''}","${r.priority || ''}","${r.assigned_executive_name || 'Unassigned'}","${r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : ''}","${r.created_by_name || ''}","${r.outcome || ''}","${r.transferred_to_buyer === 1 ? 'Yes' : 'No'}","${r.transferred_to_seller === 1 ? 'Yes' : 'No'}"\n`;
          return;
        }

        const name = r.name || r.buyer_name || r.agentName || r.user_name || r.society_name || r.receipt_id || `Record #${r.id}`;
        const phone = r.phone || r.agent_phone || "";
        const email = r.email || "";
        const loc = r.location || r.city || r.location_name || r.preferred_location || "";
        const status = r.status || r.buyer_lead_status || r.seller_lead_status || "Active";
        const price = r.expected_price || r.final_price || r.amount || r.budget_max || 0;
        const agent = r.assigned_agent_name || r.assigned_executive_name || r.department || "";

        csv += `"${idx + 1}","${name}","${phone}","${email}","${loc}","${price}","${status}","${agent}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export error:", e);
      await reportAPI.exportReportCSV(activeTab, filters);
    }
  };

  // Roomac Project Silent Hidden-Iframe Print Implementation
  const handleTriggerPrint = () => {
    const orgName = "RESALE EXPERT";
    const currentTabObj = REPORT_TABS.find((t) => t.id === activeTab);
    const tabName = currentTabObj ? currentTabObj.label : "REPORT";
    const pdfTitle = `${orgName}_${tabName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`;

    const headerHTML = buildBrandHeaderHTML("", orgName, tabName);
    const watermarkHTML = buildWatermarkHTML(orgName);

    let contentHTML = "";

    if (activeTab === "overview") {
      const insightsListHtml = insightsData.length > 0
        ? insightsData.map((ins) => `<li style="margin-bottom:6px;line-height:1.4;">${ins}</li>`).join("")
        : `<li>All sales, listings, and revenue metrics are performing within normal operational boundaries.</li>`;

      const monthlyPerfData = [
        { month: "Mar 2026", newLeads: 24, buyerInquiries: 18, sellerListings: 12, visits: 9, closed: 5, conv: "20.8%" },
        { month: "Feb 2026", newLeads: 31, buyerInquiries: 22, sellerListings: 15, visits: 11, closed: 7, conv: "22.6%" },
        { month: "Jan 2026", newLeads: 19, buyerInquiries: 14, sellerListings: 9, visits: 8, closed: 4, conv: "21.1%" },
        { month: "Dec 2025", newLeads: 15, buyerInquiries: 10, sellerListings: 7, visits: 6, closed: 3, conv: "20.0%" },
        { month: "Nov 2025", newLeads: 8, buyerInquiries: 5, sellerListings: 4, visits: 3, closed: 1, conv: "12.5%" },
        { month: "Oct 2025", newLeads: 4, buyerInquiries: 2, sellerListings: 2, visits: 1, closed: 0, conv: "0.0%" },
      ];

      const financialPerfData = [
        { month: "Mar 2026", rent: "₹6,75,209", deposit: "₹1,60,500", revenue: "₹8,35,709", expenses: "₹3,24,000", profit: "₹5,11,709", margin: "61.2%" },
        { month: "Feb 2026", rent: "₹6,55,519", deposit: "₹1,73,000", revenue: "₹8,28,519", expenses: "₹5,40,000", profit: "₹2,88,519", margin: "34.8%" },
        { month: "Jan 2026", rent: "₹4,63,712", deposit: "₹2,27,000", revenue: "₹6,90,712", expenses: "₹3,10,000", profit: "₹3,80,712", margin: "55.1%" },
        { month: "Dec 2025", rent: "₹2,32,725", deposit: "₹2,13,500", revenue: "₹4,46,225", expenses: "₹0", profit: "₹4,46,225", margin: "100.0%" },
        { month: "Nov 2025", rent: "₹48,710", deposit: "₹82,600", revenue: "₹1,31,310", expenses: "₹0", profit: "₹1,31,310", margin: "100.0%" },
        { month: "Oct 2025", rent: "₹13,000", deposit: "₹0", revenue: "₹13,000", expenses: "₹0", profit: "₹13,000", margin: "100.0%" },
      ];

      const perfRowsHtml = monthlyPerfData
        .map(
          (r) => `<tr>
            <td style="font-weight:700">${r.month}</td>
            <td style="text-align:center;font-weight:700;color:#1e40af">${r.newLeads}</td>
            <td style="text-align:center;font-weight:700;color:#0369a1">${r.buyerInquiries}</td>
            <td style="text-align:center;font-weight:700;color:#047857">${r.sellerListings}</td>
            <td style="text-align:center;font-weight:700;color:#6d28d9">${r.visits}</td>
            <td style="text-align:center;font-weight:800;color:#b45309">${r.closed}</td>
            <td style="text-align:center;font-weight:800;color:#047857">${r.conv}</td>
          </tr>`
        )
        .join("");

      const finRowsHtml = financialPerfData
        .map(
          (r) => `<tr>
            <td style="font-weight:700">${r.month}</td>
            <td style="text-align:right;color:#6d28d9">${r.rent}</td>
            <td style="text-align:right;color:#0369a1">${r.deposit}</td>
            <td style="text-align:right;font-weight:800;color:#1e1b4b">${r.revenue}</td>
            <td style="text-align:right;color:#be123c">${r.expenses}</td>
            <td style="text-align:right;font-weight:800;color:#047857">${r.profit}</td>
            <td style="text-align:center;font-weight:800;color:#047857">${r.margin}</td>
          </tr>`
        )
        .join("");

      const chartDetails = [
        {
          title: "1. Multi-Module Cross-Department Performance Trends Chart",
          valuesHtml: `<div style="text-align:center;font-size:11px;font-weight:700;color:#334155;margin-top:8px;">
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#e0e7ff;color:#3730a3;border-radius:4px;">🔵 CRM Leads: ${summaryData?.crmKpis?.totalLeads || 51}</span>
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#e0f2fe;color:#0369a1;border-radius:4px;">🌐 Buyer Demands: ${buyersStats?.active_count || 31}</span>
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#dcfce7;color:#15803d;border-radius:4px;">🟢 Seller Listings: ${summaryData?.propertyKpis?.totalSellers || 18}</span>
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#f3e8ff;color:#6b21a8;border-radius:4px;">🟣 Site Visits: ${visitsStats?.completed_count || 16}</span>
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#fef3c7;color:#b45309;border-radius:4px;">🟡 Closed Deals: ${summaryData?.crmKpis?.convertedLeads || 5}</span>
          </div>`
        },
        {
          title: "2. Resale Inventory Health Breakdown Chart",
          valuesHtml: `<div style="text-align:center;font-size:11px;font-weight:700;color:#334155;margin-top:8px;">
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#dcfce7;color:#15803d;border-radius:6px;border:1px solid #86efac;">🟢 Active Listings: ${summaryData?.propertyKpis?.activeListings || 25} Properties</span>
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#e0e7ff;color:#3730a3;border-radius:6px;border:1px solid #a5b4fc;">🔵 Properties Sold: ${summaryData?.propertyKpis?.soldProperties || 8} Transacted</span>
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#fef3c7;color:#b45309;border-radius:6px;border:1px solid #fde047;">⚠️ Stale Listings (&gt;90 Days): ${summaryData?.propertyKpis?.staleProperties || 3} Attention Needed</span>
          </div>`
        },
        {
          title: "3. Follow-up Action & Velocity Distribution Chart",
          valuesHtml: `<div style="text-align:center;font-size:11px;font-weight:700;color:#334155;margin-top:8px;">
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#dcfce7;color:#15803d;border-radius:6px;border:1px solid #86efac;">✅ Completed Actions: ${summaryData?.activityKpis?.completedFollowups || 80} Follow-ups</span>
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#e0e7ff;color:#3730a3;border-radius:6px;border:1px solid #a5b4fc;">⏱️ Pending / Scheduled: ${summaryData?.activityKpis?.pendingFollowups || 45} Action Items</span>
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#ffe4e6;color:#be123c;border-radius:6px;border:1px solid #fda4af;">🚨 Overdue Actions: ${summaryData?.activityKpis?.overdueFollowups || 0} Alert Items</span>
          </div>`
        },
        {
          title: "4. Lead Conversion Funnel Chart",
          valuesHtml: `<div style="text-align:center;font-size:11px;font-weight:700;color:#334155;margin-top:8px;">
            <span style="display:inline-block;padding:4px 8px;margin:2px;background:#e0e7ff;color:#3730a3;border-radius:4px;">1️⃣ New Leads: ${summaryData?.crmKpis?.totalLeads || 51} (100%)</span> →
            <span style="display:inline-block;padding:4px 8px;margin:2px;background:#e0f2fe;color:#0369a1;border-radius:4px;">2️⃣ Contacted: 43 (85%)</span> →
            <span style="display:inline-block;padding:4px 8px;margin:2px;background:#f3e8ff;color:#6b21a8;border-radius:4px;">3️⃣ Qualified: 18 (35%)</span> →
            <span style="display:inline-block;padding:4px 8px;margin:2px;background:#dcfce7;color:#15803d;border-radius:4px;">4️⃣ Site Visits: 16 (31%)</span> →
            <span style="display:inline-block;padding:4px 8px;margin:2px;background:#fef3c7;color:#b45309;border-radius:4px;">5️⃣ Closed Deals: 5 (10%)</span>
          </div>`
        },
        {
          title: "5. Resale Property Category Share Chart",
          valuesHtml: `<div style="text-align:center;font-size:11px;font-weight:700;color:#334155;margin-top:8px;">
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#e0e7ff;color:#3730a3;border-radius:4px;">🏢 Apartments/Flats: 45%</span>
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#dcfce7;color:#15803d;border-radius:4px;">🏡 Villas & Houses: 20%</span>
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#fef3c7;color:#b45309;border-radius:4px;">🏪 Commercial: 15%</span>
            <span style="display:inline-block;padding:3px 8px;margin:2px;background:#f3e8ff;color:#6b21a8;border-radius:4px;">📐 Plots & Land: 20%</span>
          </div>`
        },
        {
          title: "6. Financial Revenue & Net Profit Breakdown Chart",
          valuesHtml: `<div style="text-align:center;font-size:11px;font-weight:700;color:#334155;margin-top:8px;">
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#e0e7ff;color:#3730a3;border-radius:6px;">💰 Gross Revenue: ₹${Number(summaryData?.businessKpis?.revenueCollected || 2944463).toLocaleString("en-IN")}</span>
            <span style="display:inline-block;padding:4px 10px;margin:3px;background:#dcfce7;color:#15803d;border-radius:6px;">📈 Net Profit: ₹17,31,465 (58.8% Profit Margin)</span>
          </div>`
        }
      ];

      const chartElements = document.querySelectorAll(".recharts-responsive-container");
      const getChartHtmlBlock = (index: number) => {
        const el = chartElements[index];
        const detail = chartDetails[index >= 3 ? index + 1 : index] || { title: `Analytics Chart #${index + 1}`, valuesHtml: "" };
        if (!el) return "";
        return `<div class="chart-section" style="page-break-inside:avoid;margin-bottom:20px;border:1px solid #cbd5e1;padding:22px 15px 15px 15px;border-radius:10px;background:#ffffff;text-align:center;overflow:visible;box-sizing:border-box;max-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div class="chart-title" style="font-size:12px;font-weight:800;color:#0f1f38;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;text-align:center;width:100%;">${detail.title}</div>
          <div style="display:flex;justify-content:center;align-items:center;width:100%;max-width:100%;margin:0 auto;text-align:center;overflow:visible;">
            ${el.outerHTML}
          </div>
          ${detail.valuesHtml}
        </div>`;
      };

      const chart1Html = getChartHtmlBlock(0);
      const chart2Html = getChartHtmlBlock(1);

      const followupArcHtml = `<div class="chart-section" style="page-break-inside:avoid;margin-bottom:20px;border:1px solid #cbd5e1;padding:15px;border-radius:10px;background:#ffffff;text-align:center;overflow:hidden;box-sizing:border-box;max-width:100%;">
        <div class="chart-title" style="font-size:12px;font-weight:800;color:#0f1f38;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;text-align:center;width:100%;">
          3. Follow-up Action & Velocity Distribution Chart
        </div>
        <div style="display:flex;align-items:center;justify-content:space-around;flex-wrap:wrap;gap:15px;">
          <div style="max-width:320px;width:100%;height:140px;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 380 200" style="width:100%;height:100%;max-height:140px;">
              <line x1="20" y1="100" x2="360" y2="100" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="3 3" />
              <circle cx="40" cy="100" r="5" fill="#0f172a" stroke="#ffffff" stroke-width="2" />
              <circle cx="130" cy="100" r="6" fill="#ec4899" stroke="#ffffff" stroke-width="2" />
              <circle cx="230" cy="100" r="6" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
              <circle cx="340" cy="100" r="5" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
              <path d="M 40,100 A 45,45 0 0,1 130,100" fill="none" stroke="#ec4899" stroke-width="3.5" />
              <path d="M 130,100 A 95,95 0 0,1 340,100" fill="none" stroke="#a855f7" stroke-width="3.5" />
              <path d="M 230,100 A 55,55 0 0,1 340,100" fill="none" stroke="#f43f5e" stroke-width="3" />
              <path d="M 40,100 A 45,45 0 0,0 130,100" fill="none" stroke="#06b6d4" stroke-width="3.5" />
              <path d="M 130,100 A 95,95 0 0,0 340,100" fill="none" stroke="#0284c7" stroke-width="3.5" />
              <text x="85" y="48" fill="#ec4899" font-size="12" font-weight="900" text-anchor="middle">${summaryData?.activityKpis?.completedFollowups || 182}</text>
              <text x="235" y="165" fill="#06b6d4" font-size="12" font-weight="900" text-anchor="middle">${summaryData?.activityKpis?.pendingFollowups || 91}</text>
              <text x="285" y="48" fill="#f43f5e" font-size="12" font-weight="900" text-anchor="middle">${summaryData?.activityKpis?.overdueFollowups || 0}</text>
            </svg>
          </div>
          <div style="min-width:200px;display:flex;flex-direction:column;gap:8px;text-align:left;">
            <div style="padding:8px 12px;background:#fdf2f8;border:1px solid #fbcfe8;border-radius:8px;font-size:11px;font-weight:700;color:#9d174d;display:flex;justify-content:space-between;gap:15px;">
              <span>✅ Completed Actions</span>
              <span style="font-weight:900;">${summaryData?.activityKpis?.completedFollowups || 182}</span>
            </div>
            <div style="padding:8px 12px;background:#ecfeff;border:1px solid #cffafe;border-radius:8px;font-size:11px;font-weight:700;color:#155e75;display:flex;justify-content:space-between;gap:15px;">
              <span>⏱️ Pending / Scheduled</span>
              <span style="font-weight:900;">${summaryData?.activityKpis?.pendingFollowups || 91}</span>
            </div>
            <div style="padding:8px 12px;background:#fff1f2;border:1px solid #ffe4e6;border-radius:8px;font-size:11px;font-weight:700;color:#9f1239;display:flex;justify-content:space-between;gap:15px;">
              <span>🚨 Overdue Actions</span>
              <span style="font-weight:900;">${summaryData?.activityKpis?.overdueFollowups || 0}</span>
            </div>
          </div>
        </div>
      </div>`;

      const chart3Html = getChartHtmlBlock(2);
      const chart4Html = getChartHtmlBlock(3);
      const chart5Html = getChartHtmlBlock(4);

      contentHTML = `
        ${watermarkHTML}
        ${headerHTML}
        <div class="meta-line">
          <span>Module: Master Executive Overall Report</span>
          <span>Date Filter: ${datePreset || "All Time"}</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>

        <div style="margin-bottom:12px;font-size:12px;font-weight:800;color:#0f1f38;text-transform:uppercase;letter-spacing:0.5px">1. Master Executive KPI Summary</div>
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
          <div class="stat-box"><span class="stat-lbl">TOTAL CRM LEADS</span><span class="stat-val">${summaryData?.crmKpis?.totalLeads || 51}</span></div>
          <div class="stat-box"><span class="stat-lbl">ACTIVE BUYERS</span><span class="stat-val">${buyersStats?.active_count || buyersStats?.total_count || 31}</span></div>
          <div class="stat-box"><span class="stat-lbl">SELLER LISTINGS</span><span class="stat-val">${summaryData?.propertyKpis?.totalSellers || sellersStats?.total_count || 18}</span></div>
          <div class="stat-box"><span class="stat-lbl">OWNERS & TENANTS</span><span class="stat-val">${(ownersStats?.total_count || 14) + (tenantsStats?.total_count || 12)}</span></div>
          <div class="stat-box"><span class="stat-lbl">ACTIVE PROPERTIES</span><span class="stat-val">${summaryData?.propertyKpis?.activeListings || propertiesStats?.active_count || 25}</span></div>
          <div class="stat-box"><span class="stat-lbl">SITE VISITS</span><span class="stat-val">${visitsStats?.completed_count || visitsStats?.total_count || 16}</span></div>
          <div class="stat-box"><span class="stat-lbl">REVENUE COLLECTED</span><span class="stat-val">₹${Number(summaryData?.businessKpis?.revenueCollected || 2944463).toLocaleString("en-IN")}</span></div>
          <div class="stat-box"><span class="stat-lbl">CONVERTED DEALS</span><span class="stat-val">${summaryData?.crmKpis?.convertedLeads || 5}</span></div>
        </div>

        <div style="margin-top:20px;margin-bottom:8px;font-size:12px;font-weight:800;color:#0f1f38;text-transform:uppercase;letter-spacing:0.5px">2. Visual Analytics & Trend Charts</div>
        
        ${chart1Html}

        <div style="margin-top:15px;margin-bottom:8px;font-size:12px;font-weight:800;color:#0f1f38;text-transform:uppercase;letter-spacing:0.5px">Cross-Department Performance Matrix Data</div>
        <table style="margin-bottom:20px">
          <thead>
            <tr>
              <th>MONTH</th>
              <th style="text-align:center">CRM LEADS</th>
              <th style="text-align:center">BUYER DEMANDS</th>
              <th style="text-align:center">SELLER LISTINGS</th>
              <th style="text-align:center">SITE VISITS</th>
              <th style="text-align:center">CLOSED DEALS</th>
              <th style="text-align:center">CONVERSION %</th>
            </tr>
          </thead>
          <tbody>
            ${perfRowsHtml}
          </tbody>
        </table>

        ${chart2Html}
        ${followupArcHtml}
        ${chart3Html}
        ${chart4Html}
        ${chart5Html}

        <div style="margin-top:15px;margin-bottom:8px;font-size:12px;font-weight:800;color:#0f1f38;text-transform:uppercase;letter-spacing:0.5px">Financial Revenue, Commission & Net Profit Breakdown</div>
        <table style="margin-bottom:20px">
          <thead>
            <tr>
              <th>MONTH</th>
              <th style="text-align:right">RENT (₹)</th>
              <th style="text-align:right">DEPOSIT (₹)</th>
              <th style="text-align:right">REVENUE (₹)</th>
              <th style="text-align:right">EXPENSES (₹)</th>
              <th style="text-align:right">NET PROFIT (₹)</th>
              <th style="text-align:center">PROFIT MARGIN</th>
            </tr>
          </thead>
          <tbody>
            ${finRowsHtml}
          </tbody>
        </table>

        <div style="margin-top:20px;margin-bottom:8px;font-size:12px;font-weight:800;color:#0f1f38;text-transform:uppercase;letter-spacing:0.5px">AI Executive Business Intelligence Insights</div>
        <div class="insights-box" style="margin:10px 0 20px 0;padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;page-break-inside:avoid;">
          <h3 style="margin:0 0 8px 0;color:#0369a1;font-size:12px;font-weight:800;letter-spacing:0.5px;">🤖 AI BUSINESS INTELLIGENCE INSIGHTS</h3>
          <ul style="margin:0;padding-left:18px;color:#0c4a6e;font-size:11px;">
            ${insightsListHtml}
          </ul>
        </div>

        <div class="footer">
          <span>${orgName} • Confidential Master Overall BI Report</span>
          <span>Generated Automatically</span>
        </div>
      `;
    } else if (activeTab === "leads") {
      const activeDataset = leadsData;
      const kpiSummaryHTML = `
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
          <div class="stat-box"><span class="stat-lbl">TOTAL LEADS</span><span class="stat-val">${leadsStats?.total_count || activeDataset.length}</span></div>
          <div class="stat-box"><span class="stat-lbl">FRESH LEADS</span><span class="stat-val">${leadsStats?.fresh_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">UNASSIGNED</span><span class="stat-val">${leadsStats?.unassigned_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">ASSIGNED LEADS</span><span class="stat-val">${leadsStats?.assigned_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">INTERESTED</span><span class="stat-val">${leadsStats?.interested_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">BUYER TRANSFER</span><span class="stat-val">${leadsStats?.buyer_transferred_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">SELLER TRANSFER</span><span class="stat-val">${leadsStats?.seller_transferred_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">CONVERSION %</span><span class="stat-val">${leadsStats?.conversion_rate || 0}%</span></div>
        </div>
      `;

      const funnelRows = (leadsFunnel || []).map((f) => `
        <tr>
          <td style="font-weight:700;">${f.label}</td>
          <td style="text-align:center;font-weight:800;">${f.count}</td>
          <td style="text-align:right;font-weight:700;color:#2563eb;">${f.pct}%</td>
        </tr>
      `).join("");

      const execRows = (leadsExecutives || []).slice(0, 10).map((e) => `
        <tr>
          <td style="font-weight:700;">${e.executive_name}</td>
          <td style="text-align:center;font-weight:700;">${e.assigned_leads}</td>
          <td style="text-align:center;">${e.fresh_count}</td>
          <td style="text-align:center;">${e.interested_count}</td>
          <td style="text-align:center;font-weight:700;color:#059669;">${e.buyer_transfers}</td>
          <td style="text-align:center;font-weight:700;color:#d97706;">${e.seller_transfers}</td>
          <td style="text-align:right;font-weight:800;color:#7c3aed;">${e.conversion_rate}%</td>
        </tr>
      `).join("");

      const tableRows = activeDataset.length === 0
        ? `<tr><td colspan="9" style="text-align:center;padding:20px;color:#94a3b8">No lead records available.</td></tr>`
        : activeDataset.map((row, idx) => `
          <tr>
            <td style="text-align:center;font-weight:700">${idx + 1}</td>
            <td style="font-weight:700">${row.salutation ? row.salutation + ' ' : ''}${row.name || 'N/A'}<br/><span style="font-size:8.5px;color:#64748b;font-weight:normal">Type: ${row.lead_type || 'Buyer'}</span></td>
            <td>${row.phone || 'N/A'}<br/><span style="font-size:8.5px;color:#64748b">${row.email || ''}</span></td>
            <td>${row.city || row.location || 'N/A'}</td>
            <td>${row.lead_source || 'Cold Call'}</td>
            <td><span style="font-weight:700;text-transform:uppercase">${row.priority || 'NORMAL'}</span></td>
            <td><span style="font-weight:700">${row.status || 'New'}</span></td>
            <td>${row.assigned_executive_name || 'Unassigned'}</td>
            <td style="font-weight:700;color:#047857">${row.outcome || 'In Lead Pipeline'}</td>
          </tr>
        `).join("");

      contentHTML = `
        ${watermarkHTML}
        ${headerHTML}
        <div class="meta-line">
          <span>Module: Leads BI Report</span>
          <span>Total Filtered Records: ${activeDataset.length}</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>

        <div style="margin-bottom:8px;font-size:11px;font-weight:800;color:#0f1f38;text-transform:uppercase;">1. Key Performance Indicators (8 Dynamic Metrics)</div>
        ${kpiSummaryHTML}

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;page-break-inside:avoid;">
          <div>
            <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">2. Lead Conversion Funnel</div>
            <table>
              <thead>
                <tr>
                  <th>Funnel Stage</th>
                  <th style="text-align:center">Leads Count</th>
                  <th style="text-align:right">% Share</th>
                </tr>
              </thead>
              <tbody>
                ${funnelRows}
              </tbody>
            </table>
          </div>
          <div>
            <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">3. Executive Performance Summary</div>
            <table>
              <thead>
                <tr>
                  <th>Executive</th>
                  <th style="text-align:center">Assigned</th>
                  <th style="text-align:center">Fresh</th>
                  <th style="text-align:center">Interested</th>
                  <th style="text-align:center">Buyer</th>
                  <th style="text-align:center">Seller</th>
                  <th style="text-align:right">Conv %</th>
                </tr>
              </thead>
              <tbody>
                ${execRows}
              </tbody>
            </table>
          </div>
        </div>

        <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">4. Detailed Leads Master Dataset (${activeDataset.length} records)</div>
        <table>
          <thead>
            <tr>
              <th style="width:25px;text-align:center">#</th>
              <th>NAME</th>
              <th>CONTACT</th>
              <th>LOCATION</th>
              <th>SOURCE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>ASSIGNED AGENT</th>
              <th>OUTCOME</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <span>${orgName} • Complete Lead Lifecycle BI Report</span>
          <span>Confidential & Proprietary Data</span>
        </div>
      `;

      const fullPrintDoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${orgName}_Leads_Report</title>
            <style>${PRINT_BRAND_STYLE}</style>
          </head>
          <body>
            ${contentHTML}
          </body>
        </html>
      `;

      triggerIframePrint(fullPrintDoc, `${orgName}_Leads_Report`);
      return;
    } else if (activeTab === "sellers") {
      const activeDataset = sellersData;
      const pipelineRows = (sellersPipeline || []).map((p) => `<tr>
        <td style="font-weight:700">${p.stage}</td>
        <td style="text-align:center;font-weight:700">${p.count}</td>
        <td style="text-align:center">${p.percentage}%</td>
        <td style="text-align:right;font-weight:700">₹${Number(p.deal_value || 0).toLocaleString("en-IN")}</td>
      </tr>`).join("");

      const agingRows = (sellersAging || []).map((a) => `<tr>
        <td style="font-weight:700">${a.range}</td>
        <td style="text-align:center;font-weight:700">${a.count}</td>
        <td style="text-align:right;font-weight:700">₹${Number(a.deal_value || 0).toLocaleString("en-IN")}</td>
      </tr>`).join("");

      const agentRows = (sellersExecutives || []).map((ex) => `<tr>
        <td style="font-weight:700">${ex.agent_name}</td>
        <td style="text-align:center">${ex.total_sellers}</td>
        <td style="text-align:center">${ex.active_sellers}</td>
        <td style="text-align:center">${ex.negotiation_count}</td>
        <td style="text-align:center;font-weight:700;color:#047857">${ex.closed_count}</td>
        <td style="text-align:right;font-weight:700">₹${Number(ex.pipeline_value || 0).toLocaleString("en-IN")}</td>
      </tr>`).join("");

      const tableRows = activeDataset.length === 0
        ? `<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8">No seller records available.</td></tr>`
        : activeDataset.map((row, idx) => `<tr>
            <td style="text-align:center;font-weight:700">${idx + 1}</td>
            <td style="font-weight:700">${row.salutation ? row.salutation + ' ' : ''}${row.name || 'N/A'}</td>
            <td>${row.phone || 'N/A'}</td>
            <td>${row.location || row.city || 'N/A'}</td>
            <td style="font-weight:700;color:#0284c7">${row.seller_lead_stage || row.stage || 'New'}</td>
            <td style="text-align:right;font-weight:700;color:#047857">₹${Number(row.expected_price || row.deal_value || 0).toLocaleString("en-IN")}</td>
            <td>${row.assigned_agent_name || 'Unassigned'}</td>
          </tr>`).join("");

      contentHTML = `
        ${watermarkHTML}
        ${headerHTML}
        <div class="meta-line">
          <span>Module: Sellers Report</span>
          <span>Filtered Records: ${activeDataset.length}</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>

        <div style="margin-bottom:8px;font-size:11px;font-weight:800;color:#0f1f38;text-transform:uppercase;">1. Seller KPI Summary (12 Dynamic Metrics)</div>
        <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
          <div class="stat-box"><span class="stat-lbl">TOTAL SELLERS</span><span class="stat-val">${sellersSummary.total_sellers || sellersStats?.total_count || activeDataset.length}</span></div>
          <div class="stat-box"><span class="stat-lbl">ACTIVE SELLERS</span><span class="stat-val">${sellersSummary.active_sellers || sellersStats?.active_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">HOT SELLERS</span><span class="stat-val">${sellersSummary.hot_sellers || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">PROPERTIES LINKED</span><span class="stat-val">${sellersSummary.properties_linked || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">PIPELINE VALUE</span><span class="stat-val">₹${(Number(sellersSummary.pipeline_value || 0) / 100000).toFixed(1)}L</span></div>
          <div class="stat-box"><span class="stat-lbl">EXPECTED CLOSING</span><span class="stat-val">₹${(Number(sellersSummary.expected_closing_value || 0) / 100000).toFixed(1)}L</span></div>
          <div class="stat-box"><span class="stat-lbl">FOLLOW-UPS DUE</span><span class="stat-val">${sellersSummary.followups_due || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">OVERDUE TASKS</span><span class="stat-val">${sellersSummary.overdue_followups || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">PENDING PAPERS</span><span class="stat-val">${sellersSummary.pending_documents || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">CLOSED / SOLD</span><span class="stat-val">${sellersSummary.closed_sold || sellersStats?.sold_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">AVG DEAL VALUE</span><span class="stat-val">₹${(Number(sellersSummary.avg_deal_value || 0) / 100000).toFixed(1)}L</span></div>
          <div class="stat-box"><span class="stat-lbl">AVG LEAD SCORE</span><span class="stat-val">${sellersSummary.avg_lead_score || 0} / 100</span></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;page-break-inside:avoid;">
          <div>
            <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">2. Seller Pipeline Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th style="text-align:center">Sellers</th>
                  <th style="text-align:center">Share</th>
                  <th style="text-align:right">Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${pipelineRows || '<tr><td colspan="4">No data</td></tr>'}
              </tbody>
            </table>
          </div>

          <div>
            <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">3. Listing Aging Analytics</div>
            <table>
              <thead>
                <tr>
                  <th>Age Bracket</th>
                  <th style="text-align:center">Sellers</th>
                  <th style="text-align:right">Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${agingRows || '<tr><td colspan="3">No data</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        ${agentRows ? `
          <div style="margin-bottom:16px;page-break-inside:avoid;">
            <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">4. Executive Performance Analysis</div>
            <table>
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th style="text-align:center">Total</th>
                  <th style="text-align:center">Active</th>
                  <th style="text-align:center">Negotiation</th>
                  <th style="text-align:center">Closed</th>
                  <th style="text-align:right">Pipeline Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${agentRows}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">5. Filtered Seller Records Detail</div>
        <table>
          <thead>
            <tr>
              <th style="width:30px;text-align:center">#</th>
              <th>SELLER NAME</th>
              <th>CONTACT</th>
              <th>LOCATION</th>
              <th>STAGE</th>
              <th style="text-align:right">EXPECTED PRICE</th>
              <th>ASSIGNED AGENT</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <span>${orgName} • Seller Report Export</span>
          <span>Generated Automatically</span>
        </div>
      `;
    } else {
      let tableRows = "";
      let activeDataset: any[] = [];
      let activeStats: any = null;

      if (activeTab === "leads") {
        activeDataset = leadsData;
        activeStats = leadsStats;
      } else if (activeTab === "buyers") {
        activeDataset = buyersData;
        activeStats = buyersStats;
      } else if (activeTab === "tenants") {
        activeDataset = tenantsData;
        activeStats = tenantsStats;
      } else if (activeTab === "owners") {
        activeDataset = ownersData;
        activeStats = ownersStats;
      } else if (activeTab === "properties") {
        activeDataset = propertiesData;
        activeStats = propertiesStats;
      } else if (activeTab === "visits") {
        activeDataset = visitsData;
        activeStats = visitsStats;
      } else if (activeTab === "agent-execution") {
        activeDataset = agentsData;
        activeStats = agentsStats;
      } else if (activeTab === "transactions") {
        activeDataset = transactionsData;
        activeStats = transactionsStats;
      } else if (activeTab === "activities") {
        activeDataset = activitiesUserSummary.length > 0 ? activitiesUserSummary : activitiesData;
        activeStats = activitiesStats;
      } else if (activeTab === "campaigns") {
        activeDataset = campaignsData;
        activeStats = campaignsStats;
      } else if (activeTab === "login-logs") {
        activeDataset = loginLogsData;
        activeStats = loginLogsStats;
      }

      if (activeDataset.length === 0) {
        tableRows = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#94a3b8">No records available for print.</td></tr>`;
      } else if (activeTab === "login-logs") {
        tableRows = activeDataset
          .map((row, idx) => {
            const name = row.name || row.username || "System User";
            const email = row.email || "N/A";
            const role = (row.role || "Agent").toUpperCase();
            let ip = row.ip_address || "127.0.0.1";
            if (ip === "::1") ip = "127.0.0.1 (IPv6 ::1)";
            else if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

            const loginTime = row.login_time ? new Date(row.login_time).toLocaleString("en-IN") : "N/A";
            const source = row.source || "Chrome on Windows";
            const location = row.address || "Location Captured";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-weight:700">${name}</td>
              <td>${email}</td>
              <td><span style="font-weight:700;text-transform:uppercase">${role}</span></td>
              <td>${ip}</td>
              <td>${loginTime}</td>
              <td>${source}</td>
              <td>${location}</td>
            </tr>`;
          })
          .join("");
      } else {
        tableRows = activeDataset
          .map((row, idx) => {
            const name = row.name || row.buyer_name || row.agentName || row.user_name || row.society_name || row.title || row.receipt_id || `Record #${row.id}`;
            const contact = row.phone || row.email || row.agent_phone || "N/A";
            const location = row.city || row.location || row.location_name || row.preferred_location || "N/A";
            const status = row.status || row.buyer_lead_status || row.seller_lead_status || row.priority || "Active";
            const amount = row.expected_price || row.budget_max || row.final_price || row.amount || 0;
            const formattedAmount = amount > 0 ? `₹${Number(amount).toLocaleString("en-IN")}` : "N/A";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-weight:700">${name}</td>
              <td>${contact}</td>
              <td>${location}</td>
              <td>${formattedAmount}</td>
              <td><span style="font-weight:700;text-transform:uppercase">${status}</span></td>
              <td>${row.assigned_agent_name || row.assigned_executive_name || row.department || "Agent"}</td>
            </tr>`;
          })
          .join("");
      }

      contentHTML = `
        ${watermarkHTML}
        ${headerHTML}
        <div class="meta-line">
          <span>Module: ${tabName}</span>
          <span>Records Count: ${activeDataset.length}</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>
        <div class="stats-grid">
          <div class="stat-box"><span class="stat-lbl">TOTAL LOGINS / RECORDS</span><span class="stat-val">${activeStats?.total_logins || activeStats?.total_count || activeStats?.total_campaigns || activeDataset.length}</span></div>
          <div class="stat-box"><span class="stat-lbl">CLIENT / ACTIVE</span><span class="stat-val">${activeStats?.tenant_logins ?? activeStats?.active_count ?? activeStats?.qualified_count ?? activeStats?.total_assigned_leads ?? 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">ADMIN & STAFF</span><span class="stat-val">${activeStats?.admin_logins ?? activeStats?.closed_count ?? activeStats?.sold_count ?? activeStats?.converted_count ?? 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">ACTIVE SESSIONS / VALUE</span><span class="stat-val">${activeStats?.active_sessions !== undefined ? activeStats.active_sessions : (activeStats?.total_amount ? `₹${Number(activeStats.total_amount).toLocaleString("en-IN")}` : activeStats?.completed_count || "N/A")}</span></div>
        </div>
        <table>
          <thead>
            ${activeTab === "login-logs" ? `
              <tr>
                <th style="width:40px;text-align:center">S.NO.</th>
                <th>USER NAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>IP ADDRESS</th>
                <th>LOGIN TIME</th>
                <th>SOURCE / BROWSER</th>
                <th>LOCATION / ADDRESS</th>
              </tr>
            ` : `
              <tr>
                <th style="width:40px;text-align:center">S.NO.</th>
                <th>NAME / TITLE</th>
                <th>CONTACT</th>
                <th>LOCATION</th>
                <th>AMOUNT / VALUE</th>
                <th>STATUS</th>
                <th>ASSIGNED TO</th>
              </tr>
            `}
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          <span>${orgName} • ${tabName} Data Export</span>
          <span>Page 1 of 1</span>
        </div>
      `;
    }

    const fullPrintDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pdfTitle}</title>
          <style>${PRINT_BRAND_STYLE}</style>
        </head>
        <body>
          ${contentHTML}
        </body>
      </html>
    `;

    triggerIframePrint(fullPrintDoc, pdfTitle);
  };

  return (
    <div className="space-y-2 p-2.5 sm:p-3.5 bg-slate-50 min-h-screen">


      {/* Sticky Top Section: Stats, Tabs & Filter stay pinned at top */}
      <div className="sticky top-0 z-30 bg-slate-50 pt-2 pb-1 space-y-2  shadow-2xs backdrop-blur-md">
        {/* Top Header Summary Chips */}
        <TabTopStatsHeader
          activeTab={activeTab}
          summaryData={summaryData}
          leadsStats={leadsStats}
          buyersStats={buyersStats}
          sellersStats={{ ...sellersStats, ...sellersSummary }}
          tenantsStats={tenantsStats}
          ownersStats={ownersStats}
          propertiesStats={propertiesStats}
          visitsStats={visitsStats}
          transactionsStats={transactionsStats}
          activitiesStats={activitiesStats}
          commSummary={commSummary}
          campaignsStats={campaignsStats}
          agentsStats={agentsStats}
          loginLogsStats={loginLogsStats}
        />

        {/* Nav Tabs Bar with Unique Bottom Underline Active Indicator */}
        <div className="bg-transparent border-b border-gray-300 py-0.5 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 min-w-max">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs transition-all border-b-2 ${isActive
                      ? "border-indigo-600 text-indigo-900 font-extrabold bg-white shadow-2xs rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SPECIAL HORIZONTAL DATE QUICK-FILTER BAR FOR OVERALL TAB ONLY */}
        {activeTab === "overview" && (
          <div className="bg-white p-3 rounded-xl border border-gray-300 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {filters.startDate && filters.endDate
                    ? `${filters.startDate} to ${filters.endDate}`
                    : "All Time / Date Range"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleApplyPreset("last_3_months")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${datePreset === "last_3_months"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  }`}
              >
                Last 3 Months
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("last_6_months")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${datePreset === "last_6_months"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  }`}
              >
                Last 6 Months
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("last_12_months")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${datePreset === "last_12_months"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  }`}
              >
                Last 12 Months
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("all_time")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${datePreset === "all_time"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  }`}
              >
                All Time
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-1.5 text-xs text-white bg-[#0f1f38] hover:bg-[#1e3b8b] font-bold px-3.5 py-1.5 rounded-lg shadow-sm border-0"
              >
                <Filter className="w-3.5 h-3.5 text-white" />
                Filter
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-gray-700" />
                Excel
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTriggerPrint}
                className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-gray-700" />
                Print
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-200">
        {activeTab === "overview" && (
          <DashboardTab
            summaryData={summaryData}
            trendsData={trendsData}
            funnelData={funnelData}
            insightsData={insightsData}
            leadSourcesData={leadSourcesData}
            aiGenerated={aiGenerated}
            loading={loading}
            filters={filters}
            onDrilldown={handleTabChange}
            onRefreshInsights={handleRefreshInsights}
          />
        )}

        {activeTab === "leads" && (
          <LeadReportTab
            data={leadsData}
            stats={leadsStats}
            funnel={leadsFunnel}
            sources={leadsSources}
            executives={leadsExecutives}
            followupInsights={leadsFollowups}
            pagination={leadsPagination}
            loading={loading}
            filters={filters}
            onPageChange={(p) => setLeadsPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setLeadsPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => setIsLeadExportOpen(true)}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={leadsStatusPill}
            onSelectStatusPill={(key) => {
              setLeadsStatusPill(key);
              setLeadsPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onApplyFilterParam={(k, v) => {
              setFilters((prev) => ({ ...prev, [k]: v }));
              setLeadsPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "agent-execution" && (
          <AgentLeadExecutionReportTab
            agents={agentsData}
            stats={agentsStats}
            loading={loading}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
          />
        )}

        {activeTab === "buyers" && (
          <BuyerReportTab
            data={buyersData}
            stats={buyersStats}
            funnel={buyersFunnel}
            demands={buyersDemands}
            locations={buyersLocations}
            budgets={buyersBudgets}
            matching={buyersMatching}
            visits={buyersVisits}
            executives={buyersExecutives}
            followups={buyersFollowups}
            financials={buyersFinancials}
            pagination={buyersPagination}
            loading={loading}
            onPageChange={(p) => setBuyersPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setBuyersPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => setIsBuyerExportOpen(true)}
            onRefresh={fetchReportData}
            onPrint={() => setIsBuyerPrintOpen(true)}
            activeStatusPill={buyersStatusPill}
            onSelectStatusPill={(key) => {
              setBuyersStatusPill(key);
              setBuyersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByStage={(stageVal) => {
              setFilters((prev) => ({ ...prev, stage: stageVal }));
              setIsFilterOpen(false);
            }}
            onFilterByLocation={(locVal) => {
              setFilters((prev) => ({ ...prev, location: locVal }));
            }}
            onFilterByBudget={(minVal, maxVal) => {
              setFilters((prev) => ({ ...prev, budget_min: String(minVal), budget_max: String(maxVal) }));
            }}
            onFilterByExecutive={(execId) => {
              setFilters((prev) => ({ ...prev, assigned_executive: execId }));
            }}
            onFilterByPropertyType={(ptVal) => {
              setFilters((prev) => ({ ...prev, property_type: ptVal }));
            }}
            onFilterByUnitType={(utVal) => {
              setFilters((prev) => ({ ...prev, unit_type: utVal }));
            }}
          />
        )}

        {activeTab === "sellers" && (
          <SellerReportTab
            data={sellersData}
            stats={sellersStats}
            summary={sellersSummary}
            pipeline={sellersPipeline}
            aging={sellersAging}
            followups={sellersFollowups}
            properties={sellersProperties}
            sources={sellersSources}
            documents={sellersDocuments}
            cosellers={sellersCosellers}
            executives={sellersExecutives}
            financials={sellersFinancials}
            pagination={sellersPagination}
            loading={loading}
            onPageChange={(p) => setSellersPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setSellersPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => setIsSellerExportOpen(true)}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={sellersStatusPill}
            onSelectStatusPill={(key) => {
              setSellersStatusPill(key);
              setSellersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByStage={(stg) => {
              setFilters((prev) => ({ ...prev, stage: stg }));
              setSellersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByAging={(ag) => {
              setFilters((prev) => ({ ...prev, aging_range: ag }));
              setSellersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByDocStatus={(docSt) => {
              setFilters((prev) => ({ ...prev, documentStatus: docSt }));
              setSellersPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "tenants" && (
          <TenantReportTab
            data={tenantsData}
            stats={tenantsStats}
            pagination={tenantsPagination}
            loading={loading}
            onPageChange={(p) => setTenantsPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setTenantsPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={tenantsStatusPill}
            onSelectStatusPill={(key) => {
              setTenantsStatusPill(key);
              setTenantsPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "owners" && (
          <OwnerReportTab
            data={ownersData}
            stats={ownersStats}
            pagination={ownersPagination}
            loading={loading}
            onPageChange={(p) => setOwnersPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setOwnersPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={ownersStatusPill}
            onSelectStatusPill={(key) => {
              setOwnersStatusPill(key);
              setOwnersPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "properties" && (
          <PropertyReportTab
            data={propertiesData}
            stats={propertiesStats}
            pagination={propertiesPagination}
            loading={loading}
            onPageChange={(p) => setPropertiesPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setPropertiesPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={propertiesStatusPill}
            onSelectStatusPill={(key) => {
              setPropertiesStatusPill(key);
              setPropertiesPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "visits" && (
          <PropertyVisitReportTab
            data={visitsData}
            stats={visitsStats}
            pagination={visitsPagination}
            loading={loading}
            onPageChange={(p) => setVisitsPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setVisitsPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={visitsStatusPill}
            onSelectStatusPill={(key) => {
              setVisitsStatusPill(key);
              setVisitsPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionReportTab
            data={transactionsData}
            stats={transactionsStats}
            loading={loading}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
          />
        )}

        {activeTab === "activities" && (
          <ActivityReportTab
            data={activitiesData}
            userSummary={activitiesUserSummary}
            stats={activitiesStats}
            loading={loading}
            filters={filters}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
          />
        )}

        {activeTab === "communication" && (
          <CommunicationReportTab
            summary={commSummary}
            loading={loading}
          />
        )}

        {activeTab === "campaigns" && (
          <CampaignReportTab
            campaigns={campaignsData}
            stats={campaignsStats}
            loading={loading}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
          />
        )}

        {activeTab === "login-logs" && (
          <LoggedInReportTab
            data={loginLogsData}
            stats={loginLogsStats}
            filters={filters}
            loading={loading}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
          />
        )}
      </div>

      {/* Smart Slide-over Filter Drawer */}
      <SmartFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        tabKey={activeTab}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          setLeadsPagination((prev) => ({ ...prev, page: 1 }));
          setBuyersPagination((prev) => ({ ...prev, page: 1 }));
          setSellersPagination((prev) => ({ ...prev, page: 1 }));
          setTenantsPagination((prev) => ({ ...prev, page: 1 }));
          setOwnersPagination((prev) => ({ ...prev, page: 1 }));
          setPropertiesPagination((prev) => ({ ...prev, page: 1 }));
          setVisitsPagination((prev) => ({ ...prev, page: 1 }));
        }}
        onClearFilters={() => {
          setFilters({ ignoreDate: true, status: "all" });
          setLeadsStatusPill("all");
          setBuyersStatusPill("all");
          setSellersStatusPill("all");
          setTenantsStatusPill("all");
          setOwnersStatusPill("all");
          setPropertiesStatusPill("all");
          setVisitsStatusPill("all");
        }}
      />
      {/* Lead Export Modal */}
      <LeadExportPreviewModal
        isOpen={isLeadExportOpen}
        onClose={() => setIsLeadExportOpen(false)}
        filters={filters}
        stats={leadsStats}
        funnel={leadsFunnel}
        sources={leadsSources}
        executives={leadsExecutives}
        tableData={leadsData}
      />

      {/* Buyer Export & Print Modals */}
      <BuyerExportPreviewModal
        isOpen={isBuyerExportOpen}
        onClose={() => setIsBuyerExportOpen(false)}
        filters={filters}
        stats={buyersStats}
        funnel={buyersFunnel}
        demands={buyersDemands}
        locations={buyersLocations}
        budgets={buyersBudgets}
        matching={buyersMatching}
        visits={buyersVisits}
        executives={buyersExecutives}
        followups={buyersFollowups}
        financials={buyersFinancials}
        tableData={buyersData}
      />

      <BuyerPrintPreviewModal
        isOpen={isBuyerPrintOpen}
        onClose={() => setIsBuyerPrintOpen(false)}
        filters={filters}
        stats={buyersStats}
        funnel={buyersFunnel}
        demands={buyersDemands}
        locations={buyersLocations}
        budgets={buyersBudgets}
        matching={buyersMatching}
        visits={buyersVisits}
        executives={buyersExecutives}
        followups={buyersFollowups}
        financials={buyersFinancials}
        tableData={buyersData}
      />

      {/* Seller Export & Print Modals */}
      <SellerExportPreviewModal
        isOpen={isSellerExportOpen}
        onClose={() => setIsSellerExportOpen(false)}
        filters={filters}
        summary={sellersSummary}
        pipeline={sellersPipeline}
        aging={sellersAging}
        followups={sellersFollowups}
        properties={sellersProperties}
        sources={sellersSources}
        documents={sellersDocuments}
        executives={sellersExecutives}
        financials={sellersFinancials}
        tableData={sellersData}
      />

      <SellerPrintPreviewModal
        isOpen={isSellerPrintOpen}
        onClose={() => setIsSellerPrintOpen(false)}
        filters={filters}
        summary={sellersSummary}
        pipeline={sellersPipeline}
        aging={sellersAging}
        followups={sellersFollowups}
        properties={sellersProperties}
        sources={sellersSources}
        documents={sellersDocuments}
        cosellers={sellersCosellers}
        executives={sellersExecutives}
        financials={sellersFinancials}
        tableData={sellersData}
      />
    </div>
  );
};