import React, { useState, useEffect, useMemo, CSSProperties } from 'react';
import {
  Home, Plus, Search, Filter, Eye, Edit, Trash2, Download, Upload,
  Grid, List, MapPin, Building, Users, MoreHorizontal, X,
  ChevronLeft, ChevronRight, Globe, Award, CheckCircle, User,
  UserCheck, UserPlus,
  UserX
} from 'lucide-react';
import type { LucideIcon } from "lucide-react";
import PropertyViewPage from '../../components/properties/PropertyViewPage';
import BuyerMatchingModal from '../../components/properties/BuyerMatchingModal';
import BuyerListModal from '../../components/properties/BuyerListModal';
import ImportPropertiesModal from '../../components/properties/ImportPropertiesModal';
import { propertiesAPI } from '../../lib/propertiesAPI';
import { toast } from 'react-toastify';
import PropertyFormModal from './components/PropertyFormModal';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';

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

const getDisplayName = (u: any): string => {
  const pick = [
    u?.assigned_to_full_name,
    u?.full_name,
    u?.fullName,
    (u?.first_name && u?.last_name)
      ? `${u.salutation ? u.salutation + ' ' : ''}${u.first_name} ${u.last_name}`
      : '',
    u?.name,
    u?.username,
    u?.email,
  ].find(v => typeof v === 'string' && v.trim());
  return (pick || 'Unnamed Executive').trim();
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
                {executive.department && ` - ${executive.department}`}
                {executive.role && ` (${executive.role})`}
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
      className={`bg-gray-200 text-gray-500 font-normal flex items-center justify-center text-center ${className}`}
      style={{ objectFit: fitCover ? 'cover' : undefined }}
    >
      <span className="text-[8px] px-1 leading-tight">No Image</span>
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
    existingPhotos: (p.photos || []).map((url, idx) => ({
      id: String(idx + 1),
      url,
      name: `photo-${idx + 1}.jpg`,
    })),
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
  const [bulkTagsMenuOpen, setBulkTagsMenuOpen] = useState(false);

  const [activeTagPicker, setActiveTagPicker] = useState<'add' | 'remove' | null>(null);
  useEffect(() => {
    async function fetchViewStats() {
      const res = await viewsAPI.getAll(false); // false → total views
      const resUnique = await viewsAPI.getAll(true); // true → unique views

      setTotalViews(res?.rows?.reduce((sum: number, row: any) => sum + (row?.total_views || 0), 0));
      setTotalUniqueViews(resUnique?.rows?.reduce((sum: number, row: any) => sum + (row?.unique_views || 0), 0));
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

        const items = res?.items ?? res?.data ?? res ?? [];

        if (Array.isArray(items)) {
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
        const updates: Record<string, string[]> = {};
        const tagSet = new Set(knownTags);

        for (const p of newProperties) {
          try {
            const row = await propertyTagsAPI.getById(p.id);
            const tags: string[] = Array.isArray(row?.tags) ? row.tags : [];
            updates[String(p.id)] = tags;
            tags.forEach(t => tagSet.add(t));
          } catch (error) {
            console.warn(`Failed to load tags for property ${p.id}:`, error);
          }
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
        console.error('Error loading tags:', error);
      }
    };

    loadTagsForNewProperties();
  }, [properties.length]); // Only runs when properties array length changes

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
      { id: 'sold', label: 'Sold', count: properties.filter(p => p.status === 'Sold').length, color: 'purple' },
      { id: 'negotiation', label: 'Under Negotiation', count: properties.filter(p => p.status === 'Under Negotiation').length, color: 'orange' },
      { id: 'public', label: 'Public Listings', count: properties.filter(p => p.isPublic).length, color: 'indigo' },
      { id: 'hot', label: 'Hot Properties', count: properties.filter(p => (Number(p.hotLeads) || 0) > 2).length, color: 'red' },
      { 
      id: 'new_listing', 
      label: 'New Listings', 
count: properties.filter(p => {
  const ls = p.leadSource || '';
  return ls === 'seller_portal' || ls.includes('seller_portal');
}).length,
      color: 'orange' 
    },
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
        const price = Number(p.budget);
        if (!price || price <= 0) return false;

        const minBudget = filters.minBudget ? Number(filters.minBudget) : 0;
        const maxBudget = filters.maxBudget ? Number(filters.maxBudget) : Infinity;

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
    

  const handleDeleteProperty = async (propertyId: number | string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await propertiesAPI.deleteProperty(propertyId.toString());
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        toast.success("Property deleted successfully!");

        // Remove from loaded property IDs
        setLoadedPropertyIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(String(propertyId));
          return newSet;
        });
      } catch (error) {
        console.error("Failed to delete property:", error);
        toast.error("Error deleting property. Please try again.");
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

        // Remove from loaded property IDs
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
      <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs">
        <UserCheck size={10} />
        <span className="font-medium">{assignedTo.name}</span>
        {assignedTo.department && (
          <span className="text-[10px] text-blue-500">({assignedTo.department})</span>
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
`}</style>
    <div className="h-[91.7vh] flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4"> */}
      <div className="sticky top-0  bg-gray-50">

        {/* Header */}
<div className=" bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">    
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
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

       <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 sm:gap-2 mt-2 sm:mt-3">
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

  {/* Assigned Properties Card - Hidden on mobile (2 cols), visible from sm */}
  <div className="hidden sm:block rounded-lg p-1.5 sm:p-2 transition-all hover:shadow-sm col-span-2 sm:col-span-1" style={{ background: '#e67e2210', border: '1px solid #e67e2220' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider" style={{ color: '#e67e22' }}>Assigned</p>
        <p className="text-sm sm:text-base font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
          {properties.filter((p) => p.assignedTo).length}
        </p>
      </div>
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center" style={{ background: '#e67e2220' }}>
        <UserCheck size={10} className="sm:hidden" style={{ color: '#e67e22' }} />
        <UserCheck size={12} className="hidden sm:block" style={{ color: '#e67e22' }} />
      </div>
    </div>
  </div>

  {/* Mobile Assigned Card - Shows only on mobile, full width */}
  <div className="sm:hidden rounded-lg p-1.5 transition-all hover:shadow-sm col-span-2" style={{ background: '#e67e2210', border: '1px solid #e67e2220' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[7px] font-medium uppercase tracking-wider" style={{ color: '#e67e22' }}>Assigned</p>
        <p className="text-sm font-bold mt-0.5" style={{ color: '#0f2b3d' }}>
          {properties.filter((p) => p.assignedTo).length}
        </p>
      </div>
      <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: '#e67e2220' }}>
        <UserCheck size={10} style={{ color: '#e67e22' }} />
      </div>
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
      </div>
      {/* ================= END STICKY TOP AREA ================= */}

      {/* Top bar */}
      {/* Top bar */}
<div className="bg-white border-b border-gray-200 px-2 sm:px-4 lg:px-4 py-2 sm:py-3 mx-2 sm:mx-6 mt-2 rounded-md overflow-visible">

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
        <span className="hidden sm:inline">Filters</span>
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
      
      <select
        value={itemsPerPage}
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
        className="px-1.5 py-1 border border-gray-300 rounded-md text-[11px] sm:text-xs"
      >
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>

      {canExport && (
        <button
          onClick={handleBulkExport}
          disabled={bulkLoading}
          className="flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-[11px] sm:text-xs disabled:opacity-50"
        >
          <Download size={12} />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}
    </div>
  </div>

        {selectedProperties.length > 0 && (canUpdate || canAssign || canBulkDelete || canExport) && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg mt-2 overflow-visible">
    {/* Responsive Bulk Actions Bar */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:px-4 sm:py-2.5 gap-3">
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
            <div key={property.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all group overflow-visible flex flex-col h-full" style={{ border: `1px solid #e2e8f0` }}>
              {/* Image Section */}
              <div
                className="relative overflow-hidden cursor-pointer flex-shrink-0"
                role="button"
                tabIndex={0}
                aria-label="Open property details"
                onClick={() => handleViewProperty(property)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleViewProperty(property);
                }}
              >
                <ImageWithDebug
                  srcCandidate={Array.isArray(property.photos) && property.photos.length > 0 ? property.photos[0] : ''}
                  alt={dash(property.title)}
                  className="w-full h-32 sm:h-36 rounded-t-lg transition-transform duration-300 ease-out group-hover:scale-105 object-cover"
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
                  {getStatusBadge(property.status)}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-2 sm:p-3 flex flex-col flex-1">
                {/* Title and Property ID */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold truncate" style={{ color: '#0f2b3d' }}>
                      {(property.type && property.type !== ' - ') && <span className="mr-1">{property.type}</span>}
                      {(property.unitType && property.unitType !== ' - ') && <span className="mr-1">{property.unitType}</span>}
                      {(property.subtype && property.subtype !== ' - ') && <span className="mr-1">{property.subtype}</span>}
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-400 ml-1">{dash(property.propertyId)}</div>
                </div>

                {/* Price */}
                <div className="text-base font-bold mb-1" style={{ color: '#e67e22' }}>
                  {formatCurrency(property.budget)}
                </div>

                {/* Executive Badge */}
                {property.assignedTo && (
                  <div className="mb-1">
                    <ExecutiveBadge assignedTo={property.assignedTo} />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-0.5 mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Building size={10} />
                    <span className="truncate">
                      {property.unitType && property.unitType !== ' - ' ? `${property.unitType}` : 'Unit'}
                      {property.carpetArea ? ` • ${dash(property.carpetArea)} sq ft` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <MapPin size={10} />
                    <span className="truncate">{[property.location, property.city].filter(Boolean).join(', ') || ' - '}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <User size={10} />
                    <span className="truncate">{dash(property.seller?.name)}</span>
                  </div>
                </div>

                {/* Stage and Visits */}
                <div className="flex items-center justify-between mb-2">
                  {getStageBadge(property.stage)}
                  <div className="flex items-center gap-1 text-[9px] text-gray-400">
                    <Eye size={9} />
                    <span>{Number(property.visits) || 0} views</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 mt-auto relative">
                  <button
                    onClick={() => handleViewProperty(property)}
                    className="flex-1 py-1.5 text-[10px] font-medium rounded transition-all hover:opacity-90"
                    style={{ background: O, color: 'white' }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleBuyerMatching(property)}
                    className="p-1.5 rounded transition-colors"
                    style={{ background: '#e67e2210', color: '#e67e22' }}
                    title="Match Buyers"
                  >
                    <Users size={12} />
                  </button>

                  {/* More Options Dropdown - NO BACKDROP, allows scrolling */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === property.id ? null : property.id);
                      }}
                      className="p-1.5 rounded transition-colors"
                      style={{ background: '#f1f5f9', color: '#64748b' }}
                    >
                      <MoreHorizontal size={12} />
                    </button>

                    {openDropdownId === property.id && (
                      // Dropdown - opens UPWARD, NO backdrop
<div className="absolute z-50 top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px]">                        <div className="py-1">
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
                                handleDeleteProperty(property.id);
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
      // List View
      <div className="bg-white h-full overflow-y-auto mx-5">
        <table className="w-full bg-white text-sm">
<thead className="bg-gray-50 sticky top-0 z-0">
    <tr>
              {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === paginatedProperties.length && paginatedProperties.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-orange-500"
                    style={{ accentColor: '#e67e22' }}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location & Seller</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specifications</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              {(canUpdate || canDelete || canAssign) && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedProperties.map((p) => (
              <tr key={p.id} className="group hover:bg-gray-50 transition-colors">
                {(canUpdate || canDelete || canAssign || canBulkDelete) && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(p.id)}
                      onChange={() => handlePropertySelection(p.id)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-orange-500"
                      style={{ accentColor: '#e67e22' }}
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      className="relative"
                      onClick={() => handleViewProperty(p)}
                      aria-label="Open property details"
                    >
                     <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
  <ImageWithDebug
    srcCandidate={Array.isArray(p.photos) && p.photos.length > 0 ? p.photos[0] : ''}
    alt={dash(p.title)}
    className="w-full h-full object-cover"
    propertyCtx={{ title: p.title, propertyId: p.propertyId }}
  />
</div>
                    </button>
                    <div>
                      <div className="font-semibold text-[11px] truncate" style={{ color: '#0f2b3d' }}>
  {(p.type && p.type !== ' - ') && <span className="mr-1">{p.type}</span>}
  {(p.unitType && p.unitType !== ' - ') && <span className="mr-1">{p.unitType}</span>}
</div>
<div className="text-[9px] text-gray-400 truncate">{dash(p.propertyId)}</div>
<div className="text-[10px] font-semibold truncate" style={{ color: '#e67e22' }}>{formatCurrency(p.budget)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
        <div className="text-[11px] font-medium truncate" style={{ color: '#0f2b3d' }}>{[p.location, p.city].filter(Boolean).join(', ') || ' - '}</div>
<div className="text-[9px] text-gray-500 truncate">{dash(p.society)}</div>
<div className="text-[9px] text-gray-500 truncate">Seller: {dash(p.seller?.name)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5 text-[10px] text-gray-600">
                    <div>{dash(p.unitType)} • {dash(p.carpetArea)} sq ft</div>
                    <div>Floor {dash(p.floor)} of {dash(p.totalFloors)}</div>
                    <PropertyTags tags={propTags[String(p.id)] || []} className="mt-1" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {getStatusBadge(p.status)}
                    {getStageBadge(p.stage)}
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${Number(p.stageProgress) || 0}%`, background: '#e67e22' }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.assignedTo ? (
                    <ExecutiveBadge assignedTo={p.assignedTo} />
                  ) : (
                    <button
                      onClick={() => handleAssignExecutive(p)}
                      className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded border transition-colors"
                      style={{ color: '#0f2b3d', borderColor: '#e2e8f0' }}
                    >
                      <UserPlus size={10} />
                      <span>Assign</span>
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1"><Eye size={9} />{Number(p.visits) || 0} visits</div>
                    <div className="flex items-center gap-1"><Users size={9} />{Number(p.interestedBuyers) || 0} buyers</div>
                  </div>
                </td>
                {(canUpdate || canDelete || canAssign) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleViewProperty(p)} className="p-1 rounded hover:bg-gray-100"><Eye size={12} style={{ color: '#0f2b3d' }} /></button>
                      <button onClick={() => handleBuyerMatching(p)} className="p-1 rounded hover:bg-gray-100"><Users size={12} style={{ color: '#e67e22' }} /></button>
                      {p.assignedTo ? (
                        <button onClick={() => handleUnassignExecutive(p.id)} className="p-1 rounded hover:bg-red-50"><UserX size={12} style={{ color: '#ef4444' }} /></button>
                      ) : (
                        <button onClick={() => handleAssignExecutive(p)} className="p-1 rounded hover:bg-gray-100"><UserPlus size={12} style={{ color: '#0f2b3d' }} /></button>
                      )}
                      {canUpdate && (
                        <button onClick={() => handleEditProperty(p)} className="p-1 rounded hover:bg-gray-100"><Edit size={12} style={{ color: '#e67e22' }} /></button>
                      )}
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === p.id ? null : p.id); }} className="p-1 rounded hover:bg-gray-100"><MoreHorizontal size={12} style={{ color: '#64748b' }} /></button>
                      {openDropdownId === p.id && (
  // Change THIS line
  <div className="absolute z-50 top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]">
                            <div className="py-1">
                              <button onClick={() => { handleTogglePublic(p.id); setOpenDropdownId(null); }} className="flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-gray-50 w-full text-left" style={{ color: '#0f2b3d' }}>
                                <Globe size={10} />
                                <span>{p.isPublic ? 'Make Private' : 'Make Public'}</span>
                              </button>
                              {canDelete && (
                                <button onClick={() => { handleDeleteProperty(p.id); setOpenDropdownId(null); }} className="flex items-center gap-2 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 w-full text-left">
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
    )}
  </div>
)}

      {/* Pagination */}
     {!loading && !error && filteredProperties.length > 0 && (
  <div className="bg-white border-t border-gray-200 px-2 sm:px-4 lg:px-6 py-2 sticky bottom-0 mx-4 rounded-md ">
    
    <div className="flex items-center justify-between gap-2">
      
      {/* Left Text */}
      <div className="text-[11px] sm:text-sm text-gray-700 whitespace-nowrap">
        Showing {filteredProperties.length ? startIndex + 1 : 0}-
        {Math.min(startIndex + itemsPerPage, filteredProperties.length)} of {filteredProperties.length}
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
              className={`px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap ${
                currentPage === page
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
    </div>
    </>
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