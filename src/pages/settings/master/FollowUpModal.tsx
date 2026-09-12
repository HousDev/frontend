import { useEffect, useMemo, useState, useCallback, useRef, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  X,
  Zap,
  Building2,
  MapPin,
  Home,
  Layers,
  IndianRupee,
  CheckSquare,
  Square,
  Filter,
  MessageSquare,
  Compass,
  Bed,
  Coins,
  PhoneCall,
  Briefcase,
  User,
  FileText,
  Lock,
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
  getEntityActionsAllCount,
  getActionCategory,
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
import { followUpMasterAPI } from '@/lib/followUpMasterAPI';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { buyerAPI } from '@/lib/buyerAPI';
import { leadsAPI } from '@/lib/leadAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import './mastersAdmin.css';

type Mode = 'add' | 'complete' | 'edit';
type WizardStep = 1 | 2 | 3;

type Props = {
  open: boolean;
  master?: MasterData;
  currentFollowUp?: FollowUp | null;
  mode?: Mode;
  followUps?: FollowUp[];
  entityData?: any;
  initialDate?: string;
  initialEntityCode?: 'LEAD' | 'BUYER' | 'SELLER' | string;
  initialEntityId?: string | number;
  initialEntityName?: string;
  initialEntityPhone?: string;
  initialStageCode?: string;
  initialStatusCode?: string;
  initialAssignedTo?: string | number;
  initialAssignedName?: string;
  initialAttemptNo?: number;
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

function localDatePlus(days?: number | null) {
  const parsed = Number(days);
  const safeDays = isNaN(parsed) ? 0 : parsed;
  const d = new Date();
  d.setDate(d.getDate() + safeDays);
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

function getPropertyImageUrl(p: any): string | null {
  if (p.cover_image) return p.cover_image;
  if (p.thumbnail) return p.thumbnail;
  if (p.image) return p.image;
  if (Array.isArray(p.photos) && p.photos.length > 0) {
    const first = p.photos[0];
    return typeof first === 'string' ? first : first?.url || first?.path || null;
  }
  if (typeof p.photos === 'string' && p.photos.startsWith('[')) {
    try {
      const arr = JSON.parse(p.photos);
      if (arr.length > 0) return typeof arr[0] === 'string' ? arr[0] : arr[0]?.url || null;
    } catch { }
  }
  if (Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0];
    return typeof first === 'string' ? first : first?.url || first?.path || null;
  }
  return null;
}

function getPropertyName(p: any): string {
  if (!p) return '';
  const name = (
    p.society_name ||
    p.project_name ||
    p.project ||
    p.property_title ||
    p.title ||
    ''
  ).trim();
  if (name) return name;
  return p.id ? `Property #${p.id}` : '';
}

function getPropertyLocation(p: any): string {
  if (!p) return '';
  const loc = (p.location_name || p.locality || p.location || '').trim();
  const city = (p.city_name || p.city || '').trim();
  const addr = (p.address || p.site_location || '').trim();

  if (loc && city) {
    if (loc.toLowerCase().includes(city.toLowerCase())) return loc;
    return `${loc}, ${city}`;
  }
  if (loc) return loc;
  if (addr) return addr;
  if (city) return city;
  return 'Pune';
}

function formatPropertyPrice(price?: number | string | null): string {
  if (!price && price !== 0) return 'Price on Request';
  const num = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  if (isNaN(num) || num === 0) return typeof price === 'string' ? price : 'Price on Request';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function FollowUpModal({
  open,
  master: propMaster,
  currentFollowUp,
  mode = 'add',
  followUps: propFollowUps,
  entityData,
  initialDate,
  initialEntityCode,
  initialEntityId,
  initialEntityName,
  initialEntityPhone,
  initialStageCode,
  initialStatusCode,
  initialAssignedTo,
  initialAssignedName,
  initialAttemptNo,
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
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedStepTab, setSelectedStepTab] = useState<number | 'all' | null>(null);
  const [actionCategoryTab, setActionCategoryTab] = useState<'all' | 'next_step' | 'retry' | 'deal' | 'closure'>('all');
  const [actionSearch, setActionSearch] = useState('');
  const [activeSmartPreset, setActiveSmartPreset] = useState<string | null>(null);
  const [smartScheduleNotice, setSmartScheduleNotice] = useState<string | null>(null);

  // Entity Profile & Requirements State
  const [entityProfile, setEntityProfile] = useState<any>(entityData || null);
  const [showOnlyMatched, setShowOnlyMatched] = useState<boolean>(true);

  // Property Selection State
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<(string | number)[]>([]);
  const [propLocationFilter, setPropLocationFilter] = useState<string>('ALL');
  const [propSearchQuery, setPropSearchQuery] = useState<string>('');
  const [propBhkFilter, setPropBhkFilter] = useState<string>('ALL');

  const { user } = useAuth() as { user: any | null };
  const [crmUsers, setCrmUsers] = useState<{ id: string; name: string; role?: string }[]>([]);

  // Load Entity Profile and requirements
  useEffect(() => {
    if (!open) return;
    if (entityData) {
      setEntityProfile(entityData);
    }
    if (!initialEntityId) {
      if (!entityData) setEntityProfile(null);
      return;
    }
    const entCode = (initialEntityCode || 'LEAD').toUpperCase();
    let mounted = true;
    if (entCode === 'BUYER') {
      buyerAPI.getById(String(initialEntityId)).then((res: any) => {
        if (mounted && (res?.data || res)) {
          const fresh = res?.data || res;
          setEntityProfile((prev: any) => ({ ...(prev || {}), ...fresh, requirements: fresh.requirements ?? prev?.requirements }));
        }
      }).catch((err) => {
        console.warn('Failed to load buyer details for requirements in FollowUpModal:', err);
      });
    } else if (entCode === 'LEAD') {
      leadsAPI.getLead(String(initialEntityId)).then((res: any) => {
        if (mounted && (res?.data || res)) {
          const fresh = res?.data || res;
          setEntityProfile((prev: any) => ({ ...(prev || {}), ...fresh, requirements: fresh.requirements ?? prev?.requirements }));
        }
      }).catch((err) => {
        console.warn('Failed to load lead details for requirements in FollowUpModal:', err);
      });
    } else if (entCode === 'SELLER') {
      sellerAPI.getById(String(initialEntityId)).then((res: any) => {
        if (mounted && (res?.data || res)) {
          const fresh = res?.data || res;
          setEntityProfile((prev: any) => ({ ...(prev || {}), ...fresh, requirements: fresh.requirements ?? prev?.requirements }));
        }
      }).catch((err) => {
        console.warn('Failed to load seller details for requirements in FollowUpModal:', err);
      });
    }
    return () => { mounted = false; };
  }, [open, entityData, initialEntityId, initialEntityCode]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setPropertiesLoading(true);
    propertiesAPI.getProperties()
      .then((res: any) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
        setAllProperties(list);
      })
      .catch((err) => {
        console.warn('Failed to load properties in FollowUpModal:', err);
      })
      .finally(() => {
        if (mounted) setPropertiesLoading(false);
      });
    return () => { mounted = false; };
  }, [open]);

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

  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      initializedRef.current = null;
      return;
    }

    const initKey = `${mode}_${currentFollowUp?.id || 'new'}_${initialEntityId || initialEntityName || ''}`;
    if (initializedRef.current === initKey) {
      return; // Already initialized for this modal session; prevent resetting user progress
    }
    initializedRef.current = initKey;

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
    setActionCategoryTab('all');
    setActionSearch('');
    setActiveSmartPreset(null);
    setSmartScheduleNotice(null);
    setShowAllActions(false);
    setSelectedPropertyIds([]);
    setPropLocationFilter('ALL');
    setPropSearchQuery('');
    setPropBhkFilter('ALL');

    const targetEntityCode = (initialEntityCode || entityData?.entityCode || entityData?.entity_code || 'LEAD').toUpperCase();
    const targetEntityName =
      initialEntityName ||
      currentFollowUp?.entity_name ||
      (currentFollowUp?.entity_ref ? String(currentFollowUp.entity_ref).replace(/\s*\([^)]*\)\s*$/, '') : '') ||
      entityData?.name ||
      entityData?.client_name ||
      entityData?.full_name ||
      entityData?.customer_name ||
      entityData?.lead_name ||
      entityData?.buyer_name ||
      entityData?.seller_name ||
      '';
    const targetEntityPhone =
      initialEntityPhone ||
      currentFollowUp?.entity_phone ||
      (currentFollowUp?.entity_ref && String(currentFollowUp.entity_ref).match(/\(([^)]+)\)/)
        ? String(currentFollowUp.entity_ref).match(/\(([^)]+)\)/)![1]
        : '') ||
      entityData?.phone ||
      entityData?.contact ||
      entityData?.mobile ||
      entityData?.phone_number ||
      '';
    const targetEntityRef = targetEntityName
      ? (targetEntityPhone ? `${targetEntityName} (${targetEntityPhone})` : targetEntityName)
      : (targetEntityPhone || currentFollowUp?.entity_ref || '');

    const rawAssigned = initialAssignedTo || initialAssignedName || currentFollowUp?.assigned_to || '';
    const defaultAssigned = resolveExecutiveName(rawAssigned);

    if (mode === 'edit' && currentFollowUp) {
      setSuggestionApplied(true);
      setPriorityAutoApplied(true);
      const cu = currentFollowUp as any;
      const fType = cu.follow_up_type_code || cu.followupType || cu.type || cu.follow_up_type || 'CALL';
      const fStage = cu.stage_code || cu.stage || cu.buyerLeadStage || cu.sellerLeadStage || cu.leadStage || '';
      const fStatus = cu.status_code || cu.status || cu.buyerLeadStatus || cu.sellerLeadStatus || cu.leadStatus || '';
      const fPriority = cu.priority_code || cu.priority || 'MEDIUM';
      const fDate = cu.scheduled_date || cu.scheduledDate || cu.date || '';
      const fTime = cu.scheduled_time || cu.scheduledTime || cu.time || '11:00';
      const fRemark = cu.custom_remark || cu.customRemark || cu.remark || cu.notes || '';
      const fAction = cu.next_action_code || cu.nextAction || cu.next_action || '';
      const fOutcome = cu.outcome_code || cu.outcomeCode || cu.outcome || '';
      const fReason = cu.reason_code || cu.reasonCode || cu.reason || '';

      setForm({
        entityCode: cu.entity_code || cu.entityCode || targetEntityCode,
        entityName: targetEntityName,
        entityPhone: targetEntityPhone,
        entityRef: targetEntityRef,
        followUpTypeCode: fType,
        stageCode: fStage,
        statusCode: fStatus,
        outcomeCode: fOutcome,
        reasonCode: fReason,
        customRemark: fRemark,
        date: fDate,
        time: fTime,
        project: cu.project ?? '',
        siteLocation: cu.site_location ?? cu.siteLocation ?? '',
        participants: cu.participants ?? '',
        messageTemplate: cu.message_template ?? cu.messageTemplate ?? '',
        priorityCode: fPriority,
        nextActionOverride: fAction,
        scheduleDateOverride: fDate,
        scheduleTimeOverride: fTime,
        createNext: true,
        overrideStage: '',
        overrideStatus: '',
        overrideAction: '',
        overrideType: '',
        overridePriority: '',
        assignedTo: resolveExecutiveName(cu.assigned_to || cu.assignedTo) || defaultAssigned,
        dueDate: cu.due_date ?? cu.dueDate ?? '',
        dueTime: cu.due_time ?? cu.dueTime ?? '',
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
  }, [open, mode, currentFollowUp, initialDate, initialEntityCode, initialEntityName, initialEntityPhone, initialStageCode, initialStatusCode, initialAssignedTo, initialAssignedName, initialEntityId]);

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

  const availableStages = useMemo(() => {
    const list = master.stages
      .filter((s) => (!s.entity_code || s.entity_code === form.entityCode) && s.is_active)
      .sort((a, b) => a.display_order - b.display_order);

    if (form.stageCode && !list.some((s) => s.code.toUpperCase() === form.stageCode.toUpperCase())) {
      const formatted = form.stageCode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return [
        ...list,
        {
          id: `dyn_${form.stageCode}`,
          code: form.stageCode,
          name: formatted,
          entity_code: form.entityCode,
          is_active: true,
          display_order: 999,
          is_terminal: false,
        },
      ];
    }
    return list;
  }, [master.stages, form.entityCode, form.stageCode]);

  const availableStatuses = useMemo(() => {
    const list = master.statuses
      .filter((s) => (!s.entity_code || s.entity_code === form.entityCode) && s.is_active)
      .sort((a, b) => a.display_order - b.display_order);

    if (form.statusCode && !list.some((s) => s.code.toUpperCase() === form.statusCode.toUpperCase())) {
      const formatted = form.statusCode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return [
        ...list,
        {
          id: `dyn_${form.statusCode}`,
          code: form.statusCode,
          name: formatted,
          entity_code: form.entityCode,
          is_active: true,
          display_order: 999,
        },
      ];
    }
    return list;
  }, [master.statuses, form.entityCode, form.statusCode]);

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
    const lastTime = currentFollowUp?.scheduled_time || (currentFollowUp as any)?.scheduledTime || (currentFollowUp as any)?.time || form.time;
    return previewNextStep(matchedRule, master.sequences, currentFollowUp?.attempt_no ?? 1, lastTime);
  }, [matchedRule, master.sequences, currentFollowUp, form.time]);

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
    if (mode !== 'add' && mode !== 'edit') return null;
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
    if (mode !== 'add' && mode !== 'edit') return null;
    if (!form.entityCode || !form.followUpTypeCode) return null;
    return suggestStageStatus(
      master.rules,
      master.stages,
      master.statuses,
      form.entityCode,
      form.followUpTypeCode,
      form.nextActionOverride || undefined,
      master.sequences
    );
  }, [
    mode,
    master.rules,
    master.stages,
    master.statuses,
    master.sequences,
    form.entityCode,
    form.followUpTypeCode,
    form.nextActionOverride,
  ]);

  const currentAttemptNo = useMemo(() => {
    if (initialAttemptNo && initialAttemptNo > 0) return initialAttemptNo;
    if (currentFollowUp?.attempt_no && currentFollowUp.attempt_no > 0) return currentFollowUp.attempt_no;

    const refKey = (form.entityRef || initialEntityName || '').trim().toLowerCase();
    const phoneKey = (form.entityPhone || initialEntityPhone || '').trim().replace(/\D/g, '');
    const idKey = String(initialEntityId || '').trim();

    if (followUps && followUps.length > 0 && (refKey || phoneKey || idKey)) {
      const entityFollowups = followUps.filter((f) => {
        if (f.entity_code !== form.entityCode) return false;
        if (idKey && (String((f as any).entity_id) === idKey || String((f as any).entityId) === idKey)) return true;
        if (refKey && f.entity_ref && String(f.entity_ref).toLowerCase().includes(refKey)) return true;
        if (phoneKey && f.entity_ref && String(f.entity_ref).replace(/\D/g, '').includes(phoneKey)) return true;
        return false;
      });
      if (entityFollowups.length > 0) {
        if (mode === 'add') return entityFollowups.length + 1;
        return Math.max(1, entityFollowups.length);
      }
    }

    const st = (form.stageCode || initialStageCode || '').toUpperCase();
    if (!st || st === 'NEW' || st === 'INITIAL_CONTACT') return 1;
    if (st === 'CONNECTED' || st === 'REQUIREMENT_QUALIFIED' || st === 'PROPERTY_SHARED') return 2;
    if (st === 'SITE_VISIT_SCHEDULED' || st === 'SITE_VISIT_COMPLETED' || st === 'NEGOTIATION') return 3;
    if (st === 'BOOKING_DISCUSSION' || st === 'DOCUMENT_COLLECTION' || st === 'PAYMENT_PENDING') return 4;
    return 1;
  }, [initialAttemptNo, currentFollowUp, followUps, form.entityRef, form.entityPhone, form.entityCode, form.stageCode, initialEntityId, initialEntityName, initialEntityPhone, initialStageCode, mode]);

  const effectiveAttemptNo = selectedStepTab === 'all' ? currentAttemptNo : (selectedStepTab ?? currentAttemptNo);
  const isShowingAll = showAllActions || selectedStepTab === 'all';

  const entityActions = useMemo<NextAction[]>(() => {
    if (mode !== 'add' && mode !== 'edit') return [];
    const selectedSequence = currentFollowUp?.sequence_name || (() => {
      if (!form.nextActionOverride) return null;
      const matches = master.sequences.filter(
        (s) =>
          s.is_active &&
          s.step === effectiveAttemptNo &&
          s.action_code.toUpperCase() === form.nextActionOverride.toUpperCase(),
      );
      return new Set(matches.map((s) => s.sequence_name)).size === 1 ? matches[0]?.sequence_name ?? null : null;
    })();
    return getEntityActions(
      master.rules,
      master.nextActions,
      form.entityCode,
      form.followUpTypeCode,
      master.sequences,
      form.stageCode,
      form.statusCode,
      effectiveAttemptNo,
      isShowingAll,
      selectedSequence,
    );
  }, [
    mode,
    master.rules,
    master.nextActions,
    master.sequences,
    form.entityCode,
    form.followUpTypeCode,
    form.stageCode,
    form.statusCode,
    effectiveAttemptNo,
    isShowingAll,
    currentFollowUp?.sequence_name,
    form.nextActionOverride,
  ]);

  const activeSequenceName = useMemo(() => {
    if (currentFollowUp?.sequence_name) return currentFollowUp.sequence_name;
    if (!form.nextActionOverride) return null;
    const matches = master.sequences.filter(
      (s) =>
        s.is_active &&
        s.step === currentAttemptNo &&
        s.action_code.toUpperCase() === form.nextActionOverride.toUpperCase(),
    );
    return new Set(matches.map((s) => s.sequence_name)).size === 1 ? matches[0]?.sequence_name ?? null : null;
  }, [currentFollowUp?.sequence_name, form.nextActionOverride, currentAttemptNo, master.sequences]);

  const activeSequenceDetails = useMemo(() => {
    const seqName = activeSequenceName || currentFollowUp?.sequence_name;
    if (!seqName || !master.sequences) return null;
    const steps = master.sequences
      .filter((s) => s.is_active && s.sequence_name.toUpperCase() === seqName.toUpperCase())
      .sort((a, b) => a.step - b.step);
    if (steps.length === 0) return null;
    return {
      name: seqName.replace(/_/g, ' '),
      totalSteps: steps.length,
      steps,
    };
  }, [activeSequenceName, currentFollowUp?.sequence_name, master.sequences]);

  // Entity-specific total count of available actions (fully from master, no hardcoding)
  const entityActionsAllCount = useMemo(() => {
    if (mode !== 'add' && mode !== 'edit') return 0;
    return getEntityActionsAllCount(
      master.rules,
      master.nextActions,
      form.entityCode,
      master.sequences,
    );
  }, [mode, master.rules, master.nextActions, master.sequences, form.entityCode]);

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

    // Dynamically build quick start presets from active master followUpTypes
    (master.followUpTypes || [])
      .filter((t) => t.is_active)
      .slice(0, 5)
      .forEach((t) => {
        presets.push({
          label: t.name,
          icon: t.icon || 'Phone',
          entity: currentEntity,
          type: t.code,
          stage: firstStage,
          status: firstStatus,
          priority: 'HIGH',
        });
      });

    return presets;
  }, [form.entityCode, master.stages, master.statuses, master.followUpTypes]);

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

  // Auto-apply stage & status suggestion when user selects an action intent in "What should happen"
  useEffect(() => {
    if (mode !== 'add') return;
    if (!stageSuggestion) return;
    if (!suggestionApplied && form.nextActionOverride) {
      setForm((c) => ({
        ...c,
        stageCode: stageSuggestion.stageCode,
        statusCode: stageSuggestion.statusCode,
      }));
      setSuggestionApplied(true);
    }
  }, [stageSuggestion, form.nextActionOverride, suggestionApplied, mode]);

  // Load historical remark suggestions
  useEffect(() => {
    if (mode !== 'add' && mode !== 'edit') return;
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
    if ((mode !== 'add' && mode !== 'edit') || !form.entityRef.trim()) {
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
      form.nextActionOverride || undefined,
      master.sequences
    );
    setPrioritySuggestion(suggestion);
    if (suggestion && !priorityAutoApplied) {
      setForm((c) => ({ ...c, priorityCode: suggestion.priorityCode }));
      setPriorityAutoApplied(true);
    }
  }, [
    mode,
    master.rules,
    master.sequences,
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

  const displayedEntityActions = useMemo(() => {
    let filtered = entityActions;
    if (actionCategoryTab !== 'all') {
      filtered = filtered.filter((a) => (a as any).category === actionCategoryTab);
    }
    if (actionSearch.trim()) {
      const q = actionSearch.toLowerCase().trim();
      filtered = filtered.filter((a) => (a.name || '').toLowerCase().includes(q) || (a.code || '').toLowerCase().includes(q));
    }
    return filtered;
  }, [entityActions, actionCategoryTab, actionSearch]);

  // Extract entity requirements (preferred locations, bhk, budget, amenities)
  const entityRequirements = useMemo(() => {
    const p = entityProfile;
    if (!p) {
      return {
        hasRequirements: false,
        locations: [] as string[],
        bhks: [] as string[],
        amenities: [] as string[],
        minBudget: 0,
        maxBudget: 0,
      };
    }

    let reqObj: any = {};
    if (typeof p.requirements === 'string') {
      try {
        reqObj = JSON.parse(p.requirements);
      } catch (_) { }
    } else if (p.requirements && typeof p.requirements === 'object') {
      reqObj = p.requirements;
    }

    let rawReqObj: any = {};
    if (typeof p.raw?.requirements === 'string') {
      try {
        rawReqObj = JSON.parse(p.raw.requirements);
      } catch (_) { }
    } else if (p.raw?.requirements && typeof p.raw.requirements === 'object') {
      rawReqObj = p.raw.requirements;
    }

    const rawLocs = [
      ...(Array.isArray(reqObj.preferredLocations) ? reqObj.preferredLocations : []),
      ...(Array.isArray(reqObj.preferred_locations) ? reqObj.preferred_locations : []),
      ...(Array.isArray(reqObj.locations) ? reqObj.locations : []),
      ...(typeof reqObj.preferredLocations === 'string' ? reqObj.preferredLocations.split(',') : []),
      ...(typeof reqObj.preferred_locations === 'string' ? reqObj.preferred_locations.split(',') : []),
      ...(typeof reqObj.preferredLocation === 'string' ? reqObj.preferredLocation.split(',') : []),
      ...(typeof reqObj.preferred_location === 'string' ? reqObj.preferred_location.split(',') : []),
      ...(typeof reqObj.location === 'string' ? reqObj.location.split(',') : []),
      ...(typeof reqObj.locality === 'string' ? reqObj.locality.split(',') : []),

      ...(Array.isArray(rawReqObj.preferredLocations) ? rawReqObj.preferredLocations : []),
      ...(Array.isArray(rawReqObj.preferred_locations) ? rawReqObj.preferred_locations : []),
      ...(typeof rawReqObj.preferredLocations === 'string' ? rawReqObj.preferredLocations.split(',') : []),
      ...(typeof rawReqObj.preferred_locations === 'string' ? rawReqObj.preferred_locations.split(',') : []),
      ...(typeof rawReqObj.preferredLocation === 'string' ? rawReqObj.preferredLocation.split(',') : []),
      ...(typeof rawReqObj.preferred_location === 'string' ? rawReqObj.preferred_location.split(',') : []),

      ...(Array.isArray(p.preferred_locations) ? p.preferred_locations : []),
      ...(Array.isArray(p.preferredLocations) ? p.preferredLocations : []),
      ...(Array.isArray(p.locations) ? p.locations : []),
      ...(typeof p.preferred_locations === 'string' ? p.preferred_locations.split(',') : []),
      ...(typeof p.preferredLocations === 'string' ? p.preferredLocations.split(',') : []),
      ...(typeof p.preferred_location === 'string' ? p.preferred_location.split(',') : []),
      ...(typeof p.preferredLocation === 'string' ? p.preferredLocation.split(',') : []),
      ...(typeof p.location === 'string' ? p.location.split(',') : []),
      ...(typeof p.locality === 'string' ? p.locality.split(',') : []),
      ...(typeof p.site_location === 'string' ? p.site_location.split(',') : []),
    ];
    const locations = Array.from(
      new Set(
        rawLocs
          .map((l) => String(l).trim())
          .filter((l) => l && l !== '—' && l !== '-' && l.toLowerCase() !== 'select' && l.toLowerCase() !== 'any' && l.length > 1)
      )
    );

    const rawBhks = [
      ...(Array.isArray(reqObj.unitTypes) ? reqObj.unitTypes : []),
      ...(Array.isArray(reqObj.unit_types) ? reqObj.unit_types : []),
      ...(Array.isArray(reqObj.bhk) ? reqObj.bhk : []),
      ...(typeof reqObj.unitTypes === 'string' ? reqObj.unitTypes.split(',') : []),
      ...(typeof reqObj.unit_types === 'string' ? reqObj.unit_types.split(',') : []),
      ...(typeof reqObj.unitType === 'string' ? reqObj.unitType.split(',') : []),
      ...(typeof reqObj.bhk === 'string' ? reqObj.bhk.split(',') : []),

      ...(Array.isArray(rawReqObj.unitTypes) ? rawReqObj.unitTypes : []),
      ...(Array.isArray(rawReqObj.bhk) ? rawReqObj.bhk : []),

      ...(Array.isArray(p.bhk) ? p.bhk : []),
      ...(Array.isArray(p.preferred_bhk) ? p.preferred_bhk : []),
      ...(Array.isArray(p.bhk_type) ? p.bhk_type : []),
      ...(Array.isArray(p.bhk_types) ? p.bhk_types : []),
      ...(Array.isArray(p.unitTypes) ? p.unitTypes : []),
      ...(typeof p.bhk === 'string' ? p.bhk.split(',') : []),
      ...(typeof p.preferred_bhk === 'string' ? p.preferred_bhk.split(',') : []),
      ...(typeof p.bhk_type === 'string' ? p.bhk_type.split(',') : []),
      ...(typeof p.bhk_types === 'string' ? p.bhk_types.split(',') : []),
      ...(typeof p.unitType === 'string' ? p.unitType.split(',') : []),
      ...(typeof p.bedrooms === 'string' || typeof p.bedrooms === 'number' ? [String(p.bedrooms)] : []),
    ];
    const bhks = Array.from(
      new Set(
        rawBhks
          .map((b) => String(b).trim())
          .filter((b) => b && b !== '—' && b !== '-' && b.toLowerCase() !== 'select' && b.toLowerCase() !== 'any')
      )
    );

    const rawAmns = [
      ...(Array.isArray(reqObj.amenities) ? reqObj.amenities : []),
      ...(typeof reqObj.amenities === 'string' ? reqObj.amenities.split(',') : []),
      ...(Array.isArray(rawReqObj.amenities) ? rawReqObj.amenities : []),
      ...(typeof rawReqObj.amenities === 'string' ? rawReqObj.amenities.split(',') : []),
      ...(Array.isArray(p.amenities) ? p.amenities : []),
      ...(Array.isArray(p.preferred_amenities) ? p.preferred_amenities : []),
      ...(typeof p.amenities === 'string' ? p.amenities.split(',') : []),
      ...(typeof p.preferred_amenities === 'string' ? p.preferred_amenities.split(',') : []),
    ];
    const amenities = Array.from(
      new Set(
        rawAmns
          .map((a) => String(a).trim().toLowerCase())
          .filter((a) => a && a !== '—' && a !== '-' && a.toLowerCase() !== 'select' && a.toLowerCase() !== 'any')
      )
    );

    const parsePrice = (v: any) => {
      if (!v) return 0;
      const num = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.]/g, '')) : Number(v);
      return isNaN(num) ? 0 : num;
    };

    const minBudget = parsePrice(
      reqObj.minBudget || reqObj.budget_min || reqObj.min_budget || p.budget?.min || p.min_budget || p.budget_min || p.minBudget || p.expected_min_price
    );
    const maxBudget = parsePrice(
      reqObj.maxBudget || reqObj.budget_max || reqObj.max_budget || p.budget?.max || p.max_budget || p.budget_max || p.maxBudget || p.budget || p.price || p.expected_price
    );

    const hasRequirements = locations.length > 0 || bhks.length > 0 || amenities.length > 0 || minBudget > 0 || maxBudget > 0;

    return {
      hasRequirements,
      locations,
      bhks,
      amenities,
      minBudget,
      maxBudget,
    };
  }, [entityProfile]);

  // Compute matching score and reasons for each property
  const propertyMatchDetails = useMemo(() => {
    const req = entityRequirements;
    const map = new Map<string | number, {
      isMatched: boolean;
      score: number;
      matchedReasons: string[];
    }>();

    allProperties.forEach((p) => {
      if (!req.hasRequirements) {
        map.set(p.id, { isMatched: true, score: 0, matchedReasons: [] });
        return;
      }

      let score = 0;
      const matchedReasons: string[] = [];

      const pLoc = `${p.locality || ''} ${p.location || ''} ${p.city || ''} ${p.site_location || ''} ${p.address || ''}`.toLowerCase();
      const pTitle = `${p.property_title || ''} ${p.title || ''} ${p.project_name || ''} ${p.project || ''}`.toLowerCase();
      const pBhk = `${p.bedrooms || ''} ${p.unit_type || ''} ${p.property_type || ''}`.toLowerCase();
      const pAmns = `${p.amenities || ''} ${p.amenity_names || ''}`.toLowerCase();
      const pPrice = typeof p.expected_price === 'number' ? p.expected_price : typeof p.price === 'number' ? p.price : typeof p.budget === 'number' ? p.budget : parseFloat(String(p.expected_price || p.price || p.budget || '0').replace(/[^0-9.]/g, '')) || 0;

      // Location Match
      let hasLocMatch = false;
      if (req.locations.length > 0) {
        const matchedLoc = req.locations.find((l) => {
          const cleanL = l.toLowerCase().trim();
          if (!cleanL) return false;
          return pLoc.includes(cleanL) || pTitle.includes(cleanL) || (p.locality && cleanL.includes(p.locality.toLowerCase().trim()));
        });
        if (matchedLoc) {
          hasLocMatch = true;
          score += 50;
          matchedReasons.push(`📍 ${matchedLoc}`);
        }
      } else {
        hasLocMatch = true;
      }

      // BHK Match
      if (req.bhks.length > 0) {
        const matchedBhk = req.bhks.find((b) => {
          const normB = b.toLowerCase().replace(/[^0-9]/g, '');
          return (normB && (pBhk.includes(normB) || pTitle.includes(`${normB}bhk`) || pTitle.includes(`${normB} bhk`))) || pBhk.includes(b.toLowerCase());
        });
        if (matchedBhk) {
          score += 30;
          matchedReasons.push(`🛏️ ${matchedBhk}`);
        }
      }

      // Budget Match
      if (pPrice > 0 && (req.minBudget > 0 || req.maxBudget > 0)) {
        const minB = req.minBudget || 0;
        const maxB = req.maxBudget || Infinity;
        if (pPrice >= minB * 0.85 && pPrice <= maxB * 1.15) {
          score += 20;
          matchedReasons.push('💰 Budget Match');
        }
      }

      // Amenities Match
      if (req.amenities.length > 0) {
        const hitAmns = req.amenities.filter((a) => pAmns.includes(a) || pTitle.includes(a));
        if (hitAmns.length > 0) {
          score += 15;
          matchedReasons.push(`🏗️ ${hitAmns.slice(0, 2).join(', ')}`);
        }
      }

      const isMatched = (req.locations.length > 0 ? hasLocMatch : true) && score > 0;
      map.set(p.id, { isMatched, score, matchedReasons });
    });

    return map;
  }, [allProperties, entityRequirements]);

  const totalMatchedCount = useMemo(() => {
    return allProperties.filter((p) => propertyMatchDetails.get(p.id)?.isMatched).length;
  }, [allProperties, propertyMatchDetails]);

  const availablePropertyLocations = useMemo(() => {
    const locs = new Set<string>();
    allProperties.forEach((p) => {
      const loc = (p.locality || p.location || p.city || p.site_location || '').trim();
      if (loc) {
        const primary = loc.split(',')[0].trim();
        if (primary && primary.length > 1) locs.add(primary);
      }
    });
    return Array.from(locs).sort();
  }, [allProperties]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      const matchInfo = propertyMatchDetails.get(p.id);

      // If requirements exist and user selected "Matched Only"
      if (entityRequirements.hasRequirements && showOnlyMatched) {
        if (!matchInfo?.isMatched) return false;
      }

      const pLoc = `${p.locality || ''} ${p.location || ''} ${p.city || ''} ${p.address || ''} ${p.site_location || ''}`.toLowerCase();
      const pTitle = `${p.property_title || ''} ${p.title || ''} ${p.project_name || ''} ${p.project || ''}`.toLowerCase();
      const pBhk = `${p.bedrooms || ''} ${p.unit_type || ''} ${p.property_type || ''}`.toLowerCase();

      if (propLocationFilter !== 'ALL') {
        if (!pLoc.includes(propLocationFilter.toLowerCase())) return false;
      }

      if (propSearchQuery.trim()) {
        const q = propSearchQuery.toLowerCase().trim();
        const match = pTitle.includes(q) || pLoc.includes(q) || pBhk.includes(q) || String(p.id).includes(q);
        if (!match) return false;
      }

      if (propBhkFilter !== 'ALL') {
        if (propBhkFilter === '1 BHK' && !pBhk.includes('1') && !pTitle.includes('1 bhk') && !pTitle.includes('1bhk')) return false;
        if (propBhkFilter === '2 BHK' && !pBhk.includes('2') && !pTitle.includes('2 bhk') && !pTitle.includes('2bhk')) return false;
        if (propBhkFilter === '3 BHK' && !pBhk.includes('3') && !pTitle.includes('3 bhk') && !pTitle.includes('3bhk')) return false;
        if (propBhkFilter === '4+ BHK' && !pBhk.includes('4') && !pBhk.includes('5') && !pTitle.includes('4 bhk') && !pTitle.includes('5 bhk')) return false;
      }

      return true;
    }).sort((a, b) => {
      const scoreA = propertyMatchDetails.get(a.id)?.score || 0;
      const scoreB = propertyMatchDetails.get(b.id)?.score || 0;
      return scoreB - scoreA;
    });
  }, [allProperties, propertyMatchDetails, entityRequirements.hasRequirements, showOnlyMatched, propLocationFilter, propSearchQuery, propBhkFilter]);

  const togglePropertySelection = useCallback((property: any) => {
    const propId = property.id;
    setSelectedPropertyIds((prev) => {
      const isSelected = prev.includes(propId);
      const next = isSelected ? prev.filter((id) => id !== propId) : [...prev, propId];

      const selectedObjects = allProperties.filter((p) => next.includes(p.id));
      if (selectedObjects.length > 0) {
        const uniqueNames = Array.from(
          new Set(selectedObjects.map((p) => getPropertyName(p)).filter(Boolean))
        );
        const uniqueLocs = Array.from(
          new Set(selectedObjects.map((p) => getPropertyLocation(p)).filter(Boolean))
        );

        setForm((f) => ({
          ...f,
          project: uniqueNames.join(', '),
          siteLocation: uniqueLocs.join(', '),
        }));
      } else {
        setForm((f) => ({
          ...f,
          project: '',
          siteLocation: '',
        }));
      }
      return next;
    });
  }, [allProperties]);

  function getSmartScheduleForAction(actionCode: string) {
    const act = (actionCode || '').toUpperCase().trim();

    // 1. Dynamic Auto-Resolution from Master Sequences (100% DB / Sequence Driven)
    if (master.sequences && master.sequences.length > 0) {
      const match = master.sequences.find(
        (s) => s.is_active && s.action_code && s.action_code.toUpperCase() === act && s.step === currentAttemptNo
      ) || master.sequences.find(
        (s) => s.is_active && s.action_code && s.action_code.toUpperCase() === act
      );

      if (match) {
        const rawChannel = (match.channel || match.follow_up_type_code || '').toUpperCase();
        let targetType = 'CALL';
        if (rawChannel.includes('WHATSAPP') || rawChannel.includes('WA')) targetType = 'WHATSAPP';
        else if (rawChannel.includes('EMAIL') || rawChannel.includes('MAIL')) targetType = 'EMAIL';
        else if (rawChannel.includes('VISIT') || rawChannel.includes('SITE')) targetType = 'SITE_VISIT';
        else if (rawChannel.includes('MEETING') || rawChannel.includes('MEET')) targetType = 'MEETING';

        const delay = match.delay_days ?? match.after_days ?? 1;
        const priority = match.priority_code || 'HIGH';
        const formattedSeqName = match.sequence_name.replace(/_/g, ' ');

        return {
          dateOffsetDays: delay,
          targetTime: '11:00',
          suggestedType: targetType,
          suggestedPriority: priority,
          suggestedRemark: `Sequence Flow: ${formattedSeqName} - Step ${match.step}: ${match.action_code.replace(/_/g, ' ')}`,
          notice: `Sequence "${formattedSeqName}" Step #${match.step}: Auto-set ${targetType} with ${delay}d delay & ${priority} priority`,
        };
      }
    }

    return { dateOffsetDays: 1, targetTime: '11:00' };
  }

  function handleActionIntentClick(actionCode: string) {
    const newAction = form.nextActionOverride === actionCode ? '' : actionCode;
    const suggestion = suggestStageStatus(
      master.rules,
      master.stages,
      master.statuses,
      form.entityCode,
      form.followUpTypeCode,
      newAction || undefined
    );
    const smart = newAction ? getSmartScheduleForAction(newAction) : null;

    setForm((prev) => {
      const nextDate = smart?.dateOffsetDays !== undefined ? localDatePlus(smart.dateOffsetDays) : prev.date;
      const nextTime = smart?.targetTime || prev.time;
      const nextRemark = (!prev.customRemark.trim() && smart?.suggestedRemark) ? smart.suggestedRemark : prev.customRemark;
      const nextType = (smart?.suggestedType && availableFollowUpTypes.some((t) => t.code === smart.suggestedType)) ? smart.suggestedType : prev.followUpTypeCode;
      const nextPriority = smart?.suggestedPriority || prev.priorityCode;

      return {
        ...prev,
        nextActionOverride: newAction,
        date: nextDate,
        time: nextTime,
        scheduleDateOverride: nextDate,
        scheduleTimeOverride: nextTime,
        customRemark: nextRemark,
        followUpTypeCode: nextType,
        priorityCode: nextPriority,
        ...(suggestion ? { stageCode: suggestion.stageCode, statusCode: suggestion.statusCode } : {}),
      };
    });

    if (smart?.notice) {
      setSmartScheduleNotice(`⚡ ${smart.notice}`);
    } else {
      setSmartScheduleNotice(null);
    }
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
    const targetDate = localDatePlus(days);
    setForm((c) => ({ ...c, scheduleDateOverride: targetDate, date: targetDate }));
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

  async function dispatchScheduledEventJobs(params: {
    isMeeting: boolean;
    schedDate: string;
    schedTime: string;
    custName: string;
    targetEntityId: string;
    entityCode: string;
    entityRef: string | null;
    entityPhone: string | null;
    project: string | null;
    siteLocation: string | null;
    assignedTo: string | null;
    customRemark?: string | null;
  }) {
    const {
      isMeeting,
      schedDate,
      schedTime,
      custName,
      targetEntityId,
      entityCode,
      entityRef,
      entityPhone,
      project,
      siteLocation,
      assignedTo,
      customRemark,
    } = params;

    const eventLabel = isMeeting ? 'Meeting' : 'Site Visit';
    const reminderISO = (() => {
      try {
        if (!schedDate) return new Date().toISOString();
        const timePart = schedTime || '11:00';
        const [hours, minutes] = timePart.split(':').map((n) => parseInt(n, 10) || 0);

        let year = new Date().getFullYear();
        let month = new Date().getMonth();
        let day = new Date().getDate();

        const cleanDate = schedDate.includes('T') ? schedDate.split('T')[0] : schedDate;
        if (cleanDate.includes('-')) {
          const parts = cleanDate.split('-');
          if (parts[0].length === 4) {
            // YYYY-MM-DD
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            day = parseInt(parts[2], 10);
          } else if (parts[2].length === 4) {
            // DD-MM-YYYY
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            year = parseInt(parts[2], 10);
          }
        } else if (cleanDate.includes('/')) {
          const parts = cleanDate.split('/');
          if (parts[0].length === 4) {
            // YYYY/MM/DD
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            day = parseInt(parts[2], 10);
          } else if (parts[2].length === 4) {
            // DD/MM/YYYY
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10) - 1;
            year = parseInt(parts[2], 10);
          }
        }

        const target = new Date(year, month, day, hours, minutes, 0, 0);
        if (isNaN(target.getTime())) return new Date().toISOString();
        const rem = new Date(target.getTime() - 2 * 3600 * 1000);
        return rem.toISOString();
      } catch {
        return new Date().toISOString();
      }
    })();

    // 1. Customer Immediate Confirmation
    await followUpMasterAPI.upsertItem('fu_automation_jobs', {
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      channel: 'EMAIL',
      recipient_phone: entityPhone || null,
      recipient_email: null,
      template_id: isMeeting ? '8' : '7',
      payload: {
        type: isMeeting ? 'MEETING' : 'SITE_VISIT',
        subject: project ? `${eventLabel} Scheduled - ${project}` : `${eventLabel} Scheduled Confirmation`,
        body: customRemark || `Hello ${custName},\n\nYour ${eventLabel.toLowerCase()} has been scheduled on ${schedDate} at ${schedTime}${project ? ` for ${project}` : ''}.\n\nLocation: ${siteLocation || (isMeeting ? 'Office / Virtual' : 'Project Site')}\n\nThank you,\nResale Expert Team`,
        entity_ref: entityRef,
        project: project,
        date: schedDate,
        time: schedTime,
        site_location: siteLocation,
        assigned_to: assignedTo,
      },
      status: 'PENDING',
      scheduled_for: new Date().toISOString(),
      entity_code: entityCode,
      entity_id: targetEntityId,
      rule_id: isMeeting ? 'MEETING_CUSTOMER_CONFIRMATION' : 'SITE_VISIT_CUSTOMER_CONFIRMATION',
    });

    // 2. Executive Immediate Alert
    await followUpMasterAPI.upsertItem('fu_automation_jobs', {
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      channel: 'EMAIL',
      recipient_phone: null,
      recipient_email: null,
      template_id: isMeeting ? 'EXECUTIVE_MEETING_ALERT' : 'EXECUTIVE_SITE_VISIT_ALERT',
      payload: {
        type: isMeeting ? 'MEETING' : 'SITE_VISIT',
        is_executive: true,
        assigned_to: assignedTo || null,
        customer_name: custName,
        entity_ref: entityRef,
        phone: entityPhone,
        project: project,
        date: schedDate,
        time: schedTime,
        site_location: siteLocation,
      },
      status: 'PENDING',
      scheduled_for: new Date().toISOString(),
      entity_code: entityCode,
      entity_id: targetEntityId,
      rule_id: isMeeting ? 'MEETING_EXECUTIVE_ALERT' : 'SITE_VISIT_EXECUTIVE_ALERT',
    });

    // 3. Customer 2-Hour Reminder
    await followUpMasterAPI.upsertItem('fu_automation_jobs', {
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      channel: 'EMAIL',
      recipient_phone: entityPhone || null,
      recipient_email: null,
      template_id: isMeeting ? 'CUSTOMER_MEETING_REMINDER' : 'CUSTOMER_SITE_VISIT_REMINDER',
      payload: {
        type: isMeeting ? 'MEETING' : 'SITE_VISIT',
        is_reminder: true,
        customer_name: custName,
        entity_ref: entityRef,
        project: project,
        date: schedDate,
        time: schedTime,
        site_location: siteLocation,
        assigned_to: assignedTo,
      },
      status: 'PENDING',
      scheduled_for: reminderISO,
      entity_code: entityCode,
      entity_id: targetEntityId,
      rule_id: isMeeting ? 'MEETING_CUSTOMER_REMINDER' : 'SITE_VISIT_CUSTOMER_REMINDER',
    });

    // 4. Executive 2-Hour Reminder
    await followUpMasterAPI.upsertItem('fu_automation_jobs', {
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      channel: 'EMAIL',
      recipient_phone: null,
      recipient_email: null,
      template_id: isMeeting ? 'EXECUTIVE_MEETING_ALERT' : 'EXECUTIVE_SITE_VISIT_ALERT',
      payload: {
        type: isMeeting ? 'MEETING' : 'SITE_VISIT',
        is_executive: true,
        is_reminder: true,
        assigned_to: assignedTo || null,
        customer_name: custName,
        entity_ref: entityRef,
        phone: entityPhone,
        project: project,
        date: schedDate,
        time: schedTime,
        site_location: siteLocation,
      },
      status: 'PENDING',
      scheduled_for: reminderISO,
      entity_code: entityCode,
      entity_id: targetEntityId,
      rule_id: isMeeting ? 'MEETING_EXECUTIVE_REMINDER' : 'SITE_VISIT_EXECUTIVE_REMINDER',
    });
  }

  async function handleSubmit(e?: FormEvent | React.MouseEvent) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (isSaving) return;

    // Prevent submission if user is not on Step 3 (Review)
    if ((mode === 'add' || mode === 'edit') && addWizardStep !== 3) {
      if (addWizardStep === 1) {
        if (!form.stageCode || !form.statusCode) {
          setError('Please select a stage and status.');
          return;
        }
        setAddWizardStep(2);
      } else if (addWizardStep === 2) {
        setAddWizardStep(3);
      }
      return;
    }

    if (mode === 'complete' && wizardStep !== 3) {
      if (wizardStep === 1) {
        if (fuType?.requires_outcome && !form.outcomeCode) {
          setError('Please select an outcome.');
          return;
        }
        setWizardStep(showReasons ? 2 : 3);
      } else if (wizardStep === 2) {
        if (reasonRequired && !form.reasonCode) {
          setError('Please select a reason.');
          return;
        }
        setWizardStep(3);
      }
      return;
    }

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

        const typeCode = (form.followUpTypeCode || '').toUpperCase();
        const nextAction = (form.nextActionOverride || '').toUpperCase();
        const isSiteVisit = typeCode === 'SITE_VISIT' || nextAction === 'SITE_VISIT';
        const isMeeting = typeCode === 'MEETING' || nextAction === 'MEETING';

        if (isSiteVisit || isMeeting) {
          const schedDate = form.scheduleDateOverride || form.date;
          const schedTime = form.scheduleTimeOverride || form.time;
          const custName = form.entityName || (currentFollowUp.entity_ref ? currentFollowUp.entity_ref.replace(/\s*\([^)]*\)\s*$/, '') : 'Customer');
          await dispatchScheduledEventJobs({
            isMeeting,
            schedDate,
            schedTime,
            custName,
            targetEntityId: currentFollowUp.id,
            entityCode: form.entityCode,
            entityRef: form.entityRef || currentFollowUp.entity_ref,
            entityPhone: form.entityPhone,
            project: form.project,
            siteLocation: form.siteLocation,
            assignedTo: form.assignedTo || currentFollowUp.assigned_to,
            customRemark: form.customRemark,
          });
        }

        toast.success('Follow-up updated successfully! ✅');
        onSaved?.(updated as any);
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
          sequence_name: activeSequenceName,
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

        // Dispatch automation job if followUpType or nextAction is SITE_VISIT or MEETING
        const typeCode = (form.followUpTypeCode || '').toUpperCase();
        const nextAction = (form.nextActionOverride || '').toUpperCase();
        const isSiteVisit = typeCode === 'SITE_VISIT' || nextAction === 'SITE_VISIT';
        const isMeeting = typeCode === 'MEETING' || nextAction === 'MEETING';

        if (isSiteVisit || isMeeting) {
          const schedDate = form.scheduleDateOverride || form.date;
          const schedTime = form.scheduleTimeOverride || form.time;
          const custName = form.entityName || 'Customer';
          const targetEntityId = initialEntityId ? String(initialEntityId) : created.id;

          await dispatchScheduledEventJobs({
            isMeeting,
            schedDate,
            schedTime,
            custName,
            targetEntityId,
            entityCode: form.entityCode,
            entityRef: form.entityRef,
            entityPhone: form.entityPhone,
            project: form.project,
            siteLocation: form.siteLocation,
            assignedTo: form.assignedTo,
            customRemark: form.customRemark,
          });
        }

        toast.success('Follow-up created successfully! ✅');
        onSaved?.(created);
        return;
      }

      // mode === 'complete'
      if (!currentFollowUp) throw new Error('The follow-up to complete is unavailable.');

      const isTerminalStep = Boolean(matchedRule?.terminal || nextStep?.isSequenceTerminal || (currentFollowUp.attempt_no >= 3 && matchedRule?.sequence_name === 'NOT_CONNECTED'));
      const finalStage = form.overrideStage || (isTerminalStep && nextStep?.nextStageCode ? nextStep.nextStageCode : form.stageCode);
      const finalStatus = form.overrideStatus || (isTerminalStep && nextStep?.nextStatusCode ? nextStep.nextStatusCode : form.statusCode);

      // Update follow-up as completed via MySQL engine
      const updatedComplete = await updateFollowUp(currentFollowUp.id, {
        is_complete: true,
        completed_at: new Date().toISOString(),
        outcome_code: form.outcomeCode || null,
        reason_code: form.reasonCode || null,
        stage_code: finalStage,
        status_code: finalStatus,
        terminal: isTerminalStep,
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
        const lastTime = currentFollowUp.scheduled_time || (currentFollowUp as any).scheduledTime || (currentFollowUp as any).time || form.time;
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
            lastTime,
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
      const hasAutomation = matchedRule && (
        matchedRule.auto_email ||
        matchedRule.auto_whatsapp ||
        matchedRule.auto_message ||
        Boolean((matchedRule as any).auto_send_channel)
      );
      if (matchedRule && hasAutomation) {
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
      } else {
        const nextAction = (form.overrideAction || form.nextActionOverride || '').toUpperCase();
        const isSiteVisit = nextAction === 'SITE_VISIT';
        const isMeeting = nextAction === 'MEETING';

        if (isSiteVisit || isMeeting) {
          const schedDate = form.scheduleDateOverride || form.date;
          const schedTime = form.scheduleTimeOverride || form.time;
          const custName = form.entityName || (currentFollowUp.entity_ref ? currentFollowUp.entity_ref.replace(/\s*\([^)]*\)\s*$/, '') : 'Customer');
          const targetEntityId = newFollowUp?.id ?? currentFollowUp.id;

          await dispatchScheduledEventJobs({
            isMeeting,
            schedDate,
            schedTime,
            custName,
            targetEntityId,
            entityCode: form.entityCode,
            entityRef: currentFollowUp.entity_ref,
            entityPhone: form.entityPhone,
            project: form.project,
            siteLocation: form.siteLocation,
            assignedTo: form.assignedTo || currentFollowUp.assigned_to,
            customRemark: form.customRemark,
          });
        }
      }

      toast.success('Follow-up marked as completed! ✅');
      onSaved?.(newFollowUp);
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Could not save. Please try again.';
      toast.error(msg);
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!currentFollowUp) return;
    const ok = await deleteFollowUp(currentFollowUp.id);
    if (ok) {
      toast.success('Follow-up deleted successfully! 🗑️');
      onDeleted?.(currentFollowUp.id);
    } else {
      toast.error('Could not delete follow-up. Please try again.');
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
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .modal-backdrop {
            padding: 0 !important;
            align-items: stretch !important;
          }
          .modal.modal-wide {
            max-width: 100vw !important;
            width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .modal-header {
            padding: 12px 14px !important;
            display: grid !important;
            grid-template-columns: 1fr auto !important;
            gap: 10px 8px !important;
          }
          .modal-header-left {
            grid-column: 1 / 2 !important;
            min-width: 0 !important;
          }
          .modal-header-right {
            display: contents !important;
          }
          .close-button {
            grid-column: 2 / 3 !important;
            grid-row: 1 / 2 !important;
            justify-self: end !important;
          }
          .header-wizard-steps {
            grid-column: 1 / 3 !important;
            grid-row: 2 / 3 !important;
            width: 100% !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            padding: 4px 8px !important;
            margin: 0 !important;
          }
          .header-wizard-steps button {
            padding: 4px 8px !important;
            gap: 5px !important;
            flex: 1 !important;
            justify-content: center !important;
          }
          .header-wizard-steps span:last-child {
            font-size: 11px !important;
          }
          .modal-body {
            padding: 12px 14px !important;
            max-height: none !important;
            flex: 1 !important;
            overflow-y: auto !important;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .stage-status-row {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .smart-suggestion-panel {
            min-height: auto !important;
            padding: 10px 12px !important;
          }
          .action-intent-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .step2-2col-layout {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .properties-selector-panel {
            padding: 12px !important;
          }
          .properties-cards-scroll {
            max-height: 280px !important;
            grid-template-columns: 1fr !important;
          }
          .followup-details-panel {
            gap: 10px !important;
          }
          .followup-details-panel .form-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .review-dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            width: 100% !important;
          }
          .review-dashboard-grid > div {
            width: 100% !important;
            min-width: 0 !important;
          }
          .review-step-redesigned {
            width: 100% !important;
            gap: 12px !important;
          }
          .modal-footer {
            padding: 12px 14px !important;
            flex-direction: column-reverse !important;
            gap: 10px !important;
          }
          .modal-footer .smart-note {
            font-size: 11px !important;
            justify-content: center !important;
          }
          .modal-footer > div:last-child {
            width: 100% !important;
            display: flex !important;
            gap: 8px !important;
          }
          .modal-footer button {
            flex: 1 !important;
            justify-content: center !important;
            padding: 10px 14px !important;
          }
        }
        @media (max-width: 480px) {
          .action-intent-grid {
            grid-template-columns: 1fr !important;
          }
          .header-wizard-steps span:last-child {
            display: none !important;
          }
          .header-wizard-steps button {
            padding: 4px 6px !important;
          }
        }
      `}</style>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        style={{
          borderRadius: '20px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          background: '#ffffff',
          maxWidth: '1160px',
          width: '95vw',
        }}
      >
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxSizing: 'border-box',
          }}
        >
          {/* Left: Icon + Title + Subtitle */}
          <div className="modal-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              className="modal-title-icon"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                borderRadius: '12px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                flexShrink: 0,
              }}
            >
              <Target size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ color: '#ffffff', fontSize: '16.5px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {titleMap[mode]}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '2px 0 0 0', whiteSpace: 'nowrap' }}>
                {subtitleMap[mode]}
              </p>
            </div>
          </div>

          {/* Right Section: Stepper (1, 2, 3) + Close Button */}
          <div className="modal-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            {(mode === 'add' || mode === 'edit') && (
              <div
                className="header-wizard-steps"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Step 1 */}
                <button
                  type="button"
                  onClick={() => setAddWizardStep(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px 4px 6px',
                    borderRadius: '9999px',
                    background: addWizardStep === 1 ? 'rgba(59, 130, 246, 0.22)' : addWizardStep > 1 ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                    border: addWizardStep === 1 ? '1px solid #60a5fa' : addWizardStep > 1 ? '1px solid #4ade80' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: addWizardStep === 1 ? '#3b82f6' : addWizardStep > 1 ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {addWizardStep > 1 ? <Check size={12} /> : 1}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: addWizardStep === 1 ? '#93c5fd' : addWizardStep > 1 ? '#86efac' : '#94a3b8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Who & What
                  </span>
                </button>

                <div style={{ width: '16px', height: '1.5px', background: addWizardStep > 1 ? '#22c55e' : 'rgba(255, 255, 255, 0.15)' }} />

                {/* Step 2 */}
                <button
                  type="button"
                  onClick={() => {
                    if (form.stageCode && form.statusCode) setAddWizardStep(2);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px 4px 6px',
                    borderRadius: '9999px',
                    background: addWizardStep === 2 ? 'rgba(59, 130, 246, 0.22)' : addWizardStep > 2 ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                    border: addWizardStep === 2 ? '1px solid #60a5fa' : addWizardStep > 2 ? '1px solid #4ade80' : '1px solid transparent',
                    cursor: form.stageCode && form.statusCode ? 'pointer' : 'not-allowed',
                    opacity: form.stageCode && form.statusCode ? 1 : 0.45,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: addWizardStep === 2 ? '#3b82f6' : addWizardStep > 2 ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {addWizardStep > 2 ? <Check size={12} /> : 2}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: addWizardStep === 2 ? '#93c5fd' : addWizardStep > 2 ? '#86efac' : '#94a3b8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Details
                  </span>
                </button>

                <div style={{ width: '16px', height: '1.5px', background: addWizardStep > 2 ? '#22c55e' : 'rgba(255, 255, 255, 0.15)' }} />

                {/* Step 3 */}
                <button
                  type="button"
                  onClick={() => {
                    if (form.stageCode && form.statusCode) setAddWizardStep(3);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px 4px 6px',
                    borderRadius: '9999px',
                    background: addWizardStep === 3 ? 'rgba(59, 130, 246, 0.22)' : 'transparent',
                    border: addWizardStep === 3 ? '1px solid #60a5fa' : '1px solid transparent',
                    cursor: form.stageCode && form.statusCode ? 'pointer' : 'not-allowed',
                    opacity: form.stageCode && form.statusCode ? 1 : 0.45,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: addWizardStep === 3 ? '#3b82f6' : 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    3
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: addWizardStep === 3 ? '#93c5fd' : '#94a3b8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Review
                  </span>
                </button>
              </div>
            )}

            {mode === 'complete' && (
              <div
                className="header-wizard-steps"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px 4px 6px',
                    borderRadius: '9999px',
                    background: wizardStep === 1 ? 'rgba(59, 130, 246, 0.22)' : wizardStep > 1 ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                    border: wizardStep === 1 ? '1px solid #60a5fa' : wizardStep > 1 ? '1px solid #4ade80' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: wizardStep === 1 ? '#3b82f6' : wizardStep > 1 ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {wizardStep > 1 ? <Check size={12} /> : 1}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: wizardStep === 1 ? '#93c5fd' : wizardStep > 1 ? '#86efac' : '#94a3b8', whiteSpace: 'nowrap' }}>
                    Outcome
                  </span>
                </button>

                {showReasons && (
                  <>
                    <div style={{ width: '16px', height: '1.5px', background: wizardStep > 1 ? '#22c55e' : 'rgba(255, 255, 255, 0.15)' }} />
                    <button
                      type="button"
                      onClick={() => {
                        if (form.outcomeCode) setWizardStep(2);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px 4px 6px',
                        borderRadius: '9999px',
                        background: wizardStep === 2 ? 'rgba(59, 130, 246, 0.22)' : wizardStep > 2 ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        border: wizardStep === 2 ? '1px solid #60a5fa' : wizardStep > 2 ? '1px solid #4ade80' : '1px solid transparent',
                        cursor: form.outcomeCode ? 'pointer' : 'not-allowed',
                        opacity: form.outcomeCode ? 1 : 0.45,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: wizardStep === 2 ? '#3b82f6' : wizardStep > 2 ? '#22c55e' : 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {wizardStep > 2 ? <Check size={12} /> : 2}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: wizardStep === 2 ? '#93c5fd' : wizardStep > 2 ? '#86efac' : '#94a3b8', whiteSpace: 'nowrap' }}>
                        Reason
                      </span>
                    </button>
                  </>
                )}

                <div style={{ width: '16px', height: '1.5px', background: wizardStep > (showReasons ? 2 : 1) ? '#22c55e' : 'rgba(255, 255, 255, 0.15)' }} />

                <button
                  type="button"
                  onClick={() => {
                    if (canShowReview) setWizardStep(3);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px 4px 6px',
                    borderRadius: '9999px',
                    background: wizardStep === 3 || canShowReview ? 'rgba(59, 130, 246, 0.22)' : 'transparent',
                    border: wizardStep === 3 || canShowReview ? '1px solid #60a5fa' : '1px solid transparent',
                    cursor: canShowReview ? 'pointer' : 'not-allowed',
                    opacity: canShowReview ? 1 : 0.45,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: wizardStep === 3 ? '#3b82f6' : 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {showReasons ? 3 : 2}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: wizardStep === 3 ? '#93c5fd' : '#94a3b8', whiteSpace: 'nowrap' }}>
                    Review
                  </span>
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              className="close-button"
              onClick={onClose}
              style={{
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '9px',
                padding: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="modal-body" style={{ padding: '18px 24px 16px', maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Context bar for complete mode only */}
            {mode === 'complete' && currentFollowUp && (
              <div
                className="context-bar"
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  marginBottom: '18px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '24px',
                }}
              >
                <div className="context-item">
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entity</span>
                  <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginTop: '2px' }}>{entityName}</strong>
                </div>
                <div className="context-item">
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stage</span>
                  <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginTop: '2px' }}>{stageName}</strong>
                </div>
                <div className="context-item">
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
                  <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginTop: '2px' }}>{statusName}</strong>
                </div>
                {currentFollowUp.attempt_no > 1 && (
                  <div className="context-item">
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attempt</span>
                    <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginTop: '2px' }}>#{currentFollowUp.attempt_no}</strong>
                  </div>
                )}
              </div>
            )}

            {/* ===== COMPLETE MODE: Guided wizard ===== */}
            {mode === 'complete' && (
              <>

                {/* Follow-up type selector */}
                <label className="field wide" style={{ marginBottom: '20px', display: 'block' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Follow-up type</span>
                  <div
                    className="type-selector"
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {availableFollowUpTypes.map((t) => {
                      const Icon = getIcon(t.icon, t.code);
                      const isSelected = form.followUpTypeCode === t.code;
                      return (
                        <button
                          type="button"
                          key={t.code}
                          className={isSelected ? 'type-option selected' : 'type-option'}
                          onClick={() => changeType(t.code)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#1d4ed8' : '#475569',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                          }}
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
                      <label className="field wide" style={{ display: 'block' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'block' }}>
                          What happened? {fuType?.requires_outcome ? <em style={{ color: '#ef4444' }}>*</em> : null}
                        </span>
                        <div
                          className="outcome-grid"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '10px',
                          }}
                        >
                          {outcomes.map((o) => {
                            const isSelected = form.outcomeCode === o.code;
                            return (
                              <button
                                type="button"
                                key={o.code}
                                className={isSelected ? 'outcome-option selected' : 'outcome-option'}
                                onClick={() => changeOutcome(o.code)}
                                style={{
                                  padding: '14px 18px',
                                  borderRadius: '10px',
                                  border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                                  background: isSelected ? '#eff6ff' : '#ffffff',
                                  color: isSelected ? '#1d4ed8' : '#334155',
                                  fontSize: '13.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.2s ease',
                                  boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                                }}
                              >
                                {o.name}
                              </button>
                            );
                          })}
                        </div>
                      </label>
                    ) : (
                      <div
                        className="no-outcome-state"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '20px',
                          background: '#f0fdf4',
                          borderRadius: '12px',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <Check size={20} color="#16a34a" />
                        <div>
                          <strong style={{ color: '#15803d', fontSize: '14px', display: 'block' }}>No outcome needed for this type</strong>
                          <span style={{ color: '#4ade80', fontSize: '13px' }}>Click "Complete & save" to mark this follow-up as done.</span>
                        </div>
                      </div>
                    )}
                    {!fuType?.requires_outcome && outcomes.length === 0 && (
                      <div style={{ marginTop: '12px' }} />
                    )}
                  </div>
                )}

                {/* Step 2: Reason selection */}
                {wizardStep === 2 && showReasons && (
                  <div className="wizard-panel">
                    <label className="field wide" style={{ display: 'block' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                        Why? {reasonRequired ? <em style={{ color: '#ef4444' }}>*</em> : '(optional)'}
                      </span>
                      <div className="select-wrap" style={{ position: 'relative' }}>
                        <select
                          value={form.reasonCode}
                          onChange={(e) => update('reasonCode', e.target.value)}
                          autoFocus
                          style={{
                            width: '100%',
                            minHeight: '44px',
                            height: '44px',
                            lineHeight: '24px',
                            padding: '10px 38px 10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#0f172a',
                            background: '#ffffff',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">Select reason...</option>
                          {master.reasons.map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                      </div>
                    </label>
                    {reasonRequired && (
                      <div className="helper-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#dc2626', fontSize: '12.5px' }}>
                        <AlertCircle size={13} /> A reason is required for this outcome before the workflow can be resolved.
                      </div>
                    )}
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
                        <div className="special-section" style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                          <div className="special-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            {(() => {
                              const SI = getIcon((fuType as any)?.icon_name || fuType?.icon, fuType?.code);
                              return <SI size={16} color="#3b82f6" />;
                            })()}
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
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
                          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            {fuType.requires_date && (
                              <label className="field" style={{ display: 'block' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                                  Date <em style={{ color: '#ef4444' }}>*</em>
                                </span>
                                <input
                                  type="date"
                                  value={form.date}
                                  onChange={(e) => update('date', e.target.value)}
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                  }}
                                />
                              </label>
                            )}
                            {fuType.requires_time && (
                              <label className="field" style={{ display: 'block' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                                  Time <em style={{ color: '#ef4444' }}>*</em>
                                </span>
                                <input
                                  type="time"
                                  value={form.time}
                                  onChange={(e) => update('time', e.target.value)}
                                  required
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                  }}
                                />
                              </label>
                            )}
                            {fuType.requires_project && (
                              <label className="field" style={{ display: 'block' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                                  Project <em style={{ color: '#ef4444' }}>*</em>
                                </span>
                                <input
                                  value={form.project}
                                  onChange={(e) => update('project', e.target.value)}
                                  placeholder="e.g. Tamara Uprise"
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                  }}
                                />
                              </label>
                            )}
                            {fuType.requires_location && (
                              <label className="field" style={{ display: 'block' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                                  Site location <em style={{ color: '#ef4444' }}>*</em>
                                </span>
                                <input
                                  value={form.siteLocation}
                                  onChange={(e) => update('siteLocation', e.target.value)}
                                  placeholder="Site address"
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                  }}
                                />
                              </label>
                            )}
                            {fuType.requires_participants && (
                              <label className="field wide" style={{ display: 'block', gridColumn: '1 / -1' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                                  Participants <em style={{ color: '#ef4444' }}>*</em>
                                </span>
                                <input
                                  value={form.participants}
                                  onChange={(e) => update('participants', e.target.value)}
                                  placeholder="Comma-separated names"
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                  }}
                                />
                              </label>
                            )}
                            {fuType.requires_template && (
                              <label className="field wide" style={{ display: 'block', gridColumn: '1 / -1' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Message template</span>
                                <textarea
                                  rows={3}
                                  value={form.messageTemplate}
                                  onChange={(e) => update('messageTemplate', e.target.value)}
                                  placeholder="Message to send..."
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e8f0',
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    background: '#ffffff',
                                    resize: 'vertical',
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Automatic Decision Panel */}
                    {matchedRule ? (
                      <div
                        className={`auto-panel ${isOverridden ? 'overridden' : ''}`}
                        style={{
                          background: isOverridden ? '#fffbeb' : '#f0fdf4',
                          borderRadius: '14px',
                          padding: '20px',
                          border: isOverridden ? '1.5px solid #fcd34d' : '1.5px solid #bbf7d0',
                          marginBottom: '20px',
                        }}
                      >
                        <div className="auto-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <span
                            className="auto-badge"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              background: isOverridden ? '#fef3c7' : '#dcfce7',
                              color: isOverridden ? '#b45309' : '#15803d',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            <Check size={13} /> Automatic Decision
                          </span>
                          <small style={{ color: isOverridden ? '#b45309' : '#15803d', fontSize: '12px', fontWeight: 600 }}>
                            {isOverridden
                              ? 'Manager override applied'
                              : matchedRule.terminal
                                ? 'Terminal outcome'
                                : 'Matched & ready'}
                          </small>
                        </div>
                        <div
                          className="auto-grid"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px',
                            marginBottom: '16px',
                          }}
                        >
                          <div className="auto-item" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '10px 12px' }}>
                            <small style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Next Stage</small>
                            <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{nextStageName ?? '—'}</b>
                          </div>
                          <div className="auto-item" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '10px 12px' }}>
                            <small style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Next Status</small>
                            <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{nextStatusName ?? '—'}</b>
                          </div>
                          <div className="auto-item" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '10px 12px' }}>
                            <small style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Next Action</small>
                            <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{nextActionName ?? '—'}</b>
                          </div>
                          <div className="auto-item" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '10px 12px' }}>
                            <small style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Next Type</small>
                            <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{nextTypeName ?? '—'}</b>
                          </div>
                          <div className="auto-item" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '10px 12px' }}>
                            <small style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Priority</small>
                            <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{priorityName ?? '—'}</b>
                          </div>
                          <div className="auto-item" style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '10px 12px' }}>
                            <small style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Rule</small>
                            <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginTop: '2px' }}>{matchedRule.rule_id}</b>
                          </div>
                        </div>
                        <div className="auto-explain" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
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
                          <div className="auto-sequence-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600, color: '#6d28d9' }}>
                            <Zap size={12} /> Sequence: {matchedRule.sequence_name.replace(/_/g, ' ')}
                          </div>
                        )}
                        {(matchedRule.auto_email || matchedRule.auto_whatsapp || matchedRule.auto_message) && (
                          <div className="auto-automation-preview" style={{ marginTop: '16px', background: 'rgba(255,255,255,0.8)', borderRadius: '10px', padding: '14px' }}>
                            <div className="aap-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                              <Send size={13} /> Auto-send on save
                            </div>
                            <div className="aap-channels" style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                              {matchedRule.auto_email && <span className="aap-channel email" style={{ padding: '2px 10px', borderRadius: '9999px', background: '#dbeafe', color: '#1d4ed8', fontSize: '11px', fontWeight: 600 }}>Email</span>}
                              {matchedRule.auto_whatsapp && <span className="aap-channel whatsapp" style={{ padding: '2px 10px', borderRadius: '9999px', background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 600 }}>WhatsApp</span>}
                              {matchedRule.auto_message && <span className="aap-channel message" style={{ padding: '2px 10px', borderRadius: '9999px', background: '#f3e8ff', color: '#6d28d9', fontSize: '11px', fontWeight: 600 }}>Message</span>}
                            </div>
                            {matchedRule.message_body && (
                              <div className="aap-body" style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
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
                      <div
                        className="auto-panel no-match"
                        style={{
                          background: '#fffbeb',
                          borderRadius: '14px',
                          padding: '20px',
                          border: '1.5px solid #fcd34d',
                          marginBottom: '20px',
                        }}
                      >
                        <div className="auto-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span
                            className="auto-badge warn"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              background: '#fef3c7',
                              color: '#b45309',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            <AlertCircle size={13} /> No exact rule — using smart default
                          </span>
                          <small style={{ color: '#b45309', fontSize: '12px', fontWeight: 600 }}>Auto-fallback active</small>
                        </div>
                        <div className="auto-explain" style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                          <b>No master rule</b> for <b>{stageName} / {statusName}</b> + <b>{fuType?.name}</b> +{' '}
                          <b>{selectedOutcome?.name ?? form.outcomeCode}</b>. The system will use a <b>smart default</b>{' '}
                          to schedule the next follow-up so the workflow never stops. An admin can add a specific rule in
                          Masters for finer control.
                        </div>
                      </div>
                    )}

                    {/* Schedule section */}
                    <div className="schedule-section" style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                      <div className="schedule-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <b style={{ fontSize: '14px', color: '#0f172a' }}>Next follow-up / task</b>
                        <label className="schedule-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={form.createNext}
                            onChange={(e) => update('createNext', e.target.checked)}
                            disabled={Boolean(isTerminal)}
                            style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                          />
                          Create automatically
                        </label>
                      </div>
                      {isTerminal ? (
                        <div className="terminal-notice" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '13px' }}>
                          <Check size={15} /> Terminal outcome: <b>{nextActionName ?? matchedRule?.next_action_code}</b>.
                          No unnecessary follow-up task will be created.
                        </div>
                      ) : !matchedRule ? (
                        <div className="no-next-notice" style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fcd34d', color: '#b45309', fontSize: '13px' }}>
                          No exact rule matched — a smart default next step will be created automatically.
                        </div>
                      ) : (
                        <>
                          <div className="presets" style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            {presets.map((p) => (
                              <button
                                key={p.d}
                                type="button"
                                className={`preset ${activePreset === p.d ? 'active' : ''}`}
                                onClick={() => applyPreset(p.d)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '9999px',
                                  border: activePreset === p.d ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                                  background: activePreset === p.d ? '#eff6ff' : '#ffffff',
                                  color: activePreset === p.d ? '#1d4ed8' : '#475569',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <label className="field" style={{ display: 'block' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Date</span>
                              <input
                                type="date"
                                value={
                                  form.scheduleDateOverride ||
                                  nextStep?.scheduledDate ||
                                  localDatePlus(matchedRule?.default_days ?? 1)
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setForm((c) => ({ ...c, scheduleDateOverride: val, date: val }));
                                  setActivePreset(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '14px',
                                  color: '#0f172a',
                                  background: '#ffffff',
                                }}
                              />
                            </label>
                            <label className="field" style={{ display: 'block' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Time</span>
                              <input
                                type="time"
                                value={
                                  form.scheduleTimeOverride ||
                                  nextStep?.scheduledTime ||
                                  matchedRule?.default_time ||
                                  '11:00'
                                }
                                onChange={(e) => update('scheduleTimeOverride', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '14px',
                                  color: '#0f172a',
                                  background: '#ffffff',
                                }}
                              />
                            </label>
                            <label className="field" style={{ display: 'block' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Next type</span>
                              <div className="select-wrap" style={{ position: 'relative' }}>
                                <select
                                  value={
                                    form.overrideType ||
                                    nextStep?.nextFollowUpTypeCode ||
                                    matchedRule.follow_up_type_code
                                  }
                                  onChange={(e) => update('overrideType', e.target.value)}
                                  style={{
                                    width: '100%',
                                    minHeight: '44px',
                                    height: '44px',
                                    lineHeight: '24px',
                                    padding: '10px 38px 10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #cbd5e1',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    background: '#ffffff',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  {master.followUpTypes.map((t) => (
                                    <option key={t.code} value={t.code}>
                                      {t.name}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                              </div>
                            </label>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Employee note */}
                    <label className="field wide" style={{ marginTop: '16px', display: 'block' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Employee remark</span>
                      <textarea
                        rows={2}
                        value={form.customRemark}
                        onChange={(e) => update('customRemark', e.target.value)}
                        placeholder="Optional. Add only information that is not already captured structurally."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#0f172a',
                          background: '#ffffff',
                          resize: 'vertical',
                        }}
                      />
                    </label>
                    {matchedRule?.remark && (
                      <div className="remark-suggest" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', marginTop: '10px', border: '1px solid #e2e8f0' }}>
                        <div className="remark-suggest-text" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                          <b>Auto remark from master:</b> <span>{matchedRule.remark}</span>
                        </div>
                        <button
                          type="button"
                          className="copy-remark"
                          onClick={() => update('customRemark', matchedRule.remark ?? '')}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
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
                      style={{ marginTop: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}
                    >
                      <summary style={{ padding: '12px 16px', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                        <Settings2 size={13} /> Advanced Controls — Manager / Admin Only
                      </summary>
                      <div className="advanced-body" style={{ padding: '16px' }}>
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Next stage</span>
                            <div className="select-wrap" style={{ position: 'relative' }}>
                              <select
                                value={form.overrideStage}
                                onChange={(e) => update('overrideStage', e.target.value)}
                                style={{
                                  width: '100%',
                                  minHeight: '44px',
                                  height: '44px',
                                  lineHeight: '24px',
                                  padding: '10px 38px 10px 14px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #cbd5e1',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: '#0f172a',
                                  background: '#ffffff',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  cursor: 'pointer',
                                  boxSizing: 'border-box',
                                }}
                              >
                                <option value="">Default ({nextStageName ?? '—'})</option>
                                {availableStages.map((s) => (
                                  <option key={s.code} value={s.code}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            </div>
                          </label>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Next status</span>
                            <div className="select-wrap" style={{ position: 'relative' }}>
                              <select
                                value={form.overrideStatus}
                                onChange={(e) => update('overrideStatus', e.target.value)}
                                style={{
                                  width: '100%',
                                  minHeight: '44px',
                                  height: '44px',
                                  lineHeight: '24px',
                                  padding: '10px 38px 10px 14px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #cbd5e1',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: '#0f172a',
                                  background: '#ffffff',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  cursor: 'pointer',
                                  boxSizing: 'border-box',
                                }}
                              >
                                <option value="">Default ({nextStatusName ?? '—'})</option>
                                {availableStatuses.map((s) => (
                                  <option key={s.code} value={s.code}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            </div>
                          </label>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Next action</span>
                            <div className="select-wrap" style={{ position: 'relative' }}>
                              <select
                                value={form.overrideAction}
                                onChange={(e) => update('overrideAction', e.target.value)}
                                style={{
                                  width: '100%',
                                  minHeight: '44px',
                                  height: '44px',
                                  lineHeight: '24px',
                                  padding: '10px 38px 10px 14px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #cbd5e1',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: '#0f172a',
                                  background: '#ffffff',
                                  appearance: 'none',
                                  WebkitAppearance: 'none',
                                  cursor: 'pointer',
                                  boxSizing: 'border-box',
                                }}
                              >
                                <option value="">Default ({nextActionName ?? '—'})</option>
                                {master.nextActions.map((a) => (
                                  <option key={a.code} value={a.code}>
                                    {a.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            </div>
                          </label>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Priority</span>
                            <div className="select-wrap" style={{ position: 'relative' }}>
                              <select
                                value={form.overridePriority}
                                onChange={(e) => update('overridePriority', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: '10px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '14px',
                                  color: '#0f172a',
                                  background: '#ffffff',
                                  appearance: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="">Default ({priorityName ?? '—'})</option>
                                {master.priorities.map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            </div>
                          </label>
                        </div>
                        <div className="helper-text" style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                          Changing any value here overrides the master rule for this follow-up only. Production: keep this
                          hidden for Sales / Pre-sales roles and require a permission to apply overrides.
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </>
            )}

            {/* ===== ADD / EDIT MODE: Guided wizard ===== */}
            {(mode === 'add' || mode === 'edit') && (
              <>
                {/* Step 1: Who & What */}
                {addWizardStep === 1 && (
                  <div className="wizard-panel">
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                      {/* Entity (Read-only / Locked) */}
                      <label className="field" style={{ display: 'block' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={11} color="#94a3b8" /> Entity
                        </span>
                        <div
                          style={{
                            width: '100%',
                            minHeight: '44px',
                            height: '44px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            boxSizing: 'border-box',
                            cursor: 'not-allowed',
                            userSelect: 'none',
                          }}
                        >
                          <span style={{ padding: '3px 9px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 700 }}>
                            {entityLabel.toUpperCase()}
                          </span>
                        </div>
                      </label>

                      {/* Name (Read-only / Locked) */}
                      <label className="field" style={{ display: 'block' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={11} color="#94a3b8" /> {entityNameLabel}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            minHeight: '44px',
                            height: '44px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxSizing: 'border-box',
                            cursor: 'not-allowed',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: '#0f172a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <User size={14} color="#64748b" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {form.entityName || (form.entityRef ? form.entityRef.replace(/\s*\([^)]*\)\s*$/, '') : '—')}
                          </span>
                        </div>
                      </label>

                      {/* Phone Number (Read-only / Locked) */}
                      <label className="field" style={{ display: 'block' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={11} color="#94a3b8" /> Phone Number
                        </span>
                        <div
                          style={{
                            width: '100%',
                            minHeight: '44px',
                            height: '44px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxSizing: 'border-box',
                            cursor: 'not-allowed',
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: '#334155',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <PhoneCall size={14} color="#64748b" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {form.entityPhone || '—'}
                          </span>
                        </div>
                      </label>
                    </div>

                    <label className="field wide" style={{ marginTop: '20px', display: 'block' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Follow-up type</span>
                      <div
                        className="type-selector"
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {availableFollowUpTypes.map((t) => {
                          const Icon = getIcon(t.icon, t.code);
                          const isSelected = form.followUpTypeCode === t.code;
                          return (
                            <button
                              type="button"
                              key={t.code}
                              className={isSelected ? 'type-option selected' : 'type-option'}
                              onClick={() => changeType(t.code)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                                background: isSelected ? '#eff6ff' : '#ffffff',
                                color: isSelected ? '#1d4ed8' : '#475569',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
                              }}
                            >
                              <Icon size={16} />
                              <span>{t.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </label>

                    {/* Active Sequence Visual Journey Tracker */}
                    {activeSequenceDetails && (
                      <div
                        style={{
                          marginTop: '16px',
                          marginBottom: '16px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                          border: '1.5px solid #bfdbfe',
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.06)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#1e40af' }}>
                            <Zap size={15} style={{ color: '#2563eb' }} />
                            <span>Sequence Flow: <strong style={{ textTransform: 'capitalize' }}>{activeSequenceDetails.name}</strong></span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '9999px' }}>
                            Step {currentAttemptNo} of {activeSequenceDetails.totalSteps}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                          {activeSequenceDetails.steps.map((s) => {
                            const isCurrent = s.step === currentAttemptNo;
                            const isPassed = s.step < currentAttemptNo;
                            return (
                              <div
                                key={s.step}
                                style={{
                                  flex: '1 1 auto',
                                  minWidth: '110px',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  background: isCurrent ? '#2563eb' : isPassed ? '#e2e8f0' : '#ffffff',
                                  color: isCurrent ? '#ffffff' : isPassed ? '#64748b' : '#334155',
                                  border: isCurrent ? '1.5px solid #1d4ed8' : '1px solid #cbd5e1',
                                  fontSize: '11px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                  transition: 'all 0.2s',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontWeight: 700 }}>Step {s.step}</span>
                                  <span style={{ fontSize: '10px', opacity: 0.85 }}>{s.channel || 'Call'}</span>
                                </div>
                                <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {s.action_code.replace(/_/g, ' ')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <label className="field wide" style={{ marginTop: '12px', display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '12.5px' }}>What should happen?</span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Target size={11} /> Follow-up #{currentAttemptNo}
                          </span>
                        </span>

                        {/* Interactive Step Switcher Pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {[
                            { label: `Step #${currentAttemptNo}`, isStepCurrent: true, val: currentAttemptNo },
                            { label: 'Step 1', isStepCurrent: false, val: 1 },
                            { label: 'Step 2', isStepCurrent: false, val: 2 },
                            { label: 'Step 3+', isStepCurrent: false, val: 3 },
                            { label: `All (${entityActionsAllCount})`, isAll: true, val: 'all' as const },
                          ].filter((item, idx, arr) => arr.findIndex((x) => x.val === item.val) === idx).map((st) => {
                            const isSelected = selectedStepTab === st.val || (selectedStepTab === null && st.val === currentAttemptNo);
                            return (
                              <button
                                key={String(st.val)}
                                type="button"
                                onClick={() => {
                                  if (st.val === 'all') {
                                    setSelectedStepTab('all');
                                    setShowAllActions(true);
                                  } else {
                                    setSelectedStepTab(st.val);
                                    setShowAllActions(false);
                                  }
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                  background: isSelected ? '#eff6ff' : '#ffffff',
                                  color: isSelected ? '#1d4ed8' : '#64748b',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {st.isStepCurrent ? <Target size={10} /> : st.isAll ? <Sparkles size={10} /> : null}
                                <span>{st.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Category Filter Pills & Search */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setActionCategoryTab('all')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              border: actionCategoryTab === 'all' ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                              background: actionCategoryTab === 'all' ? '#eff6ff' : '#f8fafc',
                              color: actionCategoryTab === 'all' ? '#1d4ed8' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {showAllActions ? <Sparkles size={10} /> : <Target size={10} />}
                            <span>{showAllActions ? `All (${entityActions.length})` : `Step #${currentAttemptNo} (${entityActions.length})`}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionCategoryTab('next_step')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              border: actionCategoryTab === 'next_step' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                              background: actionCategoryTab === 'next_step' ? '#ecfdf5' : '#f8fafc',
                              color: actionCategoryTab === 'next_step' ? '#047857' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            <span>Next Steps</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionCategoryTab('retry')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              border: actionCategoryTab === 'retry' ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                              background: actionCategoryTab === 'retry' ? '#fffbeb' : '#f8fafc',
                              color: actionCategoryTab === 'retry' ? '#b45309' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                            <span>Call Status / Retry</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionCategoryTab('deal')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              border: actionCategoryTab === 'deal' ? '1.5px solid #8b5cf6' : '1px solid #e2e8f0',
                              background: actionCategoryTab === 'deal' ? '#f5f3ff' : '#f8fafc',
                              color: actionCategoryTab === 'deal' ? '#6d28d9' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                            <span>Deal & Closing</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActionCategoryTab('closure')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 9px',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              border: actionCategoryTab === 'closure' ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                              background: actionCategoryTab === 'closure' ? '#fef2f2' : '#f8fafc',
                              color: actionCategoryTab === 'closure' ? '#b91c1c' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                            <span>Closure</span>
                          </button>
                        </div>

                        {/* Search Action Box */}
                        <div style={{ position: 'relative', width: '180px' }}>
                          <Search size={11} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            type="text"
                            value={actionSearch}
                            onChange={(e) => setActionSearch(e.target.value)}
                            placeholder="Search actions..."
                            style={{
                              width: '100%',
                              padding: '4px 8px 4px 24px',
                              fontSize: '11px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                            }}
                          />
                          {actionSearch && (
                            <button
                              type="button"
                              onClick={() => setActionSearch('')}
                              style={{
                                position: 'absolute',
                                right: '6px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Smart Schedule feedback banner */}
                      {smartScheduleNotice && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#15803d',
                            marginBottom: '8px',
                          }}
                        >
                          <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                          <span>{smartScheduleNotice}</span>
                        </div>
                      )}

                      {displayedEntityActions.length > 0 ? (
                        <div
                          className="outcome-grid action-intent-grid"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                            gap: '6px',
                            maxHeight: '210px',
                            overflowY: 'auto',
                            padding: '2px 4px 2px 2px',
                          }}
                        >
                          {displayedEntityActions.map((action) => {
                            const isSelected = form.nextActionOverride === action.code;
                            const cat = (action as any).category;
                            const borderStyle = cat === 'closure' ? '#fca5a5' : cat === 'retry' ? '#fcd34d' : cat === 'deal' ? '#d8b4fe' : '#93c5fd';
                            return (
                              <button
                                type="button"
                                key={action.code}
                                className={isSelected ? 'outcome-option selected' : 'outcome-option'}
                                style={{
                                  padding: '7px 11px',
                                  borderRadius: '7px',
                                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                  borderLeft: !isSelected ? `3px solid ${borderStyle}` : undefined,
                                  background: isSelected ? '#eff6ff' : '#ffffff',
                                  color: isSelected ? '#1d4ed8' : '#334155',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.15)' : 'none',
                                }}
                                onClick={() => handleActionIntentClick(action.code)}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.name}</span>
                                {isSelected && <Check size={12} style={{ color: '#2563eb', flexShrink: 0, marginLeft: '4px' }} />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="no-outcome-state" style={{ padding: '12px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                          <AlertCircle size={15} color="#94a3b8" />
                          <span style={{ display: 'block', marginTop: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                            {actionSearch ? `No actions matching "${actionSearch}".` : `No actions in this category for Follow-up #${currentAttemptNo}. Click "Show all options" or choose another category.`}
                          </span>
                        </div>
                      )}
                    </label>

                    {/* Smart Suggestion + Stage + Status in ONE compact, premium row */}
                    <div
                      className="stage-status-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: stageSuggestion ? 'minmax(210px, 1.2fr) 1fr 1fr' : '1fr 1fr',
                        gap: '12px',
                        alignItems: 'flex-end',
                        marginTop: '12px',
                      }}
                    >
                      {stageSuggestion && (
                        <div
                          className="smart-suggestion-panel"
                          onClick={() => {
                            setForm((c) => ({
                              ...c,
                              stageCode: stageSuggestion.stageCode,
                              statusCode: stageSuggestion.statusCode,
                            }));
                          }}
                          title="Click to apply suggested Stage and Status"
                          style={{
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            border: '1.5px solid #bae6fd',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minHeight: '66px',
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 3px rgba(2, 132, 199, 0.08)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Smart Suggestion
                            </span>
                            <span style={{ fontSize: '9px', fontWeight: 600, color: '#0284c7', background: '#ffffff', padding: '1px 6px', borderRadius: '9999px', border: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                              {stageSuggestion.confidence === 'high' ? 'High' : 'Med'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 7px', fontSize: '11.5px', fontWeight: 600, color: '#0f172a' }}>
                              <span style={{ color: '#0369a1' }}>
                                {master.stages.find(
                                  (s) => s.code.toUpperCase() === stageSuggestion.stageCode.toUpperCase() && (!s.entity_code || s.entity_code === form.entityCode)
                                )?.name ?? stageSuggestion.stageCode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '10px' }}>›</span>
                              <span style={{ color: '#0f172a' }}>
                                {master.statuses.find(
                                  (s) => s.code.toUpperCase() === stageSuggestion.statusCode.toUpperCase() && (!s.entity_code || s.entity_code === form.entityCode)
                                )?.name ?? stageSuggestion.statusCode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: '10px',
                              color: '#64748b',
                              lineHeight: '1.2',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {stageSuggestion.reason}
                          </div>
                        </div>
                      )}

                      <label className="field" style={{ display: 'block', margin: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px', display: 'block' }}>
                          Stage <em style={{ color: '#ef4444' }}>*</em>
                        </span>
                        <div className="select-wrap" style={{ position: 'relative' }}>
                          <select
                            value={form.stageCode}
                            onChange={(e) => update('stageCode', e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: '40px',
                              height: '40px',
                              lineHeight: '22px',
                              padding: '8px 34px 8px 12px',
                              borderRadius: '9px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: '#0f172a',
                              background: '#ffffff',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              cursor: 'pointer',
                              boxSizing: 'border-box',
                            }}
                          >
                            <option value="">Select stage...</option>
                            {availableStages.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        </div>
                      </label>

                      <label className="field" style={{ display: 'block', margin: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '5px', display: 'block' }}>
                          Status <em style={{ color: '#ef4444' }}>*</em>
                        </span>
                        <div className="select-wrap" style={{ position: 'relative' }}>
                          <select
                            value={form.statusCode}
                            onChange={(e) => update('statusCode', e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: '40px',
                              height: '40px',
                              lineHeight: '22px',
                              padding: '8px 34px 8px 12px',
                              borderRadius: '9px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: '#0f172a',
                              background: '#ffffff',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              cursor: 'pointer',
                              boxSizing: 'border-box',
                            }}
                          >
                            <option value="">Select status...</option>
                            {availableStatuses.map((s) => (
                              <option key={s.code} value={s.code}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        </div>
                      </label>
                    </div>

                    {pendingForRef && (
                      <div
                        className="duplicate-warning"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          background: '#fffbeb',
                          borderRadius: '10px',
                          border: '1px solid #fcd34d',
                          marginTop: '14px',
                          fontSize: '12.5px',
                          color: '#b45309',
                        }}
                      >
                        <AlertCircle size={14} />{' '}
                        <span>
                          A pending follow-up already exists for <b>{form.entityRef}</b>. Creating another may duplicate
                          work.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Location-based Properties (Left) & Configuration Details (Right) - 2 Column Layout */}
                {addWizardStep === 2 && (
                  <div
                    className="wizard-panel step2-2col-layout"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.08fr 0.92fr',
                      gap: '18px',
                      alignItems: 'start',
                    }}
                  >
                    {/* ===== LEFT COLUMN: Properties Selector ===== */}
                    <div
                      className="properties-selector-panel"
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '16px',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* Properties Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: entityRequirements.hasRequirements ? '#ecfdf5' : '#eff6ff',
                              color: entityRequirements.hasRequirements ? '#059669' : '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h4
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#1e293b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                margin: 0,
                              }}
                            >
                              {entityRequirements.hasRequirements ? 'Shortlisted Properties' : 'Available Properties'}
                            </h4>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {entityRequirements.hasRequirements
                                ? `Matched to ${form.entityCode.toLowerCase()} preferences`
                                : 'Select property to auto-fill details'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {selectedPropertyIds.length > 0 && (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#dcfce7',
                                color: '#15803d',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                              }}
                            >
                              <Check size={12} /> {selectedPropertyIds.length} Selected
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPropertyIds([]);
                                  setForm((f) => ({
                                    ...f,
                                    project: '',
                                    siteLocation: '',
                                  }));
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#15803d',
                                  cursor: 'pointer',
                                  padding: '0 2px',
                                  marginLeft: '2px',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                }}
                                title="Clear selection"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              padding: '3px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {filteredProperties.length} available
                          </span>
                        </div>
                      </div>

                      {/* Requirement Summary & Toggle Matched / All */}
                      {entityRequirements.hasRequirements ? (
                        <div
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '9px',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Target size={11} className="text-emerald-700" /> Preferences:
                            </span>
                            {entityRequirements.locations.length > 0 && (
                              <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <MapPin size={9} /> {entityRequirements.locations.join(', ')}
                              </span>
                            )}
                            {entityRequirements.bhks.length > 0 && (
                              <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <Bed size={9} /> {entityRequirements.bhks.join(', ')}
                              </span>
                            )}
                            {(entityRequirements.minBudget > 0 || entityRequirements.maxBudget > 0) && (
                              <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                <Coins size={9} /> {formatPropertyPrice(entityRequirements.minBudget)} - {formatPropertyPrice(entityRequirements.maxBudget)}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setShowOnlyMatched(true)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                border: showOnlyMatched ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                                background: showOnlyMatched ? '#16a34a' : '#ffffff',
                                color: showOnlyMatched ? '#ffffff' : '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              <Target size={10} /> Matched Only ({totalMatchedCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowOnlyMatched(false)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                border: !showOnlyMatched ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                                background: !showOnlyMatched ? '#2563eb' : '#ffffff',
                                color: !showOnlyMatched ? '#ffffff' : '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              <Building2 size={10} /> All ({allProperties.length})
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Building2 size={12} color="#94a3b8" />
                          <span>Showing all available inventory for selection.</span>
                        </div>
                      )}

                      {/* Location Filter Pills */}
                      {availablePropertyLocations.length > 0 && (
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '5px',
                              overflowX: 'auto',
                              paddingBottom: '2px',
                              scrollbarWidth: 'thin',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setPropLocationFilter('ALL')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontWeight: 600,
                                border: propLocationFilter === 'ALL' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                background: propLocationFilter === 'ALL' ? '#eff6ff' : '#f8fafc',
                                color: propLocationFilter === 'ALL' ? '#1d4ed8' : '#475569',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Compass size={10} /> All ({allProperties.length})
                            </button>
                            {availablePropertyLocations.map((loc) => {
                              const isSelected = propLocationFilter.toLowerCase() === loc.toLowerCase();
                              const count = allProperties.filter((p) =>
                                `${p.locality || ''} ${p.location || ''} ${p.city || ''} ${p.site_location || ''}`.toLowerCase().includes(loc.toLowerCase())
                              ).length;
                              return (
                                <button
                                  key={loc}
                                  type="button"
                                  onClick={() => setPropLocationFilter(isSelected ? 'ALL' : loc)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '3px 10px',
                                    borderRadius: '9999px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                    background: isSelected ? '#eff6ff' : '#f8fafc',
                                    color: isSelected ? '#1d4ed8' : '#475569',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <MapPin size={9} /> {loc} ({count})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Search & BHK Filter */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
                          <Search size={12} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            type="text"
                            value={propSearchQuery}
                            onChange={(e) => setPropSearchQuery(e.target.value)}
                            placeholder="Search project or locality..."
                            style={{
                              width: '100%',
                              padding: '6px 8px 6px 28px',
                              fontSize: '11.5px',
                              borderRadius: '7px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                            }}
                          />
                          {propSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPropSearchQuery('')}
                              style={{
                                position: 'absolute',
                                right: '7px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* BHK Filter */}
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {['ALL', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map((bhk) => {
                            const isSelected = propBhkFilter === bhk;
                            return (
                              <button
                                key={bhk}
                                type="button"
                                onClick={() => setPropBhkFilter(bhk)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  border: isSelected ? '1.5px solid #059669' : '1px solid #cbd5e1',
                                  background: isSelected ? '#ecfdf5' : '#ffffff',
                                  color: isSelected ? '#047857' : '#475569',
                                  cursor: 'pointer',
                                }}
                              >
                                {bhk}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Property Cards Grid */}
                      <div
                        className="properties-cards-scroll"
                        style={{
                          maxHeight: '430px',
                          overflowY: 'auto',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                          gap: '8px',
                          padding: '2px',
                          paddingRight: '4px',
                        }}
                      >
                        {propertiesLoading ? (
                          <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                            Loading properties...
                          </div>
                        ) : filteredProperties.length === 0 ? (
                          <div
                            style={{
                              gridColumn: '1 / -1',
                              padding: '20px',
                              textAlign: 'center',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px dashed #cbd5e1',
                              color: '#64748b',
                              fontSize: '12px',
                            }}
                          >
                            <Building2 size={20} color="#94a3b8" style={{ margin: '0 auto 6px', display: 'block' }} />
                            {entityRequirements.hasRequirements && showOnlyMatched ? (
                              <div>
                                No properties match exact requirements.
                                <div style={{ marginTop: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => setShowOnlyMatched(false)}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      background: '#2563eb',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    View All Available ({allProperties.length})
                                  </button>
                                </div>
                              </div>
                            ) : (
                              `No properties found matching current filters.`
                            )}
                          </div>
                        ) : (
                          filteredProperties.map((prop) => {
                            const isSelected = selectedPropertyIds.includes(prop.id);
                            const imgUrl = getPropertyImageUrl(prop);
                            const title = getPropertyName(prop);
                            const loc = getPropertyLocation(prop);
                            const priceFormatted = formatPropertyPrice(prop.expected_price || prop.price || prop.budget);
                            const bhkText = prop.bedrooms ? `${prop.bedrooms} BHK` : prop.unit_type || prop.property_type || '2 BHK';
                            const areaText = prop.carpet_area ? `${prop.carpet_area} sq.ft` : prop.builtup_area ? `${prop.builtup_area} sq.ft` : '';
                            const matchInfo = propertyMatchDetails.get(prop.id);

                            return (
                              <div
                                key={prop.id}
                                onClick={() => togglePropertySelection(prop)}
                                style={{
                                  display: 'flex',
                                  gap: '8px',
                                  padding: '8px',
                                  borderRadius: '9px',
                                  border: isSelected
                                    ? '2px solid #2563eb'
                                    : matchInfo?.isMatched && entityRequirements.hasRequirements
                                      ? '1.5px solid #86efac'
                                      : '1px solid #e2e8f0',
                                  background: isSelected
                                    ? '#eff6ff'
                                    : matchInfo?.isMatched && entityRequirements.hasRequirements
                                      ? '#f0fdf4'
                                      : '#ffffff',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none',
                                  position: 'relative',
                                }}
                              >
                                {/* Thumbnail Image */}
                                <div
                                  style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '7px',
                                    background: '#f1f5f9',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={title}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Building2 size={20} color="#94a3b8" />
                                  )}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                      <h5
                                        style={{
                                          fontSize: '12px',
                                          fontWeight: 700,
                                          color: isSelected ? '#1d4ed8' : '#0f172a',
                                          margin: 0,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                        title={title}
                                      >
                                        {title}
                                      </h5>
                                      <div
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '4px',
                                          border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                                          background: isSelected ? '#2563eb' : '#ffffff',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0,
                                        }}
                                      >
                                        {isSelected && <Check size={11} color="#ffffff" />}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '1px', color: '#64748b', fontSize: '10.5px' }}>
                                      <MapPin size={9} color="#94a3b8" />
                                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc}</span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#059669' }}>
                                      {priceFormatted}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#475569', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                                      {bhkText} {areaText ? `• ${areaText}` : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* ===== RIGHT COLUMN: Follow-up Configuration & Remaining Info ===== */}
                    <div
                      className="followup-details-panel"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* 1. Type-specific details */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                          {(() => {
                            const SI = getIcon((fuType as any)?.icon_name || fuType?.icon, fuType?.code);
                            return <SI size={15} color="#3b82f6" />;
                          })()}
                          <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                            {fuType?.code === 'WHATSAPP'
                              ? 'WHATSAPP DETAILS'
                              : fuType?.code === 'EMAIL'
                                ? 'EMAIL DETAILS'
                                : fuType?.code === 'SITE_VISIT' || fuType?.code === 'VISIT'
                                  ? 'SITE VISIT DETAILS'
                                  : fuType?.code === 'MEETING'
                                    ? 'MEETING DETAILS'
                                    : `${fuType?.name?.toUpperCase() ?? 'FOLLOW-UP'} DETAILS`}
                          </h4>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                              Project {fuType?.requires_project ? <em style={{ color: '#ef4444' }}>*</em> : '(optional)'}
                            </span>
                            <input
                              value={form.project}
                              onChange={(e) => update('project', e.target.value)}
                              placeholder="e.g. Tamara Uprise"
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '12.5px',
                                color: '#0f172a',
                                background: '#ffffff',
                              }}
                            />
                          </label>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                              Site location {fuType?.requires_location ? <em style={{ color: '#ef4444' }}>*</em> : '(optional)'}
                            </span>
                            <input
                              value={form.siteLocation}
                              onChange={(e) => update('siteLocation', e.target.value)}
                              placeholder="Site location"
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '12.5px',
                                color: '#0f172a',
                                background: '#ffffff',
                              }}
                            />
                          </label>
                          {fuType?.requires_participants && (
                            <label className="field wide" style={{ display: 'block', gridColumn: '1 / -1' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                                Participants <em style={{ color: '#ef4444' }}>*</em>
                              </span>
                              <input
                                value={form.participants}
                                onChange={(e) => update('participants', e.target.value)}
                                placeholder="Comma-separated names"
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '12.5px',
                                  color: '#0f172a',
                                  background: '#ffffff',
                                }}
                              />
                            </label>
                          )}
                          {(fuType?.requires_template || form.followUpTypeCode === 'WHATSAPP' || form.followUpTypeCode === 'EMAIL') && (
                            <label className="field wide" style={{ display: 'block', gridColumn: '1 / -1' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Message template</span>
                              <textarea
                                rows={2}
                                value={form.messageTemplate}
                                onChange={(e) => update('messageTemplate', e.target.value)}
                                placeholder="Message text with property details..."
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #e2e8f0',
                                  fontSize: '12.5px',
                                  color: '#0f172a',
                                  background: '#ffffff',
                                  resize: 'vertical',
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* 2. Schedule & Priority */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={15} color="#f97316" />
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                              Schedule & Priority
                            </h4>
                          </div>

                          {/* Date Presets */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {presets.map((p) => (
                              <button
                                key={p.d}
                                type="button"
                                onClick={() => applyPreset(p.d)}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '9999px',
                                  border: activePreset === p.d ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                                  background: activePreset === p.d ? '#eff6ff' : '#f8fafc',
                                  color: activePreset === p.d ? '#1d4ed8' : '#475569',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                              Schedule Date <em style={{ color: '#ef4444' }}>*</em>
                            </span>
                            <input
                              type="date"
                              value={form.scheduleDateOverride || form.date}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((c) => ({ ...c, scheduleDateOverride: val, date: val }));
                                setActivePreset(null);
                              }}
                              required
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '12.5px',
                                color: '#0f172a',
                                background: '#ffffff',
                              }}
                            />
                          </label>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                              Schedule Time <em style={{ color: '#ef4444' }}>*</em>
                            </span>
                            <input
                              type="time"
                              value={form.scheduleTimeOverride || form.time}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((c) => ({ ...c, scheduleTimeOverride: val, time: val }));
                              }}
                              required
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '12.5px',
                                color: '#0f172a',
                                background: '#ffffff',
                              }}
                            />
                          </label>
                        </div>

                        {/* Priority Selector */}
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Priority</span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {master.priorities
                              .sort((a, b) => a.display_order - b.display_order)
                              .map((p) => {
                                const isSelected = form.priorityCode === p.code;
                                return (
                                  <button
                                    type="button"
                                    key={p.code}
                                    onClick={() => update('priorityCode', p.code)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '4px 10px',
                                      borderRadius: '9999px',
                                      border: isSelected ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                                      background: isSelected ? '#eff6ff' : '#f8fafc',
                                      color: isSelected ? '#1d4ed8' : '#475569',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.code === 'URGENT' ? '#ef4444' : p.code === 'HIGH' ? '#f97316' : p.code === 'MEDIUM' ? '#eab308' : '#22c55e' }} /> {p.name}
                                  </button>
                                );
                              })}
                          </div>
                        </div>

                        {prioritySuggestion && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 10px',
                              background: '#f0f9ff',
                              borderRadius: '6px',
                              border: '1px solid #bae6fd',
                              fontSize: '11px',
                              color: '#0369a1',
                              marginTop: '8px',
                            }}
                          >
                           Auto-suggested:{' '}
                            <b>
                              {master.priorities.find((p) => p.code === prioritySuggestion.priorityCode)?.name ?? prioritySuggestion.priorityCode}
                            </b>{' '}
                            — {prioritySuggestion.reason}
                          </div>
                        )}
                      </div>

                      {/* 3. Assignee & Due Date/Time */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Assign to</span>
                            <input
                              type="text"
                              value={form.assignedTo || 'Unassigned'}
                              readOnly
                              disabled
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '12.5px',
                                backgroundColor: '#f8fafc',
                                cursor: 'not-allowed',
                                color: '#0f172a',
                                fontWeight: 600,
                              }}
                            />
                          </label>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Due date</span>
                            <input
                              type="date"
                              value={form.dueDate}
                              onChange={(e) => update('dueDate', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '12.5px',
                                color: '#0f172a',
                                background: '#ffffff',
                              }}
                            />
                          </label>
                          <label className="field" style={{ display: 'block' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Due time</span>
                            <input
                              type="time"
                              value={form.dueTime}
                              onChange={(e) => update('dueTime', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #e2e8f0',
                                fontSize: '12.5px',
                                color: '#0f172a',
                                background: '#ffffff',
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* 4. Employee Remark */}
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        }}
                      >
                        <label className="field wide" style={{ display: 'block' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>Employee Remark</span>
                          <textarea
                            rows={2}
                            value={form.customRemark}
                            onChange={(e) => update('customRemark', e.target.value)}
                            placeholder={remarkPlaceholder}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1.5px solid #e2e8f0',
                              fontSize: '12.5px',
                              color: '#0f172a',
                              background: '#ffffff',
                              resize: 'vertical',
                            }}
                          />
                        </label>

                        {addModeRuleHint?.remark && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '7px', marginTop: '6px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#475569' }}>
                             <b>Auto remark:</b> <span>{addModeRuleHint.remark}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => update('customRemark', addModeRuleHint.remark ?? '')}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '5px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Use
                            </button>
                          </div>
                        )}

                        {/* Historical remark suggestions */}
                        {(remarkSuggestionsLoading || remarkSuggestions.length > 0) && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                              {remarkSuggestionsLoading ? 'Loading team remarks...' : 'Quick team remarks:'}
                            </div>
                            {!remarkSuggestionsLoading && remarkSuggestions.length > 0 && (
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {remarkSuggestions.slice(0, 4).map((r) => (
                                  <button
                                    type="button"
                                    key={r}
                                    onClick={() => update('customRemark', r)}
                                    title={r}
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: '9999px',
                                      background: '#f1f5f9',
                                      border: '1px solid #e2e8f0',
                                      fontSize: '11px',
                                      color: '#475569',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {r.length > 36 ? r.slice(0, 36) + '...' : r}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* AI lead signal (if present) */}
                      {aiLeadInsight && (
                        <div
                          style={{
                            background: '#f5f3ff',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            border: '1.5px solid #ddd6fe',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6d28d9', fontWeight: 600 }}>
                            <BrainCircuit size={14} />
                            <b>AI Lead Signal</b>
                            <span style={{ fontWeight: 400, color: '#7c3aed' }}>
                              Score {aiLeadInsight.score} · {aiLeadInsight.trend.toLowerCase()} · {aiLeadInsight.total_follow_ups} follow-ups
                            </span>
                          </div>
                          <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                            {aiLeadInsight.team_name ?? 'Unassigned'}
                            {aiLeadInsight.member_name ? ` · ${aiLeadInsight.member_name}` : ''}
                          </strong>
                          <small style={{ fontSize: '11.5px', color: '#6d28d9' }}>{aiLeadInsight.suggested_reason}</small>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== Step 3: Redesigned Ultra-Premium Review Screen ===== */}
                {addWizardStep === 3 && (
                  <div className="wizard-panel review-step-redesigned" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Top Review Banner */}
                  


                     
                
                    <div
                      className="review-dashboard-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.05fr 0.95fr',
                        gap: '16px',
                        alignItems: 'start',
                      }}
                    >
                      {/* Left Review Column: Entity & Properties */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
                        {/* Entity Profile Card */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            boxSizing: 'border-box',
                            width: '100%',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                            <User size={15} color="#3b82f6" />
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                              Entity & Stage
                            </h4>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer</span>
                              <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: 700 }}>
                                {entityLabel.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: 700, wordBreak: 'break-word' }}>
                              {form.entityName || (form.entityRef ? form.entityRef.replace(/\s*\([^)]*\)\s*$/, '') : 'Customer')}
                              {form.entityPhone && (
                                <span style={{ color: '#64748b', fontWeight: 500, fontSize: '13px', marginLeft: '6px' }}>
                                  ({form.entityPhone})
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#f1f5f9', color: '#334155', fontSize: '12px', fontWeight: 600 }}>
                                {stageName || '—'}
                              </span>
                              <span style={{ color: '#94a3b8' }}>/</span>
                              <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 600 }}>
                                {statusName || '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Shortlisted Properties Card */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            boxSizing: 'border-box',
                            width: '100%',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Building2 size={15} color="#ea580c" />
                              <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                                Selected Properties
                              </h4>
                            </div>
                            {selectedPropertyIds.length > 0 && (
                              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                {selectedPropertyIds.length} Linked
                              </span>
                            )}
                          </div>

                          {form.project ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
                                  <Building2 size={16} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block', wordBreak: 'break-word' }}>{form.project}</strong>
                                  {form.siteLocation && (
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px', wordBreak: 'break-word' }}>
                                      <MapPin size={10} style={{ flexShrink: 0 }} /> {form.siteLocation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                              No specific project attached to this task.
                            </div>
                          )}

                          {/* Quick WhatsApp Share Action Box */}
                          {form.project && (
                            <div
                              style={{
                                marginTop: '12px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                border: '1px solid #bbf7d0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={16} color="#16a34a" />
                                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#14532d' }}>
                                  Share on WhatsApp
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const entityDisplayName = form.entityName || (form.entityRef ? form.entityRef.replace(/\s*\([^)]*\)\s*$/, '') : 'Sir/Madam');
                                  const text = `Hello ${entityDisplayName},\n\nHere are the shortlisted property details from Resale Expert:\n🏢 *Project:* ${form.project}${form.siteLocation ? `\n📍 *Location:* ${form.siteLocation}` : ''}\n\nPlease let us know if you'd like to schedule a site visit.\n\nThank you!`;
                                  const cleanPhone = (form.entityPhone || '').replace(/[^0-9]/g, '');
                                  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                                  if (finalPhone) {
                                    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
                                  } else {
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                  }
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  fontWeight: 600,
                                  fontSize: '11.5px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                                }}
                              >
                                <MessageSquare size={12} /> Send Now
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Review Column: Schedule, Assignee & Remark */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
                        {/* Task Schedule & Priority Card */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            boxSizing: 'border-box',
                            width: '100%',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                            <Calendar size={15} color="#f97316" />
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                              Schedule & Priority
                            </h4>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Follow-up Type & Action */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Type</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 600 }}>
                                  {(() => {
                                    const Icon = getIcon((fuType as any)?.icon_name || fuType?.icon, fuType?.code);
                                    return <Icon size={13} />;
                                  })()}
                                  {fuType?.name ?? form.followUpTypeCode}
                                </span>
                                {form.nextActionOverride && (
                                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 600 }}>
                                    {master.nextActions.find((a) => a.code === form.nextActionOverride)?.name ?? form.nextActionOverride}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Scheduled Date & Time */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date & Time</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f172a', fontWeight: 700, background: '#fff7ed', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fed7aa', flexWrap: 'wrap' }}>
                                <Calendar size={13} color="#ea580c" />
                                <span>{form.scheduleDateOverride || form.date}</span>
                                <span style={{ color: '#ea580c' }}>at</span>
                                <span>{form.scheduleTimeOverride || form.time}</span>
                              </div>
                            </div>

                            {/* Priority */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Priority</span>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '3px 10px',
                                  borderRadius: '9999px',
                                  background: form.priorityCode === 'URGENT' ? '#fef2f2' : form.priorityCode === 'HIGH' ? '#fff7ed' : form.priorityCode === 'MEDIUM' ? '#fefce8' : '#f0fdf4',
                                  color: form.priorityCode === 'URGENT' ? '#b91c1c' : form.priorityCode === 'HIGH' ? '#c2410c' : form.priorityCode === 'MEDIUM' ? '#a16207' : '#15803d',
                                  border: form.priorityCode === 'URGENT' ? '1px solid #fecaca' : form.priorityCode === 'HIGH' ? '1px solid #fed7aa' : form.priorityCode === 'MEDIUM' ? '1px solid #fef08a' : '1px solid #bbf7d0',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: form.priorityCode === 'URGENT' ? '#ef4444' : form.priorityCode === 'HIGH' ? '#f97316' : form.priorityCode === 'MEDIUM' ? '#eab308' : '#22c55e' }} />
                                {master.priorities.find((p) => p.code === form.priorityCode)?.name ?? form.priorityCode}
                              </span>
                            </div>

                            {/* Assigned To */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assignee</span>
                              <span style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 600, wordBreak: 'break-word', textAlign: 'right' }}>
                                {form.assignedTo || 'Unassigned'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Remark Card */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                            boxSizing: 'border-box',
                            width: '100%',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <FileText size={15} color="#64748b" />
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                              Employee Remark
                            </h4>
                          </div>

                          <div
                            style={{
                              fontSize: '12.5px',
                              color: form.customRemark ? '#1e293b' : '#94a3b8',
                              background: '#f8fafc',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              lineHeight: 1.5,
                              fontStyle: form.customRemark ? 'normal' : 'italic',
                              wordBreak: 'break-word',
                            }}
                          >
                            {form.customRemark || 'No remark entered.'}
                          </div>

                          {addModeRuleHint && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                              <span>Rule: <b>{addModeRuleHint.rule_id}</b></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete zone in edit mode */}
                    {mode === 'edit' && (
                      <div className="delete-zone" style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                        {!confirmDelete ? (
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => setConfirmDelete(true)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} /> Delete this follow-up
                          </button>
                        ) : (
                          <div className="confirm-delete" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12.5px', color: '#b91c1c', fontWeight: 600 }}>Are you sure? This cannot be undone.</span>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => setConfirmDelete(false)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                color: '#475569',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => void handleDelete()}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={12} /> Yes, delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {error && (
              <div
                className="form-error"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  borderRadius: '10px',
                  border: '1.5px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '16px',
                }}
              >
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>

          <div
            className="modal-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <span className="smart-note" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>
              {mode === 'complete' ? <Zap size={14} color="#f59e0b" /> : mode === 'add' ? <Plus size={14} color="#3b82f6" /> : <Check size={14} color="#22c55e" />}
              {mode === 'complete'
                ? 'Rules auto-fill the next step'
                : mode === 'add'
                  ? (addWizardStep === 3 ? 'Step 3: Review & create follow-up' : addWizardStep === 2 ? 'Step 2: Add details & properties' : 'Step 1: Choose entity & stage')
                  : (addWizardStep === 3 ? 'Step 3: Review & save changes' : addWizardStep === 2 ? 'Step 2: Modify details & schedule' : 'Step 1: Choose entity & stage')}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Add / Edit Mode Buttons */}
              {(mode === 'add' || mode === 'edit') && (
                <>
                  {addWizardStep === 1 ? (
                    <>
                      <button
                        key="btn-step1-cancel"
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        key="btn-step1-next"
                        type="button"
                        className="primary-button"
                        onClick={() => setAddWizardStep(2)}
                        disabled={!form.stageCode || !form.statusCode}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 22px',
                          borderRadius: '10px',
                          background: !form.stageCode || !form.statusCode ? '#e2e8f0' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: !form.stageCode || !form.statusCode ? '#94a3b8' : '#fff',
                          border: 'none',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: !form.stageCode || !form.statusCode ? 'not-allowed' : 'pointer',
                          boxShadow: !form.stageCode || !form.statusCode ? 'none' : '0 4px 12px rgba(249, 115, 22, 0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Continue <ArrowRight size={15} />
                      </button>
                    </>
                  ) : addWizardStep === 2 ? (
                    <>
                      <button
                        key="btn-step2-back"
                        type="button"
                        className="secondary-button"
                        onClick={() => setAddWizardStep(1)}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Back
                      </button>
                      <button
                        key="btn-step2-next"
                        type="button"
                        className="primary-button"
                        onClick={() => setAddWizardStep(3)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 22px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: '#fff',
                          border: 'none',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Review & Confirm <ArrowRight size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        key="btn-step3-back"
                        type="button"
                        className="secondary-button"
                        onClick={() => setAddWizardStep(2)}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Back
                      </button>
                      <button
                        key="btn-step3-save"
                        type="button"
                        className="primary-button"
                        onClick={(e) => {
                          e.preventDefault();
                          void handleSubmit(e);
                        }}
                        disabled={isSaving}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '9px 24px',
                          borderRadius: '10px',
                          background: isSaving ? '#e2e8f0' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: isSaving ? '#94a3b8' : '#fff',
                          border: 'none',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                          boxShadow: isSaving ? 'none' : '0 4px 12px rgba(249, 115, 22, 0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Check size={16} /> {isSaving ? 'Saving...' : submitLabelMap[mode]}
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Complete Mode Buttons */}
              {mode === 'complete' && (
                <>
                  {wizardStep === 1 ? (
                    <>
                      <button
                        key="btn-comp1-cancel"
                        type="button"
                        className="secondary-button"
                        onClick={onClose}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        key="btn-comp1-next"
                        type="button"
                        className="primary-button"
                        onClick={() => setWizardStep(showReasons ? 2 : 3)}
                        disabled={Boolean(fuType?.requires_outcome && !form.outcomeCode)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 22px',
                          borderRadius: '10px',
                          background: fuType?.requires_outcome && !form.outcomeCode ? '#e2e8f0' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: fuType?.requires_outcome && !form.outcomeCode ? '#94a3b8' : '#fff',
                          border: 'none',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: fuType?.requires_outcome && !form.outcomeCode ? 'not-allowed' : 'pointer',
                          boxShadow: fuType?.requires_outcome && !form.outcomeCode ? 'none' : '0 4px 12px rgba(249, 115, 22, 0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Continue <ArrowRight size={15} />
                      </button>
                    </>
                  ) : wizardStep === 2 ? (
                    <>
                      <button
                        key="btn-comp2-back"
                        type="button"
                        className="secondary-button"
                        onClick={() => setWizardStep(1)}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Back
                      </button>
                      <button
                        key="btn-comp2-next"
                        type="button"
                        className="primary-button"
                        onClick={() => setWizardStep(3)}
                        disabled={Boolean(reasonRequired && !form.reasonCode)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 22px',
                          borderRadius: '10px',
                          background: reasonRequired && !form.reasonCode ? '#e2e8f0' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: reasonRequired && !form.reasonCode ? '#94a3b8' : '#fff',
                          border: 'none',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: reasonRequired && !form.reasonCode ? 'not-allowed' : 'pointer',
                          boxShadow: reasonRequired && !form.reasonCode ? 'none' : '0 4px 12px rgba(249, 115, 22, 0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Review & Confirm <ArrowRight size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        key="btn-comp3-back"
                        type="button"
                        className="secondary-button"
                        onClick={() => setWizardStep(showReasons ? 2 : 1)}
                        style={{
                          padding: '9px 20px',
                          borderRadius: '10px',
                          border: '1.5px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#475569',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Back
                      </button>
                      <button
                        key="btn-comp3-save"
                        type="button"
                        className="primary-button"
                        onClick={(e) => {
                          e.preventDefault();
                          void handleSubmit(e);
                        }}
                        disabled={isSaving}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '9px 24px',
                          borderRadius: '10px',
                          background: isSaving ? '#e2e8f0' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: isSaving ? '#94a3b8' : '#fff',
                          border: 'none',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                          boxShadow: isSaving ? 'none' : '0 4px 12px rgba(249, 115, 22, 0.3)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Check size={16} /> {isSaving ? 'Saving...' : submitLabelMap[mode]}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FollowUpModal;