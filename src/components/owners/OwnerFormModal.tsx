import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Save, User, Phone, MapPin, Building, Star, Trash2, Home, Briefcase, Plus } from 'lucide-react';
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
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
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
}> = ({ value, onChange, options, placeholder }) => {
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

  const displayLabel = options.find(o => o.value === value)?.label || value || "";

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => { setIsOpen(true); setSearch(""); }}
        className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-[10px] bg-white cursor-pointer flex justify-between items-center h-[28px]"
        style={{ borderColor: BD }}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {displayLabel || placeholder}
        </span>
        <span className="text-gray-400 text-[8px]">▼</span>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 p-1.5 space-y-1.5">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search location..."
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
                  className={`p-1.5 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer ${
                    o.value === value ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-700"
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
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
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

  const handleUnlinkProperty = (propertyId: number | string) => {
    setFormData(prev => ({
      ...prev,
      properties: (prev.properties || []).filter((p: any) => String(p.id) !== String(propertyId))
    }));
  };

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

  const leadSources = masters['lead_source'] || [];
  const leadStages = masters['buyer_lead_stage'] || masters['lead_stage'] || [];
  const prioritiesList = masters['lead_priority'] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs" style={{ border: `1px solid ${BD}` }}>
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between text-white" style={{ backgroundColor: N }}>
          <div className="flex items-center gap-1.5">
            <User size={16} className="text-orange-500" />
            <h3 className="font-bold">{owner?.id ? 'Edit Owner' : 'Add New Owner'}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: BG }}>
          {/* Section 1: Contact details */}
          <div className="bg-white p-3 rounded-lg border border-gray-150 space-y-3">
            <h4 className="text-[10px] font-bold text-[#0f2b3d] border-b pb-1 flex items-center gap-1">
              <User size={12} className="text-orange-500" /> CONTACT DETAILS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex gap-1.5 items-end">
                <div className="w-1/4">
                  <FormField label="Salutation" required>
                    <select
                      value={formData.salutation}
                      onChange={e => handleInputChange('salutation', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                      style={{ borderColor: BD }}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </FormField>
                </div>
                <div className="flex-1">
                  <FormField label="Name" required error={errors.name}>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white"
                      style={{ borderColor: BD }}
                    />
                  </FormField>
                </div>
              </div>

              <FormField label="Phone" required error={errors.phone}>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white"
                  style={{ borderColor: BD }}
                />
              </FormField>

              <FormField label="WhatsApp">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={e => handleInputChange('whatsapp', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-2 py-1.5 text-[10px] focus:outline-none bg-white"
                      style={{ borderColor: BD }}
                      disabled={sameWhatsapp}
                    />
                    <FaWhatsapp className="absolute left-2.5 top-1/2 -translate-y-1/2 text-green-500" size={13} />
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameWhatsapp}
                      onChange={toggleSameWhatsapp}
                      className="accent-orange-500 h-3.5 w-3.5"
                    />
                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">Same as Phone</span>
                  </label>
                </div>
              </FormField>

              <FormField label="Email" error={errors.email}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white"
                  style={{ borderColor: BD }}
                />
              </FormField>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="bg-white p-3 rounded-lg border border-gray-150 space-y-3">
            <h4 className="text-[10px] font-bold text-[#0f2b3d] border-b pb-1 flex items-center gap-1">
              <MapPin size={12} className="text-orange-500" /> ADDRESS DETAILS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="State">
                {stateOptions.length ? (
                  <select
                    value={formData.state || ''}
                    onChange={e => { handleInputChange('state', e.target.value); handleInputChange('city', ''); handleInputChange('location', ''); }}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                    style={{ borderColor: BD }}
                  >
                    <option value="">Select State</option>
                    {stateOptions.map((s: any) => <option key={s.value ?? s.label} value={s.value ?? s.label}>{s.label ?? s.value}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={e => handleInputChange('state', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white"
                    style={{ borderColor: BD }}
                  />
                )}
              </FormField>

              <FormField label="City">
                {filteredCities.length || cityOptions.length ? (
                  <select
                    value={formData.city || ''}
                    onChange={e => { handleInputChange('city', e.target.value); handleInputChange('location', ''); }}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                    style={{ borderColor: BD }}
                  >
                    <option value="">Select City</option>
                    {(filteredCities.length ? filteredCities : cityOptions).map((c: any) => <option key={c.value ?? c.label} value={c.value ?? c.label}>{c.label ?? c.value}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={e => handleInputChange('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white"
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
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white"
                    style={{ borderColor: BD }}
                  />
                )}
              </FormField>
            </div>
          </div>

          {/* Section 3: Lead details styled like seller form */}
          <div className="bg-white p-3 rounded-lg border border-gray-150 space-y-3">
            <h4 className="text-[10px] font-bold text-[#0f2b3d] border-b pb-1 flex items-center gap-1">
              <Star size={12} className="text-orange-500" /> LEAD DETAILS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Lead Source">
                <select
                  value={formData.source || ''}
                  onChange={e => handleInputChange('source', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                  style={{ borderColor: BD }}
                >
                  <option value="">Select Source</option>
                  {leadSources.map((o: any) => <option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>)}
                </select>
              </FormField>

              {(() => {
                const selectedSource = leadSources.find(o => String(o.value) === String(formData.source) || String(o.label) === String(formData.source));
                const label = selectedSource?.label || formData.source || "";
                return ["housing", "99acres", "no broker", "nobroker"].includes(label.toLowerCase().trim());
              })() && (
                <FormField label="Source URL">
                  <input
                    type="text"
                    placeholder="Enter listing URL..."
                    value={formData.source_url || ""}
                    onChange={e => handleInputChange("source_url", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white"
                    style={{ borderColor: BD }}
                  />
                </FormField>
              )}

              <FormField label="Lead Stage">
                <select
                  value={formData.stage || ''}
                  onChange={e => handleInputChange('stage', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                  style={{ borderColor: BD }}
                >
                  <option value="">Select Stage</option>
                  {leadStages.map((o: any) => <option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>)}
                </select>
              </FormField>

              <FormField label="Priority">
                <select
                  value={formData.priority || ''}
                  onChange={e => handleInputChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                  style={{ borderColor: BD }}
                >
                  <option value="">Select Priority</option>
                  {prioritiesList.map((o: any) => <option key={o.value ?? o.label} value={o.value ?? o.label}>{o.label ?? o.value}</option>)}
                </select>
              </FormField>

              <FormField label="Status">
                <select
                  value={formData.status || ''}
                  onChange={e => handleInputChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                  style={{ borderColor: BD }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>

              <div className="sm:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <FormField label="Assigned Executive">
                      <select
                        value={formData.assigned_to || ''}
                        onChange={e => handleInputChange('assigned_to', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] bg-white focus:outline-none"
                        style={{ borderColor: BD }}
                      >
                        <option value="">Unassigned</option>
                        {executives.map(e => (
                          <option key={e.id} value={e.id}>
                            {`${e.first_name || ''} ${e.last_name || ''}`.trim() || e.name || e.username}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <div className="sm:col-span-2">
                    <FormField label="Notes / Remarks">
                      <input
                        type="text"
                        value={formData.notes || ''}
                        onChange={e => handleInputChange('notes', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none bg-white h-[28px]"
                        style={{ borderColor: BD }}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Linked Properties */}
          <div className="bg-white p-3 rounded-lg border border-gray-150 space-y-3">
            <div className="flex justify-between items-center border-b pb-1">
              <h4 className="text-[10px] font-bold text-[#0f2b3d] flex items-center gap-1">
                <Home size={12} className="text-orange-500" /> LINKED RENTAL PROPERTIES
              </h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold text-[#e67e22] border border-[#e67e22] rounded hover:bg-orange-50 transition-colors"
                >
                  <Plus size={10} /> Link Property
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(true)}
                  className="flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
                >
                  <Plus size={10} /> Add Property
                </button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {!formData.properties?.length ? (
                <div className="text-center py-4 text-[10px] text-gray-400">
                  No rental properties linked.
                </div>
              ) : (
                formData.properties.map((p: any) => {
                  const displayTitle = p.title || `${p.bedrooms || 0} BHK Property in ${p.society_name || p.location_name || ''}`;
                  return (
                    <div key={p.id} className="flex justify-between items-center p-2 rounded border bg-gray-50 text-[10px]">
                      <span className="font-semibold text-gray-750 truncate flex-1 pr-2">{displayTitle}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold bg-orange-100 text-orange-700 px-1 py-0.2 rounded">RENT-{p.id}</span>
                        <button
                          type="button"
                          onClick={() => handleUnlinkProperty(p.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
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
