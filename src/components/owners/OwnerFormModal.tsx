import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Save, User, Phone, MapPin, Building, Star, Trash2, Home, Briefcase, Plus, ChevronDown, FileText } from 'lucide-react';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaWhatsapp } from 'react-icons/fa';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LinkRentalPropertyModal from './LinkRentalPropertyModal';
import RentalPropertyFormModal from '@/pages/dashboard/components/RentalPropertyFormModal';
import { toast } from 'react-toastify';
import ownerAPI from '@/lib/ownerAPI';
import { getImageUrl } from '@/lib/helpers';
import Swal from 'sweetalert2';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

export type Owner = {
  id?: number | string;
  salutation?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  state?: string;
  city?: string;
  location?: string;
  stage?: string;
  priority?: string;
  status?: string;
  properties?: any[];
  notes?: string;
  assigned_to?: string | number;
  assigned_to_name?: string;
  source?: string;
  source_url?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  owner?: Owner | null;
  onSave: () => void;
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

const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, required, children, icon, error }) => (
  <div className="space-y-0.5">
    <label className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gray-500">
      {icon && <span className="text-orange-500">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[8px] mt-0.5">{error}</p>}
  </div>
);

const SearchableSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}> = ({ value, onChange, options, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter(o =>
      String(o.label || "").toLowerCase().includes(search.toLowerCase()) ||
      String(o.value || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const displayLabel = options.find(o => o.value === value || String(o.value) === String(value))?.label || value || "";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div
        onClick={() => { if (!isOpen) { setIsOpen(true); setSearch(""); } }}
        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-[10px] bg-white cursor-pointer flex justify-between items-center h-[28px]"
        style={{ borderColor: BD }}
      >
        <span className={value ? "text-gray-800 truncate" : "text-gray-400 truncate"}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown size={11} className="text-gray-400 flex-shrink-0 ml-1" />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 p-1.5 space-y-1.5 min-w-[150px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border border-gray-300 rounded px-2 py-0.5 text-[10px] focus:outline-none"
            autoFocus
          />
          <div className="max-h-36 overflow-y-auto space-y-1 text-[10px]">
            {filtered.length === 0 ? (
              <div className="p-1.5 text-gray-400 text-center">No options found</div>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setIsOpen(false);
                  }}
                  className={`p-1.5 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer ${o.value === value || String(o.value) === String(value) ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-700"
                    }`}
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const OwnerFormModal: React.FC<Props> = ({ isOpen, onClose, owner, onSave }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<Owner>({
    salutation: 'Mr.',
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    state: '',
    city: '',
    location: '',
    stage: 'initial_contact',
    priority: 'medium',
    status: 'active',
    notes: '',
    source: 'Website',
    assigned_to: '',
    assigned_to_name: '',
    properties: [],
    source_url: '',
  });

  const [sameWhatsapp, setSameWhatsapp] = useState(false);
  const [executives, setExecutives] = useState<any[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPropIds, setSelectedPropIds] = useState<string[]>([]);

  // Dropdown master options
  const [masters, setMasters] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const data = await getMasterDropdownOptions(['common', 'lead', 'buyer']);
        if (data) {
          setMasters(data);
        }
      } catch (err) {
        console.error('Failed to load masters:', err);
      }
    };
    loadMasters();
  }, []);

  useEffect(() => {
    const loadExecutives = async () => {
      try {
        const res = await usersAPI.getSalesExecutives();
        const raw = Array.isArray(res) ? res : (res?.items || res?.data || []);
        setExecutives(raw);
      } catch (err) {
        console.error('Failed to load executives:', err);
      }
    };
    loadExecutives();
  }, []);

  useEffect(() => {
    if (owner) {
      const phoneDigits = String(owner.phone || '').replace(/\D/g, '');
      const waDigits = String(owner.whatsapp || '').replace(/\D/g, '');
      setSameWhatsapp(!!waDigits && phoneDigits.slice(-10) === waDigits.slice(-10));
      setFormData({
        salutation: owner.salutation || 'Mr.',
        name: owner.name || '',
        phone: owner.phone || '',
        whatsapp: owner.whatsapp || '',
        email: owner.email || '',
        state: owner.state || '',
        city: owner.city || '',
        location: owner.location || '',
        stage: owner.stage || 'initial_contact',
        priority: owner.priority || 'medium',
        status: owner.status || 'active',
        notes: owner.notes || '',
        source: owner.source || 'Website',
        assigned_to: owner.assigned_to || '',
        assigned_to_name: owner.assigned_to_name || '',
        properties: owner.properties || [],
        source_url: owner.source_url || (owner as any).sourceUrl || '',
      });
    } else {
      setSameWhatsapp(false);
      setFormData({
        salutation: 'Mr.',
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        state: '',
        city: '',
        location: '',
        stage: 'initial_contact',
        priority: 'medium',
        status: 'active',
        notes: '',
        source: 'Website',
        assigned_to: (user as any)?.id || '',
        assigned_to_name: (user as any)?.name || (user as any)?.username || '',
        properties: [],
        source_url: '',
      });
    }
    setErrors({});
  }, [owner, isOpen, user]);

  const handleInputChange = (field: keyof Owner, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => {
      const updated = { ...prev, phone: value };
      if (sameWhatsapp) {
        updated.whatsapp = formatWhatsappValue(value);
      }
      return updated;
    });
  };

  const toggleSameWhatsapp = () => {
    setSameWhatsapp(prev => {
      const next = !prev;
      if (next && formData.phone) {
        setFormData(p => ({ ...p, whatsapp: formatWhatsappValue(String(p.phone)) }));
      }
      return next;
    });
  };

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
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (formData.assigned_to) {
        const exec = executives.find(e => String(e.id) === String(formData.assigned_to));
        if (exec) {
          formData.assigned_to_name = `${exec.first_name || ''} ${exec.last_name || ''}`.trim() || exec.name;
        }
      }
      if (owner?.id) {
        await ownerAPI.update(owner.id, formData);
        toast.success('Owner updated successfully');
      } else {
        await ownerAPI.create(formData);
        toast.success('Owner created successfully');
      }
      onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save owner');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkProperty = (property: any) => {
    const isAlreadyLinked = formData.properties?.some((p: any) => String(p.id) === String(property.id));
    if (isAlreadyLinked) {
      toast.warn("Property is already linked!");
      return;
    }
    setFormData(prev => ({
      ...prev,
      properties: [...(prev.properties || []), property]
    }));
    toast.success("Property linked locally!");
    setShowLinkModal(false);
  };

  const handleCreatePropertySubmit = (createdProp: any) => {
    setFormData(prev => ({
      ...prev,
      properties: [...(prev.properties || []), {
        id: createdProp.id,
        title: createdProp.title || `${createdProp.bedrooms || 0} BHK Property`,
        bedrooms: createdProp.bedrooms,
        property_type_name: createdProp.property_type_name,
        society_name: createdProp.society_name,
        location_name: createdProp.location_name,
        monthly_rent: createdProp.monthly_rent
      }]
    }));
    setShowAddPropertyModal(false);
    toast.success("New Rental Property linked successfully!");
  };

  const handleUnlinkProperty = useCallback(async (propertyId: number | string) => {
    const result = await Swal.fire({
      title: 'Unlink Rental Property?',
      text: 'Are you sure you want to unlink this rental property from this owner?',
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

    setFormData(prev => ({
      ...prev,
      properties: (prev.properties || []).filter((p: any) => String(p.id) !== String(propertyId))
    }));

    try {
      await rentalPropertiesAPI.patchOwner(String(propertyId), 'unlink');
    } catch (e) {
      console.warn('patchOwner unlink note:', e);
    }
    toast.info('Property unlinked');
  }, []);

  const handleBulkUnlinkProperties = useCallback(async (propertyIds: Array<string | number>) => {
    if (!propertyIds.length) return;
    const result = await Swal.fire({
      title: 'Unlink Selected Properties?',
      text: `Are you sure you want to unlink the ${propertyIds.length} selected rental properties from this owner?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Unlink All',
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

    const idsToFilter = new Set(propertyIds.map(id => String(id)));
    setFormData(prev => ({
      ...prev,
      properties: (prev.properties || []).filter((p: any) => !idsToFilter.has(String(p.id)))
    }));

    for (const pid of propertyIds) {
      try {
        await rentalPropertiesAPI.patchOwner(String(pid), 'unlink');
      } catch (e) {
        console.warn('patchOwner bulk unlink note:', e);
      }
    }
    setSelectedPropIds([]);
    toast.info(`${propertyIds.length} properties unlinked`);
  }, []);

  // Master lists filters
  const stateOptions = masters['state'] || [];
  const cityOptions = masters['city'] || [];
  const locationOptions = masters['location'] || [];

  const filteredCities = useMemo(() =>
    cityOptions.filter((c: any) => !formData.state || c.parentValue === formData.state),
    [cityOptions, formData.state]
  );

  const filteredLocations = useMemo(() =>
    locationOptions.filter((l: any) => !formData.city || l.parentValue === formData.city),
    [locationOptions, formData.city]
  );

  const salutationOptions = masters['salutation'] || [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Dr.', label: 'Dr.' }
  ];
  const leadSources = masters['lead source'] || masters['Lead Source'] || [];
  const leadStages = masters['seller lead stage'] || masters['Seller lead stage'] || masters['lead stage'] || [];
  const prioritiesList = masters['lead priority'] || masters['Lead Priority'] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-xs" style={{ border: `1px solid ${BD}` }}>
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <User size={15} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-xs">{owner?.id ? 'Edit Owner' : 'Add New Owner'}</h3>
              <p className="text-[9px] text-white/70">Manage owner contact details, address, and rental properties</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content - Card based two-column layout */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ background: '#ffffff', scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

            {/* Left Column */}
            <div className="space-y-3">

              {/* Card 1: Basic Information */}
              <div className="rounded-lg p-2.5 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold flex items-center gap-1.5 pb-1 border-b" style={{ color: N }}>
                  <User size={12} style={{ color: O }} /> Basic Information
                </h3>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="col-span-1">
                    <FormField label="Salutation" required>
                      <select
                        value={formData.salutation}
                        onChange={e => handleInputChange('salutation', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] bg-white focus:outline-none h-[28px]"
                        style={{ borderColor: BD }}
                      >
                        {salutationOptions.map((opt: any) => (
                          <option key={opt.value ?? opt.label} value={opt.value ?? opt.label}>
                            {opt.label ?? opt.value}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <div className="col-span-2">
                    <FormField label="Name" required error={errors.name}>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none bg-white h-[28px]"
                        style={{ borderColor: BD }}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <FormField label="Phone" required error={errors.phone}>
                    <PhoneInput
                      country="in"
                      enableSearch={true}
                      value={formData.phone || ''}
                      onChange={val => handlePhoneChange(val)}
                      inputProps={{ name: 'phone', required: true }}
                      inputClass="!w-full !h-[28px] !text-[10px] !rounded-lg !pl-12"
                      containerClass="!w-full h-[28px]"
                      buttonClass="!rounded-l-lg"
                    />
                  </FormField>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
                      {/* <FaWhatsapp className="text-green-500" size={10} /> */}
                      <span>WhatsApp Number</span>
                      <div className="ml-auto flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer gap-1">
                          <input
                            type="checkbox"
                            checked={sameWhatsapp}
                            onChange={toggleSameWhatsapp}
                            className="accent-orange-500 h-3 w-3 cursor-pointer"
                          />
                          <span className="text-[8px] text-gray-500 lowercase font-bold">Same</span>
                        </label>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.whatsapp}
                        onChange={e => handleInputChange('whatsapp', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-2 py-1 text-[10px] focus:outline-none bg-white h-[28px] disabled:bg-gray-100"
                        style={{ borderColor: BD }}
                        disabled={sameWhatsapp}
                      />
                      <FaWhatsapp className="absolute left-2.5 top-1/2 -translate-y-1/2 text-green-500" size={13} />
                    </div>
                  </div>
                </div>

                <FormField label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none bg-white h-[28px]"
                    style={{ borderColor: BD }}
                  />
                </FormField>
              </div>

              {/* Card 2: Address Details */}
              <div className="rounded-lg p-2.5 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold flex items-center gap-1.5 pb-1 border-b" style={{ color: N }}>
                  <MapPin size={12} style={{ color: O }} /> Address Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <FormField label="State">
                    {stateOptions.length ? (
                      <SearchableSelect
                        value={formData.state || ''}
                        onChange={val => {
                          handleInputChange('state', val);
                          handleInputChange('city', '');
                          handleInputChange('location', '');
                        }}
                        options={stateOptions.map((s: any) => ({ value: s.value ?? s.label, label: s.label ?? s.value }))}
                        placeholder="Select State"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.state || ''}
                        onChange={e => handleInputChange('state', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none bg-white h-[28px]"
                        style={{ borderColor: BD }}
                      />
                    )}
                  </FormField>

                  <FormField label="City">
                    {filteredCities.length || cityOptions.length ? (
                      <SearchableSelect
                        value={formData.city || ''}
                        onChange={val => {
                          handleInputChange('city', val);
                          handleInputChange('location', '');
                        }}
                        options={(filteredCities.length ? filteredCities : cityOptions).map((c: any) => ({ value: c.value ?? c.label, label: c.label ?? c.value }))}
                        placeholder="Select City"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={e => handleInputChange('city', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none bg-white h-[28px]"
                        style={{ borderColor: BD }}
                      />
                    )}
                  </FormField>

                  <FormField label="Location/Area">
                    {filteredLocations.length || locationOptions.length ? (
                      <SearchableSelect
                        value={formData.location || ''}
                        onChange={v => handleInputChange('location', v)}
                        options={(filteredLocations.length ? filteredLocations : locationOptions).map((l: any) => ({
                          value: l.value ?? l.label,
                          label: l.label ?? l.value
                        }))}
                        placeholder="Select Location"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={e => handleInputChange('location', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none bg-white h-[28px]"
                        style={{ borderColor: BD }}
                      />
                    )}
                  </FormField>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">

              {/* Card 3: Lead Details */}
              <div className="rounded-lg p-2.5 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold flex items-center gap-1.5 pb-1 border-b" style={{ color: N }}>
                  <Star size={12} style={{ color: O }} /> Lead Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <FormField label="Lead Source">
                    <SearchableSelect
                      value={formData.source || ''}
                      onChange={val => handleInputChange('source', val)}
                      options={leadSources.map((s: any) => ({ value: s.value ?? s.label, label: s.label ?? s.value }))}
                      placeholder="Select source"
                    />
                  </FormField>

                  <FormField label="Lead Stage">
                    <SearchableSelect
                      value={formData.stage || ''}
                      onChange={val => handleInputChange('stage', val)}
                      options={leadStages.map((s: any) => ({ value: s.value ?? s.label, label: s.label ?? s.value }))}
                      placeholder="Select stage"
                    />
                  </FormField>

                  <FormField label="Priority">
                    <SearchableSelect
                      value={formData.priority || ''}
                      onChange={val => handleInputChange('priority', val)}
                      options={prioritiesList.map((p: any) => ({ value: p.value ?? p.label, label: p.label ?? p.value }))}
                      placeholder="Select priority"
                    />
                  </FormField>

                  <FormField label="Status">
                    <select
                      value={formData.status || ''}
                      onChange={e => handleInputChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] bg-white focus:outline-none h-[28px]"
                      style={{ borderColor: BD }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Assigned Executive">
                      <SearchableSelect
                        value={String(formData.assigned_to || '')}
                        onChange={val => {
                          const selected = executives.find(ex => String(ex.id) === String(val));
                          setFormData(prev => ({
                            ...prev,
                            assigned_to: val,
                            assigned_to_name: selected ? selected.name : ''
                          }));
                        }}
                        options={[
                          { value: '', label: 'Unassigned' },
                          ...executives.map((ex: any) => ({ value: String(ex.id), label: ex.name }))
                        ]}
                        placeholder="Select Executive"
                      />
                    </FormField>
                  </div>

                  {(() => {
                    const selectedSource = leadSources.find(o => String(o.value) === String(formData.source) || String(o.label) === String(formData.source));
                    const label = selectedSource?.label || formData.source || "";
                    return ["housing", "99acres", "99acers", "no broker", "nobroker"].includes(label.toLowerCase().trim());
                  })() && (
                      <div className="sm:col-span-2">
                        <FormField label="Source URL">
                          <input
                            type="text"
                            placeholder="Enter listing URL..."
                            value={formData.source_url || ""}
                            onChange={e => handleInputChange("source_url", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1 text-[10px] focus:outline-none bg-white h-[28px]"
                            style={{ borderColor: BD }}
                          />
                        </FormField>
                      </div>
                    )}
                </div>
              </div>

              {/* Card 4: Linked Rental Properties */}
              <div className="rounded-lg p-2.5 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
                <div className="flex justify-between items-center pb-1 border-b">
                  <h3 className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: N }}>
                    <Home size={12} style={{ color: O }} /> Linked Rental Properties
                  </h3>
                  <div className="flex gap-2">
                    {selectedPropIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleBulkUnlinkProperties(selectedPropIds)}
                        className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold text-red-600 border border-red-200 bg-red-50 rounded hover:bg-red-100 transition-colors animate-pulse"
                      >
                        Unlink Selected ({selectedPropIds.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowLinkModal(true)}
                      className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold text-[#e67e22] border border-[#e67e22] rounded hover:bg-orange-50 transition-colors"
                    >
                      <Plus size={10} /> Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPropertyModal(true)}
                      className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {!formData.properties?.length ? (
                    <div className="text-center py-3 text-[10px] text-gray-400">
                      No rental properties linked.
                    </div>
                  ) : (
                    formData.properties.map((property: any) => {
                      const displayTitle = property.title || `${property.bedrooms || 0} BHK Property in ${property.society_name || property.location_name || ''}`;
                      const photoCandidate = property.photos?.[0]?.url || property.photos?.[0] || property.photo || property.image || "";
                      const photoUrl = getImageUrl(photoCandidate);

                      return (
                        <div key={property.id} className="flex justify-between items-center p-2 rounded-lg text-[10px]" style={{ background: 'white', border: `1px solid ${BD}` }}>
                          <div className="flex items-center flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedPropIds.includes(String(property.id))}
                              onChange={(e) => {
                                const idStr = String(property.id);
                                if (e.target.checked) {
                                  setSelectedPropIds(prev => [...prev, idStr]);
                                } else {
                                  setSelectedPropIds(prev => prev.filter(id => id !== idStr));
                                }
                              }}
                              className="accent-orange-500 h-3.5 w-3.5 mr-1.5 cursor-pointer flex-shrink-0"
                            />
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={displayTitle}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-50 border border-gray-100 mr-2"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                  if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="w-12 h-12 rounded-lg items-center justify-center text-[8px] flex-shrink-0 mr-2"
                              style={{
                                background: BG,
                                color: MU,
                                display: photoUrl ? "none" : "flex",
                              }}
                            >
                              No Image
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 flex-wrap">
                                <div className="font-semibold text-[10px] truncate text-gray-800">{displayTitle}</div>
                                {property.property_subtype_name && (
                                  <span className="px-1.5 py-0.25 rounded text-[7px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">{property.property_subtype_name}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {Number(property.monthly_rent) > 0 ? (
                                  <div className="text-[9px] font-bold text-emerald-600">
                                    ₹ {Number(property.monthly_rent).toLocaleString()}/mo
                                  </div>
                                ) : null}
                                {property.executiveName && (
                                  <div className="flex items-center gap-1 text-[8px] text-gray-600 bg-gray-50 px-1.5 py-0.25 rounded border border-gray-100">
                                    <User size={8} className="text-gray-400" />
                                    <span>Executive:</span>
                                    <span className="font-semibold text-gray-800">{property.executiveName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className="font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[9px]">RENT-{property.id}</span>
                            <button
                              type="button"
                              onClick={() => handleUnlinkProperty(property.id)}
                              className="text-red-500 hover:text-red-700 font-semibold text-[10px]"
                            >
                              Unlink
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Notes & Remarks (Full Width at the bottom) */}
          <div className="mt-3 rounded-lg p-2.5 space-y-2" style={{ background: BG, border: `1px solid ${BD}` }}>
            <h3 className="text-[11px] font-bold flex items-center gap-1.5 pb-1 border-b" style={{ color: N }}>
              <FileText size={12} style={{ color: O }} /> Notes & Remarks
            </h3>
            <FormField label="Notes / Remarks">
              <textarea
                rows={2}
                value={formData.notes || ''}
                onChange={e => handleInputChange('notes', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none bg-white min-h-[40px] resize-none"
                style={{ borderColor: BD }}
                placeholder="Enter additional remarks..."
              />
            </FormField>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-3.5 py-1.5 text-xs font-semibold rounded border hover:bg-gray-100 text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-5 py-1.5 text-xs font-semibold rounded text-white shadow-md hover:bg-orange-600 bg-[#e67e22] disabled:opacity-50"
          >
            <Save size={13} />
            <span>{saving ? 'Saving...' : 'Save Owner'}</span>
          </button>
        </div>
      </div>

      {showLinkModal && (
        <LinkRentalPropertyModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          onSelectProperty={handleLinkProperty}
          linkingOwner={formData}
        />
      )}

      {showAddPropertyModal && (
        <RentalPropertyFormModal
          isOpen={showAddPropertyModal}
          onClose={() => setShowAddPropertyModal(false)}
          onSubmit={handleCreatePropertySubmit}
          mode="create"
          initialData={{
            city: formData.city || '',
            location: formData.location || '',
            address: formData.location ? `${formData.location}, ${formData.city || ''}` : formData.city || '',
          }}
        />
      )}
    </div>
  );
};

export default OwnerFormModal;
