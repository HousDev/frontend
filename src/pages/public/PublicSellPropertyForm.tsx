import React, { useState, useEffect, useMemo, useRef } from 'react';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { X, Upload, Plus, FileText, Trash2, Edit, ArrowRight } from 'lucide-react';

import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { sellerAPI } from '@/lib/sellersAPI'
import PriceRangeSelector from '@/components/ui/PriceRangeSelector';

/* ---------------- Types ---------------- */

export interface NearbyPlace {
  name: string;
  distance?: string;
  type?: string;
  unit?: string;
}

interface FilePreview {
  file?: File;
  url: string;
  type: 'image' | 'document';
  isExisting?: boolean;
  name?: string;
}

interface PropertyFormData {
  salutation: string;
  ownerName: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  sameAsPhone: boolean;
  ownerEmail: string;
  ownerType: string;

  seller: string;
  propertyType: string;
  propertySubtype: string;
  unitType: string;
  wing: string;
  unitNo: string;
  furnishing: string;
  parkingType: string;
  parkingQty: string;
  city: string;
  location: string;
  society: string;
  floor: string;
  totalFloors: string;
  carpetArea: string;
  builtupArea: string;
  budget: string;
  address: string;
  status: string;
  leadSource: string;
  possessionMonth: string;
  possessionYear: string;
  purchaseMonth: string;
  purchaseYear: string;
  sellingRights: string;
  amenities: string[];
  furnishingItems: string[];
  description: string;
  nearby_places: NearbyPlace[];

  ownershipDoc: File | null;
  photos: File[];

  ownershipDocUrl?: string;
  photoUrls?: string[];
  // ...existing fields
  bedrooms?: string;
  bathrooms?: string;
  facing?: string;
  // ...existing
  priceType?: 'Fixed' | 'Negotiable';
  finalPrice?: string;          // store as rupee-integer string (e.g. "4500000")

  
}

interface InitialDataFromParent {
  id?: string | number;
  salutation?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerWhatsapp?: string;
  sameAsPhone?: boolean;
  ownerEmail?: string;
  ownerType?: string;

  seller?: string;
  propertyType?: string;
  propertySubtype?: string;
  unitType?: string;
  wing?: string;
  unitNo?: string;
  furnishing?: string;
  parkingType?: string;
  parkingQty?: string;
  city?: string;
  location?: string;
  society?: string;
  floor?: string;
  totalFloors?: string;
  carpetArea?: string;
  builtupArea?: string;
  budget?: string;
  address?: string;
  status?: string;
  leadSource?: string;
  possessionMonth?: string;
  possessionYear?: string;
  purchaseMonth?: string;
  purchaseYear?: string;
  sellingRights?: string;
  amenities?: string[];
  furnishingItems?: string[];
  description?: string;
  nearby_places?: NearbyPlace[];

  existingOwnershipDocUrl?: string;
  existingOwnershipDocName?: string;
  existingOwnershipDocId?: string;
  existingPhotos?: Array<{ id: string; url: string; name?: string }>;
  // ...existing fields
  bedrooms?: string;
  bathrooms?: string;
  facing?: string;
  // ...existing
  priceType?: 'Fixed' | 'Negotiable';
  finalPrice?: string;
}

interface PublicSellPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (property: any) => void; // made optional
  mode?: 'create' | 'edit';
  propertyId?: string | number;
  initialData?: InitialDataFromParent | null;
}

// --- helpers for budget <-> crores (TOP-LEVEL, outside any component) ---
const RUPEE_PER_CRORE = 10_000_000;
const RUPEE_PER_LAKH = 100_000;

export function parseBudgetToRupees(text?: string): number {
  const raw = (text || "").trim().toLowerCase();
  if (!raw) return 0;

  const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
  const digitsOnly = cleaned.replace(/,/g, "");

  if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;

  const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * RUPEE_PER_LAKH) || 0;

  const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, "")) * RUPEE_PER_CRORE) || 0;

  const n = parseFloat(digitsOnly);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

export function rupeesToCrores(r: number): number {
  if (!r || r <= 0) return 0.01; // selector minimum (1L == 0.01 Cr)
  return r / RUPEE_PER_CRORE;
}

/* ---------------- Style Constants ---------------- */
const LABEL = 'block text-xs font-semibold text-gray-700 mb-1';
const FIELD = 'w-full h-10 px-3 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const FIELD_DISABLED = 'w-full h-10 px-3 rounded-lg text-sm border border-gray-100 bg-gray-100 text-gray-500';
const SELECT_BASE = FIELD + ' flex items-center justify-between';
const CONTROL_WRAPPER = 'space-y-3 bg-white p-4 py-0 rounded-lg shadow-sm';
const SECTION_HEADER = 'text-base font-semibold text-gray-900';
const HELP_TEXT = 'text-xs text-gray-500';

/* ---------------- Small UI helpers ---------------- */

const SafeDropdown: React.FC<any> = (props) => <Dropdown {...props} />;

/**
 * Helper: find scrollable parents (including the modal content) so we can listen to their scroll
 */
function getScrollParents(node: Element | null): Element[] {
  const parents: Element[] = [];
  let el = node?.parentElement || null;
  while (el) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll' || el === document.body) {
      parents.push(el);
    }
    el = el.parentElement;
  }
  return parents;
}

/* ---------------- MultiSelectDropdown (improved) ---------------- */
const MultiSelectDropdown: React.FC<{
  options: MasterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  label: string;
  placeholder?: string;
}> = ({ options, selectedValues, onToggle, label, placeholder = "Select options..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const filteredOptions = useMemo(
    () => options.filter(option => (option.label || '').toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => String(opt.value) === String(selectedValues[0]));
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} items selected`;
  }, [selectedValues, options, placeholder]);

  // close when clicking outside (document)
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      setIsOpen(false);
      setSearchTerm('');
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen]);

  const updateRect = () => {
    if (!buttonRef.current) return setRect(null);
    setRect(buttonRef.current.getBoundingClientRect());
  };

  // handle scroll/resize and scrolls on parent containers (including modal content)
  useEffect(() => {
    if (!isOpen) return;
    updateRect();

    const onWindowResize = () => updateRect();
    const onWindowScroll = () => updateRect();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, true);

    // listen to scrolls on scrollable parents so popup repositions when modal content scrolls
    const parents = getScrollParents(buttonRef.current);
    const onParentScroll = () => updateRect();
    parents.forEach(p => p.addEventListener('scroll', onParentScroll, true));

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('scroll', onWindowScroll, true);
      parents.forEach(p => p.removeEventListener('scroll', onParentScroll, true));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Prevent body scroll while dropdown is open (fix background scrollbar interaction)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflow || '';
    }
    return () => {
      document.body.style.overflow = prevOverflow || '';
    };
  }, [isOpen]);

  // determine portal target: prefer modal-scoped portal (#modal-portal) else fallback to document.body
  const getPortalTarget = (): Element | null => {
    if (typeof document === 'undefined') return null;
    const modalPortal = document.getElementById('modal-portal');
    return modalPortal || document.body;
  };

  // z-index strategy:
  const isModalPortal = typeof document !== 'undefined' && !!document.getElementById('modal-portal');
  const MODAL_PORTAL_Z = 1050; // high enough to appear above normal modal content but leave room for header if needed
  const BODY_FALLBACK_HIGH_Z = 9999999;

  const popupStyle: React.CSSProperties = rect ? {
    position: 'fixed',
    zIndex: isModalPortal ? MODAL_PORTAL_Z : BODY_FALLBACK_HIGH_Z,
    top: rect.bottom + window.scrollY + 6,
    left: rect.left + window.scrollX,
    minWidth: rect.width,
    maxHeight: '40vh',
    overflow: 'hidden',
    pointerEvents: 'auto',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)'
  } : {
    position: 'fixed',
    zIndex: isModalPortal ? MODAL_PORTAL_Z : BODY_FALLBACK_HIGH_Z,
    top: 0,
    left: 0,
    minWidth: 200,
    pointerEvents: 'auto'
  };

  const popup = (
    <div
      ref={dropdownRef}
      className="bg-white border rounded-lg shadow-lg overflow-hidden"
      style={popupStyle}
    >
      <div className="p-2 border-b">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-2 border border-gray-100 rounded text-sm focus:outline-none"
          autoFocus
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <p className="text-xs text-gray-500 p-3">No options found</p>
        ) : (
          filteredOptions.map(option => (
            <label key={String(option.value)} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.map(String).includes(String(option.value))}
                onChange={() => {
                  onToggle(String(option.value));
                }}
                className="mr-3 h-4 w-4 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))
        )}
      </div>
      {selectedValues.length > 0 && (
        <div className="p-2 bg-gray-50 border-t text-xs text-blue-600">
          Selected: {selectedValues.length} item(s)
        </div>
      )}
    </div>
  );

  const portalTarget = (typeof document !== 'undefined') ? getPortalTarget() : null;

  return (
    <div className="relative">
      <label className={LABEL}>{label}</label>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
          // wait for next tick then compute rect
          setTimeout(updateRect, 0);
        }}
        className={`${SELECT_BASE} text-left px-3`}
      >
        <span className={selectedValues.length === 0 ? "text-gray-400" : "text-gray-900"}>{displayText}</span>
        <span className="text-gray-400 text-sm">▾</span>
      </button>

      {isOpen && buttonRef.current && portalTarget && createPortal(popup, portalTarget)}
    </div>
  );
};

/* ---------------- FilePreviewComponent ---------------- */
const FilePreviewComponent: React.FC<{
  preview: FilePreview;
  onRemove: () => void;
}> = ({ preview, onRemove }) => {
  return (
    <div className="relative group">
      {preview.type === 'image' ? (
        <div className="relative">
          <img src={preview.url} alt={preview.name || preview.file?.name || 'Image'} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
            <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 transition-opacity hover:bg-red-600" title="Remove">
              <X size={16} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2 rounded-b-lg truncate">
            {preview.name || preview.file?.name || 'Image'}
          </div>
        </div>
      ) : (
        <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 h-24 flex flex-col items-center justify-center">
          <FileText className="text-blue-500 mb-2" size={24} />
          <span className="text-sm text-gray-700 text-center truncate w-full">{preview.name || preview.file?.name || 'Document'}</span>
          <button onClick={onRemove} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600" title="Remove">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------------- PossessionDropdown ---------------- */

const PossessionDropdown: React.FC<{
  possessionMonth: string;
  possessionYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  title: string;
}> = ({ possessionMonth, possessionYear, onMonthChange, onYearChange, title }) => {
  const now = new Date();
  const CURRENT_YEAR = now.getFullYear();
  const CURRENT_MONTH = now.getMonth() + 1;

  const monthNames = useMemo(
    () => [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    []
  );

  const currentYear = parseInt(possessionYear) || CURRENT_YEAR;
  const currentMonth = parseInt(possessionMonth) || CURRENT_MONTH;

  useEffect(() => {
    if (currentYear === CURRENT_YEAR && currentMonth > CURRENT_MONTH) {
      onMonthChange(CURRENT_MONTH.toString());
    }
  }, [currentYear, currentMonth, CURRENT_MONTH, CURRENT_YEAR, onMonthChange]);

  const yearOptions = Array.from({ length: 40 }, (_, i) => {
    const y = (CURRENT_YEAR - i).toString();
    return { value: y, label: y };
  });

  const monthOptions = monthNames.map((name, idx) => {
    const m = idx + 1;
    const disabled = currentYear === CURRENT_YEAR && m > CURRENT_MONTH;
    return { value: m.toString(), label: name, disabled };
  });

  return (
    <div>
      <label className={LABEL}>{title}</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <SafeDropdown placeholder="Year" options={yearOptions} value={possessionYear} onChange={onYearChange} className="w-full" />
        </div>
        <div className="flex-1">
          <SafeDropdown
            placeholder="Month"
            options={monthOptions.filter(opt => !opt.disabled)}
            value={possessionMonth}
            onChange={onMonthChange}
            className="w-full"
          />
        </div>
      </div>
      {possessionMonth && possessionYear && (
        <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Selected: {monthNames[parseInt(possessionMonth) - 1]} {possessionYear}
        </div>
      )}
    </div>
  );
};

/* ---------------- Main Component (two-step) ---------------- */

interface PublicSellPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (property: any) => void;
  mode?: 'create' | 'edit';
  propertyId?: string | number;
  initialData?: InitialDataFromParent | null;
  seller?: string | null; // <-- add this if you need it
}

const PublicSellPropertyForm: React.FC<PublicSellPropertyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  propertyId,
  initialData,
  seller
}) => {

  const now = new Date();
  const CURRENT_YEAR = now.getFullYear();
  const CURRENT_MONTH = now.getMonth() + 1;

  // step: 1 = owner compact, 2 = property form full
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<PropertyFormData>(() => ({
    salutation: 'Mr',
    ownerName: '',
    ownerPhone: '',
    ownerWhatsapp: '',
    sameAsPhone: false, // <-- default OFF (WhatsApp optional)
    ownerEmail: '',
    ownerType: 'individual',

    seller: '',
    propertyType: '',
    propertySubtype: '',
    unitType: '',
    wing: '',
    unitNo: '',
    furnishing: '',
    parkingType: '',
    parkingQty: '',
    city: '',
    location: '',
    society: '',
    floor: '',
    totalFloors: '',
    carpetArea: '',
    builtupArea: '',
    budget: '',
    address: '',
    status: '',
    leadSource: '',
    possessionMonth: String(CURRENT_MONTH),
    possessionYear: String(CURRENT_YEAR),
    purchaseMonth: String(CURRENT_MONTH),
    purchaseYear: String(CURRENT_YEAR),
    sellingRights: 'Standard',
    amenities: [],
    furnishingItems: [],
    description: '',
    nearby_places: [],

    ownershipDoc: null,
    photos: [],
     // ...existing defaults
    bedrooms: '',
    bathrooms: '',
    facing: '',
    priceType: 'Fixed',   // default: Fixed (no extra field)
    finalPrice: '',
  }));

  const [ownershipDocPreview, setOwnershipDocPreview] = useState<FilePreview | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<FilePreview[]>([]);
  const [nearbyPlaceForm, setNearbyPlaceForm] = useState({ name: '', distance: '', unit: '', type: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState<Record<string, MasterOption[]>>({});
  // lock lead source to Website so user cannot change it
  const [leadSourceLocked, setLeadSourceLocked] = useState<boolean>(false);

  // showThankYou state for the overlay modal after submit
  const [showThankYou, setShowThankYou] = useState(false);

  const getLabelFromValue = (options: MasterOption[] = [], value: string) => {
    if (!value || !options || !Array.isArray(options)) {
      return '';
    }

    // Try exact match first
    const exactMatch = options.find(o => String(o.value) === String(value));
    if (exactMatch) {
      return exactMatch.label || '';
    }

    // Try case-insensitive match
    const caseInsensitiveMatch = options.find(o =>
      String(o.value).toLowerCase() === String(value).toLowerCase()
    );
    if (caseInsensitiveMatch) {
      return caseInsensitiveMatch.label || '';
    }

    // Try label-to-value match (in case value is actually a label)
    const labelMatch = options.find(o =>
      String(o.label).toLowerCase() === String(value).toLowerCase()
    );
    if (labelMatch) {
      return labelMatch.label || '';
    }

    return '';
  };

  const createFilePreview = (file: File): FilePreview => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'document';
    return { file, url, type, isExisting: false };
  };
  const createExistingFilePreview = (url: string, name: string): FilePreview => {
    const type = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? 'image' : 'document';
    return { url, type, isExisting: true, name };
  };
  const cleanupPreview = (p: FilePreview) => {
    if (!p.isExisting && p.url) URL.revokeObjectURL(p.url);
  };
  const cleanupAllPreviews = () => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    photoPreviews.forEach(p => { if (!p.isExisting) cleanupPreview(p); });
  };

  const normalizeMasterData = (raw: any): Record<string, MasterOption[]> => {
    const out: Record<string, MasterOption[]> = {};
    if (!raw) return out;

    const walk = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      Object.keys(obj).forEach(k => {
        const val = obj[k];
        const key = (k || '').toLowerCase().trim();
        if (Array.isArray(val)) {
          out[key] = val;
        } else if (val && typeof val === 'object') {
          Object.keys(val).forEach(inner => {
            const iv = val[inner];
            if (Array.isArray(iv)) out[(inner || '').toLowerCase().trim()] = iv;
          });
        }
      });
    };

    walk(raw);
    if (Object.keys(out).length === 0) {
      try {
        Object.keys(raw).forEach(k => {
          const v = raw[k];
          if (Array.isArray(v)) out[k.toLowerCase().trim()] = v;
        });
      } catch { /* noop */ }
    }
    return out;
  };

  const fetchMasterData = async () => {
    try {
      const data = await getMasterDropdownOptions(['lead', 'common', 'property']);
      const normalized = normalizeMasterData(data);
      setMasterOptions(normalized);
      const leadOpts: MasterOption[] = (normalized['lead source'] || normalized['lead'] || []);
      const websiteOpt = leadOpts.find(o =>
        (o.label && String(o.label).toLowerCase() === 'website') ||
        (String(o.value).toLowerCase() === 'website')
      );

      if (websiteOpt) {
        // Use the option's value so backend mapping continues to work
        setFormData(prev => ({ ...prev, leadSource: String(websiteOpt.value) }));
      } else {
        // Fallback: set a literal string 'Website' (backend should accept or map)
        setFormData(prev => ({ ...prev, leadSource: 'Website' }));
      }
      setLeadSourceLocked(true);

    } catch (err: any) {
      setErrorBanner(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setErrorBanner(null);
    setErrors({});
    fetchMasterData();

    if (mode === 'edit' && initialData) {
      const seed: PropertyFormData = {
        salutation: initialData.salutation || 'Mr',
        ownerName: initialData.ownerName || '',
        ownerPhone: initialData.ownerPhone || '',
        ownerWhatsapp: initialData.ownerWhatsapp || '',
        sameAsPhone: initialData.sameAsPhone ?? false,
        ownerEmail: initialData.ownerEmail || '',
        ownerType: initialData.ownerType || 'individual',

        seller: initialData.seller || '',
        propertyType: initialData.propertyType || '',
        propertySubtype: initialData.propertySubtype || '',
        unitType: initialData.unitType || '',
        wing: initialData.wing || '',
        unitNo: initialData.unitNo || '',
        furnishing: initialData.furnishing || '',
        parkingType: initialData.parkingType || '',
        parkingQty: initialData.parkingQty || '',
        city: initialData.city || '',
        location: initialData.location || '',
        society: initialData.society || '',
        floor: initialData.floor || '',
        totalFloors: initialData.totalFloors || '',
        carpetArea: initialData.carpetArea || '',
        builtupArea: initialData.builtupArea || '',
        budget: initialData.budget || '',
        address: initialData.address || '',
        status: initialData.status || '',
        leadSource: initialData.leadSource || '',
        possessionMonth: initialData.possessionMonth || String(CURRENT_MONTH),
        possessionYear: initialData.possessionYear || String(CURRENT_YEAR),
        purchaseMonth: initialData.purchaseMonth || String(CURRENT_MONTH),
        purchaseYear: initialData.purchaseYear || String(CURRENT_YEAR),
        sellingRights: initialData.sellingRights || 'Standard',
        amenities: (initialData.amenities || []).map(String),
        furnishingItems: (initialData.furnishingItems || []).map(String),
        description: initialData.description || '',
        nearby_places: initialData.nearby_places || [],
        ownershipDoc: null,
        photos: [],
        ownershipDocUrl: initialData.existingOwnershipDocUrl,
        photoUrls: (initialData.existingPhotos || []).map(p => p.url),

        // ...existing seeds
        bedrooms: initialData.bedrooms || '',
        bathrooms: initialData.bathrooms || '',
        facing: initialData.facing || '',

        priceType: (initialData.priceType as 'Fixed' | 'Negotiable') || 'Fixed',
        finalPrice: initialData.finalPrice || '',
      };

      setFormData(seed);

      if (initialData.existingOwnershipDocUrl) {
        setOwnershipDocPreview(createExistingFilePreview(initialData.existingOwnershipDocUrl, initialData.existingOwnershipDocName || 'Ownership Document'));
      } else {
        setOwnershipDocPreview(null);
      }

      const existingPhotos = (initialData.existingPhotos || []).map(p => createExistingFilePreview(p.url, p.name || 'Photo'));
      setPhotoPreviews(existingPhotos);
    } else {
      setFormData(prev => ({
        ...prev,
        possessionMonth: String(CURRENT_MONTH),
        possessionYear: String(CURRENT_YEAR),
        purchaseMonth: String(CURRENT_MONTH),
        purchaseYear: String(CURRENT_YEAR),
        sellingRights: 'Standard',
        sameAsPhone: false // ensure default false for create
      }));
      setOwnershipDocPreview(null);
      setPhotoPreviews([]);
    }

    // reset to step 1 when modal opens
    setStep(1);

    return () => {
      cleanupAllPreviews();
      setOwnershipDocPreview(null);
      setPhotoPreviews([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialData]);

  const generateAddress = () => {
    const parts: string[] = [];
    if (formData.wing && formData.wing.trim()) parts.push(`Wing ${formData.wing.trim()}`);
    if (formData.unitNo && formData.unitNo.trim()) parts.push(`Unit No ${formData.unitNo.trim()}`);
    if (formData.society && masterOptions['society']) {
      const label = getLabelFromValue(masterOptions['society'], formData.society);
      if (label) parts.push(label);
    }
    if (formData.floor && masterOptions['floor']) {
      const fl = getLabelFromValue(masterOptions['floor'], formData.floor);
      if (fl) parts.push(fl.toLowerCase().includes('floor') ? fl : `${fl} Floor`);
    }
    if (formData.location && masterOptions['location']) {
      const loc = getLabelFromValue(masterOptions['location'], formData.location);
      if (loc) parts.push(loc);
    }
    if (formData.city && masterOptions['city']) {
      const c = getLabelFromValue(masterOptions['city'], formData.city);
      if (c) parts.push(c);
    }
    return parts.join(', ');
  };

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'create') return;
    if (Object.keys(masterOptions).length === 0) return;

    const addr = generateAddress();
    if (addr) setFormData(prev => ({ ...prev, address: addr }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen, mode,
    formData.wing, formData.unitNo, formData.society, formData.floor, formData.location, formData.city,
    masterOptions
  ]);

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const next: any = { ...prev, [name]: val };
      if (name === 'sameAsPhone' && val === true) {
        next.ownerWhatsapp = next.ownerPhone;
      }
      if (name === 'ownerPhone' && prev.sameAsPhone) {
        next.ownerWhatsapp = value;
      }
      return next;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDropdownChange = (field: keyof PropertyFormData) => (value: string) => {
    if (field === 'leadSource' && leadSourceLocked) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));
  };

  // Amenities toggle
  const handleAmenitiesToggle = (value: string) => {
    setFormData(prev => {
      const alreadySelected = prev.amenities.map(String).includes(String(value));
      const updated = alreadySelected
        ? prev.amenities.filter(v => String(v) !== String(value))
        : [...prev.amenities.map(String), String(value)];
      return {
        ...prev,
        amenities: updated,
      };
    });
  };

  const handleFurnishingItemsToggle = (value: string) => {
    setFormData(prev => {
      const alreadySelected = prev.furnishingItems.map(String).includes(String(value));
      const updated = alreadySelected
        ? prev.furnishingItems.filter(v => String(v) !== String(value))
        : [...prev.furnishingItems.map(String), String(value)];
      return {
        ...prev,
        furnishingItems: updated,
      };
    });
  };

  const handleNearbyPlaceInputChange = (field: keyof NearbyPlace, value: string) => {
    setNearbyPlaceForm(prev => ({ ...prev, [field]: value }));
  };

  const addNearbyPlace = () => {
    const { name, distance, unit, type } = nearbyPlaceForm;
    if (!name || !distance || !unit || !type) return;
    const placeName = getLabelFromValue(masterOptions['place name'] || [], name) || name;
    const placeType = getLabelFromValue(masterOptions['place type'] || [], type) || type;
    setFormData(prev => ({
      ...prev,
      nearby_places: [...prev.nearby_places, { name: placeName, distance, unit, type: placeType }]
    }));
    setNearbyPlaceForm({ name: '', distance: '', unit: '', type: '' });
  };

  const removeNearbyPlace = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      nearby_places: prev.nearby_places.filter((_, i) => i !== idx),
    }));
  };

  const handleOwnershipDocUpload = (file: File | null) => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    if (file) {
      const preview = createFilePreview(file);
      setOwnershipDocPreview(preview);
      setFormData(prev => ({ ...prev, ownershipDoc: file }));
    } else {
      setOwnershipDocPreview(null);
      setFormData(prev => ({ ...prev, ownershipDoc: null }));
    }
  };

  const handlePhotosUpload = (files: File[]) => {
    const existing = photoPreviews.filter(p => p.isExisting);
    const newPreviews = files.map(createFilePreview);
    setPhotoPreviews([...existing, ...newPreviews]);
    setFormData(prev => ({ ...prev, photos: [...(prev.photos || []), ...files] }));
  };

  const removeOwnershipDoc = () => {
    if (ownershipDocPreview && !ownershipDocPreview.isExisting) cleanupPreview(ownershipDocPreview);
    setOwnershipDocPreview(null);
    setFormData(prev => ({ ...prev, ownershipDoc: null }));
  };

  const removePhoto = (index: number) => {
    const next = [...photoPreviews];
    const removed = next.splice(index, 1)[0];
    if (removed && !removed.isExisting) cleanupPreview(removed);
    setPhotoPreviews(next);

    const newFiles = next.filter(p => !p.isExisting && p.file).map(p => p.file!);
    setFormData(prev => ({ ...prev, photos: newFiles }));
  };

  const onlyDigits = (s = '') => s.replace(/\D/g, '');
  const ensureIndiaPrefix = (s = '') => {
    const d = onlyDigits(s);
    if (!d) return '';
    if (d.length === 10) return `+91${d}`;
    if (d.startsWith('91') && d.length === 12) return `+${d}`;
    if (d.startsWith('0') && d.length === 11) return `+91${d.slice(1)}`;
    return s.startsWith('+') ? s : `+${d}`;
  };

  const handlePhoneChange = (value: string) => {
    const normalized = value.startsWith('+') ? value : (value.startsWith('91') ? `+${value}` : (value.length === 10 ? `+91${value}` : value));
    setFormData(prev => {
      const next = { ...prev, ownerPhone: normalized };
      if (prev.sameAsPhone) next.ownerWhatsapp = normalized;
      return next;
    });
    if (errors.ownerPhone) setErrors(prev => ({ ...prev, ownerPhone: '' }));
  };

  const handleWhatsappChange = (value: string) => {
    const normalized = value.startsWith('+') ? value : (value.startsWith('91') ? `+${value}` : (value.length === 10 ? `+91${value}` : value));
    setFormData(prev => ({ ...prev, ownerWhatsapp: normalized }));
    if (errors.ownerWhatsapp) setErrors(prev => ({ ...prev, ownerWhatsapp: '' }));
  };

  const handlePhoneBlur = (field: 'ownerPhone' | 'ownerWhatsapp') => {
    setFormData(prev => {
      const raw = prev[field] || '';
      const normalized = ensureIndiaPrefix(raw);
      if (field === 'ownerPhone' && prev.sameAsPhone) {
        return { ...prev, ownerPhone: normalized, ownerWhatsapp: normalized };
      }
      return { ...prev, [field]: normalized };
    });
  };

  const validatePhoneFields = (requireWhatsapp = false) => {
    const errs: { [k: string]: string } = {};
    if (!formData.ownerPhone || onlyDigits(formData.ownerPhone).length < 10) {
      errs.ownerPhone = 'Please enter a valid phone number';
    }
    if (requireWhatsapp) {
      if (!formData.ownerWhatsapp || onlyDigits(formData.ownerWhatsapp).length < 10) {
        errs.ownerWhatsapp = 'Please enter a valid WhatsApp number';
      }
    }
    setErrors(prev => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.ownerName) e.ownerName = 'Owner name is required';
    if (!formData.ownerPhone) e.ownerPhone = 'Owner phone is required';
    if (!formData.ownerEmail) e.ownerEmail = 'Owner email is required';

    if (!formData.propertyType) e.propertyType = 'Property type is required';
    if (!formData.propertySubtype) e.propertySubtype = 'Property subtype is required';
    if (!formData.city) e.city = 'City is required';
    if (!formData.location) e.location = 'Location is required';
    if (!formData.society) e.society = 'Society is required';
    if (!formData.carpetArea) e.carpetArea = 'Carpet area is required';
    if (!formData.budget) e.budget = 'Budget is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Helper to create seller safely
  const createSellerSafe = async (payload: {
    salutation?: string;
    name: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  }) => {
    try {
      // Try sellersAPI methods first
      if ((sellerAPI as any)?.createSeller) {
        return await (sellerAPI as any).createSeller(payload);
      }

      if ((sellerAPI as any)?.create) {
        return await (sellerAPI as any).create(payload);
      }

      if ((propertiesAPI as any)?.createSeller) {
        return await (propertiesAPI as any).createSeller(payload);
      }
      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', {
          status: res.status,
          statusText: res.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
      }

      const result = await res.json();
      return result;

    } catch (err: any) {
      console.error('Error in createSellerSafe:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to seller API');
      }

      if (err.response) {
        const msg = err.response.data?.message || err.response.statusText || 'Unknown API error';
        throw new Error(`API Error: ${msg}`);
      }

      throw new Error(err.message || 'Unknown error creating seller');
    }
  };

  const extractIdFromResponse = (obj: any): string | null => {
    if (!obj) {
      console.warn('extractIdFromResponse: No response object provided');
      return null;
    }

    // Try various common ID field names
    const possibleIds = [
      obj.id,
      obj._id,
      obj.seller_id,
      obj.sellerId,
      obj.data?.id,
      obj.data?._id,
      obj.data?.seller_id,
      obj.result?.id,
      obj.result?._id
    ];

    for (const id of possibleIds) {
      if (id !== null && id !== undefined) {
        const idStr = String(id);
        console.log('Found ID:', idStr);
        return idStr;
      }
    }

    console.warn('No ID found in response object:', obj);
    return null;
  };

  // FIXED buildPayload function with proper society_name handling
  const buildPayload = (): FormData => {
    const fd = new FormData();

    const textFields: (keyof PropertyFormData)[] = [
      "salutation", "ownerName", "ownerPhone", "ownerWhatsapp", "ownerEmail", "ownerType",
      "seller", "propertyType", "propertySubtype", "unitType", "wing", "unitNo",
      "furnishing", "parkingType", "parkingQty", "city", "location", "society",
      "floor", "totalFloors", "carpetArea", "builtupArea", "budget", "address",
      "status", "leadSource", "possessionMonth", "possessionYear",
      "purchaseMonth", "purchaseYear", "sellingRights", "description",
      "bedrooms", "bathrooms", "facing", "priceType", "finalPrice",

    ];

    textFields.forEach((k) => fd.append(k, String((formData as any)[k] ?? "")));

    // FIXED: Add society_name with proper fallback logic
    const societyOptions = masterOptions['society'] || [];
    console.log('Society options available:', societyOptions);
    console.log('Selected society value:', formData.society);

    const societyLabel = getLabelFromValue(societyOptions, formData.society);
    console.log('Society label found:', societyLabel);

    // Use the label if found, otherwise use the raw value, otherwise use empty string
    const finalSocietyName = societyLabel || formData.society || '';
    console.log('Final society_name being sent:', finalSocietyName);

    fd.append('society_name', finalSocietyName);

    // Add boolean field
    fd.append('sameAsPhone', String(formData.sameAsPhone ?? true));

    // Add JSON fields
    fd.append("amenities", JSON.stringify(formData.amenities || []));
    fd.append("furnishingItems", JSON.stringify(formData.furnishingItems || []));
    fd.append("nearby_places", JSON.stringify(formData.nearby_places || []));

    // Handle existing files for edit mode
    if (mode === 'edit') {
      const existingPhotoUrls = photoPreviews.filter(p => p.isExisting).map(p => p.url);
      fd.append("existingPhotoUrls", JSON.stringify(existingPhotoUrls));

      if (ownershipDocPreview?.isExisting) {
        fd.append("existingOwnershipDocUrl", ownershipDocPreview.url);
      }
    }

    // Add new files
    if (formData.ownershipDoc) {
      fd.append("ownershipDoc", formData.ownershipDoc, formData.ownershipDoc.name);
    }

    (formData.photos || []).forEach((file) => {
      if (file) {
        fd.append("photos", file, file.name);
      }
    });

    // Debug: Log all FormData entries
    console.log('=== FormData Debug ===');
    for (let [key, value] of fd.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, `[File: ${value.name}]`);
      } else {
        console.log(`${key}:`, value);
      }
    }
    console.log('=== End FormData Debug ===');

    return fd;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'create') return;

    const fullName = `${formData.salutation || ''} ${formData.ownerName || ''}`.trim();
    setFormData(prev => ({ ...prev, seller: fullName }));
  }, [formData.salutation, formData.ownerName, isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'create') return;
    const autop = `${formData.salutation || ''} ${formData.ownerName || ''}`.trim();
    if (!formData.seller || formData.seller.trim() === '') {
      setFormData(prev => ({ ...prev, seller: autop }));
    }
  }, [formData.salutation, formData.ownerName, isOpen, mode]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      // jump to step 2 if property validations failed so user sees errors
      setStep(2);
      return;
    }
    if (!validatePhoneFields()) return;

    try {
      setLoading(true);
      setErrorBanner(null);

      let result: any;

      if (mode === 'edit' && propertyId) {
        // For edit mode, just update the property
        const payload = buildPayload();
        result = await propertiesAPI.updateProperty(String(propertyId), payload);
        toast.success('Property updated successfully');
      } else {
        // CREATE MODE: First create seller, then create property with seller_id
        let sellerId: string | null = null;
        let sellerName = '';

        // Step 1: Create seller first (if owner info is provided)
        const hasSellerInfo = (formData.ownerName && formData.ownerName.trim()) &&
          (formData.ownerEmail || formData.ownerPhone);

        if (hasSellerInfo) {
          try {
            const sellerPayload = {
              salutation: formData.salutation,
              name: formData.ownerName,
              email: formData.ownerEmail,
              phone: formData.ownerPhone,
              whatsapp: formData.ownerWhatsapp
            };

            console.log('Creating seller with payload:', sellerPayload);
            const sellerRes = await createSellerSafe(sellerPayload);
            console.log('Seller creation response:', sellerRes);

            sellerId = extractIdFromResponse(sellerRes);
            sellerName = `${formData.salutation ? formData.salutation + ' ' : ''}${formData.ownerName}`.trim();

          } catch (sellerErr: any) {
            toast.error('Failed to create seller: ' + (sellerErr.message || 'unknown'));
            setLoading(false);
            return;
          }

        }
        const payload = buildPayload();
        if (sellerId) {
          payload.append('seller_id', String(sellerId));
          payload.append('seller_name', sellerName);
          console.log('Adding seller info to property:', { seller_id: sellerId, seller_name: sellerName });
        }
        try {
          result = await propertiesAPI.createProperty(payload);

          if (sellerId) {
            result = {
              ...result,
              seller_id: sellerId,
              seller_name: sellerName
            };
          }



        } catch (propertyErr: any) {
          console.error('Property creation failed:', propertyErr);
          const msg = propertyErr?.response?.data?.message || propertyErr?.message || 'Failed to create property';
          setErrorBanner(msg);
          toast.error(msg);
          return;
        }
      }

      setShowThankYou(true);

      // Call onSubmit callback if provided
      if (typeof onSubmit === 'function') {
        try {
          onSubmit(result);
        } catch (err) {
          console.error('onSubmit handler threw:', err);
        }
      } else {
        console.warn('PublicSellPropertyForm: onSubmit not provided; skipping callback.');
      }

      // NOTE: Don't call onClose() here - let the thank you modal handle closing
      // The thank you modal's close button will call onClose()

    } catch (e: any) {
      console.error('Unexpected error in handleSubmit:', e);
      const msg = e?.response?.data?.message || e?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} property`;
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getOptions = (key: string): MasterOption[] => {
    if (!key) return [];
    const k = key.toLowerCase().trim();
    if (masterOptions[key]) return masterOptions[key];
    if (masterOptions[k]) return masterOptions[k];

    for (const mk in masterOptions) {
      if (!Array.isArray(masterOptions[mk])) continue;
      if (mk.toLowerCase().includes(k)) return masterOptions[mk];
      const arr = masterOptions[mk];
      const found = arr.find(o => (o.label && o.label.toLowerCase().includes(k)) || (String(o.value).toLowerCase().includes(k)));
      if (found) return arr;
    }
    return [];
  };

  const modalTitle = mode === 'edit' ? 'Edit Property' : (step === 1 ? 'Owner Details' : 'Sell Your Property');
  const submitButtonText = mode === 'edit' ? 'Update Property' : 'Submit Property';
  const submitIcon = mode === 'edit' ? Edit : Plus;

  if (!isOpen) return null;

  /* ---------- Step 1 compact owner block ---------- */
  const OwnerStep = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800">Owner Information</h3>
        <span className="text-xs text-gray-500">Step 1 of 2</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Salutation</label>
          <select
            name="salutation"
            value={formData.salutation || ''}
            onChange={handleEventChange}
            className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select</option>
            <option value="Mr">Mr</option>
            <option value="Ms">Ms</option>
            <option value="Mrs">Mrs</option>
            <option value="Dr">Dr</option>
            <option value="Mx">Mx</option>
          </select>
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[0-9]/g, '');
              handleEventChange({ target: { name: 'ownerName', value } } as any);
            }}
            placeholder="Enter your full name"
            className="border border-gray-300 rounded w-full h-8 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.ownerName && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>
          )}
        </div>

        <div className="md:col-span-5">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="ownerEmail"
            value={formData.ownerEmail || ''}
            onChange={handleEventChange}
            placeholder="your.email@example.com"
            className="border px-2 border-gray-300 rounded w-full h-8 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.ownerEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerEmail}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <PhoneInput
            country={'in'}
            value={formData.ownerPhone || ''}
            onChange={(v: any) => handlePhoneChange(String(v || ''))}
            onBlur={() => handlePhoneBlur('ownerPhone')}
            inputClass="!w-full !h-8 !rounded !border-gray-300 !text-xs focus:!ring-1 focus:!ring-blue-500 focus:!border-transparent"
            containerClass="!w-full"
            inputProps={{
              name: 'ownerPhone',
              required: true,
              autoFocus: false
            }}
          />
          {errors.ownerPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FaWhatsapp className="text-green-500" /> WhatsApp Number
            <div className="ml-auto flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sameAsPhone}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => {
                      const next = {
                        ...prev,
                        sameAsPhone: checked,
                        ownerWhatsapp: checked ? prev.ownerPhone : prev.ownerWhatsapp
                      };
                      return next;
                    });
                    if (checked && errors.ownerWhatsapp)
                      setErrors((prev) => ({ ...prev, ownerWhatsapp: '' }));
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-8 h-3 rounded-full relative transition-colors duration-200 ease-in-out ${formData.sameAsPhone ? 'bg-[#E6761D]' : 'bg-gray-300'
                    }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 bg-white w-2 h-2 rounded-full transition-transform duration-200 ease-in-out ${formData.sameAsPhone ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-gray-600">
                  {formData.sameAsPhone ? 'Same as phone' : 'Different (optional)'}
                </span>
              </label>
            </div>
          </label>

          <input
            type="tel"
            name="ownerWhatsapp"
            value={
              formData.sameAsPhone
                ? formData.ownerPhone || ''
                : formData.ownerWhatsapp || ''
            }
            onChange={(e) => handleWhatsappChange(e.target.value)}
            onBlur={() => handlePhoneBlur('ownerWhatsapp')}
            disabled={formData.sameAsPhone}
            placeholder="WhatsApp (optional)"
            maxLength={10}
            className={`border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${formData.sameAsPhone ? 'bg-gray-100' : ''
              }`}
          />

          {errors.ownerWhatsapp && (
            <p className="text-red-500 text-xs mt-1">{errors.ownerWhatsapp}</p>
          )}
        </div>

      </div >
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => { try { onClose(); } catch { } }}>Cancel</Button>
        <Button onClick={() => {
          // validate step1 minimal fields: ownerName, ownerEmail, ownerPhone
          const step1Errors: Record<string, string> = {};
          if (!formData.ownerName) step1Errors.ownerName = 'Owner name is required';
          if (!formData.ownerEmail) step1Errors.ownerEmail = 'Owner email is required';
          if (!formData.ownerPhone) step1Errors.ownerPhone = 'Owner phone is required';
          setErrors(step1Errors);
          if (Object.keys(step1Errors).length === 0) {
            // ensure phone normalized
            handlePhoneBlur('ownerPhone');
            if (formData.sameAsPhone) handlePhoneBlur('ownerWhatsapp');
            setStep(2);
          }
        }}>
          Next
          <ArrowRight className="h-4 w-4 ml-2 inline" />
        </Button>
      </div>
    </div>
  );

  /* ---------- Step 2 full property form ---------- */

  // Keep the large existing property form UI but add Back + Submit controls at bottom
  // For brevity we reuse your existing JSX for fields - mostly unchanged below

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        subtitle={
          <>
            <ArrowRight size={18} className="mr-1 inline" />
            <span>{step === 1 ? 'Provide owner contact details' : 'Owner Information • Property details'}</span>
          </>
        }
        width="max-w-[95vw] md:max-w-4xl lg:max-w-5xl"
      >

        <div className="space-y-6 relative" >
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-sm">{mode === 'edit' ? 'Updating...' : 'Saving...'}</span>
            </div>
          )}

          {errorBanner && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 rounded">
              {errorBanner}
            </div>
          )}

          {/* Conditionally render Step 1 or Step 2 */}
          {step === 1 ? (
            OwnerStep
          ) : (
            <>
              {/* Owner compact summary at top of step 2 with an edit button */}
              <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">{formData.ownerName || '—'}</div>
                  <div className="text-xs text-gray-500">
                    {formData.ownerEmail ? <span>{formData.ownerEmail} • </span> : null}
                    {formData.ownerPhone ? <span>{formData.ownerPhone}</span> : null}
                    {formData.sameAsPhone ? <span className="ml-2 text-xs text-green-600">WhatsApp same as phone</span> : (formData.ownerWhatsapp ? <span className="ml-2 text-xs text-gray-500">WhatsApp: {formData.ownerWhatsapp}</span> : <span className="ml-2 text-xs text-gray-400">WhatsApp: not provided</span>)}
                  </div>
                </div>
                <div>
                  <Button variant="outline" onClick={() => setStep(1)}>Edit Owner</Button>
                </div>
              </div>

              {/* Property grid (kept from your previous code) */}
              <div className={CONTROL_WRAPPER}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={LABEL}>Property Type <span className="text-red-500">*</span></label>
                    <SafeDropdown placeholder="Select Property Type" options={getOptions('property type')} value={formData.propertyType} onChange={handleDropdownChange('propertyType')} className="w-full" />
                    {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
                  </div>

                  <div>
                    <label className={LABEL}>Property Subtype <span className="text-red-500">*</span></label>
                    <SafeDropdown placeholder="Select Property Subtype" options={getOptions('property subtype')} value={formData.propertySubtype} onChange={handleDropdownChange('propertySubtype')} className="w-full" />
                    {errors.propertySubtype && <p className="text-red-500 text-xs mt-1">{errors.propertySubtype}</p>}
                  </div>

                  <div>
                    <label className={LABEL}>Unit Type</label>
                    <SafeDropdown placeholder="Select Unit Type" options={getOptions('unit type')} value={formData.unitType} onChange={handleDropdownChange('unitType')} className="w-full" />
                  </div>

                  <div>
                    <label className={LABEL}>Wing</label>
                    <input type="text" placeholder="Wing name/number" value={formData.wing} onChange={(e) => handleInputChange('wing', e.target.value)} className={FIELD} />
                  </div>

                  <div>
                    <label className={LABEL}>Unit No</label>
                    <input type="text" placeholder="Unit/Flat no" value={formData.unitNo} onChange={(e) => handleInputChange('unitNo', e.target.value)} className={FIELD} />
                  </div>

                  <div>
                    <label className={LABEL}>Furnishing</label>
                    <SafeDropdown placeholder="Select Furnishing" options={getOptions('furnishing')} value={formData.furnishing} onChange={handleDropdownChange('furnishing')} className="w-full" />
                  </div>

                  <div>
                    <label className={LABEL}>Parking Type</label>
                    <SafeDropdown placeholder="Select Parking Type" options={getOptions('parking type')} value={formData.parkingType} onChange={handleDropdownChange('parkingType')} className="w-full" />
                  </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
                      <SafeDropdown
                        placeholder="Select Bedrooms"
                        options={getOptions('bedrooms')}
                        value={formData.bedrooms}
                        onChange={handleDropdownChange('bedrooms')}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Bathrooms</label>
                      <SafeDropdown
                        placeholder="Select Bathrooms"
                        options={getOptions('bathrooms')}
                        value={formData.bathrooms}
                        onChange={handleDropdownChange('bathrooms')}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Facing</label>
                      <SafeDropdown
                        placeholder="Select Facing"
                        options={getOptions('facing')}
                        value={formData.facing}
                        onChange={handleDropdownChange('facing')}
                        className="w-full"
                      />
                    </div>

                  <div>
                    <label className={LABEL}>Parking Qty</label>
                    <SafeDropdown placeholder="Select Parking Quantity" options={getOptions('parking qty')} value={formData.parkingQty} onChange={handleDropdownChange('parkingQty')} className="w-full" />
                  </div>

                  <div>
                    <label className={LABEL}>City <span className="text-red-500">*</span></label>
                    <SafeDropdown placeholder="Select City" options={getOptions('city')} value={formData.city} onChange={handleDropdownChange('city')} className="w-full" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className={LABEL}>Location <span className="text-red-500">*</span></label>
                    <SafeDropdown placeholder="Select Location" options={getOptions('location')} value={formData.location} onChange={handleDropdownChange('location')} className="w-full" />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <label className={LABEL}>Society Name<span className="text-red-500">*</span></label>
                    <SafeDropdown placeholder="Select Society" options={getOptions('society')} value={formData.society} onChange={handleDropdownChange('society')} className="w-full" />
                    {errors.society && <p className="text-red-500 text-xs mt-1">{errors.society}</p>}
                  </div>

                    <div>
                      <label className={LABEL}>Total Floors</label>
                      <SafeDropdown placeholder="Select Total Floors" options={getOptions('total floors')} value={formData.totalFloors} onChange={handleDropdownChange('totalFloors')} className="w-full" />
                    </div>

                  <div>
                    <label className={LABEL}>Floor</label>
                    <SafeDropdown placeholder="Select Floor" options={getOptions('floor')} value={formData.floor} onChange={handleDropdownChange('floor')} className="w-full" />
                  </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Carpet Area (sq.ft)*
                      </label>
                      <input
                        type="text"
                        placeholder="Enter carpet area"
                        value={formData.carpetArea}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val) || val === '') {
                            handleInputChange('carpetArea', val);
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${errors.carpetArea ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {errors.carpetArea && (
                        <p className="text-red-500 text-xs mt-1">{errors.carpetArea}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Builtup Area (sq.ft) (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter builtup area"
                        value={formData.builtupArea}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val) || val === '') {
                            handleInputChange('builtupArea', val);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                  <div>
                    <label className={LABEL}>Property Status</label>
                    <SafeDropdown placeholder="Select Status" options={getOptions('property status')} value={formData.status} onChange={handleDropdownChange('status')} className="w-full" />
                  </div>

                  <div>
                    <label className={LABEL}>Lead Source</label>

                    {leadSourceLocked ? (
                      // show a disabled dropdown (if your Dropdown supports disabled prop),
                      // otherwise show plain text and include a hidden input so the value posts.
                      <div>
                        {/* If your Dropdown accepts disabled prop, pass it. Otherwise show plain text. */}
                        <SafeDropdown
                          placeholder="Lead Source"
                          options={getOptions('lead source')}
                          value={formData.leadSource}
                          onChange={handleDropdownChange('leadSource')}
                          className="w-full opacity-70 cursor-not-allowed"
                          disabled={true}
                        />

                        {/* Hidden input to ensure formData.leadSource is available in any non-JS path or for debugging */}
                        <input type="hidden" name="leadSource" value={formData.leadSource} />
                      </div>
                    ) : (
                      <SafeDropdown placeholder="Select Lead Source" options={getOptions('lead source')} value={formData.leadSource} onChange={handleDropdownChange('leadSource')} className="w-full" />
                    )}
                  </div>


                  <div>
                    <PossessionDropdown
                      title="Purchase Month & Year"
                      possessionMonth={formData.purchaseMonth}
                      possessionYear={formData.purchaseYear}
                      onMonthChange={(m) => handleInputChange('purchaseMonth', m)}
                      onYearChange={(y) => handleInputChange('purchaseYear', y)}
                    />
                  </div>

                  <div>
                    <PossessionDropdown
                      title="Possession Month & Year"
                      possessionMonth={formData.possessionMonth}
                      possessionYear={formData.possessionYear}
                      onMonthChange={(m) => handleInputChange('possessionMonth', m)}
                      onYearChange={(y) => handleInputChange('possessionYear', y)}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Selling Rights</label>
                    <SafeDropdown placeholder="Select Selling Rights" options={getOptions('selling rights')} value={formData.sellingRights} onChange={handleDropdownChange('sellingRights')} className="w-full" />
                  </div>

                    {/* SELL PRICE — keep in grid, tidy spacing */}
                    <div className="md:col-span-3 lg:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-gray-800 bt-8">
                          Sell Price (₹)*

                        </label>
                      </div>

                      {/* ---- Main slider (now also controls Final Price when Negotiable) ---- */}
                      <PriceRangeSelector
                        initialMax={rupeesToCrores(parseBudgetToRupees(formData.budget))}
                        max={10}
                        /* keep old payload shape working; we also read rupees if present */
                        onChange={({ max }) => {
                          const rupeeVal = Math.round(max * 10_000_000); // crores → rupees

                          handleInputChange('budget', String(rupeeVal));

                          // when Negotiable, mirror into Final Price
                          if (formData.priceType === 'Negotiable') {
                            handleInputChange('finalPrice', String(rupeeVal));
                          }
                        }}
                        className="p-0 mt-1"
                      />
                      <div className="flex items-center gap-4 mt-4">
                        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <input
                            type="checkbox"
                            name="priceType"
                            className="h-3 w-3 text-orange-600 rounded focus:ring-orange-500"
                            value="Fixed"
                            checked={(formData.priceType || 'Fixed') === 'Fixed'}
                            onChange={() => handleInputChange('priceType', 'Fixed')}
                          />
                          Fixed
                        </label>

                        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                          <input
                            type="checkbox"
                            name="priceType"
                            className="h-3 w-3 text-orange-600 rounded focus:ring-orange-500"
                            value="Negotiable"
                            checked={formData.priceType === 'Negotiable'}
                            onChange={() => handleInputChange('priceType', 'Negotiable')}
                          />
                          Negotiable
                        </label>
                      </div>
                      {/* ---- Final Price when Negotiable ---- */}
                      {formData.priceType === 'Negotiable' && (
                        <div className="mt-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Final Price (₹)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9,]*"
                              className="w-40 md:w-48 border rounded px-2 py-1.5 text-sm outline-none"
                              value={formData.finalPrice || ''}
                              onChange={(e) => {
                                // keep raw typing; slider will follow via controlledRupees after blur/valid change
                                handleInputChange('finalPrice', e.target.value);
                              }}
                              onBlur={(e) => {
                                const rupees = parseBudgetToRupees(e.target.value);
                                // normalize stored integer; this also drives the slider via controlledRupees
                                handleInputChange('finalPrice', String(rupees));
                              }}
                              placeholder="e.g. 45,00,000"
                              aria-label="Final negotiated price"
                            />
                            {/* compact readout: 30L / 1.25Cr */}
                            <span className="text-[11px] text-green-800 whitespace-nowrap">
                              {(() => {
                                const v = parseBudgetToRupees(formData.finalPrice || '');
                                if (!v || v <= 0) return '';
                                if (v < 10_000_000) return `${Math.round(v / 100_000)}L`;
                                return `${(v / 10_000_000).toFixed(v % 10_000_000 ? 2 : 0)}Cr`;
                              })()}
                            </span>

                          </div>
                        </div>
                      )}

                      {errors.budget && (
                        <p className="text-red-500 text-xs mt-1">{errors.budget}</p>
                      )}
                    </div>
                  <div className="">
                    <MultiSelectDropdown
                      label="Amenities"
                      options={getOptions('amenities')}
                      selectedValues={formData.amenities}
                      onToggle={handleAmenitiesToggle}
                      placeholder="Select amenities..."
                    />
                    {formData.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.amenities.map((val) => {
                          const opt = getOptions('amenities').find(o => String(o.value) === String(val));
                          return (
                            <span
                              key={String(val)}
                              className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-[10px]"
                            >
                              {opt?.label || val}
                              <button
                                type="button"
                                onClick={() => handleAmenitiesToggle(String(val))}
                                className="ml-1 text-purple-500 hover:text-purple-700"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="w-full z-40">
                    <MultiSelectDropdown
                      label="Furnishing Items"
                      options={getOptions('furnishing items')}
                      selectedValues={formData.furnishingItems}
                      onToggle={handleFurnishingItemsToggle}
                      placeholder="Select furnishing items..."
                    />
                    {formData.furnishingItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.furnishingItems.map((val) => {
                          const opt = getOptions('furnishing items').find(o => String(o.value) === String(val));
                          return (
                            <span
                              key={String(val)}
                              className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-[10px]"
                            >
                              {opt?.label || val}
                              <button
                                type="button"
                                onClick={() => handleFurnishingItemsToggle(String(val))}
                                className="ml-1 text-purple-500 hover:text-purple-700"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <label className={LABEL}>Address</label>
                    <textarea placeholder="Auto-filled based on selections (editable)" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Nearby Places</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-4">
                          <label className={LABEL}>Place Name</label>
                          <SafeDropdown placeholder="Select Place" options={getOptions('place name')} value={nearbyPlaceForm.name} onChange={(v) => handleNearbyPlaceInputChange('name', v)} className="w-full" />
                        </div>

                        <div className="col-span-6 md:col-span-2">
                          <label className={LABEL}>Distance</label>
                          <input type="text" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Enter distance" value={nearbyPlaceForm.distance} onChange={(e) => handleNearbyPlaceInputChange('distance', e.target.value)} />
                        </div>

                        <div className="col-span-6 md:col-span-2">
                          <label className={LABEL}>Unit</label>
                          <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500" value={nearbyPlaceForm.unit} onChange={(e) => handleNearbyPlaceInputChange('unit', e.target.value)}>
                            <option value="">Select Unit</option>
                            <option value="km">km</option>
                            <option value="m">m</option>
                            <option value="min">min</option>
                          </select>
                        </div>

                        <div className="col-span-12 md:col-span-3">
                          <label className={LABEL}>Place Type</label>
                          <div className="flex gap-2 items-center">
                            <SafeDropdown placeholder="Select" options={getOptions('place type')} value={nearbyPlaceForm.type} onChange={(v) => handleNearbyPlaceInputChange('type', v)} className="flex-1" />
                            <button type="button" onClick={addNearbyPlace} className="h-10 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300" disabled={!nearbyPlaceForm.name || !nearbyPlaceForm.distance || !nearbyPlaceForm.unit || !nearbyPlaceForm.type} title="Add place">
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {formData.nearby_places.length === 0 ? (
                          <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                            No nearby places added yet. Fill the form above and click + to add places.
                          </div>
                        ) : (
                          formData.nearby_places.map((place, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium text-blue-600">{place.name}</span>
                                <span className="text-gray-500 ml-2">({place.distance} {place.unit})</span>
                                <span className="text-green-600 ml-2 capitalize">{place.type}</span>
                              </div>
                              <button type="button" onClick={() => removeNearbyPlace(index)} className="text-red-600 hover:text-red-800 transition-colors" title="Remove">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <div className="space-y-3">
                      <div>
                        <label className={LABEL}>Ownership Doc (PDF/JPG/PNG)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors bg-white">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleOwnershipDocUpload(e.target.files?.[0] || null)} className="hidden" id="ownership-doc" />
                          <label htmlFor="ownership-doc" className="cursor-pointer">
                            <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">Choose Document</p>
                            <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                          </label>
                        </div>
                      </div>

                      {ownershipDocPreview && (
                        <div>
                          <label className={LABEL}>Document Preview</label>
                          <FilePreviewComponent preview={ownershipDocPreview} onRemove={removeOwnershipDoc} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 lg:col-span-2">
                    <div className="space-y-3">
                      <div>
                        <label className={LABEL}>Property Photos (JPG/PNG, Multiple)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors bg-white">
                          <input type="file" accept=".jpg,.jpeg,.png" multiple onChange={(e) => {
                            const selected = Array.from(e.target.files || []);
                            if (selected.length > 0) handlePhotosUpload(selected);
                          }} className="hidden" id="property-photos" />
                          <label htmlFor="property-photos" className="cursor-pointer">
                            <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">{photoPreviews.length > 0 ? 'Add More Photos' : 'Choose Photos'}</p>
                            <p className="text-xs text-gray-500">JPG, PNG up to 5MB each</p>
                          </label>
                        </div>
                      </div>

                      {photoPreviews.length > 0 && (
                        <div>
                          <label className={LABEL}>Photos Preview ({photoPreviews.length} files)</label>
                          <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto">
                            {photoPreviews.map((preview, index) => (
                              <FilePreviewComponent key={index} preview={preview} onRemove={() => removePhoto(index)} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>      
                <div className="space-y-2 p-4">
                  <label className="block text-xs font-medium text-gray-700">
                    Description
                  </label>

                  <div className="relative">
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, description: e.target.value } ))
                      }
                      className="w-full px-3 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[160px]"
                      placeholder="Additional property details, special features, etc."
                    />
                  </div>
                </div>

              <div className="flex justify-between space-x-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Back</Button>
                  <Button variant="outline" onClick={() => { setStep(1); }}>Edit Owner</Button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {React.createElement(submitIcon, { className: "h-4 w-4 mr-2" })}
                    {submitButtonText}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {showThankYou && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/70 to-purple-600/70 backdrop-blur-sm"></div>

          {/* Modal box */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeInUp border border-blue-100">

            {/* Success Icon */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Heading */}
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">🎉 Thank you!</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Your property details have been <span className="font-semibold text-blue-600">submitted successfully</span>.
              Our executive will contact you soon.
            </p>

            {/* Button */}
            <button
              onClick={() => {
                setShowThankYou(false);
                try { onClose?.(); } catch (e) { /* noop */ }
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

    </>
  );
};

export default PublicSellPropertyForm;
