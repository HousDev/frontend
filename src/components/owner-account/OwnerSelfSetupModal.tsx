import React, { useState, useEffect, useRef } from 'react';
import {
  X, Lock, Eye, EyeOff, UserCheck, KeyRound, Clock, Calendar, Check, Phone, Plus, ChevronDown, CheckSquare, Square, Shield,
  CheckCircle2, XCircle, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import ownerAPI from '@/lib/ownerAPI';

interface OwnerSelfSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: any;
  derivedUsername: string;
  onSaveSuccess?: (updatedData: any) => void;
  allowDismiss?: boolean;
}

const POPULAR_SLOTS = [
  'Morning (10:00 AM - 01:00 PM)',
  'Afternoon (02:00 PM - 05:00 PM)',
  'Evening (05:00 PM - 08:00 PM)',
  'Weekends (11:00 AM - 06:00 PM)',
  'All Day (10:00 AM - 08:00 PM)',
  'Anytime with 2hr Prior Notice',
];

const HOURLY_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
];

export const OwnerSelfSetupModal: React.FC<OwnerSelfSetupModalProps> = ({
  isOpen,
  onClose,
  owner,
  derivedUsername,
  onSaveSuccess,
  allowDismiss = true,
}) => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`owner_preferred_slots_${owner?.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [POPULAR_SLOTS[0], POPULAR_SLOTS[2]];
  });
  const [phone, setPhone] = useState<string>(owner?.phone || '');
  const [whatsapp, setWhatsapp] = useState<string>(owner?.whatsapp || owner?.phone || '');
  const [customSlotInput, setCustomSlotInput] = useState<string>('');
  const [showSlotDropdown, setShowSlotDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const slotDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (owner?.id) {
      setPhone(owner.phone || '');
      setWhatsapp(owner.whatsapp || owner.phone || '');
      try {
        const saved = localStorage.getItem(`owner_preferred_slots_${owner.id}`);
        if (saved) setSelectedSlots(JSON.parse(saved));
      } catch {}
    }
  }, [owner?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (slotDropdownRef.current && !slotDropdownRef.current.contains(event.target as Node)) {
        setShowSlotDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleAddCustomSlot = () => {
    const trimmed = customSlotInput.trim();
    if (!trimmed) {
      toast.info('Please type a time window (e.g. 7:30 PM - 9:00 PM)');
      return;
    }
    if (selectedSlots.includes(trimmed)) {
      toast.info('This slot is already added');
      return;
    }
    setSelectedSlots((prev) => [...prev, trimmed]);
    setCustomSlotInput('');
    toast.success(`Added custom slot: ${trimmed}`);
  };

  const isFormValid =
    newPassword.trim().length >= 6 &&
    newPassword === confirmPassword &&
    selectedSlots.length > 0 &&
    phone.trim().replace(/\D/g, '').length >= 10 &&
    whatsapp.trim().replace(/\D/g, '').length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.trim().length < 6) {
      toast.error('Password is required and must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    if (selectedSlots.length === 0) {
      toast.error('Please select at least one preferred visiting time slot');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit Phone Number');
      return;
    }

    const cleanWhatsapp = whatsapp.trim().replace(/\D/g, '');
    if (!cleanWhatsapp || cleanWhatsapp.length < 10) {
      toast.error('Please enter a valid 10-digit WhatsApp Number');
      return;
    }

    setLoading(true);
    try {
      if (owner?.id) {
        await ownerAPI.updatePassword(owner.id, newPassword.trim());
      }

      // Save visit slots in localStorage and profile
      localStorage.setItem(
        `owner_preferred_slots_${owner?.id}`,
        JSON.stringify(selectedSlots)
      );
      localStorage.setItem(
        'owner_preferred_slots_global',
        JSON.stringify(selectedSlots)
      );
      if (Array.isArray(owner?.properties)) {
        owner.properties.forEach((p: any) => {
          if (p?.id) localStorage.setItem(`property_preferred_slots_${p.id}`, JSON.stringify(selectedSlots));
        });
      }

      // Save updated contact info if modified
      const updatedProfile: any = {
        phone: phone.trim() || owner?.phone,
        whatsapp: whatsapp.trim() || phone.trim() || owner?.whatsapp,
      };

      if (owner?.id) {
        try {
          await ownerAPI.update(owner.id, updatedProfile);
        } catch (err) {
          console.warn('Owner profile update note:', err);
        }
      }

      localStorage.removeItem(`prompt_owner_setup_${owner?.id}`);
      localStorage.removeItem('prompt_owner_setup');

      toast.success('Account preferences & password saved successfully! Welcome to your Owner Portal.');
      if (onSaveSuccess) onSaveSuccess({ ...owner, ...updatedProfile, preferred_visit_slots: selectedSlots });
      onClose();
    } catch (err: any) {
      console.error('Owner setup error:', err);
      toast.error(err?.response?.data?.message || 'Error saving setup details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Compact Modern Header */}
        <div className="bg-[#0b3856] px-5 py-4 text-white relative flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Owner Account Setup & Visit Timings
              </h3>
              <p className="text-[10.5px] text-slate-300">
                Hi {owner?.name || 'Owner'}, configure your password & visiting slots
              </p>
            </div>
          </div>

          {allowDismiss && (
            <button
              onClick={() => {
                localStorage.removeItem(`prompt_owner_setup_${owner?.id}`);
                localStorage.removeItem('prompt_owner_setup');
                onClose();
              }}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Username Info Box */}
        <div className="px-5 pt-3.5">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Your Login Username
                </span>
                <span className="font-mono font-bold text-xs text-slate-900 truncate block">
                  @{derivedUsername}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`@${derivedUsername}`);
                toast.success(`Copied username: @${derivedUsername}`);
              }}
              className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            >
              Copy Username
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          
          {/* Password Fields with Live Match Indicator */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set password (min 6 chars)"
                    className={`w-full pl-3 pr-8 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 font-medium text-slate-800 transition-colors ${
                      newPassword.length >= 6
                        ? 'border-slate-300 focus:ring-blue-500'
                        : newPassword.length > 0
                        ? 'border-amber-300 focus:ring-amber-500'
                        : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className={`w-full pl-3 pr-8 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 font-medium text-slate-800 transition-colors ${
                      confirmPassword.length > 0
                        ? newPassword === confirmPassword
                          ? 'border-emerald-400 focus:ring-emerald-500 bg-emerald-50/20'
                          : 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Real-Time Live Validation Status Bar */}
            {(newPassword.length > 0 || confirmPassword.length > 0) && (
              <div className="px-1 flex items-center justify-between text-[11px] pt-0.5">
                <div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      Min 6 characters required ({newPassword.length}/6)
                    </span>
                  )}
                </div>
                <div>
                  {confirmPassword.length > 0 && (
                    newPassword === confirmPassword ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Passwords match perfectly
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <XCircle size={12} className="text-rose-600" />
                        Passwords do not match
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preferred Visit Time Slots Section */}
          <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2.5" ref={slotDropdownRef}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Clock size={13} className="text-blue-600" />
                <span>Preferred Visiting Windows for Tenants</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {selectedSlots.length} Selected
              </span>
            </div>

            {/* Dropdown Multi-Select Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSlotDropdown((prev) => !prev)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex-1 truncate pr-2">
                  {selectedSlots.length === 0 ? (
                    <span className="text-slate-400 font-normal">Select visit time slots from list...</span>
                  ) : (
                    <span className="font-semibold text-slate-800 truncate block">
                      {selectedSlots.join(', ')}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${showSlotDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Slot Options Dropdown */}
              {showSlotDropdown && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 max-h-56 overflow-y-auto p-1">
                  <div className="p-1">
                    <span className="text-[10px] font-bold text-slate-400 px-2 uppercase block">Popular Windows</span>
                    {POPULAR_SLOTS.map((slot) => {
                      const isSel = selectedSlots.includes(slot);
                      return (
                        <div
                          key={slot}
                          onClick={() => toggleSlot(slot)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSel ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSel ? <CheckSquare size={13} className="text-blue-600 shrink-0" /> : <Square size={13} className="text-slate-300 shrink-0" />}
                            <span>{slot}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-1">
                    <span className="text-[10px] font-bold text-slate-400 px-2 uppercase block">Hourly Slots</span>
                    {HOURLY_SLOTS.map((slot) => {
                      const isSel = selectedSlots.includes(slot);
                      return (
                        <div
                          key={slot}
                          onClick={() => toggleSlot(slot)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSel ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSel ? <CheckSquare size={13} className="text-blue-600 shrink-0" /> : <Square size={13} className="text-slate-300 shrink-0" />}
                            <span>{slot}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Slot Adder Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Or type custom slot (e.g. 7:30 PM - 9:00 PM)..."
                value={customSlotInput}
                onChange={(e) => setCustomSlotInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSlot();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddCustomSlot}
                className="px-3 py-1.5 bg-[#0b3856] hover:bg-[#07263b] text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {/* Selected Slot Removable Chips */}
            {selectedSlots.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSlots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200 text-[11px] font-semibold shadow-2xs"
                  >
                    <span>{slot}</span>
                    <button
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className="w-3.5 h-3.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove slot"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 font-medium text-slate-800 ${
                  phone.trim().replace(/\D/g, '').length >= 10
                    ? 'border-slate-200 focus:ring-blue-500'
                    : 'border-amber-300 focus:ring-amber-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                WhatsApp Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp for tenant inquiries"
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 font-medium text-slate-800 ${
                  whatsapp.trim().replace(/\D/g, '').length >= 10
                    ? 'border-slate-200 focus:ring-blue-500'
                    : 'border-amber-300 focus:ring-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Validation note if not valid */}
          {!isFormValid && (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10.5px] text-amber-800">
              <span className="font-bold">Required to continue:</span> Min 6-char matching password, at least 1 visiting window, and valid 10-digit phone & WhatsApp.
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                isFormValid && !loading
                  ? 'bg-[#0b3856] hover:bg-[#07263b] active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed opacity-70'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{loading ? 'Saving Setup...' : 'Save & Enter Dashboard'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default OwnerSelfSetupModal;
