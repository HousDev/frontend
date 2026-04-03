// // src/pages/dashboard/DashboardPage.tsx
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   Users,
//   Building,
//   Activity,
//   TrendingUp,
//   Calendar,
//   ArrowRight,
//   Plus,
// } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// // ❌ removed dashboardAPI & activitiesAPI
// import { leadsAPI } from '@/lib/leadAPI';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// import Button from '@/components/ui/Button';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';
// import { toast } from '@/hooks/useToast';

// interface DashboardStats {
//   leads: {
//     total_leads: number;
//     new_leads: number;
//     converted_leads: number;
//     today_leads: number;
//   };
//   properties: {
//     total_properties: number;
//     available_properties: number;
//     sold_properties: number;
//     today_listings: number;
//   };
//   activities: {
//     total_activities: number;
//     pending_activities: number;
//     today_activities: number;
//     upcoming_week_activities: number;
//   };
// }

// interface RecentItem {
//   id: number | string;
//   title?: string;
//   name?: string;
//   full_name?: string;
//   property_title?: string;
//   unit_name?: string;
//   first_name?: string;
//   last_name?: string;
//   display_name?: string;
//   contact_name?: string;
//   email?: string;
//   phone?: string;
//   description?: string;
//   created_at?: string | null;
//   createdAt?: string | null;
//   updated_at?: string | null;
//   updatedAt?: string | null;
//   status?: string;
//   type?: string;
//   city?: string;
//   location?: string;
//   unit_type?: string;
//   bhk?: string | number;
//   price?: string | number;
//   start_at?: string | null;
//   due_at?: string | null;
//   [k: string]: any;
// }

// const emptyStats: DashboardStats = {
//   leads: { total_leads: 0, new_leads: 0, converted_leads: 0, today_leads: 0 },
//   properties: { total_properties: 0, available_properties: 0, sold_properties: 0, today_listings: 0 },
//   activities: { total_activities: 0, pending_activities: 0, today_activities: 0, upcoming_week_activities: 0 },
// };

// // ---------- helpers ----------
// const getTime = (o: any, keys: string[]) => {
//   for (const k of keys) {
//     const v = o?.[k];
//     if (v) {
//       const t = new Date(v as string).getTime();
//       if (!Number.isNaN(t)) return t;
//     }
//   }
//   return -Infinity;
// };

// const sortDescBy = (list: any[], keys: string[]) =>
//   [...list].sort((a, b) => getTime(b, keys) - getTime(a, keys));

// const normalizeValue = (v: unknown) => {
//   if (v === null || v === undefined) return '';
//   const s = String(v).trim();
//   if (s === 'null' || s === 'undefined') return '';
//   return s;
// };

// const isSameDayLocal = (d: Date, ref = new Date()) => {
//   return (
//     d.getFullYear() === ref.getFullYear() &&
//     d.getMonth() === ref.getMonth() &&
//     d.getDate() === ref.getDate()
//   );
// };

// const safeParseDate = (v?: string | null) => {
//   if (!v) return null;
//   const d = new Date(v);
//   return Number.isNaN(d.getTime()) ? null : d;
// };
// // ---------- end helpers ----------

// const DashboardPage: React.FC = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<DashboardStats>(emptyStats);
//   const [recentLeads, setRecentLeads] = useState<RecentItem[]>([]);
//   const [recentProperties, setRecentProperties] = useState<RecentItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Derive display name for property
//   const getPropertyTitle = (p: RecentItem | any): string => {
//     const candidates = [
//       normalizeValue(p.title),
//       normalizeValue(p.property_title),
//       normalizeValue(p.name),
//       normalizeValue(p.display_name),
//       normalizeValue(p.unit_name),
//       normalizeValue(p.unitName),
//       normalizeValue(p.listing_title),
//       normalizeValue(p.label),
//     ];

//     const unitTypeBhk = (() => {
//       const ut = normalizeValue(p.unit_type);
//       const bhk = normalizeValue(p.bhk);
//       if (ut && bhk) return `${ut} • ${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`;
//       if (ut) return ut;
//       if (bhk) return `${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`;
//       return '';
//     })();

//     if (unitTypeBhk) candidates.push(unitTypeBhk);

//     for (const c of candidates) if (c) return c;

//     const parts: string[] = [];
//     const city = normalizeValue(p.city);
//     const location = normalizeValue(p.location);
//     const ut = normalizeValue(p.unit_type);
//     const bhk = normalizeValue(p.bhk);
//     if (ut) parts.push(ut);
//     if (bhk) parts.push(`${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`);
//     if (location) parts.push(location);
//     if (city) parts.push(city);

//     return parts.length ? parts.join(' • ') : 'Untitled';
//   };

//   // Derive display name for lead
//   const getLeadName = (l: RecentItem | any): string => {
//     const nameCandidates = [
//       `${normalizeValue(l.first_name)} ${normalizeValue(l.last_name)}`.trim(),
//       normalizeValue(l.full_name),
//       normalizeValue(l.name),
//       normalizeValue(l.display_name),
//       normalizeValue(l.contact_name),
//       normalizeValue(l.first_name),
//       normalizeValue(l.last_name),
//       normalizeValue(l.email),
//       normalizeValue(l.phone),
//       normalizeValue(l.mobile),
//       normalizeValue(l.username),
//       normalizeValue(l.user_name),
//     ];
//     for (const n of nameCandidates) if (n) return n;
//     return `Lead ${normalizeValue(l.id) || ''}`.trim();
//   };

//   useEffect(() => {
//     let isMounted = true;

//     const fetchData = async () => {
//       if (isMounted) setLoading(true);

//       let leadsList: any[] | null = null;
//       let propsList: any[] | null = null;

//       try {
//         const [leadsResp, propsResp] = await Promise.all([
//           leadsAPI.getLeads({ limit: 50 }).catch(() => null),
//           propertiesAPI.getProperties({ limit: 50 }).catch(() => null),
//         ]);

//         // Leads list normalize
//         if (leadsResp) {
//           const d = leadsResp.data ?? leadsResp;
//           if (Array.isArray(d)) leadsList = d;
//           else if (Array.isArray(d?.rows)) leadsList = d.rows;
//           else if (Array.isArray(d?.data)) leadsList = d.data;
//         }

//         // Properties list normalize
//         if (propsResp) {
//           const d = propsResp.data ?? propsResp;
//           if (Array.isArray(d)) propsList = d;
//           else if (Array.isArray(d?.rows)) propsList = d.rows;
//           else if (Array.isArray(d?.data)) propsList = d.data;
//         }
//       } catch {
//         // swallow
//       }

//       // Recent cards
//       if (isMounted) {
//         if (Array.isArray(leadsList)) {
//           const latestLeads = sortDescBy(leadsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']).slice(0, 5);
//           setRecentLeads(latestLeads);
//         }
//         if (Array.isArray(propsList)) {
//           const latestProps = sortDescBy(propsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']).slice(0, 5);
//           setRecentProperties(latestProps);
//         }
//       }

//       // Compute stats locally (no dashboardAPI, no activitiesAPI)
//       const nextStats: DashboardStats = JSON.parse(JSON.stringify(emptyStats));

//       // Leads stats
//       if (Array.isArray(leadsList)) {
//         nextStats.leads.total_leads = leadsList.length;

//         // today_leads: created today
//         nextStats.leads.today_leads = leadsList.reduce((acc, l) => {
//           const d = safeParseDate((l.created_at ?? l.createdAt) as string | undefined);
//           return acc + (d && isSameDayLocal(d) ? 1 : 0);
//         }, 0);

//         // new_leads: status === 'new'
//         nextStats.leads.new_leads = leadsList.reduce((acc, l) => {
//           return acc + (String(l.status ?? '').trim().toLowerCase() === 'new' ? 1 : 0);
//         }, 0);

//         // converted_leads: status === 'converted'
//         nextStats.leads.converted_leads = leadsList.reduce((acc, l) => {
//           return acc + (String(l.status ?? '').trim().toLowerCase() === 'converted' ? 1 : 0);
//         }, 0);
//       }

//       // Properties stats
//       if (Array.isArray(propsList)) {
//         const toLower = (v: unknown) => String(v ?? '').trim().toLowerCase();

//         nextStats.properties.total_properties = propsList.length;
//         nextStats.properties.available_properties = propsList.filter(p => toLower(p.status) === 'available').length;
//         nextStats.properties.sold_properties = propsList.filter(p => toLower(p.status) === 'sold').length;

//         // today_listings: created today
//         nextStats.properties.today_listings = propsList.reduce((acc, p) => {
//           const d = safeParseDate((p.created_at ?? p.createdAt) as string | undefined);
//           return acc + (d && isSameDayLocal(d) ? 1 : 0);
//         }, 0);
//       }

//       // Activities stay zeros (no API calls)

//       if (isMounted) {
//         setStats(nextStats);
//         if (!Array.isArray(leadsList) && !Array.isArray(propsList)) {
//           toast.error('Failed to load dashboard data');
//         }
//         setLoading(false);
//       }
//     };

//     if (user) fetchData();
//     else setLoading(false);

//     return () => {
//       isMounted = false;
//     };
//   }, [user]);

//   const formatDate = (dateString?: string | null) => {
//     if (!dateString) return '-';
//     const d = new Date(dateString);
//     if (isNaN(d.getTime())) return '-';
//     return d.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Good morning';
//     if (hour < 18) return 'Good afternoon';
//     return 'Good evening';
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center py-12">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 mb-4">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {getGreeting()}, {user?.first_name ?? 'User'}!
//           </h1>
//           <p className="text-gray-600">Here's what's happening with your business today.</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <Link to="/dashboard/leads">
//             <Button>
//               <Plus className="h-4 w-4 mr-2" />
//               Add Lead
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Users className="h-6 w-6 text-blue-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Leads</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {stats.leads.total_leads ?? 0}
//               </p>
//               <p className="text-sm text-green-600">+{stats.leads.today_leads ?? 0} today</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <Building className="h-6 w-6 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Properties</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {stats.properties.total_properties ?? 0}
//               </p>
//               <p className="text-sm text-green-600">
//                 {stats.properties.available_properties ?? 0} available
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//               <Activity className="h-6 w-6 text-yellow-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Activities</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {stats.activities.pending_activities ?? 0}
//               </p>
//               <p className="text-sm text-yellow-600">
//                 {stats.activities.today_activities ?? 0} today
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//               <TrendingUp className="h-6 w-6 text-purple-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Conversions</p>
//               <p className="text-2xl font-semibold text-gray-900">
//                 {stats.leads.converted_leads ?? 0}
//               </p>
//               <p className="text-sm text-purple-600">This month</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <Link
//             to="/dashboard/leads"
//             className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <Users className="h-5 w-5 text-blue-600 mr-3" />
//             <span className="text-sm font-medium">Manage Leads</span>
//           </Link>

//           <Link
//             to="/dashboard/properties"
//             className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <Building className="h-5 w-5 text-green-600 mr-3" />
//             <span className="text-sm font-medium">View Properties</span>
//           </Link>

//           <Link
//             to="/dashboard/activities"
//             className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
//             <span className="text-sm font-medium">Schedule Activity</span>
//           </Link>

//           <Link
//             to="/dashboard/analytics"
//             className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
//             <span className="text-sm font-medium">View Analytics</span>
//           </Link>
//         </div>
//       </div>

//       {/* Recent Items Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Recent Leads */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
//               <Link to="/dashboard/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                 View all
//                 <ArrowRight className="h-4 w-4 inline ml-1" />
//               </Link>
//             </div>
//           </div>
//           <div className="p-6">
//             {recentLeads.length > 0 ? (
//               <div className="space-y-4">
//                 {recentLeads.map((lead) => (
//                   <Link
//                     key={String(lead.id)}
//                     to={`/dashboard/leads/${lead.id}`}
//                     className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-gray-900">
//                           {getLeadName(lead)}
//                         </p>
//                         <p className="text-sm text-gray-600">Status: {lead.status ?? '-'}</p>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         {formatDate(lead.created_at ?? lead.createdAt)}
//                       </span>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-4">No recent leads</p>
//             )}
//           </div>
//         </div>

//         {/* Recent Properties */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
//               <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                 View all
//                 <ArrowRight className="h-4 w-4 inline ml-1" />
//               </Link>
//             </div>
//           </div>
//           <div className="p-6">
//             {recentProperties.length > 0 ? (
//               <div className="space-y-4">
//                 {recentProperties.map((property) => (
//                   <Link
//                     key={String(property.id)}
//                     to={`/dashboard/properties/${property.id}`}
//                     className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium text-gray-900">{getPropertyTitle(property)}</p>
//                         <p className="text-sm text-gray-600">Status: {property.status ?? '-'}</p>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         {formatDate(property.created_at ?? property.createdAt)}
//                       </span>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-4">No recent properties</p>
//             )}
//           </div>
//         </div>

//         {/* Upcoming Activities (no API, so empty) */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">Upcoming Activities</h3>
//               <Link to="/dashboard/activities" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                 View all
//                 <ArrowRight className="h-4 w-4 inline ml-1" />
//               </Link>
//             </div>
//           </div>
//           <div className="p-6">
//             <p className="text-gray-500 text-center py-4">No upcoming activities</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;

// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  Activity,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  Zap,
  Target,
  Trophy,
  Bell,
  Heart,
  Star,
  Award,
  TrendingUp as ChartUp,
  Coffee,
  Sun,
  Moon,
  Brain,
  Target as Goal,
  Briefcase,
  DollarSign,
  Home,
  Smile,
  Lightbulb,
  Shield,
  Gem,
  Crown,
  Users as Team,
  MessageSquare,
  ThumbsUp,
  LogOut,
  X,
  ChevronRight,
  Gift,
  Calendar as Cal,
  Clock as TimeClock,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { leadsAPI } from '@/lib/leadAPI';
import { propertiesAPI } from '@/lib/propertiesAPI';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/useToast';

interface DashboardStats {
  leads: {
    total_leads: number;
    new_leads: number;
    converted_leads: number;
    today_leads: number;
  };
  properties: {
    total_properties: number;
    available_properties: number;
    sold_properties: number;
    today_listings: number;
  };
  activities: {
    total_activities: number;
    pending_activities: number;
    today_activities: number;
    upcoming_week_activities: number;
  };
}

interface RecentItem {
  id: number | string;
  title?: string;
  name?: string;
  full_name?: string;
  property_title?: string;
  unit_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  description?: string;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  status?: string;
  type?: string;
  city?: string;
  location?: string;
  unit_type?: string;
  bhk?: string | number;
  price?: string | number;
  start_at?: string | null;
  due_at?: string | null;
  [k: string]: any;
}

// Enhanced Motivational Messages Database
interface MotivationalMessage {
  id: number;
  text: string;
  language: 'english' | 'hindi' | 'marathi';
  category: 'motivation' | 'energy' | 'focus' | 'success' | 'teamwork' | 'wellness' | 'growth' | 'reward';
  icon: React.ReactNode;
  roles: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  forManager?: boolean;
}

const MOTIVATIONAL_MESSAGES: MotivationalMessage[] = [
  // English Messages with Names
  {
    id: 1,
    text: "Every call you make is a step closer to a deal. Keep dialing! 📞",
    language: 'english',
    category: 'motivation',
    icon: <Zap className="h-4 w-4" />,
    roles: ['sales', 'presales', 'team leader'],
    timeOfDay: 'afternoon'
  },
  {
    id: 2,
    text: "Great teams are built one interaction at a time. Make every conversation count! 👥",
    language: 'english',
    category: 'teamwork',
    icon: <Team className="h-4 w-4" />,
    roles: ['manager', 'team leader', 'sales'],
    forManager: true
  },
  {
    id: 3,
    text: "Focus on the process, and the results will follow. Stay consistent! 🎯",
    language: 'english',
    category: 'focus',
    icon: <Target className="h-4 w-4" />,
    roles: ['presales', 'sales', 'manager'],
    timeOfDay: 'morning'
  },
  {
    id: 4,
    text: "Energy is contagious. Your positivity can uplift the entire team! ⚡",
    language: 'english',
    category: 'energy',
    icon: <Sparkles className="h-4 w-4" />,
    roles: ['all']
  },
  {
    id: 5,
    text: "Each property sold is a dream fulfilled. Keep making dreams come true! 🏠",
    language: 'english',
    category: 'success',
    icon: <Trophy className="h-4 w-4" />,
    roles: ['sales', 'presales']
  },

  // Hindi Messages with Names
  {
    id: 6,
    text: "हर कॉल नई संभावना लाती है। लगातार कोशिश करते रहें! 💪",
    language: 'hindi',
    category: 'motivation',
    icon: <Zap className="h-4 w-4" />,
    roles: ['sales', 'presales', 'team leader']
  },
  {
    id: 7,
    text: "टीम की ताकत ही असली ताकत है। साथ मिलकर काम करें! 🤝",
    language: 'hindi',
    category: 'teamwork',
    icon: <Team className="h-4 w-4" />,
    roles: ['manager', 'team leader'],
    forManager: true
  },

  // Marathi Messages with Names
  {
    id: 8,
    text: "प्रत्येक कॉल नवीन संधी आणते. सतत प्रयत्न करा! 🌟",
    language: 'marathi',
    category: 'motivation',
    icon: <Zap className="h-4 w-4" />,
    roles: ['sales', 'presales']
  },
  {
    id: 9,
    text: "संघाची शक्ती खरी शक्ती आहे. एकत्र काम करूया! 👨‍👩‍👧‍👦",
    language: 'marathi',
    category: 'teamwork',
    icon: <Team className="h-4 w-4" />,
    roles: ['manager', 'team leader', 'sales'],
    forManager: true
  },

  // Wellness Messages
  {
    id: 10,
    text: "Remember to take breaks! A refreshed mind performs better. ☕",
    language: 'english',
    category: 'wellness',
    icon: <Coffee className="h-4 w-4" />,
    roles: ['all'],
    timeOfDay: 'afternoon'
  },
  {
    id: 11,
    text: "Your health is your wealth. Stand up and stretch for 5 minutes! 🧘",
    language: 'english',
    category: 'wellness',
    icon: <Heart className="h-4 w-4" />,
    roles: ['all']
  },

  // Growth & Development
  {
    id: 12,
    text: "Every challenge is an opportunity to grow. Embrace it! 🌱",
    language: 'english',
    category: 'growth',
    icon: <TrendingUp className="h-4 w-4" />,
    roles: ['all']
  },

  // Rewards & Recognition
  {
    id: 13,
    text: "Top performer this week gets a special treat! Aim for the stars! ⭐",
    language: 'english',
    category: 'reward',
    icon: <Award className="h-4 w-4" />,
    roles: ['sales', 'presales'],
    timeOfDay: 'morning'
  }
];

// Employee Benefits Data
interface EmployeeBenefit {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'financial' | 'health' | 'career' | 'wellness' | 'recognition';
  forRoles: string[];
}

const EMPLOYEE_BENEFITS: EmployeeBenefit[] = [
  {
    id: 1,
    title: "Performance Bonus",
    description: "Earn up to 20% of your monthly salary as performance bonus",
    icon: <DollarSign className="h-5 w-5" />,
    category: 'financial',
    forRoles: ['sales', 'presales', 'manager']
  },
  {
    id: 2,
    title: "Health Insurance",
    description: "Comprehensive health coverage for you and your family",
    icon: <Heart className="h-5 w-5" />,
    category: 'health',
    forRoles: ['all']
  },
  {
    id: 3,
    title: "Skill Development",
    description: "Monthly training sessions and certification support",
    icon: <Brain className="h-5 w-5" />,
    category: 'career',
    forRoles: ['all']
  },
  {
    id: 4,
    title: "Flexi Hours",
    description: "2-3 hours flexible timing based on your productivity",
    icon: <Clock className="h-5 w-5" />,
    category: 'wellness',
    forRoles: ['all']
  },
  {
    id: 5,
    title: "Star Performer Awards",
    description: "Monthly recognition with gifts and certificates",
    icon: <Award className="h-5 w-5" />,
    category: 'recognition',
    forRoles: ['all']
  },
  {
    id: 6,
    title: "Team Outings",
    description: "Quarterly team building activities and outings",
    icon: <Users className="h-5 w-5" />,
    category: 'wellness',
    forRoles: ['all']
  }
];

// Team Role Configuration
const TEAM_ROLES = {
  'presales': ['motivation', 'focus', 'teamwork', 'growth'],
  'sales': ['motivation', 'success', 'energy', 'focus', 'reward'],
  'manager': ['teamwork', 'motivation', 'focus', 'leadership'],
  'team leader': ['teamwork', 'motivation', 'energy', 'leadership'],
  'default': ['motivation', 'energy', 'teamwork', 'wellness']
};

// Self-Motivation Tasks
interface SelfMotivationTask {
  id: number;
  task: string;
  duration: string;
  benefit: string;
  icon: React.ReactNode;
}

const SELF_MOTIVATION_TASKS: SelfMotivationTask[] = [
  {
    id: 1,
    task: "Power Hour - Focused calling",
    duration: "60 minutes",
    benefit: "High conversion rate during this hour",
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: 2,
    task: "Break for mindfulness",
    duration: "10 minutes",
    benefit: "Reduces stress, increases focus",
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: 3,
    task: "Review weekly goals",
    duration: "15 minutes",
    benefit: "Stay aligned with targets",
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 4,
    task: "Share success story",
    duration: "5 minutes",
    benefit: "Motivates entire team",
    icon: <MessageSquare className="h-5 w-5" />
  }
];

const emptyStats: DashboardStats = {
  leads: { total_leads: 0, new_leads: 0, converted_leads: 0, today_leads: 0 },
  properties: { total_properties: 0, available_properties: 0, sold_properties: 0, today_listings: 0 },
  activities: { total_activities: 0, pending_activities: 0, today_activities: 0, upcoming_week_activities: 0 },
};

// ---------- helpers ----------
const getTime = (o: any, keys: string[]) => {
  for (const k of keys) {
    const v = o?.[k];
    if (v) {
      const t = new Date(v as string).getTime();
      if (!Number.isNaN(t)) return t;
    }
  }
  return -Infinity;
};

const sortDescBy = (list: any[], keys: string[]) =>
  [...list].sort((a, b) => getTime(b, keys) - getTime(a, keys));

const normalizeValue = (v: unknown) => {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  if (s === 'null' || s === 'undefined') return '';
  return s;
};

const isSameDayLocal = (d: Date, ref = new Date()) => {
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
};

const safeParseDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Notification System
interface Notification {
  id: number;
  type: 'motivation' | 'reminder' | 'achievement' | 'team';
  message: string;
  timestamp: Date;
  read: boolean;
  forManager?: boolean;
}
// ---------- end helpers ----------

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentLeads, setRecentLeads] = useState<RecentItem[]>([]);
  const [recentProperties, setRecentProperties] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Motivational System State
  const [currentMessage, setCurrentMessage] = useState<MotivationalMessage>(MOTIVATIONAL_MESSAGES[0]);
  const [messageHistory, setMessageHistory] = useState<number[]>([]);
  const [userRole, setUserRole] = useState<string>('default');

  // Sidebar State
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [energyLevel, setEnergyLevel] = useState(75);
  const [dailyGoal, setDailyGoal] = useState({ completed: 3, target: 10 });

  // Initialize user role
  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase() || 'default';
      setUserRole(role);

      // Initial notification for manager
      if (role === 'manager') {
        const managerNotification: Notification = {
          id: 1,
          type: 'reminder',
          message: `Remember to check on your team's motivation levels today!`,
          timestamp: new Date(),
          read: false,
          forManager: true
        };
        setNotifications([managerNotification]);

        // Schedule reminder for manager every 2 hours
        const reminderInterval = setInterval(() => {
          const newNotification: Notification = {
            id: Date.now(),
            type: 'reminder',
            message: `Team check-in time! Boost your team's energy with some positive words.`,
            timestamp: new Date(),
            read: false,
            forManager: true
          };
          setNotifications(prev => [newNotification, ...prev]);
          toast.info("Team motivation check-in reminder!");
        }, 2 * 60 * 60 * 1000); // 2 hours

        return () => clearInterval(reminderInterval);
      }
    }
  }, [user]);

  // Get filtered messages based on user role and time of day
  const getFilteredMessages = (): MotivationalMessage[] => {
    const roleCategories = TEAM_ROLES[userRole as keyof typeof TEAM_ROLES] || TEAM_ROLES.default;
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

    return MOTIVATIONAL_MESSAGES.filter(message => {
      const roleMatch = message.roles.includes('all') ||
        message.roles.includes(userRole) ||
        message.roles.some(role => roleCategories.includes(message.category));

      const timeMatch = !message.timeOfDay || message.timeOfDay === timeOfDay || message.timeOfDay === 'any';

      return roleMatch && timeMatch;
    });
  };

  // Get next personalized message with staff name
  const getNextMessage = (): MotivationalMessage => {
    const filteredMessages = getFilteredMessages();
    const availableMessages = filteredMessages.filter(msg =>
      !messageHistory.includes(msg.id) || messageHistory.length >= filteredMessages.length
    );

    if (availableMessages.length === 0) {
      setMessageHistory([]);
      const randomMessage = filteredMessages[Math.floor(Math.random() * filteredMessages.length)];
      return randomMessage;
    }

    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    const nextMessage = availableMessages[randomIndex];

    setMessageHistory(prev => [...prev, nextMessage.id]);

    // Send notification if it's for manager
    if (nextMessage.forManager && userRole === 'manager') {
      const notification: Notification = {
        id: Date.now(),
        type: 'motivation',
        message: `New motivational message ready for your team: "${nextMessage.text}"`,
        timestamp: new Date(),
        read: false,
        forManager: true
      };
      setNotifications(prev => [notification, ...prev]);
    }

    return nextMessage;
  };

  // Set random interval (15-20 minutes)
  const getRandomInterval = (): number => {
    const min = 15 * 60 * 1000;
    const max = 20 * 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Initialize motivational message system
  useEffect(() => {
    if (!user) return;

    const initialMessage = getNextMessage();
    setCurrentMessage(initialMessage);

    const messageTimer = setInterval(() => {
      const nextMessage = getNextMessage();
      setCurrentMessage(nextMessage);

      // Update energy level randomly
      setEnergyLevel(prev => Math.min(100, Math.max(20, prev + (Math.random() > 0.5 ? 5 : -5))));

      // Show toast notification
      toast.success(`${user.first_name}, ${nextMessage.text.split('!')[0]}!`);

      // Add to notifications
      const notification: Notification = {
        id: Date.now(),
        type: 'motivation',
        message: `${user.first_name}, ${nextMessage.text}`,
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);

    }, getRandomInterval());

    return () => clearInterval(messageTimer);
  }, [user, userRole]);

  // Derive display name for property
  const getPropertyTitle = (p: RecentItem | any): string => {
    const candidates = [
      normalizeValue(p.title),
      normalizeValue(p.property_title),
      normalizeValue(p.name),
      normalizeValue(p.display_name),
      normalizeValue(p.unit_name),
      normalizeValue(p.unitName),
      normalizeValue(p.listing_title),
      normalizeValue(p.label),
    ];

    const unitTypeBhk = (() => {
      const ut = normalizeValue(p.unit_type);
      const bhk = normalizeValue(p.bhk);
      if (ut && bhk) return `${ut} • ${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`;
      if (ut) return ut;
      if (bhk) return `${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`;
      return '';
    })();

    if (unitTypeBhk) candidates.push(unitTypeBhk);

    for (const c of candidates) if (c) return c;

    const parts: string[] = [];
    const city = normalizeValue(p.city);
    const location = normalizeValue(p.location);
    const ut = normalizeValue(p.unit_type);
    const bhk = normalizeValue(p.bhk);
    if (ut) parts.push(ut);
    if (bhk) parts.push(`${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`);
    if (location) parts.push(location);
    if (city) parts.push(city);

    return parts.length ? parts.join(' • ') : 'Untitled';
  };

  // Derive display name for lead
  const getLeadName = (l: RecentItem | any): string => {
    const nameCandidates = [
      `${normalizeValue(l.first_name)} ${normalizeValue(l.last_name)}`.trim(),
      normalizeValue(l.full_name),
      normalizeValue(l.name),
      normalizeValue(l.display_name),
      normalizeValue(l.contact_name),
      normalizeValue(l.first_name),
      normalizeValue(l.last_name),
      normalizeValue(l.email),
      normalizeValue(l.phone),
      normalizeValue(l.mobile),
      normalizeValue(l.username),
      normalizeValue(l.user_name),
    ];
    for (const n of nameCandidates) if (n) return n;
    return `Lead ${normalizeValue(l.id) || ''}`.trim();
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) setLoading(true);

      let leadsList: any[] | null = null;
      let propsList: any[] | null = null;

      try {
        const [leadsResp, propsResp] = await Promise.all([
          leadsAPI.getLeads({ limit: 50 }).catch(() => null),
          propertiesAPI.getProperties({ limit: 50 }).catch(() => null),
        ]);

        // Leads list normalize
        if (leadsResp) {
          const d = leadsResp.data ?? leadsResp;
          if (Array.isArray(d)) leadsList = d;
          else if (Array.isArray(d?.rows)) leadsList = d.rows;
          else if (Array.isArray(d?.data)) leadsList = d.data;
        }

        // Properties list normalize
        if (propsResp) {
          const d = propsResp.data ?? propsResp;
          if (Array.isArray(d)) propsList = d;
          else if (Array.isArray(d?.rows)) propsList = d.rows;
          else if (Array.isArray(d?.data)) propsList = d.data;
        }
      } catch {
        // swallow
      }

      // Recent cards
      if (isMounted) {
        if (Array.isArray(leadsList)) {
          const latestLeads = sortDescBy(leadsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']).slice(0, 5);
          setRecentLeads(latestLeads);
        }
        if (Array.isArray(propsList)) {
          const latestProps = sortDescBy(propsList, ['updated_at', 'created_at', 'updatedAt', 'createdAt']).slice(0, 5);
          setRecentProperties(latestProps);
        }
      }

      // Compute stats locally
      const nextStats: DashboardStats = JSON.parse(JSON.stringify(emptyStats));

      // Leads stats
      if (Array.isArray(leadsList)) {
        nextStats.leads.total_leads = leadsList.length;

        // today_leads: created today
        nextStats.leads.today_leads = leadsList.reduce((acc, l) => {
          const d = safeParseDate((l.created_at ?? l.createdAt) as string | undefined);
          return acc + (d && isSameDayLocal(d) ? 1 : 0);
        }, 0);

        // new_leads: status === 'new'
        nextStats.leads.new_leads = leadsList.reduce((acc, l) => {
          return acc + (String(l.status ?? '').trim().toLowerCase() === 'new' ? 1 : 0);
        }, 0);

        // converted_leads: status === 'converted'
        nextStats.leads.converted_leads = leadsList.reduce((acc, l) => {
          return acc + (String(l.status ?? '').trim().toLowerCase() === 'converted' ? 1 : 0);
        }, 0);
      }

      // Properties stats
      if (Array.isArray(propsList)) {
        const toLower = (v: unknown) => String(v ?? '').trim().toLowerCase();

        nextStats.properties.total_properties = propsList.length;
        nextStats.properties.available_properties = propsList.filter(p => toLower(p.status) === 'available').length;
        nextStats.properties.sold_properties = propsList.filter(p => toLower(p.status) === 'sold').length;

        // today_listings: created today
        nextStats.properties.today_listings = propsList.reduce((acc, p) => {
          const d = safeParseDate((p.created_at ?? p.createdAt) as string | undefined);
          return acc + (d && isSameDayLocal(d) ? 1 : 0);
        }, 0);
      }

      // Activities stay zeros

      if (isMounted) {
        setStats(nextStats);
        if (!Array.isArray(leadsList) && !Array.isArray(propsList)) {
          toast.error('Failed to load dashboard data');
        }
        setLoading(false);
      }
    };

    if (user) fetchData();
    else setLoading(false);

    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const sendMotivationToTeam = () => {
    const message = `Your manager ${user?.first_name} sends positive vibes! Keep up the great work team! 🚀`;
    toast.success("Motivation sent to team!");

    const notification: Notification = {
      id: Date.now(),
      type: 'team',
      message: `${user?.first_name} sent team motivation: "Keep up the great work!"`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'mr-80' : 'mr-0'}`}>
        <div className="space-y-6 mb-4 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user?.first_name ?? 'User'}!
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
              >
                {sidebarVisible ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </button>
              <Link to="/dashboard/leads">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </Link>
            </div>
          </div>

          {/* Motivational Message Banner with Staff Name */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  {currentMessage.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    
                    <span className="text-xl font-semibold text-gray-800">
                      Dear{" "}
                      <span className="text-blue-600">
                        {user?.first_name || "Team Member"}
                      </span>
                      , {currentMessage.text}
                    </span>

                  </div>
                  {/* <p className="text-xl font-semibold text-gray-800">
                    {currentMessage.text}
                  </p> */}
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">Motivation Level: 4/5</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.leads.total_leads ?? 0}
                  </p>
                  <p className="text-sm text-green-600">+{stats.leads.today_leads ?? 0} today</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.properties.total_properties ?? 0}
                  </p>
                  <p className="text-sm text-green-600">
                    {stats.properties.available_properties ?? 0} available
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.activities.pending_activities ?? 0}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {stats.activities.today_activities ?? 0} today
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.leads.converted_leads ?? 0}
                  </p>
                  <p className="text-sm text-purple-600">This month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/dashboard/leads"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Manage Leads</span>
              </Link>

              <Link
                to="/dashboard/properties"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Building className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium">View Properties</span>
              </Link>

              <Link
                to="/dashboard/activities"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium">Schedule Activity</span>
              </Link>

              <Link
                to="/dashboard/analytics"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium">View Analytics</span>
              </Link>
            </div>
          </div>

          {/* Recent Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
                  <Link to="/dashboard/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all
                    <ArrowRight className="h-4 w-4 inline ml-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentLeads.length > 0 ? (
                  <div className="space-y-4">
                    {recentLeads.map((lead) => (
                      <Link
                        key={String(lead.id)}
                        to={`/dashboard/leads/${lead.id}`}
                        className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {getLeadName(lead)}
                            </p>
                            <p className="text-sm text-gray-600">Status: {lead.status ?? '-'}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(lead.created_at ?? lead.createdAt)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent leads</p>
                )}
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
                  <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all
                    <ArrowRight className="h-4 w-4 inline ml-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentProperties.length > 0 ? (
                  <div className="space-y-4">
                    {recentProperties.map((property) => (
                      <Link
                        key={String(property.id)}
                        to={`/dashboard/properties/${property.id}`}
                        className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{getPropertyTitle(property)}</p>
                            <p className="text-sm text-gray-600">Status: {property.status ?? '-'}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(property.created_at ?? property.createdAt)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent properties</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Team Motivation Corner */}
      {sidebarVisible && (
        <div className="fixed right-0 top-0 h-screen w-80 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 shadow-xl overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Motivation Hub</h2>
                  <p className="text-xs text-gray-500">For {user?.first_name || 'Team Member'}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarVisible(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Energy Level */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">Team Energy Level</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{energyLevel}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${energyLevel > 70 ? 'bg-green-500' :
                      energyLevel > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${energyLevel}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Daily Progress */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Daily Goal Progress</h3>
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Calls Made</span>
                    <span className="font-semibold">{dailyGoal.completed}/{dailyGoal.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(dailyGoal.completed / dailyGoal.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:opacity-90 transition">
                  Update Progress
                </button>
              </div>
            </div>

            {/* Employee Benefits */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Your Benefits</h3>
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                {EMPLOYEE_BENEFITS.filter(benefit =>
                  benefit.forRoles.includes('all') || benefit.forRoles.includes(userRole)
                ).slice(0, 3).map(benefit => (
                  <div key={benefit.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {benefit.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{benefit.title}</h4>
                        <p className="text-xs text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Self-Motivation Tasks */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Quick Boost Tasks</h3>
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="space-y-3">
                {SELF_MOTIVATION_TASKS.map(task => (
                  <div key={task.id} className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {task.icon}
                        <span className="font-medium text-gray-900">{task.task}</span>
                      </div>
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {task.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{task.benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-2">
                      {notification.type === 'motivation' && <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />}
                      {notification.type === 'reminder' && <Bell className="h-4 w-4 text-yellow-600 mt-0.5" />}
                      {notification.type === 'achievement' && <Trophy className="h-4 w-4 text-green-600 mt-0.5" />}
                      {notification.type === 'team' && <Team className="h-4 w-4 text-purple-600 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No notifications</p>
                )}
              </div>
            </div>

            {/* Manager Actions */}
            {userRole === 'manager' && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-3">Manager Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={sendMotivationToTeam}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Team Motivation</span>
                  </button>
                  <button className="w-full py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition flex items-center justify-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Recognize Achiever</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">Today's Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.leads.today_leads}</div>
                  <div className="text-xs text-gray-600">New Leads</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.properties.today_listings}</div>
                  <div className="text-xs text-gray-600">New Listings</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.leads.converted_leads}</div>
                  <div className="text-xs text-gray-600">Conversions</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{energyLevel}%</div>
                  <div className="text-xs text-gray-600">Energy</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Stay Motivated!</span>
                </div>
                <div className="text-xs">
                  Next message in: ~15 min
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Sidebar Button when hidden */}
      {!sidebarVisible && (
        <button
          onClick={() => setSidebarVisible(true)}
          className="fixed right-4 top-24 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default DashboardPage;