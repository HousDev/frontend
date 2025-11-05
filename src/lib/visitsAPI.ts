// src/lib/visitsAPI.ts
import { api } from "./api";

/* =========================
   Types (optional but handy)
========================= */
export type ID = string | number;

export type VisitCreatePayload = {
  buyer_id: ID;                 // required
  seller_id?: ID;
  property_id?: ID;
  scheduled_at: string;         // ISO string: "2025-11-05T14:30:00+05:30"
  meet_point?: string;
  notes?: string;
  status?: string;              // e.g., "scheduled", "done", "no_show", etc.
  assigned_to?: ID;             // executive/user id
  meta?: Record<string, any>;
};

export type VisitUpdatePayload = Partial<VisitCreatePayload>;

export type RevisitCreatePayload = {
  scheduled_at: string;         // required (ISO)
  meet_point?: string;
  notes?: string;
  status?: string;
  assigned_to?: ID;
  meta?: Record<string, any>;
};

export type RevisitUpdatePayload = Partial<RevisitCreatePayload>;

export type GetAllVisitsParams = {
  buyer_id?: ID;
  seller_id?: ID;
  property_id?: ID;
  status?: string;
  assigned_to?: ID;
  date_from?: string;           // ISO date/time
  date_to?: string;             // ISO date/time
  page?: number;
  page_size?: number;
  search?: string;
};

/* ===========================================================
   visitsAPI — matches /api/visits router you shared
   Parent:  /api/visits
   Child:   /api/visits/:visitId/revisits   (create/list)
   Direct:  /api/revisits/:revisitId        (update/delete)
=========================================================== */
export const visitsAPI = {
  /* ========== VISITS (Parent) ========== */

  // Create visit
  createVisit: async (data: VisitCreatePayload) => {
    if (!data?.buyer_id) throw new Error("buyer_id is required");
    if (!data?.scheduled_at) throw new Error("scheduled_at is required");

    const res = await api.post("/visits/create", data, {
      // Long imports not expected, keep default timeout
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Get all visits (with optional filters/pagination)
  getAllVisits: async (params: GetAllVisitsParams = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && `${v}`.length) query.set(k, String(v));
    });

    const qs = query.toString();
    const res = await api.get(`/visits/get-all${qs ? `?${qs}` : ""}`);
    return res.data;
  },

  // Get visit by id
  getVisitById: async (visitId: ID) => {
    if (!visitId) throw new Error("visitId is required");
    const res = await api.get(`/visits/getbyid/${visitId}`);
    return res.data;
  },

  // Update visit
  updateVisit: async (visitId: ID, data: VisitUpdatePayload) => {
    if (!visitId) throw new Error("visitId is required");
    const res = await api.patch(`/visits/update/${visitId}`, data);
    return res.data;
  },

  // Delete visit
  deleteVisit: async (visitId: ID) => {
    if (!visitId) throw new Error("visitId is required");
    const res = await api.delete(`/visits/delete/${visitId}`);
    return res.data;
  },

  /* ========== REVISITS (Child) ========== */

  // Create a revisit under a visit
  // Route in your code: POST /api/visits/create-revisit/:visitId/revisits
  createRevisit: async (visitId: ID, data: RevisitCreatePayload) => {
    if (!visitId) throw new Error("visitId is required");
    if (!data?.scheduled_at) throw new Error("scheduled_at is required");

    const res = await api.post(`/visits/create-revisit/${visitId}/revisits`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Get all revisits for a visit
  // NOTE: Your route is "revisit" (singular) in path: GET /api/visits/revisit/:visitId/revisits
  getRevisitsByVisit: async (visitId: ID) => {
    if (!visitId) throw new Error("visitId is required");
    const res = await api.get(`/visits/revisit/${visitId}/revisits`);
    return res.data;
  },

  /* ========== REVISITS (Direct) ========== */

  // Update revisit by id
  // Route: PATCH /api/revisits/:revisitId
  updateRevisit: async (revisitId: ID, data: RevisitUpdatePayload) => {
    if (!revisitId) throw new Error("revisitId is required");
    const res = await api.patch(`/revisits/${revisitId}`, data);
    return res.data;
  },

  // Delete revisit by id
  // Route: DELETE /api/revisits/:revisitId
  deleteRevisit: async (revisitId: ID) => {
    if (!revisitId) throw new Error("revisitId is required");
    const res = await api.delete(`/revisits/${revisitId}`);
    return res.data;
  },
};
