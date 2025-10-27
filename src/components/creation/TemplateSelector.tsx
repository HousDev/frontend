// /src/components/creation/TemplateSelector.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FileText, Building, Receipt, Users, Handshake, CreditCard,
  Plus, Search, Filter, Edit, Trash2, Copy, type LucideIcon,
} from "lucide-react";
import { documentsTemplateAPI } from "@/lib/documentsTemplateAPI";
import { documentsGeneratedAPI } from "@/lib/documentsGeneratedAPI";

/* =================== Types =================== */
export type Template = {
  id: number | string;
  name?: string;
  description?: string;
  category?: string;
  variables?: string[];
  lastUsed?: string;
  usageCount?: number;
  status?: "draft" | "active" | "archived" | string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number | string | null;
  updated_by?: number | string | null;
  created_by_name?: string;
  updated_by_name?: string;
  [key: string]: any;
};

type CategoryMeta = { id: string; label: string; icon: LucideIcon };

type Props = {
  mode?: "select" | "manage";
  templates?: Template[];
  onSelectTemplate?: (t: Template & { _pendingGeneratedPayload?: any; _generatedDoc?: any }) => void;
  onCreateTemplate?: () => void;
  onEditTemplate?: (t: Template) => void;
  onDeleteTemplate?: (id: number | string) => void;
  onDuplicateTemplate?: (t: Template) => void;

  /** optional: if true, "Use Template" par hi documents-generated row create kare
   * default false (recommended)
   */
  autoCreateGenerated?: boolean;
};

function fmtDateIST(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";

  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const parts = fmt.formatToParts(dt);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  const date = `${map.day}/${map.month}/${map.year}`;
  const time = `${map.hour}:${map.minute}${map.dayPeriod ? " " + map.dayPeriod.toUpperCase() : ""}`;
  return `${date} ${time}`;
}

/* =================== Constants =================== */
const categories: CategoryMeta[] = [
  { id: "all", label: "All Templates", icon: FileText },
  { id: "agency", label: "Agency", icon: Building },
  { id: "deal", label: "Deal", icon: Handshake },
  { id: "society", label: "Society", icon: Users },
  { id: "handover", label: "Handover", icon: Receipt },
  { id: "banking", label: "Banking", icon: CreditCard },
];

const statusOptions = [
  { id: "all", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

/* =================== Helpers =================== */
const isoNow = () => new Date().toISOString();

function safeLower(v: unknown): string {
  if (v == null) return "";
  try { return String(v).toLowerCase(); } catch { return ""; }
}

function statusBadgeClasses(status: string): string {
  const s = safeLower(status);
  if (s === "active") return "bg-green-100 text-green-700 border border-green-200";
  if (s === "draft") return "bg-amber-100 text-amber-700 border border-amber-200";
  if (s === "archived") return "bg-gray-100 text-gray-600 border border-gray-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function normalizeApiTemplates(input: any): Template[] {
  const raw: any[] = Array.isArray(input?.data) ? input.data : Array.isArray(input) ? input : [];
  return raw.map((t: any) => ({
    id: t.id,
    name: t.name ?? "",
    description: t.description ?? "",
    category: safeLower(t?.category ?? ""),
    variables: Array.isArray(t.variables) ? t.variables : [],
    lastUsed: t.last_used_at || t.last_used || t.lastUsed || "",
    usageCount:
      typeof t.usageCount === "number" ? t.usageCount :
        typeof t.usage_count === "number" ? t.usage_count : 0,
    status: safeLower(t.status ?? "draft"),
    content: t.content,
    created_at: t.created_at,
    updated_at: t.updated_at,
    created_by: t.created_by ?? null,
    updated_by: t.updated_by ?? null,
    created_by_name: t.created_by_name || "",
    updated_by_name: t.updated_by_name || "",

    ...t,
  }));
}

function getCategoryIcon(category: string | undefined): LucideIcon {
  const found = categories.find((c) => c.id === safeLower(category || ""));
  return found ? found.icon : FileText;
}

// payload for /documents-generated create (parent will use this on "Save as Draft" or "Create")
function buildGeneratedPayload(t: Template) {
  return {
    template_id: t.id,
    name: (t.name || "Untitled Document").trim(),
    description: t.description || null,
    category: t.category || null,
    content: t.content || null,
    variables: {
      template_name: t.name || null,
      template_category: t.category || null,
      template_updated_at: t.updated_at || null,
      started_at: isoNow(),
    },
  };
}

/* =================== Component =================== */
const TemplateSelector: React.FC<Props> = ({
  templates: templatesProp,
  onSelectTemplate,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  mode = "select",
  autoCreateGenerated = false,
}) => {
  const useExternal = mode === "select" && Array.isArray(templatesProp);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [templates, setTemplates] = useState<Template[]>(templatesProp ?? []);
  const [loading, setLoading] = useState<boolean>(!useExternal);
  const [error, setError] = useState<string>("");
  const [usingId, setUsingId] = useState<number | string | null>(null);

  // Sync external
  useEffect(() => {
    if (useExternal) {
      setTemplates(normalizeApiTemplates(templatesProp));
      setLoading(false);
      setError("");
    }
  }, [useExternal, templatesProp]);


  // Fetch internal
  // Fetch internal
  // Fetch internal
  useEffect(() => {
    if (useExternal) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const apiRes = await documentsTemplateAPI.getAll();
        const list = normalizeApiTemplates(apiRes).map((t: any) => ({
          ...t,
          created_by_name: t.created_by_name || t.created_by_user?.name || t.creator?.name || "—",
          updated_by_name: t.updated_by_name || t.updated_by_user?.name || t.updater?.name || "—",
        }));
        setTemplates(list);
      } catch (e: any) {
        setError("Failed to fetch templates.");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [useExternal, mode]);




  // visible by mode
  const visibleTemplates = useMemo(() => {
    if (mode === "select") {
      return templates.filter((t) => safeLower(t.status || "draft") === "active");
    }
    return templates;
  }, [templates, mode]);

  // filters
  const filteredTemplates = useMemo(() => {
    const term = safeLower(searchTerm.trim());
    return visibleTemplates.filter((template) => {
      const name = safeLower(template.name || "");
      const desc = safeLower(template.description || "");
      const cat = safeLower(template.category || "");
      const st = safeLower(template.status || "draft");

      const matchesSearch = !term || name.includes(term) || desc.includes(term);
      const matchesCategory = selectedCategory === "all" || cat === selectedCategory;
      const matchesStatus = mode === "select" ? true : statusFilter === "all" || st === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [visibleTemplates, searchTerm, selectedCategory, statusFilter, mode]);

  const handleCardClick = (template: Template) => {
    if (mode === "select" && onSelectTemplate) {
      onSelectTemplate({ ...template, _pendingGeneratedPayload: buildGeneratedPayload(template) });
    } else if (mode === "manage" && onEditTemplate) {
      onEditTemplate(template);
    }
  };

  const handleEditClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTemplate?.(template);
  };

  const handleDeleteClick = (templateId: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTemplate?.(templateId);
  };

  const handleDuplicateClick = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicateTemplate?.(template);
  };

  // Use Template
  const handleUseTemplateClick = async (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode !== "select") return;

    const id = template.id;
    setUsingId(id);

    // Optimistic update - immediately show incremented count
    const optimistic: Template = {
      ...template,
      usageCount: (template.usageCount ?? 0) + 1,
      lastUsed: isoNow(),
    };

    // Update UI immediately for better UX
    setTemplates((prev) => prev.map((t) => (t.id === id ? optimistic : t)));

    try {
      // 1) Call API to bump usage count
      const bump = await documentsTemplateAPI.useTemplate(id);
     
      const apiTemplate = bump?.data || bump?.template || bump || null;

      // Merge API response with template
      const merged: Template = apiTemplate
        ? {
          ...template,
          ...apiTemplate,
          usageCount:
            typeof apiTemplate.usage_count === "number"
              ? apiTemplate.usage_count
              : typeof apiTemplate.usageCount === "number"
                ? apiTemplate.usageCount
                : optimistic.usageCount,
          lastUsed: apiTemplate.last_used_at || apiTemplate.last_used || apiTemplate.lastUsed || optimistic.lastUsed,
        }
        : optimistic;

      // Update state with API response
      setTemplates((prev) => prev.map((t) => (t.id === id ? merged : t)));

      // 2) NO DRAFT CREATION HERE (by default)
      if (!autoCreateGenerated) {
        onSelectTemplate?.({ ...merged, _pendingGeneratedPayload: buildGeneratedPayload(merged) });
        return;
      }

      // 3) OPTIONAL: auto-create flow
      const payload = {
        ...buildGeneratedPayload(merged),
        status: "draft" as const,
      };
      const createdRow = await documentsGeneratedAPI.create(payload);
      onSelectTemplate?.({ ...merged, _generatedDoc: createdRow });

    } catch (err) {
      console.error("useTemplate API failed:", err);
      // Keep optimistic update even on failure, or revert if needed
      // Current behavior: keep optimistic count
      onSelectTemplate?.({ ...optimistic, _pendingGeneratedPayload: buildGeneratedPayload(optimistic) });
    } finally {
      setUsingId(null);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">
            {mode === "select" ? "Select Template" : "Template Management"}
          </h2>
        </div>
        {mode === "manage" && onCreateTemplate && (
          <button
            onClick={onCreateTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={12} />
            <span>Create New Template</span>
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input
              type="text"
              placeholder="Search templates by name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={12} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px] text-xs bg-white"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </div>

          {mode === "manage" && (
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px] text-xs bg-white"
              >
                {statusOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex space-x-1 overflow-x-auto pb-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${selectedCategory === category.id
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                  } text-xs`}
              >
                <Icon size={12} />

                <span className="font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-xs">
          Loading templates…
        </div>
      )}
      {!loading && error && (
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Templates Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              const variables = Array.isArray(template.variables) ? template.variables : [];
              const usageCount = typeof template.usageCount === "number" ? template.usageCount : 0;
              const status = safeLower(template.status || "draft");
              const isBusy = usingId === template.id;

              // Prepare display values
              const createdByName = (template.created_by_name || "").trim() || "—";
              const updatedByName = (template.updated_by_name || "").trim() || "—";
              const lastUsedAt = fmtDateIST(template.lastUsed);

              return (
                <div
                  key={template.id}
                  className="relative bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover:border-blue-300 text-xs"
                  onClick={() => handleCardClick(template)}
                >
                  {(mode === "manage" || status === "active") && (
                    <div className="absolute right-3 top-3 z-10">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold ${statusBadgeClasses(status)}`}>
                        {status || "draft"}
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    {/* header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <CategoryIcon className="text-blue-600" size={16} />
                        </div>
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium capitalize">
                          {template.category || "general"}
                        </span>
                        <div className="text-[11px] text-gray-500">
                          {usageCount} uses {' '}
                          Last used: <span className="font-medium text-gray-700">{lastUsedAt}</span>
                        </div>
                      </div>

                      {/* Last used at (IST) */}

                    </div>

                    {/* Created/Updated by */}

                    {/* manage actions */}
                    {mode === "manage" && (
                      <div className="flex items-center space-x-1 mb-3">
                        <button onClick={(e) => handleEditClick(template, e)} className="p-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Edit Template">
                          <Edit size={10} />
                        </button>
                        <button onClick={(e) => handleDuplicateClick(template, e)} className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Duplicate Template">
                          <Copy size={10} />
                        </button>
                        <button onClick={(e) => handleDeleteClick(template.id, e)} className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Delete Template">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}

                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {template.name || "Untitled"}
                    </h3>
                    <p className="text-gray-600 mb-4">{template.description || "—"}</p>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-500 uppercase">Variables:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {variables.slice(0, 3).map((variable, index) => (
                            <span key={`${template.id}-var-${index}-${variable}`} className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {variable}
                            </span>
                          ))}
                          {variables.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">+{variables.length - 3} more</span>
                          )}
                          {variables.length === 0 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded">None</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-[11px] text-gray-600 mb-3">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span>
                            <span className="text-gray-500">Created by:</span>{" "}
                            <span className="font-medium">{createdByName}</span>
                          </span>
                          <span>
                            <span className="text-gray-500">Updated by:</span>{" "}
                            <span className="font-medium">{updatedByName}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => (mode === "select" ? handleUseTemplateClick(template, e) : handleEditClick(template, e))}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
                        disabled={isBusy}
                      >
                        {mode === "select"
                          ? (isBusy ? "Starting…" : "Use Template")
                          : "Manage Template"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* empty */}
          {filteredTemplates.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-xs">
              <FileText className="mx-auto text-gray-300 mb-4" size={40} />
              <h3 className="font-bold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or category.</p>
              {mode === "manage" && onCreateTemplate && (
                <button
                  onClick={onCreateTemplate}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus size={12} />
                  <span>Create New Template</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateSelector;