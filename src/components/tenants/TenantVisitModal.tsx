import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Calendar, Clock, MapPin, CheckCircle2, Search, Loader2,
  AlertCircle, Building2, User, IndianRupee, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { saveTenantEnquiry } from '@/lib/tenantShortlist';
import { isSlotPassed, formatToAmPm } from '@/components/properties/ContactOwnerTenantModal';

export function formatFullPropertyTitle(prop: any): string {
  if (!prop) return 'General Rental Property Site Visit';
  const t = String(prop.title || prop.property_title || '').trim();
  const society = prop.society_name || prop.building_name || prop.project_name || '';
  const loc = prop.location_name || prop.locality || prop.location || prop.city_name || prop.city || '';
  const unit = prop.bhk_type || prop.unit_type || prop.property_type_name || prop.property_type || '';

  // If title is already rich (e.g. "2.5BHK Flat for Rent in VTP Sierra Phase 1" or has ' in ')
  if (t && (t.toLowerCase().includes(' in ') || t.toLowerCase().includes('for rent') || t.length > 20)) {
    return t;
  }

  const baseType = t || unit || 'Rental Property';
  if (society && loc) {
    return `${baseType} for Rent in ${society}, ${loc}`;
  } else if (society) {
    return `${baseType} for Rent in ${society}`;
  } else if (loc) {
    return `${baseType} in ${loc}`;
  }
  return baseType ? `${baseType} for Rent` : `Rental Property RENT-${prop.id || ''}`;
}

export function extractCleanTimeSlot(slotStr: string): string {
  if (!slotStr) return '11:00 AM';
  const s = String(slotStr).trim();

  // Match AM/PM time e.g. "02:00 PM" from "Afternoon (02:00 PM - 05:00 PM)"
  const matchAmPm = s.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i);
  if (matchAmPm) {
    return matchAmPm[1].toUpperCase();
  }

  const lower = s.toLowerCase();
  if (lower.includes('afternoon') || lower.includes('2 to 5') || lower.includes('2-5') || lower.includes('2 - 5')) {
    return '02:00 PM';
  }
  if (lower.includes('evening') || lower.includes('5 to 8') || lower.includes('5-8')) {
    return '05:00 PM';
  }
  if (lower.includes('morning') || lower.includes('10 to 1') || lower.includes('10-1')) {
    return '10:00 AM';
  }
  if (lower.includes('weekend') || lower.includes('11 to 6')) {
    return '11:00 AM';
  }
  return s || '11:00 AM';
}

interface TenantVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: {
    id: number | string;
    name: string;
    phone: string;
    preferred_location?: string;
    tenant_id: string;
  };
  initialProperty?: any;
  onSave?: (visitData: any) => void;
}

export default function TenantVisitModal({
  isOpen,
  onClose,
  tenant,
  initialProperty,
  onSave
}: TenantVisitModalProps) {
  const [selectedProp, setSelectedProp] = useState<any>(initialProperty || null);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingProps, setLoadingProps] = useState(false);
  const [loading, setLoading] = useState(false);

  // Default to today's date
  const todayStr = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(todayStr);
  const [visitTime, setVisitTime] = useState('');

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Set initial property if passed
  useEffect(() => {
    if (initialProperty) {
      setSelectedProp(initialProperty);
    }
  }, [initialProperty]);

  // Fetch properties on mount if needed
  useEffect(() => {
    const loadProps = async () => {
      setLoadingProps(true);
      try {
        const propsList = await rentalPropertiesAPI.getAll().catch(() => []);
        setProperties(propsList || []);
      } catch (err) {
        console.error('Error fetching rental properties:', err);
      } finally {
        setLoadingProps(false);
      }
    };
    if (isOpen) {
      loadProps();
    }
  }, [isOpen]);

  // Click outside dropdown handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered properties for autocomplete
  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    const term = searchTerm.toLowerCase();
    return properties.filter((p: any) => {
      const idStr = `rent-${p.id}`;
      const titleStr = String(p.title || p.property_type_name || '').toLowerCase();
      const locStr = String(p.location_name || p.society_name || '').toLowerCase();
      return idStr.includes(term) || titleStr.includes(term) || locStr.includes(term);
    });
  }, [searchTerm, properties]);

  // Calculate day of week
  const dayOfWeekStr = useMemo(() => {
    if (!visitDate) return '';
    try {
      const d = new Date(visitDate + 'T00:00:00');
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }, [visitDate]);

  // Robust multi-source resolution of owner's preferred slots
  const ownerPreferredSlots = useMemo(() => {
    let slots: string[] = [];
    try {
      // 1. Direct property & owner preferred visit slots from DB
      const rawSlots =
        selectedProp?.preferred_visit_slots ||
        selectedProp?.owner_preferred_visit_slots ||
        selectedProp?.owner?.preferred_visit_slots ||
        selectedProp?.preferred_slots;

      if (rawSlots) {
        if (Array.isArray(rawSlots)) {
          slots = rawSlots;
        } else if (typeof rawSlots === 'string') {
          try {
            const parsed = JSON.parse(rawSlots);
            if (Array.isArray(parsed)) slots = parsed;
          } catch {
            slots = rawSlots.split(';').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }

      // 2. By Property ID
      const propId = selectedProp?.id || selectedProp?.rental_property_id;
      if (slots.length === 0 && propId) {
        const propSaved = localStorage.getItem(`property_preferred_slots_${propId}`);
        if (propSaved) slots = JSON.parse(propSaved);
      }

      // 3. By Owner ID (numeric and OWN000X)
      const ownerId = selectedProp?.owner_id || selectedProp?.seller_id || selectedProp?.landlord_id || selectedProp?.owner?.id;
      if (slots.length === 0 && ownerId) {
        const ownerSaved = localStorage.getItem(`owner_preferred_slots_${ownerId}`);
        if (ownerSaved) slots = JSON.parse(ownerSaved);
        if (slots.length === 0) {
          const codeKey = `OWN${String(ownerId).padStart(4, '0')}`;
          const codeSaved = localStorage.getItem(`owner_preferred_slots_${codeKey}`);
          if (codeSaved) slots = JSON.parse(codeSaved);
        }
      }

      // 4. By Owner Name
      const ownerName = selectedProp?.owner_name || selectedProp?.owner?.name || selectedProp?.seller_name;
      if (slots.length === 0 && ownerName) {
        const cleanName = ownerName.toLowerCase().replace(/mrs\.|mr\./g, '').trim().replace(/\s+/g, '_');
        const nameSaved = localStorage.getItem(`owner_preferred_slots_${cleanName}`);
        if (nameSaved) slots = JSON.parse(nameSaved);
      }

      // 5. Global fallback
      if (slots.length === 0) {
        const globalSaved = localStorage.getItem('owner_preferred_slots_global');
        if (globalSaved) slots = JSON.parse(globalSaved);
      }
    } catch {}

    slots = Array.from(new Set(slots.filter(Boolean)));

    if (slots.length === 0) {
      slots = [
        'Morning (10:00 AM - 01:00 PM)',
        'Afternoon (02:00 PM - 05:00 PM)',
        'Evening (05:00 PM - 08:00 PM)',
        'Weekends (11:00 AM - 06:00 PM)'
      ];
    }
    return slots;
  }, [selectedProp]);

  // Set default visitTime if not yet chosen or when property changes
  useEffect(() => {
    if (ownerPreferredSlots.length > 0 && !visitTime) {
      setVisitTime(ownerPreferredSlots[0]);
    }
  }, [ownerPreferredSlots, visitTime]);

  // Check if chosen time is within owner preferred slots
  const isOwnerPreferredSlot = useMemo(() => {
    if (!visitTime) return false;
    const directMatch = ownerPreferredSlots.some(
      (s) => s === visitTime || s.toLowerCase().includes(visitTime.toLowerCase()) || visitTime.toLowerCase().includes(s.toLowerCase())
    );
    if (directMatch) return true;

    const hour = parseInt(visitTime.split(':')[0], 10);
    return ownerPreferredSlots.some((slot) => {
      const s = slot.toLowerCase();
      if (s.includes('morning') && (hour >= 10 && hour <= 13)) return true;
      if (s.includes('afternoon') && (hour >= 13 && hour <= 17)) return true;
      if (s.includes('evening') && (hour >= 17 && hour <= 20)) return true;
      if (s.includes('weekend') && (hour >= 11 && hour <= 18)) return true;
      if (s.includes('all day') || s.includes('anytime')) return true;
      return false;
    });
  }, [visitTime, ownerPreferredSlots]);

  // Derived status: Always starts as Pending Owner Approval for landlord confirmation
  const currentStatus = 'Pending Owner Approval';

  const handleSelectProperty = (p: any) => {
    setSelectedProp(p);
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      toast.error('Please select a visit date');
      return;
    }

    const cleanTime = extractCleanTimeSlot(visitTime);
    const formattedTime = formatToAmPm(cleanTime);
    if (isSlotPassed(formattedTime, visitDate)) {
      toast.error(`The selected time slot (${formattedTime}) has already passed for today. Please choose an upcoming time slot or a future date.`);
      return;
    }

    const propId = selectedProp?.id || selectedProp?.rental_property_id || null;
    const propTitle = formatFullPropertyTitle(selectedProp);

    const ownerId = selectedProp?.owner_id || selectedProp?.seller_id || null;
    const meetingPoint = selectedProp?.society_name || selectedProp?.location_name || selectedProp?.address || tenant.preferred_location || 'Property Location';

    setLoading(true);
    try {
      const payload = {
        tenant_id: tenant.id,
        tenant_name: tenant.name,
        tenant_phone: tenant.phone,
        property_title: propTitle,
        rental_property_id: propId,
        owner_id: ownerId,
        visit_date: visitDate,
        visit_time: cleanTime,
        meeting_point: meetingPoint,
        status: currentStatus,
      };

      await tenantVisitAPI.create(payload);

      if (selectedProp) {
        saveTenantEnquiry(selectedProp, 'Scheduled Site Visit Inspection');
      }

      toast.info(`⏳ Visit request submitted for ${dayOfWeekStr}! Owner will review and confirm.`);

      onSave?.(payload);
      onClose();
    } catch (err) {
      console.error('Error creating visit:', err);
      toast.error('Failed to schedule site visit');
    } finally {
      setLoading(false);
    }
  };

  const propPrice = Number(selectedProp?.monthly_rent || selectedProp?.expected_rent || selectedProp?.price || selectedProp?.rent || 0);
  const propLocation = [selectedProp?.location_name || selectedProp?.locality || selectedProp?.location, selectedProp?.city_name || selectedProp?.city].filter(Boolean).join(', ');
  const propOwner = selectedProp?.owner_name || selectedProp?.owner?.name || selectedProp?.seller_name || 'Property Owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Schedule Property Site Visit</h3>
              <p className="text-[10px] text-gray-500 font-medium">
                For: <span className="font-bold text-slate-800">{tenant.name}</span> ({tenant.tenant_id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto">

          {/* 🏠 Selected Property Card or Autocomplete Search */}
          {selectedProp ? (
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#0b3856] text-white text-[9px] font-mono font-bold">
                      RENT-{selectedProp.id || 'N/A'}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {formatFullPropertyTitle(selectedProp)}
                    </h4>
                  </div>
                  {propLocation && (
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <MapPin size={10} className="text-orange-500 shrink-0" />
                      <span className="truncate">{propLocation}</span>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProp(null)}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[10px]">
                <span className="font-extrabold text-emerald-700 flex items-center">
                  <IndianRupee size={11} />
                  <span>{propPrice > 0 ? `${propPrice.toLocaleString('en-IN')}/mo` : 'Price on request'}</span>
                </span>
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <ShieldCheck size={11} className="text-amber-600" />
                  <span>Owner: {propOwner}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="relative" ref={wrapperRef}>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Select Rental Property <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by Property ID (e.g. rent-5), title, or location..."
                  className="w-full h-9 pl-8 pr-8 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-800"
                  required={!selectedProp}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto">
                  {loadingProps ? (
                    <div className="flex items-center justify-center py-4 text-gray-400 gap-1.5">
                      <Loader2 className="animate-spin text-emerald-600" size={13} />
                      <span>Loading rental properties...</span>
                    </div>
                  ) : filteredProperties.length > 0 ? (
                    filteredProperties.map((p: any) => {
                      const title = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
                      const loc = p.location_name || p.society_name || 'Pune';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProperty(p)}
                          className="w-full text-left px-3 py-2 hover:bg-emerald-50 border-b border-gray-50 last:border-b-0 flex flex-col gap-0.5 cursor-pointer transition-colors"
                        >
                          <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                            <span>RENT-{p.id} - {title}</span>
                            <span className="text-[10px] text-emerald-600 font-extrabold">₹{Number(p.monthly_rent || p.expected_rent || 0).toLocaleString('en-IN')}/mo</span>
                          </div>
                          <div className="text-[10px] text-gray-400">{loc}</div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-gray-400 italic">No matching properties found.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 🕒 Owner's Preferred Timings Quick Pick Chips - Shown only when property is selected */}
          {selectedProp ? (
            <div className="p-2.5 rounded-md bg-orange-50/80 border border-orange-200/80 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[10px] font-bold text-orange-950">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-orange-600" />
                  <span>Owner's Preferred Visit Timings (1-Click Pick):</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-700 text-[8px] font-extrabold uppercase">
                  Preferred Windows
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ownerPreferredSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => {
                      setVisitTime(slot);
                      toast.info(`Selected Timing: ${slot}`);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                      visitTime === slot
                        ? 'bg-orange-600 text-white border-orange-700 shadow-2xs'
                        : 'bg-white hover:bg-orange-500 hover:text-white text-slate-800 border-orange-200'
                    }`}
                  >
                    ⚡ {slot}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-md bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-[10px] flex items-center gap-2">
              <Clock size={13} className="text-slate-400 shrink-0" />
              <span>Select a rental property above to view the landlord's available visit timings.</span>
            </div>
          )}

          {/* 📅 Date & Day Selection */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Visit Date & Day <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="date"
                value={visitDate}
                min={todayStr}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full h-9 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-800"
                required
              />
              <div className="h-9 px-3 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-between font-bold text-xs">
                <span>{dayOfWeekStr || 'Select Date'}</span>
                <Calendar size={13} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* ⏰ Time Dropdown (Dynamically listing Owner Preferred Slots) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Select Time Slot <span className="text-red-500">*</span>
            </label>
            <select
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-emerald-500 text-xs font-bold text-slate-800 cursor-pointer"
              required
            >
              <optgroup label="⭐ Owner's Preferred Timings">
                {ownerPreferredSlots.map((slot) => {
                  const passed = isSlotPassed(slot, visitDate);
                  return (
                    <option key={slot} value={slot} disabled={passed}>
                      ⚡ {slot} {passed ? '(Passed for Today)' : ''}
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="⏳ Other Convenient Time Slots">
                {[
                  { value: '09:00 AM', label: '09:00 AM (Early Morning)' },
                  { value: '10:00 AM', label: '10:00 AM (Morning)' },
                  { value: '11:00 AM', label: '11:00 AM (Morning)' },
                  { value: '12:00 PM', label: '12:00 PM (Noon)' },
                  { value: '01:00 PM', label: '01:00 PM (Lunch Hour)' },
                  { value: '02:00 PM', label: '02:00 PM (Afternoon)' },
                  { value: '03:00 PM', label: '03:00 PM (Afternoon)' },
                  { value: '04:00 PM', label: '04:00 PM (Afternoon)' },
                  { value: '05:00 PM', label: '05:00 PM (Evening)' },
                  { value: '06:00 PM', label: '06:00 PM (Evening)' },
                  { value: '07:00 PM', label: '07:00 PM (Evening)' },
                  { value: '08:00 PM', label: '08:00 PM (Night)' },
                ].map((item) => {
                  const passed = isSlotPassed(item.value, visitDate);
                  return (
                    <option key={item.value} value={item.value} disabled={passed}>
                      {item.label} {passed ? '(Passed for Today)' : ''}
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>

          {/* 🔔 Intelligent Notice */}
          <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2">
            <Clock size={15} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block text-blue-900">
                Landlord Confirmation Required
              </span>
              <p className="text-[10px] text-blue-700 mt-0.5 leading-relaxed">
                Your visit request will be sent to the owner to review and confirm their availability for this time slot.
              </p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-md text-white font-bold transition-all text-xs shadow-2xs cursor-pointer flex items-center gap-1.5 bg-[#0b3856] hover:bg-[#072438]"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Calendar size={13} />
                  <span>Request Site Visit</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
