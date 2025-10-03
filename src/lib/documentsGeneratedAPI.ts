// /src/lib/documentsGeneratedAPI.ts
import api from "./api";

export type GenStatus = "draft" | "created";

export type DocumentsGeneratedPayload = {
  template_id: number | string;
  name: string | null;
  description?: string | null;
  category?: string | null;
  content?: string | null;     // final HTML snapshot (optional for drafts)
  variables?: any | null;      // JSON object
  status?: GenStatus;          // 'draft' | 'created'
};

export const documentsGeneratedAPI = {
  // list
  getAll: async (params?: any) => {
    const res = await api.get("/documents-generated", { params });
    return res.data.data; // [{...}]
  },

  // fetch one
  getById: async (id: number | string) => {
    const res = await api.get(`/documents-generated/${id}`);
    return res.data.data; // {...}
  },

  // create one
  create: async (payload: DocumentsGeneratedPayload) => {
    const body = {
      template_id: payload.template_id ?? null,
      name: payload.name ?? null,
      description: payload.description ?? null,
      category: payload.category ?? null,
      content: payload.content ?? null,
      variables: payload.variables ?? null, // server CAST(? AS JSON)
      status: payload.status ?? "draft",
    };
    const res = await api.post("/documents-generated", body);
    return res.data.data; // => created row { id, ... }
  },

  // update (PATCH)
  update: async (id: number | string, payload: DocumentsGeneratedPayload) => {
    const body = {
      template_id: payload.template_id ?? null,
      name: payload.name ?? null,
      description: payload.description ?? null,
      category: payload.category ?? null,
      content: payload.content ?? null,
      variables: payload.variables ?? null,
      status: payload.status ?? "draft",
    };
    const res = await api.patch(`/documents-generated/${id}`, body);
    return res.data.data; // => updated row { ... }
  },

  // soft delete
  softDelete: async (id: number | string) => {
    const res = await api.post(`/documents-generated/${id}/soft-delete`);
    return res.data;
  },

  // restore
  restore: async (id: number | string) => {
    const res = await api.post(`/documents-generated/${id}/restore`);
    return res.data;
  },

  // hard delete
  hardDelete: async (id: number | string) => {
    const res = await api.delete(`/documents-generated/${id}`);
    return res.data;
  },
};
