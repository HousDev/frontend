// frontend/src/components/reports/OwnerReportTab.tsx
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

interface OwnerReportTabProps {
  data: any[];
  stats: any;
  summary?: any;
  pipeline?: any[];
  followups?: any;
  properties?: any;
  rents?: any;
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
  viewMode?: "owner" | "property";
  onViewModeChange?: (mode: "owner" | "property") => void;
  onFilterByStage?: (stage: string) => void;
  onFilterByLocation?: (loc: string) => void;
  onFilterByRent?: (min: number, max: number) => void;
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
        title="View owner contact details"
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
                  {row.salutation ? `${row.salutation} ` : ""}{row.name || "Owner Contact"}
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

export const OwnerReportTab: React.FC<OwnerReportTabProps> = ({
  data = [],
  stats = {},
  summary = {},
  pipeline = [],
  followups = {},
  properties = {},
  rents = {},
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
  viewMode = "owner",
  onViewModeChange,
  onFilterByStage,
  onFilterByLocation,
  onFilterByRent,
}) => {
  const safeStats = stats || {};
  const safeSummary = summary || {};
  const safeFollowups = followups || {};
  const safeProperties = properties || {};
  const safeRents = rents || {};
  const safeExecutives = Array.isArray(executives) ? executives : [];
  const safePipeline = Array.isArray(pipeline) ? pipeline : [];
  const safeLocations = Array.isArray(safeProperties.by_location) ? safeProperties.by_location : [];

  const statusPills: StatusPill[] = [
    { label: "All Owners", key: "all", count: safeStats.total_count || safeSummary.total_owners || data.length },
    { label: "Available Properties", key: "active", count: safeStats.available_properties || safeStats.active_count || 0 },
    { label: "Rented / Lease Active", key: "closed", count: safeStats.rented_properties || safeStats.closed_count || 0 },
  ];

  // Owner View Columns
  const ownerColumns: ColumnDef[] = [
    {
      key: "id",
      header: "OWNER ID",
      render: (row) => <span className="font-mono text-xs font-semibold text-slate-700">#OWN-{row.id}</span>,
    },
    {
      key: "name",
      header: "OWNER NAME",
      width: "240px",
      searchPlaceholder: "Search owner...",
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
          <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
          <span>{row.location || row.city || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "property_count",
      header: "RENTAL UNITS",
      render: (row) => (
        <span className="font-semibold text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
          {row.property_count || 1} units
        </span>
      ),
    },
    {
      key: "avg_monthly_rent",
      header: "EXPECTED RENT (₹/MO)",
      searchPlaceholder: "Search rent...",
      render: (row) => {
        const val = Number(row.avg_monthly_rent || row.deal_value || 0);
        return (
          <span className="font-medium text-emerald-700 text-xs block">
            {val > 0 ? `₹${val.toLocaleString("en-IN")}/mo` : "N/A"}
          </span>
        );
      },
    },
    {
      key: "owner_lead_stage",
      header: "STAGE",
      searchPlaceholder: "Search stage...",
      render: (row) => {
        const st = row.owner_lead_stage || row.stage || "New";
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
            {st}
          </span>
        );
      },
    },
    {
      key: "owner_lead_status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.owner_lead_status || row.status || "active").toLowerCase();
        const color = s.includes("rented") || s.includes("closed")
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : "bg-teal-50 text-teal-700 border-teal-200";
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${color}`}>
            {row.owner_lead_status || row.status || "Active"}
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
      render: (row) => <span className="font-mono text-xs font-semibold text-slate-700">#RPROP-{row.property_id || row.id}</span>,
    },
    {
      key: "title",
      header: "PROPERTY TITLE",
      searchPlaceholder: "Search property...",
      render: (row) => (
        <div className="font-bold text-slate-900 text-xs whitespace-normal break-words min-w-[200px]">
          {row.title || `Rental Property #${row.id}`}
        </div>
      ),
    },
    {
      key: "owner_name",
      header: "OWNER NAME",
      render: (row) => <span className="font-semibold text-teal-800 text-xs">{row.owner_name || "N/A"}</span>,
    },
    {
      key: "location",
      header: "LOCATION",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
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
          <div className="text-[10px] text-teal-600 font-medium">{row.unit_type || "Any BHK"}</div>
        </div>
      ),
    },
    {
      key: "monthly_rent",
      header: "EXPECTED RENT (₹/MO)",
      render: (row) => {
        const p = Number(row.monthly_rent || 0);
        return (
          <span className="font-medium text-emerald-700 text-xs block">
            {p > 0 ? `₹${p.toLocaleString("en-IN")}/mo` : "N/A"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "RENTAL STATUS",
      render: (row) => {
        const s = (row.status || "Available").toLowerCase();
        const color = s.includes("rented") || s.includes("leased")
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : "bg-teal-50 text-teal-700 border-teal-200";
        return <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${color}`}>{row.status || "Available"}</span>;
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED EXECUTIVE",
      render: (row) => <span className="font-normal text-slate-700 text-xs">{row.assigned_agent_name || "Unassigned"}</span>,
    },
  ];

  const activeColumns = viewMode === "property" ? propertyColumns : ownerColumns;

  return (
    <div className="space-y-3.5">
      {/* 1. OWNER RENTAL LIFECYCLE FUNNEL WITH TOP-RIGHT ACTION BUTTONS */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <div>
                <h3 className="text-xs font-bold text-slate-800">Owner Acquisition & Rental Conversion Funnel</h3>
                <p className="text-[10px] font-medium text-slate-500">Stage-by-stage landlord & rental listing conversion flow</p>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Rental Conversion: <span className="text-emerald-600 font-bold">{safeStats.conversion_rate || 0}%</span>
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

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {(safePipeline.length > 0 ? safePipeline : [
            { stage: "New", count: 0, percentage: 0 },
            { stage: "Initial Contact", count: 0, percentage: 0 },
            { stage: "Discussion", count: 0, percentage: 0 },
            { stage: "Verification", count: 0, percentage: 0 },
            { stage: "Active Listing", count: 0, percentage: 0 },
            { stage: "Rented", count: 0, percentage: 0 },
          ]).map((p, idx) => (
            <div
              key={idx}
              onClick={() => onFilterByStage && onFilterByStage(p.stage)}
              className="bg-slate-50 hover:bg-teal-50/80 border border-slate-200 hover:border-teal-300 rounded-lg p-2.5 cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="text-[10px] font-bold text-gray-600 group-hover:text-teal-900 truncate">
                {p.stage}
              </div>
              <div className="text-sm font-black text-gray-900 mt-0.5">{p.count}</div>
              <div className="flex items-center justify-between mt-1 text-[9px]">
                <span className="text-teal-600 font-bold">{p.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, p.percentage || 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. LOCATION & EXPECTED RENT ANALYSIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rental Supply by Location */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              Rental Supply by Location
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Click location to filter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="p-2">Location</th>
                  <th className="p-2 text-center">Properties</th>
                  <th className="p-2 text-center">Available</th>
                  <th className="p-2 text-center">Rented</th>
                  <th className="p-2 text-right">Avg Rent (₹/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeLocations.slice(0, 6).map((loc: any, idx: number) => (
                  <tr
                    key={idx}
                    onClick={() => onFilterByLocation && onFilterByLocation(loc.location)}
                    className="hover:bg-teal-50/60 cursor-pointer transition-colors"
                  >
                    <td className="p-2 font-bold text-slate-900">{loc.location}</td>
                    <td className="p-2 text-center font-semibold text-blue-700">{loc.count}</td>
                    <td className="p-2 text-center font-semibold text-teal-700">{loc.available}</td>
                    <td className="p-2 text-center font-bold text-purple-800">{loc.rented}</td>
                    <td className="p-2 text-right font-extrabold text-emerald-700">₹{Number(loc.avg_rent || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {safeLocations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400 italic">No rental supply data recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expected Rent Analysis */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              Expected Rent Range Distribution
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg: ₹{Number(safeRents.avg_rent || safeSummary.avg_monthly_rent || 0).toLocaleString("en-IN")}/mo
            </span>
          </div>

          <div className="space-y-2">
            {(safeRents.buckets || [
              { label: "Below ₹15K", count: 0 },
              { label: "₹15K - ₹25K", count: 0 },
              { label: "₹25K - ₹40K", count: 0 },
              { label: "₹40K - ₹60K", count: 0 },
              { label: "Above ₹60K", count: 0 },
            ]).map((b: any, idx: number) => {
              const totalP = safeProperties.linked_count || 1;
              const pct = Math.round((b.count / totalP) * 100);
              return (
                <div
                  key={idx}
                  onClick={() => onFilterByRent && onFilterByRent(b.min || 0, b.max || 999999999)}
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

      {/* 3. EXECUTIVE PERFORMANCE & FOLLOW-UP HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Executive Leaderboard */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <UserCheck2 className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-gray-900 text-xs">Owner & Rental Executive Leaderboard</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold bg-gray-50/80 text-[10px] uppercase">
                  <th className="p-2">Rank & Executive</th>
                  <th className="p-2 text-center">Total Owners</th>
                  <th className="p-2 text-center">Active</th>
                  <th className="p-2 text-center">Rented</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(safeExecutives.length > 0 ? safeExecutives : [
                  { agent_name: "Unassigned Agent", total_owners: safeSummary.total_owners || data.length, active_owners: safeSummary.active_owners || 0, rented_count: safeSummary.rented_owners || 0 },
                ]).map((ex, idx) => {
                  const rankBadge = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                  return (
                    <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                      <td className="p-2 font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-xs">{rankBadge}</span>
                        <span>{ex.agent_name || "Executive"}</span>
                      </td>
                      <td className="p-2 text-center font-bold text-gray-800">{ex.total_owners}</td>
                      <td className="p-2 text-center font-semibold text-teal-600">{ex.active_owners}</td>
                      <td className="p-2 text-center font-black text-purple-600">{ex.rented_count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Owner Follow-up Velocity */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-xs">Owner Follow-up Health</h3>
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

          <div className="text-[10px] text-teal-800 bg-teal-50/90 p-2 rounded border border-teal-200 font-medium">
            💡 <strong>Platform Rule:</strong> The CRM tracks rental listings & tenant interest. Expected rent represents landlord advertised rent, not platform revenue.
          </div>
        </div>
      </div>

      {/* 4. MAIN DETAILED TABLE WITH VIEW TOGGLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800 uppercase">View Mode:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onViewModeChange && onViewModeChange("owner")}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === "owner" ? "bg-white text-teal-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Owner View
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange && onViewModeChange("property")}
                className={`px-3 py-1 rounded-md transition-all ${viewMode === "property" ? "bg-white text-teal-900 shadow-2xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Property View
              </button>
            </div>
          </div>
        </div>

        <ReportTable
          title={viewMode === "property" ? "Rental Property Directory View" : "Owner Directory View"}
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
