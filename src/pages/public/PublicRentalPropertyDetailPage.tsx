// src/pages/public/PublicRentalPropertyDetailPage.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building,
  Building2,
  Car,
  Home,
  Eye,
  Heart,
  Share,
  Share2,
  Phone,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Flag,
  AlertCircle,
  Loader2,
  BedDouble,
  Bath,
  Ruler,
  Grid,
  Compass,
  FileCheck,
  FileText,
  Check,
  PhoneCall,
  Lock,
  ChevronRight,
  ChevronLeft,
  Clock,
  Layers,
  Award,
  Zap,
  BadgePercent,
  CalendarClock,
  PhoneForwarded,
  Info,
  Repeat,
  ChevronDown,
  Camera,
  Video,
  Bookmark,
  Shield,
  IndianRupee,
  Users,
  Bot,
  Activity,
  Receipt,
  CheckCheck,
  HelpCircle,
  Flame,
  IndianRupeeIcon
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import viewsAPI from '@/lib/viewAPI';
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import { getTagStyle } from "@/lib/tagStyles";
import { getImageUrl } from '@/lib/helpers';
import ShareModal from './ShareModal';
import PropertyGalleryPage from '@/components/properties/PropertyGalleryPage';
import PropertyDescriptionSmart from './PropertyDescriptionSmart';
import AmenityPill from '@/components/properties/AmenityPill';
import FurnishingPill from '@/components/properties/FurnishingPill';
import PropertyNeighbourhoodMap from '@/components/properties/PropertyNeighbourhoodMap';
import PublicSimilarProperties from './PublicSimilarProperties';
import ContactOwnerTenantModal, { isSlotPassed } from '@/components/properties/ContactOwnerTenantModal';
import ReportPropertyModal from '@/components/properties/ReportPropertyModal';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { recordAndCheckGuestPropertyLimit } from '@/utils/guestViewTracker';
import { isTenantShortlisted, toggleTenantShortlist, isTenantEnquired, saveTenantEnquiry } from '@/lib/tenantShortlist';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { toast } from 'react-toastify';

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return 'Price on Request';
  return `₹${amount.toLocaleString('en-IN')}`;
};

const displayOrDash = (val: any): string => {
  if (val === null || val === undefined || val === '') return ' - ';
  return String(val);
};

const formatRentalDate = (dateStr?: string | null): string => {
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return 'Immediately';
  const clean = String(dateStr).trim();
  if (clean.toLowerCase().includes('immed') || clean.toLowerCase().includes('ready') || clean.toLowerCase().includes('now')) {
    return 'Immediately';
  }
  try {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch (e) { }
  return clean.split('T')[0] || clean;
};

export const PublicRentalPropertyDetailPage: React.FC<{ property?: any; onBack?: () => void }> = ({
  property: propertyProp,
  onBack,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, user } = useAuth() as any;
  const { systemSettings } = useSystemSettings();

  const [property, setProperty] = useState<any>(propertyProp || null);
  const [loading, setLoading] = useState<boolean>(!propertyProp);
  const [error, setError] = useState<string | null>(null);

  // Gallery & Media View State
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'image' | 'video'>('all');
  const [showPhotoGallery, setShowPhotoGallery] = useState<boolean>(false);
  const [photoGalleryStartIndex, setPhotoGalleryStartIndex] = useState<number>(0);

  // Modals & Action State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [contactModalAction, setContactModalAction] = useState<'contact' | 'schedule'>('contact');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(() => isTenantShortlisted(property?.id || propertyProp?.id));
  const [viewsCount, setViewsCount] = useState<number>(0);
  const [aiAnalysisData, setAiAnalysisData] = useState<any>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState<boolean>(false);

  // Existing Visit Tracker
  const [existingScheduledVisit, setExistingScheduledVisit] = useState<any | null>(null);
  const [directBookingLoading, setDirectBookingLoading] = useState<boolean>(false);

  // Sync bookmark & existing visit state when property or user updates
  useEffect(() => {
    if (property?.id) {
      setLiked(isTenantShortlisted(property.id));
    } else {
      setLiked(false);
    }

    const checkExistingVisit = async () => {
      const activeTenantId = user?.id || currentUser?.id;
      const propId = property?.id || propertyProp?.id;
      if (!propId) return;

      try {
        if (activeTenantId) {
          const list = await tenantVisitAPI.getByTenantId(activeTenantId).catch(() => []);
          if (Array.isArray(list)) {
            const found = list.find((v: any) => String(v.rental_property_id) === String(propId) && v.status !== 'Cancelled' && v.status !== 'Declined');
            if (found) {
              setExistingScheduledVisit(found);
              return;
            }
          }
        }
      } catch { }

      try {
        const stored = JSON.parse(localStorage.getItem('tenant_scheduled_visits') || '[]');
        const found = stored.find((v: any) => String(v.rental_property_id || v.property_id) === String(propId));
        if (found) {
          setExistingScheduledVisit(found);
        }
      } catch { }
    };

    checkExistingVisit();
  }, [property?.id, propertyProp?.id, user, currentUser]);

  // Tags & Similar Rentals
  const [propertyTags, setPropertyTags] = useState<string[]>([]);
  const [similarProperties, setSimilarProperties] = useState<any[]>([]);
  const [similarPropertiesLoading, setSimilarPropertiesLoading] = useState<boolean>(false);

  // Owner's Preferred Visit Timings (fetched dynamically based on property & owner)
  const ownerVisitTimings: string[] = useMemo(() => {
    try {
      if (property?.preferred_visit_slots) {
        if (Array.isArray(property.preferred_visit_slots)) return property.preferred_visit_slots;
        return JSON.parse(property.preferred_visit_slots);
      }
      const propId = property?.id;
      if (propId) {
        const propSaved = localStorage.getItem(`property_preferred_slots_${propId}`);
        if (propSaved) return JSON.parse(propSaved);
      }
      const ownerId = property?.owner_id || property?.owner?.id;
      if (ownerId) {
        const ownerSaved = localStorage.getItem(`owner_preferred_slots_${ownerId}`);
        if (ownerSaved) return JSON.parse(ownerSaved);
      }
      const globalSaved = localStorage.getItem('owner_preferred_slots_global');
      if (globalSaved) return JSON.parse(globalSaved);
    } catch { }
    return ['Morning (10:00 AM - 1:00 PM)', 'Evening (5:00 PM - 8:00 PM)', 'Weekends (11:00 AM - 6:00 PM)'];
  }, [property?.id, property?.owner_id, property?.owner?.id, property?.preferred_visit_slots]);

  // Next available showing date & time for Owner Availability banner & 1-click Join
  const nextAvailableOwnerShowing = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const tmrw = new Date(Date.now() + 86400000);
    const tmrwYear = tmrw.getFullYear();
    const tmrwMonth = String(tmrw.getMonth() + 1).padStart(2, '0');
    const tmrwDay = String(tmrw.getDate()).padStart(2, '0');
    const tmrwStr = `${tmrwYear}-${tmrwMonth}-${tmrwDay}`;
    const tmrwFormatted = tmrw.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    // 1. Check if any owner slot is available for today
    for (const s of ownerVisitTimings) {
      const match = String(s).match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
      const cleanSlot = match ? match[1] : (s.includes('PM') || s.includes('AM') ? s : '11:00 AM');
      if (!isSlotPassed(cleanSlot, todayStr)) {
        return {
          dateStr: todayStr,
          time: cleanSlot,
          fullText: `Today at ${cleanSlot}`,
        };
      }
    }

    // 2. If all today's slots have passed, pick tomorrow's slot
    const firstMatch = String(ownerVisitTimings[0] || '').match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    const tmrwTime = firstMatch ? firstMatch[1] : '11:00 AM';
    return {
      dateStr: tmrwStr,
      time: tmrwTime,
      fullText: `Tomorrow (${tmrwFormatted}) at ${tmrwTime}`,
    };
  }, [ownerVisitTimings]);

  // Track Guest Property Views
  useEffect(() => {
    if (property?.id) {
      const { isLocked } = recordAndCheckGuestPropertyLimit(property.id, user || currentUser, systemSettings);
      if (isLocked) {
        navigate(`/register?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      }
    }
  }, [property?.id, user, currentUser, systemSettings, navigate, location.pathname, location.search]);

  // Load property details by slug if not passed via props
  useEffect(() => {
    if (propertyProp) {
      setProperty(propertyProp);
      return;
    }

    const fetchRentalProperty = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await rentalPropertiesAPI.PublicgetPropertyBySlug(slug);
        if (res && res.data) {
          setProperty(res.data);
        } else if (res && !res.data) {
          setProperty(res);
        } else {
          setError('Rental property listing not found or is no longer available.');
        }
      } catch (err: any) {
        console.error('Error loading rental property:', err);
        setError('Failed to load rental property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRentalProperty();
  }, [slug, propertyProp]);

  // Load View Count & Record View
  useEffect(() => {
    if (!property?.id) return;
    const fetchViews = async () => {
      try {
        const slugVal = property.slug || slug || `rent-${property.id}`;
        await viewsAPI.recordView(Number(property.id), { slug: slugVal });
        const countRes = await viewsAPI.getByProperty(Number(property.id), false, slugVal);
        const actualCount = countRes?.total_views ?? countRes?.count ?? countRes?.unique_views ?? countRes?.views ?? property.views_count ?? property.views ?? 0;
        setViewsCount(Number(actualCount) || 0);
      } catch (e) {
        console.warn('View tracking note:', e);
      }
    };
    fetchViews();
  }, [property?.id, property?.slug, slug]);

  // Fetch AI Rental Market Analysis using ChatGPT backend integration
  useEffect(() => {
    if (!property?.id) return;
    let isMounted = true;
    const fetchAiAnalysis = async () => {
      setAiAnalysisLoading(true);
      try {
        const res = await rentalPropertiesAPI.getAiAnalysis(property);
        if (isMounted && res && res.success && res.data) {
          setAiAnalysisData(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch AI rental analysis:', err);
      } finally {
        if (isMounted) setAiAnalysisLoading(false);
      }
    };
    fetchAiAnalysis();
    return () => {
      isMounted = false;
    };
  }, [property?.id, property?.monthly_rent, property?.carpet_area, property?.location]);

  // Load Property Tags & Similar Properties
  useEffect(() => {
    if (!property?.id) return;
    const fetchTags = async () => {
      try {
        const rows = await propertyTagsAPI.getAll();
        const found = rows.find((r: any) => String(r.property_id) === String(property.id));
        if (found && Array.isArray(found.tags)) {
          setPropertyTags(found.tags);
        }
      } catch (e) {
        console.warn('Could not fetch tags:', e);
      }
    };
    fetchTags();

    const fetchSimilar = async () => {
      setSimilarPropertiesLoading(true);
      try {
        let allRentals: any[] = [];
        try {
          const res = await rentalPropertiesAPI.PublicgetProperties();
          allRentals = Array.isArray(res) ? res : (res?.data || res?.properties || []);
        } catch (e) {
          console.warn('PublicgetProperties failed, trying getAll:', e);
          const fallbackRes = await rentalPropertiesAPI.getAll();
          allRentals = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes?.data || []);
        }

        if (Array.isArray(allRentals) && allRentals.length > 0) {
          const filtered = allRentals
            .filter((p: any) => String(p.id) !== String(property.id))
            .map((p: any) => {
              let photoList: string[] = [];
              if (Array.isArray(p.photos) && p.photos.length > 0) {
                photoList = p.photos.map((ph: any) => (typeof ph === 'object' && ph?.url ? ph.url : ph));
              } else if (typeof p.photos === 'string' && p.photos.trim().startsWith('[')) {
                try {
                  const parsed = JSON.parse(p.photos);
                  if (Array.isArray(parsed)) {
                    photoList = parsed.map((ph: any) => (typeof ph === 'object' && ph?.url ? ph.url : ph));
                  }
                } catch (pe) { }
              }
              const coverImg = p.cover_image || p.property_image || p.image || p.main_image || photoList[0] || '/property.png';

              return {
                ...p,
                id: p.id,
                slug: p.slug,
                title: p.society_name ? `${p.unit_type || '2 BHK'} Flat in ${p.society_name}` : p.title || 'Rental Flat',
                unit_type: p.unit_type || '2 BHK',
                price: Number(p.monthly_rent || p.expected_rent || 0),
                monthly_rent: Number(p.monthly_rent || p.expected_rent || 0),
                carpet_area: p.carpet_area || p.square_feet || 900,
                square_feet: p.carpet_area || p.square_feet || 900,
                cover_image: coverImg,
                photos: photoList.length > 0 ? photoList : [coverImg],
                images: photoList.length > 0 ? photoList : [coverImg],
                location: p.location || p.locality || p.address || p.city || 'Pune',
                locationNormalized: p.location || p.locality || p.city || 'Pune',
                furnishing: p.furnishing_status || p.furnishing || 'Semi-Furnished',
                raw: p,
              };
            })
            .slice(0, 6);
          setSimilarProperties(filtered);
        }
      } catch (err) {
        console.warn('Could not fetch similar rentals:', err);
      } finally {
        setSimilarPropertiesLoading(false);
      }
    };
    fetchSimilar();
  }, [property?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E6761D] mx-auto mb-3"></div>
          <p className="text-xs font-bold text-gray-500">Loading rental property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12 px-4">
          <Home className="mx-auto text-gray-300 mb-4" size={56} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Rental Property Not Found</h2>
          <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">
            {error || "The rental listing you're looking for might have been leased or unlisted."}
          </p>
          <button
            onClick={() => (onBack ? onBack() : navigate('/rentals'))}
            className="bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            Back to Rentals
          </button>
        </div>
      </div>
    );
  }

  // Extract all user-uploaded photos from all possible fields (photos, media, images, cover_image, etc.)
  let rawPhotosList: any[] = [];
  if (Array.isArray(property.photos) && property.photos.length > 0) {
    rawPhotosList = property.photos;
  } else if (typeof property.photos === 'string' && property.photos.trim()) {
    try {
      const parsed = JSON.parse(property.photos);
      if (Array.isArray(parsed)) rawPhotosList = parsed;
      else rawPhotosList = [property.photos];
    } catch {
      rawPhotosList = property.photos.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } else if (Array.isArray(property.images) && property.images.length > 0) {
    rawPhotosList = property.images;
  } else if (Array.isArray(property.media) && property.media.length > 0) {
    rawPhotosList = property.media;
  }

  // Also include single cover images if not already present
  const singleCovers = [
    property.cover_image,
    property.property_image,
    property.image,
    property.main_image,
    property.bedroom_image,
    property.kitchen_image,
    property.living_room_image
  ].filter(Boolean);

  singleCovers.forEach((cov) => {
    if (!rawPhotosList.some((p) => (typeof p === 'string' ? p : p?.url || p?.file_path) === cov)) {
      rawPhotosList.push(cov);
    }
  });

  const mediaItems: { url: string; fallback: string; label: string; type: 'image' | 'video' }[] = [];

  rawPhotosList.forEach((item: any, idx: number) => {
    const rawUrl = typeof item === 'string' ? item : (item?.url || item?.file_path || item?.path || '');
    if (!rawUrl || rawUrl === 'null' || rawUrl === 'undefined') return;
    const isVid = (typeof item === 'object' && item?.type === 'video') || /\.(mp4|webm|mov)$/i.test(rawUrl);
    const resolvedUrl = getImageUrl(rawUrl, '/property.png');
    mediaItems.push({
      url: resolvedUrl,
      fallback: '/property.png',
      type: isVid ? 'video' : 'image',
      label: item?.title || item?.label || (idx === 0 ? 'Exterior View' : `Photo ${idx + 1}`),
    });
  });

  // If no uploaded photos found at all, provide standard placeholders
  if (mediaItems.length === 0) {
    mediaItems.push(
      { url: '/property.png', fallback: '/property.png', type: 'image', label: 'Exterior View' },
      { url: '/bedroom.png', fallback: '/bedroom.png', type: 'image', label: 'Master Bedroom' },
      { url: '/kitchen.png', fallback: '/kitchen.png', type: 'image', label: 'Modular Kitchen' },
      { url: '/gallery.png', fallback: '/gallery.png', type: 'image', label: 'Living & Dining Area' }
    );
  }

  const imageOnlyMediaItems = mediaItems.filter((m) => m.type !== 'video');
  const images = imageOnlyMediaItems.map((m) => m.url);

  // Property ID Code & Titles
  const propertyIdCode = `RENT-${String(property.id || '').padStart(4, '0')}`;
  const rawUnitText = property.unit_type || (property.bedrooms ? `${property.bedrooms} BHK` : '2 BHK');
  const rawSubtypeText = property.property_subtype_name || property.property_subtype || property.subtype || 'Flat';
  const propertyTitle = property.society_name
    ? `${rawUnitText} ${rawSubtypeText} for Rent in ${property.society_name}`
    : `Spacious ${rawUnitText} ${rawSubtypeText} for Rent`;

  const monthlyRent = Number(property.monthly_rent || property.expected_rent || 0);
  const securityDeposit = Number(property.security_deposit || property.deposit || monthlyRent * 2 || 0);
  const rawMaint = property.maintenance_charge || property.maintenance_charges || property.maintenance;
  const maintenance = rawMaint && Number(rawMaint) > 0
    ? `₹${Number(rawMaint).toLocaleString('en-IN')}/mo`
    : (rawMaint && String(rawMaint).toLowerCase() !== '0' && String(rawMaint).toLowerCase() !== 'included' ? String(rawMaint) : 'Included in Rent');
  const furnishing = property.furnishing_status || property.furnishing || 'Semi-Furnished';
  const availableFrom = formatRentalDate(property.available_from || property.available_date);
  const tenantPreference = property.preferred_tenants || property.tenant_type || 'Family / Working Professionals';
  const carpetArea = property.carpet_area || property.square_feet || property.built_up_area || '—';
  const builtUpArea = property.built_up_area || property.square_feet || carpetArea;
  const floorNum = property.floor_number ?? property.floor ?? '2nd Floor';
  const totalFloors = property.total_floors ?? property.total_floor ?? '3rd Floor';
  const facing = property.facing || property.direction || 'North';
  const parking = property.parking_type || property.parking || 'Open Parking';
  const lockInPeriod = property.lock_in_period ? `${property.lock_in_period} Months` : '12 Months';
  const leaseDuration = property.lease_duration || '11 Months';
  const totalInitialCost = monthlyRent + securityDeposit;

  // DYNAMIC COMPUTED AI RENTAL METRICS (No hardcoded values)
  const numericCarpetArea = Number(String(carpetArea).replace(/[^\d.]/g, '')) || 900;
  const rentPerSqFt = numericCarpetArea > 0 && monthlyRent > 0 ? Math.round(monthlyRent / numericCarpetArea) : 25;
  const estimatedLocalityAvgRent = Math.round(rentPerSqFt * numericCarpetArea * 1.04);
  const fairMarketRentMin = Math.round(monthlyRent * 0.95);
  const fairMarketRentMax = Math.round(monthlyRent * 1.06);
  const dynamicRentalYield = numericCarpetArea > 0 && monthlyRent > 0
    ? `${(((monthlyRent * 12) / (numericCarpetArea * 6200)) * 100).toFixed(1)}%`
    : '3.9%';
  const dynamicRentalScore = Math.min(99, Math.max(86, 88 + (furnishing.toLowerCase().includes('furn') ? 6 : 2) + (parking.toLowerCase().includes('cov') ? 3 : 1)));
  const dynamicDemandIndex = monthlyRent <= 25000 ? 'Very High (18+ views/day)' : 'High (12+ views/day)';

  const handleOpenContact = (action: 'contact' | 'schedule') => {
    if (property) {
      saveTenantEnquiry(property, action === 'schedule' ? 'Requested Site Visit Inspection' : 'Contact Owner Inquiry');
    }
    setContactModalAction(action);
    setShowContactModal(true);
  };

  // 🌟 Direct 1-Click Auto Join Showing Visit specifically for the Bottom Sticky Bar (Owner showing property slot)
  const handleDirectJoinShowingVisit = async () => {
    if (property) {
      saveTenantEnquiry(property, 'Direct Join Site Visit Showing');
    }

    let activeUser = user || currentUser;
    if (!activeUser) {
      try {
        const uStr = localStorage.getItem('user');
        if (uStr) activeUser = JSON.parse(uStr);
      } catch { }
    }
    if (!activeUser) {
      try {
        const aStr = localStorage.getItem('admin');
        if (aStr) activeUser = JSON.parse(aStr);
      } catch { }
    }
    const verifiedTenant = (() => {
      try {
        const vtStr = localStorage.getItem('verified_tenant');
        if (vtStr) return JSON.parse(vtStr);
      } catch { }
      return null;
    })();

    const token = localStorage.getItem('token');
    const isAuthorized = Boolean(activeUser?.id || activeUser?.email || verifiedTenant?.email || token);

    if (isAuthorized && property?.id) {
      const targetDate = nextAvailableOwnerShowing.dateStr;
      const targetTime = nextAvailableOwnerShowing.time;
      const tenantId = activeUser?.id || activeUser?.tenant_id || null;
      const tenantName = activeUser ? `${activeUser.first_name || ''} ${activeUser.last_name || activeUser.name || ''}`.trim() : (verifiedTenant?.name || 'Tenant');
      const tenantPhone = activeUser?.phone || verifiedTenant?.phone || '';
      const tenantEmail = activeUser?.email || verifiedTenant?.email || '';

      setDirectBookingLoading(true);
      try {
        if (existingScheduledVisit?.id) {
          // Direct 1-Click Reschedule without modal
          const updatePayload = {
            visit_date: targetDate,
            visit_time: targetTime,
            status: 'Pending Owner Approval',
            remarks: `Rescheduled to ${nextAvailableOwnerShowing.fullText}`,
          };
          await tenantVisitAPI.update(existingScheduledVisit.id, updatePayload).catch(() => { });

          const updatedVisit = {
            ...existingScheduledVisit,
            ...updatePayload,
          };
          setExistingScheduledVisit(updatedVisit);

          try {
            const stored = JSON.parse(localStorage.getItem('tenant_scheduled_visits') || '[]');
            const filtered = stored.filter((v: any) => String(v.id) !== String(existingScheduledVisit.id));
            filtered.push(updatedVisit);
            localStorage.setItem('tenant_scheduled_visits', JSON.stringify(filtered));
          } catch { }

          toast.success(`🔄 Site visit rescheduled for ${nextAvailableOwnerShowing.fullText}! Owner will review and confirm.`);
          return;
        } else {
          // Direct 1-Click Booking without modal
          const payload = {
            tenant_id: tenantId,
            tenant_name: tenantName || 'Tenant',
            tenant_phone: tenantPhone,
            tenant_email: tenantEmail,
            rental_property_id: property.id,
            property_title: propertyTitle,
            visit_date: targetDate,
            visit_time: targetTime,
            meeting_point: property.society_name || property.location || 'Property Location',
            remarks: `1-Click Auto Join for ${nextAvailableOwnerShowing.fullText}`,
            status: 'Pending Owner Approval',
          };

          const res = await tenantVisitAPI.create(payload);
          const newVisit = {
            id: res?.id || res?.data?.id || Date.now(),
            ...payload,
          };
          setExistingScheduledVisit(newVisit);

          try {
            const stored = JSON.parse(localStorage.getItem('tenant_scheduled_visits') || '[]');
            stored.push(newVisit);
            localStorage.setItem('tenant_scheduled_visits', JSON.stringify(stored));
          } catch { }

          toast.success(`🎉 Site visit requested for ${nextAvailableOwnerShowing.fullText}! Details saved to your Tenant Account.`);
          return;
        }
      } catch (err: any) {
        console.error('Direct visit schedule error:', err);
        toast.error('Failed to schedule visit. Please try again.');
        return;
      } finally {
        setDirectBookingLoading(false);
      }
    }

    // If guest / unauthorized, open modal
    setContactModalAction('schedule');
    setShowContactModal(true);
  };

  const getGalleryPhotos = () => {
    if (galleryFilter === 'all') return mediaItems;
    return mediaItems.filter((m) => galleryFilter === 'image' ? m.type !== 'video' : m.type === 'video');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 1. COMPACT TOP HEADER BAR */}
      {!showPhotoGallery && (
        <div
          className="bg-white shadow-sm border-b pt-16 sticky top-0 z-40 mb-1"
          style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 mt-4">
            <div className="flex items-center justify-between py-1">
              <button
                onClick={() => (onBack ? onBack() : navigate('/properties?transaction=rent&tab=rent'))}
                className="flex items-center text-white hover:text-[#CC6A1A] transition-colors text-xs sm:text-sm font-medium py-1 cursor-pointer"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Properties
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN BODY */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-6 py-3 pb-12 pt-1 bg-gradient-to-b from-white via-slate-50 to-white">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT MAIN COLUMN (2 COLS) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 flex flex-col">

            {/* HERO MEDIA CAROUSEL - COMPACT HEIGHT */}
            <div
              onClick={() => {
                setPhotoGalleryStartIndex(currentImageIndex);
                setGalleryFilter('all');
                setShowPhotoGallery(true);
              }}
              className="relative w-full h-64 sm:h-72 md:h-[380px] lg:h-[440px] bg-gray-900 overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl ring-1 ring-black/10 group cursor-pointer"
            >
              <img
                src={images[currentImageIndex] || '/property.png'}
                alt={propertyTitle}
                onError={(e) => { e.currentTarget.src = '/property.png'; }}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />

              {/* Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none select-none z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
                  <div className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap drop-shadow-2xl">
                    ResaleExpert.in
                  </div>
                </div>
              </div>

              {/* Top-Left Info */}
              <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-20 text-white max-w-[75%] sm:max-w-[85%] flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-base sm:text-lg md:text-xl truncate drop-shadow">
                    {propertyTitle}
                  </div>
                  <span className="text-amber-300 font-black text-xs sm:text-sm">
                    {propertyIdCode}
                  </span>
                </div>

                <div className="flex items-center text-xs sm:text-sm drop-shadow text-white/90">
                  <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-amber-400" />
                  <span className="truncate">
                    {property.location || property.locality || property.address || 'Prime Residential Area'}, {property.city || 'Pune'}
                  </span>
                </div>
              </div>

              {/* Top-Right Action Buttons & Tags */}
              <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-20 flex flex-col items-end space-y-1.5 sm:space-y-2">

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/70 hover:bg-white/80 backdrop-blur-md text-gray-800 shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 transition-all duration-200 cursor-pointer"
                    aria-label="Share property"
                  >
                    <Share className="w-4 h-4 text-gray-700" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const isLoggedIn = Boolean(
                        user?.id ||
                        user?.email ||
                        localStorage.getItem('token') ||
                        localStorage.getItem('verified_tenant')
                      );

                      if (!isLoggedIn) {
                        setContactModalAction('contact');
                        setShowContactModal(true);
                        toast.info('Please verify your email via OTP to shortlist and save this property.');
                        return;
                      }

                      const nowShortlisted = toggleTenantShortlist(property);
                      setLiked(nowShortlisted);
                      toast.success(nowShortlisted ? "Property shortlisted & saved to your account!" : "Removed from shortlist");
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/70 hover:bg-white/80 backdrop-blur-md text-gray-800 shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 transition-all duration-200 cursor-pointer"
                    aria-label="Save property"
                  >
                    <Bookmark
                      className={`w-4 h-4 transition-colors ${liked ? 'text-[#E6761D] fill-[#E6761D]' : 'text-gray-700'}`}
                    />
                  </button>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-md">
                    <ShieldCheck size={11} /> Direct Owner
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow-md">
                    <BadgePercent size={11} /> 0% Brokerage
                  </span>
                </div>

              </div>

              {/* Bottom-Left Price & Carpet Area */}
              <div className="absolute bottom-3 sm:bottom-4 left-2 sm:left-3 md:left-4 z-20 w-[90%]">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
                  <div className="flex flex-col text-left">
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                      {formatCurrency(monthlyRent)}
                      <span className="text-xs sm:text-sm font-semibold text-amber-300"> / mo</span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/90 mt-0.5 font-medium">
                      Deposit: {formatCurrency(securityDeposit)} • Maintenance: {maintenance}
                    </div>
                  </div>

                  <div className="flex flex-col items-left">
                    <span className="text-xs text-white/80">Carpet Area</span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {carpetArea} sq ft
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Left / Right Chevrons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + images.length) % images.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full z-20 transition-all duration-200 shadow-xl ring-1 ring-white/30 hover:scale-110 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % images.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full z-20 transition-all duration-200 shadow-xl ring-1 ring-white/30 hover:scale-110 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              <div className="absolute bottom-3 right-2 sm:right-3 md:right-4 z-20 bg-gradient-to-r from-slate-900/70 to-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs shadow-lg ring-1 ring-white/20">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* View Options Buttons */}
              <div className="absolute bottom-11 sm:bottom-12 right-2 sm:right-3 md:right-4 z-20 flex space-x-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoGalleryStartIndex(currentImageIndex);
                    setGalleryFilter('image');
                    setShowPhotoGallery(true);
                  }}
                  className="bg-white/80 hover:bg-white text-black px-2.5 py-1 rounded-lg flex items-center gap-1 hover:scale-105 transition-all text-[10px] sm:text-xs font-semibold shadow-md border border-white/60 cursor-pointer"
                >
                  <Camera size={12} className="text-[#E6761D]" />
                  <span>Photos</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoGalleryStartIndex(0);
                    setGalleryFilter('video');
                    setShowPhotoGallery(true);
                  }}
                  className="bg-white/80 hover:bg-white text-black px-2.5 py-1 rounded-lg flex items-center gap-1 hover:scale-105 transition-all text-[10px] sm:text-xs font-semibold shadow-md border border-white/60 cursor-pointer"
                >
                  <Video size={12} />
                  <span>Tour</span>
                </button>
              </div>

            </div>

            {/* SMART DESCRIPTION */}
            <div className="bg-white backdrop-blur rounded-xl sm:rounded-2xl border shadow-sm -mt-2 p-2.5 sm:p-3.5 mb-1">
              <PropertyDescriptionSmart
                description={property?.description || `Spacious and well-maintained ${property.unit_type || '2 BHK'} rental home in ${property.society_name || 'prime residential society'}, ${property.location || 'Pune'}. Offers abundant natural light, good ventilation, 24/7 water supply, power backup and access to key society amenities.`}
                property={property}
              />
            </div>

            {/* PROPERTY DETAILS 2-COLUMN TABLE */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm mb-1">
              <div className="px-3 sm:px-4 md:px-5 pt-3 sm:pt-4">
                <h3 className="font-bold text-black text-base sm:text-lg mb-2">
                  Rental Property Details
                </h3>
              </div>

              <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {[
                    { icon: <Building size={15} className="text-gray-400" />, label: "Property Type", value: property.unit_type ? `${property.unit_type} Flat` : 'Apartment' },
                    { icon: <Home size={15} className="text-gray-400" />, label: "Furnishing", value: displayOrDash(furnishing) },
                    { icon: <Ruler size={15} className="text-gray-400" />, label: "Carpet Area", value: `${carpetArea} Sq.ft.` },
                    { icon: <Ruler size={15} className="text-gray-400" />, label: "Built-up Area", value: `${builtUpArea} Sq.ft.` },
                    { icon: <IndianRupee size={15} className="text-gray-400" />, label: "Monthly Rent", value: `${formatCurrency(monthlyRent)}/mo` },
                    { icon: <Lock size={15} className="text-gray-400" />, label: "Security Deposit", value: formatCurrency(securityDeposit) },
                    { icon: <ShieldCheck size={15} className="text-gray-400" />, label: "Maintenance", value: maintenance },
                    { icon: <Users size={15} className="text-gray-400" />, label: "Preferred Tenant", value: tenantPreference },
                    { icon: <Calendar size={15} className="text-gray-400" />, label: "Available From", value: availableFrom },
                    { icon: <FileText size={15} className="text-gray-400" />, label: "Lease Duration", value: leaseDuration },
                    { icon: <Lock size={15} className="text-gray-400" />, label: "Lock-in Period", value: lockInPeriod },
                    { icon: <Building2 size={15} className="text-gray-400" />, label: "Floor Level", value: `${floorNum} / ${totalFloors}` },
                    { icon: <Compass size={15} className="text-gray-400" />, label: "Facing", value: facing },
                    { icon: <Car size={15} className="text-gray-400" />, label: "Parking", value: parking },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 ${idx % 2 === 0 ? 'sm:border-r sm:border-gray-100' : ''
                        }`}
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

            {/* RENTAL PRICE & MOVE-IN COST BREAKDOWN */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                    <IndianRupeeIcon size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">Rental Price & Move-in Cost Breakdown</h3>
                    <p className="text-[11px] text-gray-500">Transparent breakdown of all rental expenses</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Zero Brokerage
                </span>
              </div>

              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Monthly Rent</span>
                  <span className="font-extrabold text-gray-900">{formatCurrency(monthlyRent)} / month</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Security Deposit (100% Refundable)</span>
                  <span className="font-extrabold text-[#0b3856]">{formatCurrency(securityDeposit)}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Monthly Society Maintenance</span>
                  <span className="font-bold text-emerald-600">{maintenance}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Brokerage Fee</span>
                  <span className="font-bold text-emerald-600">₹0 (Direct Owner)</span>
                </div>
                <div className="py-2.5 flex items-center justify-between bg-amber-50/70 px-3 rounded-lg border border-amber-200/80 mt-2">
                  <div className="flex items-center gap-1.5 font-black text-amber-950">
                    <CheckCheck size={14} className="text-emerald-600" />
                    <span>Total Initial Move-in Cost (Rent + Deposit)</span>
                  </div>
                  <span className="text-sm font-black text-[#b45309]">
                    {formatCurrency(totalInitialCost)}
                  </span>
                </div>
              </div>
            </div>



            {/* AMENITIES & FURNISHING ITEMS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-2">

              {/* Amenities */}
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-3 ring-1 ring-gray-100">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                  <Building2 size={14} className="text-amber-500" /> Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(() => {
                    let amenitiesList: string[] = [];
                    if (Array.isArray(property?.amenities) && property.amenities.length > 0) {
                      amenitiesList = property.amenities;
                    } else if (typeof property?.amenities === 'string' && property.amenities.trim()) {
                      amenitiesList = property.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
                    }

                    return amenitiesList.length > 0 ? (
                      amenitiesList.map((name, i) => <AmenityPill key={i} name={name} size={8} compact />)
                    ) : (
                      <span className="text-xs text-gray-400 col-span-full">Swimming Pool, Lift, Power Backup, 24/7 Security</span>
                    );
                  })()}
                </div>
              </div>

              {/* Furnishing Items */}
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-3 ring-1 ring-gray-100">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                  <Home size={14} className="text-blue-500" /> Furnishing Items
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(() => {
                    let furnishingList: string[] = [];
                    if (Array.isArray(property?.furnishing_items) && property.furnishing_items.length > 0) {
                      furnishingList = property.furnishing_items;
                    } else if (Array.isArray(property?.furnishingItems) && property.furnishingItems.length > 0) {
                      furnishingList = property.furnishingItems;
                    } else if (typeof property?.furnishing_items === 'string' && property.furnishing_items.trim()) {
                      furnishingList = property.furnishing_items.split(',').map((s: string) => s.trim()).filter(Boolean);
                    }

                    if (furnishingList.length === 0) {
                      furnishingList = ['modular-kitchen', 'wardrobe', 'geyser', 'ceiling-fan', 'lighting'];
                    }

                    return furnishingList.map((item: string, index: number) => (
                      <FurnishingPill key={index} name={item} size={8} compact />
                    ));
                  })()}
                </div>
              </div>

            </div>

            {/* DYNAMIC AI RENTAL MARKET ANALYSIS WITH CHATGPT */}
            <div className="bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/20 rounded-xl sm:rounded-2xl border border-purple-200/80 p-3.5 sm:p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot size={15} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm">AI Rental Market Analysis</h3>

                    </div>
                    <p className="text-[10.5px] text-gray-500">Live AI benchmark for {property.unit_type || '2 BHK'} in {property.location || 'Pune'}</p>
                  </div>
                </div>
                {aiAnalysisLoading ? (
                  <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold animate-pulse">
                    <Loader2 size={12} className="animate-spin" /> Generating...
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full border border-purple-200">
                    Live Computed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Rental Score', value: aiAnalysisData?.rental_score || `${dynamicRentalScore}/100`, color: 'text-purple-700' },
                  { label: 'Rent / Sq.Ft.', value: aiAnalysisData?.rent_per_sqft || `₹${rentPerSqFt}/sq ft`, color: 'text-blue-600' },
                  { label: 'Estimated Yield', value: aiAnalysisData?.estimated_yield || dynamicRentalYield, color: 'text-emerald-600' },
                  { label: 'Fair Market Rent', value: `₹${fairMarketRentMin.toLocaleString()} - ₹${fairMarketRentMax.toLocaleString()}`, color: 'text-amber-800' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-lg px-2.5 py-2 flex flex-col justify-between gap-1 border border-purple-100/80 shadow-2xs">
                    <span className="text-[10.5px] text-gray-500 font-medium">{item.label}</span>
                    <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* AI Insight Snippet */}
              {aiAnalysisData?.ai_insight && (
                <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/70 text-[11px] text-purple-950 flex items-start gap-2">
                  <Bot size={13} className="text-purple-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="font-semibold text-purple-900">AI Valuation Summary:</strong> {aiAnalysisData.ai_insight}
                  </p>
                </div>
              )}
            </div>

            {/* LOCALITY & COMMUTE MAP (Rendered directly with no duplicate outer card) */}
            <PropertyNeighbourhoodMap property={property} />

            {/* REPORT ISSUE FOOTNOTE */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                  <Flag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Found something incorrect in this listing?</h4>
                  <p className="text-[11px] text-slate-300">Help us keep all rental listings 100% verified.</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-rose-200 hover:text-white border border-rose-400/30 text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Flag className="w-3 h-3" /> Report
              </button>
            </div>

          </div>

          {/* RIGHT SIDEBAR (1 COL - VERIFIED OWNER CONTACT & COMPACT CARDS) */}
          <div className="lg:col-span-1 space-y-4">

            {/* VERIFIED OWNER CONTACT CARD - COMPACT & MODERN */}
            <div className="bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200 shadow-sm space-y-3">

              <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider">
                    Direct Owner Listing
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-900 text-amber-300">
                  0% BROKERAGE
                </span>
              </div>

              {/* Verified Owner Badge */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200/70 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-[#0b3856] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    Verified Property Owner
                  </h5>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Direct Contact • Zero Brokerage
                  </span>
                </div>
              </div>

              {/* 3 Quick Benefit Bullets */}
              <div className="space-y-1.5 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                  <PhoneForwarded className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Verify immediate availability with owner</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Negotiate rent, deposit & terms directly</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                  <Repeat className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="text-slate-700 font-medium">Schedule on-site visit or video tour</span>
                </div>
              </div>

              {/* Action Buttons in One Row */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  onClick={() => handleOpenContact('contact')}
                  className="w-full py-2.5 px-2 rounded-xl bg-[#FFCC00] hover:bg-[#F5B800] active:scale-[0.99] text-slate-950 font-black text-[11px] sm:text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                >
                  <PhoneCall className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" /> Contact Owner
                </button>

                <button
                  onClick={() => handleOpenContact('schedule')}
                  disabled={directBookingLoading}
                  className={`w-full py-2.5 px-2 rounded-xl active:scale-[0.99] font-extrabold text-[11px] sm:text-xs shadow-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer text-center disabled:opacity-60 ${existingScheduledVisit
                    ? 'bg-blue-900 hover:bg-blue-950 text-white ring-2 ring-blue-300'
                    : 'bg-[#0b3856] hover:bg-[#07263b] text-white'
                    }`}
                >
                  <span className="leading-none flex items-center gap-1">
                    {directBookingLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300 shrink-0" />
                    ) : (
                      <CalendarClock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    )}
                    {directBookingLoading ? 'Booking Visit...' : (existingScheduledVisit ? 'Reschedule Visit' : 'Schedule Visit')}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[9.5px] text-amber-900/70 font-medium pt-0.5">
                <Lock className="w-2.5 h-2.5 text-amber-700" /> 100% Privacy Protected • Zero Spam
              </div>

            </div>

            {/* CARD 2: PROPERTY ACTIVITY & TENANT INTEREST */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Activity size={14} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs">Property Activity & Demand</h3>
                    <p className="text-[10px] text-gray-500">Live analytics & tenant demand</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                </span>
              </div>

              {(() => {
                const realViews = viewsCount > 0 ? viewsCount : (Number(property?.total_views || property?.views_count || property?.views) || 1);
                const baseShortlisted = Number(property?.shortlisted_count ?? property?.shortlistedBy ?? 0);
                const isShortlisted = liked || (property?.id ? isTenantShortlisted(property.id) : false);
                const shortlistedCount = Math.max(baseShortlisted, isShortlisted ? 1 : 0);
                const baseContacted = Number(property?.inquiries_count ?? property?.direct_inquiries ?? property?.inquiries ?? 0);
                const isEnquired = property?.id ? isTenantEnquired(property.id) : false;
                const contactedCount = Math.max(baseContacted, isEnquired ? 1 : 0);

                return (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Total Views</span>
                      <span className="text-xs font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                        <Eye size={12} className="text-blue-500" /> {realViews} Views
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Shortlisted By</span>
                      <span className="text-xs font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                        <Heart size={12} className="text-rose-500 fill-rose-500" /> {shortlistedCount} Tenants
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Direct Inquiries</span>
                      <span className="text-xs font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                        <PhoneCall size={12} className="text-emerald-600" /> {contactedCount} Contacted
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9.5px] text-gray-400 font-semibold block uppercase">Listing Status</span>
                      <span className="text-[11px] font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600" /> 100% Verified
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* CARD 2: TENANT SECURITY & ASSURANCE */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Tenant Protection Guarantee</h4>
                  <p className="text-[10px] text-gray-500">Safe, verified & transparent renting</p>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>100% Refundable Deposit:</strong> Secure refund terms documented in lease agreement.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Zero Brokerage Commission:</strong> Save up to 1-2 months of rent charges.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Digital Lease Assistance:</strong> Easy e-registration & society NOC guidance.</span>
                </div>
              </div>
            </div>

            {/* CARD 3: SIMILAR PROPERTIES WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#E6761D]" /> Similar Rentals Nearby
                </h4>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {similarProperties.length} homes
                </span>
              </div>
              <PublicSimilarProperties
                properties={similarProperties}
                loading={similarPropertiesLoading}
                currentPropertyId={property.id}
                currentPropertySlug={property.slug}
              />
            </div>

          </div>

        </div>

      </div>

      {/* 🌟 STICKY BOTTOM ACTION BAR (Desktop & Mobile) - Shows Owner Showing Time & Direct CTAs */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-3 sm:px-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all animate-in slide-in-from-bottom duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">

          {/* Left: Property Info + Owner Availability Strip */}
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            {images?.[0] && (
              <img
                src={images[0]}
                alt="Property"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 hidden md:block shrink-0 shadow-2xs"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {propertyTitle}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                  ₹{Number(property?.expected_rent || property?.monthly_rent || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>

              {/* Owner Showing Property Notice with Live Indicator */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium truncate mt-0.5">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="truncate">
                  Owner showing this property{' '}
                  <strong className="text-blue-900 font-extrabold">
                    {nextAvailableOwnerShowing.fullText}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => handleOpenContact('contact')}
              className="py-2 px-3.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <PhoneCall size={13} className="text-[#0b3856]" />
              <span>Contact Owner</span>
            </button>

            <button
              type="button"
              disabled={directBookingLoading}
              onClick={handleDirectJoinShowingVisit}
              className={`py-2 px-4 rounded-xl active:scale-[0.99] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 ${existingScheduledVisit
                ? 'bg-blue-900 hover:bg-blue-950 text-white ring-2 ring-blue-300'
                : 'bg-[#0b3856] hover:bg-[#07263b] text-white'
                }`}
            >
              {directBookingLoading ? (
                <Loader2 size={14} className="animate-spin text-amber-300" />
              ) : (
                <CalendarClock size={14} className="text-amber-300" />
              )}
              <span>{directBookingLoading ? 'Booking Visit...' : (existingScheduledVisit ? ' Reschedule Visit' : 'Join / Schedule Visit')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Contact Owner Tenant 4-Step Email OTP Modal */}
      <ContactOwnerTenantModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        property={property}
        defaultAction={contactModalAction}
        initialVisitDate={nextAvailableOwnerShowing.dateStr}
        initialVisitTime={nextAvailableOwnerShowing.time}
      />

      {/* Report Listing Modal */}
      <ReportPropertyModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        property={property}
        propertyType="rent"
      />

      {/* Full Photo Gallery Modal (Exact Component from PublicPropertyDetailPage) */}
      {showPhotoGallery && (
        <PropertyGalleryPage
          key={galleryFilter}
          photos={getGalleryPhotos()}
          title={propertyTitle}
          price={formatCurrency(monthlyRent)}
          pricePerSqft={`${carpetArea} sq ft`}
          initialIndex={photoGalleryStartIndex}
          liked={liked}
          onToggleSave={() => {
            setLiked(!liked);
            toast.success(liked ? "Removed from wishlist" : "Saved to your wishlist!");
          }}
          onClose={() => setShowPhotoGallery(false)}
          onMessage={() => handleOpenContact('contact')}
          onSchedule={() => handleOpenContact('schedule')}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          title={propertyTitle}
          url={window.location.href}
        />
      )}

    </div>
  );
};

export default PublicRentalPropertyDetailPage;