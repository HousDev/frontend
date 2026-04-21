// PropertyDescriptionSmart.tsx
import { Phone } from "lucide-react";
import React, { useMemo, useState } from "react";

/** --- helpers ----------------------------------------------------------- */

// wrap keyword hits with <strong>
function highlightText(text: string, terms: string[]) {
    if (!text) return " - ";
    const uniq = Array.from(new Set(terms.filter(Boolean))).sort((a, b) => b.length - a.length);
    if (!uniq.length) return text;

    const pattern = new RegExp(`(${uniq.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    const parts = text.split(pattern);

    return parts.map((part, i) =>
        pattern.test(part)
            ? <strong key={i} className="font-semibold text-gray-900">{part}</strong>
            : <span key={i}>{part}</span>
    );
}

type MaybeProp = Record<string, any> | undefined;

function extractFacts(desc: string, property?: MaybeProp) {
    const facts: Array<{ label: string; value: string }> = [];
    const add = (label: string, value?: string | number | null) => {
        if (value === undefined || value === null) return;
        const s = String(value).trim();
        if (!s || s === "-" || s === "null") return;
        facts.push({ label, value: s });
    };

    // from description via regex
    const area = desc.match(/(\d{2,5})\s*(sq\.?\s*ft|sqft|sq ft|sq\.? m|sqm)/i);
    const price = desc.match(/₹\s?[\d,\.]+(\s*cr|\s*l(ak)?h)?/i);
    const beds = desc.match(/(\d+)\s*(bh?k)/i);
    const baths = desc.match(/(\d+)\s*bath(room)?s?/i);
    const parking = desc.match(/(\d+)\s*parking/i);
    const year = desc.match(/(19|20)\d{2}/);
    const facing = desc.match(/\b(east|west|north|south|north-east|south-east|north-west|south-west)\b/i);
    const furnish = desc.match(/\b(un-?furnished|semi-?furnished|fully-?furnished)\b/i);
    const location = desc.match(/\b(in|at)\s+([A-Za-z ]+,\s*[A-Za-z ]+)\b/);

    add("Price", price?.[0]);
    add("Configuration", beds?.[0]?.toUpperCase());
    add("Carpet Area", area ? `${area[1]} ${area[2]}` : undefined);
    add("Bathrooms", baths?.[1]);
    add("Parking", parking?.[0]);
    add("Built Year", year?.[0]);
    add("Facing", facing?.[0]?.toUpperCase());
    add("Furnishing", furnish?.[0]?.replace(/-/g, " "));
    add("Location", location?.[2]);

    // fallbacks from property object if available
    if (property) {
        add("City", property.city);
        add("Locality", property.locality || property.area);
        add("Bedrooms", property.bedrooms);
        add("Bathrooms", property.bathrooms);
        add("Parking", property.parking);
        add("Carpet Area", property.carpet_area && `${property.carpet_area} sq ft`);
        add("Built Year", property.built_year);
        add("Facing", property.facing);
        add("Furnishing", property.furnishing);
        add("Type", property.property_type);
    }

    // clean duplicates (keep first)
    const seen = new Set<string>();
    return facts.filter(f => {
        const key = f.label + ":" + f.value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function toBulletLines(desc: string) {
    // split on newlines or periods and keep meaningful lines
    return desc
        .split(/\n+|(?<=\.)\s+/)
        .map(s => s.trim().replace(/^[-•\u2022]\s*/, ""))
        .filter(s => s.length >= 20 && s.length <= 180)
        .slice(0, 6);
}

/** --- component --------------------------------------------------------- */

export default function PropertyDescriptionSmart({
    description,
    property,
}: {
    description?: string;
    property?: MaybeProp;
}) {
    const [showFull, setShowFull] = useState(false);
    const safeText = description?.trim() || " - ";

    const facts = useMemo(() => extractFacts(safeText, property), [safeText, property]);
    const bullets = useMemo(() => toBulletLines(safeText), [safeText]);

    const keywords = useMemo(() => {
        const k = [
            "2BHK", "3BHK", "Commercial", "Prime location", "Covered parking",
            "Carpet Area", "Budget", "Furnishing", "Unfurnished", "Semi Furnished",
            "Fully Furnished", "Baner", "Mumbai", "Visibility", "Accessibility"
        ];
        facts.forEach(f => k.push(f.value));
        return k;
    }, [facts]);

    return (
        <div className="">
            <h2 className="font-bold text-black text-xl sm:xl mb-2 sm:mb-3">
                Property Description
            </h2>

            {/* Key Highlights */}
            {/* {facts.length > 0 && (
                <div className="mb-3 sm:mb-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">Key Highlights</h3>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm text-gray-800">
                        {facts.map((f, i) => (
                            <li key={i}>
                                <span className="text-gray-600">{f.label}:</span>{" "}
                                <span className="font-medium">{f.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )} */}

            {/* Smart bullets from sentences (optional, only if we have nice lines) */}
            {/* {bullets.length >= 3 && (
                <div className="mb-3 sm:mb-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">What you’ll love</h3>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
                        {bullets.map((b, i) => <li key={i}>{highlightText(b, keywords)}</li>)}
                    </ul>
                </div>
            )} */}

            {/* Full paragraph with highlights + show more */}
<div className="text-xs sm:text-sm md:text-[14px] font-medium text-gray-700 leading-relaxed">
    {(showFull ? safeText : safeText.slice(0, 420) + (safeText.length > 420 ? "…" : ""))
        .split(/\n+/)
        .filter(line => line.trim().length > 0)
        .map((line, idx) => {
            const trimmed = line.trim();
            const isBullet = /^[•\-✅→➡️🔹▪️▶️*]/.test(trimmed);
            return (
                <p
                    key={idx}
                    className={`mb-1 ${isBullet ? "pl-4" : ""}`}
                >
                    {highlightText(trimmed, keywords)}
                </p>
            );
        })
    }
</div>
            <div className="flex items-center gap-1">
  <Phone size={13} className="text-blue-600" aria-hidden="true" />
  <span className="text-[14px] font-medium">Call now to schedule a site visit and make this beautiful home yours!</span>
</div>

            {safeText.length > 420 && (
                <button
                    onClick={() => setShowFull(s => !s)}
                    className="mt-2 text-xs sm:text-sm font-medium text-indigo-600 hover:underline"
                >
                    {showFull ? "Show less" : "Read more"}
                </button>
            )}
        </div>
    );
}
