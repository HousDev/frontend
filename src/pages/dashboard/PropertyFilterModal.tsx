import React, { useEffect } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";

interface PropertyFilters {
  type?: string;
  status?: string;
  priceRange?: string;
  location?: string;
  seller?: string;
  stage?: string;
  tags?: string;
  isPublic?: boolean;
  ignoreDate?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: string;
  minBudget?: string; // optional numeric string
  maxBudget?: string;
  /** ✅ NEW: filter by assigned executive id ("all" | "__unassigned__" | specific id as string) */
  assignedExecutive?: string;
}

interface PropertyFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PropertyFilters;
  setFilters: React.Dispatch<React.SetStateAction<PropertyFilters>>;
  clearFilters: () => void;

  typeOptions: Array<{ label: string; value: string }>;
  statusOptions: Array<{ label: string; value: string }>;
  priceRangeOptions: Array<{ label: string; value: string }>;
  locationOptions: Array<{ label: string; value: string }>;
  sellerOptions: Array<{ label: string; value: string }>;
  stageOptions: Array<{ label: string; value: string }>;
  tagsOptions: Array<{ label: string; value: string }>;

  /** ✅ NEW: pass executive options from parent */
  executiveOptions?: Array<{ label: string; value: string }>;
  /** ✅ Optional loading state for exec options (disables the dropdown) */
  executivesLoading?: boolean;
}

const sortOrderOptions = [
  { label: "Newest → Oldest", value: "created_desc" },
  { label: "Oldest → Newest", value: "created_asc" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

const PropertyFilterModal: React.FC<PropertyFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  clearFilters,
  typeOptions,
  statusOptions,
  priceRangeOptions,
  locationOptions,
  sellerOptions,
  stageOptions,
  tagsOptions,
  executiveOptions = [],
  executivesLoading = false,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // If ignoreDate toggled on, clear date fields
  useEffect(() => {
    if (filters?.ignoreDate && (filters.dateFrom || filters.dateTo)) {
      setFilters({ ...filters, dateFrom: "", dateTo: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.ignoreDate]);

  if (typeof window === "undefined") return null;

  const update = (patch: Partial<PropertyFilters>) =>
    setFilters({ ...(filters || {}), ...patch });

  // Build exec dropdown options (All, provided list, Unassigned)
  const execOptions = [
    { label: "All executives", value: "all" },
    ...(executiveOptions || []),
    { label: "Unassigned", value: "__unassigned__" },
  ];

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-gradient-to-b from-indigo-50 via-white to-purple-50 
        shadow-2xl w-full sm:w-[400px] transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <h3 className="text-sm font-semibold tracking-wide">Property Filters</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-56px)] text-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Property Type</label>
              <Dropdown
                options={[{ label: "All Types", value: "all" }, ...typeOptions]}
                value={filters.type ?? "all"}
                onChange={(v) => update({ type: v })}
                triggerClassName="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Status</label>
              <Dropdown
                options={[{ label: "All Status", value: "all" }, ...statusOptions]}
                value={filters.status ?? "all"}
                onChange={(v) => update({ status: v })}
                triggerClassName="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Price Range</label>
              <Dropdown
                options={[{ label: "Any", value: "all" }, ...priceRangeOptions]}
                value={filters.priceRange ?? "all"}
                onChange={(v) => update({ priceRange: v })}
                triggerClassName="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Location</label>
              <Dropdown
                options={[{ label: "All Locations", value: "all" }, ...locationOptions]}
                value={filters.location ?? "all"}
                onChange={(v) => update({ location: v })}
                triggerClassName="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Seller / Owner</label>
              <Dropdown
                options={[{ label: "Any Seller", value: "all" }, ...sellerOptions]}
                value={filters.seller ?? "all"}
                onChange={(v) => update({ seller: v })}
                triggerClassName="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Stage</label>
              <Dropdown
                options={[{ label: "All Stages", value: "all" }, ...stageOptions]}
                value={filters.stage ?? "all"}
                onChange={(v) => update({ stage: v })}
                triggerClassName="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Tags</label>
              <Dropdown
                options={[{ label: "Any Tag", value: "all" }, ...tagsOptions]}
                value={filters.tags ?? "all"}
                onChange={(v) => update({ tags: v })}
                triggerClassName="w-full text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Visibility</label>
              <Dropdown
                options={[
                  { label: "All", value: "all" },
                  { label: "Public", value: "public" },
                  { label: "Private", value: "private" },
                ]}
                value={
                  filters.isPublic === undefined
                    ? "all"
                    : filters.isPublic
                    ? "public"
                    : "private"
                }
                onChange={(v) => {
                  if (v === "all") update({ isPublic: undefined });
                  else update({ isPublic: v === "public" });
                }}
                triggerClassName="w-full text-xs"
              />
            </div>

            {/* Budget quick inputs */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Min Budget (₹)</label>
              <Input
                type="number"
                value={filters.minBudget || ""}
                onChange={(e) => update({ minBudget: e.target.value })}
                placeholder="e.g. 500000"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Max Budget (₹)</label>
              <Input
                type="number"
                value={filters.maxBudget || ""}
                onChange={(e) => update({ maxBudget: e.target.value })}
                placeholder="e.g. 25000000"
              />
            </div>

            {/* ✅ Executive filter */}
            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Executive</label>
              <Dropdown
                options={execOptions}
                value={filters.assignedExecutive ?? "all"}
                onChange={(v) => update({ assignedExecutive: v })}
                triggerClassName="w-full text-xs"
                disabled={executivesLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Sort</label>
              <Dropdown
                options={sortOrderOptions}
                value={filters.sortOrder ?? "created_desc"}
                onChange={(v) => update({ sortOrder: v })}
                triggerClassName="w-full text-xs"
              />
            </div>
          </div>

          {/* Ignore Date */}
          <div className="flex items-center gap-2 mt-2">
            <input
              id="propIgnoreDate"
              type="checkbox"
              checked={!!filters.ignoreDate}
              onChange={(e) => update({ ignoreDate: e.target.checked })}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="propIgnoreDate" className="text-gray-700">
              Ignore Date Filters
            </label>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => update({ dateFrom: e.target.value })}
                disabled={!!filters.ignoreDate}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">To Date</label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => update({ dateTo: e.target.value })}
                disabled={!!filters.ignoreDate}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                clearFilters();
                setFilters({
                  type: "all",
                  status: "all",
                  priceRange: "all",
                  location: "all",
                  seller: "all",
                  stage: "all",
                  tags: "all",
                  isPublic: undefined,
                  ignoreDate: false,
                  dateFrom: "",
                  dateTo: "",
                  sortOrder: "created_desc",
                  minBudget: "",
                  maxBudget: "",
                  assignedExecutive: "all", // ✅ reset
                });
              }}
              className="flex-1 text-xs border-red-400 text-red-500 hover:bg-red-50"
            >
              Clear All
            </Button>

            <Button
              onClick={onClose}
              className="flex-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default PropertyFilterModal;
