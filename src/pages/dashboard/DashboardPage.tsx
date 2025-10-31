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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// ❌ removed dashboardAPI & activitiesAPI
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
// ---------- end helpers ----------

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentLeads, setRecentLeads] = useState<RecentItem[]>([]);
  const [recentProperties, setRecentProperties] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Compute stats locally (no dashboardAPI, no activitiesAPI)
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

      // Activities stay zeros (no API calls)

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.first_name ?? 'User'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/dashboard/leads">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </Link>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Upcoming Activities (no API, so empty) */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Activities</h3>
              <Link to="/dashboard/activities" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all
                <ArrowRight className="h-4 w-4 inline ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-4">No upcoming activities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
