// import React, { useEffect } from "react";
// import { X } from "lucide-react";
// import { createPortal } from "react-dom";
// import Button from "@/components/ui/Button";
// import Input from "@/components/ui/Input";
// import Dropdown from "@/components/ui/Dropdown";

// interface FilterModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   filters: any; // { status, source, leadType, assignedExecutive, createdBy, ignoreDate, dateFrom, dateTo, sortOrder }
//   setFilters: (filters: any) => void;
//   clearFilters: () => void;
//   statusOptions: any[];
//   sourceOptions: any[];
//   leadTypeOptions: any[];
//   assignedOptions: any[];
//   createdByOptions: any[];
//   priorityOptions: any[];
// }

// const sortOrderOptions = [
//   { label: "Newest → Oldest", value: "desc" },
//   { label: "Oldest → Newest", value: "asc" },
// ];

// const FilterModal: React.FC<FilterModalProps> = ({
//   isOpen,
//   onClose,
//   filters,
//   setFilters,
//   clearFilters,
//   statusOptions,
//   sourceOptions,
//   leadTypeOptions,
//   assignedOptions,
//   createdByOptions,
//   priorityOptions

// }) => {
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
//     if (isOpen) document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [isOpen, onClose]);

//   useEffect(() => {
//     if (filters?.ignoreDate && (filters.dateFrom || filters.dateTo)) {
//       setFilters({ ...filters, dateFrom: "", dateTo: "" });
//     }
//   }, [filters?.ignoreDate]);

//   if (typeof window === "undefined") return null;

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
//         shadow-2xl w-full sm:w-[380px] transform transition-transform duration-300 ease-out
//         ${isOpen ? "translate-x-0" : "translate-x-full"}`}
//         role="dialog"
//         aria-modal="true"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
//           <h3 className="text-sm font-semibold tracking-wide">Smart Filters</h3>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-4 overflow-y-auto h-[calc(100%-56px)] text-xs space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Status */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Status</label>
//               <Dropdown
//                 options={statusOptions}
//                 value={filters.status}
//                 onChange={(value) => setFilters({ ...filters, status: value })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             {/* Lead Source */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Lead Source</label>
//               <Dropdown
//                 options={sourceOptions}
//                 value={filters.source}
//                 onChange={(value) => setFilters({ ...filters, source: value })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             {/* Lead Type */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Lead Type</label>
//               <Dropdown
//                 options={leadTypeOptions}
//                 value={filters.leadType}
//                 onChange={(value) => setFilters({ ...filters, leadType: value })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>
//             {/* Priority */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Priority</label>
//               <Dropdown
//                 options={priorityOptions}
//                 value={filters.priority}
//                 onChange={(value) => setFilters({ ...filters, priority: value })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             {/* Assigned Executive */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Assigned Executive</label>
//               <Dropdown
//                 options={assignedOptions}
//                 value={filters.assignedExecutive}
//                 onChange={(value) => setFilters({ ...filters, assignedExecutive: value })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             {/* Created By */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Created By</label>
//               <Dropdown
//                 options={createdByOptions}
//                 value={filters.createdBy}
//                 onChange={(value) => setFilters({ ...filters, createdBy: value })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>

//             {/* Sort Order */}
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">Sort by Created Date</label>
//               <Dropdown
//                 options={sortOrderOptions}
//                 value={filters.sortOrder ?? "desc"}
//                 onChange={(value) => setFilters({ ...filters, sortOrder: value })}
//                 triggerClassName="w-full text-xs"
//               />
//             </div>
//           </div>

//           {/* Ignore Date */}
//           <div className="flex items-center gap-2 mt-2">
//             <input
//               id="ignoreDate"
//               type="checkbox"
//               checked={!!filters.ignoreDate}
//               onChange={(e) => setFilters({ ...filters, ignoreDate: e.target.checked })}
//               className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//             />
//             <label htmlFor="ignoreDate" className="text-gray-700">
//               Ignore Date
//             </label>
//           </div>

//           {/* Date Range */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">From Date</label>
//               <Input
//                 type="date"
//                 value={filters.dateFrom}
//                 onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
//                 disabled={!!filters.ignoreDate}
//               />
//             </div>
//             <div>
//               <label className="block font-medium text-gray-700 mb-1">To Date</label>
//               <Input
//                 type="date"
//                 value={filters.dateTo}
//                 onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
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
//                 setFilters((prev: any) => ({ ...prev, sortOrder: "desc" }));
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

// export default FilterModal;


import React, { useEffect, useState } from "react";
import { X, Filter, Calendar } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";

// Theme constants (matching AddLeadModal)
const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  statusOptions: any[];
  sourceOptions: any[];
  leadTypeOptions: any[];
  assignedOptions: any[];
  createdByOptions: any[];
  priorityOptions: any[];
}

const sortOrderOptions = [
  { label: "Newest → Oldest", value: "desc" },
  { label: "Oldest → Newest", value: "asc" },
];

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  clearFilters,
  statusOptions,
  sourceOptions,
  leadTypeOptions,
  assignedOptions,
  createdByOptions,
  priorityOptions,
}) => {
  const [draft, setDraft] = useState({ ...filters });

  // Sync draft when panel opens (so draft reflects currently applied filters)
  useEffect(() => {
    if (isOpen) setDraft({ ...filters });
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (draft?.ignoreDate && (draft.dateFrom || draft.dateTo)) {
      setDraft((prev: any) => ({ ...prev, dateFrom: "", dateTo: "" }));
    }
  }, [draft?.ignoreDate]);

  const updateDraft = (patch: any) => setDraft((prev: any) => ({ ...prev, ...patch }));

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(15,43,61,0.45)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sidebar — 50% on mobile, 380px on sm+ */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          w-[270px] sm:w-[380px]`}
        style={{ background: "#f8fafc", boxShadow: "-4px 0 32px rgba(15,43,61,0.18)" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: N, borderBottom: `1px solid ${BD}` }}
        >
          <div className="flex items-center gap-2">
            <Filter size={15} color={O} />
            <span
              className="text-white font-semibold tracking-wide"
              style={{ fontSize: "13px" }}
            >
              Smart Filters
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition"
            style={{
              width: 26,
              height: 26,
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
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
          {/* Filter Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Status */}
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                Status
              </label>
              <Dropdown
                options={statusOptions}
                value={draft.status}
                onChange={(value) => updateDraft({ status: value })}
                triggerClassName="w-full text-xs"
              />
            </div>

            {/* Lead Source */}
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                Lead Source
              </label>
              <Dropdown
                options={sourceOptions}
                value={draft.source}
                onChange={(value) => updateDraft({ source: value })}
                triggerClassName="w-full text-xs"
              />
            </div>

            {/* Lead Type */}
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                Lead Type
              </label>
              <Dropdown
                options={leadTypeOptions}
                value={draft.leadType}
                onChange={(value) => updateDraft({ leadType: value })}
                triggerClassName="w-full text-xs"
              />
            </div>

            {/* Priority */}
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                Priority
              </label>
              <Dropdown
                options={priorityOptions}
                value={draft.priority}
                onChange={(value) => updateDraft({ priority: value })}
                triggerClassName="w-full text-xs"
              />
            </div>

            {/* Assigned Executive */}
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                Assigned Executive
              </label>
              <Dropdown
                options={assignedOptions}
                value={draft.assignedExecutive}
                onChange={(value) => updateDraft({ assignedExecutive: value })}
                triggerClassName="w-full text-xs"
              />
            </div>

            {/* Created By */}
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                Created By
              </label>
              <Dropdown
                options={createdByOptions}
                value={draft.createdBy}
                onChange={(value) => updateDraft({ createdBy: value })}
                triggerClassName="w-full text-xs"
              />
            </div>

            {/* Sort Order — full width */}
            <div className="col-span-1 sm:col-span-2">
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                Sort by Created Date
              </label>
              <Dropdown
                options={sortOrderOptions}
                value={draft.sortOrder ?? "desc"}
                onChange={(value) => updateDraft({ sortOrder: value })}
                triggerClassName="w-full text-xs"
              />
            </div>
          </div>

          {/* Ignore Date Checkbox */}
          <div
            className="flex items-center gap-2 rounded-md px-3 py-2"
            style={{
              background: `${N}08`,
              border: `1px solid ${BD}`,
            }}
          >
            <input
              id="ignoreDate"
              type="checkbox"
              checked={!!draft.ignoreDate}
              onChange={(e) => updateDraft({ ignoreDate: e.target.checked })}
              className="rounded focus:ring-1"
              style={{
                width: 15,
                height: 15,
                accentColor: O,
                cursor: "pointer",
              }}
            />
            <label
              htmlFor="ignoreDate"
              style={{ fontSize: "11px", color: N, cursor: "pointer" }}
            >
              Ignore Date
            </label>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                From Date
              </label>
              <div className="relative">
                <Calendar
                  size={11}
                  className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  color={O}
                />
                <Input
                  type="date"
                  value={draft.dateFrom}
                  onChange={(e) => updateDraft({ dateFrom: e.target.value })}
                  disabled={!!draft.ignoreDate}
                  style={{ paddingLeft: "1.5rem", fontSize: "11px" }}
                />
              </div>
            </div>
            <div>
              <label
                className="block font-medium mb-1"
                style={{ fontSize: "10px", color: N }}
              >
                To Date
              </label>
              <div className="relative">
                <Calendar
                  size={11}
                  className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  color={O}
                />
                <Input
                  type="date"
                  value={draft.dateTo}
                  onChange={(e) => updateDraft({ dateTo: e.target.value })}
                  disabled={!!draft.ignoreDate}
                  style={{ paddingLeft: "1.5rem", fontSize: "11px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons — sticky at bottom */}
        <div
          className="flex gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${BD}`, background: "#f8fafc" }}
        >
          <button
            onClick={() => {
              clearFilters();
              const cleared = { ...filters, status: 'all', source: 'all', leadType: 'all', assignedExecutive: 'all', createdBy: 'all', priority: 'all', city: '', location: '', dateFrom: '', dateTo: '', ignoreDate: false, sortOrder: 'desc' };
              setFilters(cleared);
              setDraft(cleared);
            }}
            className="flex-1 rounded-md transition-colors"
            style={{
              padding: "7px",
              fontSize: "11px",
              fontWeight: 500,
              border: `1px solid ${O}`,
              background: "#fff",
              color: O,
              cursor: "pointer",
            }}
          >
            Clear All
          </button>
          <button
            onClick={() => { setFilters(draft); onClose(); }}
            className="flex-1 rounded-md transition-opacity hover:opacity-90"
            style={{
              padding: "7px",
              fontSize: "11px",
              fontWeight: 500,
              background: N,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default FilterModal;