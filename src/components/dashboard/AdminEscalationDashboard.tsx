import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, UserCheck, Phone, ArrowUpRight, RefreshCw } from 'lucide-react';

interface EscalationItem {
  id: string | number;
  lead_name?: string;
  name?: string;
  phone?: string;
  exec_name?: string;
  priority?: string;
  scheduled_date?: string;
}

export const AdminEscalationDashboard: React.FC = () => {
  const [highPriorityList, setHighPriorityList] = useState<any[]>([]);
  const [overdueList, setOverdueList] = useState<EscalationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch('/api/dashboard/admin-escalations', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setHighPriorityList(data.data.highPriorityEntities || []);
        setOverdueList(data.data.overdueFollowups || []);
      }
    } catch (err) {
      console.error('Error fetching admin escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Admin Escalation & Priority Hub
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Live SLA Monitor</span>
            </h3>
            <p className="text-xs text-slate-500">Overdue follow-ups and high priority neglected clients</p>
          </div>
        </div>
        <button
          onClick={fetchEscalations}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Card 1: Overdue Escalations */}
        <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Overdue Executive SLA Alerts ({overdueList.length})
            </h4>
          </div>

          {loading ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading escalations...</div>
          ) : overdueList.length === 0 ? (
            <p className="text-xs text-emerald-700 font-medium py-3 text-center">No overdue follow-up escalations!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {overdueList.map((item) => (
                <div key={item.id} className="bg-white p-2.5 rounded-lg border border-rose-200/70 shadow-2xs flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.lead_name || item.name}</span>
                    <p className="text-[11px] text-slate-500">Exec: <span className="font-semibold text-rose-700">{item.exec_name || 'Unassigned'}</span></p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">OVERDUE</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: High Priority Leads & Buyers */}
        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-600" /> Active High-Priority Deals ({highPriorityList.length})
            </h4>
          </div>

          {loading ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading high priority list...</div>
          ) : highPriorityList.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">No high priority leads currently tagged.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {highPriorityList.map((hp) => (
                <div key={`${hp.entity_type}-${hp.id}`} className="bg-white p-2.5 rounded-lg border border-amber-200/70 shadow-2xs flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{hp.name}</span>
                    <p className="text-[11px] text-slate-500 uppercase font-semibold text-amber-700">{hp.entity_type} • {hp.stage || 'Active'}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                    HIGH PRIORITY
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEscalationDashboard;
