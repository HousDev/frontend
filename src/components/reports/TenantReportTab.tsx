// frontend/src/components/reports/TenantReportTab.tsx
import React, { useState } from "react";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import Button from "@/components/ui/Button";
import {
  Users,
  Filter,
  Download,
  Printer,
  MapPin,
  IndianRupee,
  Home,
  Check,
  Copy,
  Phone,
  Mail,
  X,
  Eye,
  Award,
  Sparkles,
  TrendingUp,
  Building,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface TenantReportTabProps {
  data: any[];
  stats?: any;
  summary?: any;
  budgets?: any;
  locations?: any[];
  bhk?: any[];
  tenantTypes?: any[];
  executives?: any[];
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  activeStatusPill?: string;
  onSelectStatusPill?: (key: string) => void;
  onFilterByStatus?: (status: string) => void;
  onFilterByLocation?: (loc: string) => void;
  onFilterByBhk?: (bhk: string) => void;
}

const ContactCell: React.FC<{ row: any }> = ({ row }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contactName = row.name || "Tenant";
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
        title="View tenant contact details"
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
                  Tenant: {contactName}
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

export const TenantReportTab: React.FC<TenantReportTabProps> = ({
  data = [],
  stats = {},
  summary = {},
  budgets = {},
  locations = [],
  bhk = [],
  tenantTypes = [],
  executives = [],
  pagination,
  loading = false,
  onPageChange,
  onLimitChange,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
  activeStatusPill = "all",
  onSelectStatusPill,
  onFilterByStatus,
  onFilterByLocation,
  onFilterByBhk,
}) => {
  const safeStats = stats || summary || {};
  const safeBudgets = budgets || {};
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeBhk = Array.isArray(bhk) ? bhk : [];
  const safeExecutives = Array.isArray(executives) ? executives : [];

  const statusPills: StatusPill[] = [
    { label: "All Tenants", key: "all", count: safeStats.total_tenants || safeStats.total_count || data.length },
    { label: "Active Search", key: "active", count: safeStats.active_search || safeStats.active_count || 0 },
    { label: "Visit Scheduled", key: "visit_scheduled", count: safeStats.visit_scheduled || 0 },
    { label: "Agreement Signed", key: "agreement_signed", count: safeStats.agreement_signed || 0 },
    { label: "Property Linked", key: "linked", count: safeStats.linked_count || 0 },
  ];

  const columns: ColumnDef[] = [
    {
      key: "name",
      header: "TENANT NAME",
      searchPlaceholder: "Search tenant...",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{row.name || "N/A"}</div>
          <div className="text-[10px] text-teal-700 font-medium flex items-center gap-1.5 mt-0.5">
            <span>{row.tenant_type || "Family"}</span>
            <span className="font-mono text-indigo-600 font-semibold">#{row.tenant_id || `TEN-${row.id}`}</span>
          </div>
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
      key: "preferred_location",
      header: "PREFERRED LOCATION",
      searchPlaceholder: "Search location...",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-slate-700">
          <span>{row.preferred_location || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "budget_max",
      header: "RENT BUDGET RANGE",
      searchPlaceholder: "Search budget...",
      render: (row) => {
        const minVal = Number(row.budget_min || 0);
        const maxVal = Number(row.budget_max || 0);
        if (maxVal === 0) return <span className="text-gray-400 text-xs">N/A</span>;
        return (
          <span className="font-semibold text-emerald-700 text-xs">
            ₹{minVal.toLocaleString("en-IN")} - ₹{maxVal.toLocaleString("en-IN")}/mo
          </span>
        );
      },
    },
    {
      key: "preferred_bhk",
      header: "BHK REQUIREMENT",
      render: (row) => <span className="font-semibold text-slate-800 text-xs">{row.preferred_bhk || "Any BHK"}</span>,
    },
    {
      key: "linked_property_name",
      header: "LINKED RENTAL PROPERTY",
      render: (row) => {
        if (!row.rental_property_id) return <span className="text-gray-400 text-xs italic">Unlinked</span>;
        return (
          <div>
            <div className="font-bold text-indigo-900 text-xs">{row.linked_property_name || `Property #${row.rental_property_id}`}</div>
            <div className="text-[10px] text-teal-700 font-mono">#RPROP-{row.rental_property_id}</div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "active search").toLowerCase();
        const color = s.includes("agreement") || s.includes("closed") || s.includes("occupied") || s.includes("moved")
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : s.includes("visit") || s.includes("shortlisted")
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-teal-50 text-teal-700 border-teal-200";
        return (
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${color}`}>
            {row.status || "Active Search"}
          </span>
        );
      },
    },
    {
      key: "assigned_agent_name",
      header: "ASSIGNED EXECUTIVE",
      searchPlaceholder: "Search executive...",
      render: (row) => <span className="font-normal text-slate-700 text-xs">{row.assigned_agent_name || "Unassigned"}</span>,
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* 1. LOCATION DEMAND & BHK REQUIREMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Preferred Location Demand */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              Tenant Preferred Location Demand
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Click location to filter</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <th className="p-2">Preferred Location</th>
                  <th className="p-2 text-center">Tenants</th>
                  <th className="p-2 text-center">Linked Property</th>
                  <th className="p-2 text-center">Avg Rent Budget</th>
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
                    <td className="p-2 text-center font-bold text-slate-900">{loc.count}</td>
                    <td className="p-2 text-center font-semibold text-teal-700">{loc.linked_count}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">₹{Number(loc.avg_budget || 0).toLocaleString("en-IN")}/mo</td>
                  </tr>
                ))}
                {safeLocations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400 italic">No location demand data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BHK Requirement Breakdown */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-indigo-600" />
              Tenant BHK Requirement Distribution
            </h3>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2">
              {activeStatusPill && !["all", "total"].includes(activeStatusPill.toLowerCase()) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectStatusPill && onSelectStatusPill("all")}
                  className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-all animate-in fade-in duration-150"
                  title="Click to unfilter and view all tenants"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  Unfilter
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={onOpenFilters}
                className="flex items-center gap-1.5 text-xs text-white bg-[#0f2b3d] hover:bg-[#1a435d] font-bold px-3 py-1.5 rounded-lg shadow-xs border-0"
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

          <div className="grid grid-cols-2 gap-2">
            {safeBhk.slice(0, 6).map((b: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onFilterByBhk && onFilterByBhk(b.bhk)}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg cursor-pointer transition-all text-xs"
              >
                <div className="font-bold text-slate-900">{b.bhk}</div>
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="text-slate-600">{b.count} Tenants</span>
                  <span className="text-teal-700 font-semibold">{b.linked_count} Linked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BUDGET TIERS & EXECUTIVE LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rent Budget Tiers */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            Target Rent Budget Distribution
          </h3>

          <div className="space-y-2">
            {(safeBudgets.buckets || [
              { label: "Below ₹15K", count: 0 },
              { label: "₹15K - ₹25K", count: 0 },
              { label: "₹25K - ₹40K", count: 0 },
              { label: "₹40K - ₹60K", count: 0 },
              { label: "Above ₹60K", count: 0 },
            ]).map((b: any, idx: number) => {
              const totalT = safeStats.total_tenants || 1;
              const pct = Math.round((b.count / totalT) * 100);
              return (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>{b.label}</span>
                    <span className="font-bold text-emerald-800">{b.count} tenants ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Executive Conversion Leaderboard */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase text-gray-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-600" />
            Executive Tenant Conversion Leaderboard
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 uppercase text-[10px]">
                  <th className="p-2">Executive</th>
                  <th className="p-2 text-center">Tenants</th>
                  <th className="p-2 text-center">Active</th>
                  <th className="p-2 text-center">Linked</th>
                  <th className="p-2 text-center">Moved In</th>
                  <th className="p-2 text-center">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeExecutives.slice(0, 6).map((ex: any, idx: number) => (
                  <tr key={idx} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-2 font-bold text-slate-900">{ex.agent_name}</td>
                    <td className="p-2 text-center font-semibold text-indigo-700">{ex.total_tenants}</td>
                    <td className="p-2 text-center font-semibold text-teal-700">{ex.active_tenants}</td>
                    <td className="p-2 text-center font-semibold text-blue-700">{ex.linked_count}</td>
                    <td className="p-2 text-center font-bold text-purple-900">{ex.moved_in_count}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">{ex.conversion_rate}%</td>
                  </tr>
                ))}
                {safeExecutives.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400 italic">No executive performance data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. MAIN DETAILED TENANT DIRECTORY TABLE */}
      <div className="space-y-3">
        <ReportTable
          title="Detailed Tenant Directory"
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
