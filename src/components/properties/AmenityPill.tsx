// components/AmenityPill.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";
import {
    // Common, guaranteed Lucide icons (keep this list conservative to avoid import errors)
    AlertTriangle,
    Bath,
    BatteryCharging,
    BedDouble,
    Bike,
    Book,
    Building2,
    Camera,
    Car,
    Droplets,
    Dumbbell,
    FerrisWheel,
    Gamepad2,
    HelpCircle,
    Lightbulb,
    MapPin,
    Pill,
    ShieldCheck,
    Snowflake,
    Sun,
    Trash2,
    TreePine,
    Trophy,
    Users,
    UtensilsCrossed,
    Waves,
    Wifi,
    Leaf,
    Music,      
    ShoppingBag, 
    Tv,
    Sparkles
} from "lucide-react";

/** ===== Types ===== */
type Meta = {
    label: string;
    Icon: LucideIcon;
    bg: string;
    fg: string;
};

export type AmenityPillProps = {
    /** Amenity value from DB/Excel, e.g. "EV Charging", "Swimming Pool", etc. */
    name: string;
    /** Icon size (px) */
    size?: number;
    /** Extra classes for the outer pill */
    className?: string;
    /** Smaller padding/text */
    compact?: boolean;
};

/** ===== Utility: slugify to make stable keys from free-text ===== */
function slugify(input: string): string {
    return (input || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        || "other";
}

/** 
 * ===== Centralized amenity→meta mapping (generated from your CSV) =====
 * Keys are slugs of the raw "Value" column (e.g., "ev-charging", "swimming-pool").
 * Colors chosen to read well on white cards and stay brand-neutral.
 */
const AMENITY_META_BY_SLUG: Record<string, Meta> = {
    "amphitheatre": { label: "Amphitheatre", Icon: Users, bg: "bg-purple-50", fg: "text-purple-700" },
    "bicycle-cycle-storage": { label: "Bicycle / Cycle Storage", Icon: Bike, bg: "bg-emerald-50", fg: "text-emerald-700" },
    "business-center": { label: "Business Center", Icon: Users, bg: "bg-gray-50", fg: "text-gray-700" },
    "cctv": { label: "CCTV", Icon: Camera, bg: "bg-emerald-50", fg: "text-emerald-700" },
    "cafeteria": { label: "Cafeteria", Icon: UtensilsCrossed, bg: "bg-lime-50", fg: "text-lime-700" },
    "car-wash": { label: "Car Wash", Icon: Droplets, bg: "bg-gray-50", fg: "text-gray-700" },
    "clubhouse": { label: "Clubhouse", Icon: Building2, bg: "bg-purple-50", fg: "text-purple-700" },
    "common-toilets": { label: "Common Toilets", Icon: Bath, bg: "bg-sky-50", fg: "text-sky-700" },
    "conference-room": { label: "Conference Room", Icon: Users, bg: "bg-gray-50", fg: "text-gray-700" },
    "creche": { label: "Creche", Icon: FerrisWheel, bg: "bg-pink-50", fg: "text-pink-700" },
    "cricket-pitch-nets": { label: "Cricket Pitch / Nets", Icon: Trophy, bg: "bg-amber-50", fg: "text-amber-700" },
    "dg-rooms": { label: "DG Rooms", Icon: BatteryCharging, bg: "bg-yellow-50", fg: "text-yellow-700" },
    "double-height-lobbies": { label: "Double Height Lobbies", Icon: Building2, bg: "bg-slate-50", fg: "text-slate-700" },
    "drop-off-area": { label: "Drop-off Area", Icon: MapPin, bg: "bg-slate-50", fg: "text-slate-700" },
    "ev-charging": { label: "EV Charging", Icon: BatteryCharging, bg: "bg-yellow-50", fg: "text-yellow-700" },
    "elevator": { label: "Elevator", Icon: Building2, bg: "bg-slate-50", fg: "text-slate-700" },
    "elevators": { label: "Elevators", Icon: Building2, bg: "bg-slate-50", fg: "text-slate-700" },
    "escalator": { label: "Escalator", Icon: Building2, bg: "bg-slate-50", fg: "text-slate-700" },
    "fire-alarm": { label: "Fire Alarm", Icon: AlertTriangle, bg: "bg-red-50", fg: "text-red-700" },
    "fire-safety": { label: "Fire Safety", Icon: AlertTriangle, bg: "bg-red-50", fg: "text-red-700" },
    "fire-staircases": { label: "Fire Staircases", Icon: AlertTriangle, bg: "bg-red-50", fg: "text-red-700" },
    "game-rooms": { label: "Game Rooms", Icon: Gamepad2, bg: "bg-violet-50", fg: "text-violet-700" },
    "garbage-chute": { label: "Garbage Chute", Icon: Trash2, bg: "bg-rose-50", fg: "text-rose-700" },
    "garden": { label: "Garden", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
    "generator-rooms": { label: "Generator Rooms", Icon: BatteryCharging, bg: "bg-yellow-50", fg: "text-yellow-700" },
    "green-building-certification": { label: "Green Building Certification", Icon: Leaf as unknown as LucideIcon, bg: "bg-green-50", fg: "text-green-700" } as Meta,
    "guest-rooms": { label: "Guest Rooms", Icon: BedDouble, bg: "bg-blue-50", fg: "text-blue-700" },
    "gym-fitness-center": { label: "Gym / Fitness Center", Icon: Dumbbell, bg: "bg-fuchsia-50", fg: "text-fuchsia-700" },
    "indoor-games-room": { label: "Indoor Games Room", Icon: Gamepad2, bg: "bg-violet-50", fg: "text-violet-700" },
    "jogging-track": { label: "Jogging Track", Icon: Trophy, bg: "bg-amber-50", fg: "text-amber-700" },
    "kids-play-area": { label: "Kids Play Area", Icon: FerrisWheel, bg: "bg-pink-50", fg: "text-pink-700" },
    "library": { label: "Library", Icon: Book, bg: "bg-amber-50", fg: "text-amber-700" },
    "locker-room": { label: "Locker Room", Icon: ShieldCheck, bg: "bg-emerald-50", fg: "text-emerald-700" },
    "lush-landscapes": { label: "Lush Landscapes", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
    "meeting-room": { label: "Meeting Room", Icon: Users, bg: "bg-gray-50", fg: "text-gray-700" },
    "mini-theatre": { label: "Mini Theatre", Icon: Tv, bg: "bg-purple-50", fg: "text-purple-700" } as Meta,
    "music-room": { label: "Music Room", Icon: Music as unknown as LucideIcon, bg: "bg-purple-50", fg: "text-purple-700" } as Meta,
    "open-sitting-area": { label: "Open Sitting Area", Icon: Users, bg: "bg-gray-50", fg: "text-gray-700" },
    "pharmacy": { label: "Pharmacy", Icon: Pill, bg: "bg-teal-50", fg: "text-teal-700" },
    "power-backup": { label: "Power Backup", Icon: BatteryCharging, bg: "bg-yellow-50", fg: "text-yellow-700" },
    "prayer-room": { label: "Prayer Room", Icon: Sparkles as unknown as LucideIcon, bg: "bg-amber-50", fg: "text-amber-700" } as Meta,
    "rainwater-harvesting": { label: "Rainwater Harvesting", Icon: Droplets, bg: "bg-blue-50", fg: "text-blue-700" },
    "reading-room": { label: "Reading Room", Icon: Book, bg: "bg-amber-50", fg: "text-amber-700" },
    "restaurant": { label: "Restaurant", Icon: UtensilsCrossed, bg: "bg-lime-50", fg: "text-lime-700" },
    "retail-shopping": { label: "Retail/Shopping", Icon: ShoppingBag as unknown as LucideIcon, bg: "bg-rose-50", fg: "text-rose-700" } as Meta,
    "security-cabin": { label: "Security Cabin", Icon: ShieldCheck, bg: "bg-emerald-50", fg: "text-emerald-700" },
    "servant-room": { label: "Servant Room", Icon: Users, bg: "bg-gray-50", fg: "text-gray-700" },
    "smart-lighting": { label: "Smart Lighting", Icon: Lightbulb, bg: "bg-yellow-50", fg: "text-yellow-700" },
    "smoke-detectors": { label: "Smoke Detectors", Icon: AlertTriangle, bg: "bg-red-50", fg: "text-red-700" },
    "society-office": { label: "Society Office", Icon: Users, bg: "bg-gray-50", fg: "text-gray-700" },
    "solar-power": { label: "Solar Power", Icon: Sun, bg: "bg-yellow-50", fg: "text-yellow-700" },
    "spa": { label: "Spa", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
    "sports-courts": { label: "Sports Courts", Icon: Trophy, bg: "bg-amber-50", fg: "text-amber-700" },
    "street-lighting": { label: "Street Lighting", Icon: Lightbulb, bg: "bg-yellow-50", fg: "text-yellow-700" },
    "swimming-pool": { label: "Swimming Pool", Icon: Waves, bg: "bg-blue-50", fg: "text-blue-700" },
    "valet-parking": { label: "Valet Parking", Icon: Car, bg: "bg-amber-50", fg: "text-amber-700" },
    "visitor-parking": { label: "Visitor Parking", Icon: Car, bg: "bg-amber-50", fg: "text-amber-700" },
    "water-treatment": { label: "Water Treatment", Icon: Droplets, bg: "bg-blue-50", fg: "text-blue-700" },
    "water-treatment-plant": { label: "Water Treatment Plant", Icon: Droplets, bg: "bg-blue-50", fg: "text-blue-700" },
    "wellness-spa": { label: "Wellness / Spa", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
    "wifi-in-common-areas": { label: "WiFi in Common Areas", Icon: Wifi, bg: "bg-indigo-50", fg: "text-indigo-700" },
    "yoga-meditation-area": { label: "Yoga / Meditation Area", Icon: TreePine, bg: "bg-green-50", fg: "text-green-700" },
};

/** 
 * Aliases / quick keyword rules so free text also resolves cleanly.
 * (Covers plurals & common synonyms)
 */
const KEYWORD_RULES: Array<[RegExp, string]> = [
    [/swim|pool/i, "swimming-pool"],
    /wifi|wi[-_\s]?fi|internet/i.test.toString ? [/wifi|wi[-_\s]?fi|internet/i, "wifi-in-common-areas"] : [/wifi/i, "wifi-in-common-areas"],
    [/gym|fitness/i, "gym-fitness-center"],
    [/garden|landscape/i, "garden"],
    [/club/i, "clubhouse"],
    [/elevat|escalator/i, "elevator"],
    [/park(ing)?\b|valet|visitor/i, "visitor-parking"],
    [/bath|toilet|washroom/i, "common-toilets"],
    [/cctv|camera|security cabin|security/i, "cctv"],
    [/ac|air.?cond/i, "elevator"], // keep AC out of this set; (no explicit "AC" in CSV)
    [/heater|geyser/i, "common-toilets"],
    [/water treatment|stp|sewage/i, "water-treatment"],
    [/kids|play|creche/i, "kids-play-area"],
    [/conference|meeting/i, "conference-room"],
    [/kitchen|cafeteria|restaurant/i, "cafeteria"],
    [/ev.?charging|charging/i, "ev-charging"],
    [/solar/i, "solar-power"],
    [/generator|power backup|dg rooms/i, "power-backup"],
    [/garbage|waste|chute/i, "garbage-chute"],
    [/library|reading/i, "library"],
    [/music/i, "music-room"],
    [/game/i, "game-rooms"],
    [/cricket|sport|court/i, "sports-courts"],
    [/prayer|temple/i, "prayer-room"],
    [/pharmacy|medical/i, "pharmacy"],
    [/smart.*light|street.*light|lighting/i, "street-lighting"],
    [/shopping|retail/i, "retail-shopping"],
    [/bicycle|cycle/i, "bicycle-cycle-storage"],
    [/drop[-\s]?off/i, "drop-off-area"],
    [/guest/i, "guest-rooms"],
];

/** Try to resolve a free-text amenity name to a Meta entry from the table. */
export function resolveAmenityMeta(name: string): Meta {
    const slug = slugify(name);
    if (AMENITY_META_BY_SLUG[slug]) return AMENITY_META_BY_SLUG[slug];

    const hit = KEYWORD_RULES.find(([re]) => re.test(name));
    if (hit) {
        const meta = AMENITY_META_BY_SLUG[hit[1]];
        if (meta) return meta;
    }

    // ultimate fallback: neutral pill + the original text
    return { label: (name || "Other").trim(), Icon: HelpCircle, bg: "bg-gray-50", fg: "text-gray-700" };
}

/** ===== UI Component ===== */
export default function AmenityPill({
    name,
    size = 14,
    className = "",
    compact = false,
}: AmenityPillProps) {
    const meta = resolveAmenityMeta(name);
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
