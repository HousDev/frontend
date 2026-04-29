// import { api } from "./api"; // assuming same axios instance as before

// export const societyAPI = {
//   // Get all societies
//   getAllSocieties: async () => {
//     const response = await api.get("/societies/get-all");
//     return response.data;
//   },

//   // Get society by ID
//   getSocietyById: async (id) => {
//     const response = await api.get(`/societies/getById/${id}`);
//     return response.data;
//   },

//   // Create new society
//   createSociety: async (data) => {
//     const response = await api.post("/societies/create", data);
//     return response.data;
//   },

//   // Update society
//   updateSociety: async (id, data) => {
//     const response = await api.put(`/societies/update/${id}`, data);
//     return response.data;
//   },

//   // Delete society
//   deleteSociety: async (id) => {
//     const response = await api.delete(`/societies/delete/${id}`);
//     return response.data;
//   },

//   // Get societies by pincode
//   getSocietiesByPincode: async (pincode) => {
//     const response = await api.get(`/societies/get-all?pincode=${pincode}`);
//     return response.data;
//   },

//   // Get societies by city
//   getSocietiesByCity: async (city) => {
//     const response = await api.get(`/societies/get-all?city=${city}`);
//     return response.data;
//   },

//   // Search societies
//   searchSocieties: async (searchTerm) => {
//     const response = await api.get(`/societies/get-all?search=${searchTerm}`);
//     return response.data;
//   },

//   // Bulk create societies
//   bulkCreateSocieties: async (societies) => {
//     const response = await api.post("/societies/bulk-create", { societies });
//     return response.data;
//   },

//   // Export societies to CSV
//   exportSocieties: async () => {
//     const response = await api.get("/societies/export", {
//       responseType: "blob",
//     });
//     return response.data;
//   },

//   // Import societies from CSV
//   importSocieties: async (societies) => {
//     const response = await api.post("/societies/import", { societies });
//     return response.data;
//   },
// };


import { api } from "./api"; // assuming same axios instance as before

export const societyAPI = {
  // Get all societies
  getAllSocieties: async () => {
    const response = await api.get("/societies/get-all");
    return response.data;
  },

  // Get society by ID
  getSocietyById: async (id) => {
    const response = await api.get(`/societies/getById/${id}`);
    return response.data;
  },

  // Get society by ID or Name (NEW METHOD for auto-fill)
  getSocietyByIdentifier: async (identifier) => {
    const response = await api.get(`/societies/get-by-identifier/${identifier}`);
    return response.data;
  },

  // Create new society
  createSociety: async (data) => {
    const response = await api.post("/societies/create", data);
    return response.data;
  },

  // Update society
  updateSociety: async (id, data) => {
    const response = await api.put(`/societies/update/${id}`, data);
    return response.data;
  },

  // Delete society
  deleteSociety: async (id) => {
    const response = await api.delete(`/societies/delete/${id}`);
    return response.data;
  },

  // Get societies by pincode
  getSocietiesByPincode: async (pincode) => {
    const response = await api.get(`/societies/get-all?pincode=${pincode}`);
    return response.data;
  },

  // Get societies by city
  getSocietiesByCity: async (city) => {
    const response = await api.get(`/societies/get-all?city=${city}`);
    return response.data;
  },

  // Search societies
  searchSocieties: async (searchTerm) => {
    const response = await api.get(`/societies/get-all?search=${searchTerm}`);
    return response.data;
  },

  // Bulk create societies
  bulkCreateSocieties: async (societies) => {
    const response = await api.post("/societies/bulk-create", { societies });
    return response.data;
  },

  // Export societies to CSV
  exportSocieties: async () => {
    const response = await api.get("/societies/export", {
      responseType: "blob",
    });
    return response.data;
  },

  // Import societies from CSV
  importSocieties: async (societies) => {
    const response = await api.post("/societies/import", { societies });
    return response.data;
  },
};