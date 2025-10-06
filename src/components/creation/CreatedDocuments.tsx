import React from "react";
import {
  FileText,
  Eye,
  Download,
  Trash2,
  Copy,
  RefreshCw,
  CheckCircle2,
  X,
  Search,
  ChevronDown,
  User,
  MapPin,
} from "lucide-react";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";

type GeneratedDoc = {
  id: number | string;
  template_id?: number | string | null;
  name: string;
  description?: string | null;
  category?: string | null;
  content: string;
  variables?: any;
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

function parseVariables(v: any) {
  try {
    const raw = typeof v === "string" ? JSON.parse(v) : v;
    if (raw && typeof raw === "object") return raw;
  } catch {}
  return {};
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
    </div>
    <div className="h-9 w-full bg-gray-200 rounded"></div>
  </div>
);

type SortKey = "recent" | "oldest" | "name_az" | "name_za";

function parseFilenameFromDisposition(disposition?: string | null, fallback = "document.pdf") {
  if (!disposition) return fallback;
  try {
    const matchQuoted = disposition.match(/filename="([^"]+)"/i);
    if (matchQuoted?.[1]) return matchQuoted[1];
    const matchStar = disposition.match(/filename\*\s*=\s*[^']*''([^;]+)/i);
    if (matchStar?.[1]) return decodeURIComponent(matchStar[1]);
  } catch {}
  return fallback;
}

const CreatedDocuments: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState<GeneratedDoc[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<SortKey>("recent");
  const [pageSize, setPageSize] = React.useState<"a4" | "legal">("a4");

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


  const downloadPDF = async (doc: GeneratedDoc) => {
    try {
      const hasGetPdfUrl = typeof (documentsGeneratedAPI as any).getPdfUrl === "function";
      if (!hasGetPdfUrl) throw new Error("getPdfUrl not available in documentsGeneratedAPI");

      const url: string = (documentsGeneratedAPI as any).getPdfUrl(doc.id, pageSize);

      if (typeof (documentsGeneratedAPI as any).fetchPdfBlob === "function") {
        const { blob, filename } = await (documentsGeneratedAPI as any).fetchPdfBlob(doc.id, pageSize);
        const a = document.createElement("a");
        const href = URL.createObjectURL(blob);
        a.href = href;
        a.download = filename || `${(doc.name || "document").replace(/\s+/g, "_")}.pdf`;
        a.click();
        URL.revokeObjectURL(href);
        return;
      }

      const resp = await fetch(url, { method: "GET" });
      if (!resp.ok) throw new Error(`Download failed (${resp.status})`);

      const disp = resp.headers.get("Content-Disposition");
      const filename = parseFilenameFromDisposition(disp, `${(doc.name || "document").replace(/\s+/g, "_")}.pdf`);

      const blob = await resp.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(href);
    } catch (e: any) {
      alert(e?.message || "Failed to download PDF");
    }
  };

  const copyTitle = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt || "");
    } catch {}
  };

  const categories = React.useMemo(() => {
    const s = new Set<string>();
    list.forEach((d) => d.category && s.add(d.category));
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [list]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    const match = (d: GeneratedDoc) => {
      if (category !== "all" && (d.category || "").toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      if (!q) return true;

      const hay = [
        d.name,
        d.description || "",
        d.category || "",
        d.template_id ? String(d.template_id) : "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    };

    const out = list.filter(match);
    const getTime = (d: GeneratedDoc) => new Date(d.updated_at || d.created_at || 0).getTime();

    switch (sortBy) {
      case "recent":
        return out.sort((a, b) => getTime(b) - getTime(a));
      case "oldest":
        return out.sort((a, b) => getTime(a) - getTime(b));
      case "name_az":
        return out.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "name_za":
        return out.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      default:
        return out;
    }
  }, [list, search, category, sortBy]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Created Documents</h2>
          <p className="text-xs text-gray-600 mt-0.5">Final snapshots you generated</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="col-span-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description…"
                className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                  title="Clear"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <div className="col-span-1">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="col-span-1">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200 bg-white"
              >
                <option value="recent">Sort: Recently updated</option>
                <option value="oldest">Sort: Oldest first</option>
                <option value="name_az">Sort: Name A→Z</option>
                <option value="name_za">Sort: Name Z→A</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="col-span-1">
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as "a4" | "legal")}
                className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                title="PDF page size"
              >
                <option value="a4">Page: A4</option>
                <option value="legal">Page: Legal</option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of{" "}
          <span className="font-semibold text-gray-800">{list.length}</span> documents
          {category !== "all" ? (
            <>
              {" "}
              in category <span className="font-semibold text-gray-800">{category}</span>
            </>
          ) : null}
          {search ? (
            <>
              {" "}
              for search "<span className="font-semibold text-gray-800">{search}</span>"
            </>
          ) : null}
        </div>
      </div>

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

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <FileText className="text-gray-400" size={22} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No documents match your filters</h3>
          <p className="mt-1 text-xs text-gray-500">Try clearing the search or changing filters.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => {
            const vars = parseVariables(doc.variables);
            
            // --- FIX STARTS HERE ---
            const buyer = vars.buyer_name || vars.buyerName || vars.buyer;
            const seller = vars.seller_name || vars.sellerName || vars.seller;
            
            // Extract salutations with fallbacks
            const buyerSalutation = vars.buyer_salutation || vars.buyerSalutation || "";
            const sellerSalutation = vars.seller_salutation || vars.sellerSalutation || "";
            
            // Combine salutation and name
            const fullBuyerName = `${buyerSalutation} ${buyer}`.trim();
            const fullSellerName = `${sellerSalutation} ${seller}`.trim();

            const propertyTitle = vars.property_title || vars.propertyTitle || vars.title;
            const propertyAddress = vars.property_address || vars.propertyAddress || vars.address;
            // --- FIX ENDS HERE ---

            return (
              <div
                key={doc.id}
                className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-xl ring-1 ring-gray-200 bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900 leading-5">
                        {doc.name || "Untitled"}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {doc.category ? <Badge tone="blue">{doc.category}</Badge> : null}
                      <Badge tone="green">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> created
                        </span>
                      </Badge>
                    </div>
                  </div>

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

                {(buyer || seller || propertyTitle || propertyAddress) && (
                  <div className="mb-3 space-y-2 text-xs">
                    {buyer && (
                      <div className="flex items-start gap-2">
                        <User size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 font-medium">Buyer:</span>{" "}
                          <span className="text-gray-900">{fullBuyerName}</span>
                        </div>
                      </div>
                    )}
                    {seller && (
                      <div className="flex items-start gap-2">
                        <User size={12} className="text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 font-medium">Seller:</span>{" "}
                          <span className="text-gray-900">{fullSellerName}</span>
                        </div>
                      </div>
                    )}
                    {(propertyTitle || propertyAddress) && (
                      <div className="flex items-start gap-2">
                        <MapPin size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 font-medium">Property:</span>{" "}
                          <span className="text-gray-900">
                            {propertyTitle}
                            {propertyTitle && propertyAddress && " - "}
                            {propertyAddress}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-gray-600 space-y-1 mb-4">
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

                <div className="grid grid-cols-3 gap-2">
                 

                  <button
                    onClick={() => downloadPDF(doc)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-gray-200 hover:bg-gray-50"
                    title="Download PDF"
                  >
                    <Download size={14} />
                    Download
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
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