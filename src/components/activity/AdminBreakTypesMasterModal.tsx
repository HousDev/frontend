import React, { useState, useEffect, useCallback } from "react";
import {
  Coffee,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Clock,
  Star,
  Target,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Utensils,
  User,
  FileText,
  TrendingUp,
  Users,
  MapPinned,
  Building,
} from "lucide-react";
import { workSessionAPI } from "@/lib/api";

// ── Brand tokens ───────────────────────────────────────
const NAVY = "#0B3854";
const NAVY_SOFT = "#11507A";
const ORANGE = "#E6761D";
const LINE = "#dbe4ee";
const SCREEN = "#eef3f8";
const CARD_SHADOW = "0 1px 2px rgba(11,56,84,0.06), 0 4px 12px -6px rgba(11,56,84,0.10)";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Coffee,
  Utensils,
  User,
  FileText,
  TrendingUp,
  Users,
  MapPinned,
  Building,
};

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const inputCls =
  "w-full h-8 px-2.5 rounded-lg border border-slate-300 text-[11.5px] bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/25 focus:border-[#E6761D] transition-all";
const labelCls = "block text-[10.5px] font-semibold text-slate-600 mb-1";

export const AdminBreakTypesMasterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [breakTypes, setBreakTypes] = useState<BreakTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<BreakTypeItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete confirmation modal (replaces window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<BreakTypeItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

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
    if (isOpen) {
      fetchBreakTypes();
    }
  }, [isOpen, fetchBreakTypes]);

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

  // Opens the confirm modal
  const handleDelete = (item: BreakTypeItem) => {
    setDeleteTarget(item);
  };

  // Runs after confirming in the modal
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await workSessionAPI.deleteBreakType(deleteTarget.id);
      setMsg({ type: "success", text: "Break type deleted successfully" });
      setDeleteTarget(null);
      fetchBreakTypes();
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Failed to delete break type" });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    if (!editItem.name.trim()) {
      setMsg({ type: "error", text: "Please provide a name for the break type" });
      return;
    }

    setSaving(true);
    try {
      if (editItem.id && editItem.id !== 0) {
        await workSessionAPI.updateBreakType(editItem.id, editItem);
        setMsg({ type: "success", text: "Break type updated successfully" });
      } else {
        await workSessionAPI.createBreakType(editItem);
        setMsg({ type: "success", text: "New break type added to Master Data" });
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

  if (!isOpen) return null;

  const checkChip = (
    checked: boolean,
    onChange: (v: boolean) => void,
    label: string
  ) => (
    <label
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer select-none transition-all"
      style={{
        background: checked ? "rgba(230,118,29,0.10)" : "#fff",
        border: `1px solid ${checked ? "rgba(230,118,29,0.45)" : "#cbd5e1"}`,
        color: checked ? "#B85A10" : "#475569",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded w-3.5 h-3.5"
        style={{ accentColor: ORANGE }}
      />
      {label}
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(4,24,38,0.70)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.65)" }}
      >
        {/* Accent line */}
        <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(90deg, ${ORANGE}, #f59e4b, transparent)` }} />

        {/* Header */}
        <div
          className="px-4 py-2.5 text-white flex items-center justify-between gap-3 shrink-0"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(230,118,29,0.20)", border: "1px solid rgba(230,118,29,0.45)" }}
            >
              <Coffee className="w-4 h-4" style={{ color: ORANGE }} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[13.5px] font-semibold leading-none truncate">Smart Break Master Configuration</h2>
                <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-[2px] rounded-full text-white/70" style={{ background: "rgba(255,255,255,0.10)" }}>
                  {breakTypes.length} types
                </span>
              </div>
              <p className="text-[10.5px] text-white/60 mt-1 leading-none truncate">
                Break categories, daily limits, durations & productivity ratios
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-white text-[11.5px] font-semibold transition-all active:scale-95"
              style={{ background: ORANGE, boxShadow: "0 4px 12px -4px rgba(230,118,29,0.7)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Break Type
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {msg && (
          <div
            className={`px-4 py-1.5 text-[11.5px] font-semibold flex items-center justify-between shrink-0 ${msg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
              : "bg-rose-50 text-rose-800 border-b border-rose-200"
              }`}
          >
            <span className="flex items-center gap-1.5">
              {msg.type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {msg.text}
            </span>
            <button onClick={() => setMsg(null)} className="opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5" style={{ background: SCREEN, scrollbarWidth: "thin" }}>
          {isFormOpen && editItem && (
            <form
              onSubmit={handleSave}
              className="p-3 rounded-xl bg-white space-y-3"
              style={{ border: `1px solid ${LINE}`, borderLeft: `3px solid ${ORANGE}`, boxShadow: CARD_SHADOW }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: NAVY }}>
                  <span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "rgba(230,118,29,0.14)" }}>
                    <Target className="w-3 h-3" style={{ color: ORANGE }} />
                  </span>
                  {editItem.id ? "Edit Break Type" : "Add New Break Type"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>
                    Break Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    placeholder="e.g. Tea Break, Lunch Break"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Break Key / Identifier</label>
                  <input
                    type="text"
                    value={editItem.break_key}
                    onChange={(e) => setEditItem({ ...editItem, break_key: e.target.value })}
                    placeholder="e.g. tea, lunch (auto if empty)"
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Daily Limit <span className="font-normal" style={{ color: ORANGE }}>(0 = Unlimited)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editItem.daily_limit}
                    onChange={(e) => setEditItem({ ...editItem, daily_limit: Number(e.target.value) })}
                    className={`${inputCls} font-bold`}
                    style={{ color: "#B85A10" }}
                  />
                </div>

                <div>
                  <label className={labelCls}>Duration (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={editItem.duration}
                    onChange={(e) => setEditItem({ ...editItem, duration: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Productivity Ratio (0.0 – 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={editItem.productivity}
                    onChange={(e) => setEditItem({ ...editItem, productivity: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Icon Type</label>
                  <select
                    value={editItem.icon || "Coffee"}
                    onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Coffee">Coffee / Tea</option>
                    <option value="Utensils">Utensils (Lunch)</option>
                    <option value="User">User (Personal)</option>
                    <option value="FileText">FileText (Documentation)</option>
                    <option value="TrendingUp">TrendingUp (Market Research)</option>
                    <option value="Users">Users (Meeting)</option>
                    <option value="MapPinned">MapPinned (Site Visit)</option>
                    <option value="Building">Building (Property Visit)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap pt-2.5" style={{ borderTop: `1px solid ${LINE}` }}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {checkChip(Boolean(editItem.is_active), (v) => setEditItem({ ...editItem, is_active: v ? 1 : 0 }), "Active in employee list")}
                  {checkChip(Boolean(editItem.requires_client), (v) => setEditItem({ ...editItem, requires_client: v ? 1 : 0 }), "Require Client Name")}
                  {checkChip(Boolean(editItem.requires_location), (v) => setEditItem({ ...editItem, requires_location: v ? 1 : 0 }), "Require Property / Location")}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="h-8 px-3.5 rounded-lg border border-slate-300 text-[11.5px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-white text-[11.5px] font-semibold transition-all disabled:opacity-60 active:scale-95"
                    style={{ background: ORANGE, boxShadow: "0 4px 12px -4px rgba(230,118,29,0.7)" }}
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Save to Master Data
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}>
            {loading ? (
              <div className="py-8 text-center text-slate-400 space-y-1.5">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin" style={{ color: ORANGE }} />
                <p className="text-[11.5px] font-medium">Loading break types from master data...</p>
              </div>
            ) : breakTypes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Coffee className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-[13px] font-semibold text-slate-600">No Break Types Found</p>
                <p className="text-[11.5px] text-slate-400">Click &quot;Add Break Type&quot; to configure your first break category.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="text-white/85 font-semibold uppercase tracking-wide text-[10px]"
                    style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}
                  >
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
                  {breakTypes.map((item) => {
                    const Icon = ICON_MAP[item.icon || "Coffee"] || Coffee;
                    const prodPct = Math.round((item.productivity || 0) * 100);
                    return (
                      <tr key={item.id} className="hover:bg-[#0B3854]/[0.03] transition-colors">
                        <td className="py-1.5 px-3">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span
                              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: "rgba(230,118,29,0.12)", border: "1px solid rgba(230,118,29,0.25)" }}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                            </span>
                            <span className="font-semibold text-[12px]" style={{ color: NAVY }}>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-3 font-mono text-[10.5px] text-slate-500">{item.break_key}</td>
                        <td className="py-1.5 px-3 text-center">
                          {item.daily_limit && item.daily_limit > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold whitespace-nowrap bg-[#E6761D]/10 text-[#B85A10] border border-[#E6761D]/25">
                              {item.daily_limit} {item.daily_limit === 1 ? "time" : "times"}/day
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold whitespace-nowrap bg-slate-100 text-slate-500 border border-slate-200">
                              Unlimited
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 whitespace-nowrap font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {item.duration} min
                          </span>
                        </td>
                        <td className="py-1.5 px-3">
                          <div className="flex items-center gap-2 min-w-[86px]">
                            <span className="flex items-center gap-1 font-bold text-emerald-700 text-[11px] w-[46px] shrink-0">
                              <Star className="w-3 h-3 text-emerald-500" />
                              +{prodPct}%
                            </span>
                            <span className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(11,56,84,0.08)" }}>
                              <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, prodPct)}%` }} />
                            </span>
                          </div>
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {item.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              title="Edit"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-[#E6761D]/10 hover:text-[#B85A10] transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              title="Delete"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center justify-between gap-3 shrink-0"
          style={{ background: "#fff", borderTop: `1px solid ${LINE}` }}
        >
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Changes apply immediately across all employee tracker sessions.</span>
          </div>
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-lg text-white text-[11.5px] font-semibold transition-all active:scale-95 shrink-0"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)`, boxShadow: "0 3px 10px -4px rgba(11,56,84,0.55)" }}
          >
            Done
          </button>
        </div>
      </div>

      {/* ── Delete confirmation modal (instead of browser alert) ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(4,24,38,0.60)", backdropFilter: "blur(3px)" }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95"
            style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.6)" }}
          >
            <div className="h-[2px] w-full bg-rose-500" />
            <div className="p-4 text-center">
              <span className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </span>
              <h3 className="mt-2.5 text-[13.5px] font-semibold" style={{ color: NAVY }}>Delete break type?</h3>
              <p className="mt-1 text-[11.5px] text-slate-500 leading-snug">
                <span className="font-semibold text-slate-700">{deleteTarget.name}</span> will be removed from master data. This can&apos;t be undone.
              </p>
            </div>
            <div className="px-4 py-2.5 flex items-center gap-2 bg-slate-50" style={{ borderTop: `1px solid ${LINE}` }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 h-8 rounded-lg border border-slate-300 bg-white text-[11.5px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-white text-[11.5px] font-semibold bg-rose-600 hover:bg-rose-700 transition-all disabled:opacity-70 active:scale-95"
                style={{ boxShadow: "0 4px 12px -4px rgba(225,29,72,0.6)" }}
              >
                {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBreakTypesMasterModal;