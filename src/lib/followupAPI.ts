import { api } from "./api"; // axios instance

export const followupAPI = {
  // Get all followups
  getAllFollowups: async () => {
    const response = await api.get("/followups/get-all");
    return response.data;
  },

  // Create followup
  createFollowup: async (data: any) => {
    const response = await api.post("/followups/create", data);
    return response.data;
  },

  // Get followup by ID
  getFollowupById: async (id: string) => {
    const response = await api.get(`/followups/getById/${id}`);
    return response.data;
  },

  // Update followup
  updateFollowup: async (id: string, data: any) => {
    const response = await api.put(`/followups/update/${id}`, data);
    return response.data;
  },

  // Delete followup
  deleteFollowup: async (id: string) => {
    const response = await api.delete(`/followups/delete/${id}`);
    return response.data;
  },
   // Get followups by leadId
getFollowupsByLeadId: async (leadId: string) => {
  try {
   
    const response = await api.get(`/followups/getByLeadId/${leadId}`);
    
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.warn("No followups found for lead:", leadId);
      return []; // ✅ empty array return
    }
    throw error;
  }
},

  
  getFollowupCountByLeadId: async (leadId: string) => {
   
    const response = await api.get(`/followups/countByLeadId/${leadId}`);
    
    return response.data;
  },
};
