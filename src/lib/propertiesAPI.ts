// src/lib/propertiesAPI.ts
import axios, { AxiosInstance } from "axios";
import { api } from "./api";

/* =======================
   Types for AI generator
   ======================= */
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
  // Some backends return { data: { id: '...' } }, so keep data flexible for callers
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
      successfulIds?: Array<string | number>;
      failedIds?: Array<{ id: string | number; error: string }>;
    };
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



    //public
    PublicgetProperties: async (params?: any) => {
      const res = await api.get("/properties/get-all/", { params });
      return res.data;
    },

    PublicgetProperty: async (id: string) => {
      const res = await api.get(`/properties/get-one/${id}`);
      return res.data;
    },


    PublicgetPropertyBySlug: async (slug: string) => {
    try {
      // debug logs intentionally kept
      const res = await api.get(`/properties/pro-page/${slug}`);
      return res.data;
    } catch (err) {
      throw err;
    }
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

  bulkMarkPublic: async (data: BulkMarkPublicPayload) => {
    const res = await api.post("/bulk-operations/mark-public", data);
    return res.data as BulkOperationResponse;
  },

  bulkMarkPrivate: async (data: BulkMarkPrivatePayload) => {
    const res = await api.post("/bulk-operations/mark-private", data);
    return res.data as BulkOperationResponse;
  },

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

  // POST-based search (body)
  search: async (data: any) => {
    const res = await api.post("/properties/search", data);
    return res.data;
  },

  // Legacy alias (some callers use getSearch)
  getSearch: async (data: any) => {
    const res = await api.post("/properties/search", data);
    return res.data;
  },

  // GET-based canonical search wrapper (query params)
  searchProperties: async (params: {
    city?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "low_to_high" | "high_to_low" | "medium" | "newest";
    propertyType?: string | string[];
    propertySubtype?: string | string[];
    unitType?: string | string[];
    unitTypes?: string[];
    furnishing?: string;
    possession?: string;
    featured?: boolean | string;
    verified?: boolean | string;
    minRating?: number | string;
    parking?: string;
    floor_min?: number | string;
    floor_max?: number | string;
    bathrooms?: number | string;
    bedrooms?: number | string | string[];
    filterToken?: string | null;
  }) => {
    const queryParams: any = {
      city: params.city,
      location: params.location,
      budget_min: params.minPrice,
      budget_max: params.maxPrice,
      sort: params.sort,
      propertyType: Array.isArray(params.propertyType) ? params.propertyType.join(",") : params.propertyType,
      propertySubtype: Array.isArray(params.propertySubtype) ? params.propertySubtype.join(",") : params.propertySubtype,
      unitType: Array.isArray(params.unitType) ? params.unitType.join(",") : params.unitType,
      unitTypes: params.unitTypes?.join(","),
      furnishing: params.furnishing,
      possession: params.possession,
      featured:
        params.featured === undefined
          ? undefined
          : typeof params.featured === "boolean"
          ? params.featured
            ? "1"
            : "0"
          : params.featured,
      verified:
        params.verified === undefined
          ? undefined
          : typeof params.verified === "boolean"
          ? params.verified
            ? "1"
            : "0"
          : params.verified,
      min_rating: params.minRating,
      parking: params.parking,
      floor_min: params.floor_min,
      floor_max: params.floor_max,
      bathrooms: params.bathrooms,
      bedrooms: Array.isArray(params.bedrooms) ? params.bedrooms.join(",") : params.bedrooms,
      filter_token: params.filterToken ?? undefined,
    };

    Object.keys(queryParams).forEach((k) => {
      if (queryParams[k] === undefined || queryParams[k] === null || queryParams[k] === "") delete queryParams[k];
    });

    const response = await api.get("/properties/", { params: queryParams });
    return response.data;
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

  /* ---- AI Description Generator ---- */
  generateDescription: async (payload: GenerateDescriptionPayload, baseURLOverride?: string): Promise<GenerateDescriptionResponse> => {
    const client = pickClient(baseURLOverride);
    const res = await client.post("/ai/generate-description", payload);
    return res.data as GenerateDescriptionResponse;
  },

  getPropertyBySlug: async (slug: string) => {
    try {
      // debug logs intentionally kept
      const res = await api.get(`/properties/page/${slug}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  sendPropertyEvent: async (
    propertyId: string | number,
    eventType: string,
    eventName: string,
    payload: Record<string, any> = {},
    opts: { slug?: string; filterToken?: string; filterParamKey?: string; baseURLOverride?: string } = {}
  ) => {
    const client = pickClient(opts.baseURLOverride);

    const body = {
      event_type: eventType,
      event_name: eventName,
      payload: payload || {},
      slug: opts.slug,
      filterToken: opts.filterToken,
    };

    const config: { params: Record<string, string>; withCredentials: boolean } = {
      params: {},
      withCredentials: true,
    };

    if (opts.filterParamKey && opts.filterToken) {
      config.params[opts.filterParamKey] = String(opts.filterToken);
    } else if (opts.filterToken) {
      config.params.filterToken = String(opts.filterToken);
    }

    if (opts.slug) {
      config.params.slug = String(opts.slug);
    }

    const res = await client.post(`/properties/${propertyId}/event`, body, config);
    return res.data as { success: boolean; message?: string; data?: any };
  },

  createFilterContext: async (payload: CreateFilterContextPayload) => {
    const res = await api.post("/properties/filters", payload);
    // normalize shape a bit for callers
    const out: CreateFilterContextResponse = {
      success: res?.data?.success ?? true,
      id: res?.data?.id ?? res?.data?.filterId ?? undefined,
      data: res?.data ?? undefined,
    };
    return out;
  },

  getFilterContext: async (id: string) => {
    const res = await api.get(`/properties/filters/${encodeURIComponent(id)}`);
    return res.data as { success: boolean; context?: any };
  },


searchByCityLocation: async (params: {
  city: string;
  locations?: string | string[];
  limit?: number;
  offset?: number;
}) => {
  const queryParams: any = {
    city: params.city,
    limit: params.limit,
    offset: params.offset,
    status: 'Available' // Add this if you want to filter by available properties
  };

  // Convert locations to comma-separated string and use "location" (singular)
  if (params.locations) {
    if (Array.isArray(params.locations)) {
      queryParams.location = params.locations.join(',');
    } else {
      queryParams.location = params.locations;
    }
  }

  const res = await api.get("/properties/city-locations", { 
    params: queryParams 
  });
  return res.data;
},
/* ---- Brochure PDF Generation ---- */
 downloadBrochure: (id: string|number, payload?: any) =>
    api.post(`/properties/${id}/brochure`, payload, { responseType: 'blob' })


};

export default propertiesAPI;
