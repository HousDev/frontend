import React, { useState, useMemo } from "react";
import {
  Building,
  MapPin,
  Link2,
  Loader2,
  Home,
  Bed,
  Ruler,
  Car,
  ShieldCheck,
  Wifi,
  Droplets,
  ArrowUp,
  School,
  ShoppingBag,
  Train,
  CalendarDays,
  CheckCircle2,
  Sofa,
  Search,
  X,
  Star,
  ThumbsUp,
  Clock,
  AlertCircle,
  Bath,
  Zap,
  Trees,
  Dumbbell,
  Utensils,
  Users,
  Dog,
  Bike,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Compass,
  Heart,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { getImageUrl } from "@/lib/helpers";
import { MatchedProperty } from "./types";

interface TenantMatchedPropertiesTabProps {
  matchedProperties: MatchedProperty[];
  linkingId: number | string | null;
  onShareWhatsApp: (p: MatchedProperty) => void;
  onLinkProperty: (p: MatchedProperty) => void;
  onSendAllWhatsApp: () => void;
  shortlistedIds: Set<string | number>;
  onToggleShortlist: (id: string | number) => void;
}

interface FilterOptions {
  location: string[];
  propertyType: string[];
  furnishing: string[];
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  amenities: string[];
  nearbyPlaces: string[];
  matchScore: number;
  facing: string[];
}

interface NearbyPlace {
  label: string;
  distance?: string;
  icon?: any;
}

const DEFAULT_FILTERS: FilterOptions = {
  location: [],
  propertyType: [],
  furnishing: [],
  minPrice: 0,
  maxPrice: 0,
  minArea: 0,
  maxArea: 0,
  amenities: [],
  nearbyPlaces: [],
  matchScore: 0,
  facing: [],
};

const AMENITY_ICON_MAP: Record<string, any> = {
  Parking: Car,
  Lift: ArrowUp,
  Elevator: ArrowUp,
  Wifi: Wifi,
  "Wi-Fi": Wifi,
  Internet: Wifi,
  Security: ShieldCheck,
  Guard: ShieldCheck,
  Water: Droplets,
  "Water Supply": Droplets,
  Balcony: Home,
  Garden: Trees,
  Park: Trees,
  Gym: Dumbbell,
  "Power Backup": Clock,
  "24x7 Power": Clock,
  Clubhouse: Users,
  Community: Users,
  "Pet Friendly": Dog,
  Pets: Dog,
  Kitchen: Utensils,
  Bathroom: Bath,
  Geyser: Zap,
  "Cycle Stand": Bike,
  Maintained: ThumbsUp,
  Premium: Star,
  Verified: CheckCircle2,
  Furnished: Sofa,
  Ready: CalendarDays,
};

const NEARBY_ICON_MAP: Record<string, any> = {
  Metro: Train,
  Railway: Train,
  "Railway Station": Train,
  "Bus Stop": Train,
  "D-Mart": ShoppingBag,
  Mall: ShoppingBag,
  Market: ShoppingBag,
  Supermarket: ShoppingBag,
  School: School,
  College: School,
  University: School,
  "IT Park": Building,
  "Business Park": Building,
  Hospital: MapPin,
  Clinic: MapPin,
  Bank: MapPin,
  ATM: MapPin,
  Park: MapPin,
  Temple: MapPin,
  Mosque: MapPin,
  Church: MapPin,
  Movie: ShoppingBag,
  Theatre: ShoppingBag,
};

function safeParseJsonArr<T = any>(val: any, fallback: T[] = []): T[] {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  if (typeof val !== "string") return fallback;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    if (val.includes(",")) {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as unknown as T[];
    }
    return [val] as unknown as T[];
  }
}

function getAmenityIcon(label: string) {
  if (AMENITY_ICON_MAP[label]) return AMENITY_ICON_MAP[label];
  for (const key of Object.keys(AMENITY_ICON_MAP)) {
    if (label.toLowerCase().includes(key.toLowerCase()))
      return AMENITY_ICON_MAP[key];
  }
  return Star;
}

function getNearbyIcon(label: string) {
  if (NEARBY_ICON_MAP[label]) return NEARBY_ICON_MAP[label];
  for (const key of Object.keys(NEARBY_ICON_MAP)) {
    if (label.toLowerCase().includes(key.toLowerCase()))
      return NEARBY_ICON_MAP[key];
  }
  return MapPin;
}

export default function TenantMatchedPropertiesTab({
  matchedProperties,
  linkingId,
  onShareWhatsApp,
  onLinkProperty,
  onSendAllWhatsApp,
  shortlistedIds,
  onToggleShortlist,
}: TenantMatchedPropertiesTabProps) {
  // --- DYNAMIC FILTER VALUES DERIVED FROM ACTUAL PROPERTY DATA ---
  const dynamicFilters = useMemo(() => {
    const props = matchedProperties;

    const locationSet = new Set<string>();
    const propertyTypeSet = new Set<string>();
    const furnishingSet = new Set<string>();
    const facingSet = new Set<string>();
    const amenitySet = new Set<string>();
    const nearbySet = new Map<string, { label: string; distance?: string }>();

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minArea = Infinity;
    let maxArea = -Infinity;

    for (const p of props) {
      const price = Number(p.monthly_rent || p.expected_rent || p.price || 0);
      if (price > 0) {
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      }

      const area = Number(p.carpet_area || p.builtup_area || 0);
      if (area > 0) {
        if (area < minArea) minArea = area;
        if (area > maxArea) maxArea = area;
      }

      if (p.location_name) locationSet.add(String(p.location_name).trim());

      const pt = p.property_type_name || p.property_type || p.unit_type;
      if (pt) propertyTypeSet.add(String(pt).trim());

      if (p.furnishing) furnishingSet.add(String(p.furnishing).trim());

      if (p.facing) facingSet.add(String(p.facing).trim());

      const amenities = safeParseJsonArr<string>(p.amenities, []);
      for (const a of amenities) {
        const cleaned = String(a).trim();
        if (cleaned) amenitySet.add(cleaned);
      }

      const nearbyRaw = safeParseJsonArr<NearbyPlace | string>(
        p.nearby_places,
        [],
      );
      for (const n of nearbyRaw) {
        if (typeof n === "string") {
          const cleaned = n.trim();
          if (cleaned && !nearbySet.has(cleaned)) {
            nearbySet.set(cleaned, { label: cleaned });
          }
        } else if (n && typeof n === "object" && n.label) {
          const cleaned = String(n.label).trim();
          if (cleaned && !nearbySet.has(cleaned)) {
            nearbySet.set(cleaned, { label: cleaned, distance: n.distance });
          }
        }
      }
    }

    // Round defaults for sliders / range inputs
    const DEFAULT_MIN_PRICE =
      minPrice !== Infinity ? Math.floor(minPrice / 1000) * 1000 : 0;
    const DEFAULT_MAX_PRICE =
      maxPrice !== -Infinity
        ? Math.ceil(maxPrice / 1000) * 1000 + 10000
        : 100000;
    const DEFAULT_MIN_AREA =
      minArea !== Infinity ? Math.floor(minArea / 50) * 50 : 0;
    const DEFAULT_MAX_AREA =
      maxArea !== -Infinity ? Math.ceil(maxArea / 50) * 50 + 200 : 2000;

    const BASE_FILTERS: FilterOptions = {
      location: [],
      propertyType: [],
      furnishing: [],
      minPrice: DEFAULT_MIN_PRICE,
      maxPrice: DEFAULT_MAX_PRICE,
      minArea: DEFAULT_MIN_AREA,
      maxArea: DEFAULT_MAX_AREA,
      amenities: [],
      nearbyPlaces: [],
      matchScore: 0,
      facing: [],
    };

    return {
      locations: Array.from(locationSet).sort(),
      propertyTypes: Array.from(propertyTypeSet).sort(),
      furnishings: Array.from(furnishingSet).sort(),
      facings: Array.from(facingSet).sort(),
      amenities: Array.from(amenitySet)
        .sort()
        .map((label) => ({
          label,
          icon: getAmenityIcon(label),
        })),
      nearby: Array.from(nearbySet.values())
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((n) => ({
          label: n.label,
          distance: n.distance || "",
          icon: getNearbyIcon(n.label),
        })),
      defaultMinPrice: DEFAULT_MIN_PRICE,
      defaultMaxPrice: DEFAULT_MAX_PRICE,
      defaultMinArea: DEFAULT_MIN_AREA,
      defaultMaxArea: DEFAULT_MAX_AREA,
      BASE_FILTERS,
    };
  }, [matchedProperties]);

  const [tempFilters, setTempFilters] = useState<FilterOptions>(
    dynamicFilters.BASE_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>(
    dynamicFilters.BASE_FILTERS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | number | null>(
    null,
  );
  const [showFilterNotification, setShowFilterNotification] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [expandedFilterSections, setExpandedFilterSections] = useState<
    Set<string>
  >(new Set(["location", "propertyType", "price", "area", "amenities"]));

  // Details modal state only - shortlist is managed by parent
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<MatchedProperty | null>(null);

  // Sync defaults when data changes (only if filters are empty)
  const defaultsRef = React.useRef(dynamicFilters.BASE_FILTERS);
  React.useEffect(() => {
    const base = dynamicFilters.BASE_FILTERS;
    defaultsRef.current = base;
    setTempFilters((prev) => {
      if (
        prev.minPrice === 0 &&
        prev.maxPrice === 0 &&
        prev.minArea === 0 &&
        prev.maxArea === 0
      ) {
        return base;
      }
      return {
        ...prev,
        minPrice: prev.minPrice === 0 ? base.minPrice : prev.minPrice,
        maxPrice: prev.maxPrice === 0 ? base.maxPrice : prev.maxPrice,
        minArea: prev.minArea === 0 ? base.minArea : prev.minArea,
        maxArea: prev.maxArea === 0 ? base.maxArea : prev.maxArea,
      };
    });
    setAppliedFilters((prev) => {
      if (
        prev.minPrice === 0 &&
        prev.maxPrice === 0 &&
        prev.minArea === 0 &&
        prev.maxArea === 0
      ) {
        return base;
      }
      return prev;
    });
  }, [dynamicFilters.BASE_FILTERS]);

  const toggleFilterSection = (section: string) => {
    setExpandedFilterSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const toggleFilter = (key: keyof FilterOptions, value: string) => {
    setTempFilters((prev) => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const handlePriceChange = (type: "min" | "max", value: number) => {
    setTempFilters((prev) => ({
      ...prev,
      [type === "min" ? "minPrice" : "maxPrice"]: value,
    }));
  };

  const handleAreaChange = (type: "min" | "max", value: number) => {
    setTempFilters((prev) => ({
      ...prev,
      [type === "min" ? "minArea" : "maxArea"]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterSidebarOpen(false);
  };

  const resetFilters = () => {
    setTempFilters(dynamicFilters.BASE_FILTERS);
    setAppliedFilters(dynamicFilters.BASE_FILTERS);
    setSearchQuery("");
  };

  const resetTempFilters = () => {
    setTempFilters(dynamicFilters.BASE_FILTERS);
  };

  const filteredProperties = matchedProperties.filter((p) => {
    const price = Number(p.monthly_rent || p.expected_rent || p.price || 0);
    const area = Number(p.carpet_area || p.builtup_area || 0);
    const location = p.location_name || "";
    const propertyType =
      p.property_type_name || p.property_type || p.unit_type || "";
    const furnishing = p.furnishing || "";
    const facing = p.facing || "";

    if (showShortlistedOnly && !shortlistedIds.has(p.id)) return false;

    if (
      appliedFilters.location.length > 0 &&
      !appliedFilters.location.some((loc) =>
        location.toLowerCase().includes(loc.toLowerCase()),
      )
    ) {
      return false;
    }

    if (
      appliedFilters.propertyType.length > 0 &&
      !appliedFilters.propertyType.some((type) =>
        propertyType.toLowerCase().includes(type.toLowerCase()),
      )
    ) {
      return false;
    }

    if (
      appliedFilters.furnishing.length > 0 &&
      !appliedFilters.furnishing.some((furn) =>
        furnishing.toLowerCase().includes(furn.toLowerCase()),
      )
    ) {
      return false;
    }

    if (
      appliedFilters.facing.length > 0 &&
      !appliedFilters.facing.some((f) =>
        facing.toLowerCase().includes(f.toLowerCase()),
      )
    ) {
      return false;
    }

    if (appliedFilters.minPrice > 0 && price < appliedFilters.minPrice)
      return false;
    if (appliedFilters.maxPrice > 0 && price > appliedFilters.maxPrice)
      return false;
    if (appliedFilters.minArea > 0 && area < appliedFilters.minArea)
      return false;
    if (appliedFilters.maxArea > 0 && area > appliedFilters.maxArea)
      return false;
    if (p.matchScore && p.matchScore < appliedFilters.matchScore) return false;

    if (appliedFilters.amenities.length > 0) {
      const pAmenities = safeParseJsonArr<string>(p.amenities, []).map((a) =>
        a.toLowerCase(),
      );
      if (
        !appliedFilters.amenities.every((a) =>
          pAmenities.includes(a.toLowerCase()),
        )
      ) {
        return false;
      }
    }

    if (appliedFilters.nearbyPlaces.length > 0) {
      const pNearby = safeParseJsonArr<NearbyPlace | string>(
        p.nearby_places,
        [],
      ).map((n) => (typeof n === "string" ? n : n.label || "").toLowerCase());
      if (
        !appliedFilters.nearbyPlaces.every((np) =>
          pNearby.some((pn) => pn.includes(np.toLowerCase())),
        )
      ) {
        return false;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchable =
        `${p.title} ${p.society_name || ""} ${location} ${propertyType} ${furnishing}`.toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    return true;
  });

  const toggleCardExpansion = (id: number | string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const getSelectedCount = (key: keyof FilterOptions) => {
    const value = tempFilters[key];
    if (Array.isArray(value)) return value.length;
    return 0;
  };

  const getActiveFiltersCount = () => {
    let count = 0;

    (Object.keys(appliedFilters) as (keyof FilterOptions)[]).forEach((key) => {
      const value = appliedFilters[key];
      const defaultValue = dynamicFilters.BASE_FILTERS[key];

      if (Array.isArray(value)) {
        count += value.length;
      } else if (
        typeof value === "number" &&
        typeof defaultValue === "number"
      ) {
        if (key === "minPrice" || key === "minArea") {
          if (value !== defaultValue) count += 1;
        } else if (key === "maxPrice" || key === "maxArea") {
          if (value !== defaultValue) count += 1;
        } else {
          if (value !== defaultValue) count += 1;
        }
      } else if (value !== defaultValue) {
        count += 1;
      }
    });

    return count;
  };

  const getTempFiltersCount = () => {
    let count = 0;

    (Object.keys(tempFilters) as (keyof FilterOptions)[]).forEach((key) => {
      const value = tempFilters[key];
      const defaultValue = dynamicFilters.BASE_FILTERS[key];

      if (Array.isArray(value)) {
        count += value.length;
      } else if (value !== defaultValue) {
        count += 1;
      }
    });

    return count;
  };

  const sharedPropertiesCount = filteredProperties.length;

  const hasAnyOptions = (arr: any[]) => arr && arr.length > 0;

  // Derived detail info for whichever property is open in the modal
  const modalData = useMemo(() => {
    if (!selectedProperty) return null;
    const p = selectedProperty;
    const rawPhoto =
      p.photos?.[0] ?? p.images?.[0] ?? p.mediaItems?.[0]?.file_path ?? null;
    const photoUrl =
      typeof rawPhoto === "string"
        ? rawPhoto
        : ((rawPhoto as any)?.url ?? null);
    const img = getImageUrl(photoUrl);
    const price = Number(p.monthly_rent || p.expected_rent || p.price || 0);
    const area = Number(p.carpet_area || p.builtup_area || 0);
    const amenitiesList = safeParseJsonArr<string>(p.amenities, []);
    const nearbyList = safeParseJsonArr<NearbyPlace | string>(
      p.nearby_places,
      [],
    ).map((n) =>
      typeof n === "string"
        ? { label: n }
        : { label: n.label, distance: n.distance },
    );
    const deposit = Number(
      (p as any).security_deposit || (p as any).deposit || price * 2,
    );
    const availableFrom = (p as any).available_from || "Immediate";
    const preferredTenants =
      (p as any).preferred_tenants || "Family / Bachelors";
    return {
      p,
      img,
      price,
      area,
      amenitiesList,
      nearbyList,
      deposit,
      availableFrom,
      preferredTenants,
    };
  }, [selectedProperty]);

  return (
    <div className="space-y-2">
      {/* Filter Notification Banner */}
      {showFilterNotification && (
        <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Info size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-800">
                Quick Search Tip!
              </p>
              <p className="text-[10px] text-orange-600">
                Use the <span className="font-bold">Filter</span> button in the
                search bar to refine your property search
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilterNotification(false)}
            className="flex-shrink-0 text-orange-400 hover:text-orange-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Bar with Filter Button */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="relative p-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search properties by name, location, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border-0 focus:ring-2 focus:ring-orange-400 outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Property preferences are shown on the tenant profile. */}
            {false && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsFilterSidebarOpen(true);
                    setShowTooltip(false);
                  }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium transition-all shadow-sm flex-shrink-0"
                >
                  <Filter size={16} />
                  <span>Filter</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                  {sharedPropertiesCount > 0 && (
                    <div className="flex items-center gap-1 ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">
                      <SiWhatsapp size={10} className="text-white" />
                      <span className="text-[9px] font-bold text-white">
                        {sharedPropertiesCount}
                      </span>
                    </div>
                  )}
                </button>

                {/* Tooltip Popup */}
                {showTooltip && (
                  <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                        <Info size={14} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Quick Search Tip!
                        </p>
                        <p className="text-[10px] text-gray-600 leading-relaxed">
                          Use the{" "}
                          <span className="font-bold text-orange-600">
                            Filter
                          </span>{" "}
                          button to refine your property search instantly
                        </p>
                      </div>
                    </div>
                    <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="px-2 pb-2 flex flex-wrap gap-1 items-center">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={resetFilters}
              className="px-2 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-medium transition-all flex items-center gap-1"
            >
              <X size={10} />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Filter Sidebar - Compact & Premium */}
      {false && isFilterSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsFilterSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-10">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Filter size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Filters</h2>
                    <p className="text-[10px] text-gray-400">
                      Refine your search
                    </p>
                  </div>
                  {getTempFiltersCount() > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                      {getTempFiltersCount()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setTempFilters(appliedFilters);
                    setIsFilterSidebarOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-3 space-y-2">
              {/* Location - Compact */}
              {hasAnyOptions(dynamicFilters.locations) && (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleFilterSection("location")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-orange-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        Location
                      </span>
                      {getSelectedCount("location") > 0 && (
                        <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                          {getSelectedCount("location")}
                        </span>
                      )}
                    </div>
                    {expandedFilterSections.has("location") ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>
                  {expandedFilterSections.has("location") && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                      {dynamicFilters.locations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => toggleFilter("location", loc)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            tempFilters.location.includes(loc)
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Property Type - Compact */}
              {hasAnyOptions(dynamicFilters.propertyTypes) && (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleFilterSection("propertyType")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building size={14} className="text-orange-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        Type
                      </span>
                      {getSelectedCount("propertyType") > 0 && (
                        <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                          {getSelectedCount("propertyType")}
                        </span>
                      )}
                    </div>
                    {expandedFilterSections.has("propertyType") ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>
                  {expandedFilterSections.has("propertyType") && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                      {dynamicFilters.propertyTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleFilter("propertyType", type)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            tempFilters.propertyType.includes(type)
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Furnishing - Compact */}
              {hasAnyOptions(dynamicFilters.furnishings) && (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleFilterSection("furnishing")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sofa size={14} className="text-orange-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        Furnishing
                      </span>
                      {getSelectedCount("furnishing") > 0 && (
                        <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                          {getSelectedCount("furnishing")}
                        </span>
                      )}
                    </div>
                    {expandedFilterSections.has("furnishing") ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>
                  {expandedFilterSections.has("furnishing") && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                      {dynamicFilters.furnishings.map((furn) => (
                        <button
                          key={furn}
                          onClick={() => toggleFilter("furnishing", furn)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            tempFilters.furnishing.includes(furn)
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {furn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Facing - Compact */}
              {hasAnyOptions(dynamicFilters.facings) && (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleFilterSection("facing")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Compass size={14} className="text-orange-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        Facing
                      </span>
                      {getSelectedCount("facing") > 0 && (
                        <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                          {getSelectedCount("facing")}
                        </span>
                      )}
                    </div>
                    {expandedFilterSections.has("facing") ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>
                  {expandedFilterSections.has("facing") && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                      {dynamicFilters.facings.map((facing) => (
                        <button
                          key={facing}
                          onClick={() => toggleFilter("facing", facing)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            tempFilters.facing.includes(facing)
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {facing}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Range - Compact */}
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <button
                  onClick={() => toggleFilterSection("price")}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Rent (₹)
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {dynamicFilters.defaultMinPrice.toLocaleString("en-IN")} -{" "}
                      {dynamicFilters.defaultMaxPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {expandedFilterSections.has("price") ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </button>
                {expandedFilterSections.has("price") && (
                  <div className="px-3 pb-2 flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={tempFilters.minPrice || ""}
                      onChange={(e) =>
                        handlePriceChange("min", Number(e.target.value))
                      }
                      className="flex-1 px-2 py-1 rounded bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={tempFilters.maxPrice || ""}
                      onChange={(e) =>
                        handlePriceChange("max", Number(e.target.value))
                      }
                      className="flex-1 px-2 py-1 rounded bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Area Range - Compact */}
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <button
                  onClick={() => toggleFilterSection("area")}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Area (sqft)
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {dynamicFilters.defaultMinArea} -{" "}
                      {dynamicFilters.defaultMaxArea}
                    </span>
                  </div>
                  {expandedFilterSections.has("area") ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </button>
                {expandedFilterSections.has("area") && (
                  <div className="px-3 pb-2 flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={tempFilters.minArea || ""}
                      onChange={(e) =>
                        handleAreaChange("min", Number(e.target.value))
                      }
                      className="flex-1 px-2 py-1 rounded bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={tempFilters.maxArea || ""}
                      onChange={(e) =>
                        handleAreaChange("max", Number(e.target.value))
                      }
                      className="flex-1 px-2 py-1 rounded bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Amenities - Compact */}
              {hasAnyOptions(dynamicFilters.amenities) && (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleFilterSection("amenities")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-orange-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        Amenities
                      </span>
                      {getSelectedCount("amenities") > 0 && (
                        <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                          {getSelectedCount("amenities")}
                        </span>
                      )}
                    </div>
                    {expandedFilterSections.has("amenities") ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>
                  {expandedFilterSections.has("amenities") && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                      {dynamicFilters.amenities.map((a) => (
                        <button
                          key={a.label}
                          onClick={() => toggleFilter("amenities", a.label)}
                          className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            tempFilters.amenities.includes(a.label)
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          <a.icon size={10} />
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Nearby Places - Compact */}
              {hasAnyOptions(dynamicFilters.nearby) && (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <button
                    onClick={() => toggleFilterSection("nearby")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Train size={14} className="text-orange-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        Nearby
                      </span>
                      {getSelectedCount("nearbyPlaces") > 0 && (
                        <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                          {getSelectedCount("nearbyPlaces")}
                        </span>
                      )}
                    </div>
                    {expandedFilterSections.has("nearby") ? (
                      <ChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>
                  {expandedFilterSections.has("nearby") && (
                    <div className="px-3 pb-2 flex flex-wrap gap-1">
                      {dynamicFilters.nearby.map((n) => (
                        <button
                          key={n.label}
                          onClick={() => toggleFilter("nearbyPlaces", n.label)}
                          className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            tempFilters.nearbyPlaces.includes(n.label)
                              ? "bg-orange-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          <n.icon size={10} />
                          {n.label}
                          {n.distance && (
                            <span className="text-[8px] opacity-60">
                              {n.distance}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons - Compact */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-3 pb-2 flex gap-2">
                <button
                  onClick={resetTempFilters}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  Apply
                  {getTempFiltersCount() > 0 && (
                    <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[9px]">
                      {getTempFiltersCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Results Summary & WhatsApp */}
      {filteredProperties.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-100 rounded-xl px-3 py-2 flex justify-between items-center">
          <span className="text-xs font-medium text-orange-700 flex items-center gap-2">
            <Check size={14} className="inline" />
            {filteredProperties.length} properties match your criteria
            {shortlistedIds.size > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <Heart size={12} className="fill-red-500 text-red-500" />
                {shortlistedIds.size} shortlisted
              </span>
            )}
          </span>
          <button
            onClick={onSendAllWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <SiWhatsapp size={13} />
            Send All
          </button>
        </div>
      )}

      {/* Property Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {filteredProperties.map((p) => {
          const rawPhoto =
            p.photos?.[0] ??
            p.images?.[0] ??
            p.mediaItems?.[0]?.file_path ??
            null;
          const photoUrl =
            typeof rawPhoto === "string"
              ? rawPhoto
              : ((rawPhoto as any)?.url ?? null);
          const img = getImageUrl(photoUrl);

          const price = Number(
            p.monthly_rent || p.expected_rent || p.price || 0,
          );
          const desc = (p.description || "").trim();
          const propertyAmenities = safeParseJsonArr<string>(p.amenities, []);
          const isShortlisted = shortlistedIds.has(p.id);

          return (
            <div
              key={p.id}
              className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isShortlisted
                  ? "border-red-200 ring-1 ring-red-100"
                  : "border-slate-200 hover:border-orange-200"
              }`}
            >
              {/* Image Section */}
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {img ? (
                  <img
                    src={img}
                    alt={p.title || p.society_name || "Property"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Building size={28} />
                    <span className="text-[10px]">No Image</span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Price */}
                <div className="absolute bottom-2 left-2.5">
                  <p className="text-sm font-black text-white drop-shadow">
                    ₹{price.toLocaleString("en-IN")}
                    <span className="text-[8px] font-semibold opacity-80">
                      /mo
                    </span>
                  </p>
                </div>

                {/* Match Score */}
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-orange-500/90 px-2 py-0.5 text-[8px] font-bold text-white shadow-lg backdrop-blur-sm">
                  <Star size={10} className="fill-white" />
                  {p.matchScore}%
                </div>

                {/* Property ID */}
                <div className="absolute top-2 right-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[8px] font-semibold text-white/90 backdrop-blur-sm">
                  #{p.id}
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-2 right-2 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white backdrop-blur-sm shadow">
                  {p.status || "Available"}
                </div>
              </div>

              {/* Content */}
              <div className="p-2.5 space-y-1.5">
                {/* Title */}
                <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">
                  {p.society_name || p.title || `Property #${p.id}`}
                </h4>

                {/* Location */}
                <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                  <MapPin size={10} className="text-orange-400 shrink-0" />
                  <span className="truncate">
                    {[p.location_name, p.city_name]
                      .filter(Boolean)
                      .join(", ") || "Location"}
                  </span>
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {p.property_type_name && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-600">
                      <Bed size={8} />
                      {p.property_type_name}
                    </span>
                  )}
                  {(p.carpet_area || p.builtup_area) && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-semibold text-slate-600">
                      <Ruler size={8} />
                      {p.carpet_area || p.builtup_area} sqft
                    </span>
                  )}
                  {p.furnishing && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-semibold text-amber-700">
                      <Sofa size={8} />
                      {p.furnishing}
                    </span>
                  )}
                  {p.facing && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-semibold text-blue-700">
                      <Compass size={8} />
                      {p.facing}
                    </span>
                  )}
                </div>

                {/* Quick Amenities from actual data */}
                <div className="flex flex-wrap gap-1 pt-0.5 border-t border-slate-100">
                  {propertyAmenities.slice(0, 3).map((amenityLabel) => {
                    const Icon = getAmenityIcon(amenityLabel);
                    return (
                      <span
                        key={amenityLabel}
                        className="inline-flex items-center gap-0.5 rounded bg-slate-50 px-1.5 py-0.5 text-[7px] font-medium text-slate-600"
                      >
                        <Icon size={8} className="text-orange-400" />
                        {amenityLabel}
                      </span>
                    );
                  })}
                  {propertyAmenities.length > 3 && (
                    <span className="inline-flex items-center rounded bg-slate-50 px-1.5 py-0.5 text-[7px] font-medium text-slate-600">
                      +{propertyAmenities.length - 3}
                    </span>
                  )}
                  {propertyAmenities.length === 0 &&
                    [
                      { icon: Car, label: "Parking" },
                      { icon: Wifi, label: "WiFi" },
                      { icon: ShieldCheck, label: "Security" },
                    ].map((a) => (
                      <span
                        key={a.label}
                        className="inline-flex items-center gap-0.5 rounded bg-slate-50 px-1.5 py-0.5 text-[7px] font-medium text-slate-600"
                      >
                        <a.icon size={8} className="text-orange-400" />
                        {a.label}
                      </span>
                    ))}
                </div>

                {/* Description */}
                {desc && (
                  <p className="text-[8px] text-slate-500 leading-relaxed line-clamp-1 italic">
                    {desc}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onShareWhatsApp(p)}
                    className="w-9 flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 py-1.5 text-white transition-all shadow-sm"
                    aria-label="Contact via WhatsApp"
                  >
                    <SiWhatsapp size={12} />
                  </button>

                  <button
                    onClick={() => onToggleShortlist(p.id)}
                    className={`w-9 flex items-center justify-center rounded-lg py-1.5 border transition-all shadow-sm ${
                      isShortlisted
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                    }`}
                    aria-label="Shortlist property"
                  >
                    <Heart
                      size={13}
                      className={isShortlisted ? "fill-white" : ""}
                    />
                  </button>

                  <button
                    onClick={() => setSelectedProperty(p)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 py-1.5 text-[8px] font-bold text-white transition-all shadow-sm"
                  >
                    <Info size={11} />
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <AlertCircle size={28} className="text-orange-400" />
            </div>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No Matches Found
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {getActiveFiltersCount() > 0 || showShortlistedOnly
              ? "Try adjusting your filters to see more properties"
              : "No properties match your search criteria"}
          </p>
          {(getActiveFiltersCount() > 0 ||
            searchQuery ||
            showShortlistedOnly) && (
            <button
              onClick={() => {
                resetFilters();
                setShowShortlistedOnly(false);
              }}
              className="mt-3 px-4 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* ============ COMPACT PROPERTY DETAILS MODAL - LEFT IMAGE + RIGHT CONTENT ============ */}
      {modalData && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200 flex items-center justify-center p-4"
            onClick={() => setSelectedProperty(null)}
          >
            <div
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Left Side - Image */}
                <div className="relative sm:w-2/5 h-64 sm:h-auto bg-slate-100 flex-shrink-0">
                  {modalData.img ? (
                    <img
                      src={modalData.img}
                      alt={modalData.p.title || "Property"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building size={64} className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent" />

                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all"
                  >
                    <X size={16} />
                  </button>

                  <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-sm">
                    <Star size={11} className="fill-white" />
                    {modalData.p.matchScore}% Match
                  </span>

                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-2xl font-black">
                      ₹{modalData.price.toLocaleString("en-IN")}
                      <span className="text-xs font-semibold opacity-80">
                        {" "}
                        /mo
                      </span>
                    </p>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span className="bg-emerald-500/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {modalData.p.status || "Available"}
                    </span>
                  </div>
                </div>

                {/* Right Side - Content */}
                <div className="flex-1 p-4 overflow-y-auto max-h-[calc(90vh)]">
                  {/* Title & Location */}
                  <div className="mb-3">
                    <h3 className="font-bold text-base text-slate-900 leading-tight">
                      {modalData.p.society_name ||
                        modalData.p.title ||
                        `Property #${modalData.p.id}`}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin size={13} className="text-orange-400 shrink-0" />
                      <span>
                        {[modalData.p.location_name, modalData.p.city_name]
                          .filter(Boolean)
                          .join(", ") || "Location"}
                      </span>
                    </div>
                  </div>

                  {/* Key Specs - 4 Column Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-[8px] text-slate-500 uppercase font-semibold">
                        Type
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {modalData.p.property_type_name || "—"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-[8px] text-slate-500 uppercase font-semibold">
                        Area
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {modalData.area || "—"} sq.ft
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-[8px] text-slate-500 uppercase font-semibold">
                        Furnishing
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {modalData.p.furnishing || "—"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                      <div className="text-[8px] text-slate-500 uppercase font-semibold">
                        Facing
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {modalData.p.facing || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Details Row - Deposit, Available, Tenants */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                      <span className="text-[10px] text-slate-500">
                        Deposit
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        ₹{modalData.deposit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                      <span className="text-[10px] text-slate-500">
                        Available
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {modalData.availableFrom}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                      <span className="text-[10px] text-slate-500">
                        Tenants
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {modalData.preferredTenants}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {modalData.p.description && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-slate-800 mb-0.5">
                        Description
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {modalData.p.description}
                      </p>
                    </div>
                  )}

                  {/* Amenities & Nearby - 2 Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {/* Amenities */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 mb-1.5">
                        Amenities
                      </p>
                      {modalData.amenitiesList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {modalData.amenitiesList.slice(0, 6).map((label) => {
                            const Icon = getAmenityIcon(label);
                            return (
                              <span
                                key={label}
                                className="flex items-center gap-1 bg-slate-50 rounded px-2 py-1"
                              >
                                <Icon
                                  size={11}
                                  className="text-orange-500 shrink-0"
                                />
                                <span className="text-[10px] font-medium text-slate-700">
                                  {label}
                                </span>
                              </span>
                            );
                          })}
                          {modalData.amenitiesList.length > 6 && (
                            <span className="text-[10px] text-slate-400 italic px-1 py-1">
                              +{modalData.amenitiesList.length - 6} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No amenities listed.
                        </p>
                      )}
                    </div>

                    {/* Nearby */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 mb-1.5">
                        Nearby
                      </p>
                      {modalData.nearbyList.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {modalData.nearbyList.slice(0, 4).map((n, i) => {
                            const Icon = getNearbyIcon(n.label);
                            return (
                              <span
                                key={i}
                                className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded px-2 py-1"
                              >
                                <Icon
                                  size={11}
                                  className="text-orange-600 shrink-0"
                                />
                                <span className="text-[10px] font-medium text-orange-700">
                                  {n.label}
                                  {n.distance && (
                                    <span className="text-[9px] opacity-60 ml-0.5">
                                      {n.distance}
                                    </span>
                                  )}
                                </span>
                              </span>
                            );
                          })}
                          {modalData.nearbyList.length > 4 && (
                            <span className="text-[10px] text-slate-400 italic px-1 py-1">
                              +{modalData.nearbyList.length - 4} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No nearby landmarks listed.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onShareWhatsApp(modalData.p)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 transition-all flex-shrink-0"
                      aria-label="Contact via WhatsApp"
                    >
                      <SiWhatsapp size={18} />
                    </button>

                    <button
                      onClick={() => onToggleShortlist(modalData.p.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all flex-shrink-0 ${
                        shortlistedIds.has(modalData.p.id)
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                      }`}
                      aria-label="Shortlist property"
                    >
                      <Heart
                        size={18}
                        className={
                          shortlistedIds.has(modalData.p.id) ? "fill-white" : ""
                        }
                      />
                    </button>

                    <button
                      onClick={() => onLinkProperty(modalData.p)}
                      disabled={linkingId === modalData.p.id}
                      className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {linkingId === modalData.p.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Link2 size={16} />
                          Link Property
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
        }
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-in.slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
        .animate-in.slide-in-from-bottom-2 {
          animation: slideInFromBottom 0.2s ease-out forwards;
        }
        .animate-in.fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-in {
          animation: slideInFromTop 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
