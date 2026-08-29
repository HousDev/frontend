// frontend/src/components/reports/ExportPreviewModal.tsx
import React from "react";
import { Download, X, FileSpreadsheet, CheckCircle2, Table, Filter, Calendar } from "lucide-react";
import { SmartFilterParams } from "./SmartFilterDrawer";

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabKey: string;
  tabTitle: string;
  data: any[];
  filters?: SmartFilterParams;
  onConfirmDownload: () => void;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  tabKey,
  tabTitle,
  data = [],
  filters = {},
  onConfirmDownload,
}) => {
  if (!isOpen) return null;

  // Determine Columns dynamically based on Tab Key
  const getColumns = (): { key: string; label: string }[] => {
    switch (tabKey) {
      case "leads":
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "NAME & ID" },
          { key: "phone", label: "PHONE" },
          { key: "email", label: "EMAIL" },
          { key: "location", label: "LOCATION" },
          { key: "lead_type", label: "TYPE" },
          { key: "lead_source", label: "SOURCE" },
          { key: "stage", label: "STAGE" },
          { key: "status", label: "STATUS" },
          { key: "assigned_executive_name", label: "ASSIGNED AGENT" },
        ];
      case "buyers":
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "BUYER NAME" },
          { key: "phone", label: "PHONE" },
          { key: "email", label: "EMAIL" },
          { key: "location", label: "LOCATION" },
          { key: "budget", label: "BUDGET RANGE" },
          { key: "property_type", label: "PROP TYPE" },
          { key: "status", label: "STATUS" },
          { key: "assigned_executive_name", label: "ASSIGNED AGENT" },
        ];
      case "sellers":
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "SELLER NAME" },
          { key: "phone", label: "PHONE" },
          { key: "email", label: "EMAIL" },
          { key: "location", label: "LOCATION" },
          { key: "price", label: "EXPECTED PRICE" },
          { key: "status", label: "STATUS" },
          { key: "assigned_executive_name", label: "ASSIGNED AGENT" },
        ];
      case "tenants":
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "TENANT NAME" },
          { key: "phone", label: "PHONE" },
          { key: "email", label: "EMAIL" },
          { key: "location", label: "LOCATION" },
          { key: "bhk", label: "PREFERRED BHK" },
          { key: "tenant_type", label: "TYPE" },
          { key: "status", label: "STATUS" },
        ];
      case "owners":
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "OWNER NAME" },
          { key: "phone", label: "PHONE" },
          { key: "email", label: "EMAIL" },
          { key: "location", label: "LOCATION" },
          { key: "status", label: "STATUS" },
          { key: "assigned_executive_name", label: "ASSIGNED AGENT" },
        ];
      case "properties":
        return [
          { key: "index", label: "S.NO" },
          { key: "title", label: "PROPERTY TITLE / SOCIETY" },
          { key: "mode", label: "MODE" },
          { key: "property_type", label: "TYPE" },
          { key: "unit_type", label: "BHK" },
          { key: "location", label: "LOCATION" },
          { key: "price", label: "ASKING PRICE / RENT" },
          { key: "status", label: "STATUS" },
        ];
      case "transactions":
        return [
          { key: "index", label: "S.NO" },
          { key: "receipt_id", label: "RECEIPT ID" },
          { key: "party_name", label: "PARTY NAME" },
          { key: "amount", label: "AMOUNT (₹)" },
          { key: "type", label: "TYPE" },
          { key: "payment_status", label: "STATUS" },
          { key: "created_at", label: "DATE" },
        ];
      case "agent-execution":
      case "activities":
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "EXECUTIVE NAME" },
          { key: "role", label: "ROLE" },
          { key: "department", label: "DEPARTMENT" },
          { key: "assigned_leads", label: "ASSIGNED LEADS" },
          { key: "calls_done", label: "CALLS DONE" },
          { key: "interested", label: "QUALIFIED / INTERESTED" },
          { key: "converted", label: "CONVERTED" },
        ];
      case "campaigns":
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "CAMPAIGN NAME" },
          { key: "type", label: "TYPE" },
          { key: "total_audience", label: "AUDIENCE" },
          { key: "sent_count", label: "SENT" },
          { key: "delivered_count", label: "DELIVERED" },
          { key: "read_count", label: "READ" },
          { key: "status", label: "STATUS" },
        ];
      default:
        return [
          { key: "index", label: "S.NO" },
          { key: "name", label: "METRIC / RECORD" },
          { key: "type", label: "CATEGORY" },
          { key: "value", label: "VALUE / COUNT" },
          { key: "status", label: "STATUS" },
        ];
    }
  };

  const columns = getColumns();
  const previewData = data.slice(0, 15); // Show first 15 rows in preview

  const renderCellContent = (row: any, colKey: string, index: number) => {
    switch (colKey) {
      case "index":
        return <span className="font-mono text-slate-500">{index + 1}</span>;
      case "name":
        return (
          <div className="font-bold text-slate-900 truncate max-w-[180px]">
            {row.salutation ? `${row.salutation} ` : ""}
            {row.name || row.buyer_name || rName(row) || "N/A"}
            {(row.id || row.lead_id) && (
              <span className="block text-[10px] text-indigo-600 font-mono font-medium">
                #{row.id || row.lead_id}
              </span>
            )}
          </div>
        );
      case "title":
        return (
          <div className="font-bold text-slate-900 truncate max-w-[200px]">
            {row.title || row.society_name || `Property #${row.id}`}
          </div>
        );
      case "receipt_id":
        return <span className="font-mono font-bold text-indigo-700">#{row.receipt_id || row.id}</span>;
      case "phone":
        return <span className="font-medium text-slate-700">{row.phone || row.whatsapp_number || "N/A"}</span>;
      case "email":
        return <span className="text-slate-600 truncate max-w-[150px] block">{row.email || "N/A"}</span>;
      case "location":
        return <span className="font-medium text-slate-800">{row.location || row.city || row.location_name || "N/A"}</span>;
      case "lead_type":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">{row.lead_type || "Buyer"}</span>;
      case "lead_source":
        return <span className="font-medium text-slate-700">{row.lead_source || row.source || "Website"}</span>;
      case "stage":
        return <span className="font-bold text-indigo-800 text-[11px]">{row.stage || row.buyer_lead_stage || "New"}</span>;
      case "status":
      case "payment_status":
        const st = String(row.status || row.buyer_lead_status || row.payment_status || "Active");
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {st}
          </span>
        );
      case "budget":
        const minB = row.budget_min ? Number(row.budget_min).toLocaleString("en-IN") : "0";
        const maxB = row.budget_max ? Number(row.budget_max).toLocaleString("en-IN") : "Any";
        return <span className="font-bold text-emerald-800">₹{minB} - ₹{maxB}</span>;
      case "price":
      case "amount":
        const val = row.expected_price || row.final_price || row.amount || row.budget_max || 0;
        return <span className="font-bold text-emerald-800">₹{Number(val).toLocaleString("en-IN")}</span>;
      case "bhk":
      case "unit_type":
        return <span className="font-semibold text-slate-700">{row.unit_type || row.preferred_bhk || "2 BHK"}</span>;
      case "mode":
        return <span className="font-bold text-slate-700">{row.mode === "rental" ? "For Rent" : "For Sale"}</span>;
      case "assigned_executive_name":
        return <span className="font-medium text-slate-800">{row.assigned_executive_name || row.assigned_agent_name || "Unassigned"}</span>;
      case "created_at":
        return <span className="text-slate-600 text-[11px]">{row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "N/A"}</span>;
      case "assigned_leads":
        return <span className="font-bold text-slate-900">{row.total_assigned_leads || row.assigned_leads || row.value || 0}</span>;
      case "calls_done":
        return <span className="font-bold text-blue-700">{row.calls_completed || row.calls_done || 0}</span>;
      case "interested":
        return <span className="font-bold text-purple-700">{row.interested_leads || row.qualified || 0}</span>;
      case "converted":
        return <span className="font-bold text-emerald-800">{row.converted_leads || row.closed || 0}</span>;
      default:
        return <span className="text-slate-700 font-medium">{String(row[colKey] ?? "N/A")}</span>;
    }
  };

  function rName(r: any) {
    return r.name || r.buyer_name || r.agentName || r.user_name || r.society_name || r.title || r.receipt_id || "";
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="bg-[#0f1f38] text-white px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
                  Export Preview — {tabTitle}
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {data.length} Total Records
                  </span>
                </h2>
                <div className="text-[11px] text-slate-300 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Table className="w-3 h-3 text-slate-400" /> Showing first {previewData.length} preview rows
                  </span>
                  {filters?.startDate && filters?.endDate && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Calendar className="w-3 h-3" /> Range: {filters.startDate} to {filters.endDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Preview Table */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-[10px] uppercase tracking-wider">
                      {columns.map((col) => (
                        <th key={col.key} className="p-3">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                        {columns.map((col) => (
                          <td key={col.key} className="p-3">
                            {renderCellContent(row, col.key, idx)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {previewData.length === 0 && (
                      <tr>
                        <td colSpan={columns.length} className="p-8 text-center text-slate-400 italic">
                          No records found to export under current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {data.length > 15 && (
              <div className="text-center text-[11px] text-slate-500 italic mt-3 font-medium">
                ... and {data.length - 15} more records will be exported to the Excel / CSV spreadsheet file.
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ready for download in standard <strong>Excel (.csv)</strong> format.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmDownload();
                  onClose();
                }}
                disabled={data.length === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Excel ({data.length} Records)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
