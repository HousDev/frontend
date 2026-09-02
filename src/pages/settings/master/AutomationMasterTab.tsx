import React, { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  GripVertical,
  Play,
  X,
  CheckCircle2,
  Zap,
  Clock3,
  ArrowRight,
  Upload,
  Download,
  FileSpreadsheet,
  Filter,
  AlertTriangle,
  Layers,
  PlusCircle,
  Sliders,
  ShieldAlert
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  automationEngineAPI,
  StageData,
  StatusData,
  OutcomeData,
  RuleData
} from "@/lib/automationEngineAPI";

type EntityType = "lead" | "buyer" | "seller";

const tabs = [
  { key: "stages", label: "Stages" },
  { key: "statuses", label: "Statuses" },
  { key: "outcomes", label: "Outcomes" },
  { key: "rules", label: "Automation Rules Matrix" },
];

export default function AutomationMasterTab() {
  const [entity, setEntity] = useState<EntityType>("lead");
  const [activeTab, setActiveTab] = useState("stages");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Master State from DB API
  const [stages, setStages] = useState<StageData[]>([]);
  const [statuses, setStatuses] = useState<StatusData[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeData[]>([]);
  const [rules, setRules] = useState<RuleData[]>([]);

  // Modals
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleData | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Add / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: "stage" | "status" | "outcome"; data: any } | null>(null);
  const [modalInputValue, setModalInputValue] = useState("");
  const [selectedStageIdForOutcome, setSelectedStageIdForOutcome] = useState<number | null>(null);
  const [modalOutcomeFields, setModalOutcomeFields] = useState<string[]>([""]);

  // Quick All-in-One Master Setup State (Stage + Status + Outcomes together)
  const [showQuickMasterModal, setShowQuickMasterModal] = useState(false);
  const [quickStageName, setQuickStageName] = useState("");
  const [quickStatusName, setQuickStatusName] = useState("");
  const [quickOutcomeFields, setQuickOutcomeFields] = useState<string[]>([""]);

  // Fetch Master Graph from DB
  const loadMasterGraph = async (currEntity: EntityType) => {
    try {
      setLoading(true);
      const graph = await automationEngineAPI.getMastersGraph(currEntity);
      setStages(graph.stages || []);
      setStatuses(graph.statuses || []);
      setOutcomes(graph.outcomes || []);
      setRules(graph.rules || []);
    } catch (err) {
      console.error("Error loading master graph:", err);
      toast.error("Failed to load master automation graph");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterGraph(entity);
  }, [entity]);

  // Filtering lists
  const filteredStages = useMemo(() => {
    return stages.filter((x) => {
      const matchSearch = x.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : statusFilter === "active" ? x.is_active : !x.is_active;
      return matchSearch && matchStatus;
    });
  }, [stages, search, statusFilter]);

  const filteredStatuses = useMemo(() => {
    return statuses.filter((x) => {
      const matchSearch = x.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : statusFilter === "active" ? x.is_active : !x.is_active;
      return matchSearch && matchStatus;
    });
  }, [statuses, search, statusFilter]);

  const filteredOutcomes = useMemo(() => {
    return outcomes.filter((x) => {
      const matchSearch = x.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : statusFilter === "active" ? x.is_active : !x.is_active;
      const matchStage = stageFilter === "all" ? true : String(x.stage_id) === String(stageFilter);
      return matchSearch && matchStatus && matchStage;
    });
  }, [outcomes, search, statusFilter, stageFilter]);

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchSearch =
        (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.trigger_stage_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.condition_outcome_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.next_action || "").toLowerCase().includes(search.toLowerCase());
      const matchStage = stageFilter === "all" ? true : String(r.trigger_stage_id) === String(stageFilter);
      return matchSearch && matchStage;
    });
  }, [rules, search, stageFilter]);

  // Pagination & Bulk Selection state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Reset page & selections when activeTab, entity, search, or filters change
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [activeTab, entity, search, stageFilter, statusFilter]);

  const totalItems = useMemo(() => {
    if (activeTab === "stages") return filteredStages.length;
    if (activeTab === "statuses") return filteredStatuses.length;
    if (activeTab === "outcomes") return filteredOutcomes.length;
    return filteredRules.length;
  }, [activeTab, filteredStages, filteredStatuses, filteredOutcomes, filteredRules]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  const paginatedStages = useMemo(() => filteredStages.slice((page - 1) * pageSize, page * pageSize), [filteredStages, page, pageSize]);
  const paginatedStatuses = useMemo(() => filteredStatuses.slice((page - 1) * pageSize, page * pageSize), [filteredStatuses, page, pageSize]);
  const paginatedOutcomes = useMemo(() => filteredOutcomes.slice((page - 1) * pageSize, page * pageSize), [filteredOutcomes, page, pageSize]);
  const paginatedRules = useMemo(() => filteredRules.slice((page - 1) * pageSize, page * pageSize), [filteredRules, page, pageSize]);

  const handleBulkDeleteMasterItems = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected ${activeTab}?`)) return;

    setLoading(true);
    try {
      for (const id of selectedIds) {
        if (activeTab === "stages") await automationEngineAPI.deleteStage(id);
        else if (activeTab === "statuses") await automationEngineAPI.deleteStatus(id);
        else if (activeTab === "outcomes") await automationEngineAPI.deleteOutcome(id);
        else if (activeTab === "rules") await automationEngineAPI.deleteRule(id);
      }
      toast.success(`Deleted ${selectedIds.length} selected ${activeTab}!`);
      setSelectedIds([]);
      loadMasterGraph(entity);
    } catch (err: any) {
      toast.error(`Bulk delete failed: ${err.message || 'Error deleting items'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Add & Edit via API
  const handleSaveModalItem = async () => {
    try {
      if (editingItem) {
        // Edit Mode
        const { type, data } = editingItem;
        if (!modalInputValue.trim()) return;
        const name = modalInputValue.trim();

        if (type === "stage") {
          const res = await automationEngineAPI.updateStage(data.id, { name });
          if (res.success) toast.success(`Stage updated to "${name}"`);
        } else if (type === "status") {
          const res = await automationEngineAPI.updateStatus(data.id, { name });
          if (res.success) toast.success(`Status updated to "${name}"`);
        } else if (type === "outcome") {
          const targetStageId = selectedStageIdForOutcome || data.stage_id;
          const res = await automationEngineAPI.updateOutcome(data.id, { name, stage_id: targetStageId });
          if (res.success) toast.success(`Outcome updated to "${name}"`);
        }
      } else {
        // Add Mode
        if (activeTab === "stages") {
          const name = modalInputValue.trim();
          if (!name) return;
          const duplicate = stages.find((s) => s.name.toLowerCase().trim() === name.toLowerCase());
          if (duplicate) {
            toast.error(`Duplicate Stage: Stage "${name}" already exists for ${entity.toUpperCase()}!`);
            return;
          }
          const res = await automationEngineAPI.createStage({
            entity,
            name,
            order_index: stages.length + 1,
            is_active: true
          });
          if (res.success) toast.success(`Stage "${name}" saved!`);
        } else if (activeTab === "statuses") {
          const name = modalInputValue.trim();
          if (!name) return;
          const duplicate = statuses.find((st) => st.name.toLowerCase().trim() === name.toLowerCase());
          if (duplicate) {
            toast.error(`Duplicate Status: Status "${name}" already exists for ${entity.toUpperCase()}!`);
            return;
          }
          const res = await automationEngineAPI.createStatus({
            entity,
            name,
            is_active: true
          });
          if (res.success) toast.success(`Status "${name}" saved!`);
        } else if (activeTab === "outcomes") {
          const targetStageId = selectedStageIdForOutcome || stages[0]?.id;
          if (!targetStageId) {
            toast.error("Please select a stage for outcomes");
            return;
          }

          const rawOutcomeItems = modalOutcomeFields.map((s) => s.trim()).filter(Boolean);
          if (rawOutcomeItems.length === 0) {
            toast.error("Please enter at least one outcome name");
            return;
          }

          const existingOutcomesForStage = outcomes.filter((o) => Number(o.stage_id) === Number(targetStageId));
          let createdCount = 0;
          let duplicateCount = 0;

          for (const outcomeName of rawOutcomeItems) {
            const isDup = existingOutcomesForStage.some(
              (o) => o.name.toLowerCase().trim() === outcomeName.toLowerCase()
            );
            if (isDup) {
              duplicateCount++;
              continue;
            }
            await automationEngineAPI.createOutcome({
              entity,
              stage_id: targetStageId,
              name: outcomeName,
              is_active: true
            });
            createdCount++;
          }

          if (createdCount > 0) {
            toast.success(`Saved ${createdCount} outcome(s)!`);
          }
          if (duplicateCount > 0) {
            toast.warn(`Skipped ${duplicateCount} duplicate outcome(s) that already exist.`);
          }
        }
      }
      setShowAddModal(false);
      setEditingItem(null);
      setModalInputValue("");
      setModalOutcomeFields([""]);
      loadMasterGraph(entity);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save master item");
    }
  };

  const handleSaveQuickMaster = async () => {
    if (!quickStageName.trim()) {
      toast.error("Stage Name is required");
      return;
    }

    try {
      setLoading(true);

      // 1. Create or Find Stage
      let targetStageId: number | null = null;
      const existingStage = stages.find((s) => s.name.toLowerCase() === quickStageName.trim().toLowerCase());
      if (existingStage && existingStage.id) {
        targetStageId = existingStage.id;
      } else {
        const resStage = await automationEngineAPI.createStage({
          entity,
          name: quickStageName.trim(),
          order_index: stages.length + 1,
          is_active: true
        });
        if (resStage.data && resStage.data.id) {
          targetStageId = resStage.data.id;
        }
      }

      if (!targetStageId) {
        toast.error("Failed to create/find stage");
        return;
      }

      // 2. Create Status if provided
      if (quickStatusName.trim()) {
        const existingStatus = statuses.find((st) => st.name.toLowerCase() === quickStatusName.trim().toLowerCase());
        if (!existingStatus) {
          await automationEngineAPI.createStatus({
            entity,
            name: quickStatusName.trim(),
            is_active: true
          });
        }
      }

      // 3. Create Multiple Outcomes from dynamic fields
      const outcomeItems = quickOutcomeFields.map((s) => s.trim()).filter(Boolean);
      if (outcomeItems.length > 0) {
        for (const outcomeName of outcomeItems) {
          await automationEngineAPI.createOutcome({
            entity,
            stage_id: targetStageId,
            name: outcomeName,
            is_active: true
          });
        }
      }

      toast.success("Stage, Status & Outcomes saved successfully!");
      setQuickStageName("");
      setQuickStatusName("");
      setQuickOutcomeFields([""]);
      setShowQuickMasterModal(false);
      loadMasterGraph(entity);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save quick master setup");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItemStatus = async (id: number, type: "stages" | "statuses" | "outcomes") => {
    try {
      if (type === "stages") {
        const target = stages.find((s) => s.id === id);
        if (target) await automationEngineAPI.updateStage(id, { is_active: !target.is_active });
      } else if (type === "statuses") {
        const target = statuses.find((st) => st.id === id);
        if (target) await automationEngineAPI.updateStatus(id, { is_active: !target.is_active });
      } else if (type === "outcomes") {
        const target = outcomes.find((o) => o.id === id);
        if (target) await automationEngineAPI.updateOutcome(id, { is_active: !target.is_active });
      }
      loadMasterGraph(entity);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteItem = async (id: number, type: "stages" | "statuses" | "outcomes") => {
    try {
      if (type === "stages") await automationEngineAPI.deleteStage(id);
      else if (type === "statuses") await automationEngineAPI.deleteStatus(id);
      else if (type === "outcomes") await automationEngineAPI.deleteOutcome(id);

      toast.info("Item deleted");
      loadMasterGraph(entity);
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const handleSaveRule = async (ruleData: RuleData) => {
    try {
      if (editingRule && editingRule.id) {
        const res = await automationEngineAPI.updateRule(editingRule.id, ruleData);
        if (res.success) {
          toast.success(`Rule "${ruleData.name}" updated!`);
          setShowRuleBuilder(false);
          setEditingRule(null);
          loadMasterGraph(entity);
        } else {
          toast.error(res.message || "Failed to update rule");
        }
      } else {
        const res = await automationEngineAPI.createRule(ruleData);
        if (res.success) {
          toast.success(`Automation Rule "${ruleData.name}" created!`);
          setShowRuleBuilder(false);
          loadMasterGraph(entity);
        } else {
          toast.error(res.message || "Failed to create rule");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save rule");
    }
  };

  const handleDeleteRule = async (id: number) => {
    try {
      await automationEngineAPI.deleteRule(id);
      toast.info("Rule deleted");
      loadMasterGraph(entity);
    } catch (err) {
      toast.error("Failed to delete rule");
    }
  };

  const handleBulkStageAction = async (stageId: number, action: "activate_all" | "deactivate_all" | "delete_all") => {
    try {
      const stageOutcomes = outcomes.filter((o) => Number(o.stage_id) === Number(stageId));
      if (stageOutcomes.length === 0) return;

      if (action === "activate_all") {
        for (const oc of stageOutcomes) {
          if (!oc.is_active && oc.id) {
            await automationEngineAPI.updateOutcome(oc.id, { is_active: true });
          }
        }
        toast.success("Activated all outcomes for this stage!");
      } else if (action === "deactivate_all") {
        for (const oc of stageOutcomes) {
          if (oc.is_active && oc.id) {
            await automationEngineAPI.updateOutcome(oc.id, { is_active: false });
          }
        }
        toast.success("Deactivated all outcomes for this stage!");
      } else if (action === "delete_all") {
        for (const oc of stageOutcomes) {
          if (oc.id) {
            await automationEngineAPI.deleteOutcome(oc.id);
          }
        }
        toast.success("Deleted all outcomes for this stage!");
      }
      loadMasterGraph(entity);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process stage outcomes action");
    }
  };

  // Export current tab data to Excel
  const handleExportCurrentTab = () => {
    try {
      const wb = XLSX.utils.book_new();
      const filenameLabel = activeTab === "rules" ? "rules" : activeTab;

      if (activeTab === "stages") {
        const wsData = stages.map((s, idx) => ({
          "Index": idx + 1,
          "Entity": entity.toUpperCase(),
          "Stage Name": s.name,
          "Code": s.code || s.name,
          "Order Index": s.order_index,
          "Status": s.is_active ? "Active" : "Inactive"
        }));
        const ws = XLSX.utils.json_to_sheet(wsData.length > 0 ? wsData : [{ Entity: entity, Note: "No stages" }]);
        XLSX.utils.book_append_sheet(wb, ws, "Stages");
      } else if (activeTab === "statuses") {
        const wsData = statuses.map((st, idx) => ({
          "Index": idx + 1,
          "Entity": entity.toUpperCase(),
          "Status Name": st.name,
          "Status": st.is_active ? "Active" : "Inactive"
        }));
        const ws = XLSX.utils.json_to_sheet(wsData.length > 0 ? wsData : [{ Entity: entity, Note: "No statuses" }]);
        XLSX.utils.book_append_sheet(wb, ws, "Statuses");
      } else if (activeTab === "outcomes") {
        const wsData = outcomes.map((o, idx) => ({
          "Index": idx + 1,
          "Entity": entity.toUpperCase(),
          "Stage Name": o.stage_name || "Global",
          "Outcome Name": o.name,
          "Status": o.is_active ? "Active" : "Inactive"
        }));
        const ws = XLSX.utils.json_to_sheet(wsData.length > 0 ? wsData : [{ Entity: entity, Note: "No outcomes" }]);
        XLSX.utils.book_append_sheet(wb, ws, "Outcomes");
      } else if (activeTab === "rules") {
        const wsData = rules.map((r) => ({
          "Entity": entity.toUpperCase(),
          "Rule Name": r.name || "",
          "Trigger Stage": r.trigger_stage_name || "",
          "Condition Outcome": r.condition_outcome_name || "",
          "Next Stage": r.next_stage_name || "",
          "Next Status": r.next_status_name || "",
          "Next Action": r.next_action || "",
          "Priority": r.priority || "Medium",
          "SLA Hours": r.sla_hours || 24,
          "Status": r.rule_status || "Published"
        }));
        const ws = XLSX.utils.json_to_sheet(wsData.length > 0 ? wsData : [{ Entity: entity, Note: "No rules" }]);
        XLSX.utils.book_append_sheet(wb, ws, "Rules Matrix");
      }

      XLSX.writeFile(wb, `${entity}_${filenameLabel}_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success(`Exported ${entity.toUpperCase()} ${filenameLabel} successfully!`);
    } catch (err: any) {
      toast.error("Export failed: " + err.message);
    }
  };

  // Download Sample Template for Import (Customized for Active Tab with sample data for Lead, Buyer, Seller)
  const handleDownloadTemplate = () => {
    let sampleRows: any[] = [];
    let sheetName = "Template";
    let fileName = `sample_${activeTab}_template.xlsx`;

    if (activeTab === "stages") {
      sheetName = "Stages_Template";
      sampleRows = [
        { Entity: "lead", "Stage Name": "Initial Contact", "Order Index": 1, Status: "Active" },
        { Entity: "lead", "Stage Name": "Requirement Discussion", "Order Index": 2, Status: "Active" },
        { Entity: "lead", "Stage Name": "Site Visit Scheduled", "Order Index": 3, Status: "Active" },
        { Entity: "buyer", "Stage Name": "Requirement Captured", "Order Index": 1, Status: "Active" },
        { Entity: "buyer", "Stage Name": "Site Visit Scheduled", "Order Index": 2, Status: "Active" },
        { Entity: "seller", "Stage Name": "Property Listing Received", "Order Index": 1, Status: "Active" },
      ];
    } else if (activeTab === "statuses") {
      sheetName = "Statuses_Template";
      sampleRows = [
        { Entity: "lead", "Status Name": "New Lead", Status: "Active" },
        { Entity: "lead", "Status Name": "Contacted", Status: "Active" },
        { Entity: "lead", "Status Name": "Hot Lead", Status: "Active" },
        { Entity: "lead", "Status Name": "In Progress", Status: "Active" },
        { Entity: "lead", "Status Name": "Closed Won", Status: "Active" },
        { Entity: "lead", "Status Name": "Closed Lost", Status: "Active" },
        { Entity: "buyer", "Status Name": "Verified Buyer", Status: "Active" },
        { Entity: "seller", "Status Name": "Verified Owner", Status: "Active" },
      ];
    } else if (activeTab === "outcomes") {
      sheetName = "Outcomes_Template";
      // 1 Stage -> Many Outcomes structure!
      sampleRows = [
        // Stage 1: Initial Contact with multiple outcomes
        { Entity: "lead", "Stage Name": "Initial Contact", "Outcome Name": "Connected", Status: "Active" },
        { Entity: "lead", "Stage Name": "Initial Contact", "Outcome Name": "Busy / No Answer", Status: "Active" },
        { Entity: "lead", "Stage Name": "Initial Contact", "Outcome Name": "Ringing / No Response", Status: "Active" },
        { Entity: "lead", "Stage Name": "Initial Contact", "Outcome Name": "Interested", Status: "Active" },
        { Entity: "lead", "Stage Name": "Initial Contact", "Outcome Name": "Not Interested", Status: "Active" },
        // Stage 2: Requirement Discussion with multiple outcomes
        { Entity: "lead", "Stage Name": "Requirement Discussion", "Outcome Name": "Requirement Captured", Status: "Active" },
        { Entity: "lead", "Stage Name": "Requirement Discussion", "Outcome Name": "Site Visit Requested", Status: "Active" },
        { Entity: "lead", "Stage Name": "Requirement Discussion", "Outcome Name": "Out of Budget", Status: "Active" },
        // Buyer sample: 1 Stage -> Many Outcomes
        { Entity: "buyer", "Stage Name": "Requirement Captured", "Outcome Name": "Site Visit Agreed", Status: "Active" },
        { Entity: "buyer", "Stage Name": "Requirement Captured", "Outcome Name": "Pending Preference", Status: "Active" },
        { Entity: "buyer", "Stage Name": "Requirement Captured", "Outcome Name": "Not Interested", Status: "Active" },
      ];
    } else {
      sheetName = "Rules_Matrix_Template";
      // Rules for 1 Stage's Many Outcomes!
      sampleRows = [
        {
          Entity: "lead",
          "Rule Name": "Initial Contact -> Connected Rule",
          "Trigger Stage": "Initial Contact",
          "Condition Outcome": "Connected",
          "Next Stage": "Requirement Discussion",
          "Next Status": "In Progress",
          "Next Action": "Discuss Requirement",
          Priority: "High",
          "SLA Hours": 12,
          Status: "Published"
        },
        {
          Entity: "lead",
          "Rule Name": "Initial Contact -> Busy Re-attempt",
          "Trigger Stage": "Initial Contact",
          "Condition Outcome": "Busy / No Answer",
          "Next Stage": "Initial Contact",
          "Next Status": "Contacted",
          "Next Action": "Call Again",
          Priority: "Medium",
          "SLA Hours": 4,
          Status: "Published"
        },
        {
          Entity: "lead",
          "Rule Name": "Initial Contact -> Interested Rule",
          "Trigger Stage": "Initial Contact",
          "Condition Outcome": "Interested",
          "Next Stage": "Requirement Discussion",
          "Next Status": "Hot Lead",
          "Next Action": "Share Proposal",
          Priority: "High",
          "SLA Hours": 8,
          Status: "Published"
        },
        {
          Entity: "lead",
          "Rule Name": "Initial Contact -> Not Interested Rule",
          "Trigger Stage": "Initial Contact",
          "Condition Outcome": "Not Interested",
          "Next Stage": "Initial Contact",
          "Next Status": "Closed Lost",
          "Next Action": "Archive Lead",
          Priority: "Low",
          "SLA Hours": 48,
          Status: "Published"
        },
        {
          Entity: "buyer",
          "Rule Name": "Buyer Visit Agreement Rule",
          "Trigger Stage": "Requirement Captured",
          "Condition Outcome": "Site Visit Agreed",
          "Next Stage": "Site Visit Scheduled",
          "Next Status": "Verified Buyer",
          "Next Action": "Schedule Visit",
          Priority: "High",
          "SLA Hours": 24,
          Status: "Published"
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    toast.info(`Sample ${activeTab.toUpperCase()} template downloaded with Lead/Buyer/Seller sample data!`);
  };

  return (
    <div className="bg-slate-50 text-slate-800 rounded-xl p-3 md:p-1">
      {/* Header Bar */}
      {/* <header className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-[#E6761D]" size={18} />
            Database Automation Masters & Rules Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure stages, statuses, outcomes, and dynamic rule matrices persisted in MySQL
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Download CSV/Excel Import Template"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            Template
          </button>

          <button
            onClick={() => setShowQuickMasterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Zap size={14} className="text-emerald-600" />
            Quick Add
          </button>

          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-800 shadow-2xs transition-all cursor-pointer"
          >
            <Play size={14} className="text-[#0b3856]" />
            Simulator
          </button>

          <button
            onClick={() => {
              setEditingRule(null);
              setShowRuleBuilder(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            Create Rule
          </button>
        </div>
      </header> */}

      {/* Entity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {(["lead", "buyer", "seller"] as EntityType[]).map((item) => {
          const selected = entity === item;

          return (
            <button
              key={item}
              onClick={() => {
                setEntity(item);
                setSearch("");
                setStageFilter("all");
              }}
              className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${selected
                ? "border-[#0b3856] bg-white shadow-sm ring-1 ring-[#0b3856]/20"
                : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    CRM Entity
                  </p>
                  <h2 className="text-xs font-bold text-slate-900 mt-0.5 uppercase flex items-center gap-1.5">
                    {item} Pipeline
                    {selected && <span className="w-2 h-2 rounded-full bg-[#E6761D]"></span>}
                  </h2>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${selected
                    ? "bg-[#0b3856] text-white"
                    : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {item === "lead" ? "L" : item === "buyer" ? "B" : "S"}
                </div>
              </div>

              <div className="flex gap-3 mt-2.5 text-[11px] text-slate-500 font-medium">
                <span>
                  <b className="text-slate-900 font-bold">{stages.length}</b> Stages
                </span>
                <span>
                  <b className="text-slate-900 font-bold">{statuses.length}</b> Statuses
                </span>
                <span>
                  <b className="text-slate-900 font-bold">{outcomes.length}</b> Outcomes
                </span>
                <span>
                  <b className="text-[#E6761D] font-bold">{rules.length}</b> Rules
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Tabs Bar */}
        <div className="border-b border-slate-200 px-4 bg-slate-50/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === tab.key
                    ? "border-[#0b3856] text-[#0b3856]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {tab.label}
                  {tab.key === "stages" && <span className="ml-1.5 text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full">{stages.length}</span>}
                  {tab.key === "statuses" && <span className="ml-1.5 text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full">{statuses.length}</span>}
                  {tab.key === "outcomes" && <span className="ml-1.5 text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded-full">{outcomes.length}</span>}
                  {tab.key === "rules" && <span className="ml-1.5 text-[10px] bg-orange-100 text-[#E6761D] font-bold px-1.5 py-0.2 rounded-full">{rules.length}</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 py-1.5">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer"
                title={`Import ${activeTab} from CSV/Excel`}
              >
                <Upload size={13} className="text-emerald-600" />
                Import {activeTab === "rules" ? "Rules" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </button>

              <button
                onClick={handleExportCurrentTab}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-lg shadow-2xs transition-all cursor-pointer"
                title={`Export ${activeTab} to Excel`}
              >
                <Download size={13} className="text-orange-600" />
                Export {activeTab === "rules" ? "Rules" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </button>

              {activeTab !== "rules" ? (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setModalInputValue("");
                    if (activeTab === "outcomes" && stages.length > 0) {
                      setSelectedStageIdForOutcome(stages[0].id || null);
                    }
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  Add {activeTab.slice(0, -1)}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setShowRuleBuilder(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  Create Rule
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 capitalize">
              {entity}{" "}
              {activeTab === "rules"
                ? "Automation Rules Matrix"
                : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                {activeTab === "stages"
                  ? filteredStages.length
                  : activeTab === "statuses"
                    ? filteredStatuses.length
                    : activeTab === "outcomes"
                      ? filteredOutcomes.length
                      : filteredRules.length}{" "}
                items
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-7 pr-3 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#0b3856] bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Stage Filter (for Outcomes & Rules) */}
            {(activeTab === "outcomes" || activeTab === "rules") && (
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 focus:bg-white outline-none focus:border-[#0b3856]"
              >
                <option value="all">All Stages</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            {activeTab !== "rules" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 focus:bg-white outline-none focus:border-[#0b3856]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            )}

            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDeleteMasterItems}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 size={12} />
                Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Content Views */}
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading master data from database...</div>
        ) : (
          <div className="h-[290px] overflow-y-auto divide-y divide-slate-100">
            {activeTab === "stages" && (
              <StageList
                stages={paginatedStages}
                onEdit={(stg) => {
                  setEditingItem({ type: "stage", data: stg });
                  setModalInputValue(stg.name);
                  setShowAddModal(true);
                }}
                onToggle={(id) => handleToggleItemStatus(id, "stages")}
                onDelete={(id) => handleDeleteItem(id, "stages")}
              />
            )}

            {activeTab === "statuses" && (
              <MasterList
                items={paginatedStatuses}
                type="Status"
                onEdit={(st) => {
                  setEditingItem({ type: "status", data: st });
                  setModalInputValue(st.name);
                  setShowAddModal(true);
                }}
                onToggle={(id) => handleToggleItemStatus(id, "statuses")}
                onDelete={(id) => handleDeleteItem(id, "statuses")}
              />
            )}

            {activeTab === "outcomes" && (
              <OutcomeGroupedList
                outcomes={paginatedOutcomes}
                stages={stages}
                onEdit={(oc) => {
                  setEditingItem({ type: "outcome", data: oc });
                  setModalInputValue(oc.name);
                  setSelectedStageIdForOutcome(oc.stage_id);
                  setShowAddModal(true);
                }}
                onToggle={(id) => handleToggleItemStatus(id, "outcomes")}
                onDelete={(id) => handleDeleteItem(id, "outcomes")}
                onAddForStage={(stageId) => {
                  setEditingItem(null);
                  setModalInputValue("");
                  setSelectedStageIdForOutcome(stageId);
                  setShowAddModal(true);
                }}
                onBulkStageAction={handleBulkStageAction}
              />
            )}

            {activeTab === "rules" && (
              <RuleList
                entity={entity}
                rules={paginatedRules}
                onCreate={() => {
                  setEditingRule(null);
                  setShowRuleBuilder(true);
                }}
                onEdit={(rule) => {
                  setEditingRule(rule);
                  setShowRuleBuilder(true);
                }}
                onDelete={handleDeleteRule}
              />
            )}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600 font-medium">
          <div>
            Showing {totalItems > 0 ? Math.min((page - 1) * pageSize + 1, totalItems) : 0} to {Math.min(page * pageSize, totalItems)} of {totalItems} items
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-slate-300 rounded px-1.5 py-0.5 bg-white text-xs font-bold"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-bold cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-slate-800">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-bold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {showAddModal && (
        <Modal
          title={
            editingItem
              ? `Edit ${editingItem.type.toUpperCase()}: ${editingItem.data.name}`
              : `Add ${entity.toUpperCase()} ${activeTab.slice(0, -1)}`
          }
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        >
          <div className="space-y-4 text-xs font-medium">
            {(activeTab === "outcomes" || (editingItem && editingItem.type === "outcome")) && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Stage *</label>
                <select
                  value={selectedStageIdForOutcome || ""}
                  onChange={(e) => setSelectedStageIdForOutcome(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-slate-300 rounded p-2 outline-none focus:ring-1 focus:ring-[#0b3856]"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === "outcomes" && !editingItem ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Outcome Name(s) *</label>
                <div className="space-y-2">
                  {modalOutcomeFields.map((fieldVal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fieldVal}
                        onChange={(e) => {
                          const updated = [...modalOutcomeFields];
                          updated[idx] = e.target.value;
                          setModalOutcomeFields(updated);
                        }}
                        placeholder={`Outcome #${idx + 1} (e.g. ${idx === 0 ? 'Connected' : idx === 1 ? 'Busy' : 'No Answer'})`}
                        className="w-full text-xs font-medium border border-slate-300 rounded p-2 outline-none focus:ring-1 focus:ring-[#0b3856]"
                      />
                      {modalOutcomeFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setModalOutcomeFields(modalOutcomeFields.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Remove field"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setModalOutcomeFields([...modalOutcomeFields, ""])}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#0b3856] hover:text-[#082940] mt-2.5 cursor-pointer"
                >
                  <Plus size={14} className="text-[#E6761D]" /> Add Another Outcome (+)
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={modalInputValue}
                  onChange={(e) => setModalInputValue(e.target.value)}
                  placeholder={`Enter name...`}
                  className="w-full text-xs font-medium border border-slate-300 rounded p-2.5 outline-none focus:ring-1 focus:ring-[#0b3856]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalItem}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick All-In-One Setup Modal (Stage + Status + Outcomes together) */}
      {showQuickMasterModal && (
        <Modal title={`Quick Add: Stage + Status + Outcomes (${entity.toUpperCase()})`} onClose={() => setShowQuickMasterModal(false)}>
          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Stage Name *</label>
              <input
                type="text"
                value={quickStageName}
                onChange={(e) => setQuickStageName(e.target.value)}
                placeholder="e.g. Initial Contact / Site Visit Scheduled"
                className="w-full text-xs font-medium border border-slate-300 rounded p-2.5 outline-none focus:ring-1 focus:ring-[#0b3856]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Status Name (Optional)</label>
              <input
                type="text"
                value={quickStatusName}
                onChange={(e) => setQuickStatusName(e.target.value)}
                placeholder="e.g. Active / Qualified"
                className="w-full text-xs font-medium border border-slate-300 rounded p-2.5 outline-none focus:ring-1 focus:ring-[#0b3856]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Outcomes for this Stage</label>
              <div className="space-y-2">
                {quickOutcomeFields.map((fieldVal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fieldVal}
                      onChange={(e) => {
                        const updated = [...quickOutcomeFields];
                        updated[idx] = e.target.value;
                        setQuickOutcomeFields(updated);
                      }}
                      placeholder={`Outcome #${idx + 1} (e.g. ${idx === 0 ? 'Connected' : idx === 1 ? 'Busy' : 'No Answer'})`}
                      className="w-full text-xs font-medium border border-slate-300 rounded p-2 outline-none focus:ring-1 focus:ring-[#0b3856]"
                    />
                    {quickOutcomeFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuickOutcomeFields(quickOutcomeFields.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Remove field"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setQuickOutcomeFields([...quickOutcomeFields, ""])}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0b3856] hover:text-[#082940] mt-2.5 cursor-pointer"
              >
                <Plus size={14} className="text-[#E6761D]" /> Add Another Outcome (+)
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowQuickMasterModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveQuickMaster}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs cursor-pointer"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Import Master Modal */}
      {showImportModal && (
        <ImportMasterModal
          entity={entity}
          activeTab={activeTab}
          onClose={() => setShowImportModal(false)}
          onDownloadTemplate={handleDownloadTemplate}
          onImportComplete={() => loadMasterGraph(entity)}
        />
      )}

      {/* Rule Builder (Create / Edit) */}
      {showRuleBuilder && (
        <RuleBuilder
          entity={entity}
          stages={stages}
          statuses={statuses}
          outcomes={outcomes}
          editingRule={editingRule}
          onSaveRule={handleSaveRule}
          onClose={() => {
            setShowRuleBuilder(false);
            setEditingRule(null);
          }}
        />
      )}

      {/* Simulator */}
      {showSimulator && (
        <RuleSimulator
          entity={entity}
          stages={stages}
          statuses={statuses}
          outcomes={outcomes}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
}

/* ---------------- IMPORT MASTER MODAL ---------------- */

interface ParsedImportRow {
  rowNum: number;
  rawRow: any;
  status: "valid" | "duplicate" | "error";
  title: string;
  subtitle?: string;
  reason?: string;
}

function ImportMasterModal({
  entity,
  activeTab,
  onClose,
  onDownloadTemplate,
  onImportComplete
}: {
  entity: EntityType;
  activeTab: string;
  onClose: () => void;
  onDownloadTemplate: () => void;
  onImportComplete: () => void;
}) {
  const [importing, setImporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "valid" | "duplicate" | "error">("all");
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setAnalyzing(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (!rawData || rawData.length === 0) {
          toast.error("No data rows found in uploaded file.");
          setParsedRows([]);
          setAnalyzing(false);
          return;
        }

        // Fetch current entity graph to check against DB duplicates
        const existingGraph = await automationEngineAPI.getMastersGraph(entity);
        const currentStages = existingGraph.stages || [];
        const currentStatuses = existingGraph.statuses || [];
        const currentOutcomes = existingGraph.outcomes || [];
        const currentRules = existingGraph.rules || [];

        const seenInFile = new Set<string>();
        const analyzed: ParsedImportRow[] = [];

        rawData.forEach((row, idx) => {
          const rowNum = idx + 1;
          const rowEntity = (row.Entity || row.entity || entity).toString().toLowerCase();

          if (activeTab === "stages") {
            const stageName = (row["Stage Name"] || row["Name"] || row.stage || row.name || "").toString().trim();
            if (!stageName) {
              analyzed.push({
                rowNum,
                rawRow: row,
                status: "error",
                title: "Invalid Stage Entry",
                reason: "Stage Name is missing or empty"
              });
            } else {
              const lowerKey = `${rowEntity}:${stageName.toLowerCase()}`;
              const existsInDB = currentStages.some((s) => s.name.toLowerCase() === stageName.toLowerCase());
              const isDuplicate = existsInDB || seenInFile.has(lowerKey);

              seenInFile.add(lowerKey);

              analyzed.push({
                rowNum,
                rawRow: row,
                status: isDuplicate ? "duplicate" : "valid",
                title: stageName,
                subtitle: `Order: ${row["Order Index"] || idx + 1}`,
                reason: isDuplicate ? (existsInDB ? "Stage already exists in database" : "Duplicate stage name in uploaded file") : undefined
              });
            }
          } else if (activeTab === "statuses") {
            const statusName = (row["Status Name"] || row["Name"] || row.status || row.name || "").toString().trim();
            if (!statusName) {
              analyzed.push({
                rowNum,
                rawRow: row,
                status: "error",
                title: "Invalid Status Entry",
                reason: "Status Name is missing or empty"
              });
            } else {
              const lowerKey = `${rowEntity}:${statusName.toLowerCase()}`;
              const existsInDB = currentStatuses.some((st) => st.name.toLowerCase() === statusName.toLowerCase());
              const isDuplicate = existsInDB || seenInFile.has(lowerKey);

              seenInFile.add(lowerKey);

              analyzed.push({
                rowNum,
                rawRow: row,
                status: isDuplicate ? "duplicate" : "valid",
                title: statusName,
                subtitle: `Status: ${row["Status"] || "Active"}`,
                reason: isDuplicate ? (existsInDB ? "Status already exists in database" : "Duplicate status name in uploaded file") : undefined
              });
            }
          } else if (activeTab === "outcomes") {
            const stageName = (row["Stage Name"] || row.stage_name || row.stage || "initial contact").toString().trim();
            const rawOutcomeStr = (row["Outcome Name"] || row["Name"] || row.outcome || row.name || "").toString().trim();

            if (!rawOutcomeStr) {
              analyzed.push({
                rowNum,
                rawRow: row,
                status: "error",
                title: "Invalid Outcome Entry",
                reason: "Outcome Name is missing or empty"
              });
            } else {
              // Support multiple outcomes per stage (comma or semicolon separated)
              const outcomeList = rawOutcomeStr.split(/[,;]/).map((s) => s.trim()).filter(Boolean);

              outcomeList.forEach((outcomeName) => {
                const lowerKey = `${rowEntity}:${stageName.toLowerCase()}:${outcomeName.toLowerCase()}`;
                const targetStage = currentStages.find((s) => s.name.toLowerCase() === stageName.toLowerCase());
                const existsInDB = targetStage
                  ? currentOutcomes.some(
                    (o) => Number(o.stage_id) === Number(targetStage.id) && o.name.toLowerCase() === outcomeName.toLowerCase()
                  )
                  : false;
                const isDuplicate = existsInDB || seenInFile.has(lowerKey);

                seenInFile.add(lowerKey);

                analyzed.push({
                  rowNum,
                  rawRow: { ...row, _singleOutcome: outcomeName },
                  status: isDuplicate ? "duplicate" : "valid",
                  title: outcomeName,
                  subtitle: `Stage: ${stageName}`,
                  reason: isDuplicate ? (existsInDB ? "Outcome already exists under this stage" : "Duplicate outcome in uploaded file") : undefined
                });
              });
            }
          } else {
            // RULES MATRIX
            const stageName = (row["Trigger Stage"] || row["Stage Name"] || row.stage || row.trigger_stage || "").toString().trim();
            const outcomeName = (row["Condition Outcome"] || row["Outcome Name"] || row.outcome || row.condition_outcome || "").toString().trim();
            const ruleName = (row["Rule Name"] || `${stageName} -> ${outcomeName}`).toString().trim();

            if (!stageName) {
              analyzed.push({
                rowNum,
                rawRow: row,
                status: "error",
                title: ruleName || "Invalid Rule Entry",
                reason: "Trigger Stage is missing or empty"
              });
            } else if (!outcomeName) {
              analyzed.push({
                rowNum,
                rawRow: row,
                status: "error",
                title: ruleName || "Invalid Rule Entry",
                reason: "Condition Outcome is missing or empty"
              });
            } else {
              const lowerKey = `${rowEntity}:${stageName.toLowerCase()}:${outcomeName.toLowerCase()}`;
              const existsInDB = currentRules.some(
                (r) =>
                  (r.trigger_stage_name || "").toLowerCase() === stageName.toLowerCase() &&
                  (r.condition_outcome_name || "").toLowerCase() === outcomeName.toLowerCase()
              );
              const isDuplicate = existsInDB || seenInFile.has(lowerKey);

              seenInFile.add(lowerKey);

              analyzed.push({
                rowNum,
                rawRow: row,
                status: isDuplicate ? "duplicate" : "valid",
                title: ruleName,
                subtitle: `${stageName} ➡️ ${outcomeName} (Next: ${row["Next Stage"] || "Same Stage"})`,
                reason: isDuplicate ? (existsInDB ? "Rule already exists in database for this Trigger & Outcome" : "Duplicate rule in uploaded file") : undefined
              });
            }
          }
        });

        setParsedRows(analyzed);
      } catch (err: any) {
        toast.error("Failed to parse file: " + err.message);
      } finally {
        setAnalyzing(false);
      }
    };

    reader.readAsBinaryString(selected);
  };

  const handleExecuteImport = async () => {
    const rowsToProcess = parsedRows.filter((r) => {
      if (r.status === "error") return false;
      if (r.status === "duplicate" && skipDuplicates) return false;
      return true;
    });

    if (rowsToProcess.length === 0) {
      toast.warning("No valid non-duplicate rows available to import.");
      return;
    }

    try {
      setImporting(true);
      let importedCount = 0;

      const existingGraph = await automationEngineAPI.getMastersGraph(entity);
      let currentStages = [...(existingGraph.stages || [])];
      let currentStatuses = [...(existingGraph.statuses || [])];
      let currentOutcomes = [...(existingGraph.outcomes || [])];

      for (const item of rowsToProcess) {
        const row = item.rawRow;
        const rowEntity = (row.Entity || row.entity || entity).toString().toLowerCase() as EntityType;

        if (activeTab === "stages") {
          const stageName = (row["Stage Name"] || row["Name"] || row.stage || row.name || "").toString().trim();
          if (!stageName) continue;
          const orderIndex = Number(row["Order Index"] || row.order_index || currentStages.length + 1);
          const isActive = row.Status ? row.Status.toString().toLowerCase() !== "inactive" : true;

          const existing = currentStages.find((s) => s.name.toLowerCase() === stageName.toLowerCase());
          if (!existing) {
            const res = await automationEngineAPI.createStage({
              entity: rowEntity,
              name: stageName,
              order_index: orderIndex,
              is_active: isActive
            });
            if (res.data) {
              currentStages.push(res.data);
              importedCount++;
            }
          }
        } else if (activeTab === "statuses") {
          const statusName = (row["Status Name"] || row["Name"] || row.status || row.name || "").toString().trim();
          if (!statusName) continue;
          const isActive = row.Status ? row.Status.toString().toLowerCase() !== "inactive" : true;

          const existing = currentStatuses.find((st) => st.name.toLowerCase() === statusName.toLowerCase());
          if (!existing) {
            const res = await automationEngineAPI.createStatus({
              entity: rowEntity,
              name: statusName,
              is_active: isActive
            });
            if (res.data) {
              currentStatuses.push(res.data);
              importedCount++;
            }
          }
        } else if (activeTab === "outcomes") {
          const stageName = (row["Stage Name"] || row.stage_name || row.stage || "").toString().trim();
          const outcomeName = item.rawRow._singleOutcome || (row["Outcome Name"] || row["Name"] || row.outcome || row.name || "").toString().trim();
          if (!outcomeName) continue;
          const isActive = row.Status ? row.Status.toString().toLowerCase() !== "inactive" : true;

          // Find or create parent stage
          let targetStage = currentStages.find((s) => s.name.toLowerCase() === (stageName.toLowerCase() || "initial contact"));
          if (!targetStage && stageName) {
            const res = await automationEngineAPI.createStage({
              entity: rowEntity,
              name: stageName,
              order_index: currentStages.length + 1,
              is_active: true
            });
            if (res.data) {
              targetStage = res.data;
              currentStages.push(targetStage!);
            }
          }

          if (targetStage?.id) {
            const existingOutcome = currentOutcomes.find(
              (o) => Number(o.stage_id) === Number(targetStage!.id) && o.name.toLowerCase() === outcomeName.toLowerCase()
            );
            if (!existingOutcome) {
              const res = await automationEngineAPI.createOutcome({
                entity: rowEntity,
                stage_id: targetStage.id,
                name: outcomeName,
                is_active: isActive
              });
              if (res.data) {
                currentOutcomes.push(res.data);
                importedCount++;
              }
            }
          }
        } else {
          // RULES MATRIX
          const stageName = (row["Trigger Stage"] || row["Stage Name"] || row.stage || row.trigger_stage || "").toString().trim();
          const outcomeName = (row["Condition Outcome"] || row["Outcome Name"] || row.outcome || row.condition_outcome || "").toString().trim();
          const nextStageName = (row["Next Stage"] || row.next_stage || "").toString().trim();
          const statusName = (row["Next Status"] || row["Status Name"] || row.status || "").toString().trim();
          const nextAction = (row["Next Action"] || row.next_action || "Follow-up").toString().trim();
          const priority = (row["Priority"] || row.priority || "Medium").toString().trim();
          const slaHours = Number(row["SLA Hours"] || row.sla_hours || 24);

          if (!stageName || !outcomeName) continue;

          // 1. Ensure Trigger Stage exists
          let triggerStage = currentStages.find((s) => s.name.toLowerCase() === stageName.toLowerCase());
          if (!triggerStage) {
            const res = await automationEngineAPI.createStage({
              entity: rowEntity,
              name: stageName,
              order_index: currentStages.length + 1,
              is_active: true
            });
            if (res.data) {
              triggerStage = res.data;
              currentStages.push(triggerStage!);
            }
          }

          // 2. Ensure Next Stage exists if provided
          let nextStage = triggerStage;
          if (nextStageName && nextStageName.toLowerCase() !== stageName.toLowerCase()) {
            nextStage = currentStages.find((s) => s.name.toLowerCase() === nextStageName.toLowerCase()) || null;
            if (!nextStage) {
              const res = await automationEngineAPI.createStage({
                entity: rowEntity,
                name: nextStageName,
                order_index: currentStages.length + 1,
                is_active: true
              });
              if (res.data) {
                nextStage = res.data;
                currentStages.push(nextStage!);
              }
            }
          }

          // 3. Ensure Status exists if provided
          let statusObj = null;
          if (statusName) {
            statusObj = currentStatuses.find((st) => st.name.toLowerCase() === statusName.toLowerCase()) || null;
            if (!statusObj) {
              const res = await automationEngineAPI.createStatus({
                entity: rowEntity,
                name: statusName,
                is_active: true
              });
              if (res.data) {
                statusObj = res.data;
                currentStatuses.push(statusObj!);
              }
            }
          }

          // 4. Ensure Outcome exists under trigger stage
          let outcomeObj = null;
          if (outcomeName && triggerStage?.id) {
            outcomeObj = currentOutcomes.find(
              (o) => Number(o.stage_id) === Number(triggerStage!.id) && o.name.toLowerCase() === outcomeName.toLowerCase()
            );
            if (!outcomeObj) {
              const res = await automationEngineAPI.createOutcome({
                entity: rowEntity,
                stage_id: triggerStage.id,
                name: outcomeName,
                is_active: true
              });
              if (res.data) {
                outcomeObj = res.data;
                currentOutcomes.push(outcomeObj!);
              }
            }
          }

          // 5. Create Rule if trigger stage & condition outcome exist
          if (triggerStage?.id && outcomeObj?.id) {
            const ruleName = (row["Rule Name"] || `${stageName} -> ${outcomeName}`).toString().trim();
            await automationEngineAPI.createRule({
              entity: rowEntity,
              name: ruleName,
              trigger_stage_id: triggerStage.id,
              trigger_stage_name: triggerStage.name,
              condition_outcome_id: outcomeObj.id,
              condition_outcome_name: outcomeObj.name,
              next_stage_id: nextStage?.id || triggerStage.id,
              next_stage_name: nextStage?.name || triggerStage.name,
              next_status_id: statusObj?.id || undefined,
              next_status_name: statusObj?.name || undefined,
              next_action: nextAction,
              priority: priority as any,
              sla_hours: slaHours,
              rule_status: "Published",
              version: "1.0"
            });
            importedCount++;
          }
        }
      }

      const dupCount = parsedRows.filter((r) => r.status === "duplicate").length;
      const errCount = parsedRows.filter((r) => r.status === "error").length;

      toast.success(
        `Import completed: ${importedCount} ${activeTab} items imported (${dupCount} duplicates skipped, ${errCount} errors ignored).`
      );
      onImportComplete();
      onClose();
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error("Import failed: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const totalCount = parsedRows.length;
  const validCount = parsedRows.filter((r) => r.status === "valid").length;
  const duplicateCount = parsedRows.filter((r) => r.status === "duplicate").length;
  const errorCount = parsedRows.filter((r) => r.status === "error").length;

  const filteredRows = parsedRows.filter((r) => {
    if (activeFilter === "valid") return r.status === "valid";
    if (activeFilter === "duplicate") return r.status === "duplicate";
    if (activeFilter === "error") return r.status === "error";
    return true;
  });

  return (
    <Modal title={`Import ${activeTab === "rules" ? "Rules Matrix" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} (${entity.toUpperCase()})`} onClose={onClose}>
      <div className="space-y-4 text-xs font-medium">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-blue-900"><FileSpreadsheet size={15} className="text-blue-600" /> {activeTab.toUpperCase()} Importer</p>
          <p className="text-[11px] text-blue-700">
            Upload an Excel (.xlsx, .xls) or CSV file for {activeTab}. Download the official sample template matching your active tab.
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0b3856] bg-white hover:bg-blue-100/70 px-3 py-1.5 rounded-lg border border-blue-300 transition-all cursor-pointer shadow-2xs"
            >
              <Download size={13} className="text-[#0b3856]" />
              <span>Download Sample {activeTab.toUpperCase()} Template (.xlsx)</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Select {activeTab.toUpperCase()} CSV/Excel File</label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            disabled={analyzing || importing}
            className="w-full text-xs text-slate-600 border border-slate-300 rounded-xl p-2 bg-slate-50 cursor-pointer disabled:opacity-50"
          />
        </div>

        {analyzing && (
          <div className="p-4 text-center text-slate-600 font-medium animate-pulse">
            🔍 Analyzing file rows & checking duplicates...
          </div>
        )}

        {totalCount > 0 && !analyzing && (
          <div className="space-y-3">
            {/* Controls & Filter Tabs */}
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1">
                {(["all", "valid", "duplicate", "error"] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setActiveFilter(filterKey)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-all ${activeFilter === filterKey
                      ? "bg-[#0b3856] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    {filterKey === "duplicate" ? "duplicates" : filterKey}{" "}
                    ({filterKey === "all" ? totalCount : filterKey === "valid" ? validCount : filterKey === "duplicate" ? duplicateCount : errorCount})
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded border-slate-300 text-[#0b3856] focus:ring-[#0b3856]"
                />
                Skip duplicates
              </label>
            </div>

            {/* Parsed Rows List */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
              {filteredRows.length === 0 ? (
                <p className="p-3 text-center text-slate-400 italic">No rows match filter '{activeFilter}'</p>
              ) : (
                filteredRows.map((row) => (
                  <div key={row.rowNum} className="p-2 text-[11px] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 font-mono text-[10px]">#{row.rowNum}</span>
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{row.title}</p>
                        {row.subtitle && <p className="text-[10px] text-slate-500 truncate">{row.subtitle}</p>}
                        {row.reason && (
                          <p className={`text-[10px] font-medium ${row.status === "duplicate" ? "text-amber-600" : "text-rose-600"}`}>
                            ⚠️ {row.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${row.status === "valid"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.status === "duplicate"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                        }`}
                    >
                      {row.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={importing || analyzing || totalCount === 0 || (skipDuplicates ? validCount === 0 : validCount + duplicateCount === 0)}
            onClick={handleExecuteImport}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded-lg shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {importing ? "Importing Data..." : `Execute Import (${skipDuplicates ? validCount : validCount + duplicateCount} Items)`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- STAGES LIST ---------------- */

function StageList({
  stages,
  onEdit,
  onToggle,
  onDelete
}: {
  stages: StageData[];
  onEdit: (stage: StageData) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="divide-y divide-slate-100">
      {stages.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">No stages found in database.</div>
      ) : (
        stages.map((stage, index) => (
          <div
            key={stage.id}
            className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-all text-xs"
          >
            <div className="flex items-center gap-3">
              <GripVertical size={14} className="text-slate-300 cursor-grab" />
              <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#0b3856]">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">{stage.name}</p>
                <p className="text-[10px] text-slate-400">Step {index + 1} ({stage.code || stage.name})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => stage.id && onToggle(stage.id)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${stage.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
              >
                {stage.is_active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => onEdit(stage)}
                className="p-1 text-slate-400 hover:text-[#0b3856] rounded transition-colors cursor-pointer"
                title="Edit stage"
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={() => stage.id && onDelete(stage.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                title="Delete stage"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- OUTCOMES GROUPED BY STAGE (REDESIGNED WITH STAGE BULK ACTIONS) ---------------- */

function OutcomeGroupedList({
  outcomes,
  stages,
  onEdit,
  onToggle,
  onDelete,
  onAddForStage,
  onBulkStageAction
}: {
  outcomes: OutcomeData[];
  stages: StageData[];
  onEdit: (outcome: OutcomeData) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAddForStage: (stageId: number) => void;
  onBulkStageAction: (stageId: number, action: "activate_all" | "deactivate_all" | "delete_all") => void;
}) {
  const groupedByStage = useMemo(() => {
    const map = new Map<number | string, { stageId?: number; stageName: string; outcomes: OutcomeData[] }>();

    stages.forEach((stg) => {
      if (stg.id) {
        map.set(stg.id, { stageId: stg.id, stageName: stg.name, outcomes: [] });
      }
    });

    outcomes.forEach((oc) => {
      const key = oc.stage_id || 'global';
      const stageName = oc.stage_name || 'Global / Unassigned';
      if (!map.has(key)) {
        map.set(key, { stageId: oc.stage_id, stageName, outcomes: [] });
      }
      map.get(key)!.outcomes.push(oc);
    });

    return Array.from(map.entries());
  }, [outcomes, stages]);

  return (
    <div className="divide-y divide-slate-100">
      {groupedByStage.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 font-medium">No outcomes found.</div>
      ) : (
        groupedByStage.map(([stageKey, data], index) => {
          const activeCount = data.outcomes.filter((o) => o.is_active).length;
          const inactiveCount = data.outcomes.length - activeCount;

          return (
            <div key={stageKey} className="p-4 hover:bg-slate-50/50 transition-all text-xs">
              {/* Stage Header & Bulk Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0b3856]/10 text-[#0b3856] font-bold text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    {data.stageName}
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {data.outcomes.length} Outcome{data.outcomes.length !== 1 ? "s" : ""} ({activeCount} Active)
                    </span>
                  </h3>
                </div>

                {/* Stage Controls */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {typeof data.stageId === "number" && (
                    <button
                      type="button"
                      onClick={() => onAddForStage(data.stageId!)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-[#0b3856] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-all cursor-pointer"
                      title="Add Outcome to this stage"
                    >
                      <Plus size={12} className="text-[#E6761D]" />
                      Add Outcome
                    </button>
                  )}

                  {data.outcomes.length > 0 && typeof data.stageId === "number" && (
                    <>
                      {inactiveCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onBulkStageAction(data.stageId!, "activate_all")}
                          className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-all cursor-pointer"
                          title="Activate all outcomes for this stage"
                        >
                          Activate
                        </button>
                      )}

                      {activeCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onBulkStageAction(data.stageId!, "deactivate_all")}
                          className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-all cursor-pointer"
                          title="Deactivate all outcomes for this stage"
                        >
                          Deactivate
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ALL ${data.outcomes.length} outcomes for "${data.stageName}"?`
                            )
                          ) {
                            onBulkStageAction(data.stageId!, "delete_all");
                          }
                        }}
                        className="px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-all cursor-pointer"
                        title="Delete all outcomes for this stage"
                      >
                        <Trash2 size={11} className="inline mr-0.5" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Outcome Pills Grid */}
              <div className="flex flex-wrap gap-2 pt-1">
                {data.outcomes.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic py-1 flex items-center gap-1.5">
                    No outcomes configured for this stage yet.
                    {typeof data.stageId === "number" && (
                      <button
                        type="button"
                        onClick={() => onAddForStage(data.stageId!)}
                        className="text-[11px] font-bold text-[#0b3856] hover:underline cursor-pointer"
                      >
                        + Add One Now
                      </button>
                    )}
                  </div>
                ) : (
                  data.outcomes.map((oc) => (
                    <div
                      key={oc.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${oc.is_active
                        ? "bg-white text-slate-800 border-slate-200 shadow-2xs hover:border-[#0b3856]/40"
                        : "bg-slate-100 text-slate-400 border-slate-200 opacity-60"
                        }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${oc.is_active ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                        ></span>
                        <span>{oc.name}</span>
                      </span>

                      <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => oc.id && onToggle(oc.id)}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${oc.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                            }`}
                          title={
                            oc.is_active
                              ? "Click to deactivate outcome"
                              : "Click to activate outcome"
                          }
                        >
                          {oc.is_active ? "Active" : "Inactive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(oc)}
                          className="p-1 text-slate-400 hover:text-[#0b3856] rounded transition-colors cursor-pointer"
                          title="Edit outcome"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => oc.id && onDelete(oc.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Delete outcome"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ---------------- STATUS / OUTCOME LIST ---------------- */

function MasterList({
  items,
  type,
  onEdit,
  onToggle,
  onDelete
}: {
  items: (StatusData | OutcomeData)[];
  type: string;
  onEdit: (item: any) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-[50px_1fr_140px_100px_80px] px-4 py-2 bg-slate-50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <span>#</span>
        <span>{type} Name</span>
        <span>Stage Context</span>
        <span>Status</span>
        <span className="text-right">Action</span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">No {type.toLowerCase()}s found.</div>
      ) : (
        items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[50px_1fr_140px_100px_80px] items-center px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 text-xs font-medium"
          >
            <span className="text-slate-400 font-mono text-[11px]">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="font-bold text-slate-800 text-xs">{item.name}</span>

            <span className="text-[11px] text-slate-500">
              {(item as OutcomeData).stage_name || "Global"}
            </span>

            <div>
              <button
                onClick={() => item.id && onToggle(item.id)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${item.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
              >
                {item.is_active ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => onEdit(item)}
                className="p-1 text-slate-400 hover:text-[#0b3856] rounded transition-colors cursor-pointer"
                title="Edit item"
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={() => item.id && onDelete(item.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                title="Delete item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- RULE LIST ---------------- */

function RuleList({
  entity,
  rules,
  onCreate,
  onEdit,
  onDelete
}: {
  entity: string;
  rules: RuleData[];
  onCreate: () => void;
  onEdit: (rule: RuleData) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="divide-y divide-slate-100">
      {rules.length === 0 ? (
        <div className="p-10 text-center">
          <Zap className="mx-auto text-slate-300" size={32} />
          <p className="mt-2 text-xs font-bold text-slate-700">No automation rules configured for {entity}</p>
          <button
            onClick={onCreate}
            className="mt-3 px-4 py-1.5 text-xs font-bold bg-[#0b3856] text-white rounded-lg hover:bg-[#082940] shadow-2xs"
          >
            Create First Rule
          </button>
        </div>
      ) : (
        rules.map((rule) => (
          <div key={rule.id} className="p-3.5 hover:bg-slate-50 transition-all text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-lg bg-[#0b3856]/10 text-[#0b3856] flex items-center justify-center shrink-0">
                  <Zap size={15} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    {rule.name}
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                      v{rule.version || '1.0'}
                    </span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-0.5 flex-wrap">
                    <span>Stage: <b className="text-slate-900 font-bold">{rule.trigger_stage_name}</b></span>
                    <span>+</span>
                    <span>Outcome: <b className="text-[#E6761D] font-bold">{rule.condition_outcome_name}</b></span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="font-bold text-emerald-700">Next Stage: {rule.next_stage_name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700">Action: {rule.next_action || 'Follow-up'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {rule.rule_status || 'Published'}
                </span>

                <button
                  onClick={() => onEdit(rule)}
                  className="p-1 text-slate-400 hover:text-[#0b3856] rounded transition-colors cursor-pointer"
                  title="Edit rule"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => rule.id && onDelete(rule.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                  title="Delete rule"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- RULE BUILDER MODAL ---------------- */

function RuleBuilder({
  entity,
  stages,
  statuses,
  outcomes,
  editingRule,
  onSaveRule,
  onClose
}: {
  entity: EntityType;
  stages: StageData[];
  statuses: StatusData[];
  outcomes: OutcomeData[];
  editingRule: RuleData | null;
  onSaveRule: (rule: RuleData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(editingRule?.name || "");
  const [triggerStageId, setTriggerStageId] = useState<number | undefined>(editingRule?.trigger_stage_id || stages[0]?.id);
  const [conditionOutcomeId, setConditionOutcomeId] = useState<number | undefined>(editingRule?.condition_outcome_id);
  const [nextStageId, setNextStageId] = useState<number | undefined>(editingRule?.next_stage_id || stages[0]?.id);
  const [nextStatusId, setNextStatusId] = useState<number | undefined>(editingRule?.next_status_id || statuses[0]?.id);
  const [nextAction, setNextAction] = useState(editingRule?.next_action || "Call Again");
  const [priority, setPriority] = useState<any>(editingRule?.priority || "Medium");
  const [slaHours, setSlaHours] = useState<number>(editingRule?.sla_hours || 24);
  const [ruleStatus, setRuleStatus] = useState<"Published" | "Draft">(editingRule?.rule_status || "Published");

  const availableOutcomes = useMemo(() => {
    if (!triggerStageId) return outcomes;
    return outcomes.filter((o) => Number(o.stage_id) === Number(triggerStageId));
  }, [outcomes, triggerStageId]);

  useEffect(() => {
    if (availableOutcomes.length > 0 && !conditionOutcomeId) {
      setConditionOutcomeId(availableOutcomes[0].id);
    }
  }, [availableOutcomes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a rule name");
      return;
    }
    if (!triggerStageId || !conditionOutcomeId || !nextStageId) {
      toast.error("Please select Trigger Stage, Condition Outcome, and Next Stage");
      return;
    }

    const tStage = stages.find((s) => s.id === triggerStageId);
    const nStage = stages.find((s) => s.id === nextStageId);
    const cOutcome = outcomes.find((o) => o.id === conditionOutcomeId);
    const nStatus = statuses.find((st) => st.id === nextStatusId);

    onSaveRule({
      id: editingRule?.id,
      entity,
      name: name.trim(),
      trigger_stage_id: triggerStageId,
      trigger_stage_name: tStage?.name || "",
      condition_outcome_id: conditionOutcomeId,
      condition_outcome_name: cOutcome?.name || "",
      next_stage_id: nextStageId,
      next_stage_name: nStage?.name || "",
      next_status_id: nextStatusId,
      next_status_name: nStatus?.name || "",
      next_action: nextAction,
      priority,
      sla_hours: slaHours,
      rule_status: ruleStatus,
      version: editingRule?.version || "1.0"
    });
  };

  return (
    <Modal title={editingRule ? `Edit Rule: ${editingRule.name}` : `Create ${entity.toUpperCase()} Automation Rule`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Rule Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Schedule Visit when Client Agrees"
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#0b3856]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">WHEN STAGE IS</label>
            <select
              value={triggerStageId || ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                setTriggerStageId(id);
                setConditionOutcomeId(undefined);
              }}
              className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white outline-none"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">AND OUTCOME IS</label>
            <select
              value={conditionOutcomeId || ""}
              onChange={(e) => setConditionOutcomeId(Number(e.target.value))}
              className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white outline-none"
            >
              {availableOutcomes.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
          <div>
            <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">THEN MOVE TO NEXT STAGE</label>
            <select
              value={nextStageId || ""}
              onChange={(e) => setNextStageId(Number(e.target.value))}
              className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white outline-none"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">AND UPDATE NEXT STATUS</label>
            <select
              value={nextStatusId || ""}
              onChange={(e) => setNextStatusId(Number(e.target.value))}
              className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white outline-none"
            >
              {statuses.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Next Action *</label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">SLA (Hours)</label>
            <input
              type="number"
              value={slaHours}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded-lg shadow-xs cursor-pointer"
          >
            Save Rule
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- RULE SIMULATOR ---------------- */

function RuleSimulator({
  entity,
  stages,
  statuses,
  outcomes,
  onClose
}: {
  entity: EntityType;
  stages: StageData[];
  statuses: StatusData[];
  outcomes: OutcomeData[];
  onClose: () => void;
}) {
  const [selectedStageId, setSelectedStageId] = useState<number | undefined>(stages[0]?.id);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<number | undefined>();
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const availableOutcomes = useMemo(() => {
    if (!selectedStageId) return outcomes;
    return outcomes.filter((o) => Number(o.stage_id) === Number(selectedStageId));
  }, [outcomes, selectedStageId]);

  useEffect(() => {
    if (availableOutcomes.length > 0) {
      setSelectedOutcomeId(availableOutcomes[0].id);
    } else {
      setSelectedOutcomeId(undefined);
    }
  }, [availableOutcomes]);

  const handleSimulate = async () => {
    if (!selectedStageId || !selectedOutcomeId) {
      toast.error("Select Stage & Outcome to simulate");
      return;
    }
    try {
      setSimulating(true);
      const res = await automationEngineAPI.evaluateRule({
        entity,
        currentStageId: selectedStageId,
        outcomeId: selectedOutcomeId
      });
      setSimResult(res.data);
    } catch (err) {
      toast.error("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <Modal title={`Automation Rule Simulator (${entity.toUpperCase()})`} onClose={onClose}>
      <div className="space-y-4 text-xs font-medium">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Current Stage</label>
            <select
              value={selectedStageId || ""}
              onChange={(e) => setSelectedStageId(Number(e.target.value))}
              className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white outline-none"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Outcome</label>
            <select
              value={selectedOutcomeId || ""}
              onChange={(e) => setSelectedOutcomeId(Number(e.target.value))}
              className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white outline-none"
            >
              {availableOutcomes.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="w-full py-2 bg-[#0b3856] hover:bg-[#082940] text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Play size={14} />
          {simulating ? "Simulating Rule Evaluation..." : "Run Rule Simulation"}
        </button>

        {simResult && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Simulation Result: {simResult.matched ? "RULE MATCHED!" : "NO EXPLICIT RULE MATCH (FALLBACK)"}
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-800">
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="text-[9px] text-slate-400 block uppercase">NEXT STAGE</span>
                {simResult.nextStageName || simResult.nextStageId || "Same Stage"}
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100">
                <span className="text-[9px] text-slate-400 block uppercase">NEXT ACTION</span>
                {simResult.nextAction || "Follow-up"}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---------------- GENERIC MODAL WRAPPER ---------------- */

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        <header className="bg-[#0b3856] text-white px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders size={16} className="text-[#E6761D]" />
            {title}
          </h2>
          <button onClick={onClose} className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </header>
        <main className="p-5 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
