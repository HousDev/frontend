// frontend/src/utils/deviceInfo.ts

export interface DeviceLocationResult {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  error?: string;
}

// 1. Dynamic Reverse Geocoding from OpenStreetMap (Formatted for high accuracy)
export function fetchReverseGeocode(lat: number, lng: number): Promise<string> {
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.address) {
        const a = data.address;
        const buildingOrRoad = a.building || a.house_number || a.road || a.pedestrian || "";
        const locality = a.suburb || a.neighbourhood || a.residential || a.city_district || "";
        const city = a.city || a.town || a.village || a.county || "";
        const state = a.state || "";
        const postcode = a.postcode || "";

        const parts = Array.from(new Set([buildingOrRoad, locality, city, state, postcode].filter(Boolean)));
        if (parts.length > 0) {
          return parts.join(", ");
        }
      }
      if (data && data.display_name) {
        return data.display_name;
      }
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    })
    .catch(() => `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
}

// 2. Dynamic Network IP Geolocation Fallback (No hardcoded numbers/cities)
export async function fetchIpLocation(): Promise<DeviceLocationResult> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
      const addressParts = [data.city, data.region, data.country_name].filter(Boolean);
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        address: addressParts.join(", ") || `${data.city || "Network Location"}`,
      };
    }
  } catch (_) {}

  try {
    const res = await fetch("https://ip-api.com/json/");
    const data = await res.json();
    if (data && typeof data.lat === "number" && typeof data.lon === "number") {
      const addressParts = [data.city, data.region, data.country].filter(Boolean);
      return {
        latitude: data.lat,
        longitude: data.lon,
        address: addressParts.join(", ") || `${data.city || "Network Location"}`,
      };
    }
  } catch (_) {}

  return {
    latitude: 0,
    longitude: 0,
    address: "Location Permission Denied (Default Fallback)",
  };
}

// 3. Pre-login Geolocation Request (GPS first, IP fallback if denied/unavailable)
export function requestMandatoryPreLoginLocation(timeoutMs = 5000): Promise<DeviceLocationResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      fetchIpLocation().then(resolve);
      return;
    }

    let resolved = false;

    const timer = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        const ipLoc = await fetchIpLocation();
        resolve(ipLoc);
      }
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let address = "";
        try {
          address = await fetchReverseGeocode(lat, lng);
        } catch (_) {
          address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        }
        resolve({ latitude: lat, longitude: lng, address });
      },
      async (_) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        const ipLoc = await fetchIpLocation();
        resolve(ipLoc);
      },
      {
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 60000,
      }
    );
  });
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "dev_server";
  let deviceId = localStorage.getItem("resale_device_id");
  if (!deviceId) {
    deviceId = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem("resale_device_id", deviceId);
  }
  return deviceId;
}

export function getBrowserSource(): string {
  if (typeof window === "undefined") return "Unknown Browser";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Apple Safari";
  if (ua.includes("Edg")) return "Microsoft Edge";
  return "Web Browser";
}
