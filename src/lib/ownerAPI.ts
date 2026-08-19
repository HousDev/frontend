import { api } from "./api";

export const ownerAPI = {
  getAll: async () => {
    const response = await api.get("/owners/getOwners");
    return response.data.data;
  },

  getById: async (id: string | number) => {
    if (!id) throw new Error("Owner ID is required");
    const response = await api.get(`/owners/getOwnerById/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    if (!data?.name) throw new Error("Owner name is required");
    const response = await api.post("/owners/createOwner", data);
    return response.data;
  },

  update: async (id: string | number, data: any) => {
    if (!id) throw new Error("Owner ID is required");
    const response = await api.put(`/owners/updateOwner/${id}`, data);
    return response.data;
  },

  delete: async (id: string | number) => {
    if (!id) throw new Error("Owner ID is required");
    const response = await api.delete(`/owners/deleteOwner/${id}`);
    return response.data;
  },

  bulkDelete: async (ids: (string | number)[]) => {
    const { data } = await api.post("/owners/hard-delete", { ids });
    return data;
  },

  importOwners: async (owners: any[]) => {
    const response = await api.post(`/owners/bulk-import`, owners);
    return response.data;
  },

  bulkAssignExecutive: async (
    ownerIds: (string | number)[],
    executiveId: number | null,
    onlyEmpty = false
  ) => {
    if (!Array.isArray(ownerIds) || !ownerIds.length)
      throw new Error("Owner IDs are required");
    const response = await api.post(`/owners/bulk/assign-executive`, {
      ownerIds,
      executiveId,
      onlyEmpty,
    });
    return response.data;
  },

  updateLeadField: async (id: string | number, field: string, value: any) => {
    if (!id) throw new Error("Owner ID is required");
    if (!field) throw new Error("Field name is required");
    const response = await api.post(`/owners/${id}/lead-field`, { field, value });
    return response.data;
  },

  bulkUpdateLeadField: async (
    ownerIds: (string | number)[],
    field: string,
    value: any,
    onlyEmpty = false
  ) => {
    if (!Array.isArray(ownerIds) || !ownerIds.length)
      throw new Error("Owner IDs are required");
    const response = await api.post(`/owners/bulk/lead-field`, {
      ownerIds,
      field,
      value,
      onlyEmpty,
    });
    return response.data;
  },
};

export default ownerAPI;
