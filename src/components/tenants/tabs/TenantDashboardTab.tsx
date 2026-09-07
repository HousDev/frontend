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
  CalendarDays,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { getImageUrl } from "@/lib/helpers";
import { Tenant, MatchedProperty } from "./types";

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
}: TenantDashboardTabProps) {
  return (
    <div className="space-y-3">
      {/* Top Property Recommendations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Building2 size={20} className="text-orange-500" />
              Top Property Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Based on your preferred location and budget
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("matched")}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
          >
            View All
            <ChevronRight size={14} />
          </button>
        </div>

        {loadingProperties ? (
          <div className="flex flex-col items-center py-12 text-slate-500">
            <Loader2 className="animate-spin text-orange-500" size={28} />
            <p className="mt-3 text-sm">Loading properties...</p>
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
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-200"
                >
                  {/* Image Section */}
                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                    {img ? (
                      <img
                        src={img}
                        alt={p.title || p.society_name || "Property"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                        <Building size={28} />
                        <span className="text-[10px]">No Image</span>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Price */}
                    <div className="absolute bottom-2 left-2.5">
                      <p className="text-sm font-black text-white drop-shadow">
                        ₹{price.toLocaleString("en-IN")}
                        <span className="text-[8px] font-semibold opacity-80">/mo</span>
                      </p>
                    </div>

                    {/* Match Score */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[8px] font-bold text-white shadow-lg backdrop-blur-sm">
                      <Star size={10} className="fill-white" />
                      {p.matchScore}%
                    </div>

                    {/* Property ID */}
                    <div className="absolute top-2 right-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[8px] font-semibold text-white/90 backdrop-blur-sm">
                      #{p.id}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-2 right-2 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white backdrop-blur-sm shadow">
                      {p.status || "Available"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-2.5 space-y-1.5">
                    {/* Title */}
                    <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">
                      {p.society_name || p.title || `Property #${p.id}`}
                    </h4>

                    {/* Location */}
                    <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                      <MapPin size={10} className="text-orange-400 shrink-0" />
                      <span className="truncate">
                        {[p.location_name, p.city_name].filter(Boolean).join(", ") || "Location"}
                      </span>
                    </div>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {p.property_type_name && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-600">
                          <Bed size={8} />
                          {p.property_type_name}
                        </span>
                      )}
                      {(p.carpet_area || p.builtup_area) && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-600">
                          <Ruler size={8} />
                          {p.carpet_area || p.builtup_area} sqft
                        </span>
                      )}
                      {p.furnishing && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
                          <Sofa size={8} />
                          {p.furnishing}
                        </span>
                      )}
                    </div>

                    {/* Quick Amenities */}
                    <div className="flex flex-wrap gap-1 pt-0.5 border-t border-slate-100">
                      {[
                        { icon: Car, label: "Parking" },
                        { icon: Wifi, label: "WiFi" },
                        { icon: ShieldCheck, label: "Security" },
                        { icon: Droplets, label: "Water" },
                        { icon: ArrowUp, label: "Lift" },
                      ].slice(0, 3).map((a) => (
                        <span key={a.label} className="inline-flex items-center gap-0.5 rounded bg-slate-50 px-1.5 py-0.5 text-[7px] font-medium text-slate-600">
                          <a.icon size={8} className="text-orange-400" />
                          {a.label}
                        </span>
                      ))}
                      {p.amenities && p.amenities.length > 3 && (
                        <span className="inline-flex items-center rounded bg-slate-50 px-1.5 py-0.5 text-[7px] font-medium text-slate-600">
                          +{p.amenities.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Description (if exists) */}
                    {desc && (
                      <p className="text-[8px] text-slate-500 leading-relaxed line-clamp-1 italic">
                        {desc}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => onShareWhatsApp(p)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-600 hover:bg-green-700 py-1.5 text-[8px] font-bold text-white transition-all shadow-sm"
                      >
                        <SiWhatsapp size={11} />
                        Contact
                      </button>
                      <button
                        onClick={() => onLinkProperty(p)}
                        disabled={linkingId === p.id}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 py-1.5 text-[8px] font-bold text-white transition-all shadow-sm disabled:opacity-60"
                      >
                        {linkingId === p.id ? (
                          <Loader2 className="animate-spin" size={11} />
                        ) : (
                          <>
                            <Link2 size={11} />
                            Details
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-12 text-center">
            <Search size={36} className="text-orange-400" />
            <h3 className="mt-3 font-bold text-slate-800">
              Finding your perfect home...
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              We are continuously matching new properties based on your
              preferences.
            </p>
            <button
              onClick={() => onNavigateTab("matched")}
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
            >
              Refresh Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}