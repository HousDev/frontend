// src/lib/propertiesAPI.ts
import axios, { AxiosInstance } from "axios";
import { api } from "./api";

/* =======================
   Types for AI generator
   ======================= */
export type Tone = "professional" | "friendly" | "luxury";
export type Lang = "English" | "Hindi" | "Hinglish";

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

/* =======================
   Types for Status module
   ======================= */
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

/* =======================
   Types for Bulk Operations
   ======================= */
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
      // keep these optional for forward/back compat
      successfulIds?: Array<string | number>;
      failedIds?: Array<{ id: string | number; error: string }>;
    };
    // optional depending on backend
    results?: BulkOperationResult[];
  };
}

/* ==================================
   Helper: choose client per request
   ================================== */
const pickClient = (baseURLOverride?: string): AxiosInstance =>
  baseURLOverride
    ? axios.create({ baseURL: baseURLOverride, withCredentials: true })
    : api;

/* ==========================
   Main API surface
   ========================== */
export const propertiesAPI = {
  /* ---- Properties CRUD ---- */
  getProperties: async (params?: any) => {
    const res = await api.get("/properties", { params });
    return res.data;
  },

  getProperty: async (id: string) => {
    const res = await api.get(`/properties/getPropertyById/${id}`);
    return res.data;
  },

  createProperty: async (data: any) => {
    const res = await api.post("/properties/create", data);
    return res.data;
  },

  updateProperty: async (id: string, data: any) => {
    const res = await api.put(`/properties/${id}`, data);
    return res.data;
  },

  deleteProperty: async (id: string) => {
    const res = await api.delete(`/properties/delete/${id}`);
    return res.data;
  },

  /* ---- Status APIs (mounted at /api/status-update) ---- */
  updateStatus: async (propertyId: string, data: StatusUpdatePayload) => {
    const res = await api.put(`/status-update/${propertyId}/status`, data);
    return res.data as {
      success: boolean;
      message: string;
      property?: any;
      statusHistory?: StatusHistoryRecord;
    };
    // (no change)
  },

  getStatusHistory: async (propertyId: string) => {
    const res = await api.get(`/status-update/${propertyId}/status-history`);
    return res.data as {
      success: boolean;
      data: StatusHistoryRecord[];
    };
  },

  /* ---- Bulk Operations APIs ---- */
  bulkUpdateStatus: async (data: BulkStatusUpdatePayload) => {
    const res = await api.post("/bulk-operations/status", data);
    return res.data as BulkOperationResponse;
  },

  // legacy public
  bulkMarkPublic: async (data: BulkMarkPublicPayload) => {
    const res = await api.post("/bulk-operations/mark-public", data);
    return res.data as BulkOperationResponse;
  },

  // NEW: bulk private
  bulkMarkPrivate: async (data: BulkMarkPrivatePayload) => {
    const res = await api.post("/bulk-operations/mark-private", data);
    return res.data as BulkOperationResponse;
  },

  // NEW: bulk visibility toggle via boolean
  bulkSetVisibility: async (data: BulkSetVisibilityPayload) => {
    const res = await api.post("/bulk-operations/visibility", data);
    return res.data as BulkOperationResponse;
  },

  bulkDelete: async (data: BulkDeletePayload) => {
    const res = await api.delete("/bulk-operations/delete", { data });
    return res.data as BulkOperationResponse;
  },

  bulkExport: async (data: BulkExportPayload) => {
    const res = await api.post("/bulk-operations/export", data, {
      responseType: data.format === "csv" ? "blob" : "json",
    });

    if (data.format === "csv") {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `properties_export_${Date.now()}.csv`);
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
  // legacy public
  markPublic: async (propertyId: string, updatedBy?: string) => {
    const res = await api.patch(`/bulk-operations/${propertyId}/mark-public`, { updatedBy });
    return res.data as {
      success: boolean;
      message: string;
      data: {
        propertyId: string;
        // backend may or may not send this; keep optional
        publicationDate?: string | null;
      };
    };
  },

  // NEW: single private
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

  // NEW: single visibility with boolean
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

  /* ---- Bulk op status ---- */
  getBulkOperationStatus: async (operationId: string) => {
    const res = await api.get(`/bulk-operations/operations/${operationId}`);
    return res.data as {
      success: boolean;
      data: {
        operationId: string;
        status: string;
        timestamp: string;
        message: string;
      };
    };
  },

  /* ---- Queries / analytics ---- */
  search: async (data: any) => {
    const res = await api.post("/properties/search", data);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get("/properties/stats");
    return res.data;
  },

  exportProperties: async () => {
    const res = await api.get("/properties/export");
    return res.data;
  },

  getSavedProperties: async () => {
    const res = await api.get("/properties/saved");
    return res.data;
  },

  getRecommendedProperties: async () => {
    const res = await api.get("/properties/recommended");
    return res.data;
  },

  getPropertyAnalytics: async (id: string) => {
    const res = await api.get(`/properties/${id}/analytics`);
    return res.data;
  },

// ✅ canonical search (GET with query params, unitTypes as string[])
searchProperties: async (params: {
  city?: string;
  location?: string;
  minPrice?: number;       // frontend field
  maxPrice?: number;       // frontend field
  sort?: "low_to_high" | "high_to_low" | "medium" | "newest";
  propertyType?: string;
  unitTypes?: string[];
  furnishing?: string;
  possession?: string;
}) => {
  const queryParams = {
    city: params.city,
    location: params.location,
    budget_min: params.minPrice,   // 👈 remap
    budget_max: params.maxPrice,   // 👈 remap
    sort: params.sort,
    propertyType: params.propertyType,
    unitTypes: params.unitTypes?.join(","),
    furnishing: params.furnishing,
    possession: params.possession,
  };
  const response = await api.get("/properties/", { params: queryParams });
  return response.data;
},




  /* ---- AI Description Generator ---- */
  generateDescription: async (
    payload: GenerateDescriptionPayload,
    baseURLOverride?: string
  ): Promise<GenerateDescriptionResponse> => {
    const client = pickClient(baseURLOverride);
    const res = await client.post("/ai/generate-description", payload);
    return res.data as GenerateDescriptionResponse;
  },
};

export default propertiesAPI;

