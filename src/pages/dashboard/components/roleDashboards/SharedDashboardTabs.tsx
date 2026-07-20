import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Target, Activity, TrendingUp, CheckCircle, Award, CreditCard,
  Building2, Phone, Search, Plus, SlidersHorizontal
} from 'lucide-react';
import { leadsAPI } from '@/lib/leadAPI';
import { toast } from '@/hooks/useToast';
import DashboardFilterModal, { DashboardFiltersState } from './DashboardFilterModal';

const NAVY = '#0c3854';
const ORANGE = '#e87722';

export interface RecentItem {
  id: number | string;
  title?: string; name?: string; full_name?: string; property_title?: string; unit_name?: string;
  first_name?: string; last_name?: string; display_name?: string; contact_name?: string;
  email?: string; phone?: string; description?: string; created_at?: string | null;
  createdAt?: string | null; updated_at?: string | null; updatedAt?: string | null;
  status?: string; type?: string; city?: string; location?: string; unit_type?: string;
  bhk?: string | number; price?: string | number; start_at?: string | null; due_at?: string | null;
  assigned_executive?: string | number; priority?: string; source?: string;
  [k: string]: any;
}

export interface SharedDashboardTabsProps {
  role: 'presales' | 'sales' | 'manager' | 'admin' | string;
  allLeads: RecentItem[];
  allProperties: RecentItem[];
  buyersList: any[];
  sellersList: any[];
  allUsers?: any[];
  stats: {
    leads: { total_leads: number; new_leads: number; converted_leads: number; today_leads: number };
    properties: { total_properties: number; available_properties: number; sold_properties: number; today_listings: number };
    activities: { total_activities: number; pending_activities: number; today_activities: number; upcoming_week_activities: number };
  };
  onRefreshData?: () => void;
}

const StatCard = ({ icon, label, value, sub, iconBg, cardBg, subColor }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub: string; iconBg: string; cardBg?: string; subColor?: string;
}) => (
  <div className="rounded-xl p-2.5 border flex items-center gap-2.5 hover:shadow-md transition-shadow shrink-0 flex-1 min-w-[150px]"
    style={{ borderColor: '#dce5ee', background: cardBg || 'white' }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: iconBg }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#7a95a8' }}>{label}</p>
      <p className="text-lg font-bold leading-tight" style={{ color: NAVY }}>{value}</p>
      <p className="text-xs mt-0.5 font-medium" style={{ color: subColor || '#7a95a8' }}>{sub}</p>
    </div>
  </div>
);

const normalizeValue = (v: unknown) => { if (v === null || v === undefined) return ''; const s = String(v).trim(); if (s === 'null' || s === 'undefined') return ''; return s; };

const getLeadName = (l: RecentItem | any): string => {
  const nameCandidates = [`${normalizeValue(l.first_name)} ${normalizeValue(l.last_name)}`.trim(), normalizeValue(l.full_name), normalizeValue(l.name), normalizeValue(l.display_name), normalizeValue(l.contact_name), normalizeValue(l.first_name), normalizeValue(l.last_name), normalizeValue(l.email), normalizeValue(l.phone), normalizeValue(l.mobile), normalizeValue(l.username), normalizeValue(l.user_name)];
  for (const n of nameCandidates) if (n) return n;
  return `Lead ${normalizeValue(l.id) || ''}`.trim();
};

const getPropertyTitle = (p: RecentItem | any): string => {
  const candidates = [normalizeValue(p.title), normalizeValue(p.property_title), normalizeValue(p.name), normalizeValue(p.display_name), normalizeValue(p.unit_name), normalizeValue(p.unitName), normalizeValue(p.listing_title), normalizeValue(p.label)];
  const ut = normalizeValue(p.unit_type), bhk = normalizeValue(p.bhk);
  const unitTypeBhk = ut && bhk ? `${ut} • ${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}` : ut || (bhk ? `${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}` : '');
  if (unitTypeBhk) candidates.push(unitTypeBhk);
  for (const c of candidates) if (c) return c;
  const parts: string[] = [];
  if (ut) parts.push(ut); if (bhk) parts.push(`${bhk}${typeof bhk === 'string' && !bhk.toLowerCase().includes('bhk') ? ' BHK' : ''}`);
  if (normalizeValue(p.location)) parts.push(normalizeValue(p.location)); if (normalizeValue(p.city)) parts.push(normalizeValue(p.city));
  return parts.length ? parts.join(' • ') : 'Untitled Property';
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'; const d = new Date(dateString); if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusBadgeStyle = (status?: string) => {
  const s = (status ?? '').toLowerCase();
  if (s === 'new') return { background: `${ORANGE}18`, color: ORANGE };
  if (s === 'converted' || s === 'available' || s === 'active' || s === 'qualified') return { background: '#dcfce7', color: '#15803d' };
  if (s === 'sold' || s === 'closed' || s === 'lost' || s === 'inactive') return { background: '#fee2e2', color: '#dc2626' };
  return { background: '#f0f4f8', color: '#7a95a8' };
};

export const SharedDashboardTabs: React.FC<SharedDashboardTabsProps> = ({
  allLeads,
  allProperties,
  buyersList,
  sellersList,
  allUsers = [],
  stats,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'lead' | 'seller' | 'buyer' | 'property'>('lead');
  const [leadSearch, setLeadSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [buyerSearch, setBuyerSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [skippedLeadIds, setSkippedLeadIds] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<DashboardFiltersState>({
    dateFrom: "",
    dateTo: "",
    ignoreDate: false,
    status: "all",
    source: "all",
    priority: "all",
    assignedExecutive: "all",
    sortOrder: "desc",
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!filters.ignoreDate && (filters.dateFrom || filters.dateTo)) count++;
    if (filters.status !== "all") count++;
    if (filters.source !== "all") count++;
    if (filters.priority !== "all") count++;
    if (filters.assignedExecutive !== "all") count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      ignoreDate: false,
      status: "all",
      source: "all",
      priority: "all",
      assignedExecutive: "all",
      sortOrder: "desc",
    });
  };

  const handleUpdateLeadStatus = async (leadId: string | number, newStatus: string) => {
    try {
      await leadsAPI.updateStatus(String(leadId), { status: newStatus });
      toast.success(`Lead status updated to ${newStatus}`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error updating lead status');
    }
  };

  const nextLeadToCall = useMemo(() => {
    return allLeads.find(l => String(l.status ?? '').toLowerCase() === 'new' && !skippedLeadIds.includes(String(l.id)));
  }, [allLeads, skippedLeadIds]);

  // Date filtering helper
  const passesDateFilter = (itemDateStr?: string | null) => {
    if (filters.ignoreDate || (!filters.dateFrom && !filters.dateTo)) return true;
    if (!itemDateStr) return false;
    const itemTime = new Date(itemDateStr).getTime();
    if (isNaN(itemTime)) return true;

    if (filters.dateFrom) {
      const fromTime = new Date(filters.dateFrom).getTime();
      if (itemTime < fromTime) return false;
    }
    if (filters.dateTo) {
      const toTime = new Date(filters.dateTo).setHours(23, 59, 59, 999);
      if (itemTime > toTime) return false;
    }
    return true;
  };

  const filteredLeads = useMemo(() => {
    let list = allLeads.filter(l => {
      // Search text
      const s = leadSearch.toLowerCase();
      const matchSearch =
        getLeadName(l).toLowerCase().includes(s) ||
        String(l.email ?? '').toLowerCase().includes(s) ||
        String(l.phone ?? '').toLowerCase().includes(s) ||
        String(l.status ?? '').toLowerCase().includes(s);
      if (!matchSearch) return false;

      // Date Filter
      if (!passesDateFilter(l.created_at || l.createdAt)) return false;

      // Status Filter
      if (filters.status !== "all") {
        if (!String(l.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      }

      // Source Filter
      if (filters.source !== "all") {
        if (!String(l.source || '').toLowerCase().includes(filters.source.toLowerCase())) return false;
      }

      // Priority Filter
      if (filters.priority !== "all") {
        if (String(l.priority || '').toLowerCase() !== filters.priority.toLowerCase()) return false;
      }

      // Assigned Exec
      if (filters.assignedExecutive !== "all") {
        if (String(l.assigned_executive || '') !== String(filters.assignedExecutive)) return false;
      }

      return true;
    });

    // Sort order
    if (filters.sortOrder === "asc") {
      list = [...list].reverse();
    }
    return list;
  }, [allLeads, leadSearch, filters]);

  const filteredSellers = useMemo(() => {
    return sellersList.filter(s => {
      const search = sellerSearch.toLowerCase();
      const matchSearch =
        String(s.name ?? '').toLowerCase().includes(search) ||
        String(s.phone ?? '').toLowerCase().includes(search) ||
        String(s.email ?? '').toLowerCase().includes(search) ||
        String(s.city ?? '').toLowerCase().includes(search) ||
        String(s.status ?? '').toLowerCase().includes(search);
      if (!matchSearch) return false;

      if (!passesDateFilter(s.created_at || s.createdAt)) return false;
      if (filters.status !== "all" && String(s.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;
      return true;
    });
  }, [sellersList, sellerSearch, filters]);

  const filteredBuyers = useMemo(() => {
    return buyersList.filter(b => {
      const search = buyerSearch.toLowerCase();
      const matchSearch =
        String(b.name ?? '').toLowerCase().includes(search) ||
        String(b.phone ?? '').toLowerCase().includes(search) ||
        String(b.email ?? '').toLowerCase().includes(search) ||
        String(b.locality ?? '').toLowerCase().includes(search) ||
        String(b.budget ?? '').toLowerCase().includes(search) ||
        String(b.status ?? '').toLowerCase().includes(search);
      if (!matchSearch) return false;

      if (!passesDateFilter(b.created_at || b.createdAt)) return false;
      if (filters.status !== "all" && String(b.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;
      return true;
    });
  }, [buyersList, buyerSearch, filters]);

  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      const search = propertySearch.toLowerCase();
      const matchSearch =
        getPropertyTitle(p).toLowerCase().includes(search) ||
        String(p.city ?? '').toLowerCase().includes(search) ||
        String(p.location ?? '').toLowerCase().includes(search) ||
        String(p.status ?? '').toLowerCase().includes(search) ||
        String(p.unit_type ?? '').toLowerCase().includes(search);
      if (!matchSearch) return false;

      if (!passesDateFilter(p.created_at || p.createdAt)) return false;
      if (filters.status !== "all" && String(p.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;
      return true;
    });
  }, [allProperties, propertySearch, filters]);

  return (
    <div className="space-y-4">
      {/* Navigation Bar & Filters Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-t-xl px-3 py-2 border-b border-gray-200" style={{ borderColor: '#dce5ee' }}>
        <div className="flex border-b border-transparent overflow-x-auto">
          {[
            { id: 'lead', label: `Leads (${filteredLeads.length})` },
            { id: 'seller', label: `Sellers (${filteredSellers.length})` },
            { id: 'buyer', label: `Buyers (${filteredBuyers.length})` },
            { id: 'property', label: `Properties (${filteredProperties.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#e87722] text-[#e87722]'
                  : 'border-transparent text-gray-500 hover:text-[#0c3854] hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters Button (Matches LeadsPage.tsx style) */}
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <SlidersHorizontal size={13} className="text-[#e87722]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white bg-[#e87722]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── LEADS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'lead' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="h-5 w-5 text-white" />}
              label="Role Leads" value={filteredLeads.length}
              sub={`+${stats.leads.today_leads} today`}
              iconBg={NAVY}
              cardBg="#e8eef5"
              subColor={ORANGE}
            />
            <StatCard
              icon={<Target className="h-5 w-5 text-white" />}
              label="New / Pending" value={filteredLeads.filter(l => String(l.status || '').toLowerCase() === 'new').length}
              sub="Awaiting Action"
              iconBg="#7c3aed"
              cardBg="#f0ebff"
              subColor="#7c3aed"
            />
            <StatCard
              icon={<Activity className="h-5 w-5 text-white" />}
              label="Follow-ups" value={stats.activities.pending_activities}
              sub={`${stats.activities.today_activities} scheduled today`}
              iconBg="#16a34a"
              cardBg="#e8f5eb"
              subColor="#16a34a"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              label="Converted / Qualified" value={filteredLeads.filter(l => ['converted', 'qualified', 'won'].includes(String(l.status || '').toLowerCase())).length}
              sub="Successful"
              iconBg={ORANGE}
              cardBg="#fff0e6"
              subColor="#15803d"
            />
          </div>

          {/* Quick Call Queue for Fresh Leads */}
          {nextLeadToCall ? (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-l-4 flex flex-wrap items-center justify-between gap-4"
              style={{ borderColor: '#dce5ee', borderLeftColor: ORANGE }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ORANGE}15` }}>
                  <Phone className="h-5 w-5" style={{ color: ORANGE }} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fresh Lead Queue</span>
                  <h4 className="text-sm sm:text-base font-bold" style={{ color: NAVY }}>{getLeadName(nextLeadToCall)}</h4>
                  <p className="text-xs text-gray-500">
                    Source: {nextLeadToCall.source || 'Website'} • Created: {formatDate(nextLeadToCall.created_at || nextLeadToCall.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${nextLeadToCall.phone || ''}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <Phone size={14} /> Call Now
                </a>
                <button
                  onClick={() => handleUpdateLeadStatus(nextLeadToCall.id, 'contacted')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Mark Contacted
                </button>
                <button
                  onClick={() => handleUpdateLeadStatus(nextLeadToCall.id, 'converted')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                  style={{ background: NAVY }}
                >
                  Mark Qualified
                </button>
                <button
                  onClick={() => setSkippedLeadIds(prev => [...prev, String(nextLeadToCall.id)])}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-l-4 text-center" style={{ borderColor: '#dce5ee', borderLeftColor: '#16a34a' }}>
              <CheckCircle className="h-7 w-7 mx-auto mb-1 text-green-500" />
              <p className="text-xs sm:text-sm font-semibold text-gray-600">All fresh assigned leads have been processed.</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dce5ee' }}>
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: '#dce5ee' }}>
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>Role Leads Overview</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={leadSearch}
                    onChange={e => setLeadSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
                <Link to="/dashboard/leads">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors" style={{ background: ORANGE }}>
                    <Plus size={14} /> Add Lead
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold" style={{ borderColor: '#dce5ee' }}>
                    <th className="p-3">Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.slice(0, 12).map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-[#0c3854]">{getLeadName(lead)}</td>
                      <td className="p-3">
                        <div className="flex flex-col text-[11px] text-gray-500">
                          <span>{lead.phone || 'No phone'}</span>
                          <span>{lead.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={statusBadgeStyle(lead.status)}>
                          {lead.status || 'New'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{formatDate(lead.created_at || lead.createdAt)}</td>
                      <td className="p-3 text-right">
                        <Link to={`/dashboard/leads/${lead.id}`} className="text-[#e87722] hover:underline font-semibold">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">No matching leads found for this filter view.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SELLERS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'seller' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="h-5 w-5 text-white" />}
              label="Total Sellers" value={filteredSellers.length}
              sub="Registered Sellers"
              iconBg={NAVY}
              cardBg="#e8eef5"
              subColor={ORANGE}
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-white" />}
              label="Active Listings" value={stats.properties.available_properties}
              sub="Published Properties"
              iconBg="#16a34a"
              cardBg="#e8f5eb"
              subColor="#16a34a"
            />
            <StatCard
              icon={<Award className="h-5 w-5 text-white" />}
              label="Pending Approval" value={filteredSellers.filter(s => s.status === 'Pending').length}
              sub="Verification Queue"
              iconBg={ORANGE}
              cardBg="#fff0e6"
              subColor={ORANGE}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              label="Sold Properties" value={stats.properties.sold_properties}
              sub="Closed Sales"
              iconBg="#7c3aed"
              cardBg="#f0ebff"
              subColor="#7c3aed"
            />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dce5ee' }}>
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: '#dce5ee' }}>
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>Sellers Directory</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Search sellers..."
                    value={sellerSearch}
                    onChange={e => setSellerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
                <Link to="/dashboard/sellers">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#e87722] hover:bg-[#d0671c] transition-colors">
                    <Plus size={14} /> Add Seller
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold" style={{ borderColor: '#dce5ee' }}>
                    <th className="p-3">Seller Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">City / Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSellers.slice(0, 12).map(seller => (
                    <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-[#0c3854]">{seller.name}</td>
                      <td className="p-3">
                        <div className="flex flex-col text-[11px] text-gray-500">
                          <span>{seller.phone || 'No phone'}</span>
                          <span>{seller.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">{seller.city || 'N/A'}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{
                            background: seller.status === 'Active' ? '#dcfce7' : '#fee2e2',
                            color: seller.status === 'Active' ? '#15803d' : '#dc2626',
                            borderColor: seller.status === 'Active' ? '#bbf7d0' : '#fca5a5'
                          }}>
                          {seller.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link to="/dashboard/sellers" className="text-[#e87722] hover:underline font-semibold">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredSellers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">No sellers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── BUYERS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'buyer' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="h-5 w-5 text-white" />}
              label="Total Buyers" value={filteredBuyers.length}
              sub="Registered Buyers"
              iconBg={NAVY}
              cardBg="#e8eef5"
              subColor={ORANGE}
            />
            <StatCard
              icon={<CreditCard className="h-5 w-5 text-white" />}
              label="Home Loan Required" value={filteredBuyers.filter(b => b.home_loan_required || b.loan_status).length}
              sub="Financing Leads"
              iconBg="#7c3aed"
              cardBg="#f0ebff"
              subColor="#7c3aed"
            />
            <StatCard
              icon={<Target className="h-5 w-5 text-white" />}
              label="Active Inquiries" value={filteredBuyers.filter(b => (b.status || '').toLowerCase() === 'active').length}
              sub="Interested Buyers"
              iconBg="#16a34a"
              cardBg="#e8f5eb"
              subColor="#16a34a"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              label="Closed Buyers" value={filteredBuyers.filter(b => (b.status || '').toLowerCase() === 'bought' || (b.status || '').toLowerCase() === 'closed').length}
              sub="Deals Concluded"
              iconBg={ORANGE}
              cardBg="#fff0e6"
              subColor="#15803d"
            />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dce5ee' }}>
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: '#dce5ee' }}>
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>Buyers Directory</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Search buyers..."
                    value={buyerSearch}
                    onChange={e => setBuyerSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
                <Link to="/dashboard/buyers">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#e87722] hover:bg-[#d0671c] transition-colors">
                    <Plus size={14} /> Add Buyer
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold" style={{ borderColor: '#dce5ee' }}>
                    <th className="p-3">Buyer Name</th>
                    <th className="p-3">Contact Info</th>
                    <th className="p-3">Locality / Budget</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBuyers.slice(0, 12).map(buyer => (
                    <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-[#0c3854]">{buyer.name || 'Unnamed Buyer'}</td>
                      <td className="p-3">
                        <div className="flex flex-col text-[11px] text-gray-500">
                          <span>{buyer.phone || 'No phone'}</span>
                          <span>{buyer.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">
                        <div>{buyer.locality || buyer.city || 'N/A'}</div>
                        <div className="text-[10px] font-semibold text-emerald-700">{buyer.budget ? `Budget: ${buyer.budget}` : ''}</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={statusBadgeStyle(buyer.status)}>
                          {buyer.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link to="/dashboard/buyers" className="text-[#e87722] hover:underline font-semibold">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredBuyers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">No buyers found matching query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PROPERTIES TAB ──────────────────────────────────────────────── */}
      {activeTab === 'property' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={<Building2 className="h-5 w-5 text-white" />}
              label="Total Properties" value={filteredProperties.length}
              sub={`+${stats.properties.today_listings} today`}
              iconBg={NAVY}
              cardBg="#e8eef5"
              subColor={ORANGE}
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-white" />}
              label="Available" value={stats.properties.available_properties}
              sub="Ready to sell"
              iconBg="#16a34a"
              cardBg="#e8f5eb"
              subColor="#16a34a"
            />
            <StatCard
              icon={<Award className="h-5 w-5 text-white" />}
              label="Sold Out" value={stats.properties.sold_properties}
              sub="Completed Deals"
              iconBg={ORANGE}
              cardBg="#fff0e6"
              subColor={ORANGE}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              label="Today's Listings" value={stats.properties.today_listings}
              sub="Fresh inventory"
              iconBg="#7c3aed"
              cardBg="#f0ebff"
              subColor="#7c3aed"
            />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#dce5ee' }}>
            <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: '#dce5ee' }}>
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>Properties Inventory</h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={propertySearch}
                    onChange={e => setPropertySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
                <Link to="/dashboard/properties">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#e87722] hover:bg-[#d0671c] transition-colors">
                    <Plus size={14} /> Add Property
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold" style={{ borderColor: '#dce5ee' }}>
                    <th className="p-3">Title / Configuration</th>
                    <th className="p-3">Location / City</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProperties.slice(0, 12).map(property => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-[#0c3854]">
                        {getPropertyTitle(property)}
                      </td>
                      <td className="p-3 text-gray-500">
                        {property.location || property.city || 'N/A'}
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {property.price ? `₹ ${property.price}` : 'Price on Request'}
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold" style={statusBadgeStyle(property.status)}>
                          {property.status || 'Available'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link to={`/dashboard/properties/${property.id}`} className="text-[#e87722] hover:underline font-semibold">
                          View Property
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredProperties.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">No properties found matching query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Right Slide-over Filter Drawer (Exact same as LeadsPage FilterModal) */}
      <DashboardFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
        allUsers={allUsers}
      />
    </div>
  );
};

export default SharedDashboardTabs;
