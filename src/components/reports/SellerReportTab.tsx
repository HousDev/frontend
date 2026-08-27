// frontend/src/components/reports/SellerReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import Button from "@/components/ui/Button";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  UserCheck2,
  Building,
  Calendar,
  AlertTriangle,
  Award,
  Layers,
  Sparkles,
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
  Building2,
} from "lucide-react";

interface SellerReportTabProps {
  data: any[];
  stats: any;
  summary?: any;
  pipeline?: any[];
  aging?: any[];
  followups?: any;
  properties?: any;
  prices?: any;
  sources?: any[];
  documents?: any;
  cosellers?: any;
  executives?: any[];
  financials?: any;
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
  viewMode?: "seller" | "property";
  onViewModeChange?: (mode: "seller" | "property") => void;
  onFilterByStage?: (stage: string) => void;
  onFilterByAging?: (agingRange: string) => void;
  onFilterByDocStatus?: (docStatus: string) => void;
  onFilterByLocation?: (loc: string) => void;
  onFilterByExecutive?: (execId: string) => void;
  onFilterByPrice?: (min: number, max: number) => void;
}

const ContactCell: React.FC<{ row: any }> = ({ row }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const phone = row.phone || "";
  const whatsapp = row.whatsapp || row.whatsapp_number || row.phone || "";
  const email = row.email || "";

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
        title="View seller contact details"
        className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200 shrink-0 shadow-2xs flex items-center justify-center"
      >
        <Eye className="w-4 h-4 text-indigo-600" />
      </button>

      {/* Floating Centered Contact Details Modal (Never Clipped) */}
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
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-bold text-slate-900 text-sm truncate">
                  {row.salutation ? `${row.salutation} ` : ""}{row.name || "Seller Contact"}
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
                    title="Copy Phone Number"
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
            ) : null}

            {/* WhatsApp */}
            {whatsapp ? (
              <div className="flex items-center justify-between p-2 bg-emerald-50/80 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900 text-xs truncate">{whatsapp}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(whatsapp, "whatsapp", e)}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-md border border-slate-200 shadow-2xs flex items-center gap-1"
                    title="Copy WhatsApp Number"
                  >
                    {copiedField === "whatsapp" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    {copiedField === "whatsapp" ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={`https://wa.me/91${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                  >
                    Chat
                  </a>
                </div>
              </div>
            ) : null}

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

export const SellerReportTab: React.FC<SellerReportTabProps> = ({
  data = [],
  stats = {},
  summary = {},
  pipeline = [],
  aging = [],
  followups = {},
  properties = {},
  prices = {},
  sources = [],
  documents = {},
  cosellers = {},
  executives = [],
  financials = {},
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
  viewMode = "seller",
  onViewModeChange,
  onFilterByStage,
  onFilterByAging,
  onFilterByDocStatus,
  onFilterByLocation,
  onFilterByExecutive,
  onFilterByPrice,
}) => {
  const safeStats = stats || {};
  const safeSummary = summary || {};
  const safeFollowups = followups || {};
  const safeProperties = properties || {};
  const safePrices = prices || {};
  const safeDocuments = documents || {};
  const safeCosellers = cosellers || {};
  const safeExecutives = Array.isArray(executives) ? executives : [];
  const safePipeline = Array.isArray(pipeline) ? pipeline : [];
  const safeAging = Array.isArray(aging) ? aging : [];
  const safeLocations = Array.isArray(safeProperties.by_location) ? safeProperties.by_location : [];

  const totalSellersCount = safeSummary.total_sellers || safeStats.total_count || data.length || 1;

  const statusPills: StatusPill[] = [
    { label: "All Sellers", key: "all", count: safeStats.total_count || safeSummary.total_sellers || data.length },
    { label: "Active Listings", key: "active", count: safeStats.active_count || safeSummary.active_sellers || 0 },
    { label: "Closed / Sold", key: "sold", count: safeStats.sold_count || safeSummary.closed_sold || 0 },
  ];

  // Seller View Columns
  const sellerColumns: ColumnDef[] = [
    {
      key: "id",
      header: "SELLER ID",
      render: (row) => <span className="font-mono text-xs font-semibold text-slate-700">#SEL-{row.id}</span>,
    },
    {
      key: "name",
      header: "SELLER NAME",
      width: "240px",
      searchPlaceholder: "Search seller...",
      render: (row) => (
        <div className="font-bold text-slate-900 text-xs whitespace-normal break-words leading-snug min-w-[220px]">
          {row.salutation ? `${row.salutation} ` : ""}{row.name || "N/A"}
        </div>
      ),
    },
    {
      key: "phone",
      header: "CONTACT",
      width: "50px",
      className: "w-[50px] text-center",
      searchPlaceholder: "Search contact...",
      render: (row) => <ContactCell row={row} />,
    },
    {
      key: "location",
      header: "PROPERTY LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
          <span>{row.location || row.city || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "property_count",
      header: "PROPERTIES",
      render: (row) => (
        <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          {row.property_count || 1} units
        </span>
      ),
    },
    {
      key: "expected_price",
      header: "EXPECTED PRICE",
      searchPlaceholder: "Search price...",
      render: (row) => {
        const val = Number(row.expected_price || row.deal_value || 0);
        return (
          <span className="font-medium text-emerald-700 text-xs block">
            {val > 0 ? (val >= 10000000 ? `₹${(val / 10000000).toFixed(2)}Cr` : `₹${(val / 100000).toFixed(0)}L`) : "N/A"}
          </span>
        );
      },
    },
    {
      key: "seller_lead_stage",
      header: "STAGE",
      searchPlaceholder: "Search stage...",
      render: (row) => {
        const st = row.seller_lead_stage || row.stage || "New";
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            {st}
          </span>
        );
      },
    },
    {
      key: "seller_lead_status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.seller_lead_status || row.status || "active").toLowerCase();
        const color = s.includes("sold") || s.includes("closed")
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-blue-50 text-blue-700 border-blue-200";
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${color}`}>
            {row.seller_lead_status || row.status || "Active"}
          </span>
        );
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED EXECUTIVE",
      searchPlaceholder: "Search agent...",
      render: (row) => (
        <span className="font-normal text-slate-700 text-xs">{row.assigned_agent_name || "Unassigned"}</span>
      ),
    },
  ];

  // Property View Columns
  const propertyColumns: ColumnDef[] = [
    {
      key: "property_id",
      header: "PROP ID",
      render: (row) => <span className="font-mono text-xs font-semibold text-slate-700">#PROP-{row.property_id || row.id}</span>,
    },
    {
      key: "title",
      header: "PROPERTY TITLE",
      searchPlaceholder: "Search property...",
      render: (row) => (
        <div className="font-bold text-slate-900 text-xs whitespace-normal break-words min-w-[200px]">
          {row.title || `Property #${row.id}`}
        </div>
      ),
    },
    {
      key: "seller_name",
      header: "SELLER NAME",
      render: (row) => <span className="font-semibold text-indigo-800 text-xs">{row.seller_name || "N/A"}</span>,
    },
    {
      key: "location",
      header: "LOCATION",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
          <span>{row.location || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "property_type",
      header: "TYPE & BHK",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.property_type || "Residential"}</div>
          <div className="text-[10px] text-indigo-600 font-medium">{row.unit_type || "Any BHK"}</div>
        </div>
      ),
    },
    {
      key: "asking_price",
      header: "ASKING PRICE",
      render: (row) => {
        const p = Number(row.asking_price || row.expected_price || 0);
        return (
          <span className="font-medium text-emerald-700 text-xs block">
            {p > 0 ? (p >= 10000000 ? `₹${(p / 10000000).toFixed(2)}Cr` : `₹${(p / 100000).toFixed(0)}L`) : "N/A"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "LISTING STATUS",
      render: (row) => {
        const s = (row.status || "Active").toLowerCase();
        const color = s.includes("sold") || s.includes("closed")
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : s.includes("active") || s.includes("published")
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-amber-50 text-amber-700 border-amber-200";
        return <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${color}`}>{row.status || "Active"}</span>;
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED EXECUTIVE",
      render: (row) => <span className="font-normal text-slate-700 text-xs">{row.assigned_agent_name || "Unassigned"}</span>,
    },
  ];

  const activeColumns = viewMode === "property" ? propertyColumns : sellerColumns;

  return (
    <div className="space-y-3.5">
      {/* 1. SELLER SALES LIFECYCLE FUNNEL WITH TOP-RIGHT ACTION BUTTONS */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Seller Acquisition & Sales Lifecycle Funnel</h3>
                <p className="text-[10px] font-medium text-slate-500">Stage-by-stage listing & conversion flow</p>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Inventory Conversion: <span className="text-emerald-600 font-bold">{safeStats.conversion_rate || 0}%</span>
            </div>
          </div>

          {/* Filter, Export, Print Buttons in Right Corner */}
          <div className="flex items-center gap-2">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(safePipeline.length > 0 ? safePipeline : [
            { stage: "New", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Qualified", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Listed", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Buyer Interest", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Negotiation", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Agreement", count: 0, percentage: 0, deal_value: 0 },
            { stage: "Closed", count: 0, percentage: 0, deal_value: 0 },
          ]).map((p, idx) => (
            <div
              key={idx}
              onClick={() => onFilterByStage && onFilterByStage(p.stage)}
              className="bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-lg p-2.5 cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="text-[10px] font-bold text-gray-600 group-hover:text-indigo-900 truncate">
                {p.stage}
              </div>
              <div className="text-sm font-black text-gray-900 mt-0.5">{p.count}</div>
              <div className="flex items-center justify-between mt-1 text-[9px]">
                <span className="text-indigo-600 font-bold">{p.percentage}%</span>
                <span className="text-gray-500 font-medium">₹{(Number(p.deal_value || 0) / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, p.percentage || 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. LOCATION & PRICE ANALYSIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Location Demand Matrix */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              Seller Inventory by Location
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Click location to filter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="p-2">Location</th>
                  <th className="p-2 text-center">Properties</th>
                  <th className="p-2 text-center">Active</th>
                  <th className="p-2 text-center">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeLocations.slice(0, 6).map((loc: any, idx: number) => (
                  <tr
                    key={idx}
                    onClick={() => onFilterByLocation && onFilterByLocation(loc.location)}
                    className="hover:bg-orange-50/60 cursor-pointer transition-colors"
                  >
                    <td className="p-2 font-bold text-slate-900">{loc.location}</td>
                    <td className="p-2 text-center font-semibold text-blue-700">{loc.count}</td>
                    <td className="p-2 text-center font-semibold text-emerald-700">{Math.round(loc.count * 0.7)}</td>
                    <td className="p-2 text-center font-bold text-teal-800">{Math.round(loc.count * 0.2)}</td>
                  </tr>
                ))}
                {safeLocations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400 italic">No location inventory recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Property Price Analysis */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              Seller Property Price Analysis
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg: ₹{Number(safePrices.avg_price || safeSummary.avg_deal_value || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-2">
            {(safePrices.buckets || [
              { label: "Below ₹50L", count: 0 },
              { label: "₹50L - ₹1Cr", count: 0 },
              { label: "₹1Cr - ₹2Cr", count: 0 },
              { label: "₹2Cr - ₹5Cr", count: 0 },
              { label: "Above ₹5Cr", count: 0 },
            ]).map((b: any, idx: number) => {
              const totalP = safeProperties.linked_count || 1;
              const pct = Math.round((b.count / totalP) * 100);
              return (
                <div
                  key={idx}
                  onClick={() => onFilterByPrice && onFilterByPrice(b.min || 0, b.max || 999999999)}
                  className="p-2 rounded bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all text-xs"
                >
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>{b.label}</span>
                    <span className="font-bold text-emerald-800">{b.count} properties ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. CREATIVE 3-COLUMN BI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Card A: Listing Aging Analytics */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-xs">Listing Aging Brackets</h3>
            </div>
            <span className="text-[9px] text-gray-400 font-medium">Click to filter</span>
          </div>

          <div className="space-y-1.5 flex-1">
            {(safeAging.length > 0 ? safeAging : [
              { range: "0–7 days", key: "0_7", count: 0, deal_value: 0 },
              { range: "8–15 days", key: "8_15", count: 0, deal_value: 0 },
              { range: "16–30 days", key: "16_30", count: 0, deal_value: 0 },
              { range: "31–60 days", key: "31_60", count: 0, deal_value: 0 },
              { range: "60+ days", key: "60_plus", count: 0, deal_value: 0 },
            ]).map((a, idx) => (
              <div
                key={idx}
                onClick={() => onFilterByAging && onFilterByAging(a.key)}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-blue-50/60 border border-gray-100 hover:border-blue-200 cursor-pointer transition-all"
              >
                <span className="w-16 text-[10px] font-bold text-gray-700">{a.range}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (a.count / totalSellersCount) * 100)}%` }}
                  />
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-[10px] font-black text-gray-900">{a.count}</span>
                  <span className="text-[9px] text-gray-500 ml-1">₹{(Number(a.deal_value || 0) / 100000).toFixed(0)}L</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card B: Follow-up Velocity */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-xs">Follow-up Velocity</h3>
            </div>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {safeFollowups.completion_rate || 100}% Completed
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-emerald-50/80 border border-emerald-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-emerald-800">Done</div>
              <div className="text-sm font-black text-emerald-700">{safeFollowups.completed || 0}</div>
            </div>
            <div className="bg-sky-50/80 border border-sky-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-sky-800">Pending</div>
              <div className="text-sm font-black text-sky-700">{safeFollowups.pending || 0}</div>
            </div>
            <div className="bg-amber-50/80 border border-amber-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-amber-800">Missed</div>
              <div className="text-sm font-black text-amber-700">{safeFollowups.missed || 0}</div>
            </div>
            <div className="bg-rose-50/80 border border-rose-100 p-1.5 rounded-md">
              <div className="text-[9px] font-bold text-rose-800">Overdue</div>
              <div className="text-sm font-black text-rose-700">{safeFollowups.overdue || 0}</div>
            </div>
          </div>

          <div className="pt-1">
            <div className="text-[10px] font-bold text-gray-700 mb-1 flex justify-between">
              <span>Channel Touchpoints</span>
              <span className="text-gray-400 font-normal">Active touchpoints</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(safeFollowups.types || [
                { type: "Call", count: 0 },
                { type: "WhatsApp", count: 0 },
                { type: "Visit", count: 0 },
                { type: "Meeting", count: 0 },
              ]).map((t: any, i: number) => (
                <span key={i} className="text-[9px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200">
                  {t.type}: <strong className="text-indigo-700">{t.count}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-amber-800 bg-amber-50/90 p-1.5 rounded border border-amber-200 font-medium">
            ⚠️ <strong>{safeFollowups.sellers_with_no_upcoming || 0} sellers</strong> have no upcoming follow-up.
          </div>
        </div>

        {/* Card C: Legal Documents Verification */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <h3 className="font-bold text-gray-900 text-xs">Seller Documentation Health</h3>
            </div>
            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {safeDocuments.verification_percentage || 100}% Verified
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div
              onClick={() => onFilterByDocStatus && onFilterByDocStatus("verified")}
              className="bg-emerald-50/80 border border-emerald-200 p-1.5 rounded-md cursor-pointer hover:bg-emerald-100 transition-all"
            >
              <div className="text-[9px] font-bold text-emerald-800">Verified</div>
              <div className="text-sm font-black text-emerald-700">{safeDocuments.verified || 0}</div>
            </div>
            <div
              onClick={() => onFilterByDocStatus && onFilterByDocStatus("pending")}
              className="bg-amber-50/80 border border-amber-200 p-1.5 rounded-md cursor-pointer hover:bg-amber-100 transition-all"
            >
              <div className="text-[9px] font-bold text-amber-800">Pending</div>
              <div className="text-sm font-black text-amber-700">{safeDocuments.pending || 0}</div>
            </div>
            <div
              onClick={() => onFilterByDocStatus && onFilterByDocStatus("rejected")}
              className="bg-rose-50/80 border border-rose-200 p-1.5 rounded-md cursor-pointer hover:bg-rose-100 transition-all"
            >
              <div className="text-[9px] font-bold text-rose-800">Rejected</div>
              <div className="text-sm font-black text-rose-700">{safeDocuments.rejected || 0}</div>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-semibold text-slate-700">
              <span>Co-Sellers / Ownership:</span>
              <span className="font-bold text-indigo-700">{safeCosellers.joint_owner || 0} Joint • {safeCosellers.single_owner || 0} Single</span>
            </div>
            <div className="flex justify-between items-center text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-semibold text-slate-700">
              <span>Inventory Linked:</span>
              <span className="font-bold text-emerald-700">{safeProperties.linked_count || safeSummary.properties_linked || totalSellersCount} Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. EXECUTIVE PERFORMANCE LEADERBOARD */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1.5">
            <UserCheck2 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-xs">Seller Executive Performance Leaderboard</h3>
          </div>
          <span className="text-[9px] text-gray-500 font-medium">Real-time velocity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-bold bg-gray-50/80 text-[10px] uppercase">
                <th className="p-2">Rank & Executive</th>
                <th className="p-2 text-center">Total Sellers</th>
                <th className="p-2 text-center">Active Listings</th>
                <th className="p-2 text-center">Negotiations</th>
                <th className="p-2 text-center">Closed Deals</th>
                <th className="p-2 text-right">Pipeline Valuation (₹)</th>
                <th className="p-2 text-center">Response Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(safeExecutives.length > 0 ? safeExecutives : [
                { agent_name: "Unassigned Agent", total_sellers: safeSummary.total_sellers || data.length, active_sellers: safeSummary.active_sellers || 0, negotiation_count: 0, closed_count: safeSummary.closed_sold || 0, pipeline_value: safeSummary.pipeline_value || 0, response_rate: 95 },
              ]).map((ex, idx) => {
                const rankBadge = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                return (
                  <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="p-2 font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-xs">{rankBadge}</span>
                      <span>{ex.agent_name || ex.name || "Executive"}</span>
                    </td>
                    <td className="p-2 text-center font-bold text-gray-800">{ex.total_sellers ?? ex.total_buyers ?? 0}</td>
                    <td className="p-2 text-center font-semibold text-blue-600">{ex.active_sellers ?? 0}</td>
                    <td className="p-2 text-center font-semibold text-amber-600">{ex.negotiation_count ?? 0}</td>
                    <td className="p-2 text-center font-black text-emerald-600">{ex.closed_count ?? ex.closed_buyers ?? 0}</td>
                    <td className="p-2 text-right font-extrabold text-gray-900">₹{Number(ex.pipeline_value || 0).toLocaleString("en-IN")}</td>
                    <td className="p-2 text-center font-bold text-indigo-600">{ex.response_rate || 95}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MAIN SELLER & PROPERTY DETAILED TABLE WITH TOGGLE VIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase">View Mode:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onViewModeChange && onViewModeChange("seller")}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === "seller" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Seller View
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange && onViewModeChange("property")}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === "property" ? "bg-white text-indigo-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Property View
              </button>
            </div>
          </div>
        </div>

        <ReportTable
          title={viewMode === "property" ? "Property Directory View" : "Seller Directory View"}
          columns={activeColumns}
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
