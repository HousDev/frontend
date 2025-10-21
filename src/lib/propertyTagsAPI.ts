// src/lib/propertyTagsAPI.ts
import { api } from "./api";

/** Row returned by backend */
export type PropertyTagsRow = {
  property_id: number;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
};

export type ApiOk<T> = { success: true; data: T };
export type ApiErr = { success: false; message: string };
export type ApiRes<T> = ApiOk<T> | ApiErr;

/* Small helper so callers get plain data or throw on error */
async function unwrap<T>(p: Promise<{ data: ApiRes<T> }>): Promise<T> {
  const { data } = await p;
  if ((data as ApiErr).success === false) {
    throw new Error((data as ApiErr).message || "Request failed");
  }
  return (data as ApiOk<T>).data;
}

/** Public API */
export const propertyTagsAPI = {
  /** GET /api/property-tags/getall -> list of rows */
  async getAll(): Promise<PropertyTagsRow[]> {
    return unwrap<PropertyTagsRow[]>(api.get("/property-tags/getall"));
  },

  /** GET /api/property-tags/known -> unique tags universe (for dropdowns) */
  async getKnown(): Promise<string[]> {
    return unwrap<string[]>(api.get("/property-tags/known"));
  },

  /** GET /api/property-tags/:id -> one row (creates none if missing) */
  async getById(propertyId: number | string): Promise<PropertyTagsRow> {
    return unwrap<PropertyTagsRow>(api.get(`/property-tags/${propertyId}`));
  },

  /** PUT /api/property-tags/:id { tags, updatedBy? } -> replace all tags */
  async replace(propertyId: number | string, tags: string[], updatedBy = "User"): Promise<PropertyTagsRow> {
    return unwrap<PropertyTagsRow>(api.put(`/property-tags/${propertyId}`, { tags, updatedBy }));
  },

  /** POST /api/property-tags/:id/add { tags, updatedBy? } -> add (merge unique) */
  async add(propertyId: number | string, tags: string[], updatedBy = "User"): Promise<PropertyTagsRow> {
    return unwrap<PropertyTagsRow>(api.post(`/property-tags/${propertyId}/add`, { tags, updatedBy }));
  },

  /** POST /api/property-tags/:id/remove { tags, updatedBy? } -> remove subset */
  async remove(propertyId: number | string, tags: string[], updatedBy = "User"): Promise<PropertyTagsRow> {
    return unwrap<PropertyTagsRow>(api.post(`/property-tags/${propertyId}/remove`, { tags, updatedBy }));
  },

  /** DELETE /api/property-tags/:id -> delete row for a property */
  async deleteRow(propertyId: number | string): Promise<{ ok: boolean }> {
    return unwrap<{ ok: boolean }>(api.delete(`/property-tags/${propertyId}`));
  },

  /** DELETE /api/property-tags/tags/:tag -> delete a tag from ALL properties */
  async deleteTagEverywhere(tag: string): Promise<{ changed: number }> {
    return unwrap<{ changed: number }>(api.delete(`/property-tags/tags/${encodeURIComponent(tag)}`));
  },
};

export default propertyTagsAPI;
