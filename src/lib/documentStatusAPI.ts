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
  // optional convenience flags from backend (if added)
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

/* -------- Catalog + Bulk types -------- */

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

export interface DocumentAllBundle {
  document_id: number;
  snapshot: SnapshotRow | null;
  history: StatusEvent[];
  timeline: TimelineRow[];
  shareBatches: ShareBatch[];
  recipientsByBatch?: Record<number, ShareRecipient[]>; // only when includeRecipients=true
  otpSessions: OtpSessionRow[];
  otpEvents: OtpEventRow[];
  verification: { buyer: boolean; seller: boolean };
}


/* ------------------------------ New: OTP types ----------------------------- */

export interface OtpSessionRow {
  id: number;
  document_id: number;
  role: "buyer" | "seller";
  channel: "sms" | "email";
  sent_to: string;
  otp_ref: string | null;
  expires_at: string;      // ISO
  attempts: number;
  max_attempts: number;
  verified_at: string | null;
  created_by: number | null;
  created_at: string;      // ISO
  updated_at?: string;     // ISO (if present)
}

export interface OtpEventRow {
  id: number;
  document_id: number;
  sent_to: string;
  otp_ref: string | null;
  purpose: string;         // 'buyer_verify' | 'seller_verify' | ...
  status: "sent" | "verified" | "failed" | string;
  details: any | null;
  created_by: number | null;
  created_at: string;      // ISO
}

export interface Paginated<T> {
  page: number;
  pageSize: number;
  total: number;
  rows: T[];
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

/* ------------------------------ Query helper ------------------------------- */

const toQS = (obj: Record<string, any>) => {
  const q = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return v.map((vv) => `${encodeURIComponent(k)}=${encodeURIComponent(vv)}`).join("&");
      }
      return `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`;
    })
    .join("&");
  return q ? `?${q}` : "";
};

/* --------------------------------- Client --------------------------------- */

export const documentStatusAPI = {
  /* =========================== Catalog & Bulk ============================ */

  /** GET /doc-status/status-catalog */
  async fetchCatalog(): Promise<CatalogRow[]> {
    try {
      const res = await api.get(`/doc-status/status-catalog`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** POST /doc-status/documents/bulk-status */
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

  /* ============================= Snapshot/History ======================== */

  /** GET /doc-status/documents/:id/snapshot */
 /** GET /doc-status/documents/:id/snapshot */
async getSnapshot(documentId: number | string): Promise<SnapshotRow | null> {
  try {
    const res = await api.get(`/doc-status/documents/${documentId}/snapshot`);
    return res.data?.data ?? null;
  } catch (e) {
    throw normalizeError(e);
  }
},


  /** POST /doc-status/documents/:id/status */
  async setStatus(
    documentId: number,
    payload: {
      new_status: StatusCode;
      reason?: string | null;
      details?: any | null;
      changed_by?: number | null;
    }
  ): Promise<SnapshotRow> {
    try {
      const res = await api.post(`/doc-status/documents/${documentId}/status`, payload);
      return res.data?.data;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** GET /doc-status/documents/:id/history */
  async getHistory(documentId: number): Promise<StatusEvent[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/history`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** GET /doc-status/documents/:id/timeline */
  async getTimeline(documentId: number): Promise<TimelineRow[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/timeline`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* ================================ Shares =============================== */

  /** POST /doc-status/documents/:id/share-batches */
  async createShareBatch(
    documentId: number,
    payload: {
      channels: string[]; // ["whatsapp","email"]
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

  /** GET /doc-status/documents/:id/share-batches */
  async listShareBatches(documentId: number): Promise<ShareBatch[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/share-batches`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** GET /doc-status/share-batches/:batchId/recipients */
  async getShareRecipients(batchId: number): Promise<ShareRecipient[]> {
    try {
      const res = await api.get(`/doc-status/share-batches/${batchId}/recipients`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* ============================== OTP: Write ============================= */

  /** POST /doc-status/documents/:id/otp-events */
  async logOtpEvent(
    documentId: number,
    payload: {
      sent_to: string;               // phone/email
      purpose: string;               // e.g. "buyer_verify" | "seller_verify"
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

  /** POST /doc-status/documents/:id/esign-events */
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

  /** POST /doc-status/documents/:id/otp/request */
  requestOtp: async (
    documentId: number,
    payload: { role: "buyer" | "seller"; channel: "sms" | "email"; to: string; name?: string }
  ) => {
    try {
      const res = await api.post(`/doc-status/documents/${documentId}/otp/request`, payload);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** POST /doc-status/documents/:id/otp/verify */
  verifyOtp: async (
    documentId: number,
    payload: { role: "buyer" | "seller"; code: string }
  ) => {
    try {
      const res = await api.post(`/doc-status/documents/${documentId}/otp/verify`, payload);
      return res.data?.data ?? res.data;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* =========================== OTP Sessions: Read ========================== */

  /**
   * GET /doc-status/otp-sessions
   * Filters: document_id, role, channel, verified (bool), onlyActive (bool), sent_to_like
   * Paging: page, pageSize
   * Sort: orderBy (id|document_id|role|channel|expires_at|created_at|verified_at|attempts), orderDir
   */
  async listOtpSessions(params: {
    document_id?: number;
    role?: "buyer" | "seller";
    channel?: "sms" | "email";
    verified?: boolean;
    onlyActive?: boolean;
    sent_to_like?: string;
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDir?: "ASC" | "DESC";
  } = {}): Promise<Paginated<OtpSessionRow>> {
    try {
      const res = await api.get(`/doc-status/otp-sessions${toQS(params)}`);
      return res.data?.data as Paginated<OtpSessionRow>;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** GET /doc-status/documents/:id/otp-sessions */
  async getOtpSessionsByDocument(
    documentId: number,
    params: {
      role?: "buyer" | "seller";
      channel?: "sms" | "email";
      verified?: boolean;
      onlyActive?: boolean;
      sent_to_like?: string;
    } = {}
  ): Promise<OtpSessionRow[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/otp-sessions${toQS(params)}`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** GET /doc-status/otp-sessions/:sessionId */
  async getOtpSessionById(sessionId: number): Promise<OtpSessionRow> {
    try {
      const res = await api.get(`/doc-status/otp-sessions/${sessionId}`);
      return res.data?.data as OtpSessionRow;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* ============================ OTP Events: Read =========================== */

  /**
   * GET /doc-status/otp-events
   * Filters: document_id, purpose, status, sent_to_like, from, to
   * Fields: pass CSV via `fields`, e.g. "document_id,status,purpose,created_at"
   */
  async listOtpEvents(params?: { document_id?: string | number }) {
    return api.get('/api/doc-status/otp-events', { params }).then(r => r.data);
  },

  /** GET /doc-status/documents/:id/otp-events */
  async getOtpEventsByDocument(
    documentId: number,
    params: {
      purpose?: string;
      status?: "sent" | "verified" | "failed" | string;
      sent_to_like?: string;
      from?: string;
      to?: string;
      fields?: string; // CSV
    } = {}
  ): Promise<OtpEventRow[]> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/otp-events${toQS(params)}`);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /** GET /doc-status/documents/:id/otp-events/latest */
  async getLatestOtpEvent(
    documentId: number,
    params: { purpose?: string; fields?: string } = {}
  ): Promise<OtpEventRow | null> {
    try {
      const res = await api.get(`/doc-status/documents/${documentId}/otp-events/latest${toQS(params)}`);
      return res.data?.data ?? null;
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /**
   * POST /doc-status/otp-events/latest-by-documents
   * Returns one latest event per doc id (optionally filtered by purpose).
   */
  async listLatestOtpEventForDocuments(payload: {
    document_ids: number[];
    purpose?: string | null;
    fields?: string[]; // e.g. ["document_id","status","purpose","created_at"]
  }): Promise<Array<Partial<OtpEventRow> & { document_id: number; status?: string }>> {
    try {
      const res = await api.post(`/doc-status/otp-events/latest-by-documents`, payload);
      return res.data?.data ?? [];
    } catch (e) {
      throw normalizeError(e);
    }
  },

  /* ===== Optional conveniences for compact use-cases (frontend helpers) ==== */

  /** Only latest {document_id,status} per document (frontend convenience) */
  async getOtpDocStatusesLatest(documentIds: number[], purpose?: string) {
    const rows = await documentStatusAPI.listLatestOtpEventForDocuments({
      document_ids: documentIds,
      purpose: purpose ?? null,
      fields: ["document_id", "status"], // minimal
    });
    const map = new Map<number, string>();
    for (const r of rows as any[]) {
      if (typeof r.document_id === "number" && typeof r.status === "string") {
        map.set(r.document_id, r.status);
      }
    }
    return map;
  },

  /** All events for a doc but compact fields (frontend convenience) */
  async getOtpDocEventsCompact(documentId: number) {
    return documentStatusAPI.getOtpEventsByDocument(documentId, {
      fields: "document_id,status,purpose,created_at",
    });
  },
  /** GET /doc-status/documents/:id/all — one-shot bundle */
async getAllByDocument(
  documentId: number,
  opts?: {
    includeRecipients?: boolean;     // default false
    onlyActive?: boolean;            // filter OTP sessions
    verified?: boolean;              // filter OTP sessions
    timelineLimit?: number;          // e.g. 200
    otpEventsFields?: string[];      // e.g. ["document_id","status","purpose","created_at"]
  }
): Promise<DocumentAllBundle> {
  try {
    const q = toQS({
      includeRecipients: opts?.includeRecipients ? "true" : undefined,
      onlyActive: typeof opts?.onlyActive === "boolean" ? String(opts.onlyActive) : undefined,
      verified: typeof opts?.verified === "boolean" ? String(opts.verified) : undefined,
      timelineLimit: opts?.timelineLimit ?? undefined,
      otpEventsFields: opts?.otpEventsFields?.length ? opts.otpEventsFields.join(",") : undefined,
    });
    const res = await api.get(`/doc-status/documents/${documentId}/all${q}`);
    return res.data?.data as DocumentAllBundle;
  } catch (e) {
    throw normalizeError(e);
  }
},

};

export default documentStatusAPI;
