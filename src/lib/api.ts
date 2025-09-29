// // src/lib/api.ts
// import axios, { AxiosRequestHeaders } from 'axios';


// // const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3000/api/';

// const API_BASE_PROD_URL ='http://investordeal.in/api/'; // for server

// export const api = axios.create({
//   baseURL: API_BASE_PROD_URL,  //for server
//   // baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // ✅ अगर body FormData है तो Content-Type मिटा दो (axios boundary खुद लगाएगा)
// api.interceptors.request.use((config) => {
//   const isFormData =
//     typeof FormData !== 'undefined' && config.data instanceof FormData;

//   if (isFormData) {
//     // axios v1 header structures cover
//     if (config.headers) {
//       delete (config.headers as any)['Content-Type'];
//       if ((config.headers as any).common) {
//         delete (config.headers as any).common['Content-Type'];
//       }
//       if ((config.headers as any).post) {
//         delete (config.headers as any).post['Content-Type'];
//       }
//     }
//   }
//   return config;
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers = config.headers ?? {} as AxiosRequestHeaders;

//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor to handle auth errors globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Auth API
// export const authAPI = {
//   login: async (credentials: { username: string; password: string }) => {
//     const response = await api.post('/auth/signin', credentials);
//     return response.data;
//   },

//   register: async (userData: {
//     username: string;
//     email: string;
//     password: string;
//     first_name: string;
//     last_name: string;
//     phone?: string;
//     role?: string;
//   }) => {
//     const response = await api.post('/auth/signup', userData);
//     return response.data;
//   },

//   refreshToken: async () => {
//     const response = await api.post('/auth/refresh-token');
//     return response.data;
//   },

//   logout: async () => {
//     const response = await api.post('/auth/logout');
//     return response.data;
//   },

//   // ✅ Ye add karo
//   getCurrentUser: async () => {
//     const response = await api.get('/auth/me'); // ya backend route jahan user detail milta ho
//     return response.data;
//   },
//    // ✅ Get Profile
//   getProfile: async () => {
//     const response = await api.get('/auth/profile');
//     return response.data;
//   },
// };


// // Users API
// export const usersAPI = {
//   getProfile: async () => {
//     const response = await api.get('/users/profile');
//     return response.data;
//   },

//   updateProfile: async (data: any) => {
//     const response = await api.put('/users/profile', data);
//     return response.data;
//   },

//   changePassword: async (data: { current_password: string; new_password: string }) => {
//     const response = await api.patch('/users/change-password', data);
//     return response.data;
//   },

//   getAllUsers: async (params?: any) => {
//     const response = await api.get('/users/get-all-user', { params });
//     return response.data;
//   },

//   getAgents: async () => {
//     const response = await api.get('/users/agents');
//     return response.data;
//   },

//   getDashboardStats: async () => {
//     const response = await api.get('/users/dashboard-stats');
//     return response.data;
//   },

//   updateUser: async (userId: string, data: any) => {
//     const response = await api.put(`/users/update/${userId}`, data);
//     return response.data;
//   },

//   deleteUser: async (userId: string) => {
//     const response = await api.delete(`/users/delete/${userId}`);
//     return response.data;
//   },

//   createUser: async (userData: any) => {
//     const response = await api.post('/users/create', userData);
//     return response.data;
//   },

//   exportUsers: async () => {
//     const response = await api.get('/users/export');
//     return response.data;
//   },
//   filterData: async (params?: any) => {
    
//     const response = await api.get('/users/filter', { params });
//     return response.data;
//   },

//    // ✅ Upload avatar
//   uploadAvatar: async (formData: FormData) => {
//     const response = await api.post('/users/upload-avatar', formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   },

//   // ✅ Remove avatar
//   removeAvatar: async () => {
//     const response = await api.delete('/users/remove-avatar');
//     return response.data;
//   },

// getUserById: async (userId: string | number) => {
//   const response = await api.get(`/users/get-user-by/${userId}`);
//   return response.data;
// },


// };

// // Leads API
// export const leadsAPI = {
//   getLeads: async (params?: any) => {
//     const response = await api.get('/leads', { params });
//     return response.data;
//   },

//   exportLeads: async () => {
//     const response = await api.get('/leads/export');
//     return response.data;
//   },

//   getScheduledViewings: async () => {
//     const response = await api.get('/leads/scheduled-viewings');
//     return response.data;
//   },

//   getLead: async (id: string) => {
//     const response = await api.get(`/leads/${id}`);
//     return response.data;
//   },

//   createLead: async (data: any) => {
//     const response = await api.post('/leads', data);
//     return response.data;
//   },

//   updateLead: async (id: string, data: any) => {
//     const response = await api.put(`/leads/${id}`, data);
//     return response.data;
//   },

//   deleteLead: async (id: string) => {
//     const response = await api.delete(`/leads/${id}`);
//     return response.data;
//   },
//   bulkDeleteLeads: (data: { ids: string[] }) => api.delete("/leads/bulk/delete", { data }),

//   // api/leadsAPI.ts
//   bulkUpdateLeads: async (data: { ids: string[]; status: string }) => {
//     const response = await api.patch("/leads/bulk-status", data);
//     return response.data;
//   },


//   // ✅ New method for assigning executive
//   assignToExecutive: async (id: string, data: { assigned_executive: string }) => {
//     const response = await api.patch(`/leads/${id}/assign`, data);
//     return response.data;
//   },

//   importLeads: async (leads) => {
//     const res = await api.post("/leads/import", leads);
//     return res.data;
//   },

//   assignToAgent: async (id: string, data: { assigned_agent_id: string; notes?: string }) => {
//     const response = await api.patch(`/leads/${id}/assign`, data);
//     return response.data;
//   },

//   getStats: async () => {
//     const response = await api.get('/leads/stats');
//     return response.data;
//   },
// };

// // Activities API
// export const activitiesAPI = {
//   getActivities: async (params?: any) => {
//     const response = await api.get('/activities', { params });
//     return response.data;
//   },

//   getActivity: async (id: string) => {
//     const response = await api.get(`/activities/${id}`);
//     return response.data;
//   },

//   createActivity: async (data: any) => {
//     const response = await api.post('/activities', data);
//     return response.data;
//   },

//   updateActivity: async (id: string, data: any) => {
//     const response = await api.put(`/activities/${id}`, data);
//     return response.data;
//   },

//   deleteActivity: async (id: string) => {
//     const response = await api.delete(`/activities/${id}`);
//     return response.data;
//   },

//   complete: async (id: string, data?: { notes?: string }) => {
//     const response = await api.patch(`/activities/${id}/complete`, data);
//     return response.data;
//   },

//   cancel: async (id: string, data?: { notes?: string }) => {
//     const response = await api.patch(`/activities/${id}/cancel`, data);
//     return response.data;
//   },

//   getUpcoming: async (params?: any) => {
//     const response = await api.get('/activities/upcoming', { params });
//     return response.data;
//   },

//   getToday: async (params?: any) => {
//     const response = await api.get('/activities/today', { params });
//     return response.data;
//   },

//   getStats: async () => {
//     const response = await api.get('/activities/stats');
//     return response.data;
//   },
// };

// // Dashboard API
// export const dashboardAPI = {
//   getAdminStats: async () => {
//     const response = await api.get('/dashboard/admin-stats');
//     return response.data;
//   },

//   getManagerStats: async () => {
//     const response = await api.get('/dashboard/manager-stats');
//     return response.data;
//   },

//   getAgentStats: async () => {
//     const response = await api.get('/dashboard/agent-stats');
//     return response.data;
//   },

//   getSellerStats: async () => {
//     const response = await api.get('/dashboard/seller-stats');
//     return response.data;
//   },

//   getBuyerStats: async () => {
//     const response = await api.get('/dashboard/buyer-stats');
//     return response.data;
//   },

//   getSystemAlerts: async () => {
//     const response = await api.get('/dashboard/system-alerts');
//     return response.data;
//   },

//   getStats: async () => {
//     const response = await api.get('/dashboard/stats');
//     return response.data;
//   },

//   getSalesPerformance: async () => {
//     const response = await api.get('/dashboard/sales-performance');
//     return response.data;
//   },

//   getLeadSources: async () => {
//     const response = await api.get('/dashboard/lead-sources');
//     return response.data;
//   },

//   getAgentPerformance: async () => {
//     const response = await api.get('/dashboard/agent-performance');
//     return response.data;
//   },

//   getPropertyMarketAnalysis: async () => {
//     const response = await api.get('/dashboard/property-market-analysis');
//     return response.data;
//   },

//   getActivityTimeline: async (params?: any) => {
//     const response = await api.get('/dashboard/activity-timeline', { params });
//     return response.data;
//   },
// };

// // Public API (no authentication required)
// export const publicAPI = {
//   getPublicProperties: async (params?: any) => {
//     const publicAxios = axios.create({
//       // baseURL: API_BASE_URL,
//       baseURL: API_BASE_PROD_URL, //for server
//       timeout: 10000,
//       headers: { 'Content-Type': 'application/json' },
//     });
//     const response = await publicAxios.get('/properties', { params });
//     return response.data;
//   },

//   getPublicProperty: async (id: string) => {
//     const publicAxios = axios.create({
//       // baseURL: API_BASE_URL,
//       baseURL: API_BASE_PROD_URL, // for server
//       timeout: 10000,
//       headers: { 'Content-Type': 'application/json' },
//     });
//     const response = await publicAxios.get(`/properties/${id}`);
//     return response.data;
//   },

//   searchPublicProperties: async (data: any) => {
//     const publicAxios = axios.create({
//       // baseURL: API_BASE_URL,
//       baseURL: API_BASE_PROD_URL, // for server
//       timeout: 10000,
//       headers: { 'Content-Type': 'application/json' },
//     });
//     const response = await publicAxios.post('/properties/search', data);
//     return response.data;
//   },

//   submitContactForm: async (data: any) => {
//     const publicAxios = axios.create({
//       // baseURL: API_BASE_URL,
//       baseURL: API_BASE_PROD_URL, // for server
//       timeout: 10000,
//       headers: { 'Content-Type': 'application/json' },
//     });
//     const response = await publicAxios.post('/leads', data);
//     return response.data;
//   },
// };

// // Analytics API
// export const analyticsAPI = {
//   getAnalytics: async (params?: any) => {
//     const response = await api.get('/analytics', { params });
//     return response.data;
//   },

//   exportAnalytics: async (params?: any) => {
//     const response = await api.get('/analytics/export', { params });
//     return response.data;
//   },
// };

// // Template API functions
// export const apiClient = {
//   // ---------------- Templates ----------------
//   getTemplates: async (category?: string, search?: string) => {
//     const params: Record<string, string> = {};
//     if (category) params.category = category;
//     if (search) params.search = search;
//     return await api.get("/templates", { params });
//   },
//   createTemplate: async (data: any) => api.post("/templates", data),
//   updateTemplate: async (id: string, data: any) => api.put(`/templates/${id}`, data),
//   deleteTemplate: async (id: string) => api.delete(`/templates/${id}`),

//   // ---------------- Documents ----------------
//   getDocuments: async (status?: string, search?: string) => {
//     const params: Record<string, string> = {};
//     if (status) params.status = status;
//     if (search) params.search = search;
//     return await api.get("/documents", { params });
//   },
//   createDocument: async (data: any) => api.post("/documents", data),
//   updateDocument: async (id: string, data: any) => api.put(`/documents/${id}`, data),

//   // Generate PDF/DOCX
//   generateDocument: async (id: string, format: "pdf" | "docx" = "pdf") => {
//     return await api.post(`/documents/${id}/generate`, { format });
//   },

//   // Share via Email/WhatsApp/SMS/etc.
//   shareDocument: async (id: string, channels: string[], recipients: string[]) => {
//     return await api.post(`/documents/${id}/share`, { channels, recipients });
//   },
// };
// export default api;




// src/lib/api.ts
import axios, { AxiosRequestHeaders } from "axios";

const API_BASE_LOCAL = (import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:3000/api/";
const API_BASE_PROD = (import.meta.env.VITE_API_BASE_PROD_URL as string) ?? "http://investordeal.in/api/";
const API_FORCE = (import.meta.env.VITE_FORCE_API_BASE as string) ?? "";
const isBrowser = typeof window !== "undefined";
const isProdHost = isBrowser && /(?:^|\.)investordeal\.in$/i.test(window.location.hostname);
const API_BASE = (API_FORCE || (isProdHost ? API_BASE_PROD : API_BASE_LOCAL)).replace(/\/?$/, "/");

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post("/auth/signin", credentials);
    return response.data;
  },
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }) => {
    const response = await api.post("/auth/signup", userData);
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
  exportUsers: async () => {
    const response = await api.get("/users/export");
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
    const response = await api.post("/leads", data);
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

export default api;
