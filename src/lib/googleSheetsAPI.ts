// src/lib/googleSheetsAPI.ts

import { api } from "./api";

export const googleSheetsAPI = {
  importSheet: async (sheetUrl: string) => {
    const res = await api.post("/google-sheets/import", {
      sheetUrl,
    });
    return res.data;
  },

  validateSheet: async (sheetUrl: string) => {
    const res = await api.post("/google-sheets/validate-url", {
      sheetUrl,
    });
    return res.data;
  },
};