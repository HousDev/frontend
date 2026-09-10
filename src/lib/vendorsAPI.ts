import { api } from "./api";

export type VendorService = {
  name: string;
  rate: string;
  unit: string;
  description?: string;
};

export type VendorAvailability = {
  days: string[];
  startTime: string;
  endTime: string;
  weeklyOff: string;
};

export type Vendor = {
  id: number;
  salutation?: string;
  name: string;
  businessName?: string;
  category: string;
  countryCode?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  rating?: number;
  experience?: number;
  verified?: boolean;
  reExpertVerified?: boolean;
  reSuggested?: boolean;
  services: VendorService[];
  tags: string[];
  rateIdea?: string;
  description?: string;
  availability?: VendorAvailability;
  languages?: string[];
  certifications?: string[];
  completedProjects?: number;
  responseTime?: string;
  created_at?: string;
  lastActive?: string;
  status?: string;
};

// ✅ NEW TYPE (Added only for category counts)
export type VendorCategoryCounts = {
  total: number;
  categories: {
    category: string;
    count: number;
  }[];
};

const unwrap = (response: any) =>
  response?.data?.data ?? response?.data ?? response;

export const vendorsAPI = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await api.get("/vendors/getVendors");
    const data = unwrap(response);
    return Array.isArray(data) ? data : [];
  },

  // ✅ NEW API (Added without changing existing functionality)
  getCategoryCounts: async (): Promise<VendorCategoryCounts> => {
    const response = await api.get("/vendors/counts");

    return {
      total: response.data.total,
      categories: response.data.categories || [],
    };
  },

  getById: async (id: string | number): Promise<Vendor> => {
    const response = await api.get(`/vendors/getVendorById/${id}`);
    return unwrap(response);
  },

  create: async (payload: Partial<Vendor>): Promise<Vendor> => {
    const response = await api.post("/vendors/createVendor", payload);
    return unwrap(response);
  },

  update: async (
    id: string | number,
    payload: Partial<Vendor>,
  ): Promise<Vendor> => {
    const response = await api.put(`/vendors/updateVendor/${id}`, payload);
    return unwrap(response);
  },

  remove: async (id: string | number) => {
    const response = await api.delete(`/vendors/deleteVendor/${id}`);
    return unwrap(response);
  },
};
