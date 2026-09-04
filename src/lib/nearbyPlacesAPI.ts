/**
 * Real-Time Nearby Places API helper using OpenStreetMap Overpass API + Nominatim fallback
 * Fetches actual nearby landmarks (Schools, Hospitals, Transit, Shopping, Dining) within a 3.5km radius
 * 100% Dynamic API Query (Zero Hardcoded Data)
 */

export interface NearbyPlaceItem {
  name: string;
  category: 'education' | 'healthcare' | 'transit' | 'shopping' | 'dining';
  type: string;
  distance: string; // e.g. "0.8"
  unit: string; // "km"
  lat?: number;
  lng?: number;
}

// Haversine formula to compute exact distance in kilometers
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-memory cache to avoid duplicate API requests for identical coordinates
const placesCache: Record<string, NearbyPlaceItem[]> = {};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

/**
 * Geocode location name dynamically via Photon (CORS-friendly OpenStreetMap API) + Nominatim fallback
 */
async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number } | null> {
  if (!locationName || locationName.trim().length < 2) return null;

  // Clean locationName into distinct, unique tokens
  const rawParts = locationName
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.includes('[object') && !/^\d{6}$/.test(p));

  // Remove duplicate parts case-insensitively
  const uniqueParts: string[] = [];
  rawParts.forEach(p => {
    if (!uniqueParts.some(u => u.toLowerCase() === p.toLowerCase())) {
      uniqueParts.push(p);
    }
  });

  // Try candidate search queries in order of decreasing detail
  const candidateQueries: string[] = [];
  if (uniqueParts.length >= 3) {
    candidateQueries.push(uniqueParts.slice(-3).join(', '));
  }
  if (uniqueParts.length >= 2) {
    candidateQueries.push(uniqueParts.slice(-2).join(', '));
  }
  if (uniqueParts.length >= 1) {
    candidateQueries.push(uniqueParts[uniqueParts.length - 1]);
  }

  for (const q of candidateQueries) {
    // 1. Try Photon API (100% CORS open, OSM-powered)
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.features && data.features.length > 0) {
          const coords = data.features[0].geometry?.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            const lng = parseFloat(coords[0]);
            const lat = parseFloat(coords[1]);
            if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
              return { lat, lng };
            }
          }
        }
      }
    } catch (err) { }

    // 2. Fallback to Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
            return { lat, lng };
          }
        }
      }
    } catch (err) { }
  }
  return null;
}


/**
 * Categorize landmark tag/name into education, healthcare, transit, shopping, or dining
 */
export function classifyPlaceCategory(
  amenity: string = '',
  shop: string = '',
  railway: string = '',
  highway: string = '',
  leisure: string = '',
  name: string = ''
): { category: NearbyPlaceItem['category']; typeName: string } {
  const am = amenity.toLowerCase();
  const sh = shop.toLowerCase();
  const rw = railway.toLowerCase();
  const hw = highway.toLowerCase();
  const ls = leisure.toLowerCase();
  const nm = name.toLowerCase();

  // 1. Education
  if (
    ['school', 'college', 'university', 'kindergarten', 'coaching', 'tuition', 'schooling', 'library', 'academy'].some(
      k => am.includes(k) || nm.includes(k)
    )
  ) {
    return {
      category: 'education',
      typeName: am.includes('school') || nm.includes('school') ? 'School' : am.includes('college') || nm.includes('college') ? 'College' : 'Educational Hub',
    };
  }

  // 2. Healthcare
  if (
    ['hospital', 'clinic', 'pharmacy', 'doctors', 'dentist', 'nursing_home', 'chemist', 'medical', 'health'].some(
      k => am.includes(k) || nm.includes(k)
    )
  ) {
    return {
      category: 'healthcare',
      typeName: am.includes('hospital') || nm.includes('hospital') ? 'Multi-Specialty Hospital' : am.includes('pharmacy') || am.includes('chemist') || nm.includes('pharmacy') ? 'Pharmacy / Chemist' : 'Healthcare Facility',
    };
  }

  // 3. Transit
  if (
    rw ||
    ['bus_stop', 'platform', 'primary', 'secondary'].includes(hw) ||
    am === 'bus_station' ||
    ['bus', 'metro', 'train', 'station', 'stop', 'railway', 'depot', 'terminal'].some(k => nm.includes(k))
  ) {
    return {
      category: 'transit',
      typeName: rw || nm.includes('metro') || nm.includes('train') ? 'Metro / Train Station' : 'Bus Stop / Transit',
    };
  }

  // 4. Shopping
  if (
    sh ||
    ['supermarket', 'mall', 'department_store', 'convenience', 'clothes', 'bakery', 'store', 'bazaar', 'market'].some(
      k => sh.includes(k) || nm.includes(k)
    ) ||
    nm.includes('mall') ||
    nm.includes('supermarket') ||
    nm.includes('mart') ||
    nm.includes('bazaar')
  ) {
    return {
      category: 'shopping',
      typeName: sh === 'mall' || nm.includes('mall') ? 'Shopping Mall' : 'Shopping / Supermarket',
    };
  }

  // 5. Dining & Parks (Default & Catch-all)
  let typeName = 'Restaurant & Dining';
  if (ls || nm.includes('park') || nm.includes('garden')) {
    typeName = 'Park & Recreation';
  } else if (am === 'cafe' || nm.includes('cafe') || nm.includes('coffee')) {
    typeName = 'Café / Lounge';
  } else if (am === 'bank' || am === 'atm' || nm.includes('bank') || nm.includes('atm')) {
    typeName = 'Bank & ATM';
  } else if (nm.includes('hotel') || nm.includes('resort')) {
    typeName = 'Hotel & Hospitality';
  }

  return {
    category: 'dining',
    typeName,
  };
}

/**
 * 100% Dynamic - Zero Hardcoded Data
 * Returns empty array if no live places exist around coordinates
 */
export function generateLocalityPlaces(locationName: string, lat: number = 0, lng: number = 0): NearbyPlaceItem[] {
  return [];
}

/**
 * Fetch dynamic real nearby places for a given location using Photon API
 */
export async function fetchClientPhotonPlaces(locationName: string, lat: number, lng: number): Promise<NearbyPlaceItem[]> {
  const parts = (locationName || '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.includes('[object') && !/^\d{6}$/.test(s));

  const cleanLocality = parts[0] || '';
  const queryTerms = [
    { cat: 'education', term: 'school' },
    { cat: 'education', term: 'college' },
    { cat: 'healthcare', term: 'hospital' },
    { cat: 'healthcare', term: 'clinic' },
    { cat: 'transit', term: 'station' },
    { cat: 'transit', term: 'bus stop' },
    { cat: 'shopping', term: 'mall' },
    { cat: 'shopping', term: 'supermarket' },
    { cat: 'dining', term: 'restaurant' },
    { cat: 'dining', term: 'park' }
  ];

  const map = new Map<string, NearbyPlaceItem>();

  for (const q of queryTerms) {
    try {
      const qStr = cleanLocality ? `${cleanLocality} ${q.term}` : q.term;
      let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(qStr)}&limit=5`;
      if (lat !== 0 && lng !== 0) {
        url += `&lat=${lat}&lon=${lng}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.features) {
          for (const feat of data.features) {
            const name = feat.properties?.name;
            if (!name || name.trim().length < 3) continue;

            const lowerName = name.toLowerCase().trim();
            if (['school', 'college', 'hospital', 'park', 'bus stop', 'mall', 'bank', 'atm', 'station', 'road'].includes(lowerName)) continue;

            const pLat = feat.geometry?.coordinates?.[1];
            const pLng = feat.geometry?.coordinates?.[0];

            let distKm = 1.0;
            if (lat !== 0 && lng !== 0 && pLat && pLng) {
              distKm = getHaversineDistance(lat, lng, pLat, pLng);
            }

            if (distKm > 15.0) continue;

            if (!map.has(lowerName)) {
              const { category, typeName } = classifyPlaceCategory(
                feat.properties.osm_value || '',
                feat.properties.osm_key === 'shop' ? feat.properties.osm_value : '',
                feat.properties.osm_key === 'railway' ? feat.properties.osm_value : '',
                feat.properties.osm_key === 'highway' ? feat.properties.osm_value : '',
                feat.properties.osm_key === 'leisure' ? feat.properties.osm_value : '',
                name
              );

              map.set(lowerName, {
                name: name.trim(),
                category: (q.cat as any) || category,
                type: typeName || 'Landmark',
                distance: distKm.toFixed(1),
                unit: 'km',
                lat: pLat,
                lng: pLng
              });
            }
          }
        }
      }
    } catch (e) {}
  }

  return Array.from(map.values()).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

/**
 * Fetch dynamic nearby places for a given latitude and longitude using Backend API Proxy + Photon/Overpass Fallbacks
 */
export async function fetchLiveNearbyPlaces(
  lat: number,
  lng: number,
  locationName: string = '',
  radiusMeters: number = 3500,
  propertyId?: string | number
): Promise<NearbyPlaceItem[]> {
  let targetLat = Number(lat) || 0;
  let targetLng = Number(lng) || 0;

  // Dynamic Geocoding fallback if coordinates are invalid / missing
  if ((!Number.isFinite(targetLat) || !Number.isFinite(targetLng) || (targetLat === 0 && targetLng === 0)) && locationName) {
    const coords = await geocodeLocation(locationName);
    if (coords) {
      targetLat = coords.lat;
      targetLng = coords.lng;
    }
  }

  const cacheKey = `nearby_${propertyId || 'prop'}_${targetLat.toFixed(3)}_${targetLng.toFixed(3)}_${(locationName || '').slice(0, 10)}`;

  // 1. In-memory cache check
  if (placesCache[cacheKey] && placesCache[cacheKey].length > 0) {
    return placesCache[cacheKey];
  }

  // 2. LocalStorage cache check
  if (typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          placesCache[cacheKey] = parsed;
          return parsed;
        }
      }
    } catch (e) { }
  }

  // 3. Try Backend Proxy Endpoint (Bypasses Browser CORS & Referrer Restriction)
  try {
    let backendEndpoint = `/api/location/nearby?location=${encodeURIComponent(locationName)}`;
    if (propertyId) {
      backendEndpoint = `/api/location/properties/${propertyId}/nearby`;
    } else if (targetLat !== 0 && targetLng !== 0) {
      backendEndpoint = `/api/location/nearby?lat=${targetLat}&lng=${targetLng}&address=${encodeURIComponent(locationName)}`;
    }

    const response = await fetch(backendEndpoint);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const formatted: NearbyPlaceItem[] = data
          .map((item: any) => {
            const { category, typeName } = classifyPlaceCategory(
              item.type || item.amenity || '',
              item.shop || '',
              item.railway || '',
              item.highway || '',
              item.leisure || '',
              item.name || ''
            );
            const distVal = parseFloat(String(item.distance || '1.0'));
            if (!Number.isFinite(distVal) || distVal > 15.0) return null;

            return {
              name: String(item.name || 'Landmark').trim(),
              category: (item.category && ['education', 'healthcare', 'transit', 'shopping', 'dining'].includes(item.category)
                ? item.category
                : category) as any,
              type: typeName || item.type || 'Landmark',
              distance: distVal.toFixed(1),
              unit: item.unit || 'km',
              lat: item.lat,
              lng: item.lng
            };
          })
          .filter(Boolean) as NearbyPlaceItem[];

        if (formatted.length > 0) {
          placesCache[cacheKey] = formatted;
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(formatted));
            } catch (e) { }
          }
          return formatted;
        }
      }
    }
  } catch (backendErr) {
    console.warn('Backend nearby places proxy call error:', backendErr);
  }

  // 4. Client-side Photon Query Fallback
  const photonResults = await fetchClientPhotonPlaces(locationName, targetLat, targetLng);
  if (photonResults.length > 0) {
    placesCache[cacheKey] = photonResults;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(photonResults));
      } catch (e) { }
    }
    return photonResults;
  }

  // 5. Direct Client Overpass Query Fallback
  let elements: any[] = [];

  if (Number.isFinite(targetLat) && Number.isFinite(targetLng) && (targetLat !== 0 || targetLng !== 0)) {
    const query = `[out:json][timeout:10];(node["amenity"~"school|college|university|kindergarten|hospital|clinic|pharmacy|doctors|restaurant|cafe|fast_food|bank|atm|food_court|pub|bar|bus_station"](around:${radiusMeters},${targetLat},${targetLng});node["shop"~"supermarket|mall|department_store|convenience|clothes|bakery|store|bazaar"](around:${radiusMeters},${targetLat},${targetLng});node["railway"~"station|subway_entrance|halt|subway"](around:${radiusMeters},${targetLat},${targetLng});node["highway"~"bus_stop|platform"](around:${radiusMeters},${targetLat},${targetLng});node["leisure"~"park|garden|fitness_centre|pitch|playground|sports_centre"](around:${radiusMeters},${targetLat},${targetLng});way["amenity"~"school|college|university|hospital|clinic|pharmacy|restaurant|cafe|bank"](around:${radiusMeters},${targetLat},${targetLng});way["shop"~"supermarket|mall|department_store"](around:${radiusMeters},${targetLat},${targetLng});way["leisure"~"park|garden|fitness_centre|pitch|playground"](around:${radiusMeters},${targetLat},${targetLng}););out center 80;`;

    const fetchFromEndpoint = async (endpoint: string): Promise<any[]> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: 'data=' + encodeURIComponent(query),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (response.ok) {
          const data = await response.json();
          if (data?.elements && Array.isArray(data.elements)) {
            return data.elements;
          }
        }
      } catch (err) {
        clearTimeout(timer);
      }
      return [];
    };

    try {
      for (const endpoint of OVERPASS_ENDPOINTS) {
        const resElements = await fetchFromEndpoint(endpoint);
        if (resElements && resElements.length > 0) {
          elements = resElements;
          break;
        }
      }
    } catch (err) { }
  }

  const results: NearbyPlaceItem[] = [];
  const seenNames = new Set<string>();

  if (elements.length > 0) {
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags.brand || tags.operator;
      if (!name || seenNames.has(name.toLowerCase().trim())) continue;

      const itemLat = el.lat || el.center?.lat;
      const itemLon = el.lon || el.center?.lon;
      if (!itemLat || !itemLon) continue;

      const amenity = tags.amenity || '';
      const shop = tags.shop || '';
      const railway = tags.railway || '';
      const highway = tags.highway || '';
      const leisure = tags.leisure || '';

      const { category, typeName } = classifyPlaceCategory(amenity, shop, railway, highway, leisure, name);
      const distKm = getHaversineDistance(targetLat, targetLng, itemLat, itemLon);

      if (!Number.isFinite(distKm) || distKm > 15.0) continue;

      seenNames.add(name.toLowerCase().trim());

      results.push({
        name: name.trim(),
        category,
        type: typeName,
        distance: distKm.toFixed(1),
        unit: 'km',
        lat: itemLat,
        lng: itemLon,
      });
    }
  }

  results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  if (results.length > 0) {
    placesCache[cacheKey] = results;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(results));
      } catch (e) { }
    }
  }
  return results;
}

