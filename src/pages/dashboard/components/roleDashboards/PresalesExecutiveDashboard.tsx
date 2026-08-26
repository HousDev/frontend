import React, { useState } from 'react';
import {
  PhoneCall, Target, Clock, Zap, CheckCircle2, Calendar, Sparkles,
  PhoneForwarded, Flame, Headphones, Plus, Phone
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import DashboardAnalyticsGrid from './DashboardAnalyticsGrid';
import { User } from '@/contexts/AuthContext';

const NAVY = '#0f172a';
const ORANGE = '#ea580c';

interface PresalesExecutiveDashboardProps {
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

export const PresalesExecutiveDashboard: React.FC<PresalesExecutiveDashboardProps> = ({
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
  const [dailyCalls, setDailyCalls] = useState(14);
  const targetCalls = 35;
  const callProgress = Math.min(100, Math.round((dailyCalls / targetCalls) * 100));

  const freshLeadsCount = allLeads.filter(l => String(l.status || '').toLowerCase() === 'new').length;
  const followupsCount = stats.activities?.today_activities || 0;
  const qualifiedCount = allLeads.filter(l => ['converted', 'qualified'].includes(String(l.status || '').toLowerCase())).length;

  return (
    <div className="space-y-6">

      {/* ── Presales Focus Metrics Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fresh Leads Queue</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{freshLeadsCount}</h3>
            <p className="text-[11px] font-bold text-orange-600 mt-0.5">Awaiting First Call</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Callbacks</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{followupsCount}</h3>
            <p className="text-[11px] font-bold text-blue-600 mt-0.5">Scheduled Tasks</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Leads Qualified</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{qualifiedCount}</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Passed to Sales</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qualification Ratio</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {allLeads.length > 0 ? `${Math.round((qualifiedCount / allLeads.length) * 100)}%` : '0%'}
            </h3>
            <p className="text-[11px] font-bold text-purple-600 mt-0.5">Conversion Efficiency</p>
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

      {/* ── Main Tabbed Workload ───────────────────────────────────────── */}
      <SharedDashboardTabs
        role="presales"
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

export default PresalesExecutiveDashboard;
