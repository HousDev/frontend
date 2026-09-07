// src/components/sellers/PropertyCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Eye,
  Users,
  Share,
  Edit,
  MoreHorizontal,
  Globe,
  Target,
  BarChart3,
  Zap,
  Flame,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

import { safe } from "@/utils/uiSafe";
import getTagStyle, { TagTone } from "@/lib/tagStyles";
import propertiesAPI from "@/lib/propertiesAPI";
import viewsAPI from "@/lib/viewAPI";
import ShareModal from "@/pages/public/ShareModal";
import { getImageUrl } from "@/lib/helpers";

/* ---------------- Helpers ---------------- */

const DEFAULT_TRACKING_PARAM_KEY = "fltcnt";
const STORAGE_KEY = "re_filter_token";

const getOrigin = (fallback?: string) => {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return fallback || "https://resaleexpert.in";
};

const getParam = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get(key);
  } catch {
    return null;
  }
};

const readTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const slugify = (s: any) =>
  String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const resolveSlugForProperty = (p: any): string | undefined => {
  if (p?.slug) return String(p.slug);
  const id = p?.id ?? p?.property_id ?? p?._id;
  if (!id) return undefined;

  const unit = p?.unit_type ?? p?.unitType;
  const subtype = p?.property_subtype_name ?? p?.propertySubtype;
  const loc = p?.location_name ?? p?.location ?? p?.city ?? p?.area;

  const bits = [String(id), unit, subtype, loc]
    .filter(Boolean)
    .map(slugify)
    .filter(Boolean);

  return bits.length ? bits.join("-") : String(id);
};

const formatRepId = (id: any) => {
  const n = Number(id);
  if (!Number.isFinite(n)) return "";
  return `REX00${n}`;
};

const buildPropertyUrl = ({
  url,
  propertyId,
  slug,
  trackingToken,
  absoluteBase,
  trackingParamKey = DEFAULT_TRACKING_PARAM_KEY,
}: {
  url?: string;
  propertyId?: number | string;
  slug?: string;
  trackingToken?: string | null;
  absoluteBase?: string;
  trackingParamKey?: string;
}) => {
  if (url) {
    try {
      if (trackingToken) {
        const u = new URL(url);
        u.searchParams.set(trackingParamKey, trackingToken);
        return u.toString();
      }
      return url;
    } catch {
      return url;
    }
  }

  const origin = getOrigin(absoluteBase);
  let path = "";

  if (slug) {
    const clean = String(slug).replace(/^\//, "");
    path = clean.startsWith("properties/") ? `/${clean}` : `/properties/${clean}`;
  } else if (propertyId) {
    path = `/properties/${propertyId}`;
  } else if (typeof window !== "undefined") {
    try {
      const u = new URL(window.location.href);
      if (trackingToken) u.searchParams.set(trackingParamKey, trackingToken);
      return u.toString();
    } catch {
      return window.location.href;
    }
  } else {
    return origin;
  }

  const urlObj = new URL(origin + path);
  if (trackingToken) urlObj.searchParams.set(trackingParamKey, trackingToken);
  return urlObj.toString();
};

const formatCurrency = (amount?: number) => {
  const n = Number(amount ?? 0);
  if (!n) return "-";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const toNumericId = (id: any): number | null => {
  if (id == null) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

const tryParseJson = (s: string): any => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

const normalizeAmenities = (p: any): string[] => {
  const buckets: any[] = [];

  if (p?.amenities) buckets.push(p.amenities);
  if (p?.features) buckets.push(p.features);
  if (p?.amenityList) buckets.push(p.amenityList);
  if (p?.property_amenities) buckets.push(p.property_amenities);
  if (p?.raw?.amenities) buckets.push(p.raw.amenities);
  if (p?.raw?.features) buckets.push(p.raw.features);
  if (p?.property_details?.amenities) buckets.push(p.property_details.amenities);
  if (p?.meta?.amenities) buckets.push(p.meta.amenities);
  if (p?.details?.amenities) buckets.push(p.details.amenities);

  const out: string[] = [];

  for (const b of buckets) {
    if (b == null) continue;

    if (typeof b === "string" && /^[\[\{].*[\]\}]$/.test(b.trim())) {
      const parsed = tryParseJson(b.trim());
      if (parsed) {
        buckets.push(parsed);
        continue;
      }
    }

    if (Array.isArray(b)) {
      for (const item of b) {
        if (item == null) continue;
        if (typeof item === "string" || typeof item === "number") {
          const v = String(item).trim();
          if (v && !v.toLowerCase().includes("tag") && !v.toLowerCase().includes("label")) {
            out.push(v);
          }
        } else if (typeof item === "object") {
          const name = String(
            (item as any).name ??
              (item as any).title ??
              (item as any).label ??
              (item as any).value ??
              (item as any).amenity ??
              ""
          ).trim();
          if (name && !name.toLowerCase().includes("tag")) out.push(name);
        }
      }
    } else if (typeof b === "string" || typeof b === "number") {
      String(b)
        .split(/[,|/]+/g)
        .map((x) => x.trim())
        .filter(Boolean)
        .filter((x) => !x.toLowerCase().includes("tag"))
        .forEach((x) => out.push(x));
    } else if (typeof b === "object" && !Array.isArray(b)) {
      for (const [k, v] of Object.entries(b)) {
        const enabled =
          v === true ||
          v === 1 ||
          v === "1" ||
          (typeof v === "string" && v.toLowerCase() === "true");
        if (enabled && !k.toLowerCase().includes("tag")) {
          const formattedName = k
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/\s+/g, " ")
            .trim();
          out.push(formattedName);
        }
      }
    }
  }

  const seen = new Set<string>();
  return out
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((s) => {
      const key = s.toLowerCase();
      const skipWords = ["tag", "label", "category", "type", "id"];
      if (skipWords.some((word) => key.includes(word))) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
};

/* ---------------- Theme Colors ---------------- */
// ESALE brand tokens — use these throughout instead of hardcoded Tailwind colors
const NAVY = "#0f2b3d";
const ORANGE = "#e67e22";
const NAVY_LIGHT = "#1a3f58";
const ORANGE_LIGHT = "#f39c12";

/* ---------------- UI Bits ---------------- */

const TagBadge: React.FC<{ label: string }> = ({ label }) => {
  const tone: TagTone = getTagStyle(label);
  const maybeIcon = tone.emoji;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] leading-5 ring-1 font-medium ${tone.bg} ${tone.text} ${tone.ring}`}
      title={label}
    >
      {typeof maybeIcon === "string" ? (
        <span aria-hidden>{maybeIcon}</span>
      ) : maybeIcon ? (
        React.createElement(maybeIcon, { size: 12, className: "opacity-95" })
      ) : null}
      <span>{label}</span>
    </span>
  );
};

const AmenityPill: React.FC<{ name: string }> = ({ name }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-default"
    style={{
      background: "rgba(230,126,34,0.08)",
      color: ORANGE,
      borderColor: "rgba(230,126,34,0.25)",
    }}
    title={name}
  >
    {name}
  </span>
);

/* Metric Chip */
const MetricChip: React.FC<{
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  bg: string;
}> = ({ icon, value, label, color, bg }) => (
  <div
    className="flex flex-col items-center justify-center gap-0.5 rounded-lg py-1 px-0.5"
    style={{ background: bg }}
  >
    <div className="flex items-center gap-1" style={{ color }}>
      {icon}
      <span className="font-bold text-sm">{value}</span>
    </div>
    <span className="text-[8px] font-medium uppercase tracking-wider" style={{ color }}>
      {label}
    </span>
  </div>
);

/* ---------------- Main Card ---------------- */

const PropertyCard: React.FC<{ property: any }> = ({ property }) => {
  // Image
  const imgSrc =
    getImageUrl(
      property?.photos?.[0] ??
      property?.images?.[0] ??
      property?.photoUrls?.[0]
    ) || "/property.png";

  // Areas
  const carpet_area = Number(
    property?.carpet_area ?? property?.carpetArea ?? property?.square_feet ?? 0
  );
  const builtup_area = Number(
    property?.builtup_area ?? property?.builtupArea ?? property?.area ?? 0
  );

  // Price & rate
  const price = Number(
    property?.price ?? property?.budget ?? property?.listing_price ?? 0
  );
  const rate =
    carpet_area && price
      ? `₹${Math.round(price / carpet_area).toLocaleString()}/sq ft`
      : "-";

  // Metrics
  const visits = Number(property?.visits ?? property?.views ?? 0);
  const inquiries = Number(property?.inquiries ?? 0);
  const hotLeads = Number(property?.hotLeads ?? property?.hot_leads ?? 0);

  // States / labels
  const availability = safe(
    property?.availability ?? property?.status ?? property?.property_status ?? "Available"
  );
  const isPublic = !!(property?.isPublic ?? property?.public ?? true);
  const isHot = !!(property?.isHot ?? property?.hot ?? property?.featured ?? false);
  const hasMandate = !!(property?.mandateSigned ?? property?.mandate ?? false);

  const _publicViews = Number(property?.publicViews ?? property?.views);
  const fallbackPublicViews =
    Number.isFinite(_publicViews) && _publicViews >= 0 ? _publicViews : 0;

  const lastActivity = safe(
    property?.lastActivity ??
      property?.updated_at ??
      property?.created_at ??
      property?.last_updated,
    ""
  );
  const lastActivityDisplay = formatDate(lastActivity);

  const [showActions, setShowActions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const trackingToken = useMemo(
    () => getParam(DEFAULT_TRACKING_PARAM_KEY) || readTokenFromStorage() || undefined,
    []
  );

  const numericId = useMemo(
    () => toNumericId(property?.id ?? property?.property_id ?? property?._id),
    [property?.id, property?.property_id, property?._id]
  );
  const repId = useMemo(() => (numericId ? formatRepId(numericId) : ""), [numericId]);

  const slugResolved = useMemo(
    () => resolveSlugForProperty({ ...property, id: numericId ?? property?.id }),
    [property, numericId]
  );

  const shareUrl = useMemo(
    () =>
      buildPropertyUrl({
        url: property?.share_url,
        propertyId: numericId ?? undefined,
        slug: slugResolved,
        trackingToken,
      }),
    [numericId, slugResolved, property?.share_url, trackingToken]
  );

  const [views, setViews] = useState<{ total: number; unique: number }>({
    total: fallbackPublicViews || 0,
    unique: 0,
  });

  const amenities = useMemo(() => normalizeAmenities(property), [property]);

  useEffect(() => {
    if (amenities.length > 0) {
      console.debug("[PropertyCard] Amenities Data:", {
        propertyId: numericId ?? property?._id ?? property?.id ?? "N/A",
        totalAmenities: amenities.length,
        amenities,
        source: "normalized",
      });
    }
  }, [amenities, numericId, property?._id, property?.id]);

  useEffect(() => {
    let alive = true;
    async function loadViews() {
      if (!numericId) return;
      try {
        const totalRes = await viewsAPI.getByProperty(numericId, false);
        const uniqueRes = await viewsAPI.getByProperty(numericId, true);
        if (!alive) return;
        const total =
          Number(totalRes?.total_views) ||
          Number(totalRes?.data?.total_views) ||
          fallbackPublicViews ||
          0;
        const unique =
          Number(uniqueRes?.unique_views) ||
          Number(uniqueRes?.data?.unique_views) ||
          0;
        setViews({
          total: Number.isFinite(total) ? total : 0,
          unique: Number.isFinite(unique) ? unique : 0,
        });
      } catch {
        if (!alive) return;
        setViews((prev) => ({
          total: prev.total || fallbackPublicViews || 0,
          unique: prev.unique || 0,
        }));
      }
    }
    loadViews();
    return () => { alive = false; };
  }, [numericId, fallbackPublicViews]);

  const handleQuickAction = async (action: string) => {
    if (action === "share") {
      setShowShareModal(true);
      const id = numericId ?? "0";
      propertiesAPI
        .sendPropertyEvent(id, "share", "share_copy_from_card", { url: shareUrl }, {
          filterToken: trackingToken,
          filterParamKey: "filter_token",
          slug: slugResolved,
        })
        .catch(() => {});
    } else if (action === "analytics") {
      alert("Open property analytics.");
    } else if (action === "edit") {
      alert("Edit property (hook into your flow).");
    } else if (action === "boost") {
      alert("Property boost activated!");
    }
  };

  const openDetails = async () => {
    const id = numericId ?? "0";
    propertiesAPI
      .sendPropertyEvent(id, "share", "open_details_from_card", { url: shareUrl }, {
        filterToken: trackingToken,
        filterParamKey: "filter_token",
        slug: slugResolved,
      })
      .catch(() => {});
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const progressVal = Math.max(0, Math.min(100, Number(property?.stageProgress ?? 0)));

  return (
    <>
      {/* Card wrapper */}
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          background: "#fff",
          border: "1.5px solid #e0e7ef",
          boxShadow: "0 2px 12px rgba(15,43,61,0.09)",
          maxWidth: "340px",
          width: "100%",
        }}
      >
        {/* ─── Image Section ─── */}
        <div className="relative" style={{ height: "150px" }}>
          <img
            src={imgSrc}
            alt={String(safe(property?.title ?? property?.name ?? "Property"))}
            onError={(e) => { e.currentTarget.src = '/property.png'; }}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Dark gradient overlay for badge readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(15,43,61,0.45) 0%, transparent 50%, rgba(15,43,61,0.55) 100%)",
            }}
          />

          {/* Top-left status badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
              style={{ background: ORANGE, color: "#fff" }}
            >
              {availability}
            </span>
            {isPublic && (
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.35)" }}
              >
                PUBLIC
              </span>
            )}
            {isHot && (
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide inline-flex items-center gap-1"
                style={{ background: "#e74c3c", color: "#fff" }}
              >
                <Flame size={11} /> HOT
              </span>
            )}
          </div>

          {/* Mandate badge — bottom left */}
          {hasMandate && (
            <div className="absolute bottom-3 left-3">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide"
                style={{ background: "#27ae60", color: "#fff" }}
              >
                ✓ Mandate Signed
              </span>
            </div>
          )}

          {/* REX ID — bottom right of image */}
          {repId && (
            <div className="absolute bottom-3 right-3">
              <span
                className="px-2 py-1 rounded-md text-[11px] font-bold tracking-wide"
                style={{
                  background: NAVY,
                  color: "#fff",
                  opacity: 0.92,
                }}
              >
                {repId}
              </span>
            </div>
          )}

          {/* ⋯ Actions menu — top right */}
          <div className="absolute top-3 right-3">
            <div className="relative">
              <button
                onClick={() => setShowActions((v) => !v)}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.6)",
                }}
                aria-label="Property actions"
              >
                <MoreHorizontal size={15} style={{ color: NAVY }} />
              </button>

              {showActions && (
                <div
                  className="absolute right-0 top-10 z-10 w-48 rounded-xl overflow-hidden"
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e8edf2",
                    boxShadow: "0 8px 24px rgba(15,43,61,0.15)",
                  }}
                >
                  {[
                    { action: "share", icon: <Share size={13} />, label: "Share Property", danger: false },
                    { action: "edit", icon: <Edit size={13} />, label: "Edit Details", danger: false },
                    { action: "analytics", icon: <BarChart3 size={13} />, label: "View Analytics", danger: false },
                    { action: "boost", icon: <Zap size={13} />, label: "Boost Listing", danger: true },
                  ].map(({ action, icon, label, danger }) => (
                    <button
                      key={action}
                      onClick={() => { handleQuickAction(action); setShowActions(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50"
                      style={{ color: danger ? ORANGE : NAVY }}
                    >
                      <span style={{ color: danger ? ORANGE : "#64748b" }}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div className="flex flex-col flex-1 p-3 gap-2">

          {/* Title + Price row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-[13px] leading-snug truncate"
                style={{ color: NAVY }}
              >
                {[
                  safe(property?.furnishing),
                  safe(property?.unit_type ?? property?.unitType),
                  safe(property?.property_subtype_name ?? property?.subtype),
                  safe(property?.location_name ?? property?.location),
                ]
                  .filter((v) => v !== "-" && v !== "")
                  .join("  ")}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />
                <span className="text-[12px] text-gray-500 truncate">
                  {safe(property?.address ?? property?.location)}
                </span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div
                className="text-[16px] font-extrabold leading-tight"
                style={{ color: ORANGE }}
              >
                {formatCurrency(price)}
              </div>
              <div className="text-[10px] text-gray-400 font-medium mt-0.5">{rate}</div>
            </div>
          </div>

          {/* Tags */}
          {Array.isArray(property?.tags) && property.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.tags.map((t: string, i: number) => (
                <TagBadge key={`${t}-${i}`} label={t} />
              ))}
            </div>
          )}

          {/* Spec chips */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Type", value: safe(property?.unit_type ?? property?.unitType) },
              { label: "Carpet", value: carpet_area ? `${carpet_area.toLocaleString()} sqft` : "-" },
              { label: "Builtup", value: builtup_area ? `${builtup_area.toLocaleString()} sqft` : "-" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col rounded-lg px-2 py-1"
                style={{ background: "rgba(15,43,61,0.04)" }}
              >
                <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: "#94a3b8" }}>
                  {label}
                </span>
                <span className="text-[12px] font-bold mt-0.5 truncate" style={{ color: NAVY }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Performance metrics */}
          <div className="grid grid-cols-3 gap-2">
            <MetricChip
              icon={<Eye size={10} />}
              value={visits}
              label="Visits"
              color="#1e6fba"
              bg="rgba(30,111,186,0.08)"
            />
            <MetricChip
              icon={<Users size={10} />}
              value={inquiries}
              label="Inquiries"
              color="#16a34a"
              bg="rgba(22,163,74,0.08)"
            />
            <MetricChip
              icon={<Target size={10} />}
              value={hotLeads}
              label="Hot Leads"
              color="#dc2626"
              bg="rgba(220,38,38,0.08)"
            />
          </div>

          {/* Selling progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: NAVY }}>
                Selling Progress
              </span>
              <span className="text-[11px] font-bold" style={{ color: ORANGE }}>
                {progressVal}%
              </span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: "#e8edf2" }}>
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${progressVal}%`,
                  background: `linear-gradient(90deg, ${NAVY} 0%, ${ORANGE} 100%)`,
                }}
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: NAVY }}>
                Amenities
              </span>
              {amenities.length > 0 && (
                <span className="text-[10px] text-gray-400">
                  {amenities.length} listed
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {amenities.length > 0 ? (
                <>
                  {amenities.slice(0, 8).map((amenity, i) => (
                    <AmenityPill key={`${amenity}-${i}`} name={amenity} />
                  ))}
                  {amenities.length > 8 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium cursor-help"
                      style={{
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                      }}
                      title={amenities.slice(8).join(", ")}
                    >
                      +{amenities.length - 8} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[12px] text-gray-400 italic">No amenities listed</span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#f1f5f9" }} />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={openDetails}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: NAVY, color: "#fff" }}
            >
              View Details
              <ChevronRight size={12} />
            </button>

            <button
              onClick={() => handleQuickAction("share")}
              className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "rgba(230,126,34,0.1)", color: ORANGE, border: `1.5px solid rgba(230,126,34,0.25)` }}
              title="Share Property"
            >
              <Share size={13} />
            </button>

            <button
              onClick={() => handleQuickAction("analytics")}
              className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "rgba(15,43,61,0.07)", color: NAVY, border: `1.5px solid rgba(15,43,61,0.12)` }}
              title="View Analytics"
            >
              <BarChart3 size={13} />
            </button>
          </div>

          {/* Views + last activity footer */}
          <div
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
            style={{ background: "rgba(15,43,61,0.04)" }}
          >
            <div className="flex items-center gap-1.5">
              <Globe size={11} style={{ color: ORANGE }} />
              <span className="text-[10px] font-medium" style={{ color: NAVY }}>
                {views.total} public views
                {views.unique ? ` · ${views.unique} unique` : ""}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {lastActivityDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          url={shareUrl}
          propertyId={numericId ?? undefined}
          slug={slugResolved}
          title={[
            safe(property?.unit_type ?? property?.unitType),
            safe(property?.property_subtype_name ?? property?.subtype),
            safe(property?.location_name ?? property?.location),
          ]
            .filter((v) => v !== "-" && v !== "")
            .join(" • ")}
          description={safe(property?.address ?? property?.description)}
          image={imgSrc}
        />
      )}
    </>
  );
};

export default PropertyCard;