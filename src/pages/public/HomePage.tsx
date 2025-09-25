// HomePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Search,
  MapPin,
  Building,
  Star,
  Phone,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  Brain,
  BarChart3,
  Target,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Shield,
  IndianRupee
} from 'lucide-react';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import { propertiesAPI } from '@/lib/propertiesAPI';

import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import viewsAPI from '@/lib/viewAPI';
import PublicSellPropertyForm from './PublicSellPropertyForm';

interface Property {
  id: number;
  title?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  city?: string;
  property_type?: string;
  status?: string;
  images?: string[];
  location?: string;
  area?: number;
  type?: string;
  unitType?: string;
  subtype?: string;
  amenities?: string[];
  badge?: string;
  rating?: number;
  views?: number;
  aiScore?: number;
  sellerName?: string;
  slug?: string | undefined;
  property_status?: string;
  possessionMonth?: string | null;
  possessionYear?: string | null;
  created_at?: string | null;
  public_views?: number | null;
  total_views?: number;
}

const HomePage = ({ onPageChange, onPropertyView, onAuthAction }: any) => {
  const [searchQuery, setSearchQuery] = useState(''); // free text (kept but not used)
  // City now from dropdown
  const [selectedCity, setSelectedCity] = useState('');
  // Localities input + array of localities (max 5)
  const [localityInput, setLocalityInput] = useState('');
  const [localities, setLocalities] = useState<string[]>([]);

  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [currentPropertyView, setCurrentPropertyView] = useState<any | null>(null);

  const [viewedProperties, setViewedProperties] = useState<Set<number>>(new Set());

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

  const [suggestions, setSuggestions] = useState<MasterOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Parse original query params and preserve both key and value.
  const queryParams = new URLSearchParams(location.search);
  const filterParamKey =
    queryParams.has('filterToken') ? 'filterToken' :
      (queryParams.has('tf') ? 'tf' : undefined);
  const filterToken = filterParamKey ? (queryParams.get(filterParamKey) as string | null) ?? undefined : undefined;

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

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name || 'ResaleExpert';

  const fetchPropertyViews = async (propertyId: number): Promise<{ total_views: number }> => {
    try {
      const viewData = await viewsAPI.getByProperty(propertyId, false);
      return { total_views: viewData?.total_views || 0 };
    } catch (err) {
      console.error(`Error fetching views for property ${propertyId}:`, err);
      return { total_views: 0 };
    }
  };

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getProperties({
          status: 'Available',
          limit: 6,
        });

        const rawList = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

        const mapped = await Promise.all(rawList.map(async (p: any) => {
          const images = Array.isArray(p.amenities)
            ? p.photos?.map((ph: string) => ph.replace(/\\/g, '/')) ?? []
            : (Array.isArray(p.photoUrls) ? p.photoUrls : []);

          const city = p.city_name || p.city || p.town || p.cityName || '';
          const locationRaw = p.location_name || p.locality || p.area || p.neighbourhood || p.location || p.address || '';
          const state = p.state || p.region || '';
          const location = [locationRaw, city, state].filter(Boolean).slice(0, 2).join(', ');

          let amenities: string[] = [];
          if (Array.isArray(p.amenities)) amenities = p.amenities.map(String).map(s => s.trim()).filter(Boolean);
          else if (typeof p.amenities === 'string') amenities = p.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
          else if (p.features) {
            if (Array.isArray(p.features)) amenities = p.features.map(String).map(s => s.trim()).filter(Boolean);
            else if (typeof p.features === 'string') amenities = p.features.split(',').map((s: string) => s.trim()).filter(Boolean);
          }

          const unitType = (p.unit_type || p.unit_type_name || p.unit || p.unitType || '').toString().trim();
          const subtype = (p.property_subtype_name || p.property_subtype || p.unit_category_name || p.subtype || '').toString().trim();

          const rawSlug = p?.slug ?? p?.url_slug ?? p?.generated_slug;
          const slug = typeof rawSlug === 'string' && rawSlug.trim().length > 0 ? rawSlug.trim() : undefined;
          if (!slug) console.warn('[HomePage] Missing backend slug for property id:', p?.id);

          const viewCounts = await fetchPropertyViews(p.id);

          return {
            id: p.id,
            title: (p.title || `${unitType ? unitType + ' ' : ''}${p.property_type_name || p.property_type || ''}`).trim(),
            price: Number(p.budget || p.price || p.amount) || 0,
            bedrooms: Number(p.bedrooms) || undefined,
            bathrooms: Number(p.bathrooms) || undefined,
            square_feet: Number(p.carpet_area) || Number(p.builtup_area) || Number(p.area) || undefined,
            city,
            property_type: p.property_type_name || p.property_type || '',
            status: p.status || '',
            images,
            location,
            area: Number(p.carpet_area) || Number(p.builtup_area) || Number(p.area) || undefined,
            type: p.property_type_name || p.property_type || '',
            unitType,
            subtype,
            amenities,
            badge: p.featured ? 'Premium' : (p.badge || 'Standard'),
            rating: (typeof p.rating === 'number' ? p.rating : (4.5 + Math.random() * 0.4)),
            views: viewCounts.total_views || 0,
            total_views: viewCounts.total_views,
            aiScore: Number(p.aiScore) || Math.floor(Math.random() * 20) + 80,
            sellerName: p.seller_name || p.owner_name || p.seller?.name || '',
            slug,
            possessionMonth: p.possession_month ?? p.possessionMonth ?? null,
            possessionYear: p.possession_year ?? p.possessionYear ?? null,
            property_status: p.property_status ?? p.status ?? '',
            created_at: p.created_at ?? null,
            public_views: p.public_views ?? null
          } as Property;
        }));

        setFeaturedProperties(mapped);
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  useEffect(() => {
    if (!featuredProperties.length) return;
    const t = setInterval(() => setFeaturedIndex(i => (i + 1) % featuredProperties.length), 5000);
    return () => clearInterval(t);
  }, [featuredProperties.length]);

  const handleViewProperty = (property: Property) => {
    setCurrentPropertyView(property);
  };

  const internalAuthAction = (action: string) => {
    if (action === 'subscribe') setIsSubOpen(true);
    if (onAuthAction) onAuthAction(action);
  };

  const findMasterOptions = (candidateKeys: string[]) => {
    if (!masters || typeof masters !== 'object') return [];
    const lowerKeyMap: Record<string, string> = {};
    Object.keys(masters).forEach(k => (lowerKeyMap[k.toLowerCase().replace(/\s+/g, '')] = k));
    for (const ck of candidateKeys) {
      const n = ck.toLowerCase().replace(/\s+/g, '');
      if (lowerKeyMap[n]) return masters[lowerKeyMap[n]];
    }
    for (const ck of candidateKeys) {
      const n = ck.toLowerCase().replace(/\s+/g, '');
      const found = Object.keys(masters).find(k => k.toLowerCase().replace(/\s+/g, '').includes(n));
      if (found) return masters[found];
    }
    return [];
  };

  const masterCity: MasterOption[] = findMasterOptions(['city']);
  const propertyTypeOptions: MasterOption[] = findMasterOptions(['property type', 'property_type', 'propertytype', 'type', 'property']);
  // NEW: try to find location/locality masters
  const masterLocation: MasterOption[] = findMasterOptions(['location', 'locality', 'localities', 'area', 'neighbourhood', 'neighborhood', 'locality_name']);

  const formatPrice = (price: any) => {
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) return ' - ';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // State for Buy/Rent toggle (only Buy works; Rent disabled)
  const [transactionType, setTransactionType] = useState<'buy' | 'rent'>('buy');

  // Helper: add a locality (max 5)
  const addLocality = (value?: string) => {
    const v = (value ?? localityInput ?? '').toString().trim();
    if (!v) return;
    // normalise: remove extra spaces and trailing commas
    const normalized = v.replace(/\s{2,}/g, ' ').replace(/(^,|,$)/g, '').trim();
    if (!normalized) return;
    if (localities.includes(normalized)) {
      setLocalityInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (localities.length >= 5) {
      // could show toast - console for now
      console.warn('Maximum 5 localities allowed');
      setLocalityInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLocalities(prev => [...prev, normalized]);
    setLocalityInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeLocality = (idx: number) => {
    setLocalities(prev => prev.filter((_, i) => i !== idx));
  };

  // Suggestion handling
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    // if we have masterLocation options and user typed something, filter suggestions
    const q = (localityInput || '').trim().toLowerCase();
    if (!q || !Array.isArray(masterLocation) || masterLocation.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // filter by label or value
    const matched = masterLocation
      .filter(opt => {
        const label = (opt.label || '').toString().toLowerCase();
        const value = (opt.value || '').toString().toLowerCase();
        return label.includes(q) || value.includes(q);
      })
      .slice(0, 10); // limit
    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
  }, [localityInput, masterLocation]);

  // When user clicks Search: navigate to PublicPropertiesPage with query params
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Only Buy search is enabled — if rent selected, do nothing (or show disabled)
    if (transactionType === 'rent') {
      console.warn('Rent search not implemented yet. Only Buy is active.');
      return;
    }

    const params: Record<string, string> = {};

    // City must come from dropdown; only include if set
    if (selectedCity) {
      params.city = selectedCity;
    }

    // If localities present, send them as comma-separated WITHOUT spaces
    if (localities.length > 0) {
      params.location = localities.join(',');
    }

    // Only send propertyType if present
    if (selectedPropertyType) {
      params.propertyType = selectedPropertyType;
    }

    // Only send budget if present
    if (selectedBudget) {
      params.budget = selectedBudget;
    }

    // mark this as a buy / available search so backend can filter by status if it supports
    params.status = 'Available';

    // preserve existing filter token if present
    if (filterToken && filterParamKey) {
      params[filterParamKey] = filterToken;
    }

    // Build search string (only include keys that have values)
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(k => {
      const v = (params as any)[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        searchParams.set(k, String(v));
      }
    });

    const qs = searchParams.toString();
    const finalURL = `/properties${qs ? `?${qs}` : ''}`;
    navigate(finalURL);
  };

  // Fix: call the handler or fallback to modal
  const handleSellPropertyClick = () => {
    if (onAuthAction) {
      onAuthAction('sell');
    } else {
      setIsSellerModalOpen(true);
    }
  };

  // Minimal handler so PublicSellPropertyForm onSubmit has something meaningful to call.
  // You can replace this with actual save logic / API call as needed.
  const handleSellerSave = async (formData: any) => {
    try {
      console.log('Selling form submitted (stub):', formData);
      // TODO: call your API to save the seller/property info
      setIsSellerModalOpen(false);
      // maybe navigate to a thank-you page or show toast
    } catch (err) {
      console.error('Error saving seller/property:', err);
    }
  };

  // Enhanced navigation function used on click property cards (keeps previous behavior)
  const handleNavigateToProperty = async (property: Property) => {
    const id = property.id;
    const slug = property.slug;
    if (!slug) {
      console.warn('Attempted to navigate to property without slug:', id);
      return;
    }

    if (viewedProperties.has(id)) {
      let dest = `/properties/${encodeURIComponent(String(slug))}`;
      if (filterToken) {
        const finalParamKey = filterParamKey || 'tf';
        dest += `?${encodeURIComponent(finalParamKey)}=${encodeURIComponent(filterToken)}`;
      }
      navigate(dest);
      return;
    }

    const inferredFilters = {
      search: searchQuery || null,
      location: localities.length ? localities.join(', ') : null,
      city: selectedCity || null,
      budget: selectedBudget || null,
      propertyType: selectedPropertyType || null,
      source: 'homepage',
      clickedPropertyId: id,
    };

    try {
      let finalToken = filterToken;
      let finalParamKey = filterParamKey || 'tf';

      if (!finalToken) {
        try {
          const createRes = await propertiesAPI.createFilterContext({ filters: inferredFilters });
          if (createRes && createRes.id) finalToken = createRes.id;
          else console.warn('createFilterContext did not return id, response:', createRes);
        } catch (err) {
          console.warn('createFilterContext failed (proceeding without token):', err);
        }
      }

      try {
        await propertiesAPI.sendPropertyEvent(
          id,
          'click',
          'listing_card_click',
          { source: 'homepage', title: property.title || null },
          { slug, filterToken: finalToken || undefined, filterParamKey: finalParamKey }
        );

        setViewedProperties(prev => new Set(prev).add(id));
      } catch (err) {
        console.warn('sendPropertyEvent failed (we will still navigate):', err);
      }

      let dest = `/properties/${encodeURIComponent(String(slug))}`;
      if (finalToken) {
        dest += `?${encodeURIComponent(finalParamKey)}=${encodeURIComponent(finalToken)}`;
      }
      navigate(dest);
    } catch (err) {
      console.error('handleNavigateToProperty unexpected error:', err);
      navigate(`/properties/${encodeURIComponent(String(slug))}`);
    }
  };

  if (currentPropertyView) {
    return <PublicPropertyDetailPage property={currentPropertyView} onBack={() => setCurrentPropertyView(null)} />;
  }

  return (
    <div className="min-h-screen">
      {/* hero/search - increased height so carousel/bg is taller */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden ">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        {featuredProperties.length > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${featuredProperties[featuredIndex]?.images?.[0] || ''})`, filter: 'brightness(0.35)' }}
          />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12  sm:py-20 md:py-28">

          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Find Your <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Dream Property</span>
            </h1>
            <p className="text-blue-100 mb-6">AI-powered property search in Mumbai's premium locations</p>

            {/* Row: Buy/Rent + PropertyType */}
            <div className="flex flex-col items-center gap-3 mb-6 md:flex-row md:justify-center">
              {/* Buy/Rent */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTransactionType("buy")}
                  className={`px-4 py-1 rounded-full ${transactionType === "buy"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                    }`}
                >
                  Buy
                </button>

                <button
                  type="button"
                  onClick={() => setTransactionType("rent")}
                  className={`px-4 py-1 rounded-full ${transactionType === "rent"
                    ? "bg-gray-300 text-gray-600"
                    : "bg-gray-100 text-gray-700"
                    }`}
                  title="Rent search not available yet"
                >
                  Rent
                </button>
              </div>

              {/* property-type buttons group */}
              <div className="flex items-center justify-center w-full md:w-auto overflow-x-auto">
                {masterLoading ? (
                  <div className="text-sm text-white/80 px-3 py-1">Loading types...</div>
                ) : (
                  <div className="flex gap-2 py-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPropertyType("")}
                      aria-pressed={selectedPropertyType === ""}
                      className={`px-3 py-1 rounded-full ${selectedPropertyType === ""
                        ? "bg-white text-black"
                        : "bg-white/30 text-white"
                        }`}
                    >
                      All
                    </button>

                    {propertyTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedPropertyType(opt.value)}
                        aria-pressed={selectedPropertyType === opt.value}
                        className={`whitespace-nowrap px-3 py-1 rounded-full ${selectedPropertyType === opt.value
                          ? "bg-white text-black"
                          : "bg-white/20 text-white"
                          }`}
                        title={opt.label}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSearch}
              className="bg-white/10 text-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-5xl mx-auto"
            >
              <div className="flex flex-col gap-3 md:flex-row">
                {/* City dropdown (transparent) */}
                <div className="relative w-full md:w-48">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={masterLoading}
                    className="appearance-none px-3 py-2 border z-100 rounded-lg w-full bg-transparent text-white border-white/30 focus:outline-none focus:ring-1 focus:ring-white"
                  >
                    <option value="" className="bg-gray-900 text-white">{masterLoading ? "Loading cities..." : "Select city"}</option>
                    {masterCity.map((o) => (
                      <option key={o.value} value={o.value} className="bg-gray-900 text-white">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {/* custom arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <ChevronRight className="text-white rotate-90" size={14} />
                  </div>
                </div>

                {/* Locality input */}
                <div className="relative flex-grow">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2  text-white "
                    size={18}
                  />
                  <input
                    ref={inputRef}
                    value={localityInput}
                    onChange={(e) => setLocalityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLocality();
                      } else if (e.key === "Escape") {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 120);
                    }}
                    className="pl-10 pr-24 py-2 border rounded-lg w-full bg-white/20 text-white placeholder-white outline-none focus:ring-1 focus:ring-gray-400"
                    placeholder={
                      Array.isArray(masterLocation) && masterLocation.length > 0
                        ? "Type locality (autosuggest). Enter to add"
                        : "Type locality (free text). Enter to add"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => addLocality()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600/90 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Add
                  </button>

                  {/* Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul
                      className="absolute left-0 right-0 mt-1 max-h-32 lg:max-w-60 overflow-auto 
               bg-gray-700 border rounded-lg shadow-lg z-[200] custom-scroll"
                    >
                      {suggestions.map((s, idx) => (
                        <li
                          key={`${s.value}-${idx}`}
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => {
                            const toAdd =
                              s.label?.toString().trim() || s.value?.toString().trim();
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

                {/* Search button */}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg w-full md:w-28 text-sm"
                >
                  Search
                </button>
              </div>

              {/* Locality chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {localities.map((loc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center bg-white/20 text-white px-3 py-1 rounded-full text-sm"
                  >
                    <span className="mr-2">{loc}</span>
                    <button
                      type="button"
                      onClick={() => removeLocality(idx)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {localities.length === 0 && (
                  <div className="text-xs text-gray-100">Add up to 5 localities.</div>
                )}
              </div>
            </form>

          </div>
        </div>

        {featuredProperties.length > 0 && (
          <>
            {/* Dots (Hide on mobile, show from sm+) */}
            <div className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 space-x-2">
              {featuredProperties.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIndex(i)}
                  className={`w-2 h-2 rounded-full ${i === featuredIndex ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>

            {/* Left Button (Hide on mobile) */}
            <button
              onClick={() =>
                setFeaturedIndex(
                  (i) => (i - 1 + featuredProperties.length) % featuredProperties.length
                )
              }
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full"
            >
              <ChevronLeft className="text-white" />
            </button>

            {/* Right Button (Hide on mobile) */}
            <button
              onClick={() => setFeaturedIndex((i) => (i + 1) % featuredProperties.length)}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full"
            >
              <ChevronRight className="text-white" />
            </button>
          </>
        )}

      </section>

      {/* AI Insights */}
      <section className="py-2 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Brain className="text-purple-600" size={26} />
              <h2 className="text-3xl font-bold text-gray-800 mb-0">AI Market Intelligence</h2>
            </div>
            <p className="text-gray-600">Real-time market analysis powered by advanced AI algorithms</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-6 rounded-xl shadow"><TrendingUp className="text-green-600" /><h3 className="font-semibold mt-1">Price Trends</h3><div className="text-sm text-gray-500">Andheri West +12.5%</div></div>
            <div className="bg-white p-6 rounded-xl shadow"><Target className="text-blue-600" /><h3 className="font-semibold mt-1">Best ROI</h3><div className="text-sm text-gray-500">Bandra West 18.2%</div></div>
            <div className="bg-white p-6 rounded-xl shadow"><BarChart3 className="text-purple-600" /><h3 className="font-semibold mt-1">Market Heat</h3><div className="text-sm text-gray-500">Powai - Hot</div></div>
            <div className="bg-white p-6 rounded-xl shadow"><Sparkles className="text-orange-600" /><h3 className="font-semibold mt-1">AI Score</h3><div className="text-sm text-gray-500">Avg 92/100</div></div>
          </div>

          <div className="text-center mt-4">
            <button onClick={() => internalAuthAction('subscribe')} className="bg-purple-600 text-white px-2 py-1 rounded-lg">Get Full AI Report</button>
            <SubscriptionModal isOpen={isSubOpen} onClose={() => setIsSubOpen(false)} />
          </div>
        </div>
      </section>

      {/* Featured properties cards */}
      <section className="py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Properties</h2>
            <p className="text-gray-600">Handpicked premium properties with AI recommendations</p>
          </div>

          {loading ? (
            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group">
                  <div className="relative">
                    {property.images && property.images.length ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center"><Building className="text-gray-400" /></div>
                    )}

                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-white text-sm ${property.badge === 'Premium' ? 'bg-blue-500' : 'bg-orange-500'}`}>{property.badge || 'Featured'}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="p-2 bg-white/80 rounded-full"><Heart className="text-red-500" /></button>
                      <button className="p-2 bg-white/80 rounded-full"><Eye className="text-blue-500" /></button>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="text-yellow-500" size={12} />
                        <span className="text-xs font-semibold text-gray-900">{(property.rating || 4.5).toFixed(1)}</span>
                      </div>
                      <div className="bg-white/90 rounded-full px-2 py-1">
                        <span className="text-xs font-semibold text-gray-900">
                          {property.total_views || property.views || 0} views
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="pr-4">
                        <div className="font-bold text-gray-900 text-lg">
                          {[property.type, property.unitType, property.subtype].filter(Boolean).join('  ') || ' - '}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold text-green-600">{formatPrice(property.price)}</div>
                        <div className="text-sm text-gray-500">{property.unitType || property.type} • {property.square_feet ?? property.area ?? ' - '} sq ft</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Price per sq ft</div>
                        <div className="font-semibold text-gray-900">₹{Math.round((property.price || 0) / (property.square_feet || property.area || 1)).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin size={16} className="mr-2" />
                      <span>{property.location || property.city || ' - '}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(property.amenities || []).slice(0, 3).map((a, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{a}</span>
                      ))}
                      {property.amenities && property.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">+{property.amenities.length - 3} more</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {property.slug ? (
                        <div className="flex-1">
                          <button
                            onClick={() => handleNavigateToProperty(property)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      ) : (
                        <button disabled className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed" title="Details not available">
                          View Details
                        </button>
                      )}

                      <button className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors group">
                        <Phone className="text-green-600 group-hover:text-green-700" size={20} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-4">
            <Link to="/properties"><button onClick={() => onPageChange && onPageChange('properties')} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-xl">View All Properties</button></Link>
          </div>
        </div>
      </section>

      {/* Sell CTA / Footer minimal */}
      <section className="py-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Sell Your Property with AI Pricing</h2>
              <p className="text-green-100 mb-4">Get the best price with our AI-powered valuation and reach verified buyers instantly.</p>
              <div className="flex gap-4">
                {/* FIXED: use handleSellPropertyClick so modal fallback works */}
                <button onClick={handleSellPropertyClick} className="bg-white text-green-600 px-2 py-1 rounded-lg">List My Property</button>
                <button className="border border-white px-2 py-1 rounded-lg">Free Valuation</button>
              </div>
            </div>
            <div className="relative">
              <img src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Sell" className="rounded-xl shadow-lg" />
              <div className="absolute -bottom-2 -left-2 bg-white p-1 rounded-xl shadow"> < IndianRupee className="text-green-600" />
                <div className="text-sm text-gray-600">₹500Cr+ Properties Sold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Compact */}
      <section className="py-5 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-3xl font-bold text-gray-800 mb-4">Why Choose ResaleExpert?</h2>
            <p className="text-gray-600">AI-powered real estate platform trusted by thousands</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                <Shield className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">100% Verified</h3>
              <p className="text-gray-600 text-sm">
                Every property verified for legal compliance and authenticity.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                <Brain className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Smart property matching based on your preferences and budget.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                <Users className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Expert Support</h3>
              <p className="text-gray-600 text-sm">
                Dedicated real estate experts guide you throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Compact */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Home className="text-blue-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-gray-600 text-sm">Properties</div>
            </div>
            <div className="group">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-green-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">25K+</div>
              <div className="text-gray-600 text-sm">Customers</div>
            </div>
            <div className="group">
              <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="text-orange-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600 text-sm">Years</div>
            </div>
            <div className="group">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="text-purple-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">4.9★</div>
              <div className="text-gray-600 text-sm">Rating</div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials - Compact */}
      <section className="py-5 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-3xl font-bold text-gray-800 mb-4">Customer Success Stories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rajesh Kumar',
                text: 'Found my dream home in 2 weeks with AI matching!',
                rating: 5,
                property: '3BHK Andheri'
              },
              {
                name: 'Priya Sharma',
                text: 'Sold my property 20% above market rate with their AI pricing.',
                rating: 5,
                property: 'Villa Koregaon'
              },
              {
                name: 'Amit Patel',
                text: 'Seamless process from search to registration.',
                rating: 5,
                property: '2BHK Gurgaon'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.property}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA - Compact */}
      <section className="py-5 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands who found their dream properties with AI-powered search
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onPageChange('properties')}
              className="bg-white text-blue-600 px-2 py-1 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Browse Properties
            </button>
            <button
              onClick={() => onAuthAction('sell')}
              className="border-2 border-white text-white px-2 py-1 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all"
            >
              Share Requirement
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100 text-sm">
            <div className="flex items-center space-x-1">
              <Phone size={16} />
              <span>+91 99999 99999</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield size={16} />
              <span>100% Verified</span>
            </div>
          </div>
        </div>
      </section>
      {/* Put modal INSIDE the root container so JSX is valid */}
      <PublicSellPropertyForm
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onSubmit={handleSellerSave}
      />
    </div>
  );
};

export default HomePage;
