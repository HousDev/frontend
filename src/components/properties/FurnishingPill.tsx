// components/FurnishingPill.tsx
import React from "react";
import type { LucideProps } from "lucide-react";
import {
  // furniture
  Sofa, Armchair, Bed, Shirt, Table, Tv, BookOpen, Paintbrush,
  Square, Circle, TreePine, Flower,
  // kitchen + appliances
  UtensilsCrossed, AirVent, Droplets, Refrigerator, Microwave,
  WashingMachine, Thermometer,
  // utilities + electronics
  Fan, Zap, Wind, Lightbulb, Wifi,
  // misc
  Lock, HelpCircle,
} from "lucide-react";

/** CSV-aligned slugs */
export type FurnishingSlug =
  | "sofa" | "recliner" | "center-table" | "side-table" | "dining-set" | "tv-unit"
  | "bed-king" | "bed-queen" | "mattress" | "bedside-table" | "wardrobe"
  | "dressing-table" | "study-table" | "study-chair" | "bookshelf" | "shoe-rack"
  | "pooja-unit" | "curtains" | "carpet" | "wall-art" | "indoor-plant" | "mirror"
  | "balcony-set"
  | "modular-kitchen" | "chimney" | "gas-stove" | "ro-purifier" | "refrigerator"
  | "microwave" | "utensils-crockery" | "mixer-grinder"
  | "washing-machine" | "ac" | "ceiling-fan" | "air-cooler" | "geyser"
  | "inverter-ups" | "stabilizer" | "wifi-router" | "tv" | "soundbar"
  | "lighting" | "tube-light"
  | "iron-board" | "vacuum-cleaner" | "locker-safe" | "key-holder" | "clock"
  | "outdoor-planter" | "bbq-grill"
  | "other";

type Meta = {
  label: string;
  Icon: React.ComponentType<Partial<LucideProps>>;
  bg: string;
  fg: string;
};

/** ===== CSV mirror: Value/slug/Icon/bg/fg (from Furnishing_Items_Master.csv) ===== */
const META: Record<FurnishingSlug, Meta> = {
  "sofa": { label: "Sofa", Icon: Sofa, bg: "bg-amber-50", fg: "text-amber-700" },
  "recliner": { label: "Recliner", Icon: Armchair, bg: "bg-indigo-50", fg: "text-indigo-700" },
  "center-table": { label: "Center Table", Icon: Table, bg: "bg-orange-50", fg: "text-orange-700" },
  "side-table": { label: "Side Table", Icon: Table, bg: "bg-orange-50", fg: "text-orange-700" },
  "dining-set": { label: "Dining Set", Icon: Table, bg: "bg-lime-50", fg: "text-lime-700" },
  "tv-unit": { label: "TV Unit", Icon: Tv, bg: "bg-purple-50", fg: "text-purple-700" },
  "bed-king": { label: "King Bed", Icon: Bed, bg: "bg-violet-50", fg: "text-violet-700" },
  "bed-queen": { label: "Queen Bed", Icon: Bed, bg: "bg-violet-50", fg: "text-violet-700" },
  "mattress": { label: "Mattress", Icon: Bed, bg: "bg-slate-50", fg: "text-slate-700" },
  "bedside-table": { label: "Bedside Table", Icon: Table, bg: "bg-slate-50", fg: "text-slate-700" },
  "wardrobe": { label: "Wardrobe (Almirah)", Icon: Shirt, bg: "bg-emerald-50", fg: "text-emerald-700" },
  "dressing-table": { label: "Dressing Table", Icon: Circle, bg: "bg-zinc-50", fg: "text-zinc-700" },
  "study-table": { label: "Study Table", Icon: Table, bg: "bg-blue-50", fg: "text-blue-700" },
  "study-chair": { label: "Study Chair", Icon: Armchair, bg: "bg-blue-50", fg: "text-blue-700" },
  "bookshelf": { label: "Bookshelf", Icon: BookOpen, bg: "bg-amber-50", fg: "text-amber-700" },
  "shoe-rack": { label: "Shoe Rack", Icon: Square, bg: "bg-rose-50", fg: "text-rose-700" },
  "pooja-unit": { label: "Pooja Mandir", Icon: Flower, bg: "bg-lime-50", fg: "text-lime-700" },
  "curtains": { label: "Curtains", Icon: Square, bg: "bg-fuchsia-50", fg: "text-fuchsia-700" },
  "carpet": { label: "Carpet / Rug", Icon: Square, bg: "bg-rose-50", fg: "text-rose-700" },
  "wall-art": { label: "Wall Art / Frames", Icon: Paintbrush, bg: "bg-pink-50", fg: "text-pink-700" },
  "indoor-plant": { label: "Indoor Plant", Icon: Flower, bg: "bg-emerald-50", fg: "text-emerald-700" },
  "mirror": { label: "Mirror", Icon: Circle, bg: "bg-zinc-50", fg: "text-zinc-700" },
  "balcony-set": { label: "Balcony Chairs/Table", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },

  "modular-kitchen": { label: "Modular Kitchen", Icon: UtensilsCrossed, bg: "bg-lime-50", fg: "text-lime-700" },
  "chimney": { label: "Chimney", Icon: AirVent, bg: "bg-slate-50", fg: "text-slate-700" },
  "gas-stove": { label: "Gas Stove / Hob", Icon: UtensilsCrossed, bg: "bg-orange-50", fg: "text-orange-700" },
  "ro-purifier": { label: "RO Purifier", Icon: Droplets, bg: "bg-sky-50", fg: "text-sky-700" },
  "refrigerator": { label: "Refrigerator", Icon: Refrigerator, bg: "bg-teal-50", fg: "text-teal-700" },
  "microwave": { label: "Microwave/OTG", Icon: Microwave, bg: "bg-rose-50", fg: "text-rose-700" },
  "utensils-crockery": { label: "Utensils & Crockery", Icon: UtensilsCrossed, bg: "bg-zinc-50", fg: "text-zinc-700" },
  "mixer-grinder": { label: "Mixer Grinder", Icon: UtensilsCrossed, bg: "bg-zinc-50", fg: "text-zinc-700" },

  "washing-machine": { label: "Washing Machine", Icon: WashingMachine, bg: "bg-cyan-50", fg: "text-cyan-700" },
  "ac": { label: "Split/Window AC", Icon: AirVent, bg: "bg-cyan-50", fg: "text-cyan-700" },
  "ceiling-fan": { label: "Ceiling Fan", Icon: Fan, bg: "bg-slate-50", fg: "text-slate-700" },
  "air-cooler": { label: "Air Cooler", Icon: Wind, bg: "bg-teal-50", fg: "text-teal-700" },
  "geyser": { label: "Geyser", Icon: Thermometer, bg: "bg-rose-50", fg: "text-rose-700" },
  "inverter-ups": { label: "Inverter / UPS", Icon: Zap, bg: "bg-yellow-50", fg: "text-yellow-700" },
  "stabilizer": { label: "Stabilizer", Icon: Zap, bg: "bg-yellow-50", fg: "text-yellow-700" },

  // CSV-aligned change: Wifi icon (not Droplets)
  "wifi-router": { label: "Wi-Fi Router", Icon: Wifi, bg: "bg-indigo-50", fg: "text-indigo-700" },
  "tv": { label: "Television", Icon: Tv, bg: "bg-purple-50", fg: "text-purple-700" },
  "soundbar": { label: "Soundbar / HT", Icon: Tv, bg: "bg-violet-50", fg: "text-violet-700" },

  "lighting": { label: "Lights / Lamps", Icon: Lightbulb, bg: "bg-amber-50", fg: "text-amber-700" },
  "tube-light": { label: "Tube Light", Icon: Lightbulb, bg: "bg-zinc-50", fg: "text-zinc-700" },

  "iron-board": { label: "Iron + Board", Icon: Square, bg: "bg-blue-50", fg: "text-blue-700" },
  "vacuum-cleaner": { label: "Vacuum Cleaner", Icon: Wind, bg: "bg-slate-50", fg: "text-slate-700" },
  "locker-safe": { label: "Safe / Locker", Icon: Lock, bg: "bg-slate-50", fg: "text-slate-700" },
  "key-holder": { label: "Key Holder", Icon: Square, bg: "bg-slate-50", fg: "text-slate-700" },
  "clock": { label: "Wall Clock", Icon: Circle, bg: "bg-zinc-50", fg: "text-zinc-700" },
  "outdoor-planter": { label: "Outdoor Planter", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
  "bbq-grill": { label: "BBQ Grill", Icon: UtensilsCrossed, bg: "bg-orange-50", fg: "text-orange-700" },

  "other": { label: "Other", Icon: HelpCircle, bg: "bg-gray-50", fg: "text-gray-700" },
};

/** free-text → CSV slug resolver */
const RULES: Array<[RegExp, FurnishingSlug]> = [
  // furniture
  [/(^|\b)(sofa|couch|diwan|divan|sectional|loveseat)(\b|$)/i, "sofa"],
  [/(recliner|loung(e)? chair)/i, "recliner"],
  [/(center|coffee)\s*table/i, "center-table"],
  [/(side|end)\s*table/i, "side-table"],
  [/(dining)\s*(table|set|chair)/i, "dining-set"],
  [/tv\s*(unit|console|cabinet)/i, "tv-unit"],
  [/(king)\s*bed/i, "bed-king"],
  [/(queen)\s*bed/i, "bed-queen"],
  [/\bmattress\b|coir|spring|foam/i, "mattress"],
  [/(bedside|night)\s*table/i, "bedside-table"],
  [/(wardrobe|almirah|almera|closet|cupboard)/i, "wardrobe"],
  [/dressing\s*(table)?|dresser/i, "dressing-table"],
  [/(study|office)\s*(table|desk)/i, "study-table"],
  [/(study|office)\s*chair/i, "study-chair"],
  [/(book\s*shelf|bookcase|library)/i, "bookshelf"],
  [/(shoe\s*(rack|cabinet))/i, "shoe-rack"],
  [/(pooja|puja|mandir|temple)/i, "pooja-unit"],
  [/(curtain|curtains|drape|blind)/i, "curtains"],
  [/(carpet|rug|mat)/i, "carpet"],
  [/(wall\s*(art|frame|painting|photo))/i, "wall-art"],
  [/(indoor\s*plant|planter)/i, "indoor-plant"],
  [/(mirror|looking\s*glass)/i, "mirror"],
  [/(balcony).*(chair|table|set)|patio/i, "balcony-set"],

  // kitchen + appliances
  [/(modular\s*kitchen|kitchen\s*cabinet|pantry)/i, "modular-kitchen"],
  [/(chimney|hood|exhaust)/i, "chimney"],
  [/(gas\s*(stove|hob)|cooktop|burner|chulha)/i, "gas-stove"],
  [/(ro|r\.o\.|water\s*purifier|aquaguard|kent)/i, "ro-purifier"],
  [/(fridge|refrigerator|freezer)/i, "refrigerator"],
  [/(microwave|otg|toaster|convection|oven)/i, "microwave"],
  [/(utensil|crockery|cutlery|plates?|bowls?|spoons?|forks?)/i, "utensils-crockery"],
  [/(mixer|grinder|blender)/i, "mixer-grinder"],

  // utilities + electronics
  [/(washing\s*machine|washer)/i, "washing-machine"],
  [/(a\.?\s?c\.?|air\s?cond|split\s?ac|window\s?ac)/i, "ac"],
  [/(ceiling\s*fan|fan\b)/i, "ceiling-fan"],
  [/(air\s*cooler|desert\s*cooler)/i, "air-cooler"],
  [/(geyser|water\s*heater)/i, "geyser"],
  [/(inverter|ups|power\s*backup)/i, "inverter-ups"],
  [/(stabilizer)/i, "stabilizer"],
  [/(wi[- ]?fi|router|broadband|internet)/i, "wifi-router"],
  [/(^tv$|television|smart\s*tv)/i, "tv"],
  [/(soundbar|home\s*theatre|home\s*theater)/i, "soundbar"],
  [/(light|lamp|chandelier|pendant)/i, "lighting"],
  [/(tube\s*light|cfl|fluorescent)/i, "tube-light"],

  // tools + misc
  [/(iron|ironing\s*board|press)/i, "iron-board"],
  [/(vacuum|vacuum\s*cleaner|hoover)/i, "vacuum-cleaner"],
  [/(safe|locker)/i, "locker-safe"],
  [/(key\s*(holder|box))/i, "key-holder"],
  [/(clock|wall\s*clock|alarm)/i, "clock"],
  [/(outdoor\s*plant|garden\s*pot|planter)/i, "outdoor-planter"],
  [/(bbq|barbecue|grill)/i, "bbq-grill"],
];

/** label→slug utility (if you ever need to map preset labels) */
export function slugifyLabel(value: string): FurnishingSlug {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") as FurnishingSlug;
}

function resolve(input?: string | null): Meta {
  const name = (input || "").trim();
  if (!name) return META["other"];

  // exact slug
  if ((META as any)[name]) return (META as any)[name];

  // exact (case-insensitive) label
  const labelMatch = Object.values(META).find(m => m.label.toLowerCase() === name.toLowerCase());
  if (labelMatch) return labelMatch;

  // regex rules
  const hit = RULES.find(([re]) => re.test(name));
  if (hit) return META[hit[1]];

  // fallback
  return { ...META["other"], label: name };
}

export type FurnishingPillProps = {
  name: string;      // label or slug
  size?: number;     // icon size
  compact?: boolean; // smaller pill
  className?: string;
};

export default function FurnishingPill({
  name,
  size = 12,  // Changed from 14 to 8 (smaller icon)
  compact = true,  // Changed from false to true (compact by default)
  className = "",
}: FurnishingPillProps) {
  const { Icon, label, bg, fg } = resolve(name);

  return (
    <div
      className={[
        "inline-flex items-center gap-1 rounded-md",  // Changed gap-2 to gap-1, rounded-lg to rounded-md
        bg,
        compact ? "px-1.5 py-0.5" : "px-2 py-1",  // Smaller padding for compact
        className,
      ].join(" ")}
      title={label}
    >
      <Icon size={size} className={`${fg} shrink-0`} />
      <span className={[compact ? "text-[10px]" : "text-xs", fg].join(" ")}>
        {label}
      </span>
    </div>
  );
}

/** Optional: presets (labels) — exactly the same list as CSV “Value” column */
export const FURNISHING_PRESETS: string[] = [
  "Sofa", "Recliner", "Center Table", "Side Table", "Dining Set", "TV Unit",
  "King Bed", "Queen Bed", "Mattress", "Bedside Table", "Wardrobe (Almirah)",
  "Dressing Table", "Study Table", "Study Chair", "Bookshelf", "Shoe Rack",
  "Pooja Mandir", "Curtains", "Carpet / Rug", "Wall Art / Frames", "Indoor Plant", "Mirror",
  "Balcony Chairs/Table",
  "Modular Kitchen", "Chimney", "Gas Stove / Hob", "RO Purifier", "Refrigerator", "Microwave/OTG",
  "Utensils & Crockery", "Mixer Grinder",
  "Washing Machine", "Split/Window AC", "Ceiling Fan", "Air Cooler", "Geyser",
  "Inverter / UPS", "Stabilizer", "Wi-Fi Router", "Television", "Soundbar / HT",
  "Lights / Lamps", "Tube Light",
  "Iron + Board", "Vacuum Cleaner", "Safe / Locker", "Key Holder", "Wall Clock", "Outdoor Planter", "BBQ Grill",
];
