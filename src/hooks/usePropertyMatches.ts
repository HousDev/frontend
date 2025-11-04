import { useEffect, useMemo, useState } from "react";
import { useProperties } from "@/hooks/properties";

type BuyerReq = {
  preferredLocations?: string[] | string;
  unitTypes?: string[] | string;
  furnishing?: string;
  city?: string;
  propertyType?: string;
};

type UsePropertyMatchesOpts = {
  buyer: any;
  publicOnly?: boolean;
  budgetTolerancePct?: number;
  searchTerm?: string;
};

/* ----------------- helpers ----------------- */
const str = (v: any) => (v == null ? "" : String(v));
const nonEmpty = (x: any) => !!str(x).trim();
const norm = (v: any) => str(v).trim().toLowerCase();

const toArr = (v: any): string[] => {
  if (Array.isArray(v)) return v.map(str).filter(nonEmpty);
  if (nonEmpty(v)) {
    try {
      if (typeof v === "string" && v.trim().startsWith("[")) {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed.map(str).filter(nonEmpty) : [];
      }
      return String(v).split(",").map(s => s.trim()).filter(Boolean);
    } catch {
      return String(v).split(",").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const safeParse = <T = any,>(v: any, fallback: T): T => {
  if (v == null) return fallback;
  if (typeof v === "object") return v as T;
  if (typeof v === "string") {
    try { return JSON.parse(v) as T; } catch { return fallback; }
  }
  return fallback;
};

/* ----- public detection (comprehensive) ----- */
const isTruthy = (v: any) => {
  if (v === true || v === 1 || v === "1") return true;
  const s = String(v ?? "").trim().toLowerCase();
  return ["true", "yes", "public", "published", "active", "visible", "listed"].includes(s);
};

const isPublicRaw = (row: any) => {
  const publicFlags = [
    row?.is_public, row?.isPublic, row?.public,
    row?.is_public_listing, row?.public_listing,
    row?.visible_to_buyers, row?.buyer_visible,
    row?.status, row?.visibility, row?.listing_status,
    row?.is_active, row?.active
  ];
  const isPublic = publicFlags.some(flag => isTruthy(flag));

  const privateFlags = [
    row?.is_private, row?.isPrivate, row?.private,
    row?.draft, row?.is_draft, row?.hidden, row?.is_hidden
  ];
  const isPrivate = privateFlags.some(flag => isTruthy(flag));

  const nonPublicStatuses = ["draft", "private", "hidden", "inactive", "unpublished", "archived"];
  const status = String(row?.status || "").toLowerCase();
  const hasNonPublicStatus = nonPublicStatuses.includes(status);

  return isPublic && !isPrivate && !hasNonPublicStatus;
};

/* -------------- field getters -------------- */
const getUnitType = (it: any) =>
  it.unitType || it._raw?.unit_type || it._raw?.bhk_label || it._raw?.configuration || it._raw?.bhk || "";

const getPropertyType = (it: any) =>
  it.propertyType || it._raw?.property_type_name || it._raw?.property_type || it._raw?.category || "";

const getLocation = (it: any) =>
  it.location || it._raw?.location_name || it._raw?.location || it._raw?.locality || "";

const getCity = (it: any) =>
  it.city || it._raw?.city_name || it._raw?.city || "";

const getAddress = (it: any) =>
  it.address || it._raw?.full_address || it._raw?.address || "";

const getSlug = (it: any) => it.slug || it._raw?.slug || "";

const getPrice = (it: any) => {
  const price = it.price ?? it._raw?.price ?? it._raw?.budget ?? it._raw?.final_price ?? 0;
  return Number(price) || 0;
};

const getAmenities = (it: any): any[] => {
  const v = it.amenities ?? it._raw?.amenities ?? it._raw?.amenity_list;
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try { const arr = JSON.parse(v); return Array.isArray(arr) ? arr : []; } catch {
      return v.split(",").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const getPhotos = (it: any): string[] => {
  const v = it.photos ?? it._raw?.photos ?? it._raw?.images ?? it._raw?.media;
  if (Array.isArray(v)) {
    if (v.length && typeof v[0] === "object") {
      return v.map((m: any) => m?.url ?? m?.src ?? "").filter(Boolean);
    }
    return v as string[];
  }
  if (typeof v === "string") {
    try { const arr = JSON.parse(v); return Array.isArray(arr) ? arr : []; } catch { return []; }
  }
  return [];
};

/* ----- normalize unit type (BHK/Studio) ----- */
function normalizeUnitTypeToKey(s: string): string {
  const txt = String(s || "").toLowerCase().trim();
  if (/(\bstudio\b|\b1\s*rk\b)/.test(txt)) return "studio";
  const m = txt.match(/(\d+)\s*(bhk|bed|bedroom)?/i);
  return m ? m[1] : txt; // fall back to raw for other types
}

/* -------------- scoring logic -------------- */
/**
 * Weights add up to 100
 * - Budget proximity:   55
 * - Location match:     25
 * - Unit type match:    15
 * - Extras (photos/amenities): 5
 * (Property type contributes within "location/unit/extras" to keep 100 clean;
 *  if you want a hard property-type weight, add it and shave some elsewhere.)
 */
const calculateMatchScore = (
  property: any,
  buyerReq: BuyerReq,
  buyerMinEff: number, // effectiveMin (tolerance applied)
  buyerMaxEff: number  // effectiveMax (tolerance applied)
) => {
  let score = 0;

  const price = getPrice(property);
  const hasMin = Number.isFinite(buyerMinEff) && buyerMinEff > 0;
  const hasMax = Number.isFinite(buyerMaxEff) && buyerMaxEff < Infinity;

  // -------- Budget "gate" + proximity (55) --------
  let budgetOk = true;
  if (hasMin && hasMax)       budgetOk = price >= buyerMinEff && price <= buyerMaxEff;
  else if (hasMin && !hasMax) budgetOk = price >= buyerMinEff;
  else if (!hasMin && hasMax) budgetOk = price <= buyerMaxEff;

  if (!budgetOk) return 0; // hard gate: outside tolerant range → 0

  const W_BUDGET = 55;
  if (hasMin && hasMax) {
    const mid = (buyerMinEff + buyerMaxEff) / 2;
    const halfRange = Math.max(1, (buyerMaxEff - buyerMinEff) / 2);
    const dist = Math.abs(price - mid);
    const budgetFrac = Math.max(0, 1 - dist / halfRange);
    score += Math.round(W_BUDGET * budgetFrac);
  } else if (hasMin || hasMax) {
    // one-sided budget → give reasonable base
    score += Math.round(W_BUDGET * 0.6);
  } else {
    // no budget preference
    score += Math.round(W_BUDGET * 0.5);
  }

  // -------- Location (25) --------
  const W_LOCATION = 25;
  const reqLocs = toArr(buyerReq.preferredLocations).map(norm);
  const buyerCity = norm(buyerReq.city);

  const hay = [
    norm(getLocation(property)),
    norm(getCity(property)),
    norm(getAddress(property)),
    norm(getSlug(property)),
  ].filter(Boolean).join(" | ");

  let locPts = 0;
  if (reqLocs.length) {
    const hit = reqLocs.some(l => hay.includes(l));
    locPts = hit ? W_LOCATION : 0;
    // small nudge if not in preferred list but city matches
    if (!hit && buyerCity && hay.includes(buyerCity)) locPts = Math.max(locPts, Math.round(W_LOCATION * 0.4));
  } else if (buyerCity) {
    locPts = hay.includes(buyerCity) ? W_LOCATION : Math.round(W_LOCATION * 0.5);
  } else {
    locPts = Math.round(W_LOCATION * 0.5);
  }
  score += locPts;

  // -------- Unit Type (15) --------
  const W_UNIT = 15;
  const reqUnits = toArr(buyerReq.unitTypes).map(normalizeUnitTypeToKey).filter(Boolean);
  const propUnitKey = normalizeUnitTypeToKey(getUnitType(property));

  let unitPts = 0;
  if (reqUnits.length) {
    const exact = reqUnits.some(u => u === propUnitKey);
    const loose = !exact && reqUnits.some(u => (getUnitType(property) + "").toLowerCase().includes(u));
    unitPts = exact ? W_UNIT : loose ? Math.round(W_UNIT * 0.6) : 0;
  } else {
    unitPts = Math.round(W_UNIT * 0.5);
  }
  score += unitPts;

  // -------- Extras (5): photos + amenities --------
  const W_EXTRAS = 5;
  const hasPhotos = getPhotos(property).length > 0;
  const hasAmenities = getAmenities(property).length > 0;
  const extrasFrac = (Number(hasPhotos) + Number(hasAmenities)) / 2;
  score += Math.round(W_EXTRAS * extrasFrac);

  return Math.max(0, Math.min(100, score));
};

/* ========================= hook ========================= */
export function usePropertyMatches({
  buyer,
  publicOnly = true,
  budgetTolerancePct = 20,
  searchTerm = "",
}: UsePropertyMatchesOpts) {
  const { properties, loadingProps, propsError, fetchProperties } = useProperties({ autoLog: false });

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Normalize buyer data
  const buyerReq = safeParse<BuyerReq>(buyer?.requirements, {});
  const buyerMin = Number(buyer?.budget?.min ?? buyer?.budget_min ?? buyer?.budgetMin ?? 0);
  const buyerMax = Number(buyer?.budget?.max ?? buyer?.budget_max ?? buyer?.budgetMax ?? 0);
  const hasValidBudget = buyerMin > 0 && (buyerMax === 0 || buyerMax >= buyerMin);

  // Apply tolerance band only if a min or max exists
  const effectiveMin = hasValidBudget && buyerMin > 0 ? Math.max(0, buyerMin * (1 - budgetTolerancePct / 100)) : 0;
  const effectiveMax = hasValidBudget && buyerMax > 0 ? buyerMax * (1 + budgetTolerancePct / 100) : Infinity;

  const searchTermNorm = norm(searchTerm);

  const matches = useMemo(() => {
    if (!Array.isArray(properties)) return [];

    // 1) Optional: filter to public
    const base = publicOnly ? properties.filter(isPublicRaw) : properties.slice();

    // 2) Score & annotate
    let processed = base.map(property => {
      const score = calculateMatchScore(property, buyerReq, effectiveMin, effectiveMax);

      const budgetMatch = (() => {
        const price = getPrice(property);
        const hasMin = effectiveMin > 0;
        const hasMax = effectiveMax < Infinity;
        if (hasMin && hasMax) return price >= effectiveMin && price <= effectiveMax;
        if (hasMin && !hasMax) return price >= effectiveMin;
        if (!hasMin && hasMax) return price <= effectiveMax;
        return true;
      })();

      // Stronger location truth
      const hay = [
        norm(getLocation(property)),
        norm(getCity(property)),
        norm(getAddress(property)),
        norm(getSlug(property)),
      ].join(" | ");
      const reqLocs = toArr(buyerReq.preferredLocations).map(norm);
      const buyerCity = norm(buyerReq.city);
      const locationMatch = reqLocs.length
        ? reqLocs.some(l => hay.includes(l)) || (!!buyerCity && hay.includes(buyerCity))
        : (!!buyerCity ? hay.includes(buyerCity) : true);

      const reqUnits = toArr(buyerReq.unitTypes).map(normalizeUnitTypeToKey).filter(Boolean);
      const unitMatch = reqUnits.length
        ? reqUnits.includes(normalizeUnitTypeToKey(getUnitType(property)))
        : true;

      return {
        ...property,
        _match: {
          score,
          passed: score >= 30,
          budgetMatch,
          locationMatch,
          unitMatch,
        },
      };
    })
    // 3) Filter out weak matches
    .filter(p => p._match.passed);

    // 4) Search filter
    if (searchTermNorm) {
      processed = processed.filter(property => {
        const searchableText = [
          getPropertyType(property),
          getUnitType(property),
          getLocation(property),
          getCity(property),
          getAddress(property),
          getSlug(property),
          property.title || "",
          property._raw?.project_name || "",
          property._raw?.society_name || "",
        ].map(norm).join(" ");
        return searchableText.includes(searchTermNorm);
      });
    }

    // 5) Sort by score desc, then price asc
    return processed.sort((a, b) => {
      if (b._match.score !== a._match.score) return b._match.score - a._match.score;
      return getPrice(a) - getPrice(b);
    });
  }, [properties, buyerReq, publicOnly, effectiveMin, effectiveMax, searchTermNorm]);

  const goodMatchesCount = useMemo(() =>
    matches.filter(m => m._match.score >= 60).length,
    [matches]
  );

  const fairMatchesCount = useMemo(() =>
    matches.filter(m => m._match.score >= 30 && m._match.score < 60).length,
    [matches]
  );

  return {
    matches,
    count: matches.length,
    goodMatchesCount,
    fairMatchesCount,
    loading: loadingProps,
    error: propsError,
    hasValidBudget,
    budgetRange: (effectiveMin > 0 || effectiveMax < Infinity)
      ? { min: effectiveMin, max: effectiveMax }
      : null,
    matchStats: {
      total: matches.length,
      excellent: matches.filter(m => m._match.score >= 80).length,
      good: goodMatchesCount,
      fair: fairMatchesCount,
    },
  };
}
