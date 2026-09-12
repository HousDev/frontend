export type Entity = {
  id: string;
  code: string;
  name: string;
  display_order: number;
  is_active: boolean;
};

export type FollowUpType = {
  id: string;
  code: string;
  name: string;
  icon: string;
  requires_outcome: boolean;
  requires_date: boolean;
  requires_time: boolean;
  requires_location: boolean;
  requires_project: boolean;
  requires_participants: boolean;
  requires_template: boolean;
  creates_next_task: boolean;
  display_order: number;
  is_active: boolean;
  auto_send_enabled: boolean;
  default_message_template: string | null;
};

export type Stage = {
  id: string;
  entity_code: string;
  code: string;
  name: string;
  display_order: number;
  is_terminal: boolean;
  is_active: boolean;
};

export type Status = {
  id: string;
  entity_code: string;
  code: string;
  name: string;
  display_order: number;
  is_active: boolean;
};

export type Outcome = {
  id: string;
  follow_up_type_code: string;
  code: string;
  name: string;
  asks_reason: boolean;
  display_order: number;
  is_active: boolean;
};

export type Reason = {
  id: string;
  code: string;
  name: string;
  display_order: number;
  is_active: boolean;
};

export type NextAction = {
  id: string;
  code: string;
  name: string;
  /** Entity this action belongs to: 'BUYER' | 'SELLER' | 'LEAD' | '' (global) */
  entity_code?: string;
  /** Follow-up type restriction (e.g. 'CALL', 'VISIT') — null means applies to all types */
  follow_up_type_code?: string | null;
  /** Minimum follow-up attempt number at which this action is shown. NULL = step 1 */
  visible_from_step?: number | null;
  /** Maximum follow-up attempt number at which this action is shown. NULL = no upper limit */
  visible_to_step?: number | null;
  display_order: number;
  is_active: boolean;
};

export type Priority = {
  id: string;
  code: string;
  name: string;
  level: number;
  display_order: number;
  is_active: boolean;
};

export type Rule = {
  id: string;
  rule_id: string;
  name?: string;
  entity_code: string;
  follow_up_type_code: string;
  current_stage_code: string;
  current_status_code: string;
  outcome_code: string;
  reason_code: string | null;
  next_stage_code: string;
  next_status_code: string;
  next_action_code: string;
  next_follow_up_type_code: string | null;
  default_days: number;
  default_time: string;
  priority_code: string;
  auto_schedule: boolean;
  require_follow_up: boolean;
  terminal: boolean;
  max_attempts: number | null;
  notification: boolean;
  sequence_name: string | null;
  remark: string | null;
  display_order: number;
  is_active: boolean;
  auto_email: boolean;
  auto_whatsapp: boolean;
  auto_message: boolean;
  message_subject: string | null;
  message_body: string | null;
  is_catch_all: boolean;
};

export type SequenceStep = {
  id: string;
  sequence_name: string;
  step: number;
  after_days: number;
  after_hours: number;
  action_code: string;
  follow_up_type_code: string;
  priority_code: string;
  terminal_step: boolean;
  next_status_code: string | null;
  reason_code: string | null;
  is_active: boolean;
  channel?: string;
  delay_days?: number;
};

export type FollowUp = {
  id: string;
  entity_code: string;
  entity_id?: string | number | null;
  entity_name?: string | null;
  entity_phone?: string | null;
  entity_ref: string | null;
  follow_up_type_code: string;
  stage_code: string;
  status_code: string;
  outcome_code: string | null;
  reason_code: string | null;
  next_action_code: string | null;
  next_follow_up_type_code: string | null;
  priority_code: string;
  scheduled_date: string;
  scheduled_time: string;
  attempt_no: number;
  sequence_name: string | null;
  is_complete: boolean;
  completed_at: string | null;
  terminal: boolean;
  custom_remark: string | null;
  project: string | null;
  site_location: string | null;
  participants: string | null;
  message_template: string | null;
  rule_snapshot: Record<string, unknown> | null;
  ai_generated: boolean;
  ai_action_type: string | null;
  ai_metadata: Record<string, unknown> | null;
  ai_processed_at: string | null;
  assigned_to: string | null;
  due_date: string | null;
  due_time: string | null;
  created_at: string;
  updated_at: string;
};

export type AutomationJob = {
  id: string;
  follow_up_id: string | null;
  entity_code: string;
  entity_ref: string | null;
  channel: 'EMAIL' | 'WHATSAPP' | 'MESSAGE';
  subject: string | null;
  body: string;
  status: 'PENDING' | 'QUEUED' | 'SENT' | 'FAILED';
  priority_code: string;
  scheduled_at: string;
  sent_at: string | null;
  error_message: string | null;
  rule_id: string | null;
  created_at: string;
};

export type NewAutomationJob = {
  follow_up_id: string | null;
  entity_code: string;
  entity_ref: string | null;
  channel: 'EMAIL' | 'WHATSAPP' | 'MESSAGE';
  subject: string | null;
  body: string;
  status: 'PENDING';
  priority_code: string;
  scheduled_at: string;
  rule_id: string | null;
};

export type Team = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  specialty: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_code: string;
  name: string;
  role: string | null;
  specialties: string[];
  workload: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type LeadScore = {
  id?: string;
  entity_code: string;
  entity_ref: string;
  score: number;
  trend: 'RISING' | 'STABLE' | 'DECLINING' | 'NEW';
  total_follow_ups: number;
  completed_follow_ups: number;
  overdue_count: number;
  last_activity_date: string | null;
  suggested_priority: string;
  suggested_team_code: string | null;
  suggested_reason: string;
  updated_at?: string;
};

export type AILeadInsight = LeadScore & {
  team_name: string | null;
  member_name: string | null;
  recommended_remark: string | null;
};

export type MasterData = {
  entities: Entity[];
  followUpTypes: FollowUpType[];
  stages: Stage[];
  statuses: Status[];
  outcomes: Outcome[];
  reasons: Reason[];
  nextActions: NextAction[];
  priorities: Priority[];
  rules: Rule[];
  sequences: SequenceStep[];
  automationJobs: AutomationJob[];
  teams: Team[];
  teamMembers: TeamMember[];
};

export type NewFollowUp = {
  entity_code: string;
  entity_id?: string | number | null;
  entity_name?: string | null;
  entity_phone?: string | null;
  entity_ref: string | null;
  follow_up_type_code: string;
  stage_code: string;
  status_code: string;
  outcome_code: string | null;
  reason_code: string | null;
  next_action_code: string | null;
  next_follow_up_type_code: string | null;
  priority_code: string;
  scheduled_date: string;
  scheduled_time: string;
  attempt_no: number;
  sequence_name: string | null;
  is_complete: boolean;
  completed_at: string | null;
  terminal: boolean;
  custom_remark: string | null;
  project: string | null;
  site_location: string | null;
  participants: string | null;
  message_template: string | null;
  rule_snapshot: Record<string, unknown> | null;
  ai_generated?: boolean;
  ai_action_type?: string | null;
  ai_metadata?: Record<string, unknown> | null;
  ai_processed_at?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  due_time?: string | null;
};

export type StageStatusSuggestion = {
  stageCode: string;
  statusCode: string;
  source: 'rule' | 'default';
  ruleId: string | null;
  confidence: 'high' | 'medium';
  reason: string;
};
