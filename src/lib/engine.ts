import type {
  MasterData,
  Rule,
  SequenceStep,
  NewFollowUp,
  FollowUp,
  StageStatusSuggestion,
  NextAction,
  AutomationJob,
  Team,
  TeamMember,
} from './types';
import { followUpMasterAPI } from './followUpMasterAPI';
import { api } from './api';

const STORAGE_KEY = 'fu_master_data_v3';
const FOLLOW_UPS_STORAGE_KEY = 'fu_follow_ups_data';
const AUTOMATION_JOBS_KEY = 'fu_automation_jobs_data';

export const defaultSequences: SequenceStep[] = [];

export const defaultMasterData: MasterData = {
  entities: [],
  followUpTypes: [],
  stages: [],
  statuses: [],
  outcomes: [],
  reasons: [],
  nextActions: [],
  priorities: [],
  rules: [],
  sequences: [],
  automationJobs: [],
  teams: [],
  teamMembers: [],
};

function getStorageMasterData(): MasterData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMasterData));
      return defaultMasterData;
    }
    const parsed = JSON.parse(raw) as Partial<MasterData>;

    const data: MasterData = {
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      followUpTypes: Array.isArray(parsed.followUpTypes) ? parsed.followUpTypes : [],
      stages: Array.isArray(parsed.stages) ? parsed.stages : [],
      statuses: Array.isArray(parsed.statuses) ? parsed.statuses : [],
      outcomes: Array.isArray(parsed.outcomes) ? parsed.outcomes : [],
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : [],
      priorities: Array.isArray(parsed.priorities) ? parsed.priorities : [],
      rules: Array.isArray(parsed.rules) ? parsed.rules : [],
      sequences: Array.isArray(parsed.sequences) ? parsed.sequences : [],
      automationJobs: Array.isArray(parsed.automationJobs) ? parsed.automationJobs : [],
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      teamMembers: Array.isArray(parsed.teamMembers) ? parsed.teamMembers : [],
    };
    return data;
  } catch {
    return defaultMasterData;
  }
}

function saveStorageMasterData(data: MasterData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save master data', err);
  }
}

export async function loadMasterData(): Promise<MasterData> {
  const localData = getStorageMasterData();
  try {
    const backendData = await followUpMasterAPI.getAllMasterData();
    if (backendData && backendData.entities && backendData.entities.length > 0) {
      const merged: MasterData = {
        entities: backendData.entities.length > 0 ? backendData.entities : localData.entities,
        followUpTypes: backendData.followUpTypes && backendData.followUpTypes.length > 0 ? backendData.followUpTypes : localData.followUpTypes,
        stages: backendData.stages && backendData.stages.length > 0 ? backendData.stages : localData.stages,
        statuses: backendData.statuses && backendData.statuses.length > 0 ? backendData.statuses : localData.statuses,
        outcomes: backendData.outcomes && backendData.outcomes.length > 0 ? backendData.outcomes : localData.outcomes,
        reasons: backendData.reasons && backendData.reasons.length > 0 ? backendData.reasons : localData.reasons,
        nextActions: backendData.nextActions && backendData.nextActions.length > 0 ? backendData.nextActions : localData.nextActions,
        priorities: backendData.priorities && backendData.priorities.length > 0 ? backendData.priorities : localData.priorities,
        rules: backendData.rules && backendData.rules.length > 0 ? backendData.rules : localData.rules,
        sequences: backendData.sequences && backendData.sequences.length > 0 ? backendData.sequences : localData.sequences,
        automationJobs: backendData.automationJobs && backendData.automationJobs.length > 0 ? backendData.automationJobs : localData.automationJobs,
        teams: backendData.teams && backendData.teams.length > 0 ? backendData.teams : localData.teams,
        teamMembers: backendData.teamMembers && backendData.teamMembers.length > 0 ? backendData.teamMembers : localData.teamMembers,
      };
      saveStorageMasterData(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Backend loadMasterData failed, using local:', err);
  }
  return localData;
}

export type RuleMatchInput = {
  entityCode: string;
  followUpTypeCode: string;
  currentStageCode: string;
  currentStatusCode: string;
  outcomeCode: string;
  reasonCode: string | null;
};

/**
 * Deterministic rule matcher with cascading fallback.
 */
export function matchRule(rules: Rule[], input: RuleMatchInput): Rule | null {
  const { entityCode, followUpTypeCode, currentStageCode, currentStatusCode, outcomeCode, reasonCode } = input;

  // 1. Exact match including reason
  if (reasonCode) {
    const exact = rules.find(
      (r) =>
        r.entity_code === entityCode &&
        r.follow_up_type_code === followUpTypeCode &&
        r.current_stage_code === currentStageCode &&
        r.current_status_code === currentStatusCode &&
        r.outcome_code === outcomeCode &&
        r.reason_code === reasonCode,
    );
    if (exact) return exact;
  }

  // 2. Same stage/status/type + outcome, generic reason
  const stageStatusMatch = rules.find(
    (r) =>
      r.entity_code === entityCode &&
      r.follow_up_type_code === followUpTypeCode &&
      r.current_stage_code === currentStageCode &&
      r.current_status_code === currentStatusCode &&
      r.outcome_code === outcomeCode &&
      r.reason_code === null,
  );
  if (stageStatusMatch) return stageStatusMatch;

  // 3. Catch-all: entity + type + outcome, ignoring stage/status
  const catchAll = rules.find(
    (r) =>
      r.is_catch_all &&
      r.entity_code === entityCode &&
      r.follow_up_type_code === followUpTypeCode &&
      r.outcome_code === outcomeCode,
  );
  if (catchAll) return catchAll;

  // 4. Entity + outcome, ignoring type/stage/status, reason IS NULL
  const entityOutcome = rules.find(
    (r) =>
      r.entity_code === entityCode &&
      r.outcome_code === outcomeCode &&
      r.reason_code === null &&
      !r.is_catch_all,
  );
  if (entityOutcome) return entityOutcome;

  return null;
}

/**
 * Generate a sensible default next step when no rule matches at all.
 */
export function generateDefaultNextStep(
  master: MasterData,
  entityCode: string,
  followUpTypeCode: string,
  currentStageCode: string,
  currentStatusCode: string,
): { stageCode: string; statusCode: string; actionCode: string; typeCode: string; priorityCode: string; days: number; time: string; terminal: boolean } {
  const stages = master.stages.filter((s) => s.entity_code === entityCode && s.is_active).sort((a, b) => a.display_order - b.display_order);
  const statuses = master.statuses.filter((s) => s.entity_code === entityCode && s.is_active).sort((a, b) => a.display_order - b.display_order);
  const currentStage = stages.find((s) => s.code === currentStageCode);
  const nextStage = stages.find((s) => s.display_order > (currentStage?.display_order ?? 0) && !s.is_terminal) ?? stages.find((s) => !s.is_terminal) ?? stages[0];
  const firstStatus = statuses[0];
  const fuType = master.followUpTypes.find((t) => t.code === followUpTypeCode);

  return {
    stageCode: nextStage?.code ?? currentStageCode,
    statusCode: firstStatus?.code ?? currentStatusCode,
    actionCode: 'FOLLOW_UP',
    typeCode: fuType?.creates_next_task ? followUpTypeCode : 'CALL',
    priorityCode: 'MEDIUM',
    days: 1,
    time: '11:00',
    terminal: false,
  };
}

/**
 * Resolve message template placeholders.
 */
export function resolveMessageTemplate(
  template: string,
  context: { entityRef?: string | null; project?: string | null; date?: string; time?: string; stage?: string; status?: string },
): string {
  return template
    .replace(/\{\{entity_ref\}\}/g, context.entityRef ?? '')
    .replace(/\{\{project\}\}/g, context.project ?? '')
    .replace(/\{\{date\}\}/g, context.date ?? '')
    .replace(/\{\{time\}\}/g, context.time ?? '')
    .replace(/\{\{stage\}\}/g, context.stage ?? '')
    .replace(/\{\{status\}\}/g, context.status ?? '');
}

/**
 * Create automation jobs for a completed follow-up based on the matched rule.
 */
export async function createAutomationJobs(
  rule: Rule,
  followUpId: string | null,
  entityCode: string,
  entityRef: string | null,
  priorityCode: string,
  context: { project?: string | null; date?: string; time?: string; stage?: string; status?: string },
): Promise<AutomationJob[]> {
  const jobs: AutomationJob[] = [];
  const scheduledAt = new Date().toISOString();

  const isEmail = Boolean(rule.auto_email || (rule as any).auto_send_channel === 'EMAIL');
  const isWhatsApp = Boolean(rule.auto_whatsapp || (rule as any).auto_send_channel === 'WHATSAPP');
  const isMessage = Boolean(rule.auto_message || (rule as any).auto_send_channel === 'SMS' || (rule as any).auto_send_channel === 'MESSAGE');

  const body = rule.message_body || (rule as any).auto_remark_template || (rule as any).remark || '';
  const subject = rule.message_subject || null;
  const ruleId = rule.rule_id || rule.id || (rule as any).name || null;

  if (isEmail) {
    jobs.push({
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      follow_up_id: followUpId,
      entity_code: entityCode,
      entity_ref: entityRef,
      channel: 'EMAIL',
      subject: subject ? resolveMessageTemplate(subject, context) : null,
      body: body ? resolveMessageTemplate(body, context) : '',
      status: 'PENDING',
      priority_code: priorityCode,
      scheduled_at: scheduledAt,
      sent_at: null,
      error_message: null,
      rule_id: ruleId,
      created_at: new Date().toISOString(),
    });
  }
  if (isWhatsApp) {
    jobs.push({
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      follow_up_id: followUpId,
      entity_code: entityCode,
      entity_ref: entityRef,
      channel: 'WHATSAPP',
      subject: null,
      body: body ? resolveMessageTemplate(body, context) : '',
      status: 'PENDING',
      priority_code: priorityCode,
      scheduled_at: scheduledAt,
      sent_at: null,
      error_message: null,
      rule_id: ruleId,
      created_at: new Date().toISOString(),
    });
  }
  if (isMessage) {
    jobs.push({
      id: 'job_' + Math.random().toString(36).slice(2, 10),
      follow_up_id: followUpId,
      entity_code: entityCode,
      entity_ref: entityRef,
      channel: 'MESSAGE',
      subject: null,
      body: body ? resolveMessageTemplate(body, context) : '',
      status: 'PENDING',
      priority_code: priorityCode,
      scheduled_at: scheduledAt,
      sent_at: null,
      error_message: null,
      rule_id: ruleId,
      created_at: new Date().toISOString(),
    });
  }

  if (jobs.length === 0) return [];
  try {
    const raw = localStorage.getItem(AUTOMATION_JOBS_KEY);
    const existing = raw ? (JSON.parse(raw) as AutomationJob[]) : [];
    const updated = [...jobs, ...existing];
    localStorage.setItem(AUTOMATION_JOBS_KEY, JSON.stringify(updated));

    // Persist each job to MySQL fu_automation_jobs table
    for (const job of jobs) {
      const phoneMatch = entityRef?.match(/\(([^)]+)\)/);
      const phone = phoneMatch ? phoneMatch[1] : '';
      void followUpMasterAPI.upsertItem('fu_automation_jobs', {
        id: job.id,
        channel: job.channel,
        recipient_phone: phone || null,
        recipient_email: null,
        template_id: null,
        payload: {
          subject: job.subject,
          body: job.body,
          entity_ref: entityRef,
          ...context,
        },
        status: 'PENDING',
        scheduled_for: scheduledAt,
        entity_code: entityCode,
        entity_id: followUpId,
        rule_id: ruleId,
      });
    }
  } catch (err) {
    console.error('createAutomationJobs error', err);
  }
  return jobs;
}

/**
 * Load all automation jobs, ordered by most recent first.
 */
export async function loadAutomationJobs(): Promise<AutomationJob[]> {
  try {
    try {
      const serverRows = await followUpMasterAPI.getTableData('fu_automation_jobs');
      if (serverRows && Array.isArray(serverRows) && serverRows.length > 0) {
        const mapped: AutomationJob[] = serverRows.map((r: any) => {
          const payload = typeof r.payload === 'string' ? JSON.parse(r.payload || '{}') : (r.payload || {});
          return {
            id: r.id,
            follow_up_id: r.entity_id || null,
            entity_code: r.entity_code || 'LEAD',
            entity_ref: payload.entity_ref || null,
            channel: r.channel || 'WHATSAPP',
            subject: payload.subject || null,
            body: payload.body || '',
            status: r.status || 'PENDING',
            priority_code: r.priority_code || 'MEDIUM',
            scheduled_at: r.scheduled_for || r.created_at || new Date().toISOString(),
            sent_at: r.sent_at || null,
            error_message: r.error_message || null,
            rule_id: r.rule_id || null,
            created_at: r.created_at || new Date().toISOString(),
          };
        });
        localStorage.setItem(AUTOMATION_JOBS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (apiErr) {
      console.warn('Could not fetch automation jobs from backend:', apiErr);
    }
    const raw = localStorage.getItem(AUTOMATION_JOBS_KEY);
    return raw ? (JSON.parse(raw) as AutomationJob[]) : [];
  } catch (err) {
    console.error('loadAutomationJobs error', err);
    return [];
  }
}

/**
 * Compute the next scheduled date/time.
 */
export function computeNextSchedule(
  baseDate: Date,
  days: number,
  hours: number,
  defaultTime: string,
): { date: string; time: string } {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  next.setHours(next.getHours() + hours);
  const date = next.toISOString().slice(0, 10);
  const time = defaultTime || '11:00';
  return { date, time };
}

/**
 * Get the sequence step for the NEXT follow-up.
 */
export function getSequenceStep(
  sequences: SequenceStep[],
  sequenceName: string,
  currentAttempt: number,
): SequenceStep | null {
  const steps = sequences
    .filter((s) => s.sequence_name === sequenceName)
    .sort((a, b) => a.step - b.step);

  if (currentAttempt >= 3) {
    const termStep = steps.find((s) => s.terminal_step) || steps[steps.length - 1];
    if (termStep) {
      return {
        ...termStep,
        action_code: 'CLOSE',
        next_status_code: 'LOST',
        terminal_step: true,
      };
    }
    return {
      id: 'term_3_auto_lost',
      sequence_name: sequenceName,
      step: 3,
      after_days: 0,
      after_hours: 0,
      action_code: 'CLOSE',
      follow_up_type_code: 'CALL',
      priority_code: 'LOW',
      terminal_step: true,
      next_status_code: 'LOST',
      reason_code: null,
      is_active: true,
    };
  }

  const nextStepNumber = currentAttempt;
  return steps.find((s) => s.step === nextStepNumber) ?? null;
}

export async function createFollowUp(record: NewFollowUp): Promise<FollowUp | null> {
  try {
    const raw = localStorage.getItem(FOLLOW_UPS_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FollowUp[]) : [];

    let created: FollowUp;
    try {
      const resp = await api.post('/followups/create', record);
      created = resp.data?.data || resp.data;
    } catch {
      const id = 'fu_' + Math.random().toString(36).slice(2, 10);
      const now = new Date().toISOString();
      created = {
        ...record,
        id,
        ai_generated: record.ai_generated ?? false,
        ai_action_type: record.ai_action_type ?? null,
        ai_metadata: record.ai_metadata ?? null,
        ai_processed_at: record.ai_processed_at ?? null,
        assigned_to: record.assigned_to ?? null,
        due_date: record.due_date ?? null,
        due_time: record.due_time ?? null,
        created_at: now,
        updated_at: now,
      };
    }

    list.unshift(created);
    localStorage.setItem(FOLLOW_UPS_STORAGE_KEY, JSON.stringify(list));
    return created;
  } catch (error) {
    console.error('createFollowUp error', error);
    return null;
  }
}

export async function completeFollowUp(
  id: string,
  patch: Partial<FollowUp>,
): Promise<FollowUp | null> {
  try {
    try {
      await api.post(`/followups/complete/${id}`, patch);
    } catch (err) {
      console.warn('Backend complete error:', err);
    }
    const raw = localStorage.getItem(FOLLOW_UPS_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FollowUp[]) : [];
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    const updated: FollowUp = {
      ...list[index],
      ...patch,
      is_complete: true,
      completed_at: now,
      updated_at: now,
    };
    list[index] = updated;
    localStorage.setItem(FOLLOW_UPS_STORAGE_KEY, JSON.stringify(list));
    return updated;
  } catch (error) {
    console.error('completeFollowUp error', error);
    return null;
  }
}

export async function deleteFollowUp(id: string): Promise<boolean> {
  try {
    try {
      await api.delete(`/followups/delete/${id}`);
    } catch (err) {
      console.warn('Backend delete error:', err);
    }
    const raw = localStorage.getItem(FOLLOW_UPS_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FollowUp[]) : [];
    const filtered = list.filter((f) => f.id !== id);
    localStorage.setItem(FOLLOW_UPS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('deleteFollowUp error', error);
    return false;
  }
}

export async function updateFollowUp(id: string, patch: Partial<FollowUp>): Promise<FollowUp | null> {
  try {
    try {
      await api.put(`/followups/update/${id}`, patch);
    } catch (err) {
      console.warn('Backend update error:', err);
    }
    const raw = localStorage.getItem(FOLLOW_UPS_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FollowUp[]) : [];
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) return null;
    const updated: FollowUp = {
      ...list[index],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    list[index] = updated;
    localStorage.setItem(FOLLOW_UPS_STORAGE_KEY, JSON.stringify(list));
    return updated;
  } catch (error) {
    console.error('updateFollowUp error', error);
    return null;
  }
}

// ===== Master CRUD =====

const tableToMasterKey: Record<string, keyof MasterData> = {
  fu_entities: 'entities',
  fu_follow_up_types: 'followUpTypes',
  fu_stages: 'stages',
  fu_statuses: 'statuses',
  fu_outcomes: 'outcomes',
  fu_reasons: 'reasons',
  fu_next_actions: 'nextActions',
  fu_priorities: 'priorities',
  fu_rules: 'rules',
  fu_sequences: 'sequences',
  fu_teams: 'teams',
  fu_team_members: 'teamMembers',
};

export async function upsertMaster(table: string, record: Record<string, unknown>): Promise<unknown | null> {
  try {
    const apiResult = await followUpMasterAPI.upsertItem(table, record);
    const data = getStorageMasterData();
    const key = tableToMasterKey[table];
    if (!key || !Array.isArray(data[key])) return apiResult || null;

    const list = data[key] as Record<string, unknown>[];
    const recId = (record.id as string) || (apiResult?.id as string) || ('id_' + Math.random().toString(36).slice(2, 10));
    const newRecord = {
      ...record,
      ...(typeof apiResult === 'object' && apiResult !== null ? apiResult : {}),
      id: recId,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const existingIndex = list.findIndex((r) => r.id === recId);
    if (existingIndex >= 0) {
      list[existingIndex] = newRecord;
    } else {
      list.push(newRecord);
    }
    saveStorageMasterData(data);
    return newRecord;
  } catch (error) {
    console.error('upsertMaster error', error);
    return null;
  }
}

export async function updateMaster(table: string, id: string, patch: Record<string, unknown>): Promise<unknown | null> {
  try {
    await followUpMasterAPI.updateItem(table, id, patch);
    const data = getStorageMasterData();
    const key = tableToMasterKey[table];
    if (!key || !Array.isArray(data[key])) return null;

    const list = data[key] as Record<string, unknown>[];
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated = {
      ...list[index],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    list[index] = updated;
    saveStorageMasterData(data);
    return updated;
  } catch (error) {
    console.error('updateMaster error', error);
    return null;
  }
}

export async function deleteMaster(table: string, id: string): Promise<boolean> {
  try {
    await followUpMasterAPI.deleteItem(table, id);
    const data = getStorageMasterData();
    const key = tableToMasterKey[table];
    if (!key || !Array.isArray(data[key])) return false;

    const list = data[key] as Record<string, unknown>[];
    const filtered = list.filter((r) => r.id !== id);
    (data as Record<string, unknown>)[key] = filtered;
    saveStorageMasterData(data);
    return true;
  } catch (error) {
    console.error('deleteMaster error', error);
    return false;
  }
}

export async function loadFollowUps(): Promise<FollowUp[]> {
  try {
    try {
      const resp = await api.get('/followups/get-all');
      if (resp.data?.data && Array.isArray(resp.data.data)) {
        const list = resp.data.data as FollowUp[];
        localStorage.setItem(FOLLOW_UPS_STORAGE_KEY, JSON.stringify(list));
        return list;
      }
    } catch (apiErr) {
      console.warn('Backend loadFollowUps failed, fallback to local storage:', apiErr);
    }
    const raw = localStorage.getItem(FOLLOW_UPS_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FollowUp[]) : [];
    return list.sort((a, b) => {
      const cmpDate = (a.scheduled_date || '').localeCompare(b.scheduled_date || '');
      if (cmpDate !== 0) return cmpDate;
      return (a.scheduled_time || '').localeCompare(b.scheduled_time || '');
    });
  } catch (error) {
    console.error('loadFollowUps error', error);
    return [];
  }
}

/**
 * Smart Time Slot Optimizer:
 * Alternates follow-up calling windows so customers aren't called at the same unavailable time twice.
 * - If last call was Morning/Noon (e.g., 10am - 1pm / 12pm), schedule next call in the Evening (05:00 PM / 17:00).
 * - If last call was Evening (e.g., 2pm - 7pm / 5pm), schedule next call in the Morning/Noon (11:30 AM / 11:30).
 */
export function getSmartAlternatingTime(
  currentAttempt: number,
  lastTimeOrNow?: string | null,
  defaultRuleTime?: string | null,
): string {
  let hour = 11;
  if (lastTimeOrNow) {
    const s = String(lastTimeOrNow).trim();
    const timeMatch = s.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hour = Number(timeMatch[1]);
      if (/pm/i.test(s) && hour < 12) hour += 12;
      if (/am/i.test(s) && hour === 12) hour = 0;
    }
  } else {
    hour = new Date().getHours();
  }

  // If called in morning/afternoon (before 2 PM / 14:00, e.g. 11am or 12pm) -> Next attempt schedules for 5:00 PM (17:00)
  if (hour < 14) {
    return '17:00'; // 5:00 PM Evening Slot
  }

  // If called in evening (2 PM / 14:00 or later) -> Next attempt schedules for 11:30 AM
  return '11:30'; // 11:30 AM Morning Slot
}

export type NextStepPreview = {
  nextStageCode: string;
  nextStatusCode: string;
  nextActionCode: string;
  nextFollowUpTypeCode: string | null;
  priorityCode: string;
  scheduledDate: string;
  scheduledTime: string;
  nextAttempt: number;
  sequenceName: string | null;
  terminal: boolean;
  isSequenceTerminal: boolean;
};

export function previewNextStep(
  rule: Rule,
  sequences: SequenceStep[],
  currentAttempt: number,
  lastTime?: string | null,
): NextStepPreview | null {
  if (rule.terminal && !rule.require_follow_up && !rule.sequence_name) {
    return null;
  }

  const smartTime = getSmartAlternatingTime(currentAttempt, lastTime, rule.default_time);
  let scheduledDate: string;
  let scheduledTime: string = smartTime;
  let nextTypeCode = rule.next_follow_up_type_code ?? rule.follow_up_type_code;
  let nextActionCode = rule.next_action_code;
  let nextStatusCode = rule.next_status_code;
  let priorityCode = rule.priority_code;
  let nextAttempt = 1;
  let isSequenceTerminal = false;

  let nextStageCode = rule.next_stage_code;

  if (rule.sequence_name) {
    const step = getSequenceStep(sequences, rule.sequence_name, currentAttempt);
    if (step) {
      const sched = computeNextSchedule(new Date(), step.after_days, step.after_hours, smartTime);
      scheduledDate = sched.date;
      scheduledTime = smartTime;
      nextTypeCode = step.follow_up_type_code;
      nextActionCode = step.action_code;
      priorityCode = step.priority_code;
      nextAttempt = currentAttempt + 1;
      if (step.next_status_code) nextStatusCode = step.next_status_code;
      isSequenceTerminal = step.terminal_step;

      if (currentAttempt >= 3 || step.terminal_step) {
        nextStatusCode = 'LOST';
        nextStageCode = 'LOST';
        nextActionCode = 'CLOSE';
        isSequenceTerminal = true;
      }
    } else {
      return null;
    }
  } else {
    const sched = computeNextSchedule(new Date(), rule.default_days, 0, smartTime);
    scheduledDate = sched.date;
    scheduledTime = smartTime;
  }

  return {
    nextStageCode,
    nextStatusCode,
    nextActionCode: nextActionCode,
    nextFollowUpTypeCode: nextTypeCode,
    priorityCode,
    scheduledDate,
    scheduledTime,
    nextAttempt,
    sequenceName: rule.sequence_name,
    terminal: rule.terminal || isSequenceTerminal,
    isSequenceTerminal,
  };
}

export function buildNextFollowUp(
  rule: Rule,
  sequences: SequenceStep[],
  currentAttempt: number,
  entityRef: string | null,
  customRemark: string | null,
  extra: { project?: string; siteLocation?: string; participants?: string; messageTemplate?: string; lastTime?: string | null } = {},
): NewFollowUp | null {
  const preview = previewNextStep(rule, sequences, currentAttempt, extra.lastTime);
  if (!preview) return null;

  if (preview.isSequenceTerminal) {
    return {
      entity_code: rule.entity_code,
      entity_ref: entityRef,
      follow_up_type_code: preview.nextFollowUpTypeCode ?? rule.follow_up_type_code,
      stage_code: preview.nextStageCode,
      status_code: preview.nextStatusCode,
      outcome_code: null,
      reason_code: null,
      next_action_code: preview.nextActionCode,
      next_follow_up_type_code: null,
      priority_code: preview.priorityCode,
      scheduled_date: preview.scheduledDate,
      scheduled_time: preview.scheduledTime,
      attempt_no: preview.nextAttempt,
      sequence_name: null,
      is_complete: false,
      completed_at: null,
      terminal: true,
      custom_remark: customRemark,
      project: extra.project ?? null,
      site_location: extra.siteLocation ?? null,
      participants: extra.participants ?? null,
      message_template: extra.messageTemplate ?? null,
      rule_snapshot: rule as unknown as Record<string, unknown>,
      ai_generated: false,
    };
  }

  return {
    entity_code: rule.entity_code,
    entity_ref: entityRef,
    follow_up_type_code: preview.nextFollowUpTypeCode ?? rule.follow_up_type_code,
    stage_code: preview.nextStageCode,
    status_code: preview.nextStatusCode,
    outcome_code: null,
    reason_code: null,
    next_action_code: preview.nextActionCode,
    next_follow_up_type_code: null,
    priority_code: preview.priorityCode,
    scheduled_date: preview.scheduledDate,
    scheduled_time: preview.scheduledTime,
    attempt_no: preview.nextAttempt,
    sequence_name: preview.sequenceName,
    is_complete: false,
    completed_at: null,
    terminal: preview.terminal,
    custom_remark: customRemark,
    project: extra.project ?? null,
    site_location: extra.siteLocation ?? null,
    participants: extra.participants ?? null,
    message_template: extra.messageTemplate ?? null,
    rule_snapshot: rule as unknown as Record<string, unknown>,
    ai_generated: false,
  };
}

export function suggestStageStatus(
  rules: Rule[],
  stages: MasterData['stages'],
  statuses: MasterData['statuses'],
  entityCode: string,
  followUpTypeCode: string,
  actionCode?: string,
): StageStatusSuggestion | null {
  const activeStages = new Set(
    stages.filter((s) => s.entity_code === entityCode && s.is_active).map((s) => s.code)
  );
  const activeStatuses = new Set(
    statuses.filter((s) => s.entity_code === entityCode && s.is_active).map((s) => s.code)
  );

  // 1. Explicit Action Intent Overrides
  if (actionCode === 'CLOSE') {
    const closedStage =
      stages.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'CLOSED' || s.code === 'CLOSE')) ||
      stages.find((s) => s.entity_code === entityCode && s.is_active && s.code === 'LOST');
    const closedStatus =
      statuses.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'CLOSED' || s.code === 'CLOSE')) ||
      statuses.find((s) => s.entity_code === entityCode && s.is_active && s.code === 'LOST');

    if (closedStage && closedStatus) {
      return {
        stageCode: closedStage.code,
        statusCode: closedStatus.code,
        source: 'rule',
        ruleId: 'CLOSE_INTENT',
        confidence: 'high',
        reason: `Close Lead action automatically sets Stage to Closed and Status to Closed on ${entityCode}`,
      };
    }
  }

  if (actionCode === 'NOT_INTERESTED' || actionCode === 'DROP') {
    const lostStage = stages.find((s) => s.entity_code === entityCode && s.is_active && s.code === 'LOST') || stages.find((s) => s.is_terminal);
    const lostStatus = statuses.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'NOT_INTERESTED' || s.code === 'LOST')) || statuses.find((s) => s.code === 'LOST');
    if (lostStage && lostStatus) {
      return {
        stageCode: lostStage.code,
        statusCode: lostStatus.code,
        source: 'rule',
        ruleId: 'NOT_INTERESTED_INTENT',
        confidence: 'high',
        reason: `Not Interested action automatically sets Stage to Lost and Status to Not Interested on ${entityCode}`,
      };
    }
  }

  if (actionCode === 'SCHEDULE_SITE_VISIT' || actionCode === 'SCHEDULE_SECOND_VISIT' || actionCode === 'SITE_VISIT') {
    const visitStage = stages.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'SITE_VISIT' || s.code === 'VISIT' || s.code === 'QUALIFIED'));
    const visitStatus = statuses.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'SCHEDULED' || s.code === 'IN_PROGRESS' || s.code === 'HOT'));
    if (visitStage && visitStatus) {
      return {
        stageCode: visitStage.code,
        statusCode: visitStatus.code,
        source: 'rule',
        ruleId: 'SITE_VISIT_INTENT',
        confidence: 'high',
        reason: `Schedule Site Visit action automatically sets Stage to ${visitStage.name} and Status to ${visitStatus.name}`,
      };
    }
  }

  if (actionCode === 'OFFICE_MEETING' || actionCode === 'MEETING') {
    const meetStage = stages.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'MEETING' || s.code === 'QUALIFIED' || s.code === 'NEGOTIATION'));
    const meetStatus = statuses.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'SCHEDULED' || s.code === 'IN_PROGRESS'));
    if (meetStage && meetStatus) {
      return {
        stageCode: meetStage.code,
        statusCode: meetStatus.code,
        source: 'rule',
        ruleId: 'MEETING_INTENT',
        confidence: 'high',
        reason: `Meeting action automatically sets Stage to ${meetStage.name} and Status to ${meetStatus.name}`,
      };
    }
  }

  if (actionCode === 'SEND_BROCHURE' || actionCode === 'SHARE_DETAILS' || actionCode === 'LOCATION_SHARED' || actionCode === 'BROCHURE_SENT') {
    const detailStage = stages.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'IN_PROGRESS' || s.code === 'NEW' || s.code === 'QUALIFIED'));
    const detailStatus = statuses.find((s) => s.entity_code === entityCode && s.is_active && (s.code === 'DETAILS_SENT' || s.code === 'IN_PROGRESS'));
    if (detailStage && detailStatus) {
      return {
        stageCode: detailStage.code,
        statusCode: detailStatus.code,
        source: 'rule',
        ruleId: 'SHARE_DETAILS_INTENT',
        confidence: 'high',
        reason: `Share Details/Brochure automatically sets Status to ${detailStatus.name}`,
      };
    }
  }

  const matchingRules = rules.filter(
    (r) =>
      r.entity_code === entityCode &&
      r.follow_up_type_code === followUpTypeCode &&
      (!actionCode || r.next_action_code === actionCode),
  );

  if (matchingRules.length > 0) {
    const pairCounts = new Map<string, { stage: string; status: string; count: number; ruleId: string }>();

    for (const r of matchingRules) {
      // If actionCode is specified, prefer target next_stage_code / next_status_code
      let stage = actionCode && r.next_stage_code ? r.next_stage_code : r.current_stage_code;
      let status = actionCode && r.next_status_code ? r.next_status_code : r.current_status_code;

      // Fallback if target stage/status not active in entity
      if (!activeStages.has(stage)) stage = r.current_stage_code;
      if (!activeStatuses.has(status)) status = r.current_status_code;

      if (stage && status) {
        const key = `${stage}|${status}`;
        const existing = pairCounts.get(key);
        if (existing) {
          existing.count += 2; // boost exact match
        } else {
          pairCounts.set(key, {
            stage,
            status,
            count: 2,
            ruleId: r.rule_id || (r as any).id || '',
          });
        }
      }
    }

    let best: { stage: string; status: string; count: number; ruleId: string } | null = null;
    for (const v of pairCounts.values()) {
      if (!best || v.count > best.count) best = v;
    }

    if (best) {
      return {
        stageCode: best.stage,
        statusCode: best.status,
        source: 'rule',
        ruleId: best.ruleId,
        confidence: matchingRules.length > 2 ? 'high' : 'medium',
        reason: `${matchingRules.length} rule${matchingRules.length > 1 ? 's' : ''} expect this stage/status for ${followUpTypeCode}${actionCode ? ' → ' + actionCode : ''} on ${entityCode}`,
      };
    }
  }

  const entityStages = stages
    .filter((s) => s.entity_code === entityCode && s.is_active && !s.is_terminal)
    .sort((a, b) => a.display_order - b.display_order);
  const entityStatuses = statuses
    .filter((s) => s.entity_code === entityCode && s.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  if (entityStages.length > 0 && entityStatuses.length > 0) {
    return {
      stageCode: entityStages[0].code,
      statusCode: entityStatuses[0].code,
      source: 'default',
      ruleId: null,
      confidence: 'medium',
      reason: `No rules yet for ${followUpTypeCode}${actionCode ? ' → ' + actionCode : ''} on ${entityCode} — starting at the first stage`,
    };
  }

  return null;
}

export async function loadRemarkSuggestions(
  entityCode: string,
  followUpTypeCode: string,
  limit = 5,
): Promise<string[]> {
  try {
    const raw = localStorage.getItem(FOLLOW_UPS_STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as FollowUp[]) : [];
    const remarks = list
      .filter((r) => r.entity_code === entityCode && r.follow_up_type_code === followUpTypeCode && r.is_complete && r.custom_remark?.trim())
      .map((r) => r.custom_remark!.trim());

    const counts = new Map<string, number>();
    for (const r of remarks) {
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([r]) => r);
  } catch {
    return [];
  }
}

export function suggestPriority(
  rules: Rule[],
  entityCode: string,
  followUpTypeCode: string,
  stageCode: string,
  statusCode: string,
  actionCode?: string,
): { priorityCode: string; source: 'rule' | 'default'; reason: string } {
  const matching = rules.filter(
    (r) =>
      r.entity_code === entityCode &&
      r.follow_up_type_code === followUpTypeCode &&
      r.current_stage_code === stageCode &&
      r.current_status_code === statusCode &&
      (!actionCode || r.next_action_code === actionCode),
  );

  if (matching.length > 0) {
    const counts = new Map<string, number>();
    for (const r of matching) {
      counts.set(r.priority_code, (counts.get(r.priority_code) ?? 0) + 1);
    }
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    return {
      priorityCode: top[0],
      source: 'rule',
      reason: `${top[1]} rule${top[1] > 1 ? 's' : ''} set priority ${top[0]} for this stage/status`,
    };
  }

  const typeMatches = rules.filter(
    (r) =>
      r.entity_code === entityCode &&
      r.follow_up_type_code === followUpTypeCode &&
      (!actionCode || r.next_action_code === actionCode),
  );
  if (typeMatches.length > 0) {
    const counts = new Map<string, number>();
    for (const r of typeMatches) {
      counts.set(r.priority_code, (counts.get(r.priority_code) ?? 0) + 1);
    }
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    return {
      priorityCode: top[0],
      source: 'default',
      reason: `No exact rule — using most common priority ${top[0]} for ${followUpTypeCode} on ${entityCode}`,
    };
  }

  return {
    priorityCode: 'MEDIUM',
    source: 'default',
    reason: 'No rules matched — defaulting to MEDIUM priority',
  };
}

export function getEntityActions(
  rules: Rule[],
  nextActions: MasterData['nextActions'],
  entityCode: string,
  followUpTypeCode: string,
): NextAction[] {
  const actionCodes = new Set(
    rules
      .filter((r) => r.entity_code === entityCode && r.follow_up_type_code === followUpTypeCode)
      .map((r) => r.next_action_code),
  );
  const active = (nextActions || []).filter((a) => a.is_active);
  const rawList = actionCodes.size === 0 ? active : active.filter((a) => actionCodes.has(a.code));

  // Deduplicate by both uppercase code and lowercase trimmed name
  const seenCodes = new Set<string>();
  const seenNames = new Set<string>();

  return rawList.filter((a) => {
    const codeKey = (a.code || '').trim().toUpperCase();
    const nameKey = (a.name || '').trim().toLowerCase();

    if (codeKey && seenCodes.has(codeKey)) return false;
    if (nameKey && seenNames.has(nameKey)) return false;

    if (codeKey) seenCodes.add(codeKey);
    if (nameKey) seenNames.add(nameKey);
    return true;
  });
}

