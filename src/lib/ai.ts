import { loadMasterData } from './engine';
import type { AILeadInsight, FollowUp, LeadScore, Team, TeamMember } from '@/lib/types';

const LEAD_SCORES_KEY = 'fu_lead_scores_data';

function localDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function daysSince(value: string | null): number {
  if (!value) return 999;
  return Math.max(0, Math.floor((Date.now() - localDate(value).getTime()) / 86400000));
}

function isOverdue(value: string): boolean {
  return localDate(value).getTime() < new Date(new Date().toDateString()).getTime();
}

function isToday(value: string): boolean {
  return localDate(value).toDateString() === new Date().toDateString();
}

function daysUntil(value: string): number {
  return Math.ceil((localDate(value).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
}

function trendFor(items: FollowUp[]): LeadScore['trend'] {
  if (items.length === 1) return 'NEW';
  const completed = items.filter((item) => item.is_complete).sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''));
  if (completed.length < 2) return 'NEW';
  const recent = completed[0];
  const previous = completed[1];
  const recentGap = daysSince(recent.completed_at?.slice(0, 10) ?? null);
  const previousGap = daysSince(previous.completed_at?.slice(0, 10) ?? null);
  if (recentGap + 3 < previousGap) return 'RISING';
  if (recentGap > previousGap + 7) return 'DECLINING';
  return 'STABLE';
}

function priorityFor(items: FollowUp[], score: number): { priority: string; reason: string } {
  const overdue = items.filter((item) => !item.is_complete && isOverdue(item.scheduled_date)).length;
  const latest = [...items].sort((a, b) => `${b.scheduled_date}${b.scheduled_time}`.localeCompare(`${a.scheduled_date}${a.scheduled_time}`))[0];
  if (overdue >= 2 || score >= 85) return { priority: 'URGENT', reason: `${overdue || 'High engagement'} signal${overdue === 1 ? '' : 's'} detected — act now` };
  if (overdue === 1 || (latest?.attempt_no ?? 0) >= 3 || score >= 65) return { priority: 'HIGH', reason: overdue ? 'A scheduled touchpoint is overdue' : 'Repeated engagement suggests a high-value lead' };
  if (score <= 30) return { priority: 'LOW', reason: 'Low recent engagement — use a lighter-touch follow-up' };
  return { priority: 'MEDIUM', reason: 'Keep a steady follow-up cadence' };
}

function scoreFor(items: FollowUp[]): number {
  const completed = items.filter((item) => item.is_complete).length;
  const overdue = items.filter((item) => !item.is_complete && isOverdue(item.scheduled_date)).length;
  const recent = items.some((item) => daysSince(item.completed_at?.slice(0, 10) ?? item.scheduled_date) <= 14);
  return Math.max(0, Math.min(100, 40 + completed * 8 + (recent ? 15 : 0) - overdue * 10));
}

function chooseTeam(items: FollowUp[], teams: Team[], members: TeamMember[]): { team: Team | null; member: TeamMember | null } {
  const active = teams.filter((team) => team.is_active);
  const types = new Set(items.map((item) => item.follow_up_type_code));
  const ranked = active.map((team) => {
    const specialties = (team.specialty ?? '').split(',').map((value) => value.trim());
    const match = specialties.filter((value) => types.has(value)).length;
    return { team, match, workload: members.filter((member) => member.team_code === team.code && member.is_active).reduce((sum, member) => sum + member.workload, 0) };
  }).sort((a, b) => b.match - a.match || a.workload - b.workload);
  const team = ranked[0]?.team ?? null;
  const teamMembers = members.filter((member) => member.team_code === team?.code && member.is_active).sort((a, b) => a.workload - b.workload);
  return { team, member: teamMembers[0] ?? null };
}

function remarkFor(items: FollowUp[]): string | null {
  const counts = new Map<string, number>();
  items.filter((item) => item.custom_remark?.trim()).forEach((item) => {
    const remark = item.custom_remark!.trim();
    counts.set(remark, (counts.get(remark) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export async function loadAIInsights(followUps: FollowUp[]): Promise<AILeadInsight[]> {
  const master = await loadMasterData();
  const activeTeams = (master.teams ?? []).filter((t) => t.is_active);
  const activeMembers = (master.teamMembers ?? []).filter((m) => m.is_active);

  const grouped = new Map<string, FollowUp[]>();
  followUps.forEach((item) => {
    const key = `${item.entity_code}:${item.entity_ref ?? item.id}`;
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  });

  const insights = [...grouped.entries()].map(([key, items]) => {
    const [entityCode, ...refParts] = key.split(':');
    const entityRef = refParts.join(':');
    const score = scoreFor(items);
    const { priority, reason } = priorityFor(items, score);
    const { team, member } = chooseTeam(items, activeTeams, activeMembers);
    const lead: LeadScore = {
      entity_code: entityCode,
      entity_ref: entityRef,
      score,
      trend: trendFor(items),
      total_follow_ups: items.length,
      completed_follow_ups: items.filter((item) => item.is_complete).length,
      overdue_count: items.filter((item) => !item.is_complete && isOverdue(item.scheduled_date)).length,
      last_activity_date: [...items].sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))[0]?.scheduled_date ?? null,
      suggested_priority: priority,
      suggested_team_code: team?.code ?? null,
      suggested_reason: reason,
    };
    return { ...lead, team_name: team?.name ?? null, member_name: member?.name ?? null, recommended_remark: remarkFor(items) };
  }).sort((a, b) => b.score - a.score);

  if (insights.length > 0) {
    try {
      const scores = insights.map((insight) => {
        const { team_name, member_name, recommended_remark, ...score } = insight;
        void team_name; void member_name; void recommended_remark;
        return score;
      });
      localStorage.setItem(LEAD_SCORES_KEY, JSON.stringify(scores));
    } catch (err) {
      console.error('Failed to save lead scores', err);
    }
  }
  return insights;
}

export function getPriorityDelta(current: string, suggested: string): 'up' | 'down' | 'same' {
  const levels: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
  if ((levels[suggested] ?? 2) > (levels[current] ?? 2)) return 'up';
  if ((levels[suggested] ?? 2) < (levels[current] ?? 2)) return 'down';
  return 'same';
}

// ===== Task urgency scoring & ranking =====

export type UrgencyLevel = 'critical' | 'urgent' | 'high' | 'medium' | 'low';
export type RankedTask = {
  fu: FollowUp;
  urgencyScore: number;
  urgencyLevel: UrgencyLevel;
  urgencyReason: string;
  leadScore: number;
  leadTrend: LeadScore['trend'];
  daysOverdue: number;
  attemptCount: number;
  isStale: boolean;
};

const PRIORITY_WEIGHT: Record<string, number> = { URGENT: 40, HIGH: 25, MEDIUM: 10, LOW: 0 };
const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  critical: 'Critical — act immediately',
  urgent: 'Urgent — do today',
  high: 'High priority — do soon',
  medium: 'Medium — scheduled',
  low: 'Low — when time allows',
};

export function rankTasksByUrgency(followUps: FollowUp[], insights: AILeadInsight[]): RankedTask[] {
  const pending = followUps.filter((f) => !f.is_complete);
  const insightMap = new Map<string, AILeadInsight>();
  insights.forEach((i) => insightMap.set(`${i.entity_code}:${i.entity_ref}`, i));

  return pending.map((fu) => {
    const insight = insightMap.get(`${fu.entity_code}:${fu.entity_ref ?? fu.id}`);
    const leadScore = insight?.score ?? 50;
    const leadTrend = insight?.trend ?? 'NEW';

    const dOverdue = isOverdue(fu.scheduled_date) ? Math.abs(daysUntil(fu.scheduled_date)) : 0;
    const dUntil = isOverdue(fu.scheduled_date) ? 0 : Math.max(0, daysUntil(fu.scheduled_date));
    const isStale = dOverdue >= 7;

    let score = PRIORITY_WEIGHT[fu.priority_code] ?? 10;
    score += dOverdue * 15;
    if (isToday(fu.scheduled_date)) score += 20;
    if (dUntil === 1) score += 10;
    if (dUntil === 0 && !isOverdue(fu.scheduled_date)) score += 25;
    score += Math.round(leadScore * 0.15);
    if (leadTrend === 'RISING') score += 8;
    if (leadTrend === 'DECLINING') score -= 5;
    if (fu.attempt_no >= 3) score += 5;

    let level: UrgencyLevel;
    let reason: string;
    if (dOverdue >= 3 || (dOverdue >= 1 && fu.priority_code === 'URGENT')) {
      level = 'critical';
      reason = `${dOverdue}d overdue${fu.priority_code === 'URGENT' ? ' & urgent priority' : ''}`;
    } else if (dOverdue >= 1 || isToday(fu.scheduled_date)) {
      level = 'urgent';
      reason = isToday(fu.scheduled_date) && dOverdue === 0 ? 'Due today' : `${dOverdue}d overdue`;
    } else if (dUntil <= 2 || fu.priority_code === 'HIGH') {
      level = 'high';
      reason = dUntil <= 2 ? `Due in ${dUntil}d` : 'High priority task';
    } else if (dUntil <= 7 || fu.priority_code === 'MEDIUM') {
      level = 'medium';
      reason = `Due in ${dUntil}d`;
    } else {
      level = 'low';
      reason = `Due in ${dUntil}d`;
    }

    return {
      fu,
      urgencyScore: score,
      urgencyLevel: level,
      urgencyReason: reason,
      leadScore,
      leadTrend,
      daysOverdue: dOverdue,
      attemptCount: fu.attempt_no,
      isStale,
    };
  }).sort((a, b) => b.urgencyScore - a.urgencyScore);
}

export function urgencyLabel(level: UrgencyLevel): string {
  return URGENCY_LABELS[level];
}

// ===== No-task-left-behind detection =====

export type StaleLead = {
  entity_code: string;
  entity_ref: string;
  lastFollowUpDate: string;
  daysSinceLastContact: number;
  pendingCount: number;
  overdueCount: number;
  suggestedAction: string;
  suggestedPriority: string;
};

export function detectStaleLeads(followUps: FollowUp[]): StaleLead[] {
  const grouped = new Map<string, FollowUp[]>();
  followUps.forEach((f) => {
    const key = `${f.entity_code}:${f.entity_ref ?? f.id}`;
    grouped.set(key, [...(grouped.get(key) ?? []), f]);
  });

  const stale: StaleLead[] = [];
  for (const [key, items] of grouped) {
    const [entityCode, ...refParts] = key.split(':');
    const entityRef = refParts.join(':');
    const pending = items.filter((f) => !f.is_complete);
    const completed = items.filter((f) => f.is_complete);
    const lastDate = [...items].sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date))[0]?.scheduled_date ?? '';
    const daysSinceContact = daysSince(lastDate);

    const hasPending = pending.length > 0;
    const hasOverdue = pending.some((f) => isOverdue(f.scheduled_date));
    const noRecentActivity = completed.length > 0 && daysSinceContact >= 7 && !hasPending;

    if (hasOverdue || noRecentActivity || (daysSinceContact >= 14 && completed.length > 0)) {
      let action = 'Schedule a follow-up call';
      let priority = 'MEDIUM';
      if (hasOverdue) { action = 'Complete overdue follow-up immediately'; priority = 'URGENT'; }
      else if (daysSinceContact >= 14) { action = 'Re-engage — no contact in 2+ weeks'; priority = 'HIGH'; }
      else if (noRecentActivity) { action = 'Schedule next touchpoint'; priority = 'HIGH'; }

      stale.push({
        entity_code: entityCode,
        entity_ref: entityRef,
        lastFollowUpDate: lastDate,
        daysSinceLastContact: daysSinceContact,
        pendingCount: pending.length,
        overdueCount: pending.filter((f) => isOverdue(f.scheduled_date)).length,
        suggestedAction: action,
        suggestedPriority: priority,
      });
    }
  }
  return stale.sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact);
}

// ===== Next best action recommendation =====

export type NextBestAction = {
  fu: FollowUp;
  recommendation: string;
  confidence: 'high' | 'medium' | 'low';
  leadScore: number;
};

export function recommendNextAction(fu: FollowUp, insight: AILeadInsight | undefined): NextBestAction {
  const score = insight?.score ?? 50;
  const trend = insight?.trend ?? 'NEW';
  const overdue = isOverdue(fu.scheduled_date);
  const attempts = fu.attempt_no;

  let rec = 'Complete this follow-up as scheduled';
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  if (overdue && attempts >= 3) {
    rec = 'This lead has been contacted multiple times — consider a different channel (WhatsApp/Email) or escalate';
    confidence = 'high';
  } else if (overdue && score >= 70) {
    rec = 'High-value lead is overdue — call immediately, do not let this go cold';
    confidence = 'high';
  } else if (overdue) {
    rec = 'Overdue follow-up — complete today to maintain cadence';
    confidence = 'high';
  } else if (trend === 'RISING' && score >= 65) {
    rec = 'Lead is warming up — strike while interest is high, schedule a meeting';
    confidence = 'high';
  } else if (trend === 'DECLINING') {
    rec = 'Lead interest may be fading — try a value-driven message or new angle';
    confidence = 'medium';
  } else if (attempts >= 3 && score < 35) {
    rec = 'Low engagement after multiple attempts — consider a long-gap follow-up or deprioritize';
    confidence = 'medium';
  } else if (isToday(fu.scheduled_date)) {
    rec = 'Scheduled for today — complete during your prime calling hours';
    confidence = 'medium';
  }

  return { fu, recommendation: rec, confidence, leadScore: score };
}
