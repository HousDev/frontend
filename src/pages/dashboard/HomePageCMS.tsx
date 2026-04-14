// import React, { useEffect, useMemo, useState } from 'react';
// import {
//     Plus, Globe, Eye, Edit3, Trash2, Images, X, Search, Upload,
// } from 'lucide-react';
// import homeHeroAPI, { HeroBlock, PhotoPreview } from "@/lib/homeHeroAPI";

// /* ------------------------- Utilities ------------------------ */
// const LABEL = 'block text-sm font-medium text-gray-700 mb-2';
// const nowISO = () => new Date().toISOString();
// const classNames = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');
// function toast(msg: string, variant: 'success' | 'error' | 'info' = 'success') {
//     const wrap = document.createElement('div');
//     wrap.className = classNames(
//         'fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white transition-all',
//         variant === 'success' && 'bg-emerald-600',
//         variant === 'error' && 'bg-red-600',
//         variant === 'info' && 'bg-gray-800',
//     );
//     wrap.textContent = msg;
//     document.body.appendChild(wrap);
//     setTimeout(() => { wrap.style.opacity = '0'; wrap.style.transform = 'translateY(-6px)'; }, 2200);
//     setTimeout(() => wrap.remove(), 2800);
// }
// const eqId = (a: string | number, b: string | number) => String(a) === String(b);
// const fmtDate = (s?: string) => {
//     if (!s) return "—";
//     const d = new Date(s);
//     return isNaN(d.getTime()) ? "—" : d.toLocaleString();
// };
// // keep list sorted by updated_at desc
// const sortByUpdatedDesc = (xs: HeroBlock[]) =>
//     [...xs].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

// /* ----------------------- Small Pieces ---------------------- */

// function PhotoThumb({ preview, onRemove }: { preview: PhotoPreview; onRemove: () => void; }) {
//     return (
//         <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white group">
//             <img src={preview.url} alt={preview.name} className="w-full h-28 object-cover" />
//             <button
//                 type="button"
//                 onClick={onRemove}
//                 title="Remove"
//                 className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-white/95 hover:bg-white shadow p-1 opacity-0 group-hover:opacity-100 transition"
//             >
//                 <Trash2 className="h-4 w-4 text-red-600" />
//             </button>
//             <div className="px-2 py-1 text-[11px] text-gray-600 truncate">{preview.name}</div>
//         </div>
//     );
// }

// function PreviewModal({
//     open, onClose, block,
// }: { open: boolean; onClose: () => void; block?: HeroBlock | null; }) {
//     if (!open || !block) return null;
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
//                 <div className="flex items-center justify-between px-6 py-4 border-b">
//                     <div className="flex items-center gap-2 text-gray-900 font-semibold">
//                         <Eye className="h-5 w-5 text-blue-600" /> Preview
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
//                 </div>

//                 <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
//                     <div className="max-w-5xl mx-auto px-6 text-center">
//                         <h2 className="text-3xl md:text-4xl font-bold mb-3">{block.title}</h2>
//                         <p className="text-base md:text-lg text-blue-100 mb-8">{block.description}</p>

//                         {block.photos?.length > 0 && (
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                 {block.photos.map((p, i) => (
//                                     <img key={i} src={p.url} alt={p.name} className="w-full h-32 object-cover rounded-lg border border-white/20" />
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </section>
//             </div>
//         </div>
//     );
// }

// // ---------- ID-AWARE Confirm Modal ----------
// function ConfirmModal({
//     open,
//     onClose,
//     onConfirm,
//     itemId,
//     title = 'Are you sure?',
//     body = 'This action cannot be undone.',
// }: {
//     open: boolean;
//     onClose: () => void;
//     onConfirm: (id: string | number) => void; // ← id passes back
//     itemId?: string | number;
//     title?: string;
//     body?: string;
// }) {
//     if (!open) return null;
//     const disabled = itemId == null;
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//                 <div className="px-6 py-5">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
//                     <p className="text-gray-600 text-sm">{body}</p>
//                     <div className="mt-6 flex justify-end gap-3">
//                         <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
//                         <button
//                             onClick={() => { if (itemId != null) onConfirm(itemId); onClose(); }}
//                             className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
//                             disabled={disabled}
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // ---------- Form Modal ----------
// function HeroFormModal({
//     open, onClose, onSubmit, initial,
// }: {
//     open: boolean;
//     onClose: () => void;
//     onSubmit: (data: Omit<HeroBlock, 'id' | 'created_at' | 'updated_at'>) => void;
//     initial?: Partial<HeroBlock> | null;
// }) {
//     const [title, setTitle] = useState(initial?.title ?? '');
//     const [description, setDescription] = useState(initial?.description ?? "");
//     const [photos, setPhotos] = useState<PhotoPreview[]>(initial?.photos ?? []);

//     useEffect(() => {
//         if (open) {
//             setTitle(initial?.title ?? '');
//             setDescription(initial?.description ?? "");
//             setPhotos(initial?.photos ?? []);
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [open]);

//     const handlePhotosUpload = (files: File[]) => {
//         const MAX_MB = 5;
//         const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon'];

//         const readers = files.map(
//             (file) =>
//                 new Promise<PhotoPreview | null>((resolve) => {
//                     if (!valid.includes(file.type)) return resolve(null);
//                     if (file.size > MAX_MB * 1024 * 1024) return resolve(null);
//                     const fr = new FileReader();
//                     fr.onload = () =>
//                         resolve({
//                             url: String(fr.result || ''),
//                             name: file.name,
//                             size: file.size,
//                             // 🔴 IMPORTANT: attach the File so we can send it with FormData
//                             file,
//                         } as PhotoPreview);
//                     fr.readAsDataURL(file);
//                 }),
//         );

//         Promise.all(readers).then((items) => {
//             const next = items.filter(Boolean) as PhotoPreview[];
//             if (next.length) setPhotos((p) => [...p, ...next]);
//         });
//     };

//     if (!open) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
//                 <div className="flex items-center justify-between px-6 py-4 border-b">
//                     <div className="flex items-center gap-2 text-gray-900 font-semibold">
//                         <Images className="h-5 w-5 text-blue-600" /> {initial?.id ? 'Edit Hero Block' : 'Add Hero Block'}
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
//                 </div>

//                 <div className="p-6 space-y-6">
//                     <div>
//                         <label className={LABEL}>Title</label>
//                         <input
//                             type="text"
//                             value={title}
//                             onChange={(e) => setTitle(e.target.value)}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                     </div>

//                     <div>
//                         <label className={LABEL}>Description</label>
//                         <textarea
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             rows={3}
//                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                     </div>

//                     <div className="space-y-3">
//                         <div>
//                             <label className={LABEL}> Photos (JPG/PNG, Multiple)</label>
//                             <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors bg-white">
//                                 <input
//                                     type="file"
//                                     accept=".jpg,.jpeg,.png"
//                                     multiple
//                                     onChange={(e) => {
//                                         const selected = Array.from(e.target.files || []);
//                                         if (selected.length > 0) handlePhotosUpload(selected);
//                                         (e.currentTarget as HTMLInputElement).value = '';
//                                     }}
//                                     className="hidden"
//                                     id="hero-photos"
//                                 />
//                                 <label htmlFor="hero-photos" className="cursor-pointer">
//                                     <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2" />
//                                     <p className="text-sm text-gray-600 mb-1">
//                                         {photos.length > 0 ? 'Add More Photos' : 'Choose Photos'}
//                                     </p>
//                                     <p className="text-xs text-gray-500">JPG, PNG up to 5MB each</p>
//                                 </label>
//                             </div>
//                         </div>

//                         {photos.length > 0 && (
//                             <div>
//                                 <label className={LABEL}>Photos Preview ({photos.length} files)</label>
//                                 <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto">
//                                     {photos.map((p, idx) => (
//                                         <PhotoThumb key={`${p.name}-${idx}`} preview={p} onRemove={() => setPhotos((xs) => xs.filter((_, i) => i !== idx))} />
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="px-6 py-4 border-t flex justify-end gap-3">
//                     <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
//                     <button
//                         onClick={() => {
//                             if (!title.trim()) return toast('Title is required', 'error');
//                             onSubmit({ title: title.trim(), description: description.trim(), photos });
//                             onClose();
//                         }}
//                         className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//                     >
//                         {initial?.id ? 'Update' : 'Create'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// /* -------------------------- Main Component ------------------------- */

// export default function HomePageManagement() {
//     const [blocks, setBlocks] = useState<HeroBlock[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [query, setQuery] = useState('');

//     const [modalOpen, setModalOpen] = useState(false);
//     const [editing, setEditing] = useState<HeroBlock | null>(null);

//     const [previewOpen, setPreviewOpen] = useState(false);
//     const [previewBlock, setPreviewBlock] = useState<HeroBlock | null>(null);

//     const [confirmOpen, setConfirmOpen] = useState(false);
//     const [toDelete, setToDelete] = useState<HeroBlock | null>(null);

//     // ---------- Fetch from API on mount ----------
//     useEffect(() => {
//         (async () => {
//             try {
//                 setLoading(true);
//                 const list = await homeHeroAPI.list();
//                 setBlocks(sortByUpdatedDesc(list));
//             } catch (e: any) {
//                 console.error(e);
//                 toast(e?.response?.data?.error || 'Failed to load hero blocks', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, []);

//     const filtered = useMemo(() => {
//         if (!query.trim()) return blocks;
//         const q = query.toLowerCase();
//         return blocks.filter((b) =>
//             [b.title, b.description].some((t) => t?.toLowerCase().includes(q)),
//         );
//     }, [blocks, query]);

//     // ---------- Create / Update ----------
//     const upsertBlock = async (
//         payload: Omit<HeroBlock, 'id' | 'created_at' | 'updated_at'>,
//         id?: string | number,
//     ) => {
//         const resync = async () => {
//             try {
//                 const list = await homeHeroAPI.list();
//                 setBlocks(sortByUpdatedDesc(list));
//             } catch { }
//         };

//         try {
//             if (id != null) {
//                 // Optimistic UI + reorder
//                 const stamp = nowISO();
//                 setBlocks(prev =>
//                     sortByUpdatedDesc(
//                         prev.map(b => (eqId(b.id, id) ? { ...b, ...payload, updated_at: stamp } : b))
//                     )
//                 );

//                 const server = await homeHeroAPI.update(id, payload);

//                 // Merge + reorder
//                 setBlocks(prev =>
//                     sortByUpdatedDesc(
//                         prev.map(b =>
//                             eqId(b.id, id)
//                                 ? {
//                                     ...b,
//                                     ...server,
//                                     title: server.title || b.title,
//                                     description: server.description || b.description,
//                                     photos: (server.photos?.length ? server.photos : b.photos) || [],
//                                     created_at: server.created_at || b.created_at,
//                                     updated_at: server.updated_at || b.updated_at,
//                                 }
//                                 : b
//                         )
//                     )
//                 );

//                 toast('Block updated', 'success');
//             } else {
//                 // Optimistic temp on top
//                 const tempId = `temp-${Date.now()}`;
//                 const stamp = nowISO();
//                 const temp: HeroBlock = {
//                     id: tempId,
//                     ...payload,
//                     created_at: stamp,
//                     updated_at: stamp,
//                 };
//                 setBlocks(prev => sortByUpdatedDesc([temp, ...prev]));

//                 const server = await homeHeroAPI.create(payload);

//                 // Replace temp in place (merge) + keep ordering by updated_at
//                 setBlocks(prev =>
//                     sortByUpdatedDesc(
//                         prev.map(b =>
//                             eqId(b.id, tempId)
//                                 ? {
//                                     ...b,
//                                     ...server,
//                                     title: server.title || b.title,
//                                     description: server.description || b.description,
//                                     photos: (server.photos?.length ? server.photos : b.photos) || [],
//                                     created_at: server.created_at || b.created_at,
//                                     updated_at: server.updated_at || b.updated_at,
//                                 }
//                                 : b
//                         )
//                     )
//                 );

//                 toast('Block created', 'success');
//             }
//         } catch (e: any) {
//             console.error(e);
//             toast(e?.response?.data?.error || 'Save failed', 'error');
//             await resync();
//         }
//     };

//     // ---------- Delete ----------
//     const requestDelete = (b: HeroBlock) => {
//         setToDelete(b);
//         setConfirmOpen(true);
//     };

//     // id-aware confirm (optimistic + restore)
//     const confirmDelete = async (id: string | number) => {
//         // instant remove
//         setBlocks(prev => prev.filter(x => !eqId(x.id, id)));

//         try {
//             await homeHeroAPI.remove(id);
//             toast('Deleted successfully', 'success');
//         } catch (e: any) {
//             console.error(e);
//             toast(e?.response?.data?.error || 'Delete failed', 'error');
//             // restore
//             try {
//                 const row = await homeHeroAPI.getById(id);
//                 setBlocks(prev => sortByUpdatedDesc([row, ...prev]));
//             } catch {
//                 const list = await homeHeroAPI.list();
//                 setBlocks(sortByUpdatedDesc(list));
//             }
//         } finally {
//             setToDelete(null);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Top bar */}
//             <div className="bg-white shadow-sm border-b">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4">
//                         <div className="flex items-center gap-3">
//                             <Globe className="text-blue-600" size={24} />
//                             <h1 className="text-xl font-semibold text-gray-900">Home Page Management</h1>
//                         </div>

//                         <div className="flex flex-1 md:flex-none items-center gap-3">
//                             <div className="relative flex-1 md:w-80">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                                 <input
//                                     value={query}
//                                     onChange={(e) => setQuery(e.target.value)}
//                                     placeholder="Search blocks..."
//                                     className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 />
//                             </div>
//                             <button
//                                 onClick={() => { setEditing(null); setModalOpen(true); }}
//                                 className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//                             >
//                                 <Plus className="h-4 w-4" /> New Block
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {loading ? (
//                     <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-600">
//                         Loading hero blocks…
//                     </div>
//                 ) : filtered.length === 0 ? (
//                     <div className="bg-white rounded-2xl shadow p-10 text-center">
//                         <Images className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                         <h3 className="text-lg font-semibold text-gray-900 mb-1">No hero blocks yet</h3>
//                         <p className="text-gray-600 mb-6">Create your first home page hero block to get started.</p>
//                         <button
//                             onClick={() => { setEditing(null); setModalOpen(true); }}
//                             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//                         >
//                             <Plus className="h-4 w-4" /> Add Hero Block
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                         {filtered.map((b) => (
//                             <div key={String(b.id)} className="bg-white rounded-2xl shadow border overflow-hidden flex flex-col">
//                                 {b.photos?.[0] ? (
//                                     <img src={b.photos[0].url} className="w-full h-40 object-cover" alt={b.photos[0].name} />
//                                 ) : (
//                                     <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
//                                         <Images className="h-7 w-7" />
//                                     </div>
//                                 )}
//                                 <div className="p-5 flex flex-col gap-3 flex-1">
//                                     <div>
//                                         <h3 className="font-semibold text-gray-900 line-clamp-1">{b.title}</h3>
//                                         <p className="text-sm text-gray-600 line-clamp-2">{b.description}</p>
//                                     </div>

//                                     <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
//                                         <span>Updated: {fmtDate(b.updated_at)}</span>
//                                         <span>{b.photos?.length || 0} photo(s)</span>
//                                     </div>
//                                 </div>
//                                 <div className="px-5 pb-5 pt-3 flex items-center gap-2">
//                                     <button
//                                         onClick={() => { setPreviewBlock(b); setPreviewOpen(true); }}
//                                         className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
//                                     >
//                                         <Eye className="h-4 w-4" /> Preview
//                                     </button>
//                                     <button
//                                         onClick={() => { setEditing(b); setModalOpen(true); }}
//                                         className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
//                                     >
//                                         <Edit3 className="h-4 w-4" /> Edit
//                                     </button>
//                                     <button
//                                         onClick={() => requestDelete(b)}
//                                         className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
//                                     >
//                                         <Trash2 className="h-4 w-4" /> Delete
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Modals */}
//             <HeroFormModal
//                 open={modalOpen}
//                 initial={editing || undefined}
//                 onClose={() => setModalOpen(false)}
//                 onSubmit={(data) => upsertBlock(data, editing?.id)}
//             />
//             <PreviewModal open={previewOpen} block={previewBlock} onClose={() => setPreviewOpen(false)} />
//             <ConfirmModal
//                 open={confirmOpen}
//                 onClose={() => setConfirmOpen(false)}
//                 onConfirm={confirmDelete}           // ← gets id from modal
//                 itemId={toDelete?.id}               // ← pass the id to modal
//                 title="Delete this block?"
//                 body="This will permanently remove the hero block."
//             />
//         </div>
//     );
// }



import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus, Globe, Eye, Edit3, Trash2, Images, X, Search, Upload,
    Zap, CheckCircle, AlertCircle, Calendar, Image as ImageIcon,
    ChevronDown, ChevronUp, Layout, Sparkles
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
                            onSubmit({ title: title.trim(), description: description.trim(), photos });
                            onClose();
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
               <div className="sticky top-0 z-10 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: N }}>
                                <Layout className="h-5 w-5" style={{ color: O }} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold" style={{ color: N }}>Home Page Management</h1>
                                <p className="text-xs" style={{ color: MU }}>Manage hero sections and banners</p>
                            </div>
                        </div>

                       <div className="flex flex-col sm:flex-row gap-3">
    
    {/* Top Row (Mobile: only button right side) */}
    <div className="flex justify-end sm:hidden">
        <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: N }}
        >
            <Plus className="h-4 w-4" style={{ color: O }} /> New Block
        </button>
    </div>

    {/* Search */}
    <div className="relative w-full sm:w-auto order-2 sm:order-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: MU }} />
        <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks..."
            className="w-full sm:w-72 pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all focus:ring-2"
            style={{ borderColor: BD, color: N, background: "white" }}
        />
    </div>

    {/* Desktop Button (unchanged) */}
    <button
        onClick={() => { setEditing(null); setModalOpen(true); }}
        className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: N }}
    >
        <Plus className="h-4 w-4" style={{ color: O }} /> New Block
    </button>

</div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
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
                        {filtered.map((b) => (
                            <div key={String(b.id)} className="rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md" style={{ background: "white", border: `1px solid ${BD}` }}>
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
                                            onClick={() => requestDelete(b)}
                                            className="px-3 py-2 rounded-lg text-white transition-all hover:opacity-90"
                                            style={{ background: "#ef4444" }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
}