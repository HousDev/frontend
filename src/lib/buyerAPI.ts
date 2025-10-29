import { api } from "./api";

export const buyerAPI = {
  // Get all buyers
  getAll: async () => {

    const response = await api.get("/buyers/get-all-buyers");
    return response.data;
  },

  // Get buyer by ID
  getById: async (id: string) => {
    if (!id) throw new Error("Buyer ID is required");
    const response = await api.get(`/buyers/getBuyerById/${id}`);
    return response.data;
  },

  // Create buyer
  create: async (data: any) => {
    if (!data?.name) throw new Error("Buyer name is required");
   
    const response = await api.post("/buyers/createBuyer", data);
    
    return response.data;
  },

  // Update buyer
  update: async (id: string, data: any) => {
    if (!id) throw new Error("Buyer ID is required");
   
    const response = await api.put(`/buyers/updateBuyer/${id}`, data);
  
    return response.data;
  },

  // Delete buyer
  delete: async (id: string) => {
    if (!id) throw new Error("Buyer ID is required");
   
    const response = await api.delete(`/buyers/deleteBuyer/${id}`);
  
    return response.data;
  },
  // Bulk delete buyers
  bulkDelete: async (ids: string[], hard: boolean = false) => {
    if (!ids || ids.length === 0) throw new Error("Buyer IDs are required");
   

    const response = await api.post(`/buyers/bulk-delete`, {
      ids,
      hard,
    });

    
    return response.data;
  },

// ✅ Import buyers (bulk insert from JSON array)
importBuyers: async (buyers: any[]) => {
  

  // Backend expects: { buyers: [...] }
  const payload = { buyers };

  try {
    const response = await api.post(`/buyers/bulk-import`, payload, {
      timeout: 300000, // 5 minutes for large imports
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err: any) {
    // Make timeout errors obvious in UI/logs
    if (err?.code === "ECONNABORTED") {
      throw new Error("Import timed out. Try again or reduce the batch size.");
    }
    throw err;
  }
},

   /* ============================
     🔹 Assign Executive (Single)
  ============================ */
  assignExecutive: async (buyerId: string, executiveId: string | null) => {
    if (!buyerId) throw new Error("Buyer ID is required");
    const response = await api.post(`/buyers/assign-executive/${buyerId}`, {
      executive_id: executiveId || null,
    });
    return response.data;
  },

  /* ============================
     🔹 Bulk Assign Executive
  ============================ */
  bulkAssignExecutive: async (buyerIds: string[], executiveId: string | Number, onlyEmpty: boolean = false) => {
    if (!Array.isArray(buyerIds) || buyerIds.length === 0)
      throw new Error("Buyer IDs array is required");

    const response = await api.post(`/buyers/bulk/assign-executive`, {
      buyer_ids: buyerIds,
      executive_id: executiveId || null,
      only_empty: onlyEmpty,
    });

    return response.data;
  },
// Update single lead field
updateLeadField: async (buyerId: string, field: string, value: any) => {
  const response = await api.post(`/buyers/updateLeadField/${buyerId}`, { field, value });
  return response.data;
},

// Bulk update lead field
bulkUpdateLeadField: async (buyerIds: string[], field: string, value: any, onlyEmpty: boolean = false) => {
  const response = await api.post(`/buyers/bulkUpdateLeadField`, { buyer_ids: buyerIds, field, value, only_empty: onlyEmpty });
  return response.data;
},


};






