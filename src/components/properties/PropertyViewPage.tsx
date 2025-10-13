import React, { useState, useEffect, useRef } from 'react';
import type { LucideProps } from "lucide-react";
type IconComponent = React.ComponentType<Partial<LucideProps>>;
type Meta = {
  label: string;
  Icon: IconComponent;
  bg: string;
  fg: string;
};
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Edit,
  Share,
  Eye,
  Download,
  Upload,
  Camera,
  Video,
  FileText,
  Users,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Building,
  Home,
  Car,
  Wifi,
  Dumbbell,
  TreePine,
  Waves,
  Shield,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Settings,
  Target,
  TrendingUp,
  DollarSign,
  Percent,
  Award,
  Crown,
  Gem,
  Heart,
  Bookmark,
  Flag,
  Tag,
  Link,
  User,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  Copy,
  QrCode,
  Printer,
  RefreshCw,
  Plus,
  Minus,
  X,
  Save,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Maximize2,
  Filter,
  Search,
  MoreHorizontal,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Flame,
  Droplets,
  Sun,
  Moon,
  Wind,
  Mountain,
  Flower,
  Coffee,
  Wrench,
  Hammer,
  Paintbrush,
  Scissors,
  Ruler,
  Lightbulb,
  Thermometer,
  Gauge,
  Battery,
  Signal,
  Wifi as WifiIcon,
  Bluetooth,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Database,
  Server,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Snowflake,
  Share2,
  IndianRupee
} from 'lucide-react';
import AmenityPill from "../properties/AmenityPill";
import FurnishingPill from '../properties/FurnishingPill'
import PropertyStageModal from './PropertyStageModal';
import PropertyVisitModal from './PropertyVisitModal';
import PropertyInspectionModal from './PropertyInspectionModal';
import PropertyMaintenanceModal from './PropertyMaintenanceModal';
import PropertyReportModal from './PropertyReportModal';
import PropertyBrochureModal from './PropertyBrochureModal';
import PropertyShareModal from './PropertyShareModal';
import PropertyDocumentModal from './PropertyDocumentModal';
import PropertyNegotiationModal from './PropertyNegotiationModal';
import PropertyReminderModal from './PropertyReminderModal';
import PropertyMediaModal from './PropertyMediaModal';
import PropertyPublishModal from './PropertyPublishModal';
import PropertyStatusUpdateModal from './PropertyStatusUpdateModal';
import BuyerMatchingModal from './BuyerMatchingModal';
import { propertiesAPI } from '@/lib/propertiesAPI';
import toast from 'react-hot-toast';

// --- Swiper imports ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';
import ShareModal from '@/pages/public/ShareModal';

// ---------- Types ----------
interface UIProperty {
  id: number | string;
  propertyId: string;
  title: string;
  type: string;
  subtype: string;
  unitType: string;
  wing: string;
  unitNo: string;
  furnishing: string;

  // add new
  facing: string,
  bedrooms: string,
  bathrooms: string,
  priceType?: 'Fixed' | 'Negotiable' | string;
  finalPrice?: number | string;

  furnishingItems?: string[];
  parkingType: string;
  parkingQty: number | string;
  city: string;
  location: string;
  society: string;
  floor: string | number;
  totalFloors: string | number;
  carpetArea: number | string;
  builtupArea: number | string;
  status: string;
  leadSource: string;
  purchaseMonth: string | number;
  purchaseYear: string | number;
  possessionMonth: string | number;
  possessionYear: string | number;
  budget: number | string;
  address: string;
  description: string;
  selling_rights: string;
  photos: string[];
  seller: {
    id?: number | string;
    name: string;
    phone?: string;
    email?: string;
    leadSource?: string;
  };
  stage: string;
  stageProgress: number;
  visits: number;
  totalVisits: number;
  lastVisit: string;
  interestedBuyers: number;
  hotLeads: number;
  created_at?: string;
  updated_at?: string;
  isPublic: boolean;
  publicViews: number;
  publicInquiries: number;
  amenities?: string[];
  nearby_places?: Array<{ name: string; distance?: string; type?: string }>;
  ownershipDocUrl?: string;
  ownershipDocName?: string;
  ownershipDocId?: string;
  negotiablePrice?: number;
  priceHistory?: any[];
  activities?: any[];
  visitHistory?: any[];
  matchedBuyers?: any[];
  negotiations?: any[];
  verified?: boolean;
  socialShares?: number;
  brochureDownloads?: number;
  inspectionStatus?: string;
  inspectionReport?: any;
  maintenanceReport?: any;
  lastStatusUpdate?: string;
  lastUpdated?: string;
}

interface PropertyViewPageProps {
  property: UIProperty;
  onBack: () => void;
  onEdit: (property: UIProperty) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalProperties?: number;
  onUpdateProperty?: (property: UIProperty) => void;
  onBuyerMatching?: (property: UIProperty) => void;
  onViewBuyers?: (property: UIProperty) => void;
}

// ---------- Helpers (shared) ----------
const formatINRShort = (amount: number | string) => {
  const num = Number(amount);
  if (!num && num !== 0) return '-';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString('en-IN')}`;
};

const safeDaysOnMarket = (createdAt?: string) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
};


// Build initial data for edit form
const buildInitialData = (p: UIProperty) => {

  return {
    id: p.id,
    seller: p.seller?.name || '',
    propertyType: p.type || '',
    propertySubtype: p.subtype || '',
    unitType: p.unitType || '',
    wing: p.wing || '',
    unitNo: p.unitNo || '',
    furnishing: p.furnishing || '',

    // add new
    facing: p.facing || '',
    bedrooms: p.bedrooms ? String(p.bedrooms) : '',
    bathrooms: p.bathrooms ? String(p.bathrooms) : '',

    priceType: (p.priceType as 'Fixed' | 'Negotiable') || 'Fixed',
    finalPrice: p.finalPrice ? String(p.finalPrice) : '',  // <-- add

    parkingType: p.parkingType || '',
    parkingQty: String(p.parkingQty ?? ''),
    city: p.city || '',
    location: p.location || '',
    society: p.society || '',
    floor: String(p.floor ?? ''),
    totalFloors: String(p.totalFloors ?? ''),
    carpetArea: String(p.carpetArea ?? ''),
    builtupArea: String(p.builtupArea ?? ''),
    budget: String(p.budget ?? ''),
    address: p.address || '',
    status: p.status || '',
    leadSource: p.seller?.leadSource ?? p.leadSource ?? '',
    possessionMonth: String(p.possessionMonth ?? ''),
    possessionYear: String(p.possessionYear ?? ''),
    purchaseMonth: String(p.purchaseMonth ?? ''),
    purchaseYear: String(p.purchaseYear ?? ''),
    sellingRights: p.selling_rights || 'Standard',
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    furnishingItems: Array.isArray(p.furnishingItems) ? p.furnishingItems : [],
    description: p.description || '',
    nearby_places: Array.isArray(p.nearby_places) ? p.nearby_places : [],
    existingOwnershipDocUrl: p.ownershipDocUrl || '',
    existingOwnershipDocName: p.ownershipDocName || '',
    existingOwnershipDocId: p.ownershipDocId || '',
    existingPhotos: (p.photos || []).map((url, idx) => ({
      id: String(idx + 1),
      url,
      name: `photo-${idx + 1}.jpg`,
    })),
  };
};



/* ---------- Image Zoom Wrapper ----------
   Wrap any <img> in this to get a smooth hover zoom-in/out.
   - Keeps rounded corners and prevents overflow
   - GPU-accelerated transform for smoothness
*/
const ImageZoom: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}> = ({ src, alt = 'image', className = '', imgClassName = '' }) => {
  return (
    <div className={`group relative overflow-hidden rounded-xl ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`block w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.06] ${imgClassName}`}
        loading="eager"
        decoding="async"
        style={{ display: 'block' }}
      />
    </div>
  );
};




// ✅ make a clean slug if property.slug missing/dirty
const toSlug = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);

// ✅ stable tracking id per property (so analytics consistent rahe)
const getOrMakeFltCnt = (propId: string | number) => {
  const key = `fltcnt_${propId}`;
  let v = localStorage.getItem(key);
  if (!v) {
    v = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    localStorage.setItem(key, v);
  }
  return v;
};

// ✅ build the public property URL
const buildPublicPropertyUrl = (property: any) => {
  const origin =
    import.meta.env.VITE_PUBLIC_SITE_ORIGIN // e.g. https://investordeal.in
    || window.location.origin;              // fallback: http://localhost:5173

  const id = property?.id ?? property?.propertyId;
  const slug =
    property?.slug
      ? toSlug(String(property.slug))
      : toSlug(
          [
            property?.type,
            property?.unitType,
            property?.subtype,
            property?.city,
            property?.location,
          ]
            .filter(Boolean)
            .join(" ")
        );

  const fltcnt = getOrMakeFltCnt(id);
  return `${origin}/properties/${id}-${slug}?fltcnt=${encodeURIComponent(fltcnt)}`;
};


// ---------- Main Component ----------
const PropertyViewPage: React.FC<PropertyViewPageProps> = ({
  property,
  onBack,
  onEdit,
  onNext,
  onPrevious,
  currentIndex = 0,
  totalProperties = 1,
  onUpdateProperty,
  onBuyerMatching,
  onViewBuyers
}) => {
  // restore tab from ?tab=... or localStorage, fallback 'overview'
  const [activeTab, setActiveTab] = useState<string>(() => {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get('tab');
    const fromStorage = localStorage.getItem(`pv_tab_${String(property?.id)}`);
    return (fromUrl || fromStorage || 'overview');
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showBuyerMatching, setShowBuyerMatching] = useState(false);
  const [propertyData, setPropertyData] = useState<UIProperty>(property);
  const [reminders, setReminders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loadingStatusHistory, setLoadingStatusHistory] = useState(false);
  const prevRef = React.useRef<HTMLButtonElement | null>(null);
  const nextRef = React.useRef<HTMLButtonElement | null>(null);
  const [overviewKey, setOverviewKey] = useState(0);
  const prevShowEditRef = useRef(showEditModal);

  useEffect(() => {
    if (!property) return;
    const idChanged = property.id !== propertyData.id;
    const tsChanged = property.updated_at !== propertyData.updated_at;
    if (idChanged || tsChanged) {
      setPropertyData(property);
      setOverviewKey(k => k + 1); // ✅ OverviewTab key bump -> fresh render
    }
  }, [property?.id, property?.updated_at]); // dhyaan: propertyData ko dep me mat daalo


  // ⬇️ propertyData ke useState ke baad yeh effect add/replace karo
  useEffect(() => {
    if (!property) return;

    const idChanged = property.id !== propertyData.id;
    const tsChanged = property.updated_at !== propertyData.updated_at;

    if (idChanged || tsChanged) {
      setPropertyData(property);
      // force OverviewTab fresh render with latest data
      setOverviewKey(k => k + 1);
    }
  }, [property?.id, property?.updated_at]); // dhyaan: propertyData ko dep me mat daalo

  // 🔊 listen once, remount Overview on event
  useEffect(() => {
    const handler = (e: any) => {
      // ⚠️ agar tum id-check kar rahe ho to dhyaan: propertyId pass ho
      // if (e?.detail?.id && e.detail.id !== propertyData.id) return;

      // force remount + optional tab switch
      setOverviewKey(k => k + 1);
      setActiveTab('overview'); // nahi chahiye to hata do
    };

    window.addEventListener('overview:refresh', handler);
    return () => window.removeEventListener('overview:refresh', handler);
  }, [propertyData.id]);

  // inside PropertyViewPage
  useEffect(() => {
    setPropertyData(property);
  }, [property]);
  // when property id changes, try restoring its last-opened tab
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get('tab');
    const fromStorage = localStorage.getItem(`pv_tab_${String(property?.id)}`);
    const next = (fromUrl || fromStorage);
    if (next && next !== activeTab) setActiveTab(next);
  }, [property?.id]); // intentionally not depending on activeTab

  // Property stages with automatic progression
  const propertyStages = [
    {
      id: 'initial_contact',
      label: 'Initial Contact',
      progress: 10,
      description: 'First contact with seller',
      tasks: ['Contact seller', 'Understand requirements', 'Schedule meeting'],
      nextStage: 'property_collection'
    },
    {
      id: 'property_collection',
      label: 'Property Collection',
      progress: 25,
      description: 'Collect property details and documents',
      tasks: ['Property visit', 'Document verification', 'Photo/video shoot'],
      nextStage: 'mandate_discussion'
    },
    {
      id: 'mandate_discussion',
      label: 'Mandate Discussion',
      progress: 40,
      description: 'Discuss mandate and authorization',
      tasks: ['Mandate discussion', 'Price negotiation', 'Terms agreement'],
      nextStage: 'mandate_signed'
    },
    {
      id: 'mandate_signed',
      label: 'Mandate Signed',
      progress: 55,
      description: 'Mandate and documents signed',
      tasks: ['Document signing', 'Authorization letters', 'Marketing rights'],
      nextStage: 'marketing_active'
    },
    {
      id: 'marketing_active',
      label: 'Marketing Active',
      progress: 70,
      description: 'Property actively marketed',
      tasks: ['Create brochure', 'Publish on portals', 'Buyer matching'],
      nextStage: 'buyer_interested'
    },
    {
      id: 'buyer_interested',
      label: 'Buyer Interested',
      progress: 80,
      description: 'Buyers showing interest',
      tasks: ['Buyer visits', 'Negotiations', 'Offer management'],
      nextStage: 'deal_negotiation'
    },
    {
      id: 'deal_negotiation',
      label: 'Deal Negotiation',
      progress: 90,
      description: 'Active deal negotiations',
      tasks: ['Price negotiation', 'Terms finalization', 'Agreement preparation'],
      nextStage: 'deal_closure'
    },
    {
      id: 'deal_closure',
      label: 'Deal Closure',
      progress: 100,
      description: 'Deal successfully closed',
      tasks: ['Final agreement', 'Payment completion', 'Handover'],
      nextStage: null
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'stages', label: 'Stages & Progress', icon: TrendingUp },
    { id: 'visits', label: 'Visits & Inspections', icon: Eye },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'buyers', label: 'Buyer Interest', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: Globe },
    { id: 'negotiations', label: 'Negotiations', icon: Target },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
  ];

  // Fetch status history from API
  const fetchStatusHistory = async () => {
    setLoadingStatusHistory(true);
    try {
      const response = await propertiesAPI.getStatusHistory(String(propertyData.id));
      if (response.success) {
        setStatusHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch status history:', error);
      toast.error('Failed to load status history');
    } finally {
      setLoadingStatusHistory(false);
    }
  };

  // Initialize reminders and activities
  useEffect(() => {
    const currentStage = propertyStages.find(s => s.id === propertyData.stage);
    if (currentStage) {
      const stageReminders = generateStageReminders(currentStage);
      setReminders(stageReminders);
    }
    setActivities(propertyData.activities || []);
  }, [propertyData.stage]);

  // Fetch status history on mount and when property changes
  useEffect(() => {
    if (propertyData.id) {
      fetchStatusHistory();
    }
  }, [propertyData.id]);

  // Listen for custom event to open status update modal
  useEffect(() => {
    const handleOpenStatusModal = (event: CustomEvent) => {
      if (event.detail.id === propertyData.id) {
        setShowStatusUpdateModal(true);
      }
    };

    window.addEventListener('openStatusUpdateModal', handleOpenStatusModal as EventListener);

    return () => {
      window.removeEventListener('openStatusUpdateModal', handleOpenStatusModal as EventListener);
    };
  }, [propertyData.id]);

  const generateStageReminders = (stage: any) => {
    const baseReminders: any[] = [
      {
        id: 1,
        type: 'stage_progress',
        title: `Complete ${stage.label} tasks`,
        description: `${stage.tasks.join(', ')}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high',
        status: 'pending'
      },
      {
        id: 2,
        type: 'weekly_update',
        title: 'Weekly status update',
        description: 'Update property status and progress',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending'
      }
    ];

    if (stage.id === 'property_collection') {
      baseReminders.push({
        id: 3,
        type: 'photo_video',
        title: 'Property photo/video shoot',
        description: 'Schedule professional photography and videography',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high',
        status: 'pending'
      });
    }

    if (stage.id === 'marketing_active') {
      baseReminders.push({
        id: 4,
        type: 'portal_publish',
        title: 'Publish on property portals',
        description: 'List property on MagicBricks, 99acres, Housing.com',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'high',
        status: 'pending'
      });
    }

    return baseReminders;
  };

  const getCurrentStage = () => {
    return propertyStages.find(s => s.id === propertyData.stage) || propertyStages[0];
  };

  const getNextStage = () => {
    const currentStage = getCurrentStage();
    return propertyStages.find(s => s.id === currentStage.nextStage);
  };

  // Handle edit property
  const handleEditProperty = () => {
    setShowEditModal(true);
  };

  useEffect(() => {
    localStorage.setItem(`pv_tab_${String(propertyData.id)}`, activeTab);
    const sp = new URLSearchParams(window.location.search);
    sp.set('tab', activeTab);
    window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
  }, [activeTab, propertyData.id]);

  const handleEditSubmit = (result: any) => {
    const updatedProperty = {
      ...propertyData,
      ...result,
      updated_at: new Date().toISOString(),
      activities: [
        ...(activities || []),
        {
          id: Date.now(),
          type: 'property_update',
          description: 'Property details updated',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          user: 'Admin User',
        },
      ],
    };

    setPropertyData(updatedProperty);
    onUpdateProperty?.(updatedProperty);

    // 👇 force re-mount (key bump)
    setOverviewKey((k) => k + 1);

    // 👇 tumhare listener ke liye custom event fire karo (id pass karo)
    window.dispatchEvent(
      new CustomEvent('overview:refresh', { detail: { id: updatedProperty.id } })
    );

    setShowEditModal(false);
    toast.success('Property updated successfully!');
  };




  const handleStageProgress = async (newStage: string, remarks: string) => {
    const updatedProperty = {
      ...propertyData,
      stage: newStage,
      stageProgress: propertyStages.find(s => s.id === newStage)?.progress || 0,
      lastUpdated: new Date().toISOString(),
      activities: [
        ...(activities || []),
        {
          id: Date.now(),
          type: 'stage_update',
          description: `Stage updated to ${propertyStages.find(s => s.id === newStage)?.label}`,
          remarks: remarks,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          user: 'Admin User'
        }
      ]
    };

    setPropertyData(updatedProperty);
    onUpdateProperty?.(updatedProperty);
    toast.success('Stage updated successfully!');
  };

  const handlePropertyVisit = async (visitData: any) => {
    const updatedProperty = {
      ...propertyData,
      visits: (propertyData.visits || 0) + 1,
      lastVisit: visitData.date,
      activities: [
        ...(activities || []),
        {
          id: Date.now(),
          type: 'property_visit',
          description: `Property visit completed - ${visitData.purpose}`,
          remarks: visitData.findings,
          date: visitData.date,
          time: visitData.time,
          user: visitData.inspector,
          details: visitData
        }
      ]
    };

    setPropertyData(updatedProperty);
    onUpdateProperty?.(updatedProperty);
    toast.success('Property visit recorded!');
  };

  const handleInspectionComplete = async (inspectionData: any) => {
    const updatedProperty = {
      ...propertyData,
      inspectionStatus: 'completed',
      inspectionReport: inspectionData,
      activities: [
        ...(activities || []),
        {
          id: Date.now(),
          type: 'inspection',
          description: `Property inspection completed - Overall rating: ${inspectionData.overallRating}/10`,
          remarks: inspectionData.summary,
          date: inspectionData.date,
          time: new Date().toLocaleTimeString(),
          user: inspectionData.inspector,
          details: inspectionData
        }
      ]
    };

    setPropertyData(updatedProperty);
    onUpdateProperty?.(updatedProperty);
    toast.success('Inspection report generated!');
  };

  const handleMaintenanceSuggestions = async (maintenanceData: any) => {
    const updatedProperty = {
      ...propertyData,
      maintenanceReport: maintenanceData,
      activities: [
        ...(activities || []),
        {
          id: Date.now(),
          type: 'maintenance',
          description: `Maintenance suggestions provided - ${maintenanceData.suggestions.length} items`,
          remarks: maintenanceData.summary,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          user: 'Admin User',
          details: maintenanceData
        }
      ]
    };

    setPropertyData(updatedProperty);
    onUpdateProperty?.(updatedProperty);
    toast.success('Maintenance suggestions saved!');
  };

  // Updated handleStatusUpdate to use API and refresh history
  const handleStatusUpdate = async (newStatus: string, remarks: string, formData: any) => {
    const updatedProperty = {
      ...propertyData,
      status: newStatus,
      lastStatusUpdate: new Date().toISOString(),
      ...(formData.priceAdjustment && formData.newPrice && {
        budget: formData.newPrice
      }),
      activities: [
        ...(activities || []),
        {
          id: Date.now(),
          type: 'status_update',
          description: `Property status updated to ${newStatus}`,
          remarks: remarks,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          user: formData.updatedBy || 'Admin User',
          details: formData
        }
      ]
    };

    setPropertyData(updatedProperty);
    onUpdateProperty?.(updatedProperty);
    setActivities(updatedProperty.activities || []);

    // Refresh status history from API
    await fetchStatusHistory();

    toast.success('Property status updated!');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      'Available': { bg: 'bg-green-100', text: 'text-green-700', icon: '🟢', label: 'Available' },
      'Sold': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔵', label: 'Sold' },
      'Under Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🟡', label: 'Under Negotiation' },
      'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚫', label: 'On Hold' },
      'Finalization': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🟣', label: 'Finalization' }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const currentStage = propertyStages.find(s => s.id === stage);
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
        📍 {currentStage?.label || 'Unknown Stage'}
      </span>
    );
  };

  const getPendingReminders = () => reminders.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              {/* <h1 className="text-xl font-bold text-gray-900">{propertyData.title}</h1> */}
              <div className=" font-bold text-gray-900 text-lg">
                {(propertyData.type && propertyData.type !== ' - ') && <span className="mr-2">{propertyData.type}</span>}
                {(propertyData.unitType && propertyData.unitType !== ' - ') && <span className="mr-2">{propertyData.unitType}</span>}
                {(propertyData.subtype && propertyData.subtype !== ' - ') && <span className="mr-2">{propertyData.subtype}</span>}
              </div>

              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(propertyData.status)}
                {getStageBadge(propertyData.stage)}
                <span className="text-sm text-gray-500">ID: {propertyData.propertyId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Navigation */}
            {onNext && onPrevious && (
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={onPrevious}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2 text-sm font-medium text-gray-600">
                  {currentIndex + 1} of {totalProperties}
                </span>
                <button
                  onClick={onNext}
                  disabled={currentIndex === totalProperties - 1}
                  className="p-1.5 rounded bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Reminders Bell */}
            <div className="relative">
              <button
                onClick={() => setShowReminderModal(true)}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors relative"
              >
                <Bell size={18} />
                {getPendingReminders() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getPendingReminders()}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setShowStatusUpdateModal(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Update Status
            </button>
            <button
              onClick={() => setShowStageModal(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Update Stage
            </button>

            <button
              onClick={handleEditProperty}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Edit size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3">
          <nav className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-sm ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <OverviewTab
            key={`ov-${propertyData.id}-${overviewKey}`}
            property={propertyData}
            onUpdate={setPropertyData}
          />
        )}

        {activeTab === 'stages' && (
          <StagesTab
            property={propertyData}
            stages={propertyStages}
            onStageUpdate={handleStageProgress}
            onShowStageModal={() => setShowStageModal(true)}
            statusHistory={statusHistory}
            loadingStatusHistory={loadingStatusHistory}
            onRefreshHistory={fetchStatusHistory}
          />
        )}
        {activeTab === 'visits' && (
          <VisitsTab
            property={propertyData}
            onScheduleVisit={() => setShowVisitModal(true)}
            onStartInspection={() => setShowInspectionModal(true)}
            onMaintenanceSuggestions={() => setShowMaintenanceModal(true)}
            onGenerateReport={() => setShowReportModal(true)}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsTab
            property={propertyData}
            onCreateDocument={() => setShowDocumentModal(true)}
          />
        )}
        {activeTab === 'buyers' && (
          <BuyersTab
            property={propertyData}
            onMatchBuyers={() => setShowBuyerMatching(true)}
          />
        )}
        {activeTab === 'marketing' && (
          <MarketingTab
            property={propertyData}
            onCreateBrochure={() => setShowBrochureModal(true)}
            onShareProperty={() => setShowShareModal(true)}
            onManageMedia={() => setShowMediaModal(true)}
            onPublishProperty={() => setShowPublishModal(true)}
          />
        )}
        {activeTab === 'negotiations' && (
          <NegotiationsTab
            property={propertyData}
            onStartNegotiation={() => setShowNegotiationModal(true)}
          />
        )}
        {activeTab === 'reports' && <ReportsTab property={propertyData} />}
      </div>

      {/* All Modals */}
      {showEditModal && (
        <PropertyFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="edit"
          propertyId={propertyData.id}
          initialData={buildInitialData(propertyData)}
          onSubmit={handleEditSubmit}
        />
      )}

      {showStageModal && (
        <PropertyStageModal
          isOpen={showStageModal}
          onClose={() => setShowStageModal(false)}
          property={propertyData}
          stages={propertyStages}
          onStageUpdate={handleStageProgress}
        />
      )}

      {showVisitModal && (
        <PropertyVisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          property={propertyData}
          onSave={handlePropertyVisit}
        />
      )}

      {showInspectionModal && (
        <PropertyInspectionModal
          isOpen={showInspectionModal}
          onClose={() => setShowInspectionModal(false)}
          property={propertyData}
          onSave={handleInspectionComplete}
        />
      )}

      {showMaintenanceModal && (
        <PropertyMaintenanceModal
          isOpen={showMaintenanceModal}
          onClose={() => setShowMaintenanceModal(false)}
          property={propertyData}
          onSave={handleMaintenanceSuggestions}
        />
      )}

      {showReportModal && (
        <PropertyReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          property={propertyData}
        />
      )}

      {showBrochureModal && (
        <PropertyBrochureModal
          isOpen={showBrochureModal}
          onClose={() => setShowBrochureModal(false)}
          property={propertyData}
        />
      )}

      {showShareModal && (
        <PropertyShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          property={propertyData}
        />
      )}

      {showDocumentModal && (
        <PropertyDocumentModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          property={propertyData}
        />
      )}

      {showNegotiationModal && (
        <PropertyNegotiationModal
          isOpen={showNegotiationModal}
          onClose={() => setShowNegotiationModal(false)}
          property={propertyData}
        />
      )}

      {showReminderModal && (
        <PropertyReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          property={propertyData}
          reminders={reminders}
          onUpdateReminders={setReminders}
        />
      )}

      {showMediaModal && (
        <PropertyMediaModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          property={propertyData}
          onUpdate={setPropertyData}
        />
      )}

      {showPublishModal && (
        <PropertyPublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          property={propertyData}
          onUpdate={setPropertyData}
        />
      )}

      {showStatusUpdateModal && (
        <PropertyStatusUpdateModal
          isOpen={showStatusUpdateModal}
          onClose={() => setShowStatusUpdateModal(false)}
          property={propertyData}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {showBuyerMatching && (
        <BuyerMatchingModal
          isOpen={showBuyerMatching}
          onClose={() => setShowBuyerMatching(false)}
          property={propertyData}
        />
      )}
    </div>
  );
};

// ---------- Overview Tab ----------
const OverviewTab = ({ property, onUpdate }: any) => {
  const [editingPrice, setEditingPrice] = useState(false);
  const [quotePrice, setQuotePrice] = useState(property.budget || 0);
  const [negotiablePrice, setNegotiablePrice] = useState(property.negotiablePrice || property.budget * 0.95);

  const prevRef = React.useRef<HTMLButtonElement | null>(null);
  const nextRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setQuotePrice(property.budget || 0);
    setNegotiablePrice(
      property.negotiablePrice ?? (property.budget ? property.budget * 0.95 : 0)
    );
  }, [property.budget, property.negotiablePrice, property.updated_at]);
  // utils/helper
  const getMonthName = (value?: string | number | null) => {
    if (!value) return "";
    const month = typeof value === "string" ? parseInt(value) : value;
    if (isNaN(month) || month < 1 || month > 12) return "";
    return new Date(0, month - 1).toLocaleString("en", { month: "long" });
  };


  const handlePriceUpdate = () => {
    const updatedProperty = {
      ...property,
      budget: quotePrice,
      negotiablePrice: negotiablePrice,
      priceHistory: [
        ...(property.priceHistory || []),
        {
          date: new Date().toISOString().split('T')[0],
          quotePrice: quotePrice,
          negotiablePrice: negotiablePrice,
          updatedBy: 'Admin User'
        }
      ]
    };
    onUpdate(updatedProperty);
    setEditingPrice(false);
    toast.success('Pricing updated successfully!');
  };

  return (
    <div className="space-y-4">
      {/* Property Images with Swiper */}
      <div className="space-y-4">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1 space-y-4 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="relative">
                <Swiper
                  modules={[Navigation]}
                  onBeforeInit={(swiper) => {
                    // @ts-ignore
                    swiper.params.navigation.prevEl = prevRef.current;
                    // @ts-ignore
                    swiper.params.navigation.nextEl = nextRef.current;
                  }}
                  navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
                  className="mySwiper w-full"
                >
                  {(property.photos?.length ? property.photos : [
                    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
                  ]).map((photo: string, index: number) => (
                    <SwiperSlide key={index}>
                      <div className="relative w-full">
                        {/* <img
                          src={photo}
                          alt={`${property.title || 'Property'} - ${index + 1}`}
                          className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[450px] object-cover rounded-xl"
                          loading="eager"
                          decoding="async"
                          style={{ display: 'block' }}
                        /> */}
                        {/* Hover zoom added here */}
                        <ImageZoom
                          src={photo}
                          alt={`${property.title || 'Property'} - ${index + 1}`}
                          className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[450px]"
                          imgClassName="rounded-xl"
                        />
                      </div>
                    </SwiperSlide>
                  ))}

                  {/* Custom arrows */}
                  <button
                    ref={prevRef}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center
                 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-sm
                 hover:bg-black/60 transition"
                    aria-label="Previous slide"
                    type="button"
                  >
                    ‹
                  </button>
                  <button
                    ref={nextRef}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center
                 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-sm
                 hover:bg-black/60 transition"
                    aria-label="Next slide"
                    type="button"
                  >
                    ›
                  </button>
                </Swiper>

                {/* Status badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                  {property.isPublic && (
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs md:text-sm font-bold">
                      PUBLIC
                    </span>
                  )}
                  {property.hotLeads > 2 && (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs md:text-sm font-bold">
                      HOT PROPERTY
                    </span>
                  )}
                  {property.verified && (
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs md:text-sm font-bold flex items-center gap-1">
                      <Shield size={12} />
                      <span>VERIFIED</span>
                    </span>
                  )}
                </div>

                {/* Camera button */}
                <div className="absolute bottom-4 right-4 z-20">
                  <button className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/70 transition">
                    <Camera size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
                {/* Quote Price */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Quote Price</p>
                      <div className="flex items-center gap-2">
                        {editingPrice ? (
                          <input
                            type="number"
                            value={quotePrice}
                            onChange={(e) => setQuotePrice(Number(e.target.value))}
                            className="text-lg font-bold text-green-600 border-b border-green-300 bg-transparent w-28 focus:outline-none"
                            onBlur={handlePriceUpdate}
                            onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate()}
                            autoFocus
                          />
                        ) : (
                          <p
                            className="text-lg font-bold text-green-600 cursor-pointer hover:text-green-700"
                            onClick={() => setEditingPrice(true)}
                          >
                            {formatINRShort(quotePrice)}
                          </p>
                        )}
                      </div>
                    </div>
                    <IndianRupee className="text-green-600" size={20} />
                  </div>
                </div>

                {/* Negotiable Price */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Negotiable Price</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatINRShort(property?.finalPrice)}
                      </p>
                    </div>
                    <Percent className="text-orange-600" size={20} />
                  </div>
                </div>


                {/* Total Visits */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Visits</p>
                      <p className="text-lg font-bold text-blue-600">
                        {property.visits || 0}
                      </p>
                    </div>
                    <Eye className="text-blue-600" size={20} />
                  </div>
                </div>

                {/* Interested Buyers */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Interested Buyers</p>
                      <p className="text-lg font-bold text-purple-600">
                        {property.interestedBuyers || 0}
                      </p>
                    </div>
                    <Users className="text-purple-600" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 text-sm text-gray-700">
                {/* Row 1 */}
                <div><span className="font-semibold">Seller:</span><span className="ml-2">{property.seller?.name || "-"}</span></div>
                <div><span className="font-semibold">Property type:</span><span className="ml-2">{property?.type || "-"}</span></div>
                <div><span className="font-semibold">Unit Type:</span><span className="ml-2">{property?.unitType || "-"}</span></div>
                <div><span className="font-semibold">Subtype:</span><span className="ml-2">{property?.subtype || "-"}</span></div>

                {/* Row 2 */}
                <div><span className="font-semibold">Society:</span><span className="ml-2">{property?.society || "-"}</span></div>
                <div><span className="font-semibold">Wing:</span><span className="ml-2">{property?.wing || "-"}</span></div>
                <div><span className="font-semibold">Unit No:</span><span className="ml-2">{property?.unitNo || "-"}</span></div>

                {/* Row 3 */}
                <div><span className="font-semibold">Facing:</span><span className="ml-2">{property?.facing || "-"}</span></div>
                <div><span className="font-semibold">Bedrooms:</span><span className="ml-2">{property?.bedrooms || "-"}</span></div>
                <div><span className="font-semibold">Bathrooms:</span><span className="ml-2">{property?.bathrooms || "-"}</span></div>
                <div>
                  <span className="font-semibold">Floor:</span>
                  <span className="ml-2">{property?.floor ? `${property.floor} / ${property?.totalFloors}` : "-"}</span>
                </div>
                <div><span className="font-semibold">City:</span><span className="ml-2">{property?.city || "-"}</span></div>
                <div><span className="font-semibold">Location:</span><span className="ml-2">{property?.location || "-"}</span></div>

                {/* Row 4 */}
                <div>
                  <span className="font-semibold">Built-up Area:</span>
                  <span className="ml-2">{property?.builtupArea ? `${property.builtupArea} Sq.ft.` : "-"}</span>
                </div>
                <div>
                  <span className="font-semibold">Carpet Area:</span>
                  <span className="ml-2">{property?.carpetArea ? `${property.carpetArea} Sq.ft.` : "-"}</span>
                </div>
                <div><span className="font-semibold">Sell Price:</span><span className="ml-2">{property?.budget ? formatINRShort(property?.budget) : "-"}</span></div>
                <div><span className="font-semibold">FinaL Price:</span><span className="ml-2">{property?.finalPrice ? formatINRShort(property?.finalPrice) : "-"}</span></div>
                <div><span className="font-semibold">Price Type:</span><span className="ml-2">{property?.priceType || "-"}</span></div>

                {/* Row 5 */}
                <div>
                  <span className="font-semibold">Parking:</span>
                  <span className="ml-2">{property?.parkingQty ? `${property.parkingQty} ${property.parkingType}` : "-"}</span>
                </div>
                <div><span className="font-semibold">Furnishing:</span><span className="ml-2">{property?.furnishing || "-"}</span></div>
                <div><span className="font-semibold">Possession:</span><span className="ml-2">{getMonthName(property?.possessionMonth)} {property?.possessionYear || "-"}
                </span></div>

                {/* Row 6 */}
                <div><span className="font-semibold">Purchase Date:</span><span className="ml-2">{getMonthName(property?.possessionMonth)} {property?.possessionYear || "-"}
                </span></div>
                <div><span className="font-semibold">Selling Rights:</span><span className="ml-2">{property?.selling_rights || "-"}</span></div>
                <div><span className="font-semibold">Lead Source:</span><span className="ml-2">{property?.leadSource || "-"}</span></div>

                {/* Row 7 */}
                <div><span className="font-semibold">Status:</span><span className="ml-2">{property?.status || "-"}</span></div>
                <div className="sm:col-span-1 lg:col-span-2 xl:col-span-1 2xl:col-span-2">
                  <span className="font-semibold">Nearby:</span>
                  <span className="ml-2">
                    {property.nearby_places?.length ? (
                      property.nearby_places.map((p: any, i: number) => (
                        <span key={i}>
                          {p.name} ({p.distance}{p.unit}) {p.type}
                          {i < property.nearby_places.length - 1 ? ", " : ""}
                        </span>
                      ))
                    ) : (
                      "Not Available"
                    )}
                  </span>
                </div>

                {/* Address */}
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2 2xl:col-span-3">
                  <div className="font-semibold mb-1">Address:</div>
                  <div className="ml-1 text-gray-700 whitespace-pre-line">
                    {property?.address || "Not Available"}
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2 2xl:col-span-3">
                  <div className="font-semibold mb-1">Description:</div>
                  <div className="ml-1 text-gray-700 whitespace-pre-line">
                    {property?.description || "Not Available"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Seller card */}
          <div className="w-full xl:w-80 2xl:w-96 shrink-0 flex flex-col gap-4 xl:sticky xl:top-0 xl:h-fit xl:max-h-screen xl:overflow-y-auto">
            {/* Seller */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Seller</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={16} />
                  <span className="font-medium">{property.seller?.name || "Not Available"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="text-gray-400" size={16} />
                  {property.seller?.phone ? (
                    <>
                      <span className="truncate">{property.seller.phone}</span>
                      <button
                        onClick={() => window.open(`tel:${property.seller.phone}`)}
                        className="ml-auto p-1 text-blue-600 hover:bg-blue-100 rounded"
                        aria-label="Call seller"
                      >
                        <Phone size={12} />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-500">Not Available</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="text-gray-400" size={16} />
                  {property.seller?.email ? (
                    <span className="truncate">{property.seller.email}</span>
                  ) : (
                    <span className="text-gray-500">Not Available</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="text-gray-400" size={16} />
                  <span className="truncate">
                    {property?.location && property?.city ? `${property.location}, ${property.city}` : "Not Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {/* Share */}
                <button
                  onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                  <Share2 size={16} />
                  Share
                </button>

                {/* Message */}
                <button className="flex items-center gap-2 px-3 py-2 border border-green-200 rounded-lg text-green-600 hover:bg-green-50 transition">
                  <MessageCircle size={16} />
                  Message
                </button>

                {/* Schedule */}
                <button className="flex items-center gap-2 px-3 py-2 border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-50 transition">
                  <Calendar size={16} />
                  Schedule
                </button>

                {/* Mark Hot */}
                <button className="flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition">
                  <Flame size={16} />
                  Mark Hot
                </button>
              </div>
            </div>

           
            {/* Key Dates */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Key Dates</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Purchase</span>
                  <span className="font-medium">
                    {getMonthName(property?.purchaseMonth)} {property?.purchaseYear || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Possession</span>
                  <span className="font-medium">
                    {getMonthName(property?.possessionMonth)} {property?.possessionYear || "-"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Amenities & Furnishing */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Amenities */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
            {(() => {
              const amenities: string[] = Array.isArray(property.amenities)
                ? property.amenities
                : (property.amenities ?? "")
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean);

              return amenities.length ? (
                amenities.map((name, i) => <AmenityPill key={i} name={name} />)
              ) : (
                <span className="text-sm text-gray-500">No amenities listed</span>
              );
            })()}
          </div>
        </div>

        {/* Furnishing Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Furnishing Items</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
            {property.furnishingItems?.length ? (
              property.furnishingItems.map((item: string, index: number) => (
                <FurnishingPill key={index} name={item} />
              ))
            ) : (
              <span className="text-sm text-gray-500">No furnishing items listed</span>
            )}
          </div>
        </div>
      </div>
       {open && (
  (() => {
    const displayType = property?.type ?? '';
    const titleParts = [displayType, property?.unitType ?? '', property?.subtype ?? '']
      .map(s => (s || '').toString().trim())
      .filter(Boolean);
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

    // ❌ pehle yeh current URL tha:
    // const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    // ✅ ab canonical public URL:
    const shareUrl = buildPublicPropertyUrl(property);

    return (
      <ShareModal
        // agar tumhare ShareModal me `forcedCopyUrl` prop hai to usko bhi pass karo:
        // forcedCopyUrl={shareUrl}
        url={shareUrl}
        title={shareTitle}
        description={shareDescription}
        image={shareImage}
        propertyId={property.id}
        slug={`${property.id}-${toSlug(property.slug || shareTitle)}`}
        onClose={() => setOpen(false)}
      />
    );
  })()
)}

    </div>
  );
};

// ---------- Modified Stages Tab with Status Progress ----------
const StagesTab = ({
  property,
  stages,
  onStageUpdate,
  onShowStageModal,
  statusHistory,
  loadingStatusHistory,
  onRefreshHistory
}: any) => {
  const [activeSubTab, setActiveSubTab] = useState('stage');
  const currentStage = stages.find((s: any) => s.id === property.stage) || stages[0];
  const currentStageIndex = stages.findIndex((s: any) => s.id === property.stage);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      'Available': { bg: 'bg-green-100', text: 'text-green-700', icon: '🟢', label: 'Available' },
      'Sold': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔵', label: 'Sold' },
      'Under Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🟡', label: 'Under Negotiation' },
      'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚫', label: 'On Hold' },
      'Finalization': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🟣', label: 'Finalization' }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'Not set';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveSubTab('stage')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'stage'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Stage Progress
            </button>
            <button
              onClick={() => setActiveSubTab('status')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'status'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Status Progress
            </button>
          </div>

          <div className="flex space-x-2">
            {activeSubTab === 'status' && (
              <button
                onClick={onRefreshHistory}
                disabled={loadingStatusHistory}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <RefreshCw size={14} className={loadingStatusHistory ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            )}
            {activeSubTab === 'stage' && (
              <button
                onClick={onShowStageModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Stage
              </button>
            )}
          </div>
        </div>

        {/* Stage Progress Content */}
        {activeSubTab === 'stage' && (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentStage.label}</span>
                <span>{currentStage.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${currentStage.progress}%` }}
                />
              </div>
            </div>

            {/* Current Stage Tasks */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Current Stage: {currentStage.label}</h4>
              <p className="text-sm text-blue-700 mb-3">{currentStage.description}</p>
              <div className="space-y-2">
                {currentStage.tasks.map((task: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="text-blue-600" size={14} />
                    <span className="text-sm text-blue-800">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Timeline */}
            <div className="space-y-3">
              {stages.map((stage: any, index: number) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stage.id} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      {isCompleted ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isCurrent ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                        {stage.label}
                      </div>
                      <div className="text-sm text-gray-500">{stage.description}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {stage.progress}%
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Status Progress Content with API data */}
        {activeSubTab === 'status' && (
          <>
            {/* Current Status Display */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 mb-6 border border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3">Current Property Status</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusBadge(property.status)}
                  <div className="text-sm text-gray-600">
                    Last updated: {property.lastStatusUpdate ?
                      new Date(property.lastStatusUpdate).toLocaleDateString() :
                      'Not updated yet'
                    }
                  </div>
                </div>
                <button
                  onClick={() => {
                    // This would trigger the PropertyStatusUpdateModal
                    const event = new CustomEvent('openStatusUpdateModal', { detail: property });
                    window.dispatchEvent(event);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Update Status
                </button>
              </div>
            </div>

            {/* Status History Timeline from API */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Status History</h4>

              {loadingStatusHistory ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 mt-2">Loading status history...</p>
                </div>
              ) : statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {statusHistory.map((record: any, index: number) => (
                    <div key={record.id} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="text-blue-600" size={16} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-gray-900 truncate">
                            Status changed from "{record.previous_status || 'Unknown'}" to "{record.status}"
                          </h5>
                          <time className="text-xs text-gray-500 flex-shrink-0">
                            {formatDateTime(record.timestamp)}
                          </time>
                        </div>

                        {record.remarks && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Remarks:</strong> {record.remarks}
                          </p>
                        )}

                        {record.update_reason && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Reason:</strong> {record.update_reason}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            By: {record.updated_by || 'Unknown User'}
                          </span>

                          <div className="flex items-center space-x-2">
                            {record.price_adjustment && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Price Updated: ₹{Number(record.new_price || 0).toLocaleString('en-IN')}
                              </span>
                            )}
                            {record.notify_parties && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Parties Notified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Show additional details if available */}
                        {record.effective_date && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div>
                              <span className="font-medium">Effective Date:</span> {formatDateTime(record.effective_date)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Activity className="mx-auto mb-2" size={32} />
                  <p>No status updates recorded yet</p>
                  <p className="text-sm">Status changes will appear here when they occur</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Recent Activities (All Types) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {property.activities?.slice(0, 5).map((activity: any) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.description}</div>
                <div className="text-sm text-gray-600">{activity.remarks}</div>
                <div className="text-xs text-gray-500">{activity.date} • {activity.user}</div>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Activity className="mx-auto mb-2" size={32} />
                <p>No activities recorded yet</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ---------- Visits Tab ----------
const VisitsTab = ({ property, onScheduleVisit, onStartInspection, onMaintenanceSuggestions, onGenerateReport }: any) => {
  return (
    <div className="space-y-6">
      {/* Visit Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Visit & Inspection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onScheduleVisit}
            className="flex flex-col items-center space-y-2 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Calendar className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-700">Schedule Visit</span>
          </button>
          <button
            onClick={onStartInspection}
            className="flex flex-col items-center space-y-2 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Eye className="text-green-600" size={24} />
            <span className="text-sm font-medium text-green-700">Start Inspection</span>
          </button>
          <button
            onClick={onMaintenanceSuggestions}
            className="flex flex-col items-center space-y-2 p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Wrench className="text-orange-600" size={24} />
            <span className="text-sm font-medium text-orange-700">Maintenance</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="flex flex-col items-center space-y-2 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <FileText className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-purple-700">Generate Report</span>
          </button>
        </div>
      </div>

      {/* Visit History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit History</h3>
        <div className="space-y-3">
          {property.visitHistory?.map((visit: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="text-green-600" size={16} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{visit.purpose}</div>
                  <div className="text-sm text-gray-600">{visit.date} • {visit.inspector}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{visit.rating}/10</div>
                <div className="text-xs text-gray-500">{visit.duration}</div>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto mb-2" size={32} />
                <p>No visits recorded yet</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ---------- Documents Tab ----------
const DocumentsTab = ({ property, onCreateDocument }: any) => {
  const documentCategories = [
    { id: 'ownership', label: 'Ownership Documents', count: 3, color: 'blue' },
    { id: 'legal', label: 'Legal Documents', count: 2, color: 'green' },
    { id: 'financial', label: 'Financial Documents', count: 1, color: 'purple' },
    { id: 'marketing', label: 'Marketing Materials', count: 4, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {documentCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{category.label}</p>
                <p className="text-lg font-bold text-gray-900">{category.count}</p>
              </div>
              <FileText className={`text-${category.color}-600`} size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Create Document Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onCreateDocument}
            className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="text-blue-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-blue-900">Mandate Agreement</div>
              <div className="text-sm text-blue-700">Exclusive selling rights</div>
            </div>
          </button>
          <button
            onClick={onCreateDocument}
            className="flex items-center space-x-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <FileText className="text-green-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-green-900">Authorization Letter</div>
              <div className="text-sm text-green-700">Selling authorization</div>
            </div>
          </button>
          <button
            onClick={onCreateDocument}
            className="flex items-center space-x-3 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <FileText className="text-purple-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-purple-900">Marketing Rights</div>
              <div className="text-sm text-purple-700">Marketing authorization</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Buyers Tab ----------
const BuyersTab = ({ property, onMatchBuyers }: any) => {
  return (
    <div className="space-y-6">
      {/* Buyer Matching */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Buyer Matching</h3>
          <button
            onClick={onMatchBuyers}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Find Matching Buyers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{property.interestedBuyers || 0}</div>
            <div className="text-sm text-green-700">Interested Buyers</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{property.hotLeads || 0}</div>
            <div className="text-sm text-red-700">Hot Leads</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{property.visits || 0}</div>
            <div className="text-sm text-blue-700">Property Visits</div>
          </div>
        </div>
      </div>

      {/* Matched Buyers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Matched Buyers</h3>
        <div className="space-y-3">
          {property.matchedBuyers?.map((buyer: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={16} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{buyer.name}</div>
                  <div className="text-sm text-gray-600">Budget: {formatINRShort(buyer.budget)} • {buyer.matchScore}% match</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                  <MessageCircle size={16} />
                </button>
                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                  <Phone size={16} />
                </button>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-2" size={32} />
                <p>No matched buyers yet</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ---------- Marketing Tab ----------
const MarketingTab = ({ property, onCreateBrochure, onShareProperty, onManageMedia, onPublishProperty }: any) => {
  return (
    <div className="space-y-6">
      {/* Marketing Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onCreateBrochure}
            className="flex flex-col items-center space-y-2 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-700">Create Brochure</span>
          </button>
          <button
            onClick={onShareProperty}
            className="flex flex-col items-center space-y-2 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Share className="text-green-600" size={24} />
            <span className="text-sm font-medium text-green-700">Share Property</span>
          </button>
          <button
            onClick={onManageMedia}
            className="flex flex-col items-center space-y-2 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Camera className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-purple-700">Manage Media</span>
          </button>
          <button
            onClick={onPublishProperty}
            className="flex flex-col items-center space-y-2 p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Globe className="text-orange-600" size={24} />
            <span className="text-sm font-medium text-orange-700">Publish Online</span>
          </button>
        </div>
      </div>

      {/* Marketing Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{property.publicViews || 0}</div>
            <div className="text-sm text-blue-700">Online Views</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{property.publicInquiries || 0}</div>
            <div className="text-sm text-green-700">Inquiries</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{property.socialShares || 0}</div>
            <div className="text-sm text-purple-700">Social Shares</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{property.brochureDownloads || 0}</div>
            <div className="text-sm text-orange-700">Brochure Downloads</div>
          </div>
        </div>
      </div>

      {/* Published Platforms */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Published Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'MagicBricks', status: 'published', views: 1250, inquiries: 15 },
            { name: '99acres', status: 'published', views: 980, inquiries: 12 },
            { name: 'Housing.com', status: 'pending', views: 0, inquiries: 0 }
          ].map((platform, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{platform.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${platform.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                  {platform.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Views: {platform.views} • Inquiries: {platform.inquiries}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Negotiations Tab ----------
const NegotiationsTab = ({ property, onStartNegotiation }: any) => {
  return (
    <div className="space-y-6">
      {/* Active Negotiations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Negotiations</h3>
          <button
            onClick={onStartNegotiation}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start New Negotiation
          </button>
        </div>

        <div className="space-y-3">
          {property.negotiations?.map((negotiation: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">{negotiation.buyerName}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${negotiation.status === 'active' ? 'bg-green-100 text-green-800' :
                  negotiation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {negotiation.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Offered:</span>
                  <span className="font-medium ml-2">{formatINRShort(negotiation.offeredPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Counter:</span>
                  <span className="font-medium ml-2">{formatINRShort(negotiation.counterPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Update:</span>
                  <span className="font-medium ml-2">{negotiation.lastUpdate}</span>
                </div>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Target className="mx-auto mb-2" size={32} />
                <p>No active negotiations</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// ---------- Reports Tab ----------
const ReportsTab = ({ property }: any) => {
  const views = property.publicViews || 0;
  const visits = property.visits || 0;
  const conversion = views ? ((visits / views) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Engagement Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views:</span>
                <span className="font-medium">{views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inquiries:</span>
                <span className="font-medium">{property.publicInquiries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Site Visits:</span>
                <span className="font-medium">{visits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-medium">{conversion}%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Market Position</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Price/sq ft:</span>
                <span className="font-medium">
                  ₹{Math.round((Number(property.budget) || 0) / (Number(property.carpetArea) || 1)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Market Average:</span>
                <span className="font-medium">₹18,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Variance:</span>
                <span className="font-medium text-green-600">+5.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days on Market:</span>
                <span className="font-medium">{safeDaysOnMarket(property.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">Market analysis charts will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyViewPage;

