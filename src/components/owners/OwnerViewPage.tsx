import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, MapPin, Edit, Eye, User as UserIcon,
  Calendar as CalendarIcon, Star, Building, FileText, Plus, Trash2,
  Home, Link2, Tag, Flag, Clock, UserCheck, KeyRound
} from "lucide-react";
import ownerAPI from "@/lib/ownerAPI";
import ownerFollowupAPI from "@/lib/ownerFollowupAPI";
import LinkRentalPropertyModal from "./LinkRentalPropertyModal";
import OwnerCredentialsModal from "./OwnerCredentialsModal";
import rentalPropertiesAPI from "@/lib/rentalPropertiesAPI";
import OwnerFollowupModal from "./OwnerFollowupModal";
import { toast } from "react-toastify";
import TableLoader from "@/components/ui/TableLoader";

// Design Schema matching SellerViewPage
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const WHITE = "#ffffff";
const DARK = "#1e293b";

interface OwnerViewPageProps {
  ownerId: number;
  onBack: () => void;
}

export const OwnerViewPage: React.FC<OwnerViewPageProps> = ({ ownerId, onBack }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "followups">("overview");
  const [ownerData, setOwnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<any>(null);

  const fetchOwnerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ownerAPI.getById(ownerId);
      if (res && res.success && res.data) {
        setOwnerData(res.data);
      } else {
        toast.error("Failed to load owner details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load owner details");
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchOwnerDetails();
  }, [fetchOwnerDetails]);

  const handleLinkProperty = async (property: any) => {
    try {
      const currentProps = ownerData.properties || [];
      const updatedProps = [...currentProps, property];

      const payload = {
        name: ownerData.owner.name,
        properties: updatedProps.map((p: any) => ({ id: p.id }))
      };

      await ownerAPI.update(ownerId, payload);
      await rentalPropertiesAPI.patchOwner(String(property.id), 'link', ownerId);
      toast.success("Rental property linked successfully!");
      fetchOwnerDetails();
      setShowLinkModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to link rental property");
    }
  };

  const handleUnlinkProperty = async (propertyId: number | string) => {
    try {
      const currentProps = ownerData.properties || [];
      const updatedProps = currentProps.filter((p: any) => String(p.id) !== String(propertyId));

      const payload = {
        name: ownerData.owner.name,
        properties: updatedProps.map((p: any) => ({ id: p.id }))
      };

      await ownerAPI.update(ownerId, payload);
      await rentalPropertiesAPI.patchOwner(String(propertyId), 'unlink');
      toast.success("Rental property unlinked successfully!");
      fetchOwnerDetails();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to unlink rental property");
    }
  };

  const handleFollowupDelete = async (followupId: number) => {
    try {
      await ownerFollowupAPI.remove(followupId);
      toast.success("Follow-up deleted successfully");
      fetchOwnerDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete follow-up");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-semibold flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
        Loading owner details...
      </div>
    );
  }

  if (!ownerData || !ownerData.owner) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white border rounded-xl m-4">
        Owner details not found.
        <button onClick={onBack} className="block mx-auto mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const { owner, properties = [], followups = [], metrics = {} } = ownerData;

  const tabs = [
    { id: "overview", label: "Overview", icon: UserIcon },
    { id: "properties", label: "Rental Properties", icon: Building, count: properties.length },
    { id: "followups", label: "Follow-ups", icon: CalendarIcon, count: followups.length },
  ];

  return (
    <div className="p-4 space-y-4 bg-slate-50 min-h-screen">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Owner Profile: {owner.salutation} {owner.name}
            </h1>
            <p className="text-xs text-slate-500">ID: OWNER-{owner.id} • Registered Profile</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCredentialsModal(true)}
            className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Owner Login Credentials"
          >
            <KeyRound size={14} />
            <span>Login Credentials</span>
          </button>
          <Link
            to={`/dashboard/owners-account/${owner.id}`}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#07263b] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Open Owner Account Portal"
          >
            <UserCheck size={14} className="text-amber-400" />
            <span>Owner Account Portal</span>
          </Link>
          <span className="px-3 py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
            Stage: {(owner.stage || "").replace("_", " ").toUpperCase()}
          </span>
          <span className="px-3 py-1 text-xs font-bold text-orange-600 bg-orange-50 rounded-lg border border-orange-200">
            Priority: {owner.priority || "Medium"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Profile and Info Cards */}
        <div className="space-y-4">
          {/* Card 1: Main Profiling info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black text-xl border border-orange-200">
                {owner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base leading-tight">
                  {owner.salutation} {owner.name}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <UserIcon size={12} className="text-slate-400" />
                  <span>Landlord Owner</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Phone</span>
                <span className="font-semibold">{owner.phone || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Email</span>
                <span className="font-semibold truncate max-w-[180px]">{owner.email || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">WhatsApp</span>
                <span className="font-semibold">{owner.whatsapp || owner.phone || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Location</span>
                <span className="font-semibold">{owner.location || "-"}, {owner.city || "-"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Performance Statistics */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b pb-2 border-slate-100 flex items-center gap-1.5">
              <Tag size={13} className="text-orange-500" /> Performance & Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-lg font-black text-slate-900">{properties.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Properties</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-lg font-black text-slate-900">{followups.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Followups</div>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Assigned Executive</span>
                <span className="font-bold text-slate-800">{owner.assigned_to_name || "Unassigned"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Lead Source</span>
                <span className="font-bold text-slate-800 capitalize">{owner.source || "Direct"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Registered On</span>
                <span className="font-bold text-slate-800">
                  {owner.created_at ? new Date(owner.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Dynamic Tabs Section */}
        <div className="lg:col-span-2 space-y-4 flex flex-col min-h-0">
          {/* Tabs header row */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 flex gap-1 w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                    isSelected
                      ? "bg-[#0f2b3d] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Content Cards */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex-1 min-h-0">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 border-b pb-2.5 border-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                  <UserIcon size={14} className="text-orange-500" /> Account Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">Salutation</span>
                    <span className="font-bold text-slate-800">{owner.salutation || "Mr."}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">Owner DOB</span>
                    <span className="font-bold text-slate-800">
                      {owner.owner_dob ? new Date(owner.owner_dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">Location Area</span>
                    <span className="font-bold text-slate-800">{owner.location || "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 block mb-0.5">City / State</span>
                    <span className="font-bold text-slate-800">{owner.city || "—"} / {owner.state || "—"}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Remarks & Profile Notes</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 h-28 overflow-y-auto leading-relaxed" style={{ scrollbarWidth: "thin" }}>
                    {owner.notes || "No remarks or profile notes added to this owner profile."}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "properties" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2.5 border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Building size={14} className="text-orange-500" /> Linked Rental Assets
                  </h3>
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#e67e22] hover:bg-[#d35400] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Plus size={13} /> Link Property
                  </button>
                </div>

                <div className="space-y-3">
                  {properties.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      No linked rental properties. Click the button to link properties.
                    </div>
                  ) : (
                    properties.map((p: any) => {
                      const bedroomsVal = p.bedrooms && String(p.bedrooms) !== "null" && String(p.bedrooms) !== "undefined" ? p.bedrooms : "";
                      const bhkText = bedroomsVal ? `${bedroomsVal} BHK ` : "";

                      const typeVal = p.property_subtype_name && String(p.property_subtype_name) !== "null" && String(p.property_subtype_name) !== "undefined"
                        ? p.property_subtype_name
                        : (p.property_type_name && String(p.property_type_name) !== "null" && String(p.property_type_name) !== "undefined" ? p.property_type_name : "Property");

                      const locText = p.society_name && String(p.society_name) !== "null" && String(p.society_name) !== "undefined"
                        ? ` in ${p.society_name}`
                        : (p.location_name && String(p.location_name) !== "null" && String(p.location_name) !== "undefined" ? ` in ${p.location_name}` : "");

                      const title = p.title || `${bhkText}${typeVal}${locText}`;
                      return (
                        <div key={p.id} className="flex justify-between items-center p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center flex-shrink-0">
                              <Building size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">
                                <Link
                                  to={`/dashboard/rental-properties?view=${p.id}`}
                                  className="hover:text-orange-600 hover:underline cursor-pointer transition-colors"
                                >
                                  {title}
                                </Link>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                <Link
                                  to={`/dashboard/rental-properties?view=${p.id}`}
                                  className="hover:text-orange-600 hover:underline cursor-pointer transition-colors font-bold text-orange-500"
                                >
                                  RENT-{p.id}
                                </Link>
                                <span> • {p.location_name || "-"} • Rent: ₹{(p.monthly_rent || 0).toLocaleString("en-IN")}/mo</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkProperty(p.id)}
                            className="px-2.5 py-1 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Unlink Property"
                          >
                            Unlink
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === "followups" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2.5 border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-orange-500" /> Scheduled Action Logs
                  </h3>
                  <button
                    onClick={() => { setSelectedFollowup(null); setShowFollowupModal(true); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#e67e22] hover:bg-[#d35400] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Plus size={13} /> Add Follow-up
                  </button>
                </div>

                <div className="space-y-3">
                  {followups.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      No follow-ups logged for this owner.
                    </div>
                  ) : (
                    followups.map((f: any) => (
                      <div key={f.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 flex justify-between items-start gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-800">{f.followup_type || f.followupType}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              f.status === "completed" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}>
                              {f.status}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-medium">{f.notes || "No remarks notes."}</p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                            <Clock size={10} />
                            <span>Date: {f.followup_date ? new Date(f.followup_date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => { setSelectedFollowup(f); setShowFollowupModal(true); }}
                            className="p-1 border hover:bg-slate-50 text-orange-500 rounded"
                            title="Edit Followup"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleFollowupDelete(f.id)}
                            className="p-1 border hover:bg-red-50 text-red-500 rounded"
                            title="Delete Followup"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLinkModal && (
        <LinkRentalPropertyModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          onSelectProperty={handleLinkProperty}
          linkingOwner={owner}
        />
      )}

      {showFollowupModal && (
        <OwnerFollowupModal
          isOpen={showFollowupModal}
          onClose={() => setShowFollowupModal(false)}
          ownerId={ownerId}
          onSave={fetchOwnerDetails}
          initialFollowup={selectedFollowup}
        />
      )}

      {showCredentialsModal && (
        <OwnerCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
          ownerId={ownerId}
          ownerName={owner?.name}
          ownerPhone={owner?.phone}
          ownerEmail={owner?.email}
        />
      )}
    </div>
  );
};

export default OwnerViewPage;
