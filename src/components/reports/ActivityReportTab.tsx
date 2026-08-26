// frontend/src/components/reports/ActivityReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import { UserCheck } from "lucide-react";

interface ActivityReportTabProps {
  data: any[];
  userSummary?: any[];
  stats?: { total_count: number; call_count: number; meeting_count: number; whatsapp_count: number; completed_count: number } | null;
  loading?: boolean;
  filters?: any;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
}

export const ActivityReportTab: React.FC<ActivityReportTabProps> = ({
  data = [],
  userSummary = [],
  stats,
  loading = false,
  filters = {},
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
}) => {
  const [viewMode, setViewMode] = useState<"user_summary" | "activity_log">("user_summary");
  const [activeStatusPill, setActiveStatusPill] = useState<string>("all");

  const safeStats = stats || { total_count: 0, call_count: 0, meeting_count: 0, whatsapp_count: 0, completed_count: 0 };

  const totalAssignedLeads = userSummary.reduce((acc, curr) => acc + Number(curr.assigned_leads || 0), 0);
  const totalFollowupsTaken = userSummary.reduce((acc, curr) => acc + Number(curr.followups_count || 0), 0);
  const totalOverdueFollowups = userSummary.reduce((acc, curr) => acc + Number(curr.overdue_followups || 0), 0);
  const totalInterested = userSummary.reduce((acc, curr) => acc + Number(curr.interested_leads || 0), 0);

  const statusPills: StatusPill[] = [
    { label: "Active Staff", key: "all", count: userSummary.length },
    { label: "Assigned Leads", key: "assigned", count: totalAssignedLeads },
    { label: "Follow-ups Taken", key: "followups", count: totalFollowupsTaken },
    { label: "Overdue Actions", key: "overdue", count: totalOverdueFollowups },
    { label: "Interested Leads", key: "interested", count: totalInterested },
    { label: "Activity Logs", key: "logs", count: safeStats.total_count || data.length },
  ];

  const handleSelectStatusPill = (key: string) => {
    setActiveStatusPill(key);
    if (key === "logs") {
      setViewMode("activity_log");
    } else {
      setViewMode("user_summary");
    }
  };

  const displayUserSummary = userSummary.filter((u) => {
    if (activeStatusPill === "assigned" && Number(u.assigned_leads || 0) === 0) return false;
    if (activeStatusPill === "followups" && Number(u.followups_count || 0) === 0) return false;
    if (activeStatusPill === "overdue" && Number(u.overdue_followups || 0) === 0) return false;
    if (activeStatusPill === "interested" && Number(u.interested_leads || 0) === 0) return false;

    // Smart Filter Drawer: Lead Category Filter
    if (filters.lead_type && filters.lead_type !== "all") {
      const lt = filters.lead_type.toLowerCase();
      if (lt === "client" && Number(u.general_leads || 0) === 0) return false;
      if (lt === "buyer" && Number(u.buyer_leads || 0) === 0) return false;
      if (lt === "seller" && Number(u.seller_leads || 0) === 0) return false;
      if (lt === "owner" && Number(u.owner_leads || 0) === 0) return false;
      if (lt === "tenant" && Number(u.tenant_leads || 0) === 0) return false;
    }

    // Smart Filter Drawer: Status Filter
    if (filters.status && filters.status !== "all") {
      const st = filters.status.toLowerCase();
      if (st === "qualified" || st === "interested") {
        if (Number(u.interested_leads || 0) === 0) return false;
      } else if (st === "overdue") {
        if (Number(u.overdue_followups || 0) === 0) return false;
      } else if (st === "unqualified" || st === "not_interested") {
        if (Number(u.not_interested_leads || 0) === 0) return false;
      }
    }

    return true;
  });

  // Columns for Per-User Activity Execution Summary
  const userColumns: ColumnDef[] = [
    {
      key: "user_name",
      header: "STAFF / AGENT NAME",
      searchPlaceholder: "Search staff...",
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-gray-900">{row.user_name || "N/A"}</span>
          <span className="text-[10px] text-gray-400 font-medium capitalize">({row.role || "Executive"})</span>
        </div>
      ),
    },
    {
      key: "assigned_leads",
      header: "TOTAL ASSIGNED",
      render: (row) => <span className="font-extrabold text-gray-900 text-xs">{row.assigned_leads || 0}</span>,
    },
    {
      key: "general_leads",
      header: "CLIENT LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.general_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
            📋 {cnt} Client
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "buyer_leads",
      header: "BUYER LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.buyer_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
            🛒 {cnt} Buyer
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "seller_leads",
      header: "SELLER LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.seller_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            🏠 {cnt} Seller
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "owner_leads",
      header: "OWNER LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.owner_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            🔑 {cnt} Owner
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "tenant_leads",
      header: "TENANT LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.tenant_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
            👤 {cnt} Tenant
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "followups_count",
      header: "FOLLOW-UPS TAKEN",
      render: (row) => <span className="font-extrabold text-purple-700">{row.followups_count || 0}</span>,
    },
    {
      key: "overdue_followups",
      header: "OVERDUE ACTIONS",
      render: (row) => {
        const overdue = Number(row.overdue_followups || 0);
        return overdue > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            ⚠️ {overdue} Overdue
          </span>
        ) : (
          <span className="text-gray-400 font-semibold">0</span>
        );
      },
    },
    {
      key: "contacted_leads",
      header: "CONTACTED LEADS",
      render: (row) => <span className="font-bold text-blue-700">{row.contacted_leads || 0}</span>,
    },
    {
      key: "interested_leads",
      header: "INTERESTED PROSPECTS",
      render: (row) => <span className="font-bold text-emerald-600">{row.interested_leads || 0}</span>,
    },
    {
      key: "not_interested_leads",
      header: "NOT INTERESTED",
      render: (row) => <span className="font-medium text-rose-600">{row.not_interested_leads || 0}</span>,
    },
    {
      key: "last_activity_at",
      header: "LAST LOGGED ACTIVITY",
      render: (row) => {
        const ts = row.last_activity_at;
        if (!ts || ts.startsWith("1970")) return <span className="text-gray-400 italic">No Activity Yet</span>;
        const d = new Date(ts);
        const isToday = new Date().toDateString() === d.toDateString();
        return (
          <div>
            <div className="font-semibold text-gray-800 text-[11px]">
              {isToday ? "Today, " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        );
      },
    },
    {
      key: "execution_status",
      header: "STAFF PERFORMANCE",
      render: (row) => {
        const assigned = Number(row.assigned_leads || 0);
        const interested = Number(row.interested_leads || 0);
        const overdue = Number(row.overdue_followups || 0);
        const followups = Number(row.followups_count || 0);
        const rate = assigned > 0 ? (interested / assigned) * 100 : 0;

        if (overdue > 0) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">⚠️ Needs Action</span>;
        }
        if (rate >= 25 || (followups > 10 && interested > 2)) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">🔥 Top Performer</span>;
        }
        if (followups > 0) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">⚡ Active Staff</span>;
        }
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700">💤 Pending Log</span>;
      },
    },
  ];

  // Columns for Activity History Logs
  const logColumns: ColumnDef[] = [
    {
      key: "user_name",
      header: "STAFF / PERFORMED BY",
      searchPlaceholder: "Search staff...",
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-gray-900">{row.user_name || "Staff Member"}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "ACTION & CHANNEL",
      searchPlaceholder: "Search action...",
      render: (row) => {
        const t = (row.type || "").toLowerCase();
        let badge = "bg-blue-50 text-blue-800 border-blue-200";
        let icon = "📞";
        if (t.includes("wa") || t.includes("whatsapp")) {
          badge = "bg-emerald-50 text-emerald-800 border-emerald-200";
          icon = "💬";
        } else if (t.includes("visit") || t.includes("meet") || t.includes("site")) {
          badge = "bg-purple-50 text-purple-800 border-purple-200";
          icon = "🤝";
        } else if (t.includes("follow")) {
          badge = "bg-amber-50 text-amber-800 border-amber-200";
          icon = "📝";
        }
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badge} whitespace-nowrap`}>
            {icon} {row.type || "Activity"}
          </span>
        );
      },
    },
    {
      key: "target_lead_name",
      header: "CLIENT / LEAD TARGET",
      searchPlaceholder: "Search lead...",
      render: (row) => {
        const tag = row.lead_type_tag || "Lead";
        let tagBg = "bg-slate-100 text-slate-700 border-slate-300";
        if (tag.includes("Buyer")) tagBg = "bg-blue-50 text-blue-800 border-blue-200";
        if (tag.includes("Seller")) tagBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
        if (tag.includes("Owner")) tagBg = "bg-amber-50 text-amber-800 border-amber-200";
        if (tag.includes("Tenant")) tagBg = "bg-indigo-50 text-indigo-800 border-indigo-200";

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-gray-900">{row.target_lead_name || "Client Lead"}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${tagBg}`}>
              {tag}
            </span>
          </div>
        );
      },
    },
    {
      key: "description",
      header: "REMARK / DETAILS",
      searchPlaceholder: "Search remark...",
      render: (row) => <span className="text-gray-700 font-medium text-[11px] truncate max-w-xs">{row.description || "N/A"}</span>,
    },
    {
      key: "status",
      header: "OUTCOME STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "completed").toLowerCase();
        let color = "bg-blue-100 text-blue-800";
        if (s.includes("qualif") || s.includes("interest") || s.includes("done") || s.includes("completed")) color = "bg-emerald-100 text-emerald-800";
        else if (s.includes("progress") || s.includes("pending")) color = "bg-amber-100 text-amber-800";
        else if (s.includes("not") || s.includes("lost") || s.includes("reject")) color = "bg-rose-100 text-rose-800";
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${color} whitespace-nowrap`}>{row.status || "Logged"}</span>;
      },
    },
    {
      key: "created_at",
      header: "LOGGED TIMESTAMP",
      render: (row) => {
        const d = row.created_at || row.scheduled_date;
        return d ? <span className="font-semibold text-gray-800 text-[11px] whitespace-nowrap">{new Date(d).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span> : "N/A";
      },
    },
  ];

  return (
    <div className="space-y-3">
      {/* Mode Switcher Banner */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-300 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setViewMode("user_summary");
              setActiveStatusPill("all");
            }}
            className={`px-3.5 py-1.5 text-xs transition-all border-b-2 ${
              viewMode === "user_summary"
                ? "border-indigo-600 text-indigo-900 font-extrabold bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"
            }`}
          >
            User Lead Activity Breakdown
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("activity_log");
              setActiveStatusPill("logs");
            }}
            className={`px-3.5 py-1.5 text-xs transition-all border-b-2 ${
              viewMode === "activity_log"
                ? "border-indigo-600 text-indigo-900 font-extrabold bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"
            }`}
          >
            Activity History Logs
          </button>
        </div>
        <div className="text-[11px] font-semibold text-gray-500">
          {viewMode === "user_summary" ? "Per-User Assigned Leads & Execution Metrics" : "Chronological Activity Feed"}
        </div>
      </div>

      <ReportTable
        title={viewMode === "user_summary" ? "User Lead Activity Report" : "Activity Logs Feed"}
        columns={viewMode === "user_summary" ? userColumns : logColumns}
        data={viewMode === "user_summary" ? displayUserSummary : data}
        statusPills={statusPills}
        activeStatusPill={activeStatusPill}
        onSelectStatusPill={handleSelectStatusPill}
        onOpenFilters={onOpenFilters}
        onExport={onExport}
        onRefresh={onRefresh}
        onPrint={onPrint}
        pagination={{ page: 1, limit: 100, totalRecords: viewMode === "user_summary" ? displayUserSummary.length : data.length, totalPages: 1 }}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
      />
    </div>
  );
};
