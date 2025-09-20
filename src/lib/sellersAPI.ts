// src/lib/sellerAPI.ts
import { api } from "./api"; // 🔥 Use same api instance as buyers for consistency

export const sellerAPI = {
  // ✅ Get all sellers
  getAll: async () => {
    console.log("⏳ Fetching all sellers...");
    const response = await api.get("/sellers/getSellers");
    console.log("✅ Sellers fetched:", response.data?.data?.length || 0);
    return response.data.data;
  },

  // ✅ Get seller by ID
  getById: async (id: string) => {
    if (!id) throw new Error("Seller ID is required");
    console.log(`⏳ Fetching seller by ID: ${id}`);
    const response = await api.get(`/sellers/getSellerById/${id}`);
    console.log("✅ Seller fetched:", response.data.data);
    return response.data.data;
  },

  // ✅ Create seller
  create: async (data: any) => {
    if (!data?.name) throw new Error("Seller name is required");
    console.log("➡️ Creating new seller with data:", data);
    const response = await api.post("/sellers/createSeller", data);
    console.log("✅ Seller created:", response.data);
    return response.data;
  },

  // ✅ Update seller
  update: async (id: string, data: any) => {
    if (!id) throw new Error("Seller ID is required");
    console.log(`➡️ Updating seller ${id} with data:`, data);
    const response = await api.put(`/sellers/updateSeller/${id}`, data);
    console.log("✅ Seller updated:", response.data);
    return response.data;
  },

  // ✅ Delete seller
  delete: async (id: string) => {
    if (!id) throw new Error("Seller ID is required");
    console.log(`➡️ Deleting seller with ID: ${id}`);
    const response = await api.delete(`/sellers/deleteSeller/${id}`);
    console.log("✅ Seller deleted:", response.data);
    return response.data;
  },

  // ✅ Bulk delete sellers
  bulkDelete: async (ids: string[], hard: boolean = false) => {
    if (!ids || ids.length === 0) throw new Error("Seller IDs are required");
    console.log(`➡️ Bulk deleting sellers: ${ids.join(", ")}, hard: ${hard}`);

    const response = await api.post(`/sellers/bulk-delete`, { ids, hard });
    console.log("✅ Sellers bulk deleted:", response.data);
    return response.data;
  },

  // ✅ Import sellers (bulk insert from JSON array)
  import: async (sellers: any[]) => {
    if (!Array.isArray(sellers) || sellers.length === 0) {
      throw new Error("Sellers array is required for import");
    }
    console.log(`➡️ Importing ${sellers.length} sellers...`);
    const response = await api.post(`/sellers/bulk-import`, sellers);
    console.log("✅ Sellers import result:", response.data);
    return response.data;
  },
};
