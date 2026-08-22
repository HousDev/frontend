// frontend/src/components/reports/AgentReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import { Award, UserCheck } from "lucide-react";

interface AgentReportTabProps {
  agents: any[];
  loading?: boolean;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
}

export const AgentReportTab: React.FC<AgentReportTabProps> = ({
  agents = [],
  loading = false,
  onOpenFilters,
  onExport,
  onRefresh,
}) => {
  const statusPills: StatusPill[] = [
    { label: "Total Agents", key: "all", count: agents.length },
    { label: "Active", key: "active", count: agents.length },
  ];

  const columns: ColumnDef[] = [
    {
      key: "agentName",
      header: "AGENT NAME",
      searchPlaceholder: "Search agent...",
      render: (row) => (
        <div className="font-bold text-gray-900 flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          {row.agentName}
        </div>
      ),
    },
    {
      key: "department",
      header: "DEPARTMENT",
      searchPlaceholder: "Search department...",
      render: (row) => <span className="font-medium text-gray-700">{row.department || "Sales"}</span>,
    },
    {
      key: "assignedLeads",
      header: "ASSIGNED LEADS",
      render: (row) => <span className="font-bold text-gray-800">{row.assignedLeads}</span>,
    },
    {
      key: "qualifiedLeads",
      header: "QUALIFIED LEADS",
      render: (row) => <span className="font-bold text-purple-700">{row.qualifiedLeads}</span>,
    },
    {
      key: "closedDeals",
      header: "CLOSED DEALS",
      render: (row) => <span className="font-bold text-emerald-600">{row.closedDeals}</span>,
    },
    {
      key: "lostDeals",
      header: "LOST DEALS",
      render: (row) => <span className="font-bold text-rose-600">{row.lostDeals}</span>,
    },
    {
      key: "conversionRate",
      header: "CONVERSION RATE (%)",
      render: (row) => <span className="font-bold text-blue-600">{row.conversionRate}%</span>,
    },
  ];

  return (
    <ReportTable
      columns={columns}
      data={agents}
      statusPills={statusPills}
      onOpenFilters={onOpenFilters}
      onExport={onExport}
      onRefresh={onRefresh}
      pagination={{ page: 1, limit: 50, totalRecords: agents.length, totalPages: 1 }}
      onPageChange={() => {}}
      onLimitChange={() => {}}
      loading={loading}
    />
  );
};
