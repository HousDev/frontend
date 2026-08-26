// frontend/src/components/reports/SellerExportPreviewModal.tsx
import React, { useState } from "react";
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import * as XLSX from "xlsx";
import { reportAPI } from "@/lib/reportAPI";

interface SellerExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  summary?: any;
  pipeline?: any[];
  aging?: any[];
  followups?: any;
  properties?: any;
  sources?: any[];
  documents?: any;
  executives?: any[];
  financials?: any;
  tableData: any[];
}

export const SellerExportPreviewModal: React.FC<SellerExportPreviewModalProps> = ({
  isOpen,
  onClose,
  filters = {},
  summary = {},
  pipeline = [],
  aging = [],
  followups = {},
  properties = {},
  sources = [],
  documents = {},
  executives = [],
  financials = {},
  tableData = [],
}) => {
  const [exportFormat, setExportFormat] = useState<"excel" | "csv" | "pdf">("excel");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFilterList = Object.entries(filters)
    .filter(([key, val]) => val && val !== "all" && val !== "true" && key !== "ignoreDate")
    .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val}`);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === "excel" || exportFormat === "csv") {
        // Create workbook with multiple sheets (Summary, Sellers Data, Pipeline, Agents)
        const wb = XLSX.utils.book_new();

        // 1. Summary Sheet
        const summaryRows = [
          ["RESALE EXPERT - SELLER REPORT SUMMARY"],
          ["Generated Date", new Date().toLocaleString("en-IN")],
          ["Active Filters", activeFilterList.length > 0 ? activeFilterList.join(" | ") : "All Time / Default"],
          [""],
          ["KPI METRIC", "VALUE"],
          ["Total Sellers", summary.total_sellers || 0],
          ["Active Sellers", summary.active_sellers || 0],
          ["Hot Sellers", summary.hot_sellers || 0],
          ["Closed / Sold Sellers", summary.closed_sold || 0],
          ["Linked Properties", summary.properties_linked || 0],
          ["Total Pipeline Value (₹)", summary.pipeline_value || 0],
          ["Expected Closing Value (₹)", summary.expected_closing_value || 0],
          ["Follow-ups Due", summary.followups_due || 0],
          ["Overdue Follow-ups", summary.overdue_followups || 0],
          ["Pending Documents", summary.pending_documents || 0],
          ["Average Deal Value (₹)", summary.avg_deal_value || 0],
          ["Average Lead Score", summary.avg_lead_score || 0],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Report Summary");

        // 2. Sellers Data Sheet
        const dataRows = tableData.map((row, idx) => ({
          "S.No": idx + 1,
          "Seller Name": `${row.salutation ? row.salutation + ' ' : ''}${row.name || 'N/A'}`,
          "Phone": row.phone || "N/A",
          "Email": row.email || "N/A",
          "Location / City": row.location || row.city || "N/A",
          "Stage": row.seller_lead_stage || row.stage || "New",
          "Status": row.seller_lead_status || row.status || "Active",
          "Priority": row.priority || "Medium",
          "Source": row.source || "Direct",
          "Expected Price / Deal Value (₹)": Number(row.expected_price || row.deal_value || 0),
          "Days Listed": row.days_listed !== undefined ? row.days_listed : 0,
          "Assigned Agent": row.assigned_agent_name || "Unassigned",
        }));
        const wsData = XLSX.utils.json_to_sheet(dataRows.length > 0 ? dataRows : [{ "Status": "No data" }]);
        XLSX.utils.book_append_sheet(wb, wsData, "Seller List");

        // 3. Pipeline & Aging Sheet
        const pipelineRows = (pipeline || []).map((p) => ({
          "Stage": p.stage,
          "Seller Count": p.count,
          "Percentage": `${p.percentage}%`,
          "Total Value (₹)": p.deal_value,
        }));
        const wsPipeline = XLSX.utils.json_to_sheet(pipelineRows);
        XLSX.utils.book_append_sheet(wb, wsPipeline, "Pipeline Breakdown");

        // 4. Agent Performance Sheet
        const agentRows = (executives || []).map((e) => ({
          "Agent Name": e.agent_name,
          "Total Sellers": e.total_sellers,
          "Active Sellers": e.active_sellers,
          "Negotiations": e.negotiation_count,
          "Closed Deals": e.closed_count,
          "Pipeline Value (₹)": e.pipeline_value,
          "Response Rate": `${e.response_rate}%`,
        }));
        const wsAgents = XLSX.utils.json_to_sheet(agentRows);
        XLSX.utils.book_append_sheet(wb, wsAgents, "Agent Performance");

        const ext = exportFormat === "excel" ? "xlsx" : "csv";
        XLSX.writeFile(wb, `Seller_Report_${new Date().toISOString().slice(0, 10)}.${ext}`);
      } else {
        // PDF trigger or fallback
        const blob = await reportAPI.exportReportCSV("sellers", filters);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Seller_Report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      onClose();
    } catch (err) {
      console.error("Failed to export seller report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Export Seller Report Preview</h2>
              <p className="text-xs text-slate-300">Review report summary & select export format</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50 text-xs">
          {/* Selected Filters Summary Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-start gap-3">
            <Filter className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-blue-900 block mb-1">Applied Filter Parameters:</span>
              {activeFilterList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeFilterList.map((f, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-blue-700 italic">No specific filters applied (Displaying All Seller Records)</span>
              )}
            </div>
          </div>

          {/* Executive Summary Cards Grid */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2.5 text-xs uppercase tracking-wider">Report Executive Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Total Sellers</div>
                <div className="text-base font-bold text-gray-900">{summary.total_sellers || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Active Sellers</div>
                <div className="text-base font-bold text-blue-600">{summary.active_sellers || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Pipeline Value</div>
                <div className="text-base font-bold text-emerald-600">₹{Number(summary.pipeline_value || 0).toLocaleString("en-IN")}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-gray-500 text-[11px]">Closed / Transacted</div>
                <div className="text-base font-bold text-purple-600">{summary.closed_sold || 0}</div>
              </div>
            </div>
          </div>

          {/* Pipeline & Aging Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-2">Pipeline Summary</h4>
              <div className="space-y-1.5">
                {(pipeline || []).slice(0, 5).map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-700 py-1 border-b border-gray-100 last:border-0">
                    <span className="font-medium">{p.stage}</span>
                    <span className="font-bold text-gray-900">{p.count} sellers ({p.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-2">Follow-ups & Documents Summary</h4>
              <div className="space-y-1.5 text-gray-700">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Follow-ups Completed:</span>
                  <span className="font-bold text-emerald-700">{followups.completed || 0} ({followups.completion_rate || 0}%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Pending / Overdue Follow-ups:</span>
                  <span className="font-bold text-amber-600">{followups.pending || 0} due / {followups.overdue || 0} overdue</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Verified Documents:</span>
                  <span className="font-bold text-blue-700">{documents.verified || 0} / {documents.total_documents || 0} ({documents.verification_percentage || 0}%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Sellers with Pending Papers:</span>
                  <span className="font-bold text-rose-600">{documents.sellers_pending || 0} sellers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Table Dataset Preview */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-100 border-b border-gray-200 flex justify-between items-center font-bold text-gray-800">
              <span>Filtered Seller Records ({tableData.length} records in preview)</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 sticky top-0">
                  <tr>
                    <th className="p-2 border-r">#</th>
                    <th className="p-2 border-r">Seller Name</th>
                    <th className="p-2 border-r">Contact</th>
                    <th className="p-2 border-r">Location</th>
                    <th className="p-2 border-r">Stage</th>
                    <th className="p-2 border-r">Expected Price</th>
                    <th className="p-2">Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.slice(0, 8).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2 border-r text-gray-500">{idx + 1}</td>
                      <td className="p-2 border-r font-bold text-gray-900">{row.salutation ? `${row.salutation} ` : ""}{row.name}</td>
                      <td className="p-2 border-r">{row.phone}</td>
                      <td className="p-2 border-r">{row.location || row.city || "N/A"}</td>
                      <td className="p-2 border-r font-medium text-blue-700">{row.seller_lead_stage || row.stage || "New"}</td>
                      <td className="p-2 border-r font-bold text-emerald-700">₹{Number(row.expected_price || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2 text-gray-700">{row.assigned_agent_name || "Unassigned"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Format Selector */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <label className="block font-bold text-emerald-900 mb-2">Select Target Export Format:</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat("excel")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${
                  exportFormat === "excel"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Microsoft Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("csv")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${
                  exportFormat === "csv"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                Standard CSV (.csv)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("pdf")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${
                  exportFormat === "pdf"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF Document (.pdf)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-5"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting File..." : `Export Report as ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
