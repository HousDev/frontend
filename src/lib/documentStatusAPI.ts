// // src/lib/documentStatusAPI.ts
// import { api } from "./api";

// /* ---------------------------------- Types --------------------------------- */

// export type StatusCode =
//   | "created"
//   | "shared"
//   | "otp_verified"
//   | "esign_pending"
//   | "on_hold"
//   | "cancelled"
//   | "completed";

// export interface SnapshotRow {
//   document_id: number;
//   current_status: StatusCode;
//   completed_statuses: string[] | null; // MySQL JSON -> array
//   steps_done: number;
//   progress_pct: number; // 0..100
//   reason: string | null;
//   changed_by: number | null;
//   changed_at: string;   // ISO
//   updated_at: string;   // ISO
//   created_by?: number | null; // joined from documents_generated
// }

// export interface StatusEvent {
//   id: number;
//   document_id: number;
//   old_status: StatusCode | null;
//   new_status: StatusCode;
//   reason: string | null;
//   details: any | null;
//   changed_by: number | null;
//   changed_at: string; // ISO
// }

// export interface TimelineRow {
//   source: "status" | "share" | "otp" | "esign";
//   document_id: number;
//   at_time: string; // ISO
//   old_status: string | null;
//   new_status: string; // could be 'shared', 'otp_sent', 'esign_request_sent', etc.
//   reason: string | null;
//   details: any | null;
// }

// export interface ShareBatch {
//   id: number;
//   document_id: number;
//   channels: any; // stored JSON (array or object per your payload)
//   message: string | null;
//   public_link: string | null;
//   created_by: number | null;
//   created_at: string; // ISO
// }

// export interface ShareRecipient {
//   id: number;
//   share_batch_id: number;
//   recipient_name: string;
//   recipient_type: "phone" | "email";
//   recipient_value: string;
//   role: "Seller" | "Buyer" | "Custom";
//   channel: string;
//   status: "sent" | "generated" | "failed";
//   gateway_ref: string | null;
//   details: any | null;
//   created_at: string; // ISO
// }

// /* ------------------------------- Payload types ----------------------------- */

// export interface SetStatusPayload {
//   new_status: StatusCode;
//   reason?: string | null;
//   details?: any | null;
//   changed_by?: number | null; // optional; server can take from req.user
// }

// export interface CreateShareBatchPayload {
//   channels: string[];               // e.g. ['whatsapp','email']
//   message?: string | null;
//   public_link?: string | null;
//   created_by?: number | null;       // optional; server can take from req.user
//   recipients?: Array<{
//     recipient_name?: string;
//     recipient_type: "phone" | "email";
//     recipient_value: string;
//     role?: "Seller" | "Buyer" | "Custom";
//     channel?: string;               // 'whatsapp' | 'email' | 'sms' | etc
//     status?: "sent" | "generated" | "failed";
//     gateway_ref?: string | null;
//     details?: any | null;
//   }>;
// }

// export interface LogOtpPayload {
//   sent_to: string;
//   purpose: string;                  // e.g. 'buyer_verification'
//   status: "sent" | "verified" | "failed";
//   otp_ref?: string | null;
//   details?: any | null;
//   created_by?: number | null;
// }

// export interface LogEsignPayload {
//   provider: string;                 // e.g. 'eMudhra'
//   event: string;                    // e.g. 'request_sent' | 'viewed' | 'signed' | 'declined'
//   actor?: string | null;
//   status?: string | null;           // provider status
//   details?: any | null;
//   created_by?: number | null;
// }

// /* ---------------------------------- API ----------------------------------- */
// // NOTE: server mounted at app.use("/api/doc-status", router)
// // Your axios `api` baseURL likely already has "/api", so we prefix with "/doc-status"

// export const documentStatusAPI = {
//   // Snapshot / History / Timeline
//   getSnapshot: async (documentId: number): Promise<SnapshotRow> => {
//     if (!documentId) throw new Error("documentId is required");
//     const res = await api.get(`/doc-status/documents/${documentId}/snapshot`);
//     // controllers send { ok, data }; return data directly for convenience
//     return res.data?.data ?? res.data;
//   },

//   getHistory: async (documentId: number): Promise<StatusEvent[]> => {
//     if (!documentId) throw new Error("documentId is required");
//     const res = await api.get(`/doc-status/documents/${documentId}/history`);
//     return res.data?.data ?? res.data;
//   },

//   getTimeline: async (documentId: number): Promise<TimelineRow[]> => {
//     if (!documentId) throw new Error("documentId is required");
//     const res = await api.get(`/doc-status/documents/${documentId}/timeline`);
//     return res.data?.data ?? res.data;
//   },

//   // Manual status update (uses stored procedure)
//   setStatus: async (documentId: number, payload: SetStatusPayload): Promise<SnapshotRow> => {
//     if (!documentId) throw new Error("documentId is required");
//     if (!payload?.new_status) throw new Error("new_status is required");
//     const res = await api.post(`/doc-status/documents/${documentId}/status`, payload);
//     return res.data?.data ?? res.data;
//   },

//   // Shares
//   createShareBatch: async (documentId: number, payload: CreateShareBatchPayload): Promise<{ batch: ShareBatch; recipients: ShareRecipient[] }> => {
//     if (!documentId) throw new Error("documentId is required");
//     if (!payload?.channels || !Array.isArray(payload.channels) || payload.channels.length === 0) {
//       throw new Error("channels array is required");
//     }
//     const res = await api.post(`/doc-status/documents/${documentId}/share-batches`, payload);
//     return res.data?.data ?? res.data;
//   },

//   listShareBatches: async (documentId: number): Promise<ShareBatch[]> => {
//     if (!documentId) throw new Error("documentId is required");
//     const res = await api.get(`/doc-status/documents/${documentId}/share-batches`);
//     return res.data?.data ?? res.data;
//   },

//   getShareRecipients: async (shareBatchId: number): Promise<ShareRecipient[]> => {
//     if (!shareBatchId) throw new Error("shareBatchId is required");
//     const res = await api.get(`/doc-status/share-batches/${shareBatchId}/recipients`);
//     return res.data?.data ?? res.data;
//   },

//   // OTP & E-sign logs
//   logOtpEvent: async (documentId: number, payload: LogOtpPayload): Promise<{ id: number }> => {
//     if (!documentId) throw new Error("documentId is required");
//     if (!payload?.sent_to) throw new Error("sent_to is required");
//     if (!payload?.purpose) throw new Error("purpose is required");
//     if (!payload?.status) throw new Error("status is required");
//     const res = await api.post(`/doc-status/documents/${documentId}/otp-events`, payload);
//     return res.data?.data ?? res.data;
//   },

//   logEsignEvent: async (documentId: number, payload: LogEsignPayload): Promise<{ id: number }> => {
//     if (!documentId) throw new Error("documentId is required");
//     if (!payload?.provider) throw new Error("provider is required");
//     if (!payload?.event) throw new Error("event is required");
//     const res = await api.post(`/doc-status/documents/${documentId}/esign-events`, payload);
//     return res.data?.data ?? res.data;
//   },
// };





// src/lib/documentStatusAPI.ts
// Tiny, typed client for /api/doc-status/*
// Assumes you already export an axios instance as `api` from './api'

import { api } from "./api";

/* ---------------------------------- Types --------------------------------- */

export type StatusCode =
  | "created"
  | "shared"
  | "otp_verified"
  | "esign_pending"
  | "on_hold"
  | "cancelled"
  | "completed";

export interface SnapshotRow {
  document_id: number;
  current_status: StatusCode;
  completed_statuses: string[] | null; // MySQL JSON -> array
  steps_done: number;
  progress_pct: number; // 0..100
  reason: string | null;
  changed_by: number | null;
  changed_at: string;   // ISO
  updated_at: string;   // ISO
  created_by?: number | null; // joined from documents_generated
   // 👇 add these (optional)
  buyer_verified?: boolean;
  seller_verified?: boolean;
}

export interface StatusEvent {
  id: number;
  document_id: number;
  old_status: StatusCode | null;
  new_status: StatusCode;
  reason: string | null;
  details: any | null;
  changed_by: number | null;
  changed_at: string; // ISO
}

export interface TimelineRow {
  source: "status" | "share" | "otp" | "esign";
  document_id: number;
  at_time: string; // ISO
  old_status: string | null;
  new_status: string;
  reason: string | null;
  details: any | null;
}

export type RecipientType = "phone" | "email";
export type RecipientRole = "Seller" | "Buyer" | "Custom";
export type RecipientStatus = "sent" | "generated" | "failed";

export interface ShareBatch {
  id: number;
  document_id: number;
  channels: string[]; // stored as JSON in DB
  message: string | null;
  public_link: string | null;
  created_by: number | null;
  created_at: string; // ISO
}

export interface ShareRecipient {
  id: number;
  share_batch_id: number;
  recipient_name: string;
  recipient_type: RecipientType;
  recipient_value: string;
  role: RecipientRole;
  channel: string;
  status: RecipientStatus;
  gateway_ref: string | null;
  details: any | null;
  created_at: string; // ISO
}

/* -------- NEW: Catalog + Bulk types -------- */

export interface CatalogRow {
  code: StatusCode;
  seq: number;
  is_final: 0 | 1;
}

export interface BulkSetStatusPayload {
  ids: number[];
  new_status: StatusCode;
  reason?: string | null;
  details?: any | null;
  changed_by?: number | null; // backend can also take from req.user
}

export interface BulkSetStatusResult {
  count: number;
  snapshots: SnapshotRow[];
}

/* ------------------------------- Error helper ------------------------------ */

const normalizeError = (err: any) => {
  if (err?.response) {
    const code = err.response.status;
    const msg =
      err.response.data?.message ||
      err.response.data?.error ||
      JSON.stringify(err.response.data);
    return new Error(`HTTP ${code}: ${msg}`);
  }
  if (err?.request) return new Error("Network error: no response from server");
  return new Error(err?.message || "Unknown error");
};

/* --------------------------------- Client --------------------------------- */

export const documentStatusAPI = {
  /* GET /status-catalog */
  async fetchCatalog(): Promise<CatalogRow[]> {
    try {
      const res = await api.get(`/doc-status/status-catalog`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* POST /documents/bulk-status */
  async bulkSetStatus(payload: BulkSetStatusPayload): Promise<BulkSetStatusResult> {
    try {
      if (!payload?.ids?.length) throw new Error("ids must be a non-empty array");
      if (!payload.new_status) throw new Error("new_status is required");
      const res = await api.post(`/doc-status/documents/bulk-status`, payload);
      return res.data?.data as BulkSetStatusResult;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* GET /snapshot (auto-inits if missing) */
  async getSnapshot(documentId: number): Promise<SnapshotRow | null> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/snapshot`);
      return res.data?.data ?? null;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* POST /status (calls SP) */
  async setStatus(
    documentId: number,
    payload: {
      new_status: StatusCode;
      reason?: string | null;
      details?: any | null;
      changed_by?: number | null; // optional; backend also uses req.user
    }
  ): Promise<SnapshotRow> {
    try {
      const res = await api.post(`/doc-status/documents/${documentId}/status`, payload);
      return res.data?.data;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* GET /history */
  async getHistory(documentId: number): Promise<StatusEvent[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/history`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* GET /timeline */
  async getTimeline(documentId: number): Promise<TimelineRow[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/timeline`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* POST /share-batches (+ recipients) */
  async createShareBatch(
    documentId: number,
    payload: {
      channels: string[];             // ["whatsapp","email"]
      message?: string | null;
      public_link?: string | null;
      created_by?: number | null;
      recipients?: Array<{
        recipient_name?: string;
        recipient_type: RecipientType; // "phone" | "email"
        recipient_value: string;
        role?: RecipientRole;          // default "Custom"
        channel?: string;              // e.g. "whatsapp"
        status?: RecipientStatus;      // default "generated"
        gateway_ref?: string | null;
        details?: any | null;
      }>;
    }
  ): Promise<{ batch: ShareBatch; recipients: ShareRecipient[] }> {
    try {
      const res = await api.post(`/doc-status/documents/${documentId}/share-batches`, payload);
      return res.data?.data;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* GET /share-batches */
  async listShareBatches(documentId: number): Promise<ShareBatch[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/share-batches`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },


  /* GET /share-batches/:batchId/recipients */
  async getShareRecipients(batchId: number): Promise<ShareRecipient[]> {
    try {
      const res = await api.get(`/doc-status/share-batches/${batchId}/recipients`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* POST /otp-events */
  async logOtpEvent(
    documentId: number,
    payload: {
      sent_to: string;               // phone/email
      purpose: string;               // e.g. "identity_verification"
      status: "sent" | "verified" | "failed";
      otp_ref?: string | null;
      details?: any | null;
      created_by?: number | null;
    }
  ): Promise<{ id: number }> {
    try {
      const res = await api.post(`/doc-status/documents/${documentId}/otp-events`, payload);
      return res.data?.data;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* POST /esign-events */
  async logEsignEvent(
    documentId: number,
    payload: {
      provider: string;              // e.g. "Digio","eMudhra"
      event: string;                 // "request_sent" | "viewed" | "signed" | "declined"
      actor?: string | null;
      status?: string | null;
      details?: any | null;
      created_by?: number | null;
    }
  ): Promise<{ id: number }> {
    try {
      const res = await api.post(`/doc-status/documents/${documentId}/esign-events`, payload);
      return res.data?.data;
    } catch (e) {
      throw normalizeError(e);
    }
  },
  // in lib/documentStatusAPI.ts (or wherever)
  requestOtp: async (documentId: number, payload: { role: 'buyer' | 'seller'; channel: 'sms' | 'email'; to: string; name?: string }) => {
    return api.post(`/doc-status/documents/${documentId}/otp/request`, payload);
  },
  verifyOtp: async (documentId: number, payload: { role: 'buyer' | 'seller'; code: string }) => {
    return api.post(`/doc-status/documents/${documentId}/otp/verify`, payload);
  },


};


export default documentStatusAPI;
