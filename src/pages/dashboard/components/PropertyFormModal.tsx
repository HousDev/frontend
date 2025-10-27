import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Upload, Plus, FileText, Trash2, Edit } from 'lucide-react';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { toast } from 'react-toastify';
import PropertyDescriptionAI from './PropertyDescriptionAI';
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

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: any) => void;
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

/* ---------------- Possession Dropdown ---------------- */

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
      <label className="block text-xs font-medium text-gray-700 mb-1">{title}</label>
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
        <div className="mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Selected: {monthNames[parseInt(possessionMonth) - 1]} {possessionYear}
        </div>
      )}
    </div>
  );
};

/* ---------------- MultiSelect ---------------- */

const MultiSelectDropdown: React.FC<{
  options: MasterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  label: string;
  placeholder?: string;
}> = ({ options, selectedValues, onToggle, label, placeholder = "Select options..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(
    () => options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} items selected`;
  }, [selectedValues, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 p-2 rounded text-left bg-white flex justify-between items-center text-xs min-h-[38px]"
      >
        <span className={selectedValues.length === 0 ? "text-gray-500" : "text-gray-900"}>{displayText}</span>
        <span className="text-gray-500">▼</span>
      </button>

      {isOpen && buttonRef.current && (
        <div
          ref={dropdownRef}
          className="bg-white border rounded shadow-lg max-h-64 overflow-hidden"
          style={{
            position: 'fixed', zIndex: 9999,
            top: buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4,
            left: buttonRef.current.getBoundingClientRect().left + window.scrollX,
            width: buttonRef.current.getBoundingClientRect().width
          }}
        >
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="text-xs text-gray-500 p-2">No options found</p>
            ) : (
              filteredOptions.map(option => (
                <label key={option.value} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => onToggle(option.value)}
                    className="mr-2 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">{option.label}</span>
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
      )}
    </div>
  );
};

/* ---------------- File Preview ---------------- */

const FilePreviewComponent: React.FC<{
  preview: FilePreview;
  onRemove: () => void;
  className?: string;
}> = ({ preview, onRemove, className = "" }) => {
  return (
    <div className={`relative group ${className}`}>
      {preview.type === 'image' ? (
        <div className="relative">
          <img
            src={preview.url}
            alt={preview.name || preview.file?.name || 'Image'}
            className="w-full h-20 object-cover rounded-lg border border-gray-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
            <button
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity hover:bg-red-600"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 rounded-b-lg truncate">
            {preview.name || preview.file?.name || 'Image'}
          </div>
        </div>
      ) : (
        <div className="relative bg-gray-100 border border-gray-300 rounded-lg p-2 h-20 flex flex-col items-center justify-center">
          <FileText className="text-blue-500 mb-1" size={20} />
          <span className="text-[10px] text-gray-700 text-center truncate w-full">
            {preview.name || preview.file?.name || 'Document'}
          </span>
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            title="Remove"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------------- SafeDropdown wrapper ---------------- */
const SafeDropdown: React.FC<any> = (props) => {
  return <Dropdown {...props} />;
};

/* ---------------- Modal ---------------- */

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  propertyId,
  initialData = null
}) => {
  const now = new Date();
  const CURRENT_YEAR = now.getFullYear();
  const CURRENT_MONTH = now.getMonth() + 1;

  /* ---------- state ---------- */

  const [formData, setFormData] = useState<PropertyFormData>(() => ({
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

  /* ---------- utilities ---------- */

  // FIXED: Improved getLabelFromValue with multiple fallback strategies
  const getLabelFromValue = (options: MasterOption[] = [], value: string): string => {
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

  /* ---------- master data ---------- */

  const fetchMasterData = async () => {
    try {
      const data = await getMasterDropdownOptions(['lead', 'common', 'property']);
      setMasterOptions(data);
    } catch (err) {
      setErrorBanner(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  /* ---------- seed from initialData on open ---------- */

  useEffect(() => {
    if (!isOpen) return;

    setErrorBanner(null);
    setErrors({});
    fetchMasterData();

    if (mode === 'edit' && initialData) {
      const seed: PropertyFormData = {
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
        amenities: initialData.amenities || [],
        furnishingItems: initialData.furnishingItems || [],
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
        setOwnershipDocPreview(
          createExistingFilePreview(
            initialData.existingOwnershipDocUrl,
            initialData.existingOwnershipDocName || 'Ownership Document'
          )
        );
      } else {
        setOwnershipDocPreview(null);
      }

      const existingPhotos = (initialData.existingPhotos || []).map(p =>
        createExistingFilePreview(p.url, p.name || 'Photo')
      );
      setPhotoPreviews(existingPhotos);
    } else {
      setFormData(prev => ({
        ...prev,
        possessionMonth: String(CURRENT_MONTH),
        possessionYear: String(CURRENT_YEAR),
        purchaseMonth: String(CURRENT_MONTH),
        purchaseYear: String(CURRENT_YEAR),
        sellingRights: 'Standard',
      }));
      setOwnershipDocPreview(null);
      setPhotoPreviews([]);
    }

    return () => {
      cleanupAllPreviews();
      setOwnershipDocPreview(null);
      setPhotoPreviews([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialData]);

  /* ---------- auto-address when creating ---------- */

  const generateAddress = () => {
    const parts: string[] = [];
    if (formData.wing.trim()) parts.push(`Wing ${formData.wing.trim()}`);
    if (formData.unitNo.trim()) parts.push(`Unit No ${formData.unitNo.trim()}`);
    if (formData.society && masterOptions.society) {
      const label = getLabelFromValue(masterOptions.society, formData.society);
      if (label) parts.push(label);
    }
    if (formData.floor && masterOptions.floor) {
      const fl = getLabelFromValue(masterOptions.floor, formData.floor);
      if (fl) parts.push(fl.toLowerCase().includes('floor') ? fl : `${fl} Floor`);
    }
    if (formData.location && masterOptions.location) {
      const loc = getLabelFromValue(masterOptions.location, formData.location);
      if (loc) parts.push(loc);
    }
    if (formData.city && masterOptions.city) {
      const c = getLabelFromValue(masterOptions.city, formData.city);
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


  useEffect(() => {
    if (!isOpen) return;

 
  }, [isOpen, initialData, masterOptions]);

  /* ---------- handlers ---------- */

  const handleDropdownChange = (field: keyof PropertyFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: '' }));
  };

  const handleAmenitiesToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter(v => v !== value)
        : [...prev.amenities, value],
    }));
  };

  const handleFurnishingItemsToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      furnishingItems: prev.furnishingItems.includes(value)
        ? prev.furnishingItems.filter(v => v !== value)
        : [...prev.furnishingItems, value],
    }));
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

  /* ---------- validation + submit ---------- */

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.propertyType) e.propertyType = 'Property type is required';
    if (!formData.propertySubtype) e.propertySubtype = 'Property subtype is required';
    if (!formData.unitType) e.unitType = 'Unit type is required';
    if (!formData.city) e.city = 'City is required';
    if (!formData.location) e.location = 'Location is required';
    if (!formData.society) e.society = 'Society is required';
    if (!formData.carpetArea) e.carpetArea = 'Carpet area is required';
    if (!formData.budget) e.budget = 'Budget is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // FIXED: buildPayload with proper society_name handling
  const buildPayload = (): FormData => {
    const fd = new FormData();

    const textFields: (keyof PropertyFormData)[] = [
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
  ;

    const societyLabel = getLabelFromValue(societyOptions, formData.society);


    // Use the label if found, otherwise use the raw value, otherwise use empty string
    const finalSocietyName = societyLabel || formData.society || '';
    

    fd.append('society_name', finalSocietyName);

    fd.append("amenities", JSON.stringify(formData.amenities || []));
    fd.append("furnishingItems", JSON.stringify(formData.furnishingItems || []));
    fd.append("nearby_places", JSON.stringify(formData.nearby_places || []));

    if (mode === 'edit') {
      const existingPhotoUrls = photoPreviews.filter(p => p.isExisting).map(p => p.url);
      fd.append("existingPhotoUrls", JSON.stringify(existingPhotoUrls));
      if (ownershipDocPreview?.isExisting) {
        fd.append("existingOwnershipDocUrl", ownershipDocPreview.url);
      }
    }

    if (formData.ownershipDoc) {
      fd.append("ownershipDoc", formData.ownershipDoc, formData.ownershipDoc.name);
    }
    (formData.photos || []).forEach((file) => file && fd.append("photos", file, file.name));

    // Debug: Log all FormData entries
   
    for (let [key, value] of fd.entries()) {
      if (value instanceof File) {
        
      } else {
       
      }
    }
   

    return fd;
  };

  // helper: formData -> UI patch (sirf woh fields jisse Overview turant update ho)
function buildUiPatchFromForm(fd: PropertyFormData, previews: {ownership?: FilePreview|null, photos: FilePreview[]}) {
  return {
    // basic mapping
    seller: fd.seller ? { name: fd.seller } : undefined,
    type: fd.propertyType,
    subtype: fd.propertySubtype,
    unitType: fd.unitType,
    wing: fd.wing,
    unitNo: fd.unitNo,
    furnishing: fd.furnishing,
    furnishingItems: fd.furnishingItems,
    parkingType: fd.parkingType,
    parkingQty: fd.parkingQty,
    city: fd.city,
    location: fd.location,
    society: fd.society,
    floor: fd.floor,
    totalFloors: fd.totalFloors,
    carpetArea: fd.carpetArea,
    builtupArea: fd.builtupArea,
    budget: fd.budget,
    address: fd.address,
    status: fd.status,
    leadSource: fd.leadSource,
    possessionMonth: fd.possessionMonth,
    possessionYear: fd.possessionYear,
    purchaseMonth: fd.purchaseMonth,
    purchaseYear: fd.purchaseYear,
    selling_rights: fd.sellingRights,
    amenities: fd.amenities,
    nearby_places: fd.nearby_places,
    description: fd.description, 
    // ...existing mappings
    bedrooms: fd.bedrooms,
    bathrooms: fd.bathrooms,
    facing: fd.facing,
    priceType: fd.priceType,
    finalPrice: fd.finalPrice,

    // media (instant UI ke liye: existing + newly added previews ke URLs)
    ownershipDocUrl: previews.ownership?.url,
    ownershipDocName: previews.ownership?.name,
    photos: previews.photos.map(p => p.url),

    // hard bump so parent <OverviewTab key=...> remounts
    updated_at: new Date().toISOString(),
  };
}

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorBanner(null);

      // 👇 Yahan pe directly form ka data print kar do
      
     
      console.groupEnd();

      const payload = buildPayload();
      let result;

      if (mode === "edit" && propertyId) {
        result = await propertiesAPI.updateProperty(String(propertyId), payload);
        await Promise.all([
          propertiesAPI.getProperties(),
          propertiesAPI.getProperty(String(propertyId)),
        ]);
      } else {
        result = await propertiesAPI.createProperty(payload);
        const created = result?.data?.data ?? result?.data ?? result;
        const newId = created?.id ?? created?._id ?? null;
        await Promise.all([
          propertiesAPI.getProperties(),
          newId ? propertiesAPI.getProperty(String(newId)) : Promise.resolve(),
        ]);
      }

      const uiPatch = buildUiPatchFromForm(formData, {
        ownership: ownershipDocPreview,
        photos: photoPreviews,
      });
      onSubmit(uiPatch);
      window.dispatchEvent(
        new CustomEvent("overview:refresh", { detail: { id: propertyId } })
      );
      onClose?.();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        `Failed to ${mode === "edit" ? "update" : "create"} property`;
      setErrorBanner(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- options helper ---------- */

  const getOptions = (key: string): MasterOption[] =>
    masterOptions[key] || masterOptions[key.toLowerCase()] || [];

  /* ---------- UI ---------- */

  const modalTitle = mode === 'edit' ? 'Edit Property' : 'Add New Property';
  const submitButtonText = mode === 'edit' ? 'Update Property' : 'Add Property';
  const submitIcon = mode === 'edit' ? Edit : Plus;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} width="max-w-[95vw] md:max-w-4xl lg:max-w-5xl">
      <div className="space-y-4 relative" style={{ minHeight: '320px' }}>
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">{mode === 'edit' ? 'Updating...' : 'Saving...'}</span>
          </div>
        )}

        {errorBanner && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3">
            {errorBanner}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Seller (optional)</label>
            <input
              type="text"
              placeholder="Enter Seller"
              value={formData.seller || ""}
              onChange={(e) => handleInputChange('seller', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Property Type*</label>
            <SafeDropdown
              placeholder="Select Property Type"
              options={getOptions('property type')}
              value={formData.propertyType}
              onChange={handleDropdownChange('propertyType')}
              className="w-full"
            />
            {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Property Subtype*</label>
            <SafeDropdown
              placeholder="Select Property Subtype"
              options={getOptions('property subtype')}
              value={formData.propertySubtype}
              onChange={handleDropdownChange('propertySubtype')}
              className="w-full"
            />
            {errors.propertySubtype && <p className="text-red-500 text-xs mt-1">{errors.propertySubtype}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Unit Type*</label>
            <SafeDropdown
              placeholder="Select Unit Type"
              options={getOptions('unit type')}
              value={formData.unitType}
              onChange={handleDropdownChange('unitType')}
              className="w-full"
            />
            {errors.unitType && <p className="text-red-500 text-xs mt-1">{errors.unitType}</p>}
          </div>


          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Wing</label>
            <input
              type="text"
              placeholder="Wing name/number"
              value={formData.wing}
              onChange={(e) => handleInputChange('wing', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Unit No</label>
            <input
              type="text"
              placeholder="Unit/Flat no"
              value={formData.unitNo}
              onChange={(e) => handleInputChange('unitNo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Furnishing</label>
            <SafeDropdown
              placeholder="Select Furnishing"
              options={getOptions('furnishing')}
              value={formData.furnishing}
              onChange={handleDropdownChange('furnishing')}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Parking Type</label>
            <SafeDropdown
              placeholder="Select Parking Type"
              options={getOptions('parking type')}
              value={formData.parkingType}
              onChange={handleDropdownChange('parkingType')}
              className="w-full"
            />
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Parking Qty</label>
            <SafeDropdown
              placeholder="Select Parking Quantity"
              options={getOptions('parking qty')}
              value={formData.parkingQty}
              onChange={handleDropdownChange('parkingQty')}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City*</label>
            <SafeDropdown
              placeholder="Select City"
              options={getOptions('city')}
              value={formData.city}
              onChange={handleDropdownChange('city')}
              className="w-full"
              searchable
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Location*</label>
            <SafeDropdown
              placeholder="Select Location"
              options={getOptions('location')}
              value={formData.location}
              onChange={handleDropdownChange('location')}
              className="w-full"
              searchable
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Society Name*</label>
            <SafeDropdown
              placeholder="Select Society"
              options={getOptions('society')}
              value={formData.society}
              onChange={handleDropdownChange('society')}
              className="w-full"
              searchable
            />
            {errors.society && <p className="text-red-500 text-xs mt-1">{errors.society}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Total Floors</label>
            <SafeDropdown
              placeholder="Select Total Floors"
              options={getOptions('total floors')}
              value={formData.totalFloors}
              onChange={handleDropdownChange('totalFloors')}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
            <SafeDropdown
              placeholder="Select Floor"
              options={getOptions('floor')}
              value={formData.floor}
              onChange={handleDropdownChange('floor')}
              className="w-full"
            />
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Property Status</label>
            <SafeDropdown
              placeholder="Select Status"
              options={getOptions('property status')}
              value={formData.status}
              onChange={handleDropdownChange('status')}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
            <SafeDropdown
              placeholder="Select Lead Source"
              options={getOptions('lead source')}
              value={formData.leadSource}
              onChange={handleDropdownChange('leadSource')}
              className="w-full"
            />
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Selling Rights</label>
            <SafeDropdown
              placeholder="Select Selling Rights"
              options={getOptions('selling rights')}
              value={formData.sellingRights}
              onChange={handleDropdownChange('sellingRights')}
              className="w-full"
            />
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

          <div>
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
                  const opt = getOptions('amenities').find(o => o.value === val);
                  return (
                    <span key={val} className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-[10px]">
                      {opt?.label || val}
                      <button type="button" onClick={() => handleAmenitiesToggle(val)} className="ml-1 text-purple-500 hover:text-purple-700">×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div>
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
                  const opt = getOptions('furnishing items').find(o => o.value === val);
                  return (
                    <span key={val} className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-[10px]">
                      {opt?.label || val}
                      <button type="button" onClick={() => handleFurnishingItemsToggle(val)} className="ml-1 text-purple-500 hover:text-purple-700">×</button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <textarea
              placeholder="Auto-filled based on selections (editable)"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>

          <div className="md:col-span-2">
            <h3 className="block text-xs font-medium text-gray-700 mb-1">Nearby Places</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Place Name</label>
                  <SafeDropdown
                    placeholder="Select Place"
                    options={getOptions('place name')}
                    value={nearbyPlaceForm.name}
                    onChange={(v) => handleNearbyPlaceInputChange('name', v)}
                    className="w-full"
                    searchable
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Distance</label>
                  <input
                    type="text"
                    className="w-full h-9 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    placeholder="Enter distance"
                    value={nearbyPlaceForm.distance}
                    onChange={(e) => handleNearbyPlaceInputChange('distance', e.target.value)}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    className="w-full h-9 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    value={nearbyPlaceForm.unit}
                    onChange={(e) => handleNearbyPlaceInputChange('unit', e.target.value)}
                  >
                    <option value="">Select Unit</option>
                    <option value="km">km</option>
                    <option value="m">m</option>
                    <option value="min">min</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Place Type</label>
                  <div className="flex gap-2">
                    <SafeDropdown
                      placeholder="Select"
                      options={getOptions('place type')}
                      value={nearbyPlaceForm.type}
                      onChange={(v) => handleNearbyPlaceInputChange('type', v)}
                      className="flex-1"
                      searchable
                    />
                    <button
                      type="button"
                      onClick={addNearbyPlace}
                      className="h-9 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={!nearbyPlaceForm.name || !nearbyPlaceForm.distance || !nearbyPlaceForm.unit || !nearbyPlaceForm.type}
                      title="Add place"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {formData.nearby_places.length === 0 ? (
                  <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded">
                    No nearby places added yet. Fill the form above and click + to add places.
                  </div>
                ) : (
                  formData.nearby_places.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-xs text-gray-700">
                        <span className="font-medium text-blue-600">{place.name}</span>
                        <span className="text-gray-500 ml-2">({place.distance} {place.unit})</span>
                        <span className="text-green-600 ml-2 capitalize">{place.type}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNearbyPlace(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ownership Doc (PDF/JPG/PNG)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleOwnershipDocUpload(e.target.files?.[0] || null)}
                    className="hidden" id="ownership-doc"
                  />
                  <label htmlFor="ownership-doc" className="cursor-pointer">
                    <Upload className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 mb-1">Choose Document</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  </label>
                </div>
              </div>

              {ownershipDocPreview && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Document Preview</label>
                  <FilePreviewComponent preview={ownershipDocPreview} onRemove={removeOwnershipDoc} />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Property Photos (JPG/PNG, Multiple)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => {
                      const selected = Array.from(e.target.files || []);
                      if (selected.length > 0) handlePhotosUpload(selected);
                    }}
                    className="hidden" id="property-photos"
                  />
                  <label htmlFor="property-photos" className="cursor-pointer">
                    <Upload className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 mb-1">{photoPreviews.length > 0 ? 'Add More Photos' : 'Choose Photos'}</p>
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB each</p>
                  </label>
                </div>
              </div>

              {photoPreviews.length > 0 && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Photos Preview ({photoPreviews.length} files)
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {photoPreviews.map((preview, index) => (
                      <FilePreviewComponent key={index} preview={preview} onRemove={() => removePhoto(index)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <PropertyDescriptionAI
          formData={formData}
          setFormData={(u) => setFormData((p) => u(p))}
          endpoint="/api/ai/generate-description"
        />

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {React.createElement(submitIcon, { className: "h-4 w-4 mr-2" })}
            {submitButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PropertyFormModal;
