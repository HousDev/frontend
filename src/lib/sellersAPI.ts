// src/lib/sellerAPI.ts
import { api } from "./api"; // 🔥 Use same api instance as buyers for consistency

export const sellerAPI = {
  // ✅ Get all sellers
  getAll: async () => {
    const response = await api.get("/sellers/getSellers");
    return response.data.data;
  },

  // ✅ Get seller by ID
  getById: async (id: string) => {
    if (!id) throw new Error("Seller ID is required");
   
    const response = await api.get(`/sellers/getSellerById/${id}`);
    
    return response.data;
  },

  // ✅ Create seller
  create: async (data: any) => {
    if (!data?.name) throw new Error("Seller name is required");
    
    const response = await api.post("/sellers/createSeller", data);
    return response.data;
  },

  // ✅ Update seller
  update: async (id: string, data: any) => {
    if (!id) throw new Error("Seller ID is required");
   
    const response = await api.put(`/sellers/updateSeller/${id}`, data);
   
    return response.data;
  },

  // ✅ Delete seller
  delete: async (id: string) => {
    if (!id) throw new Error("Seller ID is required");
   
    const response = await api.delete(`/sellers/deleteSeller/${id}`);

    return response.data;
  },

  // ✅ Bulk delete sellers
  bulkDelete: async (ids: string[], hard: boolean = false) => {
    if (!ids || ids.length === 0) throw new Error("Seller IDs are required");


    const response = await api.post(`/sellers/bulk-delete`, { ids, hard });
    return response.data;
  },

  // ✅ Import sellers (bulk insert from JSON array)
  import: async (sellers: any[]) => {
    if (!Array.isArray(sellers) || sellers.length === 0) {
      throw new Error("Sellers array is required for import");
    }
    const response = await api.post(`/sellers/bulk-import`, sellers);

    return response.data;
  },
};
