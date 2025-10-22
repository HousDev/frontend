// src/lib/valuationAPI.ts
import { api } from "./api";

/* ---------------------------------- Types --------------------------------- */
export type Confidence = "Low" | "Medium" | "High";

export type CompRow = {
  society: string;
  distance_km: number;
  month: string; // e.g. "Oct 2025"
  price: number;
};

export type EstimateData = {
  low: number;
  high: number;
  ppsf: number;
  confidence: Confidence;
  comps: CompRow[];
};

export type EstimateResponse =
  | { success: true; data: EstimateData }
  | { success: false; error: string };

export type EstimatePayload = {
  city: string;
  locality: string;
  propertyType: string;
  unitType: string;
  carpet_sqft?: number;
  floor?: string;
  parking?: string;
  age?: string;
  amenities?: string[];
};

type Options = {
  /** Force mock regardless of env */
  mock?: boolean;
};

/* ----------------------------- Helper: Coercion ---------------------------- */
const cleanNumber = (v: unknown): number | undefined => {
  if (v == null) return undefined;
  const n = typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const normPayload = (p: EstimatePayload): EstimatePayload => ({
  ...p,
  city: (p.city || "").trim(),
  locality: (p.locality || "").trim(),
  propertyType: (p.propertyType || "").trim(),
  unitType: (p.unitType || "").trim(),
  carpet_sqft: cleanNumber(p.carpet_sqft),
  floor: (p.floor ?? "").toString().trim() || undefined,
  parking: (p.parking ?? "").toString().trim() || undefined,
  age: (p.age ?? "").toString().trim() || undefined,
  amenities: Array.isArray(p.amenities) ? p.amenities.filter(Boolean) : [],
});

/* ------------------------------- Mock Engine ------------------------------ */
const mockFrom = (payload: EstimatePayload): EstimateData => {
  const base =
    payload.city.toLowerCase().includes("mumbai") ? 28000 :
    payload.city.toLowerCase().includes("pune") ? 12000 :
    payload.city.toLowerCase().includes("bengaluru") ? 17000 :
    10000;

  const carpet = payload.carpet_sqft ?? 900;

  // age influence
  const ageFactor =
    payload.age === "0-2" ? 1.08 :
    payload.age === "3-5" ? 1.03 :
    payload.age === "6-10" ? 0.97 :
    payload.age === "10+" ? 0.92 : 1;

  // amenities slight bump
  const amenityFactor = Math.min(1.12, 1 + ((payload.amenities?.length || 0) * 0.0075));

  const ppsf = Math.round(base * ageFactor * amenityFactor);
  const low = Math.round(ppsf * carpet * 0.95);
  const high = Math.round(ppsf * carpet * 1.05);

  const month = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
  const comps: CompRow[] = [
    { society: "Sunshine Residency", distance_km: 0.8, month, price: Math.round(ppsf * (carpet * 0.98)) },
    { society: "Emerald Heights",   distance_km: 1.3, month, price: Math.round(ppsf * (carpet * 0.95)) },
    { society: "Skyline Enclave",   distance_km: 2.1, month, price: Math.round(ppsf * (carpet * 1.02)) },
  ];

  const confidence: Confidence =
    carpet >= 1200 ? "High" :
    carpet >= 800  ? "Medium" : "Low";

  return { low, high, ppsf, confidence, comps };
};

/* --------------------------------- API ------------------------------------ */
async function estimate(rawPayload: EstimatePayload, opts: Options = {}): Promise<EstimateResponse> {
  const payload = normPayload(rawPayload);

  // Optional global toggle for mock: set VITE_MOCK_VALUATION=true
  const globalMock = String(import.meta.env?.VITE_MOCK_VALUATION || "").toLowerCase() === "true";
  const shouldMock = !!(opts.mock || globalMock);

  if (shouldMock) {
    return { success: true, data: mockFrom(payload) };
  }

  try {
    const { data } = await api.post("/valuation/estimate", payload);

    // Expecting backend to respond in the same shape.
    if (data?.success) {
      return data as EstimateResponse;
    }
    return { success: false, error: data?.error || "Could not estimate" };
  } catch (err: any) {
    if (globalMock) {
      return { success: true, data: mockFrom(payload) };
    }
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Request failed";
    return { success: false, error: msg };
  }
}

export default { estimate };
