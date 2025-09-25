// ✅ Global API_BASE (auto pick dev/prod)
export const API_GLOBAL_BASE =
  import.meta.env.MODE === "production"
    ? "http://investordeal.in/api/"
    : "http://localhost:3000";

// ✅ File base (uploads)
export const FILE_BASE: string = (() => {
  try {
    const u = new URL(API_GLOBAL_BASE);
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
      : "http://investordeal.in"; // fallback
  }
})();



/** Normalize image path into full URL */
export function getImageUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.replace(/\\/g, "/").trim();

  if (/^https?:\/\//i.test(clean)) return clean;
  if (clean.startsWith("/uploads/")) return `${FILE_BASE}${clean}`;
  if (clean.startsWith("uploads/")) return `${FILE_BASE}/${clean}`;
  if (clean.startsWith("properties/")) return `${FILE_BASE}/uploads/${clean}`;
  if (clean.startsWith("/properties/")) return `${FILE_BASE}/uploads${clean}`;
  if (!clean.includes("/")) return `${FILE_BASE}/uploads/properties/${clean}`;

  return `${FILE_BASE}/uploads/${clean.replace(/^\/+/, "")}`;
}

