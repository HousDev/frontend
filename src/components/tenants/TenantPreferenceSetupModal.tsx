import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin, Building, User, Check, Loader2, Search, X, ChevronDown,
  Building2, SlidersHorizontal, CheckSquare, Square, IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { getMasterDropdownOptions } from '@/lib/useMasterData';

interface TenantPreferenceSetupModalProps {
  isOpen: boolean;
  tenant: {
    id: number;
    name: string;
    preferred_location?: string;
    budget_min?: string | number;
    budget_max?: string | number;
    preferred_bhk?: string;
    tenant_type?: string;
  };
  onSaveSuccess: (updatedData: {
    preferred_location: string;
    budget_min: string | number;
    budget_max: string | number;
    preferred_bhk: string;
    tenant_type: string;
  }) => void;
  allowDismiss?: boolean;
}

// Helper to format currency in Indian numbering & full English words
const formatIndianCurrencyWords = (val: string | number | undefined): string => {
  if (!val && val !== 0) return '';
  const num = Number(val);
  if (isNaN(num) || num <= 0) return '';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const makeWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + makeWords(n % 100) : '');
    return '';
  };

  let str = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num / 100000) % 100);
  const thousand = Math.floor((num / 1000) % 100);
  const hundred = Math.floor((num / 100) % 10);
  const rest = num % 100;

  if (crore) str += makeWords(crore) + ' Crore ';
  if (lakh) str += makeWords(lakh) + ' Lakh ';
  if (thousand) str += makeWords(thousand) + ' Thousand ';
  if (hundred) str += makeWords(hundred) + ' Hundred ';
  if (rest) str += makeWords(rest);

  const wordResult = str.trim();
  return wordResult ? `${wordResult} Rupees` : '';
};

export const TenantPreferenceSetupModal: React.FC<TenantPreferenceSetupModalProps> = ({
  isOpen,
  tenant,
  onSaveSuccess,
  allowDismiss = false,
}) => {
  // Master options state
  const [masterLocations, setMasterLocations] = useState<string[]>([]);
  const [masterBhkOptions, setMasterBhkOptions] = useState<string[]>([
    '1 RK', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '5+ BHK'
  ]);
  const [masterTenantTypes, setMasterTenantTypes] = useState<string[]>([
    'Family', 'Bachelor', 'Bachelor (Male)', 'Bachelor (Female)', 'Company Lease', 'Student', 'Any'
  ]);

  // Form State
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const raw = tenant?.preferred_location || '';
    return raw ? raw.split(/[;,]+/).map((s) => s.trim()).filter(Boolean) : [];
  });
  const [locationSearchTerm, setLocationSearchTerm] = useState<string>('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState<boolean>(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedBhks, setSelectedBhks] = useState<string[]>(() => {
    const raw = tenant?.preferred_bhk || '';
    return raw ? raw.split(/[;,]+/).map((s) => s.trim()).filter(Boolean) : [];
  });
  const [isBhkDropdownOpen, setIsBhkDropdownOpen] = useState<boolean>(false);
  const [bhkSearchTerm, setBhkSearchTerm] = useState<string>('');
  const bhkDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedTenantType, setSelectedTenantType] = useState<string>(tenant?.tenant_type || 'Family');
  const [isTenantTypeDropdownOpen, setIsTenantTypeDropdownOpen] = useState<boolean>(false);
  const tenantTypeDropdownRef = useRef<HTMLDivElement>(null);

  const [budgetMin, setBudgetMin] = useState<string>(tenant?.budget_min ? String(tenant.budget_min) : '');
  const [budgetMax, setBudgetMax] = useState<string>(tenant?.budget_max ? String(tenant.budget_max) : '');

  const [saving, setSaving] = useState<boolean>(false);

  // Fetch Master Data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const data = await getMasterDropdownOptions(['common', 'property', 'location', 'lead', 'buyer']);

        // 1. Common Master -> Locations
        const locs = (data['location'] || data['locations'] || data['preferred_location'] || data['locality'] || [])
          .map((o: any) => o.label || o.value || o.name || String(o))
          .filter(Boolean);
        if (locs.length > 0) {
          setMasterLocations(Array.from(new Set(locs)).sort((a: string, b: string) => a.localeCompare(b)));
        }

        // 2. Property Master -> Unit Types / BHK
        const bhks = (data['unit type'] || data['unit_type'] || data['preferred_bhk'] || data['property type'] || [])
          .map((o: any) => o.label || o.value || o.name || String(o))
          .filter(Boolean);
        if (bhks.length > 0) {
          setMasterBhkOptions(Array.from(new Set(bhks)));
        }

        // 3. Tenant Types
        const tTypes = (data['tenant type'] || data['tenant_type'] || data['tenant_types'] || [])
          .map((o: any) => o.label || o.value || o.name || String(o))
          .filter(Boolean);
        if (tTypes.length > 0) {
          setMasterTenantTypes(Array.from(new Set(tTypes)));
        }
      } catch (err) {
        console.warn('Error fetching master options in modal:', err);
      }
    };
    if (isOpen) {
      fetchMasterData();
    }
  }, [isOpen]);

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (bhkDropdownRef.current && !bhkDropdownRef.current.contains(e.target as Node)) {
        setIsBhkDropdownOpen(false);
      }
      if (tenantTypeDropdownRef.current && !tenantTypeDropdownRef.current.contains(e.target as Node)) {
        setIsTenantTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered lists
  const filteredLocationOptions = useMemo(() => {
    if (!locationSearchTerm.trim()) return masterLocations;
    const term = locationSearchTerm.toLowerCase().trim();
    return masterLocations.filter((loc) => loc.toLowerCase().includes(term));
  }, [masterLocations, locationSearchTerm]);

  const filteredBhkOptions = useMemo(() => {
    if (!bhkSearchTerm.trim()) return masterBhkOptions;
    const term = bhkSearchTerm.toLowerCase().trim();
    return masterBhkOptions.filter((bhk) => bhk.toLowerCase().includes(term));
  }, [masterBhkOptions, bhkSearchTerm]);

  // Toggle selection helpers
  const toggleLocationSelection = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((item) => item !== loc) : [...prev, loc]
    );
  };

  const toggleBhkSelection = (bhk: string) => {
    setSelectedBhks((prev) =>
      prev.includes(bhk) ? prev.filter((item) => item !== bhk) : [...prev, bhk]
    );
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedLocations.length === 0) {
      toast.error('Please select at least one preferred location');
      setIsLocationDropdownOpen(true);
      return;
    }

    if (selectedBhks.length === 0) {
      toast.error('Please select at least one unit type (BHK)');
      setIsBhkDropdownOpen(true);
      return;
    }

    // Budget validation (minimum value >= 1000)
    const minVal = budgetMin ? Number(budgetMin) : null;
    const maxVal = budgetMax ? Number(budgetMax) : null;

    if (minVal !== null && (!isNaN(minVal) && minVal > 0 && minVal < 1000)) {
      toast.error('Minimum budget cannot be less than ₹1,000');
      return;
    }

    if (maxVal !== null && (!isNaN(maxVal) && maxVal > 0 && maxVal < 1000)) {
      toast.error('Maximum budget cannot be less than ₹1,000');
      return;
    }

    if (minVal !== null && maxVal !== null && !isNaN(minVal) && !isNaN(maxVal) && minVal > 0 && maxVal > 0 && maxVal < minVal) {
      toast.error('Maximum budget cannot be less than minimum budget');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        preferred_location: selectedLocations.join(', '),
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        preferred_bhk: selectedBhks.join(', '),
        tenant_type: selectedTenantType || 'Family',
      };

      if (tenant?.id) {
        await tenantAPI.update(tenant.id, payload);
      }

      localStorage.removeItem('prompt_tenant_preferences');
      toast.success('Rental preferences saved! Showing best matched rental properties.');
      onSaveSuccess(payload as any);
    } catch (err: any) {
      console.error('Error saving rental preferences:', err);
      toast.error(err?.response?.data?.message || 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0b3856] via-[#0f2b3d] to-[#1e4e6d] p-4 sm:p-5 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">Rental Requirements & Preferences</h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                  Required
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Hi {tenant.name}, please complete your criteria to find instant matching properties.
              </p>
            </div>
          </div>

          {allowDismiss && (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('prompt_tenant_preferences');
              }}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* 1. Preferred Location (Searchable Multi-Select from Common Master) */}
          <div className="relative" ref={locationDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-orange-500" />
                <span>Preferred Locations <span className="text-rose-500">*</span></span>
              </span>
              <span className="text-[9px] font-bold text-orange-600">
                {selectedLocations.length > 0 && `${selectedLocations.length} Selected`}
              </span>
            </label>

            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsLocationDropdownOpen((prev) => !prev)}
              className={`w-full min-h-[38px] px-3 py-1.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${isLocationDropdownOpen
                ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white'
                : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
            >
              <div className="flex-1 truncate pr-2">
                {selectedLocations.length === 0 ? (
                  <span className="text-gray-400 text-xs font-normal">
                    Search & select localities (e.g. Balewadi, Baner, Wakad)...
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {selectedLocations.slice(0, 3).join(', ')}
                    {selectedLocations.length > 3 && ` (+${selectedLocations.length - 3} more)`}
                  </span>
                )}
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform duration-200 shrink-0 ${isLocationDropdownOpen ? 'rotate-180 text-orange-600' : ''
                  }`}
              />
            </button>

            {/* Dropdown Popup */}
            {isLocationDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-gray-100 bg-slate-50/90 sticky top-0 z-10 space-y-1.5">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type to search localities..."
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-7 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {locationSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setLocationSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-0.5 text-[10px]">
                    <span className="text-gray-500 font-medium">
                      {filteredLocationOptions.length} localities available
                    </span>
                    {selectedLocations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedLocations([])}
                        className="text-red-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Clear ({selectedLocations.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 p-1">
                  {filteredLocationOptions.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 text-xs">
                      No localities found matching "{locationSearchTerm}"
                    </div>
                  ) : (
                    filteredLocationOptions.map((loc) => {
                      const isSelected = selectedLocations.includes(loc);
                      return (
                        <div
                          key={loc}
                          onClick={() => toggleLocationSelection(loc)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${isSelected
                            ? 'bg-orange-50 text-orange-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {isSelected ? (
                              <CheckSquare size={13} className="text-orange-600 shrink-0" />
                            ) : (
                              <Square size={13} className="text-gray-300 shrink-0" />
                            )}
                            <span className="truncate">{loc}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded">
                              Selected
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Selected Location Pills Preview */}
            {selectedLocations.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {selectedLocations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-bold"
                  >
                    <span>{loc}</span>
                    <button
                      type="button"
                      onClick={() => toggleLocationSelection(loc)}
                      className="text-orange-500 hover:text-orange-900 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Preferred Unit Type (BHK) - Dropdown / Multi-Select from Property Master */}
          <div className="relative" ref={bhkDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building size={12} className="text-[#0b3856]" />
                <span>Preferred Unit Type / BHK <span className="text-rose-500">*</span></span>
              </span>
              <span className="text-[9px] text-orange-600 font-bold">
                {selectedBhks.length > 0 ? `${selectedBhks.length} Selected` : 'Property Master'}
              </span>
            </label>

            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsBhkDropdownOpen((prev) => !prev)}
              className={`w-full min-h-[38px] px-3 py-1.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${isBhkDropdownOpen
                ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white'
                : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
            >
              <div className="flex-1 truncate pr-2">
                {selectedBhks.length === 0 ? (
                  <span className="text-gray-400 text-xs font-normal">
                    Select Unit Types (e.g. 1 BHK, 2 BHK, 3 BHK)...
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {selectedBhks.join(', ')}
                  </span>
                )}
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform duration-200 shrink-0 ${isBhkDropdownOpen ? 'rotate-180 text-orange-600' : ''
                  }`}
              />
            </button>

            {/* Dropdown Popup */}
            {isBhkDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-gray-100 bg-slate-50/90 sticky top-0 z-10 space-y-1.5">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search unit types..."
                      value={bhkSearchTerm}
                      onChange={(e) => setBhkSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-7 py-1 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="max-h-44 overflow-y-auto divide-y divide-gray-50 p-1">
                  {filteredBhkOptions.map((bhk) => {
                    const isSelected = selectedBhks.includes(bhk);
                    return (
                      <div
                        key={bhk}
                        onClick={() => toggleBhkSelection(bhk)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${isSelected
                          ? 'bg-orange-50 text-orange-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <CheckSquare size={13} className="text-orange-600 shrink-0" />
                          ) : (
                            <Square size={13} className="text-gray-300 shrink-0" />
                          )}
                          <span>{bhk}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


          </div>

          {/* 3. Monthly Budget Range (Min & Max with Real-Time Formatted Currency Text) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IndianRupee size={12} className="text-emerald-600" />
                <span>Monthly Rent Budget Range (₹)</span>
              </span>
              <span className="text-[9px] text-gray-400 font-semibold">Min: ₹1,000</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">

              {/* Min Budget */}
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 font-bold block uppercase">Min Budget (₹)</span>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="e.g. 8000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-semibold text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${budgetMin && Number(budgetMin) > 0 && Number(budgetMin) < 1000
                    ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                    : 'border-gray-300 focus:ring-orange-500'
                    }`}
                />
                {/* Formatted Text in Words */}
                <div className="min-h-[16px]">
                  {budgetMin && Number(budgetMin) > 0 && Number(budgetMin) < 1000 ? (
                    <span className="text-[10px] font-bold text-red-500 block">
                      ⚠️ Min ₹1,000 required
                    </span>
                  ) : budgetMin && Number(budgetMin) >= 1000 ? (
                    <span className="text-[10px] font-black text-emerald-600 block">
                      {formatIndianCurrencyWords(budgetMin)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-400 font-medium block">Starting monthly rent</span>
                  )}
                </div>
              </div>

              {/* Max Budget */}
              <div className="space-y-1">
                <span className="text-[9px] text-gray-500 font-bold block uppercase">Max Budget (₹)</span>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="e.g. 29000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-semibold text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${budgetMax && Number(budgetMax) > 0 && Number(budgetMax) < 1000
                    ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                    : 'border-gray-300 focus:ring-orange-500'
                    }`}
                />
                {/* Formatted Text in Words */}
                <div className="min-h-[16px]">
                  {budgetMax && Number(budgetMax) > 0 && Number(budgetMax) < 1000 ? (
                    <span className="text-[10px] font-bold text-red-500 block">
                      ⚠️ Min ₹1,000 required
                    </span>
                  ) : budgetMax && Number(budgetMax) >= 1000 ? (
                    <span className="text-[10px] font-black text-orange-600 block">
                      {formatIndianCurrencyWords(budgetMax)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-400 font-medium block">Max monthly rent</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 4. Tenant Type - Dropdown / Select from Master */}
          <div className="relative" ref={tenantTypeDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User size={12} className="text-purple-600" />
                <span>Tenant Type</span>
              </span>
            </label>

            {/* Dropdown Selector */}
            <select
              value={selectedTenantType}
              onChange={(e) => setSelectedTenantType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-semibold text-slate-800 cursor-pointer"
            >
              {masterTenantTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>


          </div>

          {/* Action CTA (Mandatory - No Skip Button!) */}
          <div className="pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Preferences & Finding Matches...</span>
                </>
              ) : (
                <>
                  <Check size={16} className="stroke-[3]" />
                  <span>Save Preferences & View Matched Homes</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TenantPreferenceSetupModal;
