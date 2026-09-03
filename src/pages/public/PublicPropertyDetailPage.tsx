// PublicPropertyDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { trackEvent } from '@/utils/tracker';
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
  ChevronUp,
  ChevronDown,
  BedDouble, Bath, Ruler, IndianRupee, Grid,
  Bed,
  ArrowRight,
  Building2,
  ShieldCheck,
  FileText,
  GraduationCap,
  Stethoscope,
  Train,
  ShoppingBag,
  Utensils,
  Compass,
  Navigation
} from 'lucide-react';
import AIPaywallOverlay from '@/components/paywall/AIPaywallOverlay';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import propertiesAPI from '@/lib/propertiesAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { FaWhatsapp } from 'react-icons/fa';
import viewsAPI from '@/lib/viewAPI';
import ShareModal from './ShareModal';
import PhotoGalleryModal from './PhotoGalleryModal';
import FurnishingPill from '@/components/properties/FurnishingPill';
import AmenityPill from '@/components/properties/AmenityPill';
import { getTagStyle, DEFAULT_TAG_STYLE } from "@/lib/tagStyles";
import propertyTagsAPI, { PropertyTagsRow } from '@/lib/propertyTagsAPI';
import PropertyDescriptionSmart from './PropertyDescriptionSmart';
import PublicSimilarProperties from './PublicSimilarProperties';
import { fetchLiveNearbyPlaces, classifyPlaceCategory, NearbyPlaceItem } from '@/lib/nearbyPlacesAPI';
// NEW
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { recordAndCheckGuestPropertyLimit } from '@/utils/guestViewTracker';
import { buyerSavedAPI } from '@/lib/buyerSavedPropertiesAPI';
import { toast } from 'react-toastify'; // if not already imported
import { getMasterDropdownOptions } from '@/lib/useMasterData';
import { buyerAPI } from '@/lib/buyerAPI';
import PropertyGalleryPage from '../../components/properties/PropertyGalleryPage';
import { getImageUrl } from '@/lib/helpers';



type RawProperty = any;

interface SimilarPropertiesProps {
  properties?: [];
}

interface PropertyCharges {
  basePrice: number;

  stampDuty: {
    amount: number;
    rate: number;
  };

  registration: {
    amount: number;
    rate: number;
  };

  legalFees: number;
  additionalCharges: number;
  totalCost: number;
  percentageOverBase: number;
}

interface EMIDetails {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  interestRate: number;
  tenureYears: number;
}

const PublicPropertyDetailPage = ({ property: propertyProp, onBack, isRentalProp }: any) => {
  const [open, setOpen] = useState(false);
  // UI state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<'ai-recommendations' | 'ai-investment' | 'premium-details'>('ai-recommendations');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [propertyTags, setPropertyTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [similarPropertiesLoading, setSimilarPropertiesLoading] = useState(false);
  // add near other hooks / state
  const [masterData, setMasterData] = useState<any>({});
  const [loadingMasters, setLoadingMasters] = useState(false);
  const hasRecordedViewRef = React.useRef<{ [key: string]: boolean }>({});
  const [contactForm, setContactForm] = useState({
    salutation: '',
    name: '',
    phone: '',
    email: '',
    source: 'website',
  });

  // Add this state near your other useState declarations (around line 60)
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [photoGalleryStartIndex, setPhotoGalleryStartIndex] = useState(0);

  const [galleryFilter, setGalleryFilter] = useState<'all' | 'image' | 'video'>('all');
  // route param
  const { slug } = useParams();
  const navigate = useNavigate();
  // local property state used across the component
  const [property, setProperty] = useState<any>(null);

  // NEW: Property charges and EMI state
  const [propertyCharges, setPropertyCharges] = useState<PropertyCharges | null>(null);
  const [emiDetails, setEmiDetails] = useState<EMIDetails | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [loanPercentage, setLoanPercentage] = useState<number>(80); // Default 80%
  const [interestRate, setInterestRate] = useState<number>(8.5); // Default 8.5%
  const [tenureYears, setTenureYears] = useState<number>(30); // Default 20 years

  const getGalleryPhotos = () => {
    if (!property) return [];
    const all = property.mediaItems || [];
    if (galleryFilter === 'all') return all;
    return all.filter((m: any) => galleryFilter === 'image' ? m.type !== 'video' : m.type === 'video');
  };
  const location = useLocation();
  const { currentUser, user } = useAuth() as any;
  const { systemSettings } = useSystemSettings();

  // Track Guest Property Views
  useEffect(() => {
    if (property?.id) {
      const { isLocked } = recordAndCheckGuestPropertyLimit(property.id, user || currentUser, systemSettings);
      if (isLocked) {
        navigate(`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      }
    }
  }, [property?.id, user, currentUser, systemSettings, navigate, location.pathname, location.search]);

  const isRental = isRentalProp || Boolean(
    property?.monthly_rent ||
    property?.expected_rent ||
    (property?.listing_type && String(property.listing_type).toLowerCase() === 'rent') ||
    (property?.transaction_type && String(property.transaction_type).toLowerCase() === 'rent') ||
    (property?.purpose && String(property.purpose).toLowerCase() === 'rent') ||
    (property?.raw?.purpose && String(property.raw.purpose).toLowerCase() === 'rent') ||
    (property?.raw?.transaction_type && String(property.raw.transaction_type).toLowerCase() === 'rent') ||
    (property?.raw?.listing_type && String(property.raw.listing_type).toLowerCase() === 'rent') ||
    property?.propertyId?.toUpperCase().startsWith('RENT') ||
    String(property?.id).toUpperCase().startsWith('RENT')
  );

  // useEffect में master data fetch करें
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoadingMasters(true);
        const data = await getMasterDropdownOptions(['common']);
        setMasterData(data || {});
      } catch (error) {
        console.error('Error fetching master data:', error);
      } finally {
        setLoadingMasters(false);
      }
    };

    fetchMasterData();
  }, []);

  // Master data से salutation options निकालें
  const salutationOptions = masterData['salutation'] || [
    { value: 'Mr', label: 'Mr' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Dr', label: 'Dr' },
  ];

  // Helper: buyer id resolve (different shapes ke liye safe)
  const getBuyerIdFromAuth = (): number | null => {
    // try common shapes
    const u = currentUser ?? user ?? {};
    // examples: { id, role }, or { buyer: { id } }, or direct buyer_id
    if (typeof u?.buyer_id === 'number') return u.buyer_id;
    if (typeof u?.buyerId === 'number') return u.buyerId;
    if (typeof u?.buyer?.id === 'number') return u.buyer.id;
    // if role based:
    if ((u?.role === 'buyer' || u?.type === 'buyer') && typeof u?.id === 'number') return u.id;
    return null;
  };

  // (optional) loading for save click
  const [saving, setSaving] = useState(false);

  // ===========================================
  // FIXED RATES CONFIGURATION FOR RESALE PROPERTIES
  // ===========================================

  // FIXED RATES FOR ALL STATES - RESALE PROPERTIES ONLY
  const FIXED_RATES = {
    stampDuty: 0.07,      // 7% fixed for all states
    registration: 0.01,   // 1% fixed for all states
    maxRegistration: 30000, // Max ₹30,000
    legalFees: 10000,     // Fixed ₹10,000 for legal documentation (10,000-15,000 range)
  };

  // Calculate property charges for RESALE PROPERTIES ONLY
  const calculatePropertyCharges = (property: any): PropertyCharges => {
    const basePrice = property?.price || 0;
    const carpetArea = property?.square_feet || 0;

    const stampDutyAmount = Math.round(basePrice * FIXED_RATES.stampDuty);

    // 2. Registration - FIXED 1% (max ₹30,000) for resale properties
    const registrationAmount = Math.min(
      Math.round(basePrice * FIXED_RATES.registration),
      FIXED_RATES.maxRegistration
    );

    // 4. Legal Fees - Fixed ₹10,000 (10,000-15,000 range)
    const legalFees = FIXED_RATES.legalFees;

    // Totals
    const additionalCharges = stampDutyAmount + registrationAmount + legalFees;

    const totalCost = basePrice + additionalCharges;
    const percentageOverBase = basePrice > 0 ? (additionalCharges / basePrice) * 100 : 0;

    return {
      basePrice,
      stampDuty: { amount: stampDutyAmount, rate: 7 }, // Fixed 7%
      registration: { amount: registrationAmount, rate: 1 }, // Fixed 1%
      legalFees,
      additionalCharges,
      totalCost,
      percentageOverBase
    };
  };

  // Calculate EMI with standard formula
  const calculateEMI = (principal: number, annualRate: number, years: number): EMIDetails => {
    if (!principal || principal <= 0 || !annualRate || annualRate <= 0 || !years || years <= 0) {
      return {
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
        principal: 0,
        interestRate: annualRate,
        tenureYears: years
      };
    }

    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      principal,
      interestRate: annualRate,
      tenureYears: years
    };
  };

  // Update calculations and track property view
  useEffect(() => {
    if (property) {
      const charges = calculatePropertyCharges(property);
      setPropertyCharges(charges);

      // Calculate loan amount (default 80% of property price)
      const baseLoanAmount = Math.round((property.price || 0) * (loanPercentage / 100));
      setLoanAmount(baseLoanAmount);

      // Calculate EMI
      const emi = calculateEMI(baseLoanAmount, interestRate, tenureYears);
      setEmiDetails(emi);

      // Track property view
      const pid = resolvePropertyIdNumber(property);
      if (pid) {
        trackEvent({
          eventType: 'property',
          eventName: 'property_viewed',
          propertyId: pid,
          payload: {
            title: property.title,
            price: property.price,
            locality: property.locality || property.address,
            city: property.city,
            bhk: property.bhk || property.bedrooms,
            property_type: property.type,
          }
        });
      }
    }
  }, [property]);

  // Track EMI interaction on user input
  useEffect(() => {
    if (property && loanAmount > 0 && interestRate > 0 && tenureYears > 0) {
      const pid = resolvePropertyIdNumber(property);
      const timer = setTimeout(() => {
        trackEvent({
          eventType: 'calculator',
          eventName: 'emi_calculated',
          propertyId: pid || null,
          payload: {
            property_title: property.title,
            loan_amount: loanAmount,
            interest_rate: interestRate,
            tenure_years: tenureYears,
            monthly_emi: emiDetails.emi,
          }
        });
      }, 1000); // 1s debounce
      return () => clearTimeout(timer);
    }
  }, [loanAmount, interestRate, tenureYears]);

  // Handle loan percentage change
  const handleLoanPercentageChange = (percentage: number) => {
    setLoanPercentage(percentage);
    const newLoanAmount = Math.round((property?.price || 0) * (percentage / 100));
    setLoanAmount(newLoanAmount);

    const newEmi = calculateEMI(newLoanAmount, interestRate, tenureYears);
    setEmiDetails(newEmi);
  };

  // Handle interest rate change
  const handleInterestRateChange = (rate: number) => {
    setInterestRate(rate);
    const newEmi = calculateEMI(loanAmount, rate, tenureYears);
    setEmiDetails(newEmi);
  };

  // Handle tenure change
  const handleTenureChange = (years: number) => {
    setTenureYears(years);
    const newEmi = calculateEMI(loanAmount, interestRate, years);
    setEmiDetails(newEmi);
  };

  // Helper functions for display
  const isReadyToMove = (property: any): boolean => {
    return property?.status?.toLowerCase().includes('ready') ||
      property?.possession?.toLowerCase().includes('ready');
  };

  const isAffordableProperty = (price: number): boolean => {
    return price <= 4500000; // ₹45 लाख तक affordable
  };

  // put near other helpers
  const checkSavedStatus = async () => {
    try {
      const buyerId = getBuyerIdFromAuth();
      const pid = resolvePropertyIdNumber(property);
      if (!buyerId || !pid) return;

      const resp = await buyerSavedAPI.isSaved(buyerId, pid); // backend truth
      if (resp?.success) setLiked(!!resp.saved);
    } catch (err) {
      console.warn("checkSavedStatus failed", err);
    }
  };

  useEffect(() => {
    if (!property) return;
    checkSavedStatus();
  }, [property, currentUser]);

  useEffect(() => {
    if (!property) return;
    const refetch = () => checkSavedStatus();

    window.addEventListener("focus", refetch);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refetch();
    });

    return () => {
      window.removeEventListener("focus", refetch);
      document.removeEventListener("visibilitychange", refetch);
    };
  }, [property]);

  const handleSaveClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!property) return;

    const buyerId = getBuyerIdFromAuth();
    if (!buyerId) {
      setShowContactForm(true);
      return;
    }

    const propertyId = resolvePropertyIdNumber(property);
    if (!propertyId) {
      toast.error("Property ID not found");
      return;
    }

    try {
      setSaving(true);
      const resp = await buyerSavedAPI.toggle(buyerId, propertyId, "toggle");
      if (resp?.success) {
        const isSaved = !!resp.saved;
        setLiked(isSaved);
        if (isSaved) toast.success("Saved to your shortlist");
        else toast.info("Removed from your shortlist");

        // 🔔 broadcast to other screens if needed
        window.dispatchEvent(
          new CustomEvent("buyerSaved:changed", {
            detail: { propertyId, saved: isSaved },
          })
        );
      } else {
        toast.error("Could not update save status");
      }
    } catch (err) {
      console.error("toggle failed:", err);
      toast.error("Failed to update shortlist");
    } finally {
      setSaving(false);
    }
  };


  useEffect(() => {
    const handler = (e: any) => {
      const pid = resolvePropertyIdNumber(property);
      if (pid && e?.detail?.propertyId === pid)
        setLiked(!!e.detail.saved);
    };
    window.addEventListener("buyerSaved:changed", handler as EventListener);
    return () => window.removeEventListener("buyerSaved:changed", handler as EventListener);
  }, [property]);


  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!property) return;
      setSimilarPropertiesLoading(true);

      try {
        const isRental = isRentalProp || Boolean(
          property.raw?.listing_type === 'rent' ||
          property.raw?.monthly_rent ||
          property.raw?.security_deposit ||
          property.monthly_rent ||
          (property.raw?.listing_type && String(property.raw.listing_type).toLowerCase() === 'rent')
        );

        const activeAPI = isRental ? rentalPropertiesAPI : propertiesAPI;

        const primaryFilters = {
          propertyId: property.id,
          type: property.type,
          propertyType: property.type,
          subtype: property.subtype,
          unitType: property.unitType,
          city: property.city,
          location: property.locationNormalized,
          bedrooms: property.bedrooms,
          furnishing: property.furnishing,
          price: property.price,   // ✅
          limit: 6,
          excludeCurrent: true,
        };

        let similarData: any = null;
        try {
          similarData = await activeAPI.getSimilarProperties(primaryFilters);
        } catch (err) {
          similarData = await activeAPI.PublicgetProperties({
            city: property.city,
            limit: 6,
            status: 'Available'
          });
        }

        const list = Array.isArray(similarData?.data) ? similarData.data : (Array.isArray(similarData) ? similarData : []);

        // 👉 Per item full fetch to get price/images/etc.
        const enriched = await Promise.all(
          list.map(async (p: any) => {
            try {
              const slug = p?.slug ?? p?.raw?.slug ?? null;
              const id = p?.id ?? p?.raw?.id ?? null;

              let full: any = null;
              if (slug && activeAPI.PublicgetPropertyBySlug) {
                const r = await activeAPI.PublicgetPropertyBySlug(slug);
                full = r?.data ?? r ?? null;
              } else if (id && (activeAPI as any).getProperty) {
                const r = await (activeAPI as any).getProperty(id);
                full = r?.data ?? r ?? null;
              }

              // fallback to original if detail call fails
              return normalizeProperty(full || p);
            } catch {
              return normalizeProperty(p);
            }
          })
        );

        // Only keep public properties (isPublic is true/not explicitly false)
        const publicOnly = enriched.filter((p: any) => p.isPublic !== false && p.isPublic !== 0 && p.isPublic !== '0');
        setSimilarProperties(publicOnly);
      } catch (e) {
        console.error("❌ Error fetching similar:", e);
        setSimilarProperties([]);
      } finally {
        setSimilarPropertiesLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [property]);



  // put near other helpers (below resolvePropertyIdNumber is perfect)
  const formatPropertyId = (normalized: any): string => {
    const n = resolvePropertyIdNumber(normalized);
    const isRental = Boolean(
      normalized?.raw?.listing_type === 'rent' ||
      normalized?.raw?.monthly_rent ||
      normalized?.monthly_rent ||
      normalized?.raw?.security_deposit ||
      (normalized?.raw?.listing_type && String(normalized.raw.listing_type).toLowerCase() === 'rent')
    );
    const prefix = isRental ? 'RENT' : 'REX';
    if (!n) return `${prefix}—`;
    return `${prefix}${String(n).padStart(4, '0')}`;
  };




  // helper: display value or dash
  const displayOrDash = (val: any) => {
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) return ' - ';
    if (typeof val === 'number' && !Number.isFinite(val)) return ' - ';
    return val;
  };

  const formatAvailableFromDate = (val: any): string => {
    if (!val) return 'Immediately';
    if (typeof val === 'string' && (val.toLowerCase().includes('immediate') || val.toLowerCase().includes('soon') || val.toLowerCase().trim() === '-' || val.toLowerCase().trim() === 'any')) {
      return val;
    }
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-IN', { month: 'short' }); // e.g. "Aug"
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return String(val);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return ' - ';

    const CRORE = 10_000_000;
    const LAKH = 100_000;

    // For exact amounts, use toFixed(2) for crores and lakhs
    if (n >= CRORE) {
      const croreValue = n / CRORE;
      // Check if it's exactly divisible or needs exact decimal
      if (croreValue === Math.round(croreValue)) {
        return `₹${croreValue}Cr`;
      }
      return `₹${croreValue.toFixed(2)}Cr`;
    }

    if (n >= LAKH) {
      const lakhValue = n / LAKH;
      // Check if it's exactly divisible or needs exact decimal
      if (lakhValue === Math.round(lakhValue)) {
        return `₹${lakhValue}L`;
      }
      return `₹${lakhValue.toFixed(2)}L`;
    }

    // For rupees
    return `₹${n.toLocaleString('en-IN')}`;
  };

  // Format exact currency without abbreviation
  const formatExactCurrency = (amount: number | string) => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return ' - ';

    // Always show exact value with commas
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const getMaskedMapUrl = (lat?: number, lng?: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
    return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  };


  // === NEW: tiny helpers for calling / whatsapp ===
  const getexecutiveToPhone = () => {
    const raw = property?.executiveTo?.phone || "";
    const digits = (raw || "").replace(/\D/g, "");
    return digits || "+91999999999"; // fallback if nothing present
  };

  const callexecutiveTo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const phone = getexecutiveToPhone();
    if (!phone) return;
    if (typeof window !== "undefined") window.location.href = `tel:${phone}`;
  };


  const openWhatsAppFromGallery = (e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const phone = getexecutiveToPhone().replace(/\D/g, '');
    if (!phone) return;
    const cc = phone.startsWith('91') || phone.length > 10 ? '' : '91';
    const title = property?.title || [property?.unitType, property?.type].filter(Boolean).join(' ') || 'a property';
    const loc = property?.locationNormalized || property?.location || property?.city || 'your listed property location';
    const priceValue = Number(property?.price || 0);
    const priceText = !isNaN(priceValue) ? `₹${priceValue.toLocaleString('en-IN')}` : 'Price on request';
    const slugValue = property?.slug || property?.raw?.slug || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '') || '';
    const link = `${window.location.origin}/properties/${encodeURIComponent(String(slugValue))}`;
    const message = `Hi! I'm interested in ${title} at ${loc}. Price: ${priceText}. Can you provide more details?\n${link}`;
    window.open(`https://wa.me/${cc}${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
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



  // put above PropertyTags (same place where old extractLocalityCity lived)
  const isPin = (s: string) => /^\d{5,6}$/.test((s || "").replace(/\s+/g, ""));

  const extractLocalityAndCity = (
    addr: any
  ): { locality?: string; city?: string; label?: string } => {
    if (!addr && addr !== "") return {};

    // If an object was passed (address object or even full property)
    if (typeof addr === "object") {
      const locality = (
        addr.locality ??
        addr.location_name ??   // ✅ NEW
        addr.neighborhood ??
        addr.subLocality ??
        addr.area ??
        ""
      )
        .toString()
        .trim();

      const city = (
        addr.city ??
        addr.city_name ??       // ✅ NEW
        addr.town ??
        addr.district ??
        addr.region ??
        addr.state ??
        ""
      )
        .toString()
        .trim();

      const label = locality && city ? `${locality}, ${city}` : locality || city || undefined;
      return { locality: locality || undefined, city: city || undefined, label };
    }

    // If a string was passed (freeform address)
    if (typeof addr === "string") {
      const cleaned = addr
        .replace(/\r?\n/g, ",")
        .replace(/[-|\/]+/g, ",")
        .replace(/\s+/g, " ")
        .trim();
      if (!cleaned) return {};
      const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);

      const last = parts[parts.length - 1];
      const list = isPin(last) ? parts.slice(0, -1) : parts;

      if (list.length === 1) return { city: list[0], label: list[0] };
      const city = list[list.length - 1];
      const locality = list[list.length - 2];
      return { locality, city, label: locality && city ? `${locality}, ${city}` : city || locality };
    }

    return {};
  };

  // Backward-compatible wrapper (so existing calls keep working)
  const extractLocalityCity = (addr: any): string => {
    const { label } = extractLocalityAndCity(addr);
    return label ?? " - ";
  };

  const PropertyTags = ({ tags }: { tags: string[] }) => {
    if (!tags || tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
        {tags.map((tag, index) => {
          const style = getTagStyle(tag);

          return (
            <span
              key={index}
              className={`
              inline-flex items-center mt-0.5 px-2 sm:px-2.5 py-1 rounded-full 
              text-[8px] xs:text-[10px] sm:text-xs font-bold uppercase 
              transition-all duration-200 min-h-[24px] sm:min-h-[26px]
              ${style.bg} ${style.text} ring-1 ${style.ring}
              hover:scale-105 transform transition-transform
            `}
            >
              {style.emoji && (
                <>
                  {typeof style.emoji === "string" ? (
                    <span
                      className="text-[8px] xs:text-[10px] sm:text-xs mr-1 uppercase flex-shrink-0"
                      aria-hidden="true"
                    >
                      {style.emoji}
                    </span>
                  ) : (
                    React.createElement(style.emoji, {
                      size: "clamp(8px, 2vw, 12px)",
                      className: "mr-1 uppercase flex-shrink-0",
                      "aria-hidden": true,
                    })
                  )}
                </>
              )}
              <span className="whitespace-nowrap truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[120px] md:max-w-none">
                {tag}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  // Fetch property tags
  const fetchPropertyTags = async (propertyId: number | string) => {
    if (!propertyId) return;

    try {
      setTagsLoading(true);
      const tagsData = await propertyTagsAPI.getById(propertyId);
      setPropertyTags(tagsData.tags || []);
    } catch (error) {
      console.error('Error fetching property tags:', error);
      setPropertyTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  // Normalize incoming raw property to the canonical shape we use everywhere
  const normalizeProperty = (p: RawProperty) => {
    if (!p) return null;

    const price = Number(p?.monthly_rent ?? p?.budget ?? p?.price ?? p?.amount ?? p?.listing_price ?? p?.listingPrice);
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

    // ✅ FIX: 'photos' ko pehle check karo (same priority jo HomePage/PublicPropertiesPage/dashboard
    // sab jagah use karte hain). Pehle 'images' pehle check hota tha jo kabhi-kabhi alag/stale order
    // wala hota tha aur carousel + gallery modal (dono isi array se data lete hain) card se mismatch
    // dikhate the.
    const rawMediaList: any[] = Array.isArray(p?.photos) ? p.photos
      : Array.isArray(p?.photoUrls) ? p.photoUrls
        : Array.isArray(p?.images) ? p.images
          : Array.isArray(p?.media) ? p.media : [];


    // object {url,label,type} aur plain string dono handle karo
    const mediaItems = rawMediaList.map((m: any) => {
      const rawUrl = typeof m === 'string' ? m : (m?.url ?? '');
      const resolvedUrl = getImageUrl(rawUrl) || rawUrl;
      if (typeof m === 'string') {
        return { url: resolvedUrl, type: /\.(mp4|mov|webm|mkv)$/i.test(m) ? 'video' : 'image' };
      }
      return { url: resolvedUrl, type: m?.type === 'video' ? 'video' : 'image', label: m?.label };
    }).filter((m: any) => m.url);


    const images: string[] = mediaItems.map((m: any) => m.url); // backward compatible string array

    // const rawLocation = p?.location ?? p?.address ?? p?.place ?? p?.locality ?? p;
    const rawLocation =
      p?.location ??
      p?.address ??
      p?.place ??
      p?.locality ??
      p?.address_line ??   // ✅ NEW
      p?.addr ??           // ✅ NEW
      p;                   // (falls back to full object)


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
    // Derive locality/city from either the address object or root fields
    const locProbe =
      typeof rawLocation === "object"
        ? rawLocation
        : {
          locality: p?.locality,
          location_name: p?.location_name, // ✅
          city: p?.city,
          city_name: p?.city_name,         // ✅
          address: p?.address,
        };

    const { locality, city, label } = extractLocalityAndCity(locProbe);


    const normalized: any = {
      raw: p,
      id: p?.id ?? p?.property_id ?? p?.uuid ?? p?.slug ?? null,
      title: p?.title ?? p?.name ?? p?.headline ?? '',
      type: p?.type ?? p?.property_type ?? p?.property_type_name ?? '',
      unitType: p?.unitType ?? p?.unit_type ?? p?.unit ?? '',
      subtype: p?.subtype ?? p?.property_subtype_name ?? p?.property_subtype ?? '',
      // location: rawLocation,
      // locationNormalized: extractLocalityCity(rawLocation),
      location: rawLocation,
      locationNormalized: label,                  // ✅ use parsed label
      city: p?.city_name ?? p?.city ?? city,      // ✅ make city available to filters
      locality: p?.locality ?? p?.location_name ?? locality, // ✅ for display/search

      lat_display:
        Number(p?.lat_display ??
          p?.display_lat ??
          p?.lat ??
          p?.latitude ??
          p?.society?.latitude ??
          p?.society?.lat ??
          p?.raw?.lat ??
          p?.raw?.latitude ??
          NaN),

      lng_display:
        Number(p?.lng_display ??
          p?.display_lng ??
          p?.lng ??
          p?.longitude ??
          p?.society?.longitude ??
          p?.society?.lng ??
          p?.raw?.lng ??
          p?.raw?.longitude ??
          NaN),


      price: Number.isFinite(price) ? price : undefined,
      square_feet: sqft,
      area: sqft, // alias
      bedrooms: Number(p?.bedrooms ?? p?.beds ?? p?.bhk ?? 0) || undefined,
      bathrooms: Number(p?.bathrooms ?? p?.baths ?? p?.washrooms ?? 0) || undefined,
      parking: Number(p?.parking ?? p?.parking_spots ?? p?.car_parking ?? 0) || undefined,
      amenities: normalizeAmenities(p),
      images: images.length ? images : undefined,
      photos: images.length ? images : undefined,
      mediaItems: mediaItems.length ? mediaItems : undefined,
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
      executiveTo: {
        name: p?.assignedTo?.name || p?.executiveTo?.name || 'Executive Not Assigned',
        phone: p?.assignedTo?.phone || p?.executiveTo?.phone || '',
        email: p?.assignedTo?.email || p?.executiveTo?.email || '',
      },
      aiScore: p?.aiScore ?? p?.score,
      priceGrowth: p?.priceGrowth,
      investmentGrade: p?.investmentGrade,
      property_status: p?.property_status || p?.status,
      possessionMonth: p?.possession_month ?? p?.possessionMonth ?? null,
      possessionYear: p?.possession_year ?? p?.possessionYear ?? null,
      created_at: createdAtRaw ?? null,

      // ✅ ADD THESE FIELDS TO PROPERLY EXTRACT FROM BACKEND DATA
      parkingType: p?.parkingType ?? p?.parking_type ?? '',
      parkingQty: p?.parkingQty ?? p?.parking_qty ?? p?.parking_spots ?? '',
      floor: p?.floor ?? '',
      totalFloors: p?.totalFloors ?? p?.total_floors ?? '',
      status: p?.status ?? p?.property_status ?? '',
      finalPrice: p?.finalPrice ?? p?.final_price ?? null,
      priceType: p?.priceType ?? p?.price_type ?? 'Fixed',
      wing: p?.wing ?? '',
      unitNo: p?.unitNo ?? p?.unit_no ?? '',
      society: p?.society ?? '',
      address: p?.address ?? '',
      selling_rights: p?.selling_rights ?? p?.sellingRights ?? '',
      leadSource: p?.leadSource ?? p?.lead_source ?? '',
      purchaseMonth: p?.purchaseMonth ?? p?.purchase_month ?? null,
      purchaseYear: p?.purchaseYear ?? p?.purchase_year ?? null,
      furnishingItems: Array.isArray(p?.furnishingItems) ? p.furnishingItems
        : Array.isArray(p?.furnishing_items) ? p.furnishing_items
          : [],
      nearby_places: (() => {
        const raw = p?.nearby_places ?? p?.nearbyPlaces ?? p?.nearby;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string' && raw.trim().startsWith('[')) {
          try { return JSON.parse(raw); } catch (e) { }
        }
        return [];
      })(),
      // ✅ ADD BALCONY & RENTAL FIELDS HERE
      balcony: p?.balcony ?? p?.balconies ?? p?.balcony_count ?? '',
      monthly_rent: p?.monthly_rent ?? p?.expected_rent ?? null,
      security_deposit: p?.security_deposit ?? null,
      listing_type: p?.listing_type ?? (p?.monthly_rent ? 'rent' : null),
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
        let res: any = null;

        const isRentalPath = isRentalProp || (typeof window !== 'undefined' && window.location.pathname.startsWith('/rentals'));

        if (isRentalPath) {
          try {
            res = await rentalPropertiesAPI.PublicgetPropertyBySlug(slug as string);
          } catch (e) {
            try {
              res = await propertiesAPI.PublicgetPropertyBySlug(slug as string);
            } catch (resaleErr) {
              throw e;
            }
          }
        } else {
          try {
            res = await propertiesAPI.PublicgetPropertyBySlug(slug as string);
          } catch (e) {
            try {
              res = await rentalPropertiesAPI.PublicgetPropertyBySlug(slug as string);
            } catch (rentalErr) {
              throw e;
            }
          }
        }

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
  }, [slug, propertyProp, isRentalProp]);

  // Fetch tags when property is loaded
  useEffect(() => {
    if (property) {
      const propertyId = resolvePropertyIdNumber(property);
      if (propertyId) {
        fetchPropertyTags(propertyId);
      }
    }
  }, [property]);

  // Dynamic Nearby Places State & Real-Time Coordinates Query
  const [nearbyCategory, setNearbyCategory] = useState<string>('all');
  const [showAllPlaces, setShowAllPlaces] = useState<boolean>(false);
  const [livePlaces, setLivePlaces] = useState<NearbyPlaceItem[]>([]);
  const [livePlacesLoading, setLivePlacesLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!property) return;
    const lat = property.latitude ?? property.lat ?? property.lat_display ?? property.location_lat ?? property.raw?.lat ?? property.raw?.latitude ?? property.raw?.society?.latitude ?? property.raw?.society?.lat;
    const lng = property.longitude ?? property.lng ?? property.lng_display ?? property.location_lng ?? property.raw?.lng ?? property.raw?.longitude ?? property.raw?.society?.longitude ?? property.raw?.society?.lng;
    const propId = property.id ?? property.property_id ?? property.raw?.id;

    const parts = [
      property.society || property.society_name,
      property.locality || property.location_name || property.location,
      property.city || property.city_name,
      property.state,
      property.pincode
    ].filter(p => p && typeof p === 'string' && !p.includes('[object') && p.trim() !== '');

    const uniqueParts: string[] = [];
    parts.forEach(part => {
      const clean = part.trim();
      if (!uniqueParts.some(u => u.toLowerCase() === clean.toLowerCase())) {
        uniqueParts.push(clean);
      }
    });

    let locName = uniqueParts.join(', ');
    if (!locName && typeof property.location === 'string' && property.location.trim()) {
      locName = property.location.trim();
    }

    setLivePlacesLoading(true);
    fetchLiveNearbyPlaces(Number(lat) || 0, Number(lng) || 0, locName, 3500, propId)
      .then(places => {
        setLivePlaces(Array.isArray(places) ? places : []);
      })
      .catch(err => console.warn('Failed to fetch live nearby places:', err))
      .finally(() => setLivePlacesLoading(false));
  }, [property]);

  // Canonical redirect for rentals accessed via property route
  useEffect(() => {
    if (isRental && !isRentalProp && slug) {
      navigate(`/rentals/${encodeURIComponent(slug)}`, { replace: true });
    }
  }, [isRental, isRentalProp, slug, navigate]);

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
          const resp = await viewsAPI.getByProperty(propertyId, false, slugId);
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
                const resp = await viewsAPI.getByProperty(propertyId, false, slugId);
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
        const resp = await viewsAPI.getByProperty(propertyId, false, slugId);
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

  const imageOnlyMediaItems = (property?.mediaItems || []).filter((m: any) => m.type !== 'video');

  const images: string[] = imageOnlyMediaItems.length
    ? imageOnlyMediaItems.map((m: any) => m.url)
    : [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    ];

  const unitType = property?.unitType ?? '';
  const subtype = property?.subtype ?? '';

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const buyerData = {
        salutation: contactForm.salutation,
        name: contactForm.name.trim(),
        phone: contactForm.phone.replace(/\D/g, ''),
        email: contactForm.email?.trim() || undefined,
        source: 'Website',
        property_interested: property?.id ? String(property.id) : undefined,
        property_slug: property?.slug || property?.raw?.slug,
        status: 'new_lead',
        lead_type: 'property_inquiry',
      };

      // Call
      const res = await buyerAPI.create(buyerData);

      // ---- Normalize possible shapes ----
      const body = res?.data ?? res;
      const buyer = body?.data ?? body;
      const ok = !!(buyer?.id);

      if (ok) {
        console.log("✅ Buyer created:", buyer);
        toast.success("We'll contact you shortly!");
        setShowContactForm(false);
        setContactForm({ salutation: 'Mr', name: '', phone: '', email: '', source: 'website' });
      } else {
        console.error("❌ Unexpected create response:", body);
        toast.error("Failed to submit request. Please try again.");
      }
    } catch (error: any) {
      console.error("🔥 Error creating buyer:", error);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong. Please try again.");
    }
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
    setShowPaywall(false);
  };

  const priceValue = Number.isFinite(property?.price) ? property.price : undefined;
  const sqftValue = Number.isFinite(property?.square_feet) ? property.square_feet : undefined;
  const pricePerSqFt = (priceValue && sqftValue) ? Math.round(priceValue / sqftValue) : undefined;

  if (isRental && !isRentalProp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E6761D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (hidden on mobile) */}
      {/* Header (hidden on mobile) */}
      {!showPhotoGallery && (
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
                {isRental ? 'Back to Rentals' : 'Back to Properties'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-6 pb-4 md:pb-6 pt-0 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6 flex flex-col">            {/* Image Carousel - Responsive */}
            <div
              onClick={() => {
                const currentMedia = imageOnlyMediaItems[currentImageIndex];
                const fullList = property.mediaItems || [];
                const idx = fullList.findIndex((m: any) => m.url === currentMedia?.url);
                setPhotoGalleryStartIndex(idx >= 0 ? idx : 0);
                setGalleryFilter('all');
                setShowPhotoGallery(true);
              }} className="relative w-full h-72 sm:h-80 md:h-[420px] lg:h-[520px] bg-gray-900 overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl ring-1 ring-black/10 group cursor-pointer"
            >
              {(() => {
                const currentMedia = imageOnlyMediaItems[currentImageIndex];
                const isVideo = false; // ab yahan kabhi video nahi aayegi
                const currentUrl = images[currentImageIndex];

                return (
                  <img
                    src={currentUrl}
                    alt={property?.title || "Property Image"}
                    onClick={() => { setPhotoGalleryStartIndex(currentImageIndex); setShowPhotoGallery(true); }}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
                  />
                );

                if (isVideo) {
                  const yt = currentUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                  return yt ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${yt[1]}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <video src={currentUrl} className="w-full h-full object-cover" controls muted />
                  );
                }

                return (
                  <img
                    src={currentUrl}
                    alt={property?.title || "Property Image"}
                    onClick={() => { setPhotoGalleryStartIndex(currentImageIndex); setShowPhotoGallery(true); }}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />

              {/* Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none select-none z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                  <div className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap drop-shadow-2xl">
                    ResaleExpert.in
                  </div>
                </div>
              </div>

              {/* Top-Left Info - Responsive */}
              <div className="absolute top-2 sm:top-3 md:top-6 left-2 sm:left-3 md:left-4 z-20 text-white max-w-[75%] sm:max-w-[85%] flex flex-col gap-1">

                {/* 🔹 Title + REX ID in one row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-base sm:text-lg md:text-xl truncate drop-shadow">
                    {property?.type && <span className="mr-1 sm:mr-2">{property.type}</span>}
                    {unitType && <span className="mr-1 sm:mr-2">{unitType}</span>}
                    {subtype && <span className="mr-1 sm:mr-2">{subtype}</span>}
                  </div>

                  {/*  REX ID Badge (right side of title) */}
                  <span
                    className="text-white "
                  >
                    {formatPropertyId(property)}
                  </span>
                </div>

                <div className="flex items-center text-xs sm:text-sm md:text-base drop-shadow">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 shrink-0" />
                  <span className="truncate">{displayOrDash(property?.locationNormalized)}</span>
                </div>
              </div>
              <div className="absolute top-14 left-2 z-20 block sm:hidden">
                <PropertyTags tags={propertyTags} />
              </div>



              {/* Property Tags + Image Label */}
              {/* Property Tags + Image Label */}
              <div className="absolute top-0 left-4 right-4 flex items-center justify-between">
                {/* Left - Image Label */}
                {imageOnlyMediaItems[currentImageIndex]?.label && (
                  <div className="bg-white/70 hover:bg-white/80 backdrop-blur-md text-gray-700 px-2 py-0   mt-0 mb-2 text-sm rounded-sm shadow-lg ring-1 ring-white/20">
                    {imageOnlyMediaItems[currentImageIndex].label}
                  </div>
                )}

                {/* Right - Property Tags */}
                <div className="hidden sm:block ml-auto">
                  <PropertyTags tags={propertyTags} />
                </div>
              </div>

              {/* Top-Right Action Buttons - Responsive */}
              <div className="absolute top-2 sm:top-3 md:top-8 right-2 sm:right-3 md:right-4 z-20 flex flex-col space-y-1.5 sm:space-y-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-white/80 backdrop-blur-md text-white  shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200"
                  aria-label="Share property"
                >
                  <Share className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>

                {/* Save / Bookmark */}
                <button
                  onClick={handleSaveClick}
                  disabled={saving}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-white/80 backdrop-blur-md text-white shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200"
                  aria-label="Save property"
                  title={liked ? "Unsave" : "Save"}
                >
                  <Bookmark
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? 'text-[#E6761D] fill-[#E6761D]' : 'text-gray-700'}`}
                  />
                </button>

              </div>
              {/* Bottom-Left Price - Responsive */}
              <div className="absolute bottom-3 sm:bottom-10 md:bottom-12 left-2 sm:left-3 md:left-4 z-20 w-[90%]">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-5 items-start sm:items-center">
                  <div className="flex flex-col text-left">
                    <div className="text-base sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                      {formatCurrency(property?.price)}{isRental ? ' / mo' : ''}
                    </div>
                    <div className="text-[10px] sm:text-sm md:text-base text-white mt-0 sm:mt-1 font-medium">
                      {isRental ? `Deposit: ₹${(property.raw?.security_deposit ?? property.raw?.deposit ?? (property.price * 3))?.toLocaleString('en-IN')}` : (pricePerSqFt ? `₹${pricePerSqFt.toLocaleString('en-IN')}/sq ft` : ' - ')}
                    </div>
                  </div>

                  <div className="flex flex-col items-left">
                    <span className="text-xs sm:text-sm md:text-base text-white">                      Carpet Area
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
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + images.length) % images.length); }}
                    className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2
                    bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 sm:p-2.5 md:p-3 rounded-full z-20 
                    transition-all duration-200 shadow-xl ring-1 ring-white/30 hover:scale-110"
                  >
                    <ChevronLeft size={12} className="sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % images.length); }}
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
                <div className="absolute bottom-2 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2">                  {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex
                      ? "bg-white w-6 sm:w-8 shadow-lg"
                      : "bg-white/50 hover:bg-white/75"
                      }`}
                  />
                ))}
                </div>
              )}

              {/* View Options Buttons - Responsive */}
              <div className="absolute bottom-14 sm:bottom-16 right-2 sm:right-3 md:right-4 z-20 flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ FIX: parent hero-carousel div ke onClick tak bubble hone se roko
                    e.preventDefault();
                    const imageList = property.mediaItems?.filter((m: any) => m.type !== 'video') || [];
                    if (imageList.length === 0) {
                      toast.info('No images available');
                      return;
                    }
                    const start = Math.min(currentImageIndex, imageList.length - 1);
                    setPhotoGalleryStartIndex(start);
                    setGalleryFilter('image');
                    setShowPhotoGallery(true);
                  }}
                  className="bg-white/70 hover:bg-white/80 backdrop-blur-md text-black px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1 hover:bg-white hover:scale-105 transition-all duration-200 text-[10px] sm:text-xs font-semibold shadow-xl border border-white/60"
                >
                  <Camera size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Photos</span>
                </button>
                {showPhotoGallery && (
                  <PropertyGalleryPage
                    key={galleryFilter}
                    photos={getGalleryPhotos()}
                    title={[property?.type, property?.unitType, property?.subtype].filter(Boolean).join(' ')}
                    price={formatCurrency(property?.price)}
                    pricePerSqft={pricePerSqFt ? `₹${pricePerSqFt.toLocaleString('en-IN')}/sq ft` : ''}
                    initialIndex={photoGalleryStartIndex}
                    liked={liked}
                    onToggleSave={handleSaveClick}
                    executive={property?.executiveTo}
                    onClose={() => setShowPhotoGallery(false)}
                    onCall={callexecutiveTo}
                    onWhatsapp={openWhatsAppFromGallery}
                    onMessage={() => setShowContactForm(true)}
                    onSchedule={() => setShowContactForm(true)}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ FIX: yahi bubbling issue tha, isse video filter bhi override ho jaata tha
                    e.preventDefault();
                    const videoList = property.mediaItems?.filter((m: any) => m.type === 'video') || [];
                    if (videoList.length === 0) {
                      toast.info('No videos available');
                      return;
                    }
                    setPhotoGalleryStartIndex(0);
                    setGalleryFilter('video');
                    setShowPhotoGallery(true);
                  }} className="bg-white/70 hover:bg-white/80 backdrop-blur-md text-black px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1 hover:bg-white hover:scale-105 transition-all duration-200 text-[10px] sm:text-xs font-semibold shadow-xl border border-white/60"
                >
                  <Video size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Tour</span>
                </button>
              </div>
            </div>

            {/* Property Details Section - Responsive */}
            <div >



              <div className="bg-white  backdrop-blur rounded-xl sm:rounded-2xl border  shadow-sm -mt-3 p-2 sm:p-3 mb-1 sm:mb-2">
                <PropertyDescriptionSmart
                  description={property?.description}
                  property={property}
                />
              </div>

              {/* Property Details Grid - Fully Responsive */}
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm mb-2">
                <div className="px-3 sm:px-4 md:px-5 pt-3 sm:pt-4">
                  <h3 className="font-bold text-black text-lg sm:text-xl mb-3 sm:mb-4">
                    Property Details
                  </h3>
                </div>

                <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {(isRental ? [
                      { icon: <Building size={16} className="text-gray-400" />, label: "Property Type", value: property.raw?.property_type || property.raw?.property_type_name || 'Apartment' },
                      { icon: <Home size={16} className="text-gray-400" />, label: "Furnishing", value: displayOrDash(property?.furnishing) },
                      { icon: <Ruler size={16} className="text-gray-400" />, label: "Built-up Area", value: property.raw?.builtup_area ? `${property.raw.builtup_area} Sq.ft.` : (property.square_feet ? `${property.square_feet} Sq.ft.` : '-') },
                      { icon: <Ruler size={16} className="text-gray-400" />, label: "Carpet Area", value: property.raw?.carpet_area ? `${property.raw.carpet_area} Sq.ft.` : '-' },
                      { icon: <IndianRupee size={16} className="text-gray-400" />, label: "Monthly Rent", value: property.monthly_rent || property.price ? `₹${(property.monthly_rent || property.price).toLocaleString('en-IN')}/mo` : '-' },
                      { icon: <Lock size={16} className="text-gray-400" />, label: "Security Deposit", value: property.raw?.security_deposit || property.raw?.deposit ? `₹${(property.raw.security_deposit || property.raw.deposit).toLocaleString('en-IN')}` : '-' },
                      { icon: <ShieldCheck size={16} className="text-gray-400" />, label: "Maintenance", value: property.raw?.maintenance_charge || 'Included' },
                      { icon: <Users size={16} className="text-gray-400" />, label: "Preferred Tenant", value: property.raw?.preferred_tenants || property.raw?.preferredTenant || 'Family / Bachelors' },
                      { icon: <Calendar size={16} className="text-gray-400" />, label: "Available From", value: formatAvailableFromDate(property.raw?.available_from || property.raw?.availableFrom) },
                      { icon: <FileText size={16} className="text-gray-400" />, label: "Lease Duration", value: property.raw?.agreement_duration || property.raw?.agreementDuration || '11 Months' },
                    ] : [
                      { icon: <Building size={16} className="text-gray-400" />, label: "Property Type", value: displayOrDash(property?.type) },
                      { icon: <Home size={16} className="text-gray-400" />, label: "Unit Type", value: displayOrDash(property?.unitType) },
                      { icon: <Grid size={16} className="text-gray-400" />, label: "Subtype", value: displayOrDash(property?.subtype) },
                      { icon: <Car size={16} className="text-gray-400" />, label: "Parking Type", value: displayOrDash(property?.parkingType) },
                      { icon: <Building2 size={16} className="text-gray-400" />, label: "Floor", value: property?.floor && property?.totalFloors ? `${property.floor}st Floor / ${property.totalFloors}th Floor` : displayOrDash(property?.floor) },
                      ...(property?.square_feet ? [{ icon: <Ruler size={16} className="text-gray-400" />, label: "Carpet Area", value: `${displayOrDash(property.square_feet)} Sq.ft.` }] : []),
                      { icon: <CheckCircle size={16} className="text-gray-400" />, label: "Status", value: displayOrDash(property?.status) },
                      { icon: <IndianRupee size={16} className="text-gray-400" />, label: "Price", value: `${formatCurrency(property?.price)} (${displayOrDash(property?.priceType)})` },
                      { icon: <Home size={16} className="text-gray-400" />, label: "Furnishing", value: displayOrDash(property?.furnishing) },
                      ...((property?.possessionMonth || property?.possessionYear) ? [{
                        icon: <Calendar size={16} className="text-gray-400" />,
                        label: "Property Age",
                        value: [getMonthName(property?.possessionMonth), property?.possessionYear].filter(Boolean).join(' ')
                      }] : []),
                    ]).map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 px-3 py-2.5 border-b border-gray-100
            ${idx % 2 === 0 ? 'sm:border-r sm:border-gray-100' : ''}`}
                      >
                        <div className="w-7 h-7 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-xs text-gray-500 w-24 sm:w-28 shrink-0">
                          {item.label}
                        </span>
                        <span className="text-xs font-bold text-gray-900 break-words">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities & Furnishing - Responsive Grid */}
              {/* Amenities & Furnishing - Responsive Grid */}
              {/* Amenities & Furnishing - Compact without scroll */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-2 sm:mt-1 mb-2">
                {/* Amenities */}
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2 sm:p-2.5 ring-1 ring-gray-100">
                  <h3 className="font-semibold text-gray-900 text-[10px] sm:text-xs mb-1 sm:mb-1.5">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-1.5">
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
                        amenitiesList.map((name, i) => <AmenityPill key={i} name={name} size={8} compact />)
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-500 col-span-full">No amenities listed</span>
                      );
                    })()}
                  </div>
                </div>

                {/* Furnishing Items */}
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2 sm:p-2.5 ring-1 ring-gray-100">
                  <h3 className="font-semibold text-gray-900 text-[10px] sm:text-xs mb-1 sm:mb-1.5">Furnishing Items</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-1.5">
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
                          <FurnishingPill key={index} name={item} size={8} compact />
                        ))
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-500 col-span-full">No furnishing items listed</span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* AI Insights Banner - Responsive */}
              <div className="bg-white rounded-xl border border-purple-100 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="text-purple-600" size={14} />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">AI Property Analysis</h3>
                </div>

                {hasSubscription || !isLoggedIn ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'AI Score', value: `${displayOrDash(property?.aiScore ?? '94')}/100`, color: 'text-purple-600' },
                      { label: 'Growth', value: displayOrDash(property?.priceGrowth ?? '+12.5%'), color: 'text-green-600' },
                      { label: 'Investment', value: displayOrDash(property?.investmentGrade ?? 'A+'), color: 'text-blue-600' },
                      { label: 'ROI Potential', value: '18.2%', color: 'text-orange-600' },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-[11px] text-gray-500">{item.label}</span>
                        <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 blur-sm pointer-events-none select-none">
                      {[
                        { label: 'AI Score', value: '••/100', color: 'text-purple-600' },
                        { label: 'Growth', value: '+••.•%', color: 'text-green-600' },
                        { label: 'Investment', value: '••', color: 'text-blue-600' },
                        { label: 'ROI Potential', value: '••.•%', color: 'text-orange-600' },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-[11px] text-gray-500">{item.label}</span>
                          <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => handlePaywallOpen('ai-investment')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-md flex items-center gap-2">
                        <Lock size={13} />Unlock AI Analysis · ₹299
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 ring-1 mt-3 ring-gray-100">  <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="text-blue-600" size={14} />
                </div>
                <h2 className="font-medium text-gray-900 text-sm sm:text-base">AI Recommendations</h2>
              </div>

                {hasSubscription ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { label: 'Price Appreciation', value: '+15.2%', sub: 'Next 12 months', color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'Market Position', value: 'Top 10%', sub: 'In this locality', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Investment Timing', value: 'Excellent', sub: 'Buy now recommended', color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((item, i) => (
                      <div key={i} className={`${item.bg} rounded-lg p-3 border border-gray-100`}>
                        <div className="text-[11px] text-gray-500 mb-1">{item.label}</div>
                        <div className={`text-lg font-medium ${item.color}`}>{item.value}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 blur-md pointer-events-none select-none">
                      {[
                        { label: 'Price Appreciation', value: '+••.•%', sub: 'Next 12 months', color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Market Position', value: 'Top ••%', sub: 'In this locality', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Investment Timing', value: '••••••••', sub: 'Buy now recommended', color: 'text-orange-600', bg: 'bg-orange-50' },
                      ].map((item, i) => (
                        <div key={i} className={`${item.bg} rounded-lg p-3 border border-gray-100`}>
                          <div className="text-[11px] text-gray-500 mb-1">{item.label}</div>
                          <div className={`text-lg font-medium ${item.color}`}>{item.value}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 border border-gray-200 rounded-xl p-4 text-center w-[85%] sm:w-64 shadow-sm -mt-6">
                        <Lock className="text-blue-600 mx-auto mb-1.5" size={16} />
                        <p className="font-medium text-gray-900 text-sm mb-1">Premium AI Insights</p>
                        <p className="text-[11px] text-gray-500 mb-3 leading-snug">Detailed recommendations &amp; market analysis</p>
                        <button onClick={() => handlePaywallOpen('ai-recommendations')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium w-full">
                          Unlock for ₹299
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {/* Dynamic Location & Connectivity (Ultra Modern UI + View More / Show Less Toggle) */}
            {(() => {
              const dbPlaces: NearbyPlaceItem[] = Array.isArray(property?.nearby_places)
                ? (property.nearby_places
                  .map((p: any) => {
                    const name = p.name || p.title || p.label || 'Landmark';
                    const type = p.type || p.category || 'Landmark';
                    const distNum = parseFloat(String(p.distance || '1.0'));
                    if (!Number.isFinite(distNum) || distNum > 15.0) return null;
                    const catResult = classifyPlaceCategory(type, '', '', '', '', name);
                    return {
                      name,
                      category: (p.category && ['education', 'healthcare', 'transit', 'shopping', 'dining'].includes(p.category) ? p.category : catResult.category) as any,
                      type: catResult.typeName || type,
                      distance: distNum.toFixed(1),
                      unit: p.unit || 'km'
                    };
                  })
                  .filter(Boolean) as NearbyPlaceItem[])
                : [];

              const combinedPlacesMap = new Map<string, NearbyPlaceItem>();
              dbPlaces.forEach(p => combinedPlacesMap.set(p.name.toLowerCase().trim(), p));
              livePlaces.forEach(p => {
                const key = p.name.toLowerCase().trim();
                if (!combinedPlacesMap.has(key)) {
                  combinedPlacesMap.set(key, p);
                }
              });

              const allMergedPlaces = Array.from(combinedPlacesMap.values());

              const categories = [
                { id: 'all', label: 'All Places', icon: Compass },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'healthcare', label: 'Healthcare', icon: Stethoscope },
                { id: 'transit', label: 'Transport', icon: Train },
                { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
                { id: 'dining', label: 'Dining & Parks', icon: Utensils },
              ];

              const filteredPlaces = nearbyCategory === 'all'
                ? allMergedPlaces
                : allMergedPlaces.filter(p => p.category === nearbyCategory);

              const visiblePlaces = showAllPlaces ? filteredPlaces : filteredPlaces.slice(0, 6);

              const getCategoryStyle = (category: string) => {
                switch (category) {
                  case 'education':
                    return {
                      icon: <GraduationCap size={16} className="text-purple-600" />,
                      bg: 'bg-purple-50/80 border-purple-100',
                      badge: 'bg-purple-100 text-purple-700',
                    };
                  case 'healthcare':
                    return {
                      icon: <Stethoscope size={16} className="text-rose-600" />,
                      bg: 'bg-rose-50/80 border-rose-100',
                      badge: 'bg-rose-100 text-rose-700',
                    };
                  case 'transit':
                    return {
                      icon: <Train size={16} className="text-blue-600" />,
                      bg: 'bg-blue-50/80 border-blue-100',
                      badge: 'bg-blue-100 text-blue-700',
                    };
                  case 'shopping':
                    return {
                      icon: <ShoppingBag size={16} className="text-amber-600" />,
                      bg: 'bg-amber-50/80 border-amber-100',
                      badge: 'bg-amber-100 text-amber-700',
                    };
                  case 'dining':
                    return {
                      icon: <Utensils size={16} className="text-emerald-600" />,
                      bg: 'bg-emerald-50/80 border-emerald-100',
                      badge: 'bg-emerald-100 text-emerald-700',
                    };
                  default:
                    return {
                      icon: <MapPin size={16} className="text-slate-600" />,
                      bg: 'bg-slate-50 border-slate-200',
                      badge: 'bg-slate-200 text-slate-700',
                    };
                }
              };

              const getDistanceBadge = (distStr: string) => {
                const d = parseFloat(distStr);
                if (!Number.isFinite(d)) return <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{distStr}</span>;
                if (d <= 1.0) {
                  return (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      ⚡ {d} km
                    </span>
                  );
                } else if (d <= 3.0) {
                  return (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                      📍 {d} km
                    </span>
                  );
                } else {
                  return (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      🚘 {d} km
                    </span>
                  );
                }
              };

              return (
                <div className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200/80 my-5 backdrop-blur-sm">
                  {/* Modern Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#E6761D]/10 text-[#E6761D]">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h2 className="font-extrabold text-[#0b3856] text-base sm:text-xl tracking-tight">
                            Location &amp; Connectivity
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">
                            {[property.location, property.city].filter(Boolean).join(', ') || 'Explore surrounding hubs, transit & essential landmarks'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {Number.isFinite(property?.lat_display) && Number.isFinite(property?.lng_display) && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${property.lat_display},${property.lng_display}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E6761D] to-[#d66712] text-white hover:shadow-md transition-all duration-300 rounded-xl text-xs font-bold self-start sm:self-auto active:scale-95"
                      >
                        <Navigation size={14} />
                        Get Directions
                      </a>
                    )}
                  </div>

                  {/* Masked Interactive Map */}
                  <div className="relative rounded-2xl overflow-hidden mb-5 border border-slate-200 shadow-inner group">
                    <div className="absolute inset-0 z-10 cursor-pointer pointer-events-none" />
                    {Number.isFinite(property?.lat_display) && Number.isFinite(property?.lng_display) ? (
                      <iframe
                        src={getMaskedMapUrl(property.lat_display, property.lng_display)}
                        width="100%"
                        height="260"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="h-[180px] bg-slate-100/70 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <MapPin size={32} className="text-slate-300 animate-bounce" />
                        <span className="text-xs font-semibold text-slate-500">Location coordinates not specified</span>
                      </div>
                    )}
                  </div>

                  {/* Category Filter Pills Bar */}
                  <div className="mb-5 overflow-x-auto pb-1.5 scrollbar-none">
                    <div className="flex items-center gap-2">
                      {categories.map(cat => {
                        const Icon = cat.icon;
                        const isActive = nearbyCategory === cat.id;
                        const count = cat.id === 'all'
                          ? allMergedPlaces.length
                          : allMergedPlaces.filter(p => p.category === cat.id).length;

                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setNearbyCategory(cat.id);
                              setShowAllPlaces(false);
                            }}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${isActive
                                ? 'bg-[#0b3856] text-white border-[#0b3856] shadow-md shadow-[#0b3856]/20'
                                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                          >
                            <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                            <span>{cat.label}</span>
                            {count > 0 && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Places Grid */}
                  {livePlacesLoading && allMergedPlaces.length === 0 ? (
                    <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-2xs">
                      <div className="animate-pulse flex flex-col items-center gap-2 text-slate-400">
                        <Compass size={28} className="animate-spin text-[#E6761D]" />
                        <span className="text-xs font-semibold text-slate-600">Discovering nearby landmarks &amp; connectivity...</span>
                      </div>
                    </div>
                  ) : filteredPlaces.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {visiblePlaces.map((place, idx) => {
                          const style = getCategoryStyle(place.category);
                          return (
                            <div
                              key={idx}
                              className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:border-[#E6761D]/50 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2.5 rounded-xl border ${style.bg} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                  {style.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0b3856] transition-colors" title={place.name}>
                                    {place.name}
                                  </div>
                                  <div className="text-[10px] font-medium text-slate-400 truncate capitalize">
                                    {place.type}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                {getDistanceBadge(place.distance)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* View More / Show Less Toggle Button */}
                      {filteredPlaces.length > 6 && (
                        <div className="mt-5 text-center pt-2">
                          <button
                            onClick={() => setShowAllPlaces(prev => !prev)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#0b3856] shadow-2xs hover:shadow-xs transition-all duration-300 active:scale-95"
                          >
                            <span>{showAllPlaces ? 'Show Less' : `View More (${filteredPlaces.length - 6} more landmarks)`}</span>
                            {showAllPlaces ? (
                              <ChevronUp size={15} className="text-[#E6761D] transition-transform" />
                            ) : (
                              <ChevronDown size={15} className="text-[#E6761D] transition-transform" />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                      <MapPin size={26} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No landmarks listed in this category</p>
                      <p className="text-[11px] text-slate-400 mt-1">Click "Get Directions" above to explore live surroundings on Google Maps</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Reviews - Responsive */}
            {/* Reviews - Desktop only (mobile version is below grid) */}
            <div className="hidden lg:block bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 ring-1 ring-gray-100">
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
            <div className="hidden md:block lg:self-start lg:overflow-visible sticky top-24 z-10">
              <div className="sticky top-20">
                <div className="bg-white rounded-lg border border-blue-400 p-2 w-auto">

                  {/* Agent Info - Ultra Compact */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <User size={11} className="text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 text-[11px] truncate leading-tight">
                        {displayOrDash(property?.executiveTo?.name) === ' - '
                          ? ' - '
                          : property?.executiveTo?.name || '-'}
                      </h3>
                      <p className="text-[9px] text-gray-400 leading-tight">Property Executive</p>
                    </div>
                  </div>

                  <hr className="border-blue-100 mb-1.5" />

                  {/* Action Buttons Row - Ultra Compact with Light Background Colors */}
                  <div className="grid grid-cols-4 gap-0.5">

                    {/* Call - Light Blue Background */}
                    <button
                      onClick={callexecutiveTo}
                      className="flex flex-col items-center justify-center gap-0 py-1 rounded-md
            bg-blue-50 border border-blue-100
            hover:bg-blue-100 hover:border-blue-200
            transition-all text-[9px] text-gray-500"
                    >
                      <Phone size={11} className="text-blue-600" />
                      <span className="mt-0.5">Call</span>
                    </button>

                    {/* WhatsApp - Light Green Background */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        const phone = getexecutiveToPhone();
                        if (!phone) return;

                        const cc = phone.startsWith("91") || phone.length > 10 ? "" : "91";

                        const title =
                          property?.title ||
                          [property?.unitType, property?.type].filter(Boolean).join(" ") ||
                          "a property";

                        const loc =
                          property?.locationNormalized ||
                          property?.location ||
                          property?.city ||
                          "your listed property location";

                        const priceValue = Number(property?.price || 0);
                        const priceText = !isNaN(priceValue)
                          ? `₹${priceValue.toLocaleString("en-IN")}`
                          : "Price on request";

                        const slugValue =
                          property?.slug ||
                          property?.raw?.slug ||
                          (typeof window !== "undefined"
                            ? window.location.pathname.split("/").pop()
                            : "") ||
                          "";
                        const link = `${window.location.origin}/properties/${encodeURIComponent(
                          String(slugValue)
                        )}`;

                        const message = `Hi! I'm interested in ${title} at ${loc}. Price: ${priceText}. Can you provide more details?\n${link}`;

                        if (typeof window !== "undefined") {
                          window.open(
                            `https://wa.me/${cc}${phone}?text=${encodeURIComponent(message)}`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }
                      }}
                      className="flex flex-col items-center justify-center gap-0 py-1 rounded-md
            bg-green-50 border border-green-100
            hover:bg-green-100 hover:border-green-200
            transition-all text-[9px] text-gray-500"
                    >
                      <FaWhatsapp size={11} className="text-[#16a34a]" />
                      <span className="mt-0.5">WhatsApp</span>
                    </button>

                    {/* Message - Light Purple Background */}
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="flex flex-col items-center justify-center gap-0 py-1 rounded-md
            bg-purple-50 border border-purple-100
            hover:bg-purple-100 hover:border-purple-200
            transition-all text-[9px] text-gray-500"
                    >
                      <MessageCircle size={11} className="text-purple-600" />
                      <span className="mt-0.5">Message</span>
                    </button>

                    {/* Schedule - Light Cyan Background */}
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="flex flex-col items-center justify-center gap-0 py-1 rounded-md
            bg-cyan-50 border border-cyan-100
            hover:bg-cyan-100 hover:border-cyan-200
            transition-all text-[9px] text-gray-500"
                    >
                      <Calendar size={11} className="text-cyan-600" />
                      <span className="mt-0.5">Schedule</span>
                    </button>

                  </div>
                </div>
              </div>
            </div>
            {/* Mobile View - Fixed Bottom Bar */}
            <div className="fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom,0),8px)] z-[60] md:hidden pointer-events-none">
              <div className="mx-auto max-w-sm px-3">
                <div
                  className="pointer-events-auto bg-white rounded-2xl border border-gray-100
        shadow-[0_8px_32px_-4px_rgba(0,0,0,0.18)] px-3 py-2"
                  role="toolbar"
                  aria-label="Mobile quick actions"
                >
                  {/* executiveTo Info */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <User size={12} className="text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-[12px] truncate leading-tight">
                        {displayOrDash(property?.executiveTo?.name) === ' - ' ? ' - ' : property?.executiveTo?.name || 'Rohit Sharma'}
                      </h3>
                      <p className="text-[10px] text-gray-400">Property Executive</p>
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-1.5" />

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-4 gap-1.5">

                    {/* Call */}
                    <button
                      onClick={callexecutiveTo}
                      aria-label="Call executiveTo"
                      className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg
            bg-gray-50 border border-gray-100
            hover:bg-blue-50 hover:border-blue-100
            active:scale-95 transition-all text-[10px] text-gray-400"
                    >
                      <Phone size={13} className="text-blue-600" aria-hidden="true" />
                      <span>Call</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        const phone =
                          property?.executiveTo?.phone?.replace(/\D/g, "") ||
                          property?.executive?.phone?.replace(/\D/g, "") ||
                          "919637009639";

                        if (!phone) return;

                        const cc = phone.startsWith("91") || phone.length > 10 ? "" : "91";

                        const title =
                          property?.title ||
                          [property?.unitType, property?.type].filter(Boolean).join(" ") ||
                          "a property";

                        const loc =
                          property?.locationNormalized ||
                          property?.location ||
                          property?.city ||
                          "your listed property location";

                        const priceValue = Number(property?.price || 0);
                        const priceText = !isNaN(priceValue)
                          ? `₹${priceValue.toLocaleString("en-IN")}`
                          : "Price on request";

                        const slugValue =
                          property?.slug ||
                          property?.raw?.slug ||
                          (typeof window !== "undefined"
                            ? window.location.pathname.split("/").pop()
                            : "") ||
                          "";
                        const link = `${window.location.origin}/properties/${encodeURIComponent(
                          String(slugValue)
                        )}`;

                        const message = `Hi, I'm interested in ${title} at ${loc}. Price: ${priceText}. Can you share more details?\n${link}`;

                        window.open(
                          `https://wa.me/${cc}${phone}?text=${encodeURIComponent(message)}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                      aria-label="WhatsApp executiveTo"
                      className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg
            bg-gray-50 border border-gray-100
            hover:bg-green-50 hover:border-green-100
            active:scale-95 transition-all text-[10px] text-gray-400"
                    >
                      <FaWhatsapp size={13} className="text-[#16a34a]" aria-hidden="true" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Message */}
                    <button
                      onClick={() => setShowContactForm(true)}
                      aria-label="Message executiveTo"
                      className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg
            bg-gray-50 border border-gray-100
            hover:bg-purple-50 hover:border-purple-100
            active:scale-95 transition-all text-[10px] text-gray-400"
                    >
                      <MessageCircle size={13} className="text-purple-600" aria-hidden="true" />
                      <span>Message</span>
                    </button>

                    {/* Schedule */}
                    <button
                      onClick={() => setShowContactForm(true)}
                      aria-label="Schedule visit"
                      className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg
            bg-gray-50 border border-gray-100
            hover:bg-cyan-50 hover:border-cyan-100
            active:scale-95 transition-all text-[10px] text-gray-400"
                    >
                      <Calendar size={13} className="text-cyan-600" aria-hidden="true" />
                      <span>Schedule</span>
                    </button>

                  </div>
                </div>
              </div>
            </div>

            {/* Interest & Shortlisted */}
            <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Property Activity</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-1.5 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2.5">
                    <Eye className="text-green-600" size={15} />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Total Views</span>
                  </div>
                  <span className="text-green-600 text-xs sm:text-sm font-medium">{property?.views ?? property?.total_views ?? 0}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2.5">
                    <Heart className="text-blue-600" size={15} />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Shortlisted By</span>
                  </div>
                  <span className="text-blue-600 text-xs sm:text-sm font-medium">
                    {property?.shortlistedBy ?? property?.raw?.public_inquiries ?? (liked ? 1 : 0)} People
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2.5">
                    <Phone className="text-orange-600" size={15} />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Contact Requests</span>
                  </div>
                  <span className="text-orange-600 text-xs sm:text-sm font-medium">
                    {property?.contactRequests ?? property?.raw?.public_inquiries ?? 0} This Week
                  </span>
                </div>
              </div>
            </div>

            {/* Property Highlights */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden ring-1 ring-gray-100">
              <div className="px-2 py-1 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-900 text-sm">Property Highlights</h3>
              </div>

              {/* COMPACT 2-col grid (stays short) */}
              <div className="p-2 md:p-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Bedrooms", icon: <Bed size={14} className="text-blue-600" />, value: property?.bedrooms ?? "-" },
                  { label: "Bathrooms", icon: <Bath size={14} className="text-green-600" />, value: property?.bathrooms ?? "-" },
                  { label: "Parking", icon: <Car size={14} className="text-orange-600" />, value: property?.parkingQty ?? "-" },
                  { label: "Balcony", icon: <Building2 size={14} className="text-cyan-600" />, value: property?.balcony || "-" },
                  { label: "Property Type", icon: <Building size={14} className="text-blue-600" />, value: property?.type ?? "-" },
                  { label: "Furnishing", icon: <Home size={14} className="text-purple-600" />, value: property?.furnishing ?? "-" },
                  { label: "Facing", icon: <Target size={14} className="text-orange-600" />, value: property?.facing ?? "-" },
                ].map((it, i) => (
                  <div
                    key={i}
                    className="h-11 px-2 rounded-lg bg-white border border-gray-200/70 ring-1 ring-gray-50
                   flex items-center justify-between gap-2 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-lg
                           bg-gray-50 ring-1 ring-gray-100">
                        {it.icon}
                      </span>
                      <span className="text-[12px] font-medium text-gray-600">{it.label}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-gray-900 leading-none">{it.value}</span>
                  </div>
                ))}
              </div>
            </div>


            {/* Price Breakdown - UPDATED FOR RESALE PROPERTIES */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 ring-1 ring-gray-100">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-4">
                {isRental ? 'Rent Details' : 'Price Breakdown'}
              </h3>

              {isRental ? (
                <div className="space-y-4">
                  {/* Monthly Rent */}
                  <div className="bg-[#E6761D]/5 p-3.5 rounded-xl border border-[#E6761D]/10 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold">Monthly Rent</span>
                      <span className="text-[10px] text-gray-400 font-medium">Excluding utility charges</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-[#E6761D] block">
                        ₹{(property.monthly_rent ?? property.price)?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">/ month</span>
                    </div>
                  </div>

                  {/* Deposit Breakdown */}
                  <div className="space-y-2.5 mb-2">
                    <div className="flex justify-between text-sm py-1 border-b border-dashed border-gray-100">
                      <span className="text-gray-600 font-medium">Security Deposit</span>
                      <span className="font-semibold text-gray-900">
                        ₹{(property.raw?.security_deposit ?? property.raw?.deposit ?? (property.price * 3))?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm py-1 border-b border-dashed border-gray-100">
                      <span className="text-gray-600 font-medium">Maintenance Charges</span>
                      <span className="font-semibold text-gray-900">
                        {property.raw?.maintenance_charge || 'Included'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-600 font-medium">Brokerage Fee</span>
                      <span className="font-semibold text-green-600 flex items-center">
                        <ShieldCheck size={14} className="mr-1" /> No Brokerage
                      </span>
                    </div>
                  </div>

                  {/* Lease terms */}
                  <div className="bg-gray-50 rounded-xl p-3.5 space-y-2.5 border border-gray-200/50">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 flex items-center">
                      <FileText size={14} className="mr-1 text-[#E6761D]" /> Lease terms
                    </h4>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Preferred Tenant</span>
                      <span className="font-semibold text-gray-900">{property.raw?.preferred_tenants || property.raw?.preferredTenant || 'Family / Bachelors'}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Lock-in Period</span>
                      <span className="font-semibold text-gray-900">{property.raw?.lock_in_period || property.raw?.lockInPeriod || '12 Months'}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Agreement Duration</span>
                      <span className="font-semibold text-gray-900">{property.raw?.agreement_duration || property.raw?.agreementDuration || '24 Months'}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Available From</span>
                      <span className="font-semibold text-gray-900">{formatAvailableFromDate(property.raw?.available_from || property.raw?.availableFrom)}</span>
                    </div>
                  </div>
                </div>
              ) : propertyCharges ? (
                <>
                  <div className="space-y-3">
                    {/* Base Price */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-gray-700">Base Price</span>
                      <span className="font-medium text-gray-900">{formatCurrency(propertyCharges.basePrice)}</span>
                    </div>

                    {/* Additional Charges */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Total Taxes & Charges</h4>

                      {/* Stamp Duty - FIXED 7% */}
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Stamp Duty </span>
                          <span className="text-xs text-green-600 font-medium ml-1">
                            7%
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(propertyCharges.stampDuty.amount)}
                        </span>
                      </div>

                      {/* Registration - FIXED 1% */}
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Registration Charges </span>
                          <span className="text-xs text-green-600 font-medium ml-1">
                            1% or (Max ₹30,000)
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(propertyCharges.registration.amount)}
                        </span>
                      </div>

                      {/* Legal Documentation - Fixed ₹10,000 */}
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Legal & Documentation</span>
                          <span className="text-xs text-blue-600 font-medium ml-1">
                            (₹10,000-15,000)
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(propertyCharges.legalFees)}
                        </span>
                      </div>


                      {/* Note about removed charges for resale properties */}
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <p className="flex items-start">
                          <CheckCircle size={12} className="mr-1 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>
                            <strong>For Resale Properties:</strong> No GST,Society Charges (at actual).
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Total Additional Cost */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Taxes & Charges</span>
                        <span className="font-medium">
                          {formatCurrency(propertyCharges.additionalCharges)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        That's {propertyCharges.percentageOverBase.toFixed(1)}% over the base price
                      </div>
                    </div>

                    {/* Total Cost with Highlight - EXACT VALUE DISPLAY */}
                    <div className="border-t pt-3 flex items-center justify-between bg-[#E6761D]/5 p-3 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-900 text-base">Total Cost</span>
                        <div className=" text-xs text-gray-500 mt-1">
                          Including: 7% Stamp Duty + Registration
                          <br />+ Legal Fees
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#E6761D] text-lg block">
                          {formatExactCurrency(propertyCharges.totalCost)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Exact value
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isRental && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900 flex items-center">
                          <Calculator size={18} className="mr-2" />
                          Smart EMI Calculator
                        </h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {isReadyToMove(property) ? 'Resale Property' : 'Resale Property'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Loan Percentage Selector */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Loan Percentage</span>
                            <span className="font-semibold">{loanPercentage}%</span>
                          </div>
                          <div className="flex space-x-2 mb-3">
                            {[70, 75, 80, 85, 90].map((percent) => (
                              <button
                                key={percent}
                                onClick={() => handleLoanPercentageChange(percent)}
                                className={`flex-1 py-1.5 text-xs rounded ${loanPercentage === percent ? 'bg-[#E6761D] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                              >
                                {percent}%
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Loan Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white p-2 rounded border">
                            <div className="text-gray-600 text-xs">Loan Amount</div>
                            <div className="font-bold text-blue-700">{formatCurrency(loanAmount)}</div>
                            <div className="text-xs text-gray-500">({loanPercentage}% of property value)</div>
                          </div>

                          <div className="bg-white p-2 rounded border">
                            <div className="text-gray-600 text-xs">Self Payment</div>
                            <div className="font-bold text-green-700">
                              {formatCurrency(propertyCharges.totalCost - loanAmount)}
                            </div>
                            <div className="text-xs text-gray-500">({100 - loanPercentage}% required)</div>
                          </div>
                        </div>

                        {/* Interest Rate Selector */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Interest Rate</span>
                            <span className="font-semibold">{interestRate}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="7.5"
                              max="12"
                              step="0.1"
                              value={interestRate}
                              onChange={(e) => handleInterestRateChange(Number(e.target.value))}
                              className="flex-1 accent-[#E6761D]"
                            />
                            <span className="text-xs font-semibold w-10 text-right">{interestRate}%</span>
                          </div>
                        </div>

                        {/* Loan Tenure Selector */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Loan Tenure</span>
                            <span className="font-semibold">{tenureYears} years</span>
                          </div>
                          <div className="flex space-x-2">
                            {[15, 20, 25, 30].map((years) => (
                              <button
                                key={years}
                                onClick={() => handleTenureChange(years)}
                                className={`flex-1 py-1.5 text-xs rounded ${tenureYears === years ? 'bg-[#E6761D] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                              >
                                {years} years
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* EMI Result */}
                        {emiDetails && (
                          <div className="bg-white p-3 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-700">Monthly EMI</span>
                              <span className="text-2xl font-bold text-[#E6761D]">
                                ₹{emiDetails.emi?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              For {loanAmount >= 10000000 ? '₹' + (loanAmount / 10000000).toFixed(2) + 'Cr' : '₹' + (loanAmount / 100000).toFixed(2) + 'L'}
                              loan at {interestRate}% for {tenureYears} years
                            </div>

                            {/* EMI Breakdown */}
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                              <div className="text-center p-2 bg-blue-50 rounded">
                                <div className="text-gray-600">Principal</div>
                                <div className="font-semibold">{formatCurrency(emiDetails.principal)}</div>
                              </div>
                              <div className="text-center p-2 bg-red-50 rounded">
                                <div className="text-gray-600">Interest</div>
                                <div className="font-semibold">{formatCurrency(emiDetails.totalInterest)}</div>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded">
                                <div className="text-gray-600">Total</div>
                                <div className="font-semibold">{formatCurrency(emiDetails.totalPayment)}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick EMI Options */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { years: 15, rate: 8.4 },
                            { years: 20, rate: 8.5 },
                            { years: 25, rate: 8.6 },
                          ].map((option, idx) => {
                            const quickEmi = calculateEMI(loanAmount, option.rate, option.years);
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setTenureYears(option.years);
                                  setInterestRate(option.rate);
                                }}
                                className={`text-xs p-2 bg-white border rounded hover:bg-blue-50 transition ${tenureYears === option.years && Math.abs(interestRate - option.rate) < 0.1 ? 'border-[#E6761D] bg-blue-50' : ''}`}
                              >
                                <div className="font-medium">{option.years} Years</div>
                                <div className="text-gray-600">{option.rate}%</div>
                                <div className="text-[#E6761D] font-semibold">
                                  ₹{quickEmi.emi?.toLocaleString('en-IN')}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Disclaimer */}
                        <div className="text-xs text-gray-500 mt-2">
                          <p className="flex items-start">
                            <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                            EMI calculated for illustrative purposes. Actual rates may vary based on credit score, bank policies, and market conditions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-pulse text-gray-400">Calculating charges...</div>
                </div>
              )}
            </div>

            {/* AI Value Analysis or AI Investment Analysis depending on isRental */}
            {isRental ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-5 border border-indigo-100/50 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
                  <TrendingUp size={120} className="text-indigo-600" />
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <Bot className="text-indigo-600 animate-pulse" size={18} />
                  <h3 className="font-bold text-indigo-950 text-sm">AI Rental Valuation Analysis</h3>
                </div>

                <p className="text-xs text-indigo-900 leading-relaxed mb-4 font-medium">
                  Based on AI analysis of rent listings in <strong>{property.locationNormalized || property.location || property.city || 'this area'}</strong>:
                </p>

                <div className="space-y-3">
                  <div className="bg-white/80 p-3 rounded-lg border border-indigo-200/40 text-xs">
                    <span className="font-bold text-indigo-950 block mb-0.5">Rent Estimate</span>
                    <span className="text-gray-700">Fair price deal. Under 3% of average market rent trends.</span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-indigo-200/40 text-xs">
                    <span className="font-bold text-indigo-950 block mb-0.5">Security Deposit Advantage</span>
                    <span className="text-gray-700">Low upfront security deposit rules compared to nearby societies.</span>
                  </div>
                </div>
              </div>
            ) : (
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
            )}

            <PublicSimilarProperties
              properties={similarProperties}
              loading={similarPropertiesLoading}
              currentPropertyId={property?.id}
              currentPropertySlug={property?.slug || (property?.raw as any)?.slug}
              debug={true}
            />

          </div>
        </div>

        <div className="bg-white lg:hidden  rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 ring-1 mt-2 ring-gray-100 order-last lg:order-none">              <h2 className="font-bold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Customer Reviews</h2>

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


      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0b3856]">Call Back Request</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-[#0b3856]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3">
              {/* Salutation + Name Row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Salutation from Master Data */}
                <div>
                  <label className="block text-sm font-medium text-[#0b3856] mb-1">
                    Salutation *
                  </label>
                  <select
                    value={contactForm.salutation}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, salutation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Select</option>
                    {salutationOptions.map((option: any) => (
                      <option
                        key={option.value || option.label}
                        value={option.value || option.label}
                      >
                        {option.label || option.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#0b3856] mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#0b3856] mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] focus:border-transparent text-sm"
                  required
                  maxLength={10}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0b3856] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] focus:border-transparent text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 border border-[#0b3856] text-[#0b3856] rounded-lg hover:bg-[#0b3856] hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#E6761D] text-white rounded-lg hover:bg-[#CC6A1A] transition-colors text-sm"
                >
                  Submit
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

          const firstImageMedia = (property?.mediaItems || []).find((m: any) => m.type !== 'video');
          const shareImage = firstImageMedia?.url || property?.raw?.image || property?.raw?.photo || '';

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
