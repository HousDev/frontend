// src/api/buyerFollowupAPI.ts
import { api } from "./api"; // 👈 yaha api = axios instance hai (baseURL set kiya hua)

const handleError = (error: any) => {
  if (error.response) {
    // Server responded with a status outside 2xx
    console.error("API Error Response:", error.response.data);
    throw new Error(error.response.data?.message || "Server Error");
  } else if (error.request) {
    // Request was made but no response
    console.error("API No Response:", error.request);
    throw new Error("No response from server. Please try again later.");
  } else {
    // Something else happened
    console.error("API Error:", error.message);
    throw new Error(error.message || "Unexpected error");
  }
};

export const buyerFollowupAPI = {
  // Create new followup
  create: async (data: any) => {
    try {
      const res = await api.post("/buyer-followups/create", data);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get all followups (with optional buyerId, pagination)
  getAll: async (params?: { buyerId?: string; page?: number; limit?: number }) => {
    try {
      const res = await api.get("/buyer-followups/getall", { params });
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get single followup by ID
  getById: async (id: string) => {
    try {
      const res = await api.get(`/buyer-followups/getbyid/${id}`);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Update followup
  update: async (id: string, data: any) => {
    try {
      const res = await api.put(`/buyer-followups/update/${id}`, data);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Delete followup
  remove: async (id: string) => {
    try {
      const res = await api.delete(`/buyer-followups/remove/${id}`);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },
};
