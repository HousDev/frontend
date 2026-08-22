// frontend/src/components/reports/PropertyVisitReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface PropertyVisitReportTabProps {
  data: any[];
  stats?: { total_count: number; completed_count: number; scheduled_count: number; cancelled_count: number } | null;
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
}

export const PropertyVisitReportTab: React.FC<PropertyVisitReportTabProps> = ({
  data = [],
  stats,
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
  const safeStats = stats || { total_count: 0, completed_count: 0, scheduled_count: 0, cancelled_count: 0 };

  const statusPills: StatusPill[] = [
    { label: "All Visits", key: "all", count: safeStats.total_count || 0 },
    { label: "Completed", key: "completed", count: safeStats.completed_count || 0 },
    { label: "Scheduled", key: "scheduled", count: safeStats.scheduled_count || 0 },
    { label: "Cancelled", key: "cancelled", count: safeStats.cancelled_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "buyer_name",
      header: "BUYER NAME",
      searchPlaceholder: "Search buyer...",
      render: (row) => <span className="font-bold text-gray-900">{row.buyer_name || "N/A"}</span>,
    },
    {
      key: "property_title",
      header: "PROPERTY TITLE",
      searchPlaceholder: "Search property...",
      render: (row) => row.property_title || "N/A",
    },
    {
      key: "visit_datetime",
      header: "VISIT DATE & TIME",
      render: (row) => (row.visit_datetime ? new Date(row.visit_datetime).toLocaleString("en-IN") : "N/A"),
    },
    {
      key: "visit_type",
      header: "VISIT TYPE",
      render: (row) => <span className="capitalize text-gray-700 font-medium">{row.visit_type || "In-Person"}</span>,
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "scheduled").toLowerCase();
        const color = s === "completed" ? "bg-emerald-100 text-emerald-800" : s === "scheduled" ? "bg-purple-100 text-purple-800" : "bg-rose-100 text-rose-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.status || "Scheduled"}</span>;
      },
    },
    {
      key: "executive_name",
      header: "CONDUCTED BY",
      render: (row) => row.executive_name || "Agent",
    },
  ];

  return (
    <ReportTable
      title="Property Visits Report"
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
  );
};
