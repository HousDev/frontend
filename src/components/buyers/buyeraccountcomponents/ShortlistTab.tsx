import React, { useState, useEffect } from 'react';
import { Bookmark, Building, MapPin, Phone, Star, Share, Bot } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { buyerSavedAPI, BuyerSavedWithProperty } from '@/lib/buyerSavedPropertiesAPI';
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import { getTagStyle } from '@/lib/tagStyles';

interface ShortlistTabProps {
  buyer: any;
}

// Utility functions
const toArray = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      if (Array.isArray(j)) return j.filter(Boolean).map(String);
    } catch { }
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const firstImage = (p: any): string | null => {
  const cands: Array<string | string[] | undefined> = [
    p?.thumbnail_url,
    p?.thumbnailUrl,
    p?.coverImage,
    p?.image,
    p?.images,
    p?.photo,
    p?.photoUrl,
    p?.photoUrls,
    p?.photos,
  ];
  for (const c of cands) {
    if (!c) continue;
    if (typeof c === "string") {
      const arr = toArray(c);
      if (arr.length) return arr[0];
      if (/^https?:\/\//i.test(c) || c.startsWith("/")) return c;
    } else if (Array.isArray(c)) {
      const arr = c.filter(Boolean).map(String);
      if (arr.length) return arr[0];
    }
  }
  return null;
};

const pickComposedTitle = (p: any): string => {
  const type = (p?.property_type_name ?? p?.property_type ?? p?.type ?? "")
    .toString()
    .trim();
  const unitType = (p?.unit_type_name ?? p?.unit_type ?? p?.unitType ?? "")
    .toString()
    .trim();
  const subtype = (p?.property_subtype_name ?? p?.property_subtype ?? p?.subtype ?? "")
    .toString()
    .trim();
  const composed = [type, unitType, subtype].filter(Boolean).join(" ");
  return composed || "Property";
};

const pickLocation = (p: any): string => {
  const locality =
    p?.location_name ??
    p?.location ??
    p?.area ??
    p?.neighbourhood ??
    p?.neighborhood ??
    "";
  const city = p?.city_name ?? p?.city ?? "";
  const state = p?.state ?? "";
  return [locality, city, state].filter(Boolean).slice(0, 2).join(", ") || "Unknown location";
};

const pickPositiveNumber = (...vals: any[]): number | null => {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
};

const pickPrice = (p: any): number | null => {
  return pickPositiveNumber(p?.final_price, p?.price, p?.expected_price, p?.budget);
};

const formatCurrencyShortlist = (amount?: number | null) => {
  const v = Number(amount ?? 0);
  if (!Number.isFinite(v) || v <= 0) return "N/A";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

const areaInSqft = (p: any): number | undefined => {
  const carpet = Number(p?.carpet_area) || 0;
  const builtup = Number(p?.builtup_area) || 0;
  const superBuiltup = Number(p?.super_builtup_area) || 0;
  return carpet || builtup || superBuiltup || (Number(p?.area) || undefined);
};

const pricePerSqft = (price?: number | null, sqft?: number) => {
  if (!price || !sqft) return "-";
  const v = Math.round(price / sqft);
  return `₹${v.toLocaleString("en-IN")}`;
};

/* ---------------- Tiny Tag Pills ---------------- */
const PropertyTagsShortlist = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;
  const displayTags = tags.slice(0, 2);
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {displayTags.map((tag, index) => {
        const style = getTagStyle(tag);
        const EmojiComponent =
          typeof style.emoji === "string"
            ? () => <span className="text-xs mr-1 uppercase" aria-hidden="true">{style.emoji as string}</span>
            : (style.emoji as any);

        return (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase ${style.bg} ${style.text} ring-1 ${style.ring} transition-all duration-200`}
          >
            {style.emoji &&
              (typeof style.emoji === "string" ? (
                <EmojiComponent />
              ) : (
                <EmojiComponent size={10} className="mr-1" />
              ))}
            {tag}
          </span>
        );
      })}
      {tags.length > 2 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{tags.length - 2}
        </span>
      )}
    </div>
  );
};

const ShortlistTab: React.FC<ShortlistTabProps> = ({ buyer }) => {
  const [savedProps, setSavedProps] = useState<BuyerSavedWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!buyer?.id) return;

    const load = async () => {
      try {
        setLoading(true);

        // 1) fetch saved list
        const res = await buyerSavedAPI.listByBuyer(buyer.id, { includeProperty: true });
        const rows: BuyerSavedWithProperty[] = Array.isArray(res)
          ? (res as any)
          : Array.isArray((res as any)?.data)
            ? ((res as any).data as any)
            : [];

        // 2) Determine which rows need tags from the API (those without inline tags)
        const needTagIds = rows
          .map((row) => {
            const p: any = row.property ?? {};
            if (Array.isArray(p?.tags) && p.tags.length > 0) return null;
            if (typeof p?.tags === "string" && p.tags.trim()) return null;
            return p?.id ?? row.property_id ?? null;
          })
          .filter(Boolean) as number[];

        // Single bulk request for all missing tags (instead of N individual requests)
        const bulkTagMap: Record<number, string[]> = needTagIds.length
          ? await propertyTagsAPI.getBulk(needTagIds).catch(() => ({}))
          : {};

        // 3) enrich each row with tags
        const enriched = rows.map((row) => {
            const p: any = row.property ?? {};
            let tags: string[] = [];

            // existing inline tags if already present
            if (Array.isArray(p?.tags)) tags = p.tags.filter(Boolean).map(String);
            else if (typeof p?.tags === "string") tags = toArray(p.tags);

            // if still empty, use bulk-fetched result
            if ((!tags || tags.length === 0) && (p?.id || row.property_id)) {
              const pid = p?.id ?? row.property_id;
              tags = bulkTagMap[pid] || [];
            }

            // derive extras from flags (verified/featured/new/resale)
            const extras: string[] = [];
            if (p?.rera_number || p?.rera_approved || p?.is_rera) extras.push("verified");
            if (p?.is_featured || p?.featured) extras.push("featured");
            if (p?.under_construction || p?.is_new_listing) extras.push("new listing");
            if (p?.is_resale || p?.sale_type === "resale") extras.push("resale");

            const finalTags = Array.from(new Set([...(tags || []), ...extras])).filter(Boolean);

            // attach back onto property (non-destructive)
            row.property = { ...(row.property as any), tags: finalTags } as any;
            return row;
          });


        setSavedProps(enriched);
      } catch (err) {
        console.error('❌ ShortlistTab - Error loading saved properties:', err);
        toast.error("Failed to load saved properties");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [buyer?.id]);

  const handleUnsave = async (propertyId: number) => {
    try {
      await buyerSavedAPI.toggle(buyer.id, propertyId, "unsave");
      setSavedProps((prev) => prev.filter((p) => p.property_id !== propertyId));
      toast.success("Removed from shortlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string, propertyTitle: string) => {
    const message = `Hi, I'm interested in your property: ${propertyTitle}. Please share more details.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  // ✅ FIXED: View Details with filter context for ShortlistTab
  const handleViewDetails = (property: any) => {
    const p = property.property || property;

    // Build public URL
    const origin = typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://resaleexpert.in";

    const slug = p?.slug || p?.property_slug || p?.id;
    const baseUrl = `${origin}/properties/${encodeURIComponent(String(slug))}`;

    // Create filter context
    const TRACKING_PARAM_KEY = "fltcnt";
    const STORAGE_KEY_LATEST = "re_filter_token";
    const STORAGE_KEY_PREFIX = "re_filter_payload";

    const randomToken = () => {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return (crypto as any).randomUUID();
      }
      return `flt_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    };

    try {
      const token = randomToken();

      const buyerSnap = (() => {
        const b = buyer || {};
        const req = b?.requirements || {};
        return {
          name: b?.name || undefined,
          budgetMin: b?.budget?.min ?? b?.budget_min ?? undefined,
          budgetMax: b?.budget?.max ?? b?.budget_max ?? undefined,
          unitType: req?.unitType ?? req?.unitTypes ?? undefined,
          preferredLocations: req?.preferredLocations ?? req?.preferredlocations ?? undefined,
          city: req?.city ?? b?.city ?? undefined,
        };
      })();

      const payload = {
        ts: Date.now(),
        source: "ShortlistTab",
        propertyId: p?.id ?? null,
        buyer: buyerSnap,
        from: {
          path: typeof window !== "undefined" ? window.location.pathname : undefined,
          query: typeof window !== "undefined" ? window.location.search : undefined,
        },
      };

      // Store as a separate key per token
      if (typeof window !== "undefined") {
        const k = `${STORAGE_KEY_PREFIX}:${token}`;
        localStorage.setItem(k, JSON.stringify(payload));
        localStorage.setItem(STORAGE_KEY_LATEST, token);
      }

      // Append ?fltcnt=token preserving existing params/hash
      const u = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "https://resaleexpert.in");
      u.searchParams.set(TRACKING_PARAM_KEY, token);

      window.open(u.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ ShortlistTab - Error creating filter context:', error);
      // Fallback to basic URL
      window.open(baseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">My Shortlist</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">{savedProps.length} properties</span>
          <button
            onClick={() => toast.info("Share feature coming soon")}
            className="flex items-center space-x-1 px-3 py-1.5 
             bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] 
             text-white text-xs rounded-lg 
             hover:from-[#CC6A1A] hover:to-[#B85E15] 
             transition-all duration-300 shadow-sm"
          >
            <Share size={14} />
            <span>Share Shortlist</span>
          </button>

        </div>
      </div>

      {/* Loader skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-6 w-1/4 bg-gray-200 rounded" />
                <div className="h-8 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && savedProps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {savedProps.map((sp) => {
            const p: any = sp.property ?? {};
            const img = firstImage(p);
            const title = pickComposedTitle(p);
            const loc = pickLocation(p);
            const price = pickPrice(p);
            const sqft = areaInSqft(p);

            // ✅ FIXED: Get contact info from assigned_to_user
            const assignedUser = p?.assigned_to_user;
            const phoneNumber = assignedUser?.phone || p?.contact_number || p?.phone || p?.seller_phone || '+911234567890';
            const sellerName = assignedUser?.name || p?.seller_name || p?.owner_name || 'Property Owner';

            const tags: string[] = Array.isArray(p?.tags) ? p.tags : [];

            const rating = typeof p?.rating === "number" ? p.rating : undefined;
            const views = Number(p?.total_views ?? p?.public_views ?? p?.views ?? 0) || undefined;
            const aiScore = Number(p?.aiScore) || undefined;

            return (
              <div key={sp.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group h-full flex flex-col">
                {/* Image */}
                <div className="relative">
                  {img ? (
                    <div className="relative">
                      <img
                        src={img}
                        alt={title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-2xl font-bold opacity-40 select-none">ResaleExpert.in</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Building className="text-gray-400" size={48} />
                    </div>
                  )}

                  {/* top-left: tags + AI */}
                  <div className="absolute top-3 left-3 flex items-start flex-wrap gap-2 z-20">
                    <div className="max-w-[72vw] sm:max-w-none overflow-hidden">
                      <PropertyTagsShortlist tags={tags} />
                    </div>
                    {aiScore && aiScore >= 90 && (
                      <span className="flex-none whitespace-nowrap bg-purple-600 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold leading-none flex items-center shadow-sm">
                        <Bot size={12} className="mr-1" />
                        AI {Math.round(aiScore)}
                      </span>
                    )}
                  </div>

                  {/* top-right: remove */}
                  <button
                    onClick={() => handleUnsave(sp.property_id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 text-red-600 hover:bg-red-50 shadow-sm"
                    title="Remove from shortlist"
                  >
                    <Bookmark className="fill-current" size={16} />
                  </button>

                  {/* bottom-left: rating/views */}
                  {(rating || views) && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      {rating && (
                        <div className="bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                          <Star className="text-yellow-500" size={12} />
                          <span className="text-xs font-semibold text-gray-900">{rating.toFixed(1)}</span>
                        </div>
                      )}
                      {typeof views === "number" && (
                        <div className="bg-white/90 rounded-full px-2 py-1">
                          <span className="text-xs font-semibold text-gray-900">{views} views</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="pr-4">
                      <div className="text-lg font-bold text-[#0b3856] mb-1 group-hover:text-[#E6761D] transition-colors">
                        {title}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        <span className="line-clamp-1">{loc}</span>
                      </div>
                    </div>
                    {p?.id && (
                      <div className="text-lg text-gray-500">
                        {p.property_id?.toString().trim() || `REX${String(p.id).padStart(4, "0")}`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold text-green-600">{formatCurrencyShortlist(price)}</div>
                      <div className="text-sm text-gray-500">
                        {(p?.unit_type_name ??
                          p?.unit_type ??
                          p?.unitType ??
                          p?.property_type_name ??
                          p?.property_type ??
                          p?.type) || "-"}{" "}
                        • {sqft || "-"} sq ft
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Price per sq ft</div>
                      <div className="font-semibold text-gray-900">{pricePerSqft(price ?? undefined, sqft)}</div>
                    </div>
                  </div>

                  {/* ✅ FIXED: Seller Info with assigned_to_user data */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{sellerName}</div>
                        <div className="text-xs text-gray-600">{phoneNumber}</div>
                        {assignedUser?.email && (
                          <div className="text-xs text-gray-500">{assignedUser.email}</div>
                        )}
                      </div>
                      {assignedUser && (
                        <div className="text-right text-xs text-gray-500">
                          Executive
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions pinned to bottom */}
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(sp)}
                      className="flex-1 bg-[#E6761D] text-white py-2 rounded-lg hover:bg-[#CC6A1A] transition-colors text-center font-semibold text-sm"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleCall(phoneNumber)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title={`Call ${sellerName}`}
                    >
                      <Phone size={16} />
                    </button>

                    <button
                      onClick={() => handleWhatsApp(phoneNumber, title)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title={`WhatsApp ${sellerName}`}
                    >
                      <FaWhatsapp size={16} />
                    </button>
                  </div>

                  <div className="mt-2 text-[11px] text-gray-500">
                    Saved on {new Date(sp.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && savedProps.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Bookmark className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No Properties Shortlisted</h3>
          <p className="text-xs text-gray-500 mb-4">Start exploring properties and add them to your shortlist</p>
          <button
            onClick={() => toast.info("Redirect to Explore Page")}
            className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
          >
            Explore Properties
          </button>
        </div>
      )}
    </div>
  );
};

export default ShortlistTab;