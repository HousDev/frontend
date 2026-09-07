// frontend/src/pages/communication/components/ChatConversationList.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Building2,
  User,
  Clock,
  Filter,
  CheckCheck,
  Archive,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  MapPin,
  Layers,
  List,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Tag,
  Compass,
  Users,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  RotateCcw,
  Briefcase,
  UserCheck,
  Globe,
  Home,
} from "lucide-react";
import { PropertyConversation } from "@/services/chatApi";

export interface LocationItem {
  locationName: string;
  totalProperties: number;
  totalInquiries: number;
  totalUnread: number;
  latestMessageTime?: number;
}

export interface PropertyItem {
  propertyId: number;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice?: string | number;
  propertyPhotos?: string[];
  totalInquiries: number;
  totalUnread: number;
  latestMessageTime: number;
}

export interface ExecutiveItem {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  totalInquiries: number;
  totalUnread: number;
  latestMessageTime: number;
}

interface ChatConversationListProps {
  conversations: PropertyConversation[];
  selectedId: number | null;
  onSelect: (conv: PropertyConversation) => void;
  loading: boolean;
  filterTab: "all" | "unread" | "active" | "closed" | "archived";
  setFilterTab: (tab: "all" | "unread" | "active" | "closed" | "archived") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdmin?: boolean;
  executives?: any[];
  selectedExecutiveFilter?: string;
  setSelectedExecutiveFilter?: (id: string) => void;
  socketConnected?: boolean;
  selectedLocation: string | null;
  setSelectedLocation: (loc: string | null) => void;
  selectedPropertyId: number | null;
  setSelectedPropertyId: (pid: number | null) => void;
  locationsCollapsed: boolean;
  setLocationsCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  propertiesCollapsed: boolean;
  setPropertiesCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  usersCollapsed: boolean;
  setUsersCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function formatRupeePrice(price?: number | string | null): string {
  if (!price) return "Price on Request";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function getRoleBadge(role?: string) {
  const norm = String(role || "buyer").toLowerCase().trim();
  if (norm.includes("seller")) {
    return { label: "Seller", bg: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (norm.includes("tenant")) {
    return { label: "Tenant", bg: "bg-purple-50 text-purple-700 border-purple-200" };
  }
  if (norm.includes("owner")) {
    return { label: "Owner", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  return { label: "Buyer", bg: "bg-blue-50 text-blue-700 border-blue-200" };
}

export const ChatConversationList: React.FC<ChatConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  loading,
  filterTab,
  setFilterTab,
  searchQuery,
  setSearchQuery,
  isAdmin = false,
  executives = [],
  selectedExecutiveFilter = "all",
  setSelectedExecutiveFilter,
  socketConnected = true,
  selectedLocation,
  setSelectedLocation,
  selectedPropertyId,
  setSelectedPropertyId,
  locationsCollapsed,
  setLocationsCollapsed,
  propertiesCollapsed,
  setPropertiesCollapsed,
  usersCollapsed,
  setUsersCollapsed,
}) => {
  const [execSearch, setExecSearch] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [propertySearch, setPropertySearch] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [executivesCollapsed, setExecutivesCollapsed] = useState<boolean>(false);

  // 1. Rollup Executives Summary (For Admin sequence)
  const executivesSummary = useMemo(() => {
    if (!isAdmin) return { list: [], totalAllInquiries: 0, totalAllUnread: 0 };

    const execMap = new Map<string, ExecutiveItem>();
    let totalAllInquiries = 0;
    let totalAllUnread = 0;

    // Seed from available executives list
    executives.forEach((e) => {
      const id = String(e.id);
      execMap.set(id, {
        id,
        name: `${e.first_name || ""} ${e.last_name || ""}`.trim() || e.name || "Executive",
        role: e.role || "Executive",
        email: e.email,
        avatar: e.avatar,
        totalInquiries: 0,
        totalUnread: 0,
        latestMessageTime: 0,
      });
    });

    for (const c of conversations) {
      const eid = String(c.executive_id || "unassigned");
      const unread = (c.unread_executive_count || 0) + (c.unread_user_count || 0);
      const msgTime = new Date(c.last_message_at || c.updated_at || c.created_at || 0).getTime();

      totalAllInquiries += 1;
      totalAllUnread += unread;

      if (!execMap.has(eid)) {
        execMap.set(eid, {
          id: eid,
          name: `${c.executive_first_name || ""} ${c.executive_last_name || ""}`.trim() || (eid === "unassigned" ? "Unassigned" : "Executive"),
          role: "Executive",
          totalInquiries: 0,
          totalUnread: 0,
          latestMessageTime: 0,
        });
      }

      const item = execMap.get(eid)!;
      item.totalInquiries += 1;
      item.totalUnread += unread;
      if (msgTime > item.latestMessageTime) {
        item.latestMessageTime = msgTime;
      }
    }

    const list = Array.from(execMap.values());

    // Sort executives: Most recent message time first, then unread count
    list.sort((a, b) => {
      if (b.totalUnread > 0 && a.totalUnread === 0) return 1;
      if (a.totalUnread > 0 && b.totalUnread === 0) return -1;
      return b.latestMessageTime - a.latestMessageTime || b.totalInquiries - a.totalInquiries;
    });

    let filtered = list;
    if (execSearch.trim()) {
      const q = execSearch.toLowerCase().trim();
      filtered = list.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
    }

    return {
      list: filtered,
      totalAllInquiries,
      totalAllUnread,
    };
  }, [conversations, executives, isAdmin, execSearch]);

  // Filtered conversations by Executive (if Admin)
  const execFilteredConversations = useMemo(() => {
    if (!isAdmin || !selectedExecutiveFilter || selectedExecutiveFilter === "all") {
      return conversations;
    }
    return conversations.filter((c) => String(c.executive_id) === String(selectedExecutiveFilter));
  }, [conversations, isAdmin, selectedExecutiveFilter]);

  // 2. Rollup Locations Summary (Filtered by selected Executive)
  const locationsSummary = useMemo(() => {
    const locMap = new Map<string, { properties: Set<number>; inquiries: number; unread: number; latestMessageTime: number }>();
    let totalAllInquiries = 0;
    let totalAllUnread = 0;

    for (const c of execFilteredConversations) {
      const loc = (c.property_location || c.property_city || "Other Locations").trim();
      const unread = (c.unread_executive_count || 0) + (isAdmin ? c.unread_user_count || 0 : 0);
      const pid = c.property_id || 0;
      const msgTime = new Date(c.last_message_at || c.updated_at || c.created_at || 0).getTime();

      totalAllInquiries += 1;
      totalAllUnread += unread;

      if (!locMap.has(loc)) {
        locMap.set(loc, { properties: new Set(), inquiries: 0, unread: 0, latestMessageTime: 0 });
      }

      const existing = locMap.get(loc)!;
      existing.properties.add(pid);
      existing.inquiries += 1;
      existing.unread += unread;
      if (msgTime > existing.latestMessageTime) {
        existing.latestMessageTime = msgTime;
      }
    }

    const list: LocationItem[] = Array.from(locMap.entries()).map(([name, data]) => ({
      locationName: name,
      totalProperties: data.properties.size,
      totalInquiries: data.inquiries,
      totalUnread: data.unread,
      latestMessageTime: data.latestMessageTime,
    }));

    // Sort locations: Most recent message first, prioritizing unread
    list.sort((a, b) => {
      if (b.totalUnread > 0 && a.totalUnread === 0) return 1;
      if (a.totalUnread > 0 && b.totalUnread === 0) return -1;
      return b.latestMessageTime - a.latestMessageTime || b.totalInquiries - a.totalInquiries;
    });

    return {
      list,
      totalAllInquiries,
      totalAllUnread,
    };
  }, [execFilteredConversations, isAdmin]);

  // Filter locations by search
  const filteredLocationsList = useMemo(() => {
    if (!locationSearch.trim()) return locationsSummary.list;
    const q = locationSearch.toLowerCase().trim();
    return locationsSummary.list.filter((l) => l.locationName.toLowerCase().includes(q));
  }, [locationsSummary.list, locationSearch]);

  // 3. Rollup Properties List based on selected Location & selected Executive
  const propertyList = useMemo(() => {
    const propMap = new Map<number, PropertyItem>();

    for (const c of execFilteredConversations) {
      const loc = (c.property_location || c.property_city || "Other Locations").trim();
      if (selectedLocation && selectedLocation !== "all" && loc !== selectedLocation) {
        continue;
      }

      const pid = c.property_id || 0;
      const unread = (c.unread_executive_count || 0) + (isAdmin ? c.unread_user_count || 0 : 0);
      const msgTime = new Date(c.last_message_at || c.updated_at || c.created_at || 0).getTime();

      if (!propMap.has(pid)) {
        propMap.set(pid, {
          propertyId: pid,
          propertyTitle: c.property_title || "Residential Property",
          propertyLocation: loc,
          propertyPrice: c.property_price,
          propertyPhotos: c.property_photos,
          totalInquiries: 0,
          totalUnread: 0,
          latestMessageTime: 0,
        });
      }

      const item = propMap.get(pid)!;
      item.totalInquiries += 1;
      item.totalUnread += unread;
      if (msgTime > item.latestMessageTime) {
        item.latestMessageTime = msgTime;
      }
    }

    const list = Array.from(propMap.values());

    let filtered = list;
    if (propertySearch.trim()) {
      const q = propertySearch.toLowerCase().trim();
      filtered = list.filter(
        (p) =>
          p.propertyTitle.toLowerCase().includes(q) ||
          p.propertyLocation.toLowerCase().includes(q)
      );
    }

    // Sort properties: Most recent message first, prioritizing unread
    return filtered.sort((a, b) => {
      if (b.totalUnread > 0 && a.totalUnread === 0) return 1;
      if (a.totalUnread > 0 && b.totalUnread === 0) return -1;
      return b.latestMessageTime - a.latestMessageTime || b.totalInquiries - a.totalInquiries;
    });
  }, [execFilteredConversations, selectedLocation, propertySearch, isAdmin]);

  // 4. Filter Users / Conversations based on Selected Executive, Location, Property, Status, Role, Search
  const filteredUserConversations = useMemo(() => {
    const list = execFilteredConversations.filter((c) => {
      // Location Filter
      if (selectedLocation && selectedLocation !== "all") {
        const loc = (c.property_location || c.property_city || "Other Locations").trim();
        if (loc !== selectedLocation) return false;
      }

      // Property Filter
      if (selectedPropertyId && Number(c.property_id) !== Number(selectedPropertyId)) {
        return false;
      }

      // Status Tab filter
      if (filterTab === "unread") {
        const unread = isAdmin
          ? (c.unread_user_count || 0) + (c.unread_executive_count || 0) > 0
          : (c.unread_executive_count || 0) > 0;
        if (!unread) return false;
      } else if (filterTab === "active" && c.status !== "active") {
        return false;
      } else if (filterTab === "closed" && c.status !== "closed") {
        return false;
      } else if (filterTab === "archived" && c.status !== "archived") {
        return false;
      }

      // Role filter
      if (selectedRole !== "all") {
        const role = String(c.user_role || "buyer").toLowerCase();
        if (!role.includes(selectedRole.toLowerCase())) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const userName = `${c.user_first_name || ""} ${c.user_last_name || ""}`.toLowerCase();
        const propTitle = (c.property_title || "").toLowerCase();
        const lastMsg = (c.last_message_text || "").toLowerCase();
        const execName = `${c.executive_first_name || ""} ${c.executive_last_name || ""}`.toLowerCase();

        return (
          userName.includes(q) ||
          propTitle.includes(q) ||
          lastMsg.includes(q) ||
          execName.includes(q)
        );
      }

      return true;
    });

    // Sort user conversations: Most recent message timestamp on TOP
    return list.sort((a, b) => {
      const aUnread = (a.unread_executive_count || 0) + (isAdmin ? a.unread_user_count || 0 : 0);
      const bUnread = (b.unread_executive_count || 0) + (isAdmin ? b.unread_user_count || 0 : 0);

      if (bUnread > 0 && aUnread === 0) return 1;
      if (aUnread > 0 && bUnread === 0) return -1;

      const aTime = new Date(a.last_message_at || a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.last_message_at || b.updated_at || b.created_at || 0).getTime();
      return bTime - aTime;
    });
  }, [
    execFilteredConversations,
    selectedLocation,
    selectedPropertyId,
    filterTab,
    selectedRole,
    isAdmin,
    searchQuery,
  ]);

  const totalPropertiesUnread = useMemo(() => {
    return propertyList.reduce((sum, p) => sum + (p.totalUnread || 0), 0);
  }, [propertyList]);

  const totalUsersUnread = useMemo(() => {
    return filteredUserConversations.reduce((sum, c) => {
      const u = (c.unread_executive_count || 0) + (isAdmin ? c.unread_user_count || 0 : 0);
      return sum + u;
    }, 0);
  }, [filteredUserConversations, isAdmin]);

  const handleExecutiveClick = (execId: string) => {
    if (setSelectedExecutiveFilter) {
      setSelectedExecutiveFilter(execId);
    }
    setSelectedLocation(null);
    setSelectedPropertyId(null);
    setExecutivesCollapsed(true);
    setLocationsCollapsed(false);
  };

  const handleLocationClick = (locName: string | null) => {
    setSelectedLocation(locName);
    setSelectedPropertyId(null);
    setLocationsCollapsed(true);
    setPropertiesCollapsed(false);
  };

  const handlePropertyClick = (pid: number | null) => {
    setSelectedPropertyId(pid);
    setPropertiesCollapsed(true);
    setUsersCollapsed(false);
  };

  return (
    <div className="flex h-full w-full bg-white border-r border-slate-200 overflow-hidden select-none">
      {/* =========================================================================
          SECTION 0: EXECUTIVES COLUMN (ADMIN ONLY)
          ========================================================================= */}
      {isAdmin && (
        <div
          className={`flex flex-col h-full bg-[#f4f7fb] border-r border-slate-200 transition-all duration-300 shrink-0 ${
            executivesCollapsed ? "w-14" : "w-52 sm:w-56 lg:w-60"
          }`}
        >
          {/* Section 0 Header */}
          {executivesCollapsed ? (
            <div className="p-2 border-b border-slate-200 bg-white flex flex-col items-center gap-1 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExecutivesCollapsed(false)}
                  className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
                  title="Click to Expand Executives"
                >
                  <UserCheck size={15} className="group-hover:scale-110 transition-transform" />
                </button>
                {executivesSummary.totalAllUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                    {executivesSummary.totalAllUnread}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-500">Exec</span>
            </div>
          ) : (
            <div className="p-2.5 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <UserCheck size={15} className="text-indigo-600 shrink-0" />
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                    1. Executives
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                    {executivesSummary.list.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExecutivesCollapsed(true)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Collapse Executives"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </div>

              {/* Executive Quick Search */}
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter executive..."
                  value={execSearch}
                  onChange={(e) => setExecSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Executives List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 custom-scrollbar">
            {/* All Executives Option */}
            <button
              onClick={() => handleExecutiveClick("all")}
              title={executivesCollapsed ? `All Executives (${executivesSummary.totalAllInquiries} inquiries)` : undefined}
              className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                selectedExecutiveFilter === "all"
                  ? "bg-[#0f2b3d] border-[#0f2b3d] text-white shadow-xs font-bold"
                  : "bg-white border-slate-200/80 hover:bg-slate-100/80 text-slate-700"
              } ${executivesCollapsed ? "justify-center p-2" : ""}`}
            >
              {executivesCollapsed ? (
                <div className="relative flex flex-col items-center">
                  <Briefcase size={17} className={selectedExecutiveFilter === "all" ? "text-indigo-400" : "text-slate-500"} />
                  {executivesSummary.totalAllUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                      {executivesSummary.totalAllUnread}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate flex items-center gap-1">
                      <span>👔 All Executives</span>
                    </p>
                    <p className={`text-[9px] font-medium mt-0.5 ${selectedExecutiveFilter === "all" ? "text-slate-300" : "text-slate-400"}`}>
                      {executivesSummary.totalAllInquiries} total inquiries
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {executivesSummary.totalAllUnread > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-600 text-white shadow-2xs">
                        {executivesSummary.totalAllUnread}
                      </span>
                    )}
                    <ChevronRight size={13} className={selectedExecutiveFilter === "all" ? "text-indigo-400" : "text-slate-300"} />
                  </div>
                </>
              )}
            </button>

            {/* Individual Executive Cards */}
            {executivesSummary.list.map((exec) => {
              const isSelected = String(selectedExecutiveFilter) === String(exec.id);

              return (
                <button
                  key={exec.id}
                  onClick={() => handleExecutiveClick(exec.id)}
                  title={executivesCollapsed ? `${exec.name} (${exec.totalInquiries} chats)` : undefined}
                  className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold"
                      : "bg-white border-slate-200/80 hover:bg-slate-100/80 text-slate-700"
                  } ${executivesCollapsed ? "justify-center p-2" : ""}`}
                >
                  {executivesCollapsed ? (
                    <div className="relative flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isSelected ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {exec.name.charAt(0).toUpperCase()}
                      </div>
                      {exec.totalUnread > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                          {exec.totalUnread}
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isSelected ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {exec.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold truncate">{exec.name}</p>
                          <p className={`text-[9px] font-medium mt-0.5 truncate ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                            {exec.totalInquiries} {exec.totalInquiries === 1 ? "inquiry" : "inquiries"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {exec.totalUnread > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                              isSelected
                                ? "bg-white text-indigo-700"
                                : "bg-emerald-600 text-white shadow-2xs"
                            }`}
                          >
                            {exec.totalUnread}
                          </span>
                        )}
                        <ChevronRight size={13} className={isSelected ? "text-white" : "text-slate-300"} />
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 1 / 2: LOCATIONS CARD / COLUMN
          ========================================================================= */}
      <div
        className={`flex flex-col h-full bg-[#f8fafc] border-r border-slate-200 transition-all duration-300 shrink-0 ${
          locationsCollapsed ? "w-14" : "w-52 sm:w-56 lg:w-60"
        }`}
      >
        {/* Section Header */}
        {locationsCollapsed ? (
          <div className="p-2 border-b border-slate-200 bg-white flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLocationsCollapsed(false)}
                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
                title="Click to Expand Locations"
              >
                <MapPin size={15} className="group-hover:scale-110 transition-transform" />
              </button>
              {locationsSummary.totalAllUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                  {locationsSummary.totalAllUnread}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold text-slate-500">Loc</span>
          </div>
        ) : (
          <div className="p-2.5 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin size={15} className="text-emerald-600 shrink-0" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                  {isAdmin ? "2. Locations" : "1. Locations"}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {locationsSummary.list.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLocationsCollapsed(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Collapse Locations"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            </div>

            {/* Location Quick Search */}
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter locations..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Locations List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 custom-scrollbar">
          {/* Option: All Locations */}
          <button
            onClick={() => handleLocationClick("all")}
            title={locationsCollapsed ? `All Locations (${locationsSummary.totalAllInquiries} inquiries)` : undefined}
            className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
              selectedLocation === "all"
                ? "bg-[#0f2b3d] border-[#0f2b3d] text-white shadow-xs font-bold"
                : "bg-white border-slate-200/80 hover:bg-slate-100/80 text-slate-700"
            } ${locationsCollapsed ? "justify-center p-2" : ""}`}
          >
            {locationsCollapsed ? (
              <div className="relative flex flex-col items-center">
                <Globe size={18} className={selectedLocation === "all" ? "text-emerald-400" : "text-slate-500"} />
                {locationsSummary.totalAllUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                    {locationsSummary.totalAllUnread}
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate flex items-center gap-1">
                    <span>🌐 All Locations</span>
                  </p>
                  <p className={`text-[9px] font-medium mt-0.5 ${selectedLocation === "all" ? "text-slate-300" : "text-slate-400"}`}>
                    {locationsSummary.totalAllInquiries} inquiries
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {locationsSummary.totalAllUnread > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        selectedLocation === "all"
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-emerald-600 text-white shadow-2xs"
                      }`}
                    >
                      {locationsSummary.totalAllUnread}
                    </span>
                  )}
                  <ChevronRight size={13} className={selectedLocation === "all" ? "text-emerald-400" : "text-slate-300"} />
                </div>
              </>
            )}
          </button>

          {/* List of Locations */}
          {filteredLocationsList.map((loc) => {
            const isSelected = selectedLocation === loc.locationName;

            return (
              <button
                key={loc.locationName}
                onClick={() => handleLocationClick(loc.locationName)}
                title={locationsCollapsed ? `${loc.locationName} (${loc.totalProperties} props • ${loc.totalInquiries} chats)` : undefined}
                className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs font-bold"
                    : "bg-white border-slate-200/80 hover:bg-slate-100/80 text-slate-700"
                } ${locationsCollapsed ? "justify-center p-2" : ""}`}
              >
                {locationsCollapsed ? (
                  <div className="relative flex flex-col items-center">
                    <MapPin size={17} className={isSelected ? "text-white" : "text-slate-500"} />
                    {loc.totalUnread > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                        {loc.totalUnread}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold truncate">
                        {loc.locationName}
                      </p>
                      <p className={`text-[9px] font-medium mt-0.5 ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                        {loc.totalProperties} {loc.totalProperties === 1 ? "prop" : "props"} • {loc.totalInquiries} {loc.totalInquiries === 1 ? "chat" : "chats"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {loc.totalUnread > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                            isSelected
                              ? "bg-white text-emerald-800"
                              : "bg-emerald-600 text-white shadow-2xs"
                          }`}
                        >
                          {loc.totalUnread}
                        </span>
                      )}
                      <ChevronRight size={13} className={isSelected ? "text-white" : "text-slate-300"} />
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2 / 3: PROPERTIES CARD / COLUMN (Shown when Location is selected)
          ========================================================================= */}
      {selectedLocation && (
        <div
          className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 shrink-0 ${
            propertiesCollapsed ? "w-14" : "w-56 sm:w-60 lg:w-64"
          }`}
        >
          {/* Section Header */}
          {propertiesCollapsed ? (
            <div className="p-2 border-b border-slate-100 bg-white flex flex-col items-center gap-1 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPropertiesCollapsed(false)}
                  className="w-8 h-8 rounded-lg bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
                  title="Click to Expand Properties"
                >
                  <Building2 size={15} className="group-hover:scale-110 transition-transform" />
                </button>
                {totalPropertiesUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                    {totalPropertiesUnread}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-500">Prop</span>
            </div>
          ) : (
            <div className="p-2.5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 size={15} className="text-sky-600 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                      {isAdmin ? "3. Properties" : "2. Properties"}
                    </h3>
                    <p className="text-[9px] text-sky-700 truncate font-semibold">
                      📍 {selectedLocation === "all" ? "All Locations" : selectedLocation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800">
                    {propertyList.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPropertiesCollapsed(true)}
                    className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Collapse Properties"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </div>

              {/* Property Search */}
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search property..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Properties List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 custom-scrollbar">
            {/* Option: All Properties in Selected Location */}
            <button
              onClick={() => handlePropertyClick(null)}
              title={propertiesCollapsed ? "Show All Properties" : undefined}
              className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                selectedPropertyId === null
                  ? "border-[#0f2b3d] bg-[#0f2b3d] text-white shadow-xs font-bold"
                  : "border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700"
              } ${propertiesCollapsed ? "justify-center p-2" : ""}`}
            >
              {propertiesCollapsed ? (
                <div className="relative flex flex-col items-center">
                  <Layers size={17} className={selectedPropertyId === null ? "text-sky-400" : "text-slate-500"} />
                  {totalPropertiesUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                      {totalPropertiesUnread}
                    </span>
                  )}
                </div>
              ) : (
                <div className="min-w-0 flex items-center justify-between w-full">
                  <div>
                    <p className="text-[11px] font-bold truncate flex items-center gap-1">
                      <Layers size={12} className="text-sky-400" />
                      <span>All Properties</span>
                    </p>
                    <p className={`text-[9px] font-medium ${selectedPropertyId === null ? "text-slate-300" : "text-slate-400"}`}>
                      All in {selectedLocation === "all" ? "all locations" : selectedLocation}
                    </p>
                  </div>
                  <ChevronRight size={13} className={selectedPropertyId === null ? "text-sky-400" : "text-slate-300"} />
                </div>
              )}
            </button>

            {/* Individual Property Cards */}
            {propertyList.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                <Building2 size={20} className="mx-auto mb-1 text-slate-300" />
                <p className="text-[10px]">No properties in this location</p>
              </div>
            ) : (
              propertyList.map((prop) => {
                const isSelected = selectedPropertyId === prop.propertyId;

                return (
                  <div
                    key={prop.propertyId}
                    onClick={() => handlePropertyClick(prop.propertyId)}
                    title={propertiesCollapsed ? `${prop.propertyTitle} (${formatRupeePrice(prop.propertyPrice)})` : undefined}
                    className={`group rounded-xl border p-2 text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/80 shadow-xs ring-1 ring-sky-500/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    } ${propertiesCollapsed ? "flex justify-center p-2" : ""}`}
                  >
                    {propertiesCollapsed ? (
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 overflow-hidden font-bold text-xs">
                          {prop.propertyPhotos && prop.propertyPhotos[0] ? (
                            <img
                              src={prop.propertyPhotos[0]}
                              alt="Prop"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 size={14} />
                          )}
                        </div>
                        {prop.totalUnread > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                            {prop.totalUnread}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start gap-2">
                          {/* Property Thumbnail */}
                          <div className="w-9 h-9 rounded-lg bg-sky-100/80 border border-sky-200/80 flex items-center justify-center text-sky-600 overflow-hidden shrink-0">
                            {prop.propertyPhotos && prop.propertyPhotos[0] ? (
                              <img
                                src={prop.propertyPhotos[0]}
                                alt={prop.propertyTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 size={16} />
                            )}
                          </div>

                          {/* Title & Price */}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-[11px] text-slate-900 truncate leading-tight group-hover:text-sky-600 transition-colors">
                              {prop.propertyTitle}
                            </h4>
                            <p className="text-[10px] font-bold text-[#e87722] mt-0.5">
                              {formatRupeePrice(prop.propertyPrice)}
                            </p>
                          </div>
                        </div>

                        {/* Location & Inquiries Count */}
                        <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500">
                          <span className="truncate max-w-[120px] font-medium flex items-center gap-0.5">
                            <MapPin size={10} className="text-emerald-500" /> {prop.propertyLocation}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {prop.totalUnread > 0 && (
                              <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold rounded-full shadow-2xs">
                                {prop.totalUnread} new
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-bold rounded">
                              👥 {prop.totalInquiries}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3 / 4: USERS / INQUIRIES COLUMN (Shown when Property or Location is selected)
          ========================================================================= */}
      {selectedLocation && (
        <div
          className={`flex flex-col h-full bg-[#fcfcfd] border-r border-slate-200 transition-all duration-300 shrink-0 ${
            usersCollapsed ? "w-14" : "w-60 sm:w-64 lg:w-68"
          }`}
        >
          {/* Section Header */}
          {usersCollapsed ? (
            <div className="p-2 border-b border-slate-100 bg-white flex flex-col items-center gap-1 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUsersCollapsed(false)}
                  className="w-8 h-8 rounded-lg bg-orange-50 hover:bg-[#e87722] text-[#e87722] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
                  title="Click to Expand Inquiries"
                >
                  <Users size={15} className="group-hover:scale-110 transition-transform" />
                </button>
                {totalUsersUnread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                    {totalUsersUnread}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-500">User</span>
            </div>
          ) : (
            <div className="p-2.5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Users size={15} className="text-[#e87722] shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                      {isAdmin ? "4. Inquiries" : "3. Inquiries"}
                    </h3>
                    <p className="text-[9px] text-[#e87722] truncate font-semibold">
                      {selectedPropertyId ? `Prop #${selectedPropertyId}` : "All Properties"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100 text-[#e87722]">
                    {filteredUserConversations.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUsersCollapsed(true)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#e87722] hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Collapse Inquiries"
                  >
                    <ChevronLeft size={14} />
                  </button>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[10px] font-semibold mb-1.5">
                {(["all", "unread", "active", "closed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`flex-1 py-1 rounded-md transition-all capitalize ${
                      filterTab === tab
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search User / Keyword */}
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search buyer, msg..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#e87722] text-slate-800 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* User Conversations List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <RotateCcw size={18} className="animate-spin mx-auto mb-2 text-slate-400" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredUserConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <MessageSquare size={22} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No Inquiries Found</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Try adjusting filters or select a different location.
                </p>
              </div>
            ) : (
              filteredUserConversations.map((conv) => {
                const isSelected = selectedId === conv.id;
                const unreadCount =
                  (conv.unread_executive_count || 0) +
                  (isAdmin ? conv.unread_user_count || 0 : 0);
                const roleBadge = getRoleBadge(conv.user_role);
                const customerName = `${conv.user_first_name || "Guest"} ${conv.user_last_name || ""}`.trim();
                const latestTime = formatRelativeTime(conv.last_message_at || conv.updated_at || conv.created_at);

                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelect(conv)}
                    title={usersCollapsed ? `${customerName} • ${conv.last_message_text || "No message"}` : undefined}
                    className={`group rounded-xl border p-2 text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#e87722] bg-orange-50/80 shadow-xs ring-1 ring-[#e87722]/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    } ${usersCollapsed ? "flex justify-center p-2" : ""}`}
                  >
                    {usersCollapsed ? (
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-[#e87722] text-white" : "bg-orange-100 text-[#e87722]"
                        }`}>
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-bold text-white ring-1 ring-white shadow-xs">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        {/* Header: User Name + Time */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-orange-100 text-[#e87722] flex items-center justify-center font-bold text-[10px] shrink-0">
                              {customerName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {customerName}
                            </span>
                          </div>

                          <span className="text-[9px] text-slate-400 font-medium shrink-0">
                            {latestTime}
                          </span>
                        </div>

                        {/* Last Message Preview */}
                        <p className="text-[11px] text-slate-600 truncate mt-1 leading-snug">
                          {conv.last_message_text || (
                            <span className="italic text-slate-400">Inquiry started</span>
                          )}
                        </p>

                        {/* Footer Chips */}
                        <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
                          <span className={`px-1.5 py-0.2 rounded border font-semibold ${roleBadge.bg}`}>
                            {roleBadge.label}
                          </span>

                          <div className="flex items-center gap-1">
                            {isAdmin && conv.executive_first_name && (
                              <span className="text-slate-400 truncate max-w-[80px]">
                                {conv.executive_first_name}
                              </span>
                            )}

                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold rounded-full shadow-2xs animate-pulse">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
