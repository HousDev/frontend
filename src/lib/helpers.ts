// src/lib/helpers.ts

/* ---------------------- IMAGE URL HELPERS + DEBUG ---------------------- */

// API base (could be e.g. http://localhost:3000/api)
export const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:4000";

// FILE base (origin for static /uploads). Strip trailing /api or /api/* from API_BASE.
export const FILE_BASE = (() => {
  try {
    const u = new URL(API_BASE);
    const cleanPath = u.pathname.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    u.pathname = cleanPath || "/";
    u.search = "";
    u.hash = "";
    return (
      u.origin +
      (u.pathname.endsWith("/") ? u.pathname.slice(0, -1) : u.pathname)
    );
  } catch {
    return typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:4000";
  }
})();

/**
 * Convert any backend photo value into a public URL the browser can load.
 * Uses FILE_BASE (origin for /uploads), not API_BASE.
 */
export function getImageUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.replace(/\\/g, "/").trim();

  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("/uploads/")) return `${FILE_BASE}${clean}`;
  if (clean.startsWith("uploads/")) return `${FILE_BASE}/${clean}`;
  if (clean.startsWith("properties/")) return `${FILE_BASE}/uploads/${clean}`;
  if (clean.startsWith("/properties/")) return `${FILE_BASE}/uploads${clean}`;
  if (!clean.includes("/"))
    return `${FILE_BASE}/uploads/properties/${clean}`;

  return `${FILE_BASE}/uploads/${clean.replace(/^\/+/, "")}`;
}
