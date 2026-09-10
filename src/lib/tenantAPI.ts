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

  bulkAssign: async (ids: (string | number)[], assigned_to: string | number) => {
    return Promise.all(ids.map(id => api.put(`/tenants/updateTenant/${id}`, { assigned_to })));
  },

  bulkUpdateStatus: async (ids: (string | number)[], status: string) => {
    return Promise.all(ids.map(id => api.put(`/tenants/updateTenant/${id}`, { status })));
  },

  // Public Tenant Flow
  sendOtp: async (data: { email: string; name?: string; rental_property_id?: number | string }) => {
    const response = await api.post("/tenants/public/send-otp", data);
    return response.data;
  },

  verifyOtp: async (data: {
    email: string;
    otp: string;
  }) => {
    const response = await api.post("/tenants/public/verify-otp", data);
    return response.data;
  },

  verifyAndRegister: async (data: {
    email: string;
    otp?: string;
    name?: string;
    phone?: string;
    whatsapp?: string;
    tenant_type?: string;
    move_in_date?: string;
    preferred_bhk?: string;
    rental_property_id?: number | string;
    already_verified?: boolean;
    schedule_visit?: {
      visit_date?: string;
      visit_time?: string;
      meeting_point?: string;
      remarks?: string;
      property_title?: string;
    };
  }) => {
    const response = await api.post("/tenants/public/verify-and-register", data);
    return response.data;
  },

  reportIssue: async (data: {
    property_id: number | string;
    property_type?: string;
    reason: string;
    description?: string;
    reporter_email?: string;
    reporter_phone?: string;
  }) => {
    const response = await api.post("/tenants/public/report-issue", data);
    return response.data;
  },

  updatePassword: async (data: {
    email?: string;
    tenant_id?: number | string;
    new_password: string;
  }) => {
    const response = await api.post("/tenants/public/update-password", data);
    return response.data;
  },

  // Get owner details for already-authenticated tenant (no OTP needed)
  getOwnerDetails: async (property_id: number | string, email?: string) => {
    const response = await api.get(`/tenants/public/owner-details/${property_id}`, {
      params: email ? { email } : {},
    });
    return response.data;
  },

  // Profile Completeness & Matching
  getProfileCompleteness: async (tenantId: number | string) => {
    const response = await api.get(`/tenants/completeness/${tenantId}`);
    return response.data;
  },

  getMatchScore: async (tenantId: number | string, propertyId: number | string) => {
    const response = await api.get(`/tenants/match/${tenantId}/${propertyId}`);
    return response.data;
  },

  // Interest Requests Workflow (Two-Way)
  sendInterest: async (data: {
    rental_property_id: number | string;
    tenant_id: number | string;
    owner_id?: number | string | null;
    sender_type?: 'tenant' | 'owner';
    message?: string;
  }) => {
    const response = await api.post('/tenants/interests/send', data);
    return response.data;
  },

  getTenantInterests: async (tenantId: number | string) => {
    const response = await api.get(`/tenants/interests/tenant/${tenantId}`);
    return response.data;
  },

  getOwnerInterests: async (ownerId: number | string) => {
    const response = await api.get(`/tenants/interests/owner/${ownerId}`);
    return response.data;
  },

  ownerConfirmTenant: async (interestId: number | string, owner_id?: number | string) => {
    const response = await api.post(`/tenants/interests/${interestId}/owner-confirm`, { owner_id });
    return response.data;
  },

  ownerRejectTenant: async (interestId: number | string, notes?: string) => {
    const response = await api.post(`/tenants/interests/${interestId}/owner-reject`, { notes });
    return response.data;
  },

  tenantRespondConfirmation: async (interestId: number | string, tenant_id: number | string, action: 'accept' | 'decline') => {
    const response = await api.post(`/tenants/interests/${interestId}/tenant-respond`, { tenant_id, action });
    return response.data;
  },
};


