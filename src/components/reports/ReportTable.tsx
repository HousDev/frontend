// frontend/src/components/reports/ReportTable.tsx
import React, { useState } from "react";
import { Download, Filter, RefreshCw, Printer } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";

export interface ColumnDef {
  key: string;
  header: string;
  searchable?: boolean;
  searchPlaceholder?: string;
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
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  loading?: boolean;
  onColumnSearch?: (columnKey: string, value: string) => void;
}

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
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
  onColumnSearch,
}) => {
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});

  const handleColumnSearchChange = (key: string, value: string) => {
    setColumnSearches((prev) => ({ ...prev, [key]: value }));
    if (onColumnSearch) onColumnSearch(key, value);
  };

  const filteredData = data.filter((row) => {
    for (const key in columnSearches) {
      const query = (columnSearches[key] || "").toLowerCase().trim();
      if (query) {
        const val = String(row[key] || "").toLowerCase();
        if (!val.includes(query)) return false;
      }
    }
    return true;
  });

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.totalRecords, pagination.page * pagination.limit);

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col h-[480px] no-print">
      {/* Sticky Top Status & Action Toolbar */}
      <div className="sticky top-0 z-20 shrink-0 p-3 bg-[#f8fafc] border-b border-gray-300 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        {/* Quick Status Stats Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {statusPills.map((pill) => {
            const isSelected = activeStatusPill.toLowerCase() === pill.key.toLowerCase();
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => onSelectStatusPill && onSelectStatusPill(pill.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-[#0f1f38] text-white border-[#0f1f38] shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? "bg-white text-[#0f1f38]" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Actions (Matching 1st Screenshot rounded-lg button style) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Filters: Dark Navy Solid Button */}
          <Button
            type="button"
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

      {/* Fixed Scrollable Table Body Area with Bordered Grid Cells */}
      <div className="flex-1 overflow-auto scrollbar-thin relative bg-white">
        <table className="w-full text-left text-xs border-collapse border border-gray-300">
          {/* Sticky Header Row */}
          <thead className="sticky top-0 z-10 bg-[#eef2f6] text-gray-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
            <tr>
              <th className="p-2.5 w-12 text-center border border-gray-300 bg-[#eef2f6]">S.NO.</th>
              {columns.map((col) => (
                <th key={col.key} className="p-2.5 border border-gray-300 bg-[#eef2f6]">
                  {col.header}
                </th>
              ))}
            </tr>

            {/* Inline Column Search Row */}
            <tr className="bg-[#f8fafc]">
              <td className="p-1 border border-gray-300 bg-[#f8fafc]"></td>
              {columns.map((col) => (
                <td key={`search-${col.key}`} className="p-1 border border-gray-300 bg-[#f8fafc]">
                  {col.searchable !== false && (
                    <input
                      type="text"
                      placeholder={col.searchPlaceholder || `Search...`}
                      value={columnSearches[col.key] || ""}
                      onChange={(e) => handleColumnSearchChange(col.key, e.target.value)}
                      className="w-full bg-white text-[11px] px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </td>
              ))}
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
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-16 text-center text-gray-400 font-medium">
                  No records match your search criteria.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => {
                const serialNo = startRecord + idx;

                return (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="p-2.5 text-center text-gray-500 font-semibold border border-gray-200">
                      {serialNo}
                    </td>

                    {columns.map((col) => (
                      <td key={col.key} className="p-2.5 text-gray-800 border border-gray-200">
                        {col.render ? col.render(row, idx) : row[col.key] || "N/A"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky Bottom Pagination Bar */}
      <div className="sticky bottom-0 z-20 shrink-0 p-3 bg-gray-50 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 shadow-inner">
        <div>
          Showing {pagination.totalRecords > 0 ? startRecord : 0}-{endRecord} of{" "}
          <span className="font-bold text-gray-900">{pagination.totalRecords}</span> entries
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select
              value={pagination.limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
              className="bg-white border border-gray-300 rounded text-xs p-1 shadow-2xs focus:ring-indigo-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
};
