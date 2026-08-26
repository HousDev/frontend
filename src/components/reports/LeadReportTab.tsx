// frontend/src/components/reports/LeadReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import {
  Target,
  Clock,
  Layers,
  Award,
} from "lucide-react";

interface LeadReportTabProps {
  data: any[];
  stats?: any;
  funnel?: any[];
  sources?: any[];
  executives?: any[];
  followupInsights?: any;
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  loading?: boolean;
  filters?: any;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  activeStatusPill?: string;
  onSelectStatusPill?: (key: string) => void;
  onApplyFilterParam?: (key: string, value: any) => void;
}

export const LeadReportTab: React.FC<LeadReportTabProps> = ({
  data = [],
  stats = {},
  funnel = [],
  sources = [],
  executives = [],
  followupInsights = {},
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
}) => {
  const safeStats = stats || {
    total_count: 0,
    fresh_count: 0,
    unassigned_count: 0,
    assigned_count: 0,
    interested_count: 0,
    buyer_transferred_count: 0,
    seller_transferred_count: 0,
    unique_converted_count: 0,
    conversion_rate: 0,
    contacted_count: 0,
    unqualified_count: 0,
  };

  const safeFunnel = Array.isArray(funnel) && funnel.length > 0 ? funnel : [
    { id: "total", label: "Total Leads", count: safeStats.total_count || 0, pct: 100, color: "#1e293b" },
    { id: "fresh", label: "Fresh Leads", count: safeStats.fresh_count || 0, pct: safeStats.total_count ? Math.round((safeStats.fresh_count / safeStats.total_count) * 100) : 0, color: "#3b82f6" },
    { id: "assigned", label: "Assigned", count: safeStats.assigned_count || 0, pct: safeStats.total_count ? Math.round((safeStats.assigned_count / safeStats.total_count) * 100) : 0, color: "#0284c7" },
    { id: "interested", label: "Interested / Qualified", count: safeStats.interested_count || 0, pct: safeStats.total_count ? Math.round((safeStats.interested_count / safeStats.total_count) * 100) : 0, color: "#8b5cf6" },
    { id: "buyer_transferred", label: "Transferred to Buyer", count: safeStats.buyer_transferred_count || 0, pct: safeStats.total_count ? Math.round((safeStats.buyer_transferred_count / safeStats.total_count) * 100) : 0, color: "#10b981" },
    { id: "seller_transferred", label: "Transferred to Seller", count: safeStats.seller_transferred_count || 0, pct: safeStats.total_count ? Math.round((safeStats.seller_transferred_count / safeStats.total_count) * 100) : 0, color: "#f59e0b" },
    { id: "closed", label: "Closed / Won", count: safeStats.closed_count || 0, pct: safeStats.total_count ? Math.round((safeStats.closed_count / safeStats.total_count) * 100) : 0, color: "#059669" },
  ];

  const safeSources = Array.isArray(sources) ? sources : [];
  const safeExecutives = Array.isArray(executives) ? executives : [];
  const safeFollowups = followupInsights || {};

  const statusPills: StatusPill[] = [
    { label: "All", key: "all", count: safeStats.total_count || data.length },
    { label: "New", key: "new", count: safeStats.fresh_count || 0 },
    { label: "Contacted", key: "contacted", count: safeStats.contacted_count || 0 },
    { label: "Qualified", key: "qualified", count: safeStats.interested_count || 0 },
    { label: "Unqualified", key: "unqualified", count: safeStats.unqualified_count || 0 },
    { label: "Transferred to Buyer", key: "buyer_transferred", count: safeStats.buyer_transferred_count || 0 },
    { label: "Transferred to Seller", key: "seller_transferred", count: safeStats.seller_transferred_count || 0 },
  ];

  const allColumns: ColumnDef[] = [
    {
      key: "name",
      header: "NAME",
      width: "22%",
      searchPlaceholder: "Search name...",
      render: (row) => (
        <div className="truncate">
          <div className="font-bold text-gray-900 truncate">
            {row.salutation ? `${row.salutation} ` : ""}{row.name || "N/A"}
          </div>
          <div className="text-[10px] text-gray-500 font-medium truncate">
            Type: <span className="font-semibold text-gray-700">{row.lead_type || "Buyer"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "CONTACT",
      width: "18%",
      searchPlaceholder: "Search contact...",
      render: (row) => (
        <div className="truncate">
          <div className="font-semibold text-gray-900 text-xs truncate">{row.phone || "N/A"}</div>
          <div className="text-[10px] text-gray-500 truncate">{row.email || ""}</div>
        </div>
      ),
    },
    {
      key: "city",
      header: "CITY / LOCATION",
      width: "17%",
      searchPlaceholder: "Search location...",
      render: (row) => (
        <div className="truncate">
          <div className="font-medium text-gray-900 text-xs truncate">{row.city || "N/A"}</div>
          {row.location && <div className="text-[10px] text-gray-500 truncate">{row.location}</div>}
        </div>
      ),
    },
    {
      key: "lead_source",
      header: "SOURCE",
      width: "10%",
      className: "text-center",
      searchPlaceholder: "Search...",
      render: (row) => (
        <span className="font-medium text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] truncate block">
          {row.lead_source || "Cold Call"}
        </span>
      ),
    },
    {
      key: "priority",
      header: "PRIORITY",
      width: "7%",
      className: "text-center",
      searchPlaceholder: "Search...",
      render: (row) => {
        const p = String(row.priority || "normal").toLowerCase();
        let color = "bg-blue-100 text-blue-800";
        if (p === "urgent" || p === "high") color = "bg-rose-100 text-rose-800";
        else if (p === "medium" || p === "normal") color = "bg-amber-100 text-amber-800 font-bold";
        else if (p === "low") color = "bg-gray-100 text-gray-700";
        return (
          <span className={`px-1 py-0.5 rounded text-[9px] font-bold uppercase truncate block ${color}`}>
            {row.priority || "NORMAL"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "STATUS",
      width: "8%",
      className: "text-center",
      searchPlaceholder: "Search...",
      render: (row) => {
        const s = String(row.status || "new").toLowerCase();
        let color = "bg-gray-100 text-gray-800";
        if (s.includes("qualif") || s.includes("interest")) color = "bg-purple-100 text-purple-800";
        else if (s.includes("closed") || s.includes("won")) color = "bg-emerald-100 text-emerald-800";
        else if (s.includes("contact")) color = "bg-blue-100 text-blue-800";
        else if (s.includes("new") || s.includes("fresh")) color = "bg-sky-100 text-sky-800";

        return (
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold truncate block ${color}`}>
            {row.status || "New"}
          </span>
        );
      },
    },
    {
      key: "assigned_executive_name",
      header: "ASSIGNED AGENT",
      width: "13%",
      searchPlaceholder: "Search...",
      render: (row) => (
        <span className={`font-medium text-xs truncate block ${row.assigned_executive_name === "Unassigned" ? "text-gray-400 italic" : "text-gray-900"}`}>
          {row.assigned_executive_name || "Unassigned"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. VISUAL LEAD LIFECYCLE FUNNEL (ALL 7 STAGES IN ONE ROW) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Lead Acquisition & Conversion Funnel</h3>
              <p className="text-[11px] text-gray-500">Interactive stage-by-stage progression flow</p>
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Conversion Rate: <span className="text-emerald-600 font-bold">{safeStats.conversion_rate || 0}%</span>
          </div>
        </div>

        {/* 7 STAGE CARDS IN ONE ROW */}
        <div className="grid grid-cols-7 gap-2.5">
          {safeFunnel.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => onSelectStatusPill && onSelectStatusPill(item.id)}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer min-w-0"
            >
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Stage {idx + 1}
                </div>
                <div className="text-[11px] font-bold text-slate-900 truncate" title={item.label}>
                  {item.label}
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-base font-extrabold text-slate-900">{item.count}</span>
                <span className="text-[11px] font-bold text-blue-600">{item.pct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, item.pct)}%`, backgroundColor: item.color || "#3b82f6" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PERFORMANCE BREAKDOWN GRIDS (LEAD SOURCES & EXECUTIVES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Source Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Lead Source Performance</h3>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{safeSources.length} Active Channels</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2 px-2.5">Source</th>
                    <th className="py-2 px-2.5 text-center">Leads</th>
                    <th className="py-2 px-2.5 text-center">Assigned %</th>
                    <th className="py-2 px-2.5 text-center">Buyer</th>
                    <th className="py-2 px-2.5 text-center">Seller</th>
                    <th className="py-2 px-2.5 text-right">Conv %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeSources.length > 0 ? (
                    safeSources.slice(0, 6).map((src, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-2.5 font-bold text-slate-800">{src.source_name}</td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-900">{src.total_leads}</td>
                        <td className="py-2 px-2.5 text-center text-slate-600">{src.assigned_pct}%</td>
                        <td className="py-2 px-2.5 text-center font-semibold text-emerald-600">{src.buyer_transfers}</td>
                        <td className="py-2 px-2.5 text-center font-semibold text-orange-600">{src.seller_transfers}</td>
                        <td className="py-2 px-2.5 text-right font-extrabold text-purple-700">{src.conversion_pct}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        No lead source breakdown available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Executive Performance Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900">Executive Performance</h3>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{safeExecutives.length} Team Members</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2 px-2.5">Executive</th>
                    <th className="py-2 px-2.5 text-center">Assigned</th>
                    <th className="py-2 px-2.5 text-center">Fresh</th>
                    <th className="py-2 px-2.5 text-center">Interested</th>
                    <th className="py-2 px-2.5 text-center">Buyer</th>
                    <th className="py-2 px-2.5 text-right">Conv %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeExecutives.length > 0 ? (
                    safeExecutives.slice(0, 6).map((exec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-2.5 font-bold text-slate-800">{exec.executive_name}</td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-900">{exec.assigned_leads}</td>
                        <td className="py-2 px-2.5 text-center text-blue-600 font-medium">{exec.fresh_count}</td>
                        <td className="py-2 px-2.5 text-center text-purple-600 font-medium">{exec.interested_count}</td>
                        <td className="py-2 px-2.5 text-center font-semibold text-emerald-600">{exec.buyer_transfers}</td>
                        <td className="py-2 px-2.5 text-right font-extrabold text-emerald-700">{exec.conversion_rate}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        No executive data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOLLOW-UP & ACTIVITY OPERATIONAL INSIGHTS */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">Follow-up & Operational Activity Insights</h4>
            <p className="text-[11px] text-slate-300">Action items requiring immediate presales executive attention</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block text-[10px]">Follow-up Today:</span>
            <span className="font-extrabold text-amber-400 text-sm">{safeFollowups.followup_today || 0}</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block text-[10px]">Overdue Follow-ups:</span>
            <span className="font-extrabold text-rose-400 text-sm">{safeFollowups.overdue || 0}</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block text-[10px]">Upcoming:</span>
            <span className="font-extrabold text-sky-400 text-sm">{safeFollowups.upcoming || 0}</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block text-[10px]">No Follow-up:</span>
            <span className="font-extrabold text-slate-300 text-sm">{safeFollowups.no_followup || 0}</span>
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block text-[10px]">Inactive (7+ Days):</span>
            <span className="font-extrabold text-orange-300 text-sm">{safeFollowups.inactive_7days || 0}</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN REPORT TABLE COMPONENT */}
      <ReportTable
        title="Leads Detailed Report"
        columns={allColumns}
        data={data}
        statusPills={statusPills}
        activeStatusPill={activeStatusPill}
        onSelectStatusPill={onSelectStatusPill}
        onOpenFilters={onOpenFilters}
        onExport={onExport}
        onRefresh={onRefresh}
        onPrint={onPrint}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        loading={loading}
      />
    </div>
  );
};
