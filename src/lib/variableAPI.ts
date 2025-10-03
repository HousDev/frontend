// src/lib/variableAPI.ts
import { api } from './api';

type Status = 'active' | 'inactive';

export interface VariableRecord {
  id: number;
  name: string;
  variable_key: string;
  placeholder: string;
  variable_tab_id: string;
  category: string;
  status: Status;
  created_at?: string;
  updated_at?: string;
}

export interface VariablePayloadCreate {
  name: string;
  variable_key: string;        // e.g. buyer_name
  placeholder: string;         // e.g. {{buyer_name}}
  variable_tab_id: string;     // e.g. buyer/seller/property...
  category: string;            // same as tab id
  status: Status;
}

export interface VariablePayloadUpdate {
  name: string;
  variable_key: string;
  placeholder: string;
  status: Status;
}

const normalizeServerError = (e: any) => {
  const msg =
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    'Request failed';
  return new Error(msg);
};

export const variableAPI = {
  /** ✅ Get ALL variables (optional filters: q, status, limit, offset) */
getAll: async () => {
  const response = await api.get('/variables/get-all');
  return response.data;
},


  // Get all variables for a specific tab
  getByTab: async (tabId: string) => {
    if (!tabId) throw new Error('Tab ID is required');
    try {
      const response = await api.get(`/variables/${encodeURIComponent(tabId)}`);
      return response.data; // { success, data }
    } catch (e) {
      throw normalizeServerError(e);
    }
  },

  // Create (new schema)
  create: async (data: VariablePayloadCreate) => {
    if (!data?.name || !data?.variable_tab_id) {
      throw new Error('Name and Tab ID are required');
    }
    if (!data.variable_key) throw new Error('Variable key is required');
    if (!data.placeholder) throw new Error('Placeholder is required');
    if (!data.category) throw new Error('Category is required');

    try {
      const response = await api.post('/variables', data);
      return response.data;
    } catch (e) {
      throw normalizeServerError(e);
    }
  },

  // Update (new schema fields)
  update: async (id: string | number, data: VariablePayloadUpdate) => {
    if (!id) throw new Error('Variable ID is required');
    try {
      const response = await api.put(`/variables/${id}`, data);
      return response.data;
    } catch (e) {
      throw normalizeServerError(e);
    }
  },

  // Delete
  delete: async (id: string | number) => {
    if (!id) throw new Error('Variable ID is required');
    try {
      const response = await api.delete(`/variables/${id}`);
      return response.data;
    } catch (e) {
      throw normalizeServerError(e);
    }
  },

  // Bulk delete
  bulkDelete: async (ids: Array<number | string>) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('IDs are required');
    }
    try {
      const response = await api.post('/variables/bulk-delete', { ids });
      return response.data;
    } catch (e) {
      throw normalizeServerError(e);
    }
  },

  // Bulk status update
  bulkUpdateStatus: async (ids: Array<number | string>, status: Status) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('IDs are required');
    }
    if (!['active', 'inactive'].includes(status)) {
      throw new Error('Invalid status');
    }
    try {
      const response = await api.post('/variables/bulk-status', { ids, status });
      return response.data;
    } catch (e) {
      throw normalizeServerError(e);
    }
  },

  // Import file (optional convenience)
  importFile: async (file: File, tabId: string, skipDup = true) => {
    if (!file) throw new Error('File is required');
    if (!tabId) throw new Error('Tab ID is required');

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('tabId', tabId);
      fd.append('skipDup', String(skipDup));

      const res = await api.post(
        `/variables/import?tabId=${encodeURIComponent(tabId)}&skipDup=${skipDup ? '1' : '0'}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data;
    } catch (e) {
      throw normalizeServerError(e);
    }
  },
};
