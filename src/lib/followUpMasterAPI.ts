import { api } from './api';
import type { MasterData } from './types';

export const followUpMasterAPI = {
  // Get all master data across all tables
  getAllMasterData: async (): Promise<MasterData | null> => {
    try {
      const response = await api.get('/followup-masters');
      if (response.data && response.data.success && response.data.data) {
        return response.data.data as MasterData;
      }
      return null;
    } catch (error) {
      console.warn('Backend followup-masters not available, falling back to local data:', error);
      return null;
    }
  },

  // Get records for a specific table
  getTableData: async (table: string): Promise<any[] | null> => {
    try {
      const response = await api.get(`/followup-masters/${table}`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to fetch table ${table} from backend:`, error);
      return null;
    }
  },

  // Upsert record into table
  upsertItem: async (table: string, record: Record<string, unknown>): Promise<any | null> => {
    try {
      const response = await api.post(`/followup-masters/${table}`, record);
      if (response.data && response.data.success) {
        return response.data.data || record;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to upsert to ${table} on backend:`, error);
      return null;
    }
  },

  // Update record by ID in table
  updateItem: async (table: string, id: string, patch: Record<string, unknown>): Promise<boolean> => {
    try {
      const response = await api.put(`/followup-masters/${table}/${encodeURIComponent(id)}`, patch);
      return Boolean(response.data && response.data.success);
    } catch (error) {
      console.warn(`Failed to update ${table}/${id} on backend:`, error);
      return false;
    }
  },

  // Delete record by ID from table
  deleteItem: async (table: string, id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/followup-masters/${table}/${encodeURIComponent(id)}`);
      return Boolean(response.data && response.data.success);
    } catch (error) {
      console.warn(`Failed to delete ${table}/${id} on backend:`, error);
      return false;
    }
  },

  // Delete entire sequence by name
  deleteSequence: async (sequenceName: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/followup-masters/sequence/${encodeURIComponent(sequenceName)}`);
      return Boolean(response.data && response.data.success);
    } catch (error) {
      console.warn(`Failed to delete sequence ${sequenceName} on backend:`, error);
      return false;
    }
  },

  // Bulk import module backup
  importModule: async (tables: Record<string, any[]>): Promise<any | null> => {
    try {
      const response = await api.post('/followup-masters/import-module', { tables });
      if (response.data && response.data.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.warn('Failed to bulk import module on backend:', error);
      return null;
    }
  },
};
