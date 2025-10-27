// src/pages/DigioSuccess.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, Download, Copy } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { digioAPI } from "@/lib/digioAPI";

type UiStatus = "loading" | "success" | "failed" | "pending";

const BRAND_PRIMARY = "#0B3856";
const BRAND_ACCENT = "#E6761D";

/** Normalize Digio/Backend status variants to UI buckets */
function normalizeStatus(s?: string | null): UiStatus {
  const v = String(s || "").toLowerCase();
  if (["completed", "success", "signed"].includes(v)) return "success";
  if (["rejected", "cancelled", "canceled", "failed", "expired", "error"].includes(v)) return "failed";
  if (v) return "pending";
  return "loading";
}

const DigioSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<UiStatus>("loading");
  const [message, setMessage] = useState<string>("Verifying your document status...");
  const [docId, setDocId] = useState<string | null>(null);
  const [raw, setRaw] = useState<any>(null); // optional: debug/info
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // read all possible Digio query keys safely
  const qp = useMemo(() => {
    const q: Record<string, string | null> = {};
    for (const [k, v] of searchParams.entries()) q[k] = v;
    // common aliases from Digio callbacks
    q.document_id = q.document_id || q.digio_doc_id || q.docId || q.did || null;
    q.status = q.status || q.agreement_status || null;
    return q;
  }, [searchParams]);

  const cleanupQueryFromUrl = useCallback((keepDocId: string | null) => {
    try {
      const url = new URL(window.location.href);
      if (keepDocId) {
        url.searchParams.set("document_id", keepDocId);
      }
      // remove noisy params
      ["status","txn_id","message","error_code","digio_doc_id","docId","did"].forEach((k) =>
        url.searchParams.delete(k)
      );
      window.history.replaceState({}, "", url.toString());
    } catch {}
  }, []);

  const computeUi = useCallback((remote: any, hinted?: string | null) => {
    const st =
      remote?.data?.agreement_status ??
      remote?.data?.status ??
      remote?.agreement_status ??
      remote?.status ??
      hinted ??
      null;

    const ui = normalizeStatus(st);
    setStatus(ui);

    if (ui === "success") {
      setMessage("Document signed successfully!");
    } else if (ui === "failed") {
      const txt =
        String(st || "").toLowerCase() === "rejected"
          ? "Document was rejected."
          : String(st || "").toLowerCase() === "expired"
          ? "Signing link expired."
          : "Document not signed.";
      setMessage(txt);
    } else if (ui === "pending") {
      setMessage("Document is in progress. Please check again in a moment.");
    } else {
      setMessage("Verifying your document status...");
    }
  }, []);

  const checkStatus = useCallback(
    async (documentId: string, hinted?: string | null) => {
      try {
        const res = await digioAPI.getStatus(documentId); // { ok, data: {...} }
        setRaw(res);
        computeUi(res, hinted);
      } catch (err: any) {
        // if backend not ready yet or 404, treat as pending once
        setStatus("pending");
        setMessage("Document state not ready yet. Will retry...");
      }
    },
    [computeUi]
  );

  // boot
  useEffect(() => {
    const documentId = qp.document_id || null;
    const hinted = qp.status || null;
    setDocId(documentId);

    if (!documentId) {
      setStatus("failed");
      setMessage("Missing document ID in URL.");
      return;
    }

    // Clean URL (keep only document_id)
    cleanupQueryFromUrl(documentId);

    // First verification
    checkStatus(documentId, hinted);

    // Start polling until terminal state
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      // stop polling if terminal
      if (["success", "failed"].includes(status)) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        return;
      }
      checkStatus(documentId);
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // deliberate: run once on mount

  const handleDownload = async () => {
    if (!docId) return;
    try {
      const blob = await digioAPI.download(docId);
      if (!blob || (blob as any).size === 0) throw new Error("empty blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Signed-${docId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("Signed file is not available to download yet.");
    }
  };

  const handleCheckAgain = () => {
    if (!docId) return;
    setStatus("loading");
    setMessage("Re-checking document status...");
    checkStatus(docId);
  };

  const copyDocId = () => {
    if (!docId) return;
    navigator.clipboard?.writeText(docId).catch(() => {});
  };

  const goDashboard = () => navigate("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* Header mini info */}
      <div className="mb-6 text-xs text-gray-500 flex items-center gap-3">
        {docId && (
          <button
            onClick={copyDocId}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50"
            title="Copy Document ID"
          >
            <Copy className="w-3 h-3" />
            <span className="font-mono">{docId}</span>
          </button>
        )}
        <span className="hidden sm:inline">•</span>
        <span className="text-gray-400">Status: {status}</span>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
          <p className="mt-3 text-gray-700">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <h1 className="text-xl font-semibold mt-4" style={{ color: BRAND_PRIMARY }}>
            Document Signed Successfully!
          </h1>
          <p className="mt-2 text-gray-600">{message}</p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white hover:opacity-90 transition"
              style={{ background: BRAND_PRIMARY }}
            >
              <Download className="w-4 h-4" />
              Download Signed PDF
            </button>
            <button
              onClick={goDashboard}
              className="inline-block px-6 py-2 rounded-lg text-white hover:opacity-90 transition"
              style={{ background: BRAND_ACCENT }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-500" />
          <h1 className="text-xl font-semibold mt-4" style={{ color: BRAND_PRIMARY }}>
            Signing Failed or Rejected
          </h1>
          <p className="mt-2 text-gray-600">{message}</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleCheckAgain}
              className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Check Again
            </button>
            <a
              href="/"
              className="inline-block bg-white text-gray-800 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Back to Home
            </a>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
          <h1 className="text-xl font-semibold mt-4" style={{ color: BRAND_PRIMARY }}>
            Signing In Progress
          </h1>
          <p className="mt-2 text-gray-600">{message}</p>
          <button
            onClick={handleCheckAgain}
            className="mt-6 inline-block text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            style={{ background: BRAND_ACCENT }}
          >
            Refresh Status
          </button>
        </div>
      )}

      {/* Optional: tiny debug box */}
      {/* <pre className="mt-8 text-[10px] text-gray-500 max-w-[90vw] overflow-auto">
        {JSON.stringify(raw, null, 2)}
      </pre> */}
    </div>
  );
};

export default DigioSuccess;
