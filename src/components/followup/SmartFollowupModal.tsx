import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  automationEngineAPI,
  OutcomeData,
  StageData,
  StatusData,
  RuleData
} from '@/lib/automationEngineAPI';
import { calculateSLADate } from '@/lib/crmAutomationMaster';

export type CRMEntity = 'lead' | 'buyer' | 'seller';
export type PriorityLevel = 'Urgent' | 'High' | 'Medium' | 'Low';
export type FollowupChannel = 'phone' | 'whatsapp' | 'email' | 'visit' | 'meeting' | 'video' | 'other';

export interface FollowUpRecord {
  id: string | number;
  name: string;
  entity: CRMEntity;
  stage?: string;
  stage_id?: number;
  status?: string;
  status_id?: number;
  priority?: PriorityLevel;
  phone?: string;
  email?: string;
  requirement?: string;
  raw?: any;
}

const CHANNEL_LABELS: Record<FollowupChannel, string> = {
  phone: 'Phone Call',
  whatsapp: 'WhatsApp',
  email: 'Email',
  visit: 'Site Visit',
  meeting: 'Meeting',
  video: 'Video Call',
  other: 'Other'
};

const DEFAULT_REASONS = [
  'Busy',
  'No Answer',
  'Not Interested',
  'High Price',
  'Low Budget',
  'Location Mismatch',
  'Booked in Other Project',
  'Planning Later',
  'Invalid / Fake Contact',
  'Loan Issue',
  'Possession Delay',
  'Family Discussion Pending',
  'Custom'
];

interface SmartFollowupModalProps {
  open: boolean;
  record: FollowUpRecord | null;
  onClose: () => void;
  onSaved?: (payload: any) => void | Promise<void>;
  defaultEntity?: CRMEntity;
}

export default function SmartFollowupModal({
  open,
  record,
  onClose,
  onSaved,
  defaultEntity = 'lead'
}: SmartFollowupModalProps) {
  const [selectedEntity, setSelectedEntity] = useState<CRMEntity>(record?.entity || defaultEntity);

  // Sync entity when record updates
  useEffect(() => {
    if (record?.entity) {
      setSelectedEntity(record.entity);
    }
  }, [record]);

  // Master Data loaded from DB
  const [stages, setStages] = useState<StageData[]>([]);
  const [statuses, setStatuses] = useState<StatusData[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeData[]>([]);
  const [rules, setRules] = useState<RuleData[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Selected Stage ID state (defaults to record's stage or first stage)
  const [selectedStageId, setSelectedStageId] = useState<number | undefined>(record?.stage_id);

  // Form State
  const [form, setForm] = useState({
    entity: selectedEntity,
    channel: 'phone' as FollowupChannel,
    outcomeId: undefined as number | undefined,
    outcomeName: '',
    reason: '',
    note: '',
    createNext: true,
    quickDate: 'Tomorrow' as 'Today' | 'Tomorrow' | 'Next Week',
    date: calculateSLADate(24),
    time: '11:30',
    nextStageId: undefined as number | undefined,
    nextStatusId: undefined as number | undefined,
    nextAction: 'Call Again',
    priority: 'Medium' as PriorityLevel,
    slaHours: 24,
  });

  const [manualOpen, setManualOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Master Graph (Stages, Statuses, Outcomes, Rules) from DB
  useEffect(() => {
    if (open) {
      setLoadingMasters(true);
      automationEngineAPI
        .getMastersGraph(selectedEntity)
        .then((graph) => {
          setStages(graph.stages || []);
          setStatuses(graph.statuses || []);
          setOutcomes(graph.outcomes || []);
          setRules(graph.rules || []);
        })
        .catch((err) => {
          console.error('Failed to load master graph:', err);
        })
        .finally(() => setLoadingMasters(false));
    }
  }, [open, selectedEntity]);

  // Sync selectedStageId once stages are loaded
  useEffect(() => {
    if (stages.length > 0) {
      if (record?.stage_id) {
        const found = stages.find((s) => s.id === record.stage_id);
        if (found && found.id) {
          setSelectedStageId(found.id);
          return;
        }
      }
      if (record?.stage) {
        const foundByName = stages.find((s) => s.name.toLowerCase() === record.stage?.toLowerCase());
        if (foundByName && foundByName.id) {
          setSelectedStageId(foundByName.id);
          return;
        }
      }
      if (stages[0]?.id) {
        setSelectedStageId(stages[0].id);
      }
    }
  }, [stages, record]);

  // Current Stage Object derived from selectedStageId or record
  const currentStageObj = useMemo(() => {
    if (selectedStageId) {
      const found = stages.find((s) => s.id === selectedStageId);
      if (found) return found;
    }
    if (record?.stage_id) {
      const found = stages.find((s) => s.id === record.stage_id);
      if (found) return found;
    }
    return stages[0] || null;
  }, [stages, selectedStageId, record]);

  // Current Status Name
  const currentStatusName = useMemo(() => {
    if (record?.status) return record.status;
    if (record?.status_id) {
      const found = statuses.find((st) => st.id === record.status_id);
      if (found) return found.name;
    }
    return 'Qualified';
  }, [statuses, record]);

  // Outcomes filtered dynamically for Current Selected Stage (from Master DB)
  const availableOutcomes = useMemo(() => {
    if (!currentStageObj) return outcomes;
    const stageSpecific = outcomes.filter((o) => o.stage_id === currentStageObj.id);
    return stageSpecific.length > 0 ? stageSpecific : outcomes;
  }, [outcomes, currentStageObj]);

  // Reset/auto-select outcome when availableOutcomes or currentStageObj changes
  useEffect(() => {
    if (availableOutcomes.length > 0) {
      const first = availableOutcomes[0];
      setForm((prev) => ({
        ...prev,
        outcomeId: first.id,
        outcomeName: first.name
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        outcomeId: undefined,
        outcomeName: ''
      }));
    }
  }, [availableOutcomes]);

  // 2. Dynamic Automation Rule Evaluation from Master Automation (WHEN Stage + Outcome match)
  const matchedRule = useMemo(() => {
    if (!currentStageObj || !form.outcomeId) return null;
    return (
      rules.find(
        (r) =>
          r.trigger_stage_id === currentStageObj.id &&
          r.condition_outcome_id === form.outcomeId &&
          (r.rule_status === 'Published' || !r.rule_status)
      ) || null
    );
  }, [rules, currentStageObj, form.outcomeId]);

  // Update predicted actions whenever matchedRule updates from Master Rules
  useEffect(() => {
    if (matchedRule) {
      const predictedNextStageId = matchedRule.next_stage_id || currentStageObj?.id;
      const predictedNextStatusId = matchedRule.next_status_id || record?.status_id;
      const predictedAction = matchedRule.next_action || 'Call Again';
      const predictedPriority = (matchedRule.priority as PriorityLevel) || 'Medium';
      const predictedSLA = matchedRule.sla_hours || 24;

      setForm((prev) => ({
        ...prev,
        nextStageId: predictedNextStageId,
        nextStatusId: predictedNextStatusId,
        nextAction: predictedAction,
        priority: predictedPriority,
        slaHours: predictedSLA,
        date: calculateSLADate(predictedSLA)
      }));
    } else {
      // Default fallback predictions if no explicit rule match in Master
      setForm((prev) => ({
        ...prev,
        nextStageId: currentStageObj?.id,
        nextStatusId: record?.status_id,
        nextAction: 'Call Again',
        priority: 'Medium'
      }));
    }
  }, [matchedRule, currentStageObj, record]);

  if (!open) return null;

  const change = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleEntityChange = (newEntity: CRMEntity) => {
    setSelectedEntity(newEntity);
    change('entity', newEntity);
  };

  const handleStageChange = (stageId: number) => {
    setSelectedStageId(stageId);
  };

  const handleOutcomeSelect = (outcomeObj: OutcomeData) => {
    setForm((prev) => ({
      ...prev,
      outcomeId: outcomeObj.id,
      outcomeName: outcomeObj.name
    }));
  };

  const handleQuickDate = (option: 'Today' | 'Tomorrow' | 'Next Week') => {
    let hours = 24;
    if (option === 'Today') hours = 4;
    if (option === 'Tomorrow') hours = 24;
    if (option === 'Next Week') hours = 168;

    setForm((prev) => ({
      ...prev,
      quickDate: option,
      date: calculateSLADate(hours)
    }));
  };

  const handleSave = async () => {
    if (!form.channel) {
      setError('Please select a follow-up channel');
      return;
    }
    if (!form.outcomeName) {
      setError('Please select an outcome (What happened?)');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        entity: selectedEntity,
        entityId: record?.id || 0,
        followupType: form.channel,
        outcomeId: form.outcomeId,
        outcomeName: form.outcomeName,
        reason: form.reason || null,
        notes: form.note.trim(),
        currentStageId: currentStageObj?.id || null,
        currentStatusId: record?.status_id || null,
        nextStageId: form.nextStageId,
        nextStatusId: form.nextStatusId,
        nextAction: form.nextAction,
        priority: form.priority,
        scheduledDate: form.createNext ? form.date : null,
        scheduledTime: form.createNext ? form.time : null
      };

      // Call Transactional Backend Engine
      const response = await automationEngineAPI.submitFollowup(payload as any);

      if (response.success) {
        toast.success(response.message || 'Follow-up submitted successfully!');
        if (onSaved) {
          await onSaved(response.data);
        }
        onClose();
      } else {
        setError(response.message || 'Failed to submit follow-up');
      }
    } catch (err: any) {
      console.error('Error saving follow-up:', err);
      setError(err?.message || 'Failed to save follow-up');
    } finally {
      setLoading(false);
    }
  };

  const nextStageObj = stages.find((s) => s.id === form.nextStageId);
  const nextStatusObj = statuses.find((st) => st.id === form.nextStatusId);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col z-50 border border-slate-200 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 bg-[#0b3856] text-white z-[60] px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-[#E6761D]" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                Add New Follow-up
              </h2>
              <p className="text-xs text-slate-200 mt-0.5">
                {record?.name || 'Customer'} • #{record?.id ? `LD-${record.id}` : 'LD-1024'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Modal Body */}
        <main className="p-5 overflow-y-auto space-y-4 text-xs font-medium text-slate-700">
          {/* Top Row: Entity Selector & Current Stage Selector (From Master Automation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                ENTITY <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedEntity}
                  onChange={(e) => handleEntityChange(e.target.value as CRMEntity)}
                  className="w-full appearance-none border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] transition-all cursor-pointer"
                >
                  <option value="lead">Lead</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                CURRENT STAGE (MASTER AUTOMATION) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedStageId || ''}
                  onChange={(e) => handleStageChange(Number(e.target.value))}
                  className="w-full appearance-none border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] transition-all cursor-pointer"
                >
                  {stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Follow-up Type / Channels Dropdown (As Requested) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              FOLLOW-UP TYPE <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.channel}
                onChange={(e) => change('channel', e.target.value as FollowupChannel)}
                className="w-full appearance-none border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] transition-all cursor-pointer"
              >
                {(Object.keys(CHANNEL_LABELS) as FollowupChannel[]).map((ch) => (
                  <option key={ch} value={ch}>
                    {CHANNEL_LABELS[ch]}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Dynamic DB Outcomes for Selected Stage (What Happened?) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                WHAT HAPPENED? <span className="text-red-500">*</span>
              </label>
              {currentStageObj && (
                <span className="text-[10px] text-slate-400 font-semibold">
                  Fetched from Master for stage "{currentStageObj.name}"
                </span>
              )}
            </div>

            {loadingMasters ? (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                Loading master outcomes...
              </div>
            ) : availableOutcomes.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-semibold">
                No master outcomes configured in Database for stage "{currentStageObj?.name || 'Current'}". Please configure in Master Automation settings.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableOutcomes.map((out) => {
                  const selected = form.outcomeName === out.name || form.outcomeId === out.id;
                  return (
                    <button
                      key={out.id}
                      type="button"
                      onClick={() => handleOutcomeSelect(out)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selected
                          ? 'border-[#E6761D] bg-orange-50 text-[#E6761D] ring-1 ring-[#E6761D] shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{out.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* REASON (OPTIONAL) Dropdown without inner icons */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              REASON (OPTIONAL)
            </label>
            <div className="relative">
              <select
                value={form.reason}
                onChange={(e) => change('reason', e.target.value)}
                className="w-full appearance-none border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] transition-all cursor-pointer"
              >
                <option value="">Select reason...</option>
                {DEFAULT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* SYSTEM AUTOMATION Execution Card (Fetched from Master Automation Rules) */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                SYSTEM AUTOMATION (FROM MASTER)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                {matchedRule ? `RULE MATCHED: ${matchedRule.name || 'AUTOMATION'}` : 'DEFAULT AUTOMATION'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">NEXT STAGE</span>
                <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                  {nextStageObj?.name || 'Initial Contact'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">NEXT STATUS</span>
                <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                  {nextStatusObj?.name || 'Not Connected'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">NEXT ACTION</span>
                <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                  {form.nextAction || 'Call Again'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">PRIORITY</span>
                <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                  {form.priority || 'Medium'}
                </span>
              </div>
            </div>
          </div>

          {/* Next Follow-up Section */}
          <div className="p-3.5 border border-slate-200 rounded-xl space-y-3 bg-slate-50/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Next Follow-up</label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.createNext}
                  onChange={(e) => change('createNext', e.target.checked)}
                  className="rounded text-[#0b3856] focus:ring-[#0b3856]"
                />
                <span>Create automatically</span>
              </label>
            </div>

            {form.createNext && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {(['Today', 'Tomorrow', 'Next Week'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleQuickDate(opt)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        form.quickDate === opt
                          ? 'border-[#0b3856] bg-blue-50 text-[#0b3856] ring-1 ring-[#0b3856]'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      DATE <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => change('date', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856]"
                      />
                      <Calendar size={15} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      TIME <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={form.time}
                        onChange={(e) => change('time', e.target.value)}
                        className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856]"
                      />
                      <Clock size={15} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* EMPLOYEE REMARK */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              EMPLOYEE REMARK
            </label>
            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => change('note', e.target.value)}
              placeholder="Optional: record only useful context. Structured outcome and reason are already saved."
              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 bg-white text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] transition-all placeholder:text-slate-400"
            />
          </div>

          {/* MANUAL OVERRIDE EXPANDER */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setManualOpen(!manualOpen)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#0b3856]" />
                Advanced / Manual Override
              </span>
              {manualOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {manualOpen && (
              <div className="p-4 bg-white border-t border-slate-200 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Override Next Stage</label>
                    <select
                      value={form.nextStageId || ''}
                      onChange={(e) => change('nextStageId', Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none cursor-pointer"
                    >
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Override Next Status</label>
                    <select
                      value={form.nextStatusId || ''}
                      onChange={(e) => change('nextStatusId', Number(e.target.value))}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none cursor-pointer"
                    >
                      {statuses.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Override Next Action</label>
                    <input
                      type="text"
                      value={form.nextAction}
                      onChange={(e) => change('nextAction', e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Override Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => change('priority', e.target.value as PriorityLevel)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none cursor-pointer"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#E6761D] hover:bg-[#d56816] rounded-xl shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save size={15} />
            {loading ? 'Submitting...' : 'Save & Schedule Follow-up'}
          </button>
        </footer>
      </div>
    </div>
  );
}
