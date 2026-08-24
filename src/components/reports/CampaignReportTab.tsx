// frontend/src/components/reports/CampaignReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface CampaignReportTabProps {
  campaigns: any[];
  stats?: { total_campaigns: number; total_audience: number } | null;
  loading?: boolean;
  onOpenFilters?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
}

export const CampaignReportTab: React.FC<CampaignReportTabProps> = ({
  campaigns = [],
  stats,
  loading = false,
  onOpenFilters = () => {},
  onExport = () => {},
  onRefresh,
  onPrint = () => {},
}) => {
  const [activeStatusPill, setActiveStatusPill] = useState<string>("all");

  const safeStats = stats || { total_campaigns: 0, total_audience: 0 };

  const statusPills: StatusPill[] = [
    { label: "Total Campaigns", key: "all", count: safeStats.total_campaigns || campaigns.length },
    { label: "Total Audience", key: "audience", count: safeStats.total_audience || 0 },
  ];

  const filteredCampaigns = campaigns.filter((row) => {
    if (activeStatusPill === "audience") {
      const audienceCount = Number(row.total_leads || row.total_contacts || row.sent_count || row.delivered_count || 0);
      return audienceCount > 0;
    }
    return true;
  });

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "CAMPAIGN NAME",
      searchPlaceholder: "Search campaign...",
      render: (row) => <span className="font-bold text-gray-900">{row.name || `Campaign #${row.id}`}</span>,
    },
    {
      key: "type",
      header: "TYPE",
      searchPlaceholder: "Search type...",
      render: (row) => <span className="capitalize text-gray-700 font-medium">{row.type || "Broadcast"}</span>,
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "completed").toLowerCase();
        const color = s === "completed" ? "bg-emerald-100 text-emerald-800" : s === "running" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.status || "Completed"}</span>;
      },
    },
    {
      key: "total_leads",
      header: "TOTAL AUDIENCE",
      render: (row) => <span className="font-bold text-gray-900">{row.total_leads || row.total_contacts || 0}</span>,
    },
    {
      key: "sent_count",
      header: "SENT",
      render: (row) => <span className="font-medium text-blue-700">{row.sent_count || 0}</span>,
    },
    {
      key: "delivered_count",
      header: "DELIVERED",
      render: (row) => <span className="font-medium text-teal-700">{row.delivered_count || 0}</span>,
    },
    {
      key: "read_count",
      header: "READ",
      render: (row) => <span className="font-medium text-purple-700">{row.read_count || 0}</span>,
    },
    {
      key: "failed_count",
      header: "FAILED",
      render: (row) => <span className="font-semibold text-rose-600">{row.failed_count || 0}</span>,
    },
    {
      key: "created_at",
      header: "CREATED DATE",
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "N/A"),
    },
  ];

  return (
    <ReportTable
      title="Broadcast Campaigns Report"
      columns={columns}
      data={filteredCampaigns}
      statusPills={statusPills}
      activeStatusPill={activeStatusPill}
      onSelectStatusPill={(key) => setActiveStatusPill(key)}
      onOpenFilters={onOpenFilters}
      onExport={onExport}
      onRefresh={onRefresh}
      onPrint={onPrint}
      pagination={{ page: 1, limit: 100, totalRecords: filteredCampaigns.length, totalPages: 1 }}
      onPageChange={() => {}}
      onLimitChange={() => {}}
      loading={loading}
    />
  );
};
