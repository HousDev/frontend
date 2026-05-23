// import React, { useEffect } from "react";
// import { createPortal } from "react-dom";
// import { X } from "lucide-react";

// export type SellerFiltersState = {
//   dateFrom: string;
//   dateTo: string;
//   ignoreDate: boolean;
//   source: string;
//   stage: string;
//   priority: string;
//   assigned: string;
//   status: string;
//   leadType?: string;
// };

// type OptionList = string[];

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   filters: SellerFiltersState;
//   setFilters: React.Dispatch<React.SetStateAction<SellerFiltersState>>;
//   resetFilters: () => void;
//   sources: OptionList;
//   stages: OptionList;
//   priorities: OptionList;
//   assignedUsers: OptionList;
//   statuses: OptionList;
// }

// /**
//  * SellerSidebarFilter
//  * - Portal to document.body
//  * - Blocks background scroll while open
//  * - Closes on Escape / overlay click
//  * - Clears dates when ignoreDate is toggled on
//  */
// const SellerSidebarFilter: React.FC<Props> = ({
//   isOpen,
//   onClose,
//   filters,
//   setFilters,
//   resetFilters,
//   sources,
//   stages,
//   priorities,
//   assignedUsers,
//   statuses,
// }) => {
//   // SSR guard
//   if (typeof window === "undefined") return null;

//   // Close on Escape
//   useEffect(() => {
//     if (!isOpen) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [isOpen, onClose]);

//   // Prevent background scroll while open
//   useEffect(() => {
//     if (!isOpen) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [isOpen]);

//   // If Ignore Date turned on, clear date fields
//   useEffect(() => {
//     if (filters?.ignoreDate && (filters.dateFrom || filters.dateTo)) {
//       setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
//     }
//   }, [filters?.ignoreDate, setFilters, filters?.dateFrom, filters?.dateTo]);

//   const onChange = (key: keyof SellerFiltersState, value: any) =>
//     setFilters((prev) => ({ ...prev, [key]: value }));

//   const applyAndClose = () => {
//     onClose();
//   };

//   return createPortal(
//     <>
//       {/* Overlay */}
//       <div
//         onClick={onClose}
//         aria-hidden={!isOpen}
//         className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
//           isOpen ? "opacity-100 pointer-events-auto z-40" : "opacity-0 pointer-events-none"
//         }`}
//       />

//       {/* Sidebar */}
//       <aside
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="seller-filter-title"
//         className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-gradient-to-b from-indigo-50 via-white to-purple-50 shadow-2xl transform transition-transform duration-300 ease-out z-50
//           ${isOpen ? "translate-x-0" : "translate-x-full"}`}
//       >
//         <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
//           <h3 id="seller-filter-title" className="text-sm font-semibold tracking-wide">Filters</h3>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => resetFilters()}
//               className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
//             >
//               Reset
//             </button>
//             <button
//               onClick={onClose}
//               aria-label="Close filters"
//               className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>

//         <div className="p-4 overflow-y-auto h-[calc(100%-56px)] text-sm">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             {/* Source */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
//               <select
//                 value={filters.source}
//                 onChange={(e) => onChange("source", e.target.value)}
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
//               >
//                 {sources.map((s) => (
//                   <option key={s} value={s}>{s === "all" ? "All" : s}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Stage */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
//               <select
//                 value={filters.stage}
//                 onChange={(e) => onChange("stage", e.target.value)}
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
//               >
//                 {stages.map((s) => (
//                   <option key={s} value={s}>
//                     {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Priority */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
//               <select
//                 value={filters.priority}
//                 onChange={(e) => onChange("priority", e.target.value)}
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
//               >
//                 {priorities.map((p) => (
//                   <option key={p} value={p}>{p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Assigned */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Assigned</label>
//               <select
//                 value={filters.assigned}
//                 onChange={(e) => onChange("assigned", e.target.value)}
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
//               >
//                 {assignedUsers.map((u) => (
//                   <option key={u} value={u}>{u === "all" ? "All" : u}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Status */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={filters.status}
//                 onChange={(e) => onChange("status", e.target.value)}
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
//               >
//                 {statuses.map((st) => (
//                   <option key={st} value={st}>{st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}</option>
//                 ))}
//               </select>
//             </div>

//             {/* From Date */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
//               <input
//                 type="date"
//                 value={filters.dateFrom}
//                 onChange={(e) => onChange("dateFrom", e.target.value)}
//                 disabled={filters.ignoreDate}
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
//               />
//             </div>

//             {/* To Date */}
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
//               <input
//                 type="date"
//                 value={filters.dateTo}
//                 onChange={(e) => onChange("dateTo", e.target.value)}
//                 disabled={filters.ignoreDate}
//                 className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
//               />
//             </div>
//           </div>

//           {/* Ignore Date and actions */}
//           <div className="flex items-center justify-between mt-4">
//             <label className="flex items-center space-x-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={!!filters.ignoreDate}
//                 onChange={(e) => onChange("ignoreDate", e.target.checked)}
//                 className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//               />
//               <span className="text-xs text-gray-700">Ignore Date</span>
//             </label>

//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => resetFilters()}
//                 className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
//                 aria-label="Reset filters"
//               >
//                 Reset
//               </button>
//               <button
//                 onClick={applyAndClose}
//                 className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
//                 aria-label="Apply filters"
//               >
//                 Apply
//               </button>
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>,
//     document.body
//   );
// };

// export default SellerSidebarFilter;

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Filter, Calendar } from "lucide-react";

export type SellerFiltersState = {
  dateFrom: string;
  dateTo: string;
  ignoreDate: boolean;
  source: string;
  stage: string;
  priority: string;
  assigned: string;
  status: string;
  leadType?: string;
};

type OptionList = string[];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: SellerFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<SellerFiltersState>>;
  resetFilters: () => void;
  sources: OptionList;
  stages: OptionList;
  priorities: OptionList;
  assignedUsers: OptionList;
  statuses: OptionList;
}

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "5px 8px",
  border: `1px solid ${BD}`,
  borderRadius: 6,
  fontSize: 11,
  color: N,
  background: "#fff",
  cursor: "pointer",
  outline: "none",
  appearance: "auto" as any,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 500,
  color: N,
  marginBottom: 4,
};

const SellerSidebarFilter: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  resetFilters,
  sources,
  stages,
  priorities,
  assignedUsers,
  statuses,
}) => {
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

  // Prevent background scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Clear dates when ignoreDate is toggled on
  useEffect(() => {
    if (filters?.ignoreDate && (filters.dateFrom || filters.dateTo)) {
      setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
    }
  }, [filters?.ignoreDate, setFilters, filters?.dateFrom, filters?.dateTo]);

  const onChange = (key: keyof SellerFiltersState, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyAndClose = () => onClose();

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        style={{ background: "rgba(15,43,61,0.45)", backdropFilter: "blur(2px)" }}
        className={`fixed inset-0 transition-opacity duration-200 ${
          isOpen
            ? "opacity-100 pointer-events-auto z-40"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-filter-title"
        className={`fixed top-0 right-0 h-full z-50 flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          width: "280px",
          background: "#f8fafc",
          boxShadow: "-4px 0 32px rgba(15,43,61,0.18)",
        }}
      >
        {/* Responsive width: 380px on sm+ */}
        <style>{`
          @media (min-width: 640px) {
            aside[aria-labelledby="seller-filter-title"] {
              width: 380px !important;
            }
          }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: N, borderBottom: `1px solid ${BD}` }}
        >
          <div className="flex items-center gap-2">
            <Filter size={15} color={O} />
            <h3
              id="seller-filter-title"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "0.02em",
                margin: 0,
              }}
            >
              Filters
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              style={{
                fontSize: 10,
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                padding: "3px 10px",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Reset
            </button>
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
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="grid grid-cols-2 gap-3">

            {/* Source */}
            <div>
              <label style={labelStyle}>Source</label>
              <select
                value={filters.source}
                onChange={(e) => onChange("source", e.target.value)}
                style={selectStyle}
              >
                {sources.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All" : s}</option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label style={labelStyle}>Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => onChange("stage", e.target.value)}
                style={selectStyle}
              >
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s === "all"
                      ? "All"
                      : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => onChange("priority", e.target.value)}
                style={selectStyle}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned */}
            <div>
              <label style={labelStyle}>Assigned</label>
              <select
                value={filters.assigned}
                onChange={(e) => onChange("assigned", e.target.value)}
                style={selectStyle}
              >
                {assignedUsers.map((u) => (
                  <option key={u} value={u}>{u === "all" ? "All" : u}</option>
                ))}
              </select>
            </div>

            {/* Status — full width */}
            <div className="col-span-2">
              <label style={labelStyle}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => onChange("status", e.target.value)}
                style={selectStyle}
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
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
                  }}
                />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onChange("dateFrom", e.target.value)}
                  disabled={filters.ignoreDate}
                  style={{
                    ...selectStyle,
                    paddingLeft: 24,
                    opacity: filters.ignoreDate ? 0.5 : 1,
                    cursor: filters.ignoreDate ? "not-allowed" : "pointer",
                  }}
                />
              </div>
            </div>

            {/* To Date */}
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
                  }}
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onChange("dateTo", e.target.value)}
                  disabled={filters.ignoreDate}
                  style={{
                    ...selectStyle,
                    paddingLeft: 24,
                    opacity: filters.ignoreDate ? 0.5 : 1,
                    cursor: filters.ignoreDate ? "not-allowed" : "pointer",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Ignore Date */}
          <div
            className="flex items-center gap-2 rounded-md px-3 py-2"
            style={{ background: `${N}08`, border: `1px solid ${BD}` }}
          >
            <input
              type="checkbox"
              id="seller-ignoreDate"
              checked={!!filters.ignoreDate}
              onChange={(e) => onChange("ignoreDate", e.target.checked)}
              style={{
                width: 15,
                height: 15,
                accentColor: O,
                cursor: "pointer",
                borderRadius: 3,
              }}
            />
            <label
              htmlFor="seller-ignoreDate"
              style={{ fontSize: 11, color: N, cursor: "pointer" }}
            >
              Ignore Date
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${BD}`, background: "#f8fafc" }}
        >
          <button
            onClick={resetFilters}
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
            Reset
          </button>
          <button
            onClick={applyAndClose}
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
            Apply Filters
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default SellerSidebarFilter;