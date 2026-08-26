// frontend/src/components/reports/SellerReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCheck2,
  Building,
  Calendar,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";

interface SellerReportTabProps {
  data: any[];
  stats: any;
  summary?: any;
  pipeline?: any[];
  aging?: any[];
  followups?: any;
  properties?: any;
  sources?: any[];
  documents?: any;
  cosellers?: any;
  executives?: any[];
  financials?: any;
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onPrint: () => void;
  activeStatusPill?: string;
  onSelectStatusPill?: (key: string) => void;
  loading?: boolean;
  onFilterByStage?: (stage: string) => void;
  onFilterByAging?: (agingRange: string) => void;
  onFilterByDocStatus?: (docStatus: string) => void;
}

export const SellerReportTab: React.FC<SellerReportTabProps> = ({
  data = [],
  stats = {},
  summary = {},
  pipeline = [],
  aging = [],
  followups = {},
  properties = {},
  sources = [],
  documents = {},
  cosellers = {},
  executives = [],
  financials = {},
  pagination,
  onPageChange,
  onLimitChange,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
  activeStatusPill = "all",
  onSelectStatusPill,
  loading = false,
  onFilterByStage,
  onFilterByAging,
  onFilterByDocStatus,
}) => {
  const safeStats = stats || {};
  const safeSummary = summary || {};
  const safeFollowups = followups || {};
  const safeProperties = properties || {};
  const safeDocuments = documents || {};
  const safeCosellers = cosellers || {};
  const safeExecutives = Array.isArray(executives) ? executives : [];
  const safePipeline = Array.isArray(pipeline) ? pipeline : [];
  const safeAging = Array.isArray(aging) ? aging : [];

  const statusPills: StatusPill[] = [
    { label: "All Sellers", key: "all", count: safeStats.total_count || safeSummary.total_sellers || data.length },
    { label: "Active Listings", key: "active", count: safeStats.active_count || safeSummary.active_sellers || 0 },
    { label: "Closed / Sold", key: "sold", count: safeStats.sold_count || safeSummary.closed_sold || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "SELLER NAME & CONTACT",
      searchPlaceholder: "Search seller...",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900 flex items-center gap-1 text-xs">
            <span>{row.salutation ? `${row.salutation} ` : ""}</span>
            <span>{row.name || "N/A"}</span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium">{row.phone || "N/A"}</div>
          <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{row.email || ""}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "PROPERTY LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-800 text-xs">{row.location || row.city || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "expected_price",
      header: "EXPECTED PRICE",
      searchPlaceholder: "Search price...",
      render: (row) => {
        const val = Number(row.expected_price || row.deal_value || 0);
        return (
          <div>
            <span className="font-bold text-emerald-700 block text-xs">
              {val > 0 ? `₹${val.toLocaleString("en-IN")}` : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      key: "days_listed",
      header: "DAYS LISTED",
      searchPlaceholder: "Search days...",
      render: (row) => (
        <span className="font-medium text-gray-700 text-xs">
          {row.days_listed !== undefined ? `${row.days_listed} days` : "-"}
        </span>
      ),
    },
    {
      key: "seller_lead_stage",
      header: "STAGE",
      searchPlaceholder: "Search stage...",
      render: (row) => {
        const st = row.seller_lead_stage || row.stage || "New";
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">{st}</span>;
      },
    },
    {
      key: "seller_lead_status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.seller_lead_status || row.status || "active").toLowerCase();
        const color = s.includes("sold") || s.includes("closed")
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-blue-50 text-blue-700 border-blue-200";
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color}`}>{row.seller_lead_status || row.status || "Active"}</span>;
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED AGENT",
      searchPlaceholder: "Search agent...",
      render: (row) => <span className="font-medium text-gray-800 text-xs">{row.assigned_agent_name || "Unassigned"}</span>,
    },
  ];

  const totalSellersCount = safeSummary.total_sellers || safeStats.total_count || data.length || 1;

  return (
    <div className="space-y-4">
      {/* 1. SELLER PIPELINE SECTION (Compact Interactive Funnel Cards) */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">Seller Sales Pipeline Funnel</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            Click stage to filter table
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(safePipeline.length > 0 ? safePipeline : [
            { stage: "New", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Qualified", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Listed", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Buyer Interest", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Negotiation", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Agreement", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Closed", count: 0, percentage: 0, deal_value: 0 },
          ]).map((p, idx) => (
            <div
              key={idx}
              onClick={() => onFilterByStage && onFilterByStage(p.stage)}
              className="bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-lg p-2.5 cursor-pointer transition-all hover:shadow-sm group"
            >
              <div className="text-[10px] font-bold text-gray-600 group-hover:text-indigo-900 truncate">
                {p.stage}
              </div>
              <div className="text-sm font-black text-gray-900 mt-0.5">{p.count}</div>
              <div className="flex items-center justify-between mt-1 text-[9px]">
                <span className="text-indigo-600 font-bold">{p.percentage}%</span>
                <span className="text-gray-500 font-medium">₹{(Number(p.deal_value || 0) / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, p.percentage || 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CREATIVE 3-COLUMN COMPACT BI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card A: Listing Aging Analytics */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-xs">Listing Aging Brackets</h3>
            </div>
            <span className="text-[9px] text-gray-400 font-medium">Click to filter</span>
          </div>

          <div className="space-y-1.5 flex-1">
            {(safeAging.length > 0 ? safeAging : [
              { range: "0–7 days", key: "0_7", count: 0, deal_value: 0 },
              { range: "8–15 days", key: "8_15", count: 0, deal_value: 0 },
              { range: "16–30 days", key: "16_30", count: 0, deal_value: 0 },
              { range: "31–60 days", key: "31_60", count: 0, deal_value: 0 },
              { range: "60+ days", key: "60_plus", count: 0, deal_value: 0 },
            ]).map((a, idx) => (
              <div
                key={idx}
                onClick={() => onFilterByAging && onFilterByAging(a.key)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-blue-50/60 border border-gray-100 hover:border-blue-200 cursor-pointer transition-all"
              >
                <span className="w-16 text-[10px] font-bold text-gray-700">{a.range}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (a.count / totalSellersCount) * 100)}%` }}
                  />
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-[10px] font-black text-gray-900">{a.count}</span>
                  <span className="text-[9px] text-gray-500 ml-1">₹{(Number(a.deal_value || 0) / 100000).toFixed(0)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card B: Follow-up Performance & Velocity */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-xs">Follow-up Velocity</h3>
            </div>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {safeFollowups.completion_rate || 100}% Completed
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-emerald-50/80 border border-emerald-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-emerald-800">Done</div>
              <div className="text-sm font-black text-emerald-700">{safeFollowups.completed || 0}</div>
            </div>
            <div className="bg-sky-50/80 border border-sky-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-sky-800">Pending</div>
              <div className="text-sm font-black text-sky-700">{safeFollowups.pending || 0}</div>
            </div>
            <div className="bg-amber-50/80 border border-amber-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-amber-800">Missed</div>
              <div className="text-sm font-black text-amber-700">{safeFollowups.missed || 0}</div>
            </div>
            <div className="bg-rose-50/80 border border-rose-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-rose-800">Overdue</div>
              <div className="text-sm font-black text-rose-700">{safeFollowups.overdue || 0}</div>
            </div>
          </div>

          <div className="pt-1">
            <div className="text-[10px] font-bold text-gray-700 mb-1 flex justify-between">
              <span>Channel Touchpoints</span>
              <span className="text-gray-400 font-normal">Active touchpoints</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(safeFollowups.types || [
                { type: "Call", count: 0 },
                { type: "WhatsApp", count: 0 },
                { type: "Visit", count: 0 },
                { type: "Meeting", count: 0 },
              ]).map((t: any, i: number) => (
                <span key={i} className="text-[9px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                  {t.type}: <strong className="text-indigo-700">{t.count}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-amber-800 bg-amber-50/90 p-1.5 rounded border border-amber-200 font-medium">
            ⚠️ <strong>{safeFollowups.sellers_with_no_upcoming || 0} sellers</strong> have no upcoming follow-up.
          </div>
        </div>

        {/* Card C: Legal Documents & Property Types */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <h3 className="font-bold text-gray-900 text-xs">Document Verification</h3>
            </div>
            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {safeDocuments.verification_percentage || 100}% Verified
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div
              onClick={() => onFilterByDocStatus && onFilterByDocStatus("verified")}
              className="bg-emerald-50/80 border border-emerald-200 p-1.5 rounded-md cursor-pointer hover:bg-emerald-100 transition-all"
            >
              <div className="text-[9px] font-bold text-emerald-800">Verified</div>
              <div className="text-sm font-black text-emerald-700">{safeDocuments.verified || 0}</div>
            </div>
            <div
              onClick={() => onFilterByDocStatus && onFilterByDocStatus("pending")}
              className="bg-amber-50/80 border border-amber-200 p-1.5 rounded-md cursor-pointer hover:bg-amber-100 transition-all"
            >
              <div className="text-[9px] font-bold text-amber-800">Pending</div>
              <div className="text-sm font-black text-amber-700">{safeDocuments.pending || 0}</div>
            </div>
            <div
              onClick={() => onFilterByDocStatus && onFilterByDocStatus("rejected")}
              className="bg-rose-50/80 border border-rose-200 p-1.5 rounded-md cursor-pointer hover:bg-rose-100 transition-all"
            >
              <div className="text-[9px] font-bold text-rose-800">Rejected</div>
              <div className="text-sm font-black text-rose-700">{safeDocuments.rejected || 0}</div>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-semibold text-slate-700">
              <span>Co-Sellers / Ownership:</span>
              <span className="font-bold text-indigo-700">{safeCosellers.joint_owner || 0} Joint • {safeCosellers.single_owner || 0} Single</span>
            </div>
            <div className="flex justify-between items-center text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-semibold text-slate-700">
              <span>Inventory Linked:</span>
              <span className="font-bold text-emerald-700">{safeProperties.total_linked_properties || safeSummary.properties_linked || totalSellersCount} Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXECUTIVE & AGENT PERFORMANCE LEADERBOARD */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1.5">
            <UserCheck2 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-xs">Executive & Agent Performance Leaderboard</h3>
          </div>
          <span className="text-[9px] text-gray-500 font-medium">Real-time velocity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-bold bg-gray-50/80 text-[10px] uppercase">
                <th className="p-2">Rank & Agent</th>
                <th className="p-2 text-center">Total Sellers</th>
                <th className="p-2 text-center">Active</th>
                <th className="p-2 text-center">Negotiations</th>
                <th className="p-2 text-center">Closed Deals</th>
                <th className="p-2 text-right">Pipeline Valuation (₹)</th>
                <th className="p-2 text-center">Response Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(safeExecutives.length > 0 ? safeExecutives : [
                { agent_name: "Unassigned Agent", total_sellers: safeSummary.total_sellers || data.length, active_sellers: safeSummary.active_sellers || 0, negotiation_count: 0, closed_count: safeSummary.closed_sold || 0, pipeline_value: safeSummary.pipeline_value || 0, response_rate: 95 },
              ]).map((ex, idx) => {
                const rankBadge = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                return (
                  <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="p-2 font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-xs">{rankBadge}</span>
                      <span>{ex.agent_name}</span>
                    </td>
                    <td className="p-2 text-center font-bold text-gray-800">{ex.total_sellers}</td>
                    <td className="p-2 text-center font-semibold text-blue-600">{ex.active_sellers}</td>
                    <td className="p-2 text-center font-semibold text-amber-600">{ex.negotiation_count}</td>
                    <td className="p-2 text-center font-black text-emerald-600">{ex.closed_count}</td>
                    <td className="p-2 text-right font-extrabold text-gray-900">₹{Number(ex.pipeline_value || 0).toLocaleString("en-IN")}</td>
                    <td className="p-2 text-center font-bold text-indigo-600">{ex.response_rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MAIN SELLER DETAIL TABLE (Preserving Toolbar & Scrollbar) */}
      <ReportTable
        title="Seller Records Detail Table"
        columns={columns}
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
