// src/lib/tenantFollowupAPI.ts
import { api } from "./api"; // 👈 same axios instance used across the app

const handleError = (error: any) => {
    if (error.response) {
        console.error("API Error Response:", error.response.data);
        throw new Error(error.response.data?.message || "Server Error");
    } else if (error.request) {
        console.error("API No Response:", error.request);
        throw new Error("No response from server. Please try again later.");
    } else {
        console.error("API Error:", error.message);
        throw new Error(error.message || "Unexpected error");
    }
};

export interface TenantFollowupFilters {
    tenantId?: string | number;
    followupType?: string;
    priority?: "High" | "Medium" | "Low";
    assignedExecutive?: string | number;
    fromDate?: string; // YYYY-MM-DD
    toDate?: string;   // YYYY-MM-DD
    page?: number;
    limit?: number;
    sortOrder?: "ASC" | "DESC";
}

export interface TenantFollowupResponse {
    success: boolean;
    data: any[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const tenantFollowupAPI = {
    // Create new follow-up
    create: async (data: any) => {
        try {
            const res = await api.post("/tenant-followups/create", data);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Get all follow-ups (with optional filters + pagination)
    getAll: async (params?: TenantFollowupFilters): Promise<TenantFollowupResponse> => {
        try {
            const res = await api.get("/tenant-followups/getall", { params });
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // 👇 Used by TenantViewPage Timeline tab
    getByTenantId: async (tenantId: string | number) => {
        try {
            const res = await api.get(`/tenant-followups/by-tenant/${tenantId}`);
            return res.data;
        } catch (error: any) {
            return { success: true, data: [] };
        }
    },


    // Get single follow-up by ID
    getById: async (id: string | number) => {
        try {
            const res = await api.get(`/tenant-followups/getbyid/${id}`);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Update follow-up
    update: async (id: string | number, data: any) => {
        try {
            const res = await api.put(`/tenant-followups/update/${id}`, data);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Delete follow-up
    remove: async (id: string | number) => {
        try {
            const res = await api.delete(`/tenant-followups/remove/${id}`);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Get count (useful for stats/dashboard)
    getCount: async (params?: Omit<TenantFollowupFilters, "page" | "limit" | "sortOrder">) => {
        try {
            const res = await api.get("/tenant-followups/count", { params });
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
};