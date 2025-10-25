// src/lib/buyerSavedPropertiesAPI.ts
import { api } from "./api";

/** Types */
export type BuyerSavedRow = {
  id: number;
  buyer_id: number;
  property_id: number;
  created_at: string;
};

export type JoinedProperty = {
  id: number;
  seller_name?: string | null;
  seller_id?: number | null;
  lead_id?: number | null;
  assigned_to?: number | null;
  property_type_name?: string | null;
  property_subtype_name?: string | null;
  unit_type?: string | null;
  wing?: string | null;
  unit_no?: string | null;
  furnishing?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  facing?: string | null;
  parking_type?: string | null;
  parking_qty?: number | null;
  city_name?: string | null;
  location_name?: string | null;
  society_name?: string | null;
  floor?: number | null;
  total_floors?: number | null;
  carpet_area?: number | null;
  builtup_area?: number | null;
  budget?: number | null;
  price_type?: string | null;
  final_price?: number | null;
  address?: string | null;
  status?: string | null;
  lead_source?: string | null;
  possession_month?: number | null;
  possession_year?: number | null;
  purchase_month?: number | null;
  purchase_year?: number | null;
  selling_rights?: string | null;
  photos?: any | null;
  amenities?: any | null;
  furnishing_items?: any | null;
  nearby_places?: any | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_public?: boolean | number | null;
  is_private?: boolean | number | null;
  is_sold?: boolean | number | null;
  is_available?: boolean | number | null;
  is_new_listing?: boolean | number | null;
  is_premium?: boolean | number | null;
  is_verified?: boolean | number | null;
  is_featured?: boolean | number | null;
  publication_date?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  public_views?: number | null;
  public_inquiries?: number | null;
  slug?: string | null;
};

export type BuyerSavedWithProperty = BuyerSavedRow & { property: JoinedProperty };

type ListResponse<T> = { success: true; data: T[]; meta: { limit: number; offset: number } };
type ToggleResponse = { success: true; saved: boolean; data?: BuyerSavedRow };
type CheckResponse = { success: true; saved: boolean };
type CountResponse = { success: true; count: number };

const base = "/buyer-saved-properties";

export const buyerSavedAPI = {
  /** create/unsave/toggle */
  toggle: async (buyerId: number, propertyId: number, mode: "toggle" | "save" | "unsave" = "toggle") => {
    try {
      const { data } = await api.post<ToggleResponse>(`${base}`, { buyerId, propertyId, mode });
      return data;
    } catch (error) {
      console.error('Toggle save failed:', error);
      throw error;
    }
  },

  /** list saved by buyer */
  listByBuyer: async (
    buyerId: number,
    opts?: { includeProperty?: boolean; limit?: number; offset?: number }
  ) => {
    try {
      const q = new URLSearchParams();
      if (opts?.includeProperty) q.set("includeProperty", "true");
      if (opts?.limit != null) q.set("limit", String(opts.limit));
      if (opts?.offset != null) q.set("offset", String(opts.offset));

      const url = `${base}/${buyerId}${q.toString() ? `?${q.toString()}` : ""}`;
      const { data } = await api.get<ListResponse<BuyerSavedRow | BuyerSavedWithProperty>>(url);
      return data;
    } catch (error) {
      console.error('List saved properties failed:', error);
      throw error;
    }
  },

  /** check if a property is saved by buyer */
  isSaved: async (buyerId: number, propertyId: number) => {
    try {
      const { data } = await api.get<CheckResponse>(`${base}/check/${buyerId}/${propertyId}`);
      return data;
    } catch (error) {
      console.error('Check saved failed:', error);
      throw error;
    }
  },

  /** delete by pair (idempotent unsave) */
  removePair: async (buyerId: number, propertyId: number) => {
    try {
      const { data } = await api.delete<{ success: boolean; removed: boolean }>(
        `${base}/pair/${buyerId}/${propertyId}`
      );
      return data;
    } catch (error) {
      console.error('Remove pair failed:', error);
      throw error;
    }
  },

  /** delete by id (rarely needed) */
  removeById: async (id: number) => {
    try {
      const { data } = await api.delete<{ success: boolean; removed: boolean }>(`${base}/${id}`);
      return data;
    } catch (error) {
      console.error('Remove by ID failed:', error);
      throw error;
    }
  },

  /** popularity count */
  countByProperty: async (propertyId: number) => {
    try {
      const { data } = await api.get<CountResponse>(`${base}/count/by-property/${propertyId}`);
      return data;
    } catch (error) {
      console.error('Count by property failed:', error);
      throw error;
    }
  },
};