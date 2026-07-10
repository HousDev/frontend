
// import React, { useEffect } from "react";
// import { createPortal } from "react-dom";
// import { X, Filter } from "lucide-react";

// // ── Theme ────────────────────────────────────────────────────────────────────
// const N  = "#0f2b3d";
// const O  = "#e67e22";
// const BD = "#e2e8f0";

// export type FiltersState = {
//   dateFrom: string;
//   dateTo: string;
//   ignoreDate: boolean;
//   source: string;
//   stage: string;
//   priority: string;
//   assigned?: string;
//   status?: string;
//   budgetRange: string;
//   propertyType: string;
//   assigned_executive: string;
// };

// type OptionList = string[];
// type ExecOption = { id: string | number; name: string };

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   filters: FiltersState;
//   setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
//   resetFilters: () => void;
//   sources: OptionList;
//   stages: OptionList;
//   priorities: OptionList;
//   budgetRanges: OptionList;
//   propertyTypes: OptionList;
//   executives: ExecOption[];
// }

// const labelStyle: React.CSSProperties = {
//   display: "block",
//   fontSize: "10px",
//   fontWeight: 600,
//   color: N,
//   marginBottom: "4px",
//   letterSpacing: "0.04em",
//   textTransform: "uppercase",
// };

// const selectStyle: React.CSSProperties = {
//   width: "100%",
//   padding: "6px 8px",
//   fontSize: "11px",
//   border: `1px solid ${BD}`,
//   borderRadius: "6px",
//   background: "#fff",
//   color: N,
//   outline: "none",
//   cursor: "pointer",
// };

// const BuyerSidebarFilter: React.FC<Props> = ({
//   isOpen,
//   onClose,
//   filters,
//   setFilters,
//   resetFilters,
//   sources,
//   stages,
//   priorities,
//   budgetRanges,
//   propertyTypes,
//   executives,
// }) => {
//   if (typeof window === "undefined") return null;

//   useEffect(() => {
//     if (!isOpen) return;
//     const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [isOpen, onClose]);

//   useEffect(() => {
//     if (!isOpen) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => { document.body.style.overflow = prev; };
//   }, [isOpen]);

//   useEffect(() => {
//     if (filters?.ignoreDate && (filters.dateFrom || filters.dateTo)) {
//       setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
//     }
//   }, [filters?.ignoreDate, setFilters]);

//   const onChange = (key: keyof FiltersState, value: any) =>
//     setFilters((prev) => ({ ...prev, [key]: value }));

//   const applyAndClose = () => onClose();

//   // Count how many filters are active (for badge)
//   const activeCount = [
//     filters.source !== "all",
//     filters.stage !== "all",
//     filters.priority !== "all",
//     filters.budgetRange !== "all",
//     filters.propertyType !== "all",
//     filters.assigned_executive !== "all",
//     !filters.ignoreDate && (!!filters.dateFrom || !!filters.dateTo),
//   ].filter(Boolean).length;

//   return createPortal(
//     <>
//       {/* Overlay */}
//       <div
//         onClick={onClose}
//         aria-hidden={!isOpen}
//         style={{
//           position: "fixed", inset: 0,
//           background: "rgba(15,43,61,0.45)",
//           backdropFilter: "blur(2px)",
//           zIndex: 40,
//           transition: "opacity 0.25s",
//           opacity: isOpen ? 1 : 0,
//           pointerEvents: isOpen ? "auto" : "none",
//         }}
//       />

//       {/* Sidebar */}
//       <aside
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="buyer-filter-title"
//         style={{
//           position: "fixed", top: 0, right: 0, height: "100%",
//           width: "min(270px, 100vw)",
//           background: "#f8fafc",
//           boxShadow: "-4px 0 32px rgba(15,43,61,0.18)",
//           zIndex: 50,
//           display: "flex", flexDirection: "column",
//           transform: isOpen ? "translateX(0)" : "translateX(100%)",
//           transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
//         }}
//         className="sm:!w-[380px]"
//       >
//         {/* ── Header ── */}
//         <div style={{
//           background: N, borderBottom: `1px solid ${BD}`,
//           padding: "10px 16px", display: "flex",
//           alignItems: "center", justifyContent: "space-between",
//           flexShrink: 0,
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <Filter size={15} color={O} />
//             <span id="buyer-filter-title" style={{ color: "#fff", fontWeight: 600, fontSize: "13px", letterSpacing: "0.06em" }}>
//               Buyer Filters
//             </span>
//             {activeCount > 0 && (
//               <span style={{
//                 background: O, color: "#fff", fontSize: "9px",
//                 fontWeight: 700, borderRadius: "999px",
//                 padding: "1px 6px", lineHeight: "16px",
//               }}>
//                 {activeCount}
//               </span>
//             )}
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <button onClick={resetFilters} style={{
//               fontSize: "10px", padding: "3px 10px", borderRadius: "999px",
//               border: `1px solid ${O}`, background: "transparent",
//               color: O, cursor: "pointer", fontWeight: 600,
//             }}>
//               Reset
//             </button>
//             <button onClick={onClose} aria-label="Close filters" style={{
//               width: 26, height: 26, borderRadius: "50%",
//               background: "rgba(255,255,255,0.12)", border: "none",
//               color: "#fff", cursor: "pointer",
//               display: "flex", alignItems: "center", justifyContent: "center",
//             }}>
//               <X size={14} />
//             </button>
//           </div>
//         </div>

//         {/* ── Scrollable Content ── */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "16px", scrollbarWidth: "thin" }}>

//           {/* Section: Lead Info */}
//           <p style={{ fontSize: "9px", fontWeight: 700, color: O, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
//             LEAD INFO
//           </p>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: 16 }}>

//             {/* Source */}
//             <div>
//               <label style={labelStyle}>Source</label>
//               <select value={filters.source} onChange={(e) => onChange("source", e.target.value)} style={selectStyle}>
//                 {sources.map((s) => <option key={s} value={s}>{s === "all" ? "All" : s}</option>)}
//               </select>
//             </div>

//             {/* Stage */}
//             <div>
//               <label style={labelStyle}>Stage</label>
//               <select value={filters.stage} onChange={(e) => onChange("stage", e.target.value)} style={selectStyle}>
//                 {stages.map((s) => (
//                   <option key={s} value={s}>
//                     {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Priority */}
//             <div>
//               <label style={labelStyle}>Priority</label>
//               <select value={filters.priority} onChange={(e) => onChange("priority", e.target.value)} style={selectStyle}>
//                 {priorities.map((p) => (
//                   <option key={p} value={p}>{p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Executive */}
//             <div>
//               <label style={labelStyle}>Executive</label>
//               <select value={filters.assigned_executive} onChange={(e) => onChange("assigned_executive", e.target.value)} style={selectStyle}>
//                 <option value="all">All</option>
//                 {executives.map((ex) => (
//                   <option key={ex.id} value={String(ex.id)}>{ex.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Divider */}
//           <div style={{ borderTop: `1px dashed ${BD}`, margin: "0 0 14px" }} />

//           {/* Section: Requirements */}
//           <p style={{ fontSize: "9px", fontWeight: 700, color: O, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
//             REQUIREMENTS
//           </p>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: 16 }}>

//             {/* Budget Range */}
//             <div style={{ gridColumn: "1 / -1" }}>
//               <label style={labelStyle}>Budget Range</label>
//               <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
//                 {budgetRanges.map((b) => {
//                   const isSelected = filters.budgetRange === b;
//                   return (
//                     <button
//                       key={b}
//                       onClick={() => onChange("budgetRange", b)}
//                       style={{
//                         padding: "5px 4px",
//                         fontSize: "10px",
//                         fontWeight: isSelected ? 700 : 500,
//                         borderRadius: 6,
//                         border: `1px solid ${isSelected ? O : BD}`,
//                         background: isSelected ? `${O}18` : "#fff",
//                         color: isSelected ? O : N,
//                         cursor: "pointer",
//                         transition: "all 0.15s",
//                         textAlign: "center",
//                       }}
//                     >
//                       {b === "all" ? "All" : b}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Property Type */}
//             <div style={{ gridColumn: "1 / -1" }}>
//               <label style={labelStyle}>Property Type</label>
//               <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//                 {propertyTypes.map((t) => {
//                   const isSelected = filters.propertyType === t;
//                   return (
//                     <button
//                       key={t}
//                       onClick={() => onChange("propertyType", t)}
//                       style={{
//                         padding: "5px 12px",
//                         fontSize: "10px",
//                         fontWeight: isSelected ? 700 : 500,
//                         borderRadius: 6,
//                         border: `1px solid ${isSelected ? O : BD}`,
//                         background: isSelected ? `${O}18` : "#fff",
//                         color: isSelected ? O : N,
//                         cursor: "pointer",
//                         transition: "all 0.15s",
//                       }}
//                     >
//                       {t === "all" ? "All" : t}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Divider */}
//           <div style={{ borderTop: `1px dashed ${BD}`, margin: "0 0 14px" }} />

//           {/* Section: Date Range */}
//           <p style={{ fontSize: "9px", fontWeight: 700, color: O, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
//             DATE RANGE
//           </p>

//           {/* Ignore Date */}
//           <div style={{
//             display: "flex", alignItems: "center", gap: 8,
//             background: `${N}08`, border: `1px solid ${BD}`,
//             borderRadius: 6, padding: "7px 12px", marginBottom: 10,
//           }}>
//             <input
//               id="buyer-ignoreDate"
//               type="checkbox"
//               checked={!!filters.ignoreDate}
//               onChange={(e) => onChange("ignoreDate", e.target.checked)}
//               style={{ width: 14, height: 14, accentColor: O, cursor: "pointer" }}
//             />
//             <label htmlFor="buyer-ignoreDate" style={{ fontSize: "11px", color: N, cursor: "pointer" }}>
//               Ignore Date Filter
//             </label>
//           </div>

//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//             <div>
//               <label style={labelStyle}>From Date</label>
//               <input
//                 type="date"
//                 value={filters.dateFrom}
//                 onChange={(e) => onChange("dateFrom", e.target.value)}
//                 disabled={filters.ignoreDate}
//                 style={{
//                   ...selectStyle,
//                   opacity: filters.ignoreDate ? 0.4 : 1,
//                   cursor: filters.ignoreDate ? "not-allowed" : "pointer",
//                 }}
//               />
//             </div>
//             <div>
//               <label style={labelStyle}>To Date</label>
//               <input
//                 type="date"
//                 value={filters.dateTo}
//                 onChange={(e) => onChange("dateTo", e.target.value)}
//                 disabled={filters.ignoreDate}
//                 style={{
//                   ...selectStyle,
//                   opacity: filters.ignoreDate ? 0.4 : 1,
//                   cursor: filters.ignoreDate ? "not-allowed" : "pointer",
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* ── Footer ── */}
//         <div style={{
//           borderTop: `1px solid ${BD}`, background: "#f8fafc",
//           padding: "12px 16px", display: "flex", gap: 10, flexShrink: 0,
//         }}>
//           <button onClick={resetFilters} style={{
//             flex: 1, padding: "7px", fontSize: "11px", fontWeight: 600,
//             border: `1px solid ${O}`, background: "#fff", color: O,
//             borderRadius: 6, cursor: "pointer",
//           }}>
//             Clear All
//           </button>
//           <button onClick={applyAndClose} style={{
//             flex: 1, padding: "7px", fontSize: "11px", fontWeight: 600,
//             background: N, color: "#fff", border: "none",
//             borderRadius: 6, cursor: "pointer",
//           }}>
//             Apply Filters
//           </button>
//         </div>
//       </aside>
//     </>,
//     document.body
//   );
// };

// export default BuyerSidebarFilter;



import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Filter } from "lucide-react";

const N  = "#0f2b3d";
const O  = "#e67e22";
const BD = "#e2e8f0";

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
  assigned_executive: string;
};

type OptionList = string[];
type ExecOption = { id: string | number; name: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  resetFilters: () => void;
  sources: OptionList;
  stages: OptionList;
  priorities: OptionList;
  budgetRanges: OptionList;
  propertyTypes: OptionList;
  executives: ExecOption[];
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 600,
  color: N,
  marginBottom: "4px",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  fontSize: "11px",
  border: `1px solid ${BD}`,
  borderRadius: "6px",
  background: "#fff",
  color: N,
  outline: "none",
  cursor: "pointer",
};

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
  executives,
}) => {
  if (typeof window === "undefined") return null;

  const [draft, setDraft] = useState<FiltersState>({ ...filters });
  const updateDraft = (key: keyof FiltersState, value: any) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // Sync draft when panel opens
  useEffect(() => {
    if (isOpen) setDraft({ ...filters });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (draft?.ignoreDate && (draft.dateFrom || draft.dateTo)) {
      setDraft((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
    }
  }, [draft?.ignoreDate]);

  const activeCount = [
    draft.source !== "all",
    draft.stage !== "all",
    draft.priority !== "all",
    draft.budgetRange !== "all",
    draft.propertyType !== "all",
    draft.assigned_executive !== "all",
    !draft.ignoreDate && (!!draft.dateFrom || !!draft.dateTo),
  ].filter(Boolean).length;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,43,61,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
          transition: "opacity 0.25s",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="buyer-filter-title"
        style={{
          position: "fixed", top: 0, right: 0, height: "100%",
          width: "min(270px, 100vw)",
          background: "#f8fafc",
          boxShadow: "-4px 0 32px rgba(15,43,61,0.18)",
          zIndex: 50,
          display: "flex", flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="sm:!w-[380px]"
      >
        {/* Header */}
        <div style={{
          background: N, borderBottom: `1px solid ${BD}`,
          padding: "10px 16px", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={15} color={O} />
            <span id="buyer-filter-title" style={{ color: "#fff", fontWeight: 600, fontSize: "13px", letterSpacing: "0.06em" }}>
              Buyer Filters
            </span>
            {activeCount > 0 && (
              <span style={{
                background: O, color: "#fff", fontSize: "9px",
                fontWeight: 700, borderRadius: "999px",
                padding: "1px 6px", lineHeight: "16px",
              }}>
                {activeCount}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={resetFilters} style={{
              fontSize: "10px", padding: "3px 10px", borderRadius: "999px",
              border: `1px solid ${O}`, background: "transparent",
              color: O, cursor: "pointer", fontWeight: 600,
            }}>
              Reset
            </button>
            <button onClick={onClose} aria-label="Close filters" style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", scrollbarWidth: "thin" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

            {/* Source */}
            <div>
              <label style={labelStyle}>Source</label>
              <select value={draft.source} onChange={(e) => updateDraft("source", e.target.value)} style={selectStyle}>
                {sources.map((s) => <option key={s} value={s}>{s === "all" ? "All" : s}</option>)}
              </select>
            </div>

            {/* Stage */}
            <div>
              <label style={labelStyle}>Stage</label>
              <select value={draft.stage} onChange={(e) => updateDraft("stage", e.target.value)} style={selectStyle}>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={draft.priority} onChange={(e) => updateDraft("priority", e.target.value)} style={selectStyle}>
                {priorities.map((p) => (
                  <option key={p} value={p}>{p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Executive */}
            <div>
              <label style={labelStyle}>Executive</label>
              <select value={draft.assigned_executive} onChange={(e) => updateDraft("assigned_executive", e.target.value)} style={selectStyle}>
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                {executives.map((ex) => (
                  <option key={ex.id} value={String(ex.id)}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* Budget Range — dropdown */}
            <div>
              <label style={labelStyle}>Budget Range</label>
              <select value={draft.budgetRange} onChange={(e) => updateDraft("budgetRange", e.target.value)} style={selectStyle}>
                {budgetRanges.map((b) => <option key={b} value={b}>{b === "all" ? "All" : b}</option>)}
              </select>
            </div>

            {/* Property Type — dropdown */}
            <div>
              <label style={labelStyle}>Property Type</label>
              <select value={draft.propertyType} onChange={(e) => updateDraft("propertyType", e.target.value)} style={selectStyle}>
                {propertyTypes.map((t) => <option key={t} value={t}>{t === "all" ? "All" : t}</option>)}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label style={labelStyle}>From Date</label>
              <input
                type="date"
                value={draft.dateFrom}
                onChange={(e) => updateDraft("dateFrom", e.target.value)}
                disabled={draft.ignoreDate}
                style={{
                  ...selectStyle,
                  opacity: draft.ignoreDate ? 0.4 : 1,
                  cursor: draft.ignoreDate ? "not-allowed" : "pointer",
                }}
              />
            </div>

            {/* To Date */}
            <div>
              <label style={labelStyle}>To Date</label>
              <input
                type="date"
                value={draft.dateTo}
                onChange={(e) => updateDraft("dateTo", e.target.value)}
                disabled={draft.ignoreDate}
                style={{
                  ...selectStyle,
                  opacity: draft.ignoreDate ? 0.4 : 1,
                  cursor: draft.ignoreDate ? "not-allowed" : "pointer",
                }}
              />
            </div>
          </div>

          {/* Ignore Date */}
          <div style={{
            marginTop: 14,
            display: "flex", alignItems: "center", gap: 8,
            background: `${N}08`, border: `1px solid ${BD}`,
            borderRadius: 6, padding: "7px 12px",
          }}>
            <input
              id="buyer-ignoreDate"
              type="checkbox"
              checked={!!draft.ignoreDate}
              onChange={(e) => updateDraft("ignoreDate", e.target.checked)}
              style={{ width: 14, height: 14, accentColor: O, cursor: "pointer" }}
            />
            <label htmlFor="buyer-ignoreDate" style={{ fontSize: "11px", color: N, cursor: "pointer" }}>
              Ignore Date
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${BD}`, background: "#f8fafc",
          padding: "12px 16px", display: "flex", gap: 10, flexShrink: 0,
        }}>
          <button onClick={() => {
              const cleared = { ...filters, source: 'all', stage: 'all', priority: 'all', budgetRange: 'all', propertyType: 'all', assigned_executive: 'all', dateFrom: '', dateTo: '', ignoreDate: false };
              setFilters(() => cleared);
              resetFilters();
              setDraft(cleared);
            }} style={{
            flex: 1, padding: "7px", fontSize: "11px", fontWeight: 600,
            border: `1px solid ${O}`, background: "#fff", color: O,
            borderRadius: 6, cursor: "pointer",
          }}>
            Clear All
          </button>
          <button onClick={() => { setFilters(() => draft); onClose(); }} style={{
            flex: 1, padding: "7px", fontSize: "11px", fontWeight: 600,
            background: N, color: "#fff", border: "none",
            borderRadius: 6, cursor: "pointer",
          }}>
            Apply Filters
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default BuyerSidebarFilter;