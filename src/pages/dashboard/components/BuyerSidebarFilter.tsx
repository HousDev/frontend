import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type FiltersState = {
  dateFrom: string;
  dateTo: string;
  ignoreDate: boolean;
  source: string;
  stage: string;
  priority: string;
  assigned?: string;
  status?: string;
  budgetRange: string;
  propertyType: string;
  
};

type OptionList = string[];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FiltersState;
  // Proper setter type for React useState
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  resetFilters: () => void;
  sources: OptionList;
  stages: OptionList;
  priorities: OptionList;
  budgetRanges: OptionList;
  propertyTypes: OptionList;
}

/**
 * BuyerSidebarFilter
 * - Renders as a portal (document.body) to avoid stacking-context issues
 * - High z-index (z-50 / z-40) so it stays above sticky headers
 * - Prevents background scroll while open
 * - Accessible (aria labels) + Escape to close
 */
const BuyerSidebarFilter: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  resetFilters,
  sources,
  stages,
  priorities,
  budgetRanges,
  propertyTypes,
}) => {
  // SSR guard
  if (typeof window === "undefined") return null;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Prevent background scroll while sidebar is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // If Ignore Date turned on, clear date fields (safe functional update)
  useEffect(() => {
    if (filters?.ignoreDate && (filters.dateFrom || filters.dateTo)) {
      setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
    }
  }, [filters?.ignoreDate, setFilters]);

  // local handlers
  const onChange = (key: keyof FiltersState, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyAndClose = () => {
    // parent already holds filters in state; close sidebar
    onClose();
  };

  return createPortal(
    <>
      {/* Overlay (z-40) */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? "opacity-100 pointer-events-auto z-40" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sidebar (z-50) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="buyer-filter-title"
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-gradient-to-b from-indigo-50 via-white to-purple-50 shadow-2xl transform transition-transform duration-300 ease-out z-50
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <h3 id="buyer-filter-title" className="text-sm font-semibold tracking-wide">Filters</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { resetFilters(); }}
              className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              aria-label="Close filters"
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-56px)] text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
           

            {/* Source */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => onChange("source", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              >
                {sources.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All" : s}</option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => onChange("stage", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              >
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => onChange("priority", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
              <select
                value={filters.budgetRange}
                onChange={(e) => onChange("budgetRange", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              >
                {budgetRanges.map((b) => (
                  <option key={b} value={b}>{b === "all" ? "All" : b}</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => onChange("propertyType", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              >
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>{t === "all" ? "All" : t}</option>
                ))}
              </select>
            </div>
             {/* From Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onChange("dateFrom", e.target.value)}
                disabled={filters.ignoreDate}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onChange("dateTo", e.target.value)}
                disabled={filters.ignoreDate}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          {/* Ignore Date and actions */}
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={!!filters.ignoreDate}
                onChange={(e) => onChange("ignoreDate", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-gray-700">Ignore Date</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => { resetFilters(); }}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                aria-label="Reset filters"
              >
                Reset
              </button>
              <button
                onClick={applyAndClose}
                className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                aria-label="Apply filters"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default BuyerSidebarFilter;
