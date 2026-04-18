import { api } from "./api";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export interface Contact {
  id: number;
  name: string;
  phone: string;
  tag: 'hot' | 'new' | 'conv' | 'qual';
  stage: 'New' | 'Enquiry' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won';
  assigned_to: string;
  last_message?: string;
  last_contact_time?: string;
  color?: string;
  initials?: string;
  messages?: Message[];
  notes?: Note[];
  pipeline?: PipelineStage[];
}

export interface Message {
  id: number;
  contact_id: number;
  direction: 'in' | 'out' | 'bot' | 'note';
  text: string;
  whatsapp_msg_id?: string;
  is_read: boolean;
  time_sent: string;
}

export interface Note {
  id: number;
  contact_id: number;
  note: string;
  created_at: string;
}

export interface PipelineStage {
  id: number;
  contact_id: number;
  stage_name: string;
  done: boolean;
  completed_date: string | null;
}

export interface Template {
  id: number;
  name: string;
  label: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  body: string;
  variables: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  usage_count: number;
  last_used?: string;
  created_at: string;
}

export interface Broadcast {
  id: number;
  name: string;
  template_id: number;
  template_name?: string;
  segment: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed';
  sent_count: number;
  delivered_count: number;
  read_count: number;
  replied_count: number;
  created_at: string;
}

export interface AutomationRule {
  id: number;
  icon: string;
  title: string;
  trigger_event: string;
  action_type: string;
  action_params: any;
  is_active: boolean;
  execution_count: number;
  color: string;
}

export interface AnalyticsStats {
  totalContacts: number;
  newContacts: number;
  conversionRate: number;
  stageDistribution: { stage: string; count: number }[];
  agentPerformance: { agent: string; assigned: number; resolved: number }[];
  weeklyMessages: { date: string; count: number }[];
}

// ------------------------------------------------------------------
// WhatsApp CRM API Client
// ------------------------------------------------------------------
export const whatsappAPI = {
  // ---------- Contacts ----------
  getContacts: async (): Promise<Contact[]> => {
    const resp = await api.get("/contacts");
    return resp.data;
  },
  getContactById: async (id: string | number): Promise<Contact> => {
    const resp = await api.get(`/contacts/${id}`);
    return resp.data;
  },
  createContact: async (data: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    const resp = await api.post("/contacts", data);
    return resp.data;
  },
  updateContact: async (id: string | number, patch: Partial<Contact>) => {
    const resp = await api.put(`/contacts/${id}`, patch);
    return resp.data;
  },
  deleteContact: async (id: string | number) => {
    const resp = await api.delete(`/contacts/${id}`);
    return resp.data;
  },
  addNote: async (contact_id: number, note: string) => {
    const resp = await api.post("/contacts/note", { contact_id, note });
    return resp.data;
  },
  updatePipeline: async (contact_id: number, stage_name: string, done: boolean, completed_date?: string) => {
    const resp = await api.put("/contacts/pipeline", { contact_id, stage_name, done, completed_date });
    return resp.data;
  },

  // ---------- Messages ----------
  sendMessage: async (data: { contact_id: number; text: string; is_note?: boolean; template_id?: number }) => {
    const resp = await api.post("/messages", data);
    return resp.data;
  },
  getMessages: async (contact_id: number): Promise<Message[]> => {
    const resp = await api.get(`/messages/${contact_id}`);
    return resp.data;
  },

  // ---------- Templates ----------
  getTemplates: async (): Promise<Template[]> => {
    const resp = await api.get("/templates");
    return resp.data;
  },
  createTemplate: async (data: Omit<Template, 'id' | 'usage_count' | 'created_at' | 'status'>) => {
    const resp = await api.post("/templates", data);
    return resp.data;
  },
  updateTemplateStatus: async (id: number, status: 'pending' | 'approved' | 'rejected', rejection_reason?: string) => {
    const resp = await api.put(`/templates/${id}/status`, { status, rejection_reason });
    return resp.data;
  },

  // ---------- Broadcasts ----------
  getBroadcasts: async (): Promise<Broadcast[]> => {
    const resp = await api.get("/broadcasts");
    return resp.data;
  },
  createBroadcast: async (data: { name: string; template_id: number; segment: string; scheduled_date: string; scheduled_time: string }) => {
    const resp = await api.post("/broadcasts", data);
    return resp.data;
  },

  // ---------- Automation Rules ----------
  getRules: async (): Promise<AutomationRule[]> => {
    const resp = await api.get("/rules");
    return resp.data;
  },
  updateRule: async (id: number, is_active: boolean) => {
    const resp = await api.put(`/rules/${id}`, { is_active });
    return resp.data;
  },

  // ---------- Analytics ----------
  getAnalytics: async (): Promise<AnalyticsStats> => {
    const resp = await api.get("/analytics/stats");
    return resp.data;
  },

  // ---------- Webhook (for manual testing only) ----------
  verifyWebhook: async (hubMode: string, hubVerifyToken: string, hubChallenge: string) => {
    const resp = await api.get("/webhook", {
      params: {
        'hub.mode': hubMode,
        'hub.verify_token': hubVerifyToken,
        'hub.challenge': hubChallenge,
      },
    });
    return resp.data;
  },
  receiveWebhook: async (payload: any) => {
    const resp = await api.post("/webhook", payload);
    return resp.data;
  },
};