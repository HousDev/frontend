// frontend/src/components/reports/VisitorDetailJourneyModal.tsx
import React, { useEffect, useState } from 'react';
import {
  X,
  Eye,
  Calculator,
  Search,
  Activity,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  Building,
  ArrowRight,
  Globe,
  User,
  Shield,
  FileText,
  Clock,
  Compass,
  DollarSign,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { api } from '@/lib/api';

interface VisitorDetailJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  guestId?: string;
  userId?: number | string | null;
  leadId?: number | string | null;
  userRole?: string;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  ipAddress?: string;
}

export const VisitorDetailJourneyModal: React.FC<VisitorDetailJourneyModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  guestId,
  userId,
  leadId,
  userRole = 'website',
  userName,
  userEmail,
  userPhone,
  ipAddress,
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'property' | 'calculator' | 'search' | 'page' | 'portal'>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchJourney = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        if (sessionId) {
          endpoint = `/analytics/timeline/session/${sessionId}`;
        } else if (guestId) {
          endpoint = `/analytics/timeline/guest/${guestId}`;
        } else if (userId) {
          endpoint = `/analytics/timeline/user/${userId}`;
        } else if (leadId) {
          endpoint = `/analytics/timeline/lead/${leadId}`;
        }

        if (endpoint) {
          const res = await api.get(endpoint);
          if (res.data?.success) {
            setEvents(res.data.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch session timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [isOpen, sessionId, guestId, userId, leadId]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsePayload = (payload: any) => {
    if (!payload) return {};
    if (typeof payload === 'object') return payload;
    try {
      return JSON.parse(payload);
    } catch {
      return {};
    }
  };

  const getEventBadge = (eventType: string, eventName: string) => {
    if (eventType === 'property' || eventName.includes('property')) {
      return {
        label: 'Property View',
        bg: 'bg-emerald-500',
        lightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: <Eye className="w-3 h-3 text-emerald-600" />,
      };
    }
    if (eventType === 'calculator' || eventName.includes('emi') || eventName.includes('calculator')) {
      return {
        label: 'EMI Calculation',
        bg: 'bg-purple-600',
        lightBg: 'bg-purple-50 text-purple-800 border-purple-200',
        icon: <Calculator className="w-3 h-3 text-purple-600" />,
      };
    }
    if (eventType === 'search' || eventName.includes('search') || eventName.includes('filter')) {
      return {
        label: 'Search & Filter',
        bg: 'bg-cyan-600',
        lightBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        icon: <Search className="w-3 h-3 text-cyan-600" />,
      };
    }
    if (eventType === 'portal' || eventName.includes('dashboard') || eventName.includes('tab')) {
      return {
        label: 'Portal Action',
        bg: 'bg-blue-600',
        lightBg: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: <Building className="w-3 h-3 text-blue-600" />,
      };
    }
    return {
      label: 'Page View',
      bg: 'bg-slate-600',
      lightBg: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: <Activity className="w-3 h-3 text-slate-600" />,
    };
  };

  const propertyViews = events.filter((e) => e.event_type === 'property' || e.event_name.includes('property')).length;
  const emiCalcs = events.filter((e) => e.event_type === 'calculator' || e.event_name.includes('emi') || e.event_name.includes('calculator')).length;
  const searches = events.filter((e) => e.event_type === 'search' || e.event_name.includes('search')).length;
  const pageViews = events.filter((e) => e.event_type === 'page' || e.event_name.includes('viewed')).length;

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'property') return ev.event_type === 'property' || ev.event_name.includes('property');
    if (activeFilter === 'calculator') return ev.event_type === 'calculator' || ev.event_name.includes('emi') || ev.event_name.includes('calculator');
    if (activeFilter === 'search') return ev.event_type === 'search' || ev.event_name.includes('search');
    if (activeFilter === 'page') return ev.event_type === 'page';
    if (activeFilter === 'portal') return ev.event_type === 'portal' || ev.event_name.includes('tab') || ev.event_name.includes('dashboard');
    return true;
  });

  const renderRolePill = () => {
    const r = String(userRole || 'GUEST').toUpperCase();
    let bg = 'bg-slate-100 text-slate-700 border-slate-300';
    if (r === 'BUYER' || r.includes('BUYER')) bg = 'bg-blue-500/20 text-blue-200 border-blue-400/30';
    else if (r === 'SELLER' || r.includes('SELLER')) bg = 'bg-purple-500/20 text-purple-200 border-purple-400/30';
    else if (r === 'OWNER' || r.includes('OWNER')) bg = 'bg-amber-500/20 text-amber-200 border-amber-400/30';
    else if (r === 'TENANT' || r.includes('TENANT')) bg = 'bg-teal-500/20 text-teal-200 border-teal-400/30';

    return (
      <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wide border ${bg}`}>
        {r}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Compact Top Header */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-white font-black text-xs shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-indigo-300" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-white truncate">
                  {userName || (userId ? `User #${userId}` : 'Anonymous Visitor')}
                </span>
                {renderRolePill()}
                {userId && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ID #{userId}
                  </span>
                )}
                {leadId && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Lead #{leadId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10.5px] text-slate-300 font-mono mt-0.5 flex-wrap">
                {userEmail && <span className="text-slate-300 font-sans">{userEmail}</span>}
                {userPhone && <span className="text-slate-400 font-sans">• {userPhone}</span>}
                {ipAddress && (
                  <span className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.2 rounded text-[10px] border border-slate-700">
                    IP: {ipAddress}
                    <button onClick={() => handleCopy(ipAddress)} className="hover:text-white transition-colors cursor-pointer">
                      {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact 4-Metric Bar */}
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 divide-x divide-slate-200 text-center py-1.5 px-1">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Properties</span>
            <span className="text-xs font-black text-emerald-700 block">{propertyViews}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Calculators</span>
            <span className="text-xs font-black text-purple-700 block">{emiCalcs}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Searches</span>
            <span className="text-xs font-black text-cyan-700 block">{searches}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total Steps</span>
            <span className="text-xs font-black text-slate-900 block">{events.length}</span>
          </div>
        </div>

        {/* Compact Filter Pills */}
        <div className="px-4 py-1.5 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-bold uppercase text-[9.5px] mr-0.5">Filter:</span>
          {[
            { id: 'all', label: `All (${events.length})` },
            { id: 'property', label: `Properties (${propertyViews})` },
            { id: 'calculator', label: `Calculators (${emiCalcs})` },
            { id: 'search', label: `Searches (${searches})` },
            { id: 'portal', label: `Portal Tabs` },
            { id: 'page', label: `Pages (${pageViews})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-2.5 py-0.5 rounded-md font-bold whitespace-nowrap transition-all cursor-pointer border ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Compact Visual Journey Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-100/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs font-bold text-slate-600">Loading activity timeline...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-1 opacity-40" />
              <p className="font-bold text-xs text-slate-700">No activity events found</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-300 ml-3 space-y-2">
              {filteredEvents.map((event, idx) => {
                const payload = parsePayload(event.payload);
                const badge = getEventBadge(event.event_type, event.event_name);
                const isPreLogin = !event.user_id && !event.lead_id;

                return (
                  <div key={event.id || idx} className="relative pl-4 group">
                    {/* Compact Node Dot */}
                    <div className="absolute -left-[7px] top-2.5 w-3 h-3 rounded-full bg-white border-2 border-slate-400 group-hover:border-indigo-600 transition-all flex items-center justify-center shadow-xs">
                      <div className={`w-1 h-1 rounded-full ${badge.bg}`}></div>
                    </div>

                    {/* Compact Event Card */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow p-2.5 space-y-1.5">
                      {/* Top Action Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <div className="p-1 rounded bg-slate-100 border border-slate-200 shrink-0">
                            {badge.icon}
                          </div>
                          <span className="font-bold text-slate-900 text-xs capitalize truncate">
                            {event.event_name.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border shrink-0 ${badge.lightBg}`}>
                            {badge.label}
                          </span>
                          {isPreLogin ? (
                            <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded border border-slate-200 shrink-0">
                              Pre-Login
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-100 text-blue-800 rounded border border-blue-200 shrink-0">
                              Logged In ({event.source || 'Portal'})
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap shrink-0">
                          {new Date(event.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Property Details Card (Compact) */}
                      {event.property_title && (
                        <div className="p-1.5 px-2 bg-emerald-50/70 rounded-md border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="font-bold text-emerald-950 truncate text-[11px]">
                              {event.property_title}
                            </span>
                            {event.property_locality && (
                              <span className="text-emerald-800 text-[10px] shrink-0 font-medium">
                                📍 {event.property_locality}
                              </span>
                            )}
                          </div>
                          {event.property_price && (
                            <span className="font-extrabold text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-[10.5px] shrink-0">
                              ₹{Number(event.property_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* EMI Calculations Structured Box (Compact) */}
                      {payload?.loan_amount && (
                        <div className="p-2 bg-purple-50/80 rounded-md border border-purple-200 text-xs">
                          <div className="font-bold text-purple-950 flex items-center gap-1 text-[10.5px] mb-1">
                            <Calculator className="w-3 h-3 text-purple-700" /> EMI Calculator Details:
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                            <div className="bg-white p-1 rounded border border-purple-100 text-center">
                              <span className="text-slate-400 block text-[8px] uppercase font-bold">Loan</span>
                              <span className="font-extrabold text-slate-900">
                                ₹{Number(payload.loan_amount).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="bg-white p-1 rounded border border-purple-100 text-center">
                              <span className="text-slate-400 block text-[8px] uppercase font-bold">Rate</span>
                              <span className="font-extrabold text-slate-900">{payload.interest_rate || '8.5'}%</span>
                            </div>
                            <div className="bg-white p-1 rounded border border-purple-100 text-center">
                              <span className="text-slate-400 block text-[8px] uppercase font-bold">Tenure</span>
                              <span className="font-extrabold text-slate-900">{payload.tenure_years || '20'}Y</span>
                            </div>
                            <div className="bg-purple-600 text-white p-1 rounded text-center">
                              <span className="text-purple-200 block text-[8px] uppercase font-bold">EMI</span>
                              <span className="font-black text-white">
                                ₹{payload.monthly_emi ? Number(payload.monthly_emi).toLocaleString('en-IN') : '—'}/mo
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Search Filters Structured Box (Compact) */}
                      {(payload?.search_query || payload?.locality || payload?.bhk || payload?.budget) && (
                        <div className="p-1.5 px-2 bg-cyan-50/70 rounded-md border border-cyan-200 flex items-center gap-1.5 flex-wrap text-[10px]">
                          <Search className="w-3 h-3 text-cyan-700 shrink-0" />
                          {payload.search_query && (
                            <span className="px-1.5 py-0.2 bg-white border border-cyan-300 rounded text-cyan-900 font-bold">
                              "{payload.search_query}"
                            </span>
                          )}
                          {payload.locality && (
                            <span className="px-1.5 py-0.2 bg-white border border-cyan-300 rounded text-cyan-900 font-bold">
                              📍 {payload.locality}
                            </span>
                          )}
                          {payload.bhk && (
                            <span className="px-1.5 py-0.2 bg-white border border-cyan-300 rounded text-cyan-900 font-bold">
                              🛏️ {payload.bhk}
                            </span>
                          )}
                          {payload.budget && (
                            <span className="px-1.5 py-0.2 bg-white border border-cyan-300 rounded text-cyan-900 font-bold">
                              💰 {payload.budget}
                            </span>
                          )}
                        </div>
                      )}

                      {/* URL & Source Footer */}
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9.5px] text-slate-400 font-mono">
                        <span className="truncate max-w-[65%]" title={event.page_url}>
                          🔗 {event.page_url}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {event.ip_address && (
                            <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[9px] font-semibold border border-slate-200">
                              IP: {event.ip_address}
                            </span>
                          )}
                          <span className="capitalize text-slate-600 font-sans font-bold">{event.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Compact Modal Footer */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Chronological activity history</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorDetailJourneyModal;
