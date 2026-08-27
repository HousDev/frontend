// frontend/src/components/reports/SmartFilterDrawer.tsx
import React, { useState, useEffect } from "react";
import { Filter, X, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import { usersAPI } from "@/lib/api";

export interface SmartFilterParams {
  status?: string;
  stage?: string;
  source?: string;
  lead_type?: string;
  priority?: string;
  assigned_executive?: string;
  assignment_status?: string;
  created_by?: string;
  state?: string;
  city?: string;
  location?: string;
  transferred_to_buyer?: string;
  transferred_to_seller?: string;
  dateBy?: string;
  followupStatus?: string;
  activityStatus?: string;
  sort_by?: string;
  ignoreDate?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  property_type?: string;
  unit_type?: string;
  bedrooms?: string;
  activity_type?: string;
  direction?: string;
  department?: string;
  efficiencyRating?: string;
  budget_min?: string;
  budget_max?: string;
  minDealValue?: string;
  maxDealValue?: string;
  minLeadScore?: string;
  maxLeadScore?: string;
  documentStatus?: string;
  aging_range?: string;
  tenant_type?: string;
  preferred_bhk?: string;
  min_amount?: string;
  max_amount?: string;
  campaign_type?: string;
  loan_required?: string;
  has_visit?: string;
  has_match?: string;
  outcome?: string;
  active_status?: string;
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
                    <option value="new">New / Fresh</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified / Interested</option>
                    <option value="unqualified">Unqualified / Lost</option>
                    <option value="buyer_transferred">Transferred to Buyer</option>
                    <option value="seller_transferred">Transferred to Seller</option>
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
                    <option value="qualified">Qualified / Interested</option>
                    <option value="pending">Pending / Scheduled</option>
                    <option value="overdue">Overdue Actions</option>
                    <option value="unqualified">Not Interested</option>
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

            {/* Universal Custom Date Range Filter for All Tabs */}
            <div className="space-y-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-semibold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  Custom Date Range Filter
                </div>
                {(!draft.ignoreDate && (draft.startDate || draft.endDate)) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("ignoreDate", true);
                      handleChange("startDate", "");
                      handleChange("endDate", "");
                    }}
                    className="text-[10px] text-red-600 hover:underline font-medium"
                  >
                    Reset Dates (All Time)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={draft.startDate || ""}
                    onChange={(e) => {
                      handleChange("startDate", e.target.value);
                      handleChange("ignoreDate", false);
                    }}
                    className="w-full rounded-md border-gray-300 p-2 border text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={draft.endDate || ""}
                    onChange={(e) => {
                      handleChange("endDate", e.target.value);
                      handleChange("ignoreDate", false);
                    }}
                    className="w-full rounded-md border-gray-300 p-2 border text-xs bg-white"
                  />
                </div>
              </div>
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
                      <option value="whatsapp">WhatsApp</option>
                      <option value="fb campaign">FB Campaign / Meta Ads</option>
                      <option value="google ads">Google Ads</option>
                      <option value="referral">Referral</option>
                      <option value="cold call">Cold Call</option>
                      <option value="excel import">Excel / CSV Import</option>
                      <option value="manual entry">Manual Entry</option>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Assigned Executive</label>
                    <select
                      value={draft.assigned_executive || "all"}
                      onChange={(e) => handleChange("assigned_executive", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Executives</option>
                      <option value="Unassigned">Unassigned Only</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name ? `${u.first_name} ${u.last_name || ""}`.trim() : u.email || `User #${u.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Assignment Status</label>
                    <select
                      value={draft.assignment_status || "all"}
                      onChange={(e) => handleChange("assignment_status", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Leads</option>
                      <option value="assigned">Assigned Leads</option>
                      <option value="unassigned">Unassigned Leads</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Priority</label>
                    <select
                      value={draft.priority || "all"}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium / Normal</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Stage</label>
                    <select
                      value={draft.stage || "all"}
                      onChange={(e) => handleChange("stage", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Stages</option>
                      <option value="new">New Stage</option>
                      <option value="contacted">Contacted Stage</option>
                      <option value="qualified">Qualified Stage</option>
                      <option value="proposal">Proposal Stage</option>
                      <option value="negotiation">Negotiation Stage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Buyer Transfer</label>
                    <select
                      value={draft.transferred_to_buyer || "all"}
                      onChange={(e) => handleChange("transferred_to_buyer", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Leads</option>
                      <option value="transferred">Transferred to Buyer</option>
                      <option value="not_transferred">Not Transferred</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Seller Transfer</label>
                    <select
                      value={draft.transferred_to_seller || "all"}
                      onChange={(e) => handleChange("transferred_to_seller", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Leads</option>
                      <option value="transferred">Transferred to Seller</option>
                      <option value="not_transferred">Not Transferred</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Mumbai"
                      value={draft.city || ""}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2 border text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Baner, Wakad"
                      value={draft.location || ""}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2 border text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Follow-up Filter</label>
                    <select
                      value={draft.followupStatus || "all"}
                      onChange={(e) => handleChange("followupStatus", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Follow-ups</option>
                      <option value="today">Follow-up Today</option>
                      <option value="overdue">Overdue Follow-ups</option>
                      <option value="upcoming">Upcoming Follow-ups</option>
                      <option value="no_followup">No Follow-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Activity Filter</label>
                    <select
                      value={draft.activityStatus || "all"}
                      onChange={(e) => handleChange("activityStatus", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Activity</option>
                      <option value="inactive_7days">Inactive 7+ Days</option>
                      <option value="active_24h">Active in last 24h</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {tabKey === "buyers" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Buyer Stage</label>
                    <select
                      value={draft.stage || "all"}
                      onChange={(e) => handleChange("stage", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Stages</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Property Shortlisted">Property Shortlisted</option>
                      <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed/Won">Closed / Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Buyer Priority</label>
                    <select
                      value={draft.priority || "all"}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Priorities</option>
                      <option value="High">High / Hot</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Buyer Status</label>
                    <select
                      value={draft.status || "all"}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Closed / Converted</option>
                      <option value="lost">Lost / Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Buyer Outcome</label>
                    <select
                      value={draft.outcome || "all"}
                      onChange={(e) => handleChange("outcome", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Outcomes</option>
                      <option value="active">Active</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed">Closed / Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Assigned Executive</label>
                    <select
                      value={draft.assigned_executive || "all"}
                      onChange={(e) => handleChange("assigned_executive", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Executives</option>
                      {usersList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.first_name || u.name} {u.last_name || ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Active Status</label>
                    <select
                      value={draft.active_status || "all"}
                      onChange={(e) => handleChange("active_status", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Property Type</label>
                    <select
                      value={draft.property_type || "all"}
                      onChange={(e) => handleChange("property_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Property Types</option>
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Villa">Villa / House</option>
                      <option value="Plot">Plot / Land</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Penthouse">Penthouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">BHK / Unit Type</label>
                    <select
                      value={draft.unit_type || "all"}
                      onChange={(e) => handleChange("unit_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All BHK Types</option>
                      <option value="1BHK">1 BHK</option>
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="4BHK">4 BHK / 4+ BHK</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                    </select>
                  </div>
                </div>

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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Loan Required</label>
                    <select
                      value={draft.loan_required || "all"}
                      onChange={(e) => handleChange("loan_required", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All</option>
                      <option value="yes">Yes — Loan Needed</option>
                      <option value="no">No — Self Funded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Site Visit Status</label>
                    <select
                      value={draft.has_visit || "all"}
                      onChange={(e) => handleChange("has_visit", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All</option>
                      <option value="yes">Has Site Visit(s)</option>
                      <option value="no">No Site Visit Yet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Property Matching</label>
                    <select
                      value={draft.has_match || "all"}
                      onChange={(e) => handleChange("has_match", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All</option>
                      <option value="yes">Has Saved/Matched Props</option>
                      <option value="no">No Saved/Matched Props</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Location / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Whitefield, Indiranagar"
                      value={draft.location || ""}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {tabKey === "sellers" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Seller Stage</label>
                    <select
                      value={draft.stage || "all"}
                      onChange={(e) => handleChange("stage", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Stages</option>
                      <option value="New">New Lead</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Listed">Property Listed</option>
                      <option value="Buyer Interest">Buyer Interest</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Agreement">Agreement Signed</option>
                      <option value="Closed">Closed / Transacted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Priority</label>
                    <select
                      value={draft.priority || "all"}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High / Hot</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Lead Source</label>
                    <select
                      value={draft.source || "all"}
                      onChange={(e) => handleChange("source", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Sources</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Portal">Property Portal</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Direct">Direct Contact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Property Type</label>
                    <select
                      value={draft.property_type || "all"}
                      onChange={(e) => handleChange("property_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Property Types</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK">4+ BHK</option>
                      <option value="Villa">Villa / Rowhouse</option>
                      <option value="Plot">Plot / Land</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Property Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Aundh, Kharadi, Baner"
                    value={draft.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Min Deal Value (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2000000"
                      value={draft.minDealValue || ""}
                      onChange={(e) => handleChange("minDealValue", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Max Deal Value (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20000000"
                      value={draft.maxDealValue || ""}
                      onChange={(e) => handleChange("maxDealValue", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Follow-up Status</label>
                    <select
                      value={draft.followupStatus || "all"}
                      onChange={(e) => handleChange("followupStatus", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Followups</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                      <option value="missed">Missed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Document Status</label>
                    <select
                      value={draft.documentStatus || "all"}
                      onChange={(e) => handleChange("documentStatus", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Document Statuses</option>
                      <option value="verified">Verified Documents</option>
                      <option value="pending">Pending Documents</option>
                      <option value="rejected">Rejected Documents</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Listing Aging</label>
                  <select
                    value={draft.aging_range || "all"}
                    onChange={(e) => handleChange("aging_range", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  >
                    <option value="all">All Aging Periods</option>
                    <option value="0_7">0 – 7 days</option>
                    <option value="8_15">8 – 15 days</option>
                    <option value="16_30">16 – 30 days</option>
                    <option value="31_60">31 – 60 days</option>
                    <option value="60_plus">60+ days</option>
                  </select>
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
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Payment Status</label>
                    <select
                      value={draft.status || "all"}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="cleared">Cleared</option>
                      <option value="received">Received</option>
                      <option value="pending">Pending</option>
                      <option value="bounced">Bounced</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Transaction Type</label>
                    <select
                      value={draft.property_type || "all"}
                      onChange={(e) => handleChange("property_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Transaction Types</option>
                      <option value="sale">Sale</option>
                      <option value="resale">Resale</option>
                      <option value="rent">Rent / Service Fee</option>
                      <option value="token">Token Advance</option>
                      <option value="commission">Commission</option>
                      <option value="advance">Advance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Related Party</label>
                    <select
                      value={draft.lead_type || "all"}
                      onChange={(e) => handleChange("lead_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Parties</option>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Payment Method</label>
                    <select
                      value={draft.direction || "all"}
                      onChange={(e) => handleChange("direction", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Payment Methods</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="neft_rtgs">NEFT / RTGS</option>
                      <option value="upi">UPI</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                </div>

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
              </>
            )}

            {tabKey === "activities" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Activity Type</label>
                    <select
                      value={draft.activity_type || "all"}
                      onChange={(e) => handleChange("activity_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs focus:ring-navy-500 focus:border-navy-500"
                    >
                      <option value="all">All Activity Types</option>
                      <option value="call">📞 Phone Call</option>
                      <option value="meeting">🤝 Visit / Meeting</option>
                      <option value="whatsapp">💬 WhatsApp Message</option>
                      <option value="followup">📝 Follow-up Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Department</label>
                    <select
                      value={draft.department || "all"}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs focus:ring-navy-500 focus:border-navy-500"
                    >
                      <option value="all">All Departments</option>
                      <option value="Sales">Sales</option>
                      <option value="Presales">Presales</option>
                      <option value="Leasing">Leasing</option>
                      <option value="Development">Admin / Dev</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Lead Category Type</label>
                  <select
                    value={draft.lead_type || "all"}
                    onChange={(e) => handleChange("lead_type", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs focus:ring-navy-500 focus:border-navy-500"
                  >
                    <option value="all">All Lead Categories</option>
                    <option value="client">📋 Client / General Leads</option>
                    <option value="buyer">🛒 Buyer Leads</option>
                    <option value="seller">🏠 Seller Leads</option>
                    <option value="owner">🔑 Owner Leads</option>
                    <option value="tenant">👤 Tenant Leads</option>
                  </select>
                </div>
              </>
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

            {tabKey === "campaigns" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Audience Mode</label>
                    <select
                      value={draft.audience_mode || "all"}
                      onChange={(e) => handleChange("audience_mode", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Audience Modes</option>
                      <option value="segment">Segment Dynamic Filters</option>
                      <option value="upload">Uploaded File Contacts</option>
                      <option value="manual">Manual Selection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1.5">Template Category</label>
                    <select
                      value={draft.campaign_type || "all"}
                      onChange={(e) => handleChange("campaign_type", e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                    >
                      <option value="all">All Categories</option>
                      <option value="MARKETING">Marketing (₹0.68)</option>
                      <option value="UTILITY">Utility (₹0.35)</option>
                      <option value="AUTHENTICATION">Authentication (₹0.35)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1.5">Min Sent Messages</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={draft.min_amount || ""}
                    onChange={(e) => handleChange("min_amount", e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border text-xs"
                  />
                </div>
              </>
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
