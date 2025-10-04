import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Search, X, Building, MapPin, Home, Wifi, Dumbbell, Shield, Waves, TreePine, Users, BedDouble, Bath, Grid
} from 'lucide-react';
import propertiesAPI from '@/lib/propertiesAPI';

/* =================== Types =================== */
type PropertyType = {
  // canonical
  id?: string | number;
  title?: string;            // derived: society/unit/city
  address?: string;          // address, location_name + city_name
  type?: string;             // property_type_name / property_subtype_name / unit_type
  area?: string | number;    // main display = carpet_area
  floor?: string;
  facing?: string;
  price?: string | number;   // main display = final_price || budget
  status?: string;
  developer?: string;
  society?: string;
  parking?: string;
  amenities?: string[];
  image?: string;

  // raw (your schema)
  seller_name?: string;
  seller_id?: string | number;
  lead_id?: string | number;
  assigned_to?: string | number;
  property_type_name?: string;
  property_subtype_name?: string;
  unit_type?: string;
  wing?: string;
  unit_no?: string | number;
  furnishing?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  parking_type?: string;
  parking_qty?: string | number;
  city_name?: string;
  location_name?: string;
  society_name?: string;
  floor_raw?: string | number;
  total_floors?: string | number;
  carpet_area?: string | number;
  builtup_area?: string | number;
  budget?: string | number;
  price_type?: string;
  final_price?: string | number;
  status_raw?: string;
  lead_source?: string;
  possession_month?: string | number;
  possession_year?: string | number;
  purchase_month?: string | number;
  purchase_year?: string | number;
  selling_rights?: string;
  ownership_doc_path?: string;
  photos?: string[]; // normalized
  furnishing_items?: string[]; // normalized
  nearby_places?: string[]; // normalized
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_public?: number | boolean;
  publication_date?: string;
  created_by?: string | number;
  updated_by?: string | number;
  public_views?: number;
  public_inquiries?: number;
  slug?: string;

  [k: string]: any;
};

type Props = {
  onSelect: (p: PropertyType) => void;
  onClose: () => void;
  title?: string;
  sellerId?: string | number;
  prefetchedItems?: PropertyType[];
};

/* =================== Helpers =================== */
function normalizeList<T = any>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.rows)) return res.rows;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

/** Strict seller match with string/number guard */
const matchesSeller = (it: any, sellerId?: string | number) => {
  if (!sellerId) return true;
  const S = String(sellerId);
  const cand = [it.seller_id, it?.seller?.id].map((v) =>
    v == null ? undefined : String(v)
  );
  return cand.some((v) => v === S);
};

const toInt = (v: any) => {
  const n = Number(String(v).replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

const parseCSVorArray = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map((s) => String(s).trim());
  if (typeof val === 'string') {
    try {
      const j = JSON.parse(val);
      if (Array.isArray(j)) return j.filter(Boolean).map((s) => String(s).trim());
    } catch {}
    return val
      .split(/[;,]+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const firstPhoto = (photos: string[]): string | undefined => {
  if (!photos?.length) return undefined;
  return photos.find(Boolean);
};

const inr = (v?: any) => {
  const n = toInt(v);
  if (n == null) return '';
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
};

function composeTitle(it: any) {
  const bits = [
    it?.society_name,
    [it?.wing, it?.unit_no].filter(Boolean).join('-') || undefined,
    it?.city_name,
  ].filter(Boolean);
  return bits.join(' • ') || 'Property';
}

function composeType(it: any) {
  return (
    it?.property_subtype_name ||
    it?.property_type_name ||
    it?.unit_type ||
    it?.type ||
    'Apartment'
  );
}

function composeAddress(it: any) {
  const bits = [it?.address, it?.location_name, it?.city_name]
    .filter(Boolean)
    .map((s) => String(s));
  return Array.from(new Set(bits)).join(', ');
}

function statusLabel(it: any) {
  return it?.status || it?.status_raw || '—';
}

function normalizeProperty(it: any): PropertyType {
  const amenities = parseCSVorArray(it?.amenities);
  const furnishing_items = parseCSVorArray(it?.furnishing_items);
  const nearby_places = parseCSVorArray(it?.nearby_places);
  const photos = parseCSVorArray(it?.photos);

  const price = it?.final_price ?? it?.budget ?? it?.price;
  const areaCarpet = it?.carpet_area ?? it?.area ?? it?.carpet;
  const areaBuilt = it?.builtup_area ?? it?.builtup ?? it?.super_builtup;

  return {
    // canonical
    id: it.id ?? it.property_id ?? it._id,
    title: composeTitle(it),
    address: composeAddress(it),
    type: composeType(it),
    area: areaCarpet,
    floor: it?.floor ?? it?.floor_raw ?? '',
    facing: it?.facing ?? '',
    price,
    status: statusLabel(it),
    developer: it?.developer ?? it?.builder ?? '',
    society: it?.society_name ?? it?.society ?? it?.project ?? '',
    parking:
      [it?.parking_type, it?.parking_qty ? `×${it.parking_qty}` : undefined]
        .filter(Boolean)
        .join(' ') || '',
    amenities,
    image: it?.image ?? it?.cover_image ?? firstPhoto(photos),

    // raw passthrough / normalized
    seller_name: it?.seller_name,
    seller_id: it?.seller_id ?? it?.seller?.id,
    lead_id: it?.lead_id,
    assigned_to: it?.assigned_to,
    property_type_name: it?.property_type_name,
    property_subtype_name: it?.property_subtype_name,
    unit_type: it?.unit_type,
    wing: it?.wing,
    unit_no: it?.unit_no,
    furnishing: it?.furnishing,
    bedrooms: it?.bedrooms,
    bathrooms: it?.bathrooms,
    parking_type: it?.parking_type,
    parking_qty: it?.parking_qty,
    city_name: it?.city_name,
    location_name: it?.location_name,
    society_name: it?.society_name,
    floor_raw: it?.floor ?? it?.floor_raw,
    total_floors: it?.total_floors,
    carpet_area: areaCarpet,
    builtup_area: areaBuilt,
    budget: it?.budget,
    price_type: it?.price_type,
    final_price: it?.final_price,
    status_raw: it?.status,
    lead_source: it?.lead_source,
    possession_month: it?.possession_month,
    possession_year: it?.possession_year,
    purchase_month: it?.purchase_month,
    purchase_year: it?.purchase_year,
    selling_rights: it?.selling_rights,
    ownership_doc_path: it?.ownership_doc_path,
    photos,
    furnishing_items,
    nearby_places,
    description: it?.description,
    created_at: it?.created_at,
    updated_at: it?.updated_at,
    is_public: it?.is_public,
    publication_date: it?.publication_date,
    created_by: it?.created_by,
    updated_by: it?.updated_by,
    public_views: it?.public_views,
    public_inquiries: it?.public_inquiries,
    slug: it?.slug,

    // keep the whole record too
    ...it,
  };
}

/* =================== Component =================== */
const PropertySelector: React.FC<Props> = ({
  onSelect,
  onClose,
  title = 'Select Property',
  sellerId,
  prefetchedItems,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      if (prefetchedItems && prefetchedItems.length) {
        const pre = prefetchedItems.map(normalizeProperty);
        const filteredPre = sellerId ? pre.filter((p) => matchesSeller(p, sellerId)) : pre;
        setItems(filteredPre);
        return;
      }

      let res: any;
      if (sellerId && typeof (propertiesAPI as any).getBySellerId === 'function') {
        res = await (propertiesAPI as any).getBySellerId(sellerId);
      } else if (typeof (propertiesAPI as any).getProperties === 'function') {
        res = await (propertiesAPI as any).getProperties({ seller_id: sellerId });
      } else if (typeof (propertiesAPI as any).getAll === 'function') {
        res = await (propertiesAPI as any).getAll({ seller_id: sellerId });
      } else {
        throw new Error('propertiesAPI method not available');
      }
      const list = normalizeList(res).map(normalizeProperty);
      const filteredBySeller = sellerId ? list.filter((p) => matchesSeller(p, sellerId)) : list;
      setItems(filteredBySeller);
    } catch (e: any) {
      console.error('Failed to load properties:', e);
      setErr('Failed to load properties');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [prefetchedItems, sellerId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const hay = [
        p.title, p.address, p.type, p.id,
        p.city_name, p.location_name, p.society_name, p.wing, p.unit_no, p.slug,
        p.seller_name, p.status, p.price_type
      ].map((x) => (x == null ? '' : String(x).toLowerCase()));
      return hay.some((s) => s.includes(q));
    });
  }, [items, searchTerm]);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'swimming pool': return <Waves className="text-blue-500" size={12} />;
      case 'gym': return <Dumbbell className="text-red-500" size={12} />;
      case 'security': return <Shield className="text-green-500" size={12} />;
      case 'garden':
      case 'private garden': return <TreePine className="text-green-600" size={12} />;
      case 'kids play area': return <Users className="text-purple-500" size={12} />;
      case 'high speed internet':
      case 'internet': return <Wifi className="text-blue-600" size={12} />;
      default: return <Home className="text-gray-500" size={12} />;
    }
  };

  const getPropertyTypeIcon = (type?: string) => {
    const t = String(type ?? '').toLowerCase();
    if (t.includes('villa')) return <Home className="text-green-600" size={20} />;
    if (t.includes('penthouse')) return <Building className="text-purple-600" size={20} />;
    if (t.includes('commercial')) return <Building className="text-blue-600" size={20} />;
    return <Building className="text-orange-600" size={20} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-1 text-sm">
                {sellerId ? 'Showing properties for the selected seller' : 'Choose from property listings'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow"
              aria-label="Close property selector"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by title, address, type, ID, city, society, wing/unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          {loading && <div className="mt-2 text-gray-500 text-xs">Loading properties…</div>}
          {!!err && <div className="mt-2 text-red-600 text-xs">{err}</div>}
        </div>

        {/* Property List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid gap-4">
            {filtered.map((p) => (
              <div
                key={String(p.id)}
                onClick={() => onSelect(p)}
                className="bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 shadow hover:shadow-md group"
              >
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={p.image || 'https://via.placeholder.com/120x90.png?text=Property'}
                        alt={p.title}
                        className="w-28 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getPropertyTypeIcon(p.type)}
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {p.title}
                            </h3>
                            {p.id && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {p.id}
                              </span>
                            )}
                            {/* Unit badge */}
                            {(p.wing || p.unit_no) && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                {(p.wing ? `${p.wing}-` : '')}{p.unit_no ?? ''}
                              </span>
                            )}
                          </div>

                          {/* Address line */}
                          {(p.address ?? '') && (
                            <div className="flex items-center space-x-1 text-gray-600">
                              <MapPin size={12} />
                              <span className="text-xs">{p.address}</span>
                            </div>
                          )}

                          {/* Seller tiny tag if present */}
                          {p.seller_name && (
                            <div className="mt-1 text-[11px] text-gray-500">
                              Seller: <span className="font-medium text-gray-700">{p.seller_name}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          {/* Price */}
                          {p.price !== undefined && p.price !== '' && (
                            <div className="text-lg font-bold text-green-600 mb-0.5">
                              ₹{inr(p.price)}{p.price_type ? ` • ${p.price_type}` : ''}
                            </div>
                          )}
                          <div
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              (p.status ?? '').toLowerCase().includes('ready')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {p.status ?? '—'}
                          </div>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2 text-xs">
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-[10px] text-gray-500 uppercase mb-0.5">Type</div>
                          <div className="font-medium text-gray-900">{p.type ?? '—'}</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-[10px] text-gray-500 uppercase mb-0.5">Carpet</div>
                          <div className="font-medium text-gray-900">
                            {p.carpet_area ? `${p.carpet_area} sq ft` : '—'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-[10px] text-gray-500 uppercase mb-0.5">Built-up</div>
                          <div className="font-medium text-gray-900">
                            {p.builtup_area ? `${p.builtup_area} sq ft` : '—'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-[10px] text-gray-500 uppercase mb-0.5">Beds/Baths</div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1"><BedDouble size={12}/> {p.bedrooms ?? '—'}</span>
                            <span className="inline-flex items-center gap-1"><Bath size={12}/> {p.bathrooms ?? '—'}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-[10px] text-gray-500 uppercase mb-0.5">Floor</div>
                          <div className="font-medium text-gray-900">
                            {p.floor_raw ?? p.floor ?? '—'}{p.total_floors ? ` / ${p.total_floors}` : ''}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-[10px] text-gray-500 uppercase mb-0.5">Facing</div>
                          <div className="font-medium text-gray-900">{p.facing ?? '—'}</div>
                        </div>
                      </div>

                      {/* Parking & Furnishing chips */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {p.parking && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[11px]">
                            Parking: {p.parking}
                          </span>
                        )}
                        {p.furnishing && (
                          <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[11px]">
                            {p.furnishing}
                          </span>
                        )}
                        {p.society_name && (
                          <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full text-[11px]">
                            {p.society_name}
                          </span>
                        )}
                      </div>

                      {/* Amenities */}
                      {!!(p.amenities?.length) && (
                        <div className="mb-2">
                          <div className="text-[10px] text-gray-500 uppercase mb-1">Amenities</div>
                          <div className="flex flex-wrap gap-1">
                            {p.amenities.slice(0, 5).map((amenity, idx) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs"
                              >
                                {getAmenityIcon(amenity)}
                                <span>{amenity}</span>
                              </div>
                            ))}
                            {p.amenities.length > 5 && (
                              <div className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{p.amenities.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Select */}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(p);
                          }}
                          className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-medium shadow"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-sm">
              <Building className="mx-auto text-gray-300 mb-3" size={40} />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertySelector;
