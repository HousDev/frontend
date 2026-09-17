import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  MapPin,
  IndianRupee,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Search,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { api } from "@/lib/api";

export interface OwnerRentalFormData {
  property_type_name: string;
  property_subtype_name: string;
  unit_type: string;
  location_name: string;
  society_name: string;
  monthly_rent: string;
  security_deposit: string;
  furnishing?: string;
}

interface REXOwnerRentalWizardCardProps {
  initialData?: Partial<OwnerRentalFormData>;
  disabled?: boolean;
  onSubmit: (data: OwnerRentalFormData) => void;
}

const POPULAR_PUNE_LOCALITIES = [
  "Baner", "Wakad", "Hinjewadi", "Kharadi", "Ravet", "Swargate", "Kothrud"
];

const DEFAULT_LOCALITIES = [
  "Baner", "Wakad", "Hinjewadi", "Kharadi", "Ravet", "Swargate", "Kothrud",
  "Balewadi", "Punawale", "Tathawade", "Pimple Saudagar", "Aundh", "Viman Nagar", "Bavdhan"
];

const POPULAR_SOCIETIES = [
  "Ganga Acropolis",
  "Pride Purple Park",
  "Blue Ridge",
  "Amanora Park Town",
  "Kolte Patil Life Republic",
  "Regency Astra",
  "Godrej Elements",
  "Rohan Mithila"
];

export const REXOwnerRentalWizardCard: React.FC<REXOwnerRentalWizardCardProps> = ({
  initialData,
  disabled = false,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  // Note: Property Type is defaulted internally to "Residential" (field removed from UI as requested)
  const [propertyType] = useState(initialData?.property_type_name || "Residential");
  const [propertySubtype, setPropertySubtype] = useState(initialData?.property_subtype_name || "Apartment / Flat");
  const [unitType, setUnitType] = useState(initialData?.unit_type || "2 BHK");
  const [locality, setLocality] = useState(initialData?.location_name || "Baner");
  const [customLocality, setCustomLocality] = useState("");
  const [localitySearchQuery, setLocalitySearchQuery] = useState("");
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const localityDropdownRef = useRef<HTMLDivElement>(null);

  const [society, setSociety] = useState(initialData?.society_name || "");
  const [societySearchQuery, setSocietySearchQuery] = useState("");
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const societyDropdownRef = useRef<HTMLDivElement>(null);

  const [rent, setRent] = useState(initialData?.monthly_rent || "");
  const [deposit, setDeposit] = useState(initialData?.security_deposit || "");

  // Options from Master
  const [subtypeOptions, setSubtypeOptions] = useState<string[]>([
    "Apartment / Flat", "Independent House", "Villa / Row House", "Penthouse", "Studio Apartment"
  ]);
  const [unitTypeOptions, setUnitTypeOptions] = useState<string[]>([
    "1 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5 BHK", "6 BHK"
  ]);
  const [localityOptions, setLocalityOptions] = useState<string[]>(DEFAULT_LOCALITIES);
  const [societyOptions, setSocietyOptions] = useState<string[]>(POPULAR_SOCIETIES);
  const [errorMsg, setErrorMsg] = useState("");

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (localityDropdownRef.current && !localityDropdownRef.current.contains(event.target as Node)) {
        setIsLocalityDropdownOpen(false);
      }
      if (societyDropdownRef.current && !societyDropdownRef.current.contains(event.target as Node)) {
        setIsSocietyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load masters on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await getMasterDropdownOptions(["property", "common", "lead"]);
        if (!isMounted || !raw) return;

        const normalize = (k: string) => k.toLowerCase().replace(/[\s_-]+/g, "");
        const keys = Object.keys(raw);

        // 1. Subtypes
        const subKey = keys.find((k) => normalize(k) === "propertysubtype" || normalize(k) === "propertysubtypes");
        if (subKey && Array.isArray(raw[subKey]) && raw[subKey].length > 0) {
          const list = raw[subKey].map((o: MasterOption) => o.value || o.label).filter(Boolean);
          if (list.length > 0) setSubtypeOptions(Array.from(new Set(list)));
        }

        // 2. Unit types (BHK) strictly from Property Master
        const unitKey = keys.find(
          (k) => normalize(k) === "unittype" || normalize(k) === "unittypes" || normalize(k) === "bhk"
        );
        if (unitKey && Array.isArray(raw[unitKey]) && raw[unitKey].length > 0) {
          const list = raw[unitKey].map((o: MasterOption) => o.value || o.label).filter(Boolean);
          if (list.length > 0) {
            const formatted = list.map((b) => {
              const m = b.match(/^(\d+(?:\.\d+)?)\s*bhk$/i);
              return m ? `${m[1]} BHK` : b;
            });
            const sorted = Array.from(new Set(formatted)).sort((a, b) => {
              const numA = parseFloat(a.replace(/[^\d.]/g, "")) || 0;
              const numB = parseFloat(b.replace(/[^\d.]/g, "")) || 0;
              return numA - numB;
            });
            setUnitTypeOptions(sorted);
            if (!initialData?.unit_type && sorted.length > 0) {
              setUnitType(sorted.includes("2 BHK") ? "2 BHK" : sorted[0]);
            }
          }
        }

        // 3. Localities
        const locKey = keys.find((k) => normalize(k) === "location" || normalize(k) === "locality" || normalize(k) === "localities" || normalize(k) === "placename");
        if (locKey && Array.isArray(raw[locKey]) && raw[locKey].length > 0) {
          const list = raw[locKey].map((o: MasterOption) => o.value || o.label).filter(Boolean);
          if (list.length > 0) setLocalityOptions(Array.from(new Set([...DEFAULT_LOCALITIES, ...list])));
        }

        // 4. Societies from Property Master ("Society") + Societies table
        const socKey = keys.find((k) => normalize(k) === "society" || normalize(k) === "societies");
        const masterSocList = socKey && Array.isArray(raw[socKey])
          ? raw[socKey].map((o: MasterOption) => (o.value || o.label || "").trim()).filter(Boolean)
          : [];

        let apiSocList: string[] = [];
        try {
          const socRes = await api.get("/societies/get-all");
          const sData = socRes.data?.societies || socRes.data?.data || socRes.data || [];
          if (Array.isArray(sData)) {
            apiSocList = sData.map((s: any) => (s.society_name || s.name || "").trim()).filter(Boolean);
          }
        } catch (e) {
          console.warn("Could not load societies from API:", e);
        }

        const mergedSocieties = Array.from(new Set([...POPULAR_SOCIETIES, ...masterSocList, ...apiSocList]))
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        setSocietyOptions(mergedSocieties);
      } catch (err) {
        console.warn("Could not load property masters for owner wizard:", err);
      }
    })();
    return () => { isMounted = false; };
  }, [initialData?.unit_type]);

  const activeLocality = customLocality.trim() || locality;

  // Filter localities
  const filteredLocalities = localityOptions.filter((loc) =>
    loc.toLowerCase().includes(localitySearchQuery.toLowerCase().trim())
  );

  // Filter societies
  const filteredSocieties = societyOptions.filter((soc) =>
    soc.toLowerCase().includes(societySearchQuery.toLowerCase().trim())
  );

  const handleNextStep1 = () => {
    setErrorMsg("");
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!activeLocality.trim()) {
      setErrorMsg("Please select or enter your property locality.");
      return;
    }
    if (!society.trim()) {
      setErrorMsg("Please select or enter your society or project name.");
      return;
    }
    setErrorMsg("");
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!rent.trim()) {
      setErrorMsg("Please enter the expected monthly rent.");
      return;
    }

    onSubmit({
      property_type_name: propertyType,
      property_subtype_name: propertySubtype,
      unit_type: unitType,
      location_name: activeLocality,
      society_name: society.trim(),
      monthly_rent: rent.trim(),
      security_deposit: deposit.trim() || (parseFloat(rent) ? String(parseFloat(rent) * 2) : "0"),
      furnishing: "Unfurnished",
    });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl border border-teal-200/90 shadow-sm p-3.5 space-y-3 my-1 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-teal-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
            <Building2 size={15} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
              List Property for Rent (Owner)
            </h4>
            <p className="text-[10.5px] text-teal-800 font-medium">
              Upload your property to get verified tenants & dedicated executive
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 text-teal-900 border border-teal-200 shrink-0">
          Step {step} of 3
        </span>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 px-0.5">
        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? "bg-teal-700" : "bg-slate-200"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? "bg-teal-700" : "bg-slate-200"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? "bg-teal-700" : "bg-slate-200"}`} />
      </div>

      {/* STEP 1: Property Subtype & Unit Type (Property Type Master removed as requested) */}
      {step === 1 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Property Subtype
            </label>
            <select
              value={propertySubtype}
              onChange={(e) => setPropertySubtype(e.target.value)}
              disabled={disabled}
              className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-medium focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white cursor-pointer"
            >
              {subtypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between mb-1">
              <span>Unit Configuration (BHK)</span>
              <span className="text-[9.5px] text-teal-800 font-medium">From Property Master</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {unitTypeOptions.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setUnitType(b)}
                  disabled={disabled}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all text-center cursor-pointer ${
                    unitType === b
                      ? "bg-teal-800 text-white border-teal-800 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep1}
            disabled={disabled}
            className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <span>Continue to Location & Society</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* STEP 2: Location & Society Name (Styled like REXTenantFilterCard locality pills & searchable dropdown) */}
      {step === 2 && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* 1. Preferred Locality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin size={12} className="text-[#e87722]" />
                <span>Preferred Locality (Pune)</span>
              </label>
              {activeLocality && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                  Selected: <strong className="text-teal-700">{activeLocality}</strong>
                </span>
              )}
            </div>

            {/* Popular Locality Chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_PUNE_LOCALITIES.map((loc) => {
                const isSelected = activeLocality.toLowerCase() === loc.toLowerCase();
                return (
                  <button
                    key={loc}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setLocality(loc);
                      setCustomLocality("");
                      setLocalitySearchQuery("");
                      setIsLocalityDropdownOpen(false);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#e87722] text-white border-[#e87722] shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
                    } disabled:cursor-not-allowed`}
                  >
                    {loc}
                  </button>
                );
              })}
            </div>

            {/* Searchable Dropdown */}
            <div className="relative" ref={localityDropdownRef}>
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  disabled={disabled}
                  value={localitySearchQuery || customLocality}
                  onFocus={() => setIsLocalityDropdownOpen(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalitySearchQuery(val);
                    setCustomLocality(val);
                    setIsLocalityDropdownOpen(true);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="Or search another Pune locality (e.g. Swargate, Kharadi)..."
                  className="w-full text-[11px] pl-7 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white transition-all placeholder:text-slate-400"
                />
                {(localitySearchQuery || customLocality) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalitySearchQuery("");
                      setCustomLocality("");
                      setLocality("Baner");
                    }}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
                )}
              </div>

              {/* Autocomplete Dropdown Menu */}
              {isLocalityDropdownOpen && filteredLocalities.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-0.5">
                  {filteredLocalities.slice(0, 25).map((loc) => {
                    const isSelected = activeLocality.toLowerCase() === loc.toLowerCase();
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setLocality(loc);
                          setCustomLocality(loc);
                          setLocalitySearchQuery("");
                          setIsLocalityDropdownOpen(false);
                          if (errorMsg) setErrorMsg("");
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-50 text-teal-800 font-semibold"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{loc}</span>
                        {isSelected && <Check size={12} className="text-teal-700" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. Society Name (with Quick Chips & Searchable Dropdown) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 size={12} className="text-teal-700" />
                <span>Society / Project Name *</span>
              </label>
              {society && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium truncate max-w-[150px]">
                  Selected: <strong className="text-teal-700">{society}</strong>
                </span>
              )}
            </div>

            {/* Popular Society Chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SOCIETIES.slice(0, 6).map((soc) => {
                const isSelected = society.toLowerCase() === soc.toLowerCase();
                return (
                  <button
                    key={soc}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setSociety(soc);
                      setSocietySearchQuery("");
                      setIsSocietyDropdownOpen(false);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-800 text-white border-teal-800 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50"
                    } disabled:cursor-not-allowed`}
                  >
                    {soc}
                  </button>
                );
              })}
            </div>

            {/* Searchable Dropdown for Society */}
            <div className="relative" ref={societyDropdownRef}>
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  disabled={disabled}
                  value={societySearchQuery || society}
                  onFocus={() => setIsSocietyDropdownOpen(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSocietySearchQuery(val);
                    setSociety(val);
                    setIsSocietyDropdownOpen(true);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="Search society from master or type custom name..."
                  className="w-full text-[11px] pl-7 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white transition-all placeholder:text-slate-400"
                />
                {(societySearchQuery || society) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSocietySearchQuery("");
                      setSociety("");
                    }}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
                )}
              </div>

              {/* Autocomplete Dropdown Menu */}
              {isSocietyDropdownOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-0.5">
                  {societySearchQuery.trim() && !filteredSocieties.some(s => s.toLowerCase() === societySearchQuery.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSociety(societySearchQuery.trim());
                        setIsSocietyDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg bg-teal-50 text-teal-800 font-semibold hover:bg-teal-100 transition-all cursor-pointer"
                    >
                      ➕ Use custom: "{societySearchQuery.trim()}"
                    </button>
                  )}
                  {filteredSocieties.slice(0, 30).map((socName) => {
                    const isSelected = society.toLowerCase() === socName.toLowerCase();
                    return (
                      <button
                        key={socName}
                        type="button"
                        onClick={() => {
                          setSociety(socName);
                          setSocietySearchQuery("");
                          setIsSocietyDropdownOpen(false);
                          if (errorMsg) setErrorMsg("");
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-50 text-teal-800 font-semibold"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{socName}</span>
                        {isSelected && <Check size={12} className="text-teal-700" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={disabled}
              className="py-2 px-3 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep2}
              disabled={disabled}
              className="flex-1 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span>Continue to Rent & Deposit</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Rent & Deposit */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <IndianRupee size={12} className="text-teal-700" />
                <span>Monthly Rent (₹) *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 25000"
                value={rent}
                onChange={(e) => setRent(e.target.value.replace(/\D/g, ""))}
                disabled={disabled}
                className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-medium focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <IndianRupee size={12} className="text-teal-700" />
                <span>Security Deposit (₹)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 50000"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value.replace(/\D/g, ""))}
                disabled={disabled}
                className="w-full text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-medium focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={disabled}
              className="py-2 px-3 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-700 to-[#0f2b3d] hover:from-teal-800 hover:to-[#163e58] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={14} />
              <span>Submit Rental Property</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default REXOwnerRentalWizardCard;
