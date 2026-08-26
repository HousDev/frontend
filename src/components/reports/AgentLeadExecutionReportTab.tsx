// frontend/src/components/reports/AgentLeadExecutionReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import { UserCheck } from "lucide-react";

interface AgentLeadExecutionReportTabProps {
  agents: any[];
  stats?: { total_agents: number; total_assigned_leads: number; total_converted: number } | null;
  loading?: boolean;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
}

export const AgentLeadExecutionReportTab: React.FC<AgentLeadExecutionReportTabProps> = ({
  agents = [],
  stats,
  loading = false,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
}) => {
  const [activeStatusPill, setActiveStatusPill] = React.useState<string>("all");

  const safeStats = stats || { total_agents: 0, total_assigned_leads: 0, total_converted: 0 };

  const totalCalls = agents.reduce((acc, curr) => acc + Number(curr.callsCompleted || 0), 0);
  const totalInterested = agents.reduce((acc, curr) => acc + Number(curr.interestedLeads || 0), 0);

  const statusPills: StatusPill[] = [
    { label: "Total Agents", key: "all", count: agents.length },
    { label: "Assigned Leads", key: "assigned", count: safeStats.total_assigned_leads || 0 },
    { label: "Calls Completed", key: "calls", count: totalCalls },
    { label: "Interested Leads", key: "interested", count: totalInterested },
    { label: "Converted Deals", key: "converted", count: safeStats.total_converted || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "agentName",
      header: "AGENT NAME & ROLE",
      searchPlaceholder: "Search agent...",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900 flex items-center gap-2">
            {row.agentName}
          </div>
          <div className="text-[11px] text-gray-400 capitalize">{row.role || "Agent"} | {row.department || "Sales"}</div>
        </div>
      ),
    },
    {
      key: "assignedLeads",
      header: "ASSIGNED LEADS",
      render: (row) => <span className="font-bold text-gray-900">{row.assignedLeads}</span>,
    },
    {
      key: "callsCompleted",
      header: "CALLS COMPLETED",
      render: (row) => (
        <span className="font-medium text-blue-700">{row.callsCompleted}</span>
      ),
    },
    {
      key: "interestedLeads",
      header: "INTERESTED LEADS",
      render: (row) => (
        <span className="font-medium text-purple-700">{row.interestedLeads}</span>
      ),
    },
    {
      key: "convertedDeals",
      header: "CONVERTED DEALS",
      render: (row) => (
        <span className="font-bold text-emerald-600">{row.convertedDeals}</span>
      ),
    },
    {
      key: "conversionRate",
      header: "CONVERSION RATE",
      render: (row) => (
        <span className="font-bold text-navy-900">{row.conversionRate}%</span>
      ),
    },
    {
      key: "efficiencyRating",
      header: "PERFORMANCE RATING",
      render: (row) => {
        const rating = row.efficiencyRating || "Average";
        const color = rating === "High Performance" ? "bg-emerald-100 text-emerald-800" : rating === "Average" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{rating}</span>;
      },
    },
  ];

  return (
    <ReportTable
      title="Agent Lead Execution Report"
      columns={columns}
      data={agents}
      statusPills={statusPills}
      activeStatusPill={activeStatusPill}
      onSelectStatusPill={(key) => setActiveStatusPill(key)}
      onOpenFilters={onOpenFilters}
      onExport={onExport}
      onRefresh={onRefresh}
      onPrint={onPrint}
      pagination={{ page: 1, limit: 100, totalRecords: agents.length, totalPages: 1 }}
      onPageChange={() => {}}
      onLimitChange={() => {}}
      loading={loading}
    />
  );
};
