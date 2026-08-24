// frontend/src/components/reports/PrintReportModal.tsx
import React from "react";
import { Printer, X, Sparkles, CheckCircle2, AlertTriangle, Building, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: any;
  insightsData?: string[];
  tabTitle?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  summaryData,
  insightsData = [],
  tabTitle = "OVERALL REPORT",
}) => {
  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  const crm = summaryData?.crmKpis || {};
  const prop = summaryData?.propertyKpis || {};
  const act = summaryData?.activityKpis || {};
  const biz = summaryData?.businessKpis || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Modal Top Bar */}
        <div className="p-4 bg-[#0f1f38] text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm">Print Preview — Executive Report PDF</h3>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleTriggerPrint}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body Matching PDF Specification */}
        <div className="p-8 flex-1 overflow-y-auto print-area space-y-6 text-gray-900 bg-white">
          {/* Header Block Matching PDF Page 1 */}
          <div className="border-b-2 border-navy-900 pb-4 flex items-center justify-between">
            <div>
              <div className="text-xl font-black tracking-tight text-[#0f1f38] flex items-center gap-2">
                <Building className="w-6 h-6 text-orange-500" /> RESALE EXPERT
              </div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                REAL ESTATE CRM & CMS BUSINESS INTELLIGENCE
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-gray-900 uppercase">{tabTitle}</div>
              <div className="text-xs text-gray-500 font-medium">
                Report Date: {new Date().toLocaleDateString("en-IN")}
              </div>
              <div className="text-[11px] text-gray-400">
                Generated: {new Date().toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Sub Header Specs */}
          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700">
            <div>Property Scope: <span className="font-bold text-gray-900">All Properties</span></div>
            <div>Period: <span className="font-bold text-gray-900">All Time</span></div>
            <div>Status: <span className="font-bold text-emerald-700">Active Audit</span></div>
          </div>

          {/* Key Metrics Grid Matching PDF Stat Boxes */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Executive Summary KPIs</h4>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-[11px] text-blue-700 font-semibold uppercase">Total Leads</div>
                <div className="text-xl font-bold text-blue-900 mt-1">{crm.totalLeads || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                <div className="text-[11px] text-purple-700 font-semibold uppercase">Qualified Leads</div>
                <div className="text-xl font-bold text-purple-900 mt-1">{crm.qualifiedLeads || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] text-emerald-700 font-semibold uppercase">Converted Deals</div>
                <div className="text-xl font-bold text-emerald-900 mt-1">{crm.convertedLeads || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-[11px] text-amber-700 font-semibold uppercase">Conversion Rate</div>
                <div className="text-xl font-bold text-amber-900 mt-1">{crm.conversionRate || 0}%</div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <div className="text-[11px] text-teal-700 font-semibold uppercase">Active Listings</div>
                <div className="text-xl font-bold text-teal-900 mt-1">{prop.activeListings || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="text-[11px] text-indigo-700 font-semibold uppercase">Total Properties</div>
                <div className="text-xl font-bold text-indigo-900 mt-1">{prop.totalProperties || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] text-emerald-700 font-semibold uppercase">Revenue Collected</div>
                <div className="text-xl font-bold text-emerald-900 mt-1">
                  ₹{Number(biz.revenueCollected || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-700 font-semibold uppercase">Site Visits Completed</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{act.completedVisits || 0}</div>
              </div>
            </div>
          </div>

          {/* AI Insights & Diagnostic Briefing Box Matching PDF Page 8 */}
          <div className="bg-[#0f1f38] text-white p-5 rounded-2xl shadow-lg border border-indigo-900 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">
                    EXECUTIVE DIAGNOSTIC & ACTION BRIEFING
                  </h4>
                  <div className="text-[10px] text-gray-300">Resale Expert AI Business Intelligence System</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  HEALTH: GOOD
                </span>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  SCORE: 85/100
                </span>
              </div>
            </div>

            {/* Key Takeaway Banner */}
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs">
              <span className="font-bold text-orange-400 uppercase tracking-wide mr-2">KEY TAKEAWAY:</span>
              <span>
                Lead pipeline is active with {crm.totalLeads || 0} total record(s). Accelerate qualified site visits to boost overall revenue collection.
              </span>
            </div>

            {/* AI Action Points */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> TOP PRIORITY ISSUES & IMMEDIATE ACTIONS
              </div>
              {insightsData.map((ins, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-1">
                  <div className="font-semibold text-gray-100">{idx + 1}. {ins}</div>
                  <div className="text-[11px] text-emerald-300 font-bold flex items-center gap-1 mt-1">
                    ⚡ DO THIS TODAY: Execute targeted follow-ups with assigned executives on high-priority leads.
                  </div>
                </div>
              ))}
            </div>

            {/* 2-Column Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/10">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-200">
                <div className="font-bold flex items-center gap-1 text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> What's Going Well
                </div>
                <div className="text-[11px] space-y-1">
                  <div>✓ {crm.convertedLeads || 0} deal(s) converted successfully.</div>
                  <div>✓ Active inventory maintained at {prop.activeListings || 0} properties.</div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-200">
                <div className="font-bold flex items-center gap-1 text-amber-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Things To Watch
                </div>
                <div className="text-[11px] space-y-1">
                  <div>• Track stale listings older than 90 days.</div>
                  <div>• Follow up on pending site visit schedules.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Timestamp */}
          <div className="border-t border-gray-200 pt-3 text-[10px] text-gray-400 flex items-center justify-between">
            <div>Resale Expert Real Estate CRM/CMS BI Report</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>

      {/* Embedded CSS for clean PDF printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
