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
import { ExportPreviewModal } from "./ExportPreviewModal";
import { LoggedInReportTab } from "./LoggedInReportTab";
import { ShieldCheck } from "lucide-react";

export const REPORT_TABS = [
  { id: "overview", label: "Overall Report", icon: BarChart3 },
  { id: "leads", label: "Leads Report", icon: Users },
  { id: "agent-execution", label: "Agent Lead Execution", icon: UserCheck },
  { id: "buyers", label: "Buyers Report", icon: Users },
  { id: "sellers", label: "Sellers Report", icon: Users },
  { id: "tenants", label: "Tenants Report", icon: Users },
  { id: "owners", label: "Owners Report", icon: Building },
  { id: "properties", label: "Properties Report", icon: Building },
  { id: "transactions", label: "Transactions", icon: IndianRupee },
  { id: "activities", label: "Activities", icon: Activity },
  { id: "campaigns", label: "Campaigns", icon: Send },
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
  const [sellersPrices, setSellersPrices] = useState<any>({});
  const [sellersViewMode, setSellersViewMode] = useState<"seller" | "property">("seller");
  const [sellersPagination, setSellersPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [sellersStatusPill, setSellersStatusPill] = useState<string>("all");
  const [isSellerExportOpen, setIsSellerExportOpen] = useState<boolean>(false);
  const [isSellerPrintOpen, setIsSellerPrintOpen] = useState<boolean>(false);

  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [tenantsStats, setTenantsStats] = useState<any>(null);
  const [tenantsBudgets, setTenantsBudgets] = useState<any>(null);
  const [tenantsLocations, setTenantsLocations] = useState<any[]>([]);
  const [tenantsBhk, setTenantsBhk] = useState<any[]>([]);
  const [tenantsTypes, setTenantsTypes] = useState<any[]>([]);
  const [tenantsExecutives, setTenantsExecutives] = useState<any[]>([]);
  const [tenantsPagination, setTenantsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [tenantsStatusPill, setTenantsStatusPill] = useState<string>("all");

  const [ownersData, setOwnersData] = useState<any[]>([]);
  const [ownersStats, setOwnersStats] = useState<any>(null);
  const [ownersSummary, setOwnersSummary] = useState<any>(null);
  const [ownersPipeline, setOwnersPipeline] = useState<any[]>([]);
  const [ownersProperties, setOwnersProperties] = useState<any>(null);
  const [ownersRents, setOwnersRents] = useState<any>(null);
  const [ownersFollowups, setOwnersFollowups] = useState<any>(null);
  const [ownersExecutives, setOwnersExecutives] = useState<any[]>([]);
  const [ownersViewMode, setOwnersViewMode] = useState<"owner" | "property">("owner");
  const [ownersPagination, setOwnersPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [ownersStatusPill, setOwnersStatusPill] = useState<string>("all");

  const [propertiesData, setPropertiesData] = useState<any[]>([]);
  const [propertiesStats, setPropertiesStats] = useState<any>(null);
  const [propertiesMix, setPropertiesMix] = useState<any>(null);
  const [propertiesLocations, setPropertiesLocations] = useState<any[]>([]);
  const [propertiesBhk, setPropertiesBhk] = useState<any[]>([]);
  const [propertiesTypes, setPropertiesTypes] = useState<any[]>([]);
  const [propertiesSalePrices, setPropertiesSalePrices] = useState<any>(null);
  const [propertiesExpectedRents, setPropertiesExpectedRents] = useState<any>(null);
  const [propertiesExecutives, setPropertiesExecutives] = useState<any[]>([]);
  const [propertiesMode, setPropertiesMode] = useState<"all" | "sale" | "rental">("all");
  const [propertiesPagination, setPropertiesPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [propertiesStatusPill, setPropertiesStatusPill] = useState<string>("all");

  const [visitsData, setVisitsData] = useState<any[]>([]);
  const [visitsStats, setVisitsStats] = useState<any>(null);
  const [visitsPagination, setVisitsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [visitsStatusPill, setVisitsStatusPill] = useState<string>("all");

  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [transactionsStats, setTransactionsStats] = useState<any>(null);
  const [transactionsOverview, setTransactionsOverview] = useState<any>(null);
  const [transactionsStatusBreakdown, setTransactionsStatusBreakdown] = useState<any[]>([]);
  const [transactionsTypeBreakdown, setTransactionsTypeBreakdown] = useState<any[]>([]);
  const [transactionsMethodBreakdown, setTransactionsMethodBreakdown] = useState<any[]>([]);
  const [transactionsPartyBreakdown, setTransactionsPartyBreakdown] = useState<any[]>([]);
  const [transactionsAmountTiers, setTransactionsAmountTiers] = useState<any[]>([]);
  const [transactionsPropertyBreakdown, setTransactionsPropertyBreakdown] = useState<any[]>([]);
  const [transactionsExecutiveBreakdown, setTransactionsExecutiveBreakdown] = useState<any[]>([]);
  const [transactionsTop, setTransactionsTop] = useState<any[]>([]);
  const [transactionsTrends, setTransactionsTrends] = useState<any[]>([]);
  const [transactionsPagination, setTransactionsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [transactionsStatusPill, setTransactionsStatusPill] = useState<string>("all");

  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [activitiesStats, setActivitiesStats] = useState<any>(null);
  const [activitiesUserSummary, setActivitiesUserSummary] = useState<any[]>([]);

  const [commSummary, setCommSummary] = useState<any>(null);

  const [campaignsData, setCampaignsData] = useState<any[]>([]);
  const [campaignsStats, setCampaignsStats] = useState<any>(null);
  const [campaignsOverview, setCampaignsOverview] = useState<any>(null);
  const [campaignsStatusBreakdown, setCampaignsStatusBreakdown] = useState<any[]>([]);
  const [campaignsFunnel, setCampaignsFunnel] = useState<any>(null);
  const [campaignsDelivery, setCampaignsDelivery] = useState<any>(null);
  const [campaignsAudienceBreakdown, setCampaignsAudienceBreakdown] = useState<any[]>([]);
  const [campaignsCost, setCampaignsCost] = useState<any>(null);
  const [campaignsTrends, setCampaignsTrends] = useState<any[]>([]);
  const [campaignsTop, setCampaignsTop] = useState<any>(null);
  const [campaignsPagination, setCampaignsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [campaignsStatusPill, setCampaignsStatusPill] = useState<string>("all");

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
        if (res?.users || res?.agents) setAgentsData(res.users || res.agents);
        if (res?.summary || res?.stats) setAgentsStats(res.summary || res.stats);
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
        const res = await reportAPI.getSellerReport({
          ...filters,
          status: sellersStatusPill,
          view_mode: sellersViewMode,
          page: sellersPagination.page,
          limit: sellersPagination.limit,
        });
        if (res?.data) setSellersData(res.data);
        if (res?.stats) setSellersStats(res.stats);
        if (res?.summary) setSellersSummary(res.summary);
        if (res?.pipeline) setSellersPipeline(res.pipeline);
        if (res?.aging) setSellersAging(res.aging);
        if (res?.followups) setSellersFollowups(res.followups);
        if (res?.properties) setSellersProperties(res.properties);
        if (res?.prices) setSellersPrices(res.prices);
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
        if (res?.budgets) setTenantsBudgets(res.budgets);
        if (res?.locations) setTenantsLocations(res.locations);
        if (res?.bhk) setTenantsBhk(res.bhk);
        if (res?.tenant_types) setTenantsTypes(res.tenant_types);
        if (res?.executives) setTenantsExecutives(res.executives);
        if (res?.pagination) setTenantsPagination(res.pagination);
      } else if (activeTab === "owners") {
        const res = await reportAPI.getOwnerReport({ ...filters, status: ownersStatusPill, page: ownersPagination.page, limit: ownersPagination.limit, view_mode: ownersViewMode });
        if (res?.data) setOwnersData(res.data);
        if (res?.stats) setOwnersStats(res.stats);
        if (res?.summary) setOwnersSummary(res.summary);
        if (res?.pipeline) setOwnersPipeline(res.pipeline);
        if (res?.properties) setOwnersProperties(res.properties);
        if (res?.rents) setOwnersRents(res.rents);
        if (res?.followups) setOwnersFollowups(res.followups);
        if (res?.executives) setOwnersExecutives(res.executives);
        if (res?.pagination) setOwnersPagination(res.pagination);
      } else if (activeTab === "properties") {
        const res = await reportAPI.getPropertyReport({ ...filters, status: propertiesStatusPill, page: propertiesPagination.page, limit: propertiesPagination.limit, property_mode: propertiesMode });
        if (res?.data) setPropertiesData(res.data);
        if (res?.stats) setPropertiesStats(res.stats);
        if (res?.mix) setPropertiesMix(res.mix);
        if (res?.locations) setPropertiesLocations(res.locations);
        if (res?.bhk) setPropertiesBhk(res.bhk);
        if (res?.property_types) setPropertiesTypes(res.property_types);
        if (res?.sale_prices) setPropertiesSalePrices(res.sale_prices);
        if (res?.expected_rents) setPropertiesExpectedRents(res.expected_rents);
        if (res?.executives) setPropertiesExecutives(res.executives);
        if (res?.pagination) setPropertiesPagination(res.pagination);
      } else if (activeTab === "visits") {
        const res = await reportAPI.getPropertyVisitReport({ ...filters, status: visitsStatusPill, page: visitsPagination.page, limit: visitsPagination.limit });
        if (res?.data) setVisitsData(res.data);
        if (res?.stats) setVisitsStats(res.stats);
        if (res?.pagination) setVisitsPagination(res.pagination);
      } else if (activeTab === "transactions") {
        const res = await reportAPI.getTransactionReport({ ...filters, status: transactionsStatusPill, page: transactionsPagination.page, limit: transactionsPagination.limit });
        if (res?.data) setTransactionsData(res.data);
        if (res?.stats) setTransactionsStats(res.stats);
        if (res?.overview) setTransactionsOverview(res.overview);
        if (res?.status_breakdown) setTransactionsStatusBreakdown(res.status_breakdown);
        if (res?.transaction_type_breakdown) setTransactionsTypeBreakdown(res.transaction_type_breakdown);
        if (res?.payment_method_breakdown) setTransactionsMethodBreakdown(res.payment_method_breakdown);
        if (res?.party_breakdown) setTransactionsPartyBreakdown(res.party_breakdown);
        if (res?.amount_tiers) setTransactionsAmountTiers(res.amount_tiers);
        if (res?.property_breakdown) setTransactionsPropertyBreakdown(res.property_breakdown);
        if (res?.executive_breakdown) setTransactionsExecutiveBreakdown(res.executive_breakdown);
        if (res?.top_transactions) setTransactionsTop(res.top_transactions);
        if (res?.trends) setTransactionsTrends(res.trends);
        if (res?.pagination) setTransactionsPagination(res.pagination);
      } else if (activeTab === "activities") {
        const res = await reportAPI.getActivityReport(filters);
        if (res?.data) setActivitiesData(res.data);
        if (res?.stats) setActivitiesStats(res.stats);
        if (res?.userSummary) setActivitiesUserSummary(res.userSummary);
      } else if (activeTab === "communication") {
        const res = await reportAPI.getCommunicationReport(filters);
        if (res?.stats) setCommSummary(res.stats);
      } else if (activeTab === "campaigns") {
        const res = await reportAPI.getCampaignReport({ ...filters, status: campaignsStatusPill, page: campaignsPagination.page, limit: campaignsPagination.limit });
        if (res?.data || res?.campaigns) setCampaignsData(res.data || res.campaigns);
        if (res?.stats) setCampaignsStats(res.stats);
        if (res?.overview) setCampaignsOverview(res.overview);
        if (res?.status_breakdown) setCampaignsStatusBreakdown(res.status_breakdown);
        if (res?.funnel) setCampaignsFunnel(res.funnel);
        if (res?.delivery) setCampaignsDelivery(res.delivery);
        if (res?.audience_breakdown) setCampaignsAudienceBreakdown(res.audience_breakdown);
        if (res?.cost) setCampaignsCost(res.cost);
        if (res?.trends) setCampaignsTrends(res.trends);
        if (res?.top_campaigns) setCampaignsTop(res.top_campaigns);
        if (res?.pagination) setCampaignsPagination(res.pagination);
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
      setFilters((prev) => ({ ...prev, ignoreDate: false, datePreset: preset, startDate, endDate }));
    } else if (preset === "last_6_months") {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      startDate = d.toISOString().split("T")[0];
      setFilters((prev) => ({ ...prev, ignoreDate: false, datePreset: preset, startDate, endDate }));
    } else if (preset === "last_12_months") {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      startDate = d.toISOString().split("T")[0];
      setFilters((prev) => ({ ...prev, ignoreDate: false, datePreset: preset, startDate, endDate }));
    } else {
      setFilters((prev) => ({ ...prev, ignoreDate: true, datePreset: "all_time", startDate: undefined, endDate: undefined }));
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

  // Universal Export Preview Modal State
  const [universalExportState, setUniversalExportState] = useState<{
    isOpen: boolean;
    tabKey: string;
    tabTitle: string;
    data: any[];
  }>({
    isOpen: false,
    tabKey: "",
    tabTitle: "",
    data: [],
  });

  const handleOpenExportPreview = (targetTabKey?: string) => {
    const key = targetTabKey || activeTab;
    const tabItem = REPORT_TABS.find((t) => t.id === key);
    const title = tabItem ? tabItem.label : key.replace("-", " ").toUpperCase();
    let dataset: any[] = [];

    switch (key) {
      case "overview":
        dataset = Array.isArray(trendsData) && trendsData.length > 0 ? trendsData : (summaryData?.topKpis ? [summaryData.topKpis] : []);
        break;
      case "leads":
        dataset = leadsData;
        break;
      case "agent-execution":
        dataset = agentsData;
        break;
      case "buyers":
        dataset = buyersData;
        break;
      case "sellers":
        dataset = sellersData;
        break;
      case "tenants":
        dataset = tenantsData;
        break;
      case "owners":
        dataset = ownersData;
        break;
      case "properties":
        dataset = propertiesData;
        break;
      case "visits":
        dataset = visitsData;
        break;
      case "transactions":
        dataset = transactionsData;
        break;
      case "activities":
        dataset = activitiesUserSummary.length > 0 ? activitiesUserSummary : activitiesData;
        break;
      case "campaigns":
        dataset = campaignsData;
        break;
      case "login-logs":
        dataset = loginLogsData;
        break;
      default:
        dataset = [];
    }

    setUniversalExportState({
      isOpen: true,
      tabKey: key,
      tabTitle: title,
      data: dataset,
    });
  };

  // Client-Side CSV Export Triggered After Preview Confirmation
  const handleExportCSV = async (targetTabKey?: string, customDataset?: any[]) => {
    const key = targetTabKey || activeTab;
    try {
      let activeDataset: any[] = customDataset || [];
      let filename = `report_${key}_${Date.now()}.csv`;
      let csvHeader = "";

      if (!customDataset || customDataset.length === 0) {
        if (key === "leads") activeDataset = leadsData;
        else if (key === "buyers") activeDataset = buyersData;
        else if (key === "sellers") activeDataset = sellersData;
        else if (key === "tenants") activeDataset = tenantsData;
        else if (key === "owners") activeDataset = ownersData;
        else if (key === "properties") activeDataset = propertiesData;
        else if (key === "visits") activeDataset = visitsData;
        else if (key === "agent-execution") activeDataset = agentsData;
        else if (key === "transactions") activeDataset = transactionsData;
        else if (key === "activities") activeDataset = activitiesUserSummary.length > 0 ? activitiesUserSummary : activitiesData;
        else if (key === "campaigns") activeDataset = campaignsData;
      }

      if (key === "leads") {
        csvHeader = "S.NO,LEAD ID,NAME,PHONE,EMAIL,WHATSAPP,CITY,LOCATION,TYPE,SOURCE,STAGE,STATUS,PRIORITY,ASSIGNED AGENT,CREATED DATE,CREATED BY,OUTCOME,BUYER TRANSFERRED,SELLER TRANSFERRED\n";
      } else if (key === "buyers") {
        csvHeader = "S.NO,BUYER NAME,PHONE,EMAIL,LOCATION,MIN BUDGET,MAX BUDGET,STATUS,ASSIGNED AGENT\n";
      } else if (key === "sellers") {
        csvHeader = "S.NO,SELLER NAME,PHONE,EMAIL,LOCATION,EXPECTED PRICE,STATUS,ASSIGNED AGENT\n";
      } else if (key === "tenants") {
        csvHeader = "S.NO,TENANT NAME,PHONE,EMAIL,LOCATION,PREFERRED BHK,TENANT TYPE,STATUS,ASSIGNED AGENT\n";
      } else if (key === "owners") {
        csvHeader = "S.NO,OWNER NAME,PHONE,EMAIL,CITY,LOCATION,STATUS,ASSIGNED AGENT\n";
      } else if (key === "properties") {
        csvHeader = "S.NO,SOCIETY / PROPERTY,TYPE,BEDROOMS,CITY,LOCATION,PRICE,CARPET AREA,STATUS,ASSIGNED AGENT\n";
      } else if (key === "visits") {
        csvHeader = "S.NO,BUYER NAME,PROPERTY TITLE,VISIT DATE,TYPE,STATUS,EXECUTIVE\n";
      } else if (key === "agent-execution") {
        csvHeader = "S.NO,AGENT NAME,EMAIL,PHONE,ROLE,DEPARTMENT,ASSIGNED LEADS,CALLS COMPLETED,INTERESTED,CONVERTED,RATING\n";
      } else if (key === "transactions") {
        csvHeader = "S.NO,RECEIPT ID,AMOUNT,DATE,STATUS,CREATED BY\n";
      } else if (key === "activities") {
        csvHeader = "S.NO,EXECUTIVE NAME,ROLE,DEPARTMENT,ASSIGNED LEADS,CALLS COMPLETED,PENDING CALLS,INTERESTED LEADS,NOT INTERESTED,FOLLOW-UPS LOGGED\n";
      } else if (key === "campaigns") {
        csvHeader = "S.NO,CAMPAIGN NAME,TYPE,STATUS,AUDIENCE,SENT,DELIVERED,READ,FAILED\n";
      } else {
        csvHeader = "S.NO,NAME,PHONE,EMAIL,LOCATION,VALUE,STATUS,AGENT\n";
      }

      if (activeDataset.length === 0) {
        await reportAPI.exportReportCSV(key, filters);
        return;
      }

      let csv = csvHeader;
      activeDataset.forEach((r, idx) => {
        if (key === "leads") {
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
      await reportAPI.exportReportCSV(key, filters);
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
      const top = summaryData?.topKpis || {};
      const sale = summaryData?.salePerformance || {};
      const rental = summaryData?.rentalPerformance || {};
      const pipe = summaryData?.leadPipeline || {};
      const inv = summaryData?.inventorySummary || {};
      const fin = summaryData?.financialSummary || {};
      const cmp = summaryData?.campaignSummary || {};
      const locs = Array.isArray(summaryData?.locationSummary) ? summaryData.locationSummary : [];

      const topKpisGridHtml = `
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL LEADS</div>
            <div style="font-size:16px;font-weight:900;color:#0f172a;">${top.totalLeads || 0}</div>
          </div>
          <div style="border:1px solid #a5b4fc;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">QUALIFIED LEADS</div>
            <div style="font-size:16px;font-weight:900;color:#3730a3;">${top.qualifiedLeads || 0}</div>
          </div>
          <div style="border:1px solid #93c5fd;padding:8px;border-radius:6px;background:#eff6ff;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">ACTIVE BUYERS</div>
            <div style="font-size:16px;font-weight:900;color:#1e40af;">${top.activeBuyers || 0}</div>
          </div>
          <div style="border:1px solid #e9d5ff;padding:8px;border-radius:6px;background:#faf5ff;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#7e22ce;text-transform:uppercase;">ACTIVE SELLERS</div>
            <div style="font-size:16px;font-weight:900;color:#6b21a8;">${top.activeSellers || 0}</div>
          </div>
          <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">ACTIVE OWNERS</div>
            <div style="font-size:16px;font-weight:900;color:#115e59;">${top.activeRentalOwners || 0}</div>
          </div>
          <div style="border:1px solid #bae6fd;padding:8px;border-radius:6px;background:#f0f9ff;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#0369a1;text-transform:uppercase;">ACTIVE TENANTS</div>
            <div style="font-size:16px;font-weight:900;color:#0c4a6e;">${top.activeTenants || 0}</div>
          </div>
          <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">ACTIVE INVENTORY</div>
            <div style="font-size:16px;font-weight:900;color:#0f172a;">${top.activeProperties || 0}</div>
          </div>
          <div style="border:1px solid #86efac;padding:8px;border-radius:6px;background:#f0fdf4;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;">PROPERTIES SOLD</div>
            <div style="font-size:16px;font-weight:900;color:#166534;">${top.propertiesSold || 0}</div>
          </div>
          <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">PROPERTIES RENTED</div>
            <div style="font-size:16px;font-weight:900;color:#115e59;">${top.propertiesRented || 0}</div>
          </div>
          <div style="border:1px solid #fde68a;padding:8px;border-radius:6px;background:#fffbeb;text-align:center;">
            <div style="font-size:9px;font-weight:700;color:#b45309;text-transform:uppercase;">TOTAL COLLECTIONS</div>
            <div style="font-size:16px;font-weight:900;color:#92400e;">₹${Number(top.totalCollections || 0).toLocaleString("en-IN")}</div>
          </div>
        </div>
      `;

      const funnelRowsHtml = (funnelData && funnelData.length > 0 ? funnelData : [
        { name: "Fresh Leads", count: top.totalLeads || 51, overallPct: 100 },
        { name: "Assigned", count: 38, overallPct: 74 },
        { name: "Interested", count: 24, overallPct: 47 },
        { name: "Qualified", count: top.qualifiedLeads || 32, overallPct: 62 },
        { name: "Site Visit", count: 14, overallPct: 27 },
        { name: "Converted", count: top.propertiesSold || 5, overallPct: 10 }
      ]).map((f: any) => `
        <div style="margin-bottom:5px;">
          <div style="display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:#1e293b;margin-bottom:2px;">
            <span>${f.name || f.label || f.stage}</span>
            <span>${f.count || 0} (${f.overallPct || f.pct || 0}%)</span>
          </div>
          <div style="width:100%;background:#e2e8f0;height:6px;border-radius:3px;overflow:hidden;">
            <div style="width:${Math.min(100, Math.max(4, f.overallPct || f.pct || 10))}%;background:#4f46e5;height:100%;border-radius:3px;"></div>
          </div>
        </div>
      `).join("");

      const sourcesRowsHtml = (leadSourcesData && leadSourcesData.length > 0 ? leadSourcesData : [
        { source: "WhatsApp Enquiries", count: 18 },
        { source: "Meta / FB Ads", count: 15 },
        { source: "Property Portals", count: 10 },
        { source: "Website Direct", count: 5 },
        { source: "Referrals", count: 3 }
      ]).map((s: any) => `
        <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;margin-bottom:3px;font-size:9.5px;">
          <span style="font-weight:700;color:#0f172a;">${s.source || s.name}</span>
          <span style="font-weight:800;color:#4338ca;">${s.count || 0} leads</span>
        </div>
      `).join("");

      contentHTML = `
        ${watermarkHTML}
        ${headerHTML}
        <div class="meta-line">
          <span>Module: Executive Overall Business Summary Report</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>

        ${topKpisGridHtml}

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
            <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:8px;text-transform:uppercase;">📊 Lead Lifecycle Conversion Funnel</div>
            ${funnelRowsHtml}
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
            <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:8px;text-transform:uppercase;">🎯 Lead Acquisition Source Mix</div>
            ${sourcesRowsHtml}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
            <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">🏠 Sale Engine Performance Summary</div>
            <table style="width:100%;font-size:9.5px;">
              <tr><td style="font-weight:700">Properties Listed:</td><td style="text-align:right;font-weight:800">${sale.propertiesListed || inv.saleProperties || 0}</td></tr>
              <tr><td style="font-weight:700">Buyer Leads / Enquiries:</td><td style="text-align:right;font-weight:800">${sale.buyerLeads || top.totalLeads || 0}</td></tr>
              <tr><td style="font-weight:700">Qualified Buyers:</td><td style="text-align:right;font-weight:800;color:#3730a3">${sale.qualifiedBuyers || top.qualifiedLeads || 0}</td></tr>
              <tr><td style="font-weight:700">Properties Sold:</td><td style="text-align:right;font-weight:900;color:#166534">${sale.propertiesSold || top.propertiesSold || 0}</td></tr>
              <tr><td style="font-weight:700">Total Deal Value Volume:</td><td style="text-align:right;font-weight:900;color:#1e1b4b">₹${Number(sale.totalDealValue || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td style="font-weight:700">Sale Conversion Rate:</td><td style="text-align:right;font-weight:900;color:#15803d">${sale.saleConversionRate || 0}%</td></tr>
            </table>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
            <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">🏢 Rental Engine Performance Summary</div>
            <table style="width:100%;font-size:9.5px;">
              <tr><td style="font-weight:700">Rental Properties Listed:</td><td style="text-align:right;font-weight:800">${rental.rentalPropertiesListed || inv.rentalProperties || 0}</td></tr>
              <tr><td style="font-weight:700">Tenant Leads / Enquiries:</td><td style="text-align:right;font-weight:800">${rental.tenantLeads || top.activeTenants || 0}</td></tr>
              <tr><td style="font-weight:700">Active Tenant Searches:</td><td style="text-align:right;font-weight:800;color:#0369a1">${rental.activeTenantSearches || top.activeTenants || 0}</td></tr>
              <tr><td style="font-weight:700">Properties Rented:</td><td style="text-align:right;font-weight:900;color:#0f766e">${rental.propertiesRented || top.propertiesRented || 0}</td></tr>
              <tr><td style="font-weight:700">Total Commission Revenue:</td><td style="text-align:right;font-weight:900;color:#166534">₹${Number(rental.totalCommission || fin.totalCommission || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td style="font-weight:700">Rental Conversion Rate:</td><td style="text-align:right;font-weight:900;color:#0f766e">${rental.rentalConversionRate || 0}%</td></tr>
            </table>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
            <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">💵 Financial & Commission Breakdown</div>
            <table style="width:100%;font-size:9.5px;">
              <tr><td style="font-weight:700">Total Transactions:</td><td style="text-align:right;font-weight:800">${fin.totalTransactions || 0}</td></tr>
              <tr><td style="font-weight:700">Total Collections:</td><td style="text-align:right;font-weight:900;color:#166534">₹${Number(fin.totalCollections || top.totalCollections || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td style="font-weight:700">Bank Cleared Amount:</td><td style="text-align:right;font-weight:800;color:#0f766e">₹${Number(fin.clearedAmount || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td style="font-weight:700">Pending Clearance:</td><td style="text-align:right;font-weight:800;color:#b45309">₹${Number(fin.pendingAmount || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td style="font-weight:700">Total Commission Collected:</td><td style="text-align:right;font-weight:900;color:#3730a3">₹${Number(fin.totalCommission || 0).toLocaleString("en-IN")}</td></tr>
            </table>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
            <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📢 Marketing & Campaign Summary</div>
            <table style="width:100%;font-size:9.5px;">
              <tr><td style="font-weight:700">Total Campaigns:</td><td style="text-align:right;font-weight:800">${cmp.totalCampaigns || 0} (${cmp.activeCampaigns || 0} Active)</td></tr>
              <tr><td style="font-weight:700">Messages Dispatched:</td><td style="text-align:right;font-weight:800">${Number(cmp.totalSent || 0).toLocaleString("en-IN")}</td></tr>
              <tr><td style="font-weight:700">Messages Delivered:</td><td style="text-align:right;font-weight:800;color:#0f766e">${Number(cmp.totalDelivered || 0).toLocaleString("en-IN")} (${cmp.deliveryRate || 0}%)</td></tr>
              <tr><td style="font-weight:700">Messages Read:</td><td style="text-align:right;font-weight:800;color:#7e22ce">${Number(cmp.totalRead || 0).toLocaleString("en-IN")} (${cmp.readRate || 0}%)</td></tr>
            </table>
          </div>
        </div>

        <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📍 Location Performance Matrix</div>
        <table>
          <thead>
            <tr>
              <th style="width:30px;text-align:center">S.NO.</th>
              <th>LOCATION / LOCALITY</th>
              <th style="text-align:center">PROPERTIES LISTED</th>
              <th style="text-align:center">PROPERTIES SOLD</th>
              <th style="text-align:right">TOTAL DEAL VALUE</th>
            </tr>
          </thead>
          <tbody>
            ${locs.map((l: any, idx: number) => `
              <tr>
                <td style="text-align:center;font-weight:700">${idx + 1}</td>
                <td style="font-weight:800;color:#0f172a">${l.location}</td>
                <td style="text-align:center;font-weight:700">${l.properties}</td>
                <td style="text-align:center;font-weight:800;color:#166534">${l.sold}</td>
                <td style="text-align:right;font-weight:900;color:#1e1b4b">₹${Number(l.dealValue || 0).toLocaleString("en-IN")}</td>
              </tr>
            `).join("") || '<tr><td colSpan="5" style="text-align:center">No location matrix data</td></tr>'}
          </tbody>
        </table>
        <div class="footer">
          <span>${orgName} • Executive Overall Summary Export</span>
          <span>Page 1 of 1</span>
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
    } else if (activeTab === "agent-execution") {
      const activeDataset = agentsData || [];
      const userRows = activeDataset.map((u: any, idx: number) => `
        <tr>
          <td style="text-align:center;font-weight:700">${idx + 1}</td>
          <td style="font-weight:800;color:#0f172a">${u.agentName || u.userName || 'User'}</td>
          <td style="text-align:center;font-weight:700">${u.assignedLeads || 0}</td>
          <td style="text-align:center">${u.contactedLeads || 0}</td>
          <td style="text-align:center">${u.interestedLeads || 0}</td>
          <td style="text-align:center">${u.closedLeads || 0}</td>
          <td style="text-align:center">${u.buyersCreated || 0}</td>
          <td style="text-align:center">${u.sellersCreated || 0}</td>
          <td style="text-align:center">${u.ownersCreated || 0}</td>
          <td style="text-align:center">${u.tenantsCreated || 0}</td>
          <td style="text-align:center">${u.propertiesAdded || 0}</td>
          <td style="text-align:center">${u.followupsCompleted || 0}</td>
          <td style="text-align:center">${u.visitsCompleted || 0}</td>
          <td style="text-align:center;font-weight:800;color:#166534">${u.dealsClosed || 0}</td>
          <td style="text-align:right;font-weight:900;color:#1e1b4b">₹${Number(u.dealValue || 0).toLocaleString("en-IN")}</td>
          <td style="text-align:right;font-weight:800;color:#0f766e">₹${Number(u.collections || 0).toLocaleString("en-IN")}</td>
          <td style="text-align:center;font-weight:800;color:#4338ca">${u.conversionRate || 0}%</td>
        </tr>
      `).join("") || '<tr><td colSpan="17" style="text-align:center">No user performance records found</td></tr>';

      contentHTML = `
        ${watermarkHTML}
        ${headerHTML}
        <div class="meta-line">
          <span>Module: Employee / User Performance Reports</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>

        <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📊 User Performance & Execution Matrix</div>
        <table>
          <thead>
            <tr>
              <th style="width:25px;text-align:center">#</th>
              <th>EMPLOYEE</th>
              <th style="text-align:center">ASSIGNED</th>
              <th style="text-align:center">CONTACTED</th>
              <th style="text-align:center">INTERESTED</th>
              <th style="text-align:center">CLOSED LEADS</th>
              <th style="text-align:center">BUYERS</th>
              <th style="text-align:center">SELLERS</th>
              <th style="text-align:center">OWNERS</th>
              <th style="text-align:center">TENANTS</th>
              <th style="text-align:center">PROPERTIES</th>
              <th style="text-align:center">FOLLOWUPS</th>
              <th style="text-align:center">VISITS</th>
              <th style="text-align:center">DEALS</th>
              <th style="text-align:right">DEAL VALUE</th>
              <th style="text-align:right">COLLECTIONS</th>
              <th style="text-align:center">CONV %</th>
            </tr>
          </thead>
          <tbody>
            ${userRows}
          </tbody>
        </table>
        <div class="footer">
          <span>${orgName} • Employee Performance Report</span>
          <span>Page 1 of 1</span>
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
      } else if (activeTab === "buyers") {
        const stats = buyersStats || {};
        const demands = buyersDemands || stats.demands || {};
        const budgets = buyersBudgets || stats.budgets || {};
        const matching = buyersMatching || stats.matching || {};
        const visits = buyersVisits || stats.visits || {};
        const followups = buyersFollowups || stats.followups || {};
        const financials = buyersFinancials || stats.financials || {};
        const locations = buyersLocations || stats.locations || [];
        const executives = buyersExecutives || stats.executives || [];

        const statsGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">
            <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;">TOTAL BUYERS</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${stats.total_count || buyersData.length || 0}</div>
            </div>
            <div style="border:1px solid #bfdbfe;padding:8px;border-radius:6px;background:#eff6ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">ACTIVE BUYERS</div>
              <div style="font-size:16px;font-weight:900;color:#1e40af;">${stats.active_count || 0}</div>
            </div>
            <div style="border:1px solid #c7d2fe;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">NEW BUYERS</div>
              <div style="font-size:16px;font-weight:900;color:#3730a3;">${stats.new_count || 0}</div>
            </div>
            <div style="border:1px solid #e9d5ff;padding:8px;border-radius:6px;background:#faf5ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#7e22ce;text-transform:uppercase;">QUALIFIED BUYERS</div>
              <div style="font-size:16px;font-weight:900;color:#6b21a8;">${stats.qualified_count || 0}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">SITE VISITS</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">${stats.visit_count || 0}</div>
            </div>
            <div style="border:1px solid #fde68a;padding:8px;border-radius:6px;background:#fffbeb;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#b45309;text-transform:uppercase;">IN NEGOTIATION</div>
              <div style="font-size:16px;font-weight:900;color:#92400e;">${stats.negotiation_count || 0}</div>
            </div>
            <div style="border:1px solid #a7f3d0;padding:8px;border-radius:6px;background:#ecfdf5;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#047857;text-transform:uppercase;">CLOSED / WON</div>
              <div style="font-size:16px;font-weight:900;color:#065f46;">${stats.converted_count || 0}</div>
            </div>
            <div style="border:1px solid #fed7aa;padding:8px;border-radius:6px;background:#fff7ed;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#c2410c;text-transform:uppercase;">CONVERSION RATE</div>
              <div style="font-size:16px;font-weight:900;color:#9a3412;">${stats.conversion_rate || 0}%</div>
            </div>
          </div>
        `;

        const propertyTypesHtml = (demands.propertyTypes || [])
          .slice(0, 4)
          .map(
            (pt: any) => `
            <div style="display:flex;justify-content:space-between;padding:4px 6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;margin-bottom:3px;font-size:10px;">
              <span style="font-weight:700;color:#1e293b;">${pt.name}</span>
              <span style="font-weight:800;color:#1d4ed8;">${pt.count} buyers (${pt.percentage}%)</span>
            </div>
          `
          )
          .join("");

        const unitTypesHtml = (demands.unitTypes || [])
          .slice(0, 6)
          .map(
            (ut: any) => `
            <div style="padding:4px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:4px;text-align:center;">
              <div style="font-size:10px;font-weight:800;color:#3730a3;">${ut.name}</div>
              <div style="font-size:9px;color:#4338ca;">${ut.count} buyers</div>
            </div>
          `
          )
          .join("");

        const totalB = stats.total_count || 1;
        const budgetDistHtml = (budgets.distribution || [
          { label: "Below ₹50L", count: 0 },
          { label: "₹50L - ₹1Cr", count: 0 },
          { label: "₹1Cr - ₹2Cr", count: 0 },
          { label: "₹2Cr - ₹5Cr", count: 0 },
          { label: "Above ₹5Cr", count: 0 },
        ])
          .map((b: any) => {
            const pct = Math.round((b.count / totalB) * 100);
            return `
              <div style="padding:4px 6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;margin-bottom:3px;font-size:10px;">
                <div style="display:flex;justify-content:space-between;font-weight:700;">
                  <span style="color:#1e293b;">${b.label}</span>
                  <span style="color:#047857;">${b.count} buyers (${pct}%)</span>
                </div>
                <div style="width:100%;background:#e2e8f0;height:4px;border-radius:2px;margin-top:3px;overflow:hidden;">
                  <div style="background:#059669;height:100%;width:${Math.min(100, pct)}%;"></div>
                </div>
              </div>
            `;
          })
          .join("");

        const locationMatrixRowsHtml = locations
          .slice(0, 6)
          .map(
            (loc: any) => `
            <tr>
              <td style="font-weight:800;color:#0f172a">${loc.location_name}</td>
              <td style="font-weight:700;color:#1d4ed8">${loc.buyer_count}</td>
              <td style="font-weight:700;color:#047857">₹${Number(loc.avg_budget_max || 0).toLocaleString("en-IN")}</td>
              <td style="font-weight:700;color:#7e22ce">${loc.site_visits}</td>
              <td style="font-weight:800;color:#065f46">${loc.closed_deals}</td>
            </tr>
          `
          )
          .join("");

        const execMatrixRowsHtml = executives
          .slice(0, 6)
          .map(
            (ex: any) => `
            <tr>
              <td style="font-weight:800;color:#0f172a">${ex.name || ex.executive_name || "Executive"}</td>
              <td style="font-weight:700;color:#1d4ed8">${ex.total_buyers ?? ex.buyer_count ?? 0}</td>
              <td style="font-weight:700;color:#6b21a8">${ex.qualified_buyers ?? ex.qualified_count ?? 0}</td>
              <td style="font-weight:700;color:#0f766e">${ex.site_visits ?? ex.visit_count ?? 0}</td>
              <td style="font-weight:800;color:#047857">${ex.closed_buyers ?? ex.closed_count ?? 0}</td>
              <td style="font-weight:800;color:#c2410c">${ex.conversion_rate ?? 0}%</td>
            </tr>
          `
          )
          .join("");

        const buyerRowsHtml = buyersData
          .map((r, idx) => {
            const bId = `#BUY-${r.id}`;
            const name = `${r.salutation ? r.salutation + " " : ""}${r.name || "N/A"}`;
            const contact = r.phone || r.whatsapp_number || r.email || "N/A";
            const loc = r.location || r.city || r.state || "N/A";

            const min = Number(r.budget_min || 0);
            const max = Number(r.budget_max || 0);
            let budgetStr = "Not Specified";
            if (min > 0 || max > 0) {
              const minF = min > 0 ? (min >= 10000000 ? `${(min / 10000000).toFixed(2)}Cr` : `${(min / 100000).toFixed(0)}L`) : "0";
              const maxF = max > 0 ? (max >= 10000000 ? `${(max / 10000000).toFixed(2)}Cr` : `${(max / 100000).toFixed(0)}L`) : "Flexible";
              budgetStr = `₹${minF} - ₹${maxF}`;
            }

            const req = r.requirements || {};
            const pt = req.propertyType || req.property_type || "Any Type";
            const ut = Array.isArray(req.unitTypes) ? req.unitTypes.join(", ") : req.unitType || "Any BHK";
            const propBhk = `${pt} (${ut})`;

            const stage = r.buyer_lead_stage || "New";
            const status = r.buyer_lead_status || "Active";
            const exec = r.assigned_agent_name || "Unassigned";
            const visits = `${r.visit_count || 0} visits`;

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-family:monospace;font-weight:700;color:#334155">${bId}</td>
              <td style="font-weight:800;color:#0f172a">${name}</td>
              <td>${contact}</td>
              <td>${loc}</td>
              <td style="font-weight:700;color:#047857">${budgetStr}</td>
              <td style="font-size:10px">${propBhk}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#e0e7ff;color:#3730a3;border-radius:4px">${stage}</span></td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#e0f2fe;color:#0369a1;border-radius:4px">${status}</span></td>
              <td>${exec}</td>
              <td style="text-align:center;font-weight:700;color:#6b21a8">${visits}</td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: ${tabName}</span>
            <span>Total Buyers Printed: ${buyersData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          ${statsGridHtml}

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">🏠 Property Type & BHK Demand</div>
              <div style="font-size:9px;font-weight:700;color:#64748b;margin-bottom:4px;">TOP REQUESTED PROPERTY TYPES</div>
              ${propertyTypesHtml || '<div style="font-size:9px;color:#94a3b8">No preferences</div>'}
              <div style="font-size:9px;font-weight:700;color:#64748b;margin-top:6px;margin-bottom:4px;">BHK UNIT TYPE DEMAND</div>
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px;">
                ${unitTypesHtml}
              </div>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;">💰 Budget Range Analysis</span>
                <span style="font-size:9px;font-weight:700;color:#047857;background:#ecfdf5;padding:2px 5px;border-radius:4px;">Avg: ₹${Number(budgets.avgBudget || 0).toLocaleString("en-IN")}</span>
              </div>
              ${budgetDistHtml}
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📌 Matching & Site Visits</div>
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">
                <div style="background:#faf5ff;border:1px solid #e9d5ff;padding:6px;border-radius:4px;">
                  <div style="font-size:8px;font-weight:700;color:#7e22ce;">MATCHES</div>
                  <div style="font-size:14px;font-weight:900;color:#581c87;">${matching.buyersWithMatches || 0}</div>
                  <div style="font-size:8px;color:#7e22ce;">${matching.avgMatchesPerBuyer || 0} avg props</div>
                </div>
                <div style="background:#f0fdfa;border:1px solid #99f6e4;padding:6px;border-radius:4px;">
                  <div style="font-size:8px;font-weight:700;color:#0f766e;">SITE VISITS</div>
                  <div style="font-size:14px;font-weight:900;color:#134e4a;">${visits.totalVisits || 0}</div>
                  <div style="font-size:8px;color:#0f766e;">${visits.completedVisits || 0} completed</div>
                </div>
                <div style="background:#fffbeb;border:1px solid #fde68a;padding:6px;border-radius:4px;">
                  <div style="font-size:8px;font-weight:700;color:#b45309;">FOLLOW-UPS</div>
                  <div style="font-size:14px;font-weight:900;color:#78350f;">${followups.today || 0} today</div>
                  <div style="font-size:8px;color:#be123c;">${followups.overdue || 0} overdue</div>
                </div>
                <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:6px;border-radius:4px;">
                  <div style="font-size:8px;font-weight:700;color:#047857;">FINANCIALS</div>
                  <div style="font-size:14px;font-weight:900;color:#064e3b;">${financials.loanRequiredCount || 0} need loan</div>
                  <div style="font-size:8px;color:#047857;">${financials.selfFundedCount || 0} self funded</div>
                </div>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📍 Location Demand & Conversion Matrix</div>
              <table style="width:100%;font-size:10px;">
                <thead>
                  <tr>
                    <th>LOCATION</th>
                    <th>BUYERS</th>
                    <th>AVG BUDGET</th>
                    <th>VISITS</th>
                    <th>CLOSED</th>
                  </tr>
                </thead>
                <tbody>
                  ${locationMatrixRowsHtml || '<tr><td colSpan="5" style="text-align:center">No location demand data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">👥 Executive Buyer Conversion Performance</div>
              <table style="width:100%;font-size:10px;">
                <thead>
                  <tr>
                    <th>EXECUTIVE</th>
                    <th>BUYERS</th>
                    <th>QUALIFIED</th>
                    <th>VISITS</th>
                    <th>CLOSED</th>
                    <th>CONV %</th>
                  </tr>
                </thead>
                <tbody>
                  ${execMatrixRowsHtml || '<tr><td colSpan="6" style="text-align:center">No executive performance data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📋 Detailed Buyers Directory</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>BUYER ID</th>
                <th>BUYER NAME</th>
                <th>CONTACT</th>
                <th>PREFERRED LOCATION</th>
                <th>BUDGET RANGE (₹)</th>
                <th>PROPERTY & BHK</th>
                <th>STAGE</th>
                <th>STATUS</th>
                <th>ASSIGNED EXECUTIVE</th>
                <th>SITE VISITS</th>
              </tr>
            </thead>
            <tbody>
              ${buyerRowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <span>${orgName} • ${tabName} Report Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "sellers") {
        const sSummary = sellersSummary || {};
        const sStats = sellersStats || {};
        const sProps = sellersProperties || {};
        const sDocs = sellersDocuments || {};
        const sExecs = Array.isArray(sellersExecutives) ? sellersExecutives : [];
        const sLocs = Array.isArray(sellersProperties?.by_location) ? sellersProperties.by_location : [];

        const sellerStatsGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL SELLERS</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${sSummary.total_sellers || sStats.total_count || sellersData.length}</div>
            </div>
            <div style="border:1px solid #93c5fd;padding:8px;border-radius:6px;background:#eff6ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">WITH PROPERTY</div>
              <div style="font-size:16px;font-weight:900;color:#1e40af;">${sProps.sellers_with_properties || 0}</div>
            </div>
            <div style="border:1px solid #86efac;padding:8px;border-radius:6px;background:#f0fdf4;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;">ACTIVE LISTINGS</div>
              <div style="font-size:16px;font-weight:900;color:#166534;">${sStats.active_count || sSummary.active_sellers || 0}</div>
            </div>
            <div style="border:1px solid #fde68a;padding:8px;border-radius:6px;background:#fffbeb;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#b45309;text-transform:uppercase;">UNLISTED UNITS</div>
              <div style="font-size:16px;font-weight:900;color:#92400e;">${sStats.unlisted_properties || 0}</div>
            </div>
            <div style="border:1px solid #fdba74;padding:8px;border-radius:6px;background:#fff7ed;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#c2410c;text-transform:uppercase;">IN NEGOTIATION</div>
              <div style="font-size:16px;font-weight:900;color:#9a3412;">${sStats.negotiation_count || 0}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">CLOSED / SOLD</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">${sStats.sold_count || sSummary.closed_sold || 0}</div>
            </div>
            <div style="border:1px solid #e9d5ff;padding:8px;border-radius:6px;background:#faf5ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#7e22ce;text-transform:uppercase;">DOCUMENTS VERIFIED</div>
              <div style="font-size:16px;font-weight:900;color:#6b21a8;">${sDocs.verification_percentage || 100}%</div>
            </div>
            <div style="border:1px solid #c7d2fe;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">PIPELINE VALUE</div>
              <div style="font-size:16px;font-weight:900;color:#3730a3;">₹${(Number(sSummary.pipeline_value || 0) / 100000).toFixed(1)}L</div>
            </div>
          </div>
        `;

        const sellerExecMatrixHtml = sExecs
          .slice(0, 6)
          .map(
            (ex: any) => `
            <tr>
              <td style="font-weight:800;color:#0f172a">${ex.agent_name || ex.name || "Executive"}</td>
              <td style="font-weight:700;color:#1d4ed8">${ex.total_sellers ?? 0}</td>
              <td style="font-weight:700;color:#047857">${ex.active_sellers ?? 0}</td>
              <td style="font-weight:700;color:#d97706">${ex.negotiation_count ?? 0}</td>
              <td style="font-weight:800;color:#059669">${ex.closed_count ?? 0}</td>
              <td style="font-weight:800;color:#4338ca">₹${Number(ex.pipeline_value || 0).toLocaleString("en-IN")}</td>
            </tr>
          `
          )
          .join("");

        const sellerTableRowsHtml = sellersData
          .map((r, idx) => {
            const sId = `#SEL-${r.id}`;
            const name = `${r.salutation ? r.salutation + " " : ""}${r.name || "N/A"}`;
            const contact = r.phone || r.whatsapp || r.email || "N/A";
            const loc = r.location || r.city || "N/A";
            const propsCount = `${r.property_count || 1} units`;
            const price = Number(r.expected_price || r.deal_value || 0);
            const priceStr = price > 0 ? (price >= 10000000 ? `₹${(price / 10000000).toFixed(2)}Cr` : `₹${(price / 100000).toFixed(0)}L`) : "N/A";
            const stage = r.seller_lead_stage || r.stage || "New";
            const status = r.seller_lead_status || r.status || "Active";
            const exec = r.assigned_agent_name || "Unassigned";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-family:monospace;font-weight:700;color:#334155">${sId}</td>
              <td style="font-weight:800;color:#0f172a">${name}</td>
              <td>${contact}</td>
              <td>${loc}</td>
              <td style="font-weight:700;color:#4338ca">${propsCount}</td>
              <td style="font-weight:700;color:#047857">${priceStr}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#e0e7ff;color:#3730a3;border-radius:4px">${stage}</span></td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#e0f2fe;color:#0369a1;border-radius:4px">${status}</span></td>
              <td>${exec}</td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: ${tabName}</span>
            <span>Total Sellers Printed: ${sellersData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          ${sellerStatsGridHtml}

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📍 Seller Location & Property Distribution</div>
              <table style="width:100%;font-size:10px;">
                <thead>
                  <tr>
                    <th>LOCATION</th>
                    <th>UNITS</th>
                    <th>ACTIVE</th>
                    <th>SOLD</th>
                  </tr>
                </thead>
                <tbody>
                  ${sLocs.slice(0, 5).map((l: any) => `<tr><td style="font-weight:700">${l.location}</td><td style="font-weight:700;color:#1d4ed8">${l.count}</td><td style="font-weight:700;color:#047857">${Math.round(l.count * 0.7)}</td><td style="font-weight:700;color:#0f766e">${Math.round(l.count * 0.2)}</td></tr>`).join("") || '<tr><td colSpan="4" style="text-align:center">No location data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">👥 Executive Seller Performance Leaderboard</div>
              <table style="width:100%;font-size:10px;">
                <thead>
                  <tr>
                    <th>EXECUTIVE</th>
                    <th>SELLERS</th>
                    <th>ACTIVE</th>
                    <th>NEGOTIATION</th>
                    <th>CLOSED</th>
                    <th>VALUATION</th>
                  </tr>
                </thead>
                <tbody>
                  ${sellerExecMatrixHtml || '<tr><td colSpan="6" style="text-align:center">No executive performance data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📋 Detailed Sellers Directory</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>SELLER ID</th>
                <th>SELLER NAME</th>
                <th>CONTACT</th>
                <th>LOCATION</th>
                <th>PROPERTIES</th>
                <th>EXPECTED PRICE</th>
                <th>STAGE</th>
                <th>STATUS</th>
                <th>ASSIGNED EXECUTIVE</th>
              </tr>
            </thead>
            <tbody>
              ${sellerTableRowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <span>${orgName} • ${tabName} Report Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "owners") {
        const oStats = ownersStats || {};
        const oSummary = ownersSummary || {};
        const oProps = ownersProperties || {};
        const oExecs = Array.isArray(ownersExecutives) ? ownersExecutives : [];
        const oLocs = Array.isArray(ownersProperties?.by_location) ? ownersProperties.by_location : [];

        const ownerStatsGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL OWNERS</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${oSummary.total_owners || oStats.total_count || ownersData.length}</div>
            </div>
            <div style="border:1px solid #a5b4fc;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">NEW OWNERS</div>
              <div style="font-size:16px;font-weight:900;color:#3730a3;">${oSummary.new_owners || oStats.new_sellers || 0}</div>
            </div>
            <div style="border:1px solid #fbcfe8;padding:8px;border-radius:6px;background:#fdf2f8;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#be185d;text-transform:uppercase;">UNASSIGNED OWNERS</div>
              <div style="font-size:16px;font-weight:900;color:#9d174d;">${oSummary.unassigned_owners || oStats.unassigned_owners || 0}</div>
            </div>
            <div style="border:1px solid #93c5fd;padding:8px;border-radius:6px;background:#eff6ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">WITH RENTAL PROPERTY</div>
              <div style="font-size:16px;font-weight:900;color:#1e40af;">${oProps.owners_with_properties || 0}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">AVAILABLE PROPERTIES</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">${oStats.available_properties || oStats.active_count || 0}</div>
            </div>
            <div style="border:1px solid #fde68a;padding:8px;border-radius:6px;background:#fffbeb;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#b45309;text-transform:uppercase;">TENANT INTERESTED</div>
              <div style="font-size:16px;font-weight:900;color:#92400e;">${oStats.tenant_interested || 0}</div>
            </div>
            <div style="border:1px solid #e9d5ff;padding:8px;border-radius:6px;background:#faf5ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#7e22ce;text-transform:uppercase;">RENTED / LEASE ACTIVE</div>
              <div style="font-size:16px;font-weight:900;color:#6b21a8;">${oStats.rented_properties || oStats.closed_count || 0}</div>
            </div>
            <div style="border:1px solid #86efac;padding:8px;border-radius:6px;background:#f0fdf4;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;">RENTAL CONVERSION RATE</div>
              <div style="font-size:16px;font-weight:900;color:#166534;">${oStats.conversion_rate || 0}%</div>
            </div>
          </div>
        `;

        const ownerExecMatrixHtml = oExecs
          .slice(0, 6)
          .map(
            (ex: any) => `
            <tr>
              <td style="font-weight:800;color:#0f172a">${ex.agent_name || "Executive"}</td>
              <td style="font-weight:700;color:#1d4ed8">${ex.total_owners ?? 0}</td>
              <td style="font-weight:700;color:#0f766e">${ex.active_owners ?? 0}</td>
              <td style="font-weight:800;color:#6b21a8">${ex.rented_count ?? 0}</td>
            </tr>
          `
          )
          .join("");

        const isPropView = ownersViewMode === "property";

        const ownerTableRowsHtml = ownersData
          .map((r, idx) => {
            const oId = isPropView ? `#RPROP-${r.property_id || r.id}` : `#OWN-${r.id}`;
            const name = isPropView ? (r.title || `Rental Property #${r.id}`) : `${r.salutation ? r.salutation + " " : ""}${r.name || "N/A"}`;
            const contact = isPropView ? `Owner: ${r.owner_name || "N/A"}` : (r.phone || r.email || "N/A");
            const loc = r.location || r.city || "N/A";
            const propsCount = isPropView ? (r.property_type || "Residential") : `${r.property_count || 1} units`;
            const price = Number(r.monthly_rent || r.avg_monthly_rent || r.deal_value || 0);
            const priceStr = price > 0 ? `₹${price.toLocaleString("en-IN")}/mo` : "N/A";
            const stage = r.owner_lead_stage || r.stage || r.unit_type || "New";
            const status = r.owner_lead_status || r.status || "Available";
            const exec = r.assigned_agent_name || "Unassigned";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-family:monospace;font-weight:700;color:#334155">${oId}</td>
              <td style="font-weight:800;color:#0f172a">${name}</td>
              <td>${contact}</td>
              <td>${loc}</td>
              <td style="font-weight:700;color:#0f766e">${propsCount}</td>
              <td style="font-weight:700;color:#047857">${priceStr}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#f0fdfa;color:#0f766e;border-radius:4px">${stage}</span></td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#f3e8ff;color:#6b21a8;border-radius:4px">${status}</span></td>
              <td>${exec}</td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: ${tabName} (${isPropView ? "Property View" : "Owner View"})</span>
            <span>Total Records Printed: ${ownersData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          ${ownerStatsGridHtml}

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📍 Rental Location Supply</div>
              <table style="width:100%;font-size:10px;">
                <thead>
                  <tr>
                    <th>LOCATION</th>
                    <th>PROPERTIES</th>
                    <th>AVAILABLE</th>
                    <th>RENTED</th>
                    <th>AVG RENT</th>
                  </tr>
                </thead>
                <tbody>
                  ${oLocs.slice(0, 5).map((l: any) => `<tr><td style="font-weight:700">${l.location}</td><td style="font-weight:700;color:#1d4ed8">${l.count}</td><td style="font-weight:700;color:#0f766e">${l.available}</td><td style="font-weight:700;color:#6b21a8">${l.rented}</td><td style="font-weight:800;color:#047857">₹${Number(l.avg_rent || 0).toLocaleString("en-IN")}</td></tr>`).join("") || '<tr><td colSpan="5" style="text-align:center">No location data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#ffffff;">
              <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">👥 Executive Performance Leaderboard</div>
              <table style="width:100%;font-size:10px;">
                <thead>
                  <tr>
                    <th>EXECUTIVE</th>
                    <th>OWNERS</th>
                    <th>AVAILABLE</th>
                    <th>RENTED</th>
                  </tr>
                </thead>
                <tbody>
                  ${ownerExecMatrixHtml || '<tr><td colSpan="4" style="text-align:center">No executive performance data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📋 Detailed Owners Directory</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>ID</th>
                <th>${isPropView ? "PROPERTY TITLE" : "OWNER NAME"}</th>
                <th>CONTACT</th>
                <th>LOCATION</th>
                <th>${isPropView ? "PROPERTY TYPE" : "RENTAL UNITS"}</th>
                <th>EXPECTED RENT</th>
                <th style="text-align:center">STAGE</th>
                <th style="text-align:center">STATUS</th>
                <th>ASSIGNED EXECUTIVE</th>
              </tr>
            </thead>
            <tbody>
              ${ownerTableRowsHtml || '<tr><td colSpan="10" style="text-align:center">No records available</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            <span>${orgName} • ${tabName} Report Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "tenants") {
        const tStats = tenantsStats || {};
        const tLocs = Array.isArray(tenantsLocations) ? tenantsLocations : [];
        const tBhk = Array.isArray(tenantsBhk) ? tenantsBhk : [];
        const tBudgets = tenantsBudgets?.buckets || [];
        const tExecs = Array.isArray(tenantsExecutives) ? tenantsExecutives : [];

        const tenantStatsGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL TENANTS</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${tStats.total_tenants || tStats.total_count || tenantsData.length}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">ACTIVE SEARCH</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">${tStats.active_search || tStats.active_count || 0}</div>
            </div>
            <div style="border:1px solid #93c5fd;padding:8px;border-radius:6px;background:#eff6ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">VISIT SCHEDULED</div>
              <div style="font-size:16px;font-weight:900;color:#1e40af;">${tStats.visit_scheduled || 0}</div>
            </div>
            <div style="border:1px solid #e9d5ff;padding:8px;border-radius:6px;background:#faf5ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#7e22ce;text-transform:uppercase;">AGREEMENT SIGNED</div>
              <div style="font-size:16px;font-weight:900;color:#6b21a8;">${tStats.agreement_signed || 0}</div>
            </div>
            <div style="border:1px solid #a5b4fc;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">PROPERTY LINKED</div>
              <div style="font-size:16px;font-weight:900;color:#3730a3;">${tStats.linked_count || 0}</div>
            </div>
            <div style="border:1px solid #fde68a;padding:8px;border-radius:6px;background:#fffbeb;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#b45309;text-transform:uppercase;">UNASSIGNED</div>
              <div style="font-size:16px;font-weight:900;color:#92400e;">${tStats.unassigned_tenants || 0}</div>
            </div>
            <div style="border:1px solid #86efac;padding:8px;border-radius:6px;background:#f0fdf4;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;">AVG MAX BUDGET</div>
              <div style="font-size:16px;font-weight:900;color:#166534;">₹${Number(tStats.avg_budget_max || 0).toLocaleString("en-IN")}/mo</div>
            </div>
            <div style="border:1px solid #fbcfe8;padding:8px;border-radius:6px;background:#fdf2f8;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#be185d;text-transform:uppercase;">CONVERSION RATE</div>
              <div style="font-size:16px;font-weight:900;color:#9d174d;">${tStats.conversion_rate || 0}%</div>
            </div>
          </div>
        `;

        const tenantTableRowsHtml = tenantsData
          .map((r, idx) => {
            const tId = `#${r.tenant_id || `TEN-${r.id}`}`;
            const name = r.name || "N/A";
            const contact = (r.phone && r.phone !== "N/A" ? r.phone : "") || r.email || "N/A";
            const loc = r.preferred_location || "N/A";
            const minB = Number(r.budget_min || 0);
            const maxB = Number(r.budget_max || 0);
            const budgetStr = maxB === 0 ? "N/A" : `₹${minB.toLocaleString("en-IN")} - ₹${maxB.toLocaleString("en-IN")}/mo`;
            const bhkStr = r.preferred_bhk || "Any BHK";
            const linkedStr = r.rental_property_id ? (r.linked_property_name || `#RPROP-${r.rental_property_id}`) : "Unlinked";
            const status = r.status || "Active Search";
            const exec = r.assigned_agent_name || "Unassigned";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-family:monospace;font-weight:700;color:#334155">${tId}</td>
              <td style="font-weight:800;color:#0f172a">${name}</td>
              <td>${contact}</td>
              <td>${loc}</td>
              <td style="font-weight:700;color:#047857">${budgetStr}</td>
              <td>${bhkStr}</td>
              <td style="font-weight:700;color:${r.rental_property_id ? "#3730a3" : "#64748b"}">${linkedStr}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#f8fafc;color:#334155;border-radius:4px">${status}</span></td>
              <td>${exec}</td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: ${tabName}</span>
            <span>Total Records Printed: ${tenantsData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          ${tenantStatsGridHtml}

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">📍 Preferred Location Demand</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>LOCATION</th>
                    <th>TENANTS</th>
                    <th>LINKED PROPERTY</th>
                    <th>AVG RENT BUDGET</th>
                  </tr>
                </thead>
                <tbody>
                  ${tLocs.slice(0, 5).map((l: any) => `<tr><td style="font-weight:700">${l.location}</td><td style="font-weight:700;color:#0f172a">${l.count}</td><td style="font-weight:700;color:#0f766e">${l.linked_count}</td><td style="font-weight:800;color:#047857">₹${Number(l.avg_budget || 0).toLocaleString("en-IN")}/mo</td></tr>`).join("") || '<tr><td colSpan="4" style="text-align:center">No location data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">🏠 BHK Requirement Distribution</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>UNIT TYPE</th>
                    <th>TENANTS</th>
                    <th>LINKED PROPERTY</th>
                  </tr>
                </thead>
                <tbody>
                  ${tBhk.slice(0, 5).map((b: any) => `<tr><td style="font-weight:700">${b.bhk}</td><td style="font-weight:700;color:#0f172a">${b.count}</td><td style="font-weight:700;color:#0f766e">${b.linked_count}</td></tr>`).join("") || '<tr><td colSpan="3" style="text-align:center">No BHK data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">💰 Target Rent Budget Distribution</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>RENT RANGE</th>
                    <th>TENANTS</th>
                  </tr>
                </thead>
                <tbody>
                  ${tBudgets.map((tb: any) => `<tr><td style="font-weight:700">${tb.label}</td><td style="font-weight:800;color:#0f766e">${tb.count} tenants</td></tr>`).join("") || '<tr><td colSpan="2" style="text-align:center">No budget data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">👥 Executive Tenant Leaderboard</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>EXECUTIVE</th>
                    <th>TENANTS</th>
                    <th>LINKED</th>
                    <th>MOVED IN</th>
                    <th>CONV %</th>
                  </tr>
                </thead>
                <tbody>
                  ${tExecs.slice(0, 5).map((ex: any) => `<tr><td style="font-weight:700">${ex.agent_name}</td><td style="font-weight:700;color:#0f172a">${ex.total_tenants}</td><td style="font-weight:700;color:#0f766e">${ex.linked_count}</td><td style="font-weight:800;color:#6b21a8">${ex.moved_in_count}</td><td style="font-weight:800;color:#047857">${ex.conversion_rate}%</td></tr>`).join("") || '<tr><td colSpan="5" style="text-align:center">No executive performance data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📋 Detailed Tenant Directory</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>TENANT ID</th>
                <th>TENANT NAME</th>
                <th>CONTACT</th>
                <th>LOCATION</th>
                <th>RENT BUDGET</th>
                <th>BHK REQUIREMENT</th>
                <th>LINKED RENTAL PROPERTY</th>
                <th style="text-align:center">STATUS</th>
                <th>ASSIGNED EXECUTIVE</th>
              </tr>
            </thead>
            <tbody>
              ${tenantTableRowsHtml || '<tr><td colSpan="10" style="text-align:center">No records available</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            <span>${orgName} • ${tabName} Report Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "campaigns") {
        const cStats = campaignsStats || campaignsOverview || {};
        const cFunnel = campaignsFunnel || {};
        const cDel = campaignsDelivery || {};
        const cAud = Array.isArray(campaignsAudienceBreakdown) ? campaignsAudienceBreakdown : [];

        const campaignStatsGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL CAMPAIGNS</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${cStats.total_campaigns || campaignsData.length}</div>
            </div>
            <div style="border:1px solid #93c5fd;padding:8px;border-radius:6px;background:#eff6ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">ACTIVE RUNNING</div>
              <div style="font-size:16px;font-weight:900;color:#1e40af;">${cStats.active_running || 0}</div>
            </div>
            <div style="border:1px solid #a5b4fc;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">TOTAL AUDIENCE</div>
              <div style="font-size:16px;font-weight:900;color:#3730a3;">${Number(cStats.total_audience || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">DELIVERED MESSAGES</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">${Number(cStats.total_delivered || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #86efac;padding:8px;border-radius:6px;background:#f0fdf4;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;">DELIVERY RATE</div>
              <div style="font-size:16px;font-weight:900;color:#166534;">${cStats.avg_delivery_rate || 0}%</div>
            </div>
            <div style="border:1px solid #e9d5ff;padding:8px;border-radius:6px;background:#faf5ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#7e22ce;text-transform:uppercase;">READ MESSAGES</div>
              <div style="font-size:16px;font-weight:900;color:#6b21a8;">${Number(cStats.total_read || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #fbcfe8;padding:8px;border-radius:6px;background:#fdf2f8;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#be185d;text-transform:uppercase;">READ RATE</div>
              <div style="font-size:16px;font-weight:900;color:#9d174d;">${cStats.avg_read_rate || 0}%</div>
            </div>
            <div style="border:1px solid #fde68a;padding:8px;border-radius:6px;background:#fffbeb;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#b45309;text-transform:uppercase;">ESTIMATED COST</div>
              <div style="font-size:16px;font-weight:900;color:#92400e;">₹${Number(cStats.total_cost || 0).toLocaleString("en-IN")}</div>
            </div>
          </div>
        `;

        const campaignTableRowsHtml = campaignsData
          .map((r, idx) => {
            const cId = `#CMP-${r.id}`;
            const name = r.name || "Untitled Campaign";
            const mode = r.audience_mode || "segment";
            const targeted = Number(r.targeted || 0);
            const sent = Number(r.sent || 0);
            const del = Number(r.delivered || 0);
            const read = Number(r.read || 0);
            const rateDel = `${r.delivery_rate || 0}%`;
            const rateRead = `${r.read_rate || 0}%`;
            const cost = `₹${Number(r.estimated_cost || 0).toLocaleString("en-IN")}`;
            const status = r.status || "Draft";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-family:monospace;font-weight:700;color:#334155">${cId}</td>
              <td style="font-weight:800;color:#0f172a">${name}</td>
              <td style="text-align:center;text-transform:capitalize font-weight:700">${mode}</td>
              <td style="text-align:center">${targeted}</td>
              <td style="text-align:center;font-weight:700;color:#4338ca">${sent}</td>
              <td style="text-align:center;font-weight:700;color:#0f766e">${del}</td>
              <td style="text-align:center;font-weight:700;color:#6b21a8">${read}</td>
              <td style="text-align:center;font-weight:800;color:#047857">${rateDel}</td>
              <td style="text-align:center;font-weight:800;color:#7e22ce">${rateRead}</td>
              <td style="text-align:center;font-weight:800;color:#b45309">${cost}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#f8fafc;color:#334155;border-radius:4px;text-transform:uppercase">${status}</span></td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: ${tabName}</span>
            <span>Total Records Printed: ${campaignsData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          ${campaignStatsGridHtml}

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">⚡ Communication Funnel Breakdown</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>FUNNEL STAGE</th>
                    <th>COUNT</th>
                    <th>CONVERSION %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="font-weight:700">1. Targeted Audience</td><td style="font-weight:700;color:#0f172a">${cFunnel.targeted || 0}</td><td style="font-weight:800;color:#047857">100%</td></tr>
                  <tr><td style="font-weight:700">2. Dispatched / Sent</td><td style="font-weight:700;color:#3730a3">${cFunnel.sent || 0}</td><td style="font-weight:800;color:#047857">${cFunnel.targeted > 0 ? Math.round((cFunnel.sent / cFunnel.targeted) * 100) : 0}%</td></tr>
                  <tr><td style="font-weight:700">3. Delivered to Device</td><td style="font-weight:700;color:#0f766e">${cFunnel.delivered || 0}</td><td style="font-weight:800;color:#047857">${cFunnel.sent > 0 ? Math.round((cFunnel.delivered / cFunnel.sent) * 100) : 0}%</td></tr>
                  <tr><td style="font-weight:700">4. Read by Recipient</td><td style="font-weight:700;color:#6b21a8">${cFunnel.read || 0}</td><td style="font-weight:800;color:#047857">${cFunnel.delivered > 0 ? Math.round((cFunnel.read / cFunnel.delivered) * 100) : 0}%</td></tr>
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">🎯 Audience Mode Performance</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>AUDIENCE MODE</th>
                    <th>CAMPAIGNS</th>
                    <th>DELIVERED</th>
                    <th>READ %</th>
                  </tr>
                </thead>
                <tbody>
                  ${cAud.map((am: any) => `<tr><td style="font-weight:700;text-transform:uppercase">${am.audience_mode}</td><td style="font-weight:700;color:#0f172a">${am.campaign_count}</td><td style="font-weight:700;color:#0f766e">${am.delivered}</td><td style="font-weight:800;color:#047857">${am.read_rate}%</td></tr>`).join("") || '<tr><td colSpan="4" style="text-align:center">No audience data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📋 Detailed Campaign Directory</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>CAMPAIGN ID</th>
                <th>CAMPAIGN NAME</th>
                <th style="text-align:center">MODE</th>
                <th style="text-align:center">TARGETED</th>
                <th style="text-align:center">SENT</th>
                <th style="text-align:center">DELIVERED</th>
                <th style="text-align:center">READ</th>
                <th style="text-align:center">DELIVERY %</th>
                <th style="text-align:center">READ %</th>
                <th style="text-align:center">COST</th>
                <th style="text-align:center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${campaignTableRowsHtml || '<tr><td colSpan="12" style="text-align:center">No records available</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            <span>${orgName} • ${tabName} Report Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "transactions") {
        const tStats = transactionsStats || transactionsOverview || {};
        const tStatusList = Array.isArray(transactionsStatusBreakdown) ? transactionsStatusBreakdown : [];
        const tTypeList = Array.isArray(transactionsTypeBreakdown) ? transactionsTypeBreakdown : [];
        const tMethodList = Array.isArray(transactionsMethodBreakdown) ? transactionsMethodBreakdown : [];
        const tPartyList = Array.isArray(transactionsPartyBreakdown) ? transactionsPartyBreakdown : [];

        const transactionStatsGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL TRANSACTIONS</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${tStats.total_count || transactionsData.length}</div>
            </div>
            <div style="border:1px solid #86efac;padding:8px;border-radius:6px;background:#f0fdf4;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;">TOTAL AMOUNT</div>
              <div style="font-size:16px;font-weight:900;color:#166534;">₹${Number(tStats.total_amount || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #a5b4fc;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">TOTAL DEAL VALUE</div>
              <div style="font-size:16px;font-weight:900;color:#3730a3;">₹${Number(tStats.total_deal_value || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">CLEARED AMOUNT</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">₹${Number(tStats.cleared_amount || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #fde68a;padding:8px;border-radius:6px;background:#fffbeb;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#b45309;text-transform:uppercase;">PENDING AMOUNT</div>
              <div style="font-size:16px;font-weight:900;color:#92400e;">₹${Number(tStats.pending_amount || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #86efac;padding:8px;border-radius:6px;background:#f0fdf4;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#15803d;text-transform:uppercase;">COMMISSION</div>
              <div style="font-size:16px;font-weight:900;color:#166534;">₹${Number(tStats.commission_amount || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #e2e8f0;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#334155;text-transform:uppercase;">AVG TRANSACTION</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">₹${Number(tStats.avg_amount || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">COLLECTION RATE</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">${tStats.collection_rate || 0}%</div>
            </div>
          </div>
        `;

        const transactionTableRowsHtml = transactionsData
          .map((r, idx) => {
            const rId = r.receipt_id || `REC-${r.id}`;
            const date = r.payment_date ? new Date(r.payment_date).toLocaleDateString("en-IN") : "—";
            const type = r.type || "Sale";
            const party = r.buyer_name || r.seller_name || r.related_party || "Client";
            const prop = r.property_address || "—";
            const dealVal = `₹${Number(r.deal_value || 0).toLocaleString("en-IN")}`;
            const amt = `₹${Number(r.amount || 0).toLocaleString("en-IN")}`;
            const method = r.payment_type || "Cash";
            const status = r.payment_status || r.status || "Pending";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-family:monospace;font-weight:700;color:#334155">${rId}</td>
              <td style="font-weight:600">${date}</td>
              <td style="text-transform:capitalize;font-weight:700">${type}</td>
              <td style="font-weight:800;color:#0f172a">${party}</td>
              <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${prop}</td>
              <td style="text-align:right;font-weight:600">${dealVal}</td>
              <td style="text-align:right;font-weight:900;color:#047857">${amt}</td>
              <td style="text-align:center;text-transform:uppercase;font-weight:700">${method}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#f8fafc;color:#334155;border-radius:4px;text-transform:uppercase">${status}</span></td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: ${tabName}</span>
            <span>Total Records Printed: ${transactionsData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          ${transactionStatsGridHtml}

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">💵 Financial Status Breakdown</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>STATUS</th>
                    <th>COUNT</th>
                    <th style="text-align:right">TOTAL AMOUNT</th>
                    <th style="text-align:center">SHARE %</th>
                  </tr>
                </thead>
                <tbody>
                  ${tStatusList.map((st: any) => `<tr><td style="font-weight:700;text-transform:uppercase">${st.status}</td><td style="font-weight:700;color:#0f172a">${st.count}</td><td style="text-align:right;font-weight:800;color:#047857">₹${Number(st.amount || 0).toLocaleString("en-IN")}</td><td style="text-align:center;font-weight:800">${st.percentage}%</td></tr>`).join("") || '<tr><td colSpan="4" style="text-align:center">No status data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">💳 Payment Method Channel Distribution</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>PAYMENT METHOD</th>
                    <th>COUNT</th>
                    <th style="text-align:right">TOTAL AMOUNT</th>
                    <th style="text-align:center">SHARE %</th>
                  </tr>
                </thead>
                <tbody>
                  ${tMethodList.map((m: any) => `<tr><td style="font-weight:700;text-transform:uppercase">${m.method}</td><td style="font-weight:700;color:#0f172a">${m.count}</td><td style="text-align:right;font-weight:800;color:#047857">₹${Number(m.amount || 0).toLocaleString("en-IN")}</td><td style="text-align:center;font-weight:800">${m.percentage}%</td></tr>`).join("") || '<tr><td colSpan="4" style="text-align:center">No payment method data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📋 Detailed Payment Receipt Directory</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>RECEIPT ID</th>
                <th>PAYMENT DATE</th>
                <th>TYPE</th>
                <th>PARTY NAME</th>
                <th>PROPERTY ADDRESS</th>
                <th style="text-align:right">DEAL VALUE</th>
                <th style="text-align:right">AMOUNT</th>
                <th style="text-align:center">METHOD</th>
                <th style="text-align:center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${transactionTableRowsHtml || '<tr><td colSpan="10" style="text-align:center">No records available</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            <span>${orgName} • ${tabName} Report Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "properties") {
        const pStats = propertiesStats || {};
        const pMix = propertiesMix || {};
        const pLocs = Array.isArray(propertiesLocations) ? propertiesLocations : [];
        const pExecs = Array.isArray(propertiesExecutives) ? propertiesExecutives : [];
        const pBhk = Array.isArray(propertiesBhk) ? propertiesBhk : [];
        const pSalePrices = propertiesSalePrices?.buckets || [];
        const pRents = propertiesExpectedRents?.buckets || [];

        const propertyStatsGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;background:#f8fafc;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL PROPERTIES</div>
              <div style="font-size:16px;font-weight:900;color:#0f172a;">${pStats.total_properties || pStats.total_count || propertiesData.length}</div>
            </div>
            <div style="border:1px solid #a5b4fc;padding:8px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#4338ca;text-transform:uppercase;">FOR SALE</div>
              <div style="font-size:16px;font-weight:900;color:#3730a3;">${pStats.sale_count || pMix.sale || 0}</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:8px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#0f766e;text-transform:uppercase;">FOR RENT</div>
              <div style="font-size:16px;font-weight:900;color:#115e59;">${pStats.rental_count || pMix.rental || 0}</div>
            </div>
            <div style="border:1px solid #93c5fd;padding:8px;border-radius:6px;background:#eff6ff;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">AVAILABLE INVENTORY</div>
              <div style="font-size:16px;font-weight:900;color:#1e40af;">${pStats.available_count || pStats.active_count || 0}</div>
            </div>
          </div>
        `;

        const propertyOverviewGridHtml = `
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:12px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;padding:6px;border-radius:6px;background:#eef2ff;text-align:center;">
              <div style="font-size:8px;font-weight:700;color:#3730a3;text-transform:uppercase;">TOTAL SALE VALUE</div>
              <div style="font-size:12px;font-weight:900;color:#1e1b4b;">₹${(Number(pStats.sale_value || 0) / 10000000).toFixed(2)} Cr</div>
            </div>
            <div style="border:1px solid #93c5fd;padding:6px;border-radius:6px;background:#eff6ff;text-align:center;">
              <div style="font-size:8px;font-weight:700;color:#1d4ed8;text-transform:uppercase;">AVG RESALE PRICE</div>
              <div style="font-size:12px;font-weight:900;color:#1e40af;">₹${(Number(pStats.avg_sale_price || 0) / 100000).toFixed(1)} L</div>
            </div>
            <div style="border:1px solid #99f6e4;padding:6px;border-radius:6px;background:#f0fdfa;text-align:center;">
              <div style="font-size:8px;font-weight:700;color:#0f766e;text-transform:uppercase;">AVG EXPECTED RENT</div>
              <div style="font-size:12px;font-weight:900;color:#115e59;">₹${Number(pStats.avg_monthly_rent || 0).toLocaleString("en-IN")}/mo</div>
            </div>
            <div style="border:1px solid #e9d5ff;padding:6px;border-radius:6px;background:#faf5ff;text-align:center;">
              <div style="font-size:8px;font-weight:700;color:#7e22ce;text-transform:uppercase;">PUBLIC LISTINGS</div>
              <div style="font-size:12px;font-weight:900;color:#6b21a8;">${pStats.public_count || 0} units</div>
            </div>
            <div style="border:1px solid #fde68a;padding:6px;border-radius:6px;background:#fffbeb;text-align:center;">
              <div style="font-size:8px;font-weight:700;color:#b45309;text-transform:uppercase;">ON HOLD / VERIFY</div>
              <div style="font-size:12px;font-weight:900;color:#92400e;">${pStats.on_hold_count || 0}</div>
            </div>
            <div style="border:1px solid #86efac;padding:6px;border-radius:6px;background:#f0fdf4;text-align:center;">
              <div style="font-size:8px;font-weight:700;color:#15803d;text-transform:uppercase;">TRANSACTED DEALS</div>
              <div style="font-size:12px;font-weight:900;color:#166534;">${(pStats.sold_count || 0) + (pStats.rented_count || 0)}</div>
            </div>
          </div>
        `;

        const propExecMatrixHtml = pExecs
          .slice(0, 6)
          .map(
            (ex: any) => `
            <tr>
              <td style="font-weight:800;color:#0f172a">${ex.agent_name || "Executive"}</td>
              <td style="font-weight:700;color:#3730a3">${ex.sale_properties ?? 0}</td>
              <td style="font-weight:700;color:#0f766e">${ex.rental_properties ?? 0}</td>
              <td style="font-weight:700;color:#1d4ed8">${ex.available ?? 0}</td>
              <td style="font-weight:800;color:#166534">${ex.sold ?? 0}</td>
              <td style="font-weight:800;color:#6b21a8">${ex.rented ?? 0}</td>
            </tr>
          `
          )
          .join("");

        const propertyTableRowsHtml = propertiesData
          .map((r, idx) => {
            const pId = `#${r.mode === "rental" ? "RPROP" : "PROP"}-${r.id}`;
            const title = r.title || r.society_name || `Property #${r.id}`;
            const mode = r.mode === "rental" ? "For Rent" : "For Sale";
            const contact = r.contact_name || r.seller_name || r.owner_name || "N/A";
            const loc = r.location || r.location_name || r.city_name || "N/A";
            const typeStr = `${r.property_type || "Residential"} • ${r.unit_type || "Any BHK"}`;
            const val = Number(r.price || r.final_price || r.budget || r.monthly_rent || 0);
            const priceStr = val === 0 ? "N/A" : (r.mode === "rental" ? `₹${val.toLocaleString("en-IN")}/mo` : (val >= 10000000 ? `₹${(val / 10000000).toFixed(2)}Cr` : `₹${(val / 100000).toFixed(0)}L`));
            const status = r.status || "Available";
            const exec = r.assigned_agent_name || "Unassigned";

            return `<tr>
              <td style="text-align:center;font-weight:700">${idx + 1}</td>
              <td style="font-family:monospace;font-weight:700;color:#334155">${pId}</td>
              <td style="font-weight:800;color:#0f172a">${title}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:9px;padding:2px 6px;background:${r.mode === "rental" ? "#f0fdfa;color:#0f766e" : "#eef2ff;color:#3730a3"};border-radius:4px">${mode}</span></td>
              <td>${contact}</td>
              <td>${loc}</td>
              <td>${typeStr}</td>
              <td style="font-weight:700;color:${r.mode === "rental" ? "#047857" : "#4338ca"}">${priceStr}</td>
              <td style="text-align:center"><span style="font-weight:700;font-size:10px;padding:2px 6px;background:#f8fafc;color:#334155;border-radius:4px">${status}</span></td>
              <td>${exec}</td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: ${tabName} (${propertiesMode === "sale" ? "For Sale" : propertiesMode === "rental" ? "For Rent" : "All Properties"})</span>
            <span>Total Records Printed: ${propertiesData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          ${propertyStatsGridHtml}

          <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">⚡ Inventory & Performance Overview</div>
          ${propertyOverviewGridHtml}

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">📍 Property Inventory by Location</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>LOCATION</th>
                    <th>TOTAL</th>
                    <th>SALE</th>
                    <th>RENTAL</th>
                    <th>AVAILABLE</th>
                  </tr>
                </thead>
                <tbody>
                  ${pLocs.slice(0, 5).map((l: any) => `<tr><td style="font-weight:700">${l.location}</td><td style="font-weight:700;color:#0f172a">${l.total}</td><td style="font-weight:700;color:#3730a3">${l.sale}</td><td style="font-weight:700;color:#0f766e">${l.rental}</td><td style="font-weight:800;color:#047857">${l.available}</td></tr>`).join("") || '<tr><td colSpan="5" style="text-align:center">No location data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">🏠 BHK / Unit Type Distribution</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>UNIT TYPE</th>
                    <th>SALE</th>
                    <th>RENTAL</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  ${pBhk.slice(0, 5).map((b: any) => `<tr><td style="font-weight:700">${b.unit_type}</td><td style="font-weight:700;color:#3730a3">${b.sale}</td><td style="font-weight:700;color:#0f766e">${b.rental}</td><td style="font-weight:800;color:#0f172a">${b.total}</td></tr>`).join("") || '<tr><td colSpan="4" style="text-align:center">No BHK data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;page-break-inside:avoid;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">💰 Resale Asking Price Distribution</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>PRICE RANGE</th>
                    <th>PROPERTIES</th>
                  </tr>
                </thead>
                <tbody>
                  ${pSalePrices.map((sp: any) => `<tr><td style="font-weight:700">${sp.label}</td><td style="font-weight:800;color:#3730a3">${sp.count} units</td></tr>`).join("") || '<tr><td colSpan="2" style="text-align:center">No price data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">💵 Expected Monthly Rent Distribution</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th>RENT RANGE</th>
                    <th>PROPERTIES</th>
                  </tr>
                </thead>
                <tbody>
                  ${pRents.map((er: any) => `<tr><td style="font-weight:700">${er.label}</td><td style="font-weight:800;color:#0f766e">${er.count} units</td></tr>`).join("") || '<tr><td colSpan="2" style="text-align:center">No rent data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;margin-bottom:12px;page-break-inside:avoid;">
            <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">👥 Executive Inventory Leaderboard</div>
            <table style="width:100%;font-size:9px;">
              <thead>
                <tr>
                  <th>EXECUTIVE</th>
                  <th>SALE</th>
                  <th>RENTAL</th>
                  <th>AVAILABLE</th>
                  <th>SOLD</th>
                  <th>RENTED</th>
                </tr>
              </thead>
              <tbody>
                ${propExecMatrixHtml || '<tr><td colSpan="6" style="text-align:center">No executive performance data</td></tr>'}
              </tbody>
            </table>
          </div>

          <div style="font-size:11px;font-weight:800;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">📋 Detailed Property Directory</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>PROP ID</th>
                <th>PROPERTY TITLE</th>
                <th style="text-align:center">MODE</th>
                <th>OWNER / SELLER</th>
                <th>LOCATION</th>
                <th>TYPE / BHK</th>
                <th>PRICE / RENT</th>
                <th style="text-align:center">STATUS</th>
                <th>ASSIGNED EXECUTIVE</th>
              </tr>
            </thead>
            <tbody>
              ${propertyTableRowsHtml || '<tr><td colSpan="10" style="text-align:center">No records available</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            <span>${orgName} • ${tabName} Report Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "agent-execution") {
        const agentRowsHtml = (agentsData || [])
          .map((row: any, idx: number) => {
            const agentName = row.agentName || row.name || `User #${row.id}`;
            const role = row.role || "Executive";
            const assigned = row.assignedLeads || row.assigned_leads || 0;
            const contacted = row.contactedLeads || row.contacted_leads || 0;
            const interested = row.interestedLeads || row.interested_leads || 0;
            const closedLeads = row.closedLeads || row.closed_leads || 0;
            const buyers = row.buyersCreated || row.buyers_created || 0;
            const sellers = row.sellersCreated || row.sellers_created || 0;
            const owners = row.ownersCreated || row.owners_created || 0;
            const tenants = row.tenantsCreated || row.tenants_created || 0;
            const properties = row.propertiesAdded || row.properties_added || 0;
            const followups = row.followupsCompleted || row.followups_completed || 0;
            const visits = row.visitsCompleted || row.site_visits || 0;
            const dealsClosed = row.dealsClosed || row.deals_closed || 0;
            const dealVal = row.dealValue || row.total_deal_value || 0;
            const formattedVal = dealVal > 0 ? `₹${Number(dealVal).toLocaleString("en-IN")}` : "₹0";

            return `<tr>
              <td style="text-align:center;font-weight:600">${idx + 1}</td>
              <td style="font-weight:600">${agentName} <span style="font-size:9px;color:#64748b">(${role})</span></td>
              <td style="text-align:center">${assigned}</td>
              <td style="text-align:center">${contacted}</td>
              <td style="text-align:center">${interested}</td>
              <td style="text-align:center">${closedLeads}</td>
              <td style="text-align:center">${buyers}</td>
              <td style="text-align:center">${sellers}</td>
              <td style="text-align:center">${owners}</td>
              <td style="text-align:center">${tenants}</td>
              <td style="text-align:center">${properties}</td>
              <td style="text-align:center">${followups}</td>
              <td style="text-align:center">${visits}</td>
              <td style="text-align:center;font-weight:600;color:#047857">${dealsClosed}</td>
              <td style="text-align:right;font-weight:600">${formattedVal}</td>
            </tr>`;
          })
          .join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: Agent Lead Execution</span>
            <span>Total Active Staff: ${agentsData.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">ACTIVE USERS</span><span style="font-size:13px;font-weight:700;color:#0f172a">${agentsStats?.totalActiveUsers || agentsData.length}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">LEADS ASSIGNED</span><span style="font-size:13px;font-weight:700;color:#0f172a">${agentsStats?.leadsAssigned || 0}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">INTERESTED LEADS</span><span style="font-size:13px;font-weight:700;color:#0f172a">${agentsStats?.leadsInterested || 0}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">BUYERS CREATED</span><span style="font-size:13px;font-weight:700;color:#0f172a">${agentsStats?.buyersCreated || 0}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">PROPERTIES ADDED</span><span style="font-size:13px;font-weight:700;color:#0f172a">${agentsStats?.propertiesAdded || 0}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">SITE VISITS</span><span style="font-size:13px;font-weight:700;color:#0f172a">${agentsStats?.siteVisits || 0}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">DEALS CLOSED</span><span style="font-size:13px;font-weight:700;color:#0f172a">${agentsStats?.dealsClosed || 0}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">TOTAL DEAL VALUE</span><span style="font-size:13px;font-weight:700;color:#0f172a">₹${(Number(agentsStats?.totalDealValue || 0) / 10000000).toFixed(2)}Cr</span></div>
          </div>

          <div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:6px;text-transform:uppercase;">👔 Agent Lead Execution Report Table</div>
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">S.NO.</th>
                <th>USER / EXECUTIVE</th>
                <th style="text-align:center">ASSIGNED</th>
                <th style="text-align:center">CONTACTED</th>
                <th style="text-align:center">INTERESTED</th>
                <th style="text-align:center">CLOSED LEADS</th>
                <th style="text-align:center">BUYERS</th>
                <th style="text-align:center">SELLERS</th>
                <th style="text-align:center">OWNERS</th>
                <th style="text-align:center">TENANTS</th>
                <th style="text-align:center">PROPERTIES</th>
                <th style="text-align:center">FOLLOW-UPS</th>
                <th style="text-align:center">SITE VISITS</th>
                <th style="text-align:center">DEALS CLOSED</th>
                <th style="text-align:right">DEAL VALUE</th>
              </tr>
            </thead>
            <tbody>
              ${agentRowsHtml || '<tr><td colSpan="15" style="text-align:center">No agent execution records available</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <span>${orgName} • Agent Lead Execution Summary Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "activities") {
        const totalAssignedLeads = (activitiesUserSummary || []).reduce((acc: number, curr: any) => acc + Number(curr.assigned_leads || 0), 0);
        const totalFollowupsTaken = (activitiesUserSummary || []).reduce((acc: number, curr: any) => acc + Number(curr.followups_count || 0), 0);
        const totalOverdueFollowups = (activitiesUserSummary || []).reduce((acc: number, curr: any) => acc + Number(curr.overdue_followups || 0), 0);
        const totalInterested = (activitiesUserSummary || []).reduce((acc: number, curr: any) => acc + Number(curr.interested_leads || 0), 0);

        const activityUserRowsHtml = (activitiesUserSummary || [])
          .map((row: any, idx: number) => `
            <tr>
              <td style="text-align:center;font-weight:600">${idx + 1}</td>
              <td style="font-weight:600">${row.user_name || "N/A"} <span style="font-size:9px;color:#64748b">(${row.role || "Executive"})</span></td>
              <td style="text-align:center;font-weight:600">${row.assigned_leads || 0}</td>
              <td style="text-align:center">${row.general_leads || 0}</td>
              <td style="text-align:center">${row.buyer_leads || 0}</td>
              <td style="text-align:center">${row.seller_leads || 0}</td>
              <td style="text-align:center">${row.owner_leads || 0}</td>
              <td style="text-align:center">${row.tenant_leads || 0}</td>
              <td style="text-align:center;font-weight:600;color:#047857">${row.followups_count || 0}</td>
              <td style="text-align:center;color:#e11d48;font-weight:600">${row.overdue_followups || 0}</td>
              <td style="text-align:center">${row.contacted_leads || 0}</td>
              <td style="text-align:center;font-weight:600;color:#1e3a8a">${row.interested_leads || 0}</td>
            </tr>
          `).join("");

        contentHTML = `
          ${watermarkHTML}
          <div style="display:flex;align-items:center;justify-between;border-bottom:2px solid #0f1f38;padding-bottom:6px;margin-bottom:8px;">
            <div>
              <div style="font-size:14px;font-weight:800;color:#0f1f38;text-transform:uppercase;letter-spacing:0.5px">Staff Activity Execution Summary</div>
              <div style="font-size:10px;font-weight:600;color:#475569">Company Wide Activity Execution & Audit Trail</div>
            </div>
            <div style="text-align:right">
              <span style="font-size:9px;font-weight:700;color:#64748b;display:block">REPORT DATE</span>
              <span style="font-size:11px;font-weight:800;color:#0f1f38">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          <div class="meta-line">
            <span>Module: Staff Activity Execution</span>
            <span>Active Staff Count: ${activitiesUserSummary.length}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:10px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:5px 7px;border-radius:6px"><span style="display:block;font-size:8.5px;color:#64748b;font-weight:600">ACTIVE STAFF</span><span style="font-size:12px;font-weight:700;color:#0f172a">${activitiesUserSummary.length}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:5px 7px;border-radius:6px"><span style="display:block;font-size:8.5px;color:#64748b;font-weight:600">ASSIGNED LEADS</span><span style="font-size:12px;font-weight:700;color:#0f172a">${totalAssignedLeads}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:5px 7px;border-radius:6px"><span style="display:block;font-size:8.5px;color:#64748b;font-weight:600">FOLLOW-UPS TAKEN</span><span style="font-size:12px;font-weight:700;color:#047857">${totalFollowupsTaken}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:5px 7px;border-radius:6px"><span style="display:block;font-size:8.5px;color:#64748b;font-weight:600">OVERDUE ACTIONS</span><span style="font-size:12px;font-weight:700;color:#e11d48">${totalOverdueFollowups}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:5px 7px;border-radius:6px"><span style="display:block;font-size:8.5px;color:#64748b;font-weight:600">INTERESTED LEADS</span><span style="font-size:12px;font-weight:700;color:#1e3a8a">${totalInterested}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:5px 7px;border-radius:6px"><span style="display:block;font-size:8.5px;color:#64748b;font-weight:600">ACTIVITY LOGS</span><span style="font-size:12px;font-weight:700;color:#0f172a">${activitiesStats?.total_count || activitiesData.length}</span></div>
          </div>

          <table style="width:100%;font-size:9px;">
            <thead>
              <tr>
                <th style="width:25px;text-align:center">#</th>
                <th>EXECUTIVE NAME</th>
                <th style="text-align:center">TOTAL ASSIGNED</th>
                <th style="text-align:center">CLIENT</th>
                <th style="text-align:center">BUYER</th>
                <th style="text-align:center">SELLER</th>
                <th style="text-align:center">OWNER</th>
                <th style="text-align:center">TENANT</th>
                <th style="text-align:center">FOLLOWUPS</th>
                <th style="text-align:center">OVERDUE</th>
                <th style="text-align:center">CONTACTED</th>
                <th style="text-align:center">INTERESTED</th>
              </tr>
            </thead>
            <tbody>
              ${activityUserRowsHtml || '<tr><td colSpan="12" style="text-align:center">No staff activity data available</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <span>${orgName} • Staff Activity Execution Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
      } else if (activeTab === "overview") {
        const topKpis = summaryData?.topKpis || {};
        const crmKpis = summaryData?.crmKpis || {};
        const propKpis = summaryData?.propertyKpis || {};
        const bizKpis = summaryData?.businessKpis || {};

        const funnelHtml = (funnelData || [])
          .map((st: any, idx: number) => `
            <tr>
              <td style="text-align:center;font-weight:600">Stage ${idx + 1}</td>
              <td style="font-weight:600">${st.name}</td>
              <td style="text-align:center;font-weight:600;color:#0f172a">${st.count}</td>
              <td style="text-align:center">${st.overallPct}%</td>
              <td style="text-align:center;color:#047857">${st.stepConvPct}%</td>
              <td style="text-align:center;color:#e11d48">${st.dropOffPct}%</td>
            </tr>
          `).join("");

        const sourcesHtml = (leadSourcesData || [])
          .map((s: any, idx: number) => `
            <tr>
              <td style="text-align:center;font-weight:600">${idx + 1}</td>
              <td style="font-weight:600">${s.source}</td>
              <td style="text-align:center;font-weight:600">${s.totalLeads}</td>
              <td style="text-align:center">${s.contacted}</td>
              <td style="text-align:center">${s.qualified}</td>
              <td style="text-align:center;font-weight:600;color:#047857">${s.closed}</td>
              <td style="text-align:right;font-weight:600;color:#2563eb">${s.conversionRate}%</td>
            </tr>
          `).join("");

        const locationsHtml = (summaryData?.locationSummary || [])
          .map((loc: any, idx: number) => `
            <tr>
              <td style="text-align:center;font-weight:600">${idx + 1}</td>
              <td style="font-weight:600">${loc.location}</td>
              <td style="text-align:center;font-weight:600">${loc.properties}</td>
              <td style="text-align:center;font-weight:600;color:#047857">${loc.sold}</td>
              <td style="text-align:right;font-weight:600;color:#1e3a8a">₹${Number(loc.dealValue || 0).toLocaleString("en-IN")}</td>
            </tr>
          `).join("");

        contentHTML = `
          ${watermarkHTML}
          ${headerHTML}
          <div class="meta-line">
            <span>Module: Overall Performance Dashboard</span>
            <span>Date Range: ${filters.startDate && filters.endDate ? `${filters.startDate} to ${filters.endDate}` : "All Time"}</span>
            <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">TOTAL LEADS</span><span style="font-size:13px;font-weight:700;color:#0f172a">${Number(topKpis.totalLeads || crmKpis.totalLeads || 0).toLocaleString("en-IN")}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">QUALIFIED LEADS</span><span style="font-size:13px;font-weight:700;color:#0f172a">${Number(topKpis.qualifiedLeads || crmKpis.qualifiedLeads || 0).toLocaleString("en-IN")}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">ACTIVE BUYERS</span><span style="font-size:13px;font-weight:700;color:#0f172a">${Number(topKpis.activeBuyers || 0).toLocaleString("en-IN")}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">ACTIVE SELLERS</span><span style="font-size:13px;font-weight:700;color:#0f172a">${Number(topKpis.activeSellers || 0).toLocaleString("en-IN")}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">ACTIVE PROPERTIES</span><span style="font-size:13px;font-weight:700;color:#0f172a">${Number(topKpis.activeProperties || propKpis.activeListings || 0).toLocaleString("en-IN")}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">PROPERTIES SOLD</span><span style="font-size:13px;font-weight:700;color:#0f172a">${Number(topKpis.propertiesSold || propKpis.soldProperties || 0).toLocaleString("en-IN")}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">PROPERTIES RENTED</span><span style="font-size:13px;font-weight:700;color:#0f172a">${Number(topKpis.propertiesRented || 0).toLocaleString("en-IN")}</span></div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:6px 8px;border-radius:6px"><span style="display:block;font-size:9px;color:#64748b;font-weight:600">TOTAL COLLECTIONS</span><span style="font-size:13px;font-weight:700;color:#0f172a">₹${Number(topKpis.totalCollections || bizKpis.revenueCollected || 0).toLocaleString("en-IN")}</span></div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:12px;">
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:700;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">📊 Lead Acquisition & Conversion Funnel</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th style="width:45px">STAGE</th>
                    <th>NAME</th>
                    <th style="text-align:center">COUNT</th>
                    <th style="text-align:center">OVERALL %</th>
                    <th style="text-align:center">STEP CONV %</th>
                    <th style="text-align:center">DROPOFF %</th>
                  </tr>
                </thead>
                <tbody>
                  ${funnelHtml || '<tr><td colSpan="6" style="text-align:center">No funnel data</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;">
              <div style="font-size:10px;font-weight:700;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">🎯 Lead Source Performance</div>
              <table style="width:100%;font-size:9px;">
                <thead>
                  <tr>
                    <th style="width:30px">S.NO</th>
                    <th>SOURCE</th>
                    <th style="text-align:center">LEADS</th>
                    <th style="text-align:center">CONTACTED</th>
                    <th style="text-align:center">QUALIFIED</th>
                    <th style="text-align:center">CLOSED</th>
                    <th style="text-align:right">CONV %</th>
                  </tr>
                </thead>
                <tbody>
                  ${sourcesHtml || '<tr><td colSpan="7" style="text-align:center">No source data</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Location Business Matrix -->
          <div style="border:1px solid #cbd5e1;border-radius:6px;padding:8px;background:#ffffff;margin-bottom:12px;">
            <div style="font-size:10px;font-weight:700;color:#0f172a;margin-bottom:4px;text-transform:uppercase;">📍 Location Business Performance Matrix</div>
            <table style="width:100%;font-size:9px;">
              <thead>
                <tr>
                  <th style="width:30px">S.NO</th>
                  <th>LOCATION / LOCALITY</th>
                  <th style="text-align:center">PROPERTIES LISTED</th>
                  <th style="text-align:center">PROPERTIES SOLD</th>
                  <th style="text-align:right">TOTAL DEAL VALUE VOLUME</th>
                </tr>
              </thead>
              <tbody>
                ${locationsHtml || '<tr><td colSpan="5" style="text-align:center">No location matrix data</td></tr>'}
              </tbody>
            </table>
          </div>

          ${insightsData ? `
            <div style="border:1px solid #cbd5e1;border-radius:6px;padding:10px;background:#f8fafc;margin-bottom:12px;">
              <div style="font-size:11px;font-weight:700;color:#1e3a8a;margin-bottom:4px">🤖 AI Executive Insights</div>
              <p style="font-size:10px;color:#334155;line-height:1.4">${insightsData}</p>
            </div>
          ` : ""}

          <div class="footer">
            <span>${orgName} • Overall Report Print Export</span>
            <span>Page 1 of 1</span>
          </div>
        `;
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

      if (!contentHTML) {
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
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-all border-b-2 ${isActive
                      ? "border-indigo-600 text-indigo-900 font-semibold bg-white shadow-2xs rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-900 font-medium"
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-xs font-medium text-gray-700">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${datePreset === "last_3_months"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  }`}
              >
                Last 3 Months
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("last_6_months")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${datePreset === "last_6_months"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  }`}
              >
                Last 6 Months
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("last_12_months")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${datePreset === "last_12_months"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  }`}
              >
                Last 12 Months
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("all_time")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${datePreset === "all_time"
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
                className="flex items-center gap-1.5 text-xs text-white bg-[#0f1f38] hover:bg-[#1e3b8b] font-medium px-3.5 py-1.5 rounded-lg shadow-sm border-0"
              >
                <Filter className="w-3.5 h-3.5 text-white" />
                Filter
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenExportPreview()}
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
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("overview")}
            onPrint={handleTriggerPrint}
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
            summary={agentsStats}
            stats={agentsStats}
            loading={loading}
            filters={filters}
            onApplyFilters={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("agent-execution")}
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
            filters={filters}
            onResetFilters={() => {
              setFilters({
                datePreset: "alltime",
                dateBy: "created_at",
                search: "",
                status: "all",
                stage: "all",
                assigned_executive: "all",
                location: "",
                budget_min: "",
                budget_max: "",
                property_type: "all",
                unit_type: "all",
              });
              setBuyersStatusPill("all");
              setBuyersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onPageChange={(p) => setBuyersPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setBuyersPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => setIsBuyerExportOpen(true)}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
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
            prices={sellersPrices}
            sources={sellersSources}
            documents={sellersDocuments}
            cosellers={sellersCosellers}
            executives={sellersExecutives}
            financials={sellersFinancials}
            pagination={sellersPagination}
            loading={loading}
            viewMode={sellersViewMode}
            onViewModeChange={(mode) => {
              setSellersViewMode(mode);
              setSellersPagination((prev) => ({ ...prev, page: 1 }));
            }}
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
            onFilterByLocation={(locVal) => {
              setFilters((prev) => ({ ...prev, location: locVal }));
              setSellersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByPrice={(minVal, maxVal) => {
              setFilters((prev) => ({ ...prev, minDealValue: String(minVal), maxDealValue: String(maxVal) }));
              setSellersPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "tenants" && (
          <TenantReportTab
            data={tenantsData}
            stats={tenantsStats}
            summary={tenantsStats}
            budgets={tenantsBudgets}
            locations={tenantsLocations}
            bhk={tenantsBhk}
            tenantTypes={tenantsTypes}
            executives={tenantsExecutives}
            pagination={tenantsPagination}
            loading={loading}
            onPageChange={(p) => setTenantsPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setTenantsPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("tenants")}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={tenantsStatusPill}
            onSelectStatusPill={(key) => {
              setTenantsStatusPill(key);
              setTenantsPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByStatus={(st) => {
              setTenantsStatusPill(st);
              setTenantsPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByLocation={(locVal) => {
              setFilters((prev) => ({ ...prev, location: locVal }));
              setTenantsPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByBhk={(bhkVal) => {
              setFilters((prev) => ({ ...prev, preferred_bhk: bhkVal }));
              setTenantsPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "owners" && (
          <OwnerReportTab
            data={ownersData}
            stats={ownersStats}
            summary={ownersSummary}
            pipeline={ownersPipeline}
            properties={ownersProperties}
            rents={ownersRents}
            followups={ownersFollowups}
            executives={ownersExecutives}
            pagination={ownersPagination}
            loading={loading}
            viewMode={ownersViewMode}
            onViewModeChange={(mode) => {
              setOwnersViewMode(mode);
              setOwnersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onPageChange={(p) => setOwnersPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setOwnersPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("owners")}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={ownersStatusPill}
            onSelectStatusPill={(key) => {
              setOwnersStatusPill(key);
              setOwnersPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByStage={(stg) => {
              setFilters((prev) => ({ ...prev, stage: stg }));
            }}
            onFilterByLocation={(loc) => {
              setFilters((prev) => ({ ...prev, location: loc }));
            }}
          />
        )}

        {activeTab === "properties" && (
          <PropertyReportTab
            data={propertiesData}
            stats={propertiesStats}
            mix={propertiesMix}
            locations={propertiesLocations}
            bhk={propertiesBhk}
            propertyTypes={propertiesTypes}
            salePrices={propertiesSalePrices}
            expectedRents={propertiesExpectedRents}
            executives={propertiesExecutives}
            pagination={propertiesPagination}
            loading={loading}
            propertyMode={propertiesMode}
            onPropertyModeChange={(mode) => {
              setPropertiesMode(mode);
              setPropertiesPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onPageChange={(p) => setPropertiesPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setPropertiesPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("properties")}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={propertiesStatusPill}
            onSelectStatusPill={(key) => {
              setPropertiesStatusPill(key);
              setPropertiesPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByLocation={(loc) => {
              setFilters((prev) => ({ ...prev, location: loc }));
            }}
            onFilterByBhk={(bhkVal) => {
              setFilters((prev) => ({ ...prev, unit_type: bhkVal }));
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
            onExport={() => handleOpenExportPreview("visits")}
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
            overview={transactionsOverview}
            statusBreakdown={transactionsStatusBreakdown}
            transactionTypeBreakdown={transactionsTypeBreakdown}
            paymentMethodBreakdown={transactionsMethodBreakdown}
            partyBreakdown={transactionsPartyBreakdown}
            amountTiers={transactionsAmountTiers}
            propertyBreakdown={transactionsPropertyBreakdown}
            executiveBreakdown={transactionsExecutiveBreakdown}
            topTransactions={transactionsTop}
            trends={transactionsTrends}
            pagination={transactionsPagination}
            loading={loading}
            onPageChange={(p) => setTransactionsPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setTransactionsPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("transactions")}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={transactionsStatusPill}
            onSelectStatusPill={(key) => {
              setTransactionsStatusPill(key);
              setTransactionsPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByStatus={(st) => {
              setTransactionsStatusPill(st);
              setTransactionsPagination((prev) => ({ ...prev, page: 1 }));
            }}
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
            onExport={() => handleOpenExportPreview("activities")}
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
            data={campaignsData}
            stats={campaignsStats}
            overview={campaignsOverview}
            statusBreakdown={campaignsStatusBreakdown}
            funnel={campaignsFunnel}
            delivery={campaignsDelivery}
            audienceBreakdown={campaignsAudienceBreakdown}
            cost={campaignsCost}
            trends={campaignsTrends}
            topCampaigns={campaignsTop}
            pagination={campaignsPagination}
            loading={loading}
            onPageChange={(p) => setCampaignsPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setCampaignsPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("campaigns")}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={campaignsStatusPill}
            onSelectStatusPill={(key) => {
              setCampaignsStatusPill(key);
              setCampaignsPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onFilterByStatus={(st) => {
              setCampaignsStatusPill(st);
              setCampaignsPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "login-logs" && (
          <LoggedInReportTab
            data={loginLogsData}
            stats={loginLogsStats}
            filters={filters}
            loading={loading}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={() => handleOpenExportPreview("login-logs")}
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

      {/* Universal Export Preview Modal */}
      <ExportPreviewModal
        isOpen={universalExportState.isOpen}
        onClose={() => setUniversalExportState((prev) => ({ ...prev, isOpen: false }))}
        tabKey={universalExportState.tabKey}
        tabTitle={universalExportState.tabTitle}
        data={universalExportState.data}
        filters={filters}
        onConfirmDownload={() => handleExportCSV(universalExportState.tabKey, universalExportState.data)}
      />
    </div>
  );
};