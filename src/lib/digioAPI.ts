// src/lib/digioAPI.ts
import api from "@/lib/api";

/* ===================== Types ===================== */
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

/* ---------- Extra Types ---------- */
export interface DigioDocumentRow {
  id: number;
  local_document_id: number | string | null;
  digio_id: string;
  file_name: string | null;
  status: string | null;
  signers?: any;
  access_token_id?: string | null;
  authentication_urls?: any;
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
  data?: DigioUploadResponse;
  db?: any;
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

/** 🔥 backend now returns top-level helpers too */
export interface DetailsResult {
  success: boolean;
  digio_id?: string;
  status?: string;
  local_document_id?: number | string;
  data?: DigioUploadResponse;
  db?: any;
  error?: any;
}

/* ===================== Helpers ===================== */
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

/* ===================== API Calls ===================== */
export async function uploadPdf(payload: UploadPdfPayload): Promise<UploadResult> {
  try {
    const { data } = await api.post<UploadResult>("/digio/uploadpdf", payload);
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

/** 🔥 propagate top-level fields too */
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

export function openDownload(
  documentId: string,
  opts?: { inline?: boolean; saveServerCopy?: boolean }
) {
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

/** 🔹 Get ALL Digio documents (paged) */
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

/** Save a signed PDF copy to DB or Disk */
export async function saveSignedCopy(
  documentId: string,
  opts?: { storage?: "db" | "disk"; local_document_id?: number | string }
) {
  const q = new URLSearchParams();
  if (opts?.storage) q.set("storage", opts.storage);
  if (opts?.local_document_id != null) q.set("local_document_id", String(opts.local_document_id));
  const { data } = await api.post(`/digio/document/${encodeURIComponent(documentId)}/save?${q.toString()}`);
  return data;
}

/* ===================== Preview Helpers ===================== */

/** Build preview URL for the single endpoint: GET /api/digio/preview */
function buildPreviewUrl(opts: {
  digio_id?: string;
  local_document_id?: string | number;
  inline?: boolean;
  download?: boolean;
  filename?: string;
}) {
  const q = new URLSearchParams();
  if (opts.digio_id) q.set("digio_id", opts.digio_id);
  if (opts.local_document_id != null) q.set("local_document_id", String(opts.local_document_id));
  if (opts.inline) q.set("inline", "1");
  if (opts.download) q.set("download", "1");
  if (opts.filename) q.set("filename", opts.filename);
  return `/digio/preview${q.toString() ? `?${q.toString()}` : ""}`;
}

/** Open preview in a new tab */
export function openPreview(opts: {
  digio_id?: string;
  local_document_id?: string | number;
  inline?: boolean;
  download?: boolean;
  filename?: string;
}) {
  const url = buildPreviewUrl(opts);
  window.open(url, "_blank");
}

/** Fetch preview as Blob (PDF) */
export async function fetchPreviewBlob(opts: {
  digio_id?: string;
  local_document_id?: string | number;
  inline?: boolean;
}): Promise<Blob> {
  const url = buildPreviewUrl(opts);
  const res = await api.get(url, { responseType: "blob" });
  return new Blob([res.data], { type: res.headers["content-type"] || "application/pdf" });
}

/** Absolute signed/complete preview URL (bypasses any frontend base rewriting) */
export function getPreviewUrlSigned(opts: {
  digio_id?: string;
  local_document_id?: number | string;
  download?: boolean;
  filename?: string;
}) {
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000/api";
  const q = new URLSearchParams();
  if (opts.digio_id) q.set("digio_id", opts.digio_id);
  if (opts.local_document_id != null) q.set("local_document_id", String(opts.local_document_id));
  if (opts.download) q.set("download", "1");
  if (opts.filename) q.set("filename", opts.filename);
  q.set("cb", String(Date.now())); // cache-buster for iframe reloads
  return `${API_BASE}/digio/preview${q.toString() ? `?${q.toString()}` : ""}`;
}

/* ===================== Saved Copy Helpers ===================== */
export function openSaved(documentId: string) {
  window.open(`/digio/saved/${encodeURIComponent(documentId)}`, "_blank");
}

export async function downloadSaved(documentId: string, fileName?: string) {
  const url = `/digio/saved/${encodeURIComponent(documentId)}/download`;
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

/* ===================== Listing (paged) ===================== */
export interface ListDocumentsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  from?: string;
  to?: string;
  [k: string]: any;
}

export interface ListDocumentsResult<T = any> {
  success: boolean;
  data?: T[];
  page?: number;
  pageSize?: number;
  total?: number;
  error?: any;
}

export async function listDigioDocuments(
  params: ListDocumentsParams = {}
): Promise<ListDocumentsResult<DigioDocumentRow>> {
  try {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.pageSize != null) q.set("pageSize", String(params.pageSize));
    if (params.q) q.set("q", params.q);
    if (params.status) q.set("status", params.status);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortDir) q.set("sortDir", params.sortDir);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    Object.entries(params).forEach(([k, v]) => {
      if (!["page", "pageSize", "q", "status", "sortBy", "sortDir", "from", "to"].includes(k) && v != null) {
        q.set(k, String(v));
      }
    });

    const { data } = await api.get<ListDocumentsResult<DigioDocumentRow>>(
      `/digio/documents${q.toString() ? `?${q.toString()}` : ""}`
    );
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

/* ===================== Non-paged get-all ===================== */
export async function getAllDocumentsRaw(): Promise<GetAllDocumentsResult> {
  try {
    const { data } = await api.get<GetAllDocumentsResult>("/digio/documents/get-all");
    return data;
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

/* ===================== Quick conveniences ===================== */
export function openDownloadInline(documentId: string) {
  openDownload(documentId, { inline: true });
}

export async function saveThenOpenSaved(
  documentId: string,
  opts?: { storage?: "db" | "disk"; local_document_id?: number | string }
) {
  await saveSignedCopy(documentId, opts);
  openSaved(documentId);
}
