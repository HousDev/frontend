// frontend/src/components/reports/LeadExportPreviewModal.tsx
import React, { useState } from "react";
import { X, Download, FileSpreadsheet, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import * as XLSX from "xlsx";

interface LeadExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  stats?: any;
  funnel?: any[];
  sources?: any[];
  executives?: any[];
  tableData: any[];
}

export const LeadExportPreviewModal: React.FC<LeadExportPreviewModalProps> = ({
  isOpen,
  onClose,
  filters = {},
  stats = {},
  funnel = [],
  sources = [],
  executives = [],
  tableData = [],
}) => {
  const [exportFormat, setExportFormat] = useState<"excel" | "csv">("excel");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFilterList = Object.entries(filters)
    .filter(([key, val]) => val && val !== "all" && val !== "true" && key !== "ignoreDate" && val !== "")
    .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val}`);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === "excel" || exportFormat === "csv") {
        const wb = XLSX.utils.book_new();

        // 1. Summary Sheet
        const summaryRows = [
          ["RESALE EXPERT - LEADS REPORT EXECUTIVE SUMMARY"],
          ["Generated Date", new Date().toLocaleString("en-IN")],
          ["Active Filters", activeFilterList.length > 0 ? activeFilterList.join(" | ") : "All Time / Default"],
          [""],
          ["KPI METRIC", "VALUE"],
          ["Total Leads", stats.total_count || tableData.length || 0],
          ["Fresh Leads", stats.fresh_count || 0],
          ["Unassigned Leads", stats.unassigned_count || 0],
          ["Assigned Leads", stats.assigned_count || 0],
          ["Interested / Qualified Leads", stats.interested_count || 0],
          ["Transferred to Buyer CRM", stats.buyer_transferred_count || 0],
          ["Transferred to Seller CRM", stats.seller_transferred_count || 0],
          ["Unique Converted Leads", stats.unique_converted_count || 0],
          ["Conversion Rate (%)", `${stats.conversion_rate || 0}%`],
          ["Contacted Leads", stats.contacted_count || 0],
          ["Unqualified / Lost Leads", stats.unqualified_count || 0],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Report Summary");

        // 2. Full Leads Data Sheet (EXACT ALL COLUMNS AND DATA)
        const dataRows = tableData.map((row, idx) => ({
          "S.No": idx + 1,
          "Lead ID": row.id || "N/A",
          "Salutation": row.salutation || "",
          "Lead Name": `${row.salutation ? row.salutation + ' ' : ''}${row.name || 'N/A'}`,
          "Phone": row.phone || "N/A",
          "Email": row.email || "N/A",
          "WhatsApp Number": row.whatsapp_number || "N/A",
          "State": row.state || "N/A",
          "City": row.city || "N/A",
          "Location": row.location || "N/A",
          "Lead Type": row.lead_type || "Buyer",
          "Lead Source": row.lead_source || "Direct",
          "Stage": row.stage || "New",
          "Status": row.status || "New",
          "Priority": row.priority || "Medium",
          "Assigned Executive": row.assigned_executive_name || "Unassigned",
          "Created Date": row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "N/A",
          "Created By": row.created_by_name || "System",
          "Updated Date": row.updated_at ? new Date(row.updated_at).toLocaleDateString("en-IN") : "N/A",
          "Updated By": row.updated_by_name || "N/A",
          "Lead Outcome": row.outcome || "In Lead Pipeline",
          "Transferred to Buyer": row.transferred_to_buyer === 1 ? "Yes" : "No",
          "Transferred to Buyer Date": row.transferred_to_buyer_at ? new Date(row.transferred_to_buyer_at).toLocaleDateString("en-IN") : "N/A",
          "Transferred to Buyer By": row.transferred_to_buyer_by_name || "N/A",
          "Transferred to Seller": row.transferred_to_seller === 1 ? "Yes" : "No",
          "Transferred to Seller Date": row.transferred_to_seller_at ? new Date(row.transferred_to_seller_at).toLocaleDateString("en-IN") : "N/A",
          "Transferred to Seller By": row.transferred_to_seller_by_name || "N/A",
        }));
        const wsData = XLSX.utils.json_to_sheet(dataRows.length > 0 ? dataRows : [{ "Status": "No data" }]);
        XLSX.utils.book_append_sheet(wb, wsData, "Detailed Leads List");

        // 3. Lead Sources Sheet
        const sourceRows = (sources || []).map((s) => ({
          "Lead Source": s.source_name,
          "Total Leads": s.total_leads,
          "Assigned Count": s.assigned_count,
          "Assigned (%)": `${s.assigned_pct}%`,
          "Interested Count": s.interested_count,
          "Interested (%)": `${s.interested_pct}%`,
          "Buyer Transfers": s.buyer_transfers,
          "Seller Transfers": s.seller_transfers,
          "Conversion Rate (%)": `${s.conversion_pct}%`,
        }));
        const wsSources = XLSX.utils.json_to_sheet(sourceRows);
        XLSX.utils.book_append_sheet(wb, wsSources, "Lead Source Performance");

        // 4. Executive Performance Sheet
        const execRows = (executives || []).map((e) => ({
          "Executive Name": e.executive_name,
          "Executive Email": e.executive_email,
          "Assigned Leads": e.assigned_leads,
          "Fresh Leads": e.fresh_count,
          "Interested Leads": e.interested_count,
          "Buyer Transfers": e.buyer_transfers,
          "Seller Transfers": e.seller_transfers,
          "Closed Deals": e.closed_count,
          "Conversion Rate (%)": `${e.conversion_rate}%`,
        }));
        const wsExecs = XLSX.utils.json_to_sheet(execRows);
        XLSX.utils.book_append_sheet(wb, wsExecs, "Executive Performance");

        const ext = exportFormat === "excel" ? "xlsx" : "csv";
        XLSX.writeFile(wb, `Leads_Report_${new Date().toISOString().slice(0, 10)}.${ext}`);
      }
      onClose();
    } catch (err) {
      console.error("Failed to export lead report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0f1f38] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Export Leads Report Preview</h2>
              <p className="text-xs text-slate-300">Review report dataset & customize export options</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50 text-xs">
          {/* Active Filters Summary Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-start gap-3">
            <Filter className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-blue-900 block mb-1">Applied Report Filter Parameters:</span>
              {activeFilterList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeFilterList.map((f, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-blue-700 italic">No active filter restrictions (Exporting All Leads Dataset)</span>
              )}
            </div>
          </div>

          {/* Executive KPI Summary Cards */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2.5 text-xs uppercase tracking-wider">Leads Summary Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Total Leads</div>
                <div className="text-base font-bold text-gray-900">{stats.total_count || tableData.length || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Fresh Leads</div>
                <div className="text-base font-bold text-blue-600">{stats.fresh_count || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Buyer Transfers</div>
                <div className="text-base font-bold text-emerald-600">{stats.buyer_transferred_count || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Conversion Rate</div>
                <div className="text-base font-bold text-purple-600">{stats.conversion_rate || 0}%</div>
              </div>
            </div>
          </div>

          {/* Lead Table Dataset Preview */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-100 border-b border-gray-200 flex justify-between items-center font-bold text-gray-800">
              <span>Filtered Lead Records ({tableData.length} records in current export)</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 sticky top-0">
                  <tr>
                    <th className="p-2 border-r">#</th>
                    <th className="p-2 border-r">Lead Name</th>
                    <th className="p-2 border-r">Contact</th>
                    <th className="p-2 border-r">Source</th>
                    <th className="p-2 border-r">Status</th>
                    <th className="p-2 border-r">Assigned Executive</th>
                    <th className="p-2">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tableData.length > 0 ? (
                    tableData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 border-r text-center">{idx + 1}</td>
                        <td className="p-2 border-r font-semibold text-gray-900">
                          {row.salutation ? `${row.salutation} ` : ""}{row.name || "N/A"}
                        </td>
                        <td className="p-2 border-r">{row.phone || row.email || "N/A"}</td>
                        <td className="p-2 border-r">{row.lead_source || "Direct"}</td>
                        <td className="p-2 border-r font-medium">{row.status || "New"}</td>
                        <td className="p-2 border-r">{row.assigned_executive_name || "Unassigned"}</td>
                        <td className="p-2 font-semibold text-emerald-700">{row.outcome || "In Pipeline"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-400 italic">
                        No lead records available for preview.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-bold text-gray-900 block mb-1">Choose Export Format:</span>
              <p className="text-slate-500 text-[11px]">Select standard spreadsheet workbook or raw CSV format (Includes all 27 dataset columns)</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExportFormat("excel")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  exportFormat === "excel"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("csv")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  exportFormat === "csv"
                    ? "border-blue-600 bg-blue-50 text-blue-800 shadow-sm"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                CSV (.csv)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
          <div className="text-gray-500 text-[11px]">
            * Export contains complete 27-column dataset & summary sheets
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                "Generating File..."
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1.5" />
                  Download Complete Dataset Export
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
