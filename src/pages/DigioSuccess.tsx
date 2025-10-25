// src/pages/DigioSuccess.tsx
import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { digioAPI } from "@/lib/digioAPI";

const BRAND_COLOR = "#E6761D";

type UiStatus = "loading" | "success" | "failed" | "pending";

const DigioSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<UiStatus>("loading");
  const [message, setMessage] = useState<string>("Verifying your document status...");
  const [docId, setDocId] = useState<string | null>(null);

  const checkStatus = useCallback(async (documentId: string, hinted?: string | null) => {
    try {
      const res = await digioAPI.getStatus(documentId);
      // backend returns: { ok: true, data: { agreement_status: "completed" | "rejected" | ... } }
      const st = res?.data?.agreement_status || res?.data?.status || hinted;

      if (st === "completed") {
        setStatus("success");
        setMessage("Document signed successfully!");
      } else if (st === "rejected" || st === "cancelled" || st === "canceled" || st === "failed" || st === "expired") {
        setStatus("failed");
        setMessage(
          st === "rejected"
            ? "Document was rejected."
            : st === "expired"
            ? "Signing link expired."
            : "Document not signed."
        );
      } else {
        setStatus("pending");
        setMessage("Document is in progress. Please check again in a moment.");
      }
    } catch (err) {
      setStatus("failed");
      setMessage("Unable to verify document status.");
    }
  }, []);

  useEffect(() => {
    const documentId = searchParams.get("document_id");
    const digioStatus = searchParams.get("status"); // Digio may pass ?status=completed|rejected|...
    setDocId(documentId);

    if (!documentId) {
      setStatus("failed");
      setMessage("Missing document ID in URL.");
      return;
    }

    // First pass: use backend verification (source of truth)
    checkStatus(documentId, digioStatus);
  }, [searchParams, checkStatus]);

  const handleDownload = async () => {
    if (!docId) return;
    try {
      const blob = await digioAPI.download(docId);
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
    if (docId) {
      setStatus("loading");
      setMessage("Re-checking document status...");
      checkStatus(docId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
          <p className="mt-3 text-gray-700">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <h1 className="text-xl font-semibold mt-4 text-[#0B3856]">
            Document Signed Successfully!
          </h1>
          <p className="mt-2 text-gray-600">{message}</p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-[#0B3856] text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
            >
              <Download className="w-4 h-4" />
              Download Signed PDF
            </button>
            <a
              href="/dashboard"
              className="inline-block bg-[#E6761D] text-white px-6 py-2 rounded-lg hover:bg-[#d36510] transition"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-red-500" />
          <h1 className="text-xl font-semibold mt-4 text-[#0B3856]">
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
          <h1 className="text-xl font-semibold mt-4 text-[#0B3856]">
            Signing In Progress
          </h1>
          <p className="mt-2 text-gray-600">{message}</p>
          <button
            onClick={handleCheckAgain}
            className="mt-6 inline-block bg-[#E6761D] text-white px-6 py-2 rounded-lg hover:bg-[#d36510] transition"
          >
            Refresh Status
          </button>
        </div>
      )}
    </div>
  );
};

export default DigioSuccess;
