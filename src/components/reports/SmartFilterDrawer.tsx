// frontend/src/components/reports/SmartFilterDrawer.tsx
import React, { useState, useEffect } from "react";
import { Filter, X, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { usersAPI } from "@/lib/api";

export interface SmartFilterParams {
  status?: string;
  source?: string;
  lead_type?: string;
  priority?: string;
  assigned_executive?: string;
  created_by?: string;
  sort_by?: string;
  ignoreDate?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  property_type?: string;
  bedrooms?: string;
  activity_type?: string;
  direction?: string;
  department?: string;
  efficiencyRating?: string;
  budget_min?: string;
  budget_max?: string;
  location?: string;
  city?: string;
  tenant_type?: string;
  preferred_bhk?: string;
  min_amount?: string;
  max_amount?: string;
  campaign_type?: string;
}

interface SmartFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SmartFilterParams;
  onApplyFilters: (newFilters: SmartFilterParams) => void;
  onClearFilters: () => void;
  tabKey?: string;
}

export const SmartFilterDrawer: React.FC<SmartFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
  tabKey = "leads",
}) => {
  const [draft, setDraft] = useState<SmartFilterParams>({ ...filters });
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    setDraft({ ...filters });
  }, [filters, isOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await usersAPI.getAllUsers();
        if (res?.data && Array.isArray(res.data)) {
          setUsersList(res.data);
        } else if (Array.isArray(res)) {
          setUsersList(res);
        }
      } catch (err) {
        console.error("Failed to load users for filter drawer:", err);
      }
    };
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof SmartFilterParams, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleClear = () => {
    const resetState = { ignoreDate: true, status: "all" };
    setDraft(resetState);
    onClearFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200 no-print">
      {/* Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Dark Navy Header */}
          <div className="bg-[#0f1f38] text-white px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <Filter className="w-5 h-5 text-orange-500" />
              <div>
                <h2 className="text-base font-bold tracking-wide">Smart Filters</h2>
                <div className="text-[10px] text-gray-300 capitalize">{tabKey.replace("-", " ")} Report Specific</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body tailored dynamically per Tab */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-gray-700">
            {/* Common Status Field */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Status Filter</label>
              <select
                value={draft.status || "all"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs focus:ring-navy-500 focus:border-navy-500"
              >
                <option value="all">All Statuses</option>
                {["leads", "overview"].includes(tabKey) && (
                  <>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="unqualified">Unqualified / Lost</option>
                    <option value="closed">Closed / Won</option>
                  </>
                )}
                {tabKey === "buyers" && (
                  <>
                    <option value="active">Active</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                  </>
                )}
                {tabKey === "sellers" && (
                  <>
                    <option value="active">Active Listing</option>
                    <option value="published">Published</option>
                    <option value="sold">Sold / Closed</option>
                  </>
                )}
                {tabKey === "tenants" && (
                  <>
                    <option value="active">Active</option>
                    <option value="occupied">Occupied</option>
                    <option value="vacated">Vacated</option>
                  </>
                )}
                {tabKey === "owners" && (
                  <>
                    <option value="active">Active Owner</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed / Rented</option>
                  </>
                )}
                {tabKey === "properties" && (
                  <>
                    <option value="active">Active Listing</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="stale">Stale (&gt;90 Days)</option>
                  </>
                )}
                {tabKey === "visits" && (
                  <>
                    <option value="completed">Completed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="cancelled">Cancelled</option>
                  </>
                )}
                {tabKey === "transactions" && (
                  <>
                    <option value="completed">Completed / Paid</option>
                    <option value="pending">Pending</option>
                  </>
                )}
                {tabKey === "activities" && (
                  <>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </>
                )}
                {tabKey === "campaigns" && (
                  <>
                    <option value="completed">Completed</option>
                    <option value="running">Running</option>
                  </>
                )}
              </select>
            </div>

            {/* Tab Specific Fields */}
            {tabKey === "leads" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Lead Source</label>
                    <select
                      value={draft.source || "all"}
                      onChange={(e) => handleChange("source", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Sources</option>
                      <option value="website">Website</option>
                      <option value="fb campaign">FB Campaign</option>
                      <option value="google ads">Google Ads</option>
                      <option value="referral">Referral</option>
                      <option value="cold call">Cold Call</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Lead Type</label>
                    <select
                      value={draft.lead_type || "all"}
                      onChange={(e) => handleChange("lead_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Types</option>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Priority</label>
                  <select
                    value={draft.priority || "all"}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </>
            )}

            {tabKey === "buyers" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Min Budget (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000000"
                      value={draft.budget_min || ""}
                      onChange={(e) => handleChange("budget_min", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Max Budget (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20000000"
                      value={draft.budget_max || ""}
                      onChange={(e) => handleChange("budget_max", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Preferred Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Aundh, Baner, Wakad"
                    value={draft.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  />
                </div>
              </>
            )}

            {tabKey === "sellers" && (
              <>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Property Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Aundh, Kharadi"
                    value={draft.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  />
                </div>
              </>
            )}

            {tabKey === "tenants" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Tenant Type</label>
                    <select
                      value={draft.tenant_type || "all"}
                      onChange={(e) => handleChange("tenant_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Types</option>
                      <option value="family">Family</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="company">Corporate / Company</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Preferred BHK</label>
                    <select
                      value={draft.preferred_bhk || "all"}
                      onChange={(e) => handleChange("preferred_bhk", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">Any BHK</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Preferred Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Hinjewadi, Wakad"
                    value={draft.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  />
                </div>
              </>
            )}

            {tabKey === "owners" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune"
                      value={draft.city || ""}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Aundh"
                      value={draft.location || ""}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {tabKey === "agent-execution" && (
              <>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Department</label>
                  <select
                    value={draft.department || "all"}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  >
                    <option value="all">All Departments</option>
                    <option value="Sales">Sales</option>
                    <option value="Presales">Presales</option>
                    <option value="Leasing">Leasing</option>
                  </select>
                </div>
              </>
            )}

            {tabKey === "properties" && (
              <>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Property Type</label>
                  <select
                    value={draft.property_type || "all"}
                    onChange={(e) => handleChange("property_type", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  >
                    <option value="all">All Property Types</option>
                    <option value="apartment">Apartment / Flat</option>
                    <option value="villa">Villa / House</option>
                    <option value="commercial">Commercial Space</option>
                    <option value="plot">Plot / Land</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Bedrooms (BHK)</label>
                  <select
                    value={draft.bedrooms || "all"}
                    onChange={(e) => handleChange("bedrooms", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  >
                    <option value="all">All BHKs</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>
              </>
            )}

            {tabKey === "transactions" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Min Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={draft.min_amount || ""}
                    onChange={(e) => handleChange("min_amount", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Max Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={draft.max_amount || ""}
                    onChange={(e) => handleChange("max_amount", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  />
                </div>
              </div>
            )}

            {tabKey === "activities" && (
              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">Activity Type</label>
                <select
                  value={draft.activity_type || "all"}
                  onChange={(e) => handleChange("activity_type", e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                >
                  <option value="all">All Activity Types</option>
                  <option value="call">Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="whatsapp">WhatsApp Message</option>
                  <option value="followup">Follow-up</option>
                </select>
              </div>
            )}

            {tabKey === "communication" && (
              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">Message Direction</label>
                <select
                  value={draft.direction || "all"}
                  onChange={(e) => handleChange("direction", e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                >
                  <option value="all">All Directions</option>
                  <option value="inbound">Inbound (Client Messages)</option>
                  <option value="outbound">Outbound (Agent Messages)</option>
                </select>
              </div>
            )}

            {/* Assigned Executive / User Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">Assigned Agent</label>
                <select
                  value={draft.assigned_executive || "all"}
                  onChange={(e) => handleChange("assigned_executive", e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                >
                  <option value="all">All Agents</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name ? `${u.first_name} ${u.last_name || ""}` : u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">Created By</label>
                <select
                  value={draft.created_by || "all"}
                  onChange={(e) => handleChange("created_by", e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                >
                  <option value="all">All Users</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name ? `${u.first_name} ${u.last_name || ""}` : u.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Sort Order</label>
              <select
                value={draft.sort_by || "newest"}
                onChange={(e) => handleChange("sort_by", e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
              >
                <option value="newest">Newest → Oldest</option>
                <option value="oldest">Oldest → Newest</option>
              </select>
            </div>

            {/* Ignore Date Checkbox */}
            <div className="bg-gray-100 p-3 rounded-lg flex items-center gap-2 border border-gray-200">
              <input
                type="checkbox"
                id="ignoreDate"
                checked={Boolean(draft.ignoreDate)}
                onChange={(e) => handleChange("ignoreDate", e.target.checked)}
                className="w-4 h-4 text-navy-600 rounded border-gray-300 focus:ring-navy-500"
              />
              <label htmlFor="ignoreDate" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Ignore Date Filter (Show All-Time Records)
              </label>
            </div>

            {/* Date Pickers */}
            {!draft.ignoreDate && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" /> From Date
                  </label>
                  <input
                    type="date"
                    value={draft.startDate || ""}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="w-full text-xs rounded-lg border-gray-300 shadow-sm p-2.5 border"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" /> To Date
                  </label>
                  <input
                    type="date"
                    value={draft.endDate || ""}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="w-full text-xs rounded-lg border-gray-300 shadow-sm p-2.5 border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar with ONLY 2 BUTTONS: Reset Filters & Apply Filters */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shadow-inner">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-xs text-gray-700 border-gray-300 bg-white hover:bg-gray-100 font-semibold"
            >
              Reset Filters
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-xs bg-[#0f1f38] hover:bg-[#1e3b8b] text-white font-bold shadow-md px-6"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
