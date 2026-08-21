import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  Edit,
  UserCheck,
  Award,
  Flag,
  Users,
  FileText,
  Activity,
  ExternalLink,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { getImageUrl } from "@/lib/helpers";

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";
const BG = "#f8fafc";
const MU = "#5a7184";

interface SellerViewModalProps {
  seller: any | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFull?: (seller: any) => void;
  onEdit?: (seller: any) => void;
  onAccount?: (sellerId: number) => void;
  canEdit?: boolean;
  onUnlinkProperties?: (propertyIds: string[]) => Promise<void> | void;
}

const formatCurrency = (val?: number | string | null) => {
  if (val === null || val === undefined || val === "") return "₹0";
  const num = Number(val);
  if (isNaN(num)) return `₹${val}`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const toDate = (v?: string | null) => {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 10);
  } catch {
    return "—";
  }
};

const getStageBadgeClass = (stage: string) => {
  const stages: Record<string, string> = {
    initial_contact: "bg-blue-100 text-blue-700",
    property_collection: "bg-purple-100 text-purple-700",
    mandate_discussion: "bg-orange-100 text-orange-700",
    mandate_signed: "bg-green-100 text-green-700",
    selling_process: "bg-indigo-100 text-indigo-700",
    deal_negotiation: "bg-yellow-100 text-yellow-700",
    deal_closure: "bg-pink-100 text-pink-700",
    completed: "bg-emerald-100 text-emerald-700",
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

const SellerViewModal: React.FC<SellerViewModalProps> = ({
  seller,
  isOpen,
  onClose,
  onViewFull,
  onEdit,
  onAccount,
  canEdit = true,
  onUnlinkProperties,
}) => {
  const [selectedPropIds, setSelectedPropIds] = useState<string[]>([]);

  if (!isOpen || !seller) return null;

  const initials = (() => {
    const f = seller.name?.split(" ")[0] || "";
    const l = seller.name?.split(" ")[1] || "";
    return (
      (f.charAt(0) + l.charAt(0)).toUpperCase().slice(0, 2) ||
      seller.name?.charAt(0)?.toUpperCase() ||
      "S"
    );
  })();

  const rawPhone = (seller.phone || "").replace(/\D/g, "");
  const rawWhatsapp = (seller.whatsapp || seller.phone || "").replace(/\D/g, "");

  const properties = Array.isArray(seller.properties) ? seller.properties : [];
  const coSellers = Array.isArray(seller.coSellers) ? seller.coSellers : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
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
                  {seller.salutation ? `${seller.salutation} ` : ""}
                  {seller.name}
                </h3>
                <span className="text-[10px] text-white/60">ID: #{seller.id}</span>
              </div>
              <p className="text-[10px] text-white/70 flex items-center gap-1">
                <MapPin size={10} />
                <span>
                  {[seller.location, seller.city, seller.state]
                    .filter((x) => x && x !== "-")
                    .join(", ") || "Location not specified"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                seller.isActive
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {seller.isActive ? "Active" : "Inactive"}
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
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${getStageBadgeClass(
                seller.stage
              )}`}
            >
              {seller.stage?.replace(/_/g, " ")}
            </span>
            {seller.priority && (
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${getPriorityBadgeClass(
                  seller.priority
                )}`}
              >
                {seller.priority} Priority
              </span>
            )}
            {seller.source && seller.source !== "-" && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-700">
                Source: {seller.source}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {rawPhone && (
              <a
                href={`tel:${rawPhone}`}
                className="p-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                title="Call Seller"
              >
                <Phone size={13} />
              </a>
            )}
            {rawWhatsapp && (
              <button
                onClick={() => {
                  window.open(
                    `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(
                      `Hi ${seller.name}, regarding your property inquiry.`
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
            {seller.email && seller.email !== "-" && (
              <a
                href={`mailto:${seller.email}?subject=Property Inquiry`}
                className="p-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                title="Email Seller"
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
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              className="p-2.5 rounded-lg border text-center"
              style={{ background: BG, borderColor: BD }}
            >
              <span className="text-[10px] text-gray-500 block">Deal Value</span>
              <span className="text-xs font-bold" style={{ color: O }}>
                {formatCurrency(seller.dealValue)}
              </span>
            </div>
            <div
              className="p-2.5 rounded-lg border text-center"
              style={{ background: BG, borderColor: BD }}
            >
              <span className="text-[10px] text-gray-500 block">Properties</span>
              <span className="text-xs font-bold" style={{ color: N }}>
                {properties.length}
              </span>
            </div>
            <div
              className="p-2.5 rounded-lg border text-center"
              style={{ background: BG, borderColor: BD }}
            >
              <span className="text-[10px] text-gray-500 block">Visits</span>
              <span className="text-xs font-bold text-blue-600">
                {seller.visits || seller.totalVisits || 0}
              </span>
            </div>
            <div
              className="p-2.5 rounded-lg border text-center"
              style={{ background: BG, borderColor: BD }}
            >
              <span className="text-[10px] text-gray-500 block">Stage Progress</span>
              <span className="text-xs font-bold text-indigo-600">
                {seller.stageProgress || 0}%
              </span>
            </div>
          </div>

          {/* Contact Details & Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Contact Box */}
            <div
              className="p-3 rounded-lg border space-y-2"
              style={{ background: "white", borderColor: BD }}
            >
              <h4
                className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: N }}
              >
                <User size={12} style={{ color: O }} /> Contact Details
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium text-gray-900">{seller.phone || "—"}</span>
                </div>
                {seller.whatsapp && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">WhatsApp:</span>
                    <span className="font-medium text-gray-900">{seller.whatsapp}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-900 truncate max-w-[180px]">
                    {seller.email || "—"}
                  </span>
                </div>
                {seller.seller_dob && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Date of Birth:</span>
                    <span className="font-medium text-gray-900">{toDate(seller.seller_dob)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lead / Assignment Box */}
            <div
              className="p-3 rounded-lg border space-y-2"
              style={{ background: "white", borderColor: BD }}
            >
              <h4
                className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: N }}
              >
                <Activity size={12} style={{ color: O }} /> Lead & Assignment
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Assigned To:</span>
                  <span className="font-semibold text-gray-900">
                    {seller.assigned_to_name || seller.assigned || "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Lead Type:</span>
                  <span className="font-medium text-gray-900">{seller.leadType || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium text-gray-900">{toDate(seller.created_at)}</span>
                </div>
                {seller.expectedClose && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Expected Close:</span>
                    <span className="font-medium text-orange-600">{toDate(seller.expectedClose)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <div
            className="p-3 rounded-lg border space-y-2"
            style={{ background: "white", borderColor: BD }}
          >
              <div className="flex items-center justify-between w-full">
                <h4
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: N }}
                >
                  <Building size={12} style={{ color: O }} /> Linked Properties ({properties.length})
                </h4>
                {selectedPropIds.length > 0 && onUnlinkProperties && (
                  <button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: 'Unlink Selected Properties?',
                        text: `Are you sure you want to unlink the ${selectedPropIds.length} selected properties from this seller?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Yes, Unlink All',
                        cancelButtonText: 'Cancel',
                        width: '380px',
                        customClass: {
                          popup: 'rounded-xl shadow-2xl',
                          title: 'text-base font-bold text-gray-800',
                          htmlContainer: 'text-xs text-gray-600',
                          confirmButton: 'px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 mx-1',
                          cancelButton: 'px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 mx-1',
                        },
                        buttonsStyling: false,
                      });
                      if (result.isConfirmed) {
                        await onUnlinkProperties(selectedPropIds);
                        setSelectedPropIds([]);
                      }
                    }}
                    className="px-2 py-0.5 rounded text-[8px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all animate-pulse"
                  >
                    Unlink Selected ({selectedPropIds.length})
                  </button>
                )}
              </div>

            {properties.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {properties.map((p: any, idx: number) => {
                  const propType = p.property_type_name || p.property_type || "";
                  const unitType = p.unit_type || p.bhk || p.configuration || "";
                  const subtype = p.property_subtype_name || p.property_sub_type || p.property_subtype || p.subtype || "";
                  const titleParts = [propType, unitType, subtype].map(s => String(s).trim()).filter(Boolean).join(" ");
                  const title = titleParts || p.title || `Property #${idx + 1}`;

                  const address =
                    p.address ||
                    [p.location_name || p.location, p.city_name || p.city]
                      .filter(Boolean)
                      .join(", ") ||
                    "Location not specified";
                  const price = p.price || p.budget || p.expected_price;
                  const rawPhoto =
                    p.photo ||
                    p.photos?.[0]?.url ||
                    p.photos?.[0] ||
                    p.image;
                  const photo = getImageUrl(rawPhoto) || null;

                  return (
                    <div
                      key={p.id || idx}
                      className="flex items-center gap-2.5 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                      style={{ borderColor: BD }}
                    >
                      {onUnlinkProperties && (
                        <input
                          type="checkbox"
                          checked={selectedPropIds.includes(String(p.id || p.property_id || p._id))}
                          onChange={(e) => {
                            const idStr = String(p.id || p.property_id || p._id);
                            if (e.target.checked) {
                              setSelectedPropIds(prev => [...prev, idStr]);
                            } else {
                              setSelectedPropIds(prev => prev.filter(id => id !== idStr));
                            }
                          }}
                          className="accent-orange-500 h-3.5 w-3.5 mr-0.5 cursor-pointer"
                        />
                      )}
                      {photo ? (
                        <img
                          src={photo}
                          alt={title}
                          className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)?.classList?.remove('hidden'); }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 flex-shrink-0 ${photo ? 'hidden' : ''}`}>
                        No Pic
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-[11px]">
                          {title}
                        </p>
                        <p className="text-gray-500 text-[10px] truncate">{address}</p>
                      </div>
                      {price && (
                        <span className="font-bold text-[11px] whitespace-nowrap" style={{ color: O }}>
                          {formatCurrency(price)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic text-center py-2">
                No properties linked with this seller yet.
              </p>
            )}
          </div>

          {/* Co-Sellers if any */}
          {coSellers.length > 0 && (
            <div
              className="p-3 rounded-lg border space-y-2"
              style={{ background: "white", borderColor: BD }}
            >
              <h4
                className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: N }}
              >
                <Users size={12} style={{ color: O }} /> Co-Sellers ({coSellers.length})
              </h4>
              <div className="space-y-1.5">
                {coSellers.map((cs: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border text-[11px]"
                    style={{ borderColor: BD }}
                  >
                    <div>
                      <span className="font-semibold text-gray-900">
                        {cs.coSeller_salutation || cs.salutation || ""} {cs.coSeller_name || cs.name}
                      </span>
                      {cs.coSeller_relation && (
                        <span className="text-gray-500 text-[10px] ml-1.5">
                          ({cs.coSeller_relation})
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600">{cs.coSeller_phone || cs.phone || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {seller.notes && (
            <div
              className="p-3 rounded-lg border space-y-1"
              style={{ background: "white", borderColor: BD }}
            >
              <h4
                className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: N }}
              >
                <FileText size={12} style={{ color: O }} /> Notes
              </h4>
              <p className="text-gray-700 text-[11px] whitespace-pre-wrap">{seller.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 border-t flex items-center justify-between gap-2"
          style={{ background: BG, borderColor: BD }}
        >
          <div className="flex items-center gap-2">
            {onAccount && (
              <button
                onClick={() => {
                  onClose();
                  onAccount(seller.id);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="Open Seller Account Page"
              >
                <UserCheck size={13} />
                <span>Account</span>
              </button>
            )}
            {canEdit && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(seller);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
                title="Edit Seller"
              >
                <Edit size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            {onViewFull && (
              <button
                onClick={() => {
                  onClose();
                  onViewFull(seller);
                }}
                className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm transition-all hover:opacity-90"
                style={{ background: O }}
              >
                <ExternalLink size={13} />
                <span>View Full Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerViewModal;
