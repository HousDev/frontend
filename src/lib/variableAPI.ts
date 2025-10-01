import { api } from './api';

export const variableAPI = {
  // Get all variables for a specific tab
  getByTab: async (tabId: string) => {
    if (!tabId) throw new Error('Tab ID is required');
  
    const response = await api.get(`/variables/${tabId}`);

    return response.data;
  },

  // Create a new variable
  create: async (data: { name: string; variableName: string; variableTabId: string; status: 'active' | 'inactive' }) => {
    if (!data?.name || !data?.variableTabId) throw new Error('Name and Tab ID are required');
   
    const response = await api.post('/variables', data);
  
    return response.data;
  },

  // Update a variable by ID
  update: async (id: string | number, data: { name: string; variableName: string; status: 'active' | 'inactive' }) => {
    if (!id) throw new Error('Variable ID is required');
  
    const response = await api.put(`/variables/${id}`, data);
   
    return response.data;
  },

  // Delete a variable by ID
  delete: async (id: string | number) => {
    if (!id) throw new Error('Variable ID is required');
   
    const response = await api.delete(`/variables/${id}`);
    
    return response.data;
  },

  // Bulk delete variables
  bulkDelete: async (ids: Array<string | number>) => {
    if (!ids || ids.length === 0) throw new Error('Variable IDs are required');
  
    const response = await api.post('/variables/bulk-delete', { ids });

    return response.data;
  },

  // Bulk update status (active/inactive)
  bulkUpdateStatus: async (ids: Array<string | number>, status: 'active' | 'inactive') => {
    if (!ids || ids.length === 0) throw new Error('Variable IDs are required');
   
    const response = await api.post('/variables/bulk-update-status', { ids, status });

    return response.data;
  },


};
