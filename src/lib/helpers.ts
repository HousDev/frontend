// helpers.ts (or wherever getImageUrl lives)
export const API_GLOBAL_BASE =
  import.meta.env.MODE === "production"
    ? "https://resaleexpert.in/api/"   // 🔒 use https in prod
    : "http://localhost:3000";

// ✅ keep the FILE_BASE logic you already have, but ensure protocol-safe
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

/** Normalize image path into full URL (no mixed-content) */
export function getImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  const clean = String(raw).replace(/\\/g, "/").trim();

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

  // starts with /uploads or /public => serve from current origin (avoids CORS + mixed content)
  if (clean.startsWith("/uploads") || clean.startsWith("/public")) {
    const origin = typeof window !== "undefined" ? window.location.origin : FILE_BASE;
    return origin + clean;
  }

  // other relative like "uploads/..." -> make it "/uploads/..."
  const path = clean.startsWith("/") ? clean : `/${clean}`;
  const origin = typeof window !== "undefined" ? window.location.origin : FILE_BASE;
  return origin + path;
}

