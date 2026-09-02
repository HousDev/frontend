// src/lib/systemSettingsAPI.ts
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

  // Private POST
  saveSettings: async (data: any) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await api.post("/system-settings", data, { headers });
    return response.data;
  },
};

export default systemSettingsAPI;
