import React, { useState } from 'react';
import {
  PhoneCall, Target, Clock, Zap, CheckCircle2, Calendar, Sparkles,
  PhoneForwarded, Flame, Headphones, Plus
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import { User } from '@/contexts/AuthContext';

const NAVY = '#0c3854';
const ORANGE = '#e87722';

interface PresalesExecutiveDashboardProps {
  user: User | null;
  allLeads: RecentItem[];
  allProperties: RecentItem[];
  buyersList: any[];
  sellersList: any[];
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
      {/* ── Presales Executive Banner ──────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0c3854] to-[#1a4f75] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold mb-2 border border-orange-500/30">
              <Headphones className="w-3.5 h-3.5" /> Presales Executive Desk
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Welcome back, {user?.first_name || 'Presales Exec'}! 📞
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Focus on fresh lead qualification, follow-ups, and setting up qualified site visits today!
            </p>
          </div>

          {/* Call Target Progress Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1 font-medium">
              <span className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-orange-400" /> Daily Call Goal</span>
              <span className="text-orange-300 font-bold">{dailyCalls} / {targetCalls} Calls</span>
            </div>
            <div className="w-full bg-blue-950/50 rounded-full h-2.5 overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${callProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-blue-200 mt-1.5">
              <span>{callProgress}% Achieved</span>
              <button
                onClick={() => setDailyCalls(prev => prev + 1)}
                className="hover:text-orange-300 underline font-semibold cursor-pointer"
              >
                + Log Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Presales Focus Metrics Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Fresh Leads Queue</p>
            <h3 className="text-xl font-bold text-slate-900">{freshLeadsCount}</h3>
            <p className="text-[11px] text-orange-600 font-medium mt-0.5">High Priority Dialing</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Scheduled Follow-ups</p>
            <h3 className="text-xl font-bold text-slate-900">{followupsCount}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Today's Callbacks</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Leads Qualified</p>
            <h3 className="text-xl font-bold text-slate-900">{qualifiedCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Passed to Sales</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Qualification Rate</p>
            <h3 className="text-xl font-bold text-slate-900">
              {allLeads.length > 0 ? `${Math.round((qualifiedCount / allLeads.length) * 100)}%` : '0%'}
            </h3>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">Efficiency Ratio</p>
          </div>
        </div>
      </div>

      {/* ── Main Tabbed Content for Presales (Leads, Sellers, Buyers, Properties) ── */}
      <SharedDashboardTabs
        role="presales"
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

export default PresalesExecutiveDashboard;
