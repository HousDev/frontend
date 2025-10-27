// src/components/BuyerFollowupModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Users, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
import { getMasterDropdownOptions } from "@/lib/useMasterData";
import { useAuth } from "@/contexts/AuthContext";
import { buyerFollowupAPI } from "@/lib/buyerFollowupAPI";

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
  buyer_id?: string;
};

export type FollowupFormWithBuyer = FollowupForm & {
  buyer_id: string;
  id?: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
};

type NormalizedRow = {
  id?: string | number;
  tabId?: string;
  type1Name?: string;
  value1Name?: string;
  type2Name?: string;
  value2Name?: string;
  remarks?: string[];
  raw?: any;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void; // optional callback, receives server response
  tabId: string;
  buyerId: string | number | null; // allow number or string or null
  initialForm?: Partial<any>;
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

const normalizeRow = (r: any): NormalizedRow => {
  const pick = (keys: string[]) => {
    for (const k of keys) {
      if (r && typeof r[k] !== "undefined") return r[k];
    }
    return undefined;
  };

  const type1Name =
    pick([
      "type1Name",
      "type1_name",
      "type1",
      "masterType1",
      "master_type_1",
      "master_type1",
      "masterType1Name",
    ]) ?? pick(["masterType1", "master_type_1", "master_type1"]) ?? pick(["master_type_1", "master_type_1_name"]) ?? pick(["master_type_1"]);

  const value1Name =
    pick(["value1Name", "value1_name", "value1", "masterValue1", "master_value_1", "master_value1"]) ?? pick(["master_value_1"]);

  const type2Name =
    pick(["type2Name", "type2_name", "type2", "masterType2", "master_type_2", "master_type2"]) ?? pick(["master_type_2"]);

  const value2Name =
    pick(["value2Name", "value2_name", "value2", "masterValue2", "master_value_2", "master_value2"]) ?? pick(["master_value_2"]);

  const tabId =
    pick(["masterTabId", "master_tab_id", "master_tab", "tabId", "tab_id"]) ?? pick(["mastertabid", "master_tab"]);

  let remarksRaw = pick(["remarks", "remark", "remarks_list", "masterRemarks", "master_remarks"]) ?? undefined;
  let remarksArr: string[] = [];
  if (Array.isArray(remarksRaw)) {
    remarksArr = remarksRaw.map((x: any) => toStr(x).trim()).filter(Boolean);
  } else if (typeof remarksRaw === "string" && remarksRaw.trim()) {
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

const isStageType = (typeName?: string) =>
  !!typeName && (includesKey(typeName, "leadstage") || includesKey(typeName, "stage") || includesKey(typeName, "lead stage"));
const isStatusType = (typeName?: string) => !!typeName && (includesKey(typeName, "leadstatus") || includesKey(typeName, "status"));
const isRemarksType = (typeName?: string) => !!typeName && (includesKey(typeName, "remark") || includesKey(typeName, "remarks"));

const extractStages = (rows: NormalizedRow[]) => {
  const vals: string[] = [];
  rows.forEach((r) => {
    if (isStageType(r.type1Name)) vals.push(r.value1Name || "");
    if (isStageType(r.type2Name)) vals.push(r.value2Name || "");
  });
  return uniq(vals);
};

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

const remarksForStatusFrom = (rows: NormalizedRow[], status: string) => {
  const out: string[] = [];
  rows.forEach((r) => {
    const leftIsStatus = isStatusType(r.type1Name);
    const rightIsStatus = isStatusType(r.type2Name);
    const leftIsRemarks = isRemarksType(r.type1Name);
    const rightIsRemarks = isRemarksType(r.type2Name);

    if (leftIsStatus && toStr(r.value1Name).trim() === toStr(status).trim() && Array.isArray(r.remarks) && r.remarks.length) {
      out.push(...r.remarks);
    }
    if (rightIsStatus && toStr(r.value2Name).trim() === toStr(status).trim() && Array.isArray(r.remarks) && r.remarks.length) {
      out.push(...r.remarks);
    }

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
  // debug: show prop
  console.debug("BuyerFollowupModal open:", isOpen, "prop buyerId:", buyerId);

  if (!isOpen) return null;
  const isEdit = Boolean(initialForm?.id);
  const [priorityOptions, setPriorityOptions] = useState<{ value: string; label: string }[]>([]);

  const [apiRows, setApiRows] = useState<NormalizedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableStages, setAvailableStages] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableRemarks, setAvailableRemarks] = useState<string[]>([]);
  const { user } = useAuth();

  // tolerant user id getter (works with common user shapes)
  const currentUserId = user?.id;

  // Initialize form and ensure buyer_id is set (coerce to string)
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
    buyer_id: buyerId ? String(buyerId) : "",
  });

  // keep buyer_id in sync if prop changes (defensive)
  useEffect(() => {
    if (buyerId !== undefined && buyerId !== null) {
      setForm((f) => ({ ...f, buyer_id: String(buyerId) }));
      console.debug("Synced buyerId into form:", buyerId);
    }
    // when modal opens and buyerId not available, we don't override form so edit flows keep their values
  }, [buyerId]);

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

  // helper: read either snake_case or camelCase from initialForm
  const readInit = (keyCamel: string, keySnake: string) => {
    if (!initialForm) return undefined;
    // @ts-ignore
    return (initialForm as any)[keyCamel] ?? (initialForm as any)[keySnake];
  };

  // fetch connected remarks and normalize + filter by tabId
  useEffect(() => {
    const load = async () => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const raw = (await connectedRemarkAPI.getRemarksByTabId(tabId)) as any;
        let rowsCandidate: any[] = [];
        if (Array.isArray(raw)) rowsCandidate = raw;
        else if (raw && Array.isArray(raw.data)) rowsCandidate = raw.data;
        else if (raw && Array.isArray(raw.rows)) rowsCandidate = raw.rows;
        else if (raw && raw.result && Array.isArray(raw.result)) rowsCandidate = raw.result;
        else if (raw && typeof raw === "object") {
          rowsCandidate = Object.values(raw).flatMap((v) => (Array.isArray(v) ? v : []));
        }

        if (!rowsCandidate.length && raw && typeof raw === "object" && Object.keys(raw).length) {
          rowsCandidate = Array.isArray(raw) ? raw : [raw];
        }

        const normalized = rowsCandidate.map((r) => normalizeRow(r || {}));
        const wantedTab = (tabId || "").toString().trim().toLowerCase();
        const filtered = wantedTab ? normalized.filter((nr) => (nr.tabId || "").toString().trim().toLowerCase() === wantedTab) : normalized;
        const finalRows = filtered.length ? filtered : normalized;

        setApiRows(finalRows);

        const stages = extractStages(finalRows);
        setAvailableStages(stages);

        // hydrate edit form if initialForm provided (accept both camelCase & snake_case)
        if (initialForm) {
          setForm((f) => ({
            ...f,
            followupType: (readInit("followupType", "followup_type") as string) ?? f.followupType,
            buyerLeadStage: (readInit("buyerLeadStage", "buyer_lead_stage") as string) ?? f.buyerLeadStage,
            buyerLeadStatus: (readInit("buyerLeadStatus", "buyer_lead_status") as string) ?? f.buyerLeadStatus,
            remark: (readInit("remark", "remark") as string) ?? f.remark,
            customRemark: (readInit("customRemark", "custom_remark") as string) ?? f.customRemark,
            nextAction: (readInit("nextAction", "next_action") as string) ?? f.nextAction,
            scheduleDate: (readInit("scheduleDate", "schedule_date") as string) ?? f.scheduleDate,
            scheduleTime: (readInit("scheduleTime", "schedule_time") as string) ?? f.scheduleTime,
            priority: (readInit("priority", "priority") as string) ?? f.priority,
            buyer_id: (readInit("buyer_id", "buyer_id") as any) ? String(readInit("buyer_id", "buyer_id")) : f.buyer_id,
          }));

          const stageVal = (readInit("buyerLeadStage", "buyer_lead_stage") as string) ?? "";
          if (stageVal) {
            const sts = statusesForStageFrom(finalRows, stageVal);
            setAvailableStatuses(sts);
            const statusVal = (readInit("buyerLeadStatus", "buyer_lead_status") as string) ?? "";
            if (statusVal) {
              const rems = remarksForStatusFrom(finalRows, statusVal);
              setAvailableRemarks(rems);
            } else {
              setAvailableRemarks([]);
            }
          } else {
            setAvailableStatuses([]);
            setAvailableRemarks([]);
          }
        } else {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.buyerLeadStage) {
      alert("Please select a Buyer Lead Stage.");
      return;
    }
    if (!form.buyerLeadStatus) {
      alert("Please select a Buyer Lead Status.");
      return;
    }

    // RESOLVE buyer id robustly
    const resolvedBuyerId = form.buyer_id ?? (buyerId !== undefined && buyerId !== null ? String(buyerId) : "");
    console.debug("Submitting follow-up. prop buyerId:", buyerId, "form.buyer_id:", form.buyer_id, "resolvedBuyerId:", resolvedBuyerId);

    if (!resolvedBuyerId) {
      alert("Missing buyer id. Cannot save follow-up without buyer reference.");
      console.error("Missing buyer id when submitting follow-up. form:", form, "prop buyerId:", buyerId);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();

      // determine created_by/created_at from initialForm (snake or camel) when editing
      const initial_created_by = readInit("created_by", "created_by") ?? readInit("createdBy", "created_by");
      const initial_created_at = readInit("created_at", "created_at") ?? readInit("createdAt", "created_at");

      const created_by = initialForm?.id ? (initial_created_by as string) ?? undefined : currentUserId || undefined;
      const created_at = initialForm?.id ? (initial_created_at as string) ?? undefined : now;

      const updated_by = currentUserId || undefined;
      const updated_at = now;

      // Build payload using snake_case keys you requested
      // try numeric conversion but fallback to string if NaN
      const numericBuyerId = Number(resolvedBuyerId);
      const buyerPayloadId = Number.isFinite(numericBuyerId) && numericBuyerId !== 0 ? numericBuyerId : resolvedBuyerId;

      const payload: any = {
        // core
        buyer_id: buyerPayloadId,
        followup_type: form.followupType,
        buyer_lead_stage: form.buyerLeadStage,
        buyer_lead_status: form.buyerLeadStatus,
        remark: form.remark,
        custom_remark: form.customRemark,
        next_action: form.nextAction,
        priority: form.priority,

        // schedule
        schedule_date: form.scheduleDate,
        schedule_time: form.scheduleTime,

        // audit
        ...(created_by ? { created_by } : {}),
        ...(created_at ? { created_at } : {}),
        ...(updated_by ? { updated_by } : {}),
        ...(updated_at ? { updated_at } : {}),
      };

      // include id for edit flows so caller can pass it to PUT endpoint if needed
      if (initialForm?.id) payload.id = initialForm.id;

      // LOG payload for debugging BEFORE API call
 

      // Call API: create or update
      let resp: any = null;
      if (initialForm?.id) {
        // update
        resp = await buyerFollowupAPI.update(String(initialForm.id), payload);
      } else {
        // create
        resp = await buyerFollowupAPI.create(payload);
      }

      // call optional parent callback with server response (if provided)
      if (onSave) onSave(resp);

      // close modal on success
      onClose();
    } catch (err: any) {
      console.error("Save follow-up failed:", err);
      // If buyerFollowupAPI throws Error with message, show it; otherwise fallback
      setError(err?.message ?? "Failed to save follow-up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = FOLLOWUP_TYPES.find((t) => t.value === form.followupType) || FOLLOWUP_TYPES[0];
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
            {initialForm?.id ? "Edit Buyer Follow-up" : "Add Buyer New Follow-up"}
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
                return (
                  <input
                    type="date"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={form.scheduleDate}
                    onChange={handleChange("scheduleDate")}
                    min={minDate}
                  />
                );
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
              {initialForm?.id ? (loading ? "Updating..." : "Update Follow-up") : (loading ? "Saving..." : "Save Follow-up")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerFollowupModal;
