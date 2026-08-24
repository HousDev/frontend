// frontend/src/components/reports/SellerReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface SellerReportTabProps {
  data: any[];
  stats?: { total_count: number; active_count: number; sold_count: number } | null;
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

export const SellerReportTab: React.FC<SellerReportTabProps> = ({
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
  const safeStats = stats || { total_count: 0, active_count: 0, sold_count: 0 };

  const statusPills: StatusPill[] = [
    { label: "All Sellers", key: "all", count: safeStats.total_count || 0 },
    { label: "Active", key: "active", count: safeStats.active_count || 0 },
    { label: "Sold / Closed", key: "sold", count: safeStats.sold_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "SELLER NAME",
      searchPlaceholder: "Search seller...",
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
      header: "PROPERTY LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => row.location || row.city || "N/A",
    },
    {
      key: "expected_price",
      header: "EXPECTED PRICE",
      searchPlaceholder: "Search price...",
      render: (row) => (
        <span className="font-semibold text-emerald-700">
          ₹{Number(row.expected_price || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "days_listed",
      header: "DAYS LISTED",
      searchPlaceholder: "Search days...",
      render: (row) => <span className="font-medium text-gray-700">{row.days_listed !== undefined ? `${row.days_listed} days` : "N/A"}</span>,
    },
    {
      key: "seller_lead_status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.seller_lead_status || "active").toLowerCase();
        const color = s.includes("sold") || s.includes("closed")
          ? "bg-emerald-100 text-emerald-800"
          : "bg-blue-100 text-blue-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.seller_lead_status || "Active"}</span>;
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
      title="Sellers Report"
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
