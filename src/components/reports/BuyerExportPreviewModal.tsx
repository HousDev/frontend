// frontend/src/components/reports/BuyerExportPreviewModal.tsx
import React, { useState } from "react";
import { X, Download, FileSpreadsheet, CheckCircle2, Filter } from "lucide-react";
import Button from "@/components/ui/Button";
import * as XLSX from "xlsx";

interface BuyerExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  stats?: any;
  funnel?: any[];
  demands?: any;
  locations?: any[];
  budgets?: any;
  matching?: any;
  visits?: any;
  executives?: any[];
  followups?: any;
  financials?: any;
  tableData: any[];
}

export const BuyerExportPreviewModal: React.FC<BuyerExportPreviewModalProps> = ({
  isOpen,
  onClose,
  filters = {},
  stats = {},
  funnel = [],
  demands = {},
  locations = [],
  budgets = {},
  matching = {},
  visits = {},
  executives = [],
  followups = {},
  financials = {},
  tableData = [],
}) => {
  const [exportFormat, setExportFormat] = useState<"excel" | "csv">("excel");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFilterList = Object.entries(filters)
    .filter(([key, val]) => val && val !== "all" && val !== "true" && key !== "ignoreDate")
    .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val}`);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const wb = XLSX.utils.book_new();
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Report Summary Sheet
      const summaryRows = [
        ["PROPERTY CRM — BUYERS REPORT SUMMARY"],
        ["Generated Date", new Date().toLocaleString("en-IN")],
        ["Active Filters", activeFilterList.length > 0 ? activeFilterList.join(" | ") : "All Time / Default"],
        [""],
        ["KPI METRIC", "VALUE"],
        ["Total Buyers", stats.total_count || tableData.length || 0],
        ["Active Buyers", stats.active_count || 0],
        ["New Buyers (30 Days)", stats.new_count || 0],
        ["Qualified Buyers", stats.qualified_count || 0],
        ["Site Visit Buyers", stats.visit_count || 0],
        ["Negotiation Buyers", stats.negotiation_count || 0],
        ["Closed / Won Buyers", stats.converted_count || 0],
        ["Lost / Rejected Buyers", stats.lost_count || 0],
        ["Conversion Rate (%)", `${stats.conversion_rate || 0}%`],
        [""],
        ["MATCHING & VISITS METRICS", "VALUE"],
        ["Buyers with Matches", matching.buyersWithMatches || 0],
        ["Avg Matches / Buyer", matching.avgMatchesPerBuyer || 0],
        ["Total Site Visits", visits.totalVisits || 0],
        ["Unique Buyers with Visits", visits.uniqueBuyers || 0],
        ["Completed Visits", visits.completedVisits || 0],
        [""],
        ["FINANCIAL READINESS", "VALUE"],
        ["Loan Needed Buyers", financials.loanRequiredCount || 0],
        ["Self Funded Buyers", financials.selfFundedCount || 0],
        ["Avg Loan Amount (₹)", financials.avgLoanAmount || 0],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // 2. Buyer Data Sheet
      const dataRows = tableData.map((row, idx) => {
        const req = row.requirements || {};
        const fin = row.financials || {};

        return {
          "S.No": idx + 1,
          "Buyer ID": `#BUY-${row.id}`,
          "Buyer Name": `${row.salutation ? row.salutation + ' ' : ''}${row.name || 'N/A'}`,
          "Phone": row.phone || "N/A",
          "WhatsApp": row.whatsapp_number || "N/A",
          "Email": row.email || "N/A",
          "State": row.state || "N/A",
          "City": row.city || "N/A",
          "Location": row.location || "N/A",
          "Stage": row.buyer_lead_stage || "New",
          "Status": row.buyer_lead_status || "Active",
          "Priority": row.buyer_lead_priority || "Medium",
          "Source": row.buyer_lead_source || "Direct",
          "Min Budget (₹)": Number(row.budget_min || 0),
          "Max Budget (₹)": Number(row.budget_max || 0),
          "Property Type": req.propertyType || "N/A",
          "BHK / Unit Type": Array.isArray(req.unitTypes) ? req.unitTypes.join(", ") : (req.unitType || "N/A"),
          "Furnishing": req.furnishing || "N/A",
          "Facing": req.facing || "N/A",
          "Loan Required": fin.loanRequired ? "Yes" : "No",
          "Assigned Executive": row.assigned_agent_name || "Unassigned",
          "Site Visits Count": row.visit_count || 0,
          "Saved Props Count": row.saved_count || 0,
          "Created Date": row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "N/A",
        };
      });
      const wsData = XLSX.utils.json_to_sheet(dataRows.length > 0 ? dataRows : [{ "Status": "No data" }]);
      XLSX.utils.book_append_sheet(wb, wsData, "Buyers List");

      // 3. Location Demand Sheet
      const locationRowsExport = (locations || []).map((loc) => ({
        "Location": loc.location_name,
        "Buyer Count": loc.buyer_count,
        "Avg Budget (₹)": Number(loc.avg_budget_max || 0),
        "Min Budget (₹)": Number(loc.min_budget || 0),
        "Max Budget (₹)": Number(loc.max_budget || 0),
        "Site Visits": loc.site_visits,
        "Closed Deals": loc.closed_deals,
      }));
      const wsLoc = XLSX.utils.json_to_sheet(locationRowsExport.length > 0 ? locationRowsExport : [{ "Status": "No data" }]);
      XLSX.utils.book_append_sheet(wb, wsLoc, "Location Demand");

      // 4. Executive Performance Sheet
      const execRowsExport = (executives || []).map((ex) => ({
        "Executive Name": ex.name,
        "Total Buyers": ex.total_buyers,
        "Active Buyers": ex.active_buyers,
        "Qualified Buyers": ex.qualified_buyers,
        "Site Visits": ex.site_visits,
        "Negotiation": ex.negotiation_buyers,
        "Closed / Won": ex.closed_buyers,
        "Lost": ex.lost_buyers,
        "Conversion Rate (%)": `${ex.conversion_rate}%`,
      }));
      const wsExec = XLSX.utils.json_to_sheet(execRowsExport.length > 0 ? execRowsExport : [{ "Status": "No data" }]);
      XLSX.utils.book_append_sheet(wb, wsExec, "Executive Performance");

      const filename = `buyers-report-${todayStr}.${exportFormat === "excel" ? "xlsx" : "csv"}`;
      XLSX.writeFile(wb, filename);

      onClose();
    } catch (err) {
      console.error("Failed to export buyers report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0f2b3d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Export Buyers Report</h3>
              <p className="text-xs text-slate-300">Download formatted dataset & analytics breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-gray-700">
          {/* Summary info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total Buyers to Export:</span>
              <span className="text-orange-600">{tableData.length} records</span>
            </div>
            {activeFilterList.length > 0 && (
              <div className="flex items-start gap-1 text-[11px] text-gray-500">
                <Filter className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                <span>Filters: {activeFilterList.join(" | ")}</span>
              </div>
            )}
          </div>

          {/* Export Format Selector */}
          <div>
            <label className="block font-bold text-gray-900 mb-2">Select Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat("excel")}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  exportFormat === "excel"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 ${exportFormat === "excel" ? "text-emerald-600" : "text-gray-400"}`} />
                <div>
                  <div className="text-xs">Excel Workbook</div>
                  <div className="text-[10px] text-gray-400 font-normal">.xlsx (Multi-sheet)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat("csv")}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  exportFormat === "csv"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 ${exportFormat === "csv" ? "text-emerald-600" : "text-gray-400"}`} />
                <div>
                  <div className="text-xs">CSV File</div>
                  <div className="text-[10px] text-gray-400 font-normal">.csv (Plain data)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Included Sheets Note */}
          <div className="border border-indigo-100 bg-indigo-50/50 rounded-lg p-3 text-[11px] text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Included Excel Sheets:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-gray-600">
              <li>Sheet 1: KPI Report Summary & Metrics</li>
              <li>Sheet 2: Detailed Buyer Master Records</li>
              <li>Sheet 3: Location Demand Analysis Matrix</li>
              <li>Sheet 4: Executive Conversion Performance</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isExporting} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : `Download ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
