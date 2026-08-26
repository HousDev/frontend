// frontend/src/lib/printUtils.ts

export const PRINT_BRAND_STYLE = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#0f172a;font-size:11px;padding:24px;background:#fff;position:relative}
  .brand-header{display:flex;align-items:center;background:#fff;border-bottom:2.5px solid #0f1f38;border-radius:8px;padding:12px 16px;margin-bottom:14px}
  .brand-logo-wrap{width:160px;flex-shrink:0;display:flex;align-items:center;justify-content:flex-start}
  .brand-logo{max-height:48px;max-width:150px;width:auto;object-fit:contain;display:block}
  .brand-center{flex:1;text-align:center;padding:0 12px}
  .brand-name{font-size:22px;font-weight:900;color:#0f1f38;letter-spacing:-0.5px;text-transform:uppercase}
  .brand-sub{font-size:11px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
  .brand-right{width:140px;flex-shrink:0;text-align:right;font-size:9.5px;color:#64748b;line-height:1.4}
  .brand-right .label{font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;display:block;font-size:8.5px}
  .meta-line{display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#475569;font-weight:600;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:14px}
  .stats-grid{display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:16px}
  .stat-box{padding:10px 12px;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;display:flex;flex-direction:column;justify-content:space-between}
  .stat-lbl{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#64748b}
  .stat-val{font-size:15px;font-weight:900;color:#0f1f38;margin-top:3px;letter-spacing:-0.5px}
  .chart-section{page-break-inside:avoid;margin-bottom:20px;border:1px solid #cbd5e1;padding:22px 15px 15px 15px;border-radius:10px;background:rgba(255,255,255,0.85);overflow:visible!important;box-sizing:border-box!important;text-align:center!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important}
  .chart-title{font-size:12px;font-weight:800;color:#0f1f38;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;text-align:center!important}
  .recharts-responsive-container{max-width:100%!important;overflow:visible!important;box-sizing:border-box!important;margin:0 auto!important;display:flex!important;justify-content:center!important;align-items:center!important}
  .recharts-wrapper{margin:0 auto!important;position:relative!important;overflow:visible!important}
  .recharts-surface{margin:0 auto!important;display:block!important;overflow:visible!important}
  .recharts-legend-wrapper{display:none!important}
  svg{max-width:100%!important;height:auto!important;margin:0 auto!important;display:block!important;overflow:visible!important}
  table{width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:16px;background:rgba(255,255,255,0.85)}
  th{background:rgba(241,245,249,0.9);text-align:left;font-weight:800;text-transform:uppercase;font-size:8px;letter-spacing:0.5px;color:#334155;border:1px solid #cbd5e1;padding:8px 10px}
  td{border:1px solid #cbd5e1;padding:7px 10px;color:#1e293b;background:rgba(255,255,255,0.85)}
  tr:nth-child(even) td{background:rgba(248,250,252,0.88)}
  .footer{margin-top:16px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;display:flex;justify-content:space-between;font-weight:600}
  .watermark{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%) rotate(-28deg);font-size:90px;font-weight:900;color:rgba(12,56,84,0.25);white-space:nowrap;pointer-events:none;user-select:none;z-index:999999;letter-spacing:8px;text-transform:uppercase;opacity:0.25!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @media print {
    .watermark{ -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; opacity:0.25!important; display:block!important; z-index:999999!important; visibility:visible!important; color:rgba(12,56,84,0.25)!important; }
    .chart-section, .stat-box, .meta-line, .insights-box { background: rgba(255,255,255,0.85) !important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
    tr:nth-child(even) td { background: rgba(248,250,252,0.85) !important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
    td { background: rgba(255,255,255,0.85) !important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
    .chart-section { page-break-inside: avoid; }
  }
`;

export function buildBrandHeaderHTML(orgLogo: string, orgName: string, subtitle: string) {
  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png";
  return `<div class="brand-header">
    <div class="brand-logo-wrap">
      <img class="brand-logo" src="${logoUrl}" alt="${orgName} Logo" />
    </div>
    <div class="brand-center">
      <div class="brand-name">${orgName}</div>
      <div class="brand-sub">${subtitle}</div>
    </div>
    <div class="brand-right">
      <span class="label">Report Date</span>
      <span style="font-weight:800;color:#0f1f38">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
    </div>
  </div>`;
}

export function buildWatermarkHTML(orgName: string) {
  const fullName = orgName || "RESALE EXPERT";
  return `<div class="watermark" style="position:fixed;top:40%;left:50%;transform:translate(-50%,-50%) rotate(-28deg);font-size:90px;font-weight:900;color:rgba(12,56,84,0.25);white-space:nowrap;pointer-events:none;user-select:none;z-index:999999;letter-spacing:8px;text-transform:uppercase;opacity:0.25!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;">${fullName}</div>`;
}

// Standard Hidden-Iframe Print Trigger (Opens Native Print Dialog inside Current Tab - No Extra Window/Tab)
export function triggerIframePrint(htmlContent: string, pdfDocumentTitle: string) {
  const originalTitle = document.title;
  document.title = pdfDocumentTitle;

  let iframe = document.getElementById("__print_frame") as HTMLIFrameElement | null;
  if (iframe) {
    iframe.remove();
  }

  iframe = document.createElement("iframe");
  iframe.id = "__print_frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.title = originalTitle;
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    try {
      iframe!.contentWindow?.focus();
      iframe!.contentWindow?.print();
    } catch (e) {
      console.error("Print error:", e);
    }
    setTimeout(() => {
      document.title = originalTitle;
    }, 3000);
  }, 400);
}
