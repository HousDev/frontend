// frontend/src/lib/automationEngineAPI.ts
// Frontend REST Service Layer for Automation Masters, Stage Outcomes Lookup, and Transactional Engine

const getBackendOrigin = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }
  return '';
};

const API_BASE = `${getBackendOrigin()}/api/automation`;

export interface StageData {
  id?: number;
  entity: string;
  name: string;
  code?: string;
  order_index?: number;
  is_initial?: boolean;
  is_terminal?: boolean;
  is_active?: boolean;
}

export interface StatusData {
  id?: number;
  entity: string;
  name: string;
  code?: string;
  is_terminal?: boolean;
  is_active?: boolean;
}

export interface OutcomeData {
  id?: number;
  entity?: string;
  stage_id: number;
  stage_name?: string;
  name: string;
  code?: string;
  is_positive?: boolean;
  is_active?: boolean;
  order_index?: number;
}

export interface RuleData {
  id?: number;
  rule_key?: string;
  name: string;
  entity: string;
  trigger_stage_id: number;
  trigger_stage_name?: string;
  trigger_status_id?: number | null;
  trigger_status_name?: string;
  condition_outcome_id: number;
  condition_outcome_name?: string;
  next_stage_id?: number | null;
  next_stage_name?: string;
  next_status_id?: number | null;
  next_status_name?: string;
  next_action?: string;
  priority?: 'Urgent' | 'High' | 'Medium' | 'Low';
  sla_hours?: number;
  max_attempts?: number | null;
  create_followup?: boolean;
  version?: string;
  rule_status?: 'Draft' | 'Published';
  execution_count?: number;
}

export interface FollowupSubmitPayload {
  entity: 'lead' | 'buyer' | 'seller';
  entityId: number | string;
  followupType: string;
  outcomeId?: number;
  outcomeName: string;
  reason?: string | null;
  notes?: string;
  currentStageId?: number | null;
  currentStatusId?: number | null;
  userId?: number | string | null;
  scheduledDate?: string | null;
  scheduledTime?: string;
}

export const automationEngineAPI = {
  // ----------------------------------------------------
  // GET GRAPH (Stages, Statuses, Outcomes, Rules for Entity)
  // ----------------------------------------------------
  getMastersGraph: async (entity = 'lead') => {
    try {
      const res = await fetch(`${API_BASE}/masters?entity=${entity}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch (err) {
      console.error('Failed to fetch masters graph:', err);
      return { stages: [], statuses: [], outcomes: [], rules: [] };
    }
  },

  // ----------------------------------------------------
  // GET DYNAMIC OUTCOMES FOR SPECIFIC STAGE
  // ----------------------------------------------------
  getOutcomesForStage: async (entity: string, stageId?: number) => {
    try {
      const query = stageId ? `stage_id=${stageId}` : `entity=${entity}`;
      const res = await fetch(`${API_BASE}/outcomes?${query}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data || [];
    } catch (err) {
      console.error('Failed to fetch outcomes for stage:', err);
      return [];
    }
  },

  // ----------------------------------------------------
  // STAGES CRUD
  // ----------------------------------------------------
  createStage: async (stage: StageData) => {
    const res = await fetch(`${API_BASE}/stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stage)
    });
    return res.json();
  },

  updateStage: async (id: number, stage: Partial<StageData>) => {
    const res = await fetch(`${API_BASE}/stages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stage)
    });
    return res.json();
  },

  deleteStage: async (id: number) => {
    const res = await fetch(`${API_BASE}/stages/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ----------------------------------------------------
  // STATUSES CRUD
  // ----------------------------------------------------
  createStatus: async (status: StatusData) => {
    const res = await fetch(`${API_BASE}/statuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status)
    });
    return res.json();
  },

  updateStatus: async (id: number, status: Partial<StatusData>) => {
    const res = await fetch(`${API_BASE}/statuses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status)
    });
    return res.json();
  },

  deleteStatus: async (id: number) => {
    const res = await fetch(`${API_BASE}/statuses/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ----------------------------------------------------
  // OUTCOMES CRUD
  // ----------------------------------------------------
  createOutcome: async (outcome: OutcomeData) => {
    const res = await fetch(`${API_BASE}/outcomes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outcome)
    });
    return res.json();
  },

  updateOutcome: async (id: number, outcome: Partial<OutcomeData>) => {
    const res = await fetch(`${API_BASE}/outcomes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outcome)
    });
    return res.json();
  },

  deleteOutcome: async (id: number) => {
    const res = await fetch(`${API_BASE}/outcomes/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ----------------------------------------------------
  // RULES CRUD
  // ----------------------------------------------------
  createRule: async (rule: RuleData) => {
    const res = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return res.json();
  },

  updateRule: async (id: number, rule: Partial<RuleData>) => {
    const res = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return res.json();
  },

  deleteRule: async (id: number) => {
    const res = await fetch(`${API_BASE}/rules/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ----------------------------------------------------
  // SUBMIT TRANSACTIONAL FOLLOW-UP
  // ----------------------------------------------------
  submitFollowup: async (payload: FollowupSubmitPayload) => {
    const res = await fetch(`${API_BASE}/followup/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // ----------------------------------------------------
  // GET TIMELINE & AUDIT HISTORY
  // ----------------------------------------------------
  getFollowupHistory: async (entity: string, entityId: number | string) => {
    try {
      const res = await fetch(`${API_BASE}/followup/history/${entity}/${entityId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    } catch (err) {
      console.error('Failed to fetch followup history:', err);
      return { followups: [], auditLogs: [] };
    }
  }
};
