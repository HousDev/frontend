import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Home, IndianRupee, X, Check, ChevronDown, Sparkles, Building2 } from "lucide-react";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";

export interface TenantFilterSelection {
  bhk: string;
  location: string;
  budget: string;
  furnishing?: string;
}

interface REXTenantFilterCardProps {
  initialBhk?: string;
  initialLocation?: string;
  initialBudget?: string;
  initialFurnishing?: string;
  disabled?: boolean;
  onSubmit: (filters: TenantFilterSelection) => void;
}

const DEFAULT_TENANT_BHK_OPTIONS = [
  "1 RK",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4+ BHK",
  "Any BHK",
];

const POPULAR_RENTAL_LOCALITIES = [
  "Baner",
  "Wakad",
  "Hinjewadi",
  "Kharadi",
  "Ravet",
  "Swargate",
  "Kothrud",
];

const RENT_BUDGET_OPTIONS = [
  "Under ₹15,000",
  "₹15k - ₹25k",
  "₹25k - ₹35k",
  "₹35k - ₹50k",
  "Above ₹50k",
  "Any Budget",
];

const FURNISHING_OPTIONS = [
  "Any",
  "Semi-Furnished",
  "Fully Furnished",
  "Unfurnished",
];

export const REXTenantFilterCard: React.FC<REXTenantFilterCardProps> = ({
  initialBhk = "2 BHK",
  initialLocation = "Baner",
  initialBudget = "₹15k - ₹25k",
  initialFurnishing = "Any",
  disabled = false,
  onSubmit,
}) => {
  const [selectedBhk, setSelectedBhk] = useState<string>(initialBhk);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [customLocation, setCustomLocation] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>(initialBudget);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>(initialFurnishing);

  const [bhkOptions, setBhkOptions] = useState<string[]>(DEFAULT_TENANT_BHK_OPTIONS);
  const [allLocalities, setAllLocalities] = useState<string[]>(POPULAR_RENTAL_LOCALITIES);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch localities & unit types from masters
  useEffect(() => {
    let isMounted = true;
    const loadMasters = async () => {
      try {
        const propData = await getMasterDropdownOptions(["property", "common"]);
        if (!isMounted || !propData) return;

        const normalize = (k: string) => k.toLowerCase().replace(/[\s_-]+/g, "");
        const keys = Object.keys(propData);

        // Unit types from masters if available
        const unitTypeKey = keys.find((k) => {
          const nk = normalize(k);
          return nk === "unittype" || nk === "unittypes";
        });

        if (unitTypeKey && Array.isArray(propData[unitTypeKey]) && propData[unitTypeKey].length > 0) {
          const rawBhkList = propData[unitTypeKey]
            .map((item: MasterOption) => (item.value || item.label || "").trim())
            .filter(Boolean);

          if (rawBhkList.length > 0) {
            const formatted = rawBhkList.map((b) => {
              const m = b.match(/^(\d+(?:\.\d+)?)\s*bhk$/i);
              return m ? `${m[1]} BHK` : b;
            });
            const uniqueBhk = Array.from(new Set(["1 RK", ...formatted])).sort((a, b) => {
              const numA = parseFloat(a.replace(/[^\d.]/g, "")) || 0;
              const numB = parseFloat(b.replace(/[^\d.]/g, "")) || 0;
              return numA - numB;
            });
            if (!uniqueBhk.some((b) => b.toLowerCase().includes("any"))) {
              uniqueBhk.push("Any BHK");
            }
            setBhkOptions(uniqueBhk);
          }
        }

        // Localities from masters
        const locKey = keys.find((k) => {
          const nk = normalize(k);
          return nk === "location" || nk === "locality" || nk === "localities" || nk === "area";
        });

        if (locKey && Array.isArray(propData[locKey]) && propData[locKey].length > 0) {
          const loadedLocs = propData[locKey]
            .map((item: MasterOption) => (item.value || item.label || "").trim())
            .filter(Boolean);

          if (loadedLocs.length > 0) {
            const uniqueLocs = Array.from(new Set([...POPULAR_RENTAL_LOCALITIES, ...loadedLocs]));
            setAllLocalities(uniqueLocs);
          }
        }
      } catch (err) {
        console.warn("Could not fetch property masters in REXTenantFilterCard, using defaults:", err);
      }
    };

    loadMasters();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeLocality = customLocation.trim() || selectedLocation;

  // Filter localities for the dropdown
  const filteredLocalities = allLocalities.filter((loc) =>
    loc.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleSearch = () => {
    onSubmit({
      bhk: selectedBhk,
      location: activeLocality,
      budget: selectedBudget,
      furnishing: selectedFurnishing,
    });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl border border-teal-200/80 shadow-sm p-3.5 space-y-3.5 my-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-teal-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Building2 size={13} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
              Tenant Rental Preferences
            </h4>
            <p className="text-[11px] text-slate-500">
              Filter verified rental homes by locality, budget & configuration
            </p>
          </div>
        </div>
      </div>

      {/* 1. BHK Configuration */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Home size={12} className="text-teal-700" />
          <span>Configuration (BHK)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {bhkOptions.map((bhk) => {
            const isSelected = selectedBhk.toLowerCase() === bhk.toLowerCase();
            return (
              <button
                key={bhk}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedBhk(bhk)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50"
                } disabled:cursor-not-allowed`}
              >
                {bhk}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Preferred Locality */}
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
          {POPULAR_RENTAL_LOCALITIES.map((loc) => {
            const isSelected = activeLocality.toLowerCase() === loc.toLowerCase();
            return (
              <button
                key={loc}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelectedLocation(loc);
                  setCustomLocation("");
                  setSearchQuery("");
                  setIsDropdownOpen(false);
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
        <div className="relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              disabled={disabled}
              value={searchQuery || customLocation}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setCustomLocation(val);
                setIsDropdownOpen(true);
              }}
              placeholder="Or search another Pune locality (e.g. Swargate, Kharadi)..."
              className="w-full text-[11px] pl-7 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {(searchQuery || customLocation) ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCustomLocation("");
                  setSelectedLocation("Baner");
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
          {isDropdownOpen && filteredLocalities.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-0.5">
              {filteredLocalities.slice(0, 25).map((loc) => {
                const isSelected = activeLocality.toLowerCase() === loc.toLowerCase();
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setCustomLocation(loc);
                      setSearchQuery("");
                      setIsDropdownOpen(false);
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

      {/* 3. Monthly Rent Budget */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <IndianRupee size={12} className="text-emerald-600" />
          <span>Monthly Rent Budget</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RENT_BUDGET_OPTIONS.map((bg) => {
            const isSelected = selectedBudget === bg;
            return (
              <button
                key={bg}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedBudget(bg)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                } disabled:cursor-not-allowed`}
              >
                {bg}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Furnishing Type */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Sparkles size={12} className="text-indigo-600" />
          <span>Furnishing Type</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FURNISHING_OPTIONS.map((fn) => {
            const isSelected = selectedFurnishing === fn;
            return (
              <button
                key={fn}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedFurnishing(fn)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-700 text-white border-indigo-700 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                } disabled:cursor-not-allowed`}
              >
                {fn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Button */}
      <div className="pt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={handleSearch}
          className="w-full py-2 px-1 bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Search size={13} />
          <span>Find Rental Homes ({selectedBhk} in {activeLocality})</span>
        </button>
      </div>
    </div>
  );
};

export default REXTenantFilterCard;
