// // src/pages/dashboard/AgentDashboard.tsx
// import React, { CSSProperties, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Users,
//   Building,
//   Target,
//   TrendingUp,
//   Calendar,
//   Phone,
//   Mail,
//   ArrowRight,
//   Plus,
//   Clock,
// } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// // ❌ Removed all API imports (dashboardAPI, activitiesAPI, leadsAPI, propertiesAPI)
// import Button from "@/components/ui/Button";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";
// import { toast } from "@/hooks/useToast";

// interface AgentStats {
//   my_leads?: {
//     total_leads?: number;
//     new_leads?: number;
//     hot_leads?: number;
//     converted_leads?: number;
//     conversion_rate?: number;
//   };
//   my_properties?: {
//     total_listings?: number;
//     active_listings?: number;
//     sold_this_month?: number;
//   };
//   monthly_targets?: {
//     leads_target?: number;
//     leads_achieved?: number;
//     sales_target?: number;
//     sales_achieved?: number;
//   };
//   upcoming_activities?: number;
//   today_followups?: number;
// }

// const emptyAgentStats: AgentStats = {
//   my_leads: {
//     total_leads: 0,
//     new_leads: 0,
//     hot_leads: 0,
//     converted_leads: 0,
//     conversion_rate: 0,
//   },
//   my_properties: {
//     total_listings: 0,
//     active_listings: 0,
//     sold_this_month: 0,
//   },
//   monthly_targets: {
//     leads_target: 0,
//     leads_achieved: 0,
//     sales_target: 0,
//     sales_achieved: 0,
//   },
//   upcoming_activities: 0,
//   today_followups: 0,
// };

// /* ---------------- Mock data (no APIs) ---------------- */
// type MockLead = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email?: string;
//   phone?: string;
//   status?: "Hot" | "Warm" | "Cold" | "Qualified" | "Converted" | "New";
//   created_at: string;
// };

// type MockActivity = {
//   id: number;
//   title?: string;
//   description?: string;
//   type?: "Call" | "Meeting" | "Visit" | "Task";
//   scheduled_at?: string;
//   created_at?: string;
// };

// const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// const randomFrom = <T,>(arr: T[]): T => arr[rand(0, arr.length - 1)];

// const names = ["Aarav", "Vihaan", "Aditya", "Ishaan", "Kabir", "Riya", "Anaya", "Diya", "Aanya", "Sara"];
// const surnames = ["Sharma", "Verma", "Patel", "Agarwal", "Gupta", "Kulkarni", "Iyer", "Reddy", "Singh", "Khan"];
// const statuses: MockLead["status"][] = ["New", "Hot", "Warm", "Cold", "Qualified", "Converted"];
// const activityTypes: Required<MockActivity>["type"][] = ["Call", "Meeting", "Visit", "Task"];

// function daysFromNow(offset: number) {
//   const d = new Date();
//   d.setDate(d.getDate() + offset);
//   return d.toISOString();
// }

// function generateMockData() {
//   // Leads: between 12 and 40 items with dates over the last 45 days
//   const leadCount = rand(12, 40);
//   const leads: MockLead[] = Array.from({ length: leadCount }).map((_, i) => {
//     const first = randomFrom(names);
//     const last = randomFrom(surnames);
//     const createdOffset = -rand(0, 45); // past days
//     const status = randomFrom(statuses);
//     return {
//       id: i + 1,
//       first_name: first,
//       last_name: last,
//       email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
//       phone: `9${rand(100000000, 999999999)}`,
//       status,
//       created_at: daysFromNow(createdOffset),
//     };
//   });

//   // Activities: between 3 and 12 items (some future, some recent)
//   const actCount = rand(3, 12);
//   const activities: MockActivity[] = Array.from({ length: actCount }).map((_, i) => {
//     const isFuture = Math.random() > 0.4;
//     const offset = isFuture ? rand(0, 10) : -rand(0, 10);
//     const when = daysFromNow(offset);
//     const t = randomFrom(activityTypes);
//     return {
//       id: i + 1,
//       title: `${t} with client`,
//       description: `${t} regarding property options`,
//       type: t,
//       scheduled_at: when,
//       created_at: daysFromNow(-rand(0, 15)),
//     };
//   });

//   // Properties (simple mock)
//   const totalListings = rand(0, 12);
//   const activeListings = Math.min(totalListings, rand(0, totalListings));
//   const soldThisMonth = rand(0, Math.max(0, totalListings - activeListings));

//   return { leads, activities, properties: { totalListings, activeListings, soldThisMonth } };
// }
// /* ---------------------------------------------------- */

// const AgentDashboard: React.FC = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<AgentStats>(emptyAgentStats);
//   const [myLeads, setMyLeads] = useState<any[]>([]);
//   const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true;

//     const computeStatsFromMock = () => {
//       const { leads, activities, properties } = generateMockData();

//       // Sort leads: latest first; keep top 5 for the widget
//       const recentLeads = [...leads].sort(
//         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//       );

//       // Upcoming activities = future scheduled; keep top 5 soonest
//       const futureActs = activities
//         .filter(a => a.scheduled_at && new Date(a.scheduled_at).getTime() >= Date.now())
//         .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

//       // Derivations
//       const now = new Date();
//       const startOfWeek = new Date(now);
//       startOfWeek.setDate(now.getDate() - 7);

//       const createdThisWeek = leads.filter(
//         l => new Date(l.created_at).getTime() >= startOfWeek.getTime()
//       ).length;

//       const hotLeads = leads.filter(l => (l.status || "").toLowerCase() === "hot").length;

//       const convertedLeads = leads.filter(l => {
//         const s = (l.status || "").toLowerCase();
//         return s === "converted" || s === "qualified";
//       }).length;

//       const conversionRate = leads.length
//         ? Math.round((convertedLeads / leads.length) * 100)
//         : 0;

//       // Monthly leads achieved
//       const leadsThisMonth = leads.filter(l => {
//         const d = new Date(l.created_at);
//         return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//       }).length;

//       // Today followups (activities scheduled today)
//       const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
//         now.getDate()
//       ).padStart(2, "0")}`;
//       const todayFollowups = activities.filter(a => {
//         if (!a.scheduled_at) return false;
//         const d = new Date(a.scheduled_at);
//         const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//           d.getDate()
//         ).padStart(2, "0")}`;
//         return k === todayKey;
//       }).length;

//       const computed: AgentStats = {
//         my_leads: {
//           total_leads: leads.length,
//           new_leads: createdThisWeek,
//           hot_leads: hotLeads,
//           converted_leads: convertedLeads,
//           conversion_rate: conversionRate,
//         },
//         my_properties: {
//           total_listings: properties.totalListings,
//           active_listings: properties.activeListings,
//           sold_this_month: properties.soldThisMonth,
//         },
//         monthly_targets: {
//           leads_target: 100,
//           leads_achieved: leadsThisMonth,
//           sales_target: 5,
//           sales_achieved: Math.min(5, Math.floor(convertedLeads / 4)),
//         },
//         upcoming_activities: futureActs.length,
//         today_followups: todayFollowups,
//       };

//       if (!isMounted) return;

//       setStats(computed);
//       setMyLeads(recentLeads.slice(0, 5));
//       setUpcomingActivities(futureActs.slice(0, 5));
//     };

//     // Only compute/render once auth is ready (for greeting)
//     if (user) {
//       setLoading(true);
//       try {
//         computeStatsFromMock();
//       } catch (e) {
//         console.error("Mock compute failed:", e);
//         toast.error("Failed to load agent dashboard");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     } else {
//       setLoading(false);
//     }

//     return () => {
//       isMounted = false;
//     };
//   }, [user]);

//   const getTargetProgress = (achieved: number = 0, target: number = 0) => {
//     return target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
//   };

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good morning";
//     if (hour < 18) return "Good afternoon";
//     return "Good evening";
//   };

//   const getLeadStatusColor = (status?: string) => {
//     switch ((status || "").toLowerCase()) {
//       case "hot":
//       case "hot lead":
//         return "bg-red-100 text-red-800";
//       case "warm":
//         return "bg-orange-100 text-orange-800";
//       case "cold":
//         return "bg-blue-100 text-blue-800";
//       case "qualified":
//       case "converted":
//         return "bg-green-100 text-green-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const safeDate = (s?: string | null) => {
//     if (!s) return "-";
//     const d = new Date(s);
//     if (isNaN(d.getTime())) return "-";
//     return d.toLocaleDateString();
//   };

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
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
//         {/* Greeting Section */}
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//             {getGreeting()}, {user?.first_name ?? "Agent"}!
//           </h1>
//           <p className="text-gray-600 mt-1 text-sm sm:text-base">
//             Here's your daily performance overview
//           </p>
//         </div>

//         {/* Button Group */}
//         <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
//           <Link to="/dashboard/leads">
//             <Button className="flex items-center space-x-2 w-full">
//               <Plus className="h-4 w-4" />
//               <span>Add Lead</span>
//             </Button>
//           </Link>
//           <Link to="/dashboard/activities">
//             <Button variant="outline" className="flex items-center space-x-2 w-full">
//               <Calendar className="h-4 w-4" />
//               <span>Schedule Activity</span>
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* (Optional) Priority Alerts (kept commented; enable when needed)
//       {stats?.today_followups && stats.today_followups > 0 && (
//         <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//           <div className="flex items-center space-x-2">
//             <Clock className="h-5 w-5 text-orange-600" />
//             <span className="text-orange-800 font-medium">
//               You have {stats.today_followups} follow-ups due today!
//             </span>
//             <Link to="/dashboard/activities" className="text-orange-600 hover:text-orange-800">
//               <ArrowRight className="h-4 w-4" />
//             </Link>
//           </div>
//         </div>
//       )} */}

//       {/* Performance Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">My Leads</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {stats?.my_leads?.total_leads ?? 0}
//               </p>
//             </div>
//             <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
//               <Users className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             {stats?.my_leads?.new_leads ?? 0} new this week
//           </p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {stats?.my_leads?.conversion_rate ?? 0}%
//               </p>
//             </div>
//             <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
//               <Target className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             {stats?.my_leads?.converted_leads ?? 0} converted
//           </p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Hot Leads</p>
//               <p className="text-2xl font-bold text-gray-900">{stats?.my_leads?.hot_leads ?? 0}</p>
//             </div>
//             <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
//               <TrendingUp className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Properties</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {stats?.my_properties?.active_listings ?? 0}
//               </p>
//             </div>
//             <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
//               <Building className="h-4 w-4 text-white" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             {stats?.my_properties?.sold_this_month ?? 0} sold this month
//           </p>
//         </div>
//       </div>

//       {/* Monthly Targets */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Targets</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm font-medium text-gray-600">Leads Target</span>
//               <span className="text-sm text-gray-900">
//                 {stats?.monthly_targets?.leads_achieved ?? 0} /{" "}
//                 {stats?.monthly_targets?.leads_target ?? 0}
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-3">
//               <div
//                 className="bg-blue-600 h-3 rounded-full"
//                 style={{
//                   width: `${getTargetProgress(
//                     stats?.monthly_targets?.leads_achieved ?? 0,
//                     stats?.monthly_targets?.leads_target ?? 1
//                   )}%`,
//                 } as CSSProperties}
//               />
//             </div>
//           </div>

//           <div>
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm font-medium text-gray-600">Sales Target</span>
//               <span className="text-sm text-gray-900">
//                 ₹{stats?.monthly_targets?.sales_achieved ?? 0} / ₹
//                 {stats?.monthly_targets?.sales_target ?? 0}
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-3">
//               <div
//                 className="bg-green-600 h-3 rounded-full"
//                 style={{
//                   width: `${getTargetProgress(
//                     stats?.monthly_targets?.sales_achieved ?? 0,
//                     stats?.monthly_targets?.sales_target ?? 1
//                   )}%`,
//                 } as CSSProperties}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Link to="/dashboard/leads">
//             <Button className="w-full justify-start">
//               <Plus className="h-4 w-4 mr-2" />
//               Add New Lead
//             </Button>
//           </Link>

//           <Link to="/dashboard/properties">
//             <Button variant="outline" className="w-full justify-start">
//               <Building className="h-4 w-4 mr-2" />
//               Add Property
//             </Button>
//           </Link>

//           <Link to="/dashboard/activities">
//             <Button variant="outline" className="w-full justify-start">
//               <Calendar className="h-4 w-4 mr-2" />
//               Schedule Follow-up
//             </Button>
//           </Link>

//           <Link to="/dashboard/communication">
//             <Button variant="outline" className="w-full justify-start">
//               <Mail className="h-4 w-4 mr-2" />
//               Send Message
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Content Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//         {/* My Recent Leads */}
//         <section className="bg-white rounded-lg shadow p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
//             <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Recent Leads</h3>
//             <Link
//               to="/dashboard/leads"
//               aria-label="Go to Leads"
//               className="inline-flex items-center justify-center rounded-md text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               <ArrowRight className="h-4 w-4" />
//             </Link>
//           </div>

//           <div className="space-y-3">
//             {myLeads.length > 0 ? (
//               myLeads.map((lead) => (
//                 <div
//                   key={lead.id ?? `${lead.first_name}-${lead.last_name}-${lead.created_at ?? ""}`}
//                   className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex items-start sm:items-center justify-between gap-3">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start sm:items-center gap-3">
//                         <div className="h-10 w-10 sm:h-11 sm:w-11 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
//                           {((lead.first_name?.[0] || "") + (lead.last_name?.[0] || "")).toUpperCase()}
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <p className="font-medium text-gray-900 truncate">
//                             {(lead.first_name ?? "") + " " + (lead.last_name ?? "")}
//                           </p>

//                           <div className="mt-0.5 space-y-0.5">
//                             <p className="text-sm text-gray-600 flex items-center min-w-0">
//                               <Mail className="h-3 w-3 mr-1 shrink-0" />
//                               <span className="truncate">{lead.email ?? "-"}</span>
//                             </p>

//                             {lead.phone && (
//                               <p className="text-sm text-gray-600 flex items-center min-w-0">
//                                 <Phone className="h-3 w-3 mr-1 shrink-0" />
//                                 <span className="truncate">{lead.phone}</span>
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0">
//                       <span
//                         className={`inline-block px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full ${getLeadStatusColor(
//                           lead.status
//                         )}`}
//                       >
//                         {lead.status ?? "New"}
//                       </span>
//                       <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
//                         {safeDate(lead.created_at)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8">
//                 <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
//                 <p className="text-gray-500 text-sm sm:text-base">No recent leads</p>
//                 <Link to="/dashboard/leads">
//                   <Button className="mt-3">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Your First Lead
//                   </Button>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* Upcoming Activities */}
//         <section className="bg-white rounded-lg shadow p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
//             <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Activities</h3>
//             <Link
//               to="/dashboard/activities"
//               aria-label="Go to Activities"
//               className="inline-flex items-center justify-center rounded-md text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               <ArrowRight className="h-4 w-4" />
//             </Link>
//           </div>

//           <div className="space-y-3">
//             {upcomingActivities.length > 0 ? (
//               upcomingActivities.map((activity) => (
//                 <div
//                   key={activity.id ?? JSON.stringify(activity)}
//                   className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 border border-gray-200 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0" />
//                     <div className="min-w-0">
//                       <p className="font-medium text-gray-900 truncate">
//                         {activity.title ?? activity.description ?? "Untitled"}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         {new Date(activity.scheduled_at ?? activity.created_at ?? Date.now()).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="sm:ml-auto">
//                     <span className="inline-block px-2 py-1 text-[10px] sm:text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
//                       {activity.type ?? "Task"}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8">
//                 <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
//                 <p className="text-gray-500 text-sm sm:text-base">No upcoming activities</p>
//                 <Link to="/dashboard/activities">
//                   <Button className="mt-3">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Schedule Activity
//                   </Button>
//                 </Link>
//               </div>
//             )}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default AgentDashboard;


// src/pages/dashboard/AgentDashboard.tsx
import React, { CSSProperties, useEffect, useState } from "react";
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
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "@/hooks/useToast";

// ─── Theme ────────────────────────────────────────────────────────────────────
const NAVY = "#0c3854";
const ORANGE = "#e87722";
const NAVY_LIGHT = "#f0f4f8";
const ORANGE_LIGHT = "#fff4eb";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  my_leads: { total_leads: 0, new_leads: 0, hot_leads: 0, converted_leads: 0, conversion_rate: 0 },
  my_properties: { total_listings: 0, active_listings: 0, sold_this_month: 0 },
  monthly_targets: { leads_target: 0, leads_achieved: 0, sales_target: 0, sales_achieved: 0 },
  upcoming_activities: 0,
  today_followups: 0,
};

// ─── Mock data (logic unchanged) ──────────────────────────────────────────────
type MockLead = {
  id: number; first_name: string; last_name: string; email?: string; phone?: string;
  status?: "Hot" | "Warm" | "Cold" | "Qualified" | "Converted" | "New"; created_at: string;
};
type MockActivity = {
  id: number; title?: string; description?: string;
  type?: "Call" | "Meeting" | "Visit" | "Task"; scheduled_at?: string; created_at?: string;
};

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = <T,>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const names = ["Aarav", "Vihaan", "Aditya", "Ishaan", "Kabir", "Riya", "Anaya", "Diya", "Aanya", "Sara"];
const surnames = ["Sharma", "Verma", "Patel", "Agarwal", "Gupta", "Kulkarni", "Iyer", "Reddy", "Singh", "Khan"];
const statuses: MockLead["status"][] = ["New", "Hot", "Warm", "Cold", "Qualified", "Converted"];
const activityTypes: Required<MockActivity>["type"][] = ["Call", "Meeting", "Visit", "Task"];

function daysFromNow(offset: number) {
  const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString();
}

function generateMockData() {
  const leadCount = rand(12, 40);
  const leads: MockLead[] = Array.from({ length: leadCount }).map((_, i) => {
    const first = randomFrom(names), last = randomFrom(surnames);
    return { id: i + 1, first_name: first, last_name: last, email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`, phone: `9${rand(100000000, 999999999)}`, status: randomFrom(statuses), created_at: daysFromNow(-rand(0, 45)) };
  });
  const actCount = rand(3, 12);
  const activities: MockActivity[] = Array.from({ length: actCount }).map((_, i) => {
    const isFuture = Math.random() > 0.4, offset = isFuture ? rand(0, 10) : -rand(0, 10), t = randomFrom(activityTypes);
    return { id: i + 1, title: `${t} with client`, description: `${t} regarding property options`, type: t, scheduled_at: daysFromNow(offset), created_at: daysFromNow(-rand(0, 15)) };
  });
  const totalListings = rand(0, 12), activeListings = Math.min(totalListings, rand(0, totalListings)), soldThisMonth = rand(0, Math.max(0, totalListings - activeListings));
  return { leads, activities, properties: { totalListings, activeListings, soldThisMonth } };
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, iconBg, cardBg, subColor, children }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
  iconBg: string; cardBg?: string; subColor?: string; children?: React.ReactNode;
}) => (
  <div className="rounded-xl p-2.5 border flex items-center gap-2.5 hover:shadow-md transition-shadow shrink-0 flex-1 min-w-[130px]"
  style={{ borderColor: "#dce5ee", background: cardBg || "white" }}>
  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#7a95a8" }}>{label}</p>
<p className="text-lg font-bold leading-tight" style={{ color: NAVY }}>{value}</p>
      {children ?? <p className="text-xs font-medium" style={{ color: subColor || "#7a95a8" }}>{sub}</p>}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgentStats>(emptyAgentStats);
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── All logic unchanged ──────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const computeStatsFromMock = () => {
      const { leads, activities, properties } = generateMockData();
      const recentLeads = [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const futureActs = activities.filter(a => a.scheduled_at && new Date(a.scheduled_at).getTime() >= Date.now()).sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
      const now = new Date(), startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      const createdThisWeek = leads.filter(l => new Date(l.created_at).getTime() >= startOfWeek.getTime()).length;
      const hotLeads = leads.filter(l => (l.status || "").toLowerCase() === "hot").length;
      const convertedLeads = leads.filter(l => { const s = (l.status || "").toLowerCase(); return s === "converted" || s === "qualified"; }).length;
      const conversionRate = leads.length ? Math.round((convertedLeads / leads.length) * 100) : 0;
      const leadsThisMonth = leads.filter(l => { const d = new Date(l.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const todayFollowups = activities.filter(a => { if (!a.scheduled_at) return false; const d = new Date(a.scheduled_at); const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; return k === todayKey; }).length;
      const computed: AgentStats = {
        my_leads: { total_leads: leads.length, new_leads: createdThisWeek, hot_leads: hotLeads, converted_leads: convertedLeads, conversion_rate: conversionRate },
        my_properties: { total_listings: properties.totalListings, active_listings: properties.activeListings, sold_this_month: properties.soldThisMonth },
        monthly_targets: { leads_target: 100, leads_achieved: leadsThisMonth, sales_target: 5, sales_achieved: Math.min(5, Math.floor(convertedLeads / 4)) },
        upcoming_activities: futureActs.length, today_followups: todayFollowups,
      };
      if (!isMounted) return;
      setStats(computed); setMyLeads(recentLeads.slice(0, 5)); setUpcomingActivities(futureActs.slice(0, 5));
    };
    if (user) { setLoading(true); try { computeStatsFromMock(); } catch (e) { console.error(e); toast.error("Failed to load agent dashboard"); } finally { if (isMounted) setLoading(false); } }
    else setLoading(false);
    return () => { isMounted = false; };
  }, [user]);

  const getTargetProgress = (achieved = 0, target = 0) => target > 0 ? Math.min((achieved / target) * 100, 100) : 0;
  const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 18) return "Good afternoon"; return "Good evening"; };

  const leadStatusStyle = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "hot") return { background: "#fee2e2", color: "#dc2626" };
    if (s === "warm") return { background: `${ORANGE}18`, color: ORANGE };
    if (s === "cold") return { background: "#dbeafe", color: "#1d4ed8" };
    if (s === "qualified" || s === "converted") return { background: "#dcfce7", color: "#15803d" };
    return { background: `${NAVY}10`, color: NAVY };
  };

  const activityTypeStyle = (type?: string) => {
    const t = (type || "").toLowerCase();
    if (t === "call") return { background: "#dcfce7", color: "#15803d" };
    if (t === "meeting") return { background: "#dbeafe", color: "#1d4ed8" };
    if (t === "visit") return { background: `${ORANGE}18`, color: ORANGE };
    return { background: `${NAVY}10`, color: NAVY };
  };

  const safeDate = (s?: string | null) => { if (!s) return "-"; const d = new Date(s); if (isNaN(d.getTime())) return "-"; return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
  const safeDateTime = (s?: string | null) => { if (!s) return "-"; const d = new Date(s); if (isNaN(d.getTime())) return "-"; return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); };
  const initialsOf = (first?: string, last?: string) => ((first?.trim()?.[0] || "").toUpperCase() + (last?.trim()?.[0] || "").toUpperCase()) || "U";

  const leadsProgress = getTargetProgress(stats?.monthly_targets?.leads_achieved, stats?.monthly_targets?.leads_target ?? 1);
  const salesProgress = getTargetProgress(stats?.monthly_targets?.sales_achieved, stats?.monthly_targets?.sales_target ?? 1);

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5" style={{ background: "white", minHeight: "100%" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: NAVY }}>
            {getGreeting()},{" "}
            <span style={{ color: ORANGE }}>{user?.first_name ?? "Agent"}</span>!
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7a95a8" }}>Here's your daily performance overview</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/leads">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: ORANGE }}>
              <Plus className="h-4 w-4" /><span>Add Lead</span>
            </button>
          </Link>
          <Link to="/dashboard/activities">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:shadow-sm"
              style={{ borderColor: NAVY, color: NAVY, background: "white" }}>
              <Calendar className="h-4 w-4" /><span>Schedule</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<Users className="h-4 w-4 text-white" />} label="My Leads" value={stats?.my_leads?.total_leads ?? 0} iconBg={NAVY} cardBg="#e8eef5" subColor={ORANGE}>
          <p className="text-xs font-medium" style={{ color: "#7a95a8" }}>
            <span className="font-bold" style={{ color: ORANGE }}>{stats?.my_leads?.new_leads ?? 0}</span> new this week
          </p>
        </StatCard>

        <StatCard icon={<Target className="h-4 w-4 text-white" />} label="Conversion" value={`${stats?.my_leads?.conversion_rate ?? 0}%`} iconBg={ORANGE} cardBg="#fff0e6">
          <p className="text-xs font-medium" style={{ color: "#7a95a8" }}>
            <span className="font-bold" style={{ color: "#15803d" }}>{stats?.my_leads?.converted_leads ?? 0}</span> converted
          </p>
        </StatCard>

        <StatCard icon={<TrendingUp className="h-4 w-4 text-white" />} label="Hot Leads" value={stats?.my_leads?.hot_leads ?? 0} iconBg="#dc2626" cardBg="#fef2f2">
          <p className="text-xs font-medium" style={{ color: "#7a95a8" }}>Need attention</p>
        </StatCard>

        <StatCard icon={<Building className="h-4 w-4 text-white" />} label="Properties" value={stats?.my_properties?.active_listings ?? 0} iconBg="#7c3aed" cardBg="#f0ebff">
          <p className="text-xs font-medium" style={{ color: "#7a95a8" }}>
            <span className="font-bold" style={{ color: "#15803d" }}>{stats?.my_properties?.sold_this_month ?? 0}</span> sold this month
          </p>
        </StatCard>

        <StatCard icon={<Clock className="h-4 w-4 text-white" />} label="Follow-ups" value={stats?.today_followups ?? 0} iconBg="#16a34a" cardBg="#e8f5eb">
          <p className="text-xs font-medium" style={{ color: "#7a95a8" }}>Due today</p>
        </StatCard>
      </div>

      {/* ── Monthly Targets ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border" style={{ borderColor: "#dce5ee" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#7a95a8" }}>Monthly Targets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium" style={{ color: NAVY }}>Leads Target</span>
              <span className="text-sm font-bold" style={{ color: NAVY }}>
                {stats?.monthly_targets?.leads_achieved ?? 0} / {stats?.monthly_targets?.leads_target ?? 0}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: "#dce5ee" }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${leadsProgress}%`, background: NAVY }} />
            </div>
            <p className="text-xs mt-1" style={{ color: "#7a95a8" }}>{Math.round(leadsProgress)}% achieved</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium" style={{ color: NAVY }}>Sales Target</span>
              <span className="text-sm font-bold" style={{ color: NAVY }}>
                {stats?.monthly_targets?.sales_achieved ?? 0} / {stats?.monthly_targets?.sales_target ?? 0}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: "#dce5ee" }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${salesProgress}%`, background: ORANGE }} />
            </div>
            <p className="text-xs mt-1" style={{ color: "#7a95a8" }}>{Math.round(salesProgress)}% achieved</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border" style={{ borderColor: "#dce5ee" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#7a95a8" }}>Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/dashboard/leads", icon: <Plus className="h-4 w-4" />, label: "Add New Lead", color: NAVY, primary: true },
            { to: "/dashboard/properties", icon: <Building className="h-4 w-4" />, label: "Add Property", color: "#15803d", primary: false },
            { to: "/dashboard/activities", icon: <Calendar className="h-4 w-4" />, label: "Schedule Follow-up", color: ORANGE, primary: false },
            { to: "/dashboard/communication", icon: <Mail className="h-4 w-4" />, label: "Send Message", color: "#7c3aed", primary: false },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all hover:shadow-sm"
              style={{ borderColor: "#dce5ee", color: item.color }}>
              <span className="p-1.5 rounded-lg shrink-0" style={{ background: `${item.color}15` }}>
                {item.icon}
              </span>
              <span className="truncate" style={{ color: NAVY }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Content Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* My Recent Leads */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#dce5ee" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#dce5ee" }}>
            <h3 className="font-semibold text-sm" style={{ color: NAVY }}>My Recent Leads</h3>
            <Link to="/dashboard/leads" className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: ORANGE }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "#f0f4f8" }}>
            {myLeads.length > 0 ? myLeads.map(lead => (
              <Link key={lead.id} to={`/dashboard/leads/${lead.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: NAVY }}>
                    {initialsOf(lead.first_name, lead.last_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: NAVY }}>
                      {(lead.first_name ?? "") + " " + (lead.last_name ?? "")}
                    </p>
                    <p className="text-xs truncate" style={{ color: "#7a95a8" }}>{lead.email ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={leadStatusStyle(lead.status)}>
                    {lead.status ?? "New"}
                  </span>
                  <span className="text-xs hidden sm:block" style={{ color: "#7a95a8" }}>{safeDate(lead.created_at)}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: ORANGE }} />
                </div>
              </Link>
            )) : (
              <div className="text-center py-10">
                <Users className="h-10 w-10 mx-auto mb-3" style={{ color: "#dce5ee" }} />
                <p className="text-sm mb-3" style={{ color: "#7a95a8" }}>No recent leads</p>
                <Link to="/dashboard/leads">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white mx-auto transition-all hover:opacity-90"
                    style={{ background: ORANGE }}>
                    <Plus className="h-4 w-4" />Add Your First Lead
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#dce5ee" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#dce5ee" }}>
            <h3 className="font-semibold text-sm" style={{ color: NAVY }}>Upcoming Activities</h3>
            <Link to="/dashboard/activities" className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: ORANGE }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "#f0f4f8" }}>
            {upcomingActivities.length > 0 ? upcomingActivities.map(activity => (
              <div key={activity.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-9 rounded-full shrink-0" style={{ background: ORANGE }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: NAVY }}>
                      {activity.title ?? activity.description ?? "Untitled"}
                    </p>
                    <p className="text-xs" style={{ color: "#7a95a8" }}>
                      {safeDateTime(activity.scheduled_at ?? activity.created_at)}
                    </p>
                  </div>
                </div>
                <span className="ml-3 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                  style={activityTypeStyle(activity.type)}>
                  {activity.type ?? "Task"}
                </span>
              </div>
            )) : (
              <div className="text-center py-10">
                <Calendar className="h-10 w-10 mx-auto mb-3" style={{ color: "#dce5ee" }} />
                <p className="text-sm mb-3" style={{ color: "#7a95a8" }}>No upcoming activities</p>
                <Link to="/dashboard/activities">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white mx-auto transition-all hover:opacity-90"
                    style={{ background: NAVY }}>
                    <Plus className="h-4 w-4" />Schedule Activity
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;