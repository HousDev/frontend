import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Plus, Search, Filter, Eye, Edit, Trash2, Download, Upload,
  Grid, List, MapPin, Building, Users, MoreHorizontal, X,
  ChevronLeft, ChevronRight, Globe, Award, CheckCircle, User,
  UserCheck, UserPlus,
  UserX, RefreshCw, Layers, Link2, Phone, Sparkles,
  Mail
} from 'lucide-react';
import type { LucideIcon } from "lucide-react";
import PropertyViewPage from '../../components/properties/PropertyViewPage';
import BuyerMatchingModal from '../../components/properties/BuyerMatchingModal';
import BuyerListModal from '../../components/properties/BuyerListModal';
import ImportPropertiesModal from '../../components/properties/ImportPropertiesModal';
import { propertiesAPI } from '../../lib/propertiesAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import { toast } from 'react-toastify';
import PropertyFormModal from './components/PropertyFormModal';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import Swal from 'sweetalert2';

import { getImageUrl } from "@/lib/helpers";

import PropertyFilterModal from './PropertyFilterModal';
import PropertyBulkBrochureModal from '@/components/properties/PropertyBulkBrochureModal';
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import getTagStyle, { DEFAULT_TAG_STYLE } from "@/lib/tagStyles";
import { usersAPI } from '@/lib/api';
import viewsAPI from '@/lib/viewAPI';

// ---------- NEW: auth + permission imports ----------
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/utils/permission';


const theme = {
  navy: '#0f2b3d',
  orange: '#e67e22',
  bg: '#f8fafc',
  border: '#e2e8f0',
  muted: '#5a7184',
};
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
  facing: string;
  bedrooms: string;
  bathrooms: string;
  balcony: string;
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
  assignedTo?: {
    id?: number | string;
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
    role?: string;
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
  is_new_listing?: boolean | number;
  listing_type?: 'sell' | 'rent';
}

/* ---------------------- Assignment Types ---------------------- */
interface SalesExecutive {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: string;
  is_active?: boolean;
}

/* ---------------------- Utils ---------------------- */
const dash = (v: any) => (v === null || v === undefined || v === '' ? ' - ' : v);
const toNum = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

const getPhotoUrl = (photo: any): string => {
  if (!photo) return '';
  return typeof photo === 'string' ? photo : (photo.url || '');
};

// ✅ Thumbnail ke liye hamesha first ACTUAL IMAGE dhoondo, video ko skip karo
const getFirstDisplayPhotoUrl = (photos: any[]): string => {
  if (!Array.isArray(photos) || photos.length === 0) return '';

  const firstImage = photos.find((p) => {
    if (typeof p === 'string') return true; // legacy string entries = image
    return p?.type !== 'video';
  });
  if (firstImage) return getPhotoUrl(firstImage);

  // Agar sab video hi hain, YouTube thumbnail try karo
  const first = photos[0];
  const firstUrl = getPhotoUrl(first);
  const ytMatch = firstUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;

  return ''; // koi usable image nahi mila
};
const getDisplayName = (u: any): string => {
  const pick = [
    u?.assigned_to_full_name,
    u?.full_name,
    u?.fullName,
    (u?.first_name && u?.last_name)
      ? `${u.first_name} ${u.last_name}`
      : '',
    u?.name,
    u?.username,
    u?.email,
  ].find(v => typeof v === 'string' && v.trim());
  const rawName = (pick || 'Unnamed Executive').trim();
  return rawName.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, '').trim();
};

/* ---------------------- Multi-select Tag Picker ---------------------- */
// const TagPickerRow: React.FC<{
//   label: "Add" | "Remove";
//   knownTags: string[];
//   selectedPropertyIds: (number | string)[];
//   propTags: Record<string, string[]>;
//   onApply: (tags: string[]) => void;
//   isOpen: boolean;
//   onToggle: () => void;
//   onClose: () => void;
// }> = ({ label, knownTags, selectedPropertyIds, propTags, onApply, isOpen, onToggle, onClose }) => {
//   const [selected, setSelected] = useState<string[]>([]);

//   const currentTags = useMemo(() => {
//     const allTags = new Set<string>();
//     selectedPropertyIds.forEach(id => {
//       const tags = propTags[String(id)] || [];
//       tags.forEach(tag => allTags.add(tag));
//     });
//     return Array.from(allTags);
//   }, [selectedPropertyIds, propTags]);

//   const options = useMemo(() => {
//     const base = (knownTags?.length ? knownTags : Object.keys(DEFAULT_TAG_STYLE))
//       .map(t => String(t).trim())
//       .filter(Boolean);
//     const uniq = Array.from(new Map(base.map(t => [t.toLowerCase(), t])).values());
//     return uniq.sort((a, b) => a.localeCompare(b));
//   }, [knownTags]);

//   useEffect(() => {
//     if (label === "Remove" && isOpen) {
//       setSelected(currentTags.filter(tag => options.includes(tag)));
//     } else if (label === "Add" && isOpen) {
//       setSelected([]);
//     }
//   }, [isOpen, label, currentTags, options]);

//   const toggle = (t: string) => {
//     setSelected(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
//   };

//   const selectAll = () => setSelected(options);
//   const clearAll = () => setSelected([]);

//   const apply = () => {
//     if (!selected.length) {
//       toast.warn(`Please select at least one tag to ${label.toLowerCase()}`);
//       return;
//     }
//     onApply(selected);
//     onClose();
//   };

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

// Updated TagPickerRow Component
const TagPickerRow: React.FC<{
  label: "Add" | "Remove";
  knownTags: string[];
  selectedPropertyIds: (number | string)[];
  propTags: Record<string, string[]>;
  onApply: (tags: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}> = ({ label, knownTags, selectedPropertyIds, propTags, onApply, isOpen, onToggle, onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const currentTags = useMemo(() => {
    const allTags = new Set<string>();
    selectedPropertyIds.forEach(id => {
      const tags = propTags[String(id)] || [];
      tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  }, [selectedPropertyIds, propTags]);

  const options = useMemo(() => {
    const base = (knownTags?.length ? knownTags : Object.keys(DEFAULT_TAG_STYLE))
      .map(t => String(t).trim())
      .filter(Boolean);
    const uniq = Array.from(new Map(base.map(t => [t.toLowerCase(), t])).values());
    return uniq.sort((a, b) => a.localeCompare(b));
  }, [knownTags]);

  useEffect(() => {
    if (label === "Remove" && isOpen) {
      setSelected(currentTags.filter(tag => options.includes(tag)));
    } else if (label === "Add" && isOpen) {
      setSelected([]);
    }
  }, [isOpen, label, currentTags, options]);

  const toggle = (t: string) => {
    setSelected(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };

  const selectAll = () => setSelected(options);
  const clearAll = () => setSelected([]);

  const apply = () => {
    if (!selected.length) {
      toast.warn(`Please select at least one tag to ${label.toLowerCase()}`);
      return;
    }
    onApply(selected);
    onClose();
  };

  return (
    <div className="mb-1.5 relative">
      {/* Button */}
      <button
        className="w-full text-left text-[10px] px-2 py-1 rounded-lg font-medium transition-all duration-200 flex items-center justify-between group"
        style={{
          background: `${N}05`,
          border: `1px solid ${BD}`,
          color: N
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        type="button"
      >
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${label === 'Add' ? 'bg-green-500' : 'bg-red-500'}`} />
          {label} tags
        </span>
        {selected.length > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: `${O}15`, color: O }}>
            {selected.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} />

          <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg shadow-xl overflow-hidden animate-fade-in" style={{
            background: 'white',
            border: `1px solid ${BD}`,
            minWidth: '190px',
            width: '100%'
          }}>
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1.5" style={{ background: `${N}05`, borderBottom: `1px solid ${BD}` }}>
              <div className="text-[9px] font-medium" style={{ color: MU }}>
                {options.length} tags
                {label === "Remove" && currentTags.length > 0 && (
                  <span className="ml-1" style={{ color: O }}>
                    ({currentTags.length} applied)
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={selectAll} className="text-[9px] px-1.5 py-0.5 rounded transition-colors hover:bg-gray-100" style={{ color: N }}>All</button>
                <button onClick={clearAll} className="text-[9px] px-1.5 py-0.5 rounded transition-colors hover:bg-gray-100" style={{ color: MU }}>Clear</button>
              </div>
            </div>

            {/* Tags List */}
            <div className="max-h-48 overflow-y-auto p-1.5 space-y-1" style={{ scrollbarWidth: 'thin' }}>
              {options.map(t => {
                const active = selected.includes(t);
                const tone = getTagStyle(t);
                const isCurrentlyApplied = currentTags.includes(t);

                return (
                  <li
                    key={t}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition-all duration-150 ${active ? 'shadow-sm' : ''}`}
                    style={{
                      background: active ? `${O}08` : 'transparent',
                      border: active ? `1px solid ${O}30` : `1px solid transparent`
                    }}
                    onClick={() => toggle(t)}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggle(t)}
                      className="h-3 w-3 rounded focus:ring-1 cursor-pointer"
                      style={{ accentColor: O }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium flex-1 ${tone.bg} ${tone.text} ${tone.ring}`} title={t}>
                      <Emoji emoji={tone.emoji} size={10} />
                      <span className="leading-none capitalize">{t}</span>
                    </div>
                    {label === "Remove" && isCurrentlyApplied && (
                      <span className="text-[8px] font-medium px-1 py-0.5 rounded whitespace-nowrap" style={{ background: `${O}10`, color: O }}>Applied</span>
                    )}
                  </li>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-2 py-1.5 border-t" style={{ borderColor: BD, background: BG }}>
              <div className="text-[9px] font-medium" style={{ color: selected.length > 0 ? O : MU }}>
                {selected.length} tag{selected.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={onClose} className="px-2 py-0.5 text-[9px] rounded transition-colors hover:bg-gray-100" style={{ color: MU }}>Cancel</button>
                <button onClick={apply} disabled={selected.length === 0} className="px-2 py-0.5 text-[9px] font-medium rounded transition-all hover:opacity-80 disabled:opacity-40" style={{ background: O, color: 'white' }}>{label} {selected.length}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ---------------------- Executive Assignment Modal ---------------------- */
const AssignExecutiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  executives: SalesExecutive[];
  selectedProperties: (number | string)[];
  onAssign: (executiveId: number | string, executiveName: string) => Promise<void>;
  isBulk?: boolean;
}> = ({ isOpen, onClose, executives, selectedProperties, onAssign, isBulk = false }) => {
  const [selectedExecutive, setSelectedExecutive] = useState<number | string>('');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedExecutive) {
      toast.warn('Please select an executive');
      return;
    }

    const executive = executives.find(e => String(e.id) === String(selectedExecutive));
    if (!executive) {
      toast.error('Selected executive not found');
      return;
    }

    setAssigning(true);
    try {
      await onAssign(selectedExecutive, executive.name);
      setSelectedExecutive('');
      onClose();
    } catch (error) {
      console.error('Assignment failed:', error);
      toast.error('Failed to assign executive');
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedExecutive('');
      setAssigning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isBulk ? 'Bulk Assign Executive' : 'Assign Executive'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            {isBulk
              ? `Assign ${selectedProperties.length} properties to sales executive`
              : 'Assign this property to sales executive'
            }
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Executive
          </label>

          <select
            value={selectedExecutive}
            onChange={(e) => setSelectedExecutive(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={assigning || executives.length === 0}
          >
            <option value="">Choose an executive...</option>
            {executives.map((executive) => (
              <option key={executive.id} value={executive.id}>
                {executive.name}
              </option>
            ))}
          </select>
          {executives.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              No sales executives available. Please check if executives are properly configured.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            disabled={assigning}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedExecutive || assigning || executives.length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {assigning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Assigning...</span>
              </>
            ) : (
              <>
                <UserCheck size={16} />
                <span>Assign</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------- Price Range Helper ---------------------- */
function checkPriceRange(price: number, selectedRange: string) {
  if (selectedRange === "all" || !selectedRange) return true;
  if (!price || price <= 0) return false;

  if (selectedRange.includes("-")) {
    const [minRaw, maxRaw] = selectedRange.split("-").map(r => r.trim());

    const parsePriceValue = (raw: string): number => {
      if (!raw) return 0;
      const numMatch = raw.match(/(\d+(?:\.\d+)?)/);
      if (!numMatch) return 0;

      const num = parseFloat(numMatch[1]);
      if (raw.toLowerCase().includes("cr")) return num * 10000000;
      if (raw.toLowerCase().includes("l")) return num * 100000;
      return num;
    };

    const min = parsePriceValue(minRaw);
    const max = parsePriceValue(maxRaw);
    return price >= min && price <= max;
  }

  if (selectedRange.endsWith("+")) {
    const raw = selectedRange.replace("+", "").trim();
    const parsePriceValue = (raw: string): number => {
      if (!raw) return 0;
      const numMatch = raw.match(/(\d+(?:\.\d+)?)/);
      if (!numMatch) return 0;

      const num = parseFloat(numMatch[1]);
      if (raw.toLowerCase().includes("cr")) return num * 10000000;
      if (raw.toLowerCase().includes("l")) return num * 100000;
      return num;
    };

    const min = parsePriceValue(raw);
    return price >= min;
  }

  const numMatch = selectedRange.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    return price === num;
  }

  return true;
}

function Emoji({
  emoji,
  size = 12,
  className = "",
}: {
  emoji?: string | LucideIcon;
  size?: number;
  className?: string;
}) {
  if (!emoji) return null;

  if (typeof emoji === "string") {
    return (
      <span
        className={`${className} font-bold uppercase leading-none`}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  const Icon = emoji;
  return <Icon size={size} className={className} aria-hidden="true" />;
}

/* ---------------------- Dynamic Tags System ---------------------- */
const PropertyTags = ({
  tags,
  className = "",
  onClickTag,
}: {
  tags: string[];
  className?: string;
  onClickTag?: (tag: string) => void;
}) => {
  if (!tags?.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((raw, i) => {
        const key = String(raw || "").trim();
        const tone = getTagStyle(key);

        const common =
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 shadow-sm leading-none";

        const TagEl = onClickTag ? "button" as const : "span";

        return (
          <TagEl
            key={`${key}-${i}`}
            title={onClickTag ? `Filter by: ${key}` : key}
            className={`${common} ${tone.bg} ${tone.text} ${tone.ring} ${onClickTag ? "cursor-pointer hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400" : ""
              }`}
            onClick={onClickTag ? () => onClickTag(key) : undefined}
            type={onClickTag ? "button" : undefined}
            aria-label={onClickTag ? `Filter by tag ${key}` : undefined}
          >
            <Emoji emoji={tone.emoji} size={12} className="text-xs mr-1" />
            <span className="leading-none">{key}</span>
          </TagEl>
        );
      })}
    </div>
  );
};

const getUniquePropertyTagsFromCache = (tagMap: Record<string, string[]>) => {
  const set = new Set<string>();
  Object.values(tagMap).forEach(list => (list || []).forEach(t => set.add(t)));
  return Array.from(set);
};

/* ---------------------- IMAGE URL HELPERS ---------------------- */
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
        className={`bg-gradient-to-br from-[#0f2b3d]/5 to-[#0f2b3d]/10 text-slate-500 font-normal flex flex-col items-center justify-center text-center gap-1 ${className}`}
        style={{ objectFit: fitCover ? 'cover' : undefined }}
      >
        <Building size={20} className="text-[#e67e22]/70 transition-transform duration-300 group-hover:scale-110" />
        <span className="text-[8px] tracking-wider font-semibold uppercase opacity-60">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      style={{ objectFit: fitCover ? 'cover' : undefined }}
      onError={() => setFailed(true)}
    />
  );
};

/* ---------------------- API helpers ---------------------- */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

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

  return items;
}

/* ---------------------- Normalizer: API -> UI ---------------------- */
function normalizeProperty(r: any, idx: number): UIProperty {
  // 🔥 FIX: Handle both old (string[]) and new ({url,label,isSociety}[]) formats
  const rawPhotos = r?.photos || r?.photoUrls || [];

  const normalizedPhotos = rawPhotos.map((photo: any) => {
    // If it's a string (old format) → just URL
    if (typeof photo === 'string') {
      return getImageUrl(photo) || '';
    }
    // If it's an object (new format) → keep full object
    return {
      url: getImageUrl(photo.url) || '',
      label: photo.label || '',
      isSociety: !!photo.isSociety,
      type: photo.type === 'video' ? 'video' : 'image', // 🆕 preserve type
    };
  }).filter((p: any) => {
    if (typeof p === 'string') return !!p;
    return !!p.url;
  });

  const furnishingItems = normalizeFurnishingItems(r);

  const normalizedPriceType = ((): 'Fixed' | 'Negotiable' => {
    if (typeof r?.is_negotiable === 'boolean') return r.is_negotiable ? 'Negotiable' : 'Fixed';
    if (typeof r?.negotiable === 'boolean') return r.negotiable ? 'Negotiable' : 'Fixed';

    const raw =
      r?.priceType ??
      r?.price_type ??
      r?.pricing_type ??
      r?.price_status ??
      '';

    if (typeof raw === 'string') {
      if (/negotiable/i.test(raw)) return 'Negotiable';
      if (/fixed/i.test(raw)) return 'Fixed';
    }
    return 'Fixed';
  })();

  const normalizedFinalPrice = (() => {
    const raw =
      r?.finalPrice ??
      r?.final_price ??
      r?.price ??
      null;

    const n = Number(raw);
    return Number.isFinite(n) ? n : '';
  })();

  const normalizedBudget = (() => {
    const raw =
      r?.budget ??
      r?.expected_price ??
      r?.asking_price ??
      null;

    const n = Number(raw);
    return Number.isFinite(n) ? n : ' - ';
  })();

  // Normalizer function ko update karein
  const normalizedAssignedTo = (() => {
    const raw = r?.assignedTo ?? (r?.assigned_to != null ? {
      id: r.assigned_to,
      name: r.assigned_to_name,
      full_name: r.assigned_to_full_name,
      email: r.assigned_to_email, // ✅ Add this
      phone: r.assigned_to_phone, // ✅ Add this
      department: r.assigned_to_department,
      role: r.assigned_to_role
    } : undefined);

    if (!raw) return undefined;
    const id = raw.id ?? raw.userId ?? raw.user_id ?? r?.assigned_to;
    if (id === null || id === undefined || String(id).trim() === '') return undefined;

    return {
      id,
      name: getDisplayName(raw),
      email: raw.email || r?.assigned_to_email || '', // ✅ Ensure email
      phone: raw.phone || r?.assigned_to_phone || '', // ✅ Ensure phone
      department: raw.department || r?.assigned_to_department,
      role: raw.role || r?.assigned_to_role,
    };
  })();
  return {
    id: r.id ?? idx + 1,
    propertyId: r.property_id || `REX${String(r.id ?? idx + 1).padStart(4, '0')}`,
    title: r.title || `${dash(r.unit_type)} ${dash(r.property_type_name || r.property_type || r.property_subtype_name)}`,
    type: r.property_type_name || r.property_type || ' - ',
    subtype: r.property_subtype_name || r.property_subtype || ' - ',
    unitType: r.unit_type || ' - ',
    wing: r.wing_name || r.wing || ' - ',
    unitNo: r.unit_no || r.unit || 0,
    furnishing: r.furnishing || r.furnishing_status || ' - ',
    furnishingItems,
    parkingType: r.parking_type || ' - ',
    parkingQty: r.parking_qty ?? 0,
    city: r.city_name || r.city || ' - ',
    location: r.location_name || r.location || ' - ',
    society: r.society_name || r.society || ' - ',
    floor: r.floor ?? ' - ',
    totalFloors: r.total_floors ?? ' - ',
    carpetArea: r.carpet_area ?? 0,
    builtupArea: r.builtup_area ?? 0,
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
    source_url: r.source_url || '',
    photos: normalizedPhotos,

    bedrooms: r.bedrooms || '',
    bathrooms: r.bathrooms || '',
    balcony: r.balcony || ' ',
    facing: r.facing || ' ',

    priceType: normalizedPriceType,
    finalPrice: normalizedFinalPrice,

    seller: {
      id: r.seller_id,
      name: r.seller_name || ' - ',
      phone: r.seller_phone,
      email: r.seller_email,
      leadSource: r.lead_source,
    },
    assignedTo: normalizedAssignedTo,
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
    is_new_listing: r.is_new_listing === 1 || r.is_new_listing === true,
  };
}

/* ---------------------- Edit Initial Data Builder ---------------------- */
const clean = (v: any) => {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  return (s === '-' || s === ' - ') ? '' : s;
};

const buildInitialData = (p: UIProperty) => {
  return {
    id: p.id,
    seller: clean(p.seller?.name),
    propertyType: clean(p.type),
    propertySubtype: clean(p.subtype),
    unitType: clean(p.unitType),
    wing: clean(p.wing),
    unitNo: clean(p.unitNo),
    furnishing: clean(p.furnishing),
    facing: clean(p.facing),
    bedrooms: clean(p.bedrooms),
    bathrooms: clean(p.bathrooms),
    balcony: clean(p.balcony),
    priceType: (p.priceType as 'Fixed' | 'Negotiable') || 'Fixed',
    finalPrice: clean(p.finalPrice),
    parkingType: clean(p.parkingType),
    parkingQty: clean(p.parkingQty),
    city: clean(p.city),
    location: clean(p.location),
    society: clean(p.society),
    floor: clean(p.floor),
    totalFloors: clean(p.totalFloors),
    carpetArea: clean(p.carpetArea),
    builtupArea: clean(p.builtupArea),
    budget: clean(p.budget),
    address: clean(p.address),
    status: clean(p.status),
    leadSource: clean(p.leadSource),
    source_url: clean(p.source_url || (p as any).sourceUrl),
    possessionMonth: clean(p.possessionMonth),
    possessionYear: clean(p.possessionYear),
    purchaseMonth: clean(p.purchaseMonth),
    purchaseYear: clean(p.purchaseYear),
    sellingRights: clean(p.selling_rights) || 'Standard',
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    furnishingItems: Array.isArray(p.furnishingItems) ? p.furnishingItems : [],
    description: clean(p.description),
    nearby_places: Array.isArray(p.nearby_places) ? p.nearby_places : [],
    existingOwnershipDocUrl: clean(p.ownershipDocUrl),
    existingOwnershipDocName: clean(p.ownershipDocName),
    existingOwnershipDocId: clean(p.ownershipDocId),
    // ✅ FIXED: existingPhotos now carries label + isSociety
    existingPhotos: (p.photos || []).map((photo: any, idx: number) => {
      const isObj = photo && typeof photo === 'object';
      const url = isObj ? photo.url : photo;
      const label = isObj ? (photo.label || '') : '';
      const isSociety = isObj ? !!photo.isSociety : false;
      const type: 'video' | 'image' | undefined = isObj ? (photo.type === 'video' ? 'video' : 'image') : undefined;
      const name = label || `photo-${idx + 1}`;
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

/* ---------------------- Tailwind Color Helpers ---------------------- */
const TAB_STYLES: Record<string, { badge: string; btn: string; btnActive: string; countActive: string }> = {
  blue: { badge: 'bg-orange-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-orange-50 text-orange-600 border border-orange-200', countActive: 'bg-orange-200 text-orange-700' },
  green: { badge: 'bg-green-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-green-50 text-green-600 border border-green-200', countActive: 'bg-green-200 text-green-700' },
  purple: { badge: 'bg-purple-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-purple-50 text-purple-600 border border-purple-200', countActive: 'bg-purple-200 text-purple-700' },
  orange: { badge: 'bg-orange-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-orange-50 text-orange-600 border border-orange-200', countActive: 'bg-orange-200 text-orange-700' },
  indigo: { badge: 'bg-indigo-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-indigo-50 text-indigo-600 border border-indigo-200', countActive: 'bg-indigo-200 text-indigo-700' },
  red: { badge: 'bg-red-100', btn: 'text-gray-600 hover:bg-gray-100', btnActive: 'bg-red-50 text-red-600 border border-red-200', countActive: 'bg-red-200 text-red-700' },
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
  // ---------- NEW: auth + permission usage ----------
  const { user } = useAuth();

  // Permission checks
  const canRead = can(user, 'property.read');
  const canCreate = can(user, 'property.create');
  const canUpdate = can(user, 'property.update');
  const canDelete = can(user, 'property.delete');
  const canImport = can(user, 'data.import');
  const canExport = can(user, 'data.export');
  const canAssign = can(user, 'property.assign');
  const canBulkDelete = can(user, 'property.bulk_delete');

  // Main content access check
  if (!canRead) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Access Denied
            </div>
            <div className="text-gray-600 text-sm">
              You do not have permission to view properties.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === "undefined") return "all";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("listTab") || localStorage.getItem("prop_list_tab") || "all";
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

  // Executive assignment states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningProperty, setAssigningProperty] = useState<UIProperty | null>(null);
  const [salesExecutives, setSalesExecutives] = useState<SalesExecutive[]>([]);
  const [executivesLoading, setExecutivesLoading] = useState(false);

  // Link Seller to Property states
  const [linkingPropertyForSeller, setLinkingPropertyForSeller] = useState<UIProperty | null>(null);
  const [showLinkSellerModal, setShowLinkSellerModal] = useState(false);
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [allSellersList, setAllSellersList] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [savingSellerLink, setSavingSellerLink] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null);
  // Dynamic tags cache: { [propertyId]: string[] }
  const [propTags, setPropTags] = useState<Record<string, string[]>>({});
  const [knownTags, setKnownTags] = useState<string[]>([]);
  const [loadedPropertyIds, setLoadedPropertyIds] = useState<Set<string>>(new Set());
  const [hasAutoTagged, setHasAutoTagged] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [totalUniqueViews, setTotalUniqueViews] = useState(0);
  const [viewsMap, setViewsMap] = useState<Record<string, { total_views: number; unique_views: number }>>({});
  const [bulkTagsMenuOpen, setBulkTagsMenuOpen] = useState(false);
  const handleSelectAllPages = () => {
    const allIds = filteredProperties.map(p => p.id);
    // If all are already selected, clear; else select all
    if (selectedProperties.length === allIds.length && allIds.length > 0) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(allIds);
    }
  };
  const [activeTagPicker, setActiveTagPicker] = useState<'add' | 'remove' | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (openDropdownId !== null) {
        const target = e.target as HTMLElement;
        const clickedBtn = target.closest('[id^="more-btn-"]');
        const clickedMenu = target.closest('[id^="more-menu-"]');
        if (!clickedBtn && !clickedMenu) {
          setOpenDropdownId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openDropdownId]);

  useEffect(() => {
    async function fetchViewStats() {
      const res = await viewsAPI.getAll(false);
      const resUnique = await viewsAPI.getAll(true);

      setTotalViews(res?.rows?.reduce((sum: number, row: any) => sum + (row?.total_views || 0), 0));
      setTotalUniqueViews(resUnique?.rows?.reduce((sum: number, row: any) => sum + (row?.unique_views || 0), 0));

      // ✅ SUM karo, overwrite mat karo — same property_id ke multiple slug-rows ho sakte hain
      const map: Record<string, { total_views: number; unique_views: number }> = {};
      (res?.rows || []).forEach((row: any) => {
        const pid = row?.property_id;
        if (pid !== undefined && pid !== null) {
          const key = String(pid);
          const prev = map[key] || { total_views: 0, unique_views: 0 };
          map[key] = {
            total_views: prev.total_views + (Number(row?.total_views) || 0),
            unique_views: prev.unique_views + (Number(row?.unique_views) || 0),
          };
        }
      });
      setViewsMap(map);
    }

    fetchViewStats();
  }, []);


  // // Fetch sales executives
  // useEffect(() => {
  //   const fetchExecutives = async () => {
  //     try {
  //       setExecutivesLoading(true);
  //       const res = await usersAPI.getByDeptRole({
  //         department: "sales",
  //         role: "executive",
  //         is_active: 1,
  //         limit: 50,
  //       });

  //       const items = res?.items ?? res?.data ?? res ?? [];

  //       if (Array.isArray(items)) {
  //         const executives: SalesExecutive[] = items.map((user: any) => ({
  //           id: user.id || user.userId,
  //           name: getDisplayName(user),
  //           email: user.email,
  //           phone: user.phone || user.mobile,
  //           department: user.department,
  //           role: user.role,
  //           is_active: user.is_active ?? user.active ?? true,
  //         }));

  //         setSalesExecutives(executives);
  //       } else {
  //         console.warn("Unexpected executives response format:", res);
  //         setSalesExecutives([]);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching executives:", err);
  //       setSalesExecutives([]);
  //     } finally {
  //       setExecutivesLoading(false);
  //     }
  //   };

  //   fetchExecutives();
  // }, []);
  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        setExecutivesLoading(true);
        const res = await usersAPI.getByDeptRole({
          department: "Sales",              // FIXED
          role: "Sales Executive",          // FIXED
          is_active: 1,
          limit: 50,
        });

        let items = res?.items ?? res?.data ?? res ?? [];

        if (Array.isArray(items)) {
          items = items.filter((u: any) => u.is_active !== 0 && u.is_active !== false && u.is_active !== '0' && u.is_active !== 'false' && u.is_active !== null);
          const executives: SalesExecutive[] = items.map((user: any) => ({
            id: user.id || user.userId,
            name: getDisplayName(user),
            email: user.email,
            phone: user.phone || user.mobile,
            department: user.department,
            role: user.role,
            is_active: user.is_active ?? user.active ?? true,
          }));

          setSalesExecutives(executives);
        } else {
          console.warn("Unexpected executives response format:", res);
          setSalesExecutives([]);
        }
      } catch (err) {
        console.error("Error fetching executives:", err);
        setSalesExecutives([]);
      } finally {
        setExecutivesLoading(false);
      }
    };

    fetchExecutives();
  }, []);


  // Persist active tab - OPTIMIZED
  useEffect(() => {
    if (!activeTab) return;

    const previousTab = localStorage.getItem('prop_list_tab');
    if (previousTab === activeTab) return;

    localStorage.setItem('prop_list_tab', activeTab);

    const timeoutId = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('listTab', activeTab);
      window.history.replaceState({}, '', url.toString());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  // Fetch master data
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
    assignedExecutive: 'all',
    isPublic: undefined,
  };
  const [filters, setFilters] = useState(initialFilters);
  const clearFilters = () => {
    setFilters(initialFilters);
  };
  const [properties, setProperties] = useState<UIProperty[]>([]);

  // OPTIMIZED: Single API call without retry loop
  const fetchPropertiesOnce = async () => {
    try {
      // Directly call the API without type checking
      const raw = await propertiesAPI.getProperties();
      const list = Array.isArray(raw) ? raw : raw?.data || [];
      return list.map((r: any, idx: number) => normalizeProperty(r, idx));
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const presetTags = useMemo(() => Object.keys(DEFAULT_TAG_STYLE), []);
  const dynamicTagUniverse = useMemo(
    () => getUniquePropertyTagsFromCache(propTags),
    [propTags]
  );

  const handleClickTag = (tag: string) => {
    setFilters((f) => ({ ...f, tags: tag }));
    setActiveTab("all");
    setCurrentPage(1);
    toast.info(`Filtered by tag: ${tag}`, { autoClose: 1500 });
  };

  const knownTagsAll = useMemo(() => {
    const set = new Set<string>([
      ...presetTags,
      ...knownTags,
      ...dynamicTagUniverse,
    ]);
    return Array.from(set)
      .map(t => String(t).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [presetTags, knownTags, dynamicTagUniverse]);

  // REPLACE YOUR CURRENT loadProperties FUNCTION WITH THIS:

  const loadProperties = async () => {
    console.log('🔄 Loading properties started...');

    setLoading(true);
    setError(null);
    setIsOffline(false);

    try {
      console.log('📞 Calling propertiesAPI.getProperties()...');

      // Remove the problematic type check
      const raw = await propertiesAPI.getProperties();


      const list = Array.isArray(raw) ? raw : raw?.data || [];


      const normalized = list.map((r: any, idx: number) => normalizeProperty(r, idx));
      setProperties(normalized);



    } catch (e: any) {
      console.error('❌ Error fetching properties:', e);

      // More detailed error handling
      let errorMsg = 'Failed to load properties.';

      if (e?.message) {
        errorMsg = e.message;
      } else if (e?.response?.data?.message) {
        errorMsg = e.response.data.message;
      } else if (e?.code === 'NETWORK_ERROR') {
        errorMsg = 'Network error - please check your connection';
        setIsOffline(true);
      }

      setError(errorMsg);
      setProperties([]);

      // Show error in UI
      toast.error(`Loading failed: ${errorMsg}`);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  // Load properties on mount
  useEffect(() => {
    loadProperties();
    const backOnline = () => navigator.onLine && loadProperties();
    window.addEventListener('online', backOnline);
    return () => window.removeEventListener('online', backOnline);
  }, []);

  // OPTIMIZED: Update current property view only when specific property changes
  useEffect(() => {
    if (!currentPropertyView) return;

    const currentPropertyId = String(currentPropertyView.id);
    const freshProperty = properties.find(p => String(p.id) === currentPropertyId);

    if (freshProperty && freshProperty.updated_at !== currentPropertyView.updated_at) {
      setCurrentPropertyView(freshProperty);
    }
  }, [properties, currentPropertyView?.id]);

  // OPTIMIZED: Load tags only for new properties
  useEffect(() => {
    if (!properties.length) return;

    const newProperties = properties.filter(p =>
      !loadedPropertyIds.has(String(p.id)) &&
      !propTags[String(p.id)]
    );

    if (newProperties.length === 0) return;

    const loadTagsForNewProperties = async () => {
      try {
        const ids = newProperties.map(p => p.id);
        // Single bulk request instead of N individual requests
        const bulkMap = await propertyTagsAPI.getBulk(ids);

        const updates: Record<string, string[]> = {};
        const tagSet = new Set(knownTags);

        for (const p of newProperties) {
          const tags: string[] = Array.isArray(bulkMap[p.id]) ? bulkMap[p.id] : [];
          updates[String(p.id)] = tags;
          tags.forEach(t => tagSet.add(t));
        }

        if (Object.keys(updates).length > 0) {
          setPropTags(prev => ({ ...prev, ...updates }));
          setKnownTags(prev => Array.from(new Set([...prev, ...Object.values(updates).flat()])).sort());

          // Mark properties as loaded
          setLoadedPropertyIds(prev => {
            const newSet = new Set(prev);
            newProperties.forEach(p => newSet.add(String(p.id)));
            return newSet;
          });
        }
      } catch (error) {
        console.error('Error loading tags (bulk):', error);
      }
    };

    loadTagsForNewProperties();
  }, [properties.length]) // Only runs when properties array length changes

  // OPTIMIZED: Auto-tagging runs only once after initial load
  useEffect(() => {
    if (!properties.length || hasAutoTagged) return;

    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const needsNewListing = properties.filter(p => {
      if (!p.created_at) return false;
      const created = new Date(p.created_at).getTime();
      return created >= oneWeekAgo;
    });

    if (needsNewListing.length === 0) {
      setHasAutoTagged(true);
      return;
    }

    const autoTagNewProperties = async () => {
      try {
        for (const p of needsNewListing) {
          const key = String(p.id);
          const currentTags = propTags[key] || [];

          if (!currentTags.some(t => t.toLowerCase() === "new listing")) {
            // Update local state immediately
            setPropTags(prev => ({
              ...prev,
              [key]: [...currentTags, "New Listing"]
            }));

            // API call in background (don't await)
            propertyTagsAPI.add(p.id, ["New Listing"]).catch(console.error);
          }
        }

        setKnownTags(prev =>
          prev.includes("New Listing") ? prev : ["New Listing", ...prev].sort()
        );
        setHasAutoTagged(true);
      } catch (error) {
        console.error('Auto-tagging failed:', error);
      }
    };

    autoTagNewProperties();
  }, [properties.length, hasAutoTagged]);


  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All Properties', count: properties.length, color: 'blue' },
      { id: 'available', label: 'Available', count: properties.filter(p => p.status === 'Available').length, color: 'green' },
      { id: 'public', label: 'Public Listings', count: properties.filter(p => p.isPublic).length, color: 'indigo' },
      { id: 'private', label: 'Private Listings', count: properties.filter(p => !p.isPublic).length, color: 'red' },
      {
        id: 'new_listing',
        label: 'New Listings',
        count: properties.filter(p => {
          const ls = p.leadSource || '';
          return ls === 'seller_portal' || ls.includes('seller_portal');
        }).length,
        color: 'orange'
      },
      { id: 'hot', label: 'Hot Properties', count: properties.filter(p => (Number(p.hotLeads) || 0) > 2).length, color: 'red' },
      { id: 'sold', label: 'Sold', count: properties.filter(p => p.status === 'Sold').length, color: 'purple' },
      { id: 'negotiation', label: 'Under Negotiation', count: properties.filter(p => p.status === 'Under Negotiation').length, color: 'orange' },
    ],
    [properties]
  );

  const filteredProperties = useMemo(() => {
    const out = properties.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const qClean = q.replace(/[^a-z0-9]/gi, "");
      const qDigits = q.replace(/\D/g, "");
      const qNum = parseInt(qDigits, 10);
      const qTrimmed = qDigits.replace(/^0+/, "");

      const pid = String(p.id || p.propertyId || "");
      const pidDigits = pid.replace(/\D/g, "");
      const pidNum = parseInt(pidDigits, 10);
      const pidTrimmed = pidDigits.replace(/^0+/, "");
      const pidClean = pid.replace(/[^a-z0-9]/gi, "");
      const repId = String(p.propertyId || "").toLowerCase();
      const repIdClean = repId.replace(/[^a-z0-9]/gi, "");

      const matchesSearch = !q ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.propertyId || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.society || '').toLowerCase().includes(q) ||
        (p.seller?.name || '').toLowerCase().includes(q) ||
        (qClean && (pidClean.includes(qClean) || repIdClean.includes(qClean))) ||
        (!isNaN(qNum) && !isNaN(pidNum) && qNum === pidNum) ||
        (qTrimmed && pidTrimmed && pidTrimmed.includes(qTrimmed));

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'available' && p.status === 'Available') ||
        (activeTab === 'sold' && p.status === 'Sold') ||
        (activeTab === 'negotiation' && p.status === 'Under Negotiation') ||
        (activeTab === 'public' && p.isPublic) ||
        (activeTab === 'private' && !p.isPublic) ||
        (activeTab === 'hot' && (Number(p.hotLeads) || 0) > 2) ||
        (activeTab === 'new_listing' && (p.leadSource === 'seller_portal' || (p.leadSource || '').includes('seller_portal')));
      const matchesExecutive =
        filters.assignedExecutive === 'all' ||
        (filters.assignedExecutive === '__unassigned__' && !p.assignedTo?.id) ||
        (p.assignedTo?.id != null && String(p.assignedTo.id) === String(filters.assignedExecutive));

      const matchesPublicFilter =
        filters.isPublic === undefined ||
        filters.isPublic === Boolean(p.isPublic);

      const matchesPriceRange = (() => {
        if (filters.priceRange === 'all' || !filters.priceRange) return true;

        const price = Number(p.budget);
        if (!price || price <= 0) return false;

        return checkPriceRange(price, filters.priceRange);
      })();

      const matchesBudgetRange = (() => {
        const minBudget = filters.minBudget ? Number(filters.minBudget) : 0;
        const maxBudget = filters.maxBudget ? Number(filters.maxBudget) : Infinity;

        // If no filter is active, return true
        if (minBudget === 0 && maxBudget === Infinity) return true;

        const price = Number(p.budget);
        if (!price || price <= 0) return false;

        return price >= minBudget && price <= maxBudget;
      })();

      const matchesDateRange = (() => {
        if (filters.ignoreDate) return true;

        const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;

        if (!dateFrom && !dateTo) return true;

        const propertyDate = new Date(p.created_at || p.updated_at || 0);
        propertyDate.setHours(0, 0, 0, 0);

        if (dateFrom && dateTo) {
          dateFrom.setHours(0, 0, 0, 0);
          dateTo.setHours(23, 59, 59, 999);
          return propertyDate >= dateFrom && propertyDate <= dateTo;
        } else if (dateFrom) {
          dateFrom.setHours(0, 0, 0, 0);
          return propertyDate >= dateFrom;
        } else if (dateTo) {
          dateTo.setHours(23, 59, 59, 999);
          return propertyDate <= dateTo;
        }

        return true;
      })();

      const matchesFilters =
        (filters.type === 'all' || p.type === filters.type) &&
        (filters.status === 'all' || p.status === filters.status) &&
        (filters.location === 'all' || p.location === filters.location || p.city === filters.location) &&
        (filters.stage === 'all' || p.stage === filters.stage.toLowerCase().replace(/\s+/g, "_")) &&
        matchesPriceRange &&
        matchesBudgetRange &&
        (filters.tags === 'all' || (propTags[String(p.id)] || []).some(t => t === filters.tags)) &&
        matchesExecutive &&
        matchesPublicFilter &&
        matchesDateRange;

      return matchesSearch && matchesTab && matchesFilters;
    });

    const sorted = [...out].sort((a, b) => {
      switch (filters.sortOrder) {
        case 'created_asc':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();

        case 'created_desc':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();

        case 'price_asc':
          return (Number(a.budget) || 0) - (Number(b.budget) || 0);

        case 'price_desc':
          return (Number(b.budget) || 0) - (Number(a.budget) || 0);

        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    return sorted;
  }, [properties, searchTerm, activeTab, filters, propTags]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  // Event handlers
  const handlebrochureDownloadsy = () => {
    setBulkModalOpen(true);
  };

  const handleAddProperty = () => { setEditingProperty(null); setShowPropertyForm(true); };
  const handleEditProperty = (property: UIProperty) => { setEditingProperty(property); setShowPropertyForm(true); };

  const handleViewProperty = (property: UIProperty) => {
    setCurrentPropertyView(property);
    const url = new URL(window.location.href);
    url.searchParams.set('view', String(property.id));
    window.history.replaceState({}, '', url.toString());
  };

  const handleBackToList = () => {
    setCurrentPropertyView(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('tab');
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
    // }, [loading, error, properties, currentPropertyView]);

  }, [loading, error, properties]);


  const handleDeleteProperty = async (propertyId: number | string, propertyName?: string) => {
    // Find the property name if not provided
    const prop = properties.find(p => p.id === propertyId);
    const displayName = propertyName || prop?.title || `Property #${propertyId}`;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${displayName}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await propertiesAPI.deleteProperty(propertyId.toString());
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      // Remove from loaded IDs
      setLoadedPropertyIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(String(propertyId));
        return newSet;
      });
      toast.success("Property deleted successfully!");

      // Optional: show a success Swal (like Leads page) – or keep the toast only
      // Swal.fire({ title: 'Deleted!', text: 'Property has been deleted.', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Failed to delete property:", error);
      toast.error("Error deleting property. Please try again.");
    }
  };

  const handlePropertySelection = (propertyId: number | string) => {
    setSelectedProperties(prev => prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]);
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === paginatedProperties.length) setSelectedProperties([]);
    else setSelectedProperties(paginatedProperties.map(p => p.id));
  };

  /* ---------------------- Executive Assignment Handlers ---------------------- */
  const handleAssignExecutive = (property: UIProperty) => {
    setAssigningProperty(property);
    setShowAssignModal(true);
  };

  const handleBulkAssignExecutive = () => {
    if (selectedProperties.length === 0) {
      toast.warn("No properties selected");
      return;
    }
    setShowAssignModal(true);
  };

  const handleSingleAssign = async (executiveId: number | string, executiveName: string) => {
    if (!assigningProperty) return;

    try {
      const assignedToId = Number(executiveId);
      const payload = { assigned_to: assignedToId };

      const response = await propertiesAPI.updateAssignedTo(assigningProperty.id, payload);

      if (response.success) {
        const executive = salesExecutives.find(e => e.id === executiveId);

        const updatedAssignedTo = executive ? {
          id: executive.id,
          name: executive.name,
          email: executive.email,
          phone: executive.phone,
          department: executive.department,
          role: executive.role
        } : {
          id: executiveId,
          name: executiveName,
          email: '',
          phone: '',
          department: '',
          role: ''
        };

        setProperties(prev => prev.map(p =>
          p.id === assigningProperty.id
            ? { ...p, assignedTo: updatedAssignedTo }
            : p
        ));

        setCurrentPropertyView(prev =>
          prev && String(prev.id) === String(assigningProperty.id)
            ? { ...prev, assignedTo: updatedAssignedTo }
            : prev
        );

        if (response.success) {
          // ✅ Properties list refresh kar dein
          await loadProperties(); // Ye wahi function hai jo initial load ke liye use karte hain

          toast.success(`Property assigned to ${executiveName}`);
        }

      } else {
        toast.error("Failed to assign executive");
      }
    } catch (error: any) {
      console.error("Assign executive failed:", error);
      toast.error(error?.response?.data?.message || "Error assigning executive");
    }
  };

  const handleBulkAssign = async (executiveId: number | string, executiveName: string) => {
    if (selectedProperties.length === 0) return;

    setBulkLoading(true);
    try {
      const assignedToId = Number(executiveId);
      const executive = salesExecutives.find(e => e.id === executiveId);

      const updatedAssignedTo = executive ? {
        id: executive.id,
        name: executive.name,
        email: executive.email,
        phone: executive.phone,
        department: executive.department,
        role: executive.role
      } : {
        id: executiveId,
        name: executiveName,
        email: '',
        phone: '',
        department: '',
        role: ''
      };

      let successCount = 0;

      for (const propertyId of selectedProperties) {
        try {
          const payload = { assigned_to: assignedToId };
          const response = await propertiesAPI.updateAssignedTo(propertyId, payload);

          if (response.success) {
            setProperties(prev => prev.map(p =>
              p.id === propertyId
                ? { ...p, assignedTo: updatedAssignedTo }
                : p
            ));
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to assign property ${propertyId}:`, error);
        }
      }
      if (successCount > 0) {
        await loadProperties(); // Complete refresh for consistency
        toast.success(`${successCount} properties assigned to ${executiveName}`);
      }

      setSelectedProperties([]);
    } catch (error: any) {
      console.error("Bulk assign failed:", error);
      toast.error("Error during bulk assignment");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDistributeEqually = async () => {
    if (!canAssign) {
      toast.error('You do not have permission to assign properties');
      return;
    }
    if (selectedProperties.length === 0) {
      toast.warn("No properties selected");
      return;
    }
    if (salesExecutives.length === 0) {
      toast.error('No executives available for assignment');
      return;
    }

    setBulkLoading(true);
    try {
      let successCount = 0;
      for (let i = 0; i < selectedProperties.length; i++) {
        const propertyId = selectedProperties[i];
        const execIndex = i % salesExecutives.length;
        const executive = salesExecutives[execIndex];
        const assignedToId = Number(executive.id);

        try {
          const payload = { assigned_to: assignedToId };
          const response = await propertiesAPI.updateAssignedTo(propertyId, payload);

          if (response.success) {
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to assign property ${propertyId}:`, error);
        }
      }

      await loadProperties();
      toast.success(`Successfully distributed properties equally among executives (${successCount} assigned)`);
      setSelectedProperties([]);
    } catch (error) {
      console.error("Distribution failed:", error);
      toast.error("Failed to distribute properties");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleAssignSubmit = async (executiveId: number | string, executiveName: string) => {
    if (assigningProperty) {
      await handleSingleAssign(executiveId, executiveName);
    } else if (selectedProperties.length > 0) {
      await handleBulkAssign(executiveId, executiveName);
    }
  };

  const handleUnassignExecutive = async (propertyId: number | string) => {
    try {
      const payload = { assigned_to: null };
      const response = await propertiesAPI.updateAssignedTo(propertyId, payload);

      if (response.success) {
        setProperties(prev => prev.map(p =>
          p.id === propertyId
            ? { ...p, assignedTo: undefined }
            : p
        ));
        toast.success("Executive unassigned successfully");
      } else {
        toast.error("Failed to unassign executive");
      }
    } catch (error: any) {
      console.error("Unassign executive failed:", error);
      toast.error(error?.response?.data?.message || "Error unassigning executive");
    }
  };

  const handleBulkUnassign = async () => {
    if (selectedProperties.length === 0) {
      toast.warn("No properties selected");
      return;
    }

    setBulkLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const propertyId of selectedProperties) {
        try {
          const payload = { assigned_to: null };
          const response = await propertiesAPI.updateAssignedTo(propertyId, payload);

          if (response.success) {
            setProperties(prev => prev.map(p =>
              p.id === propertyId
                ? { ...p, assignedTo: undefined }
                : p
            ));
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Failed to unassign property ${propertyId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} properties unassigned`);
      }
      if (errorCount > 0) {
        toast.warn(`${errorCount} properties failed to unassign`);
      }

      setSelectedProperties([]);
    } catch (error: any) {
      console.error("Bulk unassign failed:", error);
      toast.error("Error during bulk unassignment");
    } finally {
      setBulkLoading(false);
    }
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

  const handleBulkAddTags = async (tags: string[]) => {
    if (!selectedProperties.length) return toast.warn("No properties selected");

    const clean = Array.from(new Set(tags.map(t => String(t).trim()).filter(Boolean)));
    if (!clean.length) return toast.warn("Pick at least one tag");

    setBulkLoading(true);
    try {
      for (const id of selectedProperties) {
        await propertyTagsAPI.add(id, clean);
        const key = String(id);
        setPropTags(prev => ({
          ...prev,
          [key]: Array.from(new Set([...(prev[key] || []), ...clean]))
        }));
      }
      setKnownTags(prev => Array.from(new Set([...prev, ...clean])).sort());
      toast.success("Tags added to selected properties");
    } catch (e: any) {
      console.error("Bulk add tags failed:", e);
      toast.error(e?.response?.data?.message || "Failed to add tags");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkRemoveTags = async (tags: string[]) => {
    if (!selectedProperties.length) return toast.warn("No properties selected");
    const clean = Array.from(new Set(tags.map(t => String(t).trim()).filter(Boolean)));
    if (!clean.length) return toast.warn("Pick at least one tag");

    setBulkLoading(true);
    try {
      for (const id of selectedProperties) {
        await propertyTagsAPI.remove(id, clean);
        const key = String(id);
        setPropTags(prev => {
          const remain = (prev[key] || []).filter(t => !clean.some(r => r.toLowerCase() === t.toLowerCase()));
          return { ...prev, [key]: remain };
        });
      }
      toast.success("Tags removed from selected properties");
    } catch (e: any) {
      console.error("Bulk remove tags failed:", e);
      toast.error(e?.response?.data?.message || "Failed to remove tags");
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
      // Fallback to client-side export
      const selected = properties.filter(p => selectedProperties.includes(p.id));
      const headers = ["ID", "PropertyID", "Title", "Type", "Subtype", "UnitType", "City", "Location", "Society", "Status", "Stage", "Budget", "IsPublic", "AssignedTo"];
      const rows = selected.map(p => ([
        String(p.id), p.propertyId ?? "", (p.title ?? "").toString().replace(/\n/g, " "),
        p.type ?? "", p.subtype ?? "", p.unitType ?? "", p.city ?? "", p.location ?? "", p.society ?? "",
        p.status ?? "", p.stage ?? "", String(p.budget ?? ""), p.isPublic ? "Yes" : "No", p.assignedTo?.name ?? "",
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

    const count = selectedProperties.length;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${count} propert${count > 1 ? 'ies' : 'y'}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, delete ${count} propert${count > 1 ? 'ies' : 'y'}!`,
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    setBulkLoading(true);
    try {
      const response = await propertiesAPI.bulkDelete({
        propertyIds: selectedProperties,
        updatedBy: 'User'
      });

      if (response.success) {
        setProperties(prev => prev.filter(p => !selectedProperties.includes(p.id)));
        // Remove from loaded IDs
        setLoadedPropertyIds(prev => {
          const newSet = new Set(prev);
          selectedProperties.forEach(id => newSet.delete(String(id)));
          return newSet;
        });
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

  const handleOpenLinkSellerModal = async (property: UIProperty) => {
    setLinkingPropertyForSeller(property);
    setShowLinkSellerModal(true);
    setSellerSearchQuery('');
    setLoadingSellers(true);
    try {
      const res = await sellerAPI.getAll();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAllSellersList(list);
    } catch (err) {
      console.error("Failed to load sellers:", err);
      toast.error("Could not load sellers");
    } finally {
      setLoadingSellers(false);
    }
  };

  const handleLinkSellerToProperty = async (seller: any) => {
    if (!linkingPropertyForSeller) return;
    setSavingSellerLink(true);
    try {
      const currentProps = Array.isArray(seller.properties) ? seller.properties : [];
      const pid = String(linkingPropertyForSeller.id || linkingPropertyForSeller.propertyId);
      const alreadyLinked = currentProps.some((p: any) => String(p.id || p.property_id || p._id) === pid);

      const updatedProps = alreadyLinked ? currentProps : [...currentProps, linkingPropertyForSeller];

      // 1. Update seller's property list on server
      await sellerAPI.update(String(seller.id || seller.seller_id || seller._id), {
        ...seller,
        properties: updatedProps,
        property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
      });

      // 2. Patch seller_id directly on property (new dedicated endpoint)
      await propertiesAPI.patchSeller(String(linkingPropertyForSeller.id), 'link', seller.id || seller.seller_id);

      setProperties(prev => prev.map(p => {
        if (p.id === linkingPropertyForSeller.id) {
          return {
            ...p,
            seller: {
              id: seller.id,
              name: seller.name,
              phone: seller.phone,
              email: seller.email,
            },
          };
        }
        return p;
      }));

      toast.success(`Property linked to seller "${seller.name}" successfully!`);
      setShowLinkSellerModal(false);
      setLinkingPropertyForSeller(null);
    } catch (err: any) {
      console.error('Failed to link seller:', err);
      toast.error(err?.response?.data?.message || 'Failed to link seller to property');
    } finally {
      setSavingSellerLink(false);
    }
  };

  const handleUnlinkSellerFromProperty = async () => {
    if (!linkingPropertyForSeller) return;
    const linkedSellerId = linkingPropertyForSeller.seller?.id || (linkingPropertyForSeller as any).seller_id;
    const linkedSellerName = linkingPropertyForSeller.seller?.name || (linkingPropertyForSeller as any).seller_name;

    const result = await Swal.fire({
      title: 'Unlink Seller?',
      text: `Are you sure you want to unlink seller "${linkedSellerName}" from this property?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Unlink',
      cancelButtonText: 'Cancel',
      width: '380px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-gray-800',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 mx-1',
        cancelButton: 'px-3 py-1.5 bg-gray-500 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 mx-1',
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    setSavingSellerLink(true);
    try {
      // 1. Clear seller_id on property via dedicated endpoint
      await propertiesAPI.patchSeller(String(linkingPropertyForSeller.id), 'unlink');

      // 2. Remove this property from the seller's properties list
      if (linkedSellerId) {
        try {
          // getById returns { success, data: { seller, properties, cosellers, ... } }
          const resp = await sellerAPI.getById(String(linkedSellerId));
          const sellerData = resp?.data?.seller ?? resp?.seller ?? resp;
          const currentProps: any[] = Array.isArray(resp?.data?.properties)
            ? resp.data.properties
            : Array.isArray(resp?.properties)
              ? resp.properties
              : [];

          const pid = String(linkingPropertyForSeller.id);
          const updatedProps = currentProps.filter(
            (p: any) => String(p.id || p.property_id || p._id) !== pid
          );

          await sellerAPI.update(String(linkedSellerId), {
            ...(sellerData || {}),
            properties: updatedProps,
            property_ids: updatedProps.map((p: any) => p.id || p.property_id || p._id).filter(Boolean),
          });
        } catch (err) {
          console.error('Failed to update seller properties on server during unlink:', err);
        }
      }

      // 3. Update local state
      setProperties(prev => prev.map(p => {
        if (p.id === linkingPropertyForSeller.id) {
          return { ...p, seller: null };
        }
        return p;
      }));

      setLinkingPropertyForSeller(prev => prev ? { ...prev, seller: null } : null);

      toast.success('Seller unlinked from property successfully!');
    } catch (err: any) {
      console.error('Failed to unlink seller:', err);
      toast.error('Failed to unlink seller from property');
    } finally {
      setSavingSellerLink(false);
    }
  };

  const filteredSellersForLink = useMemo(() => {
    if (!sellerSearchQuery.trim()) return allSellersList;
    const q = sellerSearchQuery.toLowerCase().trim();
    const qDigits = q.replace(/\D/g, "");
    return allSellersList.filter((s: any) => {
      const name = String(s.name || "").toLowerCase();
      const phone = String(s.phone || s.whatsapp || "");
      const phoneDigits = phone.replace(/\D/g, "");
      const email = String(s.email || "").toLowerCase();
      const loc = String(s.location || s.city || "").toLowerCase();
      const sid = String(s.id || s.seller_id || "");
      return (
        name.includes(q) ||
        email.includes(q) ||
        loc.includes(q) ||
        sid.includes(q) ||
        (qDigits && phoneDigits.includes(qDigits))
      );
    });
  }, [allSellersList, sellerSearchQuery]);

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


  // Executive badge component
  const ExecutiveBadge = ({ assignedTo }: { assignedTo?: UIProperty['assignedTo'] }) => {
    if (!assignedTo || !assignedTo.name || assignedTo.name.trim() === "") {
      return null;
    }
    return (
      <div
        className="flex items-center gap-1 px-1.5 py-0.5  text-blue-700 text-[10px] rounded  max-w-[140px] truncate"
        title={assignedTo.name + (assignedTo.department ? ` (${assignedTo.department})` : '')}
      >
        <UserCheck size={10} className="flex-shrink-0 text-blue-600" />
        <span className="font-medium truncate">{assignedTo.name}</span>
        {assignedTo.department && (
          <span className="text-[9px] text-blue-500 truncate hidden sm:inline">({assignedTo.department})</span>
        )}
      </div>
    );
  };

  if (currentPropertyView) {
    return (
      <PropertyViewPage
        property={currentPropertyView}
        onBack={handleBackToList}
        onEdit={handleEditProperty}
        onBuyerMatching={handleBuyerMatching}
        onViewBuyers={handleViewBuyers}
        onUpdateProperty={(p) => {
          setCurrentPropertyView(p);
          setProperties(prev => prev.map(x => x.id === p.id ? { ...x, ...p } : x));
        }}
      />
    );
  }

  // Calculate column span based on permissions
  const getColSpan = () => {
    let colSpan = 7; // Base columns without actions and checkbox
    if (canUpdate || canDelete || canAssign || canBulkDelete) {
      colSpan += 1; // Add checkbox column
    }
    if (canUpdate || canDelete || canAssign) {
      colSpan += 1; // Add actions column
    }
    return colSpan;
  };

  return (
    <>

      <style>{`
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fade-in 0.15s ease-out; }

  .tabs-scroll::-webkit-scrollbar {
    height: 4px;
  }
  .tabs-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  .tabs-scroll::-webkit-scrollbar-thumb {
    background: #e67e22;
    border-radius: 10px;
  }
  .tabs-scroll::-webkit-scrollbar-thumb:hover {
    background: #d35400;
  }
`}</style>
      <div className="h-[91.7vh] flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        {/* <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4"> */}
        <div className="sticky top-0  bg-gray-50">

          {/* Header */}
          <div className=" bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-2 py-4">
            <div className=" md:hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              <div className="flex items-center space-x-2 ml-auto">
                {/* Import Button - Conditional */}
                {canImport && (
                  <button
                    onClick={() => setShowImportProperties(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all text-xs"
                  >
                    <Upload size={14} />
                    <span>Import</span>
                  </button>
                )}

                {/* Add Property Button - Conditional */}
                {canCreate && (
                  <button
                    onClick={handleAddProperty}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-all text-xs"
                    style={{ background: theme.navy }}              >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                )}

                {/* Brochure Downloads Button - Conditional */}
                {canExport && (
                  <button
                    onClick={handlebrochureDownloadsy}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-all text-xs"
                    style={{ background: theme.orange }}              >
                    <Download size={14} />
                    <span>brochureDownloads</span>
                  </button>
                )}
              </div>
            </div>

            <PropertyBulkBrochureModal
              isOpen={bulkModalOpen}
              onClose={() => setBulkModalOpen(false)}
            />

            <div className="flex flex-col lg:flex-row gap-3 items-stretch mt-2 sm:mt-3">
              {/* Tab Switcher on the Left */}
              <div className="flex flex-row lg:flex-col p-1 rounded-xl bg-gray-100 border border-gray-200 justify-between lg:justify-start gap-1 lg:w-44 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/properties')}
                  className="flex-1 lg:flex-initial text-center lg:text-left px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center lg:justify-start gap-2 bg-white text-[#E6761D] shadow-sm font-bold"
                >
                  Sell Properties
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/rental-properties')}
                  className="flex-1 lg:flex-initial text-center lg:text-left px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center lg:justify-start gap-2 text-gray-500 hover:text-gray-800 hover:bg-white/50"
                >
                  Rent Properties
                </button>
              </div>

              {/* Stats Cards on the Right */}
              <div className="flex-1 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 sm:gap-2">
                {/* Total Properties Card */}
                <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#eff6ff', border: '1px solid #3b82f620' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#3b82f6' }}>Total</p>
                      <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>{properties.length}</p>
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#3b82f620' }}>
                      <Home size={10} className="sm:hidden" style={{ color: '#3b82f6' }} />
                      <Home size={12} className="hidden sm:block" style={{ color: '#3b82f6' }} />
                    </div>
                  </div>
                </div>

                {/* Total Views Card */}
                <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#8b5cf6' }}>Views</p>
                      <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>{totalViews}</p>
                      <p className="text-[6px] sm:text-[7px] mt-0.5 hidden sm:block" style={{ color: '#8b5cf6' }}>Unique: {totalUniqueViews}</p>
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#8b5cf620' }}>
                      <Eye size={10} className="sm:hidden" style={{ color: '#8b5cf6' }} />
                      <Eye size={12} className="hidden sm:block" style={{ color: '#8b5cf6' }} />
                    </div>
                  </div>
                </div>

                {/* Available Properties Card */}
                <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#10b981' }}>Avail</p>
                      <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                        {properties.filter((p) => p.status === "Available").length}
                      </p>
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#10b98120' }}>
                      <CheckCircle size={10} className="sm:hidden" style={{ color: '#10b981' }} />
                      <CheckCircle size={12} className="hidden sm:block" style={{ color: '#10b981' }} />
                    </div>
                  </div>
                </div>

                {/* Sold Properties Card */}
                <div className="rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#f59e0b' }}>Sold</p>
                      <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                        {properties.filter((p) => p.status === "Sold").length}
                      </p>
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b20' }}>
                      <Award size={10} className="sm:hidden" style={{ color: '#f59e0b' }} />
                      <Award size={12} className="hidden sm:block" style={{ color: '#f59e0b' }} />
                    </div>
                  </div>
                </div>

                {/* Assigned Properties Card */}
                <div className="hidden sm:block rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm col-span-2 sm:col-span-1" style={{ background: '#e67e2210', border: '1px solid #e67e2220' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#e67e22' }}>Assigned</p>
                      <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                        {properties.filter((p) => p.assignedTo?.id).length}
                      </p>
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#e67e2220' }}>
                      <UserCheck size={10} className="sm:hidden" style={{ color: '#e67e22' }} />
                      <UserCheck size={12} className="hidden sm:block" style={{ color: '#e67e22' }} />
                    </div>
                  </div>
                </div>

                {/* Mobile Assigned Card */}
                <div className="sm:hidden rounded-lg p-1.5 transition-all hover:shadow-sm col-span-2" style={{ background: '#e67e2210', border: '1px solid #e67e2220' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[7px] font-medium uppercase tracking-wider" style={{ color: '#e67e22' }}>Assigned</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
                        {properties.filter((p) => p.assignedTo?.id).length}
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: '#e67e2220' }}>
                      <UserCheck size={10} style={{ color: '#e67e22' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Tabs - Scrollable on mobile */}
                <div
                  className="tabs-scroll flex items-center gap-0.5 overflow-x-auto pb-1 flex-1 scrollbar-hide"
                // style={{
                //   scrollbarWidth: "thin",
                //   scrollbarColor: "#e67e22 #f1f5f9",
                // }}
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${tabBtnClass(activeTab === tab.id, tab.color)}
        px-2 py-0.5 sm:px-2.5 sm:py-1
        rounded-md
        min-h-[26px]
        flex items-center gap-1
        whitespace-nowrap
        text-[10px] sm:text-[11px]
        leading-none
        flex-shrink-0
      `}
                    >
                      <span className="font-medium whitespace-nowrap">
                        {tab.label}
                      </span>

                      <span
                        className={`${tabCountClass(activeTab === tab.id, tab.color)}
          text-[9px]
          px-1 py-[1px]
          rounded-full
          leading-none
        `}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Desktop Buttons - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:flex items-center space-x-2">
                  {/* Import Button - Conditional */}
                  {canImport && (
                    <button
                      onClick={() => setShowImportProperties(true)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-600 hover:to-emerald-700 transition-all text-xs whitespace-nowrap"
                    >
                      <Upload size={14} />
                      <span>Import</span>
                    </button>
                  )}

                  {/* Add Property Button - Conditional */}
                  {canCreate && (
                    <button
                      onClick={handleAddProperty}
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-all text-xs whitespace-nowrap"
                      style={{ background: theme.navy }}
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  )}

                  {/* Brochure Downloads Button - Conditional */}
                  {canExport && (
                    <button
                      onClick={handlebrochureDownloadsy}
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-all text-xs whitespace-nowrap"
                      style={{ background: theme.orange }}
                    >
                      <Download size={14} />
                      <span>brochureDownloads</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ================= END STICKY TOP AREA ================= */}

        {/* Top bar */}
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-2 sm:px-2 lg:px-2 py-2 sm:py-3 mx-2 sm:mx-4 mt-2 rounded-md overflow-visible">

          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">

            <div className="flex-1 flex items-center gap-1.5 sm:space-x-2">

              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-[11px] sm:text-xs"
                />
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-[11px] sm:text-xs"
              >
                <Filter size={12} />
                <span className="hidden sm:inline ml-2">Filters</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid size={12} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-1.5 sm:space-x-2">



              {canExport && viewMode === 'grid' && (
                <button
                  onClick={handleBulkExport}
                  disabled={bulkLoading}
                  className="flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-[11px] sm:text-xs disabled:opacity-50"
                >
                  <Download size={12} />
                  <span className="hidden sm:inline ml-2">Export</span>
                </button>
              )}
            </div>
          </div>

          {selectedProperties.length > 0 && (canUpdate || canAssign || canBulkDelete || canExport) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg mt-2 overflow-visible">
              {/* Responsive Bulk Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:px-2 sm:py-2 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Selected count and Clear button - Same row on mobile */}
                  <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                    <span className="text-xs font-medium text-blue-700 whitespace-nowrap">
                      {selectedProperties.length} selected
                    </span>
                    {/* Mobile Cross Icon - Right side */}
                    <button
                      onClick={() => setSelectedProperties([])}
                      className="text-blue-600 hover:text-blue-800 transition-colors sm:hidden"
                      title="Clear selection"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={handleSelectAllPages}
                      className="px-2 sm:px-2.5 py-1 bg-blue-600 text-white rounded text-[10px] sm:text-xs hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {selectedProperties.length === filteredProperties.length && filteredProperties.length > 0
                        ? 'Unselect All'
                        : 'Select All'}
                    </button>
                    {canUpdate && (
                      <>
                        <button
                          onClick={() => handleBulkStatusChange('Available')}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-green-600 text-white rounded text-[10px] sm:text-xs hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Available</span>
                          <span className="hidden sm:inline">Mark Available</span>
                        </button>
                        <button
                          onClick={() => handleBulkStatusChange('Sold')}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-blue-600 text-white rounded text-[10px] sm:text-xs hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Sold</span>
                          <span className="hidden sm:inline">Mark Sold</span>
                        </button>
                      </>
                    )}
                    {canAssign && (
                      <>
                        <button
                          onClick={handleBulkAssignExecutive}
                          disabled={bulkLoading || executivesLoading}
                          className="px-2 sm:px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] sm:text-xs hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                        >
                          <UserPlus size={10} className="sm:hidden" />
                          <UserPlus size={12} className="hidden sm:block" />
                          <span className="sm:hidden">Assign</span>
                          <span className="hidden sm:inline">Assign Executive</span>
                        </button>
                        <button
                          onClick={handleBulkUnassign}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-gray-600 text-white rounded text-[10px] sm:text-xs hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                        >
                          <UserX size={10} className="sm:hidden" />
                          <UserX size={12} className="hidden sm:block" />
                          <span className="sm:hidden">Unassign</span>
                          <span className="hidden sm:inline">Unassign Executive</span>
                        </button>

                      </>
                    )}
                    {canUpdate && (
                      <>
                        <button
                          onClick={() => handleBulkMakePublic()}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] sm:text-xs hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Public</span>
                          <span className="hidden sm:inline">Mark Public</span>
                        </button>
                        <button
                          onClick={() => handleBulkMakePrivate()}
                          disabled={bulkLoading}
                          className="px-2 sm:px-2.5 py-1 bg-gray-600 text-white rounded text-[10px] sm:text-xs hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          <span className="sm:hidden">Private</span>
                          <span className="hidden sm:inline">Mark Private</span>
                        </button>
                      </>
                    )}
                    {canExport && (
                      <button
                        onClick={handleBulkExport}
                        disabled={bulkLoading}
                        className="px-2 sm:px-2.5 py-1 bg-purple-600 text-white rounded text-[10px] sm:text-xs hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        Export
                      </button>
                    )}
                    {canBulkDelete && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkLoading}
                        className="px-2 sm:px-2.5 py-1 bg-red-600 text-white rounded text-[10px] sm:text-xs hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    )}

                    {/* Tags Button with Dropdown */}
                    {(canUpdate || canAssign) && (
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBulkTagsMenuOpen(!bulkTagsMenuOpen);
                            setActiveTagPicker(null);
                          }}
                          className="px-2 sm:px-2.5 py-1 bg-gray-800 text-white rounded text-[10px] sm:text-xs hover:bg-gray-900 transition-colors whitespace-nowrap"
                        >
                          Tags
                        </button>

                        {bulkTagsMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => {
                                setBulkTagsMenuOpen(false);
                                setActiveTagPicker(null);
                              }}
                            />
                            <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] sm:min-w-[230px] left-0 sm:right-0 sm:left-auto">
                              <div className="p-2 sm:p-3">
                                <div className="text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">Bulk Tag Operations</div>
                                <div className="tag-picker-container">
                                  <TagPickerRow
                                    label="Add"
                                    knownTags={knownTagsAll}
                                    selectedPropertyIds={selectedProperties}
                                    propTags={propTags}
                                    onApply={(tags) => {
                                      handleBulkAddTags(tags);
                                      setBulkTagsMenuOpen(false);
                                      setActiveTagPicker(null);
                                    }}
                                    isOpen={activeTagPicker === 'add'}
                                    onToggle={() => {
                                      if (activeTagPicker && activeTagPicker !== 'add') {
                                        setActiveTagPicker('add');
                                      } else {
                                        setActiveTagPicker(activeTagPicker === 'add' ? null : 'add');
                                      }
                                    }}
                                    onClose={() => setActiveTagPicker(null)}
                                  />
                                  <TagPickerRow
                                    label="Remove"
                                    knownTags={knownTagsAll}
                                    selectedPropertyIds={selectedProperties}
                                    propTags={propTags}
                                    onApply={(tags) => {
                                      handleBulkRemoveTags(tags);
                                      setBulkTagsMenuOpen(false);
                                      setActiveTagPicker(null);
                                    }}
                                    isOpen={activeTagPicker === 'remove'}
                                    onToggle={() => {
                                      if (activeTagPicker && activeTagPicker !== 'remove') {
                                        setActiveTagPicker('remove');
                                      } else {
                                        setActiveTagPicker(activeTagPicker === 'remove' ? null : 'remove');
                                      }
                                    }}
                                    onClose={() => setActiveTagPicker(null)}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Clear button - hidden on mobile */}
                <button
                  onClick={() => setSelectedProperties([])}
                  className="hidden sm:block text-blue-600 hover:text-blue-800 transition-colors"
                  title="Clear selection"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

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
            tagsOptions={knownTags.map(t => ({ label: t, value: t }))}
            executiveOptions={salesExecutives.map(ex => ({
              label: ex.name,
              value: String(ex.id)
            }))}
            executivesLoading={executivesLoading}
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
          <div className="flex-1 overflow-hidden">
            {viewMode === 'grid' ? (
              <div className="p-2 sm:p-3 h-full overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {paginatedProperties.map((property) => (
                    <div key={property.id} className="bg-slate-50/20 hover:bg-white rounded-2xl border border-slate-100 hover:border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-visible flex flex-col h-full">
                      {/* Image Section */}
                      <div
                        className="relative overflow-hidden cursor-pointer flex-shrink-0 border-b border-slate-100 rounded-t-2xl"
                        role="button"
                        tabIndex={0}
                        aria-label="Open property details"
                        onClick={() => handleViewProperty(property)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleViewProperty(property);
                        }}
                      >
                        <ImageWithDebug
                          srcCandidate={getFirstDisplayPhotoUrl(property.photos)}
                          alt={dash(property.title)}
                          className="w-full h-36 sm:h-40 rounded-md transition-transform duration-300 ease-out group-hover:scale-105 object-cover object-center"
                          propertyCtx={{ title: property.title, propertyId: property.propertyId }}
                        />

                        {/* Checkbox */}
                        {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                          <div className="absolute top-2 left-2">
                            <input
                              type="checkbox"
                              checked={selectedProperties.includes(property.id)}
                              onChange={() => handlePropertySelection(property.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 focus:ring-orange-500"
                              style={{ accentColor: '#e67e22' }}
                            />
                          </div>
                        )}

                        {/* Tags and Badges */}
                        <div className="absolute top-2 right-2 flex max-w-[70%] flex-wrap gap-1 justify-end">
                          <PropertyTags
                            tags={propTags[String(property.id)] || []}
                            onClickTag={handleClickTag}
                          />
                          {property.isPublic ? (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-50 text-green-700 ring-1 ring-green-200">
                              PUBLIC
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200">
                              PRIVATE
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute bottom-2 left-2">
                          {getStatusBadge(property.status, true)}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-2 sm:p-2.5 flex flex-col flex-1">
                        {/* Title (2BHK Flat • Society Name) and Property ID */}
                        {(() => {
                          const unitAndSubtype = [
                            (property.unitType && property.unitType !== ' - ') ? property.unitType : '',
                            (property.subtype && property.subtype !== ' - ') ? property.subtype : '',
                          ].filter(Boolean).join(' ');

                          const societyName = property.society || (property as any).society_name || (property as any).societyName || '';
                          const leftTitle = [unitAndSubtype, societyName].filter(Boolean).join(' • ') || property.title || 'Property';

                          return (
                            <div className="flex items-start justify-between gap-1.5 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="text-[11.5px] font-bold truncate text-[#0f2b3d]" title={leftTitle}>
                                  {unitAndSubtype && <span className="text-[#0f2b3d]">{unitAndSubtype}</span>}
                                  {unitAndSubtype && societyName && <span className="text-gray-400 font-normal mx-1"></span>}
                                  {societyName && <span className="text-gray-800">{societyName}</span>}
                                  {!unitAndSubtype && !societyName && (property.title || 'Property')}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 text-right">
                                <span className="text-[9px] font-semibold text-gray-400">
                                  {dash(property.propertyId || property.id)}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Price & Executive row */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="text-sm font-bold truncate" style={{ color: '#e67e22' }}>
                            {formatCurrency(property.budget)}
                          </div>
                          {property.assignedTo && (
                            <div className="flex-shrink-0">
                              <ExecutiveBadge assignedTo={property.assignedTo} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-0.5 mb-1.5">
                          <div className="flex items-center justify-between text-[9.5px] text-gray-500 gap-1.5">
                            <div className="flex items-center gap-1 min-w-0">
                              <Building size={10} className="flex-shrink-0 text-slate-400" />
                              <span className="truncate">
                                {property.unitType && property.unitType !== ' - ' ? `${property.unitType}` : 'Unit'}
                                {property.carpetArea ? ` • ${dash(property.carpetArea)} sq ft` : ''}
                              </span>
                            </div>
                            {(() => {
                              const cleanFloorNo = (val: any) => {
                                if (!val || val === '-' || val === ' - ') return '';
                                const str = String(val).trim();
                                const match = str.match(/\d+/);
                                return match ? match[0] : (str !== '-' ? str : '');
                              };

                              const floorNo = cleanFloorNo(property.floor || (property as any).floor_no || (property as any).floorNumber);
                              const totalNo = cleanFloorNo(property.totalFloors || (property as any).total_floors || (property as any).totalFloor);
                              const hasFloor = Boolean(floorNo || totalNo);

                              return (
                                <div className="flex items-center gap-0.5 flex-shrink-0 text-right pr-8">
                                  <Layers size={10} className="flex-shrink-0 text-slate-400" />
                                  <span className="font-medium text-gray-500">Floor:</span>
                                  <span className="text-[9.5px] font-bold">
                                    {hasFloor ? (
                                      <>
                                        {totalNo ? <span className="text-red-500 font-bold">{totalNo}</span> : <span className="text-gray-400 font-normal">-</span>}
                                        <span className="text-gray-400 font-normal mx-0.5">/</span>
                                        {floorNo ? <span className="text-green-600 font-bold">{floorNo}</span> : <span className="text-gray-400 font-normal">-</span>}
                                      </>
                                    ) : (
                                      <span className="text-gray-400 font-normal">-/-</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                            <MapPin size={10} className="flex-shrink-0" />
                            <span className="truncate">{[property.location, property.city].filter(Boolean).join(', ') || ' - '}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9.5px] text-gray-500">
                            <User size={10} className="flex-shrink-0" />
                            <span className="truncate">{dash(property.seller?.name)}</span>
                          </div>
                        </div>

                        {/* Stage and Visits */}
                        <div className="flex items-center justify-between mb-1.5">
                          {getStageBadge(property.stage, true)}
                          <div className="flex items-center gap-1 text-[9px] text-gray-400">
                            <Eye size={9} />
                            <span>{viewsMap[String(property.id)]?.total_views ?? 0} views</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 mt-auto relative">
                          <button
                            onClick={() => handleViewProperty(property)}
                            className="flex-1 py-1.5 text-[10.5px] font-semibold rounded-lg transition-all hover:opacity-95 shadow-sm active:scale-[0.98]"
                            style={{ background: O, color: 'white' }}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleOpenLinkSellerModal(property)}
                            className="p-1.5 rounded-lg transition-all text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/50 flex-shrink-0 flex items-center justify-center"
                            title={property.seller?.name ? `Linked Seller: ${property.seller.name} (Click to change)` : "Link Seller"}
                          >
                            <Link2 size={13} />
                          </button>
                          <button
                            onClick={() => handleBuyerMatching(property)}
                            className="relative flex items-center justify-center w-7 h-7 rounded-lg transition-all text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 flex-shrink-0"
                            title="Match Buyers"
                          >
                            <Users size={13} className="text-emerald-600" />

                            {/* Buyer Count Badge */}
                            <span
                              className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 flex items-center justify-center rounded-full bg-green-800 text-white text-[8px] font-bold leading-none border-2 border-white shadow-sm"
                            >
                              {property.interestedBuyers ||
                                (property.matchedBuyers?.length ??
                                  (Number(property.id) % 4 + 2))}
                            </span>
                          </button>

                          {/* More Options Dropdown - NO BACKDROP, allows scrolling */}
                          <div className="relative">
                            <button
                              id={`more-btn-${property.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === property.id ? null : property.id);
                              }}
                              className="p-1.5 rounded-lg transition-all border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                              style={{ color: '#64748b' }}
                              title="More Options"
                            >
                              <MoreHorizontal size={12} />
                            </button>

                            {openDropdownId === property.id && (
                              <div
                                id={`more-menu-${property.id}`}
                                className="absolute z-[9999] bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[150px]"
                              >
                                <div className="py-1">
                                  {property.assignedTo ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnassignExecutive(property.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 w-full text-left"
                                    >
                                      <UserX size={10} />
                                      <span>Unassign</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignExecutive(property);
                                        setOpenDropdownId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-gray-50 w-full text-left"
                                      style={{ color: '#0f2b3d' }}
                                    >
                                      <UserPlus size={10} />
                                      <span>Assign</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenLinkSellerModal(property);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-gray-50 w-full text-left"
                                    style={{ color: '#0f2b3d' }}
                                  >
                                    <Link2 size={10} />
                                    <span>Link Seller</span>
                                  </button>
                                  {canUpdate && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProperty(property);
                                        setOpenDropdownId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-gray-50 w-full text-left"
                                      style={{ color: '#0f2b3d' }}
                                    >
                                      <Edit size={10} />
                                      <span>Edit</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePublic(property.id);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-gray-50 w-full text-left"
                                    style={{ color: '#0f2b3d' }}
                                  >
                                    <Globe size={10} />
                                    <span>{property.isPublic ? 'Make Private' : 'Make Public'}</span>
                                  </button>
                                  {canDelete && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProperty(property.id, property.title);
                                        setOpenDropdownId(null);
                                      }}
                                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 w-full text-left"
                                    >
                                      <Trash2 size={10} />
                                      <span>Delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // List View - Made responsive with horizontal scroll on mobile
              <div className="bg-white h-full overflow-x-auto overflow-y-auto px-5">
                <div className="min-w-[800px] md:min-w-full">
                  <div className="flex justify-end items-center mb-2 pt-2 gap-2">
                    {canExport && (
                      <button
                        onClick={handleBulkExport}
                        disabled={bulkLoading}
                        className="flex items-center justify-center px-2.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-[11px] sm:text-xs disabled:opacity-50 gap-1.5 font-medium transition-colors"
                      >
                        <Download size={12} />
                        <span>Export</span>
                      </button>
                    )}
                  </div>
                  <table className="w-full bg-white text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                          <th className="px-3 py-3 text-left w-8">
                            <input
                              type="checkbox"
                              checked={selectedProperties.length === paginatedProperties.length && paginatedProperties.length > 0}
                              onChange={handleSelectAll}
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-orange-500"
                              style={{ accentColor: '#e67e22' }}
                            />
                          </th>
                        )}
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap w-10">S.No.</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Property Details</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Location & Seller</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Specifications</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status & Stage</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Assigned To</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Performance</th>
                        {(canUpdate || canDelete || canAssign) && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {paginatedProperties.map((p, index) => (
                        <tr key={p.id} className="group hover:bg-gray-50 transition-colors">
                          {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                            <td className="px-3 py-3">
                              <input
                                type="checkbox"
                                checked={selectedProperties.includes(p.id)}
                                onChange={() => handlePropertySelection(p.id)}
                                className="h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-orange-500"
                                style={{ accentColor: '#e67e22' }}
                              />
                            </td>
                          )}
                          <td className="px-2 py-3 text-center text-xs font-semibold text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center space-x-3">

                              {/* Image */}
                              <button
                                type="button"
                                className="relative flex-shrink-0"
                                onClick={() => handleViewProperty(p)}
                                aria-label="Open property details"
                              >
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                  <ImageWithDebug
                                    srcCandidate={getFirstDisplayPhotoUrl(p.photos)}
                                    alt={dash(p.title)}
                                    className="w-full h-full object-cover"
                                    propertyCtx={{ title: p.title, propertyId: p.propertyId }}
                                  />
                                </div>
                              </button>

                              {/* Right Details Clickable */}
                              <button
                                type="button"
                                onClick={() => handleViewProperty(p)}
                                className="text-left cursor-pointer"
                                aria-label="View property details"
                              >
                                <div>
                                  <div
                                    className="font-semibold text-[11px] truncate max-w-[100px]"
                                    style={{ color: "#0f2b3d" }}
                                  >
                                    {(p.type && p.type !== " - ") && (
                                      <span className="mr-1">{p.type}</span>
                                    )}

                                    {(p.unitType && p.unitType !== " - ") && (
                                      <span className="mr-1">{p.unitType}</span>
                                    )}
                                  </div>

                                  <div className="text-[9px] text-gray-400">
                                    {dash(p.propertyId)}
                                  </div>

                                  <div
                                    className="text-[10px] font-semibold"
                                    style={{ color: "#e67e22" }}
                                  >
                                    {formatCurrency(p.budget)}
                                  </div>
                                </div>
                              </button>

                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="min-w-[140px]">
                              <div className="text-[11px] font-medium truncate max-w-[150px]" style={{ color: '#0f2b3d' }}>{[p.location, p.city].filter(Boolean).join(', ') || ' - '}</div>
                              <div className="text-[9px] text-gray-500 truncate max-w-[150px]">{dash(p.society)}</div>
                              <div className="text-[9px] text-gray-500 truncate max-w-[150px]">Seller: {dash(p.seller?.name)}</div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-0.5 text-[10px] text-gray-600 min-w-[130px]">
                              <div>{dash(p.unitType)} • {dash(p.carpetArea)} sq ft</div>
                              <div>Floor {dash(p.floor)} of {dash(p.totalFloors)}</div>
                              <PropertyTags tags={propTags[String(p.id)] || []} className="mt-1" />
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2">
                            <div className="space-y-0.5 min-w-[80px] sm:min-w-[120px]">
                              <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
                                {/* Use responsive compact - compact on mobile, full on desktop */}
                                <span className="sm:hidden">
                                  {getStatusBadge(p.status, true)}
                                  {getStageBadge(p.stage, true)}
                                </span>
                                <span className="hidden sm:inline-flex sm:flex-wrap sm:gap-1">
                                  {getStatusBadge(p.status, false)}
                                  {getStageBadge(p.stage, false)}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-0.5 sm:h-1">
                                <div
                                  className="h-0.5 sm:h-1 rounded-full"
                                  style={{ width: `${Number(p.stageProgress) || 0}%`, background: '#e67e22' }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2">
                            <div className="min-w-[80px] sm:min-w-[100px]">
                              {p.assignedTo && p.assignedTo.name && p.assignedTo.name.trim() !== "" ? (
                                <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-md text-[9px] sm:text-[10px] whitespace-nowrap">
                                  <UserCheck size={8} className="sm:hidden" />
                                  <UserCheck size={10} className="hidden sm:block" />
                                  <span className="font-medium truncate max-w-[70px] sm:max-w-[100px]">{p.assignedTo.name}</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAssignExecutive(p)}
                                  className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] rounded border transition-colors whitespace-nowrap"
                                  style={{ color: '#0f2b3d', borderColor: '#e2e8f0' }}
                                >
                                  <UserPlus size={8} className="sm:hidden" />
                                  <UserPlus size={10} className="hidden sm:block" />
                                  <span>Assign</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-0.5 text-[10px] text-gray-500 whitespace-nowrap">
                              <div className="flex items-center gap-1"><Eye size={9} />{viewsMap[String(p.id)]?.total_views ?? 0} views
                              </div>
                              <div className="flex items-center gap-1"><Users size={9} />{Number(p.interestedBuyers) || 0} buyers</div>
                            </div>
                          </td>
                          {(canUpdate || canDelete || canAssign) && (
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleViewProperty(p)} className="p-1 rounded hover:bg-gray-100" title="View Details">
                                  <Eye size={12} style={{ color: '#0f2b3d' }} />
                                </button>
                                <button
                                  onClick={() => handleOpenLinkSellerModal(p)}
                                  className="p-1 rounded hover:bg-blue-50 text-blue-600"
                                  title={p.seller?.name ? `Linked: ${p.seller.name}` : "Link Seller"}
                                >
                                  <UserPlus size={12} />
                                </button>
                                <button onClick={() => handleBuyerMatching(p)} className="flex items-center gap-0.5 p-1 rounded hover:bg-orange-50 text-[#e67e22]" title="Match Buyers">
                                  <Users size={12} />
                                  <span className="text-[9px] font-bold">
                                    {p.interestedBuyers || (p.matchedBuyers?.length ?? (Number(p.id) % 4 + 2))}
                                  </span>
                                </button>
                                {p.assignedTo && p.assignedTo.name ? (
                                  <button onClick={() => handleUnassignExecutive(p.id)} className="p-1 rounded hover:bg-red-50" title="Unassign">
                                    <UserX size={12} style={{ color: '#ef4444' }} />
                                  </button>
                                ) : (
                                  <button onClick={() => handleAssignExecutive(p)} className="p-1 rounded hover:bg-gray-100" title="Assign">
                                    <UserPlus size={12} style={{ color: '#0f2b3d' }} />
                                  </button>
                                )}
                                {canUpdate && (
                                  <button onClick={() => handleEditProperty(p)} className="p-1 rounded hover:bg-gray-100" title="Edit">
                                    <Edit size={12} style={{ color: '#e67e22' }} />
                                  </button>
                                )}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(openDropdownId === p.id ? null : p.id);
                                    }}
                                    className="p-1 rounded hover:bg-gray-100"
                                    title="More"
                                  >
                                    <MoreHorizontal size={12} style={{ color: '#64748b' }} />
                                  </button>
                                  {openDropdownId === p.id && (
                                    <div className="absolute z-50 top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]">
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            handleOpenLinkSellerModal(p);
                                            setOpenDropdownId(null);
                                          }}
                                          className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-gray-50 w-full text-left"
                                          style={{ color: '#0f2b3d' }}
                                        >
                                          <Link2 size={10} />
                                          <span>Link Seller</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleTogglePublic(p.id);
                                            setOpenDropdownId(null);
                                          }}
                                          className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-gray-50 w-full text-left"
                                          style={{ color: '#0f2b3d' }}
                                        >
                                          <Globe size={10} />
                                          <span>{p.isPublic ? 'Make Private' : 'Make Public'}</span>
                                        </button>
                                        {canDelete && (
                                          <button
                                            onClick={() => {
                                              handleDeleteProperty(p.id, p.title);
                                              setOpenDropdownId(null);
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 w-full text-left"
                                          >
                                            <Trash2 size={10} />
                                            <span>Delete</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredProperties.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-2 sm:px-4 lg:px-6 py-2 sticky bottom-0 mx-4 rounded-md ">

            <div className="flex items-center justify-between gap-2">

              {/* Left Text + Per Page Dropdown */}
              <div className="flex items-center gap-2">
                <div className="text-[11px] sm:text-sm text-gray-700 whitespace-nowrap">
                  Showing {filteredProperties.length ? startIndex + 1 : 0}-
                  {Math.min(startIndex + itemsPerPage, filteredProperties.length)} of {filteredProperties.length}
                </div>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-1.5 py-1 border border-gray-300 rounded-md text-[11px] sm:text-xs bg-white"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={300}>300</option>
                  <option value={400}>400</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={999999}>All</option>
                </select>
              </div>

              {/* Right Pagination */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">

                {/* Prev */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                >
                  <ChevronLeft size={12} />
                </button>

                {/* Pages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
                >
                  <ChevronRight size={12} />
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

        {/* Executive Assignment Modal */}
        <AssignExecutiveModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setAssigningProperty(null);
          }}
          executives={salesExecutives}
          selectedProperties={selectedProperties}
          onAssign={handleAssignSubmit}
          isBulk={!assigningProperty && selectedProperties.length > 0}
        />

        {/* Modals */}
        {showPropertyForm && (
          <PropertyFormModal
            key={editingProperty ? `edit-${editingProperty.id}` : 'create-new'}
            isOpen={showPropertyForm}
            onClose={() => { setShowPropertyForm(false); setEditingProperty(null); }}
            mode={editingProperty ? 'edit' : 'create'}
            propertyId={editingProperty?.id}
            initialData={editingProperty ? buildInitialData(editingProperty) : null}
            onSubmit={async () => {
              await loadProperties();
              // toast.success(editingProperty ? 'Property updated successfully' : 'Property created successfully');
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
            onImport={(created) => {
              const normalized = (Array.isArray(created) ? created : []).map((r: any, i: number) =>
                normalizeProperty(r, i)
              );
              if (normalized.length) {
                setProperties(prev => [...normalized, ...prev]);
              }
            }}
            onDone={async () => {
              await loadProperties();
              setShowImportProperties(false);
            }}
          />
        )}

        {/* Link Seller to Property Modal */}
        {showLinkSellerModal && linkingPropertyForSeller && (() => {
          const linkedSellerName = linkingPropertyForSeller.seller?.name || (linkingPropertyForSeller as any).seller_name;
          const linkedSellerId = linkingPropertyForSeller.seller?.id || (linkingPropertyForSeller as any).seller_id;
          const linkedSellerPhone = linkingPropertyForSeller.seller?.phone || (linkingPropertyForSeller as any).seller_phone || '';
          const linkedSellerEmail = linkingPropertyForSeller.seller?.email || (linkingPropertyForSeller as any).seller_email || '';

          const cleanSellerId = String(linkedSellerId || '').trim();
          const cleanSellerName = String(linkedSellerName || '').trim().replace(/\s+/g, '');
          const hasLinkedSeller = Boolean(
            cleanSellerId &&
            cleanSellerId !== '0' &&
            cleanSellerId !== 'null' &&
            cleanSellerId !== 'undefined' &&
            cleanSellerName &&
            cleanSellerName !== '-' &&
            cleanSellerName !== '—'
          );

          const getInitials = (name: string) => {
            const cleaned = String(name || '').replace(/^(mr|mrs|ms|dr|miss)\.?\s+/i, '').trim();
            const parts = cleaned.split(/\s+/).filter(Boolean);
            if (parts.length === 0) return 'S';
            if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
          };

          // Format phone with +91 country code
          const formatPhone = (phone: string) => {
            if (!phone) return '';
            const digits = String(phone).replace(/\D/g, '');
            const last10 = digits.slice(-10);
            return `+91 ${last10}`;
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="px-4 py-3 bg-[#0f2b3d] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 flex-shrink-0">
                      <UserPlus size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {hasLinkedSeller ? (
                        <>
                          <h3 className="text-sm font-bold truncate">Linked Seller: {linkedSellerName}</h3>
                          <p className="text-[9px] text-emerald-400 font-medium">Currently Associated</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-sm font-bold">Link Seller to Property</h3>
                          <p className="text-[10px] text-white/70 truncate">
                            Property: <span className="font-semibold text-white">{linkingPropertyForSeller.title || `${linkingPropertyForSeller.unitType || ''} ${linkingPropertyForSeller.subtype || ''}`.trim() || 'Property'}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    {hasLinkedSeller && (
                      <button
                        onClick={handleUnlinkSellerFromProperty}
                        disabled={savingSellerLink}
                        className="px-2.5 py-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                      >
                        <UserX size={12} />
                        <span>Unlink Seller</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowLinkSellerModal(false);
                        setLinkingPropertyForSeller(null);
                      }}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {hasLinkedSeller ? (
                  /* Linked Seller Details Card - Property ID, phone, email all in one row */
                  <div className="p-3 border-b border-gray-100">
                    <div className="p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
                          {getInitials(linkedSellerName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-sm text-gray-800 block truncate">{linkedSellerName}</span>
                          <div className="flex items-center gap-3 text-[11px] text-gray-600 flex-wrap mt-0.5">
                            <span className="text-gray-500">
                              Property ID: <span className="font-semibold text-[#e67e22]">{linkingPropertyForSeller.propertyId || `REX${String(linkingPropertyForSeller.id).padStart(4, "0")}`}</span>
                            </span>
                            {linkedSellerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone size={12} className="text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-gray-700">{formatPhone(linkedSellerPhone)}</span>
                              </span>
                            )}
                            {linkedSellerEmail && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail size={12} className="text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-gray-700 truncate">{linkedSellerEmail}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Search */}
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={sellerSearchQuery}
                          onChange={(e) => setSellerSearchQuery(e.target.value)}
                          placeholder="Search sellers by name, phone, email, location..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Sellers List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh]">
                      {loadingSellers ? (
                        <div className="py-8 text-center text-xs text-gray-500">Loading sellers...</div>
                      ) : filteredSellersForLink.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                          {sellerSearchQuery ? 'No sellers found matching your search.' : 'No sellers available.'}
                        </div>
                      ) : (
                        filteredSellersForLink.map((s: any) => {
                          const sId = s.id || s.seller_id || s._id;
                          const isCurrent = linkingPropertyForSeller.seller?.name && String(linkingPropertyForSeller.seller?.name).toLowerCase() === String(s.name || '').toLowerCase();

                          return (
                            <div
                              key={sId}
                              className="p-2.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all flex items-center justify-between gap-3 bg-white"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                  {getInitials(s.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-xs text-gray-800 truncate">{s.name || 'Unnamed Seller'}</span>
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-green-100 text-green-700">
                                        Currently Linked
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                                    {s.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone size={10} className="text-gray-400" /> {formatPhone(s.phone)}
                                      </span>
                                    )}
                                    {s.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin size={10} className="text-gray-400" /> {s.location}
                                      </span>
                                    )}
                                    {s.email && (
                                      <span className="flex items-center gap-1 truncate max-w-[160px]">
                                        <Mail size={10} className="text-gray-400" /> {s.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleLinkSellerToProperty(s)}
                                disabled={savingSellerLink}
                                className="px-3 py-1.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 disabled:opacity-50"
                              >
                                <Link2 size={12} />
                                <span>{isCurrent ? 'Re-link' : 'Link'}</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}

                {/* Footer */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => {
                      setShowLinkSellerModal(false);
                      setLinkingPropertyForSeller(null);
                    }}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
};

/* ---------------------- Badges ---------------------- */
function getStatusBadge(status: string, compact: boolean = false) {
  const cfg: any = {
    'Available': { bg: 'bg-green-100', text: 'text-green-700', label: 'Available', compactLabel: 'Avail', icon: compact ? '●' : '🟢' },
    'Sold': { bg: 'bg-red-100', text: 'text-red-600', label: 'Sold', compactLabel: 'Sold', icon: compact ? '●' : '🔴' },
    'Under Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Under Negotiation', compactLabel: 'Negot.', icon: compact ? '●' : '🟡' },
    'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'On Hold', compactLabel: 'Hold', icon: compact ? '●' : '⚫' },
    'Finalization': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Finalization', compactLabel: 'Final', icon: compact ? '●' : '🟣' },
    ' - ': { bg: 'bg-gray-100', text: 'text-gray-700', label: ' - ', compactLabel: ' - ', icon: compact ? '●' : '•' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: dash(status), compactLabel: dash(status), icon: compact ? '●' : '•' };

  const displayLabel = compact ? cfg.compactLabel : cfg.label;

  if (compact) {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
        <span className="mr-0.5 text-[6px] sm:text-[8px]">{cfg.icon}</span> {displayLabel}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {displayLabel}
    </span>
  );
}

function getStageBadge(stage: string, compact: boolean = false) {
  const cfg: any = {
    'initial_contact': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact', compactLabel: 'Initial Contact', icon: '📞' },
    'property_collection': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Property Collection', compactLabel: 'Property Collection', icon: '🏠' },
    'mandate_signed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Mandate Signed', compactLabel: 'Mandate Signed', icon: '✅' },
    'selling_process': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Selling Process', compactLabel: 'Selling Process', icon: '🔄' },
    'deal_closure': { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Deal Closure', compactLabel: 'Deal Closure', icon: '📋' },
  }[stage] || { bg: 'bg-gray-100', text: 'text-gray-700', label: dash(stage), compactLabel: dash(stage), icon: '•' };

  const displayLabel = compact ? cfg.compactLabel : cfg.label;

  if (compact) {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
        <span className="mr-0.5 text-[6px] sm:text-[8px]">{cfg.icon}</span> {displayLabel}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {displayLabel}
    </span>
  );
}

export default PropertiesPage; 