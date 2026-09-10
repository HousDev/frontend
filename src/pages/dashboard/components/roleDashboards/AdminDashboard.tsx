import React, { useState } from 'react';
import {
  Crown, Users, Building2, TrendingUp, DollarSign, Eye, LayoutDashboard,
  Settings, UserCheck, ShieldAlert, Sparkles, Building, Key, Calendar,
  ArrowUpRight, ArrowRight, CheckCircle2, Clock, MapPin, Zap, Activity, Award
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import PresalesExecutiveDashboard from './PresalesExecutiveDashboard';
import SalesExecutiveDashboard from './SalesExecutiveDashboard';
import ManagerDashboard from './ManagerDashboard';
import DashboardAnalyticsGrid from './DashboardAnalyticsGrid';
import AdminEscalationDashboard from '@/components/dashboard/AdminEscalationDashboard';
import { User } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface AdminDashboardProps {
  user: User | null;
  allLeads: RecentItem[];
  allProperties: RecentItem[];
  buyersList: any[];
  sellersList: any[];
  ownersList?: any[];
  tenantsList?: any[];
  visitsList?: any[];
  allUsers?: any[];
  stats: any;
  onRefreshData?: () => void;
}

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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  allLeads,
  allProperties,
  buyersList,
  sellersList,
  ownersList = [],
  tenantsList = [],
  visitsList = [],
  allUsers = [],
  stats,
  onRefreshData,
}) => {
  const freshLeadsToday = stats.leads?.today_leads || 0;
  const availableProperties = stats.properties?.available_properties || allProperties.length;

  return (
    <div className="space-y-3.5">
      {/* ── Compact Stats Cards with Right Icons & Pastel Backgrounds (7-Columns) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Leads */}
        <div className="bg-blue-50/70 border border-blue-100/90 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Total Leads</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{stats.leads?.total_leads || allLeads.length}</h3>
            <p className="text-[10px] font-bold text-blue-600 truncate mt-0.5">+{freshLeadsToday} Today</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Buyers */}
        <div className="bg-sky-50/70 border border-sky-100/90 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Buyers</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{buyersList.length}</h3>
            <p className="text-[10px] font-bold text-sky-600 truncate mt-0.5">Seekers</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-sky-100/80 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Sellers */}
        <div className="bg-amber-50/70 border border-amber-100/90 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Sellers</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{sellersList.length}</h3>
            <p className="text-[10px] font-bold text-amber-600 truncate mt-0.5">Listings</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Owners */}
        <div className="bg-emerald-50/70 border border-emerald-100/90 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Owners</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{ownersList.length}</h3>
            <p className="text-[10px] font-bold text-emerald-600 truncate mt-0.5">Landlords</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Building className="w-4 h-4" />
          </div>
        </div>

        {/* Tenants */}
        <div className="bg-purple-50/70 border border-purple-100/90 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Tenants</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{tenantsList.length}</h3>
            <p className="text-[10px] font-bold text-purple-600 truncate mt-0.5">Applicants</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Key className="w-4 h-4" />
          </div>
        </div>

        {/* Properties */}
        <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Properties</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{allProperties.length}</h3>
            <p className="text-[10px] font-bold text-indigo-600 truncate mt-0.5">{availableProperties} Active</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        {/* Site Visits */}
        <div className="bg-pink-50/70 border border-pink-100/90 rounded-2xl p-3 shadow-xs hover:shadow-sm transition-all flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Site Visits</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{visitsList.length}</h3>
            <p className="text-[10px] font-bold text-pink-600 truncate mt-0.5">Scheduled</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-pink-100/80 text-pink-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Interactive Analytics & Charts Grid ───────────────────────── */}
      <DashboardAnalyticsGrid
        user={user}
        allLeads={allLeads}
        allProperties={allProperties}
        buyersList={buyersList}
        sellersList={sellersList}
        visitsList={visitsList}
      />

      {/* ── High-Density 3-Column Live Showcase Hub ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Column 1: Recent System Leads */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Recent Leads
            </h3>
            <Link to="/dashboard/leads" className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {allLeads.slice(0, 5).map((lead, idx) => {
              const name = `${lead.first_name || lead.name || 'Lead'} ${lead.last_name || ''}`.trim();
              const initial = name[0]?.toUpperCase() || 'L';
              return (
                <div key={lead.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-200/60">
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{name}</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 shrink-0">
                          {lead.status || 'New'}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 truncate">
                        {lead.phone || 'No phone'} {lead.source ? `• ${lead.source}` : ''}
                      </p>
                    </div>
                  </div>
                  <Link to={`/dashboard/leads/${lead.lead_number || lead.id}`} className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 shadow-2xs shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
            {allLeads.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No recent leads available.</p>}
          </div>
        </div>

        {/* Column 2: Recent Property Listings */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Property Inventory
            </h3>
            <Link to="/dashboard/properties" className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5">
              View Inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {allProperties.slice(0, 5).map((prop, idx) => {
              const title = getPropertyTitle(prop);
              const location = getPropertyLocation(prop);
              const price = getPropertyPrice(prop);
              return (
                <div key={prop.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-200/60">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate">{title}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        {prop.status || 'Available'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-0.5 truncate">
                      <span className="flex items-center gap-0.5 truncate"><MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {location}</span>
                      <span className="font-extrabold text-slate-900 shrink-0">{price}</span>
                    </div>
                  </div>
                  <Link to={`/dashboard/properties/${prop.id}`} className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-2xs shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
            {allProperties.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No recent properties available.</p>}
          </div>
        </div>

        {/* Column 3: Site Visits & Appointments Schedule */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-600" /> Visits Schedule
            </h3>
            <Link to="/dashboard/property-visits" className="text-[11px] text-pink-600 hover:text-pink-800 font-bold flex items-center gap-0.5">
              View Visits <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {visitsList.slice(0, 5).map((visit, idx) => (
              <div key={visit.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-200/60">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{visit.buyer_name || visit.client_name || 'Client'}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-pink-100 text-pink-800 shrink-0">
                      {visit.status || 'Scheduled'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 truncate">
                    {visit.property_title || visit.title || 'Property Visit'} {visit.visit_date ? `• ${visit.visit_date}` : ''}
                  </p>
                </div>
                <Link to="/dashboard/property-visits" className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-pink-600 shadow-2xs shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
            {visitsList.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No scheduled visits available.</p>}
          </div>
        </div>
      </div>

      {/* ── Admin Escalation & High Priority Monitor Hub ────────────── */}
      <AdminEscalationDashboard />

      {/* ── Main Tabbed Content ────────────────────────────────────────── */}
      <SharedDashboardTabs
        role="admin"
        allLeads={allLeads}
        allProperties={allProperties}
        buyersList={buyersList}
        sellersList={sellersList}
        ownersList={ownersList}
        tenantsList={tenantsList}
        visitsList={visitsList}
        allUsers={allUsers}
        stats={stats}
        onRefreshData={onRefreshData}
      />
    </div>
  );
};

export default AdminDashboard;
