import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { X, RefreshCw, FileText, Copy as CopyIcon, Download, Plus, MapPin, Trash2, CheckCircle } from "lucide-react";
import { Document as PdfDocument, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";

/* ---------- PDF.js worker (Vite + ESM) ---------- */
const __g: any = globalThis as any;
if (!__g.__pdfjsWorkerSet__) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  __g.__pdfjsWorkerSet__ = true;
}

/* ----------------------------- Types ----------------------------- */
type Tick = {
  id: string;
  page: number;
  x: number;   // overlay px
  y: number;   // overlay px
  size: number; // width/height px
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | string;
};

const toast = { success: console.log, error: console.error, info: console.info };
const uid = (p = "") => `${p}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function base64ToUint8(b64: string): Uint8Array {
  try {
    const pure = b64.includes(",") ? b64.split(",")[1] : b64;
    const bin = atob(pure.replace(/\s/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch (e) {
    console.error("base64ToUint8 failed:", e);
    return new Uint8Array();
  }
}

/* ---------------- Small modal for JSON ---------------- */
function CoordsModal({
  json,
  onClose,
  textareaRef,
}: {
  json: string;
  onClose: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json || "{}");
      toast.success("Coordinates copied to clipboard.");
    } catch {
      toast.error("Copy failed.");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([json || "{}"], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tick-coordinates-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed.");
    }
  };

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropClick}
      className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="text-base font-semibold">Tick Coordinates JSON</h4>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-600 mb-2">Read-only preview. Copy or download to use in your payload.</p>
          <textarea
            ref={textareaRef}
            value={json}
            readOnly
            className="w-full h-80 text-xs font-mono border rounded-lg p-3 bg-gray-50"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">Boxes are in screen px; JSON is normalized using current PDF scale.</div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-100">
              <CopyIcon size={14} /> Copy
            </button>
            <button onClick={handleDownload} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Green Tick SVG ---------------- */
const GreenTick = ({ size = 36 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="green" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" opacity="0.08" fill="green" />
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ---------------- Main: PdfTickMarkerModal ---------------- */
export default function PdfTickMarkerModal({ isOpen, onClose, documentId }: Props) {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("Document.pdf");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>("");
  const [reactPdfError, setReactPdfError] = useState<string>("");
  const [progress, setProgress] = useState<{ loaded: number; total?: number } | null>(null);

  const [numPages, setNumPages] = useState(1);
  const [pageBaseWidth, setPageBaseWidth] = useState<number | null>(null); // viewport width at scale=1
  const [pdfScale, setPdfScale] = useState(1);

  const memoPdfFile = useMemo(() => (pdfBytes ? { data: new Uint8Array(pdfBytes) } : null), [pdfBytes]);
  const docKey = useMemo(() => (pdfBytes ? `pdf-${pdfBytes.length}-${pdfBytes[0] ?? 0}` : "none"), [pdfBytes]);

  // overlay state
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [moving, setMoving] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; corner: "se"; ox: number; oy: number; oSize: number } | null>(null);

  const [coordsJson, setCoordsJson] = useState<string>("{}");
  const [showCoordsModal, setShowCoordsModal] = useState(false);
  const coordsTextAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // container + per-page overlay sizes
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const pageWrapRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const overlaySizes = useRef<Record<number, { width: number; height: number }>>({});

  /* ---------- Load PDF via API ---------- */
  useEffect(() => {
    if (!isOpen || !documentId) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setProgress(null);
      setLoadError("");
      setReactPdfError("");
      setPdfBytes(null);
      setNumPages(1);
      setPageBaseWidth(null);
      setTicks([]);
      try {
        const details = await documentsGeneratedAPI.getById(documentId);
        const b64: string | undefined =
          (details as any)?.pdf_base64 || (details as any)?.data?.pdf_base64 || (details as any)?.data?.pdfBase64;

        const fname: string | undefined =
          (details as any)?.file_name || (details as any)?.data?.file_name || (details as any)?.data?.fileName;
        if (fname) setFileName(fname);

        if (!b64) throw new Error("API must return pdf_base64 for this viewer.");
        const bytes = base64ToUint8(b64);
        if (!alive) return;
        if (!bytes || !bytes.length) throw new Error("Invalid PDF bytes");
        setPdfBytes(new Uint8Array(bytes));
      } catch (e: any) {
        console.error("❌ PDF load error:", e);
        if (!alive) return;
        setLoadError(e?.message || "Failed to load PDF");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [isOpen, documentId]);

  /* ---------- Fit width scaling ---------- */
  const onAnyPageLoad = (page: any) => {
    try {
      if (!pageBaseWidth) {
        const vw = page.getViewport({ scale: 1 }).width;
        setPageBaseWidth(vw);
      }
    } catch (e) {
      console.warn("viewport read failed", e);
    }
  };

  useEffect(() => {
    const calc = () => {
      if (!pageBaseWidth || !pageContainerRef.current) return;
      const cw = pageContainerRef.current.clientWidth;
      const target = Math.max(320, cw - 32);
      const scale = target / pageBaseWidth;
      setPdfScale(Math.min(2, Math.max(0.4, scale)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [pageBaseWidth]);

  /* ---------- visible page ---------- */
  const getCurrentVisiblePage = (): number => {
    const sc = pageContainerRef.current;
    if (!sc) return 1;
    let bestPage = 1;
    let bestOverlap = -Infinity;
    const viewTop = sc.scrollTop;
    const viewBottom = viewTop + sc.clientHeight;

    for (let p = 1; p <= numPages; p++) {
      const el = pageWrapRefs.current[p];
      if (!el) continue;
      const top = el.offsetTop;
      const bottom = top + el.clientHeight;
      const overlap = Math.min(viewBottom, bottom) - Math.max(viewTop, top);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestPage = p;
      }
    }
    return bestPage;
  };

  /* ---------- JSON recompute (normalize to PDF coordinates) ---------- */
  const recomputeJson = (arr: Tick[] = ticks) => {
    // For each tick, convert overlay px (scaled) to PDF space (scale=1)
    // and output as llx,lly,urx,ury
    const out: Record<string, Array<{ llx: number; lly: number; urx: number; ury: number; width: number; height: number }>> = {};
    arr.forEach((t) => {
      const p = String(t.page);
      const llx = Math.round(t.x / pdfScale);
      const urx = Math.round((t.x + t.size) / pdfScale);
      const ury = Math.round(t.y / pdfScale);
      const lly = Math.round((t.y + t.size) / pdfScale);
      (out[p] ||= []).push({
        llx, lly, urx, ury,
        width: Math.round(t.size / pdfScale),
        height: Math.round(t.size / pdfScale),
      });
    });
    setCoordsJson(JSON.stringify(out, null, 2));
  };

  useEffect(() => { recomputeJson(); /* eslint-disable-next-line */ }, [ticks, pdfScale]);

  /* ---------- helpers ---------- */
  const toLocalXY = (e: React.MouseEvent<HTMLDivElement>, el: HTMLDivElement) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const addTick = () => {
    const page = getCurrentVisiblePage();
    const size = overlaySizes.current[page];
    const S = 40;
    let x = 80, y = 120;
    if (size) {
      x = Math.max(8, Math.round((size.width - S) / 2));
      y = Math.max(8, Math.round((size.height - S) / 3));
    }
    setTicks((p) => [...p, { id: uid("tick-"), page, x, y, size: S }]);
    toast.success("✅ Tick added");
  };

  const onOverlaySize = (page: number, w: number, h: number) => {
    overlaySizes.current[page] = { width: w, height: h };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>, page: number, overlayEl: HTMLDivElement) => {
    const { x, y } = toLocalXY(e, overlayEl);
    setDragStart({ x, y });

    // Hit test ticks
    for (let i = ticks.length - 1; i >= 0; i--) {
      const t = ticks[i];
      if (t.page !== page) continue;
      // Resize handle (bottom-right 10x10)
      if (x >= t.x + t.size - 10 && x <= t.x + t.size + 2 && y >= t.y + t.size - 10 && y <= t.y + t.size + 2) {
        setResizing({ id: t.id, corner: "se", ox: x, oy: y, oSize: t.size });
        return;
      }
      if (x >= t.x && x <= t.x + t.size && y >= t.y && y <= t.y + t.size) {
        setMoving({ id: t.id, dx: x - t.x, dy: y - t.y });
        return;
      }
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>, page: number, overlayEl: HTMLDivElement) => {
    const { x, y } = toLocalXY(e, overlayEl);
    if (moving) {
      setTicks((p) => p.map(t => t.id === moving.id && t.page === page ? { ...t, x: x - moving.dx, y: y - moving.dy } : t));
      return;
    }
    if (resizing) {
      const dx = x - resizing.ox;
      const dy = y - resizing.oy;
      const delta = Math.max(dx, dy);
      const newSize = Math.max(16, resizing.oSize + delta);
      setTicks((p) => p.map(t => t.id === resizing.id && t.page === page ? { ...t, size: newSize } : t));
      return;
    }
  };

  const onMouseUp = () => {
    setDragStart(null);
    setMoving(null);
    setResizing(null);
    recomputeJson();
  };

  /* ---------- UI ---------- */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onMouseUp={onMouseUp}>
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Add Green Tick <span className="text-xs text-gray-600">Doc ID: {String(documentId)}</span>
              </h3>
              <p className="text-xs text-gray-600">Click “Add Tick” then drag/resize on the page. JSON updates automatically.</p>
              <div className="text-[11px] p-2 bg-gray-50 border rounded mt-2">
                bytes: {pdfBytes?.length ?? 0} | pages: {numPages} | scale: {pdfScale.toFixed(2)}
                {progress && <> | progress: {progress.loaded}{progress.total ? ` / ${progress.total}` : ""}</>}
                {loadError && <div className="text-red-600 mt-1">loadError: {loadError}</div>}
                {reactPdfError && <div className="text-orange-600 mt-1">reactPdfError: {reactPdfError}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowCoordsModal(true); setTimeout(() => coordsTextAreaRef.current?.focus(), 0); }}
                className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50 inline-flex items-center gap-2"
              >
                <FileText size={14} /> View JSON
              </button>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close modal"><X size={18} /></button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Controls */}
          <div className="w-72 border-r border-gray-200 p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Ticks</h4>
              <button onClick={addTick} className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg flex items-center gap-1 hover:bg-green-700">
                <Plus size={12} /> Add Tick
              </button>
            </div>

            {ticks.length === 0 ? (
              <div className="text-xs text-gray-500">No ticks yet. Click “Add Tick”.</div>
            ) : (
              <div className="space-y-2">
                {ticks.map((t, idx) => (
                  <div key={t.id} className="text-xs bg-gray-50 border rounded p-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">Tick #{idx + 1}</div>
                      <div className="text-gray-600">Page {t.page} — x:{Math.round(t.x)} y:{Math.round(t.y)} size:{Math.round(t.size)}</div>
                    </div>
                    <button
                      onClick={() => setTicks((p) => p.filter(x => x.id !== t.id))}
                      className="text-red-600 hover:text-red-800"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-700 bg-emerald-50 border border-emerald-200 rounded p-2 flex items-start gap-2">
              <CheckCircle className="mt-0.5" size={14} />
              <div>
                Drag to move. Resize from bottom-right corner.  
                JSON auto-normalized to PDF coordinate space.
              </div>
            </div>
          </div>

          {/* Center: PDF + Overlays */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b bg-gray-50 text-xs flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-gray-700"><MapPin size={14} /> Place & adjust ticks</span>
              {progress && <span className="text-gray-500">{progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0}% loaded</span>}
            </div>

            <div ref={pageContainerRef} className="flex-1 bg-gray-100 p-4 overflow-auto">
              {loading ? (
                <div className="h-96 flex items-center justify-center text-gray-600">
                  <RefreshCw size={24} className="animate-spin mr-2" /> Loading PDF…
                </div>
              ) : memoPdfFile ? (
                <PdfDocument
                  key={docKey}
                  file={memoPdfFile}
                  onLoadSuccess={({ numPages }) => { setNumPages(numPages); setReactPdfError(""); }}
                  onLoadError={(e: any) => { console.error("react-pdf error:", e); setReactPdfError(String(e?.message || e)); }}
                  onLoadProgress={({ loaded, total }) => setProgress({ loaded, total })}
                  renderMode="canvas"
                  loading={<div className="h-96 flex items-center justify-center text-gray-600">
                    <RefreshCw size={24} className="animate-spin mr-2" /> Rendering…
                  </div>}
                  error={
                    <div className="h-96 flex flex-col items-center justify-center text-red-600 text-sm p-6">
                      <p className="font-medium mb-2">Failed to render PDF.</p>
                      <button
                        className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
                        onClick={() => setPdfBytes(pdfBytes ? new Uint8Array(pdfBytes) : null)}
                      >
                        Retry
                      </button>
                    </div>
                  }
                >
                  <div className="mx-auto max-w-[1000px] select-none">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                      <div
                        key={pageNum}
                        ref={(el) => (pageWrapRefs.current[pageNum] = el)}
                        className="relative inline-block bg-white shadow mb-6"
                      >
                        <PdfPage
                          pageNumber={pageNum}
                          scale={pdfScale}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          onLoadSuccess={onAnyPageLoad}
                        />
                        <PageOverlay
                          page={pageNum}
                          ticks={ticks}
                          onOverlaySize={onOverlaySize}
                          onMouseDown={onMouseDown}
                          onMouseMove={onMouseMove}
                          onRemoveTick={(id) => setTicks((p) => p.filter(t => t.id !== id))}
                        />
                      </div>
                    ))}
                  </div>
                </PdfDocument>
              ) : loadError ? (
                <div className="h-96 flex flex-col items-center justify-center text-red-600 text-sm p-6">
                  <p className="font-medium mb-2">{loadError}</p>
                  <button
                    className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
                    onClick={() => { setPdfBytes((prev) => (prev ? new Uint8Array(prev) : prev)); }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                  <FileText size={48} className="mb-4 text-gray-400" />
                  <p className="font-medium">No PDF loaded</p>
                  <p className="text-xs mt-2">API should return <code>pdf_base64</code>.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-600" /> {ticks.length} tick(s) placed
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowCoordsModal(true); setTimeout(() => coordsTextAreaRef.current?.focus(), 0); }}
                className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100"
              >
                View JSON
              </button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCoordsModal && (
        <CoordsModal
          json={coordsJson || "{}"}
          onClose={() => setShowCoordsModal(false)}
          textareaRef={coordsTextAreaRef}
        />
      )}
    </div>
  );
}

/* ---------------- Per-page overlay ---------------- */
function PageOverlay({
  page,
  ticks,
  onOverlaySize,
  onMouseDown,
  onMouseMove,
  onRemoveTick,
}: {
  page: number;
  ticks: Tick[];
  onOverlaySize: (page: number, w: number, h: number) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, page: number, overlay: HTMLDivElement) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>, page: number, overlay: HTMLDivElement) => void;
  onRemoveTick: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;
    const el = overlayRef.current;
    const report = () => onOverlaySize(page, el.clientWidth, el.clientHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [page, onOverlaySize]);

  const overlayStyle: CSSProperties = { position: "absolute", inset: 0, zIndex: 20, cursor: "default" };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0"
      style={overlayStyle}
      onMouseDown={(e) => overlayRef.current && onMouseDown(e, page, overlayRef.current)}
      onMouseMove={(e) => overlayRef.current && onMouseMove(e, page, overlayRef.current)}
    >
      {ticks.filter(t => t.page === page).map((t) => (
        <div
          key={t.id}
          className="absolute group"
          style={{ left: t.x, top: t.y, width: t.size, height: t.size, pointerEvents: "auto" } as CSSProperties}
        >
          {/* tick svg */}
          <div className="w-full h-full flex items-center justify-center">
            <GreenTick size={t.size} />
          </div>

          {/* delete button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemoveTick(t.id); }}
            className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-white border shadow hover:bg-gray-100 text-[10px] font-bold flex items-center justify-center"
            aria-label="Remove"
            title="Remove"
          >
            ✕
          </button>

          {/* resize handle (bottom-right) */}
          <div
            className="absolute w-2.5 h-2.5 bg-white border border-gray-400 rounded-sm"
            style={{ right: -4, bottom: -4, cursor: "nwse-resize" }}
          />
        </div>
      ))}
    </div>
  );
}
