import React, { useState } from 'react';
import {
  Building2, DollarSign, CalendarCheck, TrendingUp, Award, MapPin,
  CheckCircle2, Plus, Sparkles, Briefcase, ChevronRight
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import DashboardAnalyticsGrid from './DashboardAnalyticsGrid';
import ExecutiveRecommendedActions from '@/components/dashboard/ExecutiveRecommendedActions';
import { User } from '@/contexts/AuthContext';

interface SalesExecutiveDashboardProps {
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

export const SalesExecutiveDashboard: React.FC<SalesExecutiveDashboardProps> = ({
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
  const [siteVisitsDone, setSiteVisitsDone] = useState(3);
  const targetSiteVisits = 6;

  const activeDeals = allLeads.filter(l => ['qualified', 'site_visit_scheduled', 'negotiation'].includes(String(l.status || '').toLowerCase())).length;
  const closedDeals = stats.properties?.sold_properties || allLeads.filter(l => String(l.status || '').toLowerCase() === 'converted').length;
  const availablePropertiesCount = stats.properties?.available_properties || 0;

  return (
    <div className="space-y-6">

      {/* ── Sales KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Sales Pipeline</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{activeDeals}</h3>
            <p className="text-[11px] font-bold text-amber-600 mt-0.5">Hot Prospects</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Site Visits Scheduled</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.activities?.today_activities || 0}</h3>
            <p className="text-[11px] font-bold text-blue-600 mt-0.5">On-Field Demonstrations</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Closed Deals</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{closedDeals}</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Concluded Agreements</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Properties</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{availablePropertiesCount}</h3>
            <p className="text-[11px] font-bold text-indigo-600 mt-0.5">Ready Inventory</p>
          </div>
        </div>
      </div>

      {/* ── Today's Recommended Actions Queue ──────────────────────────── */}
      <ExecutiveRecommendedActions />

      {/* ── Interactive Analytics & Charts Grid ───────────────────────── */}
      <DashboardAnalyticsGrid
        user={user}
        allLeads={allLeads}
        allProperties={allProperties}
        buyersList={buyersList}
        sellersList={sellersList}
        visitsList={visitsList}
      />

      {/* ── Main Tabbed Content for Sales ── */}
      <SharedDashboardTabs
        role="sales"
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

export default SalesExecutiveDashboard;
