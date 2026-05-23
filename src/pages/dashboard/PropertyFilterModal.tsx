// import React, { useEffect } from "react";
// import { X } from "lucide-react";
// import { createPortal } from "react-dom";
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";
// import Dropdown from "@/components/ui/Dropdown";

// interface PropertyFilters {
//   type?: string;
//   status?: string;
//   priceRange?: string;
//   location?: string;
//   seller?: string;
//   stage?: string;
//   tags?: string;
//   isPublic?: boolean;
//   ignoreDate?: boolean;
//   dateFrom?: string;
//   dateTo?: string;
//   sortOrder?: string;
//   minBudget?: string; // optional numeric string
//   maxBudget?: string;
//   /** ✅ NEW: filter by assigned executive id ("all" | "__unassigned__" | specific id as string) */
//   assignedExecutive?: string;
// }

// interface PropertyFilterModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   filters: PropertyFilters;
//   setFilters: React.Dispatch<React.SetStateAction<PropertyFilters>>;
//   clearFilters: () => void;

//   typeOptions: Array<{ label: string; value: string }>;
//   statusOptions: Array<{ label: string; value: string }>;
//   priceRangeOptions: Array<{ label: string; value: string }>;
//   locationOptions: Array<{ label: string; value: string }>;
//   sellerOptions: Array<{ label: string; value: string }>;
//   stageOptions: Array<{ label: string; value: string }>;
//   tagsOptions: Array<{ label: string; value: string }>;

//   /** ✅ NEW: pass executive options from parent */
//   executiveOptions?: Array<{ label: string; value: string }>;
//   /** ✅ Optional loading state for exec options (disables the dropdown) */
//   executivesLoading?: boolean;
// }

// const sortOrderOptions = [
//   { label: "Newest → Oldest", value: "created_desc" },
//   { label: "Oldest → Newest", value: "created_asc" },
//   { label: "Price: Low → High", value: "price_asc" },
//   { label: "Price: High → Low", value: "price_desc" },
// ];

// const PropertyFilterModal: React.FC<PropertyFilterModalProps> = ({
//   isOpen,
//   onClose,
//   filters,
//   setFilters,
//   clearFilters,
//   typeOptions,
//   statusOptions,
//   priceRangeOptions,
//   locationOptions,
//   sellerOptions,
//   stageOptions,
//   tagsOptions,
//   executiveOptions = [],
//   executivesLoading = false,
// }) => {
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
//     if (isOpen) document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [isOpen, onClose]);

//   // If ignoreDate toggled on, clear date fields
//   useEffect(() => {
//     if (filters?.ignoreDate && (filters.dateFrom || filters.dateTo)) {
//       setFilters({ ...filters, dateFrom: "", dateTo: "" });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filters?.ignoreDate]);

//   if (typeof window === "undefined") return null;

//   const update = (patch: Partial<PropertyFilters>) =>
//     setFilters({ ...(filters || {}), ...patch });

//   // Build exec dropdown options (All, provided list, Unassigned)
//   const execOptions = [
//     { label: "All executives", value: "all" },
//     ...(executiveOptions || []),
//     { label: "Unassigned", value: "__unassigned__" },
//   ];

//   return createPortal(
//     <>
//       {/* Overlay */}
//       <div
//         className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 
//         ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//         onClick={onClose}
//       />

//       {/* Sidebar */}
//       <div
//         className={`fixed top-0 right-0 h-full bg-gradient-to-b from-indigo-50 via-white to-purple-50 z-50 
//         shadow-2xl w-full sm:w-[400px] transform transition-transform duration-300 ease-out
//         ${isOpen ? "translate-x-0" : "translate-x-full"}`}
//         role="dialog"
//         aria-modal="true"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white z">
//           <h3 className="text-sm font-semibold tracking-wide">Property Filters</h3>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-4 overflow-y-auto h-[calc(100%-56px)] text-xs space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Property Type</label>
//               <Dropdown
//                 options={[{ label: "All Types", value: "all" }, ...typeOptions]}
//                 value={filters.type ?? "all"}
//                 onChange={(v) => update({ type: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Status</label>
//               <Dropdown
//                 options={[{ label: "All Status", value: "all" }, ...statusOptions]}
//                 value={filters.status ?? "all"}
//                 onChange={(v) => update({ status: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Price Range</label>
//               <Dropdown
//                 options={[{ label: "Any", value: "all" }, ...priceRangeOptions]}
//                 value={filters.priceRange ?? "all"}
//                 onChange={(v) => update({ priceRange: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Location</label>
//               <Dropdown
//                 options={[{ label: "All Locations", value: "all" }, ...locationOptions]}
//                 value={filters.location ?? "all"}
//                 onChange={(v) => update({ location: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Seller / Owner</label>
//               <Dropdown
//                 options={[{ label: "Any Seller", value: "all" }, ...sellerOptions]}
//                 value={filters.seller ?? "all"}
//                 onChange={(v) => update({ seller: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Stage</label>
//               <Dropdown
//                 options={[{ label: "All Stages", value: "all" }, ...stageOptions]}
//                 value={filters.stage ?? "all"}
//                 onChange={(v) => update({ stage: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Tags</label>
//               <Dropdown
//                 options={[{ label: "Any Tag", value: "all" }, ...tagsOptions]}
//                 value={filters.tags ?? "all"}
//                 onChange={(v) => update({ tags: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Visibility</label>
//               <Dropdown
//                 options={[
//                   { label: "All", value: "all" },
//                   { label: "Public", value: "public" },
//                   { label: "Private", value: "private" },
//                 ]}
//                 value={
//                   filters.isPublic === undefined
//                     ? "all"
//                     : filters.isPublic
//                     ? "public"
//                     : "private"
//                 }
//                 onChange={(v) => {
//                   if (v === "all") update({ isPublic: undefined });
//                   else update({ isPublic: v === "public" });
//                 }}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             {/* Budget quick inputs */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Min Budget (₹)</label>
//               <Input
//                 type="number"
//                 value={filters.minBudget || ""}
//                 onChange={(e) => update({ minBudget: e.target.value })}
//                 placeholder="e.g. 500000"
//               />
//             </div>

//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Max Budget (₹)</label>
//               <Input
//                 type="number"
//                 value={filters.maxBudget || ""}
//                 onChange={(e) => update({ maxBudget: e.target.value })}
//                 placeholder="e.g. 25000000"
//               />
//             </div>

//             {/* ✅ Executive filter */}
//             <div className="md:col-span-2">
//               <label className="block font-medium text-gray-700 mb-1">Executive</label>
//               <Dropdown
//                 options={execOptions}
//                 value={filters.assignedExecutive ?? "all"}
//                 onChange={(v) => update({ assignedExecutive: v })}
//                 triggerClassName="w-full text-xs"
//                 disabled={executivesLoading}
//               />
//             </div>

//             <div className="md:col-span-2">
//               <label className="block font-medium text-gray-700 mb-1">Sort</label>
//               <Dropdown
//                 options={sortOrderOptions}
//                 value={filters.sortOrder ?? "created_desc"}
//                 onChange={(v) => update({ sortOrder: v })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>
//           </div>

//           {/* Ignore Date */}
//           <div className="flex items-center gap-2 mt-2">
//             <input
//               id="propIgnoreDate"
//               type="checkbox"
//               checked={!!filters.ignoreDate}
//               onChange={(e) => update({ ignoreDate: e.target.checked })}
//               className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//             />
//             <label htmlFor="propIgnoreDate" className="text-gray-700">
//               Ignore Date Filters
//             </label>
//           </div>

//           {/* Date Range */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">From Date</label>
//               <Input
//                 type="date"
//                 value={filters.dateFrom || ""}
//                 onChange={(e) => update({ dateFrom: e.target.value })}
//                 disabled={!!filters.ignoreDate}
//               />
//             </div>
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">To Date</label>
//               <Input
//                 type="date"
//                 value={filters.dateTo || ""}
//                 onChange={(e) => update({ dateTo: e.target.value })}
//                 disabled={!!filters.ignoreDate}
//               />
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 pt-4">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 clearFilters();
//                 setFilters({
//                   type: "all",
//                   status: "all",
//                   priceRange: "all",
//                   location: "all",
//                   seller: "all",
//                   stage: "all",
//                   tags: "all",
//                   isPublic: undefined,
//                   ignoreDate: false,
//                   dateFrom: "",
//                   dateTo: "",
//                   sortOrder: "created_desc",
//                   minBudget: "",
//                   maxBudget: "",
//                   assignedExecutive: "all", // ✅ reset
//                 });
//               }}
//               className="flex-1 text-xs border-red-400 text-red-500 hover:bg-red-50"
//             >
//               Clear All
//             </Button>

//             <Button
//               onClick={onClose}
//               className="flex-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
//             >
//               Apply
//             </Button>
//           </div>
//         </div>
//       </div>
//     </>,
//     document.body
//   );
// };

// export default PropertyFilterModal;



import React, { useEffect } from "react";
import { X, Filter, Calendar } from "lucide-react";
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
  minBudget?: string;
  maxBudget?: string;
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
  executiveOptions?: Array<{ label: string; value: string }>;
  executivesLoading?: boolean;
}

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

const sortOrderOptions = [
  { label: "Newest → Oldest", value: "created_desc" },
  { label: "Oldest → Newest", value: "created_asc" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 500,
  color: N,
  marginBottom: 4,
};

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
        className={`fixed inset-0 transition-opacity duration-300 z-40
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(15,43,61,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sidebar */}
     <div
  className={`fixed top-0 right-0 h-full z-50 flex flex-col
    transform transition-transform duration-300 ease-out
    w-[280px] sm:w-[400px]
    bg-slate-50 shadow-[-4px_0_32px_rgba(15,43,61,0.18)]
    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
  role="dialog"
  aria-modal="true"
>
        {/* Responsive width: 400px on sm+ */}
        <style>{`
          @media (min-width: 640px) {
            div[aria-label="property-filter-sidebar"] {
              width: 400px !important;
            }
          }
        `}</style>

        {/* Trick: add aria-label for the scoped style to target */}
        <div
          aria-label="property-filter-sidebar"
          className="flex flex-col h-full"
          style={{ width: "100%" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: N, borderBottom: `1px solid ${BD}` }}
          >
            <div className="flex items-center gap-2">
              <Filter size={15} color={O} />
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "0.02em",
                  margin: 0,
                }}
              >
                Property Filters
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close filters"
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="grid grid-cols-2 gap-3">

              {/* Property Type */}
              <div>
                <label style={labelStyle}>Property Type</label>
                <Dropdown
                  options={[{ label: "All Types", value: "all" }, ...typeOptions]}
                  value={filters.type ?? "all"}
                  onChange={(v) => update({ type: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <Dropdown
                  options={[{ label: "All Status", value: "all" }, ...statusOptions]}
                  value={filters.status ?? "all"}
                  onChange={(v) => update({ status: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>

              {/* Price Range */}
              <div>
                <label style={labelStyle}>Price Range</label>
                <Dropdown
                  options={[{ label: "Any", value: "all" }, ...priceRangeOptions]}
                  value={filters.priceRange ?? "all"}
                  onChange={(v) => update({ priceRange: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>

              {/* Location */}
              <div>
                <label style={labelStyle}>Location</label>
                <Dropdown
                  options={[{ label: "All Locations", value: "all" }, ...locationOptions]}
                  value={filters.location ?? "all"}
                  onChange={(v) => update({ location: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>

              {/* Seller / Owner */}
              <div>
                <label style={labelStyle}>Seller / Owner</label>
                <Dropdown
                  options={[{ label: "Any Seller", value: "all" }, ...sellerOptions]}
                  value={filters.seller ?? "all"}
                  onChange={(v) => update({ seller: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>

              {/* Stage */}
              <div>
                <label style={labelStyle}>Stage</label>
                <Dropdown
                  options={[{ label: "All Stages", value: "all" }, ...stageOptions]}
                  value={filters.stage ?? "all"}
                  onChange={(v) => update({ stage: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags</label>
                <Dropdown
                  options={[{ label: "Any Tag", value: "all" }, ...tagsOptions]}
                  value={filters.tags ?? "all"}
                  onChange={(v) => update({ tags: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>

              {/* Visibility */}
              <div>
                <label style={labelStyle}>Visibility</label>
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

              {/* Min Budget */}
              <div>
                <label style={labelStyle}>Min Budget (₹)</label>
                <Input
                  type="number"
                  value={filters.minBudget || ""}
                  onChange={(e) => update({ minBudget: e.target.value })}
                  placeholder="e.g. 500000"
                />
              </div>

              {/* Max Budget */}
              <div>
                <label style={labelStyle}>Max Budget (₹)</label>
                <Input
                  type="number"
                  value={filters.maxBudget || ""}
                  onChange={(e) => update({ maxBudget: e.target.value })}
                  placeholder="e.g. 25000000"
                />
              </div>

              {/* Executive — full width */}
              <div className="col-span-2">
                <label style={labelStyle}>Executive</label>
                <Dropdown
                  options={execOptions}
                  value={filters.assignedExecutive ?? "all"}
                  onChange={(v) => update({ assignedExecutive: v })}
                  triggerClassName="w-full text-xs"
                  disabled={executivesLoading}
                />
              </div>

              {/* Sort — full width */}
              <div className="col-span-2">
                <label style={labelStyle}>Sort</label>
                <Dropdown
                  options={sortOrderOptions}
                  value={filters.sortOrder ?? "created_desc"}
                  onChange={(v) => update({ sortOrder: v })}
                  triggerClassName="w-full text-xs"
                />
              </div>
            </div>

            {/* Ignore Date */}
            <div
              className="flex items-center gap-2 rounded-md px-3 py-2"
              style={{ background: `${N}08`, border: `1px solid ${BD}` }}
            >
              <input
                id="propIgnoreDate"
                type="checkbox"
                checked={!!filters.ignoreDate}
                onChange={(e) => update({ ignoreDate: e.target.checked })}
                style={{
                  width: 15,
                  height: 15,
                  accentColor: O,
                  cursor: "pointer",
                  borderRadius: 3,
                }}
              />
              <label
                htmlFor="propIgnoreDate"
                style={{ fontSize: 11, color: N, cursor: "pointer" }}
              >
                Ignore Date Filters
              </label>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>From Date</label>
                <div style={{ position: "relative" }}>
                  <Calendar
                    size={11}
                    color={O}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />
                  <Input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) => update({ dateFrom: e.target.value })}
                    disabled={!!filters.ignoreDate}
                    style={{ paddingLeft: "1.5rem", fontSize: 11 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>To Date</label>
                <div style={{ position: "relative" }}>
                  <Calendar
                    size={11}
                    color={O}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />
                  <Input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) => update({ dateTo: e.target.value })}
                    disabled={!!filters.ignoreDate}
                    style={{ paddingLeft: "1.5rem", fontSize: 11 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer — sticky */}
          <div
            className="flex gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderTop: `1px solid ${BD}`, background: "#f8fafc" }}
          >
            <button
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
                  assignedExecutive: "all",
                });
              }}
              style={{
                flex: 1,
                padding: "7px",
                fontSize: 11,
                fontWeight: 500,
                border: `1px solid ${O}`,
                borderRadius: 6,
                background: "#fff",
                color: O,
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "7px",
                fontSize: 11,
                fontWeight: 500,
                background: N,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default PropertyFilterModal;