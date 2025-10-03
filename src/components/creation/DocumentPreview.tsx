// DocumentPreview.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Eye, Download, Maximize2, Minimize2, Code, Printer } from "lucide-react";

type TemplateType = {
  name?: string;
  content?: string;
  css?: string;
  variables?: string[];
};

// ---------- Page CSS (grey only for PREVIEW) ----------
const A4_CSS = `<title>RESALE EXPERT</title><style>
body{background:#ccc;font-size:13px;font-family:Verdana, sans-serif;line-height:1.3}
#printDialog{width:210mm;margin:0 auto;}
.main-page{width:210mm;min-height:297mm;margin:10mm auto;background:white;box-shadow:0 0 5px rgba(0,0,0,0.5);}
.sub-page{margin:20px 40px;}
@page{size:A4;margin:0;}
@media print{html,body{width:210mm;height:297mm;}.main-page{margin:0;box-shadow:none;page-break-after:always;}}
</style>`;

const LEGAL_CSS = `<title>RESALE EXPERT</title><style>
body{background:#ccc;font-size:13px;font-family:Verdana, sans-serif;line-height:1.3}
#printDialog{width:216mm;margin:0 auto;}
.main-page{width:216mm;min-height:356mm;margin:10mm auto;background:white;box-shadow:0 0 5px rgba(0,0,0,0.5);}
.sub-page{margin:20px 40px;}
@page{size:Legal;margin:0;}
@media print{html,body{width:216mm;height:356mm;}.main-page{margin:0;box-shadow:none;page-break-after:always;}}
</style>`;

// ---------- helpers ----------
function formatCurrencyINR(val: any) {
  const n = Number(val);
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
function formatDate(val: any) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}
function coerceValue(key: string, value: any) {
  const k = key.toLowerCase();
  if (/(amount|price|sale|token|booking)/.test(k)) return formatCurrencyINR(value);
  if (/(date|_at)$/.test(k)) return formatDate(value);
  if (value === 0) return "0";
  return value ?? "—";
}
function resolvePath(obj: any, path: string) {
  if (!path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}
export function interpolate(html: string, data: Record<string, any>, templateName?: string) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const ctx = { ...data, template_name: templateName ?? "", _today: todayISO };

  return html.replace(/{{\s*([a-zA-Z0-9_\.]+)\s*}}/g, (_m, keyPath) => {
    const val = resolvePath(ctx, keyPath);
    const out = coerceValue(keyPath, val);
    return String(out);
  });
}

export default function DocumentPreview({
  template,
  documentData,
  isVisible = true,
  pageType: initialPageType = "A4",
}: {
  template?: TemplateType;
  documentData?: Record<string, any>;
  isVisible?: boolean;
  pageType?: "A4" | "Legal";
}) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isMaximized, setIsMaximized] = useState(false);
  const [pageType, setPageType] = useState<"A4" | "Legal">(initialPageType);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(800);
  const [downloading, setDownloading] = useState(false);

  const fallbackHtml = useMemo(() => "", []);

  const fullDoc = useMemo(() => {
    const css = template?.css ?? (pageType === "Legal" ? LEGAL_CSS : A4_CSS);
    const rawHtml = template?.content
      ? interpolate(template.content, documentData ?? {}, template?.name)
      : fallbackHtml;

    const hasOuterWrappers =
      /id\s*=\s*["']printDialog["']/.test(rawHtml) ||
      /class\s*=\s*["'][^"']*\bmain-page\b/.test(rawHtml);

    const bodyHtml = hasOuterWrappers
      ? rawHtml
      : `<div id="printDialog"><div class="main-page"><div class="sub-page">${rawHtml}</div></div></div>`;

    const doc = `<!doctype html><html><head><meta charset="utf-8" />${css}
      <style>html,body{margin:0;padding:0;-webkit-print-color-adjust:exact;overflow:auto;}</style>
      </head><body>${bodyHtml}</body></html>`;

    return DOMPurify.sanitize(doc, { ADD_TAGS: ["style"], KEEP_CONTENT: true });
  }, [template?.css, template?.content, pageType, documentData, fallbackHtml, template?.name]);

  // auto-resize iframe height
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const root = doc.documentElement;
      // use max of body/documentElement scrollHeight to capture all pages stacked
      const h = Math.max(root.scrollHeight, doc.body?.scrollHeight ?? 0) + 5;
      setIframeHeight(h);
    };
    iframe.addEventListener("load", onLoad);
    // changing srcDoc re-triggers load
    return () => {
      iframe.removeEventListener("load", onLoad);
    };
  }, [fullDoc]);

  if (!isVisible) return null;

  // ---------- helpers: wait for resources ----------
  async function waitForImages(node: HTMLElement, doc: Document) {
    const imgs = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((res) => {
            if ((img as HTMLImageElement).complete) return res();
            (img as HTMLImageElement).addEventListener("load", () => res(), { once: true });
            (img as HTMLImageElement).addEventListener("error", () => res(), { once: true });
          })
      )
    );
    // also wait a tick for webfonts to apply
    if ((doc as any).fonts && (doc as any).fonts.ready) {
      try {
        await (doc as any).fonts.ready;
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 50));
  }

  // ---------- Actions ----------
  const handlePrint = () => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.focus();
    w.print();
  };

  const handleDownloadPdf = async () => {
    if (!iframeRef.current?.contentDocument) return;
    setDownloading(true);
    try {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const html2canvas = html2canvasModule.default;

      const pageWidthMm = pageType === "Legal" ? 216 : 210;
      const pageHeightMm = pageType === "Legal" ? 356 : 297;

      const srcDoc = iframeRef.current.contentDocument!;
      // collect all `.main-page` nodes; fallback to #printDialog or body
      const pageNodes: HTMLElement[] = Array.from(srcDoc.querySelectorAll(".main-page")) as HTMLElement[];
      if (pageNodes.length === 0) {
        const fallback =
          (srcDoc.getElementById("printDialog") as HTMLElement) ||
          (srcDoc.body as HTMLElement);
        pageNodes.push(fallback);
      }

      const pdf = new jsPDF({
        unit: "mm",
        format: [pageWidthMm, pageHeightMm],
        orientation: "portrait",
        compress: true,
      });

      let firstPdfPage = true;

      for (let idx = 0; idx < pageNodes.length; idx++) {
        const target = pageNodes[idx];

        // make sure images/fonts are ready
        await waitForImages(target, srcDoc);

        // better capture full layout: use scrollWidth/scrollHeight
        const widthPx = target.scrollWidth || target.offsetWidth || 800;
        const heightPx = target.scrollHeight || target.offsetHeight || 1120;

        // pick a scale that keeps ~2000-2500px width for clarity
        const desiredPxWidth = 2400; // ~300dpi look on A4
        const scale = Math.max(1, desiredPxWidth / widthPx);

        const canvas = await html2canvas(target, {
          scale,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: widthPx,
          windowHeight: heightPx,
          // ensure it doesn't clip
          width: widthPx,
          height: heightPx,
          scrollX: 0,
          scrollY: 0,
        });

        // convert canvas to multiple PDF pages if taller than one page
        const pxPerMm = canvas.width / pageWidthMm;
        const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);

        let rendered = 0;
        while (rendered < canvas.height) {
          const sliceHeight = Math.min(pageHeightPx, canvas.height - rendered);

          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext("2d");
          if (!ctx) break;

          ctx.drawImage(
            canvas,
            0,
            rendered,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );

          const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
          const imgWidthMm = pageWidthMm;
          const imgHeightMm = sliceHeight / pxPerMm;

          if (!firstPdfPage) {
            pdf.addPage([pageWidthMm, pageHeightMm], "portrait");
          }
          pdf.addImage(imgData, "JPEG", 0, 0, imgWidthMm, imgHeightMm, undefined, "FAST");
          firstPdfPage = false;

          rendered += sliceHeight;
        }
      }

      const filename = `${(template?.name || "document").toString().replace(/[^\w\-]+/g, "_")}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Couldn't generate the PDF. Check the console for details.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
        isMaximized ? "fixed inset-0 z-50 p-6 bg-white flex flex-col" : ""
      }`}
    >
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("preview")}
            className={`p-2 rounded-md ${
              viewMode === "preview" ? "bg-blue-50 text-blue-700" : "bg-gray-50 hover:bg-gray-100"
            }`}
            title="Preview"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={`p-2 rounded-md ${
              viewMode === "code" ? "bg-blue-50 text-blue-700" : "bg-gray-50 hover:bg-gray-100"
            }`}
            title="HTML"
          >
            <Code size={16} />
          </button>

          <div className="ml-2 flex items-center gap-2">
            <label className="text-sm text-gray-600">Page:</label>
            <select
              value={pageType}
              onChange={(e) => setPageType(e.target.value as "A4" | "Legal")}
              className="px-2 py-1 border rounded bg-white text-sm"
            >
              <option value="A4">A4</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} title="Print" className="p-2 rounded-md bg-gray-50 hover:bg-gray-100">
            <Printer size={16} />
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            title={downloading ? "Generating PDF..." : "Download PDF"}
            className={`p-2 rounded-md ${
              downloading ? "bg-gray-100 text-gray-400" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <Download size={16} />
          </button>

          <button
            title={isMaximized ? "Exit fullscreen" : "Fullscreen"}
            onClick={() => setIsMaximized((s) => !s)}
            className="p-2 rounded-md bg-gray-50 hover:bg-gray-100"
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "preview" ? (
        <div className={isMaximized ? "overflow-auto flex-grow flex justify-center" : "flex justify-center"}>
          <iframe
            ref={iframeRef}
            title={template?.name ?? "Document Preview"}
            style={{ width: "100%", height: iframeHeight, border: "0", background: "#eee" }}
            srcDoc={fullDoc}
          />
        </div>
      ) : (
        <div
          className="bg-gray-900 text-green-300 p-3 rounded font-mono text-xs overflow-auto"
          style={{ maxHeight: isMaximized ? "calc(100vh - 80px)" : 520 }}
        >
          <pre className="whitespace-pre-wrap break-words">
            {template?.content ? interpolate(template.content, documentData ?? {}, template?.name) : fallbackHtml}
          </pre>
        </div>
      )}
    </div>
  );
}
