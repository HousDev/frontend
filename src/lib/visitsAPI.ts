// src/lib/visitsAPI.ts
import { api } from "./api";

/* =========================
   Types
========================= */
export type ID = string | number;

export type VisitCreatePayload = {
  buyer_id: ID;                   // required
  seller_id?: ID | null;
  property_id?: ID;               // required in your controller
  // --- You can send EITHER of these ---
  visit_datetime?: string;        // ISO or "YYYY-MM-DD HH:mm:ss"
  visit_date?: string;            // "YYYY-MM-DD"
  visit_time?: string;            // "HH:mm:ss"
  // ------------------------------------
  meet_point?: string | null;

  // People & meta
  buyer_name?: string | null;
  buyer_phone?: string | null;
  property_title?: string | null;
  executive_id?: ID | null;       // server column
  assigned_to?: ID | null;        // convenience alias -> mapped to executive_id

  // Status & details
  status?: string;                // "scheduled" | "done" | "no_show" | ...
  duration_minutes?: number;
  visit_type?: string;            // default "site_visit"
  seller_present?: 0 | 1 | boolean;
  seller_name?: string | null;
  seller_phone?: string | null;

  accompanied_by?: any;           // array/object/string -> JSON server side
  feedback?: string | null;
  rating?: number | null;
  outcome?: string | null;
  next_action?: string | null;
  next_action_due?: string | null; // "YYYY-MM-DD"
  concerns?: string | null;
  positives?: string | null;
  remarks?: string | null;

  // Extra client-only meta (ignored by server but handy to keep)
  meta?: Record<string, any>;
};

export type VisitUpdatePayload = Partial<VisitCreatePayload>;

/** Revisit payload aligns to child table/controller */
export type RevisitCreatePayload = {
  // URL se aayega; field optional rakha hai for flexibility
  visit_id?: ID;
  executive_id?: ID | null;
  // --- EITHER of these ---
  revisit_datetime?: string;      // ISO or "YYYY-MM-DD HH:mm:ss"
  revisit_date?: string;          // "YYYY-MM-DD"
  revisit_time?: string;          // "HH:mm:ss"
  // -----------------------
  duration_minutes?: number;
  accompanied_by?: any;           // array/object/string
  status?: string;                // default 'scheduled'
  feedback?: string | null;
  rating?: number | null;
  remarks?: string | null;
  meta?: Record<string, any>;
};

export type RevisitUpdatePayload = Partial<RevisitCreatePayload>;

export type GetAllVisitsParams = {
  buyer_id?: ID;
  seller_id?: ID;
  property_id?: ID;
  executive_id?: ID;
  status?: string;
  search?: string;

  // DateTime filters (match controller)
  from_datetime?: string;         // ISO or "YYYY-MM-DD HH:mm:ss"
  to_datetime?: string;
  from_date?: string;             // "YYYY-MM-DD"
  to_date?: string;

  // Pagination (controller uses page, limit)
  page?: number;
  limit?: number;
};

/* =========================
   Helpers
========================= */
function assertVisitDateInput(d: VisitCreatePayload) {
  const hasSplit = !!(d.visit_date && d.visit_time);
  const hasISO = !!d.visit_datetime;
  if (!hasSplit && !hasISO) {
    throw new Error("(visit_date + visit_time) OR visit_datetime is required");
  }
}

function assertRevisitDateInput(d: RevisitCreatePayload) {
  const hasSplit = !!(d.revisit_date && d.revisit_time);
  const hasISO = !!d.revisit_datetime;
  if (!hasSplit && !hasISO) {
    throw new Error("(revisit_date + revisit_time) OR revisit_datetime is required");
  }
}

function normalizeExecAlias<T extends { executive_id?: ID | null; assigned_to?: ID | null }>(obj: T) {
  // If client passes assigned_to, map it to executive_id (without overwriting explicit executive_id)
  if (obj.assigned_to != null && obj.executive_id == null) {
    obj.executive_id = obj.assigned_to;
  }
  return obj;
}

function buildQuery(params: Record<string, unknown> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length) query.set(k, String(v));
  });
  return query.toString();
}

/* ===========================================================
   visitsAPI — matches /api/visits router you shared
   Parent:  /api/visits
   Child:   /api/visits/:visitId/revisits   (create/list)
   Direct:  /api/revisits/:revisitId        (update/delete)
=========================================================== */
export const visitsAPI = {
  /* ========== VISITS (Parent) ========== */

  // Create visit
  async createVisit(data: VisitCreatePayload) {
    if (!data?.buyer_id) throw new Error("buyer_id is required");
    if (!data?.property_id) throw new Error("property_id is required");
    assertVisitDateInput(data);

    const payload = normalizeExecAlias({ ...data });
    const res = await api.post("/visits/create", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Get all visits (filters + pagination)
  async getAllVisits(params: GetAllVisitsParams = {}) {
    const qs = buildQuery(params);
    const res = await api.get(`/visits/get-all${qs ? `?${qs}` : ""}`);
    return res.data;
  },

  // Get visit by id
  async getVisitById(visitId: ID) {
    if (!visitId) throw new Error("visitId is required");
    const res = await api.get(`/visits/getbyid/${visitId}`);
    return res.data;
  },

  // Update visit
  async updateVisit(visitId: ID, data: VisitUpdatePayload) {
    if (!visitId) throw new Error("visitId is required");
    const payload = normalizeExecAlias({ ...data });

    // If client decides to update schedule using single ISO, allow it
    // Controller will split to visit_date/time.
    const res = await api.patch(`/visits/update/${visitId}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Delete visit
  async deleteVisit(visitId: ID) {
    if (!visitId) throw new Error("visitId is required");
    const res = await api.delete(`/visits/delete/${visitId}`);
    return res.data;
  },

  /* ========== REVISITS (Child) ========== */

  // Create a revisit under a visit
  // Route: POST /api/visits/create-revisit/:visitId/revisits
  async createRevisit(visitId: ID, data: RevisitCreatePayload) {
    if (!visitId) throw new Error("visitId is required");
    assertRevisitDateInput(data);

    const res = await api.post(`/visits/create-revisit/${visitId}/revisits`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Get all revisits for a visit
  // Route: GET /api/visits/revisit/:visitId/revisits
  async getRevisitsByVisit(visitId: ID) {
    if (!visitId) throw new Error("visitId is required");
    const res = await api.get(`/visits/revisit/${visitId}/revisits`);
    return res.data;
  },

  /* ========== REVISITS (Direct) ========== */

  // Update revisit by id
  // Route: PATCH /api/revisits/:revisitId
  async updateRevisit(revisitId: ID, data: RevisitUpdatePayload) {
    if (!revisitId) throw new Error("revisitId is required");

    // Allow ISO in update as well (controller will split)
    const res = await api.patch(`/revisits/${revisitId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Delete revisit by id
  // Route: DELETE /api/revisits/:revisitId
  async deleteRevisit(revisitId: ID) {
    if (!revisitId) throw new Error("revisitId is required");
    const res = await api.delete(`/revisits/${revisitId}`);
    return res.data;
  },
};

/* =========================
   Usage snippets
========================= */
// Create visit with split date/time
// await visitsAPI.createVisit({
//   buyer_id: 12,
//   property_id: 345,
//   visit_date: "2025-11-06",
//   visit_time: "11:00:00",
//   assigned_to: 7,              // -> executive_id
//   accompanied_by: ["Agent A", "Friend"],
//   next_action_due: "2025-11-10",
// });

// Create visit with ISO
// await visitsAPI.createVisit({
//   buyer_id: 12,
//   property_id: 345,
//   visit_datetime: "2025-11-06T11:00:00+05:30",
// });

// Create revisit (ISO OR split)
// await visitsAPI.createRevisit(123, { revisit_datetime: "2025-11-07T15:00:00+05:30" });
// await visitsAPI.createRevisit(123, { revisit_date: "2025-11-07", revisit_time: "15:00:00" });

// Get with filters
// await visitsAPI.getAllVisits({ property_id: 345, from_date: "2025-11-01", to_date: "2025-11-30", page: 1, limit: 50 });
