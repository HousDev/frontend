import api from "./api";

export const documentsTemplateAPI = {
  getAll: async () => {
    const res = await api.get("/doctemplates/getall");
    return res.data.data;   // backend से सिर्फ array लौटाओ
  },

  getById: async (id: number | string) => {
    const res = await api.get(`/doctemplates/getbyid/${id}`);
    return res.data.data;
  },

  create: async (data: any) => {
    const res = await api.post("/doctemplates/create", data);
    return res.data.data || res.data; // जो भी backend दे
  },

  update: async (id: number | string, data: any) => {
    const res = await api.put(`/doctemplates/update/${id}`, data);
    return res.data;
  },

  delete: async (id: number | string) => {
    const res = await api.delete(`/doctemplates/delete/${id}`);
    return res.data;
  },
   // ⭐ नया method: increment usage
  useTemplate: async (id: number | string) => {
    const res = await api.post(`/doctemplates/${id}/use`);
    return res.data; // { success, message, data }
  },
};
