import { api } from "./api";

/* ---------------- Types ---------------- */
export type DigioSigner = {
  name: string;
  identifier: string;                   // phone or email (MUST match party in Digio)
  identifier_type?: "phone" | "email";
  reason?: string;
  type?: "self" | "other";
  signature_type?: "aadhaar" | "upload";
};

export type SignCoordinates =
  | {
      // Anchor-based mapping (recommended)
      [roleOrKey: string]: { anchor_string: string };
      // e.g. { buyer: { anchor_string: "[[SIGN_BUYER]]" } }
    }
  | {
      // Absolute coordinates mapping
      [identifierOrKey: string]: Array<{ page: number; x: number; y: number; width?: number; height?: number }>;
    };

export type CreateSigningPayload = {
  fileName: string;                     // "Agreement.pdf"
  fileData: string;                     // base64 WITHOUT data: prefix
  signers: DigioSigner[];
  displayOnPage?: "last" | "first" | "all" | "custom" | "Custom";
  expireInDays?: number;
  referenceId?: string | number;
  sign_coordinates?: SignCoordinates;   // required if displayOnPage = custom/Custom
};

export type GenerateLinkPayload = {
  docId: string;                        // DID...
  identifier: string;                   // phone/email of party
  // optional knobs per your controller design:
  redirect_url?: string;
  use_redirection?: boolean;
  use_iframe?: boolean;
};

export type SigningLinkQuery =
  | { docId: string; identifier: string }               // classic
  | { requestId: string; identifier: string };          // token mode

export type RegenerateTokenPayload = {
  requestId: string;                    // token flow request id/kid
};

/* ------------ Small helpers (optional) ------------ */
export async function pdfToBase64(file: Blob | ArrayBuffer): Promise<string> {
  const toArrayBuffer = async (f: Blob | ArrayBuffer) =>
    f instanceof Blob ? await f.arrayBuffer() : f;
  const ab = await toArrayBuffer(file);
  const bytes = new Uint8Array(ab as ArrayBuffer);
  // NO "data:application/pdf;base64," prefix – backend expects plain base64
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/* ---------------- API Wrapper ---------------- */
export const digioAPI = {
  /* Health & auth checks */
  health: async () => {
    const { data } = await api.get("/digio/health");
    return data;
  },

  authCheck: async () => {
    const { data } = await api.get("/digio/auth-check");
    return data;
  },

  /* Create signing (uploadpdf -> DID) */
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
    const { data } = await api.post("/digio/create-signing", payload);
    return data; // { ok: true, data: {...Digio response...} }
  },

  /* Status by doc id */
  getStatus: async (docId: string) => {
    if (!docId) throw new Error("docId is required");
    const { data } = await api.get(`/digio/status/${encodeURIComponent(docId)}`);
    return data;
  },

  /* Download signed doc */
  download: async (docId: string) => {
    if (!docId) throw new Error("docId is required");
    const { data } = await api.get(`/digio/download/${encodeURIComponent(docId)}`, {
      responseType: "blob",
    });
    return data as Blob;
  },

  /* Cancel signing (DELETE) */
  cancel: async (docId: string) => {
    if (!docId) throw new Error("docId is required");
    const { data } = await api.delete(`/digio/cancel/${encodeURIComponent(docId)}`);
    return data;
  },

  /* Generate link (server decides classic/token mechanics) */
  generateLink: async (payload: GenerateLinkPayload) => {
    if (!payload?.docId) throw new Error("docId is required");
    if (!payload?.identifier) throw new Error("identifier is required");
    const { data } = await api.post("/digio/generate-link", payload);
    return data; // expect { ok: true, data: { url?, requestId?, token_id? ... } }
  },

  /* Regenerate token for token flow */
  regenerateToken: async (payload: RegenerateTokenPayload) => {
    if (!payload?.requestId) throw new Error("requestId is required");
    const { data } = await api.post("/digio/token/regenerate", payload);
    return data; // expect { ok: true, data: { token_id, ... } }
  },

  /* Signing link – POST body (preferred) */
  getSigningLink: async (body: SigningLinkQuery) => {
    const { data } = await api.post("/digio/signing-link", body);
    return data; // expect { ok: true, data: { url?, requestId?, token_id? ... } }
  },

  /* Signing link – GET via query (alternate) */
  getSigningLinkByQuery: async (query: SigningLinkQuery) => {
    const params = new URLSearchParams(query as Record<string, string>);
    const { data } = await api.get(`/digio/signing-link?${params.toString()}`);
    return data;
  },
};



// alreayd base 64 me hoga to 

