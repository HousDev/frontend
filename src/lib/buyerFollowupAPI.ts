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

// Type definitions for better TypeScript support
export interface BuyerFollowupFilters {
  buyerId?: string | number;
  leadId?: string | number;
  buyerLeadStage?: string;
  buyerLeadStatus?: string;
  priority?: 'High' | 'Medium' | 'Low';
  assignedExecutive?: string | number;
  fromDate?: string; // YYYY-MM-DD format
  toDate?: string; // YYYY-MM-DD format
  page?: number;
  limit?: number;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BuyerFollowupResponse {
  success: boolean;
  data: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BuyerFollowupCountResponse {
  success: boolean;
  data: {
    total: number;
  };
}

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

  // Get all followups (with optional filters + pagination)
  getAll: async (params?: BuyerFollowupFilters): Promise<BuyerFollowupResponse> => {
    try {
      const res = await api.get("/buyer-followups/getall", { params });
      return res.data;
    } catch (error) {
      handleError(error);
      throw error; // TypeScript requires this for type safety
    }
  },

  // Get single followup by ID
  getById: async (id: string | number) => {
    try {
      const res = await api.get(`/buyer-followups/getbyid/${id}`);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Update followup
  update: async (id: string | number, data: any) => {
    try {
      const res = await api.put(`/buyer-followups/update/${id}`, data);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Delete followup
  remove: async (id: string | number) => {
    try {
      const res = await api.delete(`/buyer-followups/remove/${id}`);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get count of followups (useful for stats/dashboard)
  getCount: async (params?: Omit<BuyerFollowupFilters, 'page' | 'limit' | 'sortOrder'>): Promise<BuyerFollowupCountResponse> => {
    try {
      const res = await api.get("/buyer-followups/count", { params });
      return res.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};