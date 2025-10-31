// src/lib/digioAPI.ts
import api from "@/lib/api";

// ---------- Types ----------
export type SignType = "aadhaar" | "esign" | string;

export interface Signer {
  identifier: string;
  name: string;
  sign_type: SignType;
  reason?: string;
}

export type PageNumber = string;
export interface SignBox {
  llx: number;
  lly: number;
  urx: number;
  ury: number;
}
// ---------- Extra Types ----------
export interface DigioDocumentRow {
  id: number;
  local_document_id: number | string | null;
  digio_id: string;
  file_name: string | null;
  status: string | null;
  signers?: any;                // JSON from DB
  access_token_id?: string | null;
  authentication_urls?: any;    // JSON map from DB
  created_at: string;
  updated_at: string;
}

export interface GetAllDocumentsResult {
  success: boolean;
  data?: DigioDocumentRow[];
  error?: any;
}

/** If your /status/:local_document_id returns similar to DetailsResult */
export interface StatusByLocalIdResult {
  success: boolean;
  digio_id?: string;
  status?: string;
  local_document_id?: number | string;
  data?: DigioUploadResponse;  // if backend forwards Digio details
  db?: any;                    // DB row if you include it
  error?: any;
}

export type SignCoordinates = Record<string, Record<PageNumber, SignBox[]>>;

export interface UploadPdfPayload {
  local_document_id?: number | string;
  signers: Signer[];
  expire_in_days?: number;
  display_on_page?: "custom" | "all";
  notify_signers?: boolean;
  send_sign_link?: boolean;
  file_name: string;
  generate_access_token?: boolean;
  include_authentication_url?: boolean;
  file_data: string;
  sign_coordinates?: SignCoordinates;
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
  id: string;
  is_agreement?: boolean;
  agreement_type?: string;
  agreement_status?: string;
  file_name?: string;
  created_at?: string;
  self_signed?: boolean;
  self_sign_type?: string;
  no_of_pages?: number;
  signing_parties?: DigioSigningParty[];
  access_token?: DigioAccessToken;
  [k: string]: any;
}

export interface UploadResult {
  success: boolean;
  digio_id?: string;
  status?: string;
  local_document_id?: number | string;
  data?: DigioUploadResponse;
  error?: any;
}

/** 🔥 UPDATED: backend top-level fields भी भेजता है */
export interface DetailsResult {
  success: boolean;
  digio_id?: string;
  status?: string;
  local_document_id?: number | string;
  data?: DigioUploadResponse;
  db?: any;
  error?: any;
}

// ---------- Helpers ----------
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const result = String(fr.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// ---------- API Calls ----------
export async function uploadPdf(payload: UploadPdfPayload): Promise<UploadResult> {
  try {
    const { data } = await api.post<UploadResult>("/digio/uploadpdf", payload);
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

/** 🔥 UPDATED: top-level fields को भी surface करें */
export async function getDocumentDetails(
  documentId: string,
  localDocumentId?: number | string
): Promise<DetailsResult> {
  try {
    const url =
      typeof localDocumentId !== "undefined" && localDocumentId !== null
        ? `/digio/document/${encodeURIComponent(documentId)}?local_document_id=${encodeURIComponent(
            String(localDocumentId)
          )}`
        : `/digio/document/${encodeURIComponent(documentId)}`;

    const { data } = await api.get<DetailsResult>(url);
    // Debug:
    // console.log("[getDocumentDetails]", data);
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

export async function cancelDocument(documentId: string, reason?: string) {
  try {
    const body = reason ? { reason } : {};
    const { data } = await api.post(`/digio/document/${encodeURIComponent(documentId)}/cancel`, body);
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

export function openDownload(documentId: string, opts?: { inline?: boolean; saveServerCopy?: boolean }) {
  const inline = opts?.inline ? "1" : "0";
  const save = opts?.saveServerCopy ? "1" : "0";
  const url = `/digio/document/${encodeURIComponent(documentId)}/download?inline=${inline}&save=${save}`;
  window.open(url, "_blank");
}

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

/** 🔹 Get ALL Digio documents (simple) */
export async function getAllDigioDocuments(): Promise<GetAllDocumentsResult> {
  try {
    const { data } = await api.get<GetAllDocumentsResult>("/digio/documents");
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

/** 🔹 Get status/details by local_document_id */
export async function getDigioStatusByLocalId(
  localDocumentId: number | string
): Promise<StatusByLocalIdResult> {
  try {
    const { data } = await api.get<StatusByLocalIdResult>(
      `/digio/status/${encodeURIComponent(String(localDocumentId))}`
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}


