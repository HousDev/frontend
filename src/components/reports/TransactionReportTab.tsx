// frontend/src/components/reports/TransactionReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import Button from "@/components/ui/Button";
import {
  IndianRupee,
  Filter,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Eye,
  Award,
  Sparkles,
  TrendingUp,
  XCircle,
  AlertTriangle,
  Users,
  Building,
  FileText,
  CreditCard,
  X,
  PieChart,
  Layers,
  BarChart3,
  RotateCcw,
} from "lucide-react";

interface TransactionReportTabProps {
  data: any[];
  stats?: any;
  overview?: any;
  statusBreakdown?: any[];
  transactionTypeBreakdown?: any[];
  paymentMethodBreakdown?: any[];
  partyBreakdown?: any[];
  amountTiers?: any[];
  propertyBreakdown?: any[];
  executiveBreakdown?: any[];
  topTransactions?: any[];
  trends?: any[];
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
  onFilterByStatus?: (status: string) => void;
}

export const TransactionReportTab: React.FC<TransactionReportTabProps> = ({
  data = [],
  stats = {},
  overview = {},
  statusBreakdown = [],
  transactionTypeBreakdown = [],
  paymentMethodBreakdown = [],
  partyBreakdown = [],
  amountTiers = [],
  propertyBreakdown = [],
  executiveBreakdown = [],
  topTransactions = [],
  trends = [],
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
  onFilterByStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "transactions" | "collections" | "payment_analysis" | "party_property">("overview");
  const [selectedTransactionDrawer, setSelectedTransactionDrawer] = useState<any | null>(null);

  const safeStats = stats || overview || {};
  const safeStatusList = Array.isArray(statusBreakdown) ? statusBreakdown : [];
  const safeTypeList = Array.isArray(transactionTypeBreakdown) ? transactionTypeBreakdown : [];
  const safeMethodList = Array.isArray(paymentMethodBreakdown) ? paymentMethodBreakdown : [];
  const safePartyList = Array.isArray(partyBreakdown) ? partyBreakdown : [];
  const safePropertyList = Array.isArray(propertyBreakdown) ? propertyBreakdown : [];
  const safeExecList = Array.isArray(executiveBreakdown) ? executiveBreakdown : [];
  const safeTiers = Array.isArray(amountTiers) ? amountTiers : [];

  const statusPills: StatusPill[] = [
    { label: "All Receipts", key: "all", count: safeStats.total_count || data.length },
    { label: "Cleared", key: "cleared", count: (safeStatusList.find((s) => s.status === "cleared") || {}).count || 0 },
    { label: "Received", key: "received", count: (safeStatusList.find((s) => s.status === "received") || {}).count || 0 },
    { label: "Pending", key: "pending", count: (safeStatusList.find((s) => s.status === "pending") || {}).count || 0 },
    { label: "Bounced", key: "bounced", count: (safeStatusList.find((s) => s.status === "bounced") || {}).count || 0 },
    { label: "Refunded", key: "refunded", count: (safeStatusList.find((s) => s.status === "refunded") || {}).count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "receipt_id",
      header: "RECEIPT ID",
      searchPlaceholder: "Search receipt...",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {row.receipt_id || `REC-${row.id}`}
        </span>
      ),
    },
    {
      key: "payment_date",
      header: "PAYMENT DATE",
      render: (row) => (
        <span className="font-medium text-slate-700 text-xs">
          {row.payment_date ? new Date(row.payment_date).toLocaleDateString("en-IN") : "—"}
        </span>
      ),
    },
    {
      key: "type",
      header: "TYPE",
      render: (row) => (
        <span className="capitalize font-semibold text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.type || "Sale"}
        </span>
      ),
    },
    {
      key: "related_party",
      header: "PARTY & NAME",
      render: (row) => {
        const partyName = row.buyer_name || row.seller_name || row.related_party || "Client";
        return (
          <div>
            <div className="font-bold text-slate-900 text-xs">{partyName}</div>
            <div className="text-[11px] text-teal-700 font-medium capitalize">{row.related_party || "buyer"}</div>
          </div>
        );
      },
    },
    {
      key: "property_address",
      header: "PROPERTY",
      render: (row) => (
        <div className="max-w-[180px] truncate font-medium text-slate-800 text-xs" title={row.property_address || "N/A"}>
          {row.property_address || "—"}
        </div>
      ),
    },
    {
      key: "deal_value",
      header: "DEAL VALUE",
      render: (row) => (
        <span className="font-semibold text-slate-600 text-xs">
          ₹{Number(row.deal_value || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "amount",
      header: "AMOUNT COLLECTED",
      render: (row) => (
        <span className="font-black text-emerald-700 text-xs">
          ₹{Number(row.amount || 0).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      key: "payment_type",
      header: "METHOD",
      render: (row) => (
        <span className="uppercase text-[11px] font-bold text-slate-700">
          {row.payment_type || "Cash"}
        </span>
      ),
    },
    {
      key: "payment_status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.payment_status || row.status || "pending").toLowerCase();
        const color = s.includes("cleared") || s.includes("received")
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : s.includes("pending")
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : s.includes("bounced") || s.includes("refunded") || s.includes("cancelled")
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-slate-50 text-slate-700 border-slate-200";
        return (
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border uppercase ${color}`}>
            {row.payment_status || row.status || "Pending"}
          </span>
        );
      },
    },
    {
      key: "action",
      header: "VIEW",
      width: "50px",
      className: "w-[50px] text-center",
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedTransactionDrawer(row)}
          className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200 shrink-0 shadow-2xs"
          title="View receipt details"
        >
          <Eye className="w-4 h-4 text-teal-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* SUB-TABS & ACTION BUTTONS HEADER */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "overview" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("transactions")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "transactions" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Transactions
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("collections")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "collections" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Collections
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("payment_analysis")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "payment_analysis" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Payment Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("party_property")}
            className={`px-3 py-1.5 rounded-md transition-all ${activeSubTab === "party_property" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
          >
            Party & Property Analysis
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeStatusPill && !["all", "total"].includes(activeStatusPill.toLowerCase()) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectStatusPill && onSelectStatusPill("all")}
              className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-all animate-in fade-in duration-150"
              title="Click to unfilter and view all transactions"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              Unfilter
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={onOpenFilters}
            className="flex items-center gap-1.5 text-xs text-white bg-[#0f2b3d] hover:bg-[#1a435d] font-bold px-3 py-1.5 rounded-lg shadow-xs border-0"
          >
            <Filter className="w-3.5 h-3.5 text-white" />
            Filter
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-700" />
            Export
          </Button>

          {onPrint && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-700" />
              Print
            </Button>
          )}
        </div>
      </div>

      {/* 1. OVERVIEW SUB-TAB */}
      {activeSubTab === "overview" && (
        <div className="space-y-3.5">
          {/* FINANCIAL STATUS & TRANSACTION TYPE BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Financial Status Breakdown */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Financial Status Breakdown
              </h3>

              <div className="space-y-2 text-xs">
                {safeStatusList.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => onFilterByStatus && onFilterByStatus(st.status)}
                    className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <span className="font-bold text-slate-900 uppercase">{st.status} ({st.count})</span>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900">₹{Number(st.amount || 0).toLocaleString("en-IN")}</span>
                      <span className="font-bold text-emerald-700 text-[11px]">{st.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Type Breakdown */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-600" />
                Transaction Type Revenue Distribution
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {safeTypeList.map((tp: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="font-bold text-slate-900 uppercase text-[11px]">{tp.type}</div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-extrabold text-indigo-900">₹{Number(tp.amount || 0).toLocaleString("en-IN")}</span>
                      <span className="font-bold text-indigo-700">{tp.count} rec</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN TRANSACTION DIRECTORY TABLE */}
          <ReportTable
            title="Payment & Transaction Directory"
            columns={columns}
            data={data}
            statusPills={statusPills}
            activeStatusPill={activeStatusPill}
            onSelectStatusPill={onSelectStatusPill}
            onOpenFilters={onOpenFilters}
            onExport={onExport}
            onRefresh={onRefresh}
            onPrint={onPrint}
            hideHeaderButtons={true}
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            loading={loading}
          />
        </div>
      )}

      {/* 2. TRANSACTIONS DIRECTORY SUB-TAB */}
      {activeSubTab === "transactions" && (
        <div className="space-y-6">
          <ReportTable
            title="Operational Payment Receipts Directory"
            columns={columns}
            data={data}
            statusPills={statusPills}
            activeStatusPill={activeStatusPill}
            onSelectStatusPill={onSelectStatusPill}
            onOpenFilters={onOpenFilters}
            onExport={onExport}
            onRefresh={onRefresh}
            onPrint={onPrint}
            hideHeaderButtons={true}
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            loading={loading}
          />
        </div>
      )}

      {/* 3. COLLECTIONS SUB-TAB */}
      {activeSubTab === "collections" && (
        <div className="space-y-6">
          {/* MONEY MOVEMENT FOCUS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-2xs space-y-1">
              <div className="font-bold text-teal-700 uppercase">Cleared Collections</div>
              <div className="text-2xl font-black text-teal-950">₹{Number(safeStats.cleared_amount || 0).toLocaleString("en-IN")}</div>
              <div className="text-slate-500 font-medium">Bank realized funds</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-1">
              <div className="font-bold text-blue-700 uppercase">Received In Hand</div>
              <div className="text-2xl font-black text-blue-950">₹{Number(safeStats.received_amount || 0).toLocaleString("en-IN")}</div>
              <div className="text-slate-500 font-medium">Token & advances received</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-1">
              <div className="font-bold text-amber-700 uppercase">Pending Clearance</div>
              <div className="text-2xl font-black text-amber-950">₹{Number(safeStats.pending_amount || 0).toLocaleString("en-IN")}</div>
              <div className="text-slate-500 font-medium">Under processing</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-1">
              <div className="font-bold text-rose-700 uppercase">Bounced / Refunded</div>
              <div className="text-2xl font-black text-rose-950">
                ₹{Number((safeStats.bounced_amount || 0) + (safeStats.refunded_amount || 0)).toLocaleString("en-IN")}
              </div>
              <div className="text-slate-500 font-medium">Non-realized funds</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYMENT ANALYSIS SUB-TAB */}
      {activeSubTab === "payment_analysis" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Method Distribution */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-teal-600" />
                Payment Method Channel Distribution
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                      <th className="p-2.5">Payment Method</th>
                      <th className="p-2.5 text-center">Receipts</th>
                      <th className="p-2.5 text-right">Total Amount</th>
                      <th className="p-2.5 text-center font-bold text-teal-700">Share %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeMethodList.map((m: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900 uppercase">{m.method}</td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{m.count}</td>
                        <td className="p-2.5 text-right font-extrabold text-emerald-800">₹{Number(m.amount || 0).toLocaleString("en-IN")}</td>
                        <td className="p-2.5 text-center font-bold text-teal-700">{m.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Amount Range Tiers */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Transaction Size Bucket Breakdown
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                      <th className="p-2.5">Amount Range Tier</th>
                      <th className="p-2.5 text-center">Count</th>
                      <th className="p-2.5 text-right">Aggregated Amount</th>
                      <th className="p-2.5 text-center font-bold text-indigo-700">Share %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeTiers.map((t: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900">{t.tier}</td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{t.count}</td>
                        <td className="p-2.5 text-right font-extrabold text-indigo-900">₹{Number(t.amount || 0).toLocaleString("en-IN")}</td>
                        <td className="p-2.5 text-center font-bold text-indigo-700">{t.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PARTY & PROPERTY ANALYSIS SUB-TAB */}
      {activeSubTab === "party_property" && (
        <div className="space-y-6">
          {/* PARTY BREAKDOWN MATRIX */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              Related Party Collection Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-2.5">Related Party</th>
                    <th className="p-2.5 text-center">Receipts</th>
                    <th className="p-2.5 text-right">Total Amount</th>
                    <th className="p-2.5 text-right font-bold text-teal-700">Cleared</th>
                    <th className="p-2.5 text-right font-bold text-amber-700">Pending</th>
                    <th className="p-2.5 text-right font-bold text-indigo-700">Commission</th>
                    <th className="p-2.5 text-center">Avg Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safePartyList.map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 uppercase">{p.party}</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{p.count}</td>
                      <td className="p-2.5 text-right font-extrabold text-slate-900">₹{Number(p.amount || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-bold text-teal-700">₹{Number(p.cleared_amount || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-bold text-amber-700">₹{Number(p.pending_amount || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-bold text-indigo-700">₹{Number(p.commission_amount || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-center font-semibold text-slate-700">₹{Number(p.avg_amount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOP PROPERTIES LEADERBOARD */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-600" />
              Top Properties Generating Highest Financial Value
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-2.5 text-center">Rank</th>
                    <th className="p-2.5">Property Address</th>
                    <th className="p-2.5 text-center">Transactions</th>
                    <th className="p-2.5 text-right">Deal Value</th>
                    <th className="p-2.5 text-right">Amount Collected</th>
                    <th className="p-2.5 text-right font-bold text-indigo-700">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safePropertyList.map((pr: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-extrabold text-slate-500">#{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{pr.property_address}</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{pr.transaction_count}</td>
                      <td className="p-2.5 text-right font-semibold text-slate-600">₹{Number(pr.deal_value || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-extrabold text-emerald-800">₹{Number(pr.total_amount || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-bold text-indigo-700">₹{Number(pr.commission_amount || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  {safePropertyList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400 italic">No property financial records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAIL MODAL / DRAWER */}
      {selectedTransactionDrawer && (
        <div
          onClick={() => setSelectedTransactionDrawer(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5 text-xs text-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {selectedTransactionDrawer.receipt_id || `REC-${selectedTransactionDrawer.id}`}
                  </span>
                  <span className="font-medium text-[11px] text-teal-700 uppercase">
                    {selectedTransactionDrawer.type || "Sale"} Receipt
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransactionDrawer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Party Type</div>
                <div className="font-bold text-slate-900 capitalize">{selectedTransactionDrawer.related_party || "buyer"}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Party Name</div>
                <div className="font-bold text-indigo-700">{selectedTransactionDrawer.buyer_name || selectedTransactionDrawer.seller_name || "Client"}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Payment Method</div>
                <div className="font-bold text-slate-900 uppercase">{selectedTransactionDrawer.payment_type || "Cash"}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Payment Status</div>
                <div className="font-bold text-emerald-700 uppercase">{selectedTransactionDrawer.payment_status || "Pending"}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Property Address</div>
              <div className="font-semibold text-slate-900">{selectedTransactionDrawer.property_address || "N/A"}</div>
            </div>

            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900">Transaction Amount Collected</span>
              <span className="font-black text-emerald-950 text-sm">₹{Number(selectedTransactionDrawer.amount || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-xs">
              <span className="font-bold text-indigo-900">Associated Deal Value</span>
              <span className="font-black text-indigo-950 text-sm">₹{Number(selectedTransactionDrawer.deal_value || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setSelectedTransactionDrawer(null)}
                className="text-xs bg-slate-800 text-white font-bold"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
