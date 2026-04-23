// import { api } from "./api";

// // ------------------------------------------------------------------
// // Types
// // ------------------------------------------------------------------
// export interface Contact {
//   id: number;
//   name: string;
//   phone: string;
//   tag?: string;
//   stage: string;
//   assigned_to: string;
//   last_message?: string;
//   last_contact_time?: string;
//   color?: string;
//   initials?: string;
//   messages?: Message[];
//   notes?: Note[];
// }

// export interface Message {
//   id: number;
//   contact_id: number;
//   direction: 'in' | 'out' | 'note';
//   text: string;
//   whatsapp_msg_id?: string;
//   is_read?: boolean;
//   time_sent: string;
// }

// export interface Note {
//   id: number;
//   contact_id: number;
//   note: string;
//   created_at: string;
// }

// // ------------------------------------------------------------------
// // WhatsApp CRM API Client (Updated for your backend)
// // ------------------------------------------------------------------
// export const whatsappAPI = {
//   // ---------- Contacts ----------
//   getContacts: async (): Promise<Contact[]> => {
//     const resp = await api.get("/contacts");
//     return resp.data;
//   },
  
//   getContactById: async (id: string | number): Promise<Contact> => {
//     const resp = await api.get(`/contacts/${id}`);
//     return resp.data;
//   },
  
//   createContact: async (data: any) => {
//     const resp = await api.post("/contacts", data);
//     return resp.data;
//   },
  
//   updateContact: async (id: string | number, patch: any) => {
//     const resp = await api.put(`/contacts/${id}`, patch);
//     return resp.data;
//   },
  
//   deleteContact: async (id: string | number) => {
//     const resp = await api.delete(`/contacts/${id}`);
//     return resp.data;
//   },
  
//   addNote: async (contact_id: string | number, note: string) => {
//     const resp = await api.post("/contacts/note", { contact_id, note });
//     return resp.data;
//   },

//   // ---------- Messages (Updated for your backend) ----------
//   sendMessage: async (data: { contact_id: string | number; text: string; is_note?: boolean }) => {
//     const resp = await api.post("/messages/send", data);
//     return resp.data;
//   },
  
//   getMessages: async (contact_id: string | number): Promise<Message[]> => {
//     const resp = await api.get(`/messages/${contact_id}`);
//     return resp.data;
//   },

//   // ---------- Templates (Temporary - Hardcoded) ----------
//   getTemplates: async () => {
//     // Temporary hardcoded templates until backend is ready
//     return [
//       { id: 1, name: 'buyer_welcome', status: 'APPROVED', body: 'Welcome {{1}}! Thank you for your interest.' },
//       { id: 2, name: 'seller_welcome', status: 'APPROVED', body: 'Hi {{1}}, sell your property fast!' }
//     ];
//   },

//   // ---------- Users (Temporary - Hardcoded) ----------
//   getUsers: async () => {
//     // Temporary hardcoded users until backend is ready
//     return [
//       { id: 1, name: 'Ravi Patil', role: 'admin' },
//       { id: 2, name: 'Neha Kulkarni', role: 'sales' }
//     ];
//   },

//   // ---------- Tags (Temporary - Hardcoded) ----------
//   getTags: async () => {
//     // Temporary hardcoded tags until backend is ready
//     return [
//       { id: 1, name: 'Hot Lead', color: '#EF4444' },
//       { id: 2, name: 'Buyer', color: '#3B82F6' },
//       { id: 3, name: 'Seller', color: '#10B981' }
//     ];
//   }
// };

// // src/lib/whatsappAPI.ts
// import { api } from "./api";

// // ------------------------------------------------------------------
// // Types
// // ------------------------------------------------------------------
// export interface Contact {
//   id: number;
//   name: string;
//   phone: string;
//   tag?: string;
//   stage: string;
//   assigned_to: string;
//   last_message?: string;
//   last_contact_time?: string;
//   color?: string;
//   initials?: string;
//   messages?: Message[];
//   notes?: Note[];
// }

// export interface Message {
//   id: number;
//   contact_id: number;
//   direction: 'in' | 'out' | 'note';
//   text: string;
//   whatsapp_msg_id?: string;
//   is_read?: boolean;
//   time_sent: string;
// }

// export interface Note {
//   id: number;
//   contact_id: number;
//   note: string;
//   created_at: string;
// }

// export interface Template {
//   id: number;
//   name: string;
//   label?: string;
//   category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
//   language: string;
//   status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'IN_APPEAL';
//   header_type?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null;
//   header_text?: string | null;
//   body: string;
//   footer?: string | null;
//   buttons?: { type: string; text: string; url?: string }[] | null;
//   variables?: string[];
//   rejection_reason?: string | null;
//   meta_id?: string | null;
//   usage_count?: number;
//   last_used?: string;
//   created_at: string;
//   updated_at?: string;
// }

// // ------------------------------------------------------------------
// // WhatsApp CRM API Client (Full Version)
// // ------------------------------------------------------------------
// export const whatsappAPI = {
//   // ---------- Contacts ----------
//   getContacts: async (): Promise<Contact[]> => {
//     const resp = await api.get("/contacts");
//     return resp.data;
//   },
  
//   getContactById: async (id: string | number): Promise<Contact> => {
//     const resp = await api.get(`/contacts/${id}`);
//     return resp.data;
//   },
  
//   createContact: async (data: any) => {
//     const resp = await api.post("/contacts", data);
//     return resp.data;
//   },
  
//   updateContact: async (id: string | number, patch: any) => {
//     const resp = await api.put(`/contacts/${id}`, patch);
//     return resp.data;
//   },
  
//   deleteContact: async (id: string | number) => {
//     const resp = await api.delete(`/contacts/${id}`);
//     return resp.data;
//   },
  
//   addNote: async (contact_id: string | number, note: string) => {
//     const resp = await api.post("/contacts/note", { contact_id, note });
//     return resp.data;
//   },

//   // ---------- Messages ----------
//   sendMessage: async (data: { contact_id: string | number; text: string; is_note?: boolean }) => {
//     const resp = await api.post("/messages/send", data);
//     return resp.data;
//   },
  
//   getMessages: async (contact_id: string | number): Promise<Message[]> => {
//     const resp = await api.get(`/messages/${contact_id}`);
//     return resp.data;
//   },

//   // ---------- Templates (Full CRUD) ----------
//   getTemplates: async (): Promise<Template[]> => {
//     const resp = await api.get("/templates");
//     return resp.data;
//   },
  
//   getTemplateById: async (id: string | number): Promise<Template> => {
//     const resp = await api.get(`/templates/${id}`);
//     return resp.data;
//   },
  
//   createTemplate: async (data: Partial<Template>): Promise<Template> => {
//     const resp = await api.post("/templates", data);
//     return resp.data;
//   },
  
//   updateTemplate: async (id: string | number, data: Partial<Template>): Promise<Template> => {
//     const resp = await api.put(`/templates/${id}`, data);
//     return resp.data;
//   },
  
//   deleteTemplate: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const resp = await api.delete(`/templates/${id}`);
//     return resp.data;
//   },
  
//   submitTemplateToMeta: async (id: string | number): Promise<{ success: boolean; message: string; template: Template }> => {
//     const resp = await api.post(`/templates/${id}/submit`);
//     return resp.data;
//   },
  
//   updateTemplateStatus: async (id: string | number, status: string, rejection_reason?: string): Promise<{ success: boolean; template: Template }> => {
//     const resp = await api.put(`/templates/${id}/status`, { status, rejection_reason });
//     return resp.data;
//   },

//   // ---------- Users (Temporary - Replace with API call when backend ready) ----------
//   getUsers: async () => {
//     // TODO: Replace with actual API call when users table is ready
//     // const resp = await api.get("/users");
//     // return resp.data;
//     return [
//       { id: 1, name: 'Ravi Patil', role: 'admin' },
//       { id: 2, name: 'Neha Kulkarni', role: 'sales' }
//     ];
//   },

//   // ---------- Tags (Temporary - Replace with API call when backend ready) ----------
//   getTags: async () => {
//     // TODO: Replace with actual API call when tags table is ready
//     // const resp = await api.get("/tags");
//     // return resp.data;
//     return [
//       { id: 1, name: 'Hot Lead', color: '#EF4444' },
//       { id: 2, name: 'Buyer', color: '#3B82F6' },
//       { id: 3, name: 'Seller', color: '#10B981' }
//     ];
//   }
// };

import { api } from "./api";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export interface Contact {
  id: number;
  name: string;
  phone: string;
  tag?: string;
  stage: string;
  assigned_to: string;
  last_message?: string;
  last_contact_time?: string;
  color?: string;
  initials?: string;
  messages?: Message[];
  notes?: Note[];
}

export interface Message {
  id: number;
  contact_id: number;
  direction: 'in' | 'out' | 'note';
  text: string;
  whatsapp_msg_id?: string;
  is_read?: boolean;
  time_sent: string;
}

export interface Note {
  id: number;
  contact_id: number;
  note: string;
  created_at: string;
}

export interface Template {
  id: number;
  name: string;
  label?: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'IN_APPEAL';
  header_type?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null;
  header_text?: string | null;
  body: string;
  footer?: string | null;
  buttons?: { type: string; text: string; url?: string }[] | null;
  variables?: string[];
  rejection_reason?: string | null;
  meta_id?: string | null;
  usage_count?: number;
  last_used?: string;
  created_at: string;
  updated_at?: string;
}

export interface Campaign {
  id: number;
  name: string;
  template_id: number;
  template?: Template;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  total_contacts: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  scheduled_at: string | null;
  filters: any;
  created_at: string;
  updated_at?: string;
}

export interface CampaignLog {
  id: number;
  campaign_id: number;
  contact_id: number;
  contact?: { id: number; name: string; phone: string };
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

// ------------------------------------------------------------------
// WhatsApp CRM API Client (Full Version)
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
  
  createContact: async (data: any) => {
    const resp = await api.post("/contacts", data);
    return resp.data;
  },
  
  updateContact: async (id: string | number, patch: any) => {
    const resp = await api.put(`/contacts/${id}`, patch);
    return resp.data;
  },
  
  deleteContact: async (id: string | number) => {
    const resp = await api.delete(`/contacts/${id}`);
    return resp.data;
  },
  
  addNote: async (contact_id: string | number, note: string) => {
    const resp = await api.post("/contacts/note", { contact_id, note });
    return resp.data;
  },

  // ---------- Messages ----------
  sendMessage: async (data: { contact_id: string | number; text: string; is_note?: boolean }) => {
    const resp = await api.post("/messages/send", data);
    return resp.data;
  },
  
  getMessages: async (contact_id: string | number): Promise<Message[]> => {
    const resp = await api.get(`/messages/${contact_id}`);
    return resp.data;
  },

  // ---------- Templates (Full CRUD) ----------
  getTemplates: async (): Promise<Template[]> => {
    const resp = await api.get("/templates");
    return resp.data;
  },
  
  getTemplateById: async (id: string | number): Promise<Template> => {
    const resp = await api.get(`/templates/${id}`);
    return resp.data;
  },
  
  createTemplate: async (data: Partial<Template>): Promise<Template> => {
    const resp = await api.post("/templates", data);
    return resp.data;
  },
  
  updateTemplate: async (id: string | number, data: any): Promise<Template> => {
    const resp = await api.put(`/templates/${id}`, data);
    return resp.data;
  },
  
  deleteTemplate: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    const resp = await api.delete(`/templates/${id}`);
    return resp.data;
  },
  
  submitTemplateToMeta: async (id: string | number): Promise<{ success: boolean; message: string; template: Template }> => {
    const resp = await api.post(`/templates/${id}/submit`);
    return resp.data;
  },
  
  updateTemplateStatus: async (id: string | number, status: string, rejection_reason?: string): Promise<{ success: boolean; template: Template }> => {
    const resp = await api.put(`/templates/${id}/status`, { status, rejection_reason });
    return resp.data;
  },

  // ---------- Campaigns (Full CRUD) ----------
  getCampaigns: async (): Promise<Campaign[]> => {
    const resp = await api.get("/campaigns");
    return resp.data;
  },

  getCampaignById: async (id: string | number): Promise<Campaign> => {
    const resp = await api.get(`/campaigns/${id}`);
    return resp.data;
  },

  createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
    const resp = await api.post("/campaigns", data);
    return resp.data;
  },

  updateCampaign: async (id: string | number, data: Partial<Campaign>): Promise<Campaign> => {
    const resp = await api.put(`/campaigns/${id}`, data);
    return resp.data;
  },

  deleteCampaign: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    const resp = await api.delete(`/campaigns/${id}`);
    return resp.data;
  },

  launchCampaign: async (id: string | number): Promise<{ success: boolean; campaign: Campaign }> => {
    const resp = await api.post(`/campaigns/${id}/launch`);
    return resp.data;
  },

  getCampaignLogs: async (id: string | number): Promise<CampaignLog[]> => {
    const resp = await api.get(`/campaigns/${id}/logs`);
    return resp.data;
  },

  // ---------- Users (Temporary - Replace with API call when backend ready) ----------
  getUsers: async () => {
    return [
      { id: 1, name: 'Ravi Patil', role: 'admin' },
      { id: 2, name: 'Neha Kulkarni', role: 'sales' }
    ];
  },

  // ---------- Tags (Temporary - Replace with API call when backend ready) ----------
  getTags: async () => {
    return [
      { id: 1, name: 'Hot Lead', color: '#EF4444' },
      { id: 2, name: 'Buyer', color: '#3B82F6' },
      { id: 3, name: 'Seller', color: '#10B981' }
    ];
  }
};