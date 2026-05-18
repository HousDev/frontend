// src/lib/backupAPI.ts
import { api } from "./api";

export type BackupEntity = "leads" | "buyers" | "sellers" | "properties" | "users";
export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";
export type BackupStatus = "processing" | "completed" | "failed";
export type BackupOp     = "import" | "export";

export interface BackupRecord {
  id:              number;
  operation:       BackupOp;
  entity:          BackupEntity;
  filename:        string | null;
  file_format:     ExportFormat;
  file_size:       number | null;
  total_records:   number;
  success_records: number;
  failed_records:  number;
  status:          BackupStatus;
  error_log:       Array<{ row?: number; reason: string }> | null;
  performed_by:    number | null;
  created_at:      string;
  updated_at:      string;
}

export interface BackupStats {
  totalImports:          number;
  totalExports:          number;
  recentFailed:          number;
  totalRecordsProcessed: number;
}

export interface HistoryResponse {
  success:     boolean;
  records:     BackupRecord[];
  total:       number;
  total_pages: number;
  page:        number;
  limit:       number;
}

export interface ImportResult {
  success:      boolean;
  log_id:       number;
  total:        number;
  inserted:     number;
  skipped:      number;
  skippedRows:  Array<{ row: number; reason: string }>;
  insertedRows: Array<{ id: number; name: string }>;
}

/* ── MIME types per format ───────────────────────────────────── */
const MIME_TYPES: Record<string, string> = {
  csv:  "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  json: "application/json",
  pdf:  "application/pdf",
};

/* ── helper: trigger browser file download ───────────────────── */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

/* ================================================================
   backupAPI
================================================================ */
export const backupAPI = {

  /* ── called from Leads page, Buyers page, etc. ─────────────── */
  exportData: async (
    entity: BackupEntity,
    format: ExportFormat = "csv",
  ): Promise<void> => {
    const res = await api.get(`/backup/export/${entity}`, {
      params: { format },
      responseType: "arraybuffer",           // ← CHANGED from "blob"
    });
    triggerDownload(
      new Blob([res.data], { type: MIME_TYPES[format] ?? "application/octet-stream" }),
      `${entity}_export_${Date.now()}.${format}`
    );
  },

  /* ── called from Import/Export page ────────────────────────── */
  importData: async (
    entity:      BackupEntity,
    file:        File,
    onProgress?: (pct: number) => void,
  ): Promise<ImportResult> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<ImportResult>(
      `/backup/import/${entity}`, form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      }
    );
    return res.data;
  },

  /* ── re-export from Import/Export page ─────────────────────── */
  reExportData: async (
    entity: BackupEntity,
    format: ExportFormat,
  ): Promise<void> => {
    const res = await api.get(`/backup/export/${entity}`, {
      params: { format },
      responseType: "arraybuffer",           // ← CHANGED from "blob"
    });
    triggerDownload(
      new Blob([res.data], { type: MIME_TYPES[format] ?? "application/octet-stream" }),
      `${entity}_${format}_${Date.now()}.${format}`
    );
  },

  /* ── blank template download ────────────────────────────────── */
  downloadTemplate: async (
    entity: BackupEntity,
    format: "csv" | "xlsx" = "csv",
  ): Promise<void> => {
    const res = await api.get(`/backup/template/${entity}`, {
      params: { format },
      responseType: "arraybuffer",           // ← CHANGED from "blob"
    });
    triggerDownload(
      new Blob([res.data], { type: MIME_TYPES[format] ?? "application/octet-stream" }),
      `${entity}_template.${format}`
    );
  },

  /* ── history list ───────────────────────────────────────────── */
  getHistory: async (params: {
    operation?: string;
    entity?:    string;
    status?:    string;
    page?:      number;
    limit?:     number;
  } = {}): Promise<HistoryResponse> => {
    const clean: Record<string, any> = {};
    if (params.operation) clean.operation = params.operation;
    if (params.entity)    clean.entity    = params.entity;
    if (params.status)    clean.status    = params.status;
    if (params.page)      clean.page      = params.page;
    if (params.limit)     clean.limit     = params.limit;
    const res = await api.get<HistoryResponse>("/backup/history", { params: clean });
    return res.data;
  },

  /* ── stats ──────────────────────────────────────────────────── */
  getStats: async (): Promise<BackupStats> => {
    const res = await api.get<{ success: boolean } & BackupStats>("/backup/stats");
    return res.data;
  },

  /* ── delete one log row ─────────────────────────────────────── */
  deleteHistory: async (id: number): Promise<void> => {
    await api.delete(`/backup/history/${id}`);
  },
};

export default backupAPI;