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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
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

  // If you still want to show "System Alerts", you can push
  // local/derived alerts into this array below (kept for UX parity).
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

    // Normalize typical API wrappers: resp, resp.data, resp.data.data, etc.
    const parseMaybeResp = (resp: any) => {
      if (!resp || typeof resp !== "object") return null;
      if (resp?.data !== undefined) return resp.data;
      return resp;
    };

    // Try to extract a "total count" without fetching full lists
    const tryCountFrom = (r: any): number | undefined => {
      if (!r) return undefined;
      const p = parseMaybeResp(r);
      // Common shapes:
      // { count }, { total }, { total_count }, { meta: { total } }, array
      if (typeof p?.count === "number") return p.count;
      if (typeof p?.total === "number") return p.total;
      if (typeof p?.total_count === "number") return p.total_count;
      if (typeof p?.meta?.total === "number") return p.meta.total;
      if (Array.isArray(p)) return p.length;
      if (typeof p?.length === "number") return p.length;
      return undefined;
    };

    const fetchAdminData = async () => {
      if (isMounted) setLoading(true);

      try {
        // Fetch tiny pages just to get counts from metadata if your APIs support it.
        const [usersResp, leadsResp, propsResp] = await Promise.all([
          usersAPI.getAllUsers?.({ limit: 1 }).catch((e: any) => {
            console.warn("usersAPI.getAllUsers error", e);
            return null;
          }),
          leadsAPI.getLeads?.({ limit: 1 }).catch((e: any) => {
            console.warn("leadsAPI.getLeads error", e);
            return null;
          }),
          propertiesAPI.getProperties?.({ limit: 1 }).catch((e: any) => {
            console.warn("propertiesAPI.getProperties error", e);
            return null;
          }),
        ]);

        const usersCount = tryCountFrom(usersResp) ?? defaultStats.total_users;
        const leadsCount = tryCountFrom(leadsResp) ?? defaultStats.total_leads;
        const propsCount = tryCountFrom(propsResp) ?? defaultStats.total_properties;

        // Optional: derive some lightweight "alerts" locally (no API).
        const localAlerts: any[] = [];
        if (usersCount === 0 && leadsCount > 0) {
          localAlerts.push({ message: "No users found but leads exist. Check user import/config." });
        }
        if (propsCount === 0 && leadsCount > 0) {
          localAlerts.push({ message: "You have leads but no properties yet. Consider adding listings." });
        }

        if (isMounted) {
          setStats(prev => ({
            ...prev,
            total_users: usersCount,
            total_leads: leadsCount,
            total_properties: propsCount,
            // active_users cannot be reliably derived from a 1-item page;
            // keep 0 unless your usersAPI exposes a direct active count in metadata.
            active_users: prev.active_users ?? 0,
            // recent_activities similarly unknown without a dedicated endpoint:
            recent_activities: prev.recent_activities ?? 0,
          }));
          setSystemAlerts(localAlerts);
        }
      } catch (err) {
        console.warn("Failed to load admin dashboard data:", err);
        showErrorOnce("Failed to load admin dashboard data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) {
      fetchAdminData().catch(e => {
        console.error("fetchAdminData top-level error:", e);
        if (isMounted) {
          setLoading(false);
          showErrorOnce("Failed to load admin dashboard data");
        }
      });
    } else {
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

      {/* System Alerts (local/derived only; no API) */}
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
