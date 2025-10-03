import React from "react";
import {
  FileText,
  Trash2,
  Cloud,
  RefreshCw,
  CheckCircle2,
  User,
  Home,
} from "lucide-react";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";

type Draft = {
  id: string;
  title?: string;
  templateId?: number | string | null;
  templateName?: string;
  savedAt: string | number | Date;
  status?: "draft" | "created";
  data: Record<string, any>;
  content?: string | null;
};

type Props = {
  /** Optional: your editor can subscribe to this and navigate */
  onContinue?: (draft: Draft) => void;
};

const BRAND = {
  primary: "#E6761D",
  primaryHover: "#CC6A1A",
};

const Badge = ({
  children,
  tone = "gray" as "gray" | "violet" | "orange",
}) => {
  const map = {
    gray: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
    violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    orange: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-4 w-40 bg-gray-200 rounded" />
      <div className="h-5 w-16 bg-gray-200 rounded-full" />
    </div>
    <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-20 bg-gray-200 rounded" />
      <div className="h-6 w-16 bg-gray-200 rounded" />
      <div className="h-6 w-14 bg-gray-200 rounded" />
    </div>
    <div className="h-9 w-full bg-gray-200 rounded" />
  </div>
);

/** Safe JSON parse for variables that might be stringified */
function parseVars(v: any): Record<string, any> {
  if (!v) return {};
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      return j && typeof j === "object" ? j : {};
    } catch {
      return {};
    }
  }
  return typeof v === "object" ? v : {};
}

const DraftDocuments: React.FC<Props> = ({ onContinue }) => {
  const [items, setItems] = React.useState<Draft[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const mapRowToDraft = React.useCallback((r: any): Draft => {
    const savedAt =
      r?.updated_at || r?.created_at || r?.last_used_at || new Date().toISOString();
    return {
      id: String(r.id),
      title: r.name || "Untitled Draft",
      templateId: r.template_id ?? null,
      templateName: r.category || r.template_name || r.template_id || "-",
      savedAt,
      status: (r.status ?? "draft") as any,
      content: r.content ?? null,
      data: parseVars(r.variables), // full editor state snapshot (we expect your editor to consume this)
    };
  }, []);

  const fetchDrafts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Prefer backend filter (if supported):
      // const rows = await documentsGeneratedAPI.getAll({ status: "draft" as any });
      const rows = await documentsGeneratedAPI.getAll();

      const drafts: Draft[] = (rows || [])
        .filter((r: any) => String(r?.status ?? "draft").toLowerCase() === "draft")
        .map(mapRowToDraft)
        .sort(
          (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );

      setItems(drafts);
    } catch (e: any) {
      setError(e?.message || "Failed to load drafts");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mapRowToDraft]);

  React.useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const deleteDraft = async (draftId: string) => {
    if (!window.confirm("Delete this draft? This cannot be undone.")) return;
    try {
      setLoading(true);
      // Use any of: remove | delete | softDelete
      if ((documentsGeneratedAPI as any).softDelete) {
        await (documentsGeneratedAPI as any).softDelete(draftId);
      } else if ((documentsGeneratedAPI as any).remove) {
        await (documentsGeneratedAPI as any).remove(draftId);
      } else if ((documentsGeneratedAPI as any).delete) {
        await (documentsGeneratedAPI as any).delete(draftId);
      } else {
        throw new Error("Delete method not found on documentsGeneratedAPI");
      }
      await fetchDrafts();
    } catch (e: any) {
      setError(e?.message || "Failed to delete draft");
    } finally {
      setLoading(false);
    }
  };

  /**
   * The reliable resume fix:
   * 1) save a payload to sessionStorage that your editor can read on mount
   * 2) still trigger onContinue(draft) so existing flow keeps working
   */
  const continueDraft = (draft: Draft) => {
    const resumePayload = {
      draftId: draft.id,
      templateId: draft.templateId ?? null,
      title: draft.title ?? "Untitled Draft",
      initialVariables: draft.data ?? {},
      // You can add more like: pageType, css, content snapshot, etc.
      source: "server-draft",
      savedAt: draft.savedAt,
    };
    sessionStorage.setItem("documentEditor:resume", JSON.stringify(resumePayload));
    onContinue?.(draft);
    // Optional: if you want a fallback navigation when onContinue isn't passed
    // window.location.assign("/documents/create"); // uncomment if desired
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Draft Documents</h2>
        </div>
        <button
          onClick={fetchDrafts}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ring-1 ring-gray-200 hover:bg-gray-50"
        >
          <RefreshCw size={14} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <FileText className="text-gray-400" size={22} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No drafts found</h3>
          <p className="mt-1 text-xs text-gray-500">
            Start creating a document and save it as a draft to see it here.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((draft) => {
            const v = draft.data || {};
            const chips: string[] = [];
            if (v.seller_name) chips.push(`Seller: ${v.seller_name}`);
            if (v.buyer_name) chips.push(`Buyer: ${v.buyer_name}`);
            if (v.property_address) chips.push(`Address: ${v.property_address}`);

            return (
              <div
                key={draft.id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl ring-1 ring-gray-200 bg-orange-50 flex items-center justify-center">
                      <FileText size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 leading-5">
                        {draft.title || "Untitled Draft"}
                      </div>
                      <div className="mt-1 text-[11px] text-gray-500">
                        Template: {draft.templateName || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone="orange">draft</Badge>
                    <Badge tone="violet">
                      <span className="inline-flex items-center gap-1">
                        <Cloud size={12} /> server
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* Meta chips */}
                {chips.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 px-2 py-0.5 text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="mt-3 text-[11px] text-gray-600">
                  <span className="text-gray-500">Saved: </span>
                  {new Date(draft.savedAt).toLocaleString()}
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => continueDraft(draft)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white"
                    style={{ background: BRAND.primary }}
                    onMouseOver={(e) => (e.currentTarget.style.background = BRAND.primaryHover)}
                    onMouseOut={(e) => (e.currentTarget.style.background = BRAND.primary)}
                    title="Open this draft in the editor from exactly where you left off"
                  >
                    <CheckCircle2 size={14} />
                    Continue
                  </button>

                  <button
                    onClick={() => deleteDraft(String(draft.id))}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    title="Delete draft"
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

export default DraftDocuments;
