import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, Calendar, Key, Lock,
  Copy, Check, Edit, Shield, IndianRupee, AlertCircle, Eye, EyeOff,
  Clock, Plus, ChevronDown, CheckSquare, Square, X, Building2
} from 'lucide-react';
import { toast } from 'react-toastify';
import ownerAPI from '@/lib/ownerAPI';

interface OwnerProfileTabProps {
  owner: any;
  derivedUsername: string;
  onOpenEditModal: () => void;
}

const AVAILABLE_SLOT_OPTIONS = [
  {
    group: 'Popular Visiting Windows',
    options: [
      'Morning (10:00 AM - 01:00 PM)',
      'Afternoon (02:00 PM - 05:00 PM)',
      'Evening (05:00 PM - 08:00 PM)',
      'Weekends (11:00 AM - 06:00 PM)',
      'All Day (10:00 AM - 08:00 PM)',
      'Anytime with 2hr Prior Notice',
    ],
  },
  {
    group: 'Specific Hourly Slots',
    options: [
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 01:00 PM',
      '02:00 PM - 03:00 PM',
      '04:00 PM - 05:00 PM',
      '05:00 PM - 06:00 PM',
      '06:00 PM - 07:00 PM',
      '07:00 PM - 08:00 PM',
    ],
  },
];

export const OwnerProfileTab: React.FC<OwnerProfileTabProps> = ({
  owner,
  derivedUsername,
  onOpenEditModal,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Preferred visit slots with React state for instant UI updates
  const [preferredSlots, setPreferredSlots] = useState<string[]>(() => {
    try {
      const s =
        localStorage.getItem(`owner_preferred_slots_${owner?.id}`) ||
        localStorage.getItem('owner_preferred_slots_global');
      return s
        ? JSON.parse(s)
        : ['Morning (10:00 AM - 01:00 PM)', 'Evening (05:00 PM - 08:00 PM)'];
    } catch {
      return ['Morning (10:00 AM - 01:00 PM)', 'Evening (05:00 PM - 08:00 PM)'];
    }
  });

  useEffect(() => {
    if (owner?.id) {
      try {
        const s =
          localStorage.getItem(`owner_preferred_slots_${owner.id}`) ||
          localStorage.getItem('owner_preferred_slots_global');
        if (s) setPreferredSlots(JSON.parse(s));
      } catch {}
    }
  }, [owner?.id]);

  // Click outside to close multi-select dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(derivedUsername);
    toast.success(`Copied username: @${derivedUsername}`);
  };

  const handleCopyEmail = () => {
    if (owner?.email) {
      navigator.clipboard.writeText(owner.email);
      toast.success(`Copied email: ${owner.email}`);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
    let pass = 'Owner@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmPassword(pass);
    setShowPass(true);
    toast.info(`Generated password: ${pass}`);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!owner?.id) {
      toast.error('Owner account ID not found');
      return;
    }

    try {
      setUpdatingPass(true);
      await ownerAPI.updatePassword(owner.id, newPassword);
      toast.success(
        'Password updated successfully! You can now log in with your new password.'
      );
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Error updating password'
      );
    } finally {
      setUpdatingPass(false);
    }
  };

  // Helper to persist slots across all storage keys
  const persistSlots = (updated: string[]) => {
    setPreferredSlots(updated);

    // 1. By numeric Owner ID
    if (owner?.id) {
      localStorage.setItem(`owner_preferred_slots_${owner.id}`, JSON.stringify(updated));
    }
    // 2. By Code e.g. OWN0002
    const ownerCode = `OWN${String(owner?.id || '1').padStart(4, '0')}`;
    localStorage.setItem(`owner_preferred_slots_${ownerCode}`, JSON.stringify(updated));

    // 3. By Name e.g. sunita_sharma
    if (owner?.name) {
      const sanitizedName = owner.name.toLowerCase().replace(/mrs\.|mr\./g, '').trim().replace(/\s+/g, '_');
      localStorage.setItem(`owner_preferred_slots_${sanitizedName}`, JSON.stringify(updated));
    }

    // 4. Global fallback
    localStorage.setItem('owner_preferred_slots_global', JSON.stringify(updated));

    // 5. Sync to all owner's properties
    if (Array.isArray(owner?.properties)) {
      owner.properties.forEach((p: any) => {
        if (p?.id) {
          localStorage.setItem(`property_preferred_slots_${p.id}`, JSON.stringify(updated));
        }
      });
    }

    // 6. Persist to database if owner ID exists
    if (owner?.id) {
      try {
        ownerAPI.updateLeadField(owner.id, 'preferred_visit_slots', JSON.stringify(updated));
        ownerAPI.update(owner.id, { preferred_visit_slots: JSON.stringify(updated) });
      } catch {}
    }
  };

  // Toggle multi-select slot
  const handleToggleSlot = (slotVal: string) => {
    let updated: string[];
    if (preferredSlots.includes(slotVal)) {
      if (preferredSlots.length <= 1) {
        toast.warning('Please keep at least one visit slot configured');
        return;
      }
      updated = preferredSlots.filter((s) => s !== slotVal);
      toast.info(`Removed slot: ${slotVal}`);
    } else {
      updated = [...preferredSlots, slotVal];
      toast.success(`Added slot: ${slotVal}`);
    }

    persistSlots(updated);
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    if (preferredSlots.length <= 1) {
      toast.warning('Please keep at least one visit slot configured');
      return;
    }
    const updated = preferredSlots.filter((s) => s !== slotToRemove);
    persistSlots(updated);
    toast.info(`Removed slot: ${slotToRemove}`);
  };

  const ownerCode = `OWN${String(owner?.id || '1').padStart(4, '0')}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 🏆 Header Banner (Clean Rectangular with subtle curve) */}
      <div className="bg-gradient-to-r from-[#0b3856] via-[#0f2b3d] to-[#1e4e6d] rounded-lg p-4 sm:p-5 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-md bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-base font-black shadow-inner">
              {owner?.name ? owner.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  {owner?.name || 'Owner Profile'}
                </h1>
                <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                  Verified Owner
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-slate-200 font-mono text-[10px] font-bold border border-white/15">
                  <User size={10} className="text-orange-400" />
                  @{derivedUsername}
                </span>
                <span className="text-[10px] font-mono text-orange-300 font-bold">
                  ({ownerCode})
                </span>
                <button
                  type="button"
                  onClick={handleCopyUsername}
                  className="p-1 rounded bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  title="Copy Username"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEditModal}
            className="px-3.5 py-1.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Edit size={12} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2-Column Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Card 1: Personal & Contact Info */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Shield size={13} />
              </div>
              <h3 className="font-bold text-xs text-slate-900">
                Personal & Contact Info
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenEditModal}
              className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <Edit size={11} />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2 rounded-md bg-slate-50 border border-slate-200/80">
              <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                Full Name
              </label>
              <div className="font-bold text-slate-900 text-xs">
                {owner?.name || 'N/A'}
              </div>
            </div>

            <div className="p-2 rounded-md bg-slate-50 border border-slate-200/80">
              <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                Username
              </label>
              <div className="font-mono font-bold text-orange-600 text-xs">
                @{derivedUsername}
              </div>
            </div>

            <div className="p-2 rounded-md bg-slate-50 border border-slate-200/80">
              <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                Phone
              </label>
              <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Phone size={11} className="text-emerald-600" />
                <span>{owner?.phone || 'Not Provided'}</span>
              </div>
            </div>

            <div className="p-2 rounded-md bg-slate-50 border border-slate-200/80">
              <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                WhatsApp
              </label>
              <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                <Phone size={11} className="text-[#25D366]" />
                <span>{owner?.whatsapp || owner?.phone || 'Not Provided'}</span>
              </div>
            </div>

            <div className="sm:col-span-2 p-2 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5">
                  Email Address
                </label>
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Mail size={11} className="text-blue-500" />
                  <span>{owner?.email || 'Not Provided'}</span>
                </div>
              </div>
              {owner?.email && (
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 rounded text-gray-400 hover:text-slate-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  title="Copy Email"
                >
                  <Copy size={11} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Security & Password */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Lock size={13} />
              </div>
              <h3 className="font-bold text-xs text-slate-900">
                Security & Password
              </h3>
            </div>
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <Key size={11} />
              <span>Auto-Generate</span>
            </button>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-2 text-xs">
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="New Password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-md border border-gray-300 text-xs focus:outline-none focus:border-orange-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            <div>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-xs focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPass || !newPassword}
              className="w-full py-2 rounded-md bg-[#0b3856] hover:bg-[#072438] disabled:opacity-50 text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock size={12} />
              <span>{updatingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Card 3: Multi-Select Preferred Site Visit Timings */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Calendar size={13} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">
                Preferred Site Visit Timings (Multi-Select)
              </h3>
              <p className="text-[10px] text-gray-500">
                Configure convenient visiting hours for tenants inspecting your rental units
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            {preferredSlots.length} Active Slots
          </span>
        </div>

        {/* Custom Multi-Select Dropdown Component */}
        <div className="relative max-w-xl" ref={dropdownRef}>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Choose Available Timing Windows
          </label>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full h-9.5 px-3 rounded-md border border-gray-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-between shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Clock size={13} className="text-orange-500 shrink-0" />
              <span className="truncate">
                {preferredSlots.length > 0
                  ? `${preferredSlots.length} Timing Windows Selected`
                  : 'Click to select visiting slots...'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Floating Dropdown Checklist */}
          {showDropdown && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 p-2 z-50 max-h-72 overflow-y-auto space-y-1.5 animate-in fade-in duration-100 text-xs">
              {AVAILABLE_SLOT_OPTIONS.map((group) => (
                <div key={group.group} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pt-1">
                    {group.group}
                  </div>
                  {group.options.map((opt) => {
                    const isSelected = preferredSlots.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleSlot(opt)}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 text-orange-950 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">{opt}</span>
                        {isSelected ? (
                          <CheckSquare
                            size={13}
                            className="text-orange-600 shrink-0"
                          />
                        ) : (
                          <Square
                            size={13}
                            className="text-gray-300 shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Slot Badge Pills */}
        <div className="space-y-1 pt-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Active Visit Windows (Click × to remove):
          </label>
          <div className="flex flex-wrap gap-1.5">
            {preferredSlots.map((slot: string) => (
              <span
                key={slot}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b3856] text-white font-bold text-[10px] shadow-2xs"
              >
                <span>⚡ {slot}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(slot)}
                  className="w-3.5 h-3.5 rounded bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-[9px] font-black cursor-pointer transition-colors"
                  title="Remove timing"
                >
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Storage location confirmation banner */}
        <div className="p-2.5 rounded-md bg-orange-50/70 border border-orange-200/80 text-[10px] text-orange-950 flex items-center gap-2">
          <IndianRupee size={12} className="text-orange-600 shrink-0" />
          <span>
            <strong>Automatic Listing Sync:</strong> These visit windows are synced live to all your rental property forms and listing detail pages so tenants can instant-book visits within these slots.
          </span>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfileTab;
