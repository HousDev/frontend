import React from "react";
import {
  Sparkles,
  Home,
  ChevronRight,
  Loader2,
  Building,
  Building2,
  Link2,
  MapPin,
  Search,
  Star,
  CheckCircle2,
  Bed,
  Ruler,
  Sofa,
  Wifi,
  Car,
  ShieldCheck,
  Droplets,
  ArrowUp,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  SlidersHorizontal,
  Calculator,
  FileText,
  CreditCard,
  Wrench,
  ArrowRight,
  Eye,
  History,
  Check,
  ExternalLink,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { getImageUrl } from "@/lib/helpers";
import { Tenant, MatchedProperty } from "./types";
import VisitHistoryModal from "./VisitHistoryModal";

interface TenantDashboardTabProps {
  tenant: Tenant;
  matchedProperties: MatchedProperty[];
  loadingProperties: boolean;
  linkingId: number | string | null;
  onNavigateTab: (tab: string) => void;
  onShareWhatsApp: (p: MatchedProperty) => void;
  onLinkProperty: (p: MatchedProperty) => void;
  fmtINR: (val: number | string) => string;
  budgetMin: number;
  budgetMax: number;
  shortlistedCount?: number;
  enquiredCount?: number;
  visits?: any[];
  onOpenPreferences?: () => void;
}

export default function TenantDashboardTab({
  tenant,
  matchedProperties,
  loadingProperties,
  linkingId,
  onNavigateTab,
  onShareWhatsApp,
  onLinkProperty,
  fmtINR,
  budgetMin,
  budgetMax,
  shortlistedCount = 0,
  enquiredCount = 0,
  visits = [],
  onOpenPreferences,
}: TenantDashboardTabProps) {
  // Format tenant budget display
  const budgetText =
    budgetMin > 0 && budgetMax > 0
      ? `${fmtINR(budgetMin)} – ${fmtINR(budgetMax)}`
      : budgetMax > 0
      ? `Up to ${fmtINR(budgetMax)}`
      : budgetMin > 0
      ? `From ${fmtINR(budgetMin)}`
      : "Not specified";

  // Full History Modal State for Spotlight
  const [viewingDashboardVisit, setViewingDashboardVisit] = React.useState<any | null>(null);

  // Find upcoming active visit
  const upcomingVisit = React.useMemo(() => {
    if (!Array.isArray(visits) || visits.length === 0) return null;
    return visits.find((v) => {
      const st = String(v.status || "").toLowerCase();
      return !st.includes("complete") && !st.includes("cancel") && !st.includes("decline") && !st.includes("missed");
    }) || visits[0];
  }, [visits]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 🌟 1. Premium Welcome & Preferences Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b3856] via-[#104369] to-[#1a5b8c] text-white p-4 sm:p-5 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-40 h-40 rounded-full bg-blue-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-300 text-[10.5px] font-bold mb-1.5">
              <Sparkles size={11} className="text-orange-400" />
              <span>Tenant Rental Workspace</span>
              <span className="text-white/40">•</span>
              <span className="font-mono text-white/90">{tenant.tenant_id || "TEN0001"}</span>
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Welcome back, {tenant.name || "Tenant"}! 👋
            </h1>
            <p className="text-xs text-slate-200 mt-0.5">
              Live dashboard for your matching rental homes, site visit appointments, and active lease tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenPreferences && (
              <button
                onClick={onOpenPreferences}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal size={13} className="text-orange-300" />
                <span>Edit Preferences</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab("matched")}
              className="px-3.5 py-1.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Building2 size={13} />
              <span>Explore Matches ({matchedProperties.length})</span>
            </button>
          </div>
        </div>

        {/* Preferences Pill Bar */}
        <div className="relative z-10 pt-3 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-slate-300 font-semibold text-[10.5px] uppercase tracking-wider">
            Your Search Filter:
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold flex items-center gap-1">
            <Bed size={12} className="text-orange-300" />
            {tenant.preferred_bhk || "Any BHK"}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold flex items-center gap-1">
            <MapPin size={12} className="text-orange-300" />
            {tenant.preferred_location || "All Locations"}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300 font-bold">
            💰 {budgetText}
          </span>

          {tenant.furnishing && (
            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-amber-200 font-semibold">
              🛋️ {tenant.furnishing}
            </span>
          )}
        </div>
      </div>

      {/* 🚀 Rental Journey Lifecycle Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              🎯
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Your Rental Journey Tracker</h3>
              <p className="text-[10.5px] text-slate-400">Step-by-step progress towards renting your dream home</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Stage 2 of 5 Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Step 1 */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                ✓
              </span>
              <span className="text-[9.5px] font-bold text-emerald-700 uppercase">Done</span>
            </div>
            <p className="font-extrabold text-xs text-slate-800">1. Search & Matches</p>
            <p className="text-[10px] text-slate-500">{matchedProperties.length} homes tailored</p>
          </div>

          {/* Step 2 */}
          <div className="p-2.5 rounded-xl bg-blue-50/80 border-2 border-blue-400 shadow-2xs space-y-1 ring-2 ring-blue-100">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                2
              </span>
              <span className="text-[9.5px] font-black text-blue-700 uppercase tracking-wider">In Progress</span>
            </div>
            <p className="font-extrabold text-xs text-blue-950">2. Site Inspections</p>
            <p className="text-[10px] text-blue-700 font-medium">{visits.length} visits scheduled</p>
          </div>

          {/* Step 3 */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 opacity-75">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-[9.5px] font-semibold text-slate-400 uppercase">Upcoming</span>
            </div>
            <p className="font-bold text-xs text-slate-700">3. Token Booking</p>
            <p className="text-[10px] text-slate-400">Lock desired unit</p>
          </div>

          {/* Step 4 */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 opacity-75">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                4
              </span>
              <span className="text-[9.5px] font-semibold text-slate-400 uppercase">Upcoming</span>
            </div>
            <p className="font-bold text-xs text-slate-700">4. Digital KYC & Lease</p>
            <p className="text-[10px] text-slate-400">Online agreement</p>
          </div>

          {/* Step 5 */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 opacity-75">
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                5
              </span>
              <span className="text-[9.5px] font-semibold text-slate-400 uppercase">Upcoming</span>
            </div>
            <p className="font-bold text-xs text-slate-700">5. Move-In & Rent</p>
            <p className="text-[10px] text-slate-400">Keys & digital rent</p>
          </div>
        </div>
      </div>

      {/* 📊 2. Dynamic KPI Stat Cards (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Matches */}
        <div
          onClick={() => onNavigateTab("matched")}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-orange-600 transition-colors">
              Property Matches
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Building2 size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {matchedProperties.length}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Tailored to preferences</span>
            <ChevronRight size={12} className="text-slate-300 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Shortlisted */}
        <div
          onClick={() => onNavigateTab("favorites")}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-rose-600 transition-colors">
              Shortlisted Homes
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Heart size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {shortlistedCount}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Saved favorite homes</span>
            <ChevronRight size={12} className="text-slate-300 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Enquiries */}
        <div
          onClick={() => onNavigateTab("enquired")}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
              Inquiries Sent
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {enquiredCount}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Direct owner inquiries</span>
            <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Site Visits */}
        <div
          onClick={() => onNavigateTab("visits")}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-600 transition-colors">
              Scheduled Visits
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calendar size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {visits.length}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Physical inspections</span>
            <ChevronRight size={12} className="text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* 📅 3. Spotlight Widget: Next Upcoming Site Visit */}
      {upcomingVisit && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-4 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-emerald-500/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Calendar size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.2 rounded-full bg-white text-emerald-800 font-black text-[9px] uppercase tracking-wider">
                  Upcoming Inspection
                </span>
                <span className="text-[11px] font-bold text-emerald-100">
                  {upcomingVisit.visit_time ? String(upcomingVisit.visit_time).replace(/:\d\d$/, "") : "11:00 AM"}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white truncate mt-0.5">
                {upcomingVisit.property_title || upcomingVisit.rental_property_title || "Rental Property Site Visit"}
              </h4>
              <p className="text-[11px] text-emerald-100 truncate">
                {upcomingVisit.meeting_point || "At society premises"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {/* View Full History Button */}
            <button
              onClick={() => setViewingDashboardVisit(upcomingVisit)}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="View full audit timeline and history"
            >
              <History size={13} className="text-orange-300" />
              <span>Full History</span>
            </button>

            {/* Google Maps Directions */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${upcomingVisit.property_title || ''} ${upcomingVisit.meeting_point || ''} ${upcomingVisit.location_name || ''}`.trim() || 'Property Location'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer flex items-center gap-1"
              title="Navigate in Google Maps"
            >
              <MapPin size={12} className="text-emerald-300" />
              <span>Map</span>
            </a>

            {upcomingVisit.owner_phone && (
              <a
                href={`https://wa.me/91${String(upcomingVisit.owner_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm reaching out regarding our scheduled visit for ${upcomingVisit.property_title || 'the rental property'}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <SiWhatsapp size={13} className="text-emerald-600" />
                <span>Chat Owner</span>
              </a>
            )}

            <button
              onClick={() => onNavigateTab("visits")}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
            >
              <span>All Visits</span>
            </button>
          </div>
        </div>
      )}

      {/* 🏢 4. Top Property Recommendations */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="mb-3.5 flex items-center justify-between pb-2.5 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building2 size={18} className="text-orange-500" />
              Top Property Recommendations
            </h3>
            <p className="text-[11px] text-slate-500">
              Hand-picked rental properties matching your budget and preferred locations
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("matched")}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <span>View All ({matchedProperties.length})</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {loadingProperties ? (
          <div className="flex flex-col items-center py-12 text-slate-500">
            <Loader2 className="animate-spin text-orange-500" size={28} />
            <p className="mt-3 text-xs font-semibold">Loading top matching homes...</p>
          </div>
        ) : matchedProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {matchedProperties.slice(0, 5).map((p) => {
              const rawPhoto =
                p.photos?.[0] ??
                p.images?.[0] ??
                p.mediaItems?.[0]?.file_path ??
                null;
              const photoUrl =
                typeof rawPhoto === "string"
                  ? rawPhoto
                  : (rawPhoto as any)?.url ?? null;
              const img = getImageUrl(photoUrl);

              const price = Number(
                p.monthly_rent || p.expected_rent || p.price || 0
              );
              const desc = (p.description || "").trim();

              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-orange-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Section */}
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      {img ? (
                        <img
                          src={img}
                          alt={p.title || p.society_name || "Property"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400">
                          <Building size={24} />
                          <span className="text-[9px] font-medium">No Image</span>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      {/* Price */}
                      <div className="absolute bottom-2 left-2.5">
                        <p className="text-sm font-black text-white drop-shadow">
                          ₹{price.toLocaleString("en-IN")}
                          <span className="text-[9px] font-semibold opacity-85">/mo</span>
                        </p>
                      </div>

                      {/* Match Score */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[8.5px] font-black text-white shadow-sm">
                        <Star size={9} className="fill-white" />
                        {p.matchScore}% Match
                      </div>

                      {/* Property ID */}
                      <div className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-white/90">
                        #{p.id}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2.5 space-y-1.5">
                      {/* Title */}
                      <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">
                        {p.society_name || p.title || `Property #${p.id}`}
                      </h4>

                      {/* Location */}
                      <div className="flex items-center gap-0.5 text-[10px] text-slate-500">
                        <MapPin size={10} className="text-orange-500 shrink-0" />
                        <span className="truncate">
                          {[p.location_name, p.city_name].filter(Boolean).join(", ") || "Location"}
                        </span>
                      </div>

                      {/* Specs */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {p.property_type_name && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-bold text-slate-700">
                            <Bed size={9} />
                            {p.property_type_name}
                          </span>
                        )}
                        {(p.carpet_area || p.builtup_area) && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[8.5px] font-bold text-slate-700">
                            <Ruler size={9} />
                            {p.carpet_area || p.builtup_area} sqft
                          </span>
                        )}
                        {p.furnishing && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-800">
                            <Sofa size={9} />
                            {p.furnishing}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-2.5 pt-0 flex gap-1.5">
                    <button
                      onClick={() => onShareWhatsApp(p)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] py-1.5 text-[9.5px] font-bold text-white transition-all shadow-2xs cursor-pointer"
                    >
                      <SiWhatsapp size={10} />
                      <span>Contact</span>
                    </button>
                    <button
                      onClick={() => onLinkProperty(p)}
                      disabled={linkingId === p.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 py-1.5 text-[9.5px] font-bold text-white transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
                    >
                      {linkingId === p.id ? (
                        <Loader2 className="animate-spin" size={10} />
                      ) : (
                        <>
                          <Link2 size={10} />
                          <span>Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-10 text-center space-y-2">
            <Search size={32} className="text-orange-400" />
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Finding your perfect home...
            </h3>
            <p className="max-w-sm text-[11px] text-slate-500">
              We are continuously matching new properties based on your preferences.
            </p>
            <button
              onClick={() => onNavigateTab("matched")}
              className="px-4 py-1.5 rounded-xl bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-2xs cursor-pointer"
            >
              Refresh Matches
            </button>
          </div>
        )}
      </div>

      {/* 🛠️ 5. Quick Tools & Utilities */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab("calculators")}
          className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Calculator size={16} />
          </div>
          <div className="min-w-0">
            <h5 className="font-bold text-xs text-slate-900 truncate">Rent Calculators</h5>
            <p className="text-[10px] text-slate-500 truncate">Budget & ROI estimates</p>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("documents")}
          className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-300 hover:bg-purple-50/20 transition-all cursor-pointer flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <FileText size={16} />
          </div>
          <div className="min-w-0">
            <h5 className="font-bold text-xs text-slate-900 truncate">Lease & Doc Vault</h5>
            <p className="text-[10px] text-slate-500 truncate">Agreements & inventory</p>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("payments")}
          className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CreditCard size={16} />
          </div>
          <div className="min-w-0">
            <h5 className="font-bold text-xs text-slate-900 truncate">Rent Pay & Ledger</h5>
            <p className="text-[10px] text-slate-500 truncate">Receipts & dues</p>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("maintenance")}
          className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:bg-amber-50/20 transition-all cursor-pointer flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Wrench size={16} />
          </div>
          <div className="min-w-0">
            <h5 className="font-bold text-xs text-slate-900 truncate">Repairs & Tickets</h5>
            <p className="text-[10px] text-slate-500 truncate">Log service requests</p>
          </div>
        </div>
      </div>

      {/* 📜 Full Site Visit Lifecycle History & Audit Modal */}
      {viewingDashboardVisit && (
        <VisitHistoryModal
          isOpen={!!viewingDashboardVisit}
          onClose={() => setViewingDashboardVisit(null)}
          visit={viewingDashboardVisit}
          onReschedule={() => onNavigateTab("visits")}
          onRecordOutcome={() => onNavigateTab("visits")}
        />
      )}
    </div>
  );
}