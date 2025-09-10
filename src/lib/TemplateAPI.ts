// src/lib/TemplateAPI.ts
import { api } from "./api";

// Template Management API
export const TemplateAPI = {
  // Add new template
  add: async (payload: any) => {
    const response = await api.post("/templates/add", payload);
    return response.data;
  },

  // Get all templates
  getAll: async () => {
    const response = await api.get("/templates/get-all");
    return response.data;
  },

  // Get template by id
  getById: async (id: string) => {
    const response = await api.get("/templates/get/id", {
      params: { id },
    });
    return response.data;
  },

  // Update template
  update: async (id: string, payload: any) => {
    const response = await api.put(`/templates/update/${id}`, payload);
    return response.data;
  },

  // Delete template
  delete: async (id: string) => {
    const response = await api.delete(`/templates/delete/${id}`);
    return response.data;
  },
};

export const aiClient = {
  generateTemplate: async (payload: Record<string, any>, baseURLOverride?: string) => {
    // if you have a pickClient helper use that, otherwise use api
    const client = baseURLOverride ? /* your picking logic */ api : api;
    const res = await client.post('/ai/generate-template', payload);
    return res.data; // { content: "..." }
  },
};