// src/lib/digioAPI.ts
// Uses your existing axios instance: import { api } from "@/lib/api"
// If your instance default export hai, adjust the import accordingly.

import api from "@/lib/api";

// ---------- Types ----------
export type SignType = "aadhaar" | "esign" | string;

export interface Signer {
  identifier: string;  // email ya mobile
  name: string;
  sign_type: SignType; // "aadhaar"
  reason?: string;
}

export type PageNumber = string; // Digio expects page as string keys e.g. "1"
export interface SignBox {
  llx: number; // lower-left x
  lly: number; // lower-left y
  urx: number; // upper-right x
  ury: number; // upper-right y
}

export type SignCoordinates = Record<
  string, // signer identifier
  Record<PageNumber, SignBox[]>
>;

export interface UploadPdfPayload {
  signers: Signer[];
  expire_in_days?: number;              // default 10
  display_on_page?: "custom" | "all";   // "custom" for coordinates
  notify_signers?: boolean;
  send_sign_link?: boolean;
  file_name: string;                    // e.g. "Test.pdf"
  generate_access_token?: boolean;
  include_authentication_url?: boolean;
  file_data: string;                    // pure base64 (no data: prefix)
  sign_coordinates?: SignCoordinates;   // required if display_on_page="custom"
}

export interface DigioAccessToken {
  entity_id: string;
  id: string;
  valid_till: string;
  created_at: string;
}

export interface DigioSigningParty {
  name: string;
  status: string;
  type?: string;
  signature_type?: string;
  identifier: string;
  reason?: string;
  expire_on?: string;
  authentication_url?: string;
}

export interface DigioUploadResponse {
  id: string; // digio_id
  is_agreement?: boolean;
  agreement_type?: string;
  agreement_status?: string; // requested/signed/rejected/expired/cancelled
  file_name?: string;
  created_at?: string;
  self_signed?: boolean;
  self_sign_type?: string;
  no_of_pages?: number;
  signing_parties?: DigioSigningParty[];
  access_token?: DigioAccessToken;
  [k: string]: any; // keep open for extras
}

export interface UploadResult {
  success: boolean;
  digio_id?: string;
  status?: string;
  data?: DigioUploadResponse;
  error?: any;
}

export interface DetailsResult {
  success: boolean;
  data?: DigioUploadResponse;
  error?: any;
}

export interface CancelResult {
  success: boolean;
  status?: string;
  data?: any;
  error?: any;
}

// ---------- Helpers ----------

// Convert a File (from <input type="file" />) to base64 string (no data: prefix)
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const result = String(fr.result || "");
      // Remove any data URL prefix if present
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// ---------- API Calls ----------

// 1) Create/Upload request (POST /api/digio/uploadpdf)
export async function uploadPdf(payload: UploadPdfPayload): Promise<UploadResult> {
  try {
    const { data } = await api.post<UploadResult>("/digio/uploadpdf", payload);
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

// 2) Get details (GET /api/digio/document/:documentId)
export async function getDocumentDetails(documentId: string): Promise<DetailsResult> {
  try {
    const { data } = await api.get<DetailsResult>(`/digio/document/${encodeURIComponent(documentId)}`);
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

// 3) Cancel (POST /api/digio/document/:documentId/cancel)
export async function cancelDocument(documentId: string, reason?: string): Promise<CancelResult> {
  try {
    const body = reason ? { reason } : {};
    const { data } = await api.post<CancelResult>(
      `/digio/document/${encodeURIComponent(documentId)}/cancel`,
      body
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

// 4A) Download (open in new tab / browser default viewer)
// Uses backend route: GET /api/digio/document/:documentId/download
export function openDownload(documentId: string, opts?: { inline?: boolean; saveServerCopy?: boolean }) {
  const inline = opts?.inline ? "1" : "0";
  const save = opts?.saveServerCopy ? "1" : "0";
  const url = `/digio/document/${encodeURIComponent(documentId)}/download?inline=${inline}&save=${save}`;
  window.open(url, "_blank");
}

// 4B) Download via XHR and force save as file (if you need programmatic download)
export async function downloadDocument(documentId: string, fileName?: string, inline = false) {
  const url = `/digio/document/${encodeURIComponent(documentId)}/download?inline=${inline ? "1" : "0"}`;
  const res = await api.get(url, { responseType: "blob" });
  const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/pdf" });
  const name = fileName || `${documentId}.pdf`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
