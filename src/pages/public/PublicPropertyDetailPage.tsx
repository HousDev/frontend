// PublicPropertyDetailPage.tsx
import React, { useEffect, useState } from 'react';

import {
  ArrowLeft,
  MapPin,
  Building,
  Car,
  Wifi,
  Dumbbell,
  Shield,
  TreePine,
  Waves,
  Home,
  DollarSign,
  Eye,
  Heart,
  Share,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  User,
  Star,
  CheckCircle,
  Camera,
  Video,
  Download,
  Bookmark,
  Flag,
  Info,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
  Users,
  Globe,
  Zap,
  Crown,
  Gem,
  Bot,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  Calculator,
  PieChart,
  Lock,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AIPaywallOverlay from '@/components/paywall/AIPaywallOverlay';
import { useNavigate, useParams } from 'react-router-dom';
import propertiesAPI from '@/lib/propertiesAPI';
import { FaWhatsapp } from 'react-icons/fa';
import viewsAPI from '@/lib/viewAPI';
import ShareModal from './ShareModal';

// NEW: import viewsAPI (as you asked)

type RawProperty = any;

const PublicPropertyDetailPage = ({ property: propertyProp, onBack }: any) => {
  const [open, setOpen] = useState(false);
  // UI state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<'ai-recommendations' | 'ai-investment' | 'premium-details'>('ai-recommendations');
  const [hasSubscription, setHasSubscription] = useState(false); // This would come from user context
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context
  // add near other hooks / state
  const hasRecordedViewRef = React.useRef<{ [key: string]: boolean }>({});

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  // route param
  const { slug } = useParams();
  const navigate = useNavigate();
  // local property state used across the component
  const [property, setProperty] = useState<any>(null);
  console.log("sellername ", property?.agent?.seller_name);
  // helper: display value or dash
  const displayOrDash = (val: any) => {
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) return ' - ';
    if (typeof val === 'number' && !Number.isFinite(val)) return ' - ';
    return val;
  };

  // currency formatter
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return ' - ';
    if (!Number.isFinite(amount)) return ' - ';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Normalize amenities into array
  const normalizeAmenities = (p: RawProperty): string[] => {
    if (Array.isArray(p?.amenities) && p.amenities.length) return p.amenities.map(String);
    if (Array.isArray(p?.features) && p.features.length) return p.features.map(String);
    if (typeof p?.amenities === 'string' && p.amenities.trim()) {
      return p.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    // fallback to known keys from other APIs
    if (Array.isArray(p?.amenityList) && p.amenityList.length) return p.amenityList.map(String);
    return [];
  };

  const extractLocalityCity = (addr: any): string => {
    if (!addr && addr !== '') return ' - ';
    // If object with explicit fields
    if (typeof addr === 'object') {
      const locality = (addr?.locality ?? addr?.neighborhood ?? addr?.subLocality ?? addr?.area ?? '').toString().trim();
      const city = (addr?.city ?? addr?.town ?? addr?.district ?? addr?.region ?? addr?.state ?? '').toString().trim();
      if (locality && city) return `${locality}, ${city}`;
      if (city) return city;
      if (locality) return locality;
    }

    // If string, split by common separators and pick last two meaningful parts
    if (typeof addr === 'string') {
      // normalize separators and remove extra whitespace/newlines
      const cleaned = addr.replace(/\r?\n/g, ',').replace(/[-|\/]+/g, ',').replace(/\s+/g, ' ').trim();
      // split into comma parts
      const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return ' - ';
      if (parts.length === 1) return parts[0];
      // Try to pick last two parts which typically are locality and city
      const last = parts[parts.length - 1];
      const secondLast = parts[parts.length - 2];
      // If last part looks like a pincode (all digits), drop it and take previous two
      const isPincode = (s: string) => /^\d{5,6}$/.test(s.replace(/\s+/g, ''));
      if (isPincode(last)) {
        // drop last and attempt again
        const withoutPin = parts.slice(0, -1);
        if (withoutPin.length >= 2) {
          return `${withoutPin[withoutPin.length - 2]}, ${withoutPin[withoutPin.length - 1]}`;
        }
        return withoutPin[withoutPin.length - 1] ?? withoutPin[0] ?? ' - ';
      }
      return `${secondLast}, ${last}`;
    }

    return ' - ';
  };

  // Normalize incoming raw property to the canonical shape we use everywhere
  const normalizeProperty = (p: RawProperty) => {
    if (!p) return null;

    const price = Number(p?.budget ?? p?.price ?? p?.amount ?? p?.listing_price ?? p?.listingPrice);
    // square_feet derived from multiple possible fields
    const sqftCandidates = [
      p?.carpet_area,
      p?.builtup_area,
      p?.area,
      p?.super_builtup_area,
      p?.sqft,
      p?.square_feet,
      p?.size
    ];
    const sqft = sqftCandidates.reduce<number | undefined>((acc, cur) => {
      if (acc !== undefined) return acc;
      if (cur === undefined || cur === null) return acc;
      const n = Number(cur);
      return Number.isFinite(n) && n > 0 ? n : acc;
    }, undefined);

    const images: string[] = Array.isArray(p?.images) ? p.images
      : Array.isArray(p?.photos) ? p.photos
        : Array.isArray(p?.photoUrls) ? p.photoUrls
          : Array.isArray(p?.media) ? p.media.map((m: any) => m?.url ?? m) : [];

    // original location input might be in different shapes: string, object, fields
    const rawLocation = p?.location ?? p?.address ?? p?.place ?? p?.locality ?? p;

    // detect created / publication date from many possible keys
    const createdAtRaw = p?.created_at ?? p?.publication_date ?? p?.createdAt ?? p?.created_at_at ?? p?.created_at_date ?? p?.created_at_timestamp ?? p?.published_at ?? null;

    // helper: safe parse date -> returns Date or null
    const parseDateSafe = (d: any): Date | null => {
      if (!d && d !== 0) return null;

      // if it's already a Date
      if (d instanceof Date && !isNaN(d.getTime())) return d;

      // numeric timestamp (seconds or milliseconds)
      if (typeof d === 'number' && Number.isFinite(d)) {
        // heuristics: if it's in seconds (10 digits) convert to ms
        if (d < 1e12) return new Date(d * 1000);
        return new Date(d);
      }

      // string
      if (typeof d === 'string') {
        const s = d.trim();

        // Try ISO parse first
        const iso = new Date(s);
        if (!isNaN(iso.getTime())) return iso;

        // Try numeric string
        const asNum = Number(s.replace(/[^\d]/g, ''));
        if (!isNaN(asNum) && asNum > 0) {
          if (asNum < 1e12) return new Date(asNum * 1000);
          return new Date(asNum);
        }
      }

      return null;
    };

    const createdAtDate = parseDateSafe(createdAtRaw);

    // compute days since creation (rounded down). if createdAtDate missing => undefined
    const computeDaysAgo = (dt: Date | null): number | undefined => {
      if (!dt) return undefined;
      const now = Date.now();
      const diffMs = now - dt.getTime();
      if (!Number.isFinite(diffMs)) return undefined;
      // if created in future, treat as 0 (Today)
      if (diffMs < 0) return 0;
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    };

    const listedDaysFromCreated = computeDaysAgo(createdAtDate);

    // build normalized object but preserve original fields
    const normalized: any = {
      raw: p,
      id: p?.id ?? p?.property_id ?? p?.uuid ?? p?.slug ?? null,
      title: p?.title ?? p?.name ?? p?.headline ?? '',
      type: p?.type ?? p?.property_type ?? p?.property_type_name ?? '',
      unitType: p?.unitType ?? p?.unit_type ?? p?.unit ?? '',
      subtype: p?.subtype ?? p?.property_subtype_name ?? p?.property_subtype ?? '',
      location: rawLocation,
      locationNormalized: extractLocalityCity(rawLocation),
      price: Number.isFinite(price) ? price : undefined,
      square_feet: sqft,
      area: sqft, // alias
      bedrooms: Number(p?.bedrooms ?? p?.beds ?? p?.bhk ?? 0) || undefined,
      bathrooms: Number(p?.bathrooms ?? p?.baths ?? p?.washrooms ?? 0) || undefined,
      parking: Number(p?.parking ?? p?.parking_spots ?? p?.car_parking ?? 0) || undefined,
      amenities: normalizeAmenities(p),
      images: images.length ? images : undefined,
      photos: images.length ? images : undefined,
      description: p?.description ?? p?.desc ?? p?.about ?? '',
      verified: Boolean(p?.verified ?? p?.is_verified ?? p?.isVerified),
      featured: Boolean(p?.featured ?? p?.is_featured ?? p?.isFeatured),
      badge: p?.featured || p?.is_featured || p?.isFeatured ? 'Premium' : (p?.badge ?? 'Standard'),
      views: Number(p?.views ?? p?.view_count ?? p?.totalViews) || undefined,
      // Ensure listedDays is set either from explicit fields or computed from created_at
      listedDays: (() => {
        const rawDays = p?.listedDays ?? p?.listed_days ?? p?.days_listed;
        // prefer explicit numeric-like values
        const n = Number(rawDays);
        if (Number.isFinite(n) && n >= 0) return Math.floor(n);
        // else fallback to computed value (may be undefined)
        return listedDaysFromCreated;
      })(),
      possession: p?.possession ?? p?.possession_status ?? p?.possessionStatus ?? '',
      furnishing: p?.furnishing ?? p?.furnishing_status ?? '',
      builtYear: p?.builtYear ?? p?.year_built ?? p?.construction_year ?? '',
      facing: p?.facing ?? p?.direction ?? '',
      agent: {
        name: p?.agent?.name ?? p?.seller_name ?? '',
        phone: p?.agent?.phone ?? p?.broker?.phone ?? p?.contact_phone ?? ''
      },
      aiScore: p?.aiScore ?? p?.score,
      priceGrowth: p?.priceGrowth,
      investmentGrade: p?.investmentGrade,
      property_status: p?.property_status || p?.status,
      possessionMonth: p?.possession_month ?? p?.possessionMonth ?? null,
      possessionYear: p?.possession_year ?? p?.possessionYear ?? null,
      created_at: createdAtRaw ?? null,
    };

    return normalized;
  };

  const formatDaysAgo = (days?: number | null) => {
    if (days === null || days === undefined) return ' - ';
    const n = Number(days);
    if (!Number.isFinite(n) || n < 0) return ' - ';
    if (n === 0) return 'Today';
    if (n === 1) return '1 day ago';
    return `${n} days ago`;
  };

  // Initialize from prop if provided (normalize)
  useEffect(() => {
    if (propertyProp) {
      const normalized = normalizeProperty(propertyProp);
      setProperty(normalized);

    }
  }, [propertyProp]);

  // loading state: if prop exists, no need to show loading initially
  const [loading, setLoading] = useState<boolean>(() => propertyProp ? false : true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await propertiesAPI.getPropertyBySlug(slug as string);
        // handle both shapes: res or res.data
        const payload = res?.data ?? res ?? null;
        const normalized = normalizeProperty(payload);
        setProperty(normalized);
      } catch (err) {
        console.error("Error fetching property:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if parent didn't provide propertyProp (avoid unnecessary refetch)
    if (!propertyProp && slug) fetchProperty();
  }, [slug, propertyProp]);

  // ---- safe back handler: use parent callback if provided, otherwise fallback ----
  // ---- safe back handler: use parent callback if provided, otherwise fallback to navigate to /properties ----
  const handleBack = () => {
    if (typeof onBack === 'function') {
      try {
        onBack();
        return;
      } catch (err) {
        // ignore and fallback to navigate
        console.error('onBack threw:', err);
      }
    }

    // Prefer SPA navigation to /properties
    try {
      navigate('/properties');
    } catch (err) {
      // As a last resort, fallback to full-page redirect
      if (typeof window !== 'undefined') {
        window.location.href = '/properties';
      }
    }
  };

  // ------------------------
  // PAGE-VIEW RECORDING LOGIC (uses viewsAPI.recordView)
  // ------------------------

  // helper: extract numeric id if possible (falls back to leading number from slug)
  const resolvePropertyIdNumber = (normalized: any): number | null => {
    if (!normalized) return null;
    // Try common numeric fields from raw object first
    const raw = normalized.raw ?? {};
    const possible = [
      raw.id,
      raw.property_id,
      raw.id_number,
      normalized.id, // might be numeric or slug-like
    ];
    for (const v of possible) {
      if (v === undefined || v === null) continue;
      const n = Number(String(v).replace(/[^0-9]/g, ''));
      if (Number.isFinite(n) && n > 0) return n;
    }
    // If id is slug-like "307185-some-slug", try leading number
    const candidate = String(normalized.id || normalized.raw?.slug || normalized.raw?.id || '');
    const m = candidate.match(/^(\d+)(?:-|$)/);
    if (m) return Number(m[1]);
    return null;
  };

  // localStorage dedupe: avoid recording more than once in windowPerProperty minutes
  const recordView = async (normalizedProp: any, options?: { windowMinutes?: number }) => {
    if (!normalizedProp) return;
    const windowMinutes = options?.windowMinutes ?? 10;
    const propertyId = resolvePropertyIdNumber(normalizedProp);
    const slugId = normalizedProp?.raw?.slug ?? normalizedProp?.id ?? null;
    const dedupeKey = `viewed_property_${propertyId ?? slugId ?? String(Math.random()).slice(2)}`;

    // If we've already recorded this property in this component instance, skip
    const instanceKey = String(propertyId ?? slugId ?? 'unknown');
    if (hasRecordedViewRef.current[instanceKey]) {
      // But try to refresh count once (optional) — only if you want updated view count
      try {
        if (propertyId) {
          const resp = await viewsAPI.getByProperty(propertyId, false);
          if (resp?.success && resp?.total_views !== undefined) {
            setProperty((prev: any) => {
              if (!prev) return prev;
              // only update if changed
              if (prev.views === resp.total_views) return prev;
              return { ...prev, views: resp.total_views };
            });
          }
        } else if (slugId) {
          const resp = await propertiesAPI.getPropertyBySlug(slugId);
          const payload = resp?.data ?? resp ?? null;
          const normalized = normalizeProperty(payload);
          if (normalized?.views !== undefined) {
            setProperty((prev: any) => {
              if (!prev) return prev;
              if (prev.views === normalized.views) return prev;
              return { ...prev, views: normalized.views };
            });
          }
        }
      } catch (err) { /* ignore */ }
      return;
    }

    // localStorage dedupe check (same as you had)
    try {
      const last = localStorage.getItem(dedupeKey);
      if (last) {
        const lastTs = Number(last);
        if (!Number.isNaN(lastTs)) {
          const elapsed = Date.now() - lastTs;
          if (elapsed < windowMinutes * 60 * 1000) {
            // mark instance as recorded so effect won't re-trigger record
            hasRecordedViewRef.current[instanceKey] = true;
            // refresh views (same safe update)
            try {
              if (propertyId) {
                const resp = await viewsAPI.getByProperty(propertyId, false);
                if (resp?.success && resp?.total_views !== undefined) {
                  setProperty((prev: any) => {
                    if (!prev) return prev;
                    if (prev.views === resp.total_views) return prev;
                    return { ...prev, views: resp.total_views };
                  });
                }
              }
            } catch (err) { /* ignore */ }
            return;
          }
        }
      }
    } catch (err) {
      console.warn('localStorage unavailable for view dedupe:', err);
    }

    // Build payload & call record API
    const eventPayload: Record<string, any> = {
      source: 'client',
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      slug: slugId ?? null,
    };

    try {
      await viewsAPI.recordView(propertyId, eventPayload);
      // mark localStorage and instance flag
      try { localStorage.setItem(dedupeKey, String(Date.now())); } catch (err) { /* ignore */ }
      hasRecordedViewRef.current[instanceKey] = true;
    } catch (err) {
      console.warn('viewsAPI.recordView failed:', err);
    }

    // Refresh server-side count once, but only update state if changed
    try {
      if (propertyId) {
        const resp = await viewsAPI.getByProperty(propertyId, false);
        if (resp?.success && resp?.total_views !== undefined) {
          setProperty((prev: any) => {
            if (!prev) return prev;
            if (prev.views === resp.total_views) return prev;
            return { ...prev, views: resp.total_views };
          });
          return;
        }
      }
      if (slugId) {
        const resp = await propertiesAPI.getPropertyBySlug(slugId);
        const payload = resp?.data ?? resp ?? null;
        const normalized = normalizeProperty(payload);
        if (normalized?.views !== undefined) {
          setProperty((prev: any) => {
            if (!prev) return prev;
            if (prev.views === normalized.views) return prev;
            return { ...prev, views: normalized.views };
          });
        }
      }
    } catch (err) { /* ignore */ }
  };
  // --- Like (shortlist) toggle with localStorage persistence
  const likeKeyFor = (p: any) => {
    const numericId = resolvePropertyIdNumber(p);
    const slugId = p?.raw?.slug ?? p?.id ?? 'unknown';
    return `liked_property_${numericId ?? slugId}`;
  };

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!property) return;
    try {
      const val = localStorage.getItem(likeKeyFor(property));
      setLiked(val === '1');
    } catch { }
  }, [property]);

  const toggleLiked = (e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (!property) return;
    const key = likeKeyFor(property);
    setLiked((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(key, '1');
        else localStorage.removeItem(key);
      } catch { }
      return next;
    });
  };

  // When property is set, trigger view recording once
  useEffect(() => {
    if (!property) return;
    // compute a stable key for the property instance (use id if available)
    const instanceKey = String(resolvePropertyIdNumber(property) ?? property?.id ?? 'unknown');
    if (hasRecordedViewRef.current[instanceKey]) return;

    let aborted = false;
    (async () => {
      try {
        await recordView(property, { windowMinutes: 10 });
      } catch (err) {
        console.warn('recordView failed:', err);
      } finally {
        if (!aborted) {
          // nothing extra
        }
      }
    })();

    return () => { aborted = true; };
  }, [property]); // keep dependency but guarded by hasRecordedViewRef


  // ------------------------
  // END PAGE-VIEW RECORDING
  // ------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse text-gray-400">Loading property...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <Home className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist.
          </p>
          <button
            onClick={handleBack}
            className="bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-300"
          >
            Back to Properties
          </button>
        </div>

      </div>
    );
  }
  // support multiple shapes for images & amenities (from normalized property)
  const images: string[] = Array.isArray(property?.images) && property.images.length
    ? property.images
    : Array.isArray(property?.photos) && property.photos.length
      ? property.photos
      : [
        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
      ];

  const amenities: string[] = Array.isArray(property?.amenities) && property.amenities.length
    ? property.amenities
    : ['Swimming Pool', 'Gym', '24/7 Security', 'Private Garden', 'Covered Parking', 'High-speed Internet'];

  // prefer unitType keys
  const unitType = property?.unitType ?? '';
  const subtype = property?.subtype ?? '';

  const getAmenityIcon = (amenity: string) => {
    switch ((amenity || '').toLowerCase()) {
      case 'swimming pool': return <Waves className="text-blue-500" size={20} />;
      case 'gym': return <Dumbbell className="text-red-500" size={20} />;
      case 'security': case '24/7 security': return <Shield className="text-green-500" size={20} />;
      case 'garden': case 'private garden': return <TreePine className="text-green-500" size={20} />;
      case 'parking': case 'covered parking': return <Car className="text-gray-500" size={20} />;
      case 'wifi': case 'high-speed internet': return <Wifi className="text-purple-500" size={20} />;
      default: return <CheckCircle className="text-blue-500" size={20} />;
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    setShowContactForm(false);
    setContactForm({ name: '', phone: '', email: '', message: '' });
  };

  const handlePaywallOpen = (feature: 'ai-recommendations' | 'ai-investment' | 'premium-details') => {
    if (!isLoggedIn) {
      setPaywallFeature(feature);
      setShowPaywall(true);
      return;
    }
    setPaywallFeature(feature);
    setShowPaywall(true);
  };

  const handleSubscribe = (plan: string) => {
    setHasSubscription(true);
    console.log('Subscribed to plan:', plan);
    setShowPaywall(false);
  };

  // compute price per sq ft if available
  const priceValue = Number.isFinite(property?.price) ? property.price : undefined;
  const sqftValue = Number.isFinite(property?.square_feet) ? property.square_feet : undefined;
  const pricePerSqFt = (priceValue && sqftValue) ? Math.round(priceValue / sqftValue) : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b pt-20
      
      " style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between ">
            <button
              onClick={handleBack}
              className="flex items-center text-[#E6761D] hover:text-[#CC6A1A] transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Properties
            </button>


            <div className="flex items-center space-x-2">
              <button className="p-2 text-white hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                <Heart size={18} />
              </button>
              <button
                onClick={() => setOpen(true)}
                className="p-2 text-white hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100"
              >
                <Share size={18} />
              </button>
              <button className="p-2 text-white hover:text-yellow-500 transition-colors rounded-lg hover:bg-gray-100">
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-full h-80 md:h-[420px] lg:h-[520px] bg-gray-900 overflow-hidden">
              {/* Main image */}
              <img
                src={images[currentImageIndex]}
                alt={property?.title || "Property Image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/25" />

              {/* === TOP-LEFT overlay (Title + Badges + Location) === */}
              <div className="absolute top-3 left-3 z-20 text-white max-w-[85%] flex flex-col gap-1">
                {/* Title / Type / Subtype */}
                <div className="font-bold text-lg sm:text-xl truncate drop-shadow">
                  {property?.type && <span className="mr-2">{property.type}</span>}
                  {unitType && <span className="mr-2">{unitType}</span>}
                  {subtype && <span className="mr-2">{subtype}</span>}
                </div>

                {/* Location */}
                <div className="flex items-center text-sm sm:text-base drop-shadow">
                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate">
                    {displayOrDash(property?.locationNormalized)}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-1">
                  {property?.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                          text-[11px] font-bold uppercase tracking-wide text-white
                          shadow-sm ring-1 ring-black/5
                          bg-gradient-to-r from-orange-500 to-red-500">
                      <Zap className="w-3.5 h-3.5" />
                      FEATURED
                    </span>
                  )}
                  {property?.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                          text-[11px] font-bold uppercase tracking-wide text-white
                          shadow-sm ring-1 ring-black/5 bg-green-500">
                      <CheckCircle className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  )}
                </div>
              </div>

              {/* === TOP-RIGHT Like === */}
              <button
                onClick={toggleLiked}
                className="absolute top-3 right-3 z-20 p-2 rounded-full
               bg-white/90 backdrop-blur shadow-sm ring-1 ring-black/5
               hover:bg-white transition"
                aria-label={liked ? 'Remove from shortlist' : 'Add to shortlist'}
              >
                <Heart className={liked ? 'w-4 h-4 text-red-500 fill-current' : 'w-4 h-4 text-gray-700'} />
              </button>

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2
                   bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20 transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                   bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20 transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-3 right-3 z-20 bg-black/55 text-white px-2 py-1 rounded-full text-xs">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-colors ${idx === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* View Options */}
              <div className="absolute bottom-12 right-3 z-20 flex space-x-2">
                <button className="bg-white/95 text-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-white transition text-sm">
                  <Camera size={16} />
                  <span className="text-sm">Photos</span>
                </button>
                <button className="bg-white/95 text-gray-900 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-white transition text-sm">
                  <Video size={16} />
                  <span className="text-sm">Tour</span>
                </button>
              </div>
            </div>



            {/* Property Header */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                    {/* normalized display for type/unit/subtype */}
                    <div className="font-bold text-gray-900 text-lg sm:text-xl truncate">
                      {(() => {
                        const displayType = property?.type ?? '';
                        return displayType ? <span className="mr-2">{displayType}</span> : null;
                      })()}
                      {unitType ? <span className="mr-2">{unitType}</span> : null}
                      {subtype ? <span className="mr-2">{subtype}</span> : null}
                    </div>

                    {property?.verified && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs mt-2 sm:mt-0 shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 mb-2 text-sm sm:text-base">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="truncate">{displayOrDash(property?.locationNormalized)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center whitespace-nowrap">
                      <Eye className="w-3.5 h-3.5 mr-1 shrink-0" />
                      <span className="truncate">{displayOrDash(property?.views ?? ' - ')} views</span>
                    </span>

                    <span className="flex items-center whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                      <span>{formatDaysAgo(property?.listedDays)}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 md:ml-4 text-left md:text-right flex-shrink-0">
                  <div className="text-xl font-bold text-green-600 leading-tight">
                    {formatCurrency(property?.price)}
                  </div>
                  <div className="text-sm sm:text-base text-gray-500 mt-1">
                    {pricePerSqFt ? `₹${pricePerSqFt.toLocaleString('en-IN')}/sq ft` : ' - '}
                  </div>
                </div>
              </div>


              {/* AI Insights Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">AI Property Analysis</h3>
                    {hasSubscription || !isLoggedIn ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">AI Score: </span>
                          <span className="font-bold text-purple-600">{displayOrDash(property?.aiScore ?? '94')}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Growth: </span>
                          <span className="font-bold text-green-600">{displayOrDash(property?.priceGrowth ?? '+12.5%')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Investment: </span>
                          <span className="font-bold text-blue-600">{displayOrDash(property?.investmentGrade ?? 'A+')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">ROI Potential: </span>
                          <span className="font-bold text-orange-600">18.2%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm blur-sm">
                          <div>
                            <span className="text-gray-600">AI Score: </span>
                            <span className="font-bold text-purple-600">••/100</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Growth: </span>
                            <span className="font-bold text-green-600">+••.•%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Investment: </span>
                            <span className="font-bold text-blue-600">••</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ROI Potential: </span>
                            <span className="font-bold text-orange-600">••.•%</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => handlePaywallOpen('ai-investment')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                          >
                            <Lock size={16} />
                            <span>Unlock AI Analysis - ₹299</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{displayOrDash(property?.bedrooms ?? 4)}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{displayOrDash(property?.bathrooms ?? 3)}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{displayOrDash(property?.area ?? property?.square_feet ?? 1200)}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{displayOrDash(property?.parking ?? 2)}</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              </div>

              {/* Property Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {displayOrDash(property?.type) === ' - ' ? ' - ' : property?.type}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property?.property_status}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {displayOrDash(property?.furnishing) === ' - ' ? ' - ' : property?.furnishing || ' - '}
                </span>
              </div>
            </div>

            {/* ... rest of UI remains unchanged ... */}

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-5 relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
              </div>

              {hasSubscription ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="text-green-600" size={18} />
                      <span className="font-semibold text-green-800">Price Appreciation</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">+15.2%</div>
                    <div className="text-sm text-green-700">Expected in next 12 months</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <PieChart className="text-blue-600" size={18} />
                      <span className="font-semibold text-blue-800">Market Position</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">Top 10%</div>
                    <div className="text-sm text-blue-700">In this locality</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="text-orange-600" size={18} />
                      <span className="font-semibold text-orange-800">Investment Timing</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">Excellent</div>
                    <div className="text-sm text-orange-700">Buy now recommended</div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 blur-md">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="text-green-600" size={18} />
                        <span className="font-semibold text-green-800">Price Appreciation</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">+••.•%</div>
                      <div className="text-sm text-green-700">Expected in next 12 months</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <PieChart className="text-blue-600" size={18} />
                        <span className="font-semibold text-blue-800">Market Position</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">Top ••%</div>
                      <div className="text-sm text-blue-700">In this locality</div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="text-orange-600" size={18} />
                        <span className="font-semibold text-orange-800">Investment Timing</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">••••••••</div>
                      <div className="text-sm text-orange-700">Buy now recommended</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white bg-opacity-95 p-6 rounded-xl shadow-lg border border-gray-200">
                      <Lock className="text-blue-600 mx-auto mb-3" size={20} />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Premium AI Insights</h3>
                      <p className="text-gray-600 mb-4">Get detailed recommendations and market analysis</p>
                      <button
                        onClick={() => handlePaywallOpen('ai-recommendations')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        Unlock for ₹299
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Property Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {displayOrDash(property?.description) === ' - '
                  ? ' - '
                  : property?.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Premium Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.length ? amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700 text-sm">{amenity}</span>
                  </div>
                )) : (
                  <div className="text-gray-500"> - </div>
                )}
              </div>
            </div>

            {/* Location & Nearby */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Location & Connectivity</h2>
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p>Interactive Map Coming Soon</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Transportation</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Bandra Station - 0.5 km</li>
                    <li>• Airport - 8 km</li>
                    <li>• Highway Access - 1 km</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Essential Services</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Shopping Mall - 0.3 km</li>
                    <li>• Hospital - 1.2 km</li>
                    <li>• School - 0.8 km</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-1 mr-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">4.8</span>
                <span className="text-gray-600 ml-2">(24 reviews)</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Rajesh Kumar', rating: 5, comment: 'Excellent property with great amenities. Highly recommended!', date: '2 days ago' },
                  { name: 'Priya Sharma', rating: 4, comment: 'Beautiful location and well-maintained property.', date: '1 week ago' },
                  { name: 'Amit Patel', rating: 5, comment: 'Perfect for families. Great connectivity and facilities.', date: '2 weeks ago' }
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{review.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-16">
              {/* Agent Info */}
              {/* Agent Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {displayOrDash(property?.agent?.name) === ' - '
                      ? ' - '
                      : property?.agent?.name || 'Rohit Sharma'}
                  </h3>
                  <p className="text-gray-600 text-sm">Senior Property Consultant</p>
                  <div className="flex items-center mt-1">
                    <Star size={14} className="text-yellow-400 fill-current mr-1" />
                    <span className="text-xs text-gray-600">4.9 (127 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Action Icons Row */}
              <div className="flex justify-between gap-3">
                {/* Call */}
                <button
                  className="relative flex-1 py-3 rounded-lg bg-blue-600 text-white flex items-center justify-center group transition-colors hover:bg-blue-700"
                >
                  <Phone size={18} />
                  <span className="absolute -bottom-8 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Call Agent
                  </span>
                </button>

                {/* Message */}
                <button
                  onClick={() => setShowContactForm(true)}
                  className="relative flex-1 py-3 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center group transition-colors hover:bg-gray-200"
                >
                  <MessageCircle size={18} />
                  <span className="absolute -bottom-8 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Message
                  </span>
                </button>

                {/* Schedule */}
                <button
                  className="relative flex-1 py-3 rounded-lg bg-green-600 text-white flex items-center justify-center group transition-colors hover:bg-green-700"
                >
                  <Calendar size={18} />
                  <span className="absolute -bottom-8 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Schedule Visit
                  </span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => {
                    const message = `Hi! I'm interested in ${property?.title} at ${property?.locationNormalized}. Price: ${formatCurrency(
                      property?.price ?? 0
                    )}. Can you provide more details?`;
                    if (typeof window !== 'undefined') {
                      window.open(
                        `https://wa.me/919999999999?text=${encodeURIComponent(message)}`,
                        '_blank'
                      );
                    }
                  }}
                  className="relative flex-1 py-3 rounded-lg bg-green-500 text-white flex items-center justify-center group transition-colors hover:bg-green-600"
                >
                  <FaWhatsapp size={18} />
                  <span className="absolute -bottom-8 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    WhatsApp
                  </span>
                </button>
              </div>

            </div>



            {/* AI Investment Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm p-5 relative">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="text-purple-600" size={20} />
                <h3 className="font-bold text-gray-900">AI Investment Analysis</h3>
              </div>

              {hasSubscription ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Purchase Recommendation</span>
                      <span className="font-bold text-green-600">Strong Buy</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expected ROI (5 years)</span>
                      <span className="font-bold text-blue-600">18.2%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Risk Level</span>
                      <span className="font-bold text-yellow-600">Low</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Market Timing</span>
                      <span className="font-bold text-purple-600">Excellent</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="text-purple-600 mt-0.5" size={16} />
                      <div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <strong>AI Insight:</strong> This property is in the top 5% for investment potential in this area. Current market conditions favor immediate purchase.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="space-y-3 blur-sm">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Purchase Recommendation</span>
                        <span className="font-bold text-green-600">•••••• •••</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expected ROI (5 years)</span>
                        <span className="font-bold text-blue-600">••.•%</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Risk Level</span>
                        <span className="font-bold text-yellow-600">•••</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Market Timing</span>
                        <span className="font-bold text-purple-600">••••••••••</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-200">
                      <Crown className="text-purple-600 mx-auto mb-2" size={20} />
                      <h4 className="font-bold text-gray-900 mb-1">Investment Analysis</h4>
                      <p className="text-xs text-gray-600 mb-3">Get AI-powered investment insights</p>
                      <button
                        onClick={() => handlePaywallOpen('ai-investment')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                      >
                        Unlock ₹299
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Property Highlights */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Property Highlights</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Property Type</span>
                  </div>
                  <div className="font-semibold text-gray-900">{displayOrDash(property?.type) === ' - ' ? ' - ' : property?.type || 'Villa'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Built Year</span>
                  </div>
                  {/* {property.possessionMonth  } */}
                  <div className="font-semibold text-gray-900">{property.possessionYear}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Home className="text-purple-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Furnishing</span>
                  </div>
                  <div className="font-semibold text-gray-900">{displayOrDash(property?.furnishing) === ' - ' ? ' - ' : property?.furnishing || 'Semi-Furnished'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Facing</span>
                  </div>
                  <div className="font-semibold text-gray-900">{displayOrDash(property?.facing) === ' - ' ? ' - ' : property?.facing || 'North-East'}</div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium text-gray-900">{formatCurrency(property?.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Maintenance (Annual)</span>
                  <span className="font-medium text-gray-900">₹2.4L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Registration</span>
                  <span className="font-medium text-gray-900">₹2.5L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stamp Duty</span>
                  <span className="font-medium text-gray-900">₹15L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Society Charges</span>
                  <span className="font-medium text-gray-900">₹3L</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Cost</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {formatCurrency((property?.price ?? 25000000) + 240000 + 250000 + 1500000 + 300000)}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Calculator size={16} className="mr-1" />
                  Smart EMI Calculator
                </h4>
                <div className="text-sm text-blue-800">
                  <p>For ₹20L loan at 8.5% for 20 years:</p>
                  <p className="font-bold">Monthly EMI: ₹17,456</p>
                </div>
              </div>
            </div>

            {/* Interest & Shortlisted */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Property Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Total Views</span>
                  </div>
                  <span className="font-bold text-green-600">{displayOrDash(property?.views) === ' - ' ? ' - ' : property?.views}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Shortlisted By</span>
                  </div>
                  <span className="font-bold text-blue-600">23 People</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Phone className="text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Contact Requests</span>
                  </div>
                  <span className="font-bold text-orange-600">12 This Week</span>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Similar Properties</h3>
              <div className="space-y-4">
                {[
                  { title: 'Modern Apartment', price: 18000000, location: 'Andheri West', image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg' },
                  { title: 'Luxury Penthouse', price: 35000000, location: 'Worli', image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg' }
                ].map((similar, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                    <img src={similar.image} alt={similar.title} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{similar.title}</h4>
                      <p className="text-xs text-gray-600 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {similar.location}
                      </p>
                      <p className="text-xs font-semibold text-blue-600">{formatCurrency(similar.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Contact Agent</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="I'm interested in this property..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <AIPaywallOverlay
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
        featureType={paywallFeature}
      />
      {open && (
        (() => {
          // Build the same title you show in the UI (type + unitType + subtype)
          const displayType = property?.type ?? '';
          const titleParts = [
            displayType,
            property?.unitType ?? '',
            property?.subtype ?? ''
          ].map(s => (s || '').toString().trim()).filter(Boolean);
          const shareTitle = titleParts.length ? titleParts.join(' ') : (property?.title || 'Property Listing');

          // Build description & image as before
          const shareDescription =
            property?.description && property.description !== ''
              ? property.description
              : (property?.raw?.description ?? property?.raw?.short_description ?? '');

          const shareImage =
            (Array.isArray(property?.images) && property.images[0]) ||
            (Array.isArray(property?.photos) && property.photos[0]) ||
            property?.raw?.image ||
            property?.raw?.photo ||
            '';

          const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

          return (
            <ShareModal
              url={shareUrl}
              title={shareTitle}
              description={shareDescription}
              image={shareImage}
              onClose={() => setOpen(false)}
            />
          );
        })()
      )}

    </div>
  );
};

export default PublicPropertyDetailPage;
