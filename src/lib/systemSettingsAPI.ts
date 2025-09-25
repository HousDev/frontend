// // src/lib/systemSettingsAPI.ts

// import { api } from "./api";

// export const systemSettingsAPI = {
//   // ✅ Get system settings
//   getSettings: async () => {
//         const response = await api.get("/system-settings");
//         console.log("my all data systemSettingsAPI.ts",response.data)
//     return response.data;
//   },

//   // ✅ Save / Update system settings (supports FormData)
//   saveSettings: async (data: any) => {
//     const response = await api.post("/system-settings", data);
//     return response.data;
//   },
// };

// export default systemSettingsAPI;


import { api } from "./api";

export const systemSettingsAPI = {
  // Public GET
  getSettings: async () => {
    // try public first
    try {
      const res = await api.get("/public/system-settings");
      return res.data;
    } catch (e) {
      // optional fallback (jab tum login me ho)
      const res2 = await api.get("/system-settings");
      return res2.data;
    }
  },

  // Private POST (unchanged)
  saveSettings: async (data: any) => {
    const response = await api.post("/system-settings", data);
    return response.data;
  },
};

export default systemSettingsAPI;
