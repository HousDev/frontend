// helpers.ts
export const DEFAULT_PROPERTY_IMAGE = "/property.png";
export const DEFAULT_PROPERTY_IMAGES = [
  "/property.png",
  "/bedroom.png",
  "/kitchen.png",
  "/gallery.png"
];

export const API_GLOBAL_BASE =
  import.meta.env.MODE === "production"
    ? "https://resaleexpert.in/api/"   // 🔒 use https in prod
    : "http://localhost:3000";

// ✅ protocol-safe FILE_BASE logic
export const FILE_BASE: string = (() => {
  try {
    const u = new URL(API_GLOBAL_BASE);
    // strip "/api"
    const cleanPath = u.pathname.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    u.pathname = cleanPath || "/";
    u.search = "";
    u.hash = "";

    // if page is https, force https
    if (typeof window !== "undefined" && window.location.protocol === "https:" && u.protocol !== "https:") {
      u.protocol = "https:";
    }
    return u.origin + (u.pathname.endsWith("/") ? u.pathname.slice(0, -1) : u.pathname);
  } catch {
    return typeof window !== "undefined" ? window.location.origin : "https://resaleexpert.in";
  }
})();

export const ROOM_FALLBACKS: Record<string, string> = {
  property: "/property.png",
  bedroom: "/bedroom.png",
  kitchen: "/kitchen.png",
  gallery: "/gallery.png",
  living: "/gallery.png",
  hall: "/gallery.png",
};

export function getDefaultRoomFallback(roomType: string = "property"): string {
  const key = String(roomType).toLowerCase().trim();
  return ROOM_FALLBACKS[key] || "/property.png";
}

/** Normalize image path into full URL with automatic /property.png fallback */
export function getImageUrl(raw?: any, fallback: string = DEFAULT_PROPERTY_IMAGE): string {
  const resolvedFallback = ROOM_FALLBACKS[String(fallback).toLowerCase()] || (String(fallback).startsWith("/") || String(fallback).startsWith("http") ? fallback : DEFAULT_PROPERTY_IMAGE);
  if (!raw || raw === 'null' || raw === 'undefined' || raw === '[]' || raw === '""') {
    return resolvedFallback;
  }

  // Handle object inputs (e.g. { url: '...', file_path: '...' })
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const objUrl = raw.url || raw.file_path || raw.path || raw.src || raw.image || raw.photo || '';
    if (objUrl) return getImageUrl(objUrl, fallback);
    return resolvedFallback;
  }

  // Handle array inputs (e.g. [{ url: '...' }] or ['/uploads/...'])
  if (Array.isArray(raw)) {
    if (raw.length > 0 && raw[0]) {
      return getImageUrl(raw[0], fallback);
    }
    return resolvedFallback;
  }

  let clean = String(raw).replace(/\\/g, "/").trim();
  if (!clean || clean === '[]' || clean === '""' || clean === 'null' || clean === '[object Object]') {
    return resolvedFallback;
  }

  // Parse JSON stringified arrays or objects if passed (e.g. '[{"url":"/uploads/..."}]' or '["/uploads/..."]')
  if ((clean.startsWith('[') && clean.endsWith(']')) || (clean.startsWith('{') && clean.endsWith('}'))) {
    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
        return getImageUrl(parsed[0], fallback);
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return getImageUrl(parsed, fallback);
      }
      return fallback;
    } catch (e) {}
  }

  // Strip localhost / 127.0.0.1 dev server URLs so they become relative /uploads/...
  clean = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i, "/");

  // absolute http/https - upgrade to https if page is https
  if (/^https?:\/\//i.test(clean)) {
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      return clean.replace(/^http:\/\//i, "https://");
    }
    return clean;
  }

  // protocol-relative //domain/path -> prefix https if page is https
  if (/^\/\//.test(clean)) {
    const proto = (typeof window !== "undefined" && window.location.protocol === "https:") ? "https:" : "http:";
    return proto + clean;
  }

  // starts with /uploads or /public or root public images => serve from current origin (avoids CORS + mixed content)
  if (clean.startsWith("/uploads") || clean.startsWith("/public") || clean.startsWith("/property") || clean.startsWith("/bedroom") || clean.startsWith("/kitchen") || clean.startsWith("/gallery") || clean.startsWith("/RE") || clean.startsWith("/logo")) {
    const origin = typeof window !== "undefined" ? window.location.origin : FILE_BASE;
    return origin + clean;
  }

  // other relative like "uploads/..." -> make it "/uploads/..."
  const path = clean.startsWith("/") ? clean : `/${clean}`;
  const origin = typeof window !== "undefined" ? window.location.origin : FILE_BASE;
  return origin + path;
}


