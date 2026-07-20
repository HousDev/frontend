import React, { useState } from 'react';
import {
  Crown, Users, Building2, TrendingUp, DollarSign, Eye, LayoutDashboard,
  Settings, UserCheck, ShieldAlert, Sparkles
} from 'lucide-react';
import SharedDashboardTabs, { RecentItem } from './SharedDashboardTabs';
import PresalesExecutiveDashboard from './PresalesExecutiveDashboard';
import SalesExecutiveDashboard from './SalesExecutiveDashboard';
import ManagerDashboard from './ManagerDashboard';
import { User } from '@/contexts/AuthContext';

const NAVY = '#0c3854';
const ORANGE = '#e87722';

interface AdminDashboardProps {
  user: User | null;
  allLeads: RecentItem[];
  allProperties: RecentItem[];
  buyersList: any[];
  sellersList: any[];
  allUsers?: any[];
  stats: any;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  allLeads,
  allProperties,
  buyersList,
  sellersList,
  allUsers = [],
  stats,
  onRefreshData,
}) => {
  const [selectedRoleView, setSelectedRoleView] = useState<'admin' | 'presales' | 'sales' | 'manager'>('admin');

  if (selectedRoleView === 'presales') {
    return (
      <div className="space-y-4">
        <RoleViewHeader selectedRoleView={selectedRoleView} setSelectedRoleView={setSelectedRoleView} />
        <PresalesExecutiveDashboard
          user={user}
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
  }

  if (selectedRoleView === 'sales') {
    return (
      <div className="space-y-4">
        <RoleViewHeader selectedRoleView={selectedRoleView} setSelectedRoleView={setSelectedRoleView} />
        <SalesExecutiveDashboard
          user={user}
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
  }

  if (selectedRoleView === 'manager') {
    return (
      <div className="space-y-4">
        <RoleViewHeader selectedRoleView={selectedRoleView} setSelectedRoleView={setSelectedRoleView} />
        <ManagerDashboard
          user={user}
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
  }

  return (
    <div className="space-y-6">
      {/* ── Admin Header Banner with Role Switcher ───────────────────────── */}
      <div className="bg-gradient-to-r from-[#0c3854] via-[#104b70] to-[#0c3854] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Crown className="w-3.5 h-3.5" /> Super Admin Control Hub
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              System Admin Overview
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Full administrative visibility across all leads, sellers, buyers, properties, and role workflows.
            </p>
          </div>

          {/* Role View Switcher Dropdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex flex-col gap-1 min-w-[220px]">
            <label className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" /> Dashboard View Switcher
            </label>
            <select
              value={selectedRoleView}
              onChange={(e) => setSelectedRoleView(e.target.value as any)}
              className="bg-slate-900 text-white font-semibold text-xs rounded-lg px-3 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              <option value="admin">👑 Admin View (System-wide)</option>
              <option value="presales">📞 Presales Executive View</option>
              <option value="sales">💼 Sales Executive View</option>
              <option value="manager">📊 Manager View</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Admin System KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total System Leads</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.leads?.total_leads || allLeads.length}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">+{stats.leads?.today_leads || 0} today</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Properties</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.properties?.total_properties || allProperties.length}</h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">{stats.properties?.available_properties || 0} Available</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Sellers & Buyers</p>
            <h3 className="text-xl font-bold text-slate-900">{sellersList.length + buyersList.length}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{sellersList.length} Sellers • {buyersList.length} Buyers</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Completed Conversions</p>
            <h3 className="text-xl font-bold text-slate-900">{stats.leads?.converted_leads || 0}</h3>
            <p className="text-[11px] text-orange-600 font-medium mt-0.5">Successful Deals</p>
          </div>
        </div>
      </div>

      {/* ── Main Tabbed Content ────────────────────────────────────────── */}
      <SharedDashboardTabs
        role="admin"
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

// Auxiliary View Switcher bar when viewing subordinate views as Admin
const RoleViewHeader: React.FC<{
  selectedRoleView: string;
  setSelectedRoleView: (val: any) => void;
}> = ({ selectedRoleView, setSelectedRoleView }) => (
  <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm border border-slate-800">
    <div className="flex items-center gap-2 text-xs font-semibold">
      <Crown className="w-4 h-4 text-amber-400" />
      <span>Previewing Dashboard as: <span className="text-orange-400 capitalize">{selectedRoleView}</span></span>
    </div>
    <button
      onClick={() => setSelectedRoleView('admin')}
      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors border border-white/20 cursor-pointer"
    >
      ← Back to Admin View
    </button>
  </div>
);

export default AdminDashboard;
