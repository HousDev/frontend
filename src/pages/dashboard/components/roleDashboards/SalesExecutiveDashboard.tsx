import React, { useState } from 'react';
import {
  Building2, DollarSign, CalendarCheck, TrendingUp, Award, MapPin,
  CheckCircle2, Plus, Sparkles, Briefcase, ChevronRight
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import { User } from '@/contexts/AuthContext';

const NAVY = '#0c3854';
const ORANGE = '#e87722';

interface SalesExecutiveDashboardProps {
  user: User | null;
  allLeads: RecentItem[];
  allProperties: RecentItem[];
  buyersList: any[];
  sellersList: any[];
  allUsers?: any[];
  stats: any;
  onRefreshData?: () => void;
}

export const SalesExecutiveDashboard: React.FC<SalesExecutiveDashboardProps> = ({
  user,
  allLeads,
  allProperties,
  buyersList,
  sellersList,
  allUsers = [],
  stats,
  onRefreshData,
}) => {
  const [siteVisitsDone, setSiteVisitsDone] = useState(3);
  const targetSiteVisits = 6;

  const activeDeals = allLeads.filter(l => ['qualified', 'site_visit_scheduled', 'negotiation'].includes(String(l.status || '').toLowerCase())).length;
  const closedDeals = stats.properties?.sold_properties || allLeads.filter(l => String(l.status || '').toLowerCase() === 'converted').length;
  const availablePropertiesCount = stats.properties?.available_properties || 0;

  return (
    <div className="space-y-6">
      {/* ── Sales Executive Header ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#e87722] to-[#c95d0e] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/30">
              <Briefcase className="w-3.5 h-3.5" /> Sales Executive Desk
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Welcome back, {user?.first_name || 'Sales Exec'}! 💼
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl">
              Drive site visits, negotiate deals, and convert qualified buyers into successful property closings!
            </p>
          </div>

          {/* Site Visit Goal Widget */}
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5 text-white" /> Site Visits Goal</span>
              <span className="text-white font-bold">{siteVisitsDone} / {targetSiteVisits} Done</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/10">
              <div
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((siteVisitsDone / targetSiteVisits) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-orange-100 mt-1.5">
              <span>{Math.round((siteVisitsDone / targetSiteVisits) * 100)}% Target</span>
              <button
                onClick={() => setSiteVisitsDone(prev => prev + 1)}
                className="hover:text-white underline font-semibold cursor-pointer"
              >
                + Mark Visit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sales KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Sales Pipeline</p>
            <h3 className="text-xl font-bold text-slate-900">{activeDeals}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Hot Prospects</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Site Visits Scheduled</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.activities?.today_activities || 0}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">On-Field Demonstrations</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Closed Deals</p>
            <h3 className="text-xl font-bold text-slate-900">{closedDeals}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Concluded Agreements</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Available Properties</p>
            <h3 className="text-xl font-bold text-slate-900">{availablePropertiesCount}</h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Ready Inventory</p>
          </div>
        </div>
      </div>

      {/* ── Main Tabbed Content for Sales (Leads, Sellers, Buyers, Properties) ── */}
      <SharedDashboardTabs
        role="sales"
        allLeads={allLeads}
        allProperties={allProperties}
        buyersList={buyersList}
        sellersList={sellersList}
        allUsers={allUsers}
        stats={stats}
        onRefreshData={onRefreshData}
      />
    </div>
  );
};

export default SalesExecutiveDashboard;
