import React from "react";
import { Link } from "react-router-dom";
import { RexPropertyCardData, RexPaginationInfo } from "@/services/rexApi";
import { Building2, MapPin, Check, Plus, ExternalLink } from "lucide-react";
import { getImageUrl } from "@/lib/helpers";

interface REXPropertyCarouselProps {
  properties: RexPropertyCardData[];
  pagination?: RexPaginationInfo;
  onSelectProperty?: (property: RexPropertyCardData) => void;
  onInterested?: (property: RexPropertyCardData) => void;
  onNotInterested?: (property: RexPropertyCardData) => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export function formatIndianPrice(num?: number | string | null): string {
  if (!num) return "Price on Request";
  const val = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(val) || val <= 0) return "Price on Request";

  if (val >= 10000000) {
    const cr = val / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    const l = val / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString("en-IN")}`;
}

export const REXPropertyCarousel: React.FC<REXPropertyCarouselProps> = ({
  properties,
  pagination,
  onSelectProperty,
  onInterested,
  onNotInterested,
  onLoadMore,
  loadingMore = false,
}) => {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="w-full space-y-3 my-2">
      {/* Horizontal Scrolling Card Track */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar snap-x snap-mandatory">
        {properties.map((prop) => {
          const rawPhoto = prop.photos?.[0] || null;
          const photoUrl = rawPhoto ? getImageUrl(rawPhoto) : null;
          const displayPrice = formatIndianPrice(prop.price);
          const cleanTitle = (prop.title || "Residential Property")
            .replace(/\[REX\d+\]\s*/gi, "")
            .replace(/\s*\([^)]*\)/g, "")
            .replace(/\s+in\s+.*$/i, (match) => {
              const lower = match.toLowerCase();
              const allowedAreas = [
                "pune", "mumbai", "hinjewadi", "baner", "wakad", "punawale",
                "kharadi", "ravet", "kothrud", "hadapsar", "bavdhan", "pcmc", "maharashtra"
              ];
              if (allowedAreas.some((area) => lower.includes(area))) {
                return match;
              }
              return "";
            })
            .trim() || (prop.location ? `Property in ${prop.location}` : "Residential Property");
          const address = [prop.location, prop.city].filter(Boolean).join(", ");

          return (
            <div
              key={prop.id}
              className="min-w-[220px] max-w-[240px] sm:min-w-[240px] sm:max-w-[260px] bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col snap-start shrink-0 hover:shadow-md transition-all duration-200 group"
            >
              {/* Card Image */}
              <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={cleanTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                    <Building2 size={32} />
                  </div>
                )}

                {/* Price Tag Overlay */}
                <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-gradient-to-r from-[#0f2b3d] to-[#1a4a6b] text-white rounded-md text-[11px] font-bold shadow-xs">
                  {displayPrice}
                </div>

                {prop.unit_type && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#e87722] text-white rounded-md text-[10px] font-bold shadow-xs">
                    {prop.unit_type}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#0f2b3d] transition-colors">
                    {cleanTitle}
                  </h4>

                  {address && (
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
                      <MapPin size={11} className="text-[#e87722] shrink-0" />
                      <span className="truncate">{address}</span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onInterested ? onInterested(prop) : onSelectProperty?.(prop)}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-[#e87722] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Check size={12} />
                      <span>Interested</span>
                    </button>
                    {prop.slug && (
                      <Link
                        to={`/properties/${prop.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-100 hover:bg-[#0f2b3d] hover:text-white text-slate-700 rounded-lg transition-colors flex items-center justify-center shrink-0"
                        title="View details"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    )}
                  </div>

                  {onNotInterested && (
                    <button
                      type="button"
                      onClick={() => onNotInterested(prop)}
                      className="w-full py-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors text-center cursor-pointer font-medium"
                    >
                      Not interested
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Load More Card */}
        {pagination?.hasMore && onLoadMore && (
          <div className="min-w-[160px] max-w-[170px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-4 snap-start shrink-0 text-center">
            <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center mb-2 shadow-2xs">
              <Plus size={18} />
            </div>
            <p className="text-xs font-bold text-slate-900">
              +{pagination.remaining} More
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Matching properties
            </p>
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="mt-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {/* Footer count indicator */}
      {pagination && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Showing {properties.length} of {pagination.total} properties</span>
          {pagination.hasMore && (
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="text-slate-800 font-semibold hover:underline cursor-pointer"
            >
              Show next 5 ({pagination.remaining} left)
            </button>
          )}
        </div>
      )}
    </div>
  );
};
