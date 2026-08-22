// frontend/src/components/reports/DocumentReportTab.tsx
import React from "react";
import { FileText, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

interface DocumentReportTabProps {
  documentSummary: { total_generated: number; total_draft: number; total_pending: number; total_completed: number };
  digioSummary: { total_digio_docs: number; digio_signed: number; digio_pending: number };
  loading?: boolean;
}

export const DocumentReportTab: React.FC<DocumentReportTabProps> = ({
  documentSummary = { total_generated: 0, total_draft: 0, total_pending: 0, total_completed: 0 },
  digioSummary = { total_digio_docs: 0, digio_signed: 0, digio_pending: 0 },
  loading = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Generated Documents Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" /> Generated Document Templates Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-xs text-gray-500">Total Documents Generated</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{documentSummary.total_generated || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="text-xs text-blue-700 font-medium">Drafts</div>
            <div className="text-2xl font-bold text-blue-800 mt-1">{documentSummary.total_draft || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-xs text-amber-700 font-medium">Pending Signatures</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">{documentSummary.total_pending || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="text-xs text-emerald-700 font-medium">Completed & Signed</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{documentSummary.total_completed || 0}</div>
          </div>
        </div>
      </div>

      {/* Digio E-Sign Integration Summary */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" /> Digio Digital Signature Integration Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div className="text-xs text-purple-700 font-medium">Digio Requests Created</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{digioSummary.total_digio_docs || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="text-xs text-emerald-700 font-medium">Digitally Signed via Digio</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{digioSummary.digio_signed || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-xs text-amber-700 font-medium">Pending Client Signatures</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">{digioSummary.digio_pending || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
