// frontend/src/components/reports/LoggedInReportTab.tsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ReportTable, ColumnDef, StatusPill } from "./ReportTable";
import { Shield, ShieldCheck, Users, Clock, MapPin, Monitor, Smartphone, Eye, Mail, X } from "lucide-react";
import { reportAPI } from "@/lib/reportAPI";

interface LoggedInReportTabProps {
  data?: any[];
  stats?: {
    total_logins: number;
    tenant_logins: number;
    admin_logins: number;
    active_sessions: number;
  } | null;
  filters?: any;
  loading?: boolean;
  onOpenFilters: () => void;
  onExport: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
}

const ViewEmailCell: React.FC<{ email: string }> = ({ email }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!email || email === "N/A") {
    return <span className="text-slate-400 text-[11px]">N/A</span>;
  }

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title="View email address"
        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shrink-0 shadow-2xs flex items-center justify-center cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5 text-indigo-600" />
      </button>

      {isOpen &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 max-w-sm w-full space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-semibold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-600" /> User Email Address
                </h4>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-900 font-semibold select-all break-all">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(email);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const ViewSessionIdCell: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!sessionId || sessionId === "N/A") {
    return <span className="text-slate-400 text-[11px]">N/A</span>;
  }

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title="View session ID"
        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shrink-0 shadow-2xs flex items-center justify-center cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5 text-indigo-600" />
      </button>

      {isOpen &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 max-w-sm w-full space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-semibold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" /> Session ID
                </h4>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-900 font-semibold select-all break-all">{sessionId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sessionId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export const LoggedInReportTab: React.FC<LoggedInReportTabProps> = ({
  data: initialData,
  stats: initialStats,
  filters,
  loading: externalLoading = false,
  onOpenFilters,
  onExport,
  onRefresh,
  onPrint,
}) => {
  const [logs, setLogs] = useState<any[]>(initialData || []);
  const [stats, setStats] = useState<{
    total_logins: number;
    tenant_logins: number;
    admin_logins: number;
    active_sessions: number;
  }>(
    initialStats || {
      total_logins: 0,
      tenant_logins: 0,
      admin_logins: 0,
      active_sessions: 0,
    }
  );

  const [loading, setLoading] = useState<boolean>(externalLoading);
  const [activeStatusPill, setActiveStatusPill] = useState<string>("all");

  const fetchLoginLogs = async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getLoginLogs({
        ...filters,
        role: activeStatusPill,
      });
      if (res?.success) {
        setLogs(res.logs || res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching login audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setLogs(initialData);
    }
    if (initialStats) {
      setStats(initialStats);
    }
  }, [initialData, initialStats]);

  useEffect(() => {
    fetchLoginLogs();
  }, [activeStatusPill, filters]);

  const statusPills: StatusPill[] = [
    { label: "Total Sessions", key: "all", count: stats.total_logins || logs.length },
    { label: "Active Sessions", key: "active", count: stats.active_sessions || 0 },
    { label: "Admin & Staff", key: "admin", count: stats.admin_logins || 0 },
    { label: "Client & Buyer", key: "buyer", count: stats.tenant_logins || 0 },
  ];

  const formatDuration = (seconds: number | null, isLogout: boolean) => {
    if (!seconds || seconds <= 0) {
      return isLogout ? "0m 10s" : "Active";
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rMins = mins % 60;
      return `${hrs}h ${rMins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const columns: ColumnDef[] = [
    {
      key: "session_id",
      header: "SESSION ID",
      width: "85px",
      searchPlaceholder: "Session ID..",
      render: (row) => <ViewSessionIdCell sessionId={row.session_id || `sess_${row.id}`} />,
    },
    {
      key: "name",
      header: "USER NAME",
      width: "160px",
      searchPlaceholder: "Search name..",
      render: (row) => (
        <span className="font-semibold text-slate-900 text-xs whitespace-nowrap">
          {row.name || row.username || "System User"}
        </span>
      ),
    },
    {
      key: "email",
      header: "EMAIL ADDRESS",
      searchPlaceholder: "Search email..",
      render: (row) => <ViewEmailCell email={row.email} />,
    },
    {
      key: "role",
      header: "ROLE",
      searchPlaceholder: "Role..",
      render: (row) => {
        const r = (row.role || "Agent").toLowerCase();
        let bg = "bg-blue-50 text-blue-800 border-blue-200";
        if (r.includes("admin") || r.includes("super")) bg = "bg-purple-50 text-purple-800 border-purple-200";
        else if (r.includes("manager")) bg = "bg-indigo-50 text-indigo-800 border-indigo-200";
        else if (r.includes("buyer") || r.includes("tenant") || r.includes("client")) bg = "bg-emerald-50 text-emerald-800 border-emerald-200";
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${bg} whitespace-nowrap`}>
            {row.role || "Executive"}
          </span>
        );
      },
    },
    {
      key: "total_user_logins",
      header: "DAILY / TOTAL LOGINS",
      render: (row) => {
        const dayCount = row.day_logins_count || 1;
        const totalCount = row.total_user_logins || dayCount;
        return (
          <div className="flex flex-col text-[10px] whitespace-nowrap">
            <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full inline-block text-center" title={`Logins on selected date: ${dayCount}`}>
              {dayCount} {dayCount === 1 ? "login" : "logins"} today
            </span>
            <span className="text-[9.5px] text-slate-500 font-medium mt-0.5 text-center">
              ({totalCount} total)
            </span>
          </div>
        );
      },
    },
    {
      key: "ip_address",
      header: "IP ADDRESS",
      searchPlaceholder: "IP Address..",
      render: (row) => {
        let ip = row.ip_address || "127.0.0.1";
        if (ip === "::1") ip = "127.0.0.1 (IPv6 ::1)";
        else if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
        return (
          <span className="font-mono text-[11px] font-semibold text-slate-700 whitespace-nowrap" title={row.ip_address}>
            {ip}
          </span>
        );
      },
    },
    {
      key: "login_time",
      header: "LOGIN TIME",
      render: (row) => {
        const d = row.login_time ? new Date(row.login_time) : null;
        return d ? (
          <span className="text-[11px] font-semibold text-slate-800 whitespace-nowrap">
            {d.toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        ) : (
          "N/A"
        );
      },
    },
    {
      key: "last_activity",
      header: "LAST ACTIVITY",
      render: (row) => {
        const d = row.last_activity || row.login_time ? new Date(row.last_activity || row.login_time) : null;
        return d ? (
          <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap">
            {d.toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        ) : (
          "N/A"
        );
      },
    },
    {
      key: "logout_time",
      header: "LOGOUT TIME",
      render: (row) => {
        if (!row.logout_time) {
          return (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-300 whitespace-nowrap">
              Active
            </span>
          );
        }
        const d = new Date(row.logout_time);
        return (
          <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
            {d.toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        );
      },
    },
    {
      key: "session_duration",
      header: "SESSION DURATION",
      render: (row) => {
        const isLogout = Boolean(row.logout_time);
        const durStr = formatDuration(row.session_duration, isLogout);
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${durStr === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 text-slate-700 border border-slate-300"}`}>
            {durStr}
          </span>
        );
      },
    },
    {
      key: "device_id",
      header: "DEVICE NAME & ID",
      searchPlaceholder: "Device ID..",
      render: (row) => {
        const isMobile = (row.source || "").toLowerCase().includes("android") || (row.source || "").toLowerCase().includes("ios") || (row.source || "").toLowerCase().includes("iphone");
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {isMobile ? <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> : <Monitor className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            <div>
              <div className="font-semibold text-slate-900 text-[11px]">{isMobile ? "Mobile Device" : "Windows PC"}</div>
              <div className="font-mono text-[9.5px] text-slate-400 truncate max-w-[110px]">{row.device_id || "dev_browser"}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "source",
      header: "SOURCE / BROWSER",
      searchPlaceholder: "Source..",
      render: (row) => <span className="font-semibold text-slate-800 text-[11px] whitespace-nowrap">{row.source || "Chrome on Windows"}</span>,
    },
    {
      key: "latitude",
      header: "LATITUDE",
      render: (row) => <span className="font-mono text-[11px] font-medium text-slate-600">{row.latitude ? Number(row.latitude).toFixed(6) : "—"}</span>,
    },
    {
      key: "longitude",
      header: "LONGITUDE",
      render: (row) => <span className="font-mono text-[11px] font-medium text-slate-600">{row.longitude ? Number(row.longitude).toFixed(6) : "—"}</span>,
    },
    {
      key: "address",
      header: "LOCATION / ADDRESS",
      searchPlaceholder: "Location..",
      render: (row) => <span className="font-medium text-slate-800 text-[11px] truncate max-w-xs block" title={row.address}>{row.address || "Location Captured"}</span>,
    },
    {
      key: "map",
      header: "MAP LINK",
      render: (row) => {
        if (!row.latitude || !row.longitude) return <span className="text-slate-400 text-[11px]">—</span>;
        const lat = Number(row.latitude).toFixed(4);
        const lng = Number(row.longitude).toFixed(4);
        return (
          <a
            href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10.5px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition-colors whitespace-nowrap"
          >
            <MapPin className="w-3 h-3 text-rose-500" /> View on Map ({lat}, {lng})
          </a>
        );
      },
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* High-density Logged-In Report Table */}
      <ReportTable
        title="Logged-In Session Audit Logs"
        columns={columns}
        data={logs}
        statusPills={statusPills}
        activeStatusPill={activeStatusPill}
        onSelectStatusPill={(key) => setActiveStatusPill(key)}
        onOpenFilters={onOpenFilters}
        onExport={onExport}
        onRefresh={() => {
          fetchLoginLogs();
          if (onRefresh) onRefresh();
        }}
        onPrint={onPrint}
        pagination={{ page: 1, limit: logs.length || 25, totalRecords: logs.length, totalPages: 1 }}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
      />
    </div>
  );
};

export default LoggedInReportTab;
