import React from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  User,
  Calendar,
  Clock,
  Eye,
  Edit,
  UserCheck,
  Award,
  Users,
  FileText,
  ExternalLink,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";
const BG = "#f8fafc";
const MU = "#5a7184";

interface OwnerViewModalProps {
  owner: any | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFull?: (owner: any) => void;
  onEdit?: (owner: any) => void;
  canEdit?: boolean;
}

const getStageBadgeClass = (stage: string) => {
  const stages: Record<string, string> = {
    initial_contact: "bg-blue-100 text-blue-700",
    discussion: "bg-purple-100 text-purple-700",
    negotiation: "bg-yellow-100 text-yellow-700",
    deal_closure: "bg-pink-100 text-pink-700",
    completed: "bg-emerald-100 text-emerald-700",
    inactive: "bg-gray-100 text-gray-700",
  };
  return stages[stage] || "bg-gray-100 text-gray-700";
};

const getPriorityBadgeClass = (priority: string) => {
  const map: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-green-100 text-green-700",
  };
  return map[priority?.toLowerCase() || ""] || "bg-gray-100 text-gray-700";
};

export const OwnerViewModal: React.FC<OwnerViewModalProps> = ({
  owner,
  isOpen,
  onClose,
  onViewFull,
  onEdit,
  canEdit = true,
}) => {
  if (!isOpen || !owner) return null;

  const initials = (() => {
    const f = owner.name?.split(" ")[0] || "";
    const l = owner.name?.split(" ")[1] || "";
    return (
      (f.charAt(0) + l.charAt(0)).toUpperCase().slice(0, 2) ||
      owner.name?.charAt(0)?.toUpperCase() ||
      "O"
    );
  })();

  const rawPhone = (owner.phone || "").replace(/\D/g, "");
  const rawWhatsapp = (owner.whatsapp || owner.phone || "").replace(/\D/g, "");

  const properties = Array.isArray(owner.properties) ? owner.properties : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      style={{
        background: "rgba(15,43,61,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ border: `1px solid ${BD}` }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: N }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: O }}
            >
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white leading-tight">
                  {owner.salutation ? `${owner.salutation} ` : ""}
                  {owner.name}
                </h3>
                <span className="text-[10px] text-white/60">ID: OWNER-#{owner.id}</span>
              </div>
              <p className="text-[10px] text-white/70 flex items-center gap-1 mt-0.5">
                <MapPin size={10} />
                <span>
                  {[owner.location, owner.city, owner.state]
                    .filter((x) => x && x !== "-")
                    .join(", ") || "Location not specified"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                owner.status === "Active" || owner.status === "active" || owner.status === "Active Search"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {owner.status || "Active"}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Action Quick Bar */}
        <div
          className="px-4 py-2 flex items-center justify-between border-b text-xs"
          style={{ background: BG, borderColor: BD }}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {owner.stage && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${getStageBadgeClass(
                  owner.stage
                )}`}
              >
                {owner.stage?.replace(/_/g, " ").toUpperCase()}
              </span>
            )}
            {owner.priority && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${getPriorityBadgeClass(
                  owner.priority
                )}`}
              >
                {owner.priority.toUpperCase()} Priority
              </span>
            )}
            {owner.source && owner.source !== "-" && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-700">
                Source: {owner.source}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {rawPhone && (
              <a
                href={`tel:${rawPhone}`}
                className="p-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                title="Call Owner"
              >
                <Phone size={13} />
              </a>
            )}
            {rawWhatsapp && (
              <button
                onClick={() => {
                  window.open(
                    `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(
                      `Hi ${owner.name}, regarding your property.`
                    )}`,
                    "_blank"
                  );
                }}
                className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                title="WhatsApp Message"
              >
                <SiWhatsapp size={13} />
              </button>
            )}
            {owner.email && owner.email !== "-" && (
              <a
                href={`mailto:${owner.email}?subject=Property Inquiry`}
                className="p-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title="Email Owner"
              >
                <Mail size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Owner Details Card */}
            <div className="bg-slate-50/50 rounded-xl p-3 border border-gray-100 space-y-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-gray-100">
                <User size={13} className="text-gray-400" />
                <span className="font-bold text-gray-800 text-xs">Owner Information</span>
              </div>
              <div className="space-y-1.5 text-gray-600 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Salutation:</span>
                  <span className="font-medium text-gray-800">{owner.salutation || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-semibold text-gray-900">{owner.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="font-medium text-gray-800">{owner.phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-medium text-gray-800 truncate max-w-[150px]">{owner.email || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DOB:</span>
                  <span className="font-medium text-gray-800">{owner.owner_dob || owner.dob || "-"}</span>
                </div>
              </div>
            </div>

            {/* Business Details Card */}
            <div className="bg-slate-50/50 rounded-xl p-3 border border-gray-100 space-y-2">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-gray-100">
                <Building size={13} className="text-gray-400" />
                <span className="font-bold text-gray-800 text-xs">Lead Context</span>
              </div>
              <div className="space-y-1.5 text-gray-600 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Lead Type:</span>
                  <span className="font-medium text-gray-800">{owner.lead_type || owner.leadType || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lead Score:</span>
                  <span className="font-bold text-gray-800">{owner.lead_score || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deal Value:</span>
                  <span className="font-semibold text-emerald-600">
                    {owner.deal_value ? `₹${Number(owner.deal_value).toLocaleString("en-IN")}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Executive:</span>
                  <span className="font-semibold text-gray-800">{owner.assigned_to_name || "Unassigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Country:</span>
                  <span className="font-medium text-gray-800">{owner.countryCode || "+91"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks/Notes */}
          {owner.notes && (
            <div className="bg-slate-50/30 rounded-xl p-3 border border-gray-100 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs pb-1 border-b border-gray-100">
                <FileText size={13} className="text-gray-400" />
                <span>Remarks & Notes</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[11px] whitespace-pre-line bg-white p-2 border rounded-lg max-h-32 overflow-y-auto">
                {owner.notes}
              </p>
            </div>
          )}

          {/* Linked Rental Properties */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b">
              <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                <Building size={13} className="text-gray-400" />
                <span>Associated Rental Properties ({properties.length})</span>
              </span>
            </div>
            {properties.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 border border-dashed rounded-lg text-gray-400 text-[11px]">
                No properties linked to this owner.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                {properties.map((prop: any) => {
                  const pid = prop.id || prop.property_id || prop._id;
                  const displayTitle =
                    prop.title ||
                    [prop.property_type_name || prop.type, prop.unit_type || prop.bedrooms ? `${prop.bedrooms} BHK` : ""]
                      .filter(Boolean)
                      .join(" • ") ||
                    "Rental Property";

                  return (
                    <div
                      key={pid}
                      className="p-2 border rounded-lg bg-white shadow-xs flex items-center justify-between gap-2 border-gray-200"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-[11px] truncate">{displayTitle}</p>
                        <p className="text-[9px] text-gray-500 truncate">{prop.location || prop.society_name || "-"}</p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-50 text-orange-700 border border-orange-100 flex-shrink-0">
                        RENT-{pid}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 border-t flex items-center justify-between text-xs"
          style={{ background: BG, borderColor: BD }}
        >
          <div className="flex items-center gap-1.5">
            {onViewFull && (
              <button
                onClick={() => {
                  onViewFull(owner);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-all"
              >
                <Eye size={12} />
                <span>View Full Profile</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-100 font-bold transition-all"
            >
              Cancel
            </button>
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onEdit(owner);
                  onClose();
                }}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-white bg-[#e67e22] hover:bg-[#d35400] font-bold shadow-sm transition-all"
              >
                <Edit size={12} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerViewModal;
