// components/FurnishingPill.tsx
import React from "react";
import type { LucideProps } from "lucide-react";
import {
  Sofa,
  Armchair,
  Bed,
  Shirt,
  Table,
  Tv,
  Refrigerator,
  Microwave,
  UtensilsCrossed,
  AirVent,
  Fan,
  Droplets,
  Coffee,
  WashingMachine,
  Thermometer,
  Zap,
  Wind,
  Lightbulb,
  Paintbrush,
  BookOpen,
  Flower,
  Lock,
  Square,
  Circle,
  TreePine,
  HelpCircle,
} from "lucide-react";

export type FurnishingSlug =
  | "sofa"
  | "recliner"
  | "centerTable"
  | "sideTable"
  | "diningSet"
  | "tvUnit"
  | "bedKing"
  | "bedQueen"
  | "mattress"
  | "bedsideTable"
  | "wardrobe"
  | "dressingTable"
  | "studyTable"
  | "studyChair"
  | "bookshelf"
  | "shoeRack"
  | "poojaUnit"
  | "curtains"
  | "carpet"
  | "wallArt"
  | "indoorPlant"
  | "mirror"
  | "balconySet"
  | "modularKitchen"
  | "chimney"
  | "gasStove"
  | "roPurifier"
  | "refrigerator"
  | "microwave"
  | "utensilsCrockery"
  | "mixerGrinder"
  | "washingMachine"
  | "ac"
  | "ceilingFan"
  | "airCooler"
  | "geyser"
  | "inverterUps"
  | "stabilizer"
  | "wifiRouter"
  | "tv"
  | "soundbar"
  | "lighting"
  | "tubeLight"
  | "ironBoard"
  | "vacuumCleaner"
  | "lockerSafe"
  | "keyHolder"
  | "clock"
  | "outdoorPlanter"
  | "bbqGrill"
  | "other";

type Meta = {
  label: string;
  Icon: React.ComponentType<Partial<LucideProps>>;
  bg: string;
  fg: string;
};

// ---- static icon/color map ----
const META: Record<FurnishingSlug, Meta> = {
  sofa: { label: "Sofa", Icon: Sofa, bg: "bg-amber-50", fg: "text-amber-700" },
  recliner: { label: "Recliner", Icon: Armchair, bg: "bg-indigo-50", fg: "text-indigo-700" },
  centerTable: { label: "Center Table", Icon: Table, bg: "bg-orange-50", fg: "text-orange-700" },
  sideTable: { label: "Side Table", Icon: Table, bg: "bg-orange-50", fg: "text-orange-700" },
  diningSet: { label: "Dining Set", Icon: Table, bg: "bg-lime-50", fg: "text-lime-700" },
  tvUnit: { label: "TV Unit", Icon: Tv, bg: "bg-purple-50", fg: "text-purple-700" },
  bedKing: { label: "King Bed", Icon: Bed, bg: "bg-violet-50", fg: "text-violet-700" },
  bedQueen: { label: "Queen Bed", Icon: Bed, bg: "bg-violet-50", fg: "text-violet-700" },
  mattress: { label: "Mattress", Icon: Bed, bg: "bg-slate-50", fg: "text-slate-700" },
  bedsideTable: { label: "Bedside Table", Icon: Table, bg: "bg-slate-50", fg: "text-slate-700" },
  wardrobe: { label: "Wardrobe (Almirah)", Icon: Shirt, bg: "bg-emerald-50", fg: "text-emerald-700" },
  dressingTable: { label: "Dressing Table", Icon: Circle, bg: "bg-zinc-50", fg: "text-zinc-700" },
  studyTable: { label: "Study Table", Icon: Table, bg: "bg-blue-50", fg: "text-blue-700" },
  studyChair: { label: "Study Chair", Icon: Armchair, bg: "bg-blue-50", fg: "text-blue-700" },
  bookshelf: { label: "Bookshelf", Icon: BookOpen, bg: "bg-amber-50", fg: "text-amber-700" },
  shoeRack: { label: "Shoe Rack", Icon: Square, bg: "bg-rose-50", fg: "text-rose-700" },
  poojaUnit: { label: "Pooja Mandir", Icon: Flower, bg: "bg-lime-50", fg: "text-lime-700" },
  curtains: { label: "Curtains", Icon: Square, bg: "bg-fuchsia-50", fg: "text-fuchsia-700" },
  carpet: { label: "Carpet / Rug", Icon: Square, bg: "bg-rose-50", fg: "text-rose-700" },
  wallArt: { label: "Wall Art / Frames", Icon: Paintbrush, bg: "bg-pink-50", fg: "text-pink-700" },
  indoorPlant: { label: "Indoor Plant", Icon: Flower, bg: "bg-emerald-50", fg: "text-emerald-700" },
  mirror: { label: "Mirror", Icon: Circle, bg: "bg-zinc-50", fg: "text-zinc-700" },
  balconySet: { label: "Balcony Chairs/Table", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },

  modularKitchen: { label: "Modular Kitchen", Icon: UtensilsCrossed, bg: "bg-lime-50", fg: "text-lime-700" },
  chimney: { label: "Chimney", Icon: AirVent, bg: "bg-slate-50", fg: "text-slate-700" },
  gasStove: { label: "Gas Stove / Hob", Icon: UtensilsCrossed, bg: "bg-orange-50", fg: "text-orange-700" },
  roPurifier: { label: "RO Purifier", Icon: Droplets, bg: "bg-sky-50", fg: "text-sky-700" },
  refrigerator: { label: "Refrigerator", Icon: Refrigerator, bg: "bg-teal-50", fg: "text-teal-700" },
  microwave: { label: "Microwave/OTG", Icon: Microwave, bg: "bg-rose-50", fg: "text-rose-700" },
  utensilsCrockery: { label: "Utensils & Crockery", Icon: UtensilsCrossed, bg: "bg-zinc-50", fg: "text-zinc-700" },
  mixerGrinder: { label: "Mixer Grinder", Icon: UtensilsCrossed, bg: "bg-zinc-50", fg: "text-zinc-700" },

  washingMachine: { label: "Washing Machine", Icon: WashingMachine, bg: "bg-cyan-50", fg: "text-cyan-700" },
  ac: { label: "Split/Window AC", Icon: AirVent, bg: "bg-cyan-50", fg: "text-cyan-700" },
  ceilingFan: { label: "Ceiling Fan", Icon: Fan, bg: "bg-slate-50", fg: "text-slate-700" },
  airCooler: { label: "Air Cooler", Icon: Wind, bg: "bg-teal-50", fg: "text-teal-700" },
  geyser: { label: "Geyser", Icon: Thermometer, bg: "bg-rose-50", fg: "text-rose-700" },
  inverterUps: { label: "Inverter / UPS", Icon: Zap, bg: "bg-yellow-50", fg: "text-yellow-700" },
  stabilizer: { label: "Stabilizer", Icon: Zap, bg: "bg-yellow-50", fg: "text-yellow-700" },

  wifiRouter: { label: "Wi-Fi Router", Icon: Droplets, bg: "bg-indigo-50", fg: "text-indigo-700" },
  tv: { label: "Television", Icon: Tv, bg: "bg-purple-50", fg: "text-purple-700" },
  soundbar: { label: "Soundbar / HT", Icon: Tv, bg: "bg-violet-50", fg: "text-violet-700" },

  lighting: { label: "Lights / Lamps", Icon: Lightbulb, bg: "bg-amber-50", fg: "text-amber-700" },
  tubeLight: { label: "Tube Light", Icon: Lightbulb, bg: "bg-zinc-50", fg: "text-zinc-700" },

  ironBoard: { label: "Iron + Board", Icon: Square, bg: "bg-blue-50", fg: "text-blue-700" },
  vacuumCleaner: { label: "Vacuum Cleaner", Icon: Wind, bg: "bg-slate-50", fg: "text-slate-700" },
  lockerSafe: { label: "Safe / Locker", Icon: Lock, bg: "bg-slate-50", fg: "text-slate-700" },
  keyHolder: { label: "Key Holder", Icon: Square, bg: "bg-slate-50", fg: "text-slate-700" },
  clock: { label: "Wall Clock", Icon: Circle, bg: "bg-zinc-50", fg: "text-zinc-700" },
  outdoorPlanter: { label: "Outdoor Planter", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
  bbqGrill: { label: "BBQ Grill", Icon: UtensilsCrossed, bg: "bg-orange-50", fg: "text-orange-700" },

  other: { label: "Other", Icon: HelpCircle, bg: "bg-gray-50", fg: "text-gray-700" },
};

// ---- smart resolver: free text -> slug ----
const RULES: Array<[RegExp, FurnishingSlug]> = [
  // Furniture
  [/(^|\b)(sofa|couch|diwan|divan|sectional|loveseat)(\b|$)/i, "sofa"],
  [/(recliner|loung(e)? chair)/i, "recliner"],
  [/(center|coffee)\s*table/i, "centerTable"],
  [/(side|end)\s*table/i, "sideTable"],
  [/(dining)\s*(table|set|chair)/i, "diningSet"],
  [/tv\s*(unit|console|cabinet)/i, "tvUnit"],
  [/(king)\s*bed/i, "bedKing"],
  [/(queen)\s*bed/i, "bedQueen"],
  [/\bmattress\b|coir|spring|foam/i, "mattress"],
  [/(bedside|night)\s*table/i, "bedsideTable"],
  [/(wardrobe|almirah|almera|closet|cupboard)/i, "wardrobe"],
  [/dressing\s*(table)?|dresser/i, "dressingTable"],
  [/(study|office)\s*(table|desk)/i, "studyTable"],
  [/(study|office)\s*chair/i, "studyChair"],
  [/(book\s*shelf|bookcase|library)/i, "bookshelf"],
  [/(shoe\s*(rack|cabinet))/i, "shoeRack"],
  [/(pooja|puja|mandir|temple)/i, "poojaUnit"],
  [/(curtain|curtains|drape|blind)/i, "curtains"],
  [/(carpet|rug|mat)/i, "carpet"],
  [/(wall\s*(art|frame|painting|photo))/i, "wallArt"],
  [/(indoor\s*plant|planter)/i, "indoorPlant"],
  [/(mirror|looking\s*glass)/i, "mirror"],
  [/(balcony).*(chair|table|set)|patio/i, "balconySet"],

  // Kitchen & Appliances
  [/(modular\s*kitchen|kitchen\s*cabinet|pantry)/i, "modularKitchen"],
  [/(chimney|hood|exhaust)/i, "chimney"],
  [/(gas\s*(stove|hob)|cooktop|burner|chulha)/i, "gasStove"],
  [/(ro|r\.o\.|water\s*purifier|aquaguard|kent)/i, "roPurifier"],
  [/(fridge|refrigerator|freezer)/i, "refrigerator"],
  [/(microwave|otg|toaster|convection|oven)/i, "microwave"],
  [/(utensil|crockery|cutlery|plates?|bowls?|spoons?|forks?)/i, "utensilsCrockery"],
  [/(mixer|grinder|blender)/i, "mixerGrinder"],

  // Utilities & Electronics
  [/(washing\s*machine|washer)/i, "washingMachine"],
  [/(a\.?\s?c\.?|air\s?cond|split\s?ac|window\s?ac)/i, "ac"],
  [/(ceiling\s*fan|fan\b)/i, "ceilingFan"],
  [/(air\s*cooler|desert\s*cooler)/i, "airCooler"],
  [/(geyser|water\s*heater)/i, "geyser"],
  [/(inverter|ups|power\s*backup)/i, "inverterUps"],
  [/(stabilizer)/i, "stabilizer"],
  [/(wi[- ]?fi|router|broadband|internet)/i, "wifiRouter"],
  [/(^tv$|television|smart\s*tv)/i, "tv"],
  [/(soundbar|home\s*theatre|home\s*theater)/i, "soundbar"],
  [/(light|lamp|chandelier|pendant)/i, "lighting"],
  [/(tube\s*light|cfl|fluorescent)/i, "tubeLight"],

  // Tools & Misc
  [/(iron|ironing\s*board|press)/i, "ironBoard"],
  [/(vacuum|vacuum\s*cleaner|hoover)/i, "vacuumCleaner"],
  [/(safe|locker)/i, "lockerSafe"],
  [/(key\s*(holder|box))/i, "keyHolder"],
  [/(clock|wall\s*clock|alarm)/i, "clock"],
  [/(outdoor\s*plant|garden\s*pot|planter)/i, "outdoorPlanter"],
  [/(bbq|barbecue|grill)/i, "bbqGrill"],
];

function resolve(input?: string | null): Meta {
  const name = (input || "").trim();
  if (!name) return META.other;

  // 1) direct slug match (exact)
  const slugCandidate = name as FurnishingSlug;
  if ((META as any)[slugCandidate]) return (META as any)[slugCandidate];

  // 2) case-insensitive label match
  const labelMatch = Object.values(META).find(m => m.label.toLowerCase() === name.toLowerCase());
  if (labelMatch) return labelMatch;

  // 3) try to match rules (free text)
  const hit = RULES.find(([re]) => re.test(name));
  if (hit) {
    const slug = hit[1];
    return META[slug];
  }

  // 4) fallback: return 'other' but keep original label text
  return { ...META.other, label: name };
}

export type FurnishingPillProps = {
  name: string; // free text or slug
  size?: number; // icon size
  compact?: boolean; // smaller padding/text
  className?: string;
};

export default function FurnishingPill({
  name,
  size = 14,
  compact = false,
  className = "",
}: FurnishingPillProps) {
  const { Icon, label, bg, fg } = resolve(name);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg ${bg} ${className} ${compact ? "px-2 py-1" : "p-2"
        }`}
      title={label}
    >
      <Icon size={size} className={fg} />
      <span className={`truncate ${compact ? "text-xs" : "text-sm"} ${fg}`}>
        {label}
      </span>
    </div>
  );
}

// Optional: master list you can map directly in your UI
export const FURNISHING_PRESETS: string[] = [
  "Sofa", "Recliner", "Center Table", "Side Table", "Dining Set", "TV Unit",
  "King Bed", "Queen Bed", "Mattress", "Bedside Table", "Wardrobe (Almirah)",
  "Dressing Table", "Study Table", "Study Chair", "Bookshelf", "Shoe Rack",
  "Pooja Mandir", "Curtains", "Carpet", "Wall Art", "Indoor Plant", "Mirror",
  "Balcony Chairs/Table",

  "Modular Kitchen", "Chimney", "Gas Stove / Hob", "RO Purifier",
  "Refrigerator", "Microwave/OTG", "Utensils & Crockery", "Mixer Grinder",

  "Washing Machine", "Split AC", "Ceiling Fan", "Air Cooler", "Geyser",
  "Inverter / UPS", "Stabilizer", "Wi-Fi Router", "Television", "Soundbar",

  "Lights / Lamps", "Tube Light", "Iron + Board", "Vacuum Cleaner",
  "Safe / Locker", "Key Holder", "Wall Clock", "Outdoor Planter", "BBQ Grill",
];
