// src/pages/dashboard/RentalPropertyFilterModal.tsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Filter, X, Calendar, ChevronDown, SlidersHorizontal, RefreshCw
} from "lucide-react";

export interface RentalPropertyFilters {
  type?: string;
  subtype?: string;
  city?: string;
  location?: string;
  society?: string;
  seller?: string;
  assignedExecutive?: string;
  status?: string;
  furnishing?: string;
  bedrooms?: string;
  preferredTenants?: string;
  minRent?: string;
  maxRent?: string;
  minDeposit?: string;
  maxDeposit?: string;
  dateFrom?: string;
  dateTo?: string;
  ignoreDate?: boolean;
  sortOrder?: string;
  isPublic?: string;
}

interface DropdownItem {
  label: string;
  value: string;
}

interface RentalPropertyFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: RentalPropertyFilters;
  setFilters: React.Dispatch<React.SetStateAction<RentalPropertyFilters>>;
  clearFilters: () => void;
  typeOptions: DropdownItem[];
  subtypeOptions?: DropdownItem[];
  cityOptions?: DropdownItem[];
  locationOptions: DropdownItem[];
  societyOptions?: DropdownItem[];
  sellerOptions: DropdownItem[];
  executiveOptions?: DropdownItem[];
  statusOptions?: DropdownItem[];
  furnishingOptions?: DropdownItem[];
  bedroomsOptions?: DropdownItem[];
  activeFilterCount?: number;
}

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

const sortOrderOptions = [
  { label: "Newest → Oldest", value: "created_desc" },
  { label: "Oldest → Newest", value: "created_asc" },
  { label: "Rent: Low → High", value: "price_asc" },
  { label: "Rent: High → Low", value: "price_desc" },
  { label: "Deposit: Low → High", value: "deposit_asc" },
  { label: "Deposit: High → Low", value: "deposit_desc" },
];

const visibilityOptions = [
  { label: "All Listings", value: "all" },
  { label: "Public Only", value: "public" },
  { label: "Private Only", value: "private" },
];

const EMPTY_FILTERS: RentalPropertyFilters = {
  type: "all",
  subtype: "all",
  city: "all",
  location: "all",
  society: "all",
  seller: "all",
  assignedExecutive: "all",
  status: "all",
  furnishing: "all",
  bedrooms: "all",
  preferredTenants: "all",
  minRent: "",
  maxRent: "",
  minDeposit: "",
  maxDeposit: "",
  dateFrom: "",
  dateTo: "",
  ignoreDate: false,
  sortOrder: "created_desc",
  isPublic: "all",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputClass =
  "w-full h-8 px-2.5 rounded-lg text-xs border border-slate-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-400/40 focus:border-orange-400 transition-all font-semibold text-slate-700 appearance-none";

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
    {icon && <span className="text-orange-500">{icon}</span>}
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">{title}</span>
  </div>
);

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: DropdownItem[];
  allLabel?: string;
}) => (
  <div className="relative">
    <label style={labelStyle}>{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="all">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
    </div>
  </div>
);

const FilterInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) =>
        onChange(type === "number" ? e.target.value.replace(/\D/g, "") : e.target.value)
      }
      className={inputClass}
    />
  </div>
);

const RentalPropertyFilterModal: React.FC<RentalPropertyFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  clearFilters,
  typeOptions,
  subtypeOptions = [],
  cityOptions = [],
  locationOptions,
  societyOptions = [],
  sellerOptions,
  executiveOptions = [],
  statusOptions = [],
  furnishingOptions = [],
  bedroomsOptions = [],
}) => {
  const [draft, setDraft] = useState<RentalPropertyFilters>({ ...EMPTY_FILTERS, ...filters });

  useEffect(() => {
    if (isOpen) setDraft({ ...EMPTY_FILTERS, ...filters });
  }, [isOpen, filters]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (typeof window === "undefined") return null;

  const set = (key: keyof RentalPropertyFilters, val: any) =>
    setDraft((prev) => ({ ...prev, [key]: val }));

  const handleApply = () => {
    setFilters(draft);
    onClose();
  };

  const handleClear = () => {
    clearFilters();
    setFilters(EMPTY_FILTERS);
    setDraft(EMPTY_FILTERS);
  };

  // Count active filters (excluding defaults)
  const activeCount = Object.entries(draft).filter(([k, v]) => {
    if (k === "sortOrder") return false;
    if (k === "ignoreDate") return false;
    if (v === "all" || v === "" || v === undefined) return false;
    return true;
  }).length;

  const execOptions = [
    { label: "Unassigned", value: "__unassigned__" },
    ...(executiveOptions || []),
  ];

  const defaultStatusOptions = statusOptions.length > 0
    ? statusOptions
    : [
      { label: "Available", value: "Available" },
      { label: "Leased", value: "Leased" },
      { label: "Under Negotiation", value: "Under Negotiation" },
      { label: "On Hold", value: "On Hold" },
    ];

  const defaultBedroomsOptions = bedroomsOptions.length > 0
    ? bedroomsOptions
    : ["1", "2", "3", "4", "5", "6"].map(n => ({ label: `${n} BHK`, value: n }));

  const preferredTenantsOptions = [
    { label: "Family", value: "Family" },
    { label: "Bachelors", value: "Bachelors" },
    { label: "Company", value: "Company" },
    { label: "Any", value: "Any" },
  ];

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(15,43,61,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col transform transition-transform duration-300 ease-out w-[300px] sm:w-[420px] bg-slate-50 shadow-[-4px_0_32px_rgba(15,43,61,0.18)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full w-full">

          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: N, borderBottom: `1px solid ${BD}` }}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} color={O} />
              <h3 className="text-sm font-bold text-white tracking-wide">Advanced Filters</h3>
              {activeCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white"
                  style={{ background: O }}
                >
                  {activeCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={11} /> Clear
              </button>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={13} className="text-white" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: "thin" }}>

            {/* ─── Property Details ─── */}
            <div>
              <SectionHeader title="Property Details" icon={<Filter size={11} />} />
              <div className="grid grid-cols-2 gap-3">
                <FilterSelect
                  label="Property Type"
                  value={draft.type ?? "all"}
                  onChange={(v) => set("type", v)}
                  options={typeOptions}
                  allLabel="All Types"
                />
                <FilterSelect
                  label="Subtype"
                  value={draft.subtype ?? "all"}
                  onChange={(v) => set("subtype", v)}
                  options={subtypeOptions}
                  allLabel="All Subtypes"
                />
                <FilterSelect
                  label="Furnishing"
                  value={draft.furnishing ?? "all"}
                  onChange={(v) => set("furnishing", v)}
                  options={furnishingOptions.length > 0
                    ? furnishingOptions
                    : [
                      { label: "Fully Furnished", value: "Fully Furnished" },
                      { label: "Semi-Furnished", value: "Semi-Furnished" },
                      { label: "Unfurnished", value: "Unfurnished" },
                    ]
                  }
                  allLabel="Any Furnishing"
                />
                <FilterSelect
                  label="Bedrooms"
                  value={draft.bedrooms ?? "all"}
                  onChange={(v) => set("bedrooms", v)}
                  options={defaultBedroomsOptions}
                  allLabel="Any BHK"
                />
              </div>
            </div>

            {/* ─── Location ─── */}
            <div>
              <SectionHeader title="Location" icon={<Filter size={11} />} />
              <div className="grid grid-cols-2 gap-3">
                <FilterSelect
                  label="City"
                  value={draft.city ?? "all"}
                  onChange={(v) => set("city", v)}
                  options={cityOptions}
                  allLabel="All Cities"
                />
                <FilterSelect
                  label="Location / Area"
                  value={draft.location ?? "all"}
                  onChange={(v) => set("location", v)}
                  options={locationOptions}
                  allLabel="All Locations"
                />
                <div className="col-span-2">
                  <FilterSelect
                    label="Society / Project"
                    value={draft.society ?? "all"}
                    onChange={(v) => set("society", v)}
                    options={societyOptions}
                    allLabel="All Societies"
                  />
                </div>
              </div>
            </div>

            {/* ─── Rent & Deposit ─── */}
            <div>
              <SectionHeader title="Rent & Deposit (₹)" icon={<Filter size={11} />} />
              <div className="grid grid-cols-2 gap-3">
                <FilterInput
                  label="Min Monthly Rent"
                  value={draft.minRent ?? ""}
                  onChange={(v) => set("minRent", v)}
                  placeholder="e.g. 10000"
                  type="number"
                />
                <FilterInput
                  label="Max Monthly Rent"
                  value={draft.maxRent ?? ""}
                  onChange={(v) => set("maxRent", v)}
                  placeholder="e.g. 50000"
                  type="number"
                />
                <FilterInput
                  label="Min Security Deposit"
                  value={draft.minDeposit ?? ""}
                  onChange={(v) => set("minDeposit", v)}
                  placeholder="e.g. 25000"
                  type="number"
                />
                <FilterInput
                  label="Max Security Deposit"
                  value={draft.maxDeposit ?? ""}
                  onChange={(v) => set("maxDeposit", v)}
                  placeholder="e.g. 100000"
                  type="number"
                />
              </div>
            </div>

            {/* ─── Tenant & Status ─── */}
            <div>
              <SectionHeader title="Tenant & Status" icon={<Filter size={11} />} />
              <div className="grid grid-cols-2 gap-3">
                <FilterSelect
                  label="Status"
                  value={draft.status ?? "all"}
                  onChange={(v) => set("status", v)}
                  options={defaultStatusOptions}
                  allLabel="All Status"
                />
                <FilterSelect
                  label="Preferred Tenants"
                  value={draft.preferredTenants ?? "all"}
                  onChange={(v) => set("preferredTenants", v)}
                  options={preferredTenantsOptions}
                  allLabel="Any Tenants"
                />
                <FilterSelect
                  label="Visibility"
                  value={draft.isPublic ?? "all"}
                  onChange={(v) => set("isPublic", v)}
                  options={visibilityOptions}
                  allLabel="All Listings"
                />
              </div>
            </div>

            {/* ─── Ownership & Assignment ─── */}
            <div>
              <SectionHeader title="Ownership & Assignment" icon={<Filter size={11} />} />
              <div className="grid grid-cols-1 gap-3">
                <FilterSelect
                  label="Owner / Landlord"
                  value={draft.seller ?? "all"}
                  onChange={(v) => set("seller", v)}
                  options={sellerOptions}
                  allLabel="Any Owner"
                />
                <FilterSelect
                  label="Assigned Executive"
                  value={draft.assignedExecutive ?? "all"}
                  onChange={(v) => set("assignedExecutive", v)}
                  options={execOptions}
                  allLabel="All Executives"
                />
              </div>
            </div>

            {/* ─── Sort ─── */}
            <div>
              <SectionHeader title="Sort" icon={<Filter size={11} />} />
              <FilterSelect
                label="Sort By"
                value={draft.sortOrder ?? "created_desc"}
                onChange={(v) => set("sortOrder", v)}
                options={sortOrderOptions}
                allLabel="Default"
              />
            </div>

            {/* ─── Publication Date ─── */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar size={11} color={O} /> Date Range
                </label>
                <label className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!draft.ignoreDate}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        ignoreDate: e.target.checked,
                        dateFrom: "",
                        dateTo: "",
                      }))
                    }
                    className="accent-orange-500 rounded"
                  />
                  Ignore Date
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 block mb-1">From</span>
                  <input
                    type="date"
                    disabled={draft.ignoreDate}
                    value={draft.dateFrom || ""}
                    onChange={(e) => set("dateFrom", e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-600 disabled:opacity-40 disabled:bg-slate-100 focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-slate-400 block mb-1">To</span>
                  <input
                    type="date"
                    disabled={draft.ignoreDate}
                    value={draft.dateTo || ""}
                    onChange={(e) => set("dateTo", e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-600 disabled:opacity-40 disabled:bg-slate-100 focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center gap-2 flex-shrink-0">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={12} /> Clear All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-5 py-2 text-xs font-bold rounded-lg text-white transition-opacity hover:opacity-95 flex items-center justify-center gap-1.5"
              style={{ background: O }}
            >
              <Filter size={12} />
              Apply Filters
              {activeCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded-full text-[9px] font-extrabold">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default RentalPropertyFilterModal;
