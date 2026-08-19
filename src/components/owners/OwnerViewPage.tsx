import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Phone, Mail, MapPin, Edit, Eye, User as UserIcon, Calendar as CalendarIcon, Star, Building, FileText, Plus, Trash2, Home, Link2 } from "lucide-react";
import ownerAPI from "@/lib/ownerAPI";
import ownerFollowupAPI from "@/lib/ownerFollowupAPI";
import LinkRentalPropertyModal from "./LinkRentalPropertyModal";
import OwnerFollowupModal from "./OwnerFollowupModal";
import { toast } from "react-toastify";
import TableLoader from "@/components/ui/TableLoader";

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";

interface OwnerViewPageProps {
  ownerId: number;
  onBack: () => void;
}

export const OwnerViewPage: React.FC<OwnerViewPageProps> = ({ ownerId, onBack }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "followups">("overview");
  const [ownerData, setOwnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Followup & Link property modal states
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
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

  return (
    <div className="p-4 space-y-4" style={{ backgroundColor: BG }}>
      {/* Header Back & Action Banner */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        <button
          onClick={onBack}
          className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            Owner Profile: {owner.salutation} {owner.name}
          </h3>
          <p className="text-[10px] text-gray-500">ID: OWNER-{owner.id} • Assigned: {owner.assigned_to_name || "Unassigned"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Side: Owner Profile summary Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 h-fit">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">{owner.salutation} {owner.name}</div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                {owner.stage.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <Phone size={13} className="text-gray-400" />
              <span>{owner.phone || "-"}</span>
            </div>
            {owner.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail size={13} className="text-gray-400" />
                <span className="truncate">{owner.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={13} className="text-gray-400" />
              <span>{owner.location || "-"}, {owner.city || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Star size={13} className="text-gray-400" />
              <span className="capitalize">Priority: {owner.priority || "Medium"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarIcon size={13} className="text-gray-400" />
              <span>Created At: {owner.created_at ? new Date(owner.created_at).toLocaleDateString() : "-"}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details and Tabs Section */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Tabs header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex gap-2 w-fit">
            {(["overview", "properties", "followups"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-[#0f2b3d] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "properties" ? "Rental Properties" : tab}
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex-1">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-800 border-b pb-2">Overview Details</h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-500">Owner State/City</p>
                    <p className="font-bold text-gray-800">{owner.state || "-"} / {owner.city || "-"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">Source</p>
                    <p className="font-bold text-gray-800">{owner.source || "-"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">Lead Score</p>
                    <p className="font-bold text-gray-800">{owner.lead_score || 0}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">Assigned Executive</p>
                    <p className="font-bold text-gray-800">{owner.assigned_to_name || "Unassigned"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Remarks / Notes</p>
                  <div className="p-3 bg-gray-50 border rounded-lg text-xs text-gray-600 h-24 overflow-y-auto">
                    {owner.notes || "No remarks or notes added."}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "properties" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-bold text-gray-800">Linked Rental Properties</h4>
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    <Plus size={12} /> Link Rental Property
                  </button>
                </div>

                <div className="space-y-2">
                  {properties.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs font-medium">
                      No linked rental properties. Click the button to link one.
                    </div>
                  ) : (
                    properties.map((p: any) => {
                      const title = p.title || `${p.bedrooms || 0} BHK ${p.property_subtype_name || p.property_type_name || 'Property'} in ${p.society_name || p.location_name || ''}`;
                      return (
                        <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border bg-gray-50 text-xs">
                          <div className="flex items-center gap-2">
                            <Building size={14} className="text-gray-400" />
                            <div>
                              <div className="font-bold text-gray-800">{title}</div>
                              <div className="text-[10px] text-gray-500">Location: {p.location_name || "-"} • Rent: ₹{p.monthly_rent || 0}/mo</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkProperty(p.id)}
                            className="p-1 border hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                            title="Unlink Property"
                          >
                            <Trash2 size={13} />
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
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-bold text-gray-800">Scheduled Follow-ups</h4>
                  <button
                    onClick={() => { setSelectedFollowup(null); setShowFollowupModal(true); }}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    <Plus size={12} /> Add Follow-up
                  </button>
                </div>

                <div className="space-y-2">
                  {followups.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs font-medium">
                      No follow-ups scheduled.
                    </div>
                  ) : (
                    followups.map((f: any) => (
                      <div key={f.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-start gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-800">{f.followup_type || f.followupType}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              f.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {f.status}
                            </span>
                          </div>
                          <p className="text-gray-600 font-medium">{f.notes || "No notes."}</p>
                          <p className="text-[10px] text-gray-400">Date: {f.followup_date ? new Date(f.followup_date).toLocaleString() : "-"}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setSelectedFollowup(f); setShowFollowupModal(true); }}
                            className="p-1 border hover:bg-gray-100 text-orange-500 rounded"
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
    </div>
  );
};

export default OwnerViewPage;
