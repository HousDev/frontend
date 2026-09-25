// HomePage.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  TrendingUp,
  Users,
  Award,
  Shield,
  IndianRupee,
  Zap,
  CheckCircle,
  Bot,
  ShieldCheck, Handshake, Lock, X, Navigation
} from 'lucide-react';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import AIReportModal from '@/components/ai/AIReportModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import { api } from '@/lib/api';
import { getImageUrl, DEFAULT_PROPERTY_IMAGE, DEFAULT_PROPERTY_IMAGES } from '@/lib/helpers';
import { AnimatedCountBadge } from '@/components/common/AnimatedCountBadge';

import { propertiesAPI } from '@/lib/propertiesAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { recordAndCheckGuestPropertyLimit } from '@/utils/guestViewTracker';
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
  photos?: string[];
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
  tags?: string[];
  featured?: boolean;
  listing_type?: string;
  transaction_type?: string;
  monthly_rent?: number;
  expected_rent?: number;
}
const isVideoUrl = (u: string) =>
  /\.(mp4|mov|webm|mkv)$/i.test(u) || /youtube\.com|youtu\.be/i.test(u);
// ✅ Default images by property type
const DEFAULT_IMAGES = {
  APARTMENT: '/property.png',
  HOUSE: '/property.png',
  VILLA: '/property.png',
  PLOT: '/property.png',
  COMMERCIAL: '/property.png',
  DEFAULT: '/property.png'
};

// ✅ Function to get default image based on property type
const getDefaultImageByType = (propertyType: string): string => {
  if (!propertyType) return DEFAULT_IMAGES.DEFAULT;
  const type = propertyType.toLowerCase();

  if (type.includes('apartment') || type.includes('flat')) return DEFAULT_IMAGES.APARTMENT;
  if (type.includes('house') || type.includes('bungalow')) return DEFAULT_IMAGES.HOUSE;
  if (type.includes('villa')) return DEFAULT_IMAGES.VILLA;
  if (type.includes('plot') || type.includes('land')) return DEFAULT_IMAGES.PLOT;
  if (type.includes('commercial') || type.includes('shop') || type.includes('office') || type.includes('retail'))
    return DEFAULT_IMAGES.COMMERCIAL;

  return DEFAULT_IMAGES.DEFAULT;
};

// ✅ Tag display component
const PropertyTags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;

  // ✅ Only show first 2 tags in a single line
  const displayTags = tags.slice(0, 2);

  return (
    <div className="flex items-center flex-nowrap gap-1">
      {displayTags.map((tag, index) => {
        const style = getTagStyle(tag);
        const EmojiComponent =
          typeof style.emoji === "string"
            ? () => (
              <span className="text-[9px] mr-0.5 uppercase" aria-hidden="true">
                {style.emoji as string}
              </span>
            )
            : (style.emoji as any);

        return (
          <span
            key={index}
            className={`
              inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase whitespace-nowrap leading-none
              ${style.bg} ${style.text} ring-1 ${style.ring}
              transition-all duration-200
            `}
          >
            {style.emoji &&
              (typeof style.emoji === "string" ? (
                <EmojiComponent />
              ) : (
                <EmojiComponent size={9} className="mr-0.5" />
              ))}
            {tag}
          </span>
        );
      })}
      {tags.length > 2 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-black/60 text-white whitespace-nowrap leading-none">
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

const parseDateToMs = (dateVal: any): number | null => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return dateVal.getTime();
  if (typeof dateVal === 'number') return dateVal;
  if (typeof dateVal === 'string') {
    const normalized = dateVal.trim().replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2');
    const parsed = new Date(normalized).getTime();
    if (!isNaN(parsed)) return parsed;
    const fallback = new Date(dateVal).getTime();
    if (!isNaN(fallback)) return fallback;
  }
  return null;
};

// Check if property was created/published within the last N days (default 3 days)
const isNewlyAddedProp = (p: any, daysThreshold = 3): boolean => {
  const dateVal = p?.created_at || p?.createdAt || p?.publication_date || p?.date_added;
  const propTime = parseDateToMs(dateVal);
  if (!propTime) return false;
  const now = Date.now();
  const diffMs = now - propTime;
  const maxDiffMs = daysThreshold * 24 * 60 * 60 * 1000;
  // Allow future timestamps up to 24 hours (for client/server timezone offset) and within 3 days
  return diffMs >= -86400000 && diffMs <= maxDiffMs;
};

// Calculate newly added properties count strictly within last N days (default 3 days)
const getNewlyAddedCount = (props: any[], daysThreshold = 3): number => {
  if (!Array.isArray(props) || props.length === 0) return 0;
  return props.filter((p) => isNewlyAddedProp(p, daysThreshold)).length;
};

const isFeaturedProp = (p: any, tags: string[] = []): boolean => {
  const tagList = Array.isArray(tags) && tags.length > 0 ? tags : (Array.isArray(p?.tags) ? p.tags : []);
  const hasTag = tagList.some((t: string) => {
    const s = String(t).toLowerCase().trim();
    return s === 'featured' || s === 'feature';
  });

  return hasTag;
};

const HomePage = ({ onPageChange, onPropertyView, onAuthAction }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionType, setTransactionType] = useState<'buy' | 'rent'>('buy');
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [localityInput, setLocalityInput] = useState('');
  const [localities, setLocalities] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [rawProperties, setRawProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [selectedRadarLocality, setSelectedRadarLocality] = useState('Wakad');
  const [activeLocalityHeat, setActiveLocalityHeat] = useState<any>(null);
  const [isLocalityHeatLoading, setIsLocalityHeatLoading] = useState(false);
  const [selectedSimulatorBhk, setSelectedSimulatorBhk] = useState<'1 BHK' | '2 BHK' | '3 BHK'>('2 BHK');
  const [viewedRadarLocalities, setViewedRadarLocalities] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hously_radar_viewed_localities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ['Wakad'];
  });
  const [showRadarLoginModal, setShowRadarLoginModal] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationSorted, setIsLocationSorted] = useState<boolean>(false);

  // Scroll to AI Market Intelligence section if targeted by URL hash or redirect
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.hash === '#ai-market-intelligence' || location.hash === '#ai-market-intelligence')) {
      const timer = setTimeout(() => {
        const el = document.getElementById('ai-market-intelligence');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // User Geolocation detection for Market Tape locality proximity
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocationSorted(true);
        },
        () => {},
        { timeout: 7000, enableHighAccuracy: false }
      );
    }
  }, []);

  const [marketHeatData, setMarketHeatData] = useState<any>({
    priceTrend: '+12.5%',
    bestRoiLocality: 'Hinjewadi',
    bestRoiValue: '18.2%',
    marketHeatLocality: 'Wakad',
    marketHeatStatus: 'Hot',
    avgAiScore: '94/100',
  });

  useEffect(() => {
    api.get('v1/ai-reports/market-heat').then((res) => {
      if (res.data?.data) {
        setMarketHeatData(res.data.data);
      }
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!selectedRadarLocality) return;
    setIsLocalityHeatLoading(true);
    api.get(`v1/ai-reports/market-heat?locality=${encodeURIComponent(selectedRadarLocality)}`)
      .then((res) => {
        if (res.data?.data) {
          setActiveLocalityHeat(res.data.data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load radar locality heat:', err);
      })
      .finally(() => {
        setIsLocalityHeatLoading(false);
      });
  }, [selectedRadarLocality]);
  const [currentPropertyView, setCurrentPropertyView] = useState<any | null>(null);
  const [viewedProperties, setViewedProperties] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [buyCount, setBuyCount] = useState<number>(0);
  const [rentCount, setRentCount] = useState<number>(0);
  const [newlyAddedBuyCount, setNewlyAddedBuyCount] = useState<number>(0);
  const [newlyAddedRentCount, setNewlyAddedRentCount] = useState<number>(0);

  const [suggestions, setSuggestions] = useState<MasterOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const [isValuationOpen, setIsValuationOpen] = useState(false);

  // ✅ Pre-fetch total public counts & 3-day newly added counts (with smart fallback) for both Buy and Rent
  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [buyRes, rentRes] = await Promise.allSettled([
          propertiesAPI.PublicgetProperties({ status: 'Available', isPublic: true, is_public: 1, visibility: 'public', publicOnly: 1 }),
          rentalPropertiesAPI.PublicgetProperties({ status: 'Available', isPublic: true, is_public: 1, visibility: 'public', publicOnly: 1 })
        ]);

        if (!isMounted) return;
        if (buyRes.status === 'fulfilled') {
          const raw = Array.isArray(buyRes.value?.data) ? buyRes.value.data : (Array.isArray(buyRes.value) ? buyRes.value : []);
          const publicProps = raw.filter(isPublicProp);
          setBuyCount(publicProps.length);
          setNewlyAddedBuyCount(getNewlyAddedCount(publicProps, 3));
        }
        if (rentRes.status === 'fulfilled') {
          const raw = Array.isArray(rentRes.value?.data) ? rentRes.value.data : (Array.isArray(rentRes.value) ? rentRes.value : []);
          const publicProps = raw.filter(isPublicProp);
          setRentCount(publicProps.length);
          setNewlyAddedRentCount(getNewlyAddedCount(publicProps, 3));
        }
      } catch (e) {
        console.warn('Failed to load initial buy/rent counts:', e);
      }
    };
    fetchCounts();
    return () => { isMounted = false; };
  }, []);

  // ✅ NEW: hero state with instant cache to prevent refresh flashing
  const [heroBlocks, setHeroBlocks] = useState<HeroBlock[]>(() => {
    try {
      const raw = sessionStorage.getItem('cached_hero_blocks');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [heroSlides, setHeroSlides] = useState<
    { url: string; title?: string; description?: string }[]
  >(() => {
    try {
      const raw = sessionStorage.getItem('cached_hero_slides');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((s: any) => s?.url && !s.url.includes('property.png'))
        : [];
    } catch {
      return [];
    }
  });
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimerRef = useRef<number | null>(null);

  // ⭐️ Helper: navigate using onPageChange if provided else router
  const goTo = React.useCallback(
    (page: 'properties' | 'services') => {
      if (onPageChange) {
        onPageChange(page);
        return;
      }
      if (page === 'properties') {
        const dest = transactionType === 'rent' ? '/properties?transaction=rent' : '/properties';
        navigate(dest);
      }
      if (page === 'services') navigate('/services');
    },
    [onPageChange, navigate, transactionType]
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
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);

        const activeAPI = transactionType === 'rent' ? rentalPropertiesAPI : propertiesAPI;

        // ✅ Fetch public properties
        const response = await activeAPI.PublicgetProperties({
          status: 'Available',
          limit: 100,
          isPublic: true,
          is_public: 1,
          visibility: 'public',
          publicOnly: 1,
        });

        const listRaw = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        let rawList = listRaw.filter(isPublicProp);

        if (!rawList.length) {
          const fbRes = await activeAPI.PublicgetProperties({
            status: 'Available',
            limit: 100,
            isPublic: true,
            is_public: 1,
            visibility: 'public',
            publicOnly: 1,
          });
          const fb = Array.isArray(fbRes?.data) ? fbRes.data : (Array.isArray(fbRes) ? fbRes : []);
          rawList = fb.filter(isPublicProp);
        }

        // ✅ Store all active public properties to compute dynamic property types
        setRawProperties(rawList);
        if (transactionType === 'rent') {
          setRentCount(rawList.length);
          setNewlyAddedRentCount(getNewlyAddedCount(rawList, 3));
        } else {
          setBuyCount(rawList.length);
          setNewlyAddedBuyCount(getNewlyAddedCount(rawList, 3));
        }

        // ⬇️ Bulk fetch tags for all raw properties BEFORE filtering
        const allTagsBulk = await propertyTagsAPI.getBulk(rawList.map((p: any) => p.id)).catch(() => ({} as Record<number, string[]>));

        // Attach tags to properties
        rawList.forEach((p: any) => {
          p.tags = allTagsBulk[p.id] || p.tags || [];
        });

        // ✅ Filter for ONLY featured properties (either is_featured flag OR 'featured' tag)
        const featuredList = rawList.filter((p: any) => isFeaturedProp(p, p.tags));

        // Latest first
        featuredList.sort((a: any, b: any) => {
          const ad = a?.publication_date ? new Date(a.publication_date).getTime() : 0;
          const bd = b?.publication_date ? new Date(b.publication_date).getTime() : 0;
          return bd - ad;
        });

        // ⬇️ Slice to top featured cards for Home Page
        const slicedList = featuredList.slice(0, 4);

        const mapped: Property[] = await Promise.all(
          slicedList.map(async (p: any) => {
            const viewData = await fetchPropertyViews(p.id);
            const propertyType = p.property_type_name || p.property_type || '';

            let rawPhotos = p.photos ?? p.photoUrls ?? p.images;
            if (typeof rawPhotos === 'string' && rawPhotos.trim().startsWith('[')) {
              try {
                rawPhotos = JSON.parse(rawPhotos);
              } catch (e) { }
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

            const city = p.city_name || p.city || p.town || p.cityName || '';
            const locationRaw = p.location_name || p.locality || p.area || p.neighbourhood || p.location || p.address || '';
            const state = p.state || p.region || '';
            const location = [locationRaw, city, state].filter(Boolean).slice(0, 2).join(', ');

            const unitType = (p.unit_type || p.unit_type_name || p.unit || p.unitType || '').toString().trim();
            const subtype = (p.property_subtype_name || p.property_subtype || p.unit_category_name || p.subtype || '').toString().trim();

            const tags: string[] = allTagsBulk[p.id] || [];

            const rawSlug = p?.slug ?? p?.url_slug ?? p?.generated_slug;
            const slug = typeof rawSlug === 'string' && rawSlug.trim().length > 0 ? rawSlug.trim() : undefined;

            const carpet = Number(p.carpet_area) || 0;
            const builtup = Number(p.builtup_area) || 0;
            const superBuiltup = Number(p.super_builtup_area) || 0;
            const totalArea = carpet || builtup || superBuiltup || Number(p.area) || undefined;

            const priceVal = p.monthly_rent || p.budget || p.price || p.amount;
            const price = priceVal ? Number(priceVal) : undefined;

            const isRentalProp = transactionType === 'rent' || Boolean(
              p.monthly_rent ||
              p.expected_rent ||
              p.listing_type === 'rent' ||
              p.transaction_type === 'rent' ||
              (p.property_id && String(p.property_id).startsWith('RENT'))
            );

            return {
              id: p.id,
              propertyId: (p.property_id && String(p.property_id).trim()) || (isRentalProp ? `RENT-${p.id ?? ''}` : `REX${String(p.id ?? '').padStart(4, '0')}`),
              title: (p.title || `${unitType ? unitType + ' ' : ''}${p.property_type_name || p.property_type || ''}`).trim(),
              price,
              monthly_rent: p.monthly_rent ?? (isRentalProp ? price : undefined),
              expected_rent: p.expected_rent ?? (isRentalProp ? price : undefined),
              listing_type: p.listing_type || (isRentalProp ? 'rent' : 'sell'),
              transaction_type: p.transaction_type || (isRentalProp ? 'rent' : 'buy'),
              isRental: isRentalProp,
              is_rental: isRentalProp,
              bedrooms: Number(p.bedrooms) || undefined,
              bathrooms: Number(p.bathrooms) || undefined,
              square_feet: totalArea,
              city,
              property_type: propertyType,
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
              total_views: viewData.total_views || 0,
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

        // ✅ Only set featured properties in state (do not fallback to non-featured)
        setFeaturedProperties(mapped);

      } catch (err) {
        console.error('Error fetching featured properties (public-only):', err);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, [transactionType]);


  // ---------- ✅ HERO: fetch & build slides ----------
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const blocks = await homeHeroAPI.list();
        // ✅ keep only active blocks
        const activeBlocks = blocks.filter(b => b.is_active !== false);
        setHeroBlocks(activeBlocks);

        const slides: { url: string; title?: string; description?: string }[] = [];
        for (const b of activeBlocks) {
          const photos = Array.isArray(b.photos) ? b.photos as PhotoPreview[] : [];
          photos.forEach((p) => {
            const url = (p?.url || '').replace(/\\/g, '/');
            if (url && !url.includes('property.png')) {
              slides.push({ url, title: b.title, description: b.description });
            }
          });
        }
        setHeroSlides(slides);
        try {
          sessionStorage.setItem('cached_hero_blocks', JSON.stringify(activeBlocks));
          sessionStorage.setItem('cached_hero_slides', JSON.stringify(slides));
        } catch { }
        setHeroIndex(0);
      } catch (e) {
        console.warn('[HomePage] homeHeroAPI.list() failed, will fallback to featured images', e);
        if (!sessionStorage.getItem('cached_hero_slides')) {
          setHeroBlocks([]);
          setHeroSlides([]);
        }
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

  const masterCity: MasterOption[] = useMemo(
    () => findMasterOptions(['city']),
    [masters]
  );

  const propertyTypeOptions: MasterOption[] = useMemo(
    () => findMasterOptions(['property type', 'property_type', 'propertytype', 'type', 'property']),
    [masters]
  );

  // ✅ Compute dynamic property types available from active properties
  const dynamicPropertyTypeOptions: MasterOption[] = useMemo(() => {
    if (!rawProperties || rawProperties.length === 0) {
      return [];
    }

    // Extract all unique normalized property types present in currently available properties
    const existingTypesSet = new Set<string>();
    rawProperties.forEach((p: any) => {
      const t = (p?.property_type_name || p?.property_type || p?.type || p?._raw?.property_type_name || '').toString().trim();
      if (t) {
        existingTypesSet.add(t.toLowerCase());
      }
    });

    if (existingTypesSet.size === 0) {
      return [];
    }

    const result: MasterOption[] = [];
    const addedValues = new Set<string>();

    // 1. First add matching master options to preserve proper order and standard labels
    if (Array.isArray(propertyTypeOptions)) {
      propertyTypeOptions.forEach((opt) => {
        const optValLower = (opt.value || '').toString().trim().toLowerCase();
        const optLabelLower = (opt.label || '').toString().trim().toLowerCase();

        for (const t of existingTypesSet) {
          if (optValLower === t || optLabelLower === t) {
            if (!addedValues.has(optValLower)) {
              addedValues.add(optValLower);
              addedValues.add(optLabelLower);
              result.push(opt);
            }
            break;
          }
        }
      });
    }

    // 2. Also add any property type found in data that wasn't in master options
    rawProperties.forEach((p: any) => {
      const rawType = (p?.property_type_name || p?.property_type || p?.type || p?._raw?.property_type_name || '').toString().trim();
      if (rawType && !addedValues.has(rawType.toLowerCase())) {
        addedValues.add(rawType.toLowerCase());
        result.push({
          value: rawType,
          label: rawType,
        });
      }
    });

    return result;
  }, [rawProperties, propertyTypeOptions]);

  // ✅ Reset selectedPropertyType if it's no longer available in the active tab's types
  useEffect(() => {
    if (selectedPropertyType && dynamicPropertyTypeOptions.length > 0) {
      const exists = dynamicPropertyTypeOptions.some(
        (opt) =>
          (opt.value || '').toString().trim().toLowerCase() === selectedPropertyType.trim().toLowerCase() ||
          (opt.label || '').toString().trim().toLowerCase() === selectedPropertyType.trim().toLowerCase()
      );
      if (!exists) {
        setSelectedPropertyType('');
      }
    }
  }, [dynamicPropertyTypeOptions, selectedPropertyType]);

  const getTypeCount = (typeVal: string) => {
    if (!typeVal) return rawProperties.length;
    const valLower = typeVal.trim().toLowerCase();
    return rawProperties.filter((p: any) => {
      const t = (p?.property_type_name || p?.property_type || p?.type || p?._raw?.property_type_name || '').toString().trim().toLowerCase();
      return t === valLower;
    }).length;
  };

  const masterLocation: MasterOption[] = useMemo(
    () => findMasterOptions(['location', 'locality', 'localities', 'area', 'neighbourhood', 'neighborhood', 'locality_name']),
    [masters]
  );

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

    // nothing to search -> only update if needed
    if (!q || !Array.isArray(masterLocation) || masterLocation.length === 0) {
      setSuggestions(prev => (prev.length ? [] : prev));
      setShowSuggestions(prev => (prev ? false : prev));
      return;
    }

    const matched = masterLocation
      .filter(opt => {
        const label = (opt.label || '').toString().toLowerCase();
        const value = (opt.value || '').toString().toLowerCase();
        return label.includes(q) || value.includes(q);
      })
      .slice(0, 10);

    // shallow guard to avoid redundant state updates (and re-renders)
    const sameLen = matched.length === suggestions.length;
    const sameItems = sameLen && matched.every((m, i) =>
      m.value === suggestions[i]?.value && m.label === suggestions[i]?.label
    );

    if (!sameItems) setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localityInput, masterLocation]);


  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const city = selectedCity.trim();
    const locationStrings = localities.map(loc => loc.trim());
    if (!city && locationStrings.length === 0) {
      const baseDest = '/properties';
      navigate(`${baseDest}?status=Available&transaction=${transactionType}`);
      return;
    }
    const params: { city: string; locations?: string | string[] } = { city };
    if (locationStrings.length > 0) params.locations = locationStrings;

    try {
      setLoading(true);
      const activeAPI = transactionType === 'rent' ? rentalPropertiesAPI : propertiesAPI;
      const response = await activeAPI.searchByCityLocation(params);
      const rawList = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      await Promise.all(rawList.map(async (_p: any) => _p)); // mapping skipped; we only build the querystring below

      const searchParams = new URLSearchParams();
      if (city) searchParams.set('city', city);
      if (localities.length > 0) searchParams.set('locations', localities.join(','));
      if (selectedPropertyType) searchParams.set('propertyType', selectedPropertyType);
      if (selectedBudget) searchParams.set('budget', selectedBudget);
      searchParams.set('status', 'Available');
      searchParams.set('transaction', transactionType);
      if (filterToken && filterParamKey) searchParams.set(filterParamKey, filterToken);

      const qs = searchParams.toString();
      const baseDest = '/properties';
      navigate(`${baseDest}${qs ? `?${qs}` : ''}`, { replace: true });
    } catch (error) {
      console.error('Error fetching properties from city/location API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellPropertyClick = () => {
    // Redirect to seller page instead of opening modal
    navigate('/sell-property');
  };

  const handleSellerSave = async (formData: any) => {
    try {
      setIsSellerModalOpen(false);
    } catch (err) {
      console.error('Error saving seller/property:', err);
    }
  };

  const handleNavigateToProperty = async (property: any) => {
    const isRental = Boolean(
      property.isRental ||
      property.is_rental ||
      property.monthly_rent ||
      property.expected_rent ||
      property.listing_type === 'rent' ||
      property.transaction_type === 'rent' ||
      property.propertyId?.startsWith('RENT') ||
      String(property.id).startsWith('RENT') ||
      transactionType === 'rent'
    );
    const pathPrefix = isRental ? 'rentals' : 'properties';

    // Check if guest view limit is exceeded
    const { isLocked } = recordAndCheckGuestPropertyLimit(property.id, user, systemSettings);
    if (isLocked) {
      const redirectUrl = property.slug ? `/${pathPrefix}/${encodeURIComponent(String(property.slug))}` : `/${pathPrefix}`;
      navigate(`/register?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    const slug = property.slug;
    const id = property.id;
    if (!slug) {
      console.warn('Attempted to navigate to property without slug:', id);
      return;
    }
    if (viewedProperties.has(id)) {
      let dest = `/${pathPrefix}/${encodeURIComponent(String(slug))}`;
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
      let dest = `/${pathPrefix}/${encodeURIComponent(String(slug))}`;
      if (finalToken) dest += `?${encodeURIComponent(finalParamKey)}=${encodeURIComponent(finalToken)}`;
      navigate(dest);
    } catch (err) {
      console.error('handleNavigateToProperty unexpected error:', err);
      navigate(`/${pathPrefix}/${encodeURIComponent(String(slug))}`);
    }
  };

  if (currentPropertyView) {
    return <PublicPropertyDetailPage property={currentPropertyView} onBack={() => setCurrentPropertyView(null)} />;
  }

  // ---------- HERO background source preference ----------
  // Only use valid hero slide images from CMS; never fallback to /property.png "Coming Soon" placeholder
  const rawHeroUrl = heroSlides.length > 0 ? heroSlides[heroIndex]?.url : null;
  const resolvedUrl = rawHeroUrl ? getImageUrl(rawHeroUrl, '') : '';
  const activeHeroUrl =
    resolvedUrl &&
      !resolvedUrl.includes('property.png') &&
      resolvedUrl !== '/' &&
      resolvedUrl !== 'null' &&
      resolvedUrl !== 'undefined'
      ? resolvedUrl
      : null;

  const activeHeroTitle =
    heroSlides.length > 0 ? (heroSlides[heroIndex]?.title || '') : '';

  const activeHeroDesc =
    heroSlides.length > 0 ? (heroSlides[heroIndex]?.description || '') : '';

  return (
    <div className="">
      {/* HERO / SEARCH */}
      <section className="relative bg-gradient-to-br from-[#0b3856] via-[#0f2b3d] to-[#1a4460] text-white overflow-hidden min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0 bg-black/25"></div>

        {/* ✅ Dynamic background (Only rendered if a real hero slide image is available) */}
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
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTransactionType("buy");
                      setSelectedPropertyType("");
                    }}
                    className={`relative px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm sm:text-base ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition cursor-pointer font-semibold
                      ${transactionType === "buy"
                        ? "bg-[#E6761D] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    aria-pressed={transactionType === "buy"}
                  >
                    <span>Buy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTransactionType("rent");
                      setSelectedPropertyType("");
                    }}
                    className={`relative px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm sm:text-base ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition cursor-pointer font-semibold
                      ${transactionType === "rent"
                        ? "bg-[#E6761D] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    aria-pressed={transactionType === "rent"}
                  >
                    <span>Rent</span>
                    <AnimatedCountBadge count={newlyAddedRentCount} totalCount={rentCount} />
                  </button>
                </div>

                {/* Property-type chips */}
                <div className="w-full grid justify-center md:w-auto">
                  {loading && dynamicPropertyTypeOptions.length === 0 ? (
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
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition cursor-pointer
              ${selectedPropertyType === ""
                              ? "bg-white text-black font-semibold shadow-sm"
                              : "bg-white/30 text-white hover:bg-white/40"
                            }`}
                        >
                          All
                        </button>

                        {dynamicPropertyTypeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSelectedPropertyType(opt.value)}
                            aria-pressed={selectedPropertyType === opt.value}
                            title={opt.label}
                            className={`
                  shrink-0 snap-start whitespace-nowrap
                  px-3 sm:px-4 py-1.5 rounded-full text-sm
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition cursor-pointer
                  ${selectedPropertyType === opt.value
                                ? "bg-white text-black font-semibold shadow-sm"
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

      {/* AI Market Intelligence - Advanced Interactive Terminal */}
      <section id="ai-market-intelligence" className="py-8 bg-gradient-to-b from-white via-slate-50/60 to-white border-y border-slate-100 scroll-mt-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#E6761D] text-[10px] font-semibold mb-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#E6761D] animate-pulse" />
              <span>LIVE AI MARKET RADAR · PUNE REAL ESTATE</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0b3856] tracking-tight">
              AI Market Intelligence & Investment Radar
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              Live algorithmic valuations, rental yields, and predictive appreciation horizons across Pune's top micro-markets.
            </p>
          </div>

          {/* Micro-Market Quick Filter Chips */}
          {(() => {
            const defaultMicroMarkets = [
              {
                id: 'wakad',
                name: 'Wakad',
                badge: 'High Liquidity',
                rate: '₹8,450/sqft',
                trend: '+8.5%',
                roi: '16.8%',
                heat: 'Hot',
                heatColor: 'bg-red-50 text-red-600 border-red-200',
                score: '96/100',
                sparkline: [42, 45, 48, 47, 52, 56, 61],
                daysToSell: 32,
                yieldPct: '4.2%',
                capitalGain: '+12.6%',
                units: {
                  '1 BHK': { price: '₹48L - ₹55L', profit3Yr: '+₹8.2L', rent: '₹18,000/mo' },
                  '2 BHK': { price: '₹72L - ₹86L', profit3Yr: '+₹13.4L', rent: '₹26,000/mo' },
                  '3 BHK': { price: '₹98L - ₹1.25Cr', profit3Yr: '+₹19.5L', rent: '₹35,000/mo' },
                }
              },
              {
                id: 'hinjewadi',
                name: 'Hinjewadi',
                badge: 'IT Hub Core',
                rate: '₹7,200/sqft',
                trend: '+12.4%',
                roi: '18.4%',
                heat: 'High Inflow',
                heatColor: 'bg-blue-50 text-blue-600 border-blue-200',
                score: '95/100',
                sparkline: [38, 41, 43, 49, 53, 58, 65],
                daysToSell: 28,
                yieldPct: '5.1%',
                capitalGain: '+13.3%',
                units: {
                  '1 BHK': { price: '₹42L - ₹48L', profit3Yr: '+₹7.5L', rent: '₹16,500/mo' },
                  '2 BHK': { price: '₹64L - ₹76L', profit3Yr: '+₹12.8L', rent: '₹24,000/mo' },
                  '3 BHK': { price: '₹85L - ₹1.05Cr', profit3Yr: '+₹17.2L', rent: '₹32,000/mo' },
                }
              },
              {
                id: 'baner',
                name: 'Baner',
                badge: 'Luxury Corridor',
                rate: '₹9,850/sqft',
                trend: '+9.2%',
                roi: '15.9%',
                heat: 'Peak Demand',
                heatColor: 'bg-purple-50 text-purple-600 border-purple-200',
                score: '97/100',
                sparkline: [52, 54, 57, 60, 63, 67, 72],
                daysToSell: 36,
                yieldPct: '3.8%',
                capitalGain: '+12.1%',
                units: {
                  '1 BHK': { price: '₹55L - ₹62L', profit3Yr: '+₹9.6L', rent: '₹22,000/mo' },
                  '2 BHK': { price: '₹88L - ₹1.05Cr', profit3Yr: '+₹16.5L', rent: '₹32,000/mo' },
                  '3 BHK': { price: '₹1.35Cr - ₹1.85Cr', profit3Yr: '+₹28.2L', rent: '₹45,000/mo' },
                }
              },
              {
                id: 'kharadi',
                name: 'Kharadi',
                badge: 'East Tech Hub',
                rate: '₹8,900/sqft',
                trend: '+11.3%',
                roi: '17.2%',
                heat: 'High Growth',
                heatColor: 'bg-amber-50 text-amber-700 border-amber-200',
                score: '94/100',
                sparkline: [44, 46, 49, 53, 58, 62, 68],
                daysToSell: 30,
                yieldPct: '4.6%',
                capitalGain: '+12.6%',
                units: {
                  '1 BHK': { price: '₹46L - ₹54L', profit3Yr: '+₹8.5L', rent: '₹19,000/mo' },
                  '2 BHK': { price: '₹74L - ₹89L', profit3Yr: '+₹14.2L', rent: '₹28,000/mo' },
                  '3 BHK': { price: '₹1.05Cr - ₹1.40Cr', profit3Yr: '+₹22.1L', rent: '₹38,000/mo' },
                }
              },
              {
                id: 'vimannagar',
                name: 'Viman Nagar',
                badge: 'Airport Core',
                rate: '₹10,400/sqft',
                trend: '+7.8%',
                roi: '14.8%',
                heat: 'Resilient',
                heatColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                score: '93/100',
                sparkline: [60, 62, 64, 66, 68, 71, 74],
                daysToSell: 25,
                yieldPct: '4.1%',
                capitalGain: '+10.7%',
                units: {
                  '1 BHK': { price: '₹58L - ₹66L', profit3Yr: '+₹8.8L', rent: '₹24,000/mo' },
                  '2 BHK': { price: '₹92L - ₹1.15Cr', profit3Yr: '+₹15.8L', rent: '₹35,000/mo' },
                  '3 BHK': { price: '₹1.45Cr - ₹2.10Cr', profit3Yr: '+₹26.5L', rent: '₹50,000/mo' },
                }
              },
              {
                id: 'ravet',
                name: 'Ravet',
                badge: 'Expressway Hub',
                rate: '₹6,500/sqft',
                trend: '+14.1%',
                roi: '19.5%',
                heat: 'Fast Expanding',
                heatColor: 'bg-orange-50 text-orange-700 border-orange-200',
                score: '92/100',
                sparkline: [32, 35, 39, 44, 48, 54, 60],
                daysToSell: 34,
                yieldPct: '4.8%',
                capitalGain: '+14.7%',
                units: {
                  '1 BHK': { price: '₹36L - ₹42L', profit3Yr: '+₹6.8L', rent: '₹14,000/mo' },
                  '2 BHK': { price: '₹52L - ₹64L', profit3Yr: '+₹11.2L', rent: '₹20,000/mo' },
                  '3 BHK': { price: '₹72L - ₹92L', profit3Yr: '+₹16.4L', rent: '₹27,000/mo' },
                }
              }
            ];

            // Dynamically merge top real-world micro-markets discovered from database inventory
            const rawDbMarkets = activeLocalityHeat?.topMicroMarkets || marketHeatData?.topMicroMarkets;
            const microMarkets = [...defaultMicroMarkets];
            if (Array.isArray(rawDbMarkets) && rawDbMarkets.length > 0) {
              rawDbMarkets.forEach((dbM: any) => {
                if (!dbM?.name) return;
                const existing = microMarkets.find(m => m.name.toLowerCase() === dbM.name.toLowerCase());
                if (existing) {
                  if (dbM.avgSqft) existing.rate = dbM.avgSqft;
                } else {
                  microMarkets.push({
                    id: dbM.name.toLowerCase().replace(/\s+/g, ''),
                    name: dbM.name,
                    badge: `${dbM.count || ''} Active Resales`.trim() || 'Top Demand',
                    rate: dbM.avgSqft || '₹7,500/sqft',
                    trend: '+10.2%',
                    roi: '17.1%',
                    heat: 'High Liquidity',
                    heatColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    score: '95/100',
                    sparkline: [40, 44, 48, 52, 57, 62, 68],
                    daysToSell: 30,
                    yieldPct: '4.6%',
                    capitalGain: '+11.8%',
                    units: {
                      '1 BHK': { price: '₹44L - ₹52L', profit3Yr: '+₹7.8L', rent: '₹17,000/mo' },
                      '2 BHK': { price: '₹66L - ₹80L', profit3Yr: '+₹12.5L', rent: '₹24,500/mo' },
                      '3 BHK': { price: '₹90L - ₹1.18Cr', profit3Yr: '+₹18.0L', rent: '₹33,000/mo' },
                    }
                  });
                }
              });
            }

            // User Geolocation coordinate mapping for Pune micro-markets
            const PUNE_LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
              wakad: { lat: 18.5987, lng: 73.7684 },
              hinjewadi: { lat: 18.5913, lng: 73.7389 },
              baner: { lat: 18.5590, lng: 73.7868 },
              balewadi: { lat: 18.5762, lng: 73.7744 },
              rahatani: { lat: 18.6012, lng: 73.7915 },
              ravet: { lat: 18.6508, lng: 73.7388 },
              punawale: { lat: 18.6258, lng: 73.7394 },
              tathawade: { lat: 18.6186, lng: 73.7547 },
              pimplesaudagar: { lat: 18.5987, lng: 73.8037 },
              pimplenilakh: { lat: 18.5786, lng: 73.7924 },
              pimpri: { lat: 18.6279, lng: 73.8009 },
              kharadi: { lat: 18.5515, lng: 73.9349 },
              vimannagar: { lat: 18.5679, lng: 73.9143 },
              kothrud: { lat: 18.5074, lng: 73.8077 },
              bavdhan: { lat: 18.5147, lng: 73.7749 },
              moshi: { lat: 18.6792, lng: 73.8443 },
            };

            const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
              const R = 6371;
              const dLat = (lat2 - lat1) * Math.PI / 180;
              const dLon = (lon2 - lon1) * Math.PI / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
              return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            };

            // If user coordinates detected, sort micro-markets by proximity to the user
            if (userCoords) {
              microMarkets.sort((a, b) => {
                const coordA = PUNE_LOCALITY_COORDS[a.name.toLowerCase().replace(/\s+/g, '')] || { lat: 18.5204, lng: 73.8567 };
                const coordB = PUNE_LOCALITY_COORDS[b.name.toLowerCase().replace(/\s+/g, '')] || { lat: 18.5204, lng: 73.8567 };
                const distA = getDistanceKm(userCoords.lat, userCoords.lng, coordA.lat, coordA.lng);
                const distB = getDistanceKm(userCoords.lat, userCoords.lng, coordB.lat, coordB.lng);
                return distA - distB;
              });

              if (microMarkets.length > 0) {
                const nearest = microMarkets[0];
                const coordNearest = PUNE_LOCALITY_COORDS[nearest.name.toLowerCase().replace(/\s+/g, '')];
                const distKm = coordNearest ? getDistanceKm(userCoords.lat, userCoords.lng, coordNearest.lat, coordNearest.lng) : null;
                nearest.badge = distKm !== null && distKm < 25 ? `📍 Near You (${distKm.toFixed(1)} km)` : '📍 Closest Micro-Market';
              }
            }

            // Handler for locality clicks with 3-locality preview limit for guests (strict gate on 4th locality)
            const handleLocalityClick = (locName: string) => {
              if (!locName) return;
              const cleanName = locName.trim();
              if (selectedRadarLocality.toLowerCase() === cleanName.toLowerCase()) return;

              if (user) {
                setSelectedRadarLocality(cleanName);
                return;
              }

              const normalizedName = cleanName.toLowerCase();
              // Build set of viewed localities including currently selected
              const currentViewedSet = new Set(
                viewedRadarLocalities.map((l) => l.toLowerCase().trim())
              );
              currentViewedSet.add(selectedRadarLocality.toLowerCase().trim());

              const isAlreadyViewed = currentViewedSet.has(normalizedName);

              // If clicking a 4th unique locality (set already has 3 localities):
              // Block view and prompt registration immediately
              if (!isAlreadyViewed && currentViewedSet.size >= 3) {
                setShowRadarLoginModal(true);
                return;
              }

              if (!isAlreadyViewed) {
                currentViewedSet.add(normalizedName);
                const updatedList = Array.from(currentViewedSet);
                setViewedRadarLocalities(updatedList);
                try {
                  localStorage.setItem('hously_radar_viewed_localities', JSON.stringify(updatedList));
                } catch (e) {}
              }

              setSelectedRadarLocality(cleanName);
            };

            const selectedMarket = microMarkets.find(m => m.name.toLowerCase() === selectedRadarLocality.toLowerCase()) || microMarkets[0];
            const isLiveMatch = Boolean(activeLocalityHeat && activeLocalityHeat.priceTrendLocality?.toLowerCase() === selectedMarket.name.toLowerCase());
            
            const activeRate = isLiveMatch && activeLocalityHeat.rate ? activeLocalityHeat.rate : selectedMarket.rate;
            const activeTrend = isLiveMatch && activeLocalityHeat.priceTrend ? activeLocalityHeat.priceTrend : selectedMarket.trend;
            const activeRoiRaw = isLiveMatch && activeLocalityHeat.bestRoiValue ? activeLocalityHeat.bestRoiValue : selectedMarket.roi;
            const cleanRoi = String(activeRoiRaw || '').replace(/\s*\(\s*3\s*-\s*Yr\s*\)/gi, '').trim();
            const activeRoi = cleanRoi ? `${cleanRoi} (3-Yr)` : '16.8% (3-Yr)';
            const activeHeat = isLiveMatch && activeLocalityHeat.marketHeatStatus ? activeLocalityHeat.marketHeatStatus : selectedMarket.heat;
            const activeScore = isLiveMatch && activeLocalityHeat.avgAiScore ? activeLocalityHeat.avgAiScore : selectedMarket.score;
            const activeYield = isLiveMatch && activeLocalityHeat.yieldPct ? activeLocalityHeat.yieldPct : selectedMarket.yieldPct;
            const activeDaysToSell = isLiveMatch && activeLocalityHeat.daysToSell ? activeLocalityHeat.daysToSell : selectedMarket.daysToSell;
            const activeUnits = isLiveMatch && activeLocalityHeat.units ? activeLocalityHeat.units : selectedMarket.units;
            const activeSparkline = (isLiveMatch && activeLocalityHeat.sparkline && activeLocalityHeat.sparkline.length > 0)
              ? activeLocalityHeat.sparkline
              : selectedMarket.sparkline;

            // Compute dynamic momentum status & badge styling from activeTrend
            const getMomentumInfo = (trendStr: string) => {
              const num = parseFloat(String(trendStr).replace(/[^0-9.-]/g, '')) || 0;
              const isNegative = String(trendStr).includes('-');
              const val = isNegative ? -Math.abs(num) : num;

              if (val >= 10.0) {
                return {
                  label: 'Bullish Uptrend',
                  icon: '▲',
                  textColor: 'text-emerald-700',
                  badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  barColor1: 'bg-emerald-400',
                  barColor2: 'bg-emerald-600',
                  barPct: 35,
                };
              } else if (val >= 5.0) {
                return {
                  label: 'Moderate Growth',
                  icon: '▲',
                  textColor: 'text-blue-700',
                  badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
                  barColor1: 'bg-blue-400',
                  barColor2: 'bg-blue-600',
                  barPct: 45,
                };
              } else if (val >= 0.0) {
                return {
                  label: 'Steady Market',
                  icon: '▲',
                  textColor: 'text-slate-700',
                  badgeStyle: 'bg-slate-50 text-slate-700 border-slate-200',
                  barColor1: 'bg-slate-400',
                  barColor2: 'bg-slate-600',
                  barPct: 50,
                };
              } else {
                return {
                  label: 'Price Correction',
                  icon: '▼',
                  textColor: 'text-rose-700',
                  badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
                  barColor1: 'bg-rose-400',
                  barColor2: 'bg-rose-600',
                  barPct: 60,
                };
              }
            };

            const momentumInfo = getMomentumInfo(activeTrend);

            return (
              <div className="space-y-4">
                {/* Real-time Ticker Ribbon */}
                <div className="bg-slate-900 text-slate-200 rounded-xl px-3 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar shadow-xs text-xs">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="flex items-center gap-1 font-bold text-orange-400 uppercase tracking-wider text-[10px]">
                      <Zap size={13} className="text-orange-400" />
                      Market Tape:
                    </span>
                    {userCoords && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80">
                        <Navigation size={8} />
                        Near You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    {microMarkets.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleLocalityClick(m.name)}
                        className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                          selectedMarket.id === m.id ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-slate-200 font-medium">{m.name}</span>
                        <span className="text-emerald-400 font-semibold">{m.name === selectedMarket.name ? activeRate : m.rate}</span>
                        <span className="text-emerald-400 text-[10px]">▲ {m.name === selectedMarket.name ? activeTrend : m.trend}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Locality Selector Tabs */}
                <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {microMarkets.map(m => {
                    const isSelected = selectedMarket.id === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleLocalityClick(m.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0b3856] text-white shadow-sm ring-2 ring-[#0b3856]/20'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <MapPin size={12} className={isSelected ? 'text-orange-400' : 'text-slate-400'} />
                        <span>{m.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {m.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 4 Advanced Live Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Price Trends & Market Momentum */}
                  <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shrink-0">
                          <TrendingUp size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Price Trend</p>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900">{activeRate}</h4>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[10px] border shrink-0 ${momentumInfo.badgeStyle}`}>
                        {momentumInfo.icon} {activeTrend}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5">
                        <span>Momentum: <strong className={momentumInfo.textColor}>{isLocalityHeatLoading ? 'Updating...' : momentumInfo.label}</strong></span>
                        <span>YoY Pace: <strong className={momentumInfo.textColor}>{activeTrend}</strong></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                        <div className={`${momentumInfo.barColor1} h-full`} style={{ width: `${momentumInfo.barPct}%` }} />
                        <div className={`${momentumInfo.barColor2} h-full`} style={{ width: `${100 - momentumInfo.barPct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: 3-Year Expected ROI & Yield */}
                  <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 shrink-0">
                          <Target size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-slate-500 truncate">Projected 3-Yr ROI</p>
                          <h4 className="text-base sm:text-lg font-bold text-blue-700 whitespace-nowrap">{activeRoi}</h4>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200 shrink-0">
                        Top Decile
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                        <span>Yield: <strong className="text-slate-800">{activeYield}</strong></span>
                        <span>Capital Gain: <strong className="text-blue-700">{activeTrend}</strong></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                        <div className="bg-blue-400 h-full" style={{ width: '30%' }} />
                        <div className="bg-blue-600 h-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Market Heat & Demand Liquidity */}
                  <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-100 shrink-0">
                          <BarChart3 size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">Market Heat</p>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900">{selectedMarket.name}</h4>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${selectedMarket.heatColor}`}>
                        {activeHeat}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <div>
                        <span className="text-slate-400">Search Velocity:</span>
                        <span className="font-semibold text-slate-700 ml-1">
                          {activeLocalityHeat?.searchVolumeScore ? `${activeLocalityHeat.searchVolumeScore}/100` : '92/100'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Avg Close:</span>
                        <span className="font-bold text-purple-700 ml-1">{activeDaysToSell} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: AI Investment Attractiveness Score */}
                  <div className="bg-white border border-slate-200/90 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 ring-1 ring-orange-100 shrink-0">
                          <Brain size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-500">AI Score</p>
                          <h4 className="text-base sm:text-lg font-bold text-[#E6761D]">{activeScore}</h4>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 shrink-0">
                        Strong Buy
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Risk Profile:</span>
                      <span className="font-semibold text-slate-700">Low Volatility · High Resale</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Instant Valuation & Profit Simulator Banner */}
                <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Bot size={15} className="text-[#E6761D]" />
                        <span>Instant Resale Valuation & ROI Simulator · {selectedMarket.name}</span>
                        {isLiveMatch && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            LIVE COMPS
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Projected 3-year capital profit and monthly rental yields based on real registered Pune registry comps.
                      </p>
                    </div>

                    {/* 1 BHK / 2 BHK / 3 BHK Simulator Switcher */}
                    <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-slate-100 p-1 rounded-lg w-full sm:w-auto text-xs">
                      {(['1 BHK', '2 BHK', '3 BHK'] as const).map((u) => {
                        const isUnitSelected = selectedSimulatorBhk === u;
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setSelectedSimulatorBhk(u)}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-semibold text-xs text-center transition-colors cursor-pointer ${
                              isUnitSelected
                                ? 'bg-white text-[#0b3856] shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {u}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Simulator Metrics Row */}
                  {(() => {
                    const currentUnitKey = selectedSimulatorBhk;
                    const unitData = activeUnits[currentUnitKey] || activeUnits['2 BHK'] || selectedMarket.units[currentUnitKey];

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Estimated Valuation ({selectedSimulatorBhk})</p>
                          <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{unitData.price}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Based on {activeRate} current rate</p>
                        </div>

                        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">3-Year Projected Profit</p>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded whitespace-nowrap">
                              +{activeRoi}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-emerald-900 mt-0.5">{unitData.profit3Yr} Capital Gain</p>
                          <p className="text-[10px] text-emerald-700 mt-0.5">Net unrealized appreciation</p>
                        </div>

                        <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] text-blue-800 uppercase tracking-wider font-bold">Rental Cashflow</p>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
                              {activeYield} Yield
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-blue-900 mt-0.5">{unitData.rent}</p>
                          <p className="text-[10px] text-blue-700 mt-0.5">Instant passive rental income</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* CTA */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setLocalityInput(selectedMarket.name);
                      setIsAiReportOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <Brain size={16} />
                    <span>Get Full AI Report for {selectedMarket.name}</span>
                  </button>
                  <AIReportModal
                    isOpen={isAiReportOpen}
                    onClose={() => setIsAiReportOpen(false)}
                    onUnlockPro={() => {
                      setIsAiReportOpen(false);
                      setIsSubOpen(true);
                    }}
                    initialLocality={selectedMarket.name}
                  />
                  <SubscriptionModal isOpen={isSubOpen} onClose={() => setIsSubOpen(false)} />
                </div>
              </div>
            );
          })()}
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
            <div className="flex justify-center items-center min-h-[420px]"><LoadingSpinner size="lg" /></div>
          ) : featuredProperties.length === 0 ? (
            <div className="flex justify-center items-center min-h-[300px] text-gray-500 font-medium  rounded-2xl  my-4 text-base">
              No featured properties found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {featuredProperties.map((property) => {
                const isRental = Boolean(
                  property.listing_type === 'rent' ||
                  property.transaction_type === 'rent' ||
                  property.monthly_rent ||
                  property.expected_rent ||
                  (property.listing_type && String(property.listing_type).toLowerCase() === 'rent') ||
                  transactionType === 'rent'
                );

                const propIdDisplay = isRental
                  ? (property.propertyId ? property.propertyId.replace(/^REX/i, 'RENT-') : `RENT-${property.id ?? ''}`)
                  : (property.propertyId || `REX${String(property.id ?? '').padStart(4, '0')}`);

                const rawUnit = (property.unitType || (property as any).unit_type || (property as any)._raw?.unit_type || (property as any)._raw?.unit_type_name || (property as any).bhk || '')?.toString().trim();
                const formattedUnit = rawUnit ? (/^\d+(\.\d+)?$/.test(rawUnit) ? `${rawUnit} BHK` : rawUnit) : (property.bedrooms ? `${property.bedrooms} BHK` : '');

                const propType = (property.property_type || (property as any)._raw?.property_type_name || property.type || '').toString().trim();
                const propSubtype = (property.subtype || (property as any)._raw?.property_subtype_name || (property as any).property_subtype || '').toString().trim();

                const displayTitle = [propType, formattedUnit, propSubtype]
                  .filter(Boolean)
                  .filter((val, i, arr) => arr.indexOf(val) === i)
                  .join(' ') || property.title || 'Property';

                const amenities = Array.isArray(property.amenities) ? property.amenities : [];
                const shownAmenities = amenities.slice(0, 2);
                const moreCount = Math.max(amenities.length - shownAmenities.length, 0);

                const pricePerSqFt = property.price && (property.square_feet || property.area)
                  ? Math.round(property.price / (property.square_feet || property.area || 1))
                  : null;

                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-2xl border border-gray-200/80 hover:border-[#E6761D]/50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group h-full flex flex-col"
                  >
                    {/* Image Section */}
                    <div className="relative h-44 sm:h-48 bg-slate-100 overflow-hidden">
                      <div onClick={() => handleNavigateToProperty(property)} className="cursor-pointer h-full w-full relative">
                        <img
                          src={getImageUrl(property.images?.[0]) || DEFAULT_PROPERTY_IMAGE}
                          alt={property.title || 'Property image'}
                          onError={(e) => { e.currentTarget.src = '/property.png'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-white text-xl font-bold opacity-35 select-none tracking-wider">ResaleExpert.in</span>
                        </div>
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-20 pointer-events-none">
                        <div className="flex items-center gap-1 max-w-full overflow-hidden flex-nowrap pointer-events-auto">
                          <PropertyTags tags={property.tags || []} />
                          {(property.aiScore ?? 0) >= 90 && (
                            <span className="shrink-0 whitespace-nowrap bg-purple-600/95 text-white px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center shadow-sm leading-none">
                              <Bot size={11} className="mr-1" />
                              AI {Math.round(property.aiScore ?? 0)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Image Stats (Rating & Views) */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
                        <div className="bg-black/55 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-medium">
                          <Star className="text-yellow-400 fill-yellow-400" size={11} />
                          <span>{(property.rating || 4.5).toFixed(1)}</span>
                        </div>
                        <div className="bg-black/55 backdrop-blur-sm text-white/95 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {property.total_views || property.views || 0} views
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        {/* Title & Property ID on right */}
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => handleNavigateToProperty(property)}
                            className="text-base font-bold text-[#0b3856] group-hover:text-[#E6761D] transition-colors line-clamp-1 cursor-pointer flex-1"
                            title={displayTitle}
                          >
                            {displayTitle}
                          </h3>
                          <span className="shrink-0 text-xs font-mono font-semibold text-gray-500 pt-0.5">
                            {propIdDisplay}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-xs text-gray-500 font-medium mt-1 line-clamp-1">
                          <MapPin size={13} className="text-[#E6761D] shrink-0 mr-1.5" />
                          <span className="truncate">{property.location || property.city || 'Pune'}</span>
                        </div>
                      </div>

                      {/* Pricing & Key Specs (Exact requested layout) */}
                      <div className="flex items-center justify-between py-1.5 border-y border-gray-100">
                        <div>
                          <div className="text-lg font-bold text-green-600 leading-tight">
                            {formatCurrency(property.price)}
                            {isRental ? <span className="text-xs font-normal text-gray-500">/mo</span> : ''}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {property.unitType || property.type || 'Residential'} • {property.square_feet ?? property.area ?? ' - '} sq ft
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500">Price per sq ft</div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {pricePerSqFt ? `₹${pricePerSqFt.toLocaleString()}` : '—'}
                          </div>
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      {shownAmenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {shownAmenities.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium truncate max-w-[130px]">
                              {a}
                            </span>
                          ))}
                          {moreCount > 0 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              +{moreCount} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex items-center gap-2 pt-1 mt-auto">
                        {property.slug ? (
                          <button
                            onClick={() => handleNavigateToProperty(property)}
                            className="flex-1 h-9 bg-[#E6761D] hover:bg-[#CC6A1A] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center"
                          >
                            View Details
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 h-9 bg-gray-200 text-gray-400 text-xs sm:text-sm font-semibold rounded-lg cursor-not-allowed flex items-center justify-center"
                          >
                            View Details
                          </button>
                        )}

                        {/* Call */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const phone = property.executive?.phone || "919999999999";
                            window.location.href = `tel:${phone}`;
                          }}
                          className="h-9 w-9 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center shrink-0"
                          title="Call"
                          type="button"
                        >
                          <Phone size={15} />
                        </button>

                        {/* WhatsApp */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const phone = property?.executive?.phone?.replace(/\D/g, "") || "9637009639";
                            const title = displayTitle;
                            const loc = property?.location || property?.city || "Pune";
                            const priceValue = Number(property?.price || 0);
                            const priceText = !isNaN(priceValue) ? `₹${priceValue.toLocaleString("en-IN")}` : "Price on request";
                            const pathPrefix = isRental ? 'rentals' : 'properties';
                            const link = property?.slug
                              ? `${window.location.origin}/${pathPrefix}/${encodeURIComponent(String(property.slug))}`
                              : `${window.location.origin}/${pathPrefix}`;
                            const message = `Hi, I'm interested in ${title} at ${loc}. Price: ${priceText}. Can you share more details?\n${link}`;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
                          }}
                          className="h-9 w-9 rounded-lg bg-[#25D366] hover:bg-[#1ebe57] text-white transition-colors flex items-center justify-center shrink-0"
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
          )}
          <div className="text-center mt-4">
            <Link to={transactionType === 'rent' ? '/rentals' : '/properties'}>
              <button
                onClick={() => onPageChange && onPageChange(transactionType === 'rent' ? 'rentals' : 'properties')}
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
      {/* Why Choose Section - Modern like Roomac */}
      <section className="py-5 md:py-7 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading with dot decoration */}
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-0.5 bg-[#E6761D]"></span>
              <span className="text-[#E6761D] text-sm font-semibold uppercase tracking-wide">Why Choose Us</span>
              <span className="w-8 h-0.5 bg-[#E6761D]"></span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Why Choose&nbsp;{companyName}?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Trusted Resale Property Consultant in Pune & PCMC
            </p>
          </div>

          {/* Cards Grid - 2x2 on mobile, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8">

            {/* Card 1 */}
            <div className="group bg-white rounded-2xl p-5 md:p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#E6761D]/20">
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#E6761D]/10 flex items-center justify-center mx-auto group-hover:bg-[#E6761D] transition-all duration-300">
                  <ShieldCheck className="text-[#E6761D] group-hover:text-white transition-all duration-300" size={26} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#E6761D] text-white text-xs font-bold flex items-center justify-center">
                  01
                </div>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                Verified Listings Only
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Every property undergoes legal and documentation checks for complete peace of mind.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-2xl p-5 md:p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#E6761D]/20">
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#E6761D]/10 flex items-center justify-center mx-auto group-hover:bg-[#E6761D] transition-all duration-300">
                  <Brain className="text-[#E6761D] group-hover:text-white transition-all duration-300" size={26} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#E6761D] text-white text-xs font-bold flex items-center justify-center">
                  02
                </div>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                Fair Market Valuation
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Transparent pricing with no hidden charges or inflated rates guaranteed.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-2xl p-5 md:p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#E6761D]/20">
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#E6761D]/10 flex items-center justify-center mx-auto group-hover:bg-[#E6761D] transition-all duration-300">
                  <Users className="text-[#E6761D] group-hover:text-white transition-all duration-300" size={26} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#E6761D] text-white text-xs font-bold flex items-center justify-center">
                  03
                </div>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                Local Market Expertise
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Deep understanding of Pune and PCMC real estate trends and micro-markets.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group bg-white rounded-2xl p-5 md:p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#E6761D]/20">
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#E6761D]/10 flex items-center justify-center mx-auto group-hover:bg-[#E6761D] transition-all duration-300">
                  <Handshake className="text-[#E6761D] group-hover:text-white transition-all duration-300" size={26} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#E6761D] text-white text-xs font-bold flex items-center justify-center">
                  04
                </div>
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                End-to-End Assistance
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Complete support from property search to registration and final possession.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Modern stats cards */}
      <section className="py-4 md:py-5 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">

            {/* Stat 1 */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl md:rounded-2xl p-3 md:p-5 text-center border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-200 flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-blue-300 transition-colors">
                <Home className="text-blue-700" size={18} />
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-0.5">
                10K<span className="text-base md:text-lg text-gray-600">+</span>
              </h4>
              <p className="text-gray-600 text-[11px] md:text-xs font-medium">Properties Sold</p>
              <div className="mt-1.5 md:mt-2 h-0.5 w-6 md:w-8 bg-blue-300 rounded-full mx-auto"></div>
            </div>

            {/* Stat 2 */}
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl md:rounded-2xl p-3 md:p-5 text-center border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-200 flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-emerald-300 transition-colors">
                <Users className="text-emerald-700" size={18} />
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-0.5">
                25K<span className="text-base md:text-lg text-gray-600">+</span>
              </h4>
              <p className="text-gray-600 text-[11px] md:text-xs font-medium">Happy Customers</p>
              <div className="mt-1.5 md:mt-2 h-0.5 w-6 md:w-8 bg-emerald-300 rounded-full mx-auto"></div>
            </div>

            {/* Stat 3 */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl md:rounded-2xl p-3 md:p-5 text-center border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-200 flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-amber-300 transition-colors">
                <Award className="text-amber-700" size={18} />
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-0.5">
                15<span className="text-base md:text-lg text-gray-600">+</span>
              </h4>
              <p className="text-gray-600 text-[11px] md:text-xs font-medium">Years of Trust</p>
              <div className="mt-1.5 md:mt-2 h-0.5 w-6 md:w-8 bg-amber-300 rounded-full mx-auto"></div>
            </div>

            {/* Stat 4 */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl md:rounded-2xl p-3 md:p-5 text-center border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-purple-200 flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-purple-300 transition-colors">
                <Star className="text-purple-700" size={18} />
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-gray-800 mb-0.5">
                4.9<span className="text-base md:text-lg text-gray-600">★</span>
              </h4>
              <p className="text-gray-600 text-[11px] md:text-xs font-medium">Customer Rating</p>
              <div className="mt-1.5 md:mt-2 h-0.5 w-6 md:w-8 bg-purple-300 rounded-full mx-auto"></div>
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
          setOpen(false);
          setIsValuationOpen(true);
        }}
      />

      {/* Guest Locality Exploration Limit Modal */}
      {showRadarLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <button
              onClick={() => setShowRadarLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-3 text-[#E6761D]">
              <Lock size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              Unlock Unlimited AI Market Intelligence
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              You've reached the free guest preview limit of 3 micro-markets. Sign in or create a free account to unlock live valuations, rental cashflow, and predictive appreciation horizons across all Pune micro-markets!
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowRadarLoginModal(false);
                  navigate('/register?redirect=' + encodeURIComponent('/#ai-market-intelligence'));
                }}
                className="flex-1 bg-[#E6761D] hover:bg-[#CC6A1A] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Sign In / Register</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRadarLoginModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;