// src/lib/contactsAPI.ts
import { api } from "./api";

/**
 * contactsAPI
 * - submitContact: POST /api/contact/submit
 * - getContacts:  GET  /api/contact/list
 * - getContactById: GET /api/contact/:id
 * - updateContact: PUT /api/contact/:id   (used to persist status/replies/assignment/star)
 * - deleteContact: DELETE /api/contact/:id (optional)
 *
 * NOTE: If your backend uses different HTTP verbs/paths for update/reply/assign/star,
 * adjust updateContact / other helpers accordingly.
 */

export const contactsAPI = {
  submitContact: async (data: Record<string, any>) => {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
    const resp = await api.post("/contact/submit", { ...data, guest_id: data.guest_id || guestId });
    return resp.data;
  },

  getContacts: async () => {
    const resp = await api.get("/contact/list");
    // expecting array
    return resp.data;
  },

  getContactById: async (id: string | number) => {
    const resp = await api.get(`/contact/${id}`);
    return resp.data;
  },

  /**
   * Generic update helper. Backend should accept PUT body with fields to update.
   * Example usage: contactsAPI.updateContact(id, { status: 'replied', replies: [...] })
   */
  updateContact: async (id: string | number, patch: Record<string, any>) => {
    const resp = await api.put(`/contact/${id}`, patch);
    return resp.data;
  },

  deleteContact: async (id: string | number) => {
    const resp = await api.delete(`/contact/${id}`);
    return resp.data;
    },
  // inside contactsAPI object
updateStatus: async (id: string | number, status: string) => {
  const resp = await api.patch(`/contact/${id}/status`, { status });
  return resp.data || resp.data?.data || resp;
},

addReply: async (id: string | number, reply: { message: string; sender?: string }) => {
  const resp = await api.post(`/contact/${id}/reply`, reply);
  return resp.data || resp.data?.data || resp;
},

// keep updateContact as generic PUT /api/contact/:id for assignment/star etc

  
  
};
