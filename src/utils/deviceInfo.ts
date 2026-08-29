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
    latitude: null,
    longitude: null,
    address: "Location Permission Denied",
  };
}

// 3. Mandatory Pre-login Geolocation Request (Strict browser location, no IP fallback)
export function requestMandatoryPreLoginLocation(timeoutMs = 10000): Promise<DeviceLocationResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve({
        latitude: null,
        longitude: null,
        error: "Geolocation is not supported by your browser or device.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
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
      (err) => {
        let errorMsg = "Location access is required to log in. Please enable location permissions in your browser and try again.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Location permission was denied. You must allow location access in your browser to log in.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable. Please turn on your device GPS / Location service and try again.";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "Location request timed out. Please make sure location access is enabled and try again.";
        }
        resolve({
          latitude: null,
          longitude: null,
          error: errorMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
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
  let browser = "Chrome";
  let os = "Windows";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} on ${os}`;
}
