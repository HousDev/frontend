
import { api } from "./api";

// Master Data API Service
export const masterDataAPI = {
  // Master Types
  getAllMasterTypes: async (tabId: string) => {
    
    const response = await api.get(`/masters/get-all/${tabId}`);
   
    return response.data;
  },

  createMasterType: async (data: { tabId: string; name: string; status: string }) => {
   
    const response = await api.post('/masters', data);
   
    return response.data;
  },  

  getMasterType: async (id: string) => {
    
    const response = await api.get(`/masters/type/${id}`);
   
    return response.data;
  },

  updateMasterType: async (id: string, data: { name: string; status: string }) => {
   
    const response = await api.put(`/masters/type/update/${id}`, data);
    
    return response.data;
  },

  deleteMasterType: async (id: string) => {
   
    const response = await api.delete(`/masters/type/${id}`);
   
    return response.data;
  },

  exportMasterTypes: async (tabId: string) => {
   
    const response = await api.get(`/masters/export/${tabId}`, {
      responseType: 'blob'
    });
   
    return response.data;
  },

   // ✅ IMPORT MASTER TYPES - Check URL
  importMasterTypes: async (tabId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/masters/import/${tabId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Master Values
  getMasterValues: async (masterTypeId: string) => {
    
    const response = await api.get(`masters/values/${masterTypeId}`);
    
    return response.data; 
  },

 createMasterValue: async (
  masterTypeId: string,
  data: { value: string; status?: string }
) => {
  if (!masterTypeId) {
    throw new Error("masterTypeId is required");
  }
  if (!data?.value) {
    throw new Error("Value is required");
  }

  const payload = {
    value: data.value,
    status: data.status || "Active"
  };

  

  const response = await api.post(`/masters/values/${masterTypeId}`, payload);

  
  return response.data;
},


  updateMasterValue: async (id: string, data: { value: string; status: string }) => {
    
    const response = await api.put(`/masters/values/${id}`, data);
    
    return response.data;
  },

  deleteMasterValue: async (id: string) => {
  
    const response = await api.delete(`/masters/values/${id}`);
   
    return response.data;
  },

  exportMasterValues: async (masterTypeId: string) => {
    
    const response = await api.get(`/masters/values/export/${masterTypeId}`, {
      responseType: 'blob'
    });
   
    return response.data;
  },

  importMasterValues: async (masterTypeId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/masters/values/import/${masterTypeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

