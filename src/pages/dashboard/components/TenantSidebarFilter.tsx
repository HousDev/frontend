import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Filter } from "lucide-react";

export type TenantFiltersState = {
  status: string;
  tenant_type: string;
  preferred_bhk: string;
  assigned: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: TenantFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<TenantFiltersState>>;
  resetFilters: () => void;
  statuses: string[];
  tenantTypes: string[];
  bhkOptions: string[];
  assignedUsers: { id: string | number; name: string }[];
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

export const TenantSidebarFilter: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  resetFilters,
  statuses,
  tenantTypes,
  bhkOptions,
  assignedUsers,
}) => {
  if (typeof window === "undefined") return null;

  const [draft, setDraft] = useState<TenantFiltersState>({ ...filters });
  const updateDraft = (key: keyof TenantFiltersState, value: any) =>
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

  const handleApply = () => {
    setFilters(draft);
    onClose();
  };

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
        aria-labelledby="tenant-filter-title"
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
            aside[aria-labelledby="tenant-filter-title"] {
              width: 340px !important;
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
              id="tenant-filter-title"
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
              onClick={() => {
                resetFilters();
                setDraft({
                  status: "",
                  tenant_type: "",
                  preferred_bhk: "",
                  assigned: "",
                });
              }}
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
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Status Filter */}
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={draft.status}
              onChange={(e) => updateDraft("status", e.target.value)}
              style={selectStyle}
            >
              <option value="">All Statuses</option>
              {statuses.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Tenant Type */}
          <div>
            <label style={labelStyle}>Tenant Type</label>
            <select
              value={draft.tenant_type}
              onChange={(e) => updateDraft("tenant_type", e.target.value)}
              style={selectStyle}
            >
              <option value="">All Types</option>
              {tenantTypes.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* BHK Requirement */}
          <div>
            <label style={labelStyle}>Preferred BHK</label>
            <select
              value={draft.preferred_bhk}
              onChange={(e) => updateDraft("preferred_bhk", e.target.value)}
              style={selectStyle}
            >
              <option value="">All BHK Configurations</option>
              {bhkOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Executive */}
          <div>
            <label style={labelStyle}>Assigned Executive</label>
            <select
              value={draft.assigned}
              onChange={(e) => updateDraft("assigned", e.target.value)}
              style={selectStyle}
            >
              <option value="">All Executives</option>
              {assignedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="p-3 border-t flex items-center justify-end gap-2 flex-shrink-0 bg-white"
          style={{ borderColor: BD }}
        >
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg text-white bg-[#e67e22] hover:bg-[#d35400] text-[11px] font-bold shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default TenantSidebarFilter;
