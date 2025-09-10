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
    console.log("➡️ Creating new buyer with data:", data);
    const response = await api.post("/buyers/createBuyer", data);
    console.log("✅ Buyer created:", response.data);
    return response.data;
  },

  // Update buyer
  update: async (id: string, data: any) => {
    if (!id) throw new Error("Buyer ID is required");
    console.log(`➡️ Updating buyer ${id} with data:`, data);
    const response = await api.put(`/buyers/updateBuyer/${id}`, data);
    console.log("✅ Buyer updated:", response.data);
    return response.data;
  },

  // Delete buyer
  delete: async (id: string) => {
    if (!id) throw new Error("Buyer ID is required");
    console.log(`➡️ Deleting buyer with ID: ${id}`);
    const response = await api.delete(`/buyers/deleteBuyer/${id}`);
    console.log("✅ Buyer deleted:", response.data);
    return response.data;
  },
  // Bulk delete buyers
  bulkDelete: async (ids: string[], hard: boolean = false) => {
    if (!ids || ids.length === 0) throw new Error("Buyer IDs are required");
    console.log(`➡️ Bulk deleting buyers with IDs: ${ids.join(", ")}, hard: ${hard}`);

    const response = await api.post(`/buyers/bulk-delete`, {
      ids,
      hard,
    });

    console.log("✅ Buyers bulk deleted:", response.data);
    return response.data;
  },

// ✅ Import buyers (bulk insert from JSON array)
  import: async (buyers: any[]) => {
    if (!Array.isArray(buyers) || buyers.length === 0) {
      throw new Error("Buyers array is required for import");
    }
    console.log(`➡️ Importing ${buyers.length} buyers...`);
    const response = await api.post(`/buyers/bulk-import`, buyers);
    console.log("✅ Buyers import result:", response.data);
    return response.data;
  },


};




// without hit of api we can test the buyerAPI like this:

// useEffect(() => {
//   const fetchBuyers = async () => {
//     try {
//       const buyers = await buyerAPI.getAll(); // calling the API
//       console.log("Buyers in component:", buyers);
//     } catch (err) {
//       console.error("Error fetching buyers:", err);
//     }
//   };

//   fetchBuyers();
// }, []);