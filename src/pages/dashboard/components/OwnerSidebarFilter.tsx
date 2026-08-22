import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Filter, Calendar } from "lucide-react";

export type OwnerFiltersState = {
  dateFrom: string;
  dateTo: string;
  ignoreDate: boolean;
  source: string;
  stage: string;
  priority: string;
  assigned: string;
  status: string;
};

type OptionList = string[];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: OwnerFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<OwnerFiltersState>>;
  resetFilters: () => void;
  sources: OptionList;
  stages: OptionList;
  priorities: OptionList;
  assignedUsers: { id: string; name: string }[];
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

export const OwnerSidebarFilter: React.FC<Props> = ({
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

  const [draft, setDraft] = useState<OwnerFiltersState>({ ...filters });
  const updateDraft = (key: keyof OwnerFiltersState, value: any) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (isOpen) setDraft({ ...filters });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (draft?.ignoreDate && (draft.dateFrom || draft.dateTo)) {
      setDraft((prev) => ({ ...prev, dateFrom: "", dateTo: "" }));
    }
  }, [draft?.ignoreDate]);

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
        aria-labelledby="owner-filter-title"
        className={`fixed top-0 right-0 h-full z-50 flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{
          width: "280px",
          background: "#f8fafc",
          boxShadow: "-4px 0 32px rgba(15,43,61,0.18)",
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            aside[aria-labelledby="owner-filter-title"] {
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
              id="owner-filter-title"
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
                value={draft.source}
                onChange={(e) => updateDraft("source", e.target.value)}
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
                value={draft.stage}
                onChange={(e) => updateDraft("stage", e.target.value)}
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
                value={draft.priority}
                onChange={(e) => updateDraft("priority", e.target.value)}
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
                value={draft.assigned}
                onChange={(e) => updateDraft("assigned", e.target.value)}
                style={selectStyle}
              >
                {assignedUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <label style={labelStyle}>Status</label>
              <select
                value={draft.status}
                onChange={(e) => updateDraft("status", e.target.value)}
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
                  value={draft.dateFrom}
                  onChange={(e) => updateDraft("dateFrom", e.target.value)}
                  disabled={draft.ignoreDate}
                  style={{
                    ...selectStyle,
                    paddingLeft: 24,
                    opacity: draft.ignoreDate ? 0.5 : 1,
                    cursor: draft.ignoreDate ? "not-allowed" : "pointer",
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
                  value={draft.dateTo}
                  onChange={(e) => updateDraft("dateTo", e.target.value)}
                  disabled={draft.ignoreDate}
                  style={{
                    ...selectStyle,
                    paddingLeft: 24,
                    opacity: draft.ignoreDate ? 0.5 : 1,
                    cursor: draft.ignoreDate ? "not-allowed" : "pointer",
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
              id="owner-ignoreDate"
              checked={!!draft.ignoreDate}
              onChange={(e) => updateDraft("ignoreDate", e.target.checked)}
              style={{
                width: 15,
                height: 15,
                accentColor: O,
                cursor: "pointer",
                borderRadius: 3,
              }}
            />
            <label
              htmlFor="owner-ignoreDate"
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
            onClick={() => {
              const cleared: OwnerFiltersState = { source: 'all', stage: 'all', priority: 'all', assigned: 'all', status: 'all', dateFrom: '', dateTo: '', ignoreDate: false };
              setFilters(() => cleared);
              resetFilters();
              setDraft(cleared);
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
            Reset
          </button>
          <button
            onClick={() => { setFilters(() => draft); onClose(); }}
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

export default OwnerSidebarFilter;
