// src/pages/dashboard/TemplateCenter.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  RotateCcw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Smartphone,
  MessageSquare,
  Shield,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import TemplateCenterModal, { TemplateModalData } from "./TemplateCenterModal";
import { TemplateAPI } from "@/lib/TemplateAPI";
import { getMasterDropdownOptions } from "@/lib/useMasterData";

export interface Template {
  id?: string | number;
  name: string;
  category: string;
  subCategory?: string;
  content: string;
  subject?: string;
  channel: "email" | "sms" | "whatsapp" | string;
  priority?: "Normal" | "High" | "Urgent" | "Critical" | string;
  status?: "approved" | "pending" | "rejected" | string;
  autoApprove?: boolean | number;
  is_active?: boolean | number;
  rejection_reason?: string;
  createdAt?: string;
  updatedAt?: string;
  used_count?: number;
}

export default function TemplateCenter() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeChannelTab, setActiveChannelTab] = useState<"all" | "sms" | "whatsapp" | "email">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");

  // Selection & Modals state
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Master data options
  const [masterCategories, setMasterCategories] = useState<string[]>([]);
  const [masterSubCategories, setMasterSubCategories] = useState<string[]>([]);

  // Fetch purely from API
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await TemplateAPI.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setTemplates(list);
      setSelectedIds([]);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      toast.error(err.message || "Failed to load templates from database");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();

    // Fetch Master Categories & Subcategories
    const loadMasterOptions = async () => {
      try {
        const raw = await getMasterDropdownOptions(["common"]);
        const catKey = Object.keys(raw).find((k) => k === "category" || (k.includes("category") && !k.includes("sub")));
        if (catKey && raw[catKey]) {
          setMasterCategories(raw[catKey].map((c: any) => c.value));
        }

        const subCatKey = Object.keys(raw).find((k) => k === "sub category" || k.includes("sub") || k.includes("subcategory"));
        if (subCatKey && raw[subCatKey]) {
          setMasterSubCategories(raw[subCatKey].map((sc: any) => sc.value));
        }
      } catch (e) {
        console.warn("Could not fetch master categories:", e);
      }
    };
    loadMasterOptions();
  }, []);

  // Compute live channel counts from templates
  const channelCounts = useMemo(() => {
    return {
      all: templates.length,
      sms: templates.filter((t) => (t.channel || "").toLowerCase() === "sms").length,
      whatsapp: templates.filter((t) => {
        const ch = (t.channel || "").toLowerCase();
        return ch.includes("wa") || ch === "whatsapp";
      }).length,
      email: templates.filter((t) => (t.channel || "email").toLowerCase() === "email").length,
    };
  }, [templates]);

  // Compute live status counts
  const statusCounts = useMemo(() => {
    const list = templates.filter((t) => {
      if (activeChannelTab === "all") return true;
      const ch = (t.channel || "email").toLowerCase();
      if (activeChannelTab === "whatsapp") return ch.includes("wa") || ch === "whatsapp";
      return ch === activeChannelTab;
    });

    return {
      all: list.length,
      pending: list.filter((t) => (t.status || "").toLowerCase() === "pending").length,
      approved: list.filter((t) => (t.status || "approved").toLowerCase() === "approved").length,
      rejected: list.filter((t) => (t.status || "").toLowerCase() === "rejected").length,
      active: list.filter((t) => t.is_active === 1 || t.is_active === true || t.is_active === undefined).length,
      inactive: list.filter((t) => t.is_active === 0 || t.is_active === false).length,
    };
  }, [templates, activeChannelTab]);

  // Extract unique categories & subcategories from Common Master + DB templates
  const uniqueCategories = useMemo(() => {
    const templateCats = templates.map((t) => t.category).filter(Boolean);
    const combined = Array.from(new Set([...masterCategories, ...templateCats])).filter(Boolean);
    return ["all", ...combined];
  }, [masterCategories, templates]);

  const uniqueSubCategories = useMemo(() => {
    const templateSubCats = templates.map((t) => t.subCategory).filter(Boolean);
    const combined = Array.from(new Set([...masterSubCategories, ...templateSubCats])).filter(Boolean);
    return ["all", ...combined];
  }, [masterSubCategories, templates]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Channel Filter
      const ch = (t.channel || "email").toLowerCase();
      if (activeChannelTab === "sms" && ch !== "sms") return false;
      if (activeChannelTab === "whatsapp" && !ch.includes("wa") && ch !== "whatsapp") return false;
      if (activeChannelTab === "email" && ch !== "email") return false;

      // Status Filter
      const stat = (t.status || "approved").toLowerCase();
      const isActive = t.is_active === 1 || t.is_active === true || t.is_active === undefined;

      if (statusFilter === "pending" && stat !== "pending") return false;
      if (statusFilter === "approved" && stat !== "approved") return false;
      if (statusFilter === "rejected" && stat !== "rejected") return false;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;

      // Category Filter
      if (selectedCategory !== "all" && t.category !== selectedCategory) return false;

      // Sub Category Filter
      if (selectedSubCategory !== "all" && t.subCategory !== selectedSubCategory) return false;

      // Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inName = (t.name || "").toLowerCase().includes(q);
        const inContent = (t.content || "").toLowerCase().includes(q);
        const inSubject = (t.subject || "").toLowerCase().includes(q);
        const inCat = (t.category || "").toLowerCase().includes(q);
        if (!inName && !inContent && !inSubject && !inCat) return false;
      }

      return true;
    });
  }, [templates, activeChannelTab, statusFilter, selectedCategory, selectedSubCategory, searchTerm]);

  // Handle Save (Create or Edit)
  const handleSaveTemplate = async (data: TemplateModalData) => {
    try {
      if (data.id) {
        await TemplateAPI.update(String(data.id), data);
        toast.success("Template updated successfully!");
      } else {
        await TemplateAPI.add(data);
        toast.success("Template created successfully!");
      }
      await fetchTemplates();
    } catch (err: any) {
      console.error("Save template error:", err);
      toast.error(err.message || "Failed to save template to database");
    }
  };

  // Toggle Active
  const handleToggleActive = async (template: Template) => {
    const newActive = template.is_active === 0 || template.is_active === false ? 1 : 0;
    try {
      if (template.id) {
        await TemplateAPI.update(String(template.id), {
          ...template,
          is_active: newActive,
        });
      }
    } catch (e) {
      // silent
    }
    setTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? { ...t, is_active: newActive } : t))
    );
    toast.info(`Template marked as ${newActive ? "Active" : "Inactive"}`);
  };

  // Duplicate
  const handleDuplicate = async (template: Template) => {
    const dup: TemplateModalData = {
      name: `${template.name} (Copy)`,
      category: template.category,
      subCategory: template.subCategory,
      priority: template.priority || "Normal",
      channel: template.channel,
      subject: template.subject,
      content: template.content,
      status: "approved",
      autoApprove: true,
      is_active: 1,
    };
    await handleSaveTemplate(dup);
  };

  // Delete Single
  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await TemplateAPI.delete(String(id));
      toast.success("Template deleted successfully");
      await fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template");
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredTemplates.map((t) => t.id!).filter(Boolean);
    if (selectedIds.length === visibleIds.length && visibleIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the ${selectedIds.length} selected templates?`
      )
    )
      return;

    setIsBulkDeleting(true);
    try {
      for (const id of selectedIds) {
        try {
          await TemplateAPI.delete(String(id));
        } catch (e) {
          // continue
        }
      }
      toast.success(`Deleted ${selectedIds.length} templates successfully!`);
      setSelectedIds([]);
      await fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || "Bulk deletion encountered an error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Parse variables from content
  const extractVariables = (content: string) => {
    const matches = content.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
    return Array.from(new Set(matches));
  };

  // Render text snippet
  const renderSnippet = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const text = doc.body.textContent || content;
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > 120 ? clean.substring(0, 120) + "..." : clean;
  };

  const isAllSelected =
    filteredTemplates.length > 0 &&
    filteredTemplates.every((t) => t.id && selectedIds.includes(t.id));

  return (
    <div className="p-2 sm:p-2 md:p-4 max-w-[1600px] mx-auto space-y-6">
      {/* Top Tabs Row with Actions on the Far Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        {/* Left Side: Channel Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Templates", count: channelCounts.all },
            { id: "sms", label: "SMS", count: channelCounts.sms },
            { id: "whatsapp", label: "WhatsApp", count: channelCounts.whatsapp },
            { id: "email", label: "Email", count: channelCounts.email },
          ].map((tab) => {
            const isActive = activeChannelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveChannelTab(tab.id as any);
                  setSelectedIds([]);
                }}
                className={`py-2 px-3.5 text-sm font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#1a3a5c] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Refresh & Create Template Buttons (and Bulk Delete if active) */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isBulkDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={fetchTemplates}
            disabled={loading}
            title="Refresh templates"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-all cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin text-[#e87722]" : ""}`} />
          </button>

          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowCreateModal(true);
            }}
            className="px-4 sm:px-5 py-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Status Filter Pills & Search / Category Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        {/* Status Pills + Select All option */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {filteredTemplates.length > 0 && (
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 shrink-0">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-3.5 h-3.5 accent-[#1a3a5c] rounded cursor-pointer"
              />
              <span>Select All</span>
            </label>
          )}

          {[
            { id: "all", label: "All", count: statusCounts.all },
            { id: "pending", label: "Pending", count: statusCounts.pending },
            { id: "approved", label: "Approved", count: statusCounts.approved },
            { id: "rejected", label: "Rejected", count: statusCounts.rejected },
            { id: "active", label: "Active", count: statusCounts.active },
            { id: "inactive", label: "Inactive", count: statusCounts.inactive },
          ].map((pill) => {
            const isSelected = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setStatusFilter(pill.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#1a3a5c] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{pill.label}</span>
                <span className={`opacity-80 text-[11px]`}>{pill.count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#e87722] focus:border-[#e87722] outline-none shadow-2xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#e87722] shadow-2xs cursor-pointer capitalize"
          >
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-[#e87722] shadow-2xs cursor-pointer capitalize"
          >
            {uniqueSubCategories.map((sc) => (
              <option key={sc} value={sc}>
                {sc === "all" ? "All Sub Categories" : sc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Template Cards Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#e87722] mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Loading templates from database...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center bg-gray-50/70 border border-dashed border-gray-200 rounded-3xl">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No templates found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Click "+ Create Template" above to create your first dynamic communication template.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {filteredTemplates.map((tpl) => {
            const isSelected = Boolean(tpl.id && selectedIds.includes(tpl.id));
            return (
              <TemplateCardItem
                key={tpl.id || tpl.name}
                template={tpl}
                isSelected={isSelected}
                onToggleSelect={() => tpl.id && handleToggleSelect(tpl.id)}
                extractVariables={extractVariables}
                renderSnippet={renderSnippet}
                onPreview={() => setPreviewTemplate(tpl)}
                onEdit={() => {
                  setEditingTemplate(tpl);
                  setShowCreateModal(true);
                }}
                onDuplicate={() => handleDuplicate(tpl)}
                onDelete={() => tpl.id && handleDelete(tpl.id)}
                onToggleActive={() => handleToggleActive(tpl)}
              />
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      <TemplateCenterModal
        open={showCreateModal}
        initial={editingTemplate}
        channel={activeChannelTab === "all" ? "email" : activeChannelTab}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSaveTemplate}
      />

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Card Item Component
// ----------------------------------------------------
function TemplateCardItem({
  template,
  isSelected,
  onToggleSelect,
  extractVariables,
  renderSnippet,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
}: {
  template: Template;
  isSelected: boolean;
  onToggleSelect: () => void;
  extractVariables: (c: string) => string[];
  renderSnippet: (c: string) => string;
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const vars = extractVariables(template.content);
  const displayVars = vars.slice(0, 4);
  const remainingCount = vars.length - displayVars.length;
  const isActive = template.is_active === 1 || template.is_active === true || template.is_active === undefined;
  const channel = (template.channel || "EMAIL").toUpperCase();

  return (
    <div
      className={`bg-white rounded-2xl border transition-all flex flex-col justify-between p-5 relative group ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
          : "border-gray-200/90 shadow-xs hover:shadow-md"
      }`}
    >
      <div>
        {/* Top Header: Checkbox + Channel Tag + Menu */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 rounded border-gray-300 accent-[#1a3a5c] cursor-pointer"
            />
            <span className="text-xs font-black tracking-wider text-gray-700">
              {channel}
            </span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit();
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate();
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-600" /> Duplicate
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete();
                  }}
                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Template Title */}
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-1">
          {template.name}
        </h3>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Category */}
          {template.category && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              {template.category}
            </span>
          )}

          {/* Sub Category */}
          {template.subCategory && template.subCategory !== "None" && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {template.subCategory}
            </span>
          )}

          {/* Status */}
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-bold capitalize ${
              (template.status || "approved") === "approved"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : (template.status || "") === "rejected"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {template.status || "approved"}
          </span>

          {/* Priority */}
          {template.priority && (
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                template.priority === "Urgent" || template.priority === "Critical"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : template.priority === "High"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {template.priority}
            </span>
          )}
        </div>

        {/* Variables Pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {displayVars.map((v) => (
            <span
              key={v}
              className="px-2 py-0.5 rounded bg-gray-100/90 text-gray-600 font-mono text-[10px] font-semibold"
            >
              {v}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[10px]">
              +{remainingCount}
            </span>
          )}
        </div>

        {/* Preview Snippet Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 italic line-clamp-3 mb-4 leading-relaxed font-sans">
          "{renderSnippet(template.content)}"
        </div>
      </div>

      {/* Card Footer: Active Switch on Left + Preview Button on Right */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={onToggleActive}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
              isActive ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                isActive ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700">
            {isActive ? "Active" : "Inactive"}
          </span>
        </label>

        <button
          onClick={onPreview}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          Preview
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Template Preview Modal Component
// ----------------------------------------------------
function TemplatePreviewModal({
  template,
  onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  const detectedVars = Array.from(
    new Set((template.content.match(/\{([a-zA-Z0-9_]+)\}/g) || []).map((v) => v.replace(/[{}]/g, "")))
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-[#0f2b3d]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Blue Header */}
        <div className="bg-[#1a3a5c] px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold">Template Preview</h2>
            <p className="text-xs text-blue-200">
              #{template.id || "1"} · {(template.channel || "email").toUpperCase()} · {template.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
              {template.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
              {template.status || "approved"}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
              {template.channel || "Email"}
            </span>
          </div>

          {/* Template Details */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Template Name
            </div>
            <div className="text-base font-extrabold text-gray-900 mt-0.5">
              {template.name}
            </div>
          </div>

          {template.subject && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                Subject
              </div>
              <div className="text-sm font-semibold text-gray-800 mt-0.5">
                {template.subject}
              </div>
            </div>
          )}

          {/* Email / Content Preview Frame */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              Content Preview
            </div>
            <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/70 overflow-hidden shadow-inner">
              <div
                className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-x-auto p-2"
                dangerouslySetInnerHTML={{ __html: template.content }}
              />
            </div>
          </div>

          {/* Variables Used */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
              Variables Detected
            </div>
            <div className="flex flex-wrap gap-1.5">
              {detectedVars.map((v) => (
                <span
                  key={v}
                  className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[11px] font-semibold border border-gray-200"
                >
                  &#123;{v}&#125;
                </span>
              ))}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-center">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Priority</div>
              <div className="text-xs font-bold text-gray-800 mt-0.5">
                {template.priority || "Normal"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Used</div>
              <div className="text-xs font-bold text-gray-800 mt-0.5">
                {template.used_count || 0}x
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Auto Approve</div>
              <div className="text-xs font-bold text-gray-800 mt-0.5">
                {template.autoApprove ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}