// src/components/buyers/PropertiesTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  MapPin,
  Calendar,
  Heart,
  Phone,
  MessageCircle,
  Target,
} from 'lucide-react';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { toast } from 'react-toastify';
import PropertyDetailsShareModal from '@/components/properties/PropertyDetailsShareModal';

// ⬇️ NEW: tag API + styles
import getTagStyle, { type TagTone } from '@/lib/tagStyles';
import { propertyTagsAPI, type PropertyTagsRow } from '@/lib/propertyTagsAPI';

interface PropertiesTabProps {
  buyer: any;
  onShowPropertyMatch: () => void;
  onShowPropertySuggestions: () => void;
  onScheduleVisit?: () => void;
  onVisitClick?: (property: any) => void;
  onDetailsClick?: (property: any) => void;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({
  buyer,
  onShowPropertyMatch,
  onShowPropertySuggestions,
  onScheduleVisit,
  onVisitClick,
  onDetailsClick,
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propsError, setPropsError] = useState<string | null>(null);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openPropertyDetailsShareModal, setOpenPropertyDetailsShareModal] = useState(false);

  // ⬇️ NEW: tags state (map of property_id -> string[])
  const [tagsMap, setTagsMap] = useState<Record<string, string[]>>({});
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [loadingTags, setLoadingTags] = useState(false);

  // -------- Helpers --------
  const toArr = (v: any) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
  const norm = (s: any) => String(s || '').toLowerCase().trim();
  const hasAny = (haystack: string[], needles: string[]) =>
    needles.some((n) => haystack.some((h) => h.includes(n)));

  const req = buyer?.requirements || {};
  const reqUnitTypes = toArr(req.unitTypes).map(norm);
  const reqLocs = toArr(req.preferredLocations).map(norm);
  const reqAmenities = toArr(req.amenities).map(norm);
  const reqFacing = norm(req.facing);
  const reqFloorPref = norm(req.floor);
  const reqFurnishing = norm(req.furnishing);
  const reqPossession = norm(req.possession);
  const reqPropType = norm(req.propertyType);
  const reqKeywords = norm(req.specialRequirements || '')
    .split(/\s+/)
    .filter(Boolean);

  // Buyer budget accessors
  const getBuyerBudget = () => {
    const min = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? buyer?.minBudget ?? 0);
    const max = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? buyer?.maxBudget ?? 0);
    return { min, max };
  };
  const buyerBudget = getBuyerBudget();

  // Check if buyer has ANY real requirements (budget or other)
  const hasRequirements =
    reqUnitTypes.length > 0 ||
    reqLocs.length > 0 ||
    reqAmenities.length > 0 ||
    !!reqFacing ||
    !!reqFloorPref ||
    !!reqFurnishing ||
    !!reqPossession ||
    !!reqPropType ||
    reqKeywords.length > 0 ||
    (buyerBudget.min > 0 || buyerBudget.max > 0);

  // -------- Data load (only public properties) --------
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingProps(true);
      setPropsError(null);
      try {
        const res = await propertiesAPI.getProperties();

        const raw =
          (Array.isArray(res?.data) ? res?.data : null) ??
          (Array.isArray(res) ? res : null) ??
          (Array.isArray(res?.data?.rows) ? res?.data?.rows : []);

        const publicProperties = (raw || []).filter((p: any) => {
          const isPublic =
            p?.is_public === true ||
            p?.is_public === 1 ||
            p?.isPublic === true ||
            p?.public === true ||
            p?.visibility === 'public';
          return !!isPublic;
        });

        if (isMounted) setProperties(publicProperties ?? []);
      } catch (err: any) {
        console.error(err);
        toast.error('Could not load properties');
        if (isMounted) {
          setProperties([]);
          setPropsError('Could not load properties');
        }
      } finally {
        if (isMounted) setLoadingProps(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ⬇️ NEW: Load all property tags once and map by property_id
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingTags(true);
      setTagsError(null);
      try {
        const rows: PropertyTagsRow[] = await propertyTagsAPI.getAll();
        if (!active) return;

        const map: Record<string, string[]> = {};
        for (const r of rows) {
          const pid = String(r.property_id);
          map[pid] = Array.isArray(r.tags) ? r.tags.filter(Boolean) : [];
        }
        setTagsMap(map);
      } catch (e: any) {
        console.error('Tags load error:', e);
        setTagsError('Could not load property tags');
      } finally {
        if (active) setLoadingTags(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const formatCurrency = (amount?: number) => {
    const n = Number(amount);
    if (!n || Number.isNaN(n)) return '₹—';
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const unitTypeFrom = (p: any) => norm(p?.unit_type || p?.bhk || p?.configuration);
  const locTokensFrom = (p: any) =>
    [norm(p?.locality_name), norm(p?.location_name), norm(p?.address), norm(p?.city_name || p?.city)].filter(Boolean);
  const amenitiesFrom = (p: any) => (Array.isArray(p?.amenities) ? p.amenities : []).map(norm);
  const furnishingFrom = (p: any) => norm(p?.furnishing || p?.furnished_status);
  const propTypeFrom = (p: any) => norm(p?.property_subtype_name || p?.property_type_name || '');
  const descriptionFrom = (p: any) => norm(p?.description || p?.title || '');

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-700 bg-green-100';
    if (score >= 80) return 'text-blue-700 bg-blue-100';
    if (score >= 70) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  const getAvailabilityBadge = (status: string) => {
    const map: Record<string, string> = {
      Available: 'bg-emerald-100 text-emerald-700',
      Sold: 'bg-red-100 text-red-700',
      'Under Negotiation': 'bg-amber-100 text-amber-700',
    };
    const cls = map[status] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>
        {status || 'Available'}
      </span>
    );
  };

  const titleFrom = (p: any) => {
    const unit = p?.unit_type ? String(p.unit_type).toUpperCase() : '';
    const society = p?.society_name || p?.location_name || '';
    const type = p?.property_subtype_name || p?.property_type_name || '';
    const left = [unit, type].filter(Boolean).join(' ');
    return [left || p?.title || 'Property', society].filter(Boolean).join(' - ');
  };

  const addressFrom = (p: any) =>
    p?.address || [p?.location_name || p?.locality_name, p?.city_name || p?.city].filter(Boolean).join(', ');

  const priceFrom = (p: any) => Number(p?.budget ?? p?.price ?? p?.expected_price ?? 0);
  const priceRangeFrom = (p: any) => {
    const min = Number(p?.min_price ?? p?.budget_min ?? p?.minBudget ?? 0);
    const max = Number(p?.max_price ?? p?.budget_max ?? p?.maxBudget ?? 0);
    return { min, max };
  };

  // helper: consistent property id key
  const propertyKey = (p: any) => String(p?.id ?? p?.property_id ?? '');

  /**
   * STRICT budget filter
   * If buyer has NO budget (min=0 and max=0) => treat as NO MATCH.
   */
  const isWithinBuyerBudget = (p: any) => {
    const { min: bMin, max: bMax } = buyerBudget;

    if (bMin === 0 && bMax === 0) {
      return false;
    }

    const { min: pMin, max: pMax } = priceRangeFrom(p);
    const hasRange = pMin > 0 && pMax > 0 && pMax >= pMin;
    const price = Number(priceFrom(p)) || 0;
    const hasSinglePrice = price > 0;

    if (!hasRange && !hasSinglePrice) return false;

    const L = bMin > 0 ? bMin : 0;
    const R = bMax > 0 ? bMax : Number.MAX_SAFE_INTEGER;

    if (hasRange) {
      const overlaps = Math.max(pMin, L) <= Math.min(pMax, R);
      return overlaps;
    }

    if (hasSinglePrice) {
      const withinBudget = (L === 0 || price >= L) && (R === Number.MAX_SAFE_INTEGER || price <= R);
      return withinBudget;
    }

    return false;
  };

  const sellerFrom = (p: any) => p?.seller_name || p?.owner_name || p?.contact_name || '—';
  const sellerPhoneFrom = (p: any) =>
    p?.seller_phone || p?.owner_phone || p?.contact_phone || p?.phone || '';

  const sizeFrom = (p: any) => {
    const unit = p?.unit_type || '';
    const area = Number(p?.carpet_area ?? p?.area ?? p?.super_builtup_area ?? 0);
    const areaTxt = area ? `${Number(area).toLocaleString('en-IN')} sq ft` : '';
    return [unit, areaTxt].filter(Boolean).join(' • ');
  };

  const floorLine = (p: any) => {
    const f = p?.floor || '';
    const total = p?.total_floors ? `of ${p.total_floors}` : '';
    return [f && `Floor ${f}`, total].filter(Boolean).join(' ');
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
    '—';

  const parkingFrom = (p: any) => {
    const qty = p?.parking_qty ? String(p.parking_qty) : '';
    const type = p?.parking_type || '';
    return [qty, type].filter(Boolean).join(' ');
  };

  const possessionFrom = (p: any) => {
    const y = Number(p?.possession_year);
    const m = Number(p?.possession_month);
    if (y && m) {
      const dt = new Date(y, m - 1, 1);
      const now = new Date();
      if (dt <= now) return 'Ready to Move';
      return dt.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    }
    return p?.status === 'Available' ? 'Ready to Move' : p?.status || '—';
  };

  const computeReasons = (p: any) => {
    const reasons: string[] = [];
    const price = priceFrom(p);
    const bMin = buyerBudget.min;
    const bMax = buyerBudget.max;
    if (price && (bMin || bMax)) {
      if ((!bMin || price >= bMin) && (!bMax || price <= bMax)) reasons.push('💰 Perfect budget match');
      else if (bMin && bMax && price >= bMin * 0.9 && price <= bMax * 1.1) reasons.push('💸 Near your budget');
    }
    const u = unitTypeFrom(p);
    if (reqUnitTypes.length && u && reqUnitTypes.includes(u)) reasons.push(`🛏️ ${u.toUpperCase()} as preferred`);
    const locHits = reqLocs.length ? hasAny(locTokensFrom(p), reqLocs) : false;
    if (locHits) reasons.push('📍 Preferred location');
    const propAmns = amenitiesFrom(p);
    if (reqAmenities.length && propAmns.length) {
      const hit = reqAmenities.filter((a: string) => propAmns.includes(a));
      if (hit.length) reasons.push(`🏗️ Amenities matched (${hit.slice(0, 3).join(', ')})`);
    }
    const pfacing = norm(facingFrom(p));
    if (reqFacing && pfacing && pfacing === reqFacing) reasons.push(`🧭 ${reqFacing} facing`);
    const pfurn = furnishingFrom(p);
    if (reqFurnishing && pfurn && pfurn === reqFurnishing) reasons.push(`🛋️ ${reqFurnishing}`);
    const ppos = norm(possessionFrom(p));
    if (reqPossession && ppos && ppos.includes(reqPossession)) reasons.push(`🗓️ ${reqPossession}`);
    const ptype = propTypeFrom(p);
    if (reqPropType && ptype && ptype.includes(reqPropType)) reasons.push(`🏢 ${reqPropType} type`);
    const fl = norm(p?.floor || '');
    if (reqFloorPref) {
      if (reqFloorPref.includes('ground') && (fl.includes('ground') || fl === '0')) reasons.push('🏠 Ground floor');
      if (reqFloorPref.includes('higher') && /\d+/.test(fl) && Number(fl) >= 7) reasons.push('⬆️ Higher floor');
      if (reqFloorPref.includes('lower') && /\d+/.test(fl) && Number(fl) <= 3) reasons.push('⬇️ Lower floor');
    }
    if (reqKeywords.length) {
      const blob = descriptionFrom(p) + ' ' + amenitiesFrom(p).join(' ');
      const kwHit = reqKeywords.filter((k: string) => blob.includes(k)).slice(0, 3);
      if (kwHit.length) reasons.push(`✨ Matches: ${kwHit.join(', ')}`);
    }
    return reasons;
  };

  const computeMatchScore = (p: any) => {
    if (!hasRequirements) return 0; // no constraints => no scoring
    let score = 0;
    const price = priceFrom(p);
    const bMin = buyerBudget.min;
    const bMax = buyerBudget.max;
    if (price && (bMin || bMax)) {
      if ((!bMin || price >= bMin) && (!bMax || price <= bMax)) score += 25;
      else if (bMin && bMax && price >= bMin * 0.9 && price <= bMax * 1.1) score += 15;
      else score += 5;
    }
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
    const fl = norm(p?.floor || '');
    if (reqFloorPref) {
      if (reqFloorPref.includes('ground') && (fl.includes('ground') || fl === '0')) score += 2;
      else if (reqFloorPref.includes('higher') && /\d+/.test(fl) && Number(fl) >= 7) score += 2;
      else if (reqFloorPref.includes('lower') && /\d+/.test(fl) && Number(fl) <= 3) score += 2;
    }
    if (reqKeywords.length) {
      const blob = descriptionFrom(p) + ' ' + amenitiesFrom(p).join(' ');
      const hits = reqKeywords.filter((k: string) => blob.includes(k)).length;
      score += Math.min(5, hits * 2);
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const photoFrom = (p: any) => {
    const first = Array.isArray(p?.photos) && p.photos.length ? p.photos[0] : '';
    return typeof first === 'string' ? first : first?.url || '';
  };

  // ⬇️ NEW: get tags for a raw property from tagsMap
  const tagsFrom = (p: any): string[] => {
    const key = propertyKey(p);
    if (!key) return [];
    return tagsMap[key] ?? [];
  };

  // Build UI items — ONLY when there are requirements (budget and/or others).
  const items = useMemo(() => {
    if (!hasRequirements) {
      // No constraints => intentionally return NO MATCH items
      return [];
    }

    const budgetFiltered = properties.filter(isWithinBuyerBudget);

    return budgetFiltered
      .map((p: any) => {
        const matchScore = computeMatchScore(p);
        const reasons = computeReasons(p);
        return {
          id: propertyKey(p) || String(Math.random()),
          title: titleFrom(p),
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
          statusText: p?.status || 'Available',
          matchScore,
          photo: photoFrom(p),
          tags: tagsFrom(p), // ⬅️ NEW
          _raw: p,
          reasons,
        };
      })
      .filter((item) => item.matchScore > 0);
  }, [properties, buyerBudget.min, buyerBudget.max, hasRequirements, tagsMap]);

  // Empty state conditions
  const hasAnyPublic = properties.length > 0;
  const hasAnyMatch = items.length > 0;
  const showNoMatchState = !loadingProps && !propsError && hasAnyPublic && !hasAnyMatch;
  const showMatchState = !loadingProps && !propsError && hasAnyMatch;
  const showNoPublicState = !loadingProps && !propsError && !hasAnyPublic;

  const selectedItems = useMemo(() => items.filter((it) => selected.has(it.id)), [items, selected]);
  const selectedRaw = useMemo(() => selectedItems.map((it) => it._raw), [selectedItems]);

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const contactSeller = (name: string, phone: string, title: string) => {
    const clean = (phone || '').replace(/\D/g, '');
    if (!clean) return;
    const msg = `Hi ${name || 'there'}, I'd like to discuss your property: ${title}.`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ⬇️ NEW: Reusable TagBadge (supports emoji or Lucide icon)
  const TagBadge: React.FC<{ label: string }> = ({ label }) => {
    const tone: TagTone = getTagStyle(label);
    const Icon = typeof tone.emoji === 'function' ? tone.emoji : null;
    const emoji = typeof tone.emoji === 'string' ? tone.emoji : null;

    return (
      <span
        className={[
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] leading-none ring-1',
          tone.bg,
          tone.text,
          tone.ring,
        ].join(' ')}
        title={label}
      >
        {emoji ? <span>{emoji}</span> : null}
        {Icon ? <Icon size={12} /> : null}
        <span className="font-medium">{label}</span>
      </span>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-2">
          <button
            onClick={onShowPropertyMatch}
            className="flex items-center space-x-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            <Target size={14} />
            <span>Find Matching Properties</span>
          </button>

          {selected.size > 0 && (
            <button
              onClick={() => setOpenPropertyDetailsShareModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
            >
              Share ({selected.size})
            </button>
          )}
        </div>

        {/* Loading / Error */}
        {(loadingProps || loadingTags) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-600">
            Loading {loadingProps ? 'properties' : 'tags'}…
          </div>
        )}
        {propsError && !loadingProps && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 text-center text-sm text-red-600">
            {propsError}
          </div>
        )}
        {tagsError && !loadingTags && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 text-center text-sm text-amber-700">
            {tagsError}
          </div>
        )}

        {/* Public Properties Count */}
        {!loadingProps && !propsError && hasAnyPublic && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700 font-medium">
                {showMatchState
                  ? `Showing ${items.length} public ${items.length === 1 ? 'property' : 'properties'} matching your criteria`
                  : `Showing ${properties.length} public ${properties.length === 1 ? 'property' : 'properties'}`}
              </span>
              <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                🔓 Public listings only
              </span>
            </div>
          </div>
        )}

        {/* Cards */}
        {showMatchState && (
          <div className="space-y-3">
            {items.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="mt-2 accent-blue-600"
                    checked={selected.has(property.id)}
                    onChange={() => toggleSelect(property.id)}
                  />

                  {/* Photo */}
                  <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-none">
                    {property.photo ? (
                      <img src={property.photo} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Main content */}
                  <div className="flex-1">
                    {/* Title + price */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{property.title}</h4>

                        {/* ⬇️ NEW: Tag chips row (if any) */}
                        {Array.isArray(property.tags) && property.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {property.tags.slice(0, 6).map((t, i) => (
                              <TagBadge key={`${property.id}-tag-${i}-${t}`} label={t} />
                            ))}
                            {property.tags.length > 6 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600">
                                +{property.tags.length - 6} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-1 text-gray-600 mt-1 text-xs">
                          <MapPin size={12} />
                          <span>{property.address || '—'}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getMatchScoreColor(
                              property.matchScore
                            )}`}
                          >
                            {property.matchScore}% Match
                          </div>
                          {getAvailabilityBadge(property.statusText)}
                          {shortlisted.has(property.id) && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700">
                              ⭐ Shortlisted
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
                            🔓 Public
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-green-600">
                          {formatCurrency(property.price)}
                        </div>
                        <div className="text-[11px] text-gray-500">{property.size}</div>
                      </div>
                    </div>

                    {/* Attributes row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-xs">
                      <div>
                        <span className="text-gray-500">Floor:</span>{' '}
                        <span className="font-semibold">{property.floorLine || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Facing:</span>{' '}
                        <span className="font-semibold">{property.facing}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Parking:</span>{' '}
                        <span className="font-semibold">{property.parking || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Possession:</span>{' '}
                        <span className="font-semibold">{property.possession}</span>
                      </div>
                    </div>

                    {/* Why it matches */}
                    {property.reasons?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Why it matches:</div>
                        <div className="flex flex-wrap gap-1">
                          {property.reasons.slice(0, 4).map((r: string, i: number) => (
                            <span
                              key={`${r}-${i}`}
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Amenities:</div>
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 6).map((a: string, i: number) => (
                            <span
                              key={`${a}-${i}`}
                              className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700"
                            >
                              {a}
                            </span>
                          ))}
                          {property.amenities.length > 6 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-500">
                              +{property.amenities.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Seller row + contact pill */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-700">
                        <span className="text-gray-500">Seller: </span>
                        <span className="font-medium">{property.seller}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="text-gray-500">Contact: </span>
                        <span className="font-medium">{property.sellerPhone || '—'}</span>
                      </div>

                      {property.sellerPhone && (
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100"
                          onClick={() => contactSeller(property.seller, property.sellerPhone, property.title)}
                        >
                          <MessageCircle size={14} /> Contact
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                        onClick={() => onVisitClick?.(property)}
                      >
                        <Calendar size={14} />
                        <span>Visit</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                        onClick={() => toggleShortlist(property.id)}
                      >
                        <Heart size={12} />
                        <span>{shortlisted.has(property.id) ? 'Shortlisted' : 'Shortlist'}</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs"
                        onClick={() => onDetailsClick?.(property)}
                        disabled={!onDetailsClick}
                        title={onDetailsClick ? 'Details' : 'Wire a details handler to enable'}
                      >
                        Details
                      </button>

                      {property.sellerPhone && (
                        <a
                          href={`tel:${property.sellerPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs"
                        >
                          <Phone size={14} />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {showNoPublicState && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Building className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No Public Properties Found
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              We don't have any public listings right now. Try again later or view private matches.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={onShowPropertyMatch}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                <Target size={14} />
                <span>Find Properties</span>
              </button>
            </div>
          </div>
        )}

        {showNoMatchState && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-8 text-center">
            <Building className="mx-auto text-amber-300 mb-3" size={48} />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No Properties Matched Your Criteria
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              We found {properties.length} public {properties.length === 1 ? 'property' : 'properties'}, but none match your budget or requirements. Try adding a budget or broadening your filters.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={onShowPropertyMatch}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                <Target size={14} />
                <span>Find Matching Properties</span>
              </button>
              <button
                onClick={onShowPropertySuggestions}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs"
              >
                <span>Show Suggestions</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {openPropertyDetailsShareModal && (
        <PropertyDetailsShareModal
          isOpen={openPropertyDetailsShareModal}
          onClose={() => setOpenPropertyDetailsShareModal(false)}
          selectedProperties={selectedRaw}
          buyer={buyer}
        />
      )}
    </>
  );
};

export default PropertiesTab;
