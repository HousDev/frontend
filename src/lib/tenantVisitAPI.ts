// src/lib/tenantVisitAPI.ts
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

export interface TenantVisitFilters {
    tenantId?: string | number;
    rentalPropertyId?: string | number;
    visitStatus?: string;
    assignedExecutive?: string | number;
    fromDate?: string; // YYYY-MM-DD
    toDate?: string;   // YYYY-MM-DD
    page?: number;
    limit?: number;
    sortOrder?: "ASC" | "DESC";
}

export interface TenantVisitResponse {
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

export const tenantVisitAPI = {
    // Create new visit
    create: async (data: any) => {
        try {
            const res = await api.post("/tenant-visits/create", data);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Get all visits (with optional filters + pagination)
    getAll: async (params?: TenantVisitFilters): Promise<TenantVisitResponse> => {
        try {
            const res = await api.get("/tenant-visits/getall", { params });
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // 👇 Used by TenantViewPage Timeline tab
    getByTenantId: async (tenantId: string | number) => {
        try {
            const res = await api.get(`/tenant-visits/by-tenant/${tenantId}`);
            return res.data;
        } catch (error: any) {
            return { success: true, data: [] };
        }
    },


    // Get single visit by ID
    getById: async (id: string | number) => {
        try {
            const res = await api.get(`/tenant-visits/getbyid/${id}`);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Update visit
    update: async (id: string | number, data: any) => {
        try {
            const res = await api.put(`/tenant-visits/update/${id}`, data);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Delete visit
    delete: async (id: string | number) => {
        try {
            const res = await api.delete(`/tenant-visits/${id}`);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Bulk Delete visits
    bulkDelete: async (ids: (string | number)[]) => {
        try {
            const res = await api.delete(`/tenant-visits/bulk-delete`, { data: { ids } });
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Delete visit (alias)
    remove: async (id: string | number) => {
        try {
            const res = await api.delete(`/tenant-visits/${id}`);
            return res.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Get count (useful for stats/dashboard)
    getCount: async (params?: Omit<TenantVisitFilters, "page" | "limit" | "sortOrder">) => {
        try {
            const res = await api.get("/tenant-visits/count", { params });
            return res.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
};