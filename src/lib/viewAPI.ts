// src/lib/viewsAPI.ts
import { api } from "./api";

const BASE_URL = "/views";

export const viewsAPI = {
  // Get total views (system-wide)
  getTotal: async () => {
    try {
      const response = await api.get(`${BASE_URL}/total`);
      return response.data;
    } catch (err) {
      console.error("viewsAPI.getTotal failed:", err);
      return { success: false, total_views: 0, unique_views: 0 };
    }
  },

  // Get property views (optionally unique)
  getByProperty: async (id: number, unique: boolean = false) => {
    try {
      const response = await api.get(`${BASE_URL}/property/${id}`, {
        params: { unique },
      });
      return response.data;
    } catch (err) {
      console.error(`viewsAPI.getByProperty(${id}) failed:`, err);
      return { success: false, property_id: id, total_views: 0, unique_views: 0 };
    }
  },

  // Record a view event for a property (best-effort)
  // payload can include { slug?, path?, referrer?, session_id?, dedupe_key?, extra?: object }
  recordView: async (propertyId: number | null, payload: Record<string, any> = {}) => {
    if (!propertyId) {
      // if no numeric id, attempt to post to generic /views/record endpoint with slug in payload
      try {
        const resp = await api.post(`${BASE_URL}/record`, payload);
        return resp.data;
      } catch (err) {
        console.error("viewsAPI.recordView (fallback) failed:", err);
        return { success: false };
      }
    }

    // prefer a property-specific route
    try {
      // post to /views/property/:id/record
      const resp = await api.post(`${BASE_URL}/property/${propertyId}/record`, payload);
      return resp.data;
    } catch (err) {
      // If property-specific endpoint not available, fallback to generic path
      try {
        const resp2 = await api.post(`${BASE_URL}/record`, { property_id: propertyId, ...payload });
        return resp2.data;
      } catch (err2) {
        console.error("viewsAPI.recordView failed:", err, err2);
        return { success: false };
      }
    }
  },

  // Get top viewed properties
  getTop: async (limit: number = 10, unique: boolean = false) => {
    try {
      const response = await api.get(`${BASE_URL}/top`, {
        params: { limit, unique },
      });
      return response.data;
    } catch (err) {
      console.error("viewsAPI.getTop failed:", err);
      return { success: false, rows: [] };
    }
  },

  // Get least viewed properties
  getBottom: async (limit: number = 10, unique: boolean = false) => {
    try {
      const response = await api.get(`${BASE_URL}/bottom`, {
        params: { limit, unique },
      });
      return response.data;
    } catch (err) {
      console.error("viewsAPI.getBottom failed:", err);
      return { success: false, rows: [] };
    }
  },
};

export default viewsAPI;
