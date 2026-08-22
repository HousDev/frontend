// frontend/src/components/reports/TransactionReportTab.tsx
import React from "react";
import { ReportTable, ColumnDef } from "./ReportTable";

interface TransactionReportTabProps {
  data: any[];
  stats?: { total_count: number; total_amount: number };
  loading?: boolean;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
}

export const TransactionReportTab: React.FC<TransactionReportTabProps> = ({
  data = [],
  stats = { total_count: 0, total_amount: 0 },
  loading = false,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
}) => {
  const columns: ColumnDef[] = [
    {
      key: "receipt_id",
      header: "RECEIPT ID",
      searchPlaceholder: "Search receipt...",
      render: (row) => <span className="font-bold text-gray-900">{row.receipt_id || `REC-${row.id}`}</span>,
    },
    {
      key: "amount",
      header: "AMOUNT (₹)",
      render: (row) => (
        <span className="font-bold text-emerald-700">
          ₹{Number(row.amount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "payment_date",
      header: "PAYMENT DATE",
      render: (row) => (row.payment_date ? new Date(row.payment_date).toLocaleDateString("en-IN") : "N/A"),
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || row.payment_status || "completed").toLowerCase();
        const color = s === "completed" || s === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.status || "Completed"}</span>;
      },
    },
    {
      key: "created_by_name",
      header: "CREATED BY",
      render: (row) => row.created_by_name || "Admin",
    },
  ];

  return (
    <ReportTable
      title="Transactions Report"
      columns={columns}
      data={data}
      onOpenFilters={onOpenFilters}
      onExport={onExport}
      onRefresh={onRefresh}
      onPrint={onPrint}
      pagination={{ page: 1, limit: 100, totalRecords: data.length, totalPages: 1 }}
      onPageChange={() => {}}
      onLimitChange={() => {}}
      loading={loading}
    />
  );
};
