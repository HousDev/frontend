

// src/components/documents/PropertyBulkBrochureModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  SlidersHorizontal,
  Link as LinkIcon,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  CheckCircle,
  Building,
  Car,
  Hash,
  Layers,
  DollarSign,
  Tag,
  User,
  Phone,
  Globe,
  FileText,
  Settings
} from "lucide-react";
import { toast } from "react-toastify";
import propertiesAPI from "@/lib/propertiesAPI";
import systemSettingsAPI from "@/lib/systemSettingsAPI";

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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
  final_price?: number | string | null;
  price_type?: string | null;
  budget?: number | string | null;
  type?: string;
  unitType?: string;
  subtype?: string;
  unit_type?: string | null;
  property_type_name?: string | null;
  property_subtype_name?: string | null;
  carpet_area?: number | string;
  square_feet?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  floor?: number | string | null;
  total_floors?: number | string | null;
  parking_type?: string | null;
  parking_qty?: number | string | null;
  unit_no?: string | null;
  area?: number | string | null;
  location_name?: string | null;
  photos?: string[];
  images?: string[];
  description?: string;
  amenities?: string[];
  furnishing?: string | null;
  furnishingItems?: string[];
  agent?: { name?: string; phone?: string } | null;
  raw?: any;
};

type Props = { isOpen: boolean; onClose: () => void };

/* ---------- Money helpers ---------- */
const parseINR = (val?: number | string | null): number => {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return isFinite(val) ? val : 0;
  let s = String(val).trim().toLowerCase();
  if (!s) return 0;
  let mult = 1;
  if (/(^|[^a-z])cr\.?(ore(s)?)?($|[^a-z])/.test(s)) mult = 1e7;
  else if (/(^|[^a-z])(l|lac|lakh|lakhs)($|[^a-z])/.test(s)) mult = 1e5;
  else if (/(^|[^a-z])(k|thousand)($|[^a-z])/.test(s)) mult = 1e3;
  const m = s.replace(/[₹,\s]/g, "").match(/-?\d+(\.\d+)?/);
  const num = m ? parseFloat(m[0]) : NaN;
  if (!isFinite(num)) return 0;
  const neg = /^\s*-/.test(String(val));
  return (neg ? -1 : 1) * num * mult;
};

const multiplierFromUnit = (u?: string | null): number => {
  if (!u) return 1;
  const s = String(u).trim().toLowerCase();
  if (s === "cr" || s.startsWith("crore")) return 1e7;
  if (s === "l" || s === "lac" || s.startsWith("lakh")) return 1e5;
  if (s === "k" || s.startsWith("thousand")) return 1e3;
  return 1;
};

const toRupees = (price?: number | string | null, price_type?: string | null): number => {
  const parsed = parseINR(price);
  const looksBareNumber =
    typeof price === "number" ||
    (typeof price === "string" && /^[\s-]*\d+(\.\d+)?\s*$/.test(price));
  if (looksBareNumber && parsed < 1e5 && price_type) {
    const base = typeof price === "number" ? price : parseFloat(String(price));
    const mult = multiplierFromUnit(price_type);
    if (isFinite(base) && mult > 1) return base * mult;
  }
  return parsed;
};

const formatCurrency = (amount?: number | string | null) => {
  const n = parseINR(amount);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const trim0 = (x: number) => x.toFixed(1).replace(/\.0$/, "");
  if (abs >= 1e7) return `${sign}₹${trim0(abs / 1e7)} Cr`;
  if (abs >= 1e5) return `${sign}₹${trim0(abs / 1e5)} L`;
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
};

const displayOrDash = (val: any) =>
  val === null || val === undefined || (typeof val === "string" && val.trim() === "") ? "—" : val;

const getTypeUnitSubtypeTitle = (p?: Property) => {
  const parts = [p?.type, p?.unitType, p?.subtype]
    .map((s) => (s ?? "").toString().trim())
    .filter(Boolean);
  return parts.join(" ").replace(/\s{2,}/g, " ").trim() || "Property";
};

const pickFirstString = (...vals: any[]) =>
  vals
    .map((v) => (typeof v === "string" ? v : v == null ? "" : String(v)))
    .map((s) => s.trim())
    .find((s) => !!s) || "";

const splitPrimaryAndCity = (s: string) => {
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const city = parts[parts.length - 1];
    const primary = parts.slice(0, parts.length - 1).join(", ");
    return { primary, city };
  }
  return { primary: s.trim(), city: "" };
};

const normalizeProperty = (p: any): Property => {
  const type = pickFirstString(p.type, p.property_type_name, p.propertyType, p.property_type);
  const unitType = pickFirstString(p.unitType, p.unit_type, p.unitTypeName);
  const subtype = pickFirstString(p.subtype, p.property_subtype_name, p.propertySubtype);
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
  let city = pickFirstString(p.city, p.city_name, p.town, p.address?.city, p.address_city);
  if (!locationNormalized) {
    const primary = location || "";
    if (primary && city) {
      locationNormalized = `${primary}, ${city}`.replace(/\s{2,}/g, " ").trim();
    } else {
      locationNormalized = primary || city || "";
    }
  }
  if (!city && locationNormalized) {
    const { primary, city: inferredCity } = splitPrimaryAndCity(locationNormalized);
    if (inferredCity) {
      city = inferredCity;
      if (!location) location = primary;
    }
  }
  const id = p.id ?? p.propertyId ?? p.property_id;
  const propertyId = p.propertyId ?? p.property_id ?? p.id;
  const slug = pickFirstString(p.slug, p.seo_slug);
  const images: string[] = Array.isArray(p.images)
    ? p.images
    : Array.isArray(p.photos)
    ? p.photos
    : [];
  const furnishingItems: string[] = Array.isArray(p.furnishingItems)
    ? p.furnishingItems
    : Array.isArray(p.furnishing_items)
    ? p.furnishing_items
    : [];
  const furnishing: string | null =
    pickFirstString(p.furnishing, p.furnishing_level, p.furnishing_status) || null;
  return {
    ...p,
    id,
    propertyId,
    slug,
    type,
    unitType,
    subtype,
    unit_type: p.unit_type ?? null,
    property_type_name: p.property_type_name ?? null,
    property_subtype_name: p.property_subtype_name ?? null,
    price: p.price ?? p.final_price ?? p.budget ?? null,
    final_price: p.final_price ?? null,
    price_type: p.price_type ?? null,
    location,
    locationNormalized,
    location_name: p.location_name ?? null,
    city,
    carpet_area: p.carpet_area ?? p.square_feet ?? p.carpetArea ?? null,
    square_feet: p.square_feet ?? null,
    area: p.area ?? null,
    floor: p.floor ?? null,
    total_floors: p.total_floors ?? p.totalFloors ?? null,
    parking_type: p.parking_type ?? p.parking ?? null,
    parking_qty: p.parking_qty ?? null,
    unit_no: p.unit_no ?? p.unitNo ?? null,
    images,
    furnishing,
    furnishingItems,
    amenities: Array.isArray(p.amenities) ? p.amenities : p.amenities ? [p.amenities] : [],
    agent:
      p.agent ?? { name: p.agent_name ?? p.seller_name ?? "", phone: p.agent_phone ?? p.seller_phone ?? "" },
  };
};

const computeLocationLine = (p?: Property) => {
  const primaryRaw = p?.locationNormalized || p?.location || "";
  const cityRaw = p?.city || "";
  const primary = primaryRaw.trim();
  const city = cityRaw.trim();
  if (!primary && !city) return "";
  if (!primary) return city;
  if (!city) return primary;
  if (primary.toLowerCase().includes(city.toLowerCase())) return primary;
  return `${primary}, ${city}`;
};

/* ---------- Mini Preview Card ---------- */
const CardPreview: React.FC<{
  p: Property | null;
  publicBaseUrl: string;
  includeKeys: Set<string>;
  companyLogo: string;
}> = ({ p, publicBaseUrl, includeKeys }) => {
  if (!p) return <div className="text-sm text-gray-500 text-center py-8">No property selected</div>;

  const images = p?.images || p?.photos || [];
  const mainImage =
    images[0] ||
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400";

  const rawPrice = p?.price ?? p?.final_price ?? p?.budget;
  const priceRupees = toRupees(rawPrice, p?.price_type);
  const sqft = p?.square_feet ?? p?.carpet_area;
  const sqftNum = parseINR(sqft);
  const psf = priceRupees && sqftNum ? Math.round(priceRupees / Math.max(1, sqftNum)) : null;

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

  const detailRows: Array<{ k: string; v: any }> = [];
  if (includeKeys.has("parking_type") && p.parking_type) detailRows.push({ k: "Parking Type", v: p.parking_type });
  if (includeKeys.has("parking_qty") && (p.parking_qty || p.parking_qty === 0)) detailRows.push({ k: "Parking Qty", v: p.parking_qty });
  if (includeKeys.has("unit_no") && p.unit_no) detailRows.push({ k: "Unit No", v: p.unit_no });
  if (includeKeys.has("area") && (p.area || p.area === 0)) detailRows.push({ k: "Area", v: p.area });
  if (includeKeys.has("location_name") && p.location_name) detailRows.push({ k: "Location Name", v: p.location_name });
  if (includeKeys.has("carpet_area") && (p.carpet_area || p.carpet_area === 0)) detailRows.push({ k: "Carpet Area", v: `${p.carpet_area} sq ft` });
  if (includeKeys.has("property_type_name") && p.property_type_name) detailRows.push({ k: "Property Type", v: p.property_type_name });
  if (includeKeys.has("property_subtype_name") && p.property_subtype_name) detailRows.push({ k: "Property Subtype", v: p.property_subtype_name });
  if (includeKeys.has("unit_type") && (p.unit_type || p.unitType)) detailRows.push({ k: "Unit Type", v: p.unit_type || p.unitType });
  if (includeKeys.has("floor") && (p.floor || p.floor === 0)) detailRows.push({ k: "Floor", v: p.floor });
  if (includeKeys.has("total_floors") && (p.total_floors || p.total_floors === 0)) detailRows.push({ k: "Total Floors", v: p.total_floors });
  if (includeKeys.has("price_type") && p.price_type) detailRows.push({ k: "Price Type", v: p.price_type });
  if (includeKeys.has("final_price") && (p.final_price || p.final_price === 0)) detailRows.push({ k: "Final Price", v: formatCurrency(toRupees(p.final_price, p.price_type)) });

  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
      {/* header */}
      <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
        <div className="font-semibold text-sm" style={{ color: N }}>
          {idStr ? `#${idStr} — ${title}` : title}
        </div>
        <div className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: MU }}>
          <MapPin size={10} style={{ color: O }} />
          {locationLine || " - "}
        </div>
        {deepUrl && (
          <div className="text-[10px] mt-1 flex items-center gap-1 break-all" style={{ color: O }}>
            <LinkIcon size={10} /> {deepUrl}
          </div>
        )}
      </div>

      {/* image with fixed button positioning */}
      <div className="relative">
        <img src={mainImage} alt="cover" className="w-full h-40 object-cover" />
        {includeKeys.has("propertyUrl") && deepUrl && (
          <div className="absolute bottom-2 right-2">
            <a
              href={deepUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded text-[10px] text-white flex items-center gap-1 shadow-md hover:opacity-90"
              style={{ background: N }}
            >
              <LinkIcon size={10} /> View
            </a>
          </div>
        )}
      </div>

      {/* price + stats */}
      <div className="p-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[9px]" style={{ color: MU }}>Property Price</div>
            <div className="text-lg font-bold" style={{ color: O }}>{formatCurrency(priceRupees)}</div>
          </div>
          {psf ? (
            <div className="text-right">
              <div className="text-[9px]" style={{ color: MU }}>Per Sq Ft</div>
              <div className="text-sm font-semibold" style={{ color: N }}>₹{psf.toLocaleString("en-IN")}</div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-lg p-1.5 text-center" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
            <BedDouble size={12} style={{ color: O }} className="mx-auto mb-0.5" />
            <div className="text-[9px]" style={{ color: MU }}>Beds</div>
            <div className="text-[11px] font-semibold" style={{ color: N }}>{displayOrDash(p?.bedrooms)}</div>
          </div>
          <div className="rounded-lg p-1.5 text-center" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
            <Bath size={12} style={{ color: O }} className="mx-auto mb-0.5" />
            <div className="text-[9px]" style={{ color: MU }}>Baths</div>
            <div className="text-[11px] font-semibold" style={{ color: N }}>{displayOrDash(p?.bathrooms)}</div>
          </div>
          <div className="rounded-lg p-1.5 text-center" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
            <Ruler size={12} style={{ color: O }} className="mx-auto mb-0.5" />
            <div className="text-[9px]" style={{ color: MU }}>Area</div>
            <div className="text-[11px] font-semibold" style={{ color: N }}>{displayOrDash(p?.square_feet || p?.carpet_area)} sq ft</div>
          </div>
        </div>

        {p?.description ? (
          <div className="text-[10px] mt-3 leading-relaxed line-clamp-3" style={{ color: MU }}>{p.description}</div>
        ) : null}

        {includeKeys.has("furnishing") && p?.furnishing ? (
          <div className="mt-3">
            <div className="text-[9px] font-semibold mb-1" style={{ color: N }}>Furnishing</div>
            <div className="text-[10px]" style={{ color: MU }}>{p.furnishing}</div>
          </div>
        ) : null}

        {includeKeys.has("furnishingItems") && p?.furnishingItems?.length ? (
          <div className="mt-3">
            <div className="text-[9px] font-semibold mb-1" style={{ color: N }}>Furnishing Items ({p.furnishingItems.length})</div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {p.furnishingItems.map((a, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: `${O}10`, color: O }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {includeKeys.has("amenities") && p?.amenities?.length ? (
          <div className="mt-3">
            <div className="text-[9px] font-semibold mb-1" style={{ color: N }}>Amenities ({p.amenities.length})</div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {p.amenities.map((a, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: `${N}10`, color: N }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {detailRows.length ? (
          <div className="mt-3">
            <div className="text-[9px] font-semibold mb-1" style={{ color: N }}>Property Details</div>
            <div className="grid grid-cols-2 gap-1.5">
              {detailRows.slice(0, 6).map((row, idx) => (
                <div key={idx} className="text-[9px] rounded-md px-1.5 py-1 flex items-center justify-between" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <span style={{ color: MU }}>{row.k}</span>
                  <span className="font-semibold" style={{ color: N }}>{displayOrDash(row.v)}</span>
                </div>
              ))}
            </div>
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
  const [companyLogo, setCompanyLogo] = useState("");
  const [includeCover, setIncludeCover] = useState(true);
  const [includeTOC, setIncludeTOC] = useState(false);
  const [publicBaseUrl, setPublicBaseUrl] = useState("http://localhost:5173/");
  const [contentPickerOpen, setContentPickerOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string[]>([
    "propertyType", "location", "mainImage", "price", "bedrooms", "bathrooms",
    "carpet_area", "description", "amenities", "furnishing", "furnishingItems",
    "agentInfo", "contactDetails", "propertyUrl", "parking_type", "parking_qty",
    "unit_no", "area", "location_name", "property_type_name", "property_subtype_name",
    "unit_type", "floor", "total_floors", "price_type", "final_price",
  ]);

  const includeKeys = useMemo(() => new Set(selectedContent), [selectedContent]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await systemSettingsAPI.getSettings();
        const logo = settings?.data?.company_logo || settings?.company_logo || settings?.data?.logo || settings?.logo || "";
        setCompanyLogo(logo);
      } catch (err) {
        console.error("Error fetching system settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoading(true);
        const res = await propertiesAPI.getProperties?.({ limit: 500 });
        let items: any[] = Array.isArray(res) ? res : res?.data || res?.items || [];
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
        p.type, p.unitType, p.subtype, p.locationNormalized, p.location, p.city,
        p.location_name, p.unit_type, p.property_type_name, p.property_subtype_name,
        String(p.propertyId || p.id || ""), ...(p.furnishingItems || [])
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [allProps, query]);

  const selectedList = useMemo(() => allProps.filter((p) => selectedIds.includes((p.id ?? p.propertyId) as any)), [allProps, selectedIds]);

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
      const overrides = selectedList.map((p) => ({
        id: p.id ?? p.propertyId,
        furnishing: p.furnishing || null,
        furnishingItems: Array.isArray(p.furnishingItems) ? p.furnishingItems : [],
        parking_type: p.parking_type ?? null,
        parking_qty: p.parking_qty ?? null,
        unit_no: p.unit_no ?? null,
        area: p.area ?? null,
        location_name: p.location_name ?? null,
        carpet_area: p.carpet_area ?? null,
        property_type_name: p.property_type_name ?? null,
        property_subtype_name: p.property_subtype_name ?? null,
        unit_type: p.unit_type ?? null,
        floor: p.floor ?? null,
        total_floors: p.total_floors ?? null,
        price_type: p.price_type ?? null,
        final_price: p.final_price ?? null,
      }));
      const payload = {
        ids: selectedIds,
        customizations: { primaryColor: O, secondaryColor: N, fontStyle: "modern", layout: "standard", watermark: true, selectedContent, companyLogo },
        includeCover, includeTOC, publicBaseUrl, overrides, fileName: "multi-property-brochure.pdf",
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

  const includeOptions: { key: string; label: string }[] = [
    { key: "propertyType", label: "Property Type" },
    { key: "location", label: "Location" },
    { key: "mainImage", label: "Main Image" },
    { key: "price", label: "Price & PSF" },
    { key: "bedrooms", label: "Bedrooms" },
    { key: "bathrooms", label: "Bathrooms" },
    { key: "carpet_area", label: "Carpet Area" },
    { key: "description", label: "Description" },
    { key: "furnishing", label: "Furnishing" },
    { key: "amenities", label: "Amenities" },
    { key: "furnishingItems", label: "Furnishing Items" },
    { key: "agentInfo", label: "Executive Name" },
    { key: "contactDetails", label: "Executive Phone" },
    { key: "propertyUrl", label: "Property URL" },
    { key: "parking_type", label: "Parking Type" },
    { key: "parking_qty", label: "Parking Quantity" },
    { key: "unit_no", label: "Unit No" },
    { key: "area", label: "Area" },
    { key: "location_name", label: "Location Name" },
    { key: "property_type_name", label: "Property Type Name" },
    { key: "property_subtype_name", label: "Property Subtype Name" },
    { key: "unit_type", label: "Unit Type" },
    { key: "floor", label: "Floor" },
    { key: "total_floors", label: "Total Floors" },
    { key: "price_type", label: "Price Type" },
    { key: "final_price", label: "Final Price" },
  ];

  if (!isOpen) return null;

  // Using createPortal to render modal at body level with highest z-index
  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-2"
      style={{ 
        background: 'rgba(15,43,61,0.8)', 
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
  className="bg-white rounded-xl shadow-2xl w-full max-w-4xl min-h-[470px] max-h-[90vh] flex flex-col overflow-hidden"
  style={{ border: `1px solid ${BD}`, zIndex: 100000 }}
>
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: O }} />
            <div>
              <h2 className="text-sm font-bold text-white">Bulk Brochure (Select + Preview)</h2>
              <p className="text-[9px] text-white/70">Choose multiple properties and preview before generating one PDF</p>
            </div>
          </div>
          {companyLogo && (
            <img src={companyLogo} alt="Logo" className="h-8 w-auto object-contain" />
          )}
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-0">
          
          {/* Left Panel */}
          <div className="lg:w-1/2 border-r overflow-y-auto p-3 space-y-3" style={{ borderColor: BD }}>
            {/* Properties Selection */}
            <div>
              <label className="block text-[10px] font-semibold mb-1" style={{ color: N }}>Select Properties</label>
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDrop((s) => !s)}
                  className="w-full px-2 py-1.5 text-[11px] border rounded-lg flex items-center justify-between transition-all hover:bg-gray-50"
                  style={{ borderColor: BD }}
                >
                  <span style={{ color: selectedIds.length ? N : MU }}>
                    {selectedIds.length ? `${selectedIds.length} selected` : "Choose properties"}
                  </span>
                  {openDrop ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {openDrop && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border shadow-xl overflow-hidden" style={{ borderColor: BD }}>
                    <div className="p-2 border-b" style={{ background: BG, borderColor: BD }}>
                      <div className="flex items-center gap-1.5 border rounded-lg px-2 py-1" style={{ borderColor: BD }}>
                        <Search size={12} style={{ color: MU }} />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search properties..."
                          className="w-full text-[11px] py-1 outline-none bg-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={selectAllFiltered} className="px-2 py-0.5 rounded text-[9px] text-white transition-all hover:opacity-90" style={{ background: O }}>Select All</button>
                        <button onClick={clearSelected} className="px-2 py-0.5 rounded text-[9px] transition-all" style={{ background: `${N}10`, color: N }}>Clear</button>
                        <span className="text-[9px] ml-auto" style={{ color: MU }}>{filtered.length} results</span>
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto">
                      {loading ? (
                        <div className="p-3 text-center"><div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mx-auto" style={{ borderColor: O }} /></div>
                      ) : filtered.length === 0 ? (
                        <div className="p-3 text-center text-[10px]" style={{ color: MU }}>No properties found</div>
                      ) : (
                        filtered.map((p) => {
                          const id = p.id ?? p.propertyId;
                          const checked = selectedIds.includes(id as any);
                          const labelTitle = getTypeUnitSubtypeTitle(p);
                          const label = (id ? `#${id} — ` : "") + (labelTitle || "Property");
                          const sub = computeLocationLine(p);
                          return (
                            <label key={String(id)} className={`flex items-start gap-2 p-2 border-b cursor-pointer transition-all ${checked ? 'bg-orange-50' : 'hover:bg-gray-50'}`} style={{ borderColor: BD }}>
                              <input type="checkbox" className="mt-0.5 w-3 h-3 rounded" style={{ accentColor: O }} checked={checked} onChange={() => toggleId(id!)} />
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-medium truncate" style={{ color: N }}>{label}</div>
                                <div className="text-[9px] truncate" style={{ color: MU }}>{sub}</div>
                              </div>
                              <button type="button" onClick={() => { const idx = selectedList.findIndex((sp) => (sp.id ?? sp.propertyId) === id); setPreviewIndex(idx === -1 ? 0 : idx); }} className="px-1.5 py-0.5 rounded text-[9px] border hover:bg-white" style={{ borderColor: BD }}><Eye size={10} /></button>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <div className="p-2 border-t text-right" style={{ borderColor: BD, background: BG }}>
                      <button onClick={() => setOpenDrop(false)} className="px-2 py-0.5 rounded text-[9px] text-white transition-all hover:opacity-90" style={{ background: O }}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Include Content */}
            <div>
              <button type="button" onClick={() => setContentPickerOpen((s) => !s)} className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] border rounded-lg transition-all hover:bg-gray-50" style={{ borderColor: BD }}>
                <SlidersHorizontal size={12} style={{ color: O }} /> Include in PDF {contentPickerOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
              {contentPickerOpen && (
                <div className="mt-2 p-2 rounded-lg border grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto" style={{ borderColor: BD, background: BG }}>
                  {includeOptions.map((opt) => (
                    <label key={opt.key} className="flex items-center gap-1.5 text-[9px]">
                      <input type="checkbox" checked={includeKeys.has(opt.key)} onChange={() => toggleContentKey(opt.key)} className="w-2.5 h-2.5 rounded" style={{ accentColor: O }} />
                      <span style={{ color: MU }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Public Base URL */}
            <div>
              <label className="block text-[9px] font-semibold mb-0.5 flex items-center gap-1" style={{ color: N }}><LinkIcon size={10} style={{ color: O }} /> Public Base URL</label>
              <input value={publicBaseUrl} onChange={(e) => setPublicBaseUrl(e.target.value)} className="w-full px-2 py-1 text-[10px] border rounded focus:outline-none focus:ring-1" style={{ borderColor: BD }} />
            </div>

            {/* Cover/TOC */}
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-[9px]"><input type="checkbox" checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} className="rounded w-2.5 h-2.5" style={{ accentColor: O }} /> Include Cover</label>
              <label className="flex items-center gap-1.5 text-[9px]"><input type="checkbox" checked={includeTOC} onChange={(e) => setIncludeTOC(e.target.checked)} className="rounded w-2.5 h-2.5" style={{ accentColor: O }} /> Include TOC</label>
            </div>

            {/* Generate Button */}
            <button onClick={generateMerged} disabled={loading || selectedIds.length === 0} className="w-full py-1.5 rounded-lg text-[10px] font-medium text-white flex items-center justify-center gap-1 transition-all hover:opacity-90 disabled:opacity-50" style={{ background: O }}>
              {loading ? <><div className="animate-spin rounded-full h-2.5 w-2.5 border-2 border-white border-t-transparent" /> Preparing...</> : <><Download size={12} /> Generate PDF ({selectedIds.length})</>}
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:w-1/2 overflow-y-auto p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px]" style={{ color: MU }}>{selectedList.length ? `Preview ${previewIndex + 1} of ${selectedList.length}` : "No selection"}</div>
              {selectedList.length > 1 && (
                <div className="flex gap-1.5">
                  <button onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))} disabled={previewIndex === 0} className="px-2 py-0.5 rounded border text-[9px] disabled:opacity-50" style={{ borderColor: BD }}>Prev</button>
                  <button onClick={() => setPreviewIndex(Math.min(selectedList.length - 1, previewIndex + 1))} disabled={previewIndex >= selectedList.length - 1} className="px-2 py-0.5 rounded border text-[9px] disabled:opacity-50" style={{ borderColor: BD }}>Next</button>
                </div>
              )}
            </div>
            <CardPreview p={currentPreview} publicBaseUrl={publicBaseUrl} includeKeys={includeKeys} companyLogo={companyLogo} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PropertyBulkBrochureModal;