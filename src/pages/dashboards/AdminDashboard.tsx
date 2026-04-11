// // src/pages/dashboard/AdminDashboard.tsx
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Users,
//   Building,
//   Activity,
//   Settings,
//   TrendingUp,
//   Shield,
//   Database,
//   BarChart3,
//   UserCheck,
//   AlertCircle,
// } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import { usersAPI } from "@/lib/api";
// import { leadsAPI } from "@/lib/leadAPI";
// import { propertiesAPI } from "@/lib/propertiesAPI";
// import Button from "@/components/ui/Button";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";
// import { toast } from "@/hooks/useToast";

// interface AdminStats {
//   total_users: number;
//   active_users: number;
//   total_properties: number;
//   total_leads: number;
//   system_health?: string;
//   recent_activities: number;
// }

// const defaultStats: AdminStats = {
//   total_users: 0,
//   active_users: 0,
//   total_properties: 0,
//   total_leads: 0,
//   system_health: "unknown",
//   recent_activities: 0,
// };

// const AdminDashboard: React.FC = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<AdminStats>(defaultStats);
//   const [loading, setLoading] = useState(true);

//   // If you still want to show "System Alerts", you can push
//   // local/derived alerts into this array below (kept for UX parity).
//   const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

//   useEffect(() => {
//     let isMounted = true;
//     let shownToast = false;

//     const showErrorOnce = (msg: string) => {
//       if (!shownToast) {
//         toast.error(msg);
//         shownToast = true;
//       }
//     };

//     // Normalize typical API wrappers: resp, resp.data, resp.data.data, etc.
//     const parseMaybeResp = (resp: any) => {
//       if (!resp || typeof resp !== "object") return null;
//       if (resp?.data !== undefined) return resp.data;
//       return resp;
//     };

//     // Try to extract a "total count" without fetching full lists
//     const tryCountFrom = (r: any): number | undefined => {
//       if (!r) return undefined;
//       const p = parseMaybeResp(r);
//       // Common shapes:
//       // { count }, { total }, { total_count }, { meta: { total } }, array
//       if (typeof p?.count === "number") return p.count;
//       if (typeof p?.total === "number") return p.total;
//       if (typeof p?.total_count === "number") return p.total_count;
//       if (typeof p?.meta?.total === "number") return p.meta.total;
//       if (Array.isArray(p)) return p.length;
//       if (typeof p?.length === "number") return p.length;
//       return undefined;
//     };

//     const fetchAdminData = async () => {
//       if (isMounted) setLoading(true);

//       try {
//         // Fetch tiny pages just to get counts from metadata if your APIs support it.
//         const [usersResp, leadsResp, propsResp] = await Promise.all([
//           usersAPI.getAllUsers?.({ limit: 1 }).catch((e: any) => {
//             console.warn("usersAPI.getAllUsers error", e);
//             return null;
//           }),
//           leadsAPI.getLeads?.({ limit: 1 }).catch((e: any) => {
//             console.warn("leadsAPI.getLeads error", e);
//             return null;
//           }),
//           propertiesAPI.getProperties?.({ limit: 1 }).catch((e: any) => {
//             console.warn("propertiesAPI.getProperties error", e);
//             return null;
//           }),
//         ]);

//         const usersCount = tryCountFrom(usersResp) ?? defaultStats.total_users;
//         const leadsCount = tryCountFrom(leadsResp) ?? defaultStats.total_leads;
//         const propsCount = tryCountFrom(propsResp) ?? defaultStats.total_properties;

//         // Optional: derive some lightweight "alerts" locally (no API).
//         const localAlerts: any[] = [];
//         if (usersCount === 0 && leadsCount > 0) {
//           localAlerts.push({ message: "No users found but leads exist. Check user import/config." });
//         }
//         if (propsCount === 0 && leadsCount > 0) {
//           localAlerts.push({ message: "You have leads but no properties yet. Consider adding listings." });
//         }

//         if (isMounted) {
//           setStats(prev => ({
//             ...prev,
//             total_users: usersCount,
//             total_leads: leadsCount,
//             total_properties: propsCount,
//             // active_users cannot be reliably derived from a 1-item page;
//             // keep 0 unless your usersAPI exposes a direct active count in metadata.
//             active_users: prev.active_users ?? 0,
//             // recent_activities similarly unknown without a dedicated endpoint:
//             recent_activities: prev.recent_activities ?? 0,
//           }));
//           setSystemAlerts(localAlerts);
//         }
//       } catch (err) {
//         console.warn("Failed to load admin dashboard data:", err);
//         showErrorOnce("Failed to load admin dashboard data");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     if (user) {
//       fetchAdminData().catch(e => {
//         console.error("fetchAdminData top-level error:", e);
//         if (isMounted) {
//           setLoading(false);
//           showErrorOnce("Failed to load admin dashboard data");
//         }
//       });
//     } else {
//       setLoading(false);
//     }

//     return () => {
//       isMounted = false;
//     };
//   }, [user]);

//   if (loading) {
//     return (
//       <div className="flex justify-center py-12">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         {/* Title & Description */}
//         <div>
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//           <p className="text-sm md:text-base text-gray-600 mt-1">System overview and management controls</p>
//         </div>

//         {/* Action Buttons */}
//         <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 w-full md:w-auto">
//           <Link to="/dashboard/settings/roles-permissions" className="w-full">
//             <Button className="flex items-center justify-center space-x-2 w-full">
//               <Shield className="h-4 w-4" />
//               <span>Manage Roles</span>
//             </Button>
//           </Link>
//           <Link to="/dashboard/settings" className="w-full">
//             <Button variant="outline" className="flex items-center justify-center space-x-2 w-full">
//               <Settings className="h-4 w-4" />
//               <span>System Settings</span>
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Users</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.total_users ?? 0}</p>
//             </div>
//             <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
//               <Users className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">{stats.active_users ?? 0} active users</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Properties</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.total_properties ?? 0}</p>
//             </div>
//             <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
//               <Building className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Total listings</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Leads</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.total_leads ?? 0}</p>
//             </div>
//             <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
//               <TrendingUp className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">All time leads</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Activities</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.recent_activities ?? 0}</p>
//             </div>
//             <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
//               <Activity className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Recent activities</p>
//         </div>
//       </div>

//       {/* Quick action cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//             <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
//             User Management
//           </h3>
//           <p className="text-gray-600 mb-4">Manage users, roles, and permissions</p>
//           <div className="space-y-2">
//             <Link to="/dashboard/users">
//               <Button variant="outline" className="w-full justify-start">View All Users</Button>
//             </Link>
//             <Link to="/dashboard/settings/roles-permissions">
//               <Button variant="outline" className="w-full justify-start">Manage Roles & Permissions</Button>
//             </Link>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//             <Database className="h-5 w-5 mr-2 text-green-500" />
//             Data Management
//           </h3>
//           <p className="text-gray-600 mb-4">Manage system data and imports</p>
//           <div className="space-y-2">
//             <Link to="/dashboard/settings/master-data">
//               <Button variant="outline" className="w-full justify-start">Master Data</Button>
//             </Link>
//             <Link to="/dashboard/settings/import-export">
//               <Button variant="outline" className="w-full justify-start">Import/Export</Button>
//             </Link>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//             <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
//             Analytics & Reports
//           </h3>
//           <p className="text-gray-600 mb-4">View system analytics and reports</p>
//           <div className="space-y-2">
//             <Link to="/dashboard/analytics">
//               <Button variant="outline" className="w-full justify-start">View Analytics</Button>
//             </Link>
//             <Link to="/dashboard/settings/integrations">
//               <Button variant="outline" className="w-full justify-start">Integrations</Button>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* System Alerts (local/derived only; no API) */}
//       {systemAlerts.length > 0 && (
//         <div className="bg-white rounded-lg shadow p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//             <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
//             System Alerts
//           </h3>
//           <div className="space-y-3">
//             {systemAlerts.map((alert, i) => (
//               <div key={i} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <AlertCircle className="h-4 w-4 text-yellow-600 mr-3" />
//                 <span className="text-yellow-800">{alert?.message ?? alert?.text ?? JSON.stringify(alert)}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;



// src/pages/dashboard/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Building, Activity, Settings, TrendingUp, Shield, Database,
  BarChart3, UserCheck, AlertCircle, ChevronRight, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usersAPI } from "@/lib/api";
import { leadsAPI } from "@/lib/leadAPI";
import { propertiesAPI } from "@/lib/propertiesAPI";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/useToast";

// ─── Theme ────────────────────────────────────────────────────────────────────
const NAVY = "#0c3854";
const ORANGE = "#e87722";
const NAVY_LIGHT = "#f0f4f8";

interface AdminStats {
  total_users: number; active_users: number; total_properties: number;
  total_leads: number; system_health?: string; recent_activities: number;
}

const defaultStats: AdminStats = {
  total_users: 0, active_users: 0, total_properties: 0,
  total_leads: 0, system_health: "unknown", recent_activities: 0,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, accent, cardBg }: {
  icon: React.ReactNode; label: string; value: number | string; 
  sub: string; accent: string; cardBg?: string;
}) => (
 <div className="rounded-xl p-2.5 border flex items-center gap-2.5 hover:shadow-md transition-shadow"
  style={{ borderColor: "#dce5ee", background: cardBg || "white" }}>
  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: accent }}>
    {icon}
  </div>
  <div className="min-w-0">
    <p className="text-[10px] font-medium uppercase tracking-wide leading-tight" style={{ color: "#7a95a8" }}>{label}</p>
    <p className="text-lg font-bold leading-tight" style={{ color: NAVY }}>{value}</p>
    <p className="text-[10px] font-medium leading-tight" style={{ color: "#7a95a8" }}>{sub}</p>
  </div>
</div>
  
);

// ─── Action Card ─────────────────────────────────────────────────────────────
const ActionCard = ({ icon, title, description, links }: {
  icon: React.ReactNode; title: string; description: string;
  links: Array<{ to: string; label: string }>;
}) => (
  <div className="bg-white rounded-xl p-5 border hover:shadow-md transition-shadow" style={{ borderColor: "#dce5ee" }}>
    <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${NAVY}12` }}>
        <span style={{ color: NAVY }}>{icon}</span>
      </div>
      <h3 className="font-semibold text-sm" style={{ color: NAVY }}>{title}</h3>
    </div>
    <p className="text-xs mb-4" style={{ color: "#7a95a8" }}>{description}</p>
    <div className="space-y-2">
      {links.map((link, i) => (
        <Link key={link.to} to={link.to}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-sm"
          style={{
            borderColor: i === 0 ? NAVY : "#dce5ee",
            background: i === 0 ? NAVY : "white",
            color: i === 0 ? "white" : ORANGE,
          }}>
          <span>{link.label}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ))}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    let shownToast = false;
    const showErrorOnce = (msg: string) => { if (!shownToast) { toast.error(msg); shownToast = true; } };

    const parseMaybeResp = (resp: any) => {
      if (!resp || typeof resp !== "object") return null;
      if (resp?.data !== undefined) return resp.data;
      return resp;
    };

    const tryCountFrom = (r: any): number | undefined => {
      if (!r) return undefined;
      const p = parseMaybeResp(r);
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
        const [usersResp, leadsResp, propsResp] = await Promise.all([
          usersAPI.getAllUsers?.({ limit: 1 }).catch((e: any) => { console.warn("usersAPI error", e); return null; }),
          leadsAPI.getLeads?.({ limit: 1 }).catch((e: any) => { console.warn("leadsAPI error", e); return null; }),
          propertiesAPI.getProperties?.({ limit: 1 }).catch((e: any) => { console.warn("propsAPI error", e); return null; }),
        ]);
        const usersCount = tryCountFrom(usersResp) ?? defaultStats.total_users;
        const leadsCount = tryCountFrom(leadsResp) ?? defaultStats.total_leads;
        const propsCount = tryCountFrom(propsResp) ?? defaultStats.total_properties;
        const localAlerts: any[] = [];
        if (usersCount === 0 && leadsCount > 0) localAlerts.push({ message: "No users found but leads exist. Check user import/config." });
        if (propsCount === 0 && leadsCount > 0) localAlerts.push({ message: "You have leads but no properties yet. Consider adding listings." });
        if (isMounted) {
          setStats(prev => ({ ...prev, total_users: usersCount, total_leads: leadsCount, total_properties: propsCount, active_users: prev.active_users ?? 0, recent_activities: prev.recent_activities ?? 0 }));
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
      fetchAdminData().catch(e => { console.error("fetchAdminData error:", e); if (isMounted) { setLoading(false); showErrorOnce("Failed to load admin dashboard data"); } });
    } else { setLoading(false); }
    return () => { isMounted = false; };
  }, [user]);

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5" style={{ background: NAVY_LIGHT, minHeight: "100%" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
              <Shield className="h-4 w-4" style={{ color: "white" }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>Admin Dashboard</h1>
          </div>
          <p className="text-sm" style={{ color: "#7a95a8" }}>System overview and management controls</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/settings/roles-permissions">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: ORANGE }}>
              <Shield className="h-4 w-4" />
              <span>Manage Roles</span>
            </button>
          </Link>
          <Link to="/dashboard/settings">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:shadow-sm"
              style={{ borderColor: NAVY, color: NAVY, background: "white" }}>
              <Settings className="h-4 w-4" />
              <span>System Settings</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <StatCard icon={<Users className="h-4 w-4 text-white" />} label="Total Users" value={stats.total_users} sub={`${stats.active_users} active`} accent={NAVY} cardBg="#e8eef5" />
  <StatCard icon={<Building className="h-4 w-4 text-white" />} label="Properties" value={stats.total_properties} sub="Total listings" accent="#16a34a" cardBg="#e8f5eb" />
  <StatCard icon={<TrendingUp className="h-4 w-4 text-white" />} label="Total Leads" value={stats.total_leads} sub="All time" accent={ORANGE} cardBg="#fff0e6" />
  <StatCard icon={<Activity className="h-4 w-4 text-white" />} label="Activities" value={stats.recent_activities} sub="Recent" accent="#7c3aed" cardBg="#f0ebff" />
</div>

      {/* ── System Health Strip ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl px-5 py-4 border flex flex-wrap items-center gap-4" style={{ borderColor: "#dce5ee" }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#16a34a" }} />
          <span className="text-sm font-medium" style={{ color: NAVY }}>System Operational</span>
        </div>
        <div className="flex flex-wrap gap-3 ml-auto">
          {[
            { label: "Users", value: stats.total_users, color: NAVY },
            { label: "Properties", value: stats.total_properties, color: "#16a34a" },
            { label: "Leads", value: stats.total_leads, color: ORANGE },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs">
              <span style={{ color: "#7a95a8" }}>{item.label}:</span>
              <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          icon={<UserCheck className="h-4 w-4" />}
          title="User Management"
          description="Manage users, roles, and permissions across the system"
          links={[
            { to: "/dashboard/users", label: "View All Users" },
            { to: "/dashboard/settings/roles-permissions", label: "Roles & Permissions" },
          ]}
        />
        <ActionCard
          icon={<Database className="h-4 w-4" />}
          title="Data Management"
          description="Manage system data, master records, and imports"
          links={[
            { to: "/dashboard/settings/master-data", label: "Master Data" },
            { to: "/dashboard/settings/import-export", label: "Import / Export" },
          ]}
        />
        <ActionCard
          icon={<BarChart3 className="h-4 w-4" />}
          title="Analytics & Reports"
          description="View system analytics, reports, and integrations"
          links={[
            { to: "/dashboard/analytics", label: "View Analytics" },
            { to: "/dashboard/settings/integrations", label: "Integrations" },
          ]}
        />
      </div>

      {/* ── System Alerts ───────────────────────────────────────────────────── */}
      {systemAlerts.length > 0 && (
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "#dce5ee" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: NAVY }}>System Alerts</h3>
          </div>
          <div className="space-y-2">
            {systemAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border"
                style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm" style={{ color: "#92400e" }}>{alert?.message ?? alert?.text ?? JSON.stringify(alert)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;