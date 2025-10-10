// src/lib/homeHeroAPI.ts
import { api } from "./api";

export type PhotoPreview = {
  url: string;           // preview or server URL
  name: string;
  size: number;
  file?: File;           // <- IMPORTANT: attach File for upload
};

export type HeroBlock = {
  id: string | number;
  title: string;
  description: string;
  photos: PhotoPreview[];
  created_at: string; // ISO
  updated_at: string; // ISO
};

// normalize helpers
function normalizeRow(r: any): HeroBlock {
  const id = r?.id ?? r?.ID ?? r?._id ?? r?.uuid;
  const created_at = r?.created_at ?? r?.createdAt ?? r?.created_on ?? "";
  const updated_at = r?.updated_at ?? r?.updatedAt ?? r?.updated_on ?? created_at ?? "";
  return {
    id,
    title: r?.title ?? "",
    description: r?.description ?? "",
    photos: Array.isArray(r?.photos) ? r.photos : [],
    created_at,
    updated_at,
  };
}
function pickRows(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (data.item) return [data.item];
  if (data.row) return [data.row];
  return [];
}

const homeHeroAPI = {
  async list(): Promise<HeroBlock[]> {
    const { data } = await api.get("/home-hero");
    return pickRows(data).map(normalizeRow);
  },

  async getById(id: string | number): Promise<HeroBlock> {
    const { data } = await api.get(`/home-hero/${id}`);
    const rows = pickRows(data);
    if (!rows.length) throw new Error("Not found");
    return normalizeRow(rows[0]);
  },

  // CREATE with multipart/form-data (photos[])
  async create(payload: Omit<HeroBlock, "id" | "created_at" | "updated_at">) {
    const fd = new FormData();
    fd.append("title", payload.title);
    fd.append("description", payload.description);

    (payload.photos || []).forEach((p, i) => {
      if (p.file) fd.append("photos", p.file, p.name || `photo-${i}.jpg`);
    });

    // ❗ DO NOT manually set Content-Type; axios sets boundary
    const { data } = await api.post("/home-hero", fd);
    const rows = pickRows(data);
    const row = rows[0] ?? data.row ?? data.item ?? data;
    return normalizeRow(row);
  },

  // UPDATE supports mixed: keep existing URLs + upload new files
  async update(
    id: string | number,
    payload: Partial<Omit<HeroBlock, "id" | "created_at" | "updated_at">>
  ) {
    const hasPhotos = Array.isArray(payload.photos);

    // If photos not provided, fall back to JSON PUT (title/description only)
    if (!hasPhotos) {
      const { data } = await api.put(`/home-hero/${id}`, {
        title: payload.title,
        description: payload.description,
      });
      const rows = pickRows(data);
      const row = rows[0] ?? data.row ?? data.item ?? data;
      return normalizeRow(row);
    }

    // Multipart PUT (if server blocks PUT multipart, switch to POST + _method)
    const fd = new FormData();
    if (payload.title != null) fd.append("title", payload.title);
    if (payload.description != null) fd.append("description", payload.description);

    const keep: PhotoPreview[] = [];
    (payload.photos || []).forEach((p, i) => {
      if (p.file) {
        fd.append("photos", p.file, p.name || `photo-${i}.jpg`);
      } else {
        keep.push({ url: p.url, name: p.name, size: p.size });
      }
    });

    fd.append("existingPhotos", JSON.stringify(keep));

    const { data } = await api.put(`/home-hero/${id}`, fd);
    const rows = pickRows(data);
    const row = rows[0] ?? data.row ?? data.item ?? data;
    return normalizeRow(row);
  },

  async remove(id: string | number) {
    const { data } = await api.delete(`/home-hero/${id}`);
    return data;
  },
};

export default homeHeroAPI;
