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
  .chart-section{page-break-inside:avoid;margin-bottom:20px;border:1px solid #e2e8f0;padding:12px;border-radius:8px;background:#fff}
  .chart-title{font-size:12px;font-weight:800;color:#0f1f38;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px}
  table{width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:16px}
  th{background:#f1f5f9;text-align:left;font-weight:800;text-transform:uppercase;font-size:8px;letter-spacing:0.5px;color:#334155;border:1px solid #cbd5e1;padding:8px 10px}
  td{border:1px solid #e2e8f0;padding:7px 10px;color:#1e293b}
  tr:nth-child(even) td{background:#f8fafc}
  .footer{margin-top:16px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:9px;color:#94a3b8;display:flex;justify-content:space-between;font-weight:600}
  .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);font-size:80px;font-weight:900;color:rgba(15,31,56,0.05);white-space:nowrap;pointer-events:none;user-select:none;z-index:-1;letter-spacing:8px;text-transform:uppercase}
  @media print {
    .watermark{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    tr:nth-child(even) td { background: rgba(248,250,252, 0.45) !important; }
    td { background: rgba(255,255,255, 0.7) !important; }
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
  return `<div class="watermark">${fullName}</div>`;
}

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
