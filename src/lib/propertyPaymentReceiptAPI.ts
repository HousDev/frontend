// propertyPaymentReceiptAPI.ts
import { api } from "./api";

export const propertyPaymentReceiptAPI = {
  getAll: async () => (await api.get("/receipts/all")).data,

//   list: async (params: any = {}) =>
    // (await api.get("/receipts", { params })).data,

  getById: async (id: string | number) => {
    if (!id) throw new Error("Receipt ID is required");
    return (await api.get(`/receipts/id/${id}`)).data;
  },

  getByReceiptId: async (receipt_id: string) => {
    if (!receipt_id) throw new Error("Receipt ID string is required");
    return (await api.get(`/receipts/rid/${receipt_id}`)).data;
  },

  create: async (data: any) => (await api.post("/receipts", data)).data,

  update: async (id: string | number, data: any) => {
    if (!id) throw new Error("Receipt numeric ID is required");
    return (await api.patch(`/receipts/${id}`, data)).data;
  },

  delete: async (id: string | number) => {
    if (!id) throw new Error("Receipt numeric ID is required");
    return (await api.delete(`/receipts/${id}`)).data;
  },

  // only keep if you actually add this route on the server (see #2)
  bulkDelete: async (ids: (string | number)[], hard = false) => {
    if (!ids?.length) throw new Error("Receipt IDs are required");
    return (await api.post(`/receipts/bulk-delete`, { ids, hard })).data;
  },
};
