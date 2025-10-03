import React from "react";
import {
  FileText,
  Eye,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";

type GeneratedDoc = {
  id: number | string;
  template_id?: number | string | null;
  name: string;
  description?: string | null;
  category?: string | null;
  content: string;
  variables?: any; // array | object | null
  status: "draft" | "created";
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
  last_used_at?: string | null;
  is_deleted?: 0 | 1;
  deleted_at?: string | null;
};

const BRAND = {
  primary: "#E6761D",
  primaryHover: "#CC6A1A",
  navy: "#0c3854",
};

const Badge = ({ children, tone = "gray" as "gray" | "green" | "blue" }) => {
  const map = {
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
    green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    blue: "bg-blue-100 text-blue-700 ring-blue-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ${map[tone]}`}>
      {children}
    </span>
  );
};

function useVarsCount(v: any): { list: string[]; count: number } {
  try {
    const raw = typeof v === "string" ? JSON.parse(v) : v;
    if (Array.isArray(raw)) return { list: raw.slice(0, 3), count: raw.length };
    if (raw && typeof raw === "object") {
      const keys = Object.keys(raw);
      return { list: keys.slice(0, 3), count: keys.length };
    }
  } catch {
    /* ignore */
  }
  return { list: [], count: 0 };
}

const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-4 w-40 bg-gray-200 rounded"></div>
      <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-3 w-24 bg-gray-200 rounded mb-4"></div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
      <div className="h-6 w-20 bg-gray-200 rounded"></div>
      <div className="h-6 w-14 bg-gray-200 rounded"></div>
    </div>
    <div className="h-9 w-full bg-gray-200 rounded"></div>
  </div>
);

const CreatedDocuments: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState<GeneratedDoc[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const normalize = (res: any): GeneratedDoc[] => {
    if (Array.isArray(res)) return res as GeneratedDoc[];
    if (Array.isArray(res?.data)) return res.data as GeneratedDoc[];
    if (Array.isArray(res?.items)) return res.items as GeneratedDoc[];
    return [];
  };

  const fetchAllDocs = React.useCallback(async (): Promise<GeneratedDoc[]> => {
    if (typeof (documentsGeneratedAPI as any).getAll === "function") {
      const res = await (documentsGeneratedAPI as any).getAll();
      return normalize(res);
    }
    const res = await documentsGeneratedAPI.getAll({});
    return normalize(res);
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllDocs();
      const createdOnly = all
        .filter((d) => d?.status === "created" && (d?.is_deleted === 0 || d?.is_deleted == null))
        .sort((a, b) => {
          const ta = new Date(a.updated_at || a.created_at || 0).getTime();
          const tb = new Date(b.updated_at || b.created_at || 0).getTime();
          return tb - ta;
        });
      setList(createdOnly);
    } catch (e: any) {
      setError(e?.message || "Failed to load created documents");
    } finally {
      setLoading(false);
    }
  }, [fetchAllDocs]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (docId: number | string) => {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    try {
      if (typeof (documentsGeneratedAPI as any).remove === "function") {
        await (documentsGeneratedAPI as any).remove(docId);
      } else if (typeof (documentsGeneratedAPI as any).delete === "function") {
        await (documentsGeneratedAPI as any).delete(docId);
      } else if (typeof (documentsGeneratedAPI as any).softDelete === "function") {
        await (documentsGeneratedAPI as any).softDelete(docId);
      } else {
        throw new Error("Delete method not found on documentsGeneratedAPI");
      }
      await fetchData();
    } catch (e: any) {
      alert(e?.message || "Failed to delete");
    }
  };

  const openHTML = (doc: GeneratedDoc) => {
    const blob = new Blob([doc.content || ""], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyTitle = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt || "");
    } catch {}
  };

  const downloadHTML = (doc: GeneratedDoc) => {
    const blob = new Blob([doc.content || ""], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(doc.name || "document").replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Created Documents</h2>
          <p className="text-xs text-gray-600 mt-0.5">Final snapshots you generated</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ring-1 ring-gray-200 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* States */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <FileText className="text-gray-400" size={22} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No created documents yet</h3>
          <p className="mt-1 text-xs text-gray-500">
            Generate a document and it will appear here.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((doc) => {
            const { list: vList, count: vCount } = useVarsCount(doc.variables);
            const more = Math.max(0, vCount - vList.length);

            return (
              <div
                key={doc.id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl ring-1 ring-gray-200 bg-blue-50 flex items-center justify-center">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 leading-5">
                        {doc.name || "Untitled"}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        {doc.category ? <Badge tone="blue">{doc.category}</Badge> : null}
                        <Badge tone="green">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> created
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions (show on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1">
                    <button
                      onClick={() => copyTitle(doc.name)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Copy title"
                    >
                      <Copy size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-3 text-[11px] text-gray-600 space-y-1">
                  {doc.created_at && (
                    <div>
                      <span className="text-gray-500">Created:</span>{" "}
                      {new Date(doc.created_at).toLocaleString()}
                    </div>
                  )}
                  {doc.updated_at && (
                    <div>
                      <span className="text-gray-500">Updated:</span>{" "}
                      {new Date(doc.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Variables */}
                {vCount > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-gray-700 mb-1">Variables</div>
                    <div className="flex flex-wrap gap-1.5">
                      {vList.map((v) => (
                        <span
                          key={v}
                          className="rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 px-2 py-0.5 text-[11px]"
                        >
                          {v}
                        </span>
                      ))}
                      {more > 0 && (
                        <span className="rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-200 px-2 py-0.5 text-[11px]">
                          +{more} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  <button
                    onClick={() => openHTML(doc)}
                    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white"
                    style={{ background: BRAND.primary }}
                    onMouseOver={(e) => ((e.currentTarget.style.background = BRAND.primaryHover))}
                    onMouseOut={(e) => ((e.currentTarget.style.background = BRAND.primary))}
                  >
                    <Eye size={14} />
                    Preview
                  </button>

                  <button
                    onClick={() => downloadHTML(doc)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-gray-200 hover:bg-gray-50"
                    title="Download HTML"
                  >
                    <Download size={14} />
                    HTML
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreatedDocuments;
