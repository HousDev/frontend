import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Bus,
  Train,
  Plane,
  GraduationCap,
  Stethoscope,
  ShoppingBag,
  Utensils,
  Landmark,
  Building,
  TreePine,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Compass,
  Car,
  Clock,
  X,
  Building2,
  Sparkles
} from 'lucide-react';
import { fetchLiveNearbyPlaces, NearbyPlaceItem, classifyPlaceCategory } from '@/lib/nearbyPlacesAPI';

interface PropertyNeighbourhoodMapProps {
  property: any;
}

// Brand Resale Expert Color Constants
const BRAND_ORANGE = '#E6761D';
const BRAND_ORANGE_DARK = '#CC6A1A';
const BRAND_NAVY = '#0b3856';

/**
 * Deterministic 500-meter privacy offset so property exact unit/building is not disclosed
 */
function getFuzzy500mCoordinates(lat: number, lng: number, seedId: string | number = 1): { lat: number; lng: number } {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
    return { lat: NaN, lng: NaN };
  }
  const numId = typeof seedId === 'number' ? seedId : (String(seedId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) || 42);
  const angle = ((numId % 360) * Math.PI) / 180;
  // ~500 meters is ~0.0045 degrees latitude
  const dLat = (500 / 111320) * Math.cos(angle);
  const dLng = (500 / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
  return {
    lat: Number((lat + dLat).toFixed(6)),
    lng: Number((lng + dLng).toFixed(6))
  };
}

/**
 * Estimate travel time in minutes based on distance in km
 */
function estimateTravelMinutes(distKm: number, mode: 'transit' | 'walking' | 'driving' = 'transit'): number {
  if (!Number.isFinite(distKm) || distKm <= 0) return 4;
  if (distKm <= 1.0) {
    return Math.max(2, Math.round(distKm * 12));
  }
  return Math.max(3, Math.round(distKm * 5.2) + 2);
}

/**
 * Quick client-side geocoding fallback when property lacks DB coordinates
 */
async function geocodeLocality(locName: string): Promise<{ lat: number; lng: number } | null> {
  if (!locName || locName.trim().length < 2) return null;
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(locName)}&limit=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const coords = data?.features?.[0]?.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
          return { lat, lng };
        }
      }
    }
  } catch (e) { }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locName)}&limit=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { lat, lng };
        }
      }
    }
  } catch (e) { }

  return null;
}

export const PropertyNeighbourhoodMap: React.FC<PropertyNeighbourhoodMapProps> = ({ property }) => {
  const [activeTab, setActiveTab] = useState<'transit' | 'essentials' | 'utility'>('transit');
  const [expandedSubGroups, setExpandedSubGroups] = useState<Record<string, boolean>>({
    bus_stations: true,
    airport: false,
    train_stations: false,
    schools: true,
    hospitals: false,
    shopping: true,
    dining: false,
    parks: true,
  });

  const [selectedPlace, setSelectedPlace] = useState<NearbyPlaceItem | null>(null);
  const [customDestination, setCustomDestination] = useState<string>('');
  const [activeDirectionQuery, setActiveDirectionQuery] = useState<string>('');
  const [livePlaces, setLivePlaces] = useState<NearbyPlaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Raw DB coordinates
  const dbLat = Number(
    property?.lat_display ??
    property?.display_lat ??
    property?.lat ??
    property?.latitude ??
    property?.society?.latitude ??
    property?.society?.lat ??
    property?.raw?.lat ??
    NaN
  );

  const dbLng = Number(
    property?.lng_display ??
    property?.display_lng ??
    property?.lng ??
    property?.longitude ??
    property?.society?.longitude ??
    property?.society?.lng ??
    property?.raw?.lng ??
    NaN
  );

  const hasDbCoords = Number.isFinite(dbLat) && Number.isFinite(dbLng) && (dbLat !== 0 || dbLng !== 0);

  // Display location strings
  const localityName = useMemo(() => {
    return property?.locality || property?.location_name || property?.location || '';
  }, [property]);

  const cityName = useMemo(() => {
    return property?.city_name || property?.city || '';
  }, [property]);

  const societyName = useMemo(() => {
    return property?.society_name || property?.society?.name || property?.society || '';
  }, [property]);

  const locationLabel = useMemo(() => {
    const parts = [societyName, localityName, cityName].filter(Boolean);
    const cleaned = parts.join(', ').trim();
    return cleaned && cleaned !== '-' ? cleaned : '';
  }, [societyName, localityName, cityName]);

  const isLocationSpecified = Boolean(hasDbCoords || (locationLabel && locationLabel.toLowerCase() !== 'not specified' && locationLabel.toLowerCase() !== 'any location'));

  // If coordinates missing in DB, geocode locality/city on the fly
  useEffect(() => {
    if (hasDbCoords) {
      setResolvedCoords({ lat: dbLat, lng: dbLng });
      return;
    }

    if (!isLocationSpecified) return;

    let isMounted = true;
    const resolveLocation = async () => {
      const queries = [
        [societyName, localityName, cityName].filter(Boolean).join(', '),
        [localityName, cityName].filter(Boolean).join(', '),
        cityName
      ].filter(Boolean);

      for (const q of queries) {
        const coords = await geocodeLocality(q);
        if (coords && isMounted) {
          setResolvedCoords(coords);
          return;
        }
      }
    };

    resolveLocation();
    return () => { isMounted = false; };
  }, [hasDbCoords, dbLat, dbLng, societyName, localityName, cityName, isLocationSpecified]);

  // Apply deterministic 500m privacy offset
  const fuzzyCoords = useMemo(() => {
    const baseLat = resolvedCoords ? resolvedCoords.lat : dbLat;
    const baseLng = resolvedCoords ? resolvedCoords.lng : dbLng;
    if (!Number.isFinite(baseLat) || !Number.isFinite(baseLng) || (baseLat === 0 && baseLng === 0)) {
      return { lat: NaN, lng: NaN };
    }
    return getFuzzy500mCoordinates(baseLat, baseLng, property?.id || 1);
  }, [resolvedCoords, dbLat, dbLng, property?.id]);

  const hasFuzzyCoords = Number.isFinite(fuzzyCoords.lat) && Number.isFinite(fuzzyCoords.lng);

  // Load nearby landmarks dynamically
  useEffect(() => {
    let isMounted = true;
    const loadPlaces = async () => {
      if (!isLocationSpecified) return;
      setLoading(true);
      try {
        const searchLoc = [localityName, cityName].filter(Boolean).join(', ');
        const places = await fetchLiveNearbyPlaces(
          hasFuzzyCoords ? fuzzyCoords.lat : 0,
          hasFuzzyCoords ? fuzzyCoords.lng : 0,
          searchLoc,
          4000,
          property?.id
        );
        if (isMounted) {
          setLivePlaces(places || []);
        }
      } catch (err) {
        console.warn('Failed to load nearby places for neighbourhood:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPlaces();
    return () => { isMounted = false; };
  }, [fuzzyCoords.lat, fuzzyCoords.lng, localityName, cityName, isLocationSpecified, property?.id, hasFuzzyCoords]);

  // Merge DB manual places with dynamic live places
  const allPlaces = useMemo(() => {
    const dbPlaces: NearbyPlaceItem[] = Array.isArray(property?.nearby_places)
      ? (property.nearby_places
        .map((p: any) => {
          const name = p.name || p.title || p.label || 'Landmark';
          const type = p.type || p.category || 'Landmark';
          const distNum = parseFloat(String(p.distance || '1.0'));
          if (!Number.isFinite(distNum) || distNum > 20.0) return null;
          const catResult = classifyPlaceCategory(type, '', '', '', '', name);
          return {
            name,
            category: (p.category && ['education', 'healthcare', 'transit', 'shopping', 'dining'].includes(p.category) ? p.category : catResult.category) as any,
            type: catResult.typeName || type,
            distance: distNum.toFixed(1),
            unit: p.unit || 'km',
            lat: p.lat,
            lng: p.lng
          };
        })
        .filter(Boolean) as NearbyPlaceItem[])
      : [];

    const map = new Map<string, NearbyPlaceItem>();
    dbPlaces.forEach(p => map.set(p.name.toLowerCase().trim(), p));
    livePlaces.forEach(p => {
      const k = p.name.toLowerCase().trim();
      if (!map.has(k)) map.set(k, p);
    });

    return Array.from(map.values()).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }, [property?.nearby_places, livePlaces]);

  // Group places for tabs and accordions
  const transitPlaces = useMemo(() => {
    const bus = allPlaces.filter(p => p.category === 'transit' && (p.type.toLowerCase().includes('bus') || p.name.toLowerCase().includes('bus') || p.type.toLowerCase().includes('stop') || p.type.toLowerCase().includes('chowk') || p.name.toLowerCase().includes('chowk') || (!p.type.toLowerCase().includes('airport') && !p.type.toLowerCase().includes('train') && !p.type.toLowerCase().includes('metro'))));
    const airport = allPlaces.filter(p => p.category === 'transit' && (p.type.toLowerCase().includes('airport') || p.name.toLowerCase().includes('airport') || p.name.toLowerCase().includes('aerodrome')));
    const train = allPlaces.filter(p => p.category === 'transit' && (p.type.toLowerCase().includes('train') || p.type.toLowerCase().includes('metro') || p.type.toLowerCase().includes('railway') || p.name.toLowerCase().includes('station') || p.name.toLowerCase().includes('metro')));
    return { bus, airport, train };
  }, [allPlaces]);

  const essentialsPlaces = useMemo(() => {
    const schools = allPlaces.filter(p => p.category === 'education');
    const hospitals = allPlaces.filter(p => p.category === 'healthcare');
    return { schools, hospitals };
  }, [allPlaces]);

  const utilityPlaces = useMemo(() => {
    const shopping = allPlaces.filter(p => p.category === 'shopping');
    const parks = allPlaces.filter(p => p.type?.toLowerCase().includes('park') || p.type?.toLowerCase().includes('garden') || p.name?.toLowerCase().includes('park') || p.name?.toLowerCase().includes('garden'));
    const dining = allPlaces.filter(p => p.category === 'dining' && !p.type?.toLowerCase().includes('park') && !p.type?.toLowerCase().includes('garden') && !p.name?.toLowerCase().includes('park') && !p.name?.toLowerCase().includes('garden'));
    return { shopping, dining, parks };
  }, [allPlaces]);

  const toggleSubGroup = (key: string) => {
    setExpandedSubGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectPlace = (place: NearbyPlaceItem) => {
    setSelectedPlace(place);
    setActiveDirectionQuery(place.name);
    setCustomDestination(place.name);
  };

  const handleGetDirections = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customDestination.trim()) return;
    setActiveDirectionQuery(customDestination.trim());
    const matched = allPlaces.find(p => p.name.toLowerCase().includes(customDestination.trim().toLowerCase()));
    if (matched) {
      setSelectedPlace(matched);
    } else {
      setSelectedPlace({
        name: customDestination.trim(),
        category: 'transit',
        type: 'Destination',
        distance: '2.0',
        unit: 'km'
      });
    }
  };

  const handleClearSelected = () => {
    setSelectedPlace(null);
    setActiveDirectionQuery('');
    setCustomDestination('');
  };

  // Build embedded Map URL with local neighborhood context
  const mapEmbedUrl = useMemo(() => {
    const originCoords = hasFuzzyCoords
      ? `${fuzzyCoords.lat},${fuzzyCoords.lng}`
      : encodeURIComponent([localityName, cityName].filter(Boolean).join(', ') || 'Maharashtra');

    if (activeDirectionQuery) {
      // If place has exact lat/lng, use coordinates for pinpoint routing
      if (selectedPlace?.lat && selectedPlace?.lng) {
        return `https://maps.google.com/maps?saddr=${originCoords}&daddr=${selectedPlace.lat},${selectedPlace.lng}&output=embed`;
      }
      // Otherwise append locality and city to ensure routing to the closest local landmark
      const localContext = [localityName, cityName].filter(Boolean).join(', ');
      const destinationStr = activeDirectionQuery.toLowerCase().includes(localityName.toLowerCase())
        ? activeDirectionQuery
        : `${activeDirectionQuery}, ${localContext}`;
      return `https://maps.google.com/maps?saddr=${originCoords}&daddr=${encodeURIComponent(destinationStr)}&output=embed`;
    }

    if (hasFuzzyCoords) {
      return `https://maps.google.com/maps?q=${fuzzyCoords.lat},${fuzzyCoords.lng}&z=15&output=embed`;
    }

    if (locationLabel) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(locationLabel)}&z=15&output=embed`;
    }

    return '';
  }, [hasFuzzyCoords, fuzzyCoords.lat, fuzzyCoords.lng, localityName, cityName, locationLabel, activeDirectionQuery, selectedPlace]);

  if (!isLocationSpecified) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm my-6">
        <div className="border-b-2 border-[#E6761D] pb-2 mb-4 w-fit">
          <h2 className="text-xl font-bold text-[#0b3856] tracking-tight">Location &amp; Surroundings</h2>
        </div>
        <div className="py-12 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
          <MapPin size={36} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Location not specified</p>
          <p className="text-xs text-slate-400 mt-1">Neighbourhood landmarks are unavailable for this listing.</p>
        </div>
      </div>
    );
  }

  const propertyDisplayName = property?.title || property?.property_type || [property?.unitType, property?.subtype].filter(Boolean).join(' ') || 'Property';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm my-6 font-sans">
      {/* ── Redesigned Header: Brand Title & Locality Badge ── */}
      <div className="border-b border-gray-100 pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="inline-block relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#E6761D] shrink-0">
                <Compass size={18} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-[#0b3856] tracking-tight">
                  Explore Location &amp; Surroundings
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate max-w-sm sm:max-w-xl">
                  {propertyDisplayName} in <span className="text-[#E6761D] font-semibold">{[localityName, cityName].filter(Boolean).join(', ') || 'Vicinity'}</span>
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 left-0 w-24 h-[3px] bg-[#E6761D] rounded-full" />
          </div>


        </div>
      </div>

      {/* ── Top Bar: Location Label + Search Form ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-5 pt-1">
        {/* Your Location Tag */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-800 font-medium bg-orange-50/60 border border-orange-100/90 px-3 py-1.5 rounded-xl max-w-full overflow-hidden">
          <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-xs">
            <MapPin size={13} />
          </div>
          <span className="text-slate-500 font-normal shrink-0">Location:</span>
          <span className="font-bold text-[#0b3856] truncate" title={locationLabel}>
            {locationLabel || 'Property Neighbourhood'}
          </span>
        </div>

        {/* Search Directions Input */}
        <form onSubmit={handleGetDirections} className="flex items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <input
              type="text"
              placeholder="Search landmark or transit..."
              value={customDestination}
              onChange={(e) => setCustomDestination(e.target.value)}
              className="w-full h-9 pl-3.5 pr-8 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] placeholder:text-gray-400 transition-all"
            />
            {customDestination && (
              <button
                type="button"
                onClick={handleClearSelected}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-9 px-3.5 sm:px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] hover:shadow-md transition-all whitespace-nowrap active:scale-95 shrink-0"
          >
            Get Directions
          </button>
        </form>
      </div>

      {/* ── Main Two-Column Layout (Map Left, Landmark Categories Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* ── LEFT: Interactive Map with Direction Overlay Card ── */}
        <div className="lg:col-span-7 xl:col-span-8 relative rounded-xl overflow-hidden border border-gray-200 bg-slate-50 min-h-[400px] sm:min-h-[480px] flex flex-col shadow-inner">
          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              className="w-full h-full flex-1 min-h-[400px] sm:min-h-[480px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Neighbourhood Map"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400 gap-2">
              <MapPin size={32} className="text-gray-300" />
              <span className="text-xs font-medium">Map view unavailable</span>
            </div>
          )}

          {/* Direction Popup Card with Resale Expert Brand Styling */}
          {selectedPlace && (
            <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xs z-20 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-orange-200 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-[#0b3856] font-bold text-xs">
                  <div className="p-1 rounded-md bg-orange-100 text-[#E6761D]">
                    <Navigation size={12} />
                  </div>
                  <span className="truncate">{selectedPlace.name}</span>
                </div>
                <button
                  onClick={handleClearSelected}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100"
                  title="Close direction"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1.5 border-t border-gray-100 text-gray-700">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {selectedPlace.distance} km
                </span>
                <span className="text-xs font-extrabold text-[#0b3856] tracking-wide">
                  ~{estimateTravelMinutes(parseFloat(selectedPlace.distance))} MINS
                </span>
                {hasFuzzyCoords && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${fuzzyCoords.lat},${fuzzyCoords.lng}&destination=${encodeURIComponent(selectedPlace.name + (property?.city ? `, ${property.city}` : ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[11px] font-bold text-[#E6761D] hover:underline inline-flex items-center gap-0.5"
                  >
                    Maps <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Google Maps External Link Badge */}
          {hasFuzzyCoords && (
            <div className="absolute bottom-2 left-2 z-10">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${fuzzyCoords.lat},${fuzzyCoords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-xs text-[11px] font-bold text-[#0b3856] hover:text-[#E6761D] rounded-lg shadow-sm border border-gray-200 transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>

        {/* ── RIGHT: Tabs & Accordions (Transit, Essentials, Utility) ── */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
          {/* Top Category Tabs (Themed in Resale Expert Palette) */}
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-600">
            {[
              { id: 'transit' as const, label: 'Transit' },
              { id: 'essentials' as const, label: 'Essentials' },
              { id: 'utility' as const, label: 'Utility' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-center transition-all relative font-bold ${isActive
                      ? 'text-[#E6761D] bg-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
                    }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#E6761D]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Places Accordion List (Scrollable) */}
          <div className="flex-1 overflow-y-auto max-h-[440px] p-2.5 divide-y divide-gray-100 scrollbar-thin">
            {loading && allPlaces.length === 0 ? (
              <div className="py-14 text-center text-gray-400">
                <Compass size={26} className="animate-spin text-[#E6761D] mx-auto mb-2" />
                <span className="text-xs font-semibold text-gray-600">Discovering surrounding connectivity &amp; landmarks...</span>
              </div>
            ) : (
              <>
                {/* ── TRANSIT TAB CONTENT ── */}
                {activeTab === 'transit' && (
                  <div className="space-y-2 pt-1">
                    {/* Bus Stations Group */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => toggleSubGroup('bus_stations')}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[#0b3856]">
                          <Bus size={15} className="text-[#E6761D]" />
                          <span>Bus Stations &amp; Stops</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({transitPlaces.bus.length})</span>
                        </div>
                        {expandedSubGroups['bus_stations'] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>

                      {expandedSubGroups['bus_stations'] && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-white">
                          {transitPlaces.bus.length > 0 ? (
                            transitPlaces.bus.map((place, idx) => {
                              const isSelected = selectedPlace?.name === place.name;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(place)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${isSelected
                                      ? 'bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs'
                                      : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                >
                                  <span className="truncate pr-2 font-medium" title={place.name}>{place.name}</span>
                                  <span className="text-[11px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
                                    {place.distance} km | {estimateTravelMinutes(parseFloat(place.distance))} mins
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[11px] text-gray-400 italic py-2 px-3">Local bus transit stops available in neighbourhood</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Airport Group */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => toggleSubGroup('airport')}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[#0b3856]">
                          <Plane size={15} className="text-[#E6761D]" />
                          <span>Airport</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({transitPlaces.airport.length || 1})</span>
                        </div>
                        {expandedSubGroups['airport'] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>

                      {expandedSubGroups['airport'] && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-white">
                          {transitPlaces.airport.length > 0 ? (
                            transitPlaces.airport.map((place, idx) => {
                              const isSelected = selectedPlace?.name === place.name;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(place)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${isSelected
                                      ? 'bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs'
                                      : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                >
                                  <span className="truncate pr-2 font-medium" title={place.name}>{place.name}</span>
                                  <span className="text-[11px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
                                    {place.distance} km | {estimateTravelMinutes(parseFloat(place.distance), 'driving')} mins
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-700">
                              <span>Pune International Airport (PNQ)</span>
                              <span className="text-[11px] text-gray-500">~22 km | 45 mins</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Train Stations Group */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => toggleSubGroup('train_stations')}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[#0b3856]">
                          <Train size={15} className="text-[#E6761D]" />
                          <span>Train Stations &amp; Metro</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({transitPlaces.train.length})</span>
                        </div>
                        {expandedSubGroups['train_stations'] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>

                      {expandedSubGroups['train_stations'] && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-white">
                          {transitPlaces.train.length > 0 ? (
                            transitPlaces.train.map((place, idx) => {
                              const isSelected = selectedPlace?.name === place.name;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(place)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${isSelected
                                      ? 'bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs'
                                      : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                >
                                  <span className="truncate pr-2 font-medium" title={place.name}>{place.name}</span>
                                  <span className="text-[11px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
                                    {place.distance} km | {estimateTravelMinutes(parseFloat(place.distance))} mins
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[11px] text-gray-400 italic py-2 px-3">Railway &amp; Metro lines reachable in short commute</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── ESSENTIALS TAB CONTENT ── */}
                {activeTab === 'essentials' && (
                  <div className="space-y-2 pt-1">
                    {/* Schools & Colleges */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => toggleSubGroup('schools')}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[#0b3856]">
                          <GraduationCap size={15} className="text-[#E6761D]" />
                          <span>Schools &amp; Colleges</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({essentialsPlaces.schools.length})</span>
                        </div>
                        {expandedSubGroups['schools'] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>

                      {expandedSubGroups['schools'] && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-white">
                          {essentialsPlaces.schools.length > 0 ? (
                            essentialsPlaces.schools.map((place, idx) => {
                              const isSelected = selectedPlace?.name === place.name;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(place)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${isSelected
                                      ? 'bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs'
                                      : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                >
                                  <span className="truncate pr-2 font-medium" title={place.name}>{place.name}</span>
                                  <span className="text-[11px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
                                    {place.distance} km | {estimateTravelMinutes(parseFloat(place.distance))} mins
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[11px] text-gray-400 italic py-2 px-3">Top schools &amp; educational hubs nearby</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hospitals & Healthcare */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => toggleSubGroup('hospitals')}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[#0b3856]">
                          <Stethoscope size={15} className="text-[#E6761D]" />
                          <span>Hospitals &amp; Healthcare</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({essentialsPlaces.hospitals.length})</span>
                        </div>
                        {expandedSubGroups['hospitals'] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>

                      {expandedSubGroups['hospitals'] && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-white">
                          {essentialsPlaces.hospitals.length > 0 ? (
                            essentialsPlaces.hospitals.map((place, idx) => {
                              const isSelected = selectedPlace?.name === place.name;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(place)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${isSelected
                                      ? 'bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs'
                                      : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                >
                                  <span className="truncate pr-2 font-medium" title={place.name}>{place.name}</span>
                                  <span className="text-[11px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
                                    {place.distance} km | {estimateTravelMinutes(parseFloat(place.distance))} mins
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[11px] text-gray-400 italic py-2 px-3">Multi-specialty hospitals &amp; clinics in vicinity</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── UTILITY TAB CONTENT ── */}
                {activeTab === 'utility' && (
                  <div className="space-y-2 pt-1">
                    {/* Shopping Malls & Supermarkets */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => toggleSubGroup('shopping')}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[#0b3856]">
                          <ShoppingBag size={15} className="text-[#E6761D]" />
                          <span>Shopping Malls &amp; Supermarkets</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({utilityPlaces.shopping.length})</span>
                        </div>
                        {expandedSubGroups['shopping'] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>

                      {expandedSubGroups['shopping'] && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-white">
                          {utilityPlaces.shopping.length > 0 ? (
                            utilityPlaces.shopping.map((place, idx) => {
                              const isSelected = selectedPlace?.name === place.name;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(place)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${isSelected
                                      ? 'bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs'
                                      : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                >
                                  <span className="truncate pr-2 font-medium" title={place.name}>{place.name}</span>
                                  <span className="text-[11px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
                                    {place.distance} km | {estimateTravelMinutes(parseFloat(place.distance))} mins
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[11px] text-gray-400 italic py-2 px-3">Marts, groceries &amp; shopping complexes nearby</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Restaurants & Dining */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
                      <button
                        onClick={() => toggleSubGroup('dining')}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-[#0b3856]">
                          <Utensils size={15} className="text-[#E6761D]" />
                          <span>Restaurants &amp; Dining</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({utilityPlaces.dining.length})</span>
                        </div>
                        {expandedSubGroups['dining'] ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>

                      {expandedSubGroups['dining'] && (
                        <div className="px-2 pb-2 pt-1 space-y-1 bg-white">
                          {utilityPlaces.dining.length > 0 ? (
                            utilityPlaces.dining.map((place, idx) => {
                              const isSelected = selectedPlace?.name === place.name;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectPlace(place)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${isSelected
                                      ? 'bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs'
                                      : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                >
                                  <span className="truncate pr-2 font-medium" title={place.name}>{place.name}</span>
                                  <span className="text-[11px] text-gray-500 whitespace-nowrap shrink-0 font-medium">
                                    {place.distance} km | {estimateTravelMinutes(parseFloat(place.distance))} mins
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[11px] text-gray-400 italic py-2 px-3">Cafés, food joints &amp; fine dining within 2-3 km</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyNeighbourhoodMap;
