import React, { useEffect, useState } from "react";
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
import { dashboardAPI } from "@/lib/api";
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
    team_conversion_rate: number;
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

  // Normalizer: supports either { success, data } or raw payload
  const normalizeApiResp = (resp: any) => {
    if (!resp) return null;
    if (typeof resp === "object" && "success" in resp && "data" in resp) {
      return resp.success ? resp.data : null;
    }
    return resp;
  };

  const fetchManagerData = async () => {
    try {
      if (!loading) setRefreshing(true);
      setLoading(true);

      const results = await Promise.allSettled([
        usersAPI.getDashboardStats(), 
        // usersAPI.getAgents(),
        usersAPI.getAllUsers({ role: ['agent', 'executive'] }),
        leadsAPI.getLeads({ limit: 5 }),
      ]);

      const [statsRes, agentsRes, leadsRes] = results;

      const getVal = (r: PromiseSettledResult<any>) =>
        r.status === "fulfilled" ? r.value : null;

      const statsResponse = normalizeApiResp(getVal(statsRes));
      const agentsResponse = normalizeApiResp(getVal(agentsRes));
      const leadsResponse = normalizeApiResp(getVal(leadsRes));

      // Stats
      if (statsResponse) {
        setStats(statsResponse);
      } else {
        if (statsRes.status === "rejected") {
          console.error("dashboardAPI.getManagerStats failed:", (statsRes as any).reason);
        } else {
          console.warn("dashboardAPI.getManagerStats returned no usable data:", statsResponse);
        }
        setStats(null);
      }

      // Agents
      if (Array.isArray(agentsResponse)) {
        setTopAgents(agentsResponse.slice(0, 5));
      } else {
        if (agentsRes.status === "rejected") {
          console.error("usersAPI.getAgents failed:", (agentsRes as any).reason);
        } else {
          console.warn("usersAPI.getAgents returned unexpected shape:", agentsResponse);
        }
        setTopAgents([]);
      }

      // Leads
      if (Array.isArray(leadsResponse)) {
        setRecentLeads(leadsResponse);
      } else {
        if (leadsRes.status === "rejected") {
          console.error("leadsAPI.getLeads failed:", (leadsRes as any).reason);
        } else {
          console.warn("leadsAPI.getLeads returned unexpected shape:", leadsResponse);
        }
        setRecentLeads([]);
      }

      // if everything is null/empty, show toast
      const allFailed = !statsResponse && !agentsResponse && !leadsResponse;
      if (allFailed) {
        toast.error("Failed to load manager dashboard data");
      }
    } catch (err) {
      console.error("Unexpected error fetching manager data:", err);
      toast.error("Failed to load manager dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTargetProgress = (achieved: number, target: number) => {
    return target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
  };

  // Safe date-to-string
  const safeDate = (d?: string | number) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Team performance and management overview</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/dashboard/users">
            <Button className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Manage Team</span>
            </Button>
          </Link>
          <Link to="/dashboard/analytics">
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Team Analytics</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={fetchManagerData}
            className="flex items-center space-x-2"
            disabled={refreshing}
          >
            <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none">
              <path d="M21 12a9 9 0 11-3.2-6.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                }}
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
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
              topAgents.map((agent, index) => (
                <div
                  key={agent.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(agent.first_name?.[0] || "") + (agent.last_name?.[0] || "")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {agent.first_name} {agent.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{agent.email}</p>
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

        {/* Recent Team Leads */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Team Leads</h3>
            <Link to="/dashboard/leads" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{lead.email}</p>
                    <p className="text-xs text-gray-500">{safeDate(lead.created_at)}</p>
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
    </div>
  );
};

export default ManagerDashboard;
