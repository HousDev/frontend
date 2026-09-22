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
  Bot,
  Zap,
  PhoneCall,
  Flame,
  MessageCircle,
  ExternalLink,
  HelpCircle,
  TrendingUp,
  Wallet,
  RefreshCw,
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
  initialAiInterest?: any;
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
  initialAiInterest,
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'property' | 'calculator' | 'search' | 'page' | 'portal'>('all');
  const [copied, setCopied] = useState(false);

  // AI Dossier & Live Analysis State
  const [aiDossier, setAiDossier] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState<boolean>(false);
  const [activePlaybookTab, setActivePlaybookTab] = useState<'script' | 'whatsapp' | 'mindset'>('script');

  useEffect(() => {
    if (!isOpen) return;

    // Auto-fetch AI Dossier if sessionId is present
    if (sessionId) {
      const fetchAi = async () => {
        setLoadingAi(true);
        try {
          const res = await api.get(`/analytics/session/${sessionId}/ai-dossier`);
          if (res.data?.success && res.data?.dossier) {
            setAiDossier(res.data.dossier);
          }
        } catch (err) {
          console.warn('Auto AI dossier fetch error:', err);
        } finally {
          setLoadingAi(false);
        }
      };
      fetchAi();
    }
  }, [isOpen, sessionId]);

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

  const handleOpenWhatsApp = (text: string) => {
    if (!userPhone) return;
    const cleanDigits = userPhone.replace(/\D/g, '');
    const phoneWithCode = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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

  const renderRolePill = (personaStr?: string) => {
    const r = String(personaStr || userRole || 'GUEST').toUpperCase();
    let bg = 'bg-slate-100 text-slate-700 border-slate-300';
    let icon = '🌐';
    if (r === 'BUYER' || r.includes('BUYER')) {
      bg = 'bg-blue-500/20 text-blue-200 border-blue-400/30';
      icon = '🎯';
    } else if (r === 'SELLER' || r.includes('SELLER')) {
      bg = 'bg-purple-500/20 text-purple-200 border-purple-400/30';
      icon = '🏷️';
    } else if (r === 'OWNER' || r.includes('OWNER') || r.includes('LANDLORD')) {
      bg = 'bg-amber-500/20 text-amber-200 border-amber-400/30';
      icon = '🔑';
    } else if (r === 'TENANT' || r.includes('TENANT') || r.includes('RENT')) {
      bg = 'bg-teal-500/20 text-teal-200 border-teal-400/30';
      icon = '🛋️';
    } else if (r === 'BROKER' || r.includes('BROKER') || r.includes('AGENT')) {
      bg = 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30';
      icon = '🤝';
    }

    return (
      <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wide border flex items-center gap-1 ${bg}`}>
        <span>{icon}</span>
        <span>{r}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
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
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 divide-x divide-slate-200 text-center py-1.5 px-1 shrink-0">
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

        {/* 🤖 Advanced Role-Based AI Executive Interest Intelligence Console */}
        {(() => {
          const effectiveInterest = aiDossier?.raw_interest || initialAiInterest;
          const persona = String(aiDossier?.persona || effectiveInterest?.persona || effectiveInterest?.role || userRole || 'GUEST').toUpperCase();
          const roleDisplay = aiDossier?.role_display || effectiveInterest?.role_display || (
            persona === 'BUYER' ? 'Verified Buyer Prospect' :
            persona === 'SELLER' ? 'Property Seller Prospect' :
            persona === 'OWNER' ? 'Asset Owner / Landlord' :
            persona === 'TENANT' ? 'Rental Tenant Prospect' :
            persona === 'BROKER' ? 'Channel Partner / Broker' : 'Website Visitor'
          );
          const roleIcon = effectiveInterest?.role_icon || (
            persona === 'BUYER' ? '🎯' :
            persona === 'SELLER' ? '🏷️' :
            persona === 'OWNER' ? '🔑' :
            persona === 'TENANT' ? '🛋️' :
            persona === 'BROKER' ? '🤝' : '🌐'
          );
          const intentLevel = aiDossier?.identified_property?.interest_level || effectiveInterest?.intent_level || 'EXPLORING';
          const intentScore = aiDossier?.intent_score ?? effectiveInterest?.intent_score ?? 35;
          const callingScript = aiDossier?.executive_calling_script || effectiveInterest?.executive_calling_script || (
            effectiveInterest?.has_detected_property
              ? `"Hello! I noticed you were exploring verified options at ${effectiveInterest.property_title}${effectiveInterest.property_locality ? ` in ${effectiveInterest.property_locality}` : ''}. Are you looking for ready possession, or would you like me to arrange a convenient site visit this weekend?"`
              : `"Hello! Thank you for visiting Resale Expert. I saw you were exploring verified resale properties in Pune. May I know your preferred budget and BHK so I can share matching verified inventory?"`
          );
          const whatsappMessage = aiDossier?.whatsapp_message || effectiveInterest?.whatsapp_followup_message || '';
          const objections: Array<{ objection: string; response: string }> = aiDossier?.objection_handling || effectiveInterest?.objection_handling || [];
          const buyingSignals: string[] = aiDossier?.buying_or_selling_signals || effectiveInterest?.behavioral_signals || [];
          const customerMindset = aiDossier?.customer_mindset || effectiveInterest?.customer_mindset || 'Evaluating property market options and affordability in Pune.';
          const executiveAction = aiDossier?.recommended_action || effectiveInterest?.executive_action || 'Engage prospect via telephone or WhatsApp consultation.';
          const summary = aiDossier?.executive_summary || effectiveInterest?.summary || 'Visitor activity analyzed across listings and pages.';
          const financialMetrics = effectiveInterest?.financial_metrics || {};

          const fetchLiveAiDossier = async () => {
            if (!sessionId) return;
            setLoadingAi(true);
            try {
              const res = await api.get(`/analytics/session/${sessionId}/ai-dossier`);
              if (res.data?.success && res.data?.dossier) {
                setAiDossier(res.data.dossier);
              }
            } catch (err) {
              console.error('Failed to generate deep AI dossier:', err);
            } finally {
              setLoadingAi(false);
            }
          };

          // Role Gradient & Accent Theme
          let themeGradient = 'from-slate-950 via-indigo-950 to-slate-900 border-indigo-900/60';
          let roleBadgeBg = 'bg-blue-500/20 text-blue-200 border-blue-400/40';
          if (persona === 'SELLER') {
            themeGradient = 'from-slate-950 via-purple-950 to-slate-900 border-purple-900/60';
            roleBadgeBg = 'bg-purple-500/20 text-purple-200 border-purple-400/40';
          } else if (persona === 'OWNER') {
            themeGradient = 'from-slate-950 via-amber-950/80 to-slate-900 border-amber-900/60';
            roleBadgeBg = 'bg-amber-500/20 text-amber-200 border-amber-400/40';
          } else if (persona === 'TENANT') {
            themeGradient = 'from-slate-950 via-teal-950 to-slate-900 border-teal-900/60';
            roleBadgeBg = 'bg-teal-500/20 text-teal-200 border-teal-400/40';
          } else if (persona === 'BROKER') {
            themeGradient = 'from-slate-950 via-cyan-950 to-slate-900 border-cyan-900/60';
            roleBadgeBg = 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40';
          }

          const latestPage = events.length > 0 ? (events[0]?.page_url || '/') : '/';
          const searchEvent = events.find((e) => e.event_type === 'search' || e.event_name?.includes('search'));
          const searchPayload = searchEvent ? parsePayload(searchEvent.payload) : null;
          const isAnonymous = !userPhone && !userEmail && (!userName || userName.toLowerCase().includes('anonymous'));

          return (
            <div className={`shrink-0 bg-gradient-to-r ${themeGradient} text-white p-3 border-b space-y-2.5`}>
              {/* Top Row: Role Identity, Intent Score, AI Status & Refresh */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Persona Badge */}
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black border flex items-center gap-1.5 shadow-sm ${roleBadgeBg}`}>
                    <span className="text-sm">{roleIcon}</span>
                    <span className="tracking-wide uppercase">{roleDisplay}</span>
                  </span>

                  {/* Intent Gauge Badge */}
                  <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-white/10 text-xs">
                    <span className={`w-2 h-2 rounded-full ${intentScore >= 70 ? 'bg-rose-500 animate-pulse' : intentScore >= 40 ? 'bg-indigo-400' : 'bg-slate-400'}`}></span>
                    <span className="font-extrabold text-[11px] text-white">
                      {intentLevel === 'HIGH' ? '🔥 High Intent' : intentLevel === 'MEDIUM' ? '💡 Evaluating' : '🔍 Discovery'}
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono font-bold">({intentScore}/100)</span>
                  </div>

                  {/* AI Source Tag */}
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
                    {aiDossier?.source === 'openai-live' ? (
                      <span className="text-emerald-300 font-bold flex items-center gap-0.5">
                        <Zap className="w-3 h-3 text-emerald-400" /> OpenAI Live ({aiDossier.model || 'gpt-4o-mini'})
                      </span>
                    ) : (
                      <span className="text-indigo-300 font-semibold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> Role-Based Intelligence
                      </span>
                    )}
                  </span>
                </div>

                {/* Live Re-Analyze Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchLiveAiDossier}
                    disabled={loadingAi || !sessionId}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white text-[10.5px] font-bold shadow-sm transition-all cursor-pointer"
                    title="Generate live deep OpenAI analysis using ChatGPT integration settings"
                  >
                    {loadingAi ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing AI...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 text-amber-300" />
                        <span>{aiDossier ? 'Refresh AI' : '⚡ Deep AI Analysis'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Meaningful Target Property / Search Focus / Live Activity Footprint */}
              {effectiveInterest?.has_detected_property ? (
                <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-xs">
                          {effectiveInterest.property_title}
                          {effectiveInterest.unit_type && ` (${effectiveInterest.unit_type})`}
                        </span>
                        {effectiveInterest.property_locality && (
                          <span className="text-[10px] text-emerald-300 font-medium">
                            📍 {effectiveInterest.property_locality}
                          </span>
                        )}
                        {effectiveInterest.views_count > 1 && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9.5px] px-1.5 py-0.2 rounded font-bold">
                            {effectiveInterest.views_count} Views
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-slate-300 mt-0.5 truncate">
                        <span>Action: <strong className="text-amber-300 font-semibold">{executiveAction}</strong></span>
                      </div>
                    </div>
                  </div>

                  {effectiveInterest.formatted_price && (
                    <div className="text-right shrink-0">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-emerald-400 block">Listed Price</span>
                      <span className="font-black text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded text-xs border border-emerald-500/50 inline-block">
                        {effectiveInterest.formatted_price}
                      </span>
                    </div>
                  )}
                </div>
              ) : (searchPayload?.locality || searchPayload?.search_query) ? (
                <div className="bg-cyan-950/70 border border-cyan-500/40 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-white text-xs">
                        Searching for Properties in {searchPayload.locality || searchPayload.search_query}
                      </div>
                      <div className="text-[10.5px] text-slate-300 mt-0.5">
                        {searchPayload.bhk && `🛏️ ${searchPayload.bhk} BHK • `}
                        {searchPayload.budget && `💰 Budget: ${searchPayload.budget} • `}
                        <span>Action: <strong className="text-amber-300 font-semibold">{executiveAction}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9.5px] text-cyan-300 font-bold bg-cyan-900/60 px-2 py-1 rounded border border-cyan-500/40">
                      Active Search
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-xs">
                          Browsing Footprint: {events.length} Page{events.length === 1 ? '' : 's'} Viewed
                        </span>
                        <span className="bg-slate-700/60 text-slate-300 border border-slate-600 text-[9.5px] px-1.5 py-0.2 rounded font-bold">
                          Top-of-Funnel Visitor
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-300 mt-0.5 truncate">
                        <span>Current / Landing: </span>
                        <span className="font-mono text-indigo-200 font-semibold">{latestPage.replace(/https?:\/\/[^\/]+/, '') || '/'}</span>
                        <span className="text-slate-400 ml-2">• No specific property shortlisted yet</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-950/80 border border-indigo-500/40 px-2.5 py-1 rounded-md text-right shrink-0">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-indigo-300 block">Lead Conversion Opportunity</span>
                    <span className="text-[10.5px] font-bold text-amber-200">
                      Capture Contact On Next Visit
                    </span>
                  </div>
                </div>
              )}

              {/* Role-Specific Financial Intelligence Strip (4 Metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {persona === 'BUYER' ? (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Est. Loan Need</span>
                      <span className="font-extrabold text-[11.5px] text-white">
                        {financialMetrics.estimated_loan_amount
                          ? `₹${(financialMetrics.estimated_loan_amount / 100000).toFixed(1)} L`
                          : (effectiveInterest?.formatted_price ? `~80% of ${effectiveInterest.formatted_price}` : 'Self-Funded / TBA')}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Est. Monthly EMI</span>
                      <span className="font-extrabold text-[11.5px] text-purple-300">
                        {financialMetrics.estimated_monthly_emi
                          ? `₹${Number(financialMetrics.estimated_monthly_emi).toLocaleString('en-IN')}/mo`
                          : (financialMetrics.estimated_loan_amount ? `~₹${Math.round(financialMetrics.estimated_loan_amount * 0.00868).toLocaleString('en-IN')}/mo` : 'Not Calculated')}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Est. Down Payment</span>
                      <span className="font-extrabold text-[11.5px] text-emerald-300">
                        {financialMetrics.estimated_down_payment
                          ? `₹${(financialMetrics.estimated_down_payment / 100000).toFixed(1)} L`
                          : 'Standard 20%'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Tenure & Rate</span>
                      <span className="font-extrabold text-[11.5px] text-amber-300">
                        {financialMetrics.tenure_years || 20} Yrs @ {financialMetrics.interest_rate || 8.5}%
                      </span>
                    </div>
                  </>
                ) : persona === 'SELLER' ? (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Valuation Band</span>
                      <span className="font-extrabold text-[11.5px] text-purple-300">
                        {financialMetrics.estimated_valuation_band || (effectiveInterest?.formatted_price ? `${effectiveInterest.formatted_price} ±5%` : 'Market Comparison Active')}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Market Buyer Pool</span>
                      <span className="font-extrabold text-[11.5px] text-emerald-300">
                        High Active Demand
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Listing Charges</span>
                      <span className="font-extrabold text-[11.5px] text-amber-300">
                        0% Free Upfront Listing
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Liquidity Horizon</span>
                      <span className="font-extrabold text-[11.5px] text-white">
                        &lt; 45 Days to Registered Deed
                      </span>
                    </div>
                  </>
                ) : persona === 'OWNER' ? (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Target Monthly Rent</span>
                      <span className="font-extrabold text-[11.5px] text-amber-300">
                        {financialMetrics.estimated_rent ? `₹${Number(financialMetrics.estimated_rent).toLocaleString('en-IN')}/mo` : 'Benchmark Active'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Security Deposit</span>
                      <span className="font-extrabold text-[11.5px] text-emerald-300">
                        {financialMetrics.estimated_deposit ? `₹${Number(financialMetrics.estimated_deposit).toLocaleString('en-IN')}` : '2-3 Months Standard'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Tenant Screening</span>
                      <span className="font-extrabold text-[11.5px] text-white">
                        Corporate / Working IT
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Agreement Desk</span>
                      <span className="font-extrabold text-[11.5px] text-purple-300">
                        Doorstep Biometric
                      </span>
                    </div>
                  </>
                ) : persona === 'TENANT' ? (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Target Rent Budget</span>
                      <span className="font-extrabold text-[11.5px] text-teal-300">
                        {financialMetrics.estimated_rent ? `₹${Number(financialMetrics.estimated_rent).toLocaleString('en-IN')}/mo` : 'Budget Matching'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Security Deposit</span>
                      <span className="font-extrabold text-[11.5px] text-emerald-300">
                        {financialMetrics.estimated_deposit ? `₹${Number(financialMetrics.estimated_deposit).toLocaleString('en-IN')}` : 'Flexible 2 Months'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Move-in Horizon</span>
                      <span className="font-extrabold text-[11.5px] text-amber-300">
                        Immediate / 15-30 Days
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Owner Verification</span>
                      <span className="font-extrabold text-[11.5px] text-white">
                        100% Direct Owner Listed
                      </span>
                    </div>
                  </>
                ) : persona === 'BROKER' ? (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Commission Split</span>
                      <span className="font-extrabold text-[11.5px] text-cyan-300">
                        50:50 Instant Split
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Payout Milestone</span>
                      <span className="font-extrabold text-[11.5px] text-emerald-300">
                        On Sale Deed Registration
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Lead Protection</span>
                      <span className="font-extrabold text-[11.5px] text-amber-300">
                        Timestamped CRM Tagging
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Inventory Access</span>
                      <span className="font-extrabold text-[11.5px] text-white">
                        Direct-Owner Verified
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Pages Explored</span>
                      <span className="font-extrabold text-[11.5px] text-white">
                        {events.length} Page{events.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Lead Identification</span>
                      <span className="font-extrabold text-[11.5px] text-amber-300">
                        {isAnonymous ? 'Unidentified Guest' : (userName || userEmail || 'Identified Lead')}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Funnel Stage</span>
                      <span className="font-extrabold text-[11.5px] text-cyan-300">
                        {intentScore >= 40 ? 'Active Evaluating' : 'Top-of-Funnel Discovery'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-md p-1.5 px-2">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block">Priority Objective</span>
                      <span className="font-extrabold text-[11.5px] text-emerald-300">
                        {isAnonymous ? 'Capture Phone / Email' : 'Property Consultation'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Playbook Console: Tab Bar & Content */}
              <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                {/* Playbook Tabs */}
                <div className="flex items-center justify-between border-b border-white/10 px-2 py-1 bg-white/5 text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActivePlaybookTab('script')}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activePlaybookTab === 'script'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <PhoneCall className="w-3 h-3 text-amber-300" />
                      <span>Phone Calling Pitch</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePlaybookTab('whatsapp')}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activePlaybookTab === 'whatsapp'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-300" />
                      <span>WhatsApp Follow-Up</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePlaybookTab('mindset')}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activePlaybookTab === 'mindset'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3 text-purple-300" />
                      <span>Mindset & Objections ({objections.length})</span>
                    </button>
                  </div>

                  {/* Immediate Action Badge */}
                  <div className="hidden sm:flex items-center gap-1 text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <Zap className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[200px]" title={executiveAction}>Next: {executiveAction}</span>
                  </div>
                </div>

                {/* Tab 1: Calling Script */}
                {activePlaybookTab === 'script' && (
                  <div className="p-2.5 space-y-2">
                    {isAnonymous && (
                      <div className="bg-amber-500/15 border border-amber-500/30 rounded px-2.5 py-1 text-[10.5px] text-amber-200 flex items-center gap-1.5">
                        <span className="font-bold">ℹ️ Anonymous Visitor:</span>
                        <span>No phone number recorded yet. Use this pitch when the visitor connects via chat or enquiry form.</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> Conversational Pitch Script:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(callingScript.replace(/"/g, ''));
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="text-[10px] font-bold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded transition-colors border border-white/20"
                      >
                        {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                        <span>{copiedScript ? 'Copied Pitch!' : 'Copy Pitch Script'}</span>
                      </button>
                    </div>
                    <p className="text-[11.5px] text-slate-100 italic font-sans leading-relaxed select-all bg-white/5 p-2 rounded border border-white/10">
                      {callingScript}
                    </p>
                  </div>
                )}

                {/* Tab 2: WhatsApp Follow-Up */}
                {activePlaybookTab === 'whatsapp' && (
                  <div className="p-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> Ready-to-Send WhatsApp Message:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(whatsappMessage);
                            setCopiedWhatsapp(true);
                            setTimeout(() => setCopiedWhatsapp(false), 2000);
                          }}
                          className="text-[10px] font-bold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded transition-colors border border-white/20"
                        >
                          {copiedWhatsapp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                          <span>{copiedWhatsapp ? 'Copied WhatsApp!' : 'Copy WhatsApp'}</span>
                        </button>
                        {userPhone && (
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(whatsappMessage)}
                            className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1 cursor-pointer px-2.5 py-0.5 rounded transition-colors shadow-xs"
                            title="Directly launch WhatsApp chat with this lead"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-100 font-sans leading-relaxed select-all whitespace-pre-wrap bg-white/5 p-2 rounded border border-white/10">
                      {whatsappMessage || `Hi ${userName || 'there'}, thank you for visiting Resale Expert! How can we assist with your property requirement?`}
                    </p>
                  </div>
                )}

                {/* Tab 3: Customer Mindset, Behavioral Signals & Objections */}
                {activePlaybookTab === 'mindset' && (
                  <div className="p-2.5 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-white/5 p-2 rounded border border-white/10">
                        <span className="text-[9.5px] font-extrabold uppercase text-amber-300 block mb-1">
                          Customer Psychology & Mindset:
                        </span>
                        <p className="text-[11px] text-slate-200 leading-snug">
                          {customerMindset}
                        </p>
                      </div>

                      <div className="bg-white/5 p-2 rounded border border-white/10">
                        <span className="text-[9.5px] font-extrabold uppercase text-indigo-300 block mb-1">
                          Key Behavioral Signals Detected:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-200">
                          {buyingSignals.length > 0 ? (
                            buyingSignals.map((sig, idx) => (
                              <li key={idx} className="truncate">{sig}</li>
                            ))
                          ) : (
                            <li className="text-slate-400">Multiple verified property pages explored</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {objections.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-white/10">
                        <span className="text-[9.5px] font-extrabold uppercase text-rose-300 block">
                          Anticipated Customer Objections & Winning Rebuttals:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {objections.map((item, idx) => (
                            <div key={idx} className="bg-rose-950/40 border border-rose-500/30 rounded p-1.5 space-y-0.5">
                              <div className="text-[10.5px] font-bold text-rose-200 flex items-center gap-1">
                                <span>❓</span>
                                <span>"{item.objection}"</span>
                              </div>
                              <div className="text-[10px] text-slate-300 pl-4 border-l border-rose-500/30">
                                <span className="font-bold text-emerald-300">Rebuttal: </span>
                                {item.response}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Compact Filter Pills */}
        <div className="px-4 py-1.5 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-[11px] shrink-0">
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
