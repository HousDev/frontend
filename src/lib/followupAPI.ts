import { api } from "./api";

export interface FollowUpFilters {
  entity?: "LEAD" | "BUYER" | "SELLER" | "OWNER" | "TENANT" | string;
  entityCode?: string;
  entityId?: string | number;
  leadId?: string | number;
  buyerId?: string | number;
  sellerId?: string | number;
  type?: string;
  isComplete?: boolean;
  scheduledDate?: string;
  priority?: string;
  assignedTo?: string;
}

export const followupAPI = {
  // Get all followups with optional filters
  getAll: async (filters?: FollowUpFilters) => {
    const response = await api.get("/followups/get-all", { params: filters });
    return response.data;
  },

  // Backward compatible alias
  getAllFollowups: async (filters?: FollowUpFilters) => {
    const response = await api.get("/followups/get-all", { params: filters });
    return response.data;
  },

  // Create followup
  create: async (data: any) => {
    const response = await api.post("/followups/create", data);
    return response.data;
  },

  // Backward compatible alias
  createFollowup: async (data: any) => {
    const response = await api.post("/followups/create", data);
    return response.data;
  },

  // Get followup by ID
  getById: async (id: string) => {
    const response = await api.get(`/followups/getById/${id}`);
    return response.data;
  },

  // Backward compatible alias
  getFollowupById: async (id: string) => {
    const response = await api.get(`/followups/getById/${id}`);
    return response.data;
  },

  // Update followup
  update: async (id: string, data: any) => {
    const response = await api.put(`/followups/update/${id}`, data);
    return response.data;
  },

  // Backward compatible alias
  updateFollowup: async (id: string, data: any) => {
    const response = await api.put(`/followups/update/${id}`, data);
    return response.data;
  },

  // Complete followup with outcome & reason
  complete: async (id: string, outcomeData: any) => {
    const response = await api.post(`/followups/complete/${id}`, outcomeData);
    return response.data;
  },

  // Delete followup
  delete: async (id: string) => {
    const response = await api.delete(`/followups/delete/${id}`);
    return response.data;
  },

  // Backward compatible alias
  deleteFollowup: async (id: string) => {
    const response = await api.delete(`/followups/delete/${id}`);
    return response.data;
  },

  // Get followups by entity (LEAD, BUYER, SELLER)
  getByEntity: async (entityCode: string, entityId: string | number) => {
    try {
      const response = await api.get(`/followups/entity/${entityCode}/${entityId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return { success: true, data: [] };
      throw error;
    }
  },

  // Get followups by leadId
  getByLeadId: async (leadId: string | number) => {
    try {
      const response = await api.get(`/followups/getByLeadId/${leadId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return { success: true, data: [] };
      throw error;
    }
  },

  // Backward compatible alias
  getFollowupsByLeadId: async (leadId: string | number) => {
    try {
      const response = await api.get(`/followups/getByLeadId/${leadId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return { success: true, data: [] };
      throw error;
    }
  },

  // Get count by leadId
  getFollowupCountByLeadId: async (leadId: string | number) => {
    const response = await api.get(`/followups/countByLeadId/${leadId}`);
    return response.data;
  },

  // Get followups by buyerId
  getByBuyerId: async (buyerId: string | number) => {
    try {
      const response = await api.get("/followups/get-all", { params: { entity: "BUYER", entityId: buyerId } });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return { success: true, data: [] };
      throw error;
    }
  },

  // Get followups by sellerId
  getBySellerId: async (sellerId: string | number) => {
    try {
      const response = await api.get("/followups/get-all", { params: { entity: "SELLER", entityId: sellerId } });
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) return { success: true, data: [] };
      throw error;
    }
  },
};

export default followupAPI;
