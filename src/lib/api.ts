// src/lib/api.ts
import axios, { AxiosRequestHeaders } from "axios";

const API_BASE_LOCAL = (import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:3000/api/";
const API_BASE_PROD = (import.meta.env.VITE_API_BASE_PROD_URL as string) ?? "https://resaleexpert.in/api/";
const API_FORCE = (import.meta.env.VITE_FORCE_API_BASE as string) ?? "";
const isBrowser = typeof window !== "undefined";
const isProdHost = isBrowser && /(?:^|\.)resaleexpert\.in$/i.test(window.location.hostname);
const API_BASE = (API_FORCE || (isProdHost ? API_BASE_PROD : API_BASE_LOCAL)).replace(/\/?$/, "/");

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,   // ✅ ADD THIS — session cookie ke liye zaroori
});

api.interceptors.request.use((config) => {
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (isFormData && config.headers) {
    delete (config.headers as any)["Content-Type"];
    if ((config.headers as any).common) delete (config.headers as any).common["Content-Type"];
    if ((config.headers as any).post) delete (config.headers as any).post["Content-Type"];
  }
  return config;
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/signin');
      if (!isLoginRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: any) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const response = await api.post("/auth/signin", { ...credentials, guest_id: credentials.guest_id || guestId });
    return response.data;
  },
  sendLoginOTP: async (payload: { emailOrUsername?: string; email?: string; username?: string }) => {
    const response = await api.post("/auth/send-login-otp", payload);
    return response.data;
  },
  verifyOTPAndLogin: async (payload: {
    email: string;
    otp: string;
    guest_id?: string;
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    device_id?: string;
    source?: string;
  }) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const response = await api.post("/auth/verify-otp-login", {
      ...payload,
      guest_id: payload.guest_id || guestId,
    });
    return response.data;
  },
  register: async (userData: {
    username?: string;
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    salutation?: string;
    role?: string;
    guest_id?: string;
  }) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const response = await api.post("/auth/signup", { ...userData, guest_id: userData.guest_id || guestId });
    return response.data;
  },
  sendRegistrationOTP: async (payload: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    salutation?: string;
  }) => {
    const response = await api.post("/auth/send-registration-otp", payload);
    return response.data;
  },
  verifyOTPAndRegister: async (payload: {
    email: string;
    otp: string;
    password?: string;
    salutation?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
    username?: string;
    guest_id?: string;
  }) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const response = await api.post("/auth/verify-otp-register", {
      ...payload,
      guest_id: payload.guest_id || guestId,
    });
    return response.data;
  },
  googleAuth: async (payload: {
    credential: string;
    role?: string;
    phone?: string;
    salutation?: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    guest_id?: string;
  }) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const response = await api.post("/auth/google-auth", {
      ...payload,
      guest_id: payload.guest_id || guestId,
    });
    return response.data;
  },
  refreshToken: async () => {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export const usersAPI = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },
  changePassword: async (data: { current_password: string; new_password: string }) => {
    const response = await api.patch("/users/change-password", data);
    return response.data;
  },
  getAllUsers: async (params?: any) => {
    const response = await api.get("/users/get-all-user", { params });
    return response.data;
  },
  //  getSalesExecutives: async () => {
  //   const response = await api.get('/users/filter', {
  //     params: {
  //       department: 'sales',
  //       role: 'executive'
  //     }
  //   });
  //   return response.data;
  // },


  
  getSalesExecutives: async () => {
  const response = await api.get('/users/filter', {
    params: {
      department: 'Sales',         // EXACT MATCH
      role: 'Sales Executive',      // EXACT MATCH
      status: 'active'
    }
  });
  return response.data;
},

  // ✅ Alternative: Server-side filtering के लिए
  getUsersByFilter: async (filters: { department?: string; role?: string }) => {
    const response = await api.get('/users/filter', { params: filters });
    return response.data;
  },
  getAgents: async () => {
    const response = await api.get("/users/agents");
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get("/users/dashboard-stats");
    return response.data;
  },
  updateUser: async (userId: string, data: any) => {
    const response = await api.put(`/users/update/${userId}`, data);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/delete/${userId}`);
    return response.data;
  },
  createUser: async (userData: any) => {
    const response = await api.post("/users/create", userData);
    return response.data;
  },
// Tab-wise Export
exportUsersByTab: async (tabType: string, format: 'excel' | 'csv' = 'excel') => {
  const response = await api.get("/users/export-by-tab", {
    params: { tabType, format },
    responseType: 'blob'
  });
  return response;
},

// Download template by type
downloadImportTemplate: async (importType: 'users' | 'buyers' | 'sellers') => {
  const response = await api.get("/users/import-template", {
    params: { type: importType },
    responseType: 'blob'
  });
  return response;
},

// Import by type
importUsersByType: async (file: File, importType: 'users' | 'buyers' | 'sellers') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', importType);
  const response = await api.post("/users/import", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
},
  filterData: async (params?: any) => {
    const response = await api.get("/users/filter", { params });
    return response.data;
  },
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post("/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  removeAvatar: async () => {
    const response = await api.delete("/users/remove-avatar");
    return response.data;
  },
  getUserById: async (userId: string | number) => {
    const response = await api.get(`/users/get-user-by/${userId}`);
    return response.data;
  },
    getSalesExecutivesByRoute: async (params?: { is_active?: number | boolean | string; limit?: number; offset?: number }) =>
    (await api.get("/users/sales-executives", { params })).data,

  /** GET /api/users/by-dept-role?department=sales&role=executive&is_active=1 */
  getByDeptRole: async (params: {
    department: string;
    role: string;
    is_active?: number | boolean | string;
    limit?: number;
    offset?: number;
  }) => (await api.get("/users/by-dept-role", { params })).data,

};

export const leadsAPI = {
  getLeads: async (params?: any) => {
    const response = await api.get("/leads", { params });
    return response.data;
  },
  exportLeads: async () => {
    const response = await api.get("/leads/export");
    return response.data;
  },
  getScheduledViewings: async () => {
    const response = await api.get("/leads/scheduled-viewings");
    return response.data;
  },
  getLead: async (id: string) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },
  createLead: async (data: any) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const response = await api.post("/leads", { ...data, guest_id: data.guest_id || guestId });
    return response.data;
  },
  updateLead: async (id: string, data: any) => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },
  deleteLead: async (id: string) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },
  bulkDeleteLeads: (data: { ids: string[] }) => api.delete("/leads/bulk/delete", { data }),
  bulkUpdateLeads: async (data: { ids: string[]; status: string }) => {
    const response = await api.patch("/leads/bulk-status", data);
    return response.data;
  },
  assignToExecutive: async (id: string, data: { assigned_executive: string }) => {
    const response = await api.patch(`/leads/${id}/assign`, data);
    return response.data;
  },
   bulkAssignExecutives: async (payload: { ids: string[]; assigned_executive?: string | null }) => {
    const response = await api.patch(`/leads/bulk/assign-executive`, payload);
    return response.data;
  },
  importLeads: async (leads: any) => {
    const res = await api.post("/leads/import", leads);
    return res.data;
  },
  assignToAgent: async (id: string, data: { assigned_agent_id: string; notes?: string }) => {
    const response = await api.patch(`/leads/${id}/assign`, data);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/leads/stats");
    return response.data;
  },
};

export const activitiesAPI = {
  getActivities: async (params?: any) => {
    const response = await api.get("/activities", { params });
    return response.data;
  },
  getActivity: async (id: string) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },
  createActivity: async (data: any) => {
    const response = await api.post("/activities", data);
    return response.data;
  },
  updateActivity: async (id: string, data: any) => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },
  deleteActivity: async (id: string) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
  complete: async (id: string, data?: { notes?: string }) => {
    const response = await api.patch(`/activities/${id}/complete`, data);
    return response.data;
  },
  cancel: async (id: string, data?: { notes?: string }) => {
    const response = await api.patch(`/activities/${id}/cancel`, data);
    return response.data;
  },
  getUpcoming: async (params?: any) => {
    const response = await api.get("/activities/upcoming", { params });
    return response.data;
  },
  getToday: async (params?: any) => {
    const response = await api.get("/activities/today", { params });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/activities/stats");
    return response.data;
  },
};

export const dashboardAPI = {
  getAdminStats: async () => {
    const response = await api.get("/dashboard/admin-stats");
    return response.data;
  },
  getManagerStats: async () => {
    const response = await api.get("/dashboard/manager-stats");
    return response.data;
  },
  getAgentStats: async () => {
    const response = await api.get("/dashboard/agent-stats");
    return response.data;
  },
  getSellerStats: async () => {
    const response = await api.get("/dashboard/seller-stats");
    return response.data;
  },
  getBuyerStats: async () => {
    const response = await api.get("/dashboard/buyer-stats");
    return response.data;
  },
  getSystemAlerts: async () => {
    const response = await api.get("/dashboard/system-alerts");
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },
  getSalesPerformance: async () => {
    const response = await api.get("/dashboard/sales-performance");
    return response.data;
  },
  getLeadSources: async () => {
    const response = await api.get("/dashboard/lead-sources");
    return response.data;
  },
  getAgentPerformance: async () => {
    const response = await api.get("/dashboard/agent-performance");
    return response.data;
  },
  getPropertyMarketAnalysis: async () => {
    const response = await api.get("/dashboard/property-market-analysis");
    return response.data;
  },
  getActivityTimeline: async (params?: any) => {
    const response = await api.get("/dashboard/activity-timeline", { params });
    return response.data;
  },
};

export const publicAPI = {
  getPublicProperties: async (params?: any) => {
    const publicAxios = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
    const response = await publicAxios.get("/properties", { params });
    return response.data;
  },
  getPublicProperty: async (id: string) => {
    const publicAxios = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
    const response = await publicAxios.get(`/properties/${id}`);
    return response.data;
  },
  searchPublicProperties: async (data: any) => {
    const publicAxios = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
    const response = await publicAxios.post("/properties/search", data);
    return response.data;
  },
  submitContactForm: async (data: any) => {
    const publicAxios = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
    const response = await publicAxios.post("/leads", data);
    return response.data;
  },
};

export const analyticsAPI = {
  getAnalytics: async (params?: any) => {
    const response = await api.get("/analytics", { params });
    return response.data;
  },
  exportAnalytics: async (params?: any) => {
    const response = await api.get("/analytics/export", { params });
    return response.data;
  },
};

export const apiClient = {
  getTemplates: async (category?: string, search?: string) => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (search) params.search = search;
    return await api.get("/templates", { params });
  },
  createTemplate: async (data: any) => api.post("/templates", data),
  updateTemplate: async (id: string, data: any) => api.put(`/templates/${id}`, data),
  deleteTemplate: async (id: string) => api.delete(`/templates/${id}`),
  getDocuments: async (status?: string, search?: string) => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (search) params.search = search;
    return await api.get("/documents", { params });
  },
  createDocument: async (data: any) => api.post("/documents", data),
  updateDocument: async (id: string, data: any) => api.put(`/documents/${id}`, data),
  generateDocument: async (id: string, format: "pdf" | "docx" = "pdf") => {
    return await api.post(`/documents/${id}/generate`, { format });
  },
  shareDocument: async (id: string, channels: string[], recipients: string[]) => {
    return await api.post(`/documents/${id}/share`, { channels, recipients });
  },
};




export { reportAPI } from "./reportAPI";

export default api;
