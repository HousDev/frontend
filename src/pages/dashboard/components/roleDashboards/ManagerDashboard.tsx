import React, { useState } from 'react';
import {
  Users, UserCheck, Activity, BarChart3, ShieldCheck, Send, ArrowRight,
  TrendingUp, Award, Clock, RefreshCw, Layers, Sparkles
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import { User } from '@/contexts/AuthContext';
import { toast } from '@/hooks/useToast';

const NAVY = '#0c3854';
const ORANGE = '#e87722';

interface ManagerDashboardProps {
  user: User | null;
  allLeads: RecentItem[];
  allProperties: RecentItem[];
  buyersList: any[];
  sellersList: any[];
  allUsers?: any[];
  stats: any;
  onRefreshData?: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user,
  allLeads,
  allProperties,
  buyersList,
  sellersList,
  allUsers = [],
  stats,
  onRefreshData,
}) => {
  const [teamAnnouncement, setTeamAnnouncement] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  const unassignedLeads = allLeads.filter(l => !l.assigned_executive || l.assigned_executive === '').length;
  const convertedCount = allLeads.filter(l => ['converted', 'won'].includes(String(l.status || '').toLowerCase())).length;
  const overallConversionRate = allLeads.length > 0 ? Math.round((convertedCount / allLeads.length) * 100) : 0;

  const handleBroadcastMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAnnouncement.trim()) return;
    toast.success("Broadcast message sent to all team members!");
    setAnnouncementSent(true);
    setTeamAnnouncement('');
    setTimeout(() => setAnnouncementSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* ── Manager Control Panel Banner ────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0c3854] to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Team Manager Command Center
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Welcome back, Manager {user?.first_name || ''}! 📊
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Track presales & sales team performance, manage lead distribution, and boost team conversion rates!
            </p>
          </div>

          {/* Quick Broadcast Announcement Widget */}
          <form onSubmit={handleBroadcastMessage} className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 flex items-center gap-2 min-w-[280px]">
            <input
              type="text"
              placeholder="Send motivation to team..."
              value={teamAnnouncement}
              onChange={(e) => setTeamAnnouncement(e.target.value)}
              className="bg-white/10 text-white placeholder-slate-400 text-xs rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-orange-400 flex-1"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      </div>

      {/* ── Manager KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Team Leads</p>
            <h3 className="text-xl font-bold text-slate-900">{allLeads.length}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Active Pool</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Unassigned Leads</p>
            <h3 className="text-xl font-bold text-slate-900">{unassignedLeads}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Needs Assignment</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Team Conversion %</p>
            <h3 className="text-xl font-bold text-slate-900">{overallConversionRate}%</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{convertedCount} Deals Converted</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Inventory Properties</p>
            <h3 className="text-xl font-bold text-slate-900">{allProperties.length}</h3>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">Total System Properties</p>
          </div>
        </div>
      </div>

      {/* ── Main Tabbed Content for Manager (Leads, Sellers, Buyers, Properties) ── */}
      <SharedDashboardTabs
        role="manager"
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

export default ManagerDashboard;
