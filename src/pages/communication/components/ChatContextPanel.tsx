// frontend/src/pages/communication/components/ChatContextPanel.tsx
import React, { useState } from "react";
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Sparkles,
  UserCheck,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
} from "lucide-react";
import { PropertyConversation } from "@/services/chatApi";

interface ChatContextPanelProps {
  conversation: PropertyConversation | null;
  onClose: () => void;
  isAdmin?: boolean;
  executives?: any[];
  onReassign?: (newExecutiveId: number) => Promise<void>;
}

function formatPrice(price?: number | string | null): string {
  if (!price) return "Price on Request";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export const ChatContextPanel: React.FC<ChatContextPanelProps> = ({
  conversation,
  onClose,
  isAdmin = false,
  executives = [],
  onReassign,
}) => {
  const [selectedExecId, setSelectedExecId] = useState<string>("");
  const [reassigning, setReassigning] = useState(false);
  const [reassignSuccess, setReassignSuccess] = useState(false);

  if (!conversation) return null;

  const customerName = `${conversation.user_first_name || "Customer"} ${conversation.user_last_name || ""}`.trim();
  const executiveName = `${conversation.executive_first_name || "Executive"} ${conversation.executive_last_name || ""}`.trim();

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExecId || !onReassign) return;

    setReassigning(true);
    try {
      await onReassign(parseInt(selectedExecId, 10));
      setReassignSuccess(true);
      setTimeout(() => setReassignSuccess(false), 3000);
      setSelectedExecId("");
    } catch (err) {
      console.error("Reassignment failed:", err);
    } finally {
      setReassigning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#0f2b3d] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#e87722]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Inquiry Details & Context
              </h3>
              <p className="text-[11px] text-slate-300">
                Property #{conversation.property_id} • Conv #{conversation.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Popup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {/* 1. Property Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e87722] bg-orange-100/80 px-2 py-0.5 rounded">
                Property Details
              </span>
              {conversation.property_slug && (
                <a
                  href={`/properties/${conversation.property_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#0f2b3d] hover:text-[#e87722] flex items-center gap-1 transition-colors"
                  title="View Property on Website"
                >
                  <span>Open Listing</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {conversation.property_title || `Property #${conversation.property_id}`}
            </h4>

            {conversation.property_society && (
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {conversation.property_society}
              </p>
            )}

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Price:</span>
                <span className="font-bold text-[#e87722]">
                  {formatPrice(conversation.property_price)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-bold text-slate-900 truncate max-w-[140px]">
                  {conversation.property_location || "Pune"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Customer & Executive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Box */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-[#e87722] flex items-center justify-center font-bold text-xs">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{customerName}</p>
                  <span className="text-[10px] text-slate-500">Interested Buyer/Client</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                {conversation.user_phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone size={11} /> Phone:
                    </span>
                    <a
                      href={`tel:${conversation.user_phone}`}
                      className="font-semibold text-slate-800 hover:text-[#e87722]"
                    >
                      {conversation.user_phone}
                    </a>
                  </div>
                )}
                {conversation.user_email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Mail size={11} /> Email:
                    </span>
                    <a
                      href={`mailto:${conversation.user_email}`}
                      className="font-medium text-slate-800 hover:text-[#e87722] truncate max-w-[140px]"
                      title={conversation.user_email}
                    >
                      {conversation.user_email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Executive Box */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <UserCheck size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{executiveName}</p>
                  <span className="text-[10px] text-slate-500">Assigned Executive</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                    {conversation.status || "active"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Started On:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(conversation.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Admin Executive Reassignment Control */}
          {isAdmin && onReassign && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2.5">
              <label className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <UserCheck size={14} className="text-indigo-600" />
                <span>Reassign Lead to Different Executive</span>
              </label>

              <form onSubmit={handleReassignSubmit} className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedExecId}
                  onChange={(e) => setSelectedExecId(e.target.value)}
                  className="w-full sm:flex-1 text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select executive...</option>
                  {executives
                    .filter((e) => Number(e.id) !== Number(conversation.executive_id))
                    .map((exec) => (
                      <option key={exec.id} value={exec.id}>
                        {exec.first_name} {exec.last_name} ({exec.role})
                      </option>
                    ))}
                </select>

                <button
                  type="submit"
                  disabled={!selectedExecId || reassigning}
                  className={`w-full sm:w-auto py-2 px-4 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedExecId && !reassigning
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {reassigning ? "Reassigning..." : "Reassign"}
                </button>
              </form>

              {reassignSuccess && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Executive reassigned successfully!</span>
                </p>
              )}
            </div>
          )}

          {/* 4. AI Session / Handoff Summary */}
          {conversation.ai_summary_json && (
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-orange-50/40 to-slate-50 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs mb-1">
                <Sparkles size={13} className="text-[#e87722]" />
                <span>AI Requirements Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                {conversation.ai_summary_json.looking_for && (
                  <div>
                    <span className="text-slate-400">Looking For:</span>{" "}
                    <strong>{conversation.ai_summary_json.looking_for}</strong>
                  </div>
                )}
                {conversation.ai_summary_json.preferred_location && (
                  <div>
                    <span className="text-slate-400">Location:</span>{" "}
                    <strong>{conversation.ai_summary_json.preferred_location}</strong>
                  </div>
                )}
                {conversation.ai_summary_json.budget && (
                  <div>
                    <span className="text-slate-400">Budget:</span>{" "}
                    <strong>{conversation.ai_summary_json.budget}</strong>
                  </div>
                )}
                {conversation.ai_summary_json.intent && (
                  <div>
                    <span className="text-slate-400">Intent:</span>{" "}
                    <strong>{conversation.ai_summary_json.intent}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
