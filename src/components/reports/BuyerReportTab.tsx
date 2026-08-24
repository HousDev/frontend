// frontend/src/components/reports/BuyerReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface BuyerReportTabProps {
  data: any[];
  stats?: { total_count: number; active_count: number; qualified_count: number; converted_count: number } | null;
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

export const BuyerReportTab: React.FC<BuyerReportTabProps> = ({
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
  const safeStats = stats || { total_count: 0, active_count: 0, qualified_count: 0, converted_count: 0 };

  const statusPills: StatusPill[] = [
    { label: "All Buyers", key: "all", count: safeStats.total_count || 0 },
    { label: "Active", key: "active", count: safeStats.active_count || 0 },
    { label: "Qualified", key: "qualified", count: safeStats.qualified_count || 0 },
    { label: "Converted", key: "converted", count: safeStats.converted_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "BUYER NAME",
      searchPlaceholder: "Search buyer...",
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
      header: "LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => row.location || row.city || "N/A",
    },
    {
      key: "budget_min",
      header: "BUDGET RANGE (₹)",
      render: (row) => (
        <span className="font-semibold text-emerald-700">
          ₹{Number(row.budget_min || 0).toLocaleString("en-IN")} - ₹{Number(row.budget_max || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "buyer_lead_status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.buyer_lead_status || "active").toLowerCase();
        const color = s.includes("qualif")
          ? "bg-purple-100 text-purple-800"
          : s.includes("closed") || s.includes("converted")
          ? "bg-emerald-100 text-emerald-800"
          : "bg-blue-100 text-blue-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.buyer_lead_status || "Active"}</span>;
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
      title="Buyers Report"
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
