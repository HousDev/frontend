// src/components/documents/PropertyBulkBrochureModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Download, Search, ChevronDown, ChevronUp, Eye, SlidersHorizontal, Link as LinkIcon } from "lucide-react";
import { toast } from "react-toastify";
import propertiesAPI from "@/lib/propertiesAPI";
 

/* ---------- Types ---------- */
type Property = {
    id?: string | number;
    title?: string;
    societyName?: string;
    propertyId?: string | number;
    slug?: string;
    location?: string;
    locationNormalized?: string;
    city?: string;
    price?: number | string | null;
    budget?: number | string | null;
    type?: string;
    unitType?: string;
    subtype?: string;
    carpetArea?: number | string;
    square_feet?: number | string;
    bedrooms?: number;
    bathrooms?: number;
    photos?: string[];
    images?: string[];
    description?: string;
    amenities?: string[];
    agent?: { name?: string; phone?: string } | null;
    raw?: any;
};

type Props = { isOpen: boolean; onClose: () => void };

/* ---------- Helpers ---------- */
const safeNumber = (v?: number | string | null): number => {
    if (v == null || v === "") return 0;
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(/[^\d.-]/g, ""));
    return Number.isNaN(n) ? 0 : n;
};

const formatCurrency = (amount?: number | string | null) => {
    const n = safeNumber(amount);
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
};

const displayOrDash = (val: any) =>
    val === null || val === undefined || (typeof val === "string" && val.trim() === "") ? "—" : val;

/** Title = type unitType subtype (no slashes) */
const getTypeUnitSubtypeTitle = (p?: Property) => {
    const parts = [p?.type, p?.unitType, p?.subtype]
        .map((s) => (s ?? "").toString().trim())
        .filter(Boolean);
    return parts.join(" ").replace(/\s{2,}/g, " ").trim() || "Property";
};

/** --- Normalization utilities --- */
const pickFirstString = (...vals: any[]) =>
    vals
        .map((v) => (typeof v === "string" ? v : v == null ? "" : String(v)))
        .map((s) => s.trim())
        .find((s) => !!s) || "";

/** Best-effort split "MG Road, Bangalore" → {primary: "MG Road", city: "Bangalore"} */
const splitPrimaryAndCity = (s: string) => {
    const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
    if (parts.length >= 2) {
        const city = parts[parts.length - 1];
        const primary = parts.slice(0, parts.length - 1).join(", ");
        return { primary, city };
    }
    return { primary: s.trim(), city: "" };
};

/** Normalize one property record coming from backend into our canonical shape */
const normalizeProperty = (p: any): Property => {
    // Types (already done earlier, keeping here to be consistent)
    const type = pickFirstString(p.type, p.property_type_name, p.propertyType, p.property_type);
    const unitType = pickFirstString(p.unitType, p.unit_type, p.unitTypeName);
    const subtype = pickFirstString(p.subtype, p.property_subtype_name, p.propertySubtype);

    // Prefer explicit locationNormalized/location/city if present,
    // else map common backend aliases.
    let locationNormalized = pickFirstString(
        p.locationNormalized,
        p.location_normalized,
        p.normalized_location
    );

    let location = pickFirstString(
        p.location,
        p.location_name,
        p.locality,
        p.area,
        p.neighbourhood,
        p.address?.line1,
        p.address_line1
    );

    let city = pickFirstString(
        p.city,
        p.city_name,
        p.town,
        p.address?.city,
        p.address_city
    );

    // If nothing for locationNormalized, build from location+city
    if (!locationNormalized) {
        const primary = location || "";
        if (primary && city) {
            locationNormalized = `${primary}, ${city}`.replace(/\s{2,}/g, " ").trim();
        } else {
            locationNormalized = primary || city || "";
        }
    }

    // If city is empty but locationNormalized has a trailing city, extract it
    if (!city && locationNormalized) {
        const { primary, city: inferredCity } = splitPrimaryAndCity(locationNormalized);
        if (inferredCity) {
            city = inferredCity;
            if (!location) location = primary; // keep pure primary without city duplication
        }
    }

    // De-duplicate: if location includes city already, keep location as-is but ensure city is set
    if (location && city) {
        const l = location.toLowerCase();
        const c = city.toLowerCase();
        if (!l.includes(c)) {
            // keep both; computeLocationLine() will render properly
        }
    }

    // IDs/slugs/images
    const id = p.id ?? p.propertyId ?? p.property_id;
    const propertyId = p.propertyId ?? p.property_id ?? p.id;
    const slug = pickFirstString(p.slug, p.seo_slug);
    const images: string[] = Array.isArray(p.images)
        ? p.images
        : Array.isArray(p.photos)
            ? p.photos
            : [];

    return {
        ...p,
        id,
        propertyId,
        slug,
        type,
        unitType,
        subtype,
        location,
        locationNormalized,
        city,
        images,
    };
};

/** Location line: prefers normalized; avoids duplicating city */
const computeLocationLine = (p?: Property) => {
    const primaryRaw = p?.locationNormalized || p?.location || "";
    const cityRaw = p?.city || "";

    const primary = primaryRaw.trim();
    const city = cityRaw.trim();
    if (!primary && !city) return "";

    if (!primary) return city;
    if (!city) return primary;

    // if primary already contains city (case-insensitive), don't repeat
    if (primary.toLowerCase().includes(city.toLowerCase())) return primary;
    return `${primary}, ${city}`;
};

/* ---------- Mini Preview Card ---------- */
const CardPreview: React.FC<{
    p: Property | null;
    publicBaseUrl: string;
    includeKeys: Set<string>;
}> = ({ p, publicBaseUrl, includeKeys }) => {
    if (!p) return <div className="text-sm text-gray-500">Nothing selected.</div>;

    const images = p?.images || p?.photos || [];
    const mainImage =
        images[0] ||
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400";

    const price = p?.price ?? p?.budget;
    const sqft = p?.square_feet ?? p?.carpetArea;
    const psf = price && sqft ? Math.round(safeNumber(price) / Math.max(1, safeNumber(sqft))) : null;

    const idStr = p?.propertyId ?? p?.id;
    const title = getTypeUnitSubtypeTitle(p);
    const locationLine = computeLocationLine(p);

    const base = (publicBaseUrl || "").replace(/\/+$/, "");
    const deepUrl = includeKeys.has("propertyUrl")
        ? p?.slug
            ? `${base}/properties/${p.slug}`
            : idStr
                ? `${base}/properties/${idStr}`
                : ""
        : "";

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* header */}
            <div className="p-3 border-b bg-gray-50">
                <div className="font-semibold text-gray-900 text-sm">
                    {idStr ? `#${idStr} — ${title}` : title}
                </div>
                <div className="text-xs text-gray-600 mt-1">{locationLine || " - "}</div>
                {deepUrl && (
                    <div className="text-[11px] text-blue-600 mt-1 flex items-center gap-1 break-all">
                        <LinkIcon size={12} /> {deepUrl}
                    </div>
                )}
            </div>

            {/* image */}
            <img src={mainImage} alt="cover" className="w-full h-40 object-cover" />

            {/* price + stats */}
            <div className="p-3 border-t">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-[11px] text-gray-500">Property Price</div>
                        <div className="text-xl font-bold text-indigo-600">{formatCurrency(price)}</div>
                    </div>
                    {psf ? (
                        <div className="text-right">
                            <div className="text-[11px] text-gray-500">Per Sq Ft</div>
                            <div className="font-semibold">₹{psf.toLocaleString("en-IN")}</div>
                        </div>
                    ) : null}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="p-2 border rounded-lg flex items-center justify-between">
                        <span className="text-gray-500">Beds</span>
                        <span className="font-semibold">{displayOrDash(p?.bedrooms)}</span>
                    </div>
                    <div className="p-2 border rounded-lg flex items-center justify-between">
                        <span className="text-gray-500">Baths</span>
                        <span className="font-semibold">{displayOrDash(p?.bathrooms)}</span>
                    </div>
                    <div className="p-2 border rounded-lg flex items-center justify-between">
                        <span className="text-gray-500">Area</span>
                        <span className="font-semibold">
                            {displayOrDash(p?.square_feet || p?.carpetArea)} sq ft
                        </span>
                    </div>
                </div>

                {p?.description ? (
                    <div className="text-xs text-gray-700 mt-3 line-clamp-3">{p.description}</div>
                ) : null}

                {p?.amenities?.length ? (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {p.amenities.slice(0, 8).map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px]">
                                {a}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

/* ---------- Main Modal ---------- */
const PropertyBulkBrochureModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [allProps, setAllProps] = useState<Property[]>([]);
    const [query, setQuery] = useState("");
    const [openDrop, setOpenDrop] = useState(false);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Cover / TOC
    const [includeCover, setIncludeCover] = useState(true);
    const [includeTOC, setIncludeTOC] = useState(false);

    // Public base URL (for deep link in PDF)
    const [publicBaseUrl, setPublicBaseUrl] = useState("https://investordeal.in");

    // Include content checkboxes
    const [contentPickerOpen, setContentPickerOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<string[]>([
        "propertyType", // informational only now; title is fixed by type/unit/subtype
        "location",
        "mainImage",
        "price",
        "bedrooms",
        "bathrooms",
        "carpetArea",
        "description",
        "amenities",
        "agentInfo",
        "contactDetails",
        "propertyUrl",
    ]);

    const includeKeys = useMemo(() => new Set(selectedContent), [selectedContent]);

    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                setLoading(true);
                const res = await propertiesAPI.getProperties?.({ limit: 500 });
                let items: any[] = Array.isArray(res) ? res : res?.data || res?.items || [];

                // 🔧 Normalize backend → canonical fields (types + location/city)
                items = items.map(normalizeProperty);

                setAllProps(items);
            } catch (e: any) {
                console.error(e);
                toast.error("Failed to fetch properties");
            } finally {
                setLoading(false);
            }
        })();
    }, [isOpen]);

    // close dropdown on outside click
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDrop(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allProps;
        return allProps.filter((p) => {
            const hay = [
                p.type,
                p.unitType,
                p.subtype,
                p.locationNormalized,
                p.location,
                p.city,
                String(p.propertyId || p.id || ""),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return hay.includes(q);
        });
    }, [allProps, query]);

    const selectedList = useMemo(
        () => allProps.filter((p) => selectedIds.includes((p.id ?? p.propertyId) as any)),
        [allProps, selectedIds]
    );

    // keep preview index in range if selection changes
    useEffect(() => {
        if (previewIndex > 0 && previewIndex >= selectedList.length) {
            setPreviewIndex(Math.max(0, selectedList.length - 1));
        }
    }, [selectedList.length, previewIndex]);

    const currentPreview = selectedList[previewIndex] || null;

    const toggleId = (id: string | number | undefined) => {
        if (!id && id !== 0) return;
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const selectAllFiltered = () => {
        const ids = filtered.map((p) => p.id ?? p.propertyId).filter(Boolean) as (string | number)[];
        setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const clearSelected = () => setSelectedIds([]);

    const toggleContentKey = (k: string) => {
        setSelectedContent((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
    };

    const generateMerged = async () => {
        if (!selectedIds.length) return toast.warn("Select at least one property");
        try {
            setLoading(true);
            const payload = {
                ids: selectedIds,

                customizations: {
                    primaryColor: "#E6761D",
                    secondaryColor: "#0b3856",
                    fontStyle: "modern",
                    layout: "standard",
                    watermark: true,
                    selectedContent,
                },
                includeCover,
                includeTOC,
                publicBaseUrl,
                fileName: "multi-property-brochure.pdf",
            };

            const blob: Blob = await propertiesAPI.generateBrochuresBulkSinglePDF("bulk", payload);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "multi-property-brochure.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success("Merged brochure downloaded");
        } catch (e: any) {
            console.error(e);
            toast.error("Failed to generate merged brochure");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const includeOptions: { key: string; label: string }[] = [
        { key: "propertyType", label: "Show ‘type / unitType / subtype’ (title is fixed)" },
        { key: "location", label: "Location" },
        { key: "mainImage", label: "Main Image" },
        { key: "price", label: "Price & PSF" },
        { key: "bedrooms", label: "Bedrooms" },
        { key: "bathrooms", label: "Bathrooms" },
        { key: "parking", label: "Parking" },
        { key: "carpetArea", label: "Carpet Area" },
        { key: "description", label: "Description" },
        { key: "furnishing", label: "Furnishing" },
        { key: "possession", label: "Possession" },
        { key: "facing", label: "Facing" },
        { key: "builtYear", label: "Built Year" },
        { key: "floor", label: "Floor / Total Floors" },
        { key: "wing", label: "Wing" },
        { key: "unitNo", label: "Unit No" },
        { key: "amenities", label: "Amenities" },
        { key: "furnishingItems", label: "Furnishing Items" },
        { key: "nearbyPlaces", label: "Nearby Places" },
        { key: "aiScore", label: "AI Score" },
        { key: "priceGrowth", label: "Price Growth" },
        { key: "investmentGrade", label: "Investment Grade" },
        // { key: "views", label: "Views count" },
        // { key: "listedDays", label: "Days Listed" },
        { key: "agentInfo", label: "Agent Name" },
        { key: "contactDetails", label: "Agent Phone" },
        { key: "propertyUrl", label: "Property URL (deep link)" },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="p-5 border-b bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Bulk Brochure (Select + Preview)</h2>
                        <p className="text-sm text-gray-600">Choose multiple properties and preview before generating one PDF.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-white hover:bg-gray-50">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {/* Left side */}
                    <div className="p-5 border-r overflow-y-auto">
                        {/* Properties dropdown */}
                        <div className="mb-4">
                            <div className="text-sm font-semibold mb-2">Select Properties</div>
                            <div ref={dropdownRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenDrop((s) => !s)}
                                    className="w-full border rounded-lg px-3 py-2 flex items-center justify-between hover:bg-gray-50"
                                >
                                    <span className="text-sm text-gray-700">
                                        {selectedIds.length ? `${selectedIds.length} selected` : "Choose properties"}
                                    </span>
                                    {openDrop ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {openDrop && (
                                    <div className="absolute z-10 mt-2 w-full bg-white rounded-xl border shadow-2xl">
                                        {/* Search */}
                                        <div className="p-2 border-b bg-gray-50">
                                            <div className="flex items-center gap-2 bg-white border rounded-lg px-2">
                                                <Search size={14} className="text-gray-400" />
                                                <input
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    placeholder="Search type, unit, subtype, city…"
                                                    className="w-full text-sm py-2 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={selectAllFiltered}
                                                    className="text-xs px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                                                    type="button"
                                                >
                                                    Select All (filtered)
                                                </button>
                                                <button
                                                    onClick={clearSelected}
                                                    className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                                                    type="button"
                                                >
                                                    Clear
                                                </button>
                                                <span className="text-xs text-gray-600 ml-auto">{filtered.length} results</span>
                                            </div>
                                        </div>

                                        {/* List */}
                                        <div className="max-h-72 overflow-auto">
                                            {loading ? (
                                                <div className="p-4 text-sm text-gray-600">Loading…</div>
                                            ) : filtered.length === 0 ? (
                                                <div className="p-4 text-sm text-gray-500">No properties found.</div>
                                            ) : (
                                                filtered.map((p) => {
                                                    const id = p.id ?? p.propertyId;
                                                    const checked = selectedIds.includes(id as any);
                                                    const labelTitle = getTypeUnitSubtypeTitle(p);
                                                    const label = (id ? `#${id} — ` : "") + (labelTitle || "Property");
                                                    const sub = computeLocationLine(p);
                                                    return (
                                                        <label
                                                            key={String(id)}
                                                            className={`flex items-start gap-3 p-3 cursor-pointer border-b last:border-b-0 ${checked ? "bg-purple-50" : "hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            <input type="checkbox" className="mt-1" checked={checked} onChange={() => toggleId(id!)} />
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-gray-900">{label}</div>
                                                                <div className="text-xs text-gray-600">{sub}</div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    const idx = selectedList.findIndex((sp) => (sp.id ?? sp.propertyId) === id);
                                                                    setPreviewIndex(Math.max(0, idx === -1 ? 0 : idx));
                                                                }}
                                                                className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-white"
                                                                title="Preview"
                                                            >
                                                                <Eye size={14} />
                                                                Preview
                                                            </button>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {/* Done */}
                                        <div className="p-2 border-t bg-gray-50 text-right">
                                            <button
                                                onClick={() => setOpenDrop(false)}
                                                className="text-sm px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Include content (checkbox dropdown) */}
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setContentPickerOpen((s) => !s)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                            >
                                <SlidersHorizontal size={16} />
                                Include in PDF
                                {contentPickerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {contentPickerOpen && (
                                <div className="mt-2 p-3 rounded-xl border bg-white grid grid-cols-2 gap-2 max-h-64 overflow-auto">
                                    {includeOptions.map((opt) => (
                                        <label key={opt.key} className="text-sm flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={includeKeys.has(opt.key)}
                                                onChange={() => toggleContentKey(opt.key)}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Public Base URL */}
                        <div className="mt-6">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <LinkIcon size={16} /> Public Base URL
                            </label>
                            <input
                                value={publicBaseUrl}
                                onChange={(e) => setPublicBaseUrl(e.target.value)}
                                placeholder="https://investordeal.in"
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">
                                Used to build a clickable property URL in the PDF (e.g., /properties/:slug or /properties/:id).
                            </p>
                        </div>

                        {/* Generate */}
                        <div className="mt-6">
                            <button
                                onClick={generateMerged}
                                disabled={loading || selectedIds.length === 0}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 rounded-full border-b-2 border-white" />
                                        Preparing…
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        Generate One PDF ({selectedIds.length})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="p-5 overflow-y-auto">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {selectedList.length ? `Previewing ${previewIndex + 1} of ${selectedList.length}` : "No selection"}
                            </div>
                            {selectedList.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="px-2 py-1 rounded border text-sm"
                                        onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                                        disabled={previewIndex === 0}
                                    >
                                        Prev
                                    </button>
                                    <button
                                        className="px-2 py-1 rounded border text-sm"
                                        onClick={() => setPreviewIndex((i) => Math.min(selectedList.length - 1, i + 1))}
                                        disabled={previewIndex >= selectedList.length - 1}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>

                        <CardPreview p={currentPreview} publicBaseUrl={publicBaseUrl} includeKeys={includeKeys} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyBulkBrochureModal;
