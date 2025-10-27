import { api } from "./api";

export const razorpayIntegrationAPI = {
  // ✅ Get Razorpay integration config
  getIntegration: async () => {
    try {
      const res = await api.get('/razorpay-integration/get');
      
      return res;
    } catch (err) {
      console.error("❌ [Razorpay] Get Integration Error:", err);
      throw err;
    }
  },

  // ✅ Save or update integration keys
  saveIntegration: async (data: { keyId: string; keySecret: string; webhookSecret?: string }) => {
    try {
      const res = await api.post('/razorpay-integration/save', data);
    
      return res;
    } catch (err) {
      console.error("❌ [Razorpay] Save Integration Error:", err);
      throw err;
    }
  },

  // ✅ Toggle active/inactive
  toggleIntegration: async (data: { active: boolean }) => {
    try {
      const res = await api.post('/razorpay-integration/toggle', data);
 
      return res;
    } catch (err) {
      console.error("❌ [Razorpay] Toggle Integration Error:", err);
      throw err;
    }
  },

  // ✅ Create Razorpay order
  createOrder: async (data: { amount: number; currency?: string; receipt?: string }) => {
    try {
      const res = await api.post('/razorpay-integration/create-order', data);
  
      return res;
    } catch (err) {
      console.error("❌ [Razorpay] Create Order Error:", err);
      throw err;
    }
  },




};
