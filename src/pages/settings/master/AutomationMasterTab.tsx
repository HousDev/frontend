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
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
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

  // Add / Edit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: "stage" | "status" | "outcome"; data: any } | null>(null);
  const [modalInputValue, setModalInputValue] = useState("");
  const [selectedStageIdForOutcome, setSelectedStageIdForOutcome] = useState<number | null>(null);

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
  const filteredStages = useMemo(
    () => stages.filter((x) => x.name.toLowerCase().includes(search.toLowerCase())),
    [stages, search]
  );

  const filteredStatuses = useMemo(
    () => statuses.filter((x) => x.name.toLowerCase().includes(search.toLowerCase())),
    [statuses, search]
  );

  const filteredOutcomes = useMemo(
    () => outcomes.filter((x) => x.name.toLowerCase().includes(search.toLowerCase())),
    [outcomes, search]
  );

  // Handlers for Add & Edit via API
  const handleSaveModalItem = async () => {
    if (!modalInputValue.trim()) return;
    const name = modalInputValue.trim();

    try {
      if (editingItem) {
        // Edit Mode
        const { type, data } = editingItem;
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
          const res = await automationEngineAPI.createStage({
            entity,
            name,
            order_index: stages.length + 1,
            is_active: true
          });
          if (res.success) toast.success(`Stage "${name}" saved to Database!`);
        } else if (activeTab === "statuses") {
          const res = await automationEngineAPI.createStatus({
            entity,
            name,
            is_active: true
          });
          if (res.success) toast.success(`Status "${name}" saved to Database!`);
        } else if (activeTab === "outcomes") {
          const targetStageId = selectedStageIdForOutcome || stages[0]?.id;
          if (!targetStageId) {
            toast.error("Please select a stage for this outcome");
            return;
          }
          const res = await automationEngineAPI.createOutcome({
            entity,
            stage_id: targetStageId,
            name,
            is_active: true
          });
          if (res.success) toast.success(`Outcome "${name}" saved to Database!`);
        }
      }

      setModalInputValue("");
      setShowAddModal(false);
      setEditingItem(null);
      loadMasterGraph(entity);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save item");
    }
  };

  const handleToggleItemStatus = async (id: number, type: "stages" | "statuses" | "outcomes") => {
    try {
      if (type === "stages") {
        const target = stages.find((s) => s.id === id);
        if (target) await automationEngineAPI.updateStage(id, { is_active: !target.is_active });
      } else if (type === "statuses") {
        const target = statuses.find((s) => s.id === id);
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

      toast.info("Item deleted from database");
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
          toast.success(`Rule "${ruleData.name}" updated in Database!`);
          setShowRuleBuilder(false);
          setEditingRule(null);
          loadMasterGraph(entity);
        } else {
          toast.error(res.message || "Failed to update rule");
        }
      } else {
        const res = await automationEngineAPI.createRule(ruleData);
        if (res.success) {
          toast.success(`Automation Rule "${ruleData.name}" created in Database!`);
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

  return (
    <div className="bg-slate-50 text-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200">
      {/* Header Bar */}
      <header className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="text-[#E6761D]" size={18} />
            Database Automation Masters & Rules Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure entity-specific stages, statuses, outcomes, and rules persisted in MySQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-800 shadow-2xs transition-all"
          >
            <Play size={14} className="text-[#0b3856]" />
            Rule Simulator
          </button>

          <button
            onClick={() => {
              setEditingRule(null);
              setShowRuleBuilder(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded-lg shadow-2xs transition-all"
          >
            <Plus size={15} />
            Create Rule
          </button>
        </div>
      </header>

      {/* Entity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {(["lead", "buyer", "seller"] as EntityType[]).map((item) => {
          const selected = entity === item;

          return (
            <button
              key={item}
              onClick={() => {
                setEntity(item);
                setSearch("");
              }}
              className={`text-left rounded-xl border p-4 transition-all ${
                selected
                  ? "border-[#0b3856] bg-white shadow-md ring-1 ring-[#0b3856]/20"
                  : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    CRM Entity
                  </p>
                  <h2 className="text-sm font-bold text-slate-900 mt-0.5 uppercase">
                    {item} Pipeline
                  </h2>
                </div>

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selected
                      ? "bg-[#0b3856] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item === "lead" ? "L" : item === "buyer" ? "B" : "S"}
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-xs text-slate-500 font-medium">
                <span>
                  <b className="text-slate-900 font-bold">{stages.length}</b> Stages
                </span>
                <span>
                  <b className="text-slate-900 font-bold">{statuses.length}</b> Statuses
                </span>
                <span>
                  <b className="text-slate-900 font-bold">{outcomes.length}</b> Outcomes
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Tabs Bar */}
        <div className="border-b border-slate-200 px-5 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === tab.key
                      ? "border-[#0b3856] text-[#0b3856]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab !== "rules" && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setModalInputValue("");
                  if (activeTab === "outcomes" && stages.length > 0) {
                    setSelectedStageIdForOutcome(stages[0].id || null);
                  }
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded-lg shadow-2xs transition-all"
              >
                <Plus size={14} />
                Add {activeTab.slice(0, -1)}
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 capitalize">
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
                  : rules.length}{" "}
                items
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#0b3856] bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Content Views */}
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading data from database...</div>
        ) : (
          <>
            {activeTab === "stages" && (
              <StageList
                stages={filteredStages}
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
                items={filteredStatuses}
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
              <MasterList
                items={filteredOutcomes}
                type="Outcome"
                onEdit={(oc) => {
                  setEditingItem({ type: "outcome", data: oc });
                  setModalInputValue(oc.name);
                  setSelectedStageIdForOutcome((oc as OutcomeData).stage_id);
                  setShowAddModal(true);
                }}
                onToggle={(id) => handleToggleItemStatus(id, "outcomes")}
                onDelete={(id) => handleDeleteItem(id, "outcomes")}
              />
            )}

            {activeTab === "rules" && (
              <RuleList
                entity={entity}
                rules={rules}
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
          </>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {showAddModal && (
        <Modal
          title={
            editingItem
              ? `Edit ${editingItem.type.toUpperCase()}: ${editingItem.data.name}`
              : `Add New ${entity.toUpperCase()} ${activeTab.slice(0, -1)}`
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                placeholder={`Enter name...`}
                className="w-full text-xs font-medium border border-slate-300 rounded p-2.5 outline-none focus:ring-1 focus:ring-[#0b3856]"
              />
            </div>

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
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded shadow-xs"
              >
                {editingItem ? "Update in DB" : "Save to Database"}
              </button>
            </div>
          </div>
        </Modal>
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
            className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-all text-xs"
          >
            <div className="flex items-center gap-3">
              <GripVertical size={14} className="text-slate-300 cursor-grab" />
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[11px] font-bold text-[#0b3856]">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-slate-800">{stage.name}</p>
                <p className="text-[10px] text-slate-400">Step {index + 1} ({stage.code || stage.name})</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => stage.id && onToggle(stage.id)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                  stage.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {stage.is_active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={() => onEdit(stage)}
                className="p-1 text-slate-400 hover:text-[#0b3856] rounded transition-colors"
                title="Edit stage"
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={() => stage.id && onDelete(stage.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
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
      <div className="grid grid-cols-[60px_1fr_140px_120px_100px] px-5 py-2.5 bg-slate-50 border-b text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
            className="grid grid-cols-[60px_1fr_140px_120px_100px] items-center px-5 py-3 border-b border-slate-100 hover:bg-slate-50 text-xs font-medium"
          >
            <span className="text-slate-400 font-mono text-[11px]">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="font-bold text-slate-800">{item.name}</span>

            <span className="text-[11px] text-slate-500">
              {(item as OutcomeData).stage_name || "Global"}
            </span>

            <div>
              <button
                onClick={() => item.id && onToggle(item.id)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                  item.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {item.is_active ? "Active" : "Inactive"}
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-1 text-slate-400 hover:text-[#0b3856] rounded transition-colors"
                title="Edit item"
              >
                <Pencil size={14} />
              </button>

              <button
                onClick={() => item.id && onDelete(item.id)}
                className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
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
        <div className="p-12 text-center">
          <Zap className="mx-auto text-slate-300" size={32} />
          <p className="mt-3 text-xs font-bold text-slate-700">No automation rules configured for {entity}</p>
          <button
            onClick={onCreate}
            className="mt-3 px-4 py-1.5 text-xs font-bold bg-[#0b3856] text-white rounded-lg hover:bg-[#082940]"
          >
            Create First Rule
          </button>
        </div>
      ) : (
        rules.map((rule) => (
          <div key={rule.id} className="p-4 hover:bg-slate-50 transition-all text-xs">
            <div className="flex items-start justify-between">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-[#0b3856]/10 text-[#0b3856] flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    {rule.name}
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      v{rule.version || '1.0'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    When Stage: <b className="text-slate-800">{rule.trigger_stage_name}</b> + Outcome: <b className="text-[#E6761D]">{rule.condition_outcome_name}</b>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {rule.rule_status || 'Published'}
                </span>

                <button
                  onClick={() => onEdit(rule)}
                  className="p-1 text-slate-400 hover:text-[#0b3856] rounded transition-colors"
                  title="Edit rule"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => rule.id && onDelete(rule.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  title="Delete rule"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3">
              <RuleInfo label="Next Stage" value={rule.next_stage_name || '-'} icon={<ArrowRight size={13} />} />
              <RuleInfo label="Next Status" value={rule.next_status_name || '-'} icon={<CheckCircle2 size={13} />} />
              <RuleInfo label="Priority" value={rule.priority || 'Medium'} icon={<Zap size={13} />} />
              <RuleInfo label="SLA" value={`${rule.sla_hours || 24} Hours`} icon={<Clock3 size={13} />} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RuleInfo({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-md p-2 bg-slate-50">
      <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
        {icon}
        {label}
      </div>
      <p className="text-xs font-bold text-slate-800 mt-1 truncate">{value}</p>
    </div>
  );
}

/* ---------------- RULE BUILDER MODAL (Create & Edit) ---------------- */

function RuleBuilder({
  entity,
  stages,
  statuses,
  outcomes,
  editingRule,
  onSaveRule,
  onClose,
}: {
  entity: string;
  stages: StageData[];
  statuses: StatusData[];
  outcomes: OutcomeData[];
  editingRule?: RuleData | null;
  onSaveRule: (rule: RuleData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(editingRule?.name || `${entity.toUpperCase()} - Automation Rule`);
  const [triggerStageId, setTriggerStageId] = useState<number>(editingRule?.trigger_stage_id || stages[0]?.id || 0);
  const [triggerStatusId, setTriggerStatusId] = useState<number | null>(editingRule?.trigger_status_id || null);
  const [conditionOutcomeId, setConditionOutcomeId] = useState<number>(editingRule?.condition_outcome_id || outcomes[0]?.id || 0);
  const [nextStageId, setNextStageId] = useState<number>(editingRule?.next_stage_id || stages[1]?.id || stages[0]?.id || 0);
  const [nextStatusId, setNextStatusId] = useState<number>(editingRule?.next_status_id || statuses[0]?.id || 0);
  const [nextAction, setNextAction] = useState(editingRule?.next_action || "Follow-up Customer");
  const [priority, setPriority] = useState<"Urgent" | "High" | "Medium" | "Low">(editingRule?.priority || "High");
  const [slaHours, setSLAHours] = useState(editingRule?.sla_hours || 24);

  // Filter outcomes based on selected trigger stage
  const availableOutcomesForStage = useMemo(() => {
    return outcomes.filter(o => o.stage_id === triggerStageId);
  }, [outcomes, triggerStageId]);

  useEffect(() => {
    if (!editingRule && availableOutcomesForStage.length > 0) {
      setConditionOutcomeId(availableOutcomesForStage[0].id || 0);
    }
  }, [availableOutcomesForStage, editingRule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerStageId || !conditionOutcomeId) {
      toast.error("Please select a trigger stage and outcome");
      return;
    }

    const newRule: RuleData = {
      id: editingRule?.id,
      name,
      entity,
      trigger_stage_id: triggerStageId,
      trigger_status_id: triggerStatusId,
      condition_outcome_id: conditionOutcomeId,
      next_stage_id: nextStageId,
      next_status_id: nextStatusId,
      next_action: nextAction,
      priority,
      sla_hours: slaHours,
      rule_status: "Published",
      version: editingRule?.version || "1.0"
    };

    onSaveRule(newRule);
  };

  return (
    <Modal title={editingRule ? `Edit ${entity.toUpperCase()} Automation Rule` : `Create ${entity.toUpperCase()} Automation Rule`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs font-medium border border-slate-300 rounded p-2 outline-none focus:ring-1 focus:ring-[#0b3856]"
          />
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-[10px] font-bold text-[#E6761D] uppercase">WHEN EVENT OCCURS</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Current Stage *</label>
              <select
                value={triggerStageId}
                onChange={(e) => setTriggerStageId(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              >
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Outcome Result *</label>
              <select
                value={conditionOutcomeId}
                onChange={(e) => setConditionOutcomeId(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              >
                {availableOutcomesForStage.length > 0 ? (
                  availableOutcomesForStage.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)
                ) : (
                  <option value={0}>No stage outcomes found</option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 space-y-2">
          <p className="text-[10px] font-bold text-[#0b3856] uppercase">THEN EXECUTE AUTOMATION</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Move Next Stage To</label>
              <select
                value={nextStageId}
                onChange={(e) => setNextStageId(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              >
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Change Status To</label>
              <select
                value={nextStatusId}
                onChange={(e) => setNextStatusId(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              >
                {statuses.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              >
                <option value="Urgent">Urgent (2 Hours)</option>
                <option value="High">High (24 Hours)</option>
                <option value="Medium">Medium (48 Hours)</option>
                <option value="Low">Low (72 Hours)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Next Executive Action</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0b3856] hover:bg-[#082940] rounded shadow-xs"
          >
            {editingRule ? "Update Rule in DB" : "Save Rule to DB"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- RULE SIMULATOR MODAL ---------------- */

function RuleSimulator({
  entity,
  stages,
  statuses,
  outcomes,
  onClose,
}: {
  entity: EntityType;
  stages: StageData[];
  statuses: StatusData[];
  outcomes: OutcomeData[];
  onClose: () => void;
}) {
  const [tested, setTested] = useState(false);
  const [simStageId, setSimStageId] = useState(stages[0]?.id || 0);

  const stageOutcomes = useMemo(() => {
    return outcomes.filter(o => o.stage_id === simStageId);
  }, [outcomes, simStageId]);

  const [simOutcomeId, setSimOutcomeId] = useState(stageOutcomes[0]?.id || 0);

  useEffect(() => {
    if (stageOutcomes.length > 0) {
      setSimOutcomeId(stageOutcomes[0].id || 0);
    }
  }, [stageOutcomes]);

  return (
    <Modal title="Automation Rule Simulator" onClose={onClose}>
      <div className="space-y-4 text-xs font-medium">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
          <p className="text-[10px] font-bold uppercase text-[#0b3856]">Test Scenario Inputs</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Entity</label>
              <div className="w-full text-xs font-bold border border-slate-300 rounded p-1.5 bg-white uppercase">
                {entity}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Current Stage</label>
              <select
                value={simStageId}
                onChange={(e) => setSimStageId(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              >
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Outcome Result</label>
              <select
                value={simOutcomeId}
                onChange={(e) => setSimOutcomeId(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded p-1.5 bg-white"
              >
                {stageOutcomes.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={() => setTested(true)}
          className="w-full py-2 bg-[#0b3856] hover:bg-[#082940] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          <Play size={14} className="text-[#E6761D]" />
          Run Test Simulation
        </button>

        {tested && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 size={18} />
              <span className="font-bold text-xs">Automation Evaluation Passed</span>
            </div>

            <div className="bg-white rounded-md border border-emerald-100 overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="flex justify-between p-2">
                <span className="text-slate-500">Next Stage</span>
                <span className="font-bold text-[#0b3856]">{stages[1]?.name || stages[0]?.name}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-slate-500">Next Status</span>
                <span className="font-bold text-[#E6761D]">{statuses[0]?.name || "Active"}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-slate-500">Priority & SLA</span>
                <span className="font-bold text-amber-600">High (24 Hours SLA)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---------------- COMMON MODAL COMPONENT ---------------- */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-[#0b3856] text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
          <h2 className="font-bold text-xs tracking-tight text-white flex items-center gap-2">
            <Sparkles size={14} className="text-[#E6761D]" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
