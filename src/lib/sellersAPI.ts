// src/lib/sellerAPI.ts
import axios from "axios";

// const API_URL = "http://localhost:3000/api/sellers"; // backend ka base url
const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/sellers"; // backend ka base url

export const sellerAPI = {
  // Get all sellers
  getAll: async () => {
    console.log("⏳ [Before] Fetching all sellers...");
    const res = await axios.get(`${API_URL}/getSellers`);
    console.log("✅ [After] Sellers fetched successfully:", res.data.data?.length || 0);
    return res.data.data;
  },

  // Get seller by ID
  getById: async (id: number) => {
    console.log(`⏳ [Before] Fetching seller by ID: ${id}`);
    const res = await axios.get(`${API_URL}/getSellerById/${id}`);
    console.log("✅ [After] Seller fetched:", res.data.data);
    return res.data.data;
  },

  // Create new seller
  create: async (data: any) => {
    console.log("⏳ [Before] Creating seller:", data);
    const res = await axios.post(`${API_URL}/createSeller`, data);
    console.log("✅ [After] Seller created successfully:", res.data);
    return res.data;
  },

  // Update seller
  update: async (id: number, data: any) => {
    console.log(`⏳ [Before] Updating seller ID: ${id}`, data);
    const res = await axios.put(`${API_URL}/updateSeller/${id}`, data);
    console.log("✅ [After] Seller updated successfully:", res.data);
    return res.data;
  },

  // Delete seller
  delete: async (id: number) => {
    console.log(`⏳ [Before] Deleting seller ID: ${id}`);
    const res = await axios.delete(`${API_URL}/deleteSeller/${id}`);
    console.log("✅ [After] Seller deleted successfully:", res.data);
    return res.data;
  },
};
