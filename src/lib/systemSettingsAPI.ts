// src/lib/systemSettingsAPI.ts

import { api } from "./api";

export const systemSettingsAPI = {
  // ✅ Get system settings
  getSettings: async () => {
        const response = await api.get("/system-settings");
        console.log("my all data systemSettingsAPI.ts",response.data)
    return response.data;
  },

  // ✅ Save / Update system settings (supports FormData)
  saveSettings: async (data: any) => {
    const response = await api.post("/system-settings", data);
    return response.data;
  },
};

export default systemSettingsAPI;
