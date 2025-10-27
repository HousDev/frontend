// src/pages/dashboard/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building,
  Activity,
  Settings,
  TrendingUp,
  Shield,
  Database,
  BarChart3,
  UserCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, usersAPI } from "@/lib/api";
import { leadsAPI } from "@/lib/leadAPI";
import { propertiesAPI } from "@/lib/propertiesAPI";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/useToast";

interface AdminStats {
  total_users: number;
  active_users: number;
  total_properties: number;
  total_leads: number;
  system_health?: string;
  recent_activities: number;
}

const defaultStats: AdminStats = {
  total_users: 0,
  active_users: 0,
  total_properties: 0,
  total_leads: 0,
  system_health: "unknown",
  recent_activities: 0,
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    let shownToast = false;

    const showErrorOnce = (msg: string) => {
      if (!shownToast) {
        toast.error(msg);
        shownToast = true;
      }
    };

    const parseMaybeResp = (resp: any) => {
      // Accept either resp, resp.data, or resp.data.data etc.
      if (!resp) return null;
      if (typeof resp !== "object") return null;
      if (resp?.data !== undefined) return resp.data;
      return resp;
    };

    const fetchAdminData = async () => {
      if (isMounted) setLoading(true);

      // 1) Try admin stats endpoint
      let adminPayload: any = null;
      try {
        const resp = await dashboardAPI.getAdminStats().catch((e: any) => {
          console.warn("dashboardAPI.getAdminStats error:", e);
          return null;
        });

        
        adminPayload = parseMaybeResp(resp);

        // If endpoint explicitly returns success:false, treat as failure
        if (adminPayload?.success === false) {
          console.warn("getAdminStats returned success:false ->", adminPayload.message ?? adminPayload);
          adminPayload = null;
        }
      } catch (err) {
        console.warn("Error calling dashboardAPI.getAdminStats:", err);
        adminPayload = null;
      }

      // If adminPayload exists and contains expected fields, use them
      if (adminPayload && (adminPayload.total_users || adminPayload.total_properties || adminPayload.total_leads || adminPayload.recent_activities)) {
        // accept multiple possible field shapes
        const normalized: AdminStats = {
          total_users:
            adminPayload.total_users ??
            adminPayload.users_count ??
            adminPayload.usersTotal ??
            defaultStats.total_users,
          active_users:
            adminPayload.active_users ??
            adminPayload.activeUsers ??
            0,
          total_properties:
            adminPayload.total_properties ??
            adminPayload.properties_count ??
            adminPayload.propertiesTotal ??
            defaultStats.total_properties,
          total_leads:
            adminPayload.total_leads ??
            adminPayload.leads_count ??
            adminPayload.leadsTotal ??
            defaultStats.total_leads,
          system_health: adminPayload.system_health ?? adminPayload.health ?? defaultStats.system_health,
          recent_activities:
            adminPayload.recent_activities ??
            adminPayload.activities_count ??
            defaultStats.recent_activities,
        };
        if (isMounted) setStats(normalized);
      } else {
        // fallback plan: compute totals from list endpoints (leads/properties/users) if admin endpoint missing
        console.warn("admin stats endpoint missing or unexpected shape — falling back to list-based totals");
        try {
          // Fire list calls in parallel
          const [usersResp, leadsResp, propsResp] = await Promise.all([
            usersAPI.getAllUsers?.({ limit: 1 }).catch((e: any) => { console.warn("usersAPI.getUsers error", e); return null; }),
            leadsAPI.getLeads({ limit: 1 }).catch((e: any) => { console.warn("leadsAPI.getLeads error", e); return null; }),
            propertiesAPI.getProperties({ limit: 1 }).catch((e: any) => { console.warn("propertiesAPI.getProperties error", e); return null; }),
          ]);

        

          // Try to grab counts from responses if provided
          const tryCountFrom = (r: any) => {
            if (!r) return undefined;
            const p = parseMaybeResp(r);
            // common shapes: { count: X } or { total: X } or { meta: { total: X } } or array
            if (typeof p?.count === "number") return p.count;
            if (typeof p?.total === "number") return p.total;
            if (typeof p?.total_count === "number") return p.total_count;
            if (typeof p?.length === "number") return p.length;
            if (Array.isArray(p)) return p.length;
            if (typeof p?.meta?.total === "number") return p.meta.total;
            return undefined;
          };

          const usersCount = tryCountFrom(usersResp) ?? defaultStats.total_users;
          const leadsCount = tryCountFrom(leadsResp) ?? defaultStats.total_leads;
          const propsCount = tryCountFrom(propsResp) ?? defaultStats.total_properties;

          if (isMounted) {
            setStats(prev => ({
              ...prev,
              total_users: usersCount,
              total_leads: leadsCount,
              total_properties: propsCount,
            }));
          }
        } catch (err) {
          console.warn("Fallback list-based totals failed:", err);
          showErrorOnce("Failed to load admin dashboard data");
        }
      }

      // 2) Try system alerts
      try {
        const alertsResp = await dashboardAPI.getSystemAlerts().catch((e: any) => {
          console.warn("dashboardAPI.getSystemAlerts error:", e);
          return null;
        });
       
        const alertsPayload = parseMaybeResp(alertsResp);

        if (alertsPayload && Array.isArray(alertsPayload)) {
          if (isMounted) setSystemAlerts(alertsPayload);
        } else if (alertsPayload?.data && Array.isArray(alertsPayload.data)) {
          if (isMounted) setSystemAlerts(alertsPayload.data);
        } else if (alertsPayload?.success === false) {
          console.warn("getSystemAlerts returned success:false ->", alertsPayload.message ?? alertsPayload);
        } else {
          // shape unknown — ignore silently
        }
      } catch (err) {
        console.warn("Failed to fetch system alerts:", err);
      }

      // ensure loading turned off
      if (isMounted) setLoading(false);
    };

    // fetch only when user present to ensure auth token is ready
    if (user) {
      fetchAdminData().catch(e => {
        console.error("fetchAdminData top-level error:", e);
        if (isMounted) {
          setLoading(false);
          showErrorOnce("Failed to load admin dashboard data");
        }
      });
    } else {
      // no user yet -> don't attempt calls
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

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
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
  {/* Title & Description */}
  <div>
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
    <p className="text-sm md:text-base text-gray-600 mt-1">System overview and management controls</p>
  </div>

  {/* Action Buttons */}
 <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 w-full md:w-auto">
  <Link to="/dashboard/settings/roles-permissions" className="w-full">
    <Button className="flex items-center justify-center space-x-2 w-full">
      <Shield className="h-4 w-4" />
      <span>Manage Roles</span>
    </Button>
  </Link>
  <Link to="/dashboard/settings" className="w-full">
    <Button variant="outline" className="flex items-center justify-center space-x-2 w-full">
      <Settings className="h-4 w-4" />
      <span>System Settings</span>
    </Button>
  </Link>
</div>

</div>


      {/* System Health Alert
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            System Status: {stats.system_health ?? "Healthy"}
          </span>
        </div>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_users ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats.active_users ?? 0} active users</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_properties ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Building className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Total listings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_leads ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">All time leads</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recent_activities ?? 0}</p>
            </div>
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Recent activities</p>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
            User Management
          </h3>
          <p className="text-gray-600 mb-4">Manage users, roles, and permissions</p>
          <div className="space-y-2">
            <Link to="/dashboard/users">
              <Button variant="outline" className="w-full justify-start">View All Users</Button>
            </Link>
            <Link to="/dashboard/settings/roles-permissions">
              <Button variant="outline" className="w-full justify-start">Manage Roles & Permissions</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-green-500" />
            Data Management
          </h3>
          <p className="text-gray-600 mb-4">Manage system data and imports</p>
          <div className="space-y-2">
            <Link to="/dashboard/settings/master-data">
              <Button variant="outline" className="w-full justify-start">Master Data</Button>
            </Link>
            <Link to="/dashboard/settings/import-export">
              <Button variant="outline" className="w-full justify-start">Import/Export</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Analytics & Reports
          </h3>
          <p className="text-gray-600 mb-4">View system analytics and reports</p>
          <div className="space-y-2">
            <Link to="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start">View Analytics</Button>
            </Link>
            <Link to="/dashboard/settings/integrations">
              <Button variant="outline" className="w-full justify-start">Integrations</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            System Alerts
          </h3>
          <div className="space-y-3">
            {systemAlerts.map((alert, i) => (
              <div key={i} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-3" />
                <span className="text-yellow-800">{alert?.message ?? alert?.text ?? JSON.stringify(alert)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
