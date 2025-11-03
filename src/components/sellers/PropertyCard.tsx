// src/components/sellers/PropertyCard.tsx
import React, { CSSProperties, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import { safe } from "@/utils/uiSafe";
import getTagStyle, { TagTone } from "@/lib/tagStyles";
import propertiesAPI from "@/lib/propertiesAPI";
import viewsAPI from "@/lib/viewAPI";
import ShareModal from "@/pages/public/ShareModal";

/* ---------------- Helpers ---------------- */

const DEFAULT_TRACKING_PARAM_KEY = "fltcnt";
const STORAGE_KEY = "re_filter_token";

const getOrigin = (fallback?: string) => {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return fallback || "https://investordeal.in";
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

/** Make a URL-safe slug from any string */
const slugify = (s: any) =>
  String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/** Build a reliable slug when property.slug is missing */
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

  // e.g., "57-3bhk-apartment-andheri"
  return bits.length ? bits.join("-") : String(id);
};

/** Format REP id exactly as requested: REP00{propertyId} */
const formatRepId = (id: any) => {
  const n = Number(id);
  if (!Number.isFinite(n)) return "";
  return `REP00${n}`;
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

/** Try to safely JSON-parse a string (helps when backend sends JSON text). */
const tryParseJson = (s: string): any => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

/** Enhanced amenities normalization with better property structure support */
const normalizeAmenities = (p: any): string[] => {
  const buckets: any[] = [];

  // Check all possible amenity locations in property object
  if (p?.amenities) buckets.push(p.amenities);
  if (p?.features) buckets.push(p.features);
  if (p?.amenityList) buckets.push(p.amenityList);
  if (p?.property_amenities) buckets.push(p.property_amenities);
  
  // Check nested structures
  if (p?.raw?.amenities) buckets.push(p.raw.amenities);
  if (p?.raw?.features) buckets.push(p.raw.features);
  if (p?.property_details?.amenities) buckets.push(p.property_details.amenities);
  if (p?.meta?.amenities) buckets.push(p.meta.amenities);
  if (p?.details?.amenities) buckets.push(p.details.amenities);

  const out: string[] = [];

  for (const b of buckets) {
    if (b == null) continue;

    // Handle JSON strings
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
          if (v && !v.toLowerCase().includes('tag') && !v.toLowerCase().includes('label')) {
            out.push(v);
          }
        } else if (typeof item === "object") {
          // Handle object items with common keys
          const name = String(
            (item as any).name ??
            (item as any).title ??
            (item as any).label ??
            (item as any).value ??
            (item as any).amenity ??
            ""
          ).trim();
          
          if (name && !name.toLowerCase().includes('tag')) {
            out.push(name);
          }
        }
      }
    } else if (typeof b === "string" || typeof b === "number") {
      // Handle comma/pipe/slash separated strings
      String(b)
        .split(/[,|/]+/g)
        .map((x) => x.trim())
        .filter(Boolean)
        .filter(x => !x.toLowerCase().includes('tag'))
        .forEach((x) => out.push(x));
    } else if (typeof b === "object" && !Array.isArray(b)) {
      // Handle object with boolean values (feature flags)
      for (const [k, v] of Object.entries(b)) {
        const enabled =
          v === true ||
          v === 1 ||
          v === "1" ||
          (typeof v === "string" && v.toLowerCase() === "true");
        
        if (enabled && !k.toLowerCase().includes('tag')) {
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

  // Filter, clean, and deduplicate
  const seen = new Set<string>();
  return out
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((s) => {
      const key = s.toLowerCase();
      
      // Skip common non-amenity items
      const skipWords = ['tag', 'label', 'category', 'type', 'id'];
      if (skipWords.some(word => key.includes(word))) return false;
      
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b)); // Sort alphabetically for consistent display
};

/* ---------------- UI Bits ---------------- */

const TagBadge: React.FC<{ label: string }> = ({ label }) => {
  const tone: TagTone = getTagStyle(label);
  const maybeIcon = tone.emoji;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] leading-5 ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
      title={label}
    >
      {typeof maybeIcon === "string" ? (
        <span aria-hidden>{maybeIcon}</span>
      ) : maybeIcon ? (
        React.createElement(maybeIcon, { size: 12, className: "opacity-95" })
      ) : null}
      <span className="font-medium">{label}</span>
    </span>
  );
};

/* Amenity Pill Component */
const AmenityPill: React.FC<{ name: string }> = ({ name }) => {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors cursor-default"
      title={name}
    >
      {name}
    </span>
  );
};

/* ---------------- Main Card ---------------- */

const PropertyCard: React.FC<{ property: any }> = ({ property }) => {
  // Image
  const imgSrc =
    property?.photos?.[0] ??
    property?.images?.[0] ??
    property?.photoUrls?.[0] ??
    "https://dummyimage.com/800x450/e5e7eb/9ca3af.png&text=No+Image";

  // Areas
  const carpet_area = Number(property?.carpet_area ?? property?.carpetArea ?? property?.square_feet ?? 0);
  const builtup_area = Number(property?.builtup_area ?? property?.builtupArea ?? property?.area ?? 0);

  // Price & rate
  const price = Number(property?.price ?? property?.budget ?? property?.listing_price ?? 0);
  const rate = carpet_area && price
    ? `₹${Math.round(price / carpet_area).toLocaleString()}/sq ft`
    : "-";

  // Metrics
  const visits = Number(property?.visits ?? property?.views ?? 0);
  const inquiries = Number(property?.inquiries ?? 0);
  const hotLeads = Number(property?.hotLeads ?? property?.hot_leads ?? 0);

  // States / labels
  const availability = safe(property?.availability ?? property?.status ?? property?.property_status ?? "Available");
  const isPublic = !!(property?.isPublic ?? property?.public ?? true);
  const isHot = !!(property?.isHot ?? property?.hot ?? property?.featured ?? false);
  const hasMandate = !!(property?.mandateSigned ?? property?.mandate ?? false);

  // Fallback public views
  const _publicViews = Number(property?.publicViews ?? property?.views);
  const fallbackPublicViews =
    Number.isFinite(_publicViews) && _publicViews >= 0 ? _publicViews : 0;

  // Last activity
  const lastActivity = safe(
    property?.lastActivity ?? property?.updated_at ?? property?.created_at ?? property?.last_updated,
    ""
  );
  const lastActivityDisplay = formatDate(lastActivity);

  // Local states
  const [showActions, setShowActions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Tracking token
  const trackingToken = useMemo(
    () => getParam(DEFAULT_TRACKING_PARAM_KEY) || readTokenFromStorage() || undefined,
    []
  );

  // Numeric ID + REP id + slug (resolved)
  const numericId = useMemo(
    () => toNumericId(property?.id ?? property?.property_id ?? property?._id),
    [property?.id, property?.property_id, property?._id]
  );
  const repId = useMemo(() => (numericId ? formatRepId(numericId) : ""), [numericId]);

  const slugResolved = useMemo(
    () => resolveSlugForProperty({ ...property, id: numericId ?? property?.id }),
    [property, numericId]
  );

  // Share URL (use resolved slug)
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

  // Views state
  const [views, setViews] = useState<{ total: number; unique: number }>({
    total: fallbackPublicViews || 0,
    unique: 0,
  });

  // ✅ Enhanced amenities normalization
  const amenities = useMemo(() => normalizeAmenities(property), [property]);

  // 🔎 Debug: console amenities data
  useEffect(() => {
    if (amenities.length > 0) {
      console.debug("[PropertyCard] Amenities Data:", {
        propertyId: numericId ?? property?._id ?? property?.id ?? "N/A",
        totalAmenities: amenities.length,
        amenities: amenities,
        source: 'normalized'
      });
    }
  }, [amenities, numericId, property?._id, property?.id]);

  // Fetch views
  useEffect(() => {
    let alive = true;

    async function loadViews() {
      if (!numericId) return;
      try {
        const totalRes = await viewsAPI.getByProperty(numericId, false);
        const uniqueRes = await viewsAPI.getByProperty(numericId, true);
        if (!alive) return;

        const total =
          (Number(totalRes?.total_views) ||
            Number(totalRes?.data?.total_views) ||
            fallbackPublicViews ||
            0);

        const unique =
          (Number(uniqueRes?.unique_views) ||
            Number(uniqueRes?.data?.unique_views) ||
            0);

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
    return () => {
      alive = false;
    };
  }, [numericId, fallbackPublicViews]);

  // Actions
  const handleQuickAction = async (action: string) => {
    if (action === "share") {
      setShowShareModal(true);
      const id = numericId ?? "0";
      propertiesAPI
        .sendPropertyEvent(
          id,
          "share",
          "share_copy_from_card",
          { url: shareUrl },
          { filterToken: trackingToken, filterParamKey: "filter_token", slug: slugResolved }
        )
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
      .sendPropertyEvent(
        id,
        "share",
        "open_details_from_card",
        { url: shareUrl },
        { filterToken: trackingToken, filterParamKey: "filter_token", slug: slugResolved }
      )
      .catch(() => {});
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
        {/* Image + badges/menu */}
        <div className="relative">
          <img
            src={imgSrc}
            alt={String(safe(property?.title ?? property?.name ?? "Property"))}
            className="w-full h-48 object-cover"
            loading="lazy"
          />

          {/* top badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {availability}
            </span>

            {isPublic && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                PUBLIC
              </span>
            )}

            {isHot && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 inline-flex items-center gap-1">
                <Flame size={12} /> HOT
              </span>
            )}
          </div>

          {hasMandate && (
            <div className="absolute bottom-4 left-3 ">
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-sm">
                Mandate Signed
              </span>
            </div>
          )}

          <div className="absolute top-4 right-4">
            <div className="relative">
              <button
                onClick={() => setShowActions((v) => !v)}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                aria-label="Property actions"
              >
                <MoreHorizontal size={16} />
              </button>
              {showActions && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        handleQuickAction("share");
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Share size={14} />
                      <span>Share Property</span>
                    </button>
                    <button
                      onClick={() => {
                        handleQuickAction("edit");
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Edit size={14} />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => {
                        handleQuickAction("analytics");
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <BarChart3 size={14} />
                      <span>View Analytics</span>
                    </button>
                    <button
                      onClick={() => {
                        handleQuickAction("boost");
                        setShowActions(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-100 rounded"
                    >
                      <Zap size={14} />
                      <span>Boost Listing</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 pt-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {[
                  safe(property?.furnishing),
                  safe(property?.unit_type ?? property?.unitType),
                  safe(property?.property_subtype_name ?? property?.subtype),
                  safe(property?.location_name ?? property?.location),
                ]
                  .filter((v) => v !== "-" && v !== "")
                  .join("  ")}
              </h3>

              {/* ID + Slug line */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {repId && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200">
                    {repId}
                  </span>
                )}
                
              </div>

              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <MapPin size={14} />
                <span className="text-sm">{safe(property?.address ?? property?.location)}</span>
              </div>

              {/* Tags stay independent from amenities */}
              {Array.isArray(property?.tags) && property.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {property.tags.map((t: string, i: number) => (
                    <TagBadge key={`${t}-${i}`} label={t} />
                  ))}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(price)}
              </div>
              <div className="text-sm text-gray-500">{rate}</div>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-50 rounded-md p-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Type</div>
              <div className="font-medium text-gray-900">
                {safe(property?.unit_type ?? property?.unitType)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Carpet Area</div>
              <div className="font-medium text-gray-900">
                {carpet_area ? `${carpet_area.toLocaleString()} sq ft` : "-"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Builtup Area</div>
              <div className="font-medium text-gray-900">
                {builtup_area ? `${builtup_area.toLocaleString()} sq ft` : "-"}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                <Eye size={14} />
                <span className="font-bold">{visits}</span>
              </div>
              <div className="text-xs text-gray-500">Visits</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                <Users size={14} />
                <span className="font-bold">{inquiries}</span>
              </div>
              <div className="text-xs text-gray-500">Inquiries</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
                <Target size={14} />
                <span className="font-bold">{hotLeads}</span>
              </div>
              <div className="text-xs text-gray-500">Hot Leads</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Selling Progress</span>
              <span className="text-sm font-bold text-blue-600">
                {Number(property?.stageProgress ?? 0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, Number(property?.stageProgress ?? 0)))}%`,
                } as CSSProperties}
              />
            </div>
          </div>

          {/* Enhanced Amenities Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Amenities</div>
              {amenities.length > 0 && (
                <span className="text-xs text-gray-400">
                  {amenities.length} amenit{amenities.length === 1 ? 'y' : 'ies'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {amenities.length > 0 ? (
                <>
                  {amenities.slice(0, 8).map((amenity, i) => (
                    <AmenityPill key={`${amenity}-${i}`} name={amenity} />
                  ))}
                  {amenities.length > 8 && (
                    <span 
                      className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200 cursor-help"
                      title={`${amenities.slice(8).join(', ')}`}
                    >
                      +{amenities.length - 8} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-500 italic">No amenities listed</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={openDetails}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              title="Open property details"
            >
              View Details
            </button>

            <button
              onClick={() => handleQuickAction("share")}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              title="Share Property"
            >
              <Share size={16} />
            </button>

            <button
              onClick={() => handleQuickAction("analytics")}
              className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
              title="View Analytics"
            >
              <BarChart3 size={16} />
            </button>
          </div>

          {/* Views + Last activity */}
          <div className="mt-3">
            <div className="rounded-lg bg-gray-50 text-gray-700 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-purple-600" />
                <span className="text-sm">
                  {views.total} public views{views.unique ?`` : ''}
                </span>
              </div>
              <div className="text-xs text-gray-500">Last activity: {lastActivityDisplay}</div>
            </div>
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