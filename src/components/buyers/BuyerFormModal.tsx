import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Save, User, Phone as PhoneIcon, MapPin, Star,
  AlertCircle, Home, CreditCard, ChevronDown, Search, IndianRupee
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { FaWhatsapp } from 'react-icons/fa';
import 'react-phone-input-2/lib/style.css';
import { getMasterDropdownOptions } from '@/lib/useMasterData';
import BudgetInput from '@/pages/dashboard/components/BudgetInput';
import { buyerAPI } from '@/lib/buyerAPI';
import { toast } from 'react-toastify';
import DOBStepCalendar from '../ui/DOBStepCalendar';

// ------------------------------
// Helpers
// ------------------------------
const parseMaybeJSON = (val: any) => {
  if (!val) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
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
    dob: b?.dob ?? '',
    // accept both shapes
    whatsapp_number: b?.whatsapp_number ?? b?.whatsapp ?? '',
    email: b?.email ?? '',
    state: b?.state ?? '',
    city: b?.city ?? '',
    location: b?.location ?? '',
    // accept both shapes
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

// Convert any incoming label/value into the canonical option.value (case-insensitive)
const toCanonical = (opts: { value: any; label: any }[] = [], incoming: any) => {
  if (incoming === null || incoming === undefined) return '';
  const s = String(incoming).trim();
  if (!s) return '';

  const byValue = opts.find(o => String(o.value).toLowerCase() === s.toLowerCase());
  if (byValue) return byValue.value;

  const byLabel = opts.find(o => String(o.label).toLowerCase() === s.toLowerCase());
  if (byLabel) return byLabel.value;

  return s; // fallback: leave as-is
};

// Canonicalize an array of incoming values/labels to the available options
const arrToCanonical = (opts: { value: any; label: any }[] = [], arr: any[] = []) =>
  (Array.isArray(arr) ? arr : [])
    .map(v => toCanonical(opts, v))
    .filter(Boolean);

// Helper function to check if two phone numbers are same (ignoring country code)
const arePhoneNumbersSame = (phone1: string, phone2: string) => {
  if (!phone1 || !phone2) return false;

  // Remove all non-digit characters
  const digits1 = String(phone1).replace(/\D/g, '');
  const digits2 = String(phone2).replace(/\D/g, '');

  // Get last 10 digits for comparison (typical Indian mobile number)
  const last10_1 = digits1.slice(-10);
  const last10_2 = digits2.slice(-10);

  return last10_1 === last10_2 && last10_1.length === 10;
};

// ------------------------------
// MultiSelect Dropdown (local component)
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

  const safeOptions = Array.isArray(options) ? options : [];

  const filteredOptions = useMemo(() => {
    if (!withSearch || !searchTerm) return safeOptions;
    const t = searchTerm.toLowerCase();
    return safeOptions.filter((o) => o?.label?.toLowerCase().includes(t));
  }, [withSearch, searchTerm, safeOptions]);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        className="border border-gray-300 rounded w-full h-8 px-3 text-left text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
        onClick={() => setIsOpen(v => !v)}
      >
        <span className="text-gray-500 truncate">
          {selectedValues.length > 0
            ? selectedValues.slice(0, 2).join(', ') + (selectedValues.length > 2 ? ` +${selectedValues.length - 2} more` : '')
            : placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {withSearch && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-32">
            {filteredOptions.map((option) => (
              <label key={option.value} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                />
                <span className="text-xs">{option.label}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-xs text-gray-500">No options</div>
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

  // empty DOB par error mat dikhao; filled ho aur <18 ho to error
  const ageError = formData.dob
    ? (age < 18 ? 'Buyer must be at least 18 years old' : '')
    : '';
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
    const newFormData = buildFormStateFromBuyer(buyer || {});
    setFormData(newFormData);

    // Set sameAsPhone toggle based on whether phone and whatsapp numbers are same
    if (buyer && buyer.phone && (buyer.whatsapp_number || buyer.whatsapp)) {
      const phoneSame = arePhoneNumbersSame(buyer.phone, buyer.whatsapp_number || buyer.whatsapp);
      setSameAsPhone(phoneSame);
    } else {
      setSameAsPhone(false);
    }

    if (buyer && buyer.id) {
      // edit mode
      console.log('BuyerFormModal: EDIT MODE', buyer);
    } else {
      console.log('BuyerFormModal: CREATE MODE');
    }
  }, [buyer]);

  const getMasterOptions = (key: string) => dedupeByValue(masters?.[key] || []);

  // Normalize edit-mode values to canonical option.value once masters are ready
  useEffect(() => {
    if (!isOpen || masterLoading) return;

    // Get raw requirements from buyer (handles both shapes)
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

        // Canonicalize top-level business fields + salutation
        salutation: toCanonical(salutationOpts, prev.salutation ?? buyer?.salutation),
        buyer_lead_source: toCanonical(getMasterOptions('buyer lead source'), prev.buyer_lead_source ?? buyer?.buyer_lead_source ?? buyer?.source),
        buyer_lead_priority: toCanonical(getMasterOptions('lead priority'), prev.buyer_lead_priority ?? buyer?.buyer_lead_priority ?? buyer?.priority),
        buyer_lead_stage: toCanonical(getMasterOptions('buyer lead stage'), prev.buyer_lead_stage ?? buyer?.buyer_lead_stage ?? buyer?.stage),
        buyer_lead_status: toCanonical(getMasterOptions('buyer lead status'), prev.buyer_lead_status ?? buyer?.buyer_lead_status ?? buyer?.status),

        // Canonicalize nested requirements
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
        // Remove country code and non-digits, keep last 10 digits typical for IN
        const digits = String(value).replace(/\D/g, '');
        const last10 = digits.slice(-10);
        (updated as any).whatsapp_number = last10;
      }
      return updated;
    });
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      const digits = String(formData.phone).replace(/\D/g, '');
      const last10 = digits.slice(-10);
      setFormData(prev => ({ ...prev, whatsapp_number: last10 }));
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

  const handleSave = async () => {
    if (!String(formData.name || '').trim()) {
      alert('Please enter buyer name');
      return;
    }
    if (!String(formData.phone || '').trim()) {
      alert('Please enter phone number');
      return;
    }

    const minBudget = parseInt(String(formData.budget_min).replace(/,/g, ''), 10) || 0;
    const maxBudget = parseInt(String(formData.budget_max).replace(/,/g, ''), 10) || 0;

    if (!minBudget || !maxBudget) {
      setTouched({ minBudget: true, maxBudget: true });
      alert('Please enter valid budget range');
      return;
    }
    if (minBudget >= maxBudget) {
      alert('Maximum budget should be greater than minimum budget');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        budget_min: minBudget,
        budget_max: maxBudget,
        // Stringify nested for MySQL storage
        requirements: JSON.stringify(formData.requirements || {}),
        financials: JSON.stringify(formData.financials || {}),
        created_at: buyer?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let response;
      if (buyer?.id) {
        response = await buyerAPI.update(buyer.id, payload);
        toast.success("Buyer updated successfully!");
      } else {
        response = await buyerAPI.create(payload);
        toast.success("Buyer created successfully!");
      }
      if (onSave) onSave((response as any)?.data || response);
      //  toast.success("Buyer saved successfully!");
      onClose?.();
    } catch (error: any) {
      console.error('Error saving buyer:', error);
      const msg = error?.response?.data?.message || error?.message || 'Unknown error';
      toast.error(`Failed to save buyer: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Age helpers (INSIDE BuyerFormModal, return se pehle) ----



  const getLabel = (key: string, val: any) =>
    (getMasterOptions(key).find((o: any) => o.value === val)?.label ?? val);

  if (masterLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading master data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{buyer ? 'Edit Buyer' : 'Add New Buyer'}</h2>
              <p className="text-gray-600 mt-1 text-xs">Enter buyer information and requirements</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-2 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Salutation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.salutation}
                      onChange={(e) => setFormData(prev => ({ ...prev, salutation: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {getMasterOptions('salutation').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-9">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhoneIcon className="mr-2" size={20} />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={'in'}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      inputClass="!w-full !h-8 !rounded !border-gray-300 !text-xs focus:!ring-1 focus:!ring-blue-500 focus:!border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FaWhatsapp className="text-green-500" /> WhatsApp Number
                      <div className="ml-auto flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsPhone}
                            onChange={e => handleSameAsPhoneToggle(e.target.checked)}
                            className="sr-only"
                          />
                          <span className={`w-8 h-4 rounded-full relative transition-colors duration-200 ease-in-out ${sameAsPhone ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ease-in-out ${sameAsPhone ? 'translate-x-4' : 'translate-x-0'}`} />
                          </span>
                          <span className="ml-2 text-xs text-gray-600">{sameAsPhone ? 'Same as phone' : 'Different'}</span>
                        </label>
                      </div>
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                      placeholder="WhatsApp number (without country code)"
                      className={`border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${sameAsPhone ? 'bg-gray-100' : ''}`}
                      disabled={sameAsPhone}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <DOBStepCalendar
                      value={formData.dob || ''}
                      onChange={(iso) => setFormData(prev => ({ ...prev, dob: iso }))}
                      label="Date of Birth"
                      placeholder="Select date of birth"
                      size="sm"
                      max={ISO_18Y_BACK}
                    />
                    {ageError && <p className="mt-1 text-[11px] text-red-600">{ageError}</p>}
                  </div>




                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Location Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location/Area</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter location/area"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="mr-2" size={20} />
                  Business Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                    <select
                      value={formData.buyer_lead_source}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_source: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Source</option>
                      {getMasterOptions('buyer lead source').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.buyer_lead_priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_priority: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Priority</option>
                      {getMasterOptions('lead priority').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
                    <select
                      value={formData.buyer_lead_stage}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_stage: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Stage</option>
                      {getMasterOptions('buyer lead stage').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.buyer_lead_status}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyer_lead_status: e.target.value }))}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      {getMasterOptions('buyer lead status').map((o: any) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-3 space-y-6">
              {/* Budget Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="mr-2" size={20} />
                  Budget Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BudgetInput
                    // label="Minimum Budget"
                    value={formData.budget_min}
                    onChange={(v: any) => handleBudgetChange('budget_min', v)}
                    onFocus={() => handleBudgetFocus('minBudget')}
                    error={touched.minBudget && !formData.budget_min ? 'Minimum budget is required' : ''}
                  />
                  <BudgetInput
                    // label="Maximum Budget"
                    value={formData.budget_max}
                    onChange={(v: any) => handleBudgetChange('budget_max', v)}
                    onFocus={() => handleBudgetFocus('maxBudget')}
                    error={touched.maxBudget && !formData.budget_max ? 'Maximum budget is required' : ''}
                  />
                </div>
              </div>

              {/* Property Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="mr-2" size={20} />
                  Property Requirements
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Property Type
                      </label>
                      <select
                        value={formData?.requirements?.propertyType || ""}   // 🔥 safe fallback
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            requirements: {
                              ...prev.requirements,
                              propertyType: e.target.value,
                            },
                          }))
                        }
                        className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Property Type</option>
                        {getMasterOptions("property type").map((o: any) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>

                      {/* 🔽 Niche user ka selected property dikhao
                      {formData?.requirements?.propertyType && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selected Property: <b>{formData.requirements.propertyType}</b>
                        </p>
                      )} */}
                    </div>

                    <div>
                      <MultiSelectDropdown
                        label="Unit Type"
                        options={getMasterOptions('unit type')}
                        selectedValues={formData.requirements.unitTypes || []}
                        onToggle={(val) => {
                          const cur = formData.requirements.unitTypes || [];
                          const updated = cur.includes(val) ? cur.filter((v: any) => v !== val) : [...cur, val];
                          setReq({ unitTypes: updated });
                        }}
                        placeholder="Select unit types"
                      />
                      {formData.requirements.unitTypes?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.requirements.unitTypes.map((ut: any) => (
                            <span key={ut} className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              {getLabel('unit type', ut)}
                              <button
                                type="button"
                                onClick={() => setReq({ unitTypes: (formData.requirements.unitTypes || []).filter((v: any) => v !== ut) })}
                                className="ml-1 text-green-500 hover:text-green-700"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Furnishing</label>
                      <select
                        value={formData.requirements.furnishing}
                        onChange={(e) => setReq({ furnishing: e.target.value })}
                        className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Any</option>
                        {getMasterOptions('furnishing').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Possession</label>
                      <select
                        value={formData.requirements.possession}
                        onChange={(e) => setReq({ possession: e.target.value })}
                        className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Any</option>
                        {getMasterOptions('possession').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Facing</label>
                      <select
                        value={formData.requirements.facing}
                        onChange={(e) => setReq({ facing: e.target.value })}
                        className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Any Facing</option>
                        {getMasterOptions('facing').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Floor Preference</label>
                      <select
                        value={formData.requirements.floor}
                        onChange={(e) => setReq({ floor: e.target.value })}
                        className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Any Floor</option>
                        {getMasterOptions('floor preference').map((o: any) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div>
                    <MultiSelectDropdown
                      label="Preferred Locations"
                      options={getMasterOptions('location')}
                      selectedValues={formData.requirements.preferredLocations}
                      onToggle={togglePreferredLocation}
                      placeholder="Select preferred locations"
                      withSearch
                    />
                    {formData.requirements.preferredLocations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.requirements.preferredLocations.map((location: any) => (
                          <div
                            key={location}
                            className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                          >
                            <span>{getLabel('location', location)}</span>
                            <button
                              onClick={() => removePreferredLocation(location)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  <div>
                    <MultiSelectDropdown
                      label="Required Amenities"
                      options={getMasterOptions('amenities')}
                      selectedValues={formData.requirements.amenities}
                      onToggle={toggleAmenity}
                      placeholder="Select required amenities"
                      withSearch
                    />
                    {formData.requirements.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.requirements.amenities.map((a: any) => (
                          <div key={a} className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            <span>{getLabel('amenities', a)}</span>
                            <button onClick={() => toggleAmenity(a)} className="text-blue-600 hover:text-blue-800">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Special Requirements & Additional Notes</label>
                    <textarea
                      value={formData.requirements.specialRequirements}
                      onChange={(e) => setReq({ specialRequirements: e.target.value })}
                      className="border border-gray-300 rounded w-full px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any specific requirements or additional notes..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Financial Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.financials.loanRequired}
                    onChange={(e) => setFin({ loanRequired: e.target.checked })}
                    className="sr-only"
                  />
                  <span className={`w-8 h-4 rounded-full relative transition-colors duration-200 ease-in-out ${formData.financials.loanRequired ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 ease-in-out ${formData.financials.loanRequired ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                  <span className="ml-2 text-xs font-medium text-gray-700">Loan Required</span>
                </label>
              </div>

              {formData.financials.loanRequired && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.financials.loanAmount}
                      onChange={(e) => setFin({ loanAmount: parseFloat(e.target.value) || 0 })}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter loan amount"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Down Payment (₹)</label>
                    <input
                      type="number"
                      value={formData.financials.downPayment}
                      onChange={(e) => setFin({ downPayment: parseFloat(e.target.value) || 0 })}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter down payment"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={formData.financials.monthlyIncome}
                      onChange={(e) => setFin({ monthlyIncome: parseFloat(e.target.value) || 0 })}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter monthly income"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Preference</label>
                    <select
                      value={formData.financials.bankPreference}
                      onChange={(e) => setFin({ bankPreference: e.target.value })}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Bank</option>
                      {bankOptions.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Loan Status</label>
                    <select
                      value={formData.financials.loanStatus}
                      onChange={(e) => setFin({ loanStatus: e.target.value })}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Loan Status</option>
                      {loanStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Credit Score</label>
                    <input
                      type="number"
                      value={formData.financials.creditScore}
                      onChange={(e) => setFin({ creditScore: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="border border-gray-300 rounded w-full h-8 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter credit score"
                      min={300}
                      max={900}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle size={16} className="text-gray-400 mr-2" />
              <span className="text-xs text-gray-500">All fields marked with * are required</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {buyer ? 'Update Buyer' : 'Create Buyer'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerFormModal;
