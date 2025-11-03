// src/components/DigioStatusModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download as DownloadIcon,
  ExternalLink,
  RefreshCcw,
} from "lucide-react";
import {
  downloadDocument,
  openDownload,
  getDocumentDetails,
  getDigioStatusByLocalId,
  // 🔥 removed getPreviewUrl
  type StatusByLocalIdResult,
  type DetailsResult,
} from "@/lib/digioAPI";

type DigioStatus = "requested" | "completed" | "cancelled" | "created" | string;

export type DigioStatusDetails = {
  success: boolean;
  digio_id?: string;
  status?: string;
  local_document_id?: number | string;
  data?: any;
  db?: any;
  error?: any;
};

type Party = { name?: string; email?: string; phone?: string };

type Doc = {
  id: number;
  title: string;
  template_name: string;
  data: {
    buyer_name?: string;
    seller_name?: string;
    buyer_email?: string;
    seller_email?: string;
    buyer_phone?: string;
    seller_phone?: string;
  };
};

export default function DigioStatusModal({
  isOpen,
  onClose,
  doc,
  details,
  onResumeEsign,
  onMarkCompleted,
  onDetailsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  doc: Doc;
  details: DigioStatusDetails | null;
  onResumeEsign: () => void;
  onMarkCompleted: () => Promise<void> | void;
  onDetailsChange?: (d: DigioStatusDetails | null) => void;
}) {
  if (!isOpen) return null;

  const [current, setCurrent] = useState<DigioStatusDetails | null>(details);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(details || null);
  }, [details]);

  useEffect(() => {
    let isMounted = true;
    const boot = async () => {
      if (!isOpen) return;
      if (current?.digio_id || current?.status) return;
      try {
        setLoading(true);
        const res: StatusByLocalIdResult = await getDigioStatusByLocalId(doc?.id);
        const fresh: DigioStatusDetails = {
          success: !!res?.success,
          digio_id: res?.digio_id,
          status: res?.status,
          local_document_id: res?.local_document_id ?? doc?.id,
          data: res?.data,
          db: res?.db,
          error: res?.error,
        };
        if (!isMounted) return;
        setCurrent(fresh);
        onDetailsChange?.(fresh);
        if (!fresh.success) {
          setErrMsg(typeof fresh.error === "string" ? fresh.error : "Unable to fetch status");
        }
      } catch (e: any) {
        if (!isMounted) return;
        setErrMsg(e?.message || "Failed to fetch status");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    boot();
    return () => {
      isMounted = false;
    };
  }, [isOpen]); // once per open

  const norm: DigioStatus = normalize(current?.status);
  const badge = getBadge(norm);

  const buyer: Party = {
    name: doc?.data?.buyer_name,
    email: doc?.data?.buyer_email,
    phone: doc?.data?.buyer_phone,
  };
  const seller: Party = {
    name: doc?.data?.seller_name,
    email: doc?.data?.seller_email,
    phone: doc?.data?.seller_phone,
  };

  const handleDownload = async () => {
    if (!current?.digio_id) return;
    await downloadDocument(
      current.digio_id,
      current?.data?.file_name || current?.db?.file_name || undefined,
      false
    );
  };


  const handleRefreshStatus = async () => {
    try {
      setLoading(true);
      setErrMsg(null);
      let fresh: DigioStatusDetails | null = null;

      if (current?.digio_id) {
        const res: DetailsResult = await getDocumentDetails(current.digio_id, doc?.id);
        fresh = {
          success: !!res?.success,
          digio_id: res?.digio_id || current.digio_id,
          status: res?.status || current?.status,
          local_document_id: res?.local_document_id ?? doc?.id,
          data: res?.data,
          db: res?.db,
          error: res?.error,
        };
      } else {
        const res2: StatusByLocalIdResult = await getDigioStatusByLocalId(doc?.id);
        fresh = {
          success: !!res2?.success,
          digio_id: res2?.digio_id,
          status: res2?.status,
          local_document_id: res2?.local_document_id ?? doc?.id,
          data: res2?.data,
          db: res2?.db,
          error: res2?.error,
        };
      }

      setCurrent(fresh);
      onDetailsChange?.(fresh);

      if (!fresh?.success) {
        setErrMsg(typeof fresh?.error === "string" ? fresh.error : "Unable to fetch latest status");
      }
    } catch (e: any) {
      setErrMsg(e?.message || "Failed to refresh status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center px-4 !mt-0">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">Existing Digio Request Found</h3>
            <p className="text-sm text-gray-600 truncate">
              {doc?.title} • Template: {doc?.template_name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={loading}
              onClick={handleRefreshStatus}
              className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              aria-label="Check latest status"
              title="Check latest status"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              <span className="text-sm">Check Status</span>
            </button>

            <button className="p-2 rounded-lg hover:bg-gray-100" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Status row */}
          <div className="flex flex-wrap items-center gap-2">
            {badge.icon}
            <div className={`px-2 py-0.5 rounded-full text-xs ${badge.classes}`}>{badge.label}</div>
            {current?.digio_id && (
              <div className="text-xs text-gray-500 truncate">
                Digio ID: <span className="font-mono">{current.digio_id}</span>
              </div>
            )}
            {loading && <div className="text-xs text-gray-400">Refreshing…</div>}
          </div>

          {/* Error */}
          {errMsg && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">{errMsg}</div>
          )}

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PartyCard title="Buyer" party={buyer} />
            <PartyCard title="Seller" party={seller} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {(norm === "requested" || norm === "created") && (
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={onResumeEsign}
              >
                <FileText size={14} /> Resume e-Sign Flow
              </button>
            )}

            {norm === "completed" && (
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={onMarkCompleted}
              >
                <CheckCircle size={14} /> Mark Completed in CRM
              </button>
            )}

            {current?.digio_id && (
              <>
            
                {norm === "completed" && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50"
                  >
                    <DownloadIcon size={14} /> Download PDF
                  </button>
                )}
              </>
            )}
          </div>

          {/* 🔕 Inline preview removed */}
          <div className="text-[11px] text-gray-500 px-1">
            Inline preview disabled. Use <span className="font-medium">Open In New Tab</span> to view.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============== Helpers =============== */
function PartyCard({ title, party }: { title: string; party: Party }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-sm font-medium">{party?.name || "—"}</div>
      <div className="text-xs text-gray-600 break-all">{party?.email || "—"}</div>
      <div className="text-xs text-gray-600 break-all">{party?.phone || "—"}</div>
    </div>
  );
}

function normalize(s?: string | null): DigioStatus {
  const x = (s || "").toLowerCase();
  if (["requested", "pending", "shared"].some((k) => x.includes(k))) return "requested";
  if (["completed", "signed", "success"].some((k) => x.includes(k))) return "completed";
  if (["cancel", "void", "rejected"].some((k) => x.includes(k))) return "cancelled";
  if (["created"].some((k) => x.includes(k))) return "created";
  return x || "created";
}

function getBadge(s: DigioStatus) {
  switch (s) {
    case "requested":
      return {
        label: "Request Sent / Pending",
        classes: "bg-orange-100 text-orange-700",
        icon: <Clock size={16} className="text-orange-600" />,
      };
    case "completed":
      return {
        label: "Completed / Signed",
        classes: "bg-green-100 text-green-700",
        icon: <CheckCircle size={16} className="text-green-600" />,
      };
    case "cancelled":
      return {
        label: "Cancelled / Rejected",
        classes: "bg-red-100 text-red-700",
        icon: <AlertCircle size={16} className="text-red-600" />,
      };
    default:
      return {
        label: "Created",
        classes: "bg-gray-100 text-gray-700",
        icon: <FileText size={16} className="text-gray-600" />,
      };
  }
}
