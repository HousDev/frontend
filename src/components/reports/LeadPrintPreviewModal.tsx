// frontend/src/components/reports/LeadPrintPreviewModal.tsx
import React from "react";
import { X, Printer } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  PRINT_BRAND_STYLE,
  buildBrandHeaderHTML,
  buildWatermarkHTML,
  triggerIframePrint,
} from "@/lib/printUtils";

interface LeadPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  stats?: any;
  funnel?: any[];
  sources?: any[];
  executives?: any[];
  tableData: any[];
}

export const LeadPrintPreviewModal: React.FC<LeadPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  filters = {},
  stats = {},
  funnel = [],
  sources = [],
  executives = [],
  tableData = [],
}) => {
  if (!isOpen) return null;

  const orgName = "RESALE EXPERT";
  const tabName = "LEADS REPORT";

  const handlePrint = () => {
    const headerHTML = buildBrandHeaderHTML("", orgName, tabName);
    const watermarkHTML = buildWatermarkHTML(orgName);

    const activeFilterList = Object.entries(filters)
      .filter(([key, val]) => val && val !== "all" && val !== "true" && key !== "ignoreDate")
      .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val}`);

    const filterBanner = activeFilterList.length > 0 ? activeFilterList.join(" | ") : "All Time / Default Filters";

    // Summary Cards Grid HTML
    const kpiSummaryHTML = `
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:16px;page-break-inside:avoid;">
        <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:8px 12px;border-radius:6px;">
          <div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;">Total Leads</div>
          <div style="font-size:16px;font-weight:800;color:#0f1f38;">${stats.total_count || 0}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:8px 12px;border-radius:6px;">
          <div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;">Fresh Leads</div>
          <div style="font-size:16px;font-weight:800;color:#2563eb;">${stats.fresh_count || 0}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:8px 12px;border-radius:6px;">
          <div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;">Buyer Transfers</div>
          <div style="font-size:16px;font-weight:800;color:#059669;">${stats.buyer_transferred_count || 0}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:8px 12px;border-radius:6px;">
          <div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;">Conversion Rate</div>
          <div style="font-size:16px;font-weight:800;color:#7c3aed;">${stats.conversion_rate || 0}%</div>
        </div>
      </div>
    `;

    // Funnel Breakdown HTML
    const funnelRows = (funnel || []).map((f) => `
      <tr>
        <td style="font-weight:700;">${f.label}</td>
        <td style="text-align:center;font-weight:800;">${f.count}</td>
        <td style="text-align:right;font-weight:700;color:#2563eb;">${f.pct}%</td>
      </tr>
    `).join("");

    // Executive Performance HTML
    const execRows = (executives || []).slice(0, 8).map((e) => `
      <tr>
        <td style="font-weight:700;">${e.executive_name}</td>
        <td style="text-align:center;font-weight:700;">${e.assigned_leads}</td>
        <td style="text-align:center;">${e.fresh_count}</td>
        <td style="text-align:center;">${e.interested_count}</td>
        <td style="text-align:center;font-weight:700;color:#059669;">${e.buyer_transfers}</td>
        <td style="text-align:center;font-weight:700;color:#d97706;">${e.seller_transfers}</td>
        <td style="text-align:right;font-weight:800;color:#7c3aed;">${e.conversion_rate}%</td>
      </tr>
    `).join("");

    // Detailed Leads Table HTML
    const tableRows = (tableData || []).map((row, idx) => `
      <tr>
        <td style="text-align:center;font-weight:700">${idx + 1}</td>
        <td style="font-weight:700">${row.salutation ? row.salutation + ' ' : ''}${row.name || 'N/A'}</td>
        <td>${row.phone || row.email || 'N/A'}</td>
        <td>${row.city || row.location || 'N/A'}</td>
        <td>${row.lead_source || 'Direct'}</td>
        <td><span style="font-weight:700;text-transform:uppercase">${row.status || 'New'}</span></td>
        <td>${row.assigned_executive_name || 'Unassigned'}</td>
        <td style="font-weight:700;color:#047857">${row.outcome || 'In Pipeline'}</td>
      </tr>
    `).join("");

    const contentHTML = `
      ${watermarkHTML}
      ${headerHTML}
      <div class="meta-line">
        <span>Module: ${tabName}</span>
        <span>Active Filters: ${filterBanner}</span>
        <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
      </div>

      <div style="margin-bottom:12px;font-size:11px;font-weight:800;color:#0f1f38;text-transform:uppercase;">1. Key Performance Indicators</div>
      ${kpiSummaryHTML}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;page-break-inside:avoid;">
        <div>
          <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">2. Lead Conversion Funnel</div>
          <table>
            <thead>
              <tr>
                <th>Funnel Stage</th>
                <th style="text-align:center">Leads Count</th>
                <th style="text-align:right">% Share</th>
              </tr>
            </thead>
            <tbody>
              ${funnelRows}
            </tbody>
          </table>
        </div>
        <div>
          <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">3. Executive Performance</div>
          <table>
            <thead>
              <tr>
                <th>Executive</th>
                <th style="text-align:center">Assigned</th>
                <th style="text-align:center">Fresh</th>
                <th style="text-align:center">Interested</th>
                <th style="text-align:center">Buyer</th>
                <th style="text-align:center">Seller</th>
                <th style="text-align:right">Conv %</th>
              </tr>
            </thead>
            <tbody>
              ${execRows}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-bottom:6px;font-size:10px;font-weight:800;color:#0f1f38;text-transform:uppercase;">4. Filtered Detailed Leads Table (${tableData.length} records)</div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;text-align:center">#</th>
            <th>LEAD NAME</th>
            <th>CONTACT</th>
            <th>LOCATION</th>
            <th>SOURCE</th>
            <th>STATUS</th>
            <th>ASSIGNED AGENT</th>
            <th>OUTCOME</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <span>${orgName} • Complete Lead Lifecycle BI Report</span>
        <span>Confidential & Proprietary Data</span>
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${orgName}_Leads_Report</title>
          <style>${PRINT_BRAND_STYLE}</style>
        </head>
        <body>
          ${contentHTML}
        </body>
      </html>
    `;

    triggerIframePrint(fullHtml, `${orgName}_Leads_Report`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f1f38] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Print Leads Report Preview</h2>
              <p className="text-xs text-slate-300">Format document & send directly to printer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-gray-700 bg-slate-50">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
            <div className="font-bold text-gray-900 text-sm">Print Options & Document Summary</div>
            <div className="grid grid-cols-2 gap-4 text-gray-600">
              <div>
                <span className="font-semibold text-gray-800 block">Report Title:</span>
                Leads Acquisition & Conversion BI Report
              </div>
              <div>
                <span className="font-semibold text-gray-800 block">Records Included:</span>
                {tableData.length} filtered leads
              </div>
              <div>
                <span className="font-semibold text-gray-800 block">Header Style:</span>
                Company Logo & Brand Watermark
              </div>
              <div>
                <span className="font-semibold text-gray-800 block">Orientation:</span>
                Landscape Print Optimised
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>
    </div>
  );
};
