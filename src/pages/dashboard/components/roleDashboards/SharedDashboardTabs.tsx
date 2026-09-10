import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Target, Activity, TrendingUp, CheckCircle, Award, CreditCard,
  Building2, Phone, Search, Plus, SlidersHorizontal, Building, Key, Calendar, MapPin,
  Sparkles, ArrowUpRight, ArrowRight, UserCheck, Flame, PhoneCall
} from 'lucide-react';
import { leadsAPI } from '@/lib/leadAPI';
import { toast } from '@/hooks/useToast';
import DashboardFilterModal, { DashboardFiltersState } from './DashboardFilterModal';

const NAVY = '#0f172a';
const ORANGE = '#ea580c';

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
  ownersList?: any[];
  tenantsList?: any[];
  visitsList?: any[];
  allUsers?: any[];
  stats: {
    leads: { total_leads: number; new_leads: number; converted_leads: number; today_leads: number };
    properties: { total_properties: number; available_properties: number; sold_properties: number; today_listings: number };
    activities: { total_activities: number; pending_activities: number; today_activities: number; upcoming_week_activities: number };
  };
  onRefreshData?: () => void;
}

const normalizeValue = (v: unknown) => { if (v === null || v === undefined) return ''; const s = String(v).trim(); if (s === 'null' || s === 'undefined') return ''; return s; };

const getLeadName = (l: RecentItem | any): string => {
  const nameCandidates = [`${normalizeValue(l.first_name)} ${normalizeValue(l.last_name)}`.trim(), normalizeValue(l.full_name), normalizeValue(l.name), normalizeValue(l.display_name), normalizeValue(l.contact_name), normalizeValue(l.first_name), normalizeValue(l.last_name), normalizeValue(l.email), normalizeValue(l.phone), normalizeValue(l.mobile), normalizeValue(l.username), normalizeValue(l.user_name)];
  for (const n of nameCandidates) if (n) return n;
  return `Lead ${normalizeValue(l.id) || ''}`.trim();
};

const getPropertyTitle = (p: any): string => {
  if (!p) return 'Property Listing';
  const directTitle = p.title || p.property_title || p.name || p.property_name || p.unit_name || p.listing_title;
  if (directTitle && String(directTitle).trim() !== 'Property' && String(directTitle).trim() !== 'Untitled Property') {
    return String(directTitle);
  }
  const unit = p.unitType || p.unit_type || p.bhk ? `${p.unitType || p.unit_type || p.bhk}${typeof (p.unitType || p.unit_type || p.bhk) === 'number' ? ' BHK' : ''}` : '';
  const subtype = p.subtype || p.propertyType || p.property_type || p.listing_type || p.type || '';
  const unitAndSubtype = [unit, subtype].filter(Boolean).join(' ');

  const society = p.society || p.society_name || p.societyName || p.building_name || p.project_name || p.locality || p.area || '';
  const titleCandidate = [unitAndSubtype, society].filter(Boolean).join(' • ');

  if (titleCandidate) return titleCandidate;
  const loc = p.location || p.city || p.locality;
  if (loc) return `Property in ${loc}`;
  return `Property #${p.id || 'Listing'}`;
};

const getPropertyLocation = (p: any): string => {
  if (!p) return 'Location N/A';
  const parts = [p.location, p.locality, p.area, p.city].filter(Boolean);
  const uniqueParts = Array.from(new Set(parts));
  return uniqueParts.length > 0 ? uniqueParts.join(', ') : 'Location N/A';
};

const getPropertyPrice = (p: any): string => {
  if (!p) return 'Price on Request';
  const rawPrice = p.budget ?? p.price ?? p.expected_price ?? p.selling_price ?? p.price_demand ?? p.negotiablePrice;
  if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '' && !isNaN(Number(rawPrice))) {
    const num = Number(rawPrice);
    if (num <= 0) return 'Price on Request';
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    return `₹ ${num.toLocaleString('en-IN')}`;
  }
  if (typeof rawPrice === 'string' && rawPrice.trim()) {
    return rawPrice.startsWith('₹') ? rawPrice : `₹ ${rawPrice}`;
  }
  return 'Price on Request';
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'; const d = new Date(dateString); if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusBadgeStyle = (status?: string) => {
  const s = (status ?? '').toLowerCase();
  if (s === 'new' || s === 'scheduled') return { background: '#fef3c7', color: '#b45309', border: '#fde047' };
  if (s === 'converted' || s === 'available' || s === 'active' || s === 'qualified' || s === 'completed') return { background: '#dcfce7', color: '#15803d', border: '#86efac' };
  if (s === 'sold' || s === 'closed' || s === 'lost' || s === 'inactive' || s === 'cancelled') return { background: '#ffe4e6', color: '#be123c', border: '#fda4af' };
  return { background: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
};

const formatBuyerBudget = (b: any): string => {
  if (!b) return '';
  const raw = b.budget ?? b.budget_range ?? b.expected_budget;

  if (raw && typeof raw === 'object') {
    const minVal = raw.min ?? raw.min_budget ?? raw.budget_min ?? raw.min_price ?? raw.from;
    const maxVal = raw.max ?? raw.max_budget ?? raw.budget_max ?? raw.max_price ?? raw.to;

    const fmtNum = (n: any) => {
      if (n === undefined || n === null || n === '' || isNaN(Number(n))) return '';
      const num = Number(n);
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
      return `₹${num.toLocaleString('en-IN')}`;
    };

    const minFmt = fmtNum(minVal);
    const maxFmt = fmtNum(maxVal);

    if (minFmt && maxFmt) return `Budget: ${minFmt} - ${maxFmt}`;
    if (minFmt) return `Budget: From ${minFmt}`;
    if (maxFmt) return `Budget: Up to ${maxFmt}`;
    if (raw.label || raw.name || raw.range) return `Budget: ${raw.label || raw.name || raw.range}`;
  }

  const topMin = b.min_budget ?? b.budget_min ?? b.min_price;
  const topMax = b.max_budget ?? b.budget_max ?? b.max_price;
  if (topMin !== undefined || topMax !== undefined) {
    const fmtNum = (n: any) => {
      if (n === undefined || n === null || n === '' || isNaN(Number(n))) return '';
      const num = Number(n);
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
      return `₹${num.toLocaleString('en-IN')}`;
    };
    const minFmt = fmtNum(topMin);
    const maxFmt = fmtNum(topMax);
    if (minFmt && maxFmt) return `Budget: ${minFmt} - ${maxFmt}`;
    if (minFmt) return `Budget: From ${minFmt}`;
    if (maxFmt) return `Budget: Up to ${maxFmt}`;
  }

  if (typeof raw === 'number' || (typeof raw === 'string' && raw.trim() && raw !== '[object Object]')) {
    const num = Number(raw);
    if (!isNaN(num)) {
      if (num >= 10000000) return `Budget: ₹${(num / 10000000).toFixed(2)} Cr`;
      if (num >= 100000) return `Budget: ₹${(num / 100000).toFixed(2)} L`;
      return `Budget: ₹${num.toLocaleString('en-IN')}`;
    }
    return String(raw).startsWith('Budget') || String(raw).startsWith('₹') ? String(raw) : `Budget: ${raw}`;
  }

  return '';
};

export const SharedDashboardTabs: React.FC<SharedDashboardTabsProps> = ({
  allLeads,
  allProperties,
  buyersList,
  sellersList,
  ownersList = [],
  tenantsList = [],
  visitsList = [],
  allUsers = [],
  stats,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'lead' | 'seller' | 'buyer' | 'owner' | 'tenant' | 'property' | 'visit'>('lead');
  const [leadSearch, setLeadSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [buyerSearch, setBuyerSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [tenantSearch, setTenantSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [visitSearch, setVisitSearch] = useState('');
  const [skippedLeadIds, setSkippedLeadIds] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [filters, setFilters] = useState<DashboardFiltersState>({
    dateFrom: "", dateTo: "", ignoreDate: false, status: "all", source: "all", priority: "all", assignedExecutive: "all", sortOrder: "desc",
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
    setFilters({ dateFrom: "", dateTo: "", ignoreDate: false, status: "all", source: "all", priority: "all", assignedExecutive: "all", sortOrder: "desc" });
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

  const passesDateFilter = (itemDateStr?: string | null) => {
    if (filters.ignoreDate || (!filters.dateFrom && !filters.dateTo)) return true;
    if (!itemDateStr) return true;
    const itemTime = new Date(itemDateStr).getTime();
    if (isNaN(itemTime)) return true;
    if (filters.dateFrom) {
      const fromTime = new Date(filters.dateFrom).getTime();
      if (!isNaN(fromTime) && itemTime < fromTime) return false;
    }
    if (filters.dateTo) {
      const toTime = new Date(filters.dateTo).setHours(23, 59, 59, 999);
      if (!isNaN(toTime) && itemTime > toTime) return false;
    }
    return true;
  };

  const filteredLeads = useMemo(() => {
    let list = allLeads.filter(l => {
      const s = leadSearch.toLowerCase();
      const match = getLeadName(l).toLowerCase().includes(s) || String(l.email ?? '').toLowerCase().includes(s) || String(l.phone ?? '').toLowerCase().includes(s) || String(l.status ?? '').toLowerCase().includes(s);
      if (!match || !passesDateFilter(l.created_at || l.createdAt)) return false;
      if (filters.status !== "all" && !String(l.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      if (filters.source !== "all" && !String(l.source || '').toLowerCase().includes(filters.source.toLowerCase())) return false;
      if (filters.priority !== "all" && String(l.priority || '').toLowerCase() !== filters.priority.toLowerCase()) return false;
      if (filters.assignedExecutive !== "all" && String(l.assigned_executive || '') !== String(filters.assignedExecutive)) return false;
      return true;
    });
    if (filters.sortOrder === "asc") list = [...list].reverse();
    return list;
  }, [allLeads, leadSearch, filters]);

  const filteredSellers = useMemo(() => {
    let list = sellersList.filter(s => {
      const search = sellerSearch.toLowerCase();
      const match = String(s.name ?? '').toLowerCase().includes(search) || String(s.phone ?? '').toLowerCase().includes(search) || String(s.email ?? '').toLowerCase().includes(search) || String(s.city ?? '').toLowerCase().includes(search) || String(s.status ?? '').toLowerCase().includes(search);
      if (!match || !passesDateFilter(s.created_at || s.createdAt)) return false;
      if (filters.status !== "all" && !String(s.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      if (filters.assignedExecutive !== "all" && String(s.assigned_to || s.executive_id || '') !== String(filters.assignedExecutive)) return false;
      return true;
    });
    if (filters.sortOrder === "asc") list = [...list].reverse();
    return list;
  }, [sellersList, sellerSearch, filters]);

  const filteredBuyers = useMemo(() => {
    let list = buyersList.filter(b => {
      const search = buyerSearch.toLowerCase();
      const match = String(b.name ?? b.buyer_name ?? '').toLowerCase().includes(search) || String(b.phone ?? '').toLowerCase().includes(search) || String(b.email ?? '').toLowerCase().includes(search) || String(b.locality ?? b.city ?? '').toLowerCase().includes(search) || formatBuyerBudget(b).toLowerCase().includes(search) || String(b.status ?? '').toLowerCase().includes(search);
      if (!match || !passesDateFilter(b.created_at || b.createdAt)) return false;
      if (filters.status !== "all" && !String(b.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      if (filters.assignedExecutive !== "all" && String(b.assigned_to || b.executive_id || '') !== String(filters.assignedExecutive)) return false;
      return true;
    });
    if (filters.sortOrder === "asc") list = [...list].reverse();
    return list;
  }, [buyersList, buyerSearch, filters]);

  const filteredOwners = useMemo(() => {
    let list = ownersList.filter(o => {
      const search = ownerSearch.toLowerCase();
      const match = String(o.name ?? o.full_name ?? '').toLowerCase().includes(search) || String(o.phone ?? '').toLowerCase().includes(search) || String(o.email ?? '').toLowerCase().includes(search) || String(o.city ?? o.location ?? '').toLowerCase().includes(search) || String(o.status ?? '').toLowerCase().includes(search);
      if (!match || !passesDateFilter(o.created_at || o.createdAt)) return false;
      if (filters.status !== "all" && !String(o.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      if (filters.assignedExecutive !== "all" && String(o.assigned_to || o.executive_id || '') !== String(filters.assignedExecutive)) return false;
      return true;
    });
    if (filters.sortOrder === "asc") list = [...list].reverse();
    return list;
  }, [ownersList, ownerSearch, filters]);

  const filteredTenants = useMemo(() => {
    let list = tenantsList.filter(t => {
      const search = tenantSearch.toLowerCase();
      const match = String(t.name ?? t.tenant_name ?? '').toLowerCase().includes(search) || String(t.phone ?? '').toLowerCase().includes(search) || String(t.email ?? '').toLowerCase().includes(search) || String(t.preferred_location ?? t.locality ?? '').toLowerCase().includes(search) || String(t.status ?? '').toLowerCase().includes(search);
      if (!match || !passesDateFilter(t.created_at || t.createdAt)) return false;
      if (filters.status !== "all" && !String(t.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      if (filters.assignedExecutive !== "all" && String(t.assigned_to || t.executive_id || '') !== String(filters.assignedExecutive)) return false;
      return true;
    });
    if (filters.sortOrder === "asc") list = [...list].reverse();
    return list;
  }, [tenantsList, tenantSearch, filters]);

  const filteredProperties = useMemo(() => {
    let list = allProperties.filter(p => {
      const search = propertySearch.toLowerCase();
      const match = getPropertyTitle(p).toLowerCase().includes(search) || String(p.city ?? '').toLowerCase().includes(search) || String(p.location ?? '').toLowerCase().includes(search) || String(p.status ?? '').toLowerCase().includes(search) || String(p.unit_type ?? '').toLowerCase().includes(search);
      if (!match || !passesDateFilter(p.created_at || p.createdAt)) return false;
      if (filters.status !== "all" && !String(p.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      if (filters.assignedExecutive !== "all" && String(p.assigned_to || p.executive_id || p.assignedTo || '') !== String(filters.assignedExecutive)) return false;
      return true;
    });
    if (filters.sortOrder === "asc") list = [...list].reverse();
    return list;
  }, [allProperties, propertySearch, filters]);

  const filteredVisits = useMemo(() => {
    let list = visitsList.filter(v => {
      const search = visitSearch.toLowerCase();
      const match = String(v.buyer_name ?? v.client_name ?? '').toLowerCase().includes(search) || String(v.property_title ?? v.title ?? '').toLowerCase().includes(search) || String(v.status ?? '').toLowerCase().includes(search) || String(v.visit_type ?? '').toLowerCase().includes(search);
      if (!match || !passesDateFilter(v.visit_date || v.created_at)) return false;
      if (filters.status !== "all" && !String(v.status || '').toLowerCase().includes(filters.status.toLowerCase())) return false;
      if (filters.assignedExecutive !== "all" && String(v.assigned_to || v.executive_id || '') !== String(filters.assignedExecutive)) return false;
      return true;
    });
    if (filters.sortOrder === "asc") list = [...list].reverse();
    return list;
  }, [visitsList, visitSearch, filters]);

  const tabsConfig = [
    { id: 'lead', label: 'Leads', count: filteredLeads.length, icon: Users, color: '#3b82f6' },
    { id: 'buyer', label: 'Buyers', count: filteredBuyers.length, icon: UserCheck, color: '#0284c7' },
    { id: 'seller', label: 'Sellers', count: filteredSellers.length, icon: Award, color: '#f59e0b' },
    { id: 'owner', label: 'Owners', count: filteredOwners.length, icon: Building, color: '#10b981' },
    { id: 'tenant', label: 'Tenants', count: filteredTenants.length, icon: Key, color: '#8b5cf6' },
    { id: 'property', label: 'Properties', count: filteredProperties.length, icon: Building2, color: '#6366f1' },
    { id: 'visit', label: 'Visits', count: filteredVisits.length, icon: Calendar, color: '#ec4899' },
  ];

  return (
    <div className="space-y-3">
      {/* ── Modern Compact Navigation Pills Bar ───────────────────────── */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
          {tabsConfig.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0c3854] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <SlidersHorizontal size={13} className="text-orange-500" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black text-white bg-orange-500">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── LEADS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'lead' && (
        <div className="space-y-3">
          {nextLeadToCall && (
            <div className="bg-gradient-to-r from-[#0c3854] via-[#09293e] to-[#072437] rounded-xl p-3.5 text-white shadow-xs border border-[#0c3854] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <PhoneCall className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-orange-400 tracking-wider bg-orange-500/10 px-1.5 py-0.2 rounded-md border border-orange-500/20">Next Lead</span>
                  <h4 className="text-xs font-bold text-white mt-0.5">{getLeadName(nextLeadToCall)}</h4>
                  <p className="text-[10.5px] text-slate-300">
                    Source: {nextLeadToCall.source || 'Website'} • {nextLeadToCall.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <a href={`tel:${nextLeadToCall.phone || ''}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors">
                  <Phone size={13} /> Call
                </a>
                <button onClick={() => handleUpdateLeadStatus(nextLeadToCall.id, 'contacted')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-colors">
                  Contacted
                </button>
                <button onClick={() => handleUpdateLeadStatus(nextLeadToCall.id, 'converted')} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                  Qualify
                </button>
                <button onClick={() => setSkippedLeadIds(prev => [...prev, String(nextLeadToCall.id)])} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                  Skip
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Assigned Leads Directory ({filteredLeads.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input type="text" placeholder="Search leads..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <Link to="/dashboard/leads">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-2xs">
                    <ArrowUpRight size={13} /> View Leads
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Contact</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Created Date</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.slice(0, 5).map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{getLeadName(lead)}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">{lead.phone || 'No phone'}</span>
                          <span>{lead.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.2 rounded-full text-[9.5px] font-bold border" style={statusBadgeStyle(lead.status)}>
                          {lead.status || 'New'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-medium text-[11px]">{formatDate(lead.created_at || lead.createdAt)}</td>
                      <td className="py-2 px-3 text-right">
                        <Link to={`/dashboard/leads/${lead.lead_number || lead.id}`} className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5 text-xs">
                          View <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No leads match your current search or filter criteria.</td>
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
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Buyer Demands Directory ({filteredBuyers.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input type="text" placeholder="Search buyers..." value={buyerSearch} onChange={e => setBuyerSearch(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <Link to="/dashboard/buyers">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-2xs">
                    <ArrowUpRight size={13} /> View Buyers
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Buyer Name</th>
                    <th className="py-2 px-3">Contact</th>
                    <th className="py-2 px-3">Locality / Budget</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBuyers.slice(0, 5).map(buyer => (
                    <tr key={buyer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{buyer.name || 'Unnamed Buyer'}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">{buyer.phone || 'No phone'}</span>
                          <span>{buyer.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-medium">
                        <div>{buyer.locality || buyer.city || 'N/A'}</div>
                        <div className="text-[10.5px] font-extrabold text-emerald-700">{formatBuyerBudget(buyer)}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.2 rounded-full text-[9.5px] font-bold border" style={statusBadgeStyle(buyer.status)}>
                          {buyer.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link to="/dashboard/buyers" className="text-sky-600 hover:text-sky-800 font-bold inline-flex items-center gap-0.5 text-xs">
                          Manage <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredBuyers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No buyers found matching search criteria.</td>
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
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" /> Sellers Directory ({filteredSellers.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input type="text" placeholder="Search sellers..." value={sellerSearch} onChange={e => setSellerSearch(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <Link to="/dashboard/sellers">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-2xs">
                    <ArrowUpRight size={13} /> View Sellers
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Seller Name</th>
                    <th className="py-2 px-3">Contact</th>
                    <th className="py-2 px-3">City / Location</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSellers.slice(0, 5).map(seller => (
                    <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{seller.name}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">{seller.phone || 'No phone'}</span>
                          <span>{seller.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-medium">{seller.city || 'N/A'}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.2 rounded-full text-[9.5px] font-bold border" style={statusBadgeStyle(seller.status)}>
                          {seller.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link to="/dashboard/sellers" className="text-amber-600 hover:text-amber-800 font-bold inline-flex items-center gap-0.5 text-xs">
                          Manage <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredSellers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No seller records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── OWNERS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'owner' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" /> Property Owners Directory ({filteredOwners.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input type="text" placeholder="Search owners..." value={ownerSearch} onChange={e => setOwnerSearch(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <Link to="/dashboard/owners">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs">
                    <ArrowUpRight size={13} /> View Owners
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Owner Name</th>
                    <th className="py-2 px-3">Contact</th>
                    <th className="py-2 px-3">City / Locality</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOwners.slice(0, 5).map(owner => (
                    <tr key={owner.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{owner.name || owner.full_name || 'Owner'}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">{owner.phone || 'No phone'}</span>
                          <span>{owner.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-medium">{owner.city || owner.location || 'N/A'}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.2 rounded-full text-[9.5px] font-bold border" style={statusBadgeStyle(owner.status)}>
                          {owner.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link to="/dashboard/owners" className="text-emerald-600 hover:text-emerald-800 font-bold inline-flex items-center gap-0.5 text-xs">
                          View Owner <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredOwners.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No owner records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TENANTS TAB ────────────────────────────────────────────────── */}
      {activeTab === 'tenant' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-600" /> Tenants Directory ({filteredTenants.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input type="text" placeholder="Search tenants..." value={tenantSearch} onChange={e => setTenantSearch(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <Link to="/dashboard/tenants">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-2xs">
                    <ArrowUpRight size={13} /> View Tenants
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Tenant Name</th>
                    <th className="py-2 px-3">Contact</th>
                    <th className="py-2 px-3">Preferred Locality / BHK</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenants.slice(0, 5).map(tenant => (
                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{tenant.name || tenant.tenant_name || 'Tenant'}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col text-[10.5px] text-slate-500">
                          <span className="font-semibold text-slate-700">{tenant.phone || 'No phone'}</span>
                          <span>{tenant.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-medium">
                        <div>{tenant.preferred_location || tenant.locality || 'N/A'}</div>
                        <div className="text-[10.5px] font-extrabold text-purple-700">{tenant.bhk ? `${tenant.bhk} BHK` : ''}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.2 rounded-full text-[9.5px] font-bold border" style={statusBadgeStyle(tenant.status)}>
                          {tenant.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link to="/dashboard/tenants" className="text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-0.5 text-xs">
                          Manage <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredTenants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No tenant records found.</td>
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
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Properties Inventory ({filteredProperties.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input type="text" placeholder="Search properties..." value={propertySearch} onChange={e => setPropertySearch(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <Link to="/dashboard/properties">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs">
                    <ArrowUpRight size={13} /> View Properties
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Title / Configuration</th>
                    <th className="py-2 px-3">Location / City</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProperties.slice(0, 5).map(property => (
                    <tr key={property.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{getPropertyTitle(property)}</td>
                      <td className="py-2 px-3 text-slate-600 font-medium">{getPropertyLocation(property)}</td>
                      <td className="py-2 px-3 font-extrabold text-slate-900">{getPropertyPrice(property)}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.2 rounded-full text-[9.5px] font-bold border" style={statusBadgeStyle(property.status)}>
                          {property.status || 'Available'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link to={`/dashboard/properties/${property.id}`} className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-0.5 text-xs">
                          View Property <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredProperties.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No properties found matching query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PROPERTY VISITS TAB ────────────────────────────────────────── */}
      {activeTab === 'visit' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-600" /> Property Visits Schedule ({filteredVisits.length})
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-56">
                  <input type="text" placeholder="Search visits..." value={visitSearch} onChange={e => setVisitSearch(e.target.value)} className="w-full pl-7 pr-3 py-1 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                </div>
                <Link to="/dashboard/property-visits">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 transition-colors shadow-2xs">
                    <ArrowUpRight size={13} /> View Visits
                  </button>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Client / Buyer</th>
                    <th className="py-2 px-3">Property</th>
                    <th className="py-2 px-3">Date & Time</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisits.slice(0, 5).map(visit => (
                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-900">{visit.buyer_name || visit.client_name || 'Client'}</td>
                      <td className="py-2 px-3 text-slate-700 font-semibold">{visit.property_title || visit.title || 'Property'}</td>
                      <td className="py-2 px-3 text-slate-600 font-medium">
                        <div>{formatDate(visit.visit_date || visit.created_at)}</div>
                        <div className="text-[10.5px] text-slate-400">{visit.visit_time || ''}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.2 rounded-full text-[9.5px] font-bold border" style={statusBadgeStyle(visit.status)}>
                          {visit.status || 'Scheduled'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link to="/dashboard/property-visits" className="text-pink-600 hover:text-pink-800 font-bold inline-flex items-center gap-0.5 text-xs">
                          View Visit <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredVisits.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No property visits scheduled.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Right Slide-over Filter Drawer */}
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
