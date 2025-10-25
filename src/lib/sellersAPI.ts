// src/lib/sellerAPI.ts
import { api } from "./api"; // 🔥 Use shared instance for consistency

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

bulkDelete: async (ids: (string | number)[]) => {
  const { data } = await api.post("/sellers/hard-delete", { ids });
  return data;
},


  // ✅ Bulk import sellers
  importSellers: async (sellers: any[]) => {
    const response = await api.post(`/sellers/bulk-import`, sellers);
    return response.data;
  },

  // ✅ Bulk assign executive
  bulkAssignExecutive: async (
    sellerIds: (string | number)[],
    executiveId: number | null,
    onlyEmpty = false
  ) => {
    if (!Array.isArray(sellerIds) || !sellerIds.length)
      throw new Error("Seller IDs are required");
    const response = await api.post(`/sellers/bulk/assign-executive`, {
      sellerIds,
      executiveId,
      onlyEmpty,
    });
    return response.data;
  },

  // ✅ Update single lead field (stage, status, priority, is_active, leadType)
  updateLeadField: async (id: string | number, field: string, value: any) => {
    if (!id) throw new Error("Seller ID is required");
    if (!field) throw new Error("Field name is required");
    const response = await api.post(`/sellers/${id}/lead-field`, { field, value });
    return response.data;
  },

  // ✅ Bulk update lead field
  bulkUpdateLeadField: async (
    sellerIds: (string | number)[],
    field: string,
    value: any,
    onlyEmpty = false
  ) => {
    if (!Array.isArray(sellerIds) || !sellerIds.length)
      throw new Error("Seller IDs are required");
    const response = await api.post(`/sellers/bulk/lead-field`, {
      sellerIds,
      field,
      value,
      onlyEmpty,
    });
    return response.data;
  },
};

export default sellerAPI;
