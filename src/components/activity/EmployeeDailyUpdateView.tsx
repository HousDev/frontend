import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Target,
  Clock,
  Coffee,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Timer,
  User,
  Building2,
  Award,
} from "lucide-react";
import { workSessionAPI } from "@/lib/api";

// ── ESALE console tokens (shared with ActivityTrackerModal) ──
const BEZEL = "#0a1220";
const BEZEL_SOFT = "#0f1c30";
const BEZEL_LINE = "rgba(255,255,255,0.08)";
const MODULE = "#ffffff";
const MODULE_LINE = "#dde2ea";
const ACCENT = "#ff7a1a";
const ACTIVE = "#16a34a";
const IDLE = "#8b5cf6";
const BREAKC = "#0ea5e9";
const WARN = "#eab308";
const DANGER = "#ef4444";
const TEXT = "#101828";
const MUTED = "#667085";

const MONO =
  "'IBM Plex Mono','SF Mono',ui-monospace,Menlo,Consolas,monospace";

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

interface DailyUpdateRow {
  date: string;
  target_seconds: number;
  target: string;
  worked: string;
  worked_seconds: number;
  break_time: string;
  break_seconds: number;
  productive: string;
  productive_seconds: number;
  status: "ACHIEVED" | "IN_PROGRESS" | "BEHIND" | "PENDING";
}

interface Props {
  employeeId?: number;
}

export const EmployeeDailyUpdateView: React.FC<Props> = ({ employeeId }) => {
  const [updates, setUpdates] = useState<DailyUpdateRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  const applyRange = useCallback((nextFrom?: string, nextTo?: string) => {
    const start = nextFrom || nextTo || today;
    const end = nextTo || nextFrom || today;
    setFromDate(start);
    setToDate(end);
  }, [today]);

  const fetchDailyUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const rangeStart = fromDate || today;
      const rangeEnd = toDate || today;
      const res = await workSessionAPI.getEmployeeDailyUpdates(employeeId, undefined, rangeStart, rangeEnd);
      if (res?.success && Array.isArray(res.updates)) {
        setUpdates(res.updates);
      }
    } catch (err) {
      console.error("Failed to fetch employee daily updates:", err);
    } finally {
      setLoading(false);
    }
  }, [employeeId, fromDate, toDate, today]);

  useEffect(() => {
    fetchDailyUpdates();
  }, [fetchDailyUpdates]);

  const getStatusBadge = (status: string) => {
    const cfg = {
      ACHIEVED: { color: ACTIVE, bg: hexToRgba(ACTIVE, 0.1), label: "ACHIEVED", Icon: CheckCircle2 },
      IN_PROGRESS: { color: BREAKC, bg: hexToRgba(BREAKC, 0.1), label: "IN PROGRESS", Icon: TrendingUp },
      BEHIND: { color: DANGER, bg: hexToRgba(DANGER, 0.1), label: "BEHIND", Icon: AlertCircle },
      PENDING: { color: MUTED, bg: hexToRgba(MUTED, 0.1), label: "PENDING", Icon: Clock },
    }[status] || { color: MUTED, bg: hexToRgba(MUTED, 0.1), label: "PENDING", Icon: Clock };

    const { Icon } = cfg;
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[9.5px] font-bold px-2 py-0.5 rounded"
        style={{ color: cfg.color, background: cfg.bg }}
      >
        <Icon size={10} />
        {cfg.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const effectiveRangeLabel = fromDate && toDate && fromDate !== toDate
    ? `${formatDate(fromDate)} – ${formatDate(toDate)}`
    : formatDate(fromDate || toDate || today);

  const rangeIsDefault = fromDate === today && toDate === today;

  const resetRange = () => {
    setFromDate(today);
    setToDate(today);
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${MODULE_LINE}`, background: MODULE }}>
      {/* Header bar — matches Smart Breaks */}
      <div
        className="px-3.5 py-2 flex items-center gap-2"
        style={{ background: `linear-gradient(135deg, ${BEZEL} 0%, ${BEZEL_SOFT} 100%)` }}
      >
        <CalendarDays size={13} style={{ color: ACCENT }} />
        <h3 className="text-[11.5px] font-semibold text-white">Daily Performance Updates</h3>
        <div className="ml-2 flex items-center gap-1.5 text-[9px] text-white/75">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => applyRange(e.target.value, toDate)}
            className="rounded border border-white/10 bg-white/10 px-1.5 py-0.5 text-[9px] text-white outline-none"
          />
          <span>to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => applyRange(fromDate, e.target.value)}
            className="rounded border border-white/10 bg-white/10 px-1.5 py-0.5 text-[9px] text-white outline-none"
          />
          {!rangeIsDefault && (
            <button
              type="button"
              onClick={resetRange}
              className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 text-[9px] text-white/90"
            >
              Today
            </button>
          )}
        </div>
        <span className="ml-auto text-[10px] font-medium text-white/40">
          {updates.length} {updates.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="px-3 py-2 border-b" style={{ borderColor: MODULE_LINE, background: hexToRgba(BEZEL, 0.02) }}>
        <p className="text-[10px] font-medium" style={{ color: MUTED }}>
          Showing: <span className="font-semibold" style={{ color: TEXT }}>{effectiveRangeLabel}</span>
        </p>
      </div>

      {/* Body */}
      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center space-y-2">
          <RefreshCw size={18} className="animate-spin" style={{ color: ACCENT }} />
          <p className="text-[10.5px] font-medium" style={{ color: MUTED }}>
            Loading daily performance updates...
          </p>
        </div>
      ) : updates.length === 0 ? (
        <div className="py-10 text-center space-y-1.5">
          <CalendarDays size={26} className="mx-auto" style={{ color: MODULE_LINE }} />
          <p className="text-[11px] font-semibold" style={{ color: TEXT }}>
            No Daily Updates Found
          </p>
          <p className="text-[10px]" style={{ color: MUTED }}>
            Work sessions will log automatically when active.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: hexToRgba(BEZEL, 0.03) }}>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED, borderBottom: `1px solid ${MODULE_LINE}` }}>
                  <span className="flex items-center gap-1.5"><CalendarDays size={10} style={{ color: ACCENT }} /> Date</span>
                </th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED, borderBottom: `1px solid ${MODULE_LINE}` }}>
                  <span className="flex items-center gap-1.5"><Target size={10} style={{ color: IDLE }} /> Target</span>
                </th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED, borderBottom: `1px solid ${MODULE_LINE}` }}>
                  <span className="flex items-center gap-1.5"><Clock size={10} style={{ color: WARN }} /> Worked</span>
                </th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED, borderBottom: `1px solid ${MODULE_LINE}` }}>
                  <span className="flex items-center gap-1.5"><Coffee size={10} style={{ color: ACCENT }} /> Break</span>
                </th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide" style={{ color: MUTED, borderBottom: `1px solid ${MODULE_LINE}` }}>
                  <span className="flex items-center gap-1.5"><Zap size={10} style={{ color: ACTIVE }} /> Productive</span>
                </th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-center" style={{ color: MUTED, borderBottom: `1px solid ${MODULE_LINE}` }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {updates.map((row, idx) => (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-slate-50/70"
                  style={{ borderBottom: idx < updates.length - 1 ? `1px solid ${MODULE_LINE}` : "none" }}
                >
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    <span className="text-[10.5px] font-semibold" style={{ color: TEXT }}>
                      {formatDate(row.date)}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ color: IDLE, background: hexToRgba(IDLE, 0.1), fontFamily: MONO }}
                    >
                      {row.target || "08:00:00"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ color: TEXT, background: hexToRgba(TEXT, 0.06), fontFamily: MONO }}
                    >
                      {row.worked || "00:00:00"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ color: ACCENT, background: hexToRgba(ACCENT, 0.1), fontFamily: MONO }}
                    >
                      {row.break_time || "00:00:00"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle whitespace-nowrap">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ color: ACTIVE, background: hexToRgba(ACTIVE, 0.1), fontFamily: MONO }}
                    >
                      {row.productive || "00:00:00"}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle text-center whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeDailyUpdateView;
