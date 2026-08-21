

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
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Camera,
  FileText,
  Users,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Home,
  Shield,
  Calendar,
  Bell,
  Target,
  TrendingUp,
  Percent,
  User,
  Globe,
  BarChart3,
  Flame,
  Wifi as WifiIcon,
  Share2,
  IndianRupee,
  Bot,
  ArrowRight,
  X
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

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

import propertyTagsAPI, { PropertyTagsRow } from '@/lib/propertyTagsAPI';
import { getTagStyle, DEFAULT_TAG_STYLE } from "@/lib/tagStyles";

// --- Swiper imports ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';
import ShareModal from '@/pages/public/ShareModal';
import StagesTab from './propertiescomponents/StagesTab';
import VisitsTab from './propertiescomponents/VisitsTab';
import DocumentsTab from './propertiescomponents/DocumentsTab';
import BuyersTab from './propertiescomponents/BuyersTab';
import MarketingTab from './propertiescomponents/MarketingTab';
import NegotiationsTab from './propertiescomponents/NegotiationsTab';
import ReportsTab from './propertiescomponents/ReportsTab';

import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/utils/permission';

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
  facing: string,
  balcony: string;
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
  source_url?: string;
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
  aiScore?: number;
  tags?: string[];
  assignedTo?: {
    id?: number | string;
    name?: string;
    phone?: string;
    email?: string;
  };
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

// ---------- Helpers ----------
const formatCurrency = (amount: number | string) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return ' - ';

  const CRORE = 10_000_000;
  const LAKH = 100_000;

  if (n >= CRORE) {
    const cr = n / CRORE;
    return `₹${parseFloat(cr.toFixed(2))}Cr`;
  }

  if (n >= LAKH) {
    const l = n / LAKH;
    return `₹${parseFloat(l.toFixed(0))}L`;
  }

  return `₹${n.toLocaleString('en-IN')}`;
};

const safeDaysOnMarket = (createdAt?: string) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
};

// Property Tags Component
const PropertyTags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, 20);

  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {displayTags.map((tag, index) => {
        const style = getTagStyle(tag);
        return (
          <span
            key={index}
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ring-1 ${style.bg} ${style.text} ${style.ring}`}
          >
            {style.emoji && typeof style.emoji === 'string' ? (
              <span className="text-[9px] mr-0.5">{style.emoji}</span>
            ) : style.emoji ? (
              React.createElement(style.emoji, { size: 9, className: "mr-0.5" })
            ) : null}
            {tag}
          </span>
        );
      })}
    </div>
  );
};

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
    facing: p.facing || '',
    balcony: p.balcony ? String(p.balcony) : '',
    bedrooms: p.bedrooms ? String(p.bedrooms) : '',
    bathrooms: p.bathrooms ? String(p.bathrooms) : '',
    priceType: (p.priceType as 'Fixed' | 'Negotiable') || 'Fixed',
    finalPrice: p.finalPrice ? String(p.finalPrice) : '',
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
    source_url: p.source_url || (p as any).sourceUrl || '',
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
    existingPhotos: (p.photos || []).map((photo: any, idx: number) => {
      const isObj = photo && typeof photo === 'object';
      const url = isObj ? photo.url : photo;
      const label = isObj ? (photo.label || '') : '';
      const isSociety = isObj ? !!photo.isSociety : false;
      const type: 'video' | 'image' | undefined = isObj ? (photo.type === 'video' ? 'video' : 'image') : undefined;
      const name = label || `photo-${idx + 1}.jpg`;
      return {
        id: String(idx + 1),
        url,
        name,
        label,
        isSociety,
        type,
      };
    }),
  };
};

const ImageZoom: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}> = ({ src, alt = 'image', className = '', imgClassName = '' }) => {
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-slate-900 ${className}`}>
      {/* Blurred glassmorphic background */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${src})` }}
      />
      <img
        src={src}
        alt={alt}
        className={`relative z-10 block w-full h-full object-contain transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.02] ${imgClassName}`}
        loading="eager"
        decoding="async"
        style={{ display: 'block' }}
      />
    </div>
  );
};

const toSlug = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);

const getOrMakeFltCnt = (propId: string | number) => {
  const key = `fltcnt_${propId}`;
  let v = localStorage.getItem(key);
  if (!v) {
    v = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    localStorage.setItem(key, v);
  }
  return v;
};

const buildPublicPropertyUrl = (property: any) => {
  const origin =
    import.meta.env.VITE_PUBLIC_SITE_ORIGIN
    || window.location.origin;

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

const toNum = (v: unknown): number | undefined => {
  if (v === '' || v == null) return undefined;
  const n = typeof v === 'string' ? Number(v.replace(/[, ]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const toNumOrNull = (v: unknown): number | null =>
  v == null || v === '' ? null : (toNum(v) ?? null);

type PropertyForModals = Omit<UIProperty,
  'bedrooms' | 'bathrooms' | 'parkingQty' | 'floor' | 'totalFloors' |
  'carpetArea' | 'builtupArea' | 'budget' | 'finalPrice'
> & {
  bedrooms?: number;
  bathrooms?: number;
  parkingQty?: number;
  floor?: number;
  totalFloors?: number;
  carpetArea?: number;
  builtupArea?: number;
  budget?: number | null;
  finalPrice?: number | null;
};

const normalizeProperty = (p: UIProperty): PropertyForModals => ({
  ...p,
  bedrooms: toNum(p.bedrooms),
  bathrooms: toNum(p.bathrooms),
  parkingQty: toNum(p.parkingQty),
  floor: toNum(p.floor),
  totalFloors: toNum(p.totalFloors),
  carpetArea: toNum(p.carpetArea),
  builtupArea: toNum(p.builtupArea),
  budget: toNumOrNull(p.budget),
  finalPrice: toNumOrNull(p.finalPrice),
});

// Main Component
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
  const { user } = useAuth();
  const canUpdate = can(user, 'property.update');

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
    console.log('🔍 Property Data:', property);
    console.log('🔍 Executive Details:', property.assignedTo);
  }, [property]);

  const fetchPropertyTags = async (propertyId: number): Promise<string[]> => {
    try {
      const tagsData = await propertyTagsAPI.getById(propertyId);
      return tagsData?.tags || [];
    } catch (err) {
      console.warn(`Could not load tags for property ${propertyId}:`, err);
      return [];
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      if (property?.id) {
        const tags = await fetchPropertyTags(Number(property.id));
        setPropertyData(prev => ({
          ...prev,
          tags
        }));
      }
    };
    fetchTags();
  }, [property?.id]);

  useEffect(() => {
    if (!property) return;
    const idChanged = property.id !== propertyData.id;
    const tsChanged = property.updated_at !== propertyData.updated_at;

    if (idChanged || tsChanged) {
      setPropertyData(property);
      setOverviewKey(k => k + 1);
    }
  }, [property?.id, property?.updated_at]);

  useEffect(() => {
    const handler = (e: any) => {
      setOverviewKey(k => k + 1);
      setActiveTab('overview');
    };

    window.addEventListener('overview:refresh', handler);
    return () => window.removeEventListener('overview:refresh', handler);
  }, [propertyData.id]);

  useEffect(() => {
    setPropertyData(property);
  }, [property]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const fromUrl = sp.get('tab');
    const fromStorage = localStorage.getItem(`pv_tab_${String(property?.id)}`);
    const next = (fromUrl || fromStorage);
    if (next && next !== activeTab) setActiveTab(next);
  }, [property?.id]);

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
    { id: 'visits', label: 'Visits & Inspection', icon: Eye },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'buyers', label: 'Buyers Interest', icon: Users },
    { id: 'marketing', label: 'Marketing', icon: Globe },
    { id: 'negotiations', label: 'Negotiations', icon: Target },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
  ];

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

  useEffect(() => {
    const currentStage = propertyStages.find(s => s.id === propertyData.stage);
    if (currentStage) {
      const stageReminders = generateStageReminders(currentStage);
      setReminders(stageReminders);
    }
    setActivities(propertyData.activities || []);
  }, [propertyData.stage]);

  useEffect(() => {
    if (propertyData.id) {
      fetchStatusHistory();
    }
  }, [propertyData.id]);

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
      seller: result.seller ? {
        ...propertyData.seller,
        ...result.seller
      } : propertyData.seller,
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
    setOverviewKey((k) => k + 1);
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
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const currentStage = propertyStages.find(s => s.id === stage);
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${O}10`, color: O }}>
        📍 {currentStage?.label || 'Unknown Stage'}
      </span>
    );
  };

  const getPendingReminders = () => reminders.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="h-full flex flex-col" style={{ background: BG }}>
      {/* Header */}
      <div className="bg-white border-b px-3 py-2" style={{ borderColor: BD }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
            >
              <ArrowLeft size={16} style={{ color: N }} />
            </button>
            <div>
              <div className="font-bold text-sm" style={{ color: N }}>
                {(propertyData.type && propertyData.type !== ' - ') && <span className="mr-1">{propertyData.type}</span>}
                {(propertyData.unitType && propertyData.unitType !== ' - ') && <span className="mr-1">{propertyData.unitType}</span>}
                {(propertyData.subtype && propertyData.subtype !== ' - ') && <span className="mr-1">{propertyData.subtype}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                {getStatusBadge(propertyData.status)}
                {getStageBadge(propertyData.stage)}
                <span className="text-[9px]" style={{ color: MU }}>ID: {propertyData.propertyId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onNext && onPrevious && (
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={onPrevious}
                  disabled={currentIndex === 0}
                  className="p-1 rounded bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="px-1.5 text-[10px] font-medium" style={{ color: MU }}>
                  {currentIndex + 1}/{totalProperties}
                </span>
                <button
                  onClick={onNext}
                  disabled={currentIndex === totalProperties - 1}
                  className="p-1 rounded bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowReminderModal(true)}
                className="p-1.5 rounded-lg transition-colors relative"
                style={{ background: `${O}10`, color: O }}
              >
                <Bell size={14} />
                {getPendingReminders() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                    {getPendingReminders()}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowStatusUpdateModal(true)}
              className="px-2 py-1 rounded-lg text-white text-[10px] font-medium transition-all hover:opacity-90"
              style={{ background: N }}
            >
              Update Status
            </button>
            <button
              onClick={() => setShowStageModal(true)}
              className="px-2 py-1 rounded-lg text-white text-[10px] font-medium transition-all hover:opacity-90"
              style={{ background: O }}
            >
              Update Stage
            </button>
            {canUpdate && (
              <button
                onClick={handleEditProperty}
                className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
              >
                <Edit size={14} style={{ color: MU }} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <nav className="flex gap-0.5 overflow-x-auto pb-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-md transition-colors whitespace-nowrap text-[13px]  font-medium ${activeTab === tab.id
                    ? 'text-white'
                    : 'hover:bg-gray-100'
                    }`}
                  style={activeTab === tab.id ? { background: O } : { color: MU }}
                >
                  <Icon size={11} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-3">
      {activeTab === 'overview' && (
  <OverviewTab
    key={`ov-${propertyData.id}-${overviewKey}`}
    property={propertyData}
    onUpdate={setPropertyData}
    onOpenGallery={() => setShowMediaModal(true)}
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
          property={normalizeProperty(propertyData)}
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

// Fullscreen Image Lightbox Gallery Viewer Modal
const ImageViewerModal = ({ isOpen, onClose, photos, title }: { isOpen: boolean; onClose: () => void; photos: string[]; title: string }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col p-4">
      <div className="flex items-center justify-between text-white mb-4">
        <h3 className="font-bold text-sm truncate max-w-[80%]">{title} - Photo Gallery</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      {/* Large Featured Photo */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center mb-6">
        {photos[activeIdx] ? (
          <img src={photos[activeIdx]} alt={`Photo ${activeIdx + 1}`} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        ) : (
          <div className="text-white/60 text-sm">No photo available</div>
        )}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
              className="absolute left-4 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-2xl transition-all shadow-md"
            >
              ‹
            </button>
            <button
              onClick={() => setActiveIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
              className="absolute right-4 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-2xl transition-all shadow-md"
            >
              ›
            </button>
          </>
        )}
      </div>
      {/* Scrollable Thumbnails Grid */}
      <div className="h-20 flex-shrink-0 flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-thin max-w-full">
        {photos.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`w-16 h-12 rounded-md overflow-hidden cursor-pointer border-2 transition-all flex-shrink-0 ${
              idx === activeIdx ? 'border-[#e67e22] scale-[1.05]' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Overview Tab Component - ALL FIELDS PRESERVED
const OverviewTab = ({ property, onUpdate, onOpenGallery }: any) => {
  const [editingPrice, setEditingPrice] = useState(false);
  const [quotePrice, setQuotePrice] = useState(property.budget || 0);
  const [negotiablePrice, setNegotiablePrice] = useState(property.negotiablePrice || property.budget * 0.95);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const prevRef = React.useRef<HTMLButtonElement | null>(null);
  const nextRef = React.useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [showGalleryViewer, setShowGalleryViewer] = useState(false);

  useEffect(() => {
    setQuotePrice(property.budget || 0);
    setNegotiablePrice(
      property.negotiablePrice ?? (property.budget ? property.budget * 0.95 : 0)
    );
  }, [property.budget, property.negotiablePrice, property.updated_at]);

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

  const getUrl = (p: any) => (typeof p === 'string' ? p : p?.url || '');
  const isVideo = (p: any) => {
    if (typeof p === 'object' && p?.type === 'video') return true;
    const u = getUrl(p);
    return /\.(mp4|mov|webm|mkv)$/i.test(u) || /youtube\.com|youtu\.be/i.test(u);
  };
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  const rawPhotos = Array.isArray(property.photos) ? property.photos : [];
  const mediaList = rawPhotos.filter((p: any) => getUrl(p));
  const effectiveMediaList = mediaList.length
    ? mediaList
    : ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'];
  const currentMedia = effectiveMediaList[selectedMediaIdx] || effectiveMediaList[0];
  const isCurrentVideo = isVideo(currentMedia);

  const renderThumbnail = (mediaIdx: number, className = "", isLastWithMore = false) => {
    const item = effectiveMediaList[mediaIdx];
    const isSelected = mediaIdx === selectedMediaIdx;

    if (!item) {
      return (
        <div
          key={mediaIdx}
          className="rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 gap-1 h-full min-h-[90px] sm:min-h-[110px] lg:min-h-0"
        >
          <Home size={14} className="opacity-40 text-slate-400" />
          <span className="text-[8px] uppercase tracking-wider font-semibold opacity-50">No Photo</span>
        </div>
      );
    }

    const url = getUrl(item);
    const isVid = isVideo(item);
    const hasMoreOverlay = isLastWithMore && effectiveMediaList.length > 7;
    const remainingCount = effectiveMediaList.length - 6;

    return (
      <div
        key={mediaIdx}
        onClick={() => {
          if (hasMoreOverlay) {
            setShowGalleryViewer(true);
          } else {
            setSelectedMediaIdx(mediaIdx);
          }
        }}
        className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 group border-2 ${
          isSelected && !hasMoreOverlay
            ? 'border-[#e67e22] ring-2 ring-[#e67e22]/30 shadow-md scale-[1.01]'
            : 'border-slate-100 hover:border-slate-200 opacity-90 hover:opacity-100 hover:shadow-sm'
        } ${className} bg-slate-900`}
      >
        {/* Blurred glassmorphic background */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-lg scale-110 opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${url})` }}
        />
        <img
          src={url}
          alt={`Media card ${mediaIdx + 1}`}
          className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {isVid && (
          <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[10px] text-slate-900 font-bold pl-0.5">
              ▶
            </div>
          </div>
        )}

        {hasMoreOverlay ? (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/60 to-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-all group-hover:bg-black/75">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white drop-shadow">
              +{remainingCount}
            </span>
            <span className="text-[8px] font-semibold text-white/90 flex items-center gap-0.5 mt-0.5">
              <Camera size={9} /> View All
            </span>
          </div>
        ) : isSelected ? (
          <div className="absolute top-1.5 left-1.5 z-20 bg-[#e67e22] text-white rounded-md text-[7.5px] font-bold shadow-sm tracking-wide uppercase">
            Active
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col xl:flex-row gap-3">
        {/* Left Column */}
        <div className="flex-1 space-y-3 min-w-0">
        
          {/* Modern Split-View Featured Media Showcase */}
          <div className="bg-white rounded-xl border p-2.5 shadow-sm" style={{ borderColor: BD }}>
            <div className={`flex flex-col ${effectiveMediaList.length > 1 ? 'lg:grid lg:grid-cols-4 gap-2.5' : ''}`}>
              {/* Left Side: Main Large Featured Image / Video Player */}
              <div
                onClick={() => {
                  if (effectiveMediaList.length === 1 || !isCurrentVideo) {
                    setShowGalleryViewer(true);
                  }
                }}
                className={`relative min-w-0 h-[240px] sm:h-[300px] md:h-[350px] lg:h-[380px] rounded-lg overflow-hidden bg-slate-900 group ${
                  effectiveMediaList.length > 1 ? 'lg:col-span-2 cursor-pointer' : 'w-full cursor-pointer'
                }`}
              >
                {isCurrentVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <iframe
                      src={getYouTubeEmbedUrl(getUrl(currentMedia))}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Property Video"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <ImageZoom
                      src={getUrl(currentMedia)}
                      alt={`${property.title || 'Property'} - ${selectedMediaIdx + 1}`}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Top Left Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-20 pointer-events-none">
                  {property.isPublic ? (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-green-600 text-white shadow-sm backdrop-blur-sm">
                      PUBLIC
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-600 text-white shadow-sm backdrop-blur-sm">
                      PRIVATE
                    </span>
                  )}
                  {property.hotLeads > 2 && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm" style={{ background: O }}>
                      HOT
                    </span>
                  )}
                  {property.verified && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white flex items-center gap-0.5 shadow-sm bg-blue-600">
                      <Shield size={9} /> VERIFIED
                    </span>
                  )}
                </div>

                {/* Top Right Badges */}
                <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1 justify-end z-20">
                  <PropertyTags tags={property.tags || []} />
                  {(property.aiScore ?? 0) >= 90 && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white flex items-center gap-0.5 shadow-sm" style={{ background: N }}>
                      <Bot size={10} /> AI {Math.round(property.aiScore ?? 0)}
                    </span>
                  )}
                </div>

                {/* Navigation Arrows on Main Image */}
                {effectiveMediaList.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMediaIdx((prev) => (prev > 0 ? prev - 1 : effectiveMediaList.length - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all shadow-md text-lg"
                      type="button"
                      title="Previous Image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMediaIdx((prev) => (prev < effectiveMediaList.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all shadow-md text-lg"
                      type="button"
                      title="Next Image"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Bottom info & Full Gallery Button */}
                <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-2">
                  <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded-lg backdrop-blur-sm shadow-sm">
                    {selectedMediaIdx + 1} / {effectiveMediaList.length}
                  </span>
                  <button
                    className="flex items-center gap-1 px-2.5 py-1 bg-black/60 hover:bg-black/85 text-white text-[10px] font-semibold rounded-lg transition backdrop-blur-sm shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGalleryViewer(true);
                    }}
                    title="Open Full Media Gallery"
                  >
                    <Camera size={12} />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Dynamic Media Grid */}
              {effectiveMediaList.length > 1 && (
                <div className="lg:col-span-2 flex flex-col gap-2 h-full max-h-[380px]">
                  {(() => {
                    const totalThumbnails = effectiveMediaList.length - 1;

                    // 1 thumbnail
                    if (totalThumbnails === 1) {
                      return (
                        <div className="h-full">
                          {renderThumbnail(1, "h-full")}
                        </div>
                      );
                    }

                    // 2 thumbnails (stacked vertically, 1 column of 2 rows)
                    if (totalThumbnails === 2) {
                      return (
                        <div className="grid grid-rows-2 gap-2 h-full">
                          {renderThumbnail(1, "h-full")}
                          {renderThumbnail(2, "h-full")}
                        </div>
                      );
                    }

                    // 3 thumbnails (1 row of 3)
                    if (totalThumbnails === 3) {
                      return (
                        <div className="grid grid-cols-3 gap-2 h-full">
                          {renderThumbnail(1, "h-full")}
                          {renderThumbnail(2, "h-full")}
                          {renderThumbnail(3, "h-full")}
                        </div>
                      );
                    }

                    // 4 thumbnails (2x2 grid)
                    if (totalThumbnails === 4) {
                      return (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="grid grid-cols-2 gap-2 h-[186px]">
                            {renderThumbnail(1, "h-full")}
                            {renderThumbnail(2, "h-full")}
                          </div>
                          <div className="grid grid-cols-2 gap-2 h-[186px]">
                            {renderThumbnail(3, "h-full")}
                            {renderThumbnail(4, "h-full")}
                          </div>
                        </div>
                      );
                    }

                    // 5 thumbnails (top row of 2, bottom row of 3)
                    if (totalThumbnails === 5) {
                      return (
                        <div className="flex flex-col gap-2 h-full">
                          <div className="grid grid-cols-2 gap-2 h-[186px]">
                            {renderThumbnail(1, "h-full")}
                            {renderThumbnail(2, "h-full")}
                          </div>
                          <div className="grid grid-cols-3 gap-2 h-[186px]">
                            {renderThumbnail(3, "h-full")}
                            {renderThumbnail(4, "h-full")}
                            {renderThumbnail(5, "h-full")}
                          </div>
                        </div>
                      );
                    }

                    // 6 or more thumbnails (top row of 3, bottom row of 3)
                    return (
                      <div className="flex flex-col gap-2 h-full">
                        <div className="grid grid-cols-3 gap-2 h-[186px]">
                          {renderThumbnail(1, "h-full")}
                          {renderThumbnail(2, "h-full")}
                          {renderThumbnail(3, "h-full")}
                        </div>
                        <div className="grid grid-cols-3 gap-2 h-[186px]">
                          {renderThumbnail(4, "h-full")}
                          {renderThumbnail(5, "h-full")}
                          {renderThumbnail(6, "h-full", true)}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Quick Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}>Quote Price</p>
                    {editingPrice ? (
                      <input type="number" value={quotePrice} onChange={(e) => setQuotePrice(Number(e.target.value))}
                        className="text-sm font-bold border-b bg-transparent w-24 focus:outline-none" style={{ borderColor: O }}
                        onBlur={handlePriceUpdate} onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate()} autoFocus />
                    ) : (
                      <p className="text-sm font-bold cursor-pointer hover:opacity-80" style={{ color: O }} onClick={() => setEditingPrice(true)}>
                        {formatCurrency(quotePrice)}
                      </p>
                    )}
                  </div>
                  <IndianRupee size={14} style={{ color: O }} />
                </div>
              </div>
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}>Negotiable Price</p>
                    <p className="text-sm font-bold" style={{ color: O }}>{formatCurrency(property?.finalPrice)}</p>
                  </div>
                  <Percent size={14} style={{ color: O }} />
                </div>
              </div>
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}> Total Visits</p>
                    <p className="text-sm font-bold" style={{ color: '#3b82f6' }}>{property.visits || 0}</p>
                  </div>
                  <Eye size={14} style={{ color: '#3b82f6' }} />
                </div>
              </div>
              <div className="rounded-lg p-2" style={{ background: `${N}05` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] uppercase tracking-wider" style={{ color: MU }}>Interested Buyers

</p>
                    <p className="text-sm font-bold" style={{ color: '#8b5cf6' }}>{property.interestedBuyers || 0}</p>
                  </div>
                  <Users size={14} style={{ color: '#8b5cf6' }} />
                </div>
              </div>
            </div>
          </div>

       {/* Property Details - ALL FIELDS with DIFFERENT COLORS */}
<div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
  <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Property Details</h3>
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 text-[10px]">
    
    {/* Seller - Blue */}
    <div className="p-1.5 rounded" style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#3b82f6' }}>Seller</div>
      <div className="font-medium truncate" style={{ color: N }}>{property.seller?.name || "-"}</div>
    </div>
    
    {/* Property Type - Purple */}
    <div className="p-1.5 rounded" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#8b5cf6' }}>Property Type</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.type || "-"}</div>
    </div>
    
    {/* Property Subtype - Pink */}
    <div className="p-1.5 rounded" style={{ background: '#ec489910', border: '1px solid #ec489920' }}>
      <div className="text-[8px] font-medium" style={{ color: '#ec4899' }}>Property Subtype</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.subtype || "-"}</div>
    </div>
    
    {/* Unit Type - Green */}
    <div className="p-1.5 rounded" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
      <div className="text-[8px] font-medium" style={{ color: '#10b981' }}>Unit Type</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.unitType || "-"}</div>
    </div>
    
    {/* Wing - Cyan */}
    <div className="p-1.5 rounded" style={{ background: '#06b6d410', border: '1px solid #06b6d420' }}>
      <div className="text-[8px] font-medium" style={{ color: '#06b6d4' }}>Wing</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.wing || "-"}</div>
    </div>
    
    {/* Unit No - Teal */}
    <div className="p-1.5 rounded" style={{ background: '#14b8a610', border: '1px solid #14b8a620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#14b8a6' }}>Unit No</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.unitNo || "-"}</div>
    </div>
    
    {/* Furnishing - Amber */}
    <div className="p-1.5 rounded" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#f59e0b' }}>Furnishing</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.furnishing || "-"}</div>
    </div>
    
    {/* Facing - Orange (Theme) */}
    <div className="p-1.5 rounded" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
      <div className="text-[8px] font-medium" style={{ color: O }}>Facing</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.facing || "-"}</div>
    </div>
    
    {/* Bedrooms - Red */}
    <div className="p-1.5 rounded" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
      <div className="text-[8px] font-medium" style={{ color: '#ef4444' }}>Bedrooms</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.bedrooms || "-"}</div>
    </div>
    
    {/* Bathrooms - Rose */}
    <div className="p-1.5 rounded" style={{ background: '#f43f5e10', border: '1px solid #f43f5e20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#f43f5e' }}>Bathrooms</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.bathrooms || "-"}</div>
    </div>
    
    {/* Balcony - Yellow */}
    <div className="p-1.5 rounded" style={{ background: '#eab30810', border: '1px solid #eab30820' }}>
      <div className="text-[8px] font-medium" style={{ color: '#eab308' }}>Balcony</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.balcony || "-"}</div>
    </div>
    
    {/* Society - Indigo */}
    <div className="p-1.5 rounded" style={{ background: '#6366f110', border: '1px solid #6366f120' }}>
      <div className="text-[8px] font-medium" style={{ color: '#6366f1' }}>Society</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.society || "-"}</div>
    </div>
    
    {/* City - Sky */}
    <div className="p-1.5 rounded" style={{ background: '#0ea5e910', border: '1px solid #0ea5e920' }}>
      <div className="text-[8px] font-medium" style={{ color: '#0ea5e9' }}>City</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.city || "-"}</div>
    </div>
    
    {/* Location - Lime */}
    <div className="p-1.5 rounded" style={{ background: '#84cc1610', border: '1px solid #84cc1620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#84cc16' }}>Location</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.location || "-"}</div>
    </div>
    
    {/* Floor - Stone */}
    <div className="p-1.5 rounded" style={{ background: '#78716c10', border: '1px solid #78716c20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#78716c' }}>Floor</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.floor || "-"}</div>
    </div>
    
    {/* Total Floors - Zinc */}
    <div className="p-1.5 rounded" style={{ background: '#71717a10', border: '1px solid #71717a20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#71717a' }}>Total Floors</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.totalFloors || "-"}</div>
    </div>
    
    {/* Carpet Area - Emerald */}
    <div className="p-1.5 rounded" style={{ background: '#05966910', border: '1px solid #05966920' }}>
      <div className="text-[8px] font-medium" style={{ color: '#059669' }}>Carpet Area</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.carpetArea ? `${property.carpetArea} sq ft` : "-"}</div>
    </div>
    
    {/* Built-up Area - Violet */}
    <div className="p-1.5 rounded" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#8b5cf6' }}>Built-up Area</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.builtupArea ? `${property.builtupArea} sq ft` : "-"}</div>
    </div>
    
    {/* Sell Price - Orange (Theme) */}
    <div className="p-1.5 rounded" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
      <div className="text-[8px] font-medium" style={{ color: O }}>Sell Price</div>
      <div className="font-medium" style={{ color: O }}>{formatCurrency(property?.budget) || "-"}</div>
    </div>
    
    {/* Final Price - Orange (Theme Dark) */}
    <div className="p-1.5 rounded" style={{ background: `${O}15`, border: `1px solid ${O}30` }}>
      <div className="text-[8px] font-medium" style={{ color: O }}>Final Price</div>
      <div className="font-medium" style={{ color: O }}>{formatCurrency(property?.finalPrice) || "-"}</div>
    </div>
    
    {/* Price Type - Amber */}
    <div className="p-1.5 rounded" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#f59e0b' }}>Price Type</div>
      <div className="font-medium" style={{ color: N }}>{property?.priceType || "-"}</div>
    </div>
    
    {/* Parking Qty - Slate */}
    <div className="p-1.5 rounded" style={{ background: '#64748b10', border: '1px solid #64748b20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#64748b' }}>Parking Qty</div>
      <div className="font-medium" style={{ color: N }}>{property?.parkingQty || "-"}</div>
    </div>
    
    {/* Parking Type - Gray */}
    <div className="p-1.5 rounded" style={{ background: '#6b728010', border: '1px solid #6b728020' }}>
      <div className="text-[8px] font-medium" style={{ color: '#6b7280' }}>Parking Type</div>
      <div className="font-medium" style={{ color: N }}>{property?.parkingType || "-"}</div>
    </div>
    
    {/* Selling Rights - Fuchsia */}
    <div className="p-1.5 rounded" style={{ background: '#d946ef10', border: '1px solid #d946ef20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#d946ef' }}>Selling Rights</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.selling_rights || "-"}</div>
    </div>
    
    {/* Lead Source - Rose */}
    <div className="p-1.5 rounded" style={{ background: '#f43f5e10', border: '1px solid #f43f5e20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#f43f5e' }}>Lead Source</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.leadSource || "-"}</div>
    </div>

    {/* Source URL - Indigo */}
    {property?.source_url && (
      <div className="p-1.5 rounded" style={{ background: '#6366f110', border: '1px solid #6366f120' }}>
        <div className="text-[8px] font-medium" style={{ color: '#6366f1' }}>Source URL</div>
        <div className="font-medium truncate" style={{ color: N }}>
          <a
            href={property.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-650 hover:text-blue-800 underline inline-flex items-center gap-0.5 cursor-pointer font-semibold"
            title={property.source_url}
          >
            Open Source Link ↗
          </a>
        </div>
      </div>
    )}
    
    {/* Status - Green (if Available) or Orange */}
    <div className="p-1.5 rounded" style={{ background: property.status === 'Available' ? '#10b98110' : '#f59e0b10', border: `1px solid ${property.status === 'Available' ? '#10b98120' : '#f59e0b20'}` }}>
      <div className="text-[8px] font-medium" style={{ color: property.status === 'Available' ? '#10b981' : '#f59e0b' }}>Status</div>
      <div className="font-medium" style={{ color: property.status === 'Available' ? '#10b981' : '#f59e0b' }}>{property?.status || "-"}</div>
    </div>
    
    {/* Purchase Year - Blue */}
    <div className="p-1.5 rounded" style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#3b82f6' }}>Purchase Year</div>
      <div className="font-medium" style={{ color: N }}>{property?.purchaseYear || "-"}</div>
    </div>
    
    {/* Possession Year - Purple */}
    <div className="p-1.5 rounded" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#8b5cf6' }}>Possession Year</div>
      <div className="font-medium" style={{ color: N }}>{property?.possessionYear || "-"}</div>
    </div>
    
    {/* Purchase Month - Cyan */}
    <div className="p-1.5 rounded" style={{ background: '#06b6d410', border: '1px solid #06b6d420' }}>
      <div className="text-[8px] font-medium" style={{ color: '#06b6d4' }}>Purchase Month</div>
      <div className="font-medium" style={{ color: N }}>{getMonthName(property?.purchaseMonth)}</div>
    </div>
    
    {/* Possession Month - Teal */}
    <div className="p-1.5 rounded" style={{ background: '#14b8a610', border: '1px solid #14b8a620' }}>
      <div className="text-[8px] font-medium" style={{ color: '#14b8a6' }}>Possession Month</div>
      <div className="font-medium" style={{ color: N }}>{getMonthName(property?.possessionMonth)}</div>
    </div>
    
    {/* Publication Date - Indigo */}
    <div className="p-1.5 rounded" style={{ background: '#6366f110', border: '1px solid #6366f120' }}>
      <div className="text-[8px] font-medium" style={{ color: '#6366f1' }}>Publication Date</div>
      <div className="font-medium" style={{ color: N }}>{property.created_at ? new Date(property.created_at).toLocaleDateString() : "-"}</div>
    </div>
    
    {/* Address - Slate (Full Width on Mobile) */}
    <div className="col-span-2 sm:col-span-3 lg:col-span-4 p-1.5 rounded" style={{ background: '#64748b10', border: '1px solid #64748b20' }}>
      <div className="text-[8px] font-medium" style={{ color: '#64748b' }}>Address</div>
      <div className="font-medium truncate" style={{ color: N }}>{property?.address || "-"}</div>
    </div>
  </div>
</div>

          {/* Nearby Places */}
          <div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-1.5" style={{ color: N }}>Nearby Places</h3>
            <div className="flex flex-wrap gap-1">
              {property.nearby_places?.length ? (
                property.nearby_places.map((place: any, idx: number) => (
                  <span key={idx} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px]" style={{ background: `${O}10`, color: O }}>
                    <ArrowRight size={8} /> {place.type || ""} {place.distance ? `${place.distance} ${place.unit || ""}` : ""} {place.name || ""}
                  </span>
                ))
              ) : (
                <span className="text-[9px]" style={{ color: MU }}>No nearby places added</span>
              )}
            </div>
          </div>

          {/* Description */}
         {/* Description - Preserve line breaks */}
<div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
  <h3 className="text-[11px] font-semibold mb-1.5" style={{ color: N }}>Description</h3>
  <div className="text-[10px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: MU }}>
    {(property?.description || "No description available").split('\n').map((line: string, idx: number) => (
      <React.Fragment key={idx}>
        {line}
        {idx < (property?.description || "").split('\n').length - 1 && <br />}
      </React.Fragment>
    ))}
  </div>
</div>

          {/* Amenities & Furnishing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
              <h3 className="text-[11px] font-semibold mb-1.5" style={{ color: N }}>Amenities</h3>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const amenities: string[] = Array.isArray(property.amenities) ? property.amenities : (property.amenities ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
                  return amenities.length ? amenities.map((name, i) => <AmenityPill key={i} name={name} />) : <span className="text-[9px]" style={{ color: MU }}>No amenities listed</span>;
                })()}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-2" style={{ borderColor: BD }}>
              <h3 className="text-[11px] font-semibold mb-1.5" style={{ color: N }}>Furnishing Items</h3>
              <div className="flex flex-wrap gap-1">
                {property.furnishingItems?.length ? property.furnishingItems.map((item: string, index: number) => <FurnishingPill key={index} name={item} />) : <span className="text-[9px]" style={{ color: MU }}>No furnishing items</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Seller, Executive & Key Dates */}
        <div className="w-full xl:w-72 2xl:w-80 shrink-0 space-y-2">
          {/* Seller Card */}
         {/* Seller Card */}
          <div className="rounded-lg p-2.5" style={{ background: 'linear-gradient(135deg, #3b82f608 0%, #3b82f615 100%)', border: '1px solid #3b82f630' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#3b82f620' }}>
                <User size={12} style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="text-[11px] font-bold" style={{ color: '#3b82f6' }}>Seller Information</h3>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                <User size={10} style={{ color: '#3b82f6' }} />
                <span className="font-semibold" style={{ color: N }}>{property.seller?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                <Phone size={10} style={{ color: '#3b82f6' }} />
                <span style={{ color: MU }}>{property.seller?.phone || "Not Available"}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                <Mail size={10} style={{ color: '#3b82f6' }} />
                <span style={{ color: MU }}>{property.seller?.email || "Not Available"}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#3b82f608' }}>
                <MapPin size={10} style={{ color: '#3b82f6' }} />
                <span style={{ color: MU }}>{property?.location && property?.city ? `${property.location}, ${property.city}` : "-"}</span>
              </div>
            </div>
          </div>

          {/* Executive Card */}
          <div className="rounded-lg p-2.5" style={{ background: 'linear-gradient(135deg, #e67e2208 0%, #e67e2215 100%)', border: '1px solid #e67e2230' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#e67e2220' }}>
                <User size={12} style={{ color: O }} />
              </div>
              <h3 className="text-[11px] font-bold" style={{ color: O }}>Executive Information</h3>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#e67e2208' }}>
                <User size={10} style={{ color: O }} />
                <span className="font-semibold" style={{ color: N }}>{property.assignedTo?.name || "-"}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#e67e2208' }}>
                <Phone size={10} style={{ color: O }} />
                <span style={{ color: MU }}>{property.assignedTo?.phone || "Not Available"}</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded" style={{ background: '#e67e2208' }}>
                <Mail size={10} style={{ color: O }} />
                <span style={{ color: MU }}>{property.assignedTo?.email || "Not Available"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border p-2.5" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Actions</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => setOpen(true)} className="flex items-center gap-1 px-2 py-2 rounded-md text-[9px] font-medium transition-colors hover:opacity-80" style={{ background: `${O}10`, color: O }}><Share2 size={12} /> Share</button>
              <button className="flex items-center gap-1 px-2 py-2 rounded-md text-[9px] font-medium transition-colors hover:opacity-80" style={{ background: '#3b82f610', color: '#3b82f6' }}><MessageCircle size={12} /> Message</button>
              <button className="flex items-center gap-1 px-2 py-2 rounded-md text-[9px] font-medium transition-colors hover:opacity-80" style={{ background: '#8b5cf610', color: '#8b5cf6' }}><Calendar size={12} /> Schedule</button>
              <button className="flex items-center gap-1 px-2 py-2 rounded-md text-[9px] font-medium transition-colors hover:opacity-80" style={{ background: '#ef444410', color: '#ef4444' }}><Flame size={12} /> Hot</button>
            </div>
          </div>

          {/* Key Dates */}
          <div className="bg-white rounded-lg border p-2.5" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Key Dates</h3>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between"><span style={{ color: MU }}>Purchase Month</span><span className="font-medium" style={{ color: N }}>{getMonthName(property?.purchaseMonth)}</span></div>
              <div className="flex items-center justify-between"><span style={{ color: MU }}>Purchase Year</span><span className="font-medium" style={{ color: N }}>{property?.purchaseYear || "-"}</span></div>
              <div className="flex items-center justify-between"><span style={{ color: MU }}>Possession Month</span><span className="font-medium" style={{ color: N }}>{getMonthName(property?.possessionMonth)}</span></div>
              <div className="flex items-center justify-between"><span style={{ color: MU }}>Possession Year</span><span className="font-medium" style={{ color: N }}>{property?.possessionYear || "-"}</span></div>
              <div className="flex items-center justify-between"><span style={{ color: MU }}>Created At</span><span className="font-medium" style={{ color: N }}>{property.created_at ? new Date(property.created_at).toLocaleDateString() : "-"}</span></div>
              <div className="flex items-center justify-between"><span style={{ color: MU }}>Last Updated</span><span className="font-medium" style={{ color: N }}>{property.updated_at ? new Date(property.updated_at).toLocaleDateString() : "-"}</span></div>
            </div>
          </div>
        </div>
      </div>

      {open && (
        (() => {
          const displayType = property?.type ?? '';
          const titleParts = [displayType, property?.unitType ?? '', property?.subtype ?? ''].map(s => (s || '').toString().trim()).filter(Boolean);
          const shareTitle = titleParts.length ? titleParts.join(' ') : (property?.title || 'Property Listing');
          const shareDescription = property?.description && property.description !== '' ? property.description : (property?.raw?.description ?? property?.raw?.short_description ?? '');
          const shareImage = (Array.isArray(property?.images) && property.images[0]) || (Array.isArray(property?.photos) && property.photos[0]) || property?.raw?.image || property?.raw?.photo || '';
          const shareUrl = buildPublicPropertyUrl(property);
          return <ShareModal url={shareUrl} title={shareTitle} description={shareDescription} image={shareImage} propertyId={property.id} slug={`${property.id}-${toSlug(property.slug || shareTitle)}`} onClose={() => setOpen(false)} />;
        })()
      )}

      {showGalleryViewer && (
        <ImageViewerModal
          isOpen={showGalleryViewer}
          onClose={() => setShowGalleryViewer(false)}
          photos={effectiveMediaList.map(item => getUrl(item))}
          title={property.title || 'Property'}
        />
      )}
    </div>
  );
};

export default PropertyViewPage;