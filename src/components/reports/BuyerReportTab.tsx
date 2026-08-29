import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import Button from "@/components/ui/Button";
import {
  Users,
  UserCheck,
  Building,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
  Search,
  Filter,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Phone,
  Mail,
  Home,
  SlidersHorizontal,
  Bookmark,
  Eye,
  CreditCard,
  Percent,
  Download,
  Printer,
  Copy,
  Check,
  X,
  MessageSquare,
  RotateCcw,
} from "lucide-react";

interface BuyerReportTabProps {
  data: any[];
  stats?: any;
  funnel?: any[];
  demands?: any;
  locations?: any[];
  budgets?: any;
  matching?: any;
  visits?: any;
  executives?: any[];
  followups?: any;
  financials?: any;
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  loading?: boolean;
  filters?: any;
  onResetFilters?: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  activeStatusPill?: string;
  onSelectStatusPill?: (key: string) => void;
  onFilterByStage?: (stage: string) => void;
  onFilterByLocation?: (location: string) => void;
  onFilterByBudget?: (min: number, max: number) => void;
  onFilterByExecutive?: (executiveId: string) => void;
  onFilterByPropertyType?: (type: string) => void;
  onFilterByUnitType?: (unitType: string) => void;
}

export const BuyerReportTab: React.FC<BuyerReportTabProps> = ({
  data = [],
  stats = {},
  funnel = [],
  demands = {},
  locations = [],
  budgets = {},
  matching = {},
  visits = {},
  executives = [],
  followups = {},
  financials = {},
  pagination,
  loading = false,
  filters = {},
  onResetFilters,
  onPageChange,
  onLimitChange,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
  activeStatusPill = "all",
  onSelectStatusPill,
  onFilterByStage,
  onFilterByLocation,
  onFilterByBudget,
  onFilterByExecutive,
  onFilterByPropertyType,
  onFilterByUnitType,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "name",
    "phone",
    "location",
    "budget",
    "requirements",
    "buyer_lead_stage",
    "buyer_lead_status",
    "assigned_agent_name",
    "visit_count",
    "created_at",
  ]);

  const [showColumnCustomize, setShowColumnCustomize] = useState<boolean>(false);

  const safeStats = stats || {};
  const safeFunnel = Array.isArray(funnel) ? funnel : [];
  const safeDemands = demands || {};
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeBudgets = budgets || {};
  const safeMatching = matching || {};
  const safeVisits = visits || {};
  const safeExecutives = Array.isArray(executives) ? executives : [];
  const safeFollowups = followups || {};
  const safeFinancials = financials || {};

const ContactCell: React.FC<{ row: any }> = ({ row }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const phone = row.phone || "";
  const whatsapp = row.whatsapp_number || row.phone || "";
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
        title="View contact details"
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
                  {row.salutation ? `${row.salutation} ` : ""}{row.name || "Contact Details"}
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

  const statusPills: StatusPill[] = [
    { label: "All Buyers", key: "all", count: safeStats.total_count || data.length },
    { label: "Active Buyers", key: "active", count: safeStats.active_count || 0 },
    { label: "Qualified", key: "qualified", count: safeStats.qualified_count || 0 },
    { label: "Site Visit", key: "visit", count: safeStats.visit_count || 0 },
    { label: "Negotiation", key: "negotiation", count: safeStats.negotiation_count || 0 },
    { label: "Closed / Won", key: "converted", count: safeStats.converted_count || 0 },
    { label: "Lost", key: "lost", count: safeStats.lost_count || 0 },
  ];

  // All Column Definitions
  const allColumns: ColumnDef[] = [
    {
      key: "name",
      header: "BUYER NAME",
      width: "200px",
      searchPlaceholder: "Search name...",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs whitespace-normal break-words leading-snug">
            {row.salutation ? `${row.salutation} ` : ""}{row.name || "N/A"}
          </div>
          <div className="text-[11px] font-mono text-indigo-600 font-semibold mt-0.5">
            #BUY-{row.id}
          </div>
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
      header: "PREFERRED LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <span>{row.location || row.city || row.state || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "budget",
      header: "BUDGET RANGE (₹)",
      render: (row) => {
        const min = Number(row.budget_min || 0);
        const max = Number(row.budget_max || 0);
        return (
          <span className="font-medium text-emerald-700 text-xs block">
            {min > 0 || max > 0
              ? `₹${min > 0 ? (min >= 10000000 ? `${(min / 10000000).toFixed(2)}Cr` : `${(min / 100000).toFixed(0)}L`) : "0"} - ₹${max > 0 ? (max >= 10000000 ? `${(max / 10000000).toFixed(2)}Cr` : `${(max / 100000).toFixed(0)}L`) : "Flexible"}`
              : "Not Specified"}
          </span>
        );
      },
    },
    {
      key: "requirements",
      header: "PROPERTY & BHK",
      render: (row) => {
        const req = row.requirements || {};
        const pt = req.propertyType || req.property_type || "Any Type";
        const ut = Array.isArray(req.unitTypes) ? req.unitTypes.join(", ") : req.unitType || "Any BHK";
        return (
          <div>
            <div className="font-semibold text-slate-800 text-xs">{pt}</div>
            <div className="text-[10px] text-indigo-600 font-medium">{ut}</div>
          </div>
        );
      },
    },
    {
      key: "buyer_lead_stage",
      header: "STAGE",
      searchPlaceholder: "Search stage...",
      render: (row) => {
        const st = row.buyer_lead_stage || "New";
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            {st}
          </span>
        );
      },
    },
    {
      key: "buyer_lead_status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.buyer_lead_status || "Active").toLowerCase();
        const color = s.includes("closed") || s.includes("converted") || s.includes("won")
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : s.includes("qualif")
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : s.includes("lost") || s.includes("reject")
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-blue-50 text-blue-700 border-blue-200";
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${color}`}>
            {row.buyer_lead_status || "Active"}
          </span>
        );
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED EXECUTIVE",
      render: (row) => (
        <span className="font-normal text-slate-700 text-xs">{row.assigned_agent_name || "Unassigned"}</span>
      ),
    },
    {
      key: "visit_count",
      header: "SITE VISITS",
      render: (row) => (
        <span className="font-semibold text-xs text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          {row.visit_count || 0} visits
        </span>
      ),
    },
  ];

  const normalizedFunnel = React.useMemo(() => {
    if (!Array.isArray(safeFunnel) || safeFunnel.length === 0) {
      return [
        { stage: "New", count: 0, percentage: 0 },
        { stage: "Initial Contact", count: 0, percentage: 0 },
        { stage: "Contacted", count: 0, percentage: 0 },
        { stage: "Qualified", count: 0, percentage: 0 },
        { stage: "Property Hunting", count: 0, percentage: 0 },
        { stage: "Negotiation", count: 0, percentage: 0 },
        { stage: "Deal Closure", count: 0, percentage: 0 },
      ];
    }

    const stageMap: Record<string, number> = {};
    let totalCount = 0;

    safeFunnel.forEach((item: any) => {
      let raw = (item.stage || item.label || "New").trim();
      let clean = raw.replace(/_/g, " ");
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      
      const lower = clean.toLowerCase();
      if (lower === "initial contact" || lower === "initialcontact") {
        clean = "Initial Contact";
      } else if (lower === "contacted" || lower === "connected") {
        clean = "Contacted";
      } else if (lower === "qualified" || lower === "qualif") {
        clean = "Qualified";
      } else if (lower === "property hunting" || lower === "propertyhunting" || lower === "property shortlisted" || lower === "shortlisted") {
        clean = "Property Hunting";
      } else if (lower === "negotiation" || lower === "in negotiation" || lower === "proposal") {
        clean = "Negotiation";
      } else if (lower === "closed" || lower === "won" || lower === "closed/won" || lower === "converted" || lower === "deal closure" || lower === "deal closed") {
        clean = "Deal Closure";
      } else if (lower === "lost" || lower === "rejected") {
        clean = "Lost";
      }

      const count = Number(item.count || 0);
      stageMap[clean] = (stageMap[clean] || 0) + count;
      totalCount += count;
    });

    return Object.entries(stageMap).map(([stage, count]) => ({
      stage,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    }));
  }, [safeFunnel]);

  const isAnyFilterActive =
    (activeStatusPill && !["all", "total"].includes(activeStatusPill.toLowerCase())) ||
    Boolean(filters && Object.keys(filters).some((k) => filters[k] && filters[k] !== "all" && filters[k] !== "alltime"));

  const handleClearAllFilters = () => {
    if (onSelectStatusPill) onSelectStatusPill("all");
    if (onFilterByStage) onFilterByStage("all");
    if (onFilterByLocation) onFilterByLocation("");
    if (onFilterByExecutive) onFilterByExecutive("");
  };

  const filteredColumns = allColumns.filter((col) => visibleColumns.includes(col.key));

  return (
    <div className="space-y-3.5">
      {/* ==================== BUYER LIFECYCLE FUNNEL ==================== */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Buyer Sales Lifecycle Funnel</h3>
          </div>

          {/* Filter, Export, Print Buttons in Right Corner of Funnel Header */}
          <div className="flex items-center gap-2">
            {isAnyFilterActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAllFilters}
                className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-all animate-in fade-in duration-150"
                title="Click to unfilter and view all buyers"
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
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {normalizedFunnel.map((item, idx) => {
            const isCardActive = activeStatusPill.toLowerCase().replace(/_/g, ' ') === item.stage.toLowerCase().replace(/_/g, ' ');

            const handleCardClick = () => {
              if (isCardActive) {
                handleClearAllFilters();
              } else {
                if (onFilterByStage) onFilterByStage(item.stage);
                if (onSelectStatusPill) onSelectStatusPill(item.stage);
              }
            };

            return (
              <div
                key={item.stage}
                onClick={handleCardClick}
                className={`rounded-lg p-2.5 flex flex-col justify-between transition-all cursor-pointer min-w-0 border group ${
                  isCardActive
                    ? "bg-indigo-50/90 border-indigo-500 ring-1 ring-indigo-500 shadow-xs"
                    : "bg-slate-50 hover:bg-indigo-50/80 border-slate-200 hover:border-indigo-300 shadow-2xs"
                }`}
              >
                <div className="text-[10px] font-bold text-gray-600 group-hover:text-indigo-900 truncate flex items-center justify-between">
                  <span>{item.stage}</span>
                  {isCardActive && <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-100 px-1 rounded">ACTIVE</span>}
                </div>
                <div className="text-lg font-black text-gray-900 group-hover:text-indigo-950 mt-0.5">
                  {item.count}
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>Share</span>
                  <span className="font-bold text-indigo-600">{item.percentage}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, item.percentage)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== 3. REQUIREMENT DEMAND & BUDGET ANALYSIS ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Property & BHK Type Demand */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-blue-600" />
              Property Type & BHK Demand
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-[11px] text-gray-500 uppercase">Top Requested Property Types</div>
            <div className="space-y-1.5">
              {(safeDemands.propertyTypes || []).slice(0, 4).map((pt: any, idx: number) => {
                const isPtActive = filters?.property_type === pt.name;
                return (
                  <div
                    key={idx}
                    onClick={() => (isPtActive ? handleClearAllFilters() : onFilterByPropertyType && onFilterByPropertyType(pt.name))}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors border ${
                      isPtActive
                        ? "bg-blue-100 border-blue-400 font-bold"
                        : "bg-slate-50 hover:bg-blue-50 border-slate-100"
                    }`}
                  >
                    <span className="font-semibold text-gray-800">{pt.name}</span>
                    <span className="font-bold text-blue-700">{pt.count} buyers ({pt.percentage}%)</span>
                  </div>
                );
              })}
              {(!safeDemands.propertyTypes || safeDemands.propertyTypes.length === 0) && (
                <div className="text-gray-400 text-[11px] italic">No property type preferences recorded</div>
              )}
            </div>

            <div className="font-bold text-[11px] text-gray-500 uppercase pt-2">BHK Unit Type Demand</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(safeDemands.unitTypes || []).slice(0, 6).map((ut: any, idx: number) => {
                const isUtActive = filters?.unit_type === ut.name;
                return (
                  <div
                    key={idx}
                    onClick={() => (isUtActive ? handleClearAllFilters() : onFilterByUnitType && onFilterByUnitType(ut.name))}
                    className={`p-1.5 rounded text-center cursor-pointer transition-colors border ${
                      isUtActive
                        ? "bg-indigo-200 border-indigo-500 font-bold ring-1 ring-indigo-500"
                        : "bg-indigo-50/60 hover:bg-indigo-100 border-indigo-100"
                    }`}
                  >
                    <div className="font-bold text-indigo-900 text-xs">{ut.name}</div>
                    <div className="text-[10px] text-indigo-600 font-medium">{ut.count} buyers</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Budget Analysis & Distribution */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              Budget Range Analysis
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Avg: ₹{Number(safeBudgets.avgBudget || 0).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-2">
            {(safeBudgets.distribution || [
              { label: "Below ₹50L", min: 0, max: 5000000, count: 0 },
              { label: "₹50L - ₹1Cr", min: 5000000, max: 10000000, count: 0 },
              { label: "₹1Cr - ₹2Cr", min: 10000000, max: 20000000, count: 0 },
              { label: "₹2Cr - ₹5Cr", min: 20000000, max: 50000000, count: 0 },
              { label: "Above ₹5Cr", min: 50000000, max: 999999999, count: 0 },
            ]).map((b: any, idx: number) => {
              const totalB = safeStats.total_count || 1;
              const pct = Math.round((b.count / totalB) * 100);
              const isBudgetActive = Number(filters?.budget_min) === b.min && Number(filters?.budget_max) === b.max;
              return (
                <div
                  key={idx}
                  onClick={() => (isBudgetActive ? handleClearAllFilters() : onFilterByBudget && onFilterByBudget(b.min, b.max))}
                  className={`p-2 rounded cursor-pointer transition-all text-xs border ${
                    isBudgetActive
                      ? "bg-emerald-100 border-emerald-500 font-bold ring-1 ring-emerald-500"
                      : "bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>{b.label}</span>
                    <span className="font-bold text-emerald-800">{b.count} buyers ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Property Matching & Site Visit Performance */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-purple-600" />
            Matching & Site Visit Performance
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-100">
              <div className="text-[10px] font-bold text-purple-700 uppercase">Buyers with Matches</div>
              <div className="text-base font-black text-purple-950 mt-0.5">{safeMatching.buyersWithMatches || 0}</div>
              <div className="text-[10px] text-purple-600">{safeMatching.avgMatchesPerBuyer || 0} avg saved props</div>
            </div>

            <div className="bg-teal-50/70 p-2.5 rounded-lg border border-teal-100">
              <div className="text-[10px] font-bold text-teal-700 uppercase">Total Site Visits</div>
              <div className="text-base font-black text-teal-950 mt-0.5">{safeVisits.totalVisits || 0}</div>
              <div className="text-[10px] text-teal-600">{safeVisits.completedVisits || 0} completed</div>
            </div>

            <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-100">
              <div className="text-[10px] font-bold text-amber-700 uppercase">Follow-ups Health</div>
              <div className="text-base font-black text-amber-950 mt-0.5">{safeFollowups.today || 0} today</div>
              <div className="text-[10px] text-rose-600 font-bold">{safeFollowups.overdue || 0} overdue</div>
            </div>

            <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Financial Readiness</div>
              <div className="text-base font-black text-emerald-950 mt-0.5">{safeFinancials.loanRequiredCount || 0} need loan</div>
              <div className="text-[10px] text-emerald-600">{safeFinancials.selfFundedCount || 0} self funded</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 4. LOCATION DEMAND & EXECUTIVE PERFORMANCE ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Location Demand Matrix */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              Location Demand & Conversion Matrix
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Click location to filter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="p-2">Location</th>
                  <th className="p-2">Buyers</th>
                  <th className="p-2">Avg Budget</th>
                  <th className="p-2">Visits</th>
                  <th className="p-2">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeLocations.slice(0, 6).map((loc: any, idx: number) => {
                  const isLocActive = filters?.location === loc.location_name;
                  return (
                    <tr
                      key={idx}
                      onClick={() => (isLocActive ? handleClearAllFilters() : onFilterByLocation && onFilterByLocation(loc.location_name))}
                      className={`cursor-pointer transition-colors ${
                        isLocActive ? "bg-orange-100 font-bold" : "hover:bg-orange-50/60"
                      }`}
                    >
                      <td className="p-2 font-bold text-slate-900">{loc.location_name}</td>
                      <td className="p-2 font-semibold text-blue-700">{loc.buyer_count}</td>
                      <td className="p-2 font-semibold text-emerald-700">₹{Number(loc.avg_budget_max || 0).toLocaleString("en-IN")}</td>
                      <td className="p-2 font-medium text-purple-700">{loc.site_visits}</td>
                      <td className="p-2 font-bold text-emerald-800">{loc.closed_deals}</td>
                    </tr>
                  );
                })}
                {safeLocations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400 italic">No location demand data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Performance */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Executive Buyer Conversion Performance
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Click executive to filter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="p-2">Executive</th>
                  <th className="p-2">Buyers</th>
                  <th className="p-2">Qualified</th>
                  <th className="p-2">Visits</th>
                  <th className="p-2">Closed</th>
                  <th className="p-2">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeExecutives.slice(0, 6).map((ex: any, idx: number) => {
                  const isExecActive = String(filters?.assigned_executive) === String(ex.executive_id);
                  return (
                    <tr
                      key={idx}
                      onClick={() => (isExecActive ? handleClearAllFilters() : onFilterByExecutive && onFilterByExecutive(String(ex.executive_id)))}
                      className={`cursor-pointer transition-colors ${
                        isExecActive ? "bg-indigo-100 font-bold" : "hover:bg-indigo-50/60"
                      }`}
                    >
                      <td className="p-2 font-bold text-slate-900">{ex.name}</td>
                      <td className="p-2 font-semibold text-slate-700">{ex.total_buyers}</td>
                      <td className="p-2 font-medium text-purple-700">{ex.qualified_buyers}</td>
                      <td className="p-2 font-medium text-teal-700">{ex.site_visits}</td>
                      <td className="p-2 font-bold text-emerald-700">{ex.closed_buyers}</td>
                      <td className="p-2 font-bold text-orange-600">{ex.conversion_rate}%</td>
                    </tr>
                  );
                })}
                {safeExecutives.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400 italic">No executive performance data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== 5. DETAILED BUYER MASTER TABLE ==================== */}
      <ReportTable
        title="Buyers Master Table"
        columns={filteredColumns}
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
  );
};
