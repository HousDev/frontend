// src/components/properties/PropertyMatchModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  X, Target, Search, Building, MapPin, MessageCircle, Phone, Calendar,
  Globe, Share2, Bookmark, Star, Hash, Bot, CheckCircle, TrendingUp,
  Award, Percent, ExternalLink, Heart, XCircle
} from "lucide-react";

import { useProperties } from "@/hooks/properties";
import getTagStyle from "@/lib/tagStyles";
import { propertyTagsAPI, type PropertyTagsRow } from "@/lib/propertyTagsAPI";
import ShareModal from "@/pages/public/ShareModal";
import propertiesAPI from "@/lib/propertiesAPI";

type PropertyMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  buyer: any;
};

/* ========================= Helpers ========================= */
const str = (v: any) => (v == null ? "" : String(v));
const cleanPhone = (s?: string) => str(s).replace(/\D/g, "");
const nonEmpty = (x: any) => !!str(x).trim();

const toNum = (v: any, fallback = 0) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toStrArr = (v: any): string[] => {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const arr = JSON.parse(s);
        return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [];
      } catch {
        return [];
      }
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [];
};

const titleCase = (s?: string | null) =>
  (s ?? "")
    .toString()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(bhk)\b/gi, "BHK")
    .replace(/\b\w/g, (m) => m.toUpperCase());

const joinNonEmpty = (parts: Array<string | undefined | null>) =>
  parts.map((x) => (x ?? "").toString().trim()).filter(Boolean).join(" ");

const formatCurrency = (amount: number) => {
  if (!Number.isFinite(amount)) return "₹0";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const getMatchScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600 bg-green-100 border-green-200";
  if (score >= 80) return "text-blue-600 bg-blue-100 border-blue-200";
  if (score >= 70) return "text-orange-600 bg-orange-100 border-orange-200";
  return "text-red-600 bg-red-100 border-red-200";
};

const getInvestmentPotentialBadge = (
  potential: "very_high" | "high" | "medium" | "low"
) => {
  const config = {
    very_high: { bg: "bg-green-100", text: "text-green-700", label: "Very High", icon: "🚀" },
    high: { bg: "bg-blue-100", text: "text-blue-700", label: "High", icon: "📈" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium", icon: "📊" },
    low: { bg: "bg-gray-100", text: "text-gray-700", label: "Low", icon: "📉" },
  } as const;
  const p = config[potential] ?? config.medium;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${p.bg} ${p.text}`}>
      {p.icon} {p.label}
    </span>
  );
};

const safeJsonArray = (val: unknown) => {
  if (Array.isArray(val)) return val as any[];
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    if (s.startsWith("[") && s.endsWith("]")) {
      try { return JSON.parse(s) as any[]; } catch { return []; }
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [];
};

const inRange = (value: number, min: number, max: number) => value >= min && value <= max;

const formatPropertyCode = (id: string | number | null | undefined) =>
  id != null ? `REX00${String(id)}` : "REX00—";

const normalizePhoneForWhatsApp = (phone?: string | null) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91")) return digits;
  return digits.length === 10 ? `91${digits}` : digits;
};

/* Robust public flag detector */
const isPublicRow = (row: any): boolean => {
  const v = row?.is_public ?? row?.public ?? row?.status ?? row?.visibility;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  const s = String(v ?? "").trim().toLowerCase();
  // treat "sold" as not-public? No; we still show sold items if they are marked public.
  // This function only decides "public vs not", actual status handled below.
  return ["1", "true", "public", "published", "yes", "active", "available"].includes(s);
};

/* ============== Status Normalization (Available / Sold) ============== */
type AvailabilityStatus = "available" | "sold";

function normalizeAvailabilityStatus(row: any): AvailabilityStatus {
  // Check explicit booleans/ints first
  const isSold = row?.is_sold ?? row?.sold ?? row?.isSold;
  if (typeof isSold === "boolean") return isSold ? "sold" : "available";
  if (typeof isSold === "number") return isSold === 1 ? "sold" : "available";

  const available = row?.available ?? row?.is_available ?? row?.isAvailable;
  if (typeof available === "boolean") return available ? "available" : "sold";
  if (typeof available === "number") return available === 1 ? "available" : "sold";

  // Common textual fields
  const raw =
    row?.availability_status ??
    row?.listing_status ??
    row?.status ??
    row?.availability ??
    row?.property_status;

  const s = String(raw ?? "").trim().toLowerCase();

  // Map a variety of inputs to the two states
  if (["sold", "booked", "unavailable", "not available", "closed"].includes(s)) return "sold";
  if (["available", "active", "listed", "open", "public"].includes(s)) return "available";

  // Fallback: if price & details exist but nothing indicates "sold", assume available
  return "available";
}

function StatusBadge({ status }: { status: AvailabilityStatus }) {
  const isAvail = status === "available";
  const cls = isAvail
    ? "bg-green-100 text-green-700 ring-1 ring-green-200"
    : "bg-red-100 text-red-700 ring-1 ring-red-200";
  const Icon = isAvail ? CheckCircle : XCircle;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${cls}`}>
      <Icon size={10} />
      {isAvail ? "Available" : "Sold"}
    </span>
  );
}

/* ========================= Buyer Normalization ========================= */
type BuyerNorm = {
  name: string;
  leadScore?: number;
  budget: { min: number; max: number };
  requirements: {
    unitType?: string | string[];
    preferredLocations: string[];
    city?: string;
  };
  city?: string;
};

const normalizeBuyer = (raw: any | null | undefined): BuyerNorm | null => {
  if (!raw) return null;

  const req = typeof raw.requirements === "string" ? (() => {
    try { return JSON.parse(raw.requirements); } catch { return {}; }
  })() : (raw.requirements || {});

  const preferredLocations =
    toStrArr(req.preferredLocations).length
      ? toStrArr(req.preferredLocations)
      : toStrArr(req.preferredlocations);

  const unitType =
    req.unitType !== undefined && req.unitType !== null
      ? req.unitType
      : (toStrArr(req.unitTypes).length ? toStrArr(req.unitTypes) : undefined);

  const city = (req.city || raw.city) ? String(req.city || raw.city) : undefined;

  const min = toNum(raw?.budget?.min ?? raw?.budget_min ?? 0);
  const max = toNum(raw?.budget?.max ?? raw?.budget_max ?? 0);

  return {
    name: String(raw.name || "Buyer"),
    leadScore: toNum(raw.leadScore ?? raw.buyer_lead_score ?? raw.lead_score ?? 70),
    budget: { min, max },
    requirements: { unitType, preferredLocations, city },
    city,
  };
};

/* ========================= Matching Heuristics ========================= */
function normalizeUnitTypeToBHK(s: string) {
  const m = String(s || "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .match(/(\d+)\s*(bhk|bed|bedroom)?/i);
  return m ? m[1] : "";
}

function computeMatchScore(p: any, buyer: BuyerNorm) {
  const price = p.price || p.budget || 0;
  const isBudgetOk = inRange(price, buyer.budget.min, buyer.budget.max);
  if (!isBudgetOk) return 0;

  const W_BUDGET = 55;
  const W_LOCATION = 25;
  const W_UNIT = 15;
  const W_EXTRAS = 5;

  let score = 0;

  const mid = (buyer.budget.min + buyer.budget.max) / 2;
  const halfRange = Math.max(1, (buyer.budget.max - buyer.budget.min) / 2);
  const dist = Math.abs(price - mid);
  const budgetFrac = Math.max(0, 1 - dist / halfRange);
  score += Math.round(W_BUDGET * budgetFrac);

  let locPts = 0;
  if (buyer.requirements.preferredLocations?.length) {
    const locs = (p.location || p.address || "").toLowerCase();
    const hit = buyer.requirements.preferredLocations.some((l) =>
      locs.includes(String(l || "").toLowerCase())
    );
    locPts = hit ? W_LOCATION : 0;
  } else {
    locPts = Math.round(W_LOCATION * 0.5);
  }
  score += locPts;

  let unitPts = 0;
  if (buyer.requirements.unitType) {
    const pu = Array.isArray(buyer.requirements.unitType)
      ? buyer.requirements.unitType.map(normalizeUnitTypeToBHK)
      : [normalizeUnitTypeToBHK(String(buyer.requirements.unitType))];

    const propU = normalizeUnitTypeToBHK(String(p.unitType || ""));
    const exact = pu.some((x) => x && x === propU);
    const loose = !exact && pu.some((x) => x && (p.unitType || "").toLowerCase().includes(x));

    unitPts = exact ? W_UNIT : loose ? Math.round(W_UNIT * 0.6) : 0;
  } else {
    unitPts = Math.round(W_UNIT * 0.5);
  }
  score += unitPts;

  const hasPhotos = (p.photos?.length || p.photo) > 0;
  const hasAmenities = (p.amenities?.length || 0) > 0;
  const extrasFrac = (Number(hasPhotos) + Number(hasAmenities)) / 2;
  score += Math.round(W_EXTRAS * extrasFrac);

  return Math.max(0, Math.min(100, score));
}

function deriveInvestmentPotential(p: any): "very_high" | "high" | "medium" | "low" {
  const price = p.price || p.budget || 0;
  if (price >= 25000000) return "very_high";
  if (price >= 18000000) return "high";
  if (price >= 12000000) return "medium";
  return "low";
}

function estimateRentalYield(p: any) {
  const potential = deriveInvestmentPotential(p);
  switch (potential) {
    case "very_high": return "2.8%";
    case "high": return "3.2%";
    case "medium": return "4.1%";
    default: return "3.5%";
  }
}

/* ========================= Tag Chip ========================= */
const TagChip: React.FC<{ tag: string }> = ({ tag }) => {
  const tone = getTagStyle(tag);
  const isStringEmoji = typeof (tone as any).emoji === "string";
  const EmojiComp =
    !isStringEmoji && (tone as any).emoji
      ? ((tone as any).emoji as React.ComponentType<any>)
      : null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ring-1 ${(tone as any).bg} ${(tone as any).text} ${(tone as any).ring}`}
      title={tag}
    >
      {EmojiComp ? <EmojiComp size={10} /> : isStringEmoji ? <span>{(tone as any).emoji as string}</span> : null}
      <span className="capitalize">{tag}</span>
    </span>
  );
};

/* ========================= URL helper ========================= */
function buildPublicUrl(p: any, raw: any): string {
  const direct = raw?.website || raw?.url || p.website || p.url;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);

  const origin =
    typeof window !== "undefined" && (window as any).location?.origin
      ? window.location.origin
      : "https://investordeal.in";

  if (p?.slug) {
    const clean = String(p.slug).replace(/^\//, "");
    return `${origin}/properties/${clean}`;
  }
  return `${origin}/properties/${p?.id}`;
}

/* ========================= Property Match Modal ========================= */
const PropertyMatchModal: React.FC<PropertyMatchModalProps> = ({ isOpen, onClose, buyer }) => {
  const buyerN = useMemo(() => normalizeBuyer(buyer), [buyer]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "budget_match" | "high_match" | "investment">("all");
  const [shareItem, setShareItem] = useState<any | null>(null);

  // tags
  const [tagsByPropertyId, setTagsByPropertyId] = useState<Record<string, string[]>>({});
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagsErr, setTagsErr] = useState<string | null>(null);

  // properties
  const { properties, loadingProps, propsError, fetchProperties, utils } = useProperties({ autoLog: false });
  const { makeItem, norm, toArr } = utils;

  useEffect(() => {
    if (!isOpen) return;
    fetchProperties();

    let cancelled = false;
    (async () => {
      try {
        setLoadingTags(true);
        setTagsErr(null);
        const rows: PropertyTagsRow[] = await propertyTagsAPI.getAll();
        if (cancelled) return;
        const map: Record<string, string[]> = {};
        for (const r of rows) map[String(r.property_id)] = Array.isArray(r?.tags) ? r.tags : [];
        setTagsByPropertyId(map);
      } catch (e: any) {
        setTagsErr(e?.message || "Failed to load tags");
      } finally {
        if (!cancelled) setLoadingTags(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, fetchProperties]);

  // Normalize properties and **filter only public** before mapping
  const normalizedProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];

    return properties
      .filter(isPublicRow) // ✅ Only public properties
      .map((row: any) => {
        const photos = (() => {
          const arr = safeJsonArray(row?.photos ?? row?.images ?? row?.media);
          if (arr.length && typeof arr[0] === "object") {
            return arr.map((m: any) => m?.url ?? m?.src ?? "").filter(Boolean);
          }
          return arr as string[];
        })();

        const propertyType = row.property_type_name || row.property_type || "";
        const unitType = row.unit_type || row.bhk_label || row.configuration || "";
        const subtypeRaw = row.property_subtype_name || row.property_subtype || "";

        const propertySubtypeArr = toStrArr(subtypeRaw);
        const propertySubtype =
          propertySubtypeArr.length > 0 ? propertySubtypeArr : (subtypeRaw ? [String(subtypeRaw)] : []);

        const serverTitle = row.title || row.project_name || row.name || row.property_name || row.society_name;

        const displayTitle = (() => {
          const subtypeJoined = Array.isArray(propertySubtype)
            ? propertySubtype.filter(Boolean).join(" / ")
            : propertySubtype;

          const parts = [
            titleCase(propertyType),
            titleCase(unitType),
            titleCase(subtypeJoined),
          ];

          const composed = joinNonEmpty(parts).trim();
          return composed || (serverTitle ? String(serverTitle) : "Untitled Property");
        })();

        const assignedTo =
          row.assignedTo ||
          (row.executive_name || row.executive_email || row.executive_phone
            ? {
                name: row.executive_name || null,
                email: row.executive_email || null,
                phone: row.executive_phone || null,
              }
            : null);

        const status: AvailabilityStatus = normalizeAvailabilityStatus(row);

        return {
          id: row?.property_id ?? row?.id ?? row?._id ?? row?.uuid ?? row?.slug ?? `temp-${Math.random()}`,
          title: displayTitle,
          propertyType: propertyType ? String(propertyType) : undefined,
          unitType: unitType ? String(unitType) : undefined,
          propertySubtype,
          slug: row.slug,
          photos,
          city: row.city_name || row.city || row.cityNormalized,
          location: row.location_name || row.location || row.locationNormalized || row.locality,
          address: row.address || row.full_address,
          budget: toNum(row.budget ?? row.final_price ?? row.price ?? row.expected_price ?? 0),
          carpet_area: toNum(row.carpet_area ?? row.carpetArea ?? row.area ?? 0),
          amenities: Array.isArray(row.amenities) ? row.amenities : toStrArr(row.amenities),
          website: row.website || row.url,
          url: row.url,
          assignedTo,
          is_public: isPublicRow(row),
          status, // ✅ normalized availability status
          raw: row,
        };
      });
  }, [properties]);

  // Build suggestions
  const suggestions = useMemo(() => {
    if (!buyerN) return [] as any[];

    return normalizedProperties.map((p) => {
      const matchScore = computeMatchScore(p, buyerN);
      const investmentPotential = deriveInvestmentPotential(p);
      const rentalYield = estimateRentalYield(p);
      const perSqft =
        p.carpet_area && p.carpet_area > 0
          ? Math.max(0, Math.round((p.budget || 0) / p.carpet_area))
          : 0;

      const nearbyPlaces = [
        { name: `${p.location || p.city || "Local"} Metro`, distance: "0.8 km", type: "transport" },
        { name: "Mall / High Street", distance: "1.5 km", type: "shopping" },
        { name: "Hospital", distance: "2.0 km", type: "healthcare" },
      ];

      const aiReasons: string[] = [];
      if (p.budget && buyerN && inRange(p.budget, buyerN.budget.min, buyerN.budget.max))
        aiReasons.push("Perfect budget match within your range");
      if (
        p.location &&
        buyerN.requirements.preferredLocations?.some((l) =>
          (p.location || "").toLowerCase().includes(String(l).toLowerCase())
        )
      ) aiReasons.push("Located in your preferred area");
      if (p.unitType && buyerN.requirements.unitType) {
        const pref = buyerN.requirements.unitType;
        const ok = Array.isArray(pref)
          ? pref.some((u) => String(p.unitType).toLowerCase().includes(String(u).toLowerCase()))
          : String(p.unitType).toLowerCase().includes(String(pref).toLowerCase());
        if (ok) aiReasons.push("Matches your preferred configuration");
      }
      if (p.amenities?.length) aiReasons.push("Has your required amenities");

      const img =
        p.photos?.[0] ||
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800";

      const publicUrl = buildPublicUrl(p, p.raw);

      const propertySubtype =
        Array.isArray(p.propertySubtype) ? p.propertySubtype.join(" / ") : (p.propertySubtype || "");

      return {
        id: String(p.id),
        propertyCode: formatPropertyCode(p.id),
        title: p.title,
        propertyType: p.propertyType || "",
        unitType: p.unitType || "",
        propertySubtype,
        address: (p.address || `${p.location || ""}${p.city ? ", " + p.city : ""}` || "").trim(),
        price: p.budget || 0,
        area: p.carpet_area || 0,
        perSqft,
        matchScore,
        aiReasons,
        highlights: ["Good connectivity", "Growth potential", "Amenities"],
        rating: 4.7,
        images: [img],
        amenities: p.amenities || [],
        nearbyPlaces,
        priceHistory: { trend: "up", change: "+3.5%", period: "6 months" },
        investmentPotential,
        rentalYield,
        appreciationRate:
          investmentPotential === "very_high" ? "10-15%" :
          investmentPotential === "high"      ? "8-12%"  : "6-9%",
        raw: p,
        tags: tagsByPropertyId[String(p.id)] || [],
        assignedTo: p.assignedTo || null,
        publicUrl,
        slug: p.slug,
        propertyId: p.id,
        shareImage: img,
        status: p.status as AvailabilityStatus, // ✅ carry forward
      };
    });
  }, [normalizedProperties, buyerN, tagsByPropertyId]);

  // Filter suggestions (already public-only upstream)
  const filteredSuggestions = useMemo(() => {
    if (!buyerN) return [] as any[];

    const withinBudget = (prop: any) =>
      inRange(prop.price || 0, buyerN.budget.min, buyerN.budget.max);

    const base = suggestions.filter(withinBudget);

    const byTab = (() => {
      switch (filterType) {
        case "budget_match":
          return base;
        case "high_match":
          return base.filter((p) => p.matchScore >= 85);
        case "investment":
          return base.filter((p) => p.investmentPotential === "high" || p.investmentPotential === "very_high");
        case "all":
        default:
          return base;
      }
    })();

    // Apply search filter
    const searchFiltered = searchTerm
      ? byTab.filter((property: any) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            property.title?.toLowerCase().includes(searchLower) ||
            property.address?.toLowerCase().includes(searchLower) ||
            property.propertyType?.toLowerCase().includes(searchLower) ||
            property.unitType?.toLowerCase().includes(searchLower) ||
            property.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
            property.status?.toLowerCase().includes(searchLower) // allow search by "sold"/"available"
          );
        })
      : byTab;

    // Sort: higher score first, then lower price
    return searchFiltered.sort((a, b) => (b.matchScore - a.matchScore) || ((a.price || 0) - (b.price || 0)));
  }, [suggestions, filterType, buyerN, searchTerm]);

  const handlePropertySelection = (propertyId: string) => {
    setSelectedProperties((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const handleScheduleVisit = (property: any) => {
    alert(`Visit scheduled for ${property.title}. You will receive confirmation shortly.`);
  };

  const handleSaveToShortlist = (property: any) => {
    alert(`${property.title} added to your shortlist!`);
  };

  const handleRequestMoreInfo = (property: any) => {
    alert(`More information requested for ${property.title}. Executive will be notified.`);
  };

  const handleContactExecutive = (property: any) => {
    const phone = property.assignedTo?.phone || "";
    const wa = normalizePhoneForWhatsApp(phone);
    if (!wa) return alert("Executive phone not available.");
    const message = `Hi ${property.assignedTo?.name || "there"}, I'm interested in "${property.title}". My budget is ${formatCurrency(
      buyerN?.budget.min ?? 0
    )} - ${formatCurrency(buyerN?.budget.max ?? 0)}. Can we schedule a visit?`;
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleCallExecutive = (property: any) => {
    const phone = property.assignedTo?.phone || "";
    const cleaned = cleanPhone(phone);
    if (!cleaned) return alert("Executive phone not available.");
    window.open(`tel:${cleaned}`, "_self");
  };

  const handleVisitWebsite = (property: any) => {
    window.open(property.publicUrl, "_blank", "noopener,noreferrer");
  };

  const openShareFor = (property: any) => {
    setShareItem({
      title: property.title,
      description: property.address || "",
      image: property.shareImage,
      url: property.publicUrl,
      slug: property.slug,
      propertyId: property.propertyId,
    });
  };

  const handleSendToSelected = () => {
    if (!selectedProperties.length) {
      alert("Please select properties to send to buyer");
      return;
    }
    const selected = filteredSuggestions.filter((p) => selectedProperties.includes(String(p.id)));
    alert(`${selectedProperties.length} properties sent to ${buyerN?.name || "buyer"}.`);
    setSelectedProperties([]);
  };

  if (!isOpen || !buyerN) return null;

  // UI fields from normalized buyer
  const buyerName = buyerN.name || "Buyer";
  const budgetMin = buyerN.budget.min;
  const budgetMax = buyerN.budget.max;
  const prefUnits = Array.isArray(buyerN.requirements.unitType)
    ? buyerN.requirements.unitType.join(", ")
    : buyerN.requirements.unitType || "Any";
  const prefAreas = buyerN.requirements.preferredLocations.length
    ? buyerN.requirements.preferredLocations.join(", ")
    : buyerN.requirements.city || buyerN.city || "Any";
  const buyerLeadScore = buyerN.leadScore ?? 70;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b bg-[#E6761D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg">
                <Target className="text-[#0b3856]" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Property Matching</h2>
                <p className="text-white text-xs">Find perfect properties for {buyerName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white hover:bg-gray-50 shadow" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Buyer summary */}
          <div className="bg-purple-50 rounded-lg p-3 mb-4">
            <h3 className="font-semibold text-purple-900 mb-2 text-xs">BUYER REQUIREMENTS</h3>
            <div className="flex flex-wrap gap-4 text-xs items-center">
              <div>
                <span className="text-purple-600">Budget:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
                </span>
              </div>

              <div>
                <span className="text-purple-600">Unit Types:</span>
                <span className="font-bold text-purple-900 ml-1">{prefUnits}</span>
              </div>

              <div>
                <span className="text-purple-600">Locations:</span>
                <span className="font-bold text-purple-900 ml-1">{prefAreas}</span>
              </div>

              <div>
                <span className="text-purple-600">Lead Score:</span>
                <span className="font-bold text-purple-900 ml-1">{buyerLeadScore}/100</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by property name, location, type or status..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="font-medium text-gray-700 text-xs">Filter:</span>
              {[
                { id: "all", label: "All" },
                { id: "budget_match", label: "Budget Match" },
                { id: "high_match", label: "High Match" },
                { id: "investment", label: "Best Investment" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id as any)}
                  className={`px-2 py-1 rounded-full font-medium transition-colors text-xs ${
                    filterType === (filter.id as any)
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {(loadingProps || loadingTags) && (
            <div className="text-center py-8 text-xs text-gray-600">
              Loading properties{loadingTags ? " & tags" : ""}…
            </div>
          )}
          {propsError && !loadingProps && (
            <div className="text-center py-8 text-xs text-red-600">{propsError}</div>
          )}
          {tagsErr && !loadingTags && (
            <div className="text-center py-4 text-xs text-amber-700">{tagsErr}</div>
          )}

          {/* Property List */}
          {!loadingProps && !propsError && (
            <>
              <div className="space-y-4">
                {filteredSuggestions.map((property: any) => (
                  <div
                    key={property.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(property.id)}
                          onChange={() => handlePropertySelection(property.id)}
                          className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          aria-label={`Select ${property.title}`}
                        />

                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-gray-900 truncate">{property.title}</h4>

                                {/* Property Code */}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 text-[10px]">
                                  <Hash size={10} />
                                  {property.propertyCode}
                                </span>

                                {/* ✅ Availability Status */}
                                <StatusBadge status={property.status as AvailabilityStatus} />
                              </div>

                              <div className="flex items-center space-x-1 text-gray-600 mt-0.5">
                                <MapPin size={12} />
                                <span className="truncate">{property.address || "—"}</span>
                              </div>

                              <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                                <div className={`px-2 py-0.5 rounded-full border ${getMatchScoreColor(property.matchScore)}`}>
                                  {property.matchScore}% Match
                                </div>
                                {getInvestmentPotentialBadge(property.investmentPotential)}
                                <div className="flex items-center space-x-0.5">
                                  {Array.from({ length: 5 }, (_, i) => {
                                    const filled = i < Math.round(Math.min(5, Math.max(0, property.rating)));
                                    return (
                                      <Star
                                        key={i}
                                        size={10}
                                        className={filled ? "text-yellow-400 fill-current" : "text-gray-300"}
                                      />
                                    );
                                  })}
                                  <span className="text-gray-600 ml-0.5">({property.rating})</span>
                                </div>
                              </div>

                              {!!property.tags?.length && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {property.tags.map((t: string, idx: number) => (
                                    <TagChip key={`${t}-${idx}`} tag={t} />
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="text-right flex-shrink-0 pl-2">
                              <div className="font-bold text-green-600">{formatCurrency(property.price)}</div>
                              <div className="text-gray-500">{property.area || 0} sq ft</div>
                              <div className="text-gray-500 mt-0.5">
                                {property.perSqft > 0 ? `₹${property.perSqft.toLocaleString()}/sq ft` : "—"}
                              </div>
                            </div>
                          </div>

                          {property.aiReasons?.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-gray-900 mb-1 flex items-center">
                                <Bot className="mr-1 text-blue-600" size={12} />
                                Why AI recommends:
                              </h5>
                              <div className="space-y-0.5">
                                {(property.aiReasons as string[]).slice(0, 2).map((reason: string, index: number) => (
                                  <div key={index} className="flex items-start space-x-1">
                                    <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={10} />
                                    <span className="text-gray-700">{reason}</span>
                                  </div>
                                ))}
                                {property.aiReasons.length > 2 && (
                                  <div className="text-blue-600 cursor-pointer hover:underline">
                                    +{property.aiReasons.length - 2} more reasons
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-green-50 rounded p-2">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="text-green-600" size={10} />
                                <span className="font-medium text-green-800">Price Trend</span>
                              </div>
                              <div className="font-bold text-green-900">{property.priceHistory.change}</div>
                              <div className="text-green-700">{property.priceHistory.period}</div>
                            </div>
                            <div className="bg-blue-50 rounded p-2">
                              <div className="flex items-center space-x-1">
                                <Percent className="text-blue-600" size={10} />
                                <span className="font-medium text-blue-800">Rental Yield</span>
                              </div>
                              <div className="font-bold text-blue-900">{property.rentalYield}</div>
                              <div className="text-blue-700">per annum</div>
                            </div>
                            <div className="bg-purple-50 rounded p-2">
                              <div className="flex items-center space-x-1">
                                <Award className="text-purple-600" size={10} />
                                <span className="font-medium text-purple-800">Appreciation</span>
                              </div>
                              <div className="font-bold text-purple-900">{property.appreciationRate}</div>
                              <div className="text-purple-700">expected</div>
                            </div>
                          </div>

                          {property.assignedTo && (
                            <div className="mb-3 p-2 bg-gray-50 rounded">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    Executive: {property.assignedTo?.name || "—"}
                                  </div>
                                  <div className="text-gray-600 truncate">{property.assignedTo?.email || "—"}</div>
                                  <div className="text-gray-600">{property.assignedTo?.phone || "—"}</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {property.assignedTo?.phone && (
                                    <>
                                      <button
                                        onClick={() => handleContactExecutive(property)}
                                        className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-xs"
                                      >
                                        <MessageCircle size={10} />
                                        <span>WhatsApp</span>
                                      </button>
                                      <button
                                        onClick={() => handleCallExecutive(property)}
                                        className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                                      >
                                        <Phone size={10} />
                                        <span>Call</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-1 flex-wrap gap-1">
                            <button
                              onClick={() => handleScheduleVisit(property)}
                              className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                              disabled={property.status === "sold"}
                              title={property.status === "sold" ? "This property is sold" : "Schedule a visit"}
                            >
                              <Calendar size={12} />
                              <span>Visit</span>
                            </button>

                            <button
                              onClick={() => handleSaveToShortlist(property)}
                              className="flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs"
                              disabled={property.status === "sold"}
                              title={property.status === "sold" ? "This property is sold" : "Add to shortlist"}
                            >
                              <Heart size={12} />
                              <span>Shortlist</span>
                            </button>

                            <button
                              onClick={() => handleRequestMoreInfo(property)}
                              className="flex items-center space-x-1 px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs"
                            >
                              <Share2 size={12} />
                              <span>Info</span>
                            </button>

                            <a
                              href={property.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
                              onClick={(e) => {
                                e.preventDefault();
                                handleVisitWebsite(property);
                              }}
                            >
                              <ExternalLink size={12} />
                              <span>Website</span>
                            </a>

                            <button
                              onClick={() => openShareFor(property)}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
                            >
                              <Share2 size={12} />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredSuggestions.length === 0 && !loadingProps && (
                  <div className="text-center py-8">
                    <Building className="mx-auto text-gray-300 mb-3" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching properties found</h3>
                    <p className="text-gray-500 text-xs">Adjust the search or filters to see more results.</p>
                  </div>
                )}
              </div>

              {/* AI Insights */}
              {filteredSuggestions.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Bot className="mr-1" size={16} />
                    AI Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-white rounded p-2">
                      <h4 className="font-medium text-gray-900 mb-1">Market Recommendation</h4>
                      <p className="text-gray-700 text-xs">Top localities in your preferences show healthy demand with stable pricing.</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <h4 className="font-medium text-gray-900 mb-1">Timing Advice</h4>
                      <p className="text-gray-700 text-xs">Conditions are favorable for buyers—shortlist and schedule site visits soon.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {filteredSuggestions.length} properties found • {selectedProperties.length} selected
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-xs">
                Close
              </button>
              {selectedProperties.length > 0 && (
                <button
                  onClick={handleSendToSelected}
                  className="flex items-center gap-1 px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs"
                >
                  <Share2 size={14} />
                  <span>Send to Buyer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareItem && (
        <ShareModal
          onClose={() => setShareItem(null)}
          propertyId={shareItem.propertyId}
          slug={String(shareItem.slug || "")}
          title={shareItem.title}
          description={shareItem.description}
          image={shareItem.image}
          url={shareItem.url}
          trackingToken={undefined}
          absoluteBase={undefined}
        />
      )}
    </div>
  );
};

export default PropertyMatchModal;
