

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Save, User, Phone as PhoneIcon, MapPin, Star,
  AlertCircle, Home, CreditCard, ChevronDown, Search, IndianRupee, Calendar as CalendarIcon, Briefcase, DollarSign
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { FaWhatsapp } from 'react-icons/fa';
import 'react-phone-input-2/lib/style.css';
import { getMasterDropdownOptions } from '@/lib/useMasterData';
import BudgetInput from '@/pages/dashboard/components/BudgetInput';
import { buyerAPI } from '@/lib/buyerAPI';
import { toast } from 'react-toastify';
import DOBStepCalendar from '../ui/DOBStepCalendar';
import { useAuth } from '@/contexts/AuthContext';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

// ------------------------------
// Helpers (keep the same)
// ------------------------------
const parseMaybeJSON = (val: any) => {
  if (!val) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
};

const formatWhatsappValue = (phone: string) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91')) {
    return `+91 ${digits.slice(2)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits}`;
  }
  return phone.startsWith('+') ? phone : `+${digits}`;
};

const buildFormStateFromBuyer = (b: any) => {
  const req = parseMaybeJSON(b?.requirements) || b?.requirements || {
    propertyType: '',
    unitTypes: [],
    preferredLocations: [],
    amenities: [],
    furnishing: '',
    possession: '',
    facing: '',
    floor: '',
    specialRequirements: ''
  };

  const fin = parseMaybeJSON(b?.financials) || b?.financials || {
    loanRequired: false,
    loanAmount: '',
    downPayment: '',
    monthlyIncome: '',
    bankPreference: '',
    loanStatus: '',
    creditScore: ''
  };

  return {
    salutation: b?.salutation ?? 'Mr.',
    name: b?.name ?? '',
    phone: b?.phone ?? '',
    dob: b?.dob ?? b?.buyer_dob ?? '',
    whatsapp_number: b?.whatsapp_number ? formatWhatsappValue(b.whatsapp_number) : (b?.whatsapp ? formatWhatsappValue(b.whatsapp) : ''),
    email: b?.email ?? '',
    state: b?.state ?? '',
    city: b?.city ?? '',
    location: b?.location ?? '',
    buyer_lead_priority: b?.buyer_lead_priority ?? b?.priority ?? '',
    buyer_lead_source: b?.buyer_lead_source ?? b?.source ?? '',
    buyer_lead_stage: b?.buyer_lead_stage ?? b?.stage ?? '',
    buyer_lead_status: b?.buyer_lead_status ?? b?.status ?? '',
    budget_min: b?.budget_min ?? b?.budget?.min ?? '',
    budget_max: b?.budget_max ?? b?.budget?.max ?? '',
    requirements: {
      propertyType: req?.propertyType ?? '',
      unitTypes: Array.isArray(req?.unitTypes) ? req.unitTypes : [],
      preferredLocations: Array.isArray(req?.preferredLocations) ? req.preferredLocations : [],
      amenities: Array.isArray(req?.amenities) ? req.amenities : [],
      furnishing: req?.furnishing ?? '',
      possession: req?.possession ?? '',
      facing: req?.facing ?? '',
      floor: req?.floor ?? '',
      specialRequirements: req?.specialRequirements ?? ''
    },
    financials: {
      loanRequired: !!fin?.loanRequired,
      loanAmount: fin?.loanAmount ?? '',
      downPayment: fin?.downPayment ?? '',
      monthlyIncome: fin?.monthlyIncome ?? '',
      bankPreference: fin?.bankPreference ?? '',
      loanStatus: fin?.loanStatus ?? '',
      creditScore: fin?.creditScore ?? ''
    },
  };
};

const dedupeByValue = (opts: any[] = []) =>
  Array.from(new Map(opts.map(o => [o?.value, o])).values());

const toCanonical = (opts: { value: any; label: any }[] = [], incoming: any) => {
  if (incoming === null || incoming === undefined) return '';
  const s = String(incoming).trim();
  if (!s) return '';

  const byValue = opts.find(o => String(o.value).toLowerCase() === s.toLowerCase());
  if (byValue) return byValue.value;

  const byLabel = opts.find(o => String(o.label).toLowerCase() === s.toLowerCase());
  if (byLabel) return byLabel.value;

  return s;
};

const arrToCanonical = (opts: { value: any; label: any }[] = [], arr: any[] = []) =>
  (Array.isArray(arr) ? arr : [])
    .map(v => toCanonical(opts, v))
    .filter(Boolean);

const arePhoneNumbersSame = (phone1: string, phone2: string) => {
  if (!phone1 || !phone2) return false;
  const digits1 = String(phone1).replace(/\D/g, '');
  const digits2 = String(phone2).replace(/\D/g, '');
  const last10_1 = digits1.slice(-10);
  const last10_2 = digits2.slice(-10);
  return last10_1 === last10_2 && last10_1.length === 10;
};

// ------------------------------
// Fixed MultiSelectDropdown with proper closing behavior
// ------------------------------
const MultiSelectDropdown = ({
  label,
  options,
  selectedValues = [],
  onToggle,
  placeholder,
  withSearch = false
}: {
  label: string;
  options: any[];
  selectedValues?: any[];
  onToggle: (val: any) => void;
  placeholder: string;
  withSearch?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = useMemo(() => {
    if (!withSearch || !searchTerm) return safeOptions;
    const t = searchTerm.toLowerCase();
    return safeOptions.filter((o) => o?.label?.toLowerCase().includes(t));
  }, [withSearch, searchTerm, safeOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
      if (event.key === 'Tab' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && withSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, withSearch]);

  const handleToggle = (val: any) => {
    onToggle(val);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: MU }}>{label}</label>
      <button
        type="button"
        className="border rounded-lg w-full h-8 px-2.5 text-[11px] text-left focus:outline-none focus:ring-1 transition-all flex items-center justify-between bg-white"
        style={{ borderColor: BD }}
        onClick={() => {
          setIsOpen(prev => !prev);
          setSearchTerm('');
        }}
      >
        <span className="truncate" style={{ color: selectedValues.length > 0 ? N : MU }}>
          {selectedValues.length > 0
            ? selectedValues.slice(0, 2).join(', ') + (selectedValues.length > 2 ? ` +${selectedValues.length - 2}` : '')
            : placeholder}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: MU }} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-hidden" style={{ borderColor: BD }}>
          {withSearch && (
            <div className="p-1.5 border-b sticky top-0 bg-white z-10" style={{ borderColor: BD }}>
              <div className="relative">
                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[10px] border rounded-md focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-32">
            {filteredOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-1.5 hover:bg-gray-50 cursor-pointer gap-2 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleToggle(option.value)}
                  className="h-3 w-3 rounded"
                  style={{ accentColor: O }}
                />
                <span className="text-[10px]" style={{ color: N }}>{option.label}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-[10px] text-center" style={{ color: MU }}>No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Single-select Searchable Dropdown ----------
const SearchableSelectDropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select",
  required = false,
}: {
  label: string;
  options?: any[];
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  required?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return safeOptions;
    const t = searchTerm.toLowerCase();
    return safeOptions.filter((o) =>
      (o?.label || '').toLowerCase().includes(t)
    );
  }, [safeOptions, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsOpen(false); setSearchTerm(''); }
      if (event.key === 'Tab' && isOpen) { setIsOpen(false); setSearchTerm(''); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (val: any) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Find the label for the current value
  const selectedLabel = safeOptions.find(o => o.value === value)?.label || '';

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: MU }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <button
        type="button"
        className="border rounded-lg w-full h-8 px-2.5 text-[11px] text-left focus:outline-none focus:ring-1 transition-all flex items-center justify-between bg-white"
        style={{ borderColor: BD }}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="truncate" style={{ color: value ? N : MU }}>
          {value ? selectedLabel : placeholder}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: MU }} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-hidden" style={{ borderColor: BD }}>
          <div className="p-1.5 border-b sticky top-0 bg-white z-10" style={{ borderColor: BD }}>
            <div className="relative">
              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-[10px] border rounded-md focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-32">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center p-1.5 hover:bg-gray-50 cursor-pointer gap-2 transition-colors ${
                    value === option.value ? 'bg-orange-50' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="text-[10px]" style={{ color: N }}>{option.label}</span>
                </div>
              ))
            ) : (
              <div className="p-2 text-[10px] text-center" style={{ color: MU }}>No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- date helpers ----------
const TODAY = new Date();
const pad2 = (n: number) => String(n).padStart(2, '0');
const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const EIGHTEEN_YEARS_BACK = new Date(
  TODAY.getFullYear() - 18,
  TODAY.getMonth(),
  TODAY.getDate()
);
const ISO_18Y_BACK = toISODate(EIGHTEEN_YEARS_BACK);

// Form Field Component
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
}> = ({ label, required, children, icon, error }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[9px] mt-0.5">{error}</p>}
  </div>
);

// ------------------------------
// Main Component
// ------------------------------
const BuyerFormModal = ({
  isOpen,
  onClose,
  buyer,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  buyer?: any;
  onSave?: (payload: any) => void;
}) => {
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<any>({});
  const [touched, setTouched] = useState({ minBudget: false, maxBudget: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => buildFormStateFromBuyer(buyer || {}));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const calcAge = (iso?: string) => {
    if (!iso) return 0;
    const d = new Date(iso);
    const today = new Date();
    let a = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
    return a;
  };

  const age = useMemo(() => calcAge(formData.dob), [formData.dob]);
  const ageError = formData.dob ? (age < 18 ? 'Buyer must be at least 18 years old' : '') : '';

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'buyer', 'property', 'lead']);
        setMasters(data || {});
      } catch (err) {
        console.error('Error fetching master options:', err);
      } finally {
        setMasterLoading(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const newFormData = buildFormStateFromBuyer(buyer || {});
      if (!buyer?.id) {
        const dept = (user?.department || '').toLowerCase();
        const role = (user?.role || '').toLowerCase();
        if ((dept.includes('presale') || dept.includes('sales')) && role.includes('executive')) {
          (newFormData as any).assigned_executive = String(user.id);
        }
      }
      setFormData(newFormData);

      // Determine sameAsPhone
      if (newFormData.phone) {
        const phoneDigits = String(newFormData.phone).replace(/\D/g, '');
        const waDigits = String(newFormData.whatsapp_number).replace(/\D/g, '');
        setSameAsPhone(!!waDigits && phoneDigits.slice(-10) === waDigits.slice(-10));
      } else {
        setSameAsPhone(false);
      }
    }
  }, [isOpen, buyer, user]);

  const getMasterOptions = (key: string) => dedupeByValue(masters?.[key] || []);

  const stateOptions = masters['state'] || [];
  const cityOptions = masters['city'] || [];
  const locationOptions = masters['location'] || [];

  const filteredCities = useMemo(() => cityOptions.filter((c: any) => !formData.state || c.parentValue === formData.state), [cityOptions, formData.state]);
  const filteredLocations = useMemo(() => locationOptions.filter((l: any) => {
    if (formData.city && l.parentValue === formData.city) return true;
    if (!formData.city && formData.state && l.grandParentValue === formData.state) return true;
    return !formData.state && !formData.city;
  }), [locationOptions, formData.city, formData.state]);

  useEffect(() => {
    if (!isOpen || masterLoading) return;

    const buyerReqs = parseMaybeJSON(buyer?.requirements) || buyer?.requirements || {};

    setFormData(prev => {
      const propertyTypeOpts = getMasterOptions('property type');
      const unitTypeOpts = getMasterOptions('unit type');
      const locationOpts = getMasterOptions('location');
      const amenitiesOpts = getMasterOptions('amenities');
      const furnishingOpts = getMasterOptions('furnishing');
      const possessionOpts = getMasterOptions('possession');
      const facingOpts = getMasterOptions('facing');
      const floorOpts = getMasterOptions('floor preference');
      const salutationOpts = getMasterOptions('salutation');

      const updatedData = {
        ...prev,
        salutation: toCanonical(salutationOpts, prev.salutation ?? buyer?.salutation),
        buyer_lead_source: toCanonical(getMasterOptions('buyer lead source'), prev.buyer_lead_source ?? buyer?.buyer_lead_source ?? buyer?.source),
        buyer_lead_priority: toCanonical(getMasterOptions('lead priority'), prev.buyer_lead_priority ?? buyer?.buyer_lead_priority ?? buyer?.priority),
        buyer_lead_stage: toCanonical(getMasterOptions('buyer lead stage'), prev.buyer_lead_stage ?? buyer?.buyer_lead_stage ?? buyer?.stage),
        buyer_lead_status: toCanonical(getMasterOptions('buyer lead status'), prev.buyer_lead_status ?? buyer?.buyer_lead_status ?? buyer?.status),
        requirements: {
          ...prev.requirements,
          propertyType: toCanonical(propertyTypeOpts, prev.requirements?.propertyType ?? buyerReqs?.propertyType ?? ''),
          unitTypes: arrToCanonical(unitTypeOpts, prev.requirements?.unitTypes ?? buyerReqs?.unitTypes ?? []),
          preferredLocations: arrToCanonical(locationOpts, prev.requirements?.preferredLocations ?? buyerReqs?.preferredLocations ?? []),
          amenities: arrToCanonical(amenitiesOpts, prev.requirements?.amenities ?? buyerReqs?.amenities ?? []),
          furnishing: toCanonical(furnishingOpts, prev.requirements?.furnishing ?? buyerReqs?.furnishing ?? ''),
          possession: toCanonical(possessionOpts, prev.requirements?.possession ?? buyerReqs?.possession ?? ''),
          facing: toCanonical(facingOpts, prev.requirements?.facing ?? buyerReqs?.facing ?? ''),
          floor: toCanonical(floorOpts, prev.requirements?.floor ?? buyerReqs?.floor ?? ''),
        },
      };

      return updatedData;
    });
  }, [isOpen, masterLoading, buyer, masters]);

  if (!isOpen) return null;

  const bankOptions = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'PNB', 'BOB'];
  const loanStatuses = ['not_applied', 'applied', 'pre_approved', 'approved', 'rejected'];

  const handlePhoneChange = (value: string) => {
    setFormData(prev => {
      const updated = { ...prev, phone: value };
      if (sameAsPhone) {
        (updated as any).whatsapp_number = formatWhatsappValue(value);
      }
      return updated;
    });
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp_number: formatWhatsappValue(formData.phone) }));
    }
  };

  const setReq = (patch: any) =>
    setFormData(prev => ({ ...prev, requirements: { ...prev.requirements, ...patch } }));
  const setFin = (patch: any) =>
    setFormData(prev => ({ ...prev, financials: { ...prev.financials, ...patch } }));

  const handleBudgetFocus = (field: 'minBudget' | 'maxBudget') =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const handleBudgetChange = (field: 'budget_min' | 'budget_max', value: any) => {
    setTouched(prev => ({ ...prev, [field === 'budget_min' ? 'minBudget' : 'maxBudget']: true }));
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: any) => {
    const exists = formData.requirements.amenities.includes(amenity);
    const amenities = exists
      ? formData.requirements.amenities.filter((a: any) => a !== amenity)
      : [...formData.requirements.amenities, amenity];
    setReq({ amenities });
  };

  const togglePreferredLocation = (loc: any) => {
    const exists = formData.requirements.preferredLocations.includes(loc);
    const preferredLocations = exists
      ? formData.requirements.preferredLocations.filter((l: any) => l !== loc)
      : [...formData.requirements.preferredLocations, loc];
    setReq({ preferredLocations });
  };

  const removePreferredLocation = (loc: any) =>
    setReq({
      preferredLocations: formData.requirements.preferredLocations.filter((l: any) => l !== loc),
    });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const localPhone = phoneDigits.startsWith('91') ? phoneDigits.slice(2) : phoneDigits;
      if (localPhone.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }
    
    if (ageError) {
      newErrors.dob = ageError;
    }
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        assigned_executive: (formData as any).assigned_executive ??
          (user?.role?.toLowerCase().includes('executive') ? user.id : null),
        budget_min: formData.budget_min,
        budget_max: formData.budget_max,
        requirements: JSON.stringify(formData.requirements || {}),
        financials: JSON.stringify(formData.financials || {}),
        created_at: buyer?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      let response;
      if (buyer?.id) {
        response = await buyerAPI.update(buyer.id, payload);
      } else {
        response = await buyerAPI.create(payload);
      }

      if (onSave && typeof onSave === 'function') {
        onSave(response);
      }

      onClose?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Unknown error';
      toast.error(`Failed to save buyer: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLabel = (key: string, val: any) =>
    (getMasterOptions(key).find((o: any) => o.value === val)?.label ?? val);

  if (masterLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: O }} />
            <p className="mt-4 text-xs" style={{ color: MU }}>Loading master data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ border: `1px solid ${BD}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <User size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{buyer ? 'Edit Buyer' : 'Add New Buyer'}</h2>
              <p className="text-[9px] text-white/70">Enter buyer information and requirements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Basic Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <User size={12} style={{ color: O }} /> Basic Information
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="col-span-1">
                    <FormField label="Salutation" required>
                      <select
                        value={formData.salutation}
                        onChange={(e) => setFormData(prev => ({ ...prev, salutation: e.target.value }))}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {getMasterOptions('salutation').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <div className="col-span-2">
                    <FormField label="Full Name" required error={errors.name}>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Full name"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <PhoneIcon size={12} style={{ color: O }} /> Contact Information
                </h3>
                <div className="space-y-2">
                  <FormField label="Phone" required error={errors.phone}>
                    <PhoneInput
                      country={'in'}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      inputClass="!w-full !h-7 !rounded-lg !border-gray-200 !text-[10px] focus:!ring-1 focus:!ring-orange-500"
                    />
                  </FormField>

                  <div>
                    <label className="flex items-center gap-2 text-[9px] mb-1" style={{ color: MU }}>
                      <FaWhatsapp className="text-green-500" size={10} /> WhatsApp Number
                      <div className="ml-auto flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsPhone}
                            onChange={e => handleSameAsPhoneToggle(e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`w-6 h-3 rounded-full relative transition-colors ${sameAsPhone ? 'bg-orange-500' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 left-0.5 bg-white w-2 h-2 rounded-full transition-transform ${sameAsPhone ? 'translate-x-3' : 'translate-x-0'}`} />
                          </span>
                          <span className="ml-1 text-[8px]" style={{ color: MU }}>{sameAsPhone ? 'Same' : 'Different'}</span>
                        </label>
                      </div>
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                      className={`border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white ${sameAsPhone ? 'bg-gray-100' : ''}`}
                      style={{ borderColor: BD }}
                      placeholder="WhatsApp number"
                      disabled={sameAsPhone}
                    />
                  </div>

                  <FormField label="Email">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                      placeholder="Email address"
                    />
                  </FormField>

                  <FormField label="Date of Birth">
                    <DOBStepCalendar
                      value={formData.dob}
                      onChange={(iso) => setFormData(prev => ({ ...prev, dob: iso }))}
                      label=""
                      placeholder="Select date of birth"
                      size="sm"
                      max={ISO_18Y_BACK}
                    />
                    {ageError && <p className="text-red-500 text-[8px] mt-0.5">{ageError}</p>}
                  </FormField>
                </div>
              </div>

              {/* Location Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <MapPin size={12} style={{ color: O }} /> Location
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <FormField label="State">
                    {stateOptions.length ? (
                      <select
                        value={formData.state || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, city: '', location: '' }))}
                        className="w-full border rounded-lg h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select State</option>
                        {stateOptions.map((s: any) => (<option key={s.value ?? s.label} value={s.value ?? s.label}>{s.label ?? s.value}</option>))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="State"
                      />
                    )}
                  </FormField>
                  <FormField label="City">
                    {filteredCities.length || cityOptions.length ? (
                      <select
                        value={formData.city || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, location: '' }))}
                        className="w-full border rounded-lg h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select City</option>
                        {(filteredCities.length ? filteredCities : cityOptions).map((c: any) => (<option key={c.value ?? c.label} value={c.value ?? c.label}>{c.label ?? c.value}</option>))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="City"
                      />
                    )}
                  </FormField>
                <FormField label="Location/Area" className="col-span-2">
  {(filteredLocations.length || locationOptions.length) ? (
    <SearchableSelectDropdown
      label=""
      options={(filteredLocations.length ? filteredLocations : locationOptions).map((l: any) => ({
        value: l.value ?? l.label,
        label: l.label ?? l.value
      }))}
      value={formData.location}
      onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
      placeholder="Select Location"
    />
  ) : (
    <input
      type="text"
      value={formData.location}
      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
      style={{ borderColor: BD }}
      placeholder="Location/area"
    />
  )}
</FormField>
                </div>
              </div>

              {/* Business Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <Briefcase size={12} style={{ color: O }} /> Business Info
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  <FormField label="Source">
                    <select
                      value={formData.buyer_lead_source}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_source: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('buyer lead source').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Priority">
                    <select
                      value={formData.buyer_lead_priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_priority: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('lead priority').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Stage">
                    <select
                      value={formData.buyer_lead_stage}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_stage: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('buyer lead stage').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <select
                      value={formData.buyer_lead_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_status: e.target.value }))}
                      className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select</option>
                      {getMasterOptions('buyer lead status').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Budget Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <DollarSign size={12} style={{ color: O }} /> Budget (Min-Max)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <BudgetInput
                    value={formData.budget_min}
                    onChange={(v: any) => handleBudgetChange('budget_min', v)}
                    onFocus={() => handleBudgetFocus('minBudget')}
                    error={touched.minBudget && !formData.budget_min ? 'Required' : ''}
                  />
                  <BudgetInput
                    value={formData.budget_max}
                    onChange={(v: any) => handleBudgetChange('budget_max', v)}
                    onFocus={() => handleBudgetFocus('maxBudget')}
                    error={touched.maxBudget && !formData.budget_max ? 'Required' : ''}
                  />
                </div>
              </div>

              {/* Property Requirements */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <Home size={12} style={{ color: O }} /> Property Requirements
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Property Type">
                      <select
                        value={formData?.requirements?.propertyType || ""}
                        onChange={(e) => setReq({ propertyType: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {getMasterOptions("property type").map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>

                    <MultiSelectDropdown
                      label="Unit Type"
                      options={getMasterOptions('unit type')}
                      selectedValues={formData.requirements.unitTypes || []}
                      onToggle={(val) => {
                        const cur = formData.requirements.unitTypes || [];
                        const updated = cur.includes(val) ? cur.filter((v: any) => v !== val) : [...cur, val];
                        setReq({ unitTypes: updated });
                      }}
                      placeholder="Select"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Furnishing">
                      <select
                        value={formData.requirements.furnishing}
                        onChange={(e) => setReq({ furnishing: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('furnishing').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Possession">
                      <select
                        value={formData.requirements.possession}
                        onChange={(e) => setReq({ possession: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('possession').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Facing">
                      <select
                        value={formData.requirements.facing}
                        onChange={(e) => setReq({ facing: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('facing').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Floor Preference">
                      <select
                        value={formData.requirements.floor}
                        onChange={(e) => setReq({ floor: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Any</option>
                        {getMasterOptions('floor preference').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <MultiSelectDropdown
                    label="Preferred Locations"
                    options={getMasterOptions('location')}
                    selectedValues={formData.requirements.preferredLocations}
                    onToggle={togglePreferredLocation}
                    placeholder="Select locations"
                    withSearch
                  />

                  <MultiSelectDropdown
                    label="Required Amenities"
                    options={getMasterOptions('amenities')}
                    selectedValues={formData.requirements.amenities}
                    onToggle={toggleAmenity}
                    placeholder="Select amenities"
                    withSearch
                  />

                  <FormField label="Special Requirements">
                    <textarea
                      value={formData.requirements.specialRequirements}
                      onChange={(e) => setReq({ specialRequirements: e.target.value })}
                      className="border rounded-lg w-full px-2 py-1 text-[10px] focus:outline-none focus:ring-1 bg-white resize-none"
                      style={{ borderColor: BD }}
                      placeholder="Any specific requirements..."
                      rows={2}
                    />
                  </FormField>
                </div>
              </div>

              {/* Financial Information */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <CreditCard size={12} style={{ color: O }} /> Financial
                </h3>
                <div className="flex items-center mb-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.financials.loanRequired}
                      onChange={(e) => setFin({ loanRequired: e.target.checked })}
                      className="sr-only"
                    />
                    <span className={`w-6 h-3 rounded-full relative transition-colors ${formData.financials.loanRequired ? 'bg-orange-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 bg-white w-2 h-2 rounded-full transition-transform ${formData.financials.loanRequired ? 'translate-x-3' : 'translate-x-0'}`} />
                    </span>
                    <span className="ml-2 text-[9px] font-medium" style={{ color: N }}>Loan Required</span>
                  </label>
                </div>

                {formData.financials.loanRequired && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <FormField label="Loan Amount (₹)">
                      <input
                        type="number"
                        value={formData.financials.loanAmount}
                        onChange={(e) => setFin({ loanAmount: parseFloat(e.target.value) || 0 })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Amount"
                      />
                    </FormField>
                    <FormField label="Down Payment (₹)">
                      <input
                        type="number"
                        value={formData.financials.downPayment}
                        onChange={(e) => setFin({ downPayment: parseFloat(e.target.value) || 0 })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Down payment"
                      />
                    </FormField>
                    <FormField label="Monthly Income (₹)">
                      <input
                        type="number"
                        value={formData.financials.monthlyIncome}
                        onChange={(e) => setFin({ monthlyIncome: parseFloat(e.target.value) || 0 })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="Income"
                      />
                    </FormField>
                    <FormField label="Bank Preference">
                      <select
                        value={formData.financials.bankPreference}
                        onChange={(e) => setFin({ bankPreference: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {bankOptions.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Loan Status">
                      <select
                        value={formData.financials.loanStatus}
                        onChange={(e) => setFin({ loanStatus: e.target.value })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Select</option>
                        {loanStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Credit Score">
                      <input
                        type="number"
                        value={formData.financials.creditScore}
                        onChange={(e) => setFin({ creditScore: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white"
                        style={{ borderColor: BD }}
                        placeholder="300-900"
                        min={300}
                        max={900}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center">
            <AlertCircle size={12} style={{ color: MU }} />
            <span className="text-[8px] ml-1" style={{ color: MU }}>Fields marked with * are required</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50"
              style={{ border: `1px solid ${BD}`, color: N }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
              style={{ background: O }}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={10} />
                  {buyer ? 'Update Buyer' : 'Create Buyer'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerFormModal;