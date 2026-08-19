// src/lib/rentalPropertiesAPI.ts
import axios, { AxiosInstance } from "axios";
import { api } from "./api";

export type Tone = "professional" | "friendly" | "luxury";
export type Lang = "English" | "Hindi" | "Hinglish";

export interface CreateFilterContextPayload {
  filters: Record<string, any> | string;
  user_id?: number | null;
}

export interface CreateFilterContextResponse {
  success: boolean;
  id?: string;
  error?: string;
  data?: any;
}

export interface GenerateDescriptionPayload {
  formData: {
    propertyType?: string;
    propertySubtype?: string;
    unitType?: string;
    furnishing?: string;
    city?: string;
    location?: string;
    budget?: string | number;
    parkingType?: string;
    carpetArea?: string | number;
    floor?: string | number;
  };
  tone: Tone;
  lang: Lang;
  words: number;
}

export interface GenerateDescriptionResponse {
  text: string;
}

export interface StatusUpdatePayload {
  status: string;
  remarks: string;
  updateReason: string;
  updatedBy: string;
  effectiveDate?: string;
  notifyParties?: boolean;
  priceAdjustment?: boolean;
  newPrice?: number;
}

export interface StatusHistoryRecord {
  id: number;
  property_id: number;
  status: string;
  previous_status: string | null;
  remarks: string;
  update_reason: string;
  effective_date: string | null;
  updated_by: string;
  notify_parties: 0 | 1 | boolean;
  price_adjustment: 0 | 1 | boolean;
  new_price: number | null;
  previous_price: number | null;
  timestamp: string;
}

export interface BulkStatusUpdatePayload {
  propertyIds: Array<string | number>;
  status: string;
  remarks?: string;
  updatedBy?: string;
}

export interface BulkMarkPublicPayload {
  propertyIds: Array<string | number>;
  updatedBy?: string;
}
export interface BulkMarkPrivatePayload {
  propertyIds: Array<string | number>;
  updatedBy?: string;
}

export interface BulkSetVisibilityPayload {
  propertyIds: Array<string | number>;
  isPublic: boolean;
  updatedBy?: string;
}

export interface BulkDeletePayload {
  propertyIds: Array<string | number>;
  updatedBy?: string;
}

export interface BulkExportPayload {
  propertyIds: Array<string | number>;
  format?: "csv" | "json";
  updatedBy?: string;
}

export interface BulkOperationResult {
  propertyId: string | number;
  success: boolean;
  error?: string;
  newStatus?: string;
  previousStatus?: string;
  publicationDate?: string | null;
}

export interface BulkOperationResponse {
  success: boolean;
  message: string;
  data: {
    operation: {
      operationId: string;
      type: string;
      propertyIds: Array<string | number>;
      userId: string;
      timestamp: string;
      status: string;
    };
    summary: {
      totalProcessed: number;
      successful: number;
      failed: number;
      successfulIds?: Array<string | number>;
      failedIds?: Array<{ id: string | number; error: string }>;
    };
    results?: BulkOperationResult[];
  };
}

export interface AssignPropertyPayload {
  assigned_to: number | null;
}

export interface AssignPropertyResponse {
  success: boolean;
  affected: number;
  message: string;
}

export interface SimilarPropertiesFilters {
  propertyId?: number | string;
  type?: string;
  propertyType?: string;
  subtype?: string;
  unitType?: string;
  city?: string;
  location?: string;
  bedrooms?: number;
  furnishing?: string;
  limit?: number;
  excludeCurrent?: boolean;
}

export interface SimilarProperty {
  id: number | string;
  title: string;
  location: string;
  image: string | null;
  price?: number;
  beds?: number;
  baths?: number;
  area?: number;
  type?: string;
  subtype?: string;
  furnishing?: string;
  slug?: string;
  locationNormalized?: string;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  possession?: string;
  sim_score?: number;
}

export interface SimilarPropertiesResponse {
  success: boolean;
  data: SimilarProperty[];
  message?: string;
  total?: number;
}

export interface PopularLocation {
  location: string;
  count: number;
}

export interface PopularLocationsResponse {
  success: boolean;
  data: PopularLocation[];
  message?: string;
}

export const rentalPropertiesAPI = {
  getProperties: async (params?: any) => {
    const res = await api.get("/rental-properties", { params });
    return res.data;
  },

  getProperty: async (id: string) => {
    const res = await api.get(`/rental-properties/getPropertyById/${id}`);
    return res.data;
  },

  PublicgetProperties: async (params?: any) => {
    const res = await api.get("/rental-properties/get-all/", { params });
    return res.data;
  },

  PublicgetProperty: async (id: string) => {
    const res = await api.get(`/rental-properties/get-one/${id}`);
    return res.data;
  },

  PublicgetPropertyBySlug: async (slug: string) => {
    const res = await api.get(`/rental-properties/pro-page/${slug}`);
    return res.data;
  },

  createProperty: async (data: any) => {
    const res = await api.post("/rental-properties/create", data);
    return res.data;
  },

  updateProperty: async (id: string, data: any) => {
    const res = await api.put(`/rental-properties/${id}`, data);
    return res.data;
  },

  deleteProperty: async (id: string) => {
    const res = await api.delete(`/rental-properties/delete/${id}`);
    return res.data;
  },

  importBulk: async (rows: any[]) => {
    const res = await api.post("/rental-properties/import-bulk", { rows });
    return res.data as {
      success: boolean;
      imported?: number;
      failed?: number;
      results?: Array<{ index: number; success: boolean; error?: string }>;
      message?: string;
    };
  },

  /* ---- Status APIs (same endpoints or scoped if needed, we reuse status endpoints or rental-properties endpoints) ---- */
  updateStatus: async (propertyId: string, data: StatusUpdatePayload) => {
    const res = await api.put(`/status-update/${propertyId}/status`, data);
    return res.data as {
      success: boolean;
      message: string;
      property?: any;
      statusHistory?: StatusHistoryRecord;
    };
  },

  getStatusHistory: async (propertyId: string) => {
    const res = await api.get(`/status-update/${propertyId}/status-history`);
    return res.data as {
      success: boolean;
      data: StatusHistoryRecord[];
    };
  },

  /* ---- Bulk Operations (reusing endpoints, but they can support passing table context if needed or bulk-delete will map based on caller) ---- */
  bulkUpdateStatus: async (data: BulkStatusUpdatePayload) => {
    const res = await api.post("/bulk-operations/status", { ...data, isRental: true });
    return res.data as BulkOperationResponse;
  },

  bulkMarkPublic: async (data: BulkMarkPublicPayload) => {
    const res = await api.post("/bulk-operations/mark-public", { ...data, isRental: true });
    return res.data as BulkOperationResponse;
  },

  bulkMarkPrivate: async (data: BulkMarkPrivatePayload) => {
    const res = await api.post("/bulk-operations/mark-private", { ...data, isRental: true });
    return res.data as BulkOperationResponse;
  },

  bulkSetVisibility: async (data: BulkSetVisibilityPayload) => {
    const res = await api.post("/bulk-operations/visibility", { ...data, isRental: true });
    return res.data as BulkOperationResponse;
  },

  bulkDelete: async (data: BulkDeletePayload) => {
    const res = await api.delete("/bulk-operations/delete", { data: { ...data, isRental: true } });
    return res.data as BulkOperationResponse;
  },

  bulkExport: async (data: BulkExportPayload) => {
    const res = await api.post("/bulk-operations/export", { ...data, isRental: true }, {
      responseType: data.format === "csv" ? "blob" : "json",
    });

    if (data.format === "csv") {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rental_properties_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "Export downloaded successfully",
        data: { downloadCompleted: true },
      };
    }

    return res.data as BulkOperationResponse;
  },

  /* ---- Single-item visibility ---- */
  markPublic: async (propertyId: string, updatedBy?: string) => {
    const res = await api.patch(`/bulk-operations/${propertyId}/mark-public`, { updatedBy });
    return res.data as {
      success: boolean;
      message: string;
      data: {
        propertyId: string;
        publicationDate?: string | null;
      };
    };
  },

  markPrivate: async (propertyId: string, updatedBy?: string) => {
    const res = await api.patch(`/bulk-operations/${propertyId}/mark-private`, { updatedBy });
    return res.data as {
      success: boolean;
      message: string;
      data: {
        propertyId: string;
      };
    };
  },

  setVisibility: async (propertyId: string, isPublic: boolean, updatedBy?: string) => {
    const res = await api.patch(`/bulk-operations/${propertyId}/visibility`, { isPublic, updatedBy });
    return res.data as {
      success: boolean;
      message: string;
      data: {
        propertyId: string;
        isPublic: boolean;
      };
    };
  },

  updateAssignedTo: async (propertyId: string | number, data: AssignPropertyPayload) => {
    const res = await api.patch(`/rental-properties/${propertyId}/assigned-to`, data);
    return res.data as AssignPropertyResponse;
  },

  getSimilarProperties: async (params?: SimilarPropertiesFilters) => {
    const res = await api.get("/rental-properties/similar", { params });
    return res.data as SimilarPropertiesResponse;
  },

  getPopularLocations: async (limit: number = 5) => {
    const res = await api.get("/rental-properties/popular-locations", { params: { limit } });
    return res.data as PopularLocationsResponse;
  },

  getFilterContext: async (id: string) => {
    const res = await api.get(`/rental-properties/filters/${id}`);
    return res.data;
  },

  saveFilterContext: async (data: CreateFilterContextPayload) => {
    const res = await api.post("/rental-properties/filters", data);
    return res.data as CreateFilterContextResponse;
  },
};

export default rentalPropertiesAPI;
