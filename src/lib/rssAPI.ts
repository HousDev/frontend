// src/lib/rssAPI.ts
import { api } from "./api";

/** Optional: light types */
export type RSSSourceId = string | number;

export const rssAPI = {
  /* CRUD */
  getAll: async () => {
    const { data } = await api.get("/rss-sources");
    return data; // { success, data: RSSSource[] }
  },

  getById: async (id: RSSSourceId) => {
    if (id === undefined || id === null) throw new Error("RSS Source ID is required");
    const { data } = await api.get(`/rss-sources/${id}`);
    return data; // { success, data: RSSSource }
  },

  create: async (body: any) => {
    if (!body?.name || !body?.url) throw new Error("Name and URL are required");
    const { data } = await api.post("/rss-sources", body);
    return data; // { success, data: RSSSource }
  },

  update: async (id: RSSSourceId, body: any) => {
    if (id === undefined || id === null) throw new Error("RSS Source ID is required");
    const { data } = await api.put(`/rss-sources/${id}`, body);
    return data; // { success, data: RSSSource }
  },

  delete: async (id: RSSSourceId) => {
    if (id === undefined || id === null) throw new Error("RSS Source ID is required");
    const { data } = await api.delete(`/rss-sources/${id}`);
    return data; // { success: true }
  },

  toggle: async (id: RSSSourceId) => {
    if (id === undefined || id === null) throw new Error("RSS Source ID is required");
    const { data } = await api.patch(`/rss-sources/${id}/toggle`);
    return data; // { success, data: RSSSource }
  },

  /* ---- Existing "sync" endpoints (keep if already wired) ---- */
  // If your backend uses these to fetch+insert, keep using them.
  // Otherwise prefer scan/import below.
  syncOne: async (id: RSSSourceId) => {
    if (id === undefined || id === null) throw new Error("RSS Source ID is required");
    const { data } = await api.post(`/rss-sources/${id}/sync`);
    return data; // { success, data, meta: { fetched, inserted } }
  },

  syncAll: async () => {
    const { data } = await api.post(`/rss-sources/sync-all`);
    return data; // { success, results: [...] }
  },

  validate: async (url: string) => {
    if (!url) throw new Error("URL is required");
    const { data } = await api.get(`/rss-sources/validate`, { params: { url } });
    return data; // { success, valid, message? }
  },

  proxy: async (url: string, limit: number = 10) => {
    if (!url) throw new Error("URL is required");
    const { data } = await api.get(`/rss-sources/proxy`, { params: { url, limit } });
    return data; // { success, items: [...] }
  },

  /* ---- NEW: two-step flow ---- */
  // 1) SCAN => no DB writes, returns newCount + previews
  scan: async (id: RSSSourceId) => {
    if (id === undefined || id === null) throw new Error("RSS Source ID is required");
    const { data } = await api.post(`/rss-sources/${id}/scan`);
    return data; // { success, data: { newCount, previews, lastSync } }
  },

  // 2) IMPORT (click) => writes to DB as DRAFT only
  importDrafts: async (id: RSSSourceId) => {
    if (id === undefined || id === null) throw new Error("RSS Source ID is required");
    const { data } = await api.post(`/rss-sources/${id}/import`);
    return data; // { success, data: { insertedCount, inserted }, message }
  },
};
