import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Bed, Bath, Square, Home } from "lucide-react";
import propertiesAPI from "@/lib/propertiesAPI";
import propertyTagsAPI from "@/lib/propertyTagsAPI";
import getTagStyle from "@/lib/tagStyles";

interface Property {
  id: number;
  slug?: string;
  title?: string;
  type?: string;
  unitType?: string;
  unit_type?: string;
  subtype?: string;
  locationNormalized?: string;
  city?: string;
  price?: number;
  bedrooms?: number | string;
  beds?: number | string;
  bathrooms?: number | string;
  baths?: number | string;
  square_feet?: string | number;
  area?: string | number;
  furnishing?: string;
  amenities?: string[];
  images?: string[];
  photos?: string[];
  possession_month?: number | string;
  possession_year?: number | string;
  raw?: any;
}

interface PublicSimilarPropertiesProps {
  properties: Property[];
  loading: boolean;
  currentPropertyId?: number;
  debug?: boolean;
}

const PublicSimilarProperties: React.FC<PublicSimilarPropertiesProps> = ({
  properties,
  loading,
  currentPropertyId,
  debug = false,
}) => {
  const [tagsMap, setTagsMap] = useState<Record<number, string[]>>({});
  const [tagsLoaded, setTagsLoaded] = useState(false);

  const n = (v: any): number | undefined => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const x = Number(v.replace(/[^\d.]/g, ""));
      return Number.isFinite(x) ? x : undefined;
    }
    return undefined;
  };

  const monthName = (m?: any): string => {
    const mm = n(m);
    if (!mm || mm < 1 || mm > 12) return "";
    return new Date(0, mm - 1).toLocaleString("en", { month: "short" });
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || !Number.isFinite(amount))
      return "Price on request";
    if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(1)} Cr`;
    if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(1)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getPropertyValue = (p: Property, key: string): any =>
    p[key as keyof Property] ?? p.raw?.[key];

  const titleFor = (p: Property): string => {
    const title = getPropertyValue(p, "title");
    if (title) return String(title);
    const parts = [
      getPropertyValue(p, "type"),
      getPropertyValue(p, "unitType") || getPropertyValue(p, "unit_type"),
      getPropertyValue(p, "subtype"),
    ].filter(Boolean);
    return parts.length ? parts.join(" ") : "Property Listing";
  };

  const displayOrDash = (v: any): string =>
    v === null || v === undefined || v === "" ? "-" : String(v);

  const getImageUrl = (p: Property): string => {
    const candidates = [
      p.photos?.[0],
      p.images?.[0],
      p.raw?.photos?.[0],
      p.raw?.images?.[0],
      p.raw?.photoUrls?.[0],
      p.raw?.media?.[0]?.url,
    ];
    for (const c of candidates) {
      if (c && typeof c === "string") {
        if (c.startsWith("/")) return `${window.location.origin}${c}`;
        return c;
      }
    }
    return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop";
  };

  const priceLabelFor = (p: Property): string => {
    const candidates = [
      p.price,
      p.raw?.price,
      p.raw?.budget,
      p.raw?.amount,
      p.raw?.listing_price,
      p.raw?.listingPrice,
    ];
    for (const c of candidates) {
      const num = n(c);
      if (num !== undefined) return formatCurrency(num);
    }
    return "Price on request";
  };

  const slugify = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 80);

  const displayed = useMemo(
    () => properties.filter((p) => p.id !== currentPropertyId).slice(0, 6),
    [properties, currentPropertyId]
  );

  useEffect(() => {
    let alive = true;
    async function loadTags() {
      if (!displayed.length) {
        setTagsMap({});
        setTagsLoaded(true);
        return;
      }
      try {
        // Single bulk request instead of N individual requests
        const bulkMap = await propertyTagsAPI.getBulk(displayed.map(p => p.id));
        if (alive) {
          setTagsMap(bulkMap);
          setTagsLoaded(true);
        }
      } catch {
        if (alive) {
          const empty: Record<number, string[]> = {};
          displayed.forEach(p => { empty[p.id] = []; });
          setTagsMap(empty);
          setTagsLoaded(true);
        }
      }
    }
    loadTags();
    return () => {
      alive = false;
    };
  }, [displayed]);


  const openProperty = (p: Property) => {
    const rawSlug = p.slug || p.raw?.slug;
    const finalSlug =
      rawSlug?.trim() || `${p.id}-${slugify(titleFor(p))}`;
    const params = new URLSearchParams(window.location.search);
    const filterToken = params.get("fltcnt") || params.get("filter_token");
    const url = filterToken
      ? `/properties/${encodeURIComponent(finalSlug)}?fltcnt=${encodeURIComponent(filterToken)}`
      : `/properties/${encodeURIComponent(finalSlug)}`;
    window.open(url, "_blank");
  };

  const PropertyCard = ({ property: p }: { property: Property }) => {
    const priceLabel = priceLabelFor(p);
    const areaNum = n(getPropertyValue(p, "square_feet") || getPropertyValue(p, "area"));
    const priceNum = n(p.price) ?? n(p.raw?.price);
    const showPpsf = priceNum && areaNum;
    const ppsf = showPpsf ? Math.round(priceNum! / areaNum!) : undefined;
    const possessionMonth = monthName(getPropertyValue(p, "possession_month"));
    const possessionYear = getPropertyValue(p, "possession_year");
    const possession = [possessionMonth, possessionYear].filter(Boolean).join(" ");
    const tags = tagsMap[p.id] || [];

    return (
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer hover:border-[#0b3856] overflow-hidden group"
        onClick={() => openProperty(p)}
      >
        <div className="relative h-32 sm:h-36">
          <img
            src={getImageUrl(p)}
            alt={titleFor(p)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!!tags.length && (
            <div className="absolute top-2 left-2  flex gap-1 flex-wrap max-w-[85%]">
              {tags.slice(0, 2).map((t, i) => {
                const tone = getTagStyle(t);
                const Icon = tone.emoji;
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ring-1 uppercase ${tone.bg} ${tone.text} ${tone.ring} text-[10px] font-medium`}
                  >
                    {typeof Icon === "string" ? (
                      <span>{Icon}</span>
                    ) : (
                      Icon && React.createElement(Icon, { size: 11 })
                    )}
                    <span className="truncate max-w-[80px]">{t}</span>
                  </span>
                );
              })}
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-[#E6761D] text-white px-2 py-1 rounded text-[11px] font-semibold">
              {priceLabel}
            </span>
          </div>
          {possession && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-white/95 text-[#0b3856] px-2 py-1 rounded text-[10px] font-medium border border-gray-300">
                Possession: {possession}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h4 className="text-sm font-semibold text-[#0b3856] mb-1 line-clamp-1 group-hover:text-[#0c3854]">
            {titleFor(p)}
          </h4>
          <div className="mb-2">
            <div className="text-[13px] font-bold text-[#0b3856]">{priceLabel}</div>
            {ppsf && <div className="text-[11px] text-gray-600 mt-0.5">₹{ppsf}/sq ft</div>}
          </div>
          <div className="flex items-start gap-1 text-gray-600 mb-2">
            <MapPin size={12} className="mt-0.5" />
            <span className="text-xs line-clamp-2">
              {displayOrDash(getPropertyValue(p, "locationNormalized") || p.city)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 ring-1 ring-gray-100 animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );

  if (!displayed.length)
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 ring-1 ring-gray-100 text-center">
        <Home size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No similar properties found</p>
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 ring-1 ring-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Home size={18} className="text-[#0b3856]" />
        <h3 className="font-bold text-[#0b3856] text-sm">Similar Properties</h3>
      </div>

      <div className="space-y-4">
        {displayed.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <div className="text-center mt-4 pt-4 border-t border-gray-100">
        <button
          className="bg-[#E6761D]  hover:bg-[#E6761D]  text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm w-full"
          onClick={() => (window.location.href = "/properties")}
        >
          View All Properties
        </button>
      </div>
    </div>
  );
};

export default PublicSimilarProperties;
