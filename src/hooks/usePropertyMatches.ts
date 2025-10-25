import { useEffect, useMemo, useState } from "react";
import { useProperties } from "@/hooks/properties";
import getTagStyle from "@/lib/tagStyles"; // if needed later

type BuyerReq = {
  preferredLocations?: string[] | string;
  unitTypes?: string[] | string;
  furnishing?: string;
};
type UsePropertyMatchesOpts = {
  buyer: any;
  publicOnly?: boolean;
  budgetTolerancePct?: number; // ±%
  searchTerm?: string;
};

const str = (v: any) => (v == null ? "" : String(v));
const nonEmpty = (x: any) => !!str(x).trim();
const norm = (v: any) => str(v).trim().toLowerCase();
const toArr = (v: any): string[] => Array.isArray(v) ? v : nonEmpty(v) ? String(v).split(",").map(s=>s.trim()).filter(Boolean) : [];

const safeParse = <T=any,>(v: any, fallback: T): T => {
  if (v == null) return fallback;
  if (typeof v === "object") return v as T;
  if (typeof v === "string") { try { return JSON.parse(v) as T; } catch { return fallback; } }
  return fallback;
};

const isTruthy = (v: any) => {
  if (v === true || v === 1) return true;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
};
const getIsPublic = (it: any) => {
  const raw = it?._raw ?? it ?? {};
  return (
    isTruthy(it?.is_public) ||
    isTruthy(it?.isPublic) ||
    isTruthy(raw?.is_public) ||
    isTruthy(raw?.isPublic) ||
    isTruthy(raw?.public) ||
    false
  );
};

const getUnitType = (it: any) =>
  it.unitType || it._raw?.unit_type || it._raw?.bhk_label || it._raw?.configuration || it._raw?.bhk || "";

const getPropertyType = (it: any) =>
  it.propertyType || it._raw?.property_type_name || it._raw?.property_type || it._raw?.propertyTypeName || it._raw?.category || "";

const getPropertySubtype = (it: any) =>
  it.propertySubtype || it._raw?.property_subtype_name || it._raw?.property_subtype || it._raw?.propertySubtypeName || it._raw?.sub_category || "";

const buildDisplayTitle = (it: any) => {
  const parts = [getPropertyType(it), getUnitType(it), getPropertySubtype(it)]
    .map((x) => str(x).trim()).filter(nonEmpty);
  if (!parts.length && nonEmpty(it.title)) return it.title;
  return parts.join(" ");
};

export function usePropertyMatches({
  buyer,
  publicOnly = true,
  budgetTolerancePct = 0,
  searchTerm = "",
}: UsePropertyMatchesOpts) {
  const { properties, loadingProps, propsError, fetchProperties, utils } = useProperties({ autoLog: false });
  const { makeItem, formatCurrency } = utils;

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  // normalize buyer inputs
  const buyerReq = safeParse<BuyerReq>(buyer?.requirements, {} as BuyerReq);
  const buyerMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
  const buyerMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);
  const hasBuyerMin = Number.isFinite(buyerMin) && buyerMin > 0;
  const hasBuyerMax = Number.isFinite(buyerMax) && buyerMax > 0;

  const reqLocs = toArr(buyerReq?.preferredLocations).map(norm);
  const reqUnits = toArr(buyerReq?.unitTypes).map(norm);
  const reqFurn = norm(buyerReq?.furnishing);
  const q = norm(searchTerm);

  const tolActive = budgetTolerancePct > 0 && (hasBuyerMin || hasBuyerMax);
  const lower = hasBuyerMin ? Math.floor(buyerMin * (1 - budgetTolerancePct / 100)) : 0;
  const upper = hasBuyerMax ? Math.ceil(buyerMax * (1 + budgetTolerancePct / 100)) : Number.POSITIVE_INFINITY;
  const withinStrict = (price: number) =>
    (!hasBuyerMin || price >= buyerMin) && (!hasBuyerMax || price <= buyerMax);
  const withinTol = (price: number) => price >= lower && price <= upper;

  const items = useMemo(() => {
    const list = Array.isArray(properties) ? properties.map((p) => makeItem(p, buyer)) : [];
    return publicOnly ? list.filter((it) => getIsPublic(it)) : list;
  }, [properties, buyer, makeItem, publicOnly]);

  const analyzeMatch = (it: any) => {
    const reasons: string[] = [];
    const matched: Record<string, any> = {};
    const price = Number(it.price || 0);

    if (tolActive) {
      if (!withinTol(price)) return { pass: false, reasons: [`Price ${price} not within ${lower}-${upper}`], matched };
      reasons.push(`Price ${price} within ${lower}-${upper}`);
    } else {
      if (!withinStrict(price)) return { pass: false, reasons: ["Price outside buyer range"], matched };
      reasons.push(`Price OK`);
    }

    // location
    if (reqLocs.length) {
      const addr = norm(it.address);
      const hit = reqLocs.find((loc) => addr.includes(loc));
      if (!hit) return { pass: false, reasons: ["Location mismatch"], matched };
      matched.location = hit;
    }

    // unit type
    if (reqUnits.length) {
      const unit = norm(getUnitType(it));
      const hit = reqUnits.find((u) => unit.includes(u));
      if (!hit) return { pass: false, reasons: ["Unit type mismatch"], matched };
      matched.unitType = hit;
    }

    // furnishing (soft)
    if (reqFurn) {
      const blob = `${str(it.furnishing || "")} ${(it.reasons || []).join(" ")}`.toLowerCase();
      if (blob.includes(reqFurn)) it.matchScore = Math.min(100, (it.matchScore || 80) + 5);
    }

    // text search
    if (q) {
      const hay = `${norm(buildDisplayTitle(it))} ${norm(it.address)} ${norm(it.seller)} ${norm(it.statusText)} ${norm(it.size)} ${norm(getPropertyType(it))} ${norm(getPropertySubtype(it))} ${norm(getUnitType(it))}`;
      if (!hay.includes(q)) return { pass: false, reasons: [`Text miss for "${q}"`], matched };
    }

    return { pass: true, reasons, matched };
  };

  const matches = useMemo(() => {
    const analyzed = items.map((it: any) => {
      const a = analyzeMatch(it);
      (it as any)._match = a;
      return it;
    });

    const passing = analyzed.filter((it: any) => it._match?.pass);

    // sort: score desc, then closest to mid-budget, then price asc
    return passing.sort((a: any, b: any) => {
      if ((b.matchScore || 0) !== (a.matchScore || 0)) return (b.matchScore || 0) - (a.matchScore || 0);

      if (hasBuyerMin && hasBuyerMax) {
        const mid = (buyerMin + buyerMax) / 2;
        const da = Math.abs((Number(a.price) || 0) - mid);
        const db = Math.abs((Number(b.price) || 0) - mid);
        if (da !== db) return da - db;
      }

      return (Number(a.price) || 0) - (Number(b.price) || 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    items, budgetTolerancePct, hasBuyerMin, hasBuyerMax, buyerMin, buyerMax,
    reqLocs, reqUnits, reqFurn, q
  ]);

  return {
    matches,
    count: matches.length,
    loading: loadingProps,
    error: propsError || null,
  };
}
