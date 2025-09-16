import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Save, User, Phone, MapPin, Building, Star, Trash2, Home, Handshake } from 'lucide-react';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useProperties } from '@/hooks/properties';
import { FaWhatsapp } from 'react-icons/fa';
import DOBStepCalendar from '../ui/DOBStepCalendar';
import { usersAPI } from '@/lib/api';


// ---------- types ----------
// Normalize a string for comparison (spaces/underscores/case-insensitive)
const norm = (v: any) => String(v ?? "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "_");

// Find the correct option value from a masters array given some incoming value
const resolveOptionValue = (options: any[], incoming: string | undefined | null) => {
  if (!incoming) return "";
  const target = norm(incoming);
  const hit = options.find((o: any) => norm(o.value ?? o.label) === target);
  return hit ? (hit.value ?? hit.label) : (incoming || "");
};

// Convert "initial_contact" => "Initial Contact"
const titleizeUnderscore = (v?: string | null) =>
  (v ?? "")
    .split("_")
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

// Make a MiniProperty[] out of any property-ish array
const adaptProperties = (arr: any[]): MiniProperty[] =>
  (Array.isArray(arr) ? arr : []).map((p: any) => ({
    id: String(p.id ?? p.property_id ?? p._id ?? `P-${Math.random().toString(36).slice(2)}`),
    title: p.title || p.society_name || p.name || "Property",
    address: p.address || [p.location_name || p.locality_name, p.city_name || p.city].filter(Boolean).join(", "),
    price: p.budget ?? p.price ?? p.expected_price ?? "",
    size: p.carpet_area ?? p.area ?? p.super_builtup_area ?? "",
    image: p.image || p.photo || (Array.isArray(p.photos) ? (p.photos[0]?.url || p.photos[0]) : "")
  }));

// Make modal-friendly CoSeller[]
// Make modal-friendly CoSeller[]
const adaptCoSellers = (arr: any[]): CoSeller[] =>
  (Array.isArray(arr) ? arr : []).map((cs: any) => ({
    id: Number(cs.id ?? cs.coSeller_id ?? cs._id) || undefined,
    // keep seller_id inside hidden shape (optional, we can stash as any)
    // if you want to keep it, add it to CoSeller type as seller_id?: number;
    seller_id: Number(cs.seller_id ?? cs.parent_id) || undefined,

    coSeller_salutation: cs.coSeller_salutation ?? cs.salutation ?? "Mr.",
    coSeller_name: cs.coSeller_name ?? cs.name ?? "",
    coSeller_phone: cs.coSeller_phone ?? cs.phone ?? "",
    coSeller_whatsapp: cs.coSeller_whatsapp ?? cs.whatsapp ?? "",
    coSeller_email: cs.coSeller_email ?? cs.email ?? "",
    coSeller_dob: cs.coSeller_dob ?? cs.dob ?? "",
    coSeller_sameAsPhone: Boolean(cs.coSeller_sameAsPhone ?? cs.sameAsPhone),
    coSeller_relation: cs.coSeller_relation ?? cs.relation ?? ""
  }));


type Nullable<T> = T | null | undefined;

type CoSeller = {
  id?: number; // <- add this for updates
  coSeller_salutation?: string;
  coSeller_name?: string;
  coSeller_phone?: string;
  coSeller_whatsapp?: string;
  coSeller_email?: string;
  coSeller_dob?: string;
  coSeller_sameAsPhone?: boolean;
  coSeller_relation?: string;
};


type MiniProperty = {
  id: string;
  title: string;
  address?: string;
  price?: number | string;
  size?: string | number;
  image?: string;
};

export type Seller = {
  id?: number;
  salutation?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  state?: string;
  city?: string;
  location?: string;
  stage?: string;
  leadType?: string;
  priority?: string;
  status?: string;
  properties?: MiniProperty[];
  coSellers?: CoSeller[];
  notes?: string;
  seller_dob?: string; // use this consistently
  countryCode?: string;
  assigned_to?: string | number;
  assigned_to_name?: string;
  created_at?: string;
  updated_at?: string;
  lastActivity?: string;
  visits?: number;
  notifications?: number;
  source?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  seller?: Seller | null;
  onSave: (data: Seller) => Promise<void> | void;
};

// ---------- date helpers ----------
const TODAY = new Date();
const pad2 = (n: number) => String(n).padStart(2, '0');
const toISODate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const EIGHTEEN_YEARS_BACK = new Date(TODAY.getFullYear() - 18, TODAY.getMonth(), TODAY.getDate());
const ISO_18Y_BACK = toISODate(EIGHTEEN_YEARS_BACK);

const numberToINR = (v: any) => {
  const n = typeof v === 'string' ? Number(v) : v;
  if (!n || Number.isNaN(n)) return '';
  return n.toLocaleString('en-IN');
};

const adaptIncomingSellerToForm = (s: any, leadStageOptions: any[], leadPriorityOpts: any[], leadStatusOptions: any[], leadSourceOptions: any[]): Seller => {
  if (!s) {
    return {
      salutation: "Mr.",
      seller_dob: ISO_18Y_BACK,
      countryCode: "+91",
      properties: [],
      coSellers: [],
      source: ""
    };
  }

  // Resolve masters-based values (use whatever masters you loaded)
  const stageValue = resolveOptionValue(
    leadStageOptions,
    // if you passed underscored stage from list, convert to title first
    s.stage?.includes("_") ? titleizeUnderscore(s.stage) : s.stage
  );

  const priorityValue = resolveOptionValue(leadPriorityOpts, s.priority);
  const statusValue = resolveOptionValue(leadStatusOptions, s.status);
  const sourceValue = resolveOptionValue(leadSourceOptions, s.source);

  return {
    id: Number(s.id ?? s.seller_id ?? s._id),
    salutation: s.salutation ?? "Mr.",
    name: s.name ?? "",
    phone: s.phone ?? "",
    whatsapp: s.whatsapp ?? "",
    email: s.email ?? "",
    state: s.state ?? "",
    city: s.city ?? "",
    location: s.location ?? "",

    // masters-driven fields:
    stage: stageValue || "",
    leadType: s.leadType ?? s.lead_type ?? "",
    priority: priorityValue || "",
    status: statusValue || "",
    source: sourceValue || "",

    // assigned — prefer ID if you have it; keep name separately
    assigned_to: s.assigned_to ?? s.assigned_to_id ?? "",
    assigned_to_name: s.assigned_to_name ?? s.assigned ?? "",

    // extras
    notes: s.notes ?? "",
    seller_dob: s.seller_dob ?? s.dob ?? ISO_18Y_BACK,
    created_at: s.created_at,
    updated_at: s.updated_at,
    lastActivity: s.lastActivity,
    visits: s.visits,
    notifications: s.notifications,

    // arrays adapted to expected shapes
    properties: adaptProperties(s.properties),
    coSellers: adaptCoSellers(s.coSellers ?? s.cosellers)
  };
};

const SellerFormModal: React.FC<Props> = ({ isOpen, onClose, seller, onSave }) => {
  // ---------- state ----------
  const [formData, setFormData] = useState<Seller>({
    salutation: 'Mr.',
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    state: '',
    city: '',
    location: '',
    stage: '',
    leadType: '',
    priority: '',
    status: '',
    properties: [],
    coSellers: [],
    notes: '',
    seller_dob: ISO_18Y_BACK,
    countryCode: '+91',
    assigned_to: '',
    assigned_to_name: '',
    source: '',
  });

  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [phoneCountryData, setPhoneCountryData] = useState<any>(null);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);

  // ---------- masters ----------
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'seller', 'lead']);
        if (!alive) return;
        setMasters(data || {});
      } catch (e) {
        console.error('Error fetching master options:', e);
      } finally {
        setMasterLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isOpen]);

  // ---------- executives ----------
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    (async () => {
      try {
        const data = await usersAPI.getAllUsers();
        const execs = (data?.data || []).filter((u: any) => (u?.department?.toLowerCase() === 'sales' && u?.role?.toLowerCase() === 'executive'));
        if (!alive) return;
        setSalesUsers(execs);
      } catch (e) {
        console.error('Error fetching users:', e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isOpen]);

  // ---------- properties ----------
  const { fetchProperties, properties, loadingProps } = useProperties({ autoLog: false });
  const fetchedOnceRef = useRef(false);

  useEffect(() => {
    if (!isOpen || fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    fetchProperties().catch(console.error);
  }, [isOpen, fetchProperties]);

  useEffect(() => {
    if (!isOpen) fetchedOnceRef.current = false;
  }, [isOpen]);

  // ---------- masters helpers ----------
  const salutationOptions = masters['salutation'] || [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Dr.', label: 'Dr.' },
  ];
  const stateOptions = masters['state'] || [];
  const cityOptions = masters['city'] || [];
  const leadStageOptions = masters['Seller lead stage'] || masters['seller lead stage'] || [];
  const leadTypeOptions = masters['lead type'] || [];
  const leadPriorityOpts = masters['lead priority'] || [];
  const leadStatusOptions = masters['Seller lead Status'] || masters['seller lead status'] || [];
  const leadSourceOptions = masters['lead source'] || masters['Lead Source'] || [];

  // Fixed useEffect - only update when modal opens AND seller changes
  useEffect(() => {
    if (!isOpen) return;

    setFormData(adaptIncomingSellerToForm(seller, leadStageOptions, leadPriorityOpts, leadStatusOptions, leadSourceOptions));
  }, [seller?.id, isOpen, leadStageOptions, leadPriorityOpts, leadStatusOptions, leadSourceOptions]);

  const availableProperties: MiniProperty[] = useMemo(() => {
    if (Array.isArray(properties) && properties.length) {
      return properties
        .filter((p: any) => !p.seller_id) // <-- condition lag gayi
        .slice(0, 20)
        .map((p: any) => ({
          id: String(p.id ?? p.property_id ?? `P-${Math.random().toString(36).slice(2)}`),
          title: p.title || p.society_name || 'Property',
          address: p.address || [p.location_name || p.locality_name, p.city_name || p.city].filter(Boolean).join(', '),
          price: p.budget ?? p.price ?? p.expected_price ?? 0,
          size: p.carpet_area ?? p.area ?? p.super_builtup_area ?? '',
          image: p.photo || p.image || (Array.isArray(p.photos) ? p.photos[0]?.url || p.photos[0] : ''),
        }));
    }
    return [];
  }, [properties]);


  const filteredCities = useMemo(() => cityOptions.filter((c: any) => !formData.state || c.parentValue === formData.state), [cityOptions, formData.state]);

  const locationOptions: MasterOption[] = masters['location'] || [];
  const filteredLocations = useMemo(() => {
    return locationOptions.filter((l: any) => {
      if (formData.city && l.parentValue === formData.city) return true;
      if (!formData.city && formData.state && l.grandParentValue === formData.state) return true;
      return !formData.state && !formData.city;
    });
  }, [locationOptions, formData.city, formData.state]);

  if (!isOpen) return null;

  // ---------- helpers ----------
  const handleInputChange = useCallback((field: keyof Seller, value: any) => setFormData((prev) => ({ ...prev, [field]: value })), []);

  const extractLocalNumber = (fullNumber: string, countryData: any) => {
    if (!countryData || !fullNumber) return '';
    const dialCode: string = countryData.dialCode || '';
    const trimmed = fullNumber.replace(/^\+/, '');
    return trimmed.startsWith(dialCode) ? trimmed.slice(dialCode.length) : trimmed;
  };

  const toggleSameWhatsapp = useCallback(() => {
    setSameWhatsapp((prev) => {
      const next = !prev;
      if (next && formData.phone && phoneCountryData) {
        const localNumber = extractLocalNumber(String(formData.phone), phoneCountryData);
        setFormData((p) => ({ ...p, whatsapp: localNumber }));
      }
      return next;
    });
  }, [formData.phone, phoneCountryData]);

  const handlePhoneChange = useCallback((value: string, countryData?: any) => {
    setPhoneCountryData(countryData);
    setFormData((prev) => {
      const updated: Seller = { ...prev, phone: value };
      if (sameWhatsapp && countryData) {
        updated.whatsapp = extractLocalNumber(String(value), countryData);
      }
      return updated;
    });
  }, [sameWhatsapp]);

  const handleWhatsappChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value })), []);

  const handlePropertySelection = useCallback((propertyId: string) => {
    const property = availableProperties.find((p) => String(p.id) === String(propertyId));
    if (!property) return;
    setFormData((prev) => {
      const exists = (prev.properties || []).some((p) => String(p.id) === String(propertyId));
      if (exists) return prev;
      return { ...prev, properties: [...(prev.properties || []), { ...property, id: String(property.id) }] };
    });
    setShowPropertySelector(false);
  }, [availableProperties]);

  const removeProperty = useCallback((propertyId: string) => {
    setFormData((prev) => ({ ...prev, properties: (prev.properties || []).filter((p) => String(p.id) !== String(propertyId)) }));
  }, []);

  const addCoSeller = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      coSellers: [
        ...(prev.coSellers || []),
        {
          coSeller_salutation: 'Mr.',
          coSeller_name: '',
          coSeller_phone: '',
          coSeller_whatsapp: '',
          coSeller_email: '',
          coSeller_dob: '',
          coSeller_sameAsPhone: false,
          coSeller_relation: '',
        },
      ],
    }));
  }, []);

  const updateCoSeller = useCallback((index: number, field: keyof CoSeller, value: any) => {
    setFormData((prev) => ({
      ...prev,
      coSellers: (prev.coSellers || []).map((cs, i) => (i === index ? { ...cs, [field]: value } : cs)),
    }));
  }, []);

  const removeCoSeller = useCallback((index: number) => {
    setFormData((prev) => ({ ...prev, coSellers: (prev.coSellers || []).filter((_, i) => i !== index) }));
  }, []);

  const handleCoSellerPhoneChange = useCallback((index: number, value: string, countryData?: any) => {
    setFormData((prev) => ({
      ...prev,
      coSellers: (prev.coSellers || []).map((cs, i) => {
        if (i !== index) return cs;
        const updated: CoSeller = { ...cs, coSeller_phone: value };
        if (cs.coSeller_sameAsPhone && countryData) {
          updated.coSeller_whatsapp = extractLocalNumber(String(value), countryData);
        }
        return updated;
      }),
    }));
  }, []);

  const toggleCoSellerSameAsPhone = useCallback((index: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      coSellers: (prev.coSellers || []).map((cs, i) => {
        if (i !== index) return cs;
        const updated: CoSeller = { ...cs, coSeller_sameAsPhone: checked };
        if (checked && cs.coSeller_phone) {
          const phoneStr = String(cs.coSeller_phone);
          updated.coSeller_whatsapp = phoneStr.length > 10 ? phoneStr.slice(-10) : phoneStr;
        }
        return updated;
      }),
    }));
  }, []);

  // ---------- Age calc & validation (based on seller_dob only) ----------
  const age = useMemo(() => {
    const iso = formData.seller_dob;
    if (!iso) return 0;
    const d = new Date(iso);
    let a = TODAY.getFullYear() - d.getFullYear();
    const m = TODAY.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && TODAY.getDate() < d.getDate())) a--;
    return a;
  }, [formData.seller_dob]);

  const ageError = age < 18 ? 'Seller must be at least 18 years old' : '';

  // ---------- save ----------
  // ---------- save ----------
  const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
  const handleSave = useCallback(async () => {
    if (!formData.name?.trim()) return alert('Please enter seller name');
    if (!formData.phone?.trim()) return alert('Please enter phone number');
    if (age < 18) return alert('Seller must be at least 18 years old');

    setIsSubmitting(true);
    try {
      const cosellers = (formData.coSellers || []).map((cs: any) => ({
        id: cs.id ?? undefined,                                   // <-- keep id for UPDATE
        seller_id: formData.id ? Number(formData.id) : undefined, // <-- set parent for edit
        salutation: cs.coSeller_salutation || 'Mr.',
        name: (cs.coSeller_name || '').trim(),
        phone: onlyDigits(cs.coSeller_phone || ''),               // <-- normalize phone
        whatsapp: onlyDigits(cs.coSeller_whatsapp || ''),         // already normalized, keep consistent
        email: (cs.coSeller_email || '').trim(),
        relation: cs.coSeller_relation || '',
        dob: cs.coSeller_dob || '',
      }));

      const uiCoSellers = (formData.coSellers || []).map((cs: any) => ({
        id: cs.id ?? undefined, // keep so it survives next edit
        coSeller_salutation: cs.coSeller_salutation || 'Mr.',
        coSeller_name: (cs.coSeller_name || '').trim(),
        coSeller_phone: onlyDigits(cs.coSeller_phone || ''),      // normalize for UI state too
        coSeller_whatsapp: onlyDigits(cs.coSeller_whatsapp || ''),
        coSeller_email: (cs.coSeller_email || '').trim(),
        coSeller_dob: cs.coSeller_dob || '',
        coSeller_sameAsPhone: !!cs.coSeller_sameAsPhone,
        coSeller_relation: cs.coSeller_relation || '',
      }));

      const sellerData: Seller & { cosellers: any[] } = {
        ...formData,
        phone: onlyDigits(String(formData.phone || '')),           // normalize main phone too (good practice)
        whatsapp: onlyDigits(formData.whatsapp || ''),
        created_at: formData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lastActivity: new Date().toISOString().split('T')[0],
        visits: formData.visits || 0,
        notifications: formData.notifications || 0,
        source: formData.source || "",
        assigned_to: formData?.assigned_to || '',
        assigned_to_name: formData?.assigned_to_name || '',

        coSellers: uiCoSellers, // for your modal/state
        cosellers,              // for backend
      };

      await onSave?.(sellerData);
    } catch (e) {
      console.error('Error preparing seller:', e);
      alert('Failed to save seller');
    } finally {
      setIsSubmitting(false);
    }
  }, [age, formData, onSave]);


  // ---------- UI ----------
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{seller ? 'Edit Seller' : 'Add New Seller'}</h2>
              <p className="text-sm text-gray-600 mt-1">Enter Seller information and property details</p>
            </div>
            <button onClick={onClose} className="group p-2.5 rounded-xl bg-white hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl border hover:border-red-200">
              <X size={18} className="text-gray-600 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* MAIN */}
            <main className="md:col-span-2 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><User className="mr-2" size={16} /> Seller — Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Salutation *</label>
                    <select value={formData.salutation || 'Mr.'} onChange={(e) => handleInputChange('salutation', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      {salutationOptions.map((opt: any) => (<option key={opt.value ?? opt.label} value={opt.value ?? opt.label}>{opt.label ?? opt.value}</option>))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter full name" required />
                  </div>
                </div>
                <div className="mt-3">
                  <DOBStepCalendar value={formData.seller_dob || ISO_18Y_BACK} onChange={(iso) => setFormData((prev) => ({ ...prev, seller_dob: iso }))} label="Date of Birth" required max={ISO_18Y_BACK} placeholder="Select your date of birth" size="sm" />
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><Phone className="mr-2" size={16} /> Seller — Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                    <PhoneInput country="in" value={formData.phone || ''} onChange={handlePhoneChange as any} inputProps={{ name: 'phone', required: true, autoFocus: false }} inputClass="!w-full !h-9 !text-xs" containerClass="!w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number <span className="ml-2 inline-flex items-center"><input type="checkbox" checked={sameWhatsapp} onChange={toggleSameWhatsapp} className="mr-1" /><span className="text-xs text-gray-500">Same as phone</span></span></label>
                    <div className="relative">
                      <FaWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-base pointer-events-none" />
                      <input type="tel" inputMode="tel" placeholder="Enter WhatsApp number" value={formData.whatsapp || ''} onChange={handleWhatsappChange} disabled={sameWhatsapp} className="w-full pl-9 pr-2 py-2 border rounded-lg text-xs disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter email address" />
                </div>
              </div>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="md:col-span-2 space-y-6 text-xs">
              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><MapPin className="mr-2" size={16} /> Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* State */}
                  {stateOptions.length ? (
                    <select
                      value={formData.state || ''}
                      onChange={(e) => {
                        const newState = e.target.value;
                        handleInputChange('state', newState);
                        // Reset city and location when state changes
                        if (newState !== formData.state) {
                          handleInputChange('city', '');
                          handleInputChange('location', '');
                        }
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select State</option>
                      {stateOptions.map((s: any) => (
                        <option key={s.value ?? s.label} value={s.value ?? s.label}>
                          {s.label ?? s.value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={formData.state || ''} onChange={(e) => handleInputChange('state', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="State" />
                  )}

                  {/* City */}
                  {(filteredCities.length || cityOptions.length) ? (
                    <select
                      value={formData.city || ''}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        handleInputChange('city', newCity);
                        // Reset location when city changes
                        if (newCity !== formData.city) {
                          handleInputChange('location', '');
                        }
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select City</option>
                      {(filteredCities.length ? filteredCities : cityOptions).map((c: any) => (
                        <option key={c.value ?? c.label} value={c.value ?? c.label}>
                          {c.label ?? c.value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={formData.city || ''} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="City" />
                  )}

                  {/* Location */}
                  {(filteredLocations.length || locationOptions.length) ? (
                    <select value={formData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Location</option>
                      {(filteredLocations.length ? filteredLocations : locationOptions).map((l: any) => (<option key={l.value ?? l.label} value={l.value ?? l.label}>{l.label ?? l.value}</option>))}
                    </select>
                  ) : (
                    <input type="text" value={formData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Location/Area" />
                  )}
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><Star className="mr-2" size={16} /> Lead Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lead Source</label>
                    <select
                      className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.source || ''}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                    >
                      <option value="">Select source</option>
                      {leadSourceOptions.map((o: any) => (
                        <option key={o.value ?? o.label} value={o.value ?? o.label}>
                          {o.label ?? o.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lead Stage</label>
                    <select className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" value={formData.stage || ''} onChange={(e) => handleInputChange('stage', e.target.value)}>
                      <option value="">Select stage</option>
                      {leadStageOptions.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Lead Type</label>
                    <select className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" value={formData.leadType || ''} onChange={(e) => handleInputChange('leadType', e.target.value)}>
                      <option value="">Select type</option>
                      {leadTypeOptions.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" value={formData.priority || ''} onChange={(e) => handleInputChange('priority', e.target.value)}>
                      <option value="">Select priority</option>
                      {leadPriorityOpts.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" value={formData.status || ''} onChange={(e) => handleInputChange('status', e.target.value)}>
                      <option value="">Select status</option>
                      {leadStatusOptions.map((o: any) => (<option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Assigned Executive */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Executive</label>
                <select className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" value={String(formData.assigned_to || '')} onChange={(e) => {
                  const id = e.target.value;
                  const exec = salesUsers.find((u) => String(u.id) === String(id));
                  handleInputChange('assigned_to', id);
                  handleInputChange('assigned_to_name', exec ? `${exec.first_name || ''} ${exec.last_name || ''}`.trim() : '');
                }}>
                  <option value="">Select Sales Executive</option>
                  {salesUsers.map((user: any) => (<option key={user.id} value={user.id}>{(user.first_name || '') + ' ' + (user.last_name || '')}</option>))}
                </select>
              </div>
            </aside>
          </div>

          {/* Properties */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><Building className="mr-2" size={16} /> Properties (Optional)</h3>
            <div className="space-y-2">
              {(formData.properties || []).map((property) => (
                <div key={property.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:shadow-md">
                  {property.image ? (
                    <img src={property.image} alt={property.title} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{property.title}</div>
                    <div className="text-[11px] text-gray-600 truncate">{property.address}</div>
                    {property.price && (<div className="text-[12px] text-green-600 font-semibold">₹ {numberToINR(property.price)}</div>)}
                    {property.size && (<div className="text-[11px] text-gray-500">{property.size} sq.ft</div>)}
                  </div>
                  <button onClick={() => removeProperty(property.id)} className="group p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200">
                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
              <div className="flex justify-center">
                <button onClick={() => setShowPropertySelector(true)} disabled={loadingProps} className="group flex items-center justify-center space-x-2 w-fit px-4 py-2 border-2 border-emerald-500 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white transition-all duration-300 font-medium disabled:opacity-50">
                  <Home size={18} className="group-hover:scale-110 transition-transform" />
                  <span>{loadingProps ? 'Loading...' : 'Add Property'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Co-Sellers */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center"><User className="mr-2" size={16} /> Co-Sellers (Optional)</h3>
            <div className="space-y-3">
              {(formData.coSellers || []).map((coSeller, index) => (
                <div key={`coseller-${index}`} className="p-3 border rounded-lg">
                  <div className="space-y-2">
                    {/* Row 1 */}
                    <div className="grid grid-cols-[100px_1fr_1fr] gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Salutation *</label>
                        <select value={coSeller.coSeller_salutation || 'Mr.'} onChange={(e) => updateCoSeller(index, 'coSeller_salutation', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                          {salutationOptions.map((opt: any) => (<option key={opt.value ?? opt.label} value={opt.value ?? opt.label}>{opt.label ?? opt.value}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={coSeller.coSeller_name || ''} onChange={(e) => updateCoSeller(index, 'coSeller_name', e.target.value)} className="w-full h-7 px-1 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Co-Seller full name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" value={coSeller.coSeller_email || ''} onChange={(e) => updateCoSeller(index, 'coSeller_email', e.target.value)} className="w-full h-7 px-1 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Email address" />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">Phone</label>
                        <PhoneInput country="in" value={coSeller.coSeller_phone || ''} onChange={(value, countryData) => handleCoSellerPhoneChange(index, value as string, countryData)} inputProps={{ name: `coSeller-phone-${index}`, autoFocus: false }} inputClass="!w-full !h-7 !text-[10px]" containerClass="!w-full" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1 flex items-center gap-1"><FaWhatsapp className="text-green-500" size={10} /> WhatsApp Number <input type="checkbox" checked={!!coSeller.coSeller_sameAsPhone} onChange={(e) => toggleCoSellerSameAsPhone(index, e.target.checked)} className="ml-1 scale-75" /><span className="text-[9px] text-gray-500">Same as phone</span></label>
                        <input type="tel" value={coSeller.coSeller_whatsapp || ''} onChange={(e) => updateCoSeller(index, 'coSeller_whatsapp', e.target.value)} disabled={!!coSeller.coSeller_sameAsPhone} className="w-full h-7 px-1 border rounded text-[10px] disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="WhatsApp Number" />
                      </div>
                    </div>

                    {/* Row 3: DOB + Delete */}
                    <div className="flex items-center justify-between">
                      {/* Left side: DOB + Relation */}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <DOBStepCalendar
                            value={coSeller.coSeller_dob || ''}
                            onChange={(iso) => updateCoSeller(index, 'coSeller_dob', iso)}
                            label="Date of Birth"
                            placeholder="Select date of birth"
                            size="sm"
                            max={ISO_18Y_BACK}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-700 mb-1">
                            Relation to Seller
                          </label>
                          <input
                            type="text"
                            value={coSeller.coSeller_relation || ''}
                            onChange={(e) => updateCoSeller(index, 'coSeller_relation', e.target.value)}
                            className="w-full h-9 px-2 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Spouse, Brother, Partner"
                          />
                        </div>
                      </div>

                      {/* Right side: Delete button */}
                      <button
                        onClick={() => removeCoSeller(index)}
                        className="ml-3 group px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200 hover:shadow-sm"
                      >
                        <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
              <div className="flex justify-center">
                <button onClick={addCoSeller} className="group flex items-center justify-center space-x-2 w-fit px-4 py-2 border-2 border-purple-500 text-purple-600 rounded-full hover:bg-purple-500 hover:text-white transition-all duration-300 font-medium">
                  <Handshake size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Add Co-Seller</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" rows={3} placeholder="Additional notes about the Seller..." />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {ageError && <span className="ml-2 text-red-600">• {ageError}</span>}
              {masterLoading && <span className="ml-2">• Loading master data…</span>}
            </div>
            <div className="flex items-center justify-end space-x-3">
              <button onClick={onClose} className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"><span>Cancel</span></button>
              <button onClick={handleSave} disabled={isSubmitting || !(formData.name || '').trim() || !(formData.phone || '').trim() || !!ageError} className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : seller ? 'Update Seller' : 'Save Seller'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Property Selector */}
        {showPropertySelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Property</h3>
                <button onClick={() => setShowPropertySelector(false)} className="group p-2 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200">
                  <X size={20} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                {availableProperties.map((property) => (
                  <button key={property.id} onClick={() => handlePropertySelection(property.id)} className="group w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-md transform hover:scale-[1.01]">
                    {property.image ? (
                      <img src={property.image} alt={property.title} className="w-16 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">No Image</div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium truncate">{property.title}</div>
                      <div className="text-sm text-gray-600 truncate">{property.address}</div>
                      {property.price ? (<div className="text-xs text-green-600 font-semibold">₹ {Number(property.price).toLocaleString('en-IN')}</div>) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerFormModal;