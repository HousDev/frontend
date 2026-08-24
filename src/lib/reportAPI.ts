// frontend/src/lib/reportAPI.ts
import { api } from "./api";

export interface ReportFilterParams {
  datePreset?: string;
  startDate?: string;
  endDate?: string;
  agentId?: string;
  leadSource?: string;
  leadStatus?: string;
  propertyType?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  ignoreDate?: boolean;
}

export const reportAPI = {
  getDashboardSummary: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/dashboard", { params });
    return response.data;
  },

  getDashboardTrends: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/dashboard/trends", { params });
    return response.data;
  },

  getDashboardFunnel: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/dashboard/funnel", { params });
    return response.data;
  },

  getLeadReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/leads", { params });
    return response.data;
  },

  getLeadSourceReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/lead-sources", { params });
    return response.data;
  },

  getAgentPerformanceReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/agents", { params });
    return response.data;
  },

  getAgentLeadExecutionReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/agent-execution", { params });
    return response.data;
  },

  getBuyerReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/buyers", { params });
    return response.data;
  },

  getSellerReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/sellers", { params });
    return response.data;
  },

  getTenantReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/tenants", { params });
    return response.data;
  },

  getOwnerReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/owners", { params });
    return response.data;
  },

  getPropertyReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/properties", { params });
    return response.data;
  },

  getPropertyVisitReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/property-visits", { params });
    return response.data;
  },

  getTransactionReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/transactions", { params });
    return response.data;
  },

  getActivityReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/activities", { params });
    return response.data;
  },

  getCommunicationReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/communication", { params });
    return response.data;
  },

  getCampaignReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/campaigns", { params });
    return response.data;
  },

  getDocumentReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/documents", { params });
    return response.data;
  },

  getAutomationReport: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/automation", { params });
    return response.data;
  },

  getAiInsights: async (params?: ReportFilterParams) => {
    const response = await api.get("/reports/ai-insights", { params });
    return response.data;
  },

  exportReportCSV: async (type: string, params?: ReportFilterParams) => {
    const response = await api.get("/reports/export", {
      params: { ...params, type },
      responseType: "blob",
    });
    return response.data;
  },
};
