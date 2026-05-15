


// src/components/properties/PropertyMatchModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  X, Target, Search, Building, MapPin, MessageCircle, Phone, Calendar,
  Globe, Share2, Bookmark, Star, Hash, Bot, CheckCircle, TrendingUp,
  Award, Percent, ExternalLink, Heart, XCircle, ChevronDown, ChevronUp
} from "lucide-react";

import { useProperties } from "@/hooks/properties";
import getTagStyle from "@/lib/tagStyles";
import { propertyTagsAPI, type PropertyTagsRow } from "@/lib/propertyTagsAPI";
import ShareModal from "@/pages/public/ShareModal";
import propertiesAPI from "@/lib/propertiesAPI";

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type PropertyMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  buyer: any;
};

/* ========================= Helpers (ALL KEPT INTACT) ========================= */
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
  if (score >= 90) return "text-emerald-700 bg-emerald-100 border-emerald-200";
  if (score >= 80) return "text-blue-700 bg-blue-100 border-blue-200";
  if (score >= 70) return "text-orange-700 bg-orange-100 border-orange-200";
  return "text-red-700 bg-red-100 border-red-200";
};

const getInvestmentPotentialBadge = (
  potential: "very_high" | "high" | "medium" | "low"
) => {
  const config = {
    very_high: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Very High", icon: "🚀" },
    high: { bg: "bg-blue-100", text: "text-blue-700", label: "High", icon: "📈" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium", icon: "📊" },
    low: { bg: "bg-gray-100", text: "text-gray-700", label: "Low", icon: "📉" },
  } as const;
  const p = config[potential] ?? config.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${p.bg} ${p.text}`}>
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

const isPublicRow = (row: any): boolean => {
  const v = row?.is_public ?? row?.public ?? row?.status ?? row?.visibility;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  const s = String(v ?? "").trim().toLowerCase();
  return ["1", "true", "public", "published", "yes", "active", "available"].includes(s);
};

type AvailabilityStatus = "available" | "sold";

function normalizeAvailabilityStatus(row: any): AvailabilityStatus {
  const isSold = row?.is_sold ?? row?.sold ?? row?.isSold;
  if (typeof isSold === "boolean") return isSold ? "sold" : "available";
  if (typeof isSold === "number") return isSold === 1 ? "sold" : "available";

  const available = row?.available ?? row?.is_available ?? row?.isAvailable;
  if (typeof available === "boolean") return available ? "available" : "sold";
  if (typeof available === "number") return available === 1 ? "available" : "sold";

  const raw =
    row?.availability_status ??
    row?.listing_status ??
    row?.status ??
    row?.availability ??
    row?.property_status;

  const s = String(raw ?? "").trim().toLowerCase();
  if (["sold", "booked", "unavailable", "not available", "closed"].includes(s)) return "sold";
  if (["available", "active", "listed", "open", "public"].includes(s)) return "available";
  return "available";
}

function StatusBadge({ status }: { status: AvailabilityStatus }) {
  const isAvail = status === "available";
  const cls = isAvail
    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-red-100 text-red-700 ring-1 ring-red-200";
  const Icon = isAvail ? CheckCircle : XCircle;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-medium ${cls}`}>
      <Icon size={8} />
      {isAvail ? "Available" : "Sold"}
    </span>
  );
}

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

const TagChip: React.FC<{ tag: string }> = ({ tag }) => {
  const tone = getTagStyle(tag);
  const isStringEmoji = typeof (tone as any).emoji === "string";
  const EmojiComp =
    !isStringEmoji && (tone as any).emoji
      ? ((tone as any).emoji as React.ComponentType<any>)
      : null;

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] ring-1 ${(tone as any).bg} ${(tone as any).text} ${(tone as any).ring}`}
      title={tag}
    >
      {EmojiComp ? <EmojiComp size={8} /> : isStringEmoji ? <span>{(tone as any).emoji as string}</span> : null}
      <span className="capitalize">{tag}</span>
    </span>
  );
};

function buildPublicUrl(p: any, raw: any): string {
  const direct = raw?.website || raw?.url || p.website || p.url;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);

  const origin =
    typeof window !== "undefined" && (window as any).location?.origin
      ? window.location.origin
      : "https://resaleexpert.in";

  if (p?.slug) {
    const clean = String(p.slug).replace(/^\//, "");
    return `${origin}/properties/${clean}`;
  }
  return `${origin}/properties/${p?.id}`;
}

// Form Field Component
const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, children, icon }) => (
  <div className="space-y-0.5">
    <label className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
    </label>
    {children}
  </div>
);

/* ========================= Property Match Modal ========================= */
const PropertyMatchModal: React.FC<PropertyMatchModalProps> = ({ isOpen, onClose, buyer }) => {
  const buyerN = useMemo(() => normalizeBuyer(buyer), [buyer]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "budget_match" | "high_match" | "investment">("all");
  const [shareItem, setShareItem] = useState<any | null>(null);

  const [tagsByPropertyId, setTagsByPropertyId] = useState<Record<string, string[]>>({});
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagsErr, setTagsErr] = useState<string | null>(null);

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
  }, [isOpen]);

  const normalizedProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];

    return properties
      .filter(isPublicRow)
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
          status,
          raw: row,
        };
      });
  }, [properties]);

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
        status: p.status as AvailabilityStatus,
      };
    });
  }, [normalizedProperties, buyerN, tagsByPropertyId]);

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

    const searchFiltered = searchTerm
      ? byTab.filter((property: any) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            property.title?.toLowerCase().includes(searchLower) ||
            property.address?.toLowerCase().includes(searchLower) ||
            property.propertyType?.toLowerCase().includes(searchLower) ||
            property.unitType?.toLowerCase().includes(searchLower) ||
            property.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
            property.status?.toLowerCase().includes(searchLower)
          );
        })
      : byTab;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <Target size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Property Matching</h2>
              <p className="text-[9px] text-white/70">Find perfect properties for {buyerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Buyer Requirements */}
          <div className="rounded-lg p-2.5 mb-3" style={{ background: `${O}5`, border: `1px solid ${O}20` }}>
            <h3 className="text-[8px] font-semibold mb-1.5" style={{ color: O }}>BUYER REQUIREMENTS</h3>
            <div className="flex flex-wrap gap-2 text-[9px]">
              <div><span style={{ color: MU }}>Budget:</span> <span className="font-bold" style={{ color: N }}>{formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}</span></div>
              <div><span style={{ color: MU }}>Units:</span> <span className="font-bold" style={{ color: N }}>{prefUnits}</span></div>
              <div><span style={{ color: MU }}>Locations:</span> <span className="font-bold truncate" style={{ color: N }}>{prefAreas}</span></div>
              <div><span style={{ color: MU }}>Lead Score:</span> <span className="font-bold" style={{ color: N }}>{buyerLeadScore}/100</span></div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
              <input
                type="text"
                placeholder="Search by property name, location, type or status..."
                className="w-full pl-7 pr-3 py-1.5 border rounded-lg text-[9px] focus:outline-none focus:ring-1 bg-white"
                style={{ borderColor: BD }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[8px] font-medium" style={{ color: MU }}>Filter:</span>
              {[
                { id: "all", label: "All" },
                { id: "budget_match", label: "Budget" },
                { id: "high_match", label: "High Match" },
                { id: "investment", label: "Investment" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id as any)}
                  className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium transition-all ${
                    filterType === (filter.id as any)
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={filterType === (filter.id as any) ? { background: O } : {}}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {(loadingProps || loadingTags) && (
            <div className="text-center py-6 text-[9px]" style={{ color: MU }}>Loading properties{loadingTags ? " & tags" : ""}…</div>
          )}
          {propsError && !loadingProps && (
            <div className="text-center py-6 text-[9px]" style={{ color: '#dc2626' }}>{propsError}</div>
          )}
          {tagsErr && !loadingTags && (
            <div className="text-center py-3 text-[8px]" style={{ color: '#d97706' }}>{tagsErr}</div>
          )}

          {/* Property List */}
          {!loadingProps && !propsError && (
            <>
              <div className="space-y-2.5">
                {filteredSuggestions.map((property: any) => (
                  <div key={property.id} className="bg-white rounded-lg overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                    <div className="p-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(property.id)}
                          onChange={() => handlePropertySelection(property.id)}
                          className="mt-1 rounded accent-orange-500 flex-shrink-0"
                        />

                        {/* Image */}
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full sm:w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title Row */}
                          <div className="flex flex-wrap items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1">
                                <h4 className="text-[10px] font-bold truncate" style={{ color: N }}>{property.title}</h4>
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.25 rounded-full text-[7px] font-medium" style={{ background: BG, color: MU }}>
                                  <Hash size={7} /> {property.propertyCode}
                                </span>
                                <StatusBadge status={property.status} />
                              </div>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <MapPin size={8} style={{ color: MU }} />
                                <span className="text-[8px] truncate" style={{ color: MU }}>{property.address || "—"}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[10px] font-bold" style={{ color: O }}>{formatCurrency(property.price)}</div>
                              <div className="text-[7px]" style={{ color: MU }}>{property.area || 0} sq ft</div>
                            </div>
                          </div>

                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className={`px-1 py-0.25 rounded-full text-[7px] font-medium ${getMatchScoreColor(property.matchScore)}`}>
                              {property.matchScore}% Match
                            </span>
                            {getInvestmentPotentialBadge(property.investmentPotential)}
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => {
                                const filled = i < Math.round(Math.min(5, Math.max(0, property.rating)));
                                return (
                                  <Star key={i} size={7} className={filled ? "fill-current" : ""} style={{ color: filled ? '#eab308' : BD }} />
                                );
                              })}
                              <span className="text-[7px]" style={{ color: MU }}>({property.rating})</span>
                            </div>
                          </div>

                          {/* Tags */}
                          {!!property.tags?.length && (
                            <div className="flex flex-wrap gap-0.5 mt-1">
                              {property.tags.slice(0, 3).map((t: string, idx: number) => (
                                <TagChip key={`${t}-${idx}`} tag={t} />
                              ))}
                              {property.tags.length > 3 && (
                                <span className="text-[7px]" style={{ color: MU }}>+{property.tags.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* AI Reasons */}
                          {property.aiReasons?.length > 0 && (
                            <div className="mt-1.5">
                              <div className="flex items-center gap-0.5 text-[7px] font-medium mb-0.5" style={{ color: O }}>
                                <Bot size={7} /> Why AI recommends:
                              </div>
                              <div className="flex flex-wrap gap-0.5">
                                {property.aiReasons.slice(0, 2).map((reason: string, index: number) => (
                                  <span key={index} className="inline-flex items-center gap-0.5 px-1 py-0.25 rounded-full text-[7px]" style={{ background: `${O}10`, color: O }}>
                                    <CheckCircle size={6} /> {reason.length > 40 ? reason.substring(0, 40) + "..." : reason}
                                  </span>
                                ))}
                                {property.aiReasons.length > 2 && (
                                  <span className="text-[7px]" style={{ color: O }}>+{property.aiReasons.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-1 mt-1.5">
                            <div className="rounded p-1" style={{ background: `${O}5` }}>
                              <div className="flex items-center gap-0.5"><TrendingUp size={7} style={{ color: O }} /><span className="text-[6px] font-medium" style={{ color: MU }}>Trend</span></div>
                              <div className="text-[8px] font-bold" style={{ color: O }}>{property.priceHistory.change}</div>
                              <div className="text-[5px]" style={{ color: MU }}>{property.priceHistory.period}</div>
                            </div>
                            <div className="rounded p-1" style={{ background: `${O}5` }}>
                              <div className="flex items-center gap-0.5"><Percent size={7} style={{ color: O }} /><span className="text-[6px] font-medium" style={{ color: MU }}>Yield</span></div>
                              <div className="text-[8px] font-bold" style={{ color: O }}>{property.rentalYield}</div>
                              <div className="text-[5px]" style={{ color: MU }}>per annum</div>
                            </div>
                            <div className="rounded p-1" style={{ background: `${O}5` }}>
                              <div className="flex items-center gap-0.5"><Award size={7} style={{ color: O }} /><span className="text-[6px] font-medium" style={{ color: MU }}>Appreciation</span></div>
                              <div className="text-[8px] font-bold" style={{ color: O }}>{property.appreciationRate}</div>
                              <div className="text-[5px]" style={{ color: MU }}>expected</div>
                            </div>
                          </div>

                          {/* Executive Info */}
                          {property.assignedTo && (
                            <div className="mt-1.5 p-1 rounded" style={{ background: BG }}>
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <div className="text-[7px] truncate" style={{ color: MU }}>
                                  Executive: <span className="font-medium" style={{ color: N }}>{property.assignedTo?.name || "—"}</span>
                                  {property.assignedTo?.phone && <span className="ml-1">• {property.assignedTo.phone}</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  {property.assignedTo?.phone && (
                                    <>
                                      <button
                                        onClick={() => handleContactExecutive(property)}
                                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium text-white transition-all hover:opacity-80"
                                        style={{ background: '#25D366' }}
                                      >
                                        <MessageCircle size={7} /> WA
                                      </button>
                                      <button
                                        onClick={() => handleCallExecutive(property)}
                                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80"
                                        style={{ background: `${O}10`, color: O }}
                                      >
                                        <Phone size={7} /> Call
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-1 mt-1.5 pt-1" style={{ borderTop: `1px solid ${BD}` }}>
                            <button
                              onClick={() => handleScheduleVisit(property)}
                              disabled={property.status === "sold"}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium text-white transition-all hover:opacity-80 disabled:opacity-40"
                              style={{ background: O }}
                            >
                              <Calendar size={8} /> Visit
                            </button>
                            <button
                              onClick={() => handleSaveToShortlist(property)}
                              disabled={property.status === "sold"}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80 disabled:opacity-40"
                              style={{ background: `${O}10`, color: O }}
                            >
                              <Heart size={8} /> Shortlist
                            </button>
                            <button
                              onClick={() => handleRequestMoreInfo(property)}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80"
                              style={{ background: `${O}10`, color: O }}
                            >
                              <Share2 size={8} /> Info
                            </button>
                            <button
                              onClick={() => openShareFor(property)}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80"
                              style={{ background: `${O}10`, color: O }}
                            >
                              <Share2 size={8} /> Share
                            </button>
                            <a
                              href={property.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80"
                              style={{ background: BG, color: N }}
                              onClick={(e) => {
                                e.preventDefault();
                                handleVisitWebsite(property);
                              }}
                            >
                              <ExternalLink size={8} /> Website
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredSuggestions.length === 0 && !loadingProps && (
                  <div className="text-center py-8">
                    <Building size={32} className="mx-auto mb-2" style={{ color: MU }} />
                    <h3 className="text-[11px] font-semibold mb-1" style={{ color: N }}>No matching properties found</h3>
                    <p className="text-[8px]" style={{ color: MU }}>Adjust the search or filters to see more results.</p>
                  </div>
                )}
              </div>

              {/* AI Insights */}
              {filteredSuggestions.length > 0 && (
                <div className="mt-3 rounded-lg p-2.5" style={{ background: `${O}5`, border: `1px solid ${O}20` }}>
                  <h3 className="text-[9px] font-bold mb-1.5 flex items-center gap-1" style={{ color: O }}>
                    <Bot size={10} /> AI Insights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <div className="bg-white rounded p-1.5" style={{ border: `1px solid ${BD}` }}>
                      <h4 className="text-[7px] font-medium mb-0.5" style={{ color: N }}>Market Recommendation</h4>
                      <p className="text-[7px]" style={{ color: MU }}>Top localities show healthy demand with stable pricing.</p>
                    </div>
                    <div className="bg-white rounded p-1.5" style={{ border: `1px solid ${BD}` }}>
                      <h4 className="text-[7px] font-medium mb-0.5" style={{ color: N }}>Timing Advice</h4>
                      <p className="text-[7px]" style={{ color: MU }}>Conditions favorable for buyers—schedule visits soon.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="text-[8px]" style={{ color: MU }}>
            {filteredSuggestions.length} properties found • {selectedProperties.length} selected
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-2 py-1 text-[8px] font-medium rounded-lg transition-all hover:bg-gray-50" style={{ border: `1px solid ${BD}`, color: N }}>
              Close
            </button>
            {selectedProperties.length > 0 && (
              <button
                onClick={handleSendToSelected}
                className="flex items-center gap-0.5 px-2 py-1 text-[8px] font-medium text-white rounded-lg transition-all hover:opacity-80"
                style={{ background: O }}
              >
                <Share2 size={8} />
                <span>Send {selectedProperties.length}</span>
              </button>
            )}
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