// frontend/src/components/reports/CampaignReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import Button from "@/components/ui/Button";
import {
  Send,
  Filter,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Eye,
  Award,
  Sparkles,
  TrendingUp,
  XCircle,
  AlertTriangle,
  Users,
  IndianRupee,
  Activity,
  Layers,
  BarChart3,
  X,
  Play,
  Pause,
  MessageSquare,
  Zap,
} from "lucide-react";

interface CampaignReportTabProps {
  data: any[];
  stats?: any;
  overview?: any;
  statusBreakdown?: any[];
  funnel?: any;
  delivery?: any;
  audienceBreakdown?: any[];
  cost?: any;
  trends?: any[];
  topCampaigns?: any;
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  activeStatusPill?: string;
  onSelectStatusPill?: (key: string) => void;
  onFilterByStatus?: (status: string) => void;
}

export const CampaignReportTab: React.FC<CampaignReportTabProps> = ({
  data = [],
  stats = {},
  overview = {},
  statusBreakdown = [],
  funnel = {},
  delivery = {},
  audienceBreakdown = [],
  cost = {},
  trends = [],
  topCampaigns = {},
  pagination,
  loading = false,
  onPageChange,
  onLimitChange,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
  activeStatusPill = "all",
  onSelectStatusPill,
  onFilterByStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "performance" | "audience" | "delivery" | "details">("overview");
  const [selectedCampaignDrawer, setSelectedCampaignDrawer] = useState<any | null>(null);

  const safeStats = stats || overview || {};
  const safeFunnel = funnel || {};
  const safeDelivery = delivery || {};
  const safeCost = cost || {};
  const safeTop = topCampaigns || {};
  const safeStatusList = Array.isArray(statusBreakdown) ? statusBreakdown : [];
  const safeAudienceList = Array.isArray(audienceBreakdown) ? audienceBreakdown : [];
  const safeFailures = Array.isArray(safeDelivery.failure_reasons) ? safeDelivery.failure_reasons : [];

  const statusPills: StatusPill[] = [
    { label: "All Campaigns", key: "all", count: safeStats.total_campaigns || data.length },
    { label: "Running", key: "running", count: safeStats.active_running || 0 },
    { label: "Completed", key: "completed", count: safeStats.completed_campaigns || 0 },
    { label: "Scheduled", key: "scheduled", count: safeStats.scheduled_count || 0 },
    { label: "Draft", key: "draft", count: safeStats.draft_count || 0 },
    { label: "Failed", key: "failed", count: safeStats.total_failed || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "id",
      header: "CAMPAIGN ID",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          #CMP-{row.id}
        </span>
      ),
    },
    {
      key: "name",
      header: "CAMPAIGN NAME",
      searchPlaceholder: "Search campaign...",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.name || "Untitled Campaign"}</div>
          <div className="text-[11px] text-teal-700 font-medium">{row.template_name || "Standard Template"} • {row.template_category || "MARKETING"}</div>
        </div>
      ),
    },
    {
      key: "audience_mode",
      header: "AUDIENCE MODE",
      render: (row) => (
        <span className="capitalize font-semibold text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.audience_mode || "Segment"}
        </span>
      ),
    },
    {
      key: "targeted",
      header: "TARGETED",
      render: (row) => <span className="font-bold text-slate-800 text-xs">{Number(row.targeted || 0).toLocaleString("en-IN")}</span>,
    },
    {
      key: "sent",
      header: "SENT",
      render: (row) => <span className="font-bold text-indigo-700 text-xs">{Number(row.sent || 0).toLocaleString("en-IN")}</span>,
    },
    {
      key: "delivered",
      header: "DELIVERED",
      render: (row) => <span className="font-bold text-teal-700 text-xs">{Number(row.delivered || 0).toLocaleString("en-IN")}</span>,
    },
    {
      key: "read",
      header: "READ",
      render: (row) => <span className="font-bold text-emerald-700 text-xs">{Number(row.read || 0).toLocaleString("en-IN")}</span>,
    },
    {
      key: "delivery_rate",
      header: "DELIVERY %",
      render: (row) => <span className="font-bold text-slate-900 text-xs">{row.delivery_rate || 0}%</span>,
    },
    {
      key: "read_rate",
      header: "READ %",
      render: (row) => <span className="font-bold text-emerald-800 text-xs">{row.read_rate || 0}%</span>,
    },
    {
      key: "estimated_cost",
      header: "EST. COST",
      render: (row) => <span className="font-bold text-amber-800 text-xs">₹{Number(row.estimated_cost || 0).toLocaleString("en-IN")}</span>,
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "draft").toLowerCase();
        const color = s.includes("completed")
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : s.includes("running")
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : s.includes("failed")
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-slate-50 text-slate-700 border-slate-200";
        return (
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border uppercase ${color}`}>
            {row.status || "Draft"}
          </span>
        );
      },
    },
    {
      key: "action",
      header: "VIEW",
      width: "50px",
      className: "w-[50px] text-center",
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedCampaignDrawer(row)}
          className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200 shrink-0 shadow-2xs"
          title="View campaign details"
        >
          <Eye className="w-4 h-4 text-teal-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* SUB-TABS & ACTION BUTTONS HEADER */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "overview" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("performance")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "performance" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Campaign Performance
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("audience")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "audience" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Audience & Conversion
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("delivery")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "delivery" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Delivery Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("details")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "details" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Campaign Details
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onOpenFilters}
            className="flex items-center gap-1.5 text-xs text-white bg-[#0f2b3d] hover:bg-[#1a435d] font-bold px-3 py-1.5 rounded-lg shadow-xs border-0"
          >
            <Filter className="w-3.5 h-3.5 text-white" />
            Filter
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-700" />
            Export
          </Button>

          {onPrint && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-700" />
              Print
            </Button>
          )}
        </div>
      </div>

      {/* 1. OVERVIEW SUB-TAB */}
      {activeSubTab === "overview" && (
        <div className="space-y-3.5">
          {/* MESSAGE COMMUNICATION FUNNEL & CAMPAIGN STATUS SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Communication Funnel */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Campaign Communication Funnel
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800">1. Targeted Audience</span>
                  <span className="font-black text-slate-900">{Number(safeFunnel.targeted || 0).toLocaleString("en-IN")} (100%)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-lg">
                  <span className="font-bold text-indigo-900">2. Dispatched / Sent</span>
                  <span className="font-black text-indigo-950">
                    {Number(safeFunnel.sent || 0).toLocaleString("en-IN")} ({safeFunnel.targeted > 0 ? Math.round((safeFunnel.sent / safeFunnel.targeted) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-teal-50/80 border border-teal-100 rounded-lg">
                  <span className="font-bold text-teal-900">3. Delivered to Device</span>
                  <span className="font-black text-teal-950">
                    {Number(safeFunnel.delivered || 0).toLocaleString("en-IN")} ({safeFunnel.sent > 0 ? Math.round((safeFunnel.delivered / safeFunnel.sent) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-purple-50/80 border border-purple-100 rounded-lg">
                  <span className="font-bold text-purple-900">4. Read by Recipient</span>
                  <span className="font-black text-purple-950">
                    {Number(safeFunnel.read || 0).toLocaleString("en-IN")} ({safeFunnel.delivered > 0 ? Math.round((safeFunnel.read / safeFunnel.delivered) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded-lg italic text-slate-500">
                  <span>5. Interested Responses</span>
                  <span>N/A / Not tracked</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded-lg italic text-slate-500">
                  <span>6. Converted Deals</span>
                  <span>N/A / Not tracked</span>
                </div>
              </div>
            </div>

            {/* Campaign Status Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Campaign Status Breakdown
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {safeStatusList.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => onFilterByStatus && onFilterByStatus(st.status)}
                    className="p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-lg cursor-pointer transition-all"
                  >
                    <div className="font-bold text-slate-900 uppercase text-[11px]">{st.status}</div>
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      <span className="font-extrabold text-slate-800">{st.count} campaigns</span>
                      <span className="font-bold text-teal-700">{st.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CAMPAIGN DIRECTORY TABLE */}
          <ReportTable
            title="Campaign Performance Directory"
            columns={columns}
            data={data}
            statusPills={statusPills}
            activeStatusPill={activeStatusPill}
            onSelectStatusPill={onSelectStatusPill}
            onOpenFilters={onOpenFilters}
            onExport={onExport}
            onRefresh={onRefresh}
            onPrint={onPrint}
            hideHeaderButtons={true}
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            loading={loading}
          />
        </div>
      )}

      {/* 2. CAMPAIGN PERFORMANCE SUB-TAB */}
      {activeSubTab === "performance" && (
        <div className="space-y-6">
          {/* TOP PERFORMING CAMPAIGNS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase">
                <Award className="w-4 h-4 text-purple-600" />
                #1 Highest Engagement (Read Rate)
              </div>
              {safeTop.best_engagement ? (
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{safeTop.best_engagement.name}</div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">{safeTop.best_engagement.read_rate}% Read Rate ({safeTop.best_engagement.read} read)</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">No campaign data</div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                #2 Best Delivery Performance
              </div>
              {safeTop.best_delivery ? (
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{safeTop.best_delivery.name}</div>
                  <div className="text-xs text-teal-700 font-bold mt-1">{safeTop.best_delivery.delivery_rate}% Delivery Rate ({safeTop.best_delivery.delivered} delivered)</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">No campaign data</div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase">
                <Send className="w-4 h-4 text-indigo-600" />
                #3 Highest Volume Broadcast
              </div>
              {safeTop.most_sent ? (
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{safeTop.most_sent.name}</div>
                  <div className="text-xs text-indigo-700 font-bold mt-1">{safeTop.most_sent.sent} Messages Sent</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">No campaign data</div>
              )}
            </div>
          </div>

          {/* PERFORMANCE RANKING TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase text-gray-900">Campaign Performance Leaderboard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-2.5 text-center">Rank</th>
                    <th className="p-2.5">Campaign Name</th>
                    <th className="p-2.5">Audience Mode</th>
                    <th className="p-2.5 text-center">Sent</th>
                    <th className="p-2.5 text-center">Delivered</th>
                    <th className="p-2.5 text-center">Read</th>
                    <th className="p-2.5 text-center">Delivery %</th>
                    <th className="p-2.5 text-center">Read %</th>
                    <th className="p-2.5 text-center">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-extrabold text-slate-500">#{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{r.name}</td>
                      <td className="p-2.5 capitalize font-medium text-slate-700">{r.audience_mode}</td>
                      <td className="p-2.5 text-center font-bold text-indigo-700">{r.sent}</td>
                      <td className="p-2.5 text-center font-bold text-teal-700">{r.delivered}</td>
                      <td className="p-2.5 text-center font-bold text-purple-700">{r.read}</td>
                      <td className="p-2.5 text-center font-extrabold text-slate-900">{r.delivery_rate}%</td>
                      <td className="p-2.5 text-center font-extrabold text-emerald-800">{r.read_rate}%</td>
                      <td className="p-2.5 text-center font-bold text-amber-800">₹{r.estimated_cost}</td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-gray-400 italic">No campaign records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIENCE & CONVERSION SUB-TAB */}
      {activeSubTab === "audience" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              Audience Targeting Mode Performance Comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-2.5">Audience Mode</th>
                    <th className="p-2.5 text-center">Campaign Count</th>
                    <th className="p-2.5 text-center">Targeted</th>
                    <th className="p-2.5 text-center">Sent</th>
                    <th className="p-2.5 text-center">Delivered</th>
                    <th className="p-2.5 text-center">Read</th>
                    <th className="p-2.5 text-center">Delivery Rate</th>
                    <th className="p-2.5 text-center">Read Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeAudienceList.map((am: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 uppercase">{am.audience_mode} Mode</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{am.campaign_count}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{am.targeted}</td>
                      <td className="p-2.5 text-center font-bold text-indigo-700">{am.sent}</td>
                      <td className="p-2.5 text-center font-bold text-teal-700">{am.delivered}</td>
                      <td className="p-2.5 text-center font-bold text-purple-700">{am.read}</td>
                      <td className="p-2.5 text-center font-extrabold text-slate-900">{am.delivery_rate}%</td>
                      <td className="p-2.5 text-center font-extrabold text-emerald-800">{am.read_rate}%</td>
                    </tr>
                  ))}
                  {safeAudienceList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-400 italic">No audience performance data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELIVERY ANALYTICS SUB-TAB */}
      {activeSubTab === "delivery" && (
        <div className="space-y-6">
          {/* DELIVERY RATE KPIS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs space-y-1">
              <div className="font-bold text-teal-700 uppercase">WhatsApp Delivery Rate</div>
              <div className="text-2xl font-black text-teal-950">{safeDelivery.delivery_rate || 0}%</div>
              <div className="text-slate-500 font-medium">Delivered / Sent ratio</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs space-y-1">
              <div className="font-bold text-purple-700 uppercase">WhatsApp Read Rate</div>
              <div className="text-2xl font-black text-purple-950">{safeDelivery.read_rate || 0}%</div>
              <div className="text-slate-500 font-medium">Read / Delivered ratio</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-1">
              <div className="font-bold text-rose-700 uppercase">API Failure Rate</div>
              <div className="text-2xl font-black text-rose-950">{safeDelivery.failure_rate || 0}%</div>
              <div className="text-slate-500 font-medium">Failed / Sent ratio</div>
            </div>
          </div>

          {/* FAILURE REASON DIAGNOSTIC TABLE */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              WhatsApp Delivery Failure Diagnostic Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-2.5">Error Reason / Log Description</th>
                    <th className="p-2.5 text-center">Failed Count</th>
                    <th className="p-2.5 text-center">Failure Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeFailures.map((f: any, idx: number) => (
                    <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                      <td className="p-2.5 font-bold text-rose-900">{f.error_reason}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{f.count}</td>
                      <td className="p-2.5 text-center font-extrabold text-rose-700">{f.percentage}%</td>
                    </tr>
                  ))}
                  {safeFailures.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-emerald-700 font-medium bg-emerald-50/50">
                        No delivery failure errors recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. CAMPAIGN DETAILS SUB-TAB */}
      {activeSubTab === "details" && (
        <div className="space-y-6">
          <ReportTable
            title="Operational Campaign Directory"
            columns={columns}
            data={data}
            statusPills={statusPills}
            activeStatusPill={activeStatusPill}
            onSelectStatusPill={onSelectStatusPill}
            onOpenFilters={onOpenFilters}
            onExport={onExport}
            onRefresh={onRefresh}
            onPrint={onPrint}
            hideHeaderButtons={true}
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            loading={loading}
          />
        </div>
      )}

      {/* CAMPAIGN DETAIL MODAL / DRAWER */}
      {selectedCampaignDrawer && (
        <div
          onClick={() => setSelectedCampaignDrawer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 text-xs text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-teal-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {selectedCampaignDrawer.name}
                  </span>
                  <span className="font-mono text-[11px] text-teal-700">#CMP-{selectedCampaignDrawer.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaignDrawer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Template Name</div>
                <div className="font-bold text-slate-900">{selectedCampaignDrawer.template_name}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Template Category</div>
                <div className="font-bold text-indigo-700">{selectedCampaignDrawer.template_category}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Audience Mode</div>
                <div className="font-bold text-slate-900 capitalize">{selectedCampaignDrawer.audience_mode}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Status</div>
                <div className="font-bold text-teal-700 uppercase">{selectedCampaignDrawer.status}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-100 rounded">
                <div className="text-[9px] text-slate-500 font-bold">TARGETED</div>
                <div className="font-extrabold text-slate-900">{selectedCampaignDrawer.targeted}</div>
              </div>
              <div className="p-2 bg-indigo-50 rounded">
                <div className="text-[9px] text-indigo-700 font-bold">SENT</div>
                <div className="font-extrabold text-indigo-900">{selectedCampaignDrawer.sent}</div>
              </div>
              <div className="p-2 bg-teal-50 rounded">
                <div className="text-[9px] text-teal-700 font-bold">DELIVERED</div>
                <div className="font-extrabold text-teal-900">{selectedCampaignDrawer.delivered}</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-[9px] text-purple-700 font-bold">READ</div>
                <div className="font-extrabold text-purple-900">{selectedCampaignDrawer.read}</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
              <span className="font-bold text-amber-900">Estimated Meta API Expenditure</span>
              <span className="font-black text-amber-950 text-sm">₹{selectedCampaignDrawer.estimated_cost}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setSelectedCampaignDrawer(null)}
                className="text-xs bg-slate-800 text-white font-bold"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
