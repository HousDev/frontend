


import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus, Globe, Eye, Edit3, Trash2, Images, X, Search, Upload,
    Zap, CheckCircle, AlertCircle, Calendar, Image as ImageIcon,
    ChevronDown, ChevronUp, Layout, Sparkles, Power, PowerOff, Check
} from 'lucide-react';
import homeHeroAPI, { HeroBlock, PhotoPreview } from "@/lib/homeHeroAPI";

// ─── Theme Colors (Matching ESALE logo) ────────────────────────────────────────
const N = "#0f2b3d";   // Deep navy/teal from logo
const O = "#e67e22";   // Warm orange from logo
const BG = "#f8fafc";   // Light blue-gray background
const BD = "#e2e8f0";   // Border color
const MU = "#5a7184";   // Muted text

/* ------------------------- Utilities ------------------------ */
const LABEL = `block text-xs font-semibold mb-1.5`;
const nowISO = () => new Date().toISOString();
const classNames = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

function toast(msg: string, variant: 'success' | 'error' | 'info' = 'success') {
    const wrap = document.createElement('div');
    wrap.className = classNames(
        'fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white transition-all',
        variant === 'success' && 'bg-emerald-600',
        variant === 'error' && 'bg-red-600',
        variant === 'info' && 'bg-gray-800',
    );
    wrap.textContent = msg;
    document.body.appendChild(wrap);
    setTimeout(() => { wrap.style.opacity = '0'; wrap.style.transform = 'translateY(-6px)'; }, 2200);
    setTimeout(() => wrap.remove(), 2800);
}

const eqId = (a: string | number, b: string | number) => String(a) === String(b);
const fmtDate = (s?: string) => {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

const sortByUpdatedDesc = (xs: HeroBlock[]) =>
    [...xs].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

/* ----------------------- Small Pieces ---------------------- */

function PhotoThumb({ preview, onRemove }: { preview: PhotoPreview; onRemove: () => void; }) {
    return (
        <div className="relative rounded-lg overflow-hidden border group" style={{ borderColor: BD }}>
            <img src={preview.url} alt={preview.name} className="w-full h-24 object-cover" />
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white shadow p-1 opacity-0 group-hover:opacity-100 transition"
            >
                <Trash2 className="h-3.5 w-3.5" style={{ color: "#ef4444" }} />
            </button>
            <div className="px-2 py-1 text-[10px] truncate" style={{ color: MU }}>{preview.name}</div>
        </div>
    );
}

function PreviewModal({ open, onClose, block }: { open: boolean; onClose: () => void; block?: HeroBlock | null; }) {
    if (!open || !block) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0" 
                style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }} 
                onClick={onClose} 
            />
            
            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0" style={{ background: N, borderBottom: `2px solid ${O}` }}>
                    <div className="flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: O }} /> 
                        <span className="hidden xs:inline">Preview Hero Block</span>
                        <span className="xs:hidden">Preview</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition active:scale-95"
                    >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="relative overflow-hidden" style={{ background: "white" }}>
                        <div className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 text-center">
                            {/* Title */}
                            <h2 
                                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 break-words" 
                                style={{ color: N }}
                            >
                                {block.title}
                            </h2>
                            
                            {/* Description */}
                            <p 
                                className="text-sm sm:text-base md:text-lg break-words px-2 sm:px-0" 
                                style={{ color: MU }}
                            >
                                {block.description}
                            </p>

                            {/* Photos Grid */}
                            {block.photos?.length > 0 && (
                                <div className="mt-8 sm:mt-10 px-2 sm:px-0">
                                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                                        {block.photos.map((p, i) => (
                                            <div key={i} className="relative group">
                                                <img 
                                                    src={p.url} 
                                                    alt={p.name || `Photo ${i + 1}`} 
                                                    className="w-full h-32 sm:h-36 md:h-40 object-cover rounded-xl shadow-lg border transition-transform duration-200 group-hover:scale-105"
                                                    style={{ borderColor: BD }}
                                                    loading="lazy"
                                                />
                                                {p.name && (
                                                    <p className="mt-2 text-xs text-gray-600 truncate px-1">
                                                        {p.name}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Empty state for no photos */}
                            {(!block.photos || block.photos.length === 0) && (
                                <div className="mt-8 text-sm text-gray-500">
                                    No photos available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Optional: Close button at bottom for mobile */}
                <div className="block sm:hidden flex-shrink-0 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function ConfirmModal({
    open, onClose, onConfirm, itemId, title = 'Are you sure?', body = 'This action cannot be undone.',
}: {
    open: boolean; onClose: () => void; onConfirm: (id: string | number) => void;
    itemId?: string | number; title?: string; body?: string;
}) {
    if (!open) return null;
    const disabled = itemId == null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: N }}>{title}</h3>
                    <p className="text-sm" style={{ color: MU }}>{body}</p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border transition-all hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
                            Cancel
                        </button>
                        <button
                            onClick={() => { if (itemId != null) onConfirm(itemId); onClose(); }}
                            className="px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: "#ef4444" }}
                            disabled={disabled}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Compact Form Modal ───────────────────────────────────────────────────────
function HeroFormModal({
    open, onClose, onSubmit, initial,
}: {
    open: boolean; onClose: () => void; onSubmit: (data: Omit<HeroBlock, 'id' | 'created_at' | 'updated_at'>) => void;
    initial?: Partial<HeroBlock> | null;
}) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? "");
    const [photos, setPhotos] = useState<PhotoPreview[]>(initial?.photos ?? []);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (open) {
            setTitle(initial?.title ?? '');
            setDescription(initial?.description ?? "");
            setPhotos(initial?.photos ?? []);
        }
    }, [open]);

    const handlePhotosUpload = async (files: File[]) => {
        const MAX_MB = 5;
        const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        setIsUploading(true);
        const readers = files.map(
            (file) =>
                new Promise<PhotoPreview | null>((resolve) => {
                    if (!valid.includes(file.type)) {
                        toast(`${file.name} is not a valid image`, 'error');
                        return resolve(null);
                    }
                    if (file.size > MAX_MB * 1024 * 1024) {
                        toast(`${file.name} exceeds 5MB`, 'error');
                        return resolve(null);
                    }
                    const fr = new FileReader();
                    fr.onload = () =>
                        resolve({
                            url: String(fr.result || ''),
                            name: file.name,
                            size: file.size,
                            file,
                        } as PhotoPreview);
                    fr.readAsDataURL(file);
                }),
        );

        const items = await Promise.all(readers);
        const next = items.filter(Boolean) as PhotoPreview[];
        if (next.length) setPhotos((p) => [...p, ...next]);
        setIsUploading(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
                {/* Header - Fixed */}
                <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ background: N, borderBottom: `2px solid ${O}` }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${O}20` }}>
                            {initial?.id ? <Edit3 className="h-4 w-4" style={{ color: O }} /> : <Plus className="h-4 w-4" style={{ color: O }} />}
                        </div>
                        <span className="text-white font-semibold">{initial?.id ? 'Edit Hero Block' : 'Create Hero Block'}</span>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                        <X className="h-4 w-4 text-white" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ background: BG }}>
                    {/* Title Field */}
                    <div>
                        <label className={LABEL} style={{ color: N }}>Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter hero section title"
                            className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all focus:ring-2"
                            style={{ borderColor: BD, color: N, background: "white" }}
                        />
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className={LABEL} style={{ color: N }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Enter hero section description"
                            className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all focus:ring-2 resize-none"
                            style={{ borderColor: BD, color: N, background: "white" }}
                        />
                    </div>

                    {/* Photos Upload */}
                    <div>
                        <label className={LABEL} style={{ color: N }}>Photos (JPG, PNG, WebP - Max 5MB each)</label>
                        <div
                            className="border-2 border-dashed rounded-xl p-2 text-center transition-all cursor-pointer hover:opacity-80"
                            style={{ borderColor: BD, background: "white" }}
                        >
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                multiple
                                onChange={(e) => {
                                    const selected = Array.from(e.target.files || []);
                                    if (selected.length > 0) handlePhotosUpload(selected);
                                    (e.currentTarget as HTMLInputElement).value = '';
                                }}
                                className="hidden"
                                id="hero-photos"
                                disabled={isUploading}
                            />
                            <label htmlFor="hero-photos" className="cursor-pointer block">
                                {isUploading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2" style={{ borderColor: `${O}`, borderTopColor: "transparent" }} />
                                        <span className="text-sm" style={{ color: MU }}>Uploading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: MU }} />
                                        <p className="text-sm font-medium mb-1" style={{ color: N }}>Click to upload photos</p>
                                        <p className="text-xs" style={{ color: MU }}>or drag and drop</p>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Photo Preview Grid */}
                        {photos.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold mb-2" style={{ color: N }}>{photos.length} photo(s) selected</p>
                                <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                                    {photos.map((p, idx) => (
                                        <PhotoThumb key={`${p.name}-${idx}`} preview={p} onRemove={() => setPhotos((xs) => xs.filter((_, i) => i !== idx))} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0" style={{ borderColor: BD, background: "white" }}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
                        style={{ borderColor: BD, color: N }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!title.trim()) return toast('Title is required', 'error');
onSubmit({ title: title.trim(), description: description.trim(), photos, is_active: initial?.is_active ?? true });                            onClose();
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: N }}
                    >
                        <CheckCircle className="h-4 w-4" style={{ color: O }} />
                        {initial?.id ? 'Update Block' : 'Create Block'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -------------------------- Main Component ------------------------- */

export default function HomePageManagement() {
    const [blocks, setBlocks] = useState<HeroBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<HeroBlock | null>(null);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewBlock, setPreviewBlock] = useState<HeroBlock | null>(null);

const [confirmOpen, setConfirmOpen] = useState(false);
    const [toDelete, setToDelete] = useState<HeroBlock | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [togglingId, setTogglingId] = useState<string | number | null>(null);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState<'delete' | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const list = await homeHeroAPI.list();
                setBlocks(sortByUpdatedDesc(list));
            } catch (e: any) {
                console.error(e);
                toast(e?.response?.data?.error || 'Failed to load hero blocks', 'error');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        if (!query.trim()) return blocks;
        const q = query.toLowerCase();
        return blocks.filter((b) =>
            [b.title, b.description].some((t) => t?.toLowerCase().includes(q)),
        );
    }, [blocks, query]);

    const upsertBlock = async (
        payload: Omit<HeroBlock, 'id' | 'created_at' | 'updated_at'>,
        id?: string | number,
    ) => {
        const resync = async () => {
            try {
                const list = await homeHeroAPI.list();
                setBlocks(sortByUpdatedDesc(list));
            } catch { }
        };

        try {
            if (id != null) {
                const stamp = nowISO();
                setBlocks(prev =>
                    sortByUpdatedDesc(
                        prev.map(b => (eqId(b.id, id) ? { ...b, ...payload, updated_at: stamp } : b))
                    )
                );

                const server = await homeHeroAPI.update(id, payload);
                setBlocks(prev =>
                    sortByUpdatedDesc(
                        prev.map(b =>
                            eqId(b.id, id)
                                ? { ...b, ...server, title: server.title || b.title, description: server.description || b.description, photos: (server.photos?.length ? server.photos : b.photos) || [], created_at: server.created_at || b.created_at, updated_at: server.updated_at || b.updated_at }
                                : b
                        )
                    )
                );
                toast('Block updated successfully', 'success');
            } else {
                const tempId = `temp-${Date.now()}`;
                const stamp = nowISO();
                const temp: HeroBlock = { id: tempId, ...payload, created_at: stamp, updated_at: stamp };
                setBlocks(prev => sortByUpdatedDesc([temp, ...prev]));

                const server = await homeHeroAPI.create(payload);
                setBlocks(prev =>
                    sortByUpdatedDesc(
                        prev.map(b =>
                            eqId(b.id, tempId)
                                ? { ...b, ...server, title: server.title || b.title, description: server.description || b.description, photos: (server.photos?.length ? server.photos : b.photos) || [], created_at: server.created_at || b.created_at, updated_at: server.updated_at || b.updated_at }
                                : b
                        )
                    )
                );
                toast('Block created successfully', 'success');
            }
        } catch (e: any) {
            console.error(e);
            toast(e?.response?.data?.error || 'Save failed', 'error');
            await resync();
        }
    };

    const requestDelete = (b: HeroBlock) => {
        setToDelete(b);
        setConfirmOpen(true);
    };

    const toggleSelect = (id: string | number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            const key = String(id);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleToggleActive = async (b: HeroBlock) => {
        setTogglingId(b.id);
        setBlocks(prev => sortByUpdatedDesc(prev.map(x => eqId(x.id, b.id) ? { ...x, is_active: !x.is_active } : x)));
        try {
            const updated = await homeHeroAPI.toggleActive(b.id);
            setBlocks(prev => sortByUpdatedDesc(prev.map(x => eqId(x.id, b.id) ? updated : x)));
            toast(updated.is_active ? 'Block activated' : 'Block deactivated', 'success');
        } catch (e: any) {
            console.error(e);
            setBlocks(prev => sortByUpdatedDesc(prev.map(x => eqId(x.id, b.id) ? { ...x, is_active: b.is_active } : x)));
            toast(e?.response?.data?.error || 'Failed to toggle status', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const handleBulkToggle = async (activate: boolean) => {
        const ids = Array.from(selectedIds);
        if (!ids.length) return;
        setBlocks(prev => sortByUpdatedDesc(prev.map(x => selectedIds.has(String(x.id)) ? { ...x, is_active: activate } : x)));
        try {
            await homeHeroAPI.bulkToggleActive(ids, activate);
            toast(`${ids.length} block(s) ${activate ? 'activated' : 'deactivated'}`, 'success');
            clearSelection();
        } catch (e: any) {
            console.error(e);
            toast(e?.response?.data?.error || 'Bulk toggle failed', 'error');
            const list = await homeHeroAPI.list();
            setBlocks(sortByUpdatedDesc(list));
        }
    };

   const handleBulkDelete = async () => {
  // ✅ keep only numeric IDs (real DB IDs)
  const ids = Array.from(selectedIds)
    .map(id => Number(id))
    .filter(n => !isNaN(n) && n > 0);

  if (!ids.length) {
    toast('No valid blocks selected for deletion', 'error');
    return;
  }

  setBlocks(prev => prev.filter(x => !selectedIds.has(String(x.id))));
  try {
    await homeHeroAPI.bulkDelete(ids);
    toast(`${ids.length} block(s) deleted`, 'success');
    clearSelection();
  } catch (e: any) {
    console.error(e);
    toast(e?.response?.data?.error || 'Bulk delete failed', 'error');
    const list = await homeHeroAPI.list();
    setBlocks(sortByUpdatedDesc(list));
  } finally {
    setBulkConfirmOpen(false);
    setBulkAction(null);
  }
};

    const confirmDelete = async (id: string | number) => {
        setBlocks(prev => prev.filter(x => !eqId(x.id, id)));
        try {
            await homeHeroAPI.remove(id);
            toast('Deleted successfully', 'success');
        } catch (e: any) {
            console.error(e);
            toast(e?.response?.data?.error || 'Delete failed', 'error');
            try {
                const row = await homeHeroAPI.getById(id);
                setBlocks(prev => sortByUpdatedDesc([row, ...prev]));
            } catch {
                const list = await homeHeroAPI.list();
                setBlocks(sortByUpdatedDesc(list));
            }
        } finally {
            setToDelete(null);
        }
    };

    return (
        <div className="" style={{ background: BG }}>
            {/* Header Bar */}
              {/* ================= HEADER ================= */}
<div className="sticky top-0 z-20 bg-gray-50">
  <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

    {/* ---------- Search + New Block ---------- */}
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">

      {/* Search */}
      <div className="relative w-full sm:max-w-md order-2 sm:order-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: MU }}
        />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blocks..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white outline-none focus:ring-2"
          style={{
            borderColor: BD,
            color: N,
          }}
        />
      </div>

      {/* New Block */}
      <button
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        className="order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
        style={{ background: N }}
      >
        <Plus className="h-4 w-4" style={{ color: O }} />
        New Block
      </button>

    </div>

    {/* ---------- Bulk Actions ---------- */}

   {/* ---------- Compact Bulk Actions ---------- */}
{selectedIds.size > 0 && (
  <div
    className="mt-3 bg-white border rounded-lg shadow-sm px-4 py-2"
    style={{ borderColor: BD }}
  >
    <div className="flex flex-wrap items-center justify-between gap-2">

      {/* Left */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 mr-2">
          {selectedIds.size} selected
        </span>

        <button
          onClick={() => handleBulkToggle(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white hover:opacity-90 transition"
          style={{ background: "#16a34a" }}
        >
          <Power className="h-3.5 w-3.5" />
          Activate
        </button>

        <button
          onClick={() => handleBulkToggle(false)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white hover:opacity-90 transition"
          style={{ background: "#64748b" }}
        >
          <PowerOff className="h-3.5 w-3.5" />
          Deactivate
        </button>

        <button
          onClick={() => {
            setBulkAction("delete");
            setBulkConfirmOpen(true);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white hover:opacity-90 transition"
          style={{ background: "#ef4444" }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      {/* Right */}
      <button
        onClick={clearSelection}
        className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
      >
        <X className="h-3.5 w-3.5" />
        Clear
      </button>

    </div>
  </div>
)}

  </div>
</div>

            {/* Content Area */}
            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-2 ">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 mx-auto mb-4" style={{ borderColor: `${N}`, borderTopColor: `${O}` }} />
                            <p style={{ color: MU }}>Loading hero blocks...</p>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl shadow-sm p-12 text-center" style={{ background: "white", border: `1px solid ${BD}` }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${N}10` }}>
                            <Images className="h-8 w-8" style={{ color: MU }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: N }}>No hero blocks yet</h3>
                        <p className="text-sm mb-6" style={{ color: MU }}>Create your first home page hero block to get started.</p>
                        <button
                            onClick={() => { setEditing(null); setModalOpen(true); }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                            style={{ background: N }}
                        >
                            <Plus className="h-4 w-4" style={{ color: O }} /> Add Hero Block
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {filtered.map((b) => {
                            const isSelected = selectedIds.has(String(b.id));
                            const isActive = b.is_active !== false;
                            return (
                            <div key={String(b.id)} className="relative rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md" style={{ background: "white", border: `1px solid ${isSelected ? O : BD}`, opacity: isActive ? 1 : 0.65 }}>
                                {/* Selection checkbox */}
                                <button
                                    type="button"
                                    onClick={() => toggleSelect(b.id)}
                                    className="absolute top-3 left-3 z-10 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                                    style={{ background: isSelected ? O : "rgba(255,255,255,0.9)", border: `1.5px solid ${isSelected ? O : BD}` }}
                                >
                                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                </button>

                                {/* Active/Inactive badge */}
                                <span
                                    className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ background: isActive ? "#16a34a" : "#64748b", color: "white" }}
                                >
                                    {isActive ? "Active" : "Inactive"}
                                </span>

                                {/* Card Image */}
                                {b.photos?.[0] ? (
                                    <img src={b.photos[0].url} className="w-full h-44 object-cover" alt={b.photos[0].name} />
                                ) : (
                                    <div className="w-full h-44 flex items-center justify-center" style={{ background: `${N}05` }}>
                                        <ImageIcon className="h-8 w-8" style={{ color: MU }} />
                                    </div>
                                )}
                                
                                {/* Card Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-base mb-1 line-clamp-1" style={{ color: N }}>{b.title}</h3>
                                    <p className="text-sm line-clamp-2 mb-4" style={{ color: MU }}>{b.description || "No description"}</p>
                                    
                                    <div className="flex items-center justify-between text-xs mb-4 pb-3 border-b" style={{ color: MU, borderColor: BD }}>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{fmtDate(b.updated_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ImageIcon className="h-3 w-3" />
                                            <span>{b.photos?.length || 0} photo(s)</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setPreviewBlock(b); setPreviewOpen(true); }}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-50"
                                            style={{ border: `1px solid ${BD}`, color: N }}
                                        >
                                            <Eye className="h-3.5 w-3.5" /> Preview
                                        </button>
                                        <button
                                            onClick={() => { setEditing(b); setModalOpen(true); }}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                                            style={{ background: N }}
                                        >
                                            <Edit3 className="h-3.5 w-3.5" style={{ color: O }} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(b)}
                                            disabled={togglingId === b.id}
                                            title={isActive ? "Deactivate" : "Activate"}
                                            className="px-3 py-2 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
                                            style={{ background: isActive ? "#64748b" : "#16a34a" }}
                                        >
                                            {isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                                        </button>
                                        <button
                                            onClick={() => requestDelete(b)}
                                            className="px-3 py-2 rounded-lg text-white transition-all hover:opacity-90"
                                            style={{ background: "#ef4444" }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            <HeroFormModal
                open={modalOpen}
                initial={editing || undefined}
                onClose={() => setModalOpen(false)}
                onSubmit={(data) => upsertBlock(data, editing?.id)}
            />
            <PreviewModal open={previewOpen} block={previewBlock} onClose={() => setPreviewOpen(false)} />
           <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmDelete}
                itemId={toDelete?.id}
                title="Delete this block?"
                body="This will permanently remove the hero block."
            />
            <ConfirmModal
                open={bulkConfirmOpen && bulkAction === 'delete'}
                onClose={() => { setBulkConfirmOpen(false); setBulkAction(null); }}
                onConfirm={handleBulkDelete}
                itemId="bulk"
                title={`Delete ${selectedIds.size} block(s)?`}
                body="This will permanently remove all selected hero blocks."
            />
        </div>
    );
}