import React, { useState, useEffect, useCallback } from "react";
import {
  Coffee,
  Plus,
  Edit2,
  Trash2,
  Check,
  Clock,
  Star,
  Target,
  RefreshCw,
  AlertCircle,
  X,
  Search,
  Zap,
  Users,
  Building,
  FileText,
  TrendingUp,
  MapPinned,
  Utensils,
  User as UserIcon,
} from "lucide-react";
import { workSessionAPI } from "@/lib/api";

interface BreakTypeItem {
  id: number | string;
  break_key: string;
  name: string;
  icon?: string;
  duration: number;
  productivity: number;
  daily_limit: number;
  requires_client?: boolean | number;
  requires_location?: boolean | number;
  requires_notes?: boolean | number;
  is_active?: boolean | number;
  display_order?: number;
}

const ICON_OPTIONS: { value: string; label: string; Icon: React.ElementType }[] = [
  { value: "Coffee", label: "Coffee / Tea", Icon: Coffee },
  { value: "Utensils", label: "Utensils (Lunch)", Icon: Utensils },
  { value: "User", label: "Personal", Icon: UserIcon },
  { value: "FileText", label: "Documentation", Icon: FileText },
  { value: "TrendingUp", label: "Research", Icon: TrendingUp },
  { value: "Users", label: "Meeting", Icon: Users },
  { value: "MapPinned", label: "Site Visit", Icon: MapPinned },
  { value: "Building", label: "Property Visit", Icon: Building },
];

const getIconComponent = (name?: string): React.ElementType => {
  const found = ICON_OPTIONS.find((o) => o.value === name);
  return found?.Icon || Coffee;
};

export const BreakMasterTab: React.FC = () => {
  const [breakTypes, setBreakTypes] = useState<BreakTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<BreakTypeItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchBreakTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workSessionAPI.getAdminBreakTypes();
      if (res?.success && Array.isArray(res.breakTypes)) {
        setBreakTypes(res.breakTypes);
      }
    } catch (err) {
      console.error("Failed to fetch admin break types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBreakTypes();
  }, [fetchBreakTypes]);

  const handleOpenAdd = () => {
    setEditItem({
      id: 0,
      break_key: "",
      name: "",
      icon: "Coffee",
      duration: 15,
      productivity: 0.1,
      daily_limit: 2,
      requires_client: 0,
      requires_location: 0,
      requires_notes: 0,
      is_active: 1,
      display_order: breakTypes.length + 1,
    });
    setIsFormOpen(true);
    setMsg(null);
  };

  const handleOpenEdit = (item: BreakTypeItem) => {
    setEditItem({ ...item });
    setIsFormOpen(true);
    setMsg(null);
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this break category?")) return;
    try {
      await workSessionAPI.deleteBreakType(id);
      setMsg({ type: "success", text: "Break type deleted successfully" });
      fetchBreakTypes();
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Failed to delete break type" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    if (!editItem.name.trim()) {
      setMsg({ type: "error", text: "Please enter a break category name" });
      return;
    }

    setSaving(true);
    try {
      if (editItem.id && editItem.id !== 0) {
        await workSessionAPI.updateBreakType(editItem.id, editItem);
        setMsg({ type: "success", text: "Break type updated successfully" });
      } else {
        await workSessionAPI.createBreakType(editItem);
        setMsg({ type: "success", text: "New break type created successfully" });
      }
      setIsFormOpen(false);
      setEditItem(null);
      fetchBreakTypes();
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Failed to save break type" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = breakTypes.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.break_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = breakTypes.filter((b) => Boolean(b.is_active)).length;
  const isEditing = Boolean(editItem && editItem.id && editItem.id !== 0);

  return (
    <div className="space-y-2">
      {/* ── Compact Toolbar ── */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-md bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
              <Coffee className="w-3.5 h-3.5 text-orange-500" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-bold text-slate-900 leading-tight truncate">
                Smart Break Master
              </h2>
              <p className="text-[10.5px] text-slate-500 leading-tight truncate">
                Daily limit · duration · productivity ratios
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {breakTypes.length} total
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {activeCount} active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 sm:w-48 h-7 pl-6 pr-2 text-[11px] rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-all"
              />
            </div>
            <button
              onClick={fetchBreakTypes}
              title="Refresh"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors active:scale-95"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-orange-500" : ""}`} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 h-7 px-2.5 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3 h-3" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* ── Message Banner ── */}
      {msg && (
        <div
          className={`px-3 py-1.5 rounded-md text-[11px] font-semibold flex items-center justify-between border ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            {msg.type === "success" ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {msg.text}
          </span>
          <button onClick={() => setMsg(null)} className="opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ── Compact Add / Edit Form ── */}
      {isFormOpen && editItem && (
        <form
          onSubmit={handleSave}
          className="rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-orange-400 to-transparent" />

          <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
            <h3 className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-orange-500" />
              {isEditing ? "Edit Break Category" : "Create New Break Category"}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-[10.5px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="p-3 space-y-2.5">
            {/* Row 1: Name / Key / Limit / Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  placeholder="e.g. Tea Break"
                  className="w-full h-8 px-2 text-[11.5px] rounded-md border border-slate-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Break Key / Code
                </label>
                <input
                  type="text"
                  value={editItem.break_key}
                  onChange={(e) => setEditItem({ ...editItem, break_key: e.target.value })}
                  placeholder="e.g. tea, lunch"
                  className="w-full h-8 px-2 text-[11.5px] rounded-md border border-slate-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Daily Limit <span className="text-orange-600 font-normal">(0 = ∞)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editItem.daily_limit}
                  onChange={(e) => setEditItem({ ...editItem, daily_limit: Number(e.target.value) })}
                  className="w-full h-8 px-2 text-[11.5px] font-bold text-orange-600 rounded-md border border-slate-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={editItem.duration}
                  onChange={(e) => setEditItem({ ...editItem, duration: Number(e.target.value) })}
                  className="w-full h-8 px-2 text-[11.5px] rounded-md border border-slate-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Row 2: Productivity / Icon / toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Productivity Ratio (0–1)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={editItem.productivity}
                  onChange={(e) => setEditItem({ ...editItem, productivity: Number(e.target.value) })}
                  className="w-full h-8 px-2 text-[11.5px] rounded-md border border-slate-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Icon Type
                </label>
                <select
                  value={editItem.icon || "Coffee"}
                  onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })}
                  className="w-full h-8 px-2 text-[11.5px] rounded-md border border-slate-300 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none bg-white"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 h-8 mt-[14px] px-2.5 rounded-md border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(editItem.is_active)}
                  onChange={(e) => setEditItem({ ...editItem, is_active: e.target.checked ? 1 : 0 })}
                  className="w-3.5 h-3.5 rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="text-[11px] font-semibold text-slate-700">Active</span>
              </label>

              <label className="flex items-center gap-2 h-8 mt-[14px] px-2.5 rounded-md border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(editItem.requires_client)}
                  onChange={(e) => setEditItem({ ...editItem, requires_client: e.target.checked ? 1 : 0 })}
                  className="w-3.5 h-3.5 rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="text-[11px] font-semibold text-slate-700">Require Client</span>
              </label>
            </div>

            {/* Row 3: Property toggle + Submit */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(editItem.requires_location)}
                  onChange={(e) => setEditItem({ ...editItem, requires_location: e.target.checked ? 1 : 0 })}
                  className="w-3.5 h-3.5 rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="text-[11px] font-semibold text-slate-700">Require Property / Location</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="h-8 px-3 rounded-md border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold transition-all shadow-sm disabled:opacity-50 active:scale-95"
                >
                  {saving ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ── Compact Table ── */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin text-orange-500" />
            <p className="text-[11px] font-semibold">Loading break master data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-400 space-y-2">
            <Coffee className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-[12px] font-semibold text-slate-600">No Break Categories Found</p>
            <p className="text-[10.5px] text-slate-400">
              Click <span className="font-semibold text-orange-500">New</span> to create a category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wide text-[9.5px]">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Key</th>
                  <th className="py-2 px-3 text-center">Daily Limit</th>
                  <th className="py-2 px-3">Duration</th>
                  <th className="py-2 px-3">Productivity</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((item) => {
                  const Icon = getIconComponent(item.icon);
                  return (
                    <tr key={item.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-1.5 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                            <Icon className="w-3 h-3" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-[11.5px] leading-4 truncate">
                              {item.name}
                            </div>
                            {(item.requires_client || item.requires_location) && (
                              <div className="text-[9px] text-slate-400 leading-3 truncate">
                                {[
                                  item.requires_client ? "Client" : null,
                                  item.requires_location ? "Property" : null,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 px-3">
                        <span className="font-mono text-[10.5px] text-slate-500">
                          {item.break_key || "—"}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {item.daily_limit && item.daily_limit > 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {item.daily_limit}×/day
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-[2px] rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500">
                            Unlimited
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.duration}m
                        </span>
                      </td>
                      <td className="py-1.5 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <Star className="w-3 h-3 text-emerald-500" />
                          +{Math.round((item.productivity || 0) * 100)}%
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-70 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit"
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-orange-100 text-slate-500 hover:text-orange-600 transition-colors active:scale-95"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors active:scale-95"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakMasterTab;