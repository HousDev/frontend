import { api } from "./api";

export interface OwnerFollowup {
  id: number;
  ownerId: number | null;
  followupType: string | null;
  notes: string | null;
  followupDate?: string | null;
  status?: string | null;
  createdByName: string | null;
  createdBy: number | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerFollowupPayload {
  ownerId?: number | string;
  owner_id?: number | string;
  followupType?: string;
  notes?: string;
  followupDate?: string | Date | null;
  status?: string;
  createdBy?: number | string;
}

export interface OwnerFollowupQueryParams {
  ownerId?: string | number;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

const toMysqlDateTime = (v?: Date | string | null): string | null => {
  if (v == null) return null;
  if (typeof v === "string") return v;
  const d = v instanceof Date ? v : new Date(v as any);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const serializePayload = (p: OwnerFollowupPayload): Record<string, any> => {
  const out: Record<string, any> = { ...p } as any;

  if ((out as any).owner_id != null && out.ownerId == null) {
    out.ownerId = (out as any).owner_id;
    delete (out as any).owner_id;
  }

  if ("followupDate" in out) out.followupDate = toMysqlDateTime(out.followupDate as any);
  return out;
};

const handleError = (error: any): never => {
  if (error?.response) {
    throw new Error(error.response.data?.message || "Server Error");
  } else if (error?.request) {
    throw new Error("No response from server. Please try again later.");
  } else {
    throw new Error(error?.message || "Unexpected error");
  }
};

export const ownerFollowupAPI = {
  create: async (data: OwnerFollowupPayload): Promise<OwnerFollowup> => {
    const url = "/ownerfollowups";
    const payload = serializePayload(data);
    try {
      const res = await api.post<ApiResponse<OwnerFollowup>>(url, payload);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || "Failed to create follow-up");
      }
      return res.data.data;
    } catch (error) {
      handleError(error);
    }
  },

  getAll: async (params?: OwnerFollowupQueryParams): Promise<OwnerFollowup[]> => {
    const url = "/ownerfollowups";
    const qp = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 50,
      ownerId: params?.ownerId ?? undefined,
    };

    try {
      const res = await api.get<ApiResponse<OwnerFollowup[]>>(url, { params: qp });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch follow-ups");
      }
      return res.data.data || [];
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id: string | number): Promise<OwnerFollowup> => {
    const url = `/ownerfollowups/${id}`;
    try {
      const res = await api.get<ApiResponse<OwnerFollowup>>(url);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || "Follow-up not found");
      }
      return res.data.data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id: string | number, data: OwnerFollowupPayload): Promise<OwnerFollowup> => {
    const url = `/ownerfollowups/${id}`;
    const payload = serializePayload(data);
    try {
      const res = await api.put<ApiResponse<OwnerFollowup>>(url, payload);
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message || "Failed to update follow-up");
      }
      return res.data.data;
    } catch (error) {
      handleError(error);
    }
  },

  remove: async (id: string | number): Promise<string> => {
    const url = `/ownerfollowups/${id}`;
    try {
      const res = await api.delete<ApiResponse<never>>(url);
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to delete follow-up");
      }
      return res.data.message || "Deleted successfully";
    } catch (error) {
      handleError(error);
    }
  },
};

export default ownerFollowupAPI;
