// utils/uiSafe.ts
export const safe = <T,>(v: T | null | undefined, fallback: string | number = "-") =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "")
    ? fallback
    : v;

export const toDate = (v?: string | null) => {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toISOString().slice(0, 10);
  } catch {
    return "-";
  }
};

export const normalizeStage = (v?: string | null) =>
  v ? v.toLowerCase().replace(/\s+/g, "_") : "initial_contact";
