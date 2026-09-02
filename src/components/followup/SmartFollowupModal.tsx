import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  SlidersHorizontal,
  Bell
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
  followup?: any;
  isEdit?: boolean;
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
    nextAction: '',
    priority: 'Medium' as PriorityLevel,
    slaHours: 24,
  });

  const [manualOpen, setManualOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync entity when record updates
  useEffect(() => {
    if (record?.entity) {
      setSelectedEntity(record.entity);
    }
  }, [record]);

  // Unified Pre-fill Effect for EDIT mode
  useEffect(() => {
    if (!open) return;

    if (record?.followup) {
      const f = record.followup;
      const rawChannel = (f.followup_type || f.followupType || f.type || 'phone').toString().toLowerCase();
      let channel: FollowupChannel = 'phone';
      if (rawChannel.includes('whatsapp')) channel = 'whatsapp';
      else if (rawChannel.includes('email') || rawChannel.includes('mail')) channel = 'email';
      else if (rawChannel.includes('site') || rawChannel.includes('visit')) channel = 'visit';
      else if (rawChannel.includes('meeting')) channel = 'meeting';

      // 1. Match Stage
      const savedStageName = (
        f.seller_lead_stage ||
        f.sellerLeadStage ||
        f.currentStageName ||
        f.current_stage ||
        f.buyer_lead_stage ||
        f.buyerLeadStage ||
        f.stage ||
        record?.stage ||
        ''
      ).toString();

      if (stages.length > 0 && savedStageName) {
        const foundStage = stages.find((s) =>
          s.name.toLowerCase().trim() === savedStageName.toLowerCase().trim() ||
          savedStageName.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(savedStageName.toLowerCase())
        );
        if (foundStage && foundStage.id) {
          setSelectedStageId(foundStage.id);
        }
      }

      // 2. Match Outcome
      const rawOutcomeStr = (
        f.outcome_name ||
        f.outcomeName ||
        f.outcome ||
        f.remark ||
        (f as any).custom_remark ||
        (f as any).customRemark ||
        ''
      ).toString();

      let outcomeName = rawOutcomeStr;
      let reason = f.reason || '';

      if (rawOutcomeStr.includes(' - ')) {
        const parts = rawOutcomeStr.split(' - ');
        outcomeName = parts[0].trim();
        if (!reason && parts.length > 1) {
          reason = parts.slice(1).join(' - ').trim();
        }
      }

      let matchedOutcomeId: number | undefined =
        f.outcome_id || f.outcomeId || (f as any).outcome_id || (f as any).outcomeId
          ? Number(f.outcome_id || f.outcomeId || (f as any).outcome_id || (f as any).outcomeId)
          : undefined;
      let matchedOutcomeName = outcomeName;

      if (outcomes.length > 0) {
        if (matchedOutcomeId) {
          const found = outcomes.find((o) => Number(o.id) === Number(matchedOutcomeId));
          if (found) {
            matchedOutcomeName = found.name;
            if (found.stage_id && !selectedStageId) setSelectedStageId(found.stage_id);
          }
        }
        if (!matchedOutcomeId && outcomeName) {
          const query = outcomeName.toLowerCase().trim();
          const found = outcomes.find((o) => {
            const name = o.name.toLowerCase().trim();
            return name === query || query.startsWith(name) || query.includes(name) || name.includes(query);
          });
          if (found && found.id) {
            matchedOutcomeId = found.id;
            matchedOutcomeName = found.name;
            if (found.stage_id && !selectedStageId) setSelectedStageId(found.stage_id);
          }
        }
      }

      const note = f.customRemark || f.custom_remark || f.notes || '';
      const nextAction = f.next_action || f.nextAction || '';
      const priority = (f.priority || 'Medium') as PriorityLevel;
      const rawDate = f.schedule_date || f.scheduleDate || f.scheduledDate || f.followup_date || f.date || calculateSLADate(24);
      const date = String(rawDate).includes('T') ? String(rawDate).split('T')[0] : String(rawDate);
      const time = (f.schedule_time || f.scheduleTime || f.scheduledTime || f.followup_time || f.time || '11:30').toString().slice(0, 5);

      setForm({
        entity: selectedEntity,
        channel,
        outcomeId: matchedOutcomeId,
        outcomeName: matchedOutcomeName,
        reason,
        note,
        createNext: true,
        quickDate: 'Tomorrow',
        date,
        time,
        nextStageId: (f as any).next_stage_id || (f as any).nextStageId || undefined,
        nextStatusId: (f as any).next_status_id || (f as any).nextStatusId || undefined,
        nextAction,
        priority,
        slaHours: 24,
      });
    } else {
      // ADD MODE initial setup
      if (stages.length > 0 && !selectedStageId) {
        const stageToMatch = record?.stage;
        if (stageToMatch) {
          const foundByName = stages.find((s) =>
            s.name.toLowerCase().trim() === stageToMatch.toString().toLowerCase().trim()
          );
          if (foundByName && foundByName.id) {
            setSelectedStageId(foundByName.id);
          } else {
            setSelectedStageId(stages[0].id);
          }
        } else if (stages[0]?.id) {
          setSelectedStageId(stages[0].id);
        }
      }
    }
  }, [open, record, stages, outcomes]);

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

  // Outcomes filtered for Current Selected Stage (ensuring selected outcome is included if set)
  const availableOutcomes = useMemo(() => {
    if (!currentStageObj || !currentStageObj.id) return outcomes;
    const filtered = outcomes.filter((o) => Number(o.stage_id) === Number(currentStageObj.id));
    if (form.outcomeId) {
      const selectedOutcome = outcomes.find((o) => Number(o.id) === Number(form.outcomeId));
      if (selectedOutcome && !filtered.some((o) => Number(o.id) === Number(selectedOutcome.id))) {
        return [selectedOutcome, ...filtered];
      }
    }
    return filtered.length > 0 ? filtered : outcomes;
  }, [outcomes, currentStageObj, form.outcomeId]);

  // Reactive Effect: Sync outcomeId once master outcomes finish loading
  useEffect(() => {
    if (outcomes.length > 0 && form.outcomeName && !form.outcomeId) {
      const query = form.outcomeName.toLowerCase().trim();
      const found = outcomes.find((o) => {
        const name = o.name.toLowerCase().trim();
        return name === query || query.startsWith(name) || query.includes(name) || name.includes(query);
      });
      if (found) {
        setForm((prev) => ({ ...prev, outcomeId: found.id, outcomeName: found.name }));
        if (found.stage_id) {
          setSelectedStageId(found.stage_id);
        }
      }
    }
  }, [outcomes, form.outcomeName, form.outcomeId]);

  const currentOutcomeObj = useMemo(() => {
    if (form.outcomeId) {
      return availableOutcomes.find((o) => Number(o.id) === Number(form.outcomeId)) || outcomes.find((o) => Number(o.id) === Number(form.outcomeId)) || null;
    }
    return null;
  }, [availableOutcomes, outcomes, form.outcomeId]);

  // 2. Dynamic Automation Rule Evaluation from Master Automation
  const matchedRule = useMemo(() => {
    if (!currentStageObj || !form.outcomeId) return null;
    return (
      rules.find(
        (r) =>
          Number(r.trigger_stage_id) === Number(currentStageObj.id) &&
          Number(r.condition_outcome_id) === Number(form.outcomeId) &&
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
    } else if (!record?.followup) {
      setForm((prev) => ({
        ...prev,
        nextStageId: undefined,
        nextStatusId: undefined,
        nextAction: '',
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
    setForm((prev) => ({
      ...prev,
      outcomeId: undefined,
      outcomeName: ''
    }));

    const stageOutcomes = outcomes.filter((o) => Number(o.stage_id) === Number(stageId));
    if (stageOutcomes.length === 0) {
      toast.warn('No outcome added for this stage');
    }
  };

  const handleOutcomeSelect = (outcomeObj: OutcomeData) => {
    setForm((prev) => ({
      ...prev,
      outcomeId: outcomeObj.id,
      outcomeName: outcomeObj.name
    }));

    if (currentStageObj && outcomeObj.id) {
      const foundRule = rules.find(
        (r) =>
          Number(r.trigger_stage_id) === Number(currentStageObj.id) &&
          Number(r.condition_outcome_id) === Number(outcomeObj.id) &&
          (r.rule_status === 'Published' || !r.rule_status)
      );
      if (!foundRule) {
        toast.warn('Rule not defined or added for this stage and outcome');
      }
    }
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
      toast.error('Please select a follow-up channel');
      setError('Please select a follow-up channel');
      return;
    }

    if (!form.outcomeId && !form.outcomeName) {
      toast.error('Please select what happened (outcome)');
      setError('Please select what happened (outcome)');
      return;
    }

    if (form.outcomeId && !matchedRule) {
      toast.error('Cannot save: Rule not defined or added for this stage and outcome!');
      setError('Rule not defined or added for this stage and outcome!');
      return;
    }

    try {
      setLoading(true);

      const nextStageObj = stages.find((s) => Number(s.id) === Number(form.nextStageId)) || currentStageObj;
      const nextStatusObj = statuses.find((st) => Number(st.id) === Number(form.nextStatusId)) ||
        statuses.find((st) => matchedRule?.next_status_id && Number(st.id) === Number(matchedRule.next_status_id));

      const computedNextStatusName = nextStatusObj?.name || matchedRule?.next_status_name || (record?.followup as any)?.nextStatusName || (record?.followup as any)?.next_status || null;

      const isEditingRecord = Boolean(
        (record as any)?.isEdit ||
        (record?.followup as any)?.isEdit ||
        !!(record?.followup?.id || (record?.followup as any)?.followup_id || (record?.followup as any)?.followupId)
      );

      const payload = {
        entity: selectedEntity,
        entityId: record?.id || 0,
        isEdit: isEditingRecord,
        followupId: isEditingRecord ? (record?.followup?.id || (record?.followup as any)?.followup_id || (record?.followup as any)?.followupId || null) : null,
        followupType: form.channel,
        outcomeId: form.outcomeId || null,
        outcomeName: form.outcomeName || 'Followup Interaction',
        reason: form.reason || null,
        notes: form.note.trim(),
        currentStageId: currentStageObj?.id || null,
        currentStageName: currentStageObj?.name || record?.stage || null,
        currentStatusId: record?.status_id || null,
        currentStatusName: currentStatusName || record?.status || null,
        nextStageId: form.nextStageId || currentStageObj?.id || null,
        nextStageName: nextStageObj?.name || currentStageObj?.name || record?.stage || null,
        nextStatusId: form.nextStatusId || matchedRule?.next_status_id || record?.status_id || null,
        nextStatusName: computedNextStatusName || currentStatusName || record?.status || null,
        nextAction: form.nextAction || 'Follow-up Customer',
        priority: form.priority || 'Medium',
        scheduledDate: form.createNext ? form.date : null,
        scheduledTime: form.createNext ? form.time : null
      };

      // Call Transactional Backend Engine
      const response = await automationEngineAPI.submitFollowup(payload as any);

      if (response.success) {
        toast.success(response.message || 'Follow-up saved successfully!');
        if (onSaved) {
          await onSaved(response.data);
        }
        onClose();
      } else {
        setError(response.message || 'Failed to save follow-up');
        toast.error(response.message || 'Failed to save follow-up');
      }
    } catch (err: any) {
      console.error('Error saving follow-up:', err);
      setError(err?.message || 'Failed to save follow-up');
      toast.error(err?.message || 'Failed to save follow-up');
    } finally {
      setLoading(false);
    }
  };

  const nextStageObj = stages.find((s) => s.id === form.nextStageId);
  const nextStatusObj = statuses.find((st) => st.id === form.nextStatusId);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col z-50 border border-slate-200 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 bg-[#0b3856] text-white z-[60] px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg flex items-center justify-center">
              <Bell size={16} className="text-[#E6761D]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                {record?.followup ? 'Edit Follow-up' : 'Add Follow-up'}
              </h2>
              <p className="text-[10px] text-slate-200">
                {record?.name || 'Customer'} • #{record?.id ? `ID-${record.id}` : 'ID-1024'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        {/* Modal Body - Ultra Compact */}
        <main className="p-3.5 overflow-y-auto space-y-2.5 text-xs font-medium text-slate-700">
          {/* Row 1: Entity & Current Stage Selector */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                ENTITY <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedEntity}
                  onChange={(e) => handleEntityChange(e.target.value as CRMEntity)}
                  className="w-full appearance-none border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] cursor-pointer"
                >
                  <option value="lead">Lead</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                CURRENT STAGE <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedStageId || ''}
                  onChange={(e) => handleStageChange(Number(e.target.value))}
                  className="w-full appearance-none border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] cursor-pointer"
                >
                  {stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Follow-up Type Dropdown & What Happened Dropdown */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                FOLLOW-UP TYPE <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.channel}
                  onChange={(e) => change('channel', e.target.value as FollowupChannel)}
                  className="w-full appearance-none border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] cursor-pointer"
                >
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="visit">Site Visit</option>
                  <option value="meeting">In-Person Meeting</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                WHAT HAPPENED? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {(() => {
                  const matchedFromAvailable = form.outcomeName
                    ? availableOutcomes.find((o) => o.name.toLowerCase().trim() === form.outcomeName.toLowerCase().trim()) ||
                      availableOutcomes.find((o) => o.name.toLowerCase().trim().includes(form.outcomeName.toLowerCase().trim()) || form.outcomeName.toLowerCase().trim().includes(o.name.toLowerCase().trim()))
                    : null;

                  const effectiveOutcomeId = form.outcomeId
                    ? String(form.outcomeId)
                    : matchedFromAvailable
                    ? String(matchedFromAvailable.id)
                    : form.outcomeName
                    ? 'custom_outcome'
                    : '';

                  const isCustomOutcome = effectiveOutcomeId === 'custom_outcome';

                  return (
                    <select
                      value={effectiveOutcomeId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom_outcome') return;
                        const id = Number(val);
                        const found = availableOutcomes.find((o) => o.id === id);
                        if (found) {
                          handleOutcomeSelect(found);
                        } else {
                          setForm((prev) => ({ ...prev, outcomeId: undefined, outcomeName: '' }));
                        }
                      }}
                      disabled={availableOutcomes.length === 0 && !isCustomOutcome && !form.outcomeName}
                      className="w-full appearance-none border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">Select outcome...</option>
                      {isCustomOutcome && (
                        <option value="custom_outcome">{form.outcomeName}</option>
                      )}
                      {loadingMasters ? (
                        <option value="">Loading outcomes...</option>
                      ) : availableOutcomes.length === 0 && !isCustomOutcome ? (
                        <option value="">No outcomes configured</option>
                      ) : (
                        availableOutcomes.map((out) => (
                          <option key={out.id} value={out.id}>
                            {out.name}
                          </option>
                        ))
                      )}
                    </select>
                  );
                })()}
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* REASON (OPTIONAL) Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              REASON (OPTIONAL)
            </label>
            <div className="relative">
              <select
                value={form.reason}
                onChange={(e) => change('reason', e.target.value)}
                className="w-full appearance-none border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0b3856] focus:ring-1 focus:ring-[#0b3856] cursor-pointer"
              >
                <option value="">Select reason...</option>
                {DEFAULT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* SYSTEM AUTOMATION Execution Card */}
          {(matchedRule || Boolean(record?.followup)) && (
            <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  AUTOMATION APPLIED
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  {matchedRule ? `RULE: ${matchedRule.name || 'AUTOMATION'}` : 'SYSTEM AUTOMATION'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                <div className="bg-white p-1.5 rounded border border-emerald-100">
                  <span className="text-[8px] font-bold uppercase text-slate-400 block">STAGE</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {nextStageObj?.name || (record?.followup as any)?.nextStageName || currentStageObj?.name || 'Same Stage'}
                  </span>
                </div>

                <div className="bg-white p-1.5 rounded border border-emerald-100">
                  <span className="text-[8px] font-bold uppercase text-slate-400 block">STATUS</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {nextStatusObj?.name || (record?.followup as any)?.nextStatusName || currentStatusName || 'Qualified'}
                  </span>
                </div>

                <div className="bg-white p-1.5 rounded border border-emerald-100">
                  <span className="text-[8px] font-bold uppercase text-slate-400 block">ACTION</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {form.nextAction || (record?.followup as any)?.nextAction || 'Follow-up'}
                  </span>
                </div>

                <div className="bg-white p-1.5 rounded border border-emerald-100">
                  <span className="text-[8px] font-bold uppercase text-slate-400 block">PRIORITY</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {form.priority || 'Medium'} • {form.slaHours || 24}h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Follow-up Section */}
          <div className="p-2.5 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800">Next Follow-up Schedule</label>
              <label className="flex items-center gap-1 text-[11px] text-slate-600 font-medium cursor-pointer">
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
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Today', 'Tomorrow', 'Next Week'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleQuickDate(opt)}
                      className={`py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        form.quickDate === opt
                          ? 'border-[#0b3856] bg-blue-50 text-[#0b3856]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">
                      DATE <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => change('date', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">
                      TIME <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={form.time}
                        onChange={(e) => change('time', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#0b3856]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* EMPLOYEE REMARK */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              EMPLOYEE REMARK
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => change('note', e.target.value)}
              placeholder="Optional notes or context..."
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800 outline-none focus:border-[#0b3856] placeholder:text-slate-400"
            />
          </div>

          {/* MANUAL OVERRIDE EXPANDER */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setManualOpen(!manualOpen)}
              className="w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-[#0b3856]" />
                Advanced / Manual Override
              </span>
              {manualOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {manualOpen && (
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Override Stage</label>
                    <select
                      value={form.nextStageId || ''}
                      onChange={(e) => change('nextStageId', Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-md p-1 bg-white outline-none cursor-pointer"
                    >
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Override Status</label>
                    <select
                      value={form.nextStatusId || ''}
                      onChange={(e) => change('nextStatusId', Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-md p-1 bg-white outline-none cursor-pointer"
                    >
                      {statuses.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Override Action</label>
                    <input
                      type="text"
                      value={form.nextAction}
                      onChange={(e) => change('nextAction', e.target.value)}
                      className="w-full border border-slate-300 rounded-md p-1 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Override Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => change('priority', e.target.value as PriorityLevel)}
                      className="w-full border border-slate-300 rounded-md p-1 bg-white outline-none cursor-pointer"
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

          {Boolean(form.outcomeId) && !matchedRule && (
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>Rule not defined or added for this stage and outcome. Form submission is disabled.</span>
            </div>
          )}

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || (Boolean(form.outcomeId) && !matchedRule)}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#E6761D] hover:bg-[#d56816] rounded-lg shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={Boolean(form.outcomeId) && !matchedRule ? "Rule is not defined or added for this stage and outcome" : ""}
          >
            <Save size={14} />
            {loading ? 'Saving...' : Boolean(form.outcomeId) && !matchedRule ? 'Rule Not Defined' : 'Save Follow-up'}
          </button>
        </footer>
      </div>
    </div>
  );
}
