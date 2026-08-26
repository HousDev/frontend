import React, { useState } from 'react';
import {
  Users, UserCheck, Activity, BarChart3, ShieldCheck, Send, ArrowRight,
  TrendingUp, Award, Clock, RefreshCw, Layers, Sparkles
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import { User } from '@/contexts/AuthContext';
import { toast } from '@/hooks/useToast';

interface ManagerDashboardProps {
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

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
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

      {/* ── Manager KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Team Leads</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{allLeads.length}</h3>
            <p className="text-[11px] font-bold text-blue-600 mt-0.5">Active Pool</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unassigned Leads</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{unassignedLeads}</h3>
            <p className="text-[11px] font-bold text-amber-600 mt-0.5">Needs Executive</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Conversion %</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{overallConversionRate}%</h3>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">{convertedCount} Converted</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Properties</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{allProperties.length}</h3>
            <p className="text-[11px] font-bold text-purple-600 mt-0.5">Total Listings</p>
          </div>
        </div>
      </div>

      {/* ── Main Tabbed Content for Manager ── */}
      <SharedDashboardTabs
        role="manager"
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

export default ManagerDashboard;
