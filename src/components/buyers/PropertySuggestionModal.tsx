// // src/components/properties/PropertySuggestionModal.tsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   X,
//   Target,
//   Star,
//   MapPin,
//   Calendar,
//   MessageCircle,
//   Share as ShareIcon,
//   Heart,
//   CheckCircle,
//   TrendingUp,
//   Award,
//   Percent,
//   Bot,
//   ExternalLink,
//   Hash,
//   XCircle, // ✅ for Sold badge
// } from "lucide-react";

// import propertiesAPI from "@/lib/propertiesAPI";
// import propertyTagsAPI from "@/lib/propertyTagsAPI";
// import getTagStyle from "@/lib/tagStyles";
// import ShareModal from "@/pages/public/ShareModal";

// /* ----------------------------------------------------------------------------
//    Types
// ---------------------------------------------------------------------------- */
// type BuyerRaw = any;

// type BuyerNorm = {
//   name: string;
//   leadScore?: number;
//   budget: { min: number; max: number };
//   requirements: {
//     unitType?: string | string[];
//     preferredLocations: string[];
//     city?: string;
//   };
//   city?: string;
// };

// type AvailabilityStatus = "available" | "sold";

// export type Property = {
//   id: string | number;
//   title?: string;
//   propertyType?: string;
//   unitType?: string;
//   propertySubtype?: string | string[];
//   slug?: string;
//   photos?: string[];
//   city?: string;
//   location?: string;
//   address?: string;
//   budget?: number;
//   carpet_area?: number;
//   amenities?: string[];
//   website?: string;
//   url?: string;
//   assignedTo?: {
//     name?: string | null;
//     email?: string | null;
//     phone?: string | null;
//   } | null;
//   is_public?: boolean | 0 | 1 | "0" | "1";
//   status?: AvailabilityStatus; // ✅ added
// };

// /* ----------------------------------------------------------------------------
//    Helpers
// ---------------------------------------------------------------------------- */
// const toNum = (v: any, fallback = 0) => {
//   const n = typeof v === "string" ? parseFloat(v) : Number(v);
//   return Number.isFinite(n) ? n : fallback;
// };

// const toStrArr = (v: any): string[] => {
//   if (Array.isArray(v)) return v.map(String).filter(Boolean);
//   if (typeof v === "string") {
//     const s = v.trim();
//     if (!s) return [];
//     if (s.startsWith("[") && s.endsWith("]")) {
//       try {
//         const arr = JSON.parse(s);
//         return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [];
//       } catch {
//         return [];
//       }
//     }
//     return s.split(",").map((x) => x.trim()).filter(Boolean);
//   }
//   return [];
// };

// const titleCase = (s?: string | null) =>
//   (s ?? "")
//     .toString()
//     .replace(/\s+/g, " ")
//     .trim()
//     .replace(/\b(bhk)\b/gi, "BHK")
//     .replace(/\b\w/g, (m) => m.toUpperCase());

// const joinNonEmpty = (parts: Array<string | undefined | null>) =>
//   parts.map((x) => (x ?? "").toString().trim()).filter(Boolean).join(" ");

// const formatCurrency = (amount: number) => {
//   if (!Number.isFinite(amount)) return "₹0";
//   if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//   if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//   return `₹${amount.toLocaleString("en-IN")}`;
// };

// const getMatchScoreColor = (score: number) => {
//   if (score >= 90) return "text-green-600 bg-green-100 border-green-200";
//   if (score >= 80) return "text-blue-600 bg-blue-100 border-blue-200";
//   if (score >= 70) return "text-orange-600 bg-orange-100 border-orange-200";
//   return "text-red-600 bg-red-100 border-red-200";
// };

// const getInvestmentPotentialBadge = (
//   potential: "very_high" | "high" | "medium" | "low"
// ) => {
//   const config = {
//     very_high: { bg: "bg-green-100", text: "text-green-700", label: "Very High", icon: "🚀" },
//     high: { bg: "bg-blue-100", text: "text-blue-700", label: "High", icon: "📈" },
//     medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium", icon: "📊" },
//     low: { bg: "bg-gray-100", text: "text-gray-700", label: "Low", icon: "📉" },
//   } as const;
//   const p = config[potential] ?? config.medium;
//   return (
//     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${p.bg} ${p.text}`}>
//       {p.icon} {p.label}
//     </span>
//   );
// };

// const safeJsonArray = (val: unknown) => {
//   if (Array.isArray(val)) return val as any[];
//   if (typeof val === "string") {
//     const s = val.trim();
//     if (!s) return [];
//     if (s.startsWith("[") && s.endsWith("]")) {
//       try { return JSON.parse(s) as any[]; } catch { return []; }
//     }
//     return s.split(",").map((x) => x.trim()).filter(Boolean);
//   }
//   return [];
// };

// // Safer: no random fallback (so duplicates don't appear with different random ids)
// const resolveId = (row: any) =>
//   row?.property_id ?? row?.id ?? row?._id ?? row?.uuid ?? row?.slug ?? null;

// const buildPublicUrl = (p: Property, raw: any): string => {
//   const direct = raw?.website || raw?.url || p.website || p.url;
//   if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);

//   const isBrowser = typeof window !== "undefined";
//   const origin = isBrowser ? window.location.origin : "https://resaleexpert.in";
//   if (p.slug) return `${origin}/properties/${String(p.slug).replace(/^\//, "")}`;
//   return `${origin}/properties/${p.id}`;
// };

// const normalizePhoneForWhatsApp = (phone?: string | null) => {
//   if (!phone) return "";
//   const digits = String(phone).replace(/\D/g, "");
//   if (!digits) return "";
//   if (digits.startsWith("91")) return digits;
//   return digits.length === 10 ? `91${digits}` : digits;
// };

// const inRange = (value: number, min: number, max: number) => value >= min && value <= max;

// const formatPropertyCode = (id: string | number | null | undefined) =>
//   id != null ? `REX00${String(id)}` : "REX00—";

// /* ----------------------------------------------------------------------------
//    Availability status normalization + badge
// ---------------------------------------------------------------------------- */
// function normalizeAvailabilityStatus(row: any): AvailabilityStatus {
//   const isSold = row?.is_sold ?? row?.sold ?? row?.isSold;
//   if (typeof isSold === "boolean") return isSold ? "sold" : "available";
//   if (typeof isSold === "number") return isSold === 1 ? "sold" : "available";

//   const available = row?.available ?? row?.is_available ?? row?.isAvailable;
//   if (typeof available === "boolean") return available ? "available" : "sold";
//   if (typeof available === "number") return available === 1 ? "available" : "sold";

//   const raw =
//     row?.availability_status ??
//     row?.listing_status ??
//     row?.status ??
//     row?.availability ??
//     row?.property_status;

//   const s = String(raw ?? "").trim().toLowerCase();
//   if (["sold", "booked", "unavailable", "not available", "closed"].includes(s)) return "sold";
//   if (["available", "active", "listed", "open", "public"].includes(s)) return "available";

//   return "available";
// }

// const StatusBadge: React.FC<{ status: AvailabilityStatus }> = ({ status }) => {
//   const isAvail = status === "available";
//   const cls = isAvail
//     ? "bg-green-100 text-green-700 ring-1 ring-green-200"
//     : "bg-red-100 text-red-700 ring-1 ring-red-200";
//   const Icon = isAvail ? CheckCircle : XCircle;
//   return (
//     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${cls}`}>
//       <Icon size={10} />
//       {isAvail ? "Available" : "Sold"}
//     </span>
//   );
// };

// /* ----------------------------------------------------------------------------
//    Buyer normalization
// ---------------------------------------------------------------------------- */
// const normalizeBuyer = (raw: BuyerRaw | null | undefined): BuyerNorm | null => {
//   if (!raw) return null;

//   const req = typeof raw.requirements === "string" ? (() => {
//     try { return JSON.parse(raw.requirements); } catch { return {}; }
//   })() : (raw.requirements || {});

//   const preferredLocations =
//     toStrArr(req.preferredLocations).length
//       ? toStrArr(req.preferredLocations)
//       : toStrArr(req.preferredlocations);

//   const unitType =
//     req.unitType !== undefined && req.unitType !== null
//       ? req.unitType
//       : (toStrArr(req.unitTypes).length ? toStrArr(req.unitTypes) : undefined);

//   const city = (req.city || raw.city) ? String(req.city || raw.city) : undefined;

//   const min = toNum(raw?.budget?.min ?? raw?.budget_min ?? 0);
//   const max = toNum(raw?.budget?.max ?? raw?.budget_max ?? 0);

//   return {
//     name: String(raw.name || "Buyer"),
//     leadScore: toNum(raw.leadScore ?? raw.buyer_lead_score ?? raw.lead_score ?? 70),
//     budget: { min, max },
//     requirements: { unitType, preferredLocations, city },
//     city,
//   };
// };

// /* ----------------------------------------------------------------------------
//    Matching Heuristics  (Budget strict; Score is weight-based)
// ---------------------------------------------------------------------------- */
// function normalizeUnitTypeToBHK(s: string) {
//   const m = String(s || "")
//     .replace(/\s+/g, " ")
//     .toLowerCase()
//     .match(/(\d+)\s*(bhk|bed|bedroom)?/i);
//   return m ? m[1] : "";
// }

// function computeMatchScore(p: Property, buyer: BuyerNorm) {
//   const price = p.budget ?? 0;
//   const isBudgetOk = inRange(price, buyer.budget.min, buyer.budget.max);
//   if (!isBudgetOk) return 0;

//   const W_BUDGET = 55;
//   const W_LOCATION = 25;
//   const W_UNIT = 15;
//   const W_EXTRAS = 5;

//   let score = 0;

//   const mid = (buyer.budget.min + buyer.budget.max) / 2;
//   const halfRange = Math.max(1, (buyer.budget.max - buyer.budget.min) / 2);
//   const dist = Math.abs(price - mid);
//   const budgetFrac = Math.max(0, 1 - dist / halfRange);
//   score += Math.round(W_BUDGET * budgetFrac);

//   let locPts = 0;
//   if (buyer.requirements.preferredLocations?.length) {
//     const locs = (p.location || "").toLowerCase();
//     const hit = buyer.requirements.preferredLocations.some((l) =>
//       locs.includes(String(l || "").toLowerCase())
//     );
//     locPts = hit ? W_LOCATION : 0;
//   } else {
//     locPts = Math.round(W_LOCATION * 0.5);
//   }
//   score += locPts;

//   let unitPts = 0;
//   if (buyer.requirements.unitType) {
//     const pu = Array.isArray(buyer.requirements.unitType)
//       ? buyer.requirements.unitType.map(normalizeUnitTypeToBHK)
//       : [normalizeUnitTypeToBHK(String(buyer.requirements.unitType))];

//     const propU = normalizeUnitTypeToBHK(String(p.unitType || ""));
//     const exact = pu.some((x) => x && x === propU);
//     const loose = !exact && pu.some((x) => x && (p.unitType || "").toLowerCase().includes(x));

//     unitPts = exact ? W_UNIT : loose ? Math.round(W_UNIT * 0.6) : 0;
//   } else {
//     unitPts = Math.round(W_UNIT * 0.5);
//   }
//   score += unitPts;

//   const hasPhotos = (p.photos?.length || 0) > 0;
//   const hasAmenities = (p.amenities?.length || 0) > 0;
//   const extrasFrac = (Number(hasPhotos) + Number(hasAmenities)) / 2;
//   score += Math.round(W_EXTRAS * extrasFrac);

//   return Math.max(0, Math.min(100, score));
// }

// function deriveInvestmentPotential(p: Property): "very_high" | "high" | "medium" | "low" {
//   const price = p.budget ?? 0;
//   if (price >= 25000000) return "very_high";
//   if (price >= 18000000) return "high";
//   if (price >= 12000000) return "medium";
//   return "low";
// }

// function estimateRentalYield(p: Property) {
//   const potential = deriveInvestmentPotential(p);
//   switch (potential) {
//     case "very_high": return "2.8%";
//     case "high": return "3.2%";
//     case "medium": return "4.1%";
//     default: return "3.5%";
//   }
// }

// /* ----------------------------------------------------------------------------
//    Tiny Tag chip
// ---------------------------------------------------------------------------- */
// const TagChip: React.FC<{ tag: string }> = ({ tag }) => {
//   const tone = getTagStyle(tag);
//   const isStringEmoji = typeof (tone as any).emoji === "string";
//   const EmojiComp =
//     !isStringEmoji && (tone as any).emoji
//       ? ((tone as any).emoji as React.ComponentType<any>)
//       : null;

//   return (
//     <span
//       className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ring-1 ${(tone as any).bg} ${(tone as any).text} ${(tone as any).ring}`}
//       title={tag}
//     >
//       {EmojiComp ? <EmojiComp size={10} /> : isStringEmoji ? <span>{(tone as any).emoji as string}</span> : null}
//       <span className="capitalize">{tag}</span>
//     </span>
//   );
// };

// /* ----------------------------------------------------------------------------
//    Compose property title
// ---------------------------------------------------------------------------- */
// const composePropertyTitle = (args: {
//   propertyType?: string;
//   unitType?: string;
//   propertySubtype?: string | string[];
//   fallback?: string;
// }) => {
//   const { propertyType, unitType, propertySubtype, fallback } = args;

//   const subtypeJoined = Array.isArray(propertySubtype)
//     ? propertySubtype.filter(Boolean).join(" / ")
//     : propertySubtype;

//   const parts = [
//     titleCase(propertyType),
//     titleCase(unitType),
//     titleCase(subtypeJoined),
//   ];

//   const composed = joinNonEmpty(parts).trim();
//   return composed || (fallback ? String(fallback) : "Untitled Property");
// };

// /* ----------------------------------------------------------------------------
//    Component
// ---------------------------------------------------------------------------- */
// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   buyer: BuyerRaw | null;
//   searchParams?: Parameters<typeof propertiesAPI.searchProperties>[0];
// }

// const PropertySuggestionModal: React.FC<Props> = ({ isOpen, onClose, buyer, searchParams }) => {
//   const buyerN = useMemo(() => normalizeBuyer(buyer), [buyer]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
//   const [filterType, setFilterType] =
//     useState<"all" | "budget_match" | "high_match" | "investment">("all");
//   const [tagsByProperty, setTagsByProperty] = useState<Record<string, string[]>>({});

//   // Share modal
//   const [shareOpen, setShareOpen] = useState(false);
//   const [sharePayload, setSharePayload] = useState<{
//     title?: string;
//     description?: string;
//     image?: string;
//     url?: string;
//     slug?: string;
//     propertyId?: string | number;
//   } | null>(null);

//   // Title (document) built from buyer
//   const prevTitleRef = useRef<string | null>(null);
//   useEffect(() => {
//     if (!isOpen || !buyerN) return;
//     if (typeof document === "undefined") return;

//     prevTitleRef.current = document.title;

//     const min = formatCurrency(buyerN.budget.min);
//     const max = formatCurrency(buyerN.budget.max);
//     const unit =
//       Array.isArray(buyerN.requirements.unitType)
//         ? buyerN.requirements.unitType.join(", ")
//         : (buyerN.requirements.unitType || "Any");
//     const areas = buyerN.requirements.preferredLocations.length
//       ? buyerN.requirements.preferredLocations.join(", ")
//       : (buyerN.requirements.city || buyerN.city || "Any");

//     const parts = [
//       "AI Property Suggestions",
//       unit ? String(unit) : "",
//       areas ? `in ${areas}` : "",
//       `— ${min}–${max}`,
//       "| Resale Expert",
//     ].filter(Boolean).join(" ");

//     document.title = parts;
//     return () => {
//       if (prevTitleRef.current !== null) document.title = prevTitleRef.current;
//     };
//   }, [isOpen, buyerN]);

//   // Fetch properties + tags - ONLY public (is_public = 1 / true / "1")
//   useEffect(() => {
//     if (!isOpen || !buyerN) return;
//     let mounted = true;

//     const run = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         let list: any[] = [];
//         try {
//           if (searchParams) {
//             const resp = await propertiesAPI.searchProperties({
//               ...searchParams,
//             });
//             list = Array.isArray((resp as any)?.data)
//               ? (resp as any).data
//               : Array.isArray(resp) ? (resp as any) : [];
//           } else {
//             const resp = await (propertiesAPI as any).getProperties?.({
//               limit: 200,
//             });
//             list = Array.isArray((resp as any)?.data)
//               ? (resp as any).data
//               : Array.isArray(resp) ? (resp as any) : [];
//           }
//         } catch {
//           // Fallback (public variant)
//           const resp = await (propertiesAPI as any).PublicgetProperties?.({
//             limit: 200,
//           });
//           list = Array.isArray((resp as any)?.data)
//             ? (resp as any).data
//             : Array.isArray(resp) ? (resp as any) : [];
//         }

//         // Keep ONLY public properties (is_public == 1 / true / "1")
//         const publicOnly = (list || []).filter((row: any) => {
//           const v = row?.is_public;
//           return v === 1 || v === "1" || v === true;
//         });

//         const normalized: Property[] = (publicOnly || [])
//           .map((row: any) => {
//             const idResolved = resolveId(row);
//             if (idResolved == null) return null; // skip if no stable id

//             const photos = (() => {
//               const arr = safeJsonArray(row?.photos ?? row?.images ?? row?.media);
//               if (arr.length && typeof arr[0] === "object") {
//                 return arr.map((m: any) => m?.url ?? m?.src ?? "").filter(Boolean);
//               }
//               return arr as string[];
//             })();

//             const propertyType = row.property_type_name || row.property_type || "";
//             const unitType = row.unit_type || row.bhk_label || row.configuration || "";
//             const subtypeRaw = row.property_subtype_name || row.property_subtype || "";

//             const propertySubtypeArr = toStrArr(subtypeRaw);
//             const propertySubtype =
//               propertySubtypeArr.length > 0 ? propertySubtypeArr : (subtypeRaw ? [String(subtypeRaw)] : []);

//             const serverTitle = row.title || row.project_name || row.name || row.property_name || row.society_name;

//             const displayTitle = composePropertyTitle({
//               propertyType: propertyType ? String(propertyType) : undefined,
//               unitType: unitType ? String(unitType) : undefined,
//               propertySubtype,
//               fallback: serverTitle,
//             });

//             const assignedTo =
//               row.assignedTo ||
//               (row.executive_name || row.executive_email || row.executive_phone
//                 ? {
//                     name: row.executive_name || null,
//                     email: row.executive_email || null,
//                     phone: row.executive_phone || null,
//                   }
//                 : null);

//             const status = normalizeAvailabilityStatus(row); // ✅ normalize here

//             return {
//               id: idResolved,
//               title: displayTitle,
//               propertyType: propertyType ? String(propertyType) : undefined,
//               unitType: unitType ? String(unitType) : undefined,
//               propertySubtype,
//               slug: row.slug,
//               photos,
//               city: row.city_name || row.city || row.cityNormalized,
//               location: row.location_name || row.location || row.locationNormalized || row.locality,
//               address: row.address || row.full_address,
//               budget: toNum(row.budget ?? row.final_price ?? row.price ?? row.expected_price ?? 0),
//               carpet_area: toNum(row.carpet_area ?? row.carpetArea ?? row.area ?? 0),
//               amenities: Array.isArray(row.amenities) ? row.amenities : toStrArr(row.amenities),
//               website: row.website || row.url,
//               url: row.url,
//               assignedTo,
//               is_public: row.is_public,
//               status, // ✅ keep normalized status
//             } as Property;
//           })
//           .filter(Boolean) as Property[];

//         // Tags map
//         let tagMap: Record<string, string[]> = {};
//         try {
//           const rows = await (propertyTagsAPI as any).getAll?.();
//           tagMap = (Array.isArray(rows) ? rows : []).reduce((acc: Record<string, string[]>, r: any) => {
//             const key = String(r.property_id ?? r.id ?? "");
//             if (!key) return acc;
//             const tags: string[] = Array.isArray(r.tags)
//               ? r.tags
//               : typeof r.tags === "string"
//               ? r.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
//               : [];
//             if (tags.length) acc[key] = tags;
//             return acc;
//           }, {});
//         } catch {
//           const uniqueIds = Array.from(new Set(normalized.map((p) => String(p.id))));
//           const settled = await Promise.allSettled(
//             uniqueIds.map(async (pid) => {
//               try {
//                 const r = await (propertyTagsAPI as any).getById?.(pid);
//                 const tags = Array.isArray((r as any)?.tags)
//                   ? (r as any).tags
//                   : typeof (r as any)?.tags === "string"
//                   ? (r as any).tags.split(",").map((s: string) => s.trim()).filter(Boolean)
//                   : [];
//                 return { id: pid, tags };
//               } catch {
//                 return { id: pid, tags: [] as string[] };
//               }
//             })
//           );
//           tagMap = settled.reduce((acc, it: any) => {
//             if (it.status === "fulfilled" && it.value) acc[it.value.id] = it.value.tags || [];
//             return acc;
//           }, {} as Record<string, string[]>);
//         }

//         if (mounted) {
//           setProperties(normalized);
//           setTagsByProperty(tagMap);
//         }
//       } catch (e: any) {
//         if (mounted) setError(e?.message || "Failed to load suggestions");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     run();
//   }, [isOpen, buyerN, JSON.stringify(searchParams ?? null)]);

//   // Build suggestion cards
//   const suggestions = useMemo(() => {
//     if (!buyerN) return [] as any[];
//     return properties.map((p) => {
//       const matchScore = computeMatchScore(p, buyerN);
//       const investmentPotential = deriveInvestmentPotential(p);
//       const rentalYield = estimateRentalYield(p);
//       const perSqft =
//         p.carpet_area && p.carpet_area > 0
//           ? Math.max(0, Math.round((p.budget || 0) / p.carpet_area))
//           : 0;

//       const nearbyPlaces = [
//         { name: `${p.location || p.city || "Local"} Metro`, distance: "0.8 km", type: "transport" },
//         { name: "Mall / High Street", distance: "1.5 km", type: "shopping" },
//         { name: "Hospital", distance: "2.0 km", type: "healthcare" },
//       ];

//       const aiReasons: string[] = [];
//       if (p.budget && buyerN && inRange(p.budget, buyerN.budget.min, buyerN.budget.max))
//         aiReasons.push("Perfect budget match within your range");
//       if (
//         p.location &&
//         buyerN.requirements.preferredLocations?.some((l) =>
//           (p.location || "").toLowerCase().includes(String(l).toLowerCase())
//         )
//       ) aiReasons.push("Located in your preferred area");
//       if (p.unitType && buyerN.requirements.unitType) {
//         const pref = buyerN.requirements.unitType;
//         const ok = Array.isArray(pref)
//           ? pref.some((u) => String(p.unitType).toLowerCase().includes(String(u).toLowerCase()))
//           : String(p.unitType).toLowerCase().includes(String(pref).toLowerCase());
//         if (ok) aiReasons.push("Matches your preferred configuration");
//       }
//       if (p.amenities?.length) aiReasons.push("Has your required amenities");

//       const img =
//         p.photos?.[0] ||
//         "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800";

//       const raw = (p as any).raw || (p as any);
//       const publicUrl = buildPublicUrl(p, raw);

//       const propertySubtype =
//         Array.isArray(p.propertySubtype) ? p.propertySubtype.join(" / ") : (p.propertySubtype || "");

//       return {
//         id: String(p.id),
//         propertyCode: formatPropertyCode(p.id),
//         title: p.title,
//         propertyType: p.propertyType || "",
//         unitType: p.unitType || "",
//         propertySubtype,
//         address: (p.address || `${p.location || ""}${p.city ? ", " + p.city : ""}` || "").trim(),
//         price: p.budget || 0,
//         area: p.carpet_area || 0,
//         perSqft,
//         matchScore,
//         aiReasons,
//         highlights: ["Good connectivity", "Growth potential", "Amenities"],
//         rating: 4.7,
//         images: [img],
//         amenities: p.amenities || [],
//         nearbyPlaces,
//         priceHistory: { trend: "up", change: "+3.5%", period: "6 months" },
//         investmentPotential,
//         rentalYield,
//         appreciationRate:
//           investmentPotential === "very_high" ? "10-15%" :
//           investmentPotential === "high"      ? "8-12%"  : "6-9%",
//         raw: p,
//         tags: tagsByProperty[String(p.id)] || [],
//         assignedTo: p.assignedTo || null,
//         publicUrl,
//         slug: p.slug,
//         propertyId: p.id,
//         shareImage: img,
//         status: p.status as AvailabilityStatus, // ✅ carry forward for UI
//       };
//     });
//   }, [properties, buyerN, tagsByProperty]);

//   // 🔒 STRICT BUDGET FILTER (applies to ALL tabs)
//   const filteredSuggestions = useMemo(() => {
//     if (!buyerN) return [] as any[];

//     const withinBudget = (prop: any) =>
//       inRange(prop.price || 0, buyerN.budget.min, buyerN.budget.max);

//     const base = suggestions.filter(withinBudget);

//     const byTab = (() => {
//       switch (filterType) {
//         case "budget_match":
//           return base;
//         case "high_match":
//           return base.filter((p) => p.matchScore >= 85);
//         case "investment":
//           return base.filter((p) => p.investmentPotential === "high" || p.investmentPotential === "very_high");
//         case "all":
//         default:
//           return base;
//       }
//     })();

//     // Sort: higher score first, then lower price
//     return byTab.sort((a, b) => (b.matchScore - a.matchScore) || ((a.price || 0) - (b.price || 0)));
//   }, [suggestions, filterType, buyerN]);

//   const handlePropertySelection = (propertyId: string) => {
//     setSelectedProperties((prev) =>
//       prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
//     );
//   };

//   const handleScheduleVisit = (property: any) => {
//     alert(`Visit scheduled for ${property.title}. You will receive confirmation shortly.`);
//   };

//   const handleSaveToShortlist = (property: any) => {
//     alert(`${property.title} added to your shortlist!`);
//   };

//   const handleRequestMoreInfo = (property: any) => {
//     alert(`More information requested for ${property.title}. Executive will be notified.`);
//   };

//   const handleContactExecutive = (property: any) => {
//     const phone = property.assignedTo?.phone || "";
//     const wa = normalizePhoneForWhatsApp(phone);
//     if (!wa) return alert("Executive phone not available.");
//     const message = `Hi ${property.assignedTo?.name || "there"}, I'm interested in "${property.title}". My budget is ${formatCurrency(
//       (buyerN?.budget.min ?? 0)
//     )} - ${formatCurrency(buyerN?.budget.max ?? 0)}. Can we schedule a visit?`;
//     if (typeof window !== "undefined") {
//       window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
//     }
//   };

//   const openShareFor = (property: any) => {
//     setSharePayload({
//       title: property.title,
//       description: property.address || "",
//       image: property.shareImage,
//       url: property.publicUrl,
//       slug: property.slug,
//       propertyId: property.propertyId,
//     });
//     setShareOpen(true);
//   };

//   if (!isOpen || !buyerN) return null;

//   // UI fields from normalized buyer
//   const buyerName = buyerN.name || "Buyer";
//   const budgetMin = buyerN.budget.min;
//   const budgetMax = buyerN.budget.max;
//   const prefUnits = Array.isArray(buyerN.requirements.unitType)
//     ? buyerN.requirements.unitType.join(", ")
//     : buyerN.requirements.unitType || "Any";
//   const prefAreas = buyerN.requirements.preferredLocations.length
//     ? buyerN.requirements.preferredLocations.join(", ")
//     : buyerN.requirements.city || buyerN.city || "Any";
//   const buyerLeadScore = buyerN.leadScore ?? 70;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden text-xs">
//         {/* Header */}
//         <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <div className="p-2 bg-purple-100 rounded-lg">
//                 <Target className="text-purple-600" size={18} />
//               </div>
//               <div>
//                 <h2 className="font-bold text-gray-900">AI Property Suggestions</h2>
//                 <p className="text-gray-600 mt-0.5">Personalized recommendations for {buyerName}</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-1.5 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-md"
//               aria-label="Close"
//             >
//               <X size={16} />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="p-4 max-h-[80vh] overflow-y-auto">
//           {/* Buyer Profile */}
//           <div className="bg-purple-50 rounded-lg p-3 mb-4">
//             <div className="flex items-center justify-between">
//               <h3 className="font-semibold text-purple-900">Buyer Profile</h3>
//               <div className="text-xs text-purple-800">
//                 Lead Score: <span className="font-bold">{buyerLeadScore}/100</span>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
//               <div>
//                 <span className="text-purple-600">Budget:</span>
//                 <span className="font-bold text-purple-900 ml-1">
//                   {formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-purple-600">Preferred Units:</span>
//                 <span className="font-bold text-purple-900 ml-1">{prefUnits}</span>
//               </div>
//               <div className="col-span-2 md:col-span-1">
//                 <span className="text-purple-600">Preferred Areas:</span>
//                 <span className="font-bold text-purple-900 ml-1 truncate inline-block max-w-[12rem]" title={prefAreas}>
//                   {prefAreas}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-purple-600">City:</span>
//                 <span className="font-bold text-purple-900 ml-1">
//                   {buyerN.requirements.city || buyerN.city || "Any"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Filter */}
//           <div className="flex items-center space-x-2 mb-4 flex-wrap gap-1">
//             <span className="font-medium text-gray-700">Filter by:</span>
//             {[
//               { id: "all", label: "All" },
//               { id: "budget_match", label: "Budget Match" },
//               { id: "high_match", label: "High Match" },
//               { id: "investment", label: "Best Investment" },
//             ].map((filter) => (
//               <button
//                 key={filter.id}
//                 onClick={() => setFilterType(filter.id as any)}
//                 className={`px-2 py-1 rounded-full font-medium transition-colors ${
//                   filterType === (filter.id as any)
//                     ? "bg-purple-100 text-purple-700"
//                     : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                 }`}
//               >
//                 {filter.label}
//               </button>
//             ))}
//           </div>

//           {/* Loading / Error */}
//           {loading && <div className="text-center text-gray-600 py-6">Loading suggestions…</div>}
//           {error && !loading && <div className="text-center text-red-600 py-6">{error}</div>}

//           {/* Suggestions */}
//           {!loading && !error && (
//             <div className="space-y-4">
//               {filteredSuggestions.map((property: any) => (
//                 <div
//                   key={property.id}
//                   className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
//                 >
//                   <div className="p-4">
//                     <div className="flex items-start space-x-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedProperties.includes(property.id)}
//                         onChange={() => handlePropertySelection(property.id)}
//                         className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                         aria-label={`Select ${property.title}`}
//                       />

//                       <img
//                         src={property.images[0]}
//                         alt={property.title}
//                         className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
//                         onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
//                       />

//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between mb-2">
//                           <div className="min-w-0">
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <h4 className="font-bold text-gray-900 truncate">{property.title}</h4>
//                               {/* Property Code Badge */}
//                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 text-[10px]">
//                                 <Hash size={10} />
//                                 {property.propertyCode}
//                               </span>
//                               {/* ✅ Availability Status */}
//                               <StatusBadge status={property.status as AvailabilityStatus} />
//                             </div>

//                             <div className="flex items-center space-x-1 text-gray-600 mt-0.5">
//                               <MapPin size={12} />
//                               <span className="truncate">{property.address || "—"}</span>
//                             </div>

//                             <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
//                               <div className={`px-2 py-0.5 rounded-full border ${getMatchScoreColor(property.matchScore)}`}>
//                                 {property.matchScore}% Match
//                               </div>
//                               {getInvestmentPotentialBadge(property.investmentPotential)}
//                               <div className="flex items-center space-x-0.5">
//                                 {Array.from({ length: 5 }, (_, i) => {
//                                   const filled = i < Math.round(Math.min(5, Math.max(0, property.rating)));
//                                   return (
//                                     <Star
//                                       key={i}
//                                       size={10}
//                                       className={filled ? "text-yellow-400 fill-current" : "text-gray-300"}
//                                     />
//                                   );
//                                 })}
//                                 <span className="text-gray-600 ml-0.5">({property.rating})</span>
//                               </div>
//                             </div>

//                             {!!property.tags?.length && (
//                               <div className="mt-2 flex flex-wrap gap-1">
//                                 {property.tags.map((t: string, idx: number) => (
//                                   <TagChip key={`${t}-${idx}`} tag={t} />
//                                 ))}
//                               </div>
//                             )}
//                           </div>

//                           <div className="text-right flex-shrink-0 pl-2">
//                             <div className="font-bold text-green-600">{formatCurrency(property.price)}</div>
//                             <div className="text-gray-500">{property.area || 0} sq ft</div>
//                             <div className="text-gray-500 mt-0.5">
//                               {property.perSqft > 0 ? `₹${property.perSqft.toLocaleString()}/sq ft` : "—"}
//                             </div>
//                           </div>
//                         </div>

//                         {property.aiReasons?.length > 0 && (
//                           <div className="mb-3">
//                             <h5 className="font-medium text-gray-900 mb-1 flex items-center">
//                               <Bot className="mr-1 text-blue-600" size={12} />
//                               Why AI recommends:
//                             </h5>
//                             <div className="space-y-0.5">
//                               {(property.aiReasons as string[]).slice(0, 2).map((reason: string, index: number) => (
//                                 <div key={index} className="flex items-start space-x-1">
//                                   <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={10} />
//                                   <span className="text-gray-700">{reason}</span>
//                                 </div>
//                               ))}
//                               {property.aiReasons.length > 2 && (
//                                 <div className="text-blue-600 cursor-pointer hover:underline">
//                                   +{property.aiReasons.length - 2} more reasons
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         )}

//                         <div className="grid grid-cols-3 gap-2 mb-3">
//                           <div className="bg-green-50 rounded p-2">
//                             <div className="flex items-center space-x-1">
//                               <TrendingUp className="text-green-600" size={10} />
//                               <span className="font-medium text-green-800">Price Trend</span>
//                             </div>
//                             <div className="font-bold text-green-900">{property.priceHistory.change}</div>
//                             <div className="text-green-700">{property.priceHistory.period}</div>
//                           </div>
//                           <div className="bg-blue-50 rounded p-2">
//                             <div className="flex items-center space-x-1">
//                               <Percent className="text-blue-600" size={10} />
//                               <span className="font-medium text-blue-800">Rental Yield</span>
//                             </div>
//                             <div className="font-bold text-blue-900">{property.rentalYield}</div>
//                             <div className="text-blue-700">per annum</div>
//                           </div>
//                           <div className="bg-purple-50 rounded p-2">
//                             <div className="flex items-center space-x-1">
//                               <Award className="text-purple-600" size={10} />
//                               <span className="font-medium text-purple-800">Appreciation</span>
//                             </div>
//                             <div className="font-bold text-purple-900">{property.appreciationRate}</div>
//                             <div className="text-purple-700">expected</div>
//                           </div>
//                         </div>

//                         <div className="mb-3 p-2 bg-gray-50 rounded">
//                           <div className="flex items-center justify-between">
//                             <div className="min-w-0">
//                               <div className="font-medium text-gray-900 truncate">
//                                 Executive: {property?.assignedTo?.name || "—"}
//                               </div>
//                               <div className="text-gray-600 truncate">{property?.assignedTo?.email || "—"}</div>
//                               <div className="text-gray-600">{property?.assignedTo?.phone || "—"}</div>
//                             </div>
//                             <div className="flex items-center space-x-0.5">
//                               <Star className="text-yellow-400 fill-current" size={10} />
//                               <span className="font-medium">{property.rating}</span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="mb-3">
//                           <h6 className="font-medium text-gray-700 mb-1">Nearby Places</h6>
//                           <div className="grid grid-cols-3 gap-1">
//                             {property.nearbyPlaces.slice(0, 3).map((place: any, index: number) => (
//                               <div key={index} className="bg-gray-50 p-1 rounded">
//                                 <div className="font-medium text-gray-900 truncate">{place.name}</div>
//                                 <div className="text-gray-600">
//                                   {place.distance} • {place.type}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         <div className="flex items-center space-x-1 flex-wrap gap-1">
//                           <button
//                             onClick={() => handleScheduleVisit(property)}
//                             className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//                             disabled={property.status === "sold"}
//                             title={property.status === "sold" ? "This property is sold" : "Schedule a visit"}
//                           >
//                             <Calendar size={12} />
//                             <span>Visit</span>
//                           </button>

//                           <button
//                             onClick={() => handleSaveToShortlist(property)}
//                             className="flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
//                             disabled={property.status === "sold"}
//                             title={property.status === "sold" ? "This property is sold" : "Add to shortlist"}
//                           >
//                             <Heart size={12} />
//                             <span>Shortlist</span>
//                           </button>

//                           <button
//                             onClick={() => handleRequestMoreInfo(property)}
//                             className="flex items-center space-x-1 px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
//                           >
//                             <ShareIcon size={12} />
//                             <span>Info</span>
//                           </button>

//                           {property?.assignedTo?.phone && (
//                             <button
//                               onClick={() => handleContactExecutive(property)}
//                               className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
//                             >
//                               <MessageCircle size={12} />
//                               <span>WhatsApp</span>
//                             </button>
//                           )}

//                           <a
//                             href={property.publicUrl}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
//                           >
//                             <ExternalLink size={12} />
//                             <span>Visit Website</span>
//                           </a>

//                           <button
//                             onClick={() => openShareFor(property)}
//                             className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
//                           >
//                             <ShareIcon size={12} />
//                             <span>Share</span>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {!filteredSuggestions.length && (
//                 <div className="text-center text-gray-500 py-8">
//                   No suggestions match your budget and filters.
//                 </div>
//               )}
//             </div>
//           )}

//           {/* AI Insights */}
//           {!loading && !error && (
//             <div className="mt-6 bg-blue-50 rounded-lg p-4">
//               <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
//                 <Bot className="mr-1" size={16} />
//                 AI Insights
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                 <div className="bg-white rounded p-2">
//                   <h4 className="font-medium text-gray-900 mb-1">Market Recommendation</h4>
//                   <p className="text-gray-700">Top localities in your preferences show healthy demand with stable pricing.</p>
//                 </div>
//                 <div className="bg-white rounded p-2">
//                   <h4 className="font-medium text-gray-900 mb-1">Timing Advice</h4>
//                   <p className="text-gray-700">Conditions are favorable for buyers—shortlist and schedule site visits soon.</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="p-4 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-gray-500">
//               {filteredSuggestions.length} properties • {selectedProperties.length} selected
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={onClose}
//                 className="px-3 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
//               >
//                 Close
//               </button>
//               {selectedProperties.length > 0 && (
//                 <button className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
//                   <Heart size={14} />
//                   <span>Save {selectedProperties.length}</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Share Modal */}
//       {shareOpen && sharePayload && (
//         <ShareModal
//           onClose={() => setShareOpen(false)}
//           url={sharePayload.url}
//           propertyId={sharePayload.propertyId}
//           slug={String(sharePayload.slug || "")}
//           trackingToken={undefined}
//           absoluteBase={undefined}
//           title={sharePayload.title}
//           description={sharePayload.description}
//           image={sharePayload.image}
//         />
//       )}
//     </div>
//   );
// };

// export default PropertySuggestionModal;
// src/components/properties/PropertySuggestionModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Target,
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Share as ShareIcon,
  Heart,
  CheckCircle,
  TrendingUp,
  Award,
  Percent,
  Bot,
  ExternalLink,
  Hash,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import propertiesAPI from "@/lib/propertiesAPI";
import propertyTagsAPI from "@/lib/propertyTagsAPI";
import getTagStyle from "@/lib/tagStyles";
import ShareModal from "@/pages/public/ShareModal";

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* ----------------------------------------------------------------------------
   Types (ALL KEPT INTACT)
---------------------------------------------------------------------------- */
type BuyerRaw = any;

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

type AvailabilityStatus = "available" | "sold";

export type Property = {
  id: string | number;
  title?: string;
  propertyType?: string;
  unitType?: string;
  propertySubtype?: string | string[];
  slug?: string;
  photos?: string[];
  city?: string;
  location?: string;
  address?: string;
  budget?: number;
  carpet_area?: number;
  amenities?: string[];
  website?: string;
  url?: string;
  assignedTo?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  is_public?: boolean | 0 | 1 | "0" | "1";
  status?: AvailabilityStatus;
};

/* ----------------------------------------------------------------------------
   Helpers (ALL KEPT INTACT - just UI changes)
---------------------------------------------------------------------------- */
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
  if (score >= 90) return `text-emerald-700 bg-emerald-100 border-emerald-200`;
  if (score >= 80) return `text-blue-700 bg-blue-100 border-blue-200`;
  if (score >= 70) return `text-orange-700 bg-orange-100 border-orange-200`;
  return `text-red-700 bg-red-100 border-red-200`;
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

const resolveId = (row: any) =>
  row?.property_id ?? row?.id ?? row?._id ?? row?.uuid ?? row?.slug ?? null;

const buildPublicUrl = (p: Property, raw: any): string => {
  const direct = raw?.website || raw?.url || p.website || p.url;
  if (direct && /^https?:\/\//i.test(String(direct))) return String(direct);

  const isBrowser = typeof window !== "undefined";
  const origin = isBrowser ? window.location.origin : "https://resaleexpert.in";
  if (p.slug) return `${origin}/properties/${String(p.slug).replace(/^\//, "")}`;
  return `${origin}/properties/${p.id}`;
};

const normalizePhoneForWhatsApp = (phone?: string | null) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91")) return digits;
  return digits.length === 10 ? `91${digits}` : digits;
};

const inRange = (value: number, min: number, max: number) => value >= min && value <= max;

const formatPropertyCode = (id: string | number | null | undefined) =>
  id != null ? `REX00${String(id)}` : "REX00—";

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

const StatusBadge: React.FC<{ status: AvailabilityStatus }> = ({ status }) => {
  const isAvail = status === "available";
  const cls = isAvail
    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-red-100 text-red-700 ring-1 ring-red-200";
  const Icon = isAvail ? CheckCircle : XCircle;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${cls}`}>
      <Icon size={9} />
      {isAvail ? "Available" : "Sold"}
    </span>
  );
};

const normalizeBuyer = (raw: BuyerRaw | null | undefined): BuyerNorm | null => {
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

function computeMatchScore(p: Property, buyer: BuyerNorm) {
  const price = p.budget ?? 0;
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
    const locs = (p.location || "").toLowerCase();
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

  const hasPhotos = (p.photos?.length || 0) > 0;
  const hasAmenities = (p.amenities?.length || 0) > 0;
  const extrasFrac = (Number(hasPhotos) + Number(hasAmenities)) / 2;
  score += Math.round(W_EXTRAS * extrasFrac);

  return Math.max(0, Math.min(100, score));
}

function deriveInvestmentPotential(p: Property): "very_high" | "high" | "medium" | "low" {
  const price = p.budget ?? 0;
  if (price >= 25000000) return "very_high";
  if (price >= 18000000) return "high";
  if (price >= 12000000) return "medium";
  return "low";
}

function estimateRentalYield(p: Property) {
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

const composePropertyTitle = (args: {
  propertyType?: string;
  unitType?: string;
  propertySubtype?: string | string[];
  fallback?: string;
}) => {
  const { propertyType, unitType, propertySubtype, fallback } = args;

  const subtypeJoined = Array.isArray(propertySubtype)
    ? propertySubtype.filter(Boolean).join(" / ")
    : propertySubtype;

  const parts = [
    titleCase(propertyType),
    titleCase(unitType),
    titleCase(subtypeJoined),
  ];

  const composed = joinNonEmpty(parts).trim();
  return composed || (fallback ? String(fallback) : "Untitled Property");
};

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

/* ----------------------------------------------------------------------------
   Component
---------------------------------------------------------------------------- */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  buyer: BuyerRaw | null;
  searchParams?: Parameters<typeof propertiesAPI.searchProperties>[0];
}

const PropertySuggestionModal: React.FC<Props> = ({ isOpen, onClose, buyer, searchParams }) => {
  const buyerN = useMemo(() => normalizeBuyer(buyer), [buyer]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterType, setFilterType] =
    useState<"all" | "budget_match" | "high_match" | "investment">("all");
  const [tagsByProperty, setTagsByProperty] = useState<Record<string, string[]>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<{
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    slug?: string;
    propertyId?: string | number;
  } | null>(null);

  const prevTitleRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isOpen || !buyerN) return;
    if (typeof document === "undefined") return;

    prevTitleRef.current = document.title;

    const min = formatCurrency(buyerN.budget.min);
    const max = formatCurrency(buyerN.budget.max);
    const unit =
      Array.isArray(buyerN.requirements.unitType)
        ? buyerN.requirements.unitType.join(", ")
        : (buyerN.requirements.unitType || "Any");
    const areas = buyerN.requirements.preferredLocations.length
      ? buyerN.requirements.preferredLocations.join(", ")
      : (buyerN.requirements.city || buyerN.city || "Any");

    const parts = [
      "AI Property Suggestions",
      unit ? String(unit) : "",
      areas ? `in ${areas}` : "",
      `— ${min}–${max}`,
      "| Resale Expert",
    ].filter(Boolean).join(" ");

    document.title = parts;
    return () => {
      if (prevTitleRef.current !== null) document.title = prevTitleRef.current;
    };
  }, [isOpen, buyerN]);

  useEffect(() => {
    if (!isOpen || !buyerN) return;
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        let list: any[] = [];
        try {
          if (searchParams) {
            const resp = await propertiesAPI.searchProperties({
              ...searchParams,
            });
            list = Array.isArray((resp as any)?.data)
              ? (resp as any).data
              : Array.isArray(resp) ? (resp as any) : [];
          } else {
            const resp = await (propertiesAPI as any).getProperties?.({
              limit: 200,
            });
            list = Array.isArray((resp as any)?.data)
              ? (resp as any).data
              : Array.isArray(resp) ? (resp as any) : [];
          }
        } catch {
          const resp = await (propertiesAPI as any).PublicgetProperties?.({
            limit: 200,
          });
          list = Array.isArray((resp as any)?.data)
            ? (resp as any).data
            : Array.isArray(resp) ? (resp as any) : [];
        }

        const publicOnly = (list || []).filter((row: any) => {
          const v = row?.is_public;
          return v === 1 || v === "1" || v === true;
        });

        const normalized: Property[] = (publicOnly || [])
          .map((row: any) => {
            const idResolved = resolveId(row);
            if (idResolved == null) return null;

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

            const displayTitle = composePropertyTitle({
              propertyType: propertyType ? String(propertyType) : undefined,
              unitType: unitType ? String(unitType) : undefined,
              propertySubtype,
              fallback: serverTitle,
            });

            const assignedTo =
              row.assignedTo ||
              (row.executive_name || row.executive_email || row.executive_phone
                ? {
                  name: row.executive_name || null,
                  email: row.executive_email || null,
                  phone: row.executive_phone || null,
                }
                : null);

            const status = normalizeAvailabilityStatus(row);

            return {
              id: idResolved,
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
              is_public: row.is_public,
              status,
            } as Property;
          })
          .filter(Boolean) as Property[];

        let tagMap: Record<string, string[]> = {};
        try {
          const rows = await (propertyTagsAPI as any).getAll?.();
          tagMap = (Array.isArray(rows) ? rows : []).reduce((acc: Record<string, string[]>, r: any) => {
            const key = String(r.property_id ?? r.id ?? "");
            if (!key) return acc;
            const tags: string[] = Array.isArray(r.tags)
              ? r.tags
              : typeof r.tags === "string"
                ? r.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [];
            if (tags.length) acc[key] = tags;
            return acc;
          }, {});
        } catch {
          const uniqueIds = Array.from(new Set(normalized.map((p) => String(p.id))));
          const settled = await Promise.allSettled(
            uniqueIds.map(async (pid) => {
              try {
                const r = await (propertyTagsAPI as any).getById?.(pid);
                const tags = Array.isArray((r as any)?.tags)
                  ? (r as any).tags
                  : typeof (r as any)?.tags === "string"
                    ? (r as any).tags.split(",").map((s: string) => s.trim()).filter(Boolean)
                    : [];
                return { id: pid, tags };
              } catch {
                return { id: pid, tags: [] as string[] };
              }
            })
          );
          tagMap = settled.reduce((acc, it: any) => {
            if (it.status === "fulfilled" && it.value) acc[it.value.id] = it.value.tags || [];
            return acc;
          }, {} as Record<string, string[]>);
        }

        if (mounted) {
          setProperties(normalized);
          setTagsByProperty(tagMap);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load suggestions");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();
  }, [isOpen, buyerN, JSON.stringify(searchParams ?? null)]);

  const suggestions = useMemo(() => {
    if (!buyerN) return [] as any[];
    return properties.map((p) => {
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

      const raw = (p as any).raw || (p as any);
      const publicUrl = buildPublicUrl(p, raw);

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
            investmentPotential === "high" ? "8-12%" : "6-9%",
        raw: p,
        tags: tagsByProperty[String(p.id)] || [],
        assignedTo: p.assignedTo || null,
        publicUrl,
        slug: p.slug,
        propertyId: p.id,
        shareImage: img,
        status: p.status as AvailabilityStatus,
      };
    });
  }, [properties, buyerN, tagsByProperty]);

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

    return byTab.sort((a, b) => (b.matchScore - a.matchScore) || ((a.price || 0) - (b.price || 0)));
  }, [suggestions, filterType, buyerN]);

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
      (buyerN?.budget.min ?? 0)
    )} - ${formatCurrency(buyerN?.budget.max ?? 0)}. Can we schedule a visit?`;
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    }
  };

  const openShareFor = (property: any) => {
    setSharePayload({
      title: property.title,
      description: property.address || "",
      image: property.shareImage,
      url: property.publicUrl,
      slug: property.slug,
      propertyId: property.propertyId,
    });
    setShareOpen(true);
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>

        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <Bot size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Property Suggestions</h2>
              <p className="text-[9px] text-white/70">Personalized recommendations for {buyerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>

          {/* Buyer Profile */}
          <div className="rounded-lg p-2.5 mb-3" style={{ background: `${O}5`, border: `1px solid ${O}20` }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[10px] font-bold" style={{ color: O }}>Buyer Profile</h3>
              <div className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${O}15`, color: O }}>
                Lead Score: <span className="font-bold">{buyerLeadScore}/100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1.5 text-[9px]">
              <div><span style={{ color: MU }}>Budget:</span> <span className="font-bold" style={{ color: N }}>{formatCurrency(budgetMin)} - {formatCurrency(budgetMax)}</span></div>
              <div><span style={{ color: MU }}>Units:</span> <span className="font-bold truncate" style={{ color: N }}>{prefUnits}</span></div>
              <div className="col-span-2"><span style={{ color: MU }}>Areas:</span> <span className="font-bold truncate" style={{ color: N }}>{prefAreas}</span></div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[8px] font-medium" style={{ color: MU }}>Filter by:</span>
            {[
              { id: "all", label: "All" },
              { id: "budget_match", label: "Budget" },
              { id: "high_match", label: "High Match" },
              { id: "investment", label: "Investment" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id as any)}
                className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium transition-all ${filterType === (filter.id as any)
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                style={filterType === (filter.id as any) ? { background: O } : {}}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Loading / Error */}
          {loading && <div className="text-center py-6 text-[10px]" style={{ color: MU }}>Loading suggestions…</div>}
          {error && !loading && <div className="text-center py-6 text-[10px]" style={{ color: '#dc2626' }}>{error}</div>}

          {/* Suggestions */}
          {!loading && !error && (
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
                            <div className="flex items-center gap-0.5">
                              <TrendingUp size={7} style={{ color: O }} />
                              <span className="text-[6px] font-medium" style={{ color: MU }}>Price Trend</span>
                            </div>
                            <div className="text-[8px] font-bold" style={{ color: O }}>{property.priceHistory.change}</div>
                            <div className="text-[6px]" style={{ color: MU }}>{property.priceHistory.period || "6 months"}</div>
                          </div>

                          <div className="rounded p-1" style={{ background: `${O}5` }}>
                            <div className="flex items-center gap-0.5">
                              <Percent size={7} style={{ color: O }} />
                              <span className="text-[6px] font-medium" style={{ color: MU }}>Rental Yield</span>
                            </div>
                            <div className="text-[8px] font-bold" style={{ color: O }}>{property.rentalYield}</div>
                            <div className="text-[6px]" style={{ color: MU }}>per annum</div>
                          </div>

                          <div className="rounded p-1" style={{ background: `${O}5` }}>
                            <div className="flex items-center gap-0.5">
                              <Award size={7} style={{ color: O }} />
                              <span className="text-[6px] font-medium" style={{ color: MU }}>Appreciation</span>
                            </div>
                            <div className="text-[8px] font-bold" style={{ color: O }}>{property.appreciationRate}</div>
                            <div className="text-[6px]" style={{ color: MU }}>expected</div>
                          </div>
                        </div>

                        {/* Executive Info */}
                        <div className="mt-1.5 p-1 rounded" style={{ background: BG }}>
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <div className="text-[7px] truncate" style={{ color: MU }}>
                              Executive: <span className="font-medium" style={{ color: N }}>{property?.assignedTo?.name || "—"}</span>
                              <div className="text-gray-600 truncate">{property?.assignedTo?.email || "—"}</div>

                              {property?.assignedTo?.phone && <span className="ml-1"> {property.assignedTo.phone}</span>}
                            </div>
                            <div className="flex items-center gap-0.5"><Star size={7} className="fill-current" style={{ color: '#eab308' }} /><span className="text-[7px] font-medium">{property.rating}</span></div>
                          </div>
                        </div>

                        {/* Nearby Places */}
                        <div className="mt-1.5">
                          <div className="text-[6px] font-medium mb-0.5" style={{ color: MU }}>Nearby Places</div>
                          <div className="grid grid-cols-3 gap-0.5">
                            {property.nearbyPlaces.slice(0, 3).map((place: any, index: number) => (
                              <div key={index} className="rounded p-0.5 text-[6px]" style={{ background: BG }}>
                                <div className="font-medium truncate" style={{ color: N }}>{place.name}</div>
                                <div style={{ color: MU }}>{place.distance}</div>
                              </div>
                            ))}
                          </div>
                        </div>

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
                          {property?.assignedTo?.phone && (
                            <button
                              onClick={() => handleContactExecutive(property)}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium text-white transition-all hover:opacity-80"
                              style={{ background: '#25D366' }}
                            >
                              <MessageCircle size={8} /> WhatsApp
                            </button>
                          )}
                          <button
                            onClick={() => handleRequestMoreInfo(property)}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80"
                            style={{ background: `${O}10`, color: O }}
                          >
                            <ShareIcon size={8} /> More Info
                          </button>
                          <button
                            onClick={() => openShareFor(property)}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80"
                            style={{ background: `${O}10`, color: O }}
                          >
                            <ShareIcon size={8} /> Share
                          </button>
                          <a
                            href={property.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-medium transition-all hover:opacity-80"
                            style={{ background: BG, color: N }}
                          >
                            <ExternalLink size={8} /> View Website
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!filteredSuggestions.length && (
                <div className="text-center py-8 text-[10px]" style={{ color: MU }}>
                  No suggestions match your budget and filters.
                </div>
              )}
            </div>
          )}

          {/* AI Insights Footer */}
          {!loading && !error && filteredSuggestions.length > 0 && (
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
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="text-[8px]" style={{ color: MU }}>
            {filteredSuggestions.length} properties • {selectedProperties.length} selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-2 py-1 text-[8px] font-medium rounded-lg transition-all hover:bg-gray-50"
              style={{ border: `1px solid ${BD}`, color: N }}
            >
              Close
            </button>
            {selectedProperties.length > 0 && (
              <button className="flex items-center gap-0.5 px-2 py-1 text-[8px] font-medium text-white rounded-lg transition-all hover:opacity-80" style={{ background: O }}>
                <Heart size={8} />
                <span>Save {selectedProperties.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareOpen && sharePayload && (
        <ShareModal
          onClose={() => setShareOpen(false)}
          url={sharePayload.url}
          propertyId={sharePayload.propertyId}
          slug={String(sharePayload.slug || "")}
          trackingToken={undefined}
          absoluteBase={undefined}
          title={sharePayload.title}
          description={sharePayload.description}
          image={sharePayload.image}
        />
      )}
    </div>
  );
};

export default PropertySuggestionModal;