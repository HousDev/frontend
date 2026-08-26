// frontend/src/components/reports/BuyerPrintPreviewModal.tsx
import React from "react";
import { X, Printer, Users } from "lucide-react";
import Button from "@/components/ui/Button";

interface BuyerPrintPreviewModalProps {
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

export const BuyerPrintPreviewModal: React.FC<BuyerPrintPreviewModalProps> = ({
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
  if (!isOpen) return null;

  const activeFilterList = Object.entries(filters)
    .filter(([key, val]) => val && val !== "all" && val !== "true" && key !== "ignoreDate")
    .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val}`);

  const handlePrint = () => {
    window.print();
  };

  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Controls Bar (Hidden during actual print) */}
        <div className="px-6 py-3.5 bg-[#0f2b3d] text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Print Preview — Buyers Report</h2>
              <p className="text-xs text-slate-300">Property CRM branded print layout with logo & analytics summary</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handlePrint}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </Button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div id="printable-buyer-report" className="relative p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs space-y-6">
          {/* Watermark Background */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] text-7xl sm:text-8xl font-black text-slate-900/5 select-none pointer-events-none uppercase tracking-widest text-center whitespace-nowrap z-0">
            PROPERTY CRM BUYERS
          </div>

          <div className="relative z-10 space-y-6">
            {/* Branded Header */}
            <div className="border-b-2 border-[#0f2b3d] pb-4 flex items-center justify-between bg-white rounded-lg p-2">
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Property CRM Logo"
                  className="h-12 max-w-[160px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div>
                  <h1 className="text-xl font-black text-[#0f2b3d] uppercase tracking-wide">Buyers BI Performance Report</h1>
                  <p className="text-xs text-gray-500 font-medium">Buyer demand, requirements, matching, site visits & conversion analytics</p>
                </div>
              </div>
              <div className="text-right text-[11px] text-gray-600 space-y-0.5">
                <div><strong className="text-gray-900">Generated:</strong> {new Date().toLocaleString("en-IN")}</div>
                <div><strong className="text-gray-900">Total Buyers:</strong> {stats.total_count || tableData.length || 0}</div>
                <div><strong className="text-gray-900">Filters:</strong> {activeFilterList.length > 0 ? activeFilterList.join(" | ") : "All Time"}</div>
              </div>
            </div>

            {/* KPI Cards Summary Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-gray-500">Total Buyers</div>
                <div className="text-lg font-black text-gray-900">{stats.total_count || 0}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-gray-500">Active Buyers</div>
                <div className="text-lg font-black text-blue-700">{stats.active_count || 0}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-gray-500">Site Visit Buyers</div>
                <div className="text-lg font-black text-purple-700">{stats.visit_count || 0}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-gray-500">Closed / Won</div>
                <div className="text-lg font-black text-emerald-700">{stats.converted_count || 0} ({stats.conversion_rate || 0}%)</div>
              </div>
            </div>

            {/* Location Demand Summary Table */}
            {locations && locations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase text-[#0f2b3d] tracking-wider border-b border-gray-200 pb-1">Top Location Demand</h3>
                <table className="w-full text-left border-collapse border border-gray-200 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800 border-b border-gray-200">
                      <th className="p-2">Location</th>
                      <th className="p-2">Buyers</th>
                      <th className="p-2">Avg Budget</th>
                      <th className="p-2">Site Visits</th>
                      <th className="p-2">Closed Deals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.slice(0, 5).map((loc, idx) => (
                      <tr key={idx} className="border-b border-gray-200 odd:bg-white even:bg-slate-50">
                        <td className="p-2 font-bold">{loc.location_name}</td>
                        <td className="p-2">{loc.buyer_count}</td>
                        <td className="p-2">₹{Number(loc.avg_budget_max || 0).toLocaleString("en-IN")}</td>
                        <td className="p-2">{loc.site_visits}</td>
                        <td className="p-2 font-bold text-emerald-700">{loc.closed_deals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Detailed Buyers Table */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-[#0f2b3d] tracking-wider border-b border-gray-200 pb-1">Buyer Master Records</h3>
              <table className="w-full text-left border-collapse border border-gray-200 text-[10px]">
                <thead>
                  <tr className="bg-[#0f2b3d] text-white font-bold">
                    <th className="p-2">Buyer Name</th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Budget Range</th>
                    <th className="p-2">Stage</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Assigned Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 odd:bg-white even:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900">
                        {row.salutation ? `${row.salutation} ` : ""}{row.name || "N/A"}
                      </td>
                      <td className="p-2">{row.phone || "N/A"}</td>
                      <td className="p-2">{row.location || row.city || "N/A"}</td>
                      <td className="p-2 font-bold text-emerald-800">
                        ₹{Number(row.budget_min || 0).toLocaleString("en-IN")} - ₹{Number(row.budget_max || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-2 font-bold text-indigo-700">{row.buyer_lead_stage || "New"}</td>
                      <td className="p-2">{row.buyer_lead_status || "Active"}</td>
                      <td className="p-2">{row.assigned_agent_name || "Unassigned"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-gray-300 flex justify-between text-[10px] text-gray-500">
              <div>Property CRM — Confidential Buyer Report</div>
              <div>Page 1 of 1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
