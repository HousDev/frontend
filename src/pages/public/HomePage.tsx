// HomePage.tsx
import React, { useState, useEffect } from 'react';
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
  Shield
} from 'lucide-react';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import { propertiesAPI } from '@/lib/propertiesAPI';

import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import viewsAPI from '@/lib/viewAPI';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [currentPropertyView, setCurrentPropertyView] = useState<any | null>(null);

  // Track viewed properties in current session to prevent duplicate views
  const [viewedProperties, setViewedProperties] = useState<Set<number>>(new Set());

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

  const navigate = useNavigate();
  const location = useLocation();

  // Parse original query params and preserve both key and value.
  const queryParams = new URLSearchParams(location.search);
  // Prefer explicit 'filterToken' param if present; otherwise accept 'tf' (external sites).
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

  // Function to fetch view counts for properties - only total views
  const fetchPropertyViews = async (propertyId: number): Promise<{ total_views: number }> => {
    try {
      const viewData = await viewsAPI.getByProperty(propertyId, false); // Get total views only
      
      return {
        total_views: viewData?.total_views || 0
      };
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
        
        // Map properties and fetch view counts
        const mapped = await Promise.all(rawList.map(async (p: any) => {
          // Normalize images
          const images = Array.isArray(p.photos)
            ? p.photos.map((ph: string) => ph.replace(/\\/g, '/'))
            : (Array.isArray(p.photoUrls) ? p.photoUrls : []);

          // Normalize city & location
          const city = p.city_name || p.city || p.town || p.cityName || '';
          const locationRaw = p.location_name || p.locality || p.area || p.neighbourhood || p.location || p.address || '';
          const state = p.state || p.region || '';
          const location = [locationRaw, city, state].filter(Boolean).slice(0, 2).join(', ');

          // Normalize amenities
          let amenities: string[] = [];
          if (Array.isArray(p.amenities)) amenities = p.amenities.map(String).map(s => s.trim()).filter(Boolean);
          else if (typeof p.amenities === 'string') amenities = p.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
          else if (p.features) {
            if (Array.isArray(p.features)) amenities = p.features.map(String).map(s => s.trim()).filter(Boolean);
            else if (typeof p.features === 'string') amenities = p.features.split(',').map((s: string) => s.trim()).filter(Boolean);
          }

          const unitType = (p.unit_type || p.unit_type_name || p.unit || p.unitType || '').toString().trim();
          const subtype = (p.property_subtype_name || p.property_subtype || p.unit_category_name || p.subtype || '').toString().trim();

          // === STRICT: USE ONLY BACKEND-PROVIDED SLUG ===
          const rawSlug = p?.slug ?? p?.url_slug ?? p?.generated_slug;
          const slug = typeof rawSlug === 'string' && rawSlug.trim().length > 0 ? rawSlug.trim() : undefined;

          // Log if slug missing (helps you identify missing slugs on backend)
          if (!slug) {
            console.warn('[HomePage] Missing backend slug for property id:', p?.id);
          }

          // Fetch actual view counts from API - only total views
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
            // Use API view counts instead of random values - only total views
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

  const locationsOptions: MasterOption[] = findMasterOptions(['location', 'locations', 'place', 'place name', 'city', 'area']);
  const budgetOptions: MasterOption[] = findMasterOptions(['price range', 'price_range', 'budget', 'priceRange', 'price']);

  const formatPrice = (price: any) => {
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) return ' - ';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Enhanced navigation function with single view recording
// Enhanced navigation function - ONLY analytics, NO view recording
const handleNavigateToProperty = async (property: Property) => {
  const id = property.id;
  const slug = property.slug;
  if (!slug) {
    console.warn('Attempted to navigate to property without slug:', id);
    return;
  }

  // Check if this property has already been clicked in this session
  if (viewedProperties.has(id)) {
    console.log(`Property ${id} already clicked in this session`);
    // Still navigate but don't send analytics
    let dest = `/properties/${encodeURIComponent(String(slug))}`;
    if (filterToken) {
      const finalParamKey = filterParamKey || 'tf';
      dest += `?${encodeURIComponent(finalParamKey)}=${encodeURIComponent(finalToken)}`;
    }
    navigate(dest);
    return;
  }

  // If there's already a token in URL, prefer it (preserve param key & value)
  const existingParamKey = filterParamKey;
  const existingToken = filterToken;

  // Build a "filters" object from current UI state to save if we need to create one
  const inferredFilters = {
    search: searchQuery || null,
    location: selectedLocation || null,
    budget: selectedBudget || null,
    propertyType: selectedPropertyType || null,
    source: 'homepage',
    clickedPropertyId: id,
  };

  try {
    let finalToken = existingToken;
    let finalParamKey = existingParamKey || 'tf';

    // If no existing token, create a filter-context (server will return id)
    if (!finalToken) {
      try {
        const createRes = await propertiesAPI.createFilterContext({ filters: inferredFilters });
        if (createRes && createRes.id) {
          finalToken = createRes.id;
        } else {
          console.warn('createFilterContext did not return id, response:', createRes);
        }
      } catch (err) {
        console.warn('createFilterContext failed (proceeding without token):', err);
      }
    }

    // *** REMOVED VIEW RECORDING - Let page load handle it ***
    // Only send click analytics event
    try {
      await propertiesAPI.sendPropertyEvent(
        id,
        'click',
        'listing_card_click',
        { source: 'homepage', title: property.title || null },
        { slug, filterToken: finalToken || undefined, filterParamKey: finalParamKey }
      );
      
      // Mark this property as clicked in current session (prevent duplicate clicks)
      setViewedProperties(prev => new Set(prev).add(id));
      
      console.log(`Click event sent for property ${id}`);
    } catch (err) {
      console.warn('sendPropertyEvent failed (we will still navigate):', err);
    }

    // Build destination preserving/adding token param
    let dest = `/properties/${encodeURIComponent(String(slug))}`;
    if (finalToken) {
      dest += `?${encodeURIComponent(finalParamKey)}=${encodeURIComponent(finalToken)}`;
    }
    navigate(dest);
  } catch (err) {
    console.error('handleNavigateToProperty unexpected error:', err);
    // fallback: navigate without token if something went wrong
    navigate(`/properties/${encodeURIComponent(String(slug))}`);
  }
};

  if (currentPropertyView) {
    return <PublicPropertyDetailPage property={currentPropertyView} onBack={() => setCurrentPropertyView(null)} />;
  }

  return (
    <div className="min-h-screen">
      {/* hero/search */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        {featuredProperties.length > 0 && (
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(${featuredProperties[featuredIndex]?.images?.[0] || ''})`, filter: 'brightness(0.3)' }} />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Find Your <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Dream Property</span></h1>
            <p className="text-blue-100 mb-6">AI-powered property search in Mumbai's premium locations</p>

            <form onSubmit={(e) => { e.preventDefault(); if (onPageChange) onPageChange('properties', { search: searchQuery }); }} className="max-w-3xl mx-auto bg-white text-black p-4 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-3 py-2 border rounded-lg w-full" placeholder="Search properties..." />
                </div>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} disabled={masterLoading} className="px-3 py-2 border rounded-lg">
                  <option value="">{masterLoading ? 'Loading locations...' : 'Location'}</option>
                  {locationsOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)} disabled={masterLoading} className="px-3 py-2 border rounded-lg">
                  <option value="">{masterLoading ? 'Loading budgets...' : 'Budget'}</option>
                  {budgetOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg">Search</button>
              </div>
            </form>
          </div>
        </div>

        {featuredProperties.length > 0 && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {featuredProperties.map((_, i) => <button key={i} onClick={() => setFeaturedIndex(i)} className={`w-2 h-2 rounded-full ${i === featuredIndex ? 'bg-white' : 'bg-white/50'}`} />)}
            </div>
            <button onClick={() => setFeaturedIndex((i) => (i - 1 + featuredProperties.length) % featuredProperties.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full"><ChevronLeft className="text-white" /></button>
            <button onClick={() => setFeaturedIndex((i) => (i + 1) % featuredProperties.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full"><ChevronRight className="text-white" /></button>
          </>
        )}
      </section>

      {/* AI Insights */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4"><Brain className="text-purple-600" size={28} /><h2 className="text-2xl font-bold">AI Market Intelligence</h2></div>
            <p className="text-gray-600">Real-time market analysis powered by advanced AI algorithms</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow"><TrendingUp className="text-green-600" /><h3 className="font-semibold mt-2">Price Trends</h3><div className="text-sm text-gray-500">Andheri West +12.5%</div></div>
            <div className="bg-white p-6 rounded-xl shadow"><Target className="text-blue-600" /><h3 className="font-semibold mt-2">Best ROI</h3><div className="text-sm text-gray-500">Bandra West 18.2%</div></div>
            <div className="bg-white p-6 rounded-xl shadow"><BarChart3 className="text-purple-600" /><h3 className="font-semibold mt-2">Market Heat</h3><div className="text-sm text-gray-500">Powai - Hot</div></div>
            <div className="bg-white p-6 rounded-xl shadow"><Sparkles className="text-orange-600" /><h3 className="font-semibold mt-2">AI Score</h3><div className="text-sm text-gray-500">Avg 92/100</div></div>
          </div>

          <div className="text-center mt-8">
            <button onClick={() => internalAuthAction('subscribe')} className="bg-purple-600 text-white px-6 py-2 rounded-lg">Get Full AI Report</button>
            <SubscriptionModal isOpen={isSubOpen} onClose={() => setIsSubOpen(false)} />
          </div>
        </div>
      </section>

      {/* Featured properties cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
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
                          {/* Display only total view count from API */}
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

                      {/* <div className="text-xs text-gray-400 whitespace-nowrap">PROP{String(property.id).padStart(3, '0')}</div> */}
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

                    {/* Show possession month + year if available */}
                    {/* <div className="text-sm text-gray-600 mb-3">
                      <strong>Possession:</strong>{' '}
                      {property.possessionMonth || property.possessionYear
                        ? `${property.possessionMonth ? property.possessionMonth : ''}${property.possessionMonth && property.possessionYear ? ' ' : ''}${property.possessionYear ? property.possessionYear : ''}`
                        : ' - '}
                    </div> */}

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
          <div className="text-center mt-8">
            <Link to="/properties"><button onClick={() => onPageChange && onPageChange('properties')} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl">View All Properties</button></Link>
          </div>
        </div>
      </section>

      {/* Sell CTA / Footer minimal */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Sell Your Property with AI Pricing</h2>
              <p className="text-green-100 mb-4">Get the best price with our AI-powered valuation and reach verified buyers instantly.</p>
              <div className="flex gap-4">
                <button onClick={() => onAuthAction && onAuthAction('sell')} className="bg-white text-green-600 px-4 py-2 rounded-lg">List My Property</button>
                <button className="border border-white px-4 py-2 rounded-lg">Free Valuation</button>
              </div>
            </div>
            <div className="relative">
              <img src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Sell" className="rounded-xl shadow-lg" />
              <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-xl shadow"> <DollarSign className="text-green-600" /> <div className="text-sm">₹500Cr+ Properties Sold</div></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;