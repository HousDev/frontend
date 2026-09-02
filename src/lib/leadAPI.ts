
import { api } from "./api";

// Leads API
export const leadsAPI = {
  getLeads: async (params?: any) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  exportLeads: async () => {
    const response = await api.get('/leads/export');
    return response.data;
  },

  getScheduledViewings: async () => {
    const response = await api.get('/leads/scheduled-viewings');
    return response.data;
  },

  getLead: async (id: string) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (data: any) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const response = await api.post('/leads', { ...data, guest_id: data.guest_id || guestId });
    return response.data;
  },

  updateLead: async (id: string, data: any) => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: { status: string; notes?: string }) => {
    const response = await api.patch(`/leads/${id}/status`, data);
    return response.data;
  },

  assignToAgent: async (id: string, data: { assigned_agent_id: string; notes?: string }) => {
    const response = await api.patch(`/leads/${id}/assign`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/leads/stats');
    return response.data;
  },
};
