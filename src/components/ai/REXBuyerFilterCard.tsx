import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Home, IndianRupee, Sparkles, X, Check, ChevronDown } from "lucide-react";
import { getMasterDropdownOptions, MasterOption } from "@/lib/useMasterData";

export interface BuyerFilterSelection {
  bhk: string;
  location: string;
  budget: string;
}

interface REXBuyerFilterCardProps {
  initialBhk?: string;
  initialLocation?: string;
  initialBudget?: string;
  disabled?: boolean;
  onSubmit: (filters: BuyerFilterSelection) => void;
}

const DEFAULT_BHK_OPTIONS = [
  "1 BHK",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "3.5 BHK",
  "4 BHK",
  "5 BHK",
  "6 BHK",
  "Any BHK",
];

const POPULAR_LOCALITIES = [
  "Wakad",
  "Punawale",
  "Hinjewadi",
  "Baner",
  "Ravet",
  "Tathawade",
];

const BUDGET_OPTIONS = [
  "Under ₹50L",
  "₹50L - ₹80L",
  "₹80L - ₹1.2 Cr",
  "Above ₹1.2 Cr",
  "Any Budget",
];

export const REXBuyerFilterCard: React.FC<REXBuyerFilterCardProps> = ({
  initialBhk = "2 BHK",
  initialLocation = "Punawale",
  initialBudget = "₹50L - ₹80L",
  disabled = false,
  onSubmit,
}) => {
  const [selectedBhk, setSelectedBhk] = useState<string>(initialBhk);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [customLocation, setCustomLocation] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>(initialBudget);

  const [bhkOptions, setBhkOptions] = useState<string[]>(DEFAULT_BHK_OPTIONS);
  const [allLocalities, setAllLocalities] = useState<string[]>(POPULAR_LOCALITIES);
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

  // Load Unit Types (BHK) strictly from Property Masters and all Localities
  useEffect(() => {
    let isMounted = true;
    const loadMasters = async () => {
      try {
        // Specifically request property master tab for Unit Types
        const propData = await getMasterDropdownOptions(["property", "common"]);
        if (!isMounted || !propData) return;

        // 1. Extract Unit Type from Property Master
        const normalize = (k: string) => k.toLowerCase().replace(/[\s_-]+/g, "");
        const keys = Object.keys(propData);

        // Find specifically 'unit type' or 'unittype'
        const unitTypeKey = keys.find((k) => {
          const nk = normalize(k);
          return nk === "unittype" || nk === "unittypes";
        });

        if (unitTypeKey && Array.isArray(propData[unitTypeKey]) && propData[unitTypeKey].length > 0) {
          const rawBhkList = propData[unitTypeKey]
            .map((item: MasterOption) => (item.value || item.label || "").trim())
            .filter(Boolean);

          if (rawBhkList.length > 0) {
            // Normalize values like "2BHK" -> "2 BHK", "2.5BHK" -> "2.5 BHK"
            const formatted = rawBhkList.map((b) => {
              const m = b.match(/^(\d+(?:\.\d+)?)\s*bhk$/i);
              return m ? `${m[1]} BHK` : b;
            });

            // Sort logically by bedroom number
            const uniqueBhk = Array.from(new Set(formatted)).sort((a, b) => {
              const numA = parseFloat(a.replace(/[^\d.]/g, "")) || 0;
              const numB = parseFloat(b.replace(/[^\d.]/g, "")) || 0;
              return numA - numB;
            });

            if (!uniqueBhk.some((b) => b.toLowerCase().includes("any"))) {
              uniqueBhk.push("Any BHK");
            }

            setBhkOptions(uniqueBhk);

            // Ensure initial BHK is selected or matches first option
            if (initialBhk) {
              const match = uniqueBhk.find((b) => b.toLowerCase() === initialBhk.toLowerCase());
              if (match) setSelectedBhk(match);
            }
          }
        }

        // 2. Fetch all Locality / Location options from Masters for dropdown autocomplete
        const locKey = keys.find((k) => {
          const nk = normalize(k);
          return nk === "location" || nk === "locality" || nk === "localities" || nk === "area";
        });

        if (locKey && Array.isArray(propData[locKey]) && propData[locKey].length > 0) {
          const loadedLocs = propData[locKey]
            .map((item: MasterOption) => (item.value || item.label || "").trim())
            .filter(Boolean);

          if (loadedLocs.length > 0) {
            const uniqueLocs = Array.from(new Set([...POPULAR_LOCALITIES, ...loadedLocs]));
            setAllLocalities(uniqueLocs);
          }
        }
      } catch (err) {
        console.warn("Could not fetch property masters in REXBuyerFilterCard, using defaults:", err);
      }
    };

    loadMasters();
    return () => {
      isMounted = false;
    };
  }, [initialBhk]);

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
    });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-sm p-3.5 space-y-3.5 my-1">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e87722]">
            <Search size={13} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
              Property Preferences
            </h4>
            <p className="text-[11px] text-slate-500">
              Select your exact requirements for tailored matches
            </p>
          </div>
        </div>
      </div>

      {/* 1. BHK Configuration */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Home size={12} className="text-[#0f2b3d]" />
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
                    ? "bg-[#0f2b3d] text-white border-[#0f2b3d] shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
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
              Selected: <strong className="text-[#e87722]">{activeLocality}</strong>
            </span>
          )}
        </div>

        {/* Clean Popular Chips */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_LOCALITIES.map((loc) => {
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

        {/* Compact Searchable Locality Autocomplete Dropdown */}
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
              placeholder="Or search other Pune locality (e.g. Aundh, Kothrud)..."
              className="w-full text-[11px] pl-7 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] focus:bg-white transition-all placeholder:text-slate-400"
            />
            {(searchQuery || customLocation) ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCustomLocation("");
                  setSelectedLocation("Punawale");
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={12} />
              </button>
            ) : (
              <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none" />
            )}
          </div>

          {/* Autocomplete Suggestions Menu */}
          {isDropdownOpen && filteredLocalities.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1 space-y-0.5">
              {filteredLocalities.slice(0, 20).map((loc) => {
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
                        ? "bg-orange-50 text-[#e87722] font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{loc}</span>
                    {isSelected && <Check size={12} className="text-[#e87722]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Budget Range */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <IndianRupee size={12} className="text-emerald-600" />
          <span>Budget Range</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BUDGET_OPTIONS.map((bg) => {
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

      {/* Search Button */}
      <div className="pt-1">
        <button
          type="button"
          disabled={disabled}
          onClick={handleSearch}
          className="w-full py-2 px-1 bg-gradient-to-r from-[#0f2b3d] to-[#1a4a6b] hover:from-[#163e58] hover:to-[#22587f] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <span>Show Matching Properties ({selectedBhk} in {activeLocality})</span>
        </button>
      </div>
    </div>
  );
};

export default REXBuyerFilterCard;
