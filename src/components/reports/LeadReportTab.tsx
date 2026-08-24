// frontend/src/components/reports/LeadReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";

interface LeadReportTabProps {
  data: any[];
  stats?: { total_count: number; new_count: number; contacted_count: number; qualified_count: number; unqualified_count: number } | null;
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

export const LeadReportTab: React.FC<LeadReportTabProps> = ({
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
  const safeStats = stats || { total_count: 0, new_count: 0, contacted_count: 0, qualified_count: 0, unqualified_count: 0 };

  const statusPills: StatusPill[] = [
    { label: "All", key: "all", count: safeStats.total_count || 0 },
    { label: "New", key: "new", count: safeStats.new_count || 0 },
    { label: "Contacted", key: "contacted", count: safeStats.contacted_count || 0 },
    { label: "Qualified", key: "qualified", count: safeStats.qualified_count || 0 },
    { label: "Unqualified", key: "unqualified", count: safeStats.unqualified_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "NAME",
      searchPlaceholder: "Search name...",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900">
            {row.salutation ? `${row.salutation} ` : ""}{row.name || "N/A"}
          </div>
          <div className="text-[11px] text-gray-400">Type: {row.lead_type || "Buyer"}</div>
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
      key: "city",
      header: "CITY / LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => row.city || row.location || "N/A",
    },
    {
      key: "lead_source",
      header: "SOURCE",
      searchPlaceholder: "Search source...",
      render: (row) => <span className="font-medium text-gray-700">{row.lead_source || "Direct"}</span>,
    },
    {
      key: "priority",
      header: "PRIORITY",
      searchPlaceholder: "Search priority...",
      render: (row) => {
        const p = (row.priority || "normal").toLowerCase();
        const color = p === "high" ? "bg-rose-100 text-rose-800" : p === "medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800";
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>{row.priority || "Normal"}</span>;
      },
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "new").toLowerCase();
        const color = s.includes("qualif")
          ? "bg-purple-100 text-purple-800"
          : s.includes("closed") || s.includes("won")
          ? "bg-emerald-100 text-emerald-800"
          : "bg-gray-100 text-gray-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.status || "New"}</span>;
      },
    },
    {
      key: "assigned_executive_name",
      header: "ASSIGNED AGENT",
      render: (row) => row.assigned_executive_name || "Unassigned",
    },
  ];

  return (
    <ReportTable
      title="Leads Report"
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
