// src/lib/tenantActivityAPI.ts
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

export interface TenantActivityFilters {
    tenantId?: string | number;
    activityType?: string;
    assignedExecutive?: string | number;
    fromDate?: string; // YYYY-MM-DD
    toDate?: string;   // YYYY-MM-DD
    page?: number;
    limit?: number;
    sortOrder?: "ASC" | "DESC";
}

export interface TenantActivityResponse {
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

export const tenantActivityAPI = {
    // Create new activity
    create: async (data: any) => {
        try {
            const res = await api.post("/tenant-activities/create", data);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Get all activities (with optional filters + pagination)
    getAll: async (params?: TenantActivityFilters): Promise<TenantActivityResponse> => {
        try {
            const res = await api.get("/tenant-activities/getall", { params });
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // 👇 Used by TenantViewPage Timeline tab
    getByTenantId: async (tenantId: string | number) => {
        try {
            const res = await api.get(`/tenant-activities/by-tenant/${tenantId}`);
            return res.data;
        } catch (error: any) {
            return { success: true, data: [] };
        }
    },


    // Get single activity by ID
    getById: async (id: string | number) => {
        try {
            const res = await api.get(`/tenant-activities/getbyid/${id}`);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Update activity
    update: async (id: string | number, data: any) => {
        try {
            const res = await api.put(`/tenant-activities/update/${id}`, data);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Delete activity
    remove: async (id: string | number) => {
        try {
            const res = await api.delete(`/tenant-activities/remove/${id}`);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Get count (useful for stats/dashboard)
    getCount: async (params?: Omit<TenantActivityFilters, "page" | "limit" | "sortOrder">) => {
        try {
            const res = await api.get("/tenant-activities/count", { params });
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
};