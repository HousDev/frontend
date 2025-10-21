// PublicPropertiesPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, MapPin, Building, Star, Heart, Eye, Phone, Home, Grid, List,
  Bed, Car, Wifi, Dumbbell, Shield, TreePine, Waves, CheckCircle,
  SlidersHorizontal, Bot, BarChart3, TrendingUp, ChevronDown, Target
} from 'lucide-react';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import { propertiesAPI } from '@/lib/propertiesAPI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import { useNavigate, useLocation } from 'react-router-dom';
import viewsAPI from '@/lib/viewAPI';
import { FaWhatsapp } from 'react-icons/fa';

// ✅ Import property tags API and styles
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import { getTagStyle } from "@/lib/tagStyles";

/* ==============================
   Types
============================== */
interface Property {
  id: number;
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
  agent?: { name: string; phone: string; rating: number; };
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
}

/* ==============================
   Helpers
============================== */

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

// currency short
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
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
  const candidates = [p.type, (p as any)._raw?.unit_type, (p as any)._raw?.unit_type_name, p.title as any, p.property_type]
    .filter(Boolean).map(String);
  for (const c of candidates) {
    const m = c.match(/(\d+\s*BHK|\d+BHK|studio|1RK)/i);
    if (m) return m[0].replace(/\s+/g, '');
  }
  if (p.bedrooms && Number.isFinite(p.bedrooms) && p.bedrooms > 0) return `${p.bedrooms}BHK`;
  return '';
};

const composeHeaderTitle = (p: Property) => {
  const parts: string[] = [];
  const type = (p.property_type || p.type || (p as any)._raw?.property_type_name || '').toString().trim();
  if (type) parts.push(type);
  const unit = extractUnitType(p);
  if (unit) parts.push(unit);
  const subtype = ((p as any)._raw?.property_subtype_name || (p as any)._raw?.property_subtype || (p as any)._raw?.subtype || p.society || '').toString().trim();
  if (subtype) parts.push(subtype);
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
  if (typeof p.parking === 'number' && p.parking > 0) {
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

  // core UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(''); // stores city or "location, city"
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

  // helpers
  const findMasterOptions = (candidateKeys: string[]) => {
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
  };

  const masterCity: any[] = findMasterOptions(['city']);
  const cityOptions = masterCity.map((o) => ({ value: o.value, label: o.label }));

  const budgetMaster: any[] = findMasterOptions(['price range', 'price_range', 'budget', 'budget range', 'priceRange', 'price']);
  const budgetOptions = budgetMaster.map((o) => ({ value: o.value, label: o.label }));

  const propertyTypesMaster: any[] = findMasterOptions(['property type', 'property_type', 'type', 'place type', 'category']);
  const propertyTypeOptions = propertyTypesMaster.map((o) => ({ value: o.value || o.label, label: o.label || o.value }));

  const propertySubtypesMaster: any[] = findMasterOptions(['property subtype', 'property_subtype', 'subtype', 'unit subtype']);
  const propertySubtypeOptions = propertySubtypesMaster.map((o) => ({ value: o.value || o.label, label: o.label || o.value }));

  const unitTypesMaster: any[] = findMasterOptions(['unit type', 'unit_type', 'unit', 'bhk', 'bedrooms']);
  const unitTypeOptions = unitTypesMaster.map((o) => ({ value: o.value || o.label, label: o.label || o.value })).filter(Boolean);

  const bedroomsMaster: any[] = findMasterOptions(['bedrooms', 'bhk', 'beds', 'unit type', 'unit', 'unit_type']);
  const bedroomOptions = bedroomsMaster
    .map((o) => {
      const text = (o.value || o.label || '').toString();
      const m = text.match(/(\d+)/);
      if (m) {
        const num = m[1];
        return { value: num, label: `${num} BHK` };
      }
      return { value: text, label: o.label || text };
    })
    .filter((v, i, arr) => arr.findIndex((x) => x.value === v.value) === i);

  const masterLocation: MasterOption[] = findMasterOptions(['location', 'locality', 'localities', 'area', 'neighbourhood', 'neighborhood', 'locality_name']);

  // views/tags API wrappers
  const fetchPropertyViews = async (propertyId: number): Promise<{ total_views: number }> => {
    try {
      const viewData = await viewsAPI.getByProperty(propertyId, false);
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

    const cityFromUrl = qp.get('city') || '';
    setSelectedLocation(cityFromUrl);

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

      const hasAdvanced =
        Boolean(
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

      let response: any = null;

      if (hasAdvanced) {
        // 🔷 Advanced -> Filter endpoint (still force public)
        const params: any = {
          // public gate
          isPublic: true,
          is_public: 1,
          visibility: 'public',
          publicOnly: 1,
        };

        if (qp.getAll('location').length > 0) params.location = qp.getAll('location').join(',');
        else if (qp.get('location')) params.location = qp.get('location');

        if (qp.get('city')) params.city = qp.get('city');
        if (qp.get('propertyType')) params.propertyType = qp.get('propertyType');
        else if (qp.get('property_type')) params.propertyType = qp.get('property_type');

        const budgetMin = qp.get('budget_min') || qp.get('minPrice');
        const budgetMax = qp.get('budget_max') || qp.get('maxPrice');
        if (budgetMin) params.minPrice = Number(budgetMin);
        if (budgetMax) params.maxPrice = Number(budgetMax);

        if (qp.get('sort')) params.sort = qp.get('sort');
        if (qp.get('unitTypes')) params.unitTypes = (qp.get('unitTypes') || '').split(',').map(s => s.trim()).filter(Boolean);
        else if (qp.get('unitType')) params.unitTypes = [qp.get('unitType')!];

        if (qp.get('furnishing')) params.furnishing = qp.get('furnishing');
        if (qp.get('possession')) params.possession = qp.get('possession');
        if (qp.get('min_rating')) params.minRating = Number(qp.get('min_rating'));
        if (qp.get('parking')) params.parking = qp.get('parking');
        if (qp.get('floor_min')) params.floor_min = Number(qp.get('floor_min'));
        if (qp.get('floor_max')) params.floor_max = Number(qp.get('floor_max'));
        if (qp.get('bathrooms')) params.bathrooms = Number(qp.get('bathrooms'));
        if (qp.get('bedrooms')) params.bedrooms = qp.get('bedrooms');

        if (qp.get('property_subtype') || qp.get('propertySubtype')) {
          params.propertySubtype = qp.get('property_subtype') || qp.get('propertySubtype');
        }
        if (qp.get('unitType') || qp.get('unit_type')) {
          params.unitType = qp.get('unitType') || qp.get('unit_type');
        }
        if (qp.get('status')) params.status = qp.get('status');
        if (filterParamKey && filterTokenFromUrl) params.filterToken = filterTokenFromUrl;

        // If you have a dedicated public-search endpoint, use that.
        // For now, we call getSearch but still filter client-side.
        response = await propertiesAPI.getSearch(params);
      } else {
        // ✅ Header/basic -> list endpoint (force public)
        const simpleParams: any = {
          status: qp.get('status') || 'Available',
          limit: 50,
          isPublic: true,
          is_public: 1,
          visibility: 'public',
          publicOnly: 1,
        };

        const allLocs = qp.getAll('location');
        if (allLocs.length > 0) simpleParams.location = allLocs.join(',');
        else if (qp.get('location')) simpleParams.location = qp.get('location');

        if (qp.get('city')) simpleParams.city = qp.get('city');
        if (qp.get('search')) simpleParams.q = qp.get('search');

        try {
          response = await propertiesAPI.PublicgetProperties(simpleParams);
        } catch (err) {
          console.warn('PublicgetProperties failed, fallback to empty', err);
          response = { data: [] };
        }
      }

      // normalize
      let list: any[] = [];
      if (Array.isArray(response)) list = response;
      else if (response?.data && Array.isArray(response.data)) list = response.data;
      else if (response?.results && Array.isArray(response.results)) list = response.results;
      else if (response?.properties && Array.isArray(response.properties)) list = response.properties;
      else if (Array.isArray(response?.items)) list = response.items;

      // ✅ client-side strict public-only guard
      list = list.filter(isPublicProp);

      // map → UI + fetch (views & tags) in parallel per property
      const transformedProperties = await Promise.all(
        list.map(async (p: any, index: number) => {
          const [viewCounts, tags] = await Promise.all([
            fetchPropertyViews(p.id),
            fetchPropertyTags(p.id),
          ]);

          return {
            id: p.id,
            slug: p.slug || p.url_slug || p.generated_slug,
            title: p.title || `${p.unit_type || ''} ${p.property_type_name || ''}`.trim() || `Property ${p.id}`,
            price: Number(p.budget) || Number(p.price) || 0,
            bedrooms: Number(p.bedrooms) || 0,
            bathrooms: Number(p.bathrooms) || 0,
            square_feet: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            city: p.city_name || p.city || '',
            property_type: p.property_type_name || p.property_type || '',
            status: p.status || '',
            images: Array.isArray(p.photos) ? p.photos.map((ph: string) => ph.replace(/\\/g, '/')) :
                    (Array.isArray(p.photoUrls) ? p.photoUrls :
                      ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800']),
            location: `${p.location_name || p.location || ''}`.replace(/\s*,\s*$/, ''),
            society: p.society_name || p.project_name || `Society ${p.id}`,
            area: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            parking: Number(p.parking_slots) || Math.floor(Math.random() * 3) + 1,
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
            agent: {
              name: p.agent_name || `Agent ${index + 1}`,
              phone: p.agent_phone || `+91 99999 999${String(index % 100).padStart(2, '0')}`,
              rating: p.agent_rating || (4 + Math.random())
            },
            highlights: p.highlights || ['Prime Location', 'Good Value', 'Verified', 'No Brokerage'].slice(0, (index % 4) + 1),
            nearbyPlaces: p.nearby_places || [
              { name: 'Metro Station', distance: `${(Math.random() * 2).toFixed(1)} km` },
              { name: 'Shopping Mall', distance: `${(Math.random() * 3).toFixed(2)} km` },
              { name: 'School', distance: `${(Math.random() * 2).toFixed(1)} km` }
            ],
            public_views: p.public_views ?? null,
            floor: extractFloor({ ...p, _raw: p }),
            tags,
            _raw: p
          } as Property;
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
  }, [location.search, filterParamKey, filterTokenFromUrl]);

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
      setTransactionType('buy');
      setMinRating(null);
      setPossessionFilter('');
      setParkingFilter('any');
      setFloorMin('');
      setFloorMax('');
      setBathroomsFilter('');
      navigate('/properties', { replace: true });
      return;
    }
    setSelectedPropertyType(prev => (prev === value ? '' : value));
    setSelectedType(prev => (prev === value ? '' : value));
  };

  useEffect(() => {
    setSelectedPropertyType(selectedType || '');
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
    const id = property.id;
    const slug = property.slug;
    if (!slug) {
      console.warn('Attempted to navigate to property without slug:', id);
      setCurrentPropertyView(property);
      if (onPropertyView) onPropertyView(property);
      return;
    }

    if (viewedProperties.has(id)) {
      const mergedQs = preserveAndAddToken(location.search, filterParamKey || 'fltcnt', filterTokenFromUrl);
      navigate(`/properties/${encodeURIComponent(String(slug))}${mergedQs}`);
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
    const dest = `/properties/${encodeURIComponent(String(slug))}${mergedQs}`;
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

    setCurrentPage(1);
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
  };

  const onToggleFilters = () => setShowFilters(s => !s);

  /* ==============================
     Render
  ============================== */
  if (currentPropertyView) {
    return <PublicPropertyDetailPage property={currentPropertyView} />;
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
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setTransactionType("buy")}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                    ${"buy" === "buy" ? "bg-[#E6761D] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  aria-pressed={true}
                >
                  Buy
                </button>

                <button
                  type="button"
                  onClick={() => {}}
                  className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base transition bg-gray-100 text-gray-700 opacity-60 cursor-not-allowed"
                  title="Rent search not available yet"
                  disabled
                  aria-disabled="true"
                  aria-pressed={false}
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
                      navigate('/properties', { replace: true });
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
                  <div className="text-xs text-white px-2 py-1">Add up to 5 localities.</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AI Recommendations bar */}
      {showAIRecommendations && !loading && allProperties.length > 0 && (
        <div className="bg-gradient-to-r from-[#E6761D] via-[#CC6A1A] via-[#0b3856] to-[#0c3854] text-white py-2 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start sm:items-center justify-between">
              <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                <Bot className="text-yellow-300 drop-shadow-md shrink-0 mt-0.5 sm:mt-0" size={40} />
                <div className="flex flex-col">
                  <span className="font-semibold">AI Recommendations:</span>
                  <span className="text-xs sm:text-sm">
                    Found {allProperties.length} public properties. {selectedLocation || "Top areas"} show strong growth potential
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="ml-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-1 rounded transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header row */}
        <div className="grid grid-cols-1 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-nowrap sm:items-center sm:justify-between mb-2">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-[#0b3856]">All Properties</h2>
              {Boolean(selectedLocation || localities.length || selectedBudget) && (
                <p className="text-gray-600 text-sm">
                  {selectedLocation && `in ${selectedLocation} • `}
                  {localities.length > 0 && `${localities.join(', ')} • `}
                  {selectedBudget &&
                    `${(budgetOptions.find((b) => (b.value || b.label) === selectedBudget)?.label) || selectedBudget} • `}
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProperties.length)} results
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-2 rounded-lg w-10 h-10 flex items-center justify-center ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-2 rounded-lg w-10 h-10 flex items-center justify-center ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-end justify-end gap-3">
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

                    {/* Parking */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Parking</label>
                      <select
                        value={parkingFilter}
                        onChange={(e) => setParkingFilter(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      >
                        <option value="any">Any</option>
                        <option value="2w">2-Wheeler</option>
                        <option value="4w">4-Wheeler</option>
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
                        type="number" min={0}
                        value={bathroomsFilter as any}
                        onChange={(e) => setBathroomsFilter(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProperties.map((property) => {
                  const composedTitle = composeHeaderTitle(property);
                  const unitAreaLine = formatUnitAreaLine(property);
                  const { locationPart, cityPart } = splitLocationCity(property);
                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                      onClick={() => { if (property.slug) { handleNavigateToProperty(property); return; } setCurrentPropertyView(property); if (onPropertyView) onPropertyView(property); }}
                    >
                      <div className="relative">
                        <img
                          src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={String(property.title)}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        <div className="absolute top-3 left-3 flex items-center flex-wrap gap-2 z-20">
  {/* ✅ Property Tags */}
  <PropertyTags tags={property.tags || []} />

  {(property.aiScore ?? 0) >= 90 && (
    <span className="flex items-center bg-purple-600 text-white px-2 py-[3px] rounded-full text-[8px] sm:text-xs font-bold whitespace-nowrap shadow-sm">
      <Bot size={12} className="mr-1" />
      AI {Math.round(property.aiScore ?? 0)}
    </span>
  )}
  {/* ✅ AI Score Badge */}
</div>


                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-white text-2xl font-bold opacity-40 select-none">ResaleExpert.in</span>
                        </div>

                        {/* <button
                          onClick={(e) => { e.stopPropagation(); setLikedProperties((prev) => prev.includes(property.id.toString()) ? prev.filter((id) => id !== property.id.toString()) : [...prev, property.id.toString()]); }}
                          className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                        >
                          <Heart size={16} className={likedProperties.includes(property.id.toString()) ? 'text-red-500 fill-current' : 'text-gray-600'} />
                        </button> */}

                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Eye size={10} />
                          <span>{property.total_views || property.views || 0}</span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="text-xs font-bold text-[#0b3856] mb-1 group-hover:text-[#E6761D] transition-colors">{composedTitle}</h3>
                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <MapPin size={14} className="mr-1" />
                            <span>{locationPart}{locationPart && cityPart ? ', ' : ''}{cityPart}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-xl font-bold text-green-600">{formatCurrency(property.price)}</div>
                          <div className="text-xs text-gray-500">{property.type || property.property_type} • {property.area || property.square_feet} sq ft</div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="text-yellow-400 fill-current" size={14} />
                            <span className="text-sm font-medium text-gray-700">{(property.rating || 4.2).toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({property.reviews || 0} reviews)</span>
                          </div>
                          <div className="text-xs text-gray-500">{property.postedDate}</div>
                        </div>

                        <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2"><TrendingUp size={12} /><span className="text-xs text-green-600 font-semibold">{property.priceGrowth || '+12%'}</span></div>
                          <div className="flex items-center space-x-2"><BarChart3 size={12} /><span className="text-xs text-blue-600 font-semibold">Grade {property.investmentGrade || 'A'}</span></div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                          <div className="flex items-center space-x-1"><Bed size={12} /><span>{property.bedrooms} Beds</span></div>
                          <div className="flex items-center space-x-1"><Building size={12} /><span>{property.bathrooms} Baths</span></div>
                          <div className="flex items-center space-x-1"><Car size={12} /><span>{property.parking || 1} Parking</span></div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {(property.amenities || []).slice(0, 3).map((amenity: string, i: number) => (
                            <div key={i} className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {(property.amenities || []).length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">+{(property.amenities || []).length - 3}</span>}
                        </div>

                        <div className="flex items-center space-x-2">
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
                            <button disabled aria-disabled="true" title="Details not available – missing backend slug" className="w-full bg-gray-300 text-gray-600 py-2 px-3 rounded-lg cursor-not-allowed text-sm">
                              View Details
                            </button>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`tel:${property.agent?.phone}`); }}
                            className="p-2 rounded-lg transition-colors duration-300 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                          >
                            <Phone size={16} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const message = `Hi, I'm interested in ${property.title} at ${property.location}. Price: ${formatCurrency(property.price)}. Can you share more details?`;
                              window.open(
                                `https://wa.me/${(property.agent?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
                                '_blank'
                              );
                            }}
                            className="p-2 rounded-lg transition-colors duration-300 bg-[#25D366] text-white hover:bg-[#1ebe57]"
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
              <div className="space-y-6">
                {paginatedProperties.map((property) => {
                  const composedTitle = composeHeaderTitle(property);
                  const unitAreaLine = formatUnitAreaLine(property);
                  const { locationPart, cityPart } = splitLocationCity(property);
                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                      onClick={() => { if (property.slug) { handleNavigateToProperty(property); return; } setCurrentPropertyView(property); if (onPropertyView) onPropertyView(property); }}
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 relative">
                          <img
                            src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
                            alt={String(property.title)}
                            className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          <div className="absolute top-3 left-3 flex space-x-2">
                            <PropertyTags tags={property.tags || []} />
                          </div>

                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                            <Eye size={10} />
                            <span>{property.total_views || property.views || 0} views</span>
                          </div>
                        </div>

                        <div className="md:w-2/3 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-[#0b3856] mb-2 group-hover:text-blue-600 transition-colors">{composedTitle}</h3>
                              <div className="flex items-center text-gray-600 mb-2"><MapPin size={16} className="mr-2" /><span>{locationPart}{locationPart && cityPart ? ', ' : ''}{cityPart}</span></div>
                              <div className="text-sm text-gray-600"><span>{unitAreaLine}</span></div>
                            </div>

                            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Star size={16} />
                              <span className="font-semibold text-gray-700">{(property.rating || 4.2).toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({property.reviews || 0})</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
                            <div className="text-sm text-gray-500">₹{Math.round(property.price / (property.area || property.square_feet || 1)).toLocaleString()}/sq ft</div>
                          </div>

                          <div className="grid grid-cols-4 gap-3 mb-4">
                            <div className="text-center p-2 bg-gray-50 rounded-lg"><Bed className="mx-auto text-gray-600 mb-1" size={20} /><div className="font-semibold text-[#0b3856]">{property.bedrooms}</div><div className="text-xs text-gray-500">Bedrooms</div></div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg"><Building className="mx-auto text-gray-600 mb-1" size={20} /><div className="font-semibold text-[#0b3856]">{property.bathrooms}</div><div className="text-xs text-gray-500">Bathrooms</div></div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg"><Home className="mx-auto text-gray-600 mb-1" size={20} /><div className="font-semibold text-[#0b3856]">{property.area || property.square_feet}</div><div className="text-xs text-gray-500">Sq Ft</div></div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg"><Car className="mx-auto text-gray-600 mb-1" size={20} /><div className="font-semibold text-[#0b3856]">{property.parking || 1}</div><div className="text-xs text-gray-500">Parking</div></div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-green-50 rounded-lg"><TrendingUp className="mx-auto text-green-600 mb-1" size={16} /><div className="text-sm font-semibold text-green-600">{property.priceGrowth || '+12%'}</div><div className="text-xs text-gray-500">Growth</div></div>
                            <div className="text-center p-2 bg-purple-50 rounded-lg"><Bot className="mx-auto text-purple-600 mb-1" size={16} /><div className="text-sm font-semibold text-purple-600">{property.aiScore || 85}</div><div className="text-xs text-gray-500">AI Score</div></div>
                            <div className="text-center p-2 bg-blue-50 rounded-lg"><BarChart3 className="mx-auto text-blue-600 mb-1" size={16} /><div className="text-sm font-semibold text-blue-600">{property.investmentGrade || 'A'}</div><div className="text-xs text-gray-500">Grade</div></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4"><div className="text-sm text-gray-500">Posted {property.postedDate}</div></div>

                            <div className="flex items-center space-x-2">
                              {(typeof property.slug === 'string' && property.slug.trim().length > 0) ? (
                                <button onClick={(e) => { e.stopPropagation(); handleNavigateToProperty(property); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">View Details</button>
                              ) : (
                                <button disabled aria-disabled="true" title="Details not available – missing backend slug" className="bg-gray-300 text-gray-600 px-6 py-2 rounded-lg cursor-not-allowed">View Details</button>
                              )}

                              <button onClick={(e) => { e.stopPropagation(); setLikedProperties((prev) => prev.includes(property.id.toString()) ? prev.filter((id) => id !== property.id.toString()) : [...prev, property.id.toString()]); }} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                <Heart size={16} className={likedProperties.includes(property.id.toString()) ? 'text-red-500 fill-current' : 'text-gray-600'} />
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
            <h3 className="text-2xl font-bold text-[#0b3856] mb-4">No Properties Available</h3>
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
