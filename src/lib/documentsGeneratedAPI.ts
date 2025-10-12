// /src/lib/documentsGeneratedAPI.ts
import api from "./api";

export type GenStatus = "draft" | "created";

export type DocumentsGeneratedPayload = {
  template_id: number | string;
  name: string | null;
  description?: string | null;
  category?: string | null;
  content?: string | null; // final HTML snapshot
  variables?: any | null;  // JSON object
  status?: GenStatus;      // 'draft' | 'created'
  created_by?: number;
  updated_by?: number;

};

/* ------------------------------------------------------------------
 *  Helper: Extract filename from Content-Disposition header
 * ------------------------------------------------------------------ */
function parseFilenameFromDisposition(
  disposition?: string | null,
  fallback = "document.pdf"
) {
  if (!disposition) return fallback;

  // Try RFC 5987 first: filename*=UTF-8''encoded-name.pdf
  let m =
    /filename\*=(?:UTF-8''|)([^;]+)/i.exec(disposition) ||
    /filename="?([^";\n]+)"?/i.exec(disposition);

  const raw = m?.[1]?.trim();
  if (!raw) return fallback;

  try {
    const cleaned = raw.replace(/^"+|"+$/g, "");
    return decodeURIComponent(cleaned);
  } catch {
    return raw || fallback;
  }
}

/* ------------------------------------------------------------------
 *  Helper: Trigger a browser file download
 * ------------------------------------------------------------------ */
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "document.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* ------------------------------------------------------------------
 *  Helper: Build absolute URL for fetch (works dev/prod)
 * ------------------------------------------------------------------ */
function buildApiUrl(path: string, query?: Record<string, string>) {
  const base = (api as any)?.defaults?.baseURL || "";
  const root = base ? base.replace(/\/$/, "") : "/api";
  const q = query
    ? "?" +
    Object.entries(query)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&")
    : "";
  return `${root}${path}${q}`;
}

// 👉 add near top (optional types)
type BulkZipOptions = {
  page?: "a4" | "legal";
  filenamePrefix?: string;   // default 'documents'
};

/* ------------------------------------------------------------------
 *  Fetch a PDF (as Blob) with credentials + get filename from headers
 *  NOTE: Server should send:
 *        - Content-Disposition: attachment; filename="name.pdf"
 *        - Access-Control-Expose-Headers: Content-Disposition
 * ------------------------------------------------------------------ */
async function fetchPdfWithMeta(
  id: number | string,
  opts?: { page?: "a4" | "legal"; disposition?: "inline" | "attachment" }
): Promise<{ blob: Blob; filename: string }> {
  const page = (opts?.page || "a4").toLowerCase();
  const disposition = (opts?.disposition || "attachment").toLowerCase();
  const url = buildApiUrl(`/documents-generated/${id}/pdf`, { page, disposition });

  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // send cookies if auth-protected
  });

  if (!res.ok) {
    let msg = `Failed to download PDF (HTTP ${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      const txt = await res.text().catch(() => "");
      if (txt) msg += `\n${txt}`;
    }
    throw new Error(msg);
  }

  const blob = await res.blob();
  const type = blob.type || res.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("pdf")) {
    console.warn("⚠️ Response is not application/pdf. Received:", type);
  }

  // If server exposes header, this works even cross-origin
  const disp = res.headers.get("Content-Disposition");
  const filename = parseFilenameFromDisposition(disp, "document.pdf");

  return { blob, filename };
}

/* ------------------------------------------------------------------
 *  Full API object
 * ------------------------------------------------------------------ */
export const documentsGeneratedAPI = {
  // ------------- CRUD -----------------
  getAll: async (params?: any) => {
    const res = await api.get("/documents-generated", { params });
    return res.data.data;
  },

  getById: async (id: number | string) => {
    const res = await api.get(`/documents-generated/${id}`);
    return res.data.data;
  },

  create: async (payload: DocumentsGeneratedPayload) => {
    const body = {
      template_id: payload.template_id ?? null,
      name: payload.name ?? null,
      description: payload.description ?? null,
      category: payload.category ?? null,
      content: payload.content ?? null,
      variables: payload.variables ?? null,
      status: payload.status ?? "draft",
      created_by: payload.created_by ?? null,
      updated_by: payload.updated_by ?? null,

    };
    const res = await api.post("/documents-generated", body);
    return res.data.data;
  },

  update: async (id: number | string, payload: DocumentsGeneratedPayload) => {
    const body = {
      template_id: payload.template_id ?? null,
      name: payload.name ?? null,
      description: payload.description ?? null,
      category: payload.category ?? null,
      content: payload.content ?? null,
      variables: payload.variables ?? null,
      status: payload.status ?? "draft",
      created_by: payload.created_by ?? null,
      updated_by: payload.updated_by ?? null,

    };
    const res = await api.patch(`/documents-generated/${id}`, body);
    return res.data.data;
  },

  softDelete: async (id: number | string) => {
    const res = await api.post(`/documents-generated/${id}/soft-delete`);
    return res.data;
  },

  restore: async (id: number | string) => {
    const res = await api.post(`/documents-generated/${id}/restore`);
    return res.data;
  },

  hardDelete: async (id: number | string) => {
    const res = await api.delete(`/documents-generated/${id}`);
    return res.data;
  },

  // ------------- PDF Utilities -----------------

  /**
   * Download the PDF (save dialog) with the correct filename.
   * Requires server to expose `Content-Disposition` header.
   */
  // /src/lib/documentsGeneratedAPI.ts
  // Fix the downloadPdf method in documentsGeneratedAPI.ts

  // COMPLETE FIX for documentsGeneratedAPI.ts

  // Replace your entire downloadPdf method with this:

  downloadPdf: async (
    id: string | number,
    params?: { page?: 'a4' | 'legal'; filenameFallback?: string }
  ) => {
    const pageType = params?.page || 'a4';

    const res = await api.get(`/documents-generated/${id}/download`, {
      params: { page: pageType },
      responseType: 'blob', // critical
    });

    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = params?.filenameFallback || 'document.pdf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  // Fetch document with related entities
  getOneWithRelations: async (id: number | string) => {
    const res = await api.get(`/documents-generated/with-relations/${id}`);
    return res.data.data; // should contain document + buyer + seller + executive + properties
  },

  getAllWithRelations: async (params?: any) => {
    const res = await api.get("/documents-generated/with-relations/getall", { params });
    return res.data.data;
  },

  // 👉 add inside export const documentsGeneratedAPI = { ... }
  bulkDownloadZip: async (
    ids: Array<number | string>,
    options?: BulkZipOptions
  ) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("ids[] required");
    }

    // server route: POST /documents-generated/bulk-download
    const res = await api.post(
      "/documents-generated/bulk-download",
      {
        ids,
        options: {
          page: options?.page || "a4",
          filenamePrefix: options?.filenamePrefix || "documents",
        },
      },
      { responseType: "blob" } // 👈 ZIP as blob
    );

    const blob: Blob = res.data;
    const disp = res.headers?.["content-disposition"] || res.headers?.["Content-Disposition"];
    const fallback = `${(options?.filenamePrefix || "documents")
      .toString()
      .replace(/[^\w\-]+/g, "_")}_${ids.length}_files.zip`;

    const filename = parseFilenameFromDisposition(disp, fallback);
    triggerBlobDownload(blob, filename);
    return { blob, filename };
  },

  /** Same as above but returns blob (no auto download), handy for custom UX */
  bulkDownloadZipBlob: async (
    ids: Array<number | string>,
    options?: BulkZipOptions
  ): Promise<{ blob: Blob; filename: string }> => {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("ids[] required");
    }

    const res = await api.post(
      "/documents-generated/bulk-download",
      {
        ids,
        options: {
          page: options?.page || "a4",
          filenamePrefix: options?.filenamePrefix || "documents",
        },
      },
      { responseType: "blob" }
    );

    const blob: Blob = res.data;
    const disp = res.headers?.["content-disposition"] || res.headers?.["Content-Disposition"];
    const fallback = `${(options?.filenamePrefix || "documents")
      .toString()
      .replace(/[^\w\-]+/g, "_")}_${ids.length}_files.zip`;
    const filename = parseFilenameFromDisposition(disp, fallback);

    return { blob, filename };
  },
  /**
   * Open the PDF in a new tab (view only).
   * Uses Blob URL so it also works with auth/cookies.
   */
  openPdf: async (id: number | string, page: "a4" | "legal" = "a4") => {
    const { blob } = await fetchPdfWithMeta(id, { page, disposition: "inline" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  },
  savePdf: async (id: string | number, params?: { page?: 'a4' | 'legal' }) => {
    const res = await api.post(`/documents-generated/${id}/save-pdf`, {}, {
      params: { page: params?.page || 'a4' },
    });
    return res.data; // { ok, status, file_url, ... }
  },
  getVerificationSummary: async (id: number | string) => {
    const res = await api.get(`/documents-generated/${id}/verification-summary`);
    return res.data; // { ok, document_id, verification: {...} }
  },


 downloadFinalPdf: async (
    id: number | string,
    opts?: { filenameFallback?: string }
  ) => {
    const res = await api.get(`/documents-generated/${id}/final-pdf`, {
      responseType: "blob",
    });
    const blob: Blob = res.data;
    const disp =
      (res.headers["content-disposition"] as string) ||
      (res.headers["Content-Disposition"] as string) ||
      "";
    const filename =
      parseFilenameFromDisposition(disp, opts?.filenameFallback || "final.pdf");
    triggerBlobDownload(blob, filename);
    return { blob, filename };
  },

/**
 * Open final PDF in a new tab (inline viewer).
 * Uses blob URL so it works with auth cookies.
 */
 openFinalPdf: async (id: number | string) => {
    const res = await api.get(`/documents-generated/${id}/final-pdf`, {
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(res.data);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  },

/** Raw URL (useful for same-origin <a href> without auth blob fetch) */
getFinalPdfUrl: (id: number | string, opts?: { mask?: boolean }) => {
  const mask = opts?.mask === false ? "0" : "1";
  return buildApiUrl(`/documents-generated/${id}/final-pdf`, { mask });
},
  /**
   * Direct URL builder (for <a href>, public endpoints, or same-origin).
   * You can add &disposition=attachment to force browser download with server filename.
   */

};





