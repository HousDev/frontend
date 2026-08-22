// frontend/src/components/reports/ActivityReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import { UserCheck } from "lucide-react";

interface ActivityReportTabProps {
  data: any[];
  userSummary?: any[];
  stats?: { total_count: number; call_count: number; meeting_count: number; whatsapp_count: number; completed_count: number } | null;
  loading?: boolean;
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
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
}) => {
  const [viewMode, setViewMode] = useState<"user_summary" | "activity_log">("user_summary");
  const [activeStatusPill, setActiveStatusPill] = useState<string>("all");

  const safeStats = stats || { total_count: 0, call_count: 0, meeting_count: 0, whatsapp_count: 0, completed_count: 0 };

  const totalAssignedLeads = userSummary.reduce((acc, curr) => acc + Number(curr.assigned_leads || 0), 0);
  const totalInterested = userSummary.reduce((acc, curr) => acc + Number(curr.interested_leads || 0), 0);

  const statusPills: StatusPill[] = [
    { label: "Total Users", key: "all", count: userSummary.length },
    { label: "Assigned Leads", key: "assigned", count: totalAssignedLeads },
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
    if (activeStatusPill === "assigned") return Number(u.assigned_leads || 0) > 0;
    if (activeStatusPill === "interested") return Number(u.interested_leads || 0) > 0;
    return true;
  });

  // Columns for Per-User Activity Execution Summary
  const userColumns: ColumnDef[] = [
    {
      key: "user_name",
      header: "USER / AGENT NAME",
      searchPlaceholder: "Search user...",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            {row.user_name || "N/A"}
          </div>
          <div className="text-[11px] text-gray-400 capitalize">{row.role || "Agent"} | {row.department || "Sales"}</div>
        </div>
      ),
    },
    {
      key: "assigned_leads",
      header: "ASSIGNED LEADS",
      render: (row) => <span className="font-bold text-gray-900">{row.assigned_leads || 0}</span>,
    },
    {
      key: "calls_done",
      header: "CALLS COMPLETED",
      render: (row) => (
        <span className="font-semibold text-blue-700">{row.calls_done || 0}</span>
      ),
    },
    {
      key: "pending_calls",
      header: "NOT CALLED / PENDING",
      render: (row) => (
        <span className="font-semibold text-amber-700">{row.pending_calls || 0}</span>
      ),
    },
    {
      key: "interested_leads",
      header: "INTERESTED LEADS",
      render: (row) => (
        <span className="font-bold text-emerald-600">{row.interested_leads || 0}</span>
      ),
    },
    {
      key: "not_interested_leads",
      header: "NOT INTERESTED",
      render: (row) => (
        <span className="font-medium text-rose-600">{row.not_interested_leads || 0}</span>
      ),
    },
    {
      key: "followups_count",
      header: "FOLLOW-UPS LOGGED",
      render: (row) => (
        <span className="font-bold text-purple-700">{row.followups_count || 0}</span>
      ),
    },
  ];

  // Columns for Activity History Logs
  const logColumns: ColumnDef[] = [
    {
      key: "type",
      header: "ACTIVITY TYPE",
      searchPlaceholder: "Search type...",
      render: (row) => <span className="font-bold text-gray-900 capitalize">{row.type || "Call"}</span>,
    },
    {
      key: "description",
      header: "DESCRIPTION",
      searchPlaceholder: "Search description...",
      render: (row) => row.description || "N/A",
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "completed").toLowerCase();
        const color = s === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.status || "Completed"}</span>;
      },
    },
    {
      key: "scheduled_date",
      header: "DATE & TIME",
      render: (row) => (row.scheduled_date ? new Date(row.scheduled_date).toLocaleString("en-IN") : "N/A"),
    },
    {
      key: "user_name",
      header: "PERFORMED BY",
      render: (row) => row.user_name || "Agent",
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
