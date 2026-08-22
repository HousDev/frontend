// frontend/src/components/reports/OwnerReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface OwnerReportTabProps {
  data: any[];
  stats?: {
    total_count?: number;
    active_count?: number;
    closed_count?: number;
  } | null;
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

export const OwnerReportTab: React.FC<OwnerReportTabProps> = ({
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
  const safeStats = stats || { total_count: 0, active_count: 0, closed_count: 0 };

  const statusPills: StatusPill[] = [
    { label: "All Owners", key: "all", count: safeStats.total_count || 0 },
    { label: "Active", key: "active", count: safeStats.active_count || 0 },
    { label: "Closed / Rented", key: "closed", count: safeStats.closed_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "OWNER NAME",
      searchPlaceholder: "Search owner...",
      render: (row) => (
        <span className="font-bold text-gray-900">
          {row.salutation ? `${row.salutation} ` : ""}{row.name || "N/A"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "CONTACT",
      searchPlaceholder: "Search contact...",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-800">{row.phone || "N/A"}</div>
          <div className="text-[11px] text-gray-400">{row.email || ""}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "CITY / LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => row.location || row.city || "N/A",
    },
    {
      key: "deal_value",
      header: "EXPECTED DEAL VALUE (₹)",
      render: (row) => (
        <span className="font-semibold text-emerald-700">
          ₹{Number(row.deal_value || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "active").toLowerCase();
        const color = s.includes("closed") || s.includes("rented")
          ? "bg-purple-100 text-purple-800"
          : "bg-teal-100 text-teal-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.status || "Active"}</span>;
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED AGENT",
      render: (row) => row.assigned_agent_name || "Unassigned",
    },
  ];

  return (
    <ReportTable
      title="Owners Report"
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
