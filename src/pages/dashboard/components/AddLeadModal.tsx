

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaWhatsapp } from 'react-icons/fa';
import { masterDataAPI } from '@/lib/mastersAPI';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { getAssignableExecutives } from '@/utils/roleBasedOptions';
import { User, Mail, Phone, MapPin, Building, Briefcase, Flag, Tag, Users, AlertCircle, ChevronDown, UserPlus, X } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface MasterOption {
  value: string;
  label: string;
}

interface Lead {
  id?: string;
  salutation?: string;
  name?: string;
  phone?: string;
  email?: string;
  lead_type?: string;
  lead_source?: string;
  whatsapp_number?: string;
  state?: string;
  city?: string;
  location?: string;
  status?: string;
  assigned_executive?: string;
  assigned_executive_name?: string;
  priority?: string;
  created_by?: string;
}

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead | null) => void;
  lead?: Partial<Lead>;
}

interface DropdownProps {
  placeholder: string;
  options: MasterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  searchable?: boolean;
}

const formatUserName = (u: any): string => {
  if (!u) return '';
  let name = '';
  if (u.display_name && u.display_name.trim()) name = u.display_name.trim();
  else if (u.full_name && u.full_name.trim()) name = u.full_name.trim();
  else {
    const fn = u.first_name || '';
    const ln = u.last_name || '';
    name = `${fn}${ln ? ' ' + ln : ''}`.trim();
  }
  if (!name && u.username && u.username.trim()) name = u.username.trim();
  if (!name && u.email && u.email.trim()) name = u.email.split('@')[0];
  if (!name) return 'Unknown User';
  return name.replace(/^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?)\s+/i, '').trim();
};

const Dropdown: React.FC<DropdownProps> = ({
  placeholder,
  options,
  value,
  onChange,
  className = '',
  searchable = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [buttonWidth, setButtonWidth] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value) || null;

  const filteredOptions = searchable
    ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  React.useEffect(() => {
    if (buttonRef.current) setButtonWidth(buttonRef.current.offsetWidth);
  }, [isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center justify-between w-full border rounded px-2 h-7 text-left focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent text-[11px] bg-white transition-all"
        style={{ borderColor: BD }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate" style={{ color: selectedOption ? N : MU }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: MU }} />
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        >
          <div
            className="absolute bg-white shadow-xl rounded-md py-1 text-[11px] ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-hidden"
            style={{
              width: buttonWidth,
              top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 4 : 0,
              left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left + window.scrollX : 0,
              zIndex: 9999,
              border: `1px solid ${BD}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {searchable && (
              <div className="p-1.5 border-b" style={{ borderColor: BD }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
                  style={{ borderColor: BD }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <button
                    key={option.value}
                    className={`block w-full text-left px-2 py-1.5 hover:bg-orange-50 transition-colors text-[11px] ${value === option.value ? 'text-orange-600 font-medium' : ''}`}
                    style={{ color: value === option.value ? O : MU }}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-2 py-1.5 text-[11px]" style={{ color: MU }}>
                  {searchable ? "No matching options" : "No options available"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const emptyLead: Lead = {
  salutation: '',
  name: '',
  phone: '',
  email: '',
  lead_type: '',
  lead_source: '',
  whatsapp_number: '',
  state: '',
  city: '',
  location: '',
  status: 'new',
  assigned_executive: '',
  priority: ''
};

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
  const { user } = useAuth();
  const isEdit = !!lead?.id;
  const [newLead, setNewLead] = useState<Lead>({ ...emptyLead });
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masterOptions, setMasterOptions] = useState({
    salutation: [] as MasterOption[],
    leadType: [] as MasterOption[],
    leadSource: [] as MasterOption[],
    leadStatus: [] as MasterOption[],
    states: [] as MasterOption[],
    cities: [] as MasterOption[],
    locations: [] as MasterOption[],
    priority: [] as MasterOption[]
  });
  const [presalesUsers, setPreSalesUsers] = useState<any[]>([]);

  const digitsOnly = (s?: string) => (s ? String(s).replace(/\D/g, '') : '');
  const toE164 = (s?: string) => {
    if (!s) return '';
    const d = digitsOnly(s);
    if (!d) return '';
    return d.startsWith('0') ? `+${d.replace(/^0+/, '')}` : `+${d}`;
  };
  const normalizeWhatsapp = (s?: string) => digitsOnly(s);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;

    const normalizeText = (text: any): string => {
      return (text || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s-_/]+/g, "")
        .replace(/[^a-z]/g, "");
    };

    (async () => {
      try {
        const resp = await usersAPI.getAllUsers();
        const list =
          (Array.isArray(resp?.data) && resp.data) ||
          (Array.isArray(resp?.users) && resp.users) ||
          (Array.isArray(resp) && resp) ||
          [];

        const execs = list
          .filter((u: any) => {
            const dept = normalizeText(u?.department || u?.department_name);
            const role = normalizeText(u?.role || u?.role_name || u?.title);
            const isActive = u.is_active !== 0 && u.is_active !== false && u.is_active !== '0' && u.is_active !== 'false' && u.is_active !== null;
            return dept.includes('presale') && role.includes('executive') && isActive;
          })
          .map((u: any) => ({
            id: String(u.id || u._id || u.user_id),
            name: formatUserName(u),
            ...u
          }));

        if (alive) setPreSalesUsers(execs);
      } catch (e) {
        console.error("Error fetching users:", e);
        if (alive) setPreSalesUsers([]);
      }
    })();

    return () => { alive = false; };
  }, [isOpen]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leadMasterTypes, commonMasterTypes] = await Promise.all([
        masterDataAPI.getAllMasterTypes('lead'),
        masterDataAPI.getAllMasterTypes('common')
      ]);
      const allMasterTypes = [...(leadMasterTypes || []), ...(commonMasterTypes || [])];
      const masterValues = await Promise.all(
        allMasterTypes.map((mt: any) => masterDataAPI.getMasterValues(mt.id))
      );
      const organized: Record<string, MasterOption[]> = {};
      allMasterTypes.forEach((mt: any, idx: number) => {
        const vals = masterValues[idx] || [];
        organized[(mt.name || '').toString().toLowerCase()] = vals.map((item: any) => ({
          value: String(item.id),
          label: item.value || item.name || 'Unknown'
        }));
      });
      setMasterOptions({
        salutation: organized['salutation'] || [],
        leadType: organized['lead type'] || organized['leadtype'] || [],
        leadSource: organized['lead source'] || organized['leadsource'] || [],
        leadStatus: organized['lead status'] || organized['leadstatus'] || [],
        states: organized['state'] || [],
        cities: organized['city'] || [],
        locations: organized['location'] || [],
        priority: organized['lead priority'] || organized['leadpriority'] || []
      });

      if (!isEdit && !newLead.state && organized['state']?.length) {
        const maharashtra = organized['state'].find(
          (opt: MasterOption) => opt.label.toLowerCase() === 'maharashtra'
        );
        if (maharashtra) {
          setNewLead(prev => ({ ...prev, state: maharashtra.label }));
        }
      }
    } catch (err) {
      console.error('Failed to load master data:', err);
      setError(`Failed to load dropdown options: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    if (isOpen) {
      fetchMasterData();
      if (isEdit && lead) {
        setNewLead({
          id: lead.id,
          salutation: lead.salutation || '',
          name: lead.name || '',
          phone: lead.phone || '',
          email: lead.email || '',
          lead_type: lead.lead_type || '',
          lead_source: lead.lead_source || '',
          whatsapp_number: lead.whatsapp_number ? formatWhatsappValue(lead.whatsapp_number) : '',
          state: lead.state || '',
          city: lead.city || '',
          location: lead.location || '',
          status: lead.status || 'new',
          assigned_executive: lead.assigned_executive || '',
          priority: lead.priority || '',
        });
        const phoneDigits = digitsOnly(lead.phone);
        const waDigits = digitsOnly(lead.whatsapp_number);
        setSameAsPhone(!!waDigits && phoneDigits && waDigits.slice(-10) === phoneDigits.slice(-10));
      } else {
        const initialLead = { ...emptyLead };
        const userDept = (user?.department || '').toString().toLowerCase();
        const userRole = (user?.role || '').toString().toLowerCase();
        if (userDept.includes('presale') && userRole.includes('executive')) {
          initialLead.assigned_executive = String(user.id);
        }
        setNewLead(initialLead);
        setSameAsPhone(false);
      }
      setError(null);
    } else {
      setNewLead({ ...emptyLead });
      setSameAsPhone(false);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, isEdit, lead?.id, user]);

  const handleDropdownChange = (name: keyof Lead, options: MasterOption[]) => (value: string) => {
    const selected = options.find(opt => opt.value === value);
    setNewLead(prev => ({ ...prev, [name]: selected ? selected.label : value }));
  };

  const handlePhoneChange = (value: string) => {
    const withPlus = toE164(value);
    setNewLead(prev => {
      const updated = { ...prev, phone: withPlus };
      if (sameAsPhone) {
        updated.whatsapp_number = formatWhatsappValue(withPlus);
      }
      return updated;
    });
  };

  const handleWhatsappChange = (value: string) => {
    setNewLead(prev => ({ ...prev, whatsapp_number: value }));
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setNewLead(prev => ({ ...prev, whatsapp_number: formatWhatsappValue(prev.phone || '') }));
    }
  };

  const normalizeNumber = (num?: string) => toE164(num);

  const handleSubmit = () => {
    if (!String(newLead.name || '').trim()) {
      toast.error('Please enter a valid name');
      return;
    }
    if (!newLead.phone) {
      toast.error('Please enter phone number');
      return;
    }

    const emailValue = newLead.email?.trim() || '';
    if (emailValue && emailValue !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    const payload: any = {
      salutation: newLead.salutation || '',
      name: String(newLead.name || '').trim(),
      phone: normalizeNumber(newLead.phone) || '',
      email: emailValue,
      lead_type: newLead.lead_type || '',
      lead_source: newLead.lead_source || '',
      whatsapp_number: normalizeWhatsapp(newLead.whatsapp_number) || '',
      state: newLead.state || '',
      city: newLead.city || '',
      location: newLead.location || '',
      status: newLead.status || 'new',
      assigned_executive: newLead.assigned_executive || '',
      priority: newLead.priority || '',
      created_by: String(user?.id || ''),
    };

    if (isEdit && newLead.id) {
      payload.id = newLead.id;
    }

    onSave(payload);
  };

  const valFromLabel = (opts: MasterOption[], labelOrValue?: string) =>
    (labelOrValue ? opts.find(opt => opt.label === labelOrValue)?.value : undefined) || (labelOrValue ?? '');

  const assignableExecutives = getAssignableExecutives(user, presalesUsers);

  return (
   <Modal
  isOpen={isOpen}
  onClose={onClose}
  showHeader={false}      // Hides Modal's header
  showCloseButton={false} // Hides Modal's close button
  width="max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl"
>

      {/* Header with Navy Color */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b rounded-t-lg" style={{ background: N, borderColor: BD }}>
        <div className="flex items-center gap-2">
          <UserPlus size={16} style={{ color: O }} />
          <h2 className="text-sm font-bold text-white">{isEdit ? "Edit Lead" : "Add New Lead"}</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
          <X size={16} style={{ color: 'white' }} />
        </button>
      </div>

      <div className="relative px-3 py-3 max-h-[85vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent mb-1" style={{ borderColor: O, borderTopColor: 'transparent' }} />
            <p className="text-[10px] font-semibold" style={{ color: N }}>Loading...</p>
          </div>
        )}

        {error && (
          <div className="mb-2 flex items-start gap-1.5 bg-red-50 border border-red-200 text-red-600 px-2 py-1.5 rounded-lg text-[10px]">
            <AlertCircle size={11} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
            <button onClick={fetchMasterData} className="ml-auto text-[9px] underline">Retry</button>
          </div>
        )}

        <div className="space-y-3">
          {/* Name Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Salutation</label>
              <Dropdown
                placeholder="Salutation"
                options={masterOptions.salutation}
                value={valFromLabel(masterOptions.salutation, newLead.salutation)}
                onChange={handleDropdownChange('salutation', masterOptions.salutation)}
                className="w-full"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>
                Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <input
                  type="text"
                  value={newLead.name || ''}
                  onChange={e => setNewLead(prev => ({ ...prev, name: e.target.value.replace(/[0-9]/g, '') }))}
                  placeholder="Full Name"
                  className="w-full pl-7 pr-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                />
              </div>
            </div>
            <div className="sm:col-span-5">
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Email</label>
              <div className="relative">
                <Mail size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <input
                  type="email"
                  value={newLead.email || ''}
                  onChange={e => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email (Optional)"
                  className="w-full pl-7 pr-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                />
              </div>
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>
                Phone <span className="text-red-400">*</span>
              </label>
              <PhoneInput
                country={'in'}
                value={newLead.phone || ''}
                onChange={handlePhoneChange}
                inputClass="!w-full !h-7 !rounded !border-gray-300 !text-[11px] focus:!ring-1 focus:!ring-orange-500 !pl-10"
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5 flex items-center gap-1" style={{ color: N }}>
                <FaWhatsapp className="text-green-500" size={11} /> WhatsApp
                <div className="ml-auto flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={e => handleSameAsPhoneToggle(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-3 rounded-full relative transition-colors ${sameAsPhone ? 'bg-orange-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-2 h-2 rounded-full transition-transform ${sameAsPhone ? 'translate-x-3' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="ml-1.5 text-[8px]" style={{ color: MU }}>{sameAsPhone ? 'Same' : 'Different'}</span>
                  </label>
                </div>
              </label>
              <input
                type="tel"
                value={newLead.whatsapp_number || ''}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                placeholder="9876543210"
                className={`w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1 ${sameAsPhone ? 'bg-gray-100' : ''}`}
                style={{ borderColor: BD }}
                maxLength={10}
                disabled={sameAsPhone}
              />
            </div>
          </div>

          {/* Lead Type, Priority, Source, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Lead Type</label>
              <Dropdown
                placeholder="Type"
                options={masterOptions.leadType}
                value={valFromLabel(masterOptions.leadType, newLead.lead_type)}
                onChange={handleDropdownChange('lead_type', masterOptions.leadType)}
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Priority</label>
              <Dropdown
                placeholder="Priority"
                options={masterOptions.priority}
                value={valFromLabel(masterOptions.priority, newLead.priority)}
                onChange={handleDropdownChange('priority', masterOptions.priority)}
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Lead Source</label>
              <Dropdown
                placeholder="Source"
                options={masterOptions.leadSource}
                value={valFromLabel(masterOptions.leadSource, newLead.lead_source)}
                onChange={handleDropdownChange('lead_source', masterOptions.leadSource)}
              />
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Lead Status</label>
              <Dropdown
                placeholder="Status"
                options={masterOptions.leadStatus}
                value={valFromLabel(masterOptions.leadStatus, newLead.status)}
                onChange={handleDropdownChange('status', masterOptions.leadStatus)}
              />
            </div>
          </div>

          {/* State, City, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>State</label>
              <div className="relative">
                <Flag size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <Dropdown
                  placeholder="Select State"
                  options={masterOptions.states}
                  value={valFromLabel(masterOptions.states, newLead.state)}
                  onChange={handleDropdownChange('state', masterOptions.states)}
                  className="w-full"
                  searchable
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>City</label>
              <div className="relative">
                <Building size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <Dropdown
                  placeholder="Select City"
                  options={masterOptions.cities}
                  value={valFromLabel(masterOptions.cities, newLead.city)}
                  onChange={handleDropdownChange('city', masterOptions.cities)}
                  className="w-full"
                  searchable
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Location</label>
              <div className="relative">
                <MapPin size={11} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                <Dropdown
                  placeholder="Select Location"
                  options={masterOptions.locations}
                  value={valFromLabel(masterOptions.locations, newLead.location)}
                  onChange={handleDropdownChange('location', masterOptions.locations)}
                  className="w-full"
                  searchable
                />
              </div>
            </div>
          </div>

          {/* Assigned Executive */}
          <div>
            <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>
              <Users size={10} className="inline mr-1" style={{ color: O }} /> Assigned Executive
            </label>
            {assignableExecutives.length === 1 && assignableExecutives[0].selfOnly ? (
              <div className="px-2 py-1 rounded text-[10px]" style={{ background: `${N}10`, color: N }}>
                {assignableExecutives[0].name} (Auto-assigned to you)
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  className="w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                  value={String(newLead.assigned_executive || "")}
                  onChange={(e) => setNewLead(prev => ({ ...prev, assigned_executive: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {assignableExecutives.map((exec: any) => (
                    <option key={exec.id} value={String(exec.id)}>
                      {exec.name} {exec.id === user?.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
                {newLead.assigned_executive && (
                  <div className="text-[9px]" style={{ color: MU }}>
                    Selected: <span className="font-medium" style={{ color: O }}>
                      {assignableExecutives.find(exec => String(exec.id) === String(newLead.assigned_executive))?.name || 'Unknown'}
                    </span>
                  </div>
                )}
                {assignableExecutives.length === 0 && (
                  <div className="text-[9px]" style={{ color: '#dc2626' }}>No Presales Executives available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1.5 pt-3 mt-2 border-t" style={{ borderColor: BD }}>
          <button onClick={onClose} className="px-2 py-1 text-[10px] border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-2 py-1 text-[10px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90" style={{ background: O }}>
            {isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddLeadModal;