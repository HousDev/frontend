import { useEffect, useMemo, useState, useCallback, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  Plus,
  Send,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import type {
  FollowUp,
  FollowUpType,
  MasterData,
  NewFollowUp,
  Outcome,
  Rule,
  StageStatusSuggestion,
  NextAction,
  AILeadInsight,
} from '@/lib/types';
import {
  matchRule,
  buildNextFollowUp,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  previewNextStep,
  suggestStageStatus,
  loadRemarkSuggestions,
  suggestPriority,
  getEntityActions,
  generateDefaultNextStep,
  createAutomationJobs,
  resolveMessageTemplate,
  defaultMasterData,
  loadMasterData,
  loadFollowUps,
} from '@/lib/engine';
import { getPriorityDelta, loadAIInsights } from '@/lib/ai';
import { getIcon } from '@/lib/icons';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import './mastersAdmin.css';

type Mode = 'add' | 'complete' | 'edit';
type WizardStep = 1 | 2 | 3;

type Props = {
  open: boolean;
  master?: MasterData;
  currentFollowUp?: FollowUp | null;
  mode?: Mode;
  followUps?: FollowUp[];
  initialDate?: string;
  initialEntityCode?: 'LEAD' | 'BUYER' | 'SELLER' | string;
  initialEntityId?: string | number;
  initialEntityName?: string;
  initialEntityPhone?: string;
  initialStageCode?: string;
  initialStatusCode?: string;
  initialAssignedTo?: string | number;
  initialAssignedName?: string;
  onClose: () => void;
  onSaved?: (newFollowUp: FollowUp | null) => void;
  onDeleted?: (deletedId: string) => void;
};

type FormState = {
  entityCode: string;
  entityName: string;
  entityPhone: string;
  entityRef: string;
  followUpTypeCode: string;
  stageCode: string;
  statusCode: string;
  outcomeCode: string;
  reasonCode: string;
  customRemark: string;
  date: string;
  time: string;
  project: string;
  siteLocation: string;
  participants: string;
  messageTemplate: string;
  priorityCode: string;
  nextActionOverride: string;
  scheduleDateOverride: string;
  scheduleTimeOverride: string;
  createNext: boolean;
  overrideStage: string;
  overrideStatus: string;
  overrideAction: string;
  overrideType: string;
  overridePriority: string;
  assignedTo: string;
  dueDate: string;
  dueTime: string;
};

function localTodayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function localDatePlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function emptyForm(): FormState {
  return {
    entityCode: 'LEAD',
    entityName: '',
    entityPhone: '',
    entityRef: '',
    followUpTypeCode: 'CALL',
    stageCode: '',
    statusCode: '',
    outcomeCode: '',
    reasonCode: '',
    customRemark: '',
    date: localTodayISO(),
    time: '11:00',
    project: '',
    siteLocation: '',
    participants: '',
    messageTemplate: '',
    priorityCode: 'MEDIUM',
    nextActionOverride: '',
    scheduleDateOverride: '',
    scheduleTimeOverride: '',
    createNext: true,
    overrideStage: '',
    overrideStatus: '',
    overrideAction: '',
    overrideType: '',
    overridePriority: '',
    assignedTo: '',
    dueDate: '',
    dueTime: '',
  };
}

export function FollowUpModal({
  open,
  master: propMaster,
  currentFollowUp,
  mode = 'add',
  followUps: propFollowUps,
  initialDate,
  initialEntityCode,
  initialEntityId,
  initialEntityName,
  initialEntityPhone,
  initialStageCode,
  initialStatusCode,
  initialAssignedTo,
  initialAssignedName,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [internalMaster, setInternalMaster] = useState<MasterData>(propMaster || defaultMasterData);
  const [internalFollowUps, setInternalFollowUps] = useState<FollowUp[]>(propFollowUps || []);

  useEffect(() => {
    if (propMaster) {
      setInternalMaster(propMaster);
    } else if (open) {
      loadMasterData().then((m) => {
        if (m) setInternalMaster(m);
      }).catch(console.error);
    }
  }, [propMaster, open]);

  useEffect(() => {
    if (propFollowUps) {
      setInternalFollowUps(propFollowUps);
    } else if (open) {
      loadFollowUps().then((f) => {
        if (f) setInternalFollowUps(f);
      }).catch(console.error);
    }
  }, [propFollowUps, open]);

  const master = propMaster || internalMaster;
  const followUps = propFollowUps || internalFollowUps;

  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [showRefSuggestions, setShowRefSuggestions] = useState(false);
  const [addWizardStep, setAddWizardStep] = useState<WizardStep>(1);
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const [remarkSuggestions, setRemarkSuggestions] = useState<string[]>([]);
  const [remarkSuggestionsLoading, setRemarkSuggestionsLoading] = useState(false);
  const [prioritySuggestion, setPrioritySuggestion] = useState<{
    priorityCode: string;
    source: 'rule' | 'default';
    reason: string;
  } | null>(null);
  const [priorityAutoApplied, setPriorityAutoApplied] = useState(false);
  const [aiLeadInsight, setAiLeadInsight] = useState<AILeadInsight | null>(null);

  const { user } = useAuth() as { user: any | null };
  const [crmUsers, setCrmUsers] = useState<{ id: string; name: string; role?: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    usersAPI.getAllUsers().then((res: any) => {
      if (!mounted) return;
      const raw = res?.data ?? res?.items ?? res ?? [];
      if (Array.isArray(raw)) {
        const mapped = raw
          .filter((u: any) => {
            const isActive = u.is_active !== 0 && u.is_active !== false && u.is_active !== '0' && u.is_active !== 'false' && u.status !== 'inactive';
            const role = String(u.role || '').toLowerCase();
            const dept = String(u.department || '').toLowerCase();
            const isClient = role === 'buyer' || role === 'seller' || dept === 'buyer' || dept === 'seller' || role === 'customer';
            return isActive && !isClient;
          })
          .map((u: any) => {
            const rawName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name || u.username || `User #${u.id}`;
            const cleanName = rawName.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, '').trim();
            return {
              id: String(u.id ?? u.user_id ?? ''),
              name: cleanName,
              role: u.role || u.department || 'Executive',
            };
          });
        setCrmUsers(mapped);
      }
    }).catch((err) => {
      console.warn('Failed to load CRM users in FollowUpModal:', err);
    });
    return () => { mounted = false; };
  }, [open]);

  const resolveExecutiveName = useCallback((val?: string | number | null): string => {
    if (!val || String(val).trim() === '' || String(val).toLowerCase() === 'unassigned') return '';
    const strVal = String(val).trim();
    const fromCrm = crmUsers.find(
      (u) => String(u.id) === strVal || u.name.toLowerCase() === strVal.toLowerCase()
    );
    if (fromCrm) return fromCrm.name;
    const fromTeam = master.teamMembers?.find(
      (m) => String(m.id) === strVal || m.name.toLowerCase() === strVal.toLowerCase()
    );
    if (fromTeam) return fromTeam.name;
    return strVal;
  }, [crmUsers, master.teamMembers]);

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    setError('');
    setWizardStep(1);
    setAddWizardStep(1);
    setShowAdvanced(false);
    setActivePreset(null);
    setSuggestionApplied(false);
    setRemarkSuggestions([]);
    setRemarkSuggestionsLoading(false);
    setPrioritySuggestion(null);
    setPriorityAutoApplied(false);
    setAiLeadInsight(null);

    const targetEntityCode = (initialEntityCode || 'LEAD').toUpperCase();
    const targetEntityName = initialEntityName || currentFollowUp?.entity_name || (currentFollowUp?.entity_ref ? String(currentFollowUp.entity_ref).replace(/\s*\([^)]*\)\s*$/, '') : '');
    const targetEntityPhone = initialEntityPhone || currentFollowUp?.entity_phone || (currentFollowUp?.entity_ref && String(currentFollowUp.entity_ref).match(/\(([^)]+)\)/) ? String(currentFollowUp.entity_ref).match(/\(([^)]+)\)/)![1] : '');
    const targetEntityRef = targetEntityName
      ? (targetEntityPhone ? `${targetEntityName} (${targetEntityPhone})` : targetEntityName)
      : (targetEntityPhone || currentFollowUp?.entity_ref || '');

    const rawAssigned = initialAssignedTo || initialAssignedName || currentFollowUp?.assigned_to || '';
    const defaultAssigned = resolveExecutiveName(rawAssigned);

    if (mode === 'edit' && currentFollowUp) {
      setForm({
        entityCode: currentFollowUp.entity_code,
        entityName: targetEntityName,
        entityPhone: targetEntityPhone,
        entityRef: targetEntityRef,
        followUpTypeCode: currentFollowUp.follow_up_type_code,
        stageCode: currentFollowUp.stage_code,
        statusCode: currentFollowUp.status_code,
        outcomeCode: currentFollowUp.outcome_code ?? '',
        reasonCode: currentFollowUp.reason_code ?? '',
        customRemark: currentFollowUp.custom_remark ?? '',
        date: currentFollowUp.scheduled_date,
        time: currentFollowUp.scheduled_time,
        project: currentFollowUp.project ?? '',
        siteLocation: currentFollowUp.site_location ?? '',
        participants: currentFollowUp.participants ?? '',
        messageTemplate: currentFollowUp.message_template ?? '',
        priorityCode: currentFollowUp.priority_code,
        nextActionOverride: currentFollowUp.next_action_code ?? '',
        scheduleDateOverride: currentFollowUp.scheduled_date,
        scheduleTimeOverride: currentFollowUp.scheduled_time,
        createNext: true,
        overrideStage: '',
        overrideStatus: '',
        overrideAction: '',
        overrideType: '',
        overridePriority: '',
        assignedTo: resolveExecutiveName(currentFollowUp.assigned_to) || defaultAssigned,
        dueDate: currentFollowUp.due_date ?? '',
        dueTime: currentFollowUp.due_time ?? '',
      });
    } else if (mode === 'complete' && currentFollowUp) {
      setForm({
        ...emptyForm(),
        entityCode: currentFollowUp.entity_code,
        entityName: targetEntityName,
        entityPhone: targetEntityPhone,
        entityRef: targetEntityRef,
        followUpTypeCode: currentFollowUp.follow_up_type_code,
        stageCode: currentFollowUp.stage_code,
        statusCode: currentFollowUp.status_code,
        priorityCode: currentFollowUp.priority_code,
        assignedTo: resolveExecutiveName(currentFollowUp.assigned_to) || defaultAssigned,
        dueDate: currentFollowUp.due_date ?? '',
        dueTime: currentFollowUp.due_time ?? '',
      });
    } else {
      const initialStages = master.stages
        .filter((s) => s.entity_code === targetEntityCode && s.is_active)
        .sort((a, b) => a.display_order - b.display_order);
      const initialStatuses = master.statuses
        .filter((s) => s.entity_code === targetEntityCode && s.is_active)
        .sort((a, b) => a.display_order - b.display_order);

      const defaultStage = initialStageCode || initialStages[0]?.code || '';
      const defaultStatus = initialStatusCode || initialStatuses[0]?.code || '';

      setForm({
        ...emptyForm(),
        entityCode: targetEntityCode,
        entityName: targetEntityName,
        entityPhone: targetEntityPhone,
        entityRef: targetEntityRef,
        date: initialDate ?? localTodayISO(),
        stageCode: defaultStage,
        statusCode: defaultStatus,
        assignedTo: defaultAssigned,
      });
    }
  }, [open, mode, currentFollowUp, initialDate, initialEntityCode, initialEntityName, initialEntityPhone, initialStageCode, initialStatusCode, initialAssignedTo, initialAssignedName, master.stages, master.statuses, resolveExecutiveName]);

  // Keep assignedTo up to date if users load after modal opens
  useEffect(() => {
    if (!open || (!crmUsers.length && !master.teamMembers?.length)) return;
    setForm((current) => {
      const candidate = current.assignedTo || initialAssignedTo || initialAssignedName || currentFollowUp?.assigned_to;
      if (!candidate || String(candidate).trim() === '' || String(candidate).toLowerCase() === 'unassigned') {
        return current;
      }
      const resolved = resolveExecutiveName(candidate);
      if (resolved && resolved !== current.assignedTo) {
        return { ...current, assignedTo: resolved };
      }
      return current;
    });
  }, [crmUsers, master.teamMembers, initialAssignedTo, initialAssignedName, currentFollowUp, resolveExecutiveName, open]);

  const enrichType = (t?: FollowUpType): FollowUpType | undefined => {
    if (!t) return undefined;
    const code = (t.code || '').toUpperCase();
    const isWhatsApp = code === 'WHATSAPP';
    const isEmail = code === 'EMAIL';
    const isSiteVisit = code === 'SITE_VISIT' || code === 'VISIT';
    const isMeeting = code === 'MEETING';

    return {
      ...t,
      requires_template: isWhatsApp || isEmail,
      requires_date: isSiteVisit || isMeeting,
      requires_time: isSiteVisit || isMeeting,
      requires_project: isSiteVisit,
      requires_location: isSiteVisit || isMeeting,
      requires_participants: isMeeting,
    };
  };

  const fuType = useMemo<FollowUpType | undefined>(() => {
    const found = master.followUpTypes.find((t) => t.code === form.followUpTypeCode);
    return enrichType(found);
  }, [master.followUpTypes, form.followUpTypeCode]);

  const availableFollowUpTypes = useMemo(() => {
    const map = new Map<string, FollowUpType>();
    for (const t of master.followUpTypes) {
      if (t.is_active && !map.has(t.code)) {
        const enriched = enrichType(t);
        if (enriched) map.set(t.code, enriched);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.display_order - b.display_order);
  }, [master.followUpTypes]);

  const availableStages = useMemo(
    () =>
      master.stages
        .filter((s) => s.entity_code === form.entityCode && s.is_active)
        .sort((a, b) => a.display_order - b.display_order),
    [master.stages, form.entityCode]
  );

  const availableStatuses = useMemo(
    () =>
      master.statuses
        .filter((s) => s.entity_code === form.entityCode && s.is_active)
        .sort((a, b) => a.display_order - b.display_order),
    [master.statuses, form.entityCode]
  );

  const outcomes = useMemo<Outcome[]>(
    () => master.outcomes.filter((o) => o.follow_up_type_code === form.followUpTypeCode && o.is_active),
    [master.outcomes, form.followUpTypeCode]
  );

  const selectedOutcome = useMemo<Outcome | undefined>(
    () => outcomes.find((o) => o.code === form.outcomeCode),
    [outcomes, form.outcomeCode]
  );

  const showReasons = selectedOutcome?.asks_reason ?? false;

  const reasonCandidates = useMemo(() => {
    if (!form.outcomeCode) return [];
    return master.rules.filter(
      (r) =>
        r.entity_code === form.entityCode &&
        r.current_stage_code === form.stageCode &&
        r.current_status_code === form.statusCode &&
        r.follow_up_type_code === form.followUpTypeCode &&
        r.outcome_code === form.outcomeCode &&
        r.reason_code !== null
    );
  }, [
    master.rules,
    form.entityCode,
    form.stageCode,
    form.statusCode,
    form.followUpTypeCode,
    form.outcomeCode,
  ]);

  const reasonRequired = reasonCandidates.length > 0 && reasonCandidates.every((r) => r.reason_code !== null);

  const matchedRule = useMemo<Rule | null>(() => {
    if (!form.outcomeCode) return null;
    return matchRule(master.rules, {
      entityCode: form.entityCode,
      followUpTypeCode: form.followUpTypeCode,
      currentStageCode: form.stageCode,
      currentStatusCode: form.statusCode,
      outcomeCode: form.outcomeCode,
      reasonCode: form.reasonCode || null,
    });
  }, [
    master.rules,
    form.entityCode,
    form.followUpTypeCode,
    form.stageCode,
    form.statusCode,
    form.outcomeCode,
    form.reasonCode,
  ]);

  const nextStep = useMemo(() => {
    if (!matchedRule) return null;
    return previewNextStep(matchedRule, master.sequences, currentFollowUp?.attempt_no ?? 1);
  }, [matchedRule, master.sequences, currentFollowUp]);

  const isOverridden = Boolean(
    form.overrideStage || form.overrideStatus || form.overrideAction || form.overrideType || form.overridePriority
  );

  const effectiveNext = useMemo(() => {
    if (!matchedRule) return null;
    const base = nextStep ?? {
      nextStageCode: matchedRule.next_stage_code,
      nextStatusCode: matchedRule.next_status_code,
      nextActionCode: matchedRule.next_action_code,
      nextFollowUpTypeCode: matchedRule.next_follow_up_type_code,
      priorityCode: matchedRule.priority_code,
      scheduledDate: localDatePlus(matchedRule.default_days),
      scheduledTime: matchedRule.default_time,
    };
    return {
      stage: form.overrideStage || base.nextStageCode,
      status: form.overrideStatus || base.nextStatusCode,
      action: form.overrideAction || base.nextActionCode,
      type: form.overrideType || base.nextFollowUpTypeCode || matchedRule.follow_up_type_code,
      priority: form.overridePriority || base.priorityCode,
      date: form.scheduleDateOverride || base.scheduledDate,
      time: form.scheduleTimeOverride || base.scheduledTime,
    };
  }, [
    matchedRule,
    nextStep,
    form.overrideStage,
    form.overrideStatus,
    form.overrideAction,
    form.overrideType,
    form.overridePriority,
    form.scheduleDateOverride,
    form.scheduleTimeOverride,
  ]);

  const nextStageName = useMemo(
    () =>
      master.stages.find((s) => s.code === effectiveNext?.stage && s.entity_code === form.entityCode)?.name ??
      effectiveNext?.stage,
    [master.stages, effectiveNext, form.entityCode]
  );
  const nextStatusName = useMemo(
    () =>
      master.statuses.find((s) => s.code === effectiveNext?.status && s.entity_code === form.entityCode)?.name ??
      effectiveNext?.status,
    [master.statuses, effectiveNext, form.entityCode]
  );
  const nextActionName = useMemo(
    () => master.nextActions.find((a) => a.code === effectiveNext?.action)?.name ?? effectiveNext?.action,
    [master.nextActions, effectiveNext]
  );
  const nextTypeName = useMemo(
    () => master.followUpTypes.find((t) => t.code === effectiveNext?.type)?.name ?? effectiveNext?.type,
    [master.followUpTypes, effectiveNext]
  );
  const priorityName = useMemo(
    () => master.priorities.find((p) => p.code === effectiveNext?.priority)?.name ?? effectiveNext?.priority,
    [master.priorities, effectiveNext]
  );

  // Auto-advance wizard: outcome → reason → review
  useEffect(() => {
    if (mode !== 'complete') return;
    if (!fuType?.requires_outcome && outcomes.length === 0 && wizardStep === 1) {
      setWizardStep(3);
    } else if (form.outcomeCode && !showReasons && wizardStep === 1) {
      setWizardStep(3);
    } else if (form.outcomeCode && showReasons && wizardStep === 1) {
      setWizardStep(2);
    }
  }, [form.outcomeCode, showReasons, wizardStep, mode, fuType?.requires_outcome, outcomes.length]);

  // Sync createNext + preset when rule resolves
  useEffect(() => {
    if (mode !== 'complete') return;
    if (matchedRule && nextStep) {
      const isTerminal = matchedRule.terminal || nextStep.isSequenceTerminal;
      setForm((c) => ({ ...c, createNext: !isTerminal }));
      setActivePreset(null);
    }
  }, [matchedRule, nextStep, mode]);

  const entityRefOptions = useMemo(() => {
    const seen = new Map<string, boolean>();
    for (const f of followUps) {
      if (f.entity_code !== form.entityCode || !f.entity_ref) continue;
      const hasPending = seen.get(f.entity_ref);
      if (hasPending === undefined) seen.set(f.entity_ref, !f.is_complete);
      else if (!f.is_complete) seen.set(f.entity_ref, true);
    }
    return Array.from(seen.entries()).map(([ref, pending]) => ({ ref, hasPending: pending }));
  }, [followUps, form.entityCode]);

  const filteredRefOptions = useMemo(() => {
    if (!form.entityRef.trim()) return entityRefOptions.slice(0, 8);
    const q = form.entityRef.toLowerCase();
    return entityRefOptions.filter((o) => o.ref.toLowerCase().includes(q)).slice(0, 8);
  }, [entityRefOptions, form.entityRef]);

  const pendingForRef = useMemo(() => {
    if (!form.entityRef.trim()) return false;
    return followUps.some(
      (f) => f.entity_code === form.entityCode && f.entity_ref === form.entityRef.trim() && !f.is_complete
    );
  }, [followUps, form.entityCode, form.entityRef]);

  const addModeRuleHint = useMemo(() => {
    if (mode !== 'add') return null;
    return (
      master.rules.find(
        (r) =>
          r.entity_code === form.entityCode &&
          r.follow_up_type_code === form.followUpTypeCode &&
          r.current_stage_code === form.stageCode &&
          r.current_status_code === form.statusCode
      ) ?? null
    );
  }, [master.rules, mode, form.entityCode, form.followUpTypeCode, form.stageCode, form.statusCode]);

  const stageSuggestion = useMemo<StageStatusSuggestion | null>(() => {
    if (mode !== 'add') return null;
    if (!form.entityCode || !form.followUpTypeCode) return null;
    return suggestStageStatus(
      master.rules,
      master.stages,
      master.statuses,
      form.entityCode,
      form.followUpTypeCode,
      form.nextActionOverride || undefined
    );
  }, [
    mode,
    master.rules,
    master.stages,
    master.statuses,
    form.entityCode,
    form.followUpTypeCode,
    form.nextActionOverride,
  ]);

  const entityActions = useMemo<NextAction[]>(() => {
    if (mode !== 'add') return [];
    return getEntityActions(master.rules, master.nextActions, form.entityCode, form.followUpTypeCode);
  }, [mode, master.rules, master.nextActions, form.entityCode, form.followUpTypeCode]);

  const quickPresets = useMemo(() => {
    const presets: {
      label: string;
      icon: string;
      entity: string;
      type: string;
      stage: string;
      status: string;
      priority: string;
    }[] = [];
    const currentEntity = form.entityCode || 'LEAD';
    const entityStages = master.stages
      .filter((s) => s.entity_code === currentEntity && s.is_active)
      .sort((a, b) => a.display_order - b.display_order);
    const entityStatuses = master.statuses
      .filter((s) => s.entity_code === currentEntity && s.is_active)
      .sort((a, b) => a.display_order - b.display_order);
    const firstStage = entityStages[0]?.code ?? '';
    const firstStatus = entityStatuses[0]?.code ?? '';

    if (currentEntity === 'BUYER') {
      presets.push({
        label: 'Buyer Req. Call',
        icon: 'Phone',
        entity: 'BUYER',
        type: 'CALL',
        stage: firstStage,
        status: firstStatus,
        priority: 'HIGH',
      });
      presets.push({
        label: 'Property Showing',
        icon: 'MapPin',
        entity: 'BUYER',
        type: 'VISIT',
        stage: firstStage,
        status: firstStatus,
        priority: 'HIGH',
      });
      presets.push({
        label: 'WhatsApp Catalog',
        icon: 'MessageCircle',
        entity: 'BUYER',
        type: 'WHATSAPP',
        stage: firstStage,
        status: firstStatus,
        priority: 'MEDIUM',
      });
      presets.push({
        label: 'Price Negotiation',
        icon: 'Target',
        entity: 'BUYER',
        type: 'MEETING',
        stage: firstStage,
        status: firstStatus,
        priority: 'HIGH',
      });
    } else if (currentEntity === 'SELLER') {
      presets.push({
        label: 'Seller Call',
        icon: 'Phone',
        entity: 'SELLER',
        type: 'CALL',
        stage: firstStage,
        status: firstStatus,
        priority: 'HIGH',
      });
      presets.push({
        label: 'Site Inspection',
        icon: 'MapPin',
        entity: 'SELLER',
        type: 'VISIT',
        stage: firstStage,
        status: firstStatus,
        priority: 'MEDIUM',
      });
      presets.push({
        label: 'Agreement Discussion',
        icon: 'FileText',
        entity: 'SELLER',
        type: 'MEETING',
        stage: firstStage,
        status: firstStatus,
        priority: 'HIGH',
      });
      presets.push({
        label: 'WhatsApp Update',
        icon: 'MessageCircle',
        entity: 'SELLER',
        type: 'WHATSAPP',
        stage: firstStage,
        status: firstStatus,
        priority: 'MEDIUM',
      });
    } else {
      // LEAD
      presets.push({
        label: 'New lead call',
        icon: 'Phone',
        entity: 'LEAD',
        type: 'CALL',
        stage: firstStage,
        status: firstStatus,
        priority: 'HIGH',
      });
      presets.push({
        label: 'Site visit',
        icon: 'MapPin',
        entity: 'LEAD',
        type: 'VISIT',
        stage: firstStage,
        status: firstStatus,
        priority: 'MEDIUM',
      });
      presets.push({
        label: 'Send email',
        icon: 'Mail',
        entity: 'LEAD',
        type: 'EMAIL',
        stage: firstStage,
        status: firstStatus,
        priority: 'LOW',
      });
      presets.push({
        label: 'WhatsApp',
        icon: 'MessageCircle',
        entity: 'LEAD',
        type: 'WHATSAPP',
        stage: firstStage,
        status: firstStatus,
        priority: 'MEDIUM',
      });
    }
    return presets;
  }, [master.stages, master.statuses, form.entityCode]);

  useEffect(() => {
    if (mode !== 'add' || !addModeRuleHint) return;
    setForm((c) => ({
      ...c,
      time: addModeRuleHint.default_time || c.time,
    }));
  }, [addModeRuleHint, mode]);

  // Auto-apply smart stage/status suggestion when entity or type changes
  useEffect(() => {
    if (mode !== 'add') return;
    if (!stageSuggestion) return;
    if (suggestionApplied) return;
    setForm((c) => ({
      ...c,
      stageCode: stageSuggestion.stageCode,
      statusCode: stageSuggestion.statusCode,
    }));
    setSuggestionApplied(true);
  }, [stageSuggestion, mode, suggestionApplied]);

  // Reset suggestionApplied when entity, type, or intent changes
  useEffect(() => {
    if (mode !== 'add') return;
    setSuggestionApplied(false);
    setPriorityAutoApplied(false);
  }, [form.entityCode, form.followUpTypeCode, form.nextActionOverride, mode]);

  // Load historical remark suggestions
  useEffect(() => {
    if (mode !== 'add') return;
    if (!form.entityCode || !form.followUpTypeCode) return;
    let cancelled = false;
    setRemarkSuggestionsLoading(true);
    void loadRemarkSuggestions(form.entityCode, form.followUpTypeCode, 5).then((remarks) => {
      if (!cancelled) {
        setRemarkSuggestions(remarks);
        setRemarkSuggestionsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, form.entityCode, form.followUpTypeCode]);

  useEffect(() => {
    if (mode !== 'add' || !form.entityRef.trim()) {
      setAiLeadInsight(null);
      return;
    }
    let cancelled = false;
    void loadAIInsights(followUps).then((insights) => {
      if (cancelled) return;
      const match = insights.find(
        (insight) => insight.entity_code === form.entityCode && insight.entity_ref === form.entityRef.trim()
      );
      setAiLeadInsight(match ?? null);
      if (match && getPriorityDelta(form.priorityCode, match.suggested_priority) === 'up') {
        setForm((current) => ({ ...current, priorityCode: match.suggested_priority }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, followUps, form.entityCode, form.entityRef, form.priorityCode]);

  // Smart priority auto-suggestion
  useEffect(() => {
    if (mode !== 'add') return;
    if (!form.entityCode || !form.followUpTypeCode || !form.stageCode || !form.statusCode) {
      setPrioritySuggestion(null);
      return;
    }
    const suggestion = suggestPriority(
      master.rules,
      form.entityCode,
      form.followUpTypeCode,
      form.stageCode,
      form.statusCode,
      form.nextActionOverride || undefined
    );
    setPrioritySuggestion(suggestion);
    if (!priorityAutoApplied) {
      setForm((c) => ({ ...c, priorityCode: suggestion.priorityCode }));
      setPriorityAutoApplied(true);
    }
  }, [
    mode,
    master.rules,
    form.entityCode,
    form.followUpTypeCode,
    form.stageCode,
    form.statusCode,
    form.nextActionOverride,
    priorityAutoApplied,
  ]);

  function applyQuickPreset(preset: {
    entity: string;
    type: string;
    stage: string;
    status: string;
    priority: string;
  }) {
    setForm((c) => ({
      ...c,
      entityCode: preset.entity,
      followUpTypeCode: preset.type,
      stageCode: preset.stage,
      statusCode: preset.status,
      priorityCode: preset.priority,
      outcomeCode: '',
      reasonCode: '',
    }));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  function changeEntity(code: string) {
    const stages = master.stages
      .filter((s) => s.entity_code === code && s.is_active)
      .sort((a, b) => a.display_order - b.display_order);
    const statuses = master.statuses
      .filter((s) => s.entity_code === code && s.is_active)
      .sort((a, b) => a.display_order - b.display_order);
    setForm((c) => ({
      ...c,
      entityCode: code,
      stageCode: stages[0]?.code ?? '',
      statusCode: statuses[0]?.code ?? '',
      outcomeCode: '',
      reasonCode: '',
      nextActionOverride: '',
    }));
    if (mode === 'complete') setWizardStep(1);
  }

  function changeType(code: string) {
    const ft = master.followUpTypes.find((t) => t.code === code);
    const upper = (code || '').toUpperCase();
    const fallbackTemplate =
      upper === 'WHATSAPP'
        ? 'Hi , thank you for your interest. We will get back to you shortly.'
        : upper === 'EMAIL'
        ? 'Dear ,\n\nThank you for your interest. We will get back to you shortly.\n\nBest regards'
        : '';

    const newTemplate = ft?.default_message_template
      ? ft.default_message_template.replace(/\{\{entity_ref\}\}/g, form.entityRef || '')
      : fallbackTemplate;

    setForm((c) => ({
      ...c,
      followUpTypeCode: code,
      outcomeCode: '',
      reasonCode: '',
      messageTemplate: newTemplate,
    }));
    if (mode === 'complete') setWizardStep(1);
  }

  function changeOutcome(code: string) {
    setForm((c) => ({
      ...c,
      outcomeCode: code,
      reasonCode: '',
      scheduleDateOverride: '',
      scheduleTimeOverride: '',
      overrideStage: '',
      overrideStatus: '',
      overrideAction: '',
      overrideType: '',
      overridePriority: '',
    }));
    setShowAdvanced(false);
    setActivePreset(null);
  }

  function applyPreset(days: number) {
    setForm((c) => ({ ...c, scheduleDateOverride: localDatePlus(days) }));
    setActivePreset(days);
  }

  function validateComplete(): string | null {
    if (!form.outcomeCode && fuType?.requires_outcome) return 'Please select an outcome.';
    if (reasonRequired && !form.reasonCode) return 'A reason is required for this outcome before saving.';
    if (showReasons && !form.reasonCode && selectedOutcome?.asks_reason) return 'Please select a reason.';
    if (fuType?.requires_date && !form.date) return 'Please select a date.';
    if (fuType?.requires_time && !form.time) return 'Please select a time.';
    if (fuType?.requires_project && !form.project) return 'Please enter a project.';
    if (fuType?.requires_location && !form.siteLocation) return 'Please enter a site location.';
    if (fuType?.requires_participants && !form.participants) return 'Please enter participants.';
    if (fuType?.requires_template && !form.messageTemplate) return 'Please enter a message template.';
    return null;
  }

  function validateAddEdit(): string | null {
    if (!form.stageCode) return 'Please select a stage.';
    if (!form.statusCode) return 'Please select a status.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = mode === 'complete' ? validateComplete() : validateAddEdit();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (mode === 'edit' && currentFollowUp) {
        const updated = await updateFollowUp(currentFollowUp.id, {
          entity_code: form.entityCode,
          entity_name: form.entityName || null,
          entity_phone: form.entityPhone || null,
          entity_ref: form.entityRef || null,
          follow_up_type_code: form.followUpTypeCode,
          stage_code: form.stageCode,
          status_code: form.statusCode,
          outcome_code: form.outcomeCode || null,
          reason_code: form.reasonCode || null,
          next_action_code: form.nextActionOverride ?? null,
          priority_code: form.priorityCode,
          scheduled_date: form.scheduleDateOverride || form.date,
          scheduled_time: form.scheduleTimeOverride || form.time,
          custom_remark: form.customRemark || null,
          project: form.project || null,
          site_location: form.siteLocation || null,
          participants: form.participants || null,
          message_template: form.messageTemplate || null,
        });
        if (!updated) throw new Error('Update did not return the saved follow-up.');
        onSaved?.(null);
        return;
      }

      if (mode === 'add') {
        const newRecord: NewFollowUp = {
          entity_code: form.entityCode,
          entity_id: initialEntityId ? String(initialEntityId) : undefined,
          entity_name: form.entityName || null,
          entity_phone: form.entityPhone || null,
          entity_ref: form.entityRef || null,
          follow_up_type_code: form.followUpTypeCode,
          stage_code: form.stageCode,
          status_code: form.statusCode,
          outcome_code: null,
          reason_code: null,
          next_action_code: form.nextActionOverride || null,
          next_follow_up_type_code: null,
          priority_code: form.priorityCode,
          scheduled_date: form.scheduleDateOverride || form.date,
          scheduled_time: form.scheduleTimeOverride || form.time,
          attempt_no: 1,
          sequence_name: null,
          is_complete: false,
          completed_at: null,
          terminal: false,
          custom_remark: form.customRemark || null,
          project: form.project || null,
          site_location: form.siteLocation || null,
          participants: form.participants || null,
          message_template: form.messageTemplate || null,
          assigned_to: form.assignedTo || null,
          due_date: form.dueDate || null,
          due_time: form.dueTime || null,
          rule_snapshot: null,
          ai_generated: false,
        };
        const created = await createFollowUp(newRecord);
        if (!created) throw new Error('Create did not return the saved follow-up.');
        onSaved?.(created);
        return;
      }

      // mode === 'complete'
      if (!currentFollowUp) throw new Error('The follow-up to complete is unavailable.');

      // Update follow-up as completed via MySQL engine
      const updatedComplete = await updateFollowUp(currentFollowUp.id, {
        is_complete: true,
        completed_at: new Date().toISOString(),
        outcome_code: form.outcomeCode || null,
        reason_code: form.reasonCode || null,
        custom_remark: form.customRemark || null,
        project: form.project || null,
        site_location: form.siteLocation || null,
        participants: form.participants || null,
        message_template: form.messageTemplate || null,
        assigned_to: form.assignedTo || null,
        due_date: form.dueDate || null,
        due_time: form.dueTime || null,
      });
      if (!updatedComplete) throw new Error('Could not mark follow-up as completed.');

      let newFollowUp: FollowUp | null = null;

      // If no rule matched, generate default next step
      if (!matchedRule && form.createNext) {
        const defaultStep = generateDefaultNextStep(
          master,
          form.entityCode,
          form.followUpTypeCode,
          form.stageCode,
          form.statusCode
        );
        const defaultDate = form.scheduleDateOverride || localDatePlus(defaultStep.days);
        const defaultTime = form.scheduleTimeOverride || defaultStep.time;
        const defaultRecord: NewFollowUp = {
          entity_code: form.entityCode,
          entity_ref: currentFollowUp.entity_ref,
          follow_up_type_code: defaultStep.typeCode,
          stage_code: defaultStep.stageCode,
          status_code: defaultStep.statusCode,
          outcome_code: null,
          reason_code: null,
          next_action_code: defaultStep.actionCode,
          next_follow_up_type_code: null,
          priority_code: form.priorityCode || defaultStep.priorityCode,
          scheduled_date: defaultDate,
          scheduled_time: defaultTime,
          attempt_no: 1,
          sequence_name: null,
          is_complete: false,
          completed_at: null,
          terminal: false,
          custom_remark: form.customRemark || null,
          project: form.project || null,
          site_location: form.siteLocation || null,
          participants: form.participants || null,
          message_template: form.messageTemplate || null,
          rule_snapshot: null,
          ai_generated: false,
        };
        newFollowUp = await createFollowUp(defaultRecord);
      }

      if (matchedRule && form.createNext) {
        const nextRecord = buildNextFollowUp(
          matchedRule,
          master.sequences,
          currentFollowUp.attempt_no,
          currentFollowUp.entity_ref,
          form.customRemark || null,
          {
            project: form.project,
            siteLocation: form.siteLocation,
            participants: form.participants,
            messageTemplate: form.messageTemplate,
          }
        );
        if (nextRecord) {
          if (form.scheduleDateOverride) nextRecord.scheduled_date = form.scheduleDateOverride;
          if (form.scheduleTimeOverride) nextRecord.scheduled_time = form.scheduleTimeOverride;
          if (isOverridden) {
            if (form.overrideStage) nextRecord.stage_code = form.overrideStage;
            if (form.overrideStatus) nextRecord.status_code = form.overrideStatus;
            if (form.overrideAction) nextRecord.next_action_code = form.overrideAction;
            if (form.overrideType) nextRecord.follow_up_type_code = form.overrideType;
            if (form.overridePriority) nextRecord.priority_code = form.overridePriority;
          }
          if (form.priorityCode && form.priorityCode !== matchedRule.priority_code && !form.overridePriority)
            nextRecord.priority_code = form.priorityCode;
          newFollowUp = await createFollowUp(nextRecord);
          if (!newFollowUp) throw new Error('Next follow-up could not be created.');
        }
      }

      // Create automation jobs
      if (matchedRule && (matchedRule.auto_email || matchedRule.auto_whatsapp || matchedRule.auto_message)) {
        const stageName =
          master.stages.find((s) => s.code === form.stageCode && s.entity_code === form.entityCode)?.name ??
          form.stageCode;
        const statusName =
          master.statuses.find((s) => s.code === form.statusCode && s.entity_code === form.entityCode)?.name ??
          form.statusCode;
        await createAutomationJobs(
          matchedRule,
          newFollowUp?.id ?? currentFollowUp.id,
          form.entityCode,
          currentFollowUp.entity_ref,
          form.priorityCode,
          {
            project: form.project || null,
            date: form.scheduleDateOverride || form.date,
            time: form.scheduleTimeOverride || form.time,
            stage: stageName,
            status: statusName,
          }
        );
      }

      onSaved?.(newFollowUp);
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not save. Please try again.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!currentFollowUp) return;
    const ok = await deleteFollowUp(currentFollowUp.id);
    if (ok) {
      onDeleted?.(currentFollowUp.id);
    } else {
      setError('Could not delete. Please try again.');
    }
  }

  if (!open) return null;

  const entityName = master.entities.find((e) => e.code === form.entityCode)?.name ?? form.entityCode;
  const stageName =
    master.stages.find((s) => s.code === form.stageCode && s.entity_code === form.entityCode)?.name ?? form.stageCode;
  const statusName =
    master.statuses.find((s) => s.code === form.statusCode && s.entity_code === form.entityCode)?.name ?? form.statusCode;

  const entityLabel = entityName || (form.entityCode === 'BUYER' ? 'Buyer' : form.entityCode === 'SELLER' ? 'Seller' : 'Lead');
  const entityNameLabel = form.entityCode === 'BUYER' ? 'Buyer name' : form.entityCode === 'SELLER' ? 'Seller name' : 'Lead name';
  const entityNamePlaceholder = form.entityCode === 'BUYER' ? 'e.g. Rahul Mehta' : form.entityCode === 'SELLER' ? 'e.g. Ramesh Gupta' : 'e.g. Amit Sharma';
  const entityRefLabel = form.entityCode === 'BUYER' ? 'Buyer name / contact' : form.entityCode === 'SELLER' ? 'Seller name / contact' : 'Lead / customer name';
  const entityRefPlaceholder = form.entityCode === 'BUYER' ? 'e.g. Rahul Mehta (9876543210)' : form.entityCode === 'SELLER' ? 'e.g. Ramesh Gupta (9876543210)' : 'e.g. Amit Sharma (9876543210)';
  const remarkPlaceholder = form.entityCode === 'BUYER' ? 'Add any context about buyer budget, preferred locations, requirements, or next steps...' : form.entityCode === 'SELLER' ? 'Add any context about seller property details, expected price, listing status, or next steps...' : 'Add any context that helps the next person handling this follow-up...';

  const titleMap: Record<Mode, string> = {
    add: 'Add new follow-up',
    complete: `Complete ${entityLabel} Follow-up`,
    edit: `Edit ${entityLabel} Follow-up`,
  };
  const subtitleMap: Record<Mode, string> = {
    add: 'Create a new follow-up task',
    complete: 'Record the outcome — the system handles the rest',
    edit: 'Modify this follow-up task',
  };
  const submitLabelMap: Record<Mode, string> = {
    add: 'Create follow-up',
    complete: 'Complete & save',
    edit: 'Save changes',
  };

  const canShowReview =
    mode === 'complete' &&
    (!fuType?.requires_outcome || Boolean(form.outcomeCode)) &&
    (!showReasons || Boolean(form.reasonCode));
  const isTerminal = matchedRule && (matchedRule.terminal || (nextStep?.isSequenceTerminal ?? false));
  const presets = [
    { d: 0, label: 'Today' },
    { d: 1, label: 'Tomorrow' },
    { d: 2, label: '+2 Days' },
    { d: 7, label: 'Next Week' },
  ];

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal-wide" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title-icon">
            <Target size={21} />
          </div>
          <div>
            <h2>{titleMap[mode]}</h2>
            <p>{subtitleMap[mode]}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Context bar for complete/edit modes */}
            {mode !== 'add' && currentFollowUp && (
              <div className="context-bar">
                <div className="context-item">
                  <span>Entity</span>
                  <strong>{entityName}</strong>
                </div>
                <div className="context-item">
                  <span>Stage</span>
                  <strong>{stageName}</strong>
                </div>
                <div className="context-item">
                  <span>Status</span>
                  <strong>{statusName}</strong>
                </div>
                {currentFollowUp.attempt_no > 1 && (
                  <div className="context-item">
                    <span>Attempt</span>
                    <strong>#{currentFollowUp.attempt_no}</strong>
                  </div>
                )}
              </div>
            )}

            {/* ===== COMPLETE MODE: Guided wizard ===== */}
            {mode === 'complete' && (
              <>
                {/* Step indicator */}
                <div className="wizard-steps">
                  <div className={`wizard-step-indicator ${wizardStep === 1 ? 'active' : ''} ${wizardStep > 1 ? 'done' : ''}`}>
                    <span className="ws-num">{wizardStep > 1 ? <Check size={13} /> : 1}</span>
                    <span className="ws-label">Outcome</span>
                  </div>
                  {showReasons && (
                    <>
                      <div className="wizard-step-line" />
                      <div className={`wizard-step-indicator ${wizardStep === 2 ? 'active' : ''} ${wizardStep > 2 ? 'done' : ''}`}>
                        <span className="ws-num">{wizardStep > 2 ? <Check size={13} /> : 2}</span>
                        <span className="ws-label">Reason</span>
                      </div>
                    </>
                  )}
                  <div className="wizard-step-line" />
                  <div className={`wizard-step-indicator ${wizardStep === 3 || canShowReview ? 'active' : ''}`}>
                    <span className="ws-num">{showReasons ? 3 : 2}</span>
                    <span className="ws-label">Review</span>
                  </div>
                </div>

                {/* Follow-up type selector */}
                <label className="field wide" style={{ marginBottom: '16px' }}>
                  <span>Follow-up type</span>
                  <div className="type-selector">
                    {availableFollowUpTypes.map((t) => {
                      const Icon = getIcon(t.icon, t.code);
                      return (
                        <button
                          type="button"
                          key={t.code}
                          className={form.followUpTypeCode === t.code ? 'type-option selected' : 'type-option'}
                          onClick={() => changeType(t.code)}
                        >
                          <Icon size={16} />
                          <span>{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </label>

                {/* Step 1: Outcome selection */}
                {wizardStep === 1 && (
                  <div className="wizard-panel">
                    {outcomes.length > 0 ? (
                      <label className="field wide">
                        <span>What happened? {fuType?.requires_outcome ? <em>*</em> : null}</span>
                        <div className="outcome-grid">
                          {outcomes.map((o) => (
                            <button
                              type="button"
                              key={o.code}
                              className={form.outcomeCode === o.code ? 'outcome-option selected' : 'outcome-option'}
                              onClick={() => changeOutcome(o.code)}
                            >
                              {o.name}
                            </button>
                          ))}
                        </div>
                      </label>
                    ) : (
                      <div className="no-outcome-state">
                        <Check size={18} />
                        <div>
                          <strong>No outcome needed for this type</strong>
                          <span>Click "Complete & save" to mark this follow-up as done.</span>
                        </div>
                      </div>
                    )}
                    {!fuType?.requires_outcome && outcomes.length === 0 && (
                      <div className="wizard-nav">
                        <button type="button" className="primary-button" onClick={() => setWizardStep(3)}>
                          Continue <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Reason selection */}
                {wizardStep === 2 && showReasons && (
                  <div className="wizard-panel">
                    <label className="field wide">
                      <span>Why? {reasonRequired ? <em>*</em> : '(optional)'}</span>
                      <div className="select-wrap">
                        <select value={form.reasonCode} onChange={(e) => update('reasonCode', e.target.value)} autoFocus>
                          <option value="">Select reason...</option>
                          {master.reasons.map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} />
                      </div>
                    </label>
                    {reasonRequired && (
                      <div className="helper-text">
                        <AlertCircle size={12} /> A reason is required for this outcome before the workflow can be resolved.
                      </div>
                    )}
                    <div className="wizard-nav">
                      <button type="button" className="secondary-button" onClick={() => setWizardStep(1)}>
                        Back
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => setWizardStep(3)}
                        disabled={!form.reasonCode && reasonRequired}
                      >
                        Continue <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {wizardStep === 3 && canShowReview && (
                  <div className="wizard-panel">
                    {/* Type-specific fields */}
                    {(fuType?.requires_date ||
                      fuType?.requires_time ||
                      fuType?.requires_project ||
                      fuType?.requires_location ||
                      fuType?.requires_participants ||
                      fuType?.requires_template) && (
                      <div className="special-section">
                        <div className="special-header">
                          {(() => {
                            const SI = getIcon((fuType as any)?.icon_name || fuType?.icon, fuType?.code);
                            return <SI size={15} />;
                          })()}
                          <h4>
                            {fuType?.code === 'WHATSAPP'
                              ? 'WHATSAPP DETAILS'
                              : fuType?.code === 'EMAIL'
                              ? 'EMAIL DETAILS'
                              : fuType?.code === 'SITE_VISIT' || fuType?.code === 'VISIT'
                              ? 'SITE VISIT DETAILS'
                              : fuType?.code === 'MEETING'
                              ? 'MEETING DETAILS'
                              : `${fuType?.name?.toUpperCase() ?? ''} DETAILS`}
                          </h4>
                        </div>
                        <div className="form-grid" style={{ marginBottom: '18px' }}>
                          {fuType.requires_date && (
                            <label className="field">
                              <span>
                                Date <em>*</em>
                              </span>
                              <input
                                type="date"
                                value={form.date}
                                onChange={(e) => update('date', e.target.value)}
                                required
                              />
                            </label>
                          )}
                          {fuType.requires_time && (
                            <label className="field">
                              <span>
                                Time <em>*</em>
                              </span>
                              <input
                                type="time"
                                value={form.time}
                                onChange={(e) => update('time', e.target.value)}
                                required
                              />
                            </label>
                          )}
                          {fuType.requires_project && (
                            <label className="field">
                              <span>
                                Project <em>*</em>
                              </span>
                              <input
                                value={form.project}
                                onChange={(e) => update('project', e.target.value)}
                                placeholder="e.g. Tamara Uprise"
                              />
                            </label>
                          )}
                          {fuType.requires_location && (
                            <label className="field">
                              <span>
                                Site location <em>*</em>
                              </span>
                              <input
                                value={form.siteLocation}
                                onChange={(e) => update('siteLocation', e.target.value)}
                                placeholder="Site address"
                              />
                            </label>
                          )}
                          {fuType.requires_participants && (
                            <label className="field wide">
                              <span>
                                Participants <em>*</em>
                              </span>
                              <input
                                value={form.participants}
                                onChange={(e) => update('participants', e.target.value)}
                                placeholder="Comma-separated names"
                              />
                            </label>
                          )}
                          {fuType.requires_template && (
                            <label className="field wide">
                              <span>Message template</span>
                              <textarea
                                rows={3}
                                value={form.messageTemplate}
                                onChange={(e) => update('messageTemplate', e.target.value)}
                                placeholder="Message to send..."
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Automatic Decision Panel */}
                    {matchedRule ? (
                      <div className={`auto-panel ${isOverridden ? 'overridden' : ''}`}>
                        <div className="auto-top">
                          <span className="auto-badge">
                            <Check size={13} /> Automatic Decision
                          </span>
                          <small>
                            {isOverridden
                              ? 'Manager override applied'
                              : matchedRule.terminal
                              ? 'Terminal outcome'
                              : 'Matched & ready'}
                          </small>
                        </div>
                        <div className="auto-grid">
                          <div className="auto-item">
                            <small>Next Stage</small>
                            <b>{nextStageName ?? '—'}</b>
                          </div>
                          <div className="auto-item">
                            <small>Next Status</small>
                            <b>{nextStatusName ?? '—'}</b>
                          </div>
                          <div className="auto-item">
                            <small>Next Action</small>
                            <b>{nextActionName ?? '—'}</b>
                          </div>
                          <div className="auto-item">
                            <small>Next Type</small>
                            <b>{nextTypeName ?? '—'}</b>
                          </div>
                          <div className="auto-item">
                            <small>Priority</small>
                            <b>{priorityName ?? '—'}</b>
                          </div>
                          <div className="auto-item">
                            <small>Rule</small>
                            <b>{matchedRule.rule_id}</b>
                          </div>
                        </div>
                        <div className="auto-explain">
                          <b>Why:</b> Current state <b>{stageName} / {statusName}</b> + <b>{fuType?.name}</b> +{' '}
                          <b>{selectedOutcome?.name ?? form.outcomeCode}</b>
                          {form.reasonCode ? (
                            <>
                              {' '}
                              + <b>{master.reasons.find((r) => r.code === form.reasonCode)?.name ?? form.reasonCode}</b>
                            </>
                          ) : (
                            ''
                          )}{' '}
                          resolved to <b>{nextActionName ?? matchedRule.next_action_code}</b>.{' '}
                          {isTerminal
                            ? 'This is a terminal outcome; no future task is created.'
                            : 'The next task is automatically created from the master rule.'}
                          {isOverridden ? ' Manager override applied.' : ''}
                        </div>
                        {matchedRule.sequence_name && !isTerminal && (
                          <div className="auto-sequence-tag">
                            <Zap size={12} /> Sequence: {matchedRule.sequence_name.replace(/_/g, ' ')}
                          </div>
                        )}
                        {(matchedRule.auto_email || matchedRule.auto_whatsapp || matchedRule.auto_message) && (
                          <div className="auto-automation-preview">
                            <div className="aap-header">
                              <Send size={13} /> Auto-send on save
                            </div>
                            <div className="aap-channels">
                              {matchedRule.auto_email && <span className="aap-channel email">Email</span>}
                              {matchedRule.auto_whatsapp && <span className="aap-channel whatsapp">WhatsApp</span>}
                              {matchedRule.auto_message && <span className="aap-channel message">Message</span>}
                            </div>
                            {matchedRule.message_body && (
                              <div className="aap-body">
                                {resolveMessageTemplate(matchedRule.message_body, {
                                  entityRef: currentFollowUp?.entity_ref,
                                  project: form.project || null,
                                  date: form.date,
                                  time: form.time,
                                  stage: stageName,
                                  status: statusName,
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="auto-panel no-match">
                        <div className="auto-top">
                          <span className="auto-badge warn">
                            <AlertCircle size={13} /> No exact rule — using smart default
                          </span>
                          <small>Auto-fallback active</small>
                        </div>
                        <div className="auto-explain">
                          <b>No master rule</b> for <b>{stageName} / {statusName}</b> + <b>{fuType?.name}</b> +{' '}
                          <b>{selectedOutcome?.name ?? form.outcomeCode}</b>. The system will use a <b>smart default</b>{' '}
                          to schedule the next follow-up so the workflow never stops. An admin can add a specific rule in
                          Masters for finer control.
                        </div>
                      </div>
                    )}

                    {/* Schedule section */}
                    <div className="schedule-section">
                      <div className="schedule-head">
                        <b>Next follow-up / task</b>
                        <label className="schedule-check">
                          <input
                            type="checkbox"
                            checked={form.createNext}
                            onChange={(e) => update('createNext', e.target.checked)}
                            disabled={Boolean(isTerminal)}
                          />
                          Create automatically
                        </label>
                      </div>
                      {isTerminal ? (
                        <div className="terminal-notice">
                          <Check size={14} /> Terminal outcome: <b>{nextActionName ?? matchedRule?.next_action_code}</b>.
                          No unnecessary follow-up task will be created.
                        </div>
                      ) : !matchedRule ? (
                        <div className="no-next-notice">
                          No exact rule matched — a smart default next step will be created automatically.
                        </div>
                      ) : (
                        <>
                          <div className="presets">
                            {presets.map((p) => (
                              <button
                                key={p.d}
                                type="button"
                                className={`preset ${activePreset === p.d ? 'active' : ''}`}
                                onClick={() => applyPreset(p.d)}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <label className="field">
                              <span>Date</span>
                              <input
                                type="date"
                                value={
                                  form.scheduleDateOverride ||
                                  nextStep?.scheduledDate ||
                                  localDatePlus(matchedRule?.default_days ?? 1)
                                }
                                onChange={(e) => {
                                  update('scheduleDateOverride', e.target.value);
                                  setActivePreset(null);
                                }}
                              />
                            </label>
                            <label className="field">
                              <span>Time</span>
                              <input
                                type="time"
                                value={
                                  form.scheduleTimeOverride ||
                                  nextStep?.scheduledTime ||
                                  matchedRule?.default_time ||
                                  '11:00'
                                }
                                onChange={(e) => update('scheduleTimeOverride', e.target.value)}
                              />
                            </label>
                            <label className="field">
                              <span>Next type</span>
                              <div className="select-wrap">
                                <select
                                  value={
                                    form.overrideType ||
                                    nextStep?.nextFollowUpTypeCode ||
                                    matchedRule.follow_up_type_code
                                  }
                                  onChange={(e) => update('overrideType', e.target.value)}
                                >
                                  {master.followUpTypes.map((t) => (
                                    <option key={t.code} value={t.code}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={16} />
                              </div>
                            </label>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Employee note */}
                    <label className="field wide" style={{ marginTop: '16px' }}>
                      <span>Employee remark</span>
                      <textarea
                        rows={2}
                        value={form.customRemark}
                        onChange={(e) => update('customRemark', e.target.value)}
                        placeholder="Optional. Add only information that is not already captured structurally."
                      />
                    </label>
                    {matchedRule?.remark && (
                      <div className="remark-suggest">
                        <div className="remark-suggest-text">
                          <Sparkles size={13} /> <b>Auto remark from master:</b> <span>{matchedRule.remark}</span>
                        </div>
                        <button
                          type="button"
                          className="copy-remark"
                          onClick={() => update('customRemark', matchedRule.remark ?? '')}
                        >
                          Use
                        </button>
                      </div>
                    )}

                    {/* Advanced Controls */}
                    <details
                      className="advanced-controls"
                      open={showAdvanced}
                      onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}
                    >
                      <summary>
                        <Settings2 size={13} /> Advanced Controls — Manager / Admin Only
                      </summary>
                      <div className="advanced-body">
                        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          <label className="field">
                            <span>Next stage</span>
                            <div className="select-wrap">
                              <select
                                value={form.overrideStage}
                                onChange={(e) => update('overrideStage', e.target.value)}
                              >
                                <option value="">Default ({nextStageName ?? '—'})</option>
                                {availableStages.map((s) => (
                                  <option key={s.code} value={s.code}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} />
                            </div>
                          </label>
                          <label className="field">
                            <span>Next status</span>
                            <div className="select-wrap">
                              <select
                                value={form.overrideStatus}
                                onChange={(e) => update('overrideStatus', e.target.value)}
                              >
                                <option value="">Default ({nextStatusName ?? '—'})</option>
                                {availableStatuses.map((s) => (
                                  <option key={s.code} value={s.code}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} />
                            </div>
                          </label>
                          <label className="field">
                            <span>Next action</span>
                            <div className="select-wrap">
                              <select
                                value={form.overrideAction}
                                onChange={(e) => update('overrideAction', e.target.value)}
                              >
                                <option value="">Default ({nextActionName ?? '—'})</option>
                                {master.nextActions.map((a) => (
                                  <option key={a.code} value={a.code}>
                                    {a.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} />
                            </div>
                          </label>
                          <label className="field">
                            <span>Priority</span>
                            <div className="select-wrap">
                              <select
                                value={form.overridePriority}
                                onChange={(e) => update('overridePriority', e.target.value)}
                              >
                                <option value="">Default ({priorityName ?? '—'})</option>
                                {master.priorities.map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} />
                            </div>
                          </label>
                        </div>
                        <div className="helper-text">
                          Changing any value here overrides the master rule for this follow-up only. Production: keep this
                          hidden for Sales / Pre-sales roles and require a permission to apply overrides.
                        </div>
                      </div>
                    </details>

                    <div className="wizard-nav">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setWizardStep(showReasons ? 2 : 1)}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== ADD MODE: Guided wizard ===== */}
            {mode === 'add' && (
              <>
                {/* Step indicator */}
                <div className="wizard-steps">
                  <div className={`wizard-step-indicator ${addWizardStep === 1 ? 'active' : ''} ${addWizardStep > 1 ? 'done' : ''}`}>
                    <span className="ws-num">{addWizardStep > 1 ? <Check size={13} /> : 1}</span>
                    <span className="ws-label">Who & What</span>
                  </div>
                  <div className="wizard-step-line" />
                  <div className={`wizard-step-indicator ${addWizardStep === 2 ? 'active' : ''} ${addWizardStep > 2 ? 'done' : ''}`}>
                    <span className="ws-num">{addWizardStep > 2 ? <Check size={13} /> : 2}</span>
                    <span className="ws-label">Details</span>
                  </div>
                  <div className="wizard-step-line" />
                  <div className={`wizard-step-indicator ${addWizardStep === 3 ? 'active' : ''}`}>
                    <span className="ws-num">3</span>
                    <span className="ws-label">Review</span>
                  </div>
                </div>

                {/* Quick-add presets */}
                {quickPresets.length > 0 && addWizardStep === 1 && (
                  <div className="quick-presets">
                    <span className="quick-presets-label">
                      <Sparkles size={13} /> Quick start:
                    </span>
                    {quickPresets.map((p) => {
                      const Icon = getIcon(p.icon, p.type);
                      return (
                        <button
                          type="button"
                          key={p.label}
                          className="quick-preset-btn"
                          onClick={() => {
                            applyQuickPreset(p);
                            setSuggestionApplied(false);
                          }}
                        >
                          <Icon size={14} /> {p.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Step 1: Who & What */}
                {addWizardStep === 1 && (
                  <div className="wizard-panel">
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <label className="field">
                        <span>
                          Entity <em>*</em>
                        </span>
                        <div className="select-wrap">
                          <select value={form.entityCode} onChange={(e) => changeEntity(e.target.value)}>
                            {master.entities.map((e) => (
                              <option key={e.code} value={e.code}>
                                {e.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} />
                        </div>
                      </label>
                      <label className="field ref-autocomplete">
                        <span>
                          {entityNameLabel} <em>*</em>
                        </span>
                        <input
                          value={form.entityName}
                          onChange={(e) => {
                            const nameVal = e.target.value;
                            const phoneVal = form.entityPhone;
                            const refVal = nameVal ? (phoneVal ? `${nameVal} (${phoneVal})` : nameVal) : (phoneVal || '');
                            setForm((c) => ({ ...c, entityName: nameVal, entityRef: refVal }));
                            setShowRefSuggestions(true);
                          }}
                          onFocus={() => setShowRefSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowRefSuggestions(false), 150)}
                          placeholder={entityNamePlaceholder}
                          autoComplete="off"
                          required
                        />
                        {showRefSuggestions && filteredRefOptions.length > 0 && (
                          <div className="ref-suggestions">
                            {filteredRefOptions.map((opt) => (
                              <button
                                type="button"
                                key={opt.ref}
                                className="ref-suggestion"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const rawRef = opt.ref;
                                  const matchPhone = rawRef.match(/\(([^)]+)\)/);
                                  const parsedPhone = matchPhone ? matchPhone[1] : '';
                                  const parsedName = rawRef.replace(/\s*\([^)]*\)\s*$/, '');
                                  setForm((c) => ({
                                    ...c,
                                    entityName: parsedName,
                                    entityPhone: parsedPhone || c.entityPhone,
                                    entityRef: rawRef,
                                  }));
                                  setShowRefSuggestions(false);
                                }}
                              >
                                <span>{opt.ref}</span>
                                {opt.hasPending && <span className="pending-tag">Pending</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </label>
                      <label className="field">
                        <span>Phone number</span>
                        <input
                          type="tel"
                          value={form.entityPhone}
                          onChange={(e) => {
                            const phoneVal = e.target.value;
                            const nameVal = form.entityName;
                            const refVal = nameVal ? (phoneVal ? `${nameVal} (${phoneVal})` : nameVal) : (phoneVal || '');
                            setForm((c) => ({ ...c, entityPhone: phoneVal, entityRef: refVal }));
                          }}
                          placeholder="e.g. +91 9876543210"
                        />
                      </label>
                    </div>

                    <label className="field wide" style={{ marginTop: '16px' }}>
                      <span>Follow-up type</span>
                      <div className="type-selector">
                        {availableFollowUpTypes.map((t) => {
                          const Icon = getIcon(t.icon, t.code);
                          return (
                            <button
                              type="button"
                              key={t.code}
                              className={form.followUpTypeCode === t.code ? 'type-option selected' : 'type-option'}
                              onClick={() => changeType(t.code)}
                            >
                              <Icon size={16} />
                              <span>{t.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </label>

                    <label className="field wide" style={{ marginTop: '16px' }}>
                      <span>
                        What should happen? <small className="field-hint">Optional — drives smart suggestions below</small>
                      </span>
                      {entityActions.length > 0 ? (
                        <div className="outcome-grid action-intent-grid">
                          {entityActions.map((action) => (
                            <button
                              type="button"
                              key={action.code}
                              className={
                                form.nextActionOverride === action.code ? 'outcome-option selected' : 'outcome-option'
                              }
                              onClick={() =>
                                update(
                                  'nextActionOverride',
                                  form.nextActionOverride === action.code ? '' : action.code
                                )
                              }
                            >
                              {action.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="no-outcome-state" style={{ padding: '10px' }}>
                          <AlertCircle size={14} />
                          <span>
                            No actions configured for {entityName} + {fuType?.name ?? 'this type'}. Add rules in Masters
                            to enable intent selection.
                          </span>
                        </div>
                      )}
                    </label>

                    {/* Smart stage/status suggestion panel */}
                    {stageSuggestion && (
                      <div className="smart-suggestion-panel">
                        <div className="smart-suggestion-top">
                          <span className="ss-title">
                            <Sparkles size={14} /> SMART SUGGESTION
                          </span>
                          <span className="ss-confidence">
                            {stageSuggestion.confidence === 'high' ? 'High confidence' : 'Medium confidence'}
                          </span>
                        </div>
                        <div className="smart-suggestion-body">
                          <div className="ss-item">
                            <small>STAGE</small>
                            <b>
                              {master.stages.find(
                                (s) => s.code === stageSuggestion.stageCode && s.entity_code === form.entityCode
                              )?.name ?? stageSuggestion.stageCode}
                            </b>
                          </div>
                          <div className="ss-item">
                            <small>STATUS</small>
                            <b>
                              {master.statuses.find(
                                (s) => s.code === stageSuggestion.statusCode && s.entity_code === form.entityCode
                              )?.name ?? stageSuggestion.statusCode}
                            </b>
                          </div>
                        </div>
                        <div className="smart-suggestion-reason">{stageSuggestion.reason}</div>
                      </div>
                    )}

                    <div className="form-grid" style={{ marginTop: '16px' }}>
                      <label className="field">
                        <span>
                          Stage <em>*</em>
                        </span>
                        <div className="select-wrap">
                          <select value={form.stageCode} onChange={(e) => update('stageCode', e.target.value)}>
                            <option value="">Select stage...</option>
                            {availableStages.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} />
                        </div>
                      </label>
                      <label className="field">
                        <span>
                          Status <em>*</em>
                        </span>
                        <div className="select-wrap">
                          <select value={form.statusCode} onChange={(e) => update('statusCode', e.target.value)}>
                            <option value="">Select status...</option>
                            {availableStatuses.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} />
                        </div>
                      </label>
                    </div>

                    {pendingForRef && (
                      <div className="duplicate-warning">
                        <AlertCircle size={14} />{' '}
                        <span>
                          A pending follow-up already exists for <b>{form.entityRef}</b>. Creating another may duplicate
                          work.
                        </span>
                      </div>
                    )}

                    <div className="wizard-nav">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => setAddWizardStep(2)}
                        disabled={!form.stageCode || !form.statusCode}
                      >
                        Continue <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Type-specific details */}
                {addWizardStep === 2 && (
                  <div className="wizard-panel">
                    {fuType?.requires_date ||
                    fuType?.requires_time ||
                    fuType?.requires_project ||
                    fuType?.requires_location ||
                    fuType?.requires_participants ||
                    fuType?.requires_template ? (
                      <div className="special-section">
                        <div className="special-header">
                          {(() => {
                            const SI = getIcon((fuType as any)?.icon_name || fuType?.icon, fuType?.code);
                            return <SI size={15} />;
                          })()}
                          <h4>
                            {fuType?.code === 'WHATSAPP'
                              ? 'WHATSAPP DETAILS'
                              : fuType?.code === 'EMAIL'
                              ? 'EMAIL DETAILS'
                              : fuType?.code === 'SITE_VISIT' || fuType?.code === 'VISIT'
                              ? 'SITE VISIT DETAILS'
                              : fuType?.code === 'MEETING'
                              ? 'MEETING DETAILS'
                              : `${fuType?.name?.toUpperCase() ?? ''} DETAILS`}
                          </h4>
                        </div>
                        <div className="form-grid">
                          {fuType.requires_date && (
                            <label className="field">
                              <span>
                                Date <em>*</em>
                              </span>
                              <input
                                type="date"
                                value={form.date}
                                onChange={(e) => update('date', e.target.value)}
                                required
                              />
                            </label>
                          )}
                          {fuType.requires_time && (
                            <label className="field">
                              <span>
                                Time <em>*</em>
                              </span>
                              <input
                                type="time"
                                value={form.time}
                                onChange={(e) => update('time', e.target.value)}
                                required
                              />
                            </label>
                          )}
                          {fuType.requires_project && (
                            <label className="field">
                              <span>
                                Project <em>*</em>
                              </span>
                              <input
                                value={form.project}
                                onChange={(e) => update('project', e.target.value)}
                                placeholder="e.g. Tamara Uprise"
                              />
                            </label>
                          )}
                          {fuType.requires_location && (
                            <label className="field">
                              <span>
                                Site location <em>*</em>
                              </span>
                              <input
                                value={form.siteLocation}
                                onChange={(e) => update('siteLocation', e.target.value)}
                                placeholder="Site address"
                              />
                            </label>
                          )}
                          {fuType.requires_participants && (
                            <label className="field wide">
                              <span>
                                Participants <em>*</em>
                              </span>
                              <input
                                value={form.participants}
                                onChange={(e) => update('participants', e.target.value)}
                                placeholder="Comma-separated names"
                              />
                            </label>
                          )}
                          {fuType.requires_template && (
                            <label className="field wide">
                              <span>Message template</span>
                              <textarea
                                rows={3}
                                value={form.messageTemplate}
                                onChange={(e) => update('messageTemplate', e.target.value)}
                                placeholder="Message to send..."
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="no-extra-details-box" style={{ padding: '16px 0 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Check size={22} style={{ color: '#0f172a' }} />
                        <div style={{ fontSize: '15px', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#0f172a', fontWeight: 700 }}>No extra details needed for {fuType?.name ?? 'Phone Call'}</strong>
                          <span>Continue to the review step.</span>
                        </div>
                      </div>
                    )}

                    <div className="wizard-nav">
                      <button type="button" className="secondary-button" onClick={() => setAddWizardStep(1)}>
                        Back
                      </button>
                      <button type="button" className="primary-button" onClick={() => setAddWizardStep(3)}>
                        Continue <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {addWizardStep === 3 && (
                  <div className="wizard-panel">
                    {/* Schedule + Priority */}
                    <div className="schedule-section" style={{ marginBottom: '16px' }}>
                      <div className="schedule-head">
                        <b>Schedule & Priority</b>
                      </div>
                      <div className="presets">
                        {presets.map((p) => (
                          <button
                            key={p.d}
                            type="button"
                            className={`preset ${activePreset === p.d ? 'active' : ''}`}
                            onClick={() => applyPreset(p.d)}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <label className="field">
                          <span>
                            Schedule date <em>*</em>
                          </span>
                          <input
                            type="date"
                            value={form.scheduleDateOverride || form.date}
                            onChange={(e) => {
                              update('scheduleDateOverride', e.target.value);
                              setActivePreset(null);
                            }}
                            required
                          />
                        </label>
                        <label className="field">
                          <span>
                            Schedule time <em>*</em>
                          </span>
                          <input
                            type="time"
                            value={form.scheduleTimeOverride || form.time}
                            onChange={(e) => update('scheduleTimeOverride', e.target.value)}
                            required
                          />
                        </label>
                      </div>
                      <label className="field wide" style={{ marginTop: '14px' }}>
                        <span>Priority</span>
                        <div className="priority-selector">
                          {master.priorities
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((p) => (
                              <button
                                type="button"
                                key={p.code}
                                className={`priority-option ${p.code.toLowerCase()} ${
                                  form.priorityCode === p.code ? 'selected' : ''
                                }`}
                                onClick={() => update('priorityCode', p.code)}
                              >
                                <span className="priority-dot" /> {p.name}
                              </button>
                            ))}
                        </div>
                      </label>
                    </div>

                    {/* Smart priority suggestion badge */}
                    {prioritySuggestion && (
                      <div className="smart-priority-badge" style={{ marginTop: '12px' }}>
                        <Sparkles size={13} /> Priority auto-set to{' '}
                        <b>
                          {master.priorities.find((p) => p.code === prioritySuggestion.priorityCode)?.name ??
                            prioritySuggestion.priorityCode}
                        </b>{' '}
                        — {prioritySuggestion.reason}
                      </div>
                    )}

                    {/* Assignment + deadline */}
                    <div
                      className="form-grid"
                      style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' }}
                    >
                      <label className="field">
                        <span>Assign to</span>
                        <input
                          type="text"
                          value={form.assignedTo || 'Unassigned'}
                          readOnly
                          disabled
                          style={{
                            backgroundColor: '#f8fafc',
                            cursor: 'not-allowed',
                            color: '#0f172a',
                            fontWeight: 600,
                            border: '1px solid #cbd5e1',
                          }}
                        />
                      </label>
                      <label className="field">
                        <span>Due date</span>
                        <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
                      </label>
                      <label className="field">
                        <span>Due time</span>
                        <input type="time" value={form.dueTime} onChange={(e) => update('dueTime', e.target.value)} />
                      </label>
                    </div>
                    {aiLeadInsight && (
                      <div className="ai-form-suggestion">
                        <div>
                          <BrainCircuit size={14} />
                          <b>AI lead signal</b>
                          <span>
                            Score {aiLeadInsight.score} · {aiLeadInsight.trend.toLowerCase()} ·{' '}
                            {aiLeadInsight.total_follow_ups} follow-ups
                          </span>
                        </div>
                        <strong>
                          {aiLeadInsight.team_name ?? 'Unassigned'}
                          {aiLeadInsight.member_name ? ` · ${aiLeadInsight.member_name}` : ''}
                        </strong>
                        <small>{aiLeadInsight.suggested_reason}</small>
                      </div>
                    )}

                    {/* Employee note */}
                    <label className="field wide" style={{ marginTop: '16px' }}>
                      <span>Employee remark</span>
                      <textarea
                        rows={2}
                        value={form.customRemark}
                        onChange={(e) => update('customRemark', e.target.value)}
                        placeholder={remarkPlaceholder}
                      />
                    </label>
                    {addModeRuleHint?.remark && (
                      <div className="remark-suggest">
                        <div className="remark-suggest-text">
                          <Sparkles size={13} /> <b>Auto remark from master:</b> <span>{addModeRuleHint.remark}</span>
                        </div>
                        <button
                          type="button"
                          className="copy-remark"
                          onClick={() => update('customRemark', addModeRuleHint.remark ?? '')}
                        >
                          Use
                        </button>
                      </div>
                    )}
                    {/* Historical remark suggestions */}
                    {(remarkSuggestionsLoading || remarkSuggestions.length > 0) && (
                      <div className="remark-history-suggestions">
                        <div className="rhs-label">
                          <Sparkles size={12} />{' '}
                          {remarkSuggestionsLoading ? 'Loading team remarks...' : 'Previously used by your team:'}
                        </div>
                        {!remarkSuggestionsLoading && remarkSuggestions.length > 0 && (
                          <div className="rhs-chips">
                            {remarkSuggestions.map((r) => (
                              <button
                                type="button"
                                key={r}
                                className="rhs-chip"
                                onClick={() => update('customRemark', r)}
                                title={r}
                              >
                                {r.length > 42 ? r.slice(0, 42) + '...' : r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Live preview card */}
                    <div className="add-preview-card" style={{ marginTop: '16px' }}>
                      <div className="apc-header">
                        <div className="apc-icon">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <strong>Task Preview</strong>
                          <span>How this will appear in the queue</span>
                        </div>
                      </div>
                      <div className="apc-body">
                        <div className="apc-row">
                          <div className="apc-label">ENTITY</div>
                          <div className="apc-value">
                            {entityName}
                            {form.entityRef ? ` — ${form.entityRef}` : ''}
                          </div>
                        </div>
                        <div className="apc-row">
                          <div className="apc-label">STAGE / STATUS</div>
                          <div className="apc-value">
                            {stageName || '—'} / {statusName || '—'}
                          </div>
                        </div>
                        <div className="apc-row">
                          <div className="apc-label">TYPE</div>
                          <div className="apc-value">{fuType?.name ?? '—'}</div>
                        </div>
                        {form.nextActionOverride && (
                          <div className="apc-row">
                            <div className="apc-label">INTENT</div>
                            <div className="apc-value">
                              {master.nextActions.find((a) => a.code === form.nextActionOverride)?.name ??
                                form.nextActionOverride}
                            </div>
                          </div>
                        )}
                        <div className="apc-row">
                          <div className="apc-label">SCHEDULED</div>
                          <div className="apc-value">
                            {form.scheduleDateOverride || form.date} at {form.scheduleTimeOverride || form.time}
                          </div>
                        </div>
                        <div className="apc-row">
                          <div className="apc-label">PRIORITY</div>
                          <div className="apc-value">
                            <span className="priority-chip">
                              {master.priorities.find((p) => p.code === form.priorityCode)?.name ?? form.priorityCode}
                            </span>
                          </div>
                        </div>
                        {addModeRuleHint && (
                          <div className="apc-row apc-rule-hint">
                            <div className="apc-label">RULE MATCH</div>
                            <div className="apc-value">
                              <Sparkles size={13} /> {addModeRuleHint.rule_id} —{' '}
                              {master.nextActions.find((a) => a.code === addModeRuleHint.next_action_code)?.name ??
                                addModeRuleHint.next_action_code}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="wizard-nav">
                      <button type="button" className="secondary-button" onClick={() => setAddWizardStep(2)}>
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== EDIT MODE: Full form ===== */}
            {mode === 'edit' && (
              <div className="form-grid">
                <label className="field">
                  <span>
                    Entity <em>*</em>
                  </span>
                  <div className="select-wrap">
                    <select value={form.entityCode} onChange={(e) => changeEntity(e.target.value)}>
                      {master.entities.map((e) => (
                        <option key={e.code} value={e.code}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </label>
                <label className="field">
                  <span>{entityNameLabel} <em>*</em></span>
                  <input
                    value={form.entityName}
                    onChange={(e) => {
                      const nameVal = e.target.value;
                      const phoneVal = form.entityPhone;
                      const refVal = nameVal ? (phoneVal ? `${nameVal} (${phoneVal})` : nameVal) : (phoneVal || '');
                      setForm((c) => ({ ...c, entityName: nameVal, entityRef: refVal }));
                    }}
                    placeholder={entityNamePlaceholder}
                    required
                  />
                </label>
                <label className="field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    value={form.entityPhone}
                    onChange={(e) => {
                      const phoneVal = e.target.value;
                      const nameVal = form.entityName;
                      const refVal = nameVal ? (phoneVal ? `${nameVal} (${phoneVal})` : nameVal) : (phoneVal || '');
                      setForm((c) => ({ ...c, entityPhone: phoneVal, entityRef: refVal }));
                    }}
                    placeholder="e.g. +91 9876543210"
                  />
                </label>
                <label className="field">
                  <span>
                    Stage <em>*</em>
                  </span>
                  <div className="select-wrap">
                    <select value={form.stageCode} onChange={(e) => update('stageCode', e.target.value)}>
                      <option value="">Select stage...</option>
                      {availableStages.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </label>
                <label className="field">
                  <span>
                    Status <em>*</em>
                  </span>
                  <div className="select-wrap">
                    <select value={form.statusCode} onChange={(e) => update('statusCode', e.target.value)}>
                      <option value="">Select status...</option>
                      {availableStatuses.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </label>
                <label className="field wide">
                  <span>Follow-up type</span>
                  <div className="type-selector">
                    {availableFollowUpTypes.map((t) => {
                      const Icon = getIcon(t.icon, t.code);
                      return (
                        <button
                          type="button"
                          key={t.code}
                          className={form.followUpTypeCode === t.code ? 'type-option selected' : 'type-option'}
                          onClick={() => changeType(t.code)}
                        >
                          <Icon size={16} />
                          <span>{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </label>
                {outcomes.length > 0 && (
                  <label className="field wide">
                    <span>Outcome</span>
                    <div className="outcome-grid">
                      {outcomes.map((o) => (
                        <button
                          type="button"
                          key={o.code}
                          className={form.outcomeCode === o.code ? 'outcome-option selected' : 'outcome-option'}
                          onClick={() => changeOutcome(o.code)}
                        >
                          {o.name}
                        </button>
                      ))}
                    </div>
                  </label>
                )}
                {showReasons && (
                  <label className="field wide">
                    <span>Reason {reasonRequired ? <em>*</em> : '(optional)'}</span>
                    <div className="select-wrap">
                      <select value={form.reasonCode} onChange={(e) => update('reasonCode', e.target.value)}>
                        <option value="">Select reason...</option>
                        {master.reasons.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} />
                    </div>
                  </label>
                )}
                {fuType?.requires_date && (
                  <label className="field">
                    <span>
                      Date <em>*</em>
                    </span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => update('date', e.target.value)}
                      required
                    />
                  </label>
                )}
                {fuType?.requires_time && (
                  <label className="field">
                    <span>
                      Time <em>*</em>
                    </span>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => update('time', e.target.value)}
                      required
                    />
                  </label>
                )}
                {fuType?.requires_project && (
                  <label className="field">
                    <span>
                      Project <em>*</em>
                    </span>
                    <input
                      value={form.project}
                      onChange={(e) => update('project', e.target.value)}
                      placeholder="e.g. Tamara Uprise"
                    />
                  </label>
                )}
                {fuType?.requires_location && (
                  <label className="field">
                    <span>
                      Site location <em>*</em>
                    </span>
                    <input
                      value={form.siteLocation}
                      onChange={(e) => update('siteLocation', e.target.value)}
                      placeholder="Site address"
                    />
                  </label>
                )}
                {fuType?.requires_participants && (
                  <label className="field wide">
                    <span>
                      Participants <em>*</em>
                    </span>
                    <input
                      value={form.participants}
                      onChange={(e) => update('participants', e.target.value)}
                      placeholder="Comma-separated names"
                    />
                  </label>
                )}
                {fuType?.requires_template && (
                  <label className="field wide">
                    <span>Message template</span>
                    <textarea
                      rows={3}
                      value={form.messageTemplate}
                      onChange={(e) => update('messageTemplate', e.target.value)}
                      placeholder="Message to send..."
                    />
                  </label>
                )}
                <label className="field">
                  <span>Priority</span>
                  <div className="select-wrap">
                    <select value={form.priorityCode} onChange={(e) => update('priorityCode', e.target.value)}>
                      {master.priorities.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </label>
                <label className="field">
                  <span>Assign to</span>
                  <input
                    type="text"
                    value={form.assignedTo || 'Unassigned'}
                    readOnly
                    disabled
                    style={{
                      backgroundColor: '#f8fafc',
                      cursor: 'not-allowed',
                      color: '#0f172a',
                      fontWeight: 600,
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </label>
                <label className="field">
                  <span>Due date</span>
                  <input type="date" value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
                </label>
                <label className="field">
                  <span>Due time</span>
                  <input type="time" value={form.dueTime} onChange={(e) => update('dueTime', e.target.value)} />
                </label>
                <label className="field">
                  <span>
                    Schedule date <em>*</em>
                  </span>
                  <input
                    type="date"
                    value={form.scheduleDateOverride || form.date}
                    onChange={(e) => update('scheduleDateOverride', e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  <span>
                    Schedule time <em>*</em>
                  </span>
                  <input
                    type="time"
                    value={form.scheduleTimeOverride || form.time}
                    onChange={(e) => update('scheduleTimeOverride', e.target.value)}
                    required
                  />
                </label>
                <label className="field wide">
                  <span>Employee note</span>
                  <textarea
                    rows={2}
                    value={form.customRemark}
                    onChange={(e) => update('customRemark', e.target.value)}
                    placeholder="Free-text note (optional)..."
                  />
                </label>
              </div>
            )}

            {/* Delete confirmation */}
            {mode === 'edit' && (
              <div className="delete-zone">
                {!confirmDelete ? (
                  <button type="button" className="delete-button" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={15} /> Delete this follow-up
                  </button>
                ) : (
                  <div className="confirm-delete">
                    <span>Are you sure? This cannot be undone.</span>
                    <button type="button" className="secondary-button" onClick={() => setConfirmDelete(false)}>
                      Cancel
                    </button>
                    <button type="button" className="danger-button" onClick={() => void handleDelete()}>
                      <Trash2 size={15} /> Yes, delete
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="form-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <span className="smart-note">
              {mode === 'complete' ? <Zap size={14} /> : mode === 'add' ? <Plus size={14} /> : <Check size={14} />}
              {mode === 'complete'
                ? 'Rules auto-fill the next step'
                : mode === 'add'
                ? 'Create a new task'
                : 'Save your changes'}
            </span>
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              <Check size={17} /> {isSaving ? 'Saving...' : submitLabelMap[mode]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FollowUpModal;
