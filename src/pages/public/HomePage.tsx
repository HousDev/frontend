
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
  Users,
  Award,
  Shield,
  IndianRupee,
  Zap,
  CheckCircle,
  Bot,
  ShieldCheck, Handshake
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
import { FaWhatsapp } from 'react-icons/fa6';
import WhySellModal from './WhySellModal';
import { getTagStyle } from "@/lib/tagStyles";
import { isFeatured } from '../../utils/propertyHelpers';

// ✅ Import hero API & types
import homeHeroAPI, { HeroBlock, PhotoPreview } from '@/lib/homeHeroAPI';

// ✅ Import property tags API
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import ValuationModal from './ValuationModal';

interface Property {
  id: number;
  propertyId?: string;
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
  executive?: { phone?: string, name?: string, email?: string };
  // ✅ NEW: Add tags field
  tags?: string[];
}

// ✅ Tag display component
const PropertyTags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;

  // ✅ Only show first 2 tags
  const displayTags = tags.slice(0, 2);

  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {displayTags.map((tag, index) => {
        const style = getTagStyle(tag);
        const EmojiComponent =
          typeof style.emoji === "string"
            ? () => (
              <span className="text-xs mr-1 uppercase" aria-hidden="true">
                {style.emoji as string}
              </span>
            )
            : (style.emoji as any);

        return (
          <span
            key={index}
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase 
              ${style.bg} ${style.text} ring-1 ${style.ring}
              transition-all duration-200
            `}
          >
            {style.emoji &&
              (typeof style.emoji === "string" ? (
                <EmojiComponent />
              ) : (
                <EmojiComponent size={10} className="mr-1" />
              ))}
            {tag}
          </span>
        );
      })}
      {tags.length > 2 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{tags.length - 2}
        </span>
      )}
    </div>
  );
};

const isPublicProp = (p: any): boolean => {
  const flag =
    p?.is_public ??
    p?.isPublic ??
    p?.public ??
    (typeof p?.visibility === "string" && p.visibility.toLowerCase() === "public");

  return !!flag;
};

const HomePage = ({ onPageChange, onPropertyView, onAuthAction }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
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
  const [open, setOpen] = useState(false);

  const [isValuationOpen, setIsValuationOpen] = useState(false);

  // ✅ NEW: hero state
  const [heroBlocks, setHeroBlocks] = useState<HeroBlock[]>([]);
  const [heroSlides, setHeroSlides] = useState<
    { url: string; title?: string; description?: string }[]
  >([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ⭐️ Helper: navigate using onPageChange if provided else router
  const goTo = React.useCallback(
    (page: 'properties' | 'services') => {
      if (onPageChange) {
        onPageChange(page);
        return;
      }
      if (page === 'properties') navigate('/properties');
      if (page === 'services') navigate('/services');
    },
    [onPageChange, navigate]
  );

  // Parse original query params and preserve both key and value.
  const queryParams = new URLSearchParams(location.search);
  const filterParamKey =
    queryParams.has('filterToken') ? 'filterToken' :
      (queryParams.has('tf') ? 'tf' : undefined);
  const filterToken = filterParamKey ? (queryParams.get(filterParamKey) as string | null) ?? undefined : undefined;

  // ---------- Masters ----------
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

  // --- Likes state (persisted in localStorage) ---
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem("liked_properties");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setLikedIds(new Set(arr.map(Number)));
      }
    } catch { }
  }, []);
  const persistLikes = (setObj: Set<number>) => {
    try {
      localStorage.setItem("liked_properties", JSON.stringify(Array.from(setObj)));
    } catch { }
  };
  const isLiked = (id: number) => likedIds.has(id);
  const toggleLike = async (property: Property) => {
    const id = property.id;
    const next = new Set(likedIds);
    const nowLiked = !next.has(id);
    if (nowLiked) next.add(id); else next.delete(id);
    setLikedIds(next);
    persistLikes(next);
    try {
      await propertiesAPI?.sendPropertyEvent?.(
        id,
        nowLiked ? "like" : "unlike",
        "user_like_toggle",
        { source: "homepage", title: property.title ?? null },
        { slug: property.slug ?? undefined }
      );
    } catch { /* ignore */ }
  };

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  const fetchPropertyViews = async (propertyId: number): Promise<{ total_views: number }> => {
    try {
      const viewData = await viewsAPI.getByProperty(propertyId, false);
      return { total_views: viewData?.total_views || 0 };
    } catch (err) {
      console.error(`Error fetching views for property ${propertyId}:`, err);
      return { total_views: 0 };
    }
  };

  // ✅ Function to fetch tags for a property
  const fetchPropertyTags = async (propertyId: number): Promise<string[]> => {
    try {
      const tagsData = await propertyTagsAPI.getById(propertyId);
      return tagsData?.tags || [];
    } catch (err) {
      console.warn(`Could not load tags for property ${propertyId}:`, err);
      return [];
    }
  };

  // ---------- Featured Properties (public-only) ----------
  // ---------- Featured Properties (public-only) ----------
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);

        // ✅ server से public-only
        const response = await propertiesAPI.PublicgetProperties({
          status: 'Available',
          limit: 12,            // 12 तक लें, बाद में filter कर लेंगे
          isPublic: true,
          is_public: 1,
          visibility: 'public',
          publicOnly: 1,
        });

        const listRaw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        let rawList = listRaw.filter(isPublicProp);

        if (!rawList.length) {
          const fbRes = await propertiesAPI.PublicgetProperties({
            status: 'Available',
            limit: 12,
            isPublic: true,
            is_public: 1,
            visibility: 'public',
            publicOnly: 1,
          });
          const fb = Array.isArray(fbRes?.data) ? fbRes.data : (Array.isArray(fbRes) ? fbRes : []);
          rawList = fb.filter(isPublicProp);
        }

        // optional: latest first
        rawList.sort((a: any, b: any) => {
          const ad = a?.publication_date ? new Date(a.publication_date).getTime() : 0;
          const bd = b?.publication_date ? new Date(b.publication_date).getTime() : 0;
          return bd - ad;
        });

        // ⬇️ एक बार में map + views + tags
        const mapped: Property[] = await Promise.all(
          rawList.slice(0, 12).map(async (p: any) => {
            const images: string[] =
              Array.isArray(p.photos)
                ? p.photos.map((ph: string) => (ph || '').replace(/\\/g, '/'))
                : (Array.isArray(p.photoUrls) ? p.photoUrls : []);

            const city = p.city_name || p.city || p.town || p.cityName || '';
            const locationRaw = p.location_name || p.locality || p.area || p.neighbourhood || p.location || p.address || '';
            const state = p.state || p.region || '';
            const location = [locationRaw, city, state].filter(Boolean).slice(0, 2).join(', ');

            // ✅ tags + views दोनों यहीं load करें
            const [tags, viewData] = await Promise.all([
              fetchPropertyTags(p.id),
              fetchPropertyViews(p.id),
            ]);

            const unitType = (p.unit_type || p.unit_type_name || p.unit || p.unitType || '').toString().trim();
            const subtype = (p.property_subtype_name || p.property_subtype || p.unit_category_name || p.subtype || '').toString().trim();

            const rawSlug = p?.slug ?? p?.url_slug ?? p?.generated_slug;
            const slug = typeof rawSlug === 'string' && rawSlug.trim().length > 0 ? rawSlug.trim() : undefined;

            const carpet = Number(p.carpet_area) || 0;
            const builtup = Number(p.builtup_area) || 0;
            const superBuiltup = Number(p.super_builtup_area) || 0;
            const totalArea = carpet || builtup || superBuiltup || Number(p.area) || undefined;

            const priceVal = p.budget || p.price || p.amount;
            const price = priceVal ? Number(priceVal) : undefined;

            return {
              id: p.id,
              propertyId: (p.property_id && String(p.property_id).trim()) || `REP${String(p.id ?? '').padStart(4, '0')}`,
              title: (p.title || `${unitType ? unitType + ' ' : ''}${p.property_type_name || p.property_type || ''}`).trim(),
              price,
              bedrooms: Number(p.bedrooms) || undefined,
              bathrooms: Number(p.bathrooms) || undefined,
              square_feet: totalArea,
              city,
              property_type: p.property_type_name || p.property_type || '',
              status: p.status || '',
              images,
              location,
              area: totalArea,
              type: p.property_type_name || p.property_type || '',
              unitType,
              subtype,
              amenities: Array.isArray(p.amenities)
                ? p.amenities.map(String).map(s => s.trim()).filter(Boolean)
                : (typeof p.amenities === 'string'
                  ? p.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
                  : (Array.isArray(p.features)
                    ? p.features.map(String).map(s => s.trim()).filter(Boolean)
                    : (typeof p.features === 'string'
                      ? p.features.split(',').map((s: string) => s.trim()).filter(Boolean)
                      : []))),
              badge: p.featured ? 'Premium' : (p.badge || 'Standard'),
              rating: (typeof p.rating === 'number' ? p.rating : (4.5 + Math.random() * 0.4)),
              views: viewData.total_views || 0,
              total_views: viewData.total_views || 0, // 👈 यही key आप card में पढ़ रहे हैं
              aiScore: Number(p.aiScore) || Math.floor(Math.random() * 20) + 80,
              sellerName: p.seller_name || p.owner_name || p.seller?.name || '',
              slug,
              possessionMonth: p.possession_month ?? p.possessionMonth ?? null,
              possessionYear: p.possession_year ?? p.possessionYear ?? null,
              property_status: p.property_status ?? p.status ?? '',
              created_at: p.created_at ?? null,
              public_views: p.public_views ?? null,
              executive: {
                phone: p.executive_phone || p.executive?.phone || '',
                name: p.executive_name || p.executive?.name || '',
                email: p.executive_email || p.executive?.email || ''
              },
              tags,
              featured: p.featured || p.is_featured || false,
            } as Property;
          })
        );

        // ✅ सिर्फ featured pick करें, नहीं मिले तो empty रहने दें (या चाहें तो top 6 दिखा दें)
        const featuredOnly = mapped.filter(isFeatured);
        setFeaturedProperties(featuredOnly.length ? featuredOnly : []);

      } catch (err) {
        console.error('Error fetching featured properties (public-only):', err);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);


  // ---------- ✅ HERO: fetch & build slides ----------
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const blocks = await homeHeroAPI.list();
        setHeroBlocks(blocks || []);
        const slides: { url: string; title?: string; description?: string }[] = [];
        for (const b of blocks || []) {
          const photos = Array.isArray(b.photos) ? b.photos as PhotoPreview[] : [];
          photos.forEach((p) => {
            const url = (p?.url || '').replace(/\\/g, '/');
            if (url) slides.push({ url, title: b.title, description: b.description });
          });
        }
        setHeroSlides(slides);
        setHeroIndex(0);
      } catch (e) {
        console.warn('[HomePage] homeHeroAPI.list() failed, will fallback to featured images', e);
        setHeroBlocks([]);
        setHeroSlides([]);
      }
    };
    fetchHero();
  }, []);

  // ✅ Autoplay for hero (5s)
  useEffect(() => {
    if (!heroSlides.length) return;
    if (heroTimerRef.current) window.clearInterval(heroTimerRef.current);
    heroTimerRef.current = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length);
    }, 5000) as unknown as number;
    return () => {
      if (heroTimerRef.current) window.clearInterval(heroTimerRef.current);
    };
  }, [heroSlides.length]);

  const heroPrev = () => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const heroNext = () => setHeroIndex((i) => (i + 1) % heroSlides.length);

  // ---------- search helpers ----------
  const handleViewProperty = (property: Property) => setCurrentPropertyView(property);
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
  const masterLocation: MasterOption[] = findMasterOptions(['location', 'locality', 'localities', 'area', 'neighbourhood', 'neighborhood', 'locality_name']);

  const formatPrice = (price: any) => {
    const num = Number(price);
    if (!Number.isFinite(num) || num <= 0) return ' - ';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };
  const formatCurrency = (price: any) => formatPrice(price);
  const [transactionType, setTransactionType] = useState<'buy' | 'rent'>('buy');

  const addLocality = (value?: string) => {
    const v = (value ?? localityInput ?? '').toString().trim();
    if (!v) return;
    const normalized = v.replace(/\s{2,}/g, ' ').replace(/(^,|,$)/g, '').trim();
    if (!normalized) return;
    if (localities.includes(normalized)) {
      setLocalityInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (localities.length >= 5) {
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

  const removeLocality = (idx: number) => setLocalities(prev => prev.filter((_, i) => i !== idx));

  const inputRef = useRef<HTMLInputElement | null>(null);
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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (transactionType === 'rent') {
      console.warn('Rent search not implemented yet. Only Buy is active.');
      return;
    }
    const city = selectedCity.trim();
    const locationStrings = localities.map(loc => loc.trim());
    if (!city && locationStrings.length === 0) {
      navigate(`/properties?status=Available`);
      return;
    }
    const params: { city: string; locations?: string | string[] } = { city };
    if (locationStrings.length > 0) params.locations = locationStrings;

    try {
      setLoading(true);
      const response = await propertiesAPI.searchByCityLocation(params);
      const rawList = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      await Promise.all(rawList.map(async (_p: any) => _p)); // mapping skipped; we only build the querystring below

      const searchParams = new URLSearchParams();
      if (city) searchParams.set('city', city);
      if (localities.length > 0) searchParams.set('locations', localities.join(','));
      if (selectedPropertyType) searchParams.set('propertyType', selectedPropertyType);
      if (selectedBudget) searchParams.set('budget', selectedBudget);
      searchParams.set('status', 'Available');
      if (filterToken && filterParamKey) searchParams.set(filterParamKey, filterToken);

      const qs = searchParams.toString();
      navigate(`/properties${qs ? `?${qs}` : ''}`, { replace: true });
    } catch (error) {
      console.error('Error fetching properties from city/location API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellPropertyClick = () => {
    if (onAuthAction) onAuthAction('sell');
    else setIsSellerModalOpen(true);
  };

  const handleSellerSave = async (formData: any) => {
    try {
      setIsSellerModalOpen(false);
    } catch (err) {
      console.error('Error saving seller/property:', err);
    }
  };

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
      if (finalToken) dest += `?${encodeURIComponent(finalParamKey)}=${encodeURIComponent(finalToken)}`;
      navigate(dest);
    } catch (err) {
      console.error('handleNavigateToProperty unexpected error:', err);
      navigate(`/properties/${encodeURIComponent(String(slug))}`);
    }
  };

  if (currentPropertyView) {
    return <PublicPropertyDetailPage property={currentPropertyView} onBack={() => setCurrentPropertyView(null)} />;
  }

  // ---------- HERO background source preference ----------
  // 1) Use hero slides if present, else 2) fallback to featured property images
  const activeHeroUrl =
    heroSlides.length > 0
      ? heroSlides[heroIndex]?.url
      : (featuredProperties[featuredIndex]?.images?.[0] || '');

  const activeHeroTitle =
    heroSlides.length > 0 ? (heroSlides[heroIndex]?.title || '') : '';

  const activeHeroDesc =
    heroSlides.length > 0 ? (heroSlides[heroIndex]?.description || '') : '';

  return (
    <div className="">
      {/* HERO / SEARCH */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0 bg-black/30"></div>

        {/* ✅ dynamic background (hero first, then fallback) */}
        {activeHeroUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url(${activeHeroUrl})`,
              filter: 'brightness(0.35)',
            }}
          />
        )}

        {/* ✅ manual controls & dots (shown only if we have hero slides) */}
        {heroSlides.length > 0 && (
          <>
            <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${i === heroIndex ? 'bg-white w-6' : 'bg-white/60'}`}
                  type="button"
                />
              ))}
            </div>
          </>
        )}

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center px-4">
              {/* ✅ Show hero title/desc if provided from block */}
              {(activeHeroTitle || activeHeroDesc) && (
                <div className="mb-4">
                  {activeHeroTitle && (
                    <h1 className="text-3xl font-bold mb-2 ">{activeHeroTitle}</h1>
                  )}
                  {activeHeroDesc && (
                    <p className="text-blue-100 mb-6">{activeHeroDesc}</p>
                  )}
                </div>
              )}
              {/* Row: Buy/Rent + PropertyType */}
              <div className="grid grid-cols-1  gap-1 md:gap-2 mb-4 items-center justify-center text-center">
                {/* Buy / Rent */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setTransactionType("buy")}
                    className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition
        ${'buy' === "buy"
                        ? "bg-[#E6761D] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    aria-pressed={true}
                  >
                    Buy
                  </button>

                  <button
                    type="button"
                    onClick={() => { }}
                    className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition bg-gray-100 text-gray-700 opacity-60 cursor-not-allowed`}
                    title="Rent search not available yet"
                    disabled
                    aria-disabled="true"
                    aria-pressed={false}
                  >
                    Rent
                  </button>
                </div>

                {/* Property-type chips */}
                <div className="w-full grid justify-center md:w-auto">
                  {masterLoading ? (
                    <div className="text-sm text-white/80 px-3 py-1">Loading types...</div>
                  ) : (
                    <div
                      className="
          mx-auto max-w-full
          overflow-x-auto
          [-webkit-overflow-scrolling:touch]
          [scrollbar-width:none]
          [-ms-overflow-style:none]
          px-1
        "
                      style={{ scrollbarWidth: "none" }}
                    >
                      <div className="flex gap-2 py-1 snap-x snap-mandatory">
                        <button
                          type="button"
                          onClick={() => setSelectedPropertyType("")}
                          aria-pressed={selectedPropertyType === ""}
                          className={`
              shrink-0 snap-start whitespace-nowrap
              px-3 sm:px-4 py-1.5 rounded-full text-sm
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition
              ${selectedPropertyType === ""
                              ? "bg-white text-black"
                              : "bg-white/30 text-white hover:bg-white/40"
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
                            title={opt.label}
                            className={`
                shrink-0 snap-start whitespace-nowrap
                px-3 sm:px-4 py-1.5 rounded-full text-sm
                focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition
                ${selectedPropertyType === opt.value
                                ? "bg-white text-black"
                                : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
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
                  {/* City dropdown */}
                  <div className="relative w-full md:w-48">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      disabled={masterLoading}
                      className="appearance-none px-3 py-2 border z-10 rounded-lg w-full bg-transparent text-white border-white/30 focus:outline-none focus:ring-1 focus:ring-white"
                    >
                      <option value="" className="bg-[#0b3856] text-white">
                        {masterLoading ? "Loading cities..." : "Select city"}
                      </option>
                      {masterCity.map((o) => (
                        <option key={o.value} value={o.value} className="bg-[#0b3856] text-white">
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <ChevronRight className="text-white rotate-90" size={14} />
                    </div>
                  </div>

                  {/* Locality input */}
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={18} />
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
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      onBlur={() => { setTimeout(() => setShowSuggestions(false), 120); }}
                      className="pl-10 pr-16 h-10 w-full text-sm bg-white/10 text-white placeholder-white/70 outline-none focus:ring-1 focus:ring-gray-400 rounded-lg"
                      placeholder="Search properties by locality or area"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute left-0 right-0 mt-1 max-h-32 lg:max-w-60 overflow-auto bg-[#0b3856] border rounded-lg shadow-lg z-[200] custom-scroll">
                        {suggestions.map((s, idx) => (
                          <li
                            key={`${s.value}-${idx}`}
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

                  {/* Search button */}
                  <button
                    type="submit"
                    className="bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-4 py-2 rounded-lg w-full md:w-28 text-base transition-colors duration-300"
                  >
                    Search
                  </button>
                </div>

                {/* Locality chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {localities.map((loc, idx) => (
                    <div key={idx} className="flex items-center bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                      <span className="mr-2">{loc}</span>
                      <button type="button" onClick={() => removeLocality(idx)} className="text-gray-200 hover:text-white">
                        &times;
                      </button>
                    </div>
                  ))}
                  {localities.length === 0 && <div className="text-xs text-gray-100">Add up to 1 localities.</div>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0b3856] to-[#0c3854] bg-clip-text text-transparent">
              AI Market Intelligence
            </h2>
            <p className="text-gray-600 text-sm">
              Real-time market analysis powered by advanced AI algorithms
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Price Trends */}
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3">
                <div className="p-2 rounded-xl bg-green-50 ring-1 ring-green-100">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Price Trends</h3>
                  <div className="text-xs text-gray-500">
                    Andheri West <span className="font-medium text-green-600">+12.5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Best ROI */}
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3">
                <div className="p-2 rounded-xl bg-blue-50 ring-1 ring-blue-100">
                  <Target className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Best ROI</h3>
                  <div className="text-xs text-gray-500">
                    Bandra West <span className="font-medium text-blue-600">18.2%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Heat */}
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3">
                <div className="p-2 rounded-xl bg-purple-50 ring-1 ring-purple-100">
                  <BarChart3 className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Market Heat</h3>
                  <div className="text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[11px]">
                      Powai · Hot
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Score */}
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3">
                <div className="p-2 rounded-xl bg-orange-50 ring-1 ring-orange-100">
                  <Sparkles className="text-orange-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">AI Score</h3>
                  <div className="text-xs text-gray-500">
                    Avg <span className="font-medium text-orange-600">92/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-6">
            <button
              onClick={() => internalAuthAction('subscribe')}
              className="inline-flex items-center justify-center gap-2 bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E6761D]"
            >
              Get Full AI Report
            </button>
            <SubscriptionModal isOpen={isSubOpen} onClose={() => setIsSubOpen(false)} />
          </div>
        </div>
      </section>

      {/* Featured properties cards */}
      <section className="py-3 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Featured Properties</h2>
            <p className="text-gray-600">Handpicked premium properties with AI recommendations</p>
          </div>

          {loading ? (
            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {featuredProperties.map((property) => {
                const amenities = Array.isArray(property.amenities) ? property.amenities : [];
                const shownAmenities = amenities.slice(0, 2);
                const moreCount = Math.max(amenities.length - shownAmenities.length, 0);

                return (
                  <div key={property.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group h-full flex flex-col">
                    {/* Image */}
                    <div className="relative">
                      {property.images && property.images.length ? (
                        <div onClick={() => handleNavigateToProperty(property)} className="cursor-pointer relative">
                          <img
                            src={property.images[0]}
                            alt={property.title || 'Property image'}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-white text-2xl font-bold opacity-40 select-none">ResaleExpert.in</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-200 flex items-center justify-center"><Building className="text-gray-400" /></div>
                      )}

                      {/* top-left tags + AI */}
                      <div className="absolute top-3 left-3 flex items-start flex-wrap gap-2 z-20">
                        <div className="max-w-[72vw] sm:max-w-none overflow-hidden">
                          <PropertyTags tags={property.tags || []} />
                        </div>
                        {(property.aiScore ?? 0) >= 90 && (
                          <span className="flex-none whitespace-nowrap bg-purple-600 text-white px-2 py-1 rounded-full text-[8px] sm:text-xs font-bold leading-none flex items-center shadow-sm">
                            <Bot size={12} className="mr-1" />
                            AI {Math.round(property.aiScore ?? 0)}
                          </span>
                        )}
                      </div>

                      {/* rating/views */}
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

                    {/* Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="pr-4">
                          <div className="text-lg font-bold text-[#0b3856] mb-1 group-hover:text-[#E6761D] transition-colors">
                            {[property.type, property.unitType, property.subtype].filter(Boolean).join('  ') || ' - '}
                          </div>
                        </div>
                        <div className="text-lg text-gray-500">
                          {property.propertyId || `REP${String(property.id ?? '').padStart(4, '0')}`}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xl font-bold text-green-600">{formatPrice(property.price)}</div>
                          <div className="text-sm text-gray-500">
                            {property.unitType || property.type} • {property.square_feet ?? property.area ?? ' - '} sq ft
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Price per sq ft</div>
                          <div className="font-semibold text-gray-900">
                            ₹{Math.round((property.price || 0) / (property.square_feet || property.area || 1)).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin size={16} className="mr-2" />
                        <span>{property.location || property.city || ' - '}</span>
                      </div>

                      {/* Amenities: show 2 + “+N more” */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {shownAmenities.map((a, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{a}</span>
                        ))}
                        {moreCount > 0 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">+{moreCount} more</span>
                        )}
                      </div>

                      {/* Actions pinned to bottom */}
                      <div className="mt-auto flex items-center gap-3">
                        {property.slug ? (
                          <div className="flex-1">
                            <button
                              onClick={() => handleNavigateToProperty(property)}
                              className="w-full bg-[#E6761D] text-white py-2 rounded-lg hover:bg-[#CC6A1A] transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
                            title="Details not available"
                          >
                            View Details
                          </button>
                        )}

                        {/* Call */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); e.preventDefault();
                            const phone = property.executive?.phone || "919999999999";
                            window.location.href = `tel:${phone}`;
                          }}
                          className="p-3 rounded-lg transition-colors duration-300 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                          title="Call"
                          type="button"
                        >
                          <Phone size={18} />
                        </button>

                        {/* WhatsApp */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();

                            // Ensure phone number is valid
                            const phone =
                              property?.executive?.phone?.replace(/\D/g, "") || "9637009639";

                            // Prepare property title
                            const title =
                              property?.title ||
                              [property?.unitType, property?.type].filter(Boolean).join(" ") ||
                              "a property";

                            // Prepare location
                            const loc =
                              property?.location ||
                              property?.city ||
                              "your listed property location";

                            // Format price safely
                            const priceValue = Number(property?.price || 0);
                            const priceText = !isNaN(priceValue)
                              ? `₹${priceValue.toLocaleString("en-IN")}`
                              : "Price on request";

                            // Build link to property page
                            const link = property?.slug
                              ? `${window.location.origin}/properties/${encodeURIComponent(
                                String(property.slug)
                              )}`
                              : `${window.location.origin}/properties`;

                            // Message for WhatsApp
                            const message = `Hi, I'm interested in ${title} at ${loc}. Price: ${priceText}. Can you share more details?\n${link}`;

                            // Open WhatsApp chat
                            window.open(
                              `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                          className="p-3 rounded-lg transition-colors duration-300 bg-[#25D366] text-white hover:bg-[#1ebe57]"
                          title="Chat on WhatsApp"
                          type="button"
                        >
                          <FaWhatsapp size={18} />
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          )}
          <div className="text-center mt-4">
            <Link to="/properties">
              <button
                onClick={() => onPageChange && onPageChange('properties')}
                className="bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-4 py-2 rounded-xl font-medium transition-colors duration-300"
              >
                View All Properties
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sell CTA / Footer minimal */}
      <section
        className="py-8 text-white"
        style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Sell Your Resale Property Faster & Smarter in Pune
              </h2>
              <p className="text-gray-200 mb-4">
                Get instant AI-based property valuation, connect with verified buyers, and close deals faster — all with Resale Expert.
              </p>
              <div className="w-full">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  {/* Primary CTA */}
                  <button
                    onClick={handleSellPropertyClick}
                    className="w-full sm:w-auto shrink-0 bg-[#E6761D] hover:bg-[#CC6A1A] text-white
                 px-5 py-3 rounded-lg font-medium shadow-md transition-colors duration-300
                 text-sm sm:text-base"
                  >
                    List My Property
                  </button>

                  {/* Secondary CTA */}
                  <button
                    onClick={() => setIsValuationOpen(true)}
                    className="w-full sm:w-auto border-2 border-white/90 text-white px-5 py-3 rounded-lg font-medium transition-colors duration-300 hover:bg-[#E6761D] hover:border-[#E6761D] hover:text-white text-sm sm:text-base"
                  >
                    Free Valuation
                  </button>

                  <ValuationModal
                    open={isValuationOpen}
                    onClose={() => setIsValuationOpen(false)}
                    onListProperty={() => setIsSellerModalOpen(true)}
                  />

                  <button
                    onClick={() => setOpen(true)}
                    className="w-full sm:w-auto border-2 border-white/90 text-white
                 px-5 py-3 rounded-lg font-medium transition-colors duration-300
                 hover:bg-[#E6761D] hover:border-[#E6761D] hover:text-white
                 text-sm sm:text-base"
                  >
                    Why Sell ResaleExpert
                  </button>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative inline-block">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Sell"
                className="rounded-2xl shadow-xl w-full object-cover"
              />

              {/* Badge */}
              <div className="absolute -bottom-4 left-4 bg-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 border border-gray-100">
                <IndianRupee className="text-[#0b3856] w-5 h-5" />
                <span className="text-sm font-semibold text-gray-700">
                  ₹500Cr+ Properties Sold
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Us cards */}
      <section className="py-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Why Choose&nbsp;{companyName}?
            </h2>
            <h3 className="text-base sm:text-lg text-gray-700 font-medium mb-3">
              Trusted Resale Property Consultant in Pune & PCMC
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Buying or selling a resale property can be overwhelming. That's why thousands of homeowners and buyers choose Resale Expert for hassle-free transactions.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch">
            {/* Card 1 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E6761D] flex items-center justify-center mb-4">
                <ShieldCheck className="text-white" size={26} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Verified Listings Only
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every property undergoes legal and documentation checks.
              </p>
            </div>

            {/* Card 2 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E6761D] flex items-center justify-center mb-4">
                <Brain className="text-white" size={26} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Fair Market Valuation
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Transparent pricing — no hidden charges, no inflated rates.
              </p>
            </div>

            {/* Card 3 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E6761D] flex items-center justify-center mb-4">
                <Users className="text-white" size={26} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Local Market Expertise
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Deep understanding of Pune and PCMC real estate trends.
              </p>
            </div>

            {/* Card 4 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E6761D] flex items-center justify-center mb-4">
                <Handshake className="text-white" size={26} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                End-to-End Assistance
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From property search to registration and possession.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Stats cards */}
      <section className="py-5 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch text-center">
            {/* Stat 1 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl px-6 py-8 flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Home className="text-blue-600" size={20} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900">10K+</h4>
              <p className="text-gray-600 text-sm mt-1">Properties</p>
            </div>

            {/* Stat 2 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl px-6 py-8 flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Users className="text-green-600" size={20} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900">25K+</h4>
              <p className="text-gray-600 text-sm mt-1">Customers</p>
            </div>

            {/* Stat 3 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl px-6 py-8 flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Award className="text-orange-600" size={20} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900">15+</h4>
              <p className="text-gray-600 text-sm mt-1">Years</p>
            </div>

            {/* Stat 4 */}
            <div className="h-full bg-white border border-gray-100 rounded-2xl px-6 py-8 flex flex-col items-center justify-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Star className="text-purple-600" size={20} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900">4.9★</h4>
              <p className="text-gray-600 text-sm mt-1">Rating</p>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials - Compact */}
      <section
        className="py-5 text-white border-b border-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Customer Success Stories</h2>
            <p className="text-sm text-gray-800">
              See how our AI-powered solutions are helping people buy & sell properties smarter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rajesh Kumar',
                text: 'Found my dream home in 2 weeks with AI matching!',
                rating: 5,
                property: '3BHK Wakad',
              },
              {
                name: 'Priya Sharma',
                text: 'Sold my property 20% above market rate with their AI pricing.',
                rating: 5,
                property: '2BHK Baner',
              },
              {
                name: 'Amit Patel',
                text: 'Seamless process from search to registration.',
                rating: 5,
                property: '2BHK Hinjewadi',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-[#E6761D]"
              >
                {/* Stars */}
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className="text-[#E6761D] fill-current" />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-700 mb-4 text-sm italic">"{testimonial.text}"</p>

                {/* User info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#E6761D] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.split(' ').map((n) => n[0]).join('')}
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
      <section
        className="py-8 text-white"
        style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands who found their dream properties with AI-powered search
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Primary CTA */}
            <button
              onClick={() => goTo('properties')}
              className="w-full sm:w-auto bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-5 py-3 rounded-xl font-semibold shadow-md transition-colors duration-300"
            >
              Browse Properties
            </button>

            {/* Secondary CTA */}
            <button
              onClick={() => goTo('services')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold border-2 border-white text-white transition-colors duration-300 hover:bg-[#E6761D] hover:border-[#E6761D] hover:text-white"
            >
              View All Services
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      <PublicSellPropertyForm
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onSubmit={handleSellerSave}
      />
      {/* Why Sell modal */}
      <WhySellModal
        open={open}
        onClose={() => setOpen(false)}
        onFreeValuation={() => {
          setOpen(false);            // close WhySell modal
          setIsValuationOpen(true);  // ✅ open ValuationModal
        }}
      />

    </div>
  );
};

export default HomePage;
