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
  ChevronRight,
  BedDouble, Bath, Ruler, IndianRupee, Grid
} from 'lucide-react';
import AIPaywallOverlay from '@/components/paywall/AIPaywallOverlay';
import { useNavigate, useParams } from 'react-router-dom';
import propertiesAPI from '@/lib/propertiesAPI';
import { FaWhatsapp } from 'react-icons/fa';
import viewsAPI from '@/lib/viewAPI';
import ShareModal from './ShareModal';
import PhotoGalleryModal from './PhotoGalleryModal';
import FurnishingPill from '@/components/properties/FurnishingPill';
import AmenityPill from '@/components/properties/AmenityPill';

type RawProperty = any;

const PublicPropertyDetailPage = ({ property: propertyProp, onBack }: any) => {
  const [open, setOpen] = useState(false);
  // UI state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<'ai-recommendations' | 'ai-investment' | 'premium-details'>('ai-recommendations');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
 
  // add near other hooks / state
  const hasRecordedViewRef = React.useRef<{ [key: string]: boolean }>({});

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  // Add this state near your other useState declarations (around line 60)
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [photoGalleryStartIndex, setPhotoGalleryStartIndex] = useState(0);
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

  // === NEW: tiny helpers for calling / whatsapp ===
  const getAgentPhone = () => {
    const raw = property?.agent?.phone || "";
    const digits = (raw || "").replace(/\D/g, "");
    return digits || "9999999999"; // fallback if nothing present
  };
  const callAgent = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const phone = getAgentPhone();
    if (!phone) return;
    if (typeof window !== "undefined") window.location.href = `tel:${phone}`;
  };

  // Normalize amenities into array
  const normalizeAmenities = (p: RawProperty): string[] => {
    if (Array.isArray(p?.amenities) && p.amenities.length) return p.amenities.map(String);
    if (Array.isArray(p?.features) && p.features.length) return p.features.map(String);
    if (typeof p?.amenities === 'string' && p.amenities.trim()) {
      return p.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (Array.isArray(p?.amenityList) && p.amenityList.length) return p.amenityList.map(String);
    return [];
  };

  const extractLocalityCity = (addr: any): string => {
    if (!addr && addr !== '') return ' - ';
    if (typeof addr === 'object') {
      const locality = (addr?.locality ?? addr?.neighborhood ?? addr?.subLocality ?? addr?.area ?? '').toString().trim();
      const city = (addr?.city ?? addr?.town ?? addr?.district ?? addr?.region ?? addr?.state ?? '').toString().trim();
      if (locality && city) return `${locality}, ${city}`;
      if (city) return city;
      if (locality) return locality;
    }
    if (typeof addr === 'string') {
      const cleaned = addr.replace(/\r?\n/g, ',').replace(/[-|\/]+/g, ',').replace(/\s+/g, ' ').trim();
      const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return ' - ';
      if (parts.length === 1) return parts[0];
      const last = parts[parts.length - 1];
      const secondLast = parts[parts.length - 2];
      const isPincode = (s: string) => /^\d{5,6}$/.test(s.replace(/\s+/g, ''));
      if (isPincode(last)) {
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

    const rawLocation = p?.location ?? p?.address ?? p?.place ?? p?.locality ?? p;

    const createdAtRaw = p?.created_at ?? p?.publication_date ?? p?.createdAt ?? p?.created_at_at ?? p?.created_at_date ?? p?.created_at_timestamp ?? p?.published_at ?? null;

    const parseDateSafe = (d: any): Date | null => {
      if (!d && d !== 0) return null;
      if (d instanceof Date && !isNaN(d.getTime())) return d;
      if (typeof d === 'number' && Number.isFinite(d)) {
        if (d < 1e12) return new Date(d * 1000);
        return new Date(d);
      }
      if (typeof d === 'string') {
        const s = d.trim();
        const iso = new Date(s);
        if (!isNaN(iso.getTime())) return iso;
        const asNum = Number(s.replace(/[^\d]/g, ''));
        if (!isNaN(asNum) && asNum > 0) {
          if (asNum < 1e12) return new Date(asNum * 1000);
          return new Date(asNum);
        }
      }
      return null;
    };

    const createdAtDate = parseDateSafe(createdAtRaw);

    const computeDaysAgo = (dt: Date | null): number | undefined => {
      if (!dt) return undefined;
      const now = Date.now();
      const diffMs = now - dt.getTime();
      if (!Number.isFinite(diffMs)) return undefined;
      if (diffMs < 0) return 0;
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    };

    const listedDaysFromCreated = computeDaysAgo(createdAtDate);

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
      listedDays: (() => {
        const rawDays = p?.listedDays ?? p?.listed_days ?? p?.days_listed;
        const n = Number(rawDays);
        if (Number.isFinite(n) && n >= 0) return Math.floor(n);
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
        const res = await propertiesAPI.PublicgetPropertyBySlug(slug as string);
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

    if (!propertyProp && slug) fetchProperty();
  }, [slug, propertyProp]);

  const handleBack = () => {
    if (typeof onBack === 'function') {
      try {
        onBack();
        return;
      } catch (err) {
        console.error('onBack threw:', err);
      }
    }
    try {
      navigate('/properties');
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.location.href = '/properties';
      }
    }
  };

  // ------------------------
  // PAGE-VIEW RECORDING LOGIC (uses viewsAPI.recordView)
  // ------------------------

  const resolvePropertyIdNumber = (normalized: any): number | null => {
    if (!normalized) return null;
    const raw = normalized.raw ?? {};
    const possible = [
      raw.id,
      raw.property_id,
      raw.id_number,
      normalized.id,
    ];
    for (const v of possible) {
      if (v === undefined || v === null) continue;
      const n = Number(String(v).replace(/[^0-9]/g, ''));
      if (Number.isFinite(n) && n > 0) return n;
    }
    const candidate = String(normalized.id || normalized.raw?.slug || normalized.raw?.id || '');
    const m = candidate.match(/^(\d+)(?:-|$)/);
    if (m) return Number(m[1]);
    return null;
  };

  const recordView = async (normalizedProp: any, options?: { windowMinutes?: number }) => {
    if (!normalizedProp) return;
    const windowMinutes = options?.windowMinutes ?? 10;
    const propertyId = resolvePropertyIdNumber(normalizedProp);
    const slugId = normalizedProp?.raw?.slug ?? normalizedProp?.id ?? null;
    const dedupeKey = `viewed_property_${propertyId ?? slugId ?? String(Math.random()).slice(2)}`;

    const instanceKey = String(propertyId ?? slugId ?? 'unknown');
    if (hasRecordedViewRef.current[instanceKey]) {
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
        } else if (slugId) {
          const resp = await propertiesAPI.PublicgetPropertyBySlug(slugId);
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

    try {
      const last = localStorage.getItem(dedupeKey);
      if (last) {
        const lastTs = Number(last);
        if (!Number.isNaN(lastTs)) {
          const elapsed = Date.now() - lastTs;
          if (elapsed < windowMinutes * 60 * 1000) {
            hasRecordedViewRef.current[instanceKey] = true;
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

    const eventPayload: Record<string, any> = {
      source: 'client',
      path: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      slug: slugId ?? null,
    };

    try {
      await viewsAPI.recordView(propertyId, eventPayload);
      try { localStorage.setItem(dedupeKey, String(Date.now())); } catch (err) { /* ignore */ }
      hasRecordedViewRef.current[instanceKey] = true;
    } catch (err) {
      console.warn('viewsAPI.recordView failed:', err);
    }

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
        const resp = await propertiesAPI.PublicgetPropertyBySlug(slugId);
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


  const getMonthName = (value?: string | number | null) => {
    if (!value) return "";
    const month = typeof value === "string" ? parseInt(value) : value;
    if (isNaN(month) || month < 1 || month > 12) return "";
    return new Date(0, month - 1).toLocaleString("en", { month: "long" });
  };

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
  }, [property]);

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
  const images: string[] = Array.isArray(property?.images) && property.images.length
    ? property.images
    : Array.isArray(property?.photos) && property.photos.length
      ? property.photos
      : [
        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
      ];

  const unitType = property?.unitType ?? '';
  const subtype = property?.subtype ?? '';


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

  const priceValue = Number.isFinite(property?.price) ? property.price : undefined;
  const sqftValue = Number.isFinite(property?.square_feet) ? property.square_feet : undefined;
  const pricePerSqFt = (priceValue && sqftValue) ? Math.round(priceValue / sqftValue) : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (hidden on mobile) */}
      <div
        className=" bg-white shadow-sm border-b pt-20 sticky top-0 z-40 mb-1"
        style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between ">
            <button
              onClick={handleBack}
              className="flex items-center text-white hover:text-[#CC6A1A] transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Properties
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-6 pt-0 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Image Carousel - Responsive */}
            <div className="relative w-full h-64 sm:h-80 md:h-[420px] lg:h-[520px] bg-gray-900 overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl ring-1 ring-black/10 group">
              <img
                src={images[currentImageIndex]}
                alt={property?.title || "Property Image"}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

              {/* Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none select-none z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                  <div className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap drop-shadow-2xl">
                    ResaleExpert.in
                  </div>
                </div>
              </div>

              {/* Top-Left Info - Responsive */}
              <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-20 text-white max-w-[75%] sm:max-w-[85%] flex flex-col gap-1">
                <div className="font-bold text-base sm:text-lg md:text-xl truncate drop-shadow">
                  {property?.type && <span className="mr-1 sm:mr-2">{property.type}</span>}
                  {unitType && <span className="mr-1 sm:mr-2">{unitType}</span>}
                  {subtype && <span className="mr-1 sm:mr-2">{subtype}</span>}
                </div>

                <div className="flex items-center text-xs sm:text-sm md:text-base drop-shadow">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 shrink-0" />
                  <span className="truncate">{displayOrDash(property?.locationNormalized)}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  {property?.featured && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
                    text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white
                    shadow-lg ring-1 sm:ring-2 ring-white/20 backdrop-blur-sm animate-pulse">
                      <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">FEATURED</span>
                    </span>
                  )}
                  {property?.verified && (
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
                    text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white
                    shadow-lg ring-1 sm:ring-2 ring-white/20 bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm">
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden xs:inline">VERIFIED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Top-Right Action Buttons - Responsive */}
              <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-20 flex flex-col space-y-1.5 sm:space-y-2">
                <button
                  onClick={toggleLiked}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200"
                  aria-label={liked ? 'Remove from shortlist' : 'Add to shortlist'}
                >
                  <Heart className={liked ? 'w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-current' : 'w-4 h-4 sm:w-5 sm:h-5 text-gray-700'} />
                </button>

                <button
                  onClick={() => setOpen(true)}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200"
                  aria-label="Share property"
                >
                  <Share className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>

                <button
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200"
                  aria-label="Bookmark property"
                >
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </div>

              {/* Bottom-Left Price - Responsive */}
              <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-2 sm:left-3 md:left-4 z-20 w-[90%]">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-5 items-start sm:items-center">
                  <div className="flex flex-col text-left">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                      {formatCurrency(property?.price)}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-white mt-0.5 sm:mt-1">
                      {pricePerSqFt ? `₹${pricePerSqFt.toLocaleString('en-IN')}/sq ft` : ' - '}
                    </div>
                  </div>

                  <div className="flex flex-col items-left">
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-white">
                      Carpet Area
                    </span>
                    <span className="text-xs sm:text-sm md:text-base text-white">
                      {displayOrDash(property?.square_feet)} sq ft
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows - Responsive */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2
                    bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 sm:p-2.5 md:p-3 rounded-full z-20 
                    transition-all duration-200 shadow-xl ring-1 ring-white/30 hover:scale-110"
                  >
                    <ChevronLeft size={12} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((p) => (p + 1) % images.length)}
                    className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2
                    bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 sm:p-2.5 md:p-3 rounded-full z-20 
                    transition-all duration-200 shadow-xl ring-1 ring-white/30 hover:scale-110"
                  >
                    <ChevronRight size={12} className="sm:w-4 sm:h-4" />
                  </button>
                </>
              )}

              {/* Image Counter - Responsive */}
              <div className="absolute bottom-3 sm:bottom-4 right-2 sm:right-3 md:right-4 z-20 bg-gradient-to-r from-slate-900/70 to-black/60 backdrop-blur-md text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs shadow-lg ring-1 ring-white/20">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Dot Indicators - Responsive */}
              {images.length > 1 && images.length <= 8 && (
                <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex
                        ? "bg-white w-6 sm:w-8 shadow-lg"
                        : "bg-white/50 hover:bg-white/75"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* View Options Buttons - Responsive */}
              <div className="absolute bottom-14 sm:bottom-16 right-2 sm:right-3 md:right-4 z-20 flex space-x-1.5 sm:space-x-2">
                <button
                  onClick={() => {
                    setPhotoGalleryStartIndex(currentImageIndex);
                    setShowPhotoGallery(true);
                  }}
                  className="bg-white/95 backdrop-blur-md text-gray-900 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1 hover:bg-white hover:scale-105 transition-all duration-200 text-[10px] sm:text-xs font-semibold shadow-xl border border-white/60"
                >
                  <Camera size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Photos</span>
                </button>
                {showPhotoGallery && (
                  <PhotoGalleryModal
                    images={images}
                    isOpen={showPhotoGallery}
                    onClose={() => setShowPhotoGallery(false)}
                    initialIndex={photoGalleryStartIndex}
                  />
                )}
                <button className="bg-white/95 backdrop-blur-md text-gray-900 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1 hover:bg-white hover:scale-105 transition-all duration-200 text-[10px] sm:text-xs font-semibold shadow-xl border border-white/60">
                  <Video size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Tour</span>
                </button>
              </div>
            </div>

            {/* Property Details Section - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 !mt-3 sm:!mt-4 ring-1 ring-gray-100">
              {/* Description - Responsive */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Property Description</h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                  {displayOrDash(property?.description) === ' - ' ? ' - ' : property?.description}
                </p>
              </div>

              {/* Property Details Grid - Fully Responsive */}
              <div className="bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all ring-1 ring-gray-100">
                <div className="px-3 sm:px-4 md:px-5 pt-3 sm:pt-4">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">
                    Property Details
                  </h3>
                </div>

                <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="font-semibold text-gray-800">Property type:</span>
                      <span className="text-gray-600 ml-1 break-words">{displayOrDash(property?.type)}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">Unit Type:</span>
                      <span className="text-gray-600 ml-1 break-words">{displayOrDash(property?.unitType)}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">Subtype:</span>
                      <span className="text-gray-600 ml-1 break-words">{displayOrDash(property?.subtype)}</span>
                    </div>

                    {property?.raw?.wing && (
                      <div>
                        <span className="font-semibold text-gray-800">Wing:</span>
                        <span className="text-gray-600 ml-1 break-words">{displayOrDash(property.raw.wing)}</span>
                      </div>
                    )}

                    {property?.raw?.unitNo && (
                      <div>
                        <span className="font-semibold text-gray-800">Unit No:</span>
                        <span className="text-gray-600 ml-1 break-words">{displayOrDash(property.raw.unitNo)}</span>
                      </div>
                    )}

                    {(property?.raw?.floor || property?.raw?.totalFloors) && (
                      <div>
                        <span className="font-semibold text-gray-800">Floor:</span>
                        <span className="text-gray-600 ml-1">
                          {property?.raw?.floor && property?.raw?.totalFloors
                            ? `${property.raw.floor} / ${property.raw.totalFloors}`
                            : displayOrDash(property?.raw?.floor)}
                        </span>
                      </div>
                    )}

                    {property?.square_feet && (
                      <div>
                        <span className="font-semibold text-gray-800">Carpet Area:</span>
                        <span className="text-gray-600 ml-1">
                          {displayOrDash(property.square_feet)} Sq.ft.
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="font-semibold text-gray-800">Sell Price:</span>
                      <span className="text-gray-600 ml-1">
                        {formatCurrency(property?.price)}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">Furnishing:</span>
                      <span className="text-gray-600 ml-1 break-words">{displayOrDash(property?.furnishing)}</span>
                    </div>

                    {(property?.possessionMonth || property?.possessionYear) && (
                      <div>
                        <span className="font-semibold text-gray-800">Possession:</span>
                        <span className="text-gray-600 ml-1">
                          {[
                            getMonthName(property?.possessionMonth),
                            property?.possessionYear
                          ].filter(Boolean).join(' ')}
                        </span>
                      </div>
                    )}

                    {property?.raw?.selling_rights && (
                      <div>
                        <span className="font-semibold text-gray-800">Selling Rights:</span>
                        <span className="text-gray-600 ml-1 break-words">{displayOrDash(property.raw.selling_rights)}</span>
                      </div>
                    )}

                    {property?.raw?.nearby_places?.length > 0 && (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="font-semibold text-gray-800">Nearby:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {property.raw.nearby_places.map((p: any, i: number) => (
                            <span
                              key={i}
                              className="inline-block bg-gray-100 px-2 py-0.5 rounded-full text-[10px] sm:text-xs text-gray-700"
                            >
                              {p?.name ?? "Place"}
                              {p?.distance ? ` (${p.distance}${p?.unit ?? ""})` : ""}
                              {p?.type ? ` • ${p.type}` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {property?.raw?.address && (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <div className="font-semibold text-gray-800 mb-1">Address:</div>
                        <div className="ml-1 text-gray-700 whitespace-pre-line break-words text-xs sm:text-sm">
                          {property.raw.address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Amenities & Furnishing - Responsive Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                              {/* Amenities */}
                              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 ring-1 ring-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Amenities</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
                                  {(() => {
                                    let amenitiesList: string[] = [];
                                    if (Array.isArray(property?.amenities) && property.amenities.length > 0) {
                                      amenitiesList = property.amenities;
                                    } else if (Array.isArray(property?.raw?.amenities) && property.raw.amenities.length > 0) {
                                      amenitiesList = property.raw.amenities;
                                    } else if (typeof property?.amenities === 'string' && property.amenities.trim()) {
                                      amenitiesList = property.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
                                    } else if (typeof property?.raw?.amenities === 'string' && property.raw.amenities.trim()) {
                                      amenitiesList = property.raw.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
                                    }
              
                                    return amenitiesList.length > 0 ? (
                                      amenitiesList.map((name, i) => <AmenityPill key={i} name={name} />)
                                    ) : (
                                      <span className="text-xs sm:text-sm text-gray-500 col-span-full">No amenities listed</span>
                                    );
                                  })()}
                                </div>
                              </div>
              
                              {/* Furnishing Items */}
                              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 ring-1 ring-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Furnishing Items</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
                                  {(() => {
                                    let furnishingList: string[] = [];
                                    if (Array.isArray(property?.furnishingItems) && property.furnishingItems.length > 0) {
                                      furnishingList = property.furnishingItems;
                                    } else if (Array.isArray(property?.raw?.furnishingItems) && property.raw.furnishingItems.length > 0) {
                                      furnishingList = property.raw.furnishingItems;
                                    } else if (Array.isArray(property?.raw?.furnishing_items) && property.raw.furnishing_items.length > 0) {
                                      furnishingList = property.raw.furnishing_items;
                                    }
              
                                    return furnishingList.length > 0 ? (
                                      furnishingList.map((item: string, index: number) => (
                                        <FurnishingPill key={index} name={item} />
                                      ))
                                    ) : (
                                      <span className="text-xs sm:text-sm text-gray-500 col-span-full">No furnishing items listed</span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

              {/* AI Insights Banner - Responsive */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 md:mb-8 mt-3 sm:mt-4 border border-purple-100 ring-1 ring-purple-100/70">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-1 sm:space-x-1.5 mb-2 sm:mb-3 md:mb-4">
                      <Bot className="text-purple-600" size={16} />
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1">AI Property Analysis</h3>
                    </div>
                    {hasSubscription || !isLoggedIn ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm blur-sm">
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
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-1.5 sm:space-x-2"
                          >
                            <Lock size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Unlock AI Analysis - ₹299</span>
                            <span className="xs:hidden">Unlock ₹299</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 relative ring-1 ring-gray-100">
              <div className="flex items-center space-x-1.5 sm:space-x-2 mb-2 sm:mb-3">
                <div className="bg-blue-100 rounded-lg p-1">
                  <Lightbulb className="text-blue-600" size={16} />
                </div>
                <h2 className="font-bold text-gray-900 text-sm sm:text-base">AI Recommendations</h2>
              </div>

              {hasSubscription ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-green-50 rounded-lg p-2.5 sm:p-3 border border-green-100">
                    <div className="flex items-center space-x-1 sm:space-x-1.5 mb-1 sm:mb-1.5">
                      <TrendingUp className="text-green-600" />
                      <span className="font-semibold text-green-800 text-xs sm:text-sm">Price Appreciation</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-green-600 leading-tight">+15.2%</div>
                    <div className="text-[10px] sm:text-xs text-green-700 mt-0.5">Expected in next 12 months</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3 border border-blue-100">
                    <div className="flex items-center space-x-1 sm:space-x-1.5 mb-1 sm:mb-1.5">
                      <PieChart className="text-blue-600" />
                      <span className="font-semibold text-blue-800 text-xs sm:text-sm">Market Position</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-blue-600 leading-tight">Top 10%</div>
                    <div className="text-[10px] sm:text-xs text-blue-700 mt-0.5">In this locality</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-2.5 sm:p-3 border border-orange-100">
                    <div className="flex items-center space-x-1 sm:space-x-1.5 mb-1 sm:mb-1.5">
                      <AlertCircle className="text-orange-600" />
                      <span className="font-semibold text-orange-800 text-xs sm:text-sm">Investment Timing</span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-orange-600 leading-tight">Excellent</div>
                    <div className="text-[10px] sm:text-xs text-orange-700 mt-0.5">Buy now recommended</div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 blur-md pointer-events-none select-none">
                    <div className="bg-green-50 rounded-lg p-2.5 sm:p-3 border border-green-100">
                      <div className="flex items-center space-x-1 sm:space-x-1.5 mb-1 sm:mb-1.5">
                        <TrendingUp className="text-green-600" size={14} />
                        <span className="font-semibold text-green-800 text-xs sm:text-sm">Price Appreciation</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-green-600 leading-tight">+••.•%</div>
                      <div className="text-[10px] sm:text-xs text-green-700 mt-0.5">Expected in next 12 months</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-2.5 sm:p-3 border border-blue-100">
                      <div className="flex items-center space-x-1 sm:space-x-1.5 mb-1 sm:mb-1.5">
                        <PieChart className="text-blue-600" size={14} />
                        <span className="font-semibold text-blue-800 text-xs sm:text-sm">Market Position</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-blue-600 leading-tight">Top ••%</div>
                      <div className="text-[10px] sm:text-xs text-blue-700 mt-0.5">In this locality</div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-2.5 sm:p-3 border border-orange-100">
                      <div className="flex items-center space-x-1 sm:space-x-1.5 mb-1 sm:mb-1.5">
                        <AlertCircle className="text-orange-600" size={14} />
                        <span className="font-semibold text-orange-800 text-xs sm:text-sm">Investment Timing</span>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-orange-600 leading-tight">••••••••</div>
                      <div className="text-[10px] sm:text-xs text-orange-700 mt-0.5">Buy now recommended</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/95 p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs w-[85%] sm:w-[80%]">
                      <Lock className="text-blue-600 mx-auto mb-1" size={16} />
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1">Premium AI Insights</h3>
                      <p className="text-gray-600 text-[10px] sm:text-xs mb-2 sm:mb-3 leading-snug">
                        Get detailed recommendations and market analysis
                      </p>
                      <button
                        onClick={() => handlePaywallOpen('ai-recommendations')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold hover:shadow-md transition-all"
                      >
                        Unlock for ₹299
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location & Nearby - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 ring-1 ring-gray-100">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Location & Connectivity</h2>

              <div className="h-36 sm:h-40 md:h-44 lg:h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg sm:rounded-xl mb-2 sm:mb-3 flex items-center justify-center ring-1 ring-slate-300/40">
                <div className="text-center text-gray-500 leading-tight">
                  <MapPin size={24} className="sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1" />
                  <p className="text-xs sm:text-sm">Interactive Map Coming Soon</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-xs sm:text-sm">Transportation</h3>
                  <ul className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600 leading-tight">
                    <li>• Bandra Station - 0.5 km</li>
                    <li>• Airport - 8 km</li>
                    <li>• Highway Access - 1 km</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-xs sm:text-sm">Essential Services</h3>
                  <ul className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600 leading-tight">
                    <li>• Shopping Mall - 0.3 km</li>
                    <li>• Hospital - 1.2 km</li>
                    <li>• School - 0.8 km</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 ring-1 ring-gray-100">
              <h2 className="font-bold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Customer Reviews</h2>

              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center space-x-0.5 sm:space-x-1 mr-2 sm:mr-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} className="sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 leading-none">4.8</span>
                <span className="text-gray-600 ml-1.5 sm:ml-2 text-xs sm:text-sm leading-none">(24 reviews)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {[
                  { name: 'Rajesh Kumar', rating: 5, comment: 'Excellent property with great amenities. Highly recommended!', date: '2 days ago' },
                  { name: 'Priya Sharma', rating: 4, comment: 'Beautiful location and well-maintained property.', date: '1 week ago' },
                  { name: 'Amit Patel', rating: 5, comment: 'Perfect for families. Great connectivity and facilities.', date: '2 weeks ago' }
                ].map((review, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-2.5 sm:p-3 bg-white shadow-sm hover:shadow ring-1 ring-gray-100/70 transition">
                    <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={12} className="sm:w-3.5 sm:h-3.5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">{review.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={10}
                              className={`sm:w-3 sm:h-3 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm leading-snug">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (hidden on mobile/tablet; shows on lg+) */}
          <div className="space-y-2">
            {/* Desktop View - Sticky Card */}
            <div className="hidden md:block lg:self-start lg:overflow-visible sticky top-24">
              <div className="sticky top-20">
                <div className="bg-white rounded-xl shadow-sm p-2 ring-1 ring-gray-100">
                  {/* Agent Info */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 ring-1 ring-blue-200 flex items-center justify-center shadow-sm">
                      <User size={16} className="text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {displayOrDash(property?.agent?.name) === ' - '
                          ? ' - '
                          : property?.agent?.name || '-'}
                      </h3>
                    </div>
                  </div>

                  {/* Action Icons Row */}
                  <div className="flex justify-between gap-2">
                    {/* Call */}
                    <button
                      onClick={callAgent}
                      className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl 
              bg-gradient-to-br from-blue-50 to-blue-100 
              text-blue-700 hover:from-blue-100 hover:to-blue-200 
              transition-all shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <Phone size={16} />
                    </button>

                    {/* Message */}
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl 
              bg-gradient-to-br from-purple-50 to-purple-100 
              text-purple-700 hover:from-purple-100 hover:to-purple-200 
              transition-all shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <MessageCircle size={16} />
                    </button>

                    {/* Schedule */}
                    <button
                      className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl 
              bg-gradient-to-br from-emerald-50 to-emerald-100 
              text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 
              transition-all shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <Calendar size={16} />
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        const phone = getAgentPhone();
                        const cc =
                          phone.startsWith("91") || phone.length > 10 ? "" : "91";
                        const message = `Hi! I'm interested in ${property?.title ?? ""
                          } at ${property?.locationNormalized ?? ""}. Price: ${formatCurrency(
                            property?.price ?? 0
                          )}. Can you provide more details?`;
                        if (typeof window !== "undefined") {
                          window.open(
                            `https://wa.me/${cc}${phone}?text=${encodeURIComponent(
                              message
                            )}`,
                            "_blank"
                          );
                        }
                      }}
                      className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl 
              bg-gradient-to-br from-green-50 to-green-100 
              text-green-700 hover:from-green-100 hover:to-green-200 
              transition-all shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <FaWhatsapp size={16} className="text-[#25D366]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile View - Fixed Bottom Bar */}
            <div className="fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom,0),8px)] z-[60] md:hidden pointer-events-none">
              <div className="mx-auto max-w-sm px-3">
                <div
                  className="pointer-events-auto bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-50
       shadow-[0_10px_30px_-10px_rgba(0,0,0,.35)]
      ring-1 ring-gray-200 border border-white/60 p-2.5"
                  role="toolbar"
                  aria-label="Mobile quick actions"
                >
                  {/* Agent Info */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 ring-1 ring-blue-200 flex items-center justify-center shadow-sm">
                      <User size={16} className="text-blue-600" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-[13px] leading-none truncate">
                      {displayOrDash(property?.agent?.name) === ' - ' ? ' - ' : property?.agent?.name || 'Rohit Sharma'}
                    </h3>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {/* Call */}
                    <button
                      onClick={callAgent}
                      aria-label="Call agent"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl
          bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border border-blue-200/60
          transition-all shadow-sm hover:shadow-md active:scale-[0.98] py-1.5"
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-blue-200/60">
                        <Phone size={14} aria-hidden="true" />
                      </span>
                    </button>

                    {/* Message */}
                    <button
                      onClick={() => setShowContactForm(true)}
                      aria-label="Message agent"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl
          bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border border-purple-200/60
          transition-all shadow-sm hover:shadow-md active:scale-[0.98] py-1.5"
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-purple-200/60">
                        <MessageCircle size={14} aria-hidden="true" />
                      </span>
                    </button>

                    {/* Schedule */}
                    <button
                      aria-label="Schedule visit"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl
          bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200/60
          transition-all shadow-sm hover:shadow-md active:scale-[0.98] py-1.5"
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-emerald-200/60">
                        <Calendar size={14} aria-hidden="true" />
                      </span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        const phone = getAgentPhone();
                        const cc = phone.startsWith('91') || phone.length > 10 ? '' : '91';
                        const message = `Hi! I'm interested in ${property?.title ?? ''} at ${property?.locationNormalized ?? ''}. Price: ${formatCurrency(property?.price ?? 0)}. Can you provide more details?`;
                        if (typeof window !== 'undefined') {
                          window.open(`https://wa.me/${cc}${phone}?text=${encodeURIComponent(message)}`, '_blank');
                        }
                      }}
                      aria-label="WhatsApp agent"
                      className="flex flex-col items-center justify-center gap-1 rounded-xl
          bg-[#25D366]/10 hover:bg-[#25D366]/15 text-[#128C7E]
          border border-[#25D366]/30 transition-all shadow-sm hover:shadow-md active:scale-[0.98] py-1.5"
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-[#25D366]/30">
                        <FaWhatsapp size={14} aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Interest & Shortlisted */}
            <div className="px-2 py-1 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Property Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-1 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Total Views</span>
                  </div>
                  <span className="text-green-600">{property?.views ?? '—'}</span>

                </div>

                <div className="flex items-center justify-between p-1 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Shortlisted By</span>
                  </div>
                  <span className="text-blue-600">23 People</span>
                </div>

                <div className="flex items-center justify-between p-1 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Phone className="text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Contact Requests</span>
                  </div>
                  <span className=" text-orange-600">12 This Week</span>
                </div>
              </div>
            </div>
            {/* Property Highlights */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden ring-1 ring-gray-100">
              {/* Header */}
              <div className="px-2 py-1 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-900 text-sm">Property Highlights</h3>
              </div>

              {/* Top stats */}
              <div className="p-2 md:p-3">
                <div className="grid grid-cols-3 gap-3 md:gap-3">
                  <div className="rounded-lg p-2.5 md:p-3 border border-gray-200/70 bg-white ring-1 ring-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-lg bg-blue-50 ring-1 ring-blue-100">
                        <BedDouble className="text-blue-600" size={16} />
                      </span>
                      <span className="text-[12px] font-semibold text-gray-500 tracking-wider">Bedrooms</span>
                    </div>
                    <div className="text-[15px] md:text-[16px] font-semibold text-gray-900 text-center leading-none">
                      {displayOrDash(property?.bedrooms)}
                    </div>
                  </div>

                  <div className="rounded-lg p-2.5 md:p-3 border border-gray-200/70 bg-white ring-1 ring-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-lg bg-green-50 ring-1 ring-green-100">
                        <Bath className="text-green-600" size={16} />
                      </span>
                      <span className="text-[12px] font-semibold text-gray-500 tracking-wider">Bathrooms</span>
                    </div>
                    <div className="text-[15px] md:text-[16px] font-semibold text-gray-900 text-center leading-none">
                      {displayOrDash(property?.bathrooms ?? 3)}
                    </div>
                  </div>

                  <div className="rounded-lg p-2.5 md:p-3 border border-gray-200/70 bg-white ring-1 ring-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-lg bg-orange-50 ring-1 ring-orange-100">
                        <Car className="text-orange-600" size={16} />
                      </span>
                      <span className="text-[12px] font-semibold text-gray-500 tracking-wider">Parking</span>
                    </div>
                    <div className="text-[15px] md:text-[16px] font-semibold text-gray-900 text-center leading-none">
                      {displayOrDash(property?.parking ?? 2)}
                    </div>
                  </div>
                </div>

                {/* Detail stats */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {/* Property Type */}
                  <div className="rounded-lg p-2 border border-gray-200/70 bg-white ring-1 ring-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-50 ring-1 ring-blue-100">
                        <Building className="text-blue-600" size={16} />
                      </span>
                      <span className="text-[12px] font-medium text-gray-500 tracking-wide">Property Type</span>
                    </div>
                    <div className="text-[13px] font-semibold text-gray-900 text-center">
                      {(() => {
                        const val = displayOrDash(property?.type);
                        return val === ' - ' ? ' - ' : property?.type || 'Villa';
                      })()}
                    </div>
                  </div>

                  {/* Built Year */}
                  <div className="rounded-lg p-2 border border-gray-200/70 bg-white ring-1 ring-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-green-50 ring-1 ring-green-100">
                        <Calendar className="text-green-600" size={16} />
                      </span>
                      <span className="text-[12px] font-medium text-gray-500 tracking-wide">Built Year</span>
                    </div>
                    <div className="text-[13px] font-semibold text-gray-900 text-center">
                      {displayOrDash(property?.possessionYear)}
                    </div>
                  </div>

                  {/* Furnishing */}
                  <div className="rounded-lg p-2 border border-gray-200/70 bg-white ring-1 ring-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-purple-50 ring-1 ring-purple-100">
                        <Home className="text-purple-600" size={16} />
                      </span>
                      <span className="text-[12px] font-medium text-gray-500 tracking-wide">Furnishing</span>
                    </div>
                    <div className="text-[13px] font-semibold text-gray-900 text-center">
                      {(() => {
                        const val = displayOrDash(property?.furnishing);
                        return val === ' - ' ? ' - ' : property?.furnishing || 'Semi-Furnished';
                      })()}
                    </div>
                  </div>

                  {/* Facing */}
                  <div className="rounded-lg p-2 border border-gray-200/70 bg-white ring-1 ring-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-orange-50 ring-1 ring-orange-100">
                        <Target className="text-orange-600" size={16} />
                      </span>
                      <span className="text-[12px] font-medium text-gray-500 tracking-wide ">Facing</span>
                    </div>
                    <div className="text-[13px] font-semibold text-gray-900 text-center">
                      {(() => {
                        const val = displayOrDash(property?.facing);
                        return val === ' - ' ? ' - ' : property?.facing || 'North-East';
                      })()}
                    </div>
                  </div>
                </div>


              </div>

            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-2 ring-1 ring-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Price Breakdown</h3>
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
            {/* AI Investment Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm p-4 sm:p-5 relative ring-1 ring-purple-100/70">
              <div className="flex items-center space-x-1 mb-3">
                <Bot className="text-purple-600" size={16} />
                <h3 className="font-bold text-gray-900 text-sm">AI Investment Analysis</h3>
              </div>

              {hasSubscription ? (
                <div className="space-y-3">
                  {/* Compact stat cards in a responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Purchase Recommendation</span>
                        <span className="font-bold text-green-600 text-sm sm:text-base leading-tight">Strong Buy</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Expected ROI (5 years)</span>
                        <span className="font-bold text-blue-600 text-sm sm:text-base leading-tight">18.2%</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Risk Level</span>
                        <span className="font-bold text-yellow-600 text-sm sm:text-base leading-tight">Low</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Market Timing</span>
                        <span className="font-bold text-purple-600 text-sm sm:text-base leading-tight">Excellent</span>
                      </div>
                    </div>
                  </div>

                  {/* Insight note (compact) */}
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="text-purple-600 mt-0.5" size={16} />
                      <p className="text-xs text-gray-700 leading-snug">
                        <strong>AI Insight:</strong> This property is in the top 5% for investment potential in this area. Current market conditions favor immediate purchase.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Keep preview visible but compact and non-interactive */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 blur-sm pointer-events-none select-none">
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Purchase Recommendation</span>
                          <span className="font-bold text-green-600 text-sm sm:text-base">•••••• •••</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Expected ROI (5 years)</span>
                          <span className="font-bold text-blue-600 text-sm sm:text-base">••.•%</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Risk Level</span>
                          <span className="font-bold text-yellow-600 text-sm sm:text-base">•••</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-600">Market Timing</span>
                          <span className="font-bold text-purple-600 text-sm sm:text-base">••••••••••</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact paywall overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/95 p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs w-[92%]">
                      <Crown className="text-purple-600 mx-auto mb-2" size={18} />
                      <h4 className="font-bold text-gray-900 mb-1 text-base">Investment Analysis</h4>
                      <p className="text-xs text-gray-600 mb-3 leading-snug">Get AI-powered investment insights</p>
                      <button
                        onClick={() => handlePaywallOpen('ai-investment')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:shadow-md transition-all"
                      >
                        Unlock ₹299
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Similar Properties */}
            <div className="bg-white rounded-xl shadow-sm p-5 ring-1 ring-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Similar Properties</h3>
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
          const displayType = property?.type ?? '';
          const titleParts = [
            displayType,
            property?.unitType ?? '',
            property?.subtype ?? ''
          ].map(s => (s || '').toString().trim()).filter(Boolean);
          const shareTitle = titleParts.length ? titleParts.join(' ') : (property?.title || 'Property Listing');

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
              propertyId={property.id}
              slug={`${property.id}-${property.slug}`} 
              onClose={() => setOpen(false)}
            />
          );
        })()
      )}
    </div>
  );
};

export default PublicPropertyDetailPage;
