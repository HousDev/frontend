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

//   // Get society by ID or Name (NEW METHOD for auto-fill)
//   getSocietyByIdentifier: async (identifier) => {
//     const response = await api.get(`/societies/get-by-identifier/${identifier}`);
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

// lib/societyAPI.ts
import { api } from "./api";

export const societyAPI = {
  // Get all societies
  getAllSocieties: async () => {
    const response = await api.get("/societies/get-all");
    return response.data;
  },

  // Get society by ID
  getSocietyById: async (id: string) => {
    const response = await api.get(`/societies/getById/${id}`);
    return response.data;
  },

  // Get society by ID or Name (for auto-fill)
  getSocietyByIdentifier: async (identifier: string) => {
    const response = await api.get(`/societies/get-by-identifier/${identifier}`);
    return response.data;
  },

  // Create new society
  createSociety: async (data: any) => {
    const response = await api.post("/societies/create", data);
    return response.data;
  },

  // Update society
  updateSociety: async (id: string, data: any) => {
    const response = await api.put(`/societies/update/${id}`, data);
    return response.data;
  },

  // Delete society
  deleteSociety: async (id: string) => {
    const response = await api.delete(`/societies/delete/${id}`);
    return response.data;
  },

  // Get societies by pincode
  getSocietiesByPincode: async (pincode: string) => {
    const response = await api.get(`/societies/get-all?pincode=${pincode}`);
    return response.data;
  },

  // Get societies by city
  getSocietiesByCity: async (city: string) => {
    const response = await api.get(`/societies/get-all?city=${city}`);
    return response.data;
  },

  // Search societies
  searchSocieties: async (searchTerm: string) => {
    const response = await api.get(`/societies/get-all?search=${searchTerm}`);
    return response.data;
  },

  // Bulk create societies
  bulkCreateSocieties: async (societies: any[]) => {
    const response = await api.post("/societies/bulk-create", { societies });
    return response.data;
  },

  // Export societies to Excel
  exportSocieties: async () => {
    const response = await api.get("/societies/export", {
      responseType: "blob",
    });
    return response.data;
  },

  // 🆕 Import societies from file (Excel/CSV)
  importSocieties: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/societies/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // ============================================
  // 🆕 IMAGE UPLOAD METHODS
  // ============================================

  // 🆕 Upload images for a society
  uploadSocietyImages: async (societyId: string, formData: FormData) => {
    const response = await api.post(`/societies/${societyId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 🆕 Get all images for a society
  getSocietyImages: async (societyId: string) => {
    const response = await api.get(`/societies/${societyId}/images`);
    return response.data;
  },

  // 🆕 Delete a specific image from a society
  deleteSocietyImage: async (societyId: string, imageId: string) => {
    const response = await api.delete(`/societies/${societyId}/images/${imageId}`);
    return response.data;
  },

  // 🆕 Get societies with images (for display)
  getSocietiesWithImages: async () => {
    const response = await api.get("/societies/get-all-with-images");
    return response.data;
  },

  // 🆕 Upload single image for a society
  uploadSocietyImage: async (societyId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/societies/${societyId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 🆕 Update society with image URLs (for edit)
  updateSocietyImages: async (societyId: string, imageUrls: string[]) => {
    const response = await api.put(`/societies/${societyId}/images`, { imageUrls });
    return response.data;
  },

  // 🆕 Get society by name with images
  getSocietyByNameWithImages: async (societyName: string) => {
    const response = await api.get(`/societies/get-by-name/${encodeURIComponent(societyName)}`);
    return response.data;
  },
};