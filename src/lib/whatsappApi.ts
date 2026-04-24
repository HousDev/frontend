// // // src/lib/whatsappAPI.ts
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

// export interface Campaign {
//   id: number;
//   name: string;
//   template_id: number;
//   template?: Template;
//   status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
//   total_contacts: number;
//   sent_count: number;
//   delivered_count: number;
//   read_count: number;
//   failed_count: number;
//   scheduled_at: string | null;
//   filters: any;
//   created_at: string;
//   updated_at?: string;
// }

// export interface CampaignLog {
//   id: number;
//   campaign_id: number;
//   contact_id: number;
//   contact?: { id: number; name: string; phone: string };
//   status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
//   error_message?: string;
//   sent_at?: string;
//   delivered_at?: string;
//   read_at?: string;
//   created_at: string;
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
  
//   updateTemplate: async (id: string | number, data: any): Promise<Template> => {
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

//   // ---------- Campaigns (Full CRUD) ----------
//   getCampaigns: async (): Promise<Campaign[]> => {
//     const resp = await api.get("/campaigns");
//     return resp.data;
//   },

//   getCampaignById: async (id: string | number): Promise<Campaign> => {
//     const resp = await api.get(`/campaigns/${id}`);
//     return resp.data;
//   },

//   createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
//     const resp = await api.post("/campaigns", data);
//     return resp.data;
//   },

//   updateCampaign: async (id: string | number, data: Partial<Campaign>): Promise<Campaign> => {
//     const resp = await api.put(`/campaigns/${id}`, data);
//     return resp.data;
//   },

//   deleteCampaign: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const resp = await api.delete(`/campaigns/${id}`);
//     return resp.data;
//   },

//   launchCampaign: async (id: string | number): Promise<{ success: boolean; campaign: Campaign }> => {
//     const resp = await api.post(`/campaigns/${id}/launch`);
//     return resp.data;
//   },

//   getCampaignLogs: async (id: string | number): Promise<CampaignLog[]> => {
//     const resp = await api.get(`/campaigns/${id}/logs`);
//     return resp.data;
//   },

//   // ---------- Users (Temporary - Replace with API call when backend ready) ----------
//   getUsers: async () => {
//     return [
//       { id: 1, name: 'Ravi Patil', role: 'admin' },
//       { id: 2, name: 'Neha Kulkarni', role: 'sales' }
//     ];
//   },

//   // ---------- Tags (Temporary - Replace with API call when backend ready) ----------
//   getTags: async () => {
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

// export interface CarouselCard {
//   header_type: 'IMAGE' | 'VIDEO';
//   header_url: string;
//   body: string;
//   buttons?: TemplateButton[];
// }

// export interface TemplateButton {
//   type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
//   text: string;
//   url?: string;
//   country_code?: string;
//   phone_number?: string;
//   coupon_code?: string;
// }

// export interface Template {
//   id: number;
//   name: string;
//   label?: string;
//   category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
//   template_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CAROUSEL' | 'LIMITED_TIME_OFFER';
//   language: string;
//   status: 'DRAFT' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'IN_APPEAL';
//   header_type?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null;
//   header_text?: string | null;
//   header_media_url?: string | null;
//   body: string;
//   footer?: string | null;
//   buttons?: TemplateButton[] | null;
//   variables?: string[] | null;
//   rejection_reason?: string | null;
//   meta_id?: string | null;
//   usage_count?: number;
//   last_used?: string;
//   created_at: string;
//   updated_at?: string;
//   // Location specific fields
//   location_name?: string;
//   location_address?: string;
//   location_lat?: number;
//   location_lng?: number;
//   // Carousel specific fields
//   carousel_cards?: CarouselCard[] | null;
//   // Limited Time Offer specific fields
//   lto_has_expiry?: boolean;
//   lto_expiration_time_ms?: number | null;
//   lto_coupon_code?: string | null;
// }

// export interface Campaign {
//   id: number;
//   name: string;
//   template_id: number;
//   template?: Template;
//   status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
//   total_contacts: number;
//   sent_count: number;
//   delivered_count: number;
//   read_count: number;
//   failed_count: number;
//   scheduled_at: string | null;
//   filters: any;
//   created_at: string;
//   updated_at?: string;
// }

// export interface CampaignLog {
//   id: number;
//   campaign_id: number;
//   contact_id: number;
//   contact?: { id: number; name: string; phone: string };
//   status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
//   error_message?: string;
//   sent_at?: string;
//   delivered_at?: string;
//   read_at?: string;
//   created_at: string;
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

//   // ---------- Templates (Full CRUD with new fields) ----------
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
  
//   syncTemplateStatus: async (): Promise<{ success: boolean; updated: number; templates: Template[] }> => {
//     const resp = await api.post("/templates/sync");
//     return resp.data;
//   },

//   // ---------- Campaigns (Full CRUD) ----------
//   getCampaigns: async (): Promise<Campaign[]> => {
//     const resp = await api.get("/campaigns");
//     return resp.data;
//   },

//   getCampaignById: async (id: string | number): Promise<Campaign> => {
//     const resp = await api.get(`/campaigns/${id}`);
//     return resp.data;
//   },

//   createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
//     const resp = await api.post("/campaigns", data);
//     return resp.data;
//   },

//   updateCampaign: async (id: string | number, data: Partial<Campaign>): Promise<Campaign> => {
//     const resp = await api.put(`/campaigns/${id}`, data);
//     return resp.data;
//   },

//   deleteCampaign: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const resp = await api.delete(`/campaigns/${id}`);
//     return resp.data;
//   },

//   launchCampaign: async (id: string | number): Promise<{ success: boolean; campaign: Campaign }> => {
//     const resp = await api.post(`/campaigns/${id}/launch`);
//     return resp.data;
//   },

//   getCampaignLogs: async (id: string | number): Promise<CampaignLog[]> => {
//     const resp = await api.get(`/campaigns/${id}/logs`);
//     return resp.data;
//   },

//   // ---------- Users (Temporary - Replace with API call when backend ready) ----------
//   getUsers: async () => {
//     return [
//       { id: 1, name: 'Ravi Patil', role: 'admin' },
//       { id: 2, name: 'Neha Kulkarni', role: 'sales' }
//     ];
//   },

//   // ---------- Tags (Temporary - Replace with API call when backend ready) ----------
//   getTags: async () => {
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

// export interface CarouselCard {
//   header_type: 'IMAGE' | 'VIDEO';
//   header_url: string;
//   body: string;
//   buttons?: TemplateButton[];
// }

// export interface TemplateButton {
//   type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
//   text: string;
//   url?: string;
//   country_code?: string;
//   phone_number?: string;
//   coupon_code?: string;
// }

// export interface Template {
//   id: number;
//   name: string;
//   label?: string;
//   category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
//   template_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CAROUSEL' | 'LIMITED_TIME_OFFER';
//   language: string;
//   status: 'DRAFT' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'IN_APPEAL';
//   header_type?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null;
//   header_text?: string | null;
//   header_media_url?: string | null;
//   body: string;
//   footer?: string | null;
//   buttons?: TemplateButton[] | null;
//   variables?: string[] | null;
//   rejection_reason?: string | null;
//   meta_id?: string | null;
//   usage_count?: number;
//   last_used?: string;
//   created_at: string;
//   updated_at?: string;
//   location_name?: string;
//   location_address?: string;
//   location_lat?: number;
//   location_lng?: number;
//   carousel_cards?: CarouselCard[] | null;
//   lto_has_expiry?: boolean;
//   lto_expiration_time_ms?: number | null;
//   lto_coupon_code?: string | null;
// }

// export interface Campaign {
//   id: number;
//   name: string;
//   template_id: number;
//   template?: Template;
//   status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
//   total_contacts: number;
//   sent_count: number;
//   delivered_count: number;
//   read_count: number;
//   failed_count: number;
//   scheduled_at: string | null;
//   filters: any;
//   audience_mode?: 'segment' | 'upload' | 'manual';
//   audience_filters?: any;
//   selected_contact_ids?: number[];
//   uploaded_contacts?: { name: string; phone: string }[];
//   template_variables?: string[];
//   media_url?: string;
//   carousel_media?: string[];
//   estimated_cost?: number;
//   created_at: string;
//   updated_at?: string;
// }

// export interface CampaignLog {
//   id: number;
//   campaign_id: number;
//   contact_id: number;
//   contact?: { id: number; name: string; phone: string; stage?: string };
//   status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
//   error_message?: string;
//   whatsapp_msg_id?: string;
//   sent_at?: string;
//   delivered_at?: string;
//   read_at?: string;
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

//   // ---------- Templates ----------
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
  
//   syncTemplateStatus: async (): Promise<{ success: boolean; updated: number; templates: Template[] }> => {
//     const resp = await api.post("/templates/sync");
//     return resp.data;
//   },

//   // ---------- Campaigns ----------
//   getCampaigns: async (): Promise<Campaign[]> => {
//     const resp = await api.get("/campaigns");
//     return resp.data;
//   },

//   getCampaignById: async (id: string | number): Promise<Campaign> => {
//     const resp = await api.get(`/campaigns/${id}`);
//     return resp.data;
//   },

//   createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
//     const resp = await api.post("/campaigns", data);
//     return resp.data;
//   },

//   updateCampaign: async (id: string | number, data: Partial<Campaign>): Promise<Campaign> => {
//     const resp = await api.put(`/campaigns/${id}`, data);
//     return resp.data;
//   },

//   deleteCampaign: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const resp = await api.delete(`/campaigns/${id}`);
//     return resp.data;
//   },

//   launchCampaign: async (id: string | number): Promise<{ success: boolean; campaign: Campaign }> => {
//     const resp = await api.post(`/campaigns/${id}/launch`);
//     return resp.data;
//   },

//   getCampaignLogs: async (id: string | number): Promise<CampaignLog[]> => {
//     const resp = await api.get(`/campaigns/${id}/logs`);
//     return resp.data;
//   },

//   // ---------- Users (Temporary - Replace with API call when backend ready) ----------
//   getUsers: async () => {
//     return [
//       { id: 1, name: 'Ravi Patil', role: 'admin' },
//       { id: 2, name: 'Neha Kulkarni', role: 'sales' }
//     ];
//   },

//   // ---------- Tags (Temporary - Replace with API call when backend ready) ----------
//   getTags: async () => {
//     return [
//       { id: 1, name: 'Hot Lead', color: '#EF4444' },
//       { id: 2, name: 'Buyer', color: '#3B82F6' },
//       { id: 3, name: 'Seller', color: '#10B981' }
//     ];
//   }
// };

// src/lib/whatsappAPI.ts
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

export interface CarouselCard {
  header_type: 'IMAGE' | 'VIDEO';
  header_url: string;
  body: string;
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
  text: string;
  url?: string;
  country_code?: string;
  phone_number?: string;
  coupon_code?: string;
}

export interface Template {
  id: number;
  name: string;
  label?: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  template_type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CAROUSEL' | 'LIMITED_TIME_OFFER';
  language: string;
  status: 'DRAFT' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'IN_APPEAL';
  header_type?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null;
  header_text?: string | null;
  header_media_url?: string | null;
  body: string;
  footer?: string | null;
  buttons?: TemplateButton[] | null;
  variables?: string[] | null;
  rejection_reason?: string | null;
  meta_id?: string | null;
  usage_count?: number;
  last_used?: string;
  created_at: string;
  updated_at?: string;
  location_name?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  carousel_cards?: CarouselCard[] | null;
  lto_has_expiry?: boolean;
  lto_expiration_time_ms?: number | null;
  lto_coupon_code?: string | null;
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
  audience_mode?: 'segment' | 'upload' | 'manual';
  audience_filters?: any;
  selected_contact_ids?: number[];
  uploaded_contacts?: { name: string; phone: string }[];
  template_variables?: string[];
  media_url?: string;
  carousel_media?: string[];
  estimated_cost?: number;
  created_at: string;
  updated_at?: string;
}

export interface CampaignLog {
  id: number;
  campaign_id: number;
  contact_id: number;
  contact?: { id: number; name: string; phone: string; stage?: string };
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  whatsapp_msg_id?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  updated_at?: string;
}

// ------------------------------------------------------------------
// Helper function to handle API responses consistently
// ------------------------------------------------------------------
const handleResponse = <T>(response: any): T => {
  // If response has data property (axios), return it, otherwise return response
  return response.data !== undefined ? response.data : response;
};

// ------------------------------------------------------------------
// WhatsApp CRM API Client (Full Version)
// ------------------------------------------------------------------
export const whatsappAPI = {
  // ---------- Contacts ----------
  getContacts: async (): Promise<Contact[]> => {
    const response = await api.get("/contacts");
    return handleResponse(response);
  },
  
  getContactById: async (id: string | number): Promise<Contact> => {
    const response = await api.get(`/contacts/${id}`);
    return handleResponse(response);
  },
  
  createContact: async (data: any) => {
    const response = await api.post("/contacts", data);
    return handleResponse(response);
  },
  
  updateContact: async (id: string | number, patch: any) => {
    const response = await api.put(`/contacts/${id}`, patch);
    return handleResponse(response);
  },
  
  deleteContact: async (id: string | number) => {
    const response = await api.delete(`/contacts/${id}`);
    return handleResponse(response);
  },
  
  addNote: async (contact_id: string | number, note: string) => {
    const response = await api.post("/contacts/note", { contact_id, note });
    return handleResponse(response);
  },

  // ---------- Messages ----------
  sendMessage: async (data: { contact_id: string | number; text: string; is_note?: boolean }) => {
    const response = await api.post("/messages/send", data);
    return handleResponse(response);
  },
  
  getMessages: async (contact_id: string | number): Promise<Message[]> => {
    const response = await api.get(`/messages/${contact_id}`);
    return handleResponse(response);
  },

  // ---------- Templates ----------
  getTemplates: async (): Promise<Template[]> => {
    const response = await api.get("/templates");
    return handleResponse(response);
  },
  
  getTemplateById: async (id: string | number): Promise<Template> => {
    const response = await api.get(`/templates/${id}`);
    return handleResponse(response);
  },
  
  createTemplate: async (data: any): Promise<Template> => {
    const response = await api.post("/templates", data);
    return handleResponse(response);
  },
  
  updateTemplate: async (id: string | number, data: any): Promise<Template> => {
    const response = await api.put(`/templates/${id}`, data);
    return handleResponse(response);
  },
  
  deleteTemplate: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/templates/${id}`);
    return handleResponse(response);
  },
  
  submitTemplateToMeta: async (id: string | number): Promise<{ success: boolean; message: string; template: Template }> => {
    const response = await api.post(`/templates/${id}/submit`);
    return handleResponse(response);
  },
  
  syncTemplateStatus: async (): Promise<{ success: boolean; updated: number; templates: Template[] }> => {
    const response = await api.post("/templates/sync");
    return handleResponse(response);
  },

  // ---------- Campaigns ----------
  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get("/campaigns");
    return handleResponse(response);
  },

  getCampaignById: async (id: string | number): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`);
    return handleResponse(response);
  },

  createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.post("/campaigns", data);
    return handleResponse(response);
  },

  updateCampaign: async (id: string | number, data: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.put(`/campaigns/${id}`, data);
    return handleResponse(response);
  },

  deleteCampaign: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/campaigns/${id}`);
    return handleResponse(response);
  },

  launchCampaign: async (id: string | number): Promise<{ success: boolean; campaign: Campaign }> => {
    const response = await api.post(`/campaigns/${id}/launch`);
    return handleResponse(response);
  },

  getCampaignLogs: async (id: string | number): Promise<CampaignLog[]> => {
    const response = await api.get(`/campaigns/${id}/logs`);
    return handleResponse(response);
  },

  // ---------- Campaign Logs - Resend Methods ----------
  resendMessage: async (campaignId: string | number, logId: string | number): Promise<void> => {
    const response = await api.post(`/campaigns/${campaignId}/logs/${logId}/resend`);
    return handleResponse(response);
  },

  resendAllFailed: async (campaignId: string | number): Promise<void> => {
    const response = await api.post(`/campaigns/${campaignId}/resend-failed`);
    return handleResponse(response);
  },

  // ---------- Media Upload ----------
  uploadMedia: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    const result:any = handleResponse(response);
    return result.url || result.data?.url || result;
  },

  // ---------- Contact Counting ----------
  estimateContactCount: async (filters: any): Promise<number> => {
    const response = await api.post("/contacts/count", filters);
    const result:any = handleResponse(response);
    return result.count || result;
  },

  // ---------- Users ----------
  getUsers: async () => {
    try {
      const response = await api.get("/users");
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching users, using mock data:", error);
      // Fallback to mock data if API fails
      return [
        { id: 1, name: 'Ravi Patil', role: 'admin' },
        { id: 2, name: 'Neha Kulkarni', role: 'sales' }
      ];
    }
  },

  // ---------- Tags ----------
  getTags: async () => {
    try {
      const response = await api.get("/tags");
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching tags, using mock data:", error);
      // Fallback to mock data if API fails
      return [
        { id: 1, name: 'Hot Lead', color: '#EF4444' },
        { id: 2, name: 'Buyer', color: '#3B82F6' },
        { id: 3, name: 'Seller', color: '#10B981' }
      ];
    }
  }
};