// frontend/src/pages/communication/components/RexAiSessionsMonitor.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Bot,
  Search,
  RefreshCw,
  User,
  Clock,
  MapPin,
  IndianRupee,
  Home,
  CheckCircle2,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
  Building2,
  CheckCircle,
  Copy,
  Check,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Activity,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { rexApi, RexChatMessageHistory, RexProfile, RexRequirements, RexPropertyCardData } from "@/services/rexApi";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { Link } from "react-router-dom";

interface SessionItem {
  id: number;
  session_uuid: string;
  user_id?: number | null;
  guest_uuid?: string | null;
  current_intent?: string;
  extracted_profile?: RexProfile;
  extracted_requirements?: RexRequirements;
  message_history?: RexChatMessageHistory[];
  is_qualified?: boolean;
  lead_id?: number | null;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  user_email?: string;
  user_phone?: string;
  user_avatar?: string;
}

// Resale Brand Theme Colors
const BRAND = {
  navy: "#0f2b3d",
  navyLight: "#f8fafc",
  navyDark: "#091e2b",
  orange: "#e87722",
  orangeHover: "#d35400",
  orangeLight: "#fff7ed",
  emerald: "#059669",
  emeraldLight: "#ecfdf5",
};

const formatPrice = (amount: number | string | null | undefined) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "Not specified";
  const CRORE = 10_000_000;
  const LAKH = 100_000;
  if (n >= CRORE) return `₹${(n / CRORE).toFixed(2)} Cr`;
  if (n >= LAKH) return `₹${(n / LAKH).toFixed(0)} Lakh`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const isSessionActive = (session?: SessionItem | null): boolean => {
  if (!session?.updated_at) return false;
  const diffMs = Date.now() - new Date(session.updated_at).getTime();
  return diffMs < 45 * 60 * 1000; // Active within last 45 mins
};

const formatChatDateDivider = (dateStr?: string | null): string => {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    if (isNaN(d.getTime())) return "Today";

    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = today.getTime() - msgDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays < 7) {
      return d.toLocaleDateString("en-IN", { weekday: "long" });
    }

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Today";
  }
};

const isSameDay = (d1?: string | null, d2?: string | null): boolean => {
  if (!d1 || !d2) return false;
  try {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  } catch {
    return false;
  }
};

export const RexAiSessionsMonitor: React.FC = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "buyer" | "seller" | "tenant" | "qualified">("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "yesterday" | "week" | "month">("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [metrics, setMetrics] = useState({ totalAll: 0, totalToday: 0, totalQualified: 0, totalBuyers: 0 });
  const [copiedId, setCopiedId] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Track session read/viewed timestamps in localStorage so executive/admin knows about new incoming messages
  const [viewedSessions, setViewedSessions] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem("rex_viewed_sessions");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const markSessionAsViewed = useCallback((uuid: string) => {
    setViewedSessions((prev) => {
      const updated = { ...prev, [uuid]: Date.now() };
      try {
        localStorage.setItem("rex_viewed_sessions", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const selectedUuidRef = useRef<string | null>(null);
  selectedUuidRef.current = selectedSession?.session_uuid || null;

  useEffect(() => {
    if (selectedSession?.session_uuid) {
      markSessionAsViewed(selectedSession.session_uuid);
    }
  }, [selectedSession?.session_uuid, selectedSession?.updated_at, markSessionAsViewed]);

  // Extract unique locations from loaded sessions for quick filtering
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    for (const s of sessions) {
      const reqs = s.extracted_requirements || {};
      if (Array.isArray(reqs.locations)) {
        reqs.locations.forEach((l) => l && locs.add(l.trim()));
      }
      if (reqs.city) locs.add(reqs.city.trim());
    }
    return Array.from(locs).sort();
  }, [sessions]);

  const loadSessions = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      const isQualifiedParam = activeTab === "qualified" ? 1 : undefined;
      const roleParam = activeTab !== "all" && activeTab !== "qualified" ? activeTab : undefined;

      const res = await rexApi.listSessions({
        search: searchQuery.trim(),
        role: roleParam,
        is_qualified: isQualifiedParam,
        date_range: dateRange,
        location: selectedLocation !== "all" ? selectedLocation : "",
        page,
        limit: 30,
      });

      if (res.success) {
        setSessions(res.sessions || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalSessions(res.pagination?.total || 0);
        if (res.metrics) {
          setMetrics(res.metrics);
        }

        // Keep current selected session or pick the first available
        if (res.sessions && res.sessions.length > 0) {
          const currentId = selectedUuidRef.current;
          if (currentId) {
            const found = res.sessions.find((s) => s.session_uuid === currentId);
            if (found) {
              setSelectedSession(found);
            } else if (!isBackground) {
              setSelectedSession(res.sessions[0]);
            }
          } else {
            setSelectedSession(res.sessions[0]);
          }
        } else {
          setSelectedSession(null);
        }
      }
    } catch (err) {
      console.error("Failed to load REX AI sessions:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [searchQuery, activeTab, dateRange, selectedLocation, page]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Live auto-polling every 15 seconds for high volume incoming chats
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      loadSessions(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, loadSessions]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setDateRange("all");
    setSelectedLocation("all");
    setPage(1);
  };

  const handleCopySessionUuid = (uuid: string) => {
    navigator.clipboard.writeText(uuid);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getClientDisplayName = (s: SessionItem) => {
    if (s.first_name || s.last_name) {
      return `${s.first_name || ""} ${s.last_name || ""}`.trim();
    }
    if (s.extracted_profile?.name) {
      return s.extracted_profile.name;
    }
    if (s.guest_uuid) {
      return `Guest (${s.guest_uuid.slice(0, 8)})`;
    }
    return `Visitor (${s.session_uuid.slice(0, 8)})`;
  };

  const getClientContact = (s: SessionItem) => {
    const email = s.user_email || s.extracted_profile?.email;
    const phone = s.user_phone || s.extracted_profile?.phone;
    return { email, phone };
  };

  const hasActiveFilters = searchQuery || activeTab !== "all" || dateRange !== "all" || selectedLocation !== "all";

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs min-h-0">
      {/* 1. TOP METRICS & QUICK FILTER BAR */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Activity size={14} style={{ color: BRAND.orange }} />
            <span className="text-slate-500 font-medium">Today's Chats:</span>
            <strong className="text-slate-900 font-bold">{metrics.totalToday}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Sparkles size={14} className="text-emerald-600" />
            <span className="text-slate-500 font-medium">Qualified Leads:</span>
            <strong className="text-emerald-700 font-bold">{metrics.totalQualified}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Home size={14} className="text-blue-600" />
            <span className="text-slate-500 font-medium">Buyers Inquiring:</span>
            <strong className="text-blue-700 font-bold">{metrics.totalBuyers}</strong>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <Bot size={14} style={{ color: BRAND.navy }} />
            <span className="text-slate-500 font-medium">Total Lifetime:</span>
            <strong className="text-slate-900 font-bold">{metrics.totalAll}</strong>
          </div>
        </div>

        {/* Right Controls: Auto-sync & Refresh */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
              autoRefresh
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
            title="Toggle real-time auto-refresh every 15s"
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            Auto-Sync {autoRefresh ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => loadSessions()}
            disabled={loading}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#e87722]" : ""} />
          </button>
        </div>
      </div>

      {/* 2. SPLIT PANE MAIN CONTENT */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT COLUMN: Sessions Directory */}
        <div
          className={`w-full md:w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/40 h-full ${
            mobileView === "detail" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search, Time Filter, & Intent Tabs */}
          <div className="p-3 bg-white border-b border-slate-200 space-y-2">
            {/* Search + Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search client, locality, phone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e87722] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Date Filter Dropdown */}
              <select
                value={dateRange}
                onChange={(e: any) => {
                  setDateRange(e.target.value);
                  setPage(1);
                }}
                className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#e87722]"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Locality Quick Selector (if multiple localities found) */}
            {availableLocations.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
                <span className="text-slate-400 text-[10px] font-medium flex-shrink-0 flex items-center gap-0.5">
                  <MapPin size={10} style={{ color: BRAND.orange }} /> Locality:
                </span>
                <button
                  onClick={() => {
                    setSelectedLocation("all");
                    setPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                    selectedLocation === "all"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {availableLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setPage(1);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                      selectedLocation === loc
                        ? "bg-[#e87722] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}

            {/* Filter Pills with Brand Styling */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
              {[
                { id: "all", label: "All Intents" },
                { id: "buyer", label: "Buyers" },
                { id: "seller", label: "Sellers" },
                { id: "tenant", label: "Tenants" },
                { id: "qualified", label: "Qualified Leads", isSpecial: true },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-semibold transition-all flex items-center gap-1 ${
                      isActive
                        ? tab.isSpecial
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-[#0f2b3d] text-white shadow-2xs"
                        : tab.isSpecial
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                    }`}
                  >
                    {tab.isSpecial && <Sparkles size={11} />}
                    {tab.label}
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1"
                  title="Clear all filters"
                >
                  <RotateCcw size={10} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading && sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#e87722]" />
                <p className="text-xs">Loading AI chat directory...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bot className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">No AI sessions match your filters</p>
                <p className="text-[11px] text-slate-400 mt-1">Try switching to "All Intents" or resetting filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              sessions.map((session) => {
                const isSelected = selectedSession?.session_uuid === session.session_uuid;
                const name = getClientDisplayName(session);
                const { email, phone } = getClientContact(session);
                const history = session.message_history || [];
                const lastMsg = history[history.length - 1];
                const reqs = session.extracted_requirements || {};
                const loc = reqs.locations && reqs.locations.length > 0 ? reqs.locations.join(", ") : reqs.city;

                // Check if this session has a new unread message since last viewed
                const lastViewedAt = viewedSessions[session.session_uuid] || 0;
                const updatedAt = session.updated_at ? new Date(session.updated_at).getTime() : 0;
                const isNewMessage = !isSelected && updatedAt > 0 && updatedAt > lastViewedAt;

                // Check if buyer has postponed / scheduled visit later
                const hasScheduleLater = history.some((m: any) => Boolean(m.scheduleLater));

                return (
                  <div
                    key={session.session_uuid}
                    onClick={() => {
                      markSessionAsViewed(session.session_uuid);
                      setSelectedSession(session);
                      setMobileView("detail");
                    }}
                    className={`p-3 cursor-pointer transition-all border-l-[3px] ${
                      isSelected
                        ? "bg-white border-l-[#e87722] shadow-2xs"
                        : isNewMessage
                        ? "bg-orange-50/40 hover:bg-orange-50/70 border-l-orange-400"
                        : "hover:bg-slate-100/70 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-[#0f2b3d] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {session.first_name ? session.first_name.charAt(0).toUpperCase() : <User size={14} />}
                          </div>
                          {isNewMessage && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#e87722] ring-2 ring-white animate-pulse" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                            {isNewMessage && (
                              <span className="flex-shrink-0 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#e87722] text-white flex items-center gap-1 shadow-2xs animate-pulse">
                                New
                              </span>
                            )}
                            {isSessionActive(session) ? (
                              <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                              </span>
                            ) : null}
                            {hasScheduleLater && (
                              <span className="flex-shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                Visit Later
                              </span>
                            )}
                            {session.is_qualified && (
                              <span className="flex-shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                Qualified
                              </span>
                            )}
                            {session.lead_id && (
                              <span className="flex-shrink-0 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                                Lead #{session.lead_id}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {phone || email || `Role: ${session.current_intent || "buyer"}`}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 font-medium">
                        {session.updated_at
                          ? formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })
                          : "recently"}
                      </span>
                    </div>

                    {/* Requirements Snippet */}
                    {(loc || reqs.unit_type || reqs.budget_max) && (
                      <div className="my-1.5 flex flex-wrap items-center gap-1 text-[10px] text-slate-600">
                        {loc && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            <MapPin size={9} style={{ color: BRAND.orange }} />
                            {loc}
                          </span>
                        )}
                        {reqs.unit_type && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            <Home size={9} className="text-blue-500" />
                            {reqs.unit_type}
                          </span>
                        )}
                        {reqs.budget_max && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-medium border border-amber-200/50">
                            <IndianRupee size={9} />
                            &lt; {formatPrice(reqs.budget_max)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Last Message Snippet */}
                    {lastMsg && (
                      <p className={`text-[11px] line-clamp-1 italic mt-1 ${isNewMessage ? "text-slate-900 font-semibold not-italic" : "text-slate-500"}`}>
                        <span className="font-semibold text-slate-700 not-italic">
                          {lastMsg.sender === "rex" ? "REX: " : "Client: "}
                        </span>
                        {lastMsg.text}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Layers size={11} />
                        {history.length} messages
                      </span>
                      <span className="uppercase text-[9px] tracking-wider font-bold text-slate-400">
                        {session.current_intent || "Inquiry"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Previous
              </button>
              <span className="text-[11px] font-semibold text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Session Inspector & Full Conversation Stream */}
        <div
          className={`flex-1 flex flex-col h-full bg-slate-50/40 overflow-hidden ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedSession ? (
            <>
              {/* Top Bar with Session Context */}
              <div className="bg-white border-b border-slate-200 p-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setMobileView("list")}
                      className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <ChevronRight size={18} className="rotate-180" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#0f2b3d] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs">
                      {selectedSession.first_name ? selectedSession.first_name.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-extrabold text-slate-900 truncate">
                          {getClientDisplayName(selectedSession)}
                        </h2>
                        {isSessionActive(selectedSession) && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Live Session
                          </span>
                        )}
                        {selectedSession.is_qualified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Qualified Lead
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                        {getClientContact(selectedSession).phone && (
                          <a
                            href={`tel:${getClientContact(selectedSession).phone}`}
                            className="flex items-center gap-1 text-slate-700 font-medium hover:text-[#e87722]"
                          >
                            <Phone size={11} style={{ color: BRAND.orange }} />
                            <span>{getClientContact(selectedSession).phone}</span>
                          </a>
                        )}
                        {getClientContact(selectedSession).email && (
                          <a
                            href={`mailto:${getClientContact(selectedSession).email}`}
                            className="flex items-center gap-1 text-slate-700 font-medium hover:text-[#e87722]"
                          >
                            <Mail size={11} style={{ color: BRAND.orange }} />
                            <span>{getClientContact(selectedSession).email}</span>
                          </a>
                        )}
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock size={11} /> Started: {selectedSession.created_at ? format(new Date(selectedSession.created_at), "dd MMM yyyy, hh:mm a") : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopySessionUuid(selectedSession.session_uuid)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Copy Session ID"
                    >
                      {copiedId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span className="hidden sm:inline">UUID:</span> {selectedSession.session_uuid.slice(0, 8)}...
                    </button>

                    {getClientContact(selectedSession).phone && (
                      <a
                        href={`https://wa.me/${getClientContact(selectedSession).phone?.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-all flex items-center gap-1.5 shadow-2xs hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: BRAND.emerald }}
                      >
                        <Phone size={12} />
                        <span>WhatsApp Client</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* AI Extracted Criteria Strip */}
                {(selectedSession.extracted_requirements || selectedSession.extracted_profile) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-2.5 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-[#e87722]">
                        <Compass size={13} />
                        AI EXTRACTED CLIENT PREFERENCES
                      </span>
                      <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        Intent: {selectedSession.current_intent || "Buyer"}
                      </span>
                    </div>

                    {selectedSession.extracted_requirements && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-medium">Target Location</span>
                          <span className="font-bold text-slate-800 truncate block">
                            {selectedSession.extracted_requirements.locations?.join(", ") ||
                              selectedSession.extracted_requirements.city ||
                              "Flexible / Pune"}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-medium">Configuration</span>
                          <span className="font-bold text-slate-800">
                            {selectedSession.extracted_requirements.unit_type ||
                              (selectedSession.extracted_requirements.bedrooms
                                ? `${selectedSession.extracted_requirements.bedrooms} BHK`
                                : "Any Config")}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-medium">Budget Ceiling</span>
                          <span className="font-bold text-slate-800">
                            {selectedSession.extracted_requirements.budget_max
                              ? formatPrice(selectedSession.extracted_requirements.budget_max)
                              : "Flexible"}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-medium">Property Type</span>
                          <span className="font-bold text-slate-800">
                            {selectedSession.extracted_requirements.property_type || "Residential"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Conversation Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(!selectedSession.message_history || selectedSession.message_history.length === 0) ? (
                  <div className="p-12 text-center text-slate-400">
                    <Bot size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No chat history recorded for this session</p>
                  </div>
                ) : (
                  selectedSession.message_history.map((msg: any, index: number) => {
                    const isUser = msg.sender === "user";
                    const sellerData = msg.sellerConfirmedCard?.data || msg.sellerProperty;
                    const prevMsg = index > 0 ? selectedSession.message_history[index - 1] : null;
                    const prevTime = prevMsg?.timestamp || (prevMsg as any)?.created_at;
                    const currTime = msg.timestamp || (msg as any)?.created_at;
                    const showDateDivider = !prevMsg || !isSameDay(prevTime, currTime);

                    return (
                      <React.Fragment key={msg.id || index}>
                        {showDateDivider && (
                          <div className="flex justify-center my-3 sticky top-1 z-10">
                            <span className="px-3.5 py-1 bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] font-bold rounded-full shadow-2xs border border-slate-200 tracking-wide uppercase">
                              {formatChatDateDivider(currTime)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          {/* Avatar */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs text-white"
                            style={{ backgroundColor: isUser ? BRAND.navy : BRAND.orange }}
                          >
                            {isUser ? <User size={14} /> : <Bot size={14} />}
                          </div>

                          {/* Bubble */}
                          <div className="space-y-2 min-w-0">
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? "bg-[#0f2b3d] text-white rounded-tr-none shadow-xs"
                                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>

                              {/* Embedded Schedule Later Postponed Visit Card */}
                              {msg.scheduleLater && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-900">
                                    <Clock size={13} className="text-amber-700" />
                                    <span>Site Visit Postponed (Schedule Later)</span>
                                  </div>
                                  <div className="p-2 bg-white rounded-lg border border-amber-100 text-[11px] space-y-1">
                                    <div className="flex items-center justify-between font-bold text-slate-900">
                                      <span>{msg.scheduleLater.property_title}</span>
                                      {msg.scheduleLater.property_price && (
                                        <span className="text-amber-700">{formatPrice(msg.scheduleLater.property_price)}</span>
                                      )}
                                    </div>
                                    {msg.scheduleLater.property_location && (
                                      <p className="text-[10px] text-slate-600">Location: <strong>{msg.scheduleLater.property_location}</strong></p>
                                    )}
                                    <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-700">
                                      <span>Assigned Executive: <strong>{msg.scheduleLater.executive_name || "Area Relationship Manager"}</strong></span>
                                      {msg.scheduleLater.executive_phone && (
                                        <span className="text-emerald-700 font-medium">{msg.scheduleLater.executive_phone}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Embedded Seller Submitted Property Card */}
                              {sellerData && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-900">
                                    <Building2 size={13} className="text-emerald-700" />
                                    <span>Seller Listing Submission</span>
                                  </div>
                                  <div className="p-2 bg-white rounded-lg border border-emerald-100 text-[11px] space-y-1">
                                    <div className="flex items-center justify-between font-bold text-slate-900">
                                      <span>{sellerData.society_name}</span>
                                      <span className="text-emerald-700">{sellerData.expected_price}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600">
                                      <span>Locality: <strong>{sellerData.locality}</strong></span>
                                      <span>Config: <strong>{sellerData.bhk}</strong></span>
                                      {sellerData.carpet_area && <span>Area: <strong>{sellerData.carpet_area} sq.ft</strong></span>}
                                      {sellerData.furnishing && <span>Furnishing: <strong>{sellerData.furnishing}</strong></span>}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Embedded Scheduled Visit Info */}
                              {msg.visit && (
                                <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                                  <div className="flex items-center gap-1.5 font-bold text-[11px] mb-1">
                                    <Calendar size={13} className="text-emerald-600" />
                                    Site Visit Booked
                                  </div>
                                  <p className="text-[11px] font-semibold">{msg.visit.property_title}</p>
                                  <p className="text-[10px] text-emerald-800">{msg.visit.property_address}</p>
                                  <div className="mt-1 flex items-center gap-2 text-[10px] font-medium text-emerald-700">
                                    <span>📅 Date: {msg.visit.visit_date}</span>
                                    <span>⏰ Time: {msg.visit.visit_time} ({msg.visit.shift})</span>
                                  </div>
                                </div>
                              )}

                              <span
                                className={`block text-[9px] mt-1.5 font-medium ${
                                  isUser ? "text-slate-300 text-right" : "text-slate-400"
                                }`}
                              >
                                {msg.timestamp
                                  ? format(new Date(msg.timestamp), "hh:mm a")
                                  : ""}
                              </span>
                            </div>

                            {/* Embedded Recommended Property Cards */}
                            {msg.properties && msg.properties.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {msg.properties.map((prop: RexPropertyCardData) => (
                                  <div
                                    key={prop.id}
                                    className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-1 mb-1">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-[#e87722]">
                                          {prop.unit_type || "Apartment"}
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                          {formatPrice(prop.price)}
                                        </span>
                                      </div>
                                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{prop.title}</h4>
                                      <p className="text-[10px] text-slate-500 line-clamp-1 flex items-center gap-0.5 mt-0.5">
                                        <MapPin size={10} style={{ color: BRAND.orange }} />
                                        {prop.location || prop.society || prop.city}
                                      </p>
                                    </div>

                                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                                      <span className="text-[10px] text-slate-400 font-medium">ID #{prop.id}</span>
                                      <Link
                                        to={`/properties/${encodeURIComponent(prop.slug || prop.id)}`}
                                        target="_blank"
                                        className="text-[11px] font-bold text-[#e87722] hover:text-[#d35400] flex items-center gap-0.5 transition-colors"
                                      >
                                        View Property <ExternalLink size={10} />
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Bot size={48} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">Select an AI Chat Session</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Click on any session from the left list to review client requirements, chatbot responses, and recommended properties.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RexAiSessionsMonitor;
