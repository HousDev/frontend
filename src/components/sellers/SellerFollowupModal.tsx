// src/components/SellerFollowupModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Users, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { connectedRemarkAPI } from "@/lib/connectedRemarkAPI";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { useAuth } from "@/contexts/AuthContext";

/* ===================== Types ===================== */
export type FollowupForm = {
  followupType: string;
  sellerLeadStage: string;
  sellerLeadStatus: string;
  remark: string;
  customRemark: string;
  nextAction: string;
  scheduleDate: string; // yyyy-mm-dd
  scheduleTime: string; // HH:MM
  priority: string;
};

/** Legacy shape kept for backwards compatibility (not used in payload anymore) */
export type FollowupFormWithLead = FollowupForm & {
  lead_id: string | number; // legacy, no longer sent
  id?: string | number;
  created_by?: string | number;
  created_at?: string;
  updated_by?: string | number;
  updated_at?: string;
};

/** ✅ Payload we actually send to backend */
export type SellerFollowupPayload = FollowupForm & {
  seller_id: string | number;
  reminder: number; // default 0
  assigned_executive?: string | number; // current user's executive id (fallback: user id)
  id?: string | number;
  created_by?: string | number;
  created_at?: string;
  updated_by?: string | number;
  updated_at?: string;
};

/**
 * NOTE: We accept both leadId and sellerId for compatibility.
 * Prefer leadId if provided, else fall back to sellerId — and send it as seller_id.
 */
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SellerFollowupPayload) => void; // ✅ send new payload
  tabId: string;
  leadId?: string | number | null;
  sellerId?: string | number | null;

  /** Optional: pass this when editing an existing follow-up (camel or snake keys allowed) */
  initialForm?: Partial<FollowupFormWithLead> & Record<string, any>;
};

export const FOLLOWUP_TYPES = [
  { value: "Phone Call", Icon: Phone, color: "blue" },
  { value: "WhatsApp", Icon: FaWhatsapp, color: "green" },
  { value: "Email", Icon: Mail, color: "indigo" },
  { value: "Site Visit", Icon: MapPin, color: "orange" },
  { value: "Meeting", Icon: Users, color: "purple" },
  { value: "Other", Icon: MessageSquare, color: "gray" },
] as const;

/* ===================== Utils (parse/format) ===================== */
const toStr = (v: any) => (v === null || v === undefined ? "" : String(v));
const normKey = (s?: string) => toStr(s).toLowerCase().replace(/\s+/g, "");
const includesKey = (hay?: string, needle?: string) => normKey(hay).includes(normKey(needle));

function parseSqlish(val?: string | null): Date | null {
  if (!val) return null;
  const s = val.trim();

  // ISO-like
  if (/\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  // "YYYY-MM-DD HH:mm[:ss]"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const [datePart, timePart] = s.split(/\s+/);
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh, mm, ssRaw] = timePart.split(":").map(Number);
    const ss = Number.isFinite(ssRaw) ? ssRaw : 0;
    return new Date(y, m - 1, d, hh, mm, ss);
  }
  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0);
  }
  // "HH:mm[:ss]" => today + time
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const [hh, mm, ssRaw] = s.split(":").map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, Number.isFinite(ssRaw) ? ssRaw : 0);
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function toSqlDateYYYYMMDD(d: Date | null): string {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function toSqlTimeHHmm(d: Date | null): string {
  if (!d) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
}

/* ===================== Connected-remarks normalizer ===================== */
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
  !!typeName &&
  (includesKey(typeName, "sellerleadstage") || includesKey(typeName, "leadstage") || includesKey(typeName, "stage"));
const isStatusType = (typeName?: string) =>
  !!typeName &&
  (includesKey(typeName, "sellerleadstatus") || includesKey(typeName, "leadstatus") || includesKey(typeName, "status"));
const isRemarksType = (typeName?: string) =>
  !!typeName && (includesKey(typeName, "remark") || includesKey(typeName, "remarks"));
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

    if (leftIsStage && toStr(r.value1Name).trim() === toStr(stage).trim() && rightIsStatus) out.push(r.value2Name || "");
    if (rightIsStage && toStr(r.value2Name).trim() === toStr(stage).trim() && leftIsStatus) out.push(r.value1Name || "");
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

    if (leftIsStatus && toStr(r.value1Name).trim() === toStr(status).trim() && rightIsRemarks) out.push(r.value2Name || "");
    if (rightIsStatus && toStr(r.value2Name).trim() === toStr(status).trim() && leftIsRemarks) out.push(r.value1Name || "");
  });
  return uniq(out);
};

/* -------- colored custom dropdown for Followup Type -------- */
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
        <div role="listbox" className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
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
                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 ${selected ? "bg-indigo-50" : ""}`}
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

/* ===================== Modal ===================== */
const SellerFollowupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  tabId,
  leadId,
  sellerId,
  initialForm,
}) => {
  if (!isOpen) return null;

  const { user } = useAuth();

  // ---- helpers to safely derive user/executive ids (tolerant to different shapes)
  const pickFirst = <T,>(...vals: T[]) => vals.find((v) => v !== undefined && v !== null && v !== "") as T | undefined;
  const getCurrentUserId = (u: any) =>
    pickFirst(u?.id, u?.user_id, u?._id, u?.profile?.id, u?.employee_id, u?.uid, u?.auth_id);
  const getCurrentExecutiveId = (u: any) =>
    pickFirst(u?.executive_id, u?.employee_id, u?.profile?.executive_id, u?.currentExecutiveId, u?.agent_id);

  const currentUserId = getCurrentUserId(user);
  const currentExecutiveId = getCurrentExecutiveId(user) ?? currentUserId;

  // Prefer explicit leadId, otherwise accept sellerId (caller compatibility)
  const effectiveIdRaw = leadId ?? sellerId ?? "";
  // Keep as string if not number (support UUID)
  const effectiveSellerId: string | number =
    typeof effectiveIdRaw === "number" ? effectiveIdRaw : String(effectiveIdRaw || "").trim();

  const isEdit = Boolean(initialForm?.id);

  const [priorityOptions, setPriorityOptions] = useState<MasterOption[]>([]);
  const [mastersLoading, setMastersLoading] = useState(false);

  const [apiRows, setApiRows] = useState<NormalizedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options
  const [availableStages, setAvailableStages] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableRemarks, setAvailableRemarks] = useState<string[]>([]);

  // ----- read from initialForm with snake/camel fallback + date/time normalization
  const readInit = (keyCamel: string, keySnake: string) => {
    if (!initialForm) return undefined as any;
    return (initialForm as any)[keyCamel] ?? (initialForm as any)[keySnake];
  };

  // allow also: followup_date, followup_time, schedule_date, schedule_time, combined ISO/datetime
  const resolveScheduleDate = (): string => {
    const dateRaw =
      readInit("scheduleDate", "schedule_date") ??
      readInit("followup_date", "followup_date") ??
      readInit("date", "date");
    const timeRaw =
      readInit("scheduleTime", "schedule_time") ??
      readInit("followup_time", "followup_time") ??
      readInit("time", "time");

    // If we got combined field (ISO or "YYYY-MM-DD HH:mm:ss")
    const combined = readInit("scheduleDateTime", "schedule_datetime") ?? readInit("datetime", "date_time");
    const d1 = parseSqlish(dateRaw);
    const d2 = parseSqlish(combined);
    // If no date but have time, keep date empty (user can pick)
    return toSqlDateYYYYMMDD(d1 || d2);
  };
  const resolveScheduleTime = (): string => {
    const timeRaw =
      readInit("scheduleTime", "schedule_time") ??
      readInit("followup_time", "followup_time") ??
      readInit("time", "time");
    const dateRaw =
      readInit("scheduleDate", "schedule_date") ??
      readInit("followup_date", "followup_date") ??
      readInit("date", "date");
    const combined = readInit("scheduleDateTime", "schedule_datetime") ?? readInit("datetime", "date_time");

    const t = parseSqlish(timeRaw) || parseSqlish(combined) || parseSqlish(dateRaw);
    return toSqlTimeHHmm(t);
  };

  // Form state (seed with initialForm if present)
  const [form, setForm] = useState<FollowupForm>(() => ({
    followupType: (readInit("followupType", "followup_type") as string) || FOLLOWUP_TYPES[0].value,
    sellerLeadStage:
      (readInit("sellerLeadStage", "seller_lead_stage") as string) ||
      (readInit("buyerLeadStage", "buyer_lead_stage") as string) || // tolerance
      "",
    sellerLeadStatus:
      (readInit("sellerLeadStatus", "seller_lead_status") as string) ||
      (readInit("buyerLeadStatus", "buyer_lead_status") as string) || // tolerance
      "",
    remark: (readInit("remark", "remark") as string) || "",
    customRemark:
      (readInit("customRemark", "custom_remark") as string) ||
      (readInit("notes", "notes") as string) ||
      "",
    nextAction: (readInit("nextAction", "next_action") as string) || "",
    scheduleDate: resolveScheduleDate(),
    scheduleTime: resolveScheduleTime(),
    priority: (readInit("priority", "priority") as string) || "",
  }));

  /* --------- Master: Lead Priority (from 'lead' → "Lead Priority") --------- */
  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        setMastersLoading(true);
        const data = await getMasterDropdownOptions(["lead"]);
        const common: any = (data as any)?.common ?? data ?? {};
        const opts: MasterOption[] =
          common["Lead Priority"] ||
          common["lead priority"] ||
          (Array.isArray((data as any)["Lead Priority"]) ? (data as any)["Lead Priority"] : []) ||
          [];

        setPriorityOptions(Array.isArray(opts) ? opts : []);

        // Only set default if creating (no initial priority) and no value chosen yet
        if (!isEdit && !initialForm?.priority && !form.priority && Array.isArray(opts) && opts.length) {
          setForm((f) => ({ ...f, priority: opts[0].value }));
        }
      } catch (err) {
        console.error("❌ Error fetching Lead Priority (masters/common):", err);
        setPriorityOptions([]);
      } finally {
        setMastersLoading(false);
      }
    };

    if (isOpen) fetchPriorities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* --------- Load connected remarks mapping on open --------- */
  useEffect(() => {
    const load = async () => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const raw = (await connectedRemarkAPI.getRemarksByTabId(tabId)) as any;

        let candidates: any[] = [];
        if (Array.isArray(raw)) candidates = raw;
        else if (raw?.data && Array.isArray(raw.data)) candidates = raw.data;
        else if (raw?.rows && Array.isArray(raw.rows)) candidates = raw.rows;
        else if (raw?.result && Array.isArray(raw.result)) candidates = raw.result;
        else if (raw && typeof raw === "object") {
          candidates = Object.values(raw).flatMap((v) => (Array.isArray(v) ? v : []));
        }
        if (!candidates.length && raw && typeof raw === "object" && Object.keys(raw).length) {
          candidates = Array.isArray(raw) ? raw : [raw];
        }

        const normalized = candidates.map((r) => normalizeRow(r || {}));

        const wantedTab = (tabId || "").toString().trim().toLowerCase();
        const filtered = wantedTab
          ? normalized.filter((nr) => (nr.tabId || "").toString().trim().toLowerCase() === wantedTab)
          : normalized;
        const finalRows = filtered.length ? filtered : normalized;

        setApiRows(finalRows);

        const stages = extractStages(finalRows);
        setAvailableStages(stages);
      } catch (e) {
        console.error("Failed to load follow-up options:", e);
        setError("Failed to load follow-up options.");
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

  /* --------- Hydrate Status/Remarks for edit AFTER apiRows arrive --------- */
  useEffect(() => {
    if (!isOpen) return;

    const stageVal =
      (readInit("sellerLeadStage", "seller_lead_stage") as string) ||
      (readInit("buyerLeadStage", "buyer_lead_stage") as string) ||
      form.sellerLeadStage ||
      "";

    if (apiRows.length && stageVal) {
      const sts = statusesForStageFrom(apiRows, stageVal);
      setAvailableStatuses(sts);

      const statusVal =
        (readInit("sellerLeadStatus", "seller_lead_status") as string) ||
        (readInit("buyerLeadStatus", "buyer_lead_status") as string) ||
        form.sellerLeadStatus ||
        "";

      if (statusVal) {
        const rems = remarksForStatusFrom(apiRows, statusVal);
        setAvailableRemarks(rems);
      } else {
        setAvailableRemarks([]);
      }
    } else {
      setAvailableStatuses([]);
      setAvailableRemarks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, apiRows]);

  /* --------- Resync basic form values when reopening / switching record --------- */
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      followupType: (readInit("followupType", "followup_type") as string) || FOLLOWUP_TYPES[0].value,
      sellerLeadStage:
        (readInit("sellerLeadStage", "seller_lead_stage") as string) ||
        (readInit("buyerLeadStage", "buyer_lead_stage") as string) ||
        "",
      sellerLeadStatus:
        (readInit("sellerLeadStatus", "seller_lead_status") as string) ||
        (readInit("buyerLeadStatus", "buyer_lead_status") as string) ||
        "",
      remark: (readInit("remark", "remark") as string) || "",
      customRemark: (readInit("customRemark", "custom_remark") as string) || (readInit("notes", "notes") as string) || "",
      nextAction: (readInit("nextAction", "next_action") as string) || "",
      scheduleDate: resolveScheduleDate(),
      scheduleTime: resolveScheduleTime(),
      priority:
        (readInit("priority", "priority") as string) ||
        // Keep existing selection; if creating and empty, a later effect may default to master[0]
        "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialForm]);

  /* --------- Handlers --------- */
  const handleChange =
    (key: keyof FollowupForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stage = e.target.value;
    const nextStatuses = stage ? statusesForStageFrom(apiRows, stage) : [];
    setAvailableStatuses(nextStatuses);
    setAvailableRemarks([]);

    setForm((f) => ({
      ...f,
      sellerLeadStage: stage,
      sellerLeadStatus: "",
      remark: "",
      customRemark: "",
    }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    const nextRemarks = status ? remarksForStatusFrom(apiRows, status) : [];
    setAvailableRemarks(nextRemarks);

    setForm((f) => ({
      ...f,
      sellerLeadStatus: status,
      remark: "",
      customRemark: "",
    }));
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const remark = e.target.value;
    setForm((f) => ({
      ...f,
      remark,
      customRemark: remark ? `${remark} – ` : "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sellerLeadStage) {
      alert("Please select a Seller Lead Stage.");
      return;
    }
    if (!form.sellerLeadStatus) {
      alert("Please select a Seller Lead Status.");
      return;
    }
    if (!effectiveSellerId) {
      alert("Missing seller id. Cannot save follow-up without reference.");
      return;
    }

    const nowIso = new Date().toISOString();

    const payload: SellerFollowupPayload = {
      ...form,
      seller_id: effectiveSellerId,               // ✅ send as seller_id
      reminder: 0,                                // ✅ default reminder
      assigned_executive: currentExecutiveId,     // ✅ current user's executive id (fallback to user id)
      ...(initialForm?.id ? { id: initialForm.id } : {}),
      created_by: initialForm?.created_by ?? currentUserId, // keep existing on edit, else set
      created_at: initialForm?.created_at ?? nowIso,        // keep existing on edit, else now
      updated_by: currentUserId,
      updated_at: nowIso,
    };

    // Safety: strip legacy lead_id if any
    (payload as any).lead_id && delete (payload as any).lead_id;

    onSave(payload);
   
  };

  /* --------- UI helpers --------- */
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

  // Date min: allow past when editing; else min today
  const todayStr = new Date().toISOString().split("T")[0];
  const dateMin = isEdit ? undefined : todayStr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-5 m-4 max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text">
            {isEdit ? "Edit Seller Follow-up" : "Add Seller New Follow-up"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Followup Type</label>
              <ColoredFollowupTypeSelect
                options={FOLLOWUP_TYPES as unknown as TypeOption[]}
                value={form.followupType}
                onChange={(v) => setForm((f) => ({ ...f, followupType: v }))}
                disabled={loading}
              />
            </div>

            {/* Priority from masters/common/"Lead Priority" */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Lead Priority</label>
              <select
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={form.priority}
                onChange={handleChange("priority")}
                disabled={mastersLoading || (priorityOptions.length === 0 && !form.priority)}
              >
                <option value="">{mastersLoading ? "Loading..." : "Select Priority"}</option>
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                {/* Ensure the existing value is selectable even if not in masters */}
                {!mastersLoading &&
                  form.priority &&
                  !priorityOptions.find((o) => o.value === form.priority) && (
                    <option value={form.priority}>{form.priority}</option>
                  )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Seller Lead Stage</label>
              <select
                className={`mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${ringColor}`}
                value={form.sellerLeadStage}
                onChange={handleStageChange}
                disabled={loading || (availableStages.length === 0 && !form.sellerLeadStage)}
              >
                <option value="">{loading ? "Loading..." : "Select stage…"}</option>
                {/* Keep current value even if not present in masters */}
                {form.sellerLeadStage && !availableStages.includes(form.sellerLeadStage) && (
                  <option value={form.sellerLeadStage}>{form.sellerLeadStage}</option>
                )}
                {availableStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Seller Lead Status</label>
              <select
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.sellerLeadStatus}
                onChange={handleStatusChange}
                disabled={
                  loading ||
                  !form.sellerLeadStage ||
                  (availableStatuses.length === 0 && !form.sellerLeadStatus)
                }
              >
                <option value="">{form.sellerLeadStage ? "Select status…" : "Select stage first"}</option>
                {/* Keep current value even if not present in derived statuses */}
                {form.sellerLeadStatus &&
                  !availableStatuses.includes(form.sellerLeadStatus) && (
                    <option value={form.sellerLeadStatus}>{form.sellerLeadStatus}</option>
                  )}
                {availableStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <select
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.remark}
                onChange={handleRemarkChange}
                disabled={
                  loading ||
                  !form.sellerLeadStatus ||
                  (availableRemarks.length === 0 && !form.remark)
                }
              >
                <option value="">{form.sellerLeadStatus ? "Select remark…" : "Select status first"}</option>
                {/* Keep current value even if not present in derived remarks */}
                {form.remark && !availableRemarks.includes(form.remark) && (
                  <option value={form.remark}>{form.remark}</option>
                )}
                {availableRemarks.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Custom Remark</label>
            <textarea
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Select a remark above or type your own details…"
              value={form.customRemark}
              onChange={handleChange("customRemark")}
            />
          </div>

          {/* Next Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Next Action</label>
            <input
              type="text"
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter next action..."
              value={form.nextAction}
              onChange={handleChange("nextAction")}
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={form.scheduleDate}
                onChange={handleChange("scheduleDate")}
                min={dateMin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
              <input
                type="time"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={form.scheduleTime}
                onChange={handleChange("scheduleTime")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 transition-colors"
              disabled={loading}
            >
              {isEdit ? "Update Follow-up" : "Save Follow-up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerFollowupModal;
