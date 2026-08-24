// frontend/src/components/reports/PropertyReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface PropertyReportTabProps {
  data: any[];
  stats?: { total_count: number; active_count: number; sold_count: number; stale_count: number } | null;
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

export const PropertyReportTab: React.FC<PropertyReportTabProps> = ({
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
  const safeStats = stats || { total_count: 0, active_count: 0, sold_count: 0, stale_count: 0 };

  const statusPills: StatusPill[] = [
    { label: "All Properties", key: "all", count: safeStats.total_count || 0 },
    { label: "Active", key: "active", count: safeStats.active_count || 0 },
    { label: "Sold / Closed", key: "sold", count: safeStats.sold_count || 0 },
    { label: "Stale (>90d)", key: "stale", count: safeStats.stale_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "society_name",
      header: "PROPERTY / SOCIETY",
      searchPlaceholder: "Search property...",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900">{row.society_name || row.seller_name || "N/A"}</div>
          <div className="text-[11px] text-gray-400">{row.property_type_name || "Residential"} • {row.bedrooms || 1} BHK</div>
        </div>
      ),
    },
    {
      key: "location_name",
      header: "LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => row.location_name || row.city_name || "N/A",
    },
    {
      key: "final_price",
      header: "FINAL PRICE (₹)",
      render: (row) => (
        <span className="font-semibold text-emerald-700">
          ₹{Number(row.final_price || row.budget || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "carpet_area",
      header: "CARPET AREA",
      render: (row) => (row.carpet_area ? `${row.carpet_area} sq.ft` : "N/A"),
    },
    {
      key: "days_on_market",
      header: "DAYS ON MARKET",
      render: (row) => (row.days_on_market !== undefined ? `${row.days_on_market} days` : "N/A"),
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "active").toLowerCase();
        const color = s.includes("sold") || s.includes("closed")
          ? "bg-emerald-100 text-emerald-800"
          : s.includes("active") || s.includes("available")
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
      title="Properties Report"
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
