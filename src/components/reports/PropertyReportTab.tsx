// frontend/src/components/reports/PropertyReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import Button from "@/components/ui/Button";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Building,
  Filter,
  Download,
  Printer,
  MapPin,
  IndianRupee,
  Home,
  Check,
  Copy,
  Phone,
  MessageSquare,
  Mail,
  X,
  Eye,
  Users,
  ShieldCheck,
  Activity,
  Layers3,
  Award,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface PropertyReportTabProps {
  data: any[];
  stats: any;
  mix?: any;
  locations?: any[];
  bhk?: any[];
  propertyTypes?: any[];
  salePrices?: any;
  expectedRents?: any;
  executives?: any[];
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh: () => void;
  onPrint: () => void;
  activeStatusPill?: string;
  onSelectStatusPill?: (key: string) => void;
  loading?: boolean;
  propertyMode?: "all" | "sale" | "rental";
  onPropertyModeChange?: (mode: "all" | "sale" | "rental") => void;
  onFilterByLocation?: (loc: string) => void;
  onFilterByBhk?: (bhk: string) => void;
  onFilterByType?: (type: string) => void;
}

const ContactCell: React.FC<{ row: any }> = ({ row }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isSale = row.mode === "sale";
  const contactName = row.contact_name || (isSale ? row.seller_name : row.owner_name) || "Contact";
  const phone = (row.phone && row.phone !== "N/A" ? row.phone : "") || (row.whatsapp && row.whatsapp !== "N/A" ? row.whatsapp : "");
  const email = row.email && row.email !== "N/A" ? row.email : "";

  const handleCopy = (text: string, fieldName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title={`View ${isSale ? "Seller" : "Owner"} contact details`}
        className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200 shrink-0 shadow-2xs flex items-center justify-center"
      >
        <Eye className="w-4 h-4 text-teal-600" />
      </button>

      {/* Floating Centered Contact Details Modal */}
      {isOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white rounded-xl shadow-2xl border border-slate-200 p-4 text-xs text-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-slate-900 text-sm truncate">
                  {isSale ? "Seller" : "Owner"}: {contactName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Phone */}
            {phone ? (
              <div className="flex items-center justify-between p-2 bg-blue-50/80 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 truncate">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-slate-900 text-xs truncate">{phone}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(phone, "phone", e)}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-md border border-slate-200 shadow-2xs flex items-center gap-1"
                  >
                    {copiedField === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    {copiedField === "phone" ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={`tel:${phone}`}
                    className="px-2 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Call
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200 text-amber-800 text-center font-medium text-[11px]">
                No contact phone recorded for {contactName}
              </div>
            )}

            {/* Email */}
            {email ? (
              <div className="flex items-center justify-between p-2 bg-purple-50/80 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 truncate max-w-[170px]">
                  <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-medium text-slate-700 text-xs truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopy(email, "email", e)}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-md border border-slate-200 shadow-2xs flex items-center gap-1 shrink-0"
                >
                  {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  {copiedField === "email" ? "Copied!" : "Copy"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export const PropertyReportTab: React.FC<PropertyReportTabProps> = ({
  data = [],
  stats = {},
  mix = {},
  locations = [],
  bhk = [],
  propertyTypes = [],
  salePrices = {},
  expectedRents = {},
  executives = [],
  pagination,
  onPageChange,
  onLimitChange,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
  activeStatusPill = "all",
  onSelectStatusPill,
  loading = false,
  propertyMode = "all",
  onPropertyModeChange,
  onFilterByLocation,
  onFilterByBhk,
  onFilterByType,
}) => {
  const safeStats = stats || {};
  const safeMix = mix || {};
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeBhk = Array.isArray(bhk) ? bhk : [];
  const safeTypes = Array.isArray(propertyTypes) ? propertyTypes : [];
  const safeExecutives = Array.isArray(executives) ? executives : [];
  const safeSalePrices = salePrices || {};
  const safeExpectedRents = expectedRents || {};

  const statusPills: StatusPill[] = [
    { label: "All Properties", key: "all", count: safeStats.total_count || safeMix.total || data.length },
    { label: "Available", key: "active", count: safeStats.available_count || safeStats.active_count || 0 },
    { label: "On Hold", key: "on_hold", count: safeStats.on_hold_count || 0 },
    { label: "Sold", key: "sold", count: safeStats.sold_count || 0 },
    { label: "Rented", key: "rented", count: safeStats.rented_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "title",
      header: "PROPERTY TITLE / SOCIETY",
      searchPlaceholder: "Search property...",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.title || row.society_name}</div>
          <div className="text-[10px] text-teal-700 font-medium flex items-center gap-1.5 mt-0.5">
            <span>{row.mode === "rental" ? "For Rent" : "For Sale"} • {row.property_type || "Residential"} • {row.unit_type || "Any BHK"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "contact_name",
      header: "OWNER / SELLER",
      searchPlaceholder: "Search owner...",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs block">{row.contact_name || row.seller_name || row.owner_name || "N/A"}</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase">{row.mode === "rental" ? "Landlord" : "Seller"}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "CONTACT",
      width: "50px",
      className: "w-[50px] text-center",
      render: (row) => <ContactCell row={row} />,
    },
    {
      key: "location",
      header: "LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <span>{row.location || row.location_name || row.city_name || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "PRICE / EXPECTED RENT",
      searchPlaceholder: "Search price...",
      render: (row) => {
        const val = Number(row.price || row.final_price || row.budget || row.monthly_rent || 0);
        if (val === 0) return <span className="text-gray-400 text-xs">N/A</span>;
        if (row.mode === "rental") {
          return <span className="font-semibold text-emerald-700 text-xs">₹{val.toLocaleString("en-IN")}/mo</span>;
        }
        return (
          <span className="font-semibold text-indigo-700 text-xs">
            {val >= 10000000 ? `₹${(val / 10000000).toFixed(2)}Cr` : `₹${(val / 100000).toFixed(0)}L`}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "available").toLowerCase();
        const color = s.includes("sold") || s.includes("rented")
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : s.includes("hold")
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-teal-50 text-teal-700 border-teal-200";
        return (
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${color}`}>
            {row.status || "Available"}
          </span>
        );
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED EXECUTIVE",
      searchPlaceholder: "Search agent...",
      render: (row) => <span className="font-normal text-slate-700 text-xs">{row.assigned_agent_name || "Unassigned"}</span>,
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* 1. TOP HEADER INVENTORY OVERVIEW */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800">Inventory & Performance Overview</h3>
          </div>

          {/* Action Buttons in Right Corner */}
          <div className="flex items-center gap-2">
            {activeStatusPill && !["all", "total"].includes(activeStatusPill.toLowerCase()) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSelectStatusPill && onSelectStatusPill("all")}
                className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-all animate-in fade-in duration-150"
                title="Click to unfilter and view all properties"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                Unfilter
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={onOpenFilters}
              className="flex items-center gap-1.5 text-xs text-white bg-[#0f2b3d] hover:bg-[#1a435d] font-bold px-3.5 py-1.5 rounded-lg shadow-xs border-0"
            >
              <Filter className="w-3.5 h-3.5 text-white" />
              Filter
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-700" />
              Export
            </Button>

            {onPrint && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrint}
                className="flex items-center gap-1.5 text-xs text-gray-800 bg-white hover:bg-gray-50 border-gray-300 font-semibold px-3 py-1.5 rounded-lg shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-gray-700" />
                Print
              </Button>
            )}
          </div>
        </div>

        {/* Secondary KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 bg-indigo-50/70 rounded-lg border border-indigo-100">
            <div className="text-[10px] font-bold text-indigo-700 uppercase">Total Sale Inventory Value</div>
            <div className="text-sm font-black text-indigo-950 mt-0.5">
              ₹{(Number(safeStats.sale_value || 0) / 10000000).toFixed(2)} Cr
            </div>
          </div>
          <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-100">
            <div className="text-[10px] font-bold text-blue-700 uppercase">Avg Resale Price</div>
            <div className="text-sm font-black text-blue-950 mt-0.5">
              ₹{(Number(safeStats.avg_sale_price || 0) / 100000).toFixed(1)} Lakhs
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100">
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Avg Expected Rent</div>
            <div className="text-sm font-black text-emerald-950 mt-0.5">
              ₹{Number(safeStats.avg_monthly_rent || 0).toLocaleString("en-IN")}/mo
            </div>
          </div>
          <div className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-100">
            <div className="text-[10px] font-bold text-purple-700 uppercase">Public Listings</div>
            <div className="text-sm font-black text-purple-950 mt-0.5">
              {safeStats.public_count || 0} units ({safeStats.total_properties > 0 ? Math.round(((safeStats.public_count || 0) / safeStats.total_properties) * 100) : 0}%)
            </div>
          </div>
          <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-100">
            <div className="text-[10px] font-bold text-amber-700 uppercase">On Hold / Verification</div>
            <div className="text-sm font-black text-amber-950 mt-0.5">{safeStats.on_hold_count || 0}</div>
          </div>
          <div className="p-2.5 bg-teal-50/70 rounded-lg border border-teal-100">
            <div className="text-[10px] font-bold text-teal-700 uppercase">Closed / Transacted</div>
            <div className="text-sm font-black text-teal-950 mt-0.5">
              {(safeStats.sold_count || 0) + (safeStats.rented_count || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. LOCATION SUPPLY & BHK DISTRIBUTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Location Inventory Matrix */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Property Inventory by Location
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Click location to filter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="p-2">Location</th>
                  <th className="p-2 text-center">Total</th>
                  <th className="p-2 text-center">Sale</th>
                  <th className="p-2 text-center">Rental</th>
                  <th className="p-2 text-center">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeLocations.slice(0, 6).map((loc: any, idx: number) => (
                  <tr
                    key={idx}
                    onClick={() => onFilterByLocation && onFilterByLocation(loc.location)}
                    className="hover:bg-indigo-50/60 cursor-pointer transition-colors"
                  >
                    <td className="p-2 font-bold text-slate-900">{loc.location}</td>
                    <td className="p-2 text-center font-bold text-slate-900">{loc.total}</td>
                    <td className="p-2 text-center font-semibold text-indigo-700">{loc.sale}</td>
                    <td className="p-2 text-center font-semibold text-teal-700">{loc.rental}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">{loc.available}</td>
                  </tr>
                ))}
                {safeLocations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400 italic">No location inventory recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BHK / Unit Type Analysis */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-teal-600" />
              BHK / Unit Type Distribution
            </h3>
            <span className="text-[10px] font-bold text-teal-700">Click unit to filter</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {safeBhk.slice(0, 6).map((b: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onFilterByBhk && onFilterByBhk(b.unit_type)}
                className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg cursor-pointer transition-all text-xs"
              >
                <div className="font-bold text-slate-900">{b.unit_type}</div>
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="text-indigo-700 font-semibold">{b.sale} Sale</span>
                  <span className="text-teal-700 font-semibold">{b.rental} Rent</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PRICE & RENT DISTRIBUTION TIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sale Price Tiers */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-indigo-600" />
            Resale Asking Price Distribution
          </h3>

          <div className="space-y-2">
            {(safeSalePrices.buckets || [
              { label: "Below ₹50L", count: 0 },
              { label: "₹50L - ₹1Cr", count: 0 },
              { label: "₹1Cr - ₹2Cr", count: 0 },
              { label: "₹2Cr - ₹5Cr", count: 0 },
              { label: "Above ₹5Cr", count: 0 },
            ]).map((b: any, idx: number) => {
              const totalP = safeMix.sale || 1;
              const pct = Math.round((b.count / totalP) * 100);
              return (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>{b.label}</span>
                    <span className="font-bold text-indigo-800">{b.count} properties ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expected Rent Tiers */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-teal-600" />
            Expected Monthly Rent Distribution
          </h3>

          <div className="space-y-2">
            {(safeExpectedRents.buckets || [
              { label: "Below ₹15K", count: 0 },
              { label: "₹15K - ₹25K", count: 0 },
              { label: "₹25K - ₹40K", count: 0 },
              { label: "₹40K - ₹60K", count: 0 },
              { label: "Above ₹60K", count: 0 },
            ]).map((b: any, idx: number) => {
              const totalP = safeMix.rental || 1;
              const pct = Math.round((b.count / totalP) * 100);
              return (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>{b.label}</span>
                    <span className="font-bold text-teal-800">{b.count} properties ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. EXECUTIVE LEADERBOARD */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-indigo-600" />
          Executive Property Inventory & Conversion Leaderboard
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                <th className="p-2">Rank & Executive</th>
                <th className="p-2 text-center">Sale Units</th>
                <th className="p-2 text-center">Rental Units</th>
                <th className="p-2 text-center">Available</th>
                <th className="p-2 text-center">Sold</th>
                <th className="p-2 text-center">Rented</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(safeExecutives.length > 0 ? safeExecutives : [
                { agent_name: "Unassigned Agent", sale_properties: safeMix.sale || 0, rental_properties: safeMix.rental || 0, available: safeStats.available_count || 0, sold: safeStats.sold_count || 0, rented: safeStats.rented_count || 0 },
              ]).map((ex: any, idx: number) => {
                const rankBadge = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                return (
                  <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="p-2 font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-xs">{rankBadge}</span>
                      <span>{ex.agent_name || "Executive"}</span>
                    </td>
                    <td className="p-2 text-center font-semibold text-indigo-700">{ex.sale_properties}</td>
                    <td className="p-2 text-center font-semibold text-teal-700">{ex.rental_properties}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">{ex.available}</td>
                    <td className="p-2 text-center font-bold text-indigo-900">{ex.sold}</td>
                    <td className="p-2 text-center font-bold text-purple-900">{ex.rented}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MAIN DETAILED DIRECTORY TABLE */}
      <div className="space-y-3">
        <ReportTable
          title={propertyMode === "sale" ? "Resale Property Directory" : propertyMode === "rental" ? "Rental Property Directory" : "All Properties Directory"}
          columns={columns}
          data={data}
          statusPills={statusPills}
          activeStatusPill={activeStatusPill}
          onSelectStatusPill={onSelectStatusPill}
          onOpenFilters={onOpenFilters}
          onExport={onExport}
          onRefresh={onRefresh}
          onPrint={onPrint}
          hideHeaderButtons={true}
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          loading={loading}
        />
      </div>
    </div>
  );
};
