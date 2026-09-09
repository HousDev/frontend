// PublicPropertiesPage.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { trackEvent } from '@/utils/tracker';
import {
  Search, MapPin, Building, Star, Heart, Eye, Phone, Home, Grid, List,
  Bed, Car, Wifi, Dumbbell, Shield, TreePine, Waves, CheckCircle,
  SlidersHorizontal, Bot, BarChart3, TrendingUp, ChevronDown, Target
} from 'lucide-react';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import PublicRentalPropertyDetailPage from './PublicRentalPropertyDetailPage';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import { useNavigate, useLocation } from 'react-router-dom';
import viewsAPI from '@/lib/viewAPI';
import { FaWhatsapp } from 'react-icons/fa';

import propertyTagsAPI from '@/lib/propertyTagsAPI';
import { getTagStyle } from "@/lib/tagStyles";
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { recordAndCheckGuestPropertyLimit } from '@/utils/guestViewTracker';
import { getImageUrl, DEFAULT_PROPERTY_IMAGE, DEFAULT_PROPERTY_IMAGES } from '@/lib/helpers';

/* ==============================
   Types
============================== */
interface Property {
  id: number;
  propertyId?: string;
  title: number | string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  city: string;
  property_type: string;
  status: string;
  images?: string[];
  location?: string;
  society?: string;
  area?: number;
  parking?: number;
  type?: string;
  furnishing?: string;
  possession?: string;
  amenities?: string[];
  rating?: number;
  reviews?: number;
  postedDate?: string;
  views?: number;
  aiScore?: number;
  priceGrowth?: string;
  investmentGrade?: string;
  executiveTo?: { name: string; phone: string; rating: number; email?: string };
  highlights?: string[];
  nearbyPlaces?: Array<{ name: string; distance: string }>;
  unit_type?: string;
  property_subtype?: string;
  carpet_area?: number;
  builtup_area?: number;
  _raw?: any;
  slug?: string;
  total_views?: number;
  public_views?: number | null;
  floor?: number | null;
  tags?: string[];
  listing_type?: string;
  transaction_type?: string;
  monthly_rent?: number;
  expected_rent?: number;
  purpose?: string;
}

/* ==============================
   Default Images Constants
============================== */
const DEFAULT_IMAGES = {
  APARTMENT: '/property.png',
  HOUSE: '/property.png',
  VILLA: '/property.png',
  PLOT: '/property.png',
  COMMERCIAL: '/property.png',
  DEFAULT: '/property.png'
};

/* ==============================
   Helper Functions
============================== */

// ✅ Property type se default image dhundne ka function
const getDefaultImageByType = (propertyType: string): string => {
  if (!propertyType) return DEFAULT_IMAGES.DEFAULT;
  const type = propertyType.toLowerCase();

  if (type.includes('apartment') || type.includes('flat')) return DEFAULT_IMAGES.APARTMENT;
  if (type.includes('house') || type.includes('bungalow') || type.includes('independent')) return DEFAULT_IMAGES.HOUSE;
  if (type.includes('villa')) return DEFAULT_IMAGES.VILLA;
  if (type.includes('plot') || type.includes('land')) return DEFAULT_IMAGES.PLOT;
  if (type.includes('commercial') || type.includes('shop') || type.includes('office') || type.includes('retail'))
    return DEFAULT_IMAGES.COMMERCIAL;

  return DEFAULT_IMAGES.DEFAULT;
};

// ✅ ADD this helper near getDefaultImageByType
const isVideoUrl = (u: string) =>
  /\.(mp4|mov|webm|mkv)$/i.test(u) || /youtube\.com|youtu\.be/i.test(u);

// ✅ Public gate — client-side hard guard
const isPublicProp = (p: any): boolean => {
  // accept typical shapes: booleans, 0/1, strings
  if (!p) return false;
  const v = (p.visibility || p._raw?.visibility || '').toString().toLowerCase();
  return (
    p.is_public === 1 ||
    p.isPublic === true ||
    p.public === true ||
    v === 'public'
  );
};

const formatCurrency = (amount: number | string) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return ' - ';

  const CRORE = 10_000_000;
  const LAKH = 100_000;

  // Crores → keep actual value (max 2 decimals, no rounding loss)
  if (n >= CRORE) {
    const cr = n / CRORE;
    return `₹${parseFloat(cr.toFixed(2))}Cr`;
  }

  // Lakhs → whole lakhs only
  if (n >= LAKH) {
    const l = n / LAKH;
    return `₹${parseFloat(l.toFixed(0))}L`;
  }

  // Rupees
  return `₹${n.toLocaleString('en-IN')}`;
};

// amenity icon
const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'swimming pool': return <Waves size={14} />;
    case 'gym': return <Dumbbell size={14} />;
    case '24/7 security':
    case 'security': return <Shield size={14} />;
    case 'garden': return <TreePine size={14} />;
    case 'parking': return <Car size={14} />;
    case 'wifi': return <Wifi size={14} />;
    default: return <CheckCircle size={14} />;
  }
};

// unit extraction
const extractUnitType = (p: Property) => {
  const directUnit = (p.unit_type || (p as any).unitType || (p as any)._raw?.unit_type || (p as any)._raw?.unit_type_name || (p as any)._raw?.bhk || '')?.toString().trim();
  if (directUnit) {
    if (/^\d+(\.\d+)?$/.test(directUnit)) return `${directUnit} BHK`;
    return directUnit;
  }

  const candidates = [
    p.unit_type,
    (p as any).unitType,
    (p as any)._raw?.unit_type,
    (p as any)._raw?.unit_type_name,
    p.type,
    p.title as any,
    p.property_type
  ].filter(Boolean).map(String);

  for (const c of candidates) {
    const m = c.match(/(\d+(?:\.\d+)?\s*BHK|\d+(?:\.\d+)?\s*RK|studio|penthouse|duplex|bungalow|villa)/i);
    if (m) {
      const matchText = m[0].trim();
      if (/^\d+(\.\d+)?\s*BHK$/i.test(matchText)) {
        return matchText.replace(/\s+/g, '').replace(/bhk/i, ' BHK');
      }
      return matchText;
    }
  }
  if (p.bedrooms && Number.isFinite(p.bedrooms) && p.bedrooms > 0) return `${p.bedrooms} BHK`;
  return '';
};

const composeHeaderTitle = (p: Property) => {
  const parts: string[] = [];
  const type = ((p as any)._raw?.property_type_name || p.property_type || (p as any)._raw?.property_type || '').toString().trim();
  if (type) parts.push(type);

  const unit = extractUnitType(p);
  if (unit && !parts.some(pt => pt.toLowerCase() === unit.toLowerCase())) {
    parts.push(unit);
  }

  const subtype = (
    (p as any)._raw?.property_subtype_name ||
    (p as any)._raw?.property_subtype ||
    (p as any).property_subtype ||
    (p as any)._raw?.subtype ||
    (p as any).subtype ||
    p.society ||
    ''
  ).toString().trim();

  if (subtype && !parts.some(pt => pt.toLowerCase() === subtype.toLowerCase()) && subtype.toLowerCase() !== unit.toLowerCase()) {
    parts.push(subtype);
  }

  if (parts.length === 0 && p.title) return p.title as any;
  return parts.join(' ');
};

const formatUnitAreaLine = (p: Property) => {
  const unit = extractUnitType(p);
  const area = p.area || p.square_feet || (p as any)._raw?.carpet_area || (p as any)._raw?.builtup_area;
  const areaText = area ? `${Number(area).toFixed(area % 1 === 0 ? 0 : 2).replace(/\.0+$/, '')} sq ft` : '';
  return [unit, areaText].filter(Boolean).join(' • ');
};

const splitLocationCity = (p: Property) => {
  const loc = (p.location || '').toString();
  if (!loc) return { locationPart: '', cityPart: p.city || '' };
  const parts = loc.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 1) return { locationPart: parts[0], cityPart: p.city || '' };
  const cityPart = parts.slice(-1).join(', ');
  const locationPart = parts.slice(0, -1).join(', ');
  return { locationPart, cityPart: cityPart || (p.city || '') };
};

const parseMoneyToken = (tok: string) => {
  if (!tok) return NaN;
  const t = tok.toLowerCase().replace(/\s+/g, '');
  const match = t.match(/^([0-9.,]+)(k|m|l|cr|crore|lakh)?\+?$/i);
  if (match) {
    let num = parseFloat(match[1].replace(/,/g, ''));
    const unit = (match[2] || '').toLowerCase();
    if (unit === 'k') num *= 1000;
    else if (unit === 'm') num *= 1000000;
    else if (unit === 'l' || unit === 'lakh') num *= 100000;
    else if (unit === 'cr' || unit === 'crore') num *= 10000000;
    return Math.round(num);
  }
  const plain = parseFloat(t.replace(/,/g, ''));
  return isNaN(plain) ? NaN : plain;
};

const parseBudgetRange = (value: string): [number, number] => {
  if (!value) return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
  const v = value.toString().trim();
  if (v.includes('-')) {
    const parts = v.split('-').map((s) => s.trim());
    const min = parseMoneyToken(parts[0]);
    const max = parseMoneyToken(parts[1]);
    return [isNaN(min) ? Number.NEGATIVE_INFINITY : min, isNaN(max) ? Number.POSITIVE_INFINITY : max];
  }
  if (v.endsWith('+')) {
    const tok = v.replace(/\+$/, '');
    const min = parseMoneyToken(tok);
    return [isNaN(min) ? Number.NEGATIVE_INFINITY : min, Number.POSITIVE_INFINITY];
  }
  const nums = v.match(/([0-9.,]+)\s*(k|m|l|cr|crore|lakh)?/gi);
  if (nums && nums.length === 1) {
    const max = parseMoneyToken(nums[0]);
    return [Number.NEGATIVE_INFINITY, isNaN(max) ? Number.POSITIVE_INFINITY : max];
  }
  return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
};

const matchesBudget = (property: Property, budget: string) => {
  if (!budget) return true;
  const [min, max] = parseBudgetRange(budget);
  const price = property.price || 0;
  return price >= (isFinite(min) ? min : Number.NEGATIVE_INFINITY) &&
    price <= (isFinite(max) ? max : Number.POSITIVE_INFINITY);
};

const extractFloor = (p: any) => {
  if (!p) return null;
  if (p.floor !== undefined && p.floor !== null) return Number(p.floor);
  if (p._raw?.floor_number) return Number(p._raw.floor_number);
  if (p._raw?.floor) return Number(p._raw.floor);
  if (p._raw?.current_floor) return Number(p._raw?.current_floor);
  return null;
};

const extractBathrooms = (p: any) => {
  if (!p) return null;
  if (p.bathrooms !== undefined && p.bathrooms !== null) return Number(p.bathrooms);
  if (p._raw?.bathrooms) return Number(p._raw?.bathrooms);
  if (p._raw?.toilets) return Number(p._raw?.toilets);
  return null;
};

// ✅ IMPROVED: Dynamic parking extraction
const extractParkingCount = (p: any): number => {
  if (!p) return 0;

  // Try multiple possible parking fields
  const possibleFields = [
    p.parking,
    p.parkingQty,
    p.parking_qty,
    p.parking_spots,
    p.car_parking,
    p._raw?.parking,
    p._raw?.parkingQty,
    p._raw?.parking_qty,
    p._raw?.parking_spots,
    p._raw?.car_parking,
    p._raw?.parking_count
  ];

  for (const field of possibleFields) {
    if (field !== undefined && field !== null && field !== '') {
      const num = Number(field);
      if (Number.isFinite(num) && num >= 0) {
        return num;
      }
    }
  }

  // Fallback: Check amenities for parking
  const amenities = Array.isArray(p.amenities) ? p.amenities : [];
  const hasParking = amenities.some((a: string) =>
    a.toLowerCase().includes('parking') ||
    a.toLowerCase().includes('car parking')
  );

  return hasParking ? 1 : 0;
};

const extractParkingTypes = (p: any) => {
  const raw = p._raw || {};
  let parkingTypes: string[] = [];
  if (raw.parking_types) {
    if (Array.isArray(raw.parking_types)) parkingTypes = raw.parking_types.map((s: string) => s.toString().toLowerCase());
    else if (typeof raw.parking_types === 'string') parkingTypes = raw.parking_types.split(',').map((s: string) => s.trim().toLowerCase());
  }
  if (raw.parking_details) {
    if (typeof raw.parking_details === 'string') parkingTypes = parkingTypes.concat(raw.parking_details.split(',').map((s: string) => s.trim().toLowerCase()));
    else if (Array.isArray(raw.parking_details)) parkingTypes = parkingTypes.concat(raw.parking_details.map((s: string) => s.toString().toLowerCase()));
  }

  // Use dynamic parking count
  const parkingCount = extractParkingCount(p);
  if (parkingCount > 0) {
    parkingTypes.push('4w', '2w');
  }

  if (Array.isArray(p.amenities)) {
    p.amenities.forEach((a: string) => {
      const low = a.toLowerCase();
      if (low.includes('2 wheeler') || low.includes('2-wheeler') || low.includes('two wheeler')) parkingTypes.push('2w');
      if (low.includes('4 wheeler') || low.includes('4-wheeler') || low.includes('four wheeler') || low.includes('car parking')) parkingTypes.push('4w');
    });
  }
  return Array.from(new Set(parkingTypes));
};

/* ==============================
   Tags UI
============================== */

// ✅ Tag display component
const PropertyTags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;

  // ✅ Only show first 2 tags
  const displayTags = tags.slice(0, 2);

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {displayTags.map((tag, index) => {
        const style = getTagStyle(tag);
        const EmojiComponent = typeof style.emoji === 'string'
          ? () => <span className="text-xs mr-1">{style.emoji
            ? typeof style.emoji === "string"
              ? (
                <span className="text-xs mr-1 uppercase" aria-hidden="true">
                  {style.emoji}
                </span>
              )
              : (
                // style.emoji is a component here (Lucide icon)
                React.createElement(style.emoji, {
                  size: 10,
                  className: "mr-1 uppercase",
                  "aria-hidden": true,
                })
              )
            : null}
          </span>
          : style.emoji;

        return (
          <span
            key={index}
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase 
              ${style.bg} ${style.text} ring-1 ${style.ring}
              transition-all duration-200
            `}
          >
            {style.emoji && (typeof style.emoji === 'string' ? <EmojiComponent /> : <EmojiComponent size={10} className="mr-1" />)}
            {tag}
          </span>
        );
      })}
      {/* ✅ Show +count if there are more than 2 tags */}
      {tags.length > 2 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{tags.length - 2}
        </span>
      )}
    </div>
  );
};

/* ==============================
   Component
============================== */
const PublicPropertiesPage: React.FC<{ onPropertyView?: (p: any) => void }> = ({ onPropertyView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { systemSettings } = useSystemSettings();
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

  // core UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Pune'); // ✅ Changed: Default to Pune
  const [localityInput, setLocalityInput] = useState('');
  const [localities, setLocalities] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [likedProperties, setLikedProperties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [currentPropertyView, setCurrentPropertyView] = useState<any>('');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [viewedProperties, setViewedProperties] = useState<Set<number>>(new Set());

  const [minRating, setMinRating] = useState<number | null>(null);
  const [possessionFilter, setPossessionFilter] = useState('');
  const [parkingFilter, setParkingFilter] = useState<'any' | '2w' | '4w'>('any');
  const [floorMin, setFloorMin] = useState<number | ''>('');
  const [floorMax, setFloorMax] = useState<number | ''>('');
  const [bathroomsFilter, setBathroomsFilter] = useState<number | ''>('');
  const [selectedPropertySubtype, setSelectedPropertySubtype] = useState('');
  const [selectedUnitType, setSelectedUnitType] = useState('');

  // HomePage-style header states
  const [transactionType, setTransactionType] = useState<'buy' | 'rent'>('buy');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');

  // token passthrough (kept)
  const queryParams = new URLSearchParams(location.search);
  const filterParamKey =
    queryParams.has('filterToken') ? 'filterToken' : queryParams.has('fltcnt') ? 'fltcnt' : undefined;
  const filterTokenFromUrl =
    filterParamKey ? (queryParams.get(filterParamKey) as string | null) ?? undefined : undefined;

  // refs & autosuggest
  const filtersRef = useRef<HTMLDivElement | null>(null);
  const [suggestions, setSuggestions] = useState<MasterOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // masters
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
        setMasters(data || {});
      } catch (err) {
        console.error('Error fetching master options:', err);
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, []);

  // Track search & filter intent (Debounced)
  useEffect(() => {
    const hasFilter = searchQuery || selectedBudget || selectedBedrooms || selectedLocation || selectedPropertyType;
    if (!hasFilter) return;

    const timer = setTimeout(() => {
      trackEvent({
        eventType: 'search',
        eventName: searchQuery ? 'search_performed' : 'filter_applied',
        payload: {
          search_query: searchQuery || undefined,
          locality: selectedLocation || undefined,
          budget: selectedBudget || undefined,
          bhk: selectedBedrooms || undefined,
          property_type: selectedPropertyType || undefined,
          transaction_type: transactionType,
        },
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedLocation, selectedBudget, selectedBedrooms, selectedPropertyType, transactionType]);

  // helpers
  const findMasterOptions = useCallback((candidateKeys: string[]) => {
    if (!masters || typeof masters !== 'object') return [];
    const normalizedMap: Record<string, string> = {};
    Object.keys(masters).forEach((k) => {
      normalizedMap[k.toLowerCase().replace(/\s+/g, '')] = k;
    });

    for (const ck of candidateKeys) {
      const nk = ck.toLowerCase().replace(/\s+/g, '');
      if (normalizedMap[nk]) {
        const realKey = normalizedMap[nk];
        const arr = masters[realKey];
        if (Array.isArray(arr)) return arr;
      }
    }

    for (const ck of candidateKeys) {
      const nk = ck.toLowerCase().replace(/\s+/g, '');
      const foundKey = Object.keys(masters).find((k) =>
        k.toLowerCase().replace(/\s+/g, '').includes(nk)
      );
      if (foundKey) {
        const arr = masters[foundKey];
        if (Array.isArray(arr)) return arr;
      }
    }
    return [];
  }, [masters]);

  const masterCity: any[] = useMemo(() => findMasterOptions(['city']), [findMasterOptions]);
  const cityOptions = useMemo(() => masterCity.map((o) => ({ value: o.value, label: o.label })), [masterCity]);

  const budgetMaster: any[] = useMemo(() => findMasterOptions(['price range', 'price_range', 'budget', 'budget range', 'priceRange', 'price']), [findMasterOptions]);
  const budgetOptions = useMemo(() => budgetMaster.map((o) => ({ value: o.value, label: o.label })), [budgetMaster]);

  const propertyTypesMaster: any[] = useMemo(() => findMasterOptions(['property type', 'property_type', 'type', 'place type', 'category']), [findMasterOptions]);
  const propertyTypeOptions = useMemo(() => propertyTypesMaster.map((o) => ({ value: o.value || o.label, label: o.label || o.value })), [propertyTypesMaster]);

  const propertySubtypesMaster: any[] = useMemo(() => findMasterOptions(['property subtype', 'property_subtype', 'subtype', 'unit subtype']), [findMasterOptions]);
  const propertySubtypeOptions = useMemo(() => propertySubtypesMaster.map((o) => ({ value: o.value || o.label, label: o.label || o.value })), [propertySubtypesMaster]);

  const unitTypesMaster: any[] = useMemo(() => findMasterOptions(['unit type', 'unit_type', 'unit', 'bhk', 'bedrooms']), [findMasterOptions]);
  const unitTypeOptions = useMemo(() => unitTypesMaster.map((o) => ({ value: o.value || o.label, label: o.label || o.value })).filter(Boolean), [unitTypesMaster]);

  const bedroomsMaster: any[] = useMemo(() => findMasterOptions(['bedrooms', 'bhk', 'beds', 'unit type', 'unit', 'unit_type']), [findMasterOptions]);
  const bedroomOptions = useMemo(() => bedroomsMaster
    .map((o) => {
      const text = (o.value || o.label || '').toString();
      const m = text.match(/(\d+)/);
      if (m) {
        const num = m[1];
        return { value: num, label: `${num} BHK` };
      }
      return { value: text, label: o.label || text };
    })
    .filter((v, i, arr) => arr.findIndex((x) => x.value === v.value) === i), [bedroomsMaster]);

  const masterLocation: MasterOption[] = useMemo(() => findMasterOptions(['location', 'locality', 'localities', 'area', 'neighbourhood', 'neighborhood', 'locality_name']), [findMasterOptions]);

  // views/tags API wrappers
  const fetchPropertyViews = async (propertyId: number, slug?: string): Promise<{ total_views: number }> => {
    try {
      const viewData = await viewsAPI.getByProperty(propertyId, false, slug);
      return { total_views: viewData?.total_views || 0 };
    } catch (err) {
      console.error(`Error fetching views for property ${propertyId}:`, err);
      return { total_views: 0 };
    }
  };

  const fetchPropertyTags = async (propertyId: number): Promise<string[]> => {
    try {
      const tagsData = await propertyTagsAPI.getById(propertyId);
      return tagsData?.tags || [];
    } catch {
      return [];
    }
  };

  // url → state
  useEffect(() => {
    const qp = new URLSearchParams(location.search);

    // ✅ Changed: Default to Pune if no city in URL
    const cityFromUrl = qp.get('city') || 'Pune';
    setSelectedLocation(cityFromUrl);

    const rawTx = qp.get('transaction') || qp.get('tab') || qp.get('intent') || qp.get('type') || 'buy';
    const transactionFromUrl = rawTx.toLowerCase().includes('rent') ? 'rent' : 'buy';
    setTransactionType(transactionFromUrl);

    let locs: string[] = [];
    const repeated = qp.getAll('location');
    if (repeated.length > 0) {
      repeated.forEach(v => {
        v.split(',').forEach(s => {
          const t = s.trim();
          if (t) locs.push(t);
        });
      });
    } else {
      const csv = qp.get('locations');
      if (csv) {
        csv.split(',').forEach(s => {
          const t = s.trim();
          if (t) locs.push(t);
        });
      }
    }

    locs = Array.from(new Set(locs)).slice(0, 5);
    setLocalities(locs);

    if (locs.length) setSearchQuery(locs.join(', '));
    else if (cityFromUrl) setSearchQuery(cityFromUrl);
    else setSearchQuery('');

    setCurrentPage(1);
  }, [location.search]);

  // main loader (ONLY PUBLIC)
  const loadPropertiesFromSearch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qp = new URLSearchParams(location.search);

      const hasAdvanced = Boolean(
        qp.get('propertyType') || qp.get('property_type') ||
        qp.get('budget_min') || qp.get('minPrice') ||
        qp.get('budget_max') || qp.get('maxPrice') ||
        qp.get('unitTypes') || qp.get('unitType') || qp.get('unit_type') ||
        qp.get('furnishing') || qp.get('possession') ||
        qp.get('min_rating') || qp.get('parking') ||
        qp.get('floor_min') || qp.get('floor_max') ||
        qp.get('bathrooms') || qp.get('bedrooms') ||
        qp.get('property_subtype') || qp.get('propertySubtype') ||
        qp.get('sort')
      );

      // --- helpers ---
      const normalizeResponse = (resp: any): any[] => {
        if (Array.isArray(resp)) return resp;
        if (resp?.data && Array.isArray(resp.data)) return resp.data;
        if (resp?.results && Array.isArray(resp.results)) return resp.results;
        if (resp?.properties && Array.isArray(resp.properties)) return resp.properties;
        if (Array.isArray(resp?.items)) return resp.items;
        return [];
      };

      const buildAdvancedParams = () => {
        const params: any = {
          // public gate
          isPublic: true, is_public: 1, visibility: 'public', publicOnly: 1,
        };

        // location (support repeated + CSV)
        const allLocs = qp.getAll('location');
        if (allLocs.length > 0) params.location = allLocs.join(',');
        else if (qp.get('location')) params.location = qp.get('location');

        // city
        if (qp.get('city')) params.city = qp.get('city');

        // property type (send both keys)
        const pt = qp.get('propertyType') || qp.get('property_type');
        if (pt) { params.propertyType = pt; params.property_type = pt; }

        // subtype
        const pst = qp.get('property_subtype') || qp.get('propertySubtype');
        if (pst) { params.propertySubtype = pst; params.property_subtype = pst; }

        // unit types (collect + send all aliases)
        let unitTypes: string[] = [];
        if (qp.get('unitTypes')) {
          unitTypes = (qp.get('unitTypes') || '')
            .split(',').map(s => s.trim()).filter(Boolean);
        } else if (qp.get('unitType') || qp.get('unit_type')) {
          unitTypes = [qp.get('unitType') || qp.get('unit_type')!].filter(Boolean) as string[];
        }
        if (unitTypes.length) {
          params.unitTypes = unitTypes;
          params.unitType = unitTypes[0];           // some backends accept single
          params.unit_type = unitTypes.join(',');   // some accept CSV
        }

        // budget (send both styles)
        const budgetMin = qp.get('budget_min') || qp.get('minPrice');
        const budgetMax = qp.get('budget_max') || qp.get('maxPrice');
        if (budgetMin) { params.budget_min = Number(budgetMin); params.minPrice = Number(budgetMin); }
        if (budgetMax) { params.budget_max = Number(budgetMax); params.maxPrice = Number(budgetMax); }

        if (qp.get('sort')) params.sort = qp.get('sort');
        if (qp.get('furnishing')) params.furnishing = qp.get('furnishing');
        if (qp.get('possession')) params.possession = qp.get('possession');
        if (qp.get('min_rating')) params.minRating = Number(qp.get('min_rating'));
        if (qp.get('parking')) params.parking = qp.get('parking');
        if (qp.get('floor_min')) params.floor_min = Number(qp.get('floor_min'));
        if (qp.get('floor_max')) params.floor_max = Number(qp.get('floor_max'));
        if (qp.get('bathrooms')) params.bathrooms = Number(qp.get('bathrooms'));
        if (qp.get('bedrooms')) params.bedrooms = qp.get('bedrooms');
        if (qp.get('status')) params.status = qp.get('status');
        if (filterParamKey && filterTokenFromUrl) params.filterToken = filterTokenFromUrl;

        return params;
      };

      const buildSimpleParams = () => {
        const simpleParams: any = {
          status: qp.get('status') || 'Available',
          limit: 50,
          isPublic: true, is_public: 1, visibility: 'public', publicOnly: 1,
        };

        const allLocs = qp.getAll('location');
        if (allLocs.length > 0) simpleParams.location = allLocs.join(',');
        else if (qp.get('location')) simpleParams.location = qp.get('location');

        if (qp.get('city')) simpleParams.city = qp.get('city');
        if (qp.get('search')) simpleParams.q = qp.get('search');
        return simpleParams;
      };

      const hadPropertyTypeInUrl = Boolean(qp.get('propertyType') || qp.get('property_type'));

      let response: any = null;
      let list: any[] = [];
      const rawTx = qp.get('transaction') || qp.get('tab') || qp.get('intent') || qp.get('type') || '';
      const isRent = rawTx.toLowerCase().includes('rent') || transactionType === 'rent';
      const activeAPI = isRent ? rentalPropertiesAPI : propertiesAPI;

      if (hasAdvanced) {
        // 1) strict advanced
        const advParams = buildAdvancedParams();
        try {
          response = await activeAPI.searchProperties(advParams);
          list = normalizeResponse(response);

        } catch (e) {
          console.warn('Advanced search failed, will relax. Error:', e);
          list = [];
        }

        // 2) relaxed advanced (drop strict fields likely to zero-out results)
        if (!list.length) {
          const relaxed = { ...advParams };
          delete relaxed.propertySubtype; delete relaxed.property_subtype;
          delete relaxed.unitTypes; delete relaxed.unitType; delete relaxed.unit_type;
          delete relaxed.furnishing; delete relaxed.possession; delete relaxed.parking;
          delete relaxed.minRating; delete relaxed.floor_min; delete relaxed.floor_max;
          delete relaxed.bathrooms; // keep bedrooms loosely (often used), but drop if present
          if ('bedrooms' in relaxed && !Number(relaxed.bedrooms)) delete relaxed.bedrooms;

          try {
            const resp2 = await activeAPI.getSearch(relaxed);
            list = normalizeResponse(resp2);
          } catch (e2) {
            console.warn('Relaxed advanced failed, will try simple list. Error:', e2);
            list = [];
          }
        }

        // 3) simple public list
        if (!list.length) {
          try {
            const simpleParams = buildSimpleParams();
            const resp3 = await activeAPI.PublicgetProperties(simpleParams);
            list = normalizeResponse(resp3);
          } catch (e3) {
            console.warn('PublicgetProperties failed after advanced attempts', e3);
            list = [];
          }
        }

        // 4) if URL had propertyType and still empty => try once without it
        if (!list.length && hadPropertyTypeInUrl) {
          try {
            const noPT = buildAdvancedParams();
            delete noPT.propertyType; delete noPT.property_type;
            const resp4 = await activeAPI.getSearch(noPT);
            list = normalizeResponse(resp4);

            if (!list.length) {
              const simpleNoPT = buildSimpleParams(); // already no PT
              const resp5 = await activeAPI.PublicgetProperties(simpleNoPT);
              list = normalizeResponse(resp5);
            }
          } catch (e4) {
            console.warn('No-PT fallback failed', e4);
          }
        }
      } else {
        // Basic header search
        try {
          response = await activeAPI.PublicgetProperties(buildSimpleParams());
          list = normalizeResponse(response);
        } catch (err) {
          console.warn('PublicgetProperties failed, fallback to empty', err);
          list = [];
        }
      }

      // ✅ client-side strict public-only guard
      list = list.filter(isPublicProp);

      // ---- map → UI + fetch (views & tags) ----
      // Fetch ALL tags in one bulk request before mapping
      const allTagsBulk = await propertyTagsAPI.getBulk(list.map((p: any) => p.id)).catch(() => ({} as Record<number, string[]>));

      const transformedProperties = await Promise.all(
        list.map(async (p: any, index: number) => {
          const propSlug = p.slug || p.url_slug || p.generated_slug || p.raw?.slug || (p.id ? `sell-${p.id}` : undefined);
          const [viewCounts] = await Promise.all([
            fetchPropertyViews(p.id, propSlug),
          ]);
          const tags: string[] = allTagsBulk[p.id] || [];


          // ✅ Use dynamic parking extraction
          const parkingCount = extractParkingCount(p);

          // ✅ Get property type for default image
          const propertyType = p.property_type_name || p.property_type || '';

          // ✅ Create images array with proper fallback
          let rawPhotos = p.photos ?? p.photoUrls ?? p.images;
          if (typeof rawPhotos === 'string' && rawPhotos.trim().startsWith('[')) {
            try {
              rawPhotos = JSON.parse(rawPhotos);
            } catch (e) {}
          }

          let images: string[] = [];
          if (Array.isArray(rawPhotos) && rawPhotos.length > 0) {
            images = rawPhotos
              .map((ph: any) => {
                const url = typeof ph === 'string' ? ph : (ph?.url ?? '');
                return (url || '').replace(/\\/g, '/');
              })
              .filter((u: string) => u && !isVideoUrl(u));
          } else if (typeof rawPhotos === 'string' && rawPhotos.trim() && !isVideoUrl(rawPhotos)) {
            images = [rawPhotos.replace(/\\/g, '/')];
          }

          if (!images.length) {
            images = DEFAULT_PROPERTY_IMAGES;
          }

          const isRentProp = Boolean(
            p.listing_type === 'rent' ||
            p.transaction_type === 'rent' ||
            p.monthly_rent ||
            p.expected_rent ||
            (p.listing_type && String(p.listing_type).toLowerCase() === 'rent')
          );
          const rawPropId = p.property_id && String(p.property_id).trim();
          const propertyId = isRentProp
            ? (rawPropId ? rawPropId.replace(/^REX/i, 'RENT-') : `RENT-${String(p.id ?? '').padStart(4, '0')}`)
            : (rawPropId || `REX${String(p.id ?? '').padStart(4, '0')}`);

          const propertyData: Property = {
            id: p.id,
            slug: p.slug || p.url_slug || p.generated_slug,
            propertyId,

            title: p.title || `${p.unit_type || ''} ${p.property_type_name || ''}`.trim() || `Property ${p.id}`,
            price: Number(p.monthly_rent) || Number(p.budget) || Number(p.price) || 0,
            bedrooms: Number(p.bedrooms) || 0,
            bathrooms: Number(p.bathrooms) || 0,
            square_feet: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            city: p.city_name || p.city || '',
            property_type: propertyType,
            status: p.status || '',
            images, // ✅ Now images will never be empty
            location: `${p.location_name || p.location || ''}`.replace(/\s*,\s*$/, ''),
            society: p.society_name || p.project_name || `Society ${p.id}`,
            area: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            parking: parkingCount, // ✅ Dynamic parking count
            type: p.unit_type || p.property_subtype || p.property_type_name || p.property_type || 'Apartment',
            furnishing: p.furnishing_status || ['Fully Furnished', 'Semi Furnished', 'Unfurnished'][index % 3],
            possession: p.possession_status || ['Ready to Move', 'Under Construction'][index % 2],
            amenities: p.amenities
              ? (Array.isArray(p.amenities) ? p.amenities :
                typeof p.amenities === 'string' ? p.amenities.split(',').map((a: string) => a.trim()) :
                  ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup'])
              : ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup'],
            rating: p.rating ? Number(p.rating) : (4.0 + Math.random() * 1.0),
            reviews: p.reviews ? Number(p.reviews) : Math.floor(Math.random() * 50) + 5,
            postedDate: p.created_at ? p.created_at.split('T')[0] : `2025-01-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
            views: viewCounts.total_views || 0,
            total_views: viewCounts.total_views,
            aiScore: p.ai_score || Math.floor(Math.random() * 30) + 70,
            priceGrowth: p.price_growth || `+${(Math.random() * 20 + 5).toFixed(1)}%`,
            investmentGrade: p.investment_grade || ['A++', 'A+', 'A', 'B+'][Math.floor(Math.random() * 4)],
            executiveTo: p.assignedTo ? {
              name: p.assignedTo.name || 'Not Assigned',
              phone: p.assignedTo.phone || 'Not Available',
              rating: p.rating || (4 + Math.random()),
              email: p.assignedTo.email || 'Not Available'
            } : {
              name: 'Not Assigned',
              phone: 'Not Available',
              rating: p.rating || (4 + Math.random()),
              email: 'Not Available'
            },
            highlights: p.highlights || ['Prime Location', 'Good Value', 'Verified', 'No Brokerage'].slice(0, (index % 4) + 1),
            nearbyPlaces: Array.isArray(p.nearby_places) ? p.nearby_places : [],
            public_views: p.public_views ?? null,
            floor: extractFloor({ ...p, _raw: p }),
            tags,
            _raw: p
          };
          return propertyData;
        })
      );

      setAllProperties(transformedProperties);
      setError('');
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
      setAllProperties([]);
    } finally {
      setLoading(false);
    }
  }, [location.search, filterParamKey, filterTokenFromUrl, transactionType]);

  // run loader
  useEffect(() => {
    loadPropertiesFromSearch();
  }, [loadPropertiesFromSearch]);

  // autosuggest
  useEffect(() => {
    const q = (localityInput || '').trim().toLowerCase();
    if (!q || !Array.isArray(masterLocation) || masterLocation.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const matched = masterLocation
      .filter(opt => {
        const label = (opt.label || '').toString().toLowerCase();
        const value = (opt.value || '').toString().toLowerCase();
        return label.includes(q) || value.includes(q);
      })
      .slice(0, 10);
    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
  }, [localityInput, masterLocation]);

  // localities
  const getSelectedCityPart = (selLoc: string) => {
    if (!selLoc) return '';
    const parts = selLoc.split(',').map(s => s.trim()).filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : '';
  };

  const addLocality = (value?: string) => {
    const raw = (value ?? localityInput ?? '').toString().trim();
    if (!raw) return;

    const parts = raw.split(',').map(p => p.trim()).filter(Boolean);

    setLocalities(prev => {
      const selectedCity = getSelectedCityPart(selectedLocation);
      const next = [...prev];
      for (const part of parts) {
        if (next.length >= 5) break;
        if (selectedCity && part.toLowerCase() === selectedCity) continue;
        if (!next.includes(part)) next.push(part);
      }
      return next;
    });

    setLocalityInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeLocality = (idx: number) => {
    setLocalities(prev => prev.filter((_, i) => i !== idx));
  };

  // header type buttons
  const handlePropertyTypeButton = (value: string) => {
    if (!value) {
      setSelectedPropertyType('');
      setSelectedType('');
      setSelectedBudget('');
      setSelectedBedrooms('');
      setSearchQuery('');
      setLocalities([]);
      setLocalityInput('');
      setSelectedPropertySubtype('');
      setSelectedUnitType('');
      setMinRating(null);
      setPossessionFilter('');
      setParkingFilter('any');
      setFloorMin('');
      setFloorMax('');
      setBathroomsFilter('');
      const baseDest = transactionType === 'rent' ? '/properties?transaction=rent&tab=rent' : '/properties?transaction=buy';
      navigate(baseDest, { replace: true });
      return;
    }
    setSelectedPropertyType(prev => (prev === value ? '' : value));
    setSelectedType(prev => (prev === value ? '' : value));
  };

  useEffect(() => {
    if (selectedType !== undefined) {
      setSelectedPropertyType(prev => prev !== (selectedType || '') ? (selectedType || '') : prev);
    }
  }, [selectedType]);

  // search filtering (client)
  const filteredProperties = allProperties.filter((property) => {
    const title = String(property.title || '').toLowerCase();
    const propLocation = String(property.location || '').toLowerCase();
    const propCity = String(property.city || '').toLowerCase();
    const propType = String(property.property_type || property.type || '').toLowerCase();
    const propSubtype = String((property as any)._raw?.property_subtype_name || (property as any)._raw?.property_subtype || property.property_subtype || '').toLowerCase();

    const q = String(searchQuery || '').trim().toLowerCase();
    const selLoc = String(selectedLocation || '').trim().toLowerCase();
    const selType = String(selectedType || '').trim().toLowerCase();
    const selSubtype = String(selectedPropertySubtype || '').trim().toLowerCase();
    const selBudget = String(selectedBudget || '').trim();
    const selBedrooms = String(selectedBedrooms || '').trim();
    const selUnitType = String(selectedUnitType || '').trim().toLowerCase();

    const matchesSearch =
      q === '' ||
      title.includes(q) ||
      propLocation.includes(q) ||
      (property.society || '').toString().toLowerCase().includes(q) ||
      propCity.includes(q);

    const matchesLocation =
      selLoc === '' ||
      propLocation.includes(selLoc) ||
      propCity.includes(selLoc) ||
      (localities.length > 0 && localities.some(l => propLocation.includes(l.toLowerCase())));

    const matchesType =
      selType === '' || propType === selType || propType.includes(selType);

    const matchesSubtype =
      selSubtype === '' || propSubtype === selSubtype || propSubtype.includes(selSubtype);

    const matchesBudgetFilter = matchesBudget(property, selBudget);

    const matchesBedrooms =
      selBedrooms === '' ||
      selBedrooms === 'Any' ||
      (Number(selBedrooms) > 0 ? property.bedrooms === Number(selBedrooms) :
        (selBedrooms.toString().toLowerCase().includes('1') ? property.bedrooms === 1 : true)
      );

    const extractedUnit = (extractUnitType(property) || '').toLowerCase();
    const matchesUnitType =
      selUnitType === '' ||
      extractedUnit === selUnitType ||
      extractedUnit.includes(selUnitType) ||
      (Number.isFinite(Number(selUnitType)) && Number(property.bedrooms) === Number(selUnitType));

    if (!matchesType) return false;
    if (!matchesSubtype) return false;
    if (!matchesUnitType) return false;
    if (!matchesSearch) return false;
    if (!matchesLocation) return false;
    if (!matchesBudgetFilter) return false;
    if (minRating !== null && minRating !== undefined) {
      if ((property.rating || 0) < Number(minRating)) return false;
    }
    if (possessionFilter && possessionFilter !== '' &&
      !(String(property.possession || '').toLowerCase().includes(String(possessionFilter).toLowerCase()))) {
      return false;
    }
    if (parkingFilter && parkingFilter !== 'any') {
      const ptypes = extractParkingTypes(property);
      if (parkingFilter === '2w' && !ptypes.includes('2w')) return false;
      if (parkingFilter === '4w' && !ptypes.includes('4w')) return false;
    }
    if (floorMin !== '' && Number.isFinite(Number(floorMin))) {
      const pf = extractFloor(property);
      if (pf === null || pf < Number(floorMin)) return false;
    }
    if (floorMax !== '' && Number.isFinite(Number(floorMax))) {
      const pf = extractFloor(property);
      if (pf === null || pf > Number(floorMax)) return false;
    }
    if (bathroomsFilter !== '' && Number.isFinite(Number(bathroomsFilter))) {
      const pb = extractBathrooms(property);
      if (pb === null || pb < Number(bathroomsFilter)) return false;
    }
    return true;
  });

  // sort/paginate
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'newest': return new Date(b.postedDate || '').getTime() - new Date(a.postedDate || '').getTime();
      case 'area_large': return (b.area || b.square_feet || 0) - (a.area || a.square_feet || 0);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'ai_score': return (b.aiScore || 0) - (a.aiScore || 0);
      case 'price_growth':
        return parseFloat((b.priceGrowth || '0').replace('+', '').replace('%', '')) -
          parseFloat((a.priceGrowth || '0').replace('+', '').replace('%', ''));
      default: return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedProperties.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = sortedProperties.slice(startIndex, startIndex + itemsPerPage);

  // nav helpers
  const preserveAndAddToken = (existingSearch: string, paramKey: string, token?: string | null) => {
    const params = new URLSearchParams(existingSearch || '');
    if (token) params.set(paramKey, token);
    const s = params.toString();
    return s ? `?${s}` : '';
  };

  const handleNavigateToProperty = async (property: Property) => {
    // Check if guest view limit is exceeded
    const { isLocked } = recordAndCheckGuestPropertyLimit(property.id, user, systemSettings);
    if (isLocked) {
      const isRental = Boolean(
        property.monthly_rent ||
        property.expected_rent ||
        (property.listing_type && String(property.listing_type).toLowerCase() === 'rent') ||
        (property.transaction_type && String(property.transaction_type).toLowerCase() === 'rent') ||
        (property.purpose && String(property.purpose).toLowerCase() === 'rent') ||
        property.propertyId?.toUpperCase().startsWith('RENT') ||
        String(property.id).toUpperCase().startsWith('RENT')
      );
      const pathPrefix = isRental ? 'rentals' : 'properties';
      const redirectUrl = property.slug ? `/${pathPrefix}/${encodeURIComponent(String(property.slug))}` : '/properties';
      navigate(`/register?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    const id = property.id;
    const slug = property.slug;
    if (!slug) {
      console.warn('Attempted to navigate to property without slug:', id);
      setCurrentPropertyView(property);
      if (onPropertyView) onPropertyView(property);
      return;
    }

    const isRental = Boolean(
      property.monthly_rent ||
      property.expected_rent ||
      (property.listing_type && String(property.listing_type).toLowerCase() === 'rent') ||
      (property.transaction_type && String(property.transaction_type).toLowerCase() === 'rent') ||
      (property.purpose && String(property.purpose).toLowerCase() === 'rent') ||
      property.propertyId?.toUpperCase().startsWith('RENT') ||
      String(property.id).toUpperCase().startsWith('RENT')
    );
    const pathPrefix = isRental ? 'rentals' : 'properties';

    if (viewedProperties.has(id)) {
      const mergedQs = preserveAndAddToken(location.search, filterParamKey || 'fltcnt', filterTokenFromUrl);
      navigate(`/${pathPrefix}/${encodeURIComponent(String(slug))}${mergedQs}`);
      return;
    }

    let finalToken = filterTokenFromUrl ?? null;
    const finalParamKey = filterParamKey ?? 'fltcnt';

    const inferredFilters = {
      search: searchQuery || null,
      location: selectedLocation || null,
      budget: selectedBudget || null,
      propertyType: selectedType || null,
      bedrooms: selectedBedrooms || null,
      clickedPropertyId: id,
      source: 'properties_list',
    };

    if (!finalToken) {
      try {
        const createRes = await propertiesAPI.createFilterContext({ filters: inferredFilters });
        if (createRes) {
          const idFromRes = (createRes as any).id || (createRes as any).filterId || null;
          if (idFromRes) finalToken = String(idFromRes);
        }
      } catch (err) {
        console.warn('createFilterContext failed (continuing without token):', err);
      }
    }

    try {
      await propertiesAPI.sendPropertyEvent(
        id,
        'click',
        'listing_card_click',
        { source: 'properties_list', title: property.title || null },
        { slug, filterToken: finalToken || undefined, filterParamKey: finalParamKey }
      );

      setViewedProperties((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } catch (err) {
      console.warn('sendPropertyEvent failed (we will still navigate):', err);
    }

    const mergedQs = preserveAndAddToken(location.search, finalParamKey, finalToken);
    const dest = `/${pathPrefix}/${encodeURIComponent(String(slug))}${mergedQs}`;
    navigate(dest);
  };

  // header submit (basic search URL build)
  const handleHeaderSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();

    if (localities.length > 0) {
      const parts = (selectedLocation || '').split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 1) {
        const cityPart = parts.slice(-1).join(', ');
        if (cityPart) params.append('city', cityPart);
      }
      localities.forEach(loc => {
        if (loc && loc.trim()) params.append('location', loc.trim());
      });
    } else {
      const raw = String(selectedLocation || '').trim();
      if (raw) {
        const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
        if (parts.length === 1) params.append('city', parts[0]);
        else if (parts.length >= 2) {
          params.append('city', parts.slice(-1).join(', '));
          params.append('location', parts.slice(0, -1).join(', '));
        }
      }
    }

    // always keep available + PUBLIC enforced in loader
    params.append('status', 'Available');
    if (transactionType) {
      params.append('transaction', transactionType);
    }

    setCurrentPage(1);
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
  };

  const onToggleFilters = () => setShowFilters(s => !s);

  /* ==============================
     Render
  ============================== */
  if (currentPropertyView) {
    const isRental = Boolean(
      currentPropertyView.monthly_rent ||
      currentPropertyView.expected_rent ||
      (currentPropertyView.listing_type && String(currentPropertyView.listing_type).toLowerCase() === 'rent') ||
      (currentPropertyView.transaction_type && String(currentPropertyView.transaction_type).toLowerCase() === 'rent') ||
      (currentPropertyView.purpose && String(currentPropertyView.purpose).toLowerCase() === 'rent') ||
      (currentPropertyView.raw?.purpose && String(currentPropertyView.raw.purpose).toLowerCase() === 'rent') ||
      (currentPropertyView.raw?.transaction_type && String(currentPropertyView.raw.transaction_type).toLowerCase() === 'rent') ||
      (currentPropertyView.raw?.listing_type && String(currentPropertyView.raw.listing_type).toLowerCase() === 'rent') ||
      currentPropertyView.propertyId?.toUpperCase().startsWith('RENT') ||
      String(currentPropertyView.id).toUpperCase().startsWith('RENT')
    );
    if (isRental) {
      return (
        <PublicRentalPropertyDetailPage
          property={currentPropertyView}
          onBack={() => {
            setCurrentPropertyView('');
            setTransactionType('rent');
            navigate('/properties?transaction=rent&tab=rent', { replace: true });
          }}
        />
      );
    }
    return (
      <PublicPropertyDetailPage
        property={currentPropertyView}
        onBack={() => {
          setCurrentPropertyView('');
          setTransactionType('buy');
          navigate('/properties?transaction=buy', { replace: true });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Search */}
      <div className="py-5 pt-28" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3 text-white">Explore Premium Properties</h2>
            <p className="text-lg text-blue-100 mb-2 max-w-2xl mx-auto">
              Discover verified properties from trusted sellers across top locations
            </p>

            {/* Buy/Rent + Type row */}
            <div className="grid grid-cols-1 gap-1 md:gap-2 mb-4 items-center justify-center text-center">
              {/* Buy / Rent */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("buy");
                    const q = new URLSearchParams(location.search);
                    q.set("transaction", "buy");
                    q.delete("tab");
                    navigate(`/properties?${q.toString()}`, { replace: true });
                  }}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition cursor-pointer
                    ${transactionType === "buy"
                      ? "bg-[#E6761D] text-white font-bold shadow-sm"
                      : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  aria-pressed={transactionType === "buy"}
                >
                  Buy
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransactionType("rent");
                    const q = new URLSearchParams(location.search);
                    q.set("transaction", "rent");
                    q.set("tab", "rent");
                    navigate(`/properties?${q.toString()}`, { replace: true });
                  }}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition cursor-pointer
                    ${transactionType === "rent"
                      ? "bg-[#E6761D] text-white font-bold shadow-sm"
                      : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  aria-pressed={transactionType === "rent"}
                >
                  Rent
                </button>
              </div>

              <div className="w-full grid justify-center md:w-auto">
                {masterLoading ? (
                  <div className="text-sm text-white/80 px-3 py-1">Loading types...</div>
                ) : (
                  <div className="relative ml-2 md:ml-0 max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] px-1" style={{ scrollbarWidth: "none" }}>
                    <div className="flex gap-2 py-1 snap-x snap-mandatory">
                      <button
                        type="button"
                        onClick={() => handlePropertyTypeButton("")}
                        aria-pressed={selectedPropertyType === ""}
                        className={`shrink-0 snap-start whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition
                          ${selectedPropertyType === "" ? "bg-white text-black" : "bg-white/30 text-white hover:bg-white/40"}`}
                      >
                        All
                      </button>

                      {propertyTypeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handlePropertyTypeButton(opt.value)}
                          aria-pressed={selectedPropertyType === opt.value}
                          title={opt.label}
                          className={`shrink-0 snap-start whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition
                            ${selectedPropertyType === opt.value ? "bg-white text-black" : "bg-white/20 text-white hover:bg-white/30"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Header search */}
            <form onSubmit={handleHeaderSearchSubmit} className="bg-white/10 text-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-2 shadow-xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                {/* City */}
                <div className="md:col-span-1">
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      const newVal = e.target.value || '';
                      setSelectedLocation(newVal);
                      setSearchQuery(newVal);
                      if (newVal && newVal.split(',').map(s => s.trim()).filter(Boolean).length === 1) {
                        setLocalities([]);
                      }
                    }}
                    disabled={masterLoading}
                    className="appearance-none px-3 py-2 border rounded-lg w-full bg-white/30 text-white border-white/30 focus:outline-none focus:ring-1 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#0b3856] text-white">
                      {masterLoading ? "Loading cities..." : "Select City"}
                    </option>
                    {cityOptions.map((o) => (
                      <option key={o.value} value={o.value} className="bg-[#0b3856] text-white">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locality input */}
                <div className="relative md:col-span-3 flex items-center gap-2 bg-[#0b3856] border border-gray-200 rounded-xl w-full max-w-[700px] mx-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={16} />
                    <input
                      ref={inputRef}
                      value={localityInput}
                      onChange={(e) => setLocalityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addLocality(); }
                        else if (e.key === "Escape") { setShowSuggestions(false); }
                      }}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      onBlur={() => { setTimeout(() => setShowSuggestions(false), 120); }}
                      className="pl-10 pr-16 h-10 w-full text-sm bg-white/10 text-white placeholder-white/70 outline-none focus:ring-1 focus:ring-gray-400 rounded-lg"
                      placeholder="Search properties by locality or area"
                      aria-autocomplete="list"
                      aria-haspopup="listbox"
                      aria-expanded={showSuggestions}
                      disabled={localities.length >= 5}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul role="listbox" className="absolute left-0 right-0 mt-1 max-h-32 lg:max-w-60 overflow-auto bg-[#0b3856] border rounded-lg shadow-lg z-[200] custom-scroll">
                        {suggestions.map((s, idx) => (
                          <li
                            key={`${s.value}-${idx}`}
                            role="option"
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => {
                              const toAdd = s.label?.toString().trim() || s.value?.toString().trim();
                              addLocality(toAdd);
                            }}
                            className="px-3 py-2 hover:bg-white/20 cursor-pointer text-sm"
                          >
                            {s.label || s.value}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="md:col-span-1 flex items-center justify-center md:justify-end gap-1">
                  <button type="submit" className="bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-5 py-2 rounded-lg w-full md:w-28 text-base font-medium transition-colors duration-300">
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLocation('');
                      setLocalities([]);
                      setLocalityInput('');
                      setSelectedBudget('');
                      setSelectedType('');
                      setSelectedBedrooms('');
                      setSelectedPropertySubtype('');
                      setSelectedUnitType('');
                      const baseDest = transactionType === 'rent' ? '/properties?transaction=rent&tab=rent' : '/properties?transaction=buy';
                      navigate(baseDest, { replace: true });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg w-full md:w-28 text-base font-medium transition-colors duration-300"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {localities.map((loc, idx) => (
                  <div key={idx} className="flex items-center bg-white/30 text-white px-2 py-1 rounded-full text-xs">
                    <span className="mr-1">{loc}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeLocality(idx); }}
                      className="text-gray-200 hover:text-white"
                      aria-label={`Remove locality ${loc}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {localities.length < 5 && (
                  <div className="text-xs text-white px-2 py-1">Add up to 1 localities.</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>


      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header row */}
        <div className="grid grid-cols-1 mb-6">

          {/* TOP LINE */}
          <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 w-full">

            <div className="flex flex-wrap items-center justify-between w-full gap-3 sm:gap-4">

              {/* LEFT SECTION */}
              <div className="flex-shrink-0 min-w-[180px]">
                <h2 className="text-lg sm:text-xl font-bold text-[#0b3856]">
                  All Properties {!loading && !error && `(${allProperties.length})`}
                </h2>

                {Boolean(selectedLocation || localities.length || selectedBudget) && (
                  <p className="text-gray-600 text-xs sm:text-sm leading-snug">
                    {selectedLocation && `in ${selectedLocation} • `}
                    {localities.length > 0 && `${localities.join(', ')} • `}
                    {selectedBudget &&
                      `${(budgetOptions.find((b) => (b.value || b.label) === selectedBudget)?.label) || selectedBudget} • `}
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProperties.length)} of{" "}
                    {allProperties.length} results
                  </p>
                )}
              </div>

              {/* AI Recommendation Banner */}
              <div className="w-full sm:flex-1 flex justify-start sm:justify-center">
                {showAIRecommendations && !loading && allProperties.length > 0 && (
                  <div className="flex items-start gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm text-xs sm:text-sm max-w-full">
                    <Bot className="text-[#E6761D] flex-shrink-0" size={16} />

                    <div className="flex-1 leading-snug">
                      <div className="font-semibold text-gray-800">AI Recommendations</div>

                      <div className="text-gray-700">
                        Found <span className="font-semibold">{allProperties.length}</span> public properties.{" "}
                        {(selectedLocation || "Top areas")} show strong growth potential.
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAIRecommendations(false)}
                      className="ml-1 text-gray-500 hover:text-gray-800 flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT SECTION */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg w-9 h-9 flex items-center justify-center ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}
                >
                  <Grid size={16} />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg w-9 h-9 flex items-center justify-center ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>


          {/* SECOND LINE : AI Powered Search + Filters (UNCHANGED) */}
          <div className="flex items-end justify-end gap-3 mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="text-blue-600" size={16} />
              <span>AI-Powered Search</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={onToggleFilters}
                aria-expanded={showFilters}
                aria-controls="advanced-filters-panel"
                className="bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-3 py-1 flex gap-1 text-xs items-center rounded-xl transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E6761D]"
              >
                <SlidersHorizontal size={12} />
                <span className="hidden md:inline">Filters</span>
                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <div id="advanced-filters-panel" ref={filtersRef} className="absolute right-0 top-full mt-2 z-20 w-[min(92vw,1000px)] bg-white rounded-2xl shadow-lg p-6 border border-gray-200 max-h-[70vh] overflow-auto">
                  <h3 className="text-lg font-semibold text-[#0b3856] mb-4">Advanced Filters</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => {
                          const v = e.target.value || '';
                          setSelectedLocation(v);
                          if (v && v.split(',').map(s => s.trim()).filter(Boolean).length === 1) {
                            setLocalities([]);
                          }
                        }}
                        disabled={masterLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60 text-xs"
                      >
                        <option value="">{masterLoading ? 'Loading locations...' : 'All Locations'}</option>
                        {cityOptions.map((loc) => (
                          <option key={loc.value} value={loc.value}>{loc.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Budget</label>
                      <select
                        value={selectedBudget}
                        onChange={(e) => setSelectedBudget(e.target.value)}
                        disabled={masterLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60 text-xs"
                      >
                        <option value="">{masterLoading ? 'Loading budgets...' : 'Any Budget'}</option>
                        {budgetOptions.map((b) => (
                          <option key={b.value || b.label} value={b.value || b.label}>
                            {b.label || b.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Property Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => { setSelectedType(e.target.value); setSelectedPropertyType(e.target.value); }}
                        disabled={masterLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60 text-xs"
                      >
                        <option value="">{masterLoading ? 'Loading types...' : 'All Types'}</option>
                        {propertyTypeOptions.map((pt) => (
                          <option key={pt.value} value={pt.value}>{pt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bedrooms */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
                      <select
                        value={selectedBedrooms}
                        onChange={(e) => setSelectedBedrooms(e.target.value)}
                        disabled={masterLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60 text-xs"
                      >
                        <option value="">{masterLoading ? 'Loading...' : 'Any'}</option>
                        {bedroomOptions.map((b) => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        {[
                          { value: 'relevance', label: 'Most Relevant' },
                          { value: 'price_low', label: 'Price: Low to High' },
                          { value: 'price_high', label: 'Price: High to Low' },
                          { value: 'newest', label: 'Newest First' },
                          { value: 'area_large', label: 'Largest First' },
                          { value: 'rating', label: 'Highest Rated' },
                          { value: 'ai_score', label: 'AI Score High' },
                          { value: 'price_growth', label: 'Best Growth' },
                        ].map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Possession */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Possession</label>
                      <select
                        value={possessionFilter}
                        onChange={(e) => setPossessionFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        <option value="">Any</option>
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Construction">Under Construction</option>
                      </select>
                    </div>
                    {/* Min Rating */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min Rating</label>
                      <input
                        type="number" min={0} max={5} step={0.1}
                        value={minRating as any}
                        onChange={(e) => setMinRating(e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      />
                    </div>

                    {/* Floor min */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Floor (min)</label>
                      <input
                        type="number"
                        value={floorMin as any}
                        onChange={(e) => setFloorMin(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="e.g. 1"
                      />
                    </div>

                    {/* Floor max */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Floor (max)</label>
                      <input
                        type="number"
                        value={floorMax as any}
                        onChange={(e) => setFloorMax(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="e.g. 10"
                      />
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms (min)</label>
                      <input
                        type="text" min={0}
                        value={bathroomsFilter as any}
                        onChange={(e) => setBathroomsFilter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                        placeholder="e.g. 2"
                      />

                    </div>

                    {/* Actions */}
                    <div className="col-span-full flex gap-3 justify-end pt-2">
                      <button
                        onClick={() => {
                          const params = new URLSearchParams();

                          if (localities.length > 0) {
                            localities.forEach(loc => { if (loc && loc.trim()) params.append('location', loc.trim()); });
                            const parts = (selectedLocation || '').split(',').map(s => s.trim()).filter(Boolean);
                            if (parts.length >= 1) params.set('city', parts.slice(-1).join(', '));
                          } else if (selectedLocation) {
                            const raw = selectedLocation.trim();
                            const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
                            if (parts.length === 1) params.set('city', parts[0]);
                            else if (parts.length >= 2) {
                              params.set('city', parts.slice(-1).join(', '));
                              params.set('location', parts.slice(0, -1).join(', '));
                            }
                          }

                          if (selectedType) params.set('propertyType', selectedType);
                          if (selectedBudget) params.set('budget', selectedBudget);
                          if (selectedBedrooms) params.set('bedrooms', selectedBedrooms);
                          if (minRating !== null && minRating !== undefined) params.set('min_rating', String(minRating));
                          if (possessionFilter) params.set('possession', possessionFilter);
                          if (parkingFilter && parkingFilter !== 'any') params.set('parking', parkingFilter);
                          if (floorMin !== '') params.set('floor_min', String(floorMin));
                          if (floorMax !== '') params.set('floor_max', String(floorMax));
                          if (bathroomsFilter !== '') params.set('bathrooms', String(bathroomsFilter));
                          if (selectedPropertySubtype) params.set('property_subtype', selectedPropertySubtype);
                          if (selectedUnitType) params.set('unitType', selectedUnitType);

                          if (transactionType) params.set('transaction', transactionType);
                          if (searchQuery) params.set('search', searchQuery);
                          if (sortBy) params.set('sort', sortBy);
                          params.set('status', 'Available');

                          setCurrentPage(1);
                          navigate(`/properties?${params.toString()}`, { replace: true });
                          setShowFilters(false);
                        }}
                        className=" bg-[#E6761D] text-white px-4 py-2 rounded-lg text-xs"
                      >
                        Apply Filters
                      </button>

                      <button onClick={() => setShowFilters(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-xs hover:bg-gray-50">
                        Close
                      </button>

                      <button
                        onClick={() => {
                          setSelectedLocation('');
                          setSelectedBudget('');
                          setSelectedType('');
                          setSelectedBedrooms('');
                          setSearchQuery('');
                          setMinRating(null);
                          setPossessionFilter('');
                          setParkingFilter('any');
                          setFloorMin('');
                          setFloorMax('');
                          setBathroomsFilter('');
                          setSelectedPropertySubtype('');
                          setSelectedUnitType('');
                          setLocalities([]);
                          setLocalityInput('');
                          setSelectedPropertyType('');
                          setTransactionType('buy');
                          navigate('/properties', { replace: true });
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Loading / Error / Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading properties...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16">
            <Home className="mx-auto text-gray-300 mb-6" size={64} />
            <h3 className="text-lg font-bold text-[#0b3856] mb-4">Error Loading Properties</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button onClick={() => loadPropertiesFromSearch()} className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold">Try Again</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {paginatedProperties.map((property) => {
                  const composedTitle = composeHeaderTitle(property);
                  const { locationPart, cityPart } = splitLocationCity(property);

                  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
                  const shownAmenities = amenities.slice(0, 2);
                  const moreCount = Math.max(amenities.length - shownAmenities.length, 0);

                  const parkingCount = property.parking || 0;

                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer h-full flex flex-col"
                      onClick={() => {
                        if (property.slug) { handleNavigateToProperty(property); return; }
                        setCurrentPropertyView(property);
                        if (onPropertyView) onPropertyView(property);
                      }}
                    >
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={getImageUrl(property.images?.[0]) || DEFAULT_IMAGES.DEFAULT}
                          alt={String(property.title)}
                          onError={(e) => { e.currentTarget.src = '/property.png'; }}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        <div className="absolute top-3 left-3 flex items-center flex-wrap gap-2 z-20">
                          <PropertyTags tags={property.tags || []} />
                          {(property.aiScore ?? 0) >= 90 && (
                            <span className="flex items-center bg-purple-600 text-white px-2 py-[3px] rounded-full text-[8px] sm:text-xs font-bold whitespace-nowrap shadow-sm">
                              <Bot size={12} className="mr-1" />
                              AI {Math.round(property.aiScore ?? 0)}
                            </span>
                          )}
                        </div>

                        {/* Watermark & views */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-white text-2xl font-bold opacity-40 select-none">ResaleExpert.in</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Eye size={10} />
                          <span>{property.total_views || property.views || 0}</span>
                        </div>
                      </div>

                      {/* Body (fills height) */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-[#0b3856] mb-1 group-hover:text-[#E6761D] transition-colors">
                              {composedTitle}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin size={14} className="mr-1" />
                              <span>{locationPart}{locationPart && cityPart ? ', ' : ''}{cityPart}</span>
                            </div>
                          </div>
                          <div className="ml-2 shrink-0 text-[10px] sm:text-xs text-gray-500 font-medium">
                            {(() => {
                              const isRental = Boolean(
                                property.listing_type === 'rent' ||
                                property.transaction_type === 'rent' ||
                                property.monthly_rent ||
                                property.expected_rent ||
                                (property.listing_type && String(property.listing_type).toLowerCase() === 'rent')
                              );
                              if (property.propertyId) {
                                return isRental ? property.propertyId.replace(/^REX/i, 'RENT-') : property.propertyId;
                              }
                              const prefix = isRental ? 'RENT-' : 'REX';
                              return `${prefix}${property.id ?? ''}`;
                            })()}

                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(property.price)}
                            {Boolean(
                              property.listing_type === 'rent' ||
                              property.transaction_type === 'rent' ||
                              property.monthly_rent
                            ) ? '/mo' : ''}
                          </div>

                          <div className="text-xs text-gray-500">
                            {property.type || property.property_type} • {property.area || property.square_feet} sq ft
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="text-yellow-400 fill-current" size={14} />
                            <span className="text-sm font-medium text-gray-700">
                              {(property.rating || 4.2).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">({property.reviews || 0} reviews)</span>
                          </div>
                          <div className="text-xs text-gray-500">{property.postedDate}</div>
                        </div>

                        <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp size={12} />
                            <span className="text-xs text-green-600 font-semibold">{property.priceGrowth || '+12%'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BarChart3 size={12} />
                            <span className="text-xs text-blue-600 font-semibold">
                              Grade {property.investmentGrade || 'A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <div className="flex items-center space-x-1"><Bed size={12} /><span>{property.bedrooms} Beds</span></div>
                          <div className="flex items-center space-x-1"><Building size={12} /><span>{property.bathrooms} Baths</span></div>
                          <div className="flex items-center space-x-1"><Car size={12} /><span>{parkingCount} Parking</span></div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {shownAmenities.map((amenity, i) => (
                            <div key={i} className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {moreCount > 0 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{moreCount}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex items-center space-x-2">
                          {typeof property.slug === 'string' && property.slug.trim().length > 0 ? (
                            <div className="flex-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleNavigateToProperty(property); }}
                                className="w-full bg-[#E6761D] hover:bg-[#CC6A1A] text-white py-2 px-3 rounded-lg font-medium transition-colors duration-300 text-sm shadow-md"
                              >
                                View Details
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled
                              aria-disabled="true"
                              title="Details not available – missing backend slug"
                              className="w-full bg-gray-300 text-gray-600 py-2 px-3 rounded-lg cursor-not-allowed text-sm"
                            >
                              View Details
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const phone = property.executiveTo?.phone || "919999999999";
                              if (phone && phone !== "Not Available") window.open(`tel:${phone}`);
                            }}
                            className="p-2 rounded-lg transition-colors duration-300 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                            title="Call"
                          >
                            <Phone size={16} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();

                              const phone = property?.executiveTo?.phone?.replace(/\D/g, "") || "9637009639";
                              const title = property?.title || [property?.type].filter(Boolean).join(" ") || "a property";
                              const loc = property?.location || property?.city || "your listed property location";
                              const priceValue = Number(property?.price || 0);
                              const priceText = !isNaN(priceValue)
                                ? `₹${priceValue.toLocaleString("en-IN")}`
                                : "Price on request";
                              const link = property?.slug
                                ? `${window.location.origin}/properties/${encodeURIComponent(
                                  String(property.slug)
                                )}`
                                : `${window.location.origin}/properties`;

                              const message = `Hi, I'm interested in ${title} at ${loc}. Price: ${priceText}. Can you share more details?\n${link}`;

                              window.open(
                                `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                            className="p-2 rounded-lg transition-colors duration-300 bg-[#25D366] text-white hover:bg-[#1ebe57]"
                            title="WhatsApp"
                            type="button"
                          >
                            <FaWhatsapp size={16} />
                          </button>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedProperties.map((property) => {
                  const composedTitle = composeHeaderTitle(property);
                  const { locationPart, cityPart } = splitLocationCity(property);
                  const parkingCount = Number.isFinite(Number(property.parking)) ? Number(property.parking) : 0;
                  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
                  const showAmenities = amenities.slice(0, 3);

                  const pricePerSqFt = property.price && (property.area || property.square_feet)
                    ? Math.round(property.price / (Number(property.area || property.square_feet) || 1))
                    : null;

                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all group cursor-pointer"
                      onClick={() => {
                        if (property.slug) { handleNavigateToProperty(property); return; }
                        setCurrentPropertyView(property);
                        if (onPropertyView) onPropertyView(property);
                      }}
                    >
                      {/* ── Card inner: horizontal on BOTH mobile and desktop ── */}
                      <div className="flex h-[160px] sm:h-[220px]">

                        {/* LEFT: Image — narrower on mobile, fixed 380px on desktop */}
                        <div className="w-[140px] min-w-[140px] sm:w-[380px] sm:min-w-[380px] relative overflow-hidden">
                          <img
                            src={getImageUrl(property.images?.[0]) || DEFAULT_IMAGES.DEFAULT}
                            alt={String(property.title)}
                            onError={(e) => { e.currentTarget.src = '/property.png'; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {(property.tags || []).length > 0 && (
                            <div className="absolute top-2 left-2">
                              <PropertyTags tags={(property.tags || []).slice(0, 1)} />
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 bg-black/55 text-white px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            <Eye size={9} />
                            <span>{property.total_views || property.views || 0}</span>
                          </div>
                          <div className="hidden sm:block absolute bottom-2 right-2 bg-black/55 text-white px-2 py-0.5 rounded-full text-[10px]">
                            {(property.images || []).length || 1} photos
                          </div>
                        </div>

                        {/* RIGHT: Body */}
                        <div className="flex-1 flex flex-col justify-between px-2 py-2 sm:px-4 sm:py-3 min-w-0 gap-1 sm:gap-2 overflow-hidden">

                          {/* Row 1: Title + Location */}
                          <div>
                            <h3 className="font-medium text-[#0b3856] text-xs sm:text-sm leading-tight truncate group-hover:text-[#E6761D] transition-colors">
                              {composedTitle}
                            </h3>
                            <div className="flex items-center text-gray-400 text-[10px] sm:text-xs mt-0.5 gap-1">
                              <MapPin size={10} className="shrink-0" />
                              <span className="truncate">
                                {locationPart}{locationPart && cityPart ? ', ' : ''}{cityPart}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Metrics — simplified on mobile (price + area only), full 3-col on desktop */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                            <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2">
                              <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Price</div>
                              <div className="text-xs sm:text-sm font-medium text-green-700">{formatCurrency(property.price)}</div>
                              {pricePerSqFt && (
                                <div className="hidden sm:block text-[10px] text-gray-400">₹{pricePerSqFt.toLocaleString('en-IN')}/sq ft</div>
                              )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2">
                              <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Area</div>
                              <div className="text-xs sm:text-sm font-medium text-blue-700">{property.area || property.square_feet} <span className="text-[9px]">sq.ft</span></div>
                              <div className="hidden sm:block text-[10px] text-gray-400">{property.furnishing || 'Semi-Furnished'}</div>
                            </div>
                            {/* Investment grade — desktop only */}
                            <div className="hidden sm:block bg-gray-50 rounded-lg p-2">
                              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Investment</div>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <span className="text-[10px] font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                                  {property.investmentGrade || 'A'} Grade
                                </span>
                                <span className="text-[10px] font-medium bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full">
                                  {property.priceGrowth || '+12%'}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">Projected growth</div>
                            </div>
                          </div>

                          {/* Row 3: Specs — desktop only (too cramped on mobile) */}
                          <div className="hidden sm:flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1">
                              <Bed size={11} className="text-orange-500" />
                              {property.bedrooms} Bedroom
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-lg px-2 py-1">
                              <Building size={11} className="text-cyan-500" />
                              {property.bathrooms} Bathroom
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1">
                              <Car size={11} className="text-indigo-500" />
                              {parkingCount} Parking
                            </div>
                          </div>

                          {/* Row 3 mobile: compact specs inline */}
                          <div className="flex sm:hidden items-center gap-1.5 text-[10px] text-gray-500">
                            <span className="flex items-center gap-0.5"><Bed size={10} className="text-orange-400" />{property.bedrooms}bd</span>
                            <span className="text-gray-300">·</span>
                            <span className="flex items-center gap-0.5"><Building size={10} className="text-cyan-400" />{property.bathrooms}ba</span>
                            <span className="text-gray-300">·</span>
                            <span className="flex items-center gap-0.5"><Car size={10} className="text-indigo-400" />{parkingCount}pk</span>
                          </div>

                          {/* Row 4: Amenities + Actions */}
                          <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-100">
                            {/* Amenities — desktop only */}
                            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                              {showAmenities.map((amenity: string, idx: number) => (
                                <span key={idx} className="text-[10px] text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 truncate max-w-[90px]">
                                  {amenity}
                                </span>
                              ))}
                              {amenities.length > 3 && (
                                <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                                  +{amenities.length - 3}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ml-auto sm:ml-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const phone = property.executiveTo?.phone || "919999999999";
                                  if (phone && phone !== "Not Available") window.open(`tel:${phone}`);
                                }}
                                className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                              >
                                <Phone size={11} className="text-blue-500" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const phone = property?.executiveTo?.phone?.replace(/\D/g, "") || "9637009639";
                                  const cc = phone.startsWith("91") || phone.length > 10 ? "" : "91";
                                  const title = property?.title || [property?.type].filter(Boolean).join(" ") || "a property";
                                  const loc = property?.location || property?.city || "your listed property location";
                                  const priceText = !isNaN(Number(property?.price || 0)) ? `₹${Number(property?.price || 0).toLocaleString("en-IN")}` : "Price on request";
                                  const link = property?.slug ? `${window.location.origin}/properties/${encodeURIComponent(String(property.slug))}` : `${window.location.origin}/properties`;
                                  const message = `Hi, I'm interested in ${title} at ${loc}. Price: ${priceText}. Can you share more details?\n${link}`;
                                  window.open(`https://wa.me/${cc}${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
                                }}
                                className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                              >
                                <FaWhatsapp size={12} className="text-[#16a34a]" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLikedProperties((prev) =>
                                    prev.includes(property.id.toString())
                                      ? prev.filter((id) => id !== property.id.toString())
                                      : [...prev, property.id.toString()]
                                  );
                                }}
                                className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                              >
                                <Heart
                                  size={11}
                                  className={likedProperties.includes(property.id.toString()) ? 'text-red-500 fill-current' : 'text-gray-500'}
                                />
                              </button>

                              {/* View Details Button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleNavigateToProperty(property); }}
                                className="bg-[#E6761D] hover:bg-[#CC6A1A] text-white text-[10px] sm:text-xs font-medium px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg transition whitespace-nowrap"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-10">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {

                    const pageNumber = i + 1;
                    return (
                      <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`px-4 py-2 rounded-lg ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            )}
          </>
        )}

        {!loading && !error && filteredProperties.length === 0 && allProperties.length > 0 && (
          <div className="text-center py-16">
            <Home className="mx-auto text-gray-300 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-[#0b3856] mb-4">No Properties Found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your search criteria or browse all properties</p>
            <button
              onClick={() => {
                setSearchQuery(''); setSelectedLocation(''); setSelectedBudget(''); setSelectedType('');
                setSelectedBedrooms(''); setLocalities([]); setLocalityInput(''); setSelectedPropertyType('');
                setTransactionType('buy');
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && allProperties.length === 0 && (
          <div className="text-center py-16">
            <Home className="mx-auto text-gray-300 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-[#0b3856] mb-4">No Properties Available (0)</h3>
            <p className="text-gray-600 mb-8">Properties will appear here once they are added to the system</p>
            <button onClick={() => loadPropertiesFromSearch()} className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPropertiesPage;