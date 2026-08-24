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
import { AgentLeadExecutionReportTab } from "./AgentLeadExecutionReportTab";
import { BuyerReportTab } from "./BuyerReportTab";
import { SellerReportTab } from "./SellerReportTab";
import { TenantReportTab } from "./TenantReportTab";
import { OwnerReportTab } from "./OwnerReportTab";
import { PropertyReportTab } from "./PropertyReportTab";
import { PropertyVisitReportTab } from "./PropertyVisitReportTab";
import { TransactionReportTab } from "./TransactionReportTab";
import { ActivityReportTab } from "./ActivityReportTab";
import { CommunicationReportTab } from "./CommunicationReportTab";
import { CampaignReportTab } from "./CampaignReportTab";

export const REPORT_TABS = [
  { id: "overview", label: "Overall Report", icon: BarChart3 },
  { id: "leads", label: "Leads Report", icon: Users },
  { id: "agent-execution", label: "Agent Lead Execution", icon: UserCheck },
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
  const [leadsPagination, setLeadsPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [leadsStatusPill, setLeadsStatusPill] = useState<string>("all");

  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [agentsStats, setAgentsStats] = useState<any>(null);

  const [buyersData, setBuyersData] = useState<any[]>([]);
  const [buyersStats, setBuyersStats] = useState<any>(null);
  const [buyersPagination, setBuyersPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [buyersStatusPill, setBuyersStatusPill] = useState<string>("all");

  const [sellersData, setSellersData] = useState<any[]>([]);
  const [sellersStats, setSellersStats] = useState<any>(null);
  const [sellersPagination, setSellersPagination] = useState({ page: 1, limit: 25, totalRecords: 0, totalPages: 1 });
  const [sellersStatusPill, setSellersStatusPill] = useState<string>("all");

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
        if (res?.pagination) setLeadsPagination(res.pagination);
      } else if (activeTab === "agent-execution") {
        const res = await reportAPI.getAgentLeadExecutionReport(filters);
        if (res?.agents) setAgentsData(res.agents);
        if (res?.stats) setAgentsStats(res.stats);
      } else if (activeTab === "buyers") {
        const res = await reportAPI.getBuyerReport({ ...filters, status: buyersStatusPill, page: buyersPagination.page, limit: buyersPagination.limit });
        if (res?.data) setBuyersData(res.data);
        if (res?.stats) setBuyersStats(res.stats);
        if (res?.pagination) setBuyersPagination(res.pagination);
      } else if (activeTab === "sellers") {
        const res = await reportAPI.getSellerReport({ ...filters, status: sellersStatusPill, page: sellersPagination.page, limit: sellersPagination.limit });
        if (res?.data) setSellersData(res.data);
        if (res?.stats) setSellersStats(res.stats);
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
    const filename = `report_${activeTab}_${Date.now()}.csv`;
    try {
      let activeDataset: any[] = [];
      let csvHeader = "";

      if (activeTab === "leads") {
        activeDataset = leadsData;
        csvHeader = "S.NO,NAME,PHONE,EMAIL,TYPE,SOURCE,PRIORITY,STATUS,CITY,LOCATION,ASSIGNED AGENT\n";
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
        const blobData = await reportAPI.exportReportCSV(activeTab, filters);
        const url = URL.createObjectURL(blobData);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      let csv = csvHeader;
      activeDataset.forEach((r, idx) => {
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
      try {
        const blobData = await reportAPI.exportReportCSV(activeTab, filters);
        const url = URL.createObjectURL(blobData);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Server export error:", err);
      }
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
      let chartSvgHtml = "";
      const chartElements = document.querySelectorAll(".recharts-responsive-container");
      chartElements.forEach((el, index) => {
        chartSvgHtml += `<div class="chart-section" style="page-break-inside:avoid;margin-bottom:20px;">
          <div class="chart-title">Analytics Chart #${index + 1}</div>
          ${el.outerHTML}
        </div>`;
      });

      const insightsListHtml = insightsData.length > 0
        ? insightsData.map((ins) => `<li style="margin-bottom:6px;line-height:1.4;">${ins}</li>`).join("")
        : `<li>All sales, listings, and revenue metrics are performing within normal operational boundaries.</li>`;

      contentHTML = `
        ${headerHTML}
        <div class="meta-line">
          <span>Scope: All Records</span>
          <span>Period: All-Time</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>
        <div class="stats-grid">
          <div class="stat-box"><span class="stat-lbl">TOTAL LEADS</span><span class="stat-val">${summaryData?.crmKpis?.totalLeads || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">ACTIVE LISTINGS</span><span class="stat-val">${summaryData?.propertyKpis?.activeListings || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">CONVERTED DEALS</span><span class="stat-val">${summaryData?.crmKpis?.convertedLeads || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">REVENUE COLLECTED</span><span class="stat-val">₹${Number(summaryData?.businessKpis?.revenueCollected || 0).toLocaleString("en-IN")}</span></div>
        </div>
        <div class="insights-box" style="margin:20px 0;padding:15px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;page-break-inside:avoid;">
          <h3 style="margin:0 0 10px 0;color:#0369a1;font-size:13px;font-weight:800;letter-spacing:0.5px;">🤖 AI BUSINESS INTELLIGENCE INSIGHTS</h3>
          <ul style="margin:0;padding-left:20px;color:#0c4a6e;font-size:11px;">
            ${insightsListHtml}
          </ul>
        </div>
        ${chartSvgHtml}
        ${watermarkHTML}
        <div class="footer">
          <span>${orgName} Confidential BI Report</span>
          <span>System Generated</span>
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
      } else if (activeTab === "sellers") {
        activeDataset = sellersData;
        activeStats = sellersStats;
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
      }

      if (activeDataset.length === 0) {
        tableRows = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#94a3b8">No records available for print.</td></tr>`;
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
        ${headerHTML}
        <div class="meta-line">
          <span>Module: ${tabName}</span>
          <span>Records Count: ${activeDataset.length}</span>
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
        </div>
        <div class="stats-grid">
          <div class="stat-box"><span class="stat-lbl">TOTAL RECORDS</span><span class="stat-val">${activeStats?.total_count || activeStats?.total_campaigns || activeDataset.length}</span></div>
          <div class="stat-box"><span class="stat-lbl">ACTIVE / QUALIFIED</span><span class="stat-val">${activeStats?.active_count || activeStats?.qualified_count || activeStats?.total_assigned_leads || activeStats?.total_audience || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">CLOSED / CONVERTED</span><span class="stat-val">${activeStats?.closed_count || activeStats?.sold_count || activeStats?.converted_count || 0}</span></div>
          <div class="stat-box"><span class="stat-lbl">TOTAL VALUE / COMPLETED</span><span class="stat-val">${activeStats?.total_amount ? `₹${Number(activeStats.total_amount).toLocaleString("en-IN")}` : activeStats?.completed_count || "N/A"}</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:40px;text-align:center">S.NO.</th>
              <th>NAME / TITLE</th>
              <th>CONTACT</th>
              <th>LOCATION</th>
              <th>AMOUNT / VALUE</th>
              <th>STATUS</th>
              <th>ASSIGNED TO</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        ${watermarkHTML}
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
    <div className="space-y-5 p-4 sm:p-6 bg-slate-50 min-h-screen">
    

      {/* Top Header Summary Chips */}
      <TabTopStatsHeader
        activeTab={activeTab}
        summaryData={summaryData}
        leadsStats={leadsStats}
        buyersStats={buyersStats}
        sellersStats={sellersStats}
        tenantsStats={tenantsStats}
        ownersStats={ownersStats}
        propertiesStats={propertiesStats}
        visitsStats={visitsStats}
        transactionsStats={transactionsStats}
        activitiesStats={activitiesStats}
        commSummary={commSummary}
        campaignsStats={campaignsStats}
        agentsStats={agentsStats}
      />

      {/* Nav Tabs Bar with Unique Bottom Underline Active Indicator matching 2nd Screenshot */}
      <div className="bg-transparent border-b border-gray-300 py-1 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-all border-b-2 ${
                  isActive
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

      {/* SPECIAL HORIZONTAL DATE QUICK-FILTER BAR FOR OVERALL TAB ONLY (2nd Screenshot) */}
      {activeTab === "overview" && (
        <div className="bg-white p-3 rounded-xl border border-gray-300 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {filters.startDate && filters.endDate
                  ? `${filters.startDate} to ${filters.endDate}`
                  : "01/Aug/2026 to 31/Aug/2026"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleApplyPreset("last_3_months")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                datePreset === "last_3_months"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
              }`}
            >
              Last 3 Months
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("last_6_months")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                datePreset === "last_6_months"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
              }`}
            >
              Last 6 Months
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("last_12_months")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                datePreset === "last_12_months"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
              }`}
            >
              Last 12 Months
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("all_time")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                datePreset === "all_time"
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
            onDrilldown={handleTabChange}
            onRefreshInsights={handleRefreshInsights}
          />
        )}

        {activeTab === "leads" && (
          <LeadReportTab
            data={leadsData}
            stats={leadsStats}
            pagination={leadsPagination}
            loading={loading}
            onPageChange={(p) => setLeadsPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setLeadsPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={leadsStatusPill}
            onSelectStatusPill={(key) => {
              setLeadsStatusPill(key);
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
            pagination={buyersPagination}
            loading={loading}
            onPageChange={(p) => setBuyersPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setBuyersPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={buyersStatusPill}
            onSelectStatusPill={(key) => {
              setBuyersStatusPill(key);
              setBuyersPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />
        )}

        {activeTab === "sellers" && (
          <SellerReportTab
            data={sellersData}
            stats={sellersStats}
            pagination={sellersPagination}
            loading={loading}
            onPageChange={(p) => setSellersPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setSellersPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExportCSV}
            onRefresh={fetchReportData}
            onPrint={handleTriggerPrint}
            activeStatusPill={sellersStatusPill}
            onSelectStatusPill={(key) => {
              setSellersStatusPill(key);
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
    </div>
  );
};
