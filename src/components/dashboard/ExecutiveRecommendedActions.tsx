import React, { useEffect, useState } from 'react';
import { Sparkles, Phone, MessageSquare, AlertCircle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/useToast';

interface RecommendedAction {
  id: string | number;
  entity_type: 'lead' | 'buyer' | 'seller';
  entity_id: string | number;
  entity_name: string;
  phone?: string;
  next_action?: string;
  scheduled_date?: string;
  priority: 'high' | 'medium' | 'low';
}

const formatScheduledDate = (rawDate?: string) => {
  if (!rawDate) return 'Today';
  const str = rawDate.includes(' ') && !rawDate.includes('T') ? rawDate.replace(' ', 'T') : rawDate;
  const d = new Date(str);
  if (isNaN(d.getTime())) return rawDate;

  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
};

export const ExecutiveRecommendedActions: React.FC = () => {
  const [actions, setActions] = useState<RecommendedAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const res = await fetch('/api/dashboard/executive-recommended-actions', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await res.json();
      if (data.success && data.data?.actions) {
        setActions(data.data.actions);
      }
    } catch (err) {
      console.error('Error loading recommended actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleWhatsApp = (phone?: string, name?: string) => {
    if (!phone) {
      toast.error('Client phone number is missing.', 'No Phone Number');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hi ${name || 'there'}, following up on our property discussion. When is a good time to speak?`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-indigo-500/20 mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Today's Recommended Actions <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">AI Queue</span>
            </h3>
            <p className="text-xs text-slate-400">High-priority callbacks, site visits & SLA tasks for today</p>
          </div>
        </div>
        <button
          onClick={fetchActions}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading your action queue...</div>
        ) : actions.length === 0 ? (
          <div className="py-6 text-center text-slate-300 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">All clear for today!</p>
            <p className="text-xs text-slate-400">No overdue or high-priority follow-ups remaining.</p>
          </div>
        ) : (
          actions.map((act) => {
            const isHigh = String(act.priority).toLowerCase() === 'high';
            return (
              <div
                key={`${act.entity_type}-${act.id}`}
                className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isHigh
                    ? 'bg-rose-950/30 border-rose-500/30 hover:border-rose-500/60'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-md shrink-0 ${
                      act.entity_type === 'lead'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : act.entity_type === 'buyer'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {act.entity_type}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{act.entity_name}</h4>
                      {isHigh && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> HIGH SLA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{act.next_action || 'Follow-up Call Scheduled'}</p>
                    {act.scheduled_date && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Due: {formatScheduledDate(act.scheduled_date)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {act.phone && (
                    <a
                      href={`tel:${act.phone}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  )}
                  <button
                    onClick={() => handleWhatsApp(act.phone, act.entity_name)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExecutiveRecommendedActions;
