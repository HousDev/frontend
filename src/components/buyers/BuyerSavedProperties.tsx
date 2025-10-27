import React, { useEffect, useState } from "react";
import { buyerSavedAPI, BuyerSavedWithProperty } from "@/lib/buyerSavedPropertiesAPI";
import {
  Heart,
  MapPin,
  IndianRupee,
  Trash2,
  Building,
  RefreshCcw,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

/* ───────────────────────── Helpers ───────────────────────── */
const toArray = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {}
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const firstImage = (p: any): string | null => {
  const candidates: Array<string | string[] | undefined> = [
    p?.thumbnail_url,
    p?.thumbnailUrl,
    p?.coverImage,
    p?.image,
    p?.images,
    p?.photo,
    p?.photoUrl,
    p?.photoUrls,
    p?.photos,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string") {
      const arr = toArray(c);
      if (arr.length) return arr[0];
      if (/^https?:\/\//i.test(c)) return c;
    } else if (Array.isArray(c)) {
      const arr = c.filter(Boolean).map(String);
      if (arr.length) return arr[0];
    }
  }
  return null;
};

const pickTitle = (p: any): string => {
  const unitType = (p?.unit_type_name ?? p?.unit_type ?? p?.unitType ?? "").toString().trim();
  const type = (p?.property_type_name ?? p?.property_type ?? p?.type ?? "").toString().trim();
  const subtype = (p?.property_subtype_name ?? p?.property_subtype ?? p?.subtype ?? "").toString().trim();
  const composed = [unitType, type || subtype].filter(Boolean).join(" ");
  return (p?.title || composed || "Untitled Property").toString();
};

const pickLocation = (p: any): string => {
  const locality = p?.location_name ?? p?.location ?? p?.area ?? p?.neighbourhood ?? p?.neighborhood ?? "";
  const city = p?.city_name ?? p?.city ?? "";
  const state = p?.state ?? "";
  return [locality, city, state].filter(Boolean).slice(0, 2).join(", ") || "Unknown location";
};

const pickPrice = (p: any): number | null => {
  const raw = p?.budget ?? p?.price ?? p?.amount ?? null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

const formatINR = (amount: number | null) => {
  if (!amount || amount <= 0) return "N/A";
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

/* ───────────────────────── Small UI bits ───────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
    <div className="h-44 w-full bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
      <div className="h-5 w-1/3 bg-gray-200 rounded" />
      <div className="h-9 w-full bg-gray-200 rounded" />
    </div>
  </div>
);

const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-3">
      <Bookmark size={22} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800">No saved properties yet</h3>
    <p className="text-gray-500 text-sm mt-1">Tap the heart on any property card to save it here.</p>
    <button
      onClick={onRefresh}
      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E6761D] text-white hover:bg-[#CC6A1A] transition"
    >
      <RefreshCcw size={16} /> Refresh
    </button>
  </div>
);

/* ───────────────────────── Component ───────────────────────── */
type Props = { buyerId: number };

const BuyerSavedProperties: React.FC<Props> = ({ buyerId }) => {
  const [loading, setLoading] = useState(true);
  const [savedProps, setSavedProps] = useState<BuyerSavedWithProperty[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await buyerSavedAPI.listByBuyer(buyerId, { includeProperty: true });

      const rows: BuyerSavedWithProperty[] = Array.isArray(res)
        ? (res as any)
        : Array.isArray((res as any)?.data)
        ? ((res as any).data as any)
        : [];

      setSavedProps(rows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load saved properties");
      setSavedProps([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (buyerId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerId]);

  const handleUnsave = async (propertyId: number) => {
    try {
      await buyerSavedAPI.toggle(buyerId, propertyId, "unsave");
      setSavedProps((prev) => prev.filter((p) => p.property_id !== propertyId)); // optimistic
      toast.success("Removed from saved list");
    } catch (err) {
      console.error(err);
      toast.error("Failed to unsave property");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  /* ───────── Loading state ───────── */
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-800">
            <Bookmark size={20} className="text-red-500" />
            <h2 className="text-xl font-semibold">Saved Properties</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ───────── Empty state ───────── */
  if (!savedProps.length) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-800">
            <Bookmark size={20} className="text-red-500" />
            <h2 className="text-xl font-semibold">Saved Properties</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-gray-50"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
        <EmptyState onRefresh={handleRefresh} />
      </div>
    );
  }

  /* ───────── List ───────── */
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-800">
          <Bookmark size={20} className="text-red-500" />
          <h2 className="text-xl font-semibold">Saved Properties</h2>
          <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {savedProps.length} saved
          </span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedProps.map((row) => {
          const p: any = row.property ?? {};
          const img = firstImage(p);
          const title = pickTitle(p);
          const loc = pickLocation(p);
          const price = pickPrice(p);
          const slug = (p?.slug ?? p?.url_slug ?? p?.generated_slug)?.toString().trim();
          const code = p?.property_id
            ? String(p.property_id).trim()
            : `REP${String(p?.id ?? row.property_id ?? "").padStart(4, "0")}`;

          return (
            <div
              key={row.id}
              className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              {/* Image + top-right tools */}
              <div className="relative">
                {img ? (
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                    <Building />
                  </div>
                )}

                {/* Watermark (subtle) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-2xl font-bold opacity-40 select-none">
                    ResaleExpert.in
                  </span>
                </div>

                {/* Toolbar */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleUnsave(row.property_id)}
                    className="p-2 rounded-full bg-white/90 text-red-600 hover:bg-red-50 hover:text-red-700 transition shadow-sm"
                    title="Unsave"
                  >
                    <Trash2 size={16} />
                  </button>

                  {slug ? (
                    <Link
                      to={`/properties/${encodeURIComponent(slug)}`}
                      className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-gray-100 transition shadow-sm"
                      title="Open details"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#E6761D] transition-colors">
                    {title}
                  </h3>
                  <span className="text-xs text-gray-500 shrink-0">{code}</span>
                </div>

                <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span className="line-clamp-1">{loc}</span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                    <IndianRupee size={16} />
                    <span>{formatINR(price)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Saved on {new Date(row.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {slug ? (
                    <Link
                      to={`/properties/${encodeURIComponent(slug)}`}
                      className="flex-1 text-center bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      View Details
                    </Link>
                  ) : (
                    <button
                      className="flex-1 bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                      disabled
                      title="Details not available"
                    >
                      View Details
                    </button>
                  )}

                  <button
                    onClick={() => handleUnsave(row.property_id)}
                    className="px-3 py-2 rounded-lg text-sm border text-red-600 border-red-200 hover:bg-red-50 transition"
                  >
                    Unsave
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuyerSavedProperties;
