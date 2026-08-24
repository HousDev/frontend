// frontend/src/components/reports/TenantReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface TenantReportTabProps {
  data: any[];
  stats?: {
    total_count?: number;
    active_count?: number;
    vacated_count?: number;
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

export const TenantReportTab: React.FC<TenantReportTabProps> = ({
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
  const safeStats = stats || { total_count: 0, active_count: 0, vacated_count: 0 };

  const statusPills: StatusPill[] = [
    { label: "All Tenants", key: "all", count: safeStats.total_count || 0 },
    { label: "Active", key: "active", count: safeStats.active_count || 0 },
    { label: "Vacated / Inactive", key: "vacated", count: safeStats.vacated_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "TENANT NAME",
      searchPlaceholder: "Search tenant...",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900">{row.name || "N/A"}</div>
          <div className="text-[11px] text-gray-400">ID: {row.tenant_id || `TNT-${row.id}`}</div>
        </div>
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
      key: "preferred_location",
      header: "LOCATION & BHK",
      searchPlaceholder: "Search location...",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-800">{row.preferred_location || "N/A"}</div>
          <div className="text-[11px] text-gray-500">{row.preferred_bhk || "2 BHK"} • {row.tenant_type || "Family"}</div>
        </div>
      ),
    },
    {
      key: "budget_max",
      header: "BUDGET RANGE (₹)",
      render: (row) => (
        <span className="font-semibold text-emerald-700">
          ₹{Number(row.budget_min || 0).toLocaleString("en-IN")} - ₹{Number(row.budget_max || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "active").toLowerCase();
        const color = s.includes("occupied") || s.includes("active")
          ? "bg-teal-100 text-teal-800"
          : "bg-gray-100 text-gray-800";
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
      title="Tenants Report"
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
