// src/lib/integrationsAPI.ts
import { api } from "./api";

export type IntegrationTab = "email" | "sms" | "whatsapp" | "razorpay" | "stripe" | "chatgpt" | "google";

export interface TabData {
  tab: IntegrationTab;
  is_active: boolean;
  config: Record<string, string | null>;
}

export type AllIntegrations = Record<IntegrationTab, TabData>;

const unwrap = (res: any) => res?.data?.data ?? res?.data ?? res;

export const integrationsAPI = {

  // GET /integrations — all tabs at once (grouped by tab column)
  getAll: async (): Promise<AllIntegrations> => {
    const res = await api.get("/integrations");
    return unwrap(res);
  },

  // GET /integrations/:tab — fetch single tab by tab column value
  getByTab: async (tab: IntegrationTab): Promise<TabData | null> => {
    try {
      const res = await api.get(`/integrations/${tab}`);
      return unwrap(res);
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },

  // POST /integrations/:tab — save config (upserts by tab+setting_key)
  saveByTab: async (tab: IntegrationTab, config: Record<string, string>): Promise<TabData> => {
    const res = await api.post(`/integrations/${tab}`, { config });
    return unwrap(res);
  },

  // PATCH /integrations/:tab/toggle — enable/disable
  toggleByTab: async (tab: IntegrationTab, is_active: boolean): Promise<TabData> => {
    const res = await api.patch(`/integrations/${tab}/toggle`, { is_active });
    return unwrap(res);
  },

  // DELETE /integrations/:tab — clear config
  clearByTab: async (tab: IntegrationTab): Promise<void> => {
    await api.delete(`/integrations/${tab}`);
  },

  // Public GET — fetch Google client_id for login/signup
  getPublicGoogleConfig: async (): Promise<{ client_id: string; is_active: boolean }> => {
    try {
      const res = await api.get("/integrations/public/google-config");
      return unwrap(res);
    } catch {
      return { client_id: "", is_active: false };
    }
  },
};

// ─── Backward-compatible named exports (drop-in for old separate API files) ──
export const smsIntegrationAPI = {
  getIntegration:  () => integrationsAPI.getByTab("sms"),
  saveIntegration: (config: Record<string, string>) => integrationsAPI.saveByTab("sms", config),
  toggleIntegration: (p: { active: boolean }) => integrationsAPI.toggleByTab("sms", p.active),
};
export const emailIntegrationAPI = {
  getIntegration:  () => integrationsAPI.getByTab("email"),
  saveIntegration: (config: Record<string, string>) => integrationsAPI.saveByTab("email", config),
  toggleIntegration: (p: { enabled: boolean }) => integrationsAPI.toggleByTab("email", p.enabled),
};
export const whatsappIntegrationAPI = {
  getIntegration:  () => integrationsAPI.getByTab("whatsapp"),
  saveIntegration: (config: Record<string, string>) => integrationsAPI.saveByTab("whatsapp", config),
  toggleIntegration: (p: { active: boolean }) => integrationsAPI.toggleByTab("whatsapp", p.active),
};
export const razorpayIntegrationAPI = {
  getIntegration:  () => integrationsAPI.getByTab("razorpay"),
  saveIntegration: (config: Record<string, string>) => integrationsAPI.saveByTab("razorpay", config),
  toggleIntegration: (p: { active: boolean }) => integrationsAPI.toggleByTab("razorpay", p.active),
};
export const stripeIntegrationAPI = {
  getIntegration:  () => integrationsAPI.getByTab("stripe"),
  saveIntegration: (config: Record<string, string>) => integrationsAPI.saveByTab("stripe", config),
  toggleIntegration: (p: { active: boolean }) => integrationsAPI.toggleByTab("stripe", p.active),
};
export const chatgptIntegrationAPI = {
  getIntegration:  () => integrationsAPI.getByTab("chatgpt"),
  saveIntegration: (config: Record<string, string>) => integrationsAPI.saveByTab("chatgpt", config),
  toggleIntegration: (p: { active: boolean }) => integrationsAPI.toggleByTab("chatgpt", p.active),
};