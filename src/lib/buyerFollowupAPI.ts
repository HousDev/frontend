// src/api/buyerFollowupAPI.ts
import { api } from "./api"; // 👈 yaha api = axios instance hai (baseURL set kiya hua)

export const buyerFollowupAPI = {
  // Create new followup
  create: async (data: any) => {
    const res = await api.post("/buyer-followups/create", data);
    return res.data;
  },

  // Get all followups (with optional buyerId, pagination)
  getAll: async (params?: { buyerId?: string; page?: number; limit?: number }) => {
    const res = await api.get("/buyer-followups/getall", { params });
    return res.data;
  },

  // Get single followup by ID
  getById: async (id: string) => {
    const res = await api.get(`/buyer-followups/getbyid/${id}`);
    return res.data;
  },

  // Update followup
  update: async (id: string, data: any) => {
    const res = await api.put(`/buyer-followups/update/${id}`, data);
    return res.data;
  },

  // Delete followup
  remove: async (id: string) => {
    const res = await api.delete(`/buyer-followups/remove/${id}`);
    return res.data;
  },
};
