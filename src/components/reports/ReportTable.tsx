// frontend/src/components/reports/ReportTable.tsx
import React, { useState } from "react";
import { Download, Filter, RefreshCw, Printer, X, RotateCcw } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";

export interface ColumnDef {
  key: string;
  header: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  width?: string;
  className?: string;
  render?: (row: any, index: number) => React.ReactNode;
}

export interface StatusPill {
  label: string;
  key: string;
  count: number;
}

interface ReportTableProps {
  title?: string;
  columns: ColumnDef[];
  data: any[];
  statusPills?: StatusPill[];
  activeStatusPill?: string;
  onSelectStatusPill?: (key: string) => void;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  hideHeaderButtons?: boolean;
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  loading?: boolean;
  onColumnSearch?: (columnKey: string, value: string) => void;
}

const parseWidthPx = (w?: string, fallback = 150): number => {
  if (!w) return fallback;
  if (w.endsWith("%")) {
    const pct = parseFloat(w);
    return Math.max(100, Math.round((pct / 100) * 850));
  }
  const val = parseInt(w, 10);
  return isNaN(val) || val <= 0 ? fallback : val;
};

export const ReportTable: React.FC<ReportTableProps> = ({
  title = "Report Data",
  columns,
  data = [],
  statusPills = [],
  activeStatusPill = "all",
  onSelectStatusPill,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
  hideHeaderButtons = false,
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
  onColumnSearch,
}) => {
  const [internalStatusPill, setInternalStatusPill] = useState<string>(activeStatusPill || "all");
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});
  const [internalPage, setInternalPage] = useState<number>(1);
  const [internalLimit, setInternalLimit] = useState<number>(25);

  React.useEffect(() => {
    if (activeStatusPill) {
      setInternalStatusPill(activeStatusPill);
    }
  }, [activeStatusPill]);

  const currentPillKey = (onSelectStatusPill ? activeStatusPill : internalStatusPill) || "all";

  const isFilterActive =
    (currentPillKey && !["all", "logs", "activity_logs", "total", "summary", "records", "active_staff", "active staff"].includes(currentPillKey.toLowerCase())) ||
    Object.values(columnSearches).some((val) => val && val.trim() !== "");

  const handlePillClick = (key: string) => {
    const isCurrentlySelected = currentPillKey.toLowerCase() === key.toLowerCase();
    // Toggle off to "all" if clicking the currently selected filter pill
    const targetKey = isCurrentlySelected && !["all", "total"].includes(key.toLowerCase()) ? "all" : key;
    setInternalStatusPill(targetKey);
    if (onSelectStatusPill) onSelectStatusPill(targetKey);
  };

  const handleClearAllFilters = () => {
    setInternalStatusPill("all");
    setColumnSearches({});
    if (onSelectStatusPill) onSelectStatusPill("all");
  };

  const handleColumnSearchChange = (key: string, value: string) => {
    setColumnSearches((prev) => ({ ...prev, [key]: value }));
    if (onColumnSearch) onColumnSearch(key, value);
  };

  const filteredData = data.filter((row) => {
    const shouldDoClientPillFilter = !onSelectStatusPill;
    const pill = currentPillKey.toLowerCase().trim();
    const isAllOrLogKey = ["all", "logs", "activity_logs", "total", "summary", "records", "active_staff", "active staff"].includes(pill);

    if (shouldDoClientPillFilter && !isAllOrLogKey) {
      if (pill === "assigned") {
        const val = Number(row.assignedLeads ?? row.assigned_leads ?? 0);
        const statusStr = String(row.status || row.outcome_status || '').toLowerCase();
        if (val <= 0 && !statusStr.includes('assigned') && !statusStr.includes('lead')) return false;
      } else if (pill === "calls" || pill === "call") {
        const val = Number(row.callsCompleted ?? row.calls_completed ?? 0);
        const statusStr = String(row.status || row.action_type || row.channel || row.type || '').toLowerCase();
        if (val <= 0 && !statusStr.includes('call') && !statusStr.includes('phone')) return false;
      } else if (pill === "followups" || pill === "followup") {
        const val = Number(row.followups_count ?? row.callsCompleted ?? 0);
        const statusStr = String(row.status || row.action_type || row.type || '').toLowerCase();
        if (val <= 0 && !statusStr.includes('follow')) return false;
      } else if (pill === "new" || pill === "fresh") {
        const statusStr = String(row.status || row.seller_lead_status || row.buyer_lead_status || '').toLowerCase();
        if (!statusStr.includes('new') && !statusStr.includes('fresh') && !statusStr.includes('uncontacted')) return false;
      } else if (pill === "contacted") {
        const statusStr = String(row.status || row.seller_lead_status || row.buyer_lead_status || '').toLowerCase();
        if (!statusStr.includes('contact')) return false;
      } else if (pill === "qualified") {
        const stageStr = String(row.stage || row.seller_lead_stage || row.buyer_lead_stage || '').toLowerCase().replace(/_/g, ' ');
        const statusStr = String(row.status || row.seller_lead_status || row.buyer_lead_status || '').toLowerCase();
        if (stageStr.includes('initial') || stageStr.includes('new') || stageStr.includes('contacted')) return false;
        const isQualified = (stageStr.includes('interested') || stageStr.includes('qualif')) || (statusStr.includes('connected') || statusStr.includes('qualif'));
        if (!isQualified) return false;
      } else if (pill === "active") {
        const statusStr = String(row.status || row.seller_lead_status || row.buyer_lead_status || '').toLowerCase();
        if (statusStr.includes('closed') || statusStr.includes('won') || statusStr.includes('lost') || statusStr.includes('reject')) return false;
      } else if (pill === "unqualified" || pill === "lost") {
        const statusStr = String(row.status || row.seller_lead_status || row.buyer_lead_status || '').toLowerCase();
        if (!statusStr.includes('unqualif') && !statusStr.includes('lost') && !statusStr.includes('reject')) return false;
      } else if (pill === "sold" || pill === "closed") {
        const statusStr = String(row.status || row.seller_lead_status || row.buyer_lead_status || '').toLowerCase();
        if (!statusStr.includes('sold') && !statusStr.includes('closed') && !statusStr.includes('won')) return false;
      }
    }

    // 2. Column-level Searches
    for (const [colKey, searchVal] of Object.entries(columnSearches)) {
      if (!searchVal || !searchVal.trim()) continue;
      const s = searchVal.toLowerCase().trim();
      const cellVal = String(row[colKey] ?? '').toLowerCase();
      if (!cellVal.includes(s)) {
        const rowString = JSON.stringify(row).toLowerCase();
        if (!rowString.includes(s)) return false;
      }
    }

    return true;
  });

  const totalRecords = pagination?.totalRecords ?? filteredData.length;
  const page = pagination?.page ?? internalPage;
  const limit = pagination?.limit ?? internalLimit;
  const totalPages = pagination?.totalPages ?? (Math.ceil(filteredData.length / limit) || 1);

  const displayData = pagination ? data : filteredData.slice((page - 1) * limit, page * limit);

  const startRecord = totalRecords > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(totalRecords, page * limit);

  const handlePageChange = (newPage: number) => {
    setInternalPage(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setInternalLimit(newLimit);
    if (onLimitChange) onLimitChange(newLimit);
  };

  // Dynamic Sticky Left calculations for S.NO (col 0), Column 0 (col 1), and Column 1 (col 2)
  const SNO_WIDTH = 55;
  const col0WidthPx = parseWidthPx(columns[0]?.width, 180);
  const col0WidthStr = `${col0WidthPx}px`;
  const col1LeftPx = SNO_WIDTH + col0WidthPx;
  const col1LeftStr = `${col1LeftPx}px`;

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col h-[520px] no-print">
      {/* Sticky Top Status & Action Toolbar */}
      <div className="sticky top-0 z-20 shrink-0 py-2 px-3 bg-[#f8fafc] flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-2xs border-b border-gray-200">
        {/* Quick Status Stats Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusPills.map((pill) => {
            const isSelected = currentPillKey.toLowerCase() === pill.key.toLowerCase();
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => handlePillClick(pill.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-[#0f1f38] text-white border-[#0f1f38] shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    isSelected ? "bg-white text-[#0f1f38]" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isFilterActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAllFilters}
              className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-all animate-in fade-in duration-150"
              title="Click to clear all active status filters & column searches"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Unfilter</span>
            </Button>
          )}

          {!hideHeaderButtons && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenFilters}
                className="flex items-center gap-1.5 text-xs text-white bg-[#0f1f38] hover:bg-[#1e3b8b] font-bold px-3.5 py-1.5 rounded-lg shadow-sm border-0"
              >
                <Filter className="w-3.5 h-3.5 text-white" />
                Filters
              </Button>

              {/* Export: White Button with Gray Border */}
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

              {/* Print: White Button with Gray Border */}
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
            </>
          )}

          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-1 text-xs text-gray-700 bg-white border-gray-300 hover:bg-gray-50 rounded-lg shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto relative bg-white scrollbar-thin">
        <table className="min-w-full text-left text-xs border-collapse border border-gray-300">
          {/* Sticky Header Row */}
          <thead className="sticky top-0 z-30 bg-[#eef2f6] text-slate-700 font-semibold text-[11px] uppercase tracking-wider shadow-2xs">
            <tr>
              <th
                style={{ width: `${SNO_WIDTH}px`, minWidth: `${SNO_WIDTH}px`, maxWidth: `${SNO_WIDTH}px` }}
                className="px-2 py-2 text-center border border-gray-300 bg-[#eef2f6] whitespace-nowrap sticky left-0 z-30 shadow-[1px_0_3px_rgba(0,0,0,0.08)]"
              >
                S.NO.
              </th>
              {columns.map((col, index) => {
                let stickyClass = "";
                let styleObj: React.CSSProperties = { width: col.width };

                if (index === 0) {
                  stickyClass = "sticky z-30 bg-[#eef2f6]";
                  styleObj = { left: `${SNO_WIDTH}px`, width: col0WidthStr, minWidth: col0WidthStr, maxWidth: col0WidthStr };
                } else if (index === 1) {
                  stickyClass = "sticky z-30 bg-[#eef2f6] shadow-[4px_0_8px_-3px_rgba(0,0,0,0.18)]";
                  styleObj = { left: col1LeftStr, width: col.width || "140px", minWidth: col.width || "140px" };
                }

                return (
                  <th
                    key={col.key}
                    style={styleObj}
                    className={`px-2.5 py-2 border border-gray-300 bg-[#eef2f6] whitespace-nowrap ${stickyClass} ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>

            {/* Inline Column Search Row */}
            <tr className="bg-[#f8fafc]">
              <td
                style={{ width: `${SNO_WIDTH}px`, minWidth: `${SNO_WIDTH}px`, maxWidth: `${SNO_WIDTH}px` }}
                className="p-1 border border-gray-300 bg-[#f8fafc] sticky left-0 z-30 shadow-[1px_0_3px_rgba(0,0,0,0.08)]"
              ></td>
              {columns.map((col, index) => {
                let stickyClass = "";
                let styleObj: React.CSSProperties = { width: col.width };

                if (index === 0) {
                  stickyClass = "sticky z-30 bg-[#f8fafc]";
                  styleObj = { left: `${SNO_WIDTH}px`, width: col0WidthStr, minWidth: col0WidthStr, maxWidth: col0WidthStr };
                } else if (index === 1) {
                  stickyClass = "sticky z-30 bg-[#f8fafc] shadow-[4px_0_8px_-3px_rgba(0,0,0,0.18)]";
                  styleObj = { left: col1LeftStr, width: col.width || "140px", minWidth: col.width || "140px" };
                }

                return (
                  <td key={`search-${col.key}`} style={styleObj} className={`p-1 border border-gray-300 bg-[#f8fafc] ${stickyClass}`}>
                    {col.searchable !== false && (
                      <input
                        type="text"
                        placeholder={col.searchPlaceholder || `Search...`}
                        value={columnSearches[col.key] || ""}
                        onChange={(e) => handleColumnSearchChange(col.key, e.target.value)}
                        className="w-full bg-white text-[11px] px-1.5 py-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 font-normal"
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          </thead>

          {/* Bordered Table Body */}
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-16 text-center text-gray-400 font-medium">
                  Loading records...
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-16 text-center text-gray-400 font-medium">
                  No records match your search criteria.
                </td>
              </tr>
            ) : (
              displayData.map((row, idx) => {
                const serialNo = startRecord + idx;

                return (
                  <tr
                    key={row.id || idx}
                    className="group hover:bg-blue-50/40 transition-colors"
                  >
                    <td
                      style={{ width: `${SNO_WIDTH}px`, minWidth: `${SNO_WIDTH}px`, maxWidth: `${SNO_WIDTH}px` }}
                      className="px-2 py-1.5 text-center text-gray-500 font-medium border border-gray-200 whitespace-nowrap sticky left-0 z-10 bg-white group-hover:bg-blue-50/90 shadow-[1px_0_3px_rgba(0,0,0,0.08)]"
                    >
                      {serialNo}
                    </td>

                    {columns.map((col, index) => {
                      let stickyClass = "";
                      let styleObj: React.CSSProperties = { width: col.width };

                      if (index === 0) {
                        stickyClass = "sticky z-10 bg-white group-hover:bg-blue-50/90";
                        styleObj = { left: `${SNO_WIDTH}px`, width: col0WidthStr, minWidth: col0WidthStr, maxWidth: col0WidthStr };
                      } else if (index === 1) {
                        stickyClass = "sticky z-10 bg-white group-hover:bg-blue-50/90 shadow-[4px_0_8px_-3px_rgba(0,0,0,0.18)]";
                        styleObj = { left: col1LeftStr, width: col.width || "140px", minWidth: col.width || "140px" };
                      }

                      return (
                        <td
                          key={col.key}
                          style={styleObj}
                          className={`px-2.5 py-1.5 text-gray-800 border border-gray-200 ${stickyClass} ${col.className || ""}`}
                        >
                          {col.render ? col.render(row, idx) : row[col.key] || "N/A"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Fixed Sticky Bottom Pagination Footer */}
      <div className="sticky bottom-0 z-20 shrink-0 px-2 sm:px-3 py-1.5 border-t border-gray-200 bg-white">
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
              className="px-2 py-1 border border-gray-300 rounded bg-white text-xs font-semibold focus:outline-none"
            >
              {[25, 50, 100, 200, 500].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span className="ml-2 text-gray-500">
              Showing {totalRecords > 0 ? startRecord : 0}-{endRecord} of {totalRecords} records
            </span>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};
