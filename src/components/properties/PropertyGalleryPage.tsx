// // PropertyGalleryPage.tsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { createPortal } from 'react-dom';

// import {
//   X,
//   ChevronLeft,
//   ChevronRight,
//   Share,
//   Bookmark,
//   Phone,
//   MessageCircle,
//   Calendar,
//   User,
//   Play,
// } from 'lucide-react';
// import { FaWhatsapp } from 'react-icons/fa';

// /* ---------- Types ---------- */
// interface RawPhoto {
//   url: string;
//   label?: string;
//   type?: 'image' | 'video';
//   isSociety?: boolean;
// }

// interface NormalizedPhoto {
//   url: string;
//   label: string;
//   type: 'image' | 'video';
// }

// interface ExecutiveInfo {
//   name?: string;
//   phone?: string;
//   email?: string;
// }

// interface PropertyGalleryPageProps {
//   photos: (string | RawPhoto)[];
//   title?: string;
//   price?: string;
//   pricePerSqft?: string;
//   initialIndex?: number;
//   liked?: boolean;
//   onToggleSave?: (e?: React.MouseEvent) => void;
//   executive?: ExecutiveInfo;
//   onClose: () => void;
//   onCall?: () => void;
//   onWhatsapp?: () => void;
//   onMessage?: () => void;
//   onSchedule?: () => void;
// }

// /* ---------- Brand tokens ---------- */
// const NAVY = '#0b3856';
// const NAVY_DARK = '#082a41';
// const ORANGE = '#E6761D';
// const ORANGE_DARK = '#CC6A1A';

// const getYouTubeEmbedUrl = (url: string): string | null => {
//   const match = url.match(
//     /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
//   );
//   return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0` : null;
// };

// /* ---------- Normalize photos ---------- */
// const normalizePhotos = (raw: (string | RawPhoto)[]): NormalizedPhoto[] => {
//   if (!Array.isArray(raw)) return [];
//   return raw
//     .map((p) => {
//       if (typeof p === 'string') {
//         return { url: p, label: 'Main Image', type: 'image' as const };
//       }
//       if (p && typeof p === 'object' && p.url) {
//         return {
//           url: p.url,
//           label: p.label && p.label.trim() ? p.label.trim() : 'Main Image',
//           type: p.type === 'video' ? ('video' as const) : ('image' as const),
//         };
//       }
//       return null;
//     })
//     .filter(Boolean) as NormalizedPhoto[];
// };

// const PropertyGalleryPage: React.FC<PropertyGalleryPageProps> = ({
//   photos,
//   title = 'Property',
//   price,
//   pricePerSqft,
//   initialIndex = 0,
//   liked = false,
//   onToggleSave,
//   executive,
//   onClose,
//   onCall,
//   onWhatsapp,
//   onMessage,
//   onSchedule,
// }) => {
//   const normalized = useMemo(() => normalizePhotos(photos), [photos]);

//   /* ---------- Build tabs from labels ---------- */
//   const tabs = useMemo(() => {
//     const labelSet = new Set<string>();
//     normalized.forEach((p) => labelSet.add(p.label));
//     const others = Array.from(labelSet).filter((l) => l !== 'Main Image');
//     const ordered = ['All', ...(labelSet.has('Main Image') ? ['Main Image'] : []), ...others.sort()];
//     return ordered;
//   }, [normalized]);

//   const [activeTab, setActiveTab] = useState<string>('All');
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showContactPopup, setShowContactPopup] = useState(false);
//   const [showThumbBar, setShowThumbBar] = useState(true);

//   /* ---------- Filtered list for active tab ---------- */
//   const filteredPhotos = useMemo(() => {
//     if (activeTab === 'All') return normalized;
//     return normalized.filter((p) => p.label === activeTab);
//   }, [normalized, activeTab]);

//   /* ---------- On mount, jump to initialIndex's tab + position ---------- */
//   useEffect(() => {
//     if (!normalized.length) return;
//     const safeIdx = Math.min(Math.max(initialIndex, 0), normalized.length - 1);
//     const target = normalized[safeIdx];
//     if (target) {
//       setActiveTab('All');
//       setCurrentIndex(safeIdx);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Clamp currentIndex whenever filtered list changes
//   useEffect(() => {
//     setCurrentIndex((prev) => {
//       if (filteredPhotos.length === 0) return 0;
//       return Math.min(prev, filteredPhotos.length - 1);
//     });
//   }, [filteredPhotos.length]);

//   const goPrev = useCallback(() => {
//     setCurrentIndex((p) => (p - 1 + filteredPhotos.length) % filteredPhotos.length);
//   }, [filteredPhotos.length]);

//   const goNext = useCallback(() => {
//     setCurrentIndex((p) => (p + 1) % filteredPhotos.length);
//   }, [filteredPhotos.length]);

//   /* ---------- Keyboard navigation ---------- */
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowLeft') goPrev();
//       if (e.key === 'ArrowRight') goNext();
//       if (e.key === 'Escape') {
//         if (showContactPopup) setShowContactPopup(false);
//         else onClose();
//       }
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [goPrev, goNext, onClose, showContactPopup]);

//   // Lock body scroll while open
//   useEffect(() => {
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, []);

//   const current = filteredPhotos[currentIndex];
//   const total = filteredPhotos.length;

//   const handleTabClick = (tab: string) => {
//     setActiveTab(tab);
//     setCurrentIndex(0);
//   };

//   const handleThumbClick = (idx: number) => {
//     setCurrentIndex(idx);
//   };

//   if (!normalized.length) {
//     return (
//       <div
//         className="fixed inset-0 z-[999] flex items-center justify-center"
//         style={{ background: NAVY }}
//       >
//         <div className="text-white text-sm">No images available</div>
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-white/80 hover:text-white"
//         >
//           <X size={22} />
//         </button>
//       </div>
//     );
//   }

// return createPortal(
//     <div
//       className="fixed inset-0 z-[9999] flex flex-col"
//       style={{ background: '#0a0a0a' }}
//       role="dialog"
//       aria-modal="true"
//     >
//       {/* ================= TOP BAR ================= */}
//       <div
//         className="flex-shrink-0 px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3"
//         style={{ background: `linear-gradient(to right, ${NAVY}, ${NAVY_DARK})` }}
//       >
//         <div className="min-w-0 flex-1">
//           <h1 className="text-white font-bold text-sm sm:text-lg truncate">{title}</h1>
//           {(price || pricePerSqft) && (
//             <div className="flex items-center gap-2 text-[11px] sm:text-sm text-white/80 mt-0.5">
//               {price && <span className="font-semibold text-white">{price}</span>}
//               {pricePerSqft && <span>· {pricePerSqft}</span>}
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
//           <button
//             className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
//             onClick={() => {
//               if (navigator.share) {
//                 navigator.share({ title, url: window.location.href }).catch(() => {});
//               }
//             }}
//           >
//             <Share size={13} />
//             Share
//           </button>

//           {onToggleSave && (
//             <button
//               onClick={onToggleSave}
//               className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
//             >
//               <Bookmark
//                 size={13}
//                 className={liked ? 'fill-[#E6761D] text-[#E6761D]' : 'text-white'}
//               />
//               <span className="hidden sm:inline">{liked ? 'Saved' : 'Save'}</span>
//             </button>
//           )}

//           {/* Counter */}
//           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
//             {total > 0 ? currentIndex + 1 : 0}/{total}
//           </div>

//           <button
//             onClick={onClose}
//             className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//             aria-label="Close gallery"
//           >
//             <X size={18} />
//           </button>
//         </div>
//       </div>

//       {/* ================= CATEGORY TABS ================= */}
//       <div
//         className="flex-shrink-0 px-3 sm:px-5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide border-b"
//         style={{ background: '#111', borderColor: 'rgba(255,255,255,0.08)' }}
//       >
//         {tabs.map((tab) => {
//           const isActive = activeTab === tab;
//           const count =
//             tab === 'All' ? normalized.length : normalized.filter((p) => p.label === tab).length;
//           return (
//             <button
//               key={tab}
//               onClick={() => handleTabClick(tab)}
//               className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all"
//               style={
//                 isActive
//                   ? { background: ORANGE, color: 'white' }
//                   : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }
//               }
//             >
//               {tab}
//               <span
//                 className="ml-1.5 text-[9px] sm:text-[10px] px-1 py-[1px] rounded-full"
//                 style={{
//                   background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
//                 }}
//               >
//                 {count}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* ================= MAIN VIEWER ================= */}
//       <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black min-h-0">
//         {current && (
//           <div className="relative w-full h-full flex items-center justify-center">
//             {current.type === 'video' ? (
//               getYouTubeEmbedUrl(current.url) ? (
//                 <iframe
//                   key={current.url}
//                   src={getYouTubeEmbedUrl(current.url)!}
//                   className="w-full h-full max-w-5xl max-h-[75vh] mx-auto"
//                   frameBorder="0"
//                   allow="autoplay; encrypted-media; fullscreen"
//                   allowFullScreen
//                 />
//               ) : (
//                 <video
//                   key={current.url}
//                   src={current.url}
//                   className="max-w-full max-h-full object-contain"
//                   controls
//                   autoPlay
//                 />
//               )
//             ) : (
//               <img
//                 key={current.url}
//                 src={current.url}
//                 alt={current.label}
//                 className="max-w-full max-h-full object-contain select-none"
//                 draggable={false}
//               />
//             )}

//             {/* Watermark */}
//             <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
//               <span className="text-white/10 font-bold text-3xl sm:text-5xl whitespace-nowrap rotate-[-15deg]">
//                 ResaleExpert.in
//               </span>
//             </div>

//             {/* Bottom-left label chip */}
// {current.label && (
//               <div
//                 className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3 py-1 rounded-full text-white text-[10px] sm:text-xs font-semibold backdrop-blur-md"
//                 style={{ background: 'rgba(0,0,0,0.55)' }}
//               >
//                 {current.label}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Prev / Next Arrows */}
//         {total > 1 && (
//           <>
//             <button
//               onClick={goPrev}
//               className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
//               style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
//               aria-label="Previous"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button
//               onClick={goNext}
//               className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
//               style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
//               aria-label="Next"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </>
//         )}

//         {/* Mobile counter */}
//         <div
//           className="md:hidden absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-[10px] font-semibold"
//           style={{ background: 'rgba(0,0,0,0.55)' }}
//         >
//           {total > 0 ? currentIndex + 1 : 0}/{total}
//         </div>

//         {/* Contact Executive floating button (mobile) */}
//         <button
//           onClick={() => setShowContactPopup(true)}
//           className="lg:hidden absolute bottom-4 right-4 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-white text-xs font-bold shadow-lg"
//           style={{ background: ORANGE }}
//         >
//           <User size={13} />
//           Contact
//         </button>
//       </div>

//       {/* ================= THUMBNAIL STRIP ================= */}
//       {showThumbBar && total > 1 && (
//         <div
//           className="flex-shrink-0 px-3 sm:px-5 py-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide"
//           style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.08)' }}
//         >
//           {filteredPhotos.map((p, idx) => (
//             <button
//               key={`${p.url}-${idx}`}
//               onClick={() => handleThumbClick(idx)}
//               className="relative flex-shrink-0 w-14 h-10 sm:w-20 sm:h-14 rounded-md overflow-hidden transition-all"
//               style={{
//                 outline: idx === currentIndex ? `2px solid ${ORANGE}` : '2px solid transparent',
//                 outlineOffset: '1px',
//                 opacity: idx === currentIndex ? 1 : 0.55,
//               }}
//             >
//               {p.type === 'video' ? (
//                 <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
//                   {getYouTubeEmbedUrl(p.url) ? (
//                     <img
//                       src={`https://img.youtube.com/vi/${
//                         p.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
//                       }/hqdefault.jpg`}
//                       alt=""
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <video src={p.url} className="w-full h-full object-cover" muted />
//                   )}
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <Play size={12} className="text-white fill-white" />
//                   </div>
//                 </div>
//               ) : (
//                 <img src={p.url} alt="" className="w-full h-full object-cover" draggable={false} />
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* ================= DESKTOP SIDE CONTACT BAR ================= */}
//       <div className="hidden lg:flex absolute right-5 top-5 flex-col gap-2">
//        <button
//           onClick={() => setShowContactPopup(true)}
//           className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-white shadow-xl transition-transform hover:scale-105"
//           style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})` }}
//         >
//           <User size={18} />
//           <span className="text-[10px] font-bold whitespace-nowrap">Contact Executive</span>
//         </button>
//       </div>

//       {/* ================= CONTACT POPUP ================= */}
//       {showContactPopup && (
//         <div
//           className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
//           onClick={() => setShowContactPopup(false)}
//         >
//           <div
//             className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 shadow-2xl animate-fade-in-up"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center gap-2.5">
//                 <div
//                   className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
//                   style={{ background: `${NAVY}15` }}
//                 >
//                   <User size={16} style={{ color: NAVY }} />
//                 </div>
//                 <div>
//                   <p className="font-bold text-sm" style={{ color: NAVY }}>
//                     {executive?.name || 'Property Executive'}
//                   </p>
//                   <p className="text-[11px] text-gray-400">We're here to help</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowContactPopup(false)}
//                 className="text-gray-400 hover:text-gray-700 transition-colors"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="grid grid-cols-2 gap-2.5">
//               <button
//                 onClick={() => {
//                   onCall?.();
//                   setShowContactPopup(false);
//                 }}
//                 className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
//               >
//                 <Phone size={18} className="text-blue-600" />
//                 <span className="text-xs font-semibold text-gray-700">Call</span>
//               </button>

//               <button
//                 onClick={() => {
//                   onWhatsapp?.();
//                   setShowContactPopup(false);
//                 }}
//                 className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
//               >
//                 <FaWhatsapp size={18} className="text-[#16a34a]" />
//                 <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
//               </button>

//               <button
//                 onClick={() => {
//                   onMessage?.();
//                   setShowContactPopup(false);
//                 }}
//                 className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors"
//               >
//                 <MessageCircle size={18} className="text-purple-600" />
//                 <span className="text-xs font-semibold text-gray-700">Message</span>
//               </button>

//               <button
//                 onClick={() => {
//                   onSchedule?.();
//                   setShowContactPopup(false);
//                 }}
//                 className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-cyan-50 border border-cyan-100 hover:bg-cyan-100 transition-colors"
//               >
//                 <Calendar size={18} className="text-cyan-600" />
//                 <span className="text-xs font-semibold text-gray-700">Schedule</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         .scrollbar-hide::-webkit-scrollbar { display: none; }
//         .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
//         @keyframes fade-in-up {
//           from { opacity: 0; transform: translateY(16px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
//      `}</style>
//     </div>,
//     document.body
//   );
// };

// export default PropertyGalleryPage;



// PropertyGalleryPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ShareModal from '../../pages/public/ShareModal'; // ⚠️ path adjust karo agar alag ho

import {
  X,
  ChevronLeft,
  ChevronRight,
  Share,
  Bookmark,
  Phone,
  MessageCircle,
  Calendar,
  User,
  Play,
  Share2,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

/* ---------- Types ---------- */
interface RawPhoto {
  url: string;
  label?: string;
  type?: 'image' | 'video';
  isSociety?: boolean;
}

interface NormalizedPhoto {
  url: string;
  label: string;
  type: 'image' | 'video';
}

interface ExecutiveInfo {
  name?: string;
  phone?: string;
  email?: string;
}

interface PropertyGalleryPageProps {
  photos: (string | RawPhoto)[];
  title?: string;
  price?: string;
  pricePerSqft?: string;
  initialIndex?: number;
  liked?: boolean;
  onToggleSave?: (e?: React.MouseEvent) => void;
  executive?: ExecutiveInfo;
  onClose: () => void;
  onCall?: () => void;
  onWhatsapp?: () => void;
  onMessage?: () => void;
  onSchedule?: () => void;
  // ✅ NEW: for ShareModal
  propertyId?: number | string;
  slug?: string;
  description?: string;
}

/* ---------- Brand tokens ---------- */
const NAVY = '#0b3856';
const NAVY_DARK = '#082a41';
const ORANGE = '#E6761D';
const ORANGE_DARK = '#CC6A1A';

const getYouTubeEmbedUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0` : null;
};

/* ---------- Normalize photos ---------- */
const normalizePhotos = (raw: (string | RawPhoto)[]): NormalizedPhoto[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      if (typeof p === 'string') {
        return { url: p, label: 'Main Image', type: 'image' as const };
      }
      if (p && typeof p === 'object' && p.url) {
        return {
          url: p.url,
          label: p.label && p.label.trim() ? p.label.trim() : 'Main Image',
          type: p.type === 'video' ? ('video' as const) : ('image' as const),
        };
      }
      return null;
    })
    .filter(Boolean) as NormalizedPhoto[];
};

const PropertyGalleryPage: React.FC<PropertyGalleryPageProps> = ({
  photos,
  title = 'Property',
  price,
  pricePerSqft,
  initialIndex = 0,
  liked = false,
  onToggleSave,
  executive,
  onClose,
  onCall,
  onWhatsapp,
  onMessage,
  onSchedule,
  propertyId,
  slug,
  description,
}) => {
  const normalized = useMemo(() => normalizePhotos(photos), [photos]);

  /* ---------- Build tabs from labels ---------- */
  const tabs = useMemo(() => {
    const labelSet = new Set<string>();
    normalized.forEach((p) => labelSet.add(p.label));
    const others = Array.from(labelSet).filter((l) => l !== 'Main Image');
    const ordered = ['All', ...(labelSet.has('Main Image') ? ['Main Image'] : []), ...others.sort()];
    return ordered;
  }, [normalized]);

  const [activeTab, setActiveTab] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showThumbBar, setShowThumbBar] = useState(true);
  // ✅ NEW: share modal state
  const [showShareModal, setShowShareModal] = useState(false);

  /* ---------- Filtered list for active tab ---------- */
  const filteredPhotos = useMemo(() => {
    if (activeTab === 'All') return normalized;
    return normalized.filter((p) => p.label === activeTab);
  }, [normalized, activeTab]);

  /* ---------- On mount, jump to initialIndex's tab + position ---------- */
  useEffect(() => {
    if (!normalized.length) return;
    const safeIdx = Math.min(Math.max(initialIndex, 0), normalized.length - 1);
    const target = normalized[safeIdx];
    if (target) {
      setActiveTab('All');
      setCurrentIndex(safeIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clamp currentIndex whenever filtered list changes
  useEffect(() => {
    setCurrentIndex((prev) => {
      if (filteredPhotos.length === 0) return 0;
      return Math.min(prev, filteredPhotos.length - 1);
    });
  }, [filteredPhotos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((p) => (p - 1 + filteredPhotos.length) % filteredPhotos.length);
  }, [filteredPhotos.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((p) => (p + 1) % filteredPhotos.length);
  }, [filteredPhotos.length]);

  /* ---------- Keyboard navigation ---------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') {
        if (showShareModal) setShowShareModal(false);
        else if (showContactPopup) setShowContactPopup(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext, onClose, showContactPopup, showShareModal]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const current = filteredPhotos[currentIndex];
  const total = filteredPhotos.length;

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  const handleThumbClick = (idx: number) => {
    setCurrentIndex(idx);
  };
if (!normalized.length) {
    return (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center"
        style={{ background: NAVY }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white text-sm">No images available</div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          <X size={22} />
        </button>
      </div>
    );
  }

 return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: '#0a0a0a' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ================= TOP BAR ================= */}
      <div
        className="flex-shrink-0 px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3"
        style={{ background: `linear-gradient(to right, ${NAVY}, ${NAVY_DARK})` }}
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-white font-bold text-sm sm:text-lg truncate">{title}</h1>
          {(price || pricePerSqft) && (
            <div className="flex items-center gap-2 text-[11px] sm:text-sm text-white/80 mt-0.5">
              {price && <span className="font-semibold text-white">{price}</span>}
              {pricePerSqft && <span>· {pricePerSqft}</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Share */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Save */}
          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Bookmark
                size={13}
                className={liked ? 'fill-[#E6761D] text-[#E6761D]' : 'text-white'}
              />
              <span className="hidden sm:inline">{liked ? 'Saved' : 'Save'}</span>
            </button>
          )}

          {/* Contact Executive — now inline with Share/Save */}
          <button
            onClick={() => setShowContactPopup(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            <User size={13} />
            <span className="hidden sm:inline">Contact Executive</span>
          </button>

          {/* Counter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
            {total > 0 ? currentIndex + 1 : 0}/{total}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close gallery"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ================= CATEGORY TABS ================= */}
      <div
        className="flex-shrink-0 px-3 sm:px-5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide border-b"
        style={{ background: '#111', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === 'All' ? normalized.length : normalized.filter((p) => p.label === tab).length;
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all"
              style={
                isActive
                  ? { background: ORANGE, color: 'white' }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }
              }
            >
              {tab}
              <span
                className="ml-1.5 text-[9px] sm:text-[10px] px-1 py-[1px] rounded-full"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= MAIN VIEWER ================= */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black min-h-0">
        {current && (
          <div className="relative w-full h-full flex items-center justify-center">
            {current.type === 'video' ? (
              getYouTubeEmbedUrl(current.url) ? (
                <iframe
                  key={current.url}
                  src={getYouTubeEmbedUrl(current.url)!}
                  className="w-full h-full max-w-5xl max-h-[75vh] mx-auto"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  key={current.url}
                  src={current.url}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                />
              )
            ) : (
              <img
                key={current.url}
                src={current.url}
                alt={current.label}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
              />
            )}

            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
              <span className="text-white/10 font-bold text-3xl sm:text-5xl whitespace-nowrap rotate-[-15deg]">
                ResaleExpert.in
              </span>
            </div>

            {/* Bottom-left label chip */}
            {current.label && (
              <div
                className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3 py-1 rounded-full text-white text-[10px] sm:text-xs font-semibold backdrop-blur-md"
                style={{ background: 'rgba(0,0,0,0.55)' }}
              >
                {current.label}
              </div>
            )}
          </div>
        )}

        {/* Prev / Next Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Mobile counter */}
        <div
          className="md:hidden absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-[10px] font-semibold"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          {total > 0 ? currentIndex + 1 : 0}/{total}
        </div>
      </div>

      {/* ================= THUMBNAIL STRIP ================= */}
      {showThumbBar && total > 1 && (
        <div
          className="flex-shrink-0 px-3 sm:px-5 py-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide"
          style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {filteredPhotos.map((p, idx) => (
            <button
              key={`${p.url}-${idx}`}
              onClick={() => handleThumbClick(idx)}
              className="relative flex-shrink-0 w-14 h-10 sm:w-20 sm:h-14 rounded-md overflow-hidden transition-all"
              style={{
                outline: idx === currentIndex ? `2px solid ${ORANGE}` : '2px solid transparent',
                outlineOffset: '1px',
                opacity: idx === currentIndex ? 1 : 0.55,
              }}
            >
              {p.type === 'video' ? (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                  {getYouTubeEmbedUrl(p.url) ? (
                    <img
                      src={`https://img.youtube.com/vi/${
                        p.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]
                      }/hqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video src={p.url} className="w-full h-full object-cover" muted />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={12} className="text-white fill-white" />
                  </div>
                </div>
              ) : (
                <img src={p.url} alt="" className="w-full h-full object-cover" draggable={false} />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ================= CONTACT POPUP ================= */}
      {showContactPopup && (
        <div
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setShowContactPopup(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${NAVY}15` }}
                >
                  <User size={16} style={{ color: NAVY }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: NAVY }}>
                    {executive?.name || 'Property Executive'}
                  </p>
                  <p className="text-[11px] text-gray-400">We're here to help</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactPopup(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onCall?.();
                  setShowContactPopup(false);
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <Phone size={18} className="text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Call</span>
              </button>

              <button
                onClick={() => {
                  onWhatsapp?.();
                  setShowContactPopup(false);
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
              >
                <FaWhatsapp size={18} className="text-[#16a34a]" />
                <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  onMessage?.();
                  setShowContactPopup(false);
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                <MessageCircle size={18} className="text-purple-600" />
                <span className="text-xs font-semibold text-gray-700">Message</span>
              </button>

              <button
                onClick={() => {
                  onSchedule?.();
                  setShowContactPopup(false);
                }}
                className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-cyan-50 border border-cyan-100 hover:bg-cyan-100 transition-colors"
              >
                <Calendar size={18} className="text-cyan-600" />
                <span className="text-xs font-semibold text-gray-700">Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SHARE MODAL ================= */}
      {showShareModal && (
        <ShareModal
          url={typeof window !== 'undefined' ? window.location.href : ''}
          title={title}
          description={description || ''}
          image={current?.url || normalized[0]?.url || ''}
          propertyId={propertyId}
          slug={slug}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
      `}</style>
    </div>,
    document.body
  );
};

export default PropertyGalleryPage;