// components/AmenityPill.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";
import {
    BedDouble,
    Car,
    Bath,
    Wifi,
    Dumbbell,
    ShieldCheck,
    Tv,
    Snowflake,
    Flame,
    Droplets,
    FerrisWheel,
    TreePine,
    Building2,
    UtensilsCrossed,
    HelpCircle,
    Waves,
} from "lucide-react";

type AmenitySlug =
    | "bedrooms"
    | "parking"
    | "bathroom"
    | "wifi"
    | "gym"
    | "security"
    | "tv"
    | "ac"
    | "heater"
    | "water"
    | "kidsArea"
    | "garden"
    | "elevator"
    | "kitchen"
    | "fridge"
    | "washingMachine"
    | "swimmingPool"
    | "other";

type Meta = {
    label: string;
    Icon: LucideIcon;
    bg: string;
    fg: string;
};

// NOTE: 'fridge' & 'washingMachine' use safe fallbacks.
// Agar tumhare lucide-react version me Refrigerator / WashingMachine icons hain,
// unko import karke replace kar lena.
const META: Record<AmenitySlug, Meta> = {
    bedrooms: { label: "Bedrooms", Icon: BedDouble, bg: "bg-blue-50", fg: "text-blue-700" },
    parking: { label: "Parking", Icon: Car, bg: "bg-amber-50", fg: "text-amber-700" },
    bathroom: { label: "Bathroom", Icon: Bath, bg: "bg-sky-50", fg: "text-sky-700" },
    wifi: { label: "Wi-Fi", Icon: Wifi, bg: "bg-indigo-50", fg: "text-indigo-700" },
    gym: { label: "Gym", Icon: Dumbbell, bg: "bg-fuchsia-50", fg: "text-fuchsia-700" },
    security: { label: "Security", Icon: ShieldCheck, bg: "bg-emerald-50", fg: "text-emerald-700" },
    tv: { label: "TV", Icon: Tv, bg: "bg-purple-50", fg: "text-purple-700" },
    ac: { label: "AC", Icon: Snowflake, bg: "bg-cyan-50", fg: "text-cyan-700" },
    heater: { label: "Heater", Icon: Flame, bg: "bg-orange-50", fg: "text-orange-700" },
    water: { label: "24×7 Water", Icon: Droplets, bg: "bg-blue-50", fg: "text-blue-700" },
    kidsArea: { label: "Kids Area", Icon: FerrisWheel, bg: "bg-pink-50", fg: "text-pink-700" },
    garden: { label: "Garden", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
    elevator: { label: "Elevator", Icon: Building2, bg: "bg-slate-50", fg: "text-slate-700" },
    kitchen: { label: "Modular Kitchen", Icon: UtensilsCrossed, bg: "bg-lime-50", fg: "text-lime-700" },
    fridge: { label: "Refrigerator", Icon: Snowflake, bg: "bg-teal-50", fg: "text-teal-700" }, // fallback
    washingMachine: { label: "Washing Machine", Icon: HelpCircle, bg: "bg-rose-50", fg: "text-rose-700" }, // fallback
    swimmingPool: { label: "Swimming Pool", Icon: Waves, bg: "bg-blue-50", fg: "text-blue-700" },
    other: { label: "Other", Icon: HelpCircle, bg: "bg-gray-50", fg: "text-gray-700" },
};

// smart name → slug resolver (regex rules)
const RULES: Array<[RegExp, AmenitySlug]> = [
    [/bed|bhk?\b/i, "bedrooms"],
    [/park|garage/i, "parking"],
    [/bath|toilet|washroom/i, "bathroom"],
    [/wi[-_\s]?fi|internet/i, "wifi"],
    [/gym|fitness/i, "gym"],
    [/security|guard|cctv/i, "security"],
    [/(\btv\b|television)/i, "tv"], // <-- fixed
    [/a\.?c\.?|air.?cond/i, "ac"],
    [/heater|geyser/i, "heater"],
    [/water(?!\s*park)/i, "water"],
    [/kids|play|children/i, "kidsArea"],
    [/garden|lawn|park view/i, "garden"],
    [/elevat|lift/i, "elevator"],
    [/kitchen/i, "kitchen"],
    [/fridge|refrigerator/i, "fridge"],
    [/wash(ing)?\s*machine/i, "washingMachine"],
    [/swim|pool|swimming/i, "swimmingPool"],
];

function resolve(name: string): Meta {
    // if exact slug passed
    const maybeSlug = name as AmenitySlug;
    if (maybeSlug && META[maybeSlug]) return META[maybeSlug];

    // guess from text
    const hit = RULES.find(([re]) => re.test(name));
    if (hit) return META[hit[1]];

    // fallback with original label
    return { ...META.other, label: name?.trim() || META.other.label };
}

export type AmenityPillProps = {
    name: string;       // free-text or known slug
    size?: number;      // icon size
    className?: string; // extra classes
    compact?: boolean;  // smaller padding/text
};

export default function AmenityPill({
    name,
    size = 14,
    className = "",
    compact = false,
}: AmenityPillProps) {
    const meta = resolve(name);
    const { Icon, label, bg, fg } = meta;

    return (
        <div
            className={[
                "inline-flex items-center gap-2 rounded-lg",
                bg,
                compact ? "px-2 py-1" : "p-2",
                className,
            ].join(" ")}
            title={label}
        >
            <Icon size={size} className={fg} />
            <span className={["truncate", compact ? "text-xs" : "text-sm", fg].join(" ")}>
                {label}
            </span>
        </div>
    );
}

// optional: export resolve for testing
export { resolve };
