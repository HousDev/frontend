// src/lib/emailIntegrationAPI.ts
import { api } from "./api";

// Email Integration API
export const emailIntegrationAPI = {
  // Fetch Email integration details
  getIntegration: async () => {
    const response = await api.get("/email-integration");
    return response.data;
  },

  // Save or update Email configuration
  saveIntegration: async (payload: any) => {
    const response = await api.post("/email-integration", payload);
    return response.data;
  },

  // Toggle enable/disable Email integration
  toggleIntegration: async (payload: { id: string; enabled: boolean }) => {
    const response = await api.post("/email-integration/toggle", payload);
    return response.data;
  },

  // Trigger sync or reconnect (optional)
  syncIntegration: async (payload: { id: string }) => {
    const response = await api.post("/email-integration/sync", payload);
    return response.data;
  },
};
