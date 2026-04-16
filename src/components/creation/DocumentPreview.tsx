// DocumentPreview.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Eye, Download, Maximize2, Minimize2, Code, Printer } from "lucide-react";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";

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
  // 🆕  server doc id + optional pre-save hook
  documentId,
  onEnsureSaved, // call karke make sure doc server pe create/update ho chuka ho
}: {
  template?: TemplateType;
  documentData?: Record<string, any>;
  isVisible?: boolean;
  pageType?: "A4" | "Legal";
  documentId?: number | string | null;
  onEnsureSaved?: () => Promise<void>;
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
      const h = Math.max(root.scrollHeight, doc.body?.scrollHeight ?? 0) + 5;
      setIframeHeight(h);
    };
    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
    };
  }, [fullDoc]);

  if (!isVisible) return null;

  // ---------- Actions ----------
  const handlePrint = () => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.focus();
    w.print();
  };

  // 🆕 API-based download
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);

      // make sure server me latest content save ho chuka ho
      if (onEnsureSaved) {
        await onEnsureSaved();
      }

      if (!documentId) {
        alert("Document not saved yet. Please save or generate first.");
        return;
      }

      await documentsGeneratedAPI.downloadPdf(documentId, {
        page: pageType.toLowerCase() as "a4" | "legal",
        filenameFallback:
          `${(template?.name || "document").toString().replace(/[^\w\-]+/g, "_")}.pdf`,
      });
    } catch (err) {
      console.error("PDF download failed:", err);
      alert(err instanceof Error ? err.message : "Failed to download PDF");
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
            title={downloading ? "Downloading..." : "Download PDF"}
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
            style={{ width: "100%", height: iframeHeight, border: "0", background: "#eee" } as any}
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
