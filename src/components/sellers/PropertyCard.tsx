import React, { useState } from "react";
import {
  MapPin,
  Eye,
  Users,
  Share,
  Edit,
  MoreHorizontal,
  Globe,
  Target,
  BarChart3,
  Zap,
  Flame,

} from "lucide-react";
import { safe } from "@/pages/utils/uiSafe";

const formatCurrency = (amount?: number) => {
  const n = Number(amount ?? 0);
  if (!n) return "-";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};



const PropertyCard = ({ property }: any) => {
  // image
  const imgSrc =
    property?.photos?.[0] ??
    "https://dummyimage.com/800x450/e5e7eb/9ca3af.png&text=No+Image";

  // areas (support both API keys)
  const carpet_area = Number(property?.carpet_area ?? property?.carpetArea ?? 0);
  const builtup_area = Number(
    property?.builtup_area ?? property?.builtupArea ?? 0
  );

  // price & rate
  const price = Number(property?.price ?? 0);
  const rate = carpet_area
    ? `₹${Math.round(price / carpet_area).toLocaleString()}/sq ft`
    : "-";

  // metrics (default to 0)
  const visits = Number(property?.visits ?? 0);
  const inquiries = Number(property?.inquiries ?? 0);
  const hotLeads = Number(property?.hotLeads ?? property?.hot_leads ?? 0);

  // states / labels
  const availability = safe(property?.availability ?? property?.status ?? "Available");
  const isPublic = !!(property?.isPublic ?? true); // default true to match mock
  const isHot = !!(property?.isHot ?? property?.hot ?? false);
  const hasMandate = !!(property?.mandateSigned ?? property?.mandate ?? true); // default true like mock

  // public listing + last activity (fallbacks if API missing)
  const _publicViews = Number(property?.publicViews);
  const publicViews =
    Number.isFinite(_publicViews) && _publicViews >= 0 ? _publicViews : 245;

  const lastActivity = safe(
    property?.lastActivity ?? property?.updated_at ?? property?.created_at,
    ""
  );

  const [showActions, setShowActions] = useState(false);

// format date as dd/mm/yyyy
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const lastActivityDisplay = formatDate(
  property?.lastActivity ?? property?.updated_at ?? property?.created_at
);

  const handleQuickAction = (action: string) => {
    if (action === "share") {
      const msg = `🏠 *${safe(property?.title)}*
📍 ${safe(property?.address)}
💰 ${formatCurrency(price)}
🏢 ${safe(property?.unit_type ?? property?.unitType)} • ${
        carpet_area ? `${carpet_area} sq ft` : "-"
      }

Interested? Contact me for more details!

— Shared via ResaleExpert`;
      navigator.clipboard.writeText(msg);
      alert("Property details copied to clipboard!");
    } else if (action === "analytics") {
      alert("Open property analytics.");
    } else if (action === "edit") {
      alert("Edit property (hook into your flow).");
    } else if (action === "boost") {
      alert("Property boost activated!");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
      {/* Image + badges/menu */}
      <div className="relative">
        <img
          src={imgSrc}
          alt={String(safe(property?.title))}
          className="w-full h-48 object-cover"
        />

        {/* top badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {/* Availability */}
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {availability}
          </span>

          {/* PUBLIC */}
          {isPublic && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              PUBLIC
            </span>
          )}

          {/* HOT */}
          {isHot && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 inline-flex items-center gap-1">
              <Flame size={12} /> HOT
            </span>
          )}

          
        </div>

        {/* Mandate ribbon (like mock) */}
        {hasMandate && (
          <div className="absolute bottom-4 left-3 ">
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-600 text-white shadow-sm">
              Mandate Signed
            </span>
          </div>
        )}

       
        {/* top-right actions */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={() => setShowActions((v) => !v)}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            >
              <MoreHorizontal size={16} />
            </button>
            {showActions && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleQuickAction("share");
                      setShowActions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <Share size={14} />
                    <span>Share Property</span>
                  </button>
                  <button
                    onClick={() => {
                      handleQuickAction("edit");
                      setShowActions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <Edit size={14} />
                    <span>Edit Details</span>
                  </button>
                  <button
                    onClick={() => {
                      handleQuickAction("analytics");
                      setShowActions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <BarChart3 size={14} />
                    <span>View Analytics</span>
                  </button>
                  <button
                    onClick={() => {
                      handleQuickAction("boost");
                      setShowActions(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-100 rounded"
                  >
                    <Zap size={14} />
                    <span>Boost Listing</span>
                  </button>
                </div>
                
              </div>
              
            )}
          </div>
          
        </div>
      </div>

      {/* Body */}
      <div className="p-6 pt-8">{/* pt-8 to offset mandate chip */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              {[
                safe(property?.furnishing),
                safe(property?.unit_type ?? property?.unitType),
                safe(property?.property_subtype_name),
                safe(property?.location_name),
              ]
                .filter((v) => v !== "-" && v !== "")
                .join("  ")}
            </h3>

            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <MapPin size={14} />
              <span className="text-sm">{safe(property?.address)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(price)}
            </div>
            <div className="text-sm text-gray-500">{rate}</div>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Type</div>
            <div className="font-semibold text-gray-900">
              {safe(property?.unit_type ?? property?.unitType)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Carpet Area</div>
            <div className="font-semibold text-gray-900">
              {carpet_area ? `${carpet_area} sq ft` : "-"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Builtup Area</div>
            <div className="font-semibold text-gray-900">
              {builtup_area ? `${builtup_area} sq ft` : "-"}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
              <Eye size={14} />
              <span className="font-bold">{visits}</span>
            </div>
            <div className="text-xs text-gray-500">Visits</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
              <Users size={14} />
              <span className="font-bold">{inquiries}</span>
            </div>
            <div className="text-xs text-gray-500">Inquiries</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
              <Target size={14} />
              <span className="font-bold">{hotLeads}</span>
            </div>
            <div className="text-xs text-gray-500">Hot Leads</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Selling Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {Number(property?.stageProgress ?? 0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(0, Math.min(100, Number(property?.stageProgress ?? 0)))}%`,
              }}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Amenities</div>
          <div className="flex flex-wrap gap-1">
            {(property?.amenities ?? []).slice(0, 3).map((amenity: string, i: number) => (
              <span
                key={`${amenity}-${i}`}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
              >
                {safe(amenity)}
              </span>
            ))}
            {(property?.amenities ?? []).length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{(property?.amenities ?? []).length - 3} more
              </span>
            )}
            {(property?.amenities ?? []).length === 0 && (
              <span className="text-xs text-gray-500">-</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            View Details
          </button>
          <button
            onClick={() => handleQuickAction("share")}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            title="Share Property"
          >
            <Share size={16} />
          </button>
          <button
            onClick={() => handleQuickAction("analytics")}
            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
            title="View Analytics"
          >
            <BarChart3 size={16} />
          </button>
           {/* public views + last activity OVERLAY on image */}


        </div>
{/* Public views + last activity BELOW buttons */}
<div className="mt-3">
  <div className="rounded-lg bg-gray-50 text-gray-700 px-3 py-2 flex items-center justify-between">
    <div className="flex items-center gap-1">
      <Globe size={14} className="text-purple-600" />
      <span className="text-sm">{publicViews} public views</span>
    </div>
    <div className="text-xs text-gray-500">
      Last activity: {lastActivityDisplay}
    </div>
  </div>
</div>

        {/* NOTE: We moved public views + last activity onto the image as requested */}
      </div>
    </div>
  );
};

export default PropertyCard;
