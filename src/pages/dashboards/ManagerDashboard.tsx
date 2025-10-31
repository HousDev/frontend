// src/pages/dashboard/ManagerDashboard.tsx
import React, { CSSProperties, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building,
  Target,
  TrendingUp,
  Calendar,
  Award,
  ArrowRight,
  Plus,
  BarChart3,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { leadsAPI } from "@/lib/leadAPI";
import { usersAPI } from "@/lib/api";

import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/useToast";

interface ManagerStats {
  team_performance: {
    total_agents: number;
    active_agents: number;
    top_performer?: string;
    team_conversion_rate: number; // percentage (0-100)
  };
  monthly_targets: {
    leads_target: number;
    leads_achieved: number;
    sales_target?: number;
    sales_achieved?: number;
  };
  team_activities: {
    total_activities?: number;
    pending_activities: number;
    completed_today: number;
  };
}

const DEFAULT_LEADS_TARGET = 100; // <- change to suit your org

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchManagerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeApiResp = (resp: any) => {
    if (!resp) return null;
    if (typeof resp === "object" && "success" in resp && "data" in resp) {
      return (resp as any).success ? (resp as any).data : null;
    }
    if (resp?.data !== undefined) return resp.data;
    return resp;
  };

  const coerceArray = (val: any): any[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) return val.data;
    if (Array.isArray(val?.items)) return val.items;
    return [];
  };

  const getString = (v: any) => (typeof v === "string" ? v : "");
  const getBool = (v: any) =>
    v === true || v === 1 || v === "1" || (typeof v === "string" && v.toLowerCase() === "true");

  const isAgentActive = (agent: any) => {
    const status = getString(agent?.status)?.toLowerCase();
    return status === "active" || getBool(agent?.active) || getBool(agent?.is_active);
  };

  const todayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
  };

  const isSameDay = (d: any, ymd: string) => {
    if (!d) return false;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return false;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate()
    ).padStart(2, "0")}`;
    return key === ymd;
  };

  const isThisMonth = (d: any) => {
    if (!d) return false;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return false;
    const now = new Date();
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  };

  const isLeadConverted = (lead: any) => {
    const s = getString(lead?.status)?.toLowerCase().replace(/\s+/g, "_");
    // common “won/converted” statuses in CRMs
    return ["converted", "won", "closed_won", "sale", "booked", "successful"].includes(s);
  };

  const getAssigneeId = (lead: any) => {
    // try common fields that might denote who owns/handles the lead
    return (
      lead?.assigned_to_id ??
      lead?.assigned_to ??
      lead?.executive_id ??
      lead?.agent_id ??
      lead?.owner_id ??
      lead?.user_id ??
      null
    );
  };

  const fetchManagerData = async () => {
    try {
      setRefreshing((prev) => !loading || prev);
      setLoading(true);

      const results = await Promise.allSettled([
        // Only these two are needed to derive all dashboard stats
        usersAPI.getAllUsers?.({ role: ["agent", "executive"], limit: 500 }),
        leadsAPI.getLeads?.({ limit: 500, sort: "created_at:desc" }),
      ]);

      const getVal = (r: PromiseSettledResult<any>) => (r.status === "fulfilled" ? r.value : null);
      const agentsResponse = normalizeApiResp(getVal(results[0]));
      const leadsResponse = normalizeApiResp(getVal(results[1]));

      const agents = coerceArray(agentsResponse);
      const leads = coerceArray(leadsResponse);

      // populate UI lists
      setTopAgents(agents.slice(0, 10));
      setRecentLeads(leads.slice(0, 10));

      // ---- Derivations ----
      // Team size / active
      const totalAgents = agents.length;
      const activeAgents = agents.reduce((acc, a) => acc + (isAgentActive(a) ? 1 : 0), 0);

      // Conversion rate (based on leads list in memory)
      const convertedCount = leads.reduce((acc, l) => acc + (isLeadConverted(l) ? 1 : 0), 0);
      const conversionRate =
        leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0;

      // Monthly leads achieved
      const leadsThisMonth = leads.filter((l) => isThisMonth(l?.created_at ?? l?.createdAt));
      const leadsAchieved = leadsThisMonth.length;

      // Activities today (best-effort from available timestamps)
      const ymd = todayKey();
      const completedToday = leads.reduce((acc, l) => {
        const lastAct = l?.last_activity_at ?? l?.last_contacted_at ?? l?.updated_at ?? l?.updatedAt;
        return acc + (isSameDay(lastAct, ymd) ? 1 : 0);
      }, 0);

      // Pending activities (simple heuristic: not converted/closed)
      const pendingActivities = leads.reduce((acc, l) => {
        const s = getString(l?.status).toLowerCase().replace(/\s+/g, "_");
        const closed =
          ["converted", "won", "closed_won", "sale", "successful", "closed_lost", "lost", "dead"].includes(
            s
          );
        return acc + (closed ? 0 : 1);
      }, 0);

      // Top performer by lead count assigned
      const countByAssignee: Record<string, number> = {};
      for (const lead of leads) {
        const assigneeId = String(getAssigneeId(lead) ?? "");
        if (!assigneeId) continue;
        countByAssignee[assigneeId] = (countByAssignee[assigneeId] || 0) + 1;
      }
      let topPerformerName: string | undefined = undefined;
      if (Object.keys(countByAssignee).length > 0) {
        const [topId] = Object.entries(countByAssignee).sort((a, b) => b[1] - a[1])[0];
        const top = agents.find(
          (a) =>
            String(a?.id ?? a?._id ?? a?.user_id ?? a?.value ?? "") === String(topId)
        );
        if (top) {
          const fn = getString(top?.first_name) || getString(top?.firstName);
          const ln = getString(top?.last_name) || getString(top?.lastName);
          topPerformerName = `${fn || "Agent"} ${ln}`.trim();
        } else {
          topPerformerName = "Top Agent";
        }
      }

      const computedStats: ManagerStats = {
        team_performance: {
          total_agents: totalAgents,
          active_agents: activeAgents,
          top_performer: topPerformerName,
          team_conversion_rate: conversionRate,
        },
        monthly_targets: {
          leads_target: DEFAULT_LEADS_TARGET,
          leads_achieved: leadsAchieved,
          // sales_target / sales_achieved can be added when you have an orders/sales source
        },
        team_activities: {
          total_activities: leads.length,
          pending_activities: pendingActivities,
          completed_today: completedToday,
        },
      };

      setStats(computedStats);

      if (agents.length === 0 && leads.length === 0) {
        toast.error("No data available for manager dashboard");
      }
    } catch (err) {
      console.error("Unexpected error fetching manager data:", err);
      toast.error("Failed to load manager dashboard data");
      setStats(null);
      setTopAgents([]);
      setRecentLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTargetProgress = (achieved: number, target: number) => {
    return target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
  };

  const safeDate = (d?: string | number) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString();
  };

  const initialsOf = (first?: string, last?: string) => {
    const a = (first?.trim()?.[0] || "").toUpperCase();
    const b = (last?.trim()?.[0] || "").toUpperCase();
    return (a + b) || "U";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Team performance and management overview
          </p>
        </div>

        {/* Right Section - Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link to="/dashboard/users" className="w-full sm:w-auto">
            <Button className="flex items-center justify-center space-x-2 w-full sm:w-auto">
              <UserPlus className="h-4 w-4" />
              <span>Manage Team</span>
            </Button>
          </Link>

          <Link to="/dashboard/analytics" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Team Analytics</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            onClick={fetchManagerData}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
            disabled={refreshing}
            aria-busy={refreshing}
          >
            <svg
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 12a9 9 0 11-3.2-6.6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Retry"}</span>
          </Button>
        </div>
      </div>

      {/* Team Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.team_performance?.total_agents ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.team_performance?.active_agents ?? 0} active agents
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.team_performance?.team_conversion_rate ?? 0}%
              </p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Team average</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.monthly_targets?.leads_achieved ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${getTargetProgress(
                    stats?.monthly_targets?.leads_achieved ?? 0,
                    stats?.monthly_targets?.leads_target ?? 1
                  )}%`,
                } as CSSProperties}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Target: {stats?.monthly_targets?.leads_target ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.team_activities?.completed_today ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats?.team_activities?.pending_activities ?? 0} pending
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/dashboard/leads">
            <Button className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Review Team Leads
            </Button>
          </Link>
          <Link to="/dashboard/properties">
            <Button variant="outline" className="w-full justify-start">
              <Building className="h-4 w-4 mr-2" />
              Manage Properties
            </Button>
          </Link>
          <Link to="/dashboard/activities">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Activities
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers (Top 10) */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Top Performers
            </h3>
            <Link to="/dashboard/users" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {topAgents.length > 0 ? (
              topAgents.slice(0, 10).map((agent, index) => (
                <div
                  key={agent.id || agent._id || agent.user_id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {initialsOf(agent.first_name ?? agent.firstName, agent.last_name ?? agent.lastName)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {(agent.first_name ?? agent.firstName ?? "Unknown") +
                          " " +
                          (agent.last_name ?? agent.lastName ?? "")}
                      </p>
                      <p className="text-sm text-gray-500">{agent.email ?? "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">#{index + 1}</p>
                    <p className="text-xs text-gray-500">Rank</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No agents found</p>
            )}
          </div>
        </div>

        {/* Recent Team Leads (Top 10) */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Team Leads</h3>
            <Link to="/dashboard/leads" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentLeads.length > 0 ? (
              recentLeads.slice(0, 10).map((lead: any, idx: number) => (
                <div
                  key={lead.id || lead._id || idx}
                  className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {(lead.first_name ?? "Unknown") + " " + (lead.last_name ?? "")}
                    </p>
                    <p className="text-sm text-gray-600">{lead.email ?? "—"}</p>
                    <p className="text-xs text-gray-500">
                      {safeDate(lead.created_at ?? lead.createdAt)}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    {lead.status || "New"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent leads</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
