// frontend/src/pages/settings/master/MastersAdmin.tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Import,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
  Pencil,
  Check,
  Layers,
  CheckSquare,
  Square,
  Sparkles,
  Clock,
  Mail,
  MessageCircle,
  Send,
  FileCode,
  FileJson,
  AlertTriangle,
} from "lucide-react";
import type {
  Entity,
  FollowUpType,
  MasterData,
  Outcome,
  Priority,
  Reason,
  NextAction,
  Rule,
  SequenceStep,
  Stage,
  Status,
} from "@/lib/types";
import { upsertMaster, updateMaster, deleteMaster } from "@/lib/engine";
import {
  exportTabToExcel,
  exportAllModulesToExcel,
  exportTabToJSON,
  exportAllModulesToJSON,
  downloadSampleExcelTemplate,
  downloadSampleJSONTemplate,
  importExcelOrFile,
  downloadModuleBackup,
  importModuleBackup,
  validateModuleBackup,
  exportSequenceBackup,
  downloadSequenceBackup,
  deleteSequenceByName,
} from "@/lib/backup";
import { availableIconNames, getIcon } from "@/lib/icons";
import "./mastersAdmin.css";

type Props = { master: MasterData; onChanged: () => void };

type TabKey =
  | "rules"
  | "sequences"
  | "entities"
  | "types"
  | "stages"
  | "statuses"
  | "outcomes"
  | "reasons"
  | "actions"
  | "priorities";

const tabs: { key: TabKey; label: string }[] = [
  { key: "rules", label: "Rules" },
  { key: "sequences", label: "Sequences" },
  { key: "entities", label: "Entities" },
  { key: "types", label: "Follow-up Types" },
  { key: "stages", label: "Stages" },
  { key: "statuses", label: "Statuses" },
  { key: "outcomes", label: "Outcomes" },
  { key: "reasons", label: "Reasons" },
  { key: "actions", label: "Next Actions" },
  { key: "priorities", label: "Priorities" },
];

const tableMap: Record<TabKey, string> = {
  rules: "fu_rules",
  sequences: "fu_sequences",
  entities: "fu_entities",
  types: "fu_follow_up_types",
  stages: "fu_stages",
  statuses: "fu_statuses",
  outcomes: "fu_outcomes",
  reasons: "fu_reasons",
  actions: "fu_next_actions",
  priorities: "fu_priorities",
};

const singularMap: Record<TabKey, string> = {
  rules: "Rule",
  sequences: "Sequence Step",
  entities: "Entity",
  types: "Follow-up Type",
  stages: "Stage",
  statuses: "Status",
  outcomes: "Outcome",
  reasons: "Reason",
  actions: "Next Action",
  priorities: "Priority",
};

export const DEFAULT_RULE_ENTITIES = [
  { code: "LEAD", name: "Lead" },
  { code: "BUYER", name: "Buyer" },
  { code: "SELLER", name: "Seller" },
];

export const DEFAULT_RULE_FOLLOW_UP_TYPES = [
  { code: "CALL", name: "Phone Call" },
  { code: "WHATSAPP", name: "WhatsApp" },
  { code: "EMAIL", name: "Email" },
  { code: "VISIT", name: "Site Visit" },
  { code: "SITE_VISIT", name: "Site Visit" },
  { code: "MEETING", name: "Meeting" },
  { code: "VIDEO", name: "Video Call" },
  { code: "VIDEO_CALL", name: "Video Call" },
  { code: "OTHER", name: "Other" },
];

export const DEFAULT_RULE_STAGES = [
  { code: "NEW", name: "New" },
  { code: "INITIAL_CONTACT", name: "Initial Contact" },
  { code: "CONNECTED", name: "Connected" },
  { code: "REQUIREMENT_QUALIFIED", name: "Requirement Qualified" },
  { code: "PROPERTY_SHARED", name: "Property Shared" },
  { code: "SITE_VISIT_SCHEDULED", name: "Site Visit Scheduled" },
  { code: "SITE_VISIT_COMPLETED", name: "Site Visit Completed" },
  { code: "NEGOTIATION", name: "Negotiation" },
  { code: "BOOKING_DISCUSSION", name: "Booking Discussion" },
  { code: "CONVERTED", name: "Converted" },
  { code: "LOST", name: "Lost" },
  { code: "CLOSED", name: "Closed" },
];

export const DEFAULT_RULE_STATUSES = [
  { code: "IN_PROGRESS", name: "In Progress" },
  { code: "QUALIFIED", name: "Qualified" },
  { code: "UNQUALIFIED", name: "Unqualified" },
  { code: "NOT_CONNECTED", name: "Not Connected" },
  { code: "ON_HOLD", name: "On Hold" },
  { code: "CONVERTED", name: "Converted" },
  { code: "LOST", name: "Lost" },
  { code: "CLOSED", name: "Closed" },
];

export const DEFAULT_RULE_OUTCOMES = [
  { code: "CONNECTED", name: "Connected" },
  { code: "NO_ANSWER", name: "No Answer" },
  { code: "BUSY", name: "Busy" },
  { code: "SWITCHED_OFF", name: "Switched Off" },
  { code: "OUT_OF_NETWORK", name: "Out of Network" },
  { code: "CALL_DISCONNECTED", name: "Call Disconnected" },
  { code: "CALL_BACK_REQUESTED", name: "Call Back Requested" },
  { code: "INTERESTED", name: "Interested" },
  { code: "NOT_INTERESTED", name: "Not Interested" },
];

export function mergeOptions<T extends { code: string; name: string }>(
  dbItems: T[],
  defaultItems: { code: string; name: string }[],
): { code: string; name: string }[] {
  const map = new Map<string, { code: string; name: string }>();
  defaultItems.forEach((d) => map.set(d.code.toUpperCase(), d));
  dbItems.forEach((i) => {
    if (i && i.code) {
      map.set(i.code.toUpperCase(), { code: i.code, name: i.name || i.code });
    }
  });
  return Array.from(map.values());
}

export function formatSequenceName(code?: string | null): string {
  if (!code) return "—";
  return code.replace(/_/g, " ");
}

type SimpleRow = {
  id: string;
  name: string;
  code?: string;
  is_active?: boolean;
  display_order?: number;
  entity_code?: string;
  follow_up_type_code?: string;
  [key: string]: unknown;
};

export function MastersAdmin({ master, onChanged }: Props) {
  const [tab, setTab] = useState<TabKey>("rules");
  const [entityFilter, setEntityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<{
    mode: "add" | "edit";
    tab: TabKey;
    id?: string;
  } | null>(null);
  const [moduleBusy, setModuleBusy] = useState(false);
  const [moduleFeedback, setModuleFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [editingSequence, setEditingSequence] = useState<SequenceStep | null>(
    null,
  );
  const [showSequenceForm, setShowSequenceForm] = useState(false);
  const [showRemarks, setShowRemarks] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // New confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: TabKey;
    name: string;
    isBulk?: boolean;
    count?: number;
  } | null>(null);

  const nameFor = useMemo(() => {
    const match = (
      itemCode?: string | null,
      itemName?: string | null,
      target?: string | null,
    ) => {
      if (!target) return false;
      const t = String(target).toLowerCase();
      return (
        (itemCode != null && String(itemCode).toLowerCase() === t) ||
        (itemName != null && String(itemName).toLowerCase() === t)
      );
    };
    return {
      entity: (code?: string | null) =>
        master.entities.find((e) => match(e?.code, e?.name, code))?.name ??
        DEFAULT_RULE_ENTITIES.find((e) => match(e?.code, e?.name, code))
          ?.name ??
        code ??
        "—",
      type: (code?: string | null) => {
        if (!code) return "—";
        const norm = (c: string) => c.toUpperCase().replace(/[\s\-_]+/g, "");
        const target = norm(code);
        const found = master.followUpTypes.find(
          (t) =>
            norm(t?.code || "") === target || norm(t?.name || "") === target,
        );
        if (found) return found.name;
        const def = DEFAULT_RULE_FOLLOW_UP_TYPES.find(
          (t) => norm(t.code) === target || norm(t.name) === target,
        );
        if (def) return def.name;
        if (target === "VISIT" || target === "SITEVISIT") return "Site Visit";
        if (target === "VIDEO" || target === "VIDEOCALL") return "Video Call";
        if (target === "CALL" || target === "PHONECALL") return "Phone Call";
        if (target === "WHATSAPP") return "WhatsApp";
        if (target === "EMAIL") return "Email";
        if (target === "MEETING") return "Meeting";
        if (target === "OTHER") return "Other";
        return code;
      },
      stage: (code?: string | null, entity?: string | null) =>
        master.stages.find(
          (s) =>
            match(s?.code, s?.name, code) &&
            (!entity || s?.entity_code === entity),
        )?.name ??
        DEFAULT_RULE_STAGES.find((s) => match(s?.code, s?.name, code))?.name ??
        code ??
        "—",
      status: (code?: string | null, entity?: string | null) =>
        master.statuses.find(
          (s) =>
            match(s?.code, s?.name, code) &&
            (!entity || s?.entity_code === entity),
        )?.name ??
        DEFAULT_RULE_STATUSES.find((s) => match(s?.code, s?.name, code))
          ?.name ??
        code ??
        "—",
      outcome: (code?: string | null) =>
        master.outcomes.find((o) => match(o?.code, o?.name, code))?.name ??
        DEFAULT_RULE_OUTCOMES.find((o) => match(o?.code, o?.name, code))
          ?.name ??
        code ??
        "—",
      action: (code?: string | null) =>
        master.nextActions.find((a) => match(a?.code, a?.name, code))?.name ??
        code ??
        "—",
      priority: (code?: string | null) =>
        master.priorities.find((p) => match(p?.code, p?.name, code))?.name ??
        code ??
        "—",
      reason: (code?: string | null) =>
        master.reasons.find((r) => match(r?.code, r?.name, code))?.name ??
        code ??
        "—",
      sequence: (code?: string | null) => formatSequenceName(code),
    };
  }, [master]);

  const filteredRules = useMemo(() => {
    let r = master.rules;
    if (entityFilter !== "All")
      r = r.filter((x) => x.entity_code === entityFilter);
    if (typeFilter !== "All") {
      const norm = (c: string) => c.toUpperCase().replace(/[\s\-_]+/g, "");
      const target = norm(typeFilter);
      r = r.filter((x) => {
        const code = norm(x.follow_up_type_code || "");
        if (code === target) return true;
        if (
          (target === "VISIT" || target === "SITEVISIT") &&
          (code === "VISIT" || code === "SITEVISIT")
        )
          return true;
        if (
          (target === "VIDEO" || target === "VIDEOCALL") &&
          (code === "VIDEO" || code === "VIDEOCALL")
        )
          return true;
        if (
          nameFor.type(x.follow_up_type_code).toLowerCase() ===
          nameFor.type(typeFilter).toLowerCase()
        )
          return true;
        return false;
      });
    }
    if (query) {
      const q = query.toLowerCase();
      r = r.filter((x) => {
        const ruleId = (
          x.rule_id ||
          (x as any).name ||
          x.id ||
          ""
        ).toLowerCase();
        const typeName = (
          nameFor.type(x.follow_up_type_code) || ""
        ).toLowerCase();
        const stageName = (
          nameFor.stage(x.current_stage_code, x.entity_code) || ""
        ).toLowerCase();
        const statusName = (
          nameFor.status(x.current_status_code, x.entity_code) || ""
        ).toLowerCase();
        const outcomeName = (x.outcome_code || "").toLowerCase();
        const remarkText = (
          x.remark ||
          (x as any).auto_remark_template ||
          ""
        ).toLowerCase();
        return (
          ruleId.includes(q) ||
          typeName.includes(q) ||
          stageName.includes(q) ||
          statusName.includes(q) ||
          outcomeName.includes(q) ||
          remarkText.includes(q)
        );
      });
    }
    return r;
  }, [master.rules, entityFilter, typeFilter, query, nameFor]);

  const filteredSequenceNames = useMemo(() => {
    let list = master.sequences;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((s) => {
        const name = (s.sequence_name || "").toLowerCase();
        const action = (
          nameFor.action(s.action_code) ||
          s.action_code ||
          ""
        ).toLowerCase();
        const type = (
          nameFor.type(s.follow_up_type_code) ||
          s.follow_up_type_code ||
          ""
        ).toLowerCase();
        const priority = (s.priority_code || "").toLowerCase();
        const status = (
          s.next_status_code ? nameFor.status(s.next_status_code) : ""
        ).toLowerCase();
        return (
          name.includes(q) ||
          action.includes(q) ||
          type.includes(q) ||
          priority.includes(q) ||
          status.includes(q)
        );
      });
    }
    const names = new Set(list.map((s) => s.sequence_name).filter(Boolean));
    return Array.from(names).sort();
  }, [master.sequences, query, nameFor]);

  const filteredEntities = useMemo(() => {
    let list = master.entities;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(q) ||
          (e.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [master.entities, query]);

  const filteredFollowUpTypes = useMemo(() => {
    let list = master.followUpTypes;
    if (entityFilter !== "All") {
      list = list.filter(
        (t) =>
          !(t as any).entity_code || (t as any).entity_code === entityFilter,
      );
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          (t.name || "").toLowerCase().includes(q) ||
          (t.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [master.followUpTypes, entityFilter, query]);

  const filteredStages = useMemo(() => {
    let list = master.stages;
    if (entityFilter !== "All") {
      list = list.filter((s) => s.entity_code === entityFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [master.stages, entityFilter, query]);

  const filteredStatuses = useMemo(() => {
    let list = master.statuses;
    if (entityFilter !== "All") {
      list = list.filter((s) => s.entity_code === entityFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [master.statuses, entityFilter, query]);

  const filteredOutcomes = useMemo(() => {
    let list = master.outcomes;
    if (typeFilter !== "All") {
      list = list.filter((o) => o.follow_up_type_code === typeFilter);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          (o.name || "").toLowerCase().includes(q) ||
          (o.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [master.outcomes, typeFilter, query]);

  const filteredReasons = useMemo(() => {
    let list = master.reasons;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          (r.code || "").toLowerCase().includes(q) ||
          ((r as any).outcome_code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [master.reasons, query]);

  const filteredNextActions = useMemo(() => {
    let list = master.nextActions;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [master.nextActions, query]);

  const filteredPriorities = useMemo(() => {
    let list = master.priorities;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.code || "").toLowerCase().includes(q) ||
          String(p.level).includes(q),
      );
    }
    return list;
  }, [master.priorities, query]);

  const sequenceNames = useMemo(() => {
    const names = new Set(
      master.sequences.map((s) => s.sequence_name).filter(Boolean),
    );
    return Array.from(names).sort();
  }, [master.sequences]);

  const distinctFollowUpTypes = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();

    const baseTypes = [
      { code: "CALL", name: "Phone Call" },
      { code: "WHATSAPP", name: "WhatsApp" },
      { code: "EMAIL", name: "Email" },
      { code: "VISIT", name: "Site Visit" },
      { code: "MEETING", name: "Meeting" },
      { code: "VIDEO", name: "Video Call" },
      { code: "OTHER", name: "Other" },
    ];
    baseTypes.forEach((t) => {
      map.set(t.code.toUpperCase(), t);
    });

    (master.followUpTypes || []).forEach((t) => {
      if (t && t.code) {
        const codeKey = t.code.toUpperCase();
        map.set(codeKey, {
          code: t.code,
          name: t.name || nameFor.type(t.code),
        });
      }
    });

    (master.rules || []).forEach((r) => {
      if (r && r.follow_up_type_code) {
        const codeKey = r.follow_up_type_code.toUpperCase();
        if (!map.has(codeKey)) {
          map.set(codeKey, {
            code: r.follow_up_type_code,
            name: nameFor.type(r.follow_up_type_code),
          });
        }
      }
    });

    const seenNames = new Set<string>();
    const result: { code: string; name: string }[] = [];
    for (const item of map.values()) {
      const nameKey = item.name.toLowerCase();
      if (!seenNames.has(nameKey)) {
        seenNames.add(nameKey);
        result.push(item);
      }
    }
    return result;
  }, [master.followUpTypes, master.rules, nameFor]);

  // Updated delete handlers to use confirmation modal
  async function handleDeleteSequence(id: string) {
    const step = master.sequences.find((s) => s.id === id);
    if (!step) return;
    setDeleteConfirm({
      id,
      type: "sequences",
      name: `${formatSequenceName(step.sequence_name)} - Step ${step.step}`,
    });
  }

  async function confirmDeleteSequence(id: string) {
    const deleted = await deleteMaster("fu_sequences", id);
    if (!deleted) {
      toast.error("Could not delete this sequence step.");
      setModuleFeedback({
        type: "error",
        text: "Could not delete this sequence step.",
      });
      return;
    }
    setConfirmDeleteId(null);
    setDeleteConfirm(null);
    toast.success("Sequence step deleted successfully! 🗑️");
    setModuleFeedback({ type: "success", text: "Sequence step deleted." });
    onChanged();
  }

  async function handleDeleteEntireSequence(seqName: string) {
    setDeleteConfirm({
      id: seqName,
      type: "sequences",
      name: seqName,
      isBulk: true,
    });
  }

  async function confirmDeleteEntireSequence(seqName: string) {
    setModuleBusy(true);
    const ok = await deleteSequenceByName(seqName);
    setModuleBusy(false);
    if (!ok) {
      toast.error("Could not delete this sequence.");
      setModuleFeedback({
        type: "error",
        text: "Could not delete this sequence.",
      });
      return;
    }
    setDeleteConfirm(null);
    toast.success(
      `Sequence "${seqName.replace(/_/g, " ")}" deleted successfully! 🗑️`,
    );
    setModuleFeedback({
      type: "success",
      text: `Sequence "${seqName.replace(/_/g, " ")}" deleted.`,
    });
    onChanged();
  }

  async function handleExportSequence(seqName: string) {
    setModuleBusy(true);
    try {
      const steps = master.sequences.filter((s) => s.sequence_name === seqName);
      exportTabToExcel("fu_sequences", master, steps);
      toast.success(
        `Sequence "${seqName.replace(/_/g, " ")}" exported to Excel successfully! 📥`,
      );
      setModuleFeedback({
        type: "success",
        text: `Sequence "${seqName.replace(/_/g, " ")}" exported to Excel.`,
      });
    } catch {
      toast.error("Could not export this sequence.");
      setModuleFeedback({
        type: "error",
        text: "Could not export this sequence.",
      });
    } finally {
      setModuleBusy(false);
    }
  }

  async function handleDelete(id: string) {
    const list = (master as any)[tab] as SimpleRow[];
    const item = list?.find((r) => r.id === id);
    if (!item) return;
    setDeleteConfirm({
      id,
      type: tab,
      name: item.name || item.code || id,
    });
  }

  async function confirmDelete(id: string) {
    const deleted = await deleteMaster(tableMap[tab], id);
    if (!deleted) {
      toast.error("Could not delete this item.");
      setModuleFeedback({ type: "error", text: "Could not delete this item." });
      return;
    }
    setConfirmDeleteId(null);
    setDeleteConfirm(null);
    toast.success("Record deleted successfully! 🗑️");
    setModuleFeedback({ type: "success", text: "Record deleted." });
    onChanged();
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setDeleteConfirm({
      id: "bulk",
      type: tab,
      name: `${count} selected item(s)`,
      isBulk: true,
      count,
    });
  }

  async function confirmBulkDelete() {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;

    setModuleBusy(true);
    try {
      let deletedCount = 0;
      const currentTable = tableMap[tab];
      for (const id of Array.from(selectedIds)) {
        const ok = await deleteMaster(currentTable, id);
        if (ok) deletedCount++;
      }
      setSelectedIds(new Set());
      setDeleteConfirm(null);
      toast.success(`Successfully deleted ${deletedCount} item(s)! 🗑️`);
      setModuleFeedback({
        type: "success",
        text: `Successfully deleted ${deletedCount} item(s).`,
      });
      onChanged();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting selected items.");
      setModuleFeedback({
        type: "error",
        text: "Error deleting selected items.",
      });
    } finally {
      setModuleBusy(false);
    }
  }

  function startEdit(id: string) {
    setModalItem({ mode: "edit", tab, id });
    setModuleFeedback(null);
  }

  async function handleToggleFlag(
    id: string,
    field: string,
    currentValue: boolean,
  ) {
    const saved = await updateMaster(tableMap[tab], id, {
      [field]: !currentValue,
    });
    if (!saved) {
      toast.error("Could not update status.");
      setModuleFeedback({ type: "error", text: "Could not update this item." });
      return;
    }
    toast.success("Status updated successfully! ✅");
    onChanged();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(ids: string[]) {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  }

  async function handleExport(
    allModules = false,
    format: "excel" | "json" = "excel",
  ) {
    setModuleBusy(true);
    try {
      if (format === "json") {
        if (allModules) {
          exportAllModulesToJSON(master);
          toast.success("All master modules exported to JSON successfully! 📥");
          setModuleFeedback({
            type: "success",
            text: "All master tables exported to JSON successfully.",
          });
        } else {
          exportTabToJSON(
            tab,
            master,
            tab === "rules" ? filteredRules : undefined,
          );
          const label = tabs.find((t) => t.key === tab)?.label || tab;
          toast.success(`${label} exported to JSON successfully! 📥`);
          setModuleFeedback({
            type: "success",
            text: `${label} exported to JSON successfully.`,
          });
        }
      } else {
        if (allModules) {
          exportAllModulesToExcel(master);
          toast.success(
            "All master modules exported to Excel successfully! 📥",
          );
          setModuleFeedback({
            type: "success",
            text: "All master tables exported to Excel workbook successfully.",
          });
        } else {
          exportTabToExcel(
            tab,
            master,
            tab === "rules" ? filteredRules : undefined,
          );
          const label = tabs.find((t) => t.key === tab)?.label || tab;
          toast.success(`${label} exported to Excel successfully! 📥`);
          setModuleFeedback({
            type: "success",
            text: `${label} exported to Excel successfully.`,
          });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(`Could not export to ${format.toUpperCase()}.`);
      setModuleFeedback({
        type: "error",
        text: `Could not export to ${format.toUpperCase()}.`,
      });
    } finally {
      setModuleBusy(false);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setModuleBusy(true);
    try {
      const result = await importExcelOrFile(file, tab, master);
      if (result.rows > 0 && result.duplicatesSkipped > 0) {
        toast.success(
          `Successfully imported ${result.rows} records (${result.duplicatesSkipped} duplicates skipped) from "${file.name}"! ✅`,
        );
      } else if (result.rows > 0) {
        toast.success(
          `Successfully imported ${result.rows} records across ${result.tables} table(s) from "${file.name}"! ✅`,
        );
      } else if (result.duplicatesSkipped > 0) {
        toast.info(
          `All ${result.duplicatesSkipped} records in "${file.name}" already exist (duplicates skipped). ℹ️`,
        );
      } else {
        toast.success(`Import completed successfully from "${file.name}"! ✅`);
      }
      setModuleFeedback({
        type: "success",
        text:
          `Successfully imported ${result.rows} records across ${result.tables} table(s) from "${file.name}".` +
          (result.duplicatesSkipped
            ? ` (${result.duplicatesSkipped} duplicates skipped)`
            : ""),
      });
      onChanged();
    } catch (error) {
      console.error(error);
      const msg =
        error instanceof Error
          ? error.message
          : "Could not import this file. Please check format.";
      toast.error(msg);
      setModuleFeedback({
        type: "error",
        text: msg,
      });
    } finally {
      setModuleBusy(false);
    }
  }

  const entityPills = ["All", ...master.entities.map((e) => e.code)];
  const typePills = ["All", ...master.followUpTypes.map((t) => t.code)];

  return (
    <div className="admin">
      {/* Top Tabs Bar */}
      <div className="admin-tabs-wrapper">
        <div className="admin-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`admin-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => {
                setTab(t.key);
                setConfirmDeleteId(null);
                setModalItem(null);
                setSelectedIds(new Set());
                setDeleteConfirm(null);
              }}
            >
              {t.label}
              {t.key === "rules" && (
                <span className="tab-badge">{master.rules.length}</span>
              )}
              {t.key === "sequences" && (
                <span className="tab-badge">{sequenceNames.length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="tabs-arrows">
          <ChevronUp size={14} />
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Control Area for Rules tab */}
      {tab === "rules" && (
        <div className="admin-controls-stack">
          <div className="control-row" style={{ alignItems: "center" }}>
            <div className="pill-group entity-pill-group">
              {["All", "LEAD", "BUYER", "SELLER"].map((code) => {
                const isSelected = entityFilter === code;
                return (
                  <button
                    key={code}
                    className={`pill-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setEntityFilter(code)}
                  >
                    {code === "All" ? "All" : nameFor.entity(code)}
                  </button>
                );
              })}
            </div>

            <div className="search-box-pill" style={{ flex: "0 1 320px" }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rules..."
              />
            </div>

            <div className="pill-group">
              <button
                className={`pill-btn ${typeFilter === "All" ? "active" : ""}`}
                onClick={() => setTypeFilter("All")}
              >
                All Types
              </button>
              {distinctFollowUpTypes.map((t) => {
                const isSelected =
                  typeFilter === t.code ||
                  (typeFilter !== "All" &&
                    nameFor.type(typeFilter).toLowerCase() ===
                      t.name.toLowerCase());
                return (
                  <button
                    key={t.code}
                    className={`pill-btn ${isSelected ? "active" : ""}`}
                    onClick={() => setTypeFilter(t.code)}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="control-row">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                className={`btn-white-secondary ${showRemarks ? "active" : ""}`}
                onClick={() => setShowRemarks((s) => !s)}
              >
                Show remarks
              </button>
              <button
                className="btn-orange-primary"
                onClick={() => {
                  setEditingRule(null);
                  setShowRuleForm(true);
                }}
              >
                <Plus size={16} /> Add rule
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Bulk Actions Integrated Here */}
              {selectedIds.size > 0 && (
                <>
                  <button
                    type="button"
                    className="btn-danger-bulk"
                    onClick={() => void handleBulkDelete()}
                    disabled={moduleBusy}
                    style={{ padding: "7px 16px", fontSize: "13px" }}
                  >
                    <Trash2 size={15} /> Delete Selected ({selectedIds.size})
                  </button>
                  <button
                    type="button"
                    className="btn-clear-bulk"
                    onClick={() => setSelectedIds(new Set())}
                    style={{ padding: "7px 16px", fontSize: "13px" }}
                  >
                    <X size={15} /> Deselect All
                  </button>
                  <div
                    style={{
                      width: "1px",
                      height: "24px",
                      background: "#cbd5e1",
                      margin: "0 4px",
                    }}
                  ></div>
                </>
              )}

              <button
                className="btn-white-secondary"
                onClick={() => setShowImportModal(true)}
                disabled={moduleBusy}
                title="Import module from JSON or Excel"
              >
                <Import size={15} /> Import module
              </button>
              <button
                className="btn-white-secondary"
                onClick={() => void handleExport(true, "json")}
                disabled={moduleBusy}
                title="Export module backup to JSON"
              >
                <Download size={15} /> Export module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Area for Sequences tab */}
      {tab === "sequences" && (
        <div className="admin-controls-stack">
          <div className="control-row">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              <button
                className="btn-orange-primary"
                onClick={() => {
                  setEditingSequence(null);
                  setShowSequenceForm(true);
                }}
              >
                <Plus size={16} /> Add sequence step
              </button>

              <div className="search-box-pill" style={{ flex: "0 1 280px" }}>
                <Search size={15} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sequences..."
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Bulk Actions Integrated Here */}
              {selectedIds.size > 0 && (
                <>
                  <button
                    type="button"
                    className="btn-danger-bulk"
                    onClick={() => void handleBulkDelete()}
                    disabled={moduleBusy}
                    style={{ padding: "7px 16px", fontSize: "13px" }}
                  >
                    <Trash2 size={15} /> Delete Selected ({selectedIds.size})
                  </button>
                  <button
                    type="button"
                    className="btn-clear-bulk"
                    onClick={() => setSelectedIds(new Set())}
                    style={{ padding: "7px 16px", fontSize: "13px" }}
                  >
                    <X size={15} /> Deselect All
                  </button>
                  <div
                    style={{
                      width: "1px",
                      height: "24px",
                      background: "#cbd5e1",
                      margin: "0 4px",
                    }}
                  ></div>
                </>
              )}

              <button
                className="btn-white-secondary"
                onClick={() => setShowImportModal(true)}
                disabled={moduleBusy}
                title="Import module from JSON or Excel"
              >
                <Import size={15} /> Import module
              </button>
              <button
                className="btn-white-secondary"
                onClick={() => void handleExport(true, "json")}
                disabled={moduleBusy}
                title="Export module backup to JSON"
              >
                <Download size={15} /> Export module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Area for Simple Master tabs */}
      {tab !== "rules" && tab !== "sequences" && (
        <div className="admin-controls-stack">
          <div className="control-row">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {(tab === "types" || tab === "stages" || tab === "statuses") && (
                <div className="pill-group entity-pill-group">
                  {["All", "LEAD", "BUYER", "SELLER"].map((code) => {
                    const isSelected = entityFilter === code;
                    return (
                      <button
                        key={code}
                        className={`pill-btn ${isSelected ? "active" : ""}`}
                        onClick={() => setEntityFilter(code)}
                      >
                        {code === "All" ? "All Entities" : nameFor.entity(code)}
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === "outcomes" && (
                <div className="pill-group">
                  <button
                    className={`pill-btn ${typeFilter === "All" ? "active" : ""}`}
                    onClick={() => setTypeFilter("All")}
                  >
                    All Types
                  </button>
                  {distinctFollowUpTypes.map((t) => {
                    const isSelected =
                      typeFilter === t.code ||
                      (typeFilter !== "All" &&
                        nameFor.type(typeFilter).toLowerCase() ===
                          t.name.toLowerCase());
                    return (
                      <button
                        key={t.code}
                        className={`pill-btn ${isSelected ? "active" : ""}`}
                        onClick={() => setTypeFilter(t.code)}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="search-box-pill" style={{ flex: "0 1 260px" }}>
                <Search size={15} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${tabs.find((t) => t.key === tab)?.label || tab}...`}
                />
              </div>

              <button
                className="btn-orange-primary"
                onClick={() => setModalItem({ mode: "add", tab })}
              >
                <Plus size={16} /> Add {singularMap[tab]}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Bulk Actions Integrated Here */}
              {selectedIds.size > 0 && (
                <>
                  <button
                    type="button"
                    className="btn-danger-bulk"
                    onClick={() => void handleBulkDelete()}
                    disabled={moduleBusy}
                    style={{ padding: "7px 16px", fontSize: "13px" }}
                  >
                    <Trash2 size={15} /> Delete Selected ({selectedIds.size})
                  </button>
                  <button
                    type="button"
                    className="btn-clear-bulk"
                    onClick={() => setSelectedIds(new Set())}
                    style={{ padding: "7px 16px", fontSize: "13px" }}
                  >
                    <X size={15} /> Deselect All
                  </button>
                  <div
                    style={{
                      width: "1px",
                      height: "24px",
                      background: "#cbd5e1",
                      margin: "0 4px",
                    }}
                  ></div>
                </>
              )}

              <button
                className="btn-white-secondary"
                onClick={() => setShowImportModal(true)}
                disabled={moduleBusy}
                title="Import module from JSON or Excel"
              >
                <Import size={15} /> Import module
              </button>
              <button
                className="btn-white-secondary"
                onClick={() => void handleExport(true, "json")}
                disabled={moduleBusy}
                title="Export module backup to JSON"
              >
                <Download size={15} /> Export module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status banner */}
      {moduleFeedback && (
        <div className={`status-info-banner ${moduleFeedback.type}`}>
          {moduleFeedback.text}
        </div>
      )}

      {/* ==================== TAB 1: RULES ==================== */}
      {tab === "rules" && (
        <div className="rules-card-container">
          <div className="rules-table-scroll">
            <table className="rules-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${(showAll ? filteredRules : filteredRules.slice(0, 50)).length > 0 && (showAll ? filteredRules : filteredRules.slice(0, 50)).every((r) => selectedIds.has(r.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(
                          (showAll
                            ? filteredRules
                            : filteredRules.slice(0, 50)
                          ).map((r) => r.id),
                        )
                      }
                      title="Select All Rules"
                    >
                      {(showAll ? filteredRules : filteredRules.slice(0, 50))
                        .length > 0 &&
                      (showAll
                        ? filteredRules
                        : filteredRules.slice(0, 50)
                      ).every((r) => selectedIds.has(r.id)) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>RULE ID</th>
                  <th>ENTITY</th>
                  <th>TYPE</th>
                  <th>STAGE</th>
                  <th>STATUS</th>
                  <th>OUTCOME</th>
                  <th>REASON</th>
                  <th>→ STAGE</th>
                  <th>→ STATUS</th>
                  <th>→ ACTION</th>
                  <th>→ TYPE</th>
                  <th>DAYS</th>
                  <th>TIME</th>
                  <th>PRIORITY</th>
                  <th>FLAGS</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? filteredRules : filteredRules.slice(0, 50)).map(
                  (r, index) => {
                    const isChecked = selectedIds.has(r.id);
                    return (
                      <tr key={r.id}>
                        <td>
                          <button
                            className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                            onClick={() => toggleSelect(r.id)}
                          >
                            {isChecked ? (
                              <CheckSquare size={16} />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                        <td className="sr-no-cell">{index + 1}</td>
                        <td>
                          <div className="rule-id-cell">
                            <span className="rule-id-text">
                              {r.rule_id || (r as any).name || r.id}
                            </span>
                            <div className="rule-id-actions">
                              <button
                                onClick={() => {
                                  setEditingRule(r);
                                  setShowRuleForm(true);
                                }}
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="del"
                                onClick={() => void handleDelete(r.id)}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="entity-pill-badge">
                            {nameFor.entity(r.entity_code)}
                          </span>
                        </td>
                        <td>{nameFor.type(r.follow_up_type_code)}</td>
                        <td>
                          {nameFor.stage(r.current_stage_code, r.entity_code)}
                        </td>
                        <td>
                          {nameFor.status(r.current_status_code, r.entity_code)}
                        </td>
                        <td>
                          <span className="outcome-text-orange">
                            {nameFor.outcome(r.outcome_code)}
                          </span>
                        </td>
                        <td>
                          {r.reason_code ? nameFor.reason(r.reason_code) : "—"}
                        </td>
                        <td>
                          <span className="target-green-text">
                            {nameFor.stage(r.next_stage_code, r.entity_code)}
                          </span>
                        </td>
                        <td>
                          <span className="target-green-text">
                            {nameFor.status(r.next_status_code, r.entity_code)}
                          </span>
                        </td>
                        <td>
                          <span className="target-green-text">
                            {nameFor.action(r.next_action_code)}
                          </span>
                        </td>
                        <td>
                          <span className="order-slate-text">
                            {nameFor.type(
                              r.next_follow_up_type_code ??
                                r.follow_up_type_code,
                            )}
                          </span>
                        </td>
                        <td>{r.default_days ?? (r as any).gap_days ?? 1}</td>
                        <td>{r.default_time || "11:00"}</td>
                        <td>
                          <span
                            className={`priority-pill ${(r.priority_code || "MEDIUM").toLowerCase()}`}
                          >
                            {r.priority_code || "MEDIUM"}
                          </span>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              alignItems: "center",
                            }}
                          >
                            {(Boolean(r.auto_schedule) ||
                              (r.auto_schedule === undefined &&
                                !r.terminal &&
                                (r as any).flag_dead_lead !== 1 &&
                                r.next_action_code &&
                                r.next_action_code !== "CLOSE_LEAD" &&
                                r.next_action_code !==
                                  "NO_FURTHER_ACTION")) && (
                              <span
                                className="flag-badge auto"
                                title="Auto Schedule"
                              >
                                A
                              </span>
                            )}
                            {(Boolean(r.notification) ||
                              (r.notification === undefined &&
                                !r.terminal &&
                                (r as any).flag_dead_lead !== 1 &&
                                r.next_action_code !== "CLOSE_LEAD")) && (
                              <span
                                className="flag-badge notif"
                                title="Notification"
                              >
                                N
                              </span>
                            )}
                            {(Boolean(r.terminal) ||
                              Boolean((r as any).is_terminal) ||
                              (r as any).flag_dead_lead === 1 ||
                              r.next_action_code === "CLOSE_LEAD" ||
                              r.next_status_code === "LOST" ||
                              r.next_status_code === "CLOSED" ||
                              r.outcome_code === "NOT_INTERESTED") && (
                              <span
                                className="flag-badge term"
                                title="Terminal / End"
                              >
                                T
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          {filteredRules.length > 50 && (
            <button
              className="rules-show-more-btn"
              onClick={() => setShowAll((s) => !s)}
            >
              {showAll ? "Show less" : `Show all ${filteredRules.length} rules`}{" "}
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}

      {/* ==================== TAB 2: SEQUENCES ==================== */}
      {tab === "sequences" && (
        <div className="sequences-grid">
          {filteredSequenceNames.map((seqName) => {
            const steps = master.sequences
              .filter((s) => s.sequence_name === seqName)
              .sort((a, b) => a.step - b.step);
            const activeCount = steps.filter((s) => s.is_active).length;
            const terminalCount = steps.filter((s) => s.terminal_step).length;
            const totalSpan = steps.reduce((sum, s) => sum + s.after_days, 0);

            return (
              <div className="seq-card" key={seqName}>
                <div className="seq-card-header">
                  <div className="seq-header-left">
                    <div className="seq-icon-box">
                      <Zap size={18} />
                    </div>
                    <div className="seq-title-group">
                      <strong>{seqName.replace(/_/g, " ")}</strong>
                      <span>
                        {steps.length} steps · {activeCount} active ·{" "}
                        {totalSpan}d total span
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {terminalCount > 0 && (
                      <span className="terminal-pill-badge">
                        {terminalCount} TERMINAL
                      </span>
                    )}
                    <div className="seq-header-actions">
                      <button
                        onClick={() => void handleExportSequence(seqName)}
                        title="Export Sequence"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => void handleDeleteEntireSequence(seqName)}
                        title="Delete Entire Sequence"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="seq-timeline-container">
                  {steps.map((s, idx) => {
                    const isLast = idx === steps.length - 1;
                    const delayText =
                      s.after_days === 0 && s.after_hours === 0
                        ? "immediate"
                        : `${s.after_days > 0 ? `${s.after_days}d` : ""}${s.after_hours > 0 ? `${s.after_hours}h` : ""}`;

                    return (
                      <div className="timeline-step-row" key={s.id}>
                        <div className="timeline-rail">
                          <div
                            className={`timeline-circle ${s.terminal_step ? "terminal" : ""}`}
                          >
                            {s.step}
                          </div>
                          {!isLast && (
                            <div className="timeline-vertical-line" />
                          )}
                        </div>

                        <div className="timeline-step-body">
                          <div className="step-delay-badges">
                            <span className="step-delay-pill">{delayText}</span>
                            {s.terminal_step && (
                              <span className="step-terminal-pill">
                                TERMINAL
                              </span>
                            )}
                          </div>

                          <div className="step-main-line">
                            <div className="step-action-title-group">
                              <span className="step-action-name">
                                {nameFor.action(s.action_code)}
                              </span>
                              <span className="step-type-pill">
                                {nameFor.type(s.follow_up_type_code)}
                              </span>
                              <span
                                className={`step-priority-pill ${(s.priority_code || "").toLowerCase()}`}
                              >
                                {s.priority_code}
                              </span>
                            </div>

                            <div className="step-row-actions">
                              <button
                                onClick={() => {
                                  setEditingSequence(s);
                                  setShowSequenceForm(true);
                                }}
                                title="Edit"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                className="del"
                                onClick={() => void handleDeleteSequence(s.id)}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {(s.next_status_code || s.reason_code) && (
                            <div className="step-subnote">
                              {s.next_status_code &&
                                `→ ${nameFor.status(s.next_status_code)}`}
                              {s.reason_code &&
                                ` · ${nameFor.reason(s.reason_code)}`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== TAB 3: ENTITIES ==================== */}
      {tab === "entities" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredEntities.length > 0 && filteredEntities.every((e) => selectedIds.has(e.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredEntities.map((e) => e.id))
                      }
                      title="Select All"
                    >
                      {filteredEntities.length > 0 &&
                      filteredEntities.every((e) => selectedIds.has(e.id)) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>ORDER</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredEntities.map((e, index) => {
                  const isChecked = selectedIds.has(e.id);
                  return (
                    <tr key={e.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(e.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span className="name-cell-pill">{e.name}</span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{e.code}</span>
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Order {e.display_order}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${e.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              e.id,
                              "is_active",
                              e.is_active,
                            )
                          }
                        >
                          {e.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(e.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(e.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: FOLLOW-UP TYPES ==================== */}
      {tab === "types" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredFollowUpTypes.length > 0 && filteredFollowUpTypes.every((t) => selectedIds.has(t.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredFollowUpTypes.map((t) => t.id))
                      }
                      title="Select All"
                    >
                      {filteredFollowUpTypes.length > 0 &&
                      filteredFollowUpTypes.every((t) =>
                        selectedIds.has(t.id),
                      ) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>ENTITY</th>
                  <th>ORDER</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredFollowUpTypes.map((t, index) => {
                  const isChecked = selectedIds.has(t.id);
                  const IconComp = getIcon(
                    (t as any).icon || (t as any).icon_name,
                    t.code,
                  );
                  return (
                    <tr key={t.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(t.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span
                          className="name-cell-pill"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <IconComp size={14} /> {t.name}
                        </span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{t.code}</span>
                      </td>
                      <td>
                        {(t as any).entity_code ? (
                          <span className="entity-pill-badge">
                            {nameFor.entity((t as any).entity_code)}
                          </span>
                        ) : (
                          <span className="order-slate-text">All</span>
                        )}
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Order {t.display_order}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${t.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              t.id,
                              "is_active",
                              t.is_active,
                            )
                          }
                        >
                          {t.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(t.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(t.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: STAGES ==================== */}
      {tab === "stages" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredStages.length > 0 && filteredStages.every((s) => selectedIds.has(s.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredStages.map((s) => s.id))
                      }
                      title="Select All"
                    >
                      {filteredStages.length > 0 &&
                      filteredStages.every((s) => selectedIds.has(s.id)) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>ENTITY</th>
                  <th>ORDER</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredStages.map((s, index) => {
                  const isChecked = selectedIds.has(s.id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(s.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span className="name-cell-pill">{s.name}</span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{s.code}</span>
                      </td>
                      <td>
                        <span className="entity-pill-badge">
                          {nameFor.entity(s.entity_code)}
                        </span>
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Order {s.display_order}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${s.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              s.id,
                              "is_active",
                              s.is_active,
                            )
                          }
                        >
                          {s.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(s.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(s.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 6: STATUSES ==================== */}
      {tab === "statuses" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredStatuses.length > 0 && filteredStatuses.every((s) => selectedIds.has(s.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredStatuses.map((s) => s.id))
                      }
                      title="Select All"
                    >
                      {filteredStatuses.length > 0 &&
                      filteredStatuses.every((s) => selectedIds.has(s.id)) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>ENTITY</th>
                  <th>ORDER</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredStatuses.map((s, index) => {
                  const isChecked = selectedIds.has(s.id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(s.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span className="name-cell-pill">{s.name}</span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{s.code}</span>
                      </td>
                      <td>
                        <span className="entity-pill-badge">
                          {nameFor.entity(s.entity_code)}
                        </span>
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Order {s.display_order}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${s.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              s.id,
                              "is_active",
                              s.is_active,
                            )
                          }
                        >
                          {s.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(s.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(s.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 7: OUTCOMES ==================== */}
      {tab === "outcomes" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredOutcomes.length > 0 && filteredOutcomes.every((o) => selectedIds.has(o.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredOutcomes.map((o) => o.id))
                      }
                      title="Select All"
                    >
                      {filteredOutcomes.length > 0 &&
                      filteredOutcomes.every((o) => selectedIds.has(o.id)) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>TYPE</th>
                  <th>ORDER</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredOutcomes.map((o, index) => {
                  const isChecked = selectedIds.has(o.id);
                  return (
                    <tr key={o.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(o.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span className="name-cell-pill">{o.name}</span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{o.code}</span>
                      </td>
                      <td>
                        <span className="entity-pill-badge">
                          {nameFor.type(o.follow_up_type_code)}
                        </span>
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Order {o.display_order}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${o.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              o.id,
                              "is_active",
                              o.is_active,
                            )
                          }
                        >
                          {o.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(o.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(o.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 8: REASONS ==================== */}
      {tab === "reasons" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredReasons.length > 0 && filteredReasons.every((r) => selectedIds.has(r.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredReasons.map((r) => r.id))
                      }
                      title="Select All"
                    >
                      {filteredReasons.length > 0 &&
                      filteredReasons.every((r) => selectedIds.has(r.id)) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>ORDER</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredReasons.map((r, index) => {
                  const isChecked = selectedIds.has(r.id);
                  return (
                    <tr key={r.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(r.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span className="name-cell-pill">{r.name}</span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{r.code}</span>
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Order {r.display_order}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${r.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              r.id,
                              "is_active",
                              r.is_active,
                            )
                          }
                        >
                          {r.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(r.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(r.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 9: NEXT ACTIONS ==================== */}
      {tab === "actions" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredNextActions.length > 0 && filteredNextActions.every((a) => selectedIds.has(a.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredNextActions.map((a) => a.id))
                      }
                      title="Select All"
                    >
                      {filteredNextActions.length > 0 &&
                      filteredNextActions.every((a) =>
                        selectedIds.has(a.id),
                      ) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>ORDER</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredNextActions.map((a, index) => {
                  const isChecked = selectedIds.has(a.id);
                  return (
                    <tr key={a.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(a.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span className="name-cell-pill">{a.name}</span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{a.code}</span>
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Order {a.display_order}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${a.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              a.id,
                              "is_active",
                              a.is_active,
                            )
                          }
                        >
                          {a.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(a.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(a.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 10: PRIORITIES ==================== */}
      {tab === "priorities" && (
        <div className="master-table-card">
          <div className="master-table-scroll">
            <table className="master-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <button
                      className={`custom-checkbox-btn ${filteredPriorities.length > 0 && filteredPriorities.every((p) => selectedIds.has(p.id)) ? "checked" : ""}`}
                      onClick={() =>
                        toggleSelectAll(filteredPriorities.map((p) => p.id))
                      }
                      title="Select All"
                    >
                      {filteredPriorities.length > 0 &&
                      filteredPriorities.every((p) => selectedIds.has(p.id)) ? (
                        <CheckSquare size={16} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th style={{ width: "44px", textAlign: "center" }}>#</th>
                  <th>NAME</th>
                  <th>CODE</th>
                  <th>LEVEL</th>
                  <th>ACTIVE</th>
                  <th style={{ width: "80px" }} />
                </tr>
              </thead>
              <tbody>
                {filteredPriorities.map((p, index) => {
                  const isChecked = selectedIds.has(p.id);
                  return (
                    <tr key={p.id}>
                      <td>
                        <button
                          className={`custom-checkbox-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSelect(p.id)}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="sr-no-cell">{index + 1}</td>
                      <td>
                        <span
                          className={`priority-pill-badge ${(p.code || "").toLowerCase()}`}
                        >
                          {p.name}
                        </span>
                      </td>
                      <td>
                        <span className="code-purple-mono">{p.code}</span>
                      </td>
                      <td>
                        <span className="order-slate-text">
                          Level {p.level}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`active-pill-badge ${p.is_active ? "active" : "inactive"}`}
                          onClick={() =>
                            void handleToggleFlag(
                              p.id,
                              "is_active",
                              p.is_active,
                            )
                          }
                        >
                          {p.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td>
                        <div className="master-row-actions">
                          <button onClick={() => startEdit(p.id)} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button
                            className="del"
                            onClick={() => void handleDelete(p.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      {showRuleForm && (
        <RuleForm
          master={master}
          existing={editingRule}
          onClose={() => setShowRuleForm(false)}
          onSaved={() => {
            setShowRuleForm(false);
            onChanged();
          }}
        />
      )}

      {showSequenceForm && (
        <SequenceForm
          master={master}
          existing={editingSequence}
          onClose={() => setShowSequenceForm(false)}
          onSaved={() => {
            setShowSequenceForm(false);
            onChanged();
          }}
        />
      )}

      {modalItem && (
        <MasterItemModal
          master={master}
          tab={modalItem.tab}
          mode={modalItem.mode}
          id={modalItem.id}
          entityFilter={entityFilter}
          typeFilter={typeFilter}
          onClose={() => setModalItem(null)}
          onSaved={() => {
            setModalItem(null);
            onChanged();
          }}
        />
      )}

      {showImportModal && (
        <ImportExcelModal
          tab={tab}
          master={master}
          onClose={() => setShowImportModal(false)}
          onSuccess={(res) => {
            const dupText = res.duplicatesSkipped
              ? ` (${res.duplicatesSkipped} duplicates skipped)`
              : "";
            if (res.rows > 0) {
              toast.success(
                `Successfully imported ${res.rows} records across ${res.tables} table(s)${dupText}! ✅`,
              );
            } else if (res.duplicatesSkipped && res.duplicatesSkipped > 0) {
              toast.info(
                `All ${res.duplicatesSkipped} records already exist (duplicates skipped). ℹ️`,
              );
            } else {
              toast.success(`Import completed successfully! ✅`);
            }
            setModuleFeedback({
              type: "success",
              text: `Successfully imported ${res.rows} records across ${res.tables} table(s)${dupText}.`,
            });
            onChanged();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          itemName={deleteConfirm.name}
          isBulk={deleteConfirm.isBulk}
          count={deleteConfirm.count}
          onConfirm={() => {
            if (deleteConfirm.isBulk) {
              void confirmBulkDelete();
            } else if (deleteConfirm.type === "sequences") {
              if (deleteConfirm.id.length > 10) {
                // It's a sequence name, delete entire sequence
                void confirmDeleteEntireSequence(deleteConfirm.id);
              } else {
                // It's a sequence step id
                void confirmDeleteSequence(deleteConfirm.id);
              }
            } else {
              void confirmDelete(deleteConfirm.id);
            }
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// ===== DELETE CONFIRMATION MODAL =====
function DeleteConfirmModal({
  itemName,
  isBulk,
  count,
  onConfirm,
  onCancel,
}: {
  itemName: string;
  isBulk?: boolean;
  count?: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal delete-confirm-modal"
        style={{ maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ background: "#0E3657" }}>
          <div
            className="modal-header-icon"
            style={{ background: "rgba(255,255,255,0.1)", color: "#fca5a5" }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2>Confirm Delete</h2>
            <p>This action cannot be undone</p>
          </div>
          <button className="close-button" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        <div
          className="modal-body"
          style={{ padding: "24px", textAlign: "center" }}
        >
          <p
            style={{ fontSize: "15px", color: "#334155", margin: "0 0 8px 0" }}
          >
            {isBulk
              ? `Are you sure you want to delete ${count} selected item(s)?`
              : `Are you sure you want to delete this item?`}
          </p>
          {!isBulk && (
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#dc2626",
                margin: "0",
                wordBreak: "break-word",
              }}
            >
              {itemName}
            </p>
          )}
          {isBulk && (
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "8px" }}>
              All selected records will be permanently removed.
            </p>
          )}
        </div>
        <div
          className="modal-footer"
          style={{ justifyContent: "center", gap: "12px" }}
        >
          <button
            type="button"
            className="btn-white-secondary"
            onClick={onCancel}
            style={{ minWidth: "100px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger-bulk"
            onClick={onConfirm}
            style={{ minWidth: "100px", padding: "8px 16px" }}
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== RULE FORM MODAL =====
function RuleForm({
  master,
  existing,
  onClose,
  onSaved,
}: {
  master: MasterData;
  existing: Rule | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Rule>>(() => {
    if (existing) {
      const ex = existing as any;
      const isTerm =
        ex.terminal === true ||
        ex.terminal === 1 ||
        ex.is_terminal === true ||
        ex.flag_dead_lead === 1 ||
        ex.next_action_code === "CLOSE_LEAD" ||
        ex.next_status_code === "LOST" ||
        ex.next_status_code === "CLOSED";
      const isAuto =
        ex.auto_schedule === true ||
        ex.auto_schedule === 1 ||
        ex.ai_enabled === 1 ||
        (!isTerm && ex.auto_schedule !== false);
      const isNotif =
        ex.notification === true ||
        ex.notification === 1 ||
        (!isTerm && ex.notification !== false);
      return {
        ...existing,
        rule_id: existing.rule_id || ex.name || ex.id || "",
        remark: existing.remark || ex.auto_remark_template || "",
        default_days: existing.default_days ?? ex.gap_days ?? 1,
        default_time: existing.default_time || "11:00",
        auto_schedule: isAuto,
        notification: isNotif,
        terminal: isTerm,
        require_follow_up: ex.require_follow_up !== false && !isTerm,
        is_catch_all: ex.is_catch_all === true || ex.is_catch_all === 1,
      };
    }
    return {
      rule_id: `FUR-${Math.floor(100 + Math.random() * 900)}`,
      entity_code: "",
      follow_up_type_code: "",
      current_stage_code: "",
      current_status_code: "",
      outcome_code: "",
      reason_code: null,
      next_stage_code: "",
      next_status_code: "",
      next_action_code: "",
      next_follow_up_type_code: null,
      default_days: 1,
      default_time: "11:00",
      priority_code: "",
      auto_schedule: true,
      require_follow_up: true,
      terminal: false,
      max_attempts: null,
      notification: true,
      sequence_name: null,
      remark: "",
      display_order: master.rules.length + 1,
      is_active: true,
      auto_email: false,
      auto_whatsapp: false,
      auto_message: false,
      message_subject: null,
      message_body: null,
      is_catch_all: false,
    };
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableEntities = useMemo(() => {
    const list = master.entities.filter((e) => e.is_active !== false);
    const source = list.length > 0 ? list : DEFAULT_RULE_ENTITIES;
    const map = new Map<string, { code: string; name: string }>();
    source.forEach((e) => {
      const key = (e.code || e.name).toUpperCase();
      if (!map.has(key)) {
        map.set(key, { code: e.code, name: e.name });
      }
    });
    return Array.from(map.values());
  }, [master.entities]);

  const availableTypes = useMemo(() => {
    const list = master.followUpTypes.filter(
      (t) =>
        (!form.entity_code ||
          !(t as any).entity_code ||
          (t as any).entity_code === form.entity_code) &&
        t.is_active !== false,
    );
    const source =
      list.length > 0
        ? list
        : master.followUpTypes.length > 0
          ? master.followUpTypes
          : DEFAULT_RULE_FOLLOW_UP_TYPES;
    const map = new Map<string, { code: string; name: string }>();
    source.forEach((t) => {
      const key = (t.code || t.name).toUpperCase();
      if (!map.has(key)) {
        map.set(key, { code: t.code, name: t.name });
      }
    });
    return Array.from(map.values());
  }, [master.followUpTypes, form.entity_code]);

  const availableStages = useMemo(() => {
    const list = master.stages.filter(
      (s) =>
        (!form.entity_code || s.entity_code === form.entity_code) &&
        s.is_active !== false,
    );
    const source =
      list.length > 0
        ? list
        : master.stages.length > 0
          ? master.stages
          : DEFAULT_RULE_STAGES;
    const map = new Map<string, { code: string; name: string }>();
    source.forEach((s) => {
      const key = (s.code || s.name).toUpperCase();
      if (!map.has(key)) {
        map.set(key, { code: s.code, name: s.name });
      }
    });
    return Array.from(map.values());
  }, [master.stages, form.entity_code]);

  const availableStatuses = useMemo(() => {
    const list = master.statuses.filter(
      (s) =>
        (!form.entity_code || s.entity_code === form.entity_code) &&
        s.is_active !== false,
    );
    const source =
      list.length > 0
        ? list
        : master.statuses.length > 0
          ? master.statuses
          : DEFAULT_RULE_STATUSES;
    const map = new Map<string, { code: string; name: string }>();
    source.forEach((s) => {
      const key = (s.code || s.name).toUpperCase();
      if (!map.has(key)) {
        map.set(key, { code: s.code, name: s.name });
      }
    });
    return Array.from(map.values());
  }, [master.statuses, form.entity_code]);

  const availableOutcomes = useMemo(() => {
    const list = master.outcomes.filter(
      (o) =>
        (!form.follow_up_type_code ||
          o.follow_up_type_code === form.follow_up_type_code) &&
        (!form.entity_code ||
          !(o as any).entity_code ||
          (o as any).entity_code === form.entity_code) &&
        o.is_active !== false,
    );
    const source =
      list.length > 0
        ? list
        : master.outcomes.length > 0
          ? master.outcomes
          : DEFAULT_RULE_OUTCOMES;
    const map = new Map<string, { code: string; name: string }>();
    source.forEach((o) => {
      const key = (o.code || o.name).toUpperCase();
      if (!map.has(key)) {
        map.set(key, { code: o.code, name: o.name });
      }
    });
    return Array.from(map.values());
  }, [master.outcomes, form.follow_up_type_code, form.entity_code]);

  const availableReasons = useMemo(() => {
    const list = master.reasons.filter(
      (r) =>
        (!form.outcome_code ||
          !(r as any).outcome_code ||
          (r as any).outcome_code === form.outcome_code) &&
        r.is_active !== false,
    );
    const source = list.length > 0 ? list : master.reasons;
    const map = new Map<string, { code: string; name: string }>();
    source.forEach((r) => {
      const key = (r.code || r.name).toUpperCase();
      if (!map.has(key)) {
        map.set(key, { code: r.code, name: r.name });
      }
    });
    return Array.from(map.values());
  }, [master.reasons, form.outcome_code]);

  const availableNextActions = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.nextActions
      .filter((a) => a.is_active !== false)
      .forEach((a) => {
        const key = (a.code || a.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: a.code, name: a.name });
        }
      });
    return Array.from(map.values());
  }, [master.nextActions]);

  const availablePriorities = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.priorities
      .filter((p) => p.is_active !== false)
      .forEach((p) => {
        const key = (p.code || p.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: p.code, name: p.name });
        }
      });
    return Array.from(map.values());
  }, [master.priorities]);

  const sequenceNames = useMemo(() => {
    const names = new Set(master.sequences.map((s) => s.sequence_name));
    return Array.from(names).sort();
  }, [master.sequences]);

  function update(k: keyof Rule, v: unknown) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.rule_id?.trim()) {
      setError("Rule ID is required");
      return;
    }
    if (!form.entity_code) {
      setError("Please select an Entity");
      return;
    }
    if (!form.follow_up_type_code) {
      setError("Please select a Follow-up Type");
      return;
    }
    if (!form.current_stage_code) {
      setError("Please select Current Stage");
      return;
    }
    if (!form.current_status_code) {
      setError("Please select Current Status");
      return;
    }
    if (!form.outcome_code) {
      setError("Please select Outcome");
      return;
    }
    if (!form.next_stage_code) {
      setError("Please select Next Stage");
      return;
    }
    if (!form.next_status_code) {
      setError("Please select Next Status");
      return;
    }
    if (!form.next_action_code) {
      setError("Please select Next Action");
      return;
    }
    if (!form.priority_code) {
      setError("Please select Priority");
      return;
    }
    setBusy(true);
    setError(null);
    const payload: any = {
      name: form.rule_id || (form as any).name,
      entity_code: form.entity_code,
      follow_up_type_code: form.follow_up_type_code,
      current_stage_code: form.current_stage_code,
      current_status_code: form.current_status_code,
      outcome_code: form.outcome_code,
      reason_code: form.reason_code || null,
      next_stage_code: form.next_stage_code,
      next_status_code: form.next_status_code,
      next_action_code: form.next_action_code,
      next_follow_up_type_code: form.next_follow_up_type_code || null,
      gap_days: form.default_days ?? (form as any).gap_days ?? 0,
      gap_hours: (form as any).gap_hours ?? 0,
      priority_code: form.priority_code,
      auto_remark_template:
        form.remark || (form as any).auto_remark_template || null,
      sequence_name: form.sequence_name || null,
      auto_send_channel: form.auto_whatsapp
        ? "WHATSAPP"
        : form.auto_email
          ? "EMAIL"
          : form.auto_message
            ? "SMS"
            : null,
      auto_send_delay_mins: (form as any).auto_send_delay_mins ?? 0,
      flag_dead_lead: form.terminal ? 1 : 0,
      ai_enabled: form.auto_schedule ? 1 : 0,
      auto_schedule: form.auto_schedule ? true : false,
      notification: form.notification ? true : false,
      terminal: form.terminal ? true : false,
      require_follow_up: form.require_follow_up ? true : false,
      is_catch_all: form.is_catch_all ? true : false,
      display_order: form.display_order ?? 1,
      is_active: form.is_active ? 1 : 0,
    };
    try {
      if (existing) {
        await updateMaster("fu_rules", existing.id, payload);
        toast.success("Rule updated successfully! ✅");
      } else {
        await upsertMaster("fu_rules", payload);
        toast.success("Rule created successfully! ✅");
      }
      onSaved();
    } catch {
      toast.error("Failed to save rule.");
      setError("Failed to save rule");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal rule-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-icon">
            <Zap size={20} />
          </div>
          <div>
            <h2>
              {existing ? "Edit Follow-up Rule" : "Create Follow-up Rule"}
            </h2>
            <p>
              Configure automated next actions, stage progressions, and triggers
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div className="modal-body">
            {error && (
              <div
                style={{
                  color: "#dc2626",
                  fontSize: "12px",
                  padding: "8px 12px",
                  background: "#fee2e2",
                  borderRadius: "8px",
                  border: "1px solid #fca5a5",
                }}
              >
                {error}
              </div>
            )}

            {/* 1. Match Conditions */}
            <div className="rule-form-section">
              <div className="rule-form-section-title">
                <span className="section-num-badge">1</span>
                <h3>Match Conditions</h3>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>
                    Rule ID <span className="req-star">*</span>
                  </label>
                  <input
                    value={form.rule_id ?? ""}
                    onChange={(e) => update("rule_id", e.target.value)}
                    placeholder="e.g. FUR-121"
                    required
                  />
                </div>
                <div className="field">
                  <label>
                    Entity <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.entity_code ?? ""}
                      onChange={(e) => {
                        const newEntity = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          entity_code: newEntity,
                          current_stage_code: "",
                          current_status_code: "",
                          next_stage_code: "",
                          next_status_code: "",
                        }));
                      }}
                    >
                      <option value="">Select Entity...</option>
                      {availableEntities.map((e) => (
                        <option key={e.code} value={e.code}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Follow-up type <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.follow_up_type_code ?? ""}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          follow_up_type_code: newType,
                          outcome_code: "",
                        }));
                      }}
                    >
                      <option value="">Select Type...</option>
                      {availableTypes.map((t) => (
                        <option key={t.code} value={t.code}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Outcome <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.outcome_code ?? ""}
                      onChange={(e) => update("outcome_code", e.target.value)}
                    >
                      <option value="">Select Outcome...</option>
                      {availableOutcomes.map((o) => (
                        <option key={o.code} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Current stage <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.current_stage_code ?? ""}
                      onChange={(e) =>
                        update("current_stage_code", e.target.value)
                      }
                    >
                      <option value="">Select Stage...</option>
                      {availableStages.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Current status <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.current_status_code ?? ""}
                      onChange={(e) =>
                        update("current_status_code", e.target.value)
                      }
                    >
                      <option value="">Select Status...</option>
                      {availableStatuses.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field wide">
                  <label>Reason</label>
                  <div className="select-wrap">
                    <select
                      value={form.reason_code ?? ""}
                      onChange={(e) =>
                        update(
                          "reason_code",
                          e.target.value ? e.target.value : null,
                        )
                      }
                    >
                      <option value="">None (all reasons)</option>
                      {availableReasons.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Next State & Action */}
            <div className="rule-form-section">
              <div className="rule-form-section-title">
                <span className="section-num-badge">2</span>
                <h3>Next State & Action</h3>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>
                    Next stage <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.next_stage_code ?? ""}
                      onChange={(e) =>
                        update("next_stage_code", e.target.value)
                      }
                    >
                      <option value="">Select Stage...</option>
                      {availableStages.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Next status <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.next_status_code ?? ""}
                      onChange={(e) =>
                        update("next_status_code", e.target.value)
                      }
                    >
                      <option value="">Select Status...</option>
                      {availableStatuses.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Next action <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.next_action_code ?? ""}
                      onChange={(e) =>
                        update("next_action_code", e.target.value)
                      }
                    >
                      <option value="">Select Action...</option>
                      {availableNextActions.map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>Next follow-up type</label>
                  <div className="select-wrap">
                    <select
                      value={form.next_follow_up_type_code ?? ""}
                      onChange={(e) =>
                        update(
                          "next_follow_up_type_code",
                          e.target.value ? e.target.value : null,
                        )
                      }
                    >
                      <option value="">Same as current</option>
                      {availableTypes.map((t) => (
                        <option key={t.code} value={t.code}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Schedule & Priority */}
            <div className="rule-form-section">
              <div className="rule-form-section-title">
                <span className="section-num-badge">3</span>
                <h3>Schedule & Priority</h3>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Default days</label>
                  <input
                    type="number"
                    value={form.default_days ?? 1}
                    onChange={(e) =>
                      update("default_days", Number(e.target.value))
                    }
                    min={0}
                  />
                </div>

                <div className="field">
                  <label>Default time</label>
                  <div className="input-with-icon">
                    <input
                      type="time"
                      value={form.default_time ?? "11:00"}
                      onChange={(e) => update("default_time", e.target.value)}
                    />
                    <Clock size={15} />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Priority <span className="req-star">*</span>
                  </label>
                  <div className="select-wrap">
                    <select
                      value={form.priority_code ?? ""}
                      onChange={(e) => update("priority_code", e.target.value)}
                    >
                      <option value="">Select Priority...</option>
                      {availablePriorities.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="field">
                  <label>Sequence</label>
                  <div className="select-wrap">
                    <select
                      value={form.sequence_name ?? ""}
                      onChange={(e) =>
                        update(
                          "sequence_name",
                          e.target.value ? e.target.value : null,
                        )
                      }
                    >
                      <option value="">None (single follow-up)</option>
                      {sequenceNames.map((name) => (
                        <option key={name} value={name}>
                          {formatSequenceName(name)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Auto Remark & Flags */}
            <div className="rule-form-section">
              <div className="rule-form-section-title">
                <span className="section-num-badge">4</span>
                <h3>Auto Remark & Flags</h3>
              </div>

              <div className="field wide">
                <label>Auto remark (shown to employee when completing)</label>
                <textarea
                  placeholder="e.g. Customer did not answer. Schedule another attempt."
                  value={form.remark ?? ""}
                  onChange={(e) => update("remark", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flags-box">
                <label className="custom-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.auto_schedule ?? false}
                    onChange={(e) => update("auto_schedule", e.target.checked)}
                  />
                  <span>Auto schedule</span>
                </label>

                <label className="custom-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.require_follow_up ?? false}
                    onChange={(e) =>
                      update("require_follow_up", e.target.checked)
                    }
                  />
                  <span>Require follow-up</span>
                </label>

                <label className="custom-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.terminal ?? false}
                    onChange={(e) => update("terminal", e.target.checked)}
                  />
                  <span>Terminal</span>
                </label>

                <label className="custom-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.notification ?? false}
                    onChange={(e) => update("notification", e.target.checked)}
                  />
                  <span>Notification</span>
                </label>

                <label className="custom-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_catch_all ?? false}
                    onChange={(e) => update("is_catch_all", e.target.checked)}
                  />
                  <span>Catch-all rule</span>
                </label>

                <label className="custom-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_active ?? true}
                    onChange={(e) => update("is_active", e.target.checked)}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            {/* 5. Auto-Send Automation */}
            <div className="rule-form-section">
              <div className="rule-form-section-title">
                <span className="section-num-badge">5</span>
                <h3>Auto-Send Automation</h3>
              </div>
              <div className="automation-subtext">
                When this rule fires, automatically send messages via the
                selected channels. Placeholders:{" "}
                <span className="placeholder-pill">{"{entity_ref}"}</span>,{" "}
                <span className="placeholder-pill">{"{project}"}</span>,{" "}
                <span className="placeholder-pill">{"{date}"}</span>,{" "}
                <span className="placeholder-pill">{"{time}"}</span>,{" "}
                <span className="placeholder-pill">{"{stage}"}</span>,{" "}
                <span className="placeholder-pill">{"{status}"}</span>.
              </div>

              <div className="auto-send-box">
                <label className="channel-check-item">
                  <Mail size={15} />
                  <input
                    type="checkbox"
                    checked={form.auto_email ?? false}
                    onChange={(e) => update("auto_email", e.target.checked)}
                  />
                  <span>Auto email</span>
                </label>

                <label className="channel-check-item">
                  <MessageCircle size={15} />
                  <input
                    type="checkbox"
                    checked={form.auto_whatsapp ?? false}
                    onChange={(e) => update("auto_whatsapp", e.target.checked)}
                  />
                  <span>Auto WhatsApp</span>
                </label>

                <label className="channel-check-item">
                  <Send size={15} />
                  <input
                    type="checkbox"
                    checked={form.auto_message ?? false}
                    onChange={(e) => update("auto_message", e.target.checked)}
                  />
                  <span>Auto message</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-white-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-orange-primary"
              disabled={busy}
            >
              <Check size={16} /> {busy ? "Saving..." : "Save rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== SEQUENCE FORM MODAL =====
function SequenceForm({
  master,
  existing,
  onClose,
  onSaved,
}: {
  master: MasterData;
  existing: SequenceStep | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<SequenceStep>>(() => {
    if (existing) return { ...existing };
    return {
      sequence_name: "",
      step: 1,
      after_days: 0,
      after_hours: 0,
      action_code: "",
      follow_up_type_code: "",
      priority_code: "",
      terminal_step: false,
      next_status_code: null,
      reason_code: null,
      is_active: true,
    };
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTypes = useMemo(() => {
    const list = master.followUpTypes.filter((t) => t.is_active !== false);
    const source = list.length > 0 ? list : DEFAULT_RULE_FOLLOW_UP_TYPES;
    const map = new Map<string, { code: string; name: string }>();
    source.forEach((t) => {
      const key = (t.code || t.name).toUpperCase();
      if (!map.has(key)) {
        map.set(key, { code: t.code, name: t.name });
      }
    });
    return Array.from(map.values());
  }, [master.followUpTypes]);

  const availableActions = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.nextActions
      .filter((a) => a.is_active !== false)
      .forEach((a) => {
        const key = (a.code || a.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: a.code, name: a.name });
        }
      });
    return Array.from(map.values());
  }, [master.nextActions]);

  const availablePriorities = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.priorities
      .filter((p) => p.is_active !== false)
      .forEach((p) => {
        const key = (p.code || p.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: p.code, name: p.name });
        }
      });
    return Array.from(map.values());
  }, [master.priorities]);

  const availableStatuses = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.statuses
      .filter((s) => s.is_active !== false)
      .forEach((s) => {
        const key = (s.code || s.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: s.code, name: s.name });
        }
      });
    return Array.from(map.values());
  }, [master.statuses]);

  const availableReasons = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.reasons
      .filter((r) => r.is_active !== false)
      .forEach((r) => {
        const key = (r.code || r.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: r.code, name: r.name });
        }
      });
    return Array.from(map.values());
  }, [master.reasons]);

  function update(k: keyof SequenceStep, v: unknown) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.sequence_name?.trim()) {
      setError("Sequence name is required");
      return;
    }
    if (!form.action_code) {
      setError("Please select an Action");
      return;
    }
    if (!form.follow_up_type_code) {
      setError("Please select a Follow-up Type");
      return;
    }
    if (!form.priority_code) {
      setError("Please select Priority");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (existing) {
        await updateMaster("fu_sequences", existing.id, form);
        toast.success("Sequence step updated successfully! ✅");
      } else {
        await upsertMaster("fu_sequences", form);
        toast.success("Sequence step created successfully! ✅");
      }
      onSaved();
    } catch {
      toast.error("Failed to save sequence step.");
      setError("Failed to save sequence step");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Zap size={20} />
          </div>
          <div>
            <h2>{existing ? "Edit sequence step" : "New sequence step"}</h2>
            <p>Define the next automated follow-up in a sequence</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div className="modal-body">
            {error && (
              <div style={{ color: "#dc2626", fontSize: "12px" }}>{error}</div>
            )}

            <div className="form-grid">
              <div className="field">
                <label>
                  Sequence name <span className="req-star">*</span>
                </label>
                <input
                  value={form.sequence_name ?? ""}
                  onChange={(e) => update("sequence_name", e.target.value)}
                  placeholder="e.g. NO_ANSWER_DRIP"
                  required
                />
              </div>

              <div className="field">
                <label>
                  Step <span className="req-star">*</span>
                </label>
                <input
                  type="number"
                  value={form.step ?? 1}
                  onChange={(e) => update("step", Number(e.target.value))}
                  min={1}
                  required
                />
              </div>

              <div className="field">
                <label>After days</label>
                <input
                  type="number"
                  value={form.after_days ?? 0}
                  onChange={(e) => update("after_days", Number(e.target.value))}
                  min={0}
                />
              </div>

              <div className="field">
                <label>After hours</label>
                <input
                  type="number"
                  value={form.after_hours ?? 0}
                  onChange={(e) =>
                    update("after_hours", Number(e.target.value))
                  }
                  min={0}
                />
              </div>

              <div className="field">
                <label>
                  Action <span className="req-star">*</span>
                </label>
                <div className="select-wrap">
                  <select
                    value={form.action_code ?? ""}
                    onChange={(e) => update("action_code", e.target.value)}
                  >
                    <option value="">Select Action...</option>
                    {availableActions.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="field">
                <label>
                  Follow-up type <span className="req-star">*</span>
                </label>
                <div className="select-wrap">
                  <select
                    value={form.follow_up_type_code ?? ""}
                    onChange={(e) =>
                      update("follow_up_type_code", e.target.value)
                    }
                  >
                    <option value="">Select Type...</option>
                    {availableTypes.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="field">
                <label>
                  Priority <span className="req-star">*</span>
                </label>
                <div className="select-wrap">
                  <select
                    value={form.priority_code ?? ""}
                    onChange={(e) => update("priority_code", e.target.value)}
                  >
                    <option value="">Select Priority...</option>
                    {availablePriorities.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="field">
                <label>Next status</label>
                <div className="select-wrap">
                  <select
                    value={form.next_status_code ?? ""}
                    onChange={(e) =>
                      update(
                        "next_status_code",
                        e.target.value ? e.target.value : null,
                      )
                    }
                  >
                    <option value="">Keep current status</option>
                    {availableStatuses.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div className="field">
                <label>Reason</label>
                <div className="select-wrap">
                  <select
                    value={form.reason_code ?? ""}
                    onChange={(e) =>
                      update(
                        "reason_code",
                        e.target.value ? e.target.value : null,
                      )
                    }
                  >
                    <option value="">None</option>
                    {availableReasons.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div
              className="modal-checkbox-card grid-2"
              style={{ marginTop: "12px" }}
            >
              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.terminal_step ?? false}
                  onChange={(e) => update("terminal_step", e.target.checked)}
                />
                <span>Terminal step</span>
              </label>
              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => update("is_active", e.target.checked)}
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-white-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-orange-primary"
              disabled={busy}
            >
              <Check size={16} /> {busy ? "Saving..." : "Save step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== MASTER ITEM (ADD / EDIT) MODAL =====
function MasterItemModal({
  master,
  tab,
  mode,
  id,
  entityFilter,
  typeFilter,
  onClose,
  onSaved,
}: {
  master: MasterData;
  tab: TabKey;
  mode: "add" | "edit";
  id?: string;
  entityFilter: string;
  typeFilter: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const currentRecord = useMemo(() => {
    if (mode !== "edit" || !id) return null;
    const list = (master as unknown as Record<string, SimpleRow[]>)[tab] ?? [];
    return list.find((r) => r.id === id);
  }, [master, tab, mode, id]);

  const [form, setForm] = useState<Record<string, unknown>>(() => {
    if (currentRecord) {
      const rec = { ...currentRecord } as any;
      if (!rec.icon && rec.icon_name) rec.icon = rec.icon_name;
      if (!rec.icon && rec.code) {
        const fallback: Record<string, string> = {
          CALL: "Phone",
          PHONE_CALL: "Phone",
          WHATSAPP: "MessageCircle",
          EMAIL: "Mail",
          SITE_VISIT: "MapPin",
          MEETING: "Users",
          VIDEO_CALL: "Video",
          OTHER: "MoreHorizontal",
        };
        if (fallback[rec.code.toUpperCase()])
          rec.icon = fallback[rec.code.toUpperCase()];
      }
      return rec;
    }

    const initial: Record<string, unknown> = {
      name: "",
      code: "",
      is_active: true,
    };

    if (tab === "entities") {
      initial.display_order = master.entities.length + 1;
    } else if (tab === "types") {
      initial.entity_code =
        entityFilter !== "All"
          ? entityFilter
          : (master.entities[0]?.code ?? "LEAD");
      initial.icon = "Phone";
      initial.icon_name = "Phone";
      initial.display_order = master.followUpTypes.length + 1;
      initial.default_message_template = "";
      initial.requires_outcome = true;
      initial.requires_date = false;
      initial.requires_time = false;
      initial.requires_location = false;
      initial.requires_project = false;
      initial.requires_participants = false;
      initial.requires_template = false;
      initial.creates_next_task = true;
      initial.auto_send_enabled = false;
    } else if (tab === "stages") {
      initial.entity_code =
        entityFilter !== "All"
          ? entityFilter
          : (master.entities[0]?.code ?? "LEAD");
      initial.display_order = master.stages.length + 1;
      initial.is_terminal = false;
    } else if (tab === "statuses") {
      initial.entity_code =
        entityFilter !== "All"
          ? entityFilter
          : (master.entities[0]?.code ?? "LEAD");
      initial.display_order = master.statuses.length + 1;
    } else if (tab === "outcomes") {
      initial.follow_up_type_code =
        typeFilter !== "All"
          ? typeFilter
          : (master.followUpTypes[0]?.code ?? "CALL");
      initial.display_order = master.outcomes.length + 1;
      initial.asks_reason = false;
    } else if (tab === "reasons") {
      initial.outcome_code = "";
      initial.display_order = master.reasons.length + 1;
    } else if (tab === "actions") {
      initial.follow_up_type_code = "";
      initial.display_order = master.nextActions.length + 1;
    } else if (tab === "priorities") {
      initial.level = master.priorities.length + 1;
      initial.display_order = master.priorities.length + 1;
    }

    return initial;
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(k: string, v: unknown) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const singularLabel = singularMap[tab] ?? tab;
  const singularLower = singularLabel.toLowerCase();

  const distinctEntities = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.entities
      .filter((e) => e.is_active !== false)
      .forEach((e) => {
        const key = (e.code || e.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: e.code, name: e.name });
        }
      });
    return Array.from(map.values());
  }, [master.entities]);

  const distinctFollowUpTypes = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.followUpTypes
      .filter((t) => t.is_active !== false)
      .forEach((t) => {
        const key = (t.code || t.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: t.code, name: t.name });
        }
      });
    return Array.from(map.values());
  }, [master.followUpTypes]);

  const distinctOutcomes = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    master.outcomes
      .filter((o) => o.is_active !== false)
      .forEach((o) => {
        const key = (o.code || o.name).toUpperCase();
        if (!map.has(key)) {
          map.set(key, { code: o.code, name: o.name });
        }
      });
    return Array.from(map.values());
  }, [master.outcomes]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nameStr = (form.name as string)?.trim();
    if (!nameStr) {
      setError("Name is required");
      return;
    }
    setBusy(true);
    setError(null);
    const codeStr =
      (form.code as string)?.trim() ||
      nameStr.toUpperCase().replace(/\s+/g, "_");
    const payload = { ...form, name: nameStr, code: codeStr };
    try {
      if (mode === "edit" && id) {
        await updateMaster(tableMap[tab], id, payload);
        toast.success(`${singularLabel} updated successfully! ✅`);
      } else {
        await upsertMaster(tableMap[tab], payload);
        toast.success(`${singularLabel} added successfully! ✅`);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save record. Please ensure unique code.");
      setError("Failed to save record. Please ensure unique code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <Zap size={20} />
          </div>
          <div>
            <h2>
              {mode === "edit"
                ? `Edit ${singularLabel}`
                : `Add ${singularLabel}`}
            </h2>
            <p>
              {mode === "edit"
                ? `Update all fields for this ${singularLower}`
                : `Add a new ${singularLower}`}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div className="modal-body">
            {error && (
              <div style={{ color: "#dc2626", fontSize: "12px" }}>{error}</div>
            )}

            {tab === "entities" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Lead"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="LEAD"
                    />
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="modal-checkbox-card">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}

            {tab === "types" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Phone Call"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="CALL"
                    />
                  </div>
                  <div className="field">
                    <label>
                      Entity <span className="req-star">*</span>
                    </label>
                    <div className="select-wrap">
                      <select
                        value={(form.entity_code as string) ?? ""}
                        onChange={(e) => update("entity_code", e.target.value)}
                      >
                        {distinctEntities.map((e) => (
                          <option key={e.code} value={e.code}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Icon</label>
                    <div className="select-wrap">
                      <select
                        value={
                          (form.icon as string) ||
                          (form.icon_name as string) ||
                          "Phone"
                        }
                        onChange={(e) => {
                          update("icon", e.target.value);
                          update("icon_name", e.target.value);
                        }}
                      >
                        {availableIconNames.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Default message template</label>
                  <textarea
                    value={(form.default_message_template as string) ?? ""}
                    onChange={(e) =>
                      update("default_message_template", e.target.value)
                    }
                    placeholder="Hi {{entity_ref}}, ..."
                    rows={3}
                  />
                </div>

                <div className="modal-checkbox-card grid-3">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.requires_outcome as boolean) ?? true}
                      onChange={(e) =>
                        update("requires_outcome", e.target.checked)
                      }
                    />
                    <span>Requires outcome</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.requires_date as boolean) ?? false}
                      onChange={(e) =>
                        update("requires_date", e.target.checked)
                      }
                    />
                    <span>Requires date</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.requires_time as boolean) ?? false}
                      onChange={(e) =>
                        update("requires_time", e.target.checked)
                      }
                    />
                    <span>Requires time</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.requires_location as boolean) ?? false}
                      onChange={(e) =>
                        update("requires_location", e.target.checked)
                      }
                    />
                    <span>Requires location</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.requires_project as boolean) ?? false}
                      onChange={(e) =>
                        update("requires_project", e.target.checked)
                      }
                    />
                    <span>Requires project</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.requires_participants as boolean) ?? false}
                      onChange={(e) =>
                        update("requires_participants", e.target.checked)
                      }
                    />
                    <span>Requires participants</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.requires_template as boolean) ?? false}
                      onChange={(e) =>
                        update("requires_template", e.target.checked)
                      }
                    />
                    <span>Requires template</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={
                        ((form.creates_next_task ??
                          form.auto_create_next_task) as boolean) ?? true
                      }
                      onChange={(e) => {
                        update("creates_next_task", e.target.checked);
                        update("auto_create_next_task", e.target.checked);
                      }}
                    />
                    <span>Auto-create next task</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.auto_send_enabled as boolean) ?? false}
                      onChange={(e) =>
                        update("auto_send_enabled", e.target.checked)
                      }
                    />
                    <span>Auto-send enabled</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}

            {tab === "stages" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. New"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="NEW"
                    />
                  </div>
                  <div className="field">
                    <label>Entity</label>
                    <div className="select-wrap">
                      <select
                        value={(form.entity_code as string) ?? ""}
                        onChange={(e) => update("entity_code", e.target.value)}
                      >
                        {distinctEntities.map((ent) => (
                          <option key={ent.code} value={ent.code}>
                            {ent.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="modal-checkbox-card grid-2">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_terminal as boolean) ?? false}
                      onChange={(e) => update("is_terminal", e.target.checked)}
                    />
                    <span>Terminal stage</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}

            {tab === "statuses" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. In Progress"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="IN_PROGRESS"
                    />
                  </div>
                  <div className="field">
                    <label>Entity</label>
                    <div className="select-wrap">
                      <select
                        value={(form.entity_code as string) ?? ""}
                        onChange={(e) => update("entity_code", e.target.value)}
                      >
                        {distinctEntities.map((ent) => (
                          <option key={ent.code} value={ent.code}>
                            {ent.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="modal-checkbox-card">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}

            {tab === "outcomes" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Connected"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="CONNECTED"
                    />
                  </div>
                  <div className="field">
                    <label>Follow-up type</label>
                    <div className="select-wrap">
                      <select
                        value={(form.follow_up_type_code as string) ?? ""}
                        onChange={(e) =>
                          update("follow_up_type_code", e.target.value)
                        }
                      >
                        {distinctFollowUpTypes.map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="modal-checkbox-card grid-2">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.asks_reason as boolean) ?? false}
                      onChange={(e) => update("asks_reason", e.target.checked)}
                    />
                    <span>Asks reason</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}

            {tab === "reasons" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Busy on other call"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="BUSY"
                    />
                  </div>
                  <div className="field">
                    <label>Outcome (optional)</label>
                    <div className="select-wrap">
                      <select
                        value={(form.outcome_code as string) ?? ""}
                        onChange={(e) => update("outcome_code", e.target.value)}
                      >
                        <option value="">None (all outcomes)</option>
                        {distinctOutcomes.map((o) => (
                          <option key={o.code} value={o.code}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="modal-checkbox-card">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}

            {tab === "actions" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Schedule Call"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="CALL"
                    />
                  </div>
                  <div className="field">
                    <label>Follow-up type</label>
                    <div className="select-wrap">
                      <select
                        value={(form.follow_up_type_code as string) ?? ""}
                        onChange={(e) =>
                          update("follow_up_type_code", e.target.value)
                        }
                      >
                        <option value="">Generic / All</option>
                        {distinctFollowUpTypes.map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="modal-checkbox-card">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}

            {tab === "priorities" && (
              <>
                <div className="form-grid">
                  <div className="field">
                    <label>
                      Name <span className="req-star">*</span>
                    </label>
                    <input
                      value={(form.name as string) ?? ""}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. High"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Code</label>
                    <input
                      value={(form.code as string) ?? ""}
                      onChange={(e) => update("code", e.target.value)}
                      placeholder="HIGH"
                    />
                  </div>
                  <div className="field">
                    <label>Level (1-4)</label>
                    <input
                      type="number"
                      value={(form.level as number) ?? 1}
                      onChange={(e) => update("level", Number(e.target.value))}
                      min={1}
                      max={10}
                    />
                  </div>
                  <div className="field">
                    <label>Display order</label>
                    <input
                      type="number"
                      value={(form.display_order as number) ?? 1}
                      onChange={(e) =>
                        update("display_order", Number(e.target.value))
                      }
                      min={1}
                    />
                  </div>
                </div>

                <div className="modal-checkbox-card">
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={(form.is_active as boolean) ?? true}
                      onChange={(e) => update("is_active", e.target.checked)}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-white-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-orange-primary"
              disabled={busy}
            >
              <Check size={16} />{" "}
              {busy
                ? "Saving..."
                : `${mode === "edit" ? "Save" : "Add"} ${singularLower}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== IMPORT EXCEL MODAL =====
function ImportExcelModal({
  tab,
  master,
  onClose,
  onSuccess,
}: {
  tab: TabKey;
  master: MasterData;
  onClose: () => void;
  onSuccess: (result: {
    tables: number;
    rows: number;
    duplicatesSkipped?: number;
  }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabTitle = tabs.find((t) => t.key === tab)?.label ?? tab;

  async function handleImportSubmit() {
    if (!file) {
      setError("Please select a JSON (.json) file first.");
      toast.error("Please select a JSON (.json) file first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await importExcelOrFile(file, tab, master);
      onSuccess(res);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Import failed. Please check JSON format.";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-icon">
            <Import size={20} />
          </div>
          <div>
            <h2>Import {tabTitle} Module</h2>
            <p>Upload a JSON (.json) module file to bulk import records</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "20px",
          }}
        >
          {error && (
            <div
              style={{
                color: "#dc2626",
                background: "#fef2f2",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    color: "#1e293b",
                  }}
                >
                  1. Need sample format?
                </strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Download sample JSON template for {tabTitle}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-white-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    padding: "6px 12px",
                  }}
                  onClick={() => downloadSampleJSONTemplate(tab)}
                >
                  <FileCode size={14} /> Download Sample JSON
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "8px",
              }}
            >
              2. Upload JSON File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setError(null);
                }
              }}
              hidden
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "10px",
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: file ? "#f0fdf4" : "#fafafa",
                borderColor: file ? "#86efac" : "#cbd5e1",
                transition: "all 0.2s",
              }}
            >
              <Import
                size={28}
                style={{
                  color: file ? "#16a34a" : "#94a3b8",
                  margin: "0 auto 8px",
                }}
              />
              {file ? (
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#15803d",
                      fontSize: "14px",
                    }}
                  >
                    {file.name}
                  </strong>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {(file.size / 1024).toFixed(1)} KB · Ready to import
                  </span>
                </div>
              ) : (
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#334155",
                      fontSize: "14px",
                    }}
                  >
                    Click to select JSON (.json) file
                  </strong>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Supports .json module backup
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-white-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-orange-primary"
            onClick={() => void handleImportSubmit()}
            disabled={busy || !file}
            style={{ minWidth: "120px" }}
          >
            {busy ? (
              "Importing..."
            ) : (
              <>
                <Check size={16} /> Import Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
