// import React, { useState, useEffect, useRef } from 'react';
// import type { LucideProps } from "lucide-react";
// type IconComponent = React.ComponentType<Partial<LucideProps>>;
// type Meta = {
//   label: string;
//   Icon: IconComponent;
//   bg: string;
//   fg: string;
// };
// import {
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Edit,
//   Eye,
//   Camera,
//   FileText,
//   Users,
//   Phone,
//   MessageCircle,
//   Mail,
//   MapPin,
//   Home,
//   Shield,
//   Calendar,
//   Bell,
//   Target,
//   TrendingUp,
//   Percent,
//   User,
//   Globe,
//   BarChart3,
//   Flame,
//   Wifi as WifiIcon,
//   Share2,
//   IndianRupee,
//   Bot, // ✅ Added Bot icon for AI score
//   ArrowRight
// } from 'lucide-react';
// import AmenityPill from "../properties/AmenityPill";
// import FurnishingPill from '../properties/FurnishingPill'
// import PropertyStageModal from './PropertyStageModal';
// import PropertyVisitModal from './PropertyVisitModal';
// import PropertyInspectionModal from './PropertyInspectionModal';
// import PropertyMaintenanceModal from './PropertyMaintenanceModal';
// import PropertyReportModal from './PropertyReportModal';
// import PropertyBrochureModal from './PropertyBrochureModal';
// import PropertyShareModal from './PropertyShareModal';
// import PropertyDocumentModal from './PropertyDocumentModal';
// import PropertyNegotiationModal from './PropertyNegotiationModal';
// import PropertyReminderModal from './PropertyReminderModal';
// import PropertyMediaModal from './PropertyMediaModal';
// import PropertyPublishModal from './PropertyPublishModal';
// import PropertyStatusUpdateModal from './PropertyStatusUpdateModal';
// import BuyerMatchingModal from './BuyerMatchingModal';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// import toast from 'react-hot-toast';

// // ✅ Import property tags API and tag styles
// import propertyTagsAPI, { PropertyTagsRow } from '@/lib/propertyTagsAPI';
// import { getTagStyle, DEFAULT_TAG_STYLE } from "@/lib/tagStyles";

// // --- Swiper imports ---
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';
// import ShareModal from '@/pages/public/ShareModal';
// import StagesTab from './propertiescomponents/StagesTab';
// import VisitsTab from './propertiescomponents/VisitsTab';
// import DocumentsTab from './propertiescomponents/DocumentsTab';
// import BuyersTab from './propertiescomponents/BuyersTab';
// import MarketingTab from './propertiescomponents/MarketingTab';
// import NegotiationsTab from './propertiescomponents/NegotiationsTab';
// import ReportsTab from './propertiescomponents/ReportsTab';


// import { useAuth } from '@/contexts/AuthContext';
// import { can } from '@/utils/permission';

// // ---------- Types ----------
// interface UIProperty {
//   id: number | string;
//   propertyId: string;
//   title: string;
//   type: string;
//   subtype: string;
//   unitType: string;
//   wing: string;
//   unitNo: string;
//   furnishing: string;

//   // add new
//   facing: string,
//   balcony: string;
//   bedrooms: string,
//   bathrooms: string,
//   priceType?: 'Fixed' | 'Negotiable' | string;
//   finalPrice?: number | string;

//   furnishingItems?: string[];
//   parkingType: string;
//   parkingQty: number | string;
//   city: string;
//   location: string;
//   society: string;
//   floor: string | number;
//   totalFloors: string | number;
//   carpetArea: number | string;
//   builtupArea: number | string;
//   status: string;
//   leadSource: string;
//   purchaseMonth: string | number;
//   purchaseYear: string | number;
//   possessionMonth: string | number;
//   possessionYear: string | number;
//   budget: number | string;
//   address: string;
//   description: string;
//   selling_rights: string;
//   photos: string[];
//   seller: {
//     id?: number | string;
//     name: string;
//     phone?: string;
//     email?: string;
//     leadSource?: string;
//   };
//   stage: string;
//   stageProgress: number;
//   visits: number;
//   totalVisits: number;
//   lastVisit: string;
//   interestedBuyers: number;
//   hotLeads: number;
//   created_at?: string;
//   updated_at?: string;
//   isPublic: boolean;
//   publicViews: number;
//   publicInquiries: number;
//   amenities?: string[];
//   nearby_places?: Array<{ name: string; distance?: string; type?: string }>;
//   ownershipDocUrl?: string;
//   ownershipDocName?: string;
//   ownershipDocId?: string;
//   negotiablePrice?: number;
//   priceHistory?: any[];
//   activities?: any[];
//   visitHistory?: any[];
//   matchedBuyers?: any[];
//   negotiations?: any[];
//   verified?: boolean;
//   socialShares?: number;
//   brochureDownloads?: number;
//   inspectionStatus?: string;
//   inspectionReport?: any;
//   maintenanceReport?: any;
//   lastStatusUpdate?: string;
//   lastUpdated?: string;
//   aiScore?: number; // ✅ Added AI Score
//   tags?: string[]; // ✅ Added tags field
//   assignedTo?: {
//     id?: number | string;
//     name?: string;
//     phone?: string;
//     email?: string;
//   };
// }

// interface PropertyViewPageProps {
//   property: UIProperty;
//   onBack: () => void;
//   onEdit: (property: UIProperty) => void;
//   onNext?: () => void;
//   onPrevious?: () => void;
//   currentIndex?: number;
//   totalProperties?: number;
//   onUpdateProperty?: (property: UIProperty) => void;
//   onBuyerMatching?: (property: UIProperty) => void;
//   onViewBuyers?: (property: UIProperty) => void;
// }

// // ---------- Helpers (shared) ----------
// const formatCurrency = (amount: number | string) => {
//   const n = Number(amount);
//   if (!Number.isFinite(n) || n <= 0) return ' - ';

//   const CRORE = 10_000_000;
//   const LAKH = 100_000;

//   // Crores → keep actual value (max 2 decimals, no rounding loss)
//   if (n >= CRORE) {
//     const cr = n / CRORE;
//     return `₹${parseFloat(cr.toFixed(2))}Cr`;
//   }

//   // Lakhs → whole lakhs only
//   if (n >= LAKH) {
//     const l = n / LAKH;
//     return `₹${parseFloat(l.toFixed(0))}L`;
//   }

//   // Rupees
//   return `₹${n.toLocaleString('en-IN')}`;
// };


// const safeDaysOnMarket = (createdAt?: string) => {
//   if (!createdAt) return 0;
//   const created = new Date(createdAt).getTime();
//   if (Number.isNaN(created)) return 0;
//   return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
// };

// // ✅ Property Tags Component (same as HomePage)
// const PropertyTags = ({ tags }: { tags: string[] }) => {
//   if (!tags || tags.length === 0) return null;

//   // ✅ Only show first 2 tags
//   const displayTags = tags.slice(0, 20);

//   return (
//     <div className="flex flex-wrap gap-1.5 mb-3">
//       {displayTags.map((tag, index) => {
//         const style = getTagStyle(tag);
//         const EmojiComponent = typeof style.emoji === 'string'
//           ? () => <span className="text-xs mr-1">{style.emoji
//             ? typeof style.emoji === "string"
//               ? (
//                 <span className="text-xs mr-1 uppercase" aria-hidden="true">
//                   {style.emoji}
//                 </span>
//               )
//               : (
//                 // style.emoji is a component here (Lucide icon)
//                 React.createElement(style.emoji, {
//                   size: 10,
//                   className: "mr-1 uppercase",
//                   "aria-hidden": true,
//                 })
//               )
//             : null}
//           </span>
//           : style.emoji;

//         return (
//           <span
//             key={index}
//             className={`
//                 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase 
//                 ${style.bg} ${style.text} ring-1 ${style.ring}
//                 transition-all duration-200
//               `}
//           >
//             {style.emoji && (typeof style.emoji === 'string' ? <EmojiComponent /> : <EmojiComponent size={10} className="mr-1" />)}
//             {tag}
//           </span>
//         );
//       })}
//       {/* ✅ Show +count if there are more than 2 tags */}
//       {tags.length > 10 && (
//         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
//           +{tags.length - 2}
//         </span>
//       )}
//     </div>
//   );
// };

// // Build initial data for edit form
// const buildInitialData = (p: UIProperty) => {

//   return {
//     id: p.id,
//     seller: p.seller?.name || '',
//     propertyType: p.type || '',
//     propertySubtype: p.subtype || '',
//     unitType: p.unitType || '',
//     wing: p.wing || '',
//     unitNo: p.unitNo || '',
//     furnishing: p.furnishing || '',

//     // add new
//     facing: p.facing || '',

//     balcony: p.balcony ? String(p.balcony) : '',
//     bedrooms: p.bedrooms ? String(p.bedrooms) : '',
//     bathrooms: p.bathrooms ? String(p.bathrooms) : '',


//     priceType: (p.priceType as 'Fixed' | 'Negotiable') || 'Fixed',
//     finalPrice: p.finalPrice ? String(p.finalPrice) : '',  // <-- add

//     parkingType: p.parkingType || '',
//     parkingQty: String(p.parkingQty ?? ''),
//     city: p.city || '',
//     location: p.location || '',
//     society: p.society || '',
//     floor: String(p.floor ?? ''),
//     totalFloors: String(p.totalFloors ?? ''),
//     carpetArea: String(p.carpetArea ?? ''),
//     builtupArea: String(p.builtupArea ?? ''),
//     budget: String(p.budget ?? ''),
//     address: p.address || '',
//     status: p.status || '',
//     leadSource: p.seller?.leadSource ?? p.leadSource ?? '',
//     possessionMonth: String(p.possessionMonth ?? ''),
//     possessionYear: String(p.possessionYear ?? ''),
//     purchaseMonth: String(p.purchaseMonth ?? ''),
//     purchaseYear: String(p.purchaseYear ?? ''),
//     sellingRights: p.selling_rights || 'Standard',
//     amenities: Array.isArray(p.amenities) ? p.amenities : [],
//     furnishingItems: Array.isArray(p.furnishingItems) ? p.furnishingItems : [],
//     description: p.description || '',
//     nearby_places: Array.isArray(p.nearby_places) ? p.nearby_places : [],
//     existingOwnershipDocUrl: p.ownershipDocUrl || '',
//     existingOwnershipDocName: p.ownershipDocName || '',
//     existingOwnershipDocId: p.ownershipDocId || '',
//     existingPhotos: (p.photos || []).map((url, idx) => ({
//       id: String(idx + 1),
//       url,
//       name: `photo-${idx + 1}.jpg`,
//     })),
//   };
// };

// /* ---------- Image Zoom Wrapper ---------- */
// const ImageZoom: React.FC<{
//   src: string;
//   alt?: string;
//   className?: string;
//   imgClassName?: string;
// }> = ({ src, alt = 'image', className = '', imgClassName = '' }) => {
//   return (
//     <div className={`group relative overflow-hidden rounded-xl ${className}`}>
//       <img
//         src={src}
//         alt={alt}
//         className={`block w-full h-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.06] ${imgClassName}`}
//         loading="eager"
//         decoding="async"
//         style={{ display: 'block' }}
//       />
//     </div>
//   );
// };

// // ✅ make a clean slug if property.slug missing/dirty
// const toSlug = (s: string) =>
//   (s || "")
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)/g, "")
//     .slice(0, 120);

// // ✅ stable tracking id per property (so analytics consistent rahe)
// const getOrMakeFltCnt = (propId: string | number) => {
//   const key = `fltcnt_${propId}`;
//   let v = localStorage.getItem(key);
//   if (!v) {
//     v = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
//     localStorage.setItem(key, v);
//   }
//   return v;
// };

// // ✅ build the public property URL
// const buildPublicPropertyUrl = (property: any) => {
//   const origin =
//     import.meta.env.VITE_PUBLIC_SITE_ORIGIN // e.g. https://resaleexpert.in
//     || window.location.origin;              // fallback: http://localhost:5173

//   const id = property?.id ?? property?.propertyId;
//   const slug =
//     property?.slug
//       ? toSlug(String(property.slug))
//       : toSlug(
//         [
//           property?.type,
//           property?.unitType,
//           property?.subtype,
//           property?.city,
//           property?.location,
//         ]
//           .filter(Boolean)
//           .join(" ")
//       );

//   const fltcnt = getOrMakeFltCnt(id);
//   return `${origin}/properties/${id}-${slug}?fltcnt=${encodeURIComponent(fltcnt)}`;
// };

// // ---- number helpers
// const toNum = (v: unknown): number | undefined => {
//   if (v === '' || v == null) return undefined;
//   const n = typeof v === 'string' ? Number(v.replace(/[, ]/g, '')) : Number(v);
//   return Number.isFinite(n) ? n : undefined;
// };
// const toNumOrNull = (v: unknown): number | null =>
//   v == null || v === '' ? null : (toNum(v) ?? null);

// // ---- domain type only if you need it
// type PropertyForModals = Omit<UIProperty,
//   'bedrooms' | 'bathrooms' | 'parkingQty' | 'floor' | 'totalFloors' |
//   'carpetArea' | 'builtupArea' | 'budget' | 'finalPrice'
// > & {
//   bedrooms?: number;
//   bathrooms?: number;
//   parkingQty?: number;
//   floor?: number;
//   totalFloors?: number;
//   carpetArea?: number;
//   builtupArea?: number;
//   budget?: number | null;
//   finalPrice?: number | null;
// };

// const normalizeProperty = (p: UIProperty): PropertyForModals => ({
//   ...p,
//   bedrooms: toNum(p.bedrooms),
//   bathrooms: toNum(p.bathrooms),

//   parkingQty: toNum(p.parkingQty),
//   floor: toNum(p.floor),
//   totalFloors: toNum(p.totalFloors),
//   carpetArea: toNum(p.carpetArea),
//   builtupArea: toNum(p.builtupArea),
//   budget: toNumOrNull(p.budget),
//   finalPrice: toNumOrNull(p.finalPrice),
// });

// // ---------- Main Component ----------
// const PropertyViewPage: React.FC<PropertyViewPageProps> = ({
//   property,
//   onBack,
//   onEdit,
//   onNext,
//   onPrevious,
//   currentIndex = 0,
//   totalProperties = 1,
//   onUpdateProperty,
//   onBuyerMatching,
//   onViewBuyers
// }) => {
//   const { user } = useAuth();
//   const canUpdate = can(user, 'property.update');
//   // restore tab from ?tab=... or localStorage, fallback 'overview'
//   const [activeTab, setActiveTab] = useState<string>(() => {
//     const sp = new URLSearchParams(window.location.search);
//     const fromUrl = sp.get('tab');
//     const fromStorage = localStorage.getItem(`pv_tab_${String(property?.id)}`);
//     return (fromUrl || fromStorage || 'overview');
//   });
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showStageModal, setShowStageModal] = useState(false);
//   const [showVisitModal, setShowVisitModal] = useState(false);
//   const [showInspectionModal, setShowInspectionModal] = useState(false);
//   const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
//   const [showReportModal, setShowReportModal] = useState(false);
//   const [showBrochureModal, setShowBrochureModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [showDocumentModal, setShowDocumentModal] = useState(false);
//   const [showNegotiationModal, setShowNegotiationModal] = useState(false);
//   const [showReminderModal, setShowReminderModal] = useState(false);
//   const [showMediaModal, setShowMediaModal] = useState(false);
//   const [showPublishModal, setShowPublishModal] = useState(false);
//   const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
//   const [showBuyerMatching, setShowBuyerMatching] = useState(false);
//   const [propertyData, setPropertyData] = useState<UIProperty>(property);
//   const [reminders, setReminders] = useState<any[]>([]);
//   const [activities, setActivities] = useState<any[]>([]);
//   const [statusHistory, setStatusHistory] = useState<any[]>([]);
//   const [loadingStatusHistory, setLoadingStatusHistory] = useState(false);
//   const prevRef = React.useRef<HTMLButtonElement | null>(null);
//   const nextRef = React.useRef<HTMLButtonElement | null>(null);
//   const [overviewKey, setOverviewKey] = useState(0);
//   const prevShowEditRef = useRef(showEditModal);

//   // Temporary debug - PropertyViewPage mein add karein
//   useEffect(() => {
//     console.log('🔍 Property Data:', property);
//     console.log('🔍 Executive Details:', property.assignedTo);
//   }, [property]);
//   // ✅ Function to fetch tags for a property
//   const fetchPropertyTags = async (propertyId: number): Promise<string[]> => {
//     try {
//       const tagsData = await propertyTagsAPI.getById(propertyId);
//       return tagsData?.tags || [];
//     } catch (err) {
//       console.warn(`Could not load tags for property ${propertyId}:`, err);
//       return [];
//     }
//   };

//   // ✅ Fetch tags when property changes
//   useEffect(() => {
//     const fetchTags = async () => {
//       if (property?.id) {
//         const tags = await fetchPropertyTags(Number(property.id));
//         setPropertyData(prev => ({
//           ...prev,
//           tags
//         }));
//       }
//     };

//     fetchTags();
//   }, [property?.id]);

//   useEffect(() => {
//     if (!property) return;
//     const idChanged = property.id !== propertyData.id;
//     const tsChanged = property.updated_at !== propertyData.updated_at;

//     if (idChanged || tsChanged) {
//       setPropertyData(property);
//       setOverviewKey(k => k + 1); // ✅ OverviewTab key bump -> fresh render
//     }
//   }, [property?.id, property?.updated_at]);

//   // 🔊 listen once, remount Overview on event
//   useEffect(() => {
//     const handler = (e: any) => {
//       setOverviewKey(k => k + 1);
//       setActiveTab('overview');
//     };

//     window.addEventListener('overview:refresh', handler);
//     return () => window.removeEventListener('overview:refresh', handler);
//   }, [propertyData.id]);

//   // inside PropertyViewPage
//   useEffect(() => {
//     setPropertyData(property);
//   }, [property]);

//   // when property id changes, try restoring its last-opened tab
//   useEffect(() => {
//     const sp = new URLSearchParams(window.location.search);
//     const fromUrl = sp.get('tab');
//     const fromStorage = localStorage.getItem(`pv_tab_${String(property?.id)}`);
//     const next = (fromUrl || fromStorage);
//     if (next && next !== activeTab) setActiveTab(next);
//   }, [property?.id]);

//   // Property stages with automatic progression
//   const propertyStages = [
//     {
//       id: 'initial_contact',
//       label: 'Initial Contact',
//       progress: 10,
//       description: 'First contact with seller',
//       tasks: ['Contact seller', 'Understand requirements', 'Schedule meeting'],
//       nextStage: 'property_collection'
//     },
//     {
//       id: 'property_collection',
//       label: 'Property Collection',
//       progress: 25,
//       description: 'Collect property details and documents',
//       tasks: ['Property visit', 'Document verification', 'Photo/video shoot'],
//       nextStage: 'mandate_discussion'
//     },
//     {
//       id: 'mandate_discussion',
//       label: 'Mandate Discussion',
//       progress: 40,
//       description: 'Discuss mandate and authorization',
//       tasks: ['Mandate discussion', 'Price negotiation', 'Terms agreement'],
//       nextStage: 'mandate_signed'
//     },
//     {
//       id: 'mandate_signed',
//       label: 'Mandate Signed',
//       progress: 55,
//       description: 'Mandate and documents signed',
//       tasks: ['Document signing', 'Authorization letters', 'Marketing rights'],
//       nextStage: 'marketing_active'
//     },
//     {
//       id: 'marketing_active',
//       label: 'Marketing Active',
//       progress: 70,
//       description: 'Property actively marketed',
//       tasks: ['Create brochure', 'Publish on portals', 'Buyer matching'],
//       nextStage: 'buyer_interested'
//     },
//     {
//       id: 'buyer_interested',
//       label: 'Buyer Interested',
//       progress: 80,
//       description: 'Buyers showing interest',
//       tasks: ['Buyer visits', 'Negotiations', 'Offer management'],
//       nextStage: 'deal_negotiation'
//     },
//     {
//       id: 'deal_negotiation',
//       label: 'Deal Negotiation',
//       progress: 90,
//       description: 'Active deal negotiations',
//       tasks: ['Price negotiation', 'Terms finalization', 'Agreement preparation'],
//       nextStage: 'deal_closure'
//     },
//     {
//       id: 'deal_closure',
//       label: 'Deal Closure',
//       progress: 100,
//       description: 'Deal successfully closed',
//       tasks: ['Final agreement', 'Payment completion', 'Handover'],
//       nextStage: null
//     }
//   ];

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: Home },
//     { id: 'stages', label: 'Stages & Progress', icon: TrendingUp },
//     { id: 'visits', label: 'Visits & Inspections', icon: Eye },
//     { id: 'documents', label: 'Documents', icon: FileText },
//     { id: 'buyers', label: 'Buyer Interest', icon: Users },
//     { id: 'marketing', label: 'Marketing', icon: Globe },
//     { id: 'negotiations', label: 'Negotiations', icon: Target },
//     { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
//   ];

//   // Fetch status history from API
//   const fetchStatusHistory = async () => {
//     setLoadingStatusHistory(true);
//     try {
//       const response = await propertiesAPI.getStatusHistory(String(propertyData.id));
//       if (response.success) {
//         setStatusHistory(response.data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch status history:', error);
//       toast.error('Failed to load status history');
//     } finally {
//       setLoadingStatusHistory(false);
//     }
//   };

//   // Initialize reminders and activities
//   useEffect(() => {
//     const currentStage = propertyStages.find(s => s.id === propertyData.stage);
//     if (currentStage) {
//       const stageReminders = generateStageReminders(currentStage);
//       setReminders(stageReminders);
//     }
//     setActivities(propertyData.activities || []);
//   }, [propertyData.stage]);

//   // Fetch status history on mount and when property changes
//   useEffect(() => {
//     if (propertyData.id) {
//       fetchStatusHistory();
//     }
//   }, [propertyData.id]);

//   // Listen for custom event to open status update modal
//   useEffect(() => {
//     const handleOpenStatusModal = (event: CustomEvent) => {
//       if (event.detail.id === propertyData.id) {
//         setShowStatusUpdateModal(true);
//       }
//     };

//     window.addEventListener('openStatusUpdateModal', handleOpenStatusModal as EventListener);

//     return () => {
//       window.removeEventListener('openStatusUpdateModal', handleOpenStatusModal as EventListener);
//     };
//   }, [propertyData.id]);

//   const generateStageReminders = (stage: any) => {
//     const baseReminders: any[] = [
//       {
//         id: 1,
//         type: 'stage_progress',
//         title: `Complete ${stage.label} tasks`,
//         description: `${stage.tasks.join(', ')}`,
//         dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         priority: 'high',
//         status: 'pending'
//       },
//       {
//         id: 2,
//         type: 'weekly_update',
//         title: 'Weekly status update',
//         description: 'Update property status and progress',
//         dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         priority: 'medium',
//         status: 'pending'
//       }
//     ];

//     if (stage.id === 'property_collection') {
//       baseReminders.push({
//         id: 3,
//         type: 'photo_video',
//         title: 'Property photo/video shoot',
//         description: 'Schedule professional photography and videography',
//         dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         priority: 'high',
//         status: 'pending'
//       });
//     }

//     if (stage.id === 'marketing_active') {
//       baseReminders.push({
//         id: 4,
//         type: 'portal_publish',
//         title: 'Publish on property portals',
//         description: 'List property on MagicBricks, 99acres, Housing.com',
//         dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//         priority: 'high',
//         status: 'pending'
//       });
//     }

//     return baseReminders;
//   };

//   const getCurrentStage = () => {
//     return propertyStages.find(s => s.id === propertyData.stage) || propertyStages[0];
//   };

//   const getNextStage = () => {
//     const currentStage = getCurrentStage();
//     return propertyStages.find(s => s.id === currentStage.nextStage);
//   };

//   // Handle edit property
//   const handleEditProperty = () => {
//     setShowEditModal(true);
//   };

//   useEffect(() => {
//     localStorage.setItem(`pv_tab_${String(propertyData.id)}`, activeTab);
//     const sp = new URLSearchParams(window.location.search);
//     sp.set('tab', activeTab);
//     window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
//   }, [activeTab, propertyData.id]);

//   const handleEditSubmit = (result: any) => {
//     const updatedProperty = {
//       ...propertyData,
//       ...result,
//       updated_at: new Date().toISOString(),
//       activities: [
//         ...(activities || []),
//         {
//           id: Date.now(),
//           type: 'property_update',
//           description: 'Property details updated',
//           date: new Date().toISOString().split('T')[0],
//           time: new Date().toLocaleTimeString(),
//           user: 'Admin User',
//         },
//       ],
//     };

//     setPropertyData(updatedProperty);
//     onUpdateProperty?.(updatedProperty);

//     // 👇 force re-mount (key bump)
//     setOverviewKey((k) => k + 1);

//     // 👇 tumhare listener ke liye custom event fire karo (id pass karo)
//     window.dispatchEvent(
//       new CustomEvent('overview:refresh', { detail: { id: updatedProperty.id } })
//     );

//     setShowEditModal(false);
//     toast.success('Property updated successfully!');
//   };

//   const handleStageProgress = async (newStage: string, remarks: string) => {
//     const updatedProperty = {
//       ...propertyData,
//       stage: newStage,
//       stageProgress: propertyStages.find(s => s.id === newStage)?.progress || 0,
//       lastUpdated: new Date().toISOString(),
//       activities: [
//         ...(activities || []),
//         {
//           id: Date.now(),
//           type: 'stage_update',
//           description: `Stage updated to ${propertyStages.find(s => s.id === newStage)?.label}`,
//           remarks: remarks,
//           date: new Date().toISOString().split('T')[0],
//           time: new Date().toLocaleTimeString(),
//           user: 'Admin User'
//         }
//       ]
//     };

//     setPropertyData(updatedProperty);
//     onUpdateProperty?.(updatedProperty);
//     toast.success('Stage updated successfully!');
//   };

//   const handlePropertyVisit = async (visitData: any) => {
//     const updatedProperty = {
//       ...propertyData,
//       visits: (propertyData.visits || 0) + 1,
//       lastVisit: visitData.date,
//       activities: [
//         ...(activities || []),
//         {
//           id: Date.now(),
//           type: 'property_visit',
//           description: `Property visit completed - ${visitData.purpose}`,
//           remarks: visitData.findings,
//           date: visitData.date,
//           time: visitData.time,
//           user: visitData.inspector,
//           details: visitData
//         }
//       ]
//     };

//     setPropertyData(updatedProperty);
//     onUpdateProperty?.(updatedProperty);
//     toast.success('Property visit recorded!');
//   };

//   const handleInspectionComplete = async (inspectionData: any) => {
//     const updatedProperty = {
//       ...propertyData,
//       inspectionStatus: 'completed',
//       inspectionReport: inspectionData,
//       activities: [
//         ...(activities || []),
//         {
//           id: Date.now(),
//           type: 'inspection',
//           description: `Property inspection completed - Overall rating: ${inspectionData.overallRating}/10`,
//           remarks: inspectionData.summary,
//           date: inspectionData.date,
//           time: new Date().toLocaleTimeString(),
//           user: inspectionData.inspector,
//           details: inspectionData
//         }
//       ]
//     };

//     setPropertyData(updatedProperty);
//     onUpdateProperty?.(updatedProperty);
//     toast.success('Inspection report generated!');
//   };

//   const handleMaintenanceSuggestions = async (maintenanceData: any) => {
//     const updatedProperty = {
//       ...propertyData,
//       maintenanceReport: maintenanceData,
//       activities: [
//         ...(activities || []),
//         {
//           id: Date.now(),
//           type: 'maintenance',
//           description: `Maintenance suggestions provided - ${maintenanceData.suggestions.length} items`,
//           remarks: maintenanceData.summary,
//           date: new Date().toISOString().split('T')[0],
//           time: new Date().toLocaleTimeString(),
//           user: 'Admin User',
//           details: maintenanceData
//         }
//       ]
//     };

//     setPropertyData(updatedProperty);
//     onUpdateProperty?.(updatedProperty);
//     toast.success('Maintenance suggestions saved!');
//   };

//   // Updated handleStatusUpdate to use API and refresh history
//   const handleStatusUpdate = async (newStatus: string, remarks: string, formData: any) => {
//     const updatedProperty = {
//       ...propertyData,
//       status: newStatus,
//       lastStatusUpdate: new Date().toISOString(),
//       ...(formData.priceAdjustment && formData.newPrice && {
//         budget: formData.newPrice
//       }),
//       activities: [
//         ...(activities || []),
//         {
//           id: Date.now(),
//           type: 'status_update',
//           description: `Property status updated to ${newStatus}`,
//           remarks: remarks,
//           date: new Date().toISOString().split('T')[0],
//           time: new Date().toLocaleTimeString(),
//           user: formData.updatedBy || 'Admin User',
//           details: formData
//         }
//       ]
//     };

//     setPropertyData(updatedProperty);
//     onUpdateProperty?.(updatedProperty);
//     setActivities(updatedProperty.activities || []);

//     // Refresh status history from API
//     await fetchStatusHistory();

//     toast.success('Property status updated!');
//   };

//   const getStatusBadge = (status: string) => {
//     const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
//       'Available': { bg: 'bg-green-100', text: 'text-green-700', icon: '🟢', label: 'Available' },
//       'Sold': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔵', label: 'Sold' },
//       'Under Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🟡', label: 'Under Negotiation' },
//       'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚫', label: 'On Hold' },
//       'Finalization': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🟣', label: 'Finalization' }
//     };

//     const config = statusConfig[status] || statusConfig['Available'];
//     return (
//       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
//         {config.icon} {config.label}
//       </span>
//     );
//   };

//   const getStageBadge = (stage: string) => {
//     const currentStage = propertyStages.find(s => s.id === stage);
//     return (
//       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
//         📍 {currentStage?.label || 'Unknown Stage'}
//       </span>
//     );
//   };

//   const getPendingReminders = () => reminders.filter((r: any) => r.status === 'pending').length;

//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-4 py-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={onBack}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ArrowLeft size={18} />
//             </button>
//             <div>
//               {/* <h1 className="text-xl font-bold text-gray-900">{propertyData.title}</h1> */}
//               <div className=" font-bold text-gray-900 text-lg">
//                 {(propertyData.type && propertyData.type !== ' - ') && <span className="mr-2">{propertyData.type}</span>}
//                 {(propertyData.unitType && propertyData.unitType !== ' - ') && <span className="mr-2">{propertyData.unitType}</span>}
//                 {(propertyData.subtype && propertyData.subtype !== ' - ') && <span className="mr-2">{propertyData.subtype}</span>}
//               </div>

//               <div className="flex items-center space-x-2 mt-1">
//                 {getStatusBadge(propertyData.status)}
//                 {getStageBadge(propertyData.stage)}
//                 <span className="text-sm text-gray-500">ID: {propertyData.propertyId}</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             {/* Navigation */}
//             {onNext && onPrevious && (
//               <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
//                 <button
//                   onClick={onPrevious}
//                   disabled={currentIndex === 0}
//                   className="p-1.5 rounded bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>
//                 <span className="px-2 text-sm font-medium text-gray-600">
//                   {currentIndex + 1} of {totalProperties}
//                 </span>
//                 <button
//                   onClick={onNext}
//                   disabled={currentIndex === totalProperties - 1}
//                   className="p-1.5 rounded bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             )}

//             {/* Reminders Bell */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowReminderModal(true)}
//                 className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors relative"
//               >
//                 <Bell size={18} />
//                 {getPendingReminders() > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {getPendingReminders()}
//                   </span>
//                 )}
//               </button>
//             </div>

//             {/* Quick Actions */}
//             <button
//               onClick={() => setShowStatusUpdateModal(true)}
//               className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
//             >
//               Update Status
//             </button>
//             <button
//               onClick={() => setShowStageModal(true)}
//               className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
//             >
//               Update Stage
//             </button>
//             {/* Edit - Conditional */}
//             {canUpdate && (
//               <button
//                 onClick={handleEditProperty}
//                 className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//               >
//                 <Edit size={18} />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="mt-3">
//           <nav className="flex space-x-1 overflow-x-auto pb-1">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-sm ${activeTab === tab.id
//                     ? 'bg-blue-100 text-blue-700 border border-blue-200'
//                     : 'text-gray-600 hover:bg-gray-100'
//                     }`}
//                 >
//                   <Icon size={14} />
//                   <span>{tab.label}</span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 overflow-auto p-4">
//         {activeTab === 'overview' && (
//           <OverviewTab
//             key={`ov-${propertyData.id}-${overviewKey}`}
//             property={propertyData}
//             onUpdate={setPropertyData}
//           />
//         )}

//         {activeTab === 'stages' && (
//           <StagesTab
//             property={propertyData}
//             stages={propertyStages}
//             onStageUpdate={handleStageProgress}
//             onShowStageModal={() => setShowStageModal(true)}
//             statusHistory={statusHistory}
//             loadingStatusHistory={loadingStatusHistory}
//             onRefreshHistory={fetchStatusHistory}
//           />
//         )}
//         {activeTab === 'visits' && (
//           <VisitsTab
//             property={propertyData}
//             onScheduleVisit={() => setShowVisitModal(true)}
//             onStartInspection={() => setShowInspectionModal(true)}
//             onMaintenanceSuggestions={() => setShowMaintenanceModal(true)}
//             onGenerateReport={() => setShowReportModal(true)}
//           />
//         )}
//         {activeTab === 'documents' && (
//           <DocumentsTab
//             property={propertyData}
//             onCreateDocument={() => setShowDocumentModal(true)}
//           />
//         )}
//         {activeTab === 'buyers' && (
//           <BuyersTab
//             property={propertyData}
//             onMatchBuyers={() => setShowBuyerMatching(true)}
//           />
//         )}
//         {activeTab === 'marketing' && (
//           <MarketingTab
//             property={propertyData}
//             onCreateBrochure={() => setShowBrochureModal(true)}
//             onShareProperty={() => setShowShareModal(true)}
//             onManageMedia={() => setShowMediaModal(true)}
//             onPublishProperty={() => setShowPublishModal(true)}
//           />
//         )}
//         {activeTab === 'negotiations' && (
//           <NegotiationsTab
//             property={propertyData}
//             onStartNegotiation={() => setShowNegotiationModal(true)}
//           />
//         )}
//         {activeTab === 'reports' && <ReportsTab property={propertyData} />}
//       </div>

//       {/* All Modals */}
//       {showEditModal && (
//         <PropertyFormModal
//           isOpen={showEditModal}
//           onClose={() => setShowEditModal(false)}
//           mode="edit"
//           propertyId={propertyData.id}
//           initialData={buildInitialData(propertyData)}
//           onSubmit={handleEditSubmit}
//         />
//       )}

//       {showStageModal && (
//         <PropertyStageModal
//           isOpen={showStageModal}
//           onClose={() => setShowStageModal(false)}
//           property={propertyData}
//           stages={propertyStages}
//           onStageUpdate={handleStageProgress}
//         />
//       )}

//       {showVisitModal && (
//         <PropertyVisitModal
//           isOpen={showVisitModal}
//           onClose={() => setShowVisitModal(false)}
//           property={propertyData}
//           onSave={handlePropertyVisit}
//         />
//       )}

//       {showInspectionModal && (
//         <PropertyInspectionModal
//           isOpen={showInspectionModal}
//           onClose={() => setShowInspectionModal(false)}
//           property={propertyData}
//           onSave={handleInspectionComplete}
//         />
//       )}

//       {showMaintenanceModal && (
//         <PropertyMaintenanceModal
//           isOpen={showMaintenanceModal}
//           onClose={() => setShowMaintenanceModal(false)}
//           property={propertyData}
//           onSave={handleMaintenanceSuggestions}
//         />
//       )}

//       {showReportModal && (
//         <PropertyReportModal
//           isOpen={showReportModal}
//           onClose={() => setShowReportModal(false)}
//           property={propertyData}
//         />
//       )}

//       {showBrochureModal && (
//         <PropertyBrochureModal
//           isOpen={showBrochureModal}
//           onClose={() => setShowBrochureModal(false)}
//           property={normalizeProperty(propertyData)}
//         />
//       )}

//       {showShareModal && (
//         <PropertyShareModal
//           isOpen={showShareModal}
//           onClose={() => setShowShareModal(false)}
//           property={propertyData}
//         />
//       )}

//       {showDocumentModal && (
//         <PropertyDocumentModal
//           isOpen={showDocumentModal}
//           onClose={() => setShowDocumentModal(false)}
//           property={propertyData}
//         />
//       )}

//       {showNegotiationModal && (
//         <PropertyNegotiationModal
//           isOpen={showNegotiationModal}
//           onClose={() => setShowNegotiationModal(false)}
//           property={propertyData}
//         />
//       )}

//       {showReminderModal && (
//         <PropertyReminderModal
//           isOpen={showReminderModal}
//           onClose={() => setShowReminderModal(false)}
//           property={propertyData}
//           reminders={reminders}
//           onUpdateReminders={setReminders}
//         />
//       )}

//       {showMediaModal && (
//         <PropertyMediaModal
//           isOpen={showMediaModal}
//           onClose={() => setShowMediaModal(false)}
//           property={propertyData}
//           onUpdate={setPropertyData}
//         />
//       )}

//       {showPublishModal && (
//         <PropertyPublishModal
//           isOpen={showPublishModal}
//           onClose={() => setShowPublishModal(false)}
//           property={propertyData}
//           onUpdate={setPropertyData}
//         />
//       )}

//       {showStatusUpdateModal && (
//         <PropertyStatusUpdateModal
//           isOpen={showStatusUpdateModal}
//           onClose={() => setShowStatusUpdateModal(false)}
//           property={propertyData}
//           onStatusUpdate={handleStatusUpdate}
//         />
//       )}

//       {showBuyerMatching && (
//         <BuyerMatchingModal
//           isOpen={showBuyerMatching}
//           onClose={() => setShowBuyerMatching(false)}
//           property={propertyData}
//         />
//       )}
//     </div>
//   );
// };

// // ---------- Overview Tab ----------
// const OverviewTab = ({ property, onUpdate }: any) => {
//   const [editingPrice, setEditingPrice] = useState(false);
//   const [quotePrice, setQuotePrice] = useState(property.budget || 0);
//   const [negotiablePrice, setNegotiablePrice] = useState(property.negotiablePrice || property.budget * 0.95);

//   const prevRef = React.useRef<HTMLButtonElement | null>(null);
//   const nextRef = React.useRef<HTMLButtonElement | null>(null);
//   const [open, setOpen] = useState(false);
//   useEffect(() => {
//     setQuotePrice(property.budget || 0);
//     setNegotiablePrice(
//       property.negotiablePrice ?? (property.budget ? property.budget * 0.95 : 0)
//     );
//   }, [property.budget, property.negotiablePrice, property.updated_at]);

//   // utils/helper
//   const getMonthName = (value?: string | number | null) => {
//     if (!value) return "";
//     const month = typeof value === "string" ? parseInt(value) : value;
//     if (isNaN(month) || month < 1 || month > 12) return "";
//     return new Date(0, month - 1).toLocaleString("en", { month: "long" });
//   };

//   const handlePriceUpdate = () => {
//     const updatedProperty = {
//       ...property,
//       budget: quotePrice,
//       negotiablePrice: negotiablePrice,
//       priceHistory: [
//         ...(property.priceHistory || []),
//         {
//           date: new Date().toISOString().split('T')[0],
//           quotePrice: quotePrice,
//           negotiablePrice: negotiablePrice,
//           updatedBy: 'Admin User'
//         }
//       ]
//     };
//     onUpdate(updatedProperty);
//     setEditingPrice(false);
//     toast.success('Pricing updated successfully!');
//   };

//   return (
//     <div className="space-y-4">
//       {/* Property Images with Swiper */}
//       <div className="space-y-4">
//         <div className="flex flex-col xl:flex-row gap-4">
//           <div className="flex-1 space-y-4 min-w-0">
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="relative">
//                 <Swiper
//                   modules={[Navigation]}
//                   onBeforeInit={(swiper) => {
//                     // @ts-ignore
//                     swiper.params.navigation.prevEl = prevRef.current;
//                     // @ts-ignore
//                     swiper.params.navigation.nextEl = nextRef.current;
//                   }}
//                   navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
//                   className="mySwiper w-full"
//                 >
//                   {(property.photos?.length ? property.photos : [
//                     'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
//                   ]).map((photo: string, index: number) => (
//                     <SwiperSlide key={index}>
//                       <div className="relative w-full">
//                         {/* Hover zoom added here */}
//                         <ImageZoom
//                           src={photo}
//                           alt={`${property.title || 'Property'} - ${index + 1}`}
//                           className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[450px]"
//                           imgClassName="rounded-xl"
//                         />

//                         {/* ✅ Tags & AI Score Overlay */}
//                         {/* ✅ Tags & AI Score Overlay (Right Aligned) */}
//                         <div className="absolute top-3 right-3 flex items-start flex-wrap justify-end gap-2 z-20 text-right">
//                           {/* ✅ Property Tags first (right side) */}
//                           <div className="flex flex-wrap justify-end gap-1.5">
//                             <PropertyTags tags={property.tags || []} />
//                           </div>

//                           {/* AI Score Badge next to tags */}
//                           {(property.aiScore ?? 0) >= 90 && (
//                             <span className="flex-none whitespace-nowrap bg-purple-600 text-white px-2 py-1 rounded-full text-[8px] sm:text-xs font-bold leading-none flex items-center shadow-sm">
//                               <Bot size={12} className="mr-1" />
//                               AI {Math.round(property.aiScore ?? 0)}
//                             </span>
//                           )}
//                         </div>

//                       </div>
//                     </SwiperSlide>
//                   ))}

//                   {/* Custom arrows */}
//                   <button
//                     ref={prevRef}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center
//                   w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-sm
//                   hover:bg-black/60 transition"
//                     aria-label="Previous slide"
//                     type="button"
//                   >
//                     ‹
//                   </button>
//                   <button
//                     ref={nextRef}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center
//                   w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-sm
//                   hover:bg-black/60 transition"
//                     aria-label="Next slide"
//                     type="button"
//                   >
//                     ›
//                   </button>
//                 </Swiper>

//                 {/* Status badges */}
//                 <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
//                   {property.isPublic ? (
//                     <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 ring-1 ring-green-200 shadow-sm">
//                       PUBLIC
//                     </span>
//                   ) : (
//                     <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200 shadow-sm">
//                       PRIVATE
//                     </span>
//                   )}

//                   {property.hotLeads > 2 && (
//                     <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs md:text-sm font-bold">
//                       HOT PROPERTY
//                     </span>
//                   )}
//                   {property.verified && (
//                     <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs md:text-sm font-bold flex items-center gap-1">
//                       <Shield size={12} />
//                       <span>VERIFIED</span>
//                     </span>
//                   )}
//                 </div>

//                 {/* Camera button */}
//                 <div className="absolute bottom-4 right-4 z-20">
//                   <button className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/70 transition">
//                     <Camera size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Info Cards */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4">
//               <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
//               <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
//                 {/* Quote Price */}
//                 <div className="bg-white rounded-lg border border-gray-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Quote Price</p>
//                       <div className="flex items-center gap-2">
//                         {editingPrice ? (
//                           <input
//                             type="number"
//                             value={quotePrice}
//                             onChange={(e) => setQuotePrice(Number(e.target.value))}
//                             className="text-lg font-bold text-green-600 border-b border-green-300 bg-transparent w-28 focus:outline-none"
//                             onBlur={handlePriceUpdate}
//                             onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate()}
//                             autoFocus
//                           />
//                         ) : (
//                           <p
//                             className="text-lg font-bold text-green-600 cursor-pointer hover:text-green-700"
//                             onClick={() => setEditingPrice(true)}
//                           >
//                             {formatCurrency(quotePrice)}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     <IndianRupee className="text-green-600" size={20} />
//                   </div>
//                 </div>

//                 {/* Negotiable Price */}
//                 <div className="bg-white rounded-lg border border-gray-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Negotiable Price</p>
//                       <p className="text-lg font-bold text-orange-600">
//                         {formatCurrency(property?.finalPrice)}
//                       </p>
//                     </div>
//                     <Percent className="text-orange-600" size={20} />
//                   </div>
//                 </div>

//                 {/* Total Visits */}
//                 <div className="bg-white rounded-lg border border-gray-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Total Visits</p>
//                       <p className="text-lg font-bold text-blue-600">
//                         {property.visits || 0}
//                       </p>
//                     </div>
//                     <Eye className="text-blue-600" size={20} />
//                   </div>
//                 </div>

//                 {/* Interested Buyers */}
//                 <div className="bg-white rounded-lg border border-gray-200 p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Interested Buyers</p>
//                       <p className="text-lg font-bold text-purple-600">
//                         {property.interestedBuyers || 0}
//                       </p>
//                     </div>
//                     <Users className="text-purple-600" size={20} />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Property Details */}
//             {/* 🏠 Property Details (Compact Height, subtle colors) */}
//             <div className="bg-white rounded-xl border border-gray-200 p-3">
//               <h3 className="font-semibold text-gray-900 mb-2">Property Details</h3>

//               <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-5 gap-2 text-[13px] leading-tight">
//                 {/* Row 1 */}
//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Seller</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900 truncate">{property.seller?.name || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Property Type</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900 truncate">{property?.type || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Unit Type</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900 truncate">{property?.unitType || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Subtype</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900 truncate">{property?.subtype || "-"}</div>
//                 </div>

//                 {/* Row 2 */}
//                 <div className="p-2 rounded-md bg-indigo-50/50 ring-1 ring-indigo-100/60">
//                   <div className="text-[10px] font-medium text-indigo-600/80">Society</div>
//                   <div className="mt-0 text-[12px] font-semibold text-indigo-900 truncate">{property?.society || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-indigo-50/50 ring-1 ring-indigo-100/60">
//                   <div className="text-[10px] font-medium text-indigo-600/80">Wing</div>
//                   <div className="mt-0 text-[12px] font-semibold text-indigo-900 truncate">{property?.wing || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-indigo-50/50 ring-1 ring-indigo-100/60">
//                   <div className="text-[10px] font-medium text-indigo-600/80">Unit No</div>
//                   <div className="mt-0 text-[12px] font-semibold text-indigo-900 truncate">{property?.unitNo || "-"}</div>
//                 </div>

//                 {/* Row 3 */}
//                 <div className="p-2 rounded-md bg-emerald-50/60 ring-1 ring-emerald-100/60">
//                   <div className="text-[10px] font-medium text-emerald-600/90">Facing</div>
//                   <div className="mt-0 text-[12px] font-semibold text-emerald-900">{property?.facing || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-emerald-50/60 ring-1 ring-emerald-100/60">
//                   <div className="text-[10px] font-medium text-emerald-600/90">Bedrooms</div>
//                   <div className="mt-0 text-[12px] font-semibold text-emerald-900">{property?.bedrooms || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-emerald-50/60 ring-1 ring-emerald-100/60">
//                   <div className="text-[10px] font-medium text-emerald-600/90">Bathrooms</div>
//                   <div className="mt-0 text-[12px] font-semibold text-emerald-900">{property?.bathrooms || "-"}</div>
//                 </div>
//                 <div className="p-2 rounded-md bg-emerald-50/60 ring-1 ring-emerald-100/60">
//                   <div className="text-[10px] font-medium text-emerald-600/90">Balcony</div>
//                   <div className="mt-0 text-[12px] font-semibold text-emerald-900">
//                     {property?.balcony || "-"}
//                   </div>
//                 </div>
//                 {/* Floor */}
//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Floor</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900">{property?.floor ?? "-"}</div>
//                 </div>

//                 {/* Total Floors */}
//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Total Floors</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900">{property?.totalFloors ?? property?.total_floors ?? "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-sky-50/60 ring-1 ring-sky-100/60">
//                   <div className="text-[10px] font-medium text-sky-600/90">City</div>
//                   <div className="mt-0 text-[12px] font-semibold text-sky-900 truncate">{property?.city || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-sky-50/60 ring-1 ring-sky-100/60">
//                   <div className="text-[10px] font-medium text-sky-600/90">Location</div>
//                   <div className="mt-0 text-[12px] font-semibold text-sky-900 truncate">{property?.location || "-"}</div>
//                 </div>

//                 {/* Row 4 */}
//                 <div className="p-2 rounded-md bg-fuchsia-50/50 ring-1 ring-fuchsia-100/60">
//                   <div className="text-[10px] font-medium text-fuchsia-600/80">Built-up Area</div>
//                   <div className="mt-0 text-[12px] font-semibold text-fuchsia-900">{property?.builtupArea ? `${property.builtupArea} Sq.ft.` : "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-fuchsia-50/50 ring-1 ring-fuchsia-100/60">
//                   <div className="text-[10px] font-medium text-fuchsia-600/80">Carpet Area</div>
//                   <div className="mt-0 text-[12px] font-semibold text-fuchsia-900">{property?.carpetArea ? `${property.carpetArea} Sq.ft.` : "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-green-50 ring-1 ring-green-100">
//                   <div className="text-[10px] font-medium text-green-700">Sell Price</div>
//                   <div className="mt-0 inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 text-green-800 ring-1 ring-green-200 text-[12px] font-semibold">
//                     {property?.budget ? formatCurrency(property?.budget) : "-"}
//                   </div>
//                 </div>

//                 <div className="p-2 rounded-md bg-amber-50 ring-1 ring-amber-100">
//                   <div className="text-[10px] font-medium text-amber-700">Final Price</div>
//                   <div className="mt-0 inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 ring-1 ring-amber-200 text-[12px] font-semibold">
//                     {property?.finalPrice ? formatCurrency(property?.finalPrice) : "-"}
//                   </div>
//                 </div>

//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Price Type</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900">{property?.priceType || "-"}</div>
//                 </div>

//                 {/* Row 5 – Parking split */}
//                 <div className="p-2 rounded-md bg-zinc-50 ring-1 ring-zinc-100">
//                   <div className="text-[10px] font-medium text-zinc-500">Parking Qty</div>
//                   <div className="mt-0 text-[12px] font-semibold text-zinc-900">{property?.parkingQty ?? property?.parking_qty ?? "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-zinc-50 ring-1 ring-zinc-100">
//                   <div className="text-[10px] font-medium text-zinc-500">Parking Type</div>
//                   <div className="mt-0 text-[12px] font-semibold text-zinc-900">{property?.parkingType ?? property?.parking_type ?? "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-violet-50/50 ring-1 ring-violet-100/60">
//                   <div className="text-[10px] font-medium text-violet-600/80">Furnishing</div>
//                   <div className="mt-0 text-[12px] font-semibold text-violet-900">{property?.furnishing || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-violet-50/50 ring-1 ring-violet-100/60">
//                   <div className="text-[10px] font-medium text-violet-600/80">Possession Year</div>
//                   <div className="mt-0 text-[12px] font-semibold text-violet-900">
//                     {getMonthName(property?.possessionMonth)} {property?.possessionYear || "-"}
//                   </div>
//                 </div>

//                 {/* Row 6 – Meta */}
//                 <div className="p-2 rounded-md bg-rose-50/60 ring-1 ring-rose-100/60">
//                   <div className="text-[10px] font-medium text-rose-600/90">Purchase Date</div>
//                   <div className="mt-0 text-[12px] font-semibold text-rose-900">
//                     {getMonthName(property?.purchaseMonth)} {property?.purchaseYear || "-"}
//                   </div>
//                 </div>

//                 <div className="p-2 rounded-md bg-rose-50/60 ring-1 ring-rose-100/60">
//                   <div className="text-[10px] font-medium text-rose-600/90">Selling Rights</div>
//                   <div className="mt-0 text-[12px] font-semibold text-rose-900">{property?.selling_rights || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Lead Source</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900">{property?.leadSource || "-"}</div>
//                 </div>

//                 <div className="p-2 rounded-md bg-blue-50/60 ring-1 ring-blue-100/60">
//                   <div className="text-[10px] font-medium text-blue-600/90">Status</div>
//                   <div className="mt-0">
//                     {property?.status ? (
//                       <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 ring-1 ring-blue-200 text-[12px] font-semibold">
//                         {property.status}
//                       </span>
//                     ) : (
//                       <span className="text-[12px] font-semibold text-blue-900/80">-</span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                   <div className="text-[10px] font-medium text-slate-500">Publication Date</div>
//                   <div className="mt-0 text-[12px] font-semibold text-slate-900">
//                     {property.created_at
//                       ? new Date(property.created_at).toLocaleDateString("en-GB", {
//                         day: "2-digit",
//                         month: "2-digit",
//                         year: "numeric",
//                       })
//                       : "Not Available"}
//                   </div>

//                 </div>

//                 {/* Nearby + Address in same row */}
//                 <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-1 2xl:col-span-6">
//                   {/* Nearby */}
//                   <div className="flex-1 p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                     <div className="text-[10px] font-medium text-slate-500">Nearby</div>
//                     <div className="mt-0.5 text-[12px] text-slate-800">
//                       {property.nearby_places?.length ? (
//                         <div className="flex flex-wrap gap-1">
//                           {property.nearby_places.map((p: any, i: number) => (
//                             <span
//                               key={i}
//                               className="inline-flex items-center px-1.5 py-0.5 rounded text-slate-700"
//                             >
//                               <li className="flex items-center gap-2" >
//                                 <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
//                                 {p.type || ""} {p.distance ? ` – ${p.distance} ${p.unit || ""}` : ""}  {p.name || ""}
//                               </li>
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-[12px] font-semibold text-slate-800/80">Not Available</span>
//                       )}
//                     </div>
//                   </div>

//                   {/* Address */}
//                   <div className="flex-1 p-2 rounded-md bg-slate-50 ring-1 ring-slate-100">
//                     <div className="text-[10px] font-medium text-slate-500">Address</div>
//                     <div className="mt-0.5 text-[12px] text-slate-800 whitespace-pre-line">
//                       {property?.address || "Not Available"}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div className="p-2 rounded-md bg-slate-50 ring-1 ring-slate-100 sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-6">
//                   <div className="text-[10px] font-medium text-slate-500">Description</div>
//                   <div className="mt-0.5 text-[12px] text-slate-800 whitespace-pre-line">
//                     {property?.description || "Not Available"}
//                   </div>
//                 </div>
//               </div>
//             </div>


//           </div>

//           {/* RIGHT: Seller card */}
//           <div className="w-full xl:w-80 2xl:w-96 shrink-0 flex flex-col gap-4 xl:sticky xl:top-0 xl:h-fit xl:max-h-screen xl:overflow-y-auto">
//             {/* Seller */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4">
//               <h3 className="font-semibold text-gray-900 mb-3">Seller Information
//               </h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex items-center gap-2">
//                   <User className="text-gray-400" size={16} />
//                   <span className="font-medium">{property.seller?.name || "Not Available"}</span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Phone className="text-gray-400" size={16} />
//                   {property.seller?.phone ? (
//                     <>
//                       <span className="truncate">{property.seller.phone}</span>
//                       <button
//                         onClick={() => window.open(`tel:${property.seller.phone}`)}
//                         className="ml-auto p-1 text-blue-600 hover:bg-blue-100 rounded"
//                         aria-label="Call seller"
//                       >

//                       </button>
//                     </>
//                   ) : (
//                     <span className="text-gray-500">Not Available</span>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Mail className="text-gray-400" size={16} />
//                   {property.seller?.email ? (
//                     <span className="truncate">{property.seller.email}</span>
//                   ) : (
//                     <span className="text-gray-500">Not Available</span>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <MapPin className="text-gray-400" size={16} />
//                   <span className="truncate">
//                     {property?.location && property?.city ? `${property.location}, ${property.city}` : "Not Available"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white rounded-xl border border-gray-200 p-4">
//               <h3 className="font-semibold text-gray-900 mb-3">Executive Information</h3>
//               <div className="space-y-3 text-sm">
//                 <div className="flex items-center gap-2">
//                   <User className="text-gray-400" size={16} />
//                   <span className="font-medium">{property.assignedTo?.name || "Not Available"}</span>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Phone className="text-gray-400" size={16} />
//                   {property.assignedTo?.phone ? (
//                     <>
//                       <span className="truncate">{property.assignedTo.phone}</span>
//                       <button
//                         onClick={() => window.open(`tel:${property.assignedTo.phone}`)}
//                         className="ml-auto p-1 text-blue-600 hover:bg-blue-100 rounded"
//                         aria-label="Call seller"
//                       >

//                       </button>
//                     </>
//                   ) : (
//                     <span className="text-gray-500">Not Available</span>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Mail className="text-gray-400" size={16} />
//                   {property.assignedTo?.email ? (
//                     <span className="truncate">{property.assignedTo.email}</span>
//                   ) : (
//                     <span className="text-gray-500">Not Available</span>
//                   )}
//                 </div>


//               </div>
//             </div>

//             {/* Actions */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
//               <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 {/* Share */}
//                 <button
//                   onClick={() => setOpen(true)}
//                   className="flex items-center gap-2 px-3 py-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition">
//                   <Share2 size={16} />
//                   Share
//                 </button>

//                 {/* Message */}
//                 <button className="flex items-center gap-2 px-3 py-2 border border-green-200 rounded-lg text-green-600 hover:bg-green-50 transition">
//                   <MessageCircle size={16} />
//                   Message
//                 </button>

//                 {/* Schedule */}
//                 <button className="flex items-center gap-2 px-3 py-2 border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-50 transition">
//                   <Calendar size={16} />
//                   Schedule
//                 </button>

//                 {/* Mark Hot */}
//                 <button className="flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition">
//                   <Flame size={16} />
//                   Mark Hot
//                 </button>
//               </div>
//             </div>


//             {/* Key Dates */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4">
//               <h3 className="font-semibold text-gray-900 mb-3">Key Dates</h3>
//               <div className="space-y-2 text-sm text-gray-700">
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-500">Purchase</span>
//                   <span className="font-medium">
//                     {getMonthName(property?.purchaseMonth)} {property?.purchaseYear || "-"}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-gray-500">Possession</span>
//                   <span className="font-medium">
//                     {getMonthName(property?.possessionMonth)} {property?.possessionYear || "-"}
//                   </span>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>

//       {/* Amenities & Furnishing */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//         {/* Amenities */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4">
//           <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
//             {(() => {
//               const amenities: string[] = Array.isArray(property.amenities)
//                 ? property.amenities
//                 : (property.amenities ?? "")
//                   .split(",")
//                   .map((s: string) => s.trim())
//                   .filter(Boolean);

//               return amenities.length ? (
//                 amenities.map((name, i) => <AmenityPill key={i} name={name} />)
//               ) : (
//                 <span className="text-sm text-gray-500">No amenities listed</span>
//               );
//             })()}
//           </div>
//         </div>

//         {/* Furnishing Items */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4">
//           <h3 className="font-semibold text-gray-900 mb-3">Furnishing Items</h3>
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-3 gap-2">
//             {property.furnishingItems?.length ? (
//               property.furnishingItems.map((item: string, index: number) => (
//                 <FurnishingPill key={index} name={item} />
//               ))
//             ) : (
//               <span className="text-sm text-gray-500">No furnishing items listed</span>
//             )}
//           </div>
//         </div>
//       </div>
//       {open && (
//         (() => {
//           const displayType = property?.type ?? '';
//           const titleParts = [displayType, property?.unitType ?? '', property?.subtype ?? '']
//             .map(s => (s || '').toString().trim())
//             .filter(Boolean);
//           const shareTitle = titleParts.length ? titleParts.join(' ') : (property?.title || 'Property Listing');

//           const shareDescription =
//             property?.description && property.description !== ''
//               ? property.description
//               : (property?.raw?.description ?? property?.raw?.short_description ?? '');

//           const shareImage =
//             (Array.isArray(property?.images) && property.images[0]) ||
//             (Array.isArray(property?.photos) && property.photos[0]) ||
//             property?.raw?.image ||
//             property?.raw?.photo ||
//             '';

//           // ❌ pehle yeh current URL tha:
//           // const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

//           // ✅ ab canonical public URL:
//           const shareUrl = buildPublicPropertyUrl(property);

//           return (
//             <ShareModal
//               // agar tumhare ShareModal me `forcedCopyUrl` prop hai to usko bhi pass karo:
//               // forcedCopyUrl={shareUrl}
//               url={shareUrl}
//               title={shareTitle}
//               description={shareDescription}
//               image={shareImage}
//               propertyId={property.id}
//               slug={`${property.id}-${toSlug(property.slug || shareTitle)}`}
//               onClose={() => setOpen(false)}
//             />
//           );
//         })()
//       )}

//     </div>
//   );
// };

// export default PropertyViewPage;

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
  ArrowRight
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

// Overview Tab Component - ALL FIELDS PRESERVED
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

  function setShowMediaModal(arg0: boolean): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col xl:flex-row gap-3">
        {/* Left Column */}
        <div className="flex-1 space-y-3 min-w-0">
        
<div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: BD }}>
  <div className="relative">
    <Swiper
      modules={[Navigation]}
      onBeforeInit={(swiper:any) => {
        swiper.params.navigation.prevEl = prevRef.current;
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
            <ImageZoom
              src={photo}
              alt={`${property.title || 'Property'} - ${index + 1}`}
              className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]"
              imgClassName="rounded-lg"
            />
            <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end z-20">
              <PropertyTags tags={property.tags || []} />
              {(property.aiScore ?? 0) >= 90 && (
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white flex items-center gap-0.5 shadow-sm" style={{ background: N }}>
                  <Bot size={10} /> AI {Math.round(property.aiScore ?? 0)}
                </span>
              )}
            </div>
          </div>
        </SwiperSlide>
      ))}
      <button
        ref={prevRef}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition"
        type="button"
      >
        ‹
      </button>
      <button
        ref={nextRef}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition"
        type="button"
      >
        ›
      </button>
    </Swiper>

    {/* Top Left Badges */}
    <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-20">
      {property.isPublic ? (
        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-50 text-green-700 ring-1 ring-green-200">PUBLIC</span>
      ) : (
        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200">PRIVATE</span>
      )}
      {property.hotLeads > 2 && (
        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: O }}>HOT</span>
      )}
      {property.verified && (
        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center gap-0.5" style={{ background: '#3b82f6' }}>
          <Shield size={9} /> VERIFIED
        </span>
      )}
    </div>

    {/* Camera Button - BOTTOM RIGHT CORNER - FIXED WITH INLINE STYLE */}
    <div className="absolute z-20" style={{ bottom: '12px', right: '12px' }}>
      <button 
        className="p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/70 transition backdrop-blur-sm"
        onClick={() => setShowMediaModal?.(true)}
      >
        <Camera size={14} />
      </button>
    </div>
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
          <div className="bg-white rounded-lg border p-2.5" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Seller Information</h3>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5"><User size={11} style={{ color: MU }} /><span className="font-medium" style={{ color: N }}>{property.seller?.name || "-"}</span></div>
              <div className="flex items-center gap-1.5"><Phone size={11} style={{ color: MU }} /><span style={{ color: MU }}>{property.seller?.phone || "Not Available"}</span></div>
              <div className="flex items-center gap-1.5"><Mail size={11} style={{ color: MU }} /><span style={{ color: MU }}>{property.seller?.email || "Not Available"}</span></div>
              <div className="flex items-center gap-1.5"><MapPin size={11} style={{ color: MU }} /><span style={{ color: MU }}>{property?.location && property?.city ? `${property.location}, ${property.city}` : "-"}</span></div>
            </div>
          </div>

          {/* Executive Card */}
          <div className="bg-white rounded-lg border p-2.5" style={{ borderColor: BD }}>
            <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Executive Information</h3>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5"><User size={11} style={{ color: MU }} /><span className="font-medium" style={{ color: N }}>{property.assignedTo?.name || "-"}</span></div>
              <div className="flex items-center gap-1.5"><Phone size={11} style={{ color: MU }} /><span style={{ color: MU }}>{property.assignedTo?.phone || "Not Available"}</span></div>
              <div className="flex items-center gap-1.5"><Mail size={11} style={{ color: MU }} /><span style={{ color: MU }}>{property.assignedTo?.email || "Not Available"}</span></div>
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
    </div>
  );
};

export default PropertyViewPage;