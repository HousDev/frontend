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
import { dashboardAPI, activitiesAPI } from '@/lib/api';
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
  status?: string;
  type?: string;
  city?: string;
  location?: string;
  unit_type?: string;
  bhk?: string | number;
  price?: string | number;
  [k: string]: any;
}

const emptyStats: DashboardStats = {
  leads: { total_leads: 0, new_leads: 0, converted_leads: 0, today_leads: 0 },
  properties: { total_properties: 0, available_properties: 0, sold_properties: 0, today_listings: 0 },
  activities: { total_activities: 0, pending_activities: 0, today_activities: 0, upcoming_week_activities: 0 },
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentLeads, setRecentLeads] = useState<RecentItem[]>([]);
  const [recentProperties, setRecentProperties] = useState<RecentItem[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper: normalize small values
  const normalizeValue = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = String(v).trim();
    if (s === 'null' || s === 'undefined') return '';
    return s;
  };

  // Helper: robustly derive a human-friendly property title from multiple possible fields
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

    // candidate for combined unit type / bhk fields
    const unitTypeBhk = (() => {
      const ut = normalizeValue(p.unit_type);
      const bhk = normalizeValue(p.bhk);
      if (ut && bhk) return `${ut} • ${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`;
      if (ut) return ut;
      if (bhk) return `${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`;
      return '';
    })();

    if (unitTypeBhk) candidates.push(unitTypeBhk);

    for (const c of candidates) {
      if (c && c.length > 0) return c;
    }

    // fallback to a composed short description if available
    const parts: string[] = [];
    const city = normalizeValue(p.city);
    const location = normalizeValue(p.location);
    const ut = normalizeValue(p.unit_type);
    const bhk = normalizeValue(p.bhk);
    if (ut) parts.push(ut);
    if (bhk) parts.push(`${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`);
    if (location) parts.push(location);
    if (city) parts.push(city);

    if (parts.length > 0) return parts.join(' • ');

    // final fallback
    return 'Untitled';
  };

  // Helper: robustly derive lead name from multiple fields
  const getLeadName = (l: RecentItem | any): string => {
    // try explicit name fields first
    const nameCandidates = [
      // common patterns
      `${normalizeValue(l.first_name)} ${normalizeValue(l.last_name)}`.trim(),
      normalizeValue(l.full_name),
      normalizeValue(l.name),
      normalizeValue(l.display_name),
      normalizeValue(l.contact_name),
      // two-field combinations
      normalizeValue(l.first_name),
      normalizeValue(l.last_name),
      // fallbacks
      normalizeValue(l.email),
      normalizeValue(l.phone),
      normalizeValue(l.mobile),
      normalizeValue(l.username),
      normalizeValue(l.user_name),
    ];

    for (const n of nameCandidates) {
      if (n && n.length > 0) return n;
    }

    // final fallback show generic label with id
    return `Lead ${normalizeValue(l.id) || ''}`.trim();
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (isMounted) setLoading(true);

      const showToastOnce = (msg: string) => {
        toast.error(msg);
      };

      let statsLoaded = false;

      // 1) Try main dashboard stats endpoint
      try {
        const resp = await dashboardAPI.getStats().catch(e => {
          return null;
        });

        if (resp) {
          const payload = resp?.data ?? resp;
          const overview =
            payload?.data?.overview ??
            payload?.data ??
            payload?.overview ??
            payload;

          if (overview && (overview.leads || overview.properties || overview.activities)) {
            const normalized: DashboardStats = {
              leads: overview.leads ?? emptyStats.leads,
              properties: overview.properties ?? emptyStats.properties,
              activities: overview.activities ?? emptyStats.activities,
            };
            if (isMounted) setStats(prev => ({ ...prev, ...normalized }));
            statsLoaded = true;
          } else {
            if (payload?.success === false && typeof payload.message === 'string') {
              console.warn('dashboardAPI.getStats returned non-success:', payload.message);
            } else {
              console.warn('dashboardAPI.getStats returned an unexpected shape, fallback to list-based totals.');
            }
          }
        }
      } catch (err) {
        console.warn('Error calling dashboardAPI.getStats', err);
      }

      // 2) Fetch lists in parallel (we'll use their lengths as fallbacks for totals)
      let leadsList: any[] | null = null;
      let propsList: any[] | null = null;
      let activitiesList: any[] | null = null;

      try {
        const [leadsResp, propsResp, activitiesResp] = await Promise.all([
          leadsAPI.getLeads({ limit: 50 }).catch(e => { console.warn('leads list error', e); return null; }),
          propertiesAPI.getProperties({ limit: 50 }).catch(e => { console.warn('properties list error', e); return null; }),
          activitiesAPI.getUpcoming({ limit: 20 }).catch(e => { console.warn('activities list error', e); return null; }),
        ]);
        // Normalize leads list
        if (leadsResp) {
          const data = leadsResp.data ?? leadsResp;
          if (Array.isArray(data)) leadsList = data;
          else if (Array.isArray(data?.rows)) leadsList = data.rows;
          else if (Array.isArray(data?.data)) leadsList = data.data;
          else leadsList = null;
        }

        // Normalize properties list
        if (propsResp) {
          const data = propsResp.data ?? propsResp;
          if (Array.isArray(data)) propsList = data;
          else if (Array.isArray(data?.rows)) propsList = data.rows;
          else if (Array.isArray(data?.data)) propsList = data.data; // sometimes wrapped
          else propsList = null;
        }

        // Normalize activities list
        if (activitiesResp) {
          const data = activitiesResp.data ?? activitiesResp;
          if (Array.isArray(data)) activitiesList = data;
          else if (Array.isArray(data?.rows)) activitiesList = data.rows;
          else activitiesList = null;
        }

        // Set recent items if available
        if (isMounted) {
          if (Array.isArray(leadsList)) setRecentLeads(leadsList);
          if (Array.isArray(propsList)) setRecentProperties(propsList);
          if (Array.isArray(activitiesList)) setUpcomingActivities(activitiesList);
        }
      } catch (err) {
        console.warn('Error fetching lists', err);
      }

      // 3) If dashboard stats not loaded, compute totals from available lists and/or stats endpoints if available
      if (!statsLoaded) {
        let anyTotalSet = false;

        // Try leadsAPI.getStats as a fallback for total leads (if present)
        try {
          const leadsStatsResp = await leadsAPI.getStats().catch(e => { console.warn('leadsAPI.getStats error', e); return null; });
          const lp = leadsStatsResp?.data ?? leadsStatsResp;
          const totalLeads =
            lp?.overview?.total_leads ??
            lp?.total_leads ??
            lp?.total ??
            lp?.count ??
            (Array.isArray(lp) ? lp.length : undefined);

          if (typeof totalLeads === 'number') {
            anyTotalSet = true;
            if (isMounted) setStats(prev => ({ ...prev, leads: { ...prev.leads, total_leads: totalLeads } }));
          }
        } catch (e) {
          console.warn('leadsAPI.getStats failed', e);
        }

        // If leadsStats wasn't available, compute from leads list length
        if (!anyTotalSet && Array.isArray(leadsList)) {
          anyTotalSet = true;
          if (isMounted) setStats(prev => ({ ...prev, leads: { ...prev.leads, total_leads: leadsList.length } }));
        }

        // ---- derive properties totals including available/sold from propsList ----
        try {
          if (Array.isArray(propsList)) {
            const toLower = (v: unknown) => String(v ?? '').trim().toLowerCase();

            const total = propsList.length;
            const available = propsList.filter(p => toLower(p.status) === 'available').length;
            const sold = propsList.filter(p => toLower(p.status) === 'sold').length;

            anyTotalSet = true;
            if (isMounted) {
              setStats(prev => ({
                ...prev,
                properties: {
                  ...prev.properties,
                  total_properties: total,
                  available_properties: available,
                  sold_properties: sold,
                },
              }));
            }
          }
        } catch (e) {
          console.warn('computing properties total from list failed', e);
        }

        // Activities totals: try derive from activities list
        try {
          if (Array.isArray(activitiesList)) {
            if (isMounted) setStats(prev => ({ ...prev, activities: { ...prev.activities, total_activities: activitiesList.length } }));
            anyTotalSet = true;
          }
        } catch (e) {
          console.warn('computing activities total from list failed', e);
        }

        if (!anyTotalSet) {
          showToastOnce('Failed to load stats');
        }
      }

      if (isMounted) setLoading(false);
    };

    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    // some responses use createdAt
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
    <div className="space-y-6">
      {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
  {/* Left: Greeting */}
  <div className="min-w-0">
    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
      {getGreeting()}, {user?.first_name ?? 'User'}!
    </h1>
    <p className="text-gray-600 text-sm sm:text-base">
      Here's what's happening with your business today.
    </p>
  </div>

  {/* Right: Actions */}
 <div className="w-full sm:w-auto">
  <Link to="/dashboard/leads" className="block w-full sm:w-auto">
    <Button
      className="w-full sm:w-auto justify-center"
      aria-label="Add Lead"
    >
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
                      <span className="text-xs text-gray-500">{formatDate(lead.created_at ?? lead.createdAt)}</span>
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
                      <span className="text-xs text-gray-500">{formatDate(property.created_at ?? property.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent properties</p>
            )}
          </div>
        </div>

        {/* Upcoming Activities */}
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
            {upcomingActivities.length > 0 ? (
              <div className="space-y-4">
                {upcomingActivities.map((activity) => (
                  <div
                    key={String(activity.id)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{activity.description ?? 'No description'}</p>
                      <p className="text-sm text-gray-600 capitalize">{activity.type ?? '-'}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(activity.created_at ?? activity.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
