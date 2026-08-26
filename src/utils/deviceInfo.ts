// frontend/src/utils/deviceInfo.ts

export interface DeviceLocationResult {
  latitude: number | null;
  longitude: number | null;
  error?: string;
}

export function requestMandatoryPreLoginLocation(timeoutMs = 5000): Promise<DeviceLocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: null,
        longitude: null,
        error: "Geolocation is not supported by your browser. Location access is required to log in.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        let msg = "Location access is required to log in. Please enable location permissions in your browser and try again.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission was denied. Please allow location access in your browser settings to log in.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please ensure location is enabled and try again.";
        }
        resolve({
          latitude: null,
          longitude: null,
          error: msg,
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
