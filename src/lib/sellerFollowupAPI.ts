// src/api/sellerFollowupAPI.ts
import { api } from "./api";

/* ------------------------------------------------------------------ */
/* Types (aligned to backend mapRow)                                   */
/* ------------------------------------------------------------------ */
// ⏫ add/ensure these fields exist in the interface
export interface SellerFollowup {
  id: number;
  sellerId: number | null;

  followupType: string | null;
  sellerLeadStage: string | null;
  sellerLeadStatus: string | null;

  remark: string | null;
  customRemark: string | null;
  nextAction: string | null;

  // dates/times (all optional because backend may send null)
  followupDate?: string | null;   // ISO e.g. "2025-10-29T18:30:00.000Z"
  followupTime?: string | null;   // "HH:mm:ss"
  completedDate: string | null;
  scheduleDate: string | null;    // ISO e.g. "2025-10-22T18:30:00.000Z"
  scheduleTime: string | null;    // "HH:mm[:ss]"
  priority: string | null;
  status?: string | null;

  // assignment (show names in UI)
  assignedExecutive: number | string | null;
  assignedExecutiveName: string | null;
  assignedToName: string | null;          // ✅ add this
  createdByName: string | null;           // ✅ add this
  updatedByName: string | null;           // ✅ add this
  transferredByName: string | null;       // ✅ add this

  reminder: number;

  createdBy: number | string | null;
  updatedBy: number | string | null;

  createdAt: string;
  updatedAt: string;

  // transfer flags
  transferredFromLead?: 0 | 1 | boolean | null;  // ✅ add this
  transferredAt?: string | null;                 // ✅ add this (ISO)
  transferType?: string | null;                  // optional
  assignedTo?: number | string | null;           // optional (id, backend variant)
}


export interface SellerFollowupPayload {
  sellerId?: number | string;
   seller_id?: number | string;
  followupType?: string;
  sellerLeadStage?: string;
  sellerLeadStatus?: string;
  remark?: string;
  customRemark?: string;
  nextAction?: string;

  completedDate?: string | Date | null;
  scheduleDate?: string | Date | null;
  scheduleTime?: string | null; // "HH:mm[:ss]"

  priority?: string;
  assignedExecutive?: number | string | null;

  reminder?: number | boolean | "0" | "1" | "true" | "false";

  createdBy?: number | string;
  updatedBy?: number | string;
}

export interface SellerFollowupQueryParams {
  sellerId?: string | number;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
const pad = (n: number) => String(n).padStart(2, "0");

const toMysqlDateTime = (v?: Date | string | null): string | null => {
  if (v == null) return null;
  if (typeof v === "string") return v; // backend will re-validate/normalize
  const d = v instanceof Date ? v : new Date(v as any);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const toMysqlDate = (v?: Date | string | null): string | null => {
  if (v == null) return null;
  if (typeof v === "string") return v; // assume already "YYYY-MM-DD"
  const d = v instanceof Date ? v : new Date(v as any);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// normalize "HH:mm" -> "HH:mm:ss"
const toHHmmss = (t?: string | null): string | null => {
  if (!t) return null;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return t; // let backend decide if exotic
};

const toIntFlag = (v: any): 0 | 1 => {
  if (v === 1 || v === "1" || v === true || v === "true") return 1;
  return 0;
};

/** Normalize outgoing payload to what backend expects (camelCase is ok). */
const serializePayload = (p: SellerFollowupPayload): Record<string, any> => {
  const out: Record<string, any> = { ...p } as any;

  // 🔁 accept snake_case too (your page sends `seller_id`)
  if ((out as any).seller_id != null && out.sellerId == null) {
    out.sellerId = (out as any).seller_id;
    delete (out as any).seller_id;
  }

  if ("completedDate" in out) out.completedDate = toMysqlDateTime(out.completedDate as any);
  if ("scheduleDate" in out)  out.scheduleDate  = toMysqlDate(out.scheduleDate as any);
  if ("scheduleTime" in out)  out.scheduleTime  = toHHmmss(out.scheduleTime as any);
  if ("reminder" in out)      out.reminder      = toIntFlag(out.reminder);
  return out;
};


/* ------------------------------------------------------------------ */
/* Request dedup cache (GET only)                                      */
/* ------------------------------------------------------------------ */
class RequestCache {
  private cache = new Map<string, { promise: Promise<any>; timestamp: number }>();
  private readonly TTL = 250;

  generateKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  get<T = any>(key: string): Promise<T> | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.promise as Promise<T>;
  }

  set(key: string, promise: Promise<any>): void {
    this.cache.set(key, { promise, timestamp: Date.now() });
    setTimeout(() => this.cache.delete(key), this.TTL);
  }

  clear(): void {
    this.cache.clear();
  }
}

const requestCache = new RequestCache();

/* ------------------------------------------------------------------ */
/* Centralized error handler + logging                                 */
/* ------------------------------------------------------------------ */
const handleError = (error: any): never => {
  if (error?.response) {
    console.error("🧨 API Error Response:", error.response.status, error.response.data);
    throw new Error(error.response.data?.message || "Server Error");
  } else if (error?.request) {
    console.error("🛰️  API No Response:", error.request);
    throw new Error("No response from server. Please try again later.");
  } else {
    console.error("⚠️  API Error:", error?.message);
    throw new Error(error?.message || "Unexpected error");
  }
};

/* Pretty log helper */
const logReq = (label: string, url: string, payload?: any, params?: any) => {
  console.log(`➡️  ${label}`, { url, params, payload });
};
const logRes = (label: string, url: string, data: any) => {
  console.log(`⬅️  ${label}`, { url, data });
};

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */
export const sellerFollowupAPI = {
  /** Create a new seller follow-up */
  create: async (data: SellerFollowupPayload): Promise<SellerFollowup> => {
    const url = "/sellerfollowups/create";
    const payload = serializePayload(data);
    logReq("POST create", url, payload);

    try {
      const res = await api.post<ApiResponse<SellerFollowup>>(url, payload);
      logRes("POST create (response)", url, res.data);

      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || "Failed to create follow-up");
      }

      requestCache.clear(); // bust caches so lists refetch
      return res.data.data;
    } catch (error) {
      handleError(error);
    }
  },

  /** Get all seller follow-ups (paginated) with deduplication */
  getAll: async (params?: SellerFollowupQueryParams): Promise<SellerFollowup[]> => {
    const url = "/sellerfollowups/getall";
    const qp = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      sellerId: params?.sellerId ?? undefined,
    };

    const cacheKey = requestCache.generateKey("GET", url, qp);
    const cached = requestCache.get<SellerFollowup[]>(cacheKey);
    if (cached) {
      console.log("[API] Returning cached request for getAll", qp);
      return cached;
    }

    logReq("GET getAll", url, undefined, qp);

    const requestPromise = (async () => {
      try {
        const res = await api.get<ApiResponse<SellerFollowup[]>>(url, { params: qp });
        logRes("GET getAll (response)", url, res.data);

        if (!res.data.success) {
          throw new Error(res.data.message || "Failed to fetch follow-ups");
        }

        return res.data.data || [];
      } catch (error) {
        handleError(error);
      }
    })();

    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  },

  /** Get a single seller follow-up by ID */
  getById: async (id: string | number): Promise<SellerFollowup> => {
    const url = `/sellerfollowups/getbyid/${id}`;
    const cacheKey = requestCache.generateKey("GET", url);
    const cached = requestCache.get<SellerFollowup>(cacheKey);
    if (cached) {
      console.log(`[API] Returning cached request for getById(${id})`);
      return cached;
    }

    logReq("GET getById", url);

    const requestPromise = (async () => {
      try {
        const res = await api.get<ApiResponse<SellerFollowup>>(url);
        logRes("GET getById (response)", url, res.data);

        if (!res.data.success || !res.data.data) {
          throw new Error(res.data.message || "Follow-up not found");
        }
        return res.data.data;
      } catch (error) {
        handleError(error);
      }
    })();

    requestCache.set(cacheKey, requestPromise);
    return requestPromise;
  },

  /** Update an existing seller follow-up */
  update: async (id: string | number, data: SellerFollowupPayload): Promise<SellerFollowup> => {
    const url = `/sellerfollowups/update/${id}`;
    const payload = serializePayload(data);
    logReq("PUT update", url, payload);

    try {
      const res = await api.put<ApiResponse<SellerFollowup>>(url, payload);
      logRes("PUT update (response)", url, res.data);

      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || "Failed to update follow-up");
      }

      requestCache.clear(); // bust caches so lists refetch
      return res.data.data;
    } catch (error) {
      handleError(error);
    }
  },

  /** Delete a seller follow-up */
  remove: async (id: string | number): Promise<string> => {
    const url = `/sellerfollowups/remove/${id}`;
    logReq("DELETE remove", url);

    try {
      const res = await api.delete<ApiResponse<never>>(url);
      logRes("DELETE remove (response)", url, res.data);

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to delete follow-up");
      }

      requestCache.clear(); // bust caches so lists refetch
      return res.data.message || "Deleted successfully";
    } catch (error) {
      handleError(error);
    }
  },

  /** Manually clear the request cache */
  clearCache: () => {
    requestCache.clear();
  },
};

export default sellerFollowupAPI;
