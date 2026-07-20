import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, SlidersHorizontal, Calendar, RotateCcw, Filter, Check } from "lucide-react";

export interface DashboardFiltersState {
  dateFrom: string;
  dateTo: string;
  ignoreDate: boolean;
  status: string;
  source: string;
  priority: string;
  assignedExecutive: string;
  sortOrder: "desc" | "asc";
}

interface DashboardFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DashboardFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFiltersState>>;
  clearFilters: () => void;
  allUsers?: any[];
}

const NAVY = "#0c3854";
const ORANGE = "#e87722";
const BORDER_COLOR = "#e2e8f0";

export const DashboardFilterModal: React.FC<DashboardFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  clearFilters,
  allUsers = [],
}) => {
  const [draft, setDraft] = useState<DashboardFiltersState>({ ...filters });

  // Sync draft when opened
  useEffect(() => {
    if (isOpen) setDraft({ ...filters });
  }, [isOpen, filters]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Reset dates if ignoreDate is checked
  useEffect(() => {
    if (draft.ignoreDate && (draft.dateFrom || draft.dateTo)) {
      setDraft((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
    }
  }, [draft.ignoreDate]);

  const handleApply = () => {
    setFilters(draft);
    onClose();
  };

  const handleClear = () => {
    clearFilters();
    setDraft({
      dateFrom: "",
      dateTo: "",
      ignoreDate: false,
      status: "all",
      source: "all",
      priority: "all",
      assignedExecutive: "all",
      sortOrder: "desc",
    });
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(12,56,84,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Right Slide-over Drawer (Same as LeadsPage FilterModal) */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-[290px] sm:w-[380px] bg-slate-50 border-l border-slate-200 shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
          style={{ background: NAVY, borderBottom: `1px solid ${BORDER_COLOR}` }}
        >
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-orange-400" />
            <span>Filter Dashboard Data</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* 1. Date Range Section */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c3854] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500" /> Date Range
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={draft.ignoreDate}
                  onChange={(e) => setDraft((p) => ({ ...p, ignoreDate: e.target.checked }))}
                  className="rounded border-slate-300 accent-orange-500 text-orange-500"
                />
                Ignore Date
              </label>
            </div>

            {!draft.ignoreDate && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">From Date</span>
                  <input
                    type="date"
                    value={draft.dateFrom}
                    onChange={(e) => setDraft((p) => ({ ...p, dateFrom: e.target.value }))}
                    className="w-full mt-0.5 p-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">To Date</span>
                  <input
                    type="date"
                    value={draft.dateTo}
                    onChange={(e) => setDraft((p) => ({ ...p, dateTo: e.target.value }))}
                    className="w-full mt-0.5 p-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Status Select */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c3854]">
              Status Filter
            </label>
            <select
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
              className="w-full p-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">New / Fresh</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="site_visit">Site Visit Scheduled</option>
              <option value="converted">Converted / Won</option>
              <option value="available">Available (Property)</option>
              <option value="sold">Sold (Property)</option>
              <option value="active">Active (Seller/Buyer)</option>
            </select>
          </div>

          {/* 3. Lead Source Select */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c3854]">
              Lead Source / Portal
            </label>
            <select
              value={draft.source}
              onChange={(e) => setDraft((p) => ({ ...p, source: e.target.value }))}
              className="w-full p-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="magicbricks">MagicBricks</option>
              <option value="housing">Housing.com</option>
              <option value="meta">Meta / FB Ads</option>
              <option value="referral">Client Referral</option>
              <option value="direct">Direct Call</option>
            </select>
          </div>

          {/* 4. Priority Select */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c3854]">
              Priority Level
            </label>
            <select
              value={draft.priority}
              onChange={(e) => setDraft((p) => ({ ...p, priority: e.target.value }))}
              className="w-full p-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* 5. Assigned Executive (if team options provided) */}
          {allUsers.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c3854]">
                Assigned Executive
              </label>
              <select
                value={draft.assignedExecutive}
                onChange={(e) => setDraft((p) => ({ ...p, assignedExecutive: e.target.value }))}
                className="w-full p-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">All Executives</option>
                {allUsers.map((u: any) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.first_name ? `${u.first_name} ${u.last_name || ""}` : u.username || `User ${u.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Sort Order */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#0c3854]">
              Sort Order
            </label>
            <select
              value={draft.sortOrder}
              onChange={(e) => setDraft((p) => ({ ...p, sortOrder: e.target.value as any }))}
              className="w-full p-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="desc">Newest → Oldest</option>
              <option value="asc">Oldest → Newest</option>
            </select>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div
          className="p-3.5 flex items-center justify-between gap-2 border-t border-slate-200 bg-white"
        >
          <button
            onClick={handleClear}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear All
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Apply Filters
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default DashboardFilterModal;
