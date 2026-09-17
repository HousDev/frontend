import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  MapPin,
  IndianRupee,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  ChevronDown,
  Check,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";
import { api } from "@/lib/api";

export interface SellerPropertyFormData {
  property_type_name: string;
  property_subtype_name: string;
  unit_type: string;
  location_name: string;
  society_name: string;
  expected_price: string;
  carpet_area?: string;
  floor?: string;
  locality?: string;
  bhk?: string;
}

interface REXSellerWizardCardProps {
  initialData?: Partial<SellerPropertyFormData>;
  disabled?: boolean;
  onSubmit: (data: SellerPropertyFormData) => void;
}

const POPULAR_PUNE_LOCALITIES = [
  "Punawale", "Wakad", "Hinjewadi", "Baner", "Ravet", "Tathawade", "Kharadi"
];

const DEFAULT_LOCALITIES = [
  "Punawale", "Wakad", "Hinjewadi", "Baner", "Ravet", "Tathawade", "Kharadi",
  "Balewadi", "Pimple Saudagar", "Aundh", "Viman Nagar", "Bavdhan", "Kothrud", "Moshi"
];

const POPULAR_SOCIETIES = [
  "VTP HiLife",
  "My Home Punawale",
  "Pride Purple Park",
  "Blue Ridge",
  "Kolte Patil Life Republic",
  "Amanora Park Town",
  "Ganga Acropolis",
  "Regency Astra",
  "Godrej Elements",
  "Rohan Mithila"
];

export const REXSellerWizardCard: React.FC<REXSellerWizardCardProps> = ({
  initialData,
  disabled = false,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [propertyType] = useState(initialData?.property_type_name || "Residential");
  const [propertySubtype, setPropertySubtype] = useState(initialData?.property_subtype_name || "Apartment / Flat");
  const [unitType, setUnitType] = useState(initialData?.unit_type || "2 BHK");
  const [locality, setLocality] = useState(initialData?.location_name || "Punawale");
  const [customLocality, setCustomLocality] = useState("");
  const [localitySearchQuery, setLocalitySearchQuery] = useState("");
  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const localityDropdownRef = useRef<HTMLDivElement>(null);

  const [society, setSociety] = useState(initialData?.society_name || "");
  const [customSociety, setCustomSociety] = useState("");
  const [societySearchQuery, setSocietySearchQuery] = useState("");
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const societyDropdownRef = useRef<HTMLDivElement>(null);

  const [expectedPrice, setExpectedPrice] = useState(initialData?.expected_price || "");
  const [carpetArea, setCarpetArea] = useState(initialData?.carpet_area || "");
  const [floor, setFloor] = useState(initialData?.floor || "");

  // Options from Master
  const [subtypeOptions, setSubtypeOptions] = useState<string[]>([
    "Apartment / Flat", "Penthouse", "Independent House", "Villa / Row House", "Studio Apartment", "Duplex"
  ]);
  const [unitTypeOptions, setUnitTypeOptions] = useState<string[]>([
    "1 RK", "1 BHK", "1.5 BHK", "2 BHK", "2.5 BHK", "3 BHK", "3.5 BHK", "4 BHK", "5+ BHK"
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

        // 4. Societies from Property Master ("Society") + Societies table API
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
        console.warn("Could not load property masters for seller wizard:", err);
      }
    })();
    return () => { isMounted = false; };
  }, [initialData?.unit_type]);

  const activeLocality = customLocality.trim() || locality;
  const activeSociety = customSociety.trim() || society;

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
    if (!activeSociety.trim()) {
      setErrorMsg("Please select or enter your society or project name.");
      return;
    }
    setErrorMsg("");
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!expectedPrice.trim()) {
      setErrorMsg("Please enter your expected selling price.");
      return;
    }

    onSubmit({
      property_type_name: propertyType,
      property_subtype_name: propertySubtype,
      unit_type: unitType,
      location_name: activeLocality,
      society_name: activeSociety,
      expected_price: expectedPrice.trim(),
      carpet_area: carpetArea.trim() || undefined,
      floor: floor.trim() || undefined,
    });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl border border-orange-200/90 shadow-sm p-3.5 space-y-3 my-1 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orange-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e87722] shrink-0">
            <Building2 size={15} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
              Sell Your Property
            </h4>
            <p className="text-[10.5px] text-orange-950 font-medium">
              Direct connection with dedicated Property Executive & verified buyers
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-950 border border-orange-200 shrink-0">
          Step {step} of 3
        </span>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 px-0.5">
        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? "bg-[#e87722]" : "bg-slate-200"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? "bg-[#e87722]" : "bg-slate-200"}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? "bg-[#e87722]" : "bg-slate-200"}`} />
      </div>

      {/* STEP 1: Property Subtype & Unit Type */}
      {step === 1 && (
        <div className="space-y-3">
          {/* Subtype */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Layers size={13} className="text-[#0f2b3d]" />
              <span>Property Subtype</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {subtypeOptions.slice(0, 6).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={disabled}
                  onClick={() => setPropertySubtype(opt)}
                  className={`text-xs font-semibold py-1.5 px-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    propertySubtype === opt
                      ? "bg-orange-50 border-[#e87722] text-[#0f2b3d] shadow-2xs font-bold"
                      : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {propertySubtype === opt && <Check size={12} className="text-[#e87722] shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Type (BHK) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 size={13} className="text-[#e87722]" />
              <span>Configuration / Unit Type</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {unitTypeOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  disabled={disabled}
                  onClick={() => setUnitType(b)}
                  className={`text-xs font-semibold py-1 px-3 rounded-full border transition-all cursor-pointer ${
                    unitType === b
                      ? "bg-[#0f2b3d] border-[#0f2b3d] text-white shadow-2xs font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={handleNextStep1}
            className="w-full py-2 px-3 bg-[#0f2b3d] hover:bg-[#163e58] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Next: Location & Society</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* STEP 2: Locality & Society */}
      {step === 2 && (
        <div className="space-y-3">
          {/* Locality Dropdown / Search */}
          <div className="space-y-1.5 relative" ref={localityDropdownRef}>
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#e87722]" />
                <span>Locality / Area *</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Pune</span>
            </label>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsLocalityDropdownOpen(!isLocalityDropdownOpen)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-semibold text-slate-800 text-left hover:bg-white transition-all cursor-pointer"
            >
              <span className="truncate">{activeLocality || "Select Locality"}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
            </button>

            {isLocalityDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1.5 max-h-56 overflow-y-auto">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={localitySearchQuery}
                    onChange={(e) => setLocalitySearchQuery(e.target.value)}
                    placeholder="Search locality..."
                    className="w-full text-xs pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d]"
                  />
                  {localitySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLocalitySearchQuery("")}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="space-y-0.5 pt-1">
                  {filteredLocalities.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocality(loc);
                        setCustomLocality("");
                        setIsLocalityDropdownOpen(false);
                        setLocalitySearchQuery("");
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                        locality === loc && !customLocality
                          ? "bg-orange-50 text-[#0f2b3d] font-bold"
                          : "hover:bg-slate-50 text-slate-700 font-medium"
                      }`}
                    >
                      <span>{loc}</span>
                      {locality === loc && !customLocality && <Check size={12} className="text-[#e87722]" />}
                    </button>
                  ))}

                  {/* Option for Other Locality */}
                  <button
                    type="button"
                    onClick={() => {
                      setLocality("Other");
                      setIsLocalityDropdownOpen(false);
                    }}
                    className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-[#e87722] hover:bg-orange-50 font-bold border-t border-slate-100 mt-1 cursor-pointer"
                  >
                    + Other (Type custom locality)
                  </button>
                </div>
              </div>
            )}

            {/* Custom Locality Input */}
            {locality === "Other" && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customLocality}
                  onChange={(e) => setCustomLocality(e.target.value)}
                  placeholder="Enter your Pune locality / area"
                  className="w-full text-xs px-3 py-1.5 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e87722] font-semibold text-slate-800"
                />
              </div>
            )}

            {/* Popular quick chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {POPULAR_PUNE_LOCALITIES.slice(0, 5).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLocality(l);
                    setCustomLocality("");
                  }}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    activeLocality === l
                      ? "bg-orange-100/80 border-[#e87722] text-[#0f2b3d]"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Society Dropdown / Input */}
          <div className="space-y-1.5 relative" ref={societyDropdownRef}>
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 size={13} className="text-[#0f2b3d]" />
                <span>Society / Project Name *</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Auto-added to Masters</span>
            </label>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setIsSocietyDropdownOpen(!isSocietyDropdownOpen)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-semibold text-slate-800 text-left hover:bg-white transition-all cursor-pointer"
            >
              <span className="truncate">{activeSociety || "Select or Search Society"}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
            </button>

            {isSocietyDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-1.5 max-h-56 overflow-y-auto">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={societySearchQuery}
                    onChange={(e) => setSocietySearchQuery(e.target.value)}
                    placeholder="Search society name..."
                    className="w-full text-xs pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d]"
                  />
                  {societySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSocietySearchQuery("")}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="space-y-0.5 pt-1">
                  {filteredSocieties.map((soc) => (
                    <button
                      key={soc}
                      type="button"
                      onClick={() => {
                        setSociety(soc);
                        setCustomSociety("");
                        setIsSocietyDropdownOpen(false);
                        setSocietySearchQuery("");
                      }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                        society === soc && !customSociety
                          ? "bg-orange-50 text-[#0f2b3d] font-bold"
                          : "hover:bg-slate-50 text-slate-700 font-medium"
                      }`}
                    >
                      <span className="truncate">{soc}</span>
                      {society === soc && !customSociety && <Check size={12} className="text-[#e87722]" />}
                    </button>
                  ))}

                  {/* Option to enter custom society */}
                  <button
                    type="button"
                    onClick={() => {
                      setSociety("Other");
                      setIsSocietyDropdownOpen(false);
                    }}
                    className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-[#e87722] hover:bg-orange-50 font-bold border-t border-slate-100 mt-1 cursor-pointer"
                  >
                    + Other (Enter society name manually)
                  </button>
                </div>
              </div>
            )}

            {/* Custom Society Input */}
            {society === "Other" && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customSociety}
                  onChange={(e) => setCustomSociety(e.target.value)}
                  placeholder="e.g. VTP HiLife, Godrej Elements, My Home"
                  className="w-full text-xs px-3 py-1.5 bg-orange-50/50 border border-orange-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#e87722] font-semibold text-slate-800"
                />
              </div>
            )}

            {/* Popular quick chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {POPULAR_SOCIETIES.slice(0, 3).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSociety(s);
                    setCustomSociety("");
                  }}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    activeSociety === s
                      ? "bg-orange-100/80 border-[#e87722] text-[#0f2b3d]"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setStep(1)}
              className="py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleNextStep2}
              className="flex-1 py-2 px-3 bg-[#0f2b3d] hover:bg-[#163e58] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Next: Price & Details</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Expected Selling Price, Carpet Area & Floor (No Furnishing) */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="space-y-3">
          {/* Expected Selling Price */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IndianRupee size={13} className="text-[#e87722]" />
                <span>Expected Selling Price *</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">e.g. ₹85 Lakh or ₹1.2 Cr</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
              <input
                type="text"
                disabled={disabled}
                value={expectedPrice}
                onChange={(e) => {
                  setExpectedPrice(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="e.g. 75,00,000 or 85 Lakh"
                className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] focus:bg-white font-bold text-slate-900 transition-all"
              />
            </div>
            {/* Quick Price Presets */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {["55 Lakh", "75 Lakh", "95 Lakh", "1.2 Cr", "1.5 Cr"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setExpectedPrice(`₹${p}`)}
                  className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-950 rounded-md border border-slate-200 transition-all cursor-pointer"
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>

          {/* Carpet Area & Floor (Side-by-Side) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Carpet Area (sq. ft.)
              </label>
              <input
                type="text"
                disabled={disabled}
                value={carpetArea}
                onChange={(e) => setCarpetArea(e.target.value)}
                placeholder="e.g. 780 sq ft"
                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Floor (Optional)
              </label>
              <input
                type="text"
                disabled={disabled}
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 5th of 14"
                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="flex items-start gap-2 p-2 rounded-xl bg-orange-50/60 border border-orange-100 text-[10.5px] text-slate-600 leading-snug">
            <ShieldCheck size={14} className="text-[#e87722] shrink-0 mt-0.5" />
            <span>
              Resale Expert assigns a dedicated Property Executive for physical inspection, pricing analysis, and verified buyer visits.
            </span>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setStep(2)}
              className="py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-[#e87722] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ShieldCheck size={14} />
              <span>Submit Property for Review</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default REXSellerWizardCard;
