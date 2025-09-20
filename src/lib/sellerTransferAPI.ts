// src/lib/sellerTransferAPI.ts
import { api } from "./api";

export const sellerTransferAPI = {
  transferToSeller: async (data: {
    leadId: string | number;
    overrides?: Record<string, any>;
    createdBy?: number | string;
  }) => {
    const response = await api.post("/transfer-to-seller", data);
    return response.data;
  },
};

export default sellerTransferAPI;
