
import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, Plus, Search, Filter, Eye, Edit, Trash2, Download, Upload,
  Grid, List, MapPin, Building, Users, MoreHorizontal, X,
  ChevronLeft, ChevronRight, Globe, Award, CheckCircle, User,
} from 'lucide-react';

import PropertyViewPage from '../../components/properties/PropertyViewPage';
import BuyerMatchingModal from '../../components/properties/BuyerMatchingModal';
import BuyerListModal from '../../components/properties/BuyerListModal';
import ImportPropertiesModal from '../../components/properties/ImportPropertiesModal';
import { propertiesAPI } from '../../lib/propertiesAPI';
import { toast } from 'react-toastify';
import PropertyFormModal from './components/PropertyFormModal';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';

import { getImageUrl, FILE_BASE, API_GLOBAL_BASE } from "@/lib/helpers";

import PropertyFilterModal from './PropertyFilterModal';

/* ---------------------- Types ---------------------- */
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
/* ---------------------- Utils ---------------------- */

const dash = (v: any) => (v === null || v === undefined || v === '' ? ' - ' : v);
const toNum = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/* ---------------------- Price Range Helper ---------------------- */
function checkPriceRange(price: number, selectedRange: string) {
  if (selectedRange === "all") return true;

  if (selectedRange.includes("-")) {
    const [minRaw, maxRaw] = selectedRange.split("-").map(r => r.trim());

    const parseVal = (raw: string) => {
      if (raw.toLowerCase().includes("cr")) {
        return parseInt(raw.replace(/\D/g, "")) * 10000000;
      }
      if (raw.toLowerCase().includes("l")) {
        return parseInt(raw.replace(/\D/g, "")) * 100000;
      }
      return parseInt(raw.replace(/\D/g, ""));
    };

    const min = parseVal(minRaw);
    const max = parseVal(maxRaw);

    return price >= min && price <= max;
  }

  if (selectedRange.endsWith("+")) {
    const raw = selectedRange.replace("+", "").trim();

    const parseVal = (raw: string) => {
      if (raw.toLowerCase().includes("cr")) {
        return parseInt(raw.replace(/\D/g, "")) * 10000000;
      }
      if (raw.toLowerCase().includes("l")) {
        return parseInt(raw.replace(/\D/g, "")) * 100000;
      }
      return parseInt(raw.replace(/\D/g, ""));
    };

    const min = parseVal(raw);
    return price >= min;
  }

  return true;
}

/* ---------------------- Dynamic Tags System ---------------------- */

const getPropertyTags = (property: UIProperty) => {
  const tags: Array<{ label: string; emoji: string; color?: string; textColor?: string; priority: number }> = [];
  const now = new Date();

  const createdDate = property.created_at ? new Date(property.created_at) : null;
  const daysSinceCreated = createdDate ? Math.floor((+now - +createdDate) / (1000 * 60 * 60 * 24)) : null;

  const updatedDate = property.updated_at ? new Date(property.updated_at) : null;
  const daysSinceUpdated = updatedDate ? Math.floor((+now - +updatedDate) / (1000 * 60 * 60 * 24)) : null;

  if (daysSinceCreated !== null && daysSinceCreated <= 7) {
    tags.push({ label: 'New Listing', emoji: '', priority: 9 });
  }

  if ((Number(property.hotLeads) || 0) > 3 || (Number(property.visits) || 0) > 120) {
    tags.push({ label: 'Hot Deal', emoji: '🔥', priority: 10 });
  }

  if (property.ownershipDocUrl || property.ownershipDocName) {
    tags.push({ label: 'Verified', emoji: '✅', priority: 7 });
  }

  if (property.selling_rights === 'Urgent' || property.stage === 'deal_closure') {
    tags.push({ label: 'Urgent Sale', emoji: '⏳', priority: 8 });
  }

  if (property.selling_rights === 'Exclusive') {
    tags.push({ label: 'Exclusive', emoji: '🔒', priority: 6 });
  }

  if (property.leadSource === 'Direct Owner' || property.leadSource === 'Owner') {
    tags.push({ label: 'Direct Owner', emoji: '👤', priority: 5 });
  }

  if (property.isPublic && (Number(property.publicViews) || 0) > 300) {
    tags.push({ label: 'Featured', emoji: '📢', priority: 4 });
  }

  if (daysSinceUpdated !== null && daysSinceUpdated <= 2 && (daysSinceCreated === null || daysSinceCreated > 7)) {
    tags.push({ label: 'Recently Updated', emoji: '🕒', priority: 3 });
  }

  const budget = Number(property.budget) || 0;
  if (budget > 0 && budget < 5_000_000) {
    tags.push({ label: 'Best Price', emoji: '🏷️', priority: 2 });
  }

  if (budget > 20_000_000) {
    tags.push({ label: 'Premium', emoji: '💎', priority: 1 });
  }

  return tags
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
};

const TAG_TONES: Record<string, { bg: string; text: string; ring: string }> = {
  "New Listing": { bg: "bg-gradient-to-r from-green-500/90 to-emerald-600/90", text: "text-white", ring: "ring-green-300/40" },
  "Hot Deal": { bg: "bg-rose-600/80", text: "text-white", ring: "ring-white/20" },
  "Verified": { bg: "bg-white", text: "text-green-600", ring: "ring-white/20" },
  "Urgent Sale": { bg: "bg-amber-600/80", text: "text-white", ring: "ring-white/20" },
  "Exclusive": { bg: "bg-purple-600/80", text: "text-white", ring: "ring-white/20" },
  "Direct Owner": { bg: "bg-teal-600/80", text: "text-white", ring: "ring-white/20" },
  "Featured": { bg: "bg-fuchsia-600/80", text: "text-white", ring: "ring-white/20" },
  "Recently Updated": { bg: "bg-cyan-600/80", text: "text-white", ring: "ring-white/20" },
  "Best Price": { bg: "bg-yellow-600/80", text: "text-white", ring: "ring-white/20" },
  "Premium": { bg: "bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600", text: "text-white font-semibold", ring: "ring-amber-200/50" }
};

const PropertyTags = ({ property, className = "" }: { property: UIProperty; className?: string }) => {
  const tags = getPropertyTags(property);
  if (!tags.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag, i) => {
        const tone = TAG_TONES[tag.label] || { bg: "bg-gray-50", text: "text-gray-700", ring: "ring-gray-200" };
        return (
          <span
            key={`${tag.label}-${i}`}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring} shadow-sm`}
          >
            <span className="leading-none">{tag.emoji}</span>
            <span className="leading-none">{tag.label}</span>
          </span>
        );
      })}
    </div>
  );
};

const getUniquePropertyTags = (properties: UIProperty[]) => {
  const allTags = new Set<string>();
  properties.forEach(property => {
    getPropertyTags(property).forEach(tag => {
      allTags.add(tag.label);
    });
  });
  return Array.from(allTags);
};

/* ---------------------- IMAGE URL HELPERS + DEBUG ---------------------- */

const ImageWithDebug: React.FC<{
  srcCandidate?: string;
  alt?: string;
  className?: string;
  fitCover?: boolean;
  propertyCtx?: any;
}> = ({ srcCandidate, alt = 'image', className = '', fitCover = true, propertyCtx }) => {
  const [failed, setFailed] = useState(false);
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    const url = getImageUrl(srcCandidate || '');
    setResolved(url);
    setFailed(false);
  }, [srcCandidate]);

  if (!resolved || failed) {
    return (
      <div
        className={`bg-gray-200 text-gray-500 flex items-center justify-center ${className}`}
        style={{ objectFit: fitCover ? 'cover' : undefined }}
      >
        <span className="text-xs">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      style={{ objectFit: fitCover ? 'cover' : undefined }}
      onLoad={() => {
        if (import.meta.env?.MODE !== 'production') {
          // console.log('[IMG OK]', {
          //   title: propertyCtx?.title,
          //   propertyId: propertyCtx?.propertyId,
          //   original: srcCandidate,
          //   resolved,
          //   fileBase: FILE_BASE
          // });
        }
      }}
      onError={() => {
        setFailed(true);
        console.error('[IMG ERROR]', {
          title: propertyCtx?.title,
          propertyId: propertyCtx?.propertyId,
          original: srcCandidate,
          resolved,
          reason: 'Failed to load image. Open the resolved URL directly; ensure server mounts /uploads.',
        });
      }}
    />
  );
};

/* ---------------------- API helpers ---------------------- */

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function withTimeout<T>(p: Promise<T>, ms = 12000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Request timed out')), ms);
    p.then(v => { clearTimeout(t); resolve(v); })
      .catch(e => { clearTimeout(t); reject(e); });
  });
}

function coerceStringArray(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string') {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (typeof raw === 'object') {
    return Object.entries(raw).filter(([, v]) => Boolean(v)).map(([k]) => String(k));
  }
  return [];
}

/* ---------------------- FurnishingItems Normalizer ---------------------- */

function normalizeFurnishingItems(r: any): string[] {
  const furnishingItemsRaw =
    r?.furnishingItems ?? r?.furnishing_items ?? r?.furnished_items ?? r?.furnishing_details ?? r?.furnishing_list ?? r?.furnishingItem ?? r?.furnishing_item ?? (typeof r?.furnishing === 'string' && r.furnishing.includes(',') ? r.furnishing : undefined);

  const items = Array.from(
    new Set(
      coerceStringArray(furnishingItemsRaw)
        .map((s) =>
          String(s)
            .replace(/[_\-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .filter(Boolean)
    )
  );

  // if (import.meta.env?.MODE !== 'production') {
  //   console.groupCollapsed('[FURNISH NORMALIZE]');
  //   console.log('incoming', furnishingItemsRaw);
  //   console.log('normalized', items);
  //   console.groupEnd();
  // }

  return items;
}

/* ---------------------- Normalizer: API -> UI ---------------------- */

function normalizeProperty(r: any, idx: number): UIProperty {
  const serverPhotoUrls: string[] = Array.isArray(r?.photoUrls) ? r.photoUrls : [];

  const rawPhotos: string[] =
    serverPhotoUrls.length
      ? serverPhotoUrls
      : Array.isArray(r?.photos) && r.photos.length
        ? r.photos
        : coerceStringArray(r?.photos);

  const normalizedPhotos = rawPhotos
    .map((ph) => serverPhotoUrls.length ? ph : (getImageUrl(ph) || ''))
    .filter(Boolean);

  const furnishingItems = normalizeFurnishingItems(r);

  // if (import.meta.env?.MODE !== 'production') {
  //   console.groupCollapsed('[NORMALIZE PROPERTY]', r?.id ?? idx + 1);
  //   console.log({
  //     id: r?.id ?? idx + 1,
  //     propertyId: r?.property_id,
  //     incomingPhotos: r?.photos,
  //     ownershipDocPath: r?.ownership_doc_path,
  //     ownershipDocName: r?.ownership_doc_name,
  //     ownershipDocId: r?.ownership_doc_id,
  //     ownershipDocUrl: r?.ownershipDocUrl,
  //     ownershipDocument: r?.ownership_document,
  //     incomingPhotoUrls: r?.photoUrls,
  //     normalizedPhotos,
  //     incomingFurnishingItems:
  //       r?.furnishingItems ?? r?.furnishing_items ?? r?.furnished_items ?? r?.furnishing_details ?? r?.furnishing_list ?? r?.furnishingItem ?? r?.furnishing_item ?? r?.furnishing,
  //     normalizedFurnishingItems: furnishingItems,
  //     note: 'Photo paths normalized to absolute URLs; furnishingItems coerced; ownership doc mapped.',
  //   });
  //   console.groupEnd();
  // }

  return {
    id: r.id ?? idx + 1,
    propertyId: r.property_id || `PROP${String(r.id ?? idx + 1).padStart(3, '0')}`,
    title: r.title || `${dash(r.unit_type)} ${dash(r.property_type_name || r.property_type || r.property_subtype_name)}`,
    type: r.property_type_name || r.property_type || ' - ',
    subtype: r.property_subtype_name || r.property_subtype || ' - ',
    unitType: r.unit_type || ' - ',
    wing: r.wing_name || r.wing || ' - ',
    unitNo: r.unit_no || r.unit || ' - ',
    furnishing: r.furnishing || r.furnishing_status || ' - ',
    furnishingItems,
    parkingType: r.parking_type || ' - ',
    parkingQty: r.parking_qty ?? ' - ',
    city: r.city_name || r.city || ' - ',
    location: r.location_name || r.location || ' - ',
    society: r.society_name || r.society || ' - ',
    floor: r.floor ?? ' - ',
    totalFloors: r.total_floors ?? ' - ',
    carpetArea: r.carpet_area ?? ' - ',
    builtupArea: r.builtup_area ?? ' - ',
    status: r.status || ' - ',
    leadSource: r.lead_source || ' - ',
    purchaseMonth: r.purchase_month ?? ' - ',
    purchaseYear: r.purchase_year ?? ' - ',
    possessionMonth: r.possession_month ?? ' - ',
    possessionYear: r.possession_year ?? ' - ',
    budget: r.budget ?? ' - ',
    address: r.address || ' - ',
    description: r.description || ' - ',
    selling_rights: r.selling_rights || " - ",
    photos: normalizedPhotos,


    // ...existing seeds
    bedrooms: r.bedrooms || '-',
    bathrooms: r.bathrooms || '-',
    facing: r.facing || '',

    priceType: (r.priceType as 'Fixed' | 'Negotiable') || 'Fixed',
    finalPrice: r.finalPrice || '-',

    seller: {
      id: r.seller_id,
      name: r.seller_name || ' - ',
      phone: r.seller_phone,
      email: r.seller_email,
      leadSource: r.lead_source,
    },
    stage: r.stage || 'initial_contact',
    stageProgress: toNum(r.stage_progress ?? 0),
    visits: toNum(r.visits ?? 0),
    totalVisits: toNum(r.total_visits ?? 0),
    lastVisit: r.last_visit || ' - ',
    interestedBuyers: toNum(r.interested_buyers ?? 0),
    hotLeads: toNum(r.hot_leads ?? 0),
    created_at: r.created_at,
    updated_at: r.updated_at,
    isPublic: Boolean(r.is_public ?? false),
    publicViews: toNum(r.public_views ?? 0),
    publicInquiries: toNum(r.public_inquiries ?? 0),
    amenities: r.amenities ?? [],
    nearby_places: (r.nearby_places || []).map((n: any) => (typeof n === 'string' ? { name: n } : n)),

    ownershipDocUrl: r.ownership_doc_path || r.ownershipDocUrl || r.ownership_document || '',
    ownershipDocName: r.ownership_doc_name || r.ownershipDocName || r.ownership_document_name || '',
    ownershipDocId: r.ownership_doc_id || r.ownershipDocId || r.ownership_document_id || '',
  };
}

/* ---------------------- Edit Initial Data Builder ---------------------- */
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
    bedrooms: p.bathrooms || '',
    bathrooms: p.bathrooms || '',

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
    leadSource: p.leadSource || '',
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
/* ---------------------- Tailwind Color Helpers (no dynamic classes) ---------------------- */

const TAB_STYLES: Record<string, { badge: string; btn: string; btnActive: string; countActive: string }> = {
  blue: { badge: 'bg-blue-200', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-blue-100 text-blue-700 border border-blue-200', countActive: 'bg-blue-200' },
  green: { badge: 'bg-green-200', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-green-100 text-green-700 border border-green-200', countActive: 'bg-green-200' },
  purple: { badge: 'bg-purple-200', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-purple-100 text-purple-700 border border-purple-200', countActive: 'bg-purple-200' },
  orange: { badge: 'bg-orange-200', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-orange-100 text-orange-700 border border-orange-200', countActive: 'bg-orange-200' },
  indigo: { badge: 'bg-indigo-200', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-indigo-100 text-indigo-700 border border-indigo-200', countActive: 'bg-indigo-200' },
  red: { badge: 'bg-red-200', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-red-100 text-red-700 border border-red-200', countActive: 'bg-red-200' },
};

function tabBtnClass(active: boolean, color: string) {
  const s = TAB_STYLES[color] || TAB_STYLES.blue;
  return `flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-xs ${active ? s.btnActive : s.btn}`;
}
function tabCountClass(active: boolean, color: string) {
  const s = TAB_STYLES[color] || TAB_STYLES.blue;
  return `px-2 py-0.5 rounded-full text-[10px] ${active ? s.countActive : 'bg-gray-200 text-gray-700'}`;
}

/* ---------------------- Component ---------------------- */

const PropertiesPage = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('listTab') || localStorage.getItem('prop_list_tab') || 'all';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<(number | string)[]>([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [currentPropertyView, setCurrentPropertyView] = useState<UIProperty | null>(null);
  const [showBuyerMatching, setShowBuyerMatching] = useState(false);
  const [showBuyerList, setShowBuyerList] = useState(false);
  const [showImportProperties, setShowImportProperties] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingProperty, setEditingProperty] = useState<UIProperty | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<UIProperty | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [bulkLoading, setBulkLoading] = useState(false);

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  useEffect(() => {
    if (!activeTab) return;
    localStorage.setItem('prop_list_tab', activeTab);
    const url = new URL(window.location.href);
    url.searchParams.set('listTab', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);



  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
        setMasters(data);

      } catch (err) {
        console.error('Error fetching master options:', err);
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);


  const initialFilters = {
    dateFrom: '',
    dateTo: '',
    ignoreDate: false,
    type: 'all',
    status: 'all',
    priceRange: 'all',
    location: 'all',
    seller: 'all',
    stage: 'all',
    tags: 'all',
    minBudget: '',
    maxBudget: '',
    sortOrder: 'created_desc',
  };
  const [filters, setFilters] = useState(initialFilters);
  const clearFilters = () => {
    setFilters(initialFilters);
  };
  const [properties, setProperties] = useState<UIProperty[]>([]);

  const fetchPropertiesOnce = async () => {
    if (typeof (propertiesAPI as any)?.getProperties !== 'function') {
      throw new Error('propertiesAPI.getProperties is not a function (check import/path).');
    }
    if (import.meta.env?.MODE !== 'production') {
      // console.log('[FETCH] calling propertiesAPI.getProperties()…');
    }
    const raw = await withTimeout(propertiesAPI.getProperties(), 12000);
    const list = Array.isArray(raw) ? raw : raw?.data || [];
    if (import.meta.env?.MODE !== 'production') {
      // console.log('[FETCH OK] raw count:', list.length);
    }
    const mapped = list.map((r: any, idx: number) => normalizeProperty(r, idx));
    if (import.meta.env?.MODE !== 'production') {
      // console.log('[FETCH MAP] normalized count:', mapped.length);
    }
    return mapped;
  };

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    setIsOffline(false);
    try {
      let data: UIProperty[] | null = null;
      let lastErr: any = null;
      for (let attempt = 0; attempt < 3 && !data; attempt++) {
        try {
          if (import.meta.env?.MODE !== 'production') {
            // console.log(`[LOAD] attempt ${attempt + 1}/3`);
          }
          data = await fetchPropertiesOnce();
        }
        catch (e: any) {
          lastErr = e;
          if (import.meta.env?.MODE !== 'production') {
            // console.warn(`[LOAD] attempt ${attempt + 1} failed:`, e?.message || e);
          }
          if (attempt < 2) await sleep(600 * (attempt + 1));
        }
      }
      if (!data) throw lastErr ?? new Error('Unknown fetch error');
      setProperties(data);
      if (import.meta.env?.MODE !== 'production') {
        // console.log('[LOAD DONE] properties:', data.length);
      }
    } catch (e: any) {
      console.error('Error fetching properties:', e);
      const msg = e?.message || 'Failed to load properties.';
      setError(msg);
      setProperties([]);
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('timeout')) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
    const backOnline = () => navigator.onLine && loadProperties();
    window.addEventListener('online', backOnline);
    return () => window.removeEventListener('online', backOnline);
  }, []);
  useEffect(() => {
    if (!currentPropertyView) return;
    const fresh = properties.find(pp =>
      String(pp.id) === String(currentPropertyView.id)
    );
    if (fresh && fresh.updated_at !== currentPropertyView.updated_at) {
      setCurrentPropertyView(fresh);
    }
  }, [properties]); // deps: properties

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All Properties', count: properties.length, color: 'blue' },
      { id: 'available', label: 'Available', count: properties.filter(p => p.status === 'Available').length, color: 'green' },
      { id: 'sold', label: 'Sold', count: properties.filter(p => p.status === 'Sold').length, color: 'purple' },
      { id: 'negotiation', label: 'Under Negotiation', count: properties.filter(p => p.status === 'Under Negotiation').length, color: 'orange' },
      { id: 'public', label: 'Public Listings', count: properties.filter(p => p.isPublic).length, color: 'indigo' },
      { id: 'hot', label: 'Hot Properties', count: properties.filter(p => (Number(p.hotLeads) || 0) > 2).length, color: 'red' },
    ],
    [properties]
  );

  const filteredProperties = useMemo(() => {
    const out = properties.filter((p) => {
      const matchesSearch =
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.propertyId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.society || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.seller?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'available' && p.status === 'Available') ||
        (activeTab === 'sold' && p.status === 'Sold') ||
        (activeTab === 'negotiation' && p.status === 'Under Negotiation') ||
        (activeTab === 'public' && p.isPublic) ||
        (activeTab === 'hot' && (Number(p.hotLeads) || 0) > 2);

      const matchesFilters =
        (filters.type === 'all' || p.type === filters.type) &&
        (filters.status === 'all' || p.status === filters.status) &&
        (filters.location === 'all' || p.location === filters.location || p.city === filters.location) &&
        (filters.stage === 'all' || p.stage === filters.stage.toLowerCase().replace(/\s+/g, "_")) &&
        (filters.priceRange === 'all' || checkPriceRange(Number(p.budget), filters.priceRange)) &&
        (filters.tags === 'all' || getPropertyTags(p).some(tag => tag.label === filters.tags));

      return matchesSearch && matchesTab && matchesFilters;
    });
    if (import.meta.env?.MODE !== 'production') {
      // console.debug('[FILTERED]', { total: properties.length, filtered: out.length, activeTab, searchTerm, filters });
    }
    return out;
  }, [properties, searchTerm, activeTab, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const handleAddProperty = () => { setEditingProperty(null); setShowPropertyForm(true); };
  const handleEditProperty = (property: UIProperty) => { setEditingProperty(property); setShowPropertyForm(true); };
  const handleViewProperty = (property: UIProperty) => {
    setCurrentPropertyView(property);
    const url = new URL(window.location.href);
    url.searchParams.set('view', String(property.id));
    // (PV ka ?tab alag handle hoga — isse mat छेड़ो)
    window.history.replaceState({}, '', url.toString());
  };

  const handleBackToList = () => {
    setCurrentPropertyView(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('tab'); // PV ka tab param list pe aane par clear
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    if (loading || error) return;
    const sp = new URLSearchParams(window.location.search);
    const viewId = sp.get('view');
    if (viewId && !currentPropertyView) {
      const p = properties.find(pp => String(pp.id) === viewId || String(pp.propertyId) === viewId);
      if (p) setCurrentPropertyView(p);
    }
  }, [loading, error, properties, currentPropertyView]);


  const handleDeleteProperty = async (propertyId: number | string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await propertiesAPI.deleteProperty(propertyId.toString());
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        toast.success("Property deleted successfully!", { position: "top-right", autoClose: 3000 });
      } catch (error) {
        console.error("Failed to delete property:", error);
        toast.error("Error deleting property. Please try again.", { position: "top-right", autoClose: 4000 });
      }
    }
  };

  const handlePropertySelection = (propertyId: number | string) => {
    setSelectedProperties(prev => prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]);
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === paginatedProperties.length) setSelectedProperties([]);
    else setSelectedProperties(paginatedProperties.map(p => p.id));
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedProperties.length === 0) {
      toast.warn("No properties selected");
      return;
    }

    setBulkLoading(true);
    try {
      const response = await propertiesAPI.bulkUpdateStatus({
        propertyIds: selectedProperties,
        status,
        remarks: `Bulk status change to ${status}`,
        updatedBy: 'User'
      });

      if (response.success) {
        setProperties(prev => prev.map(p =>
          selectedProperties.includes(p.id) ? { ...p, status } : p
        ));
        setSelectedProperties([]);
        toast.success(`${response.data.summary.successful} properties updated to ${status}`);

        if (response.data.summary.failed > 0) {
          toast.warn(`${response.data.summary.failed} properties failed to update`);
        }
      } else {
        toast.error("Failed to update properties status");
      }
    } catch (error: any) {
      console.error("Bulk status update failed:", error);
      toast.error(error?.response?.data?.message || "Error updating properties status");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkMakePublic = async () => {
    if (selectedProperties.length === 0) {
      toast.warn("No properties selected");
      return;
    }

    setBulkLoading(true);
    try {
      const response = await propertiesAPI.bulkMarkPublic({
        propertyIds: selectedProperties,
        updatedBy: 'User'
      });

      if (response.success) {
        setProperties(prev => prev.map(p =>
          selectedProperties.includes(p.id) ? { ...p, isPublic: true } : p
        ));
        setSelectedProperties([]);
        toast.success(`${response.data.summary.successful} properties marked as public`);

        if (response.data.summary.failed > 0) {
          toast.warn(`${response.data.summary.failed} properties failed to update`);
        }
      } else {
        toast.error("Failed to mark properties as public");
      }
    } catch (error: any) {
      console.error("Bulk mark public failed:", error);
      toast.error(error?.response?.data?.message || "Error marking properties as public");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkMakePrivate = async () => {
    if (selectedProperties.length === 0) {
      toast.warn("No properties selected");
      return;
    }

    setBulkLoading(true);
    try {
      const response = await propertiesAPI.bulkMarkPrivate({
        propertyIds: selectedProperties,
        updatedBy: 'User'
      });

      if (response.success) {
        setProperties(prev => prev.map(p =>
          selectedProperties.includes(p.id) ? { ...p, isPublic: false } : p
        ));
        setSelectedProperties([]);
        toast.success(`${response.data.summary.successful} properties marked as private`);

        if (response.data.summary.failed > 0) {
          toast.warn(`${response.data.summary.failed} properties failed to update`);
        }
      } else {
        toast.error("Failed to mark properties as private");
      }
    } catch (error: any) {
      console.error("Bulk mark private failed:", error);
      toast.error(error?.response?.data?.message || "Error marking properties as private");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedProperties.length === 0) {
      toast.info("No properties selected to export.");
      return;
    }

    setBulkLoading(true);
    try {
      const response = await propertiesAPI.bulkExport({
        propertyIds: selectedProperties,
        format: 'csv',
        updatedBy: 'User'
      });

      if (response.success) {
        toast.success("Export completed successfully");
      }
    } catch (error: any) {
      console.error("Bulk export failed:", error);
      const selected = properties.filter(p => selectedProperties.includes(p.id));
      const headers = ["ID", "PropertyID", "Title", "Type", "Subtype", "UnitType", "City", "Location", "Society", "Status", "Stage", "Budget", "IsPublic"];
      const rows = selected.map(p => ([
        String(p.id), p.propertyId ?? "", (p.title ?? "").toString().replace(/\n/g, " "),
        p.type ?? "", p.subtype ?? "", p.unitType ?? "", p.city ?? "", p.location ?? "", p.society ?? "",
        p.status ?? "", p.stage ?? "", String(p.budget ?? ""), p.isPublic ? "Yes" : "No",
      ]));
      const escape = (v: string) => { const needsQuotes = /[",\n]/.test(v); const safe = v.replace(/"/g, '""'); return needsQuotes ? `"${safe}"` : safe; };
      const csv = [headers.join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url;
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-'); a.download = `properties_export_${ts}.csv`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast.success("Exported selected properties as CSV");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) {
      toast.warn("No properties selected");
      return;
    }

    const ok = window.confirm(`Delete ${selectedProperties.length} selected propert${selectedProperties.length > 1 ? 'ies' : 'y'}? This cannot be undone.`);
    if (!ok) return;

    setBulkLoading(true);
    try {
      const response = await propertiesAPI.bulkDelete({
        propertyIds: selectedProperties,
        updatedBy: 'User'
      });

      if (response.success) {
        setProperties(prev => prev.filter(p => !selectedProperties.includes(p.id)));
        setSelectedProperties([]);
        toast.success(`${response.data.summary.successful} properties deleted`);

        if (response.data.summary.failed > 0) {
          toast.warn(`${response.data.summary.failed} properties failed to delete`);
        }
      } else {
        toast.error("Failed to delete properties");
      }
    } catch (error: any) {
      console.error("Bulk delete failed:", error);
      toast.error(error?.response?.data?.message || "Error deleting properties");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleTogglePublic = async (propertyId: number | string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    try {
      const response = await propertiesAPI.setVisibility(
        propertyId.toString(),
        !property.isPublic,
        'User'
      );

      if (response.success) {
        setProperties(prev => prev.map(p =>
          p.id === propertyId ? { ...p, isPublic: response.data.isPublic } : p
        ));
        toast.success(`Property marked as ${response.data.isPublic ? 'public' : 'private'}`);
      } else {
        toast.error("Failed to update property visibility");
      }
    } catch (error: any) {
      console.error("Toggle public failed:", error);
      toast.error("Error updating property visibility");
    }
  };

  const handleBuyerMatching = (property: UIProperty) => {
    setSelectedProperty(property);
    setShowBuyerMatching(true);
  };

  const handleViewBuyers = (property: UIProperty) => {
    setSelectedProperty(property);
    setShowBuyerList(true);
  };

  const formatCurrency = (amount: number | string) => {
    const n = Number(amount);
    if (Number.isFinite(n)) {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      return `₹${n.toLocaleString('en-IN')}`;
    }
    return ' - ';
  };

  if (currentPropertyView) {
    return (
      <PropertyViewPage
        property={currentPropertyView}
        onBack={handleBackToList}
        onEdit={handleEditProperty}
        onBuyerMatching={handleBuyerMatching}
        onViewBuyers={handleViewBuyers}
        // ✅ IMPORTANT: pass this
        onUpdateProperty={(p) => {
          // current view turant update
          setCurrentPropertyView(p);
          // list me bhi same id ko update karo
          setProperties(prev => prev.map(x => x.id === p.id ? { ...x, ...p } : x));
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Home className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Property Management</h1>
              <p className="text-gray-600 text-xs">
                Complete property lifecycle management with buyer matching
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowImportProperties(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all text-xs"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>
            <button
              onClick={handleAddProperty}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all text-xs"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs">Total Properties</p>
                <p className="text-lg font-bold">{properties.length}</p>
              </div>
              <Home size={18} className="text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs">Available</p>
                <p className="text-lg font-bold">
                  {properties.filter((p) => p.status === "Available").length}
                </p>
              </div>
              <CheckCircle size={18} className="text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs">Sold</p>
                <p className="text-lg font-bold">
                  {properties.filter((p) => p.status === "Sold").length}
                </p>
              </div>
              <Award size={18} className="text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs">Public Views</p>
                <p className="text-lg font-bold">
                  {properties.reduce((sum, p) => sum + (Number(p.publicViews) || 0), 0)}
                </p>
              </div>
              <ChevronRight size={18} className="text-orange-200" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={tabBtnClass(activeTab === tab.id, tab.color)}
              >
                <span className="font-medium text-xs">{tab.label}</span>
                <span className={tabCountClass(activeTab === tab.id, tab.color)}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-xs"
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1.5 border border-gray-300 rounded-md text-xs"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              onClick={handleBulkExport}
              disabled={bulkLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-xs disabled:opacity-50"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {selectedProperties.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 mt-2 lg:px-6 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue-700">
                  {selectedProperties.length} selected
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleBulkStatusChange('Available')}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark Available
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Sold')}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark Sold
                  </button>
                  <button
                    onClick={handleBulkMakePublic}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Mark Public
                  </button>
                  <button
                    onClick={handleBulkMakePrivate}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 disabled:opacity-50"
                  >
                    Mark Private
                  </button>
                  <button
                    onClick={handleBulkExport}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
                  >
                    Export
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedProperties([])}
                className="text-blue-600 hover:text-blue-800"
                title="Clear selection"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        { /* Property Filter Sidebar Modal */}
        <PropertyFilterModal
          isOpen={showFilters}
          onClose={() => { setShowFilters(false); setCurrentPage(1); }}
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          typeOptions={(masters?.["property type"] || []).map(m => ({ label: m.label, value: m.value }))}
          statusOptions={(masters?.["property status"] || []).map(m => ({ label: m.label, value: m.value }))}
          priceRangeOptions={(masters?.["price range"] || []).map(m => ({ label: m.label, value: m.value }))}
          locationOptions={(masters?.location || []).map(m => ({ label: m.label, value: m.value }))}
          sellerOptions={(masters?.["sellers"] || masters?.["agents"] || []).map(m => ({ label: m.label, value: m.value }))}
          stageOptions={(masters?.["property stages"] || []).map(m => ({ label: m.label, value: m.value }))}
          tagsOptions={getUniquePropertyTags(properties).map(t => ({ label: t, value: t }))}
        />

      </div>

      {/* Loading / Error / Empty */}
      {loading && (
        <div className="flex-1 grid place-items-center text-gray-600 text-sm">
          Loading properties…
        </div>
      )}

      {!loading && error && (
        <div className="flex-1 grid place-items-center">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
            <div className="font-semibold text-red-700 mb-1">Couldn't load properties</div>
            <div className="text-red-700/90">{error}</div>
            {isOffline && (
              <div className="mt-2 text-red-600">
                Looks like you're offline or the server is unreachable.
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={loadProperties}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && filteredProperties.length === 0 && (
        <div className="flex-1 grid place-items-center text-gray-500 text-sm p-8">
          No properties found. Try changing filters or click "Add Property".
        </div>
      )}

      {/* Properties */}
      {!loading && !error && filteredProperties.length > 0 && (
        <div className="flex-1 overflow-auto">
          {viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all group">
                    <div className="relative overflow-hidden rounded-t-xl">
                      <ImageWithDebug
                        srcCandidate={Array.isArray(property.photos) && property.photos.length > 0 ? property.photos[0] : ''}
                        alt={dash(property.title)}
                        className="w-full h-48 rounded-t-xl transition-transform duration-300 ease-out group-hover:scale-105"
                        propertyCtx={{ title: property.title, propertyId: property.propertyId }}
                      />
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(property.id)}
                          onChange={() => handlePropertySelection(property.id)}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="absolute top-3 right-3 flex max-w-[78%] flex-wrap gap-1 justify-end">
                        <PropertyTags property={property} />
                        {property.isPublic && (
                          <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 ring-1 ring-green-200 shadow-sm">
                            PUBLIC
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        {getStatusBadge(property.status)}
                      </div>
                    </div>

                    {/* ---------- UPDATED GRID CARD CONTENT (replace old p-4 block) ---------- */}
                    <div className="p-4">
                      {/* Title + meta (Type, UnitType, Subtype) */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {/* <h3 className="font-bold text-gray-900 text-lg">{dash(property.title)}</h3> */}
                          <div className=" text-xs font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {(property.type && property.type !== ' - ') && <span className="mr-2">{property.type}</span>}
                            {(property.unitType && property.unitType !== ' - ') && <span className="mr-2"> {property.unitType}</span>}
                            {(property.subtype && property.subtype !== ' - ') && <span className="mr-2"> {property.subtype}</span>}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{dash(property.propertyId)}</div>
                      </div>

                      {/* Price */}
                      <div className="text-xl font-bold text-green-600 mb-2">
                        {formatCurrency(property.budget)}
                      </div>

                      {/* Small specs: UnitType • CarpetArea */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Building size={12} />
                          <span>
                            {property.unitType && property.unitType !== ' - ' ? `${property.unitType}` : 'Unit'}
                            {property.carpetArea ? ` • ${dash(property.carpetArea)} sq ft` : ''}
                          </span>
                        </div>

                        {/* Location, City */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin size={12} />
                          <span>{[property.location, property.city].filter(Boolean).join(', ') || ' - '}</span>
                        </div>

                        {/* Seller */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User size={12} />
                          <span>{dash(property.seller?.name)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        {getStageBadge(property.stage)}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Eye size={10} />
                          <span>{Number(property.visits) || 0} visits</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewProperty(property)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleBuyerMatching(property)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Match Buyers"
                        >
                          <Users size={16} />
                        </button>
                        <div className="relative group">
                          <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="p-1">
                              <button
                                onClick={() => handleEditProperty(property)}
                                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                              >
                                <Edit size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleTogglePublic(property.id)}
                                className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                              >
                                <Globe size={12} />
                                <span>{property.isPublic ? 'Make Private' : 'Make Public'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full text-left"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                    {/* ---------- END UPDATED GRID CARD CONTENT ---------- */}

                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left w-8">
                      <input
                        type="checkbox"
                        checked={selectedProperties.length === paginatedProperties.length && paginatedProperties.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location & Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specifications</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Stage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedProperties.map((p) => (
                    <tr key={p.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProperties.includes(p.id)}
                          onChange={() => handlePropertySelection(p.id)}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* ---------- UPDATED TABLE CELL: Property Details ---------- */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <ImageWithDebug
                            srcCandidate={Array.isArray(p.photos) && p.photos.length > 0 ? p.photos[0] : ''}
                            alt={dash(p.title)}
                            className="w-12 h-12 rounded-lg transition-transform duration-300 ease-out group-hover:scale-110"
                            propertyCtx={{ title: p.title, propertyId: p.propertyId }}
                          />
                          <div>
                            {/* <div className="font-semibold text-gray-900">{dash(p.title)}</div> */}
                            <div className="font-bold text-gray-900 text-lg">
                              {(p.type && p.type !== ' - ') && <span className="mr-2">{p.type}</span>}
                              {(p.unitType && p.unitType !== ' - ') && <span className="mr-2"> {p.unitType}</span>}
                              {(p.subtype && p.subtype !== ' - ') && <span className="mr-2"> {p.subtype}</span>}
                            </div>
                            <div className="text-xs text-gray-500">{dash(p.propertyId)}</div>
                            <div className="text-sm font-bold text-green-600">{formatCurrency(p.budget)}</div>

                          </div>
                        </div>
                      </td>
                      {/* ---------- END UPDATED TABLE CELL: Property Details ---------- */}

                      {/* ---------- UPDATED TABLE CELL: Location & Seller ---------- */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{[p.location, p.city].filter(Boolean).join(', ') || ' - '}</div>
                          <div className="text-xs text-gray-600">{dash(p.society)}</div>
                          <div className="text-xs text-gray-600">Seller: {dash(p.seller?.name)}</div>
                        </div>
                      </td>
                      {/* ---------- END UPDATED TABLE CELL: Location & Seller ---------- */}

                      <td className="px-4 py-3">
                        <div className="space-y-1 text-xs">
                          <div>{dash(p.unitType)} • {dash(p.carpetArea)} sq ft</div>
                          <div>{dash(p.floor)} of {dash(p.totalFloors)}</div>
                          <div>{dash(p.furnishing)}</div>
                          <div>Parking: {dash(p.parkingQty)} {dash(p.parkingType)}</div>
                          <PropertyTags property={p} className="mt-2" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          {getStatusBadge(p.status)}
                          {getStageBadge(p.stage)}
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full"
                              style={{ width: `${Number(p.stageProgress) || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-1">
                            <Eye size={10} className="text-blue-500" />
                            <span>{Number(p.visits) || 0} visits</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users size={10} className="text-green-500" />
                            <span>{Number(p.interestedBuyers) || 0} buyers</span>
                          </div>
                          {p.isPublic && (
                            <div className="flex items-center space-x-1">
                              <Globe size={10} className="text-purple-500" />
                              <span>{Number(p.publicViews) || 0} views</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewProperty(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="View Property"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleBuyerMatching(p)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Match Buyers"
                          >
                            <Users size={14} />
                          </button>
                          <button
                            onClick={() => handleEditProperty(p)}
                            className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <div className="relative group">
                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                              <MoreHorizontal size={14} />
                            </button>
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <div className="p-1">
                                <button
                                  onClick={() => handleTogglePublic(p.id)}
                                  className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                                >
                                  <Globe size={12} />
                                  <span>{p.isPublic ? 'Make Private' : 'Make Public'}</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProperty(p.id)}
                                  className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full text-left"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filteredProperties.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              Showing {filteredProperties.length ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredProperties.length)} of {filteredProperties.length}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 rounded text-xs ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for bulk operations */}
      {bulkLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Processing bulk operation...</span>
          </div>
        </div>
      )}

      {/* One modal only */}
      {showPropertyForm && (
        <PropertyFormModal
          key={editingProperty ? `edit-${editingProperty.id}` : 'create-new'}
          isOpen={showPropertyForm}
          onClose={() => { setShowPropertyForm(false); setEditingProperty(null); }}
          mode={editingProperty ? 'edit' : 'create'}
          propertyId={editingProperty?.id}
          initialData={editingProperty ? buildInitialData(editingProperty) : null}
          onSubmit={async () => {
            await loadProperties();   // ✅ API se fresh reload
            toast.success(editingProperty ? 'Property updated successfully' : 'Property created successfully');
          }}
        />
      )}

      {showBuyerMatching && selectedProperty && (
        <BuyerMatchingModal
          isOpen={showBuyerMatching}
          onClose={() => {
            setShowBuyerMatching(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
        />
      )}

      {showBuyerList && selectedProperty && (
        <BuyerListModal
          isOpen={showBuyerList}
          onClose={() => {
            setShowBuyerList(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
        />
      )}

      {showImportProperties && (
        <ImportPropertiesModal
          isOpen={showImportProperties}
          onClose={() => setShowImportProperties(false)}
          onImport={(propertiesData) => {
            const normalized = propertiesData.map((r: any, i: number) => normalizeProperty(r, i));
            setProperties(prev => [...prev, ...normalized]);
            setShowImportProperties(false);
          }}
        />
      )}
    </div>
  );
};

/* ---------------------- Badges ---------------------- */

function getStatusBadge(status: string) {
  const cfg: any = {
    'Available': { bg: 'bg-green-100', text: 'text-green-700', label: 'Available', icon: '🟢' },
    'Sold': { bg: 'bg-red-100', text: 'text-red-600', label: 'Sold', icon: '🔴' },
    'Under Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Under Negotiation', icon: '🟡' },
    'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'On Hold', icon: '⚫' },
    'Finalization': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Finalization', icon: '🟣' },
    ' - ': { bg: 'bg-gray-100', text: 'text-gray-700', label: ' - ', icon: '•' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: dash(status), icon: '•' };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function getStageBadge(stage: string) {
  const cfg: any = {
    'initial_contact': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact', icon: '📞' },
    'property_collection': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Property Collection', icon: '🏠' },
    'mandate_signed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Mandate Signed', icon: '✅' },
    'selling_process': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Selling Process', icon: '🔄' },
    'deal_closure': { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Deal Closure', icon: '📋' },
  }[stage] || { bg: 'bg-gray-100', text: 'text-gray-700', label: dash(stage), icon: '•' };
  return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>{cfg.icon} {cfg.label}</span>;
}

export default PropertiesPage;
