// src/components/properties/PropertyMatchModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  X, Target, Search, Building, MapPin, MessageCircle, Phone, Calendar, Globe, Share2, Bookmark
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

const safeParse = <T = any,>(v: any, fallback: T): T => {
  if (v == null) return fallback;
  if (typeof v === "object") return v as T;
  if (typeof v === "string") {
    try { return JSON.parse(v) as T; } catch { return fallback; }
  }
  return fallback;
};

const TRACKING_PARAM_KEY = "fltcnt";
const STORAGE_KEY = "re_filter_token";

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

const persistToken = (token: string) => {
  if (typeof window === "undefined" || !token) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(STORAGE_KEY, token);
  } catch {}
};

/** truthy flags normalizer */
const isTruthy = (v: any) => {
  if (v === true || v === 1) return true;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
};

/** read is_public from any shape */
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

const PropertyMatchModal: React.FC<PropertyMatchModalProps> = ({ isOpen, onClose, buyer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [budgetTolerancePct, setBudgetTolerancePct] = useState<number>(0);
  const [shareItem, setShareItem] = useState<any | null>(null);

  // tags
  const [tagsByPropertyId, setTagsByPropertyId] = useState<Record<string, string[]>>({});
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagsErr, setTagsErr] = useState<string | null>(null);

  // properties
  const { properties, loadingProps, propsError, fetchProperties, utils } = useProperties({ autoLog: false });
  const { makeItem, formatCurrency, norm, toArr } = utils;

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

  // server data → normalized items
  const items = useMemo(() => {
    return Array.isArray(properties) ? properties.map((p) => makeItem(p, buyer)) : [];
  }, [properties, buyer, makeItem]);

  // only PUBLIC
  const publicItems = useMemo(() => items.filter((it) => getIsPublic(it)), [items]);

  /* ===================== Buyer Requirements ===================== */
  const buyerReq = safeParse(buyer?.requirements, {}) as {
    preferredLocations?: string[] | string;
    unitTypes?: string[] | string;
    furnishing?: string;
  };

  const buyerMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
  const buyerMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);
  const hasBuyerMin = Number.isFinite(buyerMin) && buyerMin > 0;
  const hasBuyerMax = Number.isFinite(buyerMax) && buyerMax > 0;

  const reqLocs = toArr(buyerReq?.preferredLocations).map(norm);
  const reqUnits = toArr(buyerReq?.unitTypes).map(norm);
  const reqFurn = norm(buyerReq?.furnishing);

  // tolerance range (expands/relaxes min/max if set)
  const tolActive = budgetTolerancePct > 0 && (hasBuyerMin || hasBuyerMax);
  const lower = hasBuyerMin ? Math.floor(buyerMin * (1 - budgetTolerancePct / 100)) : 0;
  const upper = hasBuyerMax ? Math.ceil(buyerMax * (1 + budgetTolerancePct / 100)) : Number.POSITIVE_INFINITY;
  const withinStrict = (price: number) =>
    (!hasBuyerMin || price >= buyerMin) && (!hasBuyerMax || price <= buyerMax);
  const withinTol = (price: number) => price >= lower && price <= upper;

  // text search
  const q = norm(searchTerm);

  // field getters with fallbacks
  const getPropertyType = (it: any) =>
    it.propertyType || it._raw?.property_type_name || it._raw?.property_type || it._raw?.propertyTypeName || it._raw?.category || "";

  const getPropertySubtype = (it: any) =>
    it.propertySubtype || it._raw?.property_subtype_name || it._raw?.property_subtype || it._raw?.propertySubtypeName || it._raw?.sub_category || "";

  const getUnitType = (it: any) =>
    it.unitType || it._raw?.unit_type || it._raw?.bhk_label || it._raw?.configuration || it._raw?.bhk || "";

  const getSlug = (it: any) => it.slug || it._raw?.slug || "";

  // executive
  const getExecutive = (it: any) => {
    const raw = it._raw || {};
    if (it.assignedTo && typeof it.assignedTo === "object") {
      return {
        name: it.assignedTo.name || null,
        email: it.assignedTo.email || null,
        phone: it.assignedTo.phone || null,
      };
    }
    if (raw.assignedTo && typeof raw.assignedTo === "object") {
      return {
        name: raw.assignedTo.name || null,
        email: raw.assignedTo.email || null,
        phone: raw.assignedTo.phone || null,
      };
    }
    const name = it.executive_name || raw.executive_name || raw.assigned_executive_name || raw.executiveName || null;
    const email = it.executive_email || raw.executive_email || raw.assigned_executive_email || raw.executiveEmail || null;
    const phone = it.executive_phone || raw.executive_phone || raw.assigned_executive_phone || raw.executivePhone || null;
    return { name, email, phone };
  };

  // title generator
  const buildDisplayTitle = (it: any) => {
    const parts = [getPropertyType(it), getUnitType(it), getPropertySubtype(it)]
      .map((x) => str(x).trim()).filter(nonEmpty);
    if (!parts.length && nonEmpty(it.title)) return it.title;
    return parts.join(" ");
  };

  // tracking token helpers
  const ensureTrackingToken = async (): Promise<string | undefined> => {
    let token =
      buyer?.filterContextId || buyer?.filter_id || buyer?.filterId || null;

    if (!token) token = getParam(TRACKING_PARAM_KEY);
    if (!token) token = readTokenFromStorage();

    if (!token) {
      try {
        const res = await propertiesAPI.createFilterContext({
          filters: { source: "property_match_visit", buyerId: buyer?.id ?? null },
          user_id: null,
        });
        token = res?.id || res?.data?.id || null;
      } catch {
        token = null;
      }
    }

    if (token) persistToken(token);
    return token || undefined;
  };

  const getPropertyUrl = (it: any, token?: string) => {
    const slug = str(getSlug(it)).replace(/^\//, "");
    const base =
      (typeof window !== "undefined" && window.location?.origin) ||
      "https://investordeal.in";

    const url = slug ? `${base}/properties/${slug}` : `${base}/properties/${it.id}`;
    if (!token) return url;

    try {
      const u = new URL(url);
      u.searchParams.set(TRACKING_PARAM_KEY, token);
      return u.toString();
    } catch {
      return url + (url.includes("?") ? "&" : "?") + `${TRACKING_PARAM_KEY}=${encodeURIComponent(token)}`;
    }
  };

  const trackEvent = async (
    propertyId: string | number,
    eventName: string,
    payload: Record<string, any> = {},
    token?: string
  ) => {
    try {
      await propertiesAPI.sendPropertyEvent(
        propertyId,
        "interaction",
        eventName,
        { ...payload, filterParamKey: TRACKING_PARAM_KEY },
        { slug: getSlug(payload?.item || {}) || undefined, filterToken: token }
      );
    } catch {}
  };

  /* ===================== Match Analyser ===================== */
  const analyzeMatch = (it: any) => {
    const reasons: string[] = [];
    const matched: Record<string, any> = {};
    const price = Number(it.price || 0);

    // Budget logic:
    // - If tolerance set → only check broadened range
    // - Else → check strict min/max if provided
    if (tolActive) {
      if (!withinTol(price)) {
        return { pass: false, reasons: [`Price ${price} not within tolerance band ${lower} - ${upper}`], matched };
      }
      reasons.push(`Price ${price} within tolerance band ${lower} - ${upper}`);
      matched.price = { price, lower, upper, tolerancePct: budgetTolerancePct };
    } else {
      if (!withinStrict(price)) {
        return { pass: false, reasons: ["Price outside buyer strict range"], matched };
      }
      reasons.push(
        hasBuyerMin || hasBuyerMax
          ? `Price ${price} within ${hasBuyerMin ? buyerMin : "—"} to ${hasBuyerMax ? buyerMax : "—"}`
          : `Price not constrained by buyer range`
      );
      matched.price = { price, buyerMin: hasBuyerMin ? buyerMin : null, buyerMax: hasBuyerMax ? buyerMax : null };
    }

    // Location
    if (reqLocs.length) {
      const addr = norm(it.address);
      const hit = reqLocs.find((loc: string) => addr.includes(loc));
      if (!hit) return { pass: false, reasons: ["Location not in preferredLocations"], matched };
      reasons.push(`Location matched: "${hit}"`);
      matched.location = { address: it.address, matchedToken: hit, allPreferred: reqLocs };
    } else {
      reasons.push("No preferredLocations constraint");
    }

    // Unit type
    if (reqUnits.length) {
      const unit = norm(getUnitType(it));
      const hit = reqUnits.find((u: string) => unit.includes(u));
      if (!hit) return { pass: false, reasons: ["Unit type not in required unitTypes"], matched };
      reasons.push(`Unit type matched: "${hit}"`);
      matched.unitType = { unitType: getUnitType(it), matchedToken: hit, allPreferred: reqUnits };
    } else {
      reasons.push("No unitTypes constraint");
    }

    // Furnishing → soft boost
    if (reqFurn) {
      const blob = `${str(it.furnishing || "")} ${(it.reasons || []).join(" ")}`.toLowerCase();
      if (blob.includes(reqFurn)) {
        reasons.push(`Furnishing soft-match: contains "${reqFurn}" → +5 score`);
        matched.furnishing = { required: reqFurn };
        it.matchScore = Math.min(100, (it.matchScore || 80) + 5);
      } else {
        reasons.push(`Furnishing desired "${reqFurn}" not found (soft check)`);
      }
    }

    // Text search
    const query = q;
    if (query) {
      const hay = `${norm(buildDisplayTitle(it))} ${norm(it.address)} ${norm(it.seller)} ${norm(
        it.statusText
      )} ${norm(it.size)} ${norm(getPropertyType(it))} ${norm(getPropertySubtype(it))} ${norm(getUnitType(it))}`;
      if (!hay.includes(query)) return { pass: false, reasons: [`Text search miss for "${query}"`], matched };
      reasons.push(`Text search hit for "${query}"`);
      matched.text = { query };
    } else {
      reasons.push("No text query constraint");
    }

    return { pass: true, reasons, matched };
  };

  // filter + sort
  const filtered = useMemo(() => {
    const analyzed = publicItems.map((it: any) => {
      const analysis = analyzeMatch(it);
      (it as any)._match = analysis;
      return it;
    });

    const passing = analyzed.filter((it: any) => it._match?.pass);

    // log concise, collapsible
    if (passing.length) {
      console.groupCollapsed(
        `%cProperty matches for buyer: ${buyer?.name || ""} (${passing.length})`,
        "color:#6b21a8;font-weight:600"
      );
      passing.forEach((it: any) => {
        const title = buildDisplayTitle(it) || it.title || `#${it.id}`;
      });
      console.groupEnd();
    } else {
      console.info("No property matches for buyer filter currently.");
    }

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
    publicItems,
    budgetTolerancePct, hasBuyerMin, hasBuyerMax, buyerMin, buyerMax,
    reqLocs, reqUnits, reqFurn, q
  ]);

  // selection
  const handlePropertySelection = (id: string | number) => {
    const key = String(id);
    setSelectedProperties((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  // send to buyer (stub)
  const handleSendToSelected = () => {
    if (!selectedProperties.length) {
      alert("Please select properties to send to buyer");
      return;
    }
    const selected = filtered.filter((p) => selectedProperties.includes(String(p.id)));
    alert(`${selectedProperties.length} properties sent to ${buyer?.name || "buyer"}.`);
    setSelectedProperties([]);
  };

  // contact/call executive
  const handleContactExecutive = async (it: any) => {
    const exec = getExecutive(it);
    const phone = cleanPhone(exec.phone || "");
    if (!phone) return alert("Executive phone number not available");

    const bMin = hasBuyerMin ? formatCurrency(buyerMin) : "";
    const bMax = hasBuyerMax ? formatCurrency(buyerMax) : "";
    const budgetLine =
      hasBuyerMin && hasBuyerMax ? `${bMin} - ${bMax}` : hasBuyerMin ? `${bMin}+` : hasBuyerMax ? `Up to ${bMax}` : "N/A";
    const msg = `Hi ${exec.name || "there"}, ${buyer?.name || "buyer"} is interested in "${buildDisplayTitle(it)}". Budget: ${budgetLine}. Can we schedule a visit?`;

    const token = await ensureTrackingToken();
    await trackEvent(it.id, "contact_executive", { channel: "whatsapp", item: it }, token);

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCallExecutive = (it: any) => {
    const exec = getExecutive(it);
    const phone = cleanPhone(exec.phone || "");
    if (!phone) return alert("Executive phone number not available");
    window.open(`tel:${phone}`, "_self");
  };

  // tags
  const getTagsFor = (id: string | number, limit = 4) => {
    const list = tagsByPropertyId[String(id)] || [];
    if (!list.length) return { shown: [], more: 0 };
    const shown = list.slice(0, limit);
    const more = Math.max(0, list.length - shown.length);
    return { shown, more };
  };

  // visit website with tracking
  const handleVisitWebsite = async (it: any, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const token = await ensureTrackingToken();
    const urlWithToken = getPropertyUrl(it, token);
    await trackEvent(it.id, "visit_website", { url: urlWithToken, item: it }, token);
    window.open(urlWithToken, "_blank", "noopener");
  };

  if (!isOpen || !buyer) return null;

  /* =========================== UI =========================== */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-[#E6761D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="text-[#0b3856]" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Property Matching</h2>
                <p className="text-white text-xs">Find perfect properties for {buyer?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white hover:bg-gray-50 shadow">
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
                  {hasBuyerMin ? formatCurrency(buyerMin) : "—"} - {hasBuyerMax ? formatCurrency(buyerMax) : "—"}
                </span>
              </div>

              <div>
                <span className="text-purple-600">Unit Types:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {toArr(buyerReq?.unitTypes).length > 0 ? toArr(buyerReq?.unitTypes).join(", ") : "—"}
                </span>
              </div>

              <div>
                <span className="text-purple-600">Locations:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {toArr(buyerReq?.preferredLocations).slice(0, 2).join(", ") || "—"}
                  {toArr(buyerReq?.preferredLocations).length > 2 &&
                    ` +${toArr(buyerReq?.preferredLocations).length - 2}`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-purple-800">
                <span>Budget tolerance (±%)</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  className="w-14 px-2 py-1 border border-purple-200 rounded"
                  value={budgetTolerancePct}
                  onChange={(e) =>
                    setBudgetTolerancePct(Math.max(0, Math.min(50, Number(e.target.value) || 0)))
                  }
                />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by property name, location, type..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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

          {/* List */}
          {!loadingProps && !propsError && (
            <>
              <div className="space-y-3">
                {filtered.map((it: any) => {
                  const idStr = String(it.id);
                  const { shown: tagsShown, more: tagsMore } = getTagsFor(idStr, 4);
                  const displayTitle = buildDisplayTitle(it);
                  const exec = getExecutive(it);
                  const execPhoneClean = cleanPhone(exec.phone || "");
                  const hasExecutive = exec.name || exec.email || exec.phone;

                  return (
                    <div key={idStr} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProperties.includes(idStr)}
                            onChange={() => handlePropertySelection(it.id)}
                            className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />

                          <div className="w-20 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            {it.photo ? (
                              <img
                                src={it.photo}
                                alt={displayTitle}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Building className="text-gray-400" size={24} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-base truncate">
                                  {nonEmpty(displayTitle) ? displayTitle : (str(it.title) || "—")}
                                </h4>

                                <div className="flex items-center gap-1 text-gray-600 mt-0.5 text-xs">
                                  <MapPin size={12} />
                                  <span className="truncate">{it.address || "—"}</span>
                                </div>

                                <div className="flex items-center gap-2 mt-1.5">
                                  <div
                                    className={`px-2 py-0.5 rounded-full border text-xs font-bold ${
                                      (it.matchScore || 0) >= 90
                                        ? "text-green-600 bg-green-100 border-green-200"
                                        : (it.matchScore || 0) >= 80
                                          ? "text-blue-600 bg-blue-100 border-blue-200"
                                          : (it.matchScore || 0) >= 70
                                            ? "text-orange-600 bg-orange-100 border-orange-200"
                                            : "text-red-600 bg-red-100 border-red-200"
                                    }`}
                                  >
                                    {(it.matchScore || 0)}% Match
                                  </div>

                                  {nonEmpty(it.statusText) && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                      {it.statusText}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right pl-2">
                                <div className="text-lg font-bold text-green-600">
                                  {nonEmpty(it.price) ? formatCurrency(Number(it.price) || 0) : "—"}
                                </div>
                                <div className="text-xs text-gray-500">{it.size || "—"}</div>
                              </div>
                            </div>

                            {!!tagsShown.length && (
                              <div className="flex items-center flex-wrap gap-1 mb-2">
                                {tagsShown.map((t) => {
                                  const tone = getTagStyle(t);
                                  const Emoji = tone.emoji as any;
                                  return (
                                    <span
                                      key={t}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
                                      title={t}
                                    >
                                      {typeof Emoji === "string" ? Emoji : Emoji ? <Emoji size={12} /> : null}
                                      <span className="leading-none">{t}</span>
                                    </span>
                                  );
                                })}
                                {tagsMore > 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                                    +{tagsMore}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Quick attributes */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                              <div className="truncate"><span className="text-gray-500">Floor:</span><span className="font-medium ml-1">{it.floorLine || "—"}</span></div>
                              <div className="truncate"><span className="text-gray-500">Facing:</span><span className="font-medium ml-1">{it.facing || "—"}</span></div>
                              <div className="truncate"><span className="text-gray-500">Parking:</span><span className="font-medium ml-1">{it.parking || "—"}</span></div>
                              <div className="truncate"><span className="text-gray-500">Possession:</span><span className="font-medium ml-1">{it.possession || "—"}</span></div>
                            </div>

                            {/* Executive */}
                            {hasExecutive && (
                              <div className="mb-3 p-2 bg-gray-50 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-900 truncate">
                                      Executive: {exec.name || "Not assigned"}
                                    </div>
                                    {exec.email && <div className="text-xs text-gray-600 truncate">📧 {exec.email}</div>}
                                    {exec.phone && <div className="text-xs text-gray-600 truncate">📞 {exec.phone}</div>}
                                    {!exec.name && !exec.email && !exec.phone && (
                                      <div className="text-xs text-gray-500">No executive details available</div>
                                    )}
                                  </div>
                                  {execPhoneClean && (
                                    <div className="flex items-center gap-1 ml-2">
                                      <button
                                        onClick={() => handleContactExecutive(it)}
                                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs"
                                      >
                                        <MessageCircle size={10} />
                                        <span>WhatsApp</span>
                                      </button>
                                      <button
                                        onClick={() => handleCallExecutive(it)}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs"
                                      >
                                        <Phone size={10} />
                                        <span>Call</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center flex-wrap gap-1.5">
                              <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs">
                                <Calendar size={12} />
                                <span>Visit</span>
                              </button>

                              <button className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs">
                                <Bookmark size={12} />
                                <span>Shortlist</span>
                              </button>

                              <a
                                href={getPropertyUrl(it)}
                                onClick={(e) => handleVisitWebsite(it, e)}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs"
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <Globe size={12} />
                                <span>Visit Website</span>
                              </a>

                              <button
                                onClick={() => setShareItem(it)}
                                className="flex items-center gap-1 px-2 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-md hover:bg-fuchsia-200 text-xs"
                              >
                                <Share2 size={12} />
                                <span>Share</span>
                              </button>

                              {execPhoneClean && (
                                <button
                                  onClick={() => handleContactExecutive(it)}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs"
                                >
                                  <MessageCircle size={12} />
                                  <span>Contact</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <Building className="mx-auto text-gray-300 mb-3" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">No matching public properties found</h3>
                  <p className="text-gray-500 text-xs">Adjust the search or widen the budget tolerance.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {filtered.length} properties found • {selectedProperties.length} selected
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
          propertyId={shareItem.id}
          slug={
            getSlug(shareItem) ||
            `${shareItem.id}-${getPropertyType(shareItem)}-${getUnitType(shareItem)}-${getPropertySubtype(shareItem)}`
              .replace(/\s+/g, "-")
              .toLowerCase()
          }
          title={buildDisplayTitle(shareItem)}
          description={shareItem.address}
          image={shareItem.photo}
          trackingToken={
            buyer?.filterContextId || buyer?.filter_id || buyer?.filterId || undefined
          }
          trackingParamKey={TRACKING_PARAM_KEY}
        />
      )}
    </div>
  );
};

export default PropertyMatchModal;
