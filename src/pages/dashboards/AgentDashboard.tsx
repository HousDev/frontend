// src/pages/dashboard/AgentDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building,
  Target,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  Plus,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, activitiesAPI } from "@/lib/api";
import Button from "@/components/ui/Button";
import { propertiesAPI } from "@/lib/propertiesAPI";
import { leadsAPI } from "@/lib/leadAPI";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/useToast";

interface AgentStats {
  my_leads?: {
    total_leads?: number;
    new_leads?: number;
    hot_leads?: number;
    converted_leads?: number;
    conversion_rate?: number;
  };
  my_properties?: {
    total_listings?: number;
    active_listings?: number;
    sold_this_month?: number;
  };
  monthly_targets?: {
    leads_target?: number;
    leads_achieved?: number;
    sales_target?: number;
    sales_achieved?: number;
  };
  upcoming_activities?: number;
  today_followups?: number;
}

const emptyAgentStats: AgentStats = {
  my_leads: {
    total_leads: 0,
    new_leads: 0,
    hot_leads: 0,
    converted_leads: 0,
    conversion_rate: 0,
  },
  my_properties: {
    total_listings: 0,
    active_listings: 0,
    sold_this_month: 0,
  },
  monthly_targets: {
    leads_target: 0,
    leads_achieved: 0,
    sales_target: 0,
    sales_achieved: 0,
  },
  upcoming_activities: 0,
  today_followups: 0,
};

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgentStats>(emptyAgentStats);
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let shownToast = false;

    const showErrorOnce = (msg: string) => {
      if (!shownToast) {
        toast.error(msg);
        shownToast = true;
      }
    };

    const parseResp = (r: any) => {
      if (!r) return null;
      if (typeof r !== "object") return null;
      // If axios-like response: { data: ... }
      if (r.data !== undefined) return r.data;
      return r;
    };

    const fetchAgentData = async () => {
      if (isMounted) setLoading(true);

      // ---- helpers ----
      const toTS = (d?: string | number | Date) => (d ? new Date(d).getTime() : 0);
      const pickRecent5 = <T extends Record<string, any>>(
        arr: T[] | null | undefined,
        keyA: keyof T, // primary date key
        keyB?: keyof T // fallback date key
      ) => {
        if (!Array.isArray(arr)) return [];
        return [...arr]
          .sort((x, y) => (toTS(y?.[keyA] ?? (keyB ? y?.[keyB] : undefined)) - toTS(x?.[keyA] ?? (keyB ? x?.[keyB] : undefined))))
          .slice(0, 5);
      };
      const getArray = (raw: any): any[] | null =>
        Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : null;

      try {
        // 1) Try the agent stats endpoint
        let agentPayload: any = null;
        try {
          const resp = await dashboardAPI.getAgentStats().catch((e: any) => {
            console.warn("dashboardAPI.getAgentStats error:", e);
            return null;
          });
          console.log("dashboardAPI.getAgentStats raw response:", resp);
          agentPayload = parseResp(resp);

          if (agentPayload?.success === false) {
            console.warn("getAgentStats returned success:false:", agentPayload.message ?? agentPayload);
            agentPayload = null;
          }
        } catch (err) {
          console.warn("Error calling getAgentStats:", err);
          agentPayload = null;
        }

        // 2) If agentPayload valid, normalize & use
        if (agentPayload && (agentPayload.my_leads || agentPayload.my_properties || agentPayload.monthly_targets)) {
          const normalized: AgentStats = {
            my_leads: {
              total_leads:
                agentPayload.my_leads?.total_leads ??
                agentPayload.myLeads?.total_leads ??
                agentPayload.my_leads?.total ??
                agentPayload.total_leads ??
                emptyAgentStats.my_leads!.total_leads,
              new_leads:
                agentPayload.my_leads?.new_leads ??
                agentPayload.new_leads ??
                0,
              hot_leads:
                agentPayload.my_leads?.hot_leads ?? agentPayload.hot_leads ?? 0,
              converted_leads:
                agentPayload.my_leads?.converted_leads ?? agentPayload.converted_leads ?? 0,
              conversion_rate:
                agentPayload.my_leads?.conversion_rate ?? agentPayload.conversion_rate ?? 0,
            },
            my_properties: {
              total_listings:
                agentPayload.my_properties?.total_listings ??
                agentPayload.properties?.total_listings ??
                agentPayload.total_listings ??
                0,
              active_listings:
                agentPayload.my_properties?.active_listings ?? 0,
              sold_this_month:
                agentPayload.my_properties?.sold_this_month ?? 0,
            },
            monthly_targets: {
              leads_target: agentPayload.monthly_targets?.leads_target ?? 0,
              leads_achieved: agentPayload.monthly_targets?.leads_achieved ?? 0,
              sales_target: agentPayload.monthly_targets?.sales_target ?? 0,
              sales_achieved: agentPayload.monthly_targets?.sales_achieved ?? 0,
            },
            upcoming_activities: agentPayload.upcoming_activities ?? 0,
            today_followups: agentPayload.today_followups ?? 0,
          };
          if (isMounted) setStats(prev => ({ ...prev, ...normalized }));
        } else {
          // 3) Fallback: fetch lists and derive counts
          console.warn("Agent stats endpoint missing or unexpected — using list-based fallbacks");
          try {
            const [leadsResp, activitiesResp, propsResp] = await Promise.all([
              leadsAPI.getLeads({ agent_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("leadsAPI.getLeads error", e); return null; }),
              activitiesAPI.getUpcoming({ agent_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("activitiesAPI.getUpcoming error", e); return null; }),
              propertiesAPI.getProperties({ agent_id: user?.id, limit: 1 }).catch((e: any) => { console.warn("propertiesAPI.getProperties error", e); return null; }),
            ]);

            const leadsArray = getArray(parseResp(leadsResp));
            const activitiesArray = getArray(parseResp(activitiesResp));
            const propsArray = getArray(parseResp(propsResp));

            if (isMounted) {
              if (Array.isArray(leadsArray)) {
                const latest5 = pickRecent5(leadsArray, "created_at");
                setMyLeads(latest5); // enforce top 5
                setStats(prev => ({
                  ...prev,
                  my_leads: {
                    ...prev.my_leads,
                    total_leads: leadsArray.length,
                    new_leads: prev.my_leads?.new_leads ?? 0,
                  },
                }));
              }
              if (Array.isArray(activitiesArray)) {
                const latest5 = pickRecent5(activitiesArray, "scheduled_at", "created_at");
                setUpcomingActivities(latest5); // enforce top 5
                setStats(prev => ({ ...prev, upcoming_activities: activitiesArray.length }));
              }
              if (Array.isArray(propsArray)) {
                setStats(prev => ({
                  ...prev,
                  my_properties: {
                    ...prev.my_properties,
                    total_listings: propsArray.length,
                  },
                }));
              }
            }
          } catch (err) {
            console.warn("Fallback list-based agent totals failed:", err);
            showErrorOnce("Failed to load agent dashboard data");
          }
        }

        // 4) Always refresh recent lists (server might have newer)
        try {
          const [leadsRespFull, activitiesRespFull] = await Promise.all([
            leadsAPI.getLeads({ agent_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("leadsAPI.getLeads error", e); return null; }),
            activitiesAPI.getUpcoming({ agent_id: user?.id, limit: 5 }).catch((e: any) => { console.warn("activitiesAPI.getUpcoming error", e); return null; }),
          ]);

          const leadsArr = getArray(parseResp(leadsRespFull));
          if (Array.isArray(leadsArr) && isMounted) {
            setMyLeads(pickRecent5(leadsArr, "created_at")); // enforce top 5 consistently
          }

          const actsArr = getArray(parseResp(activitiesRespFull));
          if (Array.isArray(actsArr) && isMounted) {
            setUpcomingActivities(pickRecent5(actsArr, "scheduled_at", "created_at")); // enforce top 5 consistently
          }
        } catch (err) {
          console.warn("Error fetching recent lists:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };


    // Only fetch when user exists (auth ready)
    if (user) {
      fetchAgentData().catch((e) => {
        console.error("fetchAgentData top-level error:", e);
        showErrorOnce("Failed to load agent dashboard data");
        if (isMounted) setLoading(false);
      });
    } else {
      // no user -> stop spinner
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getTargetProgress = (achieved: number = 0, target: number = 0) => {
    return target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getLeadStatusColor = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "hot":
      case "hot lead":
        return "bg-red-100 text-red-800";
      case "warm":
        return "bg-orange-100 text-orange-800";
      case "cold":
        return "bg-blue-100 text-blue-800";
      case "qualified":
      case "converted":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const safeDate = (s?: string | null) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        {/* Greeting Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {getGreeting()}, {user?.first_name ?? "Agent"}!
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Here's your daily performance overview
          </p>
        </div>

        {/* Button Group */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
          <Link to="/dashboard/leads">
            <Button className="flex items-center space-x-2 w-full">
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </Button>
          </Link>
          <Link to="/dashboard/activities">
            <Button variant="outline" className="flex items-center space-x-2 w-full">
              <Calendar className="h-4 w-4" />
              <span>Schedule Activity</span>
            </Button>
          </Link>
        </div>

      </div>


      {/* Priority Alerts
      {stats?.today_followups && stats.today_followups > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-orange-800 font-medium">
              You have {stats.today_followups} follow-ups due today!
            </span>
            <Link to="/dashboard/activities" className="text-orange-600 hover:text-orange-800">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )} */}

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Leads</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.my_leads?.total_leads ?? 0}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats?.my_leads?.new_leads ?? 0} new this week</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.my_leads?.conversion_rate ?? 0}%
              </p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats?.my_leads?.converted_leads ?? 0} converted</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hot Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.my_leads?.hot_leads ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.my_properties?.active_listings ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Building className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats?.my_properties?.sold_this_month ?? 0} sold this month</p>
        </div>
      </div>

      {/* Monthly Targets */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Leads Target</span>
              <span className="text-sm text-gray-900">
                {stats?.monthly_targets?.leads_achieved ?? 0} / {stats?.monthly_targets?.leads_target ?? 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{
                  width: `${getTargetProgress(stats?.monthly_targets?.leads_achieved ?? 0, stats?.monthly_targets?.leads_target ?? 1)}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Sales Target</span>
              <span className="text-sm text-gray-900">
                ${stats?.monthly_targets?.sales_achieved ?? 0} / ${stats?.monthly_targets?.sales_target ?? 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{
                  width: `${getTargetProgress(stats?.monthly_targets?.sales_achieved ?? 0, stats?.monthly_targets?.sales_target ?? 1)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/dashboard/leads">
            <Button className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
          </Link>

          <Link to="/dashboard/properties">
            <Button variant="outline" className="w-full justify-start">
              <Building className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>

          <Link to="/dashboard/activities">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </Link>

          <Link to="/dashboard/communication">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </Link>
        </div>
      </div>
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* My Recent Leads */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Recent Leads</h3>
            <Link
              to="/dashboard/leads"
              aria-label="Go to Leads"
              className="inline-flex items-center justify-center rounded-md text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {myLeads.length > 0 ? (
              myLeads.map((lead) => (
                <div
                  key={lead.id ?? `${lead.first_name}-${lead.last_name}-${lead.created_at ?? ''}`}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                          {((lead.first_name?.[0] || '') + (lead.last_name?.[0] || '')).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {(lead.first_name ?? '') + ' ' + (lead.last_name ?? '')}
                          </p>

                          <div className="mt-0.5 space-y-0.5">
                            <p className="text-sm text-gray-600 flex items-center min-w-0">
                              <Mail className="h-3 w-3 mr-1 shrink-0" />
                              <span className="truncate">{lead.email ?? '-'}</span>
                            </p>

                            {lead.phone && (
                              <p className="text-sm text-gray-600 flex items-center min-w-0">
                                <Phone className="h-3 w-3 mr-1 shrink-0" />
                                <span className="truncate">{lead.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${getLeadStatusColor(
                          lead.status
                        )}`}
                      >
                        {lead.status ?? 'New'}
                      </span>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{safeDate(lead.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No recent leads</p>
                <Link to="/dashboard/leads">
                  <Button className="mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Lead
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Activities */}
        <section className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Activities</h3>
            <Link
              to="/dashboard/activities"
              aria-label="Go to Activities"
              className="inline-flex items-center justify-center rounded-md text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingActivities.length > 0 ? (
              upcomingActivities.map((activity) => (
                <div
                  key={activity.id ?? JSON.stringify(activity)}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.title ?? activity.description ?? 'Untitled'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.scheduled_at ?? activity.created_at ?? Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="sm:ml-auto">
                    <span className="inline-block px-2 py-1 text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      {activity.type ?? 'Task'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No upcoming activities</p>
                <Link to="/dashboard/activities">
                  <Button className="mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Activity
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>



    </div>
  );
};

export default AgentDashboard;
