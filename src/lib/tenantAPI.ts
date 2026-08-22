import { api } from "./api";

export const tenantAPI = {
  getAll: async () => {
    const response = await api.get("/tenants/getTenants");
    return response.data.data;
  },

  getById: async (id: string | number) => {
    if (!id) throw new Error("Tenant ID is required");
    const response = await api.get(`/tenants/getTenantById/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    if (!data?.name) throw new Error("Tenant name is required");
    const response = await api.post("/tenants/createTenant", data);
    return response.data;
  },

  update: async (id: string | number, data: any) => {
    if (!id) throw new Error("Tenant ID is required");
    const response = await api.put(`/tenants/updateTenant/${id}`, data);
    return response.data;
  },

  delete: async (id: string | number) => {
    if (!id) throw new Error("Tenant ID is required");
    const response = await api.delete(`/tenants/deleteTenant/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: (string | number)[]) => {
    const response = await api.post("/tenants/bulk-delete", { ids });
    return response.data;
  },

  importTenants: async (tenants: any[]) => {
    const response = await api.post(`/tenants/bulk-import`, { items: tenants });
    return response.data;
  },
};
