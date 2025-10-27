// src/lib/smsIntegrationAPI
import { api } from "./api";

// SMS Integration API
export const smsIntegrationAPI = {
  // Fetch SMS integration details
  getIntegration: async () => {
        const response = await api.get("/sms-integration");
        
    return response.data;
  },

  // Save / update SMS integration
  saveIntegration: async (payload: any) => {
    const response = await api.post("/sms-integration", payload);
    return response.data;
  },

  // Toggle enable/disable
  toggleIntegration: async (payload: { id: string; enabled: boolean }) =>{
    const response = await api.post("/sms-integration/toggle", payload);
    return response.data;
  },

  // Trigger sync
  syncIntegration: async (payload: { id: string }) => {
    const response = await api.post("/sms-integration/sync", payload);
    return response.data;
  },
};
