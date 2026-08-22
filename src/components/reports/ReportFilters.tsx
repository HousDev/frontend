// frontend/src/components/reports/ReportFilters.tsx
import React, { useState } from "react";
import { Filter, Calendar, RotateCcw, Check, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ReportFilterParams } from "@/lib/reportAPI";

interface ReportFiltersProps {
  filters: ReportFilterParams;
  onApplyFilters: (newFilters: ReportFilterParams) => void;
  onResetFilters: () => void;
}

export const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7days" },
  { label: "This Month", value: "thismonth" },
  { label: "Last Month", value: "lastmonth" },
  { label: "This Quarter", value: "thisquarter" },
  { label: "This Year (YTD)", value: "thisyear" },
  { label: "All Time", value: "alltime" },
  { label: "Custom Range", value: "custom" },
];

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  // Temporary local state until "Apply Filters" is clicked
  const [draftFilters, setDraftFilters] = useState<ReportFilterParams>({ ...filters });
  const [showDrawer, setShowDrawer] = useState(false);

  const handleChange = (key: keyof ReportFilterParams, value: any) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
    setShowDrawer(false);
  };

  const handleReset = () => {
    const defaultParams = { datePreset: "thismonth" };
    setDraftFilters(defaultParams);
    onResetFilters();
    setShowDrawer(false);
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Desktop Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-orange-500" /> Date Preset:
          </span>
          {DATE_PRESETS.slice(0, 5).map((p) => {
            const isSelected = (draftFilters.datePreset || "thismonth") === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => handleChange("datePreset", p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-navy-900 text-white shadow-sm bg-[#1a2a6c]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDrawer(!showDrawer)}
            className="flex items-center gap-1.5 text-xs text-gray-700 border-gray-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            More Filters
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="flex items-center gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Filters
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showDrawer && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Preset</label>
            <select
              value={draftFilters.datePreset || "thismonth"}
              onChange={(e) => handleChange("datePreset", e.target.value)}
              className="w-full text-xs rounded-lg border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 p-2 border"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {draftFilters.datePreset === "custom" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={draftFilters.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full text-xs rounded-lg border-gray-300 shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={draftFilters.endDate || ""}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full text-xs rounded-lg border-gray-300 shadow-sm p-2 border"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Search Keywords</label>
            <input
              type="text"
              placeholder="Search name, phone, location..."
              value={draftFilters.search || ""}
              onChange={(e) => handleChange("search", e.target.value)}
              className="w-full text-xs rounded-lg border-gray-300 shadow-sm p-2 border"
            />
          </div>
        </div>
      )}
    </div>
  );
};
