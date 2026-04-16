// // src/lib/tagStyles.ts
// import { CheckCircle, Zap } from "lucide-react";
// import type { LucideIcon } from "lucide-react";

// export type TagTone = {
//   bg: string;
//   text: string;
//   ring: string;
//   emoji?: string | LucideIcon; // string emoji or a Lucide icon component
// };

// /** Lowercase keys please */
// export const DEFAULT_TAG_STYLE: Record<string, TagTone> = {
//   "new listing": {
//     bg: "bg-emerald-600/90",
//     text: "text-white",
//     ring: "ring-white/20",
//     emoji: "🆕",
//   },
//   "hot deal": {
//     bg: "bg-rose-600/90",
//     text: "text-white",
//     ring: "ring-white/20",
//     emoji: "🔥",
//   },
//   verified: {
//     bg: "bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm",
//     text: "text-white font-bold",
//     ring: "ring-green-400/50",
//     emoji: CheckCircle,
//   },
//   "urgent sale": {
//     bg: "bg-amber-600/90",
//     text: "text-white",
//     ring: "ring-white/20",
//     emoji: "⏳  ",
//   },
//   exclusive: {
//     bg: "bg-purple-600/90",
//     text: "text-white",
//     ring: "ring-white/20",
//     emoji: "🔒",
//   },
//   "direct owner": {
//     bg: "bg-teal-600/90",
//     text: "text-white",
//     ring: "ring-white/20",
//     emoji: "👤",
//   },
//   /** ✅ updated featured style to match your hardcoded classes */
//   featured: {
//     bg: "bg-gradient-to-r from-orange-500 to-red-500",
//     text: "text-white font-bold",
//     ring: "ring-white/20",
//     emoji: Zap,
//   },
//   "recently updated": {
//     bg: "bg-cyan-600/90",
//     text: "text-white",
//     ring: "ring-white/20",
//     emoji: "🕒",
//   },
//   "best price": {
//     bg: "bg-yellow-600/90",
//     text: "text-white",
//     ring: "ring-white/20",
//     emoji: "🏷️",
//   },
//   premium: {
//     bg: "bg-amber-500/95",
//     text: "text-white font-semibold",
//     ring: "ring-amber-200/50",
//     emoji: "💎",
//   },
//   "sold out": {
//   bg: "bg-neutral-500/80",
//   text: "text-white font-semibold",
//   ring: "ring-white/10",
//   emoji: "🛑",
// },
// /** ⭐ NEW: On Hold tag */
// "on hold": {
//   bg: "bg-amber-500/90",
//   text: "text-white font-semibold",
//   ring: "ring-white/20",
//   emoji: "⏸️",
// },

// /** ⭐ NEW: Available tag */
// "available": {
//   bg: "bg-green-600/90",
//   text: "text-white font-semibold",
//   ring: "ring-white/20",
//   emoji: "✅",
// },
// };

// /** Fallback tone */
// export const FALLBACK_TAG_TONE: TagTone = {
//   bg: "bg-black/60",
//   text: "text-white",
//   ring: "ring-white/10",
// };

// /** Normalize a tag string safely */
// export const normalizeTag = (s: string | undefined | null) => String(s ?? "").trim();

// /** Resolve tone for a tag label with optional custom overrides */
// export function getTagStyle(
//   label: string,
//   customMap?: Record<string, TagTone>
// ): TagTone {
//   const key = normalizeTag(label).toLowerCase();
//   const map = customMap ? { ...DEFAULT_TAG_STYLE, ...lowercaseKeys(customMap) } : DEFAULT_TAG_STYLE;
//   return map[key] ?? FALLBACK_TAG_TONE;
// }

// /** Merge multiple maps; later maps override earlier */
// export function mergeTagStyles(
//   ...maps: Array<Record<string, TagTone> | undefined>
// ): Record<string, TagTone> {
//   const out: Record<string, TagTone> = { ...DEFAULT_TAG_STYLE };
//   for (const m of maps) {
//     if (!m) continue;
//     Object.entries(m).forEach(([k, v]) => {
//       out[k.toLowerCase()] = v;
//     });
//   }
//   return out;
// }

// function lowercaseKeys(m: Record<string, TagTone>) {
//   const out: Record<string, TagTone> = {};
//   Object.entries(m).forEach(([k, v]) => (out[k.toLowerCase()] = v));
//   return out;
// }

// /** Also export as default so either import style works */
// export default getTagStyle;


// src/lib/tagStyles.ts
import { CheckCircle, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TagTone = {
  bg: string;
  text: string;
  ring: string;
  emoji?: string | LucideIcon;
};

/** Lowercase keys please */
export const DEFAULT_TAG_STYLE: Record<string, TagTone> = {
  "new listing": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    emoji: "🆕",
  },
  "hot deal": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    emoji: "🔥",
  },
  verified: {
    bg: "bg-green-50",
    text: "text-green-700 font-bold",
    ring: "ring-green-200",
    emoji: CheckCircle,
  },
  "urgent sale": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    emoji: "⏳",
  },
  exclusive: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
    emoji: "🔒",
  },
  "direct owner": {
    bg: "bg-teal-50",
    text: "text-teal-700",
    ring: "ring-teal-200",
    emoji: "👤",
  },
  featured: {
    bg: "bg-orange-50",
    text: "text-orange-700 font-bold",
    ring: "ring-orange-200",
    emoji: Zap,
  },
  "recently updated": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    ring: "ring-cyan-200",
    emoji: "🕒",
  },
  "best price": {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-200",
    emoji: "🏷️",
  },
  premium: {
    bg: "bg-amber-50",
    text: "text-amber-700 font-semibold",
    ring: "ring-amber-200",
    emoji: "💎",
  },
  "sold out": {
    bg: "bg-neutral-100",
    text: "text-neutral-600 font-semibold",
    ring: "ring-neutral-200",
    emoji: "🛑",
  },
  "on hold": {
    bg: "bg-amber-50",
    text: "text-amber-700 font-semibold",
    ring: "ring-amber-200",
    emoji: "⏸️",
  },
  available: {
    bg: "bg-green-50",
    text: "text-green-700 font-semibold",
    ring: "ring-green-200",
    emoji: "✅",
  },
};

/** Fallback tone */
export const FALLBACK_TAG_TONE: TagTone = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  ring: "ring-gray-200",
  emoji: "🏷️",
};

/** Normalize a tag string safely */
export const normalizeTag = (s: string | undefined | null) => String(s ?? "").trim();

/** Resolve tone for a tag label with optional custom overrides */
export function getTagStyle(
  label: string,
  customMap?: Record<string, TagTone>
): TagTone {
  const key = normalizeTag(label).toLowerCase();
  const map = customMap ? { ...DEFAULT_TAG_STYLE, ...lowercaseKeys(customMap) } : DEFAULT_TAG_STYLE;
  return map[key] ?? FALLBACK_TAG_TONE;
}

/** Merge multiple maps; later maps override earlier */
export function mergeTagStyles(
  ...maps: Array<Record<string, TagTone> | undefined>
): Record<string, TagTone> {
  const out: Record<string, TagTone> = { ...DEFAULT_TAG_STYLE };
  for (const m of maps) {
    if (!m) continue;
    Object.entries(m).forEach(([k, v]) => {
      out[k.toLowerCase()] = v;
    });
  }
  return out;
}

function lowercaseKeys(m: Record<string, TagTone>) {
  const out: Record<string, TagTone> = {};
  Object.entries(m).forEach(([k, v]) => (out[k.toLowerCase()] = v));
  return out;
}

/** Also export as default so either import style works */
export default getTagStyle;