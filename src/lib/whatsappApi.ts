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
// // Helper function to handle API responses consistently
// // ------------------------------------------------------------------
// const handleResponse = <T>(response: any): T => {
//   // If response has data property (axios), return it, otherwise return response
//   return response.data !== undefined ? response.data : response;
// };

// // ------------------------------------------------------------------
// // WhatsApp CRM API Client (Full Version)
// // ------------------------------------------------------------------
// export const whatsappAPI = {
//   // ---------- Contacts ----------
//   getContacts: async (): Promise<Contact[]> => {
//     const response = await api.get("/contacts");
//     return handleResponse(response);
//   },
  
//   getContactById: async (id: string | number): Promise<Contact> => {
//     const response = await api.get(`/contacts/${id}`);
//     return handleResponse(response);
//   },
  
//   createContact: async (data: any) => {
//     const response = await api.post("/contacts", data);
//     return handleResponse(response);
//   },
  
//   updateContact: async (id: string | number, patch: any) => {
//     const response = await api.put(`/contacts/${id}`, patch);
//     return handleResponse(response);
//   },
  
//   deleteContact: async (id: string | number) => {
//     const response = await api.delete(`/contacts/${id}`);
//     return handleResponse(response);
//   },
  
//   addNote: async (contact_id: string | number, note: string) => {
//     const response = await api.post("/contacts/note", { contact_id, note });
//     return handleResponse(response);
//   },

//   // ---------- Messages ----------
//   sendMessage: async (data: { contact_id: string | number; text: string; is_note?: boolean }) => {
//     const response = await api.post("/messages/send", data);
//     return handleResponse(response);
//   },
  
//   getMessages: async (contact_id: string | number): Promise<Message[]> => {
//     const response = await api.get(`/messages/${contact_id}`);
//     return handleResponse(response);
//   },

//   // ---------- Templates ----------
//   getTemplates: async (): Promise<Template[]> => {
//     const response = await api.get("/templates");
//     return handleResponse(response);
//   },
  
//   getTemplateById: async (id: string | number): Promise<Template> => {
//     const response = await api.get(`/templates/${id}`);
//     return handleResponse(response);
//   },
  
//   createTemplate: async (data: any): Promise<Template> => {
//     const response = await api.post("/templates", data);
//     return handleResponse(response);
//   },
  
//   updateTemplate: async (id: string | number, data: any): Promise<Template> => {
//     const response = await api.put(`/templates/${id}`, data);
//     return handleResponse(response);
//   },
  
//   deleteTemplate: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const response = await api.delete(`/templates/${id}`);
//     return handleResponse(response);
//   },
  
//   submitTemplateToMeta: async (id: string | number): Promise<{ success: boolean; message: string; template: Template }> => {
//     const response = await api.post(`/templates/${id}/submit`);
//     return handleResponse(response);
//   },
  
//   syncTemplateStatus: async (): Promise<{ success: boolean; updated: number; templates: Template[] }> => {
//     const response = await api.post("/templates/sync");
//     return handleResponse(response);
//   },

//   // ---------- Campaigns ----------
//   getCampaigns: async (): Promise<Campaign[]> => {
//     const response = await api.get("/campaigns");
//     return handleResponse(response);
//   },

//   getCampaignById: async (id: string | number): Promise<Campaign> => {
//     const response = await api.get(`/campaigns/${id}`);
//     return handleResponse(response);
//   },

//   createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
//     const response = await api.post("/campaigns", data);
//     return handleResponse(response);
//   },

//   updateCampaign: async (id: string | number, data: Partial<Campaign>): Promise<Campaign> => {
//     const response = await api.put(`/campaigns/${id}`, data);
//     return handleResponse(response);
//   },

//   deleteCampaign: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const response = await api.delete(`/campaigns/${id}`);
//     return handleResponse(response);
//   },

//   launchCampaign: async (id: string | number): Promise<{ success: boolean; campaign: Campaign }> => {
//     const response = await api.post(`/campaigns/${id}/launch`);
//     return handleResponse(response);
//   },

//   getCampaignLogs: async (id: string | number): Promise<CampaignLog[]> => {
//     const response = await api.get(`/campaigns/${id}/logs`);
//     return handleResponse(response);
//   },

//   // ---------- Campaign Logs - Resend Methods ----------
//   resendMessage: async (campaignId: string | number, logId: string | number): Promise<void> => {
//     const response = await api.post(`/campaigns/${campaignId}/logs/${logId}/resend`);
//     return handleResponse(response);
//   },

//   resendAllFailed: async (campaignId: string | number): Promise<void> => {
//     const response = await api.post(`/campaigns/${campaignId}/resend-failed`);
//     return handleResponse(response);
//   },

//   // ---------- Media Upload ----------
//   uploadMedia: async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append('file', file);
    
//     const response = await api.post("/media/upload", formData, {
//       headers: { "Content-Type": "multipart/form-data" }
//     });
    
//     const result:any = handleResponse(response);
//     return result.url || result.data?.url || result;
//   },

//   // ---------- Contact Counting ----------
//   estimateContactCount: async (filters: any): Promise<number> => {
//     const response = await api.post("/contacts/count", filters);
//     const result:any = handleResponse(response);
//     return result.count || result;
//   },

//   // ---------- Users ----------
//   getUsers: async () => {
//     try {
//       const response = await api.get("/users");
//       return handleResponse(response);
//     } catch (error) {
//       console.error("Error fetching users, using mock data:", error);
//       // Fallback to mock data if API fails
//       return [
//         { id: 1, name: 'Ravi Patil', role: 'admin' },
//         { id: 2, name: 'Neha Kulkarni', role: 'sales' }
//       ];
//     }
//   },

//   // ---------- Tags ----------
//   getTags: async () => {
//     try {
//       const response = await api.get("/tags");
//       return handleResponse(response);
//     } catch (error) {
//       console.error("Error fetching tags, using mock data:", error);
//       // Fallback to mock data if API fails
//       return [
//         { id: 1, name: 'Hot Lead', color: '#EF4444' },
//         { id: 2, name: 'Buyer', color: '#3B82F6' },
//         { id: 3, name: 'Seller', color: '#10B981' }
//       ];
//     }
//   }
// };

// src/lib/whatsappAPI.ts
// import { api } from "./api";

// // ------------------------------------------------------------------
// // Types
// // ------------------------------------------------------------------
// export interface Contact {
//   id: number;
//   name: string;
//   phone: string;
//   email?: string;
//   tag?: string;
//   stage: string;
//   assigned_to: string;
//   preferred_location?: string;
//   property_type?: string;
//   source?: string;
//   budget_min?: number;
//   budget_max?: number;
//   notes?: string;
//   last_message?: string;
//   last_contact_time?: string;
//   color?: string;
//   initials?: string;
//   messages?: Message[];
//   notesList?: Note[];
//   tags?: Tag[];
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
//   author_id?: number;
//   author_name?: string;
//   note: string;
//   created_at: string;
//   updated_at?: string;
// }

// export interface Tag {
//   id: number;
//   name: string;
//   color: string;
//   created_by?: number;
//   created_at?: string;
//   updated_at?: string;
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

// // Chatbot Flow Types
// export interface ChatbotFlow {
//   id: string;
//   name: string;
//   description?: string | null;
//   trigger_keyword?: string | null;
//   is_active: boolean;
//   is_default: boolean;
//   steps?: FlowStep[];
//   created_at: string;
//   updated_at: string;
// }

// export interface FlowStep {
//   id: string;
//   flow_id: string;
//   step_index: number;
//   step_type: 'message' | 'question' | 'buttons' | 'tag' | 'assign' | 'stage' | 'template' | 'condition' | 'end';
//   message_text?: string | null;
//   buttons?: FlowButton[] | null;
//   save_response_as?: string | null;
//   tag_id?: number | null;
//   assign_to?: string | null;
//   stage?: string | null;
//   template_id?: number | null;
//   next_step_index?: number | null;
//   conditions?: Record<string, number> | null;
//   created_at: string;
//   updated_at?: string;
// }

// export interface FlowButton {
//   id?: string;
//   title: string;
//   next_step?: number;
// }

// // CrmUser Type
// export interface CrmUser {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   is_active?: boolean;
// }

// // ------------------------------------------------------------------
// // Helper function to handle API responses consistently
// // ------------------------------------------------------------------
// const handleResponse = <T>(response: any): T => {
//   // If response has data property (axios), return it, otherwise return response
//   return response.data !== undefined ? response.data : response;
// };

// // ------------------------------------------------------------------
// // WhatsApp CRM API Client (Full Version)
// // ------------------------------------------------------------------
// export const whatsappAPI = {
//   // ---------- Contacts ----------
//   getContacts: async (): Promise<Contact[]> => {
//     const response = await api.get("/contacts");
//     return handleResponse(response);
//   },
  
//   getContactById: async (id: string | number): Promise<Contact> => {
//     const response = await api.get(`/contacts/${id}`);
//     return handleResponse(response);
//   },

//   getContactWithDetails: async (id: string | number): Promise<Contact> => {
//     const response = await api.get(`/contacts/${id}/details`);
//     return handleResponse(response);
//   },
  
//   createContact: async (data: any) => {
//     const response = await api.post("/contacts", data);
//     return handleResponse(response);
//   },
  
//   updateContact: async (id: string | number, patch: any) => {
//     const response = await api.put(`/contacts/${id}`, patch);
//     return handleResponse(response);
//   },
  
//   deleteContact: async (id: string | number) => {
//     const response = await api.delete(`/contacts/${id}`);
//     return handleResponse(response);
//   },

//   updateContactStage: async (id: string | number, stage: string) => {
//     const response = await api.patch(`/contacts/${id}/stage`, { stage });
//     return handleResponse(response);
//   },

//   assignContact: async (id: string | number, assignedTo: string) => {
//     const response = await api.patch(`/contacts/${id}/assign`, { assigned_to: assignedTo });
//     return handleResponse(response);
//   },

//   searchContacts: async (query: string): Promise<Contact[]> => {
//     const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`);
//     return handleResponse(response);
//   },

//   getContactStats: async (): Promise<any> => {
//     const response = await api.get("/contacts/stats");
//     return handleResponse(response);
//   },
  
//   // ---------- Notes ----------
//   addNote: async (contact_id: string | number, user_id: string | number, note: string) => {
//     const response = await api.post("/contacts/note", { contact_id, user_id, note });
//     return handleResponse(response);
//   },

//   addContactNote: async (contact_id: string | number, note: string): Promise<Note> => {
//     const response = await api.post(`/contacts/${contact_id}/notes`, { note });
//     return handleResponse(response);
//   },

//   getContactNotes: async (contact_id: string | number): Promise<Note[]> => {
//     const response = await api.get(`/contacts/${contact_id}/notes`);
//     return handleResponse(response);
//   },

//   // ---------- Tags ----------
//   getTags: async (): Promise<Tag[]> => {
//     try {
//       const response = await api.get("/contacts/tags/all");
//       return handleResponse(response);
//     } catch (error) {
//       console.error("Error fetching tags:", error);
//       return [];
//     }
//   },

//   getTagById: async (id: string | number): Promise<Tag> => {
//     const response = await api.get(`/contacts/tags/${id}`);
//     return handleResponse(response);
//   },

//   createTag: async (name: string, color?: string): Promise<Tag> => {
//     const response = await api.post("/contacts/tags", { name, color });
//     return handleResponse(response);
//   },

//   updateTag: async (id: string | number, data: { name?: string; color?: string }): Promise<Tag> => {
//     const response = await api.put(`/contacts/tags/${id}`, data);
//     return handleResponse(response);
//   },

//   deleteTag: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const response = await api.delete(`/contacts/tags/${id}`);
//     return handleResponse(response);
//   },

//   getContactTags: async (contactId: string | number): Promise<Tag[]> => {
//     const response = await api.get(`/contacts/${contactId}/tags`);
//     return handleResponse(response);
//   },

//   addTagToContact: async (contactId: string | number, tagId: string | number): Promise<{ success: boolean; tags: Tag[] }> => {
//     const response = await api.post(`/contacts/${contactId}/tags`, { tag_id: tagId });
//     return handleResponse(response);
//   },

//   removeTagFromContact: async (contactId: string | number, tagId: string | number): Promise<{ success: boolean; tags: Tag[] }> => {
//     const response = await api.delete(`/contacts/${contactId}/tags/${tagId}`);
//     return handleResponse(response);
//   },

//   // ---------- Messages ----------
//   sendMessage: async (data: { contact_id: string | number; text: string; is_note?: boolean }) => {
//     const response = await api.post("/messages/send", data);
//     return handleResponse(response);
//   },
  
//   getMessages: async (contact_id: string | number): Promise<Message[]> => {
//     const response = await api.get(`/messages/${contact_id}`);
//     return handleResponse(response);
//   },

//   // ---------- Templates ----------
//   getTemplates: async (): Promise<Template[]> => {
//     const response = await api.get("/templates");
//     return handleResponse(response);
//   },
  
//   getTemplateById: async (id: string | number): Promise<Template> => {
//     const response = await api.get(`/templates/${id}`);
//     return handleResponse(response);
//   },
  
//   createTemplate: async (data: any): Promise<Template> => {
//     const response = await api.post("/templates", data);
//     return handleResponse(response);
//   },
  
//   updateTemplate: async (id: string | number, data: any): Promise<Template> => {
//     const response = await api.put(`/templates/${id}`, data);
//     return handleResponse(response);
//   },
  
//   deleteTemplate: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const response = await api.delete(`/templates/${id}`);
//     return handleResponse(response);
//   },
  
//   submitTemplateToMeta: async (id: string | number): Promise<{ success: boolean; message: string; template: Template }> => {
//     const response = await api.post(`/templates/${id}/submit`);
//     return handleResponse(response);
//   },
  
//   syncTemplateStatus: async (): Promise<{ success: boolean; updated: number; templates: Template[] }> => {
//     const response = await api.post("/templates/sync");
//     return handleResponse(response);
//   },

//   // ---------- Campaigns ----------
//   getCampaigns: async (): Promise<Campaign[]> => {
//     const response = await api.get("/campaigns");
//     return handleResponse(response);
//   },

//   getCampaignById: async (id: string | number): Promise<Campaign> => {
//     const response = await api.get(`/campaigns/${id}`);
//     return handleResponse(response);
//   },

//   createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
//     const response = await api.post("/campaigns", data);
//     return handleResponse(response);
//   },

//   updateCampaign: async (id: string | number, data: Partial<Campaign>): Promise<Campaign> => {
//     const response = await api.put(`/campaigns/${id}`, data);
//     return handleResponse(response);
//   },

//   deleteCampaign: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const response = await api.delete(`/campaigns/${id}`);
//     return handleResponse(response);
//   },

//   launchCampaign: async (id: string | number): Promise<{ success: boolean; campaign: Campaign }> => {
//     const response = await api.post(`/campaigns/${id}/launch`);
//     return handleResponse(response);
//   },

//   getCampaignLogs: async (id: string | number): Promise<CampaignLog[]> => {
//     const response = await api.get(`/campaigns/${id}/logs`);
//     return handleResponse(response);
//   },

//   // ---------- Campaign Logs - Resend Methods ----------
//   resendMessage: async (campaignId: string | number, logId: string | number): Promise<void> => {
//     const response = await api.post(`/campaigns/${campaignId}/logs/${logId}/resend`);
//     return handleResponse(response);
//   },

//   resendAllFailed: async (campaignId: string | number): Promise<void> => {
//     const response = await api.post(`/campaigns/${campaignId}/resend-failed`);
//     return handleResponse(response);
//   },

//   // ---------- Media Upload ----------
//   uploadMedia: async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append('file', file);
    
//     const response = await api.post("/media/upload", formData, {
//       headers: { "Content-Type": "multipart/form-data" }
//     });
    
//     const result: any = handleResponse(response);
//     return result.url || result.data?.url || result;
//   },

//   // ---------- Contact Counting ----------
//   estimateContactCount: async (filters: any): Promise<number> => {
//     const response = await api.post("/contacts/count", filters);
//     const result: any = handleResponse(response);
//     return result.count || result;
//   },

//   // ---------- Chatbot Flows ----------
//   getChatbotFlows: async (): Promise<ChatbotFlow[]> => {
//     const response = await api.get("/chatbot/flows");
//     return handleResponse(response);
//   },

//   getChatbotFlowById: async (id: string | number): Promise<ChatbotFlow> => {
//     const response = await api.get(`/chatbot/flows/${id}`);
//     return handleResponse(response);
//   },

//   createChatbotFlow: async (data: Partial<ChatbotFlow>): Promise<ChatbotFlow> => {
//     const response = await api.post("/chatbot/flows", data);
//     return handleResponse(response);
//   },

//   updateChatbotFlow: async (id: string | number, data: Partial<ChatbotFlow>): Promise<ChatbotFlow> => {
//     const response = await api.put(`/chatbot/flows/${id}`, data);
//     return handleResponse(response);
//   },

//   deleteChatbotFlow: async (id: string | number): Promise<{ success: boolean; message: string }> => {
//     const response = await api.delete(`/chatbot/flows/${id}`);
//     return handleResponse(response);
//   },

//   toggleChatbotFlow: async (id: string | number, isActive: boolean): Promise<ChatbotFlow> => {
//     const response = await api.patch(`/chatbot/flows/${id}/toggle`, { is_active: isActive });
//     return handleResponse(response);
//   },

//   processChatbotMessage: async (contactId: string | number, message: string): Promise<any> => {
//     const response = await api.post("/chatbot/process", { contactId, message });
//     return handleResponse(response);
//   },

//   getChatbotFlowLogs: async (id: string | number): Promise<any[]> => {
//     const response = await api.get(`/chatbot/flows/${id}/logs`);
//     return handleResponse(response);
//   },

//   getActiveChatbotConversations: async (): Promise<any[]> => {
//     const response = await api.get("/chatbot/conversations/active");
//     return handleResponse(response);
//   },

//   // ---------- Users ----------
//   getUsers: async (): Promise<CrmUser[]> => {
//     try {
//       const response = await api.get("/users/get-all-user");
//       console.log("response : ",response)
//       return handleResponse(response);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       return [
//         { id: 1, name: 'Ravi Patil', email: 'ravi@example.com', role: 'admin', is_active: true },
//         { id: 2, name: 'Neha Kulkarni', email: 'neha@example.com', role: 'sales', is_active: true }
//       ];
//     }
//   },

//   getSalesExecutives: async (): Promise<CrmUser[]> => {
//     try {
//       const response = await api.get("/users/sales-executives");
//       return handleResponse(response);
//     } catch (error) {
//       console.error("Error fetching sales executives:", error);
//       return [
//         { id: 2, name: 'Neha Kulkarni', email: 'neha@example.com', role: 'sales', is_active: true }
//       ];
//     }
//   },
// };


import { api } from "./api";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export interface Contact {
  id: number;
  name: string;
  phone: string;
  email?: string;
  tag?: string;
  stage: string;
  assigned_to: string;
  preferred_location?: string;
  property_type?: string;
  source?: string;
  budget_min?: number;
  budget_max?: number;
  notes?: string;
  last_message?: string;
  last_contact_time?: string;
  color?: string;
  initials?: string;
  messages?: Message[];
  notesList?: Note[];
  tags?: Tag[];
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
  author_id?: number;
  author_name?: string;
  note: string;
  created_at: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
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

// Chatbot Flow Types
export interface ChatbotFlow {
  id: string;
  name: string;
  description?: string | null;
  trigger_keyword?: string | null;
  is_active: boolean;
  is_default: boolean;
  steps?: FlowStep[];
  created_at: string;
  updated_at: string;
}

export interface FlowStep {
  id: string;
  flow_id: string;
  step_index: number;
  step_type: 'message' | 'question' | 'buttons' | 'tag' | 'assign' | 'stage' | 'template' | 'condition' | 'end';
  message_text?: string | null;
  buttons?: FlowButton[] | null;
  save_response_as?: string | null;
  tag_id?: number | null;
  assign_to?: string | null;
  stage?: string | null;
  template_id?: number | null;
  next_step_index?: number | null;
  conditions?: Record<string, number> | null;
  created_at: string;
  updated_at?: string;
}

export interface FlowButton {
  id?: string;
  title: string;
  next_step?: number;
}

// CrmUser Type
export interface CrmUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

// ------------------------------------------------------------------
// Helper function to handle API responses consistently
// ------------------------------------------------------------------
const handleResponse = <T>(response: any): T => {
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

  getContactWithDetails: async (id: string | number): Promise<Contact> => {
    const response = await api.get(`/contacts/${id}/details`);
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

  updateContactStage: async (id: string | number, stage: string) => {
    const response = await api.patch(`/contacts/${id}/stage`, { stage });
    return handleResponse(response);
  },

  assignContact: async (id: string | number, assignedTo: string) => {
    const response = await api.patch(`/contacts/${id}/assign`, { assigned_to: assignedTo });
    return handleResponse(response);
  },

  searchContacts: async (query: string): Promise<Contact[]> => {
    const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`);
    return handleResponse(response);
  },

  getContactStats: async (): Promise<any> => {
    const response = await api.get("/contacts/stats");
    return handleResponse(response);
  },
  
  // ---------- Notes ----------
  addNote: async (contact_id: string | number, user_id: string | number, note: string) => {
    const response = await api.post("/contacts/note", { contact_id, user_id, note });
    return handleResponse(response);
  },

  addContactNote: async (contact_id: string | number, note: string): Promise<Note> => {
    const response = await api.post(`/contacts/${contact_id}/notes`, { note });
    return handleResponse(response);
  },

  getContactNotes: async (contact_id: string | number): Promise<Note[]> => {
    const response = await api.get(`/contacts/${contact_id}/notes`);
    return handleResponse(response);
  },

  // ---------- Tags ----------
  getTags: async (): Promise<Tag[]> => {
    try {
      const response = await api.get("/contacts/tags/all");
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  },

  getTagById: async (id: string | number): Promise<Tag> => {
    const response = await api.get(`/contacts/tags/${id}`);
    return handleResponse(response);
  },

  createTag: async (name: string, color?: string): Promise<Tag> => {
    const response = await api.post("/contacts/tags", { name, color });
    return handleResponse(response);
  },

  updateTag: async (id: string | number, data: { name?: string; color?: string }): Promise<Tag> => {
    const response = await api.put(`/contacts/tags/${id}`, data);
    return handleResponse(response);
  },

  deleteTag: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/contacts/tags/${id}`);
    return handleResponse(response);
  },

  getContactTags: async (contactId: string | number): Promise<Tag[]> => {
    const response = await api.get(`/contacts/${contactId}/tags`);
    return handleResponse(response);
  },

  addTagToContact: async (contactId: string | number, tagId: string | number): Promise<{ success: boolean; tags: Tag[] }> => {
    const response = await api.post(`/contacts/${contactId}/tags`, { tag_id: tagId });
    return handleResponse(response);
  },

  removeTagFromContact: async (contactId: string | number, tagId: string | number): Promise<{ success: boolean; tags: Tag[] }> => {
    const response = await api.delete(`/contacts/${contactId}/tags/${tagId}`);
    return handleResponse(response);
  },

  // ---------- Messages ----------
  sendMessage: async (data: { contact_id: string | number; text: string; is_note?: boolean }) => {
    const response = await api.post("/messages/send", data);
    return handleResponse(response);
  },
  
  sendMediaMessage: async (data: {
  contact_id: string | number;
  file: File;
  caption?: string;
}) => {
  const formData = new FormData();

  formData.append("contact_id", String(data.contact_id));
  formData.append("file", data.file);

  if (data.caption) {
    formData.append("caption", data.caption);
  }

  const response = await api.post(
    "/messages/send-media",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return handleResponse(response);
},
  
  getMessages: async (contact_id: string | number): Promise<Message[]> => {
    const response = await api.get(`/messages/${contact_id}`);
    return handleResponse(response);
  },

  // ✅ NEW: Mark messages as read for a contact
  markMessagesAsRead: async (contact_id: string | number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/messages/${contact_id}/mark-read`);
    return handleResponse(response);
  },

  // ✅ NEW: Get unread count for a contact
  getUnreadCount: async (contact_id: string | number): Promise<{ unread_count: number }> => {
    const response = await api.get(`/messages/${contact_id}/unread-count`);
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
    
    const result: any = handleResponse(response);
    return result.url || result.data?.url || result;
  },

  // ---------- Contact Counting ----------
  estimateContactCount: async (filters: any): Promise<number> => {
    const response = await api.post("/contacts/count", filters);
    const result: any = handleResponse(response);
    return result.count || result;
  },

  // ---------- Chatbot Flows ----------
  getChatbotFlows: async (): Promise<ChatbotFlow[]> => {
    const response = await api.get("/chatbot/flows");
    return handleResponse(response);
  },

  getChatbotFlowById: async (id: string | number): Promise<ChatbotFlow> => {
    const response = await api.get(`/chatbot/flows/${id}`);
    return handleResponse(response);
  },

  createChatbotFlow: async (data: Partial<ChatbotFlow>): Promise<ChatbotFlow> => {
    const response = await api.post("/chatbot/flows", data);
    return handleResponse(response);
  },

  updateChatbotFlow: async (id: string | number, data: Partial<ChatbotFlow>): Promise<ChatbotFlow> => {
    const response = await api.put(`/chatbot/flows/${id}`, data);
    return handleResponse(response);
  },

  deleteChatbotFlow: async (id: string | number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/chatbot/flows/${id}`);
    return handleResponse(response);
  },

  toggleChatbotFlow: async (id: string | number, isActive: boolean): Promise<ChatbotFlow> => {
    const response = await api.patch(`/chatbot/flows/${id}/toggle`, { is_active: isActive });
    return handleResponse(response);
  },

  processChatbotMessage: async (contactId: string | number, message: string): Promise<any> => {
    const response = await api.post("/chatbot/process", { contactId, message });
    return handleResponse(response);
  },

  getChatbotFlowLogs: async (id: string | number): Promise<any[]> => {
    const response = await api.get(`/chatbot/flows/${id}/logs`);
    return handleResponse(response);
  },

  getActiveChatbotConversations: async (): Promise<any[]> => {
    const response = await api.get("/chatbot/conversations/active");
    return handleResponse(response);
  },

  // ---------- Users ----------
  getUsers: async (): Promise<CrmUser[]> => {
    try {
      const response = await api.get("/users/get-all-user");
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      return [
        { id: 1, name: 'Ravi Patil', email: 'ravi@example.com', role: 'admin', is_active: true },
        { id: 2, name: 'Neha Kulkarni', email: 'neha@example.com', role: 'sales', is_active: true }
      ];
    }
  },

  getSalesExecutives: async (): Promise<CrmUser[]> => {
    try {
      const response = await api.get("/users/sales-executives");
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching sales executives:", error);
    }
  },


  sendLocation: async (data: { contact_id: string | number; latitude: number; longitude: number }) => {
  const response = await api.post("/messages/send-location", data);
  return handleResponse(response);
},
};