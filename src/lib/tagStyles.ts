// src/lib/tagStyles.ts
import { CheckCircle, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TagTone = {
  bg: string;
  text: string;
  ring: string;
  emoji?: string | LucideIcon; // string emoji or a Lucide icon component
};

/** Lowercase keys please */
export const DEFAULT_TAG_STYLE: Record<string, TagTone> = {
  "new listing": {
    bg: "bg-emerald-600/90",
    text: "text-white",
    ring: "ring-white/20",
    emoji: "🆕",
  },
  "hot deal": {
    bg: "bg-rose-600/90",
    text: "text-white",
    ring: "ring-white/20",
    emoji: "🔥",
  },
  verified: {
    bg: "bg-gradient-to-r from-green-500 to-emerald-600 backdrop-blur-sm",
    text: "text-white font-bold",
    ring: "ring-green-400/50",
    emoji: CheckCircle,
  },
  "urgent sale": {
    bg: "bg-amber-600/90",
    text: "text-white",
    ring: "ring-white/20",
    emoji: "⏳  ",
  },
  exclusive: {
    bg: "bg-purple-600/90",
    text: "text-white",
    ring: "ring-white/20",
    emoji: "🔒",
  },
  "direct owner": {
    bg: "bg-teal-600/90",
    text: "text-white",
    ring: "ring-white/20",
    emoji: "👤",
  },
  /** ✅ updated featured style to match your hardcoded classes */
  featured: {
    bg: "bg-gradient-to-r from-orange-500 to-red-500",
    text: "text-white font-bold",
    ring: "ring-white/20",
    emoji: Zap,
  },
  "recently updated": {
    bg: "bg-cyan-600/90",
    text: "text-white",
    ring: "ring-white/20",
    emoji: "🕒",
  },
  "best price": {
    bg: "bg-yellow-600/90",
    text: "text-white",
    ring: "ring-white/20",
    emoji: "🏷️",
  },
  premium: {
    bg: "bg-amber-500/95",
    text: "text-white font-semibold",
    ring: "ring-amber-200/50",
    emoji: "💎",
  },
};

/** Fallback tone */
export const FALLBACK_TAG_TONE: TagTone = {
  bg: "bg-black/60",
  text: "text-white",
  ring: "ring-white/10",
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
