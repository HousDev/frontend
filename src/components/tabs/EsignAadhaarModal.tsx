import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  X, ShieldCheck, RefreshCw, FileText, Plus, Trash2, Copy as CopyIcon, Upload, MapPin, Download
} from "lucide-react";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";
import { Document as PdfDocument, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { uploadPdf, type UploadPdfPayload, type DigioUploadResponse } from "@/lib/digioAPI";

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
type PartyRole = "Buyer" | "Seller" | "Executive" | "Witness" | "Notary" | "Custom";
type SignBox = { llx: number; lly: number; urx: number; ury: number };
type CoordinateMarker = { id: string; page: number; x: number; y: number; width: number; height: number };

type Signer = {
  id: string;
  role: PartyRole | string;
  name: string;
  email: string;
  phone: string;
  reason?: string;
  index?: number;
  identifierType?: "email" | "phone";
  customRole?: string;
};

type RequestStatus = "idle" | "creating" | "created" | "error";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | string;
  defaultBuyer?: { name?: string; email?: string; phone?: string };
  defaultSeller?: { name?: string; email?: string; phone?: string };
  onProgress?: (args: { docId: string | number; payload?: Record<string, any> }) => Promise<void>;
  onBothSigned?: ({ docId }: { docId: string | number }) => Promise<void>;
};

/* --------------------------- Utils --------------------------- */
const uid = (p = "") => `${p}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
const isPhone = (s: string) => /^\+?\d{7,15}$/.test(s);
const toast = { success: console.log, error: console.error, info: console.info };

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
function uint8ToBase64(u8: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

/* --------------------------- Coords Modal --------------------------- */
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
      a.download = `esign-coordinates-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
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
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="text-base font-semibold">Generated Coordinates (Digio JSON)</h4>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-600 mb-2">
            Read-only preview. Copy or download to use in the API payload.
          </p>
          <textarea
            ref={textareaRef}
            value={json}
            readOnly
            className="w-full h-80 text-xs font-mono border rounded-lg p-3 bg-gray-50"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-600">
            Tip: Boxes are drawn in screen px; JSON is normalized to PDF points with origin bottom-left.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-100"
            >
              <CopyIcon size={14} /> Copy
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Request Status Component --------------------------- */
function RequestStatusComponent({
  status,
  digioResponse,
  onCreateNewRequest,
  onClose,
}: {
  status: RequestStatus;
  digioResponse: DigioUploadResponse | null;
  onCreateNewRequest: () => void;
  onClose: () => void;
}) {
  if (status === "idle" || status === "creating") return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="text-center">
          {status === "created" && digioResponse ? (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Request Created Successfully!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your e-sign request has been submitted to Digio.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                <div className="text-xs font-medium text-gray-700 mb-2">Request Details:</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><span className="font-medium">Digio ID:</span> {digioResponse.id}</div>
                  <div><span className="font-medium">Status:</span> {digioResponse.agreement_status || "requested"}</div>
                  <div><span className="font-medium">File:</span> {digioResponse.file_name}</div>
                  {digioResponse.signing_parties && (
                    <div><span className="font-medium">Signers:</span> {digioResponse.signing_parties.length}</div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Close & Monitor Status
                </button>
                <button
                  onClick={onCreateNewRequest}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Create New Request
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Request Failed</h3>
              <p className="text-sm text-gray-600 mb-4">
                There was an error creating your e-sign request.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={onCreateNewRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EsignAadhaarModal({
  isOpen, onClose, documentId, defaultBuyer, defaultSeller, onProgress, onBothSigned
}: Props) {
  /* ---------- PDF state ---------- */
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("Document.pdf");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>("");
  const [reactPdfError, setReactPdfError] = useState<string>("");
  const [progress, setProgress] = useState<{ loaded: number; total?: number } | null>(null);

  const [numPages, setNumPages] = useState(1);
  const [pageBaseWidth, setPageBaseWidth] = useState<number | null>(null);
  const [pdfScale, setPdfScale] = useState(1);

  // store page width/height in PDF points at scale=1 — used to flip Y correctly
  const pagePtsMetaRef = useRef<Record<number, { width: number; height: number }>>({});

  const memoPdfFile = useMemo(() => (pdfBytes ? { data: new Uint8Array(pdfBytes) } : null), [pdfBytes]);
  const docKey = useMemo(() => (pdfBytes ? `pdf-${pdfBytes.length}-${pdfBytes[0] ?? 0}` : "none"), [pdfBytes]);

  /* ---------- Marking/Boxes state ---------- */
  const [coordsJson, setCoordsJson] = useState<string>("{}");
  const coordsTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showCoordsModal, setShowCoordsModal] = useState(false);

  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [currentMarkingSigner, setCurrentMarkingSigner] = useState<string | null>(null);
  const [signerCoordinates, _setSignerCoordinates] = useState<Record<string, CoordinateMarker[]>>({});
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ page: number; x: number; y: number; width: number; height: number } | null>(null);
  const [movingCoordinate, setMovingCoordinate] = useState<{ signerId: string; index: number } | null>(null);
  const [resizingCoordinate, setResizingCoordinate] = useState<{ signerId: string; index: number; corner: string } | null>(null);

  /* ---------- Request state ---------- */
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [digioResponse, setDigioResponse] = useState<DigioUploadResponse | null>(null);

  // per-page overlay sizes & refs to detect visible page
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const pageWrapRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const overlaySizes = useRef<Record<number, { width: number; height: number }>>({});

  /* ---------- Signers ---------- */
  const [signers, setSigners] = useState<Signer[]>([
    {
      id: uid("buyer-"),
      role: "Buyer",
      name: defaultBuyer?.name || "",
      email: defaultBuyer?.email || "",
      phone: defaultBuyer?.phone || "",
      reason: "Reason for Verification",
      index: 0,
      identifierType: defaultBuyer?.email ? "email" : defaultBuyer?.phone ? "phone" : undefined
    },
    {
      id: uid("seller-"),
      role: "Seller",
      name: defaultSeller?.name || "",
      email: defaultSeller?.email || "",
      phone: defaultSeller?.phone || "",
      reason: "Reason for Verification",
      index: 1,
      identifierType: defaultSeller?.email ? "email" : defaultSeller?.phone ? "phone" : undefined
    },
  ]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds((prev) => (prev.length ? prev : signers.map((s) => s.id)));
  }, [isOpen, signers]);

  /* ---------- Reset state when modal opens ---------- */
  useEffect(() => {
    if (isOpen) {
      setRequestStatus("idle");
      setDigioResponse(null);
    }
  }, [isOpen]);

  /* ---------- Load PDF (from API base64 only) ---------- */
  useEffect(() => {
    if (!isOpen || !documentId) return;

    let alive = true;
    const run = async () => {
      setLoading(true);
      setProgress(null);
      setLoadError("");
      setReactPdfError("");
      setPdfBytes(null);
      setNumPages(1);
      setPageBaseWidth(null);
      pagePtsMetaRef.current = {};
      _setSignerCoordinates({});
      setCoordsJson("{}");

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
    };

    run();
    return () => { alive = false; };
  }, [isOpen, documentId]);

  /* ---------- Upload (manual) ---------- */
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload PDF only");
      return;
    }
    const buf = await file.arrayBuffer();
    setPdfBytes(new Uint8Array(buf));
    setFileName(file.name || "Document.pdf");
    setReactPdfError("");
    setLoadError("");
    setNumPages(1);
    setPageBaseWidth(null);
    pagePtsMetaRef.current = {};
    _setSignerCoordinates({});
    setCoordsJson("{}");
  };

  /* ---------- Fit-to-width scaling + capture page size in points ---------- */
  const onAnyPageLoad = (page: any) => {
    try {
      const vp1 = page.getViewport({ scale: 1 });
      // Save PDF points meta per page (scale=1 => points)
      pagePtsMetaRef.current[page.pageNumber] = { width: vp1.width, height: vp1.height };
      if (!pageBaseWidth) {
        setPageBaseWidth(vp1.width);
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

  /* ---------- Helpers ---------- */
  const getColor = (sid: string) =>
    ["#3b82f6", "#22c55e", "#a855f7", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#f97316"][signers.findIndex(s => s.id === sid) % 8];

  const toggleSelected = (id: string) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const getSignerIdentifier = (s: Signer) =>
    (s.identifierType === "phone" ? s.phone.trim() : s.identifierType === "email" ? s.email.trim() : "");

  const setSignerCoordinates = (
    updater: (prev: Record<string, CoordinateMarker[]>) => Record<string, CoordinateMarker[]>
  ) => {
    _setSignerCoordinates(prev => {
      const next = updater(prev);
      recomputeDigio(next);
      return next;
    });
  };

  /** ---------- CORE FIX: correct conversion to PDF points (origin bottom-left) ---------- */
  const recomputeDigio = (map: Record<string, CoordinateMarker[]> = signerCoordinates) => {
    // sign_coordinates: { "<identifier>": { "1": [{llx,lly,urx,ury}], "2": [...] } }
    const out: Record<string, Record<string, SignBox[]>> = {};

    const scale = pdfScale || 1;

    signers.forEach((s) => {
      if (!selectedIds.includes(s.id)) return;
      const id = getSignerIdentifier(s); if (!id) return;
      const marks = map[s.id] || []; if (!marks.length) return;

      marks.forEach((m) => {
        const meta = pagePtsMetaRef.current[m.page];
        if (!meta) return; // page not measured yet

        // Screen (overlay) -> PDF points:
        // x_pts = x / scale
        // y: flip because overlay origin is top-left, PDF origin is bottom-left:
        // lly = pageHeight - (y + height)/scale
        // ury = pageHeight - y/scale
        const llx = Math.round(m.x / scale);
        const lly = Math.round(meta.height - (m.y + m.height) / scale);
        const urx = Math.round((m.x + m.width) / scale);
        const ury = Math.round(meta.height - m.y / scale);

        (out[id] ||= {});
        (out[id][String(m.page)] ||= []).push({ llx, lly, urx, ury });
      });
    });

    const json = JSON.stringify(out, null, 2);
    setCoordsJson(json);
  };

  useEffect(() => {
    // Recompute whenever display scale / coordinates / selection changes
    recomputeDigio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfScale, signerCoordinates, signers, selectedIds]);

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

  const addBoxForSigner = (signerId: string) => {
    const page = getCurrentVisiblePage();
    const size = overlaySizes.current[page];

    const insert = (x: number, y: number, W = 180, H = 44) => {
      setSignerCoordinates((prev) => {
        const nextArr = [...(prev[signerId] || [])];
        nextArr.push({ id: uid("coord-"), page, x, y, width: W, height: H });
        return { ...prev, [signerId]: nextArr };
      });
    };

    if (!size) {
      insert(80, 120, 220, 60);
    } else {
      const W = 180, H = 44;
      const x = Math.max(10, Math.round((size.width - W) / 2));
      const y = Math.max(10, Math.round((size.height - H) / 3));
      insert(x, y, W, H);
    }
    toast.success("Signature area added & coordinates generated");
  };

  const toLocalXY = (e: React.MouseEvent<HTMLDivElement>, overlayElem: HTMLDivElement) => {
    const rect = overlayElem.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, page: number, overlayElem: HTMLDivElement) => {
    const { x, y } = toLocalXY(e, overlayElem);

    if (!isMarkingMode) {
      for (const [signerId, marks] of Object.entries(signerCoordinates)) {
        for (let i = 0; i < (marks || []).length; i++) {
          const m = marks[i];
          if (m.page !== page) continue;

          const corners = [
            { x: m.x, y: m.y, corner: "top-left" },
            { x: m.x + m.width, y: m.y, corner: "top-right" },
            { x: m.x, y: m.y + m.height, corner: "bottom-left" },
            { x: m.x + m.width, y: m.y + m.height, corner: "bottom-right" },
          ];
          for (const c of corners) {
            if (Math.abs(x - (c as any).x) < 8 && Math.abs(y - (c as any).y) < 8) {
              setResizingCoordinate({ signerId, index: i, corner: (c as any).corner });
              setDragStart({ x, y });
              return;
            }
          }
          if (x >= m.x && x <= m.x + m.width && y >= m.y && y <= m.y + m.height) {
            setMovingCoordinate({ signerId, index: i });
            setDragStart({ x: x - m.x, y: y - m.y });
            return;
          }
        }
      }
    }

    if (isMarkingMode && currentMarkingSigner) {
      setDragStart({ x, y });
      setDragRect({ page, x, y, width: 0, height: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, page: number, overlayElem: HTMLDivElement) => {
    const { x, y } = toLocalXY(e, overlayElem);

    if (movingCoordinate && dragStart) {
      const { signerId, index } = movingCoordinate;
      setSignerCoordinates((prev) => {
        const n = { ...prev }; const arr = [...(n[signerId] || [])]; const m = arr[index];
        if (m.page !== page) return prev;
        arr[index] = { ...m, x: x - dragStart.x, y: y - dragStart.y };
        n[signerId] = arr; return n;
      });
      return;
    }

    if (resizingCoordinate && dragStart) {
      const { signerId, index, corner } = resizingCoordinate;
      setSignerCoordinates((prev) => {
        const n = { ...prev }; const arr = [...(n[signerId] || [])]; const m = arr[index];
        if (m.page !== page) return prev;
        let nx = m.x, ny = m.y, nw = m.width, nh = m.height;
        switch (corner) {
          case "top-left": nx = x; ny = y; nw = m.width + (m.x - x); nh = m.height + (m.y - y); break;
          case "top-right": ny = y; nw = x - m.x; nh = m.height + (m.y - y); break;
          case "bottom-left": nx = x; nw = m.width + (m.x - x); nh = y - m.y; break;
          case "bottom-right": nw = x - m.x; nh = y - m.y; break;
        }
        if (nw > 10 && nh > 10) arr[index] = { ...m, x: nx, y: ny, width: nw, height: nh };
        n[signerId] = arr; return n;
      });
      return;
    }

    if (dragStart && isMarkingMode && dragRect && dragRect.page === page) {
      setDragRect({
        page,
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y),
      });
    }
  };

  const handleMouseUp = () => {
    if (dragRect && isMarkingMode && currentMarkingSigner) {
      if (dragRect.width > 10 && dragRect.height > 10) {
        const mark: CoordinateMarker = {
          id: uid("coord-"), page: dragRect.page, x: dragRect.x, y: dragRect.y,
          width: dragRect.width, height: dragRect.height
        };
        setSignerCoordinates((prev) => ({ ...prev, [currentMarkingSigner]: [...(prev[currentMarkingSigner] || []), mark] }));
        toast.success("Signature area marked & coordinates generated");
      }
    }
    recomputeDigio();
    setDragStart(null); setDragRect(null); setMovingCoordinate(null); setResizingCoordinate(null);
  };

  /* ---------- Add Custom Signer ---------- */
  const addCustomSigner = () => {
    const newSigner: Signer = {
      id: uid("custom-"),
      role: "Custom",
      name: "",
      email: "",
      phone: "",
      reason: "Reason for signing",
      index: signers.length,
      customRole: ""
    };
    setSigners((p) => [...p, newSigner]);
    setSelectedIds((p) => [...p, newSigner.id]);
  };

  /* ---------- Handle Role Change ---------- */
  const handleRoleChange = (signerId: string, newRole: PartyRole | string) => {
    setSigners((prev) =>
      prev.map((s) =>
        s.id === signerId
          ? {
              ...s,
              role: newRole,
              customRole: newRole === "Custom" ? s.customRole : ""
            }
          : s
      )
    );
  };

  /* ---------- Handle Custom Role Input ---------- */
  const handleCustomRoleChange = (signerId: string, customRole: string) => {
    setSigners((prev) =>
      prev.map((s) =>
        s.id === signerId
          ? { ...s, customRole, role: "Custom" }
          : s
      )
    );
  };

  /* ---------- Create New Request ---------- */
  const handleCreateNewRequest = () => {
    setRequestStatus("idle");
    setDigioResponse(null);
  };

  /* ---------- SUBMIT: Send to Digio API ---------- */
  const handleSubmit = async () => {
    try {
      setRequestStatus("creating");

      const selectedSigners = signers.filter(s => selectedIds.includes(s.id));
      // Build signers array (identifier, name, sign_type, reason)
      const signersPayload = selectedSigners.map((s) => {
        const identifier = getSignerIdentifier(s);
        if (!identifier) {
          throw new Error(`Missing identifier for signer "${s.name || s.role}". Choose Email/Phone in "Select identifier".`);
        }

        const displayRole = s.customRole || s.role;

        return {
          identifier,
          name: s.name || String(displayRole || "Signer"),
          sign_type: "aadhaar",
          reason: s.reason || "Reason for signing",
        };
      });

      // sign_coordinates already computed using identifiers (coordsJson)
      const signCoordinates = JSON.parse(coordsJson || "{}");

      // Basic validations to reduce silent failures
      const idsInCoords = Object.keys(signCoordinates);
      const idsExpected = new Set(signersPayload.map(s => s.identifier));
      const notPlaced = [...idsExpected].filter(id => !idsInCoords.includes(id));
      if (notPlaced.length) {
        toast.info(`Note: No coordinates for ${notPlaced.length} signer(s). They won't have a signature box.`);
      }

      const file_data = pdfBytes && pdfBytes.length ? uint8ToBase64(pdfBytes) : "";

      if (!file_data) {
        throw new Error("No PDF data available");
      }

      const payload: UploadPdfPayload = {
        local_document_id: documentId,
        signers: signersPayload,
        expire_in_days: 10,
        display_on_page: "custom",
        notify_signers: true,
        send_sign_link: true,
        file_name: fileName || "Test.pdf",
        generate_access_token: true,
        include_authentication_url: true,
        file_data: file_data,
        sign_coordinates: signCoordinates,
      };

      console.log("[E-SIGN FINAL PAYLOAD]", payload);

      // Call Digio API
      const result = await uploadPdf(payload);

      if (result.success && result.data) {
        setDigioResponse(result.data);
        setRequestStatus("created");
        toast.success("E-sign request created successfully!");

        // Call progress callback if provided
        if (onProgress) {
          await onProgress({ docId: documentId, payload });
        }
      } else {
        throw new Error(result.error?.message || "Failed to create e-sign request");
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setRequestStatus("error");
      toast.error(err?.message || "Failed to create e-sign request");
    }
  };



  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  E-sign (Aadhaar) <span className="text-xs text-gray-600">Doc ID: {String(documentId)}</span>
                </h3>
                <p className="text-xs text-gray-600">Click "Add Box" or "Mark (Drag)" — coordinates are generated automatically.</p>
             
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload size={14} /><span>Upload PDF</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} />
                </label>
                <button
                  onClick={() => {
                    recomputeDigio();
                    setShowCoordsModal(true);
                    setTimeout(() => coordsTextAreaRef.current?.focus(), 0);
                  }}
                  className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50 inline-flex items-center gap-2"
                >
                  <FileText size={14} />
                  View Coordinates
                </button>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close modal"><X size={18} /></button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left: Signers */}
            <div className="w-80 border-r border-gray-200 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Signers</h4>
                <button
                  onClick={addCustomSigner}
                  className="px-2 py-1 text-xs border rounded-lg flex items-center gap-1 hover:bg-gray-50"
                >
                  <Plus size={12} />Add
                </button>
              </div>

              {signers.map((s) => {
                const marks = signerCoordinates[s.id] || [];
                const isMarking = currentMarkingSigner === s.id;
                const c = getColor(s.id);
                const displayRole = s.customRole || s.role;

                return (
                  <div key={s.id} className={`border rounded p-3 ${isMarking ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => { toggleSelected(s.id); setTimeout(() => recomputeDigio(), 0); }}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: c } as CSSProperties} />
                          <span className="text-sm font-medium">{displayRole}</span>
                        </div>

                        {/* Role Selection */}
                        <select
                          className="w-full px-2 py-1 border rounded text-xs"
                          value={s.role}
                          onChange={(e) => handleRoleChange(s.id, e.target.value)}
                        >
                          <option value="Buyer">Buyer</option>
                          <option value="Seller">Seller</option>
                          <option value="Executive">Executive</option>
                          <option value="Witness">Witness</option>
                          <option value="Notary">Notary</option>
                          <option value="Custom">Custom</option>
                        </select>

                        {/* Custom Role Input */}
                        {s.role === "Custom" && (
                          <input
                            className="w-full px-2 py-1 border rounded text-xs"
                            value={s.customRole || ""}
                            onChange={(e) => handleCustomRoleChange(s.id, e.target.value)}
                            placeholder="Enter custom role (e.g., Manager, Director, etc.)"
                          />
                        )}

                        <input className="w-full px-2 py-1 border rounded text-xs" value={s.name} onChange={e => setSigners(p => p.map(x => x.id === s.id ? { ...x, name: e.target.value } : x))} placeholder="Name" />
                        <input className="w-full px-2 py-1 border rounded text-xs" value={s.email} onChange={e => { setSigners(p => p.map(x => x.id === s.id ? { ...x, email: e.target.value } : x)); setTimeout(() => recomputeDigio(), 0); }} placeholder="Email" />
                        <input className="w-full px-2 py-1 border rounded text-xs" value={s.phone} onChange={e => { setSigners(p => p.map(x => x.id === s.id ? { ...x, phone: e.target.value } : x)); setTimeout(() => recomputeDigio(), 0); }} placeholder="Phone" />
                        <select className="w-full px-2 py-1 border rounded text-xs" value={s.identifierType || ""} onChange={e => { setSigners(p => p.map(x => x.id === s.id ? { ...x, identifierType: e.target.value as any } : x)); setTimeout(() => recomputeDigio(), 0); }}>
                          <option value="">Select identifier</option>
                          {isEmail(s.email) && <option value="email">Use Email</option>}
                          {isPhone(s.phone) && <option value="phone">Use Phone</option>}
                        </select>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={() => addBoxForSigner(s.id)}
                            className="px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                          >
                            <Plus size={12} /> Add Box
                          </button>
                          {isMarking ? (
                            <button onClick={() => { setIsMarkingMode(false); setCurrentMarkingSigner(null); }} className="px-2 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600">Stop Marking</button>
                          ) : (
                            <button onClick={() => { setIsMarkingMode(true); setCurrentMarkingSigner(s.id); }} className="px-2 py-1.5 text-xs border rounded hover:bg-gray-50 flex items-center justify-center gap-1">
                              <MapPin size={12} /> Mark (Drag)
                            </button>
                          )}
                        </div>

                        {!!marks.length && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-gray-600">Signature Areas ({marks.length})</div>
                            {marks.map((m, i) => (
                              <div key={m.id} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                                <span>Page {m.page}</span>
                                <button
                                  onClick={() =>
                                    setSignerCoordinates(prev => {
                                      const a = [...(prev[s.id] || [])];
                                      a.splice(i, 1);
                                      return { ...prev, [s.id]: a };
                                    })
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Remove Signer */}
                        <button
                          onClick={() => {
                            setSigners(p => p.filter(x => x.id !== s.id));
                            setSelectedIds(p => p.filter(id => id !== s.id));
                            setSignerCoordinates(prev => {
                              const next = { ...prev };
                              delete next[s.id];
                              return next;
                            });
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center justify-center gap-1 mt-2"
                        >
                          <Trash2 size={12} /> Remove Signer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center: PDF (all pages) + Overlays */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b bg-gray-50 flex items-center gap-2">
                <span className="text-xs">
                  {isMarkingMode ? "📍 Marking mode ON" : "✨ Move/resize enabled"}
                  {progress && (
                    <span className="ml-2 text-gray-500">
                      {progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0}% loaded
                    </span>
                  )}
                </span>
              </div>

              <div ref={pageContainerRef} className="flex-1 bg-gray-100 p-4 overflow-auto" onMouseUp={handleMouseUp}>
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
                    <div className="mx-auto max-w-[1000px]">
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
                          {/* Overlay for this page */}
                          <Overlay
                            page={pageNum}
                            signerCoordinates={signerCoordinates}
                            signers={signers}
                            isMarkingMode={isMarkingMode}
                            currentMarkingSigner={currentMarkingSigner}
                            getColor={getColor}
                            dragRect={dragRect}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onOverlaySize={(p, w, h) => (overlaySizes.current[p] = { width: w, height: h })}
                            onRemoveBox={(sid, markId) =>
                              setSignerCoordinates((prev) => {
                                const arr = (prev[sid] || []).filter((m) => m.id !== markId);
                                return { ...prev, [sid]: arr };
                              })
                            }
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
                      onClick={() => {
                        setPdfBytes((prev) => (prev ? new Uint8Array(prev) : prev));
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                    <FileText size={48} className="mb-4 text-gray-400" />
                    <p className="font-medium">No PDF loaded</p>
                    <p className="text-xs mt-2">
                      API should return <code>pdf_base64</code> or upload a PDF.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
              <div className="text-xs text-gray-600 flex items-center gap-2 shrink-0">
                <ShieldCheck size={14} /> {selectedIds.length} signer(s) | {Object.values(signerCoordinates).flat().length} area(s)
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button
                  onClick={() => { setIsMarkingMode(false); setCurrentMarkingSigner(null); }}
                  className="px-3 py-1.5 text-xs border rounded hover:bg-gray-100 shrink-0"
                >
                  Stop Marking
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={requestStatus === "creating"}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
                >
                  {requestStatus === "creating" ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Submit to Digio"
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 shrink-0"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Status Modal */}
      <RequestStatusComponent
        status={requestStatus}
        digioResponse={digioResponse}
        onCreateNewRequest={handleCreateNewRequest}
        onClose={onClose}
      />

      {showCoordsModal && (
        <CoordsModal
          json={coordsJson || "{}"}
          onClose={() => setShowCoordsModal(false)}
          textareaRef={coordsTextAreaRef}
        />
      )}
    </>
  );
}

/* ---------------- Overlay component (per page) ---------------- */
function Overlay({
  page,
  signerCoordinates,
  signers,
  isMarkingMode,
  currentMarkingSigner,
  getColor,
  dragRect,
  onMouseDown,
  onMouseMove,
  onOverlaySize,
  onRemoveBox,
}: {
  page: number;
  signerCoordinates: Record<string, CoordinateMarker[]>;
  signers: Signer[];
  isMarkingMode: boolean;
  currentMarkingSigner: string | null;
  getColor: (sid: string) => string;
  dragRect: { page: number; x: number; y: number; width: number; height: number } | null;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, page: number, overlay: HTMLDivElement) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>, page: number, overlay: HTMLDivElement) => void;
  onOverlaySize: (page: number, w: number, h: number) => void;
  onRemoveBox: (sid: string, markId: string) => void;
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

  const overlayStyle: CSSProperties = {
    zIndex: 20,
    pointerEvents: "auto",
    cursor: isMarkingMode ? "crosshair" : "default",
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0"
      style={overlayStyle}
      onMouseDown={(e) => overlayRef.current && onMouseDown(e, page, overlayRef.current)}
      onMouseMove={(e) => overlayRef.current && onMouseMove(e, page, overlayRef.current)}
    >
      {Object.entries(signerCoordinates).flatMap(([sid, marks]) =>
        (marks || []).filter(m => m.page === page).map((m) => {
          const c = getColor(sid);
          const signer = signers.find(s => s.id === sid);
          const displayRole = signer?.customRole || signer?.role || "Signer";

          const boxStyle: CSSProperties = {
            left: m.x,
            top: m.y,
            width: m.width,
            height: m.height,
            borderColor: c,
            backgroundColor: `${c}20`,
            cursor: isMarkingMode ? "crosshair" : "move",
            pointerEvents: "auto",
            position: "absolute",
            borderStyle: "solid",
            borderWidth: 2,
          } as CSSProperties;

          return (
            <div
              key={`${sid}-${m.id}`}
              className="absolute"
              style={boxStyle}
            >
              {/* label */}
              <div className="text-xs font-bold px-1 absolute -top-5 left-0 whitespace-nowrap" style={{ color: c } as CSSProperties}>
                {displayRole}
              </div>

              {/* delete button — right center */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemoveBox(sid, m.id); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border shadow hover:bg-gray-100 text-[10px] font-bold flex items-center justify-center"
                aria-label="Remove"
                title="Remove"
              >
                ✕
              </button>

              {/* visual handles (decorative) */}
              {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map((corner) => (
                <div
                  key={corner}
                  className="absolute -left-1 -top-1 w-2 h-2 bg-white border border-gray-400 rounded-sm pointer-events-none"
                  style={
                    ({
                      ...(corner === "top-right" && { left: "auto", right: "-0.25rem", top: "-0.25rem" }),
                      ...(corner === "bottom-left" && { top: "auto", bottom: "-0.25rem", left: "-0.25rem" }),
                      ...(corner === "bottom-right" && { top: "auto", left: "auto", bottom: "-0.25rem", right: "-0.25rem" }),
                      cursor: corner === "top-left" || corner === "bottom-right" ? "nwse-resize" : "nesw-resize",
                    } as CSSProperties)
                  }
                />
              ))}

              {/* center text */}
              <div className="w-full h-full flex items-center justify-center text-[12px] font-medium" style={{ color: "#1f2937" } as CSSProperties}>
                {signer?.name || displayRole}
              </div>
            </div>
          );
        })
      )}
      {dragRect && dragRect.page === page && isMarkingMode && (
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none"
          style={
            {
              left: dragRect.x,
              top: dragRect.y,
              width: dragRect.width,
              height: dragRect.height,
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}
