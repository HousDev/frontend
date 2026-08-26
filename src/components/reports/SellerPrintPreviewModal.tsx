// frontend/src/components/reports/SellerPrintPreviewModal.tsx
import React from "react";
import { X, Printer, Building } from "lucide-react";
import Button from "@/components/ui/Button";

interface SellerPrintPreviewModalProps {
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
  cosellers?: any;
  executives?: any[];
  financials?: any;
  tableData: any[];
}

export const SellerPrintPreviewModal: React.FC<SellerPrintPreviewModalProps> = ({
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
  cosellers = {},
  executives = [],
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
        <div className="px-6 py-3.5 bg-[#0f1f38] text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Print Preview — Seller Management Report</h2>
              <p className="text-xs text-slate-300">Resale Expert CRM branded print layout with logo & watermark</p>
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

        {/* PRINTABLE DOCUMENT AREA WITH WATERMARK & LOGO */}
        <div id="printable-seller-report" className="relative p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans text-xs space-y-6">
          {/* Watermark Background */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] text-7xl sm:text-8xl font-black text-slate-900/5 select-none pointer-events-none uppercase tracking-widest text-center whitespace-nowrap z-0">
            RESALE EXPERT
          </div>

          <div className="relative z-10 space-y-6">
            {/* Branded Header matching buildBrandHeaderHTML */}
            <div className="border-b-2 border-[#0f1f38] pb-4 flex items-center justify-between bg-white rounded-lg p-2">
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Resale Expert Logo"
                  className="h-12 max-w-[160px] object-contain"
                  onError={(e) => {
                    // Fallback to Icon if image file fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div>
                  <div className="text-xl font-black tracking-tight text-[#0f1f38] uppercase">RESALE EXPERT</div>
                  <div className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">SELLER & INVENTORY MANAGEMENT REPORT</div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <div className="font-bold text-slate-800 uppercase">Report Date</div>
                <div className="font-extrabold text-[#0f1f38] text-xs">
                  {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
                <div className="text-[10px] text-slate-400">Gen: {new Date().toLocaleTimeString("en-IN")}</div>
              </div>
            </div>

            {/* Filter Parameters Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-800">Applied Filter Scope: </span>
                {activeFilterList.length > 0 ? (
                  <span className="font-medium text-slate-700">{activeFilterList.join(" • ")}</span>
                ) : (
                  <span className="text-slate-500 italic">All Time / All Sellers</span>
                )}
              </div>
              <div className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                {tableData.length} Filtered Records
              </div>
            </div>

            {/* 1. TOP SUMMARY STATS GRID */}
            <div>
              <h3 className="font-extrabold text-[#0f1f38] border-b border-slate-200 pb-1 mb-3 text-xs uppercase tracking-wider">
                1. Executive Summary & KPIs
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">TOTAL SELLERS</div>
                  <div className="text-base font-black text-slate-900">{summary.total_sellers || 0}</div>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">ACTIVE SELLERS</div>
                  <div className="text-base font-black text-blue-700">{summary.active_sellers || 0}</div>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">HOT SELLERS</div>
                  <div className="text-base font-black text-amber-600">{summary.hot_sellers || 0}</div>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">CLOSED / SOLD</div>
                  <div className="text-base font-black text-emerald-700">{summary.closed_sold || 0}</div>
                </div>

                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">PROPERTIES LINKED</div>
                  <div className="text-base font-black text-indigo-700">{summary.properties_linked || 0}</div>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">PIPELINE VALUE</div>
                  <div className="text-base font-black text-slate-900">₹{Number(summary.pipeline_value || 0).toLocaleString("en-IN")}</div>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">EXPECTED CLOSING</div>
                  <div className="text-base font-black text-purple-700">₹{Number(summary.expected_closing_value || 0).toLocaleString("en-IN")}</div>
                </div>
                <div className="border border-slate-200 p-2.5 rounded-lg bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">PENDING PAPERS</div>
                  <div className="text-base font-black text-rose-600">{summary.pending_documents || 0}</div>
                </div>
              </div>
            </div>

            {/* 2. SELLER PIPELINE & AGING */}
            <div className="grid grid-cols-2 gap-4 page-break-inside-avoid">
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <h4 className="font-bold text-[#0f1f38] border-b pb-1.5 mb-2 text-xs uppercase">2. Pipeline Stage Breakdown</h4>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b text-slate-600 font-bold">
                      <th className="py-1">Stage</th>
                      <th className="py-1 text-right">Count</th>
                      <th className="py-1 text-right">Share</th>
                      <th className="py-1 text-right">Pipeline Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pipeline || []).map((p, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1 font-semibold">{p.stage}</td>
                        <td className="py-1 text-right font-bold">{p.count}</td>
                        <td className="py-1 text-right">{p.percentage}%</td>
                        <td className="py-1 text-right font-semibold">₹{Number(p.deal_value || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <h4 className="font-bold text-[#0f1f38] border-b pb-1.5 mb-2 text-xs uppercase">3. Listing Aging Analytics</h4>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b text-slate-600 font-bold">
                      <th className="py-1">Age Bracket</th>
                      <th className="py-1 text-right">Sellers</th>
                      <th className="py-1 text-right">Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(aging || []).map((a, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1 font-semibold">{a.range}</td>
                        <td className="py-1 text-right font-bold">{a.count}</td>
                        <td className="py-1 text-right">₹{Number(a.deal_value || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. FOLLOWUP, SOURCE & PROPERTY ANALYTICS */}
            <div className="grid grid-cols-3 gap-4 page-break-inside-avoid">
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <h4 className="font-bold text-[#0f1f38] border-b pb-1.5 mb-2 text-xs uppercase">4. Follow-up Performance</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span>Completed:</span><span className="font-bold text-emerald-700">{followups.completed || 0} ({followups.completion_rate || 0}%)</span></div>
                  <div className="flex justify-between"><span>Pending:</span><span className="font-bold text-sky-700">{followups.pending || 0}</span></div>
                  <div className="flex justify-between"><span>Overdue:</span><span className="font-bold text-rose-700">{followups.overdue || 0}</span></div>
                  <div className="flex justify-between"><span>Unscheduled:</span><span className="font-bold text-amber-700">{followups.sellers_with_no_upcoming || 0}</span></div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <h4 className="font-bold text-[#0f1f38] border-b pb-1.5 mb-2 text-xs uppercase">5. Property Types</h4>
                <div className="space-y-1.5 text-[11px]">
                  {(properties.by_type || []).slice(0, 4).map((pt: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{pt.type}:</span>
                      <span className="font-bold">{pt.count} units</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <h4 className="font-bold text-[#0f1f38] border-b pb-1.5 mb-2 text-xs uppercase">6. Legal Documents</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between"><span>Verified:</span><span className="font-bold text-emerald-700">{documents.verified || 0} ({documents.verification_percentage || 0}%)</span></div>
                  <div className="flex justify-between"><span>Pending:</span><span className="font-bold text-amber-700">{documents.pending || 0}</span></div>
                  <div className="flex justify-between"><span>Joint Owners:</span><span className="font-bold text-indigo-700">{cosellers.joint_owner || 0}</span></div>
                </div>
              </div>
            </div>

            {/* 4. EXECUTIVE / AGENT PERFORMANCE TABLE */}
            <div className="page-break-inside-avoid">
              <h4 className="font-bold text-[#0f1f38] border-b border-slate-200 pb-1 mb-2 text-xs uppercase tracking-wider">
                7. Executive / Agent Performance Analysis
              </h4>
              <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                <thead className="bg-[#0f1f38] text-white font-bold">
                  <tr>
                    <th className="p-1.5 border-r border-slate-700">Agent Name</th>
                    <th className="p-1.5 border-r border-slate-700 text-center">Total Sellers</th>
                    <th className="p-1.5 border-r border-slate-700 text-center">Active</th>
                    <th className="p-1.5 border-r border-slate-700 text-center">Negotiations</th>
                    <th className="p-1.5 border-r border-slate-700 text-center">Closed</th>
                    <th className="p-1.5 border-r border-slate-700 text-right">Pipeline Value (₹)</th>
                    <th className="p-1.5 text-center">Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(executives || []).map((ex, idx) => (
                    <tr key={idx} className="border-b border-slate-200 last:border-0 odd:bg-slate-50">
                      <td className="p-1.5 border-r font-bold text-slate-900">{ex.agent_name}</td>
                      <td className="p-1.5 border-r text-center">{ex.total_sellers}</td>
                      <td className="p-1.5 border-r text-center">{ex.active_sellers}</td>
                      <td className="p-1.5 border-r text-center">{ex.negotiation_count}</td>
                      <td className="p-1.5 border-r text-center font-bold text-emerald-700">{ex.closed_count}</td>
                      <td className="p-1.5 border-r text-right font-semibold">₹{Number(ex.pipeline_value || 0).toLocaleString("en-IN")}</td>
                      <td className="p-1.5 text-center">{ex.response_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. FULL SELLER TABLE DATASET */}
            <div>
              <h4 className="font-bold text-[#0f1f38] border-b border-slate-200 pb-1 mb-2 text-xs uppercase tracking-wider">
                8. Filtered Seller Records Table
              </h4>
              <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                <thead className="bg-[#0f1f38] text-white font-bold">
                  <tr>
                    <th className="p-1.5 border-r border-slate-700">#</th>
                    <th className="p-1.5 border-r border-slate-700">Seller Name</th>
                    <th className="p-1.5 border-r border-slate-700">Contact Phone</th>
                    <th className="p-1.5 border-r border-slate-700">Location</th>
                    <th className="p-1.5 border-r border-slate-700">Stage</th>
                    <th className="p-1.5 border-r border-slate-700 text-right">Expected Price (₹)</th>
                    <th className="p-1.5 border-r border-slate-700 text-center">Days Listed</th>
                    <th className="p-1.5 border-r border-slate-700">Status</th>
                    <th className="p-1.5">Assigned Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-200 odd:bg-slate-50">
                      <td className="p-1.5 border-r font-medium text-slate-500">{idx + 1}</td>
                      <td className="p-1.5 border-r font-bold text-slate-900">{row.salutation ? `${row.salutation} ` : ""}{row.name}</td>
                      <td className="p-1.5 border-r">{row.phone}</td>
                      <td className="p-1.5 border-r">{row.location || row.city || "N/A"}</td>
                      <td className="p-1.5 border-r font-semibold text-blue-800">{row.seller_lead_stage || row.stage || "New"}</td>
                      <td className="p-1.5 border-r text-right font-bold text-emerald-800">₹{Number(row.expected_price || row.deal_value || 0).toLocaleString("en-IN")}</td>
                      <td className="p-1.5 border-r text-center">{row.days_listed !== undefined ? `${row.days_listed} days` : "-"}</td>
                      <td className="p-1.5 border-r font-medium">{row.seller_lead_status || row.status || "Active"}</td>
                      <td className="p-1.5 font-medium">{row.assigned_agent_name || "Unassigned"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Timestamp */}
            <div className="border-t border-slate-300 pt-3 text-center text-[10px] text-slate-500 font-semibold flex justify-between">
              <span>Resale Expert CRM System • Seller Report</span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
