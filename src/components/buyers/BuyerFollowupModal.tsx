// BuyerFollowupModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Users, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
import { getMasterDropdownOptions } from "@/lib/useMasterData";

/* ===================== Types ===================== */
export type FollowupForm = {
  followupType: string;
  buyerLeadStage: string;
  buyerLeadStatus: string;
  remark: string;
  customRemark: string;
  nextAction: string;
  scheduleDate: string; // yyyy-mm-dd
  scheduleTime: string; // HH:MM
  priority: string;
};

export type FollowupFormWithLead = FollowupForm & { buyer_id: string; id?: string };

type NormalizedRow = {
  id?: string | number;
  tabId?: string; // master tab id (e.g. 'buyer' or 'lead')
  type1Name?: string;
  value1Name?: string;
  type2Name?: string;
  value2Name?: string;
  remarks?: string[]; // normalized to array
  raw?: any;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FollowupFormWithLead) => void;
  tabId: string;
  buyerId: string;
  initialForm?: Partial<FollowupFormWithLead>;
};

export const FOLLOWUP_TYPES = [
  { value: "Phone Call", Icon: Phone, color: "blue" },
  { value: "WhatsApp", Icon: FaWhatsapp, color: "green" },
  { value: "Email", Icon: Mail, color: "indigo" },
  { value: "Site Visit", Icon: MapPin, color: "orange" },
  { value: "Meeting", Icon: Users, color: "purple" },
  { value: "Other", Icon: MessageSquare, color: "gray" },
] as const;

/* ------------------ helpers: normalization & fuzzy matching ----------------- */
const toStr = (v: any) => (v === null || v === undefined ? "" : String(v));
const normKey = (s?: string) => toStr(s).toLowerCase().replace(/\s+/g, "");
const includesKey = (hay?: string, needle?: string) => normKey(hay).includes(normKey(needle));

/**
 * Normalize a raw API row into the expected shape.
 * The API (per your screenshots) might return:
 * { master_tab_id, master_type_1, master_value_1, master_type_2, master_value_2, remarks }
 * or other variants. We try many common keys.
 */
const normalizeRow = (r: any): NormalizedRow => {
  const pick = (keys: string[]) => {
    for (const k of keys) {
      if (r && typeof r[k] !== "undefined") return r[k];
    }
    return undefined;
  };

  const type1Name =
    pick(["type1Name", "type1_name", "type1", "masterType1", "master_type_1", "master_type1", "masterType1Name"]) ??
    pick(["masterType1", "master_type_1", "master_type1"]) ??
    pick(["master_type_1", "master_type_1_name"]) ??
    pick(["master_type_1"]);

  const value1Name =
    pick(["value1Name", "value1_name", "value1", "masterValue1", "master_value_1", "master_value1"]) ??
    pick(["master_value_1"]);

  const type2Name =
    pick(["type2Name", "type2_name", "type2", "masterType2", "master_type_2", "master_type2"]) ??
    pick(["master_type_2"]);

  const value2Name =
    pick(["value2Name", "value2_name", "value2", "masterValue2", "master_value_2", "master_value2"]) ??
    pick(["master_value_2"]);

  const tabId =
    pick(["masterTabId", "master_tab_id", "master_tab", "tabId", "tab_id"]) ??
    pick(["mastertabid", "master_tab"]);

  // remarks may be an array or a comma/newline-separated string
  let remarksRaw = pick(["remarks", "remark", "remarks_list", "masterRemarks", "master_remarks"]) ?? undefined;
  let remarksArr: string[] = [];
  if (Array.isArray(remarksRaw)) {
    remarksArr = remarksRaw.map((x: any) => toStr(x).trim()).filter(Boolean);
  } else if (typeof remarksRaw === "string" && remarksRaw.trim()) {
    // Split by newline or comma and trim
    remarksArr = remarksRaw
      .split(/\r?\n|,/)
      .map((x) => toStr(x).trim())
      .filter(Boolean);
  }

  return {
    id: pick(["id", "_id", "master_id", "masterId"]),
    tabId: tabId ? toStr(tabId).trim() : undefined,
    type1Name: type1Name ? toStr(type1Name).trim() : undefined,
    value1Name: value1Name ? toStr(value1Name).trim() : undefined,
    type2Name: type2Name ? toStr(type2Name).trim() : undefined,
    value2Name: value2Name ? toStr(value2Name).trim() : undefined,
    remarks: remarksArr,
    raw: r,
  };
};

const uniq = (arr: string[]) => Array.from(new Set(arr.map((s) => (s || "").trim()).filter(Boolean)));

/* fuzzy helpers targeting "lead stage", "lead status", "remark" tokens */
const isStageType = (typeName?: string) =>
  !!typeName && (includesKey(typeName, "leadstage") || includesKey(typeName, "leadstage".replace("", "lead stage")) || includesKey(typeName, "stage"));
const isStatusType = (typeName?: string) =>
  !!typeName && (includesKey(typeName, "leadstatus") || includesKey(typeName, "status"));
const isRemarksType = (typeName?: string) => !!typeName && (includesKey(typeName, "remark") || includesKey(typeName, "remarks"));

/* ----------------- extraction utilities using normalized rows ------------------ */

/** extract unique stage values (value1Name/value2Name) for rows matching stage-type */
const extractStages = (rows: NormalizedRow[]) => {
  const vals: string[] = [];
  rows.forEach((r) => {
    if (isStageType(r.type1Name)) vals.push(r.value1Name || "");
    if (isStageType(r.type2Name)) vals.push(r.value2Name || "");
  });
  return uniq(vals);
};

/**
 * For a selected stage value, find statuses linked to it.
 * We look for rows where one side is a stage type with matching value and the other side is a status type.
 */
const statusesForStageFrom = (rows: NormalizedRow[], stage: string) => {
  const out: string[] = [];
  rows.forEach((r) => {
    const leftIsStage = isStageType(r.type1Name);
    const rightIsStage = isStageType(r.type2Name);
    const leftIsStatus = isStatusType(r.type1Name);
    const rightIsStatus = isStatusType(r.type2Name);

    if (leftIsStage && toStr(r.value1Name).trim() === toStr(stage).trim() && rightIsStatus) {
      out.push(r.value2Name || "");
    }
    if (rightIsStage && toStr(r.value2Name).trim() === toStr(stage).trim() && leftIsStatus) {
      out.push(r.value1Name || "");
    }
  });
  return uniq(out);
};

/**
 * For given status, return remarks: from r.remarks array or pairs where other side is 'Remarks'.
 */
const remarksForStatusFrom = (rows: NormalizedRow[], status: string) => {
  const out: string[] = [];
  rows.forEach((r) => {
    const leftIsStatus = isStatusType(r.type1Name);
    const rightIsStatus = isStatusType(r.type2Name);
    const leftIsRemarks = isRemarksType(r.type1Name);
    const rightIsRemarks = isRemarksType(r.type2Name);

    // direct remarks array attached to row
    if (leftIsStatus && toStr(r.value1Name).trim() === toStr(status).trim() && Array.isArray(r.remarks) && r.remarks.length) {
      out.push(...r.remarks);
    }
    if (rightIsStatus && toStr(r.value2Name).trim() === toStr(status).trim() && Array.isArray(r.remarks) && r.remarks.length) {
      out.push(...r.remarks);
    }

    // status <-> remarks pair
    if (leftIsStatus && toStr(r.value1Name).trim() === toStr(status).trim() && rightIsRemarks) {
      out.push(r.value2Name || "");
    }
    if (rightIsStatus && toStr(r.value2Name).trim() === toStr(status).trim() && leftIsRemarks) {
      out.push(r.value1Name || "");
    }
  });
  return uniq(out);
};

/* ------------------ ColoredFollowupTypeSelect (unchanged) ------------------ */
type TypeOption = { value: string; Icon: any; color: string };

const TYPE_COLOR_TEXT: Record<string, string> = {
  blue: "text-blue-600",
  green: "text-green-600",
  indigo: "text-indigo-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
  gray: "text-gray-600",
};

const ColoredFollowupTypeSelect: React.FC<{
  options: readonly TypeOption[];
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}> = ({ options, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = options.find((o) => o.value === value) ?? options[0];
  const CurrentIcon = current.Icon;
  const colorClass = TYPE_COLOR_TEXT[current.color] || "text-gray-600";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-left flex items-center gap-2
                    focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? "opacity-60" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CurrentIcon size={18} className={colorClass} />
        <span className="flex-1">{current.value}</span>
        <svg viewBox="0 0 20 20" className="w-4 h-4">
          <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {options.map((opt) => {
            const Ico = opt.Icon;
            const optColor = TYPE_COLOR_TEXT[opt.color] || "text-gray-600";
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50
                            ${selected ? "bg-indigo-50" : ""}`}
              >
                <Ico size={18} className={optColor} />
                <span>{opt.value}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
ColoredFollowupTypeSelect.displayName = "ColoredFollowupTypeSelect";

/* ------------------------- Modal ------------------------- */
const BuyerFollowupModal: React.FC<Props> = ({ isOpen, onClose, onSave, tabId, buyerId, initialForm }) => {
  if (!isOpen) return null;

  const isEdit = Boolean(initialForm?.id);
  const [priorityOptions, setPriorityOptions] = useState<{ value: string; label: string }[]>([]);

  const [apiRows, setApiRows] = useState<NormalizedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableStages, setAvailableStages] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableRemarks, setAvailableRemarks] = useState<string[]>([]);

  const [form, setForm] = useState<FollowupForm>({
    followupType: FOLLOWUP_TYPES[0].value,
    buyerLeadStage: "",
    buyerLeadStatus: "",
    remark: "",
    customRemark: "",
    nextAction: "",
    scheduleDate: "",
    scheduleTime: "",
    priority: "Medium",
  });

  // fetch priorities
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const data = await getMasterDropdownOptions(["lead"]);
        if (data && data["lead priority"]) setPriorityOptions(data["lead priority"]);
      } catch (err) {
        console.error("Error fetching priorities", err);
      }
    })();
  }, [isOpen]);

  // fetch connected remarks and normalize + filter by tabId
  useEffect(() => {
    const load = async () => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const raw = (await connectedRemarkAPI.getRemarksByTabId(tabId)) as any;
        // raw might be array or object with data prop — try to find rows
        let rowsCandidate: any[] = [];
        if (Array.isArray(raw)) rowsCandidate = raw;
        else if (raw && Array.isArray(raw.data)) rowsCandidate = raw.data;
        else if (raw && Array.isArray(raw.rows)) rowsCandidate = raw.rows;
        else if (raw && raw.result && Array.isArray(raw.result)) rowsCandidate = raw.result;
        else if (raw && typeof raw === "object") {
          // sometimes API returns an object map of items
          rowsCandidate = Object.values(raw).flatMap((v) => (Array.isArray(v) ? v : []));
        }

        // If still empty, but raw looks like array-like, try using raw directly
        if (!rowsCandidate.length && raw && typeof raw === "object" && Object.keys(raw).length) {
          // fallback: try mapping top-level array-like keys
          // but keep it simple: if raw has properties that are objects containing master_type_1 etc, include them
          rowsCandidate = Array.isArray(raw) ? raw : [raw];
        }

        // normalize each row
        const normalized = rowsCandidate.map((r) => normalizeRow(r || {}));

        // filter by tabId (case-insensitive). If tabId param empty, don't filter.
        const wantedTab = (tabId || "").toString().trim().toLowerCase();
        const filtered = wantedTab
          ? normalized.filter((nr) => (nr.tabId || "").toString().trim().toLowerCase() === wantedTab)
          : normalized;

        // If nothing matched, as a fallback use normalized rows unfiltered (helps debug)
        const finalRows = filtered.length ? filtered : normalized;

        setApiRows(finalRows);

        // populate stages
        const stages = extractStages(finalRows);
        setAvailableStages(stages);

        // hydrate edit form if initialForm provided
        if (initialForm) {
          setForm({
            followupType: initialForm.followupType ?? FOLLOWUP_TYPES[0].value,
            buyerLeadStage: initialForm.buyerLeadStage ?? "",
            buyerLeadStatus: initialForm.buyerLeadStatus ?? "",
            remark: initialForm.remark ?? "",
            customRemark: initialForm.customRemark ?? "",
            nextAction: initialForm.nextAction ?? "",
            scheduleDate: initialForm.scheduleDate ?? "",
            scheduleTime: initialForm.scheduleTime ?? "",
            priority: initialForm.priority ?? "Medium",
          });

          if (initialForm.buyerLeadStage) {
            const sts = statusesForStageFrom(finalRows, initialForm.buyerLeadStage);
            setAvailableStatuses(sts);
            if (initialForm.buyerLeadStatus) {
              const rems = remarksForStatusFrom(finalRows, initialForm.buyerLeadStatus);
              setAvailableRemarks(rems);
            } else {
              setAvailableRemarks([]);
            }
          } else {
            setAvailableStatuses([]);
            setAvailableRemarks([]);
          }
        } else {
          // reset dependent lists for create mode
          setAvailableStatuses([]);
          setAvailableRemarks([]);
          setForm((f) => ({ ...f, followupType: FOLLOWUP_TYPES[0].value, priority: "Medium" }));
        }
      } catch (e) {
        console.error("Failed to load connected remarks:", e);
        setError("Failed to load follow-up options");
        setApiRows([]);
        setAvailableStages([]);
        setAvailableStatuses([]);
        setAvailableRemarks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tabId]);

  const handleChange =
    (key: keyof FollowupForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stage = e.target.value;
    const nextStatuses = stage ? statusesForStageFrom(apiRows, stage) : [];
    setAvailableStatuses(nextStatuses);
    setAvailableRemarks([]);
    setForm((f) => ({ ...f, buyerLeadStage: stage, buyerLeadStatus: "", remark: "", customRemark: "" }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    const nextRemarks = status ? remarksForStatusFrom(apiRows, status) : [];
    setAvailableRemarks(nextRemarks);
    setForm((f) => ({ ...f, buyerLeadStatus: status, remark: "", customRemark: "" }));
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const remark = e.target.value;
    setForm((f) => ({ ...f, remark, customRemark: remark ? `${remark} – ` : "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyerLeadStage) {
      alert("Please select a Buyer Lead Stage.");
      return;
    }
    if (!form.buyerLeadStatus) {
      alert("Please select a Buyer Lead Status.");
      return;
    }

    const payload: FollowupFormWithLead = {
      ...form,
      buyer_id: buyerId,
      ...(initialForm?.id ? { id: initialForm.id } : {}),
    };
    onSave(payload);
  };

  const selectedType =
    FOLLOWUP_TYPES.find((t) => t.value === form.followupType) || FOLLOWUP_TYPES[0];
  const ringColor =
    selectedType.color === "blue"
      ? "focus:ring-blue-500"
      : selectedType.color === "green"
      ? "focus:ring-green-500"
      : selectedType.color === "indigo"
      ? "focus:ring-indigo-500"
      : selectedType.color === "orange"
      ? "focus:ring-orange-500"
      : selectedType.color === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 m-4 max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text">
            {initialForm?.id ? "Edit Follow-up" : "Add New Follow-up"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Followup Type</label>
              <ColoredFollowupTypeSelect options={FOLLOWUP_TYPES} value={form.followupType} onChange={(v) => setForm((f) => ({ ...f, followupType: v }))} disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lead Priority</label>
              <select className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" value={form.priority} onChange={handleChange("priority")}>
                <option value="">Select Priority</option>
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Buyer Lead Stage</label>
              <select className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${ringColor}`} value={form.buyerLeadStage} onChange={handleStageChange} disabled={loading || availableStages.length === 0}>
                <option value="">{loading ? "Loading..." : "Select stage…"}</option>
                {availableStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Buyer Lead Status</label>
              <select className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.buyerLeadStatus} onChange={handleStatusChange} disabled={loading || !form.buyerLeadStage || availableStatuses.length === 0}>
                <option value="">{form.buyerLeadStage ? "Select status…" : "Select stage first"}</option>
                {availableStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <select className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.remark} onChange={handleRemarkChange} disabled={loading || !form.buyerLeadStatus || availableRemarks.length === 0}>
                <option value="">{form.buyerLeadStatus ? "Select remark…" : "Select status first"}</option>
                {availableRemarks.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Custom Remark</label>
            <textarea className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Select a remark above or type your own details…" value={form.customRemark} onChange={handleChange("customRemark")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Next Action</label>
            <input type="text" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Enter next action..." value={form.nextAction} onChange={handleChange("nextAction")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
              {(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const minDate = tomorrow.toISOString().split("T")[0];
                return <input type="date" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" value={form.scheduleDate} onChange={handleChange("scheduleDate")} min={minDate} />;
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
              <input type="time" className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.scheduleTime} onChange={handleChange("scheduleTime")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 transition-colors" disabled={loading}>
              {initialForm?.id ? "Update Follow-up" : "Save Follow-up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerFollowupModal;
