import React from "react";
import { X, CheckCircle, Clock, AlertCircle, FileText, Download, ExternalLink } from "lucide-react";

type DigioStatus = "requested" | "completed" | "cancelled" | "created" | string;

export type DigioStatusDetails = {
  success: boolean;
  digio_id?: string;
  status?: string;        // raw
  local_document_id?: number | string;
  data?: any;             // raw Digio payload if you forwarded from backend
  db?: any;               // DB row if you forwarded from backend
  error?: any;
};

type Party = {
  name?: string;
  email?: string;
  phone?: string;
};

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
}: {
  isOpen: boolean;
  onClose: () => void;
  doc: Doc;
  details: DigioStatusDetails | null;
  onResumeEsign: () => void;
  onMarkCompleted: () => Promise<void> | void;
}) {
  if (!isOpen) return null;

  const norm: DigioStatus = normalize(details?.status);
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

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Existing Digio Request Found</h3>
            <p className="text-sm text-gray-600">
              {doc?.title} • Template: {doc?.template_name}
            </p>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {badge.icon}
            <div className={`px-2 py-0.5 rounded-full text-xs ${badge.classes}`}>{badge.label}</div>
            {details?.digio_id && (
              <div className="text-xs text-gray-500">Digio ID: <span className="font-mono">{details.digio_id}</span></div>
            )}
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PartyCard title="Buyer" party={buyer} />
            <PartyCard title="Seller" party={seller} />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Continue or View */}
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

            {/* Optional: open Digio portal link if you store it */}
            {details?.data?.request_url && (
              <a
                href={details.data.request_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50"
              >
                <ExternalLink size={14} /> Open Digio
              </a>
            )}

            {/* Optional: download */}
            {details?.data?.download_url && (
              <a
                href={details.data.download_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50"
              >
                <Download size={14} /> Download PDF
              </a>
            )}
          </div>

          {/* Raw debug (toggle if needed) */}
          {/* <pre className="text-[11px] bg-gray-50 p-2 rounded border overflow-auto max-h-60">
            {JSON.stringify(details, null, 2)}
          </pre> */}
        </div>
      </div>
    </div>
  );
}

function PartyCard({ title, party }: { title: string; party: Party }) {
  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-sm font-medium">{party?.name || "—"}</div>
      <div className="text-xs text-gray-600">{party?.email || "—"}</div>
      <div className="text-xs text-gray-600">{party?.phone || "—"}</div>
    </div>
  );
}

function normalize(s?: string | null): DigioStatus {
  const x = (s || "").toLowerCase();
  if (["requested", "pending", "shared"].some(k => x.includes(k))) return "requested";
  if (["completed", "signed", "success"].some(k => x.includes(k))) return "completed";
  if (["cancel", "void", "rejected"].some(k => x.includes(k))) return "cancelled";
  if (["created"].some(k => x.includes(k))) return "created";
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
