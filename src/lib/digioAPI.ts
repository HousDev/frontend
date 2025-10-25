// src/lib/digioAPI.ts
import { api } from "./api";

/* ---------------- Types (adjust if you need stricter typing) --------------- */
export type DigioSigner = {
  name: string;
  identifier: string;                 // phone/email
  identifier_type?: "phone" | "email";
  reason?: string;                    // e.g. "Buyer Signature"
  type?: "self" | "other";
  signature_type?: "aadhaar" | "upload";
};

export type SignCoordinates =
  | {
      // Anchor-based (recommended)
      [roleOrKey: string]: { anchor_string: string };
      // e.g. { buyer: { anchor_string: "[[SIGN_BUYER]]" }, seller: { anchor_string: "[[SIGN_SELLER]]" } }
    }
  | {
      // Absolute coordinates
      [identifierOrKey: string]: Array<{ page: number; x: number; y: number; width?: number; height?: number }>;
    };

export type CreateSigningPayload = {
  fileName: string;                 // "Test MOU.pdf"
  fileData: string;                 // base64 (NO data: prefix)
  signers: DigioSigner[];
  displayOnPage?: "last" | "first" | "all" | "custom" | "Custom";
  expireInDays?: number;            // default 30 in your backend
  referenceId?: string | number;    // default "52" in your backend
  sign_coordinates?: SignCoordinates;// required if displayOnPage = custom/Custom
};

/* ------------------------------- API Wrapper ------------------------------- */
export const digioAPI = {
  // Health ping (reads env + urls)
  health: async () => {
    const response = await api.get("/digio/health");
    return response.data;
  },

  // Auth check (expects 400 from Digio when body empty => means credentials OK)
  authCheck: async () => {
    const response = await api.get("/digio/auth-check");
    return response.data;
  },

  // Create signing (uploadpdf)
  createSigning: async (payload: CreateSigningPayload) => {
    if (!payload?.fileName) throw new Error("fileName is required");
    if (!payload?.fileData) throw new Error("fileData (base64 PDF) is required");
    if (!Array.isArray(payload?.signers) || payload.signers.length === 0) {
      throw new Error("signers[] is required");
    }
    if (
      (payload.displayOnPage?.toLowerCase?.() === "custom") &&
      !payload.sign_coordinates
    ) {
      throw new Error("sign_coordinates required when displayOnPage is Custom");
    }

    const response = await api.post("/digio/create-signing", payload);
    return response.data; // { ok: true, data: {...} }
  },

  // Check status
  getStatus: async (docId: string) => {
    if (!docId) throw new Error("docId is required");
    const response = await api.get(`/digio/status/${encodeURIComponent(docId)}`);
    return response.data; // { ok: true, data: {...} }
  },

  // Download (returns Blob from your backend; you can also pipe straight to file-saver in UI)
  download: async (docId: string) => {
    if (!docId) throw new Error("docId is required");
    const response = await api.get(`/digio/download/${encodeURIComponent(docId)}`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  // Cancel signing
  cancel: async (docId: string) => {
    if (!docId) throw new Error("docId is required");
    const response = await api.get(`/digio/cancel/${encodeURIComponent(docId)}`);
    return response.data;
  },
};

