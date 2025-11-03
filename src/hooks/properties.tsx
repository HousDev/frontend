import { propertiesAPI } from "@/lib/propertiesAPI";
import { useState, useEffect, useCallback } from "react";

type UsePropertiesOptions = {
  /** console logs on properties / error / loading changes */
  autoLog?: boolean; // default: true
  /** return only public properties (client-side filter) */
  publicOnly?: boolean; // default: false
};

export function useProperties(options: UsePropertiesOptions = {}) {
  const { autoLog = true, publicOnly = false } = options;

  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propsError, setPropsError] = useState<string | null>(null);

  /* ---------------- helpers (utils) ---------------- */
  const toArr = (v: any) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
  const norm = (s: any) => String(s ?? "").toLowerCase().trim();
  const hasAny = (haystack: string[], needles: string[]) =>
    needles.some((n) => haystack.some((h) => h.includes(n)));

  const toBool = (v: any) => {
    if (typeof v === "boolean") return v;
    if (v == null) return false;
    const s = norm(v);
    return s === "1" || s === "true" || s === "yes" || s === "y";
  };

  const formatCurrency = (amount?: number) => {
    const n = Number(amount);
    if (!n || isNaN(n)) return "₹—";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  const getAvailabilityBadgeClass = (status: string) => {
    const map: Record<string, string> = {
      Available: "bg-emerald-100 text-emerald-700",
      Sold: "bg-red-100 text-red-700",
      "Under Negotiation": "bg-amber-100 text-amber-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const unitTypeFrom = (p: any) =>
    norm(p?.unit_type || p?.bhk || p?.configuration || p?.bhk_label || p?.unit_types);

  const locTokensFrom = (p: any) =>
    [norm(p?.locality_name), norm(p?.location_name), norm(p?.address), norm(p?.city_name || p?.city)].filter(Boolean);

  const amenitiesFrom = (p: any) => (Array.isArray(p?.amenities) ? p.amenities : []).map(norm);
  const furnishingFrom = (p: any) => norm(p?.furnishing || p?.furnished_status);

  // broader catch for type/subtype
  const propTypeFrom = (p: any) =>
    norm(
      p?.property_subtype_name ||
        p?.property_sub_type ||
        p?.property_subtype ||
        p?.subtype ||
        p?.property_type_name ||
        p?.property_type ||
        p?.type ||
        ""
    );

  const descriptionFrom = (p: any) => norm(p?.description || p?.title || "");

  /** Title: PropertyType + UnitType + PropertySubType — SocietyName */
  const titleFrom = (p: any) => {
    const propertyType =
      String(
        p?.property_type_name ||
          p?.property_type ||
          p?.type ||
          p?.category ||
          p?.type_name ||
          ""
      ).trim();

    const unit =
      String(p?.unit_type || p?.bhk || p?.configuration || p?.bhk_label || p?.unit_types || "").trim();

    const subType =
      String(
        p?.property_subtype_name ||
          p?.property_sub_type ||
          p?.property_subtype ||
          p?.subtype ||
          ""
      ).trim();

    const society =
      String(p?.society_name || p?.project_name || p?.society || p?.societyName || p?.location_name || "").trim();

    const leftParts = [propertyType, unit, subType].filter(Boolean);
    const left = leftParts.length ? leftParts.join(" + ") : (p?.title || "Property");
    return [left, society].filter(Boolean).join(" — ");
  };

  const addressFrom = (p: any) =>
    p?.address || [p?.location_name || p?.locality_name, p?.city_name || p?.city].filter(Boolean).join(", ");

  const priceFrom = (p: any) => Number(p?.budget ?? p?.price ?? p?.expected_price ?? 0);

  const priceRangeFrom = (p: any) => {
    const min = Number(p?.min_price ?? p?.budget_min ?? p?.minBudget ?? 0);
    const max = Number(p?.max_price ?? p?.budget_max ?? p?.maxBudget ?? 0);
    return { min, max };
  };

  const sizeFrom = (p: any) => {
    const unit = p?.unit_type || p?.bhk_label || p?.unit_types || "";
    const area = Number(p?.carpet_area ?? p?.area ?? p?.super_builtup_area ?? 0);
    const areaTxt = area ? `${Number(area).toLocaleString("en-IN")} sq ft` : "";
    return [unit, areaTxt].filter(Boolean).join(" • ");
  };

  const floorLine = (p: any) => {
    const f = p?.floor ?? p?.floor_no ?? p?.floor_number;
    const total = p?.total_floors ?? p?.totalFloors;
    // normalize nicely like "Floor 7 of 12" or "Floor Ground"
    const fText =
      f === 0 || String(f).toLowerCase().includes("ground")
        ? "Ground"
        : (f ?? "").toString();
    return [fText && `Floor ${fText}`, total ? `of ${total}` : ""].filter(Boolean).join(" ");
  };

  const facingFrom = (p: any) =>
    p?.facing ||
    p?.facing_name ||
    p?.facing_type ||
    p?.direction ||
    p?.direction_name ||
    p?.orientation ||
    p?.property_facing ||
    p?.property_facing_name ||
    "—";

  const parkingFrom = (p: any) => {
    const qty = p?.parking_qty ? String(p.parking_qty) : "";
    const type = p?.parking_type || "";
    return [qty, type].filter(Boolean).join(" ");
  };

  const possessionFrom = (p: any) => {
    const y = Number(p?.possession_year);
    const m = Number(p?.possession_month);
    if (y && m) {
      const dt = new Date(y, m - 1, 1);
      const now = new Date();
      if (dt <= now) return "Ready to Move";
      return dt.toLocaleString("en-IN", { month: "short", year: "numeric" });
    }
    return p?.status === "Available" ? "Ready to Move" : p?.status || "—";
  };

  const sellerFrom = (p: any) => p?.seller_name || p?.owner_name || p?.contact_name || "—";
  const sellerPhoneFrom = (p: any) =>
    p?.seller_phone || p?.owner_phone || p?.contact_phone || p?.phone || "";

  const photoFrom = (p: any) => {
    const first = Array.isArray(p?.photos) && p.photos.length ? p.photos[0] : "";
    const byArray = typeof first === "string" ? first : first?.url || "";
    return p?.image || p?.photo || byArray || "";
  };

  // ---- scoring + reasons (needs buyer) ----
  const computeReasons = (p: any, buyer: any) => {
    const reasons: string[] = [];
    const price = priceFrom(p);
    const bMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
    const bMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);
    if (price && (bMin || bMax)) {
      if ((!bMin || price >= bMin) && (!bMax || price <= bMax)) reasons.push("💰 Perfect budget match");
      else if (bMin && bMax && price >= bMin * 0.9 && price <= bMax * 1.1) reasons.push("💸 Near your budget");
    }
    const req = buyer?.requirements || {};
    const reqUnitTypes = toArr(req.unitTypes).map(norm);
    const reqLocs = toArr(req.preferredLocations).map(norm);
    const reqAmenities = toArr(req.amenities).map(norm);
    const reqFacing = norm(req.facing);
    const reqFurnishing = norm(req.furnishing);
    const reqPossession = norm(req.possession);
    const reqPropType = norm(req.propertyType);
    const reqFloorPref = norm(req.floor);
    const reqKeywords = norm(req.specialRequirements || "")
      .split(/\s+/)
      .filter(Boolean);

    const u = unitTypeFrom(p);
    if (reqUnitTypes.length && u && reqUnitTypes.includes(u)) reasons.push(`🛏️ ${u.toUpperCase()} as preferred`);
    if (reqLocs.length && hasAny(locTokensFrom(p), reqLocs)) reasons.push("📍 Preferred location");
    const propAmns = amenitiesFrom(p);
    if (reqAmenities.length && propAmns.length) {
      const hit = reqAmenities.filter((a: string) => propAmns.includes(a));
      if (hit.length) reasons.push(`🏗️ Amenities matched (${hit.slice(0, 50).join(", ")})`);
    }
    const pfacing = norm(facingFrom(p));
    if (reqFacing && pfacing && reqFacing === pfacing) reasons.push(`🧭 ${reqFacing} facing`);
    const pfurn = furnishingFrom(p);
    if (reqFurnishing && pfurn && reqFurnishing === pfurn) reasons.push(`🛋️ ${reqFurnishing}`);
    const ppos = norm(possessionFrom(p));
    if (reqPossession && ppos && ppos.includes(reqPossession)) reasons.push(`🗓️ ${reqPossession}`);
    const ptype = propTypeFrom(p);
    if (reqPropType && ptype && ptype.includes(reqPropType)) reasons.push(`🏢 ${reqPropType} type`);
    const fl = norm(p?.floor || "");
    if (reqFloorPref) {
      if (reqFloorPref.includes("ground") && (fl.includes("ground") || fl === "0")) reasons.push("🏠 Ground floor");
      if (reqFloorPref.includes("higher") && /\d+/.test(fl) && Number(fl) >= 7) reasons.push("⬆️ Higher floor");
      if (reqFloorPref.includes("lower") && /\d+/.test(fl) && Number(fl) <= 3) reasons.push("⬇️ Lower floor");
    }
    if (reqKeywords.length) {
      const blob = descriptionFrom(p) + " " + amenitiesFrom(p).join(" ");
      const kwHit = reqKeywords.filter((k: string) => blob.includes(k)).slice(0, 50);
      if (kwHit.length) reasons.push(`✨ Matches: ${kwHit.join(", ")}`);
    }
    return reasons;
  };

  const computeMatchScore = (p: any, buyer: any) => {
    let score = 0;
    const price = priceFrom(p);
    const bMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
    const bMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);
    if (price && (bMin || bMax)) {
      if ((!bMin || price >= bMin) && (!bMax || price <= bMax)) score += 25;
      else if (bMin && bMax && price >= bMin * 0.9 && price <= bMax * 1.1) score += 15;
      else score += 5;
    }
    const req = buyer?.requirements || {};
    const reqLocs = toArr(req.preferredLocations).map(norm);
    const reqUnitTypes = toArr(req.unitTypes).map(norm);
    const reqAmenities = toArr(req.amenities).map(norm);
    const reqFacing = norm(req.facing);
    const reqFurnishing = norm(req.furnishing);
    const reqPossession = norm(req.possession);
    const reqPropType = norm(req.propertyType);
    const reqFloorPref = norm(req.floor);

    if (reqLocs.length && hasAny(locTokensFrom(p), reqLocs)) score += 20;
    if (reqUnitTypes.length && reqUnitTypes.includes(unitTypeFrom(p))) score += 15;
    if (reqAmenities.length) {
      const hits = reqAmenities.filter((a: string) => amenitiesFrom(p).includes(a)).length;
      if (hits >= 3) score += 15;
      else if (hits === 2) score += 10;
      else if (hits === 1) score += 6;
    }
    if (reqFacing && norm(facingFrom(p)) === reqFacing) score += 8;
    if (reqFurnishing && furnishingFrom(p) === reqFurnishing) score += 6;
    if (reqPossession && norm(possessionFrom(p)).includes(reqPossession)) score += 6;
    if (reqPropType && propTypeFrom(p).includes(reqPropType)) score += 3;
    const fl = norm(p?.floor || "");
    if (reqFloorPref) {
      if (reqFloorPref.includes("ground") && (fl.includes("ground") || fl === "0")) score += 2;
      else if (reqFloorPref.includes("higher") && /\d+/.test(fl) && Number(fl) >= 7) score += 2;
      else if (reqFloorPref.includes("lower") && /\d+/.test(fl) && Number(fl) <= 3) score += 2;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const makeItem = (p: any, buyer: any) => ({
    id: String(p?.id ?? p?.property_id ?? Math.random()),
    title: titleFrom(p), // 👈 updated builder
    address: addressFrom(p),
    price: priceFrom(p),
    size: sizeFrom(p),
    floorLine: floorLine(p),
    facing: facingFrom(p),
    parking: parkingFrom(p),
    possession: possessionFrom(p),
    amenities: p?.amenities || [],
    seller: sellerFrom(p),
    sellerPhone: sellerPhoneFrom(p),
    statusText: p?.status || "Available",
    matchScore: computeMatchScore(p, buyer),
    photo: photoFrom(p),
    _raw: p,
    reasons: computeReasons(p, buyer),
    unitType: unitTypeFrom(p)?.toUpperCase(),
  });

  const isWithinBuyerBudget = (p: any, buyer: any) => {
    const bMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
    const bMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);

    const hasBuyerMin = !!bMin;
    const hasBuyerMax = !!bMax;

    if (!hasBuyerMin && !hasBuyerMax) return true;

    const { min: pMin, max: pMax } = priceRangeFrom(p);
    const hasRange = !!pMin && !!pMax && pMax >= pMin;

    if (hasRange) {
      const left = hasBuyerMin ? bMin : Number.NEGATIVE_INFINITY;
      const right = hasBuyerMax ? bMax : Number.POSITIVE_INFINITY;
      // inclusive overlap
      return Math.max(pMin, left) <= Math.min(pMax, right);
    }

    const price = priceFrom(p);
    if (!price) return false;

    if (hasBuyerMin && price < bMin) return false;
    if (hasBuyerMax && price > bMax) return false;

    return true;
  };

  const filterProperties = (
    all: any[],
    buyer: any,
    filters: {
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      propertyType?: string;
      unitTypes?: any[];
      furnishing?: string;
      possession?: string;
    }
  ) => {
    const locQuery = norm(filters.location || "");
    const minP = Number(filters.minPrice || 0);
    const maxP = Number(filters.maxPrice || 0);
    const fType = norm(filters.propertyType || "");
    const fUnits = toArr(filters.unitTypes).map(norm);
    const fFurnish = norm(filters.furnishing || "");
    const fPoss = norm(filters.possession || "");

    return all.filter((p) => {
      if (publicOnly && !toBool(p?.is_public ?? p?.isPublic ?? p?.public)) return false;

      if (!isWithinBuyerBudget(p, buyer)) return false;

      if (locQuery) {
        const hit = hasAny(locTokensFrom(p), [locQuery]);
        if (!hit) return false;
      }

      const { min: pMin, max: pMax } = priceRangeFrom(p);
      const pPrice = priceFrom(p);
      const hasRange = !!pMin && !!pMax && pMax >= pMin;
      if (minP || maxP) {
        if (hasRange) {
          const left = minP || Number.NEGATIVE_INFINITY;
          const right = maxP || Number.POSITIVE_INFINITY;
          if (Math.max(pMin, left) > Math.min(pMax, right)) return false;
        } else if (pPrice) {
          if (minP && pPrice < minP) return false;
          if (maxP && pPrice > maxP) return false;
        }
      }

      if (fType && !propTypeFrom(p).includes(fType)) return false;

      if (fUnits.length) {
        const u = unitTypeFrom(p);
        if (!u || !fUnits.includes(u)) return false;
      }

      if (fFurnish && furnishingFrom(p) !== fFurnish) return false;

      if (fPoss) {
        const pos = norm(possessionFrom(p));
        if (!pos.includes(fPoss)) return false;
      }

      return true;
    });
  };

  /* ---------------- fetch: ALL ---------------- */
  const applyClientFilters = useCallback(
    (list: any[]) => {
      if (!publicOnly) return list;
      return list.filter((p) => toBool(p?.is_public ?? p?.isPublic ?? p?.public));
    },
    [publicOnly]
  );

  const fetchProperties = useCallback(async () => {
    setLoadingProps(true);
    setPropsError(null);
    try {
      const res = await propertiesAPI.getProperties();
      console.log("res",res)
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const finalList = applyClientFilters(list);
      setProperties(finalList);
      return finalList;
    } catch (err) {
      console.error("❌ Could not load properties:", err);
      setPropsError("Could not load properties");
      setProperties([]);
      return [];
    } finally {
      setLoadingProps(false);
    }
  }, [applyClientFilters]);

  /* ---------------- fetch: SEARCH (GET /properties/search) ---------------- */
  const searchProperties = useCallback(
    async (params: {
      city?: string;
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: "low_to_high" | "high_to_low" | "medium" | "newest";
      propertyType?: string;
      unitTypes?: string[]; // API will join with comma
    }) => {
      setLoadingProps(true);
      setPropsError(null);
      try {
        const res = await propertiesAPI.searchProperties(params);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.properties)
          ? res.properties
          : Array.isArray(res)
          ? res
          : [];
        const finalList = applyClientFilters(list);
        setProperties(finalList);
        return finalList;
      } catch (err) {
        console.error("❌ Search failed:", err);
        setPropsError("Search failed");
        setProperties([]);
        return [];
      } finally {
        setLoadingProps(false);
      }
    },
    [applyClientFilters]
  );

  /* ---------------- lifecycle ---------------- */
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  /* ---------------- auto logs ---------------- */
  useEffect(() => {
    if (!autoLog) return;
    const count = properties.length;
    console.log(`🏡 properties updated: ${count}`);
    if (count) {
      const sample = properties.slice(0, 3).map((p) => ({
        id: p?.id ?? p?.property_id,
        title: p?.title || titleFrom(p),
        public: toBool(p?.is_public ?? p?.isPublic ?? p?.public),
      }));
      console.table(sample);
    }
  }, [properties, autoLog]); // eslint-disable-line

  useEffect(() => {
    if (!autoLog) return;
    if (loadingProps) console.log("⏳ loading properties…");
    else console.log("✅ properties loading complete");
  }, [loadingProps, autoLog]);

  useEffect(() => {
    if (!autoLog) return;
    if (propsError) console.warn("⚠️ propsError:", propsError);
  }, [propsError, autoLog]);

  /* ---------------- manual logger ---------------- */
  const logProperties = () => {
    const rows = properties.map((p) => ({
      id: p?.id ?? p?.property_id,
      title: p?.title || titleFrom(p),
      budget: formatCurrency(priceFrom(p)),
      public: toBool(p?.is_public ?? p?.isPublic ?? p?.public),
      seller_id: p?.seller_id ?? p?.sellerId ?? p?.owner_seller_id ?? "",
      city: p?.city_name || p?.city || "",
    }));
    console.table(rows);
  };

  /* ---------------- utils bundle ---------------- */
  const utils = {
    toArr,
    norm,
    hasAny,
    formatCurrency,
    getAvailabilityBadgeClass,
    unitTypeFrom,
    locTokensFrom,
    amenitiesFrom,
    furnishingFrom,
    propTypeFrom,
    descriptionFrom,
    titleFrom, // 👈 upgraded
    addressFrom,
    priceFrom,
    priceRangeFrom,
    sizeFrom,
    floorLine,
    facingFrom,
    parkingFrom,
    possessionFrom,
    sellerFrom,
    sellerPhoneFrom,
    photoFrom,
    computeReasons,
    computeMatchScore,
    makeItem,
    isWithinBuyerBudget,
    filterProperties,
  };

  return {
    properties,
    loadingProps,
    propsError,
    fetchProperties,   // all
    searchProperties,  // 🔎 server search
    logProperties,     // 🧰 console.table overview
    utils,
  };
}
