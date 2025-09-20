// src/lib/buyerTransferAPI.ts
import { api } from "./api";

export const buyerTransferAPI = {
  // ✅ Transfer lead → buyer
  transferToBuyer: async (data: {
    leadId: string | number;
    overrides?: Record<string, any>;
    createdBy?: number | string;
  }) => {
    const response = await api.post("/transfer-to-buyer", data);
    return response.data;
  },

 
};

export default buyerTransferAPI;
